"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor as TipTapEditor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useUIStore } from "@/store/useUIStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Icon } from "@/components/ui/Icon";
import { SlashMenu, ALL_COMMANDS, type SlashCommand } from "./SlashMenu";
import { SelectionToolbar } from "./SelectionToolbar";

interface HoveredBlockInfo {
  top: number;
  height: number;
  el: HTMLElement;
}

interface EditorProps {
  pageId: string;
  initialContent: string;
}

/* ─── Helpers (outside component for stability) ─── */

function findDirectChild(parent: HTMLElement, target: Node): HTMLElement | null {
  let node: Node | null = target;
  while (node && node.parentNode !== parent) node = node.parentNode;
  return node instanceof HTMLElement ? node : null;
}

function getSlashContext(
  editor: TipTapEditor
): { query: string; slashPos: number; from: number } | null {
  if (!editor.state.selection.empty) return null;
  const { from } = editor.state.selection;
  const resolved = editor.state.doc.resolve(from);
  const nodeStart = resolved.start();
  const nodeText = editor.state.doc.textBetween(nodeStart, from);
  const lastSlash = nodeText.lastIndexOf("/");
  if (lastSlash === -1) return null;
  if (lastSlash > 0 && nodeText[lastSlash - 1] !== " ") return null;
  const query = nodeText.slice(lastSlash + 1);
  if (query.includes(" ")) return null;
  return { query, slashPos: nodeStart + lastSlash, from };
}

function findDropIndex(tiptapEl: HTMLElement, clientY: number): number {
  const children = Array.from(tiptapEl.children) as HTMLElement[];
  for (let i = 0; i < children.length; i++) {
    const rect = children[i].getBoundingClientRect();
    if (clientY <= rect.top + rect.height / 2) return i;
  }
  return children.length;
}

function getIndicatorY(tiptapEl: HTMLElement, wrapperEl: HTMLElement, dropIndex: number): number {
  const children = Array.from(tiptapEl.children) as HTMLElement[];
  const wrapperTop = wrapperEl.getBoundingClientRect().top;
  if (children.length === 0) return 0;
  if (dropIndex <= 0) return children[0].getBoundingClientRect().top - wrapperTop - 3;
  if (dropIndex >= children.length) {
    return children[children.length - 1].getBoundingClientRect().bottom - wrapperTop + 3;
  }
  const above = children[dropIndex - 1].getBoundingClientRect().bottom;
  const below = children[dropIndex].getBoundingClientRect().top;
  return (above + below) / 2 - wrapperTop;
}

function moveBlock(editor: TipTapEditor, fromIndex: number, toIndex: number) {
  if (editor.isDestroyed) return;
  const json = editor.getJSON();
  if (!json.content || json.content.length <= 1) return;
  const content = [...json.content];
  const [removed] = content.splice(fromIndex, 1);
  const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex;
  if (adjustedTo === fromIndex) return;
  content.splice(adjustedTo, 0, removed);
  editor.commands.setContent({ ...json, content });
  editor.commands.focus();
}

/* ─── Component ─── */

