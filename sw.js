/**
 * Service Worker for AstroCalc - Offline Support
 * 
 * Caches all application resources for offline use
 */

const CACHE_NAME = 'astrocalc-v2.1.0'; // Updated cache version - offline-ready with all scripts
const RUNTIME_CACHE = 'astrocalc-runtime-v2.1.0';

// Resources to cache on install (OFFLINE-FIRST: All resources are local)
const PRECACHE_RESOURCES = [
    './',
    './index.html',
    './diagnostics.html',
    './styles/main.css',
    './manifest.json',
    
    // Core Application Scripts
    './scripts/moduleInitializer.js',
    './scripts/precisionCalculator.js',
    './scripts/calculationCache.js',
    './scripts/deepAnalysisRunner.js',
    './scripts/formulas.js',
    './scripts/calculator.js',
    './scripts/ui.js',
    './scripts/utils.js',
    './scripts/safeExpressionEvaluator.js',
    './scripts/unitConverter.js',
    './scripts/unitParser.js',
    './scripts/dimensionalAnalysis.js',
    './scripts/expressionParser.js',
    './scripts/classification.js',
    './scripts/formulaExplorer.js',
    './scripts/accessibility.js',
    './scripts/offlineGraphManager.js',
    './scripts/graphManager.js',
    './scripts/frqSupport.js',
    './scripts/quickNav.js',
    './scripts/integrationTest.js',
    './scripts/diagnostics.js',
    
    // MISSING CORE SCRIPTS (Added for offline support)
    './scripts/enhancedOfflineGraph.js',
    './scripts/formulaGraphConfig.js',
    './scripts/multiStepSolver.js',
    './scripts/formulaVerification.js',
    './scripts/codeQualityAudit.js',
    './scripts/standaloneGraphCalculator.js',
    './scripts/search/formula-search.js',
    './scripts/events/event-manager.js',
    './scripts/utils/dom.js',
    './scripts/state/app-state.js',
    
    // Data Files (Required for concept network and search)
    './tests/weighted_concept_mapping.json',
    './tests/search_test_cases.json',
    
    // Test Files (Optional - for offline testing capability)
    './tests/run_production_tests.html',
    './tests/comprehensive_calculator_tests.js',
    './tests/real_astrophysics_scenarios.js',
    './tests/run_ui_refactor_tests.js',
    './tests/test_config.js',
    './test_calculations.js', // Formula verification test suite
    
    // Libraries
    './libs/mathjax/es5/tex-mml-chtml.js'
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
    // Skip ALL cross-origin requests - we don't make any external API calls
    if (!event.request.url.startsWith(self.location.origin)) {
        // Don't intercept external requests - app is offline-first
        return;
    }

    const url = new URL(event.request.url);
    const isVersionedJS = url.pathname.endsWith('.js') && url.searchParams.toString().length > 0;
    
    // For versioned JS files (with query params like ?v=2.0.4), use network-first to always get latest
    // For other files, use cache-first for offline support
    if (isVersionedJS) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response for caching (but don't block on it)
                    const responseToCache = response.clone();
                    caches.open(RUNTIME_CACHE)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache as fallback
                    return caches.match(event.request).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // No cache either, return offline response
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
        return;
    }

    // For other local resources, use cache-first strategy
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

