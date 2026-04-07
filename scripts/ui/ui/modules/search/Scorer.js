/**
 * FormulaScorer - Pure scoring logic, no side effects
 * Version 2.1.0 - Rebalanced weights for improved concept/variable relevance
 */
import { matchesQuickReferenceQuery, QUICK_REFERENCE_FORMULA_IDS } from './quickReferenceBundle.js';
import { validateFormulaInputs } from '../formula/formulaValidator.js';

export class FormulaScorer {
    constructor(formulaCategories, config = null) {
        this.formulaCategories = formulaCategories;
        // Load config (either passed in or use defaults)
        this.config = config || this.getDefaultConfig();
    }
    
    getDefaultConfig() {
        // Default rebalanced weights (v2.1.0)
        return {
            name: {
                exactMatch: 3500,
                containsQuery: 1500,
                wordExactMatch: 300,
                wordStartsWith: 200,
                wordContains: 150
            },
            concept: {
                exactMatch: 600,
                containsOrOverlap: 250,
                wordMatch: 150
            },
            variable: {
                symbolExact: 500,
                symbolContains: 180,
                nameExact: 300,
                nameContains: 120,
                wordInSymbol: 120,
                wordInName: 50
            },
            description: {
                containsQuery: 150,
                wordMatch: 20,
                minWordLength: 3
            },
            keywords: {
                containsQuery: 280,
                wordMatch: 70
            },
            questionPatterns: {
                exactOrContains: 700,
                partialOverlap: 260
            },
            category: {
                exactMatch: 150,
                contains: 80
            },
            stopwords: ['the', 'is', 'to', 'a', 'an', 'and', 'or', 'of', 'for', 'with', 'from', 'in', 'per']
        };
    }
    
    /**
     * Score a formula against a search query
     * @param {Record<string, number|null|undefined>} [inputVars] optional current calculator inputs (base units) for validity-aware ranking
     */
    score(formula, query, words, inputVars) {
        const queryLower = query.toLowerCase();
        const metrics = this.createEmptyMetrics();
        metrics.formulaConfidence = formula.formulaConfidence || 85;
        metrics.confidenceTier = formula.confidenceTier || 'approximation';
        metrics.confidenceRationale = formula.confidenceRationale || '';
        metrics.generalizationScope = formula.generalizationScope || formula.confidence?.generalizationScope || '';
        metrics.confidenceScoreBreakdown = formula.confidenceScoreBreakdown || null;
        const scores = {
            name: this.scoreNameMatch(formula.name, queryLower, words),
            description: this.scoreDescriptionMatch(formula.description, queryLower, words),
            keywords: this.scoreKeywordMatch(formula.keywords || [], queryLower, words),
            questionPatterns: this.scoreQuestionPatternMatch(formula.questionPatterns || [], queryLower, words, metrics),
            concepts: this.scoreConceptMatch(formula.concepts || [], queryLower, words, metrics),
            variables: this.scoreVariableMatch(formula.variables, queryLower, words, metrics),
            category: this.scoreCategoryMatch(formula.id, queryLower, words)
        };
        
        // Update metrics based on scores
        if (scores.name > 0)
            metrics.nameMatch = true;
        if (scores.description > 0)
            metrics.descriptionMatch = true;
        if (scores.questionPatterns > 0)
            metrics.questionPatternMatch = true;
        if (scores.concepts > 0)
            metrics.conceptMatch = true;
        if (scores.variables > 0)
            metrics.variableMatch = true;
        if (scores.category > 0)
            metrics.categoryMatch = true;
        
        // Store component scores for explainability
        metrics.componentScores = scores;
        
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        const gc =
            typeof globalThis !== 'undefined' && globalThis.globalConstants && typeof globalThis.globalConstants === 'object'
                ? globalThis.globalConstants
                : {};
        let validityMul = 1;
        if (inputVars && typeof inputVars === 'object') {
            const hasNumeric = Object.values(inputVars).some((v) => typeof v === 'number' && Number.isFinite(v));
            if (hasNumeric) {
                const vr = validateFormulaInputs(formula, inputVars, gc);
                validityMul = vr.validitySearchMultiplier;
                metrics.validitySearchMultiplier = validityMul;
                if (vr.errors.length) metrics.validityErrors = vr.errors;
                if (vr.warnings.length) metrics.validityWarnings = vr.warnings;
            }
        }
        const weightedScore =
            totalScore > 0 ? Math.round(totalScore * (formula.searchWeight || 1) * validityMul) : 0;
        metrics.componentScores.reliabilityAdjustment = weightedScore - totalScore;

        let quickRefBoost = 0;
        if (matchesQuickReferenceQuery(queryLower) && QUICK_REFERENCE_FORMULA_IDS.has(formula.id)) {
            quickRefBoost = 450;
            metrics.questionPatternMatch = true;
        }
        metrics.componentScores.quickReferenceBoost = quickRefBoost;

        return {
            formula,
            score: Math.max(0, weightedScore + quickRefBoost),
            metrics,
            topicRelevanceScore: 0,
            contextScore: 0
        };
    }
    
