/**
 * Classification Display Rendering Module
 * Extracted from ui.js for better modularity
 */

class ClassificationDisplayRenderer {
    constructor() {
        this.helpers = typeof window !== 'undefined' && typeof window.helpers ? window.helpers : null;
    }
    
    /**
     * Get DOM element (with caching)
     */
    getElement(id) {
        if (this.helpers) {
            return this.helpers.getElement(id);
        }
        return document.getElementById(id);
    }
    
    /**
     * Display classification result
     * @param {HTMLElement|string} resultDisplayElementOrId - Element or element ID
     * @param {string} classification - Classification result string
     * @param {number} temperature - Temperature in Kelvin
     * @param {string} luminosityClass - Luminosity class (if applicable)
     * @param {boolean} isProtostar - Whether it's a protostar
     * @param {boolean} isWhiteDwarf - Whether it's a white dwarf
     * @param {string} whiteDwarfType - White dwarf type (if applicable)
     */
    displayResult(resultDisplayElementOrId, classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType) {
        const resultDisplay = typeof resultDisplayElementOrId === 'string' 
            ? this.getElement(resultDisplayElementOrId)
            : resultDisplayElementOrId;
        
        if (!resultDisplay) {
            console.error('[ClassificationDisplayRenderer] Result display element not found');
            return;
        }
        
        let resultHTML = '<div class="classification-result-content">';
        resultHTML += '<h4>Classification Result</h4>';
        resultHTML += `<div class="classification-value">${escapeHtml(classification)}</div>`;
        
        // Add details
        resultHTML += '<div class="classification-details">';
        const formattedTemp = typeof UnitConverter !== 'undefined'
            ? UnitConverter.formatNumber(temperature)
            : temperature.toString();
        resultHTML += `<p><strong>Temperature:</strong> ${formattedTemp} K</p>`;
        
        if (isWhiteDwarf && whiteDwarfType) {
            const stellarClassifier = typeof window !== 'undefined' && typeof window.stellarClassifier !== 'undefined'
                ? window.stellarClassifier
                : null;
            if (stellarClassifier && typeof stellarClassifier.getWhiteDwarfDescription === 'function') {
                const wdDesc = stellarClassifier.getWhiteDwarfDescription(whiteDwarfType);
                resultHTML += `<p><strong>Type:</strong> White Dwarf</p>`;
                resultHTML += `<p><strong>White Dwarf Type:</strong> ${escapeHtml(whiteDwarfType)} (${escapeHtml(wdDesc)})</p>`;
            } else {
                resultHTML += `<p><strong>Type:</strong> White Dwarf</p>`;
                resultHTML += `<p><strong>White Dwarf Type:</strong> ${escapeHtml(whiteDwarfType)}</p>`;
            }
        } else if (isProtostar) {
            resultHTML += '<p><strong>Type:</strong> Young Stellar Object (YSO)</p>';
        } else {
            if (luminosityClass) {
                const stellarClassifier = typeof window !== 'undefined' && typeof window.stellarClassifier !== 'undefined'
                    ? window.stellarClassifier
                    : null;
                if (stellarClassifier && typeof stellarClassifier.getLuminosityDescription === 'function') {
                    const desc = stellarClassifier.getLuminosityDescription(luminosityClass);
                    resultHTML += `<p><strong>Luminosity Class:</strong> ${escapeHtml(luminosityClass)} (${escapeHtml(desc)})</p>`;
                } else {
                    resultHTML += `<p><strong>Luminosity Class:</strong> ${escapeHtml(luminosityClass)}</p>`;
                }
            }
        }
        resultHTML += '</div>';
        
        resultHTML += '</div>';
        
        resultDisplay.innerHTML = resultHTML;
        resultDisplay.classList.add('show');
    }
    
    /**
     * Display classification error
     * @param {HTMLElement|string} resultDisplayElementOrId - Element or element ID
     * @param {string} message - Error message
     */
    displayError(resultDisplayElementOrId, message) {
        const resultDisplay = typeof resultDisplayElementOrId === 'string' 
            ? this.getElement(resultDisplayElementOrId)
            : resultDisplayElementOrId;
        
        if (!resultDisplay) {
            console.error('[ClassificationDisplayRenderer] Result display element not found');
            return;
        }
        
        resultDisplay.innerHTML = `<div class="error-message">${escapeHtml(message)}</div>`;
        resultDisplay.classList.add('show');
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ClassificationDisplayRenderer = ClassificationDisplayRenderer;
    // Create singleton instance
    window.classificationDisplayRenderer = new ClassificationDisplayRenderer();
}

