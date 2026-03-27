/**
 * FormulaRenderer - Handles rendering of formula cards
 * OPTIMIZED: Uses DocumentFragment, event delegation, CSS classes, and batched updates
 */
export class FormulaRenderer {
    constructor(options = {}) {
        // Injected dependencies (no globals)
        this.onFormulaClick = options.onFormulaClick;
        this.formulas = options.formulas || (() => window.formulas || []);
        this.FormulaCalculator = options.FormulaCalculator || (() => window.FormulaCalculator);
        this.calculateConfidenceScore = options.calculateConfidenceScore || (() => window.calculateConfidenceScore);
        this.formulaCategories = options.formulaCategories || (() => window.formulaCategories);
        this.selectFormula = options.selectFormula || (() => window.selectFormula);
        
        this.container = null;
        this.delegatedHandler = null;
        this.renderScheduled = false;
        this.pendingFormulas = null;
        
        // Performance: Prevent duplicate renders
        this._lastRenderHash = null;
        this._isRendering = false;
        
        // Per-card quick calc timers (fixes shared timeout issue)
        this.quickCalcTimeouts = new Map(); // formulaId -> timeout
        
        // Formula index for O(1) lookup (instead of linear search)
        this._formulaIndex = new Map(); // id -> formula
        this._rebuildFormulaIndex();
        
        // Performance metrics
        this.metrics = {
            renderTime: 0,
            quickCalcTime: 0,
            confidenceCalcTime: 0
        };
    }
    
    /**
     * Rebuild formula index for O(1) lookup
     */
    _rebuildFormulaIndex() {
        this._formulaIndex.clear();
        const formulas = typeof this.formulas === 'function' ? this.formulas() : this.formulas;
        if (Array.isArray(formulas)) {
            formulas.forEach(formula => {
                if (formula.id) {
                    this._formulaIndex.set(formula.id, formula);
                }
            });
        }
    }
    
