"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { useDocumentStore } from "@/store/useDocumentStore";
import { cn } from "@/lib/utils";

const TABS = ["Design", "Config", "Meta"] as const;
type Tab = (typeof TABS)[number];

const TAB_ICONS: Record<Tab, string> = {
  Design: "palette",
  Config: "settings_input_component",
  Meta: "database",
};

const BLOCK_LABELS: Record<string, string> = {
  paragraph:      "Paragraph",
  heading:        "Heading",
  bulletList:     "Bullet List",
  orderedList:    "Numbered List",
  blockquote:     "Quote",
  codeBlock:      "Code Block",
  horizontalRule: "Divider",
};

const BLOCK_ICONS: Record<string, string> = {
  paragraph:      "notes",
  heading:        "title",
  bulletList:     "format_list_bulleted",
  orderedList:    "format_list_numbered",
  blockquote:     "format_quote",
  codeBlock:      "code",
  horizontalRule: "horizontal_rule",
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
    <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">
      {children}
    </p>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
      <span className="text-[12px] text-slate-500">{label}</span>
      <span className="text-[12px] text-slate-300 font-medium tabular-nums">{value}</span>
    </div>
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
  const blockIcon = isHeading
    ? "title"
    : (BLOCK_ICONS[activeBlockId ?? ""] ?? "ads_click");

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
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="fixed right-0 top-0 w-80 h-screen border-l border-white/5 bg-slate-950/60 backdrop-blur-xl z-40 flex flex-col inspector-shadow"
        >
          {/* ─── Header ─── */}
          <div className="px-6 pt-20 pb-5 border-b border-white/5 flex items-start justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm leading-tight mb-1">
                Inspector
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[13px] text-violet-400">
                  {blockIcon}
                </span>
                <p className="text-slate-500 text-xs">{blockLabel}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInspectorOpen(false)}
              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors mt-0.5"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* ─── Tabs ─── */}
          <div className="flex px-6 pt-1 gap-5 border-b border-white/5">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 pt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold border-b-2 transition-all",
                  activeTab === tab
                    ? "border-violet-500 text-white"
                    : "border-transparent text-slate-600 hover:text-slate-400"
                )}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {TAB_ICONS[tab]}
                </span>
                {tab}
              </button>
            ))}
          </div>

          {/* ─── Content ─── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

            {/* ══ DESIGN ══ */}
            {activeTab === "Design" && (
              <>
                <section className="space-y-3">
                  <SectionLabel>Dimensions</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "W", icon: "width",  value: "100%" },
                      { label: "H", icon: "height", value: "Auto" },
                    ].map(({ label, icon, value }) => (
                      <div key={label} className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">{icon}</span>
                          {label}
                        </span>
                        <input
                          type="text"
                          defaultValue={value}
                          className="w-full bg-surface-container-high border border-white/8 rounded-lg px-3 py-2 text-white text-xs focus:border-primary-container focus:outline-none transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <div className="border-t border-white/5" />

                <section className="space-y-4">
                  <SectionLabel>Effects</SectionLabel>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[13px]">blur_on</span>
                        Blur
                      </span>
                      <span className="text-[11px] text-white tabular-nums">{blurValue}px</span>
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
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[13px]">shadow</span>
                      Drop Shadow
                    </span>
                    <button
                      type="button"
                      title="Toggle drop shadow"
                      onClick={() => setShadowOn((v) => !v)}
                      className={cn(
                        "w-9 h-5 rounded-full relative transition-colors duration-200",
                        shadowOn ? "bg-violet-600" : "bg-surface-container-highest"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
                          shadowOn ? "right-0.5" : "left-0.5"
                        )}
                      />
                    </button>
                  </div>
                </section>

                <div className="border-t border-white/5" />

                <section className="space-y-3">
                  <SectionLabel>Typography</SectionLabel>

                  {/* Body / Heading */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => e?.chain().focus().setParagraph().run()}
                      className={cn(
                        "py-2 rounded-lg text-xs font-medium border transition-colors",
                        !isHeading
                          ? "bg-surface-container-high border-white/10 text-slate-200"
                          : "bg-transparent border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-400"
                      )}
                    >
                      Body
                    </button>
                    <button
                      type="button"
                      onClick={() => e?.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={cn(
                        "py-2 rounded-lg text-xs font-medium border transition-colors",
                        isHeading
                          ? "bg-surface-container-high border-white/10 text-slate-200"
                          : "bg-transparent border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-400"
                      )}
                    >
                      Heading
                    </button>
                  </div>

                  {/* Alignment */}
                  <div className="flex gap-1.5 bg-surface-container-high rounded-lg p-1 border border-white/5">
                    {(
                      [
                        { value: "left",   icon: "format_align_left"   },
                        { value: "center", icon: "format_align_center" },
                        { value: "right",  icon: "format_align_right"  },
                      ] as const
                    ).map(({ value, icon }) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => e?.chain().focus().setTextAlign(value).run()}
                        className={cn(
                          "flex-1 py-1.5 rounded-md flex items-center justify-center transition-colors",
                          align === value
                            ? "bg-surface-container-highest text-slate-200 shadow-sm"
                            : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        <span className="material-symbols-outlined text-[16px]">{icon}</span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* ══ CONFIG ══ */}
            {activeTab === "Config" && (
              e ? (
                <>
                  <section className="space-y-3">
                    <SectionLabel>Block Type</SectionLabel>
                    <div className="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl border border-white/5">
                      <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px] text-violet-400">
                          {blockIcon}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-slate-200">{blockLabel}</p>
                        <p className="text-[11px] text-slate-600">{activeBlockId ?? "—"}</p>
                      </div>
                    </div>
                  </section>

                  {isHeading && (
                    <>
                      <div className="border-t border-white/5" />
                      <section className="space-y-3">
                        <SectionLabel>Level</SectionLabel>
                        <div className="flex gap-2">
                          {([1, 2, 3] as const).map((lvl) => (
                            <button
                              type="button"
                              key={lvl}
                              onClick={() => e.chain().focus().toggleHeading({ level: lvl }).run()}
                              className={cn(
                                "flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors",
                                headingLevel === lvl
                                  ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                                  : "bg-transparent border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-400"
                              )}
                            >
                              H{lvl}
                            </button>
                          ))}
                        </div>
                      </section>
                    </>
                  )}

                  <div className="border-t border-white/5" />

                  <section className="space-y-2">
                    <SectionLabel>Convert to</SectionLabel>
                    <div className="flex flex-col gap-1">
                      {[
                        { id: "p",     label: "Paragraph",   icon: "notes",                action: () => e.chain().focus().setParagraph().run()              },
                        { id: "h1",    label: "Heading 1",   icon: "title",                action: () => e.chain().focus().toggleHeading({ level: 1 }).run() },
                        { id: "h2",    label: "Heading 2",   icon: "title",                action: () => e.chain().focus().toggleHeading({ level: 2 }).run() },
                        { id: "ul",    label: "Bullet List", icon: "format_list_bulleted", action: () => e.chain().focus().toggleBulletList().run()          },
                        { id: "quote", label: "Quote",       icon: "format_quote",         action: () => e.chain().focus().toggleBlockquote().run()          },
                      ].map(({ id, label, icon, action }) => (
                        <button
                          type="button"
                          key={id}
                          onClick={action}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors text-left"
                        >
                          <span className="material-symbols-outlined text-[15px]">{icon}</span>
                          <span className="text-[12px] font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <span className="material-symbols-outlined text-[32px] text-slate-700">
                    ads_click
                  </span>
                  <p className="text-slate-600 text-sm text-center">
                    Click inside the editor to select a block
                  </p>
                </div>
              )
            )}

            {/* ══ META ══ */}
            {activeTab === "Meta" && (
              <>
                <section className="space-y-1">
                  <SectionLabel>Document Stats</SectionLabel>
                  <div className="mt-2">
                    <StatRow label="Words"      value={formatNumber(docStats.words)} />
                    <StatRow label="Characters" value={formatNumber(docStats.chars)} />
                    <StatRow label="Blocks"     value={formatNumber(docStats.blocks)} />
                  </div>
                </section>

                <div className="border-t border-white/5" />

                <section className="space-y-1">
                  <SectionLabel>Timestamps</SectionLabel>
                  <div className="mt-2">
                    <StatRow
                      label="Created"
                      value={activePage ? formatDate(activePage.createdAt) : "—"}
                    />
                    <StatRow
                      label="Modified"
                      value={activePage ? timeAgo(activePage.updatedAt) : "—"}
                    />
                  </div>
                </section>

                <div className="border-t border-white/5" />

                <section className="space-y-1">
                  <SectionLabel>Page</SectionLabel>
                  <div className="mt-2">
                    <StatRow label="Title" value={activePage?.title ?? "Untitled"} />
                    <StatRow label="ID"    value={activePage?.id.slice(0, 8) ?? "—"} />
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
