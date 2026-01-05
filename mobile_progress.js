// Mobile Progress Bar for Character Creator
// This script handles the mobile horizontal progress bar display and navigation

// Step titles mapping
const stepTitles = {
    1: "Raça",
    2: "Estilo de Combate",
    3: "Antecedente",
    4: "Atributos",
    5: "Descrição"
};

let currentStep = 1;
const totalSteps = 5;

// Initialize mobile progress bar on page load
document.addEventListener('DOMContentLoaded', function () {
    // Check if we're on mobile (max-width: 768px)
    if (window.innerWidth <= 768) {
        updateMobileProgressBar();
    }

    // Update on resize
    window.addEventListener('resize', function () {
        if (window.innerWidth <= 768) {
            updateMobileProgressBar();
        }
    });
});

// Update mobile progress bar display
function updateMobileProgressBar() {
    const progressBar = document.getElementById('mobileProgressBar');
    const stepText = document.getElementById('mobileStepText');
    const dots = document.querySelectorAll('.step-dot');
    const backBtn = document.getElementById('mobileBackBtn');

    if (!progressBar) return;

    // Show progress bar on mobile
    if (window.innerWidth <= 768) {
        progressBar.style.display = 'flex';
    } else {
        progressBar.style.display = 'none';
    }

    // Update step text
    if (stepText) {
        stepText.textContent = `Passo ${currentStep}/${totalSteps}: ${stepTitles[currentStep]}`;
    }

    // Update dots
    if (dots) {
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index + 1 < currentStep) {
                dot.classList.add('completed');
            } else if (index + 1 === currentStep) {
                dot.classList.add('active');
            }
        });
    }

    // Show/hide back button (hide on first step)
    if (backBtn) {
        if (currentStep === 1) {
            backBtn.style.opacity = '0.3';
            backBtn.style.pointerEvents = 'none';
        } else {
            backBtn.style.opacity = '1';
            backBtn.style.pointerEvents = 'auto';
        }
    }
}

// Navigate to previous step
function goToPreviousStep() {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

// Override or hook into existing goToStep function
const originalGoToStep = window.goToStep;
window.goToStep = function (stepNum) {
    currentStep = stepNum;
    updateMobileProgressBar();

    // Call original function if it exists
    if (typeof originalGoToStep === 'function') {
        originalGoToStep(stepNum);
    }
};

// Export for global use
window.updateMobileProgressBar = updateMobileProgressBar;
window.goToPreviousStep = goToPreviousStep;
