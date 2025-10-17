// SERVICE WORKER - TikTok-style aggressive caching
const CACHE_NAME = 'langflix-v1';
const PRECACHE_URLS = [
    '/',
    '/tiktok-video-feed.html',
    '/langflix-app.html',
    '/css/mobile-first-framework.css',
    '/api/videos?includeTranscript=true&limit=20'
];

// Install - precache critical resources
self.addEventListener('install', (event) => {
    console.log('⚡ Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Service Worker: Precaching', PRECACHE_URLS.length, 'URLs');
            return cache.addAll(PRECACHE_URLS);
        })
    );
    self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch - Network first, fallback to cache (TikTok strategy)
self.addEventListener('fetch', (event) => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;

    // Skip chrome extensions and non-http(s)
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('📦 Service Worker: Serving from cache:', event.request.url);
                        return cachedResponse;
                    }
                    // No cache either, return offline page
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// Background sync for analytics (TikTok pattern)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-analytics') {
        console.log('🔄 Service Worker: Syncing analytics');
        // Sync queued analytics when back online
    }
});
