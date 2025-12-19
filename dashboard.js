// --- ERROR HANDLER ---
window.onerror = function (msg, url, line) {
    console.error("Dashboard Error:", msg, "@", line);
    // Silent alert for debugging if needed, but console is better.
};

console.log("Starting Dashboard Script...");

// --- LOAD DATA ---
let charData = null;
try {
    charData = JSON.parse(localStorage.getItem('demonSlayerChar'));
} catch (e) {
    console.error("Corrupted Save Data", e);
}

if (!charData) {
    alert("Nenhum personagem encontrado! Redirecionando...");
    window.location.href = 'create-character.html';
    throw new Error("No Character Data");
}

// --- SAFETY CHECKS & DEFAULTS ---
if (!charData.attributes) charData.attributes = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
if (!charData.proficiencies) charData.proficiencies = [];
if (!charData.inventory) charData.inventory = [];
if (!charData.customAttacks) charData.customAttacks = [];
if (!charData.customAbilities) charData.customAbilities = [];
if (charData.def_other === undefined) charData.def_other = 0;
if (!charData.xp) charData.xp = 0;
charData.level = charData.level || 1;

// --- STATE VARIABLES ---
let currentHP = charData.currentHP !== undefined ? parseInt(charData.currentHP) : 20;
let maxHP = charData.maxHP_override ? parseInt(charData.maxHP_override) : (parseInt(charData.hp) || 20);
let currentPE = charData.currentPE !== undefined ? parseInt(charData.currentPE) : 1;
let maxPE = charData.maxPE_override ? parseInt(charData.maxPE_override) : 1;


// --- DATABASES ---
const XP_TABLE = [
    0, 300, 900, 2700, 6500,
    14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000,
    195000, 225000, 265000, 305000, 355000
];

const RANKS = [
    { name: "Mizunoto (癸)", min: 1 },
    { name: "Mizunoe (壬)", min: 3 },
    { name: "Kanoto (辛)", min: 5 },
    { name: "Kanoe (庚)", min: 7 },
    { name: "Tsuchinoto (己)", min: 9 },
    { name: "Tsuchinoe (戊)", min: 11 },
    { name: "Hinoto (丁)", min: 13 },
    { name: "Hinoe (丙)", min: 15 },
    { name: "Kinoto (乙)", min: 17 },
    { name: "Kinoe (甲)", min: 19 }
];

const RACES_DB = {
    "Humano": {
        baseHP: 12,
        abilities: [
            { name: "Versatilidade", desc: "Aumenta dois valores de habilidade em 2 pontos. Adquire um talento de sua escolha." },
            { name: "Determinação", desc: "Demonstram incrível resiliência e determinação ao enfrentar ameaças sobrenaturais." }
        ]
    },
    "Marechi": {
        baseHP: 10,
        abilities: [
            { name: "Sangue Atraente", desc: "Quando ferido (sangrando), demônios a 100m são compelidos a atacar. Se provarem o sangue, focam apenas em você." },
            { name: "Sangue Atordoante", desc: "Demônios próximos sofrem penalidades em percepção e concentração. Podem ficar atordoados se falharem em teste de CON." },
            { name: "Variação Marechi", desc: "Se rolou 18-20 na criação, seu sangue é ainda mais potente, aumentando a dificuldade dos testes dos demônios em +5." }
        ]
    },
    "Tsuyoi": {
        baseHP: 14,
        abilities: [
            { name: "Força Anormal", desc: "Vantagem em testes de força. Pode enrijecer músculos para reduzir dano (reação), mas fica imobilizado." },
            { name: "Flexibilidade", desc: "Corpo flexível. Proficiência em testes de Destreza. Adiciona metade da proficiência em acrobacia/furtividade." },
            { name: "Kawaii", desc: "+2 em Carisma contra criaturas que te acham adorável. Pode encantar criaturas com uma ação." }
        ]
    }
};

const SKILLS_DB = [
    { name: "Atletismo", attr: "str" },
    { name: "Acrobacia", attr: "dex" },
    { name: "Furtividade", attr: "dex" },
    { name: "Prestidigitação", attr: "dex" },
    { name: "História", attr: "int" },
    { name: "Medicina", attr: "int" },
    { name: "Natureza", attr: "int" },
    { name: "Intuição", attr: "wis" },
    { name: "Investigação", attr: "wis" },
    { name: "Lidar com Animais", attr: "wis" },
    { name: "Percepção", attr: "wis" },
    { name: "Sobrevivência", attr: "wis" },
    { name: "Blefar", attr: "cha" },
    { name: "Intimidação", attr: "cha" },
    { name: "Persuasão", attr: "cha" }
];

const ITEMS_DB = {
    weapons: [
        { name: "Katana (Nichirin)", dmg: "1d6 cortante", price: "100,000", weight: "1.5 kg", props: "Acuidade, Leve, Versátil (1d8)", decap: "Sim", type: "weapon" },
        { name: "Odachi", dmg: "2d4 cortante", price: "150,000", weight: "3 kg", props: "Pesada, duas mãos", decap: "Sim", type: "weapon" },
        { name: "Chakram", dmg: "1d6 cortante", price: "50,000", weight: "1.5 kg", props: "Acuidade, Leve, Arremesso (30/60)", decap: "Sim", type: "weapon" },
        { name: "Adaga", dmg: "1d4 perfurante", price: "20,000", weight: "0.5 kg", props: "Acuidade, leve, arremesso (6/18)", decap: "Sim", type: "weapon" },
        { name: "Azagaia", dmg: "1d6 perfurante", price: "5,000", weight: "1 kg", props: "Arremesso (9/36)", decap: "Sim", type: "weapon" },
        { name: "Foice Curta", dmg: "1d4 cortante", price: "10,000", weight: "1 kg", props: "Leve", decap: "Sim", type: "weapon" },
        { name: "Lança", dmg: "1d6 perfurante", price: "50,000", weight: "1.5 kg", props: "Arremesso (6/18), versátil (1d8)", decap: "Sim", type: "weapon" }
    ],
    armor: [
        { name: "Uniforme Leve", def_bonus: 2, price: "100,000", weight: "4 kg", props: "Agilidade", type: "armor", ac: "11 + DEX" },
        { name: "Uniforme Médio", def_bonus: 4, price: "100,000", weight: "8 kg", props: "Proteção", type: "armor", ac: "15" },
        { name: "Uniforme Pesado", def_bonus: 7, price: "100,000", weight: "10 kg", props: "Furtividade (Desv), Força 12", type: "armor", ac: "17" },
        { name: "Uniforme Hashira", def_bonus: 10, price: "-", weight: "5 kg", props: "Lendário (Hashira)", type: "armor", ac: "22" }
    ]
};


