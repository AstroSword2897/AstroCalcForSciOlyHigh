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

// Global state variables
let currentFormula = null; // Currently selected formula for calculator
let calculator = null;
let graphManager = null; // Graph manager (uses OfflineGraphManager for offline operation)

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
const mathJaxRenderQueue = new Set();

function renderMathJax(element) {
    if (!element) return;
    
    // Add element to render queue
    mathJaxRenderQueue.add(element);
    
    // Clear existing timeout
    if (mathJaxRenderTimeout) {
        clearTimeout(mathJaxRenderTimeout);
    }
    
    // Debounce MathJax rendering
    mathJaxRenderTimeout = setTimeout(() => {
        const elementsToRender = Array.from(mathJaxRenderQueue);
        mathJaxRenderQueue.clear();
        
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
    }, 150); // Debounce MathJax rendering by 150ms
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
        
