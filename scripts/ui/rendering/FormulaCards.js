/**
 * Formula Card Rendering Module
 * Extracted from ui.js for better modularity
 */

class FormulaCardRenderer {
    constructor() {
        this.dom = typeof window !== 'undefined' && typeof window.dom ? window.dom : null;
        this.lifecycle = typeof window !== 'undefined' && typeof window.lifecycleManager ? window.lifecycleManager : null;
    }
    
    /**
     * Get DOM element (with caching)
     */
    getElement(id) {
        if (this.dom) {
            return this.dom.get(id);
        }
        return document.getElementById(id);
    }
    
    /**
     * Create formula card element
     */
    createCard(formula, score, metrics, maxScore) {
        // This will be implemented by extracting from ui.js
        // For now, return a placeholder
        const card = document.createElement('div');
        card.className = 'formula-card';
        card.dataset.formulaId = formula.id;
        return card;
    }
    
    /**
     * Render formula list
     */
    renderList(formulas) {
        const formulaList = this.getElement('formula-list');
        if (!formulaList) {
            console.error('[FormulaCardRenderer] formula-list element not found');
            return;
        }
        
        // Clear existing
        formulaList.innerHTML = '';
        
        // Render cards
        const fragment = document.createDocumentFragment();
        formulas.forEach(formula => {
            const card = this.createCard(formula);
            fragment.appendChild(card);
        });
        
        formulaList.appendChild(fragment);
    }
}

// Export
if (typeof window !== 'undefined') {
    window.FormulaCardRenderer = FormulaCardRenderer;
}

