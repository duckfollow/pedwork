"use client";

import { useEffect } from "react";
import styles from "@/app/portfolio.module.css";

/** Enhance visible content only after hydration; the page works without JavaScript. */
export default function PortfolioMotion() {
  useEffect(() => {
    const root = document.getElementById("top");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root || !("IntersectionObserver" in window)) return;

    let observer: IntersectionObserver | undefined;
    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const reset = () => {
      observer?.disconnect();
      targets.forEach((target) => target.removeAttribute("data-motion-state"));
    };
    const start = () => {
      reset();
      if (preference.matches) return;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.setAttribute("data-motion-state", "visible");
            observer?.unobserve(entry.target);
          });
        },
        { threshold: 0.08 },
      );
      targets.forEach((target) => {
        // Keep content already on screen visible while hydration completes.
        if (target.getBoundingClientRect().top < window.innerHeight) return;
        target.setAttribute("data-motion-state", "pending");
        observer?.observe(target);
      });
    };
    start();
    preference.addEventListener("change", start);
    return () => {
      reset();
      preference.removeEventListener("change", start);
    };
  }, []);

  useEffect(() => {
    const root = document.getElementById("top");
    if (!root) return;
    const bar = root.querySelector<HTMLElement>("[data-reading-progress]");
    const header = root.querySelector("header");
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>("nav a[href^='#']"));
    const sections = links.map((link) => document.getElementById(link.hash.slice(1)));
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      bar?.style.setProperty("--reading-progress", String(progress));
      const readingLine = (header?.getBoundingClientRect().height ?? 80) + 70;
      let active = -1;
      sections.forEach((section, index) => {
        if (section && section.getBoundingClientRect().top <= readingLine) active = index;
      });
      if (progress >= 0.999 && scrollable > 0) active = sections.length - 1;
      links.forEach((link, index) => {
        if (index === active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();

    const pointerPreference = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const cards = root.querySelectorAll<HTMLElement>("[data-project]");
    const move = (event: PointerEvent) => {
      if (!pointerPreference.matches || event.pointerType !== "mouse") return;
      const card = event.currentTarget as HTMLElement;
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`);
      card.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`);
      card.setAttribute("data-spotlight", "active");
    };
    const clear = () => cards.forEach((card) => card.removeAttribute("data-spotlight"));
    cards.forEach((card) => {
      card.addEventListener("pointermove", move, { passive: true });
      card.addEventListener("pointerleave", clear);
      card.addEventListener("pointercancel", clear);
    });
    pointerPreference.addEventListener("change", clear);
    return () => {
      window.cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      pointerPreference.removeEventListener("change", clear);
      links.forEach((link) => link.removeAttribute("aria-current"));
      cards.forEach((card) => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", clear);
        card.removeEventListener("pointercancel", clear);
      });
      clear();
    };
  }, []);

  return <div className={styles.readingProgress} data-reading-progress aria-hidden="true" />;
}
