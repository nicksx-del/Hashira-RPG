/* ONI DASHBOARD JS - Refactored based on Hunter Dashboard */

let charData = {};
let combatState = { block: false, dodge: false };

const BLACK_MARKET_PROFILE_KEY = 'demonSlayerBlackMarketProfile';
const BLACK_MARKET_DAILY_KEY = 'demonSlayerBlackMarketDaily';
const SUBSCRIPTION_KEY = 'demonSlayerSubscription';
const BLACK_MARKET_TEST_MODE_KEY = 'demonSlayerBlackMarketTestInfinite';
const MARKET_VERSION = 1;

let blackMarketProfile = null;
let blackMarketDaily = null;
let diceLabSelectedStyleId = 'dice_coal';
let diceLabBound = false;

function normalizeLegacyProficiencies(raw) {
    if (Array.isArray(raw)) {
        return Array.from(new Set(raw.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim())));
    }
    if (!raw || typeof raw !== 'object') return [];

    const normalized = [];
    for (const [name, value] of Object.entries(raw)) {
        if (!name || typeof name !== 'string') continue;
        if (typeof value === 'boolean') {
            if (value) normalized.push(name);
            continue;
        }
        if (value && typeof value === 'object') {
            if (value.trained === true || Number(value.customBonus || 0) !== 0) {
                normalized.push(name);
            }
            continue;
        }
        if (value) normalized.push(name);
    }
    return Array.from(new Set(normalized));
}

// SKILL MAP (D&D 5e style)
const SKILL_MAP = {
    str: ['Atletismo'],
    dex: ['Acrobacia', 'Furtividade', 'Prestidigitação'],
    con: [],
    int: ['Arcanismo', 'História', 'Investigação', 'Natureza', 'Religião'],
    wis: ['Adestrar Animais', 'Intuição', 'Medicina', 'Percepção', 'Sobrevivência'],
    cha: ['Enganação', 'Intimidação', 'Atuação', 'Persuasão']
};

const COSMETIC_CATALOG = [
    { id: 'aura_none', name: 'Aura Nula', slot: 'aura', value: 'none', rarity: 'Base', description: 'Sem assinatura energetica aparente.', premiumOnly: false, starter: true },
    { id: 'frame_obsidian', name: 'Moldura Obsidiana', slot: 'frame', value: 'obsidian', rarity: 'Base', description: 'Uma moldura discreta e ancestral.', premiumOnly: false, starter: true },
    { id: 'title_exiled', name: 'Titulo: Exilado', slot: 'title', value: 'Exilado', rarity: 'Base', description: 'Marca de um Oni recem-desperto.', premiumOnly: false, starter: true },

    { id: 'aura_wisteria', name: 'Aura de Wisteria Profana', slot: 'aura', value: 'wisteria', rarity: 'Raro', description: 'Um brilho purpura que desafia os Cacadores.', premiumOnly: true, price: 18, currency: 'scarlet' },
    { id: 'aura_crimson', name: 'Aura Carmesim Voraz', slot: 'aura', value: 'crimson', rarity: 'Epico', description: 'Sangue condensado envolvendo seu corpo.', premiumOnly: true, price: 24, currency: 'scarlet' },
    { id: 'aura_moon', name: 'Aura da Lua Partida', slot: 'aura', value: 'moon', rarity: 'Epico', description: 'Reflexos prateados de uma noite sem fim.', premiumOnly: true, price: 22, currency: 'scarlet' },
    { id: 'aura_void', name: 'Aura do Vazio', slot: 'aura', value: 'void', rarity: 'Lendario', description: 'A luz e devorada ao seu redor.', premiumOnly: true, price: 30, currency: 'scarlet' },

    { id: 'frame_blood', name: 'Moldura Sangue Coagulado', slot: 'frame', value: 'blood', rarity: 'Raro', description: 'Tracos cortantes em sangue seco.', premiumOnly: true, price: 16, currency: 'scarlet' },
    { id: 'frame_nichirin', name: 'Moldura Nichirin Corrompida', slot: 'frame', value: 'nichirin', rarity: 'Epico', description: 'Fragmentos de lamina roubada dos Cacadores.', premiumOnly: true, price: 21, currency: 'scarlet' },
    { id: 'frame_thorns', name: 'Moldura de Espinhos Noturnos', slot: 'frame', value: 'thorns', rarity: 'Epico', description: 'Espinhos demoniacos pulsando no retrato.', premiumOnly: true, price: 19, currency: 'scarlet' },

    { id: 'title_moon_hunter', name: 'Titulo: Cacador da Lua', slot: 'title', value: 'Cacador da Lua', rarity: 'Raro', description: 'Concedido aos estrategistas da madrugada.', premiumOnly: true, price: 14, currency: 'scarlet' },
    { id: 'title_forgotten_fang', name: 'Titulo: Presa Esquecida', slot: 'title', value: 'Presa Esquecida', rarity: 'Raro', description: 'Sussurros de uma linhagem esquecida.', premiumOnly: true, price: 12, currency: 'scarlet' },
    { id: 'title_black_lotus', name: 'Titulo: Lotus Negra', slot: 'title', value: 'Lotus Negra', rarity: 'Lendario', description: 'Marca dos Onis que superaram o proprio instinto.', premiumOnly: true, price: 26, currency: 'scarlet' }
];

const MARKET_UTILITY_POOL = [
    {
        id: 'util_smuggler_notes',
        name: 'Notas do Contrabandista',
        rarity: 'Comum',
        description: 'Pacote de registros e favores que rende recursos imediatos.',
        premiumOnly: false,
        currency: 'yen',
        price: 450,
        reward: { yen: 250, scarlet: 0 }
    },
    {
        id: 'util_blood_exchange',
        name: 'Cambio Sanguineo',
        rarity: 'Raro',
        description: 'Converte riqueza comum em selos premium.',
        premiumOnly: false,
        currency: 'yen',
        price: 880,
        reward: { yen: 0, scarlet: 4 }
    },
    {
        id: 'util_whisper_pass',
        name: 'Passe dos Sussurros',
        rarity: 'Raro',
        description: 'Pacote discreto de reputacao e moeda para futuras compras.',
        premiumOnly: false,
        currency: 'yen',
        price: 620,
        reward: { yen: 180, scarlet: 2 }
    }
];

const MARKET_EVENT_POOL = [
    {
        id: 'event_new_moon_cache',
        name: 'Bau da Lua Nova',
        rarity: 'Evento',
        description: 'Oferta gratuita do dia para manter seu progresso.',
        premiumOnly: false,
        currency: 'yen',
        price: 0,
        reward: { yen: 260, scarlet: 0 }
    },
    {
        id: 'event_shadow_tithe',
        name: 'Dizimo das Sombras',
        rarity: 'Evento',
        description: 'Coleta gratuita de recursos oferecida por aliados anonimos.',
        premiumOnly: false,
        currency: 'yen',
        price: 0,
        reward: { yen: 180, scarlet: 1 }
    }
];

const FREE_CONTRACT_TEMPLATES = [
    {
        id: 'contract_free_spend_pe',
        name: 'Ritual de Exaustao',
        description: 'Gaste energia demoniaca para provar controle sobre o proprio poder.',
        goalType: 'spendPE',
        target: 4,
        reward: { yen: 420, scarlet: 0 }
    },
    {
        id: 'contract_free_regen',
        name: 'Carne que Renasce',
        description: 'Regenerar ferimentos fortalece sua presenca no mercado.',
        goalType: 'regenHP',
        target: 8,
        reward: { yen: 380, scarlet: 1 }
    },
    {
        id: 'contract_free_rolls',
        name: 'Ecos de Cacada',
        description: 'Realize rolagens para movimentar rumores e contratos.',
        goalType: 'rolls',
        target: 6,
        reward: { yen: 360, scarlet: 1 }
    }
];

