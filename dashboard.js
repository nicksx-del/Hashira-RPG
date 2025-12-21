/* DASHBOARD JS - MODULAR & POLISHED */

let humanData = {};
let currentBreathingStyle = 'water';
let concentrationInterval = null;

// SKILL MAP
const SKILL_MAP = {
    str: ['Atletismo'],
    dex: ['Acrobacia', 'Furtividade', 'Prestidigitação'],
    con: [],
    int: ['Arcanismo', 'História', 'Investigação', 'Natureza', 'Religião'],
    wis: ['Adestrar Animais', 'Intuição', 'Medicina', 'Percepção', 'Sobrevivência'],
    cha: ['Enganação', 'Intimidação', 'Atuação', 'Persuasão']
};

function saveHuman() {
    localStorage.setItem('demonSlayerChar', JSON.stringify(humanData));
}

function loadHuman() {
    const raw = localStorage.getItem('demonSlayerChar');
    if (raw) {
        humanData = JSON.parse(raw);
        if (!humanData.level) humanData.level = 1;
        if (!humanData.xp) humanData.xp = 0;
        if (!humanData.attacks) humanData.attacks = [];
        if (!humanData.inventory) humanData.inventory = [];
        if (!humanData.stats) humanData.stats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    } else {
        humanData = {
            name: "Caçador",
            level: 1,
            xp: 0,
            stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
            attacks: [],
            inventory: []
        };
    }
    window.charData = humanData;
}

function initDashboard() {
    loadHuman();

    // UI Elements
    const nameEl = document.getElementById('dispName');
    if (nameEl) nameEl.textContent = humanData.name;

    const rankEl = document.getElementById('dispRank');
    if (rankEl) rankEl.textContent = getRankName(humanData.level);

    const levelEl = document.getElementById('dispLevel');
    if (levelEl) levelEl.textContent = humanData.level;

    const xpEl = document.getElementById('dispXP');
    if (xpEl) xpEl.textContent = humanData.xp;

    updateVitalsUI();
    renderAttributes();
    renderBreathing();
    renderAttacks();
    renderStore();

    if (window.renderInventory) window.renderInventory();
    if (window.lucide) lucide.createIcons();

    updateNichirinVisuals();
    populateForgeUI();
}

function getRankName(lvl) {
    if (lvl <= 2) return "Mizunoto";
    if (lvl <= 4) return "Mizunoe";
    if (lvl <= 6) return "Kanoto";
    if (lvl <= 8) return "Kanoe";
    if (lvl <= 10) return "Tsuchinoto";
    if (lvl <= 12) return "Tsuchinoe";
    if (lvl <= 15) return "Hinoe";
    if (lvl <= 18) return "Hashira";
    return "Hashira Lendário";
}

function updateVitalsUI() {
    let maxHP = 20 + ((humanData.level - 1) * 5);
    let maxPE = humanData.level;

    if (window.HunterSystem) {
        // calc hooks
    }

    humanData.maxHP = maxHP;
    humanData.maxPE = maxPE;
    if (!humanData.currentHP) humanData.currentHP = maxHP;
    if (humanData.currentPE === undefined) humanData.currentPE = maxPE;

    const hpPct = (humanData.currentHP / maxHP) * 100;
    const pePct = (humanData.currentPE / maxPE) * 100;

    const hpBar = document.querySelector('.bar-hp');
    if (hpBar) hpBar.style.width = hpPct + "%";

    const peBar = document.querySelector('.bar-pe');
    if (peBar) peBar.style.width = pePct + "%";

    const peDisp = document.getElementById('peDisplay');
    if (peDisp) peDisp.textContent = humanData.currentPE + " / " + maxPE;

    const peDispSidebar = document.getElementById('peDisplaySidebar');
    if (peDispSidebar) peDispSidebar.textContent = humanData.currentPE + " / " + maxPE;
}

function changeLevel(delta) {
    let newLvl = humanData.level + delta;
    if (newLvl < 1) newLvl = 1;
    if (newLvl > 20) newLvl = 20;

    if (newLvl !== humanData.level) {
        humanData.level = newLvl;
        if (delta > 0) {
            showToast(`Nível UP! Agora você é nível ${newLvl}`, "success");

            if (window.HunterSystem) {
                const feats = window.HunterSystem.getLevelData(newLvl).features;
                feats.forEach(f => {
                    const exists = humanData.inventory.find(i => i.name === f && i.category === 'feature');
                    if (!exists) {
                        humanData.inventory.push({
                            name: f, type: 'feature', category: 'feature',
                            desc: window.HunterSystem.FEAT_DESCRIPTIONS[f] || "Habilidade",
                            image: 'star'
                        });
                        showToast("Nova Habilidade: " + f, "info");
                    }
                });
            }
        }
        saveHuman();
        initDashboard();
    }
}

