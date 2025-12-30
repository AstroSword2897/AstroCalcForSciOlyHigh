/**
 * MathJax Rendering Module
 * Extracted from ui.js for better modularity
 */

class MathJaxRenderer {
    constructor() {
        this.renderQueue = new Map();
        this.renderTimeout = null;
        this.renderDelay = 100; // Default delay
    }
    
    /**
     * Render MathJax in an element
     * @param {HTMLElement} element - Element to render MathJax in
     * @param {string} formulaId - Optional formula ID for queue management
     */
    render(element, formulaId = null) {
        if (!element) return;
        
        // Use current formula ID if not provided
        const currentFormula = typeof currentFormula !== 'undefined' ? currentFormula : null;
        const activeFormulaId = formulaId || (currentFormula ? currentFormula.id : 'default');
        
        // Initialize queue for this formula if needed
        if (!this.renderQueue.has(activeFormulaId)) {
            this.renderQueue.set(activeFormulaId, new Set());
        }
        this.renderQueue.get(activeFormulaId).add(element);
        
        // Clear old formula renders to prevent race conditions
        if (currentFormula && activeFormulaId !== currentFormula.id) {
            this.renderQueue.delete(currentFormula.id);
        }
        
        // Clear existing timeout
        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout);
        }
        
        // Debounce MathJax rendering
        this.renderTimeout = setTimeout(() => {
            const activeId = currentFormula ? currentFormula.id : 'default';
            const elementsToRender = this.renderQueue.has(activeId) 
                ? Array.from(this.renderQueue.get(activeId))
                : [];
            
            // Clear all queues
            this.renderQueue.clear();
            
            if (elementsToRender.length === 0) return;
            
            if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                MathJax.typesetPromise(elementsToRender).catch(function (err) {
                    console.warn('MathJax rendering error:', err);
                });
            } else {
                // Wait for MathJax to load
                if (typeof MathJax === 'undefined') {
                    let attempts = 0;
                    const maxAttempts = 20;
                    const checkMathJax = setInterval(() => {
                        attempts++;
                        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                            MathJax.typesetPromise(elementsToRender).catch(function (err) {
                                console.warn('MathJax rendering error:', err);
                            });
                            clearInterval(checkMathJax);
                        } else if (attempts >= maxAttempts) {
                            console.warn('MathJax failed to load');
                            clearInterval(checkMathJax);
                        }
                    }, 100);
                }
            }
        }, this.renderDelay);
    }
}

// Export
if (typeof window !== 'undefined') {
    window.MathJaxRenderer = MathJaxRenderer;
    // Create singleton instance
    window.mathJaxRenderer = new MathJaxRenderer();
}

