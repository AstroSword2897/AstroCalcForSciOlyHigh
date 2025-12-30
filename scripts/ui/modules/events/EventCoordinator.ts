/**
 * EventCoordinator - Centralized event handling with proper cleanup
 * Improved: Lifecycle management, memory leak prevention, better organization
 */

export interface EventCoordinatorOptions {
    onBackButton?: () => void;
    onMainTabSwitch?: (tabName: string) => void;
    onSubTabSwitch?: (tabName: string) => void;
    onCalculate?: () => void;
    onClassify?: () => void;
    onMainClassify?: () => void;
    onFormulaCardClick?: (formulaId: string) => void;
    setupGraphControls?: () => void;
    addTrackedListener?: (element: HTMLElement, event: string, handler: EventListener) => void;
}

export class EventCoordinator {
    private listeners: Map<HTMLElement, Array<{ event: string; handler: EventListener }>> = new Map();
    private globalListeners: Array<{ target: EventTarget; event: string; handler: EventListener; options?: any }> = [];
    private options: EventCoordinatorOptions;
    private setupComplete: boolean = false;

    constructor(options: EventCoordinatorOptions = {}) {
        this.options = options;
    }

    /**
     * Setup all event listeners
     */
    setupAll(): void {
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

    private setupBackButton(): void {
        const backButton = document.getElementById('back-button') as HTMLElement | null;
        if (!backButton) {
            console.warn('[EventCoordinator] Back button not found');
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.options.onBackButton) {
                this.options.onBackButton();
            }
        };

        this.addListener(backButton, 'click', handler);
        backButton.onclick = handler;
    }

    private setupMainTabButtons(): void {
        const mainTabButtons = document.querySelectorAll('.main-tab-btn');
        mainTabButtons.forEach(btn => {
            const tabName = btn.getAttribute('data-main-tab');
            if (!tabName) return;

            const element = btn as HTMLElement;
            element.style.setProperty('pointer-events', 'auto', 'important');
            element.style.setProperty('cursor', 'pointer', 'important');

            const handler = (e: Event) => {
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

    private setupSubTabButtons(): void {
        const subTabButtons = document.querySelectorAll('.tab-btn');
        subTabButtons.forEach(btn => {
            const tabName = btn.getAttribute('data-tab');
            if (!tabName) return;

            const handler = () => {
                if (this.options.onSubTabSwitch) {
                    this.options.onSubTabSwitch(tabName);
                }
            };

            this.addListener(btn as HTMLElement, 'click', handler);
        });
    }

    private setupCalculateButton(): void {
        const calcBtn = document.getElementById('calculate-btn') as HTMLElement | null;
        if (!calcBtn) {
            console.error('[EventCoordinator] Calculate button not found');
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.options.onCalculate) {
                this.options.onCalculate();
            }
        };

        // Multiple strategies for reliability
        this.addListener(calcBtn, 'click', handler);
        calcBtn.onclick = handler;
    }

    private setupClassificationButtons(): void {
        const classifyBtn = document.getElementById('classify-btn') as HTMLElement | null;
        if (classifyBtn && this.options.onClassify) {
            this.addListener(classifyBtn, 'click', this.options.onClassify);
        }

        const mainClassifyBtn = document.getElementById('main-classify-btn') as HTMLElement | null;
        if (mainClassifyBtn && this.options.onMainClassify) {
            this.addListener(mainClassifyBtn, 'click', this.options.onMainClassify);
        }
    }

    private setupFormulaCardDelegation(): void {
        const formulaList = document.getElementById('formula-list');
        if (!formulaList) {
            console.warn('[EventCoordinator] Formula list not found');
            return;
        }

        if ((formulaList as any).dataset?.delegationSetup === 'true') {
            return;
        }

        const handler = (e: Event) => {
            const card = (e.target as HTMLElement).closest('.formula-card');
            if (!card) return;

            const formulaId = card.getAttribute('data-formula-id');
            if (!formulaId) return;

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            if (this.options.onFormulaCardClick) {
                this.options.onFormulaCardClick(formulaId);
            }
        };

        formulaList.addEventListener('click', handler, true);
        (formulaList as any).dataset.delegationSetup = 'true';
    }

    private setupGraphControls(): void {
        if (this.options.setupGraphControls) {
            this.options.setupGraphControls();
        }
    }

    private setupClassificationInputs(): void {
        // Setup Enter key handlers for classification inputs
        const tempInputs = document.querySelectorAll('.classification-inputs input[type="number"]');
        tempInputs.forEach(input => {
            const handler = (e: KeyboardEvent) => {
                if (e.key === 'Enter' && this.options.onClassify) {
                    this.options.onClassify();
                }
            };
            this.addListener(input as HTMLElement, 'keydown', handler);
        });
    }

    private addListener(element: HTMLElement, event: string, handler: EventListener): void {
        if (this.options.addTrackedListener) {
            this.options.addTrackedListener(element, event, handler);
        } else {
            element.addEventListener(event, handler);
        }

        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }
        this.listeners.get(element)!.push({ event, handler });
    }

    /**
     * Cleanup all event listeners
     */
    cleanup(): void {
        this.listeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.listeners.clear();

        this.globalListeners.forEach(({ target, event, handler, options }) => {
            target.removeEventListener(event, handler, options);
        });
        this.globalListeners = [];

        this.setupComplete = false;
    }
}

