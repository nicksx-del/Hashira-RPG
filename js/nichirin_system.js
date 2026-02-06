// ============================================
// NICHIRIN FORGE SYSTEM - ULTIMATE EDITION
// ============================================

const NICHIRIN_ELEMENTS = {
    water: {
        name: 'Água (Mizu)',
        color: '#0077b6',
        glow: 'rgba(0, 119, 182, 0.8)',
        class: 'fx-water',
        buffName: 'Fluidez',
        buffDesc: '+1 na CA quando usar "Esquivar".',
        desc: 'Calmo, adaptável, racional e defensor.'
    },
    flame: {
        name: 'Chamas (En)',
        color: '#ff0000',  // Pure Red for UI text/borders
        glow: 'rgba(255, 0, 0, 0.9)',
        class: 'fx-flame',
        buffName: 'Alma Ardente',
        buffDesc: '+1 dano de Fogo na primeira rolagem do turno.',
        desc: 'Apaixonado, espírito forte, líder natural.'
    },
    thunder: {
        name: 'Trovão (Kaminari)',
        color: '#ffd60a',
        glow: 'rgba(255, 214, 10, 0.8)',
        class: 'fx-thunder',
        buffName: 'Velocidade Relâmpago',
        buffDesc: '+2 em rolagens de Iniciativa.',
        desc: 'Explosivo, impaciente, intenso.'
    },
    wind: {
        name: 'Vento (Kaze)',
        color: '#3e8914',
        glow: 'rgba(62, 137, 20, 0.8)',
        class: 'fx-wind',
        buffName: 'Cortador de Vendavais',
        buffDesc: '+1 acerto com armas de corte.',
        desc: 'Agressivo, brusco, fúria contida.'
    },
    stone: {
        name: 'Pedra (Iwa)',
        color: '#6c757d',
        glow: 'rgba(108, 117, 125, 0.8)',
        class: 'fx-stone',
        buffName: 'Robustez',
        buffDesc: '+1 PV máximo por nível (retroativo).',
        desc: 'Estoico, piedoso, protetor, forte.'
    },
    // DERIVADAS
    flower: {
        name: 'Flor (Hana)',
        color: '#ffb7b2',
        glow: 'rgba(255, 183, 178, 0.8)',
        class: 'fx-flower',
        buffName: 'Olhos de Lótus',
        buffDesc: 'Vantagem em Percepção (Visão).',
        desc: 'Gracioso, observador, delicado.'
    },
    love: {
        name: 'Amor (Koi)',
        color: '#ff4d6d',
        glow: 'rgba(255, 77, 109, 0.8)',
        class: 'fx-love',
        buffName: 'Alcance do Afeto',
        buffDesc: '+1,5m de alcance em ataques corpo-a-corpo.',
        desc: 'Emotivo, gentil, busca conexões.'
    },
    mist: {
        name: 'Névoa (Kasumi)',
        color: '#e0fbfc',
        glow: 'rgba(224, 251, 252, 0.8)',
        class: 'fx-mist',
        buffName: 'Ocultação',
        buffDesc: 'Vantagem em Furtividade na penumbra.',
        desc: 'Distante, focado, lógico, indiferente.'
    },
    insect: {
        name: 'Inseto (Mushi)',
        color: '#90e0ef',
        glow: 'rgba(144, 224, 239, 0.8)',
        class: 'fx-insect',
        buffName: 'Ferrão',
        buffDesc: 'Aumenta a CD dos seus venenos em +1.',
        desc: 'Inteligente, técnico, sádico com onis.'
    },
    serpent: {
        name: 'Serpente (Hebi)',
        color: '#7b2cbf',
        glow: 'rgba(123, 44, 191, 0.8)',
        class: 'fx-serpent',
        buffName: 'Precisão da Víbora',
        buffDesc: 'Reação para rolar ataque errado novamente (1/descanso).',
        desc: 'Calculista, desconfiado, preciso.'
    },
    sound: {
        name: 'Som (Oto)',
        color: '#fb5607',
        glow: 'rgba(251, 86, 7, 0.8)',
        class: 'fx-sound',
        buffName: 'Ressonância',
        buffDesc: '1d4 dano extra em estruturas/objetos.',
        desc: 'Extravagante, barulhento, confiante.'
    },
    beast: {
        name: 'Besta (Kedamono)',
        color: '#4361ee',
        glow: 'rgba(67, 97, 238, 0.8)',
        class: 'fx-beast',
        buffName: 'Instinto Primitivo',
        buffDesc: 'Vantagem em Sobrevivência para rastrear.',
        desc: 'Selvagem, instintivo, impaciente.'
    },
    moon: {
        name: 'Lua (Tsuki)',
        color: '#3c096c',
        glow: 'rgba(60, 9, 108, 0.8)',
        class: 'fx-moon',
        buffName: 'Lâmina Crescente',
        buffDesc: 'Crítico no 19-20 (apenas à noite).',
        desc: 'Misterioso, mortal, antigo.'
    },
    sun: {
        name: 'Sol (Hi)',
        color: '#000000',
        glow: 'rgba(0, 0, 0, 0.9)',
        class: 'fx-sun',
        buffName: 'Calor Solar',
        buffDesc: '+1d4 dano extra contra Onis.',
        desc: 'Determinado, destino trágico, raro.'
    },
    // ESPECIAL
    rainbow: {
        name: 'Arco-Íris (Niji)',
        color: '#ffffff', // Display as white text, effect handles the rest
        glow: 'rgba(255, 255, 255, 0.8)',
        class: 'fx-rainbow',
        buffName: 'Cromaticidade',
        buffDesc: '+1 em Carisma e Performance.',
        desc: 'Vibrante, imprevisível, a cor de todas as almas.'
    }
};