// --- UTILITIES ---
function getMod(score) {
    // Safety for undefined score
    if (score === undefined || score === null) return 0;
    return Math.floor((score - 10) / 2);
}

function saveState() {
    charData.currentHP = currentHP;
    charData.currentPE = currentPE;
    localStorage.setItem('demonSlayerChar', JSON.stringify(charData));

    // Sync with array
    let allChars = [];
    try {
        allChars = JSON.parse(localStorage.getItem('demonSlayerAllChars')) || [];
    } catch (e) { }

    // If active char has ID, find and update. If no ID (legacy), use name match or just index 0?
    // We generated ID in new creation flow. Old chars might be ID-less.
    if (charData.id) {
        const idx = allChars.findIndex(c => c.id === charData.id);
        if (idx >= 0) {
            allChars[idx] = charData;
        } else {
            allChars.push(charData); // Should unlikely happen if we switch properly, but safety
        }
    } else {
        // Fallback for legacy character without ID: Try name match or push
        // Let's just push it and assign a temp ID to prevent dupes in future? 
        // Or better: update the first one that matches name
        const idx = allChars.findIndex(c => c.name === charData.name);
        if (idx >= 0) allChars[idx] = charData;
        else allChars.push(charData);
    }

    // Enforce consistency: save back array
    localStorage.setItem('demonSlayerAllChars', JSON.stringify(allChars));
}


// --- CORE FUNCTIONS (Attaching to window to ensure global access) ---

window.updateLevel = function () {
    const el = document.getElementById('levelInput');
    if (el) {
        charData.level = parseInt(el.value) || 1;
        updateRankDisplay();

        calculateMaxHP(); // Auto-calc HP

        if (!charData.maxPE_override) maxPE = charData.level;
        if (currentPE > maxPE) currentPE = maxPE;

        updateBars();
        renderSkills();
        loadBreathingData();
        renderBreathingTab();
        renderAbilities();
        saveState();
    }
};

window.updateXP = function () {
    const el = document.getElementById('xpInput');
    if (!el) return;

    let xp = parseInt(el.value) || 0;
    charData.xp = xp;

    // Calc Level
    let newLevel = 1;
    for (let i = 0; i < XP_TABLE.length; i++) {
        if (xp >= XP_TABLE[i]) newLevel = i + 1;
        else break;
    }

    // Update Level if changed
    if (newLevel !== charData.level) {
        charData.level = newLevel;
        if (document.getElementById('levelInput')) document.getElementById('levelInput').value = newLevel;

        calculateMaxHP(); // Auto-calc HP

        if (!charData.maxPE_override) maxPE = charData.level;
        if (currentPE > maxPE) currentPE = maxPE;

        updateBars();
        renderSkills();
        loadBreathingData();
        renderBreathingTab();
        renderAbilities();
    }

    updateRankDisplay();
    saveState();
};

function updateRankDisplay() {
    let rankName = "Mizunoto (癸)"; // Default
    // Reverse loop to find highest matching rank
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (charData.level >= RANKS[i].min) {
            rankName = RANKS[i].name;
            break;
        }
    }
    if (document.getElementById('dispRank')) document.getElementById('dispRank').innerText = rankName;
}

window.updateMaxStats = function () {
    const hpIn = document.getElementById('hpMaxInput');
    const peIn = document.getElementById('peMaxInput');
    if (hpIn) maxHP = parseInt(hpIn.value) || 20;
    if (peIn) maxPE = parseInt(peIn.value) || 1;

    charData.maxHP_override = maxHP;
    if (maxPE !== charData.level) charData.maxPE_override = maxPE;
    else delete charData.maxPE_override;

    updateBars();
    saveState();
};

window.modHP = function (val) {
    currentHP = Math.max(0, Math.min(maxHP, currentHP + val));
    updateBars();
    saveState();
};

window.modPE = function (val) {
    currentPE = Math.max(0, Math.min(maxPE, currentPE + val));
    updateBars();
    saveState();
};

window.updateBars = function () {
    if (document.getElementById('hpCurrent')) document.getElementById('hpCurrent').innerText = currentHP;
    if (document.getElementById('peCurrent')) document.getElementById('peCurrent').innerText = currentPE;

    const hpFill = document.getElementById('hpFill');
    if (hpFill) hpFill.style.width = (maxHP > 0 ? (currentHP / maxHP) * 100 : 0) + "%";

    const hpPercent = document.getElementById('hpPercent');
    if (hpPercent) hpPercent.innerText = Math.round((currentHP / (maxHP || 1)) * 100) + "%";

    const peFill = document.getElementById('peFill');
    if (peFill) peFill.style.width = (maxPE > 0 ? (currentPE / maxPE) * 100 : 0) + "%";

    const pePercent = document.getElementById('pePercent');
    if (pePercent) pePercent.innerText = Math.round((currentPE / (maxPE || 1)) * 100) + "%";

    if (document.getElementById('hpMaxInput')) document.getElementById('hpMaxInput').value = maxHP;
    if (document.getElementById('peMaxInput')) document.getElementById('peMaxInput').value = maxPE;

    if (typeof updateTheme === 'function') updateTheme();
};

