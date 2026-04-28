"use client";

import { useDocumentStore } from "@/store/useDocumentStore";
import { useUIStore } from "@/store/useUIStore";
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
        "fixed top-0 h-14 border-b border-white/5 z-40 bg-slate-950/60 backdrop-blur-xl flex items-center justify-between px-6 transition-all duration-300",
        "left-65",
        inspectorOpen ? "right-80" : "right-0"
      )}
    >
      {/* ─── Left: Title ─── */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[15px] font-semibold text-slate-200 truncate">
          {title}
        </span>
      </div>

      {/* ─── Right: Actions ─── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Text links */}
        <div className="flex items-center gap-4 pr-4 border-r border-white/5">
          <button type="button" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
            Share
          </button>
          <button type="button" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
            Publish
          </button>
        </div>

        {/* Icon buttons */}
        <div className="flex items-center gap-1">
          <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-[20px]">history</span>
          </button>
          <button type="button"
            onClick={toggleInspector}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
              inspectorOpen
                ? "text-violet-400 bg-violet-500/10"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
            title="Toggle Inspector"
          >
            <span className="material-symbols-outlined text-[20px]">
              more_horiz
            </span>
          </button>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center overflow-hidden ml-1 cursor-pointer hover:border-white/20 transition-colors">
          <span className="material-symbols-outlined text-[16px] text-slate-400">
            person
          </span>
        </div>
      </div>
    </header>
  );
}
