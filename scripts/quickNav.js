/**
 * Quick Navigation System
 * Provides instant access, keyboard shortcuts, and rapid topic connections
 * Designed for zero-time-waste workflow
 */

// Global keyboard shortcut state
let quickNavState = {
    searchFocused: false,
    commandPaletteOpen: false,
    currentCardIndex: -1,
    cards: []
};

/**
 * Initialize Quick Navigation System
 */
function initQuickNav() {
    setupKeyboardShortcuts();
    setupQuickLinks();
    setupCommandPalette();
    setupCardKeyboardNavigation();
    setupRelatedFormulasQuickAccess();
}

/**
 * Setup global keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in input fields (unless it's a global shortcut)
        const activeElement = document.activeElement;
        const isInput = activeElement.tagName === 'INPUT' || 
                       activeElement.tagName === 'TEXTAREA' ||
                       activeElement.isContentEditable;
        
        // Global shortcuts (work everywhere)
        // Cmd/Ctrl + K: Focus search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('formula-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
                quickNavState.searchFocused = true;
            }
            return;
        }
        
        // Cmd/Ctrl + /: Open command palette
        if ((e.metaKey || e.ctrlKey) && e.key === '/') {
            e.preventDefault();
            toggleCommandPalette();
            return;
        }
        
        // Escape: Close modals, clear search, go back
        if (e.key === 'Escape') {
            if (quickNavState.commandPaletteOpen) {
                closeCommandPalette();
                return;
            }
            if (quickNavState.searchFocused) {
                const searchInput = document.getElementById('formula-search');
                if (searchInput && searchInput.value) {
                    searchInput.value = '';
                    filterAndRenderFormulas('');
                }
                searchInput?.blur();
                quickNavState.searchFocused = false;
                return;
            }
            // Go back to formula list if in calculator
            const inputScreen = document.getElementById('input-screen');
            if (inputScreen?.classList.contains('active')) {
                document.getElementById('back-button')?.click();
                return;
            }
        }
        
        // Tab navigation shortcuts (only when not in input)
        if (!isInput) {
            // Number keys 1-4: Switch main tabs
            if (e.key >= '1' && e.key <= '4' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                const tabs = ['formulas', 'explorer', 'classification', 'desmos'];
                const tabIndex = parseInt(e.key) - 1;
                if (tabs[tabIndex]) {
                    switchMainTab(tabs[tabIndex]);
                }
                return;
            }
            
            // Arrow keys: Navigate formula cards
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                navigateCards(e.key === 'ArrowDown' ? 1 : -1);
                e.preventDefault();
                return;
            }
            
            // Enter: Open selected card
            if (e.key === 'Enter' && quickNavState.currentCardIndex >= 0) {
                const card = quickNavState.cards[quickNavState.currentCardIndex];
                if (card) {
                    card.click();
                }
                return;
            }
        }
        
        // Quick formula access: Type formula name to jump
        if (!isInput && e.key.length === 1 && /[a-zA-Z]/.test(e.key) && !e.metaKey && !e.ctrlKey) {
            // If user starts typing, focus search and add the character
            const searchInput = document.getElementById('formula-search');
            if (searchInput && !quickNavState.searchFocused) {
                searchInput.focus();
                searchInput.value = e.key;
                filterAndRenderFormulas(e.key);
                quickNavState.searchFocused = true;
            }
        }
    });
    
    // Track search focus
    const searchInput = document.getElementById('formula-search');
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            quickNavState.searchFocused = true;
        });
        searchInput.addEventListener('blur', () => {
            // Delay to allow click events to fire
            setTimeout(() => {
                quickNavState.searchFocused = false;
            }, 200);
        });
    }
}

/**
 * Navigate formula cards with arrow keys
 */
function navigateCards(direction) {
    const cards = Array.from(document.querySelectorAll('.formula-card'));
    quickNavState.cards = cards;
    
    if (cards.length === 0) return;
    
    // Update current index
    quickNavState.currentCardIndex += direction;
    
    // Wrap around
    if (quickNavState.currentCardIndex < 0) {
        quickNavState.currentCardIndex = cards.length - 1;
    } else if (quickNavState.currentCardIndex >= cards.length) {
        quickNavState.currentCardIndex = 0;
    }
    
    // Highlight current card
    cards.forEach((card, index) => {
        if (index === quickNavState.currentCardIndex) {
            card.classList.add('keyboard-focused');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.focus();
        } else {
            card.classList.remove('keyboard-focused');
        }
    });
}