// "SOUL RESONANCE" QUIZ
// Expanded to 7 questions to handle diversity
const QUIZ_QUESTIONS = [
    {
        text: "Diante de um inimigo superior, o que guia sua lâmina?",
        options: [
            { text: "A proteção dos fracos", element: 'stone', points: 3 },
            { text: "A eliminação rápida", element: 'thunder', points: 3 },
            { text: "A adaptação constante", element: 'water', points: 3 },
            { text: "A fúria de vencer", element: 'wind', points: 3 }
        ]
    },
    {
        text: "Como seus amigos descreveriam sua personalidade?",
        options: [
            { text: "Extravagante e barulhento", element: 'sound', points: 5 },
            { text: "Quieto e observador", element: 'mist', points: 4 },
            { text: "Apaixonado e direto", element: 'flame', points: 4 },
            { text: "Gentil e carinhoso", element: 'love', points: 5 }
        ]
    },
    {
        text: "Qual é sua abordagem tática preferida?",
        options: [
            { text: "Uso de venenos e armadilhas", element: 'insect', points: 5 },
            { text: "Ataques selvagens e imprevisíveis", element: 'beast', points: 5 },
            { text: "Precisão cirúrgica", element: 'serpent', points: 4 },
            { text: "Observação de detalhes", element: 'flower', points: 4 }
        ]
    },
    {
        text: "O que você sente ao olhar para a lua?",
        options: [
            { text: "Um mistério antigo", element: 'moon', points: 6 },
            { text: "Solidão e foco", element: 'mist', points: 3 },
            { text: "A beleza da noite", element: 'flower', points: 3 },
            { text: "Nada, prefiro o sol", element: 'sun', points: 2 }
        ]
    },
    {
        text: "Qual é sua maior falha?",
        options: [
            { text: "Sou teimoso demais", element: 'wind', points: 3 },
            { text: "Sou impaciente", element: 'thunder', points: 3 },
            { text: "Sou desconfiado", element: 'serpent', points: 4 },
            { text: "Sou muito emotivo", element: 'love', points: 3 }
        ]
    },
    {
        text: "Em um grupo, você é...",
        options: [
            { text: "O líder inspirador", element: 'flame', points: 4 },
            { text: "O pilar de suporte", element: 'stone', points: 4 },
            { text: "O estrategista silencioso", element: 'water', points: 3 },
            { text: "O lobo solitário", element: 'beast', points: 4 }
        ]
    },
    {
        text: "Por que você luta?",
        options: [
            { text: "Para erradicar todos os onis", element: 'sun', points: 6 },
            { text: "Para proteger minha beleza/arte", element: 'sound', points: 4 },
            { text: "Para vingar os que perdi", element: 'insect', points: 3 },
            { text: "Porque é minha natureza", element: 'moon', points: 4 }
        ]
    }
];

let forgeState = {
    phase: 'select',
    currentQuestion: 0,
    scores: {},
    hammerClicks: 0,
    finalElement: null
};
// ============================================
// HELPER FUNCTIONS (PREVIEW)
// ============================================
// Add these new helper functions

window.previewBlade = function (elementKey) {
    const element = NICHIRIN_ELEMENTS[elementKey];
    const blade = document.getElementById('swordBlade');
    const colorLayer = document.getElementById('swordColorLayer');
    const aura = document.getElementById('bladeAura');

    if (!blade || !element) return;

    // Apply Class
    blade.className = `blade ${element.class}`;

    // Apply Colors
    if (element.class) {
        colorLayer.style.background = ''; // Use CSS
    } else {
        colorLayer.style.background = element.color;
    }

    // Show Aura immediately for preview
    colorLayer.style.width = '100%';
    colorLayer.style.opacity = '1';
    aura.style.background = element.glow;
    aura.style.opacity = '0.8';
};

