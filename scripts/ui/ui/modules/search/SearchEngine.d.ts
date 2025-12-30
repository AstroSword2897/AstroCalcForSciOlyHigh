/**
 * SearchEngine - Orchestrates search with caching and filtering
 * Separated concerns: scoring, caching, filtering
 */
import { Formula } from '../../../types/formula';
import { SearchResult, SearchEngineOptions } from './interfaces';
export declare class SearchEngine {
    private formulas;
    private scorer;
    private cache?;
    private performanceOptimizer?;
    private semanticSearchSystem?;
    constructor(options: SearchEngineOptions);
    updateFormulas(formulas: Formula[]): void;
    /**
     * Search formulas with caching and filtering
     */
    search(searchTerm: string): SearchResult[];
    /**
     * Fast filter - quick name/concept check before expensive scoring
     */
    private fastFilter;
    /**
     * Perform search - pure search logic, no caching
     */
    private performSearch;
    private shouldIncludeResult;
    private normalizeScores;
    private toSearchResult;
    private getCachedResults;
    private cacheResults;
    private getEmptyResults;
    private createEmptyMetrics;
}