// --- RENDER SKILLS ---
window.renderSkills = function () {
    const list = document.getElementById('skillsListBody');
    if (!list) return;

    list.innerHTML = '';
    const profBonus = 2 + Math.floor((charData.level - 1) / 4);
    const attrMap = { str: 'FOR', dex: 'AGI', con: 'VIG', int: 'INT', wis: 'PRE', cha: 'CAR' };

    SKILLS_DB.forEach(skill => {
        const isProf = charData.proficiencies.includes(skill.name);
        const attrVal = charData.attributes[skill.attr];
        const mod = getMod(attrVal);
        const total = mod + (isProf ? profBonus : 0);

        const row = document.createElement('div');
        row.className = `skill-row ${isProf ? 'proficient' : ''}`;

        // We handle selection on the row, but roll on the button
        row.onclick = (e) => {
            // If we clicked the button, do nothing (handled by button) - implemented via stopPropagation below
            // If we clicked elsewhere, toggle
            toggleSkill(skill.name);
        };

        row.innerHTML = `
            <div style="display:flex; align-items:center;">
                <div class="custom-checkbox ${isProf ? 'checked' : ''}"></div>
                <span class="skill-name" style="color:${isProf ? 'white' : '#888'}">${skill.name}</span>
                <span class="skill-attr" style="margin-left:8px; font-size:0.75rem; color:#555;">${attrMap[skill.attr]}</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <span class="skill-total" style="color:${total >= 0 ? '#fff' : '#aaa'}">${total >= 0 ? '+' + total : total}</span>
                <button class="roll-btn-mini" onclick="event.stopPropagation(); rollCheck('${skill.name}', ${total})" title="Rolar Teste">
                    <svg class="d20-icon" viewBox="0 0 24 24"><path d="M12 2L2 22l10-2l10 2L12 2zM12 20l-6-1.5l6-3.5l6 3.5L12 20zM4 21l8-4l8 4l-8-2l-8 2z"/></svg>
                </button>
            </div>
        `;
        list.appendChild(row);
    });
};

window.toggleSkill = function (name) {
    if (charData.proficiencies.includes(name)) {
        charData.proficiencies = charData.proficiencies.filter(n => n !== name);
    } else {
        charData.proficiencies.push(name);
    }
    saveState();
    renderSkills();
};

// --- RENDER INVENTORY ---
window.toggleDetails = function (id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('expanded');
};

window.renderInventory = function () {
    const list = document.getElementById('inventoryList');
    if (!list) return;

    list.innerHTML = '';
    let totalWeight = 0;

    if (charData.inventory.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:2rem; color:#666;">Inventário vazio.</div>`;
    } else {
        charData.inventory.forEach((item, idx) => {
            if (!item) return;
            const wVal = parseFloat(String(item.weight || "0").replace(/[^\d\.]/g, '')) || 0;
            totalWeight += wVal;

            const isEquipped = !!item.equipped;
            const isEditing = !!item.isEditing;
            const icon = item.type === 'weapon' ? '<i data-lucide="sword" style="width:20px;"></i>' : (item.type === 'armor' ? '<i data-lucide="shield" style="width:20px;"></i>' : '<i data-lucide="box" style="width:20px;"></i>');

            let contentHTML = '';

            if (isEditing) {
                // EDIT MODE
                contentHTML = `
                <div class="inv-header editing-mode" style="flex-direction:column; align-items:flex-start; gap:10px;">
                    <div style="width:100%; display:grid; grid-template-columns: 1fr 1fr; gap:5px;">
                        <input type="text" id="edit-name-${idx}" value="${item.name}" placeholder="Nome" class="ds-input-mini">
                        <input type="text" id="edit-weight-${idx}" value="${item.weight}" placeholder="Peso" class="ds-input-mini">
                    </div>
                    <div style="width:100%; display:grid; grid-template-columns: 1fr 1fr; gap:5px;">
                        <input type="text" id="edit-stat-${idx}" value="${item.dmg || item.ac || ''}" placeholder="Dano/AC" class="ds-input-mini">
                        <input type="text" id="edit-props-${idx}" value="${item.props || ''}" placeholder="Propriedades" class="ds-input-mini">
                    </div>
                    <textarea id="edit-desc-${idx}" placeholder="Descrição" class="ds-input-mini" style="width:100%; height:40px;">${item.desc || ''}</textarea>
                    
                    <div style="display:flex; gap:10px; margin-top:5px; width:100%;">
                        <button class="btn-save-mini" onclick="saveItem(${idx})"><i data-lucide="save" style="width:14px;"></i> Salvar</button>
                        <button class="btn-cancel-mini" onclick="toggleEditItem(${idx})"><i data-lucide="x" style="width:14px;"></i> Cancelar</button>
                    </div>
                </div>`;
            } else {
                // VIEW MODE
                contentHTML = `
                <div class="inv-header" onclick="toggleDetails('inv-det-${idx}')">
                    <div style="display:flex; align-items:center; gap:10px; flex:1;">
                        <span style="font-size:1.4rem;">${icon}</span>
                        <div>
                            <div class="inv-name" style="${isEquipped ? 'color:var(--accent-purple); font-weight:bold;' : ''}">${item.name}</div>
                            <div class="inv-mini-stat">${item.dmg || item.ac || 'Item'} • ${item.weight}</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:5px; align-items:center;">
                        ${item.type !== 'item' ? `<button class="equip-btn-mini" onclick="event.stopPropagation(); toggleEquip(${idx})">${isEquipped ? 'Desequipar' : 'Equipar'}</button>` : ''}
                        <button class="icon-btn-mini" onclick="event.stopPropagation(); toggleEditItem(${idx})" title="Editar"><i data-lucide="pencil" style="width:16px;"></i></button>
                        <button class="remove-btn-mini" onclick="event.stopPropagation(); removeInvItem(${idx})" title="Excluir"><i data-lucide="trash-2" style="width:16px;"></i></button>
                    </div>
                </div>
                <div id="inv-det-${idx}" class="inv-details">
                    <div style="font-style:italic; margin-bottom:5px;">${item.props || ''}</div>
                    <div>${item.desc || ''}</div>
                </div>`;
            }

            list.innerHTML += `
            <div class="inv-item-card" style="${isEquipped && !isEditing ? 'border-color:var(--accent-purple); background:rgba(157,78,221,0.1);' : ''}">
                ${contentHTML}
            </div>`;
        });
    }

    if (document.getElementById('inv-total-items')) document.getElementById('inv-total-items').innerText = charData.inventory.length;

    const maxLoad = (charData.attributes.str || 0) * 15;
    const weightEl = document.getElementById('inv-total-weight');
    if (weightEl) {
        weightEl.innerHTML = `${totalWeight.toFixed(1)} <span style="color:#888; font-size:0.8em;">/ ${maxLoad} kg</span>`;
        if (totalWeight > maxLoad) {
            weightEl.style.color = '#d90429';
            weightEl.innerHTML += ` <span style="font-size:0.8rem; font-weight:bold;">⚠️ PESADO</span>`;
        } else {
            weightEl.style.color = '#e0e0e0';
        }
    }

    calcDefense();
    loadBreathingData();
    if (window.lucide) window.lucide.createIcons();
};

