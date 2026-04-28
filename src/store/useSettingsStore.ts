"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontOption = "inter" | "serif" | "mono";
export type ThemeOption = "dark" | "light" | "system";

interface SettingsStore {
  font: FontOption;
  lineSpacing: number;
  spellCheck: boolean;
  theme: ThemeOption;
  setFont: (font: FontOption) => void;
  setLineSpacing: (v: number) => void;
  setSpellCheck: (v: boolean) => void;
  setTheme: (theme: ThemeOption) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      font: "inter",
      lineSpacing: 1.75,
      spellCheck: true,
      theme: "light",
      setFont: (font) => set({ font }),
      setLineSpacing: (lineSpacing) => set({ lineSpacing }),
      setSpellCheck: (spellCheck) => set({ spellCheck }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "quill-settings" }
  )
);
