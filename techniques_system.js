// ============================================
// SISTEMA DE TÉCNICAS E RESPIRAÇÃO
// ============================================

// Inicializar técnicas se não existir
if (!charData.techniques) {
    charData.techniques = [];
}

// === RENDERIZAR TÉCNICAS ===
window.renderTechniques = function () {
    const grid = document.getElementById('techniquesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!charData.techniques || charData.techniques.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i data-lucide="zap" class="empty-state-icon"></i>
                <div class="empty-state-text">Nenhuma técnica aprendida</div>
                <div class="empty-state-subtext">Clique em "Adicionar Técnica" para começar</div>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    charData.techniques.forEach((tech, index) => {
        const card = document.createElement('div');
        card.className = 'technique-card';

        card.innerHTML = `
            <div class="technique-header">
                <div>
                    <h4 class="technique-name">${tech.name}</h4>
                    <span class="technique-type">${tech.type || 'Técnica'}</span>
                </div>
                ${tech.cost ? `<div class="technique-cost">${tech.cost} PE</div>` : ''}
            </div>
            <div class="technique-desc">${tech.description || 'Sem descrição'}</div>
            <div class="technique-actions">
                <button class="technique-btn primary" onclick="useTechnique(${index})">
                    <i data-lucide="zap" style="width:14px;"></i> Usar
                </button>
                <button class="technique-btn" onclick="editTechnique(${index})">
                    <i data-lucide="pencil" style="width:14px;"></i> Editar
                </button>
                <button class="technique-btn danger" onclick="removeTechnique(${index})">
                    <i data-lucide="trash-2" style="width:14px;"></i>
                </button>
            </div>
        `;

        grid.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
};

// === MODAL DE ADICIONAR TÉCNICA ===
window.openTechniqueModal = function () {
    const name = prompt('Nome da Técnica:');
    if (!name || !name.trim()) return;

    const type = prompt('Tipo (ex: Ofensiva, Defensiva, Suporte):', 'Ofensiva');
    const cost = prompt('Custo em PE:', '2');
    const description = prompt('Descrição da técnica:');

    const newTech = {
        name: name.trim(),
        type: type ? type.trim() : 'Técnica',
        cost: cost ? cost.trim() : '0',
        description: description ? description.trim() : ''
    };

    charData.techniques.push(newTech);

    if (typeof saveState === 'function') saveState();
    renderTechniques();

    showFlashMessage(`✓ ${newTech.name} adicionada!`);
};

// === USAR TÉCNICA ===
window.useTechnique = function (index) {
    const tech = charData.techniques[index];
    if (!tech) return;

    const cost = parseInt(tech.cost) || 0;
    const currentPE = charData.pe || charData.peMax || 0;

    if (cost > currentPE) {
        alert(`PE insuficiente! Você precisa de ${cost} PE, mas tem apenas ${currentPE}.`);
        return;
    }

    if (confirm(`Usar "${tech.name}"? (Custo: ${cost} PE)`)) {
        charData.pe = Math.max(0, currentPE - cost);

        if (typeof saveState === 'function') saveState();
        if (typeof updateBars === 'function') updateBars();

        showFlashMessage(`⚡ ${tech.name} usada! (-${cost} PE)`);
    }
};

// === EDITAR TÉCNICA ===
window.editTechnique = function (index) {
    const tech = charData.techniques[index];
    if (!tech) return;

    const newName = prompt('Nome da Técnica:', tech.name);
    if (newName !== null && newName.trim()) tech.name = newName.trim();

    const newType = prompt('Tipo:', tech.type);
    if (newType !== null && newType.trim()) tech.type = newType.trim();

    const newCost = prompt('Custo em PE:', tech.cost);
    if (newCost !== null) tech.cost = newCost.trim();

    const newDesc = prompt('Descrição:', tech.description);
    if (newDesc !== null) tech.description = newDesc.trim();

    if (typeof saveState === 'function') saveState();
    renderTechniques();
};

// === REMOVER TÉCNICA ===
window.removeTechnique = function (index) {
    const tech = charData.techniques[index];
    if (!tech) return;

    if (confirm(`Remover "${tech.name}"?`)) {
        charData.techniques.splice(index, 1);

        if (typeof saveState === 'function') saveState();
        renderTechniques();
    }
};

// === SISTEMA DE RESPIRAÇÃO ===
window.renderBreathing = function () {
    const container = document.getElementById('breathingContent');
    const levelReq = document.getElementById('breathingLevelReq');

    if (!container) return;

    const currentLevel = charData.level || 1;
    const isLocked = currentLevel < 3;

    // Atualizar indicador de nível
    if (levelReq) {
        if (isLocked) {
            levelReq.innerHTML = `
                <i data-lucide="lock" style="width:14px; vertical-align:middle;"></i>
                Desbloqueado no Nível 3
            `;
            levelReq.style.color = '#666';
        } else {
            levelReq.innerHTML = `
                <i data-lucide="unlock" style="width:14px; vertical-align:middle;"></i>
                Desbloqueado
            `;
            levelReq.style.color = 'var(--accent-cyan)';
        }
    }

    // Se bloqueado, mostrar overlay
    if (isLocked) {
        container.innerHTML = `
            <div class="breathing-lock-overlay">
                <i data-lucide="lock" class="breathing-lock-icon"></i>
                <div class="breathing-lock-text">Respiração Bloqueada</div>
                <div class="breathing-lock-subtext">Alcance o Nível 3 para desbloquear</div>
                <div style="margin-top: 1rem; font-size: 0.85rem; color: #555;">
                    Nível Atual: ${currentLevel} / 3
                </div>
            </div>
            <div class="breathing-locked">
                <div class="breathing-card">
                    <div class="breathing-name">Respiração da Água</div>
                    <div class="breathing-desc">
                        Uma das cinco respirações principais. Focada em movimentos fluidos e adaptáveis como a água.
                    </div>
                </div>
                <div class="breathing-card">
                    <div class="breathing-name">Respiração do Trovão</div>
                    <div class="breathing-desc">
                        Técnicas explosivas e rápidas como um raio. Focada em velocidade extrema e ataques únicos devastadores.
                    </div>
                </div>
            </div>
        `;
    } else {
        // Mostrar respiração desbloqueada
        const breathingStyle = charData.breathingStyle || charData.breathing || 'Nenhuma';

        if (breathingStyle === 'Nenhuma' || !breathingStyle) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="wind" class="empty-state-icon"></i>
                    <div class="empty-state-text">Nenhuma respiração selecionada</div>
                    <div class="empty-state-subtext">Selecione sua respiração na criação de personagem</div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="breathing-card">
                    <div class="breathing-name">${breathingStyle}</div>
                    <div class="breathing-desc">
                        ${getBreathingDescription(breathingStyle)}
                    </div>
                </div>
            `;
        }
    }

    if (window.lucide) window.lucide.createIcons();
};

function getBreathingDescription(style) {
    const descriptions = {
        'Respiração da Água': 'Movimentos fluidos e adaptáveis. Focada em defesa e contra-ataques precisos.',
        'Respiração do Trovão': 'Técnicas explosivas e rápidas como um raio. Velocidade extrema e poder devastador.',
        'Respiração da Chama': 'Ataques ardentes e poderosos. Força bruta combinada com técnicas flamejantes.',
        'Respiração da Pedra': 'Defesa impenetrável e força esmagadora. Resistência e poder absolutos.',
        'Respiração do Vento': 'Ataques cortantes e imprevisíveis. Mobilidade e técnicas em múltiplas direções.'
    };

    return descriptions[style] || 'Uma técnica de respiração única desenvolvida através de treinamento intenso.';
}

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof renderTechniques === 'function') renderTechniques();
        if (typeof renderBreathing === 'function') renderBreathing();
    }, 500);
});
