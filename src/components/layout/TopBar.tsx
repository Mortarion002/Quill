"use client";

import { useDocumentStore } from "@/store/useDocumentStore";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { getActivePage } = useDocumentStore();
  const { inspectorOpen, toggleInspector } = useUIStore();
  const activePage = getActivePage();

  return (
    <header
      className={cn(
        "fixed top-0 h-14 border-b border-white/5 z-40 bg-slate-950/60 backdrop-blur-[24px] flex items-center justify-between px-6 transition-all duration-300",
        "left-[260px]",
        inspectorOpen ? "right-[320px]" : "right-0"
      )}
    >
      {/* ─── Left: Title ─── */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[15px] font-semibold text-slate-200 truncate">
          {activePage?.title || "Untitled Document"}
        </span>
      </div>

      {/* ─── Right: Actions ─── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Text links */}
        <div className="flex items-center gap-4 pr-4 border-r border-white/5">
          <button className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
            Share
          </button>
          <button className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
            Publish
          </button>
        </div>

        {/* Icon buttons */}
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-[20px]">history</span>
          </button>
          <button
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
