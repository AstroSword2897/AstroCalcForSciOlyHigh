/**
 * AstroCalc service worker — offline-first (v4)
 * - Precaches shell + scripts + KaTeX + MathJax entry (paths without query strings)
 * - Navigation: cache-first (refresh works offline); updates cache when online
 * - Static assets: cache match with ignoreSearch, then network → runtime cache
 * - Cache busting: bump CACHE_VERSION only (query params on URLs are ignored)
 * - install: skipWaiting() so the new worker activates promptly; activate: clients.claim()
 * - message SKIP_WAITING remains for clients that request a controlled update
 */

const CACHE_VERSION = 'v4.2.0';
const CACHE_NAME = `astrocalc-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `astrocalc-runtime-${CACHE_VERSION}`;

const PRECACHE_RESOURCES = [
    './',
    './index.html',
    './manifest.json',
    './styles/main.css',

    './scripts/concepts.js',
    './scripts/formulas.js',
    './scripts/safeExpressionEvaluator.js',
    './scripts/ui/utils/SafeMathEvaluator.js',
    './scripts/unitConverter.js',
    './scripts/unitParser.js',
    './scripts/expressionParser.js',
    './scripts/variableValueParsing.js',
    './scripts/formulaDisplayUtils.js',
    './scripts/precisionCalculator.js',
    './scripts/performanceOptimizer.js',
    './scripts/calculator.js',
    './scripts/classification.js',
    './scripts/frqSupport.js',
    './scripts/quickNav.js',
    './scripts/formulaKnowledgeGraph.js',
    './scripts/formulaExplorer.js',
    './scripts/enhancedOfflineGraph.js',
    './scripts/graphManager.js',
    './scripts/ui/rendering/VariableInputs.js',
    './scripts/ui/rendering/ResultDisplay.js',
    './scripts/algebraicSolver.js',
    './scripts/scientificCalculatorPanel.js',

    './scripts/ui/ui/init.js',
    './scripts/ui/ui/UIModuleOrchestrator.js',
    './scripts/ui/ui/contracts.js',
    './scripts/ui/ui/utils/debounce.js',
    './scripts/ui/ui/modules/search/SearchEngine.js',
    './scripts/ui/ui/modules/search/quickReferenceBundle.js',
    './scripts/ui/ui/modules/search/Scorer.js',
    './scripts/ui/ui/modules/formula/formulaValidator.js',
    './scripts/ui/ui/modules/calculation/CalculationOrchestrator.js',
    './scripts/ui/ui/modules/tabs/TabManager.js',
    './scripts/ui/ui/modules/graph/GraphCoordinator.js',
    './scripts/ui/ui/modules/formula/FormulaSelector.js',
    './scripts/ui/ui/modules/events/EventCoordinator.js',
    './scripts/ui/ui/modules/utils/CalculationUtils.js',
    './scripts/ui/ui/modules/utils/FormattingUtils.js',
    './scripts/ui/ui/modules/rendering/FormulaRenderer.js',
    './scripts/ui/ui/modules/expert/ExpertSystem.js',

    './libs/katex/katex.min.css',
    './libs/katex/katex.min.js',
    './libs/mathjax/es5/tex-mml-chtml.js',

    './assets/images/hr-diagram.svg',
    './assets/images/henyey-hayashi-zams-track.svg',

    // KaTeX fonts (offline typesetting)
    './libs/katex/fonts/KaTeX_AMS-Regular.woff2',
    './libs/katex/fonts/KaTeX_AMS-Regular.woff',
    './libs/katex/fonts/KaTeX_Caligraphic-Bold.woff2',
    './libs/katex/fonts/KaTeX_Caligraphic-Bold.woff',
    './libs/katex/fonts/KaTeX_Caligraphic-Regular.woff2',
    './libs/katex/fonts/KaTeX_Caligraphic-Regular.woff',
    './libs/katex/fonts/KaTeX_Fraktur-Bold.woff2',
    './libs/katex/fonts/KaTeX_Fraktur-Bold.woff',
    './libs/katex/fonts/KaTeX_Fraktur-Regular.woff2',
    './libs/katex/fonts/KaTeX_Fraktur-Regular.woff',
    './libs/katex/fonts/KaTeX_Main-Bold.woff2',
    './libs/katex/fonts/KaTeX_Main-Bold.woff',
    './libs/katex/fonts/KaTeX_Main-BoldItalic.woff2',
    './libs/katex/fonts/KaTeX_Main-BoldItalic.woff',
    './libs/katex/fonts/KaTeX_Main-Italic.woff2',
    './libs/katex/fonts/KaTeX_Main-Italic.woff',
    './libs/katex/fonts/KaTeX_Main-Regular.woff2',
    './libs/katex/fonts/KaTeX_Main-Regular.woff',
    './libs/katex/fonts/KaTeX_Math-BoldItalic.woff2',
    './libs/katex/fonts/KaTeX_Math-BoldItalic.woff',
    './libs/katex/fonts/KaTeX_Math-Italic.woff2',
    './libs/katex/fonts/KaTeX_Math-Italic.woff',
    './libs/katex/fonts/KaTeX_SansSerif-Bold.woff2',
    './libs/katex/fonts/KaTeX_SansSerif-Bold.woff',
    './libs/katex/fonts/KaTeX_SansSerif-Italic.woff2',
    './libs/katex/fonts/KaTeX_SansSerif-Italic.woff',
    './libs/katex/fonts/KaTeX_SansSerif-Regular.woff2',
    './libs/katex/fonts/KaTeX_SansSerif-Regular.woff',
    './libs/katex/fonts/KaTeX_Script-Regular.woff2',
    './libs/katex/fonts/KaTeX_Script-Regular.woff',
    './libs/katex/fonts/KaTeX_Size1-Regular.woff2',
    './libs/katex/fonts/KaTeX_Size1-Regular.woff',
    './libs/katex/fonts/KaTeX_Size2-Regular.woff2',
    './libs/katex/fonts/KaTeX_Size2-Regular.woff',
    './libs/katex/fonts/KaTeX_Size3-Regular.woff2',
    './libs/katex/fonts/KaTeX_Size3-Regular.woff',
    './libs/katex/fonts/KaTeX_Size4-Regular.woff2',
    './libs/katex/fonts/KaTeX_Size4-Regular.woff',
    './libs/katex/fonts/KaTeX_Typewriter-Regular.woff2',
    './libs/katex/fonts/KaTeX_Typewriter-Regular.woff',

    './libs/katex/fonts/KaTeX_AMS-Regular.ttf',
    './libs/katex/fonts/KaTeX_Caligraphic-Bold.ttf',
    './libs/katex/fonts/KaTeX_Caligraphic-Regular.ttf',
    './libs/katex/fonts/KaTeX_Fraktur-Bold.ttf',
    './libs/katex/fonts/KaTeX_Fraktur-Regular.ttf',
    './libs/katex/fonts/KaTeX_Main-Bold.ttf',
    './libs/katex/fonts/KaTeX_Main-BoldItalic.ttf',
    './libs/katex/fonts/KaTeX_Main-Italic.ttf',
    './libs/katex/fonts/KaTeX_Main-Regular.ttf',
    './libs/katex/fonts/KaTeX_Math-BoldItalic.ttf',
    './libs/katex/fonts/KaTeX_Math-Italic.ttf',
    './libs/katex/fonts/KaTeX_SansSerif-Bold.ttf',
    './libs/katex/fonts/KaTeX_SansSerif-Italic.ttf',
    './libs/katex/fonts/KaTeX_SansSerif-Regular.ttf',
    './libs/katex/fonts/KaTeX_Script-Regular.ttf',
    './libs/katex/fonts/KaTeX_Size1-Regular.ttf',
    './libs/katex/fonts/KaTeX_Size2-Regular.ttf',
    './libs/katex/fonts/KaTeX_Size3-Regular.ttf',
    './libs/katex/fonts/KaTeX_Size4-Regular.ttf',
    './libs/katex/fonts/KaTeX_Typewriter-Regular.ttf'
];

function resolveUrl(path) {
    return new URL(path, self.location).href;
}

async function cacheShellResources(cache) {
    const results = await Promise.allSettled(
        PRECACHE_RESOURCES.map((path) =>
            cache
                .add(new Request(resolveUrl(path), { cache: 'reload' }))
                .then(() => ({ path, ok: true }))
                .catch((err) => ({ path, ok: false, err: err.message }))
        )
    );
    const failed = results
        .filter((r) => r.status === 'rejected' || (r.value && !r.value.ok))
        .map((r) => (r.status === 'fulfilled' ? r.value : r.reason));
    if (failed.length) {
        console.warn('[SW] Precache partial failures:', failed);
    }
}

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cacheShellResources(cache))
            .catch((err) => console.error('[SW] Install precache error:', err))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                )
            )
            .then(() => self.clients.claim())
    );
});

async function matchAsset(request) {
    const cache = await caches.open(CACHE_NAME);
    let hit = await cache.match(request, { ignoreSearch: true });
    if (hit) return hit;
    hit = await cache.match(request);
    if (hit) return hit;
    const runtime = await caches.open(RUNTIME_CACHE);
    hit = await runtime.match(request, { ignoreSearch: true });
    if (hit) return hit;
    return runtime.match(request);
}

async function matchNavigation(request) {
    const cache = await caches.open(CACHE_NAME);
    let hit = await cache.match(request);
    if (hit) return hit;
    const url = new URL(request.url);
    const origin = url.origin;
    const paths = [
        `${origin}/index.html`,
        `${origin}/`,
        resolveUrl('./index.html'),
        resolveUrl('./')
    ];
    for (const p of paths) {
        hit = await cache.match(p);
        if (hit) return hit;
    }
    return null;
}

async function putRuntime(request, response) {
    if (!response || response.status !== 200 || response.type === 'opaque') return;
    const copy = response.clone();
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, copy);
}

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    if (event.request.method !== 'GET') {
        return;
    }

    const isNavigation =
        event.request.mode === 'navigate' || event.request.destination === 'document';
    const path = url.pathname;
    const isHtmlDoc =
        isNavigation ||
        path.endsWith('.html') ||
        path === '/' ||
        (path.endsWith('/') && !path.endsWith('.js'));

    if (isHtmlDoc) {
        event.respondWith(
            (async () => {
                const cached = await matchNavigation(event.request);
                const networkFetch = fetch(event.request)
                    .then(async (response) => {
                        if (response && response.status === 200) {
                            const shell = await caches.open(CACHE_NAME);
                            const pathname = new URL(event.request.url).pathname;
                            const c1 = response.clone();
                            await shell.put(event.request, c1);
                            if (pathname === '/' || pathname === '' || pathname === '/index.html') {
                                await shell.put(resolveUrl('./index.html'), response.clone());
                            }
                        }
                        return response;
                    })
                    .catch(() => null);

                if (cached) {
                    event.waitUntil(networkFetch);
                    return cached;
                }
                const live = await networkFetch;
                if (live) return live;
                return new Response(
                    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head><body><p>Open AstroCalc once while online to install offline data, then try again.</p></body></html>',
                    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                );
            })()
        );
        return;
    }

    event.respondWith(
        (async () => {
            const cached = await matchAsset(event.request);
            if (cached) {
                event.waitUntil(
                    fetch(event.request)
                        .then((response) => {
                            if (response && response.status === 200) {
                                return caches.open(CACHE_NAME).then((c) => c.put(event.request, response.clone()));
                            }
                        })
                        .catch(() => {})
                );
                return cached;
            }
            try {
                const response = await fetch(event.request);
                if (response && response.status === 200) {
                    await putRuntime(event.request, response);
                }
                return response;
            } catch (e) {
                const again = await matchAsset(event.request);
                if (again) return again;
                throw e;
            }
        })()
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] AstroCalc offline-first', CACHE_VERSION, 'loaded');
