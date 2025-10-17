/**
 * 🔧 SERVICE WORKER - PWA Offline Support
 * 
 * Enables offline functionality for Langflix
 */

const CACHE_NAME = 'langflix-v1.0.0';
const OFFLINE_CACHE = 'langflix-offline-v1';

// Files to cache for offline use
const STATIC_ASSETS = [
    '/',
    '/flashcard-review.html',
    '/progress-dashboard.html',
    '/ai-voice-chat.html',
    '/unified-feed.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    '/api/vocabulary-review/stats',
    '/api/level-progression/current',
    '/api/vocabulary-review/due'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('❌ Service Worker: Install failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🔧 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
                            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle API requests (network first, cache as backup)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful API responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(OFFLINE_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                console.log('📦 Serving from cache:', request.url);
                                return cachedResponse;
                            }
                            // Return offline fallback for API calls
                            return new Response(
                                JSON.stringify({
                                    success: false,
                                    error: 'You are offline',
                                    offline: true
                                }),
                                {
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            );
                        });
                })
        );
        return;
    }

    // Handle static assets (cache first, network as backup)
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version and update in background
                    fetch(request)
                        .then((response) => {
                            if (response.ok) {
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(request, response);
                                });
                            }
                        })
                        .catch(() => {}); // Ignore network errors
                    
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request)
                    .then((response) => {
                        // Cache successful responses
                        if (response.ok) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Network failed and not in cache
                        // Return offline page for HTML requests
                        if (request.headers.get('Accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});

// Background sync event
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-reviews') {
        console.log('🔄 Background sync: Syncing reviews');
        event.waitUntil(syncReviews());
    }
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('🔔 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Time to review your vocabulary!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'review',
                title: 'Review Now',
                icon: '/icons/checkmark.png'
            },
            {
                action: 'later',
                title: 'Remind Me Later',
                icon: '/icons/clock.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Langflix - Vocabulary Review', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification click:', event.action);
    
    event.notification.close();

    if (event.action === 'review') {
        event.waitUntil(
            clients.openWindow('/flashcard-review.html')
        );
    } else if (event.action === 'later') {
        // Schedule reminder for later
        console.log('Reminder scheduled for later');
    } else {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message event - handle messages from pages
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        const urls = event.data.urls;
        event.waitUntil(
            caches.open(OFFLINE_CACHE).then((cache) => {
                return cache.addAll(urls);
            })
        );
    }
});

// Helper function to sync reviews
async function syncReviews() {
    try {
        // Get pending reviews from IndexedDB
        const db = await openDatabase();
        const reviews = await getPendingReviews(db);

        // Sync each review
        for (const review of reviews) {
            try {
                const response = await fetch('/api/vocabulary-review/review', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(review)
                });

                if (response.ok) {
                    await markReviewAsSynced(db, review.id);
                }
            } catch (error) {
                console.error('Failed to sync review:', error);
            }
        }

        console.log('✅ Reviews synced');
    } catch (error) {
        console.error('❌ Sync failed:', error);
    }
}

// IndexedDB helpers (stub implementations)
function openDatabase() {
    return new Promise((resolve) => {
        // TODO: Implement proper IndexedDB
        resolve(null);
    });
}

function getPendingReviews(db) {
    return Promise.resolve([]);
}

function markReviewAsSynced(db, reviewId) {
    return Promise.resolve();
}

console.log('✅ Service Worker loaded successfully');