// --- NEW ATTRIBUTE RENDER WITH SKILLS ---
function renderAttributes() {
    const grid = document.getElementById('attrGrid');
    if (!grid) return;
    grid.innerHTML = "";

    const stats = humanData.stats;
    const map = { str: 'Força', dex: 'Destreza', con: 'Constituição', int: 'Inteligência', wis: 'Sabedoria', cha: 'Carisma' };

    // Create Layout
    // We will clear existing styles and add new ones inline or via class
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
    grid.style.gap = '20px';

    Object.keys(stats).forEach(k => {
        const val = stats[k];
        const mod = Math.floor((val - 10) / 2);

        const col = document.createElement('div');
        col.className = 'attr-column';
        col.style.background = 'rgba(255,255,255,0.03)';
        col.style.borderRadius = '12px';
        col.style.padding = '1rem';
        col.style.border = '1px solid rgba(255,255,255,0.05)';

        // Attribute Header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '1rem';
        header.style.cursor = 'pointer';
        header.style.paddingBottom = '10px';
        header.style.borderBottom = '1px solid rgba(255,255,255,0.1)';

        header.innerHTML = `
            <div style="display:flex; flex-direction:column;">
                <span style="font-size:1.1rem; font-weight:bold; color:#fff; font-family:'Cinzel', serif;">${map[k]}</span>
                <span style="font-size:0.75rem; color:#666; letter-spacing:1px;">${k.toUpperCase()}</span>
            </div>
            <div style="text-align:right;">
                <span style="font-size:1.5rem; font-weight:800; color:${mod >= 0 ? '#00b4d8' : '#d90429'}; text-shadow:0 0 10px rgba(0,0,0,0.5);">${mod >= 0 ? '+' : ''}${mod}</span>
                <div style="font-size:0.7rem; color:#555;">Valor: ${val}</div>
            </div>
        `;

        header.onclick = () => rollCheck(map[k], mod);
        col.appendChild(header);

        // Skills List
        if (SKILL_MAP[k] && SKILL_MAP[k].length > 0) {
            const skillsList = document.createElement('div');
            skillsList.style.display = 'flex';
            skillsList.style.flexDirection = 'column';
            skillsList.style.gap = '5px';

            SKILL_MAP[k].forEach(skill => {
                const sRow = document.createElement('div');
                sRow.style.display = 'flex';
                sRow.style.justifyContent = 'space-between';
                sRow.style.fontSize = '0.85rem';
                sRow.style.color = '#aaab';
                sRow.style.padding = '4px 8px';
                sRow.style.borderRadius = '4px';
                sRow.style.cursor = 'pointer';
                sRow.style.transition = 'background 0.2s';

                // Prof check is simplified for now
                // We assume if it's in inventory as a skill, you are proficient
                const isProf = humanData.inventory && humanData.inventory.some(i => i.type === 'skill' && i.name === skill);
                const profBonus = window.HunterSystem ? window.HunterSystem.calculateProficiency(humanData.level) : 2;
                const total = mod + (isProf ? profBonus : 0);

                sRow.innerHTML = `<span>${skill}</span> <span style="color:#fff;">${total >= 0 ? '+' : ''}${total}</span>`;
                sRow.onmouseover = () => sRow.style.background = 'rgba(255,255,255,0.05)';
                sRow.onmouseout = () => sRow.style.background = 'transparent';
                sRow.onclick = (e) => {
                    e.stopPropagation();
                    rollCheck(skill, total);
                };

                skillsList.appendChild(sRow);
            });
            col.appendChild(skillsList);
        }

        grid.appendChild(col);
    });
}

function rollCheck(label, mod) {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + mod;

    showCombatResult(label, {
        total: total,
        expr: `d20 (${d20}) ${mod >= 0 ? '+' : ''} ${mod}`,
        isAttack: false
    });
}
// ----------------------------------------

