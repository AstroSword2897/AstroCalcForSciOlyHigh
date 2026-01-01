/**
 * SearchEngine - IMPROVED VERSION
 * Better performance, error handling, and architecture
 */

import { Formula } from '../../../types/formula';
import { SearchResult, SearchEngineOptions, SearchCache, SemanticSearchSystem, PerformanceOptimizer } from './interfaces';
import { FormulaScorer, ScoredResult } from './Scorer';

export class SearchEngine {
    private formulas: Formula[];
    private scorer: FormulaScorer;
    private cache?: SearchCache;
    private performanceOptimizer?: PerformanceOptimizer;
    private semanticSearchSystem?: SemanticSearchSystem;
    private searchHistory: string[] = [];
    private readonly MAX_HISTORY = 50;
    private readonly MAX_RESULTS = 50;

    constructor(options: SearchEngineOptions) {
        this.formulas = options.formulas;
        this.scorer = new FormulaScorer(options.formulaCategories);
        this.cache = options.cache;
        this.performanceOptimizer = options.performanceOptimizer;
        this.semanticSearchSystem = options.semanticSearchSystem;
    }

    updateFormulas(formulas: Formula[]): void {
        this.formulas = formulas;
        // Clear cache when formulas change
        if (this.cache) {
            this.cache.clear();
        }
    }

    /**
     * Search formulas with improved performance and error handling
     */
    search(searchTerm: string): SearchResult[] {
        // Input validation
        if (!searchTerm?.trim()) {
            return this.getEmptyResults(this.MAX_RESULTS);
        }

        if (!this.formulas?.length) {
            console.warn('[SearchEngine] No formulas available');
            return [];
        }

        try {
            const normalizedQuery = searchTerm.toLowerCase().trim();
            
            // Track search history
            this.addToHistory(normalizedQuery);

            // 1. Check cache (with validation)
            const cached = this.getCachedResults(normalizedQuery);
            if (cached && this.validateCachedResults(cached)) {
                return cached;
            }

            // 2. Fast filter (early exit for performance)
            const candidates = this.fastFilter(normalizedQuery);
            if (candidates.length === 0) {
                return [];
            }

            // 3. Score candidates (with progress tracking for large datasets)
            const results = this.performSearch(candidates, normalizedQuery, searchTerm);

            // 4. Cache results
            this.cacheResults(normalizedQuery, results);

            return results;
        } catch (error) {
            console.error('[SearchEngine] Search failed:', error);
            // Return empty results instead of throwing
            return [];
        }
    }

    /**
     * Fast filter - optimized for performance
     */
    private fastFilter(query: string): Formula[] {
        const queryLower = query.toLowerCase();
        const words = queryLower.split(/\s+/).filter(w => w.length > 0);
        const candidates: Formula[] = [];

        // Use for loop for better performance
        for (let i = 0; i < this.formulas.length; i++) {
            const formula = this.formulas[i];
            const nameLower = formula.name.toLowerCase();
            
            // Quick name check
            if (nameLower.includes(queryLower) || 
                words.some(w => nameLower.includes(w))) {
                candidates.push(formula);
                continue;
            }

            // Quick concept check
            if (formula.concepts?.some(c => {
                const conceptLower = c.toLowerCase();
                return conceptLower.includes(queryLower) ||
                       words.some(w => conceptLower.includes(w));
            })) {
                candidates.push(formula);
            }
        }

        return candidates;
    }

    /**
     * Perform search with improved error handling
     */
    private performSearch(
        candidates: Formula[],
        queryLower: string,
        originalQuery: string
    ): SearchResult[] {
        const searchWords = queryLower.split(/\s+/).filter(w => w.length > 0);
        const scored: SearchResult[] = [];

        // Score all candidates
        for (let i = 0; i < candidates.length; i++) {
            const formula = candidates[i];
            try {
                const result = this.scorer.score(formula, queryLower, searchWords);
                
                // Add semantic matching if available
                if (this.semanticSearchSystem) {
                    try {
                        const semanticScore = this.semanticSearchSystem.semanticMatch(originalQuery, formula);
                        if (semanticScore && !isNaN(semanticScore) && semanticScore > 0) {
                            result.score += semanticScore;
                            result.metrics.semanticMatch = true;
                        }
                    } catch (e) {
                        // Ignore semantic matching errors
                    }
                }

                scored.push(this.toSearchResult(result));
            } catch (error) {
                console.warn(`[SearchEngine] Error scoring formula ${formula.id}:`, error);
                // Continue with other formulas
            }
        }

        // Filter, sort, and limit
        const filtered = scored
            .filter(item => this.shouldIncludeResult(item))
            .sort((a, b) => b.score - a.score)
            .slice(0, this.MAX_RESULTS);

        // Normalize scores
        this.normalizeScores(filtered);

        return filtered;
    }

