/**
 * Solver Methods - TypeScript implementations
 * All individual formula solvers converted from calculator.js
 */

import { SolverValidator } from '../SolverValidator';
import { VariableNormalizer } from '../VariableNormalizer';
import { CalculationError } from '../CalculationError';
import { SafeMathEvaluator } from '../SafeMathEvaluator';

// Global constants (will be injected)
declare const globalConstants: Record<string, number>;

/**
 * Solver function type
 */
export type SolverFunction = (this: any, unknownVar: string, vars: Record<string, number>) => number;

/**
 * All solver implementations
 */
export const solvers: Record<string, SolverFunction> = {
    kepler_third_law: function(unknownVar: string, vars: Record<string, number>): number {
        const { T, a, M, G } = vars;
        
        if (unknownVar === 'T') {
            // T = √((4π²/GM) × a³)
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            SolverValidator.checkNonZero(M, 'M (mass)');
            SolverValidator.checkPositive(a, 'a (semi-major axis)');
            const denominator = G * M;
            SolverValidator.checkNonZero(denominator, 'G × M');
            const result = Math.sqrt(SolverValidator.safeDivide(4 * Math.PI * Math.PI, denominator, 'G × M') * (a * a * a));
            SolverValidator.checkPositive(result, 'T (period)');
            return SolverValidator.validateResult(result, 'Kepler Third Law (T = √((4π²/GM) × a³))');
        } else if (unknownVar === 'a') {
            // a = ∛(T² × GM / 4π²)
            SolverValidator.checkPositive(T, 'T (period)');
            SolverValidator.checkPositive(M, 'M (mass)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = T * T * G * M;
            const result = Math.cbrt(SolverValidator.safeDivide(numerator, 4 * Math.PI * Math.PI, '4π²'));
            SolverValidator.checkPositive(result, 'a (semi-major axis)');
            return SolverValidator.validateResult(result, 'Kepler Third Law (a = ∛(T² × GM / 4π²))');
        } else if (unknownVar === 'M') {
            // M = (4π² × a³) / (G × T²)
            SolverValidator.checkPositive(T, 'T (period)');
            SolverValidator.checkPositive(a, 'a (semi-major axis)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = 4 * Math.PI * Math.PI * a * a * a;
            const denominator = G * T * T;
            SolverValidator.checkNonZero(denominator, 'G × T²');
            const result = SolverValidator.safeDivide(numerator, denominator, 'G × T²');
            SolverValidator.checkPositive(result, 'M (mass)');
            return SolverValidator.validateResult(result, 'Kepler Third Law (M = (4π² × a³) / (G × T²))');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Kepler's Third Law`);
    },

    orbital_velocity: function(unknownVar: string, vars: Record<string, number>): number {
        const { v, r, M, G } = vars;
        
        if (unknownVar === 'v') {
            // v = √(GM/r)
            SolverValidator.checkPositive(r, 'r (radius)');
            SolverValidator.checkPositive(M, 'M (mass)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = G * M;
            const result = Math.sqrt(SolverValidator.safeDivide(numerator, r, 'r (radius)'));
            SolverValidator.checkPositive(result, 'v (orbital velocity)');
            return SolverValidator.validateResult(result, 'Orbital Velocity (v = √(GM/r))');
        } else if (unknownVar === 'r') {
            // r = GM/v²
            SolverValidator.checkPositive(v, 'v (orbital velocity)');
            SolverValidator.checkPositive(M, 'M (mass)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = G * M;
            const denominator = v * v;
            SolverValidator.checkNonZero(denominator, 'v²');
            const result = SolverValidator.safeDivide(numerator, denominator, 'v²');
            SolverValidator.checkPositive(result, 'r (radius)');
            return SolverValidator.validateResult(result, 'Orbital Velocity (r = GM/v²)');
        } else if (unknownVar === 'M') {
            // M = rv²/G
            SolverValidator.checkPositive(r, 'r (radius)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = r * v * v;
            const result = SolverValidator.safeDivide(numerator, G, 'G (gravitational constant)');
            SolverValidator.checkPositive(result, 'M (mass)');
            return SolverValidator.validateResult(result, 'Orbital Velocity (M = rv²/G)');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Orbital Velocity`);
    },

    escape_velocity: function(unknownVar: string, vars: Record<string, number>): number {
        const { v_esc, r, M, G } = vars;
        
        if (unknownVar === 'v_esc') {
            // v_esc = √(2GM/r)
            SolverValidator.checkPositive(r, 'r (radius)');
            SolverValidator.checkPositive(M, 'M (mass)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = 2 * G * M;
            const result = Math.sqrt(SolverValidator.safeDivide(numerator, r, 'r (radius)'));
            SolverValidator.checkPositive(result, 'v_esc (escape velocity)');
            return SolverValidator.validateResult(result, 'Escape Velocity (v_esc = √(2GM/r))');
        } else if (unknownVar === 'r') {
            // r = 2GM/v_esc²
            SolverValidator.checkPositive(v_esc, 'v_esc (escape velocity)');
            SolverValidator.checkPositive(M, 'M (mass)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = 2 * G * M;
            const denominator = v_esc * v_esc;
            SolverValidator.checkNonZero(denominator, 'v_esc²');
            const result = SolverValidator.safeDivide(numerator, denominator, 'v_esc²');
            SolverValidator.checkPositive(result, 'r (radius)');
            return SolverValidator.validateResult(result, 'Escape Velocity (r = 2GM/v_esc²)');
        } else if (unknownVar === 'M') {
            // M = rv_esc²/(2G)
            SolverValidator.checkPositive(r, 'r (radius)');
            SolverValidator.checkPositive(v_esc, 'v_esc (escape velocity)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = r * v_esc * v_esc;
            const result = SolverValidator.safeDivide(numerator, 2 * G, '2G');
            SolverValidator.checkPositive(result, 'M (mass)');
            return SolverValidator.validateResult(result, 'Escape Velocity (M = rv_esc²/(2G))');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Escape Velocity`);
    }
};

