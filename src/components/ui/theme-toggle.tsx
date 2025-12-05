import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-9 w-16 items-center rounded-full transition-colors duration-300",
        theme === "dark"
          ? "bg-slate-700"
          : "bg-gradient-to-r from-amber-200 to-orange-300",
        className
      )}
      aria-label="Toggle theme"
    >
      <span
        className={cn(
          "absolute flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300",
          theme === "dark" ? "translate-x-8" : "translate-x-1"
        )}
      >
        {theme === "dark" ? (
          <Moon className="h-4 w-4 text-slate-700" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </span>
    </button>
  );
}
