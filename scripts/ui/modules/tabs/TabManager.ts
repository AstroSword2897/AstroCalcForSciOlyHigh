/**
 * TabManager - IMPROVED VERSION
 * Better state management, visibility handling, and error recovery
 */

export type MainTabName = 'formulas' | 'explorer' | 'classification';
export type SubTabName = 'calculator' | 'graph' | 'classification';

export interface TabManagerOptions {
    onTabSwitch?: (tabName: string) => void;
    onMainTabSwitch?: (tabName: MainTabName) => void;
    initFormulaExplorer?: () => void;
    initStellarClassifier?: () => any;
    onGraphTabActivated?: () => void;
}

export class TabManager {
    private onTabSwitch?: (tabName: string) => void;
    private onMainTabSwitch?: (tabName: MainTabName) => void;
    private initFormulaExplorer?: () => void;
    private initStellarClassifier?: () => any;
    private onGraphTabActivated?: () => void;
    private stellarClassifier: any = null;
    private activeMainTab: MainTabName | null = null;
    private activeSubTab: SubTabName | null = null;
    private initializationAttempts: Map<string, number> = new Map();
    private readonly MAX_INIT_ATTEMPTS = 3;

    constructor(options: TabManagerOptions = {}) {
        this.onTabSwitch = options.onTabSwitch;
        this.onMainTabSwitch = options.onMainTabSwitch;
        this.initFormulaExplorer = options.initFormulaExplorer;
        this.initStellarClassifier = options.initStellarClassifier;
        this.onGraphTabActivated = options.onGraphTabActivated;
    }

    /**
     * Switch between main page tabs with improved error handling
     */
    switchMainTab(tabName: MainTabName): void {
        console.log('[TabManager] Switching to main tab:', tabName);

        try {
            // Update main tab buttons
            this.updateMainTabButtons(tabName);

            // Update main tab content
            this.updateMainTabContent(tabName);

            // Activate selected tab
            this.activateMainTab(tabName);

            this.activeMainTab = tabName;

            if (this.onMainTabSwitch) {
                this.onMainTabSwitch(tabName);
            }
        } catch (error) {
            console.error('[TabManager] Error switching main tab:', error);
            this.handleTabSwitchError(tabName, error);
        }
    }

    /**
     * Switch between calculator, graph, and classification tabs with improved handling
     */
    switchTab(tabName: SubTabName): void {
        console.log('[TabManager] Switching to sub tab:', tabName);

        try {
            // Update tab buttons
            this.updateSubTabButtons(tabName);

            // Update tab content
            this.updateSubTabContent(tabName);

            // Activate selected tab
            this.activateSubTab(tabName);

            this.activeSubTab = tabName;

            if (this.onTabSwitch) {
                this.onTabSwitch(tabName);
            }
        } catch (error) {
            console.error('[TabManager] Error switching sub tab:', error);
            this.handleTabSwitchError(tabName, error);
        }
    }

    getActiveMainTab(): MainTabName | null {
        return this.activeMainTab;
    }

    getActiveSubTab(): SubTabName | null {
        return this.activeSubTab;
    }

