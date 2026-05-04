"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Page } from "@/types";
import { generateId } from "@/lib/utils";
import {
  markPageDeleted,
  markPageRestored,
  resolveActivePageId,
} from "./documentStoreLogic";

export type CloudSyncStatus =
  | "local"
  | "loading"
  | "syncing"
  | "synced"
  | "error"
  | "setup";

interface DocumentStore {
  pages: Page[];
  activePageId: string | null;
  hasHydrated: boolean;
  cloudStatus: CloudSyncStatus;
  cloudMessage: string | null;
  lastSyncedAt: number | null;
  pendingCloudDeleteIds: string[];
  setHasHydrated: (v: boolean) => void;
  setCloudStatus: (status: CloudSyncStatus, message?: string | null) => void;
  setCloudSynced: () => void;
  replacePages: (pages: Page[], activePageId?: string | null) => void;
  clearPendingCloudDeleteIds: (ids: string[]) => void;
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
      cloudStatus: "local",
      cloudMessage: null,
      lastSyncedAt: null,
      pendingCloudDeleteIds: [],

      setHasHydrated: (v) => set({ hasHydrated: v }),

      setCloudStatus: (cloudStatus, cloudMessage = null) =>
        set({ cloudStatus, cloudMessage }),

      setCloudSynced: () =>
        set({ cloudStatus: "synced", cloudMessage: null, lastSyncedAt: Date.now() }),

      replacePages: (pages, nextActivePageId) =>
        set((state) => {
          return {
            pages,
            activePageId: resolveActivePageId(
              pages,
              state.activePageId,
              nextActivePageId
            ),
          };
        }),

      clearPendingCloudDeleteIds: (ids) =>
        set((state) => ({
          pendingCloudDeleteIds: state.pendingCloudDeleteIds.filter((id) => !ids.includes(id)),
        })),

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
          const now = Date.now();
          return {
            pages: state.pages.map((p) =>
              p.id === id ? markPageDeleted(p, now) : p
            ),
            activePageId: newActiveId,
          };
        });
      },

      restorePage: (id) => {
        const now = Date.now();
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === id ? markPageRestored(p, now) : p
          ),
        }));
      },

      permanentlyDeletePage: (id) => {
        set((state) => ({
          pages: state.pages.filter((p) => p.id !== id),
          pendingCloudDeleteIds: state.pendingCloudDeleteIds.includes(id)
            ? state.pendingCloudDeleteIds
            : [...state.pendingCloudDeleteIds, id],
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
