/**
 * Type definitions for Calculator module dependencies
 */

import type { Formula } from './formula';

export interface PrecisionCalculator {
  calculateSignificantFigures(value: number): number;
  determinePrecision(values: number[]): { significantFigures: number; stability: 'stable' | 'unstable' | 'marginal' };
}

export interface ErrorPropagator {
  calculateAbsoluteError(
    formula: string,
    values: Record<string, number>,
    errors: Record<string, number>
  ): { absolute: number; relative: number; components: Record<string, number> };
}

export interface UnitConverter {
  convert(value: number, fromUnit: string, toUnit: string): number;
  getCompatibleUnits(unit: string): string[];
  isCompatible(unit1: string, unit2: string): boolean;
}

export interface MathEvaluator {
  evaluate(expression: string, variables?: Record<string, number>): number;
  safeEvaluate(expression: string, variables?: Record<string, number>): number | null;
}

export interface CalculationContext {
  formula: Formula;
  variableValues: Record<string, number | null>;
  unknownVars: string[];
  knownVars: Record<string, number>;
  constants: Record<string, number>;
  precision?: number;
  maxIterations?: number;
  tolerance?: number;
}

export interface SolverOptions {
  maxIterations?: number;
  tolerance?: number;
  initialGuess?: number;
  precision?: number;
}

export interface SolverResult {
  result: number;
  iterations: number;
  converged: boolean;
  error?: string;
}

export type SolverFunction = (
  equation: string,
  targetVar: string,
  knownVars: Record<string, number>,
  options?: SolverOptions
) => SolverResult | null;
