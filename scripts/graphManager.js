// Graph Manager for Desmos Integration

class GraphManager {
    constructor() {
        this.calculator = null;
        this.currentFormula = null;
        this.currentValues = {};
    }

    // Initialize Desmos calculator
    init(containerId = 'desmos-graph') {
        // Check if Desmos is loaded
        if (typeof Desmos === 'undefined') {
            console.error('Desmos API not loaded. Please check the script tag in index.html');
            return false;
        }
        
        const elt = document.getElementById(containerId);
        if (!elt) {
            console.error('Graph container not found:', containerId);
            return false;
        }

        // Check if container is visible (not in hidden tab)
        const tab = elt.closest('.tab-content');
        if (tab && !tab.classList.contains('active')) {
            console.warn('Graph container is in hidden tab, initialization may fail');
        }

        // If calculator already exists, destroy it first
        if (this.calculator) {
            try {
                this.calculator.destroy();
            } catch (e) {
                console.warn('Error destroying existing calculator:', e);
            }
            this.calculator = null;
        }

        try {
            this.calculator = Desmos.GraphingCalculator(elt, {
                keypad: false,
                expressions: false,
                settingsMenu: false,
                zoomButtons: false,
                showGrid: true,
                xAxisLabel: 'x',
                yAxisLabel: 'y',
                xAxisStep: 1,
                yAxisStep: 1
            });
            console.log('Desmos calculator initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing Desmos calculator:', error);
            return false;
        }
    }

    // Update graph based on formula and current values
    updateGraph(formula, variableValues) {
        // Check if we're in the graph tab
        const graphTab = document.getElementById('graph-tab');
        if (!graphTab || !graphTab.classList.contains('active')) {
            // Graph tab not active, don't update
            return;
        }

        if (!this.calculator) {
            // Try to initialize
            const initialized = this.init();
            if (!initialized) {
                // Show error message if Desmos failed to load
                const container = document.getElementById('desmos-graph');
                if (container && !container.querySelector('.desmos-calculator')) {
                    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;"><p>Desmos API failed to load. Please refresh the page.</p><p style="font-size: 0.9em; color: #999;">If the problem persists, check your internet connection.</p></div>';
                }
                return;
            }
        }

        if (!this.calculator) {
            return;
        }

        this.currentFormula = formula;
        this.currentValues = { ...variableValues };

        // Clear existing expressions
        this.calculator.setExpressions([]);

        // Get constants from formula
        const constants = formula.constants || {};
        
        // Merge constants into variableValues for graphing
        const allValues = { ...variableValues, ...constants };

        // Filter out constants from variables list for finding null variable
        const constantSymbols = new Set(Object.keys(constants));
        const userVariables = formula.variables.filter(v => !constantSymbols.has(v.symbol));

        // Determine which variable to graph (the one that's null/unknown)
        const nullVar = userVariables.find(v => 
            !variableValues[v.symbol] || 
            variableValues[v.symbol] === null || 
            variableValues[v.symbol] === '' ||
            variableValues[v.symbol] === 'null'
        );

        if (!nullVar) {
            // All variables filled, show relationship
            this.showRelationship(formula, allValues);
            return;
        }

        // Graph the relationship for the unknown variable
        this.graphFormula(formula, nullVar, allValues);
    }

    // Show relationship between variables
    showRelationship(formula, variableValues) {
        // For now, show a simple 2D relationship if possible
        // This is formula-specific
        const formulaId = formula.id;
        
        // Try to create a parametric or explicit relationship
        if (formula.variables.length === 2) {
            this.graphTwoVariableRelationship(formula, variableValues);
        } else if (formula.variables.length === 3) {
            this.graphThreeVariableRelationship(formula, variableValues);
        }
    }

