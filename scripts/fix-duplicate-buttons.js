// Fix duplicate calculate buttons
console.log('DUPLICATE BUTTON FIX: Starting...');

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        // Find all calculate buttons
        const calculateButtons = document.querySelectorAll('#calculate-btn, button:has-text("Calculate")');
        console.log(`Found ${calculateButtons.length} calculate buttons`);
        
        if (calculateButtons.length > 1) {
            console.log('DUPLICATE BUTTON FIX: Removing duplicates...');
            
            // Keep only the first button, remove others
            const buttonsToRemove = Array.from(calculateButtons).slice(1);
            buttonsToRemove.forEach((button, index) => {
                console.log(`Removing duplicate button ${index + 1}:`, button.textContent);
                button.remove();
            });
            
            console.log(`DUPLICATE BUTTON FIX: Removed ${buttonsToRemove.length} duplicate buttons`);
        } else {
            console.log('DUPLICATE BUTTON FIX: No duplicates found');
        }
        
        // Verify fix
        const remainingButtons = document.querySelectorAll('#calculate-btn, button:has-text("Calculate")');
        console.log(`DUPLICATE BUTTON FIX: ${remainingButtons.length} calculate buttons remaining`);
    }, 3000);
});
