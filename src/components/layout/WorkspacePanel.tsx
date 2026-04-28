"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useSettingsStore, type FontOption } from "@/store/useSettingsStore";
import { useUIStore, type WorkspaceView } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

const TEMPLATE_DEFINITIONS = [
  {
    id: "meeting",
    icon: "groups",
    label: "Meeting Notes",
    description: "Agenda, decisions, and action items in one calm structure.",
    title: "Meeting Notes",
    content:
      "<h2>Meeting Notes</h2><p>Date: </p><p>Attendees: </p><h2>Agenda</h2><p></p><h2>Action Items</h2><p></p><h2>Decisions</h2><p></p>",
  },
  {
    id: "brainstorm",
    icon: "lightbulb",
    label: "Brainstorm",
    description: "Loose capture for early ideas, themes, and next steps.",
    title: "Brainstorm",
    content:
      "<h2>Brainstorm</h2><p>Core idea:</p><p></p><p>Key themes:</p><p></p><p>Connections:</p><p></p>",
  },
  {
    id: "roadmap",
    icon: "map",
    label: "Product Roadmap",
    description: "A spacious quarterly planning scaffold.",
    title: "Product Roadmap",
    content:
      "<h2>Product Roadmap</h2><h3>Q1</h3><p></p><h3>Q2</h3><p></p><h3>Q3</h3><p></p><h3>Q4</h3><p></p>",
  },
] as const;

const SHORTCUTS = [
  { key: "/", label: "Command menu" },
  { key: "Ctrl B", label: "Bold" },
  { key: "Ctrl I", label: "Italic" },
  { key: "Ctrl Z", label: "Undo" },
  { key: "# Space", label: "Heading 1" },
  { key: "## Space", label: "Heading 2" },
  { key: "- Space", label: "Bullet list" },
  { key: "> Space", label: "Blockquote" },
  { key: "---", label: "Divider" },
] as const;

const VIEW_META: Record<Exclude<WorkspaceView, "editor">, { title: string; eyebrow: string; icon: string }> = {
  search: { title: "Search", eyebrow: "Find your thinking", icon: "search" },
  pages: { title: "Pages", eyebrow: "Document library", icon: "description" },
  favorites: { title: "Favorites", eyebrow: "Pinned work", icon: "star" },
  templates: { title: "Templates", eyebrow: "Starting points", icon: "dashboard_customize" },
  settings: { title: "Settings", eyebrow: "Workspace preferences", icon: "settings" },
  help: { title: "Help", eyebrow: "Reference", icon: "help" },
  trash: { title: "Trash", eyebrow: "Recover or remove pages", icon: "delete" },
};

function SurfaceShell({
  view,
  children,
}: {
  view: Exclude<WorkspaceView, "editor">;
  children: React.ReactNode;
}) {
  const meta = VIEW_META[view];

  return (
    <motion.section
      key={view}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="mx-auto w-full max-w-260 px-8 pt-24 pb-28"
    >
      <div className="mb-10 flex items-end justify-between gap-6 border-b border-white/6 pb-8">
        <div>
          <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600">
            <span className="material-symbols-outlined text-[16px] text-violet-400">{meta.icon}</span>
            {meta.eyebrow}
          </div>
          <h1 className="text-[52px] font-bold leading-none tracking-normal text-slate-100">
            {meta.title}
          </h1>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function PageRow({
  page,
  muted = false,
}: {
  page: ReturnType<typeof useDocumentStore.getState>["pages"][number];
  muted?: boolean;
}) {
  const { setActivePage, toggleFavorite } = useDocumentStore();
  const { setWorkspaceView } = useUIStore();

  const openPage = () => {
    setActivePage(page.id);
    setWorkspaceView("editor");
  };

  return (
    <div
      className={cn(
        "group grid grid-cols-[1fr_auto] gap-4 rounded-xl border border-white/6 bg-slate-950/35 px-4 py-3 transition-all duration-150 hover:border-violet-400/20 hover:bg-white/[0.04]",
        muted && "opacity-70"
      )}
    >
      <button type="button" onClick={openPage} className="min-w-0 text-left">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/6 text-[15px] text-violet-300">
            {page.emoji || <span className="material-symbols-outlined text-[18px]">description</span>}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-slate-200">{page.title || "Untitled"}</p>
            <p className="mt-0.5 text-[12px] text-slate-600">
              Updated {new Date(page.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </button>
      <button
        type="button"
        title={page.favorite ? "Remove from favorites" : "Add to favorites"}
        onClick={() => toggleFavorite(page.id)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          page.favorite
            ? "bg-violet-500/15 text-violet-300"
            : "text-slate-600 hover:bg-white/6 hover:text-slate-300"
        )}
      >
        <span className={cn("material-symbols-outlined text-[18px]", page.favorite && "filled")}>star</span>
      </button>
    </div>
  );
}

function PagesView({ mode }: { mode: "all" | "favorites" }) {
  const { pages } = useDocumentStore();
  const visible = pages.filter((page) => !page.deletedAt && (mode === "all" || page.favorite));

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-white/6 bg-slate-950/35 p-10 text-center">
        <p className="text-[15px] text-slate-400">
          {mode === "favorites" ? "No favorites yet." : "No pages yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {visible.map((page) => (
        <PageRow key={page.id} page={page} />
      ))}
    </div>
  );
}

