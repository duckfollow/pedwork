"use client";

import { useState } from "react";
import Image from "next/image";
import { trackClick, trackSocialClick, trackCTAClick } from "@/lib/gtag";

// =============================================================================
// NIGHT AT DETECTIVE — Game Promotion Page
// =============================================================================
// A single-file client component with all features:
// - Interactive wishlist toggle with state
// - Disabled stream button with tooltip
// - Responsive design (mobile → desktop)
// - Hover/press transitions
// - Fallback handling for missing hero image
// Note: SEO metadata is handled in layout.tsx
// =============================================================================

export default function NightAtDetectivePage() {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------
  const handleWishlistToggle = () => {
    const newState = !isWishlisted;
    setIsWishlisted(newState);
    
    // Track wishlist action in Google Analytics
    trackCTAClick(newState ? "wishlist_add" : "wishlist_remove");
    
    // Log to console as requested
    console.log(
      newState
        ? "✅ Added to Wishlist: Night At Detective"
        : "❌ Removed from Wishlist: Night At Detective"
    );
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-zinc-950">
      {/* ===================================================================
          HERO BACKGROUND — Image with gradient overlays
      =================================================================== */}
      <div className="absolute inset-0 z-0">
        {!imageError ? (
          <Image
            src="/games/hero.png"
            alt="Night At Detective game artwork"
            fill
            priority
            className="object-cover object-center opacity-60"
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback: atmospheric noir gradient when image is missing
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-slate-800 to-zinc-950">
            {/* Subtle texture pattern for visual interest */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
                                  radial-gradient(circle at 75% 75%, rgba(234, 88, 12, 0.1) 0%, transparent 50%)`
              }}
            />
          </div>
        )}
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/60" />
      </div>

      {/* ===================================================================
          HERO CONTENT SECTION — Title, tagline, and CTA buttons
      =================================================================== */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 py-24 md:items-start md:px-20 md:py-28 lg:px-32 lg:py-32 xl:px-40">
        {/* Decorative accent line */}
        <div className="mb-6 h-1 w-16 bg-gradient-to-r from-amber-500 to-orange-600 md:w-24" />

        {/* Game Title */}
        <h1
          className="mb-4 text-center font-serif text-5xl font-bold tracking-tight text-white drop-shadow-2xl 
                     md:text-left md:text-6xl lg:text-7xl xl:text-8xl"
          style={{
            textShadow: "0 0 40px rgba(251, 191, 36, 0.3)",
            fontFamily: "'Playfair Display', 'Georgia', serif",
          }}
        >
          Night At{" "}
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Detective
          </span>
        </h1>

        {/* Tagline — 2 lines describing the game */}
        <p
          className="mb-10 max-w-xl text-center text-lg leading-relaxed text-zinc-300 
                     md:text-left md:text-xl lg:text-2xl"
        >
          Every shadow hides a secret. Every clue leads deeper into the darkness.
          <br />
          <span className="text-amber-400/90">Will you uncover the truth before it consumes you?</span>
        </p>

        {/* ---------------------------------------------------------------
            ACTION BUTTONS — Wishlist (toggle) + Stream (disabled)
        --------------------------------------------------------------- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          
          {/* WISHLIST BUTTON — Toggle with state, accessible */}
          <button
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isWishlisted}
            className={`
              group relative flex items-center justify-center gap-3 overflow-hidden rounded-lg px-6 py-3 
              text-base font-semibold tracking-wide whitespace-nowrap shadow-xl transition-all duration-300 ease-out
              focus:outline-none focus:ring-4 focus:ring-amber-500/50
              active:scale-95 sm:px-8 sm:py-3 sm:text-lg
              ${
                isWishlisted
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/30"
                  : "bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-950 hover:from-amber-400 hover:to-orange-500 hover:shadow-amber-500/40"
              }
              hover:scale-105 hover:shadow-2xl
            `}
          >
            {/* Animated shine effect on hover */}
            <span
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                         transition-transform duration-700 group-hover:translate-x-full"
            />
            {/* Icon — changes based on state */}
            <span className="relative text-2xl" aria-hidden="true">
              {isWishlisted ? "✓" : "♥"}
            </span>
            {/* Label — changes based on state */}
            <span className="relative">
              {isWishlisted ? "Wishlisted!" : "Add to Wishlist"}
            </span>
          </button>

          {/* STREAM BUTTON — Disabled with tooltip */}
          <div className="group relative">
            <button
              disabled
              aria-label="Stream feature coming soon, not available yet"
              aria-disabled="true"
              onClick={() => trackClick("stream_button_disabled")}
              className="flex h-full cursor-not-allowed items-center justify-center gap-3 rounded-lg border-2 
                         border-zinc-600 bg-zinc-800/50 px-6 py-3 text-base font-semibold tracking-wide 
                         whitespace-nowrap text-zinc-500 opacity-70 backdrop-blur-sm transition-all duration-300
                         hover:border-zinc-500 hover:bg-zinc-800/70 sm:px-8 sm:py-3 sm:text-lg"
            >
              {/* Steam icon */}
              <img 
                src="/games/Steam_icon_logo.svg" 
                alt="" 
                aria-hidden="true"
                className="h-6 w-6"
              />
              <span>Stream</span>
              <span className="rounded bg-zinc-700/80 px-2 py-0.5 text-xs uppercase tracking-wider text-zinc-400">
                Coming Soon
              </span>
            </button>

            {/* Tooltip — appears on hover */}
            <div
              role="tooltip"
              className="pointer-events-none absolute -top-12 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap 
                         rounded-md bg-zinc-800 px-4 py-2 text-sm text-zinc-300 opacity-0 shadow-xl 
                         transition-opacity duration-200 group-hover:opacity-100"
            >
              Not available yet
              {/* Tooltip arrow */}
              <span className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-zinc-800" />
            </div>

            {/* Visually hidden note for screen readers */}
            <span className="sr-only">Stream feature is not available yet</span>
          </div>

          {/* FACEBOOK BUTTON — Links to Facebook page */}
          <a
            href="https://www.facebook.com/profile.php?id=61579204036362"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Facebook"
            onClick={() => trackSocialClick("facebook_nad")}
            className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-lg 
                       bg-[#1877F2] px-6 py-3 text-base font-semibold tracking-wide whitespace-nowrap text-white shadow-xl 
                       transition-all duration-300 ease-out
                       hover:scale-105 hover:bg-[#166FE5] hover:shadow-2xl hover:shadow-blue-500/30
                       focus:outline-none focus:ring-4 focus:ring-blue-500/50
                       active:scale-95 sm:px-8 sm:py-3 sm:text-lg"
          >
            {/* Animated shine effect on hover */}
            <span
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                         transition-transform duration-700 group-hover:translate-x-full"
            />
            {/* Facebook icon */}
            <svg 
              className="relative h-6 w-6" 
              fill="currentColor" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {/* Label */}
            <span className="relative">Facebook</span>
          </a>
        </div>

        {/* ---------------------------------------------------------------
            STATUS BADGE — Development info
        --------------------------------------------------------------- */}
        <div className="mt-12 flex items-center gap-4 text-sm text-zinc-500">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            In Development
          </span>
          <span className="text-zinc-700">|</span>
          <span>PC • Console</span>
        </div>
      </section>

      {/* ===================================================================
          DECORATIVE ELEMENTS — Ambient effects for atmosphere
      =================================================================== */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
        {/* Ambient glow spots — noir atmosphere */}
        <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-orange-600/10 blur-3xl" />
      </div>

      {/* ===================================================================
          FOOTER — Minimal branding
      =================================================================== */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-8 p-6 text-xs text-zinc-600">
        <span>© 2025 Night At Detective</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">All rights reserved</span>
      </footer>
    </main>
  );
}