window.resetBladePreview = function () {
    // Prevent reset if we are already revealing/locked
    if (forgeState.phase === 'reveal') return;

    const blade = document.getElementById('swordBlade');
    const colorLayer = document.getElementById('swordColorLayer');
    const aura = document.getElementById('bladeAura');

    if (!blade) return;

    blade.className = 'blade';
    colorLayer.style.opacity = '0';
    aura.style.opacity = '0';
};

// ============================================
// CORE FUNCTIONS
// ============================================

function initForge() {
    forgeState = {
        phase: 'select',
        currentQuestion: 0,
        scores: {},
        hammerClicks: 0,
        finalElement: null,
        selectedElement: null // Track 2-step selection
    };
    Object.keys(NICHIRIN_ELEMENTS).forEach(elem => forgeState.scores[elem] = 0);

    // UI Reset
    const modeSelect = document.getElementById('forgeModeSelect');
    if (modeSelect) modeSelect.style.display = 'block';

    document.getElementById('forgeQuizUI').innerHTML = '';
    document.getElementById('forgeHammerUI').innerHTML = '';
    document.getElementById('forgeResultUI').innerHTML = '';

    // Blade Reset
    const blade = document.getElementById('swordBlade');
    if (blade) {
        blade.className = 'blade';
        adjustBladeVisuals('reset');
    }
}

function selectForgeMode(mode) {
    const modeSelect = document.getElementById('forgeModeSelect');
    if (mode) {
        if (modeSelect) modeSelect.style.display = 'none';
    }

    if (mode === 'destiny') {
        startQuiz();
    } else if (mode === 'blacksmith') {
        startBlacksmithMode();
    }
}

// ============================================
// FASE 1B: MANUAL SELECTION (BLACKSMITH)
// ============================================