const PREMIUM_CONTRACT_TEMPLATES = [
    {
        id: 'contract_premium_spend',
        name: 'Juramento da Lua de Sangue',
        description: 'Contrato premium de alto risco. Gaste energia em multiplos rituais.',
        goalType: 'spendPE',
        target: 8,
        premiumOnly: true,
        reward: { yen: 700, scarlet: 6, cosmeticId: 'title_black_lotus' }
    },
    {
        id: 'contract_premium_regen',
        name: 'Banquete Silencioso',
        description: 'Regeneracoes sucessivas impressionam os comerciantes de elite.',
        goalType: 'regenHP',
        target: 18,
        premiumOnly: true,
        reward: { yen: 650, scarlet: 5, cosmeticId: 'frame_nichirin' }
    },
    {
        id: 'contract_premium_rolls',
        name: 'Sinfonia da Predacao',
        description: 'Acumule rolagens em combate e pericias para fechar pactos raros.',
        goalType: 'rolls',
        target: 12,
        premiumOnly: true,
        reward: { yen: 600, scarlet: 5, cosmeticId: 'aura_moon', diceStyleId: 'dice_upper_moon' }
    }
];

const DICE_STYLE_MARKET_CATALOG = [
    { diceStyleId: 'dice_coal', name: 'Carvao', rarity: 'Comum', premiumOnly: false, starter: true, description: 'Estilo principal com assinatura de carvao e brasas.' },
    { diceStyleId: 'dice_upper_moon', name: 'Lua Superior', rarity: 'Lendario', premiumOnly: false, starter: true, description: 'Inspirado na katana organica do Upper One: olhos, veias e luas crescentes.' }
];

function getSupportedDiceStyleIdsSet() {
    return new Set(DICE_STYLE_MARKET_CATALOG.map(style => style.diceStyleId));
}

function sanitizeOwnedDiceStyleIds(ids) {
    const supported = getSupportedDiceStyleIdsSet();
    if (!Array.isArray(ids)) return [];
    return Array.from(new Set(ids.filter(id => supported.has(id))));
}

function resolveActiveDiceStyleId(activeId, ownedIds) {
    if (ownedIds.includes(activeId)) return activeId;
    return ownedIds[0] || 'dice_coal';
}

// --- DATA MANAGEMENT ---
function saveChar() {
    localStorage.setItem('demonSlayerChar', JSON.stringify(charData));

    // Sync with Save Slots
    try {
        let allChars = JSON.parse(localStorage.getItem('demonSlayerSaveSlots') || '[]');
        let index = -1;

        // Try to find by ID
        if (charData.id) {
            index = allChars.findIndex(c => c.id === charData.id);
        } else {
            // Fallback for older characters without ID
            index = allChars.findIndex(c => c.name === charData.name && c.race === 'Oni');
            if (index !== -1) charData.id = allChars[index].id || Date.now().toString();
        }

        if (index !== -1) {
            allChars[index] = charData;
            localStorage.setItem('demonSlayerSaveSlots', JSON.stringify(allChars));
        }
    } catch (e) {
        console.error("Error syncing save slots:", e);
    }
}

function loadChar() {
    const raw = localStorage.getItem('demonSlayerChar');
    if (raw) {
        charData = JSON.parse(raw);

        if (!charData.id) {
            charData.id = Date.now().toString();
            localStorage.setItem('demonSlayerChar', JSON.stringify(charData));
        }
        if (!charData.stats) {
            charData.stats = charData.attributes || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        }
        if (!charData.level) charData.level = 1;
        charData.maxPE = charData.level;
        if (!charData.hp) charData.hp = 20;
        if (!Array.isArray(charData.attacks)) charData.attacks = [];
        if (!Array.isArray(charData.inventory)) charData.inventory = [];
    } else {
        charData = {
            id: Date.now().toString(),
            name: "Oni",
            level: 1,
            stats: { str: 14, dex: 12, con: 14, int: 10, wis: 10, cha: 8 },
            hp: 20,
            maxPE: 1, // Start at 1 for Level 1
            attacks: [],
            inventory: []
        };
    }

    initializeOniExtensions();
    initializeBlackMarketState();

    window.charData = charData; // Global for inventory modules
}

function initDashboard() {
    try {
        loadChar();
        if (window.DiceCosmetics && typeof window.DiceCosmetics.init === 'function') {
            window.DiceCosmetics.init();
            syncDiceCosmeticsFromProfile();
        }

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

        safeRender('updateVitalsUI', () => updateVitalsUI());
        safeRender('renderAttributes', () => renderAttributes());
        safeRender('renderProficiencies', () => renderProficiencies());
        safeRender('renderAttacks', () => renderAttacks());
        safeRender('setupDiceLab', () => setupDiceLab());

        // Inventory
        if (typeof renderInventory === 'function') {
            safeRender('renderInventory', () => renderInventory());
        }

        if (window.lucide) lucide.createIcons();

        // update Path UI
        if (document.getElementById('oniPathSelect')) document.getElementById('oniPathSelect').value = charData.oniPath || "";
        // update Instinct UI
        if (document.getElementById('dispInstinctDC')) document.getElementById('dispInstinctDC').innerText = charData.instinctDC || 12;
        // update Devoured UI
        if (document.getElementById('dispDevoured')) document.getElementById('dispDevoured').innerText = charData.devouredCount || 0;

        // update Particularities UI
        safeRender('renderParticularities', () => renderParticularities());
        if (document.getElementById('sideRankDisplay')) {
            document.getElementById('sideRankDisplay').innerText = charData.rank || 'Oni Inferior';
        }

        safeRender('applyEquippedCosmetics', () => applyEquippedCosmetics());
        safeRender('renderBlackMarket', () => renderBlackMarket());
        if (isInfiniteMoneyTestMode()) {
            safeRender('showSection(store)', () => showSection('store'));
        }
        saveChar();

    } catch (e) {
        alert("Erro no Dashboard: " + e.message);
        console.error(e);
        safeRender('fallbackRenderBlackMarket', () => {
            renderBlackMarket();
            showSection('store');
        });
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
    const before = curr;

    if (mode === 'add') curr += val;
    else curr -= val;

    if (curr > charData.maxPE) curr = charData.maxPE;
    if (curr < 0) curr = 0;

    charData.currentPE = curr;
    saveChar();
    updateVitalsUI();

    if (mode === 'sub') {
        const spent = Math.max(0, before - curr);
        if (spent > 0) trackBlackMarketProgress('spendPE', spent);
    }
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
    trackBlackMarketProgress('regenHP', totalRegen);

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

function showCosmeticRoll(visualData, onComplete) {
    if (window.DiceCosmetics && typeof window.DiceCosmetics.showRoll === 'function') {
        window.DiceCosmetics.showRoll(visualData, { onComplete });
        return true;
    }
    return false;
}

function rollAttribute(attr, mod) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + mod;
    trackBlackMarketProgress('rolls', 1);

    const expr = `d20 (${roll}) ${mod >= 0 ? '+' : ''} ${mod}`;
    const visualShown = showCosmeticRoll({
        type: 'attribute',
        label: `Atributo ${attr.toUpperCase()}`,
        expr,
        result: total,
        rawRoll: roll,
        isCrit: roll === 20,
        isFail: roll === 1
    }, () => showToast(`Rolagem de ${attr}: [${roll}] + ${mod} = ${total}`, roll === 20 ? 'success' : 'info'));

    if (!visualShown) {
        showToast(`Rolagem de ${attr}: [${roll}] + ${mod} = ${total}`, roll === 20 ? 'success' : 'info');
    }
}

function rollSkill(skill, mod) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + mod;
    trackBlackMarketProgress('rolls', 1);

    const expr = `d20 (${roll}) ${mod >= 0 ? '+' : ''} ${mod}`;
    const visualShown = showCosmeticRoll({
        type: 'skill',
        label: skill,
        expr,
        result: total,
        rawRoll: roll,
        isCrit: roll === 20,
        isFail: roll === 1
    }, () => showToast(`${skill}: [${roll}] + ${mod} = ${total}`, roll === 20 ? 'success' : 'info'));

    if (!visualShown) {
        showToast(`${skill}: [${roll}] + ${mod} = ${total}`, roll === 20 ? 'success' : 'info');
    }
}

