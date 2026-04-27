"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

const TABS = ["Design", "Config", "Meta"] as const;
type Tab = (typeof TABS)[number];

const TAB_ICONS: Record<Tab, string> = {
  Design: "palette",
  Config: "settings_input_component",
  Meta: "database",
};

export function Inspector() {
  const { inspectorOpen, setInspectorOpen } = useUIStore();
  const [activeTab, setActiveTab] = useState<Tab>("Design");
  const [blurValue, setBlurValue] = useState(24);
  const [shadowOn, setShadowOn] = useState(true);

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
              <h3 className="text-white font-semibold text-sm leading-tight mb-0.5">
                Inspector
              </h3>
              <p className="text-slate-500 text-xs">Block Properties</p>
            </div>
            <button type="button"
              onClick={() => setInspectorOpen(false)}
              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors mt-0.5"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* ─── Tabs ─── */}
          <div className="flex px-6 pt-1 gap-5 border-b border-white/5">
            {TABS.map((tab) => (
              <button type="button"
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
            {activeTab === "Design" && (
              <>
                {/* Dimensions */}
                <section className="space-y-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">
                    Dimensions
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "W", icon: "width", value: "100%" },
                      { label: "H", icon: "height", value: "Auto" },
                    ].map(({ label, icon, value }) => (
                      <div key={label} className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">
                            {icon}
                          </span>
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

                {/* Effects */}
                <section className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">
                    Effects
                  </p>

                  {/* Blur slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[13px]">
                          blur_on
                        </span>
                        Blur
                      </span>
                      <span className="text-[11px] text-white tabular-nums">
                        {blurValue}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={blurValue}
                      onChange={(e) => setBlurValue(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Drop shadow toggle */}
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[13px]">
                        shadow
                      </span>
                      Drop Shadow
                    </span>
                    <button type="button"
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

                {/* Border */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">
                      Border
                    </p>
                    <button type="button" className="text-slate-600 hover:text-slate-400 transition-colors">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md border border-white/15 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors flex-shrink-0" />
                    <input
                      type="text"
                      defaultValue="0.5"
                      className="w-14 bg-surface-container-high border border-white/8 rounded-lg px-2 py-1.5 text-white text-xs text-center focus:border-primary-container focus:outline-none"
                    />
                    <select className="flex-1 bg-surface-container-high border border-white/8 rounded-lg px-3 py-1.5 text-white text-xs focus:border-primary-container focus:outline-none appearance-none cursor-pointer">
                      <option>Solid</option>
                      <option>Dashed</option>
                      <option>Dotted</option>
                    </select>
                  </div>
                </section>

                <div className="border-t border-white/5" />

                {/* Typography */}
                <section className="space-y-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">
                    Typography
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {["Body", "Heading"].map((t, i) => (
                      <button type="button"
                        key={t}
                        className={cn(
                          "py-2 rounded-lg text-xs font-medium border transition-colors",
                          i === 0
                            ? "bg-surface-container-high border-white/10 text-slate-200"
                            : "bg-transparent border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-400"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5 bg-surface-container-high rounded-lg p-1 border border-white/5">
                    {["format_align_left", "format_align_center", "format_align_right"].map(
                      (icon, i) => (
                        <button type="button"
                          key={icon}
                          className={cn(
                            "flex-1 py-1.5 rounded-md flex items-center justify-center transition-colors",
                            i === 0
                              ? "bg-surface-container-highest text-slate-200 shadow-sm"
                              : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {icon}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === "Config" && (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <span className="material-symbols-outlined text-[32px] text-slate-700">
                  settings_input_component
                </span>
                <p className="text-slate-600 text-sm text-center">
                  Select a block to view configuration options
                </p>
              </div>
            )}

            {activeTab === "Meta" && (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <span className="material-symbols-outlined text-[32px] text-slate-700">
                  database
                </span>
                <p className="text-slate-600 text-sm text-center">
                  Block metadata will appear here
                </p>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
