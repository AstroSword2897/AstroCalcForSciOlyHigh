/**
 * AstrophysicsExpertSystem v1.0.0
 * Deterministic, rule-based question → formula mapper (no AI/ML/embeddings)
 *
 * Public contract: solveQuestion(questionText) -> Result
 * Success result (success=true):
 * {
 *   success: true,
 *   formula: { id, name, description, equation, variables, ... },
 *   confidence: number (0-100) // matched tokens / formula tokens (capped)
 *   percentile: number (0-100) // from SearchEngine normalization
 *   matchedConcepts: string[],
 *   matchedVariables: string[],
 *   extractedVariables: [{ symbol, value, unit, raw }],
 *   explanation: string, // human-readable summary
 *   searchData: { score, normalizedScore, metrics, confidenceMeta }
 * }
 *
 * Failure result (success=false):
 * {
 *   success: false,
 *   error: string,
 *   hasCalculus?: true, // when calculus detected
 *   suggestions?: string[]
 * }
 *
 * Confidence semantics:
 * - 80–100: Very strong match (high token overlap)
 * - 60–79: Strong match
 * - 40–59: Moderate match
 * - 0–39: Weak match
 *
 * Determinism:
 * - Same input → same output (no randomness, no models)
 * - No external calls, no embeddings, no LLMs
 *
 * Usage:
 *   const expert = new AstrophysicsExpertSystem(window.formulas, searchEngine);
 *   const result = expert.solveQuestion("What is the orbital period of a satellite 7000 km above Earth?");
 *   console.log(result);
 */
export class AstrophysicsExpertSystem {
    constructor(formulas = [], searchEngine = null) {
        this.formulas = formulas || [];
        this.searchEngine = searchEngine;
        this.calculusTerms = [
            'derivative', 'rate of change', 'integral', 'd/dt', '∫', 'differential',
            'differentiate', 'differentiation', 'integrate', 'integration',
            'partial derivative', 'gradient', 'divergence', 'curl',
            'laplacian', 'jacobian', 'hessian'
        ];
        this.conceptDictionary = this.buildConceptDictionary();
    }

    // Build concept dictionary from formulas (name + concepts + keywords)
    buildConceptDictionary() {
        const dict = {};
        this.formulas.forEach(formula => {
            // Concepts
            (formula.concepts || []).forEach(concept => {
                const key = concept.toLowerCase();
                if (!dict[key]) dict[key] = [];
                dict[key].push({ formula, weight: 1.0, source: 'concept' });
            });
            // Name tokens
            if (formula.name) {
                formula.name.toLowerCase().split(/[\s_]+/).forEach(word => {
                    if (word.length > 2) {
                        if (!dict[word]) dict[word] = [];
                        dict[word].push({ formula, weight: 1.5, source: 'name' });
                    }
                });
            }
            // Keywords
            (formula.keywords || []).forEach(keyword => {
                const key = keyword.toLowerCase();
                if (!dict[key]) dict[key] = [];
                dict[key].push({ formula, weight: 0.8, source: 'keyword' });
            });
        });
        return dict;
    }

    preprocessQuestion(questionText) {
        const normalized = String(questionText || '').toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const hasCalculus = this.calculusTerms.some(term => normalized.includes(term));
        if (hasCalculus) {
            return {
                normalized,
                hasCalculus: true,
                error: 'This system only handles non-calculus formulas. Please remove derivatives/integrals.'
            };
        }

        const variables = this.extractVariables(questionText || '');
        return {
            normalized,
            hasCalculus: false,
            variables,
            words: normalized.split(/\s+/).filter(Boolean)
        };
    }

    extractVariables(questionText) {
        const extracted = [];
        const pattern = /(\d+\.?\d*(?:e[+-]?\d+)?)\s*([a-zA-Zµ]+)/g;
        let match;
        const contextLower = questionText.toLowerCase();

        while ((match = pattern.exec(questionText)) !== null) {
            const value = parseFloat(match[1]);
            const unit = match[2].toLowerCase();
            const symbol = this.mapUnitToVariable(unit, contextLower);
            if (symbol) {
                extracted.push({ symbol, value, unit, raw: match[0] });
            }
        }
        return extracted;
    }

