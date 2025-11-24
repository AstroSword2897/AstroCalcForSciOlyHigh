/**
 * Enhanced FRQ (Free Response Question) Support System
 * Provides adaptive confidence scoring, dynamic usage instructions, graph interpretation, and contextual guidance
 * Upgraded for research-grade astronomy and physics problem solving
 */

//////////////////////////////
// Helper Utilities
//////////////////////////////

// Clamp a value between min and max
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

// Normalize score to percentage
function normalizeScore(score, maxScore, scale = 1000) {
    if (!maxScore || maxScore === 0) return 0;
    return (score / maxScore) * scale;
}

//////////////////////////////
// Confidence Scoring
//////////////////////////////

function calculateConfidenceScore(score, maxScore, metrics = {}, historyFactor = 1) {
    const normalizedScore = normalizeScore(score, maxScore);
    
    // Base confidence 0-70%
    let confidence = clamp(normalizedScore / 10, 0, 70);
    
    // Adaptive boosts based on matching metrics
    if (metrics.nameMatch) confidence += 15;
    if (metrics.questionPatternMatch) confidence += 10;
    if (metrics.conceptMatch) confidence += 5;
    if (metrics.semanticSimilarityScore) confidence += clamp(metrics.semanticSimilarityScore * 10, 0, 10);
    if (metrics.matchedConcepts && metrics.matchedConcepts.length > 2) confidence += 2;
    
    // Historical performance factor (0.8-1.2)
    confidence *= historyFactor;
    
    return clamp(Math.round(confidence), 0, 100);
}

function getConfidenceLevel(confidence) {
    if (confidence >= 85) return { level: 'Very High', color: '#4ade80', icon: '✓✓' };
    if (confidence >= 70) return { level: 'High', color: '#86efac', icon: '✓' };
    if (confidence >= 50) return { level: 'Moderate', color: '#fde047', icon: '~' };
    if (confidence >= 30) return { level: 'Low', color: '#fb923c', icon: '?' };
    return { level: 'Very Low', color: '#f87171', icon: '??' };
}

//////////////////////////////
// Formula Metadata Storage (Data-Driven Approach)
//////////////////////////////

// Formula metadata for FRQ support - dynamically loaded from formulas.js
var formulaFRQMetadata = {};

// Concept extraction and matching system for ANY astrophysics question
var conceptMatchingSystem = {
    // Extract all concepts from a question text
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
    
    // Expand concepts using hierarchy (find remotely related concepts)
    expandConceptsRemotely: function(concepts) {
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
        
        return Array.from(expanded);
    },
    
    // Find formulas that match concepts (including remotely)
    findFormulasByConcepts: function(concepts, includeRemote = true) {
        if (!Array.isArray(concepts) || concepts.length === 0) return [];
        
        // Expand concepts if requested
        const searchConcepts = includeRemote ? 
            this.expandConceptsRemotely(concepts) : 
            concepts;
        
        const conceptSet = new Set(searchConcepts.map(c => c.toLowerCase()));
        const matchedFormulas = [];
        
        if (typeof formulas === 'undefined' || !Array.isArray(formulas)) {
            return matchedFormulas;
        }
        
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
    
    // Use semantic search system if available
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

// Initialize metadata from formulas array
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
    });
    
    if (typeof logger !== 'undefined') {
        logger.log(`Initialized FRQ metadata for ${Object.keys(formulaFRQMetadata).length} formulas`);
    }
}

// Get metadata for a formula
function getFormulaMetadata(formulaId) {
    return formulaFRQMetadata[formulaId] || null;
}

// Enhanced function to find formulas for ANY astrophysics question
function findFormulasForQuestion(questionText) {
    const results = [];
    
    // Extract concepts from question
    const extractedConcepts = conceptMatchingSystem.extractConceptsFromQuestion(questionText);
    
    // Find formulas by concepts (including remote matches)
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
    
    // Find formulas using semantic search
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
    
    return results;
}

//////////////////////////////
// Dynamic Usage Instructions (Data-Driven with Intelligent Fallbacks)
//////////////////////////////

// Extract concepts from formula properties dynamically
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

// Analyze formula structure to generate intelligent tips
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

// Analyze question type (direct vs application)
function analyzeQuestionType(questionText) {
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
    
    return analysis;
}

