/**
 * Multi-Step Problem Solver
 * 
 * ARCHITECTURE: Thin orchestration layer above FormulaCalculator
 * - FormulaCalculator: Atomic single-equation solver (DO NOT MODIFY)
 * - SolveContext: Memory and traceability layer
 * - MultiStepSolver: Thin deterministic orchestrator
 * 
 * Design principles:
 * 1. Explicit solve steps (no guessing, no regex inference)
 * 2. Context-aware solving (memory of intermediates)
 * 3. Physics-aware sanity checks
 * 4. Transparent reasoning (full traceability)
 * 
 * @version 2.0
 */

/**
 * SolveContext - Memory and traceability layer
 * 
 * Provides:
 * - Memory of known and derived quantities
 * - Trace of execution path
 * - Warnings for sanity violations
 * - Explanation hooks
 */
class SolveContext {
    constructor(initialVars = {}) {
        this.known = { ...initialVars }; // Initial given values
        this.derived = {}; // Computed intermediate values
        this.trace = []; // Execution trace for explainability
        this.warnings = []; // Sanity check warnings
    }

    /**
     * Get a variable value (checks derived first, then known)
     */
    get(varName) {
        return this.derived[varName] ?? this.known[varName];
    }

    /**
     * Set a derived variable with metadata
     */
    set(varName, value, meta = {}) {
        this.derived[varName] = value;
        this.trace.push({
            varName,
            value,
            formula: meta.formula,
            inputs: meta.inputs,
            timestamp: Date.now()
        });
    }

    /**
     * Add a warning (doesn't stop execution)
     */
    warn(message) {
        this.warnings.push(message);
    }

    /**
     * Get all variables (known + derived)
     */
    getAll() {
        return { ...this.known, ...this.derived };
    }

    /**
     * Check if a variable exists
     */
    has(varName) {
        return varName in this.derived || varName in this.known;
    }
}

/**
 * Multi-step problem solver - THIN ORCHESTRATION LAYER
 * 
 * Does NOT contain algebra logic - delegates to FormulaCalculator
 * Does NOT guess - requires explicit solve steps
 * Does NOT hide failures - throws immediately on errors (unless softFail=true)
 */
class MultiStepSolver {
    constructor(formulas) {
        this.formulas = formulas;
    }

    /**
     * Validate solve plan for circular dependencies and missing prerequisites
     * @param {Array<Object>} steps - Solve step definitions
     * @returns {Object} Validation result with errors and warnings
     */
    validatePlan(steps) {
        const errors = [];
        const warnings = [];
        const outputs = new Set(); // Track what each step produces
        const inputs = new Set(); // Track what's needed overall

        // First pass: collect all outputs and inputs
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            
            if (!step.formulaId || !step.output || !Array.isArray(step.inputs)) {
                errors.push(`Step ${i + 1}: Invalid step definition (missing formulaId, output, or inputs)`);
                continue;
            }

            // Check formula exists
            const formula = this.formulas.find(f => f.id === step.formulaId);
            if (!formula) {
                errors.push(`Step ${i + 1}: Formula not found: ${step.formulaId}`);
                continue;
            }

            outputs.add(step.output);
            step.inputs.forEach(input => inputs.add(input));
        }

        // Second pass: check dependencies
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            
            // Check if inputs are available (either initial or from previous steps)
            const availableOutputs = new Set();
            for (let j = 0; j < i; j++) {
                availableOutputs.add(steps[j].output);
            }

            for (const input of step.inputs) {
                if (!availableOutputs.has(input) && !inputs.has(input)) {
                    // This input is not produced by any previous step
                    // It must be provided as initial input
                    warnings.push(`Step ${i + 1}: Input '${input}' must be provided as initial value`);
                }
            }

            // Check for circular dependency (output used as input in earlier step)
            for (let j = 0; j < i; j++) {
                if (steps[j].inputs.includes(step.output)) {
                    errors.push(`Circular dependency detected: Step ${i + 1} produces '${step.output}' which is used by Step ${j + 1}`);
                }
            }

