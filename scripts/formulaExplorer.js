/**
 * Formula Explorer - Advanced formula browsing and exploration
 * Provides search, category browsing, relationship exploration, and calculator
 * 
 * Improvements:
 * - Event delegation to avoid re-binding
 * - Debounced search for performance
 * - XSS protection with HTML escaping
 * - Calculator mode integration
 * - Better state management
 */

let formulaExplorerState = {
    searchQuery: '',
    selectedCategory: null,
    selectedFormula: null,
    viewMode: 'search', // 'search', 'categories', 'relationships', 'calculator'
    variableValues: {},
    calculationResult: null,
    copied: false
};

let searchDebounceTimer = null;
let explorerEventHandlersSetup = false;

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

/**
 * Initialize the Formula Explorer
 */
function initFormulaExplorer() {
    // Setup event handlers once (using delegation)
    if (!explorerEventHandlersSetup) {
        setupFormulaExplorerEvents();
        explorerEventHandlersSetup = true;
    }
    
    // Render the explorer
    renderFormulaExplorer();
}

/**
 * Setup event listeners for Formula Explorer (using delegation)
 * This is called once and handles all dynamic content
 */
function setupFormulaExplorerEvents() {
    const container = document.getElementById('formula-explorer-container');
    if (!container) return;
    
    // Use event delegation on the container for all click events
    container.addEventListener('click', (e) => {
        // View mode buttons
        const viewModeBtn = e.target.closest('.explorer-view-mode-btn');
        if (viewModeBtn) {
            const mode = viewModeBtn.dataset.mode;
            if (mode) {
                setExplorerViewMode(mode);
            }
            return;
        }
        
        // Category buttons
        const categoryBtn = e.target.closest('.explorer-category-btn');
        if (categoryBtn) {
            const category = categoryBtn.dataset.category;
            if (category) {
                toggleExplorerCategory(category);
            }
            return;
        }
        
        // Formula selection
        const formulaBtn = e.target.closest('.explorer-formula-item');
        if (formulaBtn) {
            const formulaId = formulaBtn.dataset.formulaId;
            if (formulaId) {
                selectExplorerFormula(formulaId);
            }
            return;
        }
        
        // Use formula button
        const useBtn = e.target.closest('.explorer-use-formula-btn');
        if (useBtn) {
            const formulaId = useBtn.dataset.useFormulaId;
            if (formulaId) {
                const formula = formulas.find(f => f.id === formulaId);
                if (formula && typeof selectFormula === 'function') {
                    selectFormula(formula);
                    // Switch to formulas tab
                    if (typeof switchMainTab === 'function') {
                        switchMainTab('formulas');
                    }
                }
            }
            return;
        }
        
        // Related formula buttons
        const relatedBtn = e.target.closest('.explorer-related-formula-btn');
        if (relatedBtn) {
            const formulaId = relatedBtn.dataset.relatedFormulaId;
            if (formulaId) {
                selectExplorerFormula(formulaId);
            }
            return;
        }
        
        // Calculate button
        const calcBtn = e.target.closest('.explorer-calculate-btn');
        if (calcBtn) {
            handleExplorerCalculate();
            return;
        }
        
        // Copy result button
        const copyBtn = e.target.closest('.explorer-copy-btn');
        if (copyBtn) {
            handleExplorerCopyResult();
            return;
        }
    });
    
    // Handle search input with debouncing
    container.addEventListener('input', (e) => {
        const searchInput = e.target.closest('#explorer-search-input');
        if (searchInput) {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                formulaExplorerState.searchQuery = searchInput.value;
                renderFormulaExplorer();
            }, 300); // 300ms debounce
            return;
        }
        
        // Variable input changes
        const varInput = e.target.closest('.explorer-variable-input');
        if (varInput) {
            const symbol = varInput.dataset.variableSymbol;
            const value = varInput.value;
            if (symbol) {
                handleExplorerVariableChange(symbol, value);
            }
            return;
        }
    });
}

