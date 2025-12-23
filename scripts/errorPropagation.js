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
     */
    static calculateSignificantFigures(value, absoluteError) {
        if (!absoluteError || absoluteError === 0) {
            // Default to 6 significant figures if no error provided
            return 6;
        }
        
        // Significant figures = -log10(relative error)
        const relativeError = Math.abs(absoluteError / value);
        if (relativeError <= 0) return 15; // Maximum precision
        
        const sigFigs = Math.max(1, Math.floor(-Math.log10(relativeError)));
        return Math.min(sigFigs, 15); // Cap at 15 significant figures
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
     */
    static estimateInputErrors(inputs) {
        const errors = {};
        
        for (const [varName, value] of Object.entries(inputs)) {
            if (typeof value !== 'number' || !isFinite(value)) continue;
            
            // Estimate error as half the last significant digit
            const str = value.toString();
            if (str.includes('e') || str.includes('E')) {
                // Scientific notation
                const [mantissa, exponent] = str.split(/[eE]/);
                const decimals = mantissa.includes('.') ? mantissa.split('.')[1].length : 0;
                errors[varName] = Math.abs(value) * Math.pow(10, -decimals) * 0.5;
            } else {
                // Regular notation
                const decimals = str.includes('.') ? str.split('.')[1].length : 0;
                errors[varName] = Math.pow(10, -decimals) * 0.5;
            }
        }
        
        return errors;
    }
}

// Expose globally
if (typeof window !== 'undefined') {
    window.ErrorPropagator = ErrorPropagator;
}

