/* ONI DASHBOARD JS - Refactored based on Hunter Dashboard */

let charData = {};
let combatState = { block: false, dodge: false };

// SKILL MAP (D&D 5e style)
const SKILL_MAP = {
    str: ['Atletismo'],
    dex: ['Acrobacia', 'Furtividade', 'Prestidigitação'],
    con: [],
    int: ['Arcanismo', 'História', 'Investigação', 'Natureza', 'Religião'],
    wis: ['Adestrar Animais', 'Intuição', 'Medicina', 'Percepção', 'Sobrevivência'],
    cha: ['Enganação', 'Intimidação', 'Atuação', 'Persuasão']
};

// --- DATA MANAGEMENT ---
function saveChar() {
    localStorage.setItem('demonSlayerChar', JSON.stringify(charData));
}

function loadChar() {
    const raw = localStorage.getItem('demonSlayerChar');
    if (raw) {
        charData = JSON.parse(raw);
        if (!charData.stats) charData.stats = charData.attributes || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        if (!charData.level) charData.level = 1;

        // Enforce PE = Level Rule
        charData.maxPE = charData.level;

        if (!charData.hp) charData.hp = 20;
    } else {
        charData = {
            name: "Oni",
            level: 1,
            stats: { str: 14, dex: 12, con: 14, int: 10, wis: 10, cha: 8 },
            hp: 20,
            maxPE: 1, // Start at 1 for Level 1
            attacks: [],
            inventory: []
        };
    }
    window.charData = charData; // Global for inventory modules
}

function initDashboard() {
    try {
        loadChar();

        // UI Elements
        if (document.getElementById('dispName')) document.getElementById('dispName').innerText = charData.name || "Oni";

        // Display Race | Power (Kekkijutsu)
        if (document.getElementById('dispRank')) {
            const KEKK_MAP = {
                'ice': 'Criocinese',
                'swamp': 'Pântano',
                'arrow': 'Vetores',
                'sound': 'Ondas Sonoras',
                'shadow': 'Sombras',
                'blood_manip': 'Manipulação de Sangue'
            };
            const powerName = KEKK_MAP[charData.kekkijutsu] || charData.kekkijutsu || 'Sem Kekkijutsu';
            const raceName = charData.race || "Oni";

            // Console log for debugging (Viewable in DevTools usually, but helpful if user checks console)
            console.log("Oni Init:", raceName, powerName, charData.kekkijutsu);

            document.getElementById('dispRank').innerText = `${raceName} | ${powerName}`;
        }

        if (document.getElementById('dispLevel')) document.getElementById('dispLevel').innerText = charData.level;

        updateVitalsUI();
        renderAttributes();
        renderProficiencies();
        renderAttacks();

        // Inventory
        if (typeof renderInventory === 'function') renderInventory();

        if (window.lucide) lucide.createIcons();

        // update Path UI
        if (document.getElementById('oniPathSelect')) document.getElementById('oniPathSelect').value = charData.oniPath || "";
        // update Instinct UI
        if (document.getElementById('dispInstinctDC')) document.getElementById('dispInstinctDC').innerText = charData.instinctDC || 12;
        // update Devoured UI
        if (document.getElementById('dispDevoured')) document.getElementById('dispDevoured').innerText = charData.devouredCount || 0;

        // update Particularities UI
        renderParticularities();

    } catch (e) {
        alert("Erro no Dashboard: " + e.message);
        console.error(e);
    }
}

// --- CONSTANTS ---
const PARTICULARITIES_DB = [
    { id: 'size', name: 'Alteração Corporal', desc: 'Mudar tamanho (15cm a 5m).' },
    { id: 'animal', name: 'Aparência Animalesca', desc: 'Características animais (teias, escalar, etc).' },
    { id: 'disturb', name: 'Aparência Perturbadora', desc: 'Vantagem em Intimidação.' },
    { id: 'camo', name: 'Camuflagem Adaptativa', desc: '+2 em Furtividade.' },
    { id: 'limbs', name: 'Extensão de Membros', desc: '+1.5m de alcance.' },
    { id: 'charm', name: 'Forma Cativante', desc: 'Vantagem em Persuasão.' },
    { id: 'claws', name: 'Garra Laminada', desc: 'Ataques desarmados causam dano cortante.' },
    { id: 'mimic', name: 'Mimetismo', desc: 'Imitar vozes (Intuição CD 15).' },
    { id: 'multi', name: 'Múltiplos Membros', desc: 'Desarmado causa 1d10.' },
    { id: 'steel', name: 'Pele de Aço', desc: '-2 dano concussão/cortante.' },
    { id: 'human', name: 'Transformação em Humano', desc: 'Indistinguível de humanos.' },
    { id: 'water', name: 'Respiração Aquática', desc: 'Respirar na água.' },
    { id: 'darkvision', name: 'Visão Noturna', desc: 'Enxergar no escuro.' }
];

