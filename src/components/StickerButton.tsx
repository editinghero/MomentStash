import { ButtonHTMLAttributes, ReactNode } from "react";

interface StickerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "cream";
}

export function StickerButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: StickerButtonProps) {
  const base =
    variant === "primary"
      ? "bg-primary text-primary-foreground"
      : "bg-paper text-ink";
  return (
    <button
      {...props}
      className={`group relative inline-flex items-center gap-2 font-hand text-2xl px-8 py-3 border-2 border-ink rounded-[14px] ${base} shadow-[3px_3px_0_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150 ${className}`}
      style={{ borderRadius: "18px 22px 16px 24px / 22px 18px 24px 16px" }}
    >
      {children}
    </button>
  );
}
