/**
 * CalculateButtonDebugger - Diagnostic test harness for debugging Calculate button issues
 * 
 * Usage in browser console:
 *   const debugger = new CalculateButtonDebugger();
 *   debugger.generateReport();
 *   debugger.testButtonClick();
 */

export class CalculateButtonDebugger {
    constructor() {
        this.testResults = [];
        this.clickCount = 0;
        this.lastClickTime = null;
    }

    /**
     * Test if button click is detected and handlers fire
     */
    testButtonClick() {
        console.log('[CalculateButtonDebugger] 🧪 Testing button click...');
        this.testResults = [];
        
        const button = document.getElementById('calculate-btn');
        if (!button) {
            this.recordTest('Button Element Exists', false, 'Calculate button not found in DOM');
            return this.testResults;
        }
        
        this.recordTest('Button Element Exists', true, `Button found: ${button.id}`);
        
        // Check if handlers are attached
        const hasDirectHandler = button.dataset.directHandlerAttached === 'true';
        this.recordTest('Direct Handler Attached', hasDirectHandler, 
            hasDirectHandler ? 'Direct handler is attached' : 'Direct handler not attached');
        
        // Simulate click
        console.log('[CalculateButtonDebugger] Simulating button click...');
        this.lastClickTime = new Date();
        this.clickCount++;
        
        try {
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            button.dispatchEvent(clickEvent);
            this.recordTest('Click Event Dispatched', true, 'Click event dispatched successfully');
        } catch (error) {
            this.recordTest('Click Event Dispatched', false, `Error: ${error.message}`);
        }
        
        return this.testResults;
    }

    /**
     * Verify all event handlers are attached
     */
    testEventHandlers() {
        console.log('[CalculateButtonDebugger] 🧪 Testing event handlers...');
        this.testResults = [];
        
        const button = document.getElementById('calculate-btn');
        if (!button) {
            this.recordTest('Button Exists', false, 'Button not found');
            return this.testResults;
        }
        
        // Check direct handler
        const hasDirectHandler = button.dataset.directHandlerAttached === 'true';
        this.recordTest('Direct Handler', hasDirectHandler, 
            hasDirectHandler ? 'Direct handler attached' : 'Direct handler missing');
        
        // Check delegation handler (check if EventCoordinator has listeners)
        const hasDelegationHandler = document.addEventListener.toString().includes('click') || 
            (window.eventCoordinator && window.eventCoordinator.globalListeners);
        this.recordTest('Delegation Handler', hasDelegationHandler, 
            hasDelegationHandler ? 'Delegation handler likely attached' : 'Delegation handler status unknown');
        
        // Check force-attach handler
        const hasForceAttach = button._forceAttached === true;
        this.recordTest('Force-Attach Handler', hasForceAttach, 
            hasForceAttach ? 'Force-attach handler attached' : 'Force-attach handler missing');
        
        return this.testResults;
    }

    /**
     * Verify callback chain is intact
     */
    testCallbacks() {
        console.log('[CalculateButtonDebugger] 🧪 Testing callback chain...');
        this.testResults = [];
        
        // Check EventCoordinator callback
        if (window.eventCoordinator) {
            const hasOnCalculate = typeof window.eventCoordinator.options?.onCalculate === 'function';
            this.recordTest('EventCoordinator.onCalculate', hasOnCalculate, 
                hasOnCalculate ? 'Callback exists' : 'Callback missing');
            
            if (hasOnCalculate) {
                const callbackCode = window.eventCoordinator.options.onCalculate.toString().substring(0, 200);
                console.log('[CalculateButtonDebugger] Callback code preview:', callbackCode);
            }
        } else {
            this.recordTest('EventCoordinator Exists', false, 'EventCoordinator not found on window');
        }
        
        // Check UIModuleOrchestrator callback
        if (window.uiOrchestrator) {
            const hasCalculationOrchestrator = !!window.uiOrchestrator.calculationOrchestrator;
            this.recordTest('UIModuleOrchestrator.calculationOrchestrator', hasCalculationOrchestrator, 
                hasCalculationOrchestrator ? 'CalculationOrchestrator exists' : 'CalculationOrchestrator missing');
            
            if (hasCalculationOrchestrator) {
                const hasPerformCalculation = typeof window.uiOrchestrator.calculationOrchestrator.performCalculation === 'function';
                this.recordTest('performCalculation Method', hasPerformCalculation, 
                    hasPerformCalculation ? 'Method exists' : 'Method missing');
            }
        } else {
            this.recordTest('UIModuleOrchestrator Exists', false, 'UIModuleOrchestrator not found on window');
        }
        
        // Check window.performCalculation
        const hasWindowPerformCalculation = typeof window.performCalculation === 'function';
        this.recordTest('window.performCalculation', hasWindowPerformCalculation, 
            hasWindowPerformCalculation ? 'Function exists' : 'Function missing');
        
        return this.testResults;
    }

