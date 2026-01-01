/**
 * Stellar Classification Module - Enhanced
 * Handles stellar classification with real image display
 */

class StellarClassification {
    constructor() {
        this.temperatureInput = document.getElementById('main-temperature-input');
        this.luminosityClassSelect = document.getElementById('main-luminosity-class');
        this.classifyBtn = document.getElementById('classify-btn');
        this.clearBtn = document.getElementById('clear-classification-btn');
        this.resultContainer = document.getElementById('classification-result');
        
        console.log('Classification elements found:', {
            temperatureInput: !!this.temperatureInput,
            luminosityClassSelect: !!this.luminosityClassSelect,
            classifyBtn: !!this.classifyBtn,
            clearBtn: !!this.clearBtn,
            resultContainer: !!this.resultContainer
        });
        
        this.initializeEventListeners();
        this.loadClassificationImages();
        
        // Force initialization after DOM is ready
        setTimeout(() => {
            this.forceInitialization();
        }, 1000);
    }

    forceInitialization() {
        console.log('Force initializing classification system...');
        
        // Ensure all elements are visible
        if (this.temperatureInput) {
            this.temperatureInput.style.display = 'block';
            this.temperatureInput.style.visibility = 'visible';
        }
        
        if (this.luminosityClassSelect) {
            this.luminosityClassSelect.style.display = 'block';
            this.luminosityClassSelect.style.visibility = 'visible';
        }
        
        if (this.classifyBtn) {
            this.classifyBtn.style.display = 'block';
            this.classifyBtn.style.visibility = 'visible';
            this.classifyBtn.disabled = false;
        }
        
        if (this.clearBtn) {
            this.clearBtn.style.display = 'block';
            this.clearBtn.style.visibility = 'visible';
            this.clearBtn.disabled = false;
        }
        
        // Ensure classification tab is visible
        const classificationTab = document.getElementById('main-classification-tab');
        if (classificationTab) {
            classificationTab.style.display = 'block';
            classificationTab.style.visibility = 'visible';
        }
        
        console.log('Classification system force initialized');
    }

    initializeEventListeners() {
        this.classifyBtn?.addEventListener('click', () => this.classifyStar());
        this.clearBtn?.addEventListener('click', () => this.clearClassification());
        this.temperatureInput?.addEventListener('input', () => this.onInputChange());
        this.luminosityClassSelect?.addEventListener('change', () => this.onInputChange());
    }

