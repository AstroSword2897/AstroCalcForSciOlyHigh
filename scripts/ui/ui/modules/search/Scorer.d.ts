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
export declare class FormulaScorer {
    private formulaCategories;
    constructor(formulaCategories: Record<string, string[]>);
    /**
     * Score a formula against a search query
     */
    score(formula: Formula, query: string, words: string[]): ScoredResult;
    private scoreNameMatch;
    private scoreDescriptionMatch;
    private scoreConceptMatch;
    private scoreVariableMatch;
    private scoreCategoryMatch;
    private createEmptyMetrics;
}
