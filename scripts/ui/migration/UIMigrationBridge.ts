/**
 * Migration Bridge - Gradually migrates ui.js to use TypeScript modules
 * This allows incremental migration without breaking existing code
 */

import { getUIStateManager, UIStateManager } from '../state/UIStateManager';
import { getCalculatorModule, CalculatorModule } from '../modules/CalculatorModule';
import { getRenderModule, RenderModule } from '../modules/RenderModule';
import { getEventManager, EventManager } from '../../events/EventManager';
import { getEventBus, EventBus } from '../../events/EventBus';
import { getCleanupManager, CleanupManager } from '../../utils/CleanupManager';
import { getDOMCache, DOMCache } from '../../utils/DOMCache';

type SearchModule = unknown;

function getSearchModule(): SearchModule {
    return null;
}

/**
 * Initialize TypeScript modules and expose to window for backward compatibility
 */
export function initializeTSModules(): void {
    // Initialize all modules
    const uiState = getUIStateManager();
    const searchModule = getSearchModule();
    const calculatorModule = getCalculatorModule();
    const renderModule = getRenderModule();
    const eventManager = getEventManager();
    const eventBus = getEventBus();
    const cleanupManager = getCleanupManager();
    const domCache = getDOMCache();

    // Expose to window for backward compatibility
    if (typeof window !== 'undefined') {
        (window as any).tsUIState = uiState;
        (window as any).tsSearchModule = searchModule;
        (window as any).tsCalculatorModule = calculatorModule;
        (window as any).tsRenderModule = renderModule;
        (window as any).tsEventManager = eventManager;
        (window as any).tsEventBus = eventBus;
        (window as any).tsCleanupManager = cleanupManager;
        (window as any).tsDOMCache = domCache;

        // Also expose classes
        (window as any).TS_UIStateManager = UIStateManager;
        (window as any).TS_CalculatorModule = CalculatorModule;
        (window as any).TS_RenderModule = RenderModule;
        (window as any).TS_EventManager = EventManager;
        (window as any).TS_EventBus = EventBus;
        (window as any).TS_CleanupManager = CleanupManager;
        (window as any).TS_DOMCache = DOMCache;
    }

    console.log('[UIMigrationBridge] TypeScript modules initialized');
}

/**
 * Migrate global state to UIStateManager
 */
export function migrateGlobalState(): void {
    if (typeof window === 'undefined') return;

    const uiState = getUIStateManager();
    const win = window as any;

    // Migrate currentFormula
    if (typeof win.currentFormula !== 'undefined' && win.currentFormula !== null) {
        uiState.setState({ currentFormula: win.currentFormula });
    }

    // Migrate calculator
    if (typeof win.calculator !== 'undefined' && win.calculator !== null) {
        uiState.setState({ calculator: win.calculator });
    }

    // Migrate graphManager
    if (typeof win.graphManager !== 'undefined' && win.graphManager !== null) {
        uiState.setState({ graphManager: win.graphManager });
    }

    // Migrate stellarClassifier
    if (typeof win.stellarClassifier !== 'undefined' && win.stellarClassifier !== null) {
        uiState.setState({ stellarClassifier: win.stellarClassifier });
    }

    // Set up watchers to keep globals in sync (temporary during migration)
    uiState.subscribe('currentFormula', (state) => {
        if (typeof win.currentFormula !== 'undefined') {
            win.currentFormula = state.currentFormula;
        }
    });

    uiState.subscribe('calculator', (state) => {
        if (typeof win.calculator !== 'undefined') {
            win.calculator = state.calculator;
        }
    });

    console.log('[UIMigrationBridge] Global state migrated to UIStateManager');
}

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeTSModules();
            migrateGlobalState();
        });
    } else {
        initializeTSModules();
        migrateGlobalState();
    }
}