    loadClassificationImages() {
        // Check if images are loaded and show error messages if not
        const images = document.querySelectorAll('.classification-img');
        let loadedCount = 0;
        
        images.forEach((img, index) => {
            // Force image reload to ensure proper loading
            const originalSrc = img.src;
            img.src = originalSrc + '?t=' + Date.now();
            
            img.addEventListener('error', () => {
                console.warn(`Classification image ${index + 1} failed to load: ${img.src}`);
                img.style.display = 'none';
                
                // Show placeholder text
                const placeholder = document.createElement('div');
                placeholder.className = 'image-placeholder';
                placeholder.innerHTML = `
                    <div class="placeholder-icon">📊</div>
                    <div class="placeholder-text">
                        <strong>${this.getImageName(index)}</strong><br>
                        <small>Loading reference image...</small>
                    </div>
                `;
                img.parentNode?.insertBefore(placeholder, img);
            });
            
            img.addEventListener('load', () => {
                console.log(`Classification image ${index + 1} loaded successfully: ${img.src}`);
                loadedCount++;
                
                // Hide any placeholder that might exist
                const placeholder = img.parentNode?.querySelector('.image-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
                
                img.style.display = 'block';
                img.style.opacity = '1';
            });
        });
        
        // Log loading status
        setTimeout(() => {
            console.log(`Image loading status: ${loadedCount}/${images.length} images loaded`);
            if (loadedCount < images.length) {
                console.warn('Some images failed to load - placeholders shown');
            }
        }, 2000);
    }

    getImageName(index) {
        const names = ['HR Diagram', 'Spectral Classes', 'Stellar Examples', 'Luminosity Classes'];
        return names[index] || `Image ${index + 1}`;
    }

    onInputChange() {
        // Clear previous results when input changes
        this.hideResult();
    }

    classifyStar() {
        const temperature = parseFloat(this.temperatureInput?.value);
        const luminosityClass = this.luminosityClassSelect?.value;

        if (!temperature || temperature <= 0) {
            this.showError('Please enter a valid temperature');
            return;
        }

        if (!luminosityClass) {
            this.showError('Please select a luminosity class');
            return;
        }

        const classification = this.determineSpectralClass(temperature, luminosityClass);
        this.displayResult(classification);
    }

    determineSpectralClass(temperature, luminosityClass) {
        // Harvard spectral classification based on temperature
        let spectralClass;
        let temperatureRange;
        let description;

        if (temperature >= 33000) {
            spectralClass = 'O';
            temperatureRange = '≥ 33,000 K';
            description = 'Blue stars, very hot, surface temperature > 30,000 K';
        } else if (temperature >= 10000) {
            spectralClass = 'B';
            temperatureRange = '10,000–33,000 K';
            description = 'Blue-white stars, hot';
        } else if (temperature >= 7500) {
            spectralClass = 'A';
            temperatureRange = '7,500–10,000 K';
            description = 'White stars, medium-hot';
        } else if (temperature >= 6000) {
            spectralClass = 'F';
            temperatureRange = '6,000–7,500 K';
            description = 'Yellow-white stars, solar-type';
        } else if (temperature >= 5200) {
            spectralClass = 'G';
            temperatureRange = '5,200–6,000 K';
            description = 'Yellow stars, cool (like our Sun)';
        } else if (temperature >= 3700) {
            spectralClass = 'K';
            temperatureRange = '3,700–5,200 K';
            description = 'Orange-red stars, cool';
        } else {
            spectralClass = 'M';
            temperatureRange = '2,400–3,700 K';
            description = 'Red stars, very cool';
        }

        return {
            spectralClass: `${spectralClass}${luminosityClass}`,
            temperatureRange,
            description,
            temperature,
            luminosityClass
        };
    }

    displayResult(classification) {
        if (!this.resultContainer) return;

        this.resultContainer.style.display = 'block';
        
        // Update result badge
        const resultBadge = document.getElementById('result-badge');
        if (resultBadge) {
            resultBadge.textContent = classification.spectralClass;
            resultBadge.className = 'result-badge';
            
            // Add color based on spectral class
            const baseClass = classification.spectralClass.charAt(0);
            resultBadge.classList.add(`spectral-${baseClass.toLowerCase()}`);
        }

        // Update result details
        const spectralType = document.getElementById('spectral-type');
        const tempRange = document.getElementById('temp-range');
        const classDescription = document.getElementById('class-description');

        if (spectralType) spectralType.textContent = classification.spectralClass;
        if (tempRange) tempRange.textContent = classification.temperatureRange;
        if (classDescription) classDescription.textContent = classification.description;

        // Add animation
        this.resultContainer.classList.add('result-visible');
    }

    hideResult() {
        if (this.resultContainer) {
            this.resultContainer.style.display = 'none';
            this.resultContainer.classList.remove('result-visible');
        }
    }

    clearClassification() {
        this.temperatureInput.value = '';
        this.luminosityClassSelect.value = '';
        this.hideResult();
        this.temperatureInput?.focus();
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'classification-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(errorDiv);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
}

// Initialize when DOM is ready
function initializeClassification() {
    console.log('Initializing Stellar Classification...');
    
    // Check if classification elements exist
    const tempInput = document.getElementById('main-temperature-input');
    const lumSelect = document.getElementById('main-luminosity-class');
    const classifyBtn = document.getElementById('classify-btn');
    const clearBtn = document.getElementById('clear-classification-btn');
    const resultContainer = document.getElementById('classification-result');
    
    console.log('Classification elements found:', {
        tempInput: !!tempInput,
        lumSelect: !!lumSelect,
        classifyBtn: !!classifyBtn,
        clearBtn: !!clearBtn,
        resultContainer: !!resultContainer
    });
    
    if (tempInput && lumSelect && classifyBtn) {
        new StellarClassification();
        console.log('Stellar Classification initialized successfully');
    } else {
        console.warn('Classification elements not found, skipping initialization');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeClassification);
} else {
    initializeClassification();
}
