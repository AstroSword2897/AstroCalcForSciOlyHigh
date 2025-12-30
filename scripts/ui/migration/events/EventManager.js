"use strict";
/**
 * Type-safe event management with automatic cleanup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
exports.getEventManager = getEventManager;
var EventManager = /** @class */ (function () {
    function EventManager() {
        this.listeners = [];
        this.delegatedListeners = new Map();
    }
    /**
     * Add event listener with automatic tracking
     */
    EventManager.prototype.on = function (element, event, callback, options) {
        var _this = this;
        element.addEventListener(event, callback, options);
        var listener = {
            element: element,
            event: event,
            callback: callback,
            options: options
        };
        this.listeners.push(listener);
        // Return cleanup function
        return function () { return _this.off(element, event, callback); };
    };
    /**
     * Remove specific event listener
     */
    EventManager.prototype.off = function (element, event, callback) {
        element.removeEventListener(event, callback);
        this.listeners = this.listeners.filter(function (l) { return !(l.element === element && l.event === event && l.callback === callback); });
    };
    /**
     * Event delegation for dynamic content
     */
    EventManager.prototype.delegate = function (parent, event, selector, callback) {
        var _this = this;
        var handler = function (event) {
            var target = event.target.closest(selector);
            if (target && parent.contains(target)) {
                callback(event, target);
            }
        };
        parent.addEventListener(event, handler, true);
        // Track delegated listener
        if (!this.delegatedListeners.has(parent)) {
            this.delegatedListeners.set(parent, new Map());
        }
        this.delegatedListeners.get(parent).set(event, handler);
        return function () {
            var _a;
            parent.removeEventListener(event, handler, true);
            (_a = _this.delegatedListeners.get(parent)) === null || _a === void 0 ? void 0 : _a.delete(event);
        };
    };
    /**
     * Cleanup all event listeners
     */
    EventManager.prototype.cleanup = function () {
        // Remove regular listeners
        this.listeners.forEach(function (_a) {
            var element = _a.element, event = _a.event, callback = _a.callback, options = _a.options;
            try {
                element.removeEventListener(event, callback, options);
            }
            catch (error) {
                console.warn('Error removing listener:', error);
            }
        });
        this.listeners = [];
        // Remove delegated listeners
        this.delegatedListeners.forEach(function (events, parent) {
            events.forEach(function (handler, event) {
                try {
                    parent.removeEventListener(event, handler, true);
                }
                catch (error) {
                    console.warn('Error removing delegated listener:', error);
                }
            });
        });
        this.delegatedListeners.clear();
    };
    return EventManager;
}());
exports.EventManager = EventManager;
// Singleton instance
var eventManagerInstance = null;
function getEventManager() {
    if (!eventManagerInstance) {
        eventManagerInstance = new EventManager();
    }
    return eventManagerInstance;
}
// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    window.EventManager = EventManager;
    window.getEventManager = getEventManager;
}
