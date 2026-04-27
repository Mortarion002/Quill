"use client";

import { create } from "zustand";

interface UIStore {
  inspectorOpen: boolean;
  commandMenuOpen: boolean;
  activeBlockId: string | null;
  hoveredBlockId: string | null;
  toggleInspector: () => void;
  setInspectorOpen: (open: boolean) => void;
  setCommandMenuOpen: (open: boolean) => void;
  setActiveBlock: (id: string | null) => void;
  setHoveredBlock: (id: string | null) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  inspectorOpen: false,
  commandMenuOpen: false,
  activeBlockId: null,
  hoveredBlockId: null,

  toggleInspector: () =>
    set((state) => ({ inspectorOpen: !state.inspectorOpen })),
  setInspectorOpen: (open) => set({ inspectorOpen: open }),
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
  setActiveBlock: (id) => set({ activeBlockId: id }),
  setHoveredBlock: (id) => set({ hoveredBlockId: id }),
}));
