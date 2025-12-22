// --- NICHIRIN SYSTEM V3: ULTIMATE EDITION ---

// --- DATA: QUIZ STRATEGY ---
const QUIZ_QUESTIONS = [
    {
        q: "Em um duelo mortal, o que guia sua lâmina?",
        opts: [
            { txt: "A fúria ardente do momento", type: 'flame', score: 3 },
            { txt: "A calma e o fluxo do combate", type: 'water', score: 3 },
            { txt: "A proteção dos inocentes", type: 'love', score: 2 },
            { txt: "A eliminação rápida e eficiente", type: 'wind', score: 3 }
        ]
    },
    {
        q: "Qual é o seu maior trunfo em batalha?",
        opts: [
            { txt: "Velocidade pura", type: 'thunder', score: 3 },
            { txt: "Força bruta implacável", type: 'stone', score: 3 },
            { txt: "Estratégia e astúcia", type: 'serpent', score: 3 },
            { txt: "Sentidos aguçados", type: 'beast', score: 3 }
        ]
    },
    {
        q: "Diante de um demônio Lua Superior, você...",
        opts: [
            { txt: "Ataca de frente, sem medo", type: 'flame', score: 2 },
            { txt: "Mantém a distância e analisa", type: 'mist', score: 3 },
            { txt: "Busca uma abertura fatal", type: 'water', score: 2 },
            { txt: "Usa o terreno a seu favor", type: 'wind', score: 2 }
        ]
    },
    {
        q: "O que define um verdadeiro Caçador?",
        opts: [
            { txt: "A determinação inabalável", type: 'sun', score: 5 },
            { txt: "A maestria técnica", type: 'water', score: 1 },
            { txt: "A coragem de morrer lutando", type: 'flame', score: 1 },
            { txt: "A frieza para matar", type: 'wind', score: 1 }
        ]
    },
    {
        q: "Escolha um elemento da natureza que lhe atrai:",
        opts: [
            { txt: "O rugido do trovão", type: 'thunder', score: 5 },
            { txt: "A vastidão do oceano", type: 'water', score: 5 },
            { txt: "O calor do sol", type: 'sun', score: 2 },
            { txt: "O mistério da neblina", type: 'mist', score: 5 }
        ]
    }
];

// Map Types to Visual properties (Using specific CSS classes now)
const BLADE_TYPES = {
    'sun': { name: 'Lâmina Negra', class: 'fx-sun', desc: "Uma lâmina de escuridão profunda, absorvendo toda a luz ao redor.", feeling: "Vazio" },
    'water': { name: 'Lâmina Azul', class: 'fx-water', desc: "Uma cor serena e profunda, refletindo a tranquilidade das águas.", feeling: "Serenidade" },
    'flame': { name: 'Lâmina Vermelha', class: 'fx-flame', desc: "Brilha com uma intensidade carmesim vibrante.", feeling: "Paixão" },
    'wind': {
        name: 'Lâmina Verde', class: 'fx-wind',
        style: { col: '#2b9348', glow: '#4cc9f0' },
        desc: "Um verde pálido e cortante, evocando a força dos vendavais.", feeling: "Fúria"
    },
    'thunder': { name: 'Lâmina Amarela', class: 'fx-thunder', desc: "Raiada com padrões de ouro e eletricidade estática.", feeling: "Estrondo" },
    'stone': {
        name: 'Lâmina Cinza', class: 'fx-stone',
        style: { col: '#6c757d', glow: '#adb5bd' },
        desc: "Sólida e imponente, com o peso de uma montanha.", feeling: "Inabalável"
    },
    'mist': {
        name: 'Lâmina Branca', class: 'fx-mist',
        style: { col: '#e0fbfc', glow: '#fff' },
        desc: "Pura e nebulosa, escondendo seu verdadeiro alcance.", feeling: "Ilusão"
    },
    'serpent': {
        name: 'Lâmina Roxa', class: 'fx-serpent',
        style: { col: '#7209b7', glow: '#b5179e' },
        desc: "Sinuosa, com um tom violeta hipnotizante.", feeling: "Mistério"
    },
    'love': {
        name: 'Lâmina Rosa', class: 'fx-love',
        style: { col: '#ff006e', glow: '#ff5c8a' },
        desc: "Vibrante e flexível, irradiando uma luz suave.", feeling: "Afeto"
    },
    'beast': {
        name: 'Lâmina Índigo', class: 'fx-beast',
        style: { col: '#3a0ca3', glow: '#4361ee' },
        desc: "Um azul escuro e selvagem, com arestas lascadas.", feeling: "Instinto"
    }
};

// --- STATE MANAGER ---
let forgeState = {
    mode: null,
    quizIndex: 0,
    scores: {},
    manualSettings: { hue: 0, text: '', tsuba: 'regular' },
    finalResult: null
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // Tsuba Selector Init
    const tSelector = document.getElementById('tsubaSelector');
    if (tSelector) {
        ['regular', 'circle', 'flame', 'flower'].forEach(t => {
            const div = document.createElement('div');
            div.className = `tsuba-option ${t === 'regular' ? 'selected' : ''}`;
            div.innerText = t.charAt(0).toUpperCase();
            div.onclick = () => selectTsuba(t, div);
            tSelector.appendChild(div);
        });
    }
});

