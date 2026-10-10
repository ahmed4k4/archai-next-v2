import { unstable_cache } from "next/cache";
import { sbServer, configured } from "./supabase";
import type { Category, Project, SiteSettings } from "./types";

const LIST =
  "id,slug,category_id,sort_order,created_at,updated_at,title_en,title_ar,summary_en,summary_ar,live_url,cover_image,cover_thumb,hero_image,featured_image,featured,featured_sort_order,categories(id,slug,name_en,name_ar,active),project_technologies(technology),project_industries(industry),project_images(public_url,role,sort_order,alt_en,alt_ar)";
const FULL =
  "*,categories(id,slug,name_en,name_ar,active),project_technologies(technology),project_industries(industry),project_images(id,public_url,alt_en,alt_ar,sort_order,is_hero)";

const EMPTY: { cats: Category[]; projects: Project[]; settings: SiteSettings; configured: boolean } = { cats: [], projects: [], settings: {}, configured };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const arr = <T = any>(x: unknown): T[] => (Array.isArray(x) ? x as T[] : []);

async function loadHome(): Promise<{ cats: Category[]; projects: Project[]; settings: SiteSettings; configured: boolean }> {
  if (!configured) return EMPTY;
  const sb = sbServer();
  const [c, p, s] = await Promise.all([
    sb
      .from("categories")
      .select("id,slug,icon,name_en,name_ar,description_en,description_ar,sort_order,active")
      .eq("active", true)
      .order("sort_order"),
    sb.from("projects").select(LIST).eq("status", "published").order("sort_order"),
    sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (c.error) throw c.error;
  if (p.error) throw p.error;
  const cats = arr(c.data);
  const ids = new Set(cats.map((x) => x.id));
  const projects = arr(p.data)
    .filter((x) => !x.category_id || ids.has(x.category_id))
    .map((x) => ({
      ...x,
      project_technologies: arr(x.project_technologies),
      project_industries: arr(x.project_industries),
      project_images: arr(x.project_images),
    }));
  return { cats, projects, settings: s.data || {}, configured: true };
}

/* cached 60 s + invalidated instantly by /api/revalidate (called from the dashboard) */
const cachedHome = unstable_cache(loadHome, ["home-v1"], { revalidate: 60, tags: ["content"] });

export async function getHome(): Promise<{ cats: Category[]; projects: Project[]; settings: SiteSettings; configured: boolean }> {
  try {
    return await cachedHome();
  } catch (e) {
    console.error("[data] home:", e instanceof Error ? e.message : e);
    return EMPTY;
  }
}

const cachedProject = unstable_cache(
  async (id) => {
    const { data, error } = await sbServer().from("projects").select(FULL).eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },
  ["project-v1"],
  { revalidate: 60, tags: ["content"] }
);

export async function getProject(id: string): Promise<Project | null> {
  if (!configured || !UUID.test(id)) return null;
  try {
    const p = await cachedProject(id);
    if (!p) return null;
    return {
      ...p,
      project_images: arr(p.project_images),
      project_technologies: arr(p.project_technologies),
      project_industries: arr(p.project_industries),
    };
  } catch (e) {
    console.error("[data] project:", e instanceof Error ? e.message : e);
    return null;
  }
}
