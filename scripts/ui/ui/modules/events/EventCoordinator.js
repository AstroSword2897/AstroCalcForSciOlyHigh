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
        backButton.onclick = handler;
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
            element.onclick = handler;
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
        // Use event delegation on document to handle dynamically created calculate buttons
        const handler = (e) => {
            if (e.target && e.target.id === 'calculate-btn') {
                e.preventDefault();
                e.stopPropagation();
                if (this.options.onCalculate) {
                    this.options.onCalculate();
                }
            }
        };
        
        // Add to global listeners for cleanup
        document.addEventListener('click', handler);
        this.globalListeners.push({
            element: document,
            event: 'click',
            handler: handler
        });
        
        console.log('[EventCoordinator] ✅ Calculate button event delegation set up');
    }
    setupClassificationButtons() {
        const classifyBtn = document.getElementById('classify-btn');
        if (classifyBtn && this.options.onClassify) {
            this.addListener(classifyBtn, 'click', this.options.onClassify);
        }
        const mainClassifyBtn = document.getElementById('main-classify-btn');
        if (mainClassifyBtn && this.options.onMainClassify) {
            this.addListener(mainClassifyBtn, 'click', this.options.onMainClassify);
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