function selectForgeMode(mode) {
    forgeState.mode = mode;
    document.querySelectorAll('.forge-step').forEach(el => el.style.display = 'none');

    if (mode === 'destiny') {
        document.getElementById('forgeDestiny').style.display = 'block';
        resetQuiz();
    } else {
        document.getElementById('forgeManual').style.display = 'block';
    }
}

// --- QUIZ LOGIC ---
function resetQuiz() {
    forgeState.quizIndex = 0;
    forgeState.scores = {};
    renderQuestion();
    updateQuizProgress();
}

function renderQuestion() {
    const qData = QUIZ_QUESTIONS[forgeState.quizIndex];
    document.getElementById('quizQuestion').innerText = `Pergunta ${forgeState.quizIndex + 1}/${QUIZ_QUESTIONS.length}`;
    document.getElementById('quizText').innerText = qData.q;

    const optsDiv = document.getElementById('quizOptions');
    optsDiv.innerHTML = '';

    qData.opts.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'quiz-btn';
        btn.innerText = opt.txt;
        btn.onclick = () => handleAnswer(opt);
        optsDiv.appendChild(btn);
    });
}

function handleAnswer(opt) {
    if (!forgeState.scores[opt.type]) forgeState.scores[opt.type] = 0;
    forgeState.scores[opt.type] += opt.score;

    forgeState.quizIndex++;
    updateQuizProgress();

    if (forgeState.quizIndex >= QUIZ_QUESTIONS.length) {
        calculateDestinyResult();
        startForgingProcess();
    } else {
        renderQuestion();
    }
}

function updateQuizProgress() {
    const pct = (forgeState.quizIndex / QUIZ_QUESTIONS.length) * 100;
    document.getElementById('quizProgress').style.width = `${pct}%`;
}

function calculateDestinyResult() {
    let maxScore = -1;
    let winner = 'water';
    for (const [type, score] of Object.entries(forgeState.scores)) {
        if (score > maxScore) {
            maxScore = score;
            winner = type;
        } else if (score === maxScore) {
            if (Math.random() > 0.5) winner = type;
        }
    }
    forgeState.finalResult = { type: 'preset', id: winner, ...BLADE_TYPES[winner], mode: 'destiny' };
}

// --- MANUAL LOGIC ---
function updateManualBlade(val) {
    forgeState.manualSettings.hue = val;
    // For manual, we just tint the layer via inline style during preview
    const layer = document.getElementById('swordColorLayer');
    layer.style.width = '100%';
    layer.style.opacity = '0.5';
    layer.style.background = `hsl(${val}, 100%, 50%)`;
    // Add mix blend to make it look like tint
    layer.style.mixBlendMode = 'overlay';
}

function updateEngraving(text) {
    forgeState.manualSettings.text = text;
    document.getElementById('bladeEngraving').style.opacity = 1;
    document.getElementById('bladeEngraving').innerText = text;
}

function selectTsuba(type, el) {
    forgeState.manualSettings.tsuba = type;
    document.querySelectorAll('.tsuba-option').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('swordTsuba').className = 'tsuba ' + type;
}

function finalizeManualForge() {
    forgeState.finalResult = {
        name: 'Nichirin Personalizada',
        type: 'custom',
        hue: forgeState.manualSettings.hue,
        desc: `Forjada manualmente. Inscrição: "${forgeState.manualSettings.text}"`,
        feeling: forgeState.manualSettings.text || "Alma"
    };
    startForgingProcess();
}

// --- FORGING PROCESS ---
function startForgingProcess() {
    document.querySelectorAll('.forge-step').forEach(el => el.style.display = 'none');
    document.getElementById('forgeProcess').style.display = 'block'; // Or keep hidden for surprise?
    // Let's show the progress bar for immersion

    // PREPARE BLADE FOR REVEAL:
    const blade = document.getElementById('swordBlade');
    const layer = document.getElementById('swordColorLayer');
    const aura = document.getElementById('bladeAura');
    const engraving = document.getElementById('bladeEngraving');

    // Reset visuals
    blade.className = 'blade'; // remove all FX classes
    layer.style.width = '0%';
    layer.style.opacity = 0;
    layer.style.background = 'transparent';
    aura.style.opacity = 0;
    engraving.style.opacity = 0;
    engraving.innerText = '';

    const status = document.getElementById('forgeStatus');
    const bar = document.getElementById('forgeProgressBar');

    let progress = 0;
    const interval = setInterval(() => {
        progress += 1; // Slower
        bar.style.width = progress + '%';

        if (progress < 40) {
            status.innerText = "Derretendo Minério Escarlate...";
            if (progress % 5 === 0) spawnSpark();
        } else if (progress < 80) {
            status.innerText = "Moldando a Lâmina...";
            if (progress % 20 === 0) blade.parentElement.style.transform = `rotate(${Math.random() * 2 - 1}deg)`;
        } else {
            status.innerText = "Polindo...";
        }

        if (progress >= 100) {
            clearInterval(interval);
            blade.parentElement.style.transform = 'rotate(0deg)';
            playRevealSequence();
        }
    }, 50);
}

