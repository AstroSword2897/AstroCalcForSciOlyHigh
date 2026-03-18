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
    setupHelpOverlay();
}

/**
 * Setup help overlay showing all keyboard shortcuts
 */
function setupHelpOverlay() {
    const helpOverlay = document.createElement('div');
    helpOverlay.id = 'help-overlay';
    helpOverlay.className = 'help-overlay';
    helpOverlay.innerHTML = `
        <div class="help-overlay-content">
            <div class="help-overlay-header">
                <h2>Keyboard Shortcuts</h2>
                <button class="help-overlay-close" onclick="closeHelpOverlay()">✕</button>
            </div>
            <div class="help-shortcuts-grid">
                <div class="help-shortcut-group">
                    <h3>Navigation</h3>
                    <div class="help-shortcut-item">
                        <div class="help-shortcut-keys"><kbd>⌘</kbd><kbd>K</kbd> or <kbd>Ctrl</kbd><kbd>K</kbd></div>
                        <div class="help-shortcut-desc">Focus search</div>
                    </div>
                    <div class="help-shortcut-item">
                        <div class="help-shortcut-keys"><kbd>⌘</kbd><kbd>/</kbd> or <kbd>Ctrl</kbd><kbd>/</kbd></div>
                        <div class="help-shortcut-desc">Open command palette</div>
                    </div>
                    <div class="help-shortcut-item">
                        <div class="help-shortcut-keys"><kbd>1</kbd> - <kbd>4</kbd></div>
                        <div class="help-shortcut-desc">Switch tabs (Formulas, Explorer, Classification, Desmos)</div>
                    </div>
                    <div class="help-shortcut-item">
                        <div class="help-shortcut-keys"><kbd>↑</kbd> <kbd>↓</kbd> (Up and Down arrow keys)</div>
                        <div class="help-shortcut-desc">Navigate formula cards</div>
                    </div>
                    <div class="help-shortcut-item">
                        <div class="help-shortcut-keys"><kbd>Enter</kbd></div>
                        <div class="help-shortcut-desc">Open selected formula</div>
                    </div>
                    <div class="help-shortcut-item">
                        <div class="help-shortcut-keys"><kbd>Esc</kbd></div>
                        <div class="help-shortcut-desc">Go back / Close modals</div>
                    </div>
                </div>
                <div class="help-shortcut-group">
                    <h3>Quick Access</h3>
                    <div class="help-shortcut-item">
                        <div class="help-shortcut-keys">Type letters</div>
                        <div class="help-shortcut-desc">Start typing to search instantly</div>
                    </div>
                    <div class="help-shortcut-item">
                        <div class="help-shortcut-keys">Click quick links</div>
                        <div class="help-shortcut-desc">Jump to related formulas on cards</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(helpOverlay);
    
    // Add help button to header
    const header = document.querySelector('header');
    if (header) {
        const helpBtn = document.createElement('button');
        helpBtn.className = 'help-btn';
        helpBtn.innerHTML = '?';
        helpBtn.title = 'Show keyboard shortcuts (Press ?)';
        helpBtn.onclick = () => toggleHelpOverlay();
        header.appendChild(helpBtn);
    }
}

/**
 * Toggle help overlay
 */
function toggleHelpOverlay() {
    const overlay = document.getElementById('help-overlay');
    if (!overlay) return;
    overlay.classList.toggle('active');
}

/**
 * Close help overlay
 */
function closeHelpOverlay() {
    const overlay = document.getElementById('help-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
}

// Add ? key to open help
document.addEventListener('keydown', (e) => {
    if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        const activeElement = document.activeElement;
        const isInput = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
        if (!isInput) {
            e.preventDefault();
            toggleHelpOverlay();
        }
    }
});

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
            const searchInput = document.getElementById('command-palette-input');
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
                const searchInput = document.getElementById('command-palette-input');
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
            // Check if we're on the input screen (calculator sub-tabs)
            const inputScreen = document.getElementById('input-screen');
            const isOnInputScreen = inputScreen && inputScreen.classList.contains('active');
            
            if (isOnInputScreen) {
                // Number keys 1-3: Switch calculator sub-tabs (Calculator, Graph, Classification)
                if (e.key >= '1' && e.key <= '3' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                    const subTabs = ['calculator', 'graph', 'classification'];
                    const tabIndex = parseInt(e.key) - 1;
                    if (subTabs[tabIndex] && typeof switchTab === 'function') {
                        switchTab(subTabs[tabIndex]);
                        e.preventDefault();
                    }
                    return;
                }
            } else {
                // Number keys 1-4: Switch main tabs (Formulas, Explorer, Classification, etc.)
                if (e.key >= '1' && e.key <= '4' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                    const tabs = ['formulas', 'explorer', 'algebraic', 'classification'];
                    const tabIndex = parseInt(e.key) - 1;
                    if (tabs[tabIndex] && typeof switchMainTab === 'function') {
                        switchMainTab(tabs[tabIndex]);
                        e.preventDefault();
                    }
                    return;
                }
            }
            
            // Arrow keys: Navigate formula cards (only if not in input field)
            if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !isInput) {
                navigateCards(e.key === 'ArrowDown' ? 1 : -1);
                e.preventDefault();
                return;
            }
            
            // Enter: Open selected card (only if not in input field)
            if (e.key === 'Enter' && !isInput && quickNavState.currentCardIndex >= 0) {
                const card = quickNavState.cards[quickNavState.currentCardIndex];
                if (card) {
                    card.click();
                }
                e.preventDefault();
                return;
            }
        }
        
        // Quick formula access: Type formula name to jump
        if (!isInput && e.key.length === 1 && /[a-zA-Z]/.test(e.key) && !e.metaKey && !e.ctrlKey) {
            // If user starts typing, focus search and add the character
            const searchInput = document.getElementById('command-palette-input');
            if (searchInput && !quickNavState.searchFocused) {
                searchInput.focus();
                searchInput.value = e.key;
                filterAndRenderFormulas(e.key);
                quickNavState.searchFocused = true;
            }
        }
    });
    
    // Track search focus
    const searchInput = document.getElementById('command-palette-input');
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
    // Only refresh cards if needed
    const currentCards = Array.from(document.querySelectorAll('.formula-card'));
    
    // Detect card list changes
    if (!quickNavState.cards || 
        quickNavState.cards.length !== currentCards.length ||
        quickNavState.currentCardIndex >= currentCards.length) {
        quickNavState.cards = currentCards;
        quickNavState.currentCardIndex = -1;
    }
    
    if (quickNavState.cards.length === 0) return;
    
    // Clear previous highlights
    quickNavState.cards.forEach(card => {
        card.classList.remove('keyboard-focused');
    });
    
    // Update index with proper bounds checking
    let newIndex = quickNavState.currentCardIndex + direction;
    
    // Wrap around with modulo (handles negative correctly)
    newIndex = ((newIndex % quickNavState.cards.length) + quickNavState.cards.length) % quickNavState.cards.length;
    
    quickNavState.currentCardIndex = newIndex;
    
    // Highlight and scroll to new card
    const focusedCard = quickNavState.cards[newIndex];
    if (focusedCard) {
        focusedCard.classList.add('keyboard-focused');
        focusedCard.classList.add('highlighted'); // Also add highlighted for test compatibility
        focusedCard.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
        });
        focusedCard.focus();
    }
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
                <button class="quick-link-btn quick-link" 
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
// Add debouncing and caching for command palette search
// Use different name to avoid conflict with searchCache in ui.js
let commandPaletteCache = new Map();
let searchDebounce = null;
const MAX_CACHE_SIZE = 100;
const MAX_RESULTS = 50;

function searchCommandPalette(query) {
    const resultsContainer = document.getElementById('command-palette-results');
    if (!resultsContainer) return;
    
    // Clear previous debounce
    clearTimeout(searchDebounce);
    
    // Debounce search
    searchDebounce = setTimeout(() => {
        performCommandPaletteSearch(query, resultsContainer);
    }, 150);
}

function performCommandPaletteSearch(query, resultsContainer) {
    const queryLower = query.toLowerCase().trim();
    
    // Check cache
    if (commandPaletteCache.has(queryLower)) {
        renderCommandPaletteResults(commandPaletteCache.get(queryLower), resultsContainer);
        return;
    }
    
    const results = [];
    
    // Search formulas with early exit
    if (typeof formulas !== 'undefined' && Array.isArray(formulas)) {
        for (const formula of formulas) {
            if (results.length >= MAX_RESULTS) break;
            
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
                    id: formula.id, // Only store ID, not full object
                    score: score,
                    title: formula.name,
                    subtitle: formula.description?.substring(0, 60) + '...',
                });
            }
        }
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
    
    // Cache results
    commandPaletteCache.set(queryLower, results);
    
    // Limit cache size
    if (commandPaletteCache.size > MAX_CACHE_SIZE) {
        const firstKey = commandPaletteCache.keys().next().value;
        commandPaletteCache.delete(firstKey);
    }
    
    renderCommandPaletteResults(results, resultsContainer);
}

function renderCommandPaletteResults(results, resultsContainer) {
    // Render results
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="command-palette-empty">No results found</div>';
        return;
    }
    
    // Only render top 10
    const topResults = results.slice(0, 10);
    resultsContainer.innerHTML = topResults.map((result, index) => `
        <div class="command-palette-item ${index === 0 ? 'selected' : ''}" 
             data-result-id="${result.id || ''}" 
             data-index="${index}"
             data-result-type="${result.type || 'formula'}">
            <div class="command-palette-item-icon">
                ${result.type === 'formula' ? '📐' : '⚡'}
            </div>
            <div class="command-palette-item-content">
                <div class="command-palette-item-title">${result.title}</div>
                <div class="command-palette-item-subtitle">${result.subtitle || ''}</div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers efficiently (event delegation)
    resultsContainer.onclick = (e) => {
        const item = e.target.closest('.command-palette-item');
        if (item) {
            const formulaId = item.dataset.resultId;
            const resultType = item.dataset.resultType;
            
            if (resultType === 'formula' && formulaId && typeof formulas !== 'undefined') {
                const formula = formulas.find(f => f.id === formulaId);
                if (formula && typeof selectFormula === 'function') {
                    selectFormula(formula);
                    closeCommandPalette();
                }
            } else if (resultType === 'action') {
                // Find the action in results
                const index = parseInt(item.dataset.index);
                const result = results[index];
                if (result && result.action) {
                    result.action();
                }
            }
        }
    };
    
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
    window.toggleHelpOverlay = toggleHelpOverlay;
    window.closeHelpOverlay = closeHelpOverlay;
}


