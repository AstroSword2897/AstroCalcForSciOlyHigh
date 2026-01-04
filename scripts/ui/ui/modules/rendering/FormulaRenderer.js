/**
 * FormulaRenderer - Handles rendering of formula cards
 * Simple implementation for modular system
 */
export class FormulaRenderer {
    constructor(options) {
        this.onFormulaClick = options.onFormulaClick;
    }

    renderFormulaCards(formulas, container) {
        if (!container) {
            console.error('[FormulaRenderer] No container found');
            return;
        }

        console.log(`[FormulaRenderer] Rendering ${formulas.length} formula cards`);
        
        // Clear existing content
        container.innerHTML = '';
        
        // Create formula cards
        formulas.forEach((formula, index) => {
            const card = this.createFormulaCard(formula, index);
            container.appendChild(card);
        });
        
        console.log(`[FormulaRenderer] ✅ Rendered ${formulas.length} formula cards`);
    }

    createFormulaCard(formula, index) {
        const card = document.createElement('div');
        card.className = 'formula-card';
        card.setAttribute('data-formula-id', formula.id);
        card.setAttribute('data-testid', `formula-card-${index}`);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${formula.name}: ${formula.description || 'Click to use this formula'}`);
        
        // Styling
        card.style.cssText = `
            background: linear-gradient(135deg, #2a2a2a, #3a3a3a);
            border: 2px solid #00ff00;
            border-radius: 12px;
            padding: 20px;
            margin: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 255, 0, 0.2);
        `;
        
        // Content
        card.innerHTML = `
            <h3 style="color: #00ff00; margin: 0 0 10px 0; font-size: 1.2em;">${formula.name}</h3>
            <div style="color: #ffffff; font-family: 'Courier New', monospace; font-size: 1.1em; margin-bottom: 10px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 6px;">
                ${formula.equation}
            </div>
            <p style="color: #cccccc; margin: 0; font-size: 0.9em;">${formula.description || 'Click to use this formula'}</p>
        `;
        
        // Hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 8px 25px rgba(0, 255, 0, 0.4)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 15px rgba(0, 255, 0, 0.2)';
        });
        
        // Click handler
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`[FormulaRenderer] Formula card clicked: ${formula.name}`);
            
            // Call the provided callback
            if (this.onFormulaClick) {
                this.onFormulaClick(formula);
            } else if (typeof window.selectFormula === 'function') {
                window.selectFormula(formula);
            } else {
                console.warn('[FormulaRenderer] No click handler available');
            }
        });
        
        return card;
    }

    filterFormulas(formulas, query) {
        const filtered = formulas.filter(formula => 
            formula.name.toLowerCase().includes(query.toLowerCase()) ||
            formula.description?.toLowerCase().includes(query.toLowerCase()) ||
            formula.equation.toLowerCase().includes(query.toLowerCase())
        );
        
        console.log(`[FormulaRenderer] Filtered to ${filtered.length} formulas for query: "${query}"`);
        return filtered;
    }
}
