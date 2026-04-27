"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useUIStore } from "@/store/useUIStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Inspector } from "@/components/layout/Inspector";
import { EmptyState } from "@/components/editor/EmptyState";
import { DocumentTitle } from "@/components/editor/DocumentTitle";
import { Editor } from "@/components/editor/Editor";
import { cn } from "@/lib/utils";

/* ─── Skeleton shown before hydration ─── */
function EditorSkeleton() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-180 px-8 pt-24 pb-32">
        <div className="h-16 w-3/5 bg-surface-container-high rounded-xl animate-pulse mb-10" />
        <div className="space-y-3">
          {[78, 92, 65, 85, 55].map((w, i) => (
            <div
              key={i}
              className="h-4.5 bg-surface-container rounded-lg animate-pulse"
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
  content,
}: {
  pageId: string;
  title: string;
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
        <DocumentTitle pageId={pageId} title={title} />
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
  const { inspectorOpen } = useUIStore();
  const [mounted, setMounted] = useState(false);
  const [activatedPages, setActivatedPages] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && pages.length === 0) {
      createPage("Untitled");
    }
  }, [hasHydrated, pages.length, createPage]);

  const activePage = pages.find((p) => p.id === activePageId);
  const isEditorActive =
    !!activePage?.content || activatedPages.has(activePageId ?? "");

  const activatePage = () => {
    if (!activePageId) return;
    setActivatedPages((prev) => new Set([...prev, activePageId]));
  };

  return (
    <div className="min-h-screen bg-void">
      <Sidebar />
      <TopBar />
      <Inspector />

      <main
        className={cn(
          "transition-all duration-300 ease-in-out ml-65 pt-14 min-h-screen",
          inspectorOpen && "mr-80"
        )}
      >
        <AnimatePresence mode="wait">
          {!mounted || !hasHydrated || !activePage ? (
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
