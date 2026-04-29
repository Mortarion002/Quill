"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useUIStore } from "@/store/useUIStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Inspector } from "@/components/layout/Inspector";
import { WorkspacePanel } from "@/components/layout/WorkspacePanel";
import { CloudDocumentSync } from "@/components/sync/CloudDocumentSync";
import { EmptyState } from "@/components/editor/EmptyState";
import { DocumentTitle } from "@/components/editor/DocumentTitle";
import { Editor } from "@/components/editor/Editor";
import { cn } from "@/lib/utils";

const FONT_MAP = {
  inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", ui-serif, serif',
  mono: 'ui-monospace, "Cascadia Code", monospace',
} as const;

/* Applies font + line-height settings to CSS custom properties on :root */
function SettingsApplier() {
  const { font, lineSpacing } = useSettingsStore();

  useEffect(() => {
    document.documentElement.style.setProperty("--editor-font", FONT_MAP[font]);
    document.documentElement.style.setProperty("--editor-line-height", String(lineSpacing));
    document.documentElement.dataset.theme = "light";
    document.documentElement.classList.remove("dark");
  }, [font, lineSpacing]);

  return null;
}

/* ─── Skeleton shown before hydration ─── */
function EditorSkeleton() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-180 px-8 pt-24 pb-32">
        <div className="h-16 w-3/5 bg-slate-100 rounded-xl animate-pulse mb-10" />
        <div className="space-y-3">
          {[78, 92, 65, 85, 55].map((w, i) => (
            <div
              key={i}
              className="h-4.5 bg-slate-100 rounded-lg animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 70}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Document canvas (title + editor) ─── */
function DocumentCanvas({
  pageId,
  title,
  emoji,
  content,
}: {
  pageId: string;
  title: string;
  emoji?: string;
  content: string;
}) {
  return (
    <motion.div
      key={pageId}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex justify-center"
    >
      <div className="w-full max-w-180 px-8 pt-24 pb-40">
        <DocumentTitle pageId={pageId} title={title} emoji={emoji} />
        <div className="mt-8 relative">
          <Editor pageId={pageId} initialContent={content} />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main page ─── */
export default function EditorPage() {
  const { pages, activePageId, createPage, hasHydrated } = useDocumentStore();
  const { inspectorOpen, workspaceView } = useUIStore();
  const [activatedPages, setActivatedPages] = useState<Set<string>>(new Set());
  const livePageCount = pages.reduce((count, page) => count + (page.deletedAt ? 0 : 1), 0);

  useEffect(() => {
    if (hasHydrated && livePageCount === 0) {
      createPage("Untitled");
    }
  }, [hasHydrated, livePageCount, createPage]);

  const activePage = pages.find((p) => p.id === activePageId && !p.deletedAt);
  const isEditorActive =
    !!activePage?.content || activatedPages.has(activePageId ?? "");

  const activatePage = () => {
    if (!activePageId) return;
    setActivatedPages((prev) => new Set([...prev, activePageId]));
  };

  return (
    <div className="app-frame min-h-screen bg-[radial-gradient(circle_at_8%_8%,rgba(139,92,246,0.12),transparent_28%),radial-gradient(circle_at_92%_92%,rgba(251,207,232,0.45),transparent_32%),#ececf4]">
      <SettingsApplier />
      <CloudDocumentSync />
      <Sidebar />
      <TopBar />
      <Inspector />

      <main
        className={cn(
          "main-shell ml-68 min-h-screen border-l-0 border-white/80 bg-white/92 pt-16 shadow-[0_24px_70px_rgba(79,70,120,0.14)] transition-all duration-300 ease-in-out",
          inspectorOpen && "mr-[340px]"
        )}
      >
        <AnimatePresence>
          {workspaceView !== "editor" ? (
            <WorkspacePanel key={workspaceView} />
          ) : !hasHydrated || !activePage ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EditorSkeleton />
            </motion.div>
          ) : isEditorActive ? (
            <DocumentCanvas
              key={activePage.id}
              pageId={activePage.id}
              title={activePage.title}
              emoji={activePage.emoji}
              content={activePage.content}
            />
          ) : (
            <motion.div
              key={`empty-${activePage.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <EmptyState pageId={activePage.id} onActivate={activatePage} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
