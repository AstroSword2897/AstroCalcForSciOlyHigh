/**
 * Service Worker for AstroCalc - Production-Grade Offline Support
 * 
 * Bulletproof caching strategy for competition/offline-exam conditions
 * 
 * Key improvements:
 * - Non-atomic caching (Promise.allSettled)
 * - Separate document/runtime caches
 * - Stale-while-revalidate for images
 * - Cache size limits for iOS Safari
 * - Better offline fallbacks
 * - Safe message handlers
 */

const CACHE_NAME = 'astrocalc-shell-v3.0.0-FORCE-REFRESH'; // Shell: HTML + core scripts
const RUNTIME_CACHE = 'astrocalc-runtime-v3.0.0-FORCE-REFRESH'; // Runtime: images + dynamic assets
const MAX_RUNTIME_ENTRIES = 100; // iOS Safari limit protection

// Dev mode detection
const DEV_MODE = false; // Set to true for cache hit logging

// Resources to cache on install (OFFLINE-FIRST: All resources are local)
// IMPORTANT: Only include files that actually exist in the repo
const PRECACHE_RESOURCES = [
    './',
    './index.html',
    './styles/main.css',
    './manifest.json',

    // Images (offline reference)
    './assets/images/hr-diagram.svg',
    './assets/images/henyey-hayashi-zams-track.svg',

    // Core scripts
    './scripts/formulas.js',
    './scripts/safeExpressionEvaluator.js',
    './scripts/unitConverter.js',
    './scripts/unitParser.js',
    './scripts/expressionParser.js',
    './scripts/precisionCalculator.js',
    './scripts/performanceOptimizer.js',
    './scripts/calculator.js',
    
    // Performance optimizers
    './scripts/calculatorOptimizer.js',
    './scripts/mathjaxOptimizer.js',
    './scripts/moduleLazyLoader.js',

    // Feature modules
    './scripts/classification.js',
    './scripts/formulaExplorer.js',
    './scripts/frqSupport.js',
    './scripts/quickNav.js',
    './scripts/formulaGraphConfig.js',
    './scripts/enhancedOfflineGraph.js',
    './scripts/graphManager.js',
    
    // UI Rendering
    './scripts/ui/rendering/VariableInputs.js',

    // UI (ES modules)
    './scripts/ui/ui/init.js',
    './scripts/ui/ui/UIModuleOrchestrator.js',
    './scripts/ui/ui/contracts.js',
    './scripts/ui/ui/utils/debounce.js',
    './scripts/ui/ui/modules/search/SearchEngine.js',
    './scripts/ui/ui/modules/search/Scorer.js',
    './scripts/ui/ui/modules/search/interfaces.js',
    './scripts/ui/ui/modules/calculation/CalculationOrchestrator.js',
    './scripts/ui/ui/modules/tabs/TabManager.js',
    './scripts/ui/ui/modules/graph/GraphCoordinator.js',
    './scripts/ui/ui/modules/formula/FormulaSelector.js',
    './scripts/ui/ui/modules/events/EventCoordinator.js',
    './scripts/ui/ui/modules/utils/CalculationUtils.js',
    './scripts/ui/ui/modules/utils/FormattingUtils.js',
    './scripts/ui/ui/modules/rendering/FormulaRenderer.js',

    // Libraries
    './libs/mathjax/es5/tex-mml-chtml.js'
];

/**
 * Cache individual resource (non-atomic - failures don't block others)
 */
async function cacheResource(cache, url) {
    try {
        const request = new Request(url, { cache: 'reload' });
        await cache.add(request);
        return { url, status: 'success' };
    } catch (error) {
        console.warn(`[Service Worker] Failed to cache ${url}:`, error);
        return { url, status: 'failed', error: error.message };
    }
}

/**
 * Install event - cache resources with non-atomic behavior
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing v2.2.9...');
    // CRITICAL: Skip waiting to force immediate activation
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                console.log('[Service Worker] Caching app shell (non-atomic)...');
                
                // Use Promise.allSettled for non-atomic caching
                // 95% success = 95% cached, not 0%
                // Force reload CSS to bypass browser cache
                const results = await Promise.allSettled(
                    PRECACHE_RESOURCES.map(url => {
                        // Force reload for CSS files to ensure latest version
                        if (url.includes('main.css')) {
                            return cacheResource(cache, url + '?v=2.2.2&_sw=' + Date.now());
                        }
                        return cacheResource(cache, url);
                    })
                );
                
                const successCount = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success').length;
                const failCount = results.length - successCount;
                
                console.log(`[Service Worker] Cached ${successCount}/${results.length} resources`);
                if (failCount > 0) {
                    console.warn(`[Service Worker] ${failCount} resources failed to cache (non-critical)`);
                }
            })
            .then(() => {
                console.log('[Service Worker] Skip waiting');
                return self.skipWaiting();
            })
    );
});

/**
 * Activate event - clean up old caches and force client reload
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating v3.0.0-FORCE-REFRESH...');
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
            .then(async () => {
                console.log('[Service Worker] Claiming clients and forcing reload...');
                await self.clients.claim();
                
                // Force all clients to reload to get fresh content
                const clients = await self.clients.matchAll({ type: 'window' });
                clients.forEach(client => {
                    console.log('[Service Worker] Posting reload message to:', client.url);
                    client.postMessage({ 
                        type: 'SW_UPDATED', 
                        version: '3.0.0-FORCE-REFRESH',
                        action: 'reload' 
                    });
                    // Also try to navigate to force refresh
                    if (client.navigate) {
                        client.navigate(client.url);
                    }
                });
            })
    );
});

/**
 * Enforce cache size limits (iOS Safari protection)
 */
