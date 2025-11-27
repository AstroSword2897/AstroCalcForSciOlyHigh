/**
 * User Interface Controller - IMPROVED VERSION
 * 
 * Main UI controller for the AstroCalc application. Handles:
 * - Formula search and filtering with advanced matching algorithms
 * - Formula card rendering with confidence scores
 * - Tab navigation (Formulas, Explorer, Classification, Desmos)
 * - Calculator interface and result display
 * - Graph visualization integration
 * - FRQ (Free Response Question) support system integration
 * - Search results display with Explorer-style two-panel layout
 * 
 * OFFLINE OPTIMIZATIONS:
 * - No external API calls
 * - Efficient caching strategies
 * - Memory leak prevention
 * - Optimized DOM operations
 * - Performance monitoring
 * 
 * Key Features:
 * - Multi-layer search scoring (name, description, concepts, patterns, semantic)
 * - Concept hierarchy expansion for remote matching
 * - Dynamic confidence scoring with visual indicators
 * - Usage instructions and contextual hints generation
 * - Graph interpretation guides
 * - Responsive design with mobile support
 */

// ============================================================================
// GLOBAL STATE & CONFIGURATION
// ============================================================================

// Timing constants
const TIMING = {
    DEBOUNCE_SEARCH: 200,
    DEBOUNCE_INDICATORS: 400,
    MATHJAX_RENDER: 150,
    VISIBILITY_RETRY_SHORT: 100,
    VISIBILITY_RETRY_LONG: 500,
    AUTO_FOCUS_DELAY: 150,
    INIT_RETRY_DELAY: 100
};

// Global state variables
let currentFormula = null; // Currently selected formula for calculator
let calculator = null;
let graphManager = null; // Graph manager (uses OfflineGraphManager for offline operation)

// Event listener registry for cleanup
const eventListenerRegistry = new Map();

/**
 * Add tracked event listener for proper cleanup
 */
function addTrackedListener(element, event, handler) {
    if (!element) return;
    element.addEventListener(event, handler);
    if (!eventListenerRegistry.has(element)) {
        eventListenerRegistry.set(element, []);
    }
    eventListenerRegistry.get(element).push({ event, handler });
}

/**
 * Remove all tracked event listeners for an element
 */
function removeTrackedListeners(element) {
    if (!eventListenerRegistry.has(element)) return;
    const listeners = eventListenerRegistry.get(element);
    listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListenerRegistry.delete(element);
}

/**
 * Cleanup all tracked event listeners
 */
