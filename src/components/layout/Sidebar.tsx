"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentStore } from "@/store/useDocumentStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: "search",              label: "Search"    },
  { icon: "description",         label: "Pages"     },
  { icon: "star",                label: "Favorites" },
  { icon: "dashboard_customize", label: "Templates" },
  { icon: "settings",            label: "Settings"  },
] as const;

const FOOTER_ITEMS = [
  { icon: "help",   label: "Help"  },
  { icon: "delete", label: "Trash" },
] as const;

const TEMPLATE_DEFINITIONS = [
  {
    id: "meeting",
    icon: "groups",
    label: "Meeting Notes",
    accent: "text-primary",
    bg: "bg-surface-variant group-hover:bg-primary-container group-hover:text-on-primary-container",
    title: "Meeting Notes",
    content: `<h2>Meeting Notes</h2><p>Date: </p><p>Attendees: </p><h2>Agenda</h2><p></p><h2>Action Items</h2><p></p><h2>Decisions</h2><p></p>`,
  },
  {
    id: "brainstorm",
    icon: "lightbulb",
    label: "Brainstorm",
    accent: "text-tertiary",
    bg: "bg-surface-variant group-hover:bg-tertiary-container group-hover:text-on-tertiary-container",
    title: "Brainstorm",
    content: `<h2>Brainstorm</h2><p>Core idea:</p><p></p><p>Key themes:</p><p></p><p>Connections:</p><p></p>`,
  },
  {
    id: "roadmap",
    icon: "map",
    label: "Product Roadmap",
    accent: "text-secondary",
    bg: "bg-surface-variant group-hover:bg-secondary-container group-hover:text-on-secondary-container",
    title: "Product Roadmap",
    content: `<h2>Product Roadmap</h2><h3>Q1</h3><p></p><h3>Q2</h3><p></p><h3>Q3</h3><p></p><h3>Q4</h3><p></p>`,
  },
] as const;

