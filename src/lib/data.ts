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

type SiteShellData = {
  cats: Category[];
  settings: SiteSettings;
  configured: boolean;
};

export type ProjectArchiveData = {
  cats: Category[];
  projects: Project[];
  configured: boolean;
  compatibilityMode: boolean;
  dataError: boolean;
};

const emptySiteShell = (configuredState: boolean): SiteShellData => ({
  cats: [],
  settings: {} as SiteSettings,
  configured: configuredState,
});

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

// The project archive does not need gallery rows. This lighter projection avoids
// loading each project's full image gallery just to render/filter the archive.
const ARCHIVE_PROJECTS =
  "id,slug,category_id,sort_order,title_en,title_ar,summary_en,summary_ar,live_url,status,cover_image,cover_thumb,hero_image,featured_image,featured,featured_sort_order,categories(id,slug,name_en,name_ar,active),project_technologies(technology),project_industries(industry)";

const emptyProjectArchive = (configuredState: boolean, dataError = false): ProjectArchiveData => ({
  cats: [],
  projects: [],
  configured: configuredState,
  compatibilityMode: false,
  dataError,
});

async function loadProjectArchive(): Promise<ProjectArchiveData> {
  if (!configured) return emptyProjectArchive(false);
  const sb = sbServer();
  const [categoryResult, projectResult] = await Promise.all([
    sb.from("categories")
      .select("id,slug,icon,name_en,name_ar,description_en,description_ar,sort_order,active")
      .eq("active", true)
      .order("sort_order"),
    sb.from("projects")
      .select(ARCHIVE_PROJECTS)
      .eq("status", "published")
      .order("sort_order"),
  ]);

  let compatibilityMode = false;
  let categoryRows: Category[] = arr<Category>(categoryResult.data);
  if (categoryResult.error) {
    compatibilityMode = true;
    const compatibleCategories = await sb.from("categories")
      .select("id,slug,name_en,name_ar,sort_order,active")
      .eq("active", true)
      .order("sort_order");
    categoryRows = compatibleCategories.error ? [] : arr<Category>(compatibleCategories.data);
  }

  let projectRows: Record<string, any>[] = arr<Record<string, any>>(projectResult.data);
  const canReadRelations = !projectResult.error;
  if (projectResult.error) {
    compatibilityMode = true;
    const basicResult = await sb.from("projects").select(BASIC_PROJECTS).eq("status", "published").order("sort_order");
    if (!basicResult.error) projectRows = arr<Record<string, any>>(basicResult.data);
    else {
      const minimalResult = await sb.from("projects").select(MINIMAL_PROJECTS).eq("status", "published");
      if (minimalResult.error) throw minimalResult.error;
      projectRows = arr<Record<string, any>>(minimalResult.data);
    }
  }

  const categoriesById = new Map(categoryRows.map((category) => [String(category.id), category]));
  const projects: Project[] = projectRows.map((row) => {
    const joined = canReadRelations ? relationCategory(row.categories) : null;
    const category = joined ?? categoriesById.get(String(row.category_id ?? "")) ?? null;
    if (joined && !categoriesById.has(String(joined.id))) {
      categoryRows.push(joined);
      categoriesById.set(String(joined.id), joined);
    }
    return {
      ...row,
      categories: category,
      project_technologies: canReadRelations ? arr(row.project_technologies) : [],
      project_industries: canReadRelations ? arr(row.project_industries) : [],
      // The media relation is loaded separately below. This prevents a missing optional
      // `role` column in older deployments from breaking the entire projects query.
      project_images: [],
    } as Project;
  });

  // Load role-based covers independently from project/category joins. Older production
  // schemas can be missing `role`; that must never break the projects query or silently
  // force every card to show its decorative placeholder.
  const projectIds = projects.map((project) => String(project.id)).filter(Boolean);
  if (projectIds.length) {
    try {
      const modernCovers = await sb.from("project_images")
        .select("project_id,public_url,role,sort_order,alt_en,alt_ar")
        .in("project_id", projectIds)
        .in("role", ["cover", "hero", "featured"])
        .order("sort_order", { ascending: true });

      let coverRows: Record<string, any>[] = [];
      if (!modernCovers.error) {
        coverRows = arr<Record<string, any>>(modernCovers.data);
      } else {
        // Compatibility path for earlier DB schema versions that only had boolean flags.
        const legacyCovers = await sb.from("project_images")
          .select("project_id,public_url,sort_order,alt_en,alt_ar,is_cover,is_hero,is_featured")
          .in("project_id", projectIds)
          .or("is_cover.eq.true,is_hero.eq.true,is_featured.eq.true")
          .order("sort_order", { ascending: true });
        if (!legacyCovers.error) {
          coverRows = arr<Record<string, any>>(legacyCovers.data).map((image) => ({
            ...image,
            role: image.is_cover ? "cover" : image.is_hero ? "hero" : "featured",
          }));
        }
      }

      const rank = (image: Record<string, any>) => {
        const role = image.role || (image.is_cover ? "cover" : image.is_hero ? "hero" : image.is_featured ? "featured" : "gallery");
        return role === "cover" ? 0 : role === "hero" ? 1 : role === "featured" ? 2 : 3;
      };
      const byProject = new Map<string, Record<string, any>[]>();
      for (const image of coverRows) {
        const key = String(image.project_id);
        const rows = byProject.get(key) ?? [];
        rows.push(image);
        byProject.set(key, rows);
      }
      for (const project of projects) {
        const images = (byProject.get(String(project.id)) ?? []).sort((a, b) =>
          rank(a) - rank(b) || (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );
        if (images.length) project.project_images = [images[0]] as any;
      }

      // Some older records have only gallery-role images and no scalar cover field.
      // Query those records alone as a fallback, so galleries are not downloaded for all cards.
      const missingCover = projects.filter((project) =>
        !project.project_images?.length &&
        !(project.cover_thumb || project.cover_image || project.featured_image || project.hero_image)
      );
      if (missingCover.length) {
        const missingIds = missingCover.map((project) => String(project.id));
        const galleries = await sb.from("project_images")
          .select("project_id,public_url,role,sort_order,alt_en,alt_ar")
          .in("project_id", missingIds)
          .order("sort_order", { ascending: true });
        let rows: Record<string, any>[] = [];
        if (!galleries.error) {
          rows = arr<Record<string, any>>(galleries.data);
        } else {
          const legacyGalleries = await sb.from("project_images")
            .select("project_id,public_url,sort_order,alt_en,alt_ar,is_cover,is_hero,is_featured")
            .in("project_id", missingIds)
            .order("sort_order", { ascending: true });
          if (!legacyGalleries.error) rows = arr<Record<string, any>>(legacyGalleries.data).map((image) => ({
            ...image,
            role: image.is_cover ? "cover" : image.is_hero ? "hero" : image.is_featured ? "featured" : "gallery",
          }));
        }
        for (const project of missingCover) {
          const candidate = rows.filter((image) => String(image.project_id) === String(project.id))
            .sort((a, b) => rank(a) - rank(b) || (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
          if (candidate) project.project_images = [candidate] as any;
        }
      }
    } catch (error) {
      console.warn("[data] project card media lookup failed:", error instanceof Error ? error.message : error);
    }
  }

  categoryRows.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  projects.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  return { cats: categoryRows, projects, configured: true, compatibilityMode, dataError: false };
}

const cachedProjectArchive = unstable_cache(loadProjectArchive, ["project-archive-cover-v4-independent-media"], {
  revalidate: 300,
  tags: ["content"],
});

export async function getProjectArchive(): Promise<ProjectArchiveData> {
  if (!configured) return emptyProjectArchive(false);
  try {
    return await withDeadline(cachedProjectArchive(), 2_600, "project archive data");
  } catch (error) {
    console.error("[data] project archive unavailable:", error instanceof Error ? error.message : error);
    return emptyProjectArchive(true, true);
  }
}

export async function getHome(): Promise<HomeData> {
  if (!configured) return emptyHome(false);
  try {
    return await withDeadline(cachedHome(), 2_500, "project catalogue data");
  } catch (error) {
    console.error("[data] project data unavailable; static project fallback is disabled:", error instanceof Error ? error.message : error);
    return emptyHome(true, true);
  }
}

/** Read only the settings row needed by metadata; do not fetch the whole project catalogue. */
const cachedSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    if (!configured) return {} as SiteSettings;
    const { data, error } = await sbServer().from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return (data || {}) as SiteSettings;
  },
  ["site-settings-v1"],
  { revalidate: 300, tags: ["content"] },
);

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!configured) return {} as SiteSettings;
  try {
    return await withDeadline(cachedSiteSettings(), 1_900, "site settings");
  } catch (error) {
    console.warn("[data] site settings unavailable:", error instanceof Error ? error.message : error);
    return {} as SiteSettings;
  }
}

