"use client";

import { useDocumentStore } from "@/store/useDocumentStore";
import { useUIStore, type WorkspaceView } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS: {
  icon: string;
  label: string;
  view: WorkspaceView;
  count?: "pages" | "trash";
}[] = [
  { icon: "search", label: "Search", view: "search" },
  { icon: "description", label: "Pages", view: "pages", count: "pages" },
  { icon: "star", label: "Favorites", view: "favorites" },
  { icon: "dashboard_customize", label: "Templates", view: "templates" },
  { icon: "settings", label: "Settings", view: "settings" },
];

const FOOTER_ITEMS: {
  icon: string;
  label: string;
  view: WorkspaceView;
  count?: "trash";
}[] = [
  { icon: "help", label: "Help", view: "help" },
  { icon: "delete", label: "Trash", view: "trash", count: "trash" },
];

function NavButton({
  icon,
  label,
  view,
  count,
}: {
  icon: string;
  label: string;
  view: WorkspaceView;
  count?: number;
}) {
  const { workspaceView, setWorkspaceView } = useUIStore();
  const isActive = workspaceView === view;

  return (
    <button
      type="button"
      onClick={() => setWorkspaceView(view)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.25 rounded-lg text-sm transition-all duration-150",
        isActive
          ? "bg-white/10 text-white border-l-2 border-violet-500"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      )}
    >
      <span
        className={cn(
          "material-symbols-outlined text-[20px] shrink-0",
          isActive && "text-violet-400 filled"
        )}
      >
        {icon}
      </span>
      <span className="flex-1 text-left font-medium">{label}</span>
      {!!count && <span className="text-[11px] text-slate-600 tabular-nums">{count}</span>}
    </button>
  );
}

export function Sidebar() {
  const { pages, createPage } = useDocumentStore();
  const { setWorkspaceView } = useUIStore();
  const liveCount = pages.filter((page) => !page.deletedAt).length;
  const trashCount = pages.filter((page) => page.deletedAt).length;

  const resolveCount = (count?: "pages" | "trash") => {
    if (count === "pages") return liveCount;
    if (count === "trash") return trashCount;
    return undefined;
  };

  const handleNewPage = () => {
    createPage("Untitled");
    setWorkspaceView("editor");
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-65 flex-col border-r border-white/5 bg-slate-950/60 backdrop-blur-xl sidebar-glow">
      <div className="px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => setWorkspaceView("editor")}
          className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface-container-high">
            <span className="material-symbols-outlined filled text-[22px] text-violet-400">pentagon</span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[15px] font-bold leading-snug text-slate-100">
              Intellect Workspace
            </span>
            <span className="truncate text-[11px] text-slate-500">Local writing space</span>
          </div>
        </button>
      </div>

      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={handleNewPage}
          className="new-page-btn-glow flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Page
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 px-4 pb-2">
        {NAV_ITEMS.map((item) => (
          <NavButton key={item.view} {...item} count={resolveCount(item.count)} />
        ))}
      </nav>

      <div className="mx-4 border-t border-white/5" />
      <div className="flex-1 min-h-0" />

      <nav className="flex flex-col gap-0.5 border-t border-white/5 px-4 pt-3 pb-4">
        {FOOTER_ITEMS.map((item) => (
          <NavButton key={item.view} {...item} count={resolveCount(item.count)} />
        ))}
      </nav>
    </aside>
  );
}
