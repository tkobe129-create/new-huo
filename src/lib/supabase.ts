import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY?.trim();

let client: SupabaseClient | null = null;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, { ...init, signal: AbortSignal.timeout(8000) });
}

export function getSupabase(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("Supabase client is server-only");
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase 未配置：请设置 SUPABASE_URL 和 SUPABASE_ANON_KEY");
  }
  client ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetchWithTimeout },
  });
  return client;
}

export function throwIfError(error: { message: string } | null, fallback = "数据库操作失败") {
  if (!error) return;
  const message = error.message.replace(/^[A-Z0-9]+:\s*/, "").trim();
  throw new Error(message || fallback);
}
