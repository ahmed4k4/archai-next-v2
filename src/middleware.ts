import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["ar", "en"] as const;
const DEFAULT_LOCALE = "ar";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return;
  }

  const accept = req.headers.get("accept-language") || "";
  const cookieLang = req.cookies.get("lang")?.value;

  let lang: string = DEFAULT_LOCALE;
  if (cookieLang && (LOCALES as readonly string[]).includes(cookieLang)) {
    lang = cookieLang;
  } else if (/^en/i.test(accept)) {
    lang = "en";
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;

  const res = NextResponse.redirect(url);
  res.cookies.set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|admin|assets|fonts|.*\\..*).*)"],
};