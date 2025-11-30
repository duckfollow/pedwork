"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ScrollIndicator() {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;

      // Check if user has scrolled past the hero section (more than 50% of viewport)
      const scrolledPastHero = scrollTop > windowHeight * 0.5;
      setIsAtBottom(scrolledPastHero);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    if (isAtBottom) {
      // Scroll to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      // Scroll to bottom (social grid section)
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 cursor-pointer group"
      aria-label={isAtBottom ? "Scroll to top" : "Scroll to bottom"}
    >
      <div
        className={`w-8 h-12 rounded-full border-2 flex items-center justify-center backdrop-blur-sm hover:scale-110 active:scale-95 transition-all duration-300 ${
          isAtBottom
            ? "border-orange-400 dark:border-amber-400 bg-orange-100/80 dark:bg-gray-800/80 hover:bg-orange-200 dark:hover:bg-gray-700"
            : "border-white/40 dark:border-white/30 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-white/10 animate-bounce"
        }`}
      >
        {isAtBottom ? (
          <ChevronUp className="w-5 h-5 text-orange-600 dark:text-amber-400 group-hover:text-orange-700 dark:group-hover:text-amber-300 transition-colors" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/80 dark:text-white/70 group-hover:text-white transition-colors animate-scroll-down" />
        )}
      </div>
    </button>
  );
}
