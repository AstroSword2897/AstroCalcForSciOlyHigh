/**
 * Service Worker for AstroCalc - FORCE REFRESH v3.0.0
 * 
 * This version DELETES ALL OLD CACHES on install before creating new cache
 */

const CACHE_NAME = 'astrocalc-shell-v3.0.2-FORCE-REFRESH';
const RUNTIME_CACHE = 'astrocalc-runtime-v3.0.2-FORCE-REFRESH';
const MAX_RUNTIME_ENTRIES = 100;

const DEV_MODE = false;

// Resources to cache on install
const PRECACHE_RESOURCES = [
    './',
    './index.html',
    './styles/main.css',
    './manifest.json',

    // Images
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
    './force_blue_now.js',
    
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

// Install event - DELETE ALL OLD CACHES FIRST
self.addEventListener('install', (event) => {
    console.log('[SW v3.0.0] ✨ INSTALL - Deleting ALL old caches and installing fresh...');
    self.skipWaiting(); // Activate immediately
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                console.log(`[SW v3.0.0] Found ${cacheNames.length} old caches to delete:`, cacheNames);
                return Promise.all(
                    cacheNames.map(name => {
                        console.log(`[SW v3.0.0] 🗑️ Deleting old cache: ${name}`);
                        return caches.delete(name);
                    })
                );
            })
            .then(() => {
                console.log('[SW v3.0.0] ✅ All old caches deleted. Creating fresh cache...');
                return caches.open(CACHE_NAME);
            })
            .then(cache => {
                console.log('[SW v3.0.0] Caching resources...');
                // Cache with force reload
                return Promise.allSettled(
                    PRECACHE_RESOURCES.map(url => {
                        const fullUrl = url + (url.includes('?') ? '&' : '?') + `v=3.0.0&t=${Date.now()}`;
                        return cache.add(new Request(fullUrl, { cache: 'reload' }))
                            .then(() => ({ url, status: 'success' }))
                            .catch(err => ({ url, status: 'failed', error: err.message }));
                    })
                );
            })
            .then(results => {
                const success = results.filter(r => r.status === 'fulfilled' && r.value?.status === 'success').length;
                const failed = results.length - success;
                console.log(`[SW v3.0.0] ✅ Cached ${success}/${results.length} resources (${failed} failed)`);
                if (failed > 0) {
                    const failures = results.filter(r => r.status === 'rejected' || r.value?.status === 'failed');
                    console.warn('[SW v3.0.0] Failed resources:', failures);
                }
            })
            .catch(err => {
                console.error('[SW v3.0.0] ❌ Install error:', err);
                throw err;
            })
    );
});

// Activate event - claim clients and force reload
self.addEventListener('activate', (event) => {
    console.log('[SW v3.0.0] ✨ ACTIVATE - Taking control of all clients...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                // Delete any caches that don't match current version
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                        .map(name => {
                            console.log(`[SW v3.0.0] 🗑️ Deleting old cache in activate: ${name}`);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW v3.0.0] ✅ Claiming all clients...');
                return self.clients.claim();
            })
            .then(() => {
                return self.clients.matchAll({ type: 'window' });
            })
            .then(clients => {
                console.log(`[SW v3.0.0] Found ${clients.length} clients to reload`);
                clients.forEach(client => {
                    console.log('[SW v3.0.0] 📤 Sending reload message to:', client.url);
                    client.postMessage({
                        type: 'SW_UPDATED',
                        version: '3.0.0-FORCE-REFRESH',
                        action: 'reload'
                    });
                });
            })
    );
});

// Fetch event - network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Bypass SW for debug pages
    if (url.pathname.includes('clear_everything') || 
        url.pathname.includes('unregister_sw') ||
        url.pathname.includes('debug') ||
        url.pathname.includes('test_')) {
        return;
    }
    
    // Only handle same-origin requests
    if (!url.origin.startsWith(self.location.origin)) {
        return;
    }
    
    const isNavigation = event.request.mode === 'navigate' || event.request.destination === 'document';
    const isCSS = url.pathname.endsWith('.css');
    const isJS = url.pathname.endsWith('.js');
    
    // Network-first for HTML/navigation and CSS (always get latest)
    if (isNavigation || isCSS) {
        event.respondWith(
            fetch(event.request, { cache: 'no-store' })
                .then(response => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // Cache-first for everything else (JS, images, etc.)
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) {
                    return cached;
                }
                return fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(RUNTIME_CACHE).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                });
            })
    );
});

console.log('[SW v3.0.0] Service Worker script loaded');
