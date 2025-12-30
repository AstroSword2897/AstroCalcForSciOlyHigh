/**
 * SearchEngine - Complete search functionality extracted from ui.js
 * Handles all search logic, scoring, and filtering
 */
import { Formula, SearchMetrics } from '../../types/formula';
export interface SearchResult {
    formula: Formula;
    score: number;
    metrics: SearchMetrics;
    topicRelevanceScore: number;
    contextScore: number;
    normalizedScore: number;
}
export interface ParsedQuery {
    intent: string | null;
    actions: string[];
    concepts: string[];
    target: string | null;
    source: string | null;
}
export interface SearchEngineOptions {
    formulas: Formula[];
    formulaCategories: Record<string, string[]>;
    getConceptHierarchy?: () => any;
    searchCache?: any;
    performanceOptimizer?: any;
    semanticSearchSystem?: any;
    crossConceptReinforcement?: any;
    conceptMatchingSystem?: any;
}
export declare class SearchEngine {
    private formulas;
    private formulaCategories;
    private getConceptHierarchy?;
    private searchCache?;
    private performanceOptimizer?;
    private semanticSearchSystem?;
    private crossConceptReinforcement?;
    private conceptMatchingSystem?;
    constructor(options: SearchEngineOptions);
    /**
     * Update formulas list
     */
    updateFormulas(formulas: Formula[]): void;
    /**
     * Parse natural language query to extract intent and concepts
     */
    parseNaturalLanguageQuery(searchLower: string, searchWords: string[]): ParsedQuery;
    /**
     * Calculate search score for a formula
     */
    calculateSearchScore(formula: Formula, searchLower: string, searchWords: string[]): {
        score: number;
        metrics: SearchMetrics;
        topicRelevanceScore?: number;
        contextScore?: number;
    };
    /**
     * Search formulas with scoring
     */
    search(searchTerm: string): SearchResult[];
    /**
     * Create empty metrics object
     */
    private createEmptyMetrics;
}
export declare function createSearchEngine(options: SearchEngineOptions): SearchEngine;
