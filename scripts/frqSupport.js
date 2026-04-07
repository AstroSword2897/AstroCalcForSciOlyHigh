/**
 * Enhanced FRQ (Free Response Question) Support System
 * 
 * REFACTORED VERSION - Addresses all identified issues:
 * 1. Fixed step numbering with dedicated stepCounter
 * 2. Centralized formula-specific logic (no duplication)
 * 3. Accumulates graph interpretation (no overwriting)
 * 4. Caches concept expansion results
 * 5. Unified logic flow (less fragmentation)
 * 6. Intermediate results storage for multi-step problems
 * 7. Prioritizes metadata over generic fallbacks
 * 8. Cleaned up unused variables, uses optional chaining
 * 
 * Provides adaptive confidence scoring, dynamic usage instructions, 
 * graph interpretation, and contextual guidance for research-grade 
 * astronomy and physics problem solving.
 */

//////////////////////////////
// Helper Utilities
//////////////////////////////

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    // Input validation
    if (typeof value !== 'number' || !isFinite(value)) {
        return min; // Return min for invalid values
    }
    if (typeof min !== 'number' || !isFinite(min)) {
        return value; // Return value if min is invalid
    }
    if (typeof max !== 'number' || !isFinite(max)) {
        return value; // Return value if max is invalid
    }
    return Math.min(max, Math.max(min, value));
}

// Make clamp globally available
if (typeof window !== 'undefined') {
    window.clamp = clamp;
}

/**
 * Normalize score to percentage (0-100) or custom scale
 * @param {number} score - Raw score
 * @param {number} maxScore - Maximum possible score
 * @param {number} scale - Scale factor (default: 100 for percentage)
 * @returns {number} Normalized score (0 to scale)
 */
function normalizeScore(score, maxScore, scale = 100) {
    // Input validation
    if (typeof score !== 'number' || !isFinite(score)) return 0;
    if (typeof maxScore !== 'number' || !isFinite(maxScore) || maxScore === 0) return 0;
    if (typeof scale !== 'number' || !isFinite(scale) || scale <= 0) scale = 100;
    
    // Handle negative scores
    if (score < 0) score = 0;
    
    // Normalize: (score / maxScore) * scale
    const normalized = (score / maxScore) * scale;
    
    // Clamp to valid range (0 to scale)
    return clamp(normalized, 0, scale);
}

//////////////////////////////
// Confidence Scoring
//////////////////////////////

// Production-grade tunable constants for confidence calculation
// CALIBRATED for 100% accuracy on perfect matches
const CONFIDENCE_CONFIG = {
    BASE_MAX: 50,           // Base confidence from combined score ratio
    TOPIC_WEIGHT: 0.20,     // Topic score weight (20% of combined score contribution)
    CONTEXT_WEIGHT: 0.15,   // Context score weight (15% of combined score contribution)
    MAX_BOOSTS: 35,         // Cap total boosts
    NAME_MATCH_BOOST: 20,   // Strong indicator (formula name matches)
    PATTERN_BOOST: 15,      // Natural language pattern match
    CONCEPT_BOOST_PER: 4,   // Per concept matched
    CONCEPT_BOOST_MAX: 15,  // Maximum from concepts
    SEMANTIC_BOOST_MAX: 10, // Maximum from semantic similarity
    WEAK_MATCH_PENALTY: 15, // Penalty for no strong matches
    FORMULA_CONFIDENCE_BASELINE: 85, // Neutral reliability anchor for formula metadata
    FORMULA_CONFIDENCE_DIVISOR: 2,   // Higher = softer influence from formula reliability
    HISTORY_CLAMP_MIN: 0.8, // Minimum history factor
    HISTORY_CLAMP_MAX: 1.5  // Maximum history factor
};

/**
 * Calculate confidence score based on combined relevance (literal + topic + context)
 * PRODUCTION-GRADE: Returns structured object with confidence and detailed breakdown
 * 
 * @param {number} literalScore - Original literal match score
 * @param {number} maxCombinedScore - Maximum possible combined score used in ranking
 * @param {Object} metrics - Match metrics: { nameMatch, questionPatternMatch, conceptMatch, matchedConcepts, semanticSimilarityScore }
 * @param {number} historyFactor - Historical performance multiplier (default: 1.0)
 * @param {number} topicScore - Topic relevance score (default: 0)
 * @param {number} contextScore - Context matching score (default: 0)
 * @returns {Object} { confidence: number (0-100), breakdown: Array<{label, value, description}> }
 */
function calculateConfidenceScore(literalScore, maxCombinedScore, metrics = {}, historyFactor = 1, topicScore = 0, contextScore = 0) {
    // DEFENSIVE: Validate inputs
    if (!maxCombinedScore || maxCombinedScore <= 0) {
        return {
            confidence: 0,
            breakdown: [{
                label: 'Invalid Input',
                value: 0,
                description: 'maxCombinedScore must be > 0'
            }]
        };
    }
    
    // DEFENSIVE: Clamp negative values to 0
    literalScore = Math.max(0, literalScore || 0);
    topicScore = Math.max(0, topicScore || 0);
    contextScore = Math.max(0, contextScore || 0);
    historyFactor = clamp(historyFactor || 1, CONFIDENCE_CONFIG.HISTORY_CLAMP_MIN, CONFIDENCE_CONFIG.HISTORY_CLAMP_MAX);
    
    const breakdown = [];
    
    // 1) COMBINED SCORE: Use all three components
    const combinedScore = literalScore + topicScore + contextScore;
    let scoreRatio = combinedScore / maxCombinedScore;
    
    // DEFENSIVE: Ensure finite ratio
    if (!isFinite(scoreRatio) || scoreRatio < 0) scoreRatio = 0;
    
    // 2) BASE CONFIDENCE: Calculated from combined score ratio
    // For perfect matches (ratio = 1.0), base should be BASE_MAX
    let baseConfidence = Math.min(
        CONFIDENCE_CONFIG.BASE_MAX,
        Math.round(scoreRatio * CONFIDENCE_CONFIG.BASE_MAX)
    );
    
    breakdown.push({
        label: 'Base Relevance',
        value: baseConfidence,
        description: `Combined score ${combinedScore} / max ${maxCombinedScore} (${(scoreRatio * 100).toFixed(1)}%)`
    });
    
    // 3) BOOSTS: Calculate individual boosts (will be capped later)
    let boosts = 0;
    
    // Name match boost
    if (metrics.nameMatch) {
        const boost = CONFIDENCE_CONFIG.NAME_MATCH_BOOST;
        boosts += boost;
        breakdown.push({
            label: 'Name Match',
            value: boost,
            description: 'Formula name matches your search query'
        });
    }
    
    // Question pattern match boost
    if (metrics.questionPatternMatch) {
        const boost = CONFIDENCE_CONFIG.PATTERN_BOOST;
        boosts += boost;
        breakdown.push({
            label: 'Question Pattern',
            value: boost,
            description: 'Matches natural language question patterns'
        });
    }
    
    // Concept match boost
    if (metrics.conceptMatch) {
        const conceptCount = metrics.matchedConcepts?.length || 1;
        const boost = Math.min(
            CONFIDENCE_CONFIG.CONCEPT_BOOST_MAX,
            conceptCount * CONFIDENCE_CONFIG.CONCEPT_BOOST_PER
        );
        boosts += boost;
        breakdown.push({
            label: 'Concept Matches',
            value: boost,
            description: `Matched ${conceptCount} key concept${conceptCount !== 1 ? 's' : ''}`
        });
    }
    
    // Semantic similarity boost
    if (metrics.semanticSimilarityScore && metrics.semanticSimilarityScore > 0.5) {
        const boost = Math.min(
            CONFIDENCE_CONFIG.SEMANTIC_BOOST_MAX,
            Math.round(metrics.semanticSimilarityScore * CONFIDENCE_CONFIG.SEMANTIC_BOOST_MAX)
        );
        if (boost > 0) {
            boosts += boost;
            breakdown.push({
                label: 'Semantic Similarity',
                value: boost,
                description: `Meaning similarity: ${(metrics.semanticSimilarityScore * 100).toFixed(0)}%`
            });
        }
    }
    
    // Cap total boosts
    const originalBoosts = boosts;
    if (boosts > CONFIDENCE_CONFIG.MAX_BOOSTS) {
        boosts = CONFIDENCE_CONFIG.MAX_BOOSTS;
        breakdown.push({
            label: 'Boosts Capped',
            value: 0,
            description: `Total boosts ${originalBoosts} capped to ${CONFIDENCE_CONFIG.MAX_BOOSTS}`
        });
    }
    
    // 4) TOPIC & CONTEXT: Weighted contributions for 100% accuracy
    // Use weights relative to their proportion of the combined score
    let topicContribution = 0;
    if (topicScore > 0 && combinedScore > 0) {
        // Calculate topic's contribution as a percentage of combined score
        const topicRatio = topicScore / combinedScore;
        // Scale by configured weight and available confidence space
        topicContribution = Math.round(topicRatio * CONFIDENCE_CONFIG.TOPIC_WEIGHT * 100);
        
        breakdown.push({
            label: 'Topic Relevance',
            value: topicContribution,
            description: `Topic score ${topicScore} (${(topicRatio * 100).toFixed(1)}% of combined)`
        });
    }
    
    let contextContribution = 0;
    if (contextScore > 0 && combinedScore > 0) {
        // Calculate context's contribution as a percentage of combined score
        const contextRatio = contextScore / combinedScore;
        // Scale by configured weight and available confidence space
        contextContribution = Math.round(contextRatio * CONFIDENCE_CONFIG.CONTEXT_WEIGHT * 100);
        
        breakdown.push({
            label: 'Context Match',
            value: contextContribution,
            description: `Context score ${contextScore} (${(contextRatio * 100).toFixed(1)}% of combined)`
        });
    }
    
    // 5) WEAK MATCH PENALTY (only if truly weak)
    if (!metrics.nameMatch && !metrics.questionPatternMatch && !metrics.conceptMatch && topicScore === 0 && contextScore === 0) {
        const penalty = CONFIDENCE_CONFIG.WEAK_MATCH_PENALTY;
        baseConfidence = Math.max(0, baseConfidence - penalty);
        breakdown.push({
            label: 'Weak Match Penalty',
            value: -penalty,
            description: 'No strong indicators (name, pattern, concept, topic, or context)'
        });
    }
    
    // 6) FORMULA RELIABILITY ADJUSTMENT
    const formulaConfidence = clamp(
        metrics.formulaConfidence ?? CONFIDENCE_CONFIG.FORMULA_CONFIDENCE_BASELINE,
        50,
        99
    );
    const reliabilityAdjustment = Math.round(
        (formulaConfidence - CONFIDENCE_CONFIG.FORMULA_CONFIDENCE_BASELINE) /
        CONFIDENCE_CONFIG.FORMULA_CONFIDENCE_DIVISOR
    );
    if (reliabilityAdjustment !== 0 || metrics.confidenceTier) {
        breakdown.push({
            label: 'Formula Reliability',
            value: reliabilityAdjustment,
            description: `${formulaConfidence}/100 (${metrics.confidenceTier || 'unclassified'}) - ${metrics.confidenceRationale || 'Formula-specific research weighting'}`
        });
    }

    if (metrics.generalizationScope) {
        const scopeHint = {
            narrow: 'Single standard setup or identity — use exactly as stated.',
            regime: 'Valid in a parameter band — read validity / unit notes.',
            broad: 'Applies widely when assumptions hold — still verify regime.',
            scaling: 'Proportional or order-of-magnitude — check numerical factors.'
        };
        breakdown.push({
            label: 'Generalization scope',
            value: 0,
            description: scopeHint[metrics.generalizationScope] || String(metrics.generalizationScope)
        });
    }

    // 7) CALCULATE RAW CONFIDENCE
    let rawConfidence = baseConfidence + boosts + topicContribution + contextContribution + reliabilityAdjustment;
    
    // 8) HISTORY FACTOR
    if (historyFactor !== 1.0) {
        const historyAdjustment = Math.round(rawConfidence * (historyFactor - 1));
        if (historyAdjustment !== 0) {
            rawConfidence += historyAdjustment;
            breakdown.push({
                label: 'Historical Performance',
                value: historyAdjustment,
                description: `Based on past usage patterns (${(historyFactor * 100).toFixed(0)}% factor)`
            });
        }
    }
    
    // 9) CLAMP TO [0, 100]
    const finalConfidence = clamp(Math.round(rawConfidence), 0, 100);
    
    // Add capping note if needed
    if (rawConfidence > 100) {
        breakdown.push({
            label: 'Capped at 100%',
            value: 0,
            description: `Raw confidence ${Math.round(rawConfidence)}% capped to maximum 100%`
        });
    }
    
    return {
        confidence: finalConfidence,
        breakdown: breakdown
    };
}

