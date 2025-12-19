// STATE MANAGEMENT
let selectedRace = null;
let selectedBackground = null;
const state = {
    pool: [], // Array of rolled values
    assignments: { str: null, dex: null, con: null, int: null, wis: null, cha: null },
    bonuses: [] // Array of selected attribute keys (e.g. ['str', 'dex'])
};

// --- STEP 1: IDENTITY LOGIC ---
const nameInput = document.getElementById('charName');
const ageInput = document.getElementById('charAge');
const nextBtn = document.getElementById('nextBtn');

// Race Data (Visual description only for creation UI)
const raceSelectionData = {
    "Humano": { title: "Humano", html: "<strong>Versatilidade:</strong> Ganha +2 em dois atributos, 1 talento extra e proficiência em duas perícias." },
    "Marechi": { title: "Marechi", html: "<strong>Sangue Raro:</strong> Atrai onis, mas seu sangue os enfraquece. +2 em dois atributos, Sangue Atordoante." },
    "Tsuyoi": { title: "Tsuyoi", html: "<strong>Corpo Anormal:</strong> Proficiência em DES, Força incomum e carisma natural (+2 FOR/DES)." }
};

// Background Data
const backgroundData = {
    brigao: {
        title: "Brigão",
        skills: ["Atletismo", "Intimidação"],
        items: [
            { name: "Porrete", dmg: "1d6 contundente", type: "weapon" },
            { name: "Cicatriz de Batalha", type: "item" }
        ],
        abilities: [
            { name: "Combate Desarmado", desc: "Dano desarmado aumenta para 1d8." }
        ],
        html: "<strong>Vida Dura:</strong> Nascido na rua. +Atletismo, +Intimidação e sabe brigar."
    },
    herdeiro: {
        title: "Herdeiro",
        skills: ["Persuasão", "História"],
        items: [
            { name: "Katana Ornamental", dmg: "1d6 cortante", type: "weapon" },
            { name: "Bolsa de Moedas (Cheia)", type: "item" },
            { name: "Selo da Família", type: "item" }
        ],
        abilities: [
            { name: "Educação Refinada", desc: "Vantagem em testes sociais com a elite." }
        ],
        html: "<strong>Berço de Ouro:</strong> Família rica ou nobre. +Persuasão, +História e mais recursos iniciais."
    },
    sobrevivente: {
        title: "Sobrevivente",
        skills: ["Sobrevivência", "Furtividade"],
        items: [
            { name: "Faca de Caça", dmg: "1d4 perfurante", type: "weapon" },
            { name: "Amuleto da Sorte", type: "item" }
        ],
        abilities: [
            { name: "Instinto de Preservação", desc: "Pode rerolar 1 teste de resistência por dia." }
        ],
        html: "<strong>Tragédia:</strong> Único sobrevivente de um ataque. +Sobrevivência, +Furtividade e instintos aguçados."
    }
};

// Override selectRace to update panel directly
window.selectRace = function (race) {
    selectedRace = race;

    // Toggle visual Selection
    document.querySelectorAll('.race-section .race-card').forEach(c => {
        // We look for ID match now
        if (c.id === 'card-' + race) c.classList.add('selected');
        else c.classList.remove('selected');
    });

    // Special: Marechi Roll Section
    const marechiRoll = document.getElementById('marechi-roll-section');
    if (race === 'Marechi') {
        marechiRoll.style.display = 'block';
    } else {
        marechiRoll.style.display = 'none';
        state.isMarechiRare = false; // reset
        document.getElementById('marechi-result').innerHTML = "";
    }

    const panel = document.getElementById('infoPanel');
    if (panel) {
        panel.classList.remove('hidden');
        // Theme logic - can simplify
        panel.className = `info-panel human-theme`;

        const data = raceSelectionData[race];
        if (data) {
            document.getElementById('infoTitle').innerText = data.title;
            document.getElementById('infoContent').innerHTML = data.html;
        }
    }

    validateStep1();
}

