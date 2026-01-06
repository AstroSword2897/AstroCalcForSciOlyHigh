/**
 * EventCoordinator - Centralized event handling with proper cleanup
 * Improved: Lifecycle management, memory leak prevention, better organization
 */
export class EventCoordinator {
    constructor(options = {}) {
        this.listeners = new Map();
        this.globalListeners = [];
        this.setupComplete = false;
        this.options = options;
    }
    /**
     * Setup all event listeners
     */
    setupAll() {
        if (this.setupComplete) {
            console.log('[EventCoordinator] Already set up, skipping');
            return;
        }
        console.log('[EventCoordinator] Setting up event handlers...');
        this.setupBackButton();
        this.setupMainTabButtons();
        this.setupSubTabButtons();
        this.setupCalculateButton();
        this.setupClassificationButtons();
        this.setupFormulaCardDelegation();
        this.setupGraphControls();
        this.setupClassificationInputs();
        this.setupComplete = true;
        console.log('[EventCoordinator] ✅ All event handlers set up');
    }
    setupBackButton() {
        const backButton = document.getElementById('back-button');
        if (!backButton) {
            // Back button only exists on calculator screen, not on formula selection screen
            // This is expected behavior, so don't log a warning
            return;
        }
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.options.onBackButton) {
                this.options.onBackButton();
            }
        };
        this.addListener(backButton, 'click', handler);
    }
    setupMainTabButtons() {
        const mainTabButtons = document.querySelectorAll('.main-tab-btn');
        mainTabButtons.forEach(btn => {
            const tabName = btn.getAttribute('data-main-tab');
            if (!tabName)
                return;
            const element = btn;
            element.style.setProperty('pointer-events', 'auto', 'important');
            element.style.setProperty('cursor', 'pointer', 'important');
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.options.onMainTabSwitch) {
                    this.options.onMainTabSwitch(tabName);
                }
            };
            this.addListener(element, 'click', handler);
        });
    }
    setupSubTabButtons() {
        // Use event delegation on document to handle dynamically created buttons
        // This ensures buttons work even if they're added later or inside hidden containers
        const handler = (e) => {
            const btn = e.target.closest('.tab-btn');
            if (!btn) return;
            
            const tabName = btn.getAttribute('data-tab');
            if (!tabName) {
                console.warn('[EventCoordinator] Tab button missing data-tab attribute:', btn);
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            console.log(`[EventCoordinator] Sub tab clicked: ${tabName}`);
            
            if (this.options.onSubTabSwitch) {
                this.options.onSubTabSwitch(tabName);
            } else {
                console.warn('[EventCoordinator] onSubTabSwitch callback not provided');
            }
        };
        
        // Add to global listeners for cleanup
        document.addEventListener('click', handler, true); // Use capture phase
        this.globalListeners.push({
            element: document,
            event: 'click',
            handler: handler,
            options: true // capture phase
        });
        
        // Also ensure existing buttons have proper styles
        const subTabButtons = document.querySelectorAll('.tab-btn');
        console.log(`[EventCoordinator] Found ${subTabButtons.length} sub tab buttons, using event delegation`);
        subTabButtons.forEach(btn => {
            btn.style.setProperty('pointer-events', 'auto', 'important');
            btn.style.setProperty('cursor', 'pointer', 'important');
        });
        
        console.log('[EventCoordinator] ✅ Sub tab buttons set up with event delegation');
    }
    setupCalculateButton() {
        // CRITICAL FIX: Use both direct attachment AND event delegation
        // Direct attachment ensures the button works even if delegation fails
        const directHandler = (e) => {
            console.log('[EventCoordinator] 🎯 DIRECT Calculate button clicked!', e.target);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            requestAnimationFrame(() => {
                setTimeout(() => {
                    console.log('[EventCoordinator] Calling onCalculate callback (direct)...');
                    if (this.options.onCalculate) {
                        try {
                            this.options.onCalculate();
                            console.log('[EventCoordinator] ✅ onCalculate called successfully (direct)');
                        } catch (error) {
                            console.error('[EventCoordinator] ❌ Error calling onCalculate (direct):', error);
                        }
                    } else {
                        console.error('[EventCoordinator] ❌ onCalculate callback not defined!');
                    }
                }, 50);
            });
        };
        
        // Try to attach directly to the button if it exists
        const attachDirectHandler = () => {
            const calcBtn = document.getElementById('calculate-btn');
            if (calcBtn && !calcBtn.dataset.directHandlerAttached) {
                console.log('[EventCoordinator] ✅ Attaching direct handler to calculate button');
                this.addListener(calcBtn, 'click', directHandler);
                // Mark as attached to prevent duplicates
                calcBtn.dataset.directHandlerAttached = 'true';
                return true;
            }
            return false;
        };
        
        // Try immediately
        attachDirectHandler();
        
        // If button doesn't exist yet, retry at intervals
        const retries = [200, 500, 1000, 2000];
        retries.forEach(delay => {
            setTimeout(() => attachDirectHandler(), delay);
        });
        
        // Use MutationObserver to catch when button is added dynamically
        const observer = new MutationObserver(() => {
            attachDirectHandler();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        // Store observer for cleanup if needed
        this._calculateButtonObserver = observer;
        
        // ALSO use event delegation on document as backup
        const delegationHandler = (e) => {
            // Check if the clicked element or its parent is the calculate button
            let calcBtn = e.target.closest('#calculate-btn');
            if (!calcBtn && e.target.id === 'calculate-btn') {
                calcBtn = e.target;
            }
            // Also check by text content as fallback
            if (!calcBtn) {
                const button = e.target.closest('button');
                if (button && (button.textContent?.trim() === 'Calculate' || button.id === 'calculate-btn')) {
                    calcBtn = button;
                }
            }
            
            if (calcBtn) {
                console.log('[EventCoordinator] 🎯 DELEGATION Calculate button clicked!', calcBtn);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        console.log('[EventCoordinator] Calling onCalculate callback (delegation)...');
                        if (this.options.onCalculate) {
                            try {
                                this.options.onCalculate();
                                console.log('[EventCoordinator] ✅ onCalculate called successfully (delegation)');
                            } catch (error) {
                                console.error('[EventCoordinator] ❌ Error calling onCalculate (delegation):', error);
                            }
                        } else {
                            console.error('[EventCoordinator] ❌ onCalculate callback not defined!');
                        }
                    }, 50);
                });
            }
        };
        
        // Add delegation handler to document
        document.addEventListener('click', delegationHandler, true); // Use capture phase
        this.globalListeners.push({
            element: document,
            event: 'click',
            handler: delegationHandler,
            options: true // capture phase
        });
        
        console.log('[EventCoordinator] ✅ Calculate button handlers set up (direct + delegation)');
        
        // Verify the button exists in DOM
        const testBtn = document.getElementById('calculate-btn');
        if (testBtn) {
            console.log('[EventCoordinator] ✅ Calculate button found in DOM:', testBtn);
        } else {
            console.warn('[EventCoordinator] ⚠️ Calculate button not found in DOM yet (will attach when available)');
        }
    }
    setupClassificationButtons() {
        // Use event delegation on document to handle dynamically created classification buttons
        // This ensures buttons work even if they're added later or inside hidden containers
        const handler = (e) => {
            // Enhanced debug logging
            const isButton = e.target.tagName === 'BUTTON' || e.target.closest('button');
            const hasClassifyText = e.target.textContent?.includes('Classify') || e.target.closest('button')?.textContent?.includes('Classify');
            const hasClassifyId = e.target.id === 'classify-btn' || e.target.id === 'main-classify-btn' || 
                                 e.target.closest('#classify-btn') || e.target.closest('#main-classify-btn');
            
            if (isButton && (hasClassifyText || hasClassifyId)) {
                console.log('[EventCoordinator] 🔍 DEBUG: Classification button click detected!', {
                    target: e.target,
                    id: e.target.id,
                    text: e.target.textContent,
                    closestButton: e.target.closest('button')
                });
            }
            
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
                console.log('[EventCoordinator] ✅ Classification button clicked!', { classifyBtn, mainClassifyBtn });
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                // Add a small delay to ensure UI is fully updated
                setTimeout(() => {
                    if (classifyBtn && this.options.onClassify) {
                        console.log('[EventCoordinator] Calling onClassify...');
                        this.options.onClassify();
                    } else if (mainClassifyBtn && this.options.onMainClassify) {
                        console.log('[EventCoordinator] Calling onMainClassify...');
                        this.options.onMainClassify();
                    }
                }, 50); // 50ms delay for UI stability
            }
        };
        
        // Add to global listeners for cleanup
        document.addEventListener('click', handler, true); // Use capture phase
        this.globalListeners.push({
            element: document,
            event: 'click',
            handler: handler,
            options: true // capture phase
        });
        
        console.log('[EventCoordinator] ✅ Classification buttons event delegation set up');
        
        // Verify buttons exist in DOM
        const classifyBtn = document.getElementById('classify-btn');
        const mainClassifyBtn = document.getElementById('main-classify-btn');
        if (classifyBtn) {
            console.log('[EventCoordinator] ✅ classify-btn found in DOM');
        } else {
            console.warn('[EventCoordinator] ⚠️ classify-btn not found in DOM yet (may be added dynamically)');
        }
        if (mainClassifyBtn) {
            console.log('[EventCoordinator] ✅ main-classify-btn found in DOM');
        } else {
            console.warn('[EventCoordinator] ⚠️ main-classify-btn not found in DOM yet (may be added dynamically)');
        }
    }
    setupFormulaCardDelegation() {
        const formulaList = document.getElementById('formula-list');
        if (!formulaList) {
            console.warn('[EventCoordinator] Formula list not found');
            return;
        }
        if (formulaList.dataset?.delegationSetup === 'true') {
            return;
        }
        const handler = (e) => {
            const card = e.target.closest('.formula-card');
            if (!card)
                return;
            const formulaId = card.getAttribute('data-formula-id');
            if (!formulaId)
                return;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (this.options.onFormulaCardClick) {
                this.options.onFormulaCardClick(formulaId);
            }
        };
        formulaList.addEventListener('click', handler, true);
        formulaList.dataset.delegationSetup = 'true';
    }
    setupGraphControls() {
        if (this.options.setupGraphControls) {
            this.options.setupGraphControls();
        }
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
    addListener(element, event, handler) {
        if (this.options.addTrackedListener) {
            this.options.addTrackedListener(element, event, handler);
        }
        else {
            element.addEventListener(event, handler);
        }
        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }
        this.listeners.get(element).push({ event, handler });
    }
    /**
     * Cleanup all event listeners
     */
    cleanup() {
        this.listeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.listeners.clear();
        this.globalListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.globalListeners = [];
        this.setupComplete = false;
    }
}
