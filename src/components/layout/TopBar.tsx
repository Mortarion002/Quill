"use client";

import { useDocumentStore } from "@/store/useDocumentStore";
import { useUIStore } from "@/store/useUIStore";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const VIEW_TITLES: Record<string, string> = {
  search: "Search",
  pages: "Pages",
  favorites: "Favorites",
  templates: "Templates",
  settings: "Settings",
  help: "Help",
  trash: "Trash",
};

export function TopBar() {
  const { getActivePage, hasHydrated } = useDocumentStore();
  const { inspectorOpen, toggleInspector, workspaceView } = useUIStore();
  const activePage = hasHydrated ? getActivePage() : undefined;
  const title =
    workspaceView === "editor"
      ? activePage?.title || "Untitled Document"
      : VIEW_TITLES[workspaceView] || "Workspace";

  return (
    <header
      className={cn(
        "topbar-shell fixed top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/88 px-7 backdrop-blur-2xl transition-all duration-300",
        "left-68 right-0",
        inspectorOpen && "right-[340px]"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="truncate text-[15px] font-semibold text-slate-950">{title}</span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-4 border-r border-slate-200 pr-4">
          <button type="button" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950">
            Share
          </button>
          <button type="button" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950">
            Publish
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-950"
            title="History"
          >
            <Icon name="clock" className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={toggleInspector}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              inspectorOpen
                ? "bg-violet-50 text-violet-600"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-950"
            )}
            title="Toggle Inspector"
          >
            <Icon name="more" className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="ml-1 flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 transition-colors hover:border-slate-300">
          <Icon name="user" className="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </header>
  );
}