    private shouldIncludeResult(item: SearchResult): boolean {
        if (item.metrics.nameMatch) return true;
        const hasStrongMatch = item.metrics.conceptMatch || item.metrics.variableMatch;
        const hasAnyMatch = item.metrics.descriptionMatch || item.metrics.categoryMatch;
        return item.score > 0 || hasStrongMatch || hasAnyMatch;
    }

    private normalizeScores(results: SearchResult[]): void {
        if (results.length === 0) return;
        
        const maxScore = results[0].score || 1;
        for (let i = 0; i < results.length; i++) {
            results[i].normalizedScore = (results[i].score / maxScore) * 1000;
        }
    }

    private toSearchResult(scored: ScoredResult): SearchResult {
        return {
            ...scored,
            normalizedScore: 0 // Will be normalized later
        };
    }

    private getCachedResults(searchTerm: string): SearchResult[] | null {
        const key = searchTerm.toLowerCase().trim();
        
        if (this.cache) {
            const cached = this.cache.get(key);
            if (cached) return cached;
        }

        if (this.performanceOptimizer) {
            const cached = this.performanceOptimizer.getCachedSearch(key);
            if (cached) return cached;
        }

        return null;
    }

    private validateCachedResults(results: SearchResult[]): boolean {
        // Validate cached results are still valid
        if (!Array.isArray(results)) return false;
        if (results.length === 0) return true; // Empty is valid
        
        // Check first result structure
        const first = results[0];
        return first && 
               first.formula && 
               typeof first.score === 'number' &&
               !!first.metrics;
    }

    private cacheResults(searchTerm: string, results: SearchResult[]): void {
        const key = searchTerm.toLowerCase().trim();

        if (this.cache) {
            try {
                this.cache.set(key, results);
            } catch (e) {
                console.warn('[SearchEngine] Cache set failed:', e);
            }
        }

        if (this.performanceOptimizer) {
            try {
                this.performanceOptimizer.cacheSearch(key, results);
            } catch (e) {
                console.warn('[SearchEngine] Performance optimizer cache failed:', e);
            }
        }
    }

    private addToHistory(query: string): void {
        // Remove if already exists
        const index = this.searchHistory.indexOf(query);
        if (index > -1) {
            this.searchHistory.splice(index, 1);
        }
        
        // Add to front
        this.searchHistory.unshift(query);
        
        // Limit history size
        if (this.searchHistory.length > this.MAX_HISTORY) {
            this.searchHistory = this.searchHistory.slice(0, this.MAX_HISTORY);
        }
    }

    getSearchHistory(): string[] {
        return [...this.searchHistory];
    }

    private getEmptyResults(count: number): SearchResult[] {
        const limit = Math.min(count, this.formulas.length);
        return this.formulas.slice(0, limit).map(formula => ({
            formula,
            score: 0,
            metrics: this.createEmptyMetrics(),
            topicRelevanceScore: 0,
            contextScore: 0,
            normalizedScore: 0
        }));
    }

    private createEmptyMetrics() {
        return {
            nameMatch: false,
            descriptionMatch: false,
            equationMatch: false,
            variableMatch: false,
            conceptMatch: false,
            questionPatternMatch: false,
            categoryMatch: false,
            matchedConcepts: [],
            matchedVariables: [],
            matchReasons: [],
            originalConcepts: [],
            expandedConcepts: [],
            semanticMatch: false,
            synonymMatch: false,
            dynamicBoost: 0,
            intentMatch: false,
            targetMatch: false,
            sourceMatch: false
        };
    }
}

