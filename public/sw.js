// Photo Stamp Service Worker
const CACHE_NAME = 'photo-stamp-v1';
const OFFLINE_URL = '/features/stamp';

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/features/stamp',
  '/manifest.json',
  '/images/Paper_Texture.png',
  '/images/Crumpled-white-paper-texture-background-768x512.jpg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache static assets
      await cache.addAll(STATIC_ASSETS);
      // Enable immediate activation
      await self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      // Take control of all pages immediately
      await self.clients.claim();
    })()
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except for CDN assets)
  if (url.origin !== self.location.origin) {
    // Allow caching of external fonts and CDN resources
    if (!url.hostname.includes('fonts.googleapis.com') && 
        !url.hostname.includes('fonts.gstatic.com')) {
      return;
    }
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first for navigation
          const networkResponse = await fetch(request);
          
          // Cache the response for offline use
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
          
          return networkResponse;
        } catch (error) {
          // Network failed, try cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Return cached offline page
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
          
          // Last resort - return a basic offline response
          return new Response('Photo Stamp is offline. Please check your connection.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
      })()
    );
    return;
  }

  // Handle static assets - cache first, then network
  event.respondWith(
    (async () => {
      // Check cache first
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // Return cached response and update cache in background
        event.waitUntil(
          (async () => {
            try {
              const networkResponse = await fetch(request);
              const cache = await caches.open(CACHE_NAME);
              await cache.put(request, networkResponse);
            } catch {
              // Network failed, but we already returned cached response
            }
          })()
        );
        return cachedResponse;
      }

      // Not in cache, fetch from network
      try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Network failed and no cache - return error for non-navigation requests
        console.error('Fetch failed:', error);
        throw error;
      }
    })()
  );
});

// Handle share target (receiving shared images)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Check if this is a share target POST request
  if (event.request.method === 'POST' && url.pathname === '/features/stamp') {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const imageFile = formData.get('image');
        
        // Store the shared image temporarily
        if (imageFile) {
          // Create a client and send the image data
          const clients = await self.clients.matchAll({ type: 'window' });
          
          if (clients.length > 0) {
            // Convert file to data URL
            const reader = new FileReader();
            const dataUrl = await new Promise((resolve) => {
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(imageFile);
            });
            
            // Send to client
            clients[0].postMessage({
              type: 'SHARED_IMAGE',
              data: dataUrl,
            });
          }
        }
        
        // Redirect to the stamp page
        return Response.redirect('/features/stamp?shared=true', 303);
      })()
    );
  }
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-stamps') {
    event.waitUntil(
      // Sync any pending offline actions
      Promise.resolve()
    );
  }
});

