/**
 * Calculation Debugger
 * Comprehensive debugging wrapper for calculate/classify buttons
 * Helps identify exactly where calculations fail
 */

class CalculationDebugger {
    constructor() {
        this.enabled = true;
        this.logs = [];
        this.maxLogs = 100;
    }

    /**
     * Enable/disable debugging
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Log a debug message
     */
    log(category, message, data = null) {
        if (!this.enabled) return;
        
        const entry = {
            timestamp: new Date().toISOString(),
            category,
            message,
            data: data ? JSON.parse(JSON.stringify(data)) : null
        };
        
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        console.log(`[${category}] ${message}`, data || '');
    }

    /**
     * Wrap a function with debugging
     */
    wrapFunction(name, fn, context = null) {
        return (...args) => {
            this.log('WRAP', `Calling ${name}`, { args: args.length });
            try {
                const result = fn.apply(context, args);
                this.log('WRAP', `${name} returned`, { result: result !== undefined ? 'defined' : 'undefined' });
                return result;
            } catch (error) {
                this.log('ERROR', `${name} threw error`, { error: error.message, stack: error.stack });
                throw error;
            }
        };
    }

    /**
     * Debug button click
     */
    debugButtonClick(buttonId, handler) {
        const button = document.getElementById(buttonId);
        if (!button) {
            console.error(`[CalculationDebugger] Button ${buttonId} not found in DOM`);
            return;
        }

        // Remove existing listeners (if any)
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', (e) => {
            this.log('BUTTON', `Button ${buttonId} clicked`, {
                buttonId,
                timestamp: new Date().toISOString(),
                event: {
                    type: e.type,
                    target: e.target.id,
                    currentTarget: e.currentTarget.id
                }
            });

            try {
                const result = handler(e);
                this.log('BUTTON', `Button ${buttonId} handler completed`, { result: result !== undefined ? 'defined' : 'undefined' });
            } catch (error) {
                this.log('ERROR', `Button ${buttonId} handler threw error`, {
                    error: error.message,
                    stack: error.stack
                });
            }
        });

        this.log('BUTTON', `Debug wrapper attached to ${buttonId}`);
    }

    /**
     * Debug input resolution
     */
    debugInputResolution(variable, strategies) {
        this.log('INPUT', `Resolving input for ${variable.symbol}`, {
            variable: variable.symbol,
            strategies: strategies.length
        });

        for (let i = 0; i < strategies.length; i++) {
            const strategy = strategies[i];
            try {
                const result = strategy();
                if (result) {
                    this.log('INPUT', `Strategy ${i + 1} succeeded for ${variable.symbol}`, {
                        strategy: i + 1,
                        inputId: result.id,
                        value: result.value,
                        hasValue: !!result.value.trim(),
                        unit: result.getAttribute('data-unit')
                    });
                    return result;
                } else {
                    this.log('INPUT', `Strategy ${i + 1} returned null for ${variable.symbol}`, {
                        strategy: i + 1
                    });
                }
            } catch (error) {
                this.log('ERROR', `Strategy ${i + 1} threw error for ${variable.symbol}`, {
                    strategy: i + 1,
                    error: error.message
                });
            }
        }

        this.log('INPUT', `All strategies failed for ${variable.symbol}`);
        return null;
    }

    /**
     * Debug value parsing
     */
    debugValueParsing(input, variable, parseFn) {
        if (!input) {
            this.log('PARSE', `No input element for ${variable.symbol}`);
            return null;
        }

        this.log('PARSE', `Parsing value for ${variable.symbol}`, {
            inputId: input.id,
            rawValue: input.value,
            trimmedValue: input.value?.trim(),
            unit: input.getAttribute('data-unit')
        });

        try {
            const result = parseFn(input, variable);
            this.log('PARSE', `Parsed value for ${variable.symbol}`, {
                result,
                type: typeof result,
                isFinite: typeof result === 'number' ? Number.isFinite(result) : 'N/A'
            });
            return result;
        } catch (error) {
            this.log('ERROR', `Parsing failed for ${variable.symbol}`, {
                error: error.message,
                inputValue: input.value,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Debug calculation orchestration
     */
    debugCalculationOrchestration(orchestrator) {
        const originalPerformCalculation = orchestrator.performCalculation.bind(orchestrator);
        
        orchestrator.performCalculation = () => {
            this.log('CALC', 'performCalculation() called', {
                timestamp: new Date().toISOString(),
                stack: new Error().stack.split('\n').slice(1, 5).join('\n')
            });

            // Check prerequisites
            const calculator = orchestrator.getCalculator?.();
            const formula = orchestrator.getFormula?.();
            
            this.log('CALC', 'Prerequisites check', {
                hasCalculator: !!calculator,
                hasFormula: !!formula,
                calculatorType: calculator ? calculator.constructor.name : 'null',
                formulaId: formula?.id || 'null',
                formulaName: formula?.name || 'null'
            });

            if (!calculator) {
                this.log('ERROR', 'No calculator available');
            }
            if (!formula) {
                this.log('ERROR', 'No formula available');
            }

            try {
                const result = originalPerformCalculation();
                this.log('CALC', 'performCalculation() completed', {
                    result: result !== undefined ? 'defined' : 'undefined'
                });
                return result;
            } catch (error) {
                this.log('ERROR', 'performCalculation() threw error', {
                    error: error.message,
                    stack: error.stack
                });
                throw error;
            }
        };

        this.log('CALC', 'Calculation orchestration debug wrapper installed');
    }

    /**
     * Debug variable collection
     */
    debugVariableCollection(formula, collectFn) {
        this.log('COLLECT', `Collecting variables for ${formula.name}`, {
            formulaId: formula.id,
            variableCount: formula.variables?.length || 0,
            variables: formula.variables?.map(v => v.symbol) || []
        });

        try {
            const values = collectFn(formula);
            
            const summary = {
                total: Object.keys(values).length,
                known: Object.entries(values).filter(([_, v]) => v !== null && typeof v === 'number' && Number.isFinite(v)).length,
                unknown: Object.entries(values).filter(([_, v]) => v === null || v === undefined).length,
                invalid: Object.entries(values).filter(([_, v]) => v !== null && (typeof v !== 'number' || !Number.isFinite(v))).length
            };

            this.log('COLLECT', 'Variable collection summary', summary);
            this.log('COLLECT', 'Variable values', values);

            return values;
        } catch (error) {
            this.log('ERROR', 'Variable collection failed', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Debug calculator solve
     */
    debugCalculatorSolve(calculator, variableValues) {
        this.log('SOLVE', 'Calling calculator.solve()', {
            variableValues,
            knownCount: Object.values(variableValues).filter(v => v !== null && typeof v === 'number' && Number.isFinite(v)).length,
            unknownCount: Object.values(variableValues).filter(v => v === null || v === undefined).length
        });

        if (!calculator || typeof calculator.solve !== 'function') {
            this.log('ERROR', 'Calculator or solve() method missing', {
                hasCalculator: !!calculator,
                hasSolve: calculator ? typeof calculator.solve === 'function' : false
            });
            return null;
        }

        try {
            const result = calculator.solve(variableValues);
            this.log('SOLVE', 'calculator.solve() returned', {
                hasResult: !!result,
                isSymbolic: result?.isSymbolic,
                resultType: typeof result?.result,
                resultValue: result?.result,
                solvedFor: result?.solvedFor
            });
            return result;
        } catch (error) {
            this.log('ERROR', 'calculator.solve() threw error', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Get debug report
     */
    getReport() {
        const report = {
            totalLogs: this.logs.length,
            errors: this.logs.filter(l => l.category === 'ERROR'),
            buttons: this.logs.filter(l => l.category === 'BUTTON'),
            inputs: this.logs.filter(l => l.category === 'INPUT'),
            parsing: this.logs.filter(l => l.category === 'PARSE'),
            collection: this.logs.filter(l => l.category === 'COLLECT'),
            calculation: this.logs.filter(l => l.category === 'CALC'),
            solving: this.logs.filter(l => l.category === 'SOLVE'),
            allLogs: this.logs
        };

        return report;
    }

    /**
     * Print debug report to console
     */
    printReport() {
        const report = this.getReport();
        
        console.group('🔍 Calculation Debug Report');
        console.log(`Total logs: ${report.totalLogs}`);
        console.log(`Errors: ${report.errors.length}`);
        console.log(`Button clicks: ${report.buttons.length}`);
        console.log(`Input resolutions: ${report.inputs.length}`);
        console.log(`Value parsing: ${report.parsing.length}`);
        console.log(`Variable collections: ${report.collection.length}`);
        console.log(`Calculations: ${report.calculation.length}`);
        console.log(`Solver calls: ${report.solving.length}`);
        
        if (report.errors.length > 0) {
            console.group('❌ Errors');
            report.errors.forEach(err => {
                console.error(err.message, err.data);
            });
            console.groupEnd();
        }
        
        console.group('📋 All Logs');
        report.allLogs.forEach(log => {
            console.log(`[${log.category}] ${log.message}`, log.data);
        });
        console.groupEnd();
        
        console.groupEnd();
    }

    /**
     * Clear logs
     */
    clear() {
        this.logs = [];
        this.log('DEBUG', 'Logs cleared');
    }
}

// Export
if (typeof window !== 'undefined') {
    window.CalculationDebugger = CalculationDebugger;
    window.calculationDebugger = new CalculationDebugger();
    
    // Add global helper
    window.debugCalculation = () => {
        window.calculationDebugger.printReport();
    };
    
    console.log('✅ CalculationDebugger loaded. Use window.debugCalculation() to see report.');
}