function renderBreathing(forceStyleId = null) {
    if (forceStyleId) currentBreathingStyle = forceStyleId;
    updateNichirinVisuals();

    const locked = document.getElementById('breathingLocked');
    const unlocked = document.getElementById('breathingUnlocked');

    // Unlock Check
    if (humanData.level < 3) {
        if (locked) locked.style.display = 'block';
        if (unlocked) unlocked.style.display = 'none';
        return;
    }

    if (locked) locked.style.display = 'none';
    if (unlocked) unlocked.style.display = 'block';

    const container = document.getElementById('breathingUnlocked');
    container.innerHTML = "";

    // Available Styles from DB
    const db = window.BreathingDB || {};
    const stylesList = [
        { id: 'water', name: 'Água', icon: 'droplets', color: '#00b4d8' },
        { id: 'thunder', name: 'Trovão', icon: 'zap', color: '#ffd700' },
        { id: 'beast', name: 'Fera', icon: 'skull', color: '#7b8cde' },
        { id: 'flame', name: 'Chamas', icon: 'flame', color: '#ff4d00' }
    ];

    // Build Layout HTML
    const layout = document.createElement('div');
    layout.className = 'breathing-layout';

    // 1. SIDEBAR
    const sidebar = document.createElement('div');
    sidebar.className = 'b-sidebar';

    stylesList.forEach(s => {
        const item = document.createElement('div');
        const isActive = s.id === currentBreathingStyle;
        item.className = `style-item ${isActive ? 'active' : ''} ${s.id}`;

        let iconColor = isActive ? '#fff' : s.color;

        item.innerHTML = `
            <div class="style-icon"><i data-lucide="${s.icon}" color="${iconColor}"></i></div>
            <span class="style-name">${s.name}</span>
        `;

        item.onclick = () => {
            renderBreathing(s.id);
        };
        sidebar.appendChild(item);
    });
    layout.appendChild(sidebar);

    // 2. CONTENT AREA
    const content = document.createElement('div');
    content.className = 'b-content theme-' + currentBreathingStyle;

    const styleData = db[currentBreathingStyle];

    // Convert level to Mastery % (Lv 20 = 100%)
    const masteryPct = Math.min(humanData.level * 5, 100);
    const concActive = concentrationInterval !== null;

    content.innerHTML = `
        <div class="style-header">
            <div>
                <div class="sh-title">${styleData ? styleData.name : 'Desconhecido'}</div>
                <div class="sh-subtitle">${styleData ? styleData.description : '...'}</div>
            </div>
            <div class="conc-toggle ${concActive ? 'active' : ''}" onclick="toggleConcentration(this)">
                <div class="conc-dot"></div>
                <span style="font-size:0.75rem; font-weight:700; color:#ccc;">CONCENTRAÇÃO TOTAL</span>
            </div>
        </div>

        <div class="mastery-container">
            <div class="mastery-label">
                <span>Nível de Maestria</span>
                <span>Nv. ${humanData.level} / 20</span>
            </div>
            <div class="mastery-track">
                <div class="mastery-fill ${currentBreathingStyle}" style="width: ${masteryPct}%;"></div>
            </div>
        </div>

        <div class="forms-grid" id="styleFormsGrid"></div>
    `;
    layout.appendChild(content);

    container.appendChild(layout);

    if (styleData) {
        renderFormsToGrid(document.getElementById('styleFormsGrid'), styleData);
    }

    if (window.lucide) lucide.createIcons();
}

