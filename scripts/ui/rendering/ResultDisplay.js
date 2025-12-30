/**
 * Result Display Rendering Module
 * Extracted from ui.js for better modularity
 */

class ResultDisplayRenderer {
    constructor() {
        this.helpers = typeof window !== 'undefined' && typeof window.helpers ? window.helpers : null;
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
            if (typeof displaySymbolicResult === 'function') {
                displaySymbolicResult(result, varInfo);
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
        
        // Format with error propagation
        let formattedValue = typeof UnitConverter !== 'undefined'
            ? UnitConverter.formatNumber(numericValue)
            : numericValue.toString();
        const unitName = typeof UnitConverter !== 'undefined'
            ? UnitConverter.formatUnit(result.unit)
            : result.unit || '';
        
        // Get unit conversion
        const conversion = typeof UnitConverter !== 'undefined'
            ? UnitConverter.convertAndFormat(numericValue, result.unit)
            : null;
        
        // Format with error if available
        if (result.errorInfo && typeof ErrorPropagator !== 'undefined') {
            formattedValue = ErrorPropagator.formatWithError(
                numericValue,
                result.errorInfo.absoluteError,
                ''
            );
        } else if (result.significantFigures && typeof ErrorPropagator !== 'undefined') {
            formattedValue = ErrorPropagator.formatWithSigFigs(numericValue, result.significantFigures);
        }
        
        // Build result HTML
        let resultHTML = `
            <h3>Result</h3>
            <div class="result-value">${formattedValue}</div>
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
        
        // Add converted value if available
        if (conversion && conversion.unit && conversion.unit !== result.unit && conversion.value !== numericValue) {
            const convertedFormatted = typeof UnitConverter !== 'undefined'
                ? UnitConverter.formatNumber(conversion.value)
                : conversion.value.toString();
            const convertedUnitName = typeof UnitConverter !== 'undefined'
                ? UnitConverter.formatUnit(conversion.unit)
                : conversion.unit;
            resultHTML += `
                <div class="result-converted">
                    <div class="converted-label">Also:</div>
                    <div class="converted-value">${convertedFormatted} ${conversion.unit}</div>
                    <div class="converted-unit">${convertedUnitName}</div>
                </div>
            `;
        }
        
        // For radians, show degrees conversion
        const isRadians = result.unit && (result.unit.toLowerCase().includes('radian') || result.unit.toLowerCase().includes('rad'));
        if (isRadians && (!conversion || conversion.unit !== 'degrees')) {
            const degreesValue = numericValue * 180 / Math.PI;
            const degreesFormatted = typeof UnitConverter !== 'undefined'
                ? UnitConverter.formatNumber(degreesValue)
                : degreesValue.toString();
            resultHTML += `
                <div class="result-converted">
                    <div class="converted-label">Also in degrees:</div>
                    <div class="converted-value">${degreesFormatted}°</div>
                    <div class="converted-unit">degrees</div>
                </div>
            `;
        }
        
        resultDisplay.innerHTML = resultHTML;
        resultDisplay.classList.add('show', 'result', 'calculation-result');
        resultDisplay.setAttribute('data-result', 'true');
        
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

