"use client";

import {
  Instagram,
  Github,
  Mail,
  Linkedin,
  Twitter,
  Facebook,
  Calendar,
  Music2,
} from "lucide-react";
import SocialLink from "./SocialLink";
import MatrixRain from "./MatrixRain";

const socialLinks = [
  {
    href: "https://www.instagram.com/tankps/",
    icon: Instagram,
    label: "Instagram",
    username: "@tankps",
    color: "text-pink-600 dark:text-pink-400",
  },
  {
    href: "https://github.com/duckfollow",
    icon: Github,
    label: "GitHub",
    username: "@duckfollow",
    color: "text-gray-800 dark:text-gray-200",
  },
  {
    href: "https://www.tiktok.com/@tankps_",
    icon: Music2,
    label: "TikTok",
    username: "@tankps_",
    color: "text-black dark:text-white",
  },
  {
    href: "https://www.linkedin.com/in/prasit-suphancho-864014195/",
    icon: Linkedin,
    label: "LinkedIn",
    username: "prasit-suphancho",
    color: "text-blue-700 dark:text-blue-400",
  },
  {
    href: "https://twitter.com/slammonder",
    icon: Twitter,
    label: "Twitter",
    username: "@slammonder",
    color: "text-sky-500 dark:text-sky-400",
  },
  {
    href: "https://www.facebook.com/prasit.suphancho",
    icon: Facebook,
    label: "Facebook",
    username: "prasit.suphancho",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    href: "mailto:p.supancho@gmail.com",
    icon: Mail,
    label: "Email",
    username: "p.supancho@gmail.com",
    color: "text-red-500 dark:text-red-400",
  },
  {
    href: "https://th.techcal.dev/",
    icon: Calendar,
    label: "Calendar",
    username: "Tech Events",
    color: "text-emerald-600 dark:text-emerald-400",
  },
];

export default function SocialGrid() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-black relative overflow-hidden">
      {/* Matrix rain background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <MatrixRain />
      </div>

      {/* Section background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-yellow-300/20 to-transparent dark:from-amber-400/10" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Connect With Me
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
            Follow my journey across social platforms
          </p>
        </div>

        {/* Social links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {socialLinks.map((link, index) => (
            <div
              key={link.label}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <SocialLink
                href={link.href}
                icon={link.icon}
                label={link.label}
                username={link.username}
                color={link.color}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center animate-fade-in">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} Prasit Suphancho. All rights reserved.
        </p>
      </footer>
    </section>
  );
}

