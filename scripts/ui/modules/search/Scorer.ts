/**
 * FormulaScorer - Pure scoring logic, no side effects
 */

import { Formula, SearchMetrics } from '../../../types/formula';

export interface ScoredResult {
    formula: Formula;
    score: number;
    metrics: SearchMetrics;
    topicRelevanceScore: number;
    contextScore: number;
}

export class FormulaScorer {
    private formulaCategories: Record<string, string[]>;

    constructor(formulaCategories: Record<string, string[]>) {
        this.formulaCategories = formulaCategories;
    }

    /**
     * Score a formula against a search query
     */
    score(formula: Formula, query: string, words: string[]): ScoredResult {
        const queryLower = query.toLowerCase();
        const metrics = this.createEmptyMetrics();
        
        const scores = {
            name: this.scoreNameMatch(formula.name, queryLower, words),
            description: this.scoreDescriptionMatch(formula.description, queryLower, words),
            concepts: this.scoreConceptMatch(formula.concepts || [], queryLower, words),
            variables: this.scoreVariableMatch(formula.variables, queryLower, words),
            category: this.scoreCategoryMatch(formula.id, queryLower, words)
        };

        // Update metrics based on scores
        if (scores.name > 0) metrics.nameMatch = true;
        if (scores.description > 0) metrics.descriptionMatch = true;
        if (scores.concepts > 0) metrics.conceptMatch = true;
        if (scores.variables > 0) metrics.variableMatch = true;
        if (scores.category > 0) metrics.categoryMatch = true;

        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

        return {
            formula,
            score: Math.max(0, totalScore),
            metrics,
            topicRelevanceScore: 0,
            contextScore: 0
        };
    }

    private scoreNameMatch(name: string, query: string, words: string[]): number {
        let score = 0;
        const nameLower = name.toLowerCase();

        // Exact match (highest priority)
        if (nameLower === query) {
            score += 10000;
        } else if (nameLower.includes(query)) {
            score += 5000;
        }

        // Word-by-word matching
        words.forEach(word => {
            if (word.length >= 3) {
                if (nameLower === word) {
                    score += 300;
                } else if (nameLower.startsWith(word)) {
                    score += 200;
                } else if (nameLower.includes(word)) {
                    score += 150;
                }
            }
        });

        return score;
    }

    private scoreDescriptionMatch(description: string, query: string, words: string[]): number {
        let score = 0;
        const descLower = description.toLowerCase();

        if (descLower.includes(query)) {
            score += 150;
        }

        const commonWords = ['the', 'is', 'to', 'a', 'an', 'and', 'or', 'of', 'for', 'with', 'from'];
        words.forEach(word => {
            if (word.length >= 3 && !commonWords.includes(word)) {
                if (descLower.includes(word)) {
                    score += 20;
                }
            }
        });

        return score;
    }

    private scoreConceptMatch(concepts: string[], query: string, words: string[]): number {
        let score = 0;

        concepts.forEach(concept => {
            const conceptLower = concept.toLowerCase();
            if (conceptLower === query) {
                score += 400;
            } else if (conceptLower.includes(query) || query.includes(conceptLower)) {
                score += 200;
            }

            words.forEach(word => {
                if (word.length >= 3 && conceptLower.includes(word)) {
                    score += 150;
                }
            });
        });

        return score;
    }

    private scoreVariableMatch(variables: Array<{ symbol: string; name: string }>, query: string, words: string[]): number {
        let score = 0;

        variables.forEach(v => {
            const varSymbol = v.symbol.toLowerCase();
            const varName = v.name.toLowerCase();

            if (varSymbol === query) {
                score += 400;
            } else if (varSymbol.includes(query)) {
                score += 180;
            }

            if (varName === query) {
                score += 250;
            } else if (varName.includes(query)) {
                score += 120;
            }

            words.forEach(word => {
                if (word.length >= 2) {
                    if (varSymbol === word) {
                        score += 120;
                    } else if (varSymbol.includes(word)) {
                        score += 80;
                    }
                    if (varName.includes(word)) {
                        score += 50;
                    }
                }
            });
        });

        return score;
    }

    private scoreCategoryMatch(formulaId: string, query: string, words: string[]): number {
        let score = 0;

        for (const [category, ids] of Object.entries(this.formulaCategories)) {
            if (ids.includes(formulaId)) {
                const categoryLower = category.toLowerCase();
                if (categoryLower === query) {
                    score += 150;
                } else if (categoryLower.includes(query)) {
                    score += 80;
                }
                break;
            }
        }

        return score;
    }

    private createEmptyMetrics(): SearchMetrics {
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

