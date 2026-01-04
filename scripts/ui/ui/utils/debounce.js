/**
 * Centralized debounce utility
 * Supports test mode (immediate execution) and production mode
 */
export function debounce(func, wait, options = {}) {
    const {
        leading = false,
        trailing = true
    } = options;
    
    let timeoutId;
    let lastArgs;
    let result;
    let lastCallTime = 0;
    
    function invokeFunc(...args) {
        result = func.apply(this, args);
        return result;
    }
    
    function leadingEdge(...args) {
        lastCallTime = Date.now();
        timeoutId = setTimeout(() => {
            timeoutId = undefined;
            if (trailing && lastArgs) {
                result = invokeFunc(...lastArgs);
                lastArgs = undefined;
            }
        }, wait);
        return leading ? invokeFunc(...args) : result;
    }
    
    function cancel() {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        timeoutId = undefined;
        lastArgs = undefined;
        lastCallTime = 0;
    }
    
    function flush() {
        if (timeoutId === undefined) {
            return result;
        }
        clearTimeout(timeoutId);
        timeoutId = undefined;
        if (lastArgs) {
            result = invokeFunc(...lastArgs);
            lastArgs = undefined;
        }
        return result;
    }
    
    function pending() {
        return timeoutId !== undefined;
    }
    
    function debounced(...args) {
        lastArgs = args;
        
        if (timeoutId === undefined) {
            return leadingEdge(...args);
        }
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            timeoutId = undefined;
            if (trailing && lastArgs) {
                result = invokeFunc(...lastArgs);
                lastArgs = undefined;
            }
        }, wait);
        
        return result;
    }
    
    debounced.cancel = cancel;
    debounced.flush = flush;
    debounced.pending = pending;
    
    return debounced;
}

/**
 * Create a debounced function with sensible defaults for search
 */
export function debounceSearch(func, wait = 75) {
    return debounce(func, wait, {
        leading: false,
        trailing: true
    });
}

