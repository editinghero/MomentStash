import React from "react";
import { Download } from "lucide-react";

interface ImagePreviewModalProps {
  imagePreview: { src: string; title: string };
  onClose: () => void;
}

export function ImagePreviewModal({
  imagePreview,
  onClose,
}: ImagePreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-zoom-out"
        aria-label="Close enlarged image"
      />
      <div className="relative max-h-[90vh] w-full max-w-5xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="truncate font-display text-2xl text-paper">
            {imagePreview.title}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={imagePreview.src}
              download={`${imagePreview.title || "momentstash-image"}.jpg`}
              className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-paper bg-paper px-4 font-hand text-lg text-ink shadow-[2px_2px_0_var(--color-ink)]"
            >
              <Download className="h-4 w-4" /> Download
            </a>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-paper bg-paper font-hand text-xl text-ink"
              aria-label="Close enlarged image"
            >
              ✕
            </button>
          </div>
        </div>
        <img
          src={imagePreview.src}
          alt=""
          className="mx-auto max-h-[calc(90vh-4rem)] max-w-full rounded-2xl border-2 border-paper object-contain shadow-[var(--shadow-lift)]"
        />
      </div>
    </div>
  );
}