window.toggleEditItem = function (idx) {
    if (charData.inventory[idx]) {
        charData.inventory[idx].isEditing = !charData.inventory[idx].isEditing;
        renderInventory(); // Only re-render, don't save state yet (editing state is temp UI)
    }
}

window.saveItem = function (idx) {
    const item = charData.inventory[idx];
    if (!item) return;

    item.name = document.getElementById(`edit-name-${idx}`).value;
    item.weight = document.getElementById(`edit-weight-${idx}`).value;
    const stat = document.getElementById(`edit-stat-${idx}`).value;
    if (item.type === 'weapon') item.dmg = stat;
    else if (item.type === 'armor') item.ac = stat; // Note: simple string save

    item.props = document.getElementById(`edit-props-${idx}`).value;
    item.desc = document.getElementById(`edit-desc-${idx}`).value;

    item.isEditing = false;
    saveState();
    renderInventory();
}

window.toggleEquip = function (idx) {
    if (charData.inventory[idx]) {
        charData.inventory[idx].equipped = !charData.inventory[idx].equipped;
        saveState();
        renderInventory();
    }
};

window.removeInvItem = function (idx) {
    if (confirm("Excluir item?")) {
        charData.inventory.splice(idx, 1);
        saveState();
        renderInventory();
    }
};

// --- MODALS (Inventory) ---
window.openItemModal = function () { document.getElementById('itemModal').classList.add('open'); populateItemModal(); };
window.closeItemModal = function () { document.getElementById('itemModal').classList.remove('open'); };

function populateItemModal() {
    const wl = document.getElementById('modalWeaponsList');
    const al = document.getElementById('modalArmorList');
    if (wl) {
        wl.innerHTML = '';
        ITEMS_DB.weapons.forEach(w => {
            wl.innerHTML += `<button class="item-btn" onclick='addItem(${JSON.stringify(w)})'><span>${w.name}</span> <span style="font-size:0.8rem; color:#888;">${w.dmg}</span></button>`;
        });
    }
    if (al) {
        al.innerHTML = '';
        ITEMS_DB.armor.forEach(a => {
            al.innerHTML += `<button class="item-btn" onclick='addItem(${JSON.stringify(a)})'><span>${a.name}</span> <span style="font-size:0.8rem; color:#888;">+${a.def_bonus} CA</span></button>`;
        });
    }
}

window.addItem = function (obj) {
    const it = JSON.parse(JSON.stringify(obj));
    it.equipped = false;
    charData.inventory.push(it);
    saveState();
    renderInventory();
    closeItemModal();
};

// --- COMBAT & BREATHING ---
window.rollDamage = function (dice, resId) {
    const el = document.getElementById(resId);
    if (!el) return;

    // Parse dice 1d6+2 etc
    let total = 0;
    // Simple parser
    const parts = dice.split('+');
    parts.forEach(p => {
        p = p.trim();
        if (p.includes('d')) {
            const [count, faces] = p.split('d').map(x => parseInt(x));
            for (let i = 0; i < (count || 1); i++) total += Math.floor(Math.random() * (faces || 6)) + 1;
        } else {
            total += parseInt(p) || 0;
        }
    });

    el.innerText = total;
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 2000);
};