function generateUsageInstructions(formula, questionContext = '') {
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
    
    // Analyze question type
    let questionAnalysis = null;
    if (questionContext) {
        questionAnalysis = analyzeQuestionType(questionContext);
        instructions.isApplication = questionAnalysis.isApplication;
        instructions.problemAnalysis = questionAnalysis;
    }
    
    // Step 1: Identify variables (enhanced for application problems)
    const variableList = (formula.variables || []).map(v => v.symbol).join(', ');
    const variableNames = (formula.variables || []).map(v => `${v.symbol} (${v.name})`).join(', ');
    
    let step1Description = `List all variables in the formula: ${variableNames || variableList}. Determine which are known and which need solving.`;
    
    if (questionAnalysis && questionAnalysis.isApplication) {
        if (questionAnalysis.hasScenario) {
            step1Description += ' For application problems, identify what the scenario tells you (e.g., "all three members line up" means edge-on transit, i=90°).';
        }
        if (questionAnalysis.requiresExpression) {
            step1Description += ` You need to create an expression${questionAnalysis.targetVariable ? ` for ${questionAnalysis.targetVariable}` : ''}${questionAnalysis.sourceVariable ? ` in terms of ${questionAnalysis.sourceVariable}` : ''}.`;
        }
    }
    
    instructions.steps.push({
        step: 1,
        title: 'Identify Known and Unknown Variables',
        description: step1Description
    });
    
    // Step 2: Check units (enhanced with formula-specific guidance)
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
        step: 2,
        title: 'Check Units',
        description: unitGuidance
    });
    
    // Step 3: Enter values
    instructions.steps.push({
        step: 3,
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
        step: 4,
        title: 'Calculate and Verify',
        description: verifyGuidance
    });
    
    // Step 5+: Formula-specific instructions from metadata OR intelligent fallback
    if (metadata && metadata.frqMetadata && metadata.frqMetadata.instructions) {
        metadata.frqMetadata.instructions.forEach((instruction, index) => {
            instructions.steps.push({
                step: 5 + index,
                title: instruction.title || `Additional Step ${index + 1}`,
                description: instruction.description || instruction
            });
        });
    } else {
        // Intelligent fallback: Generate from formula structure
        const contextInstructions = generateIntelligentInstructions(formula, structure, metadata);
        contextInstructions.steps.forEach(s => instructions.steps.push(s));
    }
    
    // Tips from metadata or intelligent fallback
    if (metadata && metadata.frqMetadata && metadata.frqMetadata.tips) {
        instructions.tips.push(...metadata.frqMetadata.tips);
    } else {
        const contextInstructions = generateIntelligentInstructions(formula, structure, metadata);
        instructions.tips.push(...contextInstructions.tips);
    }
    
    // Common mistakes (universal + formula-specific)
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
    
    if (metadata && metadata.frqMetadata && metadata.frqMetadata.commonMistakes) {
        instructions.commonMistakes.push(...metadata.frqMetadata.commonMistakes);
    }
    
    // Related concepts (extract dynamically)
    const extractedConcepts = extractConceptsFromFormula(formula);
    if (metadata && metadata.concepts && metadata.concepts.length > 0) {
        instructions.relatedConcepts.push(...metadata.concepts.slice(0, 5));
    } else if (formula.concepts && formula.concepts.length > 0) {
        instructions.relatedConcepts.push(...formula.concepts.slice(0, 5));
    } else if (extractedConcepts.length > 0) {
        instructions.relatedConcepts.push(...extractedConcepts.slice(0, 5));
    }
    
    // Add application-specific steps
    if (questionAnalysis && questionAnalysis.isApplication) {
        // Step for multi-part questions
        if (questionAnalysis.isMultiPart) {
            instructions.steps.push({
                step: instructions.steps.length + 1,
                title: `Part ${questionAnalysis.partLetter.toUpperCase()}: Context`,
                description: `This is part ${questionAnalysis.partLetter.toUpperCase()} of a multi-part problem. ${questionAnalysis.referencesPrevious ? `Use results from part ${questionAnalysis.referencedPart || 'previous parts'}.` : 'This may build on previous parts or be independent.'}`
            });
        }
        
        // Step for graph-based questions
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
                step: instructions.steps.length + 1,
                title: 'Extract Data from Graph',
                description: graphGuidance
            });
        }
        
        // Step for scenario understanding
        if (questionAnalysis.hasScenario) {
            instructions.steps.push({
                step: instructions.steps.length + 1,
                title: 'Understand the Scenario',
                description: 'Extract key information from the scenario. Identify what conditions are given (e.g., edge-on transit, specific alignment, given values).'
            });
        }
        
        // Step for derivative/chain rule problems
        if (questionAnalysis.requiresDerivative) {
            let derivativeGuidance = 'This problem requires taking derivatives. ';
            if (questionAnalysis.requiresChainRule) {
                derivativeGuidance += 'Use the chain rule: dr/dt = (dr/dE) × (dE/dt). Find each derivative separately, then multiply.';
            } else {
                derivativeGuidance += 'Differentiate the given expression with respect to time (or the appropriate variable).';
            }
            instructions.steps.push({
                step: instructions.steps.length + 1,
                title: 'Apply Calculus',
                description: derivativeGuidance
            });
        }
        
        // Step for integration problems
        if (questionAnalysis.requiresIntegration) {
            instructions.steps.push({
                step: instructions.steps.length + 1,
                title: 'Integrate to Find Time',
                description: 'Rearrange the derivative equation to dt/dr = f(r), then integrate with respect to r. Use appropriate limits (from current separation to r=0 for merger).'
            });
        }
        
        // Step for relationship problems
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
                step: instructions.steps.length + 1,
                title: 'Create the Relationship',
                description: relationshipGuidance
            });
        }
        
        // Step for simplified expressions
        if (questionAnalysis.requiresExpression) {
            instructions.steps.push({
                step: instructions.steps.length + 1,
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
    if (questionContext) {
        if (!questionAnalysis || !questionAnalysis.isApplication) {
            instructions.steps.push({
                step: instructions.steps.length + 1,
                title: 'Contextual Reasoning',
                description: `Consider the question: "${questionContext}". Explain why each step affects the outcome.`
            });
        }
    }
    
    return instructions;
}

// Generate intelligent instructions based on formula structure
function generateIntelligentInstructions(formula, structure, metadata) {
    const result = { steps: [], tips: [] };
    const formulaId = formula.id || '';
    const formulaLower = (formula.name + ' ' + (formula.description || '')).toLowerCase();
    
    // Check for specific formula patterns first (fallback to switch-case)
    const switchCaseResult = getFormulaSpecificInstructions(formulaId, metadata);
    if (switchCaseResult.steps.length > 0 || switchCaseResult.tips.length > 0) {
        return switchCaseResult;
    }
    
    // Generate based on structure analysis
    if (structure.isOrbital) {
        result.steps.push({
            step: 5,
            title: 'Orbital Mechanics Considerations',
            description: 'For orbital problems, remember: period squared is proportional to semi-major axis cubed (T² ∝ a³). For binary systems, use total mass (M₁ + M₂).'
        });
        result.tips.push('Always convert periods to seconds when using standard units.');
        result.tips.push('Verify that orbital distances are physically reasonable for the system.');
    }
    
    if (structure.hasEnergy) {
        result.steps.push({
            step: 5,
            title: 'Energy Considerations',
            description: 'Check if energy is conserved or if there are energy loss mechanisms. For bound orbits, energy is negative.'
        });
        result.tips.push('Total energy = kinetic + potential energy.');
    }
    
    if (structure.hasTemperature) {
        result.steps.push({
            step: 5,
            title: 'Temperature Analysis',
            description: 'Determine if this is surface temperature (effective temperature) or central temperature. Check if Wien\'s law or Stefan-Boltzmann law applies.'
        });
        result.tips.push('Hotter objects emit more energy and peak at shorter wavelengths.');
    }
    
    if (structure.hasDistance) {
        result.steps.push({
            step: 5,
            title: 'Distance Measurement',
            description: 'Determine the distance measurement method. Account for extinction if using magnitude-based methods.'
        });
        result.tips.push('Common distance methods: parallax, distance modulus, redshift, standard candles.');
    }
    
    if (structure.hasVelocity) {
        result.steps.push({
            step: 5,
            title: 'Velocity Analysis',
            description: 'Determine if this is orbital velocity, escape velocity, or radial velocity. Check if relativistic effects are needed (v > 0.1c).'
        });
        result.tips.push('Radial velocity can be measured via Doppler shift in spectra.');
    }
    
    if (structure.isStellar) {
        result.steps.push({
            step: 5,
            title: 'Stellar Properties',
            description: 'Compare results with known stellar values. Consider stellar evolution stage and population type.'
        });
        result.tips.push('Use the Sun as a reference: L☉ = 3.828×10²⁶ W, M☉ = 1.989×10³⁰ kg, R☉ = 6.96×10⁸ m.');
    }
    
    if (structure.isCosmological) {
        result.steps.push({
            step: 5,
            title: 'Cosmological Considerations',
            description: 'For cosmological distances, account for redshift and expansion. Use appropriate distance definitions (luminosity distance, angular diameter distance).'
        });
        result.tips.push('Hubble\'s law: v = H₀d, where H₀ ≈ 70 km/s/Mpc.');
    }
    
    // Generic fallback
    if (result.steps.length === 0) {
        result.tips.push('Visualize the relationship using the Graph Interpretation tab.');
        result.tips.push('Check related formulas for additional context.');
    }
    
    return result;
}

// Formula-specific instruction generator (fallback for formulas without metadata)
function getFormulaSpecificInstructions(formulaId, metadata = null) {
    const result = { steps: [], tips: [] };
    
    // Check if metadata has instructions
    if (metadata && metadata.frqMetadata && metadata.frqMetadata.instructions) {
        return result; // Already handled in main function
    }
    
    // Fallback patterns based on formula ID patterns
    switch(formulaId) {
        case 'kepler_third_law':
        case 'kepler_third_law_binary':
        case 'binary_white_dwarf':
            result.steps.push({
                step: 5,
                title: 'Orbital Period Analysis',
                description: 'Use T² ∝ a³. For binary systems, include total mass (M₁+M₂). Adjust semi-major axis for period changes.'
            });
            result.tips.push('Always convert periods to seconds when using standard units.');
            result.tips.push('Use simplified solar formulas for planets around the Sun.');
            break;
            
        case 'orbital_energy':
            result.steps.push({
                step: 5,
                title: 'Orbital Energy Considerations',
                description: 'Bound orbits have negative energy. Circular orbits: E = -GMm/(2a). Energy loss leads to decay.'
            });
            result.tips.push('Check for conservation of energy and bound/unbound states.');
            break;
            
        case 'white_dwarf_orbital_decay':
        case 'white_dwarf_merger_timescale':
            result.steps.push({
                step: 5,
                title: 'Gravitational Wave Decay',
                description: 'da/dt ∝ a^-4. Smaller separation → faster merger. Use appropriate constants for white dwarfs.'
            });
            result.tips.push('Merger timescales often millions to billions of years.');
            break;
            
        case 'distance_modulus':
            result.steps.push({
                step: 5,
                title: 'Distance Modulus with Extinction',
                description: 'm - M = 5 log10(d) - 5 + A_v. Include extinction corrections.'
            });
            result.tips.push('Typical Milky Way extinction ~1.8 mag/kpc.');
            break;
            
        case 'wiens_law':
            result.steps.push({
                step: 5,
                title: 'Temperature from Spectrum',
                description: 'λ_max = 2.898×10⁻³ / T. Peak wavelength indicates surface temperature.'
            });
            result.tips.push('Hot stars appear blue, cooler stars red.');
            break;
            
        case 'transit_depth':
            result.steps.push({
                step: 5,
                title: 'Transit Depth Analysis',
                description: 'δ = (Rp/Rs)² for edge-on transits (i=90°). For inclined orbits, the observed depth is reduced by cos²(i).'
            });
            result.tips.push('Use combined period and depth to estimate planet properties.');
            result.tips.push('Edge-on transit (i=90°) gives maximum depth. Inclined orbits (i<90°) have smaller observed depths.');
            result.tips.push('For application problems: "all members line up" or "planet in front" typically means edge-on (i=90°).');
            result.tips.push('To express inclination in terms of orbital distance, relate transit geometry to orbital parameters.');
            result.tips.push('For multi-body systems: consider the center of mass and relative positions.');
            break;
            
        case 'white_dwarf_orbital_decay':
            result.steps.push({
                step: 5,
                title: 'Orbital Decay from Gravitational Waves',
                description: 'Gravitational waves carry away orbital energy. The decay rate da/dt is found using the chain rule: da/dt = (da/dE) × (dE/dt).'
            });
            result.tips.push('Start with orbital energy: E = -GMaMb/(2a).');
            result.tips.push('Find dE/da, then use chain rule: da/dt = (da/dE) × (dE/dt).');
            result.tips.push('The given dE/dt formula accounts for gravitational wave emission.');
            result.tips.push('For multi-part problems: you may need results from previous parts (period, energy, etc.).');
            break;
            
        case 'white_dwarf_merger_timescale':
            result.steps.push({
                step: 5,
                title: 'Merger Timescale Calculation',
                description: 'Integrate the decay rate equation: dt/da = f(a), then integrate from current separation to a=0.'
            });
            result.tips.push('Rearrange da/dt to get dt/da = 1/(da/dt).');
            result.tips.push('Integrate dt/da with respect to a from current separation to a=0.');
            result.tips.push('The integration gives time as a function of separation: t ∝ a^4.');
            result.tips.push('Use results from previous parts (decay rate, current separation).');
            break;
            
        case 'radial_velocity_wavelength':
        case 'radial_velocity_frequency':
            result.steps.push({
                step: 5,
                title: 'Radial Velocity from Spectrum',
                description: 'Measure wavelength shift from spectrum. Use Δλ/λ = v/c for non-relativistic speeds.'
            });
            result.tips.push('Identify the spectral line and its rest wavelength.');
            result.tips.push('Measure the observed wavelength from the graph/spectrum.');
            result.tips.push('Calculate redshift: z = (λ_obs - λ_rest)/λ_rest.');
            result.tips.push('For non-relativistic: v = c × z. For relativistic, use full Doppler formula.');
            result.tips.push('Check if reasonable: compare with Hubble flow or known distances.');
            break;
            
        default:
            result.tips.push('Visualize the relationship using the Graph Interpretation tab.');
            break;
    }
    
    return result;
}

//////////////////////////////
// Contextual Hints (Data-Driven with Intelligent Fallbacks)
//////////////////////////////

function generateContextualHints(formula, questionText = '') {
    const hints = { 
        problemType: null, 
        keyConcepts: [], 
        approach: [], 
        checkpoints: [], 
        alternativeApproaches: [],
        relatedConcepts: [] // Add related concepts from question
    };
    
    const formulaId = formula.id || '';
    const metadata = getFormulaMetadata(formulaId);
    const structure = analyzeFormulaStructure(formula);
    const q = questionText.toLowerCase();
    
    // Extract concepts from question and expand remotely
    if (questionText && typeof conceptMatchingSystem !== 'undefined') {
        const questionConcepts = conceptMatchingSystem.extractConceptsFromQuestion(questionText);
        const expandedConcepts = conceptMatchingSystem.expandConceptsRemotely(questionConcepts);
        hints.relatedConcepts = expandedConcepts.slice(0, 10); // Top 10 related concepts
    }
    
    // Enhanced problem type detection
    const questionAnalysis = analyzeQuestionType(questionText);
    
    // Detect application problems
    if (questionAnalysis.isApplication) {
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
    
    // Add application-specific approach
    if (questionAnalysis && questionAnalysis.isApplication) {
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
    }
    
    // Get hints from metadata
    if (metadata && metadata.frqMetadata && metadata.frqMetadata.hints) {
        const metaHints = metadata.frqMetadata.hints;
        if (metaHints.keyConcepts) hints.keyConcepts.push(...metaHints.keyConcepts);
        if (metaHints.approach) hints.approach.push(...metaHints.approach);
        if (metaHints.checkpoints) hints.checkpoints.push(...metaHints.checkpoints);
        if (metaHints.alternativeApproaches) hints.alternativeApproaches.push(...metaHints.alternativeApproaches);
    }
    
    // Generate intelligent hints from structure if metadata doesn't provide them
    if (hints.keyConcepts.length === 0) {
        const extractedConcepts = extractConceptsFromFormula(formula);
        if (metadata && metadata.concepts && metadata.concepts.length > 0) {
            hints.keyConcepts.push(...metadata.concepts.slice(0, 3));
        } else if (formula.concepts && formula.concepts.length > 0) {
            hints.keyConcepts.push(...formula.concepts.slice(0, 3));
        } else if (extractedConcepts.length > 0) {
            hints.keyConcepts.push(...extractedConcepts.slice(0, 3));
        }
    }
    
    // Generate approach steps if not provided
    if (hints.approach.length === 0) {
        hints.approach = generateApproachSteps(formula, structure, q);
    }
    
    // Generate checkpoints if not provided
    if (hints.checkpoints.length === 0) {
        hints.checkpoints = generateCheckpoints(formula, structure);
    }
    
    // Fallback to switch-case for specific formulas
    if (hints.keyConcepts.length === 0 && hints.checkpoints.length === 0) {
        const switchCaseHints = getSwitchCaseHints(formulaId);
        if (switchCaseHints.keyConcepts.length > 0) {
            hints.keyConcepts.push(...switchCaseHints.keyConcepts);
        }
        if (switchCaseHints.checkpoints.length > 0) {
            hints.checkpoints.push(...switchCaseHints.checkpoints);
        }
        if (switchCaseHints.alternativeApproaches.length > 0) {
            hints.alternativeApproaches.push(...switchCaseHints.alternativeApproaches);
        }
    }
    
    return hints;
}

// Generate approach steps based on formula structure
function generateApproachSteps(formula, structure, questionText) {
    const steps = [];
    const q = questionText.toLowerCase();
    const questionAnalysis = analyzeQuestionType(questionText);
    
    // Multi-part problem guidance
    if (questionAnalysis && questionAnalysis.isMultiPart) {
        steps.push(`This is part ${questionAnalysis.partLetter.toUpperCase()} of a multi-part problem.`);
        if (questionAnalysis.referencesPrevious) {
            steps.push(`Use results from part ${questionAnalysis.referencedPart || 'previous parts'} (period, energy, separation, etc.).`);
        }
    }
    
    // Graph-based approach
    if (questionAnalysis && questionAnalysis.hasGraph) {
        if (questionAnalysis.graphType === 'radial_velocity') {
            steps.push('Extract from radial velocity graph: maximum velocities (Va, Vb), period (P).');
            steps.push('Use center of mass: MaVa + MbVb = 0 to find mass ratio.');
            steps.push('Calculate total velocity: V = Va + Vb (or |Va| + |Vb|).');
            steps.push('Use orbital geometry: d = VP/(2π) where d is separation.');
            steps.push('Apply Kepler\'s third law: (Ma+Mb) = d³/P².');
        } else if (questionAnalysis.graphType === 'spectrum') {
            steps.push('Identify spectral lines from the graph (e.g., Si II at 640nm).');
            steps.push('Find rest wavelength (e.g., 615nm for Si II).');
            steps.push('Calculate redshift: z = (λ_obs - λ_rest)/λ_rest.');
            steps.push('For non-relativistic: v = c × z.');
        } else if (questionAnalysis.graphType === 'light_curve') {
            steps.push('Identify transit depth, duration, and period from light curve.');
            steps.push('Use transit depth to find planet-to-star radius ratio.');
        }
    }
    
    // Application-specific approach
    if (questionAnalysis && questionAnalysis.isApplication) {
        // Orbital decay problems
        if (q.includes('orbital decay') || (q.includes('rate of') && q.includes('decay'))) {
            steps.push('Start with orbital energy: E = -GMaMb/(2a).');
            steps.push('Find dE/da = GMaMb/(2a²).');
            steps.push('Use chain rule: da/dt = (da/dE) × (dE/dt) = (2a²/GMaMb) × (dE/dt).');
            steps.push('Substitute the given dE/dt formula for gravitational wave emission.');
            steps.push('Simplify to get da/dt in terms of masses and separation.');
        }
        
        // Merger timescale problems
        if (q.includes('merge') || q.includes('merger time') || (q.includes('how long') && q.includes('merge'))) {
            steps.push('Start with decay rate: da/dt from previous part.');
            steps.push('Rearrange to: dt/da = 1/(da/dt).');
            steps.push('Integrate dt/da with respect to a from current separation (a₀) to a=0.');
            steps.push('The integration gives: t = ∫[a₀ to 0] dt/da da.');
            steps.push('For power-law decay (da/dt ∝ a^-n), time scales as t ∝ a₀^(n+1).');
        }
        
        // Transit and inclination problems
        if (q.includes('transit') && q.includes('inclination')) {
            steps.push('Start with the transit depth formula: δ = (Rp/Rs)² for edge-on transits.');
            steps.push('For inclined orbits, the observed depth relates to inclination: δ_obs = δ_max × cos²(i).');
            steps.push('Relate inclination to orbital geometry using the impact parameter or transit duration.');
            if (q.includes('orbital distance') || q.includes('in terms of')) {
                steps.push('Use the relationship between transit geometry and orbital distance (semi-major axis).');
                steps.push('Express inclination as a function of orbital distance using the transit depth and geometry.');
            }
        }
    }
    
    if (structure.isOrbital) {
        steps.push('Identify the orbital parameters (period, semi-major axis, masses).');
        steps.push('Determine if this is a single-body or binary system problem.');
        if (structure.hasTime) {
            steps.push('Convert time units to seconds if necessary.');
        }
    }
    
    if (structure.hasDistance) {
        steps.push('Determine the distance measurement method (parallax, magnitude, redshift).');
        if (structure.hasMagnitude) {
            steps.push('Account for interstellar extinction if using magnitude-based methods.');
        }
    }
    
    if (structure.hasVelocity) {
        steps.push('Determine if this is orbital, escape, or radial velocity.');
        steps.push('Check if relativistic effects are needed (v > 0.1c).');
    }
    
    if (structure.hasEnergy) {
        steps.push('Identify energy type (orbital, radiative, kinetic, potential).');
        steps.push('Check for energy conservation or energy loss mechanisms.');
    }
    
    if (structure.hasTemperature) {
        steps.push('Determine if using Wien\'s law (from spectrum) or Stefan-Boltzmann (from luminosity).');
        steps.push('Check if temperature is effective (surface) or central.');
    }
    
    if (structure.isBinary) {
        steps.push('Use total mass (M₁ + M₂) for binary systems.');
        steps.push('Consider orbital inclination and eccentricity if relevant.');
    }
    
    // Generic steps
    if (steps.length === 0) {
        steps.push('Identify known and unknown variables.');
        steps.push('Check units and convert if necessary.');
        steps.push('Apply the formula and verify the result makes physical sense.');
    }
    
    return steps;
}

// Generate checkpoints based on formula structure
function generateCheckpoints(formula, structure) {
    const checkpoints = [];
    
    if (structure.hasTime) {
        checkpoints.push('Verify time/period is in correct units (seconds).');
        checkpoints.push('Check that the timescale is physically reasonable.');
    }
    
    if (structure.hasDistance) {
        checkpoints.push('Verify distance units (meters, parsecs, AU).');
        checkpoints.push('Check that distance is reasonable for the method used.');
    }
    
    if (structure.hasMass) {
        checkpoints.push('Verify mass units (kg, solar masses).');
        if (structure.isBinary) {
            checkpoints.push('Check that total mass is reasonable for the system type.');
        }
    }
    
    if (structure.hasVelocity) {
        checkpoints.push('Verify velocity units (m/s, km/s).');
        checkpoints.push('Check if velocity is reasonable (e.g., orbital vs escape velocity).');
    }
    
    if (structure.hasEnergy) {
        checkpoints.push('Check energy sign (negative for bound orbits).');
        checkpoints.push('Verify energy units (Joules).');
    }
    
    if (structure.hasMagnitude) {
        checkpoints.push('Distinguish between apparent and absolute magnitude.');
        checkpoints.push('Account for interstellar extinction if needed.');
    }
    
    if (structure.isStellar) {
        checkpoints.push('Compare results with known stellar values (e.g., Sun).');
    }
    
    // Generic checkpoints
    if (checkpoints.length === 0) {
        checkpoints.push('Verify all units are consistent.');
        checkpoints.push('Check that the result makes physical sense.');
    }
    
    return checkpoints;
}

// Fallback switch-case hints for specific formulas
function getSwitchCaseHints(formulaId) {
    const hints = { keyConcepts: [], checkpoints: [], alternativeApproaches: [] };
    
    switch(formulaId) {
        case 'binary_white_dwarf':
        case 'white_dwarf_orbital_decay':
        case 'white_dwarf_merger_timescale':
            hints.keyConcepts.push('Binary systems', 'Gravitational waves', 'Orbital decay');
            hints.checkpoints.push('Verify total mass and separation are realistic.');
            hints.alternativeApproaches.push('Estimate timescales using approximate formula first.');
            break;
            
        case 'orbital_energy':
            hints.keyConcepts.push('Energy conservation', 'Bound vs unbound orbits');
            hints.checkpoints.push('Check energy sign for bound orbit.');
            break;
            
        case 'distance_modulus':
            hints.keyConcepts.push('Standard candles', 'Extinction', 'Distance ladder');
            hints.checkpoints.push('Account for interstellar extinction.');
            break;
    }
    
    return hints;
}

//////////////////////////////
// Graph Interpretation (Data-Driven with Intelligent Fallbacks)
//////////////////////////////

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
    
    // Get interpretation from metadata
    if (metadata && metadata.frqMetadata && metadata.frqMetadata.graphInterpretation) {
        const graphMeta = metadata.frqMetadata.graphInterpretation;
        interpretation.overview = graphMeta.overview || '';
        interpretation.keyFeatures = graphMeta.keyFeatures || [];
        interpretation.howToUse = graphMeta.howToUse || [];
        interpretation.physicalMeaning = graphMeta.physicalMeaning || '';
    } else {
        // Generate intelligent interpretation from structure
        const intelligentInterpretation = generateIntelligentGraphInterpretation(formula, structure, metadata);
        interpretation.overview = intelligentInterpretation.overview || '';
        interpretation.keyFeatures = intelligentInterpretation.keyFeatures || [];
        interpretation.howToUse = intelligentInterpretation.howToUse || [];
        interpretation.physicalMeaning = intelligentInterpretation.physicalMeaning || '';
    }
    
    return interpretation;
}

// Generate intelligent graph interpretation from formula structure
function generateIntelligentGraphInterpretation(formula, structure, metadata) {
    const interpretation = {
        overview: '',
        keyFeatures: [],
        howToUse: [],
        physicalMeaning: ''
    };
    
    const formulaId = formula.id || '';
    const equation = formula.equation || '';
    const variables = formula.variables || [];
    
    // Check switch-case fallback first
    const switchCaseResult = getSwitchCaseGraphInterpretation(formulaId);
    if (switchCaseResult.overview) {
        return switchCaseResult;
    }
    
    // Generate based on structure
    if (structure.isOrbital) {
        interpretation.overview = 'Shows the relationship between orbital parameters (period, separation, mass).';
        interpretation.keyFeatures.push('Period squared is proportional to semi-major axis cubed (T² ∝ a³)');
        if (structure.isBinary) {
            interpretation.keyFeatures.push('Higher total mass requires shorter period for same separation');
        }
        interpretation.howToUse.push('Enter masses, vary separation to see period change');
        interpretation.howToUse.push('Or enter period and masses to find required separation');
        interpretation.physicalMeaning = 'Larger separations require longer orbital periods. More massive systems orbit faster at the same separation.';
    } else if (structure.hasEnergy) {
        interpretation.overview = 'Shows how energy depends on the key variables in the formula.';
        interpretation.keyFeatures.push('Energy relationships follow conservation principles');
        if (structure.hasDistance) {
            interpretation.keyFeatures.push('Energy typically decreases (more negative) as distance decreases');
        }
        interpretation.howToUse.push('Enter known values, vary the unknown to see energy trend');
        interpretation.physicalMeaning = 'Energy conservation and loss mechanisms determine system evolution.';
    } else if (structure.hasDistance) {
        interpretation.overview = 'Shows distance relationships and how they depend on other variables.';
        interpretation.keyFeatures.push('Distance measurements depend on the method used');
        if (structure.hasMagnitude) {
            interpretation.keyFeatures.push('Magnitude-based distances follow logarithmic relationships');
        }
        interpretation.howToUse.push('Enter magnitude or parallax values to find distance');
        interpretation.physicalMeaning = 'Distance measurements are fundamental to understanding stellar and galactic properties.';
    } else if (structure.hasVelocity) {
        interpretation.overview = 'Shows velocity relationships and dependencies.';
        interpretation.keyFeatures.push('Velocity depends on mass and distance in gravitational systems');
        interpretation.howToUse.push('Enter mass and distance to find velocity');
        interpretation.physicalMeaning = 'Velocity determines orbital dynamics and escape conditions.';
    } else if (structure.hasTemperature) {
        interpretation.overview = 'Shows temperature relationships and dependencies.';
        interpretation.keyFeatures.push('Temperature affects emission properties and spectral features');
        interpretation.howToUse.push('Enter wavelength or luminosity to find temperature');
        interpretation.physicalMeaning = 'Temperature determines stellar classification and emission characteristics.';
    } else if (structure.hasLuminosity) {
        interpretation.overview = 'Shows luminosity relationships and dependencies.';
        interpretation.keyFeatures.push('Luminosity depends on radius and temperature (Stefan-Boltzmann)');
        interpretation.howToUse.push('Enter radius and temperature to find luminosity');
        interpretation.physicalMeaning = 'Luminosity determines stellar classification and energy output.';
    } else {
        // Generic interpretation
        interpretation.overview = `Visualizes the mathematical relationship in ${formula.name || 'this formula'}.`;
        interpretation.keyFeatures.push('Observe how variables influence each other');
        interpretation.keyFeatures.push('Look for linear, inverse, or power-law relationships');
        
        // Analyze equation to detect relationships
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
    
    return interpretation;
}

// Fallback switch-case graph interpretations
function getSwitchCaseGraphInterpretation(formulaId) {
    const interpretation = {
        overview: '',
        keyFeatures: [],
        howToUse: [],
        physicalMeaning: ''
    };
    
    switch(formulaId) {
        case 'binary_white_dwarf':
        case 'kepler_third_law_binary':
            interpretation.overview = 'Shows orbital period vs separation for a binary system.';
            interpretation.keyFeatures.push('P² ∝ a³', 'Higher mass → shorter period for same separation');
            interpretation.howToUse.push('Vary separation or mass to see period changes.');
            interpretation.physicalMeaning = 'Larger separations → longer orbits; more massive binaries orbit faster.';
            break;
            
        case 'orbital_energy':
            interpretation.overview = 'Shows orbital energy as function of separation and mass.';
            interpretation.keyFeatures.push('Energy more negative as separation decreases', 'Higher mass → more negative energy');
            interpretation.howToUse.push('Enter masses, vary separation to observe energy trend.');
            interpretation.physicalMeaning = 'Tighter orbits have lower energy; loss causes decay.';
            break;
            
        case 'white_dwarf_orbital_decay':
            interpretation.overview = 'Orbital decay rate due to gravitational waves.';
            interpretation.keyFeatures.push('da/dt ∝ a^-4', 'Smaller separations decay faster');
            interpretation.howToUse.push('Input masses and separation to estimate decay rate.');
            interpretation.physicalMeaning = 'Gravitational waves carry energy away, shrinking orbit.';
            break;
            
        case 'white_dwarf_merger_timescale':
            interpretation.overview = 'Time until merger of two white dwarfs.';
            interpretation.keyFeatures.push('Merger time ∝ a^4', 'More massive binaries merge faster');
            interpretation.howToUse.push('Vary separation and mass to see timescale changes.');
            interpretation.physicalMeaning = 'Close binaries merge rapidly; separation dominates timescale.';
            break;
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
        analyzeFormulaStructure
    };
}

// Export to window for global access
if (typeof window !== 'undefined') {
    window.conceptMatchingSystem = conceptMatchingSystem;
    window.findFormulasForQuestion = findFormulasForQuestion;
}
