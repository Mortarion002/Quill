"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Page } from "@/types";
import { generateId } from "@/lib/utils";

interface DocumentStore {
  pages: Page[];
  activePageId: string | null;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  createPage: (title?: string) => string;
  updatePage: (id: string, updates: Partial<Omit<Page, "id" | "createdAt">>) => void;
  deletePage: (id: string) => void;
  setActivePage: (id: string) => void;
  getActivePage: () => Page | undefined;
  toggleFavorite: (id: string) => void;
  restorePage: (id: string) => void;
  permanentlyDeletePage: (id: string) => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      pages: [],
      activePageId: null,
      hasHydrated: false,

      setHasHydrated: (v) => set({ hasHydrated: v }),

      createPage: (title = "Untitled") => {
        const id = generateId();
        const newPage: Page = {
          id,
          title,
          content: "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          pages: [...state.pages, newPage],
          activePageId: id,
        }));
        return id;
      },

      updatePage: (id, updates) => {
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
        }));
      },

      deletePage: (id) => {
        set((state) => {
          const remaining = state.pages.filter((p) => p.id !== id && !p.deletedAt);
          const newActiveId =
            state.activePageId === id
              ? (remaining[0]?.id ?? null)
              : state.activePageId;
          return {
            pages: state.pages.map((p) =>
              p.id === id ? { ...p, deletedAt: Date.now() } : p
            ),
            activePageId: newActiveId,
          };
        });
      },

      restorePage: (id) => {
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === id ? { ...p, deletedAt: undefined } : p
          ),
        }));
      },

      permanentlyDeletePage: (id) => {
        set((state) => ({
          pages: state.pages.filter((p) => p.id !== id),
        }));
      },

      setActivePage: (id) => set({ activePageId: id }),

      toggleFavorite: (id) => {
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === id ? { ...p, favorite: !p.favorite, updatedAt: Date.now() } : p
          ),
        }));
      },

      getActivePage: () => {
        const { pages, activePageId } = get();
        return pages.find((p) => p.id === activePageId);
      },
    }),
    {
      name: "quill-documents",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