function renderFormsToGrid(grid, styleData) {
    if (!grid || !styleData) return;

    // Calculate Evolution Tier
    let evoIndex = -1;
    if (humanData.level >= 17) evoIndex = 3;
    else if (humanData.level >= 13) evoIndex = 2;
    else if (humanData.level >= 10) evoIndex = 1;
    else if (humanData.level >= 7) evoIndex = 0;

    styleData.forms.forEach((f, i) => {
        const c = document.createElement('div');
        c.className = 'form-card';
        c.style.animationDelay = (i * 0.1) + 's';

        let currentDmg = f.damage;
        let currentDesc = f.desc;
        let evoText = "";
        let isEvolved = false;

        if (evoIndex >= 0 && f.evolutions && f.evolutions[evoIndex]) {
            const evoString = f.evolutions[evoIndex];
            isEvolved = true;
            const tiers = ["I", "II", "III", "IV"];
            evoText = `EVOLUÇÃO ${tiers[evoIndex]}`;
            const dmgMatch = evoString.match(/(\d+d\d+)/);
            if (dmgMatch) {
                currentDmg = `<span style="color:#fff; text-shadow:0 0 5px currentColor;">${dmgMatch[0]}</span>`;
            }
            currentDesc = `<span style="opacity:0.5; text-decoration:line-through; font-size:0.8rem;">${f.desc}</span><div style="color:#fff; margin-top:4px; font-weight:600;">${evoString}</div>`;
        }

        c.innerHTML = `
            <div class="form-header-bg">
                <div style="display:flex; flex-direction:column;">
                    <span class="form-name">${f.name}</span>
                    ${isEvolved ? `<span style="font-size:0.65rem; color:#ffd700; font-weight:700; letter-spacing:1px; margin-top:4px; display:flex; align-items:center; gap:4px;"><i data-lucide="sparkles" size="10"></i> ${evoText}</span>` : ''}
                </div>
                <div class="form-cost-badge">
                   ${f.cost} <span>PE</span>
                </div>
            </div>
            
            <div class="form-body">
                <div class="form-stats-grid">
                     <div class="stat-box">
                        <span class="stat-label">Dano</span>
                        <span class="stat-value"><i data-lucide="sword" size="14"></i> ${currentDmg}</span>
                     </div>
                     <div class="stat-box">
                        <span class="stat-label">Alcance</span>
                        <span class="stat-value"><i data-lucide="maximize" size="14"></i> ${f.range || 'Toque'}</span>
                     </div>
                </div>
                <div class="form-desc">${currentDesc}</div>
            </div>

            <div class="form-actions">
                <button class="form-use-btn" onclick="useBreathing(${f.cost}, '${f.name.replace(/'/g, "\\'")}', '${currentDmg.replace(/<[^>]*>/g, '')}')">
                    <i data-lucide="waves"></i> EXECUTAR
                </button>
            </div>
        `;
        grid.appendChild(c);
    });
}

function toggleConcentration(btn) {
    if (concentrationInterval) {
        clearInterval(concentrationInterval);
        concentrationInterval = null;
        btn.classList.remove('active');
        showToast("Concentração Desligada.", "info");
    } else {
        if (humanData.currentPE < 1) {
            showToast("Sem energia para manter!", "error");
            return;
        }
        btn.classList.add('active');
        showToast("⚠️ Concentração Total! (PE sendo drenado...)", "info");

        concentrationInterval = setInterval(() => {
            if (humanData.currentPE > 0) {
                humanData.currentPE--;
                updateVitalsUI();
            } else {
                clearInterval(concentrationInterval);
                concentrationInterval = null;
                btn.classList.remove('active');
                showToast("Exausto! Concentração falhou.", "error");
                renderBreathing();
            }
        }, 3000);
    }
}

function useBreathing(cost, name, damage) {
    if (humanData.currentPE < cost) {
        showToast("Pontos de Energia insuficientes!", "error");
        return;
    }
    humanData.currentPE -= cost;
    saveHuman();
    renderBreathing();
    updateVitalsUI();

    // Parse & Roll
    const rollData = parseAndRoll(damage);
    showCombatResult(name, rollData);
}

function renderAttacks() {
    const list = document.getElementById('attacksList');
    if (!list) return;
    list.innerHTML = "";
    humanData.attacks.forEach((a, i) => {
        const row = document.createElement('div');
        row.className = 'attack-row';
        row.innerHTML = `
            <div class="atk-info">
                <div class="atk-name">${a.name}</div>
                <div class="atk-meta">${a.type} • ${a.damage}</div>
            </div>
            <div class="atk-actions">
                <button class="roll-atk-btn" onclick="rollAttack(${i})">ATACAR</button>
                <button class="del-atk-btn" onclick="deleteAttack(${i})"><i data-lucide="trash-2"></i></button>
            </div>
        `;
        list.appendChild(row);
    });
    if (window.lucide) lucide.createIcons();
}


function rollAttack(idx) {
    const atk = humanData.attacks[idx];
    const rollData = parseAndRoll(atk.damage, atk.type);

    // Hit Roll logic
    // Assuming Proficiency + Attribute mod logic is wanted eventually, 
    // but for now just raw d20 or we can ask user to add bonus in name/type
    // keeping it simple d20 for "isAttack" flag
    const hit = Math.floor(Math.random() * 20) + 1;
    rollData.hit = hit;
    rollData.isAttack = true;

    showCombatResult(atk.name, rollData);
}