/**
 * Handle variable value change
 */
function handleExplorerVariableChange(symbol, value) {
    formulaExplorerState.variableValues = formulaExplorerState.variableValues || {};
    formulaExplorerState.variableValues[symbol] = value === '' ? null : value;
    // Clear result when inputs change
    formulaExplorerState.calculationResult = null;
    // Re-render only the calculator section if in calculator mode
    if (formulaExplorerState.viewMode === 'calculator') {
        renderFormulaExplorer();
    }
}

/**
 * Handle calculation
 */
function handleExplorerCalculate() {
    try {
        if (!formulaExplorerState.selectedFormula) {
            formulaExplorerState.calculationResult = { error: 'Please select a formula first' };
            renderFormulaExplorer();
            return;
        }
        
        if (typeof FormulaCalculator === 'undefined') {
            throw new Error('FormulaCalculator not available');
        }
        
        const calculator = new FormulaCalculator(formulaExplorerState.selectedFormula);
        const result = calculator.solve(formulaExplorerState.variableValues || {});
        formulaExplorerState.calculationResult = result;
        formulaExplorerState.copied = false;
        renderFormulaExplorer();
    } catch (error) {
        formulaExplorerState.calculationResult = { error: error.message };
        renderFormulaExplorer();
    }
}

/**
 * Handle copy result
 */
