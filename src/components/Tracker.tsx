"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

/* Anonymous analytics (no personal data) - same RPC/logic as the original site:
   one request per page view, session shared by tabs (30 min idle), refresh/dup guards,
   bots skipped. Opt out in this browser: localStorage.setItem("archai:notrack","1") */
let sb: ReturnType<typeof createClient> | undefined;
const client = () =>
  sb ||
  (sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }));

const sessionId = () => {
  try {
    const now = Date.now();
    let o = JSON.parse(localStorage.getItem("archai:sid") || "null");
    if (!o || !o.id || now - o.t > 18e5) o = { id: crypto.randomUUID().replace(/-/g, "").slice(0, 20), t: now };
    o.t = now;
    localStorage.setItem("archai:sid", JSON.stringify(o));
    return o.id;
  } catch {
    const fallback = sessionStorage.getItem("archai:sid:fallback") || crypto.randomUUID().replace(/-/g, "").slice(0, 20);
    sessionStorage.setItem("archai:sid:fallback", fallback);
    return fallback;
  }
};

async function track(pathname, projectId) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const ua = navigator.userAgent;
    if (/bot|crawl|spider|headless|lighthouse|preview/i.test(ua)) return;
    if (localStorage.getItem("archai:notrack") === "1") return;
    const key = "t:" + (projectId || pathname);
    const now = Date.now();
    if (now - (+sessionStorage.getItem(key) || 0) < (projectId ? 18e5 : 3e4)) return;
    sessionStorage.setItem(key, String(now));

    const device = /ipad|tablet/i.test(ua) ? "tablet" : /mobi|android|iphone/i.test(ua) ? "mobile" : "desktop";
    const browser = /edg\//i.test(ua) ? "Edge" : /firefox/i.test(ua) ? "Firefox" : /chrome/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari" : "Other";
    const os = /android/i.test(ua) ? "Android" : /iphone|ipad/i.test(ua) ? "iOS" : /windows/i.test(ua) ? "Windows" : /mac/i.test(ua) ? "macOS" : /linux/i.test(ua) ? "Linux" : "Other";
    let host = null;
    let type = "direct";
    if (document.referrer) {
      try {
        const h = new URL(document.referrer).hostname;
        if (h !== location.hostname) {
          host = h.slice(0, 80);
          type = /google|bing|yahoo|duckduckgo|yandex|baidu/i.test(h) ? "search" : "referral";
        }
      } catch { type = "other"; }
    }
    // This project does not ship generated Supabase Database types. Without a schema
    // generic, Supabase infers RPC names/args as `never`; narrow the RPC boundary here.
    const rpcClient = client() as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error?: unknown }> };
    const { error } = await rpcClient.rpc("track_visit", {
      p_session: sessionId(),
      p_page: pathname.slice(0, 60),
      p_device: device,
      p_browser: browser,
      p_os: os,
      p_referrer: host,
      p_referrer_type: type,
      p_project: projectId || null,
    });
    if (error) console.warn("track_visit RPC failed:", error);
  } catch (e) {
    console.warn("track", e);
  }
}

export default function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    const m = pathname.match(/\/projects\/([0-9a-f-]{36})/i);
    track(pathname, m ? m[1] : null);
  }, [pathname]);
  return null;
}