// --- COMBAT HELPERS ---
function parseAndRoll(str, extraType) {
    // match XdY(+/-Z)
    // str example: "2d10 Frio"
    const regex = /(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/;
    const match = str.match(regex);

    let total = 0;
    let details = [];
    let expr = str;
    let type = extraType || "";

    if (match) {
        const count = parseInt(match[1]);
        const sides = parseInt(match[2]);
        const modSign = match[3];
        const modVal = match[4] ? parseInt(match[4]) : 0;

        for (let i = 0; i < count; i++) {
            const r = Math.floor(Math.random() * sides) + 1;
            total += r;
            details.push(r);
        }

        if (modSign === '+') total += modVal;
        if (modSign === '-') total -= modVal;

        // Improve expr string
        let modStr = "";
        if (modSign && modVal) modStr = ` ${modSign} ${modVal}`;
        expr = `${count}d${sides}${modStr} [${details.join(', ')}]${modStr}`;
    } else {
        // Fallback checks
        const flat = parseInt(str);
        if (!isNaN(flat)) total = flat;
    }

    // Extract type from string if not provided
    if (!type) {
        const remain = str.replace(regex, '').trim();
        if (remain && remain.length > 1) type = remain;
    }

    return { total, expr, type, original: str };
}

function showCombatResult(title, data) {
    const m = document.getElementById('combatResultModal');
    if (!m) return;

    document.getElementById('combatTitle').textContent = title;

    // Cleanup visual type
    const totalEl = document.getElementById('combatRollTotal');
    totalEl.textContent = data.total;

    let html = `<div style="color:#ccc;">${data.expr}</div>`;
    if (data.type) html += `<div style="margin-top:5px; color:#888; text-transform:uppercase; font-size:0.75rem; letter-spacing:1px; border:1px solid #333; display:inline-block; padding:2px 8px; border-radius:4px;">${data.type}</div>`;

    if (data.isAttack) {
        let hitColor = '#fff';
        if (data.hit === 20) hitColor = '#ffd700'; // Crit color
        if (data.hit === 1) hitColor = '#d90429'; // Fail color

        html += `<div style="margin-top:20px; border-top:1px solid #333; padding-top:15px; width:100%;">
            <div style="font-size:0.8rem; color:#666; margin-bottom:5px;">TESTE DE ACERTO (d20)</div>
            <div style="font-size:2rem; color:${hitColor}; font-weight:700;">${data.hit}</div>
        </div>`;
    }

    document.getElementById('combatDetails').innerHTML = html;

    // Theme sync
    const content = m.querySelector('.combat-modal-content');
    content.className = 'combat-modal-content';
    if (!data.isAttack && typeof currentBreathingStyle !== 'undefined') {
        content.classList.add('theme-' + currentBreathingStyle);
    }

    m.style.display = 'flex';
}

function closeCombatModal() {
    const m = document.getElementById('combatResultModal');
    if (m) m.style.display = 'none';
}


function openAttackModal() {
    const modal = document.getElementById('attackModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('atkNameInput').value = '';
        document.getElementById('atkDmgInput').value = '';
    }
}

function closeAttackModal() {
    const modal = document.getElementById('attackModal');
    if (modal) modal.style.display = 'none';
}

function confirmAddAttack() {
    const name = document.getElementById('atkNameInput').value;
    const dmg = document.getElementById('atkDmgInput').value;
    const type = document.getElementById('atkTypeInput').value;
    if (!name || !dmg) {
        showToast("Preencha campos!", "error");
        return;
    }
    humanData.attacks.push({ name, damage: dmg, type });
    saveHuman();
    renderAttacks();
    closeAttackModal();
    showToast("Ataque criado!", "success");
}

function deleteAttack(idx) {
    if (confirm("Apagar?")) {
        humanData.attacks.splice(idx, 1);
        saveHuman();
        renderAttacks();
    }
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) { alert(msg); return; }
    const toast = document.createElement('div');
    toast.className = 'ds-toast toast-' + type;
    toast.textContent = msg;
    toast.style.background = '#111';
    toast.style.border = '1px solid #333';
    toast.style.color = '#fff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '6px';
    toast.style.marginBottom = '10px';
    toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    if (type === 'success') toast.style.borderColor = '#00b4d8';
    if (type === 'error') toast.style.borderColor = '#d90429';
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

window.addEventListener('DOMContentLoaded', initDashboard);

function updateNichirinVisuals() {
    const blade = document.getElementById('swordBlade');
    if (!blade) return;

    // Reset classes
    blade.className = 'blade';

    // Map style to color
    const styleMap = {
        'water': 'blue',
        'thunder': 'yellow',
        'flame': 'red',
        'beast': 'indigo'
    };

    const colorClass = styleMap[currentBreathingStyle] || 'black';
    blade.classList.add(colorClass);

    // Mastery Effect (Level 10+)
    if (humanData.level >= 10) {
        blade.classList.add('mastered');
    }
}

// --- FORGE LOGIC ---
function populateForgeUI() {
    const sel = document.getElementById('elementSelect');
    if (!sel) return;
    sel.innerHTML = "";

    const opts = [
        { val: 'red', label: 'Minério Carmesim (Chamas)' },
        { val: 'blue', label: 'Minério Azul (Água)' },
        { val: 'yellow', label: 'Minério Amarelo (Trovão)' },
        { val: 'green', label: 'Minério Verde (Vento)' },
        { val: 'indigo', label: 'Minério Índigo (Fera)' },
        { val: 'pink', label: 'Minério Rosa (Amor)' },
        { val: 'black', label: 'Minério Negro (Sol/Desconhecido)' }
    ];

    opts.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.val;
        opt.textContent = o.label;
        sel.appendChild(opt);
    });
}

