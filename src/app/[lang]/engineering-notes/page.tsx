import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

/** Alternative public label used by the corporate reference site's footer. */
export default function EngineeringNotesAlias({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  permanentRedirect(`/${params.lang}/insights`);
}
