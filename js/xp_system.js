// XP-Based Leveling System
// Based on D&D 5e progression table

// XP Progression Table (Levels 1-20)
const XP_TABLE = [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 300 },
    { level: 3, xpRequired: 900 },
    { level: 4, xpRequired: 2700 },
    { level: 5, xpRequired: 6500 },
    { level: 6, xpRequired: 14000 },
    { level: 7, xpRequired: 23000 },
    { level: 8, xpRequired: 34000 },
    { level: 9, xpRequired: 48000 },
    { level: 10, xpRequired: 64000 },
    { level: 11, xpRequired: 85000 },
    { level: 12, xpRequired: 100000 },
    { level: 13, xpRequired: 120000 },
    { level: 14, xpRequired: 140000 },
    { level: 15, xpRequired: 165000 },
    { level: 16, xpRequired: 195000 },
    { level: 17, xpRequired: 225000 },
    { level: 18, xpRequired: 265000 },
    { level: 19, xpRequired: 305000 },
    { level: 20, xpRequired: 355000 }
];

/**
 * Calculate the current level based on total XP
 * @param {number} currentXp - Total XP accumulated
 * @returns {number} - Current level (1-20)
 */
function calculateLevel(currentXp) {
    if (currentXp === undefined || currentXp === null || currentXp < 0) {
        return 1;
    }

    // Find the highest level where XP requirement is met
    for (let i = XP_TABLE.length - 1; i >= 0; i--) {
        if (currentXp >= XP_TABLE[i].xpRequired) {
            return XP_TABLE[i].level;
        }
    }

    return 1; // Default to level 1
}

/**
 * Get XP required for next level
 * @param {number} currentLevel - Current character level
 * @returns {number} - XP required for next level (0 if max level)
 */
function getXpForNextLevel(currentLevel) {
    if (currentLevel >= 20) return 0; // Max level reached

    const nextLevelData = XP_TABLE.find(entry => entry.level === currentLevel + 1);
    return nextLevelData ? nextLevelData.xpRequired : 0;
}

/**
 * Get XP required for current level
 * @param {number} currentLevel - Current character level
 * @returns {number} - XP required for current level
 */
function getXpForCurrentLevel(currentLevel) {
    const levelData = XP_TABLE.find(entry => entry.level === currentLevel);
    return levelData ? levelData.xpRequired : 0;
}

/**
 * Calculate XP progress percentage towards next level
 * @param {number} currentXp - Total XP
 * @param {number} currentLevel - Current level
 * @returns {number} - Percentage (0-100)
 */
function getXpProgress(currentXp, currentLevel) {
    if (currentLevel >= 20) return 100;

    const currentLevelXp = getXpForCurrentLevel(currentLevel);
    const nextLevelXp = getXpForNextLevel(currentLevel);

    if (nextLevelXp === 0) return 100;

    const xpIntoCurrentLevel = currentXp - currentLevelXp;
    const xpNeededForLevel = nextLevelXp - currentLevelXp;

    return Math.min(100, Math.max(0, (xpIntoCurrentLevel / xpNeededForLevel) * 100));
}

/**
 * Add XP to character and handle level ups
 * @param {number} amount - Amount of XP to add
 * @param {boolean} showNotification - Whether to show toast notifications
 */
function addXp(amount, showNotification = true) {
    // Ensure humanData exists (should be loaded in dashboard)
    if (typeof humanData === 'undefined' || !humanData) {
        console.error('humanData not found. Cannot add XP.');
        return;
    }

    // Initialize XP if not present
    if (!humanData.xp && humanData.xp !== 0) {
        humanData.xp = 0;
    }

    const oldLevel = humanData.level || 1;
    const oldXp = humanData.xp || 0;

    // Add XP
    humanData.xp = Math.max(0, oldXp + amount);

    // Calculate new level
    const newLevel = calculateLevel(humanData.xp);

    if (showNotification) {
        const message = amount >= 0
            ? `+${amount} XP | Total: ${humanData.xp.toLocaleString()}`
            : `${amount} XP | Total: ${humanData.xp.toLocaleString()}`;

        if (typeof showToast === 'function') {
            showToast(message, "info");
        }
    }

    // Check for level up
    if (newLevel > oldLevel) {
        handleLevelUp(oldLevel, newLevel);
    }

    // Save character data
    if (typeof saveHuman === 'function') {
        saveHuman();
    }

    // Update UI
    if (typeof updateXpDisplay === 'function') {
        updateXpDisplay();
    }
}