window.rollMarechi = function () {
    const roll = Math.floor(Math.random() * 20) + 1;
    const resDiv = document.getElementById('marechi-result');

    state.isMarechiRare = (roll >= 18);

    let color = state.isMarechiRare ? "#ff4d4d" : "#ccc";
    let text = state.isMarechiRare ? `Resultado: ${roll} (RARO! Sangue extremamente potente)` : `Resultado: ${roll} (Normal)`;

    resDiv.innerHTML = `<span style="color:${color}">${text}</span>`;
}

// Ensure finalizeCharacter saves the specific race details
// (This usually happens in finalizeCharacter lower down, need to check that)

// Override selectBackground
window.selectBackground = function (bg) {
    selectedBackground = bg;

    // Toggle Visual
    document.querySelectorAll('.background-section .race-card').forEach(c => {
        if (c.id === 'card-' + bg) c.classList.add('selected');
        else c.classList.remove('selected');
    });

    const panel = document.getElementById('infoPanel');
    if (panel) {
        panel.classList.remove('hidden');
        panel.className = `info-panel human-theme`;

        const data = backgroundData[bg];
        if (data) {
            document.getElementById('infoTitle').innerText = data.title;
            document.getElementById('infoContent').innerHTML = data.html;
        }
    }

    validateStep1();
}

function validateStep1() {
    if (nameInput.value && ageInput.value && selectedRace && selectedBackground) {
        nextBtn.removeAttribute('disabled');
    } else {
        nextBtn.setAttribute('disabled', 'true');
    }
}

nameInput.addEventListener('input', validateStep1);
ageInput.addEventListener('input', validateStep1);

// Helper to update Visual Path
function updateProgress(stepIndex) {
    // Reset all
    [1, 2, 3].forEach(i => {
        const el = document.getElementById(`path-step-${i}`);
        if (el) {
            el.classList.remove('active', 'completed');
            if (i < stepIndex) el.classList.add('completed');
            if (i === stepIndex) el.classList.add('active');
        }
    });
}

nextBtn.addEventListener('click', () => {
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2-roll').classList.remove('hidden');
    // document.querySelector('.step-indicator').innerText = "Passo 2: O Destino"; // OLD
    updateProgress(2);
});

// --- STEP 2: ROLLING LOGIC (StrictMode) ---
window.triggerRollingPhase = function () {
    const stage = document.getElementById('diceStage');
    const btn = document.getElementById('rollDiceBtn');

    btn.classList.add('hidden');

    // Inject 3D Dice
    stage.innerHTML = `
        <div class="dice-container">
            ${[1, 2, 3, 4].map(i => `
                <div class="cube rolling">
                    <div class="face front">1</div>
                    <div class="face back">6</div>
                    <div class="face right">3</div>
                    <div class="face left">4</div>
                    <div class="face top">5</div>
                    <div class="face bottom">2</div>
                </div>
            `).join('')}
        </div>
    `;

    // RollSound.play() if we had one


    setTimeout(() => {
        // TRANSITION TO ASSIGNMENT
        document.getElementById('step2-roll').classList.add('hidden');
        document.getElementById('step2-assign').classList.remove('hidden');

        generateValues();
        setupBonusUI();
        document.getElementById('bonusSection').classList.remove('hidden');
    }, 2000);
}

function roll4d6() {
    // 1. Roll 4 dice
    const rolls = [1, 2, 3, 4].map(() => Math.ceil(Math.random() * 6));
    // 2. Sort ascending
    rolls.sort((a, b) => a - b);
    // 3. Drop lowest (index 0) and sum standard 3
    const total = rolls[1] + rolls[2] + rolls[3];
    return total;
}

function getTierClass(val) {
    if (val >= 18) return 'tier-legendary';
    if (val >= 14) return 'tier-strong';
    if (val >= 10) return 'tier-avg';
    return 'tier-weak';
}

function generateValues() {
    const pool = document.getElementById('valuePool');
    pool.innerHTML = '';
    state.pool = [];

    for (let i = 0; i < 6; i++) {
        const val = roll4d6();
        state.pool.push({ id: `val-${i}`, val: val, assigned: false });

        const el = document.createElement('div');
        el.className = `val-token ${getTierClass(val)}`;
        el.draggable = true;
        el.innerText = val;
        el.id = `val-${i}`;
        el.dataset.value = val;
        el.addEventListener('dragstart', dragStart);
        pool.appendChild(el);
    }
}

