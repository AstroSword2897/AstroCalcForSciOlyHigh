/**
 * Search Results Rendering Module
 * Extracted from ui.js for better modularity
 */

class SearchResultsRenderer {
    constructor() {
        this.dom = typeof window !== 'undefined' && typeof window.dom ? window.dom : null;
        this.helpers = typeof window !== 'undefined' && typeof window.helpers ? window.helpers : null;
    }
    
    /**
     * Get DOM element (with caching)
     */
    getElement(id) {
        if (this.helpers) {
            return this.helpers.getElement(id);
        }
        if (this.dom) {
            return this.dom.get(id);
        }
        return document.getElementById(id);
    }
    
    /**
     * Render filtered formulas with accuracy metrics
     * Groups formulas by category and displays with confidence scores
     * 
     * @param {Array} scoredFormulas - Array of {formula, score, metrics} objects
     * @param {string} searchTerm - Current search term (empty string for all formulas)
     * @param {number} maxScore - Maximum score for normalization
     */
    renderFilteredFormulas(scoredFormulas, searchTerm, maxScore = 1) {
        const startTime = window.performance.now();
        const formulaList = this.getElement('formula-list');
        
        if (!formulaList) {
            console.error('❌ formula-list element not found!');
            return;
        }
        
        // PERFORMANCE: Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
            this.renderFilteredFormulasSync(scoredFormulas, searchTerm, maxScore, startTime);
        });
    }
    
    /**
     * Synchronous rendering of filtered formulas
     */
    renderFilteredFormulasSync(scoredFormulas, searchTerm, maxScore = 1, startTime = null) {
        if (startTime === null) startTime = window.performance.now();
        const formulaList = this.getElement('formula-list');
        
        if (!formulaList) return;
        
        // Force visibility
        if (typeof forceElementVisibility === 'function') {
            forceElementVisibility(formulaList, { display: 'block', forceReflow: true });
        }
        formulaList.style.height = 'auto';
        formulaList.innerHTML = '';
        
        // Ensure formula-selection screen is active
        const formulaSelection = this.getElement('formula-selection');
        if (formulaSelection && !formulaSelection.classList.contains('active')) {
            formulaSelection.classList.add('active');
        }
        const inputScreen = this.getElement('input-screen');
        if (inputScreen && inputScreen.classList.contains('active')) {
            inputScreen.classList.remove('active');
        }
        
        // Ensure the Formulas tab is active
        const mainFormulasTab = this.getElement('main-formulas-tab');
        if (mainFormulasTab && !mainFormulasTab.classList.contains('active')) {
            mainFormulasTab.classList.add('active');
        }
        
        // If we have search results, use Explorer-style two-panel layout
        if (searchTerm && scoredFormulas.length > 0) {
            this.renderSearchResultsExplorerStyle(scoredFormulas, searchTerm, maxScore);
            return;
        }
        
        // Add result count header
        if (searchTerm && scoredFormulas.length > 0) {
            const resultHeader = document.createElement('div');
            resultHeader.className = 'search-results-header';
            resultHeader.innerHTML = `Found <strong>${scoredFormulas.length}</strong> relevant formula${scoredFormulas.length !== 1 ? 's' : ''} matching "${escapeHtml(searchTerm)}" (sorted by relevance, highest score first)`;
            formulaList.appendChild(resultHeader);
        }
        
        if (scoredFormulas.length === 0) {
            const suggestions = typeof getSearchSuggestions === 'function' ? getSearchSuggestions(searchTerm) : [];
            let suggestionsHTML = '';
            if (suggestions.length > 0) {
                suggestionsHTML = `
                    <div class="search-suggestions">
                        <div class="search-suggestions-title">Try searching for:</div>
                        <div class="search-suggestions-list">
                            ${suggestions.map(s => `<span class="search-suggestion-item" data-suggestion="${escapeHtml(s)}">${escapeHtml(s)}</span>`).join('')}
                        </div>
                    </div>
                `;
            }
            
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results-container';
            noResultsDiv.innerHTML = `
                <p class="no-results-title">No formulas found</p>
                <p class="no-results-subtitle">Try searching for a different term</p>
                ${suggestionsHTML}
            `;
            formulaList.appendChild(noResultsDiv);
            return;
        }
        
        // Group by category
        const categorizedFormulas = {};
        const uncategorized = [];
        
        scoredFormulas.forEach(({ formula, score, metrics }) => {
            let found = false;
            if (typeof formulaCategories !== 'undefined') {
                for (const [category, ids] of Object.entries(formulaCategories)) {
                    if (ids.includes(formula.id)) {
                        if (!categorizedFormulas[category]) {
                            categorizedFormulas[category] = [];
                        }
                        categorizedFormulas[category].push({ formula, score, metrics, maxScore });
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                uncategorized.push({ formula, score, metrics, maxScore });
            }
        });
        
        // Sort by score
        Object.keys(categorizedFormulas).forEach(category => {
            categorizedFormulas[category].sort((a, b) => b.score - a.score);
        });
        uncategorized.sort((a, b) => b.score - a.score);
        
        // Render categorized formulas
        const categoryScores = {};
        Object.keys(categorizedFormulas).forEach(category => {
            const maxScoreInCategory = Math.max(...categorizedFormulas[category].map(f => f.score));
            categoryScores[category] = maxScoreInCategory;
        });
        
        const sortedCategories = Object.keys(categorizedFormulas).sort((a, b) => {
            const scoreA = categoryScores[a] || 0;
            const scoreB = categoryScores[b] || 0;
            return scoreB - scoreA;
        });
        
        sortedCategories.forEach(category => {
            if (categorizedFormulas[category] && categorizedFormulas[category].length > 0) {
                const categoryContainer = document.createElement('div');
                categoryContainer.className = 'formula-category';
                
                const header = document.createElement('div');
                header.className = 'formula-category-header';
                const maxScoreInCategory = categoryScores[category];
                header.innerHTML = `<h2>${escapeHtml(category)}</h2><span class="category-score">Top score: ${Math.round(maxScoreInCategory)}</span>`;
                categoryContainer.appendChild(header);
                
                const fragment = document.createDocumentFragment();
                categorizedFormulas[category].forEach(({ formula, score, metrics, maxScore }) => {
                    const card = typeof createFormulaCard === 'function' 
                        ? createFormulaCard(formula, score, metrics, maxScore)
                        : null;
                    if (card) {
                        if (typeof forceElementVisibility === 'function') {
                            forceElementVisibility(card);
                        }
                        fragment.appendChild(card);
                    }
                });
                
                if (fragment.children.length > 0) {
                    categoryContainer.appendChild(fragment);
                    if (typeof forceElementVisibility === 'function') {
                        forceElementVisibility(categoryContainer, { display: 'grid' });
                    }
                    formulaList.appendChild(categoryContainer);
                }
            }
        });
        
        // Render uncategorized
        if (uncategorized.length > 0) {
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'formula-category';
            
            const header = document.createElement('div');
            header.className = 'formula-category-header';
            header.innerHTML = `<h2>Other</h2>`;
            categoryContainer.appendChild(header);
            
            const fragment = document.createDocumentFragment();
            uncategorized.forEach(({ formula, score, metrics, maxScore }) => {
                const card = typeof createFormulaCard === 'function' 
                    ? createFormulaCard(formula, score, metrics, maxScore)
                    : null;
                if (card) {
                    fragment.appendChild(card);
                }
            });
            
            if (fragment.children.length > 0) {
                categoryContainer.appendChild(fragment);
                formulaList.appendChild(categoryContainer);
            }
        }
        
        // Final visibility check
        formulaList.offsetHeight; // Force reflow
        
        const renderTime = window.performance.now() - startTime;
        if (renderTime > 100) {
            console.warn(`[Performance] renderFilteredFormulas took ${renderTime.toFixed(2)}ms`);
        }
        
        // Re-setup event delegation
        if (searchTerm && typeof setupFormulaCardEventDelegation === 'function') {
            if (formulaList) {
                formulaList.dataset.delegationSetup = 'false';
            }
            setTimeout(() => {
                if (typeof setupFormulaCardEventDelegation === 'function') {
                    setupFormulaCardEventDelegation();
                }
            }, 0);
        }
        
        // Highlight search term
        if (searchTerm && typeof highlightSearchTerm === 'function') {
            requestAnimationFrame(() => highlightSearchTerm(searchTerm));
        }
    }
    
    /**
     * Render search results in Explorer-style two-panel layout
     */
    renderSearchResultsExplorerStyle(scoredFormulas, searchTerm, maxScore = 1) {
        const formulaList = this.getElement('formula-list');
        if (!formulaList) return;
        
        // Store formulas for access
        window.searchResultsData = { scoredFormulas, maxScore };
        
        // Create Explorer-style layout
        const layoutHTML = `
            <div class="search-results-explorer-layout" style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-top: 20px;">
                <div class="search-results-left-panel" style="background: rgba(10, 14, 39, 0.85); border-radius: 12px; padding: 20px; max-height: 600px; overflow-y: auto;">
                    <div class="search-results-header" style="margin-bottom: 15px;">
                        <h3 style="color: #667eea; margin: 0 0 5px 0;">Search Results</h3>
                        <p style="color: rgba(255, 255, 255, 0.7); margin: 0; font-size: 0.9em;">
                            Found <strong>${scoredFormulas.length}</strong> formula${scoredFormulas.length !== 1 ? 's' : ''} matching "${escapeHtml(searchTerm)}"
                        </p>
                    </div>
                    <div class="search-results-list">
                        ${scoredFormulas.map(({ formula, score, metrics }, index) => {
                            const confidenceResult = (typeof calculateConfidenceScore === 'function' && metrics && maxScore > 0) 
                                ? calculateConfidenceScore(score, maxScore, metrics, 1, 0, 0) 
                                : { confidence: Math.min(100, Math.round((score / maxScore) * 100)), breakdown: [] };
                            const confidenceScore = confidenceResult.confidence;
                            const confidenceLevel = (typeof getConfidenceLevel === 'function') 
                                ? getConfidenceLevel(confidenceScore) 
                                : { level: 'Medium', color: '#fde047' };
                            
                            return `
                                <div class="search-result-item" 
                                     data-formula-id="${formula.id}"
                                     style="padding: 12px; margin-bottom: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; cursor: pointer; border: 2px solid rgba(255, 255, 255, 0.1); transition: all 0.2s;"
                                     tabindex="0"
                                     role="button"
                                     aria-label="Select formula: ${escapeHtml(formula.name)}"
                                     onclick="if(typeof window.selectSearchResultFormula === 'function') { window.selectSearchResultFormula('${formula.id}'); }">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                        <div style="font-weight: 600; color: #a8c7ff; font-size: 0.95em;">${escapeHtml(formula.name)}</div>
                                        <div style="background: ${confidenceLevel.color}20; border: 1px solid ${confidenceLevel.color}; color: ${confidenceLevel.color}; padding: 2px 8px; border-radius: 4px; font-size: 0.75em; font-weight: 600;">
                                            ${confidenceScore}%
                                        </div>
                                    </div>
                                    <div style="font-family: 'Courier New', monospace; color: rgba(255, 255, 255, 0.7); font-size: 0.85em; margin-top: 4px;">
                                        ${escapeHtml(formula.equation)}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="search-results-right-panel" id="search-results-details" style="background: rgba(10, 14, 39, 0.85); border-radius: 12px; padding: 30px; min-height: 500px;">
                    <div style="text-align: center; color: rgba(255, 255, 255, 0.5); padding: 60px 20px;">
                        <div style="font-size: 3em; margin-bottom: 20px;">📚</div>
                        <p style="font-size: 1.1em;">Select a formula from the list to view details</p>
                    </div>
                </div>
            </div>
        `;
        
        formulaList.innerHTML = layoutHTML;
        
        // Make selectSearchResultFormula available globally
        window.selectSearchResultFormula = (formulaId) => {
            const data = window.searchResultsData;
            if (!data) return;
            
            const formulaData = data.scoredFormulas.find(f => f.formula.id === formulaId);
            if (!formulaData) return;
            
            this.renderSearchResultDetails(formulaData.formula, formulaData.score, formulaData.metrics, data.maxScore);
        };
    }
    
    /**
     * Render detailed formula information in the right panel
     */
    renderSearchResultDetails(formula, score, metrics, maxScore) {
        const detailsPanel = this.getElement('search-results-details');
        if (!detailsPanel) return;
        
        const topicRelevanceScore = formula.topicRelevanceScore || 0;
        const contextScore = formula.contextScore || 0;
        
        const confidenceResult = (typeof calculateConfidenceScore === 'function' && metrics && maxScore > 0) 
            ? calculateConfidenceScore(score, maxScore, metrics, 1, topicRelevanceScore, contextScore) 
            : { confidence: Math.min(100, Math.round((score / maxScore) * 100)), breakdown: [] };
        const confidenceScore = confidenceResult.confidence;
        const confidenceBreakdownData = confidenceResult.breakdown;
        const confidenceLevel = (typeof getConfidenceLevel === 'function') 
            ? getConfidenceLevel(confidenceScore) 
            : { level: 'Medium', color: '#fde047' };
        
        const detailsHTML = `
            <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <h2 style="color: #667eea; margin: 0; font-size: 2em;">${escapeHtml(formula.name)}</h2>
                    <button class="use-formula-btn" data-formula-id="${formula.id}" 
                            style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; white-space: nowrap;"
                            onclick="if(typeof selectFormula === 'function') { selectFormula('${formula.id}'); }">
                        Use This Formula →
                    </button>
                </div>
                <div style="margin-bottom: 15px;">
                    <div style="background: ${confidenceLevel.color}20; border: 1px solid ${confidenceLevel.color}; color: ${confidenceLevel.color}; padding: 8px 16px; border-radius: 6px; display: inline-block; font-weight: 600; margin-bottom: 10px;">
                        ${confidenceScore}% Match - ${confidenceLevel.level}
                    </div>
                </div>
            </div>
            <div style="margin-bottom: 25px;">
                <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; font-size: 1.05em;">
                    ${escapeHtml(formula.description || 'No description available.')}
                </p>
            </div>
            <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.9em; margin-bottom: 8px;">Equation:</div>
                <div style="font-family: 'Courier New', monospace; font-size: 1.3em; color: #60a5fa; word-break: break-all;">
                    ${escapeHtml(formula.equation)}
                </div>
            </div>
            ${formula.variables && formula.variables.length > 0 ? `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #667eea; margin: 0 0 12px 0; font-size: 1.2em;">Variables</h3>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${formula.variables.map(v => `
                            <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 15px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                    <div style="font-family: 'Courier New', monospace; font-size: 1.2em; color: #60a5fa; font-weight: 600;">
                                        ${escapeHtml(v.symbol)}
                                    </div>
                                    <div style="font-size: 0.85em; color: rgba(255, 255, 255, 0.6);">
                                        ${escapeHtml(v.unit || 'N/A')}
                                    </div>
                                </div>
                                <div style="font-weight: 600; color: #fff; margin-bottom: 4px; font-size: 0.95em;">
                                    ${escapeHtml(v.name || 'Unknown')}
                                </div>
                                <div style="font-size: 0.9em; color: rgba(255, 255, 255, 0.7); line-height: 1.5;">
                                    ${escapeHtml(v.description || 'No description available.')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        
        detailsPanel.innerHTML = detailsHTML;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.SearchResultsRenderer = SearchResultsRenderer;
    // Create singleton instance
    window.searchResultsRenderer = new SearchResultsRenderer();
}

