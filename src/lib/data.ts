import { unstable_cache } from "next/cache";
import { sbServer, configured } from "./supabase";
import type { Category, Project, SiteSettings } from "./types";

/** Full published-project query with optional relations; compatibility queries below use only core fields. */
const LIST =
  "id,slug,category_id,sort_order,title_en,title_ar,summary_en,summary_ar,live_url,status,cover_image,cover_thumb,hero_image,featured_image,featured,featured_sort_order,categories(id,slug,name_en,name_ar,active),project_technologies(technology),project_industries(industry),project_images(public_url,sort_order,alt_en,alt_ar)";
const BASIC_PROJECTS =
  "id,slug,category_id,sort_order,title_en,title_ar,summary_en,summary_ar,live_url,status,cover_image,featured,featured_sort_order";
const MINIMAL_PROJECTS = "id,title_en,title_ar,summary_en,summary_ar,live_url,status";
const FULL =
  "*,categories(id,slug,name_en,name_ar,active),project_technologies(technology),project_industries(industry),project_images(id,public_url,alt_en,alt_ar,sort_order,is_hero)";

type HomeData = {
  cats: Category[];
  projects: Project[];
  settings: SiteSettings;
  configured: boolean;
  /** True only when compatibility queries had to replace a richer database query. */
  compatibilityMode: boolean;
  /** True when the backend could not provide project data. Never replace it with static records. */
  dataError: boolean;
};

const emptyHome = (configuredState: boolean, dataError = false): HomeData => ({
  cats: [],
  projects: [],
  settings: {} as SiteSettings,
  configured: configuredState,
  compatibilityMode: false,
  dataError,
});

