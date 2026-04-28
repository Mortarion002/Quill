"use client";

import { useDocumentStore } from "@/store/useDocumentStore";
import { useUIStore } from "@/store/useUIStore";
import { SupabaseAuthControl } from "@/components/auth/SupabaseAuthControl";
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
        <span className="hidden rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[12px] font-semibold text-slate-500 shadow-sm sm:inline-flex">
          Saved locally
        </span>
        <button
          type="button"
          onClick={toggleInspector}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[13px] font-semibold transition-all",
            inspectorOpen
              ? "border-violet-200 bg-violet-50 text-violet-700 shadow-sm"
              : "border-slate-200 bg-white/70 text-slate-500 hover:border-slate-300 hover:text-slate-950"
          )}
        >
          <Icon name="settings" className="h-4 w-4" />
          Inspector
        </button>
        <SupabaseAuthControl surface="topbar" />
      </div>
    </header>
  );
}