/**
 * Handle level up process
 * @param {number} oldLevel - Previous level
 * @param {number} newLevel - New level reached
 */
function handleLevelUp(oldLevel, newLevel) {
    const levelsGained = newLevel - oldLevel;

    // Show celebration toast
    if (typeof showToast === 'function') {
        const message = levelsGained > 1
            ? `🎉 SUBIU DE NÍVEL! ${levelsGained} níveis alcançados! Agora você é Nível ${newLevel}!`
            : `🎉 SUBIU DE NÍVEL! Nível ${newLevel} alcançado!`;

        showToast(message, "success");
    }

    // Trigger the existing level up modal
    if (typeof setLevel === 'function') {
        setLevel(newLevel);
    } else if (typeof showLevelUpModal === 'function') {
        showLevelUpModal(newLevel);
    }

    // Play level up sound if available
    if (typeof playSound === 'function') {
        playSound('levelup');
    }
}

/**
 * Update XP display in the UI
 */
function updateXpDisplay() {
    if (typeof humanData === 'undefined' || !humanData) return;

    const currentXp = humanData.xp || 0;
    const currentLevel = humanData.level || 1;

    // Update XP text display
    const xpEl = document.getElementById('dispXP');
    if (xpEl) {
        const nextLevelXp = getXpForNextLevel(currentLevel);
        const currentLevelXp = getXpForCurrentLevel(currentLevel);
        const xpNeeded = nextLevelXp - currentXp;

        if (currentLevel >= 20) {
            xpEl.textContent = `${currentXp.toLocaleString()} XP (Máximo)`;
        } else {
            xpEl.textContent = `${currentXp.toLocaleString()} / ${nextLevelXp.toLocaleString()}`;
        }
    }

    // Update XP progress bar
    const xpBar = document.getElementById('xpProgressBar');
    if (xpBar) {
        const progress = getXpProgress(currentXp, currentLevel);
        xpBar.style.width = progress + '%';
    }

    // Update XP percentage text
    const xpPercent = document.getElementById('xpPercent');
    if (xpPercent) {
        const progress = getXpProgress(currentXp, currentLevel);
        xpPercent.textContent = Math.floor(progress) + '%';
    }
}

/**
 * Set XP directly (admin/debug function)
 * @param {number} xpAmount - Total XP to set
 */
function setXp(xpAmount) {
    if (typeof humanData === 'undefined' || !humanData) {
        console.error('humanData not found. Cannot set XP.');
        return;
    }

    const oldLevel = humanData.level || 1;
    humanData.xp = Math.max(0, xpAmount);

    const newLevel = calculateLevel(humanData.xp);

    if (newLevel > oldLevel) {
        handleLevelUp(oldLevel, newLevel);
    } else if (newLevel < oldLevel) {
        // Level down
        humanData.level = newLevel;
        if (typeof showToast === 'function') {
            showToast(`Nível ajustado para ${newLevel}`, "info");
        }
    }

    if (typeof saveHuman === 'function') {
        saveHuman();
    }

    if (typeof updateXpDisplay === 'function') {
        updateXpDisplay();
    }

    if (typeof initDashboard === 'function') {
        initDashboard();
    }
}

// Export for global use
window.XP_TABLE = XP_TABLE;
window.calculateLevel = calculateLevel;
window.getXpForNextLevel = getXpForNextLevel;
window.getXpForCurrentLevel = getXpForCurrentLevel;
window.getXpProgress = getXpProgress;
window.addXp = addXp;
window.setXp = setXp;
window.updateXpDisplay = updateXpDisplay;
window.handleLevelUp = handleLevelUp;

// Initialize XP display when dashboard loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof updateXpDisplay === 'function') {
            updateXpDisplay();
        }
    });
} else {
    // DOM already loaded
    if (typeof updateXpDisplay === 'function' && typeof humanData !== 'undefined') {
        updateXpDisplay();
    }
}