const arr = <T = any>(value: unknown): T[] => (Array.isArray(value) ? value as T[] : []);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Never let a slow or unreachable CMS leave public routes on an indefinite loading shell. */
async function withDeadline<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} exceeded ${timeoutMs}ms`)), timeoutMs);
    });
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function relationCategory(value: unknown): Category | null {
  if (Array.isArray(value)) return (value[0] as Category | undefined) ?? null;
  return value && typeof value === "object" ? value as Category : null;
}

async function loadHome(): Promise<HomeData> {
  if (!configured) return emptyHome(false);

  const sb = sbServer();
  const [categoriesPrimary, projectsPrimary, settingsQuery] = await Promise.all([
    sb
      .from("categories")
      .select("id,slug,icon,name_en,name_ar,description_en,description_ar,sort_order,active")
      .eq("active", true)
      .order("sort_order"),
    sb.from("projects").select(LIST).eq("status", "published").order("sort_order"),
    sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  let compatibilityMode = false;
  let categoryRows: Category[] = arr<Category>(categoriesPrimary.data);
  if (categoriesPrimary.error) {
    compatibilityMode = true;
    console.warn("[data] categories compatibility query:", categoriesPrimary.error.message);
    const compatibleCategories = await sb
      .from("categories")
      .select("id,slug,name_en,name_ar,sort_order,active")
      .eq("active", true)
      .order("sort_order");
    if (compatibleCategories.error) {
      console.warn("[data] category list unavailable:", compatibleCategories.error.message);
      categoryRows = [];
    } else {
      categoryRows = arr<Category>(compatibleCategories.data);
    }
  }

  let canReadRelations = true;
  let projectRows: Record<string, any>[] = arr<Record<string, any>>(projectsPrimary.data);
  if (projectsPrimary.error) {
    compatibilityMode = true;
    canReadRelations = false;
    console.warn("[data] project relation compatibility query:", projectsPrimary.error.message);
    const compatibleProjects = await sb
      .from("projects")
      .select(BASIC_PROJECTS)
      .eq("status", "published")
      .order("sort_order");

    if (!compatibleProjects.error) {
      projectRows = arr<Record<string, any>>(compatibleProjects.data);
    } else {
      console.warn("[data] project core query:", compatibleProjects.error.message);
      const minimalProjects = await sb
        .from("projects")
        .select(MINIMAL_PROJECTS)
        .eq("status", "published");
      if (minimalProjects.error) throw minimalProjects.error;
      projectRows = arr<Record<string, any>>(minimalProjects.data);
    }
  }

  // Only rows returned by the backend become project cards or project detail pages.
  // An empty CMS is a valid empty state, not a reason to inject demo/curated records.
  const categoriesById = new Map(categoryRows.map((category) => [String(category.id), category]));
  const projects: Project[] = projectRows.map((row) => {
    const joinedCategory = canReadRelations ? relationCategory(row.categories) : null;
    const category = joinedCategory ?? categoriesById.get(String(row.category_id ?? "")) ?? null;
    return {
      ...row,
      categories: category,
      project_technologies: canReadRelations ? arr(row.project_technologies) : [],
      project_industries: canReadRelations ? arr(row.project_industries) : [],
      project_images: canReadRelations ? arr(row.project_images) : [],
    } as Project;
  });

  // Categories are also backend-managed. Relation rows can fill gaps if the category
  // listing query had stricter RLS than the published-project relation query.
  const cats = [...categoryRows];
  const knownCategoryIds = new Set(cats.map((category) => String(category.id)));
  const knownCategorySlugs = new Set(cats.map((category) => category.slug));
  for (const project of projects) {
    const category = project.categories;
    if (!category || category.active === false) continue;
    if (knownCategoryIds.has(String(category.id)) || knownCategorySlugs.has(category.slug)) continue;
    cats.push(category);
    knownCategoryIds.add(String(category.id));
    knownCategorySlugs.add(category.slug);
  }

  projects.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  cats.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

  return {
    cats,
    projects,
    settings: (settingsQuery.data || {}) as SiteSettings,
    configured: true,
    compatibilityMode,
    dataError: false,
  };
}

const cachedHome = unstable_cache(loadHome, ["home-v12-fast-failure-public-content"], {
  revalidate: 300,
  tags: ["content"],
});

export async function getHome(): Promise<HomeData> {
  if (!configured) return emptyHome(false);
  try {
    return await withDeadline(cachedHome(), 2_500, "project catalogue data");
  } catch (error) {
    console.error("[data] project data unavailable; static project fallback is disabled:", error instanceof Error ? error.message : error);
    return emptyHome(true, true);
  }
}

const cachedProject = unstable_cache(
  async (identifier: string, bySlug: boolean) => {
    const query = sbServer().from("projects").select(FULL);
    const result = bySlug
      ? await query.eq("slug", identifier).eq("status", "published").maybeSingle()
      : await query.eq("id", identifier).eq("status", "published").maybeSingle();
    if (result.error) throw result.error;
    return result.data;
  },
  ["project-v4-backend-only-slug-support"],
  { revalidate: 300, tags: ["content"] },
);

const cachedBasicProject = unstable_cache(
  async (identifier: string, bySlug: boolean) => {
    const query = sbServer().from("projects").select(BASIC_PROJECTS);
    const result = bySlug
      ? await query.eq("slug", identifier).eq("status", "published").maybeSingle()
      : await query.eq("id", identifier).eq("status", "published").maybeSingle();
    if (result.error) throw result.error;
    return result.data;
  },
  ["project-basic-v2-backend-only"],
  { revalidate: 300, tags: ["content"] },
);

const cachedMinimalProject = unstable_cache(
  async (identifier: string, bySlug: boolean) => {
    const query = sbServer().from("projects").select(MINIMAL_PROJECTS);
    const result = bySlug
      ? await query.eq("slug", identifier).eq("status", "published").maybeSingle()
      : await query.eq("id", identifier).eq("status", "published").maybeSingle();
    if (result.error) throw result.error;
    return result.data;
  },
  ["project-minimal-v3-backend-only"],
  { revalidate: 300, tags: ["content"] },
);

/** Try a readable slug first, then an ID for older records that use direct IDs in links. */
async function readProjectBySlugOrId<T>(
  reader: (identifier: string, bySlug: boolean) => Promise<T | null>,
  identifier: string,
  bySlug: boolean,
): Promise<T | null> {
  if (!bySlug) return reader(identifier, false);
  try {
    const slugMatch = await reader(identifier, true);
    if (slugMatch) return slugMatch;
  } catch {
    // An older schema may not contain the slug column; continue with the ID query.
  }
  try {
    return await reader(identifier, false);
  } catch {
    return null;
  }
}

function normalizeProject(project: Record<string, any>, related?: Project | null, cats: Category[] = []): Project {
  const category = relationCategory(project.categories)
    ?? related?.categories
    ?? cats.find((candidate) => String(candidate.id) === String(project.category_id ?? ""))
    ?? null;
  return {
    ...project,
    categories: category,
    project_images: arr(project.project_images).length ? arr(project.project_images) : related?.project_images ?? [],
    project_technologies: arr(project.project_technologies).length ? arr(project.project_technologies) : related?.project_technologies ?? [],
    project_industries: arr(project.project_industries).length ? arr(project.project_industries) : related?.project_industries ?? [],
  } as Project;
}

export async function getProject(identifier: string): Promise<Project | null> {
  if (!configured || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,149}$/.test(identifier)) return null;
  const bySlug = !UUID.test(identifier);
  const home = await getHome();
  const byKey = home.projects.find((project) => project.id === identifier || project.slug === identifier) ?? null;

  for (const [reader, label] of [
    [cachedProject, "full"],
    [cachedBasicProject, "basic"],
    [cachedMinimalProject, "minimal"],
  ] as const) {
    try {
      const row = await readProjectBySlugOrId(reader, identifier, bySlug);
      if (row) {
        const record = row as Record<string, any>;
        const related = home.projects.find((project) =>
          project.id === String(record.id) || (record.slug && project.slug === String(record.slug))
        ) ?? byKey;
        return normalizeProject(record, related, home.cats);
      }
    } catch (error) {
      console.warn(`[data] ${label} project query failed:`, error instanceof Error ? error.message : error);
    }
  }

  // Resolve from the published DB catalogue only; never synthesize project details.
  return byKey;
}
