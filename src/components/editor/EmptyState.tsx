"use client";

import { motion } from "framer-motion";
import { useDocumentStore } from "@/store/useDocumentStore";
import { Icon } from "@/components/ui/Icon";

const TEMPLATES = [
  {
    id: "meeting",
    icon: "groups",
    title: "Meeting Notes",
    description: "Capture action items and decisions seamlessly.",
    accentClass: "text-primary",
    bgIdle: "bg-surface-variant",
    bgHover: "group-hover:bg-primary-container group-hover:text-on-primary-container",
  },
  {
    id: "brainstorm",
    icon: "lightbulb",
    title: "Brainstorm",
    description: "Freeform canvas for ideas and connections.",
    accentClass: "text-tertiary",
    bgIdle: "bg-surface-variant",
    bgHover: "group-hover:bg-tertiary-container group-hover:text-on-tertiary-container",
  },
  {
    id: "roadmap",
    icon: "map",
    title: "Product Roadmap",
    description: "Track milestones and project phases.",
    accentClass: "text-secondary",
    bgIdle: "bg-surface-variant",
    bgHover: "group-hover:bg-secondary-container group-hover:text-on-secondary-container",
  },
] as const;

/* TipTap-compatible HTML for each template */
const TEMPLATE_HTML: Record<string, { title: string; content: string }> = {
  meeting: {
    title: "Meeting Notes",
    content: `<h2>Meeting Notes</h2><p>Date: </p><p>Attendees: </p><h2>Agenda</h2><p></p><h2>Action Items</h2><p></p><h2>Decisions</h2><p></p>`,
  },
  brainstorm: {
    title: "Brainstorm",
    content: `<h2>Brainstorm</h2><p>Core idea:</p><p></p><p>Key themes:</p><p></p><p>Connections:</p><p></p><p>Next steps:</p><p></p>`,
  },
  roadmap: {
    title: "Product Roadmap",
    content: `<h2>Product Roadmap</h2><h3>Q1</h3><p></p><h3>Q2</h3><p></p><h3>Q3</h3><p></p><h3>Q4</h3><p></p>`,
  },
};

interface EmptyStateProps {
  pageId: string;
  onActivate: () => void;
}

export function EmptyState({ pageId, onActivate }: EmptyStateProps) {
  const { updatePage } = useDocumentStore();

  const handleTemplate = (templateId: string) => {
    const tpl = TEMPLATE_HTML[templateId];
    if (!tpl) return;
    updatePage(pageId, { title: tpl.title, content: tpl.content });
  };

  return (
    <div
      className="flex flex-col min-h-[calc(100vh-56px)] px-8 max-w-180 mx-auto w-full cursor-text"
      onClick={onActivate}
    >
      {/* ─── Ghost title + blinking cursor ─── */}
      <div className="flex-1 pt-24 select-none pointer-events-none">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-[56px] font-bold leading-[1.1] tracking-normal text-slate-200 mb-8"
        >
          Untitled Document
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-2 text-slate-400 text-lg mb-6"
        >
          <span>Type &apos;/&apos; for commands, or start writing…</span>
          <span className="inline-block w-0.5 h-5.5 bg-violet-500 rounded-full cursor-blink" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="flex items-center gap-4 flex-wrap"
        >
          {[
            { key: "/",   label: "Commands" },
            { key: "⌘ B", label: "Bold"     },
            { key: "⌘ I", label: "Italic"   },
            { key: "⌘ Z", label: "Undo"     },
          ].map(({ key, label }) => (
            <span key={key} className="flex items-center gap-2 text-[12px] text-slate-600 select-none">
              <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500 font-mono text-[11px] leading-none">
                {key}
              </kbd>
              {label}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ─── Template cards ─── */}
      <div
        className="pb-16 mt-auto"
        onClick={(e) => e.stopPropagation()} /* Don't activate on card click */
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="text-[10px] uppercase tracking-widest text-slate-400 mb-4 select-none"
        >
          Start with a template
        </motion.p>

        <div className="grid grid-cols-3 gap-4">
          {TEMPLATES.map((tpl, i) => (
            <motion.button
              key={tpl.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.06, duration: 0.3, ease: "easeOut" }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTemplate(tpl.id)}
              className="group text-left border border-slate-100 rounded-2xl bg-white p-5 flex flex-col gap-4 relative overflow-hidden hover:border-violet-100 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50 text-violet-600 transition-all duration-200"
              >
                <Icon name={tpl.id === "meeting" ? "user" : tpl.id === "brainstorm" ? "spark" : "map"} className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-slate-950 mb-1 leading-snug">
                  {tpl.title}
                </h4>
                <p className="text-[13px] text-slate-500 leading-snug">
                  {tpl.description}
                </p>
              </div>
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
