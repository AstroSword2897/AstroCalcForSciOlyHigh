/**
 * Formula Enhancement Script
 * 
 * Ensures ALL formulas have:
 * 1. Comprehensive question patterns
 * 2. Proper search keywords
 * 3. Complete concept mappings
 * 4. Step-by-step guidance support
 * 
 * Run this in browser console after formulas.js loads
 */

function enhanceAllFormulas() {
    if (typeof formulas === 'undefined' || !Array.isArray(formulas)) {
        console.error('Formulas array not found!');
        return;
    }

    console.log(`Enhancing ${formulas.length} formulas...`);
    
    let enhanced = 0;
    let skipped = 0;

    formulas.forEach((formula, index) => {
        const originalPatterns = (formula.questionPatterns || []).length;
        const originalKeywords = (formula.keywords || []).length;
        const originalConcepts = (formula.concepts || []).length;

        // Generate comprehensive question patterns
        const enhancedPatterns = generateQuestionPatterns(formula);
        const enhancedKeywords = generateKeywords(formula);
        const enhancedConcepts = generateConcepts(formula);

        // Update formula
        formula.questionPatterns = enhancedPatterns;
        formula.keywords = enhancedKeywords;
        formula.concepts = enhancedConcepts;

        const newPatterns = formula.questionPatterns.length;
        const newKeywords = formula.keywords.length;
        const newConcepts = formula.concepts.length;

        if (newPatterns > originalPatterns || newKeywords > originalKeywords || newConcepts > originalConcepts) {
            enhanced++;
            console.log(`✓ Enhanced ${formula.name}: +${newPatterns - originalPatterns} patterns, +${newKeywords - originalKeywords} keywords, +${newConcepts - originalConcepts} concepts`);
        } else {
            skipped++;
        }
    });

    console.log(`\n✅ Enhancement complete!`);
    console.log(`   Enhanced: ${enhanced} formulas`);
    console.log(`   Already complete: ${skipped} formulas`);
    console.log(`\n💡 To save changes, copy the enhanced formulas array and update formulas.js`);
}

function generateQuestionPatterns(formula) {
    const patterns = new Set(formula.questionPatterns || []);
    const name = (formula.name || '').toLowerCase();
    const desc = (formula.description || '').toLowerCase();
    const id = formula.id || '';

    // Add formula name variations
    patterns.add(name);
    patterns.add(name.replace(/'/g, ''));
    patterns.add(name.replace(/\s+/g, '-'));
    patterns.add(name.replace(/\s+/g, '_'));

    // Add "how to" patterns
    patterns.add(`how to calculate ${name}`);
    patterns.add(`how to find ${name}`);
    patterns.add(`how to solve ${name}`);
    patterns.add(`calculate ${name}`);
    patterns.add(`find ${name}`);
    patterns.add(`solve ${name}`);
    patterns.add(`what is ${name}`);
    patterns.add(`${name} formula`);
    patterns.add(`${name} calculation`);

    // Add variable-specific patterns
    if (formula.variables && Array.isArray(formula.variables)) {
        formula.variables.forEach(v => {
            const varName = (v.name || '').toLowerCase();
            const varSymbol = v.symbol || '';
            
            if (varName) {
                patterns.add(`calculate ${varName}`);
                patterns.add(`find ${varName}`);
                patterns.add(`${varName} from ${name}`);
            }
            if (varSymbol && varSymbol.length <= 3) {
                patterns.add(`calculate ${varSymbol}`);
                patterns.add(`find ${varSymbol}`);
            }
        });
    }

    // Add equation-based patterns
    if (formula.equation) {
        const eq = formula.equation.toLowerCase();
        // Extract key terms from equation
        const terms = eq.match(/\b\w+\b/g) || [];
        terms.forEach(term => {
            if (term.length > 2 && !['the', 'and', 'for', 'from', 'with'].includes(term)) {
                patterns.add(`${term} ${name}`);
            }
        });
    }

    // Add category-based patterns
    Object.keys(formulaCategories || {}).forEach(category => {
        if (formulaCategories[category].includes(id)) {
            patterns.add(`${category.toLowerCase()} ${name}`);
        }
    });

    return Array.from(patterns);
}

function generateKeywords(formula) {
    const keywords = new Set(formula.keywords || []);
    const name = (formula.name || '').toLowerCase();
    const desc = (formula.description || '').toLowerCase();

    // Add name words
    name.split(/\s+/).forEach(word => {
        if (word.length > 2) keywords.add(word);
    });

    // Extract key terms from description
    const descWords = desc.split(/\s+/).filter(w => w.length > 4);
    descWords.forEach(word => {
        const clean = word.replace(/[^\w]/g, '');
        if (clean.length > 4) keywords.add(clean);
    });

    // Add variable symbols as keywords
    if (formula.variables) {
        formula.variables.forEach(v => {
            if (v.symbol) keywords.add(v.symbol);
            if (v.name) {
                const words = v.name.toLowerCase().split(/\s+/);
                words.forEach(w => {
                    if (w.length > 3) keywords.add(w);
                });
            }
        });
    }

    return Array.from(keywords);
}

function generateConcepts(formula) {
    const concepts = new Set(formula.concepts || []);
    const name = (formula.name || '').toLowerCase();
    const desc = (formula.description || '').toLowerCase();

    // Add formula name as concept
    concepts.add(name);
    concepts.add(name.replace(/'/g, ''));

    // Extract domain concepts from description
    const domainKeywords = [
        'stellar', 'planetary', 'orbital', 'cosmological', 'relativistic',
        'nuclear', 'thermal', 'radiative', 'gravitational', 'electromagnetic',
        'exoplanet', 'binary', 'galactic', 'stellar evolution', 'blackbody'
    ];

    domainKeywords.forEach(keyword => {
        if (desc.includes(keyword)) {
            concepts.add(keyword);
        }
    });

    // Add category-based concepts
    Object.keys(formulaCategories || {}).forEach(category => {
        if (formulaCategories[category].includes(formula.id)) {
            const catWords = category.toLowerCase().split(/\s+/);
            catWords.forEach(word => {
                if (word.length > 3) concepts.add(word);
            });
        }
    });

    return Array.from(concepts);
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    window.enhanceAllFormulas = enhanceAllFormulas;
    console.log('Formula enhancement script loaded. Run enhanceAllFormulas() to enhance all formulas.');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { enhanceAllFormulas, generateQuestionPatterns, generateKeywords, generateConcepts };
}

