/**
 * SearchEngine - Orchestrates search with caching and filtering
 * Separated concerns: scoring, caching, filtering
 */
import { FormulaScorer } from './Scorer';
export class SearchEngine {
    constructor(options) {
        this.formulas = options.formulas;
        this.scorer = new FormulaScorer(options.formulaCategories);
        this.cache = options.cache;
        this.performanceOptimizer = options.performanceOptimizer;
        this.semanticSearchSystem = options.semanticSearchSystem;
    }
    updateFormulas(formulas) {
        this.formulas = formulas;
    }
    /**
     * Search formulas with caching and filtering
     */
    search(searchTerm) {
        // Input validation
        if (!searchTerm?.trim()) {
            return this.getEmptyResults(50);
        }
        if (!this.formulas?.length) {
            return [];
        }
        try {
            // 1. Check cache
            const cached = this.getCachedResults(searchTerm);
            if (cached) {
                return cached;
            }
            // 2. Fast filter (early exit for performance)
            const candidates = this.fastFilter(searchTerm);
            // 3. Score candidates
            const results = this.performSearch(candidates, searchTerm);
            // 4. Cache results
            this.cacheResults(searchTerm, results);
            return results;
        }
        catch (error) {
            console.error('[SearchEngine] Search failed:', error);
            return [];
        }
    }
    /**
     * Fast filter - quick name/concept check before expensive scoring
     */
    fastFilter(query) {
        const queryLower = query.toLowerCase();
        const words = queryLower.split(/\s+/).filter(w => w.length > 0);
        return this.formulas.filter(f => {
            const nameLower = f.name.toLowerCase();
            const hasNameMatch = nameLower.includes(queryLower) ||
                words.some(w => nameLower.includes(w));
            const hasConceptMatch = f.concepts?.some(c => c.toLowerCase().includes(queryLower) ||
                words.some(w => c.toLowerCase().includes(w)));
            return hasNameMatch || hasConceptMatch;
        });
    }
    /**
     * Perform search - pure search logic, no caching
     */
    performSearch(candidates, searchTerm) {
        const queryLower = searchTerm.toLowerCase().trim();
        const searchWords = queryLower.split(/\s+/).filter(w => w.length > 0);
        // Score all candidates
        const scored = candidates.map(formula => {
            const result = this.scorer.score(formula, queryLower, searchWords);
            // Add semantic matching if available
            if (this.semanticSearchSystem) {
                try {
                    const semanticScore = this.semanticSearchSystem.semanticMatch(searchTerm, formula);
                    if (semanticScore && !isNaN(semanticScore) && semanticScore > 0) {
                        result.score += semanticScore;
                        result.metrics.semanticMatch = true;
                    }
                }
                catch (e) {
                    // Ignore semantic matching errors
                }
            }
            return this.toSearchResult(result);
        });
        // Filter, sort, and limit
        const filtered = scored
            .filter(item => this.shouldIncludeResult(item))
            .sort((a, b) => b.score - a.score)
            .slice(0, 50);
        // Normalize scores
        this.normalizeScores(filtered);
        return filtered;
    }
    shouldIncludeResult(item) {
        if (item.metrics.nameMatch)
            return true;
        const hasStrongMatch = item.metrics.conceptMatch || item.metrics.variableMatch;
        const hasAnyMatch = item.metrics.descriptionMatch || item.metrics.categoryMatch;
        return item.score > 0 || hasStrongMatch || hasAnyMatch;
    }
    normalizeScores(results) {
        const maxScore = results.length > 0 ? results[0].score : 1;
        results.forEach(item => {
            item.normalizedScore = (item.score / maxScore) * 1000;
        });
    }
    toSearchResult(scored) {
        return {
            ...scored,
            normalizedScore: 0 // Will be normalized later
        };
    }
    getCachedResults(searchTerm) {
        const key = searchTerm.toLowerCase().trim();
        if (this.cache) {
            const cached = this.cache.get(key);
            if (cached)
                return cached;
        }
        if (this.performanceOptimizer) {
            const cached = this.performanceOptimizer.getCachedSearch(key);
            if (cached)
                return cached;
        }
        return null;
    }
    cacheResults(searchTerm, results) {
        const key = searchTerm.toLowerCase().trim();
        if (this.cache) {
            this.cache.set(key, results);
        }
        if (this.performanceOptimizer) {
            this.performanceOptimizer.cacheSearch(key, results);
        }
    }
    getEmptyResults(count) {
        return this.formulas.slice(0, count).map(formula => ({
            formula,
            score: 0,
            metrics: this.createEmptyMetrics(),
            topicRelevanceScore: 0,
            contextScore: 0,
            normalizedScore: 0
        }));
    }
    createEmptyMetrics() {
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
