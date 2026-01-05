// STATE MANAGEMENT
let selectedRace = null;
let selectedBackground = null;
let selectedCombatStyle = 'water'; // Default
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
    // --- NOVOS ANTECEDENTES (PHASE 1) ---
    artista: {
        title: "Artista",
        skills: ["Atuação", "Persuasão"],
        items: [
            { name: "Bolsa de Ienes", type: "consumable", props: "3d6 x 1000", desc: "Ienes obtidos com sua arte." },
            { name: "Pincel e Tintas", type: "item", desc: "Ferramentas de pintura." },
            { name: "Roupa de Artista", type: "armor", ac: "11 + Des", props: "Leve", weight: "2 kg" },
            { name: "Kit de Disfarce", type: "item" },
            { name: "Instrumento Musical", type: "item" }
        ],
        abilities: [
            { name: "Intuição Estética", desc: "Sabe diferenciar obras originais de falsas." },
            { name: "Despertar Emocional", desc: "Pode inspirar emoções específicas através da arte." },
            { name: "Criatividade Inspirada", desc: "Usa Intuição para criar soluções criativas." },
            { name: "Arte Contagiante", desc: "+1 em testes para aliados por 1 hora após performance." }
        ],
        description: "Dedicado à beleza e emoção. Visão única do mundo e capacidade de inspirar."
    },
    brigao: {
        title: "Brigão",
        skills: ["Atletismo", "Intimidação"],
        items: [
            { name: "Bolsa de Ienes", type: "consumable", props: "3d10 x 1000", desc: "Dinheiro de apostas e lutas." },
            { name: "Porrete", type: "weapon", dmg: "1d4 concussão", props: "Simples, Leve" }
        ],
        abilities: [
            { name: "Combate Desarmado", desc: "Seus punhos causam 1d8 de dano contundente." },
            { name: "Rastreamento de Combate", desc: "Percepção para revelar vulnerabilidades." },
            { name: "Intimidação Feroz", desc: "Vantagem em testes de Intimidação." },
            { name: "Conhecimento das Ruas", desc: "Sabe identificar perigos urbanos." }
        ],
        description: "Nascido na rua ou arenas. Mestre em combate desarmado e sobrevivência urbana."
    },
    costureiro: {
        title: "Costureiro",
        skills: ["Enganação", "Furtividade"],
        items: [
            { name: "Bolsa de Ienes", type: "consumable", props: "3d10 x 1000", desc: "Economias do ofício." },
            { name: "Ferramentas de Costura", type: "item", desc: "Agulhas, linhas e tesouras." },
            { name: "Roupa de Costureiro", type: "armor", ac: "11 + Des", props: "Leve e estilosa", weight: "2 kg" }
        ],
        abilities: [
            { name: "Domínio Têxtil", desc: "Identifica origem e qualidade de tecidos." },
            { name: "Alfaiataria de Caçador", desc: "Pode criar uniformes de caçador e mantos." },
            { name: "Reparos e Ajustes", desc: "Conserta rasgos e aprimora roupas." },
            { name: "Disfarce Hábil", desc: "Cria trajes para se passar por outra pessoa." }
        ],
        description: "Paixão por tecidos e moda. Cria uniformes, disfarces e faz reparos essenciais."
    },
    cozinheiro: {
        title: "Cozinheiro",
        skills: ["História", "Persuasão"],
        items: [
            { name: "Bolsa de Ienes", type: "consumable", props: "3d12 x 1000", desc: "Lucros de pratos deliciosos." },
            { name: "Utensílios de Cozinheiro", type: "item", desc: "Panelas e facas de chef." },
            { name: "Roupa de Cozinheiro", type: "armor", ac: "10 + Des", props: "Leve", weight: "2 kg" }
        ],
        abilities: [
            { name: "Conhecimento de Ingredientes", desc: "Identifica ervas e cria refeições nutritivas." },
            { name: "Improvisação Culinária", desc: "Cria pratos deliciosos com ingredientes escassos." },
            { name: "Culinária Curativa", desc: "Refeição cura +10 PV ou concede 20 PV Temporários." },
            { name: "Sabores Persuasivos", desc: "Pode usar comida para ganhar vantagens sociais." }
        ],
        description: "Mestre dos sabores. Suas refeições curam, fortalecem e abrem portas."
    },
    estudioso: {
        title: "Estudioso",
        skills: ["História", "Intuição"],
        items: [
            { name: "Bolsa de Ienes", type: "consumable", props: "3d12 x 1000", desc: "Fundos de pesquisa." },
            { name: "Livros de Pesquisa", type: "item", desc: "Conhecimento." },
            { name: "Kit de Falsificação", type: "item" },
            { name: "Roupa de Estudioso", type: "armor", ac: "10 + Des", props: "Leve", weight: "2 kg" }
        ],
        abilities: [
            { name: "Erudição", desc: "Proficiente em conhecimentos gerais." },
            { name: "Perícia em Livros", desc: "Detecta textos falsos e informações ocultas." },
            { name: "Raciocínio Lógico", desc: "Vantagem para resolver enigmas." },
            { name: "Estudos Avançados", desc: "Ajuda aliados em pesquisas e descobre fraquezas." }
        ],
        description: "Busca incansável pelo saber. Resolve enigmas e descobre segredos ocultos."
    },

    // --- NOVOS ANTECEDENTES (PHASE 2 & 3) ---
    ferreiro: {
        title: "Ferreiro",
        skills: ["História", "Percepção"],
        items: [
            { name: "Bolsa de Ienes", type: "consumable", props: "3d10 x 1000", desc: "Dinheiro do ofício." },
            { name: "Ferramentas de Ferreiro", type: "item" },
            { name: "Roupa de Ferreiro", type: "armor", ac: "11 + Des", props: "Leve, Resistente", weight: "3 kg" }
        ],
        abilities: [
            { name: "Maestria em Forja", desc: "Cria armas com metade do custo e tempo." },
            { name: "Reparo Rápido", desc: "Restaura armas em descanso curto." },
            { name: "Recuperação de Metal", desc: "Recicla metais de itens destruídos." },
            { name: "Armamento Personalizado", desc: "Pode aprimorar armas (+1/+2/+3) com tempo." }
        ],
        description: "Mestre do metal e forja. Cria e repara as melhores lâminas."
    },
    ladrao: {
        title: "Ladrão",
        skills: ["Enganação", "Furtividade"],
        items: [
            { name: "Bolsa de Ienes", type: "consumable", props: "3d12 x 1000", desc: "Dinheiro 'encontrado'." },
            { name: "Ferramentas de Ladrão", type: "item" },
            { name: "Roupa de Ladrão", type: "armor", ac: "11 + Des", props: "Leve, Discreta", weight: "2 kg" }
        ],
        abilities: [
            { name: "Ladinagem", desc: "Abrir fechaduras e desarmar armadilhas." },
            { name: "Olho de Avaliação", desc: "Avalia valor real de itens instantaneamente." },
            { name: "Gíria de Ladrão", desc: "Comunica-se em códigos secretos." },
            { name: "Lábia Ardilosa", desc: "Cria mentiras convincentes e manipula percepção." }
        ],
        description: "Vive nas sombras. Mestre do engano e da apropriação."
    },
    medico: {
        title: "Médico",
        skills: ["Medicina", "Natureza"],
        items: [
            { name: "Bolsa de Ienes", type: "consumable", props: "3d10 x 1000", desc: "Pagamentos." },
            { name: "Kit de Primeiros Socorros (x2)", type: "consumable", props: "1d8+4" },
            { name: "Kit de Herbalismo", type: "item" },
            { name: "Roupa de Médico", type: "armor", ac: "10 + Des", props: "Leve", weight: "2 kg" }
        ],
        abilities: [
            { name: "Diagnóstico", desc: "Identifica doenças e causas com precisão." },
            { name: "Habilidades Curativas", desc: "Ação bônus para estabilizar ou curar com Kit." },
            { name: "Conhecimento Medicinal", desc: "Cria antídotos e remédios." },
            { name: "Criação de Poções", desc: "Em níveis altos, cria poções potentes." }
        ],
        description: "Dedicação à cura. Salva vidas onde outros falham."
    },
    ninja: {
        title: "Ninja",
        skills: ["Acrobacia", "Furtividade"],
        items: [
            { name: "Bolsa de Ienes", type: "consumable", props: "3d10 x 1000", desc: "Pagamento de missões." },
            { name: "Kunai (x5)", type: "weapon", dmg: "1d4 perfurante", props: "Arremesso, Leve" },
            { name: "Shuriken (x5)", type: "weapon", dmg: "1d4 cortante", props: "Arremesso, Leve" },
            { name: "Bomba de Fumaça (x5)", type: "consumable", desc: "Cria área de escuridão." },
            { name: "Roupa Ninja", type: "armor", ac: "11 + Des", props: "Leve, Silenciosa", weight: "2 kg" }
        ],
        abilities: [
            { name: "Movimento Acrobático", desc: "Dobro de proficiência em testes de Acrobacia." },
            { name: "Furtividade Aprimorada", desc: "Se move em silêncio absoluto." },
            { name: "Resistência a Veneno", desc: "Vantagem contra venenos." },
            { name: "Armas Envenenadas", desc: "Ação bônus para aplicar veneno (+2 dano)." }
        ],
        description: "Guerreiro das sombras. Mestre em infiltração e assassinato."
    },
    orfao: {
        title: "Órfão",
        skills: ["Natureza", "Sobrevivência"],
        items: [
            { name: "Bolsa de Ienes", type: "consumable", props: "3d10 x 1000", desc: "Esmolas e achados." },
            { name: "Adaga Velha", type: "weapon", dmg: "1d4 perfurante", props: "Leve, Simples" },
            { name: "Funda", type: "weapon", dmg: "1d4 concussão", props: "Distância" },
            { name: "Kit de Primeiros Socorros", type: "consumable", props: "1d4" },
            { name: "Roupas Gastas", type: "armor", ac: "10 + Des", props: "Leve", weight: "1 kg" }
        ],
        abilities: [
            { name: "Sobrevivência Urbana", desc: "Encontra abrigo e comida facilmente em cidades." },
            { name: "Resiliência Emocional", desc: "Vantagem em testes de resistência emocional." },
            { name: "Furtividade em Multidões", desc: "Se esconde facilmente entre pessoas." },
            { name: "Natureza de Cimento", desc: "Nunca se perde em ambientes urbanos." }
        ],
        description: "Criado nas ruas frias. Resiliente e adaptável."
    },
    policial: {
        title: "Policial",
        skills: ["Intuição", "Investigação"],
        items: [
            { name: "Bolsa de Ienes", type: "consumable", props: "3d10 x 1000", desc: "Salário." },
            { name: "Distintivo", type: "item", desc: "Identificação policial." },
            { name: "Roupa de Policial", type: "armor", ac: "11 + Des", props: "Leve, Uniforme", weight: "2 kg" },
            { name: "Kit de Primeiros Socorros", type: "consumable", props: "1d4" },
            { name: "Pistola", type: "weapon", dmg: "1d10 perfurante", props: "Distância, Recarga", weight: "1.5 kg" },
            { name: "Munição de Chumbo (x20)", type: "item" }
        ],
        abilities: [
            { name: "Investigação Aprofundada", desc: "Vantagem em Investigação. Mestre revela detalhes extras." },
            { name: "Rede de Contatos", desc: "Conexões com informantes e comunidade." },
            { name: "Perfil do Caçador", desc: "Analisa padrões de comportamento de demônios." },
            { name: "Sempre em Guarda", desc: "Pode dormir e manter vigilância (não sofre surpresa)." }
        ],
        description: "Defensor da lei. Investigativo e vigilante."
    },
    religioso: {
        title: "Religioso",
        skills: ["Intuição", "História"],
        items: [
            { name: "Bolsa de Ienes", type: "consumable", props: "3d12 x 1000", desc: "Doações." },
            { name: "Símbolo Sagrado", type: "item", desc: "Amuleto de fé." },
            { name: "Livro de Preces", type: "item" },
            { name: "Roupa de Religioso", type: "armor", ac: "10 + Des", props: "Leve, Cerimonial", weight: "2 kg" }
        ],
        abilities: [
            { name: "Conhecimento Religioso", desc: "Vantagem em História sobre mitos e dogmas." },
            { name: "Discernimento Espiritual", desc: "Intuição para detectar bondade ou maldade." },
            { name: "Inspirar Fé", desc: "Proficiência em Persuasão ao falar de fé." },
            { name: "Coragem Renovada", desc: "Ação: Inspira aliados, dando vantagem contra medo." }
        ],
        description: "Guiado pela fé. Luz divina contra as trevas."
    },
    selvagem: {
        title: "Selvagem",
        skills: ["Sobrevivência", "Natureza", "Lidar com Animais"],
        items: [
            { name: "Bolsa de Ienes", type: "consumable", props: "3d12 x 1000", desc: "Tesouros naturais." },
            { name: "Roupa de Selvagem", type: "armor", ac: "11 + Des", props: "Leve, Peles", weight: "2 kg" }
        ],
        abilities: [
            { name: "Sobrevivência Instintiva", desc: "Encontra dobro de comida. Não se perde na natureza." },
            { name: "Rastreamento", desc: "Vantagem para rastrear em ambiente natural." },
            { name: "Memória Selvagem", desc: "Lembra perfeitamente de caminhos e rotas." },
            { name: "Técnicas de Camuflagem", desc: "Pode se esconder facilmente na natureza (Vantagem)." }
        ],
        description: "Filho da natureza. Resiliente e instintivo."
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
    // Legacy check kept for internal state if needed, but not for disabling button
    // We now validate on click
}

