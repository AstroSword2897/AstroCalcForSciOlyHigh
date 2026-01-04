/**
 * Module Lazy Loader - Load heavy modules on-demand
 * 
 * Features:
 * - Lazy-load explorer, FRQ, graphs only when needed
 * - Faster initial boot
 * - Better Time to Interactive (TTI)
 */

class ModuleLazyLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * Lazy load formula explorer module
     */
    async loadExplorerModule() {
        if (this.loadedModules.has('explorer')) {
            return this.loadedModules.get('explorer');
        }

        if (this.loadingPromises.has('explorer')) {
            return this.loadingPromises.get('explorer');
        }

        const loadPromise = import('./formulaExplorer.js')
            .then(module => {
                this.loadedModules.set('explorer', module);
                this.loadingPromises.delete('explorer');
                console.log('[ModuleLazyLoader] ✅ Explorer module loaded');
                return module;
            })
            .catch(error => {
                this.loadingPromises.delete('explorer');
                console.error('[ModuleLazyLoader] Failed to load explorer:', error);
                throw error;
            });

        this.loadingPromises.set('explorer', loadPromise);
        return loadPromise;
    }

    /**
     * Lazy load FRQ support module
     */
    async loadFRQModule() {
        if (this.loadedModules.has('frq')) {
            return this.loadedModules.get('frq');
        }

        if (this.loadingPromises.has('frq')) {
            return this.loadingPromises.get('frq');
        }

        const loadPromise = import('./frqSupport.js')
            .then(module => {
                this.loadedModules.set('frq', module);
                this.loadingPromises.delete('frq');
                console.log('[ModuleLazyLoader] ✅ FRQ module loaded');
                return module;
            })
            .catch(error => {
                this.loadingPromises.delete('frq');
                console.error('[ModuleLazyLoader] Failed to load FRQ:', error);
                throw error;
            });

        this.loadingPromises.set('frq', loadPromise);
        return loadPromise;
    }

    /**
     * Lazy load graph manager module
     */
    async loadGraphModule() {
        if (this.loadedModules.has('graph')) {
            return this.loadedModules.get('graph');
        }

        if (this.loadingPromises.has('graph')) {
            return this.loadingPromises.get('graph');
        }

        const loadPromise = Promise.all([
            import('./enhancedOfflineGraph.js'),
            import('./graphManager.js')
        ])
            .then(([enhancedGraph, graphManager]) => {
                const modules = { enhancedGraph, graphManager };
                this.loadedModules.set('graph', modules);
                this.loadingPromises.delete('graph');
                console.log('[ModuleLazyLoader] ✅ Graph modules loaded');
                return modules;
            })
            .catch(error => {
                this.loadingPromises.delete('graph');
                console.error('[ModuleLazyLoader] Failed to load graph:', error);
                throw error;
            });

        this.loadingPromises.set('graph', loadPromise);
        return loadPromise;
    }

    /**
     * Preload modules in background (for faster tab switching)
     */
    preloadModules() {
        // Preload in background after initial render
        setTimeout(() => {
            this.loadExplorerModule().catch(() => {});
            this.loadFRQModule().catch(() => {});
            this.loadGraphModule().catch(() => {});
        }, 2000); // Wait 2s after initial load
    }

    /**
     * Check if module is loaded
     */
    isLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }
}

// Export singleton
if (typeof window !== 'undefined') {
    window.moduleLazyLoader = new ModuleLazyLoader();
}

export { ModuleLazyLoader };

