/**
 * Standardized Error Handling
 * Consistent error classes and handling patterns
 */

/**
 * Validation Error
 * Thrown when input validation fails
 */
export class ValidationError extends Error {
    public readonly field: string;
    public readonly value: any;

    constructor(field: string, message: string, value: any = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.value = value;
    }
    
    toJSON(): {
        name: string;
        field: string;
        message: string;
        value: any;
    } {
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
export class CalculationError extends Error {
    public readonly context: Record<string, any>;

    constructor(message: string, context: Record<string, any> = {}) {
        super(message);
        this.name = 'CalculationError';
        this.context = context;
    }
    
    toJSON(): {
        name: string;
        message: string;
        context: Record<string, any>;
    } {
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
export class DOMError extends Error {
    public readonly operation: string;
    public readonly element: Element | null;

    constructor(operation: string, element: Element | null, message?: string) {
        super(message || `DOM operation failed: ${operation}`);
        this.name = 'DOMError';
        this.operation = operation;
        this.element = element;
    }
    
    toJSON(): {
        name: string;
        operation: string;
        element: string | null;
        message: string;
    } {
        return {
            name: this.name,
            operation: this.operation,
            element: this.element ? (this.element.id || this.element.tagName) : null,
            message: this.message
        };
    }
}

export interface ErrorHistoryEntry {
    error: {
        name: string;
        message: string;
        [key: string]: any;
    };
    timestamp: number;
}

export interface ErrorHandlerOptions {
    showInUI?: boolean;
    logToConsole?: boolean;
    throwError?: boolean;
}

/**
 * Error Handler Utility
 * Centralized error handling and display
 */
export class ErrorHandler {
    private errorDisplay: HTMLElement | null = null;
    private errorHistory: ErrorHistoryEntry[] = [];
    private maxHistorySize: number = 50;
    
    /**
     * Set error display element
     */
    setErrorDisplay(element: HTMLElement | null): void {
        this.errorDisplay = element;
    }
    
    /**
     * Handle error
     */
    handle(error: Error, options: ErrorHandlerOptions = {}): Error {
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
    private displayError(error: Error): void {
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
        window.setTimeout(() => {
            if (this.errorDisplay) {
                this.errorDisplay.classList.remove('show');
            }
        }, 5000);
    }
    
    /**
     * Clear error display
     */
    clear(): void {
        if (this.errorDisplay) {
            this.errorDisplay.innerHTML = '';
            this.errorDisplay.classList.remove('show');
        }
    }
    
    /**
     * Add error to history
     */
    private addToHistory(error: Error): void {
        const errorData = (error as any).toJSON 
            ? (error as any).toJSON() 
            : {
                name: error.name || 'Error',
                message: error.message
            };
        
        this.errorHistory.push({
            error: errorData,
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
    getHistory(limit: number = 10): ErrorHistoryEntry[] {
        return this.errorHistory.slice(-limit);
    }
    
    /**
     * Clear error history
     */
    clearHistory(): void {
        this.errorHistory = [];
    }
}

// Export singleton instance
let errorHandlerInstance: ErrorHandler | null = null;

export function getErrorHandler(): ErrorHandler {
    if (!errorHandlerInstance) {
        errorHandlerInstance = new ErrorHandler();
    }
    return errorHandlerInstance;
}

// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    (window as any).ValidationError = ValidationError;
    (window as any).CalculationError = CalculationError;
    (window as any).DOMError = DOMError;
    (window as any).ErrorHandler = ErrorHandler;
    (window as any).getErrorHandler = getErrorHandler;
    (window as any).errorHandler = getErrorHandler();
}

