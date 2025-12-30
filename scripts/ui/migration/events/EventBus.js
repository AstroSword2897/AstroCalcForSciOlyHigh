"use strict";
/**
 * Type-safe event bus for application-wide events
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
exports.getEventBus = getEventBus;
var EventBus = /** @class */ (function () {
    function EventBus() {
        this.handlers = new Map();
    }
    /**
     * Subscribe to event
     */
    EventBus.prototype.on = function (event, handler) {
        var _this = this;
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event).add(handler);
        // Return unsubscribe function
        return function () {
            var _a;
            (_a = _this.handlers.get(event)) === null || _a === void 0 ? void 0 : _a.delete(handler);
        };
    };
    /**
     * Subscribe once (auto-unsubscribe after first call)
     */
    EventBus.prototype.once = function (event, handler) {
        var _this = this;
        var wrappedHandler = function (data) {
            handler(data);
            _this.off(event, wrappedHandler);
        };
        return this.on(event, wrappedHandler);
    };
    /**
     * Emit event
     */
    EventBus.prototype.emit = function (event, data) {
        var handlers = this.handlers.get(event);
        if (handlers) {
            handlers.forEach(function (handler) {
                try {
                    handler(data);
                }
                catch (error) {
                    console.error("Error in event handler for ".concat(event, ":"), error);
                }
            });
        }
    };
    /**
     * Unsubscribe from event
     */
    EventBus.prototype.off = function (event, handler) {
        var _a;
        (_a = this.handlers.get(event)) === null || _a === void 0 ? void 0 : _a.delete(handler);
    };
    /**
     * Clear all handlers
     */
    EventBus.prototype.clear = function () {
        this.handlers.clear();
    };
    return EventBus;
}());
exports.EventBus = EventBus;
// Singleton instance
var eventBusInstance = null;
function getEventBus() {
    if (!eventBusInstance) {
        eventBusInstance = new EventBus();
    }
    return eventBusInstance;
}
// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    window.EventBus = EventBus;
    window.getEventBus = getEventBus;
    window.eventBus = getEventBus();
}