// Ensure button is not disabled initially if it was
if (nextBtn) nextBtn.removeAttribute('disabled');

nameInput.addEventListener('input', () => { }); // No-op now
ageInput.addEventListener('input', () => { });

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
    // 1. Explicit Validation
    if (!nameInput.value.trim()) {
        showMsg("Dados Incompletos", "Por favor, digite o <strong>Nome</strong> do seu personagem.");
        return;
    }
    if (!ageInput.value || parseInt(ageInput.value) <= 0) {
        showMsg("Dados Incompletos", "Por favor, defina uma <strong>Idade</strong> válida.");
        return;
    }
    if (!selectedRace) {
        showMsg("Raça Não Escolhida", "Você deve selecionar uma <strong>Raça</strong> (Humano, Marechi, etc.) antes de prosseguir.");
        return;
    }
    if (!selectedBackground) {
        showMsg("Antecedente Não Escolhido", "Você deve selecionar um <strong>Antecedente</strong> para definir sua história.");
        return;
    }

    // 2. Transition
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2-roll').classList.remove('hidden');
    updateProgress(2);

    // 3. Explanation Modal
    // Wait a brief moment for transition
    setTimeout(() => {
        let msg = "";
        if (selectedRace === 'Tsuyoi') {
            msg = `Como um <strong>Tsuyoi</strong>, sua fisiologia única lhe garante força e agilidade sobrenaturais.<br><br>
                   Seu aprimoramento (+2 Força / +2 Destreza) já foi selecionado automaticamente.`;
        } else {
            msg = `Como <strong>${selectedRace}</strong>, você pode aprimorar suas habilidades naturais.<br><br>
                   Na próxima tela, após rolar os dados, <strong>escolha 2 atributos</strong> para receber um bônus de <strong>+2</strong>.`;
        }
        showMsg("Aprimoramento de Habilidade", msg);
    }, 500);
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
    // Maintain specific order for consistency
    const attributesMapKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const attributesMap = {
        str: "Força", dex: "Destreza", con: "Constituição",
        int: "Inteligência", wis: "Sabedoria", cha: "Carisma"
    };

    container.innerHTML = '';

    attributesMapKeys.forEach(key => {
        const btn = document.createElement('div');
        btn.className = 'bonus-btn';
        btn.innerHTML = `${attributesMap[key]} +2`;
        btn.dataset.attr = key; // Critical for selectors
        btn.onclick = () => toggleBonus(key, btn);
        container.appendChild(btn);
    });
}