    scoreNameMatch(name, query, words) {
        let score = 0;
        const nameLower = name.toLowerCase();
        const cfg = this.config.name;
        
        // Exact match (highest priority, but rebalanced)
        if (nameLower === query) {
            score += cfg.exactMatch; // 3500 (down from 10000)
        }
        else if (nameLower.includes(query)) {
            score += cfg.containsQuery; // 1500 (down from 5000)
        }
        
        // Word-by-word matching
        words.forEach(word => {
            if (word.length >= 3) {
                if (nameLower === word) {
                    score += cfg.wordExactMatch; // 300
                }
                else if (nameLower.startsWith(word)) {
                    score += cfg.wordStartsWith; // 200
                }
                else if (nameLower.includes(word)) {
                    score += cfg.wordContains; // 150
                }
            }
        });
        return score;
    }
    
    scoreDescriptionMatch(description, query, words) {
        let score = 0;
        const descLower = description.toLowerCase();
        const cfg = this.config.description;
        
        if (descLower.includes(query)) {
            score += cfg.containsQuery; // 150
        }
        
        words.forEach(word => {
            if (word.length >= cfg.minWordLength && !this.config.stopwords.includes(word)) {
                if (descLower.includes(word)) {
                    score += cfg.wordMatch; // 20
                }
            }
        });
        return score;
    }
    
    scoreConceptMatch(concepts, query, words, metrics) {
        let score = 0;
        const cfg = this.config.concept;
        const matched = [];
        
        concepts.forEach(concept => {
            const conceptLower = concept.toLowerCase();
            let conceptMatched = false;
            
            if (conceptLower === query) {
                score += cfg.exactMatch; // 600 (up from 400)
                conceptMatched = true;
            }
            else if (conceptLower.includes(query) || query.includes(conceptLower)) {
                score += cfg.containsOrOverlap; // 250 (up from 200)
                conceptMatched = true;
            }
            
            words.forEach(word => {
                if (word.length >= 3 && conceptLower.includes(word)) {
                    score += cfg.wordMatch; // 150
                    conceptMatched = true;
                }
            });
            
            if (conceptMatched) {
                matched.push(concept);
            }
        });
        
        if (metrics && matched.length > 0) {
            metrics.matchedConcepts = matched;
        }
        
        return score;
    }
    
    scoreVariableMatch(variables, query, words, metrics) {
        let score = 0;
        const cfg = this.config.variable;
        const matched = [];
        
        variables.forEach(v => {
            const varSymbol = v.symbol.toLowerCase();
            const varName = v.name.toLowerCase();
            let variableMatched = false;
            
            if (varSymbol === query) {
                score += cfg.symbolExact; // 500 (up from 400)
                variableMatched = true;
            }
            else if (varSymbol.includes(query)) {
                score += cfg.symbolContains; // 180
                variableMatched = true;
            }
            
            if (varName === query) {
                score += cfg.nameExact; // 300 (up from 250)
                variableMatched = true;
            }
            else if (varName.includes(query)) {
                score += cfg.nameContains; // 120
                variableMatched = true;
            }
            
            words.forEach(word => {
                if (word.length >= 2) {
                    if (varSymbol === word) {
                        score += cfg.wordInSymbol; // 120
                        variableMatched = true;
                    }
                    else if (varSymbol.includes(word)) {
                        score += 80; // Legacy behavior preserved
                        variableMatched = true;
                    }
                    if (varName.includes(word)) {
                        score += cfg.wordInName; // 50
                        variableMatched = true;
                    }
                }
            });
            
            if (variableMatched) {
                matched.push(v.symbol);
            }
        });
        
        if (metrics && matched.length > 0) {
            metrics.matchedVariables = matched;
        }
        
        return score;
    }
    