    /**
     * Verify CalculationOrchestrator is initialized
     */
    testCalculationOrchestrator() {
        console.log('[CalculateButtonDebugger] 🧪 Testing CalculationOrchestrator...');
        this.testResults = [];
        
        // Check via uiOrchestrator
        if (window.uiOrchestrator?.calculationOrchestrator) {
            const calcOrch = window.uiOrchestrator.calculationOrchestrator;
            this.recordTest('CalculationOrchestrator Instance', true, 'Instance exists');
            
            // Check methods
            const methods = ['performCalculation', 'getCalculator', 'getFormula', 'collectVariableValues'];
            methods.forEach(method => {
                const hasMethod = typeof calcOrch[method] === 'function';
                this.recordTest(`Method: ${method}`, hasMethod, 
                    hasMethod ? 'Method exists' : 'Method missing');
            });
            
            // Check state
            const isLocked = calcOrch._calculationInProgress === true;
            this.recordTest('Calculation Lock Status', !isLocked, 
                isLocked ? 'Calculation is locked (in progress)' : 'Calculation is not locked');
        } else {
            this.recordTest('CalculationOrchestrator Instance', false, 'Instance not found');
        }
        
        // Check via window.calculationOrchestrator
        const hasWindowCalcOrch = typeof window.calculationOrchestrator !== 'undefined';
        this.recordTest('window.calculationOrchestrator', hasWindowCalcOrch, 
            hasWindowCalcOrch ? 'Exists' : 'Missing');
        
        return this.testResults;
    }

    /**
     * Verify formula and calculator are available
     */
    testFormulaAndCalculator() {
        console.log('[CalculateButtonDebugger] 🧪 Testing formula and calculator...');
        this.testResults = [];
        
        if (!window.uiOrchestrator?.calculationOrchestrator) {
            this.recordTest('CalculationOrchestrator Available', false, 'CalculationOrchestrator not found');
            return this.testResults;
        }
        
        const calcOrch = window.uiOrchestrator.calculationOrchestrator;
        
        // Test getFormula
        try {
            const formula = calcOrch.getFormula();
            this.recordTest('Formula Available', !!formula, 
                formula ? `Formula: ${formula.name || formula.id}` : 'No formula selected');
            
            if (formula) {
                const hasVariables = Array.isArray(formula.variables) && formula.variables.length > 0;
                this.recordTest('Formula Has Variables', hasVariables, 
                    hasVariables ? `${formula.variables.length} variables` : 'No variables');
            }
        } catch (error) {
            this.recordTest('Formula Available', false, `Error: ${error.message}`);
        }
        
        // Test getCalculator
        try {
            const calculator = calcOrch.getCalculator();
            this.recordTest('Calculator Available', !!calculator, 
                calculator ? 'Calculator exists' : 'No calculator available');
            
            if (calculator) {
                const hasSolve = typeof calculator.solve === 'function';
                this.recordTest('Calculator.solve Method', hasSolve, 
                    hasSolve ? 'Method exists' : 'Method missing');
            }
        } catch (error) {
            this.recordTest('Calculator Available', false, `Error: ${error.message}`);
        }
        
        return this.testResults;
    }

