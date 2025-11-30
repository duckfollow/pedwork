import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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

export const metadata: Metadata = {
  title: "Prasit Suphancho | @tankps - Personal Profile",
  description:
    "Personal profile website of Prasit Suphancho (@tankps). Software developer, creative thinker, and tech enthusiast. Connect with me on social media and explore my digital presence.",
  keywords: [
    "Prasit Suphancho",
    "tankps",
    "duckfollow",
    "developer",
    "portfolio",
    "personal website",
  ],
  authors: [{ name: "Prasit Suphancho" }],
  creator: "Prasit Suphancho",
  openGraph: {
    title: "Prasit Suphancho | @tankps - Personal Profile",
    description:
      "Personal profile website of Prasit Suphancho (@tankps). Software developer, creative thinker, and tech enthusiast. Connect with me on social media and explore my digital presence.",
    url: "https://duckfollow.co/",
    siteName: "Pedwork",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://pedwork.vercel.app/images/og-thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Prasit Suphancho - Personal Profile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prasit Suphancho | @tankps - Personal Profile",
    description:
      "Personal profile website of Prasit Suphancho (@tankps). Software developer, creative thinker, and tech enthusiast.",
    creator: "@slammonder",
    images: ["https://pedwork.vercel.app/images/og-thumbnail.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
      </body>
    </html>
  );
}
