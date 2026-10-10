import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const configured = Boolean(SUPABASE_URL && SUPABASE_KEY);
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://archai-website-navy.vercel.app").replace(/\/$/, "");

/* server-side anon client (RLS applies: only published / active content is visible) */
export const sbServer = () =>
  createClient(SUPABASE_URL || "", SUPABASE_KEY || "", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
