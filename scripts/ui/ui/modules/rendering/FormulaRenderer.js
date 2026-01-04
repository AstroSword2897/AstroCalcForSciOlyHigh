/**
 * FormulaRenderer - Handles rendering of formula cards
 * OPTIMIZED: Uses DocumentFragment, event delegation, CSS classes, and batched updates
 */
export class FormulaRenderer {
    constructor(options) {
        this.onFormulaClick = options.onFormulaClick;
        this.container = null;
        this.delegatedHandler = null;
        this.renderScheduled = false;
        this.pendingFormulas = null;
        
        // LRU cache for card HTML (avoid re-creating)
        this.cardCache = new Map();
        this.MAX_CACHE_SIZE = 300;
        
        // Cache invalidation hooks
        this.invalidationCallbacks = [];
    }

    /**
     * Render formula cards using DocumentFragment for batched DOM updates
     * @param {Array} formulas - Array of formulas OR search results with formula, score, metrics, etc.
     * @param {Container} container - DOM container element
     * @param {Object} options - Rendering options { showConfidence, showTopicScope, maxScore }
     */
    renderFormulaCards(formulas, container, options = {}) {
        if (!container) {
            console.error('[FormulaRenderer] No container found');
            return;
        }

        // Store container reference
        this.container = container;
        
        // Setup event delegation once (not per card)
        this.setupEventDelegation(container);
        
        // Store rendering options
        this.renderOptions = {
            showConfidence: options.showConfidence !== false,
            showTopicScope: options.showTopicScope !== false,
            maxScore: options.maxScore || 1,
            searchQuery: options.searchQuery || null
        };
        
        // Use requestAnimationFrame for smooth rendering
        if (this.renderScheduled) {
            this.pendingFormulas = formulas;
            return;
        }
        
        this.renderScheduled = true;
        this.pendingFormulas = formulas;
        
        requestAnimationFrame(() => {
            this.performRender(this.pendingFormulas, container);
            this.renderScheduled = false;
            this.pendingFormulas = null;
        });
    }
    
    /**
     * Perform the actual render using DocumentFragment
     */
    performRender(formulas, container) {
        // Use DocumentFragment for batched DOM updates (single reflow)
        const fragment = document.createDocumentFragment();
        
        // Create all cards
        formulas.forEach((item, index) => {
            // Handle both plain formulas and search results
            const formula = item.formula || item;
            const searchData = item.formula ? item : null; // If item has .formula, it's a search result
            const card = this.createFormulaCard(formula, index, searchData);
            fragment.appendChild(card);
        });
        
        // Single DOM update
        container.innerHTML = '';
        container.appendChild(fragment);
    }

    /**
     * Setup event delegation for click/hover (single listener for all cards)
     */
    setupEventDelegation(container) {
        // Remove old handler if exists
        if (this.delegatedHandler) {
            container.removeEventListener('click', this.delegatedHandler);
            container.removeEventListener('input', this.inputHandler);
        }
        
        // Handle quick calculate button clicks
        this.delegatedHandler = (e) => {
            // Handle quick calculate button clicks
            const quickCalcBtn = e.target.closest('.quick-calc-btn');
            if (quickCalcBtn) {
                e.preventDefault();
                e.stopPropagation();
                const formulaId = quickCalcBtn.getAttribute('data-formula-id');
                this.handleQuickCalculation(formulaId, container);
                return;
            }
            
            const card = e.target.closest('.formula-card');
            if (!card) return;
            
            const formulaId = card.getAttribute('data-formula-id');
            if (!formulaId) return;
            
            // Don't trigger if clicking on interactive elements
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('input, button')) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            // Find formula by ID
            const formula = window.formulas?.find(f => f.id === formulaId);
            if (!formula) return;
            
            // Call handler
            if (this.onFormulaClick) {
                this.onFormulaClick(formula);
            } else if (typeof window.selectFormula === 'function') {
                window.selectFormula(formula);
            }
        };
        
        // Handle input changes for quick calculation (debounced)
        this.inputHandler = (e) => {
            if (e.target.classList.contains('quick-calc-input')) {
                clearTimeout(this.quickCalcTimeout);
                this.quickCalcTimeout = setTimeout(() => {
                    const formulaId = e.target.getAttribute('data-formula-id');
                    this.handleQuickCalculation(formulaId, container);
                }, 500);
            }
        };
        
