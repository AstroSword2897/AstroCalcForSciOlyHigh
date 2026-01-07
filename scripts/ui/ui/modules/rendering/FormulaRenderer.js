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
     * Now only processes INPUT variables (excludes result variable)
     */
    handleQuickCalculation(formulaId, container) {
        if (!formulaId || !window.FormulaCalculator) {
            console.warn('[FormulaRenderer] Quick calc skipped - missing formulaId or FormulaCalculator');
            return;
        }
        
        try {
            const formula = window.formulas?.find(f => f.id === formulaId);
            if (!formula) {
                console.warn('[FormulaRenderer] Formula not found:', formulaId);
                return;
            }
            
            // Collect input values (inputs no longer include result variable)
            const variableValues = {};
            const inputs = container.querySelectorAll(`.quick-calc-input[data-formula-id="${formulaId}"]`);
            let hasAllInputs = true;
            let inputCount = 0;
            
            inputs.forEach(input => {
                const symbol = input.getAttribute('data-variable-symbol');
                const rawValue = input.value.trim();
                inputCount++;
                
                // Handle scientific notation and regular numbers
                // Allow 0 as a valid value (e.g., initial conditions)
                if (rawValue === '') {
                    variableValues[symbol] = null;
                    hasAllInputs = false;
                } else {
                    const value = Number(rawValue);
                    if (!isNaN(value)) {
                        variableValues[symbol] = value;
                    } else {
                        variableValues[symbol] = null;
                        hasAllInputs = false;
                    }
                }
            });
            
            const resultEl = container.querySelector(`.quick-calc-result[data-formula-id="${formulaId}"]`);
            
            if (inputCount === 0 || !hasAllInputs) {
                // Need all inputs filled for calculation
                if (resultEl) {
                    const missingVars = Object.entries(variableValues)
                        .filter(([_, v]) => v === null)
                        .map(([k]) => k);
                    if (missingVars.length > 0) {
                        resultEl.textContent = `Enter: ${missingVars.join(', ')}`;
                    } else {
                        resultEl.textContent = 'Enter values to calculate';
                    }
                    resultEl.style.color = '#888';
                }
                return;
            }
            
            // Direct evaluation for quick calculation
            // Parse the equation and substitute values
            try {
                // Get the result variable and its unit
                const lhsMatch = formula.equation.match(/^\s*([a-zA-Z_][a-zA-Z0-9_/]*)/);
                const resultVariable = lhsMatch ? lhsMatch[1].trim() : null;
                const resultVarDef = formula.variables.find(v => v.symbol === resultVariable);
                const resultUnit = resultVarDef?.unit || '';
                
                // Get the right-hand side of the equation (after '=')
                const rhsMatch = formula.equation.match(/=\s*(.+)$/);
                if (!rhsMatch) {
                    throw new Error('Could not parse equation');
                }
                const rhs = rhsMatch[1].trim();
                
                // Build context with constants and variables
                const constants = {
                    G: 6.67430e-11,
                    c: 2.99792458e8,
                    h: 6.62607015e-34,
                    k: 1.380649e-23,
                    σ: 5.670374419e-8,  // Stefan-Boltzmann constant
                    π: Math.PI,
                    pi: Math.PI,
                    e: Math.E,
                    ...(formula.constants || {})
                };
                
                const context = { ...constants, ...variableValues };
                
                // Log values for debugging
                console.log('[FormulaRenderer] Quick calc inputs:', variableValues);
                console.log('[FormulaRenderer] Quick calc context:', context);
                console.log('[FormulaRenderer] RHS expression:', rhs);
                
                // Substitute values into expression
                let expression = rhs;
                
                // First, insert explicit multiplication between adjacent terms (e.g., "2GM" -> "2*G*M")
                // Insert * between: digit-letter, letter-digit, letter-letter (different symbols), )-letter, letter-(, )-digit
                expression = expression
                    .replace(/(\d)([a-zA-Z_])/g, '$1*$2')       // 2G -> 2*G
                    .replace(/([a-zA-Z_])(\d)/g, '$1*$2')       // G2 -> G*2
                    .replace(/([a-zA-Z_])([a-zA-Z_])/g, '$1*$2') // GM -> G*M (will need multiple passes)
                    .replace(/([a-zA-Z_])([a-zA-Z_])/g, '$1*$2') // Second pass for triplets like GMm
                    .replace(/\)([a-zA-Z_\d])/g, ')*$1')         // )G -> )*G
                    .replace(/([a-zA-Z_\d])\(/g, '$1*(');         // G( -> G*(
                
                console.log('[FormulaRenderer] After implicit mult:', expression);
                
                // Replace variables with their values (sort by symbol length desc to avoid partial matches)
                const sortedSymbols = Object.entries(context)
                    .filter(([_, v]) => v !== null && v !== undefined)
                    .sort((a, b) => b[0].length - a[0].length);
                    
                for (const [symbol, value] of sortedSymbols) {
                    // Escape special regex characters in symbol
                    const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    // Match symbol as standalone word (now that implicit mult is explicit)
                    const regex = new RegExp(`\\b${escapedSymbol}\\b`, 'g');
                    expression = expression.replace(regex, `(${value})`);
                }
                
                console.log('[FormulaRenderer] Substituted expression:', expression);
                
                // Convert math notation to JavaScript
                expression = expression
                    .replace(/√/g, 'Math.sqrt')
                    .replace(/\^/g, '**')
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/²/g, '**2')
                    .replace(/³/g, '**3')
                    .replace(/⁴/g, '**4');
                
                console.log('[FormulaRenderer] Final JS expression:', expression);
                
                // Safely evaluate the expression
                const evaluator = new Function('Math', `return ${expression}`);
                const numericResult = evaluator(Math);
                
                console.log('[FormulaRenderer] Numeric result:', numericResult);
                
                if (isFinite(numericResult)) {
                    const formattedValue = numericResult.toExponential(4);
                    resultEl.textContent = `${resultVariable || ''} = ${formattedValue}${resultUnit ? ' ' + resultUnit : ''}`;
                    resultEl.style.color = '#4ade80';
                } else {
                    resultEl.textContent = '⚠️ Check inputs';
                    resultEl.style.color = '#f87171';
                }
            } catch (evalError) {
                console.error('[FormulaRenderer] Quick calc eval error:', evalError);
                // Fall back to calculator.solve()
                try {
                    const calculator = new window.FormulaCalculator(formula);
                    const result = calculator.solve(variableValues);
                    
                    if (resultEl && result && result.result !== null && result.result !== undefined) {
                        const resultValue = result.result;
                        const formattedValue = typeof resultValue === 'number' 
                            ? resultValue.toExponential(4) 
                            : String(resultValue);
                        resultEl.textContent = `= ${formattedValue}${result.unit ? ' ' + result.unit : ''}`;
                        resultEl.style.color = '#4ade80';
                    }
                } catch (calcError) {
                    console.error('[FormulaRenderer] Fallback calc error:', calcError);
                    if (resultEl) {
                        resultEl.textContent = '⚠️ Calculation failed';
                        resultEl.style.color = '#f87171';
                    }
                }
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
            // Extract result variable from LHS of equation (e.g., "v_esc" from "v_esc = √(2GM/r)")
            const lhsMatch = formula.equation.match(/^\s*([a-zA-Z_][a-zA-Z0-9_/]*)/);
            const resultVariable = lhsMatch ? lhsMatch[1].trim() : null;
            
            // Filter out the result variable - user shouldn't input what we're solving for
            const inputVariables = formula.variables.filter(v => v.symbol !== resultVariable);
            
            // Only show quick calc if there are input variables (not just the result)
            if (inputVariables.length > 0) {
                html += `<div class="formula-card-quick-calc" style="margin-top: 12px; padding: 12px; background: rgba(102, 126, 234, 0.05); border-radius: 8px; border: 1px solid rgba(102, 126, 234, 0.2);">`;
                html += `<div style="font-size: 0.85em; color: #a8c7ff; margin-bottom: 8px; font-weight: 600;">⚡ Quick Calculate → ${resultVariable || 'Result'}:</div>`;
                html += `<div class="quick-calc-inputs" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px;">`;
                
                inputVariables.slice(0, 4).forEach((variable, idx) => {
                    const inputId = `quick-calc-${formula.id}-${variable.symbol}`;
                    html += `
                        <div style="display: flex; flex-direction: column;">
                            <label for="${inputId}" style="font-size: 0.75em; color: #888; margin-bottom: 4px;">${this.escapeHtml(variable.symbol)}</label>
                            <input 
                                type="number" 
                                id="${inputId}"
                                data-formula-id="${formula.id}"
                                data-variable-symbol="${this.escapeHtml(variable.symbol)}"
                                data-result-variable="${resultVariable || ''}"
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
                html += `<button class="quick-calc-btn" data-formula-id="${formula.id}" data-result-variable="${resultVariable || ''}" style="flex: 1; padding: 6px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 6px; color: white; font-weight: 600; cursor: pointer; font-size: 0.85em;">Calculate → ${resultVariable || 'Result'}</button>`;
                html += `<div class="quick-calc-result" data-formula-id="${formula.id}" style="flex: 1; padding: 6px; background: rgba(102, 126, 234, 0.1); border-radius: 6px; font-size: 0.85em; color: #a8c7ff; text-align: center; min-height: 28px; display: flex; align-items: center; justify-content: center;"></div>`;
                html += `</div>`;
                html += `</div>`;
            }
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
        
        // Add matched topics as chips (NEW v2.1.0)
        if (searchData?.metrics && this.renderOptions?.showConfidence) {
            const matchedTopics = new Set();
            const matchedVariables = new Set();
            
            // Collect matched topics from concepts
            if (searchData.metrics.matchedConcepts && searchData.metrics.matchedConcepts.length > 0) {
                searchData.metrics.matchedConcepts.slice(0, 5).forEach(c => matchedTopics.add(c));
            } else if (searchData.metrics.conceptMatch && formula.concepts) {
                // Fallback: use formula concepts
                formula.concepts.slice(0, 3).forEach(c => matchedTopics.add(c));
            }
            
            // Collect matched variables
            if (searchData.metrics.matchedVariables && searchData.metrics.matchedVariables.length > 0) {
                searchData.metrics.matchedVariables.slice(0, 4).forEach(v => matchedVariables.add(v));
            } else if (searchData.metrics.variableMatch && formula.variables) {
                // Fallback: use first few variables
                formula.variables.slice(0, 3).forEach(v => matchedVariables.add(v.symbol));
            }
            
            // Display topic chips
            if (matchedTopics.size > 0 || matchedVariables.size > 0) {
                html += `
                    <div class="formula-card-chips" style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
                        <span style="font-size: 0.75em; color: #888; font-weight: 600;">MATCHED:</span>
                `;
                
                // Topic chips (concepts)
                matchedTopics.forEach(topic => {
                    html += `
                        <span class="topic-chip" style="padding: 4px 10px; background: rgba(102, 126, 234, 0.15); border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 12px; font-size: 0.75em; color: #a8c7ff; font-weight: 500;">
                            🏷️ ${this.escapeHtml(topic)}
                        </span>
                    `;
                });
                
                // Variable chips
                matchedVariables.forEach(variable => {
                    html += `
                        <span class="variable-chip" style="padding: 4px 10px; background: rgba(74, 222, 128, 0.15); border: 1px solid rgba(74, 222, 128, 0.3); border-radius: 12px; font-size: 0.75em; color: #4ade80; font-family: 'Courier New', monospace; font-weight: 600;">
                            ${this.escapeHtml(variable)}
                        </span>
                    `;
                });
                
                html += `</div>`;
            }
        }
        
        // Add confidence breakdown (NEW v2.1.0)
        if (searchData?.metrics?.componentScores && this.renderOptions?.showConfidence) {
            const scores = searchData.metrics.componentScores;
            const hasScores = Object.values(scores).some(s => s > 0);
            
            if (hasScores) {
                html += `
                    <details class="formula-card-breakdown" style="margin-top: 10px; padding: 10px; background: rgba(255, 255, 255, 0.02); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.05);">
                        <summary style="cursor: pointer; font-size: 0.85em; color: #a8c7ff; font-weight: 600; user-select: none;">
                            📊 Score Breakdown
                        </summary>
                        <div class="breakdown-content" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                `;
                
                const scoreComponents = [
                    { key: 'name', label: 'Name Match', color: '#60a5fa', icon: '📛' },
                    { key: 'concepts', label: 'Concept Match', color: '#a78bfa', icon: '🧠' },
                    { key: 'variables', label: 'Variable Match', color: '#4ade80', icon: '🔢' },
                    { key: 'description', label: 'Description Match', color: '#fbbf24', icon: '📝' },
                    { key: 'category', label: 'Category Match', color: '#fb923c', icon: '📁' }
                ];
                
                const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);
                
                scoreComponents.forEach(({ key, label, color, icon }) => {
                    const score = scores[key] || 0;
                    if (score > 0) {
                        const percentage = totalScore > 0 ? ((score / totalScore) * 100).toFixed(1) : 0;
                        html += `
                            <div class="breakdown-item" style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03);">
                                <span style="font-size: 0.8em; color: #cbd5e1;">
                                    ${icon} ${label}
                                </span>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="width: 80px; height: 6px; background: rgba(255, 255, 255, 0.05); border-radius: 3px; overflow: hidden;">
                                        <div style="width: ${percentage}%; height: 100%; background: ${color}; border-radius: 3px;"></div>
                                    </div>
                                    <span style="font-size: 0.75em; color: ${color}; font-weight: 600; min-width: 60px; text-align: right;">
                                        ${score.toFixed(0)} pts (${percentage}%)
                                    </span>
                                </div>
                            </div>
                        `;
                    }
                });
                
                html += `
                            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: right;">
                                <span style="font-size: 0.85em; color: #a8c7ff; font-weight: 600;">
                                    Total: ${totalScore.toFixed(0)} pts
                                </span>
                            </div>
                        </div>
                    </details>
                `;
            }
        }
        
        // Add match reasons (legacy, kept for compatibility)
        if (searchData?.metrics && this.renderOptions?.showConfidence) {
            const matchReasons = [];
            if (searchData.metrics.nameMatch) matchReasons.push('Name');
            if (searchData.metrics.conceptMatch) matchReasons.push('Concept');
            if (searchData.metrics.variableMatch) matchReasons.push('Variable');
            if (searchData.metrics.descriptionMatch) matchReasons.push('Description');
            if (searchData.metrics.semanticMatch) matchReasons.push('Semantic');
            
            if (matchReasons.length > 0) {
                html += `
                    <div class="formula-card-match-reasons" style="margin-top: 6px; font-size: 0.75em; color: #64748b;">
                        ✓ Matched: ${matchReasons.join(' • ')}
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