function startBlacksmithMode() {
    forgeState.phase = 'manual';
    const ui = document.getElementById('forgeQuizUI'); // Reuse Quiz container

    // Filter out 'sun' (Black) as it is exclusive/rare
    const availableElements = Object.entries(NICHIRIN_ELEMENTS);
    // .filter(([key, val]) => key !== 'sun'); // Unlocked by request

    ui.innerHTML = `
        <div class="destiny-quiz-card" style="max-width:800px;">
            <h2 class="destiny-question" style="margin-bottom:10px;">Escolha seu Estilo de Respiração</h2>
            <p style="color:#aaa; marginBottom:20px;">Como ferreiro, você molda o metal com sua intenção.</p>
            
            <div class="destiny-options" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:15px; max-height:400px; overflow-y:auto; padding-right:5px;">
                ${availableElements.map(([key, val]) => `
                    <div class="destiny-option-card" 
                            onmouseover="previewBlade('${key}')"
                            onmouseout="resetBladePreview()"
                            onclick="handleManualSelection('${key}', this)">
                        <div class="card-color-indicator" style="background:${val.color}; box-shadow:0 0 15px ${val.color};"></div>
                        <h3 class="card-title">${val.name}</h3>
                        
                        <div class="card-details-container">
                             <div class="card-buff-info">
                                <i data-lucide="sparkles" size="12" style="margin-right:4px;"></i>
                                <span style="color:#ffd700; font-weight:bold;">${val.buffName}</span>
                                <div style="font-size:0.75rem; margin-top:2px; color:#ccc;">${val.buffDesc}</div>
                             </div>
                             <p class="card-flavor-text">"${val.desc}"</p>
                        </div>

                        <div class="card-selection-ring"></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function handleManualSelection(element, btnElement) {
    // 2-Step Logic for Mobile Safety
    if (forgeState.selectedElement !== element) {
        // Step 1: Select
        forgeState.selectedElement = element;

        // Remove "selected" class from all buttons
        const allBtns = document.querySelectorAll('.destiny-option');
        allBtns.forEach(b => {
            b.classList.remove('selected');
            b.style.borderColor = 'rgba(255,255,255,0.1)'; // Reset border
            b.style.boxShadow = 'none';
        });

        // Add visual feedback to clicked button
        if (btnElement) {
            btnElement.classList.add('selected');
            const color = NICHIRIN_ELEMENTS[element].color;
            btnElement.style.borderColor = color;
            btnElement.style.boxShadow = `0 0 15px ${color}`;
        }

        // Preview Visuals
        previewBlade(element);

        return; // WAITING FOR CONFIRMATION
    }

    // Step 2: Confirm (Clicked same item again)
    forgeState.finalElement = element;
    forgeState.phase = 'reveal'; // Lock phase to prevent reset

    // Lock visuals immediately
    previewBlade(element);

    // Clear Quiz UI (since we skip hammering)
    const quizUi = document.getElementById('forgeQuizUI');
    if (quizUi) quizUi.innerHTML = '';

    // Direct to Reveal
    startRevealSequence();
}

// ============================================
// FASE 1: QUIZ
// ============================================

function startQuiz() {
    forgeState.phase = 'quiz';
    renderQuestion();
}

function renderQuestion() {
    const q = QUIZ_QUESTIONS[forgeState.currentQuestion];
    const ui = document.getElementById('forgeQuizUI');
    const total = QUIZ_QUESTIONS.length;

    ui.innerHTML = `
        <div class="destiny-quiz-card">
            <div class="destiny-progress">PERGUNTA ${forgeState.currentQuestion + 1} / ${total}</div>
            <h2 class="destiny-question">${q.text}</h2>
            <div class="destiny-options">
                ${q.options.map((opt, i) => `
                    <button class="destiny-option" onclick="handleOptionClick(${i})">
                        ${opt.text}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function handleOptionClick(index) {
    const q = QUIZ_QUESTIONS[forgeState.currentQuestion];
    const opt = q.options[index];

    // Add points
    if (opt.element && forgeState.scores[opt.element] !== undefined) {
        forgeState.scores[opt.element] += opt.points;
    }

    forgeState.currentQuestion++;

    if (forgeState.currentQuestion < QUIZ_QUESTIONS.length) {
        renderQuestion();
    } else {
        calculateResult();
    }
}

function calculateResult() {
    let max = -1;
    let winner = 'water'; // Default

    for (const [el, score] of Object.entries(forgeState.scores)) {
        // Random tie-breaker
        const finalScore = score + (Math.random() * 0.5);
        if (finalScore > max) {
            max = finalScore;
            winner = el;
        }
    }

    forgeState.finalElement = winner;
    startHammering();
}

// ============================================
// FASE 2: HAMMERING
// ============================================

function startHammering() {
    document.getElementById('forgeQuizUI').innerHTML = '';

    // Safety Reset
    resetBladePreview();

    const ui = document.getElementById('forgeHammerUI');

    ui.innerHTML = `
        <div class="hammer-stage">
            <h2 style="color:#ffd700; font-family:'Cinzel'; margin-bottom:20px;">Forjando o Destino</h2>
            <div class="hammer-progress-track">
                <div id="hammerFill" class="hammer-progress-fill"></div>
            </div>
            <button id="mainHammerBtn" class="legendary-hammer-btn">
                <i data-lucide="hammer"></i> GOLPEAR (0/5)
            </button>
            <p id="hammerInstruction" style="color:#aaa; margin-top:15px;">Dê forma à sua alma!</p>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const btn = document.getElementById('mainHammerBtn');
    btn.onclick = (e) => {
        forgeState.hammerClicks++;

        createImpact(e.clientX, e.clientY);
        updateHammerProgress();

        if (forgeState.hammerClicks >= 5) {
            finishHammering();
        }
    };
}

function updateHammerProgress() {
    const pct = (forgeState.hammerClicks / 5) * 100;
    document.getElementById('hammerFill').style.width = pct + '%';
    document.getElementById('mainHammerBtn').innerHTML = `<i data-lucide="hammer"></i> GOLPEAR (${forgeState.hammerClicks}/5)`;
    document.getElementById('hammerInstruction').innerText = "CLANG!!";
    document.getElementById('hammerInstruction').style.color = "#ff4d00";

    document.body.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
    setTimeout(() => document.body.style.transform = 'none', 50);
}

function createImpact(x, y) {
    const el = document.createElement('div');
    el.className = 'impact-spark';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

function finishHammering() {
    const btn = document.getElementById('mainHammerBtn');
    btn.disabled = true;
    btn.innerText = "PRONTO!";

    setTimeout(startRevealSequence, 800);
}

// ============================================
// FASE 3: REVEAL
// ============================================

function startRevealSequence() {
    // Clear both potential previous UIs
    const hammerUi = document.getElementById('forgeHammerUI');
    const quizUi = document.getElementById('forgeQuizUI');
    if (hammerUi) hammerUi.innerHTML = '';
    if (quizUi) quizUi.innerHTML = '';

    const element = NICHIRIN_ELEMENTS[forgeState.finalElement];
    const blade = document.getElementById('swordBlade');
    const colorLayer = document.getElementById('swordColorLayer');
    const aura = document.getElementById('bladeAura');

    // 1. White Flash
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);

    setTimeout(() => {
        // 2. Apply Visuals during flash
        blade.className = `blade ${element.class}`;

        // IMPORTANT: Clear inline background if using a CSS class effect, 
        // otherwise let JS set the fall-back color.
        if (element.class) {
            colorLayer.style.background = '';
        } else {
            colorLayer.style.background = element.color;
        }

        colorLayer.style.width = '100%';
        colorLayer.style.opacity = '1';
        aura.style.background = element.glow;
        aura.style.opacity = '1';

        // 3. Remove Flash & Show Result Card
        flash.remove();
        showResultCard(element);

    }, 1500);
}

function showResultCard(element) {
    const ui = document.getElementById('forgeResultUI');
    ui.innerHTML = `
        <div class="nichirin-result-card">
            <h1 style="color:${element.color}; text-shadow:0 0 15px ${element.glow}">Nichirin de ${element.name}</h1>
            <p style="margin-bottom:10px;">"${element.desc}"</p>
            
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; border-left:3px solid ${element.color}; margin-bottom:20px; text-align:left;">
                <div style="color:${element.color}; font-weight:bold; font-size:0.9rem; text-transform:uppercase;">${element.buffName}</div>
                <div style="color:#ddd; font-size:0.9rem;">${element.buffDesc}</div>
            </div>

            <button class="forge-btn" onclick="equipAndClose()">EMPUNHAR LÂMINA</button>
        </div>
    `;
}

// ============================================
// FINALIZATION & INVENTORY TRANSFER
// ============================================

function equipAndClose() {
    const element = NICHIRIN_ELEMENTS[forgeState.finalElement];
    const timestamp = Date.now();

    // 1. Construct the detailed item
    const newItem = {
        id: timestamp,
        name: `Nichirin de ${element.name} `,
        type: 'weapon',
        rarity: (['sun', 'moon'].includes(forgeState.finalElement)) ? 'legendary' : 'rare',
        // FORMAT: "Buff da Nichirin: [Nome] - [Descrição]"
        desc: `Lâmina forjada.Buff da Nichirin: ${element.buffName} - ${element.buffDesc} `,
        quantity: 1,
        equipped: true,
        damage: '1d8',
        properties: 'Cortante, Acuidade, Versátil (1d10)',
        value: 1000 // Yen value
    };

    // 2. Add to Inventory System (Attempt multiple methods)
    try {
        if (typeof addItemToInventory === 'function') {
            addItemToInventory(newItem);
            console.log("Item added via addItemToInventory");
        } else if (window.charData) {
            if (!window.charData.inventory) window.charData.inventory = [];
            window.charData.inventory.push(newItem);
            if (window.saveHuman) window.saveHuman();
            console.log("Item added via direct push");
        }
    } catch (e) {
        console.error("Error adding to inventory:", e);
        if (window.showToast) window.showToast("Erro ao adicionar ao inventário!", "error");
    }

    // 3. Save Visual State
    if (window.charData) {
        window.charData.nichirin = {
            name: newItem.name,
            element: forgeState.finalElement,
            color: element.color,
            buffName: element.buffName,
            buffDesc: element.buffDesc
        };
        if (window.saveHuman) window.saveHuman();
    }

    if (window.showToast) window.showToast("Lâmina adicionada ao Inventário!", "success");
    resetForge();

    // 4. Force Redirect to Inventory
    setTimeout(() => {
        // Try direct function
        if (typeof showSection === 'function') {
            showSection('inventory');
        }

        // Try clicking the specific sidebar nav item
        const navItem = document.getElementById('nav-inventory');
        if (navItem) {
            navItem.click();
        }

        // Fallback: general query
        const anyInvBtn = document.querySelector('[onclick*="inventory"]');
        if (anyInvBtn) anyInvBtn.click();

    }, 500);
}

function resetForge() {
    initForge();
}

function adjustBladeVisuals(action) {
    const colorLayer = document.getElementById('swordColorLayer');
    const aura = document.getElementById('bladeAura');
    if (action === 'reset') {
        colorLayer.style.width = '0%';
        colorLayer.style.opacity = '0';
        aura.style.opacity = '0';
    }
}

// Exports
if (typeof window !== 'undefined') {
    window.initForge = initForge;
    window.selectForgeMode = selectForgeMode;
    window.startQuiz = startQuiz;
    window.selectQuizOption = handleOptionClick;
    window.handleOptionClick = handleOptionClick;
    window.equipAndClose = equipAndClose;
    window.equipBlade = equipAndClose;
    window.resetForge = resetForge;
}
