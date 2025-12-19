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

// --- NEW INVENTORY LOGIC (LIST SYSTEM) ---

let currentFilter = 'all';
let currentSearch = '';
let selectedItemIdx = -1;

window.renderInventory = function () {
    const grid = document.getElementById('inventoryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    let totalWeight = 0;
    const maxLoad = (charData.attributes.str || 0) * 15;

    // Filter Items
    const filtered = charData.inventory.map((item, idx) => ({ ...item, originalIdx: idx })).filter(item => {
        if (currentSearch && !item.name.toLowerCase().includes(currentSearch.toLowerCase())) return false;
        if (currentFilter === 'all') return true;
        if (currentFilter === 'weapon' && item.type === 'weapon') return true;
        if (currentFilter === 'armor' && item.type === 'armor') return true;
        if (currentFilter === 'consumable' && item.type !== 'weapon' && item.type !== 'armor') return true;
        return false;
    });

    // Render LIST Rows
    filtered.forEach(item => {
        const wVal = parseFloat(String(item.weight || "0").replace(/[^\d\.]/g, '')) || 0;
        totalWeight += wVal;

        const isSelected = item.originalIdx === selectedItemIdx;
        let icon = 'box';
        if (item.type === 'weapon') icon = 'sword';
        if (item.type === 'armor') icon = 'shield';
        if (item.type === 'consumable') icon = 'flask-conical';

        const rarity = item.rarity || 'Comum';
        const isRare = rarity === 'Raro' || rarity === 'Épico';
        const tagClass = rarity === 'Raro' ? 'tag-rare' : (rarity === 'Épico' ? 'tag-epic' : '');

        grid.innerHTML += `
        <div class="inv-row-card ${isSelected ? 'selected' : ''} ${item.equipped ? 'equipped' : ''}" onclick="selectInventoryItem(${item.originalIdx})">
            <div class="inv-row-icon" style="color:${isRare ? '#00b4d8' : '#888'}">
                <i data-lucide="${icon}"></i>
            </div>
            <div style="flex:1;">
                <div style="font-weight:bold; font-family:var(--font-display); font-size:1.0rem; color:white;">${item.name}</div>
                <div style="font-size:0.75rem; color:#666;">${item.type?.toUpperCase() || 'ITEM'} • ${item.weight || '0kg'}</div>
            </div>
            <div class="inv-tags">
                ${item.equipped ? '<span class="inv-tag" style="color:#00ffaa; border-color:rgba(0,255,170,0.3); background:rgba(0,255,170,0.1)">EQUIPADO</span>' : ''}
                <span class="inv-tag ${tagClass}">${rarity}</span>
            </div>
        </div>`;
    });

    // Update Capacity
    const capBar = document.getElementById('capacityBar');
    const capText = document.getElementById('capacityText');
    if (capBar && capText) {
        const pct = Math.min(100, (totalWeight / maxLoad) * 100);
        capBar.style.width = pct + "%";
        capBar.style.background = pct > 90 ? '#d90429' : (pct > 75 ? '#ffaa00' : '#00ffaa');
        capText.innerText = `${totalWeight.toFixed(1)} / ${maxLoad} kg`;
    }

    // Render Details
    renderDetailPanel();
    renderEquippedSlots();

    if (window.lucide) window.lucide.createIcons();
};

window.setFilter = function (filter, el) {
    currentFilter = filter;
    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    renderInventory();
};

window.filterInventory = function (val) {
    currentSearch = val;
    renderInventory();
};

window.selectInventoryItem = function (idx) {
    selectedItemIdx = idx;
    renderInventory(); // Re-render to update selection highlight
};

window.renderDetailPanel = function () {
    const container = document.getElementById('itemDetailContainer');
    const empty = document.getElementById('itemDetailEmpty');

    if (selectedItemIdx === -1 || !charData.inventory[selectedItemIdx]) {
        container.style.display = 'none';
        empty.style.display = 'flex';
        return;
    }

    const item = charData.inventory[selectedItemIdx];
    container.style.display = 'flex';
    empty.style.display = 'none';

    const rarity = item.rarity || 'Comum';
    const rarityColor = rarity === 'Raro' ? '#00b4d8' : (rarity === 'Épico' ? '#9d4edd' : '#ccc');
    let icon = 'box';
    if (item.type === 'weapon') icon = 'sword';
    if (item.type === 'armor') icon = 'shield';
    if (item.type === 'consumable') icon = 'flask-conical';

    container.innerHTML = `
        <div class="inv-hero">
            <span style="background:#1a3a5a; color:#4cc9f0; padding:4px 8px; border-radius:4px; font-size:0.7rem; font-weight:bold; text-transform:uppercase;">${item.type || 'Item'}</span>
            <div class="inv-big-icon" style="color:${rarityColor}; border-color:${rarityColor}; box-shadow: 0 0 20px ${rarityColor}40;">
                <i data-lucide="${icon}"></i>
            </div>
            <h2 style="margin:0; font-family:var(--font-display); line-height:1.2;">${item.name}</h2>
            <div style="color:${rarityColor}; font-size:0.8rem; margin-top:5px; text-transform:uppercase; letter-spacing:1px;">${rarity}</div>
        </div>
        
        <div class="abil-stats-grid"> <!-- Reusing stats grid from abilities -->
            <div class="stat-box">
                <div class="sb-label">Peso</div>
                <div class="sb-val">${item.weight || '0'}</div>
            </div>
            <div class="stat-box">
                <div class="sb-label">Valor</div>
                <div class="sb-val" style="color:#ffaa00;">¥${item.value || '100'}</div>
            </div>
            ${item.dmg ? `
            <div class="stat-box">
                <div class="sb-label">Dano</div>
                <div class="sb-val" style="color:#d90429;">${item.dmg}</div>
            </div>` : ''}
            ${item.ac ? `
            <div class="stat-box">
                <div class="sb-label">Defesa</div>
                <div class="sb-val" style="color:#00ffaa;">${item.ac}</div>
            </div>` : ''}
        </div>
        
        <div style="padding: 0 1.5rem 1.5rem; flex:1; display:flex; flex-direction:column;">
            <h4 style="color:#888; font-size:0.8rem; text-transform:uppercase; margin-bottom:10px;">Descrição Detalhada</h4>
            <p style="color:#ccc; line-height:1.6; font-size:0.9rem;">
                ${item.desc || 'Sem descrição.'}
            </p>
            
            <div style="margin-top:auto; display: grid; grid-template-columns: 1fr 1fr; gap:10px;">
                 ${(item.type === 'weapon' || item.type === 'armor') ?
            `<button class="upgrade-btn" onclick="toggleEquip(${selectedItemIdx})">${item.equipped ? 'Desequipar' : 'Equipar'}</button>` :
            `<button class="upgrade-btn" onclick="console.log('Use')">Usar</button>`
        }
                <button class="upgrade-btn" style="background:#d90429;" onclick="removeInvItem(${selectedItemIdx})">Descartar</button>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();
};

window.renderEquippedSlots = function () {
    // Clear all first
    ['head', 'torso', 'hands', 'legs', 'weapon'].forEach(s => {
        const el = document.getElementById(`slot-${s}`);
        if (el) {
            el.innerHTML = `<i data-lucide="${getSlotIcon(s)}"></i>`;
            el.classList.remove('active');
        }
    });

    // Find equipped items
    charData.inventory.filter(i => i.equipped).forEach(item => {
        let slotId = '';
        if (item.type === 'weapon') slotId = 'weapon';
        else if (item.type === 'armor') {
            if (item.name.toLowerCase().includes('capacete')) slotId = 'head';
            else if (item.name.toLowerCase().includes('bota')) slotId = 'legs';
            else if (item.name.toLowerCase().includes('luva')) slotId = 'hands';
            else slotId = 'torso';
        }

        const el = document.getElementById(`slot-${slotId}`);
        if (el) {
            el.classList.add('active'); // Highlight
        }
    });
};

function getSlotIcon(s) {
    if (s === 'weapon') return 'sword';
    if (s === 'head') return 'smile';
    if (s === 'torso') return 'shirt';
    if (s === 'hands') return 'hand';
    if (s === 'legs') return 'footprints';
    return 'gem';
}


// --- OVERRIDES FOR NEW SIDEBAR ---

window.updateBars = function () {
    // Current Values
    if (document.getElementById('hpCurrent')) document.getElementById('hpCurrent').innerText = currentHP;
    if (document.getElementById('peCurrent')) document.getElementById('peCurrent').innerText = currentPE;

    // Max Values Display (New Sidebar)
    if (document.getElementById('hpMaxDisp')) document.getElementById('hpMaxDisp').innerText = maxHP;
    if (document.getElementById('peMaxDisp')) document.getElementById('peMaxDisp').innerText = maxPE;

    // Inputs
    if (document.getElementById('hpMaxInput')) document.getElementById('hpMaxInput').value = maxHP;
    if (document.getElementById('peMaxInput')) document.getElementById('peMaxInput').value = maxPE;

    updateSidebarInfo(); // Trigger the extra details like Weapon Name
};

window.updateSidebarInfo = function () {
    // Basic Info
    if (document.getElementById('dispName')) document.getElementById('dispName').innerText = charData.name || "Caçador";
    if (document.getElementById('dispRace')) document.getElementById('dispRace').innerText = charData.race || "Humano";

    // Breathing
    if (document.getElementById('dispClass')) {
        const style = charData.breathingStyle ? charData.breathingStyle.name : "Nenhuma";
        document.getElementById('dispClass').innerHTML = style;
    }

    // Equipped Weapon
    let weaponName = "Desarmado";
    const weapon = charData.inventory.find(i => i.equipped && i.type === 'weapon');
    if (weapon) weaponName = weapon.name;
    if (document.getElementById('dispWeapon')) document.getElementById('dispWeapon').innerText = weaponName;

    // Rank Badge logic
    updateRankDisplay();
};

window.updateRankDisplay = function () {
    let rankName = "Mizunoto";
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (charData.level >= RANKS[i].min) {
            rankName = RANKS[i].name.split(' ')[0]; // Just first word for badge
            break;
        }
    }
    if (document.getElementById('dispRankBadge')) document.getElementById('dispRankBadge').innerText = rankName;
};

// --- PREMIUM MODAL LOGIC ---
let modalFilter = 'weapon';
let modalSearch = '';

window.populateItemModal = function () {
    modalFilter = 'weapon'; // Reset
    renderModalItems();
}

window.filterModal = function (cat, el) {
    modalFilter = cat;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    renderModalItems();
}

window.searchModal = function (val) {
    modalSearch = val;
    renderModalItems();
}

// Extended DB for Display
const FULL_ITEMS_DB = [
    // Weapons
    ...ITEMS_DB.weapons.map(i => ({ ...i, cat: 'weapon', rarity: 'Comum' })),
    // Armor
    ...ITEMS_DB.armor.map(i => ({ ...i, cat: 'armor', rarity: 'Comum' })),
    // Add Consumables
    { name: "Semente de Cura", type: "consumable", weight: "0.1 kg", desc: "Recupera 1d4 PV.", cat: 'consumable', rarity: 'Comum' },
    { name: "Chá de Glicínia", type: "consumable", weight: "0.2 kg", desc: "Cura venenos menores.", cat: 'consumable', rarity: 'Incomum' },
    { name: "Onigiri", type: "consumable", weight: "0.1 kg", desc: "Restaura um pouco de vigor.", cat: 'consumable', rarity: 'Comum' },
    // Misc
    { name: "Corda (15m)", type: "item", weight: "1 kg", desc: "Corda resistente.", cat: 'misc', rarity: 'Comum' },
    { name: "Lanterna", type: "item", weight: "0.5 kg", desc: "Ilumina 10m.", cat: 'misc', rarity: 'Comum' },
    { name: "Minério Carmesim", type: "item", weight: "2 kg", desc: "Material para forja.", cat: 'misc', rarity: 'Raro' }
];

window.renderModalItems = function () {
    const grid = document.getElementById('pickerGrid');
    if (!grid) return;
    grid.innerHTML = '';

    FULL_ITEMS_DB.filter(item => {
        if (modalFilter && item.cat !== modalFilter) return false;
        if (modalSearch && !item.name.toLowerCase().includes(modalSearch.toLowerCase())) return false;
        return true;
    }).forEach(item => {

        let icon = 'box';
        if (item.cat === 'weapon') icon = 'sword';
        if (item.cat === 'armor') icon = 'shield';
        if (item.cat === 'consumable') icon = 'flask-conical';

        grid.innerHTML += `
        <div class="picker-card" onclick='addItem(${JSON.stringify(item)})'>
            <div class="picker-icon"><i data-lucide="${icon}"></i></div>
            <div class="picker-name">${item.name}</div>
            <div class="picker-sub">${item.dmg || item.ac || item.weight}</div>
        </div>`;
    });

    if (window.lucide) window.lucide.createIcons();
}

// --- NEW ABILITY LOGIC ---
let abilFilter = 'all';
let abilSearch = '';
let selectedAbilIdx = -1;

window.renderAbilitiesList = function () {
    const container = document.getElementById('abilitiesList');
    if (!container) return;
    container.innerHTML = '';

    // Combine custom and built-in for display
    let allAbils = [...(charData.abilities || [])];
    // Add dummy Breathing Forms if none exist for demo
    if (allAbils.length === 0 && charData.breathingStyle) {
        allAbils.push({
            name: "Ichi no kata: Minamo giri",
            desc: "Um corte horizontal poderoso.",
            type: "breath",
            cost: "2 PE",
            cd: "1 Turno",
            dmg: "1d8 + AGI",
            level: 1
        });
        allAbils.push({
            name: "Concentração Total",
            desc: "Aumenta atributos físicos.",
            type: "passive",
            cost: "Passivo",
            level: "Max"
        });
    }

    allAbils.forEach((abil, idx) => {
        // Filter logic here if needed
        if (abilFilter !== 'all' && abil.type !== abilFilter) return;
        if (abilSearch && !abil.name.toLowerCase().includes(abilSearch.toLowerCase())) return;

        const isSelected = idx === selectedAbilIdx;
        const typeLabel = abil.type === 'passive' ? 'PASSIVA' : 'ATIVA';
        const tagClass = abil.type === 'passive' ? 'tag-passive' : 'tag-active';
        const icon = abil.type === 'breath' ? 'wind' : 'zap';

        container.innerHTML += `
        <div class="abil-card ${isSelected ? 'selected' : ''}" onclick="selectAbility(${idx})">
            <div class="abil-icon"><i data-lucide="${icon}"></i></div>
            <div style="flex:1;">
                <div style="font-weight:bold; font-family:var(--font-display); font-size:1.1rem; margin-bottom:4px;">${abil.name}</div>
                <div style="font-size:0.8rem; color:#888; display:flex; gap:10px;">
                    <span><i data-lucide="zap" style="width:12px; display:inline-block; vertical-align:middle;"></i> ${abil.cost || '-'}</span>
                    <span><i data-lucide="clock" style="width:12px; display:inline-block; vertical-align:middle;"></i> ${abil.cd || '-'}</span>
                </div>
                <div style="font-size:0.8rem; color:#666; margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${abil.desc}
                </div>
            </div>
            <div class="abil-tags">
                <span class="tag ${tagClass}">${typeLabel}</span>
                <span class="tag" style="background:#333; color:#ccc;">Nv ${abil.level || 1}</span>
            </div>
        </div>
        `;
    });

    renderAbilityDetail(allAbils);
    if (window.lucide) window.lucide.createIcons();
};

window.selectAbility = function (idx) {
    selectedAbilIdx = idx;
    renderAbilitiesList(); // Re-render to update selection
};

window.setAbilFilter = function (filter, el) {
    abilFilter = filter;
    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    renderAbilitiesList();
}

window.filterAbilities = function (val) {
    abilSearch = val;
    renderAbilitiesList();
}

window.renderAbilityDetail = function (list) {
    const container = document.getElementById('abilityDetailContainer');
    const empty = document.getElementById('abilityDetailEmpty');

    if (selectedAbilIdx === -1 || !list[selectedAbilIdx]) {
        if (container) container.style.display = 'none';
        if (empty) empty.style.display = 'flex';
        return;
    }

    const abil = list[selectedAbilIdx];
    if (container) container.style.display = 'flex';
    if (empty) empty.style.display = 'none';

    container.innerHTML = `
        <div class="abil-hero">
            <span style="background:#1a3a5a; color:#4cc9f0; padding:4px 8px; border-radius:4px; font-size:0.7rem; font-weight:bold; text-transform:uppercase;">${charData.breathingStyle ? charData.breathingStyle.name : 'Técnica'}</span>
            <div class="abil-big-icon">
                <i data-lucide="${abil.type === 'breath' ? 'wind' : 'zap'}" size="40"></i>
            </div>
            <h2 style="margin:0; font-family:var(--font-display); line-height:1.2;">${abil.name}</h2>
            <div style="color:#4cc9f0; font-size:0.8rem; margin-top:5px; text-transform:uppercase; letter-spacing:1px;">Forma de Combate</div>
        </div>
        
        <div class="abil-stats-grid">
            <div class="stat-box">
                <div class="sb-label">Custo</div>
                <div class="sb-val" style="color:#4cc9f0;">${abil.cost || '0'}</div>
            </div>
            <div class="stat-box">
                <div class="sb-label">Recarga</div>
                <div class="sb-val">${abil.cd || '-'}</div>
            </div>
            <div class="stat-box">
                <div class="sb-label">Alcance</div>
                <div class="sb-val">Toque</div>
            </div>
            <div class="stat-box">
                <div class="sb-label">Dano Base</div>
                <div class="sb-val">${abil.dmg || '-'}</div>
            </div>
        </div>
        
        <div style="padding: 0 1.5rem 1.5rem; flex:1;">
            <h4 style="color:#888; font-size:0.8rem; text-transform:uppercase; margin-bottom:10px;">Descrição Detalhada</h4>
            <p style="color:#ccc; line-height:1.6; font-size:0.9rem;">
                ${abil.desc}
                <br><br>
                O espadachim gera ímpeto suficiente para criar um único e poderoso corte concentrado. Este movimento é a base de todas as formas.
            </p>
            
            <div style="background:#16161a; border-left: 2px solid #4cc9f0; padding:10px; margin-top:20px; font-style:italic; color:#888; font-size:0.9rem;">
                "Como a água flui, a lâmina segue. Sem hesitação, sem pausa."
            </div>
        </div>
        
        <div class="mastery-container">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:bold; margin-bottom:5px;">
                <span style="color:#888;">MAESTRIA DA TÉCNICA</span>
                <span style="color:#4cc9f0;">Nível 1 / 5</span>
            </div>
            <div class="mastery-bar-bg">
                <div class="mastery-fill" style="width: 20%;"></div>
            </div>
            <div style="text-align:right; font-size:0.7rem; color:#666; margin-top:5px; margin-bottom:15px;">Próximo nível: +1d4 de Dano</div>
            
            <div style="display:grid; grid-template-columns: 1fr 2fr; gap:10px;">
                <button style="background:#222; border:1px solid #333; color:#ccc; border-radius:6px; cursor:pointer;"><i data-lucide="bookmark"></i></button>
                <button class="upgrade-btn"><i data-lucide="arrow-up-circle"></i> Melhorar</button>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();
};

// Initial Call
setTimeout(() => {
    if (window.renderAbilitiesList) window.renderAbilitiesList();
}, 600);
 
 w i n d o w . u p d a t e P a p e r D o l l   =   f u n c t i o n   ( )   {  
         / /   R e s e t   a l l  
         [ ' h e a d ' ,   ' t o r s o ' ,   ' h a n d s ' ,   ' w e a p o n ' ,   ' l e g s ' ] . f o r E a c h ( s   = >   {  
                 c o n s t   e l   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' s l o t - '   +   s ) ;  
                 i f   ( e l )   e l . c l a s s L i s t . r e m o v e ( ' e q u i p p e d ' ) ;  
         } ) ;  
  
         / /   C h e c k   e q u i p p e d   i t e m s  
         c h a r D a t a . i n v e n t o r y . f i l t e r ( i   = >   i . e q u i p p e d ) . f o r E a c h ( i t e m   = >   {  
                 l e t   s l o t   =   n u l l ;  
                 c o n s t   n   =   ( i t e m . n a m e   | |   " " ) . t o L o w e r C a s e ( ) ;  
                 c o n s t   t   =   ( i t e m . t y p e   | |   " " ) . t o L o w e r C a s e ( ) ;  
  
                 i f   ( t   = = =   ' w e a p o n ' )   s l o t   =   ' w e a p o n ' ;  
                 e l s e   i f   ( t   = = =   ' a r m o r ' )   {  
                         i f   ( n . i n c l u d e s ( ' c a p a c e t e ' )   | |   n . i n c l u d e s ( ' m � � s c a r a ' )   | |   n . i n c l u d e s ( ' h e a d ' ) )   s l o t   =   ' h e a d ' ;  
                         e l s e   i f   ( n . i n c l u d e s ( ' l u v a ' )   | |   n . i n c l u d e s ( ' m a n o p l a ' ) )   s l o t   =   ' h a n d s ' ;  
                         e l s e   i f   ( n . i n c l u d e s ( ' b o t a ' )   | |   n . i n c l u d e s ( ' p e r n e i r a ' )   | |   n . i n c l u d e s ( ' s a n d � � l i a ' ) )   s l o t   =   ' l e g s ' ;  
                         e l s e   s l o t   =   ' t o r s o ' ;   / /   D e f a u l t   a r m o r   =   b o d y  
                 }  
  
                 i f   ( s l o t )   {  
                         c o n s t   e l   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' s l o t - '   +   s l o t ) ;  
                         i f   ( e l )   e l . c l a s s L i s t . a d d ( ' e q u i p p e d ' ) ;  
                 }  
         } ) ;  
 } ;  
  
 w i n d o w . u p d a t e R a d a r C h a r t   =   f u n c t i o n   ( )   {  
         c o n s t   s t a t s   =   [ ' s t r ' ,   ' d e x ' ,   ' c o n ' ,   ' i n t ' ,   ' w i s ' ,   ' c h a ' ] ;  
         c o n s t   m a x V a l   =   2 0 ;  
         c o n s t   c e n t e r   =   {   x :   1 0 0 ,   y :   1 0 0   } ;  
         c o n s t   m a x R a d i u s   =   8 0 ;  
  
         / /   A n g l e s :   S T R   ( T o p   - 9 0 ) ,   D E X   ( - 3 0 ) ,   C O N   ( 3 0 ) ,   I N T   ( 9 0 ) ,   W I S   ( 1 5 0 ) ,   C H A   ( 2 1 0 )  
         c o n s t   a n g l e s   =   [  
                 - M a t h . P I   /   2 ,  
                 - M a t h . P I   /   6 ,  
                 M a t h . P I   /   6 ,  
                 M a t h . P I   /   2 ,  
                 5   *   M a t h . P I   /   6 ,  
                 7   *   M a t h . P I   /   6  
         ] ;  
  
         c o n s t   p o i n t s   =   s t a t s . m a p ( ( k e y ,   i )   = >   {  
                 l e t   v a l   =   ( c h a r D a t a . a t t r i b u t e s   & &   c h a r D a t a . a t t r i b u t e s [ k e y ] )   ?   c h a r D a t a . a t t r i b u t e s [ k e y ]   :   1 0 ;  
                 i f   ( v a l   >   2 0 )   v a l   =   2 0 ;  
                 c o n s t   r a t i o   =   v a l   /   m a x V a l ;  
                 c o n s t   r   =   r a t i o   *   m a x R a d i u s ;  
  
                 c o n s t   x   =   c e n t e r . x   +   r   *   M a t h . c o s ( a n g l e s [ i ] ) ;  
                 c o n s t   y   =   c e n t e r . y   +   r   *   M a t h . s i n ( a n g l e s [ i ] ) ;  
  
                 / /   U p d a t e   t e x t  
                 c o n s t   t x t   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' s v g - '   +   k e y ) ;  
                 i f   ( t x t )   t x t . t e x t C o n t e n t   =   v a l ;  
  
                 r e t u r n   ` $ { x } , $ { y } ` ;  
         } ) ;  
  
         c o n s t   p o l y   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' r a d a r P o l y ' ) ;  
         i f   ( p o l y )   p o l y . s e t A t t r i b u t e ( ' p o i n t s ' ,   p o i n t s . j o i n ( '   ' ) ) ;  
 } ;  
 / /   E n h a n c e d   I t e m   M o d a l   F u n c t i o n s  
 l e t   c u r r e n t F i l t e r   =   ' a l l ' ;  
 l e t   c u r r e n t S e a r c h   =   ' ' ;  
  
 w i n d o w . o p e n I t e m M o d a l   =   f u n c t i o n   ( )   {  
         d o c u m e n t . g e t E l e m e n t B y I d ( ' i t e m M o d a l ' ) . s t y l e . d i s p l a y   =   ' f l e x ' ;  
         p o p u l a t e I t e m M o d a l ( ) ;  
         s e t T i m e o u t ( ( )   = >   {  
                 i f   ( w i n d o w . l u c i d e )   w i n d o w . l u c i d e . c r e a t e I c o n s ( ) ;  
         } ,   1 0 0 ) ;  
 } ;  
  
 w i n d o w . c l o s e I t e m M o d a l   =   f u n c t i o n   ( )   {  
         d o c u m e n t . g e t E l e m e n t B y I d ( ' i t e m M o d a l ' ) . s t y l e . d i s p l a y   =   ' n o n e ' ;  
 } ;  
  
 w i n d o w . f i l t e r M o d a l   =   f u n c t i o n   ( t y p e ,   b t n )   {  
         c u r r e n t F i l t e r   =   t y p e ;  
  
         / /   U p d a t e   b u t t o n   s t a t e s  
         d o c u m e n t . q u e r y S e l e c t o r A l l ( ' . c a t - b t n ' ) . f o r E a c h ( b   = >   b . c l a s s L i s t . r e m o v e ( ' a c t i v e ' ) ) ;  
         i f   ( b t n )   b t n . c l a s s L i s t . a d d ( ' a c t i v e ' ) ;  
  
         p o p u l a t e I t e m M o d a l ( ) ;  
 } ;  
  
 w i n d o w . s e a r c h M o d a l   =   f u n c t i o n   ( q u e r y )   {  
         c u r r e n t S e a r c h   =   q u e r y . t o L o w e r C a s e ( ) ;  
         p o p u l a t e I t e m M o d a l ( ) ;  
 } ;  
  
 f u n c t i o n   p o p u l a t e I t e m M o d a l ( )   {  
         c o n s t   g r i d   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' p i c k e r G r i d ' ) ;  
         i f   ( ! g r i d )   r e t u r n ;  
  
         g r i d . i n n e r H T M L   =   ' ' ;  
  
         / /   C o m b i n e   a l l   i t e m s  
         c o n s t   a l l I t e m s   =   [  
                 . . . I T E M S _ D B . w e a p o n s . m a p ( i   = >   ( {   . . . i ,   c a t e g o r y :   ' w e a p o n '   } ) ) ,  
                 . . . I T E M S _ D B . a r m o r . m a p ( i   = >   ( {   . . . i ,   c a t e g o r y :   ' a r m o r '   } ) )  
         ] ;  
  
         / /   A d d   c o n s u m a b l e s   a n d   m i s c   i f   t h e y   e x i s t  
         i f   ( I T E M S _ D B . c o n s u m a b l e s )   {  
                 a l l I t e m s . p u s h ( . . . I T E M S _ D B . c o n s u m a b l e s . m a p ( i   = >   ( {   . . . i ,   c a t e g o r y :   ' c o n s u m a b l e '   } ) ) ) ;  
         }  
         i f   ( I T E M S _ D B . m i s c )   {  
                 a l l I t e m s . p u s h ( . . . I T E M S _ D B . m i s c . m a p ( i   = >   ( {   . . . i ,   c a t e g o r y :   ' m i s c '   } ) ) ) ;  
         }  
  
         / /   F i l t e r   i t e m s  
         c o n s t   f i l t e r e d   =   a l l I t e m s . f i l t e r ( i t e m   = >   {  
                 c o n s t   m a t c h e s F i l t e r   =   c u r r e n t F i l t e r   = = =   ' a l l '   | |   i t e m . c a t e g o r y   = = =   c u r r e n t F i l t e r ;  
                 c o n s t   m a t c h e s S e a r c h   =   ! c u r r e n t S e a r c h   | |  
                         i t e m . n a m e . t o L o w e r C a s e ( ) . i n c l u d e s ( c u r r e n t S e a r c h )   | |  
                         ( i t e m . p r o p s   & &   i t e m . p r o p s . t o L o w e r C a s e ( ) . i n c l u d e s ( c u r r e n t S e a r c h ) ) ;  
                 r e t u r n   m a t c h e s F i l t e r   & &   m a t c h e s S e a r c h ;  
         } ) ;  
  
         / /   R e n d e r   i t e m s  
         f i l t e r e d . f o r E a c h ( i t e m   = >   {  
                 c o n s t   c a r d   =   d o c u m e n t . c r e a t e E l e m e n t ( ' d i v ' ) ;  
                 c a r d . c l a s s N a m e   =   ' p i c k e r - i t e m - c a r d ' ;  
                 c a r d . o n c l i c k   =   ( )   = >   a d d I t e m T o I n v e n t o r y ( i t e m ) ;  
  
                 / /   I c o n   b a s e d   o n   t y p e  
                 l e t   i c o n   =   ' � x � ' ;  
                 i f   ( i t e m . c a t e g o r y   = = =   ' w e a p o n ' )   i c o n   =   ' � a � � � ' ;  
                 e l s e   i f   ( i t e m . c a t e g o r y   = = =   ' a r m o r ' )   i c o n   =   ' � x: � � � � ' ;  
                 e l s e   i f   ( i t e m . c a t e g o r y   = = =   ' c o n s u m a b l e ' )   i c o n   =   ' � x� � ' ;  
  
                 / /   S t a t   d i s p l a y  
                 l e t   s t a t T e x t   =   ' ' ;  
                 i f   ( i t e m . d m g )   s t a t T e x t   =   i t e m . d m g ;  
                 e l s e   i f   ( i t e m . a c )   s t a t T e x t   =   ` C A   $ { i t e m . a c } ` ;  
                 e l s e   i f   ( i t e m . d e f _ b o n u s )   s t a t T e x t   =   ` + $ { i t e m . d e f _ b o n u s }   C A ` ;  
  
                 c a r d . i n n e r H T M L   =   `  
                         < d i v   c l a s s = " p i c k e r - i t e m - i c o n " > $ { i c o n } < / d i v >  
                         < d i v   c l a s s = " p i c k e r - i t e m - n a m e " > $ { i t e m . n a m e } < / d i v >  
                         $ { s t a t T e x t   ?   ` < d i v   c l a s s = " p i c k e r - i t e m - s t a t " > $ { s t a t T e x t } < / d i v > `   :   ' ' }  
                         $ { i t e m . p r o p s   ?   ` < d i v   c l a s s = " p i c k e r - i t e m - d e s c " > $ { i t e m . p r o p s } < / d i v > `   :   ' ' }  
                 ` ;  
  
                 g r i d . a p p e n d C h i l d ( c a r d ) ;  
         } ) ;  
  
         i f   ( f i l t e r e d . l e n g t h   = = =   0 )   {  
                 g r i d . i n n e r H T M L   =   `  
                         < d i v   s t y l e = " g r i d - c o l u m n :   1 / - 1 ;   t e x t - a l i g n : c e n t e r ;   p a d d i n g : 3 r e m ;   c o l o r : # 6 6 6 ; " >  
                                 < i   d a t a - l u c i d e = " s e a r c h - x "   s t y l e = " w i d t h : 4 8 p x ;   h e i g h t : 4 8 p x ;   m a r g i n : 0   a u t o   1 r e m ; " > < / i >  
                                 < d i v > N e n h u m   i t e m   e n c o n t r a d o < / d i v >  
                         < / d i v >  
                 ` ;  
         }  
  
         i f   ( w i n d o w . l u c i d e )   w i n d o w . l u c i d e . c r e a t e I c o n s ( ) ;  
 }  
  
 f u n c t i o n   a d d I t e m T o I n v e n t o r y ( i t e m )   {  
         c o n s t   n e w I t e m   =   J S O N . p a r s e ( J S O N . s t r i n g i f y ( i t e m ) ) ;  
         n e w I t e m . e q u i p p e d   =   f a l s e ;  
         d e l e t e   n e w I t e m . c a t e g o r y ;   / /   R e m o v e   t e m p o r a r y   c a t e g o r y   f i e l d  
  
         c h a r D a t a . i n v e n t o r y . p u s h ( n e w I t e m ) ;  
         s a v e S t a t e ( ) ;  
         r e n d e r I n v e n t o r y ( ) ;  
  
         / /   V i s u a l   f e e d b a c k  
         c o n s t   g r i d   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' p i c k e r G r i d ' ) ;  
         i f   ( g r i d )   {  
                 c o n s t   f l a s h   =   d o c u m e n t . c r e a t e E l e m e n t ( ' d i v ' ) ;  
                 f l a s h . s t y l e . c s s T e x t   =   `  
                         p o s i t i o n :   f i x e d ;  
                         t o p :   5 0 % ;  
                         l e f t :   5 0 % ;  
                         t r a n s f o r m :   t r a n s l a t e ( - 5 0 % ,   - 5 0 % ) ;  
                         b a c k g r o u n d :   v a r ( - - a c c e n t - c y a n ) ;  
                         c o l o r :   w h i t e ;  
                         p a d d i n g :   1 r e m   2 r e m ;  
                         b o r d e r - r a d i u s :   8 p x ;  
                         f o n t - w e i g h t :   b o l d ;  
                         z - i n d e x :   3 0 0 0 ;  
                         a n i m a t i o n :   f a d e O u t   1 s   f o r w a r d s ;  
                 ` ;  
                 f l a s h . t e x t C o n t e n t   =   ` � S   $ { i t e m . n a m e }   a d i c i o n a d o ! ` ;  
                 d o c u m e n t . b o d y . a p p e n d C h i l d ( f l a s h ) ;  
  
                 s e t T i m e o u t ( ( )   = >   f l a s h . r e m o v e ( ) ,   1 0 0 0 ) ;  
         }  
 }  
  
 / /   A d d   f a d e O u t   a n i m a t i o n  
 c o n s t   s t y l e   =   d o c u m e n t . c r e a t e E l e m e n t ( ' s t y l e ' ) ;  
 s t y l e . t e x t C o n t e n t   =   `  
         @ k e y f r a m e s   f a d e O u t   {  
                 0 %   {   o p a c i t y :   1 ;   t r a n s f o r m :   t r a n s l a t e ( - 5 0 % ,   - 5 0 % )   s c a l e ( 1 ) ;   }  
                 7 0 %   {   o p a c i t y :   1 ;   t r a n s f o r m :   t r a n s l a t e ( - 5 0 % ,   - 5 0 % )   s c a l e ( 1 . 1 ) ;   }  
                 1 0 0 %   {   o p a c i t y :   0 ;   t r a n s f o r m :   t r a n s l a t e ( - 5 0 % ,   - 5 0 % )   s c a l e ( 0 . 8 ) ;   }  
         }  
 ` ;  
 d o c u m e n t . h e a d . a p p e n d C h i l d ( s t y l e ) ;  
 / /   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
 / /   S I S T E M A   D E   I N V E N T � � R I O   C O M P L E T O  
 / /   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
  
 l e t   i n v F i l t e r   =   ' a l l ' ;  
 l e t   i n v S e a r c h Q u e r y   =   ' ' ;  
 l e t   s e l e c t e d I t e m I n d e x   =   n u l l ;  
  
 / /   = = =   R E N D E R I Z A � ! � �O   D O   I N V E N T � � R I O   = = =  
 w i n d o w . r e n d e r I n v e n t o r y   =   f u n c t i o n   ( )   {  
         c o n s t   c o n t a i n e r   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' i n v e n t o r y G r i d ' ) ;  
         i f   ( ! c o n t a i n e r )   r e t u r n ;  
  
         c o n t a i n e r . i n n e r H T M L   =   ' ' ;  
  
         / /   C a l c u l a r   p e s o   t o t a l  
         l e t   t o t a l W e i g h t   =   0 ;  
         c o n s t   m a x W e i g h t   =   ( c h a r D a t a . a t t r i b u t e s ? . s t r   | |   1 0 )   *   1 5 ;  
  
         / /   F i l t r a r   i t e n s  
         c o n s t   f i l t e r e d   =   c h a r D a t a . i n v e n t o r y . f i l t e r ( i t e m   = >   {  
                 i f   ( ! i t e m )   r e t u r n   f a l s e ;  
  
                 / /   F i l t r o   d e   c a t e g o r i a  
                 c o n s t   m a t c h e s F i l t e r   =   i n v F i l t e r   = = =   ' a l l '   | |   i t e m . t y p e   = = =   i n v F i l t e r ;  
  
                 / /   F i l t r o   d e   b u s c a  
                 c o n s t   m a t c h e s S e a r c h   =   ! i n v S e a r c h Q u e r y   | |  
                         i t e m . n a m e . t o L o w e r C a s e ( ) . i n c l u d e s ( i n v S e a r c h Q u e r y . t o L o w e r C a s e ( ) )   | |  
                         ( i t e m . p r o p s   & &   i t e m . p r o p s . t o L o w e r C a s e ( ) . i n c l u d e s ( i n v S e a r c h Q u e r y . t o L o w e r C a s e ( ) ) ) ;  
  
                 r e t u r n   m a t c h e s F i l t e r   & &   m a t c h e s S e a r c h ;  
         } ) ;  
  
         / /   R e n d e r i z a r   i t e n s  
         i f   ( f i l t e r e d . l e n g t h   = = =   0 )   {  
                 c o n t a i n e r . i n n e r H T M L   =   `  
                         < d i v   s t y l e = " t e x t - a l i g n : c e n t e r ;   p a d d i n g : 3 r e m ;   c o l o r : # 6 6 6 ;   g r i d - c o l u m n :   1 / - 1 ; " >  
                                 < i   d a t a - l u c i d e = " p a c k a g e - x "   s t y l e = " w i d t h : 4 8 p x ;   h e i g h t : 4 8 p x ;   m a r g i n : 0   a u t o   1 r e m ;   d i s p l a y : b l o c k ; " > < / i >  
                                 < d i v   s t y l e = " f o n t - s i z e : 1 . 1 r e m ;   m a r g i n - b o t t o m : 0 . 5 r e m ; " > N e n h u m   i t e m   e n c o n t r a d o < / d i v >  
                                 < d i v   s t y l e = " f o n t - s i z e : 0 . 8 5 r e m ; " > A d i c i o n e   i t e n s   a o   s e u   i n v e n t � � r i o < / d i v >  
                         < / d i v >  
                 ` ;  
         }   e l s e   {  
                 f i l t e r e d . f o r E a c h ( ( i t e m ,   i d x )   = >   {  
                         c o n s t   r e a l I n d e x   =   c h a r D a t a . i n v e n t o r y . i n d e x O f ( i t e m ) ;  
                         c o n s t   w e i g h t   =   p a r s e F l o a t ( S t r i n g ( i t e m . w e i g h t   | |   ' 0 ' ) . r e p l a c e ( / [ ^ \ d . ] / g ,   ' ' ) )   | |   0 ;  
                         t o t a l W e i g h t   + =   w e i g h t ;  
  
                         c o n s t   c a r d   =   c r e a t e I n v e n t o r y C a r d ( i t e m ,   r e a l I n d e x ) ;  
                         c o n t a i n e r . a p p e n d C h i l d ( c a r d ) ;  
                 } ) ;  
         }  
  
         / /   A t u a l i z a r   c a p a c i d a d e  
         u p d a t e C a p a c i t y ( t o t a l W e i g h t ,   m a x W e i g h t ) ;  
  
         / /   A t u a l i z a r   p a p e r   d o l l  
         i f   ( t y p e o f   u p d a t e P a p e r D o l l   = = =   ' f u n c t i o n ' )   u p d a t e P a p e r D o l l ( ) ;  
  
         / /   R e i n i c i a l i z a r   � � c o n e s  
         i f   ( w i n d o w . l u c i d e )   w i n d o w . l u c i d e . c r e a t e I c o n s ( ) ;  
 } ;  
  
 / /   = = =   C R I A R   C A R D   D E   I T E M   = = =  
 f u n c t i o n   c r e a t e I n v e n t o r y C a r d ( i t e m ,   i n d e x )   {  
         c o n s t   c a r d   =   d o c u m e n t . c r e a t e E l e m e n t ( ' d i v ' ) ;  
         c a r d . c l a s s N a m e   =   ' i n v - i t e m - c a r d ' ;  
         i f   ( i t e m . e q u i p p e d )   c a r d . c l a s s L i s t . a d d ( ' e q u i p p e d ' ) ;  
         i f   ( s e l e c t e d I t e m I n d e x   = = =   i n d e x )   c a r d . c l a s s L i s t . a d d ( ' s e l e c t e d ' ) ;  
  
         / /   � � c o n e   b a s e a d o   n o   t i p o  
         l e t   i c o n   =   ' b o x ' ;  
         i f   ( i t e m . t y p e   = = =   ' w e a p o n ' )   i c o n   =   ' s w o r d ' ;  
         e l s e   i f   ( i t e m . t y p e   = = =   ' a r m o r ' )   i c o n   =   ' s h i e l d ' ;  
         e l s e   i f   ( i t e m . t y p e   = = =   ' c o n s u m a b l e ' )   i c o n   =   ' f l a s k - c o n i c a l ' ;  
  
         / /   E s t a t � � s t i c a   p r i n c i p a l  
         l e t   m a i n S t a t   =   ' ' ;  
         i f   ( i t e m . d m g )   m a i n S t a t   =   i t e m . d m g ;  
         e l s e   i f   ( i t e m . a c )   m a i n S t a t   =   ` C A   $ { i t e m . a c } ` ;  
         e l s e   i f   ( i t e m . d e f _ b o n u s )   m a i n S t a t   =   ` + $ { i t e m . d e f _ b o n u s }   C A ` ;  
  
         c a r d . i n n e r H T M L   =   `  
                 < d i v   c l a s s = " i n v - h e a d e r "   o n c l i c k = " s e l e c t I t e m ( $ { i n d e x } ) " >  
                         < d i v   s t y l e = " d i s p l a y : f l e x ;   a l i g n - i t e m s : c e n t e r ;   g a p : 1 0 p x ;   f l e x : 1 ; " >  
                                 < d i v   c l a s s = " i n v - r o w - i c o n " >  
                                         < i   d a t a - l u c i d e = " $ { i c o n } "   s t y l e = " w i d t h : 2 0 p x ; " > < / i >  
                                 < / d i v >  
                                 < d i v   s t y l e = " f l e x : 1 ; " >  
                                         < d i v   c l a s s = " i n v - n a m e "   s t y l e = " $ { i t e m . e q u i p p e d   ?   ' c o l o r : v a r ( - - a c c e n t - c y a n ) ;   f o n t - w e i g h t : b o l d ; '   :   ' ' } " > $ { i t e m . n a m e } < / d i v >  
                                         < d i v   c l a s s = " i n v - m i n i - s t a t " > $ { m a i n S t a t   | |   ' I t e m ' }   � � �   $ { i t e m . w e i g h t   | |   ' 0   k g ' } < / d i v >  
                                 < / d i v >  
                         < / d i v >  
                         < d i v   c l a s s = " i n v - t a g s " >  
                                 $ { i t e m . e q u i p p e d   ?   ' < s p a n   c l a s s = " i n v - t a g   t a g - r a r e " > E Q U I P A D O < / s p a n > '   :   ' ' }  
                         < / d i v >  
                 < / d i v >  
                 < d i v   c l a s s = " i n v - d e t a i l s "   i d = " i n v - d e t - $ { i n d e x } " >  
                         < d i v   s t y l e = " m a r g i n - b o t t o m : 1 0 p x ;   c o l o r : # a a a ;   f o n t - s t y l e : i t a l i c ; " > $ { i t e m . p r o p s   | |   ' S e m   p r o p r i e d a d e s ' } < / d i v >  
                         < d i v   s t y l e = " m a r g i n - b o t t o m : 1 5 p x ;   c o l o r : # c c c ; " > $ { i t e m . d e s c   | |   ' S e m   d e s c r i � � � � o ' } < / d i v >  
                         < d i v   s t y l e = " d i s p l a y : f l e x ;   g a p : 8 p x ;   f l e x - w r a p : w r a p ; " >  
                                 $ { i t e m . t y p e   ! = =   ' c o n s u m a b l e '   ?   `  
                                         < b u t t o n   c l a s s = " i n v - a c t i o n - b t n   $ { i t e m . e q u i p p e d   ?   ' e q u i p p e d '   :   ' ' } "   o n c l i c k = " e v e n t . s t o p P r o p a g a t i o n ( ) ;   t o g g l e E q u i p ( $ { i n d e x } ) " >  
                                                 < i   d a t a - l u c i d e = " $ { i t e m . e q u i p p e d   ?   ' x - c i r c l e '   :   ' c h e c k - c i r c l e ' } "   s t y l e = " w i d t h : 1 4 p x ; " > < / i >  
                                                 $ { i t e m . e q u i p p e d   ?   ' D e s e q u i p a r '   :   ' E q u i p a r ' }  
                                         < / b u t t o n >  
                                 `   :   ' ' }  
                                 < b u t t o n   c l a s s = " i n v - a c t i o n - b t n "   o n c l i c k = " e v e n t . s t o p P r o p a g a t i o n ( ) ;   e d i t I t e m ( $ { i n d e x } ) " >  
                                         < i   d a t a - l u c i d e = " p e n c i l "   s t y l e = " w i d t h : 1 4 p x ; " > < / i >   E d i t a r  
                                 < / b u t t o n >  
                                 < b u t t o n   c l a s s = " i n v - a c t i o n - b t n   d a n g e r "   o n c l i c k = " e v e n t . s t o p P r o p a g a t i o n ( ) ;   r e m o v e I n v I t e m ( $ { i n d e x } ) " >  
                                         < i   d a t a - l u c i d e = " t r a s h - 2 "   s t y l e = " w i d t h : 1 4 p x ; " > < / i >   R e m o v e r  
                                 < / b u t t o n >  
                         < / d i v >  
                 < / d i v >  
         ` ;  
  
         r e t u r n   c a r d ;  
 }  
  
 / /   = = =   S E L E C I O N A R   I T E M   = = =  
 w i n d o w . s e l e c t I t e m   =   f u n c t i o n   ( i n d e x )   {  
         / /   T o g g l e   d e t a i l s  
         c o n s t   d e t a i l s   =   d o c u m e n t . g e t E l e m e n t B y I d ( ` i n v - d e t - $ { i n d e x } ` ) ;  
         i f   ( d e t a i l s )   {  
                 d e t a i l s . c l a s s L i s t . t o g g l e ( ' e x p a n d e d ' ) ;  
         }  
  
         / /   U p d a t e   s e l e c t i o n  
         s e l e c t e d I t e m I n d e x   =   s e l e c t e d I t e m I n d e x   = = =   i n d e x   ?   n u l l   :   i n d e x ;  
  
         / /   S h o w   i t e m   d e t a i l s   i n   p a n e l  
         s h o w I t e m D e t a i l s ( i n d e x ) ;  
 } ;  
  
 / /   = = =   M O S T R A R   D E T A L H E S   N O   P A I N E L   = = =  
 f u n c t i o n   s h o w I t e m D e t a i l s ( i n d e x )   {  
         c o n s t   i t e m   =   c h a r D a t a . i n v e n t o r y [ i n d e x ] ;  
         i f   ( ! i t e m )   r e t u r n ;  
  
         c o n s t   c o n t a i n e r   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' i t e m D e t a i l C o n t a i n e r ' ) ;  
         c o n s t   e m p t y S t a t e   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' i t e m D e t a i l E m p t y ' ) ;  
  
         i f   ( ! c o n t a i n e r   | |   ! e m p t y S t a t e )   r e t u r n ;  
  
         e m p t y S t a t e . s t y l e . d i s p l a y   =   ' n o n e ' ;  
         c o n t a i n e r . s t y l e . d i s p l a y   =   ' f l e x ' ;  
  
         l e t   i c o n   =   ' � x � ' ;  
         i f   ( i t e m . t y p e   = = =   ' w e a p o n ' )   i c o n   =   ' � a � � � ' ;  
         e l s e   i f   ( i t e m . t y p e   = = =   ' a r m o r ' )   i c o n   =   ' � x: � � � � ' ;  
         e l s e   i f   ( i t e m . t y p e   = = =   ' c o n s u m a b l e ' )   i c o n   =   ' � x� � ' ;  
  
         c o n t a i n e r . i n n e r H T M L   =   `  
                 < d i v   s t y l e = " t e x t - a l i g n : c e n t e r ;   p a d d i n g : 2 r e m ;   b o r d e r - b o t t o m : 1 p x   s o l i d   # 2 2 2 ; " >  
                         < d i v   s t y l e = " f o n t - s i z e : 3 r e m ;   m a r g i n - b o t t o m : 1 r e m ; " > $ { i c o n } < / d i v >  
                         < h 3   s t y l e = " m a r g i n : 0   0   0 . 5 r e m   0 ;   f o n t - f a m i l y : v a r ( - - f o n t - d i s p l a y ) ;   c o l o r : w h i t e ; " > $ { i t e m . n a m e } < / h 3 >  
                         < d i v   s t y l e = " c o l o r : v a r ( - - a c c e n t - c y a n ) ;   f o n t - w e i g h t : b o l d ;   f o n t - s i z e : 1 . 1 r e m ; " >  
                                 $ { i t e m . d m g   | |   i t e m . a c   | |   ( i t e m . d e f _ b o n u s   ?   ` + $ { i t e m . d e f _ b o n u s }   C A `   :   ' I t e m ' ) }  
                         < / d i v >  
                 < / d i v >  
                 < d i v   s t y l e = " p a d d i n g : 1 . 5 r e m ;   f l e x : 1 ;   o v e r f l o w - y : a u t o ; " >  
                         < d i v   s t y l e = " m a r g i n - b o t t o m : 1 r e m ; " >  
                                 < d i v   s t y l e = " f o n t - s i z e : 0 . 7 r e m ;   c o l o r : # 6 6 6 ;   t e x t - t r a n s f o r m : u p p e r c a s e ;   m a r g i n - b o t t o m : 0 . 5 r e m ; " > P r o p r i e d a d e s < / d i v >  
                                 < d i v   s t y l e = " c o l o r : # c c c ; " > $ { i t e m . p r o p s   | |   ' N e n h u m a ' } < / d i v >  
                         < / d i v >  
                         < d i v   s t y l e = " m a r g i n - b o t t o m : 1 r e m ; " >  
                                 < d i v   s t y l e = " f o n t - s i z e : 0 . 7 r e m ;   c o l o r : # 6 6 6 ;   t e x t - t r a n s f o r m : u p p e r c a s e ;   m a r g i n - b o t t o m : 0 . 5 r e m ; " > D e s c r i � � � � o < / d i v >  
                                 < d i v   s t y l e = " c o l o r : # c c c ;   l i n e - h e i g h t : 1 . 5 ; " > $ { i t e m . d e s c   | |   ' S e m   d e s c r i � � � � o ' } < / d i v >  
                         < / d i v >  
                         < d i v   s t y l e = " d i s p l a y : g r i d ;   g r i d - t e m p l a t e - c o l u m n s : 1 f r   1 f r ;   g a p : 1 r e m ;   m a r g i n - t o p : 1 . 5 r e m ; " >  
                                 < d i v >  
                                         < d i v   s t y l e = " f o n t - s i z e : 0 . 7 r e m ;   c o l o r : # 6 6 6 ; " > P e s o < / d i v >  
                                         < d i v   s t y l e = " c o l o r : w h i t e ;   f o n t - w e i g h t : b o l d ; " > $ { i t e m . w e i g h t   | |   ' 0   k g ' } < / d i v >  
                                 < / d i v >  
                                 < d i v >  
                                         < d i v   s t y l e = " f o n t - s i z e : 0 . 7 r e m ;   c o l o r : # 6 6 6 ; " > P r e � � o < / d i v >  
                                         < d i v   s t y l e = " c o l o r : w h i t e ;   f o n t - w e i g h t : b o l d ; " > $ { i t e m . p r i c e   | |   ' N / A ' } < / d i v >  
                                 < / d i v >  
                         < / d i v >  
                 < / d i v >  
         ` ;  
 }  
  
 / /   = = =   E Q U I P A R / D E S E Q U I P A R   = = =  
 w i n d o w . t o g g l e E q u i p   =   f u n c t i o n   ( i n d e x )   {  
         c o n s t   i t e m   =   c h a r D a t a . i n v e n t o r y [ i n d e x ] ;  
         i f   ( ! i t e m )   r e t u r n ;  
  
         / /   D e s e q u i p a r   o u t r o s   i t e n s   d o   m e s m o   s l o t   s e   n e c e s s � � r i o  
         i f   ( ! i t e m . e q u i p p e d   & &   i t e m . t y p e   = = =   ' w e a p o n ' )   {  
                 c h a r D a t a . i n v e n t o r y . f o r E a c h ( ( i ,   i d x )   = >   {  
                         i f   ( i   & &   i . t y p e   = = =   ' w e a p o n '   & &   i . e q u i p p e d   & &   i d x   ! = =   i n d e x )   {  
                                 i . e q u i p p e d   =   f a l s e ;  
                         }  
                 } ) ;  
         }  
  
         i t e m . e q u i p p e d   =   ! i t e m . e q u i p p e d ;  
         s a v e S t a t e ( ) ;  
         r e n d e r I n v e n t o r y ( ) ;  
         c a l c D e f e n s e ( ) ;  
         l o a d B r e a t h i n g D a t a ( ) ;  
 } ;  
  
 / /   = = =   R E M O V E R   I T E M   = = =  
 w i n d o w . r e m o v e I n v I t e m   =   f u n c t i o n   ( i n d e x )   {  
         c o n s t   i t e m   =   c h a r D a t a . i n v e n t o r y [ i n d e x ] ;  
         i f   ( ! i t e m )   r e t u r n ;  
  
         i f   ( c o n f i r m ( ` R e m o v e r   " $ { i t e m . n a m e } "   d o   i n v e n t � � r i o ? ` ) )   {  
                 c h a r D a t a . i n v e n t o r y . s p l i c e ( i n d e x ,   1 ) ;  
                 s e l e c t e d I t e m I n d e x   =   n u l l ;  
  
                 / /   L i m p a r   p a i n e l   d e   d e t a l h e s  
                 c o n s t   c o n t a i n e r   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' i t e m D e t a i l C o n t a i n e r ' ) ;  
                 c o n s t   e m p t y S t a t e   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' i t e m D e t a i l E m p t y ' ) ;  
                 i f   ( c o n t a i n e r   & &   e m p t y S t a t e )   {  
                         c o n t a i n e r . s t y l e . d i s p l a y   =   ' n o n e ' ;  
                         e m p t y S t a t e . s t y l e . d i s p l a y   =   ' f l e x ' ;  
                 }  
  
                 s a v e S t a t e ( ) ;  
                 r e n d e r I n v e n t o r y ( ) ;  
                 c a l c D e f e n s e ( ) ;  
                 l o a d B r e a t h i n g D a t a ( ) ;  
         }  
 } ;  
  
 / /   = = =   E D I T A R   I T E M   = = =  
 w i n d o w . e d i t I t e m   =   f u n c t i o n   ( i n d e x )   {  
         c o n s t   i t e m   =   c h a r D a t a . i n v e n t o r y [ i n d e x ] ;  
         i f   ( ! i t e m )   r e t u r n ;  
  
         c o n s t   n e w N a m e   =   p r o m p t ( ' N o m e   d o   i t e m : ' ,   i t e m . n a m e ) ;  
         i f   ( n e w N a m e   = = =   n u l l )   r e t u r n ;  
  
         i f   ( n e w N a m e . t r i m ( ) )   i t e m . n a m e   =   n e w N a m e . t r i m ( ) ;  
  
         c o n s t   n e w W e i g h t   =   p r o m p t ( ' P e s o   ( e x :   1 . 5   k g ) : ' ,   i t e m . w e i g h t   | |   ' 0   k g ' ) ;  
         i f   ( n e w W e i g h t   ! = =   n u l l   & &   n e w W e i g h t . t r i m ( ) )   i t e m . w e i g h t   =   n e w W e i g h t . t r i m ( ) ;  
  
         i f   ( i t e m . t y p e   = = =   ' w e a p o n ' )   {  
                 c o n s t   n e w D m g   =   p r o m p t ( ' D a n o   ( e x :   1 d 6 + 2 ) : ' ,   i t e m . d m g   | |   ' ' ) ;  
                 i f   ( n e w D m g   ! = =   n u l l   & &   n e w D m g . t r i m ( ) )   i t e m . d m g   =   n e w D m g . t r i m ( ) ;  
         }   e l s e   i f   ( i t e m . t y p e   = = =   ' a r m o r ' )   {  
                 c o n s t   n e w A C   =   p r o m p t ( ' C l a s s e   d e   A r m a d u r a : ' ,   i t e m . a c   | |   ' ' ) ;  
                 i f   ( n e w A C   ! = =   n u l l   & &   n e w A C . t r i m ( ) )   i t e m . a c   =   n e w A C . t r i m ( ) ;  
         }  
  
         c o n s t   n e w P r o p s   =   p r o m p t ( ' P r o p r i e d a d e s : ' ,   i t e m . p r o p s   | |   ' ' ) ;  
         i f   ( n e w P r o p s   ! = =   n u l l )   i t e m . p r o p s   =   n e w P r o p s . t r i m ( ) ;  
  
         s a v e S t a t e ( ) ;  
         r e n d e r I n v e n t o r y ( ) ;  
 } ;  
  
 / /   = = =   F I L T R O S   = = =  
 w i n d o w . s e t F i l t e r   =   f u n c t i o n   ( f i l t e r ,   b t n )   {  
         i n v F i l t e r   =   f i l t e r ;  
  
         / /   A t u a l i z a r   b o t � � e s  
         d o c u m e n t . q u e r y S e l e c t o r A l l ( ' . f i l t e r - t a g ' ) . f o r E a c h ( b   = >   b . c l a s s L i s t . r e m o v e ( ' a c t i v e ' ) ) ;  
         i f   ( b t n )   b t n . c l a s s L i s t . a d d ( ' a c t i v e ' ) ;  
  
         r e n d e r I n v e n t o r y ( ) ;  
 } ;  
  
 w i n d o w . f i l t e r I n v e n t o r y   =   f u n c t i o n   ( q u e r y )   {  
         i n v S e a r c h Q u e r y   =   q u e r y ;  
         r e n d e r I n v e n t o r y ( ) ;  
 } ;  
  
 / /   = = =   A T U A L I Z A R   C A P A C I D A D E   = = =  
 f u n c t i o n   u p d a t e C a p a c i t y ( c u r r e n t ,   m a x )   {  
         c o n s t   t e x t E l   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' c a p a c i t y T e x t ' ) ;  
         c o n s t   b a r E l   =   d o c u m e n t . g e t E l e m e n t B y I d ( ' c a p a c i t y B a r ' ) ;  
  
         i f   ( t e x t E l )   {  
                 t e x t E l . t e x t C o n t e n t   =   ` $ { c u r r e n t . t o F i x e d ( 1 ) }   /   $ { m a x }   k g ` ;  
                 i f   ( c u r r e n t   >   m a x )   {  
                         t e x t E l . s t y l e . c o l o r   =   ' v a r ( - - a c c e n t - r e d ) ' ;  
                 }   e l s e   {  
                         t e x t E l . s t y l e . c o l o r   =   ' # 6 6 6 ' ;  
                 }  
         }  
  
         i f   ( b a r E l )   {  
                 c o n s t   p e r c e n t   =   M a t h . m i n ( ( c u r r e n t   /   m a x )   *   1 0 0 ,   1 0 0 ) ;  
                 b a r E l . s t y l e . w i d t h   =   p e r c e n t   +   ' % ' ;  
  
                 i f   ( p e r c e n t   >   9 0 )   {  
                         b a r E l . s t y l e . b a c k g r o u n d   =   ' l i n e a r - g r a d i e n t ( 9 0 d e g ,   # d 9 0 4 2 9 ,   # e f 2 3 3 c ) ' ;  
                 }   e l s e   i f   ( p e r c e n t   >   7 0 )   {  
                         b a r E l . s t y l e . b a c k g r o u n d   =   ' l i n e a r - g r a d i e n t ( 9 0 d e g ,   # f f a a 0 0 ,   # f f 8 8 0 0 ) ' ;  
                 }   e l s e   {  
                         b a r E l . s t y l e . b a c k g r o u n d   =   ' l i n e a r - g r a d i e n t ( 9 0 d e g ,   # 5 5 5 ,   # 8 8 8 ) ' ;  
                 }  
         }  
 }  
 