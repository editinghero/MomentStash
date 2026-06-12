interface CollageProps {
  photos: string[];
  onPhotoClick?: (index: number) => void;
  className?: string;
}

interface PhotoButtonProps {
  photo: string;
  index: number;
  onPhotoClick?: (index: number) => void;
  buttonClassName?: string;
  imgClassName: string;
}

function PhotoButton({
  photo,
  index,
  onPhotoClick,
  buttonClassName = "",
  imgClassName,
}: PhotoButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onPhotoClick?.(index)}
      className={`${buttonClassName} ${onPhotoClick ? "cursor-zoom-in" : "cursor-default"}`.trim()}
    >
      <img src={photo} alt="" className={imgClassName} />
    </button>
  );
}

function SinglePhotoLayout({ photos, onPhotoClick, className }: CollageProps) {
  return (
    <div className={`mt-4 w-full ${className}`}>
      <PhotoButton
        photo={photos[0]}
        index={0}
        onPhotoClick={onPhotoClick}
        buttonClassName="block w-full"
        imgClassName="w-full max-h-[350px] object-cover border-2 border-ink/85 shadow-sm collage-shape-1"
      />
    </div>
  );
}

function TwoPhotosLayout({ photos, onPhotoClick, className }: CollageProps) {
  return (
    <div className={`mt-4 grid grid-cols-2 gap-2 ${className}`}>
      <PhotoButton
        photo={photos[0]}
        index={0}
        onPhotoClick={onPhotoClick}
        imgClassName="w-full h-40 object-cover border-2 border-ink/80 collage-shape-2"
      />
      <PhotoButton
        photo={photos[1]}
        index={1}
        onPhotoClick={onPhotoClick}
        imgClassName="w-full h-40 object-cover border-2 border-ink/80 collage-shape-3"
      />
    </div>
  );
}

function ThreePhotosLayout({ photos, onPhotoClick, className }: CollageProps) {
  return (
    <div className={`mt-4 grid grid-cols-2 gap-2 ${className}`}>
      <PhotoButton
        photo={photos[0]}
        index={0}
        onPhotoClick={onPhotoClick}
        buttonClassName="col-span-2"
        imgClassName="w-full h-40 object-cover border-2 border-ink/80 collage-shape-1"
      />
      <PhotoButton
        photo={photos[1]}
        index={1}
        onPhotoClick={onPhotoClick}
        imgClassName="w-full h-32 object-cover border-2 border-ink/80 collage-shape-2"
      />
      <PhotoButton
        photo={photos[2]}
        index={2}
        onPhotoClick={onPhotoClick}
        imgClassName="w-full h-32 object-cover border-2 border-ink/80 collage-shape-3"
      />
    </div>
  );
}

function FourPhotosLayout({ photos, onPhotoClick, className }: CollageProps) {
  return (
    <div className={`mt-4 grid grid-cols-2 gap-2 ${className}`}>
      <PhotoButton
        photo={photos[0]}
        index={0}
        onPhotoClick={onPhotoClick}
        imgClassName="w-full h-32 object-cover border-2 border-ink/80 collage-shape-2"
      />
      <PhotoButton
        photo={photos[1]}
        index={1}
        onPhotoClick={onPhotoClick}
        imgClassName="w-full h-32 object-cover border-2 border-ink/80 collage-shape-3"
      />
      <PhotoButton
        photo={photos[2]}
        index={2}
        onPhotoClick={onPhotoClick}
        imgClassName="w-full h-32 object-cover border-2 border-ink/80 collage-shape-4"
      />
      <PhotoButton
        photo={photos[3]}
        index={3}
        onPhotoClick={onPhotoClick}
        imgClassName="w-full h-32 object-cover border-2 border-ink/80 collage-shape-1"
      />
    </div>
  );
}

export function Collage({
  photos,
  onPhotoClick,
  className = "",
}: CollageProps) {
  const validPhotos = photos?.filter(Boolean) || [];
  if (validPhotos.length === 0) return null;

  const props = { photos: validPhotos, onPhotoClick, className };

  if (validPhotos.length === 1) return <SinglePhotoLayout {...props} />;
  if (validPhotos.length === 2) return <TwoPhotosLayout {...props} />;
  if (validPhotos.length === 3) return <ThreePhotosLayout {...props} />;
  return <FourPhotosLayout {...props} />;
}
