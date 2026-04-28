"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Icon } from "@/components/ui/Icon";
import { EmojiPicker } from "./EmojiPicker";

interface DocumentTitleProps {
  pageId: string;
  title: string;
  emoji?: string;
}

export function DocumentTitle({ pageId, title, emoji }: DocumentTitleProps) {
  const { updatePage } = useDocumentStore();
  const { spellCheck } = useSettingsStore();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const handleBlur = () => {
    const newTitle = titleRef.current?.textContent?.trim() || "Untitled";
    updatePage(pageId, { title: newTitle });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      titleRef.current?.blur();
    }
  };

  const handleEmojiSelect = (em: string) => {
    updatePage(pageId, { emoji: em });
    setEmojiOpen(false);
  };

  return (
    <div className="group/title">
      {/* ─── Emoji row ─── */}
      <div className="relative inline-block mb-4">
        {emoji ? (
          <button
            type="button"
            title="Change emoji"
            onClick={() => setEmojiOpen((v) => !v)}
            className="text-[56px] leading-none block hover:scale-105 transition-transform duration-150 select-none"
          >
            {emoji}
          </button>
        ) : (
          <button
            type="button"
            title="Add emoji"
            onClick={() => setEmojiOpen((v) => !v)}
            className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-700 transition-all duration-150 mb-1 opacity-0 group-hover/title:opacity-100"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />
            Add emoji
          </button>
        )}

        <AnimatePresence>
          {emojiOpen && (
            <EmojiPicker
              onSelect={handleEmojiSelect}
              onClose={() => setEmojiOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ─── Title ─── */}
      <h1
        ref={titleRef}
        contentEditable
        spellCheck={spellCheck}
        suppressContentEditableWarning
        data-placeholder="Untitled Document"
        className="w-full wrap-break-word cursor-text text-[56px] font-bold leading-[1.1] tracking-normal text-slate-950 outline-none caret-violet-500 [font-family:var(--editor-font)]"
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        {title}
      </h1>
    </div>
  );
}
