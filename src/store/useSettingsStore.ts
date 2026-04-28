"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontOption = "inter" | "serif" | "mono";

interface SettingsStore {
  font: FontOption;
  lineSpacing: number;
  spellCheck: boolean;
  setFont: (font: FontOption) => void;
  setLineSpacing: (v: number) => void;
  setSpellCheck: (v: boolean) => void;
}

function clampLineSpacing(value: number) {
  return Math.min(2.25, Math.max(1.25, value));
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      font: "inter",
      lineSpacing: 1.75,
      spellCheck: true,
      setFont: (font) => set({ font }),
      setLineSpacing: (lineSpacing) => set({ lineSpacing: clampLineSpacing(lineSpacing) }),
      setSpellCheck: (spellCheck) => set({ spellCheck }),
    }),
    { name: "quill-settings" }
  )
);