// --- CINEMATIC REVEAL ---
function playRevealSequence() {
    const r = forgeState.finalResult;
    const blade = document.getElementById('swordBlade');
    const layer = document.getElementById('swordColorLayer');
    const aura = document.getElementById('bladeAura');
    const engraving = document.getElementById('bladeEngraving');

    // 1. Hide process UI
    document.getElementById('forgeProcess').style.display = 'none';

    // 2. TEXT SET
    document.getElementById('finalSwordName').innerText = r.name;
    document.getElementById('finalSwordDesc').innerText = r.desc;

    // 3. APPLY CLASS / COLOR SETTINGS (Hidden initially)
    if (r.type === 'custom') {
        layer.style.background = `hsl(${r.hue}, 100%, 50%)`;
        engraving.innerText = r.feeling;
    } else {
        if (r.class) {
            blade.classList.add(r.class);
        } else {
            // Fallback for custom logic if not using class
            layer.style.background = r.style.col;
            aura.style.boxShadow = `0 0 20px ${r.style.glow}`;
        }
        engraving.innerText = r.feeling;
    }

    // 4. ANIMATION SEQUENCE
    // STEP A: FLASH (Sound Visual)
    createScreenFlash();

    // STEP B: The Fill
    setTimeout(() => {
        layer.style.opacity = 1;
        layer.style.transition = 'width 2s cubic-bezier(0.22, 1, 0.36, 1)'; // Heavy ease out
        layer.style.width = '100%';

        // Explosion of particles
        spawnExplosion(r);

        // Show Aura
        setTimeout(() => {
            aura.style.opacity = 1;
        }, 1000);

        // Show Text slowly
        setTimeout(() => {
            engraving.style.opacity = 1;
            engraving.style.transition = 'opacity 3s ease';
        }, 1500);

        // Show Result UI
        setTimeout(() => {
            document.getElementById('forgeResult').style.display = 'block';
        }, 2500);

    }, 300);
}

// --- VFX ENGINE ---
function createScreenFlash() {
    const f = document.createElement('div');
    f.className = 'screen-flash';
    document.body.appendChild(f);

    // Force reflow
    void f.offsetWidth;

    f.style.opacity = 1;
    setTimeout(() => {
        f.style.opacity = 0;
        setTimeout(() => f.remove(), 2000);
    }, 100);
}

function spawnSpark() {
    const stage = document.querySelector('.sword-stage');
    // ... simple spark logic if needed, but updated explosion below is key
}

function spawnExplosion(result) {
    const container = document.getElementById('vfxContainer');
    if (!container) return;
    container.innerHTML = ''; // Clear

    const count = 50;
    let color = '#fff';

    // Determine color based on result
    if (result.hue) color = `hsl(${result.hue}, 100%, 70%)`;
    if (result.style) color = result.style.glow;
    if (result.class === 'fx-flame') color = '#ff9f00';
    if (result.class === 'fx-water') color = '#48cae4';

    const rect = container.getBoundingClientRect();
    const midX = rect.width / 2;
    const midY = rect.height / 2;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle rise';

        const size = Math.random() * 6 + 2;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.background = color;
        p.style.boxShadow = `0 0 ${size * 2}px ${color}`;

        // Random start along the blade roughly
        const startX = midX - 200 + Math.random() * 400; // Spread along blade length
        const startY = midY + (Math.random() * 20 - 10);

        p.style.left = startX + 'px';
        p.style.top = startY + 'px';

        // Random Float Dir
        const dx = (Math.random() - 0.5) * 100;
        p.style.setProperty('--dx', dx + 'px');

        p.style.animationDelay = Math.random() * 0.5 + 's';
        p.style.animationDuration = (Math.random() * 1.5 + 1) + 's';

        container.appendChild(p);

        // Cleanup
        setTimeout(() => p.remove(), 3000);
    }
}

function resetForge() {
    document.getElementById('forgeResult').style.display = 'none';
    selectForgeMode(null); // Back to start but clear selection
    document.getElementById('forgeModeSelect').style.display = 'block';

    // Clean Blade
    const blade = document.getElementById('swordBlade');
    blade.className = 'blade';
    document.getElementById('swordColorLayer').style.width = '0';
    document.getElementById('bladeAura').style.opacity = 0;
    document.getElementById('bladeEngraving').style.opacity = 0;
    document.getElementById('bladeEngraving').innerText = '';
}

function equipSword() {
    alert("Espada equipada! O poder flui em você.");
    // Connect to actual inventory later
}