        container.addEventListener('click', this.delegatedHandler);
        container.addEventListener('input', this.inputHandler);
    }
    
    /**
     * Handle quick calculation on formula card
     */
    handleQuickCalculation(formulaId, container) {
        if (!formulaId || !window.FormulaCalculator) {
            return;
        }
        
        try {
            const formula = window.formulas?.find(f => f.id === formulaId);
            if (!formula) {
                return;
            }
            
            // Collect input values
            const variableValues = {};
            const inputs = container.querySelectorAll(`.quick-calc-input[data-formula-id="${formulaId}"]`);
            let hasAnyValue = false;
            
            inputs.forEach(input => {
                const symbol = input.getAttribute('data-variable-symbol');
                const value = parseFloat(input.value);
                if (!isNaN(value) && value !== 0) {
                    variableValues[symbol] = value;
                    hasAnyValue = true;
                } else {
                    variableValues[symbol] = null;
                }
            });
            
            if (!hasAnyValue) {
                // Show symbolic result
                const resultEl = container.querySelector(`.quick-calc-result[data-formula-id="${formulaId}"]`);
                if (resultEl) {
                    resultEl.textContent = 'Enter values to calculate';
                    resultEl.style.color = '#888';
                }
                return;
            }
            
            // Create calculator and solve
            const calculator = new window.FormulaCalculator(formula);
            const result = calculator.solve(variableValues);
            
            // Display result
            const resultEl = container.querySelector(`.quick-calc-result[data-formula-id="${formulaId}"]`);
            if (resultEl && result && result.result !== null && result.result !== undefined) {
                const resultValue = result.result;
                const formattedValue = typeof resultValue === 'number' 
                    ? resultValue.toExponential(3) 
                    : String(resultValue);
                resultEl.textContent = `= ${formattedValue}${result.unit ? ' ' + result.unit : ''}`;
                resultEl.style.color = '#4ade80';
            } else if (resultEl) {
                resultEl.textContent = '⚠️ Check inputs';
                resultEl.style.color = '#f87171';
            }
        } catch (error) {
            console.error('[FormulaRenderer] Quick calculation error:', error);
            const resultEl = container.querySelector(`.quick-calc-result[data-formula-id="${formulaId}"]`);
            if (resultEl) {
                resultEl.textContent = '⚠️ Error';
                resultEl.style.color = '#f87171';
            }
        }
    }

    /**
     * Create formula card element with confidence scores and topic scope
     * @param {Object} formula - Formula object
     * @param {Number} index - Card index
     * @param {Object} searchData - Search result data { score, metrics, topicRelevanceScore, contextScore, normalizedScore }
     */
    createFormulaCard(formula, index, searchData = null) {
        const card = document.createElement('div');
        card.className = 'formula-card';
        card.setAttribute('data-formula-id', formula.id);
        card.setAttribute('data-testid', `formula-card-${index}`);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${formula.name}: ${formula.description?.substring(0, 100) || 'Click to use this formula'}`);
        
        // Calculate confidence if search data available
        let confidenceData = null;
        if (searchData && this.renderOptions?.showConfidence) {
            confidenceData = this.calculateConfidenceForCard(searchData);
        }
        
        // Get topic scope information
        const topicScope = this.getTopicScope(formula, searchData);
        
        // Generate card HTML with details
        const html = this.generateCardHTML(formula, confidenceData, topicScope, searchData);
        
        card.innerHTML = html;
        return card;
    }
    
    /**
     * Calculate confidence score for a card
     */
    calculateConfidenceForCard(searchData) {
        if (!searchData) {
            return null;
        }
        
        // Try to use global confidence function if available
        if (typeof window.calculateConfidenceScore === 'function') {
            try {
                const maxScore = this.renderOptions?.maxScore || searchData.normalizedScore || 1;
                const literalScore = searchData.score || searchData.normalizedScore || 0;
                const metrics = searchData.metrics || {};
                const topicScore = searchData.topicRelevanceScore || 0;
                const contextScore = searchData.contextScore || 0;
                
                return window.calculateConfidenceScore(
                    literalScore,
                    maxScore,
                    metrics,
                    1.0, // historyFactor
                    topicScore,
                    contextScore
                );
            } catch (e) {
                console.warn('[FormulaRenderer] Confidence calculation failed:', e);
            }
        }
        
        // Fallback: Simple confidence calculation based on normalized score
        const normalizedScore = searchData.normalizedScore || 0;
        const metrics = searchData.metrics || {};
        
        // Base confidence from normalized score (0-1000 -> 0-100)
        let confidence = Math.round(normalizedScore / 10);
        
        // Boost for strong matches
        if (metrics.nameMatch) confidence += 20;
        if (metrics.conceptMatch) confidence += 15;
        if (metrics.variableMatch) confidence += 10;
        if (metrics.descriptionMatch) confidence += 5;
        
        // Clamp to 0-100
        confidence = Math.min(100, Math.max(0, confidence));
        
        return {
            confidence: confidence,
            breakdown: [
                {
                    label: 'Base Score',
                    value: Math.round(normalizedScore / 10),
                    description: `Normalized score: ${normalizedScore.toFixed(0)}`
                }
            ]
        };
    }
    
    /**
     * Get topic scope information for a formula
     */
    getTopicScope(formula, searchData) {
        const scope = {
            concepts: formula.concepts || [],
            category: null,
            topicScore: searchData?.topicRelevanceScore || 0,
            contextScore: searchData?.contextScore || 0,
            matchedConcepts: searchData?.metrics?.matchedConcepts || []
        };
        
        // Try to find category
        if (window.formulaCategories && formula.id) {
            for (const [category, ids] of Object.entries(window.formulaCategories)) {
                if (ids.includes(formula.id)) {
                    scope.category = category;
                    break;
                }
            }
        }
        
        return scope;
    }
    
    /**
     * Generate card HTML with confidence and topic details
     */
    generateCardHTML(formula, confidenceData, topicScope, searchData) {
        let html = `
            <h3 class="formula-card-title">${this.escapeHtml(formula.name)}</h3>
            <div class="formula-card-equation">${this.escapeHtml(formula.equation)}</div>
            <p class="formula-card-description">${this.escapeHtml(formula.description || 'Click to use this formula')}</p>
        `;
        
        // Add inline calculation inputs for quick calculations
        if (formula.variables && formula.variables.length > 0 && formula.variables.length <= 4) {
            html += `<div class="formula-card-quick-calc" style="margin-top: 12px; padding: 12px; background: rgba(102, 126, 234, 0.05); border-radius: 8px; border: 1px solid rgba(102, 126, 234, 0.2);">`;
            html += `<div style="font-size: 0.85em; color: #a8c7ff; margin-bottom: 8px; font-weight: 600;">⚡ Quick Calculate:</div>`;
            html += `<div class="quick-calc-inputs" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px;">`;
            
            formula.variables.slice(0, 4).forEach((variable, idx) => {
                const inputId = `quick-calc-${formula.id}-${variable.symbol}`;
                html += `
                    <div style="display: flex; flex-direction: column;">
                        <label for="${inputId}" style="font-size: 0.75em; color: #888; margin-bottom: 4px;">${this.escapeHtml(variable.symbol)}</label>
                        <input 
                            type="number" 
                            id="${inputId}"
                            data-formula-id="${formula.id}"
                            data-variable-symbol="${this.escapeHtml(variable.symbol)}"
                            class="quick-calc-input"
                            placeholder="0"
                            step="any"
                            style="padding: 6px; border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 4px; background: rgba(15, 23, 42, 0.5); color: white; font-size: 0.9em;"
                        >
                    </div>
                `;
            });
            
            html += `</div>`;
            html += `<div style="margin-top: 8px; display: flex; gap: 8px; align-items: center;">`;
            html += `<button class="quick-calc-btn" data-formula-id="${formula.id}" style="flex: 1; padding: 6px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 6px; color: white; font-weight: 600; cursor: pointer; font-size: 0.85em;">Calculate</button>`;
            html += `<div class="quick-calc-result" data-formula-id="${formula.id}" style="flex: 1; padding: 6px; background: rgba(102, 126, 234, 0.1); border-radius: 6px; font-size: 0.85em; color: #a8c7ff; text-align: center; min-height: 28px; display: flex; align-items: center; justify-content: center;"></div>`;
            html += `</div>`;
            html += `</div>`;
        }
        
        // Add confidence score if available
        if (confidenceData && this.renderOptions?.showConfidence) {
            const confidence = confidenceData.confidence || 0;
            const confidenceLevel = this.getConfidenceLevel(confidence);
            html += `
                <div class="formula-card-confidence" style="margin-top: 12px; padding: 8px; background: rgba(102, 126, 234, 0.1); border-radius: 6px; border-left: 3px solid ${confidenceLevel.color};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 600; color: ${confidenceLevel.color};">
                            ${confidenceLevel.icon} ${confidence}% Match
                        </span>
                        <span style="font-size: 0.85em; color: #a8c7ff;">
                            ${confidenceLevel.level}
                        </span>
                    </div>
                </div>
        `;
        }
        
        // Add topic scope if available
        if (topicScope && this.renderOptions?.showTopicScope) {
            const scopeParts = [];
            
            if (topicScope.category) {
                scopeParts.push(`📁 ${topicScope.category}`);
            }
            
            if (topicScope.concepts.length > 0) {
                const displayConcepts = topicScope.matchedConcepts.length > 0 
                    ? topicScope.matchedConcepts.slice(0, 3)
                    : topicScope.concepts.slice(0, 3);
                scopeParts.push(`🔑 ${displayConcepts.join(', ')}`);
            }
            
            if (topicScope.topicScore > 0) {
                scopeParts.push(`📊 Topic: ${topicScope.topicScore.toFixed(1)}`);
            }
            
            if (topicScope.contextScore > 0) {
                scopeParts.push(`🎯 Context: ${topicScope.contextScore.toFixed(1)}`);
            }
            
            if (scopeParts.length > 0) {
                html += `
                    <div class="formula-card-topic-scope" style="margin-top: 8px; padding: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; font-size: 0.85em; color: #a8c7ff;">
                        ${scopeParts.join(' • ')}
                    </div>
                `;
            }
        }
        
        // Add match details if search data available
        if (searchData?.metrics && this.renderOptions?.showConfidence) {
            const matchReasons = [];
            if (searchData.metrics.nameMatch) matchReasons.push('Name match');
            if (searchData.metrics.conceptMatch) matchReasons.push('Concept match');
            if (searchData.metrics.variableMatch) matchReasons.push('Variable match');
            if (searchData.metrics.descriptionMatch) matchReasons.push('Description match');
            if (searchData.metrics.semanticMatch) matchReasons.push('Semantic match');
            
            if (matchReasons.length > 0) {
                html += `
                    <div class="formula-card-match-reasons" style="margin-top: 6px; font-size: 0.8em; color: #888;">
                        Matched: ${matchReasons.join(', ')}
                    </div>
                `;
            }
        }
        
        return html;
    }
    
    /**
     * Get confidence level descriptor
     */
    getConfidenceLevel(confidence) {
        if (confidence >= 85) {
            return { level: 'Very High', color: '#10b981', icon: '🟢' };
        } else if (confidence >= 70) {
            return { level: 'High', color: '#3b82f6', icon: '🔵' };
        } else if (confidence >= 50) {
            return { level: 'Medium', color: '#f59e0b', icon: '🟡' };
        } else if (confidence >= 30) {
            return { level: 'Low', color: '#ef4444', icon: '🟠' };
            } else {
            return { level: 'Very Low', color: '#6b7280', icon: '⚪' };
        }
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
            }

    /**
     * Filter formulas (optimized with early exit)
     */
    filterFormulas(formulas, query) {
        if (!query?.trim()) return formulas;
        
        const queryLower = query.toLowerCase();
        const words = queryLower.split(/\s+/).filter(w => w.length > 0);
        
        return formulas.filter(formula => {
            const nameLower = formula.name.toLowerCase();
            // Fast path: exact name match
            if (nameLower.includes(queryLower)) return true;
            
            // Word match in name
            if (words.some(w => nameLower.includes(w))) return true;
            
            // Description match (only check if needed)
            const descLower = formula.description?.toLowerCase() || '';
            if (descLower.includes(queryLower)) return true;
            
            return false;
        });
    }
    
    /**
     * Invalidate cache (for theme changes, locale changes, formula updates)
     */
    invalidateCache(reason = 'unknown') {
        const previousSize = this.cardCache.size;
        this.cardCache.clear();
        console.log(`[FormulaRenderer] Cache invalidated (${previousSize} items) - reason: ${reason}`);
        
        // Notify callbacks
        this.invalidationCallbacks.forEach(callback => {
            try {
                callback(reason, previousSize);
            } catch (e) {
                console.error('[FormulaRenderer] Cache invalidation callback error:', e);
            }
        });
    }
    
    /**
     * Register callback for cache invalidation events
     */
    onCacheInvalidation(callback) {
        if (typeof callback === 'function') {
            this.invalidationCallbacks.push(callback);
        }
    }
    
    /**
     * Cleanup resources
     */
    destroy() {
        if (this.container && this.delegatedHandler) {
            this.container.removeEventListener('click', this.delegatedHandler);
        }
        this.cardCache.clear();
        this.invalidationCallbacks = [];
        this.container = null;
        this.delegatedHandler = null;
    }
}
