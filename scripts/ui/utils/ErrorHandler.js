/**
 * Standardized Error Handling
 * Consistent error classes and handling patterns
 */

/**
 * Validation Error
 * Thrown when input validation fails
 */
class ValidationError extends Error {
    constructor(field, message, value = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.value = value;
    }
    
    toJSON() {
        return {
            name: this.name,
            field: this.field,
            message: this.message,
            value: this.value
        };
    }
}

/**
 * Calculation Error
 * Thrown when calculation fails
 */
class CalculationError extends Error {
    constructor(message, context = {}) {
        super(message);
        this.name = 'CalculationError';
        this.context = context;
    }
    
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            context: this.context
        };
    }
}

/**
 * DOM Error
 * Thrown when DOM operation fails
 */
class DOMError extends Error {
    constructor(operation, element, message) {
        super(message || `DOM operation failed: ${operation}`);
        this.name = 'DOMError';
        this.operation = operation;
        this.element = element;
    }
    
    toJSON() {
        return {
            name: this.name,
            operation: this.operation,
            element: this.element ? this.element.id || this.element.tagName : null,
            message: this.message
        };
    }
}

/**
 * Error Handler Utility
 * Centralized error handling and display
 */
class ErrorHandler {
    constructor() {
        this.errorDisplay = null;
        this.errorHistory = [];
        this.maxHistorySize = 50;
    }
    
    /**
     * Set error display element
     */
    setErrorDisplay(element) {
        this.errorDisplay = element;
    }
    
    /**
     * Handle error
     */
    handle(error, options = {}) {
        const {
            showInUI = true,
            logToConsole = true,
            throwError = false
        } = options;
        
        // Log to console
        if (logToConsole) {
            if (error instanceof ValidationError) {
                console.warn(`[ValidationError] ${error.field}: ${error.message}`, error.value);
            } else if (error instanceof CalculationError) {
                console.error(`[CalculationError] ${error.message}`, error.context);
            } else if (error instanceof DOMError) {
                console.error(`[DOMError] ${error.operation}: ${error.message}`, error.element);
            } else {
                console.error('[Error]', error);
            }
        }
        
        // Add to history
        this.addToHistory(error);
        
        // Show in UI
        if (showInUI && this.errorDisplay) {
            this.displayError(error);
        }
        
        // Throw if requested
        if (throwError) {
            throw error;
        }
        
        return error;
    }
    
    /**
     * Display error in UI
     */
    displayError(error) {
        if (!this.errorDisplay) {
            return;
        }
        
        let message = error.message;
        let type = 'error';
        
        if (error instanceof ValidationError) {
            message = `${error.field}: ${message}`;
            type = 'warning';
        } else if (error instanceof CalculationError) {
            type = 'error';
        } else if (error instanceof DOMError) {
            type = 'warning';
        }
        
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = `error-message error-${type}`;
        errorElement.textContent = message;
        
        // Clear and add
        this.errorDisplay.innerHTML = '';
        this.errorDisplay.appendChild(errorElement);
        this.errorDisplay.classList.add('show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (this.errorDisplay) {
                this.errorDisplay.classList.remove('show');
            }
        }, 5000);
    }
    
    /**
     * Clear error display
     */
    clear() {
        if (this.errorDisplay) {
            this.errorDisplay.innerHTML = '';
            this.errorDisplay.classList.remove('show');
        }
    }
    
    /**
     * Add error to history
     */
    addToHistory(error) {
        this.errorHistory.push({
            error: error.toJSON ? error.toJSON() : {
                name: error.name || 'Error',
                message: error.message
            },
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory.shift();
        }
    }
    
    /**
     * Get error history
     */
    getHistory(limit = 10) {
        return this.errorHistory.slice(-limit);
    }
    
    /**
     * Clear error history
     */
    clearHistory() {
        this.errorHistory = [];
    }
}

// Export classes and singleton
if (typeof window !== 'undefined') {
    window.ValidationError = ValidationError;
    window.CalculationError = CalculationError;
    window.DOMError = DOMError;
    window.ErrorHandler = ErrorHandler;
    window.errorHandler = new ErrorHandler();
}

