/**
 * InputValidator - Validates inputs before calculation
 * Provides first-pass validation for all variable values
 */

import { CalculationError } from './CalculationError';
import { Formula } from '../types/formula';

export class InputValidator {
    /**
     * Validate all inputs before calculation
     * @throws {CalculationError} If validation fails with clear, testable error messages
     */
    static validateInputs(formula: Formula, variableValues: Record<string, unknown>): void {
        if (!formula || !formula.variables) {
            throw new CalculationError(
                'Invalid formula: formula and variables are required',
                { step: 'Input validation', formulaId: formula?.id }
            );
        }
        
        if (!variableValues || typeof variableValues !== 'object') {
            throw new CalculationError(
                `Invalid variableValues: must be an object, got ${typeof variableValues}`,
                { step: 'Input validation', formulaId: formula.id, variableValuesType: typeof variableValues }
            );
        }
        
        // Validate that all provided values are valid types
        for (const [symbol, value] of Object.entries(variableValues)) {
            // Skip null, undefined, empty string, or N/A values (these are valid)
            if (value === null || value === undefined || value === '' || 
                value === 'null' || value === 'N/A' || value === 'n/a' || 
                value === 'na' || value === 'IDK' || value === 'idk') {
                continue;
            }
            
            // Validate type
            if (typeof value !== 'number' && typeof value !== 'string') {
                throw new CalculationError(
                    `Invalid type for variable '${symbol}': expected number or string, got ${typeof value}. Value: ${JSON.stringify(value)}`,
                    {
                        step: 'Input validation',
                        formulaId: formula.id,
                        variable: symbol,
                        expectedType: 'number or string',
                        actualType: typeof value,
                        value: value
                    }
                );
            }
            
            // If it's a number, validate it's finite
            if (typeof value === 'number') {
                if (isNaN(value)) {
                    throw new CalculationError(
                        `Invalid number for variable '${symbol}': NaN (Not a Number)`,
                        {
                            step: 'Input validation',
                            formulaId: formula.id,
                            variable: symbol,
                            value: value
                        }
                    );
                }
                if (!isFinite(value)) {
                    throw new CalculationError(
                        `Invalid number for variable '${symbol}': ${value} (not finite - may be Infinity or -Infinity)`,
                        {
                            step: 'Input validation',
                            formulaId: formula.id,
                            variable: symbol,
                            value: value
                        }
                    );
                }
            }
            
            // If it's a string, validate it's not empty after trim
            if (typeof value === 'string') {
                const trimmed = value.trim();
                if (trimmed === '') {
                    continue; // Empty string is valid (treated as null)
                }
                // Try to parse as number to catch obviously invalid formats early
                const parsed = parseFloat(trimmed);
                if (isNaN(parsed) && trimmed.toLowerCase() !== 'n/a' && trimmed.toLowerCase() !== 'na') {
                    // Allow expressions like "2*pi", "pi/4", etc. - these will be parsed later
                    // Only reject if it's clearly not a number and not a known special value
                    if (!/^[0-9+\-*/().\sπpie]+$/i.test(trimmed)) {
                        throw new CalculationError(
                            `Invalid number format for variable '${symbol}': "${value}". Expected a number or mathematical expression.`,
                            {
                                step: 'Input validation',
                                formulaId: formula.id,
                                variable: symbol,
                                value: value,
                                expectedFormat: 'number or mathematical expression'
                            }
                        );
                    }
                }
            }
        }
        
        // Units mismatch detection (basic check)
        for (const varDef of formula.variables) {
            const symbol = varDef.symbol;
            const value = variableValues[symbol];
            if (value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== 'n/a') {
                if (varDef.unit && typeof value === 'string' && value.includes(' ')) {
                    const parts = value.split(' ');
                    const providedUnit = parts.slice(1).join(' ');
                    if (providedUnit && providedUnit !== varDef.unit) {
                        // Log warning - unit conversion may handle it, but flag potential issue
                        console.warn(
                            `[InputValidator] Potential unit mismatch for '${symbol}': formula expects '${varDef.unit}', provided '${providedUnit}'. ` +
                            `Unit conversion will be attempted, but verify the result.`
                        );
                    }
                }
            }
        }
    }
}