function startForging() {
    const blade = document.getElementById('swordBlade');
    const btn = document.getElementById('forgeBtn');
    const sel = document.getElementById('elementSelect');
    const title = document.getElementById('resultTitle');
    const desc = document.getElementById('resultDesc');

    if (!blade || !btn) return;

    // Lock UI
    btn.disabled = true;
    btn.textContent = "FORJANDO...";

    // Reset visuals
    blade.className = 'blade';
    title.style.opacity = 0;
    desc.style.opacity = 0;

    // Animation Sequence
    let hammers = 0;
    const hammerInterval = setInterval(() => {
        hammers++;

        // Visual Shake & Spark
        const stage = document.querySelector('.sword-stage');
        stage.classList.add('shake');
        createSpark(stage);
        setTimeout(() => stage.classList.remove('shake'), 100);

        // Heat pulse
        const heat = document.querySelector('.heat-glow');
        if (heat) {
            heat.style.opacity = 1;
            setTimeout(() => heat.style.opacity = 0, 300);
        }

        if (hammers >= 5) {
            clearInterval(hammerInterval);
            finishForging(sel.value);
        }
    }, 800);
}

function createSpark(parent) {
    for (let i = 0; i < 5; i++) {
        const s = document.createElement('div');
        s.className = 'spark';
        s.style.left = (50 + (Math.random() * 20 - 10)) + '%';
        s.style.top = '50%';
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 5;

        parent.appendChild(s);

        // Simplified JS animation for position
        let x = 0, y = 0;
        let step = 0;
        const anim = setInterval(() => {
            step++;
            x += Math.cos(angle) * velocity;
            y += Math.sin(angle) * velocity + (step * 0.5); // gravity
            s.style.transform = `translate(${x}px, ${y}px)`;
            s.style.opacity = 1 - (step / 20);

            if (step > 20) {
                clearInterval(anim);
                s.remove();
            }
        }, 30);
    }
}

function finishForging(color) {
    const blade = document.getElementById('swordBlade');
    const btn = document.getElementById('forgeBtn');
    const title = document.getElementById('resultTitle');
    const desc = document.getElementById('resultDesc');

    // Apply new color
    blade.className = `blade ${color} mastered`; // Always mastered for cool factor in forge

    // Text Result
    const map = {
        'red': { t: 'Lâmina de Nichirin Chamejante', d: 'Uma espada que queima com a determinação de Rengoku.' },
        'blue': { t: 'Lâmina de Nichirin Fluida', d: 'A superfície reflete a calma da água parada.' },
        'yellow': { t: 'Lâmina de Nichirin Trovejante', d: 'Raios percorrem o metal incessantemente.' },
        'green': { t: 'Lâmina de Nichirin do Vendaval', d: 'Leve como uma pluma, afiada como uma navalha.' },
        'indigo': { t: 'Lâmina de Nichirin Bestial', d: 'Serrilhada e pronta para rasgar a carne.' },
        'pink': { t: 'Lâmina de Nichirin do Amor', d: 'Flexível e mortal como um chicote.' },
        'black': { t: 'Lâmina de Nichirin Negra', d: 'Um presságio de infortúnio... ou de grande destino?' }
    };

    const res = map[color] || map['black'];

    title.textContent = res.t;
    desc.textContent = res.d;

    title.style.opacity = 1;
    desc.style.opacity = 1;

    btn.textContent = "FORJAR NOVAMENTE";
    btn.disabled = false;

    showToast("Forja Completa!", "success");
}
