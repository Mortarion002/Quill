"use client";

import { create } from "zustand";
import type { Editor } from "@tiptap/core";

interface DocStats {
  words: number;
  chars: number;
  blocks: number;
}

interface UIStore {
  inspectorOpen: boolean;
  commandMenuOpen: boolean;
  activeBlockId: string | null;
  hoveredBlockId: string | null;
  activeEditor: Editor | null;
  docStats: DocStats;
  toggleInspector: () => void;
  setInspectorOpen: (open: boolean) => void;
  setCommandMenuOpen: (open: boolean) => void;
  setActiveBlock: (id: string | null) => void;
  setHoveredBlock: (id: string | null) => void;
  setActiveEditor: (editor: Editor | null) => void;
  setDocStats: (stats: DocStats) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  inspectorOpen: false,
  commandMenuOpen: false,
  activeBlockId: null,
  hoveredBlockId: null,
  activeEditor: null,
  docStats: { words: 0, chars: 0, blocks: 0 },

  toggleInspector: () =>
    set((state) => ({ inspectorOpen: !state.inspectorOpen })),
  setInspectorOpen: (open) => set({ inspectorOpen: open }),
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
  setActiveBlock: (id) => set({ activeBlockId: id }),
  setHoveredBlock: (id) => set({ hoveredBlockId: id }),
  setActiveEditor: (editor) => set({ activeEditor: editor }),
  setDocStats: (stats) => set({ docStats: stats }),
}));
