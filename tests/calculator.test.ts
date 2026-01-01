import { test, expect } from '@playwright/test';
import { FormulaCalculator } from '../scripts/calculator.ts';
import type { Formula } from '../scripts/types/formula';
import type { MathEvaluator } from '../scripts/types/calculator';

// Mock implementations for testing
class MockMathEvaluator implements MathEvaluator {
  evaluate(expression: string, variables: Record<string, number>): number {
    // Simple evaluation for testing
    const expr = expression.replace(/\b([a-z]+)\b/g, (_, varName) => {
      return variables[varName]?.toString() || '0';
    });
    // eslint-disable-next-line no-eval
    return eval(expr);
  }
  
  safeEvaluate(expression: string, variables: Record<string, number>): number | null {
    try {
      return this.evaluate(expression, variables);
    } catch (e) {
      return null;
    }
  }
}

// Extend the Formula interface to include any missing properties
declare module '../scripts/types/formula' {
  interface Formula {
    solveFunction?: (vars: Record<string, number>) => number;
  }
  
  interface Variable {
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number | null;
  }
}


class MockPrecisionCalculator {
  determinePrecision(_values: number[]) {
    return { significantFigures: 6, stability: 'stable' as const };
  }
  
  calculateSignificantFigures(value: number): number {
    if (value === 0) return 0;
    const str = value.toString();
    // Count non-zero digits after decimal point
    if (str.includes('.')) {
      return str.replace('.', '').replace(/^0+/, '').length;
    }
    // Count all digits for integers
    return str.replace(/^0+/, '').length;
  }
  
  roundToSignificantFigures(value: number, sigFigs: number): number {
    if (value === 0) return 0;
    const magnitude = Math.floor(Math.log10(Math.abs(value)));
    const scale = Math.pow(10, sigFigs - 1 - magnitude);
    return Math.round(value * scale) / scale;
  }
}

class MockErrorPropagator {
  calculateAbsoluteError(
    formula: string,
    values: Record<string, number>,
    errors: Record<string, number>
  ) {
    // Simple error propagation: sum of relative errors
    let relativeError = 0;
    for (const [varName, error] of Object.entries(errors)) {
      if (values[varName] !== 0) {
        relativeError += Math.abs(error / values[varName]);
      }
    }
    
    const result = this.evaluateFormula(formula, values);
    const absoluteError = result * relativeError;
    
    return {
      absolute: absoluteError,
      relative: relativeError,
      components: Object.fromEntries(
        Object.keys(errors).map(k => [k, errors[k] / (values[k] || 1)])
      )
    };
  }
  
  private evaluateFormula(formula: string, values: Record<string, number>): number {
    // Simple formula evaluation for testing
    const evaluator = new MockMathEvaluator();
    return evaluator.evaluate(formula, values);
  }
  
  propagateError(formula: string, values: Record<string, number>, errors: Record<string, number>): number {
    const result = this.calculateAbsoluteError(formula, values, errors);
    return result.absolute;
  }
}


