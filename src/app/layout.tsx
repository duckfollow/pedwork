import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pedwork ——— @duckfollow",
  description:
    "A personal profile website designed to make you stand out. Pedwork is your digital identity card, crafted to introduce who you are and showcase your projects, achievements, and unique personality in a confident, stylish way. Whether you’re a creative, a professional, or just someone with a story to tell, Pedwork gives you the tools to present yourself with attitude and clarity — like wearing your name badge with pride on a modern digital stage.",
  openGraph: {
    title: "Pedwork ——— @duckfollow",
    description:
      "A personal profile website designed to make you stand out. Pedwork is your digital identity card, crafted to introduce who you are and showcase your projects, achievements, and unique personality in a confident, stylish way. Whether you’re a creative, a professional, or just someone with a story to tell, Pedwork gives you the tools to present yourself with attitude and clarity — like wearing your name badge with pride on a modern digital stage.",
    url: "https://duckfollow.co/", // <- แก้เป็นโดเมนจริง
    type: "website",
    images: [
      {
        url: "https://pedwork.vercel.app/images/og-thumbnail.png", // absolute URL
        width: 1200,
        height: 630,
        alt: "Pedwork — Your digital badge of honor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pedwork ——— @duckfollow",
    description:
      "A personal profile website designed to make you stand out. Pedwork is your digital identity card, crafted to introduce who you are and showcase your projects, achievements, and unique personality in a confident, stylish way. Whether you’re a creative, a professional, or just someone with a story to tell, Pedwork gives you the tools to present yourself with attitude and clarity — like wearing your name badge with pride on a modern digital stage.",
    images: [
      "https://pedwork.vercel.app/images/og-thumbnail.png", // absolute URL
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && systemPrefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} cz-shortcut-listen="true">
        {children}
      </body>
    </html>
  );
}