/**
 * Setup quick links between related formulas
 */
function setupQuickLinks() {
    // This will be called when cards are rendered
    // Add quick links to related formulas on each card
}

/**
 * Add quick links to formula cards
 */
function addQuickLinksToCard(card, formula) {
    if (!card || !formula) return;
    
    // Get related formulas
    const relatedFormulas = getRelatedFormulas(formula);
    
    if (relatedFormulas.length === 0) return;
    
    // Create quick links container
    const quickLinksContainer = document.createElement('div');
    quickLinksContainer.className = 'quick-links-container';
    quickLinksContainer.innerHTML = `
        <div class="quick-links-label">Quick links:</div>
        <div class="quick-links-list">
            ${relatedFormulas.slice(0, 3).map(related => `
                <button class="quick-link-btn" 
                        data-formula-id="${related.id}"
                        title="${related.name}">
                    ${related.name}
                </button>
            `).join('')}
        </div>
    `;
    
    // Add click handlers
    quickLinksContainer.querySelectorAll('.quick-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const formulaId = btn.dataset.formulaId;
            const relatedFormula = formulas.find(f => f.id === formulaId);
            if (relatedFormula) {
                selectFormula(relatedFormula);
            }
        });
    });
    
    // Insert before the card's last child (or append)
    card.appendChild(quickLinksContainer);
}

/**
 * Get related formulas for a given formula
 */
function getRelatedFormulas(formula) {
    if (!formula || typeof formulas === 'undefined') return [];
    
    const related = [];
    const formulaConcepts = new Set(formula.concepts || []);
    const formulaCategory = formula.category || '';
    
    formulas.forEach(f => {
        if (f.id === formula.id) return;
        
        let score = 0;
        
        // Same category
        if (f.category === formulaCategory) score += 10;
        
        // Shared concepts
        if (f.concepts && Array.isArray(f.concepts)) {
            f.concepts.forEach(concept => {
                if (formulaConcepts.has(concept)) {
                    score += 5;
                }
            });
        }
        
        // Shared variables
        const formulaVars = new Set((formula.variables || []).map(v => v.symbol));
        if (f.variables && Array.isArray(f.variables)) {
            f.variables.forEach(v => {
                if (formulaVars.has(v.symbol)) {
                    score += 3;
                }
            });
        }
        
        // Similar name
        if (formula.name && f.name) {
            const words1 = formula.name.toLowerCase().split(/\s+/);
            const words2 = f.name.toLowerCase().split(/\s+/);
            const commonWords = words1.filter(w => words2.includes(w));
            if (commonWords.length > 0) {
                score += commonWords.length * 2;
            }
        }
        
        if (score > 0) {
            related.push({ formula: f, score });
        }
    });
    
    // Sort by score and return top matches
    related.sort((a, b) => b.score - a.score);
    return related.slice(0, 5).map(r => r.formula);
}

/**
 * Setup command palette for quick actions
 */