// --- DRAG & DROP ---
function dragStart(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

window.allowDrop = function (ev) {
    ev.preventDefault();
}

window.drop = function (ev) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text"); // Element ID (val-0)
    const token = document.getElementById(id);
    // Find where we dropped it
    const targetSlot = ev.target.closest('.slot-target');
    const targetPool = ev.target.closest('.value-pool');

    if (targetSlot) {
        // Move to Slot
        if (targetSlot.children.length > 0) {
            // Swap: Send existing back to pool logic or swap places?
            // Simplest: Send back to pool 
            document.getElementById('valuePool').appendChild(targetSlot.children[0]);
        }
        targetSlot.appendChild(token);
    } else if (targetPool) {
        // Move back to Pool
        targetPool.appendChild(token);
    }

    recalculateState();
}

// --- BONUS UI LOGIC ---
function setupBonusUI() {
    const container = document.getElementById('bonusToggles');
    const attributesMap = {
        str: "Força", dex: "Destreza", con: "Constituição",
        int: "Inteligência", wis: "Sabedoria", cha: "Carisma"
    };

    container.innerHTML = '';
    Object.keys(attributesMap).forEach(key => {
        const btn = document.createElement('div');
        btn.className = 'bonus-btn';
        btn.innerHTML = `${attributesMap[key]} +2`;
        btn.onclick = () => toggleBonus(key, btn);
        container.appendChild(btn);
    });
}

function toggleBonus(attr, btnElement) {
    // If already selected, deselect
    if (state.bonuses.includes(attr)) {
        state.bonuses = state.bonuses.filter(x => x !== attr);
        btnElement.classList.remove('active');
    } else {
        // If limit reached (2), remove the first one (FIFO) to allow swift changes
        if (state.bonuses.length >= 2) {
            const removedAttr = state.bonuses.shift(); // Remove the oldest
            // Find button for removed attribute and uncheck it
            // Since we don't have direct ref map easily accessible here without query, let's query
            // Or better, we can just rebuild UI or toggle class. 
            // To be efficient, we search the DOM.
            // Actually, the button text contains the attr name, but let's assume we can match based on structure.
            // Simplest: Iterate all buttons, uncheck if not in new list.
        }

        state.bonuses.push(attr);

        // Update ALL buttons classes to match state
        const allBtns = document.querySelectorAll('.bonus-btn');
        // This relies on the mapped index or text match.
        // Actually, let's just re-run setupBonusUI? No, that destroys elements.
        // We modify visual state based on data.
        updateBonusVisuals(); // Helper below
    }
    recalculateState();
}

function updateBonusVisuals() {
    const container = document.getElementById('bonusToggles');
    const kids = container.children;
    // We kept order in setupBonusUI: str, dex, con, int, wis, cha
    const attributesMapKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

    for (let i = 0; i < kids.length; i++) {
        const key = attributesMapKeys[i];
        if (state.bonuses.includes(key)) {
            kids[i].classList.add('active');
        } else {
            kids[i].classList.remove('active');
        }
    }
}


