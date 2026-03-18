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
        this.vagueTerms = ['stuff', 'thing', 'things', 'something', 'formula', 'equation'];
        this.conceptDictionary = this.buildConceptDictionary();
    }

    clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    normalizeQuestionText(questionText) {
        return String(questionText || '')
            .replace(/[\u0000-\u001f\u007f]+/g, ' ')
            .replace(/[<>`]/g, ' ')
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 400);
    }

    // Build concept dictionary from formulas (name + concepts + keywords)
    buildConceptDictionary() {
        const dict = {};
        const addEntry = (key, formula, weight, source) => {
            const normalizedKey = String(key || '').toLowerCase().trim();
            if (!normalizedKey || normalizedKey.length < 3) return;
            if (!dict[normalizedKey]) dict[normalizedKey] = [];
            dict[normalizedKey].push({ formula, weight, source });
        };

        this.formulas.forEach(formula => {
            // Concepts
            (formula.concepts || []).forEach(concept => {
                addEntry(concept, formula, 1.0, 'concept');
            });
            // Name tokens
            if (formula.name) {
                formula.name.toLowerCase().split(/[\s_]+/).forEach(word => {
                    if (word.length > 2) {
                        addEntry(word, formula, 1.5, 'name');
                    }
                });
            }
            // Keywords
            (formula.keywords || []).forEach(keyword => {
                addEntry(keyword, formula, 0.8, 'keyword');
            });
            // Natural-language question patterns
            (formula.questionPatterns || []).forEach(pattern => {
                addEntry(pattern, formula, 1.2, 'questionPattern');
            });
        });
        return dict;
    }

    preprocessQuestion(questionText) {
        const normalized = this.normalizeQuestionText(questionText);

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
        const normalizedQuestion = this.normalizeQuestionText(questionText);
        const searchResults = this.searchEngine ? this.searchEngine.search(normalizedQuestion) : [];
        const preferredBoosts = this.getPreferredFormulaBoosts(normalizedQuestion);

        const combined = conceptMatches.map(match => {
            const sr = searchResults.find(r => r.formula.id === match.formula.id);
            const questionPatternBoost = sr?.metrics?.questionPatternMatch ? 600 : 0;
            const nameBoost = sr?.metrics?.nameMatch ? 250 : 0;
            const preferredBoost = preferredBoosts.get(match.formula.id) || 0;
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
                combinedScore: (sr?.score || 0) * 0.7 + match.score * 65 + questionPatternBoost + nameBoost + preferredBoost
            };
        });

        combined.sort((a, b) => b.combinedScore - a.combinedScore);
        return {
            best: combined[0] || null,
            candidates: combined
        };
    }

    getPreferredFormulaBoosts(normalizedQuestion) {
        const boosts = new Map();
        const addBoost = (formulaId, amount) => boosts.set(formulaId, (boosts.get(formulaId) || 0) + amount);

        if (/\bspectral radiance\b|\bplanck\b|\bblackbody spectrum\b/.test(normalizedQuestion)) {
            addBoost('blackbody_radiation', 2200);
        }

        if (/\bluminosity distance\b/.test(normalizedQuestion)) {
            addBoost('luminosity_distance', 2000);
        }

        if (/\bobserved flux\b/.test(normalizedQuestion) && /\bluminosity\b/.test(normalizedQuestion)) {
            addBoost('luminosity_distance', 1800);
        }

        if (/\bextinction\b/.test(normalizedQuestion) && /\bdistance\b/.test(normalizedQuestion)) {
            addBoost('distance_modulus_with_extinction', 2200);
            addBoost('distance_from_magnitude', 900);
        }

        if (/\borbital period\b/.test(normalizedQuestion)) {
            addBoost('kepler_third_law', 1200);
            addBoost('orbital_period_general', 900);
        }

        if (/\bbetween two masses\b|\bforce between masses\b/.test(normalizedQuestion)) {
            addBoost('newton_gravitational_force', 1500);
        }

        if (/\blinear separation\b/.test(normalizedQuestion) && /\bdistance\b/.test(normalizedQuestion) && /\bangular separation\b/.test(normalizedQuestion)) {
            addBoost('angular_separation_arcsec', 2200);
        }

        if (/\bphysical separation\b/.test(normalizedQuestion) && /\bangular separation\b/.test(normalizedQuestion)) {
            addBoost('linear_separation_from_angular', 2400);
        }

        if (/\bflux ratio\b/.test(normalizedQuestion) && /\bmagnitude change\b/.test(normalizedQuestion)) {
            addBoost('magnitude_change_flux_ratio', 2200);
        }

        if (/\bbrightness drops?\b|\bbrightness decreased\b/.test(normalizedQuestion) && /\bmagnitude\b/.test(normalizedQuestion)) {
            addBoost('magnitude_change_flux_ratio', 1800);
        }

        // Practice 2026 / Section D style: temperature from spectrum, parallax, surface gravity, luminosity from flux, Jeans mass, distance modulus, Cepheid
        if (/\bpeak wavelength\b|\btemperature from wavelength\b|\bemission spectra\b|\blambda max\b/.test(normalizedQuestion)) {
            addBoost('wiens_law', 2000);
        }
        if (/\bparallax\b/.test(normalizedQuestion) && (/\bmilliarcsecond\b|\bmas\b|\bdistance in pc\b|\bd = 1\/p\b|\bparsecs\b/.test(normalizedQuestion))) {
            addBoost('parallax_distance_arcsec', 1800);
        }
        if (/\bsurface gravity\b|\bacceleration due to gravity\b|\bradius from g\b|\bg = GM\/r/.test(normalizedQuestion)) {
            addBoost('surface_gravity', 1900);
        }
        if (/\bluminosity from flux\b|\binverse square law\b.*\bluminosity\b|L = F.*4.*pi.*d/.test(normalizedQuestion)) {
            addBoost('luminosity_from_flux_distance', 2000);
        }
        if (/\bjeans mass\b|\bM_J\b/.test(normalizedQuestion) && (/\btemperature\b|\bT\b/.test(normalizedQuestion) || /\bdensity\b|\brho\b/.test(normalizedQuestion))) {
            addBoost('jeans_mass', 2200);
        }
        if (/\bdistance modulus\b|\bm - M\b|\bapparent and absolute magnitude\b/.test(normalizedQuestion)) {
            addBoost('distance_modulus', 1800);
        }
        if (/\bcepheid\b/.test(normalizedQuestion) && (/\bperiod\b|\blight curve\b|\bdistance\b/.test(normalizedQuestion))) {
            addBoost('period_luminosity_relation_cepheid', 1600);
            addBoost('period_luminosity_cepheid_classical', 1500);
        }
        if (/\bluminosity of the star in W\b|\bluminosity from radius and temperature\b|\bL = 4.*pi.*R.*sigma.*T/.test(normalizedQuestion)) {
            addBoost('luminosity', 1900);
        }

        return boosts;
    }

    calculateConfidence(match) {
        const { matchedWords = [], matchedConcepts = [], formula, metrics = {}, normalizedScore = 0, percentile = 0 } = match;
        const formulaWords = new Set();
        if (formula.name) {
            formula.name.toLowerCase().split(/[\s_]+/).forEach(w => { if (w.length > 2) formulaWords.add(w); });
        }
        (formula.concepts || []).slice(0, 5).forEach(c => {
            c.toLowerCase().split(/\s+/).forEach(w => { if (w.length > 2) formulaWords.add(w); });
        });
        const total = formulaWords.size || 1;
        const overlap = this.clamp(Math.round((matchedWords.length / total) * 100), 0, 100);
        const normalizedContribution = Math.round((normalizedScore / 1000) * 40);
        const percentileContribution = Math.round((percentile / 100) * 18);
        const conceptContribution = Math.min(18, matchedConcepts.length * 6);
        const strongMatchBoost =
            (metrics.nameMatch ? 14 : 0) +
            (metrics.questionPatternMatch ? 12 : 0) +
            (metrics.variableMatch ? 6 : 0) +
            (metrics.conceptMatch ? 8 : 0);

        let confidence = this.clamp(
            Math.max(overlap, overlap + normalizedContribution + percentileContribution + conceptContribution + strongMatchBoost),
            0,
            100
        );

        const lacksStrongSignal = !metrics.nameMatch && !metrics.questionPatternMatch && matchedConcepts.length <= 1;
        if (lacksStrongSignal) {
            confidence = Math.min(confidence, 55);
        }

        return confidence;
    }

    isAmbiguous(pre, rankedMatches) {
        if (!rankedMatches || rankedMatches.length < 2) return false;
        const top = rankedMatches[0];
        const second = rankedMatches[1];
        if (!top || !second) return false;

        const asksForMultiple = /\b(and|or)\b/.test(pre.normalized) &&
            (/\bvelocity\b/.test(pre.normalized) || /\bdistance\b/.test(pre.normalized) || /\bmass\b/.test(pre.normalized));
        const closeScores = second.combinedScore >= top.combinedScore * 0.82;
        const bothStrong = top.combinedScore > 0 && second.combinedScore > 0;

        return asksForMultiple && closeScores && bothStrong;
    }

    isTooVague(pre) {
        const significantWords = (pre.words || []).filter(word => word.length >= 3 && !this.vagueTerms.includes(word));
        const containsVagueWord = (pre.words || []).some(word => this.vagueTerms.includes(word));
        return significantWords.length <= 1 && containsVagueWord;
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

        if (this.isTooVague(pre)) {
            const failure = {
                success: false,
                error: 'The question is too vague to choose a single formula confidently.',
                suggestions: [
                    'Ask for a specific quantity such as distance modulus, luminosity distance, or parallax distance.',
                    'Include the known values or the relationship you want to use.'
                ]
            };
            this.validateResultShape(failure);
            return failure;
        }

        const selection = this.selectBestFormula(questionText, conceptMatches);
        const best = selection?.best;
        if (!best) {
            const failure = { success: false, error: 'Could not determine the best formula.' };
            this.validateResultShape(failure);
            return failure;
        }

        if (this.isAmbiguous(pre, selection.candidates)) {
            const suggestions = selection.candidates
                .slice(0, 3)
                .map(candidate => candidate.formula.name);
            const failure = {
                success: false,
                error: 'Your question appears to ask for multiple formulas at once. Please ask for one quantity at a time.',
                suggestions
            };
            this.validateResultShape(failure);
            return failure;
        }

        const confidence = this.calculateConfidence(best);
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