/**
 * The shared layout needs navigation categories and brand settings, not every project
 * gallery and technology relation. This light query keeps all public pages from loading
 * the full portfolio just to render the header/footer.
 */
const cachedSiteShell = unstable_cache(
  async (): Promise<SiteShellData> => {
    if (!configured) return emptySiteShell(false);
    const sb = sbServer();
    const [categoryResult, projectCategoryResult, settings] = await Promise.all([
      sb.from("categories")
        .select("id,slug,icon,name_en,name_ar,description_en,description_ar,sort_order,active")
        .eq("active", true)
        .order("sort_order"),
      sb.from("projects").select("category_id").eq("status", "published"),
      cachedSiteSettings().catch(() => ({} as SiteSettings)),
    ]);

    let categories: Category[] = arr<Category>(categoryResult.data);
    if (categoryResult.error) {
      const compatible = await sb.from("categories")
        .select("id,slug,name_en,name_ar,sort_order,active")
        .eq("active", true)
        .order("sort_order");
      categories = compatible.error ? [] : arr<Category>(compatible.data);
    }

    // If the project-category read is unavailable, keep active categories visible rather
    // than hiding navigation. With a valid response, show categories with published work.
    if (!projectCategoryResult.error) {
      const used = new Set(arr<Record<string, unknown>>(projectCategoryResult.data)
        .map((row) => row.category_id)
        .filter((id): id is string => typeof id === "string")
        .map(String));
      categories = categories.filter((category) => used.has(String(category.id)));
    }
    categories.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
    return { cats: categories, settings, configured: true };
  },
  ["site-shell-v1-lightweight"],
  { revalidate: 300, tags: ["content"] },
);

