import type { Metadata } from "next";

// =============================================================================
// SEO & SOCIAL SHARING METADATA for /nad page
// =============================================================================
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pedwork.vercel.app";

export const metadata: Metadata = {
  title: "Night At Detective",
  description:
    "Every shadow hides a secret. Every clue leads deeper into the darkness. Unravel the mystery in this gripping noir detective game.",
  
  // Open Graph (Facebook, LinkedIn, Discord, etc.)
  openGraph: {
    title: "Night At Detective",
    description:
      "Every shadow hides a secret. Every clue leads deeper into the darkness. Unravel the mystery in this gripping noir detective game.",
    url: `${baseUrl}/nad`,
    siteName: "Night At Detective",
    type: "website",
    images: [
      {
        url: `${baseUrl}/games/nad-meta.png`,
        width: 1200,
        height: 630,
        alt: "Night At Detective - A noir detective mystery game",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Night At Detective",
    description:
      "Every shadow hides a secret. Every clue leads deeper into the darkness. Unravel the mystery in this gripping noir detective game.",
    images: [
      {
        url: `${baseUrl}/games/nad-meta.png`,
        alt: "Night At Detective - A noir detective mystery game",
      },
    ],
  },

  // Additional meta
  keywords: ["detective game", "mystery", "noir", "indie game", "puzzle", "Night At Detective"],
  authors: [{ name: "Night At Detective Team" }],
};

// =============================================================================
// LAYOUT COMPONENT
// =============================================================================
export default function NadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