function handleExplorerCopyResult() {
    if (formulaExplorerState.calculationResult && 
        formulaExplorerState.calculationResult.value !== undefined &&
        !formulaExplorerState.calculationResult.isSymbolic) {
        
        const result = formulaExplorerState.calculationResult;
        const text = `${result.variable} = ${result.value.toExponential(4)} ${result.unit}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                formulaExplorerState.copied = true;
                renderFormulaExplorer();
                setTimeout(() => {
                    formulaExplorerState.copied = false;
                    renderFormulaExplorer();
                }, 2000);
            }).catch(() => {
                // Fallback if clipboard API fails
                copyToClipboardFallback(text);
            });
        } else {
            // Fallback for older browsers
            copyToClipboardFallback(text);
        }
    }
}

/**
 * Fallback copy to clipboard
 */
function copyToClipboardFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        formulaExplorerState.copied = true;
        renderFormulaExplorer();
        setTimeout(() => {
            formulaExplorerState.copied = false;
            renderFormulaExplorer();
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
    document.body.removeChild(textarea);
}

/**
 * Set the view mode for the explorer
 */
function setExplorerViewMode(mode) {
    formulaExplorerState.viewMode = mode;
    // Preserve selectedFormula when switching modes (don't reset it)
    // Only clear calculation result when leaving calculator mode
    if (mode !== 'calculator') {
        formulaExplorerState.calculationResult = null;
    }
    renderFormulaExplorer();
}

/**
 * Toggle category selection
 */
function toggleExplorerCategory(category) {
    if (formulaExplorerState.selectedCategory === category) {
        formulaExplorerState.selectedCategory = null;
    } else {
        formulaExplorerState.selectedCategory = category;
    }
    renderFormulaExplorer();
}

/**
 * Select a formula in the explorer
 */
function selectExplorerFormula(formulaId) {
    const formula = formulas.find(f => f.id === formulaId);
    if (formula) {
        formulaExplorerState.selectedFormula = formula;
        // Reset variable values when selecting a new formula
        formulaExplorerState.variableValues = {};
        formulaExplorerState.calculationResult = null;
        renderFormulaExplorer();
    }
}

/**
 * Get search results
 */
function getExplorerSearchResults() {
    if (!formulaExplorerState.searchQuery.trim()) return [];

    const query = formulaExplorerState.searchQuery.toLowerCase();
    return formulas
        .filter(formula => 
            formula.name.toLowerCase().includes(query) ||
            formula.description.toLowerCase().includes(query) ||
            (formula.concepts && formula.concepts.some(c => c.toLowerCase().includes(query))) ||
            (formula.keywords && formula.keywords.some(k => k.toLowerCase().includes(query)))
        )
        .slice(0, 20);
}

/**
 * Get formulas for selected category
 */
function getExplorerCategoryFormulas() {
    if (!formulaExplorerState.selectedCategory || !formulaCategories[formulaExplorerState.selectedCategory]) {
        return [];
    }
    return formulaCategories[formulaExplorerState.selectedCategory]
        .map(id => formulas.find(f => f.id === id))
        .filter(Boolean);
}

/**
 * Get related formulas for a given formula
 */
function getExplorerRelatedFormulas(formula) {
    if (!formula) return [];
    
    const relatedIds = new Set();
    
    // Add all related formulas from direct relationships
    if (formula.relationships) {
        if (formula.relationships.relatedTo) {
            formula.relationships.relatedTo.forEach(id => relatedIds.add(id));
        }
        if (formula.relationships.uses) {
            formula.relationships.uses.forEach(id => relatedIds.add(id));
        }
        if (formula.relationships.prerequisites) {
            formula.relationships.prerequisites.forEach(id => relatedIds.add(id));
        }
        if (formula.relationships.derivedFrom) {
            formula.relationships.derivedFrom.forEach(id => relatedIds.add(id));
        }
    }
    
    // Also use formulaRelationships if available (with fallback)
    if (typeof formulaRelationships !== 'undefined' && formulaRelationships) {
        try {
            const relationships = formulaRelationships.getRelatedFormulas(formula.id);
            if (relationships && relationships.all) {
                relationships.all.forEach(id => relatedIds.add(id));
            }
        } catch (e) {
            console.warn('Error getting formula relationships:', e);
        }
    }
    
    return Array.from(relatedIds)
        .map(id => formulas.find(f => f.id === id))
        .filter(Boolean)
        .slice(0, 10);
}

/**
 * Render the Formula Explorer
 */
function renderFormulaExplorer() {
    const container = document.getElementById('formula-explorer-container');
    if (!container) return;

    const searchResults = getExplorerSearchResults();
    const categoryFormulas = getExplorerCategoryFormulas();
    
    // Determine which formulas to show
    let formulasToShow = [];
    if (formulaExplorerState.viewMode === 'search') {
        formulasToShow = searchResults;
    } else if (formulaExplorerState.viewMode === 'categories') {
        formulasToShow = categoryFormulas;
    } else if (formulaExplorerState.viewMode === 'relationships') {
        if (formulaExplorerState.selectedFormula) {
            formulasToShow = getExplorerRelatedFormulas(formulaExplorerState.selectedFormula);
        } else {
            formulasToShow = formulas.slice(0, 20);
        }
    } else if (formulaExplorerState.viewMode === 'calculator') {
        // In calculator mode, show all formulas or filtered by search
        if (formulaExplorerState.searchQuery.trim()) {
            formulasToShow = searchResults;
        } else {
            formulasToShow = formulas.slice(0, 20);
        }
    }

    container.innerHTML = `
        <div class="explorer-header">
            <div class="explorer-title-section">
                <h2>🔍 Formula Explorer</h2>
                <p class="explorer-subtitle">Navigate ${formulas.length}+ formulas across all major topics in astronomy</p>
            </div>
            
            <!-- View Mode Selector -->
            <div class="explorer-view-modes">
                <button class="explorer-view-mode-btn ${formulaExplorerState.viewMode === 'search' ? 'active' : ''}" data-mode="search">
                    🔍 Search
                </button>
                <button class="explorer-view-mode-btn ${formulaExplorerState.viewMode === 'categories' ? 'active' : ''}" data-mode="categories">
                    📁 Categories
                </button>
                <button class="explorer-view-mode-btn ${formulaExplorerState.viewMode === 'relationships' ? 'active' : ''}" data-mode="relationships">
                    🔗 Relationships
                </button>
                <button class="explorer-view-mode-btn ${formulaExplorerState.viewMode === 'calculator' ? 'active' : ''}" data-mode="calculator">
                    🧮 Calculator
                </button>
            </div>
        </div>

        <div class="explorer-layout">
            <!-- Left Panel -->
            <div class="explorer-left-panel">
                ${renderExplorerLeftPanel()}
                
                <!-- Results List -->
                <div class="explorer-results-panel">
                    <h3 class="explorer-results-title">
                        ${formulaExplorerState.viewMode === 'search' ? 'Search Results' : 
                          formulaExplorerState.viewMode === 'categories' ? 'Category Formulas' : 
                          formulaExplorerState.viewMode === 'calculator' ? 'Available Formulas' :
                          'All Formulas'}
                        <span class="explorer-count">(${formulasToShow.length})</span>
                    </h3>
                    <div class="explorer-formula-list">
                        ${formulasToShow.length > 0 ? 
                            formulasToShow.map(f => renderExplorerFormulaItem(f)).join('') :
                            '<p class="explorer-empty">No formulas found</p>'
                        }
                    </div>
                </div>
            </div>

            <!-- Right Panel - Formula Details -->
            <div class="explorer-right-panel">
                ${formulaExplorerState.selectedFormula ? 
                    renderExplorerFormulaDetails(formulaExplorerState.selectedFormula) :
                    renderExplorerEmptyState()
                }
            </div>
        </div>

        <!-- Database Stats -->
        <div class="explorer-stats">
            <div class="explorer-stat-card">
                <div class="explorer-stat-value">${formulas.length}+</div>
                <div class="explorer-stat-label">Total Formulas</div>
            </div>
            <div class="explorer-stat-card">
                <div class="explorer-stat-value">${Object.keys(formulaCategories).length}</div>
                <div class="explorer-stat-label">Categories</div>
            </div>
            <div class="explorer-stat-card">
                <div class="explorer-stat-value">1000+</div>
                <div class="explorer-stat-label">Relationships</div>
            </div>
            <div class="explorer-stat-card">
                <div class="explorer-stat-value">2000+</div>
                <div class="explorer-stat-label">Concepts & Keywords</div>
            </div>
        </div>
    `;
}

/**
 * Render the left panel based on view mode
 */
function renderExplorerLeftPanel() {
    if (formulaExplorerState.viewMode === 'search') {
        return `
            <div class="explorer-search-panel">
                <div class="explorer-panel-header">
                    <span class="explorer-icon">🔍</span>
                    <h3>Search Formulas</h3>
                </div>
                <input 
                    type="text" 
                    id="explorer-search-input" 
                    class="explorer-search-input"
                    placeholder="Search by name, concept, or keyword..."
                    value="${escapeHtml(formulaExplorerState.searchQuery)}"
                />
            </div>
        `;
    } else if (formulaExplorerState.viewMode === 'categories') {
        const categories = Object.keys(formulaCategories);
        return `
            <div class="explorer-categories-panel">
                <div class="explorer-panel-header">
                    <span class="explorer-icon">📁</span>
                    <h3>Categories</h3>
                </div>
                <div class="explorer-category-list">
                    ${categories.map(cat => `
                        <button 
                            class="explorer-category-btn ${formulaExplorerState.selectedCategory === cat ? 'active' : ''}"
                            data-category="${escapeHtml(cat)}"
                        >
                            ${escapeHtml(cat)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (formulaExplorerState.viewMode === 'calculator') {
        // Calculator input panel
        if (formulaExplorerState.selectedFormula) {
            return renderExplorerCalculatorInputs();
        } else {
            return `
                <div class="explorer-calculator-panel">
                    <div class="explorer-panel-header">
                        <span class="explorer-icon">🧮</span>
                        <h3>Calculator</h3>
                    </div>
                    <p class="explorer-help-text">
                        Select a formula to enter values and calculate the unknown variable.
                    </p>
                </div>
            `;
        }
    } else {
        return `
            <div class="explorer-relationships-panel">
                <div class="explorer-panel-header">
                    <span class="explorer-icon">🔗</span>
                    <h3>Relationships</h3>
                </div>
                <p class="explorer-help-text">
                    Select a formula to explore its connections to other formulas in the database.
                </p>
            </div>
        `;
    }
}

/**
 * Render calculator input panel
 */
function renderExplorerCalculatorInputs() {
    if (!formulaExplorerState.selectedFormula) return '';
    
    const formula = formulaExplorerState.selectedFormula;
    const variableValues = formulaExplorerState.variableValues || {};
    
    // Filter out constants from variables
    const constantSymbols = new Set();
    if (formula.constants) {
        Object.keys(formula.constants).forEach(key => constantSymbols.add(key));
    }
    if (globalConstants) {
        Object.keys(globalConstants).forEach(key => constantSymbols.add(key));
    }
    
    const userVariables = formula.variables.filter(v => !constantSymbols.has(v.symbol));
    
    return `
        <div class="explorer-calculator-panel">
            <div class="explorer-panel-header">
                <span class="explorer-icon">🧮</span>
                <h3>Input Values</h3>
            </div>
            <div class="explorer-calculator-inputs">
                ${userVariables.map(variable => {
                    const currentValue = variableValues[variable.symbol] || '';
                    return `
                        <div class="explorer-input-group">
                            <label class="explorer-input-label">
                                ${escapeHtml(variable.symbol)} (${escapeHtml(variable.unit)})
                            </label>
                            <input
                                type="number"
                                class="explorer-variable-input"
                                data-variable-symbol="${escapeHtml(variable.symbol)}"
                                placeholder="Enter ${escapeHtml(variable.name)}"
                                value="${escapeHtml(currentValue)}"
                            />
                            <p class="explorer-input-hint">${escapeHtml(variable.description)}</p>
                        </div>
                    `;
                }).join('')}
            </div>
            <button class="explorer-calculate-btn">
                🧮 Calculate
            </button>
        </div>
    `;
}

/**
 * Render a formula item in the list
 */
function renderExplorerFormulaItem(formula) {
    const isSelected = formulaExplorerState.selectedFormula && 
                      formulaExplorerState.selectedFormula.id === formula.id;
    
    return `
        <div 
            class="explorer-formula-item ${isSelected ? 'active' : ''}"
            data-formula-id="${escapeHtml(formula.id)}"
        >
            <div class="explorer-formula-name">${escapeHtml(formula.name)}</div>
            <div class="explorer-formula-equation">${escapeHtml(formula.equation)}</div>
        </div>
    `;
}

/**
 * Render formula details
 */
function renderExplorerFormulaDetails(formula) {
    const relatedFormulas = getExplorerRelatedFormulas(formula);
    const isCalculatorMode = formulaExplorerState.viewMode === 'calculator';
    
    return `
        <div class="explorer-formula-details">
            <div class="explorer-details-header">
                <h2 class="explorer-formula-title">${escapeHtml(formula.name)}</h2>
                <button class="explorer-use-formula-btn" data-use-formula-id="${escapeHtml(formula.id)}">
                    Use This Formula →
                </button>
            </div>
            
            <p class="explorer-formula-description">${escapeHtml(formula.description)}</p>
            
            <div class="explorer-equation-box">
                <div class="explorer-equation-label">Equation:</div>
                <div class="explorer-equation-text">${escapeHtml(formula.equation)}</div>
            </div>

            ${formula.concepts && formula.concepts.length > 0 ? `
                <div class="explorer-section">
                    <h3 class="explorer-section-title">
                        <span class="explorer-icon">🏷️</span>
                        Concepts
                    </h3>
                    <div class="explorer-tags">
                        ${formula.concepts.map(concept => `
                            <span class="explorer-tag">${escapeHtml(concept)}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${!isCalculatorMode ? `
                <div class="explorer-section">
                    <h3 class="explorer-section-title">Variables</h3>
                    <div class="explorer-variables-list">
                        ${formula.variables.map(v => `
                            <div class="explorer-variable-item">
                                <div class="explorer-variable-header">
                                    <span class="explorer-variable-symbol">${escapeHtml(v.symbol)}</span>
                                    <span class="explorer-variable-unit">${escapeHtml(v.unit)}</span>
                                </div>
                                <div class="explorer-variable-name">${escapeHtml(v.name)}</div>
                                <div class="explorer-variable-description">${escapeHtml(v.description)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${formula.constants && Object.keys(formula.constants).length > 0 ? `
                <div class="explorer-section">
                    <h3 class="explorer-section-title">Constants</h3>
                    <div class="explorer-constants-box">
                        ${Object.entries(formula.constants).map(([name, value]) => `
                            <div class="explorer-constant-item">
                                <span class="explorer-constant-name">${escapeHtml(name)}</span>
                                <span class="explorer-constant-equals"> = </span>
                                <span class="explorer-constant-value">${typeof value === 'number' ? value.toExponential(5) : escapeHtml(String(value))}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${isCalculatorMode && formulaExplorerState.calculationResult ? `
                <div class="explorer-section">
                    <h3 class="explorer-section-title">Calculation Result</h3>
                    <div class="explorer-result-box">
                        ${formulaExplorerState.calculationResult.error ? `
                            <div class="explorer-result-error">
                                ${escapeHtml(formulaExplorerState.calculationResult.error)}
                            </div>
                        ` : formulaExplorerState.calculationResult.isSymbolic ? `
                            <div class="explorer-result-symbolic">
                                <div class="explorer-result-label">Symbolic Expression:</div>
                                <div class="explorer-result-value">${escapeHtml(formulaExplorerState.calculationResult.value)}</div>
                                <div class="explorer-result-unit">${escapeHtml(formulaExplorerState.calculationResult.unit)}</div>
                            </div>
                        ` : `
                            <div class="explorer-result-success">
                                <div class="explorer-result-label">Result:</div>
                                <div class="explorer-result-value">
                                    ${escapeHtml(formulaExplorerState.calculationResult.variable)} = 
                                    ${formulaExplorerState.calculationResult.value.toExponential(4)} 
                                    ${escapeHtml(formulaExplorerState.calculationResult.unit)}
                                </div>
                                <button class="explorer-copy-btn">
                                    ${formulaExplorerState.copied ? '✓ Copied!' : '📋 Copy Result'}
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            ` : ''}

            ${formula.relationships && (formula.relationships.relatedTo || formula.relationships.uses || formula.relationships.prerequisites) && !isCalculatorMode ? `
                <div class="explorer-section">
                    <h3 class="explorer-section-title">
                        <span class="explorer-icon">🔗</span>
                        Related Formulas
                    </h3>
                    <div class="explorer-related-formulas">
                        ${relatedFormulas.length > 0 ? 
                            relatedFormulas.map(f => `
                                <button 
                                    class="explorer-related-formula-btn"
                                    data-related-formula-id="${escapeHtml(f.id)}"
                                >
                                    ${escapeHtml(f.name)}
                                </button>
                            `).join('') :
                            '<p class="explorer-empty">No related formulas found</p>'
                        }
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Render empty state
 */
function renderExplorerEmptyState() {
    return `
        <div class="explorer-empty-state">
            <div class="explorer-empty-icon">📚</div>
            <p class="explorer-empty-text">Select a formula to view details</p>
        </div>
    `;
}

// Make selectExplorerFormula available globally for onclick handlers
window.selectExplorerFormula = selectExplorerFormula;
