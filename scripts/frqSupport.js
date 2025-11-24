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
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

/**
 * Normalize score to percentage
 * @param {number} score - Raw score
 * @param {number} maxScore - Maximum possible score
 * @param {number} scale - Scale factor (default: 1000)
 * @returns {number} Normalized score
 */
function normalizeScore(score, maxScore, scale = 1000) {
    if (!maxScore || maxScore === 0) return 0;
    return (score / maxScore) * scale;
}

//////////////////////////////
// Confidence Scoring
//////////////////////////////

/**
 * Calculate confidence score based on match metrics
 * @param {number} score - Relevance score
 * @param {number} maxScore - Maximum score
 * @param {Object} metrics - Match metrics object
 * @param {number} historyFactor - Historical performance factor (default: 1)
 * @returns {number} Confidence score (0-100)
 */
function calculateConfidenceScore(score, maxScore, metrics = {}, historyFactor = 1) {
    const normalizedScore = normalizeScore(score, maxScore);
    
    // Base confidence 0-70%
    let confidence = clamp(normalizedScore / 10, 0, 70);
    
    // Adaptive boosts based on matching metrics
    if (metrics.nameMatch) confidence += 15;
    if (metrics.questionPatternMatch) confidence += 10;
    if (metrics.conceptMatch) confidence += 5;
    if (metrics.semanticSimilarityScore) confidence += clamp(metrics.semanticSimilarityScore * 10, 0, 10);
    if (metrics.matchedConcepts?.length > 2) confidence += 2;
    
    // Historical performance factor (0.8-1.2)
    confidence *= historyFactor;
    
    return clamp(Math.round(confidence), 0, 100);
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
 * @param {number} score - Relevance score
 * @param {number} maxScore - Maximum score
 * @param {Object} metrics - Match metrics object
 * @param {number} historyFactor - Historical performance factor (default: 1)
 * @returns {Object} Breakdown object with components array and total
 */
function getConfidenceBreakdown(score, maxScore, metrics = {}, historyFactor = 1) {
    const normalizedScore = normalizeScore(score, maxScore);
    const baseConfidence = clamp(normalizedScore / 10, 0, 70);
    
    const components = [];
    
    // Base score contribution
    components.push({
        label: 'Base Relevance Score',
        value: Math.round(baseConfidence),
        description: `Based on search relevance (${Math.round(normalizedScore)} normalized points)`
    });
    
    // Name match boost
    if (metrics.nameMatch) {
        components.push({
            label: 'Name Match',
            value: 15,
            description: 'Formula name matches your search query'
        });
    }
    
    // Question pattern match boost
    if (metrics.questionPatternMatch) {
        components.push({
            label: 'Question Pattern Match',
            value: 10,
            description: 'Matches natural language question patterns'
        });
    }
    
    // Concept match boost
    if (metrics.conceptMatch) {
        components.push({
            label: 'Concept Match',
            value: 5,
            description: 'Matches key astrophysics concepts'
        });
    }
    
    // Semantic similarity boost
    if (metrics.semanticSimilarityScore) {
        const semanticBoost = clamp(metrics.semanticSimilarityScore * 10, 0, 10);
        if (semanticBoost > 0) {
            components.push({
                label: 'Semantic Similarity',
                value: Math.round(semanticBoost),
                description: `Meaning similarity: ${(metrics.semanticSimilarityScore * 100).toFixed(0)}%`
            });
        }
    }
    
    // Multiple concepts boost
    if (metrics.matchedConcepts && metrics.matchedConcepts.length > 2) {
        components.push({
            label: 'Multiple Concept Matches',
            value: 2,
            description: `${metrics.matchedConcepts.length} related concepts matched`
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
 */
const conceptExpansionCache = new Map();

/**
 * Cache for formula metadata lookups
 * Key: formula ID, Value: metadata object
 */
const metadataCache = new Map();

/**
 * Cache for question analysis results
 * Key: question text, Value: analysis object
 */
const questionAnalysisCache = new Map();

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

/**
 * Initialize metadata from formulas array
 * Called when formulas.js is loaded
 */
function initializeFRQMetadata() {
    if (typeof formulas === 'undefined' || !Array.isArray(formulas)) {
        if (typeof logger !== 'undefined') {
            logger.warn('Formulas array not available for FRQ metadata initialization');
        } else {
            console.warn('Formulas array not available for FRQ metadata initialization');
        }
        return;
    }
    
    formulas.forEach(formula => {
        if (!formula.id) return;
        
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
    
    if (typeof logger !== 'undefined') {
        logger.log(`Initialized FRQ metadata for ${Object.keys(formulaFRQMetadata).length} formulas`);
    }
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
     * Extract all concepts from a question text
     * @param {string} questionText - Question text to analyze
     * @returns {Array<string>} Array of extracted concepts
     */
    extractConceptsFromQuestion: function(questionText) {
        const concepts = new Set();
        const questionLower = questionText.toLowerCase();
        
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
        
        // Extract from common astrophysics terms
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
            // Exoplanet and transit specific terms
            'transit', 'transit depth', 'inclination', 'orbital inclination', 'orbital distance',
            'semi-major axis', 'eccentricity', 'orbital plane', 'line of sight',
            'transit method', 'radial velocity', 'exoplanet detection', 'planet radius',
            'star radius', 'impact parameter', 'transit duration', 'transit timing'
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
            
            // Check formula concepts
            if (formula.concepts && Array.isArray(formula.concepts)) {
                formula.concepts.forEach(concept => {
                    const conceptLower = concept.toLowerCase();
                    if (conceptSet.has(conceptLower)) {
                        matchScore += 10;
                        matchedConcepts.push(concept);
                    } else {
                        // Check for partial matches
                        searchConcepts.forEach(searchConcept => {
                            const searchLower = searchConcept.toLowerCase();
                            if (conceptLower.includes(searchLower) || 
                                searchLower.includes(conceptLower) ||
                                conceptLower.split(/\s+/).some(word => searchLower.includes(word))) {
                                matchScore += 5;
                                if (!matchedConcepts.includes(concept)) {
                                    matchedConcepts.push(concept);
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
    
    // Extract concepts from question
    const extractedConcepts = conceptMatchingSystem.extractConceptsFromQuestion(questionText);
    
    // Find formulas by concepts (including remote matches, uses cache)
    // This processes ALL formulas in the formulas array
    const conceptMatches = conceptMatchingSystem.findFormulasByConcepts(extractedConcepts, true);
    conceptMatches.forEach(match => {
        results.push({
            formula: match.formula,
            score: match.score,
            matchType: match.isRemoteMatch ? 'remote_concept' : 'direct_concept',
            matchedConcepts: match.matchedConcepts,
            source: 'concept_matching'
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
    
    // Common mistakes (universal + structure-specific)
    instructions.commonMistakes.push('Forgetting unit conversions.');
    instructions.commonMistakes.push('Using incorrect mass or constant values.');
    instructions.commonMistakes.push('Sign errors or ignoring negative values.');
    instructions.commonMistakes.push('Not accounting for constants (G, c, σ, etc.).');
    
    // Add structure-specific mistakes
    if (structure.hasTime) {
        instructions.commonMistakes.push('Mixing time units (seconds vs years vs days).');
    }
    if (structure.isBinary) {
        instructions.commonMistakes.push('Using individual mass instead of total mass for binary systems.');
    }
    if (structure.hasMagnitude) {
        instructions.commonMistakes.push('Confusing apparent and absolute magnitude.');
    }
    
    // Add formula-specific mistakes from metadata
    if (metadata?.frqMetadata?.commonMistakes) {
        instructions.commonMistakes.push(...metadata.frqMetadata.commonMistakes);
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
if (typeof document !== 'undefined') {
    // Wait for DOM and formulas to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeFRQMetadata, 100);
        });
    } else {
        setTimeout(initializeFRQMetadata, 100);
    }
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
        getIntermediateResult
    };
}

// Export to window for global access
if (typeof window !== 'undefined') {
    window.conceptMatchingSystem = conceptMatchingSystem;
    window.findFormulasForQuestion = findFormulasForQuestion;
    window.clearIntermediateResults = clearIntermediateResults;
    window.storeIntermediateResult = storeIntermediateResult;
    window.getIntermediateResult = getIntermediateResult;
}
