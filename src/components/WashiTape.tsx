interface WashiTapeProps {
  color?: "pink" | "mint" | "lavender" | "yellow";
  rotate?: number;
  className?: string;
  width?: string;
}

const colorMap = {
  pink: "bg-tape-pink",
  mint: "bg-tape-mint",
  lavender: "bg-tape-lavender",
  yellow: "bg-tape-yellow",
};

export function WashiTape({ color = "pink", rotate = 0, className = "", width = "8rem" }: WashiTapeProps) {
  return (
    <span
      className={`block h-7 ${colorMap[color]} mix-blend-multiply ${className}`}
      style={{
        width,
        transform: `rotate(${rotate}deg)`,
        clipPath: "polygon(1% 18%, 99% 6%, 98% 82%, 2% 94%)",
      }}
    />
  );
}
