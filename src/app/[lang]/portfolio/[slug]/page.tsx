import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

/** Preserve the public reference portfolio URLs while /projects is the canonical route. */
export default function PortfolioProjectAlias({ params }: { params: { lang: string; slug: string } }) {
  if (!isLocale(params.lang) || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,149}$/.test(params.slug)) notFound();
  permanentRedirect(`/${params.lang}/projects/${params.slug}`);
}
