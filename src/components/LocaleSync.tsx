"use client";
import { useEffect } from "react";
import type { Locale } from "@/lib/types";

/**
 * LocaleSync — keeps <html lang/dir> in step with the active locale.
 *
 * The root layout sets these on first paint via an inline script; this keeps
 * them correct when the locale changes through a client-side navigation
 * (instant language switch) without a reload.
 */
export default function LocaleSync({ lang }: { lang: Locale }) {
  useEffect(() => {
    const el = document.documentElement;
    const dir = lang === "ar" ? "rtl" : "ltr";
    if (el.lang !== lang) el.lang = lang;
    if (el.dir !== dir) el.dir = dir;
    try {
      document.cookie = `lang=${lang};path=/;max-age=31536000;samesite=lax`;
    } catch {}
  }, [lang]);

  return null;
}
