import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const configured = Boolean(SUPABASE_URL && SUPABASE_KEY);
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://archai-next-v2.vercel.app").replace(/\/$/, "");

/**
 * Bound Supabase REST requests so an unreachable/stalled backend cannot leave the
 * App Router waiting indefinitely for page data. Preserve caller cancellation.
 */
const supabaseFetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const parentSignal = init?.signal ?? (typeof Request !== "undefined" && input instanceof Request ? input.signal : undefined);
  const abortFromParent = () => controller.abort();
  if (parentSignal?.aborted) abortFromParent();
  else parentSignal?.addEventListener("abort", abortFromParent, { once: true });

  const timeout = setTimeout(() => controller.abort(), 1_800);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
    parentSignal?.removeEventListener("abort", abortFromParent);
  }
};

/* Server-side anon client: RLS applies; each REST request has a hard timeout. */
export const sbServer = () =>
  createClient(SUPABASE_URL || "", SUPABASE_KEY || "", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: supabaseFetchWithTimeout },
  });