    mapUnitToVariable(unit, contextLower) {
        // Distance units
        if (['km', 'm', 'au', 'pc', 'ly', 'lightyear', 'light-year', 'parsec'].includes(unit)) {
            if (contextLower.includes('orbital') || contextLower.includes('semi-major')) return 'a';
            if (contextLower.includes('radius') || contextLower.includes('distance from')) return 'r';
            return 'd';
        }
        // Mass units
        if (['kg', 'm_sun', 'msun', 'solar'].includes(unit)) {
            return contextLower.includes('central') || contextLower.includes('star') ? 'M' : 'm';
        }
        // Time units
        if (['s', 'sec', 'seconds', 'yr', 'year', 'day', 'hour', 'hr', 'h'].includes(unit)) return 'T';
        // Velocity units
        if (['m/s', 'km/s', 'kms'].includes(unit)) return 'v';
        // Temperature units
        if (['k', 'kelvin', 'c', 'celsius'].includes(unit)) return 'T';
        return null;
    }

    mapToConcepts(words) {
        const matches = new Map(); // id -> data
        words.forEach((word, idx) => {
            if (word.length < 3) return;
            // Single word
            if (this.conceptDictionary[word]) {
                this.conceptDictionary[word].forEach(({ formula, weight, source }) => {
                    if (!matches.has(formula.id)) {
                        matches.set(formula.id, { formula, score: 0, matchedConcepts: [], matchedWords: [] });
                    }
                    const entry = matches.get(formula.id);
                    entry.score += weight;
                    entry.matchedConcepts.push(word);
                    entry.matchedWords.push({ word, source, weight });
                });
            }
            // Two-word phrase
            if (idx < words.length - 1) {
                const phrase = `${word} ${words[idx + 1]}`;
                if (this.conceptDictionary[phrase]) {
                    this.conceptDictionary[phrase].forEach(({ formula, weight, source }) => {
                        if (!matches.has(formula.id)) {
                            matches.set(formula.id, { formula, score: 0, matchedConcepts: [], matchedWords: [] });
                        }
                        const entry = matches.get(formula.id);
                        entry.score += weight * 1.5;
                        entry.matchedConcepts.push(phrase);
                        entry.matchedWords.push({ word: phrase, source, weight: weight * 1.5 });
                    });
                }
            }
        });
        return Array.from(matches.values());
    }

    selectBestFormula(questionText, conceptMatches) {
        if (!conceptMatches.length) return null;
        const searchResults = this.searchEngine ? this.searchEngine.search(questionText) : [];

        const combined = conceptMatches.map(match => {
            const sr = searchResults.find(r => r.formula.id === match.formula.id);
            return {
                formula: match.formula,
                conceptScore: match.score,
                searchScore: sr?.score || 0,
                normalizedScore: sr?.normalizedScore || 0,
                percentile: sr?.percentile || 0,
                metrics: sr?.metrics || {},
                confidenceMeta: sr?.confidenceMeta || {},
                matchedConcepts: match.matchedConcepts,
                matchedWords: match.matchedWords,
                combinedScore: (sr?.score || 0) * 0.6 + match.score * 0.4
            };
        });

        combined.sort((a, b) => b.combinedScore - a.combinedScore);
        return combined[0] || null;
    }

    calculateConfidence(matchedWords, formula) {
        const formulaWords = new Set();
        if (formula.name) {
            formula.name.toLowerCase().split(/[\s_]+/).forEach(w => { if (w.length > 2) formulaWords.add(w); });
        }
        (formula.concepts || []).slice(0, 5).forEach(c => {
            c.toLowerCase().split(/\s+/).forEach(w => { if (w.length > 2) formulaWords.add(w); });
        });
        const total = formulaWords.size || 1;
        const matched = matchedWords.length;
        return Math.min(Math.round((matched / total) * 100), 100);
    }

