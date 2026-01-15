/**
 * EventCoordinator - Centralized event handling with proper cleanup
 * Refactored: Unified listener tracking, auto observer cleanup, debug flag, reduced duplication
 * Enhanced: Optional debounce/throttle support for high-frequency events
 */
export class EventCoordinator {
    constructor(options = {}) {
        // Unified listener tracking (replaces separate listeners Map and globalListeners array)
        this.listeners = new Map(); // element -> [{event, handler, options, isGlobal}]
        this.observers = new Set(); // MutationObservers for cleanup
        this.setupComplete = false;
        this.options = options;
        this.debug = options.debug ?? false; // Optional debug flag
        this.debouncedHandlers = new Map(); // Track debounced handlers for cleanup
    }
    
    /**
     * Logging helper - only logs if debug is enabled
     */
    log(...args) {
        if (this.debug) {
            console.log('[EventCoordinator]', ...args);
        }
    }
    
    logWarn(...args) {
        if (this.debug) {
            console.warn('[EventCoordinator]', ...args);
        }
    }
    
    logError(...args) {
        // Errors are always logged
        console.error('[EventCoordinator]', ...args);
    }
    
    /**
     * Setup all event listeners
     */
    setupAll() {
        if (this.setupComplete) {
            this.log('Already set up, skipping');
            return;
        }
        this.log('Setting up event handlers...');
        this.setupBackButton();
        this.setupMainTabButtons();
        this.setupSubTabButtons();
        this.setupCalculateButton();
        this.setupClearButton();
        this.setupClassificationButtons();
        this.setupFormulaCardDelegation();
        this.setupGraphControls();
        this.setupClassificationInputs();
        this.setupComplete = true;
        this.log('✅ All event handlers set up');
    }
    
    /**
     * Helper: Apply consistent button styles
     */
    styleButton(btn) {
        if (!btn) return;
        btn.style.setProperty('pointer-events', 'auto', 'important');
        btn.style.setProperty('cursor', 'pointer', 'important');
    }
    
