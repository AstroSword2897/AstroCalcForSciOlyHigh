/**
 * Service Worker for AstroCalc - Offline Support
 * 
 * Caches all application resources for offline use
 */

const CACHE_NAME = 'astrocalc-v1.0.0';
const RUNTIME_CACHE = 'astrocalc-runtime-v1.0.0';

// Resources to cache on install
const PRECACHE_RESOURCES = [
    './',
    './index.html',
    './styles/main.css',
    './scripts/formulas.js',
    './scripts/calculator.js',
    './scripts/ui.js',
    './scripts/unitConverter.js',
    './scripts/expressionParser.js',
    './scripts/classification.js',
    './scripts/graphManager.js',
    './scripts/offlineGraphManager.js',
    './scripts/formulaExplorer.js',
    './scripts/frqSupport.js',
    './scripts/quickNav.js',
    './scripts/utils.js',
    './libs/mathjax/es5/tex-mml-chtml.js',
    './manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(PRECACHE_RESOURCES.map(url => new Request(url, { cache: 'reload' })))
                    .catch((error) => {
                        console.warn('[Service Worker] Failed to cache some resources:', error);
                        // Continue even if some resources fail to cache
                        return Promise.resolve();
                    });
            })
            .then(() => {
                console.log('[Service Worker] Skip waiting');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
            .then(() => {
                console.log('[Service Worker] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests (like Desmos API)
    if (!event.request.url.startsWith(self.location.origin) && 
        !event.request.url.includes('desmos.com')) {
        return;
    }

    // Handle Desmos API requests - don't cache, just pass through
    if (event.request.url.includes('desmos.com')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // If offline and Desmos fails, return a response indicating offline mode
                    return new Response(JSON.stringify({ offline: true }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // For local resources, use cache-first strategy
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response for caching
                        const responseToCache = response.clone();

                        // Cache successful responses
                        caches.open(RUNTIME_CACHE)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Network failed, check if we have a fallback
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        // Return a basic offline response for other requests
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Message event - handle messages from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

