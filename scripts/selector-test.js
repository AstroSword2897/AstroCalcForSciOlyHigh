// Selector Verification Script
console.log('SELECTOR TEST: Verifying actual DOM selectors...');

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        console.log('SELECTOR TEST: Checking search input...');
        
        // Check all possible search selectors
        const selectors = [
            '#formula-search',
            'input#formula-search',
            '.formula-search-input',
            'input[placeholder*="Search"]',
            'input[placeholder*="search"]',
            '[data-testid="formula-search"]',
            '.formula-search-container input',
            'input[type="text"]'
        ];
        
        const results = {};
        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            results[selector] = {
                found: !!element,
                element: element,
                id: element?.id,
                placeholder: element?.placeholder,
                className: element?.className
            };
        });
        
        console.log('SELECTOR TEST Results:', results);
        
        // Find the actual search input
        const allInputs = document.querySelectorAll('input[type="text"]');
        console.log(`SELECTOR TEST: Found ${allInputs.length} text inputs:`);
        allInputs.forEach((input, index) => {
            console.log(`  Input ${index}:`, {
                id: input.id,
                placeholder: input.placeholder,
                className: input.className,
                type: input.type
            });
        });
        
        // Add test-id to search input if found
        const searchInput = document.querySelector('#formula-search') || 
                          document.querySelector('.formula-search-input') ||
                          document.querySelector('input[placeholder*="Search"]');
        
        if (searchInput && !searchInput.getAttribute('data-testid')) {
            searchInput.setAttribute('data-testid', 'formula-search');
            console.log('SELECTOR TEST: Added data-testid="formula-search" to search input');
        }
        
        // Check formula cards
        const cards = document.querySelectorAll('.formula-card');
        console.log(`SELECTOR TEST: Found ${cards.length} formula cards`);
        
        // Add test-ids to formula cards
        cards.forEach((card, index) => {
            if (!card.getAttribute('data-testid')) {
                card.setAttribute('data-testid', `formula-card-${index}`);
            }
        });
        
        console.log('SELECTOR TEST: Test verification complete');
    }, 2000);
});
