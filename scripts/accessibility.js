/**
 * Accessibility Controls
 * Handles reduced-motion toggle and performance optimizations
 */

(function() {
    'use strict';

    // Check for saved preference
    const savedPreference = localStorage.getItem('reducedMotion');
    const savedPerformance = localStorage.getItem('performanceMode');

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        const toggleBtn = document.getElementById('accessibility-toggle');
        if (!toggleBtn) return;

        // Apply saved preferences
        if (savedPreference === 'true') {
            document.body.classList.add('reduced-motion');
        }
        if (savedPerformance === 'true') {
            document.body.classList.add('performance-mode');
        }

        // Update button state
        updateToggleButton();

        // Toggle on click
        toggleBtn.addEventListener('click', function() {
            toggleAccessibility();
        });

        // Keyboard shortcut: Alt+A
        document.addEventListener('keydown', function(e) {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                toggleAccessibility();
            }
        });
    });

    function toggleAccessibility() {
        const body = document.body;
        const hasReducedMotion = body.classList.contains('reduced-motion');
        const hasPerformanceMode = body.classList.contains('performance-mode');

        // Cycle through: normal -> reduced-motion -> performance-mode -> normal
        if (!hasReducedMotion && !hasPerformanceMode) {
            // Enable reduced motion
            body.classList.add('reduced-motion');
            body.classList.remove('performance-mode');
            localStorage.setItem('reducedMotion', 'true');
            localStorage.setItem('performanceMode', 'false');
        } else if (hasReducedMotion && !hasPerformanceMode) {
            // Enable performance mode (no background at all)
            body.classList.remove('reduced-motion');
            body.classList.add('performance-mode');
            localStorage.setItem('reducedMotion', 'false');
            localStorage.setItem('performanceMode', 'true');
        } else {
            // Back to normal
            body.classList.remove('reduced-motion');
            body.classList.remove('performance-mode');
            localStorage.setItem('reducedMotion', 'false');
            localStorage.setItem('performanceMode', 'false');
        }

        updateToggleButton();
    }

    function updateToggleButton() {
        const toggleBtn = document.getElementById('accessibility-toggle');
        if (!toggleBtn) return;

        const body = document.body;
        const hasReducedMotion = body.classList.contains('reduced-motion');
        const hasPerformanceMode = body.classList.contains('performance-mode');

        if (hasPerformanceMode) {
            toggleBtn.textContent = '⚡';
            toggleBtn.title = 'Performance Mode: Background disabled. Click to return to normal.';
        } else if (hasReducedMotion) {
            toggleBtn.textContent = '🎨';
            toggleBtn.title = 'Reduced Motion: Static background. Click for performance mode.';
        } else {
            toggleBtn.textContent = '🎨';
            toggleBtn.title = 'Normal Mode: Animated background. Click for reduced motion.';
        }
    }

    // Respect system preference on first load
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (savedPreference === null) { // Only auto-apply if user hasn't set a preference
            document.body.classList.add('reduced-motion');
            localStorage.setItem('reducedMotion', 'true');
        }
    }
})();