    /**
     * Helper: Unified listener registration (replaces addListener)
     * Tracks both direct and global listeners in one system
     */
    addListener(element, event, handler, options = false) {
        // Use tracked listener if provided
        if (this.options.addTrackedListener) {
            this.options.addTrackedListener(element, event, handler);
        } else {
            element.addEventListener(event, handler, options);
        }
        
        // Track in unified system
        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }
        this.listeners.get(element).push({ event, handler, options, isGlobal: element === document });
    }
    
    /**
     * Helper: Setup dynamic button with retry logic and observer
     * Extracted common pattern for Calculate and Clear buttons
     */
    setupDynamicButton(buttonId, handler, options = {}) {
        const { 
            retryDelays = [200, 500, 1000, 2000],
            dataAttribute = `${buttonId.replace(/-/g, '')}HandlerAttached`,
            logName = buttonId
        } = options;
        
        const attachHandler = () => {
            const btn = document.getElementById(buttonId);
            if (btn && !btn.dataset[dataAttribute]) {
                this.log(`✅ Attaching handler to ${logName}`);
                this.addListener(btn, 'click', handler);
                this.styleButton(btn);
                btn.dataset[dataAttribute] = 'true';
                
                // Disconnect observer if attached
                const observerKey = `_${buttonId.replace(/-/g, '')}Observer`;
                if (this[observerKey]) {
                    this[observerKey].disconnect();
                    this.observers.delete(this[observerKey]);
                    this[observerKey] = null;
                    this.log(`✅ MutationObserver disconnected for ${logName}`);
                }
                return true;
            }
            return false;
        };
        
        // Try immediately
        if (attachHandler()) {
            return;
        }
        
        // Retry at intervals
        retryDelays.forEach(delay => {
            setTimeout(() => attachHandler(), delay);
        });
        
        // Use MutationObserver for dynamic elements
        const observer = new MutationObserver(() => {
            attachHandler();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        const observerKey = `_${buttonId.replace(/-/g, '')}Observer`;
        this[observerKey] = observer;
        this.observers.add(observer);
        
        this.log(`✅ ${logName} handler set up (will attach when available)`);
    }
    
    /**
     * Helper: Create debounced or throttled function
     * Supports both debounce (wait for pause) and throttle (limit frequency)
     */
    _createDebouncedOrThrottled(func, options = {}) {
        const { debounceMs, throttleMs } = options;
        
        if (debounceMs) {
            // Debounce: wait for pause in events
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func(...args);
                }, debounceMs);
            };
        } else if (throttleMs) {
            // Throttle: limit frequency of events
            let lastCall = 0;
            return (...args) => {
                const now = Date.now();
                if (now - lastCall >= throttleMs) {
                    lastCall = now;
                    func(...args);
                }
            };
        }
        
        // No debounce/throttle
        return func;
    }
    
    /**
     * Helper: Setup event delegation on document
     * Unified pattern for delegated click handlers
     * Supports optional debounce/throttle for high-frequency events
     */
    setupDelegation(selector, handler, options = {}) {
        const {
            event = 'click',
            useCapture = true,
            logName = 'delegation',
            debounceMs = null, // Optional: debounce handler (wait for pause)
            throttleMs = null // Optional: throttle handler (limit frequency)
        } = options;
        
        // Apply debounce/throttle if specified
        let finalHandler = handler;
        if (debounceMs || throttleMs) {
            finalHandler = this._createDebouncedOrThrottled(handler, { debounceMs, throttleMs });
            // Store for cleanup
            const handlerKey = `${selector}-${event}`;
            this.debouncedHandlers.set(handlerKey, finalHandler);
            this.log(`✅ ${logName} event delegation set up with ${debounceMs ? `debounce(${debounceMs}ms)` : `throttle(${throttleMs}ms)`}`);
        }
        
        const wrappedHandler = (e) => {
            const target = e.target.closest(selector);
            if (!target) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            finalHandler(e, target);
        };
        
        this.addListener(document, event, wrappedHandler, useCapture);
        if (!debounceMs && !throttleMs) {
            this.log(`✅ ${logName} event delegation set up`);
        }
    }
    
    setupBackButton() {
        const backButton = document.getElementById('back-button');
        if (!backButton) {
            // Back button only exists on calculator screen - expected behavior
            return;
        }
        
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.options.onBackButton?.();
        };
        
        this.addListener(backButton, 'click', handler);
        this.styleButton(backButton);
    }
    
    setupMainTabButtons() {
        const mainTabButtons = document.querySelectorAll('.main-tab-btn');
        mainTabButtons.forEach(btn => {
            const tabName = btn.getAttribute('data-main-tab');
            if (!tabName) return;
            
            this.styleButton(btn);
            
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.options.onMainTabSwitch?.(tabName);
            };
            
            this.addListener(btn, 'click', handler);
        });
    }
    
    setupSubTabButtons() {
        this.setupDelegation('.tab-btn', (e, btn) => {
            const tabName = btn.getAttribute('data-tab');
            if (!tabName) {
                this.logWarn('Tab button missing data-tab attribute:', btn);
                return;
            }
            
            this.log(`Sub tab clicked: ${tabName}`);
            this.options.onSubTabSwitch?.(tabName);
        }, { logName: 'Sub tab buttons' });
        
        // Style existing buttons
        const subTabButtons = document.querySelectorAll('.tab-btn');
        this.log(`Found ${subTabButtons.length} sub tab buttons, using event delegation`);
        subTabButtons.forEach(btn => this.styleButton(btn));
    }
    
    setupCalculateButton() {
        const handler = (e) => {
            this.log('🎯 Calculate button clicked');
            e.preventDefault();
            e.stopPropagation();
            this.options.onCalculate?.();
        };
        
        this.setupDynamicButton('calculate-btn', handler, {
            logName: 'Calculate button'
        });
        
        // Verify button exists
        const testBtn = document.getElementById('calculate-btn');
        if (testBtn) {
            this.log('✅ Calculate button found in DOM');
        } else {
            this.logWarn('⚠️ Calculate button not found in DOM yet (will attach when available)');
        }
    }
    
    setupClearButton() {
        const handler = (e) => {
            this.log('🧹 Clear button clicked - refreshing page');
            e.preventDefault();
            e.stopPropagation();
            window.location.reload();
        };
        
        this.setupDynamicButton('clear-btn', handler, {
            logName: 'Clear button'
        });
    }
    
    setupClassificationButtons() {
        // Use custom delegation handler for classification buttons
        // because we need to check both IDs and handle nested elements
        // Apply debounce to prevent accidental double-firing
        const baseHandler = (e) => {
            // Use closest() to handle clicks on nested elements (like text inside button)
            let classifyBtn = e.target.closest('#classify-btn');
            let mainClassifyBtn = e.target.closest('#main-classify-btn');
            
            // Fallback: check by ID directly
            if (!classifyBtn && e.target.id === 'classify-btn') {
                classifyBtn = e.target;
            }
            if (!mainClassifyBtn && e.target.id === 'main-classify-btn') {
                mainClassifyBtn = e.target;
            }
            
            if (classifyBtn || mainClassifyBtn) {
                this.log('✅ Classification button clicked!', { 
                    classifyBtn: !!classifyBtn, 
                    mainClassifyBtn: !!mainClassifyBtn 
                });
                
                e.preventDefault();
                e.stopPropagation();
                
                // Call appropriate callback
                if (classifyBtn && this.options.onClassify) {
                    this.log('Calling onClassify...');
                    try {
                        const result = this.options.onClassify();
                        this.log('onClassify returned:', result);
                    } catch (error) {
                        this.logError('Error calling onClassify:', error);
                        this.logError('Error stack:', error.stack);
                    }
                } else if (mainClassifyBtn && this.options.onMainClassify) {
                    this.log('Calling onMainClassify...');
                    try {
                        const result = this.options.onMainClassify();
                        this.log('onMainClassify returned:', result);
                    } catch (error) {
                        this.logError('Error calling onMainClassify:', error);
                        this.logError('Error stack:', error.stack);
                    }
                } else {
                    this.logWarn('⚠️ Classification button clicked but no callback available', {
                        hasClassifyBtn: !!classifyBtn,
                        hasMainClassifyBtn: !!mainClassifyBtn,
                        hasOnClassify: !!this.options.onClassify,
                        hasOnMainClassify: !!this.options.onMainClassify
                    });
                }
            }
        };
        
        // Apply debounce to prevent double-firing (300ms debounce)
        const debounceMs = this.options.classificationDebounceMs ?? 300;
        const debouncedHandler = this._createDebouncedOrThrottled(baseHandler, { debounceMs });
        this.debouncedHandlers.set('classification-buttons', debouncedHandler);
        
        this.addListener(document, 'click', debouncedHandler, true);
        this.log(`✅ Classification buttons event delegation set up with ${debounceMs}ms debounce`);
        
        // Verify buttons exist
        const classifyBtn = document.getElementById('classify-btn');
        const mainClassifyBtn = document.getElementById('main-classify-btn');
        if (classifyBtn) {
            this.log('✅ classify-btn found in DOM');
        } else {
            this.logWarn('⚠️ classify-btn not found in DOM yet (may be added dynamically)');
        }
        if (mainClassifyBtn) {
            this.log('✅ main-classify-btn found in DOM');
        } else {
            this.logWarn('⚠️ main-classify-btn not found in DOM yet (may be added dynamically)');
        }
    }
    
    setupFormulaCardDelegation() {
        const formulaList = document.getElementById('formula-list');
        if (!formulaList) {
            this.logWarn('Formula list not found');
            return;
        }
        if (formulaList.dataset?.delegationSetup === 'true') {
            return;
        }
        
        const handler = (e) => {
            const card = e.target.closest('.formula-card');
            if (!card) return;
            
            const formulaId = card.getAttribute('data-formula-id');
            if (!formulaId) return;
            
            e.preventDefault();
            e.stopPropagation();
            this.options.onFormulaCardClick?.(formulaId);
        };
        
        this.addListener(formulaList, 'click', handler, true);
        formulaList.dataset.delegationSetup = 'true';
    }
    
    setupGraphControls() {
        this.options.setupGraphControls?.();
    }
    
    setupClassificationInputs() {
        // Setup Enter key handlers for classification inputs
        const tempInputs = document.querySelectorAll('.classification-inputs input[type="number"]');
        tempInputs.forEach(input => {
            const handler = (e) => {
                if (e.key === 'Enter' && this.options.onClassify) {
                    this.options.onClassify();
                }
            };
            this.addListener(input, 'keydown', handler);
        });
    }
    
    /**
     * Cleanup all event listeners and observers
     * IMPROVED: Now handles observers, unified listener tracking, and debounced handlers
     */
    cleanup() {
        // Remove all tracked listeners
        this.listeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
        });
        this.listeners.clear();
        
        // Disconnect all MutationObservers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        
        // Clear debounced handlers (they may have pending timeouts)
        // Note: Individual debounced functions can't be cancelled from outside,
        // but clearing the map prevents memory leaks
        this.debouncedHandlers.clear();
        
        // Clear observer references (dynamic - will be set by setupDynamicButton)
        Object.keys(this).forEach(key => {
            if (key.startsWith('_') && key.endsWith('Observer')) {
                this[key] = null;
            }
        });
        
        this.setupComplete = false;
        this.log('✅ Cleanup completed');
    }
}
