import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Google Analytics Measurement ID from environment variable
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_BASE_URL || "https://duckfollow.co",
);
const title = "Prasit Suphancho — Developer & Open Source Tools";
const description =
  "Software developer behind EDITH, Ultron, Dum-E, and u. Explore open-source tools for debugging, terminals, databases, and API workflows.";
const socialImage = {
  url: "/social-preview",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Prasit Suphancho (@tankps / duckfollow) — developer of EDITH, Ultron, Dum-E, and u. Less friction. More building.",
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  keywords: [
    "Prasit Suphancho",
    "tankps",
    "duckfollow",
    "developer",
    "open source",
    "developer tools",
    "EDITH",
    "Ultron",
    "Dum-E",
    "API workflows",
  ],
  authors: [{ name: "Prasit Suphancho" }],
  creator: "Prasit Suphancho",
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Pedwork — Prasit Suphancho",
    type: "website",
    locale: "en_US",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@slammonder",
    images: [socialImage],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Analytics */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