    buildExplanation(match, confidence, extractedVariables) {
        const parts = [];
        parts.push(`Matched formula: "${match.formula.name}"`);
        parts.push(`Confidence: ${confidence}%`);
        if (match.matchedConcepts?.length) {
            parts.push(`Matched concepts: ${match.matchedConcepts.slice(0, 5).join(', ')}`);
        }
        if (match.metrics?.matchedVariables?.length) {
            parts.push(`Matched variables: ${match.metrics.matchedVariables.join(', ')}`);
        }
        if (extractedVariables?.length) {
            const vars = extractedVariables.map(v => `${v.symbol} = ${v.value} ${v.unit}`).join(', ');
            parts.push(`Extracted values: ${vars}`);
        }
        return parts.join(' | ');
    }

    solveQuestion(questionText) {
        if (!questionText || !questionText.trim()) {
            return { success: false, error: 'Please provide a question.' };
        }

        const pre = this.preprocessQuestion(questionText);
        if (pre.hasCalculus) {
            const failure = { success: false, error: pre.error, hasCalculus: true };
            this.validateResultShape(failure);
            return failure;
        }

        const conceptMatches = this.mapToConcepts(pre.words);
        if (!conceptMatches.length) {
            const failure = {
                success: false,
                error: 'No matching formulas found. Try more specific astrophysics terms.',
                suggestions: [
                    'Include terms like "orbital period", "escape velocity", "luminosity", etc.',
                    'Mention the quantity to compute (distance, velocity, temperature, etc.)'
                ]
            };
            this.validateResultShape(failure);
            return failure;
        }

        const best = this.selectBestFormula(questionText, conceptMatches);
        if (!best) {
            const failure = { success: false, error: 'Could not determine the best formula.' };
            this.validateResultShape(failure);
            return failure;
        }

        const confidence = this.calculateConfidence(best.matchedWords, best.formula);
        const explanation = this.buildExplanation(best, confidence, pre.variables);

        const success = {
            success: true,
            formula: best.formula,
            confidence,
            percentile: best.percentile,
            matchedConcepts: best.matchedConcepts,
            matchedVariables: best.metrics?.matchedVariables || [],
            extractedVariables: pre.variables,
            explanation,
            searchData: {
                score: best.searchScore,
                normalizedScore: best.normalizedScore,
                metrics: best.metrics,
                confidenceMeta: best.confidenceMeta
            }
        };
        this.validateResultShape(success);
        return success;
    }

    /**
     * Runtime contract enforcement to keep API unassailable.
     * Throws if the result violates the public contract.
     */
    validateResultShape(result) {
        const isFailure = result && result.success === false;
        const isSuccess = result && result.success === true;

        // Common fields
        if (typeof result !== 'object' || result === null) {
            throw new Error('[ExpertSystem] Invalid result: not an object');
        }

        if (isSuccess) {
            // Exactly one formula with required fields
            if (!result.formula || typeof result.formula.id !== 'string' || typeof result.formula.name !== 'string') {
                throw new Error('[ExpertSystem] Invalid result: missing formula id/name');
            }
            // Confidence bounds
            if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 100) {
                throw new Error('[ExpertSystem] Invalid result: confidence out of range');
            }
            // Percentile bounds
            if (typeof result.percentile !== 'number' || result.percentile < 0 || result.percentile > 100) {
                throw new Error('[ExpertSystem] Invalid result: percentile out of range');
            }
            // Deterministic fields only (no Date/timestamps/random)
            if ('timestamp' in result || 'nonce' in result || 'uuid' in result) {
                throw new Error('[ExpertSystem] Invalid result: contains non-deterministic fields');
            }
            // Explanation must be a string
            if (typeof result.explanation !== 'string') {
                throw new Error('[ExpertSystem] Invalid result: explanation must be string');
            }
        } else if (isFailure) {
            if (typeof result.error !== 'string' || !result.error) {
                throw new Error('[ExpertSystem] Invalid failure result: missing error message');
            }
        } else {
            throw new Error('[ExpertSystem] Invalid result: success flag not set');
        }
    }
}

// Optional global exposure for non-module access
if (typeof window !== 'undefined') {
    window.AstrophysicsExpertSystem = AstrophysicsExpertSystem;
}

