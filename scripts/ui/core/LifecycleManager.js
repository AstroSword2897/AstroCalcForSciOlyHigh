/**
 * Component Lifecycle Manager
 * Prevents memory leaks by tracking and cleaning up all resources
 */

class LifecycleManager {
    constructor() {
        this.listeners = [];
        this.timeouts = [];
        this.intervals = [];
        this.observers = [];
        this.rafIds = [];
    }
    
    /**
     * Add event listener with automatic cleanup tracking
     */
    addEventListener(target, event, handler, options = {}) {
        if (!target || typeof target.addEventListener !== 'function') {
            console.warn('[LifecycleManager] Invalid target for addEventListener');
            return;
        }
        
        target.addEventListener(event, handler, options);
        this.listeners.push({ target, event, handler, options });
    }
    
    /**
     * Remove event listener
     */
    removeEventListener(target, event, handler, options = {}) {
        if (!target || typeof target.removeEventListener !== 'function') {
            return;
        }
        
        target.removeEventListener(event, handler, options);
        // Remove from tracking
        this.listeners = this.listeners.filter(
            l => !(l.target === target && l.event === event && l.handler === handler)
        );
    }
    
    /**
     * setTimeout with automatic cleanup tracking
     */
    setTimeout(fn, delay) {
        const id = setTimeout(() => {
            fn();
            // Remove from tracking after execution
            this.timeouts = this.timeouts.filter(tid => tid !== id);
        }, delay);
        this.timeouts.push(id);
        return id;
    }
    
    /**
     * setInterval with automatic cleanup tracking
     */
    setInterval(fn, delay) {
        const id = setInterval(fn, delay);
        this.intervals.push(id);
        return id;
    }
    
    /**
     * requestAnimationFrame with automatic cleanup tracking
     */
    requestAnimationFrame(callback) {
        const id = requestAnimationFrame(() => {
            callback();
            // Remove from tracking after execution
            this.rafIds = this.rafIds.filter(rid => rid !== id);
        });
        this.rafIds.push(id);
        return id;
    }
    
    /**
     * Add ResizeObserver with automatic cleanup tracking
     */
    addResizeObserver(target, callback) {
        if (typeof ResizeObserver === 'undefined') {
            return null;
        }
        
        const observer = new ResizeObserver(callback);
        observer.observe(target);
        this.observers.push({ observer, target });
        return observer;
    }
    
    /**
     * Add MutationObserver with automatic cleanup tracking
     */
    addMutationObserver(target, callback, options = {}) {
        if (typeof MutationObserver === 'undefined') {
            return null;
        }
        
        const observer = new MutationObserver(callback);
        observer.observe(target, options);
        this.observers.push({ observer, target });
        return observer;
    }
    
    /**
     * Clear a specific timeout
     */
    clearTimeout(id) {
        clearTimeout(id);
        this.timeouts = this.timeouts.filter(tid => tid !== id);
    }
    
    /**
     * Clear a specific interval
     */
    clearInterval(id) {
        clearInterval(id);
        this.intervals = this.intervals.filter(iid => iid !== id);
    }
    
    /**
     * Cancel a specific animation frame
     */
    cancelAnimationFrame(id) {
        cancelAnimationFrame(id);
        this.rafIds = this.rafIds.filter(rid => rid !== id);
    }
    
    /**
     * Cleanup all resources
     */
    destroy() {
        // Remove all event listeners
        this.listeners.forEach(({ target, event, handler, options }) => {
            try {
                if (target && typeof target.removeEventListener === 'function') {
                    target.removeEventListener(event, handler, options);
                }
            } catch (e) {
                console.warn('[LifecycleManager] Error removing listener:', e);
            }
        });
        
        // Clear all timeouts
        this.timeouts.forEach(id => {
            try {
                clearTimeout(id);
            } catch (e) {
                console.warn('[LifecycleManager] Error clearing timeout:', e);
            }
        });
        
        // Clear all intervals
        this.intervals.forEach(id => {
            try {
                clearInterval(id);
            } catch (e) {
                console.warn('[LifecycleManager] Error clearing interval:', e);
            }
        });
        
        // Cancel all animation frames
        this.rafIds.forEach(id => {
            try {
                cancelAnimationFrame(id);
            } catch (e) {
                console.warn('[LifecycleManager] Error canceling animation frame:', e);
            }
        });
        
        // Disconnect all observers
        this.observers.forEach(({ observer, target }) => {
            try {
                observer.disconnect();
            } catch (e) {
                console.warn('[LifecycleManager] Error disconnecting observer:', e);
            }
        });
        
        // Clear all arrays
        this.listeners = [];
        this.timeouts = [];
        this.intervals = [];
        this.rafIds = [];
        this.observers = [];
    }
    
    /**
     * Get statistics about tracked resources
     */
    getStats() {
        return {
            listeners: this.listeners.length,
            timeouts: this.timeouts.length,
            intervals: this.intervals.length,
            rafIds: this.rafIds.length,
            observers: this.observers.length
        };
    }
}

// Export singleton instance
if (typeof window !== 'undefined') {
    window.LifecycleManager = LifecycleManager;
    window.lifecycleManager = new LifecycleManager();
}