/**
 * Get confidence level descriptor
 * @param {number} confidence - Confidence score (0-100)
 * @returns {Object} Level object with level, color, and icon
 */
function getConfidenceLevel(confidence) {
    if (confidence >= 85) return { level: 'Very High', color: '#4ade80', icon: '✓✓' };
    if (confidence >= 70) return { level: 'High', color: '#86efac', icon: '✓' };
    if (confidence >= 50) return { level: 'Moderate', color: '#fde047', icon: '~' };
    if (confidence >= 30) return { level: 'Low', color: '#fb923c', icon: '?' };
    return { level: 'Very Low', color: '#f87171', icon: '??' };
}

/**
 * Generate a breakdown of why the confidence score is what it is
 * WRAPPER: Calls calculateConfidenceScore and returns the breakdown
 * 
 * @param {number} score - Relevance score
 * @param {number} maxScore - Maximum score
 * @param {Object} metrics - Match metrics object
 * @param {number} historyFactor - Historical performance factor (default: 1)
 * @param {number} topicScore - Topic relevance score (default: 0)
 * @param {number} contextScore - Context matching score (default: 0)
 * @returns {Object} { confidence, breakdown, total }
 */
function getConfidenceBreakdown(score, maxScore, metrics = {}, historyFactor = 1, topicScore = 0, contextScore = 0) {
    // Use the main function to get confidence and breakdown
    const result = calculateConfidenceScore(score, maxScore, metrics, historyFactor, topicScore, contextScore);
    
    // Calculate total from breakdown components
    const total = result.breakdown.reduce((sum, comp) => sum + comp.value, 0);
    
    return {
        confidence: result.confidence,
        breakdown: result.breakdown,
        total: result.confidence // Use final confidence as total (after capping)
    };
}

// LEGACY VERSION (kept for reference, will be removed after migration)
function getConfidenceBreakdown_LEGACY(score, maxScore, metrics = {}, historyFactor = 1, topicScore = 0, contextScore = 0) {
    if (!maxScore || maxScore === 0) {
        return {
            components: [],
            total: 0
        };
    }
    
    // Use COMBINED score for base confidence
    const combinedScore = score + topicScore + contextScore;
    const scoreRatio = combinedScore / maxScore;
    let baseConfidence = 0;
    
    if (scoreRatio >= 0.9) baseConfidence = 60;
    else if (scoreRatio >= 0.7) baseConfidence = 50;
    else if (scoreRatio >= 0.5) baseConfidence = 40;
    else if (scoreRatio >= 0.3) baseConfidence = 30;
    else if (scoreRatio >= 0.1) baseConfidence = 20;
    else baseConfidence = Math.max(0, Math.round(scoreRatio * 100));
    
    const components = [];
    
    // Base score contribution
    components.push({
        label: 'Base Relevance Score',
        value: baseConfidence,
        description: `Based on combined relevance (${(scoreRatio * 100).toFixed(1)}% of top match)`
    });
    
    // Name match boost
    if (metrics.nameMatch) {
        components.push({
            label: 'Name Match',
            value: 20,
            description: 'Formula name matches your search query'
        });
    }
    
    // Question pattern match boost
    if (metrics.questionPatternMatch) {
        components.push({
            label: 'Question Pattern Match',
            value: 15,
            description: 'Matches natural language question patterns'
        });
    }
    
    // Concept match boost
    if (metrics.conceptMatch) {
        const conceptCount = metrics.matchedConcepts?.length || 0;
        if (conceptCount >= 3) {
            components.push({
                label: 'Multiple Concept Matches',
                value: 10,
                description: `Matched ${conceptCount} key concepts`
            });
        } else if (conceptCount >= 2) {
            components.push({
                label: 'Concept Matches',
                value: 5,
                description: `Matched ${conceptCount} concepts`
            });
        } else {
            components.push({
                label: 'Concept Match',
                value: 3,
                description: 'Matches key astrophysics concepts'
            });
        }
    }
    
    // Semantic similarity boost
    if (metrics.semanticSimilarityScore && metrics.semanticSimilarityScore > 0.5) {
        const semanticBoost = Math.round(metrics.semanticSimilarityScore * 10);
        if (semanticBoost > 0) {
            components.push({
                label: 'Semantic Similarity',
                value: semanticBoost,
                description: `Meaning similarity: ${(metrics.semanticSimilarityScore * 100).toFixed(0)}%`
            });
        }
    }
    
    // Topic relevance boost
    if (topicScore > 0) {
        const topicContribution = Math.min(15, Math.round((topicScore / maxScore) * 20));
        if (topicContribution > 0) {
            components.push({
                label: 'Topic Relevance',
                value: topicContribution,
                description: `Formula aligns with search topic/domain (+${topicScore} relevance points)`
            });
        }
    }
    
    // Context matching boost
    if (contextScore > 0) {
        const contextContribution = Math.min(10, Math.round((contextScore / maxScore) * 15));
        if (contextContribution > 0) {
            components.push({
                label: 'Context Match',
                value: contextContribution,
                description: `Matches problem-solving context (+${contextScore} context points)`
            });
        }
    }
    
    // Weak match penalty
    if (!metrics.nameMatch && !metrics.questionPatternMatch && !metrics.conceptMatch) {
        components.push({
            label: 'Weak Match Penalty',
            value: -10,
            description: 'No strong matches (name, pattern, or concept)'
        });
    }
    
    // Calculate total before history factor
    const totalBeforeHistory = components.reduce((sum, comp) => sum + comp.value, 0);
    
    // History factor (if not 1.0)
    if (historyFactor !== 1.0) {
        const historyAdjustment = totalBeforeHistory * (historyFactor - 1);
        components.push({
            label: 'Historical Performance',
            value: Math.round(historyAdjustment),
            description: `Based on past usage patterns (${(historyFactor * 100).toFixed(0)}% factor)`,
            isAdjustment: true
        });
    }
    
    // Calculate final total
    const finalTotal = clamp(Math.round(totalBeforeHistory * historyFactor), 0, 100);
    
    return {
        components,
        total: finalTotal,
        baseScore: Math.round(baseConfidence),
        boosts: components.filter(c => c.value > 0 && !c.isAdjustment).reduce((sum, c) => sum + c.value, 0)
    };
}

//////////////////////////////
// Caching System
//////////////////////////////

/**
 * Cache for concept expansion results
 * Key: question text or formula ID, Value: expanded concepts array
 * FIXED: Use LRU cache with size limit to prevent memory leaks
 */
const conceptExpansionCache = typeof LRUCache !== 'undefined' ? new LRUCache(100) : new Map();

/**
 * Cache for formula metadata lookups
 * Key: formula ID, Value: metadata object
 * FIXED: Use LRU cache with size limit to prevent memory leaks
 */
const metadataCache = typeof LRUCache !== 'undefined' ? new LRUCache(100) : new Map();

/**
 * Cache for question analysis results
 * Key: question text, Value: analysis object
 * FIXED: Use LRU cache with size limit to prevent memory leaks
 */
const questionAnalysisCache = typeof LRUCache !== 'undefined' ? new LRUCache(100) : new Map();

/**
 * Clear all caches (useful for testing or memory management)
 */
function clearCaches() {
    conceptExpansionCache.clear();
    metadataCache.clear();
    questionAnalysisCache.clear();
}

//////////////////////////////
// Formula Metadata Storage (Data-Driven Approach)
//////////////////////////////

/**
 * Formula metadata for FRQ support - dynamically loaded from formulas.js
 */
var formulaFRQMetadata = {};

// Track initialization state
let metadataInitialized = false;
let initRetries = 0;
const MAX_INIT_RETRIES = 10;

/**
 * Initialize metadata from formulas array
 * Called when formulas.js is loaded
 * FIXED: Added retry logic for late-loading formulas
 */
function initializeFRQMetadata() {
    if (metadataInitialized) {
        return true;
    }
    
    if (typeof formulas === 'undefined' || !Array.isArray(formulas) || formulas.length === 0) {
        if (initRetries < MAX_INIT_RETRIES) {
            initRetries++;
            console.log(`[FRQ Metadata] Waiting for formulas... attempt ${initRetries}/${MAX_INIT_RETRIES}`);
            setTimeout(initializeFRQMetadata, 200);
        } else {
            console.error('❌ [FRQ Metadata] Formulas array never loaded after max retries');
        }
        return false;
    }
    
    console.log(`[FRQ Metadata] Initializing for ${formulas.length} formulas`);
    
    formulas.forEach(formula => {
        if (!formula.id) {
            console.warn('[FRQ Metadata] Formula missing ID:', formula);
            return;
        }
        
        // Extract metadata from formula object
        const metadata = {
            id: formula.id,
            name: formula.name || '',
            concepts: formula.concepts || [],
            keywords: formula.keywords || [],
            variables: (formula.variables || []).map(v => v.symbol),
            // FRQ-specific metadata (can be extended in formulas.js)
            frqMetadata: formula.frqMetadata || {},
            // Store full formula reference for structure analysis
            formula: formula
        };
        
        formulaFRQMetadata[formula.id] = metadata;
        metadataCache.set(formula.id, metadata);
    });
    
    metadataInitialized = true;
    console.log(`✅ [FRQ Metadata] Initialized for ${Object.keys(formulaFRQMetadata).length} formulas`);
    
    // Trigger any pending operations that needed metadata
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('frq-metadata-ready'));
    }
    
    return true;
}

/**
 * Get metadata for a formula (with caching)
 * @param {string} formulaId - Formula ID
 * @returns {Object|null} Metadata object or null
 */
function getFormulaMetadata(formulaId) {
    // Check cache first
    if (metadataCache.has(formulaId)) {
        return metadataCache.get(formulaId);
    }
    
    // Fallback to direct lookup
    const metadata = formulaFRQMetadata[formulaId] || null;
    if (metadata) {
        metadataCache.set(formulaId, metadata);
    }
    return metadata;
}

//////////////////////////////
// Concept Matching System (with Caching)
//////////////////////////////

/**
 * Concept extraction and matching system for ANY astrophysics question
 * Includes caching to avoid repeated computation
 */