window.loadBreathingData = function () {
    const div = document.getElementById('attacksList');
    if (!div) return;
    div.innerHTML = '';

    // Equipped Weapons
    charData.inventory.filter(i => i.equipped && i.type === 'weapon').forEach((w, i) => {
        // Logic for Mod: Acuidade uses Dex if higher
        let mod = getMod(charData.attributes.str);
        if ((w.props || '').toLowerCase().includes('acuidade') && getMod(charData.attributes.dex) > mod) mod = getMod(charData.attributes.dex);

        const dmgTxt = `${w.dmg} + ${mod}`;

        div.innerHTML += `
        <div class="attack-card">
            <div class="atk-header">
                <span class="atk-name">${w.name}</span>
                <div style="display:flex; align-items:center;">
                    <div id="res-w-${i}" class="roll-result-display"></div>
                    <button class="roll-btn" onclick="rollDamage('${dmgTxt}', 'res-w-${i}')">🎲</button>
                </div>
            </div>
            <div class="atk-details">
                <div>
                   <div style="font-size:0.7rem; color:#888;">DANO</div>
                   <div style="font-size:1.2rem; color:var(--accent-red); font-weight:bold;">${dmgTxt}</div>
                </div>
                <div class="atk-tags">
                   <span class="atk-tag">${w.props || 'Normal'}</span>
                </div>
            </div>
        </div>`;
    });

    // Custom Attacks
    (charData.customAttacks || []).forEach(atk => {
        div.innerHTML += `
        <div class="attack-card" style="border-left-color:#ff9100;">
            <div class="atk-header">
                <span class="atk-name">${atk.name}</span>
                <div style="display:flex; align-items:center;">
                    <button class="remove-btn-mini" style="margin-right:10px;" onclick="removeCustomAttack(${atk.id})">❌</button>
                    <div id="res-c-${atk.id}" class="roll-result-display"></div>
                    <button class="roll-btn" onclick="rollDamage('${atk.dmg}', 'res-c-${atk.id}')">🎲</button>
                </div>
            </div>
            <div class="atk-details">
                <div style="color:var(--accent-red); font-weight:bold; font-size:1.2rem;">${atk.dmg}</div>
                <div class="atk-tags">${atk.type || ''}</div>
            </div>
        </div>`;
    });

    // Empty state
    if (div.innerHTML === '') div.innerHTML = `<div style="text-align:center; padding:1rem; color:#555;">Sem ataques. Equipe uma arma.</div>`;

    // Breathing Special (Water Ichi no Kata)
    if (charData.level >= 3 && charData.breathingStyle?.id === 'class_water') {
        const dmg = `2d10 + ${getMod(charData.attributes.dex)}`;
        div.innerHTML += `
         <div class="attack-card special" style="border-color:var(--accent-cyan); margin-top:1rem;">
            <div class="atk-header" style="background:rgba(0,180,216,0.1);">
                <span class="atk-name" style="color:var(--accent-cyan);">🌊 Ichi no Kata: Minamo Giri</span>
                <div style="display:flex; align-items:center;">
                    <div id="res-breath" class="roll-result-display" style="color:var(--accent-cyan)"></div>
                    <button class="roll-btn" style="border-color:var(--accent-cyan); color:var(--accent-cyan);" onclick="rollDamage('${dmg}', 'res-breath')">🎲</button>
                </div>
            </div>
            <div class="atk-details">
                <div style="color:white; font-weight:bold;">${dmg}</div>
                <span class="cost-tag">1 PE</span>
            </div>
         </div>`;
    }
};

window.renderBreathingTab = function () {
    const c = document.getElementById('breathingContent');
    if (!c) return;
    if (charData.level < 3) {
        c.innerHTML = `<div style="text-align:center; padding:3rem; color:#666;">🔒 Bloqueado até o Nível 3</div>`;
    } else {
        c.innerHTML = `<div><h3>${charData.breathingStyle?.name || 'Respiração'}</h3><p>Técnicas desbloqueadas.</p></div>`;
        // In full version, list katas here.
    }
};

// --- CUSTOM ATTACKS ---
window.openAttackModal = function () { document.getElementById('attackModal').classList.add('open'); };
window.closeAttackModal = function () { document.getElementById('attackModal').classList.remove('open'); };
window.saveCustomAttack = function () {
    const name = document.getElementById('newAtkName').value;
    const dmg = document.getElementById('newAtkDmg').value;
    const type = document.getElementById('newAtkType').value;
    if (!name) return alert("Nome obrigatório");
    charData.customAttacks.push({ name, dmg, type, id: Date.now() });
    saveState();
    loadBreathingData();
    closeAttackModal();
};
window.removeCustomAttack = function (id) {
    if (confirm("Excluir?")) {
        charData.customAttacks = charData.customAttacks.filter(x => x.id !== id);
        saveState();
        loadBreathingData();
    }
};

// --- ABILITIES ---
// --- HP LOGIC ---
function calculateMaxHP() {
    // Formula: RacialBase + ConMod + (Level-1)*(Base/2 + 1 + ConMod)
    // NOTE: If CharData doesn't have a specific race, default to Human (12).
    const raceName = charData.race || "Humano";
    const raceData = RACES_DB[raceName] || RACES_DB["Humano"];

    const base = raceData.baseHP;
    const conMod = getMod(charData.attributes.con);

    // Level 1: Full Base + Con
    // Level > 1: (Base/2 + 1) + Con per level
    const hpPerLevel = Math.floor(base / 2) + 1 + conMod;

    let total = (base + conMod) + ((charData.level - 1) * hpPerLevel);

    // Safety
    if (total < 1) total = 1;

    // Apply to maxHP global and charData override
    maxHP = total;
    charData.maxHP_override = maxHP;

    // Only update Current HP if it exceeds Max (or if it's 0/null?) - Usually better to leave current HP alone unless full heal.
    if (currentHP > maxHP) currentHP = maxHP;

    return maxHP;
}

// --- ABILITIES ---
window.renderAbilities = function () {
    const div = document.getElementById('tab-abilities');
    if (!div) return;
    div.innerHTML = `
    <div class="combat-header">
       <h3>Habilidades & Talentos</h3>
       <button class="new-atk-btn" onclick="openAbilityModal()">+ Habilidade</button>
    </div>`;

    const list = [];

    // Racial
    const raceName = charData.race || "Humano";
    const raceData = RACES_DB[raceName];
    if (raceData && raceData.abilities) {
        raceData.abilities.forEach(a => {
            list.push({ isRacial: true, name: a.name + " (" + raceName + ")", desc: a.desc });
        });
    }

    // Base
    list.push({ name: "Respirar", desc: "Controle de respiração. +1 Vigor.", level: 1 });
    if (charData.level >= 3) list.push({ name: "Foco Total", desc: "Respiração Foco Total constante.", level: 3 });

    // Custom
    (charData.customAbilities || []).forEach(c => list.push(c));

    list.forEach(a => {
        div.innerHTML += `
        <div class="attack-card" style="padding:1rem; border-left: 4px solid ${a.isRacial ? '#d90429' : 'transparent'};">
           <div style="display:flex; justify-content:space-between;">
              <strong>${a.name}</strong>
              ${a.id ? `<button style="background:none; border:none; cursor:pointer;" onclick="removeCustomAbility(${a.id})">🗑️</button>` : ''}
           </div>
           <div style="color:#aaa; font-size:0.9rem;">${a.desc}</div>
        </div>`;
    });
};

