/**
 * SearchEngine - Orchestrates search with caching and filtering
 * Separated concerns: scoring, caching, filtering
 */
import { FormulaScorer } from './Scorer.js';
export class SearchEngine {
    constructor(options) {
        this.formulas = options.formulas;
        this.scorer = new FormulaScorer(options.formulaCategories);
        this.cache = options.cache;
        this.performanceOptimizer = options.performanceOptimizer;
        this.semanticSearchSystem = options.semanticSearchSystem;
        // Version for cache key invalidation
        this.version = options.version || 'v2.2.0';
    }

    normalizeQuery(searchTerm) {
        return String(searchTerm || '')
            .replace(/[\u0000-\u001f\u007f]+/g, ' ')
            .replace(/[<>`]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 300);
    }

    updateFormulas(formulas) {
        this.formulas = formulas;
    }
    /**
     * Search formulas with caching and filtering
     */
    search(searchTerm) {
        // Input validation
        const normalizedSearchTerm = this.normalizeQuery(searchTerm);
        if (!normalizedSearchTerm) {
            return this.getEmptyResults(50);
        }
        if (!this.formulas?.length) {
            return [];
        }
        try {
            // 1. Check cache
            const cached = this.getCachedResults(normalizedSearchTerm);
            if (cached) {
                return cached;
            }
            // 2. Fast filter (early exit for performance)
            const candidates = this.fastFilter(normalizedSearchTerm);
            // 3. Score candidates
            const results = this.performSearch(candidates, normalizedSearchTerm);
            // 4. Cache results
            this.cacheResults(normalizedSearchTerm, results);
            return results;
        }
        catch (error) {
            console.error('[SearchEngine] Search failed:', error);
            return [];
        }
    }
    /**
     * Fast filter - quick name/concept/variable check before expensive scoring
     * Upgraded v2.1.0: Now includes variable matching for better recall
     */
    fastFilter(query) {
        const queryLower = this.normalizeQuery(query).toLowerCase();
        const words = queryLower.split(/\s+/).filter(w => w.length > 0);
        return this.formulas.filter(f => {
            const nameLower = f.name.toLowerCase();
            
            // Name match
            if (nameLower.includes(queryLower) || words.some(w => nameLower.includes(w))) {
                return true;
            }
            
            // Concept match
            if (f.concepts?.some(c => {
                const cLower = c.toLowerCase();
                return cLower.includes(queryLower) || words.some(w => cLower.includes(w));
            })) {
                return true;
            }

            // Keyword match
            if (f.keywords?.some(keyword => {
                const keywordLower = String(keyword || '').toLowerCase();
                return keywordLower.includes(queryLower) || words.some(w => keywordLower.includes(w));
            })) {
                return true;
            }

            // Question-pattern match
            if (f.questionPatterns?.some(pattern => {
                const patternLower = String(pattern || '').toLowerCase();
                return queryLower.includes(patternLower) ||
                    patternLower.includes(queryLower) ||
                    words.filter(w => w.length >= 3 && patternLower.includes(w)).length >= 2;
            })) {
                return true;
            }
            
            // Variable match (NEW v2.1.0)
            if (f.variables?.some(v => {
                const varSymbol = v.symbol?.toLowerCase() || '';
                const varName = v.name?.toLowerCase() || '';
                return varSymbol.includes(queryLower) || 
                       varName.includes(queryLower) ||
                       words.some(w => varSymbol.includes(w) || varName.includes(w));
            })) {
                return true;
            }

            // Description match as last fallback to improve recall on natural language questions
            if (f.description) {
                const descriptionLower = f.description.toLowerCase();
                return descriptionLower.includes(queryLower) ||
                    words.some(w => w.length >= 4 && descriptionLower.includes(w));
            }
            
            return false;
        });
    }
    /**
     * Perform search - pure search logic, no caching
     */
    performSearch(candidates, searchTerm) {
        const queryLower = this.normalizeQuery(searchTerm).toLowerCase();
        const searchWords = queryLower.split(/\s+/).filter(w => w.length > 0);
        // Score all candidates
        const scored = candidates.map(formula => {
            const result = this.scorer.score(formula, queryLower, searchWords);
            // Add semantic matching if available (capped at 400 to prevent overpowering)
            if (this.semanticSearchSystem) {
                try {
                    const semanticScore = this.semanticSearchSystem.semanticMatch(searchTerm, formula);
                    if (semanticScore && !isNaN(semanticScore) && semanticScore > 0) {
                        // Cap semantic contribution to prevent overpowering literal matches
                        const capped = Math.min(semanticScore, 400);
                        result.score += capped;
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
    /**
     * Minimum relevance gate - filters out noise
     * v2.1.0: Stricter inclusion logic to improve top-50 quality
     */
    shouldIncludeResult(item) {
        // Name matches always included (highest priority)
        if (item.metrics.nameMatch) {
            return true;
        }
        
        // Strong matches (concept, variable, semantic) must meet score floor
        const hasStrongMatch = item.metrics.conceptMatch || 
                              item.metrics.variableMatch || 
                              item.metrics.semanticMatch;
        
        if (hasStrongMatch && item.score >= 200) {
            return true;
        }
        
        // Soft matches (description, category) must meet higher floor
        return item.score >= 100;
    }
    /**
     * Log-normalization + percentile awareness
     * v2.1.0: Mathematically robust normalization that handles outliers
     */
    normalizeScores(results) {
        if (!results.length) return;
        
        const scores = results.map(r => r.score);
        const max = Math.max(...scores);
        const min = Math.min(...scores.filter(s => s > 0));
        
        // If all scores are 0, skip normalization
        if (max === 0) {
            results.forEach(r => {
                r.normalizedScore = 0;
                r.percentile = 0;
            });
            return;
        }
        
        results.forEach(r => {
            const raw = r.score;
            
            // Log squash to control outliers (log1p handles 0 gracefully)
            const logNorm = Math.log1p(raw) / Math.log1p(max);
            
            // Percentile (confidence-relevant) - how many results score <= this
            const rank = scores.filter(s => s <= raw).length / scores.length;
            
            r.normalizedScore = Math.round(logNorm * 1000);
            r.percentile = Math.round(rank * 100);
        });
    }
    /**
     * Convert scored result to search result with confidence metadata
     * v2.1.0: Attaches confidence metadata for UI explainability
     */
    toSearchResult(scored) {
        return {
            ...scored,
            normalizedScore: 0, // Will be normalized later
            percentile: 0, // Will be set during normalization
            confidenceMeta: {
                components: scored.metrics.componentScores || {},
                semantic: scored.metrics.semanticMatch || false,
                hasNameMatch: scored.metrics.nameMatch || false,
                hasStrongMatch: scored.metrics.conceptMatch || 
                               scored.metrics.variableMatch || 
                               scored.metrics.semanticMatch || false,
                formulaConfidence: scored.metrics.formulaConfidence || 85,
                confidenceTier: scored.metrics.confidenceTier || 'approximation',
                confidenceRationale: scored.metrics.confidenceRationale || ''
            }
        };
    }
    /**
     * Generate cache key with version/formula count for invalidation
     * v2.1.0: Prevents stale cache when weights/formulas change
     */
    getCacheKey(searchTerm) {
        const baseKey = this.normalizeQuery(searchTerm).toLowerCase();
        const formulaCount = this.formulas?.length || 0;
        return `${baseKey}::${this.version}::${formulaCount}`;
    }
    
    getCachedResults(searchTerm) {
        const key = this.getCacheKey(searchTerm);
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
        const key = this.getCacheKey(searchTerm);
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
            normalizedScore: 0,
            percentile: 0,
            confidenceMeta: {
                components: {},
                semantic: false,
                hasNameMatch: false,
                hasStrongMatch: false
            }
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
