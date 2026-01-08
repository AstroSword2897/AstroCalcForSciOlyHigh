/**
 * CalculateButtonDebugPanel - Visual debugging panel for Calculate button issues
 * 
 * Usage:
 *   const panel = new CalculateButtonDebugPanel();
 *   panel.show();
 */

export class CalculateButtonDebugPanel {
    constructor() {
        this.panel = null;
        this.clickCount = 0;
        this.lastClickTime = null;
        this.handlerStatus = {
            direct: false,
            delegation: false,
            forceAttach: false
        };
        this.callbackStatus = {
            invoked: false,
            lastInvocation: null,
            error: null
        };
        this.calculationStatus = {
            executed: false,
            lastExecution: null,
            error: null
        };
        this.updateInterval = null;
    }

    /**
     * Create and show the debug panel
     */
    show() {
        if (this.panel) {
            this.panel.remove();
        }

        this.panel = document.createElement('div');
        this.panel.id = 'calculate-button-debug-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 80vh;
            background: #1e1e1e;
            color: #d4d4d4;
            border: 2px solid #007acc;
            border-radius: 8px;
            padding: 16px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            overflow-y: auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        `;

        this.panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #007acc; padding-bottom: 8px;">
                <h3 style="margin: 0; color: #007acc; font-size: 14px;">🔍 Calculate Button Debug</h3>
                <button id="debug-panel-close" style="background: #007acc; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">✕</button>
            </div>
            <div id="debug-panel-content"></div>
        `;

        document.body.appendChild(this.panel);

        // Close button
        this.panel.querySelector('#debug-panel-close').addEventListener('click', () => {
            this.hide();
        });

        // Start updating
        this.startMonitoring();
        this.update();

        // Monitor button clicks
        this.monitorButtonClicks();
    }

