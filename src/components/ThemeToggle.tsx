"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { trackClick } from "@/lib/gtag";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDarkMode = theme === "dark" || (!theme && systemPrefersDark);
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("theme", newTheme);

    // Track theme toggle event
    trackClick(`theme_toggle_${newTheme}`);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <button
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg transition-all duration-300"
        aria-label="Toggle theme"
      >
        <div className="w-6 h-6" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-6 h-6 text-amber-300 group-hover:rotate-180 transition-transform duration-500" />
      ) : (
        <Moon className="w-6 h-6 text-orange-700 group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
