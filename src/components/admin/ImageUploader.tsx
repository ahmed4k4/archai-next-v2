"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

export default function ImageUploader({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length) onFiles(accepted);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".webp", ".jpg", ".jpeg", ".png", ".avif"],
    },
    maxSize: 5242880,
    multiple: true,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
        disabled
          ? "opacity-50 cursor-not-allowed border-white/10"
          : isDragActive
          ? "border-violet-400 bg-violet-500/10"
          : isDragReject
          ? "border-rose-400 bg-rose-500/10"
          : "border-violet-500/25 hover:border-violet-500/50 hover:bg-violet-500/5"
      }`}
    >
      <input {...getInputProps()} />

      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-300 mb-4">
        <UploadCloud size={24} />
      </div>

      <div className="text-ink-0 font-medium mb-1">
        {isDragActive ? "Drop files here" : "Drag & drop images"}
      </div>
      <div className="text-sm text-ink-4">
        or click to browse — up to 5 MB each (WebP/JPG/PNG/AVIF)
      </div>
    </div>
  );
}