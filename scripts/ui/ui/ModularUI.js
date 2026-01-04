/**
 * Truly Modular UI System - No Legacy Dependencies
 * This system is completely self-contained and doesn't rely on any legacy code
 */

// Import only the modules we need
import { FormulaRenderer } from './modules/rendering/FormulaRenderer.js';
import { SearchEngine } from './modules/search/SearchEngine.js';
import { FormulaSelector } from './modules/formula/FormulaSelector.js';

export class ModularUI {
    constructor() {
        this.formulas = window.formulas || [];
        this.initialized = false;
        this.currentFormula = null;
    }

    async initialize() {
        if (this.initialized) return;
        
        console.log('[ModularUI] 🚀 Initializing completely modular system...');
        
        // Create formula renderer
        this.renderer = new FormulaRenderer({
            formulas: this.formulas,
            container: document.getElementById('formula-list')
        });
        
        // Create search engine
        this.searchEngine = new SearchEngine({
            formulas: this.formulas,
            inputElement: document.getElementById('command-palette-input')
        });
        
        // Create formula selector
        this.formulaSelector = new FormulaSelector({
            onSelectFormula: (formula) => this.selectFormula(formula)
        });
        
        // Render formula cards
        this.renderer.renderFormulaCards();
        
        // Setup search
        this.setupSearch();
        
        // Expose only what's necessary
        this.exposeGlobalFunctions();
        
        this.initialized = true;
        console.log('[ModularUI] ✅ Fully modular system initialized!');
    }

    setupSearch() {
        const searchInput = document.getElementById('command-palette-input');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            const filtered = this.renderer.filterFormulas(query);
            this.renderer.renderFormulaCards(filtered);
        });
    }

    selectFormula(formula) {
        console.log('[ModularUI] 📝 Selecting formula:', formula.name);
        this.currentFormula = formula;
        
        // Show calculator screen
        const inputScreen = document.getElementById('input-screen');
        const formulaSelection = document.getElementById('formula-selection');
        
        if (inputScreen && formulaSelection) {
            formulaSelection.style.display = 'none';
            inputScreen.style.display = 'block';
        }
        
        // Render calculator inputs
        this.renderCalculator(formula);
    }

    renderCalculator(formula) {
        const calculatorScreen = document.getElementById('calculator-screen');
        if (!calculatorScreen) return;
        
        calculatorScreen.innerHTML = `
            <h2>${formula.name}</h2>
            <div class="formula-equation">${formula.equation}</div>
            <div class="variables-container">
                ${this.renderVariableInputs(formula)}
            </div>
        `;
    }

    renderVariableInputs(formula) {
        // Extract variables from equation
        const variables = this.extractVariables(formula.equation);
        
        return variables.map(variable => `
            <div class="variable-input">
                <label for="${variable}">${variable}:</label>
                <input type="number" id="${variable}" placeholder="Enter value">
                <label class="na-checkbox">
                    <input type="checkbox" id="${variable}-na"> N/A (solve for this)
                </label>
            </div>
        `).join('');
    }

    extractVariables(equation) {
        // Simple variable extraction - find single letters
        const matches = equation.match(/\b[a-zA-Z]\b/g);
        return matches ? [...new Set(matches)] : [];
    }

    exposeGlobalFunctions() {
        // Expose only essential functions for compatibility
        window.selectFormula = (formula) => this.selectFormula(formula);
        window.modularUI = this;
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const modularUI = new ModularUI();
    modularUI.initialize();
});
