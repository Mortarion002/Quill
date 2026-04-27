"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentStore } from "@/store/useDocumentStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: "search", label: "Search" },
  { icon: "description", label: "Pages" },
  { icon: "star", label: "Favorites" },
  { icon: "dashboard_customize", label: "Templates" },
  { icon: "settings", label: "Settings" },
] as const;

const FOOTER_ITEMS = [
  { icon: "help", label: "Help" },
  { icon: "delete", label: "Trash" },
] as const;

export function Sidebar() {
  const { pages, activePageId, createPage, setActivePage, deletePage } =
    useDocumentStore();
  const [activeNav, setActiveNav] = useState<string>("Pages");
  const [pagesExpanded, setPagesExpanded] = useState(true);
  const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);

  const handleNewPage = () => {
    createPage("Untitled");
    setActiveNav("Pages");
    setPagesExpanded(true);
  };

  return (
    <aside
      className="fixed left-0 top-0 w-65 h-screen border-r border-white/5 bg-slate-950/60 backdrop-blur-xl flex flex-col p-4 gap-1.5 z-50 overflow-hidden sidebar-glow"
    >
      {/* ─── Workspace Header ─── */}
      <div className="flex items-center gap-3 p-2 mb-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
        <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <span
            className="material-symbols-outlined text-[22px] text-violet-400 filled"
          >
            pentagon
          </span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[15px] font-bold text-slate-100 truncate leading-snug">
            Intellect Workspace
          </span>
          <span className="text-[11px] text-slate-500 truncate">
            Premium Plan
          </span>
        </div>
        <span className="material-symbols-outlined text-slate-600 text-[18px] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          unfold_more
        </span>
      </div>

      {/* ─── New Page CTA ─── */}
      <button type="button"
        onClick={handleNewPage}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white text-sm font-semibold transition-all duration-200 mb-2"
        style={{ boxShadow: "0 2px 12px rgba(139,92,246,0.25)" }}
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        New Page
      </button>

      {/* ─── Main Navigation ─── */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto min-h-0">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.label;
          const isPages = item.label === "Pages";

          return (
            <div key={item.label}>
              <button type="button"
                onClick={() => {
                  setActiveNav(item.label);
                  if (isPages) setPagesExpanded((p) => !p);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-[9px] rounded-lg text-sm transition-all duration-150",
                  isActive
                    ? "bg-white/10 text-white border-l-2 border-violet-500"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-[20px] flex-shrink-0",
                    isActive ? "text-violet-400 filled" : ""
                  )}
                  style={
                    isActive
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {item.icon}
                </span>
                <span className="flex-1 text-left font-medium">
                  {item.label}
                </span>
                {isPages && pages.length > 0 && (
                  <span className="text-[11px] text-slate-600 tabular-nums">
                    {pages.length}
                  </span>
                )}
                {isPages && (
                  <span
                    className={cn(
                      "material-symbols-outlined text-[16px] text-slate-600 transition-transform duration-200",
                      pagesExpanded ? "rotate-90" : "rotate-0"
                    )}
                  >
                    chevron_right
                  </span>
                )}
              </button>

              {/* ─── Page List ─── */}
              {isPages && (
                <AnimatePresence initial={false}>
                  {pagesExpanded && (
                    <motion.div
                      key="pages-list"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-0.5 mb-1 flex flex-col gap-0.5 border-l border-white/5 pl-3">
                        {pages.length === 0 ? (
                          <p className="text-[11px] text-slate-600 py-1.5 px-2">
                            No pages yet — create one above
                          </p>
                        ) : (
                          pages.map((page) => (
                            <div
                              key={page.id}
                              onMouseEnter={() => setHoveredPageId(page.id)}
                              onMouseLeave={() => setHoveredPageId(null)}
                              onClick={() => setActivePage(page.id)}
                              className={cn(
                                "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-150 text-[13px]",
                                page.id === activePageId
                                  ? "bg-white/8 text-slate-200"
                                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                              )}
                            >
                              <span className="material-symbols-outlined text-[14px] flex-shrink-0 opacity-60">
                                description
                              </span>
                              <span className="truncate flex-1">
                                {page.title || "Untitled"}
                              </span>
                              {hoveredPageId === page.id && (
                                <button type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deletePage(page.id);
                                  }}
                                  className="flex-shrink-0 text-slate-600 hover:text-slate-400 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    close
                                  </span>
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </nav>

      {/* ─── Footer Navigation ─── */}
      <div className="pt-3 border-t border-white/5 flex flex-col gap-0.5">
        {FOOTER_ITEMS.map((item) => (
          <button type="button"
            key={item.label}
            className="flex items-center gap-3 px-3 py-[9px] rounded-lg text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">
              {item.icon}
            </span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
