"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Star,
  Sparkles,
  Image as ImageIcon,
  Crown,
  Trash2,
  GripVertical,
  Loader2,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { uploadMany, deleteProjectImage } from "@/lib/storage";
import ImageUploader from "./ImageUploader";

export type MediaRole = "cover" | "hero" | "featured" | "gallery";

export type MediaImage = {
  id: string;
  project_id: string;
  storage_path: string;
  public_url: string;
  alt_en: string | null;
  alt_ar: string | null;
  caption_en: string | null;
  caption_ar: string | null;
  role: MediaRole;
  sort_order: number;
  width: number | null;
  height: number | null;
  bytes: number | null;
};

const ROLE_META: Record<
  MediaRole,
  { label: string; labelAr: string; icon: any; color: string; single: boolean }
> = {
  cover: {
    label: "Cover",
    labelAr: "غلاف",
    icon: Crown,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    single: true,
  },
  hero: {
    label: "Hero",
    labelAr: "هيرو",
    icon: Sparkles,
    color: "text-violet-300 bg-violet-500/10 border-violet-500/30",
    single: true,
  },
  featured: {
    label: "Featured",
    labelAr: "مميز",
    icon: Star,
    color: "text-mint-300 bg-mint-500/10 border-mint-500/30",
    single: true,
  },
  gallery: {
    label: "Gallery",
    labelAr: "معرض",
    icon: ImageIcon,
    color: "text-ink-2 bg-white/5 border-white/10",
    single: false,
  },
};

function SortableImage({
  image,
  onDelete,
  onRoleChange,
}: {
  image: MediaImage;
  onDelete: (img: MediaImage) => void;
  onRoleChange: (img: MediaImage, role: MediaRole) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const meta = ROLE_META[image.role];
  const Icon = meta.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-violet-500/30 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-ink-4 hover:text-violet-300 p-1"
        aria-label="Reorder"
      >
        <GripVertical size={16} />
      </button>

      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-black/40 shrink-0">
        <img
          src={image.public_url}
          alt={image.alt_en || "preview"}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border ${meta.color}`}
          >
            <Icon size={11} />
            {meta.label}
          </span>
          {image.width && image.height && (
            <span className="text-[10px] font-mono text-ink-4">
              {image.width}×{image.height}
            </span>
          )}
          {image.bytes && (
            <span className="text-[10px] font-mono text-ink-4">
              {(image.bytes / 1024).toFixed(0)} KB
            </span>
          )}
        </div>

        <div className="text-xs text-ink-3 truncate">
          {image.alt_en || image.alt_ar || "Untitled"}
        </div>

        {/* Role chooser */}
        <div className="flex gap-1 mt-2">
          {(["cover", "hero", "featured", "gallery"] as MediaRole[]).map((role) => {
            const r = ROLE_META[role];
            const RIcon = r.icon;
            const active = image.role === role;
            return (
              <button
                key={role}
                onClick={() => onRoleChange(image, role)}
                title={r.label}
                className={`px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider border transition-colors flex items-center gap-1 ${
                  active
                    ? r.color
                    : "border-white/10 text-ink-4 hover:border-violet-500/30 hover:text-ink-2"
                }`}
              >
                <RIcon size={10} />
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => onDelete(image)}
        className="shrink-0 w-9 h-9 grid place-items-center rounded-lg text-ink-4 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function MediaManager({ projectId }: { projectId: string }) {
  const sb = supabaseBrowser();
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await sb
      .from("project_images")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    setImages((data || []) as MediaImage[]);
    setLoading(false);
  }, [sb, projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const onUpload = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setSaving(true);
      const toastId = toast.loading(
        `Uploading ${files.length} image${files.length > 1 ? "s" : ""}...`
      );
      try {
        const results = await uploadMany(projectId, files);
        const inserts = results.map((r, i) => ({
          project_id: projectId,
          storage_path: r.path,
          public_url: r.publicUrl,
          alt_en: null,
          alt_ar: null,
          role: images.length === 0 && i === 0 ? "cover" : "gallery",
          sort_order: images.length + i,
          width: r.width,
          height: r.height,
          bytes: r.bytes,
        }));

        const { error } = await sb.from("project_images").insert(inserts);
        if (error) throw error;

        toast.success(`${results.length} uploaded`, { id: toastId });
        await load();
        await revalidate();
      } catch (e: any) {
        toast.error(e.message || "Upload failed", { id: toastId });
      } finally {
        setSaving(false);
      }
    },
    [projectId, images.length, sb, load]
  );

  const onDelete = useCallback(
    async (img: MediaImage) => {
      if (!confirm("Delete this image permanently?")) return;
      try {
        await deleteProjectImage(img.storage_path);
        const { error } = await sb.from("project_images").delete().eq("id", img.id);
        if (error) throw error;
        toast.success("Deleted");
        await load();
        await revalidate();
      } catch (e: any) {
        toast.error(e.message || "Delete failed");
      }
    },
    [sb, load]
  );

  const onRoleChange = useCallback(
    async (img: MediaImage, role: MediaRole) => {
      if (img.role === role) return;
      try {
        const { error } = await sb.rpc("assign_image_role", {
          p_image_id: img.id,
          p_role: role,
        });
        if (error) throw error;
        await load();
        await revalidate();
      } catch (e: any) {
        toast.error(e.message || "Could not change role");
      }
    },
    [sb, load]
  );

  const onDragEnd = useCallback(
    async (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;

      const oldIdx = images.findIndex((i) => i.id === active.id);
      const newIdx = images.findIndex((i) => i.id === over.id);
      if (oldIdx < 0 || newIdx < 0) return;

      const next = arrayMove(images, oldIdx, newIdx);
      setImages(next);

      try {
        const { error } = await sb.rpc("reorder_project_images", {
          p_project_id: projectId,
          p_ordered_ids: next.map((i) => i.id),
        });
        if (error) throw error;
        await revalidate();
      } catch (e: any) {
        toast.error(e.message || "Could not reorder");
        await load();
      }
    },
    [images, sb, projectId, load]
  );

  async function revalidate() {
    const session = (await sb.auth.getSession()).data.session;
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token || ""}` },
    });
  }

  const counts = useMemo(() => {
    return {
      total: images.length,
      cover: images.filter((i) => i.role === "cover").length,
      hero: images.filter((i) => i.role === "hero").length,
      featured: images.filter((i) => i.role === "featured").length,
    };
  }, [images]);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.total, color: "text-ink-0" },
          { label: "Cover", value: counts.cover, color: "text-amber-400" },
          { label: "Hero", value: counts.hero, color: "text-violet-300" },
          { label: "Featured", value: counts.featured, color: "text-mint-300" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/10"
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-4">
              {s.label}
            </div>
            <div className={`mt-1 font-display text-3xl font-medium ${s.color}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Uploader */}
      <ImageUploader onFiles={onUpload} disabled={saving} />

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-8 text-center text-ink-4">
            <Loader2 className="animate-spin mx-auto mb-2" size={20} />
            Loading...
          </div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-violet-500/20 rounded-xl text-ink-4 text-sm">
            No images yet. Upload your first one above.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={images.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence initial={false}>
                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <SortableImage
                      image={img}
                      onDelete={onDelete}
                      onRoleChange={onRoleChange}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}