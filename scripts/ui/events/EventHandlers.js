/**
 * Event Handlers Module
 * Extracted from ui.js for better modularity
 * Uses lifecycle manager for automatic cleanup
 */

class EventHandlers {
    constructor() {
        this.helpers = typeof window !== 'undefined' && typeof window.helpers ? window.helpers : null;
        this.lifecycle = typeof window !== 'undefined' && typeof window.lifecycleManager ? window.lifecycleManager : null;
        this.setup = false;
    }
    
    /**
     * Setup formula card event delegation
     */
    setupFormulaCardDelegation() {
        const formulaList = this.helpers ? this.helpers.getElement('formula-list') : document.getElementById('formula-list');
        if (!formulaList) {
            console.warn('[EventHandlers] formula-list not found');
            return;
        }
        
        // Check if already set up
        if (formulaList.dataset.delegationSetup === 'true') {
            return;
        }
        
        const clickHandler = (e) => {
            // Check if click is on a formula card
            const card = e.target.closest('.formula-card');
            if (card) {
                const formulaId = card.getAttribute('data-formula-id');
                if (!formulaId) return;
                
                if (typeof formulas === 'undefined') {
                    console.error('[EventHandlers] formulas array is undefined!');
                    return;
                }
                
                const formula = formulas.find(f => f.id === formulaId);
                if (!formula) return;
                
                if (typeof selectFormula !== 'function') {
                    console.error('[EventHandlers] selectFormula is not a function!');
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                try {
                    selectFormula(formula);
                } catch (error) {
                    console.error('[EventHandlers] Error calling selectFormula:', error);
                }
                return false;
            }
            
            // Handle search result items
            const searchResult = e.target.closest('.search-result-item');
            if (searchResult) {
                const formulaId = searchResult.getAttribute('data-formula-id');
                if (formulaId && typeof window.selectSearchResultFormula === 'function') {
                    e.preventDefault();
                    e.stopPropagation();
                    window.selectSearchResultFormula(formulaId);
                    return false;
                }
            }
            
            // Handle "Use This Formula" button
            const useBtn = e.target.closest('.use-formula-btn');
            if (useBtn) {
                const formulaId = useBtn.getAttribute('data-formula-id');
                if (formulaId) {
                    const data = window.searchResultsData;
                    if (data && data.scoredFormulas) {
                        const formulaData = data.scoredFormulas.find(f => f.formula && f.formula.id === formulaId);
                        if (formulaData && formulaData.formula) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (typeof selectFormula === 'function') {
                                selectFormula(formulaData.formula);
                            }
                            return false;
                        }
                    }
                }
            }
            
            // Handle search suggestions
            const suggestion = e.target.closest('.search-suggestion-item');
            if (suggestion) {
                const suggestionText = suggestion.getAttribute('data-suggestion');
                if (suggestionText) {
                    const searchInput = this.helpers ? this.helpers.getElement('formula-search') : document.getElementById('formula-search');
                    if (searchInput) {
                        e.preventDefault();
                        e.stopPropagation();
                        searchInput.value = suggestionText;
                        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                        return false;
                    }
                }
            }
        };
        
        // Add listener with lifecycle tracking
        if (this.helpers) {
            this.helpers.addEventListener(formulaList, 'click', clickHandler, true);
            this.helpers.addEventListener(formulaList, 'click', clickHandler, false);
        } else {
            formulaList.addEventListener('click', clickHandler, true);
            formulaList.addEventListener('click', clickHandler, false);
        }
        
        // Handle keyboard events
        const keyHandler = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const card = e.target.closest('.formula-card');
                if (card) {
                    const formulaId = card.getAttribute('data-formula-id');
                    if (formulaId) {
                        const formula = formulas.find(f => f.id === formulaId);
                        if (formula && typeof selectFormula === 'function') {
                            e.preventDefault();
                            e.stopPropagation();
                            selectFormula(formula);
                            return false;
                        }
                    }
                }
            }
        };
        
        if (this.helpers) {
            this.helpers.addEventListener(formulaList, 'keydown', keyHandler);
        } else {
            formulaList.addEventListener('keydown', keyHandler);
        }
        
        formulaList.dataset.delegationSetup = 'true';
    }
    
    /**
     * Setup all event listeners
     */
    setupAll() {
        if (this.setup) {
            return;
        }
        
        // Back button
        const backButton = this.helpers ? this.helpers.getElement('back-button') : document.getElementById('back-button');
        if (backButton) {
            const handler = (e) => {
                e.preventDefault();
                if (typeof switchToFormulaSelection === 'function') {
                    switchToFormulaSelection();
                }
            };
            
            if (this.helpers) {
                this.helpers.addEventListener(backButton, 'click', handler);
            } else {
                backButton.addEventListener('click', handler);
            }
        }
        
        // Main tab buttons
        const mainTabButtons = document.querySelectorAll('.main-tab-btn');
        mainTabButtons.forEach(btn => {
            const tabName = btn.getAttribute('data-main-tab');
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof switchMainTab === 'function') {
                    switchMainTab(tabName);
                }
            };
            
            if (this.helpers) {
                this.helpers.addEventListener(btn, 'click', handler);
            } else {
                btn.addEventListener('click', handler);
            }
        });
        
        // Input screen tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const handler = () => {
                const tabName = btn.getAttribute('data-tab');
                if (typeof switchTab === 'function') {
                    switchTab(tabName);
                }
            };
            
            if (this.helpers) {
                this.helpers.addEventListener(btn, 'click', handler);
            } else {
                btn.addEventListener('click', handler);
            }
        });
        
        // Calculate button
        const calcBtn = this.helpers ? this.helpers.getElement('calculate-btn') : document.getElementById('calculate-btn');
        if (calcBtn) {
            if (this.helpers) {
                this.helpers.addEventListener(calcBtn, 'click', performCalculation);
            } else {
                calcBtn.addEventListener('click', performCalculation);
            }
        }
        
        // Classification buttons
        const classifyBtn = this.helpers ? this.helpers.getElement('classify-btn') : document.getElementById('classify-btn');
        if (classifyBtn) {
            if (this.helpers) {
                this.helpers.addEventListener(classifyBtn, 'click', performClassification);
            } else {
                classifyBtn.addEventListener('click', performClassification);
            }
        }
        
        const mainClassifyBtn = this.helpers ? this.helpers.getElement('main-classify-btn') : document.getElementById('main-classify-btn');
        if (mainClassifyBtn) {
            if (this.helpers) {
                this.helpers.addEventListener(mainClassifyBtn, 'click', performMainClassification);
            } else {
                mainClassifyBtn.addEventListener('click', performMainClassification);
            }
        }
        
        // Setup formula card delegation
        this.setupFormulaCardDelegation();
        
        this.setup = true;
    }
    
    /**
     * Reset setup flag (for testing/debugging)
     */
    reset() {
        this.setup = false;
    }
}

// Export singleton
if (typeof window !== 'undefined') {
    window.EventHandlers = EventHandlers;
    window.eventHandlers = new EventHandlers();
}