// --- VITALS & COMBAT ALGORITHMS ---

function calculateAC() {
    // Base 10 + Dex Mod + Natural Armor (Oni usually have natural armor)
    const dexMod = Math.floor((charData.stats.dex - 10) / 2);
    const conMod = Math.floor((charData.stats.con - 10) / 2); // Oni Unarmored Defense (Con)?
    let ac = 10 + dexMod + (conMod > 0 ? conMod : 0); // Let's give them Unarmored Defense by default

    if (combatState.block) ac += 2;
    if (combatState.dodge) ac += 5; // Standard 5e Dodge is Disadvantage, but this matches Hunter Dashboard simplistic buff

    return ac;
}

function updateVitalsUI() {
    // 1. Defenses
    const ac = calculateAC();
    if (document.getElementById('dispAC')) document.getElementById('dispAC').innerText = ac;

    // Speed (Base 9m + bonuses)
    let speed = charData.speed || "9m";
    if (document.getElementById('dispSpeed')) document.getElementById('dispSpeed').innerText = speed;

    // 2. HP
    const currHP = charData.currentHP !== undefined ? charData.currentHP : charData.hp;
    const maxHP = charData.hp;

    if (document.getElementById('currHP')) document.getElementById('currHP').innerText = currHP;
    if (document.getElementById('maxHP')) document.getElementById('maxHP').innerText = maxHP;

    const hpPct = Math.min(100, Math.max(0, (currHP / maxHP) * 100));
    const hpBar = document.querySelector('.vital-bar-fill.hp');
    if (hpBar) hpBar.style.width = hpPct + '%';

    // 3. PE (Blood Points) - ENFORCED BY LEVEL
    const maxPE = charData.level; // Always level
    charData.maxPE = maxPE; // Ensure data is consistent

    const currPE = charData.currentPE !== undefined ? charData.currentPE : maxPE;

    if (document.getElementById('currPE')) document.getElementById('currPE').innerText = currPE;
    if (document.getElementById('maxPE')) document.getElementById('maxPE').innerText = maxPE;

    const pePct = Math.min(100, Math.max(0, (currPE / maxPE) * 100));
    const peBar = document.querySelector('.vital-bar-fill.pe');
    if (peBar) peBar.style.width = pePct + '%';
}

function changeHP(mode) {
    const input = document.getElementById('hpModInput');
    const val = parseInt(input.value) || 1;
    let curr = charData.currentHP !== undefined ? charData.currentHP : charData.hp;

    if (mode === 'add') curr += val;
    else curr -= val;

    // Cap logic
    if (curr > charData.hp) curr = charData.hp;
    if (curr < 0) curr = 0;

    charData.currentHP = curr;
    saveChar();
    updateVitalsUI();
}

function changePE(mode) {
    const input = document.getElementById('peModInput');
    const val = parseInt(input.value) || 1;
    let curr = charData.currentPE !== undefined ? charData.currentPE : charData.maxPE;

    if (mode === 'add') curr += val;
    else curr -= val;

    if (curr > charData.maxPE) curr = charData.maxPE;
    if (curr < 0) curr = 0;

    charData.currentPE = curr;
    saveChar();
    updateVitalsUI();
}

function editVital(type) {
    if (type === 'pe') {
        showToast("Os Pontos de Sangue são definidos pelo Nível.", 'info');
        return;
    }
    const newVal = prompt(`Novo valor máximo para ${type.toUpperCase()}:`, type === 'hp' ? charData.hp : charData.maxPE);
    if (newVal && !isNaN(newVal)) {
        if (type === 'hp') charData.hp = parseInt(newVal);
        // PE edit removed
        saveChar();
        updateVitalsUI();
    }
}

function autoRegen() {
    // Oni Regen Logic: roll 1d10 (or whatever saved) and add to HP
    const regenAmount = Math.floor(Math.random() * 10) + 1;
    document.getElementById('hpModInput').value = regenAmount;
    changeHP('add');
    if (window.showToast) window.showToast(`Regeneração: +${regenAmount} HP`, 'success');
}

// --- COMBAT ACTIONS ---

