/**
 * Accuracy Enhancements for Calculator
 * Improves precision, significant figures, and error handling
 */

/**
 * Enhanced precision rounding with proper significant figures
 */
function roundToSignificantFigures(value, sigFigs) {
    if (value === 0 || !isFinite(value)) return value;
    
    const absValue = Math.abs(value);
    const magnitude = Math.floor(Math.log10(absValue));
    const factor = Math.pow(10, sigFigs - magnitude - 1);
    
    // Use high precision if available
    if (typeof PrecisionCalculator !== 'undefined' && PrecisionCalculator.isAvailable()) {
        return PrecisionCalculator.round(value * factor, 0) / factor;
    }
    
    return Math.round(value * factor) / factor;
}

/**
 * Enhanced error propagation with better numerical stability
 */
function enhanceErrorPropagation(formula, inputs, inputErrors, result) {
    if (!inputErrors || Object.keys(inputErrors).length === 0) {
        return null;
    }
    
    // Use smaller step size for better derivative approximation
    const errors = {};
    
    for (const [varName, error] of Object.entries(inputErrors)) {
        if (error === null || error === undefined || error === 0) continue;
        
        // Adaptive step size based on value magnitude
        const value = inputs[varName];
        const h = Math.max(
            Math.abs(value) * 1e-7,  // Smaller step for better precision
            1e-12  // Minimum step size
        );
        
        const inputsPlus = { ...inputs, [varName]: value + h };
        const inputsMinus = { ...inputs, [varName]: value - h };
        
        try {
            if (typeof FormulaCalculator === 'undefined') continue;
            
            const calc = new FormulaCalculator(formula);
            const resultPlus = calc.solve(inputsPlus);
            const resultMinus = calc.solve(inputsMinus);
            
            if (!resultPlus || !resultMinus || 
                !isFinite(resultPlus.result) || !isFinite(resultMinus.result)) {
                continue;
            }
            
            // Central difference for better accuracy
            const partialDerivative = (resultPlus.result - resultMinus.result) / (2 * h);
            if (isFinite(partialDerivative)) {
                errors[varName] = Math.abs(partialDerivative * error);
            }
        } catch (e) {
            continue;
        }
    }
    
    // Combine errors: sqrt(sum of squares) for independent errors
    const totalError = Math.sqrt(Object.values(errors).reduce((sum, err) => sum + err * err, 0));
    
    // Enhanced confidence intervals
    return {
        absoluteError: totalError,
        relativeError: Math.abs(result) > 0 ? totalError / Math.abs(result) : null,
        contributions: errors,
        confidenceInterval95: totalError * 1.96,
        confidenceInterval99: totalError * 2.576,
        // Additional precision metrics
        precision: totalError > 0 ? -Math.log10(totalError / Math.abs(result)) : 15
    };
}

/**
 * Enhanced significant figure calculation
 */
function calculateSignificantFiguresEnhanced(value, absoluteError) {
    if (!absoluteError || absoluteError === 0 || value === 0) {
        return 15; // Maximum precision when no error
    }
    
    const relativeError = Math.abs(absoluteError / value);
    if (relativeError <= 0 || relativeError >= 1) return 1;
    
    // More accurate calculation
    const sigFigs = -Math.log10(relativeError);
    return Math.max(1, Math.min(Math.floor(sigFigs) + 1, 15));
}

/**
 * Apply accuracy enhancements to ErrorPropagator if it exists
 */
if (typeof ErrorPropagator !== 'undefined') {
    // Enhance the existing methods
    const originalPropagate = ErrorPropagator.propagateError;
    ErrorPropagator.propagateError = function(formula, inputs, inputErrors, result) {
        const enhanced = enhanceErrorPropagation(formula, inputs, inputErrors, result);
        return enhanced || originalPropagate.call(this, formula, inputs, inputErrors, result);
    };
    
    const originalSigFigs = ErrorPropagator.calculateSignificantFigures;
    ErrorPropagator.calculateSignificantFigures = function(value, absoluteError) {
        return calculateSignificantFiguresEnhanced(value, absoluteError) || 
               originalSigFigs.call(this, value, absoluteError);
    };
}

// Expose globally
if (typeof window !== 'undefined') {
    window.roundToSignificantFigures = roundToSignificantFigures;
    window.enhanceErrorPropagation = enhanceErrorPropagation;
    window.calculateSignificantFiguresEnhanced = calculateSignificantFiguresEnhanced;
}

