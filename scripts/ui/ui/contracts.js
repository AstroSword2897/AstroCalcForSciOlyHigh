/**
 * CONTRACTS - Non-negotiable assumptions for the modular system
 * Any violation of these contracts is a priority-0 bug
 */

// Calculator Contract
export const CALCULATOR_CONTRACT = {
    // Required methods
    requiredMethods: [
        'solve',           // Solve for numeric result
        'solveSymbolically' // Solve for symbolic expression
    ],
    
    // Input format for solve()
    solveInput: {
        variables: 'Object mapping variable names to numbers or null',
        options: 'Optional configuration object'
    },
    
    // Output format for both methods
    output: {
        result: 'number | string | null',
        unit: 'string (optional)',
        isSymbolic: 'boolean',
        solvedFor: 'string (which variable was solved for)',
        error: 'string (if failed)'
    }
};

// Graph Contract
export const GRAPH_CONTRACT = {
    requiredMethods: [
        'init',    // Initialize graph
        'update'   // Update graph with new data
    ],
    
    initInput: {
        container: 'DOM element or ID',
        options: 'Graph configuration'
    },
    
    updateInput: {
        formula: 'Formula object',
        values: 'Variable values object',
        options: 'Update options'
    }
};

// Formula Contract
export const FORMULA_CONTRACT = {
    requiredProperties: [
        'id',         // Unique identifier
        'name',       // Human-readable name
        'equation',   // Mathematical equation
        'variables'   // Array of variable definitions
    ],
    
    variableProperties: [
        'symbol',     // Variable symbol (e.g., 'T', 'L')
        'name',       // Human-readable name
        'unit',       // Unit string
        'description' // Description of the variable
    ],
    
    optionalProperties: [
        'description', // Formula description
        'constants',   // Constant values
        'concepts',    // Related concepts for search
        'keywords',    // Keywords for search
        'category',     // Category for organization
        'presets',      // Preset values
        'relationships' // Related formulas
    ]
};

// Event Contract
export const EVENT_CONTRACT = {
    requiredEvents: [
        'formulaSelected',  // User selected a formula
        'calculate',        // User clicked calculate
        'tabSwitch'        // User switched tabs
    ],
    
    eventData: {
        formulaSelected: 'Formula object',
        calculate: 'null (no data needed)',
        tabSwitch: 'Tab name string'
    }
};

/**
 * Contract validation utilities
 */
export function validateCalculator(calculator) {
    const missing = CALCULATOR_CONTRACT.requiredMethods.filter(method => 
        typeof calculator[method] !== 'function'
    );
    
    if (missing.length > 0) {
        throw new Error(`Calculator contract violated: missing methods [${missing.join(', ')}]`);
    }
    
    return true;
}

export function validateGraph(graph) {
    const missing = GRAPH_CONTRACT.requiredMethods.filter(method => 
        typeof graph[method] !== 'function'
    );
    
    if (missing.length > 0) {
        throw new Error(`Graph contract violated: missing methods [${missing.join(', ')}]`);
    }
    
    return true;
}

export function validateFormula(formula) {
    const missing = CALCULATOR_CONTRACT.requiredProperties.filter(prop => 
        !(prop in formula)
    );
    
    if (missing.length > 0) {
        throw new Error(`Formula contract violated: missing properties [${missing.join(', ')}]`);
    }
    
    // Validate variables
    if (!Array.isArray(formula.variables)) {
        throw new Error('Formula contract violated: variables must be an array');
    }
    
    formula.variables.forEach((variable, index) => {
        const missingVar = FORMULA_CONTRACT.variableProperties.filter(prop => 
            !(prop in variable)
        );
        
        if (missingVar.length > 0) {
            throw new Error(`Formula contract violated: variable ${index} missing properties [${missingVar.join(', ')}]`);
        }
    });
    
    return true;
}