function combatAction(action) {
    const btn = document.getElementById(action === 'block' ? 'btnBlock' : 'btnDodge');

    // Toggle state
    combatState[action] = !combatState[action];

    // Visual feedback
    if (combatState[action]) {
        btn.style.boxShadow = `0 0 10px ${action === 'block' ? '#a8dadc' : '#20bf6b'}`;
        btn.style.borderColor = action === 'block' ? '#a8dadc' : '#20bf6b';
    } else {
        btn.style.boxShadow = 'none';
        btn.style.borderColor = 'transparent';
    }

    updateVitalsUI();
}

function editSpeed() {
    const newSpeed = prompt("Novo Deslocamento (ex: 9m, 12m):", charData.speed || "9m");
    if (newSpeed) {
        charData.speed = newSpeed;
        saveChar();
        updateVitalsUI();
    }
}

// --- ATTRIBUTES & PROFICIENCIES ---

function renderAttributes() {
    const container = document.getElementById('attrGrid');
    if (!container) return;
    container.innerHTML = '';

    const LABELS = { str: 'Força', dex: 'Destreza', con: 'Constituição', int: 'Inteligência', wis: 'Sabedoria', cha: 'Carisma' };

    for (const [key, val] of Object.entries(charData.stats)) {
        const mod = Math.floor((val - 10) / 2);
        const modStr = mod >= 0 ? `+${mod}` : `${mod}`;

        container.innerHTML += `
            <div class="attr-card" style="border-top: 3px solid #d90429;">
                <div class="attr-header">
                    <span class="attr-name">${LABELS[key].toUpperCase()}</span>
                    <span class="attr-mod">${modStr}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="attr-val">Valor: ${val}</span>
                    <button style="background:none; border:1px solid #333; color:#666; border-radius:4px; font-size:0.7rem; cursor:pointer;"
                        onclick="rollAttribute('${key}', ${mod})">Rolar</button>
                </div>
                
                <!-- Skills related to this attr -->
                <div class="attr-skills" style="margin-top:10px;">
                    ${getSkillsForAttr(key, mod)}
                </div>
            </div>
        `;
    }
}

function getSkillsForAttr(attr, mod) {
    if (!SKILL_MAP[attr] || SKILL_MAP[attr].length === 0) return '';
    return SKILL_MAP[attr].map(skill => {
        const isProf = (charData.proficiencies || []).includes(skill);
        const total = mod + (isProf ? 2 : 0); // PB fixed at 2 for now or calc based on level
        const totalStr = total >= 0 ? `+${total}` : `${total}`;
        return `
            <div class="skill-row">
                <div class="skill-name-group">
                    <div class="skill-prof-btn ${isProf ? 'active' : ''}" onclick="toggleProficiency('${skill}')"></div>
                    <span>${skill}</span>
                </div>
                <span class="skill-bonus" style="cursor:pointer;" onclick="rollSkill('${skill}', ${total})">${totalStr}</span>
            </div>
        `;
    }).join('');
}

function toggleProficiency(skillName) {
    if (!charData.proficiencies) charData.proficiencies = [];

    if (charData.proficiencies.includes(skillName)) {
        charData.proficiencies = charData.proficiencies.filter(s => s !== skillName);
    } else {
        charData.proficiencies.push(skillName);
    }
    saveChar();
    renderAttributes();
    renderProficiencies(); // Updates the summary list
}

function renderProficiencies() {
    const list = document.getElementById('profList');
    if (!list) return;
    list.innerHTML = '';

    const profs = charData.proficiencies || [];
    if (profs.length === 0) {
        list.innerHTML = '<span style="font-style:italic; opacity:0.5;">Nenhuma proficiência treinada.</span>';
        return;
    }

    profs.forEach(p => {
        list.innerHTML += `<span style="background:rgba(217, 4, 41, 0.2); padding:2px 6px; border-radius:4px; border:1px solid #d90429; font-size:0.75rem; color:#fff;">${p}</span>`;
    });
}

// --- LEVELING ---

function toggleLevelSelector() {
    const sel = document.getElementById('levelSelector');
    if (!sel) return;

    if (sel.style.display === 'block') {
        sel.style.display = 'none';
    } else {
        sel.style.display = 'block';
        sel.innerHTML = '';
        for (let i = 1; i <= 20; i++) {
            const btn = document.createElement('div');
            btn.innerText = i;
            btn.style.padding = '8px 12px';
            btn.style.cursor = 'pointer';
            btn.style.color = i === charData.level ? '#d90429' : '#888';
            btn.style.fontWeight = i === charData.level ? 'bold' : 'normal';
            btn.onmouseover = () => btn.style.background = '#222';
            btn.onmouseout = () => btn.style.background = 'transparent';
            btn.onclick = () => updateLevel(i);
            sel.appendChild(btn);
        }
    }
}

