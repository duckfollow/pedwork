"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import styles from "@/app/portfolio.module.css";
export default function PortfolioThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  return (
    <button
      className={styles.themeToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => {
        const next = !dark;
        document.documentElement.classList.toggle("dark", next);
        try {
          localStorage.setItem("theme", next ? "dark" : "light");
        } catch {}
        setDark(next);
      }}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
