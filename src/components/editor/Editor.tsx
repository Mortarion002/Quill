"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor as TipTapEditor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useUIStore } from "@/store/useUIStore";
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

/* ─── Component ─── */

export function Editor({ pageId, initialContent }: EditorProps) {
  const { updatePage } = useDocumentStore();
  const { setActiveBlock } = useUIStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredBlock, setHoveredBlock] = useState<HoveredBlockInfo | null>(null);
  const prevBlockEl = useRef<HTMLElement | null>(null);

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

  filteredCommandsRef.current = filteredCommands;
  slashMenuOpenRef.current = slashMenu.open;
  slashActiveIndexRef.current = slashMenu.activeIndex;

  /* ─── TipTap instance ─── */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
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
      attributes: { class: "tiptap focus:outline-none", spellcheck: "false" },
    },
    onUpdate: ({ editor }) => {
      /* Save content */
      const html = editor.getHTML();
      const isEmpty = html === "<p></p>" || html === "" || editor.isEmpty;
      updatePage(pageId, { content: isEmpty ? "" : html });

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

  /* ─── Sync content when switching pages ─── */
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const currentHTML = editor.getHTML();
    if (currentHTML !== initialContent) {
      editor.commands.setContent(initialContent || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

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
    return () => { editor?.destroy(); };
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
              <span className="material-symbols-outlined text-[17px]">add</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className="w-5 h-6 flex items-center justify-center rounded text-outline/35 hover:text-on-surface cursor-grab hover:bg-surface-container-high transition-all duration-100"
              title="Drag to reorder"
            >
              <span className="material-symbols-outlined text-[17px]">drag_indicator</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
