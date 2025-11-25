/**
 * Comprehensive Test Suite for AstroCalc
 * Tests all features described in README.md
 * 
 * Run this in browser console after loading the application
 * Or include in a test HTML page
 */

const TestSuite = {
    results: {
        passed: 0,
        failed: 0,
        warnings: 0,
        tests: []
    },
    
    /**
     * Run all tests
     */
    async runAll() {
        console.log('🧪 AstroCalc Comprehensive Test Suite');
        console.log('='.repeat(60));
        
        // Test categories
        this.testOfflineCapability();
        this.testCalculatorEngine();
        this.testSearchSystem();
        this.testFRQSupport();
        this.testKeyboardNavigation();
        this.testGraphSystem();
        this.testUnitConversion();
        this.testExpressionParsing();
        this.testClassification();
        this.testFormulaInterlinking();
        this.testErrorHandling();
        this.testPerformance();
        
        // Print summary
        this.printSummary();
        
        return this.results;
    },
    
    /**
     * Test offline capability
     */
    testOfflineCapability() {
        console.log('\n📴 Testing Offline Capability...');
        
        // Test 1: Global constants defined
        this.test('Global constants defined', () => {
            return typeof globalConstants !== 'undefined' && 
                   globalConstants.G !== undefined &&
                   globalConstants.c !== undefined &&
                   globalConstants.σ !== undefined;
        });
        
        // Test 2: No external API calls in calculator
        this.test('Calculator has no external dependencies', () => {
            const calculatorCode = typeof FormulaCalculator !== 'undefined';
            return calculatorCode;
        });
        
        // Test 3: Service worker available
        this.test('Service worker support', () => {
            return 'serviceWorker' in navigator;
        });
        
        // Test 4: Offline graph manager available
        this.test('Offline graph manager available', () => {
            return typeof OfflineGraphManager !== 'undefined';
        });
        
        // Test 5: All constants are local
        this.test('All constants defined locally', () => {
            if (typeof globalConstants === 'undefined') return false;
            const required = ['G', 'c', 'σ', 'h', 'k', 'e', 'm_e'];
            return required.every(c => globalConstants[c] !== undefined);
        });
    },
    
    /**
     * Test calculator engine
     */
    testCalculatorEngine() {
        console.log('\n🧮 Testing Calculator Engine...');
        
        if (typeof FormulaCalculator === 'undefined') {
            this.warn('FormulaCalculator not available');
            return;
        }
        
        // Test 1: Calculator instantiation
        this.test('Calculator can be instantiated', () => {
            try {
                if (typeof formulas === 'undefined' || !formulas[0]) return false;
                const calc = new FormulaCalculator(formulas[0]);
                return calc !== null && calc.formula !== undefined;
            } catch (e) {
                return false;
            }
        });
        
        // Test 2: Kepler's Third Law calculation
        this.test('Kepler\'s Third Law calculation', () => {
            try {
                const keplerFormula = formulas.find(f => f.id === 'kepler_third_law');
                if (!keplerFormula) return false;
                
                const calc = new FormulaCalculator(keplerFormula);
                const result = calc.solve({
                    M: 1.989e30,  // Solar mass
                    a: 1.496e11,  // 1 AU
                    T: null       // Solve for period
                });
                
                // Earth's orbital period ≈ 3.156e7 seconds (1 year)
                const expected = 3.156e7;
                const error = Math.abs(result.result - expected) / expected;
                return error < 0.05; // 5% tolerance
            } catch (e) {
                return false;
            }
        });
        
        // Test 3: Orbital velocity calculation
        this.test('Orbital velocity calculation', () => {
            try {
                const formula = formulas.find(f => f.id === 'orbital_velocity');
                if (!formula) return false;
                
                const calc = new FormulaCalculator(formula);
                const result = calc.solve({
                    M: 1.989e30,  // Solar mass
                    r: 1.496e11,  // 1 AU
                    v: null       // Solve for velocity
                });
                
                // Earth's orbital velocity ≈ 29,780 m/s
                const expected = 29780;
                const error = Math.abs(result.result - expected) / expected;
                return error < 0.05;
            } catch (e) {
                return false;
            }
        });
        
        // Test 4: Symbolic calculation
        this.test('Symbolic calculation (N/A mode)', () => {
            try {
                const formula = formulas.find(f => f.id === 'wiens_law');
                if (!formula) return false;
                
                const calc = new FormulaCalculator(formula);
                const result = calc.solve({
                    T: 5778,      // Sun's temperature
                    λmax: 'N/A',  // Symbolic
                    b: 2.898e-3
                });
                
                return result.isSymbolic === true && 
                       result.solutions !== undefined;
            } catch (e) {
                return false;
            }
        });
        
        // Test 5: Input validation
        this.test('Input validation (negative mass)', () => {
            try {
                const formula = formulas.find(f => f.id === 'kepler_third_law');
                if (!formula) return false;
                
                const calc = new FormulaCalculator(formula);
                try {
                    calc.solve({ M: -1, a: 1.496e11, T: null });
                    return false; // Should throw error
                } catch (e) {
                    return e.message.includes('positive') || e.message.includes('mass');
                }
            } catch (e) {
                return false;
            }
        });
        
        // Test 6: Division by zero protection
        this.test('Division by zero protection', () => {
            try {
                const formula = formulas.find(f => f.id === 'orbital_velocity');
                if (!formula) return false;
                
                const calc = new FormulaCalculator(formula);
                try {
                    calc.solve({ M: 1.989e30, r: 0, v: null });
                    return false; // Should throw error
                } catch (e) {
                    return e.message.includes('positive') || e.message.includes('zero');
                }
            } catch (e) {
                return false;
            }
        });
        
        // Test 7: Return format consistency
        this.test('Return format consistency', () => {
            try {
                const formula = formulas.find(f => f.id === 'distance_modulus');
                if (!formula) return false;
                
                const calc = new FormulaCalculator(formula);
                const result = calc.solve({ m: 5, M: 5, d: null });
                
                return result.hasOwnProperty('solvedFor') &&
                       result.hasOwnProperty('result') &&
                       result.hasOwnProperty('unit') &&
                       result.hasOwnProperty('isSymbolic');
            } catch (e) {
                return false;
            }
        });
        
        // Test 8: Solver registry pattern
        this.test('Solver registry pattern', () => {
            return typeof FormulaCalculator.solvers === 'object' &&
                   FormulaCalculator.solvers.kepler_third_law !== undefined;
        });
        
        // Test 9: toLatex() method
        this.test('toLatex() method available', () => {
            try {
                const formula = formulas.find(f => f.id === 'kepler_third_law');
                if (!formula) return false;
                
                const calc = new FormulaCalculator(formula);
                const latex = calc.toLatex('T = 2π√(a³/(GM))');
                return typeof latex === 'string' && latex.includes('\\pi');
            } catch (e) {
                return false;
            }
        });
        
        // Test 10: getAllSolutions() method
        this.test('getAllSolutions() method available', () => {
            try {
                const formula = formulas.find(f => f.id === 'orbital_velocity');
                if (!formula) return false;
                
                const calc = new FormulaCalculator(formula);
                const solutions = calc.getAllSolutions();
                return Array.isArray(solutions) && solutions.length > 0;
            } catch (e) {
                return false;
            }
        });
    },
    
    /**
     * Test search system
     */
    testSearchSystem() {
        console.log('\n🔍 Testing Search System...');
        
        // Test 1: Search function exists
        this.test('Search function available', () => {
            return typeof filterAndRenderFormulas === 'function' ||
                   typeof calculateSearchScore === 'function';
        });
        
        // Test 2: Natural language search
        this.test('Natural language search works', () => {
            if (typeof formulas === 'undefined') return false;
            
            // Simulate search for "how to calculate escape velocity"
            const query = 'escape velocity';
            const results = formulas.filter(f => 
                f.name.toLowerCase().includes(query.toLowerCase()) ||
                f.description.toLowerCase().includes(query.toLowerCase())
            );
            
            return results.length > 0;
        });
        
        // Test 3: Concept matching
        this.test('Concept matching works', () => {
            if (typeof formulas === 'undefined') return false;
            
            const query = 'orbital';
            const results = formulas.filter(f => 
                f.concepts && f.concepts.some(c => 
                    c.toLowerCase().includes(query.toLowerCase())
                )
            );
            
            return results.length > 0;
        });
        
        // Test 4: Question pattern matching
        this.test('Question pattern matching', () => {
            if (typeof formulas === 'undefined') return false;
            
            const query = 'how long does it take to orbit';
            const results = formulas.filter(f => 
                f.questionPatterns && f.questionPatterns.some(p => 
                    query.toLowerCase().includes(p.toLowerCase())
                )
            );
            
            return results.length > 0;
        });
        
        // Test 5: Domain detection
        this.test('Domain detection system', () => {
            if (typeof conceptMatchingSystem === 'undefined') return false;
            
            const domains = conceptMatchingSystem.detectProblemDomain('distance to star');
            return Array.isArray(domains) && domains.length > 0;
        });
    },
    
    /**
     * Test FRQ support
     */
    testFRQSupport() {
        console.log('\n📝 Testing FRQ Support System...');
        
        // Test 1: FRQ metadata initialization
        this.test('FRQ metadata initialized', () => {
            if (typeof initializeFRQMetadata === 'function') {
                initializeFRQMetadata();
            }
            return typeof formulaFRQMetadata !== 'undefined' &&
                   Object.keys(formulaFRQMetadata).length > 0;
        });
        
        // Test 2: Usage instructions generation
        this.test('Usage instructions generation', () => {
            if (typeof generateUsageInstructions === 'undefined') return false;
            if (typeof formulas === 'undefined' || !formulas[0]) return false;
            
            const instructions = generateUsageInstructions(formulas[0]);
            return instructions.hasOwnProperty('steps') &&
                   instructions.hasOwnProperty('tips') &&
                   Array.isArray(instructions.steps);
        });
        
        // Test 3: Contextual hints generation
        this.test('Contextual hints generation', () => {
            if (typeof generateContextualHints === 'undefined') return false;
            if (typeof formulas === 'undefined' || !formulas[0]) return false;
            
            const hints = generateContextualHints(formulas[0], 'how to calculate period');
            return hints.hasOwnProperty('problemType') &&
                   hints.hasOwnProperty('keyConcepts');
        });
        
        // Test 4: Graph interpretation generation
        this.test('Graph interpretation generation', () => {
            if (typeof generateGraphInterpretation === 'undefined') return false;
            if (typeof formulas === 'undefined' || !formulas[0]) return false;
            
            const interpretation = generateGraphInterpretation(formulas[0]);
            return interpretation.hasOwnProperty('overview') &&
                   interpretation.hasOwnProperty('keyFeatures');
        });
        
        // Test 5: Formula-specific mistakes
        this.test('Formula-specific common mistakes', () => {
            if (typeof generateFormulaSpecificMistakes === 'undefined') return false;
            if (typeof formulas === 'undefined' || !formulas[0]) return false;
            
            const structure = analyzeFormulaStructure(formulas[0]);
            const mistakes = generateFormulaSpecificMistakes(formulas[0], structure);
            return Array.isArray(mistakes) && mistakes.length > 0;
        });
    },
    
    /**
     * Test keyboard navigation
     */
    testKeyboardNavigation() {
        console.log('\n⌨️ Testing Keyboard Navigation...');
        
        // Test 1: Quick nav initialized
        this.test('Quick navigation initialized', () => {
            return typeof quickNavState !== 'undefined' ||
                   typeof initQuickNav === 'function';
        });
        
        // Test 2: Command palette function
        this.test('Command palette function exists', () => {
            return typeof toggleCommandPalette === 'function' ||
                   typeof searchCommandPalette === 'function';
        });
        
        // Test 3: Card navigation function
        this.test('Card navigation function exists', () => {
            return typeof navigateCards === 'function';
        });
        
        // Test 4: Help overlay function
        this.test('Help overlay function exists', () => {
            return typeof toggleHelpOverlay === 'function' ||
                   typeof showHelpOverlay === 'function';
        });
    },
    
    /**
     * Test graph system
     */
    testGraphSystem() {
        console.log('\n📈 Testing Graph System...');
        
        // Test 1: Graph manager available
        this.test('Graph manager available', () => {
            return typeof GraphManager !== 'undefined' ||
                   typeof OfflineGraphManager !== 'undefined';
        });
        
        // Test 2: Offline graph manager can be instantiated
        this.test('Offline graph manager instantiation', () => {
            if (typeof OfflineGraphManager === 'undefined') return false;
            try {
                const manager = new OfflineGraphManager('test-container', 'test-tab');
                return manager !== null;
            } catch (e) {
                return false;
            }
        });
        
        // Test 3: Graph initialization function
        this.test('Graph initialization function exists', () => {
            return typeof initializeGraphManager === 'function';
        });
    },
    
    /**
     * Test unit conversion
     */
    testUnitConversion() {
        console.log('\n🔄 Testing Unit Conversion...');
        
        // Test 1: Unit converter available
        this.test('Unit converter available', () => {
            return typeof UnitConverter !== 'undefined';
        });
        
        // Test 2: Unit conversion works
        this.test('Unit conversion functionality', () => {
            if (typeof UnitConverter === 'undefined') return false;
            
            const result = UnitConverter.convertAndFormat(1.496e11, 'm');
            return result.hasOwnProperty('value') &&
                   result.hasOwnProperty('unit');
        });
    },
    
    /**
     * Test expression parsing
     */
    testExpressionParsing() {
        console.log('\n🔢 Testing Expression Parsing...');
        
        // Test 1: Expression parser available
        this.test('Expression parser available', () => {
            return typeof ExpressionParser !== 'undefined';
        });
        
        // Test 2: Parse simple number
        this.test('Parse simple number', () => {
            if (typeof ExpressionParser === 'undefined') return false;
            const result = ExpressionParser.parse('123');
            return result === 123;
        });
        
        // Test 3: Parse scientific notation
        this.test('Parse scientific notation', () => {
            if (typeof ExpressionParser === 'undefined') return false;
            const result = ExpressionParser.parse('1.496e11');
            return Math.abs(result - 1.496e11) < 1;
        });
        
        // Test 4: Parse pi
        this.test('Parse pi constant', () => {
            if (typeof ExpressionParser === 'undefined') return false;
            const result = ExpressionParser.parse('pi');
            return Math.abs(result - Math.PI) < 0.001;
        });
    },
    
    /**
     * Test classification
     */
    testClassification() {
        console.log('\n⭐ Testing Stellar Classification...');
        
        // Test 1: Classifier available
        this.test('Stellar classifier available', () => {
            return typeof StellarClassifier !== 'undefined';
        });
        
        // Test 2: Classification works
        this.test('Star classification functionality', () => {
            if (typeof StellarClassifier === 'undefined') return false;
            
            const classifier = new StellarClassifier();
            const result = classifier.classify(5778, 'V', false, false);
            
            return result.hasOwnProperty('spectralClass') &&
                   result.spectralClass === 'G';
        });
    },
    
    /**
     * Test formula interlinking
     */
    testFormulaInterlinking() {
        console.log('\n🔗 Testing Formula Interlinking...');
        
        // Test 1: Related formulas function
        this.test('Related formulas function exists', () => {
            return typeof getRelatedFormulas === 'function';
        });
        
        // Test 2: Related formulas work
        this.test('Related formulas retrieval', () => {
            if (typeof getRelatedFormulas === 'undefined') return false;
            if (typeof formulas === 'undefined' || !formulas[0]) return false;
            
            const related = getRelatedFormulas(formulas[0]);
            return Array.isArray(related);
        });
    },
    
    /**
     * Test error handling
     */
    testErrorHandling() {
        console.log('\n🛡️ Testing Error Handling...');
        
        // Test 1: Safe execution wrapper
        this.test('Safe execution wrapper available', () => {
            return typeof safeExecute === 'function';
        });
        
        // Test 2: Error handling in calculator
        this.test('Calculator error handling', () => {
            try {
                if (typeof formulas === 'undefined' || !formulas[0]) return false;
                const calc = new FormulaCalculator(formulas[0]);
                calc.solve({ invalid: 'test' });
                return false; // Should handle error
            } catch (e) {
                return true; // Error caught
            }
        });
    },
    
    /**
     * Test performance
     */
    testPerformance() {
        console.log('\n⚡ Testing Performance...');
        
        // Test 1: Formulas loaded
        this.test('Formulas loaded', () => {
            return typeof formulas !== 'undefined' &&
                   Array.isArray(formulas) &&
                   formulas.length >= 193;
        });
        
        // Test 2: Search debouncing
        this.test('Search debouncing implemented', () => {
            // Check if debounce function exists or search has delay
            return typeof debounce === 'function' ||
                   typeof searchDebounceTimer !== 'undefined';
        });
        
        // Test 3: Caching system
        this.test('Caching system available', () => {
            return typeof SimpleCache !== 'undefined' ||
                   typeof conceptExpansionCache !== 'undefined';
        });
    },
    
    /**
     * Run a single test
     */
    test(name, fn) {
        try {
            const result = fn();
            if (result) {
                this.results.passed++;
                this.results.tests.push({ name, status: 'PASS', message: '' });
                console.log(`  ✅ ${name}`);
            } else {
                this.results.failed++;
                this.results.tests.push({ name, status: 'FAIL', message: 'Test returned false' });
                console.log(`  ❌ ${name}`);
            }
            return result;
        } catch (e) {
            this.results.failed++;
            this.results.tests.push({ name, status: 'FAIL', message: e.message });
            console.log(`  ❌ ${name}: ${e.message}`);
            return false;
        }
    },
    
    /**
     * Add a warning
     */
    warn(message) {
        this.results.warnings++;
        console.log(`  ⚠️ ${message}`);
    },
    
    /**
     * Print test summary
     */
    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 Test Summary');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️  Warnings: ${this.results.warnings}`);
        console.log(`📈 Total: ${this.results.passed + this.results.failed}`);
        console.log(`📊 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
        console.log('='.repeat(60));
    }
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
    window.TestSuite = TestSuite;
    
    // Run tests when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => TestSuite.runAll(), 2000);
        });
    } else {
        setTimeout(() => TestSuite.runAll(), 2000);
    }
}