// --- CUSTOMIZATION ---
window.editProfile = function (field) {
    const map = { name: 'charName', class: 'breathingStyle', origin: 'background', age: 'age' };
    const key = map[field] || field;

    const currentVal = charData[key] || "";
    const newVal = prompt(`Editar ${field.toUpperCase()}:`, currentVal);

    if (newVal !== null && newVal.trim() !== "") {
        charData[key] = newVal.trim();
        saveState();

        // Update UI locally without full reload
        const el = document.getElementById(field === 'name' ? 'dispName' : (field === 'class' ? 'dispClass' : (field === 'origin' ? 'dispOrigin' : 'dispAge')));
        if (el) {
            el.innerHTML = `${newVal} <i data-lucide="pencil" style="width:12px; margin-left:5px; opacity:0.5;"></i>`;
            if (window.lucide) window.lucide.createIcons();
        }
    }
};
window.openAbilityModal = function () { document.getElementById('abilityModal').classList.add('open'); };
window.closeAbilityModal = function () { document.getElementById('abilityModal').classList.remove('open'); };
window.saveCustomAbility = function () {
    const name = document.getElementById('newAbilName').value;
    const desc = document.getElementById('newAbilDesc').value;
    if (!name) return;
    charData.customAbilities.push({ name, desc, id: Date.now(), level: 1 });
    saveState();
    renderAbilities();
    closeAbilityModal();
};
window.removeCustomAbility = function (id) {
    if (confirm("Excluir?")) { charData.customAbilities = charData.customAbilities.filter(x => x.id !== id); saveState(); renderAbilities(); }
};

// --- CLICK-TO-ROLL ENGINE ---
window.logMsg = function (html, type = 'system') {
    const chatContent = document.getElementById('chatContent');
    const chatLog = document.getElementById('chatLog');
    if (!chatContent) return;

    // Auto-expand if collapsed when a roll happens
    if (chatLog && chatLog.style.display === 'none') {
        chatLog.style.display = 'flex';
    }

    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    msg.innerHTML = html;

    chatContent.appendChild(msg);
    chatContent.scrollTop = chatContent.scrollHeight;
};

window.rollCheck = function (label, mod = 0) {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + parseInt(mod);

    let type = 'roll';
    if (d20 === 20) type = 'crit';
    if (d20 === 1) type = 'fumble';

    const sign = mod >= 0 ? '+' : '';

    const html = `
        <div class="roll-result">🎲 ${total} (${label})</div>
        <div class="roll-detail">Natural: ${d20} | Mod: ${sign}${mod}</div>
    `;

    logMsg(html, type);
};

window.clearChat = function () {
    const chatContent = document.getElementById('chatContent');
    if (chatContent) chatContent.innerHTML = '<div class="chat-msg system">Log limpo.</div>';
};

window.rollStat = function (statKey) {
    const val = charData.attributes[statKey] || 0;
    const mod = Math.floor((val - 10) / 2);
    const label = statKey.toUpperCase();
    rollCheck(label, mod);
};



// --- DESCRIPTION ---
// --- DESCRIPTION ---
window.saveDescription = function () {
    if (!charData.description) charData.description = {};
    charData.description.story = document.getElementById('desc-story').value;
    charData.description.notes = document.getElementById('desc-notes').value;
    charData.description.money = document.getElementById('desc-money').value;
    saveState();
};

// --- DEFENSE ---
window.calcDefense = function () {
    let equip = 0;
    charData.inventory.forEach(i => { if (i.equipped && i.def_bonus) equip += parseInt(i.def_bonus); });
    const other = parseInt(document.getElementById('def-other').value) || 0;
    charData.def_other = other;
    saveState();

    document.getElementById('def-equip').value = equip;
    const total = 10 + getMod(charData.attributes.con) + equip + other;
    if (document.getElementById('val-defense-total')) document.getElementById('val-defense-total').innerText = total;
};


// --- TABS ---
window.switchTab = function (tName) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));

    const target = document.getElementById('tab-' + tName);
    if (target) target.classList.add('active');

    // Highlight button?
    // Doing strict match on text or onclick is hard without ID.
    // Let's assume user clicks.
    if (event && event.target && event.target.classList.contains('nav-tab')) {
        event.target.classList.add('active');
    }

    if (tName === 'inventory') renderInventory();
    if (tName === 'combat') loadBreathingData();
    if (tName === 'abilities') renderAbilities();
    if (tName === 'breathing') renderBreathingTab();
};


// --- FINAL INIT ---
function initDashboard() {
    console.log("Init UI...");

    // Text stats
    if (document.getElementById('dispName')) document.getElementById('dispName').innerText = charData.name;
    if (document.getElementById('dispOrigin')) document.getElementById('dispOrigin').innerText = charData.race;
    if (document.getElementById('dispClass')) document.getElementById('dispClass').innerText = charData.breathingStyle?.name;

    const rankMap = ['癸', '壬', '辛', '庚', '己', '戊', '丁', '丙', '乙', '甲'];
    if (document.getElementById('dispRank')) document.getElementById('dispRank').innerText = 'Mizunoto (' + rankMap[Math.min(9, charData.level - 1)] + ')';

    // Attributes
    const attrs = charData.attributes;
    if (attrs) {
        ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(k => {
            if (document.getElementById('attr-' + k)) document.getElementById('attr-' + k).innerText = attrs[k];
        });
    }

    // Inputs
    if (document.getElementById('levelInput')) document.getElementById('levelInput').value = charData.level;
    if (document.getElementById('xpInput')) document.getElementById('xpInput').value = charData.xp || 0;
    if (document.getElementById('def-other')) document.getElementById('def-other').value = charData.def_other;
    updateRankDisplay();

    // Description
    if (charData.description) {
        if (document.getElementById('desc-story')) document.getElementById('desc-story').value = charData.description.story || '';
        if (document.getElementById('desc-notes')) document.getElementById('desc-notes').value = charData.description.notes || '';
        if (document.getElementById('desc-money')) document.getElementById('desc-money').value = charData.description.money || '';
    }

    // Render All
    calculateMaxHP(); // Ensure HP is correct on load
    updateBars();
    renderSkills();
    renderInventory();
    loadBreathingData();
    renderAbilities();
    calcDefense();

    console.log("Dashboard Ready.");
}