function updateLevel(lvl) {
    charData.level = lvl;
    charData.maxPE = lvl; // SYNC PE with Level

    // Auto-rank logic example
    if (lvl >= 10 && !charData.rank) charData.rank = "Lua Inferior";

    saveChar();
    initDashboard(); // Refresh all
}

function updateCharName(newName) {
    charData.name = newName;
    saveChar();
}

// --- ONI MECHANICS (Regen, Instincts) ---

function getRegenDice(level) {
    if (level <= 5) return 1;
    if (level <= 10) return 2;
    if (level <= 15) return 3;
    return 4;
}

function autoRegen() {
    // Scaling Regen: 1d10 to 4d10 based on level
    const diceCount = getRegenDice(charData.level || 1);
    let totalRegen = 0;
    let rolls = [];

    for (let i = 0; i < diceCount; i++) {
        const r = Math.floor(Math.random() * 10) + 1;
        rolls.push(r);
        totalRegen += r;
    }

    // Update HP UI Input for user confirmation/adjustment if they want
    document.getElementById('hpModInput').value = totalRegen;

    // Apply immediately
    changeHP('add');

    const msg = `Regeneração (${diceCount}d10): [${rolls.join('+')}] = +${totalRegen} HP`;
    if (window.showToast) window.showToast(msg, 'success');
}

// --- INSTINCTS & PATHS ---
function setOniPath(path) {
    charData.oniPath = path; // 'blood' or 'flesh'
    // Set initial DC based on path if not set
    if (!charData.instinctDC) {
        // Roll d10
        const d10 = Math.floor(Math.random() * 10) + 1;
        if (path === 'blood') charData.instinctDC = d10 + 8;
        if (path === 'flesh') charData.instinctDC = d10 + 12;
    }
    saveChar();
    initDashboard();
}

function updateInstinctDC(val) {
    charData.instinctDC = parseInt(val);
    saveChar();
}


// --- DICE & UTILS ---

function rollAttribute(attr, mod) {
    // Simple alert or modal
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + mod;
    showToast(`Rolagem de ${attr}: [${roll}] + ${mod} = ${total}`, roll === 20 ? 'success' : 'info');
}

function rollSkill(skill, mod) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + mod;
    showToast(`${skill}: [${roll}] + ${mod} = ${total}`, roll === 20 ? 'success' : 'info');
}

