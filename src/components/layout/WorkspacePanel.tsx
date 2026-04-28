"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useSettingsStore, type FontOption } from "@/store/useSettingsStore";
import { useUIStore, type WorkspaceView } from "@/store/useUIStore";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const TEMPLATE_DEFINITIONS = [
  {
    id: "meeting",
    icon: "user",
    label: "Meeting Notes",
    description: "Agenda, decisions, and action items in one calm structure.",
    title: "Meeting Notes",
    content:
      "<h2>Meeting Notes</h2><p>Date: </p><p>Attendees: </p><h2>Agenda</h2><p></p><h2>Action Items</h2><p></p><h2>Decisions</h2><p></p>",
  },
  {
    id: "brainstorm",
    icon: "spark",
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

const VIEW_META: Record<
  Exclude<WorkspaceView, "editor">,
  { title: string; eyebrow: string; icon: Parameters<typeof Icon>[0]["name"] }
> = {
  search: { title: "Search", eyebrow: "Find your thinking", icon: "search" },
  pages: { title: "Pages", eyebrow: "Document library", icon: "note" },
  favorites: { title: "Favorites", eyebrow: "Pinned work", icon: "star" },
  templates: { title: "Templates", eyebrow: "Starting points", icon: "grid" },
  settings: { title: "Settings", eyebrow: "Workspace preferences", icon: "settings" },
  help: { title: "Help", eyebrow: "Reference", icon: "help" },
  trash: { title: "Trash", eyebrow: "Recover or remove pages", icon: "trash" },
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
      className="mx-auto w-full max-w-6xl px-10 pt-24 pb-24"
    >
      <div className="mb-8 flex items-end justify-between gap-6 border-b border-slate-100 pb-7">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            <Icon name={meta.icon} className="h-4 w-4 text-violet-500" />
            {meta.eyebrow}
          </div>
          <h1 className="text-[38px] font-bold leading-none tracking-normal text-slate-950">
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
}: {
  page: ReturnType<typeof useDocumentStore.getState>["pages"][number];
}) {
  const { setActivePage, toggleFavorite, deletePage } = useDocumentStore();
  const { setWorkspaceView } = useUIStore();

  const openPage = () => {
    setActivePage(page.id);
    setWorkspaceView("editor");
  };

  return (
    <div className="group grid grid-cols-[1fr_auto] gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-all duration-150 hover:border-violet-100 hover:shadow-md">
      <button type="button" onClick={openPage} className="min-w-0 text-left">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-violet-500">
            {page.emoji || <Icon name="note" className="h-4.5 w-4.5" />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-slate-950">{page.title || "Untitled"}</p>
            <p className="mt-0.5 text-[12px] text-slate-400">
              Updated {new Date(page.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </button>
      <div className="flex items-center gap-1">
        <button
          type="button"
          title={page.favorite ? "Remove from favorites" : "Add to favorites"}
          onClick={() => toggleFavorite(page.id)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
            page.favorite ? "bg-violet-50 text-violet-600" : "text-slate-300 hover:bg-slate-50 hover:text-slate-600"
          )}
        >
          <Icon name="star" className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          title="Move to trash"
          onClick={() => deletePage(page.id)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Icon name="trash" className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}

function PagesView({ mode }: { mode: "all" | "favorites" }) {
  const { pages } = useDocumentStore();
  const visible = pages.filter((page) => !page.deletedAt && (mode === "all" || page.favorite));

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
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
        <Icon name="search" className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pages"
          className="h-13 w-full rounded-2xl border border-slate-200 bg-white pl-13 pr-5 text-[15px] text-slate-950 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-violet-300"
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
          className="group min-h-44 rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-100 hover:shadow-md"
        >
          <span className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-100">
            <Icon name={template.icon} className="h-5 w-5" />
          </span>
          <p className="text-[16px] font-semibold text-slate-950">{template.label}</p>
          <p className="mt-2 text-[13px] leading-6 text-slate-500">{template.description}</p>
        </button>
      ))}
    </div>
  );
}

function SettingsView() {
  const { font, lineSpacing, spellCheck, setFont, setLineSpacing, setSpellCheck } = useSettingsStore();
  const { cloudStatus, cloudMessage, lastSyncedAt } = useDocumentStore();
  const fonts: { value: FontOption; label: string; preview: string }[] = [
    { value: "inter", label: "Inter", preview: "Quiet sans" },
    { value: "serif", label: "Georgia", preview: "Long-form serif" },
    { value: "mono", label: "System mono", preview: "Code and notes" },
  ];
  const previewFontClass = `font-preview-${font}`;
  const formattedLineSpacing = lineSpacing.toFixed(2).replace(/\.00$/, "");
  const cloudLabel =
    cloudStatus === "synced"
      ? "Cloud saved"
      : cloudStatus === "syncing"
        ? "Syncing"
        : cloudStatus === "loading"
          ? "Loading cloud"
          : cloudStatus === "error"
            ? "Needs attention"
            : cloudStatus === "setup"
              ? "Setup needed"
              : "Local mode";
  const cloudDescription =
    cloudStatus === "synced"
      ? lastSyncedAt
        ? `Last synced ${new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        : "Cloud sync is ready."
      : cloudMessage ?? "Sign in to sync this workspace across devices.";

  return (
    <div className="grid grid-cols-[1fr_340px] gap-6">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Editor</p>
        <div className="grid gap-3">
          {fonts.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => setFont(option.value)}
              className={cn(
                "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                font === option.value
                  ? "border-violet-200 bg-violet-50"
                  : "border-slate-100 bg-white hover:border-slate-200"
              )}
            >
              <span className={`font-preview-${option.value} flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-[18px] text-slate-900`}>
                Aa
              </span>
              <span className="flex-1">
                <span className="block text-[14px] font-semibold text-slate-950">{option.label}</span>
                <span className="mt-0.5 block text-[12px] text-slate-400">{option.preview}</span>
              </span>
              {font === option.value && <Icon name="check" className="h-5 w-5 text-violet-600" />}
            </button>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Cloud</p>
              <p className="mt-3 text-[15px] font-bold text-slate-950">{cloudLabel}</p>
              <p className="mt-1 text-[12px] leading-5 text-slate-400">{cloudDescription}</p>
            </div>
            <span
              className={cn(
                "mt-1 h-2.5 w-2.5 rounded-full",
                cloudStatus === "synced" && "bg-emerald-400",
                cloudStatus === "syncing" && "bg-violet-500",
                cloudStatus === "loading" && "bg-slate-300",
                cloudStatus === "error" && "bg-red-400",
                (cloudStatus === "local" || cloudStatus === "setup") && "bg-slate-300"
              )}
            />
          </div>
        </section>
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Preview</p>
          <div className={cn("rounded-2xl bg-slate-50 p-4 text-slate-950", previewFontClass)}>
            <p className="text-[18px] font-bold">A calmer page starts here.</p>
            <p className="mt-2 text-[14px] text-slate-500" style={{ lineHeight: lineSpacing }}>
              Font and spacing changes now apply to the editor canvas, page title, lists, and quote blocks.
            </p>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate-950">Line spacing</span>
            <span className="text-[12px] font-semibold text-violet-600">{formattedLineSpacing}x</span>
          </div>
          <input
            type="range"
            min={1.25}
            max={2.25}
            step={0.05}
            value={lineSpacing}
            onChange={(event) => setLineSpacing(Number(event.target.value))}
            className="w-full"
            aria-label="Editor line spacing"
          />
        </section>
        <button
          type="button"
          onClick={() => setSpellCheck(!spellCheck)}
          className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:border-violet-100"
        >
          <span>
            <span className="block text-[13px] font-semibold text-slate-950">Spell check</span>
            <span className="mt-1 block text-[12px] text-slate-400">{spellCheck ? "Enabled" : "Disabled"}</span>
          </span>
          <span
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors",
              spellCheck ? "bg-violet-600" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
                spellCheck ? "right-1" : "left-1"
              )}
            />
          </span>
        </button>
      </aside>
    </div>
  );
}

function HelpView() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {SHORTCUTS.map((item) => (
        <div key={item.key} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <kbd className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[12px] text-slate-700">
            {item.key}
          </kbd>
          <p className="mt-5 text-[14px] font-medium text-slate-700">{item.label}</p>
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
      <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
        <p className="text-[15px] text-slate-400">Trash is empty.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {trashed.map((page) => (
        <div
          key={page.id}
          className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
        >
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-slate-950">{page.title || "Untitled"}</p>
            <p className="mt-0.5 text-[12px] text-slate-400">Moved to trash</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => restorePage(page.id)}
              className="rounded-xl bg-slate-100 px-3 py-2 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={() => permanentlyDeletePage(page.id)}
              className="rounded-xl bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-500 transition-colors hover:bg-red-100"
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
