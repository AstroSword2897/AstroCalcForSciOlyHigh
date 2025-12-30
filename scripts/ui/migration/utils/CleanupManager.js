"use strict";
/**
 * Centralized cleanup manager to prevent memory leaks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupManager = void 0;
exports.getCleanupManager = getCleanupManager;
var CleanupManager = /** @class */ (function () {
    function CleanupManager() {
        this.cleanupFns = [];
        this.timeouts = new Set();
        this.intervals = new Set();
    }
    /**
     * Register a cleanup function
     */
    CleanupManager.prototype.register = function (cleanup) {
        this.cleanupFns.push(cleanup);
    };
    /**
     * Track setTimeout for automatic cleanup
     */
    CleanupManager.prototype.setTimeout = function (fn, delay) {
        var _this = this;
        var id = window.setTimeout(function () {
            _this.timeouts.delete(id);
            fn();
        }, delay);
        this.timeouts.add(id);
        return id;
    };
    /**
     * Track setInterval for automatic cleanup
     */
    CleanupManager.prototype.setInterval = function (fn, delay) {
        var id = window.setInterval(fn, delay);
        this.intervals.add(id);
        return id;
    };
    /**
     * Clear a tracked timeout
     */
    CleanupManager.prototype.clearTimeout = function (id) {
        window.clearTimeout(id);
        this.timeouts.delete(id);
    };
    /**
     * Clear a tracked interval
     */
    CleanupManager.prototype.clearInterval = function (id) {
        window.clearInterval(id);
        this.intervals.delete(id);
    };
    /**
     * Execute all cleanup functions
     */
    CleanupManager.prototype.cleanup = function () {
        // Execute cleanup functions
        this.cleanupFns.forEach(function (fn) {
            try {
                fn();
            }
            catch (error) {
                console.error('Error in cleanup function:', error);
            }
        });
        this.cleanupFns = [];
        // Clear all timeouts
        this.timeouts.forEach(function (id) {
            window.clearTimeout(id);
        });
        this.timeouts.clear();
        // Clear all intervals
        this.intervals.forEach(function (id) {
            window.clearInterval(id);
        });
        this.intervals.clear();
    };
    return CleanupManager;
}());
exports.CleanupManager = CleanupManager;
// Singleton instance
var cleanupManagerInstance = null;
function getCleanupManager() {
    if (!cleanupManagerInstance) {
        cleanupManagerInstance = new CleanupManager();
    }
    return cleanupManagerInstance;
}
// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    window.CleanupManager = CleanupManager;
    window.getCleanupManager = getCleanupManager;
    window.cleanupManager = getCleanupManager();
}