// Call Init
initDashboard();

// --- NICHIRIN FORGE ---
// --- NICHIRIN FORGE LOGIC ---
let tempForge = { type: 'katana', color: 'blue', name: '' };

window.openForge = function () {
    const modal = document.getElementById('forgeModal');
    if (modal) {
        modal.classList.add('open');
        if (charData.nichirin) {
            selectBladeType(charData.nichirin.type);
            selectBladeColor(charData.nichirin.color);
            if (charData.nichirin.name) document.getElementById('forgeName').value = charData.nichirin.name;
        } else {
            selectBladeType('katana');
            selectBladeColor('blue');
        }
        updateForgePreview();
    }
};

window.selectBladeType = function (type) {
    tempForge.type = type;
    // Update UI
    document.querySelectorAll('.forge-types-grid .forge-card').forEach(el => el.classList.remove('selected'));

    // Index mapping manually for now or find by click
    // Simpler: iterate and match onclick
    // but here we just re-render is easier or logic:
    const map = ['katana', 'dual', 'axe', 'gun'];
    const idx = map.indexOf(type);
    const opts = document.querySelectorAll('.forge-types-grid .forge-card');
    if (idx >= 0 && opts[idx]) opts[idx].classList.add('selected');

    updateForgePreview();
};

window.selectBladeColor = function (color) {
    tempForge.color = color;
    document.querySelectorAll('.ore-grid .ore-opt').forEach(el => el.classList.remove('selected'));
    const el = document.querySelector(`.ore-${color}`);
    if (el) el.classList.add('selected');

    const descMap = {
        blue: "Água (Mizu): +1 na Classe de Armadura (AC). Defesa Fluida.",
        red: "Chamas (Hono): +1 em rolagens de Dano. Queimar paixões.",
        yellow: "Trovão (Kaminari): +2 Iniciativa. Velocidade extrema.",
        green: "Vento (Kaze): Margem de Crítico reduzida em 1 (19-20).",
        pink: "Amor (Koi): +2 em Testes de Acrobacia e Atletismo.",
        black: "Vazio (Void): +1 rolagem de Ataque e +1 na CA. Lâmina Adaptativa."
    };
    const descEl = document.getElementById('colorDesc');
    if (descEl) descEl.innerText = descMap[color] || "";

    // Update accent color var if needed for preview glow
    const colorMap = {
        blue: '#00b4d8', red: '#d90429', yellow: '#ffd60a',
        green: '#2b9348', pink: '#ff006e', black: '#888'
    };
    document.documentElement.style.setProperty('--accent-color', colorMap[color] || '#fff');

    updateForgePreview();
};

window.updateForgePreview = function () {
    const nameIn = document.getElementById('forgeName').value;
    const label = document.getElementById('previewLabel');
    const attr = document.getElementById('previewAttr');
    const icon = document.querySelector('.preview-icon');

    // Name
    if (label) label.innerText = nameIn || `Lâmina ${tempForge.color.charAt(0).toUpperCase() + tempForge.color.slice(1)}`;

    // Attr text
    if (attr) attr.innerText = `Tipo: ${tempForge.type.toUpperCase()} | Cor: ${tempForge.color.toUpperCase()}`;

    // Icon (Lucide needs re-render usually, but class replacement works if CSS content used? No, lucide replaces svg. We need to re-inject svg)
    // For simplicity, we just change color for now, or re-call createIcons if we changed DOM structure.
    // Actually, let's just rotate/scale based on type
    if (icon) {
        icon.style.color = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
        if (tempForge.type === 'dual') { icon.style.transform = 'rotate(45deg) scale(0.8)'; icon.setAttribute('data-lucide', 'scissors'); }
        else if (tempForge.type === 'axe') { icon.setAttribute('data-lucide', 'axe'); }
        else if (tempForge.type === 'gun') { icon.setAttribute('data-lucide', 'crosshair'); }
        else { icon.setAttribute('data-lucide', 'sword'); }

        if (window.lucide) window.lucide.createIcons();
    }
};

window.saveForge = function () {
    const customName = document.getElementById('forgeName').value;
    tempForge.name = customName;
    charData.nichirin = { ...tempForge };

    // Create Item
    const defaultNames = { katana: "Katana Nichirin", dual: "Nichirin Duplas", axe: "Machado Nichirin", gun: "Escopeta Nichirin" };
    const finalName = customName || `${defaultNames[tempForge.type]} (${tempForge.color})`;

    const item = {
        name: finalName,
        type: 'weapon',
        dmg: tempForge.type === 'axe' ? '1d10 cortante' : (tempForge.type === 'dual' ? '1d6 cortante (x2)' : '1d8 cortante'),
        props: `Lâmina ${tempForge.color}. Indestrutível.`,
        weight: tempForge.type === 'axe' ? '4 kg' : '1.5 kg',
        equipped: true,
        desc: "Uma lâmina forjada especialmente para você."
    };

    // Replace old Nichirin
    charData.inventory = charData.inventory.filter(i => !i.name.toLowerCase().includes("nichirin"));
    charData.inventory.push(item);

    saveState();
    renderInventory();

    document.getElementById('forgeModal').classList.remove('open');
    logMsg(`<div class="roll-result" style="color:#d90429">FORJA CONCLUÍDA!</div><div>Você recebeu: ${item.name}</div>`, 'system');

    // Trigger stat updates (Defense calculation checks inventory)
    calcDefense();
};

// --- AMMO ---
window.updateAmmo = function () {
    const el = document.getElementById('ammoInput');
    if (el) {
        charData.ammo = parseInt(el.value) || 0;
        saveState();
    }
};