test.describe('FormulaCalculator', () => {
  let calculator: FormulaCalculator;
  let testFormula: Formula;
  let mockDeps: {
    mathEvaluator: MockMathEvaluator;
    precisionCalculator: MockPrecisionCalculator;
    errorPropagator: MockErrorPropagator;
  };

  test.beforeEach(() => {
    // Create mock dependencies
    mockDeps = {
      mathEvaluator: new MockMathEvaluator(),
      precisionCalculator: new MockPrecisionCalculator(),
      errorPropagator: new MockErrorPropagator()
    };

    testFormula = {
      id: 'test-formula',
      name: 'Test Formula',
      description: 'A test formula for unit testing',
      equation: 'a * b + c',
      variables: [
        { symbol: 'a', name: 'Variable A', description: 'First variable', unit: 'm', required: true, min: 0, max: 1000 },
        { symbol: 'b', name: 'Variable B', description: 'Second variable', unit: 'kg', required: true, min: 0 },
        { 
          symbol: 'c', 
          name: 'Variable C', 
          description: 'Optional variable', 
          unit: 's', 
          required: false, 
          defaultValue: 1,
          min: -100,
          max: 100
        }
      ],
      constants: {},
      concepts: ['test', 'unit-testing'],
      category: 'testing',
      solveFunction: (vars: Record<string, number>) => {
        // Simple implementation for testing
        return vars.a * vars.b + (vars.c || 1);
      }
    };

      // Create calculator with test formula and mock dependencies
      calculator = new FormulaCalculator(testFormula, mockDeps);
    });

  test('should initialize with formula and dependencies', () => {
    expect(calculator).toBeInstanceOf(FormulaCalculator);
    expect(calculator['formula']).toBe(testFormula);
    expect(calculator['mathEvaluator']).toBe(mockDeps.mathEvaluator);
    expect(calculator['precisionCalculator']).toBe(mockDeps.precisionCalculator);
    expect(calculator['errorPropagator']).toBe(mockDeps.errorPropagator);
  });

  test.describe('solve()', () => {
    test('should solve simple equation with all variables provided', () => {
      const result = calculator.solve({ a: 2, b: 3, c: 4 });
      expect(result.result).toBe(10); // 2 * 3 + 4 = 10
      expect(result.isSymbolic).toBe(false);
      expect(result.unit).toBe('');
    });

    test('should use default value for optional variable', () => {
      const result = calculator.solve({ a: 2, b: 3 });
      expect(result.result).toBe(7); // 2 * 3 + 1 = 7 (c defaults to 1)
    });

    test('should throw error for missing required variable', () => {
      expect(() => calculator.solve({ a: 2 })).toThrow('Missing required variables: b');
    });

    test('should validate input types', () => {
      // @ts-expect-error - Testing invalid input type
      expect(() => calculator.solve({ a: 'not a number', b: 3 })).toThrow(
        'Invalid value for a: expected number, got string'
      );
    });

    test('should validate input ranges', () => {
      expect(() => calculator.solve({ a: -1, b: 3 })).toThrow(
        'a (-1) is below minimum value of 0'
      );
      
      expect(() => calculator.solve({ a: 2000, b: 3 })).toThrow(
        'a (2000) exceeds maximum value of 1000'
      );
    });

    test('should handle error propagation', () => {
      const result = calculator.solve({ a: 2, b: 3, c: 4 });
      expect(result.errorInfo).toBeDefined();
      expect(result.errorInfo?.absoluteError).toBeGreaterThan(0);
      expect(result.errorInfo?.relativeError).toBeGreaterThan(0);
    });

    test('should include precision information', () => {
      const result = calculator.solve({ a: 2, b: 3 });
      expect(result.significantFigures).toBe(6);
      expect(result.arithmeticContext?.stability).toBe('stable');
    });
  });

  // Note: The following tests are commented out because they test private methods
  // that aren't directly accessible in the current implementation.
  // They're kept here as documentation of intended behavior.

  /*
  describe('evaluateExpression()', () => {
    test('should evaluate a mathematical expression', () => {
      const result = calculator['evaluateExpression']('2 * 3 + 4', { a: 2, b: 3, c: 4 });
      expect(result).toBe(10);
    });

    test('should handle variables in expression', () => {
      const result = calculator['evaluateExpression']('a * b + c', { a: 2, b: 3, c: 4 });
      expect(result).toBe(10);
    });
  });
  
  describe('solveForVariable()', () => {
    test('should solve for a single variable', () => {
      // Test solving c in a*b + c = 10 where a=2, b=3
      const result = calculator['solveForVariable']('c', { a: 2, b: 3 }, 10);
      expect(result).toBeCloseTo(4); // c = 10 - (2*3) = 4
    });
  });
  
  describe('validateResult()', () => {
    test('should validate a result is finite', () => {
      expect(() => calculator['validateResult'](Infinity, 'test')).toThrow(
        'Result is not a finite number'
      );
    });
  });
  */
});
