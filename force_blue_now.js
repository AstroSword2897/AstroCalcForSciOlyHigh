// This script forces blue borders and visible tabs immediately
(function() {
    console.log('[FORCE BLUE] Starting immediate style override');
    
    // Create a new style element with maximum specificity
    const forceStyle = document.createElement('style');
    forceStyle.id = 'force-blue-override';
    forceStyle.setAttribute('data-force', 'true');
    forceStyle.textContent = `
        /* FORCE SOLID BLUE BORDERS - Maximum specificity */
        .formula-card,
        div.formula-card,
        .formula-list .formula-card,
        #formula-list .formula-card {
            border: 2px solid #667eea !important; /* SOLID BLUE */
            border-color: #667eea !important;
        }
        
        /* FORCE BLUE TITLES */
        .formula-card-title,
        .formula-card h3,
        div.formula-card h3 {
            color: #667eea !important;
        }
        
        /* FORCE TABS VISIBLE */
        .main-tabs,
        .main-tab-container {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        .main-tab-btn {
            display: inline-block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
    `;
    
    // Insert at the very end of head to override everything
    if (document.head) {
        document.head.appendChild(forceStyle);
        console.log('[FORCE BLUE] Style element injected into HEAD');
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.head.appendChild(forceStyle);
            console.log('[FORCE BLUE] Style element injected into HEAD (after DOMContentLoaded)');
        });
    }
    
    console.log('[FORCE BLUE] Script executed');
    
    // Also force inline styles on existing elements
    function forceInlineStyles() {
        const cards = document.querySelectorAll('.formula-card');
        const titles = document.querySelectorAll('.formula-card-title, .formula-card h3');
        
        console.log(`[FORCE BLUE] Applying inline styles to ${cards.length} card${cards.length !== 1 ? 's' : ''} and ${titles.length} title${titles.length !== 1 ? 's' : ''}`);
        
        cards.forEach(card => {
            card.style.setProperty('border', '2px solid #667eea', 'important');
            card.style.setProperty('border-color', '#667eea', 'important');
        });
        
        titles.forEach(title => {
            title.style.setProperty('color', '#667eea', 'important');
        });
        
        console.log('[FORCE BLUE] Inline styles applied');
    }
    
    // Run immediately and on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceInlineStyles);
    } else {
        forceInlineStyles();
    }
    
    // Also run after delays
    setTimeout(forceInlineStyles, 100);
    setTimeout(forceInlineStyles, 500);
    setTimeout(forceInlineStyles, 1000);
    
    // Watch for new elements
    const observer = new MutationObserver(() => {
        forceInlineStyles();
    });
    
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }
    
    console.log('[FORCE BLUE] Complete - monitoring for changes');
})();