function setupCommandPalette() {
    // Create command palette element
    const palette = document.createElement('div');
    palette.id = 'command-palette';
    palette.className = 'command-palette';
    palette.innerHTML = `
        <div class="command-palette-overlay"></div>
        <div class="command-palette-content">
            <div class="command-palette-header">
                <input type="text" 
                       id="command-palette-input" 
                       class="command-palette-input" 
                       placeholder="Type to search formulas, concepts, or actions...">
            </div>
            <div class="command-palette-results" id="command-palette-results">
                <!-- Results will be populated dynamically -->
            </div>
        </div>
    `;
    document.body.appendChild(palette);
    
    // Setup command palette input
    const input = document.getElementById('command-palette-input');
    if (input) {
        input.addEventListener('input', (e) => {
            searchCommandPalette(e.target.value);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeCommandPalette();
            } else if (e.key === 'Enter') {
                const firstResult = document.querySelector('.command-palette-item.selected, .command-palette-item');
                if (firstResult) {
                    firstResult.click();
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigateCommandResults(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigateCommandResults(-1);
            }
        });
    }
    
    // Close on overlay click
    const overlay = palette.querySelector('.command-palette-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeCommandPalette);
    }
}

/**
 * Toggle command palette
 */
function toggleCommandPalette() {
    const palette = document.getElementById('command-palette');
    if (!palette) return;
    
    if (quickNavState.commandPaletteOpen) {
        closeCommandPalette();
    } else {
        openCommandPalette();
    }
}

/**
 * Open command palette
 */
function openCommandPalette() {
    const palette = document.getElementById('command-palette');
    const input = document.getElementById('command-palette-input');
    
    if (!palette || !input) return;
    
    palette.classList.add('active');
    quickNavState.commandPaletteOpen = true;
    input.value = '';
    input.focus();
    searchCommandPalette('');
}

/**
 * Close command palette
 */
function closeCommandPalette() {
    const palette = document.getElementById('command-palette');
    if (!palette) return;
    
    palette.classList.remove('active');
    quickNavState.commandPaletteOpen = false;
}

/**
 * Search command palette
 */
function searchCommandPalette(query) {
    const resultsContainer = document.getElementById('command-palette-results');
    if (!resultsContainer) return;
    
    const queryLower = query.toLowerCase().trim();
    const results = [];
    
    // Search formulas
    if (typeof formulas !== 'undefined' && Array.isArray(formulas)) {
        formulas.forEach(formula => {
            const nameMatch = formula.name?.toLowerCase().includes(queryLower);
            const descMatch = formula.description?.toLowerCase().includes(queryLower);
            const conceptMatch = formula.concepts?.some(c => c.toLowerCase().includes(queryLower));
            
            if (nameMatch || descMatch || conceptMatch) {
                let score = 0;
                if (nameMatch) score += 100;
                if (descMatch) score += 50;
                if (conceptMatch) score += 25;
                
                results.push({
                    type: 'formula',
                    formula: formula,
                    score: score,
                    title: formula.name,
                    subtitle: formula.description?.substring(0, 60) + '...',
                    action: () => {
                        selectFormula(formula);
                        closeCommandPalette();
                    }
                });
            }
        });
    }
    
    // Add quick actions
    if (queryLower.length === 0 || 'formulas'.includes(queryLower)) {
        results.push({
            type: 'action',
            title: 'Go to Formulas',
            subtitle: 'View all formulas',
            action: () => {
                switchMainTab('formulas');
                closeCommandPalette();
            }
        });
    }
    
    if (queryLower.length === 0 || 'explorer'.includes(queryLower)) {
        results.push({
            type: 'action',
            title: 'Go to Explorer',
            subtitle: 'Browse formulas by category',
            action: () => {
                switchMainTab('explorer');
                closeCommandPalette();
            }
        });
    }
    
    if (queryLower.length === 0 || 'classification'.includes(queryLower)) {
        results.push({
            type: 'action',
            title: 'Go to Classification',
            subtitle: 'Classify stars',
            action: () => {
                switchMainTab('classification');
                closeCommandPalette();
            }
        });
    }
    
    // Sort results
    results.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === 'formula' ? -1 : 1;
        }
        return b.score - a.score;
    });
    
    // Render results
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="command-palette-empty">No results found</div>';
        return;
    }
    
    resultsContainer.innerHTML = results.slice(0, 10).map((result, index) => `
        <div class="command-palette-item ${index === 0 ? 'selected' : ''}" 
             data-index="${index}">
            <div class="command-palette-item-icon">
                ${result.type === 'formula' ? '📐' : '⚡'}
            </div>
            <div class="command-palette-item-content">
                <div class="command-palette-item-title">${result.title}</div>
                <div class="command-palette-item-subtitle">${result.subtitle || ''}</div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    resultsContainer.querySelectorAll('.command-palette-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            results[index].action();
        });
    });
}

/**
 * Navigate command palette results
 */
function navigateCommandResults(direction) {
    const items = Array.from(document.querySelectorAll('.command-palette-item'));
    const selected = document.querySelector('.command-palette-item.selected');
    
    if (items.length === 0) return;
    
    let currentIndex = selected ? items.indexOf(selected) : -1;
    currentIndex += direction;
    
    if (currentIndex < 0) currentIndex = items.length - 1;
    if (currentIndex >= items.length) currentIndex = 0;
    
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === currentIndex);
    });
    
    items[currentIndex]?.scrollIntoView({ block: 'nearest' });
}

/**
 * Setup card keyboard navigation
 */
function setupCardKeyboardNavigation() {
    // Cards will be made focusable and navigable
    // This is handled in the card creation
}

/**
 * Setup related formulas quick access
 */
function setupRelatedFormulasQuickAccess() {
    // Add related formulas sidebar or quick access panel
    // This can be shown when a formula is selected
}

// Initialize on DOM ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuickNav);
    } else {
        initQuickNav();
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.initQuickNav = initQuickNav;
    window.addQuickLinksToCard = addQuickLinksToCard;
    window.getRelatedFormulas = getRelatedFormulas;
    window.navigateCards = navigateCards;
}