    scoreCategoryMatch(formulaId, query, words) {
        let score = 0;
        const cfg = this.config.category;
        
        for (const [category, ids] of Object.entries(this.formulaCategories)) {
            if (ids.includes(formulaId)) {
                const categoryLower = category.toLowerCase();
                if (categoryLower === query) {
                    score += cfg.exactMatch; // 150
                }
                else if (categoryLower.includes(query)) {
                    score += cfg.contains; // 80
                }
                break;
            }
        }
        return score;
    }

    scoreKeywordMatch(keywords, query, words) {
        let score = 0;
        const cfg = this.config.keywords;

        keywords.forEach(keyword => {
            const keywordLower = String(keyword || '').toLowerCase();
            if (!keywordLower)
                return;

            if (keywordLower.includes(query) || query.includes(keywordLower)) {
                score += cfg.containsQuery;
            }

            words.forEach(word => {
                if (word.length >= 3 && keywordLower.includes(word)) {
                    score += cfg.wordMatch;
                }
            });
        });

        return score;
    }

    scoreQuestionPatternMatch(patterns, query, words, metrics) {
        let score = 0;
        const cfg = this.config.questionPatterns;
        const compactQuery = words.join(' ');

        patterns.forEach(pattern => {
            const patternLower = String(pattern || '').toLowerCase().trim();
            if (!patternLower)
                return;

            if (query.includes(patternLower) || patternLower.includes(query)) {
                score += cfg.exactOrContains;
                if (metrics) {
                    metrics.matchReasons.push(`Question phrase match: "${pattern}"`);
                }
                return;
            }

            const overlapCount = words.filter(word => word.length >= 3 && patternLower.includes(word)).length;
            if (overlapCount >= 2 || (compactQuery.length >= 8 && patternLower.includes(compactQuery))) {
                score += cfg.partialOverlap;
                if (metrics) {
                    metrics.matchReasons.push(`Question phrase overlap: "${pattern}"`);
                }
            }
        });

        return score;
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
            sourceMatch: false,
            formulaConfidence: 85,
            confidenceTier: 'approximation',
            confidenceRationale: '',
            componentScores: {} // For explainability
        };
    }
    
    /**
     * Get a natural language explanation for why a formula matched
     */
    explainMatch(result) {
        const { metrics, score } = result;
        const reasons = [];
        
        if (metrics.nameMatch && metrics.componentScores.name > 0) {
            reasons.push(`Name match (${metrics.componentScores.name} pts)`);
        }
        if (metrics.conceptMatch && metrics.componentScores.concepts > 0) {
            reasons.push(`Concept match (${metrics.componentScores.concepts} pts)`);
        }
        if (metrics.variableMatch && metrics.componentScores.variables > 0) {
            reasons.push(`Variable match (${metrics.componentScores.variables} pts)`);
        }
        if (metrics.descriptionMatch && metrics.componentScores.description > 0) {
            reasons.push(`Description match (${metrics.componentScores.description} pts)`);
        }
        if (metrics.questionPatternMatch && metrics.componentScores.questionPatterns > 0) {
            reasons.push(`Question match (${metrics.componentScores.questionPatterns} pts)`);
        }
        if (metrics.categoryMatch && metrics.componentScores.category > 0) {
            reasons.push(`Category match (${metrics.componentScores.category} pts)`);
        }
        
        return reasons.length > 0 
            ? `Matches: ${reasons.join(', ')}. Total score: ${score}`
            : 'No strong matches found';
    }
}