    /**
     * Hide the debug panel
     */
    hide() {
        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }
        this.stopMonitoring();
    }

    /**
     * Start monitoring system state
     */
    startMonitoring() {
        this.updateInterval = setInterval(() => {
            this.update();
        }, 500); // Update every 500ms
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Monitor button clicks
     */
    monitorButtonClicks() {
        const button = document.getElementById('calculate-btn');
        if (!button) return;

        // Wrap existing handlers to track clicks
        const originalClick = button.onclick;
        button.addEventListener('click', (e) => {
            this.clickCount++;
            this.lastClickTime = new Date();
            this.update();
        }, true); // Capture phase
    }

    /**
     * Update panel content
     */
    update() {
        if (!this.panel) return;

        const content = this.panel.querySelector('#debug-panel-content');
        if (!content) return;

        // Get current state
        const button = document.getElementById('calculate-btn');
        const hasEventCoordinator = typeof window.eventCoordinator !== 'undefined';
        const hasUiOrchestrator = typeof window.uiOrchestrator !== 'undefined';
        const hasCalculationOrchestrator = hasUiOrchestrator && !!window.uiOrchestrator.calculationOrchestrator;
        const hasPerformCalculation = typeof window.performCalculation === 'function';
        const formula = hasUiOrchestrator ? window.uiOrchestrator.formulaSelector?.getCurrentFormula() : null;
        const calculator = hasUiOrchestrator ? window.uiOrchestrator.formulaSelector?.getCurrentCalculator() : null;

        // Check handler status
        this.handlerStatus.direct = button?.dataset.directHandlerAttached === 'true';
        this.handlerStatus.forceAttach = button?._forceAttached === true;
        this.handlerStatus.delegation = hasEventCoordinator;

        // Check calculation lock
        const isLocked = hasCalculationOrchestrator && 
            window.uiOrchestrator.calculationOrchestrator._calculationInProgress === true;

        // Build HTML
        let html = '';

        // Button clicks
        html += `<div style="margin-bottom: 12px;">
            <div style="font-weight: bold; color: #4ec9b0; margin-bottom: 4px;">Button Clicks</div>
            <div>Count: <span style="color: #ce9178;">${this.clickCount}</span></div>
            <div>Last: <span style="color: #ce9178;">${this.lastClickTime ? this.lastClickTime.toLocaleTimeString() : 'Never'}</span></div>
        </div>`;

        // Button state
        html += `<div style="margin-bottom: 12px;">
            <div style="font-weight: bold; color: #4ec9b0; margin-bottom: 4px;">Button State</div>
            <div>Exists: ${button ? '✅' : '❌'}</div>
            ${button ? `<div>ID: <span style="color: #ce9178;">${button.id}</span></div>` : ''}
        </div>`;

        // Event handlers
        html += `<div style="margin-bottom: 12px;">
            <div style="font-weight: bold; color: #4ec9b0; margin-bottom: 4px;">Event Handlers</div>
            <div>Direct: ${this.handlerStatus.direct ? '✅' : '❌'}</div>
            <div>Delegation: ${this.handlerStatus.delegation ? '✅' : '❌'}</div>
            <div>Force-Attach: ${this.handlerStatus.forceAttach ? '✅' : '❌'}</div>
        </div>`;

        // Callback chain
        html += `<div style="margin-bottom: 12px;">
            <div style="font-weight: bold; color: #4ec9b0; margin-bottom: 4px;">Callback Chain</div>
            <div>EventCoordinator: ${hasEventCoordinator ? '✅' : '❌'}</div>
            <div>UIModuleOrchestrator: ${hasUiOrchestrator ? '✅' : '❌'}</div>
            <div>CalculationOrchestrator: ${hasCalculationOrchestrator ? '✅' : '❌'}</div>
            <div>window.performCalculation: ${hasPerformCalculation ? '✅' : '❌'}</div>
        </div>`;

        // Formula & Calculator
        html += `<div style="margin-bottom: 12px;">
            <div style="font-weight: bold; color: #4ec9b0; margin-bottom: 4px;">Formula & Calculator</div>
            <div>Formula: ${formula ? `✅ ${formula.name || formula.id}` : '❌ None'}</div>
            <div>Calculator: ${calculator ? '✅' : '❌'}</div>
        </div>`;

        // Calculation state
        html += `<div style="margin-bottom: 12px;">
            <div style="font-weight: bold; color: #4ec9b0; margin-bottom: 4px;">Calculation State</div>
            <div>Locked: ${isLocked ? '⏳ Yes' : '✅ No'}</div>
        </div>`;

        // Actions
        html += `<div style="margin-bottom: 12px;">
            <div style="font-weight: bold; color: #4ec9b0; margin-bottom: 4px;">Actions</div>
            <button id="debug-test-click" style="background: #007acc; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; margin-right: 4px; margin-bottom: 4px;">Test Click</button>
            <button id="debug-test-calculation" style="background: #007acc; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; margin-right: 4px; margin-bottom: 4px;">Test Calculation</button>
            <button id="debug-generate-report" style="background: #007acc; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; margin-bottom: 4px;">Generate Report</button>
        </div>`;

        // Error display
        if (this.callbackStatus.error || this.calculationStatus.error) {
            html += `<div style="margin-top: 12px; padding: 8px; background: #3f1f1f; border-left: 3px solid #f48771; border-radius: 4px;">
                <div style="font-weight: bold; color: #f48771; margin-bottom: 4px;">Errors</div>
                ${this.callbackStatus.error ? `<div style="color: #f48771; font-size: 11px;">Callback: ${this.callbackStatus.error}</div>` : ''}
                ${this.calculationStatus.error ? `<div style="color: #f48771; font-size: 11px;">Calculation: ${this.calculationStatus.error}</div>` : ''}
            </div>`;
        }

        content.innerHTML = html;

        // Attach event listeners
        const testClickBtn = content.querySelector('#debug-test-click');
        if (testClickBtn) {
            testClickBtn.addEventListener('click', () => {
                if (button) {
                    button.click();
                }
            });
        }

        const testCalcBtn = content.querySelector('#debug-test-calculation');
        if (testCalcBtn) {
            testCalcBtn.addEventListener('click', () => {
                if (hasCalculationOrchestrator) {
                    try {
                        window.uiOrchestrator.calculationOrchestrator.performCalculation();
                    } catch (error) {
                        this.calculationStatus.error = error.message;
                        this.update();
                    }
                }
            });
        }

        const generateReportBtn = content.querySelector('#debug-generate-report');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => {
                if (window.CalculateButtonDebugger) {
                    const debugger = new window.CalculateButtonDebugger();
                    debugger.generateReport();
                } else {
                    console.log('CalculateButtonDebugger not available. Make sure debug scripts are loaded.');
                }
            });
        }
    }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.CalculateButtonDebugPanel = CalculateButtonDebugPanel;
}

