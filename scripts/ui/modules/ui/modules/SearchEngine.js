/**
 * SearchEngine - Complete search functionality extracted from ui.js
 * Handles all search logic, scoring, and filtering
 */
export class SearchEngine {
    constructor(options) {
        this.formulas = options.formulas;
        this.formulaCategories = options.formulaCategories;
        this.getConceptHierarchy = options.getConceptHierarchy;
        this.searchCache = options.searchCache;
        this.performanceOptimizer = options.performanceOptimizer;
        this.semanticSearchSystem = options.semanticSearchSystem;
        this.crossConceptReinforcement = options.crossConceptReinforcement;
        this.conceptMatchingSystem = options.conceptMatchingSystem;
    }
    /**
     * Update formulas list
     */
    updateFormulas(formulas) {
        this.formulas = formulas;
    }
    /**
     * Parse natural language query to extract intent and concepts
     */
    parseNaturalLanguageQuery(searchLower, searchWords) {
        const result = {
            intent: null,
            actions: [],
            concepts: [],
            target: null,
            source: null
        };
        // Detect intent
        const intentPatterns = {
            calculate: /\b(calculate|compute|find|determine|solve|work out|figure out)\b/i,
            find: /\b(find|locate|search for|look for)\b/i,
            determine: /\b(determine|identify|establish)\b/i,
            convert: /\b(convert|transform|change|translate)\b/i,
            relate: /\b(relate|connect|link|associate)\b/i
        };
        for (const [intent, pattern] of Object.entries(intentPatterns)) {
            if (pattern.test(searchLower)) {
                result.intent = intent;
                break;
            }
        }
        // Extract action verbs
        const actionVerbs = ['calculate', 'find', 'determine', 'convert', 'solve', 'compute'];
        searchWords.forEach(word => {
            if (actionVerbs.includes(word.toLowerCase())) {
                result.actions.push(word.toLowerCase());
            }
        });
        // Extract concepts (physics/astronomy terms)
        const physicsTerms = [
            'velocity', 'speed', 'acceleration', 'force', 'energy', 'power', 'mass', 'density',
            'temperature', 'pressure', 'volume', 'distance', 'time', 'period', 'frequency',
            'wavelength', 'frequency', 'luminosity', 'magnitude', 'flux', 'intensity',
            'redshift', 'doppler', 'parallax', 'orbital', 'escape', 'kepler', 'gravitational',
            'stellar', 'planetary', 'binary', 'exoplanet', 'black hole', 'white dwarf',
            'neutron star', 'supernova', 'galaxy', 'cosmology', 'relativity'
        ];
        searchWords.forEach(word => {
            const wordLower = word.toLowerCase();
            if (physicsTerms.some(term => term.includes(wordLower) || wordLower.includes(term))) {
                if (!result.concepts.includes(wordLower)) {
                    result.concepts.push(wordLower);
                }
            }
        });
        // Extract target (what to find)
        const targetPatterns = [
            /\b(find|calculate|determine)\s+(?:the\s+)?([a-z\s]+?)(?:\s+for|\s+of|\s+in|$)/i,
            /\b(what is|what's)\s+(?:the\s+)?([a-z\s]+?)(?:\s+of|\s+for|$)/i
        ];
        for (const pattern of targetPatterns) {
            const match = searchLower.match(pattern);
            if (match && match[2]) {
                result.target = match[2].trim();
                break;
            }
        }
        return result;
    }
    /**
     * Calculate search score for a formula
     */
    calculateSearchScore(formula, searchLower, searchWords) {
        let score = 0;
        const nameLower = formula.name.toLowerCase();
        const descLower = formula.description.toLowerCase();
        const eqLower = formula.equation.toLowerCase();
        const metrics = {
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
        // Parse query
        const parsedQuery = this.parseNaturalLanguageQuery(searchLower, searchWords);
        metrics.originalConcepts = [...parsedQuery.concepts];
        // Exact name match (highest priority)
        if (nameLower === searchLower) {
            score += 10000;
            metrics.nameMatch = true;
        }
        else if (nameLower.includes(searchLower)) {
            score += 5000;
            metrics.nameMatch = true;
        }
        // Word-by-word matching in name
        searchWords.forEach(word => {
            if (word.length >= 3) {
                if (nameLower === word) {
                    score += 300;
                }
                else if (nameLower.startsWith(word)) {
                    score += 200;
                }
                else if (nameLower.includes(word)) {
                    score += 150;
                }
                const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
                if (wordRegex.test(nameLower)) {
                    score += 50;
                }
            }
        });
        // Description matching
        if (descLower.includes(searchLower)) {
            score += 150;
            metrics.descriptionMatch = true;
        }
        const commonWords = ['the', 'is', 'to', 'a', 'an', 'and', 'or', 'of', 'for', 'with', 'from', 'what', 'how', 'find', 'calculate'];
        searchWords.forEach(word => {
            if (word.length >= 3 && !commonWords.includes(word)) {
                if (descLower.includes(word)) {
                    const wordIndex = descLower.indexOf(word);
                    const positionWeight = wordIndex < descLower.length / 2 ? 30 : 20;
                    score += positionWeight;
                    metrics.descriptionMatch = true;
                }
            }
        });
        // Concept matching
        if (formula.concepts && Array.isArray(formula.concepts)) {
            formula.concepts.forEach(concept => {
                const conceptLower = concept.toLowerCase();
                if (conceptLower === searchLower) {
                    score += 400;
                    metrics.conceptMatch = true;
                    if (!metrics.matchedConcepts.includes(concept)) {
                        metrics.matchedConcepts.push(concept);
                    }
                }
                else if (conceptLower.includes(searchLower) || searchLower.includes(conceptLower)) {
                    score += 200;
                    metrics.conceptMatch = true;
                    if (!metrics.matchedConcepts.includes(concept)) {
                        metrics.matchedConcepts.push(concept);
                    }
                }
                searchWords.forEach(word => {
                    if (word.length >= 3 && conceptLower.includes(word)) {
                        score += 150;
                        metrics.conceptMatch = true;
                        if (!metrics.matchedConcepts.includes(concept)) {
                            metrics.matchedConcepts.push(concept);
                        }
                    }
                });
            });
        }
        // Variable matching
        formula.variables.forEach(v => {
            const varSymbol = v.symbol.toLowerCase();
            const varName = v.name.toLowerCase();
            if (varSymbol === searchLower) {
                score += 400;
                metrics.variableMatch = true;
                if (!metrics.matchedVariables.includes(v.symbol)) {
                    metrics.matchedVariables.push(v.symbol);
                }
            }
            else if (varSymbol.includes(searchLower)) {
                score += 180;
                metrics.variableMatch = true;
            }
            if (varName === searchLower) {
                score += 250;
                metrics.variableMatch = true;
                if (!metrics.matchedVariables.includes(v.symbol)) {
                    metrics.matchedVariables.push(v.symbol);
                }
            }
            else if (varName.includes(searchLower)) {
                score += 120;
                metrics.variableMatch = true;
            }
            searchWords.forEach(word => {
                if (word.length >= 2) {
                    if (varSymbol === word) {
                        score += 120;
                        metrics.variableMatch = true;
                    }
                    else if (varSymbol.includes(word)) {
                        score += 80;
                    }
                    if (varName.includes(word)) {
                        score += 50;
                        metrics.variableMatch = true;
                    }
                }
            });
        });
        // Category matching
        for (const [category, ids] of Object.entries(this.formulaCategories)) {
            if (ids.includes(formula.id)) {
                const categoryLower = category.toLowerCase();
                if (categoryLower === searchLower) {
                    score += 150;
                    metrics.categoryMatch = true;
                }
                else if (categoryLower.includes(searchLower)) {
                    score += 80;
                    metrics.categoryMatch = true;
                }
                break;
            }
        }
        // Ensure score is valid
        score = Math.max(0, score);
        if (isNaN(score)) {
            score = 0;
        }
        return { score, metrics };
    }
    /**
     * Search formulas with scoring
     */
    search(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return this.formulas.slice(0, 50).map(formula => ({
                formula,
                score: 0,
                metrics: this.createEmptyMetrics(),
                topicRelevanceScore: 0,
                contextScore: 0,
                normalizedScore: 0
            }));
        }
        const searchLower = searchTerm.toLowerCase().trim();
        const searchWords = searchLower.split(/\s+/).filter(w => w.length > 0);
        if (searchWords.length === 0) {
            return this.formulas.slice(0, 50).map(formula => ({
                formula,
                score: 0,
                metrics: this.createEmptyMetrics(),
                topicRelevanceScore: 0,
                contextScore: 0,
                normalizedScore: 0
            }));
        }
        // Check cache
        if (this.performanceOptimizer) {
            const cached = this.performanceOptimizer.getCachedSearch(searchLower);
            if (cached) {
                return cached;
            }
        }
        // Score all formulas
        const scoredFormulas = this.formulas.map(formula => {
            const { score, metrics } = this.calculateSearchScore(formula, searchLower, searchWords);
            // Add semantic matching if available
            if (this.semanticSearchSystem) {
                try {
                    const semanticScore = this.semanticSearchSystem.semanticMatch(searchTerm, formula);
                    if (semanticScore && !isNaN(semanticScore) && semanticScore > 0) {
                        metrics.semanticMatch = true;
                    }
                }
                catch (e) {
                    // Ignore errors
                }
            }
            return {
                formula,
                score: Math.max(0, score),
                metrics,
                topicRelevanceScore: 0,
                contextScore: 0,
                normalizedScore: 0
            };
        });
        // Filter and sort
        const filtered = scoredFormulas
            .filter(item => {
            if (item.metrics.nameMatch)
                return true;
            const hasStrongMatch = item.metrics.questionPatternMatch || item.metrics.conceptMatch;
            const hasAnyMatch = item.metrics.descriptionMatch || item.metrics.variableMatch || item.metrics.categoryMatch;
            return item.score > 0 || hasStrongMatch || hasAnyMatch;
        })
            .sort((a, b) => b.score - a.score)
            .slice(0, 50);
        // Normalize scores
        const maxScore = filtered.length > 0 ? filtered[0].score : 1;
        filtered.forEach(item => {
            item.normalizedScore = (item.score / maxScore) * 1000;
        });
        // Cache results
        if (this.performanceOptimizer) {
            this.performanceOptimizer.cacheSearch(searchLower, filtered);
        }
        return filtered;
    }
    /**
     * Create empty metrics object
     */
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
// Export singleton instance creator
export function createSearchEngine(options) {
    return new SearchEngine(options);
}
