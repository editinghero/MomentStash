import { ReactNode } from "react";

interface PolaroidProps {
  src?: string;
  alt: string;
  caption?: string;
  rotate?: number;
  tape?: "pink" | "mint" | "lavender" | "yellow";
  tapeSide?: "top" | "left" | "right";
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

const tapeColor: Record<string, string> = {
  pink: "bg-tape-pink",
  mint: "bg-tape-mint",
  lavender: "bg-tape-lavender",
  yellow: "bg-tape-yellow",
};

export function Polaroid({
  src,
  alt,
  caption,
  rotate = 0,
  tape = "yellow",
  tapeSide = "top",
  className = "",
  children,
  onClick,
}: PolaroidProps) {
  return (
    <div
      className={`inline-block ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div
        onClick={onClick}
        className={`relative inline-block bg-paper p-3 pb-10 shadow-[var(--shadow-paper)] hover:shadow-[var(--shadow-lift)] transition-all duration-300 hover:-translate-y-1 ${onClick ? "cursor-pointer hover:scale-[1.02]" : ""}`}
      >
        {/* Washi tape */}
        {tapeSide === "top" && (
          <span
            className={`absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-20 ${tapeColor[tape]} mix-blend-multiply rotate-[-4deg]`}
            style={{ clipPath: "polygon(2% 20%, 98% 8%, 96% 80%, 4% 92%)" }}
          />
        )}
        {tapeSide === "left" && (
          <span
            className={`absolute top-1/3 -left-4 h-6 w-16 ${tapeColor[tape]} mix-blend-multiply rotate-[-25deg]`}
            style={{ clipPath: "polygon(2% 20%, 98% 8%, 96% 80%, 4% 92%)" }}
          />
        )}
        {tapeSide === "right" && (
          <span
            className={`absolute top-1/4 -right-4 h-6 w-16 ${tapeColor[tape]} mix-blend-multiply rotate-[20deg]`}
            style={{ clipPath: "polygon(2% 20%, 98% 8%, 96% 80%, 4% 92%)" }}
          />
        )}
        <div className="grid aspect-square w-full place-items-center overflow-hidden bg-paper-deep/60">
          {src ? (
            <img
              src={src}
              alt={alt}
              loading="lazy"
              className="block h-full w-full object-cover"
            />
          ) : (
            children
          )}
        </div>
        {caption && (
          <p className="absolute bottom-2 left-0 right-0 text-center font-hand text-lg text-ink-soft">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
