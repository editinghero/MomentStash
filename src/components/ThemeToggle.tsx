import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`relative grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-paper hover:bg-accent transition-colors ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4 text-ink" /> : <Moon className="h-4 w-4 text-ink" />}
    </button>
  );
}