function showToast(msg, type = 'info') {
    // Simple visual toast
    const el = document.createElement('div');
    el.innerText = msg;
    el.style.position = 'fixed';
    el.style.bottom = '20px';
    el.style.right = '20px';
    el.style.padding = '15px 25px';
    el.style.background = type === 'success' ? '#d90429' : '#222';
    el.style.color = 'white';
    el.style.borderRadius = '8px';
    el.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
    el.style.zIndex = '9999';
    el.style.animation = 'fadeIn 0.3s';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// --- ATTACKS ---
function openAttackModal() { document.getElementById('attackModal').style.display = 'block'; }
function saveNewAttack() {
    const name = document.getElementById('atkName').value;
    const dmg = document.getElementById('atkDmg').value;
    const type = document.getElementById('atkType').value;

    if (name && dmg) {
        if (!charData.attacks) charData.attacks = [];
        charData.attacks.push({ id: Date.now(), name, damage: dmg, type });
        saveChar();
        renderAttacks();
        document.getElementById('attackModal').style.display = 'none';
    }
}

function renderAttacks() {
    const list = document.getElementById('attacksList');
    if (!list) return;
    list.innerHTML = '';

    const attacks = charData.attacks || [];

    if (attacks.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding:3rem; color:#666; width:100%;">
                <i data-lucide="swords" size="48" style="opacity:0.3; margin-bottom:1rem;"></i>
                <p>Nenhum ataque registrado.</p>
                <button class="devour-btn" style="width:auto; margin:1rem auto;" onclick="openAttackModal()">Criar Ataque</button>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    let html = '<div class="attack-grid">';

    attacks.forEach((atk, index) => {
        // Dynamic Icon Logic
        let icon = 'crosshair';
        const lowerName = (atk.name || '').toLowerCase();
        if (lowerName.includes('corte') || lowerName.includes('lâmina') || lowerName.includes('espada')) icon = 'sword';
        else if (lowerName.includes('soco') || lowerName.includes('punho') || lowerName.includes('impacto')) icon = 'hand-metal';
        else if (lowerName.includes('fogo') || lowerName.includes('chama')) icon = 'flame';
        else if (lowerName.includes('gelo') || lowerName.includes('frio')) icon = 'snowflake';
        else if (lowerName.includes('sangue')) icon = 'droplet';
        else if (lowerName.includes('garra')) icon = 'scissors'; // pseudo-claw

        html += `
            <div class="attack-card-3d" style="--i:${index}">
                <i data-lucide="${icon}" class="attack-bg-icon"></i>
                
                <h3 class="card-title">${atk.name}</h3>
                <div class="card-meta">${atk.damage}</div>
                <div class="card-desc">${atk.type}</div>

                <div class="card-actions">
                    <button class="atk-btn-3d atk-btn-roll" onclick="showToast('Rolando ${atk.name}...', 'success')">
                        <i data-lucide="dices"></i> ROLAR
                    </button>
                    <button class="atk-btn-3d atk-btn-del" onclick="deleteAttack(${atk.id})" title="Excluir">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    list.innerHTML = html;

    if (window.lucide) lucide.createIcons();
}

function deleteAttack(id) {
    charData.attacks = charData.attacks.filter(a => a.id !== id);
    saveChar();
    renderAttacks();
}

// --- SECTION NAV ---
function showSection(id) {
    document.querySelectorAll('.dashboard-section').forEach(el => el.classList.remove('active-tab'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active-tab');

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.getElementById('nav-' + id);
    if (navItem) navItem.classList.add('active');
}

// --- INSTINCTS & PATHS ---
function changeInstinct(amt) {
    if (!charData.instinctDC) charData.instinctDC = 12;
    charData.instinctDC += amt;
    if (charData.instinctDC < 0) charData.instinctDC = 0;
    saveChar();
    if (document.getElementById('dispInstinctDC')) document.getElementById('dispInstinctDC').innerText = charData.instinctDC;
}

function changeDevoured(amt) {
    if (!charData.devouredCount) charData.devouredCount = 0;
    charData.devouredCount += amt;
    if (charData.devouredCount < 0) charData.devouredCount = 0;
    saveChar();
    if (document.getElementById('dispDevoured')) document.getElementById('dispDevoured').innerText = charData.devouredCount;
}

// --- PARTICULARITIES ---
function renderParticularities() {
    const list = document.getElementById('particularitiesList');
    if (!list) return;

    if (!charData.particularities || charData.particularities.length === 0) {
        list.innerHTML = '<em style="color:#666;">Nenhuma selecionada.</em>';
        return;
    }

    list.innerHTML = charData.particularities.map(id => {
        const feat = PARTICULARITIES_DB.find(f => f.id === id);
        return feat ? `<div style="margin-bottom:2px;">• <span style="color:#ddd;">${feat.name}</span></div>` : '';
    }).join('');
}

function openParticularityModal() {
    // Create modal dynamically if not exists
    if (!document.getElementById('partModal')) {
        const modal = document.createElement('div');
        modal.id = 'partModal';
        modal.className = 'modal';
        modal.style.cssText = "display:none; position:fixed; z-index:3000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.8);";

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.cssText = "background:#111; margin:10% auto; padding:20px; border:1px solid #d90429; width:80%; max-width:500px; border-radius:12px;";

        content.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="color:#d90429; margin:0;">Particularidades (Máx 2)</h3>
                <span style="color:#666; cursor:pointer; font-size:1.5rem;" onclick="document.getElementById('partModal').style.display='none'">&times;</span>
            </div>
            <div id="partCheckList" style="max-height:400px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;"></div>
        `;
        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    const list = document.getElementById('partCheckList');
    list.innerHTML = '';

    PARTICULARITIES_DB.forEach(feat => {
        const isSelected = (charData.particularities || []).includes(feat.id);
        const item = document.createElement('div');
        item.style.cssText = `padding:10px; background:${isSelected ? 'rgba(217,4,41,0.2)' : '#222'}; border:1px solid ${isSelected ? '#d90429' : '#333'}; border-radius:6px; cursor:pointer;`;
        item.innerHTML = `
            <div style="font-weight:bold; color:${isSelected ? '#fff' : '#aaa'};">${feat.name}</div>
            <div style="font-size:0.8rem; color:#666;">${feat.desc}</div>
        `;
        item.onclick = () => toggleParticularity(feat.id);
        list.appendChild(item);
    });

    document.getElementById('partModal').style.display = 'block';
}

function toggleParticularity(id) {
    if (!charData.particularities) charData.particularities = [];

    if (charData.particularities.includes(id)) {
        charData.particularities = charData.particularities.filter(pd => pd !== id);
    } else {
        if (charData.particularities.length >= 2) {
            alert("Você só pode escolher 2 particularidades.");
            return;
        }
        charData.particularities.push(id);
    }
    saveChar();
    renderParticularities();
    openParticularityModal(); // Re-render list to show selection
}

// Init
window.addEventListener('DOMContentLoaded', initDashboard);