export async function getSiteShell(): Promise<SiteShellData> {
  if (!configured) return emptySiteShell(false);
  try {
    return await withDeadline(cachedSiteShell(), 2_200, "site navigation data");
  } catch (error) {
    console.warn("[data] site shell unavailable:", error instanceof Error ? error.message : error);
    return { cats: [], settings: await getSiteSettings(), configured: true };
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
  let archiveFallback: ProjectArchiveData | null = null;

  for (const [reader, label] of [
    [cachedProject, "full"],
    [cachedBasicProject, "basic"],
    [cachedMinimalProject, "minimal"],
  ] as const) {
    try {
      const row = await readProjectBySlugOrId(reader, identifier, bySlug);
      if (row) {
        const record = row as Record<string, any>;
        // The full query already includes the relations required by project detail pages.
        // Only fetch the lightweight archive when a compatibility query omits related data.
        if (label !== "full") archiveFallback ??= await getProjectArchive();
        const related = archiveFallback?.projects.find((project) =>
          project.id === String(record.id) || (record.slug && project.slug === String(record.slug))
        ) ?? null;
        return normalizeProject(record, related, archiveFallback?.cats ?? []);
      }
    } catch (error) {
      console.warn(`[data] ${label} project query failed:`, error instanceof Error ? error.message : error);
    }
  }

  // Resolve from the published DB catalogue only; never synthesize project details.
  archiveFallback ??= await getProjectArchive();
  return archiveFallback.projects.find((project) => project.id === identifier || project.slug === identifier) ?? null;
}