    /**
     * Get formula by ID (O(1) lookup)
     */
    _getFormulaById(formulaId) {
        // Rebuild index if empty (formulas might have changed)
        if (this._formulaIndex.size === 0) {
            this._rebuildFormulaIndex();
        }
        return this._formulaIndex.get(formulaId);
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

        // Prevent duplicate renders: check if already rendering same content
        const renderHash = this._createRenderHash(formulas, options);
        if (this._isRendering && renderHash === this._lastRenderHash) {
            console.log('[FormulaRenderer] ⏭️ Skipping duplicate render');
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
        this._lastRenderHash = renderHash;
        this._isRendering = true;
        
        requestAnimationFrame(() => {
            this.performRender(this.pendingFormulas, container);
            this.renderScheduled = false;
            this.pendingFormulas = null;
            this._isRendering = false;
        });
    }
    
    /**
     * Create hash of render parameters to detect duplicates
     * O(n) where n = number of formulas
     */
    _createRenderHash(formulas, options) {
        const formulaIds = formulas.map(f => (f.formula || f).id || (f.formula || f).name).join(',');
        const optionsStr = JSON.stringify({
            showConfidence: options.showConfidence,
            showTopicScope: options.showTopicScope,
            maxScore: options.maxScore
        });
        return `${formulaIds}|${optionsStr}`;
    }
    
    /**
     * Perform the actual render using DocumentFragment with chunked rendering for better performance
     */
    performRender(formulas, container) {
        const startTime = performance.now();
        const CHUNK_SIZE = 50; // Render 50 cards at a time for better responsiveness

        const exclude = typeof window !== 'undefined' && window.EXCLUDED_FORMULA_CARD_IDS;
        const searchActive = this.renderOptions && String(this.renderOptions.searchQuery || '').trim().length > 0;
        let list = formulas;
        if (exclude && exclude.size && !searchActive) {
            list = formulas.filter(item => {
                const f = item.formula || item;
                return f && f.id && !exclude.has(f.id);
            });
        }
        
        // Clear container first
        container.innerHTML = '';
        
        // If we have many formulas, use chunked rendering
        if (list.length > CHUNK_SIZE) {
            this.performChunkedRender(list, container, CHUNK_SIZE);
        } else {
            // For smaller lists, render all at once
            const fragment = document.createDocumentFragment();
            
            list.forEach((item, index) => {
                const formula = item.formula || item;
                const searchData = item.formula ? item : null;
                const card = this.createFormulaCard(formula, index, searchData);
                fragment.appendChild(card);
            });
            
            container.appendChild(fragment);
        }
        
        const renderTime = performance.now() - startTime;
        console.log(`[FormulaRenderer] Rendered ${list.length} cards in ${renderTime.toFixed(2)}ms`);
    }
    
    /**
     * Chunked rendering for large formula lists - renders in batches to keep UI responsive
     */
    performChunkedRender(formulas, container, chunkSize) {
        let currentIndex = 0;
        
        const renderChunk = () => {
            const endIndex = Math.min(currentIndex + chunkSize, formulas.length);
            const fragment = document.createDocumentFragment();
            
            for (let i = currentIndex; i < endIndex; i++) {
                const item = formulas[i];
                const formula = item.formula || item;
                const searchData = item.formula ? item : null;
                const card = this.createFormulaCard(formula, i, searchData);
                fragment.appendChild(card);
            }
            
            container.appendChild(fragment);
            currentIndex = endIndex;
            
            // Continue with next chunk if there are more formulas
            if (currentIndex < formulas.length) {
                // Use requestIdleCallback if available, otherwise setTimeout
                if (window.requestIdleCallback) {
                    requestIdleCallback(renderChunk, { timeout: 100 });
                } else {
                    setTimeout(renderChunk, 0);
                }
            }
        };
        
        // Start rendering first chunk
        renderChunk();
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
            
            // Prefer original global selection flow for maximum compatibility.
            if (typeof window.selectFormula === 'function') {
                window.selectFormula(formula);
            } else if (this.onFormulaClick) {
                this.onFormulaClick(formula);
            }
        };
        
        // Handle input changes for quick calculation (debounced per-card)
        this.inputHandler = (e) => {
            if (e.target.classList.contains('quick-calc-input')) {
                const formulaId = e.target.getAttribute('data-formula-id');
                if (!formulaId) return;
                
                // Clear existing timeout for this specific formula
                const existingTimeout = this.quickCalcTimeouts.get(formulaId);
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                }
                
                // Set new timeout per formula
                const timeout = setTimeout(() => {
                    this.handleQuickCalculation(formulaId, container);
                    this.quickCalcTimeouts.delete(formulaId);
                }, 500);
                
                this.quickCalcTimeouts.set(formulaId, timeout);
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
        const startTime = performance.now();
        const FormulaCalc = typeof this.FormulaCalculator === 'function' ? this.FormulaCalculator() : this.FormulaCalculator;
        if (!formulaId || !FormulaCalc) {
            console.warn('[FormulaRenderer] Quick calc skipped - missing formulaId or FormulaCalculator');
            return;
        }
        
        try {
            // Use O(1) lookup instead of linear search
            const formula = this._getFormulaById(formulaId);
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
            
            // Delegate to FormulaCalculator (security: no inline expression evaluation)
            // This ensures proper validation, unit handling, and error propagation
            try {
                const calculator = new window.FormulaCalculator(formula);
                const result = calculator.solve(variableValues);
                
                if (resultEl && result && result.result !== null && result.result !== undefined) {
                    const resultValue = result.result;
                    let formattedValue;
                    
                    if (typeof resultValue === 'number') {
                        // Format based on magnitude
                        if (Math.abs(resultValue) >= 1e6 || (Math.abs(resultValue) < 1e-3 && resultValue !== 0)) {
                            formattedValue = resultValue.toExponential(4);
                        } else {
                            formattedValue = resultValue.toFixed(6).replace(/\.?0+$/, '');
                        }
                    } else {
                        formattedValue = String(resultValue);
                    }
                    
                    const resultVariable = result.variable || result.solvedFor || '';
                    const unit = result.unit || '';
                    resultEl.textContent = `${resultVariable ? resultVariable + ' = ' : ''}${formattedValue}${unit ? ' ' + unit : ''}`;
                    resultEl.style.color = '#4ade80';
                } else if (resultEl) {
                    resultEl.textContent = '⚠️ No result';
                    resultEl.style.color = '#f87171';
                }
            } catch (calcError) {
                console.error('[FormulaRenderer] Quick calc error:', calcError);
                if (resultEl) {
                    resultEl.textContent = '⚠️ Calculation failed';
                    resultEl.style.color = '#f87171';
                }
            }
            
            // Track performance
            this.metrics.quickCalcTime += performance.now() - startTime;
        } catch (error) {
            console.error('[FormulaRenderer] Quick calculation error:', error);
            const resultEl = container.querySelector(`.quick-calc-result[data-formula-id="${formulaId}"]`);
            if (resultEl) {
                resultEl.textContent = '⚠️ Error';
                resultEl.style.color = '#f87171';
            }
            this.metrics.quickCalcTime += performance.now() - startTime;
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
     * Calculate confidence score for a card (with performance tracking)
     */
    calculateConfidenceForCard(searchData) {
        if (!searchData) {
            return null;
        }
        
        const startTime = performance.now();
        let result;
        
        // Try to use global confidence function if available
        if (typeof window.calculateConfidenceScore === 'function') {
            try {
                const maxScore = this.renderOptions?.maxScore || searchData.normalizedScore || 1;
                const literalScore = searchData.score || searchData.normalizedScore || 0;
                const metrics = searchData.metrics || {};
                const topicScore = searchData.topicRelevanceScore || 0;
                const contextScore = searchData.contextScore || 0;
                
                result = window.calculateConfidenceScore(
                    literalScore,
                    maxScore,
                    metrics,
                    1.0, // historyFactor
                    topicScore,
                    contextScore
                );
                this.metrics.confidenceCalcTime += performance.now() - startTime;
                return result;
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
        
        result = {
            confidence: confidence,
            breakdown: [
                {
                    label: 'Base Score',
                    value: Math.round(normalizedScore / 10),
                    description: `Normalized score: ${normalizedScore.toFixed(0)}`
                }
            ]
        };
        
        // Track performance
        this.metrics.confidenceCalcTime += performance.now() - startTime;
        return result;
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
        const categories = typeof this.formulaCategories === 'function' 
            ? this.formulaCategories() 
            : this.formulaCategories;
        
        if (categories && formula.id) {
            for (const [category, ids] of Object.entries(categories)) {
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
     * Split into smaller helpers for maintainability
     */
    generateCardHTML(formula, confidenceData, topicScope, searchData) {
        let html = this.generateCardHeader(formula);
        html += this.generateQuickCalcSection(formula);
        html += this.generateConfidenceSection(confidenceData);
        html += this.generateTopicScopeSection(topicScope);
        html += this.generateChipsSection(formula, searchData);
        html += this.generateBreakdownSection(searchData);
        return html;
    }
    
    /**
     * Generate card header (title, equation, description)
     */
    generateCardHeader(formula) {
        return `
            <h3 class="formula-card-title">${this.escapeHtml(formula.name)}</h3>
            <div class="formula-card-equation">${this.escapeHtml(formula.equation)}</div>
            <p class="formula-card-description">${this.escapeHtml(formula.description || 'Click to use this formula')}</p>
        `;
    }
    
    /**
     * Generate quick calculation section
     */
    generateQuickCalcSection(formula) {
        if (!formula.variables || formula.variables.length === 0 || formula.variables.length > 4) {
            return '';
        }
        
        // Extract result variable from LHS of equation
        const lhsMatch = formula.equation.match(/^\s*([a-zA-Z_][a-zA-Z0-9_/]*)/);
        const resultVariable = lhsMatch ? lhsMatch[1].trim() : null;
        
        // Filter out the result variable - user shouldn't input what we're solving for
        const inputVariables = formula.variables.filter(v => v.symbol !== resultVariable);
        
        if (inputVariables.length === 0) {
            return '';
        }
        
        let html = '<div class="formula-card-quick-calc">';
        html += `<div class="quick-calc-header">⚡ Quick Calculate → ${resultVariable || 'Result'}:</div>`;
        html += '<div class="quick-calc-inputs">';
        
        inputVariables.slice(0, 4).forEach((variable) => {
            const inputId = `quick-calc-${formula.id}-${variable.symbol}`;
            html += `
                <div class="quick-calc-input-group">
                    <label for="${inputId}" class="quick-calc-label">${this.escapeHtml(variable.symbol)}</label>
                    <input 
                        type="number" 
                        id="${inputId}"
                        data-formula-id="${formula.id}"
                        data-variable-symbol="${this.escapeHtml(variable.symbol)}"
                        data-result-variable="${resultVariable || ''}"
                        class="quick-calc-input"
                        placeholder="0"
                        step="any"
                    >
                </div>
            `;
        });
        
        html += '</div>';
        html += '<div class="quick-calc-actions">';
        html += `<button class="quick-calc-btn" data-formula-id="${formula.id}" data-result-variable="${resultVariable || ''}">Calculate → ${resultVariable || 'Result'}</button>`;
        html += `<div class="quick-calc-result" data-formula-id="${formula.id}"></div>`;
        html += '</div>';
        html += '</div>';
        
        return html;
    }
    
    /**
     * Generate confidence section
     */
    generateConfidenceSection(confidenceData) {
        if (!confidenceData || !this.renderOptions?.showConfidence) {
            return '';
        }
        
        const confidence = confidenceData.confidence || 0;
        const confidenceLevel = this.getConfidenceLevel(confidence);
        
        return `
            <div class="formula-card-confidence" style="border-left-color: ${confidenceLevel.color};">
                <div class="confidence-header">
                    <span class="confidence-value" style="color: ${confidenceLevel.color};">
                        ${confidenceLevel.icon} ${confidence}% Match
                    </span>
                    <span class="confidence-level">${confidenceLevel.level}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Generate topic scope section
     */
    generateTopicScopeSection(topicScope) {
        if (!topicScope || !this.renderOptions?.showTopicScope) {
            return '';
        }
        
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
        
        if (scopeParts.length === 0) {
            return '';
        }
        
        return `
            <div class="formula-card-topic-scope">
                ${scopeParts.join(' • ')}
            </div>
        `;
    }
    
    /**
     * Generate chips section (matched topics and variables)
     */
    generateChipsSection(formula, searchData) {
        if (!searchData?.metrics || !this.renderOptions?.showConfidence) {
            return '';
        }
        
        const matchedTopics = new Set();
        const matchedVariables = new Set();
        
        // Collect matched topics from concepts
        if (searchData.metrics.matchedConcepts && searchData.metrics.matchedConcepts.length > 0) {
            searchData.metrics.matchedConcepts.slice(0, 5).forEach(c => matchedTopics.add(c));
        } else if (searchData.metrics.conceptMatch && formula.concepts) {
            formula.concepts.slice(0, 3).forEach(c => matchedTopics.add(c));
        }
        
        // Collect matched variables
        if (searchData.metrics.matchedVariables && searchData.metrics.matchedVariables.length > 0) {
            searchData.metrics.matchedVariables.slice(0, 4).forEach(v => matchedVariables.add(v));
        } else if (searchData.metrics.variableMatch && formula.variables) {
            formula.variables.slice(0, 3).forEach(v => matchedVariables.add(v.symbol));
        }
        
        if (matchedTopics.size === 0 && matchedVariables.size === 0) {
            return '';
        }
        
        let html = '<div class="formula-card-chips">';
        html += '<span class="chips-label">MATCHED:</span>';
        
        // Topic chips (concepts)
        matchedTopics.forEach(topic => {
            html += `<span class="topic-chip">🏷️ ${this.escapeHtml(topic)}</span>`;
        });
        
        // Variable chips
        matchedVariables.forEach(variable => {
            html += `<span class="variable-chip">${this.escapeHtml(variable)}</span>`;
        });
        
        html += '</div>';
        return html;
    }
    
    /**
     * Generate breakdown section
     */
    generateBreakdownSection(searchData) {
        if (!searchData?.metrics?.componentScores || !this.renderOptions?.showConfidence) {
            return '';
        }
        
        const scores = searchData.metrics.componentScores;
        const hasScores = Object.values(scores).some(s => s > 0);
        
        if (!hasScores) {
            return '';
        }
        
        const scoreComponents = [
            { key: 'name', label: 'Name Match', color: '#60a5fa', icon: '📛' },
            { key: 'concepts', label: 'Concept Match', color: '#a78bfa', icon: '🧠' },
            { key: 'variables', label: 'Variable Match', color: '#4ade80', icon: '🔢' },
            { key: 'description', label: 'Description Match', color: '#fbbf24', icon: '📝' },
            { key: 'category', label: 'Category Match', color: '#fb923c', icon: '📁' }
        ];
        
        const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);
        
        let html = '<details class="formula-card-breakdown">';
        html += '<summary class="breakdown-summary">📊 Score Breakdown</summary>';
        html += '<div class="breakdown-content">';
        
        scoreComponents.forEach(({ key, label, color, icon }) => {
            const score = scores[key] || 0;
            if (score > 0) {
                const percentage = totalScore > 0 ? ((score / totalScore) * 100).toFixed(1) : 0;
                html += `
                    <div class="breakdown-item">
                        <span class="breakdown-item-label">
                            ${icon} ${label}
                        </span>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div class="breakdown-progress-container">
                                <div class="breakdown-progress-bar" style="width: ${percentage}%; background: ${color};"></div>
                            </div>
                            <span class="breakdown-score-value" style="color: ${color};">
                                ${score.toFixed(0)} pts (${percentage}%)
                            </span>
                        </div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        html += '</details>';
        
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
     * Cleanup resources
     */
    cleanup() {
        if (this.container && this.delegatedHandler) {
            this.container.removeEventListener('click', this.delegatedHandler);
        }
        if (this.container && this.inputHandler) {
            this.container.removeEventListener('input', this.inputHandler);
        }
        
        // Clear all per-card timers
        this.quickCalcTimeouts.forEach(timeout => clearTimeout(timeout));
        this.quickCalcTimeouts.clear();
        
        this.container = null;
        this.delegatedHandler = null;
        this.inputHandler = null;
    }
    
    /**
     * Get performance metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            renderTime: 0,
            quickCalcTime: 0,
            confidenceCalcTime: 0
        };
    }
    
    /**
     * Cleanup resources (alias for destroy)
     */
    destroy() {
        this.cleanup();
    }
}