    // Graph formula with one unknown variable
    graphFormula(formula, unknownVar, knownVars) {
        const formulaId = formula.id;
        const expressions = [];

        // Create a graph expression based on the formula
        // This is simplified - we'll show the relationship
        try {
            const graphExpr = this.createGraphExpression(formula, unknownVar, knownVars);
            if (graphExpr) {
                // Set axis labels based on variables
                const xLabel = unknownVar.name || unknownVar.symbol || 'x';
                const yLabel = this.getYAxisLabel(formula, unknownVar);
                
                this.calculator.setExpressions([graphExpr]);
                
                // Update axis labels
                if (this.calculator.setAxisLabel) {
                    this.calculator.setAxisLabel(1, xLabel);
                    this.calculator.setAxisLabel(2, yLabel);
                }
                
                // Set appropriate bounds
                const bounds = {
                    left: graphExpr.xMin || -10,
                    right: graphExpr.xMax || 10,
                    bottom: graphExpr.yMin || -10,
                    top: graphExpr.yMax || 10
                };
                
                this.calculator.setMathBounds(bounds);
            }
        } catch (e) {
            console.error('Error creating graph:', e);
            this.calculator.setExpressions([{
                id: 'error',
                latex: 'y = \\text{Graph not available for this formula}'
            }]);
        }
    }

