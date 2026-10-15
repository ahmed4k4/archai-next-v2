import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

/** Keep the reference site's /portfolio route working while /projects remains canonical. */
export default function PortfolioAlias({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  permanentRedirect(`/${params.lang}/projects`);
}
