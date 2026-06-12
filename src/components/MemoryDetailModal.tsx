import React from "react";
import { WashiTape } from "@/components/WashiTape";
import { Collage } from "@/components/Collage";
import { MapPin } from "lucide-react";
import type { Entry } from "@/lib/entries";

interface MemoryDetailModalProps {
  activeEntry: Entry;
  onClose: () => void;
  onImageClick: (idx: number) => void;
}

export function MemoryDetailModal({
  activeEntry,
  onClose,
  onImageClick,
}: MemoryDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fade-in"
      />
      <div className="relative w-full max-w-2xl paper-card rounded-[32px] border-2 border-ink p-6 md:p-8 shadow-[var(--shadow-lift)] max-h-[85vh] flex flex-col animate-wobble-in">
        <WashiTape
          color={activeEntry.tape}
          rotate={-3}
          width="6rem"
          className="absolute -top-3 left-10 pointer-events-none"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full border-2 border-ink bg-paper text-ink hover:bg-accent cursor-pointer transition-colors font-hand text-xl z-20"
        >
          ✕
        </button>

        {/* Joint Scrollable Container for all content */}
        <div className="flex-1 overflow-y-auto subtle-scroll pr-2 space-y-6 mt-2 pt-2 px-1 -mx-1">
          {/* Header Info */}
          <div className="flex items-start gap-4">
            <span className="text-4xl leading-none shrink-0">
              {activeEntry.mood}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-2xl md:text-3xl text-ink font-bold leading-tight">
                {activeEntry.title}
              </h3>
              <p className="font-accent text-xs md:text-sm uppercase tracking-wider text-ink-soft mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span>{activeEntry.collection || "Unsorted"}</span>
                <span>·</span>
                <span className="font-hand text-xl lowercase">
                  {new Date(activeEntry.date + "T00:00").toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric" },
                  )}{" "}
                  ({activeEntry.date})
                </span>
                {activeEntry.place && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3.5 w-3.5" /> {activeEntry.place}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Photos */}
          {activeEntry.photos && activeEntry.photos.length > 0 && (
            <Collage photos={activeEntry.photos} onPhotoClick={onImageClick} />
          )}

          {/* Description */}
          <div>
            <p className="font-body text-ink-soft text-lg leading-relaxed whitespace-pre-wrap">
              {activeEntry.note}
            </p>
          </div>

          {/* Tags */}
          {activeEntry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {activeEntry.tags.map((t) => (
                <span
                  key={t}
                  className="font-hand text-lg text-ink bg-accent/70 px-3.5 py-1 rounded-full border border-ink/40 shadow-xs"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