    private updateMainTabButtons(tabName: MainTabName): void {
        const tabButtons = document.querySelectorAll('.main-tab-btn');
        tabButtons.forEach(btn => {
            const btnTabName = btn.getAttribute('data-main-tab');
            if (btnTabName === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    private updateMainTabContent(tabName: MainTabName): void {
        const tabContents = document.querySelectorAll('.main-tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
            (content as HTMLElement).style.setProperty('display', 'none', 'important');
        });
    }

    private updateSubTabButtons(tabName: SubTabName): void {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });
    }

    private updateSubTabContent(tabName: SubTabName): void {
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            (content as HTMLElement).style.setProperty('display', 'none', 'important');
        });
    }

    private activateMainTab(tabName: MainTabName): void {
        if (tabName === 'formulas') {
            this.activateFormulasTab();
        } else if (tabName === 'explorer') {
            this.activateExplorerTab();
        } else if (tabName === 'classification') {
            this.activateClassificationMainTab();
        } else {
            console.warn(`[TabManager] Unknown main tab name: ${tabName}`);
        }
    }

    private activateSubTab(tabName: SubTabName): void {
        if (tabName === 'calculator') {
            this.activateCalculatorTab();
        } else if (tabName === 'graph') {
            this.activateGraphTab();
        } else if (tabName === 'classification') {
            this.activateClassificationSubTab();
        } else {
            console.warn(`[TabManager] Unknown sub tab name: ${tabName}`);
        }
    }

    private activateFormulasTab(): void {
        const formulasTab = document.getElementById('main-formulas-tab');
        if (formulasTab) {
            formulasTab.classList.add('active');
            formulasTab.style.setProperty('display', 'block', 'important');
            formulasTab.style.setProperty('visibility', 'visible', 'important');
            console.log('[TabManager] ✅ Formulas tab activated');
        } else {
            console.error('[TabManager] ❌ main-formulas-tab not found!');
        }
    }

    private activateExplorerTab(): void {
        const explorerTab = document.getElementById('main-explorer-tab');
        if (explorerTab) {
            explorerTab.classList.add('active');
            explorerTab.style.setProperty('display', 'block', 'important');
            explorerTab.style.setProperty('visibility', 'visible', 'important');
            console.log('[TabManager] ✅ Explorer tab activated');

            // Initialize Formula Explorer with retry logic
            if (this.initFormulaExplorer) {
                this.retryInitialization('explorer', () => {
                    try {
                        this.initFormulaExplorer!();
                    } catch (e) {
                        console.error('[TabManager] Error initializing Formula Explorer:', e);
                        throw e;
                    }
                });
            }
        } else {
            console.error('[TabManager] ❌ main-explorer-tab not found!');
        }
    }

    private activateClassificationMainTab(): void {
        const classificationTab = document.getElementById('main-classification-tab');
        if (classificationTab) {
            classificationTab.classList.add('active');
            classificationTab.style.setProperty('display', 'block', 'important');
            classificationTab.style.setProperty('visibility', 'visible', 'important');
            console.log('[TabManager] ✅ Classification tab activated');

            // Initialize classifier with retry logic
            if (!this.stellarClassifier && this.initStellarClassifier) {
                this.retryInitialization('classifier', () => {
                    this.stellarClassifier = this.initStellarClassifier!();
                    if (this.stellarClassifier) {
                        console.log('[TabManager] ✅ StellarClassifier initialized');
                    } else {
                        throw new Error('StellarClassifier initialization returned null');
                    }
                });
            }
        } else {
            console.error('[TabManager] ❌ main-classification-tab not found!');
        }
    }

    private activateCalculatorTab(): void {
        const calcTab = document.getElementById('calculator-tab');
        if (calcTab) {
            calcTab.classList.add('active');
            calcTab.setAttribute('aria-hidden', 'false');
            this.setElementVisible(calcTab);
            console.log('[TabManager] ✅ Calculator tab activated and visible');
        } else {
            console.error('[TabManager] ❌ calculator-tab element not found!');
        }
    }

    private activateGraphTab(): void {
        const graphTab = document.getElementById('graph-tab');
        if (graphTab) {
            graphTab.classList.add('active');
            graphTab.setAttribute('aria-hidden', 'false');
            this.setElementVisible(graphTab);
            console.log('[TabManager] ✅ Graph tab activated and visible');

            // Notify that graph tab is activated
            if (this.onGraphTabActivated) {
                setTimeout(() => this.onGraphTabActivated!(), 100);
            }
        } else {
            console.error('[TabManager] ❌ graph-tab element not found!');
        }
    }

    private activateClassificationSubTab(): void {
        const classificationTab = document.getElementById('classification-tab');
        if (classificationTab) {
            classificationTab.classList.add('active');
            classificationTab.setAttribute('aria-hidden', 'false');
            this.setElementVisible(classificationTab);

            // Ensure classification inputs are visible
            const inputsContainer = classificationTab.querySelector('.classification-inputs');
            if (inputsContainer) {
                this.setElementVisible(inputsContainer as HTMLElement);
            }

            const inputs = classificationTab.querySelectorAll('.classification-inputs input');
            inputs.forEach(input => {
                this.setElementVisible(input as HTMLElement);
            });

            console.log('[TabManager] ✅ Classification sub tab activated and visible');
        } else {
            console.error('[TabManager] ❌ classification-tab element not found!');
        }
    }

    private setElementVisible(element: HTMLElement): void {
        element.style.setProperty('display', element.tagName === 'DIV' ? 'block' : 'flex', 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('opacity', '1', 'important');
    }

    private retryInitialization(key: string, initFn: () => void, attempt: number = 1): void {
        if (attempt > this.MAX_INIT_ATTEMPTS) {
            console.warn(`[TabManager] Max initialization attempts reached for ${key}`);
            return;
        }

        try {
            initFn();
            this.initializationAttempts.delete(key);
        } catch (error) {
            const currentAttempts = this.initializationAttempts.get(key) || 0;
            this.initializationAttempts.set(key, currentAttempts + 1);
            
            setTimeout(() => {
                this.retryInitialization(key, initFn, attempt + 1);
            }, 200 * attempt); // Exponential backoff
        }
    }

    private handleTabSwitchError(tabName: string, error: any): void {
        console.error(`[TabManager] Tab switch error for ${tabName}:`, error);
        // Try to at least show the tab content
        const tabElement = document.getElementById(`${tabName}-tab`) || 
                          document.getElementById(`main-${tabName}-tab`);
        if (tabElement) {
            tabElement.classList.add('active');
            (tabElement as HTMLElement).style.setProperty('display', 'block', 'important');
        }
    }
}

