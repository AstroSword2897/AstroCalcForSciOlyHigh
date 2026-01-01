/**
 * Formula Database for Science Olympiad Astronomy
 * Converted to TypeScript with ES module exports
 */

import { Formula } from './types/formula';

// Global physical constants (used across all formulas)
export const globalConstants: Record<string, number> = {
    G: 6.67430e-11,           // Gravitational constant in m³/(kg·s²)
    c: 2.99792458e8,          // Speed of light in m/s
    σ: 5.670374419e-8,       // Stefan-Boltzmann constant in W/(m²·K⁴)
    sigma: 5.670374419e-8,    // Alternative name for Stefan-Boltzmann constant
    h: 6.62607015e-34,        // Planck constant in J·s
    k: 1.380649e-23,          // Boltzmann constant in J/K
    e: 1.602176634e-19,       // Elementary charge in C
    m_e: 9.1093837015e-31,   // Electron mass in kg
    σ_T: 6.6524587158e-29,    // Thomson cross-section in m²
    L_sun: 3.828e26,          // Solar luminosity in W
    M_sun: 1.989e30,          // Solar mass in kg
    R_sun: 6.96e8,            // Solar radius in m
    AU: 1.496e11,             // Astronomical Unit in m
    pi: Math.PI,              // Pi
    π: Math.PI                // Pi (Greek letter)
};

// Import formulas from the JS file (will be migrated gradually)
// For now, we access the global variable
declare global {
    interface Window {
        formulas: Formula[];
        formulaCategories: Record<string, string[]>;
        globalConstants?: Record<string, number>;
    }
}

// Re-export formulas (loaded via script tag in index.html)
// In the future, formulas will be defined directly in this file
export const formulas: Formula[] = typeof window !== 'undefined' && window.formulas
    ? window.formulas
    : (globalThis as any).formulas || [];

// Formula categories mapping
export const formulaCategories: Record<string, string[]> = typeof window !== 'undefined' && window.formulaCategories
    ? window.formulaCategories
    : (globalThis as any).formulaCategories || {};

// globalConstants is already exported above, no need to re-export