function cleanupAllListeners() {
    eventListenerRegistry.forEach((listeners, element) => {
        listeners.forEach(({ event, handler }) => {
            element.removeEventListener(event, handler);
        });
    });
    eventListenerRegistry.clear();
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

// Performance monitoring (renamed to avoid conflict with window.performance)
const performanceMonitor = {
    searchTimes: [],
    renderTimes: [],
    lastSearchTime: 0,
    
    recordSearch(time) {
        this.searchTimes.push(time);
        this.lastSearchTime = time;
        if (this.searchTimes.length > 50) this.searchTimes.shift();
    },
    
    recordRender(time) {
        this.renderTimes.push(time);
        if (this.renderTimes.length > 50) this.renderTimes.shift();
    },
    
    getAverageSearchTime() {
        if (this.searchTimes.length === 0) return 0;
        return this.searchTimes.reduce((a, b) => a + b, 0) / this.searchTimes.length;
    },
    
    getAverageRenderTime() {
        if (this.renderTimes.length === 0) return 0;
        return this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;
    }
};

// ============================================================================
// CACHING SYSTEMS
// ============================================================================

// NOTE: LRUCache is defined in utils.js - don't redeclare it here
// Search cache with LRU eviction
const searchCache = typeof SimpleCache !== 'undefined' 
    ? new SimpleCache(100) // Use SimpleCache if available
    : new LRUCache(100); // Fallback to LRU cache

// LaTeX conversion cache
const latexCache = new Map();

// ============================================================================
// LATEX & MATHJAX RENDERING
// ============================================================================

/**
 * Convert Unicode math symbols to LaTeX for MathJax rendering
 * IMPROVED: Better error handling and caching
 * 
 * Handles conversion of Unicode mathematical symbols (π, σ, λ, subscripts, superscripts, etc.)
 * to LaTeX format for proper rendering in MathJax. Supports:
 * - Greek letters (π, σ, λ, θ, Δ, α, β, etc.)
 * - Subscripts (M₁, M₂, P_rot, λ_max, etc.)
 * - Superscripts (x², x³, etc.)
 * - Special operators (×, ÷, √, ∛, etc.)
 * - Variable names with subscripts (P_rot, B_λ, M_sun, etc.)
 * 
 * @param {string} text - Input text containing Unicode math symbols
 * @returns {string} LaTeX-formatted string ready for MathJax rendering
 * 
 * @example
 * convertToLaTeX("L = 4πR²σT⁴") // Returns "L = 4\\pi R^{2}\\sigma T^{4}"
 * convertToLaTeX("M₁ + M₂") // Returns "M_{1} + M_{2}"
 * convertToLaTeX("λ_max = b/T") // Returns "\\lambda_{\\max} = b/T"
 */
function convertToLaTeX(text) {
    if (!text) return '';
    
    // Check cache first
    if (latexCache.has(text)) {
        return latexCache.get(text);
    }
    
    let result;
    try {
        // Step 1: Handle numeric subscripts/superscripts in plain text (like M1, M2, P2, a3)
    // This handles cases where formulas use M1 instead of M₁
    // Match pattern: letter followed by number (but not if it's part of a larger number or variable name)
    text = text.replace(/([A-Za-z])(\d+)(?![a-zA-Z0-9_])/g, function(match, base, num) {
        // If it's a single digit, it's likely a subscript (M1 -> M_1)
        // If it's multiple digits or in certain contexts, it might be a superscript
        // For now, treat single digits as subscripts, multiple as potential superscripts
        if (num.length === 1) {
            return `${base}_${num}`;
        }
        // For multiple digits, check context - if followed by operations, might be superscript
        return match; // Keep as is, will be handled by other rules
    });
    
    // Step 2: Handle special variable names with Greek letters (do this first before general Greek replacement)
    // λmax -> λ_{max} (will be converted to \lambda_{\max} later)
    text = text.replace(/λmax/g, 'λ_{max}');
    text = text.replace(/λ_obs/g, 'λ_{obs}');
    text = text.replace(/λ_rest/g, 'λ_{rest}');
    
    // Step 3: Handle subscripts that are words (like P_rot, B_λ, M_sun, F_B, F_V)
    // Match pattern: letter_letters (e.g., P_rot, B_λ, M_sun, F_B, F_V)
    text = text.replace(/([A-Za-z])_([A-Za-z]+)/g, function(match, base, sub) {
        // If subscript is a single uppercase letter, just use it
        if (sub.length === 1 && sub === sub.toUpperCase()) {
            return `${base}_{${sub}}`;
        }
        // If subscript is a Greek letter symbol name, convert it
        if (sub === 'λ' || sub === 'lambda') return `${base}_{\\lambda}`;
        if (sub === 'σ' || sub === 'sigma') return `${base}_{\\sigma}`;
        if (sub === 'θ' || sub === 'theta') return `${base}_{\\theta}`;
        // Handle special subscript words
        if (sub === 'max') return `${base}_{\\max}`;
        if (sub === 'min') return `${base}_{\\min}`;
        if (sub === 'obs') return `${base}_{\\text{obs}}`;
        if (sub === 'rest') return `${base}_{\\text{rest}}`;
        if (sub === 'rot') return `${base}_{\\text{rot}}`;
        if (sub === 'sun') return `${base}_{\\sun}`;
        if (sub === 'star') return `${base}_{\\text{star}}`;
        if (sub === 'surface') return `${base}_{\\text{surface}}`;
        if (sub === 'eq') return `${base}_{\\text{eq}}`;
        if (sub === 'age') return `${base}_{\\text{age}}`;
        // Otherwise, wrap in text for multi-letter subscripts
        return `${base}_{\\text{${sub}}}`;
    });
    
    // Step 4: Handle numeric subscripts with Greek letters (like M₁, M₂)
    text = text.replace(/([A-Za-z])_([₀₁₂₃₄₅₆₇₈₉])/g, function(match, base, sub) {
        const subMap = {'₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'};
        return `${base}_{${subMap[sub]}}`;
    });
    
    // Step 5: Replace Unicode symbols with LaTeX equivalents
    let latex = text
        // Square root: √(x) -> \sqrt{x}
        .replace(/√\(([^()]+)\)/g, '\\sqrt{$1}')
        .replace(/√\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g, '\\sqrt{$1}')
        .replace(/√([a-zA-Z0-9_]+)/g, '\\sqrt{$1}')
        // Cube root: ∛(x) -> \sqrt[3]{x}
        .replace(/∛\(([^)]+)\)/g, '\\sqrt[3]{$1}')
        .replace(/∛([a-zA-Z0-9_]+)/g, '\\sqrt[3]{$1}')
        // Multiplication: × -> \times (do this before Greek letters to avoid conflicts)
        .replace(/×/g, ' \\times ')
        // Division: ÷ -> \div
        .replace(/÷/g, ' \\div ')
        // Greek letters - handle spacing properly
        // IMPORTANT: Process Greek letters before superscripts to avoid conflicts
        // π followed by letter/number/superscript -> \pi with space
        .replace(/π([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\pi $1')
        .replace(/π/g, '\\pi')
        // σ followed by letter/superscript -> \sigma with space
        .replace(/σ([a-zA-Z²³⁴⁵⁶⁷⁸⁹_^])/g, '\\sigma $1')
        .replace(/σ/g, '\\sigma')
        // λ followed by letter/number/superscript -> \lambda with space (but not if it's λ_{...})
        .replace(/λ_\{/g, '\\lambda_{')  // Handle λ_{max} -> \lambda_{\max}
        .replace(/λ([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\lambda $1')
        .replace(/λ/g, '\\lambda')
        // Other Greek letters - handle spacing
        .replace(/θ([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\theta $1')
        .replace(/θ/g, '\\theta')
        .replace(/Δ([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\Delta $1')
        .replace(/Δ/g, '\\Delta')
        .replace(/α([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\alpha $1')
        .replace(/α/g, '\\alpha')
        .replace(/β([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\beta $1')
        .replace(/β/g, '\\beta')
        .replace(/γ([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\gamma $1')
        .replace(/γ/g, '\\gamma')
        .replace(/δ([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\delta $1')
        .replace(/δ/g, '\\delta')
        .replace(/ε([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\epsilon $1')
        .replace(/ε/g, '\\epsilon')
        .replace(/φ([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\phi $1')
        .replace(/φ/g, '\\phi')
        .replace(/Ω([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\Omega $1')
        .replace(/Ω/g, '\\Omega')
        .replace(/ω([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\omega $1')
        .replace(/ω/g, '\\omega')
        // Superscripts: ² -> ^2, ³ -> ^3, etc. (handle these after Greek letters)
        .replace(/²/g, '^2')
        .replace(/³/g, '^3')
        .replace(/⁴/g, '^4')
        .replace(/⁵/g, '^5')
        .replace(/⁶/g, '^6')
        .replace(/⁷/g, '^7')
        .replace(/⁸/g, '^8')
        .replace(/⁹/g, '^9')
        .replace(/¹/g, '^1')
        .replace(/⁰/g, '^0')
        // Handle numeric subscripts (already handled above, but keep for standalone)
        .replace(/₀/g, '_0')
        .replace(/₁/g, '_1')
        .replace(/₂/g, '_2')
        .replace(/₃/g, '_3')
        .replace(/₄/g, '_4')
        .replace(/₅/g, '_5')
        .replace(/₆/g, '_6')
        .replace(/₇/g, '_7')
        .replace(/₈/g, '_8')
        .replace(/₉/g, '_9')
        // Log functions: log₁₀ -> \log_{10}
        .replace(/log₁₀/g, '\\log_{10}')
        .replace(/log₁/g, '\\log_{1}')
        .replace(/log/g, '\\log')
        // Infinity
        .replace(/∞/g, '\\infty')
        // Plus/minus
        .replace(/±/g, '\\pm')
        // Approximately equal
        .replace(/≈/g, '\\approx')
        // Not equal
        .replace(/≠/g, '\\neq')
        // Less than or equal
        .replace(/≤/g, '\\leq')
        // Greater than or equal
        .replace(/≥/g, '\\geq')
        // Degrees
        .replace(/°/g, '^{\\circ}')
        // Proportional to
        .replace(/∝/g, '\\propto')
        // Handle decimal exponents: M^3.5 -> M^{3.5}
        .replace(/\^(\d+\.\d+)/g, '^{$1}')
        // Handle exponents after variables: T^4 -> T^{4} (if not already braced)
        .replace(/([a-zA-Z])\^(\d+)(?![^{])/g, '$1^{$2}')
        // Handle complex exponents: e^(...) -> e^{...}
        .replace(/e\^\(([^)]+)\)/g, 'e^{$1}')
        // Handle 10^(...) -> 10^{...}
        .replace(/10\^\(([^)]+)\)/g, '10^{$1}')
        // Handle fractions in parentheses: (a/b) -> \left(\frac{a}{b}\right)
        .replace(/\(([^()]+)\/([^()]+)\)/g, function(match, num, den) {
            // Don't convert if already has LaTeX commands
            if (num.includes('\\') || den.includes('\\')) return match;
            return `\\left(\\frac{${num}}{${den}}\\right)`;
        })
        // Handle simple fractions: a/b -> \frac{a}{b} (but not if in complex expression)
        .replace(/([a-zA-Z0-9_^]+)\/([a-zA-Z0-9_^]+)/g, function(match, num, den, offset, string) {
            // Skip if already in LaTeX command
            if (num.includes('\\') || den.includes('\\')) return match;
            // Skip if part of a larger fraction structure
            const before = string.substring(0, offset);
            const after = string.substring(offset + match.length);
            if (before.match(/\\frac|\\sqrt|\\log|\\times|\\div|\\left|\\right/) || 
                after.match(/\\frac|\\sqrt|\\log|\\times|\\div|\\left|\\right/)) {
                return match;
            }
            // Skip if in parentheses (handled above)
            if (before.includes('(') && after.includes(')')) return match;
            return `\\frac{${num}}{${den}}`;
        })
        // Fix spacing around operators
        .replace(/\s*=\s*/g, ' = ')
        .replace(/\s*\+\s*/g, ' + ')
        .replace(/\s*-\s*/g, ' - ')
        // Convert common subscript words to LaTeX commands
        .replace(/_\{max\}/g, '_{\\max}')
        .replace(/_\{min\}/g, '_{\\min}')
        .replace(/_\{sun\}/g, '_{\\sun}')
        // Handle spacing between Greek letters and variables (ensure proper spacing)
        // Fix cases where we have \pi R, \sigma T, \lambda k, etc.
        // Remove extra spaces but keep single space for readability
        .replace(/\\pi\s+([A-Z])/g, '\\pi $1')  // \pi R -> \pi R
        .replace(/\\sigma\s+([A-Z])/g, '\\sigma $1')  // \sigma T -> \sigma T
        .replace(/\\lambda\s+([a-z])/g, '\\lambda $1')  // \lambda k -> \lambda k
        // Clean up multiple spaces but preserve single spaces
        .replace(/\s{2,}/g, ' ')
        .trim();
        
        // Wrap in math delimiters if not already wrapped
        if (!latex.startsWith('$') && !latex.startsWith('\\(')) {
            result = `\\(${latex}\\)`;
        } else {
            result = latex;
        }
        
        // Cache result
        latexCache.set(text, result);
        
        return result;
    } catch (error) {
        console.warn('LaTeX conversion error:', error, text);
        // Return original text on error, but don't cache errors
        return text;
    }
}

// PERFORMANCE FIX: Debounce MathJax rendering to prevent excessive calls
let mathJaxRenderTimeout = null;
// Track MathJax renders by formula ID to prevent race conditions
const mathJaxRenderQueue = new Map(); // formulaId -> Set of elements

function renderMathJax(element, formulaId = null) {
    if (!element) return;
    
    // Use current formula ID if not provided
    const activeFormulaId = formulaId || (currentFormula ? currentFormula.id : 'default');
    
    // Initialize queue for this formula if needed
    if (!mathJaxRenderQueue.has(activeFormulaId)) {
        mathJaxRenderQueue.set(activeFormulaId, new Set());
    }
    mathJaxRenderQueue.get(activeFormulaId).add(element);
    
    // Clear old formula renders to prevent race conditions
    if (currentFormula && activeFormulaId !== currentFormula.id) {
        mathJaxRenderQueue.delete(currentFormula.id);
    }
    
    // Clear existing timeout
    if (mathJaxRenderTimeout) {
        clearTimeout(mathJaxRenderTimeout);
    }
    
    // Debounce MathJax rendering
    mathJaxRenderTimeout = setTimeout(() => {
        // Only render elements for the current formula to prevent stale renders
        const activeId = currentFormula ? currentFormula.id : 'default';
        const elementsToRender = mathJaxRenderQueue.has(activeId) 
            ? Array.from(mathJaxRenderQueue.get(activeId))
            : [];
        
        // Clear all queues
        mathJaxRenderQueue.clear();
        
        if (elementsToRender.length === 0) return;
        
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise(elementsToRender).catch(function (err) {
                console.warn('MathJax rendering error:', err);
            });
        } else {
            // Wait for MathJax to load
            if (typeof MathJax === 'undefined') {
                let attempts = 0;
                const maxAttempts = 20;
                const checkMathJax = setInterval(() => {
                    attempts++;
                    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                        MathJax.typesetPromise(elementsToRender).catch(function (err) {
                            console.warn('MathJax rendering error:', err);
                        });
                        clearInterval(checkMathJax);
                    } else if (attempts >= maxAttempts) {
                        console.warn('MathJax failed to load');
                        clearInterval(checkMathJax);
                    }
                }, 100);
            }
        }
    }, TIMING.MATHJAX_RENDER);
}

// Initialize the application
function initializeApp() {
    console.log('🚀 Initializing app...');
    console.log('Formulas defined:', typeof formulas !== 'undefined');
    console.log('Formulas count:', typeof formulas !== 'undefined' ? formulas.length : 0);
    console.log('Document readyState:', document.readyState);
    
    // Initialize semantic search system
    if (typeof semanticSearchSystem !== 'undefined') {
        semanticSearchSystem.initializeEmbeddings();
    }
    
    // Wait for formulas with retry logic
    function tryRenderFormulas(retries = 10) {
        if (typeof formulas !== 'undefined' && Array.isArray(formulas) && formulas.length > 0) {
            console.log(`✅ Rendering ${formulas.length} formulas...`);
            
            // CRITICAL: Ensure DOM is ready before rendering
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    renderFormulaList();
                    setupEventListeners();
                    setupSearchFunctionality();
                });
            } else {
                // DOM is ready, render immediately
                renderFormulaList();
                setupEventListeners();
                setupSearchFunctionality();
            }
        } else if (retries > 0) {
            console.log(`⏳ Formulas not ready, retrying... (${retries} attempts left)`);
            setTimeout(() => tryRenderFormulas(retries - 1), 200);
        } else {
            console.error('❌ Formulas failed to load after all retries');
            const formulaList = document.getElementById('formula-list');
            if (formulaList) {
                formulaList.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 40px;">Error: Formulas failed to load. Please refresh the page.</p>';
            }
        }
    }
    
    tryRenderFormulas();
}

// Handle both cases: DOM already loaded or still loading
// Use multiple strategies to ensure initialization happens across all browsers
function ensureInitialization() {
    console.log('🔧 Setting up initialization strategies...');
    console.log('Current readyState:', document.readyState);
    
    let hasRendered = false;
    
    function attemptRender() {
        if (hasRendered) return;
        const formulaList = document.getElementById('formula-list');
        if (formulaList && formulaList.querySelectorAll('.formula-card').length > 0) {
            hasRendered = true;
            return;
        }
        if (typeof formulas !== 'undefined' && Array.isArray(formulas) && formulas.length > 0) {
            if (typeof renderFormulaList === 'function') {
                console.log('🔄 Attempting render...');
                renderFormulaList();
                hasRendered = true;
            }
        }
    }
    
    // Strategy 1: DOMContentLoaded event
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📄 DOMContentLoaded fired');
            initializeApp();
            setTimeout(attemptRender, 100);
        });
    } else {
        // DOM already loaded, initialize immediately
        console.log('⚡ DOM already loaded, initializing immediately');
        initializeApp();
        setTimeout(attemptRender, 100);
    }
    
    // Strategy 2: Window load event (for browsers that need it)
    window.addEventListener('load', () => {
        console.log('🌐 Window load event fired');
        setTimeout(attemptRender, 200);
    });
    
    // Strategy 3: Fallback after delay (catches edge cases)
    setTimeout(() => {
        console.log('⏰ Fallback timeout triggered');
        attemptRender();
    }, 1500);
    
    // Strategy 4: Force render on next tick (for Safari/WebKit)
    if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => {
            setTimeout(() => {
                console.log('🎬 requestAnimationFrame triggered');
                attemptRender();
            }, 200);
        });
    }
    
    // Strategy 5: Immediate check (for fast browsers)
    setTimeout(attemptRender, 50);
}

// Start initialization
ensureInitialization();

// Add diagnostic function to window for debugging (define early so it's always available)
(function() {
    'use strict';
    
    // Define diagnostic function immediately
    window.astrocalcDiagnostics = function() {
        console.log('=== AstroCalc Diagnostics ===');
        console.log('1. Formulas:', {
            defined: typeof formulas !== 'undefined',
            count: typeof formulas !== 'undefined' ? formulas.length : 0,
            isArray: typeof formulas !== 'undefined' ? Array.isArray(formulas) : false
        });
        
        console.log('2. DOM Elements:', {
            formulaList: !!document.getElementById('formula-list'),
            formulaSelection: !!document.getElementById('formula-selection'),
            mainFormulasTab: !!document.getElementById('main-formulas-tab')
        });
        
        const formulaList = document.getElementById('formula-list');
        if (formulaList) {
            const style = window.getComputedStyle(formulaList);
            console.log('3. formula-list Styles:', {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                height: style.height,
                children: formulaList.children.length,
                cards: formulaList.querySelectorAll('.formula-card').length,
                innerHTML_length: formulaList.innerHTML.length
            });
        } else {
            console.error('❌ formula-list element NOT FOUND in DOM!');
        }
        
        const formulaSelection = document.getElementById('formula-selection');
        if (formulaSelection) {
            const style = window.getComputedStyle(formulaSelection);
            console.log('4. formula-selection Styles:', {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                hasActive: formulaSelection.classList.contains('active'),
                classList: Array.from(formulaSelection.classList)
            });
        } else {
            console.error('❌ formula-selection element NOT FOUND in DOM!');
        }
        
        const mainFormulasTab = document.getElementById('main-formulas-tab');
        if (mainFormulasTab) {
            const style = window.getComputedStyle(mainFormulasTab);
            console.log('5. main-formulas-tab Styles:', {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                hasActive: mainFormulasTab.classList.contains('active'),
                classList: Array.from(mainFormulasTab.classList)
            });
        } else {
            console.error('❌ main-formulas-tab element NOT FOUND in DOM!');
        }
        
        console.log('6. Functions:', {
            renderFormulaList: typeof renderFormulaList === 'function',
            initializeApp: typeof initializeApp === 'function',
            createFormulaCard: typeof createFormulaCard === 'function'
        });
        
        console.log('7. Service Worker:', {
            supported: 'serviceWorker' in navigator,
            registrations: 'serviceWorker' in navigator ? 'Check in DevTools' : 'N/A'
        });
        
        console.log('8. Script Loading:', {
            ui_js_loaded: typeof renderFormulaList !== 'undefined',
            formulas_js_loaded: typeof formulas !== 'undefined',
            document_ready: document.readyState
        });
        
        // Try to auto-fix common issues
        console.log('\n🔧 Attempting Auto-Fix...');
        let fixed = false;
        
        if (formulaList && typeof formulas !== 'undefined' && formulas.length > 0) {
            const cards = formulaList.querySelectorAll('.formula-card');
            if (cards.length === 0 && typeof renderFormulaList === 'function') {
                console.log('⚠️ No cards found but formulas exist. Attempting render...');
                try {
                    renderFormulaList();
                    fixed = true;
                } catch (e) {
                    console.error('❌ Render failed:', e);
                }
            }
        }
        
        // Force visibility
        if (formulaList) {
            const style = window.getComputedStyle(formulaList);
            if (style.display === 'none' || style.visibility === 'hidden') {
                console.log('⚠️ formula-list is hidden. Forcing visibility...');
                formulaList.style.setProperty('display', 'block', 'important');
                formulaList.style.setProperty('visibility', 'visible', 'important');
                formulaList.style.setProperty('opacity', '1', 'important');
                fixed = true;
            }
        }
        
        if (formulaSelection && !formulaSelection.classList.contains('active')) {
            console.log('⚠️ formula-selection not active. Activating...');
            formulaSelection.classList.add('active');
            formulaSelection.style.setProperty('display', 'block', 'important');
            fixed = true;
        }
        
        if (mainFormulasTab && !mainFormulasTab.classList.contains('active')) {
            console.log('⚠️ main-formulas-tab not active. Activating...');
            mainFormulasTab.classList.add('active');
            mainFormulasTab.style.setProperty('display', 'block', 'important');
            fixed = true;
        }
        
        if (fixed) {
            console.log('✅ Auto-fix applied! Check if cards appear now.');
        }
        
        console.log('=== End Diagnostics ===');
        console.log('💡 Run astrocalcDiagnostics() anytime to check status');
        console.log('💡 Run renderFormulaList() to manually render cards');
        console.log('💡 Run window.forceRenderCards() to force render with visibility fixes');
    };
    
    // Add force render function
    window.forceRenderCards = function() {
        console.log('🔧 Force rendering cards...');
        if (typeof formulas === 'undefined' || !formulas || formulas.length === 0) {
            console.error('❌ Formulas not loaded!');
            return false;
        }
        
        if (typeof renderFormulaList !== 'function') {
            console.error('❌ renderFormulaList function not available!');
            return false;
        }
        
        // Force all containers visible first
        const formulaSelection = document.getElementById('formula-selection');
        if (formulaSelection) {
            formulaSelection.classList.add('active');
            formulaSelection.style.setProperty('display', 'block', 'important');
            formulaSelection.style.setProperty('visibility', 'visible', 'important');
        }
        
        const mainFormulasTab = document.getElementById('main-formulas-tab');
        if (mainFormulasTab) {
            mainFormulasTab.classList.add('active');
            mainFormulasTab.style.setProperty('display', 'block', 'important');
            mainFormulasTab.style.setProperty('visibility', 'visible', 'important');
        }
        
        // Render
        renderFormulaList();
        
        // Force visibility after render
        setTimeout(() => {
            const formulaList = document.getElementById('formula-list');
            if (formulaList) {
                formulaList.style.setProperty('display', 'block', 'important');
                formulaList.style.setProperty('visibility', 'visible', 'important');
                formulaList.style.setProperty('opacity', '1', 'important');
                
                const cards = formulaList.querySelectorAll('.formula-card');
                cards.forEach(card => {
                    card.style.setProperty('display', 'block', 'important');
                    card.style.setProperty('visibility', 'visible', 'important');
                    card.style.setProperty('opacity', '1', 'important');
                });
                
                console.log(`✅ Force render complete. ${cards.length} cards should be visible.`);
            }
        }, 100);
        
        return true;
    };
    
    // Make sure it's available immediately
    console.log('✅ Diagnostic functions loaded: astrocalcDiagnostics(), forceRenderCards()');
})();

// Add event delegation for formula cards - FIXED: Handle all clicks properly
// This is set up in setupEventListeners, but we also set it up here for immediate availability
function setupFormulaCardEventDelegation() {
    const formulaList = document.getElementById('formula-list');
    if (formulaList) {
        // Remove any existing listeners to prevent duplicates
        const newFormulaList = formulaList.cloneNode(true);
        formulaList.parentNode.replaceChild(newFormulaList, formulaList);
        
        // Add fresh event listener
        const freshFormulaList = document.getElementById('formula-list');
        if (freshFormulaList) {
            freshFormulaList.addEventListener('click', (e) => {
                // Check if click is on a formula card or any element inside it
                const card = e.target.closest('.formula-card');
                if (card) {
                    const formulaId = card.getAttribute('data-formula-id');
                    if (formulaId && typeof formulas !== 'undefined') {
                        const formula = formulas.find(f => f.id === formulaId);
                        if (formula && typeof selectFormula === 'function') {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Card clicked via delegation:', formula.name);
                            selectFormula(formula);
                            return false;
                        }
                    }
                }
            
            // Also handle search result items
            const searchResult = e.target.closest('.search-result-item');
            if (searchResult) {
                const formulaId = searchResult.getAttribute('data-formula-id');
                if (formulaId && typeof window.selectSearchResultFormula === 'function') {
                    e.preventDefault();
                    e.stopPropagation();
                    window.selectSearchResultFormula(formulaId);
                    return false;
                }
            }
            
            // Handle "Use This Formula" button clicks
            const useBtn = e.target.closest('.use-formula-btn');
            if (useBtn) {
                const formulaId = useBtn.getAttribute('data-formula-id');
                if (formulaId) {
                    const data = window.searchResultsData;
                    if (data && data.scoredFormulas) {
                        const formulaData = data.scoredFormulas.find(f => f.formula && f.formula.id === formulaId);
                        if (formulaData && formulaData.formula) {
                            e.preventDefault();
                            e.stopPropagation();
                            selectFormula(formulaData.formula);
                            return false;
                        }
                    }
                }
            }
            
            // Handle search suggestion clicks
            const suggestion = e.target.closest('.search-suggestion-item');
            if (suggestion) {
                const suggestionText = suggestion.getAttribute('data-suggestion');
                if (suggestionText) {
                    const searchInput = document.getElementById('formula-search');
                    if (searchInput) {
                        e.preventDefault();
                        e.stopPropagation();
                        searchInput.value = suggestionText;
                        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                        return false;
                    }
                }
            }
        });
        
        // Also handle Enter key on formula cards
        formulaList.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const card = e.target.closest('.formula-card');
                if (card) {
                    const formulaId = card.getAttribute('data-formula-id');
                    if (formulaId) {
                        const formula = formulas.find(f => f.id === formulaId);
                        if (formula) {
                            e.preventDefault();
                            e.stopPropagation();
                            selectFormula(formula);
                            return false;
                        }
                    }
                }
            }
        });
    }
}

// Set up event delegation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFormulaCardEventDelegation);
} else {
    setupFormulaCardEventDelegation();
}

// Contextual Semantic Matching & Dynamic Term Prioritization System
var semanticSearchSystem = {
    // Usage frequency tracking
    usageFrequency: {},
    
    // Synonym expansion dictionary
    synonymDictionary: {
        'cosmic inflation boundary': ['particle horizon', 'cosmic horizon', 'observable universe', 'event horizon'],
        'particle horizon': ['cosmic horizon', 'observable universe', 'cosmic inflation boundary', 'horizon distance'],
        'cosmic horizon': ['particle horizon', 'observable universe', 'event horizon', 'cosmic inflation boundary'],
        'observable universe': ['particle horizon', 'cosmic horizon', 'causal horizon'],
        'event horizon': ['black hole horizon', 'schwarzschild radius', 'cosmic horizon'],
        'black hole horizon': ['event horizon', 'schwarzschild radius'],
        'stellar brightness': ['luminosity', 'magnitude', 'flux', 'brightness'],
        'star brightness': ['luminosity', 'magnitude', 'stellar brightness', 'flux'],
        'orbital speed': ['orbital velocity', 'circular velocity', 'orbital motion'],
        'circular velocity': ['orbital velocity', 'orbital speed'],
        'escape speed': ['escape velocity', 'breakaway velocity'],
        'gravitational acceleration': ['surface gravity', 'gravity', 'g'],
        'surface g': ['surface gravity', 'gravitational acceleration'],
        'distance measurement': ['parallax', 'distance modulus', 'luminosity distance'],
        'stellar distance': ['parallax distance', 'distance modulus', 'stellar parallax'],
        'cosmic expansion': ['hubble law', 'hubble constant', 'redshift', 'cosmic redshift'],
        'universe expansion': ['hubble law', 'cosmic expansion', 'big bang'],
        'stellar temperature': ['effective temperature', 'surface temperature', 'color temperature'],
        'star temperature': ['effective temperature', 'stellar temperature', 'surface temperature'],
        'orbital time': ['orbital period', 'revolution period', 'period'],
        'revolution time': ['orbital period', 'orbital time', 'period'],
        'telescope resolution': ['angular resolution', 'resolving power', 'diffraction limit'],
        'resolving power': ['angular resolution', 'telescope resolution', 'rayleigh criterion'],
        'light collection': ['light gathering power', 'aperture', 'telescope aperture'],
        'telescope aperture': ['light gathering power', 'light collection', 'aperture'],
        'doppler effect': ['doppler shift', 'redshift', 'radial velocity'],
        'redshift effect': ['doppler shift', 'cosmic redshift', 'redshift'],
        'stellar mass': ['mass', 'solar mass', 'planetary mass'],
        'planetary mass': ['mass', 'stellar mass', 'jupiter mass'],
        'orbital mechanics': ['kepler', 'kepler third law', 'orbital motion', 'celestial mechanics'],
        'celestial mechanics': ['orbital mechanics', 'kepler', 'planetary motion'],
        'blackbody spectrum': ['blackbody radiation', 'thermal radiation', 'stefan-boltzmann'],
        'thermal radiation': ['blackbody radiation', 'blackbody spectrum', 'stefan-boltzmann'],
        'stellar evolution': ['star evolution', 'stellar life cycle', 'main sequence'],
        'star evolution': ['stellar evolution', 'stellar life cycle'],
        'binary star system': ['binary', 'binary star', 'double star'],
        'double star': ['binary', 'binary star system', 'binary star'],
        'exoplanet detection': ['transit method', 'radial velocity method', 'exoplanet'],
        'planet detection': ['exoplanet detection', 'transit method', 'radial velocity method'],
        'stellar classification': ['spectral type', 'hr diagram', 'mk classification', 'luminosity class'],
        'spectral type': ['stellar classification', 'mk type', 'spectral classification'],
        'hr diagram': ['hertzsprung russell', 'color magnitude diagram', 'hr', 'stellar classification'],
        'color magnitude diagram': ['hr diagram', 'cm diagram', 'color magnitude'],
        'mass luminosity': ['mass luminosity relation', 'stellar mass luminosity', 'luminosity mass'],
        'stellar mass luminosity': ['mass luminosity relation', 'mass luminosity'],
        'distance ladder': ['cosmic distance ladder', 'distance scale', 'standard candle', 'standard ruler'],
        'cosmic distance ladder': ['distance ladder', 'distance scale', 'standard candle'],
        'standard candle': ['distance ladder', 'calibrated candle', 'distance indicator'],
        'standard ruler': ['distance ladder', 'geometric distance', 'distance indicator'],
        'parallax distance': ['trigonometric parallax', 'stellar parallax', 'parallax', 'geometric parallax'],
        'trigonometric parallax': ['parallax distance', 'parallax', 'geometric parallax'],
        'stellar parallax': ['parallax distance', 'trigonometric parallax', 'parallax'],
        'magnitude brightness': ['magnitude', 'apparent magnitude', 'absolute magnitude', 'brightness'],
        'stellar brightness': ['magnitude', 'luminosity', 'brightness', 'flux'],
        'flux brightness': ['flux', 'brightness', 'luminosity', 'magnitude'],
        'blackbody temperature': ['effective temperature', 'color temperature', 'brightness temperature'],
        'color temperature': ['blackbody temperature', 'effective temperature', 'brightness temperature'],
        'brightness temperature': ['color temperature', 'blackbody temperature', 'radio temperature'],
        'orbital motion': ['orbital mechanics', 'celestial mechanics', 'kepler', 'orbital dynamics'],
        'celestial mechanics': ['orbital mechanics', 'orbital motion', 'kepler'],
        'orbital dynamics': ['orbital mechanics', 'orbital motion', 'celestial mechanics'],
        'gravitational field': ['gravity', 'gravitational force', 'surface gravity', 'gravitational acceleration'],
        'gravitational force': ['gravity', 'gravitational field', 'surface gravity'],
        'tidal effects': ['tidal force', 'tidal locking', 'roche limit', 'hill radius'],
        'tidal locking': ['tidal effects', 'synchronous rotation', 'tidal synchronization'],
        'synchronous rotation': ['tidal locking', 'tidal synchronization'],
        'stellar radius': ['radius', 'stellar size', 'photospheric radius', 'star radius'],
        'star radius': ['stellar radius', 'radius', 'photospheric radius'],
        'photospheric radius': ['stellar radius', 'star radius', 'radius'],
        'stellar mass': ['mass', 'solar mass', 'stellar mass', 'star mass'],
        'star mass': ['stellar mass', 'mass', 'solar mass'],
        'planetary mass': ['mass', 'jupiter mass', 'earth mass', 'planet mass'],
        'planet mass': ['planetary mass', 'mass', 'jupiter mass'],
        'orbital separation': ['semi-major axis', 'orbital distance', 'orbital radius', 'a'],
        'orbital distance': ['semi-major axis', 'orbital separation', 'orbital radius'],
        'orbital radius': ['semi-major axis', 'orbital separation', 'orbital distance'],
        'revolution period': ['orbital period', 'period', 'orbital time', 'revolution time'],
        'orbital time': ['orbital period', 'revolution period', 'period'],
        'rotational period': ['rotation period', 'spin period', 'rotational time'],
        'rotation period': ['rotational period', 'spin period'],
        'spin period': ['rotational period', 'rotation period'],
        'angular resolution': ['resolving power', 'telescope resolution', 'diffraction limit', 'rayleigh criterion'],
        'resolving power': ['angular resolution', 'telescope resolution', 'rayleigh criterion'],
        'diffraction limit': ['angular resolution', 'resolving power', 'airy disk'],
        'light gathering': ['light gathering power', 'aperture', 'telescope aperture', 'light collection'],
        'telescope aperture': ['light gathering power', 'aperture', 'light gathering'],
        'aperture': ['light gathering power', 'telescope aperture', 'light gathering'],
        'doppler shift': ['doppler effect', 'redshift', 'radial velocity', 'doppler'],
        'redshift': ['doppler shift', 'cosmic redshift', 'z', 'redshift effect'],
        'cosmic redshift': ['redshift', 'hubble redshift', 'cosmological redshift'],
        'hubble redshift': ['cosmic redshift', 'redshift', 'cosmological redshift'],
        'cosmological redshift': ['cosmic redshift', 'hubble redshift', 'redshift'],
        'hubble expansion': ['hubble law', 'cosmic expansion', 'universe expansion', 'hubble constant'],
        'universe expansion': ['hubble expansion', 'cosmic expansion', 'hubble law'],
        'big bang': ['big bang theory', 'cosmology', 'universe expansion', 'cosmic expansion'],
        'big bang theory': ['big bang', 'cosmology', 'universe expansion'],
        'stellar lifetime': ['stellar age', 'star lifetime', 'main sequence lifetime', 'stellar age'],
        'star lifetime': ['stellar lifetime', 'stellar age', 'main sequence lifetime'],
        'main sequence lifetime': ['stellar lifetime', 'star lifetime', 'stellar age'],
        'white dwarf mass': ['chandrasekhar limit', 'white dwarf', 'compact object mass'],
        'compact object mass': ['white dwarf mass', 'chandrasekhar limit', 'neutron star mass'],
        'neutron star mass': ['compact object mass', 'tov limit', 'neutron star'],
        'black hole mass': ['schwarzschild radius', 'event horizon', 'black hole'],
        'event horizon radius': ['schwarzschild radius', 'event horizon', 'black hole horizon'],
        'black hole horizon': ['event horizon', 'schwarzschild radius', 'event horizon radius'],
        'gravitational lensing': ['einstein radius', 'lensing', 'einstein ring', 'microlensing'],
        'lensing': ['gravitational lensing', 'einstein radius', 'microlensing'],
        'einstein ring': ['einstein radius', 'gravitational lensing', 'lensing'],
        'microlensing': ['gravitational lensing', 'lensing', 'einstein radius'],
        'synchrotron radiation': ['synchrotron', 'synchrotron power', 'synchrotron emission'],
        'synchrotron emission': ['synchrotron radiation', 'synchrotron', 'synchrotron power'],
        'magnetic field energy': ['magnetic energy density', 'magnetic field', 'b field'],
        'magnetic energy density': ['magnetic field energy', 'magnetic field', 'b field'],
        'b field': ['magnetic field', 'magnetic energy density', 'magnetic field energy'],
        'power law': ['power law spectrum', 'spectral index', 'power law distribution'],
        'power law spectrum': ['power law', 'spectral index', 'power law distribution'],
        'spectral index': ['power law', 'power law spectrum', 'alpha'],
        'gamma ray energy': ['gamma ray', 'max gamma', 'gamma', 'high energy'],
        'max gamma': ['gamma ray energy', 'gamma ray', 'gamma', 'maximum gamma'],
        'cooling break': ['cooling break frequency', 'cooling break gamma', 'synchrotron cooling'],
        'cooling break frequency': ['cooling break', 'synchrotron cooling', 'cooling'],
        'synchrotron cooling': ['cooling break', 'cooling break frequency', 'synchrotron cooling timescale'],
        'equivalent width': ['line strength', 'absorption line', 'emission line', 'spectral line'],
        'line strength': ['equivalent width', 'absorption line', 'emission line'],
        'absorption line': ['equivalent width', 'line strength', 'spectral line'],
        'emission line': ['equivalent width', 'line strength', 'spectral line'],
        'spectral line': ['equivalent width', 'absorption line', 'emission line'],
        'radial velocity': ['doppler shift', 'radial velocity method', 'rv', 'doppler'],
        'rv': ['radial velocity', 'doppler shift', 'radial velocity method'],
        'radial velocity method': ['radial velocity', 'rv method', 'doppler method'],
        'transit method': ['transit photometry', 'exoplanet detection', 'transit', 'planet detection'],
        'transit photometry': ['transit method', 'transit', 'exoplanet detection'],
        'transit': ['transit method', 'transit photometry', 'exoplanet detection'],
        'planetary temperature': ['planetary equilibrium temperature', 'planet temperature', 'exoplanet temperature'],
        'planet temperature': ['planetary temperature', 'planetary equilibrium temperature', 'exoplanet temperature'],
        'exoplanet temperature': ['planetary temperature', 'planet temperature', 'planetary equilibrium temperature'],
        'albedo': ['reflectivity', 'planetary albedo', 'surface albedo'],
        'reflectivity': ['albedo', 'planetary albedo', 'surface albedo'],
        'planetary albedo': ['albedo', 'reflectivity', 'surface albedo'],
        'greenhouse effect': ['greenhouse', 'atmospheric greenhouse', 'planetary greenhouse'],
        'greenhouse': ['greenhouse effect', 'atmospheric greenhouse', 'planetary greenhouse'],
        'atmospheric greenhouse': ['greenhouse effect', 'greenhouse', 'planetary greenhouse'],
        'hydrostatic equilibrium': ['hydrostatic balance', 'pressure balance', 'stellar structure'],
        'hydrostatic balance': ['hydrostatic equilibrium', 'pressure balance', 'stellar structure'],
        'pressure balance': ['hydrostatic equilibrium', 'hydrostatic balance', 'stellar structure'],
        'stellar structure': ['hydrostatic equilibrium', 'hydrostatic balance', 'stellar interior'],
        'stellar interior': ['stellar structure', 'hydrostatic equilibrium', 'stellar physics'],
        'critical density': ['density parameter', 'omega', 'cosmic density', 'friedmann'],
        'density parameter': ['critical density', 'omega', 'cosmic density'],
        'omega': ['density parameter', 'critical density', 'cosmic density'],
        'cosmic density': ['critical density', 'density parameter', 'omega'],
        'friedmann equation': ['friedmann', 'cosmology', 'friedmann robertson walker', 'frw'],
        'friedmann': ['friedmann equation', 'cosmology', 'friedmann robertson walker'],
        'friedmann robertson walker': ['friedmann equation', 'friedmann', 'frw', 'cosmology'],
        'frw': ['friedmann robertson walker', 'friedmann equation', 'friedmann'],
        'lookback time': ['cosmic time', 'light travel time', 'cosmic age', 'universe age'],
        'cosmic time': ['lookback time', 'light travel time', 'cosmic age'],
        'light travel time': ['lookback time', 'cosmic time', 'light travel distance'],
        'cosmic age': ['lookback time', 'cosmic time', 'universe age'],
        'universe age': ['cosmic age', 'lookback time', 'cosmic time'],
        'luminosity distance': ['flux distance', 'cosmic distance', 'dl', 'distance'],
        'flux distance': ['luminosity distance', 'cosmic distance', 'distance'],
        'angular diameter distance': ['size distance', 'angular distance', 'da', 'distance'],
        'size distance': ['angular diameter distance', 'angular distance', 'distance'],
        'angular distance': ['angular diameter distance', 'size distance', 'distance'],
        'time dilation': ['relativistic time', 'special relativity', 'general relativity'],
        'relativistic time': ['time dilation', 'special relativity', 'general relativity'],
        'length contraction': ['relativistic length', 'special relativity', 'lorentz contraction'],
        'relativistic length': ['length contraction', 'special relativity', 'lorentz contraction'],
        'lorentz contraction': ['length contraction', 'relativistic length', 'special relativity'],
        'binary system': ['binary', 'binary star', 'double star', 'binary star system'],
        'binary star': ['binary system', 'binary', 'double star'],
        'double star': ['binary system', 'binary star', 'binary'],
        'center of mass': ['barycenter', 'cm', 'center of mass', 'mass center'],
        'barycenter': ['center of mass', 'cm', 'mass center'],
        'mass center': ['center of mass', 'barycenter', 'cm'],
        'orbital energy': ['vis viva', 'total energy', 'mechanical energy', 'orbital mechanics'],
        'vis viva': ['orbital energy', 'total energy', 'mechanical energy'],
        'total energy': ['orbital energy', 'vis viva', 'mechanical energy'],
        'mechanical energy': ['orbital energy', 'vis viva', 'total energy'],
        'angular momentum': ['orbital angular momentum', 'rotational angular momentum', 'l'],
        'orbital angular momentum': ['angular momentum', 'rotational angular momentum', 'l'],
        'rotational angular momentum': ['angular momentum', 'orbital angular momentum', 'l'],
        'tidal force': ['tidal effects', 'tidal acceleration', 'tidal distortion'],
        'tidal acceleration': ['tidal force', 'tidal effects', 'tidal distortion'],
        'tidal distortion': ['tidal force', 'tidal acceleration', 'tidal effects'],
        'roche limit': ['roche lobe', 'tidal disruption', 'tidal radius'],
        'roche lobe': ['roche limit', 'tidal disruption', 'tidal radius'],
        'tidal disruption': ['roche limit', 'roche lobe', 'tidal radius'],
        'tidal radius': ['roche limit', 'roche lobe', 'tidal disruption'],
        'hill radius': ['hill sphere', 'gravitational sphere', 'roche sphere'],
        'hill sphere': ['hill radius', 'gravitational sphere', 'roche sphere'],
        'gravitational sphere': ['hill radius', 'hill sphere', 'roche sphere'],
        'roche sphere': ['hill radius', 'hill sphere', 'gravitational sphere'],
        'synodic period': ['apparent period', 'relative period', 'synodic'],
        'apparent period': ['synodic period', 'relative period', 'synodic'],
        'relative period': ['synodic period', 'apparent period', 'synodic'],
        'jeans mass': ['gravitational collapse', 'collapse mass', 'instability mass'],
        'gravitational collapse': ['jeans mass', 'collapse mass', 'instability mass'],
        'collapse mass': ['jeans mass', 'gravitational collapse', 'instability mass'],
        'instability mass': ['jeans mass', 'gravitational collapse', 'collapse mass'],
        'chandrasekhar limit': ['white dwarf limit', 'wd limit', 'chandrasekhar', 'compact object limit'],
        'white dwarf limit': ['chandrasekhar limit', 'wd limit', 'chandrasekhar'],
        'wd limit': ['chandrasekhar limit', 'white dwarf limit', 'chandrasekhar'],
        'chandrasekhar': ['chandrasekhar limit', 'white dwarf limit', 'wd limit'],
        'compact object limit': ['chandrasekhar limit', 'white dwarf limit', 'tov limit'],
        'tov limit': ['compact object limit', 'neutron star limit', 'tov'],
        'neutron star limit': ['tov limit', 'compact object limit', 'tov'],
        'tov': ['tov limit', 'neutron star limit', 'compact object limit'],
        'white dwarf radius': ['white dwarf mass radius', 'wd radius', 'white dwarf size'],
        'wd radius': ['white dwarf radius', 'white dwarf mass radius', 'white dwarf size'],
        'white dwarf size': ['white dwarf radius', 'wd radius', 'white dwarf mass radius'],
        'binary white dwarf': ['wd binary', 'white dwarf binary', 'double white dwarf'],
        'wd binary': ['binary white dwarf', 'white dwarf binary', 'double white dwarf'],
        'white dwarf binary': ['binary white dwarf', 'wd binary', 'double white dwarf'],
        'double white dwarf': ['binary white dwarf', 'wd binary', 'white dwarf binary'],
        'orbital decay': ['white dwarf orbital decay', 'binary decay', 'orbital shrinking'],
        'binary decay': ['orbital decay', 'white dwarf orbital decay', 'orbital shrinking'],
        'orbital shrinking': ['orbital decay', 'binary decay', 'white dwarf orbital decay'],
        'merger timescale': ['white dwarf merger timescale', 'merger time', 'coalescence time'],
        'merger time': ['merger timescale', 'white dwarf merger timescale', 'coalescence time'],
        'coalescence time': ['merger timescale', 'merger time', 'white dwarf merger timescale'],
        'planck relation': ['photon energy', 'planck', 'e hf', 'e hc lambda'],
        'photon energy': ['planck relation', 'planck', 'e hf', 'e hc lambda'],
        'planck': ['planck relation', 'photon energy', 'e hf'],
        'e hf': ['planck relation', 'photon energy', 'planck'],
        'e hc lambda': ['planck relation', 'photon energy', 'planck'],
        'wien law': ['wien displacement', 'wien', 'peak wavelength', 'temperature wavelength'],
        'wien displacement': ['wien law', 'wien', 'peak wavelength'],
        'wien': ['wien law', 'wien displacement', 'peak wavelength'],
        'peak wavelength': ['wien law', 'wien displacement', 'wien'],
        'temperature wavelength': ['wien law', 'wien displacement', 'peak wavelength'],
        'blackbody radiation': ['stefan boltzmann', 'thermal radiation', 'blackbody', 'blackbody spectrum'],
        'stefan boltzmann': ['blackbody radiation', 'thermal radiation', 'stefan boltzmann law'],
        'stefan boltzmann law': ['stefan boltzmann', 'blackbody radiation', 'thermal radiation'],
        'thermal radiation': ['blackbody radiation', 'stefan boltzmann', 'blackbody'],
        'blackbody': ['blackbody radiation', 'thermal radiation', 'stefan boltzmann'],
        'blackbody spectrum': ['blackbody radiation', 'thermal radiation', 'blackbody'],
        'flux temperature': ['stefan boltzmann', 'blackbody flux', 'thermal flux'],
        'blackbody flux': ['flux temperature', 'stefan boltzmann', 'thermal flux'],
        'thermal flux': ['flux temperature', 'blackbody flux', 'stefan boltzmann'],
        'flux luminosity': ['flux from luminosity', 'luminosity flux', 'inverse square'],
        'luminosity flux': ['flux luminosity', 'flux from luminosity', 'inverse square'],
        'inverse square': ['flux from luminosity', 'flux luminosity', 'inverse square law'],
        'inverse square law': ['inverse square', 'flux from luminosity', 'flux luminosity'],
        'inverse square law brightness': ['inverse square', 'inverse square law', 'flux from luminosity'],
        'magnitude flux': ['magnitude flux relation', 'magnitude brightness', 'flux magnitude'],
        'flux magnitude': ['magnitude flux', 'magnitude flux relation', 'magnitude brightness'],
        'magnitude brightness': ['magnitude flux', 'flux magnitude', 'magnitude flux relation'],
        'hr color index': ['color index', 'b v', 'color magnitude', 'hr diagram'],
        'color index': ['hr color index', 'b v', 'color magnitude'],
        'b v': ['hr color index', 'color index', 'color magnitude'],
        'color magnitude': ['hr color index', 'color index', 'b v'],
        'hr absolute magnitude': ['absolute magnitude', 'hr magnitude', 'stellar absolute magnitude'],
        'hr magnitude': ['hr absolute magnitude', 'absolute magnitude', 'stellar absolute magnitude'],
        'stellar absolute magnitude': ['hr absolute magnitude', 'hr magnitude', 'absolute magnitude'],
        'mass luminosity relation': ['mass luminosity', 'stellar mass luminosity', 'luminosity mass'],
        'stellar mass luminosity': ['mass luminosity relation', 'mass luminosity', 'luminosity mass'],
        'luminosity mass': ['mass luminosity relation', 'mass luminosity', 'stellar mass luminosity'],
        'stellar lifetime': ['stellar age', 'star lifetime', 'main sequence lifetime', 'stellar timescale'],
        'stellar age': ['stellar lifetime', 'star lifetime', 'main sequence lifetime'],
        'stellar timescale': ['stellar lifetime', 'stellar age', 'main sequence lifetime'],
        'synchrotron cooling timescale': ['synchrotron cooling', 'cooling time', 'synchrotron timescale'],
        'cooling time': ['synchrotron cooling timescale', 'synchrotron cooling', 'synchrotron timescale'],
        'synchrotron timescale': ['synchrotron cooling timescale', 'cooling time', 'synchrotron cooling'],
        'tidal locking timescale': ['tidal locking time', 'synchronization time', 'tidal timescale'],
        'tidal locking time': ['tidal locking timescale', 'synchronization time', 'tidal timescale'],
        'synchronization time': ['tidal locking timescale', 'tidal locking time', 'tidal timescale'],
        'tidal timescale': ['tidal locking timescale', 'tidal locking time', 'synchronization time'],
        'angular momentum elliptical': ['elliptical angular momentum', 'orbital angular momentum', 'angular momentum'],
        'elliptical angular momentum': ['angular momentum elliptical', 'orbital angular momentum', 'angular momentum'],
        'orbital angular momentum': ['angular momentum elliptical', 'elliptical angular momentum', 'angular momentum'],
        'cosmic redshift': ['hubble redshift', 'cosmological redshift', 'redshift', 'z'],
        'hubble redshift': ['cosmic redshift', 'cosmological redshift', 'redshift'],
        'cosmological redshift': ['cosmic redshift', 'hubble redshift', 'redshift'],
        'z': ['cosmic redshift', 'hubble redshift', 'cosmological redshift', 'redshift'],
        'lookback time': ['cosmic time', 'light travel time', 'cosmic age', 'universe age'],
        'cosmic time': ['lookback time', 'light travel time', 'cosmic age'],
        'light travel time': ['lookback time', 'cosmic time', 'light travel distance'],
        'cosmic age': ['lookback time', 'cosmic time', 'universe age'],
        'universe age': ['cosmic age', 'lookback time', 'cosmic time'],
        'density parameter': ['omega', 'critical density', 'cosmic density', 'friedmann'],
        'omega': ['density parameter', 'critical density', 'cosmic density'],
        'critical density': ['density parameter', 'omega', 'cosmic density'],
        'cosmic density': ['critical density', 'density parameter', 'omega'],
        'angular diameter distance': ['size distance', 'angular distance', 'da', 'distance'],
        'size distance': ['angular diameter distance', 'angular distance', 'distance'],
        'angular distance': ['angular diameter distance', 'size distance', 'distance'],
        'luminosity distance': ['flux distance', 'cosmic distance', 'dl', 'distance'],
        'flux distance': ['luminosity distance', 'cosmic distance', 'distance'],
        'cosmic distance': ['luminosity distance', 'flux distance', 'distance'],
        'einstein radius': ['gravitational lensing', 'lensing', 'einstein ring', 'microlensing'],
        'gravitational lensing': ['einstein radius', 'lensing', 'einstein ring'],
        'lensing': ['einstein radius', 'gravitational lensing', 'microlensing'],
        'einstein ring': ['einstein radius', 'gravitational lensing', 'lensing'],
        'microlensing': ['einstein radius', 'gravitational lensing', 'lensing'],
        'luminosity function': ['luminosity distribution', 'stellar luminosity function', 'luminosity'],
        'luminosity distribution': ['luminosity function', 'stellar luminosity function', 'luminosity'],
        'stellar luminosity function': ['luminosity function', 'luminosity distribution', 'luminosity']
    },
    
    // Lightweight word embeddings (concept vectors)
    conceptEmbeddings: {},
    
    // Initialize embeddings from concepts
    initializeEmbeddings: function() {
        // Build concept vectors from formula concepts and keywords
        const allConcepts = new Set();
        
        formulas.forEach(formula => {
            if (formula.concepts) {
                formula.concepts.forEach(c => allConcepts.add(c.toLowerCase()));
            }
            if (formula.keywords) {
                formula.keywords.forEach(k => allConcepts.add(k.toLowerCase()));
            }
        });
        
        // Create simple TF-IDF-like vectors for each concept
        Array.from(allConcepts).forEach(concept => {
            const words = concept.split(/\s+/);
            const vector = {};
            words.forEach(word => {
                vector[word] = 1;
            });
            this.conceptEmbeddings[concept] = vector;
        });
    },
    
    // Calculate cosine similarity between two concept vectors
    cosineSimilarity: function(vec1, vec2) {
        const keys1 = Object.keys(vec1);
        const keys2 = Object.keys(vec2);
        const allKeys = new Set([...keys1, ...keys2]);
        
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        
        allKeys.forEach(key => {
            const val1 = vec1[key] || 0;
            const val2 = vec2[key] || 0;
            dotProduct += val1 * val2;
            norm1 += val1 * val1;
            norm2 += val2 * val2;
        });
        
        if (norm1 === 0 || norm2 === 0) return 0;
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    },
    
    // Expand query with synonyms
    expandWithSynonyms: function(query) {
        const queryLower = query.toLowerCase();
        const expanded = new Set([queryLower]);
        
        // Direct synonym lookup
        if (this.synonymDictionary[queryLower]) {
            this.synonymDictionary[queryLower].forEach(syn => expanded.add(syn.toLowerCase()));
        }
        
        // Partial match synonyms
        Object.keys(this.synonymDictionary).forEach(key => {
            if (queryLower.includes(key) || key.includes(queryLower)) {
                this.synonymDictionary[key].forEach(syn => expanded.add(syn.toLowerCase()));
            }
        });
        
        // Semantic similarity expansion
        Object.keys(this.conceptEmbeddings).forEach(concept => {
            const queryVector = this.buildQueryVector(queryLower);
            const conceptVector = this.conceptEmbeddings[concept];
            const similarity = this.cosineSimilarity(queryVector, conceptVector);
            
            if (similarity > 0.3) { // Threshold for semantic similarity
                expanded.add(concept);
            }
        });
        
        return Array.from(expanded);
    },
    
    // Build vector for query
    buildQueryVector: function(query) {
        const words = query.split(/\s+/);
        const vector = {};
        words.forEach(word => {
            vector[word] = 1;
        });
        return vector;
    },
    
    // Track search term usage
    trackUsage: function(term) {
        const termLower = term.toLowerCase();
        
        if (!this.usageFrequency[termLower]) {
            this.usageFrequency[termLower] = 0;
        }
        this.usageFrequency[termLower]++;
    },
    
    // Get usage frequency weight
    getFrequencyWeight: function(term) {
        const termLower = term.toLowerCase();
        const frequency = this.usageFrequency[termLower] || 0;
        
        // Logarithmic scaling to prevent over-weighting
        return Math.log10(frequency + 1) * 10;
    },
    
    // Get dynamic weight (frequency-based only)
    getDynamicWeight: function(term) {
        return this.getFrequencyWeight(term);
    },
    
    // Contextual semantic matching
    semanticMatch: function(query, formula) {
        let score = 0;
        const queryLower = query.toLowerCase();
        
        // Ensure embeddings are initialized
        if (!this.conceptEmbeddings || Object.keys(this.conceptEmbeddings).length === 0) {
            // If embeddings not initialized, fall back to simple matching
            if (formula.concepts) {
                formula.concepts.forEach(concept => {
                    const conceptLower = concept.toLowerCase();
                    if (queryLower.includes(conceptLower) || conceptLower.includes(queryLower)) {
                        score += 100; // Reduced score for fallback matching
                    }
                });
            }
            return score;
        }
        
        // Expand query with synonyms
        const expandedQuery = this.expandWithSynonyms(queryLower);
        
        // Check formula concepts against expanded query
        if (formula.concepts && Array.isArray(formula.concepts)) {
            formula.concepts.forEach(concept => {
                const conceptLower = concept.toLowerCase();
                
                // Exact match
                if (expandedQuery.includes(conceptLower)) {
                    score += 200;
                } else {
                    // Semantic similarity
                    const queryVector = this.buildQueryVector(queryLower);
                    const conceptVector = this.conceptEmbeddings[conceptLower];
                    
                    if (conceptVector && typeof conceptVector === 'object') {
                        try {
                            const similarity = this.cosineSimilarity(queryVector, conceptVector);
                            if (similarity > 0.4 && !isNaN(similarity)) {
                                score += similarity * 150; // Weighted by similarity
                            }
                        } catch (e) {
                            // Fallback to simple matching if similarity calculation fails
                            if (queryLower.includes(conceptLower) || conceptLower.includes(queryLower)) {
                                score += 50;
                            }
                        }
                    }
                }
            });
        }
        
        // Check formula keywords
        if (formula.keywords && Array.isArray(formula.keywords)) {
            formula.keywords.forEach(keyword => {
                const keywordLower = keyword.toLowerCase();
                
                if (expandedQuery.includes(keywordLower)) {
                    score += 100;
                } else {
                    const queryVector = this.buildQueryVector(queryLower);
                    const keywordVector = this.conceptEmbeddings[keywordLower];
                    
                    if (keywordVector && typeof keywordVector === 'object') {
                        try {
                            const similarity = this.cosineSimilarity(queryVector, keywordVector);
                            if (similarity > 0.4 && !isNaN(similarity)) {
                                score += similarity * 80;
                            }
                        } catch (e) {
                            // Fallback to simple matching
                            if (queryLower.includes(keywordLower) || keywordLower.includes(queryLower)) {
                                score += 30;
                            }
                        }
                    }
                }
            });
        }
        
        // Check description with semantic matching
        if (formula.description) {
            const descLower = formula.description.toLowerCase();
            expandedQuery.forEach(expandedTerm => {
                if (descLower.includes(expandedTerm)) {
                    score += 80;
                }
            });
        }
        
        return Math.max(0, score); // Ensure non-negative
    }
};

// Initialize semantic search system
if (typeof formulas !== 'undefined' && formulas.length > 0) {
    semanticSearchSystem.initializeEmbeddings();
}

// Setup search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('formula-search');
    const clearBtn = document.getElementById('clear-search');
    
    if (!searchInput || !clearBtn) return;
    
    // Store original formulas for filtering
    let allFormulas = [...formulas];
    
    // PERFORMANCE FIX: Use debounce function for better debouncing
    const debouncedSearch = debounce((searchTerm) => {
        filterAndRenderFormulas(searchTerm);
    }, TIMING.DEBOUNCE_SEARCH);
    
    // Search input handler
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        
        // Show/hide clear button
        if (searchTerm.length > 0) {
            clearBtn.style.display = 'flex';
        } else {
            clearBtn.style.display = 'none';
            // Clear search immediately (no debounce for empty search)
            filterAndRenderFormulas('');
            return;
        }
        
        // Debounced search with caching
        debouncedSearch(searchTerm);
    });
    
    // Clear button handler
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        filterAndRenderFormulas('');
        searchInput.focus();
    });
    
    // Keyboard shortcuts
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            filterAndRenderFormulas('');
        }
    });
    
    // Filter and render formulas based on search term with scoring
    function filterAndRenderFormulas(searchTerm) {
        const startTime = window.performance.now();
        
        // PERFORMANCE: Removed console.log statements in hot path
        if (!searchTerm || searchTerm.trim() === '') {
            // Show all formulas
            renderFormulaList();
            return;
        }
        
        // PERFORMANCE FIX: Check cache first
        const cacheKey = searchTerm.toLowerCase().trim();
        const cachedResult = searchCache.get(cacheKey);
        if (cachedResult) {
            const cacheTime = window.performance.now() - startTime;
            performanceMonitor.recordSearch(cacheTime);
            renderFilteredFormulas(cachedResult.scoredFormulas, searchTerm, cachedResult.maxScore);
            return;
        }
        
        // Ensure allFormulas is populated with ALL formulas
        if (!allFormulas || allFormulas.length === 0 || allFormulas.length !== formulas.length) {
            allFormulas = [...formulas];
        }
        
        // Validate that all formulas are included
        if (allFormulas.length !== formulas.length) {
            allFormulas = [...formulas];
        }
        
        // Track usage for dynamic prioritization (async, don't block)
        if (typeof semanticSearchSystem !== 'undefined') {
            setTimeout(() => semanticSearchSystem.trackUsage(searchTerm), 0);
        }
        
        const searchLower = searchTerm.toLowerCase().trim();
        const searchWords = searchLower.split(/\s+/).filter(w => w.length > 0);
        
        if (searchWords.length === 0) {
            renderFormulaList();
            return;
        }
        
        // PERFORMANCE: Score formulas with early exit for low scores
        // Only do expensive semantic matching on top candidates
        const allScoredFormulas = allFormulas.map(formula => {
            const scoreData = calculateSearchScore(formula, searchLower, searchWords);
            
            // Early exit if score is very low (skip expensive semantic matching)
            if (scoreData.score < 10) {
                scoreData.score = Math.max(0, scoreData.score || 0);
                return { formula, score: scoreData.score, metrics: scoreData.metrics };
            }
            
            // Add contextual semantic matching score (only for promising candidates)
            if (typeof semanticSearchSystem !== 'undefined' && semanticSearchSystem) {
                try {
                    const semanticScore = semanticSearchSystem.semanticMatch(searchTerm, formula);
                    if (semanticScore && !isNaN(semanticScore) && semanticScore > 0) {
                        scoreData.score += semanticScore;
                        scoreData.metrics.semanticMatch = true;
                        scoreData.metrics.matchReasons.push('Semantic similarity match');
                    }
                    
                    // Apply dynamic term prioritization (lightweight)
                    try {
                        const dynamicWeight = semanticSearchSystem.getDynamicWeight(searchTerm);
                        if (dynamicWeight && !isNaN(dynamicWeight) && dynamicWeight > 0) {
                            const boost = dynamicWeight / 100;
                            scoreData.score *= (1 + boost);
                            scoreData.metrics.dynamicBoost = Math.round(boost * 100);
                        }
                    } catch (e) {
                        // Ignore errors
                    }
                } catch (e) {
                    // Ignore semantic matching errors
                }
            }
            
            // Ensure score is valid and non-negative
            scoreData.score = Math.max(0, scoreData.score || 0);
            if (isNaN(scoreData.score)) {
                scoreData.score = 0;
            }
            
            return { formula, score: scoreData.score, metrics: scoreData.metrics };
        });
        
        // PERFORMANCE: Filter and sort in one pass, limit results early
        let scoredFormulas = allScoredFormulas
          .filter(item => {
              // Quick filter: Show formulas with ANY score > 0 OR any match type
              const hasStrongMatch = item.metrics.nameMatch || item.metrics.questionPatternMatch || item.metrics.conceptMatch;
              const hasAnyMatch = item.metrics.descriptionMatch || item.metrics.variableMatch || item.metrics.categoryMatch;
              return item.score > 0 || hasStrongMatch || hasAnyMatch;
          })
          .sort((a, b) => b.score - a.score) // Sort by relevance (highest to lowest)
          .slice(0, 50); // Limit to 50 results
        
        // ALWAYS show at least top 10 results, even if they have low scores
        if (scoredFormulas.length === 0 && allFormulas.length > 0) {
            scoredFormulas = allScoredFormulas
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
        } else if (scoredFormulas.length < 5) {
            // If we have very few results, show more
            scoredFormulas = allScoredFormulas
                .sort((a, b) => b.score - a.score)
                .slice(0, Math.max(10, scoredFormulas.length + 5));
        }
        
        // Calculate max score for normalization
        const maxScore = scoredFormulas.length > 0 ? scoredFormulas[0].score : 1;
        
        // PERFORMANCE FIX: Cache the results
        searchCache.set(cacheKey, {
            scoredFormulas: scoredFormulas,
            maxScore: maxScore
        });
        
        // Render filtered formulas with accuracy metrics
        renderFilteredFormulas(scoredFormulas, searchTerm, maxScore);
    }
    
    // Calculate search relevance score with advanced natural language understanding
    function calculateSearchScore(formula, searchLower, searchWords) {
        let score = 0;
        const nameLower = formula.name.toLowerCase();
        const descLower = formula.description.toLowerCase();
        const eqLower = formula.equation.toLowerCase();
        
        // Track metrics for accuracy display
        const metrics = {
            nameMatch: false,
            descriptionMatch: false,
            equationMatch: false,
            variableMatch: false,
            conceptMatch: false,
            questionPatternMatch: false,
            categoryMatch: false,
            matchedConcepts: [],
            matchedVariables: [],
            matchReasons: [],
            originalConcepts: [],
            expandedConcepts: [],
            semanticMatch: false,
            synonymMatch: false,
            dynamicBoost: 0
        };
        
        // Parse question intent and extract key concepts
        const parsedQuery = parseNaturalLanguageQuery(searchLower, searchWords);
        
        // Store original concepts for display
        metrics.originalConcepts = [...parsedQuery.concepts];
        
        // Detect problem domain (e.g., distance, temperature, orbital)
        if (typeof conceptMatchingSystem !== 'undefined' && conceptMatchingSystem.detectProblemDomain) {
            const detectedDomains = conceptMatchingSystem.detectProblemDomain(searchLower);
            if (detectedDomains.length > 0) {
                const primaryDomain = detectedDomains[0];
                metrics.domain = primaryDomain.domain;
                metrics.domainBoost = primaryDomain.boost;
                metrics.matchReasons.push(`Problem domain: ${primaryDomain.domain} (${primaryDomain.matchCount} matches)`);
                
                // Add domain-related concepts to search
                primaryDomain.relatedConcepts.forEach(concept => {
                    if (!parsedQuery.concepts.includes(concept)) {
                        parsedQuery.concepts.push(concept);
                    }
                });
            }
        }
        
        // Expand concepts using hierarchical network
        const expandedConcepts = expandConceptsWithHierarchy(parsedQuery.concepts);
        parsedQuery.concepts = expandedConcepts;
        metrics.expandedConcepts = expandedConcepts;
        
        // Note if concepts were expanded
        if (expandedConcepts.length > metrics.originalConcepts.length) {
            metrics.matchReasons.push(`Hierarchical expansion: ${metrics.originalConcepts.length} → ${expandedConcepts.length} concepts`);
        }
        
        // Exact name match (highest priority) - Increased to 10000 for more accuracy
        if (nameLower === searchLower) {
            score += 10000;
            metrics.nameMatch = true;
            metrics.matchReasons.push('Exact name match');
        } else if (nameLower.startsWith(searchLower)) {
            score += 5000;
            metrics.nameMatch = true;
            metrics.matchReasons.push('Name starts with search term');
        } else if (nameLower.includes(searchLower)) {
            score += 2000;
            metrics.nameMatch = true;
            metrics.matchReasons.push('Name contains search term');
        }
        
        // Boost for matching keywords in title (word-by-word)
        searchWords.forEach(word => {
            if (nameLower.includes(word.toLowerCase())) {
                score += 8; // Boost for each word match in title
                metrics.matchReasons.push(`Title contains "${word}"`);
            }
        });
        
        // Boost for exact word matches in title
        const nameWords = nameLower.split(/\s+/);
        searchWords.forEach(word => {
            if (nameWords.includes(word.toLowerCase())) {
                score += 4; // Additional boost for exact word match
            }
        });
        
        // Natural language question matching
        const questionMatch = matchQuestionToFormula(formula, parsedQuery, searchLower, searchWords);
        score += questionMatch.score;
        if (questionMatch.score > 0) {
            metrics.questionPatternMatch = true;
            metrics.matchReasons.push(`Question pattern match (${questionMatch.reason || 'high relevance'})`);
        }
        
        // ENHANCED: Precision matching with directionality and primary use
        const precisionScore = calculatePrecisionScore(formula, parsedQuery, searchLower);
        score += precisionScore.score;
        if (precisionScore.score > 0) {
            metrics.matchReasons.push(precisionScore.reason);
        }
        
        // ENHANCED: Context-aware penalties for overly generic matches
        const penalty = calculateGenericPenalty(formula, parsedQuery, score);
        score -= penalty;
        // Ensure score never goes negative
        score = Math.max(0, score);
        if (penalty > 0) {
            metrics.matchReasons.push(`Generic match penalty: -${penalty} points`);
        }
        
        // Word-by-word matching in name (weighted by word importance) - ENHANCED
        searchWords.forEach(word => {
            if (word.length >= 3) { // Only match words 3+ characters
                if (nameLower === word) {
                    score += 300; // Exact word match in name
                } else if (nameLower.startsWith(word)) {
                    score += 200; // Name starts with word
                } else if (nameLower.includes(word)) {
                    score += 150; // Name contains word
                }
                // Check for word boundaries for better accuracy
                const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
                if (wordRegex.test(nameLower)) {
                    score += 50; // Bonus for word boundary match
                }
            }
        });
        
        // Description matching with semantic understanding (REDUCED to prevent too many matches)
        if (descLower.includes(searchLower)) {
            score += 150; // Full phrase match in description
            metrics.descriptionMatch = true;
        }
        // Only count description word matches if they're key terms (not common words)
        const commonWords = ['the', 'is', 'to', 'a', 'an', 'and', 'or', 'of', 'for', 'with', 'from', 'what', 'how', 'find', 'calculate'];
        searchWords.forEach(word => {
            if (word.length >= 3 && !commonWords.includes(word)) {
                if (descLower.includes(word)) {
                    // Reduced weight - only 20-30 points per word to prevent spam
                    const wordIndex = descLower.indexOf(word);
                    const positionWeight = wordIndex < descLower.length / 2 ? 30 : 20;
                    score += positionWeight;
                    metrics.descriptionMatch = true;
                }
                // Word boundary match bonus (reduced)
                const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
                if (wordRegex.test(descLower)) {
                    score += 10; // Reduced from 30
                }
            }
        });
        
        // Check if description answers the question (enhanced concept matching - REDUCED)
        if (parsedQuery.intent === 'calculate' || parsedQuery.intent === 'find' || parsedQuery.intent === 'determine') {
            parsedQuery.concepts.forEach(concept => {
                // Exact concept match in description (reduced points)
                if (descLower.includes(concept)) {
                    score += 100; // Reduced from 250
                    metrics.conceptMatch = true;
                    if (!metrics.matchedConcepts.includes(concept)) {
                        metrics.matchedConcepts.push(concept);
                    }
                }
                // Concept match in name (higher weight - name is more important)
                if (nameLower.includes(concept)) {
                    score += 400; // Keep high for name matches
                    metrics.conceptMatch = true;
                    if (!metrics.matchedConcepts.includes(concept)) {
                        metrics.matchedConcepts.push(concept);
                    }
                }
                // Partial concept match (for compound concepts)
                const conceptWords = concept.split(' ');
                if (conceptWords.length > 1) {
                    const allWordsMatch = conceptWords.every(cw => 
                        descLower.includes(cw) || nameLower.includes(cw)
                    );
                    if (allWordsMatch) {
                        score += 180;
                        metrics.conceptMatch = true;
                    }
                }
            });
        }
        
        // Triple-Layer Cross-Concept Reinforcement scoring
        if (typeof crossConceptReinforcement !== 'undefined' && crossConceptReinforcement.conceptNetwork) {
            parsedQuery.concepts.forEach(concept => {
                // Layer 1: Related concepts boost score
                const reinforcedConcepts = crossConceptReinforcement.getReinforcedConcepts(concept);
                reinforcedConcepts.forEach(relatedConcept => {
                    if (descLower.includes(relatedConcept) || nameLower.includes(relatedConcept)) {
                        score += 120; // Cross-concept reinforcement bonus
                        metrics.conceptMatch = true;
                        if (!metrics.matchedConcepts.includes(relatedConcept)) {
                            metrics.matchedConcepts.push(relatedConcept);
                        }
                    }
                });
                
                // Layer 2 + Layer 3: Reinforcement score from cross-layer connections
                const reinforcementScore = crossConceptReinforcement.getReinforcementScore(concept, formula.id);
                if (reinforcementScore > 0) {
                    score += reinforcementScore * 0.5; // Weighted reinforcement bonus
                    metrics.conceptMatch = true;
                }
            });
        }
        
        // Equation matching
        if (eqLower.includes(searchLower)) {
            score += 80;
            metrics.equationMatch = true;
        }
        searchWords.forEach(word => {
            if (eqLower.includes(word)) {
                score += 30;
                metrics.equationMatch = true;
            }
        });
        
        // Concept and keyword matching (new rich metadata)
        let domainMatchBonus = 0;
        if (formula.concepts && Array.isArray(formula.concepts)) {
            formula.concepts.forEach(concept => {
                const conceptLower = concept.toLowerCase();
                if (conceptLower === searchLower) {
                    score += 400;
                    metrics.conceptMatch = true;
                    if (!metrics.matchedConcepts.includes(concept)) {
                        metrics.matchedConcepts.push(concept);
                    }
                } else if (conceptLower.includes(searchLower) || searchLower.includes(conceptLower)) {
                    score += 200;
                    metrics.conceptMatch = true;
                    if (!metrics.matchedConcepts.includes(concept)) {
                        metrics.matchedConcepts.push(concept);
                    }
                }
                
                // Check if this concept matches detected domain
                if (metrics.domain && typeof conceptMatchingSystem !== 'undefined' && conceptMatchingSystem.detectProblemDomain) {
                    const detectedDomains = conceptMatchingSystem.detectProblemDomain(searchLower);
                    detectedDomains.forEach(domain => {
                        if (domain.relatedConcepts.some(dc => dc.toLowerCase() === conceptLower)) {
                            domainMatchBonus += 30; // Domain match bonus
                        }
                    });
                }
                
                // Word-by-word matching in concepts
                searchWords.forEach(word => {
                    if (word.length >= 3 && conceptLower.includes(word)) {
                        score += 150;
                        metrics.conceptMatch = true;
                        if (!metrics.matchedConcepts.includes(concept)) {
                            metrics.matchedConcepts.push(concept);
                        }
                    }
                });
            });
        }
        
        // Apply domain match bonus
        if (domainMatchBonus > 0) {
            score += domainMatchBonus;
            metrics.matchReasons.push(`Domain match bonus: +${domainMatchBonus} (${metrics.domain})`);
        }
        
        if (formula.keywords && Array.isArray(formula.keywords)) {
            formula.keywords.forEach(keyword => {
                const keywordLower = keyword.toLowerCase();
                if (keywordLower === searchLower) {
                    score += 180;
                    metrics.conceptMatch = true;
                } else if (keywordLower.includes(searchLower) || searchLower.includes(keywordLower)) {
                    score += 100;
                    metrics.conceptMatch = true;
                }
                // Word-by-word matching in keywords
                searchWords.forEach(word => {
                    if (word.length >= 3 && keywordLower.includes(word)) {
                        score += 80;
                        metrics.conceptMatch = true;
                    }
                });
            });
        }
        
        // Variable matching (high priority for symbols - improved accuracy)
        formula.variables.forEach(v => {
            const varSymbol = v.symbol.toLowerCase();
            const varName = v.name.toLowerCase();
            const varDesc = (v.description || '').toLowerCase();
            
            // Exact symbol match (highest priority)
            if (varSymbol === searchLower) {
                score += 400;
                metrics.variableMatch = true;
                if (!metrics.matchedVariables.includes(v.symbol)) {
                    metrics.matchedVariables.push(v.symbol);
                }
            } else if (varSymbol.includes(searchLower)) {
                score += 180;
                metrics.variableMatch = true;
            }
            
            // Exact variable name match
            if (varName === searchLower) {
                score += 250;
                metrics.variableMatch = true;
                if (!metrics.matchedVariables.includes(v.symbol)) {
                    metrics.matchedVariables.push(v.symbol);
                }
            } else if (varName.includes(searchLower)) {
                score += 120;
                metrics.variableMatch = true;
            }
            
            // Check if variable name matches question concepts (enhanced)
            parsedQuery.concepts.forEach(concept => {
                // Exact concept match in variable name
                if (varName === concept || varName.includes(` ${concept} `) || varName.startsWith(`${concept} `) || varName.endsWith(` ${concept}`)) {
                    score += 180;
                    metrics.variableMatch = true;
                    if (!metrics.matchedVariables.includes(v.symbol)) {
                        metrics.matchedVariables.push(v.symbol);
                    }
                } else if (varName.includes(concept) || varDesc.includes(concept)) {
                    score += 140;
                    metrics.variableMatch = true;
                    if (!metrics.matchedVariables.includes(v.symbol)) {
                        metrics.matchedVariables.push(v.symbol);
                    }
                }
                // Exact symbol-concept match
                if (varSymbol === concept) {
                    score += 250;
                    metrics.variableMatch = true;
                    if (!metrics.matchedVariables.includes(v.symbol)) {
                        metrics.matchedVariables.push(v.symbol);
                    }
                }
            });
            
            // Word-by-word matching in variables (weighted)
            searchWords.forEach(word => {
                if (word.length >= 2) {
                    if (varSymbol === word) {
                        score += 120;
                        metrics.variableMatch = true;
                    } else if (varSymbol.includes(word)) {
                        score += 80;
                    }
                    if (varName.includes(word)) {
                        score += 50;
                        metrics.variableMatch = true;
                    }
                    if (varDesc.includes(word)) {
                        score += 70;
                        metrics.variableMatch = true;
                    }
                }
            });
        });
        
        // Category matching (improved accuracy)
        for (const [category, ids] of Object.entries(formulaCategories)) {
            if (ids.includes(formula.id)) {
                const categoryLower = category.toLowerCase();
                // Exact category match
                if (categoryLower === searchLower) {
                    score += 150;
                    metrics.categoryMatch = true;
                } else if (categoryLower.includes(searchLower)) {
                    score += 80;
                    metrics.categoryMatch = true;
                }
                // Word-by-word category matching
                searchWords.forEach(word => {
                    if (word.length >= 3 && categoryLower.includes(word)) {
                        score += 60;
                        metrics.categoryMatch = true;
                    }
                });
                // Check if category matches question domain (enhanced)
                parsedQuery.concepts.forEach(concept => {
                    if (categoryLower === concept) {
                        score += 120;
                        metrics.categoryMatch = true;
                        if (!metrics.matchedConcepts.includes(concept)) {
                            metrics.matchedConcepts.push(concept);
                        }
                    } else if (categoryLower.includes(concept)) {
                        score += 90;
                        metrics.categoryMatch = true;
                        if (!metrics.matchedConcepts.includes(concept)) {
                            metrics.matchedConcepts.push(concept);
                        }
                    }
                });
                break;
            }
        }
        
        // Boost score for multiple strong matches (compound relevance)
        const strongMatchCount = [
            metrics.nameMatch && score > 200,
            metrics.questionPatternMatch,
            metrics.conceptMatch && metrics.matchedConcepts.length > 0,
            metrics.variableMatch && metrics.matchedVariables.length > 0
        ].filter(Boolean).length;
        
        if (strongMatchCount >= 2) {
            score += 100 * (strongMatchCount - 1); // Bonus for multiple strong matches
        }
        
        return { score, metrics };
    }
    
    // Hierarchical concept network - defines parent-child relationships
    function getConceptHierarchy() {
        return {
            // Top-level: Fundamental Physics
            'fundamental physics': {
                children: ['motion', 'energy', 'force', 'gravity', 'radiation', 'thermodynamics'],
                level: 0
            },
            
            // Motion & Dynamics
            'motion': {
                children: ['velocity', 'orbital velocity', 'rotational velocity', 'escape velocity', 'acceleration', 'momentum'],
                level: 1,
                parent: 'fundamental physics'
            },
            'velocity': {
                children: ['orbital velocity', 'rotational velocity', 'escape velocity', 'tangential velocity'],
                level: 2,
                parent: 'motion',
                siblings: ['acceleration', 'momentum']
            },
            'orbital velocity': {
                children: [],
                level: 3,
                parent: 'velocity',
                siblings: ['rotational velocity', 'escape velocity'],
                related: ['orbital period', 'kepler', 'semi-major axis']
            },
            'rotational velocity': {
                children: [],
                level: 3,
                parent: 'velocity',
                siblings: ['orbital velocity', 'escape velocity'],
                related: ['rotational period', 'angular frequency']
            },
            'escape velocity': {
                children: [],
                level: 3,
                parent: 'velocity',
                siblings: ['orbital velocity', 'rotational velocity'],
                related: ['gravity', 'surface gravity', 'mass', 'radius']
            },
            'acceleration': {
                children: ['surface gravity', 'centripetal acceleration'],
                level: 2,
                parent: 'motion',
                siblings: ['velocity', 'momentum']
            },
            'momentum': {
                children: ['angular momentum', 'linear momentum'],
                level: 2,
                parent: 'motion',
                siblings: ['velocity', 'acceleration']
            },
            'angular momentum': {
                children: ['angular momentum elliptical'],
                level: 3,
                parent: 'momentum',
                related: ['rotational velocity', 'orbital velocity']
            },
            
            // Energy
            'energy': {
                children: ['orbital energy', 'kinetic energy', 'potential energy', 'photon energy', 'radiative energy'],
                level: 1,
                parent: 'fundamental physics'
            },
            'orbital energy': {
                children: ['vis viva'],
                level: 2,
                parent: 'energy',
                related: ['orbital velocity', 'semi-major axis', 'period']
            },
            'photon energy': {
                children: [],
                level: 2,
                parent: 'energy',
                related: ['wavelength', 'planck relation', 'frequency']
            },
            
            // Force & Gravity
            'force': {
                children: ['gravity', 'tidal force', 'centripetal force'],
                level: 1,
                parent: 'fundamental physics'
            },
            'gravity': {
                children: ['surface gravity', 'escape velocity', 'tidal force'],
                level: 2,
                parent: 'force',
                related: ['mass', 'radius', 'density']
            },
            'surface gravity': {
                children: [],
                level: 3,
                parent: 'gravity',
                related: ['mass', 'radius', 'escape velocity']
            },
            'tidal force': {
                children: ['roche limit'],
                level: 3,
                parent: 'gravity',
                related: ['mass', 'distance', 'hill radius']
            },
            'roche limit': {
                children: [],
                level: 4,
                parent: 'tidal force',
                related: ['mass', 'density', 'hill radius']
            },
            'hill radius': {
                children: [],
                level: 3,
                parent: 'gravity',
                related: ['mass', 'semi-major axis', 'roche limit']
            },
            
            // Distance & Position
            'distance': {
                children: ['parallax', 'parallax distance', 'distance modulus', 'luminosity distance', 'angular diameter distance', 'semi-major axis'],
                level: 1,
                parent: 'fundamental physics'
            },
            'parallax': {
                children: ['parallax distance radians', 'parallax distance arcsec', 'trigonometric parallax'],
                level: 2,
                parent: 'distance',
                siblings: ['distance modulus', 'luminosity distance']
            },
            'parallax distance': {
                children: ['parallax distance radians', 'parallax distance arcsec'],
                level: 3,
                parent: 'parallax',
                related: ['distance modulus', 'standard candle']
            },
            'distance modulus': {
                children: [],
                level: 2,
                parent: 'distance',
                siblings: ['parallax', 'luminosity distance'],
                related: ['magnitude', 'apparent magnitude', 'absolute magnitude', 'extinction']
            },
            'luminosity distance': {
                children: [],
                level: 2,
                parent: 'distance',
                siblings: ['parallax', 'distance modulus'],
                related: ['luminosity', 'redshift', 'hubble']
            },
            'angular diameter distance': {
                children: [],
                level: 2,
                parent: 'distance',
                siblings: ['parallax', 'distance modulus'],
                related: ['angular size', 'redshift']
            },
            'semi-major axis': {
                children: [],
                level: 2,
                parent: 'distance',
                related: ['orbital period', 'kepler', 'orbital velocity']
            },
            
            // Time & Period
            'period': {
                children: ['orbital period', 'rotational period', 'synodic period'],
                level: 1,
                parent: 'fundamental physics'
            },
            'orbital period': {
                children: [],
                level: 2,
                parent: 'period',
                siblings: ['rotational period', 'synodic period'],
                related: ['kepler', 'semi-major axis', 'mass', 'orbital velocity']
            },
            'synodic period': {
                children: [],
                level: 2,
                parent: 'period',
                siblings: ['orbital period'],
                related: ['orbital period']
            },
            'rotational period': {
                children: [],
                level: 2,
                parent: 'period',
                siblings: ['orbital period'],
                related: ['rotational velocity', 'angular frequency']
            },
            'lifetime': {
                children: ['stellar lifetime', 'timescale'],
                level: 1,
                parent: 'fundamental physics'
            },
            'stellar lifetime': {
                children: [],
                level: 2,
                parent: 'lifetime',
                related: ['mass', 'luminosity', 'stellar evolution']
            },
            'timescale': {
                children: ['synchrotron cooling timescale', 'tidal locking timescale', 'thermal timescale', 'dynamical timescale'],
                level: 2,
                parent: 'lifetime'
            },
            
            // Mass
            'mass': {
                children: ['stellar mass', 'planetary mass', 'jeans mass', 'chandrasekhar limit'],
                level: 1,
                parent: 'fundamental physics'
            },
            'chandrasekhar limit': {
                children: [],
                level: 2,
                parent: 'mass',
                related: ['white dwarf', 'neutron star', 'compact object']
            },
            'jeans mass': {
                children: [],
                level: 2,
                parent: 'mass',
                related: ['density', 'temperature', 'gravitational collapse']
            },
            
            // Temperature
            'temperature': {
                children: ['effective temperature', 'surface temperature', 'color temperature', 'planetary equilibrium temperature'],
                level: 1,
                parent: 'fundamental physics'
            },
            'effective temperature': {
                children: [],
                level: 2,
                parent: 'temperature',
                related: ['luminosity', 'radius', 'blackbody', 'wien law']
            },
            'planetary equilibrium temperature': {
                children: [],
                level: 2,
                parent: 'temperature',
                related: ['luminosity', 'distance', 'albedo']
            },
            
            // Radiation & Stellar Properties
            'radiation': {
                children: ['blackbody', 'blackbody radiation', 'flux', 'luminosity', 'magnitude', 'wavelength'],
                level: 1,
                parent: 'fundamental physics'
            },
            'blackbody': {
                children: ['blackbody radiation', 'wien law', 'planck relation'],
                level: 2,
                parent: 'radiation',
                related: ['temperature', 'wavelength', 'flux']
            },
            'blackbody radiation': {
                children: [],
                level: 3,
                parent: 'blackbody',
                related: ['temperature', 'wavelength', 'flux', 'wien law']
            },
            'wien law': {
                children: [],
                level: 3,
                parent: 'blackbody',
                related: ['temperature', 'peak wavelength', 'wavelength']
            },
            'planck relation': {
                children: [],
                level: 3,
                parent: 'blackbody',
                related: ['photon energy', 'wavelength', 'frequency']
            },
            'flux': {
                children: ['flux from luminosity', 'flux temperature', 'inverse square law brightness'],
                level: 2,
                parent: 'radiation',
                related: ['luminosity', 'distance', 'magnitude']
            },
            'luminosity': {
                children: ['flux from luminosity', 'mass luminosity relation'],
                level: 2,
                parent: 'radiation',
                related: ['radius', 'temperature', 'magnitude', 'distance']
            },
            'magnitude': {
                children: ['apparent magnitude', 'absolute magnitude', 'distance modulus', 'magnitude flux relation'],
                level: 2,
                parent: 'radiation',
                related: ['flux', 'luminosity', 'distance']
            },
            'wavelength': {
                children: ['peak wavelength', 'doppler shift'],
                level: 2,
                parent: 'radiation',
                related: ['wien law', 'planck relation', 'redshift']
            },
            
            // Spectroscopy
            'spectroscopy': {
                children: ['doppler', 'doppler shift', 'equivalent width', 'line profile'],
                level: 1,
                parent: 'fundamental physics'
            },
            'doppler': {
                children: ['doppler shift', 'doppler shift approx', 'radial velocity'],
                level: 2,
                parent: 'spectroscopy',
                related: ['velocity', 'redshift', 'wavelength']
            },
            'doppler shift': {
                children: [],
                level: 3,
                parent: 'doppler',
                related: ['velocity', 'redshift', 'wavelength', 'radial velocity curve']
            },
            'equivalent width': {
                children: [],
                level: 2,
                parent: 'spectroscopy',
                related: ['absorption', 'emission', 'line profile']
            },
            
            // Cosmology
            'cosmology': {
                children: ['redshift', 'hubble', 'hubble law', 'lookback time', 'cosmic redshift'],
                level: 1,
                parent: 'fundamental physics'
            },
            'redshift': {
                children: ['cosmic redshift', 'doppler shift'],
                level: 2,
                parent: 'cosmology',
                related: ['hubble', 'distance', 'velocity']
            },
            'hubble': {
                children: ['hubble law', 'hubble constant'],
                level: 2,
                parent: 'cosmology',
                related: ['redshift', 'distance', 'velocity']
            },
            'hubble law': {
                children: [],
                level: 3,
                parent: 'hubble',
                related: ['redshift', 'distance', 'velocity', 'luminosity distance']
            },
            'lookback time': {
                children: [],
                level: 2,
                parent: 'cosmology',
                related: ['redshift', 'hubble', 'distance']
            },
            
            // Stellar Evolution
            'stellar evolution': {
                children: ['main sequence', 'giant', 'white dwarf', 'neutron star', 'black hole', 'stellar lifetime'],
                level: 1,
                parent: 'fundamental physics'
            },
            'main sequence': {
                children: ['mass luminosity relation', 'stellar lifetime'],
                level: 2,
                parent: 'stellar evolution',
                related: ['mass', 'luminosity', 'temperature']
            },
            'white dwarf': {
                children: ['white dwarf mass radius', 'chandrasekhar limit', 'binary white dwarf'],
                level: 2,
                parent: 'stellar evolution',
                related: ['mass', 'radius', 'density']
            },
            'binary white dwarf': {
                children: ['white dwarf orbital decay', 'white dwarf merger timescale'],
                level: 3,
                parent: 'white dwarf',
                related: ['orbital period', 'mass', 'roche limit']
            },
            
            // Binary Systems
            'binary': {
                children: ['binary white dwarf', 'kepler third law binary', 'center of mass'],
                level: 1,
                parent: 'fundamental physics'
            },
            'kepler third law binary': {
                children: [],
                level: 2,
                parent: 'binary',
                related: ['orbital period', 'mass', 'semi-major axis']
            },
            'center of mass': {
                children: [],
                level: 2,
                parent: 'binary',
                related: ['mass', 'distance', 'orbital period']
            },
            
            // Kepler's Laws
            'kepler': {
                children: ['kepler third law', 'kepler third law solar', 'kepler third law binary'],
                level: 1,
                parent: 'fundamental physics'
            },
            'kepler third law': {
                children: [],
                level: 2,
                parent: 'kepler',
                related: ['orbital period', 'semi-major axis', 'mass']
            },
            
            // Relativity
            'relativity': {
                children: ['schwarzschild radius', 'time dilation', 'length contraction', 'einstein radius'],
                level: 1,
                parent: 'fundamental physics'
            },
            'schwarzschild radius': {
                children: [],
                level: 2,
                parent: 'relativity',
                related: ['mass', 'black hole', 'event horizon']
            },
            'einstein radius': {
                children: [],
                level: 2,
                parent: 'relativity',
                related: ['gravitational lensing', 'mass', 'distance']
            },
            
            // High Energy Astrophysics
            'high energy': {
                children: ['synchrotron', 'synchrotron power', 'magnetic energy density', 'max gamma bohm'],
                level: 1,
                parent: 'fundamental physics'
            },
            'synchrotron': {
                children: ['synchrotron power', 'synchrotron cooling timescale'],
                level: 2,
                parent: 'high energy',
                related: ['magnetic field', 'energy', 'radiation']
            },
            
            // Telescopes & Optics
            'telescopes': {
                children: ['angular resolution', 'light gathering power', 'magnification', 'f ratio'],
                level: 1,
                parent: 'fundamental physics'
            },
            'angular resolution': {
                children: [],
                level: 2,
                parent: 'telescopes',
                related: ['wavelength', 'aperture', 'diffraction']
            },
            'light gathering power': {
                children: [],
                level: 2,
                parent: 'telescopes',
                related: ['aperture', 'magnitude', 'flux']
            }
        };
    }
    
    // Expand concepts using hierarchical relationships
    function expandConceptsWithHierarchy(concepts) {
        const hierarchy = getConceptHierarchy();
        const expanded = new Set(concepts);
        
        concepts.forEach(concept => {
            const node = hierarchy[concept];
            if (node) {
                // Add parent concepts (broader context)
                if (node.parent) {
                    expanded.add(node.parent);
                }
                
                // Add child concepts (more specific)
                if (node.children && node.children.length > 0) {
                    node.children.forEach(child => expanded.add(child));
                }
                
                // Add sibling concepts (related at same level)
                if (node.siblings && node.siblings.length > 0) {
                    node.siblings.forEach(sibling => expanded.add(sibling));
                }
                
                // Add related concepts (cross-references)
                if (node.related && node.related.length > 0) {
                    node.related.forEach(related => expanded.add(related));
                }
            }
        });
        
        return Array.from(expanded);
    }
    
    // Helper function to extract concepts from text using comprehensive physics terms
    function extractConceptsFromText(text) {
        const concepts = [];
        const lowerText = text.toLowerCase();
        
        // Get the comprehensive physics terms dictionary (defined in parseNaturalLanguageQuery)
        // We'll use a simplified version here, but the full matching happens in parseNaturalLanguageQuery
        const keyTerms = [
            'temperature', 'temp', 'hot', 'thermal', 'effective temperature', 'surface temperature',
            'spectrum', 'spectral', 'light', 'wavelength', 'color', 'colour', 'peak wavelength',
            'flux', 'luminosity', 'brightness', 'radiance', 'magnitude', 'apparent magnitude', 'absolute magnitude',
            'distance', 'parallax', 'modulus', 'parallax distance', 'distance modulus', 'luminosity distance',
            'velocity', 'speed', 'orbital velocity', 'escape velocity', 'rotational velocity',
            'period', 'time', 'orbital period', 'rotational period', 'synodic period',
            'mass', 'weight', 'stellar mass', 'planetary mass', 'solar mass', 'chandrasekhar limit',
            'radius', 'size', 'diameter', 'semi-major axis', 'orbital distance',
            'gravity', 'gravitational', 'surface gravity', 'gravitational acceleration',
            'energy', 'photon energy', 'orbital energy', 'vis viva',
            'redshift', 'doppler', 'doppler shift', 'cosmic redshift',
            'blackbody', 'black body', 'wien', 'wien law', 'stefan', 'planck', 'blackbody radiation',
            'kepler', 'orbital', 'orbit', 'kepler third law',
            'white dwarf', 'star', 'stellar', 'planet', 'binary', 'binary system',
            'telescope', 'angular resolution', 'light gathering power', 'magnification',
            'hubble', 'hubble law', 'cosmology', 'cosmic expansion',
            'tidal', 'tidal force', 'roche limit', 'hill radius'
        ];
        
        // Match terms with word boundaries for better accuracy
        keyTerms.forEach(term => {
            const termLower = term.toLowerCase();
            // Word boundary match (better accuracy)
            const wordBoundaryRegex = new RegExp(`\\b${termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (wordBoundaryRegex.test(lowerText)) {
                concepts.push(term);
            } else if (lowerText.includes(termLower) && termLower.length >= 3) {
                // Partial match for longer terms
                concepts.push(term);
            }
        });
        
        return [...new Set(concepts)]; // Remove duplicates
    }
    
    // Parse natural language query to extract intent and concepts
    function parseNaturalLanguageQuery(searchLower, searchWords) {
        const result = {
            intent: 'search', // calculate, find, determine, how, what, etc.
            concepts: [],
            variables: [],
            actions: [],
            direction: null, // 'from', 'to', 'based_on', null
            sourceConcepts: [], // What we're calculating FROM
            targetConcepts: [] // What we're calculating TO
        };
        
        // Remove common question words and extract intent
        const questionWords = ['how', 'what', 'where', 'when', 'why', 'which', 'who'];
        const actionWords = {
            'calculate': ['calculate', 'compute', 'find', 'determine', 'solve', 'work out', 'figure out'],
            'find': ['find', 'get', 'obtain', 'discover', 'locate'],
            'determine': ['determine', 'figure', 'establish', 'ascertain'],
            'convert': ['convert', 'transform', 'change'],
            'relate': ['relate', 'connect', 'link', 'relationship', 'between']
        };
        
        // Detect intent
        for (const [intent, words] of Object.entries(actionWords)) {
            if (words.some(word => searchLower.includes(word))) {
                result.intent = intent;
                result.actions.push(intent);
                break;
            }
        }
        
        // ENHANCED: Detect directionality (FROM, TO, BASED ON)
        const directionPatterns = {
            'from': ['from', 'using', 'with', 'given', 'based on', 'based off', 'based off of', 'from the', 'using the', 'with the'],
            'to': ['to', 'into', 'for', 'as', 'in terms of'],
            'based_on': ['based on', 'based off', 'based off of', 'derived from', 'calculated from', 'determined from']
        };
        
        // Check for direction indicators
        for (const [direction, patterns] of Object.entries(directionPatterns)) {
            for (const pattern of patterns) {
                if (searchLower.includes(pattern)) {
                    result.direction = direction;
                    
                    // Extract source and target concepts
                    const parts = searchLower.split(new RegExp(`\\b${pattern}\\b`, 'i'));
                    if (parts.length >= 2) {
                        // First part is what we want (target)
                        const targetText = parts[0].trim();
                        // Second part is what we have (source)
                        const sourceText = parts.slice(1).join(' ').trim();
                        
                        // Extract concepts from each part
                        result.targetConcepts = extractConceptsFromText(targetText);
                        result.sourceConcepts = extractConceptsFromText(sourceText);
                    }
                    break;
                }
            }
            if (result.direction) break;
        }
        
        // Extract key concepts (physics/astronomy terms) with comprehensive synonyms
        const physicsTerms = {
            // Motion & Velocity
            'velocity': ['velocity', 'speed', 'v', 'how fast', 'rate of motion', 'motion', 'moving', 'mph', 'kmh', 'mps'],
            'orbital velocity': ['orbital velocity', 'orbital speed', 'circular motion', 'orbit speed', 'orbiting', 'revolve', 'orbital motion', 'circular orbit'],
            'escape velocity': ['escape velocity', 'escape speed', 'leave planet', 'escape gravity', 'break free', 'get away from', 'escape from', 'break away'],
            'rotational velocity': ['rotational velocity', 'rotation speed', 'spin', 'rotating', 'rotates', 'spinning', 'angular velocity', 'spin rate'],
            'vis viva': ['vis viva', 'orbital energy', 'total energy', 'mechanical energy'],
            
            // Distance & Position
            'distance': ['distance', 'd', 'how far', 'separation', 'away', 'far away', 'how far away', 'distant', 'separation distance'],
            'parallax': ['parallax', 'parallax distance', 'stellar parallax', 'parallax method', 'trigonometric parallax', 'annual parallax'],
            'radius': ['radius', 'r', 'size', 'diameter', 'how big', 'size of', 'stellar radius', 'planetary radius'],
            'semi-major axis': ['semi-major axis', 'orbital distance', 'a', 'orbit size', 'orbit distance', 'semi major axis', 'orbital radius'],
            'aphelion': ['aphelion', 'farthest point', 'maximum distance'],
            'perihelion': ['perihelion', 'closest point', 'minimum distance', 'periapsis'],
            'eccentricity': ['eccentricity', 'e', 'orbit shape', 'elliptical shape'],
            
            // Time & Period
            'period': ['period', 'p', 'time', 'how long', 'duration', 't', 'time period'],
            'orbital period': ['orbital period', 'orbit time', 'revolution', 'year', 'orbital time', 'revolution period'],
            'synodic period': ['synodic period', 'synodic', 'apparent period', 'relative period'],
            'lifetime': ['lifetime', 'age', 'how long', 'survive', 'live', 'stellar age', 'star age'],
            'stellar lifetime': ['stellar lifetime', 'main sequence lifetime', 'star lifetime', 'stellar age'],
            
            // Mass & Gravity
            'mass': ['mass', 'm', 'weight', 'how heavy', 'stellar mass', 'planetary mass', 'solar mass'],
            'gravity': ['gravity', 'g', 'gravitational', 'surface gravity', 'acceleration', 'gravitational acceleration', 'g force'],
            'escape': ['escape', 'leave', 'break free', 'get away'],
            'chandrasekhar limit': ['chandrasekhar limit', 'chandrasekhar', 'white dwarf limit', 'maximum mass', 'wd limit'],
            'jeans mass': ['jeans mass', 'jeans', 'gravitational collapse', 'critical mass'],
            'center of mass': ['center of mass', 'barycenter', 'center of gravity', 'com'],
            
            // Energy & Luminosity
            'luminosity': ['luminosity', 'l', 'brightness', 'how bright', 'intrinsic brightness', 'star brightness', 'stellar brightness', 'power output', 'radiative power'],
            'flux': ['flux', 'f', 'observed brightness', 'apparent brightness', 'light received', 'light flux', 'radiation flux', 'energy flux', 'flux density'],
            'magnitude': ['magnitude', 'm', 'apparent magnitude', 'absolute magnitude', 'brightness', 'star magnitude', 'stellar magnitude', 'photometric'],
            'energy': ['energy', 'e', 'kinetic', 'potential', 'orbital energy', 'total energy', 'mechanical energy'],
            'photon energy': ['photon energy', 'quantum energy', 'light energy', 'em energy'],
            'inverse square law': ['inverse square law', 'isq', 'brightness law', 'flux law'],
            
            // Temperature & Radiation
            'temperature': ['temperature', 't', 'temp', 'how hot', 'thermal', 'stellar temperature', 'surface temperature', 'effective temperature'],
            'wavelength': ['wavelength', 'lambda', 'λ', 'color', 'frequency', 'em wavelength', 'light wavelength'],
            'peak wavelength': ['peak wavelength', 'wien', 'maximum wavelength', 'lambda max', 'wien peak', 'wavelength peak'],
            'blackbody': ['blackbody', 'radiation', 'thermal radiation', 'bb radiation', 'black body'],
            'wien law': ['wien law', 'wien displacement', 'wien', 'wien displacement law'],
            'stefan boltzmann': ['stefan boltzmann', 'stefan', 'sb law', 'stefan boltzmann law', 'radiative law'],
            'planck': ['planck', 'planck relation', 'planck constant', 'quantum', 'photon'],
            
            // Stellar Properties
            'star': ['star', 'stellar', 'sun', 'solar', 'stellar object'],
            'main sequence': ['main sequence', 'ms star', 'dwarf star', 'main sequence star'],
            'red giant': ['red giant', 'giant', 'giant star', 'evolved star'],
            'white dwarf': ['white dwarf', 'dwarf', 'degenerate', 'wd', 'white dwarf star'],
            'neutron star': ['neutron star', 'pulsar', 'ns', 'compact object'],
            'black hole': ['black hole', 'bh', 'singularity', 'event horizon'],
            'supernova': ['supernova', 'sn', 'explosion', 'stellar explosion'],
            'planet': ['planet', 'planetary', 'exoplanet', 'extrasolar planet'],
            'binary star': ['binary star', 'binary', 'double star', 'binary system'],
            'hr diagram': ['hr diagram', 'hertzsprung russell', 'hr', 'color magnitude'],
            'mass luminosity': ['mass luminosity', 'mass luminosity relation', 'ml relation'],
            
            // Cosmology
            'hubble': ['hubble', 'expansion', 'universe', 'galaxy', 'redshift', 'hubble constant', 'h0', 'hubble law'],
            'redshift': ['redshift', 'z', 'cosmic', 'doppler', 'cosmological redshift'],
            'density': ['density', 'rho', 'ρ', 'critical density', 'mass density', 'energy density'],
            'critical density': ['critical density', 'omega', 'closure density', 'flat universe'],
            'dark matter': ['dark matter', 'dm', 'missing mass'],
            'dark energy': ['dark energy', 'de', 'cosmological constant'],
            'cmb': ['cmb', 'cosmic microwave background', 'microwave background', 'relic radiation'],
            'lookback time': ['lookback time', 'light travel time', 'cosmic time'],
            'friedmann': ['friedmann', 'friedmann equation', 'cosmological equation'],
            
            // Optics & Telescopes
            'angular size': ['angular size', 'angular diameter', 'apparent size', 'how big', 'angular extent', 'angular measure'],
            'angular resolution': ['angular resolution', 'resolution', 'resolving', 'resolving power', 'angular resolving'],
            'magnification': ['magnification', 'zoom', 'enlarge', 'magnifying power', 'angular magnification'],
            'light gathering': ['light gathering', 'light gathering power', 'aperture', 'collecting area'],
            'f ratio': ['f ratio', 'f number', 'focal ratio', 'f/#', 'f stop'],
            'aperture': ['aperture', 'diameter', 'telescope size', 'mirror size'],
            'focal length': ['focal length', 'f', 'focus'],
            
            // Orbital Mechanics
            'kepler': ['kepler', 'orbital', 'orbit', 'elliptical', 'kepler law', 'keplers law'],
            'kepler third law': ['kepler third law', 'kepler 3', 'period distance', 'p2 a3'],
            'tidal': ['tidal', 'tide', 'roche', 'disruption', 'tidal force', 'tidal effect'],
            'roche limit': ['roche limit', 'roche', 'tidal disruption', 'disruption radius'],
            'hill radius': ['hill radius', 'sphere of influence', 'gravitational influence', 'hill sphere'],
            'tidal locking': ['tidal locking', 'synchronous rotation', 'tidally locked'],
            'angular momentum': ['angular momentum', 'l', 'orbital angular momentum', 'spin angular momentum'],
            
            // Spectroscopy
            'doppler': ['doppler', 'doppler shift', 'doppler effect', 'radial velocity'],
            'spectroscopy': ['spectroscopy', 'spectrum', 'spectral', 'spectral line'],
            'equivalent width': ['equivalent width', 'ew', 'line strength', 'absorption strength'],
            'absorption': ['absorption', 'absorption line', 'spectral absorption'],
            'emission': ['emission', 'emission line', 'spectral emission'],
            'redshift z': ['redshift z', 'z', 'cosmological z'],
            
            // Exoplanets
            'exoplanet': ['exoplanet', 'extrasolar planet', 'exo planet', 'alien planet'],
            'transit': ['transit', 'transit method', 'transit depth', 'eclipse'],
            'radial velocity': ['radial velocity', 'rv method', 'doppler method', 'wobble'],
            'equilibrium temperature': ['equilibrium temperature', 'planet temperature', 'exoplanet temp', 'effective temp'],
            'albedo': ['albedo', 'reflectivity', 'reflection coefficient'],
            'greenhouse': ['greenhouse', 'greenhouse effect', 'atmospheric effect'],
            
            // High Energy Astrophysics
            'synchrotron': ['synchrotron', 'synchrotron radiation', 'magnetic radiation'],
            'gamma ray': ['gamma ray', 'gamma', 'high energy', 'gamma radiation'],
            'power law': ['power law', 'spectral index', 'alpha', 'spectrum slope'],
            'cooling': ['cooling', 'cooling time', 'synchrotron cooling', 'radiative cooling'],
            'magnetic field': ['magnetic field', 'b field', 'magnetic', 'b'],
            'energy density': ['energy density', 'u', 'magnetic energy', 'radiation energy'],
            
            // Relativity
            'schwarzschild': ['schwarzschild', 'schwarzschild radius', 'event horizon', 'black hole radius'],
            'time dilation': ['time dilation', 'relativistic time', 'time slow'],
            'length contraction': ['length contraction', 'lorentz contraction', 'relativistic length'],
            'einstein radius': ['einstein radius', 'gravitational lensing', 'lensing', 'einstein ring'],
            
            // Stellar Structure
            'hydrostatic': ['hydrostatic', 'hydrostatic balance', 'hydrostatic equilibrium', 'pressure balance'],
            'pressure': ['pressure', 'gas pressure', 'radiation pressure', 'stellar pressure'],
            
            // Distance Measurements
            'distance modulus': ['distance modulus', 'dm', 'magnitude distance', 'photometric distance'],
            'luminosity distance': ['luminosity distance', 'dl', 'flux distance', 'standard candle'],
            'angular diameter distance': ['angular diameter distance', 'da', 'size distance'],
            'parallax distance': ['parallax distance', 'trigonometric distance', 'geometric distance'],
            
            // Miscellaneous
            'binary': ['binary', 'binary system', 'double', 'pair', 'double star'],
            'merger': ['merger', 'merging', 'coalescence', 'collision', 'coalesce'],
            'orbital decay': ['orbital decay', 'decay', 'shrinking orbit', 'inspiral', 'spiral in'],
            'color index': ['color index', 'b-v', 'color', 'stellar color', 'bv color'],
            'stellar classification': ['stellar classification', 'spectral type', 'star type', 'classification', 'stellar type'],
            
            // Additional Motion Terms
            'acceleration': ['acceleration', 'a', 'rate of change', 'deceleration'],
            'angular velocity': ['angular velocity', 'omega', 'ω', 'angular speed', 'rotation rate'],
            'centripetal': ['centripetal', 'centripetal force', 'circular force'],
            'tangential velocity': ['tangential velocity', 'tangential speed', 'circumferential velocity'],
            
            // Additional Distance Terms
            'parsec': ['parsec', 'pc', 'parallax second'],
            'light year': ['light year', 'ly', 'lightyear'],
            'astronomical unit': ['astronomical unit', 'au', 'astronomical units'],
            'proper distance': ['proper distance', 'comoving distance', 'physical distance'],
            'comoving distance': ['comoving distance', 'comoving', 'coordinate distance'],
            
            // Additional Time Terms
            'age': ['age', 'stellar age', 'star age', 'system age'],
            'timescale': ['timescale', 'time scale', 'characteristic time'],
            'half life': ['half life', 'half-life', 'decay time'],
            'dynamical time': ['dynamical time', 'dynamical timescale', 'free fall time'],
            
            // Additional Mass Terms
            'solar mass': ['solar mass', 'm_sun', 'm☉', 'solar masses'],
            'jupiter mass': ['jupiter mass', 'm_jup', 'mj', 'jovian mass'],
            'earth mass': ['earth mass', 'm_earth', 'm⊕', 'terrestrial mass'],
            'chandrasekhar': ['chandrasekhar', 'chandrasekhar mass', 'wd limit'],
            'tov limit': ['tov limit', 'tov', 'tolman oppenheimer volkoff'],
            
            // Additional Energy Terms
            'kinetic energy': ['kinetic energy', 'ke', 'motion energy', 'translational energy'],
            'potential energy': ['potential energy', 'pe', 'gravitational energy', 'binding energy'],
            'binding energy': ['binding energy', 'gravitational binding', 'system energy'],
            'radiative energy': ['radiative energy', 'radiation energy', 'em energy'],
            'thermal energy': ['thermal energy', 'heat energy', 'internal energy'],
            
            // Additional Temperature Terms
            'effective temperature': ['effective temperature', 'teff', 't_eff', 'stellar temperature'],
            'surface temperature': ['surface temperature', 'photospheric temperature', 'star surface temp'],
            'color temperature': ['color temperature', 't_color', 'blackbody temperature'],
            'brightness temperature': ['brightness temperature', 'tb', 'radio temperature'],
            
            // Additional Radiation Terms
            'emission': ['emission', 'emission spectrum', 'emission line', 'emission feature'],
            'absorption': ['absorption', 'absorption spectrum', 'absorption line', 'absorption feature'],
            'continuum': ['continuum', 'continuous spectrum', 'blackbody continuum'],
            'spectral energy distribution': ['sed', 'spectral energy distribution', 'energy distribution'],
            'bolometric': ['bolometric', 'bolometric magnitude', 'total magnitude', 'bol'],
            
            // Additional Stellar Evolution Terms
            'main sequence': ['main sequence', 'ms', 'dwarf', 'main sequence star'],
            'giant': ['giant', 'giant star', 'red giant', 'blue giant'],
            'supergiant': ['supergiant', 'supergiant star', 'red supergiant', 'blue supergiant'],
            'subgiant': ['subgiant', 'subgiant branch'],
            'horizontal branch': ['horizontal branch', 'hb', 'horizontal branch star'],
            'asymptotic giant branch': ['agb', 'asymptotic giant branch', 'agb star'],
            'white dwarf': ['white dwarf', 'wd', 'degenerate dwarf', 'compact object'],
            'neutron star': ['neutron star', 'ns', 'pulsar', 'magnetar'],
            'black hole': ['black hole', 'bh', 'singularity', 'event horizon'],
            'protostar': ['protostar', 'protostellar', 'pre main sequence'],
            't tauri': ['t tauri', 'ttauri', 'pre main sequence star'],
            
            // Additional Binary Terms
            'eclipsing binary': ['eclipsing binary', 'eclipsing', 'eclipse', 'transit'],
            'spectroscopic binary': ['spectroscopic binary', 'sb', 'spectroscopic', 'radial velocity binary'],
            'visual binary': ['visual binary', 'visual pair', 'resolved binary'],
            'contact binary': ['contact binary', 'overcontact', 'merging binary'],
            'semi detached': ['semi detached', 'semi-detached', 'algol type'],
            'detached binary': ['detached binary', 'detached', 'well separated'],
            
            // Additional Exoplanet Terms
            'transit method': ['transit method', 'transit photometry', 'transit detection'],
            'radial velocity method': ['radial velocity method', 'rv method', 'doppler method', 'wobble method'],
            'microlensing': ['microlensing', 'gravitational microlensing', 'microlens'],
            'direct imaging': ['direct imaging', 'direct detection', 'coronagraph'],
            'habitable zone': ['habitable zone', 'hz', 'goldilocks zone', 'circumstellar habitable zone'],
            'insolation': ['insolation', 'stellar flux', 'irradiance', 'incident flux'],
            
            // Additional Cosmology Terms
            'scale factor': ['scale factor', 'a', 'cosmic scale', 'expansion factor'],
            'redshift z': ['redshift z', 'z', 'cosmological redshift', 'cosmic z'],
            'reionization': ['reionization', 'reionisation', 'epoch of reionization'],
            'dark age': ['dark age', 'dark ages', 'cosmic dark age'],
            'big bang': ['big bang', 'bb', 'big bang theory', 'cosmological model'],
            'inflation': ['inflation', 'cosmic inflation', 'inflationary epoch'],
            'baryon acoustic oscillations': ['bao', 'baryon acoustic oscillations', 'acoustic peaks'],
            'cmb anisotropy': ['cmb anisotropy', 'cmb fluctuations', 'cosmic microwave background'],
            
            // Additional Relativity Terms
            'general relativity': ['general relativity', 'gr', 'einstein', 'general theory'],
            'special relativity': ['special relativity', 'sr', 'lorentz', 'special theory'],
            'spacetime': ['spacetime', 'space time', 'space-time', 'four dimensional'],
            'metric': ['metric', 'spacetime metric', 'metric tensor'],
            'geodesic': ['geodesic', 'geodesic path', 'straightest path'],
            'gravitational wave': ['gravitational wave', 'gw', 'gravitational radiation', 'ripple'],
            'frame dragging': ['frame dragging', 'lense thirring', 'gravitomagnetism'],
            
            // Additional Optics Terms
            'diffraction': ['diffraction', 'diffraction limit', 'airy disk', 'airy pattern'],
            'rayleigh criterion': ['rayleigh criterion', 'rayleigh limit', 'resolution limit'],
            'dawes limit': ['dawes limit', 'dawes', 'visual resolution'],
            'seeing': ['seeing', 'atmospheric seeing', 'seeing disk', 'turbulence'],
            'adaptive optics': ['adaptive optics', 'ao', 'wavefront correction'],
            'interferometry': ['interferometry', 'interferometer', 'baseline', 'vlbi'],
            
            // Additional Spectroscopy Terms
            'doppler broadening': ['doppler broadening', 'thermal broadening', 'line broadening'],
            'natural broadening': ['natural broadening', 'natural width', 'intrinsic width'],
            'pressure broadening': ['pressure broadening', 'collisional broadening', 'stark broadening'],
            'rotational broadening': ['rotational broadening', 'v sin i', 'vsini'],
            'zeeman effect': ['zeeman effect', 'zeeman', 'magnetic splitting'],
            'fine structure': ['fine structure', 'fine structure splitting', 'fs'],
            'hyperfine structure': ['hyperfine structure', 'hfs', 'hyperfine'],
            
            // Additional High Energy Terms
            'inverse compton': ['inverse compton', 'ics', 'inverse compton scattering'],
            'compton scattering': ['compton scattering', 'compton', 'compton effect'],
            'synchrotron self absorption': ['ssa', 'synchrotron self absorption', 'self absorption'],
            'cooling break': ['cooling break', 'cooling frequency', 'break frequency'],
            'maxwellian': ['maxwellian', 'maxwell distribution', 'thermal distribution'],
            'power law distribution': ['power law distribution', 'non thermal', 'nonthermal'],
            
            // Additional Planetary Terms
            'roche lobe': ['roche lobe', 'roche radius', 'critical radius'],
            'hill sphere': ['hill sphere', 'roche sphere', 'gravitational sphere'],
            'libration': ['libration', 'librational motion', 'tadpole orbit'],
            'resonance': ['resonance', 'orbital resonance', 'mean motion resonance'],
            'tidal heating': ['tidal heating', 'tidal dissipation', 'tidal friction'],
            'obliquity': ['obliquity', 'axial tilt', 'inclination'],
            
            // Additional Stellar Structure Terms
            'hydrostatic equilibrium': ['hydrostatic equilibrium', 'hse', 'pressure balance'],
            'virial theorem': ['virial theorem', 'virial', 'energy balance'],
            'lane emden': ['lane emden', 'polytrope', 'polytropic'],
            'convection': ['convection', 'convective', 'convective zone'],
            'radiation zone': ['radiation zone', 'radiative zone', 'radiative transfer'],
            'opacity': ['opacity', 'κ', 'kappa', 'absorption coefficient'],
            
            // Additional Magnitude Terms
            'bolometric magnitude': ['bolometric magnitude', 'mbol', 'total magnitude'],
            'visual magnitude': ['visual magnitude', 'mv', 'v magnitude'],
            'photometric magnitude': ['photometric magnitude', 'photometry', 'magnitude system'],
            'color magnitude diagram': ['cmd', 'color magnitude diagram', 'cm diagram'],
            'isochrone': ['isochrone', 'isochrones', 'stellar isochrone'],
            
            // Additional Variable Star Terms
            'cepheid': ['cepheid', 'cepheid variable', 'classical cepheid'],
            'rr lyrae': ['rr lyrae', 'rr lyrae variable', 'rr lyr'],
            'mira': ['mira', 'mira variable', 'long period variable'],
            'delta scuti': ['delta scuti', 'δ scuti', 'dscuti'],
            'beta cephei': ['beta cephei', 'β cephei', 'bcephei'],
            'pulsation': ['pulsation', 'pulsating', 'radial pulsation'],
            
            // Additional Distance Ladder Terms
            'distance ladder': ['distance ladder', 'cosmic distance ladder', 'distance scale'],
            'standard candle': ['standard candle', 'standard candles', 'calibrated candle'],
            'standard ruler': ['standard ruler', 'standard rulers', 'geometric distance'],
            'parallax method': ['parallax method', 'trigonometric parallax', 'geometric parallax'],
            'main sequence fitting': ['main sequence fitting', 'ms fitting', 'cluster distance'],
            'tip of the red giant branch': ['trgb', 'tip of the red giant branch', 'trgb distance'],
            
            // Additional Motion & Dynamics Terms
            'momentum': ['momentum', 'p', 'linear momentum', 'angular momentum'],
            'force': ['force', 'f', 'gravitational force', 'centripetal force'],
            'angular frequency': ['angular frequency', 'omega', 'ω', 'angular speed'],
            'orbital elements': ['orbital elements', 'keplerian elements', 'orbital parameters'],
            'eccentricity': ['eccentricity', 'e', 'orbit shape', 'ellipticity'],
            'inclination': ['inclination', 'i', 'orbital inclination', 'tilt'],
            'argument of periapsis': ['argument of periapsis', 'omega', 'ω', 'argument of perihelion'],
            'longitude of ascending node': ['longitude of ascending node', 'omega', 'Ω', 'node'],
            'true anomaly': ['true anomaly', 'nu', 'ν', 'orbital position'],
            'mean anomaly': ['mean anomaly', 'm', 'orbital phase'],
            'eccentric anomaly': ['eccentric anomaly', 'e', 'orbital angle'],
            
            // Additional Stellar Physics Terms
            'stellar evolution': ['stellar evolution', 'star evolution', 'stellar life cycle'],
            'nucleosynthesis': ['nucleosynthesis', 'fusion', 'nuclear fusion', 'stellar fusion'],
            'proton proton chain': ['pp chain', 'proton proton chain', 'pp cycle'],
            'cno cycle': ['cno cycle', 'carbon nitrogen oxygen', 'cno fusion'],
            'triple alpha': ['triple alpha', '3α', 'helium burning'],
            'main sequence turnoff': ['main sequence turnoff', 'turnoff point', 'ms turnoff'],
            'red clump': ['red clump', 'rc', 'horizontal branch clump'],
            'planetary nebula': ['planetary nebula', 'pn', 'nebula'],
            'supernova type': ['supernova type', 'type ia', 'type ii', 'sn type'],
            'nova': ['nova', 'classical nova', 'dwarf nova'],
            'x ray binary': ['x ray binary', 'xrb', 'x ray source'],
            'accretion disk': ['accretion disk', 'accretion', 'disk'],
            'eddington luminosity': ['eddington luminosity', 'eddington limit', 'radiation pressure limit'],
            'schwarzschild metric': ['schwarzschild metric', 'schwarzschild solution', 'black hole metric'],
            'kerr metric': ['kerr metric', 'rotating black hole', 'kerr solution'],
            
            // Additional Cosmological Terms
            'de sitter': ['de sitter', 'de sitter space', 'exponential expansion'],
            'friedmann robertson walker': ['frw', 'friedmann robertson walker', 'frw metric'],
            'comoving coordinates': ['comoving coordinates', 'comoving frame', 'comoving'],
            'proper time': ['proper time', 'tau', 'τ', 'cosmic time'],
            'conformal time': ['conformal time', 'eta', 'η', 'conformal'],
            'particle horizon': ['particle horizon', 'cosmic horizon', 'observable universe'],
            'apparent horizon': ['apparent horizon', 'trapped surface'],
            'cosmic variance': ['cosmic variance', 'sample variance', 'cosmological variance'],
            'baryon acoustic scale': ['bao scale', 'baryon acoustic scale', 'sound horizon'],
            'last scattering': ['last scattering', 'recombination', 'cmb last scattering'],
            'decoupling': ['decoupling', 'photon decoupling', 'matter radiation decoupling'],
            
            // Additional Spectroscopy Terms
            'line profile': ['line profile', 'spectral line profile', 'line shape'],
            'gaussian profile': ['gaussian profile', 'gaussian line', 'thermal broadening'],
            'lorentzian profile': ['lorentzian profile', 'lorentzian line', 'natural broadening'],
            'voigt profile': ['voigt profile', 'voigt line', 'combined profile'],
            'full width half maximum': ['fwhm', 'full width half maximum', 'line width'],
            'radial velocity curve': ['radial velocity curve', 'rv curve', 'velocity curve'],
            'orbital solution': ['orbital solution', 'keplerian fit', 'orbit fit'],
            'mass function': ['mass function', 'binary mass function', 'minimum mass'],
            'spectral classification': ['spectral classification', 'spectral type', 'mk classification'],
            'luminosity class': ['luminosity class', 'yerkes classification', 'mk class'],
            'saha equation': ['saha equation', 'ionization equilibrium', 'saha'],
            'boltzmann distribution': ['boltzmann distribution', 'maxwell boltzmann', 'thermal distribution'],
            
            // Additional Exoplanet Detection Terms
            'transit depth': ['transit depth', 'delta', 'δ', 'dip'],
            'transit duration': ['transit duration', 'transit time', 'eclipse duration'],
            'impact parameter': ['impact parameter', 'b', 'transit geometry'],
            'limb darkening': ['limb darkening', 'u', 'stellar limb'],
            'rossiter mclaughlin': ['rossiter mclaughlin', 'rm effect', 'spin orbit'],
            'doppler beaming': ['doppler beaming', 'relativistic beaming', 'beaming'],
            'ellipsoidal variation': ['ellipsoidal variation', 'tidal distortion', 'ellipsoidal'],
            'reflection modulation': ['reflection modulation', 'phase curve', 'albedo variation'],
            'secondary eclipse': ['secondary eclipse', 'occultation', 'planet eclipse'],
            'atmospheric transmission': ['atmospheric transmission', 'transmission spectrum', 'atmosphere'],
            'emission spectrum': ['emission spectrum', 'thermal emission', 'planet emission'],
            
            // Additional High Energy Terms
            'compton y parameter': ['compton y', 'y parameter', 'comptonization'],
            'synchrotron self compton': ['ssc', 'synchrotron self compton', 'ssc scattering'],
            'inverse compton scattering': ['ics', 'inverse compton', 'compton upscattering'],
            'thomson scattering': ['thomson scattering', 'thomson', 'electron scattering'],
            'klein nishina': ['klein nishina', 'kn scattering', 'relativistic scattering'],
            'bremsstrahlung': ['bremsstrahlung', 'free free', 'thermal bremsstrahlung'],
            'pair production': ['pair production', 'gamma gamma', 'pair creation'],
            'photoionization': ['photoionization', 'photoion', 'ionization'],
            'photodisintegration': ['photodisintegration', 'photodissociation', 'nuclear breakup'],
            'hadronic interaction': ['hadronic', 'proton proton', 'pp interaction'],
            'pion decay': ['pion decay', 'pi decay', 'neutral pion'],
            'gamma ray attenuation': ['gamma ray attenuation', 'gamma absorption', 'pair opacity'],
            
            // Additional Relativistic Terms
            'proper distance': ['proper distance', 'physical distance', 'comoving distance'],
            'comoving volume': ['comoving volume', 'comoving', 'volume element'],
            'redshift space distortion': ['rsd', 'redshift space distortion', 'peculiar velocity'],
            'peculiar velocity': ['peculiar velocity', 'peculiar motion', 'local motion'],
            'hubble flow': ['hubble flow', 'hubble expansion', 'cosmic flow'],
            'virial mass': ['virial mass', 'virial theorem', 'dynamical mass'],
            'toomre q': ['toomre q', 'toomre parameter', 'disk stability'],
            'spiral density wave': ['spiral density wave', 'density wave theory', 'spiral arm'],
            
            // Additional Planetary Terms
            'libration point': ['libration point', 'lagrange point', 'l point'],
            'trojan asteroid': ['trojan', 'trojan asteroid', 'lagrange point asteroid'],
            'secular resonance': ['secular resonance', 'long term resonance', 'apsidal resonance'],
            'chaos': ['chaos', 'chaotic motion', 'orbital chaos'],
            'kirkwood gap': ['kirkwood gap', 'resonance gap', 'asteroid gap'],
            'yarkovsky effect': ['yarkovsky effect', 'yarkovsky', 'thermal force'],
            'yorp effect': ['yorp effect', 'yorp', 'radiation torque'],
            'poynting robertson': ['poynting robertson', 'pr drag', 'radiation drag'],
            
            // Additional Stellar Structure Terms
            'lane emden equation': ['lane emden', 'polytrope', 'polytropic equation'],
            'emden function': ['emden function', 'polytropic function', 'stellar structure'],
            'isothermal sphere': ['isothermal sphere', 'isothermal', 'constant temperature'],
            'plummer model': ['plummer model', 'plummer sphere', 'softened potential'],
            'king model': ['king model', 'king profile', 'truncated isothermal'],
            'hernquist profile': ['hernquist profile', 'hernquist model', 'galaxy profile'],
            'nfw profile': ['nfw', 'navarro frenk white', 'nfw halo'],
            'einasto profile': ['einasto profile', 'einasto', 'alpha profile'],
            
            // Additional Magnitude & Photometry Terms
            'extinction': ['extinction', 'a', 'interstellar extinction', 'dust'],
            'reddening': ['reddening', 'e', 'color excess', 'b v'],
            'selective extinction': ['selective extinction', 'r', 'rv', 'extinction law'],
            'cardelli law': ['cardelli law', 'cardelli', 'extinction curve'],
            'k correction': ['k correction', 'k correction', 'redshift correction'],
            'surface brightness': ['surface brightness', 'mu', 'μ', 'brightness per area'],
            'surface brightness fluctuation': ['sbf', 'surface brightness fluctuation', 'distance indicator'],
            
            // Additional Binary & Multiple System Terms
            'mass ratio': ['mass ratio', 'q', 'binary mass ratio'],
            'orbital separation': ['orbital separation', 'a', 'semi major axis', 'binary separation'],
            'common envelope': ['common envelope', 'ce', 'envelope ejection'],
            'mass transfer': ['mass transfer', 'accretion', 'roche lobe overflow'],
            'conservative mass transfer': ['conservative', 'mass conservation', 'stable transfer'],
            'non conservative': ['non conservative', 'mass loss', 'wind'],
            'thermal timescale': ['thermal timescale', 'kelvin helmholtz', 'kh timescale'],
            'dynamical timescale': ['dynamical timescale', 'free fall', 'crossing time'],
            'nuclear timescale': ['nuclear timescale', 'fusion timescale', 'burning time'],
            'merger product': ['merger product', 'merged star', 'coalescence product'],
            
            // Additional Variable Star Terms
            'period luminosity': ['period luminosity', 'pl relation', 'cepheid pl'],
            'leavitt law': ['leavitt law', 'cepheid relation', 'period luminosity'],
            'wesenheit function': ['wesenheit function', 'wesenheit', 'reddening free'],
            'fourier decomposition': ['fourier decomposition', 'fourier', 'light curve analysis'],
            'o c diagram': ['o c diagram', 'observed calculated', 'period change'],
            'blazhko effect': ['blazhko effect', 'blazhko', 'modulation'],
            'double mode': ['double mode', 'beat cepheid', 'multimode'],
            'radial mode': ['radial mode', 'fundamental mode', 'first overtone'],
            'non radial': ['non radial', 'g mode', 'p mode'],
            
            // Additional Distance Measurement Terms
            'spectroscopic parallax': ['spectroscopic parallax', 'spectroscopic distance', 'hr distance'],
            'moving cluster': ['moving cluster', 'convergent point', 'cluster parallax'],
            'statistical parallax': ['statistical parallax', 'secular parallax', 'proper motion'],
            'barycentric parallax': ['barycentric parallax', 'solar parallax', 'au'],
            'dynamical parallax': ['dynamical parallax', 'binary parallax', 'orbital parallax'],
            'expansion parallax': ['expansion parallax', 'nebular parallax', 'pn parallax'],
            'light echo': ['light echo', 'echo', 'reflected light'],
            'reverberation mapping': ['reverberation mapping', 'reverberation', 'echo mapping'],
            
            // Additional Cosmological Distance Terms
            'transverse comoving': ['transverse comoving', 'dm', 'angular distance'],
            'light travel distance': ['light travel distance', 'lookback distance', 'light cone'],
            'particle horizon distance': ['particle horizon', 'horizon distance', 'causal horizon'],
            'event horizon distance': ['event horizon distance', 'future horizon', 'cosmic horizon'],
            
            // Additional Stellar Classification Terms
            'metallicity': ['metallicity', 'z', '[fe h]', 'metal abundance'],
            'alpha enhancement': ['alpha enhancement', '[α fe]', 'alpha elements'],
            'carbon enhancement': ['carbon enhancement', '[c fe]', 'carbon star'],
            's process': ['s process', 'slow neutron', 's process element'],
            'r process': ['r process', 'rapid neutron', 'r process element'],
            'p process': ['p process', 'proton capture', 'p nuclide'],
            
            // Additional Telescope & Instrumentation Terms
            'point spread function': ['psf', 'point spread function', 'seeing profile'],
            'strehl ratio': ['strehl ratio', 'image quality', 'adaptive optics'],
            'contrast ratio': ['contrast ratio', 'dynamic range', 'detection limit'],
            'signal to noise': ['snr', 'signal to noise', 's n ratio'],
            'integration time': ['integration time', 'exposure time', 'integration'],
            'read noise': ['read noise', 'detector noise', 'readout noise'],
            'dark current': ['dark current', 'dark signal', 'thermal noise'],
            'quantum efficiency': ['qe', 'quantum efficiency', 'detector efficiency'],
            'full well capacity': ['full well', 'saturation', 'well depth'],
            
            // Additional Observational Terms
            'airmass': ['airmass', 'sec z', 'atmospheric path'],
            'extinction coefficient': ['extinction coefficient', 'k', 'atmospheric extinction'],
            'scintillation': ['scintillation', 'twinkling', 'atmospheric scintillation'],
            'differential photometry': ['differential photometry', 'relative photometry', 'comparison'],
            'all sky photometry': ['all sky', 'absolute photometry', 'standard'],
            'photometric system': ['photometric system', 'ubv', 'johnson', 'cousins'],
            'color transformation': ['color transformation', 'color term', 'photometric transformation'],
            'standard star': ['standard star', 'photometric standard', 'calibration'],
            'flat field': ['flat field', 'flat', 'illumination correction'],
            
            // Additional Data Analysis Terms
            'chi squared': ['chi squared', 'χ²', 'goodness of fit', 'chisq'],
            'reduced chi squared': ['reduced chi squared', 'reduced χ²', 'chi squared nu'],
            'maximum likelihood': ['maximum likelihood', 'ml', 'likelihood'],
            'bayesian': ['bayesian', 'bayes', 'posterior', 'prior'],
            'markov chain monte carlo': ['mcmc', 'markov chain', 'monte carlo'],
            'parameter estimation': ['parameter estimation', 'fitting', 'optimization'],
            'uncertainty': ['uncertainty', 'error', 'sigma', 'confidence'],
            'systematic error': ['systematic error', 'bias', 'systematic'],
            'random error': ['random error', 'statistical error', 'noise'],
            'propagation of errors': ['error propagation', 'uncertainty propagation', 'error analysis']
        };
        
        // Match concepts with improved accuracy (word boundary matching)
        for (const [concept, synonyms] of Object.entries(physicsTerms)) {
            for (const syn of synonyms) {
                const synLower = syn.toLowerCase();
                // Exact match (highest priority)
                if (searchLower === synLower) {
                    result.concepts.push(concept);
                    break;
                }
                // Word boundary match (better accuracy)
                const wordBoundaryRegex = new RegExp(`\\b${synLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                if (wordBoundaryRegex.test(searchLower)) {
                    result.concepts.push(concept);
                    break;
                }
                // Partial match (lower priority, but still valid)
                if (searchLower.includes(synLower) && synLower.length >= 3) {
                    result.concepts.push(concept);
                    break;
                }
            }
        }
        
        // Remove duplicate concepts
        result.concepts = [...new Set(result.concepts)];
        
        // Extract variable symbols mentioned
        const allVarSymbols = new Set();
        formulas.forEach(f => {
            f.variables.forEach(v => {
                allVarSymbols.add(v.symbol.toLowerCase());
                allVarSymbols.add(v.name.toLowerCase());
            });
        });
        
        allVarSymbols.forEach(symbol => {
            if (searchLower.includes(symbol) || searchWords.includes(symbol)) {
                result.variables.push(symbol);
            }
        });
        
        return result;
    }
    
    // Match question to formula using semantic understanding
    function matchQuestionToFormula(formula, parsedQuery, searchLower, searchWords) {
        let score = 0;
        let reason = '';
        const formulaId = formula.id;
        const nameLower = formula.name.toLowerCase();
        const descLower = formula.description.toLowerCase();
        
        // Question-to-formula mapping based on common questions
        const questionPatterns = {
            // Velocity questions
            'how fast': {
                formulas: ['orbital_velocity', 'escape_velocity', 'rotational_velocity', 'vis_viva'],
                score: 400
            },
            'what is the velocity': {
                formulas: ['orbital_velocity', 'escape_velocity', 'rotational_velocity', 'vis_viva'],
                score: 400
            },
            'calculate velocity': {
                formulas: ['orbital_velocity', 'escape_velocity', 'rotational_velocity', 'vis_viva'],
                score: 400
            },
            
            // Distance questions
            'how far': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance'],
                score: 400
            },
            'what is the distance': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance'],
                score: 400
            },
            'distance to star': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance', 'angular_size_distance'],
                score: 650
            },
            'distance to': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance'],
                score: 500
            },
            'find distance': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance'],
                score: 400
            },
            
            // Period questions
            'how long': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'stellar_lifetime', 'synodic_period', 'white_dwarf_merger_timescale'],
                score: 400
            },
            'what is the period': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'synodic_period', 'binary_white_dwarf'],
                score: 400
            },
            'orbital period': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary', 'binary_white_dwarf'],
                score: 500
            },
            'period of white dwarves': {
                formulas: ['binary_white_dwarf'],
                score: 700
            },
            'period of white dwarf': {
                formulas: ['binary_white_dwarf'],
                score: 700
            },
            'white dwarf period': {
                formulas: ['binary_white_dwarf'],
                score: 650
            },
            
            // Temperature questions
            'what is the temperature': {
                formulas: ['wiens_law', 'flux_temperature', 'planetary_equilibrium_temperature'],
                score: 400
            },
            'temperature of white dwarfs': {
                formulas: ['wiens_law', 'flux_temperature'],
                score: 700
            },
            'temperature of white dwarf': {
                formulas: ['wiens_law', 'flux_temperature'],
                score: 700
            },
            'how hot': {
                formulas: ['wiens_law', 'flux_temperature', 'planetary_equilibrium_temperature'],
                score: 400
            },
            'temperature of': {
                formulas: ['wiens_law', 'flux_temperature', 'planetary_equilibrium_temperature'],
                score: 350
            },
            
            // Brightness/Luminosity questions
            'how bright': {
                formulas: ['luminosity', 'flux_from_luminosity', 'inverse_square_law_brightness', 'magnitude_flux_relation'],
                score: 400
            },
            'how bright is the star': {
                formulas: ['luminosity', 'flux_from_luminosity', 'inverse_square_law_brightness', 'magnitude_flux_relation', 'apparent_magnitude', 'absolute_magnitude'],
                score: 700
            },
            'how bright is': {
                formulas: ['luminosity', 'flux_from_luminosity', 'inverse_square_law_brightness', 'magnitude_flux_relation'],
                score: 500
            },
            'what is the luminosity': {
                formulas: ['luminosity', 'flux_from_luminosity'],
                score: 400
            },
            'brightness': {
                formulas: ['luminosity', 'flux_from_luminosity', 'inverse_square_law_brightness', 'magnitude_flux_relation'],
                score: 350
            },
            
            // Mass questions
            'what is the mass': {
                formulas: ['chandrasekhar_limit', 'jeans_mass', 'center_of_mass'],
                score: 400
            },
            'determine the mass': {
                formulas: ['chandrasekhar_limit', 'jeans_mass', 'kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary'],
                score: 500
            },
            'determine the mass of the planet': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary', 'orbital_velocity'],
                score: 700
            },
            'mass of the planet': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary', 'orbital_velocity'],
                score: 650
            },
            'how much mass': {
                formulas: ['chandrasekhar_limit', 'jeans_mass'],
                score: 400
            },
            
            // Gravity questions
            'what is the gravity': {
                formulas: ['surface_gravity', 'escape_velocity'],
                score: 400
            },
            'surface gravity': {
                formulas: ['surface_gravity'],
                score: 500
            },
            
            // Escape questions
            'escape': {
                formulas: ['escape_velocity'],
                score: 500
            },
            'escape velocity': {
                formulas: ['escape_velocity'],
                score: 600
            },
            'escape velocity of': {
                formulas: ['escape_velocity'],
                score: 650
            },
            'escape velocity of earth': {
                formulas: ['escape_velocity'],
                score: 700
            },
            'leave planet': {
                formulas: ['escape_velocity'],
                score: 500
            },
            
            // Redshift questions
            'redshift': {
                formulas: ['cosmic_redshift', 'doppler_shift', 'doppler_shift_approx'],
                score: 500
            },
            // Orbital decay questions
            'rate of orbital decay': {
                formulas: ['white_dwarf_orbital_decay'],
                score: 700
            },
            'orbital decay rate': {
                formulas: ['white_dwarf_orbital_decay'],
                score: 700
            },
            'how fast is orbit shrinking': {
                formulas: ['white_dwarf_orbital_decay'],
                score: 700
            },
            // Merger questions
            'how long will it take to merge': {
                formulas: ['white_dwarf_merger_timescale'],
                score: 700
            },
            'merger timescale': {
                formulas: ['white_dwarf_merger_timescale'],
                score: 700
            },
            'time until merger': {
                formulas: ['white_dwarf_merger_timescale'],
                score: 700
            },
            // Transit questions
            'transit depth': {
                formulas: ['transit_depth'],
                score: 600
            },
            'inclination from transit': {
                formulas: ['transit_depth'],
                score: 700
            },
            'transit depth inclination': {
                formulas: ['transit_depth'],
                score: 700
            },
            'doppler': {
                formulas: ['doppler_shift', 'doppler_shift_approx'],
                score: 500
            },
            'how fast is the system moving': {
                formulas: ['radial_velocity_wavelength', 'radial_velocity_frequency', 'doppler_shift'],
                score: 700
            },
            'how fast is system moving from earth': {
                formulas: ['radial_velocity_wavelength', 'radial_velocity_frequency'],
                score: 700
            },
            'velocity from spectrum': {
                formulas: ['radial_velocity_wavelength', 'radial_velocity_frequency'],
                score: 700
            },
            
            // Wavelength questions
            'wavelength': {
                formulas: ['wiens_law', 'planck_relation', 'doppler_shift'],
                score: 400
            },
            'peak wavelength': {
                formulas: ['wiens_law'],
                score: 600
            },
            
            // Energy questions
            'energy': {
                formulas: ['orbital_energy', 'planck_relation'],
                score: 350
            },
            'photon energy': {
                formulas: ['planck_relation'],
                score: 600
            },
            'total orbital energy': {
                formulas: ['orbital_energy'],
                score: 700
            },
            'orbital energy of system': {
                formulas: ['orbital_energy'],
                score: 700
            },
            'orbital energy': {
                formulas: ['orbital_energy'],
                score: 600
            },
            
            // Size/Radius questions
            'how big': {
                formulas: ['angular_size', 'angular_diameter_distance'],
                score: 400
            },
            'what is the size': {
                formulas: ['angular_size', 'angular_diameter_distance'],
                score: 400
            },
            'angular size': {
                formulas: ['angular_size', 'angular_diameter_distance'],
                score: 500
            },
            
            // Magnitude questions
            'what is the magnitude': {
                formulas: ['distance_modulus', 'hr_absolute_magnitude', 'magnitude_flux_relation'],
                score: 400
            },
            'apparent magnitude': {
                formulas: ['distance_modulus', 'magnitude_flux_relation'],
                score: 500
            },
            'apparent magnitude with extinction': {
                formulas: ['distance_modulus'],
                score: 700
            },
            'absolute magnitude': {
                formulas: ['distance_modulus', 'hr_absolute_magnitude'],
                score: 500
            },
            
            // Lifetime questions
            'how long does a star live': {
                formulas: ['stellar_lifetime'],
                score: 600
            },
            'stellar lifetime': {
                formulas: ['stellar_lifetime'],
                score: 500
            },
            'main sequence lifetime': {
                formulas: ['stellar_lifetime'],
                score: 600
            },
            
            // Density questions
            'what is the density': {
                formulas: ['average_density', 'critical_density', 'density_parameter'],
                score: 400
            },
            'average density': {
                formulas: ['average_density'],
                score: 500
            },
            
            // Flux questions
            'what is the flux': {
                formulas: ['flux_from_luminosity', 'flux_temperature', 'inverse_square_law_brightness'],
                score: 400
            },
            'observed flux': {
                formulas: ['flux_from_luminosity', 'inverse_square_law_brightness'],
                score: 500
            },
            
            // Radius questions
            'what is the radius': {
                formulas: ['schwarzschild_radius', 'white_dwarf_mass_radius', 'hill_radius'],
                score: 400
            },
            'schwarzschild radius': {
                formulas: ['schwarzschild_radius'],
                score: 600
            },
            'event horizon': {
                formulas: ['schwarzschild_radius'],
                score: 600
            },
            
            // Orbital mechanics questions
            'how to find orbital period': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar'],
                score: 600
            },
            'calculate orbital period': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar'],
                score: 500
            },
            
            // Specific use case questions
            'how to find distance to star': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus'],
                score: 600
            },
            'distance to star': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus'],
                score: 500
            },
            'how to find star distance': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus'],
                score: 600
            },
            
            'how to calculate temperature from wavelength': {
                formulas: ['wiens_law'],
                score: 600
            },
            'temperature from wavelength': {
                formulas: ['wiens_law'],
                score: 500
            },
            
            'how to find luminosity from flux': {
                formulas: ['flux_from_luminosity'],
                score: 600
            },
            'luminosity from flux': {
                formulas: ['flux_from_luminosity'],
                score: 500
            },
            
            // Kepler's Law questions
            'kepler third law': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary'],
                score: 600
            },
            'kepler 3': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary'],
                score: 600
            },
            'period squared': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar'],
                score: 500
            },
            'p2 a3': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar'],
                score: 600
            },
            
            // Tidal questions
            'tidal force': {
                formulas: ['tidal_force', 'roche_limit'],
                score: 500
            },
            'roche limit': {
                formulas: ['roche_limit'],
                score: 600
            },
            'tidal disruption': {
                formulas: ['roche_limit', 'tidal_force'],
                score: 500
            },
            'tidal locking': {
                formulas: ['tidal_locking_timescale'],
                score: 600
            },
            
            // Binary system questions
            'binary star': {
                formulas: ['kepler_third_law_binary', 'binary_white_dwarf', 'center_of_mass'],
                score: 500
            },
            'binary system': {
                formulas: ['kepler_third_law_binary', 'binary_white_dwarf', 'center_of_mass'],
                score: 500
            },
            'white dwarf binary': {
                formulas: ['binary_white_dwarf', 'white_dwarf_orbital_decay', 'white_dwarf_merger_timescale'],
                score: 600
            },
            'orbital decay': {
                formulas: ['white_dwarf_orbital_decay'],
                score: 600
            },
            'merger timescale': {
                formulas: ['white_dwarf_merger_timescale'],
                score: 600
            },
            
            // Spectroscopy questions
            'equivalent width': {
                formulas: ['equivalent_width'],
                score: 600
            },
            'line strength': {
                formulas: ['equivalent_width'],
                score: 500
            },
            'absorption line': {
                formulas: ['equivalent_width', 'doppler_shift'],
                score: 400
            },
            'spectral line': {
                formulas: ['equivalent_width', 'doppler_shift'],
                score: 400
            },
            
            // Exoplanet questions
            'exoplanet temperature': {
                formulas: ['planetary_equilibrium_temperature'],
                score: 600
            },
            'planet temperature': {
                formulas: ['planetary_equilibrium_temperature'],
                score: 500
            },
            'transit depth': {
                formulas: ['planetary_equilibrium_temperature'],
                score: 400
            },
            'albedo': {
                formulas: ['albedo'],
                score: 600
            },
            'greenhouse effect': {
                formulas: ['greenhouse_effect'],
                score: 600
            },
            
            // High energy questions
            'synchrotron': {
                formulas: ['synchrotron_power', 'synchrotron_cooling_timescale', 'magnetic_energy_density'],
                score: 500
            },
            'synchrotron cooling': {
                formulas: ['synchrotron_cooling_timescale'],
                score: 600
            },
            'synchrotron power': {
                formulas: ['synchrotron_power'],
                score: 600
            },
            'magnetic field': {
                formulas: ['magnetic_energy_density', 'synchrotron_power'],
                score: 500
            },
            'power law spectrum': {
                formulas: ['power_law_spectrum', 'spectral_index'],
                score: 600
            },
            'spectral index': {
                formulas: ['spectral_index', 'power_law_spectrum'],
                score: 600
            },
            'gamma ray': {
                formulas: ['max_gamma_bohm', 'cooling_break_gamma'],
                score: 500
            },
            
            // Relativity questions
            'event horizon': {
                formulas: ['schwarzschild_radius'],
                score: 600
            },
            'black hole size': {
                formulas: ['schwarzschild_radius'],
                score: 600
            },
            'gravitational lensing': {
                formulas: ['einstein_radius'],
                score: 600
            },
            'lensing': {
                formulas: ['einstein_radius'],
                score: 500
            },
            'einstein ring': {
                formulas: ['einstein_radius'],
                score: 600
            },
            'time dilation': {
                formulas: ['time_dilation'],
                score: 600
            },
            'length contraction': {
                formulas: ['length_contraction'],
                score: 600
            },
            
            // Cosmology questions
            'hubble constant': {
                formulas: ['hubble_law', 'cosmic_redshift'],
                score: 600
            },
            'hubble law': {
                formulas: ['hubble_law'],
                score: 600
            },
            'universe expansion': {
                formulas: ['hubble_law', 'cosmic_redshift', 'lookback_time'],
                score: 500
            },
            'critical density': {
                formulas: ['critical_density', 'density_parameter'],
                score: 500
            },
            'density parameter': {
                formulas: ['density_parameter', 'critical_density'],
                score: 600
            },
            'lookback time': {
                formulas: ['lookback_time'],
                score: 600
            },
            'friedmann equation': {
                formulas: ['friedmann_equation'],
                score: 600
            },
            
            // Telescope questions
            'angular resolution': {
                formulas: ['angular_resolution'],
                score: 600
            },
            'resolving power': {
                formulas: ['angular_resolution'],
                score: 500
            },
            'light gathering power': {
                formulas: ['light_gathering_power'],
                score: 600
            },
            'telescope aperture': {
                formulas: ['light_gathering_power', 'angular_resolution'],
                score: 500
            },
            'f ratio': {
                formulas: ['f_ratio'],
                score: 600
            },
            'focal ratio': {
                formulas: ['f_ratio'],
                score: 500
            },
            'magnification': {
                formulas: ['magnification'],
                score: 600
            },
            
            // Stellar structure questions
            'hydrostatic equilibrium': {
                formulas: ['hydrostatic_balance'],
                score: 600
            },
            'pressure balance': {
                formulas: ['hydrostatic_balance'],
                score: 500
            },
            
            // HR Diagram questions
            'hr diagram': {
                formulas: ['hr_color_index', 'hr_absolute_magnitude'],
                score: 500
            },
            'color index': {
                formulas: ['hr_color_index'],
                score: 600
            },
            'b-v': {
                formulas: ['hr_color_index'],
                score: 600
            },
            'hertzsprung russell': {
                formulas: ['hr_color_index', 'hr_absolute_magnitude'],
                score: 500
            },
            
            // Mass-Luminosity questions
            'mass luminosity relation': {
                formulas: ['mass_luminosity_relation'],
                score: 600
            },
            'ml relation': {
                formulas: ['mass_luminosity_relation'],
                score: 600
            },
            
            // Distance measurement questions
            'distance modulus': {
                formulas: ['distance_modulus'],
                score: 600
            },
            'photometric distance': {
                formulas: ['distance_modulus', 'luminosity_distance'],
                score: 500
            },
            'standard candle': {
                formulas: ['luminosity_distance', 'distance_modulus'],
                score: 500
            },
            'flux distance': {
                formulas: ['luminosity_distance'],
                score: 500
            },
            
            // Angular momentum questions
            'angular momentum': {
                formulas: ['angular_momentum_elliptical'],
                score: 600
            },
            'elliptical orbit': {
                formulas: ['angular_momentum_elliptical', 'kepler_third_law'],
                score: 500
            },
            
            // Hill radius questions
            'hill radius': {
                formulas: ['hill_radius'],
                score: 600
            },
            'sphere of influence': {
                formulas: ['hill_radius'],
                score: 600
            },
            
            // Synodic period questions
            'synodic period': {
                formulas: ['synodic_period'],
                score: 600
            },
            'apparent period': {
                formulas: ['synodic_period'],
                score: 500
            },
            
            // Jeans mass questions
            'jeans mass': {
                formulas: ['jeans_mass'],
                score: 600
            },
            'gravitational collapse': {
                formulas: ['jeans_mass'],
                score: 500
            },
            
            // Center of mass questions
            'center of mass': {
                formulas: ['center_of_mass'],
                score: 600
            },
            'barycenter': {
                formulas: ['center_of_mass'],
                score: 600
            },
            
            // White dwarf questions
            'white dwarf radius': {
                formulas: ['white_dwarf_mass_radius'],
                score: 600
            },
            'white dwarf mass': {
                formulas: ['white_dwarf_mass_radius', 'chandrasekhar_limit'],
                score: 500
            },
            'chandrasekhar': {
                formulas: ['chandrasekhar_limit'],
                score: 600
            },
            
            // Wien's Law questions
            'wien law': {
                formulas: ['wiens_law'],
                score: 600
            },
            'wien displacement': {
                formulas: ['wiens_law'],
                score: 600
            },
            'temperature from peak wavelength': {
                formulas: ['wiens_law'],
                score: 600
            },
            'find temperature from peak wavelength': {
                formulas: ['wiens_law'],
                score: 700
            },
            'peak wavelength': {
                formulas: ['wiens_law'],
                score: 550
            },
            'find temperature from wavelength': {
                formulas: ['wiens_law'],
                score: 700
            },
            
            // Planck questions
            'planck relation': {
                formulas: ['planck_relation'],
                score: 600
            },
            'photon energy from wavelength': {
                formulas: ['planck_relation'],
                score: 600
            },
            
            // Inverse square law questions
            'inverse square law': {
                formulas: ['inverse_square_law_brightness', 'flux_from_luminosity'],
                score: 500
            },
            'brightness distance': {
                formulas: ['inverse_square_law_brightness'],
                score: 500
            },
            
            // Luminosity function questions
            'luminosity function': {
                formulas: ['luminosity_function'],
                score: 600
            },
            
            // Vis viva questions
            'vis viva': {
                formulas: ['vis_viva'],
                score: 600
            },
            'orbital energy': {
                formulas: ['orbital_energy', 'vis_viva'],
                score: 500
            },
            
            // Parsec and distance unit questions
            'parsec': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec'],
                score: 500
            },
            'light year': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus'],
                score: 400
            },
            'astronomical unit': {
                formulas: ['kepler_third_law', 'orbital_velocity'],
                score: 400
            },
            
            // Stellar evolution questions
            'main sequence star': {
                formulas: ['stellar_lifetime', 'mass_luminosity_relation', 'hr_absolute_magnitude'],
                score: 500
            },
            'giant star': {
                formulas: ['hr_absolute_magnitude', 'luminosity'],
                score: 400
            },
            'white dwarf mass': {
                formulas: ['white_dwarf_mass_radius', 'chandrasekhar_limit'],
                score: 600
            },
            'neutron star': {
                formulas: ['schwarzschild_radius'],
                score: 400
            },
            'black hole mass': {
                formulas: ['schwarzschild_radius'],
                score: 500
            },
            
            // Binary system specific questions
            'eclipsing binary': {
                formulas: ['binary_white_dwarf', 'kepler_third_law_binary'],
                score: 500
            },
            'spectroscopic binary': {
                formulas: ['doppler_shift', 'kepler_third_law_binary'],
                score: 500
            },
            'contact binary': {
                formulas: ['binary_white_dwarf', 'white_dwarf_merger_timescale'],
                score: 600
            },
            
            // Exoplanet detection questions
            'transit method': {
                formulas: ['planetary_equilibrium_temperature'],
                score: 400
            },
            'radial velocity method': {
                formulas: ['doppler_shift', 'doppler_shift_approx'],
                score: 500
            },
            'habitable zone': {
                formulas: ['planetary_equilibrium_temperature', 'flux_temperature'],
                score: 500
            },
            'exoplanet detection': {
                formulas: ['doppler_shift', 'planetary_equilibrium_temperature'],
                score: 400
            },
            
            // Cosmology specific questions
            'scale factor': {
                formulas: ['hubble_law', 'cosmic_redshift', 'lookback_time'],
                score: 500
            },
            'universe age': {
                formulas: ['hubble_law', 'lookback_time'],
                score: 500
            },
            'cosmic expansion': {
                formulas: ['hubble_law', 'cosmic_redshift', 'friedmann_equation'],
                score: 500
            },
            'dark matter': {
                formulas: ['critical_density', 'density_parameter'],
                score: 400
            },
            'dark energy': {
                formulas: ['critical_density', 'density_parameter', 'friedmann_equation'],
                score: 400
            },
            
            // Relativity specific questions
            'general relativity': {
                formulas: ['schwarzschild_radius', 'einstein_radius', 'time_dilation', 'length_contraction'],
                score: 400
            },
            'gravitational waves': {
                formulas: ['schwarzschild_radius', 'einstein_radius'],
                score: 400
            },
            'spacetime curvature': {
                formulas: ['einstein_radius', 'schwarzschild_radius'],
                score: 500
            },
            
            // Optics specific questions
            'diffraction limit': {
                formulas: ['angular_resolution'],
                score: 600
            },
            'rayleigh criterion': {
                formulas: ['angular_resolution'],
                score: 600
            },
            'seeing limit': {
                formulas: ['angular_resolution'],
                score: 500
            },
            'telescope resolution': {
                formulas: ['angular_resolution'],
                score: 600
            },
            'aperture size': {
                formulas: ['light_gathering_power', 'angular_resolution'],
                score: 500
            },
            
            // Spectroscopy specific questions
            'line broadening': {
                formulas: ['equivalent_width', 'doppler_shift'],
                score: 500
            },
            'doppler broadening': {
                formulas: ['doppler_shift', 'doppler_shift_approx'],
                score: 500
            },
            'rotational broadening': {
                formulas: ['rotational_velocity', 'doppler_shift'],
                score: 500
            },
            'zeeman effect': {
                formulas: ['doppler_shift'],
                score: 400
            },
            
            // High energy specific questions
            'inverse compton': {
                formulas: ['synchrotron_power', 'magnetic_energy_density'],
                score: 400
            },
            'cooling break': {
                formulas: ['cooling_break_gamma', 'cooling_break_frequency'],
                score: 600
            },
            'non thermal': {
                formulas: ['power_law_spectrum', 'spectral_index'],
                score: 500
            },
            'gamma ray burst': {
                formulas: ['max_gamma_bohm', 'synchrotron_cooling_timescale'],
                score: 400
            },
            
            // Planetary specific questions
            'roche lobe': {
                formulas: ['roche_limit'],
                score: 500
            },
            'tidal heating': {
                formulas: ['tidal_force', 'tidal_locking_timescale'],
                score: 500
            },
            'orbital resonance': {
                formulas: ['kepler_third_law', 'synodic_period'],
                score: 400
            },
            'hill sphere size': {
                formulas: ['hill_radius'],
                score: 500
            },
            
            // Stellar structure specific questions
            'virial theorem': {
                formulas: ['hydrostatic_balance', 'orbital_energy'],
                score: 400
            },
            'convection': {
                formulas: ['hydrostatic_balance'],
                score: 400
            },
            'opacity': {
                formulas: ['blackbody_radiation', 'flux_temperature'],
                score: 400
            },
            
            // Magnitude system questions
            'bolometric magnitude': {
                formulas: ['hr_absolute_magnitude', 'luminosity'],
                score: 500
            },
            'color magnitude diagram': {
                formulas: ['hr_color_index', 'hr_absolute_magnitude'],
                score: 600
            },
            'cmd': {
                formulas: ['hr_color_index', 'hr_absolute_magnitude'],
                score: 600
            },
            'isochrone': {
                formulas: ['hr_absolute_magnitude', 'stellar_lifetime'],
                score: 400
            },
            
            // Variable star questions
            'cepheid variable': {
                formulas: ['distance_modulus', 'luminosity'],
                score: 500
            },
            'rr lyrae variable': {
                formulas: ['distance_modulus', 'luminosity'],
                score: 500
            },
            'mira variable': {
                formulas: ['distance_modulus', 'luminosity'],
                score: 500
            },
            'pulsating star': {
                formulas: ['luminosity', 'stellar_lifetime'],
                score: 400
            },
            
            // Distance ladder questions
            'distance ladder': {
                formulas: ['parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance'],
                score: 500
            },
            'standard candle distance': {
                formulas: ['distance_modulus', 'luminosity_distance'],
                score: 600
            },
            'trigonometric parallax': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec'],
                score: 600
            },
            'cluster distance': {
                formulas: ['distance_modulus', 'hr_absolute_magnitude'],
                score: 500
            },
            
            // Additional specific calculation questions
            'how to find stellar mass': {
                formulas: ['kepler_third_law', 'kepler_third_law_binary', 'mass_luminosity_relation'],
                score: 600
            },
            'calculate stellar radius': {
                formulas: ['angular_size', 'luminosity', 'flux_temperature'],
                score: 500
            },
            'find stellar temperature': {
                formulas: ['wiens_law', 'flux_temperature', 'hr_color_index'],
                score: 500
            },
            'determine stellar age': {
                formulas: ['stellar_lifetime', 'hr_absolute_magnitude'],
                score: 500
            },
            'calculate orbital elements': {
                formulas: ['kepler_third_law', 'angular_momentum_elliptical', 'vis_viva'],
                score: 500
            },
            'find exoplanet mass': {
                formulas: ['doppler_shift', 'kepler_third_law'],
                score: 500
            },
            'calculate exoplanet radius': {
                formulas: ['planetary_equilibrium_temperature', 'angular_size'],
                score: 400
            },
            'determine galaxy distance': {
                formulas: ['hubble_law', 'cosmic_redshift', 'distance_modulus'],
                score: 500
            },
            'find black hole mass': {
                formulas: ['schwarzschild_radius', 'kepler_third_law'],
                score: 500
            },
            'calculate accretion rate': {
                formulas: ['luminosity', 'flux_from_luminosity'],
                score: 400
            },
            
            // Additional question patterns for new terms
            'orbital elements': {
                formulas: ['kepler_third_law', 'angular_momentum_elliptical', 'vis_viva'],
                score: 500
            },
            'stellar evolution': {
                formulas: ['stellar_lifetime', 'mass_luminosity_relation', 'hr_absolute_magnitude'],
                score: 500
            },
            'nucleosynthesis': {
                formulas: ['stellar_lifetime', 'luminosity'],
                score: 400
            },
            'accretion disk': {
                formulas: ['luminosity', 'flux_from_luminosity'],
                score: 500
            },
            'eddington luminosity': {
                formulas: ['luminosity'],
                score: 600
            },
            'line profile': {
                formulas: ['equivalent_width', 'doppler_shift'],
                score: 500
            },
            'fwhm': {
                formulas: ['equivalent_width', 'doppler_shift'],
                score: 500
            },
            'radial velocity curve': {
                formulas: ['doppler_shift', 'kepler_third_law_binary'],
                score: 600
            },
            'mass function': {
                formulas: ['kepler_third_law_binary', 'center_of_mass'],
                score: 600
            },
            'transit depth': {
                formulas: ['planetary_equilibrium_temperature'],
                score: 500
            },
            'secondary eclipse': {
                formulas: ['planetary_equilibrium_temperature'],
                score: 500
            },
            'compton scattering': {
                formulas: ['synchrotron_power', 'magnetic_energy_density'],
                score: 400
            },
            'bremsstrahlung': {
                formulas: ['synchrotron_power'],
                score: 400
            },
            'lagrange point': {
                formulas: ['hill_radius', 'roche_limit'],
                score: 500
            },
            'mass transfer': {
                formulas: ['binary_white_dwarf', 'roche_limit'],
                score: 500
            },
            'period luminosity relation': {
                formulas: ['distance_modulus', 'luminosity'],
                score: 600
            },
            'leavitt law': {
                formulas: ['distance_modulus', 'luminosity'],
                score: 600
            },
            'extinction': {
                formulas: ['distance_modulus', 'magnitude_flux_relation'],
                score: 500
            },
            'reddening': {
                formulas: ['hr_color_index', 'distance_modulus'],
                score: 500
            },
            'signal to noise': {
                formulas: ['angular_resolution', 'light_gathering_power'],
                score: 400
            },
            'psf': {
                formulas: ['angular_resolution'],
                score: 500
            },
            'chi squared': {
                formulas: ['distance_modulus', 'luminosity_distance'],
                score: 400
            },
            'uncertainty': {
                formulas: ['parallax_distance_arcsec', 'distance_modulus'],
                score: 400
            }
        };
        
        // Check question patterns
        for (const [pattern, data] of Object.entries(questionPatterns)) {
            if (searchLower.includes(pattern)) {
                if (data.formulas.includes(formulaId)) {
                    score += data.score;
                    if (!reason) {
                        reason = `Matches question pattern: "${pattern}"`;
                    }
                }
            }
        }
        
        // Concept-based matching with expanded mapping
        parsedQuery.concepts.forEach(concept => {
            // Map concepts to formula IDs with comprehensive coverage
            const conceptMap = {
                'velocity': ['orbital_velocity', 'escape_velocity', 'rotational_velocity', 'vis_viva'],
                'orbital velocity': ['orbital_velocity', 'vis_viva', 'kepler_third_law'],
                'escape velocity': ['escape_velocity'],
                'rotational velocity': ['rotational_velocity'],
                'vis viva': ['vis_viva', 'orbital_energy'],
                'distance': ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance', 'angular_diameter_distance'],
                'parallax': ['parallax_distance_radians', 'parallax_distance_arcsec'],
                'parallax distance': ['parallax_distance_radians', 'parallax_distance_arcsec'],
                'period': ['kepler_third_law', 'kepler_third_law_solar', 'synodic_period', 'rotational_velocity'],
                'orbital period': ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary'],
                'synodic period': ['synodic_period'],
                'temperature': ['wiens_law', 'flux_temperature', 'planetary_equilibrium_temperature', 'blackbody_radiation'],
                'luminosity': ['luminosity', 'flux_from_luminosity', 'hr_absolute_magnitude', 'luminosity_function'],
                'brightness': ['luminosity', 'flux_from_luminosity', 'inverse_square_law_brightness', 'magnitude_flux_relation'],
                'mass': ['chandrasekhar_limit', 'jeans_mass', 'center_of_mass', 'white_dwarf_mass_radius'],
                'gravity': ['surface_gravity', 'escape_velocity'],
                'escape': ['escape_velocity'],
                'redshift': ['cosmic_redshift', 'doppler_shift', 'doppler_shift_approx'],
                'wavelength': ['wiens_law', 'planck_relation', 'doppler_shift', 'blackbody_radiation'],
                'peak wavelength': ['wiens_law', 'blackbody_radiation'],
                'wien law': ['wiens_law'],
                'energy': ['orbital_energy', 'planck_relation'],
                'photon energy': ['planck_relation'],
                'radius': ['schwarzschild_radius', 'white_dwarf_mass_radius', 'hill_radius', 'angular_size'],
                'angular size': ['angular_size', 'angular_diameter_distance'],
                'magnitude': ['distance_modulus', 'hr_absolute_magnitude', 'magnitude_flux_relation'],
                'lifetime': ['stellar_lifetime'],
                'stellar lifetime': ['stellar_lifetime'],
                'density': ['average_density', 'critical_density', 'density_parameter'],
                'critical density': ['critical_density', 'density_parameter'],
                'flux': ['flux_from_luminosity', 'flux_temperature', 'inverse_square_law_brightness'],
                'kepler': ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary'],
                'kepler third law': ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary'],
                'tidal': ['tidal_force', 'roche_limit', 'tidal_locking_timescale'],
                'tidal force': ['tidal_force', 'roche_limit'],
                'roche limit': ['roche_limit'],
                'tidal locking': ['tidal_locking_timescale'],
                'hill radius': ['hill_radius'],
                'star': ['stellar_lifetime', 'luminosity', 'hr_absolute_magnitude', 'mass_luminosity_relation'],
                'main sequence': ['stellar_lifetime', 'mass_luminosity_relation'],
                'planet': ['surface_gravity', 'average_density', 'planetary_equilibrium_temperature'],
                'exoplanet': ['planetary_equilibrium_temperature', 'albedo', 'greenhouse_effect'],
                'white dwarf': ['white_dwarf_mass_radius', 'chandrasekhar_limit', 'binary_white_dwarf', 'white_dwarf_orbital_decay', 'white_dwarf_merger_timescale'],
                'chandrasekhar limit': ['chandrasekhar_limit'],
                'hubble': ['hubble_law', 'cosmic_redshift', 'lookback_time'],
                'hubble constant': ['hubble_law'],
                'hubble law': ['hubble_law'],
                'blackbody': ['blackbody_radiation', 'wiens_law', 'flux_temperature'],
                'doppler': ['doppler_shift', 'doppler_shift_approx', 'cosmic_redshift'],
                'spectroscopy': ['equivalent_width', 'doppler_shift'],
                'equivalent width': ['equivalent_width'],
                'absorption': ['equivalent_width'],
                'emission': ['equivalent_width'],
                'binary': ['binary_white_dwarf', 'kepler_third_law_binary', 'center_of_mass'],
                'binary star': ['kepler_third_law_binary', 'binary_white_dwarf', 'center_of_mass'],
                'orbital decay': ['white_dwarf_orbital_decay'],
                'merger': ['white_dwarf_merger_timescale'],
                'synchrotron': ['synchrotron_power', 'synchrotron_cooling_timescale', 'magnetic_energy_density'],
                'magnetic field': ['magnetic_energy_density', 'synchrotron_power'],
                'power law': ['power_law_spectrum', 'spectral_index'],
                'spectral index': ['spectral_index', 'power_law_spectrum'],
                'gamma ray': ['max_gamma_bohm', 'cooling_break_gamma'],
                'cooling': ['synchrotron_cooling_timescale'],
                'schwarzschild': ['schwarzschild_radius'],
                'event horizon': ['schwarzschild_radius'],
                'gravitational lensing': ['einstein_radius'],
                'lensing': ['einstein_radius'],
                'einstein radius': ['einstein_radius'],
                'time dilation': ['time_dilation'],
                'length contraction': ['length_contraction'],
                'lookback time': ['lookback_time'],
                'friedmann': ['friedmann_equation'],
                'angular resolution': ['angular_resolution'],
                'resolution': ['angular_resolution'],
                'light gathering': ['light_gathering_power'],
                'aperture': ['light_gathering_power', 'angular_resolution'],
                'f ratio': ['f_ratio'],
                'magnification': ['magnification'],
                'hydrostatic': ['hydrostatic_balance'],
                'pressure': ['hydrostatic_balance'],
                'hr diagram': ['hr_color_index', 'hr_absolute_magnitude'],
                'color index': ['hr_color_index'],
                'b-v': ['hr_color_index'],
                'mass luminosity': ['mass_luminosity_relation'],
                'distance modulus': ['distance_modulus'],
                'luminosity distance': ['luminosity_distance'],
                'angular diameter distance': ['angular_diameter_distance'],
                'angular momentum': ['angular_momentum_elliptical'],
                'elliptical orbit': ['angular_momentum_elliptical', 'kepler_third_law'],
                'jeans mass': ['jeans_mass'],
                'gravitational collapse': ['jeans_mass'],
                'center of mass': ['center_of_mass'],
                'barycenter': ['center_of_mass'],
                'inverse square law': ['inverse_square_law_brightness', 'flux_from_luminosity'],
                'luminosity function': ['luminosity_function'],
                'planck': ['planck_relation'],
                'planck relation': ['planck_relation'],
                'stefan boltzmann': ['blackbody_radiation'],
                'equilibrium temperature': ['planetary_equilibrium_temperature'],
                'albedo': ['albedo'],
                'greenhouse': ['greenhouse_effect'],
                'transit': ['planetary_equilibrium_temperature'],
                'parsec': ['parallax_distance_radians', 'parallax_distance_arcsec'],
                'light year': ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus'],
                'astronomical unit': ['kepler_third_law', 'orbital_velocity'],
                'solar mass': ['kepler_third_law', 'mass_luminosity_relation', 'chandrasekhar_limit'],
                'main sequence star': ['stellar_lifetime', 'mass_luminosity_relation', 'hr_absolute_magnitude'],
                'giant star': ['hr_absolute_magnitude', 'luminosity'],
                'supergiant': ['hr_absolute_magnitude', 'luminosity'],
                'eclipsing binary': ['binary_white_dwarf', 'kepler_third_law_binary'],
                'spectroscopic binary': ['doppler_shift', 'kepler_third_law_binary'],
                'contact binary': ['binary_white_dwarf', 'white_dwarf_merger_timescale'],
                'transit method': ['planetary_equilibrium_temperature'],
                'radial velocity method': ['doppler_shift', 'doppler_shift_approx'],
                'habitable zone': ['planetary_equilibrium_temperature', 'flux_temperature'],
                'microlensing': ['einstein_radius'],
                'scale factor': ['hubble_law', 'cosmic_redshift', 'lookback_time'],
                'universe age': ['hubble_law', 'lookback_time'],
                'cosmic expansion': ['hubble_law', 'cosmic_redshift', 'friedmann_equation'],
                'general relativity': ['schwarzschild_radius', 'einstein_radius', 'time_dilation', 'length_contraction'],
                'gravitational wave': ['schwarzschild_radius', 'einstein_radius'],
                'spacetime': ['einstein_radius', 'schwarzschild_radius', 'time_dilation'],
                'diffraction': ['angular_resolution'],
                'rayleigh criterion': ['angular_resolution'],
                'seeing': ['angular_resolution'],
                'adaptive optics': ['angular_resolution'],
                'doppler broadening': ['doppler_shift', 'doppler_shift_approx'],
                'line broadening': ['equivalent_width', 'doppler_shift'],
                'rotational broadening': ['rotational_velocity', 'doppler_shift'],
                'inverse compton': ['synchrotron_power', 'magnetic_energy_density'],
                'cooling break': ['cooling_break_gamma', 'cooling_break_frequency'],
                'non thermal': ['power_law_spectrum', 'spectral_index'],
                'gamma ray burst': ['max_gamma_bohm', 'synchrotron_cooling_timescale'],
                'roche lobe': ['roche_limit'],
                'tidal heating': ['tidal_force', 'tidal_locking_timescale'],
                'orbital resonance': ['kepler_third_law', 'synodic_period'],
                'virial theorem': ['hydrostatic_balance', 'orbital_energy'],
                'convection': ['hydrostatic_balance'],
                'opacity': ['blackbody_radiation', 'flux_temperature'],
                'bolometric magnitude': ['hr_absolute_magnitude', 'luminosity'],
                'color magnitude diagram': ['hr_color_index', 'hr_absolute_magnitude'],
                'cmd': ['hr_color_index', 'hr_absolute_magnitude'],
                'isochrone': ['hr_absolute_magnitude', 'stellar_lifetime'],
                'cepheid': ['distance_modulus', 'luminosity'],
                'rr lyrae': ['distance_modulus', 'luminosity'],
                'mira': ['distance_modulus', 'luminosity'],
                'pulsation': ['luminosity', 'stellar_lifetime'],
                'distance ladder': ['parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance'],
                'standard candle': ['distance_modulus', 'luminosity_distance'],
                'standard ruler': ['angular_diameter_distance'],
                'trigonometric parallax': ['parallax_distance_radians', 'parallax_distance_arcsec'],
                'cluster distance': ['distance_modulus', 'hr_absolute_magnitude'],
                'effective temperature': ['wiens_law', 'flux_temperature', 'hr_color_index'],
                'surface temperature': ['wiens_law', 'flux_temperature'],
                'bolometric': ['hr_absolute_magnitude', 'luminosity'],
                'spectral energy distribution': ['blackbody_radiation', 'flux_temperature'],
                'continuum': ['blackbody_radiation'],
                'kinetic energy': ['orbital_energy', 'vis_viva'],
                'potential energy': ['orbital_energy', 'vis_viva'],
                'binding energy': ['orbital_energy'],
                'acceleration': ['surface_gravity', 'escape_velocity'],
                'angular velocity': ['rotational_velocity'],
                'age': ['stellar_lifetime'],
                'timescale': ['stellar_lifetime', 'synchrotron_cooling_timescale', 'tidal_locking_timescale'],
                'jupiter mass': ['kepler_third_law', 'orbital_velocity'],
                'earth mass': ['surface_gravity', 'average_density'],
                'momentum': ['angular_momentum_elliptical', 'vis_viva'],
                'force': ['tidal_force', 'surface_gravity'],
                'angular frequency': ['rotational_velocity'],
                'orbital elements': ['kepler_third_law', 'angular_momentum_elliptical', 'vis_viva'],
                'inclination': ['kepler_third_law'],
                'stellar evolution': ['stellar_lifetime', 'mass_luminosity_relation', 'hr_absolute_magnitude'],
                'nucleosynthesis': ['stellar_lifetime', 'luminosity'],
                'proton proton chain': ['stellar_lifetime'],
                'cno cycle': ['stellar_lifetime'],
                'accretion disk': ['luminosity', 'flux_from_luminosity'],
                'eddington luminosity': ['luminosity'],
                'line profile': ['equivalent_width', 'doppler_shift'],
                'gaussian profile': ['equivalent_width', 'doppler_shift'],
                'lorentzian profile': ['equivalent_width'],
                'voigt profile': ['equivalent_width'],
                'fwhm': ['equivalent_width', 'doppler_shift'],
                'radial velocity curve': ['doppler_shift', 'kepler_third_law_binary'],
                'orbital solution': ['kepler_third_law', 'kepler_third_law_binary'],
                'mass function': ['kepler_third_law_binary', 'center_of_mass'],
                'transit depth': ['planetary_equilibrium_temperature'],
                'transit duration': ['planetary_equilibrium_temperature'],
                'impact parameter': ['planetary_equilibrium_temperature'],
                'secondary eclipse': ['planetary_equilibrium_temperature'],
                'compton y parameter': ['synchrotron_power'],
                'synchrotron self compton': ['synchrotron_power'],
                'inverse compton scattering': ['synchrotron_power', 'magnetic_energy_density'],
                'thomson scattering': ['synchrotron_power'],
                'bremsstrahlung': ['synchrotron_power'],
                'pair production': ['max_gamma_bohm'],
                'libration point': ['hill_radius', 'roche_limit'],
                'trojan asteroid': ['hill_radius'],
                'secular resonance': ['synodic_period', 'kepler_third_law'],
                'yarkovsky effect': ['tidal_force'],
                'poynting robertson': ['tidal_force'],
                'lane emden equation': ['hydrostatic_balance'],
                'isothermal sphere': ['hydrostatic_balance'],
                'extinction': ['distance_modulus', 'magnitude_flux_relation'],
                'reddening': ['hr_color_index', 'distance_modulus'],
                'selective extinction': ['distance_modulus'],
                'surface brightness': ['angular_size', 'luminosity'],
                'mass ratio': ['kepler_third_law_binary', 'center_of_mass'],
                'orbital separation': ['kepler_third_law', 'kepler_third_law_binary'],
                'common envelope': ['binary_white_dwarf', 'white_dwarf_merger_timescale'],
                'mass transfer': ['binary_white_dwarf', 'roche_limit'],
                'thermal timescale': ['stellar_lifetime'],
                'dynamical timescale': ['stellar_lifetime'],
                'period luminosity': ['distance_modulus', 'luminosity'],
                'leavitt law': ['distance_modulus', 'luminosity'],
                'wesenheit function': ['distance_modulus'],
                'spectroscopic parallax': ['distance_modulus', 'hr_absolute_magnitude'],
                'moving cluster': ['distance_modulus', 'hr_absolute_magnitude'],
                'statistical parallax': ['parallax_distance_arcsec'],
                'barycentric parallax': ['parallax_distance_arcsec'],
                'dynamical parallax': ['kepler_third_law_binary'],
                'expansion parallax': ['parallax_distance_arcsec'],
                'reverberation mapping': ['distance_modulus'],
                'transverse comoving': ['angular_diameter_distance'],
                'light travel distance': ['lookback_time'],
                'particle horizon distance': ['lookback_time'],
                'metallicity': ['hr_absolute_magnitude'],
                's process': ['stellar_lifetime'],
                'r process': ['stellar_lifetime'],
                'point spread function': ['angular_resolution'],
                'strehl ratio': ['angular_resolution'],
                'signal to noise': ['angular_resolution', 'light_gathering_power'],
                'integration time': ['light_gathering_power'],
                'quantum efficiency': ['light_gathering_power'],
                'airmass': ['angular_resolution'],
                'extinction coefficient': ['distance_modulus'],
                'scintillation': ['angular_resolution'],
                'differential photometry': ['magnitude_flux_relation'],
                'photometric system': ['magnitude_flux_relation', 'hr_color_index'],
                'standard star': ['distance_modulus', 'magnitude_flux_relation'],
                'chi squared': ['distance_modulus', 'luminosity_distance'],
                'maximum likelihood': ['distance_modulus'],
                'uncertainty': ['parallax_distance_arcsec', 'distance_modulus'],
                'error propagation': ['parallax_distance_arcsec', 'distance_modulus']
            };
            
            if (conceptMap[concept] && conceptMap[concept].includes(formulaId)) {
                score += 300;
                if (!reason) {
                    reason = `Matches concept: "${concept}"`;
                }
            }
            
            // Also check partial concept matches
            if (concept.includes('velocity') && (formulaId.includes('velocity') || formulaId === 'vis_viva')) {
                score += 200;
            }
            if (concept.includes('distance') && formulaId.includes('distance')) {
                score += 200;
            }
            if (concept.includes('period') && (formulaId.includes('period') || formulaId.includes('kepler'))) {
                score += 200;
            }
            if (concept.includes('temperature') && (formulaId.includes('temperature') || formulaId.includes('wien'))) {
                score += 200;
            }
        });
        
        // Check if question mentions specific variables that match formula variables
        parsedQuery.variables.forEach(varSymbol => {
            const hasVar = formula.variables.some(v => 
                v.symbol.toLowerCase() === varSymbol || v.name.toLowerCase().includes(varSymbol)
            );
            if (hasVar) {
                score += 150;
            }
        });
        
        // ENHANCED: Check formula.questionPatterns if they exist (direct question matching)
        if (formula.questionPatterns && Array.isArray(formula.questionPatterns)) {
            formula.questionPatterns.forEach(pattern => {
                const patternLower = pattern.toLowerCase();
                
                // Direct substring match (high priority)
                if (searchLower.includes(patternLower) || patternLower.includes(searchLower)) {
                    score += 400;
                    if (!reason) reason = `Matches question: "${pattern}"`;
                }
                
                // Word overlap (at least 2 words match)
                const patternWords = patternLower.split(/\s+/).filter(w => w.length > 2);
                const matchedWords = patternWords.filter(w => searchLower.includes(w));
                if (matchedWords.length >= 2) {
                    score += 200 * matchedWords.length;
                    if (!reason) reason = `Question pattern match: ${matchedWords.length} words`;
                }
                
                // Individual word matches (lower priority but still valuable)
                patternWords.forEach(word => {
                    if (searchLower.includes(word) && word.length >= 4) {
                        score += 100;
                    }
                });
            });
        }
        
        return { score, reason };
    }
    
    // ENHANCED: Calculate precision score based on directionality and primary use
    function calculatePrecisionScore(formula, parsedQuery, searchLower) {
        let score = 0;
        let reason = '';
        
        // Check if formula has primaryUseCase (we'll add this to formulas)
        const primaryUseCase = formula.primaryUseCase || '';
        const primaryUseLower = primaryUseCase.toLowerCase();
        
        // Intent matching with directionality (highest priority)
        if (parsedQuery.direction === 'from' || parsedQuery.direction === 'based_on') {
            // User wants to find X FROM Y
            const targetConcepts = parsedQuery.targetConcepts;
            const sourceConcepts = parsedQuery.sourceConcepts;
            
            // Check if formula's primary use matches the direction
            if (primaryUseCase) {
                // Check if primary use case matches the query direction
                // e.g., "temperature from wavelength" matches "find temperature from spectrum"
                const useCaseWords = primaryUseLower.split(/\s+/);
                const hasTarget = targetConcepts.some(tc => 
                    useCaseWords.some(ucw => ucw.includes(tc) || tc.includes(ucw))
                );
                const hasSource = sourceConcepts.some(sc => 
                    useCaseWords.some(ucw => ucw.includes(sc) || sc.includes(ucw))
                );
                
                if (hasTarget && hasSource) {
                    // Perfect direction match
                    score += 1500;
                    reason = `🎯 Perfect match: ${primaryUseCase}`;
                } else if (hasTarget || hasSource) {
                    // Partial direction match
                    score += 500;
                    reason = `Direction match: ${primaryUseCase}`;
                }
            }
            
            // Check question patterns with direction
            if (formula.questionPatterns && Array.isArray(formula.questionPatterns)) {
                formula.questionPatterns.forEach(pattern => {
                    const patternLower = pattern.toLowerCase();
                    // Check if pattern matches the direction
                    if (patternLower.includes('from') || patternLower.includes('based')) {
                        const patternWords = patternLower.split(/\s+/);
                        const matchedWords = patternWords.filter(w => 
                            searchLower.includes(w) && w.length > 3
                        );
                        if (matchedWords.length >= 3) {
                            const specificity = formula.specificity || 5;
                            score += 300 * specificity;
                            if (!reason) reason = `📋 Question pattern: "${pattern}"`;
                        }
                    }
                });
            }
        }
        
        // Primary use case bonus (even without explicit direction)
        if (primaryUseCase && searchLower.includes(primaryUseLower.replace(/\s+/g, '.*'))) {
            score += 500;
            if (!reason) reason = `✨ Primary use case match: ${primaryUseCase}`;
        }
        
        // Specificity bonus (formulas with higher specificity get bonus for exact matches)
        const specificity = formula.specificity || 5;
        if (specificity >= 8) {
            // High specificity formulas get bonus for concept matches
            const conceptMatches = parsedQuery.concepts.filter(c => 
                formula.concepts && formula.concepts.some(fc => 
                    fc.toLowerCase().includes(c) || c.includes(fc.toLowerCase())
                )
            ).length;
            
            if (conceptMatches >= 3) {
                score += 200 * (specificity / 10);
                if (!reason) reason = `🔗 Strong concept match (${conceptMatches} concepts, specificity ${specificity}/10)`;
            }
        }
        
        return { score, reason };
    }
    
    // ENHANCED: Calculate penalty for overly generic matches
    function calculateGenericPenalty(formula, parsedQuery, currentScore) {
        let penalty = 0;
        
        // Penalize low specificity formulas if they have too many generic matches
        const specificity = formula.specificity || 5;
        const conceptMatches = parsedQuery.concepts.filter(c => 
            formula.concepts && formula.concepts.some(fc => 
                fc.toLowerCase().includes(c) || c.includes(fc.toLowerCase())
            )
        ).length;
        
        // If formula has low specificity but many concept matches, it's probably too generic
        if (specificity < 7 && conceptMatches > 2 && currentScore > 500) {
            // Apply penalty proportional to how generic it is
            penalty = Math.round(currentScore * 0.3);
        }
        
        // Penalize if formula matches many concepts but doesn't match primary use case
        if (conceptMatches >= 3 && !formula.primaryUseCase) {
            penalty += 100;
        }
        
        // Penalize if direction is specified but formula doesn't match it
        if (parsedQuery.direction && !formula.primaryUseCase) {
            penalty += 150;
        }
        
        return penalty;
    }
}

}

