// ============================================
// SISTEMA DE COMBATE COM DADOS 3D
// ============================================

// Inicializar ataques se não existir
if (!charData.attacks) {
    charData.attacks = [];
}

// === RENDERIZAR ATAQUES ===
window.renderAttacks = function () {
    const container = document.getElementById('attacksList');
    if (!container) return;

    container.innerHTML = '';

    if (!charData.attacks || charData.attacks.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i data-lucide="sword" class="empty-state-icon"></i>
                <div class="empty-state-text">Nenhum ataque configurado</div>
                <div class="empty-state-subtext">Clique em "+ Ataque" para adicionar</div>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    charData.attacks.forEach((attack, index) => {
        const card = document.createElement('div');
        card.className = 'attack-card';

        card.innerHTML = `
            <div class="attack-header">
                <h4 class="attack-name">${attack.name}</h4>
                <div class="attack-bonus">${attack.bonus || '+0'}</div>
            </div>
            <div class="attack-damage">
                <i data-lucide="zap" style="width:16px; color:var(--accent-red);"></i>
                ${attack.damage || '1d6'}
            </div>
            <div class="attack-type">${attack.type || 'Corpo a Corpo'}</div>
            <div class="attack-actions">
                <button class="attack-btn primary" onclick="rollAttack(${index})">
                    <i data-lucide="dice-6" style="width:14px;"></i> Rolar Ataque
                </button>
                <button class="attack-btn" onclick="editAttack(${index})">
                    <i data-lucide="pencil" style="width:14px;"></i>
                </button>
                <button class="attack-btn danger" onclick="removeAttack(${index})">
                    <i data-lucide="trash-2" style="width:14px;"></i>
                </button>
            </div>
        `;

        container.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
};

// === MODAL DE ADICIONAR ATAQUE ===
window.openAttackModal = function () {
    const name = prompt('Nome do Ataque:', 'Ataque Básico');
    if (!name || !name.trim()) return;

    const bonus = prompt('Bônus de Ataque (ex: +5):', '+0');
    const damage = prompt('Dano (ex: 1d6+2, 2d8):', '1d6');
    const type = prompt('Tipo (Corpo a Corpo, Distância, Mágico):', 'Corpo a Corpo');

    const newAttack = {
        name: name.trim(),
        bonus: bonus ? bonus.trim() : '+0',
        damage: damage ? damage.trim() : '1d6',
        type: type ? type.trim() : 'Corpo a Corpo'
    };

    charData.attacks.push(newAttack);

    if (typeof saveState === 'function') saveState();
    renderAttacks();

    showFlashMessage(`✓ ${newAttack.name} adicionado!`);
};

// === ROLAR ATAQUE COM ANIMAÇÃO 3D ===
window.rollAttack = function (index) {
    const attack = charData.attacks[index];
    if (!attack) return;

    // Parse bonus
    const bonusNum = parseInt(attack.bonus.replace(/[^0-9-]/g, '')) || 0;

    // Roll attack (d20)
    const attackRoll = rollDice(20);
    const attackTotal = attackRoll + bonusNum;

    // Parse and roll damage
    const damageResult = rollDamageString(attack.damage);

    // Show 3D dice animation
    show3DDiceRoll(attackRoll, 20, () => {
        // After animation, show results
        const resultHTML = `
            <div class="attack-result-card">
                <div class="attack-result-header">
                    <i data-lucide="sword" style="color:var(--accent-red);"></i>
                    <strong>${attack.name}</strong>
                </div>
                <div class="attack-result-body">
                    <div class="result-row">
                        <span>Ataque:</span>
                        <span class="result-value ${attackRoll === 20 ? 'critical' : attackRoll === 1 ? 'fumble' : ''}">${attackRoll} ${attack.bonus} = ${attackTotal}</span>
                    </div>
                    <div class="result-row">
                        <span>Dano:</span>
                        <span class="result-value damage">${damageResult.formula} = ${damageResult.total}</span>
                    </div>
                    ${attackRoll === 20 ? '<div class="critical-hit">⚡ ACERTO CRÍTICO!</div>' : ''}
                    ${attackRoll === 1 ? '<div class="fumble-hit">💀 ERRO CRÍTICO!</div>' : ''}
                </div>
            </div>
        `;

        showAttackResult(resultHTML);
    });
};

// === SISTEMA DE DADOS 3D ===
function show3DDiceRoll(result, sides, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'dice-overlay';
    overlay.innerHTML = `
        <div class="dice-container">
            <div class="dice-3d" id="rolling-dice">
                <div class="dice-face dice-front">${result}</div>
                <div class="dice-face dice-back">${sides}</div>
                <div class="dice-face dice-right">${Math.ceil(sides / 2)}</div>
                <div class="dice-face dice-left">${Math.ceil(sides / 3)}</div>
                <div class="dice-face dice-top">${Math.ceil(sides / 4)}</div>
                <div class="dice-face dice-bottom">${Math.ceil(sides / 5)}</div>
            </div>
            <div class="dice-result-text">Rolando d${sides}...</div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Trigger animation
    setTimeout(() => {
        overlay.classList.add('active');
        const dice = document.getElementById('rolling-dice');
        if (dice) dice.classList.add('rolling');
    }, 10);

    // Show result after animation
    setTimeout(() => {
        const resultText = overlay.querySelector('.dice-result-text');
        if (resultText) {
            resultText.textContent = `Resultado: ${result}`;
            resultText.style.fontSize = '2rem';
            resultText.style.color = result === sides ? 'var(--accent-cyan)' : 'white';
        }
    }, 1500);

    // Remove and callback
    setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            if (callback) callback();
        }, 300);
    }, 2500);
}

function showAttackResult(html) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'floating-result';
    resultDiv.innerHTML = html;
    document.body.appendChild(resultDiv);

    setTimeout(() => resultDiv.classList.add('show'), 10);

    setTimeout(() => {
        resultDiv.classList.remove('show');
        setTimeout(() => resultDiv.remove(), 300);
    }, 5000);

    if (window.lucide) window.lucide.createIcons();
}

// === UTILITÁRIOS DE DADOS ===
function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function rollDamageString(damageStr) {
    // Parse strings like "1d6+2", "2d8", "1d6+1d4"
    let total = 0;
    let formula = '';

    // Simple parser
    const parts = damageStr.split('+');
    parts.forEach(part => {
        part = part.trim();
        if (part.includes('d')) {
            const [count, sides] = part.split('d').map(n => parseInt(n) || 1);
            let subtotal = 0;
            for (let i = 0; i < count; i++) {
                subtotal += rollDice(sides);
            }
            total += subtotal;
            formula += (formula ? ' + ' : '') + `${count}d${sides}(${subtotal})`;
        } else {
            const num = parseInt(part) || 0;
            total += num;
            if (num !== 0) formula += (formula ? ' + ' : '') + num;
        }
    });

    return { total, formula: formula || '0' };
}

// === EDITAR E REMOVER ===
window.editAttack = function (index) {
    const attack = charData.attacks[index];
    if (!attack) return;

    const newName = prompt('Nome do Ataque:', attack.name);
    if (newName !== null && newName.trim()) attack.name = newName.trim();

    const newBonus = prompt('Bônus de Ataque:', attack.bonus);
    if (newBonus !== null) attack.bonus = newBonus.trim();

    const newDamage = prompt('Dano:', attack.damage);
    if (newDamage !== null && newDamage.trim()) attack.damage = newDamage.trim();

    const newType = prompt('Tipo:', attack.type);
    if (newType !== null && newType.trim()) attack.type = newType.trim();

    if (typeof saveState === 'function') saveState();
    renderAttacks();
};

window.removeAttack = function (index) {
    const attack = charData.attacks[index];
    if (!attack) return;

    if (confirm(`Remover "${attack.name}"?`)) {
        charData.attacks.splice(index, 1);
        if (typeof saveState === 'function') saveState();
        renderAttacks();
    }
};

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof renderAttacks === 'function') renderAttacks();
    }, 500);
});
