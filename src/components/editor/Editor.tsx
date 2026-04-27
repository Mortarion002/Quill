"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useUIStore } from "@/store/useUIStore";

interface HoveredBlockInfo {
  top: number;
  height: number;
  el: HTMLElement;
}

interface EditorProps {
  pageId: string;
  initialContent: string;
}

export function Editor({ pageId, initialContent }: EditorProps) {
  const { updatePage } = useDocumentStore();
  const { setActiveBlock } = useUIStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredBlock, setHoveredBlock] = useState<HoveredBlockInfo | null>(null);
  const prevBlockEl = useRef<HTMLElement | null>(null);

  /* ─── TipTap instance ─── */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
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
      attributes: {
        class: "tiptap focus:outline-none",
        spellcheck: "false",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const isEmpty =
        html === "<p></p>" || html === "" || editor.isEmpty;
      updatePage(pageId, { content: isEmpty ? "" : html });
    },
    onSelectionUpdate: ({ editor }) => {
      const { $anchor } = editor.state.selection;
      const depth = $anchor.depth;
      const node = $anchor.node(depth > 0 ? 1 : 0);
      setActiveBlock(node?.type?.name ?? null);

      /* ─── Active block class ─── */
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const tiptapEl = wrapper.querySelector(".tiptap");
      if (!tiptapEl) return;
      tiptapEl.querySelectorAll(".tiptap-block-active").forEach((el) =>
        el.classList.remove("tiptap-block-active")
      );
      const domNode = editor.view.domAtPos($anchor.pos)?.node as HTMLElement | null;
      if (domNode) {
        const blockEl = findDirectChild(tiptapEl as HTMLElement, domNode);
        blockEl?.classList.add("tiptap-block-active");
      }
    },
  });

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
  const findDirectChild = (parent: HTMLElement, target: Node): HTMLElement | null => {
    let node: Node | null = target;
    while (node && node.parentNode !== parent) {
      node = node.parentNode;
    }
    return node instanceof HTMLElement ? node : null;
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const tiptapEl = wrapper.querySelector(".tiptap") as HTMLElement | null;
      if (!tiptapEl) return;

      const target = e.target as HTMLElement;
      const blockEl = findDirectChild(tiptapEl, target);

      if (blockEl && blockEl !== prevBlockEl.current) {
        /* Remove class from previous block */
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
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    prevBlockEl.current?.classList.remove("tiptap-block-hovered");
    prevBlockEl.current = null;
    setHoveredBlock(null);
  }, []);

  /* ─── Cleanup on unmount ─── */
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
            {/* Add block */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className="w-6 h-6 flex items-center justify-center rounded text-outline/60 hover:text-on-surface hover:bg-surface-container-high transition-all duration-100"
              title="Add block"
            >
              <span className="material-symbols-outlined text-[17px]">add</span>
            </button>

            {/* Drag handle */}
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
    </div>
  );
}
