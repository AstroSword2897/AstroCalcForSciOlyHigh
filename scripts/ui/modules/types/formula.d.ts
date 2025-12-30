/**
 * Type definitions for Formula and related entities
 */
export interface Variable {
    symbol: string;
    name: string;
    description: string;
    unit: string;
}
export interface Formula {
    id: string;
    name: string;
    description: string;
    equation: string;
    variables: Variable[];
    constants?: Record<string, number>;
    concepts?: string[];
    category?: string;
    topicRelevanceScore?: number;
    contextScore?: number;
}
export interface SearchMetrics {
    nameMatch: boolean;
    descriptionMatch: boolean;
    equationMatch: boolean;
    variableMatch: boolean;
    conceptMatch: boolean;
    questionPatternMatch: boolean;
    categoryMatch: boolean;
    semanticMatch: boolean;
    synonymMatch: boolean;
    matchedConcepts: string[];
    matchedVariables: string[];
    matchReasons: string[];
    originalConcepts: string[];
    expandedConcepts: string[];
    dynamicBoost: number;
    intentMatch: boolean;
    targetMatch: boolean;
    sourceMatch: boolean;
    domain?: string;
    domainBoost?: number;
    topicRelevanceScore?: number;
    contextScore?: number;
}
export interface SearchResult {
    formula: Formula;
    score: number;
    metrics: SearchMetrics;
    maxScore?: number;
}
export interface CalculationResult {
    solvedFor: string;
    result: number | string;
    unit: string;
    isSymbolic: boolean;
    value?: number;
    variable?: string;
    errorInfo?: {
        absoluteError: number;
        relativeError: number;
        confidenceInterval95: number;
        confidenceInterval99: number;
    };
    significantFigures?: number;
    arithmeticContext?: {
        stability: 'stable' | 'unstable' | 'marginal';
        precision: 'standard' | 'reduced' | 'enhanced';
    };
    allEquations?: Array<{
        expression: string;
        numericValue?: number;
    }>;
}