function toggleBonus(attr, btnElement) {
    // Prevent manual changes for Tsuyoi
    if (selectedRace === 'Tsuyoi') return;

    // If already selected, deselect
    if (state.bonuses.includes(attr)) {
        state.bonuses = state.bonuses.filter(x => x !== attr);
        btnElement.classList.remove('active');
    } else {
        // If limit reached (2), remove the first one (FIFO) to allow swift changes
        if (state.bonuses.length >= 2) {
            state.bonuses.shift(); // Remove the oldest
        }

        state.bonuses.push(attr);
        updateBonusVisuals();
    }
    recalculateState();
}

function updateBonusVisuals() {
    const container = document.getElementById('bonusToggles');
    const kids = container.children;

    for (let i = 0; i < kids.length; i++) {
        // Use dataset to match strictly
        const btnFn = kids[i].dataset.attr;

        if (state.bonuses.includes(btnFn)) {
            kids[i].classList.add('active');
        } else {
            kids[i].classList.remove('active');
        }

        // Visual Lock for Tsuyoi
        if (selectedRace === 'Tsuyoi') {
            kids[i].style.cursor = 'not-allowed';
            if (!state.bonuses.includes(btnFn)) kids[i].style.opacity = '0.5';
        } else {
            kids[i].style.cursor = 'pointer';
            kids[i].style.opacity = '1';
        }
    }
}


