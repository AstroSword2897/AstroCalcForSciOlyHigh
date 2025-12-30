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
export declare class EventCoordinator {
    private listeners;
    private globalListeners;
    private options;
    private setupComplete;
    constructor(options?: EventCoordinatorOptions);
    /**
     * Setup all event listeners
     */
    setupAll(): void;
    private setupBackButton;
    private setupMainTabButtons;
    private setupSubTabButtons;
    private setupCalculateButton;
    private setupClassificationButtons;
    private setupFormulaCardDelegation;
    private setupGraphControls;
    private setupClassificationInputs;
    private addListener;
    /**
     * Cleanup all event listeners
     */
    cleanup(): void;
}
