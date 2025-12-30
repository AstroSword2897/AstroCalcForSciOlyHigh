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
export declare class TabManager {
    private onTabSwitch?;
    private onMainTabSwitch?;
    private initFormulaExplorer?;
    private initStellarClassifier?;
    private onGraphTabActivated?;
    private stellarClassifier;
    private activeMainTab;
    private activeSubTab;
    private initializationAttempts;
    private readonly MAX_INIT_ATTEMPTS;
    constructor(options?: TabManagerOptions);
    /**
     * Switch between main page tabs with improved error handling
     */
    switchMainTab(tabName: MainTabName): void;
    /**
     * Switch between calculator, graph, and classification tabs with improved handling
     */
    switchTab(tabName: SubTabName): void;
    getActiveMainTab(): MainTabName | null;
    getActiveSubTab(): SubTabName | null;
    private updateMainTabButtons;
    private updateMainTabContent;
    private updateSubTabButtons;
    private updateSubTabContent;
    private activateMainTab;
    private activateSubTab;
    private activateFormulasTab;
    private activateExplorerTab;
    private activateClassificationMainTab;
    private activateCalculatorTab;
    private activateGraphTab;
    private activateClassificationSubTab;
    private setElementVisible;
    private retryInitialization;
    private handleTabSwitchError;
}