// --- CALCULATIONS & VALIDATION ---
function recalculateState() {
    // Race Logic for Bonuses (Enforce before calculation)
    if (selectedRace === 'Tsuyoi') {
        const targetBonuses = ['str', 'dex'];
        // Check if current state matches rigid requirement
        const isCorrect = state.bonuses.length === 2 &&
            state.bonuses.includes('str') &&
            state.bonuses.includes('dex');

        if (!isCorrect) {
            state.bonuses = [...targetBonuses];
            updateBonusVisuals();
        }
    }

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
    // Validations
    const nextStepBtn = document.getElementById('finishStep2');

    // Check if ALL assignments are made
    let distinctAssigned = 0;
    ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(k => { if (state.assignments[k]) distinctAssigned++; });

    // Validation Rule
    let bonusValid = (state.bonuses.length === 2);

    // We no longer rely on disabling the button, we trigger validation on click. 
    // However, for UX, we can visually indicate readiness or update text.
    if (distinctAssigned === 6 && bonusValid) {
        // nextStepBtn.removeAttribute('disabled'); // Removed logic
        nextStepBtn.innerText = "Ir para: Respiração";
        nextStepBtn.style.opacity = '1';
        nextStepBtn.style.cursor = 'pointer';
        updateFooterPreview();
    } else {
        // nextStepBtn.setAttribute('disabled', 'true'); // Removed logic
        nextStepBtn.innerText = distinctAssigned < 6 ? "Distribua os Atributos" : "Escolha 2 Bônus";
        nextStepBtn.style.opacity = '0.7'; // Visual hint only
    }

    // Attach click handler if not already attached (or ensure it handles validation inside)
    // NOTE: we need to ensure we don't attach multiple listeners. 
    // Best practice: Assign onclick directly here or ensure the static listener checks state.
    // The previous code did: nextStepBtn.onclick = goToNextPage; 
    // Let's change this to a robust check.
    nextStepBtn.onclick = function () {
        if (distinctAssigned < 6) {
            showMsg("Atributos Pendentes", "Você precisa distribuir <strong>todos os 6 valores</strong> de atributos para continuar.");
            return;
        }
        if (!bonusValid) {
            showMsg("Bônus Pendente", "Você precisa selecionar <strong>2 atributos</strong> para receber o bônus de +2.");
            return;
        }
        goToNextPage();
    };
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
            description: bgInfo.html.replace(/<[^>]*>?/gm, ''), // Strip HTML for cleaner description
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
