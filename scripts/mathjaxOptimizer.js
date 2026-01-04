/**
 * MathJax Optimizer - Debounced typesetting for smooth UI
 * 
 * Features:
 * - Debounced typesetting (batch multiple updates)
 * - RequestAnimationFrame batching
 * - Skip redundant typesets
 */

class MathJaxOptimizer {
    constructor() {
        this.typesetTimeout = null;
        this.rafScheduled = false;
        this.pendingElements = new Set();
        this.DEBOUNCE_MS = 50; // Batch updates within 50ms
        this.isTypesetting = false;
    }

    /**
     * Schedule MathJax typesetting (debounced)
     */
    scheduleTypeset(element = null) {
        // Add element to pending set
        if (element) {
            this.pendingElements.add(element);
        }

        // Clear existing timeout
        if (this.typesetTimeout) {
            clearTimeout(this.typesetTimeout);
        }

        // Schedule new typeset
        this.typesetTimeout = setTimeout(() => {
            this.performTypeset();
        }, this.DEBOUNCE_MS);
    }

    /**
     * Perform actual MathJax typesetting (batched)
     */
    async performTypeset() {
        if (this.isTypesetting) {
            // Already typesetting, reschedule
            this.scheduleTypeset();
            return;
        }

        this.isTypesetting = true;

        // Use requestAnimationFrame for smooth rendering
        if (!this.rafScheduled) {
            this.rafScheduled = true;
            requestAnimationFrame(async () => {
                try {
                    if (typeof window.MathJax !== 'undefined' && window.MathJax.typesetPromise) {
                        // Typeset all pending elements or entire document
                        if (this.pendingElements.size > 0) {
                            await window.MathJax.typesetPromise(Array.from(this.pendingElements));
                            this.pendingElements.clear();
                        } else {
                            await window.MathJax.typesetPromise();
                        }
                    } else if (typeof window.MathJax !== 'undefined' && window.MathJax.typeset) {
                        // Fallback for older MathJax versions
                        if (this.pendingElements.size > 0) {
                            window.MathJax.typeset(Array.from(this.pendingElements));
                            this.pendingElements.clear();
                        } else {
                            window.MathJax.typeset();
                        }
                    }
                } catch (error) {
                    console.warn('[MathJaxOptimizer] Typesetting error:', error);
                } finally {
                    this.isTypesetting = false;
                    this.rafScheduled = false;
                }
            });
        }
    }

    /**
     * Flush pending typesets immediately (for critical updates)
     */
    flush() {
        if (this.typesetTimeout) {
            clearTimeout(this.typesetTimeout);
            this.typesetTimeout = null;
        }
        return this.performTypeset();
    }

    /**
     * Cancel pending typesets
     */
    cancel() {
        if (this.typesetTimeout) {
            clearTimeout(this.typesetTimeout);
            this.typesetTimeout = null;
        }
        this.pendingElements.clear();
    }
}

// Export singleton
if (typeof window !== 'undefined') {
    window.mathJaxOptimizer = new MathJaxOptimizer();
}

export { MathJaxOptimizer };

