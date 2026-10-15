import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

/** The technology stack is a section on the homepage; preserve its dedicated link. */
export default function TechnologiesAlias({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  permanentRedirect(`/${params.lang}#technology-stack`);
}
