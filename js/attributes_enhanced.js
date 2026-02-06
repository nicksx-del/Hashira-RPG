// ============================================
// SISTEMA DE ATRIBUTOS APRIMORADO
// ============================================

window.updateAttributeCards = function () {
    const stats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

    stats.forEach(stat => {
        const value = charData.attributes && charData.attributes[stat] ? charData.attributes[stat] : 10;
        const modifier = Math.floor((value - 10) / 2);
        const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;

        // Update card value
        const cardValue = document.getElementById(`card-${stat}`);
        if (cardValue) cardValue.textContent = value;

        // Update modifier
        const modEl = document.getElementById(`mod-${stat}`);
        if (modEl) {
            modEl.textContent = modifierText;
            // Color code modifiers
            if (modifier > 0) {
                modEl.style.color = '#4ade80'; // Green
            } else if (modifier < 0) {
                modEl.style.color = '#f87171'; // Red
            } else {
                modEl.style.color = '#888'; // Gray
            }
        }
    });
};

// Hook into existing updateRadarChart
const _origRadarUpdate = window.updateRadarChart;
window.updateRadarChart = function () {
    if (_origRadarUpdate) _origRadarUpdate();
    if (typeof updateAttributeCards === 'function') updateAttributeCards();
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof updateAttributeCards === 'function') updateAttributeCards();
    }, 600);
});
