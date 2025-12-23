/**
 * Unified Event Manager
 * Centralized event handling to replace scattered event setup functions
 * 
 * Provides:
 * - Event delegation
 * - Event listener tracking
 * - Cleanup management
 * - Prevent duplicate handlers
 */

class EventManager {
    constructor() {
        this.handlers = new Map(); // key: 'selector:event' -> Array<Handler>
        this.delegatedEvents = new Set(); // Track which events are delegated
        this.globalListeners = new Map(); // Track global listeners
    }

    /**
     * Register an event handler with delegation
     * @param {string} selector - CSS selector for target elements
     * @param {string} event - Event name (e.g., 'click', 'input')
     * @param {Function} handler - Event handler function
     * @param {Object} options - Event options (capture, once, etc.)
     * @returns {Function} Unregister function
     */
    register(selector, event, handler, options = {}) {
        if (typeof handler !== 'function') {
            throw new Error('Handler must be a function');
        }

        const key = `${selector}:${event}`;
        
        // Initialize handler array if needed
        if (!this.handlers.has(key)) {
            this.handlers.set(key, []);
            this.setupDelegation(selector, event, options);
        }

        // Add handler
        const handlers = this.handlers.get(key);
        handlers.push(handler);

        // Return unregister function
        return () => {
            const handlers = this.handlers.get(key);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
            // Remove delegation if no handlers left
            if (handlers.length === 0) {
                this.removeDelegation(selector, event);
            }
        };
    }

    /**
     * Setup event delegation for a selector/event combination
     * @private
     */
    setupDelegation(selector, event, options = {}) {
        const key = `${selector}:${event}`;
        
        if (this.delegatedEvents.has(key)) {
            return; // Already delegated
        }

        const delegatedHandler = (e) => {
            const target = e.target.closest(selector);
            if (target) {
                const handlers = this.handlers.get(key);
                if (handlers) {
                    handlers.forEach(handler => {
                        try {
                            handler(e, target);
                        } catch (error) {
                            console.error(`[EventManager] Error in handler for ${key}:`, error);
                        }
                    });
                }
            }
        };

        document.addEventListener(event, delegatedHandler, {
            capture: options.capture || false,
            once: false,
            passive: options.passive !== false
        });

        this.delegatedEvents.add(key);
        this.globalListeners.set(key, delegatedHandler);
    }

    /**
     * Remove event delegation
     * @private
     */
    removeDelegation(selector, event) {
        const key = `${selector}:${event}`;
        const handler = this.globalListeners.get(key);
        
        if (handler) {
            document.removeEventListener(event, handler);
            this.delegatedEvents.delete(key);
            this.globalListeners.delete(key);
            this.handlers.delete(key);
        }
    }

    /**
     * Register a direct event listener (non-delegated)
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     * @returns {Function} Unregister function
     */
    on(element, event, handler, options = {}) {
        if (!element || typeof handler !== 'function') {
            throw new Error('Element and handler are required');
        }

        element.addEventListener(event, handler, options);

        // Return unregister function
        return () => {
            element.removeEventListener(event, handler, options);
        };
    }

    /**
     * Register a one-time event listener
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @returns {Function} Unregister function (may be called before event fires)
     */
    once(element, event, handler) {
        const wrappedHandler = (e) => {
            handler(e);
            element.removeEventListener(event, wrappedHandler);
        };
        return this.on(element, event, wrappedHandler);
    }

    /**
     * Cleanup all event listeners
     */
    cleanup() {
        // Remove all delegated listeners
        this.globalListeners.forEach((handler, key) => {
            const [selector, event] = key.split(':');
            document.removeEventListener(event, handler);
        });

        // Clear all maps
        this.handlers.clear();
        this.delegatedEvents.clear();
        this.globalListeners.clear();
    }

    /**
     * Get statistics
     * @returns {Object} Event manager stats
     */
    getStats() {
        return {
            delegatedEvents: this.delegatedEvents.size,
            totalHandlers: Array.from(this.handlers.values())
                .reduce((sum, handlers) => sum + handlers.length, 0),
            globalListeners: this.globalListeners.size
        };
    }
}

// Create global event manager instance
const eventManager = new EventManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.EventManager = EventManager;
    window.eventManager = eventManager;
}

