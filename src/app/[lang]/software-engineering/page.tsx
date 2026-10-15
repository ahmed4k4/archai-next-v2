import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

/** Preserve the reference software-engineering URL and land on the matching service card. */
export default function ReferenceRouteAlias({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  permanentRedirect(`/${params.lang}/services#service-software-engineering`);
}