/* ─── Search panel ─── */
function SearchPanel() {
  const { pages, setActivePage, activePageId } = useDocumentStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = query.trim()
    ? pages.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase())
      )
    : pages;

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-600 pointer-events-none">
          search
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages…"
          className="w-full bg-surface-container-low border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-violet-500/40 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
        {results.length === 0 ? (
          <p className="text-[12px] text-slate-600 px-2 py-3 text-center">No pages found</p>
        ) : (
          results.map((page) => (
            <button
              type="button"
              key={page.id}
              onClick={() => setActivePage(page.id)}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-left transition-all",
                page.id === activePageId
                  ? "bg-white/8 text-slate-200"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
            >
              {page.emoji ? (
                <span className="text-[13px] shrink-0 leading-none">{page.emoji}</span>
              ) : (
                <span className="material-symbols-outlined text-[14px] shrink-0 opacity-50">description</span>
              )}
              <span className="truncate">{page.title || "Untitled"}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Favorites panel ─── */
function FavoritesPanel() {
  const { pages, setActivePage, toggleFavorite, activePageId } = useDocumentStore();
  const favorites = pages.filter((p) => p.favorite);

  return (
    <div className="flex flex-col gap-0.5 mt-1">
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center select-none">
          <span className="material-symbols-outlined text-[28px] text-slate-700">star</span>
          <p className="text-[12px] text-slate-600 leading-relaxed">
            Star pages to find them here quickly
          </p>
        </div>
      ) : (
        favorites.map((page) => (
          <div
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={cn(
              "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all text-[13px]",
              page.id === activePageId
                ? "bg-white/8 text-slate-200"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            )}
          >
            {page.emoji ? (
              <span className="text-[13px] shrink-0 leading-none">{page.emoji}</span>
            ) : (
              <span className="material-symbols-outlined text-[14px] shrink-0 opacity-50">description</span>
            )}
            <span className="truncate flex-1">{page.title || "Untitled"}</span>
            <button
              type="button"
              title="Remove from favorites"
              onClick={(e) => { e.stopPropagation(); toggleFavorite(page.id); }}
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400 hover:text-slate-400"
            >
              <span className="material-symbols-outlined text-[14px] filled">star</span>
            </button>
          </div>
        ))
      )}
    </div>
  );
}

/* ─── Templates panel ─── */
function TemplatesPanel() {
  const { createPage, updatePage, setActivePage } = useDocumentStore();

  const handleCreate = (tpl: typeof TEMPLATE_DEFINITIONS[number]) => {
    const id = createPage(tpl.title);
    updatePage(id, { title: tpl.title, content: tpl.content });
    setActivePage(id);
  };

  return (
    <div className="flex flex-col gap-2 mt-1">
      <p className="text-[10px] uppercase tracking-widest text-slate-600 px-1 select-none">
        Start with a template
      </p>
      {TEMPLATE_DEFINITIONS.map((tpl) => (
        <button
          type="button"
          key={tpl.id}
          onClick={() => handleCreate(tpl)}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/5 hover:border-white/10 transition-all text-left"
          style={{ background: "rgba(17,24,39,0.4)" }}
        >
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200", tpl.bg, tpl.accent)}>
            <span className="material-symbols-outlined text-[16px]">{tpl.icon}</span>
          </div>
          <span className="text-[13px] font-medium text-slate-300 group-hover:text-slate-100 transition-colors">
            {tpl.label}
          </span>
          <span className="material-symbols-outlined text-[14px] text-slate-700 ml-auto shrink-0 group-hover:text-slate-500 transition-colors">
            arrow_forward
          </span>
        </button>
      ))}
    </div>
  );
}

/* ─── Settings panel ─── */
function SettingsPanel() {
  const SETTING_GROUPS = [
    {
      label: "Workspace",
      items: [
        { icon: "person",        title: "Account",       sub: "alternatewavelenght@gmail.com" },
        { icon: "palette",       title: "Appearance",    sub: "Dark mode"                     },
        { icon: "translate",     title: "Language",      sub: "English"                       },
      ],
    },
    {
      label: "Editor",
      items: [
        { icon: "text_fields",   title: "Font",          sub: "Inter, 18px"   },
        { icon: "format_indent_increase", title: "Line spacing", sub: "1.75" },
        { icon: "spellcheck",    title: "Spell check",   sub: "On"            },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4 mt-1">
      {SETTING_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] uppercase tracking-widest text-slate-600 px-1 mb-1.5 select-none">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <button
                type="button"
                key={item.title}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors group"
              >
                <div className="w-7 h-7 rounded-md bg-surface-container-high flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">{item.icon}</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[13px] text-slate-300 font-medium leading-snug">{item.title}</span>
                  <span className="text-[11px] text-slate-600 leading-snug truncate">{item.sub}</span>
                </div>
                <span className="material-symbols-outlined text-[14px] text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  chevron_right
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-2 border-t border-white/5">
        <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors w-full text-[13px] font-medium">
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Sign out
        </button>
      </div>
    </div>
  );
}

/* ─── Main Sidebar ─── */
export function Sidebar() {
  const { pages, activePageId, createPage, setActivePage, deletePage, updatePage, toggleFavorite } =
    useDocumentStore();
  const [activeNav, setActiveNav] = useState<string>("Pages");
  const [pagesExpanded, setPagesExpanded] = useState(true);
  const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);

  const handleNewPage = () => {
    createPage("Untitled");
    setActiveNav("Pages");
    setPagesExpanded(true);
  };

  /* Panel shown below the nav when a section other than Pages is active */
  const panel =
    activeNav === "Search"    ? <SearchPanel />    :
    activeNav === "Favorites" ? <FavoritesPanel /> :
    activeNav === "Templates" ? <TemplatesPanel /> :
    activeNav === "Settings"  ? <SettingsPanel />  :
    null;

  return (
    <aside className="fixed left-0 top-0 w-65 h-screen border-r border-white/5 bg-slate-950/60 backdrop-blur-xl flex flex-col p-4 gap-1.5 z-50 overflow-hidden sidebar-glow">
      {/* ─── Workspace Header ─── */}
      <div className="flex items-center gap-3 p-2 mb-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
        <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
          <span className="material-symbols-outlined text-[22px] text-violet-400 filled">pentagon</span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[15px] font-bold text-slate-100 truncate leading-snug">Intellect Workspace</span>
          <span className="text-[11px] text-slate-500 truncate">Premium Plan</span>
        </div>
        <span className="material-symbols-outlined text-slate-600 text-[18px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          unfold_more
        </span>
      </div>

      {/* ─── New Page CTA ─── */}
      <button
        type="button"
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
          const isPages  = item.label === "Pages";

          return (
            <div key={item.label}>
              <button
                type="button"
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
                    "material-symbols-outlined text-[20px] shrink-0",
                    isActive ? "text-violet-400 filled" : ""
                  )}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {isPages && pages.length > 0 && (
                  <span className="text-[11px] text-slate-600 tabular-nums">{pages.length}</span>
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

              {/* ─── Pages list ─── */}
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
                              onClick={() => renamingPageId !== page.id && setActivePage(page.id)}
                              className={cn(
                                "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-150 text-[13px]",
                                page.id === activePageId
                                  ? "bg-white/8 text-slate-200"
                                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                              )}
                            >
                              {/* Emoji or fallback icon */}
                              {page.emoji ? (
                                <span className="text-[14px] shrink-0 leading-none select-none">
                                  {page.emoji}
                                </span>
                              ) : (
                                <span className="material-symbols-outlined text-[14px] shrink-0 opacity-60">
                                  description
                                </span>
                              )}

                              {/* Title or rename input */}
                              {renamingPageId === page.id ? (
                                <input
                                  autoFocus
                                  defaultValue={page.title}
                                  className="flex-1 min-w-0 bg-transparent text-[13px] text-slate-200 outline-none border-b border-violet-500/50 placeholder:text-slate-600"
                                  placeholder="Untitled"
                                  onClick={(e) => e.stopPropagation()}
                                  onBlur={(e) => {
                                    updatePage(page.id, { title: e.target.value.trim() || "Untitled" });
                                    setRenamingPageId(null);
                                  }}
                                  onKeyDown={(e) => {
                                    e.stopPropagation();
                                    if (e.key === "Enter") {
                                      updatePage(page.id, { title: e.currentTarget.value.trim() || "Untitled" });
                                      setRenamingPageId(null);
                                    }
                                    if (e.key === "Escape") setRenamingPageId(null);
                                  }}
                                />
                              ) : (
                                <span
                                  className="truncate flex-1"
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setRenamingPageId(page.id);
                                  }}
                                >
                                  {page.title || "Untitled"}
                                </span>
                              )}

                              {/* Hover actions */}
                              {hoveredPageId === page.id && renamingPageId !== page.id && (
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    title={page.favorite ? "Remove from favorites" : "Add to favorites"}
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(page.id); }}
                                    className={cn(
                                      "transition-colors",
                                      page.favorite ? "text-amber-400" : "text-slate-600 hover:text-slate-400"
                                    )}
                                  >
                                    <span className={cn("material-symbols-outlined text-[14px]", page.favorite ? "filled" : "")}>
                                      star
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    title="Delete page"
                                    onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                                    className="text-slate-600 hover:text-slate-400 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* ─── Non-pages panels ─── */}
              {!isPages && isActive && (
                <AnimatePresence>
                  <motion.div
                    key={`panel-${item.label}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="ml-1 mt-1 mb-1 px-1"
                  >
                    {panel}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </nav>

      {/* ─── Footer Navigation ─── */}
      <div className="pt-3 border-t border-white/5 flex flex-col gap-0.5">
        {FOOTER_ITEMS.map((item) => (
          <button
            type="button"
            key={item.label}
            className="flex items-center gap-3 px-3 py-[9px] rounded-lg text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
