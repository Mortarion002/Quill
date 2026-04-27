"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/core";

interface SelectionToolbarProps {
  editor: Editor;
  open: boolean;
  position: { x: number; y: number };
}

const FORMATTING = [
  { id: "bold",   mark: "bold",   icon: "format_bold",          label: "Bold"          },
  { id: "italic", mark: "italic", icon: "format_italic",        label: "Italic"        },
  { id: "strike", mark: "strike", icon: "format_strikethrough", label: "Strikethrough" },
  { id: "code",   mark: "code",   icon: "code",                 label: "Inline code"   },
] as const;

const ACTIONS: Record<string, (editor: Editor) => void> = {
  bold:   (e) => e.chain().focus().toggleBold().run(),
  italic: (e) => e.chain().focus().toggleItalic().run(),
  strike: (e) => e.chain().focus().toggleStrike().run(),
  code:   (e) => e.chain().focus().toggleCode().run(),
};

export function SelectionToolbar({ editor, open, position }: SelectionToolbarProps) {
  if (typeof window === "undefined") return null;

  const toolbarWidth = 296;
  const clampedX = Math.min(
    Math.max(position.x - toolbarWidth / 2, 16),
    window.innerWidth - toolbarWidth - 16
  );
  const clampedY = Math.max(position.y - 52, 8);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="fixed z-[200] selection-toolbar rounded-xl border border-white/8 flex items-center h-9 px-1 gap-px"
          style={{ left: clampedX, top: clampedY }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* ─── Formatting buttons ─── */}
          {FORMATTING.map(({ id, mark, icon, label }) => (
            <button
              type="button"
              key={id}
              onClick={() => ACTIONS[id]?.(editor)}
              title={label}
              className={cn(
                "w-8 h-7 flex items-center justify-center rounded-lg transition-colors duration-100",
                editor.isActive(mark)
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-slate-400 hover:bg-white/8 hover:text-slate-200"
              )}
            >
              <span className="material-symbols-outlined text-[17px]">{icon}</span>
            </button>
          ))}

          <div className="w-px h-4 bg-white/10 mx-1 flex-shrink-0" />

          {/* ─── Link (placeholder) ─── */}
          <button
            type="button"
            title="Link (coming soon)"
            className="w-8 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white/8 hover:text-slate-200 transition-colors duration-100"
          >
            <span className="material-symbols-outlined text-[17px]">link</span>
          </button>

          <div className="w-px h-4 bg-white/10 mx-1 flex-shrink-0" />

          {/* ─── AI Rewrite (placeholder) ─── */}
          <button
            type="button"
            title="AI Rewrite (coming soon)"
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[12px] font-medium ai-rewrite-btn transition-all duration-100"
          >
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            <span>Rewrite</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
