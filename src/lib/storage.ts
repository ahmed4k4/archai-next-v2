"use client";
import { supabaseBrowser } from "./supabase-browser";

export const BUCKET = "project-media";

export type UploadResult = {
  path: string;
  publicUrl: string;
  width: number;
  height: number;
  bytes: number;
};

/** Read image dimensions & size client-side before upload. */
async function readImageMeta(file: File) {
  return new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

/** Compress and convert an image to WebP client-side. */
async function compressToWebp(
  file: File,
  maxWidth = 2000,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        URL.revokeObjectURL(url);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) reject(new Error("Compression failed"));
          else resolve(blob);
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}

/** Generate a unique storage path. */
function makePath(projectId: string, ext = "webp") {
  const rnd = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `projects/${projectId}/${Date.now()}-${rnd}.${ext}`;
}

/** Upload a single file with compression. */
export async function uploadProjectImage(
  projectId: string,
  file: File
): Promise<UploadResult> {
  const sb = supabaseBrowser();

  const meta = await readImageMeta(file);
  const webp = await compressToWebp(file);
  const path = makePath(projectId);

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, webp, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) throw error;

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return {
    path,
    publicUrl: data.publicUrl,
    width: meta.width,
    height: meta.height,
    bytes: webp.size,
  };
}

/** Delete a file from storage by its path. */
export async function deleteProjectImage(path: string) {
  const sb = supabaseBrowser();
  const { error } = await sb.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

/** Bulk upload with progress callback. */
export async function uploadMany(
  projectId: string,
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<UploadResult[]> {
  const out: UploadResult[] = [];
  for (let i = 0; i < files.length; i++) {
    const res = await uploadProjectImage(projectId, files[i]);
    out.push(res);
    onProgress?.(i + 1, files.length);
  }
  return out;
}