    // Create graph expression for a formula
    createGraphExpression(formula, unknownVar, knownVars) {
        const formulaId = formula.id;
        const symbol = unknownVar.symbol;

        // Convert known values to numbers
        const numericVars = {};
        for (const [key, value] of Object.entries(knownVars)) {
            if (value !== null && value !== '' && value !== 'null') {
                try {
                    numericVars[key] = typeof value === 'number' ? value : parseFloat(value);
                } catch (e) {
                    // Skip invalid values
                }
            }
        }

        // Create expression based on formula type
        switch (formulaId) {
            case 'angular_size':
                // θ = d / D
                if (symbol === 'θ') {
                    return {
                        id: 'graph',
                        latex: `y = ${numericVars.d || 'd'} / ${numericVars.D || 'x'}`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0.1,
                        xMax: 100,
                        yMin: 0,
                        yMax: 10
                    };
                } else if (symbol === 'd') {
                    return {
                        id: 'graph',
                        latex: `y = x * ${numericVars.D || 'D'}`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0,
                        xMax: 10,
                        yMin: 0,
                        yMax: 100
                    };
                }
                break;

            case 'orbital_velocity':
                // v = √(GM/r)
                if (symbol === 'v') {
                    const G = numericVars.G || 6.67430e-11;
                    const M = numericVars.M || 1;
                    return {
                        id: 'graph',
                        latex: `y = \\sqrt{${G * M} / x}`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0.1,
                        xMax: 1000,
                        yMin: 0,
                        yMax: 100
                    };
                }
                break;

            case 'escape_velocity':
                // v_esc = √(2GM/r)
                if (symbol === 'v_esc') {
                    const G = numericVars.G || 6.67430e-11;
                    const M = numericVars.M || 1;
                    return {
                        id: 'graph',
                        latex: `y = \\sqrt{${2 * G * M} / x}`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0.1,
                        xMax: 1000,
                        yMin: 0,
                        yMax: 100
                    };
                }
                break;

            case 'distance_modulus':
                // m - M = 5 log₁₀(d) - 5
                if (symbol === 'm' || symbol === 'M' || symbol === 'd') {
                    const m = numericVars.m;
                    const M = numericVars.M;
                    const d = numericVars.d;
                    
                    if (symbol === 'd') {
                        return {
                            id: 'graph',
                            latex: `y = 10^{\\frac{${m || 'm'} - ${M || 'M'} + 5}{5}}`,
                            color: Desmos.Colors.BLUE,
                            xMin: 0,
                            xMax: 10,
                            yMin: 0,
                            yMax: 1000
                        };
                    }
                }
                break;

            case 'hubble_law':
                // v = H₀ × d
                if (symbol === 'v' || symbol === 'd') {
                    const H0 = numericVars['H₀'] || numericVars.H0 || 70;
                    if (symbol === 'v') {
                        return {
                            id: 'graph',
                            latex: `y = ${H0} * x`,
                            color: Desmos.Colors.BLUE,
                            xMin: 0,
                            xMax: 100,
                            yMin: 0,
                            yMax: 10000
                        };
                    }
                }
                break;

            case 'wiens_law':
                // λmax = b / T
                if (symbol === 'λmax' || symbol === 'T') {
                    const b = numericVars.b || 2.898e-3;
                    if (symbol === 'λmax') {
                        return {
                            id: 'graph',
                            latex: `y = ${b} / x`,
                            color: Desmos.Colors.BLUE,
                            xMin: 100,
                            xMax: 10000,
                            yMin: 0,
                            yMax: 0.01
                        };
                    }
                }
                break;

            case 'rotational_velocity':
                // v = (2πR) / P_rot
                if (symbol === 'v') {
                    const R = numericVars.R || 1;
                    const Prot = numericVars.P_rot || 1;
                    return {
                        id: 'graph',
                        latex: `y = ${2 * Math.PI * R} / x`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0.1,
                        xMax: 100,
                        yMin: 0,
                        yMax: 100
                    };
                }
                break;

            case 'flux_from_luminosity':
                // F = L / (4πd²)
                if (symbol === 'F') {
                    const L = numericVars.L || 1;
                    return {
                        id: 'graph',
                        latex: `y = ${L} / (4\\pi x^2)`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0.1,
                        xMax: 100,
                        yMin: 0,
                        yMax: 100
                    };
                } else if (symbol === 'd') {
                    const L = numericVars.L || 1;
                    const F = numericVars.F || 1;
                    return {
                        id: 'graph',
                        latex: `y = \\sqrt{${L} / (4\\pi x)}`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0.1,
                        xMax: 100,
                        yMin: 0,
                        yMax: 100
                    };
                }
                break;

            case 'kepler_third_law':
                // T² = (4π²/GM) × a³
                if (symbol === 'T') {
                    const G = numericVars.G || 6.67430e-11;
                    const M = numericVars.M || 1;
                    const factor = 4 * Math.PI * Math.PI / (G * M);
                    return {
                        id: 'graph',
                        latex: `y = \\sqrt{${factor} x^3}`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0.1,
                        xMax: 1000,
                        yMin: 0,
                        yMax: 10000
                    };
                } else if (symbol === 'a') {
                    const G = numericVars.G || 6.67430e-11;
                    const M = numericVars.M || 1;
                    const T = numericVars.T || 1;
                    const factor = 4 * Math.PI * Math.PI / (G * M);
                    return {
                        id: 'graph',
                        latex: `y = \\sqrt[3]{x^2 / ${factor}}`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0.1,
                        xMax: 10000,
                        yMin: 0,
                        yMax: 1000
                    };
                }
                break;

            case 'inverse_square_law_brightness':
                // B = L / (4πd²)
                if (symbol === 'B') {
                    const L = numericVars.L || 1;
                    return {
                        id: 'graph',
                        latex: `y = ${L} / (4\\pi x^2)`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0.1,
                        xMax: 100,
                        yMin: 0,
                        yMax: 100
                    };
                }
                break;

            case 'flux_temperature':
                // F = σT⁴
                if (symbol === 'F') {
                    const sigma = numericVars.σ || numericVars.sigma || 5.670e-8;
                    return {
                        id: 'graph',
                        latex: `y = ${sigma} x^4`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0,
                        xMax: 10000,
                        yMin: 0,
                        yMax: 1000000
                    };
                } else if (symbol === 'T') {
                    const sigma = numericVars.σ || numericVars.sigma || 5.670e-8;
                    const F = numericVars.F || 1;
                    return {
                        id: 'graph',
                        latex: `y = \\sqrt[4]{x / ${sigma}}`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0,
                        xMax: 1000000,
                        yMin: 0,
                        yMax: 10000
                    };
                }
                break;

            case 'doppler_shift':
                // Δλ/λ = v/c
                if (symbol === 'Δλ' || symbol === 'dlambda') {
                    const lambda = numericVars.λ || numericVars.lambda || 1;
                    const v = numericVars.v || 0;
                    const c = numericVars.c || 2.998e8;
                    return {
                        id: 'graph',
                        latex: `y = ${lambda} * (x / ${c})`,
                        color: Desmos.Colors.BLUE,
                        xMin: -c,
                        xMax: c,
                        yMin: -lambda,
                        yMax: lambda
                    };
                }
                break;

            case 'schwarzschild_radius':
                // r_s = 2GM/c²
                if (symbol === 'r_s' || symbol === 'rs') {
                    const G = numericVars.G || 6.67430e-11;
                    const c = numericVars.c || 2.998e8;
                    const factor = 2 * G / (c * c);
                    return {
                        id: 'graph',
                        latex: `y = ${factor} x`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0,
                        xMax: 1e30,
                        yMin: 0,
                        yMax: 1e5
                    };
                }
                break;

            case 'parallax_distance_radians':
            case 'parallax_distance_arcsec':
                // d = 1/p
                if (symbol === 'd') {
                    return {
                        id: 'graph',
                        latex: `y = 1 / x`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0.001,
                        xMax: 1,
                        yMin: 1,
                        yMax: 1000
                    };
                }
                break;

            case 'luminosity':
                // L = 4πR²σT⁴
                if (symbol === 'L') {
                    const R = numericVars.R || 1;
                    const sigma = numericVars.σ || numericVars.sigma || 5.670e-8;
                    const T = numericVars.T || 1;
                    const factor = 4 * Math.PI * R * R * sigma * Math.pow(T, 4);
                    return {
                        id: 'graph',
                        latex: `y = ${factor}`,
                        color: Desmos.Colors.BLUE,
                        xMin: 0,
                        xMax: 10,
                        yMin: 0,
                        yMax: factor * 2
                    };
                }
                break;

            default:
                // Try to create a generic graph based on formula structure
                return this.createGenericGraph(formula, unknownVar, numericVars);
        }

        return null;
    }

