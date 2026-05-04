"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface SlashCommand {
  id: string;
  category: string;
  icon: IconName;
  label: string;
  desc: string;
  keywords: string[];
}

export const ALL_COMMANDS: SlashCommand[] = [
  { id: "h1", category: "Text", icon: "type", label: "Heading 1", desc: "Large section heading", keywords: ["h1", "heading", "title"] },
  { id: "h2", category: "Text", icon: "type", label: "Heading 2", desc: "Medium section heading", keywords: ["h2", "heading"] },
  { id: "h3", category: "Text", icon: "type", label: "Heading 3", desc: "Small section heading", keywords: ["h3", "heading"] },
  { id: "p", category: "Text", icon: "note", label: "Paragraph", desc: "Plain text block", keywords: ["text", "paragraph", "body"] },
  { id: "ul", category: "List", icon: "list", label: "Bullet List", desc: "Unordered list", keywords: ["ul", "bullet", "list"] },
  { id: "ol", category: "List", icon: "numberedList", label: "Numbered List", desc: "Ordered numbered list", keywords: ["ol", "numbered", "ordered"] },
  { id: "quote", category: "Other", icon: "quote", label: "Quote", desc: "Highlighted quote block", keywords: ["quote", "blockquote"] },
  { id: "code", category: "Other", icon: "code", label: "Code Block", desc: "Monospaced code snippet", keywords: ["code", "pre", "snippet"] },
  { id: "divider", category: "Other", icon: "divider", label: "Divider", desc: "Horizontal separator", keywords: ["hr", "divider", "line"] },
];

const CATEGORY_ORDER = ["Text", "List", "Other"];

interface SlashMenuProps {
  open: boolean;
  commands: SlashCommand[];
  position: { x: number; y: number };
  activeIndex: number;
  onSelect: (command: SlashCommand) => void;
}

export function SlashMenu({ open, commands, position, activeIndex, onSelect }: SlashMenuProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const grouped = CATEGORY_ORDER.reduce<Record<string, SlashCommand[]>>((acc, cat) => {
    const cmds = commands.filter((c) => c.category === cat);
    if (cmds.length > 0) acc[cat] = cmds;
    return acc;
  }, {});

  if (typeof window === "undefined") return null;

  const menuWidth = 288;
  const menuMaxH = 308;
  const clampedX = Math.min(Math.max(position.x, 16), window.innerWidth - menuWidth - 16);
  const clampedY =
    position.y + menuMaxH > window.innerHeight - 16
      ? position.y - menuMaxH - 20
      : position.y;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.97 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          className="fixed z-[200] w-72 rounded-2xl border border-white/8 slash-menu-panel overflow-hidden"
          style={{ left: clampedX, top: clampedY }}
        >
          {commands.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-[13px] text-slate-600">No commands found</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto py-1.5">
              {Object.entries(grouped).map(([cat, cmds]) => (
                <div key={cat}>
                  <p className="px-4 pt-2.5 pb-1 text-[9px] uppercase tracking-widest text-slate-700 font-semibold select-none">
                    {cat}
                  </p>
                  <div className="px-1.5 flex flex-col gap-0.5">
                    {cmds.map((cmd) => {
                      const globalIdx = commands.indexOf(cmd);
                      const isActive = globalIdx === activeIndex;
                      return (
                        <button
                          ref={isActive ? activeRef : undefined}
                          type="button"
                          key={cmd.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            onSelect(cmd);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors duration-75 text-left",
                            isActive
                              ? "bg-violet-500/15 text-on-surface"
                              : "text-slate-300 hover:bg-white/5"
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                              isActive ? "bg-violet-500/20" : "bg-surface-container-high"
                            )}
                          >
                            <Icon name={cmd.icon} className="h-4 w-4 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium leading-tight">{cmd.label}</p>
                            <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                              {cmd.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
