"use client";

import { useEffect, useState, useCallback } from "react";
import { Sun, Moon } from "lucide-react";
import { trackClick } from "@/lib/gtag";

const BUTTON_BASE_STYLES =
  "p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg";

const BUTTON_INTERACTIVE_STYLES =
  "dark:bg-black/20 dark:border-white/10 hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

    setIsDark(shouldBeDark);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = isDark ? "light" : "dark";

    setIsDark(!isDark);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    trackClick(`theme_toggle_${newTheme}`);
  }, [isDark]);

  // Skeleton loader while hydrating
  if (!mounted) {
    return (
      <div className="fixed top-6 right-6 z-50">
        <div className={BUTTON_BASE_STYLES}>
          <div className="w-6 h-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-6 right-6 z-50">
      <button
        onClick={toggleTheme}
        className={`${BUTTON_BASE_STYLES} ${BUTTON_INTERACTIVE_STYLES}`}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? (
          <Sun className="w-6 h-6 text-amber-300 group-hover:rotate-180 transition-transform duration-500" />
        ) : (
          <Moon className="w-6 h-6 text-orange-700 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </button>
    </div>
  );
}
