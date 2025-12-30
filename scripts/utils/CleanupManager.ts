/**
 * Centralized cleanup manager to prevent memory leaks
 */

export class CleanupManager {
    private cleanupFns: Array<() => void> = [];
    private timeouts: Set<number> = new Set();
    private intervals: Set<number> = new Set();

    /**
     * Register a cleanup function
     */
    register(cleanup: () => void): void {
        this.cleanupFns.push(cleanup);
    }

    /**
     * Track setTimeout for automatic cleanup
     */
    setTimeout(fn: () => void, delay: number): number {
        const id = window.setTimeout(() => {
            this.timeouts.delete(id);
            fn();
        }, delay);
        this.timeouts.add(id);
        return id;
    }

    /**
     * Track setInterval for automatic cleanup
     */
    setInterval(fn: () => void, delay: number): number {
        const id = window.setInterval(fn, delay);
        this.intervals.add(id);
        return id;
    }

    /**
     * Clear a tracked timeout
     */
    clearTimeout(id: number): void {
        window.clearTimeout(id);
        this.timeouts.delete(id);
    }

    /**
     * Clear a tracked interval
     */
    clearInterval(id: number): void {
        window.clearInterval(id);
        this.intervals.delete(id);
    }

    /**
     * Execute all cleanup functions
     */
    cleanup(): void {
        // Execute cleanup functions
        this.cleanupFns.forEach(fn => {
            try {
                fn();
            } catch (error) {
                console.error('Error in cleanup function:', error);
            }
        });
        this.cleanupFns = [];

        // Clear all timeouts
        this.timeouts.forEach(id => {
            window.clearTimeout(id);
        });
        this.timeouts.clear();

        // Clear all intervals
        this.intervals.forEach(id => {
            window.clearInterval(id);
        });
        this.intervals.clear();
    }
}

// Singleton instance
let cleanupManagerInstance: CleanupManager | null = null;

export function getCleanupManager(): CleanupManager {
    if (!cleanupManagerInstance) {
        cleanupManagerInstance = new CleanupManager();
    }
    return cleanupManagerInstance;
}

// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    (window as any).CleanupManager = CleanupManager;
    (window as any).getCleanupManager = getCleanupManager;
    (window as any).cleanupManager = getCleanupManager();
}

