/**
 * Module Initializer - Production-Ready Version
 * 
 * Event-driven module initialization with dependency graph support,
 * performance tracking, and offline verification.
 * 
 * Features:
 * - Dynamic module registration
 * - Dependency graph management
 * - Event-based initialization (no busy-wait loops)
 * - Performance metrics
 * - Offline mode verification
 * - Promise safety with proper cleanup
 */

class ModuleInitializer {
    constructor() {
        // Module ready states
        this.modules = new Map();
        
        // Dependency graph: module -> [dependencies]
        this.dependencies = new Map();
        
        // Initialization promises
        this.initPromises = new Map();
        
        // Performance metrics
        this.metrics = new Map();
        
        // Event listeners for module ready events
        this.listeners = new Map();
        
        // Initialization start time
        this.startTime = null;
    }
    
    /**
     * Register a module with optional dependencies
     */
    register(moduleName, options = {}) {
        const { dependsOn = [], autoDetect = true } = options;
        
        this.modules.set(moduleName, {
            ready: false,
            dependsOn: dependsOn,
            autoDetect: autoDetect,
            registeredAt: Date.now()
        });
        
        if (dependsOn.length > 0) {
            this.dependencies.set(moduleName, dependsOn);
        }
        
        // If module is already available, mark it ready
        if (autoDetect && this.checkModuleAvailable(moduleName)) {
            this.markReady(moduleName);
        }
    }
    
    /**
     * Check if a module is available in the global scope
     */
    checkModuleAvailable(moduleName) {
        const checks = {
            formulas: () => typeof formulas !== 'undefined' && Array.isArray(formulas) && formulas.length > 0,
            calculator: () => typeof FormulaCalculator !== 'undefined',
            unitParser: () => typeof UnitParser !== 'undefined',
            expressionParser: () => typeof ExpressionParser !== 'undefined',
            search: () => typeof semanticSearchSystem !== 'undefined' || typeof FormulaSearch !== 'undefined',
            frq: () => typeof generateUsageInstructions !== 'function',
            graph: () => typeof OfflineGraphManager !== 'undefined' || typeof GraphManager !== 'undefined',
            conceptNetwork: () => typeof crossConceptReinforcement !== 'undefined' && 
                                 typeof crossConceptReinforcement.initialized !== 'undefined' &&
                                 crossConceptReinforcement.initialized
        };
        
        const check = checks[moduleName];
        return check ? check() : false;
    }
    
    /**
     * Mark a module as ready
     */
    markReady(moduleName) {
        const module = this.modules.get(moduleName);
        if (!module) {
            console.warn(`[ModuleInitializer] Attempted to mark unknown module as ready: ${moduleName}`);
            return;
        }
        
        if (module.ready) {
            return; // Already ready
        }
        
        // Check dependencies first
        const deps = this.dependencies.get(moduleName) || [];
        for (const dep of deps) {
            const depModule = this.modules.get(dep);
            if (!depModule || !depModule.ready) {
                console.warn(`[ModuleInitializer] Module ${moduleName} depends on ${dep} which is not ready`);
                return;
            }
        }
        
        // Mark as ready
        module.ready = true;
        module.readyAt = Date.now();
        
        // Calculate initialization time
        const initTime = module.readyAt - module.registeredAt;
        this.metrics.set(moduleName, {
            initTime: initTime,
            readyAt: module.readyAt
        });
        
        console.log(`✅ [ModuleInitializer] Module ready: ${moduleName} (${initTime}ms)`);
        
        // Resolve promise if it exists
        const promise = this.initPromises.get(moduleName);
        if (promise) {
            promise.resolve();
            this.initPromises.delete(moduleName);
        }
        
        // Notify listeners
        this.notifyListeners(moduleName);
    }
    
    /**
     * Notify listeners that a module is ready
     */
    notifyListeners(moduleName) {
        const listeners = this.listeners.get(moduleName) || [];
        listeners.forEach(listener => {
            try {
                listener();
            } catch (e) {
                console.error(`[ModuleInitializer] Listener error for ${moduleName}:`, e);
            }
        });
        this.listeners.delete(moduleName);
    }
    
    /**
     * Add listener for module ready event
     */
    onReady(moduleName, callback) {
        const module = this.modules.get(moduleName);
        if (module && module.ready) {
            // Already ready, call immediately
            callback();
            return;
        }
        
        if (!this.listeners.has(moduleName)) {
            this.listeners.set(moduleName, []);
        }
        this.listeners.get(moduleName).push(callback);
    }
    
    /**
     * Check if a module is ready
     */
    isReady(moduleName) {
        const module = this.modules.get(moduleName);
        return module ? module.ready : false;
    }
    
    /**
     * Wait for a module to be ready
     */
    async waitForModule(moduleName, timeout = 5000) {
        if (this.isReady(moduleName)) {
            return Promise.resolve();
        }
        
        // Create promise if it doesn't exist
        if (!this.initPromises.has(moduleName)) {
            let resolve, reject;
            const promise = new Promise((res, rej) => {
                resolve = res;
                reject = rej;
            });
            promise.resolve = resolve;
            promise.reject = reject;
            this.initPromises.set(moduleName, promise);
            
            // Timeout handler
            const timeoutId = setTimeout(() => {
                if (this.initPromises.has(moduleName)) {
                    this.initPromises.get(moduleName).reject(
                        new Error(`Module ${moduleName} initialization timeout after ${timeout}ms`)
                    );
                    this.initPromises.delete(moduleName);
                }
            }, timeout);
            
            // Clean up timeout if resolved
            promise.finally(() => clearTimeout(timeoutId));
        }
        
        return this.initPromises.get(moduleName);
    }
    
