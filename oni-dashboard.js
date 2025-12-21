// --- NAVIGATION ---
function showSection(id) {
    document.querySelectorAll('.dashboard-section').forEach(el => el.classList.remove('active-tab'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active-tab');

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.getElementById('nav-' + id);
    if (navItem) navItem.classList.add('active');
}

// --- SKILLS & DATA ---
const SKILLS_DATA = [
    { name: 'Acrobacia', attr: 'dex' }, { name: 'Arcanismo', attr: 'int' },
    { name: 'Atletismo', attr: 'str' }, { name: 'Atuação', attr: 'cha' },
    { name: 'Enganação', attr: 'cha' }, { name: 'Furtividade', attr: 'dex' },
    { name: 'História', attr: 'int' }, { name: 'Intimidação', attr: 'cha' },
    { name: 'Intuição', attr: 'wis' }, { name: 'Investigação', attr: 'int' },
    { name: 'Lidar com Animais', attr: 'wis' }, { name: 'Medicina', attr: 'wis' },
    { name: 'Natureza', attr: 'int' }, { name: 'Percepção', attr: 'wis' },
    { name: 'Persuasão', attr: 'cha' }, { name: 'Prestidigitação', attr: 'dex' },
    { name: 'Religião', attr: 'int' }, { name: 'Sobrevivência', attr: 'wis' }
];

// --- LOAD ---
window.addEventListener('DOMContentLoaded', () => {
    // Make charData global for inventory_modules.js
    window.charData = JSON.parse(localStorage.getItem('demonSlayerChar'));
    const charData = window.charData; // Local ref for this scope

    if (!charData) { window.location.href = 'create-oni.html'; return; }

    // Fill Info
    const dispName = document.getElementById('dispName');
    if (dispName) dispName.textContent = charData.name;

    const dispRank = document.getElementById('dispRank');
    if (dispRank) dispRank.textContent = charData.rank || 'Oni Inferior';

    const dispLevel = document.getElementById('dispLevel');
    if (dispLevel) dispLevel.textContent = charData.level || 1;

    // Vitals
    const hpInput = document.getElementById('hpMaxInput');
    if (hpInput) hpInput.value = charData.hp || 20;
    updateHPVisuals(charData.currentHP || charData.hp, charData.hp);

    const peInput = document.getElementById('peMaxInput');
    if (peInput) peInput.value = charData.maxPE || 5;
    updatePEVisuals(charData.currentPE || charData.maxPE, charData.maxPE);

    if (charData.regen && document.getElementById('regenVal')) {
        document.getElementById('regenVal').textContent = charData.regen;
    }

    // Attributes
    const attrGrid = document.getElementById('attrGrid');
    if (attrGrid) {
        const attrs = charData.attributes || {};
        const attrMap = { str: 'Força', dex: 'Agilidade', con: 'Vigor', int: 'Inteligência', wis: 'Percepção', cha: 'Carisma' };

        for (const [key, label] of Object.entries(attrMap)) {
            const val = attrs[key] || 10;
            const mod = Math.floor((val - 10) / 2);
            const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
            const div = document.createElement('div');
            div.className = 'attr-box';
            div.onclick = () => rollAttribute(key, label, mod);
            div.innerHTML = `<div class="attr-label">${label}</div><div class="attr-value">${val}</div><div style="font-size:0.8rem; color:#888;">${modStr}</div>`;
            attrGrid.appendChild(div);
        }
    }

    // Skills
    const skillsGrid = document.getElementById('skillsGrid');
    if (skillsGrid) {
        skillsGrid.innerHTML = '';
        skillsGrid.style.display = 'flex';
        skillsGrid.style.flexDirection = 'column';

        SKILLS_DATA.forEach(skill => {
            const attrs = charData.attributes || {};
            const attrVal = attrs[skill.attr] || 10;
            const mod = Math.floor((attrVal - 10) / 2);
            const modStr = mod >= 0 ? `+${mod}` : `${mod}`;

            const attrColorClass = `attr-${skill.attr}`;

            const div = document.createElement('div');
            div.className = 'skill-row';

            div.innerHTML = `
                <div class="skill-left">
                    <i data-lucide="circle" class="skill-toggle" size="18"></i>
                    <div class="skill-info">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-attr ${attrColorClass}">${skill.attr.toUpperCase()}</span>
                    </div>
                </div>
                <div class="skill-right">
                    <span class="skill-bonus ${attrColorClass}">${modStr}</span>
                    <button class="skill-roll-btn" onclick="rollSkill('${skill.name}', ${mod})">
                        <i data-lucide="dices" size="16"></i>
                    </button>
                </div>
            `;
            skillsGrid.appendChild(div);
        });
    }

    // Caminho
    const pathDisplay = document.getElementById('pathDisplay');
    if (pathDisplay) {
        if (charData.oniPath === 'blood') {
            pathDisplay.innerHTML = `<i data-lucide="droplet" style="color:#d90429"></i> <div><h3>Caminho de Sangue</h3><p style="font-size:0.8rem; color:#888;">Foco em regeneração e poder bruto.</p></div>`;
        } else {
            pathDisplay.innerHTML = `<i data-lucide="skull" style="color:#fff"></i> <div><h3>Caminho da Carne</h3><p style="font-size:0.8rem; color:#888;">Foco em resistência e sanidade.</p></div>`;
        }
    }

    // Particularidades
    const partGrid = document.getElementById('partGrid');
    if (partGrid && charData.particularities) {
        charData.particularities.forEach(p => {
            partGrid.innerHTML += `<div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:4px;"><strong style="color:var(--accent-red)">${p.name}</strong><p style="margin:5px 0 0 0; font-size:0.8rem; color:#aaa;">${p.effect}</p></div>`
        });
    }

    // Initialize Inventory (from inventory_modules.js)
    if (typeof renderInventory === 'function') {
        renderInventory();
    } else {
        console.warn("renderInventory from inventory_modules.js not found!");
    }

    if (window.lucide) lucide.createIcons();
});

// --- INVENTORY ---
// The old inventory logic (addItem, renderInventory, consumeItem) was removed to allow usage of inventory_modules.js
// which provides a more robust system shared between Onis and Humans.

// If you need specific Oni 'consume' logic, re-implement it using the item objects or as a separate action.

// --- CORE FUNCTIONS (Dice, HP, Level) ---
function updateHPVisuals(cur, max) {
    const txt = document.getElementById('hpText');
    if (txt) txt.textContent = `${cur} / ${max}`;
    const fill = document.getElementById('hpBarFill');
    if (fill) fill.style.width = `${Math.min(100, Math.max(0, (cur / max) * 100))}%`;
}

function modHP(amt) {
    const charData = JSON.parse(localStorage.getItem('demonSlayerChar'));
    let cur = charData.currentHP !== undefined ? charData.currentHP : charData.hp;
    let max = charData.hp;
    cur = Math.min(max, Math.max(0, cur + amt));
    charData.currentHP = cur;
    localStorage.setItem('demonSlayerChar', JSON.stringify(charData));
    updateHPVisuals(cur, max);
}

function updateMaxHP() {
    const input = document.getElementById('hpMaxInput');
    if (!input) return;
    const val = parseInt(input.value);
    const charData = JSON.parse(localStorage.getItem('demonSlayerChar'));
    charData.hp = val;
    localStorage.setItem('demonSlayerChar', JSON.stringify(charData));
    updateHPVisuals(charData.currentHP !== undefined ? charData.currentHP : val, val);
}

function autoRegen() {
    const regenEl = document.getElementById('regenVal');
    if (!regenEl) return;
    const range = regenEl.textContent.trim(); // 1d10
    const sides = parseInt(range.split('d')[1]) || 10;
    const roll = Math.floor(Math.random() * sides) + 1;
    startDiceRoll(roll, () => {
        modHP(roll);
        showRollResult('Regeneração', roll, roll, 0, false, false);
    }, sides, 'blood');
}

function updatePEVisuals(cur, max) {
    const txt = document.getElementById('peText');
    if (txt) txt.textContent = `${cur} / ${max}`;
    const fill = document.getElementById('peBarFill');
    if (fill) fill.style.width = `${Math.min(100, Math.max(0, (cur / max) * 100))}%`;
}

function modPE(amt) {
    const charData = JSON.parse(localStorage.getItem('demonSlayerChar'));
    let cur = charData.currentPE !== undefined ? charData.currentPE : charData.maxPE;
    let max = charData.maxPE;
    cur = Math.min(max, Math.max(0, cur + amt));
    charData.currentPE = cur;
    localStorage.setItem('demonSlayerChar', JSON.stringify(charData));
    updatePEVisuals(cur, max);
}

function updateMaxPE() {
    const input = document.getElementById('peMaxInput');
    if (!input) return;
    const val = parseInt(input.value);
    const charData = JSON.parse(localStorage.getItem('demonSlayerChar'));
    charData.maxPE = val;
    localStorage.setItem('demonSlayerChar', JSON.stringify(charData));
    updatePEVisuals(charData.currentPE !== undefined ? charData.currentPE : val, val);
}

function levelUp() {
    const charData = JSON.parse(localStorage.getItem('demonSlayerChar'));
    charData.level = (charData.level || 1) + 1;
    localStorage.setItem('demonSlayerChar', JSON.stringify(charData));
    const disp = document.getElementById('dispLevel');
    if (disp) disp.textContent = charData.level;
    alert('Nível Aumentado!');
}

// Dice Utils
function rollDie(sides) { return Math.floor(Math.random() * sides) + 1; }

function startDiceRoll(result, cb, sides = 20, theme = '') {
    const modal = document.getElementById('diceModal');
    const cube = document.getElementById('diceCube');
    const txt = document.getElementById('rollOverlayText');
    if (modal) modal.style.display = 'flex';
    if (cube) cube.className = `cube rolling ${theme}`;

    setTimeout(() => {
        if (cube) cube.classList.remove('rolling');
        const front = document.querySelector('.face.front');
        if (front) front.textContent = result;
        if (txt) txt.textContent = result;
        setTimeout(() => {
            if (modal) modal.style.display = 'none';
            if (cb) cb();
        }, 1000);
    }, 800);
}

function showRollResult(title, total, die, mod, crit, fail) {
    const con = document.getElementById('rollLog');
    if (!con) return;
    const toast = document.createElement('div');
    toast.className = 'roll-toast ' + (crit ? 'crit-success' : (fail ? 'crit-fail' : ''));
    toast.innerHTML = `<div class="roll-val">${total}</div><div><div class="roll-title">${title}</div><div class="roll-desc">Roll: ${die} Mod: ${mod}</div></div>`;
    con.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function rollAttribute(key, label, mod) {
    const r = rollDie(20);
    startDiceRoll(r + mod, () => showRollResult(label, r + mod, r, mod, r === 20, r === 1));
}

function rollSkill(label, mod) {
    const r = rollDie(20);
    startDiceRoll(r + mod, () => showRollResult(label, r + mod, r, mod, r === 20, r === 1));
}
