"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { useDocumentStore } from "@/store/useDocumentStore";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const TABS = ["Design", "Config", "Meta"] as const;
type Tab = (typeof TABS)[number];

const TAB_ICONS: Record<Tab, IconName> = {
  Design: "spark",
  Config: "settings",
  Meta: "note",
};

const BLOCK_LABELS: Record<string, string> = {
  paragraph: "Paragraph",
  heading: "Heading",
  bulletList: "Bullet List",
  orderedList: "Numbered List",
  blockquote: "Quote",
  codeBlock: "Code Block",
  horizontalRule: "Divider",
};

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
      {children}
    </p>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2">
      <span className="text-[12px] text-slate-400">{label}</span>
      <span className="max-w-34 truncate text-right text-[12px] font-semibold tabular-nums text-slate-700">
        {value}
      </span>
    </div>
  );
}

function InspectorInput({ label, value }: { label: string; value: string }) {
  return (
    <label className="space-y-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>
      <input
        type="text"
        defaultValue={value}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-800 shadow-sm outline-none transition-colors focus:border-violet-300"
      />
    </label>
  );
}

export function Inspector() {
  const { inspectorOpen, setInspectorOpen, activeBlockId, activeEditor, docStats } = useUIStore();
  const { getActivePage } = useDocumentStore();
  const [activeTab, setActiveTab] = useState<Tab>("Design");
  const [blurValue, setBlurValue] = useState(24);
  const [shadowOn, setShadowOn] = useState(true);

  const activePage = getActivePage();
  const e = activeEditor;

  const headingLevel = e?.isActive("heading", { level: 1 })
    ? 1
    : e?.isActive("heading", { level: 2 })
      ? 2
      : e?.isActive("heading", { level: 3 })
        ? 3
        : null;

  const isHeading = headingLevel !== null;
  const blockLabel = isHeading
    ? `Heading ${headingLevel}`
    : (BLOCK_LABELS[activeBlockId ?? ""] ?? "No selection");

  const align = e?.isActive({ textAlign: "center" })
    ? "center"
    : e?.isActive({ textAlign: "right" })
      ? "right"
      : "left";

  return (
    <AnimatePresence>
      {inspectorOpen && (
        <motion.aside
          key="inspector"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="fixed right-0 top-0 z-40 flex h-screen w-80 flex-col border-l border-slate-200 bg-[#f5f6fb]/92 shadow-[-24px_0_60px_rgba(79,70,120,0.12)] backdrop-blur-2xl"
        >
          <div className="flex items-start justify-between border-b border-slate-200/80 px-6 pb-5 pt-20">
            <div>
              <h3 className="text-[18px] font-extrabold leading-tight text-slate-950">Inspector</h3>
              <div className="mt-1.5 flex items-center gap-2 text-[12px] font-medium text-slate-500">
                <Icon name={isHeading ? "type" : "note"} className="h-4 w-4 text-violet-500" />
                {blockLabel}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInspectorOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:text-slate-950"
              aria-label="Close inspector"
            >
              x
            </button>
          </div>

          <div className="flex gap-2 border-b border-slate-200/80 px-5 py-3">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-all",
                  activeTab === tab
                    ? "bg-white text-violet-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-400 hover:bg-white/60 hover:text-slate-700"
                )}
              >
                <Icon name={TAB_ICONS[tab]} className="h-3.5 w-3.5" />
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
            {activeTab === "Design" && (
              <>
                <section className="space-y-3">
                  <SectionLabel>Dimensions</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <InspectorInput label="Width" value="100%" />
                    <InspectorInput label="Height" value="Auto" />
                  </div>
                </section>

                <div className="border-t border-slate-200/80" />

                <section className="space-y-4">
                  <SectionLabel>Effects</SectionLabel>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-slate-500">Blur</span>
                      <span className="text-[12px] font-semibold tabular-nums text-slate-800">
                        {blurValue}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={blurValue}
                      onChange={(ev) => setBlurValue(Number(ev.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-slate-500">Soft shadow</span>
                    <button
                      type="button"
                      title="Toggle shadow"
                      onClick={() => setShadowOn((v) => !v)}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors duration-200",
                        shadowOn ? "bg-violet-600" : "bg-slate-200"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200",
                          shadowOn ? "right-1" : "left-1"
                        )}
                      />
                    </button>
                  </div>
                </section>

                <div className="border-t border-slate-200/80" />

                <section className="space-y-3">
                  <SectionLabel>Typography</SectionLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => e?.chain().focus().setParagraph().run()}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors",
                        !isHeading
                          ? "border-violet-200 bg-violet-50 text-violet-700"
                          : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                      )}
                    >
                      Body
                    </button>
                    <button
                      type="button"
                      onClick={() => e?.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors",
                        isHeading
                          ? "border-violet-200 bg-violet-50 text-violet-700"
                          : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                      )}
                    >
                      Heading
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                    {(["left", "center", "right"] as const).map((value) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => e?.chain().focus().setTextAlign(value).run()}
                        className={cn(
                          "rounded-lg py-1.5 text-[12px] font-semibold capitalize transition-colors",
                          align === value ? "bg-slate-100 text-slate-950" : "text-slate-400 hover:text-slate-700"
                        )}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {activeTab === "Config" && (
              e ? (
                <>
                  <section className="space-y-3">
                    <SectionLabel>Block Type</SectionLabel>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <Icon name={isHeading ? "type" : "note"} className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-slate-950">{blockLabel}</p>
                        <p className="text-[11px] text-slate-400">{activeBlockId ?? "No block selected"}</p>
                      </div>
                    </div>
                  </section>

                  {isHeading && (
                    <>
                      <div className="border-t border-slate-200/80" />
                      <section className="space-y-3">
                        <SectionLabel>Level</SectionLabel>
                        <div className="flex gap-2">
                          {([1, 2, 3] as const).map((lvl) => (
                            <button
                              type="button"
                              key={lvl}
                              onClick={() => e.chain().focus().toggleHeading({ level: lvl }).run()}
                              className={cn(
                                "flex-1 rounded-xl border py-2.5 text-xs font-bold transition-colors",
                                headingLevel === lvl
                                  ? "border-violet-200 bg-violet-50 text-violet-700"
                                  : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                              )}
                            >
                              H{lvl}
                            </button>
                          ))}
                        </div>
                      </section>
                    </>
                  )}

                  <div className="border-t border-slate-200/80" />

                  <section className="space-y-2">
                    <SectionLabel>Convert to</SectionLabel>
                    {[
                      { id: "p", label: "Paragraph", action: () => e.chain().focus().setParagraph().run() },
                      { id: "h1", label: "Heading 1", action: () => e.chain().focus().toggleHeading({ level: 1 }).run() },
                      { id: "h2", label: "Heading 2", action: () => e.chain().focus().toggleHeading({ level: 2 }).run() },
                      { id: "ul", label: "Bullet List", action: () => e.chain().focus().toggleBulletList().run() },
                      { id: "quote", label: "Quote", action: () => e.chain().focus().toggleBlockquote().run() },
                    ].map(({ id, label, action }) => (
                      <button
                        type="button"
                        key={id}
                        onClick={action}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-slate-500 transition-colors hover:bg-white hover:text-slate-950"
                      >
                        <Icon name="type" className="h-4 w-4 text-slate-400" />
                        {label}
                      </button>
                    ))}
                  </section>
                </>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                  <Icon name="note" className="h-7 w-7 text-slate-300" />
                  <p className="text-sm text-slate-400">Click inside the editor to select a block.</p>
                </div>
              )
            )}

            {activeTab === "Meta" && (
              <>
                <section className="space-y-1">
                  <SectionLabel>Document Stats</SectionLabel>
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm">
                    <StatRow label="Words" value={formatNumber(docStats.words)} />
                    <StatRow label="Characters" value={formatNumber(docStats.chars)} />
                    <StatRow label="Blocks" value={formatNumber(docStats.blocks)} />
                  </div>
                </section>

                <section className="space-y-1">
                  <SectionLabel>Timestamps</SectionLabel>
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm">
                    <StatRow label="Created" value={activePage ? formatDate(activePage.createdAt) : "-"} />
                    <StatRow label="Modified" value={activePage ? timeAgo(activePage.updatedAt) : "-"} />
                  </div>
                </section>

                <section className="space-y-1">
                  <SectionLabel>Page</SectionLabel>
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm">
                    <StatRow label="Title" value={activePage?.title ?? "Untitled"} />
                    <StatRow label="ID" value={activePage?.id.slice(0, 8) ?? "-"} />
                  </div>
                </section>
              </>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