function SearchView() {
  const { pages } = useDocumentStore();
  const [query, setQuery] = useState("");
  const results = pages.filter((page) => {
    if (page.deletedAt) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return page.title.toLowerCase().includes(q) || page.content.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        <span className="material-symbols-outlined pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[22px] text-slate-600">
          search
        </span>
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pages"
          className="h-14 w-full rounded-2xl border border-white/8 bg-slate-950/45 pl-14 pr-5 text-[18px] text-slate-100 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/45"
        />
      </div>
      <div className="grid gap-3">
        {results.map((page) => (
          <PageRow key={page.id} page={page} />
        ))}
      </div>
    </div>
  );
}

function TemplatesView() {
  const { createPage, updatePage, setActivePage } = useDocumentStore();
  const { setWorkspaceView } = useUIStore();

  const createFromTemplate = (template: (typeof TEMPLATE_DEFINITIONS)[number]) => {
    const id = createPage(template.title);
    updatePage(id, { title: template.title, content: template.content });
    setActivePage(id);
    setWorkspaceView("editor");
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {TEMPLATE_DEFINITIONS.map((template) => (
        <button
          type="button"
          key={template.id}
          onClick={() => createFromTemplate(template)}
          className="group min-h-48 rounded-2xl border border-white/6 bg-slate-950/40 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/25 hover:bg-white/[0.04]"
        >
          <span className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/12 text-violet-300 transition-colors group-hover:bg-violet-500/20">
            <span className="material-symbols-outlined text-[22px]">{template.icon}</span>
          </span>
          <p className="text-[16px] font-semibold text-slate-100">{template.label}</p>
          <p className="mt-2 text-[13px] leading-6 text-slate-500">{template.description}</p>
        </button>
      ))}
    </div>
  );
}

function SettingsView() {
  const { font, lineSpacing, spellCheck, setFont, setLineSpacing, setSpellCheck } = useSettingsStore();
  const fonts: { value: FontOption; label: string; preview: string }[] = [
    { value: "inter", label: "Inter", preview: "Quiet sans" },
    { value: "serif", label: "Georgia", preview: "Long-form serif" },
    { value: "mono", label: "System mono", preview: "Code and notes" },
  ];

  return (
    <div className="grid grid-cols-[1fr_360px] gap-6">
      <section className="rounded-2xl border border-white/6 bg-slate-950/35 p-6">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">Editor</p>
        <div className="grid gap-3">
          {fonts.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => setFont(option.value)}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 text-left transition-all",
                font === option.value
                  ? "border-violet-400/35 bg-violet-500/10"
                  : "border-white/6 bg-white/[0.02] hover:border-white/12"
              )}
            >
              <span className={`font-preview-${option.value} flex h-11 w-11 items-center justify-center rounded-lg bg-white/6 text-[18px] text-slate-200`}>
                Aa
              </span>
              <span className="flex-1">
                <span className="block text-[14px] font-semibold text-slate-200">{option.label}</span>
                <span className="mt-0.5 block text-[12px] text-slate-600">{option.preview}</span>
              </span>
              {font === option.value && (
                <span className="material-symbols-outlined text-[18px] text-violet-300 filled">check_circle</span>
              )}
            </button>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-white/6 bg-slate-950/35 p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate-300">Line spacing</span>
            <span className="text-[12px] text-violet-300">{lineSpacing}x</span>
          </div>
          <input
            type="range"
            min={1.5}
            max={2}
            step={0.25}
            value={lineSpacing}
            onChange={(event) => setLineSpacing(Number(event.target.value))}
            className="w-full"
          />
        </section>
        <section className="rounded-2xl border border-white/6 bg-slate-950/35 p-5">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span>
              <span className="block text-[13px] font-semibold text-slate-300">Spell check</span>
              <span className="mt-1 block text-[12px] text-slate-600">{spellCheck ? "Enabled" : "Disabled"}</span>
            </span>
            <input
              type="checkbox"
              checked={spellCheck}
              onChange={() => setSpellCheck(!spellCheck)}
              className="h-5 w-5 accent-violet-500"
            />
          </label>
        </section>
      </aside>
    </div>
  );
}

function HelpView() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {SHORTCUTS.map((item) => (
        <div key={item.key} className="rounded-2xl border border-white/6 bg-slate-950/35 p-5">
          <kbd className="inline-flex rounded-lg border border-white/8 bg-white/5 px-2.5 py-1 font-mono text-[12px] text-violet-200">
            {item.key}
          </kbd>
          <p className="mt-5 text-[14px] font-medium text-slate-300">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function TrashView() {
  const { pages, restorePage, permanentlyDeletePage } = useDocumentStore();
  const trashed = pages.filter((page) => page.deletedAt);

  if (trashed.length === 0) {
    return (
      <div className="rounded-2xl border border-white/6 bg-slate-950/35 p-10 text-center">
        <p className="text-[15px] text-slate-400">Trash is empty.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {trashed.map((page) => (
        <div
          key={page.id}
          className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl border border-white/6 bg-slate-950/35 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-slate-300">{page.title || "Untitled"}</p>
            <p className="mt-0.5 text-[12px] text-slate-600">Moved to trash</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => restorePage(page.id)}
              className="rounded-lg bg-white/6 px-3 py-2 text-[12px] font-semibold text-slate-300 transition-colors hover:bg-white/10"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={() => permanentlyDeletePage(page.id)}
              className="rounded-lg bg-red-500/10 px-3 py-2 text-[12px] font-semibold text-red-300 transition-colors hover:bg-red-500/20"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkspacePanel() {
  const { workspaceView } = useUIStore();

  if (workspaceView === "editor") return null;

  return (
    <SurfaceShell view={workspaceView}>
      {workspaceView === "search" && <SearchView />}
      {workspaceView === "pages" && <PagesView mode="all" />}
      {workspaceView === "favorites" && <PagesView mode="favorites" />}
      {workspaceView === "templates" && <TemplatesView />}
      {workspaceView === "settings" && <SettingsView />}
      {workspaceView === "help" && <HelpView />}
      {workspaceView === "trash" && <TrashView />}
    </SurfaceShell>
  );
}
