/**
 * Error Propagation and Confidence Intervals
 * Provides error propagation, confidence intervals, and significant figure handling
 * for calculation results
 */

class ErrorPropagator {
    /**
     * Calculate error propagation for a result
     * Uses standard error propagation formulas
     */
    static propagateError(formula, inputs, inputErrors, result) {
        if (!inputErrors || Object.keys(inputErrors).length === 0) {
            return null;
        }

        const errors = {};
        
        // For each input with error, calculate partial derivative contribution
        for (const [varName, error] of Object.entries(inputErrors)) {
            if (error === null || error === undefined || error === 0) continue;
            
            // Calculate partial derivative numerically
            const h = Math.abs(inputs[varName]) * 1e-6 || 1e-10;
            const inputsPlus = { ...inputs, [varName]: inputs[varName] + h };
            const inputsMinus = { ...inputs, [varName]: inputs[varName] - h };
            
            try {
                // Check if FormulaCalculator is available
                if (typeof FormulaCalculator === 'undefined') {
                    continue;
                }
                
                const calc = new FormulaCalculator(formula);
                const resultPlus = calc.solve(inputsPlus);
                const resultMinus = calc.solve(inputsMinus);
                
                if (!resultPlus || !resultMinus || 
                    !isFinite(resultPlus.result) || !isFinite(resultMinus.result)) {
                    continue;
                }
                
                const partialDerivative = (resultPlus.result - resultMinus.result) / (2 * h);
                if (isFinite(partialDerivative)) {
                    errors[varName] = Math.abs(partialDerivative * error);
                }
            } catch (e) {
                // If calculation fails, skip this variable
                continue;
            }
        }
        
        // Combine errors: sqrt(sum of squares) for independent errors
        const totalError = Math.sqrt(Object.values(errors).reduce((sum, err) => sum + err * err, 0));
        
        return {
            absoluteError: totalError,
            relativeError: Math.abs(result) > 0 ? totalError / Math.abs(result) : null,
            contributions: errors,
            confidenceInterval95: totalError * 1.96, // 95% confidence (1.96 sigma)
            confidenceInterval99: totalError * 2.576  // 99% confidence (2.576 sigma)
        };
    }
    
    /**
     * Calculate significant figures based on input precision
     * ENHANCED: More accurate calculation with better handling of edge cases
     */
    static calculateSignificantFigures(value, absoluteError) {
        if (!absoluteError || absoluteError === 0 || value === 0) {
            // Default to 15 significant figures if no error provided (maximum precision)
            return 15;
        }
        
        // Significant figures = -log10(relative error)
        const relativeError = Math.abs(absoluteError / Math.abs(value));
        if (relativeError <= 0 || relativeError >= 1) {
            return 1; // Minimum 1 significant figure
        }
        
        // ENHANCED: More accurate calculation
        const sigFigs = -Math.log10(relativeError);
        // Round up for better precision estimate
        return Math.max(1, Math.min(Math.ceil(sigFigs), 15)); // Cap at 15 significant figures
    }
    
    /**
     * Format number with appropriate significant figures and error
     */
    static formatWithError(value, absoluteError, unit = '') {
        if (!absoluteError || absoluteError === 0) {
            return this.formatWithSigFigs(value, 6) + (unit ? ` ${unit}` : '');
        }
        
        const sigFigs = this.calculateSignificantFigures(value, absoluteError);
        const formattedValue = this.formatWithSigFigs(value, sigFigs);
        const formattedError = this.formatError(absoluteError);
        
        return `${formattedValue} ± ${formattedError}${unit ? ` ${unit}` : ''}`;
    }
    
    /**
     * Format number with specified significant figures
     */
    static formatWithSigFigs(value, sigFigs) {
        if (value === 0) return '0';
        
        const absValue = Math.abs(value);
        const magnitude = Math.floor(Math.log10(absValue));
        const factor = Math.pow(10, sigFigs - magnitude - 1);
        
        const rounded = Math.round(value * factor) / factor;
        
        // Use scientific notation for very large/small numbers
        if (absValue >= 1e6 || (absValue < 1e-3 && absValue > 0)) {
            return rounded.toExponential(sigFigs - 1);
        }
        
        // Use fixed notation with appropriate decimal places
        const decimals = Math.max(0, sigFigs - magnitude - 1);
        return rounded.toFixed(decimals);
    }
    
    /**
     * Format error value appropriately
     */
    static formatError(error) {
        if (error === 0) return '0';
        
        const absError = Math.abs(error);
        const magnitude = Math.floor(Math.log10(absError));
        
        // Round to 1-2 significant figures
        const sigFigs = magnitude < 0 ? 2 : 1;
        const factor = Math.pow(10, sigFigs - magnitude - 1);
        const rounded = Math.round(error * factor) / factor;
        
        if (absError >= 1e6 || (absError < 1e-3 && absError > 0)) {
            return rounded.toExponential(sigFigs - 1);
        }
        
        return rounded.toFixed(Math.max(0, -magnitude + sigFigs - 1));
    }
    
    /**
     * Estimate input errors from significant figures in input values
     * ENHANCED: Better detection of significant figures from input format
     */
    static estimateInputErrors(inputs) {
        const errors = {};
        
        for (const [varName, value] of Object.entries(inputs)) {
            if (typeof value !== 'number' || !isFinite(value)) continue;
            
            // ENHANCED: Better significant figure detection
            const str = value.toString();
            let sigFigs = 0;
            let error = 0;
            
            if (str.includes('e') || str.includes('E')) {
                // Scientific notation: count significant digits in mantissa
                const [mantissa] = str.split(/[eE]/);
                // Remove decimal point and leading zeros
                const digits = mantissa.replace('.', '').replace(/^0+/, '');
                sigFigs = digits.length;
                const magnitude = Math.floor(Math.log10(Math.abs(value)));
                error = Math.abs(value) * Math.pow(10, -(sigFigs - 1)) * 0.5;
            } else {
                // Regular notation: count significant digits
                // Remove decimal point
                const digits = str.replace('.', '');
                // Count from first non-zero digit
                let firstNonZero = -1;
                for (let i = 0; i < digits.length; i++) {
                    if (digits[i] !== '0' && digits[i] !== '-') {
                        firstNonZero = i;
                        break;
                    }
                }
                if (firstNonZero >= 0) {
                    sigFigs = digits.length - firstNonZero;
                    // Estimate error based on last significant digit
                    const magnitude = Math.floor(Math.log10(Math.abs(value)));
                    error = Math.pow(10, magnitude - sigFigs + 1) * 0.5;
                } else {
                    // Zero or very small number
                    error = Math.abs(value) * 0.01; // 1% default
                }
            }
            
            // Minimum error: 1 part in 10^15 (machine precision)
            errors[varName] = Math.max(error, Math.abs(value) * 1e-15);
        }
        
        return errors;
    }
}

// Expose globally
if (typeof window !== 'undefined') {
    window.ErrorPropagator = ErrorPropagator;
}

