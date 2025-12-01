"use client";

import { LucideIcon } from "lucide-react";
import { trackSocialClick } from "@/lib/gtag";

interface SocialLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  username?: string;
  color?: string;
}

export default function SocialLink({
  href,
  icon: Icon,
  label,
  username,
  color = "text-gray-700 dark:text-gray-300",
}: SocialLinkProps) {
  const handleClick = () => {
    trackSocialClick(label);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 ease-out"
    >
      <div
        className={`p-4 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 mb-3 group-hover:scale-110 transition-transform duration-300 ${color}`}
      >
        <Icon className="w-7 h-7" strokeWidth={1.5} />
      </div>
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-amber-400 transition-colors duration-300">
        {label}
      </span>
      {username && (
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {username}
        </span>
      )}
    </a>
  );
}
