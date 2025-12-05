"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Sparkles } from "lucide-react";
import { trackClick } from "@/lib/gtag";
import Link from "next/link";

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
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <div className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
          <div className="w-6 h-6" />
        </div>
        <div className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
          <div className="w-6 h-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
      {/* NAD Link Button */}
      <Link
        href="/nad"
        onClick={() => trackClick("nad_button_click")}
        className="p-3 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="NAD Page"
      >
        <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
      </Link>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="p-3 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Toggle theme"
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
