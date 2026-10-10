"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAdminI18n } from "@/components/admin/AdminI18n";
import MediaManager from "@/components/admin/MediaManager";

export default function MediaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sb = supabaseBrowser();
  const { locale } = useAdminI18n();
  const ar = locale === "ar";

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await sb
        .from("projects")
        .select("id, title_en, title_ar, slug, cover_image, featured_image, hero_image")
        .eq("id", id)
        .maybeSingle();
      if (error) setError(error.message);
      setProject(data);
      setLoading(false);
    })();
  }, [id, sb]);

  if (loading) {
    return (
      <div className="p-8 text-center text-ink-4">
        {ar ? "جارٍ التحميل…" : "Loading…"}
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 text-center">
        <div className="admin-error mb-4">
          {error || (ar ? "المشروع غير موجود" : "Project not found")}
        </div>
        <Link href="/admin/projects" className="admin-primary">
          ← {ar ? "العودة" : "Back"}
        </Link>
      </div>
    );
  }

  const title =
    (ar ? project.title_ar : project.title_en) ||
    project.title_en ||
    project.title_ar;

  return (
    <>
      <div className="admin-page-head">
        <div>
          <button
            onClick={() => router.push("/admin/projects")}
            className="inline-flex items-center gap-2 text-xs text-ink-4 hover:text-violet-300 transition-colors mb-2"
          >
            <ArrowLeft size={14} />
            {ar ? "المشاريع" : "Projects"}
          </button>
          <span className="admin-kicker">
            MEDIA / {project.slug?.toUpperCase()}
          </span>
          <h2>{title}</h2>
          <p>
            {ar
              ? "أضف صورًا متعددة، ورتبها، وحدد دور كل صورة (غلاف، هيرو، مميزة، معرض)."
              : "Upload multiple images, reorder them, and assign roles (cover, hero, featured, gallery)."}
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <MediaManager projectId={project.id} />
      </div>
    </>
  );
}