            // Check for duplicate outputs
            for (let j = 0; j < i; j++) {
                if (steps[j].output === step.output) {
                    warnings.push(`Step ${i + 1}: Overwrites output '${step.output}' from Step ${j + 1}`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * Execute solve steps with explicit context
     * 
     * @param {Array<Object>} steps - Explicit solve step definitions
     *   Each step: { output, formulaId, inputs, defaults?, sanity?, description? }
     *   - defaults: Optional object mapping input names to default values
     * @param {SolveContext} context - Solve context with initial variables
     * @param {Object} options - Execution options
     *   - validatePlan: boolean (default: true) - Validate plan before execution
     *   - softFail: boolean (default: false) - Continue on errors, mark failed steps
     * @returns {SolveContext} Updated context with results
     */
    solve(steps, context, options = {}) {
        if (!context || !(context instanceof SolveContext)) {
            throw new Error('SolveContext required. Create with: new SolveContext(initialVars)');
        }

        if (!Array.isArray(steps) || steps.length === 0) {
            throw new Error('Steps array required and must not be empty');
        }

        const { validatePlan = true, softFail = false } = options;

        // Validate plan if requested
        if (validatePlan) {
            const validation = this.validatePlan(steps);
            if (!validation.valid) {
                throw new Error(`Plan validation failed:\n${validation.errors.join('\n')}`);
            }
            // Log warnings but don't fail
            validation.warnings.forEach(warning => context.warn(warning));
        }

        // Execute each step in order - NO GUESSING, NO INFERENCE
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];

            // Validate step definition
            if (!step.formulaId || !step.output || !Array.isArray(step.inputs)) {
                throw new Error(`Invalid step definition at index ${i}: must have formulaId, output, and inputs array`);
            }

            // Get formula - delegate to FormulaCalculator (atomic solver)
            const formula = this.formulas.find(f => f.id === step.formulaId);
            if (!formula) {
                throw new Error(`Formula not found: ${step.formulaId} (step ${i + 1})`);
            }

            // Collect input values from context (with defaults support)
            const inputValues = {};
            for (const inputVar of step.inputs) {
                let value = context.get(inputVar);
                
                // Check for default value if not in context
                if (value === undefined && step.defaults && step.defaults[inputVar] !== undefined) {
                    value = step.defaults[inputVar];
                    context.warn(`Using default value for ${inputVar}: ${value}`);
                }
                
                if (value === undefined) {
                    const error = `Missing required variable: ${inputVar} for step ${i + 1} (${step.formulaId})`;
                    if (softFail) {
                        context.warn(error);
                        context.set(step.output, null, {
                            formula: step.formulaId,
                            error: error,
                            stepIndex: i + 1,
                            failed: true
                        });
                        continue; // Skip to next step
                    } else {
                        throw new Error(error);
                    }
                }
                
                if (!isFinite(value)) {
                    const error = `Invalid value for ${inputVar}: ${value} (not finite)`;
                    if (softFail) {
                        context.warn(error);
                        context.set(step.output, null, {
                            formula: step.formulaId,
                            error: error,
                            stepIndex: i + 1,
                            failed: true
                        });
                        continue;
                    } else {
                        throw new Error(error);
                    }
                }
                
                inputValues[inputVar] = value;
            }

            // Delegate to FormulaCalculator - THIS IS THE ATOMIC SOLVER
            // We do NOT add algebra logic here - FormulaCalculator handles it
            try {
                const calc = new FormulaCalculator(formula);
                const result = calc.solve(inputValues);

                // Validate result
                if (!result || result.result === undefined) {
                    throw new Error(`FormulaCalculator returned invalid result for ${step.output}`);
                }
                if (!isFinite(result.result)) {
                    throw new Error(`Non-finite result for ${step.output}: ${result.result}`);
                }

                // Numeric stability checks
                if (Math.abs(result.result) > 1e100) {
                    context.warn(`Very large result for ${step.output}: ${result.result} (possible overflow)`);
                }
                if (result.result !== 0 && Math.abs(result.result) < 1e-100) {
                    context.warn(`Very small result for ${step.output}: ${result.result} (possible underflow)`);
                }

                // Apply sanity check if provided
                if (step.sanity && typeof step.sanity === 'function') {
                    if (!step.sanity(result.result)) {
                        context.warn(`Sanity check failed for ${step.output}: ${result.result} (step ${i + 1})`);
                    }
                }

                // Store in context with metadata
                context.set(step.output, result.result, {
                    formula: step.formulaId,
                    inputs: { ...inputValues },
                    stepIndex: i + 1,
                    description: step.description || `Calculate ${step.output}`,
                    unit: result.unit || '',
                    failed: false
                });

            } catch (error) {
                // Handle errors based on softFail mode
                if (softFail) {
                    context.warn(`Step ${i + 1} failed: ${error.message}`);
                    context.set(step.output, null, {
                        formula: step.formulaId,
                        inputs: { ...inputValues },
                        error: error.message,
                        stepIndex: i + 1,
                        failed: true
                    });
                    // Continue to next step
                } else {
                    throw new Error(`Step ${i + 1} (${step.formulaId}) failed: ${error.message}`);
                }
            }
        }

        return context;
    }
}

/**
 * Pre-defined solve plans for common complex problems
 * 
 * Each plan is an array of explicit steps with:
 * - formulaId: Which formula to use (delegates to FormulaCalculator)
 * - inputs: Required variable names (must exist in context)
 * - output: Variable name to store result
 * - sanity: Optional function(value) returning boolean for sanity check
 * - description: Human-readable step description
 */
const CommonSolvePlans = {
    /**
     * Find luminosity from apparent magnitude, distance, and extinction
     * Graph: m, d, A → M → L
     * 
     * Note: A (extinction) defaults to 0 if not provided
     */
    luminosityFromApparentMagnitude: [
        {
            formulaId: 'distance_modulus',
            inputs: ['m', 'd', 'A'],
            output: 'M',
            description: 'Calculate absolute magnitude from apparent magnitude, distance, and extinction',
            defaults: { A: 0 }, // Default extinction to 0 if not provided
            sanity: (M) => M > -30 && M < 30 // Reasonable magnitude range
        },
        {
            formulaId: 'luminosity_absolute_magnitude',
            inputs: ['M'],
            output: 'L',
            description: 'Calculate luminosity from absolute magnitude',
            sanity: (L) => L > 0 // Luminosity must be positive
        }
    ],

    /**
     * Find stellar temperature from luminosity and radius
     * Graph: L, R → T
     */
    temperatureFromLuminosity: [
        {
            formulaId: 'luminosity',
            inputs: ['L', 'R'],
            output: 'T',
            description: 'Calculate effective temperature from luminosity and radius (Stefan-Boltzmann)',
            sanity: (T) => T > 0 && T < 1e6 // Positive temperature, reasonable upper bound
        }
    ],

    /**
     * Find exoplanet equilibrium temperature
     * Graph: T_star, R_star, a, A → T_eq
     */
    exoplanetEquilibriumTemperature: [
        {
            formulaId: 'planetary_equilibrium_temperature',
            inputs: ['T_star', 'R_star', 'a', 'A'],
            output: 'T_eq',
            description: 'Calculate exoplanet equilibrium temperature',
            sanity: (T_eq) => T_eq > 0 && T_eq < 10000 // Positive, reasonable planetary temperature
        }
    ]
};

/**
 * Helper function to create a solve context and execute steps
 * Convenience wrapper for common use case
 * 
 * @param {Array<Object>} steps - Solve step definitions
 * @param {Object} initialVars - Initial variable values
 * @param {Object} options - Execution options (validatePlan, softFail)
 * @returns {SolveContext} Context with results
 */
function solveProblem(steps, initialVars, options = {}) {
    const context = new SolveContext(initialVars);
    const solver = new MultiStepSolver(formulas);
    solver.solve(steps, context, options);
    return context;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MultiStepSolver, SolveStep, CommonSolvePlans };
}

