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
    const charData = JSON.parse(localStorage.getItem('demonSlayerChar'));
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
        // Clear grid first if necessary (though it should be empty on load)
        skillsGrid.innerHTML = '';
        // Change grid style to block or flex col if strictly needed via JS, but CSS handles it
        skillsGrid.style.display = 'flex';
        skillsGrid.style.flexDirection = 'column';

        SKILLS_DATA.forEach(skill => {
            const attrs = charData.attributes || {};
            const attrVal = attrs[skill.attr] || 10;
            const mod = Math.floor((attrVal - 10) / 2);
            const modStr = mod >= 0 ? `+${mod}` : `${mod}`;

            // Determine Color Class
            const attrColorClass = `attr-${skill.attr}`;
            // Determine Bonus Color (Green for positive, Red for negative/zero?) or same as attr
            // Standardizing to attr color for bonus as well for visual cohesion
            const colorStyle = `var(--accent-${skill.attr === 'str' ? 'red' : 'cyan'})`; // Simple fallback for now, using CSS classes is better

            const div = document.createElement('div');
            div.className = 'skill-row';
            // div.onclick = ... removed, putting it on button

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

    renderInventory();
    if (window.lucide) lucide.createIcons();
});

// --- INVENTORY ---
function renderInventory() {
    const charData = JSON.parse(localStorage.getItem('demonSlayerChar') || '{}');
    const inventory = charData.inventory || ["Nenhum item"];
    const body = document.getElementById('inventoryListBody');
    if (!body) return;

    body.innerHTML = '';

    if (inventory.length === 0 || (inventory.length === 1 && inventory[0] === 'Nenhum item')) {
        body.innerHTML = '<div style="color:#666; font-style:italic;">Seu inventário está vazio...</div>';
        return;
    }

    inventory.forEach((item, index) => {
        // Determine Custom Image
        let imgTag = '';
        const lower = item.toLowerCase();

        // These images should be generated
        if (lower.includes('carne') || lower.includes('humano')) {
            imgTag = `<img src="assets/oni_meat.png" style="width:40px; height:40px; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"> <i data-lucide="bone" size="24" style="display:none"></i>`;
        } else if (lower.includes('sangue') || lower.includes('poção')) {
            imgTag = `<img src="assets/oni_blood.png" style="width:40px; height:40px; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"> <i data-lucide="droplet" size="24" style="display:none"></i>`;
        } else if (lower.includes('espada') || lower.includes('lâmina') || lower.includes('nichirin')) {
            imgTag = `<img src="assets/oni_sword.png" style="width:40px; height:40px; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"> <i data-lucide="sword" size="24" style="display:none"></i>`;
        } else if (lower.includes('armadura') || lower.includes('traje')) {
            imgTag = `<img src="assets/oni_shield.png" style="width:40px; height:40px; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"> <i data-lucide="shield" size="24" style="display:none"></i>`;
        } else {
            // Fallback
            imgTag = `<i data-lucide="box" size="24" color="#bb0a1e"></i>`;
        }

        body.innerHTML += `
            <div class="oni-item-card">
                <div class="item-icon-wrapper">
                    ${imgTag}
                </div>
                <div class="oni-item-name">${item}</div>
                <div class="oni-item-type">Item Oni</div>
                <button class="devour-btn" onclick="consumeItem(${index})">
                    <div class="teeth-top"></div><div class="teeth-bottom"></div>
                    <span>DEVORAR</span>
                </button>
            </div>
        `;
    });

    if (window.lucide) lucide.createIcons();
}

function addItem(name) {
    if (!name) return;
    const charData = JSON.parse(localStorage.getItem('demonSlayerChar') || '{}');
    if (!charData.inventory) charData.inventory = [];

    // Remove 'Nenhum item' if present
    if (charData.inventory.length === 1 && charData.inventory[0] === 'Nenhum item') {
        charData.inventory = [];
    }

    charData.inventory.push(name);
    localStorage.setItem('demonSlayerChar', JSON.stringify(charData));
    renderInventory();
}

function consumeItem(index) {
    const charData = JSON.parse(localStorage.getItem('demonSlayerChar') || '{}');
    const item = charData.inventory[index];
    if (confirm(`Devorar ${item}?`)) {
        charData.inventory.splice(index, 1);
        if (charData.inventory.length === 0) charData.inventory.push('Nenhum item');
        localStorage.setItem('demonSlayerChar', JSON.stringify(charData));
        renderInventory();

        // Heal Logic
        startDiceRoll(5, () => {
            modHP(5);
            showRollResult('Consumo', 5, 5, 0, false, false);
        }, 10, 'blood');
    }
}

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
