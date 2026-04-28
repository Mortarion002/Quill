"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig, hasSupabaseConfig } from "./config";

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return hasSupabaseConfig();
}

export function createClient(): SupabaseClient {
  if (!browserClient) {
    const { url, publishableKey } = getSupabaseConfig();
    browserClient = createBrowserClient(url, publishableKey);
  }

  return browserClient;
}
