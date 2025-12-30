"use strict";
/**
 * DOM element cache to reduce repeated queries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMCache = void 0;
exports.getDOMCache = getDOMCache;
var DOMCache = /** @class */ (function () {
    function DOMCache() {
        this.cache = new Map();
    }
    /**
     * Get element by ID (cached)
     */
    DOMCache.prototype.get = function (id) {
        if (!this.cache.has(id)) {
            this.cache.set(id, document.getElementById(id));
        }
        return this.cache.get(id);
    };
    /**
     * Query selector (cached by selector string)
     */
    DOMCache.prototype.query = function (selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, document.querySelector(selector));
        }
        return this.cache.get(selector);
    };
    /**
     * Invalidate cache for specific ID
     */
    DOMCache.prototype.invalidate = function (id) {
        this.cache.delete(id);
    };
    /**
     * Clear all cache
     */
    DOMCache.prototype.clear = function () {
        this.cache.clear();
    };
    /**
     * Preload common elements
     */
    DOMCache.prototype.preload = function (ids) {
        var _this = this;
        ids.forEach(function (id) {
            if (!_this.cache.has(id)) {
                _this.cache.set(id, document.getElementById(id));
            }
        });
    };
    return DOMCache;
}());
exports.DOMCache = DOMCache;
// Singleton instance
var domCacheInstance = null;
function getDOMCache() {
    if (!domCacheInstance) {
        domCacheInstance = new DOMCache();
    }
    return domCacheInstance;
}
// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    window.DOMCache = DOMCache;
    window.getDOMCache = getDOMCache;
    window.domCache = getDOMCache();
}
