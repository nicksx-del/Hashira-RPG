// ============================================
// SISTEMA DE PERÍCIAS COM ROLAGEM 3D
// ============================================

// Lista completa de perícias D&D 5e adaptadas
const SKILLS_LIST = [
    { name: 'Acrobacia', attr: 'dex', icon: 'move-diagonal' },
    { name: 'Arcanismo', attr: 'int', icon: 'sparkles' },
    { name: 'Atletismo', attr: 'str', icon: 'dumbbell' },
    { name: 'Atuação', attr: 'cha', icon: 'drama' },
    { name: 'Enganação', attr: 'cha', icon: 'eye-off' },
    { name: 'Furtividade', attr: 'dex', icon: 'footprints' },
    { name: 'História', attr: 'int', icon: 'book-open' },
    { name: 'Intimidação', attr: 'cha', icon: 'skull' },
    { name: 'Intuição', attr: 'wis', icon: 'eye' },
    { name: 'Investigação', attr: 'int', icon: 'search' },
    { name: 'Lidar com Animais', attr: 'wis', icon: 'paw-print' },
    { name: 'Medicina', attr: 'wis', icon: 'heart-pulse' },
    { name: 'Natureza', attr: 'int', icon: 'leaf' },
    { name: 'Percepção', attr: 'wis', icon: 'scan' },
    { name: 'Persuasão', attr: 'cha', icon: 'message-circle' },
    { name: 'Prestidigitação', attr: 'dex', icon: 'hand' },
    { name: 'Religião', attr: 'int', icon: 'church' },
    { name: 'Sobrevivência', attr: 'wis', icon: 'compass' }
];

// Cores por atributo
const ATTR_COLORS = {
    str: '#d90429',
    dex: '#00b4d8',
    con: '#00ff00',
    int: '#9d4edd',
    wis: '#ffaa00',
    cha: '#ff00ff'
};

// === RENDERIZAR PERÍCIAS ===
window.renderSkills = function () {
    const container = document.getElementById('skillsListBody');
    if (!container) return;

    container.innerHTML = '';

    // Inicializar proficiências se não existir
    if (!charData.skillProficiencies) {
        charData.skillProficiencies = [];
    }

    SKILLS_LIST.forEach((skill, index) => {
        const isProficient = charData.skillProficiencies.includes(skill.name);

        // Try 'stats' first (Dashboard default), then 'attributes' (Creation default), then 10
        const attrValue = (charData.stats && charData.stats[skill.attr]) || (charData.attributes && charData.attributes[skill.attr]) || 10;

        const modifier = Math.floor((attrValue - 10) / 2);
        // Prof Bonus: Use global hunter system or default 2
        const profBonus = (window.HunterSystem && typeof window.HunterSystem.calculateProficiency === 'function')
            ? window.HunterSystem.calculateProficiency(charData.level || 1)
            : 2;

        const totalBonus = modifier + (isProficient ? profBonus : 0);
        const bonusText = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;

        const skillRow = document.createElement('div');
        skillRow.className = 'skill-row';
        if (isProficient) skillRow.classList.add('proficient');

        skillRow.innerHTML = `
            <div class="skill-info">
                <div class="skill-prof-indicator" onclick="toggleSkillProficiency('${skill.name}', this)" title="Clique para ${isProficient ? 'remover' : 'adicionar'} proficiência">
                    <i data-lucide="${isProficient ? 'check-circle' : 'circle'}" style="width:16px;"></i>
                </div>
                <div class="skill-details">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-attr" style="color: ${ATTR_COLORS[skill.attr]};">${skill.attr.toUpperCase()}</div>
                </div>
            </div>
            <div class="skill-bonus" style="color: ${ATTR_COLORS[skill.attr]};">${bonusText}</div>
            <button class="skill-roll-btn" onclick="rollSkill('${skill.name}', '${skill.attr}', ${totalBonus})" title="Rolar ${skill.name}">
                <i data-lucide="dice-6" style="width:16px;"></i>
            </button>
        `;

        container.appendChild(skillRow);
    });

    if (window.lucide) window.lucide.createIcons();
};

// === TOGGLE PROFICIÊNCIA ===
window.toggleSkillProficiency = function (skillName, element) {
    if (!charData.skillProficiencies) {
        charData.skillProficiencies = [];
    }

    const index = charData.skillProficiencies.indexOf(skillName);
    if (index > -1) {
        charData.skillProficiencies.splice(index, 1);
    } else {
        charData.skillProficiencies.push(skillName);
    }

    if (typeof saveState === 'function') saveState();
    renderSkills();
};

// === ROLAR PERÍCIA COM ANIMAÇÃO 3D ===
window.rollSkill = function (skillName, attr, bonus) {
    // Roll d20
    const roll = rollDice(20);
    const total = roll + bonus;

    // Show 3D dice animation (reusa a função do combate)
    if (typeof show3DDiceRoll === 'function') {
        show3DDiceRoll(roll, 20, () => {
            // After animation, show results
            const resultHTML = `
                <div class="skill-result-card">
                    <div class="skill-result-header">
                        <i data-lucide="check-circle" style="color:${ATTR_COLORS[attr]};"></i>
                        <strong>${skillName}</strong>
                    </div>
                    <div class="skill-result-body">
                        <div class="result-row">
                            <span>Rolagem:</span>
                            <span class="result-value ${roll === 20 ? 'critical' : roll === 1 ? 'fumble' : ''}">${roll}</span>
                        </div>
                        <div class="result-row">
                            <span>Bônus:</span>
                            <span class="result-value">${bonus >= 0 ? '+' : ''}${bonus}</span>
                        </div>
                        <div class="result-row total">
                            <span>Total:</span>
                            <span class="result-value" style="color:${ATTR_COLORS[attr]}; font-size:1.8rem;">${total}</span>
                        </div>
                        ${roll === 20 ? '<div class="critical-hit">🎯 SUCESSO CRÍTICO!</div>' : ''}
                        ${roll === 1 ? '<div class="fumble-hit">💀 FALHA CRÍTICA!</div>' : ''}
                    </div>
                </div>
            `;

            showSkillResult(resultHTML);
        });
    } else {
        // Fallback se a função de dados 3D não estiver disponível
        alert(`${skillName}: ${roll} + ${bonus} = ${total}`);
    }
};

function showSkillResult(html) {
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

// Utilitário de dados (caso não esteja no combat_system.js)
function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof renderSkills === 'function') renderSkills();
    }, 700);
});
