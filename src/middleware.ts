import { NextResponse } from "next/server";

const LOCALES = ["ar", "en"];

/* "/" and any path without a locale -> /ar or /en (cookie, then Accept-Language) */
export function middleware(req) {
  const { pathname } = req.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  const accept = req.headers.get("accept-language") || "";
  const lang = req.cookies.get("lang")?.value || (/^en/i.test(accept) ? "en" : "ar");
  const url = req.nextUrl.clone();
  url.pathname = `/${LOCALES.includes(lang) ? lang : "ar"}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next|api|admin|assets|.*\\..*).*)"] };
