const CACHE_NAME = 'evacuation-routes-v1';
const OFFLINE_ROUTES_CACHE = 'offline-routes-v1';

// Resources to cache for offline use
const urlsToCache = [
  '/',
  '/evacuation-routes',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Handle Google Maps API requests
  if (event.request.url.includes('maps.googleapis.com') || 
      event.request.url.includes('maps.gstatic.com')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          return response || fetch(event.request)
            .then((fetchResponse) => {
              // Cache the response for future offline use
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
              return fetchResponse;
            });
        })
        .catch(() => {
          // Return offline fallback for maps
          return new Response(JSON.stringify({
            error: 'Maps unavailable offline',
            message: 'Please connect to internet for full map functionality'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_ROUTES_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Message event - handle cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_ROUTE_DATA') {
    const routeData = event.data.payload;
    
    caches.open(OFFLINE_ROUTES_CACHE)
      .then((cache) => {
        const response = new Response(JSON.stringify(routeData));
        cache.put(`/offline-route-${routeData.id}`, response);
      });
  }
});
