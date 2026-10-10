import { getHome } from "../lib/data";
import { LOCALES } from "../lib/i18n";
import { SITE_URL } from "../lib/supabase";

export default async function sitemap() {
  const { cats, projects } = await getHome();
  const now = new Date();
  return LOCALES.flatMap((l) => [
    { url: `${SITE_URL}/${l}`, lastModified: now, priority: 1 },
    ...cats.map((c) => ({ url: `${SITE_URL}/${l}/categories/${c.slug}`, lastModified: now, priority: 0.8 })),
    ...projects.map((p) => ({ url: `${SITE_URL}/${l}/projects/${p.id}`, lastModified: now, priority: 0.7 })),
  ]);
}
