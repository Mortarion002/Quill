"use client";

import { useRef } from "react";
import { useDocumentStore } from "@/store/useDocumentStore";

interface DocumentTitleProps {
  pageId: string;
  title: string;
}

export function DocumentTitle({ pageId, title }: DocumentTitleProps) {
  const { updatePage } = useDocumentStore();
  const ref = useRef<HTMLHeadingElement>(null);

  const handleBlur = () => {
    const newTitle = ref.current?.textContent?.trim() || "Untitled";
    updatePage(pageId, { title: newTitle });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ref.current?.blur();
    }
  };

  return (
    <h1
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder="Untitled Document"
      className="text-[60px] font-bold leading-[1.1] tracking-[-0.04em] text-on-surface outline-none w-full break-words cursor-text caret-primary"
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {title}
    </h1>
  );
}