// Render filtered formulas with accuracy metrics
function renderFilteredFormulas(scoredFormulas, searchTerm, maxScore = 1) {
        const startTime = window.performance.now();
    const formulaList = document.getElementById('formula-list');
    
    // CRITICAL: Check if element exists
    if (!formulaList) {
        console.error('❌ formula-list element not found!');
        console.log('Available elements:', 
            Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        return;
    }
    
    // CRITICAL: Force visibility IMMEDIATELY before any operations
    formulaList.style.display = 'block';
    formulaList.style.visibility = 'visible';
    formulaList.style.opacity = '1';
    formulaList.style.height = 'auto';
    
    // Clear the list
    formulaList.innerHTML = '';
    
    // Ensure formula-list is visible
    const formulaSelection = document.getElementById('formula-selection');
    if (formulaSelection && !formulaSelection.classList.contains('active')) {
        formulaSelection.classList.add('active');
    }
    const inputScreen = document.getElementById('input-screen');
    if (inputScreen && inputScreen.classList.contains('active')) {
        inputScreen.classList.remove('active');
    }
    
    // Ensure the Formulas tab is active
    const mainFormulasTab = document.getElementById('main-formulas-tab');
    if (mainFormulasTab && !mainFormulasTab.classList.contains('active')) {
        mainFormulasTab.classList.add('active');
    }
    
    // If we have search results, use Explorer-style two-panel layout
    if (searchTerm && scoredFormulas.length > 0) {
        renderSearchResultsExplorerStyle(scoredFormulas, searchTerm, maxScore);
        return;
    }
    
    // Add result count header FIRST (before any categories)
    if (searchTerm && scoredFormulas.length > 0) {
        const resultHeader = document.createElement('div');
        resultHeader.className = 'search-results-header';
        // SECURITY FIX: Escape user input (searchTerm)
        resultHeader.innerHTML = `Found <strong>${scoredFormulas.length}</strong> relevant formula${scoredFormulas.length !== 1 ? 's' : ''} matching "${escapeHtml(searchTerm)}" (sorted by relevance, highest score first)`;
        formulaList.appendChild(resultHeader);
    }
    
    if (scoredFormulas.length === 0) {
        // Get suggestions based on search term
        const suggestions = getSearchSuggestions(searchTerm);
        let suggestionsHTML = '';
        if (suggestions.length > 0) {
            suggestionsHTML = `
                <div class="search-suggestions">
                    <div class="search-suggestions-title">Try searching for:</div>
                    <div class="search-suggestions-list">
                        ${suggestions.map(s => `<span class="search-suggestion-item" data-suggestion="${escapeHtml(s)}">${escapeHtml(s)}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        // Don't overwrite if header was already added - append instead
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results-container';
        noResultsDiv.innerHTML = `
            <p class="no-results-title">No formulas found</p>
            <p class="no-results-subtitle">Try searching for a different term</p>
            ${suggestionsHTML}
        `;
        formulaList.appendChild(noResultsDiv);
        return;
    }
    
    // Group scored formulas by category and sort by score
    const categorizedFormulas = {};
    const uncategorized = [];
    
    scoredFormulas.forEach(({ formula, score, metrics }) => {
        let found = false;
        for (const [category, ids] of Object.entries(formulaCategories)) {
            if (ids.includes(formula.id)) {
                if (!categorizedFormulas[category]) {
                    categorizedFormulas[category] = [];
                }
                categorizedFormulas[category].push({ formula, score, metrics, maxScore });
                found = true;
                break;
            }
        }
        if (!found) {
            uncategorized.push({ formula, score, metrics, maxScore });
        }
    });
    
    // Sort formulas within each category by score (highest to lowest)
    Object.keys(categorizedFormulas).forEach(category => {
        categorizedFormulas[category].sort((a, b) => b.score - a.score);
    });
    uncategorized.sort((a, b) => b.score - a.score);
    
    // PERFORMANCE: Removed console.log in rendering path
    
    // Sort categories by highest score in category
    const categoryScores = {};
    Object.keys(categorizedFormulas).forEach(category => {
        const maxScoreInCategory = Math.max(...categorizedFormulas[category].map(f => f.score));
        categoryScores[category] = maxScoreInCategory;
    });
    
    // Render categorized formulas, sorted by category score (highest first)
    const categoryOrder = [
        'Orbital Mechanics',
        'Radiation & Stellar Properties',
        'Telescopes & Optics',
        'Cosmology & Relativity',
        'Doppler & Spectroscopy',
        'Planetary Science & Exoplanets',
        'High Energy Astrophysics',
        'Stellar Structure'
    ];
    
    // Sort categories by their highest score, but maintain some order preference
    const sortedCategories = Object.keys(categorizedFormulas).sort((a, b) => {
        const scoreA = categoryScores[a] || 0;
        const scoreB = categoryScores[b] || 0;
        if (Math.abs(scoreA - scoreB) > 100) {
            // If scores are very different, sort by score
            return scoreB - scoreA;
        }
        // Otherwise maintain category order preference
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
    
    sortedCategories.forEach(category => {
        if (categorizedFormulas[category] && categorizedFormulas[category].length > 0) {
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'formula-category';
            
            const header = document.createElement('div');
            header.className = 'formula-category-header';
            const maxScoreInCategory = categoryScores[category];
            // SECURITY FIX: Escape category name
            header.innerHTML = `<h2>${escapeHtml(category)}</h2><span class="category-score">Top score: ${Math.round(maxScoreInCategory)}</span>`;
            categoryContainer.appendChild(header);
            
            // PERFORMANCE: Use document fragment for batch DOM operations
            const fragment = document.createDocumentFragment();
            let cardsAdded = 0;
            categorizedFormulas[category].forEach(({ formula, score, metrics, maxScore }) => {
                const card = createFormulaCard(formula, score, metrics, maxScore);
                if (card) {
                    // Force visibility on card before appending
                    card.style.display = 'block';
                    card.style.visibility = 'visible';
                    card.style.opacity = '1';
                    fragment.appendChild(card);
                    cardsAdded++;
                }
            });
            
            // Append all cards at once
            if (cardsAdded > 0) {
                categoryContainer.appendChild(fragment);
                // Force visibility on category container
                categoryContainer.style.display = 'grid';
                categoryContainer.style.visibility = 'visible';
                categoryContainer.style.opacity = '1';
                formulaList.appendChild(categoryContainer);
            }
        }
    });
    
    // Render uncategorized formulas
    if (uncategorized.length > 0) {
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'formula-category';
        
        const header = document.createElement('div');
        header.className = 'formula-category-header';
        header.innerHTML = `<h2>Other</h2>`;
        categoryContainer.appendChild(header);
        
        // PERFORMANCE: Use document fragment for batch DOM operations
        const fragment = document.createDocumentFragment();
        let cardsAdded = 0;
        uncategorized.forEach(({ formula, score, metrics, maxScore }) => {
            const card = createFormulaCard(formula, score, metrics, maxScore);
            if (card) {
                fragment.appendChild(card);
                cardsAdded++;
            }
        });
        
        // Append all cards at once
        if (cardsAdded > 0) {
            categoryContainer.appendChild(fragment);
            formulaList.appendChild(categoryContainer);
        }
    }
    
    // CRITICAL: Final visibility check with forced reflow
    formulaList.offsetHeight; // Force reflow
    const finalTotalChildren = formulaList.children.length;
    console.log(`✅ Rendering complete. Total children in formulaList: ${finalTotalChildren}`);
    
    // Retry logic if no children rendered
    if (finalTotalChildren === 0 && scoredFormulas.length > 0) {
        console.error('❌ No children rendered despite having formulas, retrying...');
        setTimeout(() => {
            if (formulaList.children.length === 0) {
                console.error('❌ Retry failed, forcing re-render');
                // Force re-render by calling again
                renderFilteredFormulas(scoredFormulas, searchTerm, maxScore);
            }
        }, 100);
    }
    
    // Final check - ensure we have content
    const totalChildren = formulaList.children.length;
    const totalCards = formulaList.querySelectorAll('.formula-card').length;
    
    console.log('📊 Final render stats:', {
        totalChildren: totalChildren,
        totalCards: totalCards,
        scoredFormulas: scoredFormulas.length,
        categories: Object.keys(categorizedFormulas).length,
        uncategorized: uncategorized.length,
        formulaListDisplay: window.getComputedStyle(formulaList).display,
        formulaListVisibility: window.getComputedStyle(formulaList).visibility,
        formulaListOpacity: window.getComputedStyle(formulaList).opacity,
        mainTabActive: mainFormulasTab ? mainFormulasTab.classList.contains('active') : 'N/A',
        mainTabDisplay: mainFormulasTab ? window.getComputedStyle(mainFormulasTab).display : 'N/A'
    });
    
    if (totalChildren === 0 && scoredFormulas.length > 0) {
        console.error('❌ Warning: No content was appended to formulaList despite having results!');
        console.error('Debug info:', {
            scoredFormulasCount: scoredFormulas.length,
            categorizedCount: Object.keys(categorizedFormulas).length,
            uncategorizedCount: uncategorized.length,
            formulaListExists: !!formulaList,
            formulaListVisible: formulaList.offsetParent !== null,
            formulaListDisplay: window.getComputedStyle(formulaList).display,
            mainTabActive: mainFormulasTab ? mainFormulasTab.classList.contains('active') : false
        });
    } else if (totalCards === 0 && scoredFormulas.length > 0) {
        console.error('❌ Warning: No cards found in formulaList despite having results!');
        console.error('formulaList.innerHTML length:', formulaList.innerHTML.length);
        console.error('formulaList children:', Array.from(formulaList.children).map(c => `${c.tagName}.${c.className}`));
        
        // Try to force visibility
        if (mainFormulasTab) {
            mainFormulasTab.classList.add('active');
            mainFormulasTab.style.display = 'block';
        }
        formulaList.style.display = 'block';
        formulaList.style.visibility = 'visible';
        formulaList.style.opacity = '1';
    }
    
    // PERFORMANCE: Single visibility pass instead of multiple
    formulaList.style.display = 'block';
    formulaList.style.visibility = 'visible';
    formulaList.style.opacity = '1';
    
    // Ensure all cards are visible (single pass)
    const allCards = formulaList.querySelectorAll('.formula-card');
    allCards.forEach(card => {
        card.style.display = 'block';
        card.style.visibility = 'visible';
        card.style.opacity = '1';
    });
    
    // Scroll to top of results if we have a search term (use instant scroll for performance)
    if (searchTerm && totalCards > 0) {
        formulaList.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
    
    // Highlight search term in results (async to not block rendering)
    if (searchTerm) {
        requestAnimationFrame(() => highlightSearchTerm(searchTerm));
    }
}

// Render search results in Explorer-style two-panel layout
function renderSearchResultsExplorerStyle(scoredFormulas, searchTerm, maxScore = 1) {
    const formulaList = document.getElementById('formula-list');
    if (!formulaList) return;
    
    // Store selected formula in a variable
    let selectedFormulaId = null;
    
    // Create Explorer-style layout
    const layoutHTML = `
        <div class="search-results-explorer-layout" style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-top: 20px;">
            <!-- Left Panel: Search Results List -->
            <div class="search-results-left-panel" style="background: rgba(10, 14, 39, 0.85); border-radius: 12px; padding: 20px; max-height: 600px; overflow-y: auto;">
                <div class="search-results-header" style="margin-bottom: 15px;">
                    <h3 style="color: #667eea; margin: 0 0 5px 0;">Search Results</h3>
                    <p style="color: rgba(255, 255, 255, 0.7); margin: 0; font-size: 0.9em;">
                        Found <strong>${scoredFormulas.length}</strong> formula${scoredFormulas.length !== 1 ? 's' : ''} matching "${searchTerm}"
                    </p>
                </div>
                <div class="search-results-list">
                    ${scoredFormulas.map(({ formula, score, metrics }, index) => {
                        const confidenceScore = (typeof calculateConfidenceScore === 'function' && metrics && maxScore > 0) 
                            ? calculateConfidenceScore(score, maxScore, metrics) 
                            : Math.min(100, Math.round((score / maxScore) * 100));
                        const confidenceLevel = (typeof getConfidenceLevel === 'function') 
                            ? getConfidenceLevel(confidenceScore) 
                            : { level: 'Medium', color: '#fde047' };
                        
                        return `
                            <div class="search-result-item" 
                                 data-formula-id="${formula.id}"
                                 style="padding: 12px; margin-bottom: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; cursor: pointer; border: 2px solid rgba(255, 255, 255, 0.1); transition: all 0.2s;"
                                 tabindex="0"
                                 role="button"
                                 aria-label="Select formula: ${escapeHtml(formula.name)}"
                                 onclick="if(typeof window.selectSearchResultFormula === 'function') { window.selectSearchResultFormula('${formula.id}'); }">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                    <div style="font-weight: 600; color: #a8c7ff; font-size: 0.95em;">${formula.name}</div>
                                    <div style="background: ${confidenceLevel.color}20; border: 1px solid ${confidenceLevel.color}; color: ${confidenceLevel.color}; padding: 2px 8px; border-radius: 4px; font-size: 0.75em; font-weight: 600;">
                                        ${confidenceScore}%
                                    </div>
                                </div>
                                <div style="font-family: 'Courier New', monospace; color: rgba(255, 255, 255, 0.7); font-size: 0.85em; margin-top: 4px;">
                                    ${formula.equation}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- Right Panel: Formula Details -->
            <div class="search-results-right-panel" id="search-results-details" style="background: rgba(10, 14, 39, 0.85); border-radius: 12px; padding: 30px; min-height: 500px;">
                <div style="text-align: center; color: rgba(255, 255, 255, 0.5); padding: 60px 20px;">
                    <div style="font-size: 3em; margin-bottom: 20px;">📚</div>
                    <p style="font-size: 1.1em;">Select a formula from the list to view details</p>
                </div>
            </div>
        </div>
    `;
    
    formulaList.innerHTML = layoutHTML;
    
    // Store formulas for access in selectSearchResultFormula
    window.searchResultsData = { scoredFormulas, maxScore };
    
    // Make selectSearchResultFormula available globally
    window.selectSearchResultFormula = function(formulaId) {
        const data = window.searchResultsData;
        if (!data) return;
        
        const formulaData = data.scoredFormulas.find(f => f.formula.id === formulaId);
        if (!formulaData) return;
        
        selectedFormulaId = formulaId;
        
        // Update active state
        document.querySelectorAll('.search-result-item').forEach(item => {
            if (item.dataset.formulaId === formulaId) {
                item.style.background = 'rgba(102, 126, 234, 0.2)';
                item.style.borderColor = '#667eea';
            } else {
                item.style.background = 'rgba(255, 255, 255, 0.05)';
                item.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
        });
        
        // Render formula details
        renderSearchResultDetails(formulaData.formula, formulaData.score, formulaData.metrics, data.maxScore);
    };
    
    // Auto-select first formula
    if (scoredFormulas.length > 0) {
        setTimeout(() => {
            window.selectSearchResultFormula(scoredFormulas[0].formula.id);
        }, 100);
    }
}

/**
 * Render formula details in the right panel
 * 
 * Displays comprehensive information about a selected formula in the
 * Explorer-style search results view. Shows:
 * - Formula name and "Use This Formula" button
 * - Confidence score badge
 * - Description
 * - Equation (formatted)
 * - Concepts (as clickable tags)
 * - Variables (with descriptions and units)
 * 
 * @param {Object} formula - Formula object to display
 * @param {number} score - Relevance score
 * @param {Object} metrics - Match metrics object
 * @param {number} maxScore - Maximum score for normalization
 */
function renderSearchResultDetails(formula, score, metrics, maxScore) {
    const detailsPanel = document.getElementById('search-results-details');
    if (!detailsPanel) return;
    
    const confidenceScore = (typeof calculateConfidenceScore === 'function' && metrics && maxScore > 0) 
        ? calculateConfidenceScore(score, maxScore, metrics) 
        : Math.min(100, Math.round((score / maxScore) * 100));
    const confidenceLevel = (typeof getConfidenceLevel === 'function') 
        ? getConfidenceLevel(confidenceScore) 
        : { level: 'Medium', color: '#fde047' };
    
    const detailsHTML = `
        <div style="margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <h2 style="color: #667eea; margin: 0; font-size: 2em;">${escapeHtml(formula.name)}</h2>
                <button class="use-formula-btn" data-formula-id="${formula.id}" 
                        style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; white-space: nowrap;">
                    Use This Formula →
                </button>
            </div>
            <div style="margin-bottom: 15px;">
                <div style="background: ${confidenceLevel.color}20; border: 1px solid ${confidenceLevel.color}; color: ${confidenceLevel.color}; padding: 8px 16px; border-radius: 6px; display: inline-block; font-weight: 600; margin-bottom: 10px;">
                    ${confidenceScore}% Match - ${confidenceLevel.level}
                </div>
                ${(typeof getConfidenceBreakdown === 'function' && metrics && maxScore > 0) ? `
                <details style="margin-top: 10px; cursor: pointer;">
                    <summary style="color: rgba(255, 255, 255, 0.7); font-size: 0.9em; user-select: none; padding: 5px 0;">
                        📊 Why this confidence level?
                    </summary>
                    <div style="margin-top: 10px; padding: 15px; background: rgba(0, 0, 0, 0.4); border-radius: 8px; border: 1px solid rgba(102, 126, 234, 0.3);">
                        ${(() => {
                            const breakdown = getConfidenceBreakdown(score, maxScore, metrics, 1);
                            let html = '<div style="font-size: 0.9em;">';
                            breakdown.components.forEach(comp => {
                                const sign = comp.isAdjustment ? (comp.value >= 0 ? '+' : '') : '+';
                                const color = comp.value > 0 ? '#4ade80' : comp.value < 0 ? '#f87171' : 'rgba(255, 255, 255, 0.7)';
                                html += `
                                    <div style="display: flex; justify-content: space-between; align-items: start; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                        <div style="flex: 1;">
                                            <div style="color: #a8c7ff; font-weight: 600; margin-bottom: 3px;">${comp.label}</div>
                                            <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.85em;">${comp.description}</div>
                                        </div>
                                        <div style="color: ${color}; font-weight: 600; margin-left: 15px; min-width: 50px; text-align: right;">
                                            ${sign}${comp.value}%
                                        </div>
                                    </div>
                                `;
                            });
                            html += `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; margin-top: 8px; border-top: 2px solid rgba(102, 126, 234, 0.5);">
                                    <div style="color: #a8c7ff; font-weight: 700; font-size: 1.05em;">Total Confidence</div>
                                    <div style="color: ${confidenceLevel.color}; font-weight: 700; font-size: 1.1em;">${breakdown.total}%</div>
                                </div>
                            `;
                            html += '</div>';
                            return html;
                        })()}
                    </div>
                </details>
                ` : ''}
            </div>
        </div>
        
        <div style="margin-bottom: 25px;">
            <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; font-size: 1.05em;">
                ${escapeHtml(formula.description || 'No description available.')}
            </p>
        </div>
        
        <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.9em; margin-bottom: 8px;">Equation:</div>
            <div style="font-family: 'Courier New', monospace; font-size: 1.3em; color: #60a5fa; word-break: break-all;">
                ${escapeHtml(formula.equation)}
            </div>
        </div>
        
        ${formula.concepts && formula.concepts.length > 0 ? `
            <div style="margin-bottom: 25px;">
                <h3 style="color: #667eea; margin: 0 0 12px 0; font-size: 1.2em;">Concepts</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${formula.concepts.map(concept => `
                        <span style="padding: 6px 12px; background: #1e40af; color: #bfdbfe; border-radius: 20px; font-size: 0.9em;">
                            ${escapeHtml(concept)}
                        </span>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${formula.variables && formula.variables.length > 0 ? `
            <div style="margin-bottom: 25px;">
                <h3 style="color: #667eea; margin: 0 0 12px 0; font-size: 1.2em;">Variables</h3>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${formula.variables.map(v => `
                        <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                <div style="font-family: 'Courier New', monospace; font-size: 1.2em; color: #60a5fa; font-weight: 600;">
                                    ${escapeHtml(v.symbol)}
                                </div>
                                <div style="font-size: 0.85em; color: rgba(255, 255, 255, 0.6);">
                                    ${escapeHtml(v.unit || 'N/A')}
                                </div>
                            </div>
                            <div style="font-weight: 600; color: #fff; margin-bottom: 4px; font-size: 0.95em;">
                                ${escapeHtml(v.name || 'Unknown')}
                            </div>
                            <div style="font-size: 0.9em; color: rgba(255, 255, 255, 0.7); line-height: 1.5;">
                                ${escapeHtml(v.description || 'No description available.')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    detailsPanel.innerHTML = detailsHTML;
}

/**
 * Helper function to escape HTML
 * 
 * Prevents XSS attacks by escaping HTML special characters in user input.
 * Used when displaying user-generated content or formula data in HTML.
 * 
 * @param {string} text - Text to escape
 * @returns {string} HTML-escaped text
 * 
 * @example
 * escapeHtml("<script>alert('xss')</script>") // Returns: "&lt;script&gt;alert('xss')&lt;/script&gt;"
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Get search suggestions based on common terms
 * 
 * Provides alternative search terms when no results are found.
 * Suggests related terms based on:
 * - Partial matches with common astrophysics terms
 * - Variable symbols that match the search
 * - Concept expansions
 * 
 * @param {string} searchTerm - The search term that returned no results
 * @returns {Array<string>} Array of suggested search terms (max 5)
 * 
 * @example
 * getSearchSuggestions("vel") // Returns: ["velocity", "escape velocity", "orbital velocity"]
 * getSearchSuggestions("temp") // Returns: ["temperature", "wien", "stefan"]
 */
function getSearchSuggestions(searchTerm) {
    const suggestions = [];
    const searchLower = searchTerm.toLowerCase();
    
    // Common search terms and their suggestions
    const commonTerms = {
        'vel': ['velocity', 'escape velocity', 'orbital velocity'],
        'temp': ['temperature', 'wien', 'stefan'],
        'mass': ['mass', 'chandrasekhar', 'jeans'],
        'dist': ['distance', 'parallax', 'modulus'],
        'lum': ['luminosity', 'flux', 'brightness'],
        'grav': ['gravity', 'surface gravity', 'escape'],
        'orb': ['orbital', 'kepler', 'period'],
        'red': ['redshift', 'doppler'],
        'mag': ['magnitude', 'flux'],
        'rad': ['radius', 'angular', 'diameter']
    };
    
    // Check for partial matches
    for (const [key, terms] of Object.entries(commonTerms)) {
        if (searchLower.includes(key) || key.includes(searchLower)) {
            suggestions.push(...terms);
        }
    }
    
    // Get unique variable symbols that might match
    const allVariables = new Set();
    formulas.forEach(f => {
        f.variables.forEach(v => {
            if (v.symbol.toLowerCase().includes(searchLower) || 
                searchLower.includes(v.symbol.toLowerCase())) {
                allVariables.add(v.symbol);
            }
        });
    });
    
    suggestions.push(...Array.from(allVariables).slice(0, 3));
    
    return [...new Set(suggestions)].slice(0, 5); // Return up to 5 unique suggestions
}

/**
 * Sanitize and highlight search term in text (XSS-safe)
 */
function sanitizeAndHighlight(text, searchTerm) {
    if (!text || !searchTerm) return text;
    
    // First escape HTML to prevent XSS
    const escapedText = escapeHtml(text);
    
    // Escape regex special characters in search term
    const escapedTerm = escapeHtml(searchTerm).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create safe regex
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    
    // Replace with safe mark tag
    return escapedText.replace(regex, '<mark style="background: rgba(102, 126, 234, 0.4); color: #a8c7ff; padding: 2px 4px; border-radius: 3px; font-weight: 500;">$1</mark>');
}

// Highlight search term in formula cards (XSS-safe)
function highlightSearchTerm(searchTerm) {
    if (!searchTerm) return;
    
    const cards = document.querySelectorAll('.formula-card');
    const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    cards.forEach(card => {
        // Highlight in name (XSS-safe)
        const nameEl = card.querySelector('h3');
        if (nameEl) {
            let nameText = nameEl.textContent;
            searchWords.forEach(word => {
                // Escape both the original text and the search term
                const escapedText = escapeHtml(nameText);
                const escapedWord = escapeHtml(word);
                const regex = new RegExp(`(${escapeRegex(escapedWord)})`, 'gi');
                nameText = escapedText.replace(regex, '<mark style="background: rgba(102, 126, 234, 0.4); color: #a8c7ff; padding: 2px 4px; border-radius: 3px; font-weight: 500;">$1</mark>');
            });
            nameEl.innerHTML = nameText;
        }
        
        // Highlight in description (XSS-safe)
        const descEl = card.querySelector('.description');
        if (descEl) {
            let descText = descEl.textContent;
            searchWords.forEach(word => {
                const escapedText = escapeHtml(descText);
                const escapedWord = escapeHtml(word);
                const regex = new RegExp(`(${escapeRegex(escapedWord)})`, 'gi');
                descText = escapedText.replace(regex, '<mark style="background: rgba(102, 126, 234, 0.3); color: #a8c7ff; padding: 1px 3px; border-radius: 2px;">$1</mark>');
            });
            descEl.innerHTML = descText;
        }
        
        // Highlight in formula preview (be careful with special characters, XSS-safe)
        const formulaEl = card.querySelector('.formula-preview');
        if (formulaEl) {
            let formulaText = formulaEl.textContent;
            // Only highlight if it's a simple text match (avoid breaking math symbols)
            searchWords.forEach(word => {
                if (word.length > 1 && /^[a-zA-Z0-9_]+$/.test(word)) {
                    const escapedText = escapeHtml(formulaText);
                    const escapedWord = escapeHtml(word);
                    const regex = new RegExp(`\\b(${escapeRegex(escapedWord)})\\b`, 'gi');
                    formulaText = escapedText.replace(regex, '<mark style="background: rgba(102, 126, 234, 0.3); color: #a8c7ff; padding: 1px 2px; border-radius: 2px;">$1</mark>');
                }
            });
            formulaEl.innerHTML = formulaText;
        }
    });
}

// Render the list of formulas
function renderFormulaList() {
    // Make sure this function is globally available
    if (typeof window !== 'undefined') {
        window.renderFormulaList = renderFormulaList;
    }
    const formulaList = document.getElementById('formula-list');
    
    if (!formulaList) {
        console.error('formula-list element not found!');
        return;
    }
    
    // Check if formulas array exists
    if (typeof formulas === 'undefined' || !formulas) {
        console.error('Formulas array not found!', typeof formulas);
        formulaList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Error: Formulas not loaded. Please check the console.</p>';
        return;
    }
    
    if (!Array.isArray(formulas) || formulas.length === 0) {
        console.error('Formulas array is empty or not an array!', formulas);
        formulaList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Error: No formulas found in array.</p>';
        return;
    }
    
    console.log(`Rendering ${formulas.length} formulas...`);
    
    // CRITICAL: Ensure the formula-selection screen is active (Safari fix)
    const formulaSelection = document.getElementById('formula-selection');
    if (formulaSelection) {
        if (!formulaSelection.classList.contains('active')) {
            console.warn('formula-selection screen not active! Activating it...');
            formulaSelection.classList.add('active');
        }
        // Force display style for all browsers (critical fix)
        formulaSelection.style.setProperty('display', 'block', 'important');
        formulaSelection.style.setProperty('visibility', 'visible', 'important');
        formulaSelection.style.setProperty('opacity', '1', 'important');
        
        // Also ensure input-screen is not active
        const inputScreen = document.getElementById('input-screen');
        if (inputScreen) {
            inputScreen.classList.remove('active');
            inputScreen.style.setProperty('display', 'none', 'important');
        }
    } else {
        console.error('formula-selection element not found!');
    }
    
    // Clear and populate formula list
    formulaList.innerHTML = '';
    
    // Ensure formula-list is visible (Cross-browser compatibility - CRITICAL)
    formulaList.style.setProperty('display', 'block', 'important');
    formulaList.style.setProperty('visibility', 'visible', 'important');
    formulaList.style.setProperty('opacity', '1', 'important');
    formulaList.style.setProperty('height', 'auto', 'important');
    formulaList.style.setProperty('min-height', '100px', 'important');
    formulaList.style.setProperty('overflow', 'visible', 'important');
    
    // Also ensure parent containers are visible (critical for all browsers)
    const mainFormulasTab = document.getElementById('main-formulas-tab');
    if (mainFormulasTab) {
        mainFormulasTab.classList.add('active');
        mainFormulasTab.style.setProperty('display', 'block', 'important');
        mainFormulasTab.style.setProperty('visibility', 'visible', 'important');
        mainFormulasTab.style.setProperty('opacity', '1', 'important');
        mainFormulasTab.style.setProperty('overflow', 'visible', 'important');
        
        // Verify it's actually visible
        const tabComputed = window.getComputedStyle(mainFormulasTab);
        console.log('📊 main-formulas-tab computed:', {
            display: tabComputed.display,
            visibility: tabComputed.visibility,
            opacity: tabComputed.opacity
        });
    } else {
        console.error('❌ main-formulas-tab element not found!');
    }
    
    // Ensure main-tab-content is visible
    const mainTabContent = document.querySelector('.main-tab-content.active');
    if (mainTabContent) {
        mainTabContent.style.setProperty('display', 'block', 'important');
        mainTabContent.style.setProperty('visibility', 'visible', 'important');
        mainTabContent.style.setProperty('opacity', '1', 'important');
        mainTabContent.style.setProperty('overflow', 'visible', 'important');
    }
    
    // Verify formula-list is actually visible after all changes
    const listComputed = window.getComputedStyle(formulaList);
    console.log('📊 formula-list computed:', {
        display: listComputed.display,
        visibility: listComputed.visibility,
        opacity: listComputed.opacity,
        height: listComputed.height,
        overflow: listComputed.overflow
    });
    
    // Check if formulaCategories is defined
    if (typeof formulaCategories === 'undefined') {
        console.error('formulaCategories is not defined! Cannot categorize formulas.');
        // Render all formulas as uncategorized
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'formula-category';
        formulas.forEach(formula => {
            if (formula && formula.id) {
                const card = createFormulaCard(formula);
                if (card) {
                    categoryContainer.appendChild(card);
                }
            }
        });
        formulaList.appendChild(categoryContainer);
        console.log(`Rendered ${formulas.length} formula cards (uncategorized - formulaCategories missing)`);
        return;
    }
    
    // Group formulas by category
    const categorizedFormulas = {};
    const uncategorized = [];
    
    formulas.forEach(formula => {
        if (!formula || !formula.id) {
            console.warn('Skipping invalid formula:', formula);
            return;
        }
        let found = false;
        for (const [category, ids] of Object.entries(formulaCategories)) {
            if (ids.includes(formula.id)) {
                if (!categorizedFormulas[category]) {
                    categorizedFormulas[category] = [];
                }
                categorizedFormulas[category].push(formula);
                found = true;
                break;
            }
        }
        if (!found) {
            uncategorized.push(formula);
        }
    });
    
    console.log(`Grouped into ${Object.keys(categorizedFormulas).length} categories, ${uncategorized.length} uncategorized`);
    console.log(`Total formulas: ${formulas.length}, Categorized: ${Object.values(categorizedFormulas).reduce((sum, arr) => sum + arr.length, 0)}, Uncategorized: ${uncategorized.length}`);
    
    // Log uncategorized formulas for debugging
    if (uncategorized.length > 0) {
        console.log('⚠️ Uncategorized formulas:', uncategorized.map(f => f.id || f.name).slice(0, 10));
        if (uncategorized.length > 10) {
            console.log(`... and ${uncategorized.length - 10} more uncategorized formulas`);
        }
    }
    
    // Render categorized formulas
    const categoryOrder = [
        'Orbital Mechanics',
        'Radiation & Stellar Properties',
        'Telescopes & Optics',
        'Cosmology & Relativity',
        'Doppler & Spectroscopy',
        'Planetary Science & Exoplanets',
        'High Energy Astrophysics',
        'Stellar Structure'
    ];
    
    categoryOrder.forEach(category => {
        if (categorizedFormulas[category] && categorizedFormulas[category].length > 0) {
            // Create category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'formula-category-header';
            // SECURITY FIX: Escape category name
            categoryHeader.innerHTML = `<h2>${escapeHtml(category)}</h2>`;
            formulaList.appendChild(categoryHeader);
            
            // Create category container
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'formula-category';
            // Force visibility for all browsers
            categoryContainer.style.setProperty('display', 'grid', 'important');
            categoryContainer.style.setProperty('visibility', 'visible', 'important');
            categoryContainer.style.setProperty('opacity', '1', 'important');
            
            // Add formulas to category
            categorizedFormulas[category].forEach(formula => {
                const card = createFormulaCard(formula);
                if (card) {
                    // Force card visibility
                    card.style.setProperty('display', 'block', 'important');
                    card.style.setProperty('visibility', 'visible', 'important');
                    card.style.setProperty('opacity', '1', 'important');
                    categoryContainer.appendChild(card);
                } else {
                    console.warn(`Failed to create card for formula: ${formula.id || formula.name || 'unknown'}`);
                }
            });
            
            formulaList.appendChild(categoryContainer);
        }
    });
    
    // Render uncategorized formulas if any
    if (uncategorized.length > 0) {
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'formula-category-header';
        categoryHeader.innerHTML = '<h2>Other</h2>';
        formulaList.appendChild(categoryHeader);
        
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'formula-category';
        
        uncategorized.forEach(formula => {
            const card = createFormulaCard(formula);
            if (card) {
                // Ensure card is visible
                card.style.setProperty('display', 'block', 'important');
                card.style.setProperty('visibility', 'visible', 'important');
                card.style.setProperty('opacity', '1', 'important');
                categoryContainer.appendChild(card);
            } else {
                console.warn(`Failed to create card for uncategorized formula: ${formula.id || formula.name || 'unknown'}`);
            }
        });
        
        formulaList.appendChild(categoryContainer);
    }
    
    // Final verification: Count actual cards rendered
    const actualCardCount = formulaList.querySelectorAll('.formula-card').length;
    console.log(`✅ Rendered ${actualCardCount} formula cards in ${Object.keys(categorizedFormulas).length} categories (expected ${formulas.length})`);
    
    // Make diagnostics available
    if (typeof window !== 'undefined') {
        window.astrocalcCardCount = actualCardCount;
    }
    
    // Force a reflow to ensure browsers apply styles (critical for Safari/Chrome)
    void formulaList.offsetHeight;
    
    // AGGRESSIVE visibility fix - check and fix multiple times (cross-browser)
    function forceVisibility() {
        // Check and fix formula-list
        const listComputed = window.getComputedStyle(formulaList);
        if (listComputed.display === 'none' || listComputed.visibility === 'hidden' || listComputed.opacity === '0') {
            console.warn('⚠️ formula-list is hidden! Forcing visibility...');
            formulaList.style.setProperty('display', 'block', 'important');
            formulaList.style.setProperty('visibility', 'visible', 'important');
            formulaList.style.setProperty('opacity', '1', 'important');
        }
        
        // Check and fix all category containers
        const categories = formulaList.querySelectorAll('.formula-category');
        categories.forEach((cat, idx) => {
            const catComputed = window.getComputedStyle(cat);
            if (catComputed.display === 'none' || catComputed.visibility === 'hidden') {
                console.warn(`⚠️ Category ${idx} is hidden! Forcing visibility...`);
                cat.style.setProperty('display', 'grid', 'important');
                cat.style.setProperty('visibility', 'visible', 'important');
                cat.style.setProperty('opacity', '1', 'important');
            }
        });
        
        // Check and fix all cards
        const cards = formulaList.querySelectorAll('.formula-card');
        cards.forEach((card, idx) => {
            const cardComputed = window.getComputedStyle(card);
            if (cardComputed.display === 'none' || cardComputed.visibility === 'hidden') {
                console.warn(`⚠️ Card ${idx} is hidden! Forcing visibility...`);
                card.style.setProperty('display', 'block', 'important');
                card.style.setProperty('visibility', 'visible', 'important');
                card.style.setProperty('opacity', '1', 'important');
            }
        });
        
        // Check parent containers
        if (mainFormulasTab) {
            const tabStyle = window.getComputedStyle(mainFormulasTab);
            if (tabStyle.display === 'none') {
                console.warn('⚠️ main-formulas-tab is hidden! Forcing visibility...');
                mainFormulasTab.style.setProperty('display', 'block', 'important');
            }
        }
        
        if (formulaSelection) {
            const screenStyle = window.getComputedStyle(formulaSelection);
            if (screenStyle.display === 'none') {
                console.warn('⚠️ formula-selection is hidden! Forcing visibility...');
                formulaSelection.style.setProperty('display', 'block', 'important');
            }
        }
    }
    
    // Run immediately
    forceVisibility();
    
    // Run again after short delay
    setTimeout(forceVisibility, 100);
    
    // Run again after longer delay (for slow browsers)
    setTimeout(forceVisibility, 500);
    
    if (actualCardCount === 0) {
        console.error('❌ No formula cards were rendered! Check createFormulaCard function.');
        formulaList.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 40px;">Error: Formula cards failed to render. Check console for details.</p>';
    } else {
        console.log('✅ All cards should now be visible. If not, check computed styles in DevTools.');
    }
}

// Create a formula card element
function createFormulaCard(formula, score = null, metrics = null, maxScore = 1) {
    // Validate formula object
    if (!formula) {
        console.error('createFormulaCard: formula is null or undefined');
        return null;
    }
    
    if (!formula.id || !formula.name) {
        console.error('createFormulaCard: formula missing required properties', formula);
        return null;
    }
    
    const card = document.createElement('div');
    card.className = 'formula-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-formula-id', formula.id);
    
    // PERFORMANCE FIX: Use event delegation instead of individual listeners
    // Event delegation is already set up on formulaList, so we don't need individual listeners
    // This prevents memory leaks when cards are removed
    // Only add a data attribute for the formula reference (event delegation will handle clicks)
    
        // Calculate confidence score using FRQ support system
        let confidenceScore = 0;
        let confidenceLevel = null;
        if (score !== null && metrics && maxScore > 0) {
            if (typeof calculateConfidenceScore === 'function') {
                confidenceScore = calculateConfidenceScore(score, maxScore, metrics);
                if (typeof getConfidenceLevel === 'function') {
                    confidenceLevel = getConfidenceLevel(confidenceScore);
                }
            }
        }
        
        // Calculate confidence percentage if metrics are provided (improved accuracy)
        let metricsHTML = '';
        if (score !== null && metrics && maxScore > 0) {
        // Calculate relative confidence (normalized to max score)
        const relativeConfidence = Math.min(100, Math.round((score / maxScore) * 100));
        
        // Calculate absolute confidence based on score tiers
        let absoluteConfidence = 0;
        if (score >= 10000) absoluteConfidence = 95; // Exact name match tier
        else if (score >= 800) absoluteConfidence = 90; // Very high relevance
        else if (score >= 600) absoluteConfidence = 80; // High relevance
        else if (score >= 400) absoluteConfidence = 65; // Medium-high relevance
        else if (score >= 250) absoluteConfidence = 50; // Medium relevance
        else if (score >= 150) absoluteConfidence = 35; // Low-medium relevance
        else absoluteConfidence = 20; // Low relevance
        
        // Combine relative and absolute confidence (weighted average)
        const confidencePercent = Math.round((relativeConfidence * 0.6) + (absoluteConfidence * 0.4));
        
        const matchCount = [
            metrics.nameMatch,
            metrics.descriptionMatch,
            metrics.equationMatch,
            metrics.variableMatch,
            metrics.conceptMatch,
            metrics.questionPatternMatch,
            metrics.categoryMatch,
            metrics.semanticMatch
        ].filter(Boolean).length;
        
        // Determine confidence level with more granular thresholds
        let confidenceLevel = 'low';
        let confidenceColor = '#ff6b6b';
        if (confidencePercent >= 85) {
            confidenceLevel = 'excellent';
            confidenceColor = '#51cf66';
        } else if (confidencePercent >= 70) {
            confidenceLevel = 'high';
            confidenceColor = '#74c0fc';
        } else if (confidencePercent >= 50) {
            confidenceLevel = 'medium';
            confidenceColor = '#ffd43b';
        } else if (confidencePercent >= 30) {
            confidenceLevel = 'low-medium';
            confidenceColor = '#ffa94d';
        }
        
        // Build match indicators
        const matchIndicators = [];
        if (metrics.nameMatch) matchIndicators.push('Name');
        if (metrics.descriptionMatch) matchIndicators.push('Description');
        if (metrics.equationMatch) matchIndicators.push('Equation');
        if (metrics.variableMatch) matchIndicators.push('Variables');
        if (metrics.conceptMatch) matchIndicators.push('Concepts');
        if (metrics.questionPatternMatch) matchIndicators.push('Question Pattern');
        if (metrics.categoryMatch) matchIndicators.push('Category');
        if (metrics.semanticMatch) matchIndicators.push('Semantic');
        if (metrics.synonymMatch) matchIndicators.push('Synonym');
        
        // Get concept hierarchy relationships for display
        const conceptHierarchy = getConceptHierarchy();
        const conceptRelations = [];
        metrics.matchedConcepts.forEach(concept => {
            const node = conceptHierarchy[concept];
            if (node) {
                const relations = [];
                if (node.parent) relations.push(`↑ ${node.parent}`);
                if (node.children && node.children.length > 0) {
                    relations.push(`↓ ${node.children.slice(0, 2).join(', ')}${node.children.length > 2 ? '...' : ''}`);
                }
                if (node.siblings && node.siblings.length > 0) {
                    relations.push(`↔ ${node.siblings.slice(0, 2).join(', ')}${node.siblings.length > 2 ? '...' : ''}`);
                }
                if (relations.length > 0) {
                    conceptRelations.push(`${concept}: ${relations.join(' | ')}`);
                }
            }
        });
        
        // SECURITY FIX: Escape all user data in metrics HTML
        const escapedMatchIndicators = matchIndicators.map(m => escapeHtml(m));
        const escapedMatchedConcepts = metrics.matchedConcepts.slice(0, 3).map(c => escapeHtml(c));
        const escapedMatchedVariables = metrics.matchedVariables.map(v => escapeHtml(v));
        const escapedMatchReasons = metrics.matchReasons.length > 0 ? escapeHtml(metrics.matchReasons[0]) : '';
        const escapedConceptRelations = conceptRelations.slice(0, 2).map(r => escapeHtml(r));
        
        metricsHTML = `
            <div class="accuracy-metrics">
                <div class="confidence-badge" style="background: ${confidenceColor}20; border-color: ${confidenceColor}; color: ${confidenceColor};">
                    <span class="confidence-percent">${confidencePercent}%</span>
                    <span class="confidence-level">${escapeHtml(confidenceLevel)}</span>
                </div>
                <div class="match-details">
                    <div class="match-count">${matchCount}/9 match types${metrics.dynamicBoost > 0 ? ` • +${metrics.dynamicBoost}% dynamic boost` : ''}</div>
                    ${escapedMatchIndicators.length > 0 ? `<div class="match-indicators">${escapedMatchIndicators.map(m => `<span class="match-tag">${m}</span>`).join('')}</div>` : ''}
                    ${escapedMatchedConcepts.length > 0 ? `<div class="matched-concepts">Concepts: ${escapedMatchedConcepts.join(', ')}${metrics.matchedConcepts.length > 3 ? '...' : ''}</div>` : ''}
                    ${escapedConceptRelations.length > 0 ? `<div class="concept-hierarchy" title="Hierarchical relationships: ↑ parent, ↓ children, ↔ siblings">${escapedConceptRelations.map(r => `<span class="hierarchy-link">${r}</span>`).join('<br>')}${conceptRelations.length > 2 ? '<br>...' : ''}</div>` : ''}
                    ${escapedMatchedVariables.length > 0 ? `<div class="matched-variables">Variables: ${escapedMatchedVariables.join(', ')}</div>` : ''}
                    ${escapedMatchReasons ? `<div class="match-reasons">${escapedMatchReasons}</div>` : ''}
                </div>
            </div>
        `;
    }
    
    // SECURITY FIX: Escape all user data to prevent XSS attacks
    const formulaName = escapeHtml(formula.name || 'Unnamed Formula');
    const formulaEquation = escapeHtml(formula.equation || 'No equation available');
    const formulaDescription = escapeHtml(formula.description || 'No description available');
    const formulaVariables = (formula.variables && Array.isArray(formula.variables) && formula.variables.length > 0) 
        ? formula.variables.map(v => `<span class="var-tag">${escapeHtml(v.symbol || '?')}</span>`).join(' ')
        : '<span class="var-tag">None</span>';
    
    // Set innerHTML with escaped content
    try {
        // Add score display if this is a search result (score is numeric, safe)
        const scoreDisplay = (score !== null && score !== undefined) ? 
            `<div class="formula-score-badge" style="position: absolute; top: 10px; right: 10px; background: rgba(102, 126, 234, 0.3); color: #a8c7ff; padding: 4px 10px; border-radius: 8px; font-size: 0.85em; font-weight: 600; border: 1px solid rgba(102, 126, 234, 0.5);">
                ${Math.round(score)} pts
            </div>` : '';
        
        const cardContent = `
            ${scoreDisplay}
            <div class="formula-card-header">
                <h3>${formulaName}</h3>
                <span class="click-hint">Click to calculate →</span>
            </div>
            ${metricsHTML}
            <div class="formula-preview">${formulaEquation}</div>
            <p class="description">${formulaDescription}</p>
            <div class="formula-variables">
                <strong>Variables:</strong> ${formulaVariables}
            </div>
        `;
        card.innerHTML = cardContent;
        
        // Add quick links to related formulas (if function exists)
        if (typeof addQuickLinksToCard === 'function') {
            addQuickLinksToCard(card, formula);
        }
        
        // Verify content was set
        if (card.innerHTML.trim().length === 0) {
            console.error('Card innerHTML is empty after setting!', formula.id);
        }
    } catch (error) {
        console.error('Error setting card innerHTML:', error, formula);
        card.innerHTML = `
            <div class="formula-card-header">
                <h3>Error Loading Formula</h3>
            </div>
            <p class="description">Unable to display formula details.</p>
        `;
    }
    
    // PERFORMANCE FIX: Keyboard support only (click handled by event delegation)
    // Single listener, no duplicates
    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            selectFormula(formula);
        }
    });
    
    // Final validation - ensure card has content
    if (!card || !card.innerHTML || card.innerHTML.trim().length === 0) {
        console.error('❌ Card creation failed for:', formula.id, formula.name);
        // Return a minimal card instead of null
        const fallbackCard = document.createElement('div');
        fallbackCard.className = 'formula-card';
        fallbackCard.setAttribute('data-formula-id', formula.id);
        // SECURITY FIX: Escape user data in fallback card too
        fallbackCard.innerHTML = `
            <div class="formula-card-header">
                <h3>${escapeHtml(formula.name || 'Unknown Formula')}</h3>
            </div>
            <p class="description">${escapeHtml(formula.description || 'No description')}</p>
        `;
        // No onclick needed - event delegation handles it
        return fallbackCard;
    }
    
    return card;
}

// Make selectFormula available globally for onclick handlers
window.selectFormula = selectFormula;

// Select a formula and show input screen
// Helper function to safely initialize a graph manager
// Helper function to wait for element visibility
function waitForElement(element, timeout = 1000) {
    // Input validation
    if (!element || !(element instanceof Element)) {
        return Promise.reject(new Error('waitForElement: Invalid element parameter'));
    }
    if (typeof timeout !== 'number' || !isFinite(timeout) || timeout <= 0) {
        timeout = 1000; // Default to 1 second
    }
    
    return new Promise((resolve) => {
        if (element && element.offsetParent !== null) {
            resolve();
            return;
        }
        
        const observer = new MutationObserver(() => {
            if (element && element.offsetParent !== null) {
                observer.disconnect();
                resolve();
            }
        });
        
        if (element && element.parentElement) {
            observer.observe(element.parentElement, { 
                childList: true, 
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }
        
        setTimeout(() => {
            observer.disconnect();
            resolve();
        }, timeout);
    });
}

function selectFormula(formula) {
    // Make sure function is available globally for onclick handlers
    if (!window.selectFormula) {
        window.selectFormula = selectFormula;
    }
    
    // FIXED: Cleanup previous formula's resources to prevent memory leaks
    cleanupGlobalState();
    
    // Track formula selection for dynamic prioritization
    if (typeof semanticSearchSystem !== 'undefined' && formula.concepts) {
        formula.concepts.forEach(concept => {
            semanticSearchSystem.trackUsage(concept);
        });
        if (formula.keywords) {
            formula.keywords.forEach(keyword => {
                semanticSearchSystem.trackUsage(keyword);
            });
        }
    }
    
    currentFormula = formula;
    calculator = new FormulaCalculator(formula);
    
    // Initialize graph manager (uses OfflineGraphManager for offline operation)
    if (typeof GraphManager !== 'undefined') {
        if (!graphManager) {
            graphManager = new GraphManager('desmos-graph', 'graph-tab');
        }
        // Update graph with current formula
        graphManager.updateGraph(formula, {});
    }
    
    // Switch to input screen
    document.getElementById('formula-selection').classList.remove('active');
    document.getElementById('input-screen').classList.add('active');
    
    // CRITICAL: Ensure calculator tab is active and visible BEFORE rendering inputs
    if (typeof switchTab === 'function') {
        switchTab('calculator');
    } else {
        // Fallback: manually activate calculator tab
        const calculatorTab = document.getElementById('calculator-tab');
        if (calculatorTab) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            calculatorTab.classList.add('active');
            const calculatorContent = document.getElementById('calculator-tab');
            if (calculatorContent) {
                calculatorContent.classList.add('active');
                calculatorContent.style.setProperty('display', 'block', 'important');
            }
        }
    }
    
    // Populate formula info
    document.getElementById('formula-name').textContent = formula.name;
    const equationEl = document.getElementById('formula-equation');
    equationEl.textContent = formula.equation;
    document.getElementById('formula-description').textContent = formula.description;
    
    // Create variable inputs (only in calculator tab)
    renderVariableInputs(formula);
    
    // Double-check calculator tab is visible after rendering (synchronous check)
    const calculatorTab = document.getElementById('calculator-tab');
    if (calculatorTab && !calculatorTab.classList.contains('active')) {
        calculatorTab.classList.add('active');
        calculatorTab.setAttribute('aria-hidden', 'false');
    }
    
    // Ensure tab button is also active
    const calculatorTabBtn = document.querySelector('[data-tab="calculator"]');
    if (calculatorTabBtn && !calculatorTabBtn.classList.contains('active')) {
        calculatorTabBtn.classList.add('active');
        calculatorTabBtn.setAttribute('aria-selected', 'true');
    }
    
    // Clear previous results
    document.getElementById('result-display').classList.remove('show');
    
    // Remove any existing usage instructions (always remove, never add)
    // Reuse calculatorTab variable declared above
    if (calculatorTab) {
        const existingInstructions = calculatorTab.querySelector('.usage-instructions-container');
        if (existingInstructions) {
            existingInstructions.remove();
        }
        // Also remove contextual hints
        const existingHints = calculatorTab.querySelector('.contextual-hints-container');
        if (existingHints) {
            existingHints.remove();
        }
    }
    
    // Update instruction banner with initial state
    updateInstructionBanner([], null, 0, currentFormula.variables.filter(v => {
        const constantSymbols = new Set();
        if (currentFormula.constants) {
            Object.keys(currentFormula.constants).forEach(key => constantSymbols.add(key));
        }
        return !constantSymbols.has(v.symbol);
    }).length);
    
        // Update solve indicators after a short delay to ensure DOM is ready
        setTimeout(() => {
            updateSolveIndicators();
            // Also update graph if it's already initialized
            if (graphManager && currentFormula) {
                const variableValues = getCurrentVariableValues();
                graphManager.updateGraph(currentFormula, variableValues);
            }
        }, 150);
    
    // Display related formulas
    displayRelatedFormulas(formula);
}

// Display related formulas for the current formula with triple-layer reinforcement
function displayRelatedFormulas(formula) {
    const container = document.getElementById('related-formulas-container');
    if (!container || !formulaRelationships) return;
    
    const relationships = formulaRelationships.getRelatedFormulas(formula.id);
    
    // Get cross-concept reinforced formulas
    let reinforcedFormulas = new Set(relationships.all);
    if (typeof crossConceptReinforcement !== 'undefined' && formula.concepts) {
        formula.concepts.forEach(concept => {
            const reinforced = crossConceptReinforcement.getReinforcedFormulas(concept);
            reinforced.forEach(id => reinforcedFormulas.add(id));
        });
    }
    
    // Remove current formula
    reinforcedFormulas.delete(formula.id);
    
    if (reinforcedFormulas.size === 0 && relationships.all.length === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    
    let html = '<div class="related-formulas-header"><h4>🔗 Related Formulas (Triple-Layer Reinforcement)</h4></div><div class="related-formulas-grid">';
    
    // Group by relationship type
    const groups = {
        'Prerequisites': relationships.prerequisites,
        'Derived From': relationships.derivedFrom,
        'Related To': relationships.relatedTo,
        'Uses This': relationships.uses,
        'Generalizes': relationships.generalizes,
        'Specializes': relationships.specializes
    };
    
    // Add cross-concept reinforced formulas
    const crossConceptFormulas = Array.from(reinforcedFormulas).filter(id => 
        !relationships.all.includes(id)
    );
    
    if (crossConceptFormulas.length > 0) {
        groups['Cross-Concept Reinforced'] = crossConceptFormulas;
    }
    
    Object.entries(groups).forEach(([type, formulaIds]) => {
        if (formulaIds.length > 0) {
            html += `<div class="relationship-group">
                <div class="relationship-type">${type}</div>
                <div class="related-formulas-list">`;
            
            formulaIds.forEach(id => {
                const relatedFormula = formulas.find(f => f.id === id);
                if (relatedFormula) {
                    // Get reinforcement info
                    let reinforcementInfo = '';
                    if (type === 'Cross-Concept Reinforced' && formula.concepts) {
                        const sharedConcepts = formula.concepts.filter(c => 
                            relatedFormula.concepts && relatedFormula.concepts.includes(c)
                        );
                        if (sharedConcepts.length > 0) {
                            reinforcementInfo = `<span class="reinforcement-badge">${sharedConcepts.length} shared concept${sharedConcepts.length > 1 ? 's' : ''}</span>`;
                        }
                    }
                    
                    html += `<div class="related-formula-item" data-formula-id="${id}">
                        <span class="related-formula-name">${relatedFormula.name} ${reinforcementInfo}</span>
                        <span class="related-formula-preview">${relatedFormula.equation}</span>
                    </div>`;
                }
            });
            
            html += `</div></div>`;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Add click handlers to related formula items
    container.querySelectorAll('.related-formula-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const formulaId = item.getAttribute('data-formula-id');
            const relatedFormula = formulas.find(f => f.id === formulaId);
            if (relatedFormula) {
                selectFormula(relatedFormula);
            }
        });
    });
}

// FIXED: Store active listeners for cleanup to prevent memory leaks
let activeInputListeners = new Map();
let activeMathJaxOperations = new Set();

/**
 * Cleanup function for variable inputs - prevents memory leaks
 * FIXED: Removes all event listeners and clears timers
 */
function cleanupVariableInputs() {
    // Remove all stored event listeners
    activeInputListeners.forEach((listener, element) => {
        if (element && element.parentNode) {
            if (listener.inputListener) {
                element.removeEventListener('input', listener.inputListener);
            }
            if (listener.changeListener) {
                element.removeEventListener('change', listener.changeListener);
            }
            if (listener.keydownListener) {
                element.removeEventListener('keydown', listener.keydownListener);
            }
            // Clear any timeouts stored on the element
            if (element.updateTimeout) {
                clearTimeout(element.updateTimeout);
                element.updateTimeout = null;
            }
            if (element.solveIndicatorTimeout) {
                clearTimeout(element.solveIndicatorTimeout);
                element.solveIndicatorTimeout = null;
            }
        }
    });
    activeInputListeners.clear();
    
    // Clear timeouts stored on inputs
    const container = document.getElementById('variables-container');
    if (container) {
        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.solveIndicatorTimeout) {
                clearTimeout(input.solveIndicatorTimeout);
                input.solveIndicatorTimeout = null;
            }
            if (input.updateTimeout) {
                clearTimeout(input.updateTimeout);
                input.updateTimeout = null;
            }
        });
    }
    
    // Clear MathJax operations and pending renders
    activeMathJaxOperations.clear();
    if (mathJaxRenderTimeout) {
        clearTimeout(mathJaxRenderTimeout);
        mathJaxRenderTimeout = null;
    }
    mathJaxRenderQueue.clear();
}

/**
 * Cleanup global state - prevents memory leaks
 */
function cleanupGlobalState() {
    // Cleanup input listeners
    cleanupVariableInputs();
    
    // Cleanup graph manager
    if (graphManager && typeof graphManager.destroy === 'function') {
        graphManager.destroy();
        graphManager = null;
    }
    
    // Clear global references
    currentFormula = null;
    calculator = null;
    
    // Cleanup FRQ timers
    if (typeof cleanupFRQTimers === 'function') {
        cleanupFRQTimers();
    }
}

// Render input fields for each variable
function renderVariableInputs(formula) {
    // FIXED: Cleanup previous inputs before rendering new ones
    cleanupVariableInputs();
    
    const container = document.getElementById('variables-container');
    container.innerHTML = '';
    
    // Get list of constant symbols to exclude from input fields
    // BUT: Only exclude if they're truly constants (like pi, G, c) that should never be user-input
    // Variables that appear in the formula should be shown even if they're in globalConstants
    const constantSymbols = new Set();
    if (formula.constants) {
        Object.keys(formula.constants).forEach(key => {
            constantSymbols.add(key);
            // Also check for common constant names
            if (key === 'pi' || key === 'π') constantSymbols.add('π');
            if (key === 'G') constantSymbols.add('G');
            if (key === 'c') constantSymbols.add('c');
            if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
        });
    }
    
    // Filter out ONLY formula-specific constants, not global constants
    // Global constants (like G, c, etc.) are automatically applied, but if a variable
    // appears in the formula's variable list, it should be shown for user input
    const userVariables = formula.variables.filter(variable => {
        // Only exclude if it's a formula-specific constant, not a global constant
        // Global constants are applied automatically but variables in the formula should be shown
        return !constantSymbols.has(variable.symbol);
    });
    
    // Display constants info if any exist
    if (formula.constants && Object.keys(formula.constants).length > 0) {
        const constantsDiv = document.createElement('div');
        constantsDiv.className = 'constants-info';
        constantsDiv.innerHTML = '<h4>Constants (automatically used):</h4><div class="constants-list"></div>';
        const constantsList = constantsDiv.querySelector('.constants-list');
        
        Object.entries(formula.constants).forEach(([key, value]) => {
            const constantItem = document.createElement('div');
            constantItem.className = 'constant-item';
            let displayValue = value;
            let displayKey = key;
            
            // Format common constants
            if (key === 'pi' || key === 'π') {
                displayKey = 'π';
                displayValue = '3.14159...';
            } else if (key === 'G') {
                displayKey = 'G';
                displayValue = '6.67430 × 10⁻¹¹ N·m²/kg²';
            } else if (key === 'c') {
                displayKey = 'c';
                displayValue = '2.998 × 10⁸ m/s';
            } else if (key === 'σ' || key === 'sigma') {
                displayKey = 'σ';
                displayValue = '5.670 × 10⁻⁸ W/(m²·K⁴)';
            } else if (typeof value === 'number') {
                if (Math.abs(value) < 0.001 || Math.abs(value) > 1000) {
                    displayValue = value.toExponential(3);
                } else {
                    displayValue = value.toString();
                }
            }
            
            // SECURITY FIX: Escape constant key and value
            constantItem.innerHTML = `<strong>${escapeHtml(displayKey)}:</strong> ${escapeHtml(String(displayValue))}`;
            constantsList.appendChild(constantItem);
        });
        
        container.appendChild(constantsDiv);
    }
    
    userVariables.forEach(variable => {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'variable-input';
        
        const baseUnit = variable.unit;
        const fullUnitName = UnitConverter.formatUnit(baseUnit);
        const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
        const isAngle = baseUnit.toLowerCase().includes('radian') || baseUnit.toLowerCase().includes('rad');
        
        // Create unit options note
        // Get example value for placeholder
        const exampleValue = getExampleValue(variable.symbol, baseUnit);
        
        // Create input fields - SIMPLIFIED: Clear placeholders, no confusing options
        let inputFieldsHTML = '';
        alternativeUnits.forEach((unit, index) => {
            const isBase = unit === baseUnit || unit.toLowerCase() === baseUnit.toLowerCase();
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            // Clear, helpful placeholder
            let placeholder;
            if (isBase) {
                if (exampleValue) {
                    placeholder = `Enter ${variable.name.toLowerCase()} (e.g., ${exampleValue})`;
                } else {
                    placeholder = `Enter ${variable.name.toLowerCase()}`;
                }
            } else {
                placeholder = `Or enter in ${unit}`;
            }
            
            inputFieldsHTML += `
                <div class="unit-input-group">
                    <label class="unit-input-label" for="${inputId}">
                        <span class="unit-symbol">${unit}</span>
                        <span class="unit-name">${UnitConverter.formatUnit(unit)}</span>
                    </label>
                    <input 
                        type="text" 
                        id="${inputId}" 
                        name="${inputId}"
                        class="unit-input-field"
                        placeholder="${placeholder}"
                        data-symbol="${variable.symbol}"
                        data-unit="${unit}"
                        data-unit-index="${index}"
                        data-base-unit="${baseUnit}"
                        aria-label="${variable.name} in ${unit}"
                    >
                </div>
            `;
        });
        
        // Get first input ID for label association
        const firstInputId = `var-${variable.symbol}-${baseUnit.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        inputDiv.innerHTML = `
            <label class="variable-main-label" for="${firstInputId}">
                <span class="symbol">${variable.symbol}</span>
                <span class="variable-name">${variable.name}</span>
                <span class="solve-hint" data-symbol="${variable.symbol}">Leave empty to calculate this</span>
            </label>
            <div class="unit-inputs-container">
                ${inputFieldsHTML}
            </div>
            <div class="var-description">${variable.description}</div>
            <div class="na-option">
                <label class="na-checkbox-label" for="na-${variable.symbol}">
                    <input type="checkbox" class="na-checkbox" id="na-${variable.symbol}" name="na-${variable.symbol}" data-symbol="${variable.symbol}" aria-label="Mark ${variable.symbol} as unknown">
                    <span>Mark as unknown (use as variable in symbolic calculations)</span>
                </label>
            </div>
        `;
        
        container.appendChild(inputDiv);
        
        // Cache DOM queries to avoid repeated lookups
        const inputElements = alternativeUnits.map((unit, currentIndex) => {
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            return { input: document.getElementById(inputId), unit, currentIndex };
        }).filter(item => item.input !== null);
        
        // Add input listeners to all unit input fields
        inputElements.forEach(({ input, currentIndex }) => {
            if (input) {
                // FIXED: Store listeners for cleanup
                const inputListener = (e) => {
                    const currentValue = e.target.value.trim();
                    if (currentValue && currentValue.toLowerCase() !== 'null') {
                        // Clear other unit inputs for this variable (using cached elements)
                        inputElements.forEach(({ input: otherInput, currentIndex: otherIndex }) => {
                            if (otherIndex !== currentIndex && otherInput) {
                                otherInput.value = '';
                            }
                        });
                    }
                    
                    // PERFORMANCE FIX: Debounce solve indicators and graph updates together
                    // Remove immediate call to prevent duplicate DOM operations
                    clearTimeout(input.solveIndicatorTimeout);
                    input.solveIndicatorTimeout = setTimeout(() => {
                        updateSolveIndicators();
                        // Also update graph in real-time as user types
                        if (graphManager && currentFormula) {
                            const variableValues = getCurrentVariableValues();
                            graphManager.updateGraph(currentFormula, variableValues);
                        }
                    }, TIMING.DEBOUNCE_INDICATORS);
                };
                input.addEventListener('input', inputListener);
                activeInputListeners.set(input, { inputListener });
            }
        });
        
        // Add N/A checkbox listener
        const naCheckbox = inputDiv.querySelector(`.na-checkbox[data-symbol="${variable.symbol}"]`);
        if (naCheckbox) {
            // FIXED: Store listener for cleanup
            const changeListener = (e) => {
                // Clear all input fields for this variable when N/A is checked (using cached elements)
                if (e.target.checked) {
                    inputElements.forEach(({ input }) => {
                        if (input) input.value = '';
                    });
                }
                // PERFORMANCE FIX: Debounce solve indicators and graph updates
                clearTimeout(naCheckbox.updateTimeout);
                naCheckbox.updateTimeout = setTimeout(() => {
                    updateSolveIndicators();
                    // Update graph when N/A checkbox changes
                    if (graphManager && currentFormula) {
                        const variableValues = getCurrentVariableValues();
                        graphManager.updateGraph(currentFormula, variableValues);
                    }
                }, TIMING.DEBOUNCE_INDICATORS);
            };
            naCheckbox.addEventListener('change', changeListener);
            activeInputListeners.set(naCheckbox, { changeListener });
        }
    });
    
    // Initial update of solve indicators
    setTimeout(() => {
        updateSolveIndicators();
    }, TIMING.INIT_RETRY_DELAY);
    
    // COMPETITIVE OPTIMIZATION: Auto-focus first input for maximum efficiency
    const firstInput = container.querySelector('.unit-input-field');
    if (firstInput) {
        setTimeout(() => {
            firstInput.focus();
        }, TIMING.AUTO_FOCUS_DELAY);
    }
    
    // COMPETITIVE OPTIMIZATION: Enhanced keyboard navigation
    // Tab key navigates between inputs, Enter calculates
    const allInputs = container.querySelectorAll('.unit-input-field');
    allInputs.forEach((input, index) => {
        // FIXED: Store listener for cleanup
        const keydownListener = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                // If all but one variable is filled, calculate immediately
                const filledCount = Array.from(allInputs).filter(inp => inp.value.trim()).length;
                if (filledCount >= userVariables.length - 1) {
                    performCalculation();
                } else {
                    // Otherwise, move to next input
                    const nextIndex = (index + 1) % allInputs.length;
                    allInputs[nextIndex].focus();
                }
            } else if (e.key === 'Tab' && !e.shiftKey) {
                // Allow normal Tab navigation but ensure it's smooth
                const nextIndex = (index + 1) % allInputs.length;
                if (nextIndex === 0) {
                    // Wrap around - focus calculate button
                    const calcBtn = document.getElementById('calculate-btn');
                    if (calcBtn) {
                        e.preventDefault();
                        calcBtn.focus();
                    }
                }
            }
        };
        input.addEventListener('keydown', keydownListener);
        // Update stored listener if exists, otherwise add new entry
        const existing = activeInputListeners.get(input);
        if (existing) {
            existing.keydownListener = keydownListener;
        } else {
            activeInputListeners.set(input, { keydownListener });
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
        // FIXED: Cleanup resources to prevent memory leaks
        cleanupGlobalState();
        
        document.getElementById('input-screen').classList.remove('active');
        document.getElementById('formula-selection').classList.add('active');
    });
    
    // Main page tab buttons (Formulas/Classification)
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
        addTrackedListener(btn, 'click', () => {
            const tabName = btn.getAttribute('data-main-tab');
            switchMainTab(tabName);
        });
    });
    
    // Input screen tab buttons (Calculator/Graph/Classification)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        addTrackedListener(btn, 'click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Calculate button
    const calcBtn = document.getElementById('calculate-btn');
    if (calcBtn) {
        addTrackedListener(calcBtn, 'click', performCalculation);
    }
    
    // Classification button (in input screen)
    const classifyBtn = document.getElementById('classify-btn');
    if (classifyBtn) {
        classifyBtn.addEventListener('click', performClassification);
    }
    
    // Main page classification button
    const mainClassifyBtn = document.getElementById('main-classify-btn');
    if (mainClassifyBtn) {
        mainClassifyBtn.addEventListener('click', performMainClassification);
    }
    
    // Protostar checkbox handlers - clear luminosity/white dwarf selection if protostar is checked
    const mainProtostarCheckbox = document.getElementById('main-protostar-checkbox');
    if (mainProtostarCheckbox) {
        mainProtostarCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                const luminositySelect = document.getElementById('main-luminosity-class');
                if (luminositySelect) luminositySelect.value = '';
            }
        });
    }
    
    const protostarCheckbox = document.getElementById('protostar-checkbox');
    if (protostarCheckbox) {
        protostarCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                const luminositySelect = document.getElementById('calc-classification-luminosity-class');
                if (luminositySelect) luminositySelect.value = '';
            }
        });
    }
    
    // Luminosity/White Dwarf dropdown handlers - uncheck protostar if selection is made
    const mainLuminositySelect = document.getElementById('main-luminosity-class');
    if (mainLuminositySelect) {
        mainLuminositySelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const protostarCheckbox = document.getElementById('main-protostar-checkbox');
                if (protostarCheckbox) protostarCheckbox.checked = false;
            }
        });
    }
    
    const luminositySelect = document.getElementById('calc-classification-luminosity-class');
    if (luminositySelect) {
        luminositySelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const protostarCheckbox = document.getElementById('protostar-checkbox');
                if (protostarCheckbox) protostarCheckbox.checked = false;
            }
        });
    }
    
    // Allow Enter key in classification temperature inputs
    const tempInput = document.getElementById('calc-classification-temperature-input');
    if (tempInput) {
        tempInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performClassification();
            }
        });
    }
    
    const mainTempInput = document.getElementById('main-temperature-input');
    if (mainTempInput) {
        mainTempInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performMainClassification();
            }
        });
    }
    
    // Clear button
    document.getElementById('clear-btn').addEventListener('click', () => {
        // Get list of constant symbols to exclude
        const constantSymbols = new Set();
        if (currentFormula && currentFormula.constants) {
            Object.keys(currentFormula.constants).forEach(key => {
                constantSymbols.add(key);
                if (key === 'pi' || key === 'π') constantSymbols.add('π');
                if (key === 'G') constantSymbols.add('G');
                if (key === 'c') constantSymbols.add('c');
                if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
            });
        }
        
        const userVariables = currentFormula ? currentFormula.variables.filter(v => !constantSymbols.has(v.symbol)) : [];
        
        userVariables.forEach(variable => {
            const baseUnit = variable.unit;
            const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
            
            // Clear all unit input fields for this variable
            alternativeUnits.forEach(unit => {
                const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const input = document.getElementById(inputId);
                if (input) input.value = '';
            });
        });
        
        document.getElementById('result-display').classList.remove('show');
        updateSolveIndicators();
    });
    
    // COMPETITIVE OPTIMIZATION: Enhanced Enter key handling
    // Enter calculates when ready, or navigates when not ready
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && document.getElementById('input-screen').classList.contains('active')) {
            // Check if we're in an input field
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains('unit-input-field')) {
                // Let input field handler manage it
                return;
            }
            // If focus is on calculate button or elsewhere, calculate
            if (activeElement && activeElement.id === 'calculate-btn') {
                e.preventDefault();
                performCalculation();
            } else {
                // Try to calculate if ready
                const allInputs = document.querySelectorAll('.unit-input-field');
                const filledCount = Array.from(allInputs).filter(inp => inp.value.trim() && 
                    inp.value.toLowerCase() !== 'null' && 
                    inp.value.toLowerCase() !== 'n/a' &&
                    inp.value.toLowerCase() !== 'na').length;
                const userVariables = currentFormula ? currentFormula.variables.filter(v => {
                    const constantSymbols = new Set();
                    if (currentFormula.constants) {
                        Object.keys(currentFormula.constants).forEach(key => constantSymbols.add(key));
                    }
                    return !constantSymbols.has(v.symbol);
                }) : [];
                
                if (filledCount >= userVariables.length - 1) {
                    e.preventDefault();
                    performCalculation();
                }
            }
        }
    });
}

// Switch between main page tabs (Formulas/Classification/Desmos)
function switchMainTab(tabName) {
    // Update main tab buttons
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-main-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update main tab content
    document.querySelectorAll('.main-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tabName === 'formulas') {
        document.getElementById('main-formulas-tab').classList.add('active');
    } else if (tabName === 'explorer') {
        document.getElementById('main-explorer-tab').classList.add('active');
        // Initialize Formula Explorer
        if (typeof initFormulaExplorer === 'function') {
            initFormulaExplorer();
        }
    } else if (tabName === 'classification') {
        document.getElementById('main-classification-tab').classList.add('active');
        // Initialize classifier if needed
        if (!stellarClassifier) {
            stellarClassifier = new StellarClassifier();
        }
    }
}

// Switch between calculator, graph, and classification tabs (in input screen)
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tabName === 'calculator') {
        const calculatorTab = document.getElementById('calculator-tab');
        calculatorTab.classList.add('active');
        calculatorTab.setAttribute('aria-hidden', 'false');
    } else if (tabName === 'graph') {
        const graphTab = document.getElementById('graph-tab');
        graphTab.classList.add('active');
        graphTab.setAttribute('aria-hidden', 'false');
        // Update graph when tab becomes active
        if (graphManager && currentFormula) {
            // Get current variable values from inputs
            const variableValues = getCurrentVariableValues();
            graphManager.updateGraph(currentFormula, variableValues);
        }
    } else if (tabName === 'classification') {
        const classificationTab = document.getElementById('classification-tab');
        classificationTab.classList.add('active');
        classificationTab.setAttribute('aria-hidden', 'false');
        // Initialize classifier if needed
        if (!stellarClassifier) {
            stellarClassifier = new StellarClassifier();
        }
    }
}

// Get current variable values from inputs
function getCurrentVariableValues() {
    const variableValues = {};
    if (!currentFormula) return variableValues;
    
    // Get list of constant symbols to exclude
    const constantSymbols = new Set();
    if (currentFormula.constants) {
        Object.keys(currentFormula.constants).forEach(key => {
            constantSymbols.add(key);
            if (key === 'pi' || key === 'π') constantSymbols.add('π');
            if (key === 'G') constantSymbols.add('G');
            if (key === 'c') constantSymbols.add('c');
            if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
        });
    }
    
    const userVariables = currentFormula.variables.filter(v => !constantSymbols.has(v.symbol));
    
    // Collect current variable values using ID-based approach with data-unit-index fallback
    userVariables.forEach(variable => {
        const baseUnit = variable.unit;
        const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
        
        // Find which input field has a value (use ID-based selection with fallback)
        let foundValue = null;
        let foundUnit = null;
        
        for (let i = 0; i < alternativeUnits.length; i++) {
            const unit = alternativeUnits[i];
            // Primary: ID-based selection
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            let input = document.getElementById(inputId);
            
            // Fallback: data-unit-index selector (for robustness)
            if (!input) {
                input = document.querySelector(`input[data-symbol="${variable.symbol}"][data-unit-index="${i}"]`);
            }
            
            if (input) {
                const value = input.value.trim();
                if (value && 
                    value.toLowerCase() !== 'null' && 
                    value.toLowerCase() !== 'n/a' && 
                    value.toLowerCase() !== 'na' &&
                    value.toLowerCase() !== 'idk') {
                    foundValue = value;
                    foundUnit = unit;
                    break;
                }
            }
        }
        
        if (foundValue) {
            try {
                const parsedValue = ExpressionParser.parse(foundValue, foundUnit);
                if (parsedValue !== null && typeof parsedValue === 'number' && !isNaN(parsedValue) && isFinite(parsedValue)) {
                    const baseValue = UnitConverter.convertToBase(parsedValue, foundUnit, baseUnit);
                    variableValues[variable.symbol] = baseValue;
                }
            } catch (e) {
                // Skip invalid values
            }
        }
    });
    
    return variableValues;
}

// Update graph based on current inputs
// Graph functionality removed - users can use offline tools like Desmos

// Perform the calculation
function performCalculation() {
    if (!calculator || !currentFormula) {
        return;
    }
    
    // Get list of constant symbols to exclude
    const constantSymbols = new Set();
    if (currentFormula.constants) {
        Object.keys(currentFormula.constants).forEach(key => {
            constantSymbols.add(key);
            if (key === 'pi' || key === 'π') constantSymbols.add('π');
            if (key === 'G') constantSymbols.add('G');
            if (key === 'c') constantSymbols.add('c');
            if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
        });
    }
    
    const userVariables = currentFormula.variables.filter(v => !constantSymbols.has(v.symbol));
    
    // Collect variable values
    const variableValues = {};
    userVariables.forEach(variable => {
        const baseUnit = variable.unit;
        const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
        
        // Find which input field has a value (ID-based with data-unit-index fallback)
        let foundValue = null;
        let foundUnit = null;
        
        for (let i = 0; i < alternativeUnits.length; i++) {
            const unit = alternativeUnits[i];
            // Primary: ID-based selection
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            let input = document.getElementById(inputId);
            
            // Fallback: data-unit-index selector (for robustness)
            if (!input) {
                input = document.querySelector(`input[data-symbol="${variable.symbol}"][data-unit-index="${i}"]`);
            }
            
            if (input) {
                const value = input.value.trim();
                if (value && 
                    value.toLowerCase() !== 'null' && 
                    value.toLowerCase() !== 'n/a' && 
                    value.toLowerCase() !== 'na' &&
                    value.toLowerCase() !== 'idk') {
                    foundValue = value;
                    foundUnit = unit;
                    break;
                }
            }
        }
        
        // Check for N/A checkbox
        const naCheckbox = document.querySelector(`.na-checkbox[data-symbol="${variable.symbol}"]`);
        const isNA = naCheckbox && naCheckbox.checked;
        
        // Convert 'null', 'N/A', 'IDK', empty, or N/A checkbox to null
        if (!foundValue || foundValue === '' || 
            foundValue.toLowerCase() === 'null' || 
            foundValue.toLowerCase() === 'n/a' || 
            foundValue.toLowerCase() === 'na' ||
            foundValue.toLowerCase() === 'idk' ||
            isNA) {
            variableValues[variable.symbol] = isNA ? 'N/A' : null;
        } else {
            // Try to parse as mathematical expression
            try {
                // Pass the unit to the parser so it can handle degree/radian conversion
                const parsedValue = ExpressionParser.parse(foundValue, foundUnit);
                if (parsedValue === null) {
                    variableValues[variable.symbol] = null;
                } else if (typeof parsedValue === 'number' && !isNaN(parsedValue) && isFinite(parsedValue)) {
                    // Convert to base unit
                    const baseValue = UnitConverter.convertToBase(parsedValue, foundUnit, baseUnit);
                    variableValues[variable.symbol] = baseValue;
                } else {
                    throw new Error(`Could not parse "${foundValue}" as a number`);
                }
            } catch (error) {
                // Show a more helpful error message
                const isAngle = baseUnit.toLowerCase().includes('radian') || baseUnit.toLowerCase().includes('rad');
                const angleHint = isAngle ? ' You can use degrees (45°) or radians (pi/4).' : '';
                displayError(`Invalid input for ${variable.symbol}: "${foundValue}". ${error.message || 'Please enter a number or mathematical expression (e.g., pi/4, 2*pi, etc.)'}${angleHint}`);
                return;
            }
        }
    });
    
    // Perform calculation
    try {
        const result = calculator.solve(variableValues);
        // DEBUG: Log result for troubleshooting
        console.log('[Calculation] Result from calculator:', result);
        displayResult(result);
        // Update solve indicators
        updateSolveIndicators();
        // Update graph with new values
        if (graphManager && currentFormula) {
            graphManager.updateGraph(currentFormula, variableValues);
        }
    } catch (error) {
        console.error('[Calculation] Error:', error);
        
        // ENHANCED: Handle CalculationError with structured context
        let errorMessage = error.message;
        
        // Extract user-friendly message from CalculationError if available
        if (error instanceof CalculationError) {
            errorMessage = error.getUserMessage();
            console.error('[Calculation] CalculationError context:', error.toJSON());
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        // Improve error messages with context
        if (errorMessage.includes('null values')) {
            errorMessage = 'You can leave multiple variables empty or mark them as N/A to get a symbolic expression. For a numeric result, leave exactly one variable empty.';
        } else if (errorMessage.includes('must be null') || errorMessage.includes('must be unknown')) {
            errorMessage = 'Please leave at least one variable empty (or set to "null") to solve for it, or mark variables as N/A for symbolic results.';
        } else if (errorMessage.includes('Invalid number') || errorMessage.includes('Cannot parse')) {
            errorMessage = 'Please enter valid numbers. You can use expressions like "2*pi", "1e10", or "45°" for angles. Use "N/A" for variables you don\'t know.';
        } else if (errorMessage.includes('cannot be zero') || errorMessage.includes('Division by zero')) {
            errorMessage = `Division by zero error: ${errorMessage}. Please check your input values.`;
        } else if (errorMessage.includes('must be positive')) {
            errorMessage = `Invalid input: ${errorMessage}. Please enter a positive value.`;
        } else if (errorMessage.includes('not a finite number')) {
            errorMessage = `Calculation error: ${errorMessage}. Please check your input values and see the browser console for details.`;
        }
        
        displayError(errorMessage);
    }
}

// Display calculation result
function displayResult(result) {
    const resultDisplay = document.getElementById('result-display');
    
    // FIXED: Use correct property names from calculator return format
    // Calculator returns: { solvedFor, result, unit, isSymbolic }
    const solvedVar = result.solvedFor || result.variable;
    const varInfo = currentFormula.variables.find(v => v.symbol === solvedVar);
    
    // FIXED: Get the actual result value (calculator returns 'result' property, not 'value')
    const resultValue = result.result !== undefined ? result.result : (result.value !== undefined ? result.value : null);
    
    // DEBUG: Log for troubleshooting finite number issues
    console.log('[DisplayResult] Full result object:', JSON.stringify(result, null, 2));
    console.log('[DisplayResult] Result value:', resultValue, 'Type:', typeof resultValue);
    console.log('[DisplayResult] Validation checks:', {
        isNull: resultValue === null,
        isUndefined: resultValue === undefined,
        isString: typeof resultValue === 'string',
        isNumber: typeof resultValue === 'number',
        isNaN: isNaN(resultValue),
        isInfinity: resultValue === Infinity || resultValue === -Infinity,
        isFinite: isFinite(resultValue),
        stringValue: String(resultValue)
    });
    
    if (resultValue === null || resultValue === undefined) {
        console.error('[DisplayResult] Result value is null/undefined:', result);
        displayError('No result value returned. Please check your inputs.');
        return;
    }
    
    // Check if this is a symbolic result
    if (result.isSymbolic || (typeof resultValue === 'string' && 
        (resultValue.includes('√') || resultValue.includes('×') || 
         resultValue.includes('log') || resultValue.includes('^') ||
         resultValue.match(/[a-zA-Z_]/)))) {
        displaySymbolicResult(result, varInfo);
        return;
    }
    
    // Ensure resultValue is always a numeric value, not an expression
    let numericValue = resultValue;
    
    // Handle different number formats
    if (typeof numericValue === 'string') {
        // If somehow we got a string, try to parse it
        try {
            numericValue = ExpressionParser.parse(numericValue);
        } catch (e) {
            numericValue = parseFloat(numericValue);
            if (isNaN(numericValue)) {
                console.error('[DisplayResult] Failed to parse string as number:', numericValue);
                displayError('Invalid result value. Please check your inputs.');
                return;
            }
        }
    }
    
    // ENHANCED: Better validation for very large/small numbers
    // Check if it's actually a number type
    if (typeof numericValue !== 'number') {
        console.error('[DisplayResult] Result is not a number type:', {
            numericValue: numericValue,
            type: typeof numericValue,
            originalResult: result
        });
        displayError(`Invalid result type: ${typeof numericValue}. Expected a number.`);
        return;
    }
    
    // Check for NaN (must check before isFinite, as isFinite(NaN) is false)
    if (isNaN(numericValue)) {
        console.error('[DisplayResult] Result is NaN:', {
            numericValue: numericValue,
            originalResult: result,
            resultValue: resultValue
        });
        displayError('Result is NaN (Not a Number). Please check your inputs.');
        return;
    }
    
    // ENHANCED: Check for Infinity separately with better message
    // Note: isFinite(Infinity) returns false, so we check this before isFinite
    if (numericValue === Infinity || numericValue === -Infinity) {
        console.error('[DisplayResult] Result is Infinity:', {
            numericValue: numericValue,
            originalResult: result,
            resultValue: resultValue
        });
        displayError('Result is infinite. This may indicate division by zero or extremely large values. Please check your input values.');
        return;
    }
    
    // ENHANCED: More detailed finite number check with debugging
    // Note: isFinite returns false for NaN, Infinity, and -Infinity
    // We've already checked for NaN and Infinity above, so if we get here and isFinite is false,
    // it might be a very large number that's being incorrectly flagged
    const isFiniteValue = isFinite(numericValue);
    if (!isFiniteValue) {
        console.error('[DisplayResult] Finite check failed:', {
            numericValue: numericValue,
            type: typeof numericValue,
            isNaN: isNaN(numericValue),
            isInfinity: numericValue === Infinity || numericValue === -Infinity,
            isFinite: isFiniteValue,
            originalResult: result,
            resultValue: resultValue,
            stringValue: String(numericValue)
        });
        
        // This should never happen if our checks above are correct
        // But if it does, we've already logged it, so just show the error
        displayError(`Result is not a finite number (got: ${numericValue}). Please check your inputs and see the browser console for details.`);
        return;
    }
    
    // DEBUG: Log successful validation
    console.log('[DisplayResult] Result validated successfully:', numericValue);
    
    // Format the original value (always numeric)
    const formattedValue = UnitConverter.formatNumber(numericValue);
    const unitName = UnitConverter.formatUnit(result.unit);
    
    // Get unit conversion
    const conversion = UnitConverter.convertAndFormat(numericValue, result.unit);
    
    // Build result HTML
    let resultHTML = `
        <h3>Result</h3>
        <div class="result-value">${formattedValue}</div>
        <div class="result-unit">${varInfo ? varInfo.name : solvedVar} (${result.unit || ''})</div>
        <div class="result-unit-full">${unitName}</div>
    `;
    
    // Add converted value if available
    if (conversion && conversion.unit && conversion.unit !== result.unit && conversion.value !== numericValue) {
        const convertedFormatted = UnitConverter.formatNumber(conversion.value);
        const convertedUnitName = UnitConverter.formatUnit(conversion.unit);
        resultHTML += `
            <div class="result-converted">
                <div class="converted-label">Also:</div>
                <div class="converted-value">${convertedFormatted} ${conversion.unit}</div>
                <div class="converted-unit">${convertedUnitName}</div>
            </div>
        `;
    }
    
    // For radians, always show degrees conversion if not already shown
    const isRadians = result.unit.toLowerCase().includes('radian') || result.unit.toLowerCase().includes('rad');
    if (isRadians && (!conversion || conversion.unit !== 'degrees')) {
        const degreesValue = numericValue * 180 / Math.PI;
        const degreesFormatted = UnitConverter.formatNumber(degreesValue);
        resultHTML += `
            <div class="result-converted">
                <div class="converted-label">Also in degrees:</div>
                <div class="converted-value">${degreesFormatted}°</div>
                <div class="converted-unit">degrees</div>
            </div>
        `;
    }
    
    resultDisplay.innerHTML = resultHTML;
    resultDisplay.classList.add('show');
    
    // Scroll to result
    resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display error message
function displayError(message) {
    const resultDisplay = document.getElementById('result-display');
    resultDisplay.innerHTML = `
        <div class="error-message">${message}</div>
    `;
    resultDisplay.classList.add('show');
    
    // Scroll to error
    resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display symbolic result (when N/A variables are used)
function displaySymbolicResult(result, varInfo) {
    const resultDisplay = document.getElementById('result-display');
    
    // FIXED: Use correct property - calculator returns 'result' for symbolic expressions too
    const expression = result.result || result.value || '';
    const unitName = UnitConverter.formatUnit(result.unit);
    
    let resultHTML = `
        <h3>Symbolic Result</h3>
    `;
    
    // If we have a system of equations, display all of them
    if (result.allEquations && result.allEquations.length > 1) {
        resultHTML += `<div class="system-of-equations">`;
        result.allEquations.forEach((eq, index) => {
            const eqVarInfo = currentFormula.variables.find(v => v.symbol === eq.variable);
            resultHTML += `
                <div class="equation-item">
                    <div class="result-value symbolic-result">${eq.variable} = ${eq.expression}</div>
                    <div class="result-unit">${eqVarInfo ? eqVarInfo.name : eq.variable} (${eq.unit})</div>
                </div>
            `;
        });
        resultHTML += `</div>`;
    } else {
        // Single equation
        // FIXED: Use solvedFor instead of variable for consistency
        const solvedVar = result.solvedFor || result.variable || 'unknown';
        resultHTML += `
            <div class="result-value symbolic-result">${solvedVar} = ${expression}</div>
            <div class="result-unit">${varInfo ? varInfo.name : solvedVar} (${result.unit || ''})</div>
            <div class="result-unit-full">${unitName}</div>
        `;
    }
    
    if (result.otherUnknowns && result.otherUnknowns.length > 0) {
        const otherVars = result.otherUnknowns.map(symbol => {
            const v = currentFormula.variables.find(v => v.symbol === symbol);
            return v ? `${symbol} (${v.name})` : symbol;
        }).join(', ');
        resultHTML += `
            <div class="symbolic-note">
                <p><strong>Note:</strong> This expression also depends on: ${otherVars}</p>
                <p>Enter values for these variables to get a numeric result, or mark them as N/A to keep them as variables.</p>
            </div>
        `;
    } else if (!result.allEquations || result.allEquations.length === 1) {
        resultHTML += `
            <div class="symbolic-note">
                <p><strong>Note:</strong> This is a symbolic expression. Enter values for all variables to get a numeric result.</p>
            </div>
        `;
    }
    
    resultDisplay.innerHTML = resultHTML;
    resultDisplay.classList.add('show');
    
    // Scroll to result
    resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Perform stellar classification
function performClassification() {
    if (!stellarClassifier) {
        stellarClassifier = new StellarClassifier();
    }
    
    const temperatureInput = document.getElementById('calc-classification-temperature-input');
    const luminositySelect = document.getElementById('calc-classification-luminosity-class');
    const protostarCheckbox = document.getElementById('protostar-checkbox');
    const resultDisplay = document.getElementById('classification-result');
    
    if (!temperatureInput || !resultDisplay) {
        return;
    }
    
    const temperature = parseFloat(temperatureInput.value);
    const selectedValue = luminositySelect ? luminositySelect.value : '';
    
    // Determine if it's a white dwarf type or luminosity class
    const whiteDwarfTypes = ['DA', 'DB', 'DC', 'DO', 'DQ', 'DZ', 'DX'];
    const isWhiteDwarf = whiteDwarfTypes.includes(selectedValue);
    const whiteDwarfType = isWhiteDwarf ? selectedValue : '';
    const luminosityClass = isWhiteDwarf ? '' : selectedValue;
    
    const isProtostar = protostarCheckbox ? protostarCheckbox.checked : false;
    
    // Validate input
    if (!temperature || isNaN(temperature) || temperature <= 0) {
        displayClassificationError('Please enter a valid temperature (positive number in Kelvin)');
        return;
    }
    
    try {
        const classification = stellarClassifier.classify(temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
        displayClassificationResult(classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
    } catch (error) {
        displayClassificationError(error.message);
    }
}

// Display classification result
function displayClassificationResult(classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType) {
    const resultDisplay = document.getElementById('classification-result');
    if (!resultDisplay) return;
    
    let resultHTML = '<div class="classification-result-content">';
    resultHTML += '<h4>Classification Result</h4>';
    resultHTML += `<div class="classification-value">${classification}</div>`;
    
    // Add details
    resultHTML += '<div class="classification-details">';
    resultHTML += `<p><strong>Temperature:</strong> ${UnitConverter.formatNumber(temperature)} K</p>`;
    
    if (isWhiteDwarf && whiteDwarfType) {
        const wdDesc = stellarClassifier.getWhiteDwarfDescription(whiteDwarfType);
        resultHTML += `<p><strong>Type:</strong> White Dwarf</p>`;
        resultHTML += `<p><strong>White Dwarf Type:</strong> ${whiteDwarfType} (${wdDesc})</p>`;
    } else if (isProtostar) {
        resultHTML += '<p><strong>Type:</strong> Young Stellar Object (YSO)</p>';
    } else {
        if (luminosityClass) {
            const desc = stellarClassifier.getLuminosityDescription(luminosityClass);
            resultHTML += `<p><strong>Luminosity Class:</strong> ${luminosityClass} (${desc})</p>`;
        }
    }
    resultHTML += '</div>';
    
    resultHTML += '</div>';
    
    resultDisplay.innerHTML = resultHTML;
    resultDisplay.classList.add('show');
}

// Perform classification from main page
function performMainClassification() {
    if (!stellarClassifier) {
        stellarClassifier = new StellarClassifier();
    }
    
    const temperatureInput = document.getElementById('main-temperature-input');
    const luminositySelect = document.getElementById('main-luminosity-class');
    const protostarCheckbox = document.getElementById('main-protostar-checkbox');
    const resultDisplay = document.getElementById('main-classification-result');
    
    if (!temperatureInput || !resultDisplay) {
        return;
    }
    
    const temperature = parseFloat(temperatureInput.value);
    const selectedValue = luminositySelect ? luminositySelect.value : '';
    
    // Determine if it's a white dwarf type or luminosity class
    const whiteDwarfTypes = ['DA', 'DB', 'DC', 'DO', 'DQ', 'DZ', 'DX'];
    const isWhiteDwarf = whiteDwarfTypes.includes(selectedValue);
    const whiteDwarfType = isWhiteDwarf ? selectedValue : '';
    const luminosityClass = isWhiteDwarf ? '' : selectedValue;
    
    const isProtostar = protostarCheckbox ? protostarCheckbox.checked : false;
    
    // Validate input
    if (!temperature || isNaN(temperature) || temperature <= 0) {
        displayMainClassificationError('Please enter a valid temperature (positive number in Kelvin)');
        return;
    }
    
    try {
        const classification = stellarClassifier.classify(temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
        displayMainClassificationResult(classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
    } catch (error) {
        displayMainClassificationError(error.message);
    }
}

// Display classification result on main page
function displayMainClassificationResult(classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType) {
    const resultDisplay = document.getElementById('main-classification-result');
    if (!resultDisplay) return;
    
    let resultHTML = '<div class="classification-result-content">';
    resultHTML += '<h4>Classification Result</h4>';
    resultHTML += `<div class="classification-value">${classification}</div>`;
    
    // Add details
    resultHTML += '<div class="classification-details">';
    resultHTML += `<p><strong>Temperature:</strong> ${UnitConverter.formatNumber(temperature)} K</p>`;
    
    if (isWhiteDwarf && whiteDwarfType) {
        const wdDesc = stellarClassifier.getWhiteDwarfDescription(whiteDwarfType);
        resultHTML += `<p><strong>Type:</strong> White Dwarf</p>`;
        resultHTML += `<p><strong>White Dwarf Type:</strong> ${whiteDwarfType} (${wdDesc})</p>`;
    } else if (isProtostar) {
        resultHTML += '<p><strong>Type:</strong> Young Stellar Object (YSO)</p>';
    } else {
        if (luminosityClass) {
            const desc = stellarClassifier.getLuminosityDescription(luminosityClass);
            resultHTML += `<p><strong>Luminosity Class:</strong> ${luminosityClass} (${desc})</p>`;
        }
    }
    resultHTML += '</div>';
    
    resultHTML += '</div>';
    
    resultDisplay.innerHTML = resultHTML;
    resultDisplay.classList.add('show');
}

// Display classification error on main page
function displayMainClassificationError(message) {
    const resultDisplay = document.getElementById('main-classification-result');
    if (!resultDisplay) return;
    
    resultDisplay.innerHTML = `
        <div class="classification-error">${message}</div>
    `;
    resultDisplay.classList.add('show');
}

// Display classification error (in input screen)
function displayClassificationError(message) {
    const resultDisplay = document.getElementById('classification-result');
    if (!resultDisplay) return;
    
    resultDisplay.innerHTML = `
        <div class="classification-error">${message}</div>
    `;
    resultDisplay.classList.add('show');
}

// Get example value for a variable based on its symbol and unit
function getExampleValue(symbol, unit) {
    const examples = {
        'T': { 'seconds': '86400', 'years': '1', 'hours': '24' },
        'a': { 'meters': '1.5e11', 'AU': '1' },
        'M': { 'kg': '1.989e30', 'M_☉': '1' },
        'v': { 'm/s': '30000', 'km/s': '30' },
        'r': { 'meters': '6.37e6', 'km': '6371' },
        'd': { 'meters': '1.5e11', 'parsecs': '1', 'AU': '1' },
        'R': { 'meters': '6.96e8', 'km': '696000' },
        'L': { 'W': '3.828e26', 'L_☉': '1' },
        'F': { 'W/m²': '1361', 'W/m²': '1e-10' },
        'T': { 'Kelvin': '5778', 'K': '6000' },
        'λmax': { 'meters': '5e-7', 'nm': '500' },
        'θ': { 'radians': '0.01', 'arcseconds': '206265' },
        'p': { 'arcseconds': '0.1', 'radians': '1e-6' },
        'H₀': { 'km/(s·Mpc)': '70' },
        'g': { 'm/s²': '9.81' },
        'ρ': { 'kg/m³': '5500' },
        'P': { 'seconds': '86400', 'years': '1' },
        'P_rot': { 'seconds': '86400', 'hours': '24' }
    };
    
    const unitKey = unit.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (examples[symbol] && examples[symbol][unit]) {
        return examples[symbol][unit];
    }
    // Try to find any example for this symbol
    if (examples[symbol]) {
        const firstKey = Object.keys(examples[symbol])[0];
        return examples[symbol][firstKey];
    }
    return null;
}

// Get variable-specific instruction text
function getVariableInstruction(variable, formula, isWillSolve) {
    const symbol = variable.symbol;
    const name = variable.name;
    const description = variable.description;
    const exampleValue = getExampleValue(symbol, variable.unit);
    
    let instruction = '';
    
    if (isWillSolve) {
        // Instruction when this variable will be solved
        instruction = `💡 <strong>Solving for ${symbol} (${name}):</strong> `;
        
        // Add formula-specific context
        const formulaId = formula.id;
        switch (formulaId) {
            case 'kepler_third_law':
                if (symbol === 'T') {
                    instruction += `Enter the semi-major axis (a) and central mass (M) to calculate the orbital period. For example, Earth's orbit: a = 1.5×10¹¹ m, M = 1.99×10³⁰ kg.`;
                } else if (symbol === 'a') {
                    instruction += `Enter the orbital period (T) and central mass (M) to find the semi-major axis. For example, a 1-year orbit around the Sun: T = 3.16×10⁷ s, M = 1.99×10³⁰ kg.`;
                } else if (symbol === 'M') {
                    instruction += `Enter the orbital period (T) and semi-major axis (a) to determine the central mass. This is useful for finding stellar masses from planetary orbits.`;
                }
                break;
                
            case 'orbital_velocity':
                if (symbol === 'v') {
                    instruction += `Enter the orbital radius (r) and central mass (M) to calculate orbital speed. For Earth: r = 1.5×10¹¹ m, M = 1.99×10³⁰ kg gives v ≈ 30 km/s.`;
                } else if (symbol === 'r') {
                    instruction += `Enter the orbital velocity (v) and central mass (M) to find the orbital radius. Higher velocities mean closer orbits.`;
                } else if (symbol === 'M') {
                    instruction += `Enter the orbital velocity (v) and radius (r) to determine the central mass. This is how we measure stellar masses.`;
                }
                break;
                
            case 'escape_velocity':
                if (symbol === 'v_esc') {
                    instruction += `Enter the radius (r) and mass (M) to find escape velocity. For Earth: r = 6.37×10⁶ m, M = 5.97×10²⁴ kg gives v_esc ≈ 11.2 km/s.`;
                } else if (symbol === 'r') {
                    instruction += `Enter escape velocity (v_esc) and mass (M) to find the radius. Larger masses require larger escape velocities.`;
                } else if (symbol === 'M') {
                    instruction += `Enter escape velocity (v_esc) and radius (r) to determine the mass. This helps characterize planetary and stellar bodies.`;
                }
                break;
                
            case 'angular_size':
                if (symbol === 'θ') {
                    instruction += `Enter the physical diameter (d) and distance (D) to calculate angular size. For the Moon: d = 3.47×10⁶ m, D = 3.84×10⁸ m gives θ ≈ 0.009 rad.`;
                } else if (symbol === 'd') {
                    instruction += `Enter the angular size (θ) and distance (D) to find the physical diameter. Useful for determining sizes of distant objects.`;
                } else if (symbol === 'D') {
                    instruction += `Enter the angular size (θ) and physical diameter (d) to calculate distance. This is the basis of parallax and angular size distance measurements.`;
                }
                break;
                
            case 'distance_modulus':
                if (symbol === 'm') {
                    instruction += `Enter absolute magnitude (M) and distance (d) to find apparent magnitude. Brighter stars have lower (more negative) magnitudes.`;
                } else if (symbol === 'M') {
                    instruction += `Enter apparent magnitude (m) and distance (d) to find absolute magnitude. This tells you the star's intrinsic brightness.`;
                } else if (symbol === 'd') {
                    instruction += `Enter apparent magnitude (m) and absolute magnitude (M) to calculate distance. The difference m - M is called the distance modulus.`;
                }
                break;
                
            case 'luminosity':
                if (symbol === 'L') {
                    instruction += `Enter radius (R) and temperature (T) to calculate luminosity. For the Sun: R = 6.96×10⁸ m, T = 5778 K gives L = 3.83×10²⁶ W.`;
                } else if (symbol === 'R') {
                    instruction += `Enter luminosity (L) and temperature (T) to find the radius. Larger, hotter stars are more luminous.`;
                } else if (symbol === 'T') {
                    instruction += `Enter luminosity (L) and radius (R) to determine temperature. This is the Stefan-Boltzmann law.`;
                }
                break;
                
            case 'hubble_law':
                if (symbol === 'v') {
                    instruction += `Enter distance (d) and Hubble constant (H₀) to find recessional velocity. For d = 100 Mpc and H₀ = 70 km/(s·Mpc), v = 7000 km/s.`;
                } else if (symbol === 'd') {
                    instruction += `Enter recessional velocity (v) and Hubble constant (H₀) to calculate distance. This measures how far galaxies are based on their redshift.`;
                } else if (symbol === 'H₀') {
                    instruction += `Enter recessional velocity (v) and distance (d) to determine the Hubble constant. Current value is approximately 70 km/(s·Mpc).`;
                }
                break;
                
            case 'wiens_law':
                if (symbol === 'λmax') {
                    instruction += `Enter temperature (T) to find peak wavelength. For the Sun (T = 5778 K), λmax ≈ 500 nm (visible light). Hotter objects peak at shorter wavelengths.`;
                } else if (symbol === 'T') {
                    instruction += `Enter peak wavelength (λmax) to determine temperature. This is how we measure stellar temperatures from spectra.`;
                }
                break;
                
            case 'parallax_distance_arcsec':
                if (symbol === 'd') {
                    instruction += `Enter parallax angle (p) in arcseconds to find distance in parsecs. For p = 0.1 arcsec, d = 10 parsecs. This is the fundamental distance measurement.`;
                } else if (symbol === 'p') {
                    instruction += `Enter distance (d) in parsecs to find parallax angle. Closer stars have larger parallax angles.`;
                }
                break;
                
            case 'binary_white_dwarf':
                if (symbol === 'P') {
                    instruction += `Enter the semi-major axis (a) and both white dwarf masses (M₁, M₂) to calculate orbital period. Binary white dwarfs are important sources of gravitational waves.`;
                } else if (symbol === 'a') {
                    instruction += `Enter the orbital period (P) and both white dwarf masses (M₁, M₂) to find the semi-major axis. Close binaries emit gravitational waves.`;
                } else if (symbol === 'M1' || symbol === 'M2') {
                    instruction += `Enter the orbital period (P), semi-major axis (a), and the other white dwarf mass to determine this mass. White dwarfs typically have masses 0.5-1.4 M☉.`;
                }
                break;
                
            case 'white_dwarf_merger_timescale':
                if (symbol === 't_merge') {
                    instruction += `Enter the semi-major axis (a) and both white dwarf masses (M₁, M₂) to calculate merger timescale. Typical timescales range from millions to billions of years.`;
                } else if (symbol === 'a') {
                    instruction += `Enter the merger timescale (t_merge) and both white dwarf masses (M₁, M₂) to find the required semi-major axis. Closer binaries merge faster.`;
                }
                break;
                
            case 'flux_from_luminosity':
                if (symbol === 'F') {
                    instruction += `Enter luminosity (L) and distance (d) to calculate observed flux. Flux decreases as 1/d² (inverse square law).`;
                } else if (symbol === 'L') {
                    instruction += `Enter observed flux (F) and distance (d) to find intrinsic luminosity. This tells you how bright the source really is.`;
                } else if (symbol === 'd') {
                    instruction += `Enter luminosity (L) and observed flux (F) to determine distance. This is the basis of standard candle distance measurements.`;
                }
                break;
                
            default:
                // Generic instruction
                if (exampleValue) {
                    instruction += `Enter values for all other variables to calculate ${name}. Example value for ${symbol}: ${exampleValue} ${variable.unit}.`;
                } else {
                    instruction += `Enter values for all other variables to calculate ${name}. ${description}`;
                }
                break;
        }
    } else {
        // Instruction when this variable is provided
        instruction = `💡 <strong>About ${symbol} (${name}):</strong> `;
        instruction += description;
        if (exampleValue) {
            instruction += ` Typical values: around ${exampleValue} ${variable.unit}.`;
        }
    }
    
    return instruction;
}

// Update visual indicators for which variable will be solved
function updateSolveIndicators() {
    if (!currentFormula) return;
    
    // Get list of constant symbols to exclude
    const constantSymbols = new Set();
    if (currentFormula.constants) {
        Object.keys(currentFormula.constants).forEach(key => {
            constantSymbols.add(key);
            if (key === 'pi' || key === 'π') constantSymbols.add('π');
            if (key === 'G') constantSymbols.add('G');
            if (key === 'c') constantSymbols.add('c');
            if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
        });
    }
    
    const userVariables = currentFormula.variables.filter(v => !constantSymbols.has(v.symbol));
    
    // Count how many variables have values
    let filledCount = 0;
    let emptyVar = null;
    const variableStates = [];
    
    // PERFORMANCE FIX: Cache DOM queries to avoid repeated lookups
    const hintsCache = new Map();
    const inputContainersCache = new Map();
    
    userVariables.forEach(variable => {
        const baseUnit = variable.unit;
        const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
        
        let hasValue = false;
        for (const unit of alternativeUnits) {
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const input = document.getElementById(inputId);
            if (input) {
                const value = input.value.trim();
                if (value && value.toLowerCase() !== 'null') {
                    hasValue = true;
                    break;
                }
            }
        }
        
        variableStates.push({
            variable: variable,
            hasValue: hasValue
        });
        
        if (hasValue) {
            filledCount++;
        } else {
            emptyVar = variable;
        }
    });
    
    // PERFORMANCE FIX: Batch DOM updates after calculating all states
    // Use the already calculated filledCount instead of recalculating
    userVariables.forEach((variable, index) => {
        const variableState = variableStates[index];
        const hasValue = variableState.hasValue;
        
        // Cache hint element lookup
        let hint = hintsCache.get(variable.symbol);
        if (!hint) {
            hint = document.querySelector(`.solve-hint[data-symbol="${variable.symbol}"]`);
            if (hint) hintsCache.set(variable.symbol, hint);
        }
        
        if (hint) {
            if (hasValue) {
                hint.style.display = 'none';
            } else {
                hint.style.display = 'inline';
                // Use the already calculated filledCount
                if (filledCount === userVariables.length - 1) {
                    hint.textContent = '← WILL SOLVE FOR THIS';
                    hint.classList.add('will-solve');
                    // COMPETITIVE: Highlight the input container for maximum visibility
                    let inputContainer = inputContainersCache.get(variable.symbol);
                    if (!inputContainer) {
                        inputContainer = hint.closest('.variable-input');
                        if (inputContainer) inputContainersCache.set(variable.symbol, inputContainer);
                    }
                    if (inputContainer) {
                        inputContainer.classList.add('will-solve-highlight');
                    }
                } else if (filledCount < userVariables.length - 1) {
                    hint.textContent = 'Leave empty to solve';
                    hint.classList.remove('will-solve');
                    let inputContainer = inputContainersCache.get(variable.symbol);
                    if (!inputContainer) {
                        inputContainer = hint.closest('.variable-input');
                        if (inputContainer) inputContainersCache.set(variable.symbol, inputContainer);
                    }
                    if (inputContainer) {
                        inputContainer.classList.remove('will-solve-highlight');
                    }
                } else {
                    // All filled
                    hint.textContent = 'Clear to solve';
                    hint.classList.remove('will-solve');
                    let inputContainer = inputContainersCache.get(variable.symbol);
                    if (!inputContainer) {
                        inputContainer = hint.closest('.variable-input');
                        if (inputContainer) inputContainersCache.set(variable.symbol, inputContainer);
                    }
                    if (inputContainer) {
                        inputContainer.classList.remove('will-solve-highlight');
                    }
                }
            }
        }
    });
    
    // Update instruction banner based on current state
    updateInstructionBanner(variableStates, emptyVar, filledCount, userVariables.length);
}

// Update the instruction banner with variable-specific information
function updateInstructionBanner(variableStates, emptyVar, filledCount, totalVars) {
    const instructionDiv = document.getElementById('calculator-instructions');
    if (!instructionDiv || !currentFormula) return;
    
    let instructionHTML = '';
    
    if (filledCount === 0) {
        // No values entered yet
        instructionHTML = `💡 <strong>How to use:</strong> Enter values for all variables except one. Leave one variable empty to solve for it.`;
    } else if (filledCount === totalVars - 1 && emptyVar) {
        // Ready to solve - show clear instruction
        instructionHTML = `✅ <strong>Ready to calculate!</strong> Click "Calculate" or press Enter to solve for <strong>${emptyVar.symbol}</strong> (${emptyVar.name}).`;
    } else if (filledCount === totalVars) {
        // All filled - need to clear one
        instructionHTML = `💡 <strong>All variables filled:</strong> Clear one field to calculate that value, or press Calculate to verify your inputs.`;
    } else {
        // Partially filled - show clear guidance
        const missingVars = variableStates.filter(vs => !vs.hasValue);
        const filledVars = variableStates.filter(vs => vs.hasValue);
        if (missingVars.length === 1) {
            const missing = missingVars[0].variable;
            instructionHTML = `💡 Enter <strong>${missing.symbol}</strong> (${missing.name}) or leave it empty to calculate it.`;
        } else {
            const missingNames = missingVars.map(vs => `${vs.variable.symbol}`).join(', ');
            const filledNames = filledVars.map(vs => `${vs.variable.symbol}`).join(', ');
            instructionHTML = `💡 Entered: <strong>${filledNames}</strong> | Missing: <strong>${missingNames}</strong> — Leave one empty to calculate it.`;
        }
    }
    
    instructionDiv.innerHTML = `<p>${instructionHTML}</p>`;
    
    // Add visual state class for styling
    if (filledCount === totalVars - 1 && emptyVar) {
        instructionDiv.classList.add('ready');
    } else {
        instructionDiv.classList.remove('ready');
    }
}

// Usage instructions removed - function disabled
function addUsageInstructions(formula) {
    // Function disabled - step-by-step guide removed per user request
    const calculatorTab = document.getElementById('calculator-tab');
    if (!calculatorTab) return;
    
    // Always remove any existing instructions
    const existingInstructions = calculatorTab.querySelector('.usage-instructions-container');
    if (existingInstructions) {
        existingInstructions.remove();
    }
    // Also remove contextual hints
    const existingHints = calculatorTab.querySelector('.contextual-hints-container');
    if (existingHints) {
        existingHints.remove();
    }
    // Do not add any instructions
}

// Contextual hints removed - function disabled
function addContextualHints(formula, questionText = null) {
    // Function disabled - contextual hints removed per user request
    const calculatorTab = document.getElementById('calculator-tab');
    if (!calculatorTab) return;
    
    // Always remove any existing hints
    const existingHints = calculatorTab.querySelector('.contextual-hints-container');
    if (existingHints) {
        existingHints.remove();
    }
    // Do not add any hints
}

/**
 * Setup graph control buttons (reset, export)
 */
// Graph functions removed - users can use offline tools like Desmos