// Init Ammo on Load
if (document.getElementById('ammoInput') && charData.ammo !== undefined) {
    document.getElementById('ammoInput').value = charData.ammo;
}

// --- ZEN MODE ---
window.toggleZenMode = function () {
    document.body.classList.toggle('zen-mode');
};

// --- DICE ICON SVG ---
const D20_ICON = `<svg class="d20-icon" viewBox="0 0 24 24"><path d="M12 2L2 22l10-2l10 2L12 2zM12 20l-6-1.5l6-3.5l6 3.5L12 20zM4 21l8-4l8 4l-8-2l-8 2z"/></svg>`;
// Simplified D20 path for demo

// --- EMOTION AVATARS ---
let currentAvatarState = 0;
window.toggleAvatar = function () {
    const states = [
        { icon: 'smile', color: '#fff' },      // Normal
        { icon: 'frown', color: '#d90429' },   // Angry
        { icon: 'activity', color: '#ff006e' },// Hurt
        { icon: 'cloud-rain', color: '#4cc9f0' } // Sad
    ];

    currentAvatarState = (currentAvatarState + 1) % states.length;
    const s = states[currentAvatarState];

    const el = document.getElementById('avatarIcon');
    if (el) {
        el.setAttribute('data-lucide', s.icon);
        el.style.color = s.color;

        if (window.lucide) window.lucide.createIcons();
    }
};

// --- BREATHING THEMES & STATUS ---
window.updateTheme = function () {
    // 1. Check Status First (Priority)
    const hpCur = parseInt(document.getElementById('hpCurrent')?.innerText || 100);
    const hpMax = parseInt(document.getElementById('hpMaxInput')?.value || 100);
    const body = document.body;

    // Reset status classes
    body.classList.remove('status-low-hp');
    // body.classList.remove('status-poisoned'); // Helper for future

    if (hpCur > 0 && hpCur <= hpMax * 0.2) {
        body.classList.add('status-low-hp');
    }

    // 2. Breathing Theme (Background colors)
    // We can map breathing styles to CSS vars
    const styleName = charData?.breathingStyle?.name || "None";
    const themeMap = {
        "Água (Mizu)": { p: "#00b4d8", a: "#90e0ef" },
        "Chamas (Hono)": { p: "#d90429", a: "#ffb703" },
        "Vento (Kaze)": { p: "#2b9348", a: "#ccff33" },
        "Trovão (Kaminari)": { p: "#ffd60a", a: "#fff" },
        "Lua (Tsuki)": { p: "#7209b7", a: "#f72585" },
        "Sol (Hi)": { p: "#fb8500", a: "#ffb703" },
        "Névoa (Kasumi)": { p: "#caf0f8", a: "#fff" }
    };

    // Applying CSS vars dynamically? 
    // Currently CSS uses hardcoded #d90429 usually. 
    // To support themes, we should have used var(--primary-color).
    // I will set the root vars just in case I refactor CSS later, or for new elements.
    const t = themeMap[styleName];
    if (t) {
        document.documentElement.style.setProperty('--primary-color', t.p);
        document.documentElement.style.setProperty('--accent-color', t.a);
    }
};

// Theme update is now integrated into updateBars

// --- CHAT TOGGLE ---
window.toggleChat = function () {
    const chat = document.getElementById('chatLog');
    if (chat) {
        if (chat.style.display === 'none') {
            chat.style.display = 'flex';
        } else {
            chat.style.display = 'none';
        }
    }
};

// --- TOOLS LOGIC ---
window.convertCurrency = function () {
    const yen = parseInt(document.getElementById('yenInput').value) || 0;
    // Rate: 10,000 Yen = 1 Kan
    const kan = (yen / 10000).toFixed(2);
    document.getElementById('kanInput').value = kan;
};

window.rollAppraisal = function () {
    const intScore = charData.attributes.int;
    const mod = getMod(intScore);
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + mod;

    const resultEl = document.getElementById('appraisalResult');
    let quality = "Desconhecido";
    if (total < 5) quality = "Lixo inútil...";
    else if (total < 10) quality = "Comum/Barato.";
    else if (total < 15) quality = "Boa qualidade.";
    else if (total < 20) quality = "Raro/Valioso!";
    else quality = "TESOURO LENDÁRIO?!";

    resultEl.innerHTML = `Rolagem: ${d20} + ${mod} = <strong>${total}</strong><br>Resultado: <span style="color:${total > 15 ? 'gold' : '#ccc'}">${quality}</span>`;
    logMsg(`Avaliação de Item: <strong>${total}</strong> (${quality})`);
};

window.saveWishlist = function () {
    const txt = document.getElementById('wishlistInput').value;
    charData.wishlist = txt;
    saveState();
};

const SHOP_ITEMS = [
    "Velas Aromáticas (Wisteria)", "Arroz de Onigiri (Recupera 1d4)", "Bandagens Limpas",
    "Óleo de Lâmina", "Talismã de Proteção (Fake?)", "Mapa da Montanha",
    "Sake de Qualidade", "Kit de Costura", "Tinta para Caligrafia"
];

window.generateShop = function () {
    const list = document.getElementById('shopList');
    if (!list) return;
    list.innerHTML = "";
    // Random 3-5 items
    const count = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < count; i++) {
        const item = SHOP_ITEMS[Math.floor(Math.random() * SHOP_ITEMS.length)];
        const cost = Math.floor(Math.random() * 500) + 100;
        const li = document.createElement('li');
        li.innerText = `${item} - ¥${cost}`;
        li.style.marginBottom = "5px";
        list.appendChild(li);
    }
};

// Init Tools logic if elements verify
setTimeout(() => {
    if (document.getElementById('wishlistInput') && charData.wishlist) {
        document.getElementById('wishlistInput').value = charData.wishlist;
    }
    if (document.getElementById('shopList')) generateShop();
}, 500);