    // Create a generic graph expression when no specific handler exists
    createGenericGraph(formula, unknownVar, numericVars) {
        // Show informative message
        return {
            id: 'info',
            latex: `\\text{Graph: } ${formula.equation}`,
            color: Desmos.Colors.GRAY
        };
    }

    // Graph two-variable relationship
    graphTwoVariableRelationship(formula, variableValues) {
        // Simple linear or inverse relationships
        const vars = formula.variables;
        if (vars.length === 2) {
            const var1 = vars[0];
            const var2 = vars[1];
            const val1 = variableValues[var1.symbol];
            const val2 = variableValues[var2.symbol];

            if (val1 && val2) {
                // Show point
                this.calculator.setExpressions([{
                    id: 'point',
                    latex: `(${val1}, ${val2})`,
                    color: Desmos.Colors.RED,
                    pointStyle: Desmos.Styles.POINT,
                    pointSize: 10
                }]);
            }
        }
    }

    // Graph three-variable relationship
    graphThreeVariableRelationship(formula, variableValues) {
        // For 3+ variables, show a parametric or surface plot if possible
        // This is more complex and formula-specific
        this.calculator.setExpressions([{
            id: 'info',
            latex: '\\text{Enter values in Calculator tab to see relationship}'
        }]);
    }

    // Clear graph
    clear() {
        if (this.calculator) {
            this.calculator.setExpressions([]);
        }
    }

    // Get appropriate y-axis label based on formula and unknown variable
    getYAxisLabel(formula, unknownVar) {
        // Try to find the result variable name
        const resultVar = formula.variables.find(v => v.symbol === unknownVar.symbol);
        if (resultVar) {
            return resultVar.name || resultVar.symbol;
        }
        return 'Value';
    }

    // Destroy calculator instance
    destroy() {
        if (this.calculator) {
            this.calculator.destroy();
            this.calculator = null;
        }
    }
}

// Global instance
let graphManager = null;

