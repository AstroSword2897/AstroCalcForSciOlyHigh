/**
 * Type-safe interfaces for search system dependencies
 */

import { Formula, SearchMetrics } from '../../../types/formula';

export interface SearchResult {
    formula: Formula;
    score: number;
    metrics: SearchMetrics;
    topicRelevanceScore: number;
    contextScore: number;
    normalizedScore: number;
}

export interface SearchCache {
    get(key: string): SearchResult[] | null;
    set(key: string, value: SearchResult[]): void;
    clear(): void;
}

export interface SemanticSearchSystem {
    semanticMatch(query: string, formula: Formula): number;
    trackUsage(term: string): void;
    getDynamicWeight(term: string): number | null;
}

export interface PerformanceOptimizer {
    getCachedSearch(key: string): SearchResult[] | null;
    cacheSearch(key: string, results: SearchResult[]): void;
}

export interface ConceptHierarchy {
    [key: string]: {
        parent?: string;
        children?: string[];
        siblings?: string[];
        related?: string[];
    };
}

export interface SearchEngineOptions {
    formulas: Formula[];
    formulaCategories: Record<string, string[]>;
    conceptHierarchy?: ConceptHierarchy;
    cache?: SearchCache;
    performanceOptimizer?: PerformanceOptimizer;
    semanticSearchSystem?: SemanticSearchSystem;
}

