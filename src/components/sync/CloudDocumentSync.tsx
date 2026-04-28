"use client";

import { useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  deleteCloudDocuments,
  fetchCloudDocuments,
  mergePages,
  upsertCloudDocuments,
} from "@/lib/documents/cloudDocuments";
import { useDocumentStore } from "@/store/useDocumentStore";

const SAVE_DELAY_MS = 900;

function getPagesSignature(state: ReturnType<typeof useDocumentStore.getState>) {
  return JSON.stringify({
    pages: state.pages.map((page) => ({
      id: page.id,
      title: page.title,
      content: page.content,
      emoji: page.emoji,
      favorite: page.favorite,
      deletedAt: page.deletedAt,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    })),
    pendingCloudDeleteIds: state.pendingCloudDeleteIds,
  });
}

export function CloudDocumentSync() {
  const hasHydrated = useDocumentStore((state) => state.hasHydrated);
  const userRef = useRef<User | null>(null);
  const syncReadyRef = useRef(false);
  const applyingCloudRef = useRef(false);
  const lastSignatureRef = useRef("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      useDocumentStore.getState().setCloudStatus("setup", "Add Supabase env");
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    async function loadForUser(user: User | null) {
      userRef.current = user;
      syncReadyRef.current = false;

      if (!user) {
        useDocumentStore.getState().setCloudStatus("local", "Sign in for cloud sync");
        return;
      }

      if (!hasHydrated) return;

      useDocumentStore.getState().setCloudStatus("loading", "Loading cloud pages");

      try {
        const cloudPages = await fetchCloudDocuments(supabase);
        if (cancelled) return;

        const latestStore = useDocumentStore.getState();
        const mergedPages = mergePages(latestStore.pages, cloudPages);

        applyingCloudRef.current = true;
        latestStore.replacePages(mergedPages);
        applyingCloudRef.current = false;

        if (mergedPages.length > 0) {
          await upsertCloudDocuments(supabase, user.id, mergedPages);
        }

        lastSignatureRef.current = getPagesSignature(useDocumentStore.getState());
        syncReadyRef.current = true;
        useDocumentStore.getState().setCloudSynced();
      } catch (error) {
        syncReadyRef.current = false;
        const message = error instanceof Error ? error.message : "Cloud sync failed";
        useDocumentStore.getState().setCloudStatus("error", message);
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) void loadForUser(data.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadForUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [hasHydrated]);

  useEffect(() => {
    return useDocumentStore.subscribe((state) => {
      const user = userRef.current;
      if (!user || !state.hasHydrated || !syncReadyRef.current || applyingCloudRef.current) {
        return;
      }

      const nextSignature = getPagesSignature(state);
      if (nextSignature === lastSignatureRef.current) {
        return;
      }
      lastSignatureRef.current = nextSignature;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      useDocumentStore.getState().setCloudStatus("syncing", "Saving to cloud");

      saveTimerRef.current = setTimeout(async () => {
        const latest = useDocumentStore.getState();
        const supabase = createClient();

        try {
          const pendingDeletes = [...latest.pendingCloudDeleteIds];
          await deleteCloudDocuments(supabase, pendingDeletes);
          await upsertCloudDocuments(supabase, user.id, latest.pages);

          if (pendingDeletes.length > 0) {
            useDocumentStore.getState().clearPendingCloudDeleteIds(pendingDeletes);
          }

          useDocumentStore.getState().setCloudSynced();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Could not save to cloud";
          useDocumentStore.getState().setCloudStatus("error", message);
        }
      }, SAVE_DELAY_MS);
    });
  }, []);

  return null;
}
