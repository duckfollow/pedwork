import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Photo Stamp - Create Vintage Stamps",
  description: "Transform your photos into beautiful vintage-style postage stamps. Add your location, choose colors, and share to Instagram Stories.",
  keywords: [
    "photo stamp",
    "vintage stamp",
    "photo editor",
    "postage stamp",
    "instagram story",
    "photo filter",
    "vintage filter",
  ],
  authors: [{ name: "pedwork.co" }],
  creator: "pedwork.co",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Photo Stamp",
  },
  openGraph: {
    title: "Photo Stamp - Create Vintage Stamps",
    description: "Transform your photos into beautiful vintage-style postage stamps",
    url: "https://pedwork.co/features/stamp",
    siteName: "Photo Stamp by pedwork.co",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/images/og-thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Photo Stamp - Create Vintage Stamps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo Stamp - Create Vintage Stamps",
    description: "Transform your photos into beautiful vintage-style postage stamps",
    images: ["/images/og-thumbnail.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Photo Stamp",
    "apple-mobile-web-app-title": "Photo Stamp",
    "msapplication-TileColor": "#f59e0b",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f59e0b" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function StampLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* PWA Icons for iOS - using SVG fallback */}
      <link rel="apple-touch-icon" href="/icons/stamp-icon.svg" />
      
      {/* Service Worker Registration Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js', { scope: '/features/stamp' })
                  .then(function(registration) {
                    console.log('Photo Stamp SW registered:', registration.scope);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available, show update prompt
                            if (confirm('New version of Photo Stamp available! Reload to update?')) {
                              newWorker.postMessage({ type: 'SKIP_WAITING' });
                              window.location.reload();
                            }
                          }
                        });
                      }
                    });
                  })
                  .catch(function(error) {
                    console.log('Photo Stamp SW registration failed:', error);
                  });
                  
                // Handle shared images from other apps
                navigator.serviceWorker.addEventListener('message', (event) => {
                  if (event.data && event.data.type === 'SHARED_IMAGE') {
                    // Store in sessionStorage for the app to pick up
                    sessionStorage.setItem('sharedImage', event.data.data);
                    window.dispatchEvent(new CustomEvent('sharedImage', { detail: event.data.data }));
                  }
                });
              });
            }
            
            // Handle iOS standalone mode
            if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
              document.documentElement.classList.add('pwa-standalone');
            }
          `,
        }}
      />
      {children}
    </>
  );
}

