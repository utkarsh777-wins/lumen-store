"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  return (
    <button
      type="button"
      className="text-sm text-muted hover:text-ink"
      aria-label="Toggle color theme"
      onClick={() => setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark")}
    >
      <span className="dark:hidden">Dark</span>
      <span className="hidden dark:inline">Light</span>
    </button>
  );
}