export function Editor({ pageId, initialContent }: EditorProps) {
  const { updatePage } = useDocumentStore();
  const { setActiveBlock, setActiveEditor, setDocStats } = useUIStore();
  const { spellCheck } = useSettingsStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredBlock, setHoveredBlock] = useState<HoveredBlockInfo | null>(null);
  const prevBlockEl = useRef<HTMLElement | null>(null);

  /* ─── Drag state ─── */
  const dropIndicatorRef = useRef<HTMLDivElement>(null);

  /* ─── Selection toolbar state ─── */
  const [selectionToolbar, setSelectionToolbar] = useState({
    open: false,
    position: { x: 0, y: 0 },
  });

  /* ─── Slash menu state ─── */
  const [slashMenu, setSlashMenu] = useState({
    open: false,
    query: "",
    position: { x: 0, y: 0 },
    activeIndex: 0,
  });

  /* Refs for stale-closure escape hatches in event callbacks */
  const slashPosRef = useRef(0);
  const filteredCommandsRef = useRef<SlashCommand[]>([]);
  const slashMenuOpenRef = useRef(false);
  const slashActiveIndexRef = useRef(0);

  const filteredCommands = useMemo(() => {
    if (!slashMenu.open) return [];
    const q = slashMenu.query.toLowerCase();
    if (!q) return ALL_COMMANDS;
    return ALL_COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.keywords.some((k) => k.includes(q))
    );
  }, [slashMenu.open, slashMenu.query]);

  useEffect(() => {
    filteredCommandsRef.current = filteredCommands;
    slashMenuOpenRef.current = slashMenu.open;
    slashActiveIndexRef.current = slashMenu.activeIndex;
  }, [filteredCommands, slashMenu.open, slashMenu.activeIndex]);

  /* ─── TipTap instance ─── */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") return "Heading…";
          return "Type '/' for commands, or start writing…";
        },
        showOnlyWhenEditable: true,
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
      }),
    ],
    content: initialContent || "",
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "tiptap focus:outline-none", spellcheck: spellCheck ? "true" : "false" },
    },
    onUpdate: ({ editor }) => {
      /* Save content */
      const html = editor.getHTML();
      const isEmpty = html === "<p></p>" || html === "" || editor.isEmpty;
      updatePage(pageId, { content: isEmpty ? "" : html });

      /* Doc stats */
      const text = editor.state.doc.textContent;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      let blocks = 0;
      editor.state.doc.forEach(() => blocks++);
      setDocStats({ words, chars: text.length, blocks });

      /* Slash detection */
      const ctx = getSlashContext(editor);
      if (ctx) {
        slashPosRef.current = ctx.slashPos;
        try {
          const coords = editor.view.coordsAtPos(ctx.from);
          setSlashMenu({
            open: true,
            query: ctx.query,
            position: { x: coords.left, y: coords.bottom + 8 },
            activeIndex: 0,
          });
        } catch { /* coordsAtPos can throw for out-of-range positions */ }
      } else {
        setSlashMenu((prev) => (prev.open ? { ...prev, open: false, query: "" } : prev));
      }
    },
    onSelectionUpdate: ({ editor }) => {
      /* Active block highlight */
      const { $anchor } = editor.state.selection;
      const depth = $anchor.depth;
      const node = $anchor.node(depth > 0 ? 1 : 0);
      setActiveBlock(node?.type?.name ?? null);

      const wrapper = wrapperRef.current;
      if (wrapper) {
        const tiptapEl = wrapper.querySelector(".tiptap");
        if (tiptapEl) {
          tiptapEl.querySelectorAll(".tiptap-block-active").forEach((el) =>
            el.classList.remove("tiptap-block-active")
          );
          const domNode = editor.view.domAtPos($anchor.pos)?.node as HTMLElement | null;
          if (domNode) {
            const blockEl = findDirectChild(tiptapEl as HTMLElement, domNode);
            blockEl?.classList.add("tiptap-block-active");
          }
        }
      }

      /* Close slash menu if cursor moved out of slash context */
      const ctx = getSlashContext(editor);
      if (!ctx) {
        setSlashMenu((prev) => (prev.open ? { ...prev, open: false } : prev));
      }

      /* Selection toolbar */
      if (!editor.state.selection.empty) {
        const domSel = window.getSelection();
        if (domSel && domSel.rangeCount > 0) {
          const rect = domSel.getRangeAt(0).getBoundingClientRect();
          if (rect.width > 0) {
            setSelectionToolbar({
              open: true,
              position: { x: rect.left + rect.width / 2, y: rect.top },
            });
          }
        }
      } else {
        setSelectionToolbar((prev) => (prev.open ? { ...prev, open: false } : prev));
      }
    },
    onBlur: () => {
      setSlashMenu((prev) => (prev.open ? { ...prev, open: false } : prev));
    },
  });

  /* ─── Execute slash command ─── */
  const executeCommand = useCallback(
    (cmd: SlashCommand) => {
      if (!editor || editor.isDestroyed) return;
      const { from } = editor.state.selection;
      const slashFrom = slashPosRef.current;

      let chain = editor.chain().focus().deleteRange({ from: slashFrom, to: from });
      switch (cmd.id) {
        case "h1":      chain = chain.toggleHeading({ level: 1 }); break;
        case "h2":      chain = chain.toggleHeading({ level: 2 }); break;
        case "h3":      chain = chain.toggleHeading({ level: 3 }); break;
        case "p":       chain = chain.setParagraph(); break;
        case "ul":      chain = chain.toggleBulletList(); break;
        case "ol":      chain = chain.toggleOrderedList(); break;
        case "quote":   chain = chain.toggleBlockquote(); break;
        case "code":    chain = chain.toggleCodeBlock(); break;
        case "divider": chain = chain.setHorizontalRule(); break;
      }
      chain.run();

      setSlashMenu((prev) => ({ ...prev, open: false, query: "", activeIndex: 0 }));
    },
    [editor]
  );

  /* ─── Keyboard interception (capture phase fires before TipTap) ─── */
  const handleKeyDownCapture = useCallback(
    (e: React.KeyboardEvent) => {
      if (!slashMenuOpenRef.current) return;
      const total = filteredCommandsRef.current.length;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashMenu((prev) => ({
          ...prev,
          activeIndex: Math.min(prev.activeIndex + 1, Math.max(total - 1, 0)),
        }));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashMenu((prev) => ({
          ...prev,
          activeIndex: Math.max(prev.activeIndex - 1, 0),
        }));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filteredCommandsRef.current[slashActiveIndexRef.current];
        if (cmd) executeCommand(cmd);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSlashMenu((prev) => ({ ...prev, open: false }));
      }
    },
    [executeCommand]
  );

  /* ─── Register editor with UIStore so Inspector can access it ─── */
  useEffect(() => {
    if (editor) setActiveEditor(editor);
    return () => setActiveEditor(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  /* ─── Sync spell check setting to editor DOM ─── */
  useEffect(() => {
    if (!editor) return;
    editor.view.dom.setAttribute("spellcheck", spellCheck ? "true" : "false");
  }, [editor, spellCheck]);

  /* ─── Sync content when switching pages ─── */
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const currentHTML = editor.getHTML();
    if (currentHTML !== initialContent) {
      editor.commands.setContent(initialContent || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  /* ─── Drag-to-reorder ─── */
  const handleDragHandlePointerDown = useCallback(
    (e: React.PointerEvent, blockEl: HTMLElement) => {
      e.preventDefault();
      if (!editor) return;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const tiptapEl = wrapper.querySelector(".tiptap") as HTMLElement | null;
      if (!tiptapEl) return;

      const blocks = Array.from(tiptapEl.children) as HTMLElement[];
      const fromIndex = blocks.indexOf(blockEl);
      if (fromIndex === -1) return;

      blockEl.classList.add("drag-source");
      document.body.style.cursor = "grabbing";
      let currentToIndex = fromIndex;

      const showIndicator = (clientY: number) => {
        const tEl = wrapperRef.current?.querySelector(".tiptap") as HTMLElement | null;
        const wEl = wrapperRef.current;
        const ind = dropIndicatorRef.current;
        if (!tEl || !wEl || !ind) return;
        currentToIndex = findDropIndex(tEl, clientY);
        ind.style.setProperty("--drop-indicator-top", `${getIndicatorY(tEl, wEl, currentToIndex)}px`);
        ind.style.opacity = "1";
      };

      const onMove = (ev: PointerEvent) => showIndicator(ev.clientY);

      const onUp = () => {
        blockEl.classList.remove("drag-source");
        document.body.style.cursor = "";
        if (dropIndicatorRef.current) dropIndicatorRef.current.style.opacity = "0";
        moveBlock(editor, fromIndex, currentToIndex);
        window.removeEventListener("pointermove", onMove);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    },
    [editor]
  );

  /* ─── Block hover tracking ─── */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const tiptapEl = wrapper.querySelector(".tiptap") as HTMLElement | null;
    if (!tiptapEl) return;
    const target = e.target as HTMLElement;
    const blockEl = findDirectChild(tiptapEl, target);

    if (blockEl && blockEl !== prevBlockEl.current) {
      prevBlockEl.current?.classList.remove("tiptap-block-hovered");
      blockEl.classList.add("tiptap-block-hovered");
      prevBlockEl.current = blockEl;
      const wrapperRect = wrapper.getBoundingClientRect();
      const blockRect = blockEl.getBoundingClientRect();
      setHoveredBlock({
        top: blockRect.top - wrapperRect.top,
        height: blockRect.height,
        el: blockEl,
      });
    } else if (!blockEl && prevBlockEl.current) {
      prevBlockEl.current.classList.remove("tiptap-block-hovered");
      prevBlockEl.current = null;
      setHoveredBlock(null);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    prevBlockEl.current?.classList.remove("tiptap-block-hovered");
    prevBlockEl.current = null;
    setHoveredBlock(null);
  }, []);

  /* ─── Cleanup on unmount ─── */
  useEffect(() => {
    return () => {
      editor?.destroy();
      document.body.style.cursor = ""; // clear grabbing cursor if unmounted mid-drag
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDownCapture={handleKeyDownCapture}
    >
      {/* ─── Floating block controls ─── */}
      <AnimatePresence>
        {hoveredBlock && (
          <motion.div
            key="block-controls"
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute flex items-center gap-0.5 z-20"
            style={{
              left: -52,
              top: hoveredBlock.top + hoveredBlock.height / 2 - 12,
            }}
          >
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className="w-6 h-6 flex items-center justify-center rounded text-outline/60 hover:text-on-surface hover:bg-surface-container-high transition-all duration-100"
              title="Add block"
            >
              <Icon name="plus" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onPointerDown={(e) => handleDragHandlePointerDown(e, hoveredBlock.el)}
              className="w-5 h-6 flex items-center justify-center rounded text-outline/35 hover:text-on-surface cursor-grab hover:bg-surface-container-high transition-all duration-100"
              title="Drag to reorder"
            >
              <Icon name="drag" className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Drag drop indicator (position set imperatively via CSS custom property) ─── */}
      <div
        ref={dropIndicatorRef}
        className="drop-indicator absolute left-0 right-0 h-0.5 bg-violet-500 rounded-full pointer-events-none z-30"
      />

      {/* ─── TipTap editor ─── */}
      <EditorContent editor={editor} />

      {/* ─── Slash command menu (portal-rendered to body) ─── */}
      <SlashMenu
        open={slashMenu.open}
        commands={filteredCommands}
        position={slashMenu.position}
        activeIndex={slashMenu.activeIndex}
        onSelect={executeCommand}
      />

      {/* ─── Selection formatting toolbar (portal-rendered to body) ─── */}
      {editor && (
        <SelectionToolbar
          editor={editor}
          open={selectionToolbar.open}
          position={selectionToolbar.position}
        />
      )}
    </div>
  );
}
