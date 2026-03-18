/**
 * Result Display Rendering Module
 * Extracted from ui.js for better modularity
 */

class ResultDisplayRenderer {
    constructor() {
        this.helpers = typeof window !== 'undefined' && typeof window.helpers ? window.helpers : null;
    }
    
    _escapeHtml(text) {
        if (this.helpers && typeof this.helpers.escapeHtml === 'function') return this.helpers.escapeHtml(String(text));
        if (typeof escapeHtml === 'function') return escapeHtml(String(text));
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    _escapeAttr(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    _looksLikeMath(text) {
        return /[=^*/÷×·]|sqrt\(|\bpi\b|π|[_]|\\pi/.test(String(text ?? ''));
    }

    _toLatex(raw) {
        const text = String(raw ?? '');

        // Scientific notation: 1.23e-4 -> 1.23 \times 10^{-4}
        let out = text.replace(
            /(\d+(?:\.\d+)?)[eE]([+\-]?\d+)/g,
            (_m, a, b) => `${a}\\times 10^{${b}}`
        );

        // Subscripts for common identifiers: x_y -> x_{y}
        out = out.replace(/([A-Za-z])_([A-Za-z0-9]+)/g, (_m, a, b) => `${a}_{${b}}`);

        // Constants
        out = out.replace(/\bpi\b/g, '\\pi').replace(/π/g, '\\pi');

        // Operators
        out = out.replace(/×/g, '\\cdot ').replace(/·/g, '\\cdot ').replace(/\*/g, '\\cdot ');
        out = out.replace(/÷/g, '\\div ');

        // Powers: x^2 -> x^{2}
        out = out.replace(/\^([A-Za-z0-9+\-./]+)/g, '^{$1}');

        // sqrt(simple): sqrt(x) -> \sqrt{x}
        for (let i = 0; i < 4; i++) {
            const next = out.replace(/sqrt\(([^()]+)\)/g, '\\\\sqrt{$1}');
            if (next === out) break;
            out = next;
        }

        return out;
    }

    _latexToPrettyUnicode(latexRaw) {
        let s = String(latexRaw ?? '');
        s = s.replace(/\\text\{([^}]*)\}/g, '$1');
        s = s.replace(/\\cdot\s*/g, '×');
        s = s.replace(/\\div\s*/g, '÷');
        s = s.replace(/\\pi\b/g, 'π');
        s = s.replace(/10\^\{([+\-]?\d+)\}/g, '10^$1');

        for (let i = 0; i < 4; i++) {
            const next = s.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');
            if (next === s) break;
            s = next;
        }

        s = s.replace(/\^\{([^}]+)\}/g, '^$1');

        const supMap = {
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
            '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
            '+': '⁺', '-': '⁻'
        };
        s = s.replace(/\^([+\-]?\d+)/g, (_m, exp) => {
            const chars = String(exp).split('');
            return chars.every(c => supMap[c]) ? chars.map(c => supMap[c]).join('') : `^${exp}`;
        });

        return s.replace(/\\\\/g, '\\');
    }

    _latexSpan(latex, displayMode = false) {
        const payload = encodeURIComponent(String(latex ?? ''));
        return `<span class="alg-katex" data-display="${displayMode ? '1' : '0'}" data-latex="${this._escapeAttr(payload)}"></span>`;
    }

    _renderKatexIn(rootEl) {
        if (!rootEl) return;
        const katex = (typeof window !== 'undefined' && window.katex) ? window.katex : null;
        rootEl.querySelectorAll('.alg-katex[data-latex]').forEach(el => {
            const enc = el.getAttribute('data-latex') || '';
            const display = el.getAttribute('data-display') === '1';
            const latex = decodeURIComponent(enc);
            if (!katex) {
                el.textContent = this._latexToPrettyUnicode(latex);
                return;
            }
            try {
                katex.render(latex, el, { throwOnError: false, displayMode: display });
            } catch (_) {
                el.textContent = this._latexToPrettyUnicode(latex);
            }
        });
    }
    
    /**
     * Get DOM element (with caching)
     */
    getElement(id) {
        if (this.helpers) {
            return this.helpers.getElement(id);
        }
        return document.getElementById(id);
    }
    
    /**
     * Find result display element
     */
    getResultDisplay() {
        const calculatorTab = this.getElement('calculator-tab');
        const resultDisplay = calculatorTab ? calculatorTab.querySelector('#result-display') : this.getElement('result-display');
        return resultDisplay;
    }
    
    /**
     * Display calculation result
     * @param {Object} result - Result object from calculator
     * @param {Object} currentFormula - Current formula object
     */
    displayResult(result, currentFormula) {
        const resultDisplay = this.getResultDisplay();
        
        if (!resultDisplay) {
            console.error('[ResultDisplayRenderer] Result display not found');
            return;
        }
        
        // Add classes/attributes for test compatibility
        resultDisplay.classList.add('result', 'calculation-result');
        resultDisplay.setAttribute('data-result', 'true');
        
        const solvedVar = result.solvedFor || result.variable;
        const varInfo = currentFormula && currentFormula.variables 
            ? currentFormula.variables.find(v => v.symbol === solvedVar)
            : null;
        
        const resultValue = result.result !== undefined ? result.result : (result.value !== undefined ? result.value : null);
        
        if (resultValue === null || resultValue === undefined) {
            console.error('[ResultDisplayRenderer] Result value is null/undefined:', result);
            this.displayError('No result value returned. Please check your inputs.');
            return;
        }
        
        // Check if symbolic
        const isExplicitlySymbolic = result.isSymbolic === true;
        const isStringWithSymbols = typeof resultValue === 'string' && 
            (resultValue.includes('√') || resultValue.includes('×') || 
             resultValue.includes('log') || resultValue.includes('^') ||
             resultValue.match(/[a-zA-Z_]/));
        
        if (isExplicitlySymbolic || (isStringWithSymbols && !result.allEquations)) {
            console.log('[ResultDisplayRenderer] Symbolic result detected, displaying...');
            console.log('[ResultDisplayRenderer] displaySymbolicResult function:', typeof displaySymbolicResult);
            
            if (typeof displaySymbolicResult === 'function') {
                displaySymbolicResult(result, varInfo);
            } else {
                // Fallback: Display symbolic result directly
                console.log('[ResultDisplayRenderer] displaySymbolicResult not found, using fallback display');
                const symbolicValue = resultValue || result.result || 'No symbolic expression available';
                const unit = result.unit || '';
                const unitName = varInfo && varInfo.unit ? varInfo.unit.name : unit;
                
                resultDisplay.classList.add('show');
                resultDisplay.innerHTML = `
                    <h3>Symbolic Result</h3>
                    <div class="result-value" style="font-family: 'Courier New', monospace; white-space: pre-wrap; text-align: left; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; margin: 15px 0;">
                        ${this._escapeHtml(String(symbolicValue))}
                    </div>
                    ${unit ? `<div class="result-unit">${this._escapeHtml(unit)}</div>` : ''}
                    ${unitName ? `<div class="result-unit-full">${this._escapeHtml(unitName)}</div>` : ''}
                    ${result.unknownVariables && result.unknownVariables.length > 0 ? `
                        <div style="margin-top: 15px; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                            <div style="font-weight: 600; margin-bottom: 8px;">Unknown Variables:</div>
                            <div>${this._escapeHtml(result.unknownVariables.join(', '))}</div>
                        </div>
                    ` : ''}
                    ${result.knownValuesFormatted ? `
                        <div style="margin-top: 15px; padding: 12px; background: rgba(0,255,0,0.08); border-radius: 8px; border: 1px solid rgba(0,255,0,0.15);">
                            <div style="font-weight: 600; margin-bottom: 8px;">Known Values (base units):</div>
                            <div style="font-family: 'Courier New', monospace; white-space: pre-wrap; font-size: 0.95em;">
                                ${this._escapeHtml(result.knownValuesFormatted)}
                            </div>
                        </div>
                    ` : ''}
                    ${result.solvedForms && Object.keys(result.solvedForms).length > 0 ? `
                        <div style="margin-top: 15px; padding: 12px; background: rgba(102,126,234,0.15); border-radius: 8px; border: 1px solid rgba(102,126,234,0.3);">
                            <div style="font-weight: 600; margin-bottom: 10px;">Solve for each variable:</div>
                            ${Object.entries(result.solvedForms).map(([v, form]) => `
                                <div style="margin-bottom: 8px; font-family: 'Courier New', monospace; white-space: pre-wrap; font-size: 0.95em;">${this._escapeHtml(form)}</div>
                            `).join('')}
                        </div>
                    ` : ''}
                `;
                console.log('[ResultDisplayRenderer] ✅ Symbolic result displayed via fallback');
            }
            return;
        }
        
        // Ensure numeric value
        let numericValue = resultValue;
        if (typeof numericValue === 'string') {
            const parsed = typeof parseNumericValue === 'function' 
                ? parseNumericValue(numericValue)
                : parseFloat(numericValue);
            if (parsed === null || isNaN(parsed)) {
                console.error('[ResultDisplayRenderer] Failed to parse string as number:', numericValue);
                this.displayError('Invalid result value. Please check your inputs.');
                return;
            }
            numericValue = parsed;
        }
        
        // Validation
        if (typeof numericValue !== 'number') {
            console.error('[ResultDisplayRenderer] Result is not a number type:', numericValue);
            this.displayError(`Invalid result type: ${typeof numericValue}. Expected a number.`);
            return;
        }
        
        if (isNaN(numericValue)) {
            this.displayError('Result is NaN (Not a Number). Please check your inputs.');
            return;
        }
        
        if (numericValue === Infinity || numericValue === -Infinity) {
            this.displayError('Result is infinite. This may indicate division by zero or extremely large values.');
            return;
        }
        
        if (!isFinite(numericValue)) {
            this.displayError(`Result is not a finite number (got: ${numericValue}). Please check your inputs.`);
            return;
        }
        
        // High-precision formatting (Desmos-like) for all displayed numbers
        const formatNum = (val) => {
            if (typeof UnitConverter !== 'undefined' && typeof UnitConverter.formatNumber === 'function') {
                return UnitConverter.formatNumber(val);
            }
            if (typeof val !== 'number' || !Number.isFinite(val)) return String(val);
            if (val === 0) return '0';
            const abs = Math.abs(val);
            if (abs >= 1e10 || (abs < 1e-6 && abs > 0)) return val.toExponential(14);
            const decimals = Math.max(0, 15 - Math.floor(Math.log10(abs)) - 1);
            let s = val.toFixed(decimals);
            if (s.indexOf('.') !== -1) s = s.replace(/\.?0+$/, '');
            return s;
        };

        let formattedValue = formatNum(numericValue);
        const unitName = typeof UnitConverter !== 'undefined'
            ? UnitConverter.formatUnit(result.unit)
            : result.unit || '';
        
        // Format with error if available (overrides display)
        if (result.errorInfo && typeof ErrorPropagator !== 'undefined') {
            formattedValue = ErrorPropagator.formatWithError(
                numericValue,
                result.errorInfo.absoluteError,
                ''
            );
        } else if (result.significantFigures && typeof ErrorPropagator !== 'undefined') {
            formattedValue = ErrorPropagator.formatWithSigFigs(numericValue, result.significantFigures);
        }
        
        // ---- Calculation flow: Given → Formula → Substitute → (Evaluate) → Result ----
        let equation = (currentFormula && currentFormula.equation) ? String(currentFormula.equation) : (result.equation || '');
        equation = equation.replace(/≈/g, '=');
        const formulaExpression = result.formulaExpression || '';
        const workSteps = [];
        
        // 1. Given (known inputs)
        const given = result.given && typeof result.given === 'object' ? result.given : {};
        const givenEntries = Object.entries(given).filter(([_, v]) => v != null && typeof v === 'number' && Number.isFinite(v));
        if (givenEntries.length > 0) {
            const varList = givenEntries.map(([sym, val]) => {
                const vDef = currentFormula && currentFormula.variables ? currentFormula.variables.find(v => v.symbol === sym) : null;
                const u = (vDef && vDef.unit) ? vDef.unit : '';
                return `${sym} = ${formatNum(val)}${u ? ' ' + u : ''}`;
            }).join(', ');
            workSteps.push({ label: 'Given', expr: varList });
        }
        
        // 2. Formula
        if (equation.trim()) workSteps.push({ label: 'Formula', expr: equation.trim() });
        
        // 3. Substitute values (and optional 4. Evaluate - split when expression ends with " = number")
        if (formulaExpression.trim()) {
            const lastEq = formulaExpression.lastIndexOf('=');
            const leftOfLast = formulaExpression.slice(0, lastEq).trim();
            const rightOfLast = formulaExpression.slice(lastEq + 1).trim();
            const rightIsNumber = /^[\d.eE+-]+$/.test(rightOfLast);
            if (rightIsNumber && leftOfLast) {
                workSteps.push({ label: 'Substitute', expr: leftOfLast });
                const exprPart = leftOfLast.includes('=') ? (leftOfLast.split('=').pop() || leftOfLast).trim() : leftOfLast;
                workSteps.push({ label: 'Evaluate', expr: `${exprPart} = ${formatNum(parseFloat(rightOfLast))}` });
            } else {
                workSteps.push({ label: 'Substitute', expr: formulaExpression.trim() });
            }
        }
        
        // 5. Result
        workSteps.push({ label: 'Result', expr: `${solvedVar} = ${formatNum(numericValue)} ${(result.unit || '').trim()}`.trim() });
        
        let workHTML = '';
        if (workSteps.length > 0) {
            workHTML = `
            <div class="calculation-work show-your-work" style="margin-bottom: 1.25rem; padding: 1rem; background: rgba(15,23,42,0.6); border-radius: 8px; border-left: 4px solid #667eea;">
                <div style="font-weight: 600; margin-bottom: 0.75rem; color: #a5b4fc;">Calculation flow</div>
                ${workSteps.map((step, i) => `
                <div class="work-step" style="margin-bottom: ${i < workSteps.length - 1 ? '0.75rem' : '0'}; font-family: 'Courier New', monospace; font-size: 0.95em; white-space: pre-wrap; word-break: break-all;">
                    <span style="color: #94a3b8;">${i + 1}.</span> <span style="color: #cbd5e1;">${this._escapeHtml(step.label)}:</span>
                    <div style="margin-left: 1.25rem; margin-top: 0.25rem; color: #e2e8f0;">${
                        this._latexSpan(
                            this._looksLikeMath(step.expr)
                                ? this._toLatex(step.expr)
                                : `\\text{${String(step.expr).replace(/\\/g, '\\\\').replace(/[{}]/g, '')}}`,
                            false
                        )
                    }</div>
                </div>
                `).join('')}
            </div>`;
        }
        
        // Build result HTML (work + main result + unit conversions)
        let resultHTML = `
            <h3>Result</h3>
            ${workHTML}
            <div class="result-value" style="font-size: 1.25em; font-weight: 600;">${formattedValue}</div>
            <div class="result-unit">${varInfo ? varInfo.name : solvedVar} (${result.unit || ''})</div>
            <div class="result-unit-full">${unitName}</div>
        `;
        
        // Add confidence intervals
        if (result.errorInfo && typeof ErrorPropagator !== 'undefined') {
            const ci95 = result.errorInfo.confidenceInterval95;
            const ci99 = result.errorInfo.confidenceInterval99;
            const relativeError = result.errorInfo.relativeError;
            
            resultHTML += `
                <div class="result-confidence" style="margin-top: 15px; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 8px; border-left: 3px solid #667eea;">
                    <div style="font-weight: 600; color: #a8c7ff; margin-bottom: 8px;">Confidence Intervals</div>
                    <div style="font-size: 0.9em; color: #cbd5e1; line-height: 1.6;">
                        <div>95% CI: ${ErrorPropagator.formatWithError(numericValue, ci95, result.unit || '')}</div>
                        <div>99% CI: ${ErrorPropagator.formatWithError(numericValue, ci99, result.unit || '')}</div>
                        ${relativeError ? `<div>Relative Error: ${(relativeError * 100).toFixed(2)}%</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        // Add arithmetic context
        if (result.arithmeticContext) {
            const ctx = result.arithmeticContext;
            const stabilityColor = ctx.stability === 'stable' ? '#4ade80' : ctx.stability === 'unstable' ? '#f87171' : '#fbbf24';
            const precisionColor = ctx.precision === 'standard' ? '#4ade80' : ctx.precision === 'reduced' ? '#fbbf24' : '#f87171';
            
            resultHTML += `
                <div class="result-arithmetic" style="margin-top: 10px; padding: 10px; background: rgba(15, 23, 42, 0.5); border-radius: 6px; font-size: 0.85em;">
                    <div style="display: flex; gap: 15px; color: #94a3b8;">
                        <div>
                            <span style="color: ${stabilityColor};">●</span> Stability: <strong>${ctx.stability}</strong>
                        </div>
                        <div>
                            <span style="color: ${precisionColor};">●</span> Precision: <strong>${ctx.precision}</strong>
                        </div>
                        ${result.significantFigures ? `<div>Sig Figs: <strong>${result.significantFigures}</strong></div>` : ''}
                    </div>
                </div>
            `;
        }
        
        // All unit conversions: use result.unitConversions when available (full list with high precision)
        const baseUnit = result.baseUnit || result.unit;
        const conversions = result.unitConversions || [];
        if (conversions.length > 0 && baseUnit) {
            const unitNames = typeof UnitConverter !== 'undefined' ? UnitConverter.formatUnit : (u) => u;
            resultHTML += `
                <div class="result-unit-conversions" style="margin-top: 1rem; padding: 1rem; background: rgba(102,126,234,0.08); border-radius: 8px;">
                    <div style="font-weight: 600; margin-bottom: 0.5rem; color: #a5b4fc;">In other units</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.5rem;">
                        ${conversions.map(c => {
                            const fmt = typeof UnitConverter !== 'undefined' && typeof UnitConverter.formatNumber === 'function'
                                ? UnitConverter.formatNumber(c.value) : formatNum(c.value);
                            const name = typeof unitNames === 'function' ? unitNames(c.unit) : c.unit;
                            return `<div style="padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 4px;">
                                <span class="converted-value" style="font-weight: 600;">${fmt}</span>
                                <span class="converted-unit" style="opacity: 0.9; margin-left: 0.25rem;">${this._escapeHtml(c.unit)}</span>
                                ${name !== c.unit ? `<div style="font-size: 0.8em; opacity: 0.8;">${this._escapeHtml(name)}</div>` : ''}
                            </div>`;
                        }).join('')}
                    </div>
                </div>`;
        } else {
            // Fallback: single best conversion when unitConversions not precomputed
            const conversion = typeof UnitConverter !== 'undefined'
                ? UnitConverter.convertAndFormat(numericValue, result.unit)
                : null;
            if (conversion && conversion.unit && conversion.unit !== result.unit && conversion.value !== numericValue) {
                const convertedFormatted = typeof UnitConverter !== 'undefined' && typeof UnitConverter.formatNumber === 'function'
                    ? UnitConverter.formatNumber(conversion.value) : formatNum(conversion.value);
                const convertedUnitName = typeof UnitConverter !== 'undefined'
                    ? UnitConverter.formatUnit(conversion.unit)
                    : conversion.unit;
                resultHTML += `
                    <div class="result-converted" style="margin-top: 0.75rem;">
                        <div class="converted-label" style="opacity: 0.9;">Also:</div>
                        <div class="converted-value" style="font-weight: 600;">${convertedFormatted} ${this._escapeHtml(conversion.unit)}</div>
                        <div class="converted-unit" style="opacity: 0.8;">${this._escapeHtml(convertedUnitName)}</div>
                    </div>
                `;
            }
            // For radians, show degrees conversion
            const isRadians = result.unit && (result.unit.toLowerCase().includes('radian') || result.unit.toLowerCase().includes('rad'));
            if (isRadians && (!conversion || conversion.unit !== 'degrees')) {
                const degreesValue = numericValue * 180 / Math.PI;
                const degreesFormatted = formatNum(degreesValue);
                resultHTML += `
                    <div class="result-converted" style="margin-top: 0.75rem;">
                        <div class="converted-label" style="opacity: 0.9;">Also in degrees:</div>
                        <div class="converted-value" style="font-weight: 600;">${degreesFormatted}°</div>
                        <div class="converted-unit" style="opacity: 0.8;">degrees</div>
                    </div>
                `;
            }
        }
        
        resultDisplay.innerHTML = resultHTML;
        resultDisplay.classList.add('show', 'result', 'calculation-result');
        resultDisplay.setAttribute('data-result', 'true');

        // Render pretty math in the work steps (KaTeX if available, otherwise unicode fallback)
        this._renderKatexIn(resultDisplay);
        
        // Scroll to result
        resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * Display error message
     * @param {string} message - Error message
     */
    displayError(message) {
        const resultDisplay = this.getResultDisplay();
        
        if (!resultDisplay) {
            const allResultDisplays = document.querySelectorAll('#result-display, .result-display');
            if (allResultDisplays.length > 0) {
                allResultDisplays[0].innerHTML = `<div class="error-message">${escapeHtml(message)}</div>`;
                allResultDisplays[0].classList.add('show', 'result', 'calculation-result');
                return;
            }
            alert(`Error: ${message}`);
            return;
        }
        
        resultDisplay.innerHTML = `<div class="error-message">${escapeHtml(message)}</div>`;
        resultDisplay.classList.add('show', 'result', 'calculation-result');
        resultDisplay.setAttribute('data-result', 'true');
        
        // Scroll to error
        resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ResultDisplayRenderer = ResultDisplayRenderer;
    // Create singleton instance
    window.resultDisplayRenderer = new ResultDisplayRenderer();
}