async function enforceCacheSizeLimit(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxEntries) {
        // Delete oldest entries (FIFO)
        const toDelete = keys.slice(0, keys.length - maxEntries);
        await Promise.all(toDelete.map(key => cache.delete(key)));
        if (DEV_MODE) {
            console.log(`[Service Worker] Trimmed ${cacheName} to ${maxEntries} entries`);
        }
    }
}

/**
 * Get better offline fallback response
 */
function getOfflineFallback(request) {
    const url = new URL(request.url);
    
    // For HTML documents, try to serve cached index.html
    if (request.destination === 'document' || request.mode === 'navigate') {
        return caches.match('./index.html').then(cached => {
            if (cached) return cached;
            return new Response(
                '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>This app requires an internet connection for initial load.</p></body></html>',
                {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/html'
                    })
                }
            );
        });
    }
    
    // For scripts, return JSON error (prevents silent failures)
    if (url.pathname.endsWith('.js')) {
        return new Response(
            JSON.stringify({ error: 'Script unavailable offline', url: request.url }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            }
        );
    }
    
    // For other assets, return plain text
    return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
            'Content-Type': 'text/plain'
        })
    });
}

/**
 * Stale-while-revalidate for images (free performance boost)
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    // Return cached immediately (stale is fine for images)
    const fetchPromise = fetch(request)
        .then(response => {
            if (response && response.status === 200 && response.type === 'basic') {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => null); // Ignore network errors in background update
    
    return cached || fetchPromise || getOfflineFallback(request);
}

/**
 * Fetch event - intelligent caching strategy
 */
self.addEventListener('fetch', (event) => {
    // Skip ALL cross-origin requests - we don't make any external API calls
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    const url = new URL(event.request.url);
    const isVersioned = url.searchParams.toString().length > 0;
    const isNavigation = event.request.mode === 'navigate' || event.request.destination === 'document';
    const isImage = event.request.destination === 'image';
    const isScript = url.pathname.endsWith('.js');
    const isCSS = url.pathname.endsWith('.css'); // Force network-first for CSS

    // Dev logging
    if (DEV_MODE) {
        const cached = caches.match(event.request).then(c => {
            if (c) console.debug('[SW] Cache hit:', event.request.url);
            return c;
        });
    }

    // 1. Navigations (HTML documents) - network-first, cache to SHELL cache only
    if (isNavigation) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    // Cache navigations in SHELL cache, not runtime
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                    return response;
                })
                .catch(() => getOfflineFallback(event.request))
        );
        return;
    }

    // 2. CSS files - ALWAYS bypass cache completely for latest styles
    if (isCSS) {
        event.respondWith(
            fetch(event.request, { 
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            })
                .then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    // Don't cache CSS - always fetch fresh
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache as fallback only
                    return caches.match(event.request).then((cachedResponse) => {
                        return cachedResponse || getOfflineFallback(event.request);
                    });
                })
        );
        return;
    }

    // 3. Images - stale-while-revalidate (instant display, background update)
    if (isImage) {
        event.respondWith(staleWhileRevalidate(event.request, RUNTIME_CACHE));
        return;
    }

    // 4. Versioned assets (query params) - network-first to avoid stale caches
    if (isVersioned) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Cache versioned assets in runtime cache
                    const responseToCache = response.clone();
                    caches.open(RUNTIME_CACHE)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                            // Enforce size limit after caching
                            enforceCacheSizeLimit(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES);
                        });
                    
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache as fallback
                    return caches.match(event.request).then((cachedResponse) => {
                        return cachedResponse || getOfflineFallback(event.request);
                    });
                })
        );
        return;
    }

    // 5. Other resources - cache-first for offline support
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response for caching
                        const responseToCache = response.clone();

                        // Cache successful responses in runtime cache
                        caches.open(RUNTIME_CACHE)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                                // Enforce size limit after caching
                                enforceCacheSizeLimit(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES);
                            });

                        return response;
                    })
                    .catch(() => getOfflineFallback(event.request));
            })
    );
});

/**
 * Message event - handle messages from the app (with validation)
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
        return;
    }
    
    // Safe CACHE_URLS handler with validation
    if (event.data && event.data.type === 'CACHE_URLS') {
        const urls = event.data.urls;
        
        // Validate URLs before caching
        if (!Array.isArray(urls)) {
            console.error('[Service Worker] CACHE_URLS: urls must be an array');
            return;
        }
        
        // Filter to only same-origin URLs
        const validUrls = urls.filter(url => {
            try {
                const urlObj = new URL(url, self.location.origin);
                return urlObj.origin === self.location.origin;
            } catch {
                return false;
            }
        });
        
        if (validUrls.length === 0) {
            console.warn('[Service Worker] CACHE_URLS: No valid URLs to cache');
            return;
        }
        
        // Cache individually (non-atomic) to avoid batch failures
        event.waitUntil(
            caches.open(CACHE_NAME).then(async (cache) => {
                const results = await Promise.allSettled(
                    validUrls.map(url => cacheResource(cache, url))
                );
                const successCount = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success').length;
                console.log(`[Service Worker] Cached ${successCount}/${validUrls.length} URLs from message`);
            })
        );
    }
});
