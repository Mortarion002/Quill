"use client";

import { useEffect, useState } from "react";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useUIStore } from "@/store/useUIStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Inspector } from "@/components/layout/Inspector";
import { EmptyState } from "@/components/editor/EmptyState";
import { DocumentTitle } from "@/components/editor/DocumentTitle";
import { cn } from "@/lib/utils";

function EditorSkeleton() {
  return (
    <div className="ml-[260px] pt-14 min-h-screen flex justify-center">
      <div className="w-full max-w-[720px] px-8 pt-24 pb-32">
        <div className="h-16 w-2/3 bg-surface-container-high rounded-xl animate-pulse mb-8" />
        <div className="space-y-3">
          {[80, 95, 70, 88].map((w, i) => (
            <div
              key={i}
              className="h-4 bg-surface-container rounded-lg animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  const { pages, activePageId, createPage, hasHydrated } = useDocumentStore();
  const { inspectorOpen } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && pages.length === 0) {
      createPage("Untitled");
    }
  }, [hasHydrated, pages.length, createPage]);

  const activePage = pages.find((p) => p.id === activePageId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0b0b0f" }}>
      <Sidebar />
      <TopBar />
      <Inspector />

      {/* ─── Canvas ─── */}
      <main
        className={cn(
          "transition-all duration-300 ease-in-out ml-[260px] pt-14 min-h-screen",
          inspectorOpen && "mr-[320px]"
        )}
      >
        {!mounted || !hasHydrated ? (
          <EditorSkeleton />
        ) : !activePage ? (
          <EditorSkeleton />
        ) : activePage.content ? (
          /* ─── Page with content ─── */
          <div className="flex justify-center">
            <div className="w-full max-w-[720px] px-8 pt-24 pb-32">
              <DocumentTitle
                pageId={activePage.id}
                title={activePage.title}
              />
              <div className="mt-8 space-y-1 text-on-surface-variant text-lg leading-relaxed">
                {activePage.content.split("\n").map((line, i) =>
                  line.trim() ? (
                    <p key={i}>{line}</p>
                  ) : (
                    <div key={i} className="h-4" />
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ─── Empty state ─── */
          <EmptyState pageId={activePage.id} />
        )}
      </main>
    </div>
  );
}
