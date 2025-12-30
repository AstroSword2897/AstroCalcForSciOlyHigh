/**
 * Render module - handles DOM rendering with batching
 */

import { Formula, SearchResult } from '../../types/formula';

export interface RenderOptions {
    batchSize?: number;
    useVirtualScroll?: boolean;
}

export class RenderModule {
    private options: Required<RenderOptions>;
    private renderQueue: Array<() => void> = [];
    private rafId: number | null = null;

    constructor(options: RenderOptions = {}) {
        this.options = {
            batchSize: options.batchSize ?? 20,
            useVirtualScroll: options.useVirtualScroll ?? false
        };
    }

    /**
     * Render formula cards in batches
     */
    renderFormulaCards(
        container: HTMLElement,
        formulas: Formula[] | SearchResult[]
    ): void {
        // Clear container
        container.innerHTML = '';

        // Render in batches
        this.renderInBatches(container, formulas);
    }

    /**
     * Render items in batches to avoid blocking
     */
    private renderInBatches(
        container: HTMLElement,
        items: Array<Formula | SearchResult>
    ): void {
        let index = 0;
        
        const renderBatch = () => {
            const batch = items.slice(index, index + this.options.batchSize);
            
            const fragment = document.createDocumentFragment();
            batch.forEach(item => {
                const card = this.createFormulaCard(item);
                fragment.appendChild(card);
            });
            
            container.appendChild(fragment);
            
            index += this.options.batchSize;
            
            if (index < items.length) {
                this.rafId = requestAnimationFrame(renderBatch);
            } else {
                this.rafId = null;
            }
        };
        
        renderBatch();
    }

    /**
     * Create a formula card element
     */
    private createFormulaCard(item: Formula | SearchResult): HTMLElement {
        const formula = 'formula' in item ? item.formula : item;
        
        const card = document.createElement('div');
        card.className = 'formula-card';
        card.setAttribute('data-formula-id', formula.id);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.style.cursor = 'pointer';
        
        const formulaName = this.escapeHtml(formula.name || 'Unnamed Formula');
        const formulaEquation = this.escapeHtml(formula.equation || 'No equation available');
        const formulaDescription = this.escapeHtml(formula.description || 'No description available');
        
        // Add score display if this is a search result
        const scoreDisplay = 'score' in item && item.score !== null && item.score !== undefined
            ? `<div class="formula-score-badge" style="position: absolute; top: 10px; right: 10px; background: rgba(102, 126, 234, 0.3); color: #a8c7ff; padding: 4px 10px; border-radius: 8px; font-size: 0.85em; font-weight: 600; border: 1px solid rgba(102, 126, 234, 0.5);">
                ${Math.round(item.score)} pts
            </div>`
            : '';
        
        const formulaVariables = (formula.variables && Array.isArray(formula.variables) && formula.variables.length > 0) 
            ? formula.variables.map(v => `<span class="var-tag">${this.escapeHtml(v.symbol || '?')}</span>`).join(' ')
            : '<span class="var-tag">None</span>';
        
        card.innerHTML = `
            ${scoreDisplay}
            <div class="formula-card-header">
                <h3>${formulaName}</h3>
                <span class="click-hint">Click to calculate →</span>
            </div>
            <div class="formula-preview">${formulaEquation}</div>
            <p class="description">${formulaDescription}</p>
            <div class="formula-variables">
                <strong>Variables:</strong> ${formulaVariables}
            </div>
        `;
        
        return card;
    }

    /**
     * Escape HTML to prevent XSS
     */
    private escapeHtml(text: string): string {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Cleanup
     */
    cleanup(): void {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.renderQueue = [];
    }
}

// Singleton instance
let renderModuleInstance: RenderModule | null = null;

export function getRenderModule(options?: RenderOptions): RenderModule {
    if (!renderModuleInstance) {
        renderModuleInstance = new RenderModule(options);
    }
    return renderModuleInstance;
}

// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    (window as any).RenderModule = RenderModule;
    (window as any).getRenderModule = getRenderModule;
}

