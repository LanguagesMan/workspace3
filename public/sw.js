/**
 * 🚀 LANGFLIX SERVICE WORKER
 * 
 * Performance optimization with:
 * - Offline article caching
 * - API response caching
 * - Image optimization
 * - Prefetching strategy
 * - Background sync
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `langflix-${CACHE_VERSION}`;

// Cache strategies
const PRECACHE_URLS = [
    '/',
    '/discover-redesigned.html',
    '/tiktok-video-feed.html',
    '/profile.html',
    '/css/article-reader.css',
    // Add critical assets
];

const API_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const ARTICLE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// ========================================
// INSTALL - Precache critical assets
// ========================================
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Precaching critical assets');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('📦 Service Worker: Precache failed:', error);
            })
    );
});

// ========================================
// ACTIVATE - Clean up old caches
// ========================================
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('langflix-') && name !== CACHE_NAME)
                        .map((name) => {
                            console.log(`🗑️ Service Worker: Deleting old cache: ${name}`);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// ========================================
// FETCH - Intelligent caching strategy
// ========================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Choose strategy based on request type
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleAPIRequest(request));
    } else if (isImageRequest(request)) {
        event.respondWith(handleImageRequest(request));
    } else if (isArticleRequest(request)) {
        event.respondWith(handleArticleRequest(request));
    } else {
        event.respondWith(handleStaticRequest(request));
    }
});

// ========================================
// API REQUESTS - Network First with Cache Fallback
// ========================================
async function handleAPIRequest(request) {
    const url = new URL(request.url);
    
    // Don't cache mutation requests
    if (request.method !== 'GET') {
        return fetch(request);
    }

    // Check if critical API (always fresh)
    const criticalAPIs = ['/api/auth/', '/api/payment/'];
    if (criticalAPIs.some(api => url.pathname.includes(api))) {
        return fetch(request);
    }

    try {
        // Try network first
        const response = await fetch(request);
        
        if (response.ok) {
            // Cache successful response
            const cache = await caches.open(CACHE_NAME);
            const responseToCache = response.clone();
            
            // Add expiry metadata
            const headers = new Headers(responseToCache.headers);
            headers.set('sw-cached-at', Date.now().toString());
            
            const cachedResponse = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers
            });
            
            cache.put(request, cachedResponse);
            return response;
        }
        
        // If response not ok, try cache
        return getCachedOrError(request);
        
    } catch (error) {
        // Network failed, try cache
        console.log('📡 Network failed, trying cache:', request.url);
        return getCachedOrError(request);
    }
}

// ========================================
// IMAGE REQUESTS - Cache First
// ========================================
async function handleImageRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    
    // Try cache first
    const cached = await cache.match(request);
    if (cached) {
        // Check if expired
        const cachedAt = cached.headers.get('sw-cached-at');
        if (cachedAt && Date.now() - parseInt(cachedAt) < IMAGE_CACHE_DURATION) {
            return cached;
        }
    }
    
    // Fetch from network
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const headers = new Headers(response.headers);
            headers.set('sw-cached-at', Date.now().toString());
            
            const cachedResponse = new Response(response.clone().body, {
                status: response.status,
                statusText: response.statusText,
                headers
            });
            
            cache.put(request, cachedResponse);
        }
        
        return response;
        
    } catch (error) {
        // Return cached version even if expired
        if (cached) {
            return cached;
        }
        
        // Return placeholder image
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#111" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="#888" font-size="20">Image Offline</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
}

// ========================================
// ARTICLE REQUESTS - Stale While Revalidate
// ========================================
async function handleArticleRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    // Fetch from network in background
    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                const headers = new Headers(response.headers);
                headers.set('sw-cached-at', Date.now().toString());
                
                const cachedResponse = new Response(response.clone().body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers
                });
                
                cache.put(request, cachedResponse);
            }
            return response;
        })
        .catch(() => null);
    
    // Return cached immediately, or wait for network
    return cached || await fetchPromise || new Response('Article unavailable offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// ========================================
// STATIC REQUESTS - Cache First
// ========================================
async function handleStaticRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            cache.put(request, response.clone());
        }
        
        return response;
        
    } catch (error) {
        return new Response('Offline - Resource not cached', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================
async function getCachedOrError(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
        // Check if expired
        const cachedAt = cached.headers.get('sw-cached-at');
        if (cachedAt && Date.now() - parseInt(cachedAt) > API_CACHE_DURATION) {
            console.log('⚠️ Returning expired cache:', request.url);
        }
        return cached;
    }
    
    return new Response(
        JSON.stringify({
            success: false,
            error: 'Offline - No cached data available',
            offline: true
        }),
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

function isImageRequest(request) {
    const url = new URL(request.url);
    return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname) ||
           request.destination === 'image';
}

function isArticleRequest(request) {
    const url = new URL(request.url);
    return url.pathname.includes('/articles/') ||
           url.pathname.includes('/discover');
}

// ========================================
// BACKGROUND SYNC - Queue failed requests
// ========================================
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event.tag);
    
    if (event.tag === 'sync-articles') {
        event.waitUntil(syncArticles());
    } else if (event.tag === 'sync-vocabulary') {
        event.waitUntil(syncVocabulary());
    }
});

async function syncArticles() {
    console.log('📚 Syncing articles...');
    // Implement article sync logic
}

async function syncVocabulary() {
    console.log('📝 Syncing vocabulary...');
    // Implement vocabulary sync logic
}

// ========================================
// PUSH NOTIFICATIONS
// ========================================
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    
    const options = {
        body: data.body || 'New content available!',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Langflix', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

// ========================================
// MESSAGE - Commands from main thread
// ========================================
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_ARTICLES':
            cacheArticles(payload.articles);
            break;
            
        case 'PREFETCH':
            prefetchResources(payload.urls);
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches();
            break;
    }
});

async function cacheArticles(articles) {
    const cache = await caches.open(CACHE_NAME);
    
    for (const article of articles) {
        if (article.url) {
            try {
                const response = await fetch(article.url);
                if (response.ok) {
                    await cache.put(article.url, response);
                }
            } catch (error) {
                console.error('Failed to cache article:', article.url);
            }
        }
    }
}

async function prefetchResources(urls) {
    const cache = await caches.open(CACHE_NAME);
    
    for (const url of urls) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
            }
        } catch (error) {
            console.error('Failed to prefetch:', url);
        }
    }
}

async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map((name) => caches.delete(name))
    );
    console.log('🗑️ All caches cleared');
}

console.log('✅ Service Worker loaded');

