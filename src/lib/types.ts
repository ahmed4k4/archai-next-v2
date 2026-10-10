export type Locale = "ar" | "en";

export interface Category {
  id: string;
  slug: string;
  icon?: string | null;
  name_ar?: string | null;
  name_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  sort_order?: number;
  active?: boolean;
}

export interface Technology {
  technology: string;
}

export interface Industry {
  industry: string;
}

export interface ProjectImage {
  id?: string;
  public_url: string;
  alt_ar?: string | null;
  alt_en?: string | null;
  sort_order?: number;
  is_hero?: boolean;
}

export interface Project {
  id: string;
  slug?: string | null;
  category_id?: string | null;
  sort_order?: number;
  featured_sort_order?: number;
  title_ar?: string | null;
  title_en?: string | null;
  summary_ar?: string | null;
  summary_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  live_url?: string | null;
  cover_image?: string | null;
  cover_thumb?: string | null;
  featured_image?: string | null;
  featured?: boolean;
  status?: string | null;
  categories?: Category | null;
  project_technologies: Technology[];
  project_industries: Industry[];
  project_images?: ProjectImage[];
}

export interface SiteSettings {
  site_title?: string;
  home_title_ar?: string;
  home_title_en?: string;
  home_desc_ar?: string;
  home_desc_en?: string;
  featured_limit?: number;
  projects_per_category?: number;
  section_visibility?: Record<string, boolean>;
  [key: string]: unknown;
}