    /**
     * Test each calculation path individually
     */
    testCalculationPaths() {
        console.log('[CalculateButtonDebugger] 🧪 Testing calculation paths...');
        this.testResults = [];
        
        // Path 1: Direct calculationOrchestrator.performCalculation
        if (window.uiOrchestrator?.calculationOrchestrator?.performCalculation) {
            try {
                console.log('[CalculateButtonDebugger] Testing Path 1: calculationOrchestrator.performCalculation()');
                const result = window.uiOrchestrator.calculationOrchestrator.performCalculation();
                this.recordTest('Path 1: Direct performCalculation', true, `Result: ${JSON.stringify(result)}`);
            } catch (error) {
                this.recordTest('Path 1: Direct performCalculation', false, `Error: ${error.message}`);
            }
        } else {
            this.recordTest('Path 1: Direct performCalculation', false, 'Method not available');
        }
        
        // Path 2: window.performCalculation
        if (typeof window.performCalculation === 'function') {
            try {
                console.log('[CalculateButtonDebugger] Testing Path 2: window.performCalculation()');
                const result = window.performCalculation();
                this.recordTest('Path 2: window.performCalculation', true, `Result: ${JSON.stringify(result)}`);
            } catch (error) {
                this.recordTest('Path 2: window.performCalculation', false, `Error: ${error.message}`);
            }
        } else {
            this.recordTest('Path 2: window.performCalculation', false, 'Function not available');
        }
        
        // Path 3: window.calculationOrchestrator.performCalculation
        if (window.calculationOrchestrator?.performCalculation) {
            try {
                console.log('[CalculateButtonDebugger] Testing Path 3: window.calculationOrchestrator.performCalculation()');
                const result = window.calculationOrchestrator.performCalculation();
                this.recordTest('Path 3: window.calculationOrchestrator.performCalculation', true, `Result: ${JSON.stringify(result)}`);
            } catch (error) {
                this.recordTest('Path 3: window.calculationOrchestrator.performCalculation', false, `Error: ${error.message}`);
            }
        } else {
            this.recordTest('Path 3: window.calculationOrchestrator.performCalculation', false, 'Method not available');
        }
        
        return this.testResults;
    }

    /**
     * Generate comprehensive diagnostic report
     */
    generateReport() {
        console.log('[CalculateButtonDebugger] 📊 Generating comprehensive diagnostic report...');
        console.log('='.repeat(80));
        
        const allResults = {
            buttonClick: this.testButtonClick(),
            eventHandlers: this.testEventHandlers(),
            callbacks: this.testCallbacks(),
            calculationOrchestrator: this.testCalculationOrchestrator(),
            formulaAndCalculator: this.testFormulaAndCalculator(),
            calculationPaths: this.testCalculationPaths()
        };
        
        console.log('\n📋 DIAGNOSTIC REPORT');
        console.log('='.repeat(80));
        
        Object.entries(allResults).forEach(([category, results]) => {
            console.log(`\n${category.toUpperCase()}:`);
            results.forEach(result => {
                const icon = result.passed ? '✅' : '❌';
                console.log(`  ${icon} ${result.name}: ${result.message}`);
            });
        });
        
        // Summary
        const totalTests = Object.values(allResults).flat().length;
        const passedTests = Object.values(allResults).flat().filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        
        console.log('\n' + '='.repeat(80));
        console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed, ${failedTests} failed`);
        console.log('='.repeat(80));
        
        return {
            summary: { total: totalTests, passed: passedTests, failed: failedTests },
            results: allResults
        };
    }

    /**
     * Record a test result
     */
    recordTest(name, passed, message) {
        this.testResults.push({ name, passed, message });
        const icon = passed ? '✅' : '❌';
        console.log(`[CalculateButtonDebugger] ${icon} ${name}: ${message}`);
    }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.CalculateButtonDebugger = CalculateButtonDebugger;
}

