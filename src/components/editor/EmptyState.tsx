"use client";

import { motion } from "framer-motion";
import { useDocumentStore } from "@/store/useDocumentStore";

const TEMPLATES = [
  {
    id: "meeting",
    icon: "groups",
    title: "Meeting Notes",
    description: "Capture action items and decisions seamlessly.",
    accentClass: "text-primary group-hover:text-on-primary-container",
    bgClass: "bg-surface-variant group-hover:bg-primary-container",
  },
  {
    id: "brainstorm",
    icon: "lightbulb",
    title: "Brainstorm",
    description: "Freeform canvas for ideas and connections.",
    accentClass: "text-tertiary group-hover:text-on-tertiary-container",
    bgClass: "bg-surface-variant group-hover:bg-tertiary-container",
  },
  {
    id: "roadmap",
    icon: "map",
    title: "Product Roadmap",
    description: "Track milestones and project phases.",
    accentClass: "text-secondary group-hover:text-on-secondary-container",
    bgClass: "bg-surface-variant group-hover:bg-secondary-container",
  },
] as const;

const TEMPLATE_CONTENT: Record<string, { title: string; content: string }> = {
  meeting: {
    title: "Meeting Notes",
    content:
      "Date: \n\nAttendees: \n\nAgenda\n\n\nAction Items\n\n\nDecisions\n\n",
  },
  brainstorm: {
    title: "Brainstorm",
    content: "Core idea:\n\n\nKey themes:\n\n\nConnections:\n\n\nNext steps:\n\n",
  },
  roadmap: {
    title: "Product Roadmap",
    content: "Q1\n\n\nQ2\n\n\nQ3\n\n\nQ4\n\n",
  },
};

interface EmptyStateProps {
  pageId: string;
}

export function EmptyState({ pageId }: EmptyStateProps) {
  const { updatePage } = useDocumentStore();

  const handleTemplate = (templateId: string) => {
    const tpl = TEMPLATE_CONTENT[templateId];
    if (!tpl) return;
    updatePage(pageId, { title: tpl.title, content: tpl.content });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] px-8 max-w-[720px] mx-auto w-full">
      {/* ─── Ghost title + cursor ─── */}
      <div className="flex-1 pt-24">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-[60px] font-bold leading-[1.1] tracking-[-0.04em] text-surface-container-highest mb-8 select-none pointer-events-none"
        >
          Untitled Document
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-2 text-outline-variant text-lg"
        >
          <span>Press &apos;/&apos; for commands</span>
          <span className="inline-block w-[2px] h-[22px] bg-primary rounded-full cursor-blink" />
        </motion.div>
      </div>

      {/* ─── Template cards ─── */}
      <div className="pb-16 mt-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="text-[10px] uppercase tracking-widest text-outline mb-4"
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
              onClick={() => handleTemplate(tpl.id)}
              className="group text-left border border-white/5 rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden hover:border-white/15 transition-colors duration-300"
              style={{
                background: "rgba(17, 24, 39, 0.55)",
                backdropFilter: "blur(24px)",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.4), 0 0 0 0 rgba(139,92,246,0)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 1px 2px rgba(0,0,0,0.4), 0 20px 40px -8px rgba(139,92,246,0.14)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 1px 2px rgba(0,0,0,0.4), 0 0 0 0 rgba(139,92,246,0)";
              }}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${tpl.bgClass} ${tpl.accentClass} transition-colors duration-200`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {tpl.icon}
                </span>
              </div>

              {/* Text */}
              <div>
                <h4 className="text-[15px] font-semibold text-slate-200 mb-1 leading-snug">
                  {tpl.title}
                </h4>
                <p className="text-[13px] text-slate-500 leading-snug">
                  {tpl.description}
                </p>
              </div>

              {/* Hover shimmer */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