function rollAttackFromCard(attackId) {
    const atk = (charData.attacks || []).find(a => a.id === attackId);
    if (!atk) return;

    const strValue = (charData.stats && charData.stats.str) ? charData.stats.str : 10;
    const strMod = Math.floor((strValue - 10) / 2);
    const proficiency = 2;
    const hitRoll = Math.floor(Math.random() * 20) + 1;
    const hitTotal = hitRoll + strMod + proficiency;
    const damageResult = rollDiceExpression(atk.damage || '1d4');

    trackBlackMarketProgress('rolls', 1);
    const infoMsg = `${atk.name}: Acerto [${hitRoll}] + ${strMod + proficiency} = ${hitTotal} | Dano ${damageResult.breakdown} = ${damageResult.total}`;
    const visualShown = showCosmeticRoll({
        type: 'attack',
        label: atk.name,
        expr: `Acerto d20: ${hitRoll} (+${strMod + proficiency}) | ${damageResult.breakdown}`,
        result: damageResult.total,
        rawRoll: hitRoll,
        isCrit: hitRoll === 20,
        isFail: hitRoll === 1
    }, () => showToast(infoMsg, hitRoll === 20 ? 'success' : 'info'));

    if (!visualShown) {
        showToast(infoMsg, hitRoll === 20 ? 'success' : 'info');
    }
}

function rollDiceExpression(expression) {
    const cleaned = String(expression || '').replace(/\s+/g, '');
    if (!cleaned) return { total: 0, breakdown: '0' };

    const parts = cleaned.match(/[+-]?[^+-]+/g) || [];
    let total = 0;
    let breakdownParts = [];

    for (const rawPart of parts) {
        let part = rawPart;
        let sign = 1;

        if (part.startsWith('+')) part = part.slice(1);
        else if (part.startsWith('-')) {
            part = part.slice(1);
            sign = -1;
        }

        const diceMatch = part.match(/^(\d*)d(\d+)$/i);
        if (diceMatch) {
            const count = Math.max(1, parseInt(diceMatch[1] || '1', 10));
            const sides = Math.max(2, parseInt(diceMatch[2], 10));
            const rolls = [];
            let subtotal = 0;

            for (let i = 0; i < count; i++) {
                const r = Math.floor(Math.random() * sides) + 1;
                rolls.push(r);
                subtotal += r;
            }

            total += subtotal * sign;
            const prefix = sign < 0 ? '-' : '+';
            breakdownParts.push(`${prefix}${count}d${sides}(${rolls.join(',')})`);
            continue;
        }

        const flat = parseInt(part, 10);
        if (!Number.isNaN(flat)) {
            total += flat * sign;
            breakdownParts.push(`${sign < 0 ? '-' : '+'}${flat}`);
        }
    }

    if (breakdownParts.length === 0) {
        return { total: 0, breakdown: '0' };
    }

    const breakdown = breakdownParts.join(' ').replace(/^\+/, '');
    return { total, breakdown };
}

function getDiceLabCatalog() {
    if (window.DiceCosmetics && typeof window.DiceCosmetics.getCatalog === 'function') {
        const catalog = window.DiceCosmetics.getCatalog();
        if (Array.isArray(catalog) && catalog.length > 0) return catalog;
    }
    return DICE_STYLE_MARKET_CATALOG.map(style => ({
        id: style.diceStyleId,
        name: style.name,
        rarity: style.rarity,
        premiumOnly: style.premiumOnly
    }));
}

function renderDiceLabStyles() {
    const container = document.getElementById('diceLabStyleGrid');
    if (!container) return;

    const catalog = getDiceLabCatalog();
    if (!diceLabSelectedStyleId && catalog[0]) diceLabSelectedStyleId = catalog[0].id;

    container.innerHTML = catalog.map(style => {
        const active = style.id === diceLabSelectedStyleId;
        return `
            <button type="button" class="dice-style-chip ${active ? 'active' : ''}" onclick="setDiceLabStyle('${style.id}')">
                <div class="dice-style-name">${style.name}</div>
                <div class="dice-style-meta">${style.rarity}${style.premiumOnly ? ' • Premium' : ' • Free'}</div>
            </button>
        `;
    }).join('');
}

function setDiceLabStyle(styleId) {
    diceLabSelectedStyleId = styleId;
    renderDiceLabStyles();
}

function setDiceLabPreset(sides, count = 1) {
    const countInput = document.getElementById('diceLabCount');
    const sidesInput = document.getElementById('diceLabSides');
    if (countInput) countInput.value = String(count);
    if (sidesInput) sidesInput.value = String(sides);
}

function openDiceLab() {
    const modal = document.getElementById('diceLabModal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    renderDiceLabStyles();
    if (window.lucide) lucide.createIcons();
}

function closeDiceLab() {
    const modal = document.getElementById('diceLabModal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

function rollDiceLab() {
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll;
    const expr = `1d20 | [${roll}]`;
    const rawRoll = roll;
    const isCrit = roll === 20;
    const isFail = roll === 1;
    const resultEl = document.getElementById('diceLabResult');

    if (window.DiceCosmetics && typeof window.DiceCosmetics.init === 'function') {
        window.DiceCosmetics.init();
    }
    if (window.DiceCosmetics && typeof window.DiceCosmetics.unlockStyle === 'function') {
        window.DiceCosmetics.unlockStyle(diceLabSelectedStyleId);
    }
    if (window.DiceCosmetics && typeof window.DiceCosmetics.setStyle === 'function') {
        window.DiceCosmetics.setStyle(diceLabSelectedStyleId);
    }

    const finalize = () => {
        if (resultEl) {
            resultEl.innerHTML = `
                <div class="line"><strong>Modo:</strong> d20 unico</div>
                <div class="line"><strong>Rolagem:</strong> [${roll}]</div>
                <div class="line"><strong>Total:</strong> ${total}</div>
            `;
        }
    };

    const visualShown = showCosmeticRoll({
        type: 'dice_lab',
        label: 'Resultado',
        expr,
        result: total,
        rawRoll,
        isCrit,
        isFail
    }, finalize);

    if (!visualShown) {
        finalize();
        showToast(`Resultado 1d20: ${total}`, 'success');
    }
}

function setupDiceLab() {
    const catalog = getDiceLabCatalog();
    if (catalog[0]) diceLabSelectedStyleId = catalog[0].id;
    renderDiceLabStyles();
    if (diceLabBound) return;
    const modal = document.getElementById('diceLabModal');
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeDiceLab();
        });
    }
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeDiceLab();
    });
    diceLabBound = true;
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
                    <button class="atk-btn-3d atk-btn-roll" onclick="rollAttackFromCard(${atk.id})">
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

    if (id === 'store') {
        renderBlackMarket();
    }
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

// --- BLACK MARKET V1 ---
function readStorageJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch (err) {
        return fallback;
    }
}

function writeStorageJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function safeRender(label, fn) {
    try {
        return fn();
    } catch (err) {
        console.error(`[ONI SAFE RENDER] ${label}`, err);
        return null;
    }
}

function isInfiniteMoneyTestMode() {
    return localStorage.getItem(BLACK_MARKET_TEST_MODE_KEY) === '1';
}

function ensureInfiniteMoneyDefaultEnabled() {
    if (localStorage.getItem(BLACK_MARKET_TEST_MODE_KEY) === null) {
        localStorage.setItem(BLACK_MARKET_TEST_MODE_KEY, '1');
    }
}

function applyInfiniteMoneyIfEnabled() {
    if (!blackMarketProfile || !blackMarketProfile.currencies) return;
    if (isInfiniteMoneyTestMode()) {
        blackMarketProfile.currencies.yen = 999999999;
        blackMarketProfile.currencies.scarlet = 999999999;
    }
}

function getCurrentDayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function getCurrentMonthKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function createSeededRandom(seedText) {
    let seed = hashString(seedText) || 1;
    return function () {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
}

function shuffleWithRandom(arr, rng) {
    const list = [...arr];
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}

function pickUnique(list, count, rng) {
    return shuffleWithRandom(list, rng).slice(0, count);
}

function getSubscriptionData() {
    const sub = readStorageJSON(SUBSCRIPTION_KEY, null);
    if (!sub || typeof sub !== 'object') return { plan: 'free', active: false };
    return sub;
}

function isOniPassActive() {
    const sub = getSubscriptionData();
    const plan = String(sub.plan || '').toLowerCase();
    return sub.active === true && (plan === 'premium' || plan === 'lifetime');
}

function initializeOniExtensions() {
    if (!charData.stats || typeof charData.stats !== 'object') {
        charData.stats = charData.attributes || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    }
    if (!charData.oniCosmetics || typeof charData.oniCosmetics !== 'object') {
        charData.oniCosmetics = { aura: 'none', frame: 'obsidian', title: 'Exilado' };
    } else {
        if (!charData.oniCosmetics.aura) charData.oniCosmetics.aura = 'none';
        if (!charData.oniCosmetics.frame) charData.oniCosmetics.frame = 'obsidian';
        if (!charData.oniCosmetics.title) charData.oniCosmetics.title = 'Exilado';
    }

    if (!Array.isArray(charData.attackLoadouts)) charData.attackLoadouts = [];
    if (!Array.isArray(charData.particularities)) charData.particularities = [];
    charData.proficiencies = normalizeLegacyProficiencies(charData.proficiencies);
    if (!Array.isArray(charData.skills)) {
        charData.skills = [...charData.proficiencies];
    } else {
        charData.skills = Array.from(new Set([...charData.skills, ...charData.proficiencies]));
    }
    if (!charData.rank) charData.rank = 'Oni Inferior';
    if (!charData.attributes) charData.attributes = { ...charData.stats };
}

function ensureLoadoutSlots() {
    if (!Array.isArray(charData.attackLoadouts)) charData.attackLoadouts = [];
    const passActive = isOniPassActive();

    let slot1 = charData.attackLoadouts.find(l => l.id === 'loadout_1');
    if (!slot1) {
        slot1 = {
            id: 'loadout_1',
            name: 'Preset I',
            attacksSnapshot: JSON.parse(JSON.stringify(charData.attacks || [])),
            lastUpdated: new Date().toISOString()
        };
        charData.attackLoadouts.push(slot1);
    }

    if (passActive && !charData.attackLoadouts.find(l => l.id === 'loadout_2')) {
        charData.attackLoadouts.push({
            id: 'loadout_2',
            name: 'Preset II',
            attacksSnapshot: [],
            lastUpdated: null
        });
    }

    if (!charData.activeLoadoutId || !charData.attackLoadouts.some(l => l.id === charData.activeLoadoutId)) {
        charData.activeLoadoutId = 'loadout_1';
    }

    if (!passActive && charData.activeLoadoutId === 'loadout_2') {
        charData.activeLoadoutId = 'loadout_1';
    }
}

function createDefaultMarketProfile(previousProfile) {
    const starterCosmetics = COSMETIC_CATALOG.filter(c => c.starter).map(c => c.id);
    const oldOwned = Array.isArray(previousProfile && previousProfile.ownedItems) ? previousProfile.ownedItems : [];
    const starterDiceStyles = DICE_STYLE_MARKET_CATALOG.filter(style => style.starter).map(style => style.diceStyleId);
    const oldOwnedDice = sanitizeOwnedDiceStyleIds(previousProfile && previousProfile.ownedDiceStyleIds);
    const diceProfile = window.DiceCosmetics && typeof window.DiceCosmetics.getProfile === 'function'
        ? window.DiceCosmetics.getProfile()
        : null;
    const globalOwnedDice = sanitizeOwnedDiceStyleIds(diceProfile && diceProfile.ownedStyleIds);
    const mergedOwnedDice = sanitizeOwnedDiceStyleIds([...starterDiceStyles, ...oldOwnedDice, ...globalOwnedDice]);
    const fallbackActiveDice = resolveActiveDiceStyleId(
        (previousProfile && previousProfile.activeDiceStyleId) || (diceProfile && diceProfile.activeStyleId),
        mergedOwnedDice
    );

    return {
        version: MARKET_VERSION,
        currencies: {
            yen: Number(previousProfile && previousProfile.currencies && previousProfile.currencies.yen) || 1500,
            scarlet: Number(previousProfile && previousProfile.currencies && previousProfile.currencies.scarlet) || 12
        },
        ownedItems: Array.from(new Set([...starterCosmetics, ...oldOwned])),
        monthlyClaim: {
            lastClaimMonth: previousProfile && previousProfile.monthlyClaim ? previousProfile.monthlyClaim.lastClaimMonth || null : null
        },
        passPerks: {
            discountScarlet: 0.15,
            extraLoadoutSlots: 1
        },
        purchaseHistory: Array.isArray(previousProfile && previousProfile.purchaseHistory) ? previousProfile.purchaseHistory.slice(0, 80) : [],
        ownedDiceStyleIds: mergedOwnedDice,
        activeDiceStyleId: fallbackActiveDice,
        seenDiceTutorial: !!(previousProfile && previousProfile.seenDiceTutorial)
    };
}

function toMarketOffer(item, kind) {
    return {
        id: `offer_${item.id}`,
        sourceId: item.id,
        name: item.name,
        kind,
        rarity: item.rarity || 'Comum',
        description: item.description || '',
        premiumOnly: !!item.premiumOnly,
        currency: item.currency || 'yen',
        price: Number(item.price || 0),
        reward: item.reward || (kind === 'cosmetic' ? { cosmeticId: item.id } : { yen: 0, scarlet: 0 })
    };
}

function buildDailyOffers(dayKey) {
    const rng = createSeededRandom(`offers-${dayKey}`);

    const premiumCosmetics = pickUnique(
        COSMETIC_CATALOG.filter(c => c.premiumOnly && !c.starter),
        3,
        rng
    ).map(item => toMarketOffer(item, 'cosmetic'));

    const utilityOffers = pickUnique(MARKET_UTILITY_POOL, 2, rng).map(item => toMarketOffer(item, 'utility'));
    const eventOffer = toMarketOffer(pickUnique(MARKET_EVENT_POOL, 1, rng)[0], 'event');

    return shuffleWithRandom([...premiumCosmetics, ...utilityOffers, eventOffer], rng);
}

function buildDailyContracts(dayKey) {
    const rng = createSeededRandom(`contracts-${dayKey}`);
    const freeContracts = pickUnique(FREE_CONTRACT_TEMPLATES, 2, rng).map(template => ({
        ...template,
        id: `${template.id}_${dayKey}`
    }));
    const premium = pickUnique(PREMIUM_CONTRACT_TEMPLATES, 1, rng).map(template => ({
        ...template,
        id: `${template.id}_${dayKey}`
    }));
    return [...freeContracts, ...premium];
}

function createDailyMarketState(dayKey) {
    const contracts = buildDailyContracts(dayKey);
    const progress = {};
    const claimedContracts = {};
    for (const contract of contracts) {
        progress[contract.id] = 0;
        claimedContracts[contract.id] = false;
    }

    return {
        dayKey,
        offers: buildDailyOffers(dayKey),
        contracts,
        progress,
        claimed: {
            offers: {},
            contracts: claimedContracts
        }
    };
}

function initializeBlackMarketState(forceRefresh = false) {
    ensureInfiniteMoneyDefaultEnabled();
    const todayKey = getCurrentDayKey();

    const currentProfile = readStorageJSON(BLACK_MARKET_PROFILE_KEY, null);
    blackMarketProfile = createDefaultMarketProfile(currentProfile);
    if (!Array.isArray(blackMarketProfile.ownedItems)) blackMarketProfile.ownedItems = [];
    blackMarketProfile.ownedDiceStyleIds = sanitizeOwnedDiceStyleIds(blackMarketProfile.ownedDiceStyleIds);
    if (blackMarketProfile.ownedItems.length === 0) {
        blackMarketProfile.ownedItems = COSMETIC_CATALOG.filter(item => item.starter).map(item => item.id);
    }
    if (blackMarketProfile.ownedDiceStyleIds.length === 0) {
        blackMarketProfile.ownedDiceStyleIds = DICE_STYLE_MARKET_CATALOG.filter(item => item.starter).map(item => item.diceStyleId);
    }
    blackMarketProfile.activeDiceStyleId = resolveActiveDiceStyleId(blackMarketProfile.activeDiceStyleId, blackMarketProfile.ownedDiceStyleIds);

    let daily = readStorageJSON(BLACK_MARKET_DAILY_KEY, null);
    const invalidDaily = !daily || daily.dayKey !== todayKey || !Array.isArray(daily.offers) || !Array.isArray(daily.contracts);
    const hasLegacyDiceOffers = Array.isArray(daily && daily.offers) && daily.offers.some(offer => offer && offer.kind === 'dice_skin');
    if (forceRefresh || invalidDaily || hasLegacyDiceOffers || daily.offers.length !== 6 || daily.contracts.length !== 3) {
        daily = createDailyMarketState(todayKey);
    } else {
        if (!daily.progress || typeof daily.progress !== 'object') daily.progress = {};
        if (!daily.claimed || typeof daily.claimed !== 'object') daily.claimed = { offers: {}, contracts: {} };
        if (!daily.claimed.offers || typeof daily.claimed.offers !== 'object') daily.claimed.offers = {};
        if (!daily.claimed.contracts || typeof daily.claimed.contracts !== 'object') daily.claimed.contracts = {};
        for (const contract of daily.contracts) {
            if (typeof daily.progress[contract.id] !== 'number') daily.progress[contract.id] = 0;
            if (typeof daily.claimed.contracts[contract.id] !== 'boolean') daily.claimed.contracts[contract.id] = false;
        }
    }

    blackMarketDaily = daily;
    ensureLoadoutSlots();
    syncDiceCosmeticsFromProfile();
    applyInfiniteMoneyIfEnabled();
    persistBlackMarket();
}

function persistBlackMarket() {
    if (blackMarketProfile) writeStorageJSON(BLACK_MARKET_PROFILE_KEY, blackMarketProfile);
    if (blackMarketDaily) writeStorageJSON(BLACK_MARKET_DAILY_KEY, blackMarketDaily);
}

function getCosmeticById(cosmeticId) {
    return COSMETIC_CATALOG.find(c => c.id === cosmeticId);
}

function getOwnedCosmetics() {
    if (!blackMarketProfile || !Array.isArray(blackMarketProfile.ownedItems)) return [];
    return blackMarketProfile.ownedItems
        .map(getCosmeticById)
        .filter(Boolean);
}

function addOwnedCosmetic(cosmeticId) {
    if (!cosmeticId) return false;
    if (!Array.isArray(blackMarketProfile.ownedItems)) blackMarketProfile.ownedItems = [];
    if (!blackMarketProfile.ownedItems.includes(cosmeticId)) {
        blackMarketProfile.ownedItems.push(cosmeticId);
        return true;
    }
    return false;
}

function getDiceStyleMetaById(styleId) {
    return DICE_STYLE_MARKET_CATALOG.find(style => style.diceStyleId === styleId) || null;
}

function getOwnedDiceStyles() {
    if (!blackMarketProfile || !Array.isArray(blackMarketProfile.ownedDiceStyleIds)) return [];
    return blackMarketProfile.ownedDiceStyleIds
        .map(getDiceStyleMetaById)
        .filter(Boolean);
}

function addOwnedDiceStyle(styleId) {
    if (!styleId) return false;
    if (!Array.isArray(blackMarketProfile.ownedDiceStyleIds)) blackMarketProfile.ownedDiceStyleIds = [];
    if (!blackMarketProfile.ownedDiceStyleIds.includes(styleId)) {
        blackMarketProfile.ownedDiceStyleIds.push(styleId);
        if (window.DiceCosmetics && typeof window.DiceCosmetics.unlockStyle === 'function') {
            window.DiceCosmetics.unlockStyle(styleId);
        }
        return true;
    }
    return false;
}

function syncDiceCosmeticsFromProfile() {
    if (!blackMarketProfile) return;
    blackMarketProfile.ownedDiceStyleIds = sanitizeOwnedDiceStyleIds(blackMarketProfile.ownedDiceStyleIds);
    if (blackMarketProfile.ownedDiceStyleIds.length === 0) {
        blackMarketProfile.ownedDiceStyleIds = DICE_STYLE_MARKET_CATALOG.filter(item => item.starter).map(item => item.diceStyleId);
    }
    blackMarketProfile.activeDiceStyleId = resolveActiveDiceStyleId(blackMarketProfile.activeDiceStyleId, blackMarketProfile.ownedDiceStyleIds);

    if (window.DiceCosmetics && typeof window.DiceCosmetics.init === 'function') {
        window.DiceCosmetics.init();
        if (typeof window.DiceCosmetics.unlockStyle === 'function') {
            for (const styleId of blackMarketProfile.ownedDiceStyleIds) {
                window.DiceCosmetics.unlockStyle(styleId);
            }
        }
        if (typeof window.DiceCosmetics.setStyle === 'function') {
            window.DiceCosmetics.setStyle(blackMarketProfile.activeDiceStyleId);
        }
    }
}

function getScarletDiscount() {
    if (!isOniPassActive()) return 0;
    const discount = blackMarketProfile && blackMarketProfile.passPerks ? Number(blackMarketProfile.passPerks.discountScarlet || 0.15) : 0.15;
    return Math.max(0, Math.min(0.5, discount));
}

function getOfferFinalPrice(offer) {
    let price = Number(offer.price || 0);
    if (price <= 0) return 0;
    if (offer.currency === 'scarlet') {
        const discount = getScarletDiscount();
        price = Math.max(1, Math.floor(price * (1 - discount)));
    }
    return price;
}

function resetBlackMarketStorage() {
    localStorage.removeItem(BLACK_MARKET_PROFILE_KEY);
    localStorage.removeItem(BLACK_MARKET_DAILY_KEY);
}

function renderBlackMarket(recovered = false) {
    if (!document.getElementById('marketOffersGrid')) return;
    initializeBlackMarketState();

    safeRender('renderMarketHeader', () => renderMarketHeader());
    safeRender('renderMarketOffers', () => renderMarketOffers());
    safeRender('renderMarketContracts', () => renderMarketContracts());
    safeRender('renderCosmeticCollection', () => renderCosmeticCollection());
    safeRender('renderDiceStyleCollection', () => renderDiceStyleCollection());
    safeRender('renderLoadoutSlots', () => renderLoadoutSlots());

    if (window.lucide) lucide.createIcons();

    if (!recovered) {
        const offersText = (document.getElementById('marketOffersGrid')?.textContent || '').trim();
        const contractsText = (document.getElementById('marketContractsGrid')?.textContent || '').trim();
        const stuck = offersText.includes('Carregando') || contractsText.includes('Carregando');
        if (stuck) {
            console.warn('[ONI MARKET] Estado travado detectado. Resetando cache local do mercado.');
            resetBlackMarketStorage();
            initializeBlackMarketState(true);
            renderBlackMarket(true);
        }
    }
}

function renderMarketHeader() {
    const yenEl = document.getElementById('yenBalance');
    const scarletEl = document.getElementById('scarletBalance');
    const dayLabelEl = document.getElementById('marketDailyLabel');
    const passStatusEl = document.getElementById('marketPassStatus');
    const passHintEl = document.getElementById('marketPassHint');
    const premiumBtn = document.getElementById('goPremiumBtn');
    const monthlyBtn = document.getElementById('monthlyClaimBtn');
    const infiniteBtn = document.getElementById('toggleInfiniteMoneyBtn');

    if (yenEl) yenEl.innerText = String(blackMarketProfile.currencies.yen || 0);
    if (scarletEl) scarletEl.innerText = String(blackMarketProfile.currencies.scarlet || 0);
    if (dayLabelEl) dayLabelEl.innerText = `Rotacao ativa em ${blackMarketDaily.dayKey}.`;

    const passActive = isOniPassActive();
    const monthKey = getCurrentMonthKey();
    const monthlyReady = passActive && (!blackMarketProfile.monthlyClaim || blackMarketProfile.monthlyClaim.lastClaimMonth !== monthKey);

    if (passStatusEl) {
        passStatusEl.innerHTML = `<i data-lucide="crown" size="16"></i> ${passActive ? 'Oni Pass Ativo' : 'Oni Pass Desativado'}`;
    }

    if (passHintEl) {
        if (passActive) {
            passHintEl.innerText = monthlyReady
                ? 'Seu passe esta ativo: 15% de desconto em Selos e resgate mensal disponivel.'
                : 'Passe ativo. Resgate mensal ja utilizado neste mes.';
        } else {
            passHintEl.innerText = 'Ative o Oni Pass para liberar contratos premium, desconto e slot extra.';
        }
    }

    if (premiumBtn) {
        premiumBtn.disabled = passActive;
        premiumBtn.innerText = passActive ? 'Oni Pass Ativo' : 'Ativar Oni Pass';
    }

    if (monthlyBtn) {
        monthlyBtn.disabled = !monthlyReady;
        monthlyBtn.innerText = monthlyReady ? 'Resgatar Cosmetico Mensal' : 'Resgate Mensal Concluido';
    }

    if (infiniteBtn) {
        const enabled = isInfiniteMoneyTestMode();
        infiniteBtn.innerText = enabled ? 'Dinheiro Infinito: ON' : 'Dinheiro Infinito: OFF';
        infiniteBtn.classList.toggle('primary', enabled);
    }
}

function renderMarketOffers() {
    const container = document.getElementById('marketOffersGrid');
    if (!container) return;

    const passActive = isOniPassActive();
    const currencies = blackMarketProfile.currencies || { yen: 0, scarlet: 0 };
    const claimedMap = blackMarketDaily.claimed && blackMarketDaily.claimed.offers ? blackMarketDaily.claimed.offers : {};

    const html = (blackMarketDaily.offers || []).map(offer => {
        const price = getOfferFinalPrice(offer);
        const claimed = !!claimedMap[offer.id];
        const locked = offer.premiumOnly && !passActive;
        const ownsCosmetic = offer.reward && offer.reward.cosmeticId && blackMarketProfile.ownedItems.includes(offer.reward.cosmeticId);
        const ownsDiceStyle = offer.reward && offer.reward.diceStyleId && Array.isArray(blackMarketProfile.ownedDiceStyleIds) && blackMarketProfile.ownedDiceStyleIds.includes(offer.reward.diceStyleId);
        const ownsOfferReward = !!(ownsCosmetic || ownsDiceStyle);
        const afford = price === 0 || (currencies[offer.currency] || 0) >= price;

        let buttonLabel = 'Comprar';
        let buttonAction = `purchaseBlackMarketOffer('${offer.id}')`;
        let disabled = false;

        if (offer.kind === 'cosmetic' && ownsCosmetic) {
            buttonLabel = 'Equipar';
            buttonAction = `equipCosmetic('${offer.reward.cosmeticId}')`;
        } else if (offer.kind === 'dice_skin' && ownsDiceStyle) {
            buttonLabel = 'Equipar';
            buttonAction = `equipDiceStyle('${offer.reward.diceStyleId}')`;
        } else if (locked) {
            buttonLabel = 'Requer Oni Pass';
            buttonAction = "window.location.href='premium.html'";
        } else if (claimed && !ownsOfferReward) {
            buttonLabel = 'Adquirido Hoje';
            disabled = true;
            buttonAction = '';
        } else if (!afford) {
            buttonLabel = 'Saldo Insuficiente';
            disabled = true;
            buttonAction = '';
        }

        const cardState = `${ownsOfferReward ? 'is-owned' : ''} ${locked ? 'is-locked' : ''}`.trim();
        const priceLabel = price === 0 ? 'Gratis' : `${price} ${offer.currency === 'scarlet' ? 'Selos' : 'Yen'}`;

        return `
            <article class="market-card ${cardState}">
                <div class="market-card-head">
                    <h3 class="market-card-title">${offer.name}</h3>
                    <span class="market-tag">${offer.rarity || 'Comum'}</span>
                </div>
                <div class="market-card-desc">${offer.description}</div>
                <div class="market-price-row">
                    <div class="market-price">${priceLabel}</div>
                    <button class="market-btn" ${disabled ? 'disabled' : ''} onclick="${buttonAction}">
                        ${buttonLabel}
                    </button>
                </div>
            </article>
        `;
    }).join('');

    container.innerHTML = html || '<div class="market-empty">Sem ofertas no momento.</div>';
}

function purchaseBlackMarketOffer(offerId) {
    initializeBlackMarketState();
    const offer = (blackMarketDaily.offers || []).find(entry => entry.id === offerId);
    if (!offer) return;

    if (offer.premiumOnly && !isOniPassActive()) {
        showToast('Esse item exige Oni Pass.', 'info');
        window.location.href = 'premium.html';
        return;
    }

    if (!blackMarketDaily.claimed || !blackMarketDaily.claimed.offers) {
        blackMarketDaily.claimed = blackMarketDaily.claimed || {};
        blackMarketDaily.claimed.offers = {};
    }
    if (blackMarketDaily.claimed.offers[offer.id]) return;

    const price = getOfferFinalPrice(offer);
    const currencyType = offer.currency || 'yen';
    const currentBalance = Number(blackMarketProfile.currencies[currencyType] || 0);

    if (price > currentBalance) {
        showToast(`Saldo insuficiente de ${currencyType === 'scarlet' ? 'Selos' : 'Yen'}.`, 'info');
        return;
    }

    if (price > 0) {
        blackMarketProfile.currencies[currencyType] = currentBalance - price;
    }

    if (offer.kind === 'cosmetic' && offer.reward && offer.reward.cosmeticId) {
        addOwnedCosmetic(offer.reward.cosmeticId);
    }
    grantMarketReward(offer.reward || {});

    blackMarketDaily.claimed.offers[offer.id] = true;
    if (!Array.isArray(blackMarketProfile.purchaseHistory)) blackMarketProfile.purchaseHistory = [];
    blackMarketProfile.purchaseHistory.unshift({
        ts: new Date().toISOString(),
        dayKey: blackMarketDaily.dayKey,
        offerId: offer.id,
        name: offer.name,
        currency: currencyType,
        spent: price
    });
    blackMarketProfile.purchaseHistory = blackMarketProfile.purchaseHistory.slice(0, 80);

    saveChar();
    persistBlackMarket();
    renderBlackMarket();
    showToast(`${offer.name} adquirido com sucesso.`, 'success');
}

function grantMarketReward(reward) {
    if (!reward) return;

    const yen = Number(reward.yen || 0);
    const scarlet = Number(reward.scarlet || 0);
    if (yen > 0) blackMarketProfile.currencies.yen = Number(blackMarketProfile.currencies.yen || 0) + yen;
    if (scarlet > 0) blackMarketProfile.currencies.scarlet = Number(blackMarketProfile.currencies.scarlet || 0) + scarlet;

    if (reward.cosmeticId) addOwnedCosmetic(reward.cosmeticId);
    if (reward.diceStyleId) addOwnedDiceStyle(reward.diceStyleId);
}

function renderMarketContracts() {
    const container = document.getElementById('marketContractsGrid');
    if (!container) return;

    const passActive = isOniPassActive();
    const contracts = blackMarketDaily.contracts || [];

    container.innerHTML = contracts.map(contract => {
        const progress = Math.min(contract.target, Number(blackMarketDaily.progress[contract.id] || 0));
        const done = progress >= contract.target;
        const claimed = !!(blackMarketDaily.claimed && blackMarketDaily.claimed.contracts && blackMarketDaily.claimed.contracts[contract.id]);
        const locked = contract.premiumOnly && !passActive;
        const pct = Math.round((progress / contract.target) * 100);
        const rewardText = formatContractReward(contract.reward || {});

        let buttonText = `${progress}/${contract.target}`;
        let disabled = true;
        let onClick = '';

        if (claimed) {
            buttonText = 'Recebido';
        } else if (locked) {
            buttonText = 'Oni Pass';
            disabled = false;
            onClick = "window.location.href='premium.html'";
        } else if (done) {
            buttonText = 'Resgatar';
            disabled = false;
            onClick = `claimBlackMarketContract('${contract.id}')`;
        }

        return `
            <article class="contract-card">
                <div class="contract-name">${contract.name}</div>
                <div class="contract-desc">${contract.description}</div>
                <div class="contract-progress">
                    <div class="contract-progress-fill" style="width:${pct}%;"></div>
                </div>
                <div class="contract-footer">
                    <span class="contract-reward">${rewardText}</span>
                    <button class="market-btn" ${disabled ? 'disabled' : ''} onclick="${onClick}">${buttonText}</button>
                </div>
            </article>
        `;
    }).join('');
}

function formatContractReward(reward) {
    const parts = [];
    if (reward.yen) parts.push(`+${reward.yen} Yen`);
    if (reward.scarlet) parts.push(`+${reward.scarlet} Selos`);
    if (reward.cosmeticId) {
        const cosmetic = getCosmeticById(reward.cosmeticId);
        parts.push(cosmetic ? cosmetic.name : 'Cosmetico');
    }
    if (reward.diceStyleId) {
        const style = getDiceStyleMetaById(reward.diceStyleId);
        parts.push(style ? `Dado: ${style.name}` : 'Dado Cosmetico');
    }
    return parts.join(' | ');
}

function claimBlackMarketContract(contractId) {
    initializeBlackMarketState();
    const contract = (blackMarketDaily.contracts || []).find(c => c.id === contractId);
    if (!contract) return;

    const locked = contract.premiumOnly && !isOniPassActive();
    if (locked) {
        window.location.href = 'premium.html';
        return;
    }

    const progress = Number(blackMarketDaily.progress[contract.id] || 0);
    const alreadyClaimed = !!(blackMarketDaily.claimed && blackMarketDaily.claimed.contracts && blackMarketDaily.claimed.contracts[contract.id]);
    if (alreadyClaimed || progress < contract.target) return;

    grantMarketReward(contract.reward || {});
    blackMarketDaily.claimed.contracts[contract.id] = true;
    persistBlackMarket();
    saveChar();
    renderBlackMarket();
    showToast(`Contrato concluido: ${contract.name}`, 'success');
}

function trackBlackMarketProgress(goalType, amount = 1) {
    initializeBlackMarketState();
    let changed = false;

    for (const contract of blackMarketDaily.contracts || []) {
        if (contract.goalType !== goalType) continue;
        if (!blackMarketDaily.progress) blackMarketDaily.progress = {};
        if (!blackMarketDaily.claimed || !blackMarketDaily.claimed.contracts) {
            blackMarketDaily.claimed = blackMarketDaily.claimed || {};
            blackMarketDaily.claimed.contracts = blackMarketDaily.claimed.contracts || {};
        }

        if (blackMarketDaily.claimed.contracts[contract.id]) continue;

        const current = Number(blackMarketDaily.progress[contract.id] || 0);
        const next = Math.min(contract.target, current + amount);
        if (next !== current) {
            blackMarketDaily.progress[contract.id] = next;
            changed = true;
            if (next >= contract.target && current < contract.target) {
                showToast(`Contrato pronto para resgate: ${contract.name}`, 'success');
            }
        }
    }

    if (changed) {
        persistBlackMarket();
        if (document.getElementById('store') && document.getElementById('store').classList.contains('active-tab')) {
            renderMarketContracts();
        }
    }
}

function renderCosmeticCollection() {
    const container = document.getElementById('marketCosmeticCollection');
    if (!container) return;

    const cosmetics = getOwnedCosmetics();
    if (!cosmetics.length) {
        container.innerHTML = '<div class="market-empty">Nenhum cosmetico adquirido ainda.</div>';
        return;
    }

    container.innerHTML = cosmetics.map(item => {
        const isEquipped = charData.oniCosmetics && charData.oniCosmetics[item.slot] === item.value;
        return `
            <article class="collection-item">
                <div class="collection-title">${item.name}</div>
                <div class="collection-meta">${item.slot.toUpperCase()} | ${item.rarity}</div>
                <button class="market-btn" ${isEquipped ? 'disabled' : ''} onclick="equipCosmetic('${item.id}')">
                    ${isEquipped ? 'Equipado' : 'Equipar'}
                </button>
            </article>
        `;
    }).join('');
}

function renderDiceStyleCollection() {
    const container = document.getElementById('marketDiceStyleCollection');
    if (!container) return;

    const styles = getOwnedDiceStyles();
    if (!styles.length) {
        container.innerHTML = '<div class="market-empty">Nenhum estilo de dado desbloqueado.</div>';
        return;
    }

    const activeStyleId = blackMarketProfile && blackMarketProfile.activeDiceStyleId
        ? blackMarketProfile.activeDiceStyleId
        : 'dice_coal';

    container.innerHTML = styles.map(style => {
        const isEquipped = style.diceStyleId === activeStyleId;
        return `
            <article class="collection-item">
                <div class="collection-title">${style.name}</div>
                <div class="collection-meta">DICE SKIN | ${style.rarity}</div>
                <button class="market-btn" ${isEquipped ? 'disabled' : ''} onclick="equipDiceStyle('${style.diceStyleId}')">
                    ${isEquipped ? 'Equipado' : 'Equipar'}
                </button>
            </article>
        `;
    }).join('');
}

function equipCosmetic(cosmeticId) {
    initializeBlackMarketState();
    if (!blackMarketProfile.ownedItems.includes(cosmeticId)) {
        showToast('Cosmetico ainda nao adquirido.', 'info');
        return;
    }

    const cosmetic = getCosmeticById(cosmeticId);
    if (!cosmetic) return;

    charData.oniCosmetics[cosmetic.slot] = cosmetic.value;
    saveChar();
    applyEquippedCosmetics();
    renderBlackMarket();
    showToast(`${cosmetic.name} equipado.`, 'success');
}

function equipDiceStyle(styleId) {
    initializeBlackMarketState();
    if (!styleId) return;
    if (!Array.isArray(blackMarketProfile.ownedDiceStyleIds) || !blackMarketProfile.ownedDiceStyleIds.includes(styleId)) {
        showToast('Estilo de dado ainda nao desbloqueado.', 'info');
        return;
    }

    blackMarketProfile.activeDiceStyleId = styleId;
    if (window.DiceCosmetics && typeof window.DiceCosmetics.setStyle === 'function') {
        window.DiceCosmetics.setStyle(styleId);
    }

    persistBlackMarket();
    renderBlackMarket();

    const style = getDiceStyleMetaById(styleId);
    showToast(`Dado equipado: ${style ? style.name : 'Novo estilo'}.`, 'success');
}

function toggleInfiniteMarketMoney() {
    const currentlyEnabled = isInfiniteMoneyTestMode();
    localStorage.setItem(BLACK_MARKET_TEST_MODE_KEY, currentlyEnabled ? '0' : '1');
    initializeBlackMarketState();
    renderBlackMarket();
    showToast(currentlyEnabled ? 'Modo infinito desativado.' : 'Modo infinito ativado para testes.', 'success');
}

function claimMonthlyCosmetic() {
    initializeBlackMarketState();
    if (!isOniPassActive()) {
        showToast('Resgate mensal disponivel apenas para Oni Pass.', 'info');
        window.location.href = 'premium.html';
        return;
    }

    const monthKey = getCurrentMonthKey();
    if (blackMarketProfile.monthlyClaim && blackMarketProfile.monthlyClaim.lastClaimMonth === monthKey) {
        showToast('Resgate mensal ja utilizado.', 'info');
        return;
    }

    const available = COSMETIC_CATALOG.filter(c => c.premiumOnly && !blackMarketProfile.ownedItems.includes(c.id));
    const rng = createSeededRandom(`monthly-${monthKey}`);
    let rewardMessage = '';

    if (available.length > 0) {
        const chosen = pickUnique(available, 1, rng)[0];
        addOwnedCosmetic(chosen.id);
        rewardMessage = `Cosmetico mensal recebido: ${chosen.name}`;
    } else {
        blackMarketProfile.currencies.scarlet = Number(blackMarketProfile.currencies.scarlet || 0) + 6;
        rewardMessage = 'Cosmetico duplicado convertido em +6 Selos Carmesim.';
    }

    blackMarketProfile.monthlyClaim = blackMarketProfile.monthlyClaim || {};
    blackMarketProfile.monthlyClaim.lastClaimMonth = monthKey;
    persistBlackMarket();
    saveChar();
    renderBlackMarket();
    showToast(rewardMessage, 'success');
}

function renderLoadoutSlots() {
    const container = document.getElementById('marketLoadoutSlots');
    if (!container) return;

    ensureLoadoutSlots();
    const passActive = isOniPassActive();
    const slots = ['loadout_1', 'loadout_2'];
    const labelById = { loadout_1: 'Preset I', loadout_2: 'Preset II' };

    container.innerHTML = slots.map(slotId => {
        const slot = charData.attackLoadouts.find(entry => entry.id === slotId);
        const locked = slotId === 'loadout_2' && !passActive;
        const isActive = charData.activeLoadoutId === slotId;

        if (!slot) {
            return `
                <article class="loadout-item locked">
                    <div class="loadout-title">${labelById[slotId]}</div>
                    <div class="loadout-meta">Slot indisponivel.</div>
                </article>
            `;
        }

        const attackCount = Array.isArray(slot.attacksSnapshot) ? slot.attacksSnapshot.length : 0;
        const when = slot.lastUpdated ? new Date(slot.lastUpdated).toLocaleDateString('pt-BR') : 'Nunca salvo';

        if (locked) {
            return `
                <article class="loadout-item locked">
                    <div class="loadout-title">${labelById[slotId]}</div>
                    <div class="loadout-meta">Desbloqueie com Oni Pass.</div>
                    <div class="loadout-actions">
                        <button class="market-btn primary" onclick="window.location.href='premium.html'">Ativar Pass</button>
                    </div>
                </article>
            `;
        }

        return `
            <article class="loadout-item ${isActive ? 'active' : ''}">
                <div class="loadout-title">${slot.name || labelById[slotId]}</div>
                <div class="loadout-meta">${attackCount} ataques salvos | ${when}</div>
                <div class="loadout-actions">
                    <button class="market-btn" onclick="saveLoadoutSlot('${slotId}')">Salvar Atual</button>
                    <button class="market-btn" onclick="applyLoadoutSlot('${slotId}')">Carregar</button>
                    <button class="market-btn" onclick="renameLoadoutSlot('${slotId}')">Renomear</button>
                </div>
            </article>
        `;
    }).join('');
}

function saveLoadoutSlot(slotId) {
    ensureLoadoutSlots();
    const slot = charData.attackLoadouts.find(entry => entry.id === slotId);
    if (!slot) return;
    if (slotId === 'loadout_2' && !isOniPassActive()) {
        showToast('Slot extra disponivel apenas para Oni Pass.', 'info');
        return;
    }

    slot.attacksSnapshot = JSON.parse(JSON.stringify(charData.attacks || []));
    slot.lastUpdated = new Date().toISOString();
    charData.activeLoadoutId = slotId;
    saveChar();
    renderLoadoutSlots();
    showToast(`${slot.name || slotId} salvo com sucesso.`, 'success');
}

function applyLoadoutSlot(slotId) {
    ensureLoadoutSlots();
    const slot = charData.attackLoadouts.find(entry => entry.id === slotId);
    if (!slot) return;
    if (slotId === 'loadout_2' && !isOniPassActive()) {
        showToast('Slot extra disponivel apenas para Oni Pass.', 'info');
        return;
    }

    if (!Array.isArray(slot.attacksSnapshot) || slot.attacksSnapshot.length === 0) {
        showToast('Esse slot ainda nao possui ataques salvos.', 'info');
        return;
    }

    charData.attacks = JSON.parse(JSON.stringify(slot.attacksSnapshot));
    charData.activeLoadoutId = slotId;
    saveChar();
    renderAttacks();
    renderLoadoutSlots();
    showToast(`Preset carregado: ${slot.name || slotId}`, 'success');
}

function renameLoadoutSlot(slotId) {
    ensureLoadoutSlots();
    const slot = charData.attackLoadouts.find(entry => entry.id === slotId);
    if (!slot) return;
    if (slotId === 'loadout_2' && !isOniPassActive()) {
        showToast('Slot extra disponivel apenas para Oni Pass.', 'info');
        return;
    }

    const newName = prompt('Novo nome para o preset:', slot.name || 'Preset');
    if (!newName) return;

    slot.name = newName.trim().slice(0, 28) || slot.name;
    saveChar();
    renderLoadoutSlots();
}

function applyEquippedCosmetics() {
    const auraColorMap = {
        none: '#d90429',
        wisteria: '#9d4edd',
        crimson: '#d90429',
        moon: '#9fa6ff',
        void: '#6a00f4'
    };
    const frameColorMap = {
        obsidian: '#d90429',
        blood: '#ef233c',
        nichirin: '#ffbf69',
        thorns: '#52b788'
    };

    const aura = charData.oniCosmetics && charData.oniCosmetics.aura ? charData.oniCosmetics.aura : 'none';
    const frame = charData.oniCosmetics && charData.oniCosmetics.frame ? charData.oniCosmetics.frame : 'obsidian';
    const title = charData.oniCosmetics && charData.oniCosmetics.title ? charData.oniCosmetics.title : 'Exilado';

    const auraColor = auraColorMap[aura] || '#d90429';
    document.documentElement.style.setProperty('--accent-primary', auraColor);
    document.documentElement.style.setProperty('--accent-glow', auraColor);

    const avatar = document.querySelector('.avatar-circle');
    if (avatar) {
        avatar.style.borderColor = frameColorMap[frame] || '#d90429';
        avatar.style.boxShadow = `0 0 18px ${auraColor}55`;
    }

    const charPanel = document.querySelector('.char-header-panel');
    if (charPanel) {
        charPanel.style.boxShadow = `0 0 0 1px ${auraColor}2a inset, 0 14px 30px rgba(0,0,0,0.35)`;
    }

    const nameContainer = document.getElementById('dispRank') ? document.getElementById('dispRank').parentElement : null;
    if (nameContainer) {
        let badge = document.getElementById('oniTitleBadge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'oniTitleBadge';
            badge.style.fontSize = '0.72rem';
            badge.style.letterSpacing = '1px';
            badge.style.marginTop = '2px';
            badge.style.color = '#d9c7e4';
            badge.style.textTransform = 'uppercase';
            nameContainer.appendChild(badge);
        }
        badge.innerText = title;
    }
}

// Init
window.addEventListener('DOMContentLoaded', initDashboard);
