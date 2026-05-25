import React from "react";

interface CollageProps {
  photos: string[];
  onPhotoClick?: (index: number) => void;
  className?: string;
}

export function Collage({
  photos,
  onPhotoClick,
  className = "",
}: CollageProps) {
  const validPhotos = photos?.filter(Boolean) || [];
  if (validPhotos.length === 0) return null;

  // Single photo
  if (validPhotos.length === 1) {
    return (
      <div className={`mt-4 w-full ${className}`}>
        <button
          type="button"
          onClick={() => onPhotoClick?.(0)}
          className={`block w-full ${onPhotoClick ? "cursor-zoom-in" : "cursor-default"}`}
        >
          <img
            src={validPhotos[0]}
            alt=""
            className="w-full max-h-[350px] object-cover border-2 border-ink/85 shadow-sm collage-shape-1"
          />
        </button>
      </div>
    );
  }

  // Two photos
  if (validPhotos.length === 2) {
    return (
      <div className={`mt-4 grid grid-cols-2 gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => onPhotoClick?.(0)}
          className={onPhotoClick ? "cursor-zoom-in" : "cursor-default"}
        >
          <img
            src={validPhotos[0]}
            alt=""
            className="w-full h-40 object-cover border-2 border-ink/80 collage-shape-2"
          />
        </button>
        <button
          type="button"
          onClick={() => onPhotoClick?.(1)}
          className={onPhotoClick ? "cursor-zoom-in" : "cursor-default"}
        >
          <img
            src={validPhotos[1]}
            alt=""
            className="w-full h-40 object-cover border-2 border-ink/80 collage-shape-3"
          />
        </button>
      </div>
    );
  }

  // Three photos
  if (validPhotos.length === 3) {
    return (
      <div className={`mt-4 grid grid-cols-2 gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => onPhotoClick?.(0)}
          className={`col-span-2 ${onPhotoClick ? "cursor-zoom-in" : "cursor-default"}`}
        >
          <img
            src={validPhotos[0]}
            alt=""
            className="w-full h-40 object-cover border-2 border-ink/80 collage-shape-1"
          />
        </button>
        <button
          type="button"
          onClick={() => onPhotoClick?.(1)}
          className={onPhotoClick ? "cursor-zoom-in" : "cursor-default"}
        >
          <img
            src={validPhotos[1]}
            alt=""
            className="w-full h-32 object-cover border-2 border-ink/80 collage-shape-2"
          />
        </button>
        <button
          type="button"
          onClick={() => onPhotoClick?.(2)}
          className={onPhotoClick ? "cursor-zoom-in" : "cursor-default"}
        >
          <img
            src={validPhotos[2]}
            alt=""
            className="w-full h-32 object-cover border-2 border-ink/80 collage-shape-3"
          />
        </button>
      </div>
    );
  }

  // Four photos
  return (
    <div className={`mt-4 grid grid-cols-2 gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => onPhotoClick?.(0)}
        className={onPhotoClick ? "cursor-zoom-in" : "cursor-default"}
      >
        <img
          src={validPhotos[0]}
          alt=""
          className="w-full h-32 object-cover border-2 border-ink/80 collage-shape-2"
        />
      </button>
      <button
        type="button"
        onClick={() => onPhotoClick?.(1)}
        className={onPhotoClick ? "cursor-zoom-in" : "cursor-default"}
      >
        <img
          src={validPhotos[1]}
          alt=""
          className="w-full h-32 object-cover border-2 border-ink/80 collage-shape-3"
        />
      </button>
      <button
        type="button"
        onClick={() => onPhotoClick?.(2)}
        className={onPhotoClick ? "cursor-zoom-in" : "cursor-default"}
      >
        <img
          src={validPhotos[2]}
          alt=""
          className="w-full h-32 object-cover border-2 border-ink/80 collage-shape-4"
        />
      </button>
      <button
        type="button"
        onClick={() => onPhotoClick?.(3)}
        className={onPhotoClick ? "cursor-zoom-in" : "cursor-default"}
      >
        <img
          src={validPhotos[3]}
          alt=""
          className="w-full h-32 object-cover border-2 border-ink/80 collage-shape-1"
        />
      </button>
    </div>
  );
}