var conceptMatchingSystem = {
    /**
     * Detect problem domain from question text
     * @param {string} questionText - Question text
     * @returns {Object} Domain information with domain name and related concepts
     */
    detectProblemDomain: function(questionText) {
        const questionLower = questionText.toLowerCase();
        const domains = {
            distance: {
                keywords: ['distance', 'parallax', 'modulus', 'apparent magnitude', 'absolute magnitude', 
                          'luminosity distance', 'angular size', 'redshift distance', 'extinction',
                          'how far', 'how distant', 'distance to', 'away from'],
                relatedConcepts: ['distance modulus', 'parallax', 'angular size', 'redshift', 
                                'luminosity distance', 'angular diameter distance', 'comoving distance',
                                'extinction', 'apparent magnitude', 'absolute magnitude', 'standard candle'],
                boost: 1.5
            },
            temperature: {
                keywords: ['temperature', 'wien', 'wavelength', 'peak wavelength', 'spectrum peak',
                          'blackbody', 'stefan-boltzmann', 'luminosity', 'effective temperature',
                          'surface temperature', 'how hot', 'temperature of'],
                relatedConcepts: ['wien displacement law', 'stefan-boltzmann law', 'blackbody radiation',
                                'effective temperature', 'surface temperature', 'color temperature',
                                'spectral type', 'luminosity class'],
                boost: 1.5
            },
            orbital: {
                keywords: ['orbital', 'orbit', 'period', 'semi-major axis', 'kepler', 'orbital velocity',
                          'orbital energy', 'orbital decay', 'binary', 'eccentricity', 'periapsis',
                          'apoapsis', 'orbital distance', 'how does it orbit'],
                relatedConcepts: ['kepler third law', 'orbital period', 'semi-major axis', 'orbital velocity',
                                'orbital energy', 'vis viva', 'escape velocity', 'orbital decay',
                                'binary system', 'eccentricity'],
                boost: 1.5
            },
            transit: {
                keywords: ['transit', 'transit depth', 'inclination', 'orbital inclination', 'transit method',
                          'planet radius', 'star radius', 'impact parameter', 'transit duration'],
                relatedConcepts: ['transit depth', 'orbital inclination', 'semi-major axis', 'planet radius',
                                'star radius', 'impact parameter', 'transit duration', 'orbital period'],
                boost: 1.5
            },
            magnitude: {
                keywords: ['magnitude', 'apparent magnitude', 'absolute magnitude', 'brightness', 'flux',
                          'luminosity', 'distance modulus', 'extinction', 'absorption'],
                relatedConcepts: ['apparent magnitude', 'absolute magnitude', 'distance modulus', 'flux',
                                'luminosity', 'extinction', 'absorption', 'standard candle'],
                boost: 1.4
            },
            whiteDwarf: {
                keywords: ['white dwarf', 'white dwarf', 'wd', 'degenerate', 'chandrasekhar',
                          'white dwarf mass', 'white dwarf radius', 'white dwarf merger'],
                relatedConcepts: ['white dwarf', 'chandrasekhar limit', 'degenerate matter', 'white dwarf mass',
                                'white dwarf radius', 'white dwarf merger', 'type ia supernova'],
                boost: 1.5
            }
        };
        
        const detectedDomains = [];
        for (const [domainName, domainInfo] of Object.entries(domains)) {
            const matchCount = domainInfo.keywords.filter(keyword => questionLower.includes(keyword)).length;
            if (matchCount > 0) {
                detectedDomains.push({
                    domain: domainName,
                    matchCount: matchCount,
                    relatedConcepts: domainInfo.relatedConcepts,
                    boost: domainInfo.boost
                });
            }
        }
        
        // Sort by match count (most relevant first)
        detectedDomains.sort((a, b) => b.matchCount - a.matchCount);
        
        return detectedDomains;
    },
    
    /**
     * Extract all concepts from a question text
     * @param {string} questionText - Question text to analyze
     * @returns {Array<string>} Array of extracted concepts
     */
    extractConceptsFromQuestion: function(questionText) {
        const concepts = new Set();
        const questionLower = questionText.toLowerCase();
        
        // Detect problem domain first (e.g., distance, temperature, orbital)
        const detectedDomains = this.detectProblemDomain(questionText);
        
        // Add domain-related concepts with high priority
        detectedDomains.forEach(domain => {
            domain.relatedConcepts.forEach(concept => {
                concepts.add(concept);
            });
        });
        
        // Get concept hierarchy if available
        const hierarchy = typeof getConceptHierarchy === 'function' ? getConceptHierarchy() : {};
        
        // Extract direct concepts from question
        Object.keys(hierarchy).forEach(concept => {
            const conceptLower = concept.toLowerCase();
            // Check if concept appears in question
            if (questionLower.includes(conceptLower) || 
                questionLower.includes(conceptLower.replace(/\s+/g, '')) ||
                questionLower.includes(conceptLower.replace(/\s+/g, '-'))) {
                concepts.add(concept);
            }
        });
        
        // Extract compound concepts FIRST (before single words) to preserve context
        const compoundConcepts = [
            // Radiation and emission terms (must come before single words)
            'emission power', 'synchrotron power', 'radiation power', 'radiative power',
            'blackbody radiation', 'thermal radiation', 'emission spectrum', 'absorption spectrum',
            'emission line', 'absorption line', 'spectral line', 'line profile',
            // Orbital mechanics (compound terms)
            'orbital mechanics', 'orbital motion', 'orbital dynamics', 'orbital period',
            'orbital velocity', 'orbital energy', 'orbital decay', 'orbital distance',
            // Distance-related terms
            'distance modulus', 'luminosity distance', 'angular diameter distance', 'comoving distance',
            'standard candle', 'cepheid', 'supernova distance', 'redshift distance',
            // Magnitude and extinction
            'apparent magnitude', 'absolute magnitude', 'extinction', 'absorption', 'reddening',
            // Exoplanet and transit specific terms
            'transit depth', 'orbital inclination', 'orbital distance', 'semi-major axis',
            'transit method', 'radial velocity', 'exoplanet detection', 'planet radius',
            'star radius', 'impact parameter', 'transit duration', 'transit timing',
            // Binary and multiple system terms
            'binary system', 'multiple system', 'triple system', 'quadruple system',
            'binary star', 'multiple star', 'triple star', 'quadruple star',
            'binary orbit', 'multiple orbit', 'triple orbit', 'quadruple orbit',
            'binary separation', 'multiple separation', 'triple separation', 'quadruple separation',
            'binary period', 'multiple period', 'triple period', 'quadruple period',
        ];
        
        // Check for compound concepts first (preserves context)
        compoundConcepts.forEach(compound => {
            if (questionLower.includes(compound)) {
                concepts.add(compound);
            }
        });
        
        // Extract from common astrophysics terms (single words - only if not part of compound)
        const astrophysicsTerms = [
            'orbital', 'period', 'velocity', 'mass', 'distance', 'energy', 'temperature',
            'luminosity', 'magnitude', 'binary', 'stellar', 'cosmological', 'redshift',
            'parallax', 'gravity', 'force', 'acceleration', 'frequency', 'wavelength',
            'spectrum', 'radiation', 'flux', 'brightness', 'radius', 'density',
            'pressure', 'evolution', 'fusion', 'nuclear', 'black hole', 'white dwarf',
            'neutron star', 'pulsar', 'quasar', 'galaxy', 'nebula', 'supernova',
            'exoplanet', 'planet', 'star', 'sun', 'moon', 'asteroid', 'comet',
            'kepler', 'hubble', 'doppler', 'wien', 'stefan', 'boltzmann', 'saha',
            'chandrasekhar', 'schwarzschild', 'einstein', 'relativistic', 'quantum',
            'transit', 'inclination', 'eccentricity', 'orbital plane', 'line of sight',
            'interstellar medium', 'ism', 'dust', 'gas',
            'binary eccentricity', 'multiple eccentricity', 'triple eccentricity', 'quadruple eccentricity',
        ];
        
        astrophysicsTerms.forEach(term => {
            if (questionLower.includes(term)) {
                concepts.add(term);
            }
        });
        
        // Extract from formula concepts (check all formulas)
        if (typeof formulas !== 'undefined' && Array.isArray(formulas)) {
            formulas.forEach(formula => {
                if (formula.concepts && Array.isArray(formula.concepts)) {
                    formula.concepts.forEach(concept => {
                        const conceptLower = concept.toLowerCase();
                        if (questionLower.includes(conceptLower) || 
                            conceptLower.split(/\s+/).some(word => questionLower.includes(word))) {
                            concepts.add(concept);
                        }
                    });
                }
                
                // Also check variable names and descriptions
                if (formula.variables && Array.isArray(formula.variables)) {
                    formula.variables.forEach(variable => {
                        const varName = variable.name.toLowerCase();
                        const varDesc = (variable.description || '').toLowerCase();
                        
                        // Check if variable name appears in question
                        if (questionLower.includes(varName) || 
                            varName.split(/\s+/).some(word => questionLower.includes(word))) {
                            concepts.add(variable.name);
                        }
                        
                        // Extract key terms from variable description
                        const keyTerms = ['inclination', 'orbital distance', 'transit depth', 
                                        'semi-major axis', 'eccentricity', 'radius', 'period'];
                        keyTerms.forEach(term => {
                            if (varDesc.includes(term) && questionLower.includes(term)) {
                                concepts.add(term);
                            }
                        });
                    });
                }
            });
        }
        
        // Extract relationship phrases (e.g., "in terms of", "as a function of")
        if (questionLower.includes('in terms of') || questionLower.includes('as a function of') ||
            questionLower.includes('expression for') || questionLower.includes('simplified expression')) {
            // This indicates a relationship question - extract both variables
            const inTermsMatch = questionLower.match(/in terms of\s+([^.,;]+)/);
            const expressionMatch = questionLower.match(/expression for\s+([^.,;]+)/);
            
            if (inTermsMatch) {
                const targetVar = inTermsMatch[1].trim();
                concepts.add(targetVar);
            }
            if (expressionMatch) {
                const targetVar = expressionMatch[1].trim();
                concepts.add(targetVar);
            }
        }
        
        return Array.from(concepts);
    },
    
    /**
     * Expand concepts using hierarchy (find remotely related concepts)
     * CACHED to avoid repeated computation
     * @param {Array<string>} concepts - Initial concepts
     * @returns {Array<string>} Expanded concepts array
     */
    expandConceptsRemotely: function(concepts) {
        // Create cache key from sorted concepts
        const cacheKey = concepts.sort().join('|');
        
        // Check cache first
        if (conceptExpansionCache.has(cacheKey)) {
            return conceptExpansionCache.get(cacheKey);
        }
        
        const expanded = new Set(concepts);
        const hierarchy = typeof getConceptHierarchy === 'function' ? getConceptHierarchy() : {};
        
        concepts.forEach(concept => {
            const conceptLower = concept.toLowerCase();
            const node = hierarchy[conceptLower];
            
            if (node) {
                // Add children
                if (node.children) {
                    node.children.forEach(child => expanded.add(child));
                }
                
                // Add siblings
                if (node.siblings) {
                    node.siblings.forEach(sibling => expanded.add(sibling));
                }
                
                // Add related concepts
                if (node.related) {
                    node.related.forEach(related => expanded.add(related));
                }
                
                // Add parent
                if (node.parent) {
                    expanded.add(node.parent);
                }
                
                // Recursively expand parent
                if (node.parent) {
                    const parentNode = hierarchy[node.parent.toLowerCase()];
                    if (parentNode) {
                        if (parentNode.children) {
                            parentNode.children.forEach(child => expanded.add(child));
                        }
                        if (parentNode.siblings) {
                            parentNode.siblings.forEach(sibling => expanded.add(sibling));
                        }
                    }
                }
            }
        });
        
        const result = Array.from(expanded);
        // Cache the result
        conceptExpansionCache.set(cacheKey, result);
        return result;
    },
    
    /**
     * Find formulas that match concepts (including remotely)
     * @param {Array<string>} concepts - Concepts to match
     * @param {boolean} includeRemote - Whether to include remote matches (default: true)
     * @returns {Array<Object>} Array of matched formulas with scores
     */
    findFormulasByConcepts: function(concepts, includeRemote = true) {
        if (!Array.isArray(concepts) || concepts.length === 0) return [];
        
        // Expand concepts if requested (uses cache)
        const searchConcepts = includeRemote ? 
            this.expandConceptsRemotely(concepts) : 
            concepts;
        
        const conceptSet = new Set(searchConcepts.map(c => c.toLowerCase()));
        const matchedFormulas = [];
        
        if (typeof formulas === 'undefined' || !Array.isArray(formulas)) {
            console.warn('[findFormulasByConcepts] Formulas array not available');
            return matchedFormulas;
        }
        
        // Process ALL formulas in the database for concept matching
        console.log(`[findFormulasByConcepts] Processing all ${formulas.length} formulas for concept matching`);
        
        formulas.forEach(formula => {
            let matchScore = 0;
            const matchedConcepts = [];
            
            // Check formula concepts with context awareness
            if (formula.concepts && Array.isArray(formula.concepts)) {
                formula.concepts.forEach(concept => {
                    const conceptLower = concept.toLowerCase();
                    
                    // Exact match (highest priority)
                    if (conceptSet.has(conceptLower)) {
                        matchScore += 10;
                        matchedConcepts.push(concept);
                    } else {
                        // Check for compound concept matches (preserves context)
                        searchConcepts.forEach(searchConcept => {
                            const searchLower = searchConcept.toLowerCase();
                            
                            // Exact compound match (e.g., "emission power" matches "emission power")
                            if (conceptLower === searchLower) {
                                matchScore += 10;
                                if (!matchedConcepts.includes(concept)) {
                                    matchedConcepts.push(concept);
                                }
                            }
                            // Compound contains search concept (e.g., "synchrotron power" contains "emission power" - but this is weak)
                            else if (conceptLower.includes(searchLower) && searchLower.split(/\s+/).length > 1) {
                                // Only if it's a meaningful compound match
                                matchScore += 3;
                                if (!matchedConcepts.includes(concept)) {
                                    matchedConcepts.push(concept);
                                }
                            }
                            // Single word matches (lower priority, requires context check)
                            else if (searchLower.split(/\s+/).length === 1) {
                                // Only match single words if they appear in compound context
                                const isCompoundContext = searchConcepts.some(sc => 
                                    sc.toLowerCase().split(/\s+/).length > 1 && 
                                    sc.toLowerCase().includes(searchLower)
                                );
                                
                                // If it's a compound context (e.g., "emission power"), be more strict
                                if (isCompoundContext) {
                                    // Only match if the formula concept is also compound and related
                                    if (conceptLower.split(/\s+/).length > 1 && 
                                        (conceptLower.includes(searchLower) || searchLower.includes(conceptLower.split(/\s+/)[0]))) {
                                        matchScore += 2; // Lower score for compound context
                                        if (!matchedConcepts.includes(concept)) {
                                            matchedConcepts.push(concept);
                                        }
                                    }
                                } else {
                                    // Regular single-word partial match
                                    if (conceptLower.includes(searchLower) || 
                                        searchLower.includes(conceptLower) ||
                                        conceptLower.split(/\s+/).some(word => searchLower.includes(word))) {
                                        matchScore += 5;
                                        if (!matchedConcepts.includes(concept)) {
                                            matchedConcepts.push(concept);
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
            }
            
            // Check keywords
            if (formula.keywords && Array.isArray(formula.keywords)) {
                formula.keywords.forEach(keyword => {
                    const keywordLower = keyword.toLowerCase();
                    searchConcepts.forEach(searchConcept => {
                        const searchLower = searchConcept.toLowerCase();
                        if (keywordLower.includes(searchLower) || 
                            searchLower.includes(keywordLower)) {
                            matchScore += 3;
                        }
                    });
                });
            }
            
            // Check name and description
            const nameDesc = ((formula.name || '') + ' ' + (formula.description || '')).toLowerCase();
            searchConcepts.forEach(searchConcept => {
                const searchLower = searchConcept.toLowerCase();
                if (nameDesc.includes(searchLower)) {
                    matchScore += 2;
                }
            });
            
            if (matchScore > 0) {
                matchedFormulas.push({
                    formula: formula,
                    score: matchScore,
                    matchedConcepts: matchedConcepts,
                    isRemoteMatch: matchedConcepts.length < searchConcepts.length
                });
            }
        });
        
        // Sort by score
        matchedFormulas.sort((a, b) => b.score - a.score);
        
        return matchedFormulas;
    },
    
    /**
     * Use semantic search system if available
     * @param {string} questionText - Question text
     * @returns {Array<Object>} Array of matched formulas with semantic scores
     */
    findFormulasSemantically: function(questionText) {
        if (typeof semanticSearchSystem === 'undefined' || 
            typeof semanticSearchSystem.semanticMatch !== 'function') {
            return [];
        }
        
        const matchedFormulas = [];
        
        if (typeof formulas === 'undefined' || !Array.isArray(formulas)) {
            return matchedFormulas;
        }
        
        formulas.forEach(formula => {
            try {
                const semanticScore = semanticSearchSystem.semanticMatch(questionText, formula);
                if (semanticScore && semanticScore > 0) {
                    matchedFormulas.push({
                        formula: formula,
                        score: semanticScore,
                        matchType: 'semantic'
                    });
                }
            } catch (e) {
                // Ignore errors
            }
        });
        
        matchedFormulas.sort((a, b) => b.score - a.score);
        return matchedFormulas;
    }
};

/**
 * Enhanced function to find formulas for ANY astrophysics question
 * @param {string} questionText - Question text
 * @returns {Array<Object>} Array of matched formulas with scores
 */
function findFormulasForQuestion(questionText) {
    const results = [];
    
    // Ensure we have access to all formulas
    if (typeof formulas === 'undefined' || !Array.isArray(formulas) || formulas.length === 0) {
        console.warn('[findFormulasForQuestion] Formulas array not available');
        return results;
    }
    
    console.log(`[findFormulasForQuestion] Searching through ${formulas.length} formulas for: "${questionText}"`);
    
    // Extract concepts from question (includes domain detection)
    const extractedConcepts = conceptMatchingSystem.extractConceptsFromQuestion(questionText);
    
    // Detect problem domain for domain-based boosting
    const detectedDomains = conceptMatchingSystem.detectProblemDomain(questionText);
    if (detectedDomains.length > 0) {
        console.log(`[findFormulasForQuestion] Detected problem domains: ${detectedDomains.map(d => d.domain).join(', ')}`);
    }
    
    // Find formulas by concepts (including remote matches, uses cache, includes domain detection)
    // This processes ALL formulas in the formulas array
    const conceptMatches = conceptMatchingSystem.findFormulasByConcepts(extractedConcepts, true, questionText);
    conceptMatches.forEach(match => {
        let matchType = match.isRemoteMatch ? 'remote_concept' : 'direct_concept';
        if (match.isDomainMatch) {
            matchType += '_domain';
        }
        
        results.push({
            formula: match.formula,
            score: match.score,
            matchType: matchType,
            matchedConcepts: match.matchedConcepts,
            source: 'concept_matching',
            isDomainMatch: match.isDomainMatch || false
        });
    });
    
    // Find formulas using semantic search (processes ALL formulas)
    const semanticMatches = conceptMatchingSystem.findFormulasSemantically(questionText);
    semanticMatches.forEach(match => {
        // Avoid duplicates
        const existing = results.find(r => r.formula.id === match.formula.id);
        if (existing) {
            existing.score += match.score * 0.5; // Boost score
            existing.matchType = existing.matchType + '_semantic';
    } else {
            results.push({
                formula: match.formula,
                score: match.score,
                matchType: 'semantic',
                source: 'semantic_search'
            });
        }
    });
    
    // Sort by score
    results.sort((a, b) => b.score - a.score);
    
    console.log(`[findFormulasForQuestion] Found ${results.length} matching formulas from ${formulas.length} total formulas`);
    
    return results;
}

//////////////////////////////
// Formula Analysis Functions
//////////////////////////////

/**
 * Extract concepts from formula properties dynamically
 * @param {Object} formula - Formula object
 * @returns {Array<string>} Array of extracted concepts
 */
function extractConceptsFromFormula(formula) {
    const concepts = new Set();
    
    // From formula concepts array
    if (formula.concepts && Array.isArray(formula.concepts)) {
        formula.concepts.forEach(c => concepts.add(c));
    }
    
    // From formula name (split into words)
    if (formula.name) {
        const nameWords = formula.name.toLowerCase().split(/[\s_]+/);
        nameWords.forEach(word => {
            if (word.length > 2) concepts.add(word);
        });
    }
    
    // From variable names and descriptions
    if (formula.variables && Array.isArray(formula.variables)) {
        formula.variables.forEach(v => {
            if (v.name) {
                const varWords = v.name.toLowerCase().split(/[\s_]+/);
                varWords.forEach(word => {
                    if (word.length > 3) concepts.add(word);
                });
            }
            if (v.description) {
                // Extract key physics terms from description
                const physicsTerms = ['velocity', 'mass', 'distance', 'energy', 'period', 'temperature', 
                                     'luminosity', 'radius', 'force', 'acceleration', 'frequency', 
                                     'wavelength', 'magnitude', 'density', 'pressure', 'gravity'];
                physicsTerms.forEach(term => {
                    if (v.description.toLowerCase().includes(term)) {
                        concepts.add(term);
                    }
                });
            }
        });
    }
    
    // From description text
    if (formula.description) {
        const descLower = formula.description.toLowerCase();
        const keyTerms = ['orbital', 'stellar', 'binary', 'gravitational', 'radial', 'angular', 
                         'spectral', 'cosmological', 'relativistic', 'thermal', 'kinetic', 'potential'];
        keyTerms.forEach(term => {
            if (descLower.includes(term)) concepts.add(term);
        });
    }
    
    return Array.from(concepts);
}

/**
 * Analyze formula structure to generate intelligent tips
 * @param {Object} formula - Formula object
 * @returns {Object} Structure analysis object
 */
function analyzeFormulaStructure(formula) {
    const analysis = {
        hasTime: false,
        hasDistance: false,
        hasMass: false,
        hasVelocity: false,
        hasEnergy: false,
        hasTemperature: false,
        hasLuminosity: false,
        hasMagnitude: false,
        isOrbital: false,
        isBinary: false,
        isStellar: false,
        isCosmological: false,
        variableCount: 0,
        hasConstants: false
    };
    
    const formulaLower = (formula.name + ' ' + (formula.description || '')).toLowerCase();
    const equationLower = (formula.equation || '').toLowerCase();
    
    // Check for key physics concepts
    analysis.hasTime = formulaLower.includes('period') || formulaLower.includes('time') || 
                      equationLower.includes('t') || equationLower.includes('τ');
    analysis.hasDistance = formulaLower.includes('distance') || formulaLower.includes('radius') || 
                          formulaLower.includes('semi-major') || equationLower.includes('r') || 
                          equationLower.includes('d') || equationLower.includes('a');
    analysis.hasMass = formulaLower.includes('mass') || equationLower.includes('m');
    analysis.hasVelocity = formulaLower.includes('velocity') || formulaLower.includes('speed') || 
                          equationLower.includes('v');
    analysis.hasEnergy = formulaLower.includes('energy') || equationLower.includes('e');
    analysis.hasTemperature = formulaLower.includes('temperature') || equationLower.includes('t');
    analysis.hasLuminosity = formulaLower.includes('luminosity') || equationLower.includes('l');
    analysis.hasMagnitude = formulaLower.includes('magnitude') || equationLower.includes('m');
    
    // Check formula category
    analysis.isOrbital = formulaLower.includes('orbital') || formulaLower.includes('kepler') || 
                        formulaLower.includes('orbit') || formulaLower.includes('binary');
    analysis.isBinary = formulaLower.includes('binary') || formulaLower.includes('two') || 
                        formulaLower.includes('pair');
    analysis.isStellar = formulaLower.includes('stellar') || formulaLower.includes('star') || 
                        formulaLower.includes('luminosity') || formulaLower.includes('magnitude');
    analysis.isCosmological = formulaLower.includes('cosmolog') || formulaLower.includes('hubble') || 
                             formulaLower.includes('redshift') || formulaLower.includes('universe');
    
    // Count variables
    analysis.variableCount = (formula.variables || []).length;
    
    // Check for constants
    analysis.hasConstants = !!(formula.constants && Object.keys(formula.constants).length > 0);
    
    return analysis;
}

/**
 * Analyze question type (direct vs application) - CACHED
 * @param {string} questionText - Question text
 * @returns {Object} Question analysis object
 */
function analyzeQuestionType(questionText) {
    // Check cache first
    if (questionAnalysisCache.has(questionText)) {
        return questionAnalysisCache.get(questionText);
    }
    
    const q = questionText.toLowerCase();
    const analysis = {
        isApplication: false,
        isMultiStep: false,
        requiresExpression: false,
        hasScenario: false,
        relationshipType: null, // 'in_terms_of', 'as_function_of', 'relate', 'express'
        targetVariable: null,
        sourceVariable: null,
        isMultiPart: false,
        partLetter: null, // 'a', 'b', 'c', 'd', 'e'
        referencesPrevious: false,
        referencedPart: null, // which part is referenced
        hasGraph: false,
        graphType: null, // 'radial velocity', 'spectrum', 'light curve', etc.
        requiresDerivative: false,
        requiresChainRule: false,
        requiresIntegration: false
    };
    
    // Detect multi-part questions (a, b, c, d, e)
    const partMatch = q.match(/\b([a-e])\.\s+/);
    if (partMatch) {
        analysis.isMultiPart = true;
        analysis.partLetter = partMatch[1];
    }
    
    // Detect references to previous parts
    const referencePatterns = [
        /from\s+(?:part\s+)?([a-e])/i,
        /using\s+(?:part\s+)?([a-e])/i,
        /(?:from|using)\s+#(\d+)/i,
        /(?:from|using)\s+question\s+(\d+)/i
    ];
    
    referencePatterns.forEach(pattern => {
        const match = q.match(pattern);
        if (match) {
            analysis.referencesPrevious = true;
            analysis.referencedPart = match[1];
        }
    });
    
    // Detect graph-based questions
    const graphIndicators = [
        'graph', 'spectrum', 'light curve', 'radial velocity graph',
        'this is the', 'shown', 'diagram', 'plot', 'figure'
    ];
    
    graphIndicators.forEach(indicator => {
        if (q.includes(indicator)) {
            analysis.hasGraph = true;
            if (q.includes('radial velocity')) analysis.graphType = 'radial_velocity';
            else if (q.includes('spectrum')) analysis.graphType = 'spectrum';
            else if (q.includes('light curve')) analysis.graphType = 'light_curve';
        }
    });
    
    // Detect calculus requirements
    if (q.includes('rate of') || q.includes('d/dt') || q.includes('derivative') || 
        q.includes('dr/dt') || q.includes('da/dt') || q.includes('decay rate')) {
        analysis.requiresDerivative = true;
    }
    
    if (q.includes('chain rule') || q.includes('dr/dE') || q.includes('dE/dr') ||
        (analysis.requiresDerivative && q.includes('in terms of'))) {
        analysis.requiresChainRule = true;
    }
    
    if (q.includes('integrate') || q.includes('integration') || q.includes('∫') ||
        q.includes('how long') && analysis.requiresDerivative) {
        analysis.requiresIntegration = true;
    }
    
    // Detect application/problem-solving questions
    const applicationPhrases = [
        'provide', 'derive', 'show that', 'prove', 'demonstrate',
        'explain how', 'describe', 'calculate', 'determine', 'find',
        'simplified expression', 'expression for', 'in terms of',
        'as a function of', 'relate', 'express'
    ];
    
    applicationPhrases.forEach(phrase => {
        if (q.includes(phrase)) {
            analysis.isApplication = true;
            if (phrase === 'simplified expression' || phrase === 'expression for') {
                analysis.requiresExpression = true;
            }
            if (phrase === 'in terms of' || phrase === 'as a function of' || phrase === 'relate' || phrase === 'express') {
                analysis.relationshipType = phrase.replace(/\s+/g, '_');
            }
        }
    });
    
    // Detect multi-step problems
    const multiStepIndicators = [
        'if', 'given that', 'suppose', 'assume', 'when', 'where',
        'all three', 'system', 'members', 'line up', 'in front'
    ];
    
    multiStepIndicators.forEach(indicator => {
        if (q.includes(indicator)) {
            analysis.isMultiStep = true;
            analysis.hasScenario = true;
        }
    });
    
    // Extract relationship variables
    const inTermsMatch = q.match(/in terms of\s+([^.,;?]+)/);
    const expressionMatch = q.match(/expression for\s+([^.,;?]+)/);
    const relateMatch = q.match(/relate\s+([^.,;?]+)\s+to\s+([^.,;?]+)/);
    
    if (inTermsMatch) {
        analysis.relationshipType = 'in_terms_of';
        analysis.targetVariable = inTermsMatch[1].trim();
    }
    if (expressionMatch) {
        analysis.targetVariable = expressionMatch[1].trim();
    }
    if (relateMatch) {
        analysis.sourceVariable = relateMatch[1].trim();
        analysis.targetVariable = relateMatch[2].trim();
    }
    
    // Cache the result
    questionAnalysisCache.set(questionText, analysis);
    return analysis;
}

//////////////////////////////
// Centralized Formula-Specific Logic
//////////////////////////////

/**
 * Centralized formula-specific instruction generator
 * All formula-specific logic is here - no duplication
 * @param {string} formulaId - Formula ID
 * @param {Object} metadata - Formula metadata (optional)
 * @param {Object} structure - Formula structure analysis (optional)
 * @param {Object} questionAnalysis - Question analysis (optional)
 * @returns {Object} Object with steps, tips, and other guidance
 */
function getFormulaSpecificGuidance(formulaId, metadata = null, structure = null, questionAnalysis = null) {
    const result = {
        steps: [],
        tips: [],
        checkpoints: [],
        keyConcepts: [],
        graphOverview: '',
        graphFeatures: [],
        graphHowToUse: [],
        graphPhysicalMeaning: ''
    };
    
    // PRIORITY 1: Use metadata if available (never overwrite)
    if (metadata?.frqMetadata) {
        const frqMeta = metadata.frqMetadata;
        
        // Instructions
        if (frqMeta.instructions && Array.isArray(frqMeta.instructions)) {
            result.steps = frqMeta.instructions.map((inst, idx) => ({
                step: idx + 1,
                title: inst.title || `Step ${idx + 1}`,
                description: inst.description || inst
            }));
        }
        
        // Tips
        if (frqMeta.tips && Array.isArray(frqMeta.tips)) {
            result.tips = [...frqMeta.tips];
        }
        
        // Hints
        if (frqMeta.hints) {
            if (frqMeta.hints.keyConcepts) result.keyConcepts = [...frqMeta.hints.keyConcepts];
            if (frqMeta.hints.checkpoints) result.checkpoints = [...frqMeta.hints.checkpoints];
        }
        
        // Graph interpretation
        if (frqMeta.graphInterpretation) {
            const graphMeta = frqMeta.graphInterpretation;
            result.graphOverview = graphMeta.overview || '';
            result.graphFeatures = graphMeta.keyFeatures ? [...graphMeta.keyFeatures] : [];
            result.graphHowToUse = graphMeta.howToUse ? [...graphMeta.howToUse] : [];
            result.graphPhysicalMeaning = graphMeta.physicalMeaning || '';
        }
        
        // If metadata provides complete guidance, return it
        if (result.steps.length > 0 || result.tips.length > 0) {
            return result;
        }
    }
    
    // PRIORITY 2: Formula-specific switch-case (only if no metadata)
    switch(formulaId) {
        case 'kepler_third_law':
        case 'kepler_third_law_binary':
        case 'binary_white_dwarf':
            if (result.steps.length === 0) {
            result.steps.push({
                    step: 1,
                title: 'Orbital Period Analysis',
                description: 'Use T² ∝ a³. For binary systems, include total mass (M₁+M₂). Adjust semi-major axis for period changes.'
            });
            }
            if (result.tips.length === 0) {
            result.tips.push('Always convert periods to seconds when using standard units.');
            result.tips.push('Use simplified solar formulas for planets around the Sun.');
            }
            break;
            
        case 'orbital_energy':
            if (result.steps.length === 0) {
            result.steps.push({
                    step: 1,
                title: 'Orbital Energy Considerations',
                description: 'Bound orbits have negative energy. Circular orbits: E = -GMm/(2a). Energy loss leads to decay.'
            });
            }
            if (result.tips.length === 0) {
            result.tips.push('Check for conservation of energy and bound/unbound states.');
            }
            break;
            
        case 'white_dwarf_orbital_decay':
            if (result.steps.length === 0) {
                result.steps.push({
                    step: 1,
                    title: 'Orbital Decay from Gravitational Waves',
                    description: 'Gravitational waves carry away orbital energy. The decay rate da/dt is found using the chain rule: da/dt = (da/dE) × (dE/dt).'
                });
            }
            if (result.tips.length === 0) {
                result.tips.push('Start with orbital energy: E = -GMaMb/(2a).');
                result.tips.push('Find dE/da, then use chain rule: da/dt = (da/dE) × (dE/dt).');
                result.tips.push('The given dE/dt formula accounts for gravitational wave emission.');
                result.tips.push('For multi-part problems: you may need results from previous parts (period, energy, etc.).');
            }
            if (result.graphOverview === '') {
                result.graphOverview = 'Orbital decay rate due to gravitational waves.';
                result.graphFeatures.push('da/dt ∝ a^-4', 'Smaller separations decay faster');
                result.graphHowToUse.push('Input masses and separation to estimate decay rate.');
                result.graphPhysicalMeaning = 'Gravitational waves carry energy away, shrinking orbit.';
            }
            break;
            
        case 'white_dwarf_merger_timescale':
            if (result.steps.length === 0) {
            result.steps.push({
                    step: 1,
                    title: 'Merger Timescale Calculation',
                    description: 'Integrate the decay rate equation: dt/da = f(a), then integrate from current separation to a=0.'
                });
            }
            if (result.tips.length === 0) {
                result.tips.push('Rearrange da/dt to get dt/da = 1/(da/dt).');
                result.tips.push('Integrate dt/da with respect to a from current separation to a=0.');
                result.tips.push('The integration gives time as a function of separation: t ∝ a^4.');
                result.tips.push('Use results from previous parts (decay rate, current separation).');
            }
            if (result.graphOverview === '') {
                result.graphOverview = 'Time until merger of two white dwarfs.';
                result.graphFeatures.push('Merger time ∝ a^4', 'More massive binaries merge faster');
                result.graphHowToUse.push('Vary separation and mass to see timescale changes.');
                result.graphPhysicalMeaning = 'Close binaries merge rapidly; separation dominates timescale.';
            }
            break;
            
        case 'distance_modulus':
            if (result.steps.length === 0) {
            result.steps.push({
                    step: 1,
                title: 'Distance Modulus with Extinction',
                description: 'm - M = 5 log10(d) - 5 + A_v. Include extinction corrections.'
            });
            }
            if (result.tips.length === 0) {
            result.tips.push('Typical Milky Way extinction ~1.8 mag/kpc.');
            }
            if (result.keyConcepts.length === 0) {
                result.keyConcepts.push('Standard candles', 'Extinction', 'Distance ladder');
            }
            if (result.checkpoints.length === 0) {
                result.checkpoints.push('Account for interstellar extinction.');
            }
            break;
            
        case 'wiens_law':
            if (result.steps.length === 0) {
            result.steps.push({
                    step: 1,
                title: 'Temperature from Spectrum',
                description: 'λ_max = 2.898×10⁻³ / T. Peak wavelength indicates surface temperature.'
            });
            }
            if (result.tips.length === 0) {
            result.tips.push('Hot stars appear blue, cooler stars red.');
            }
            break;
            
        case 'transit_depth':
            if (result.steps.length === 0) {
            result.steps.push({
                    step: 1,
                title: 'Transit Depth Analysis',
                    description: 'δ = (Rp/Rs)² for edge-on transits (i=90°). For inclined orbits, the observed depth is reduced by cos²(i).'
            });
            }
            if (result.tips.length === 0) {
            result.tips.push('Use combined period and depth to estimate planet properties.');
                result.tips.push('Edge-on transit (i=90°) gives maximum depth. Inclined orbits (i<90°) have smaller observed depths.');
                result.tips.push('For application problems: "all members line up" or "planet in front" typically means edge-on (i=90°).');
                result.tips.push('To express inclination in terms of orbital distance, relate transit geometry to orbital parameters.');
                result.tips.push('For multi-body systems: consider the center of mass and relative positions.');
            }
            break;
            
        case 'radial_velocity_wavelength':
        case 'radial_velocity_frequency':
            if (result.steps.length === 0) {
                result.steps.push({
                    step: 1,
                    title: 'Radial Velocity from Spectrum',
                    description: 'Measure wavelength shift from spectrum. Use Δλ/λ = v/c for non-relativistic speeds.'
                });
            }
            if (result.tips.length === 0) {
                result.tips.push('Identify the spectral line and its rest wavelength.');
                result.tips.push('Measure the observed wavelength from the graph/spectrum.');
                result.tips.push('Calculate redshift: z = (λ_obs - λ_rest)/λ_rest.');
                result.tips.push('For non-relativistic: v = c × z. For relativistic, use full Doppler formula.');
                result.tips.push('Check if reasonable: compare with Hubble flow or known distances.');
            }
            break;
    }
    
    // PRIORITY 3: Structure-based intelligent fallback (only if no specific guidance)
    if (result.steps.length === 0 && structure) {
        if (structure.isOrbital) {
            result.steps.push({
                step: 1,
                title: 'Orbital Mechanics Considerations',
                description: 'For orbital problems, remember: period squared is proportional to semi-major axis cubed (T² ∝ a³). For binary systems, use total mass (M₁ + M₂).'
            });
            if (result.tips.length === 0) {
                result.tips.push('Always convert periods to seconds when using standard units.');
                result.tips.push('Verify that orbital distances are physically reasonable for the system.');
            }
        } else if (structure.hasEnergy) {
            result.steps.push({
                step: 1,
                title: 'Energy Considerations',
                description: 'Check if energy is conserved or if there are energy loss mechanisms. For bound orbits, energy is negative.'
            });
            if (result.tips.length === 0) {
                result.tips.push('Total energy = kinetic + potential energy.');
            }
        } else if (structure.hasTemperature) {
            result.steps.push({
                step: 1,
                title: 'Temperature Analysis',
                description: 'Determine if this is surface temperature (effective temperature) or central temperature. Check if Wien\'s law or Stefan-Boltzmann law applies.'
            });
            if (result.tips.length === 0) {
                result.tips.push('Hotter objects emit more energy and peak at shorter wavelengths.');
            }
        } else if (structure.hasDistance) {
            result.steps.push({
                step: 1,
                title: 'Distance Measurement',
                description: 'Determine the distance measurement method. Account for extinction if using magnitude-based methods.'
            });
            if (result.tips.length === 0) {
                result.tips.push('Common distance methods: parallax, distance modulus, redshift, standard candles.');
            }
        } else if (structure.hasVelocity) {
            result.steps.push({
                step: 1,
                title: 'Velocity Analysis',
                description: 'Determine if this is orbital velocity, escape velocity, or radial velocity. Check if relativistic effects are needed (v > 0.1c).'
            });
            if (result.tips.length === 0) {
                result.tips.push('Radial velocity can be measured via Doppler shift in spectra.');
            }
        } else if (structure.isStellar) {
            result.steps.push({
                step: 1,
                title: 'Stellar Properties',
                description: 'Compare results with known stellar values. Consider stellar evolution stage and population type.'
            });
            if (result.tips.length === 0) {
                result.tips.push('Use the Sun as a reference: L☉ = 3.828×10²⁶ W, M☉ = 1.989×10³⁰ kg, R☉ = 6.96×10⁸ m.');
            }
        } else if (structure.isCosmological) {
            result.steps.push({
                step: 1,
                title: 'Cosmological Considerations',
                description: 'For cosmological distances, account for redshift and expansion. Use appropriate distance definitions (luminosity distance, angular diameter distance).'
            });
            if (result.tips.length === 0) {
                result.tips.push('Hubble\'s law: v = H₀d, where H₀ ≈ 70 km/s/Mpc.');
            }
        }
    }
    
    // Generic fallback (only if nothing else provided)
    if (result.steps.length === 0 && result.tips.length === 0) {
        result.tips.push('Visualize the relationship using the Graph Interpretation tab.');
        result.tips.push('Check related formulas for additional context.');
    }
    
    return result;
}

//////////////////////////////
// Formula-Specific Common Mistakes Generator
//////////////////////////////

/**
 * Generate formula-specific common mistakes based on formula structure, variables, and concepts
 * @param {Object} formula - Formula object
 * @param {Object} structure - Formula structure analysis
 * @param {Object} metadata - Formula metadata (optional)
 * @returns {Array<string>} Array of formula-specific common mistakes
 */
function generateFormulaSpecificMistakes(formula, structure, metadata = null) {
    const mistakes = [];
    const formulaId = formula.id || '';
    const formulaName = (formula.name || '').toLowerCase();
    const formulaDesc = (formula.description || '').toLowerCase();
    
    // Formula-specific mistakes based on formula ID
    switch(formulaId) {
        case 'gravitational_potential_general':
            mistakes.push('Forgetting the negative sign in gravitational potential (Φ = -GM/r).');
            mistakes.push('Using incorrect units for potential (should be J/kg, not J).');
            mistakes.push('Confusing gravitational potential with potential energy (potential is per unit mass).');
            mistakes.push('Not converting mass units (e.g., Earth masses to kg).');
            break;
            
        case 'kepler_third_law':
        case 'kepler_third_law_binary':
        case 'binary_white_dwarf':
            mistakes.push('Forgetting to convert period to seconds (years/days → seconds).');
            mistakes.push('Using individual mass instead of total mass for binary systems.');
            mistakes.push('Mixing up semi-major axis with radius or distance.');
            mistakes.push('Forgetting to cube the semi-major axis (a³, not a).');
            break;
            
        case 'orbital_velocity':
        case 'escape_velocity':
            mistakes.push('Confusing orbital velocity with escape velocity (v_esc = √2 × v_orb).');
            mistakes.push('Using incorrect distance (should be distance from center, not surface).');
            mistakes.push('Forgetting to take the square root in the final step.');
            break;
            
        case 'distance_modulus':
            mistakes.push('Confusing apparent magnitude (m) with absolute magnitude (M).');
            mistakes.push('Forgetting to account for interstellar extinction.');
            mistakes.push('Using incorrect base for logarithm (must be log₁₀, not ln).');
            mistakes.push('Forgetting the -5 term in the distance modulus equation.');
            break;
            
        case 'wiens_law':
            mistakes.push('Using wavelength in wrong units (must be meters, not nanometers).');
            mistakes.push('Confusing peak wavelength with other wavelengths in the spectrum.');
            mistakes.push('Forgetting to convert temperature to Kelvin if given in Celsius.');
            break;
            
        case 'luminosity':
            mistakes.push('Forgetting to raise temperature to the 4th power (T⁴, not T).');
            mistakes.push('Using radius squared (R²) instead of surface area (4πR²).');
            mistakes.push('Confusing luminosity with flux (luminosity is total power, flux is per unit area).');
            break;
            
        case 'transit_depth':
            mistakes.push('Confusing planet radius with star radius in the ratio (Rp/Rs, not Rs/Rp).');
            mistakes.push('Forgetting that transit depth is (Rp/Rs)², not Rp/Rs.');
            mistakes.push('Not accounting for orbital inclination (edge-on vs inclined).');
            break;
            
        case 'white_dwarf_orbital_decay':
            mistakes.push('Forgetting the negative sign in decay rate (da/dt is negative).');
            mistakes.push('Using incorrect power of separation (should be a³ in denominator).');
            mistakes.push('Confusing decay rate with merger timescale.');
            break;
            
        case 'doppler_shift':
        case 'doppler_shift_approx':
            mistakes.push('Using non-relativistic formula for high velocities (v > 0.1c).');
            mistakes.push('Confusing redshift (z) with velocity (v = cz only for small z).');
            mistakes.push('Using observed wavelength instead of rest wavelength in calculation.');
            break;
            
        case 'angular_size':
            mistakes.push('Confusing angular size with linear size (θ = d/D, not d = θD).');
            mistakes.push('Using incorrect units for angular size (radians vs arcseconds).');
            mistakes.push('Forgetting to convert arcseconds to radians (1" = 1/206265 rad).');
            break;
            
        case 'parallax_distance_arcsec':
        case 'parallax_distance_radians':
            mistakes.push('Confusing parallax angle with distance (d = 1/p, not p = 1/d).');
            mistakes.push('Using parallax in wrong units (arcseconds vs radians).');
            mistakes.push('Forgetting to convert distance from parsecs to desired units.');
            break;
            
        default:
            // Generate mistakes based on formula structure and variables
            if (structure.hasTime) {
                mistakes.push('Mixing time units (seconds vs years vs days).');
            }
            if (structure.isBinary) {
                mistakes.push('Using individual mass instead of total mass for binary systems.');
            }
            if (structure.hasMagnitude) {
                mistakes.push('Confusing apparent and absolute magnitude.');
            }
            if (structure.hasDistance) {
                mistakes.push('Using incorrect distance units (meters vs parsecs vs AU).');
            }
            if (structure.hasMass) {
                mistakes.push('Not converting mass units (kg vs solar masses vs Earth masses).');
            }
            if (structure.hasVelocity) {
                mistakes.push('Confusing orbital velocity with escape velocity or radial velocity.');
            }
            if (structure.hasEnergy) {
                mistakes.push('Forgetting that bound orbits have negative energy.');
            }
            if (structure.hasTemperature) {
                mistakes.push('Using temperature in wrong units (must be Kelvin, not Celsius).');
            }
            if (structure.hasLuminosity) {
                mistakes.push('Confusing luminosity with flux or brightness.');
            }
            
            // Check for specific variable-related mistakes
            const variables = formula.variables || [];
            variables.forEach(v => {
                const varName = (v.name || '').toLowerCase();
                const varSymbol = v.symbol;
                
                if (varName.includes('radius') && !mistakes.some(m => m.includes('radius'))) {
                    mistakes.push(`Confusing ${varName} with diameter or other distance measures.`);
                }
                if (varName.includes('period') && !mistakes.some(m => m.includes('period'))) {
                    mistakes.push('Forgetting to convert period to seconds for calculations.');
                }
                if (varName.includes('mass') && !mistakes.some(m => m.includes('mass'))) {
                    mistakes.push('Not converting mass to consistent units (kg recommended).');
                }
                if (varName.includes('wavelength') && !mistakes.some(m => m.includes('wavelength'))) {
                    mistakes.push('Using wavelength in wrong units (meters vs nanometers).');
                }
            });
            
            // Add universal mistakes if no specific ones found
            if (mistakes.length === 0) {
                mistakes.push('Forgetting unit conversions.');
                mistakes.push('Using incorrect constant values.');
                mistakes.push('Sign errors or ignoring negative values.');
            }
    }
    
    return mistakes;
}

//////////////////////////////
// Unified Instruction Generator (Fixes Step Numbering)
//////////////////////////////

/**
 * Intermediate results storage for multi-step problems
 * Stores computed values from earlier steps for use in later steps
 */
const intermediateResults = new Map();

/**
 * Clear intermediate results (call when starting a new problem)
 */
function clearIntermediateResults() {
    intermediateResults.clear();
}

/**
 * Store intermediate result
 * @param {string} key - Result key (e.g., "period", "energy", "separation")
 * @param {*} value - Result value (number, string, or object)
 */
function storeIntermediateResult(key, value) {
    intermediateResults.set(key, value);
}

/**
 * Get intermediate result
 * @param {string} key - Result key
 * @returns {*} Result value or null
 */
function getIntermediateResult(key) {
    return intermediateResults.get(key) || null;
}

/**
 * Generate usage instructions with proper step numbering
 * FIXED: Uses stepCounter instead of instructions.steps.length + 1
 * @param {Object} formula - Formula object
 * @param {string} questionContext - Question text (optional)
 * @returns {Object} Instructions object with steps, tips, etc.
 */
function generateUsageInstructions(formula, questionContext = '') {
    // Clear intermediate results for new problem
    clearIntermediateResults();
    
    const instructions = {
        steps: [],
        tips: [],
        commonMistakes: [],
        relatedConcepts: [],
        isApplication: false,
        problemAnalysis: null
    };
    
    const formulaId = formula.id || '';
    const metadata = getFormulaMetadata(formulaId);
    const structure = analyzeFormulaStructure(formula);
    
    // Analyze question type (uses cache)
    let questionAnalysis = null;
    if (questionContext) {
        questionAnalysis = analyzeQuestionType(questionContext);
        instructions.isApplication = questionAnalysis.isApplication;
        instructions.problemAnalysis = questionAnalysis;
    }
    
    // Get centralized formula-specific guidance
    const formulaGuidance = getFormulaSpecificGuidance(formulaId, metadata, structure, questionAnalysis);
    
    // FIXED: Use stepCounter instead of instructions.steps.length + 1
    let stepCounter = 1;
    
    // Step 1: Identify variables
    const variableList = (formula.variables || []).map(v => v.symbol).join(', ');
    const variableNames = (formula.variables || []).map(v => `${v.symbol} (${v.name})`).join(', ');
    
    let step1Description = `List all variables in the formula: ${variableNames || variableList}. Determine which are known and which need solving.`;
    
    if (questionAnalysis?.isApplication) {
        if (questionAnalysis.hasScenario) {
            step1Description += ' For application problems, identify what the scenario tells you (e.g., "all three members line up" means edge-on transit, i=90°).';
        }
        if (questionAnalysis.requiresExpression) {
            step1Description += ` You need to create an expression${questionAnalysis.targetVariable ? ` for ${questionAnalysis.targetVariable}` : ''}${questionAnalysis.sourceVariable ? ` in terms of ${questionAnalysis.sourceVariable}` : ''}.`;
        }
    }
    
    instructions.steps.push({
        step: stepCounter++,
        title: 'Identify Known and Unknown Variables',
        description: step1Description
    });
    
    // Step 2: Check units
    let unitGuidance = 'Ensure all values are in correct units. Convert if necessary (e.g., km → m, years → seconds).';
    if (structure.hasTime) {
        unitGuidance += ' Pay special attention to time units (seconds, years, days).';
    }
    if (structure.hasDistance) {
        unitGuidance += ' Check distance units (meters, parsecs, AU).';
    }
    if (structure.hasMass) {
        unitGuidance += ' Verify mass units (kg, solar masses).';
    }
    instructions.steps.push({
        step: stepCounter++,
        title: 'Check Units',
        description: unitGuidance
    });
    
    // Step 3: Enter values
    instructions.steps.push({
        step: stepCounter++,
        title: 'Enter Values',
        description: 'Input known values. Leave unknown variables empty or type "N/A" for symbolic expressions.'
    });
    
    // Step 4: Calculate and verify
    let verifyGuidance = 'Compute the result and verify it makes physical sense. Check units and orders of magnitude.';
    if (structure.isOrbital) {
        verifyGuidance += ' For orbital problems, verify that periods and distances are reasonable for the system.';
    }
    if (structure.isStellar) {
        verifyGuidance += ' For stellar properties, compare with known stellar values (e.g., Sun\'s luminosity, temperature).';
    }
    instructions.steps.push({
        step: stepCounter++,
        title: 'Calculate and Verify',
        description: verifyGuidance
    });
    
    // Step 5+: Add formula-specific steps from centralized guidance
    // Renumber formula-specific steps to continue from stepCounter
    formulaGuidance.steps.forEach(formulaStep => {
        instructions.steps.push({
            step: stepCounter++,
            title: formulaStep.title,
            description: formulaStep.description
        });
    });
    
    // Add application-specific steps
    if (questionAnalysis?.isApplication) {
        // Multi-part questions
        if (questionAnalysis.isMultiPart) {
            instructions.steps.push({
                step: stepCounter++,
                title: `Part ${questionAnalysis.partLetter.toUpperCase()}: Context`,
                description: `This is part ${questionAnalysis.partLetter.toUpperCase()} of a multi-part problem. ${questionAnalysis.referencesPrevious ? `Use results from part ${questionAnalysis.referencedPart || 'previous parts'}.` : 'This may build on previous parts or be independent.'}`
            });
        }
        
        // Graph-based questions
        if (questionAnalysis.hasGraph) {
            let graphGuidance = 'Extract data from the graph. ';
            if (questionAnalysis.graphType === 'radial_velocity') {
                graphGuidance += 'For radial velocity graphs: identify maximum/minimum velocities, period, and amplitude. Use these to find orbital parameters.';
            } else if (questionAnalysis.graphType === 'spectrum') {
                graphGuidance += 'For spectrum graphs: identify absorption/emission lines, their wavelengths, and any shifts from rest wavelengths.';
            } else if (questionAnalysis.graphType === 'light_curve') {
                graphGuidance += 'For light curves: identify transit depth, duration, and period.';
            }
            instructions.steps.push({
                step: stepCounter++,
                title: 'Extract Data from Graph',
                description: graphGuidance
            });
        }
        
        // Scenario understanding
        if (questionAnalysis.hasScenario) {
            instructions.steps.push({
                step: stepCounter++,
                title: 'Understand the Scenario',
                description: 'Extract key information from the scenario. Identify what conditions are given (e.g., edge-on transit, specific alignment, given values).'
            });
        }
        
        // Derivative/chain rule problems
        if (questionAnalysis.requiresDerivative) {
            let derivativeGuidance = 'This problem requires taking derivatives. ';
            if (questionAnalysis.requiresChainRule) {
                derivativeGuidance += 'Use the chain rule: dr/dt = (dr/dE) × (dE/dt). Find each derivative separately, then multiply.';
            } else {
                derivativeGuidance += 'Differentiate the given expression with respect to time (or the appropriate variable).';
            }
            instructions.steps.push({
                step: stepCounter++,
                title: 'Apply Calculus',
                description: derivativeGuidance
            });
        }
        
        // Integration problems
        if (questionAnalysis.requiresIntegration) {
            instructions.steps.push({
                step: stepCounter++,
                title: 'Integrate to Find Time',
                description: 'Rearrange the derivative equation to dt/dr = f(r), then integrate with respect to r. Use appropriate limits (from current separation to r=0 for merger).'
            });
        }
        
        // Relationship problems
        if (questionAnalysis.relationshipType) {
            let relationshipGuidance = '';
            if (questionAnalysis.relationshipType === 'in_terms_of') {
                relationshipGuidance = `You need to express ${questionAnalysis.targetVariable || 'the unknown'} in terms of ${questionAnalysis.sourceVariable || 'the given variable'}. `;
                relationshipGuidance += 'Start with the base formula and algebraically rearrange to isolate the target variable.';
            } else if (questionAnalysis.relationshipType === 'as_function_of') {
                relationshipGuidance = `Express the result as a function of ${questionAnalysis.sourceVariable || 'the given variable'}. `;
                relationshipGuidance += 'Substitute known relationships and simplify.';
            }
            
            instructions.steps.push({
                step: stepCounter++,
                title: 'Create the Relationship',
                description: relationshipGuidance
            });
        }
        
        // Simplified expressions
        if (questionAnalysis.requiresExpression) {
            instructions.steps.push({
                step: stepCounter++,
                title: 'Simplify the Expression',
                description: 'Combine terms, cancel common factors, and simplify to the most compact form. Check that units are consistent and the expression makes physical sense.'
            });
        }
        
        // Multi-step guidance
        if (questionAnalysis.isMultiStep) {
            instructions.tips.push('For multi-step problems, work through each step systematically.');
            instructions.tips.push('Use intermediate results from earlier steps in later calculations.');
            instructions.tips.push('Check that your final expression has the correct variables and dependencies.');
        }
    }
    
    // Add question-specific reasoning tips
    if (questionContext && (!questionAnalysis || !questionAnalysis.isApplication)) {
        instructions.steps.push({
            step: stepCounter++,
            title: 'Contextual Reasoning',
            description: `Consider the question: "${questionContext}". Explain why each step affects the outcome.`
        });
    }
    
    // Tips from centralized guidance (prioritize metadata, then formula-specific, then structure-based)
    if (formulaGuidance.tips.length > 0) {
        instructions.tips.push(...formulaGuidance.tips);
    }
    
    // Generate formula-specific common mistakes
    // PRIORITY 1: Use metadata if available
    if (metadata?.frqMetadata?.commonMistakes && metadata.frqMetadata.commonMistakes.length > 0) {
        instructions.commonMistakes.push(...metadata.frqMetadata.commonMistakes);
    } else {
        // PRIORITY 2: Generate formula-specific mistakes based on formula structure and variables
        const formulaSpecificMistakes = generateFormulaSpecificMistakes(formula, structure, metadata);
        instructions.commonMistakes.push(...formulaSpecificMistakes);
    }
    
    // Related concepts (extract dynamically)
    const extractedConcepts = extractConceptsFromFormula(formula);
    if (metadata?.concepts?.length > 0) {
        instructions.relatedConcepts.push(...metadata.concepts.slice(0, 5));
    } else if (formula.concepts?.length > 0) {
        instructions.relatedConcepts.push(...formula.concepts.slice(0, 5));
    } else if (extractedConcepts.length > 0) {
        instructions.relatedConcepts.push(...extractedConcepts.slice(0, 5));
    }
    
    return instructions;
}

//////////////////////////////
// Contextual Hints Generator
//////////////////////////////

/**
 * Generate contextual hints (uses centralized guidance)
 * @param {Object} formula - Formula object
 * @param {string} questionText - Question text (optional)
 * @returns {Object} Hints object
 */
function generateContextualHints(formula, questionText = '') {
    const hints = { 
        problemType: null, 
        keyConcepts: [], 
        approach: [], 
        checkpoints: [], 
        alternativeApproaches: [],
        relatedConcepts: []
    };
    
    const formulaId = formula.id || '';
    const metadata = getFormulaMetadata(formulaId);
    const structure = analyzeFormulaStructure(formula);
    const q = questionText.toLowerCase();
    
    // Extract concepts from question and expand remotely (uses cache)
    if (questionText && typeof conceptMatchingSystem !== 'undefined') {
        const questionConcepts = conceptMatchingSystem.extractConceptsFromQuestion(questionText);
        const expandedConcepts = conceptMatchingSystem.expandConceptsRemotely(questionConcepts);
        hints.relatedConcepts = expandedConcepts.slice(0, 10);
    }
    
    // Enhanced problem type detection (uses cached question analysis)
    const questionAnalysis = questionText ? analyzeQuestionType(questionText) : null;
    
    // Detect application problems
    if (questionAnalysis?.isApplication) {
        if (questionAnalysis.requiresExpression) {
            hints.problemType = 'Expression Derivation Problem';
        } else if (questionAnalysis.relationshipType) {
            hints.problemType = 'Relationship Problem';
        } else if (questionAnalysis.isMultiStep) {
            hints.problemType = 'Multi-Step Application Problem';
        } else {
            hints.problemType = 'Application Problem';
        }
    } else if (q.includes('period') || q.includes('how long') || q.includes('timescale') || q.includes('lifetime')) {
        hints.problemType = 'Time/Period Problem';
    } else if (q.includes('velocity') || q.includes('speed') || q.includes('how fast') || q.includes('radial velocity')) {
        hints.problemType = 'Velocity Problem';
    } else if (q.includes('distance') || q.includes('how far') || q.includes('parallax') || q.includes('separation')) {
        hints.problemType = 'Distance Problem';
    } else if (q.includes('temperature') || q.includes('how hot') || q.includes('wien') || q.includes('spectrum')) {
        hints.problemType = 'Temperature Problem';
    } else if (q.includes('energy') || q.includes('luminosity') || q.includes('brightness') || q.includes('flux')) {
        hints.problemType = 'Energy/Radiation Problem';
    } else if (q.includes('mass') || q.includes('density')) {
        hints.problemType = 'Mass/Density Problem';
    } else if (q.includes('magnitude') || q.includes('brightness')) {
        hints.problemType = 'Magnitude/Photometry Problem';
    } else if (q.includes('binary') || q.includes('two') || q.includes('pair') || q.includes('three members')) {
        hints.problemType = 'Binary/Multi-Body System Problem';
    } else if (q.includes('transit') || q.includes('inclination')) {
        hints.problemType = 'Transit/Exoplanet Problem';
    }
    
    // Get centralized guidance
    const formulaGuidance = getFormulaSpecificGuidance(formulaId, metadata, structure, questionAnalysis);
    
    // PRIORITY: Use metadata hints first, then formula-specific, then structure-based
    if (metadata?.frqMetadata?.hints) {
            const metaHints = metadata.frqMetadata.hints;
            if (metaHints.keyConcepts) hints.keyConcepts.push(...metaHints.keyConcepts);
            if (metaHints.approach) hints.approach.push(...metaHints.approach);
            if (metaHints.checkpoints) hints.checkpoints.push(...metaHints.checkpoints);
            if (metaHints.alternativeApproaches) hints.alternativeApproaches.push(...metaHints.alternativeApproaches);
        }
        
    // Add formula-specific guidance if metadata didn't provide it
    if (hints.keyConcepts.length === 0 && formulaGuidance.keyConcepts.length > 0) {
        hints.keyConcepts.push(...formulaGuidance.keyConcepts);
    }
    if (hints.checkpoints.length === 0 && formulaGuidance.checkpoints.length > 0) {
        hints.checkpoints.push(...formulaGuidance.checkpoints);
    }
    
    // Generate approach steps if not provided
    if (hints.approach.length === 0) {
        // Generate approach based on question type and structure
        if (questionAnalysis?.hasGraph) {
            if (questionAnalysis.graphType === 'radial_velocity') {
                hints.approach.push('Extract from radial velocity graph: maximum velocities (Va, Vb), period (P).');
                hints.approach.push('Use center of mass: MaVa + MbVb = 0 to find mass ratio.');
                hints.approach.push('Calculate total velocity: V = Va + Vb (or |Va| + |Vb|).');
                hints.approach.push('Use orbital geometry: d = VP/(2π) where d is separation.');
                hints.approach.push('Apply Kepler\'s third law: (Ma+Mb) = d³/P².');
            } else if (questionAnalysis.graphType === 'spectrum') {
                hints.approach.push('Identify spectral lines from the graph (e.g., Si II at 640nm).');
                hints.approach.push('Find rest wavelength (e.g., 615nm for Si II).');
                hints.approach.push('Calculate redshift: z = (λ_obs - λ_rest)/λ_rest.');
                hints.approach.push('For non-relativistic: v = c × z.');
            } else if (questionAnalysis.graphType === 'light_curve') {
                hints.approach.push('Identify transit depth, duration, and period from light curve.');
                hints.approach.push('Use transit depth to find planet-to-star radius ratio.');
            }
        } else if (questionAnalysis?.isApplication) {
            if (questionAnalysis.hasScenario) {
                hints.approach.push('Extract key information from the scenario description.');
                hints.approach.push('Identify what conditions are implied (e.g., edge-on transit, specific alignment).');
            }
            if (questionAnalysis.relationshipType === 'in_terms_of') {
                hints.approach.push(`Start with the base formula and rearrange to express ${questionAnalysis.targetVariable || 'the unknown'} in terms of ${questionAnalysis.sourceVariable || 'the given variable'}.`);
                hints.approach.push('Substitute known relationships and simplify algebraically.');
            }
            if (questionAnalysis.requiresExpression) {
                hints.approach.push('Work through the algebra step-by-step to derive the expression.');
                hints.approach.push('Simplify to the most compact form possible.');
        }
    } else {
            // Structure-based approach
            if (structure.isOrbital) {
                hints.approach.push('Identify the orbital parameters (period, semi-major axis, masses).');
                hints.approach.push('Determine if this is a single-body or binary system problem.');
            }
            if (structure.hasDistance) {
                hints.approach.push('Determine the distance measurement method (parallax, magnitude, redshift).');
            }
            if (structure.hasVelocity) {
                hints.approach.push('Determine if this is orbital, escape, or radial velocity.');
            }
        }
    }
    
    // Generate checkpoints if not provided
    if (hints.checkpoints.length === 0) {
        if (structure.hasTime) {
            hints.checkpoints.push('Verify time/period is in correct units (seconds).');
            hints.checkpoints.push('Check that the timescale is physically reasonable.');
        }
        if (structure.hasDistance) {
            hints.checkpoints.push('Verify distance units (meters, parsecs, AU).');
            hints.checkpoints.push('Check that distance is reasonable for the method used.');
        }
        if (structure.hasMass) {
            hints.checkpoints.push('Verify mass units (kg, solar masses).');
            if (structure.isBinary) {
                hints.checkpoints.push('Check that total mass is reasonable for the system type.');
            }
        }
        if (structure.hasVelocity) {
            hints.checkpoints.push('Verify velocity units (m/s, km/s).');
            hints.checkpoints.push('Check if velocity is reasonable (e.g., orbital vs escape velocity).');
        }
        if (structure.hasEnergy) {
            hints.checkpoints.push('Check energy sign (negative for bound orbits).');
            hints.checkpoints.push('Verify energy units (Joules).');
        }
        if (structure.hasMagnitude) {
            hints.checkpoints.push('Distinguish between apparent and absolute magnitude.');
            hints.checkpoints.push('Account for interstellar extinction if needed.');
        }
        if (structure.isStellar) {
            hints.checkpoints.push('Compare results with known stellar values (e.g., Sun).');
        }
        
        // Generic checkpoints
        if (hints.checkpoints.length === 0) {
            hints.checkpoints.push('Verify all units are consistent.');
            hints.checkpoints.push('Check that the result makes physical sense.');
        }
    }
    
    // Key concepts fallback
    if (hints.keyConcepts.length === 0) {
        const extractedConcepts = extractConceptsFromFormula(formula);
        if (metadata?.concepts?.length > 0) {
            hints.keyConcepts.push(...metadata.concepts.slice(0, 3));
        } else if (formula.concepts?.length > 0) {
            hints.keyConcepts.push(...formula.concepts.slice(0, 3));
        } else if (extractedConcepts.length > 0) {
            hints.keyConcepts.push(...extractedConcepts.slice(0, 3));
        }
    }
    
    return hints;
}

//////////////////////////////
// Graph Interpretation Generator (Fixes Overwriting)
//////////////////////////////

/**
 * Generate graph interpretation - FIXED: Accumulates instead of overwriting
 * @param {Object} formula - Formula object
 * @param {string} questionContext - Question context (optional)
 * @returns {Object} Graph interpretation object
 */
function generateGraphInterpretation(formula, questionContext = '') {
    const interpretation = { 
        title: `Graph Interpretation: ${formula.name || 'Formula'}`, 
        overview: '', 
        keyFeatures: [], 
        howToUse: [], 
        physicalMeaning: '' 
    };
    
    const formulaId = formula.id || '';
    const metadata = getFormulaMetadata(formulaId);
    const structure = analyzeFormulaStructure(formula);
    
    // Get centralized guidance
    const formulaGuidance = getFormulaSpecificGuidance(formulaId, metadata, structure, null);
    
    // PRIORITY 1: Use metadata graph interpretation (never overwrite)
    if (metadata?.frqMetadata?.graphInterpretation) {
        const graphMeta = metadata.frqMetadata.graphInterpretation;
        interpretation.overview = graphMeta.overview || '';
        interpretation.keyFeatures = graphMeta.keyFeatures ? [...graphMeta.keyFeatures] : [];
        interpretation.howToUse = graphMeta.howToUse ? [...graphMeta.howToUse] : [];
        interpretation.physicalMeaning = graphMeta.physicalMeaning || '';
    }
    // PRIORITY 2: Use formula-specific graph guidance
    else if (formulaGuidance.graphOverview) {
        interpretation.overview = formulaGuidance.graphOverview;
        interpretation.keyFeatures = [...formulaGuidance.graphFeatures];
        interpretation.howToUse = [...formulaGuidance.graphHowToUse];
        interpretation.physicalMeaning = formulaGuidance.graphPhysicalMeaning;
    }
    // PRIORITY 3: Generate intelligent interpretation from structure (ACCUMULATES)
    else {
        // FIXED: Accumulate instead of overwrite - check all structure properties
        const structureParts = [];
        
        if (structure.isOrbital) {
            structureParts.push({
                overview: 'Shows the relationship between orbital parameters (period, separation, mass).',
                features: [
                    'Period squared is proportional to semi-major axis cubed (T² ∝ a³)',
                    structure.isBinary ? 'Higher total mass requires shorter period for same separation' : null
                ].filter(Boolean),
                howToUse: [
                    'Enter masses, vary separation to see period change',
                    'Or enter period and masses to find required separation'
                ],
                meaning: 'Larger separations require longer orbital periods. More massive systems orbit faster at the same separation.'
            });
        }
        
        if (structure.hasEnergy) {
            structureParts.push({
                overview: 'Shows how energy depends on the key variables in the formula.',
                features: [
                    'Energy relationships follow conservation principles',
                    structure.hasDistance ? 'Energy typically decreases (more negative) as distance decreases' : null
                ].filter(Boolean),
                howToUse: ['Enter known values, vary the unknown to see energy trend'],
                meaning: 'Energy conservation and loss mechanisms determine system evolution.'
            });
        }
        
        if (structure.hasDistance) {
            structureParts.push({
                overview: 'Shows distance relationships and how they depend on other variables.',
                features: [
                    'Distance measurements depend on the method used',
                    structure.hasMagnitude ? 'Magnitude-based distances follow logarithmic relationships' : null
                ].filter(Boolean),
                howToUse: ['Enter magnitude or parallax values to find distance'],
                meaning: 'Distance measurements are fundamental to understanding stellar and galactic properties.'
            });
        }
        
        if (structure.hasVelocity) {
            structureParts.push({
                overview: 'Shows velocity relationships and dependencies.',
                features: ['Velocity depends on mass and distance in gravitational systems'],
                howToUse: ['Enter mass and distance to find velocity'],
                meaning: 'Velocity determines orbital dynamics and escape conditions.'
            });
        }
        
        if (structure.hasTemperature) {
            structureParts.push({
                overview: 'Shows temperature relationships and dependencies.',
                features: ['Temperature affects emission properties and spectral features'],
                howToUse: ['Enter wavelength or luminosity to find temperature'],
                meaning: 'Temperature determines stellar classification and emission characteristics.'
            });
        }
        
        if (structure.hasLuminosity) {
            structureParts.push({
                overview: 'Shows luminosity relationships and dependencies.',
                features: ['Luminosity depends on radius and temperature (Stefan-Boltzmann)'],
                howToUse: ['Enter radius and temperature to find luminosity'],
                meaning: 'Luminosity determines stellar classification and energy output.'
            });
        }
        
        // FIXED: Accumulate all structure parts instead of using else-if
        if (structureParts.length > 0) {
            // Combine overviews
            interpretation.overview = structureParts.map(p => p.overview).join(' ');
            
            // Merge features (avoid duplicates)
            structureParts.forEach(part => {
                part.features.forEach(feature => {
                    if (!interpretation.keyFeatures.includes(feature)) {
                        interpretation.keyFeatures.push(feature);
                    }
                });
            });
            
            // Merge howToUse (avoid duplicates)
            structureParts.forEach(part => {
                part.howToUse.forEach(use => {
                    if (!interpretation.howToUse.includes(use)) {
                        interpretation.howToUse.push(use);
                    }
                });
            });
            
            // Combine physical meanings
            interpretation.physicalMeaning = structureParts.map(p => p.meaning).join(' ');
        } else {
            // Generic interpretation
            interpretation.overview = `Visualizes the mathematical relationship in ${formula.name || 'this formula'}.`;
            interpretation.keyFeatures.push('Observe how variables influence each other');
            interpretation.keyFeatures.push('Look for linear, inverse, or power-law relationships');
            
            // Analyze equation to detect relationships
            const equation = formula.equation || '';
            if (equation.includes('²') || equation.includes('^2')) {
                interpretation.keyFeatures.push('Quadratic relationship detected');
            }
            if (equation.includes('³') || equation.includes('^3')) {
                interpretation.keyFeatures.push('Cubic relationship detected');
            }
            if (equation.includes('√') || equation.includes('sqrt')) {
                interpretation.keyFeatures.push('Square root relationship detected');
            }
            if (equation.includes('log')) {
                interpretation.keyFeatures.push('Logarithmic relationship detected');
            }
            
            interpretation.howToUse.push('Enter known values and vary the unknown to see the relationship');
            interpretation.physicalMeaning = 'The graph shows how changing one variable affects the result, revealing the underlying physical relationship.';
        }
    }
    
    return interpretation;
}

//////////////////////////////
// Initialization
//////////////////////////////

// Initialize metadata when formulas are loaded
// FIXED: Multiple initialization attempts to handle async loading
// FIXED: Store timer IDs for cleanup to prevent memory leaks
let initTimers = [];

if (typeof document !== 'undefined') {
    const tryInit = () => {
        if (!metadataInitialized) {
            initializeFRQMetadata();
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        tryInit();
    }
    
    // Also try after delays (in case formulas load asynchronously)
    // Store timer IDs for cleanup
    initTimers.push(setTimeout(tryInit, 500));
    initTimers.push(setTimeout(tryInit, 1000));
    initTimers.push(setTimeout(tryInit, 2000));
}

/**
 * Cleanup function for FRQ timers
 * Call this to prevent memory leaks from timers
 */
function cleanupFRQTimers() {
    initTimers.forEach(timer => clearTimeout(timer));
    initTimers = [];
}

//////////////////////////////
// Module Exports
//////////////////////////////

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateConfidenceScore,
        getConfidenceLevel,
        generateUsageInstructions,
        generateContextualHints,
        generateGraphInterpretation,
        initializeFRQMetadata,
        getFormulaMetadata,
        conceptMatchingSystem,
        findFormulasForQuestion,
        extractConceptsFromFormula,
        analyzeFormulaStructure,
        analyzeQuestionType,
        clearCaches,
        clearIntermediateResults,
        storeIntermediateResult,
        getIntermediateResult,
        cleanupFRQTimers
    };
}

// Export to window for global access
if (typeof window !== 'undefined') {
    window.CONFIDENCE_CONFIG = CONFIDENCE_CONFIG;
    window.calculateConfidenceScore = calculateConfidenceScore;
    window.getConfidenceLevel = getConfidenceLevel;
    window.getConfidenceBreakdown = getConfidenceBreakdown;
    window.conceptMatchingSystem = conceptMatchingSystem;
    window.findFormulasForQuestion = findFormulasForQuestion;
    window.clearIntermediateResults = clearIntermediateResults;
    window.storeIntermediateResult = storeIntermediateResult;
    window.getIntermediateResult = getIntermediateResult;
    window.cleanupFRQTimers = cleanupFRQTimers;
}