// --- CALCULATIONS & VALIDATION ---
function recalculateState() {
    const stats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    let filledCount = 0;

    stats.forEach(s => {
        const slot = document.getElementById(`slot-${s}`);
        let baseVal = 0;
        let finalVal = 0;
        let mod = 0;

        if (slot.children.length > 0) {
            baseVal = parseInt(slot.children[0].innerText); // Raw value from token
            filledCount++;

            // Apply Bonus
            if (state.bonuses.includes(s)) {
                finalVal = baseVal + 2;
            } else {
                finalVal = baseVal;
            }

            // Calc Mod: (Total - 10) / 2 floor
            mod = Math.floor((finalVal - 10) / 2);

            // Save to State
            state.assignments[s] = finalVal;
        } else {
            state.assignments[s] = 0;
        }

        // Update UI
        const modSpan = document.getElementById(`mod-${s}`);
        // Show Total Value if bonus applied, or just mod? 
        // Request: "Exiba o Valor Total (Base + Bônus) em tamanho grande. Abaixo dele, exiba o Modificador"
        // Currently our UI structure is: Token (Base) -> Slot -> Mod Display.
        // We might want to visually indicate the +2 in the UI.

        let displayMod = mod >= 0 ? `+${mod}` : mod;

        if (state.bonuses.includes(s) && baseVal > 0) {
            // Maybe modify the token text temporarily or show near it?
            // For now, let's update the mod display to show "16 (+3)" style if space permits or just Mod
            modSpan.innerHTML = `<span style="font-size:0.6em; color:#bd00ff;">${finalVal}</span> <br> ${displayMod}`;
        } else if (baseVal > 0) {
            modSpan.innerHTML = `<span style="font-size:0.6em; color:#fff;">${finalVal}</span> <br> ${displayMod}`;
        } else {
            modSpan.innerText = "+0";
        }

        modSpan.style.color = mod > 0 ? '#00e5ff' : (mod < 0 ? '#ff3d3d' : '#888');
    });

    // Race Logic for Bonuses
    if (selectedRace === 'Tsuyoi') {
        // Clear manual selection
        if (state.bonuses[0] !== 'str' || state.bonuses[1] !== 'dex') {
            state.bonuses = ['str', 'dex'];
            // Update UI toggles to appear locked/selected
            document.querySelectorAll('.bonus-btn').forEach(b => {
                const attr = b.dataset.attr;
                if (attr === 'str' || attr === 'dex') b.classList.add('active');
                else b.classList.remove('active');
            });
        }
    }

    // Validations
    const nextStepBtn = document.getElementById('finishStep2');

    // Check if ALL assignments are made
    let distinctAssigned = 0;
    ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(k => { if (state.assignments[k]) distinctAssigned++; });

    // Validation Rule
    let bonusValid = (state.bonuses.length === 2);

    if (distinctAssigned === 6 && bonusValid) {
        nextStepBtn.removeAttribute('disabled');
        nextStepBtn.innerText = "Ir para: Respiração";
        nextStepBtn.onclick = goToNextPage;
        updateFooterPreview();
    } else {
        nextStepBtn.setAttribute('disabled', 'true');
        nextStepBtn.innerText = distinctAssigned < 6 ? "Distribua os Atributos" : "Escolha 2 Bônus";
    }
}

function updateFooterPreview() {
    // Basic Preview
    let baseHP = 10;
    if (selectedRace === 'Humano') baseHP = 12;
    if (selectedRace === 'Tsuyoi') baseHP = 14;

    // Calculate Con Mod considering potential bonus
    let finalCon = (state.assignments.con || 10);
    if (state.bonuses.includes('con')) finalCon += 2;
    let conMod = Math.floor((finalCon - 10) / 2);

    document.getElementById('finalHP').innerText = baseHP + conMod;

    let finalDex = (state.assignments.dex || 10);
    if (state.bonuses.includes('dex')) finalDex += 2;
    let dexMod = Math.floor((finalDex - 10) / 2);

    document.getElementById('finalAC').innerText = 10 + dexMod;
}


function goToNextPage() {
    const bgInfo = backgroundData[selectedBackground];

    // Apply Bonuses
    const finalAttributes = {};
    ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(k => {
        finalAttributes[k] = state.assignments[k] + (state.bonuses.includes(k) ? 2 : 0);
    });

    // Save Partial Data
    const partialData = {
        name: document.getElementById('charName').value,
        age: document.getElementById('charAge').value,
        race: selectedRace,
        background: {
            id: selectedBackground,
            name: bgInfo.title,
            skills: bgInfo.skills,
            abilities: bgInfo.abilities
        },
        attributes: finalAttributes, // BAKED IN BONUSES
        level: 1,
        pe: 1,
        xp: 0,
        isMarechiRare: state.isMarechiRare || false, // Save roll
        inventory: bgInfo.items ? [...bgInfo.items] : [],
        proficiencies: bgInfo.skills ? [...bgInfo.skills] : []
    };

    localStorage.setItem('demonSlayerChar_Temp', JSON.stringify(partialData));
    window.location.href = 'choose-breathing.html';
}
