"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "@/types";

export interface DocumentRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  emoji: string | null;
  favorite: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

function toIso(timestamp?: number) {
  return new Date(timestamp ?? Date.now()).toISOString();
}

function toTimestamp(value: string | null | undefined) {
  return value ? new Date(value).getTime() : undefined;
}

export function pageToDocumentRow(page: Page, userId: string): DocumentRow {
  return {
    id: page.id,
    user_id: userId,
    title: page.title || "Untitled",
    content: page.content || "",
    emoji: page.emoji ?? null,
    favorite: Boolean(page.favorite),
    deleted_at: page.deletedAt ? toIso(page.deletedAt) : null,
    created_at: toIso(page.createdAt),
    updated_at: toIso(page.updatedAt),
  };
}

export function documentRowToPage(row: DocumentRow): Page {
  return {
    id: row.id,
    title: row.title || "Untitled",
    content: row.content || "",
    emoji: row.emoji ?? undefined,
    favorite: row.favorite || undefined,
    deletedAt: toTimestamp(row.deleted_at),
    createdAt: toTimestamp(row.created_at) ?? Date.now(),
    updatedAt: toTimestamp(row.updated_at) ?? Date.now(),
  };
}

export async function fetchCloudDocuments(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => documentRowToPage(row as DocumentRow));
}

export async function upsertCloudDocuments(
  supabase: SupabaseClient,
  userId: string,
  pages: Page[]
) {
  if (pages.length === 0) return;

  const rows = pages.map((page) => pageToDocumentRow(page, userId));
  const { error } = await supabase.from("documents").upsert(rows, { onConflict: "id" });

  if (error) throw error;
}

export async function deleteCloudDocuments(supabase: SupabaseClient, ids: string[]) {
  if (ids.length === 0) return;

  const { error } = await supabase.from("documents").delete().in("id", ids);

  if (error) throw error;
}

export function mergePages(localPages: Page[], cloudPages: Page[]) {
  const byId = new Map<string, Page>();

  for (const page of cloudPages) {
    byId.set(page.id, page);
  }

  for (const page of localPages) {
    const current = byId.get(page.id);
    if (!current || page.updatedAt > current.updatedAt) {
      byId.set(page.id, page);
    }
  }

  return Array.from(byId.values()).sort((a, b) => b.updatedAt - a.updatedAt);
}