    /**
     * Wait for all critical modules to be ready
     */
    async waitForAll(criticalModules = null, timeout = 10000) {
        const modules = criticalModules || ['formulas', 'calculator', 'search', 'unitParser', 'expressionParser'];
        
        const promises = modules.map(module => this.waitForModule(module, timeout));
        
        try {
            await Promise.all(promises);
            const totalTime = Date.now() - (this.startTime || Date.now());
            console.log(`✅ [ModuleInitializer] All critical modules ready (${totalTime}ms)`);
            return true;
        } catch (error) {
            console.error(`❌ [ModuleInitializer] Module initialization timeout:`, error.message);
            return false;
        }
    }
    
    /**
     * Initialize modules in dependency order
     */
    async initialize() {
        this.startTime = Date.now();
        console.log('🔧 [ModuleInitializer] Initializing modules...');
        
        // Register critical modules with dependencies
        this.register('formulas', { autoDetect: true });
        this.register('calculator', { dependsOn: ['formulas'], autoDetect: true });
        this.register('unitParser', { autoDetect: true });
        this.register('expressionParser', { autoDetect: true });
        this.register('search', { dependsOn: ['formulas'], autoDetect: true });
        this.register('frq', { dependsOn: ['formulas', 'search'], autoDetect: true });
        this.register('graph', { autoDetect: true });
        this.register('conceptNetwork', { dependsOn: ['formulas'], autoDetect: true });
        
        // Auto-detect and mark ready for modules that are already available
        for (const [moduleName, module] of this.modules.entries()) {
            if (module.autoDetect && !module.ready && this.checkModuleAvailable(moduleName)) {
                this.markReady(moduleName);
            }
        }
        
        // For modules that need async initialization, set up polling with exponential backoff
        await this.initializeAsyncModules();
        
        console.log('📊 [ModuleInitializer] Initialization status:', this.getStatus());
    }
    
    /**
     * Initialize async modules with exponential backoff
     */
    async initializeAsyncModules() {
        const asyncModules = ['formulas', 'conceptNetwork', 'search'];
        
        for (const moduleName of asyncModules) {
            const module = this.modules.get(moduleName);
            if (!module || module.ready) continue;
            
            // Exponential backoff: 50ms, 100ms, 200ms, 400ms, 800ms, 1600ms
            let delay = 50;
            let attempts = 0;
            const maxAttempts = 10;
            
            while (attempts < maxAttempts && !module.ready) {
                await new Promise(resolve => setTimeout(resolve, delay));
                
                if (this.checkModuleAvailable(moduleName)) {
                    this.markReady(moduleName);
                    break;
                }
                
                delay = Math.min(delay * 2, 1600); // Cap at 1.6s
                attempts++;
            }
            
            if (!module.ready) {
                console.warn(`⚠️ [ModuleInitializer] Module ${moduleName} did not initialize after ${maxAttempts} attempts`);
            }
        }
        
        // Initialize search if concept network is ready
        if (this.isReady('conceptNetwork') && !this.isReady('search')) {
            if (typeof semanticSearchSystem !== 'undefined' && typeof semanticSearchSystem.initializeEmbeddings === 'function') {
                try {
                    semanticSearchSystem.initializeEmbeddings();
                    this.markReady('search');
                } catch (e) {
                    console.warn('[ModuleInitializer] Search initialization warning:', e);
                }
            }
        }
    }
    
    /**
     * Get initialization status
     */
    getStatus() {
        const ready = [];
        const notReady = [];
        
        for (const [name, module] of this.modules.entries()) {
            if (module.ready) {
                ready.push(name);
            } else {
                notReady.push(name);
            }
        }
        
        const totalTime = this.startTime ? Date.now() - this.startTime : 0;
        
        return {
            modules: Object.fromEntries(this.modules),
            ready: ready,
            notReady: notReady,
            readyCount: ready.length,
            totalCount: this.modules.size,
            allReady: notReady.length === 0,
            totalTime: totalTime,
            metrics: Object.fromEntries(this.metrics)
        };
    }
    
    /**
     * Verify offline readiness
     */
    async verifyOffline() {
        console.log('🌐 [ModuleInitializer] Verifying offline readiness...');
        
        // Check if we're offline
        if (typeof navigator !== 'undefined' && navigator.onLine) {
            console.warn('[ModuleInitializer] Online mode - cannot fully verify offline readiness');
            return true;
        }
        
        // Verify critical modules work offline
        const criticalModules = ['formulas', 'calculator', 'unitParser', 'expressionParser'];
        const offlineReady = criticalModules.every(module => this.isReady(module));
        
        if (offlineReady) {
            console.log('✅ [ModuleInitializer] All critical modules ready for offline use');
        } else {
            console.warn('⚠️ [ModuleInitializer] Some modules not ready for offline use');
        }
        
        return offlineReady;
    }
}

// Create global instance
const moduleInitializer = new ModuleInitializer();

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            moduleInitializer.initialize();
        });
    } else {
        moduleInitializer.initialize();
    }
}

// Expose globally
if (typeof window !== 'undefined') {
    window.ModuleInitializer = ModuleInitializer;
    window.moduleInitializer = moduleInitializer;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModuleInitializer, moduleInitializer };
}
