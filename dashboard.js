/* DASHBOARD JS - MODULAR & POLISHED */

// SKILL DATABASE
const ALL_SKILLS = [
    "Acrobacia", "Adestrar Animais", "Arcanismo", "Atletismo",
    "Atuação", "Enganação", "Furtividade", "História",
    "Intimidação", "Intuição", "Investigação", "Medicina",
    "Natureza", "Percepção", "Persuasão", "Prestidigitação",
    "Religião", "Sobrevivência"
];

let humanData = {};
let currentBreathingStyle = 'water';
let combatState = { block: false, dodge: false };
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
        // Normalize attributes -> stats (Creation uses .attributes, Dashboard uses .stats)
        if (humanData.attributes && !humanData.stats) {
            humanData.stats = humanData.attributes;
        }
        // Ensure stats exist
        if (!humanData.stats) humanData.stats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        if (!humanData.attacks) humanData.attacks = [];
        if (!humanData.inventory) humanData.inventory = [];

        if (!humanData.level) humanData.level = 1;
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
    window.charData = humanData; // Link for skills_system.js
}

function initDashboard() {
    loadHuman();
    console.log("DASHBOARD INIT - Human Loaded:", humanData);

    // TUTORIAL CHECK (Top Priority)
    // If never seen tutorial OR (proficiencies are few and not marked complete)
    const profCount = humanData.proficiencies ? humanData.proficiencies.length : 0;
    if (!humanData.tutorialComplete && !humanData.skillTutorialSeen) {
        console.log("Triggering Tutorial: Not Complete");
        setTimeout(showSkillTutorial, 500); // Small delay to ensure DOM readiness
    } else if (profCount <= 4 && !humanData.skillTutorialSeen) {
        console.log("Triggering Tutorial: Low Skills");
        setTimeout(showSkillTutorial, 500);
    }

    // UI Elements
    const nameEl = document.getElementById('dispName');
    if (nameEl) nameEl.textContent = humanData.name;

    const rankEl = document.getElementById('dispRank');
    if (rankEl) rankEl.textContent = getRankName(humanData.level);

    const levelEl = document.getElementById('dispLevel');
    if (levelEl) levelEl.textContent = humanData.level;

    const xpEl = document.getElementById('dispXP');
    if (xpEl) xpEl.textContent = humanData.xp;

    updateAvatarUI();

    updateVitalsUI();
    renderAttributes();
    renderAttributes();
    if (typeof renderProficiencies === 'function') renderProficiencies();
    renderBreathing();
    renderBackgroundSkills();
    if (window.renderClassFeaturesInGrimoire) window.renderClassFeaturesInGrimoire(); // NEW TAB
    renderAttacks();
    if (typeof renderForge === 'function') renderForge();
    renderStore();

    // Render Proficiencies (Background & others)
    renderProficiencies();

    // Inventory Fix: Ensure it loads
    if (window.renderInventory) {
        window.renderInventory();
    } else {
        // Retry shortly in case script load order lag
        setTimeout(() => { if (window.renderInventory) window.renderInventory(); }, 500);
    }

    if (window.lucide) lucide.createIcons();

    updateNichirinVisuals();
    populateForgeUI();

    // Starting Gear Check
    if (!humanData.startingGearSelected) {
        if (window.BREATHING_CLASS_DB && typeof showGearSelectionModal === 'function') {
            setTimeout(showGearSelectionModal, 800);
        }
    }

    // Load Details
    if (humanData.details) {
        if (document.getElementById('detailName')) document.getElementById('detailName').value = humanData.details.name || humanData.name || "";
        if (document.getElementById('detailSex')) document.getElementById('detailSex').value = humanData.details.sex || "";
        if (document.getElementById('detailHeight')) document.getElementById('detailHeight').value = humanData.details.height || "";
        if (document.getElementById('detailWeight')) document.getElementById('detailWeight').value = humanData.details.weight || "";
        if (document.getElementById('detailPhysical')) document.getElementById('detailPhysical').value = humanData.details.physical || "";
        if (document.getElementById('detailPersonality')) document.getElementById('detailPersonality').value = humanData.details.personality || "";
        if (document.getElementById('detailIdeals')) document.getElementById('detailIdeals').value = humanData.details.ideals || "";
        if (document.getElementById('detailFlaws')) document.getElementById('detailFlaws').value = humanData.details.flaws || "";
    } else {
        // Init if empty
        humanData.details = {};
        if (document.getElementById('detailName')) document.getElementById('detailName').value = humanData.name || "";
    }
    // Check for Tutorial (Skill Selection)
    if (!humanData.tutorialComplete && !humanData.skillTutorialSeen) {
        showSkillTutorial();
    }
}

// TUTORIAL MODAL LOGIC
function showSkillTutorial() {
    // Check if modal exists, if not create it
    let modal = document.getElementById('skillTutorialModal');
    if (!modal) {
        createSkillTutorialModal();
        modal = document.getElementById('skillTutorialModal');
    }

    // Reset inputs
    const checks = modal.querySelectorAll('input[type="checkbox"]');
    checks.forEach(c => c.checked = false);
    updateTutorialCount();

    modal.style.display = 'flex';
}

function createSkillTutorialModal() {
    // Redefine locally to ensure availability
    const LOCAL_ALL_SKILLS = [
        "Acrobacia", "Adestrar Animais", "Arcanismo", "Atletismo",
        "Atuação", "Enganação", "Furtividade", "História",
        "Intimidação", "Intuição", "Investigação", "Medicina",
        "Natureza", "Percepção", "Persuasão", "Prestidigitação",
        "Religião", "Sobrevivência"
    ];

    const div = document.createElement('div');
    div.id = 'skillTutorialModal';
    div.className = 'modal-overlay';
    div.style.display = 'none';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.background = 'rgba(0,0,0,0.95)';
    div.style.zIndex = '9999999'; // Force top
    div.style.position = 'fixed'; // Force fixed
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '100vw';
    div.style.height = '100vh';

    // Sort skills for better UX
    const sortedSkills = [...LOCAL_ALL_SKILLS].sort();

    // Already have some proficiencies? (e.g. from background)
    const currentProfs = humanData.proficiencies || [];

    let skillsHTML = '';
    sortedSkills.forEach(skill => {
        const isAlready = currentProfs.includes(skill);
        const disabledAttr = isAlready ? 'disabled checked' : '';
        const labelStyle = isAlready ? 'color:#888; cursor:not-allowed;' : 'color:#ccc; cursor:pointer;';
        const alreadyBadge = isAlready ? '<span style="font-size:0.7em; color:#00b4d8; margin-left:5px;">(Antecedente)</span>' : '';

        skillsHTML += `
            <label style="display:flex; align-items:center; gap:10px; padding:10px; background:rgba(255,255,255,0.05); border-radius:6px; ${labelStyle} user-select:none;">
                <input type="checkbox" value="${skill}" ${disabledAttr} onchange="updateTutorialCount()" style="accent-color:#00b4d8; transform:scale(1.3); cursor:pointer;">
                ${skill}
                ${alreadyBadge}
            </label>
        `;
    });

    div.innerHTML = `
        <div class="modal-content" style="background:#141418; padding:40px; width:700px; max-width:95%; border:1px solid #333; border-radius:12px; box-shadow:0 0 50px rgba(0,0,0,0.9);">
            <div style="text-align:center; margin-bottom:30px;">
                <h2 style="font-family:'Cinzel', serif; color:#00b4d8; margin:0 0 10px 0; font-size:2.5rem;">Bem-vindo Jogador</h2>
                <p style="color:#aaa; font-size:1.1rem;">Para concluir a criação do seu personagem, escolha <strong>4 perícias</strong> adicionais.</p>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; max-height:50vh; overflow-y:auto; padding:10px; margin-bottom:30px; background:rgba(0,0,0,0.2); border-radius:8px;">
                ${skillsHTML}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #333; padding-top:20px;">
                <div style="color:#888; font-size:1rem;">Selecionadas: <span id="tutSkillCount" style="color:#fff; font-weight:bold;">0</span> / 4</div>
                <button id="btnFinishTutorial" onclick="finishSkillTutorial()" disabled 
                    style="background:#333; color:#666; border:none; padding:12px 40px; border-radius:6px; font-weight:bold; font-size:1.1rem; cursor:not-allowed; transition:0.3s; letter-spacing:1px;">
                    CONFIRMAR
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(div);
}

window.updateTutorialCount = function () {
    const modal = document.getElementById('skillTutorialModal');
    if (!modal) return;

    // Only count ENABLED checkboxes (user selections), exclude background ones
    const checkboxes = Array.from(modal.querySelectorAll('input[type="checkbox"]:not([disabled])'));
    const checked = checkboxes.filter(c => c.checked);

    // Update counter
    document.getElementById('tutSkillCount').innerText = checked.length;

    const btn = document.getElementById('btnFinishTutorial');

    // Limit to 4
    if (checked.length > 4) {
        // visually warn? or prevent?
        // Let's prevent the last one checked
        // But for simplicity let's just disabling invalid state
    }

    if (checked.length === 4) {
        btn.disabled = false;
        btn.style.background = '#00b4d8';
        btn.style.color = '#fff';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 0 15px rgba(0, 180, 216, 0.4)';

        // Disable unchecked ones?
        checkboxes.forEach(c => {
            if (!c.checked) c.disabled = true;
        });
    } else {
        btn.disabled = true;
        btn.style.background = '#333';
        btn.style.color = '#666';
        btn.style.cursor = 'not-allowed';
        btn.style.boxShadow = 'none';

        // Re-enable all (unless it was > 4)
        checkboxes.forEach(c => c.disabled = false);
    }
};

window.finishSkillTutorial = function () {
    const modal = document.getElementById('skillTutorialModal');
    const checked = Array.from(modal.querySelectorAll('input[type="checkbox"]:checked:not([disabled])'));

    if (checked.length !== 4) return;

    if (!humanData.proficiencies) humanData.proficiencies = [];

    checked.forEach(c => {
        humanData.proficiencies.push(c.value);
    });

    humanData.skillTutorialSeen = true;
    humanData.tutorialComplete = true; // Mark full tutorial as done
    saveHuman();

    modal.style.display = 'none';

    // Refresh UI
    if (typeof renderProficiencies === 'function') renderProficiencies();
    showToast("Perícias salvas com sucesso!", "success");
};

window.updateCharDetail = function (field, value) {
    if (!humanData.details) humanData.details = {};
    humanData.details[field] = value;

    // Special case for name sync
    if (field === 'name') {
        humanData.name = value;
        const nameEl = document.getElementById('dispName');
        if (nameEl) nameEl.textContent = value;
        const nameDisplay = document.getElementById('charNameDisplay');
        if (nameDisplay) nameDisplay.textContent = value;
    }

    saveHuman();
};

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
    let maxHP = 20;
    let maxPE = humanData.level;

    // New Calculation based on Breathing Class
    const db = window.BREATHING_CLASS_DB;
    const style = humanData.breathingStyle || 'water';
    const classData = db ? db[style] : null;

    if (classData) {
        // Con Mod
        const conScore = (humanData.stats ? humanData.stats.con : 10);
        const conMod = Math.floor((conScore - 10) / 2);

        // HP Calc
        // Level 1: Base + Con
        const hpLvl1 = classData.baseHP + conMod;

        // Level > 1: (Avg + Con) per level
        const hpPerLvl = classData.hitDieavg + conMod;

        if (humanData.level === 1) {
            maxHP = hpLvl1;
        } else {
            maxHP = hpLvl1 + ((humanData.level - 1) * hpPerLvl);
        }

        // PE Calc
        maxPE = parseInt(humanData.level) || 1; // PE always equals Level (Int)
    } else {
        // Fallback
        maxHP = 20 + ((humanData.level - 1) * 5);
        maxPE = humanData.level;
    }

    // Check for Manual Overrides
    if (humanData.manualMaxHP) maxHP = humanData.manualMaxHP;
    if (humanData.manualMaxPE) maxPE = humanData.manualMaxPE;

    humanData.maxHP = maxHP;
    humanData.maxPE = maxPE;

    // Bounds Check
    if (!humanData.currentHP && humanData.currentHP !== 0) humanData.currentHP = maxHP;
    // REMOVED HP CAP to allow Temporary HP
    // if (humanData.currentHP > maxHP) humanData.currentHP = maxHP; 

    if (humanData.currentPE === undefined) humanData.currentPE = maxPE;
    // PE Logic: If Max increases, we don't automatically refill, but we should cap if level drops?
    // Actually, let's strictly cap PE Max for now, but allow it to be lower.
    if (humanData.currentPE > maxPE) humanData.currentPE = maxPE;

    // Auto-fill PE if it was equal to old Max? Difficult to know old max.
    // For now, let's just ensure the display is correct.
    // Update: If we just leveled up, maxPE changed. currentPE stays.
    // "1/1" reported bug implies maxPE is 1. ensuring classData load works.

    // Calculate Percentages
    const hpPct = Math.max(0, Math.min(100, (humanData.currentHP / maxHP) * 100));
    const pePct = Math.max(0, Math.min(100, (humanData.currentPE / maxPE) * 100));

    // Update Bars (Using class selectors matching HTML structure)
    // Note: In HTML it is .vital-bar-fill.hp/pe inside .vital-bar-container
    const hpBar = document.querySelector('.vital-bar-fill.hp');
    if (hpBar) hpBar.style.width = hpPct + "%";

    const peBar = document.querySelector('.vital-bar-fill.pe');
    if (peBar) peBar.style.width = pePct + "%";

    // Update Text
    const currHPEl = document.getElementById('currHP');
    const maxHPEl = document.getElementById('maxHP');
    if (currHPEl) currHPEl.textContent = humanData.currentHP;
    if (maxHPEl) maxHPEl.textContent = maxHP;

    // Hit Die Display
    const hdDisplay = document.getElementById('hitDieInfo');
    if (hdDisplay && classData) {
        hdDisplay.innerHTML = `<span style="color:#aaa; font-size:0.8rem;">Vida: 1d${classData.hitDie} + CON por nível</span>`;
    }

    // PE Display (Breathing Tab)
    const peDisp = document.getElementById('peDisplay');
    if (peDisp) peDisp.textContent = humanData.currentPE + " / " + maxPE;

    // PE Display (Vitals Card)
    const currPEEl = document.getElementById('currPE');
    const maxPEEl = document.getElementById('maxPE'); // This targets the span with id="maxPE"
    if (currPEEl) currPEEl.textContent = humanData.currentPE;
    if (maxPEEl) maxPEEl.textContent = maxPE;

    // DYING STATE CHECK
    const dyingUI = document.getElementById('dyingStateUI');
    const normalUI = document.getElementById('hpNormalState');

    if (humanData.currentHP <= 0) {
        if (dyingUI) dyingUI.style.display = 'flex';
        if (normalUI) normalUI.style.display = 'none';

        // Auto-check failure if hit? (Complex rule, let's leave for manual)
    } else {
        if (dyingUI) dyingUI.style.display = 'none';
        if (normalUI) normalUI.style.display = 'block';
    }

    // Also update Stats if present
    updateStatsUI();
}

// Combat Actions
window.combatAction = function (action) {
    const btnBlock = document.getElementById('btnBlock');
    const btnDodge = document.getElementById('btnDodge');

    if (action === 'block') {
        combatState.block = !combatState.block;
        combatState.dodge = false; // Mutually exclusive usually? Let's say yes for simplicity

        if (combatState.block) showToast("🛡️ Postura de Bloqueio (+Def)", "info");
        else showToast("Bloqueio cancelado", "info");
    } else if (action === 'dodge') {
        combatState.dodge = !combatState.dodge;
        combatState.block = false;

        if (combatState.dodge) showToast("💨 Postura de Esquiva (Desvantagem em ataques)", "info");
        else showToast("Esquiva cancelada", "info");
    }

    // Update Visuals
    if (btnBlock) btnBlock.style.borderColor = combatState.block ? '#00b4d8' : '#333';
    if (btnBlock) btnBlock.style.background = combatState.block ? '#00b4d822' : '#111';

    if (btnDodge) btnDodge.style.borderColor = combatState.dodge ? '#ffbf69' : '#333';
    if (btnDodge) btnDodge.style.background = combatState.dodge ? '#ffbf6922' : '#111';

    updateStatsUI();
};

function updateStatsUI() {
    // 1. Armor Class (CA)
    let dex = (humanData.stats ? humanData.stats.dex : 10);
    let dexMod = Math.floor((dex - 10) / 2);
    let ac = 10 + dexMod;

    if (humanData.manualAC !== undefined) {
        ac = humanData.manualAC;
    } else {
        // Check equipped armor
        if (humanData.inventory) {
            const armor = humanData.inventory.find(i => i.type === 'armor' && i.equipped);
            if (armor) {
                let armorAC = 10;
                // Parse Formula
                if (typeof armor.ac === 'string') {
                    const formula = armor.ac.toLowerCase().replace(/\s/g, '');

                    // Pure Number: "17"
                    const matchVal = formula.match(/^(\d+)$/);
                    // Formula: "12+des"
                    const matchDex = formula.includes('des');

                    if (matchVal) {
                        armorAC = parseInt(matchVal[1]);
                        // Heavy armor usually replaces base, so we set AC directly
                        ac = armorAC;
                    } else if (matchDex) {
                        const baseMatch = formula.match(/(\d+)/);
                        const base = baseMatch ? parseInt(baseMatch[1]) : 10;

                        // Medium Armor Cap Logic (Standard 5e: Max 2)
                        let effectiveDex = dexMod;
                        if (armor.subType === 'medium' && effectiveDex > 2) effectiveDex = 2;

                        ac = base + effectiveDex;
                    }
                } else if (typeof armor.ac === 'number') {
                    ac = armor.ac;
                }
            }

            // Shield Bonus (Classic +2)
            // Check for items with 'shield' in name or subType if we had it
            // For now, let's assume if there's an item named "Escudo" equipped
            const shield = humanData.inventory.find(i => i.name.toLowerCase().includes('escudo') && i.equipped);
            if (shield) ac += 2;
        }
    }

    // Combat Mods
    if (combatState.block) ac += 2;
    if (combatState.dodge) ac += dexMod;

    // 2. Speed
    let speed = humanData.manualSpeed || 9;

    // Update DOM
    const acEl = document.getElementById('dispAC');
    if (acEl) acEl.textContent = ac;

    // Visual cue for temp AC
    if (acEl) {
        if (combatState.block || combatState.dodge) {
            acEl.style.color = combatState.dodge ? '#20bf6b' : '#00b4d8';
            acEl.innerText = ac + "*";
        } else {
            acEl.style.color = '#fff';
        }
    }

    const spdEl = document.getElementById('dispSpeed');
    if (spdEl) spdEl.textContent = speed + "m";
}

function changeLevel(delta) {
    let newLvl = humanData.level + delta;
    if (newLvl > humanData.level) {
        // Level UP Flow
        showLevelUpModal(newLvl);
    } else {
        // Level Down (Just update)
        updateLevel(newLvl);
    }
}

function setLevel(lvl) {
    if (lvl > humanData.level) {
        showLevelUpModal(lvl);
    } else {
        updateLevel(lvl);
    }
    toggleLevelSelector(); // Close dropdown
}

function updateLevel(newLvl) {
    if (newLvl < 1) newLvl = 1;
    if (newLvl > 20) newLvl = 20;

    if (newLvl !== humanData.level) {
        humanData.level = newLvl;

        // Ensure PE follows level rule
        delete humanData.manualMaxPE;
        humanData.peMax = newLvl;
        humanData.currentPE = newLvl; // Refill to new max

        // Legacy support if .pe is used elsewhere
        humanData.pe = humanData.currentPE;

        showToast(`Nível alterado para ${newLvl}`, "success");

        // Add Feats Logic
        if (window.HunterSystem) {
            const feats = window.HunterSystem.getFeaturesUpTo(newLvl);
            feats.forEach(f => {
                const exists = humanData.inventory.find(i => i.name === f && i.category === 'feature');
                if (!exists) {
                    humanData.inventory.push({
                        name: f, type: 'feature', category: 'feature',
                        desc: window.HunterSystem.FEAT_DESCRIPTIONS[f] || "Habilidade de Classe",
                        image: 'star'
                    });
                }
            });
        }

        saveHuman();
        initDashboard();

        // Update Form Unlocks if needed
        if (window.renderBreathing) renderBreathing(currentBreathingStyle);
    }
}

// === LEVEL UP MODAL ===
// === LEVEL UP MODAL ===
// === LEVEL UP MODAL ===
function showLevelUpModal(targetLvl) {
    // 1. Get Class Info
    const styleData = BREATHING_CLASS_DB[currentBreathingStyle] || BREATHING_CLASS_DB['water'];
    const hitDie = styleData.hitDie || 8;
    const conMod = getConMod();

    // 2. Calculate Options
    const currentLvl = humanData.level || 1;
    const levelsGained = targetLvl - currentLvl;

    // Single Level Values
    // User Rule: Average is Half Max + Con (e.g. d10 -> 5 + Con)
    const avgHit = Math.floor(hitDie / 2); // Ex: d10 -> 5
    const avgPerLvl = Math.max(1, avgHit + conMod);

    // Cumulative Totals
    const totalAvg = avgPerLvl * levelsGained;

    // Breakdown Text
    const breakdownText = `Média (${avgHit}) + Con (${conMod})`;

    // 3. Create Modal
    let modal = document.getElementById('levelUpModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'levelUpModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    const titleText = levelsGained > 1
        ? `Você subiu ${levelsGained} Níveis!`
        : `Nível ${targetLvl} Alcançado!`;

    const descText = levelsGained > 1
        ? `Sua jornada avança do Nível <span style="color:white; font-weight:bold;">${currentLvl}</span> para <span style="color:white; font-weight:bold;">${targetLvl}</span>`
        : `Aumente sua Vida Máxima como um caçador da <span style="color:var(--accent-cyan);">${styleData.name}</span>`;

    modal.innerHTML = `
        <div class="modal-content" style="max-width:800px; padding:3rem; text-align:center; border:1px solid #333; box-shadow:0 0 50px rgba(0,0,0,0.8); background:#111;">
            
            <div style="font-size:4rem; margin-bottom:1rem; opacity:0.8;">⬆️</div>
            
            <h2 style="font-family:var(--font-display); font-size:2.5rem; color:var(--accent-gold); margin:0 0 1rem 0; line-height:1.2;">
                ${titleText}
            </h2>
            
            <div style="color:#aaa; font-size:1.1rem; margin-bottom:3rem; padding:0 2rem;">
                ${descText}
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-bottom:3rem;">
                
                <!-- OPTION 1: AVERAGE -->
                <div class="level-opt-card" style="position:relative; background:linear-gradient(135deg, #1a1a1a, #222); padding:2rem; border:1px solid #444; border-radius:12px; cursor:pointer; transition:all 0.3s ease; display:flex; flex-direction:column; justify-content:center;"
                     onclick="confirmLevelUp(${targetLvl}, 'avg', ${totalAvg}, null, ${levelsGained})"
                     onmouseover="this.style.borderColor='var(--accent-gold)'; this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.5)'"
                     onmouseout="this.style.borderColor='#444'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    
                    <div style="font-size:0.9rem; letter-spacing:1px; font-weight:bold; color:#888; text-transform:uppercase; margin-bottom:1rem;">Valor Médio Seguro</div>
                    
                    <div style="font-size:4rem; font-weight:bold; color:white; line-height:1;">+${totalAvg}</div>
                    <div style="font-size:0.9rem; color:#666; margin-top:0.5rem;">PV Máximo Total</div>

                    <div style="margin-top:2rem; padding-top:1.5rem; border-top:1px solid #333;">
                        <div style="font-size:0.8rem; color:#aaa;">Cálculo por Nível:</div>
                        <div style="font-size:1.1rem; color:var(--accent-gold); font-weight:bold; margin-top:5px;">
                            ${levelsGained}x [ ${avgHit} + ${conMod} ]
                        </div>
                        <div style="font-size:0.8rem; color:#666; margin-top:5px;">(Média do dado + Constituição)</div>
                    </div>
                </div>

                <!-- OPTION 2: ROLL -->
                <div class="level-opt-card" style="position:relative; background:linear-gradient(135deg, #1a1a1a, #222); padding:2rem; border:1px solid #444; border-radius:12px; cursor:pointer; transition:all 0.3s ease; display:flex; flex-direction:column; justify-content:center;"
                     onclick="confirmLevelUp(${targetLvl}, 'roll', ${hitDie}, ${conMod}, ${levelsGained})"
                     onmouseover="this.style.borderColor='var(--accent-cyan)'; this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.5)'"
                     onmouseout="this.style.borderColor='#444'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    
                    <div style="font-size:0.9rem; letter-spacing:1px; font-weight:bold; color:#888; text-transform:uppercase; margin-bottom:1rem;">Arriscar nos Dados</div>
                    
                    <div style="font-size:4rem; font-weight:bold; color:var(--accent-cyan); line-height:1;">${levelsGained}d${hitDie}</div>
                    <div style="font-size:0.9rem; color:#666; margin-top:0.5rem;">Total de Dados</div>

                    <div style="margin-top:2rem; padding-top:1.5rem; border-top:1px solid #333;">
                        <div style="font-size:0.8rem; color:#aaa;">Bônus Garantido:</div>
                        <div style="font-size:1.1rem; color:var(--accent-cyan); font-weight:bold; margin-top:5px;">
                            +${levelsGained * conMod} PV
                        </div>
                        <div style="font-size:0.8rem; color:#666; margin-top:5px;">(Constituição acumulada)</div>
                    </div>
                </div>

            </div>

            <button onclick="document.getElementById('levelUpModal').style.display='none'" style="background:transparent; border:none; color:#666; cursor:pointer; font-size:1rem; padding:10px 20px; border-radius:4px; transition:0.3s;" onmouseover="this.style.color='white'; this.style.background='#222'" onmouseout="this.style.color='#666'; this.style.background='transparent'">
                Cancelar e Voltar
            </button>
        </div>
    `;

    modal.style.display = 'flex';
    modal.classList.add('open');
}

function confirmLevelUp(lvl, mode, val1, val2, count = 1) {
    const modal = document.getElementById('levelUpModal');
    if (modal) modal.style.display = 'none';

    let hpGain = 0;

    if (mode === 'avg') {
        hpGain = val1; // Pre-calculated total
        applyLevelUp(lvl, hpGain); // Instant apply for avg
    } else {
        // Roll: val1 = die, val2 = con, count = levels
        const die = val1;
        const conPerLvl = val2;
        let rolls = [];
        let totalRoll = 0;

        for (let i = 0; i < count; i++) {
            const r = Math.floor(Math.random() * die) + 1;
            rolls.push(r);
            totalRoll += Math.max(1, r + conPerLvl);
        }
        hpGain = totalRoll;

        // Trigger 3D Dice and wait for user to close to apply? 
        // Or apply in background but show visual?
        // Let's show visual.
        showLevelUpDice(rolls, conPerLvl * count, hpGain, lvl);
    }
}

// Global callback for closing overlay
let pendingLevelUpData = null;
let pendingAttackData = null;

function applyLevelUp(lvl, hpGain) {
    // Apply Changes: Update manualMaxHP to persist over auto-calc
    if (!humanData.manualMaxHP) {
        humanData.manualMaxHP = humanData.maxHP || 20;
    }

    humanData.manualMaxHP += hpGain;
    humanData.currentHP = humanData.manualMaxHP; // Heal Full

    updateLevel(lvl);
    if (typeof showToast === 'function') {
        showToast(`Nível ${lvl}! +${hpGain} PV | ${lvl} PE`, "success");
    }
}

function showLevelUpDice(rolls, conTotal, totalGain, lvl) {
    const overlay = document.getElementById('diceOverlay');
    const diceDiv = document.getElementById('diceElement');
    const resDisplay = document.getElementById('diceResultDisplay');
    const infoPanel = document.getElementById('diceInfoPanel');
    const glow = document.querySelector('.dice-glow');

    if (!overlay) {
        // Fallback if overlay fails to load
        alert(`Rolagem: ${rolls.join(', ')}\nTotal: +${totalGain} HP`);
        applyLevelUp(lvl, totalGain);
        return;
    }

    // Prepare Data for Close
    pendingLevelUpData = { lvl, hpGain: totalGain };

    // Reset State
    resDisplay.classList.remove('show', 'crit', 'fail');
    resDisplay.style.opacity = '0';
    infoPanel.style.display = 'none';
    infoPanel.style.opacity = '0';
    diceDiv.classList.remove('rolling');
    void diceDiv.offsetWidth; // trigger reflow

    // Show Overlay
    overlay.classList.add('show');

    // Start Rolling Animation
    diceDiv.classList.add('rolling');

    // Play Sound if available
    // const audio = new Audio('assets/dice_roll.mp3'); audio.play();

    // After 1s (End of spin)
    setTimeout(() => {
        // Show Number
        const finalVal = rolls.reduce((a, b) => a + b, 0); // Show sum of dice? Or just first die? 
        // User asked for "jogasse um dado 3d". If multiple levels, maybe show sum of dice on face?
        // A d20 face showing '15' is fine.

        let faceVal = finalVal;
        // Cap visual to 20 or just show number? CSS face font adjusts.
        document.querySelector('.dice-face').innerText = faceVal;

        resDisplay.innerText = faceVal;
        resDisplay.classList.add('show');

        // Crit/Fail visual logic (based on average die size?)
        // Let's just make it look cool uniformly for HP.
        resDisplay.classList.add('crit'); // Always celebrate Level Up

        // Show Details Panel
        document.getElementById('diceInfoTitle').innerText = `NÍVEL ${lvl} ALCANÇADO`;
        document.getElementById('diceInfoDesc').innerHTML = `
            <div style="font-size:0.9rem; color:#aaa; margin-bottom:5px;">Dados: [${rolls.join(', ')}]</div>
            <div style="font-size:0.9rem; color:#aaa;">+ Bônus CON: ${conTotal}</div>
        `;
        document.getElementById('diceInfoValue').innerText = `+${totalGain} PV`; // Total Gain

        infoPanel.style.display = 'block';
        setTimeout(() => infoPanel.style.opacity = '1', 100);

    }, 1000);
}

window.closeDiceOverlay = function () {
    const overlay = document.getElementById('diceOverlay');
    if (overlay) overlay.classList.remove('show');

    if (pendingLevelUpData) {
        applyLevelUp(pendingLevelUpData.lvl, pendingLevelUpData.hpGain);
        pendingLevelUpData = null;
    } else if (pendingAttackData) {
        showCombatResult(pendingAttackData.name, pendingAttackData.rollData);
        pendingAttackData = null;
    }
};

function showAttackDice(name, rollData) {
    const overlay = document.getElementById('diceOverlay');
    const diceDiv = document.getElementById('diceElement');
    const resDisplay = document.getElementById('diceResultDisplay');
    const infoPanel = document.getElementById('diceInfoPanel');

    if (!overlay) {
        showCombatResult(name, rollData);
        return;
    }

    pendingAttackData = { name, rollData };

    // Reset State
    resDisplay.classList.remove('show', 'crit', 'fail');
    resDisplay.style.opacity = '0';
    infoPanel.style.display = 'none';
    infoPanel.style.opacity = '0';
    diceDiv.classList.remove('rolling');
    void diceDiv.offsetWidth; // trigger reflow

    // Show Overlay
    overlay.classList.add('show');
    diceDiv.classList.add('rolling');

    // After 1s
    setTimeout(() => {
        const hitVal = rollData.hit;
        document.querySelector('.dice-face').innerText = hitVal;

        resDisplay.innerText = hitVal;
        resDisplay.classList.add('show');

        if (hitVal === 20) resDisplay.classList.add('crit');
        if (hitVal === 1) resDisplay.classList.add('fail');

        // Show Details Panel
        document.getElementById('diceInfoTitle').innerText = name.toUpperCase();
        document.getElementById('diceInfoDesc').innerText = "TESTE DE ACERTO";
        document.getElementById('diceInfoValue').innerText = hitVal;

        infoPanel.style.display = 'block';
        setTimeout(() => infoPanel.style.opacity = '1', 100);

    }, 1000);
}

function getConMod() {
    const con = humanData.attributes ? humanData.attributes.con : 10;
    return Math.floor((con - 10) / 2);
}

// Header Interactions

// Header Interactions
// NEW VITALS LOGIC (Unified Mobile/Desktop)

let rapidChangeInterval = null;

function changeVital(type, amount) {
    if (type === 'hp') {
        if (!humanData.currentHP && humanData.currentHP !== 0) humanData.currentHP = humanData.maxHP;
        humanData.currentHP += amount;
        if (humanData.currentHP < 0) humanData.currentHP = 0;
        if (humanData.currentHP > humanData.maxHP) humanData.currentHP = humanData.maxHP;
    } else if (type === 'pe') {
        if (humanData.currentPE === undefined) humanData.currentPE = humanData.maxPE;
        humanData.currentPE += amount;
        if (humanData.currentPE < 0) humanData.currentPE = 0;
        if (humanData.currentPE > humanData.maxPE) humanData.currentPE = humanData.maxPE;
    }
    saveHuman();
    updateVitalsUI();
}

function startRapidChange(type, dir) {
    if (rapidChangeInterval) stopRapidChange();
    const amount = dir === 'add' ? 5 : -5; // Fast increment/decrement
    // Immediate first tick
    changeVital(type, dir === 'add' ? 1 : -1);

    // Hold delay then rapid
    setTimeout(() => {
        if (rapidChangeInterval) return; // Prevent double
        rapidChangeInterval = setInterval(() => {
            changeVital(type, amount);
        }, 150);
    }, 300);
}

function stopRapidChange() {
    if (rapidChangeInterval) {
        clearInterval(rapidChangeInterval);
        rapidChangeInterval = null;
    }
}

function editVital(type) {
    const currentMax = type === 'hp' ? humanData.maxHP : humanData.maxPE;
    const label = type === 'hp' ? "Vida Máxima" : "Energia Máxima";

    const newVal = prompt(`Definir novo valor para ${label}:`, currentMax);
    if (newVal !== null && newVal.trim() !== "") {
        const parsed = parseInt(newVal);
        if (!isNaN(parsed) && parsed > 0) {
            if (type === 'hp') {
                humanData.maxHP = parsed;
                if (humanData.currentHP > parsed) humanData.currentHP = parsed;
                // Update Manual Max if used
                humanData.manualMaxHP = parsed;
            } else {
                humanData.maxPE = parsed;
                if (humanData.currentPE > parsed) humanData.currentPE = parsed;
            }
            saveHuman();
            updateVitalsUI();
            showToast(`${label} atualizada para ${parsed}.`);
        }
    }
}

// Keep legacy wrapper if needed, but HTML now calls changeVital direct
function changeHP(mode) { changeVital('hp', mode === 'add' ? 1 : -1); }
function changePE(mode) { changeVital('pe', mode === 'add' ? 1 : -1); }

function toggleLevelSelector() {
    const selector = document.getElementById('levelSelector');
    if (!selector) return;

    if (selector.style.display === 'none') {
        selector.style.display = 'block';
        // Populate if empty
        if (!selector.hasChildNodes() || selector.childElementCount < 20) {
            selector.innerHTML = "";
            for (let i = 1; i <= 20; i++) {
                const opt = document.createElement('div');
                opt.innerText = i;
                opt.style.padding = "8px 15px";
                opt.style.cursor = "pointer";
                opt.style.color = "#fff";
                opt.style.borderBottom = "1px solid #333";
                opt.className = "lvl-opt";
                opt.onmouseover = () => { opt.style.background = "#333"; };
                opt.onmouseout = () => { opt.style.background = "transparent"; };
                opt.onclick = () => setLevel(i);
                selector.appendChild(opt);
            }
        }
    } else {
        selector.style.display = 'none';
    }
}

function updateCharName(newName) {
    humanData.name = newName.trim();
    saveHuman();
}

window.changeAvatar = function () {
    // Trigger file input click
    const input = document.getElementById('avatarUpload');
    if (input) input.click();
}

window.handleAvatarUpload = function (input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];

        // Size Limit Check (e.g. 2MB) to prevent crashing localStorage
        if (file.size > 2 * 1024 * 1024) {
            alert("A imagem é muito grande! Por favor escolha uma menor que 2MB.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            humanData.avatar = e.target.result; // Base64 string
            saveHuman();
            updateAvatarUI();
        }

        reader.readAsDataURL(file);
    }
}

function updateAvatarUI() {
    const icon = document.getElementById('avatarIcon');
    const img = document.getElementById('avatarImg');

    if (humanData.avatar && humanData.avatar !== '') {
        if (img) {
            img.src = humanData.avatar;
            img.style.display = 'block';
        }
        if (icon) icon.style.display = 'none';
    } else {
        if (img) img.style.display = 'none';
        if (icon) icon.style.display = 'block';
    }
}

// --- VITALS ACTIONS ---
window.editVital = function (type) {
    const isHP = type === 'hp';
    const currentMax = isHP ? humanData.maxHP : humanData.maxPE;
    const currentVal = isHP ? humanData.currentHP : humanData.currentPE;

    // Simple prompt for now, could be a modal
    const newVal = prompt(`Definir novo valor para ${isHP ? 'VIDA' : 'ENERGIA'} (Atual/Máximo):\nFormato: Valor ou Valor/Max`, `${currentVal}/${currentMax}`);

    if (newVal) {
        if (newVal.includes('/')) {
            const parts = newVal.split('/');
            const v = parseInt(parts[0]);
            const m = parseInt(parts[1]);
            if (!isNaN(v)) {
                if (isHP) humanData.currentHP = v;
                else humanData.currentPE = v;
            }
            if (!isNaN(m)) {
                // If max changes, we might want to override the auto-calc or just set a "bonus" property.
                // For simplicity, let's set a temporary override or just update the base if manual mode.
                // But typically Max is derived. Let's assume this is a "manual override" mode.
                if (isHP) humanData.maxHP = m; // This might be overwritten by updateVitalsUI if not careful.
                else humanData.maxPE = m;

                // Set a flag to stop auto-calc from overwriting logic if needed, 
                // OR we update the constitution/level to match? No, that's too complex.
                // Let's just say we trust the user.
                // NOTE: updateVitalsUI() recalculates Max usually. We need to handle that.
                // Let's add a `manualMaxHP` property.
                if (isHP) humanData.manualMaxHP = m;
                else humanData.manualMaxPE = m;
            }
        } else {
            const v = parseInt(newVal);
            if (!isNaN(v)) {
                if (isHP) humanData.currentHP = v;
                else humanData.currentPE = v;
            }
        }
        saveHuman();
        updateVitalsUI();
    }
};

// Regen function removed per user request (Humans don't regen)

window.editAC = function () {
    const current = humanData.manualAC !== undefined ? humanData.manualAC : parseInt(document.getElementById('dispAC').innerText.replace('*', ''));
    const newVal = prompt("Definir Defesa (CA) Base:\n(Deixe em branco para voltar ao automático)", current);

    if (newVal !== null) {
        if (newVal.trim() === '') {
            // Clear manual override
            delete humanData.manualAC;
            showToast("Defesa voltou para o cálculo automático.");
        } else {
            const parsed = parseInt(newVal);
            if (!isNaN(parsed)) {
                humanData.manualAC = parsed;
                showToast(`Defesa base definida para ${parsed}`);
            }
        }
        saveHuman();
        updateStatsUI();
    }
};

window.editSpeed = function () {
    const current = humanData.manualSpeed || 9;
    const newVal = prompt("Definir Deslocamento (em metros):", current);
    if (newVal !== null) {
        const parsed = parseInt(newVal);
        if (!isNaN(parsed)) {
            humanData.manualSpeed = parsed;
            saveHuman();
            updateStatsUI();
        }
    }
};

window.revivePlayer = function () {
    humanData.currentHP = 1;
    saveHuman();
    updateVitalsUI();

    // Optional: Reset death saves visually
    document.querySelectorAll('.death-save').forEach(c => c.checked = false);
    showToast("Você recobrou a consciência!", "success");
};

// --- EQUIPMENT SYNC ---
window.syncCombatValues = function () {
    // 1. Update Defense (AC) - This calls updateStatsUI which handles AC logic
    updateStatsUI();

    // 2. Update Attacks based on Weapons
    const inv = humanData.inventory || [];
    const equippedWeapons = inv.filter(i => i.type === 'weapon' && i.equipped);

    // Remove old auto-generated attacks
    if (humanData.attacks) {
        humanData.attacks = humanData.attacks.filter(a => !a.source || a.source !== 'equipment');
    } else {
        humanData.attacks = [];
    }

    // Add new attacks
    equippedWeapons.forEach(w => {
        humanData.attacks.push({
            name: w.name,
            damage: w.damage || w.dmg || '1d6',
            type: w.props || 'Comum',
            source: 'equipment' // Flag to identify auto-added attacks
        });
    });

    saveHuman();
    renderAttacks();
};

// --- RENDER CLASS FEATURES (SIDEBAR) ---
function renderClassFeatures() {
    const list = document.getElementById('featListContent');
    // Also try to render in the new tab if it exists
    const tabList = document.getElementById('featuresContent');

    // We target both or prioritize tabList if available
    const target = tabList || list;

    if (!target) return;
    target.innerHTML = "";

    const db = window.BREATHING_CLASS_DB;
    const style = humanData.breathingStyle || 'water';
    const classData = db ? db[style] : null;

    if (!classData || !classData.levels) {
        target.innerHTML = `<div style="text-align:center; color:#555; padding:20px;">Nenhuma habilidade desbloqueada.</div>`;
        return;
    }

    let features = [];
    for (let l = 1; l <= humanData.level; l++) {
        if (classData.levels[l] && classData.levels[l].features) {
            features = [...features, ...classData.levels[l].features];
        }
    }

    if (features.length === 0) {
        target.innerHTML = `<div style="text-align:center; color:#555; padding:20px;">Nenhuma habilidade desbloqueada.</div>`;
        return;
    }

    features.forEach(fStr => {
        // Determine Badges & Details
        let type = 'Passiva'; // Default
        let summary = 'Habilidade de classe.';
        let fullDesc = '';

        // Fetch Data
        if (window.FEATURE_DESCRIPTIONS && window.FEATURE_DESCRIPTIONS[fStr]) {
            fullDesc = window.FEATURE_DESCRIPTIONS[fStr];
        } else if (window.HunterSystem && window.HunterSystem.FEAT_DESCRIPTIONS && window.HunterSystem.FEAT_DESCRIPTIONS[fStr]) {
            fullDesc = window.HunterSystem.FEAT_DESCRIPTIONS[fStr];
        }

        // Auto-detect type from text (simple heuristic)
        if (fullDesc.toLowerCase().includes('reação')) type = 'Reação';
        else if (fullDesc.toLowerCase().includes('ação bônus')) type = 'Ação Bônus';
        else if (fullDesc.toLowerCase().includes('ação')) type = 'Ação';

        // Create Summary (First sentence or 50 chars)
        summary = fullDesc.split('.')[0] + '.';
        if (summary.length > 60) summary = summary.substring(0, 57) + '...';

        // Badge Color
        let badgeColor = '#666'; // Passive
        if (type === 'Ação') badgeColor = '#56ab2f';
        if (type === 'Ação Bônus') badgeColor = '#4cc9f0';
        if (type === 'Reação') badgeColor = '#ffd700';

        // CARD HTML
        const card = document.createElement('div');
        card.className = 'ability-card';
        card.onclick = () => {
            if (window.innerWidth < 768) {
                // Mobile Drawer
                const drawerContent = document.getElementById('drawerContent');
                if (drawerContent) {
                    drawerContent.innerHTML = `
                        <div style="text-align:center; margin-bottom:15px;">
                            <h3 style="color:white; margin:5px 0;">${fStr}</h3>
                            <div style="color:${badgeColor}; font-weight:bold; font-size:0.9rem;">${type}</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; margin-bottom:15px;">
                            <div style="color:#e0e0e0; line-height:1.6;">${fullDesc}</div>
                        </div>
                    `;
                    if (window.lucide) lucide.createIcons();
                }
                if (typeof openDetailDrawer === 'function') openDetailDrawer();
            } else {
                // Desktop Expanded
                card.classList.toggle('expanded');
            }
        };

        card.innerHTML = `
            <div class="ability-header">
                <span class="ability-name">${fStr}</span>
                <span class="ability-badge" style="background:${badgeColor}">${type}</span>
            </div>
            <div class="ability-summary">${summary}</div>
            <div class="ability-details">${fullDesc}</div>
        `;

        target.appendChild(card);
    });
}

window.editProficiencyBonus = function (skillName, e) {
    if (e && e.target) {
        const valStr = e.target.value.trim();
        const val = parseInt(valStr);

        if (!humanData.proficiencies) humanData.proficiencies = {};
        if (!humanData.proficiencies[skillName]) humanData.proficiencies[skillName] = { trained: false };

        if (!isNaN(val) && val !== 0) {
            humanData.proficiencies[skillName].customBonus = val;
        } else {
            delete humanData.proficiencies[skillName].customBonus;
            if (!humanData.proficiencies[skillName].trained) delete humanData.proficiencies[skillName];
        }
        saveHuman();
        renderAttributes();
    }
};

// --- RANK & ORGANIZATION LOGIC ---
function getRankData(lvl) {
    // Table from User Image
    if (lvl <= 2) return { name: "Mizunoto", salary: 200000, mission: "D" };
    if (lvl <= 4) return { name: "Mizunoe", salary: 230000, mission: "D" };
    if (lvl <= 6) return { name: "Kanoto", salary: 260000, mission: "C" };
    if (lvl <= 8) return { name: "Kanoe", salary: 290000, mission: "C" };
    if (lvl <= 10) return { name: "Tsuchinoto", salary: 320000, mission: "B" };
    if (lvl <= 12) return { name: "Tsuchinoe", salary: 350000, mission: "B" };
    if (lvl <= 14) return { name: "Hinoto", salary: 380000, mission: "A" };
    if (lvl <= 16) return { name: "Hinoe", salary: 410000, mission: "A" };
    if (lvl <= 18) return { name: "Kinoto", salary: 440000, mission: "S" };

    // Level 19-20 defaults to Kinoe, unless Hashira
    return { name: "Kinoe", salary: 470000, mission: "S" };
}

function getRankName(lvl) {
    if (humanData.isHashira) return "Hashira";
    return getRankData(lvl).name;
}

function renderHunterOrganization() {
    const rankEl = document.getElementById('sideRankDisplay');
    const lvlEl = document.getElementById('sideLevelDisplay');
    const salaryEl = document.getElementById('salaryDisplay');
    const missionEl = document.getElementById('missionLevelDisplay');
    const hashiraBtn = document.getElementById('btnBecomeHashira');

    if (!rankEl) return;

    // Determine current state
    const data = getRankData(humanData.level);
    let rankName = data.name;
    let salary = data.salary;
    let missionRank = data.mission;

    // Hashira Override
    if (humanData.isHashira) {
        rankName = "Hashira";
        salary = "∞"; // Or a massive number, usually Hashiras name their price or have massive resources
        missionRank = "SS";
    }

    // Display Updates
    rankEl.textContent = rankName;
    lvlEl.textContent = humanData.level;
    const salaryText = typeof salary === 'number' ? salary.toLocaleString('pt-BR') : salary;
    salaryEl.textContent = salaryText;

    // Mobile Salary Sync
    const mobSal = document.getElementById('mobileSalaryDisplay');
    if (mobSal) {
        mobSal.innerHTML = `<i data-lucide="coins" size="16"></i> ${salaryText} Ienes`;
        if (window.lucide) lucide.createIcons();
    }

    // Mission Rank styling
    missionEl.textContent = `Rank ${missionRank}`;
    if (missionEl.nextElementSibling) {
        if (missionRank === 'S' || missionRank === 'SS') missionEl.nextElementSibling.textContent = "Missões de extermínio de Luas e ameaças catastróficas.";
        else if (missionRank === 'A') missionEl.nextElementSibling.textContent = "Missões de alto risco e liderança de esquadrões.";
        else if (missionRank === 'B') missionEl.nextElementSibling.textContent = "Combate a onis com kekkijutsu e investigações.";
        else if (missionRank === 'C') missionEl.nextElementSibling.textContent = "Missões de suporte e combate a onis experientes.";
        else missionEl.nextElementSibling.textContent = "Patrulhas e extermínio de onis recém-transformados.";
    }

    // Hashira Button Logic (Hidden unless Kinoe Lvl 19+)
    if (hashiraBtn) {
        if (!humanData.isHashira && humanData.level >= 19) {
            hashiraBtn.style.display = 'block';
        } else {
            hashiraBtn.style.display = 'none';
        }
    }
}

window.becomeHashira = function () {
    if (humanData.level < 10) {
        showToast("Você ainda não está pronto... (Nível 10+ Requerido)", "error");
        return;
    }

    const confirmed = confirm(
        "⚡ CAMINHO DOS HASHIRA ⚡\n\n" +
        "Requisitos:\n" +
        "1. Nível 10 (Mínimo)\n" +
        "2. Derrotar 50 demônios como Kinoe/Elite.\n" +
        "OU\n" +
        "3. Derrotar um membro das Doze Luas.\n\n" +
        "Você realizou esses feitos e deseja reivindicar seu título?"
    );

    if (confirmed) {
        humanData.isHashira = true;
        saveHuman();
        renderHunterOrganization();
        // Visual flairs
        showToast("Você se tornou um HASHIRA! ⚔️🔥", "success");
        // Play sound or effect?
        const blade = document.getElementById('swordBlade');
        if (blade) blade.classList.add('mastered'); // Ensure glowing
    }
};

window.completeMission = function () {
    // 1. Get current salary
    const rankData = getRankData(humanData.level);
    let salary = rankData.salary;

    // Safety for Hashira/Legendary "Infinite"
    if (typeof salary !== 'number') {
        salary = 1000000; // Arbitrary 1M for Hashira "Infinite" per mission/month context
    }

    // 2. Add to Wealth
    if (!humanData.money) humanData.money = 0;
    humanData.money += salary;

    // 3. Save
    saveHuman();

    // 4. Update UI
    if (typeof updateInventoryStatus === 'function') updateInventoryStatus();

    // Legacy support if specific element exists separate from inventory
    const yenDisplay = document.getElementById('yenDisplay');
    if (yenDisplay) yenDisplay.textContent = humanData.money.toLocaleString('pt-BR');

    // 5. Feedback
    showToast(`Missão Completa! +${salary.toLocaleString('pt-BR')} Ienes recebidos.`, "success");
};

// --- NEW PROFICIENCY RENDER ---
function renderProficiencies() {
    const container = document.getElementById('profList');
    if (!container) return;
    container.innerHTML = "";

    // Get Proficiencies from Breathing Class
    const db = window.BREATHING_CLASS_DB;
    if (!db) {
        // DB not loaded?
        container.innerHTML = "<em>Carregando dados...</em>";
        return;
    }
    const style = humanData.breathingStyle || 'water';
    const classData = db[style];

    if (!classData || !classData.proficiencies) {
        container.innerHTML = "<em>Nenhuma proficiência listada.</em>";
        return;
    }

    const { savingThrows, skillsList, armor, weapons } = classData.proficiencies;

    // Helper to create tag
    const createTag = (text, colorClass) => {
        const tag = document.createElement('span');
        tag.textContent = text;
        tag.style.background = 'rgba(255,255,255,0.1)';
        tag.style.padding = '2px 8px';
        tag.style.borderRadius = '4px';
        tag.style.fontSize = '0.75rem';
        tag.style.marginRight = '5px';
        tag.style.marginBottom = '5px';
        tag.style.border = '1px solid rgba(255,255,255,0.2)';

        if (colorClass === 'save') {
            tag.style.borderColor = '#00b4d8';
            tag.style.color = '#caf0f8';
        }
        return tag;
    };

    // Saving Throws
    if (savingThrows) {
        savingThrows.forEach(st => {
            container.appendChild(createTag(`T.Resist: ${st.toUpperCase()}`, 'save'));
        });
    }

    // Skills
    if (skillsList) {
        skillsList.forEach(sk => container.appendChild(createTag(sk)));
    }

    // Armor/Weapons (Optional, simpler display)
    if (armor) container.appendChild(createTag(`Arm: ${armor.join(', ')}`));
    if (weapons) container.appendChild(createTag(`Armas: ${weapons.join(', ')}`));
}

// --- NEW ATTRIBUTE RENDER WITH SKILLS ---
function renderAttributes() {
    const grid = document.getElementById('attrGrid');
    if (!grid) return;

    renderHunterOrganization(); // Update sidebar too

    grid.innerHTML = "";

    const stats = humanData.stats;
    const map = { str: 'Força', dex: 'Destreza', con: 'Constituição', int: 'Inteligência', wis: 'Sabedoria', cha: 'Carisma' };

    // Create Layout
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
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
                <span id="mod-${k}" style="font-size:1.5rem; font-weight:800; color:${mod >= 0 ? '#00b4d8' : '#d90429'}; text-shadow:0 0 10px rgba(0,0,0,0.5); transition:color 0.3s;">${mod >= 0 ? '+' : ''}${mod}</span>
                <div style="font-size:0.7rem; color:#555; display:flex; align-items:center; justify-content:flex-end; gap:5px;">
                    Valor: 
                    <input type="number" value="${val}" min="1" max="30" 
                        onchange="updateStat('${k}', this.value)"
                        onclick="event.stopPropagation()"
                        style="width:40px; background:#111; border:1px solid #333; color:white; border-radius:4px; padding:2px 4px; text-align:center; font-size:0.8rem;">
                </div>
            </div>
        `;

        header.onclick = (e) => {
            // Prevent triggering roll when clicking input (handled by stopPropagation above, but good safety)
            if (e.target.tagName === 'INPUT') return;
            rollCheck(map[k], mod);
        };
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
                sRow.style.alignItems = 'center';
                sRow.style.fontSize = '0.9rem';
                sRow.style.color = '#ccc';
                sRow.style.padding = '6px 8px';
                sRow.style.borderRadius = '4px';
                sRow.style.cursor = 'pointer';
                sRow.style.transition = 'background 0.2s';

                // Proficiency Logic
                const profData = (humanData.proficiencies && humanData.proficiencies[skill]) || {};
                const isTrained = !!profData.trained;
                const customBonus = profData.customBonus || 0;

                // Prof Bonus Calculation (Level based, usually starts at +2)
                const pb = Math.ceil(1 + (humanData.level / 4)); // Std D&D 5e PB: 1-4=+2, 5-8=+3, etc. Actually ceil(1 + lvl/4) works: 1->2, 4->2, 5->3.

                let total = mod + customBonus;
                if (isTrained) total += pb;

                const starIcon = isTrained ?
                    `<i data-lucide="star" fill="#ffd700" color="#ffd700" style="width:14px;"></i>` :
                    `<i data-lucide="star" color="#444" style="width:14px;"></i>`;

                sRow.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <input type="text" 
                             value="${customBonus > 0 ? '+' + customBonus : (customBonus < 0 ? customBonus : '')}" 
                             placeholder="+0"
                             onclick="event.stopPropagation()"
                             onchange="editProficiencyBonus('${skill}', event)"
                             class="skill-bonus-input"
                             style="width:30px; background:#111; border:1px solid #333; color:#fff; font-size:0.75rem; text-align:center; padding:2px; border-radius:4px;"
                        />
                        <div onclick="event.stopPropagation(); toggleProficiency('${skill}')" style="cursor:pointer; display:flex;">
                            ${starIcon}
                        </div>
                        <span style="${isTrained ? 'color:#fff; font-weight:bold;' : ''}">${skill}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                         <span style="color:${total >= 0 ? '#4cc9f0' : '#ff595e'}; min-width:25px; text-align:right;">${total >= 0 ? '+' : ''}${total}</span>
                    </div>
                `;

                // CSS to show settings on hover
                sRow.onmouseover = () => {
                    sRow.style.background = 'rgba(255,255,255,0.05)';
                };
                sRow.onmouseout = () => {
                    sRow.style.background = 'transparent';
                };

                sRow.onclick = () => rollCheck(skill, total);

                skillsList.appendChild(sRow);
            });
            col.appendChild(skillsList);
        }

        grid.appendChild(col);
    });

    if (window.lucide) window.lucide.createIcons();
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

// --- NEW PROFICIENCY LOGIC ---
window.toggleProficiency = function (skillName) {
    if (!humanData.proficiencies) humanData.proficiencies = {};
    if (!humanData.proficiencies[skillName]) humanData.proficiencies[skillName] = { trained: false };

    // Toggle
    humanData.proficiencies[skillName].trained = !humanData.proficiencies[skillName].trained;

    // Clean up if empty
    if (!humanData.proficiencies[skillName].trained && !humanData.proficiencies[skillName].customBonus) {
        delete humanData.proficiencies[skillName];
    }

    saveHuman();
    renderAttributes();
    if (typeof showToast === 'function') showToast(humanData.proficiencies[skillName]?.trained ? `Proficiência em ${skillName} adicionada!` : `Proficiência em ${skillName} removida.`);
};
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

    // Ensure unlockedStyles exists
    if (!humanData.breathingStyle) humanData.breathingStyle = 'water';
    if (!humanData.unlockedStyles) humanData.unlockedStyles = [humanData.breathingStyle];

    // If current style isn't unlocked (data migration), unlock it
    if (!humanData.unlockedStyles.includes(humanData.breathingStyle)) {
        humanData.unlockedStyles.push(humanData.breathingStyle);
    }

    if (forceStyleId && humanData.unlockedStyles.includes(forceStyleId)) {
        currentBreathingStyle = forceStyleId;
    } else {
        // If current is not unlocked, switch to first unlocked
        if (!humanData.unlockedStyles.includes(currentBreathingStyle)) {
            currentBreathingStyle = humanData.unlockedStyles[0];
        }
    }

    const allStyles = [
        { id: 'water', name: 'Água', icon: 'droplets', color: '#00b4d8' },
        { id: 'thunder', name: 'Trovão', icon: 'zap', color: '#ffd700' },
        { id: 'beast', name: 'Fera', icon: 'skull', color: '#7b8cde' },
        { id: 'flame', name: 'Chamas', icon: 'flame', color: '#ff4d00' },
        { id: 'wind', name: 'Vento', icon: 'wind', color: '#56ab2f' },
        { id: 'stone', name: 'Pedra', icon: 'mountain', color: '#6c757d' },
        { id: 'mist', name: 'Névoa', icon: 'cloud-fog', color: '#4cc9f0' },
        { id: 'flower', name: 'Flor', icon: 'flower-2', color: '#ff70a6' },
        { id: 'serpent', name: 'Serpente', icon: 'waves', color: '#8a2be2' }
    ];

    // Filter displayed styles
    const stylesList = allStyles.filter(s => humanData.unlockedStyles.includes(s.id));

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
            currentBreathingStyle = s.id;
            // update main unlocked style pointer if needed? No, just view.
            renderBreathing(s.id);
        };
        sidebar.appendChild(item);
    });

    // SECRET ADD BUTTON
    const addBtn = document.createElement('div');
    addBtn.className = 'style-item';
    addBtn.style.opacity = '0.5';
    addBtn.style.border = '1px dashed #444';
    addBtn.innerHTML = `
        <div class="style-icon"><i data-lucide="plus" color="#666"></i></div>
        <span class="style-name">Novo Estilo</span>
    `;
    addBtn.onclick = () => unlockNewStyle();
    sidebar.appendChild(addBtn);

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

// Unlock New Style
// --- DISCOVERY SYSTEM ---
window.unlockNewStyle = function () {
    openDiscoveryModal();
};

function openDiscoveryModal() {
    const m = document.getElementById('discoveryModal');
    const sel = document.getElementById('discoverySelection');
    const anim = document.getElementById('discoveryAnimation');
    const grid = document.getElementById('stylesGrid');

    if (!m || !grid) return;

    // Reset State
    sel.style.display = 'block';
    anim.style.display = 'none';
    m.style.display = 'flex';
    grid.innerHTML = "";
    grid.style.display = 'block'; // Reset grid to block to allow headers

    const allStyles = [
        // Primary
        { id: 'water', name: 'Água', icon: 'droplets', color: '#00b4d8', type: 'primary' },
        { id: 'thunder', name: 'Trovão', icon: 'zap', color: '#ffd700', type: 'primary' },
        { id: 'beast', name: 'Fera', icon: 'skull', color: '#7b8cde', type: 'primary' },
        { id: 'flame', name: 'Chamas', icon: 'flame', color: '#ff4d00', type: 'primary' },
        { id: 'wind', name: 'Vento', icon: 'wind', color: '#56ab2f', type: 'primary' },
        { id: 'stone', name: 'Pedra', icon: 'mountain', color: '#6c757d', type: 'primary' },

        // Secondary
        { id: 'mist', name: 'Névoa', icon: 'cloud-fog', color: '#4cc9f0', type: 'secondary', req: 'wind', reqName: 'Vento' },
        { id: 'flower', name: 'Flor', icon: 'flower-2', color: '#ff70a6', type: 'secondary', req: 'water', reqName: 'Água' },
        { id: 'serpent', name: 'Serpente', icon: 'waves', color: '#8a2be2', type: 'secondary', req: 'water', reqName: 'Água' }
    ];

    const unlocked = humanData.unlockedStyles || ['water'];

    // renderSection Helper
    const renderSection = (title, styles) => {
        if (styles.length === 0) return;

        const header = document.createElement('h3');
        header.style.color = '#888';
        header.style.fontFamily = "'Cinzel', serif";
        header.style.borderBottom = '1px solid #333';
        header.style.paddingBottom = '5px';
        header.style.marginTop = '20px';
        header.textContent = title;
        grid.appendChild(header);

        const subGrid = document.createElement('div');
        subGrid.style.display = 'grid';
        subGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
        subGrid.style.gap = '25px';
        subGrid.style.marginBottom = '30px';

        styles.forEach(s => {
            const isOwned = unlocked.includes(s.id);
            const hasReq = !s.req || unlocked.includes(s.req);

            // Skip owned? Or show as owned? User wants "Desbloquear", so skip owned usually. 
            // But let's skip owned to keep it clean, as per original logic.
            if (isOwned) return;

            const card = document.createElement('div');
            card.className = 'discovery-card';

            if (!hasReq) {
                // LOCKED STATE
                card.style.opacity = '0.6';
                card.style.filter = 'grayscale(1)';
                card.style.cursor = 'not-allowed';
                card.innerHTML = `
                    <div style="position:absolute; top:10px; right:15px; color:#aaa;"><i data-lucide="lock" size="20"></i></div>
                    <div class="icon-wrapper" style="border-color:#444;">
                        <i data-lucide="${s.icon}" color="#666" size="32"></i>
                    </div>
                    <h3 style="color:#aaa; margin:0 0 5px 0; font-family:'Cinzel', serif;">${s.name}</h3>
                    <div style="color:#d90429; font-size:0.8rem; font-weight:bold; margin-top:5px;">
                        Requer: Respiração do ${s.reqName}
                    </div>
                `;
            } else {
                // AVAILABLE STATE
                card.innerHTML = `
                    <div class="icon-wrapper">
                        <i data-lucide="${s.icon}" color="${s.color}" size="32"></i>
                    </div>
                    <h3 style="color:#fff; margin:0 0 5px 0; font-family:'Cinzel', serif;">${s.name}</h3>
                    <span style="color:#666; font-size:0.8rem;">Toque para Meditar</span>
                `;
                card.onclick = () => startDiscovery(s);
            }
            subGrid.appendChild(card);
        });

        if (subGrid.children.length > 0) {
            grid.appendChild(subGrid);
        } else {
            header.remove(); // Remove header if empty
        }
    };

    // Filter
    const primary = allStyles.filter(s => s.type === 'primary');
    const secondary = allStyles.filter(s => s.type === 'secondary');

    renderSection("Respirações Primordiais", primary);
    renderSection("Respirações Derivadas", secondary);

    if (grid.children.length === 0) {
        grid.innerHTML = `<div style="color:#666; font-style:italic; text-align:center; padding:20px;">
            Você já dominou todas as respirações disponíveis.
        </div>`;
    }

    if (window.lucide) lucide.createIcons();
}

let pendingDiscoveryStyle = null;

function startDiscovery(style) {
    pendingDiscoveryStyle = style;

    // Switch to Animation View
    document.getElementById('discoverySelection').style.display = 'none';
    const anim = document.getElementById('discoveryAnimation');
    anim.style.display = 'flex';

    // Elements
    const bg = document.getElementById('da-bg');
    const icon = document.getElementById('da-icon');
    const title = document.getElementById('da-title');
    const sub = document.getElementById('da-subtitle');
    const btn = document.getElementById('da-btn');
    const ring = document.getElementById('da-icon-ring');
    const glow = document.getElementById('da-icon-glow');
    const cont = document.getElementById('da-icon-container');

    // Setup Visuals
    bg.style.background = `radial-gradient(circle, ${style.color}40 0%, #000 70%)`;
    icon.setAttribute('data-lucide', style.icon);
    icon.style.color = style.color;
    title.textContent = `RESPIRAÇÃO DA ${style.name.toUpperCase()}`;
    title.style.color = style.color;

    ring.style.borderColor = style.color;
    glow.style.boxShadow = `0 0 60px ${style.color}`;

    if (window.lucide) lucide.createIcons();

    // Reset Animations
    bg.style.opacity = 0;
    cont.style.opacity = 0;
    cont.style.transform = 'scale(0.5)';
    title.style.opacity = 0;
    title.style.transform = 'translateY(20px)';
    sub.style.opacity = 0;
    btn.style.opacity = 0;
    btn.style.pointerEvents = 'none';

    // --- SEQUENCE ---
    // 0s: Fade In BG & Icon
    setTimeout(() => {
        bg.style.opacity = 1;
        cont.style.opacity = 1;
        cont.style.transform = 'scale(1)';
        createDiscoveryParticles(style.color);

        // Add pulse
        ring.classList.add('anim-pulse');

        // Shake effect on impact
        setTimeout(() => {
            const stage = document.body; // Shake screen slightly? or just container
            cont.classList.add('anim-shake');
        }, 600);

    }, 100);

    // 1.5s: Title Reveal
    setTimeout(() => {
        title.style.opacity = 1;
        title.style.transform = 'translateY(0)';
    }, 1200);

    // 2.0s: Subtitle
    setTimeout(() => {
        sub.style.opacity = 1;
    }, 1800);

    // 3.0s: Button
    setTimeout(() => {
        btn.style.opacity = 1;
        btn.style.pointerEvents = 'all';
    }, 2500);
}

function createDiscoveryParticles(color) {
    const con = document.getElementById('da-particles');
    con.innerHTML = '';
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'discovery-particle';
        p.style.backgroundColor = color;
        p.style.left = Math.random() * 100 + '%';
        p.style.top = (50 + Math.random() * 50) + '%';
        p.style.opacity = Math.random();
        p.style.transform = `scale(${Math.random() * 2})`;
        p.style.animationDuration = (1 + Math.random() * 2) + 's';
        p.style.animationDelay = (Math.random() * 0.5) + 's';
        con.appendChild(p);
    }
}

window.finishDiscovery = function () {
    if (!pendingDiscoveryStyle) return;

    // Unlock
    if (!humanData.unlockedStyles.includes(pendingDiscoveryStyle.id)) {
        humanData.unlockedStyles.push(pendingDiscoveryStyle.id);
    }

    // Switch to new style
    humanData.breathingStyle = pendingDiscoveryStyle.id;
    saveHuman();

    // Close & Render
    document.getElementById('discoveryModal').style.display = 'none';
    renderBreathing(humanData.breathingStyle);
    showToast(`${pendingDiscoveryStyle.name} desbloqueada!`, 'success');

    // Cleanup
    document.getElementById('da-icon-ring').classList.remove('anim-pulse');
    pendingDiscoveryStyle = null;
};


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

        // Check Lock
        const isLocked = f.reqLevel && humanData.level < f.reqLevel;

        if (!isLocked && evoIndex >= 0 && f.evolutions && f.evolutions[evoIndex]) {
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

        if (isLocked) {
            c.style.opacity = "0.7";
            c.style.border = "1px solid #333";
            c.style.background = "#111"; // Darker
            c.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#666; padding:20px; text-align:center;">
                    <i data-lucide="lock" size="32" style="margin-bottom:10px;"></i>
                    <div style="font-weight:bold; color:#888;">${f.name}</div>
                    <div style="font-size:0.8rem; margin-top:5px;">Bloqueado até Nível ${f.reqLevel}</div>
                </div>
             `;
        } else {
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
        }
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

    const attacks = humanData.attacks || [];

    if (attacks.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding:3rem; color:#666; width:100%;">
                <i data-lucide="sword" size="48" style="opacity:0.3; margin-bottom:1rem;"></i>
                <p>Nenhum ataque registrado.</p>
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
        if (lowerName.includes('corte') || lowerName.includes('lâmina') || lowerName.includes('espada') || lowerName.includes('katana')) icon = 'sword';
        else if (lowerName.includes('soco') || lowerName.includes('punho') || lowerName.includes('impacto')) icon = 'hand-metal';
        else if (lowerName.includes('fogo') || lowerName.includes('chama') || lowerName.includes('solar')) icon = 'flame';
        else if (lowerName.includes('gelo') || lowerName.includes('frio') || lowerName.includes('água')) icon = 'droplet';
        else if (lowerName.includes('trovão') || lowerName.includes('raio') || lowerName.includes('relâmpago')) icon = 'zap';
        else if (lowerName.includes('vento') || lowerName.includes('ar')) icon = 'wind';
        else if (lowerName.includes('garra')) icon = 'scissors';
        else if (lowerName.includes('flecha') || lowerName.includes('arco')) icon = 'target';

        html += `
            <div class="attack-card-3d" style="--i:${index}">
                <i data-lucide="${icon}" class="attack-bg-icon"></i>
                
                <h3 class="card-title">${atk.name}</h3>
                <div class="card-meta">${atk.damage}</div>
                <div class="card-desc">${atk.type}</div>

                <div class="card-actions">
                    <button class="atk-btn-3d atk-btn-roll" onclick="rollAttack(${index})">
                        <i data-lucide="dices"></i> ROLAR
                    </button>
                    <!-- Edit Button -->
                    <button class="atk-btn-3d atk-btn-del" onclick="editAttack(${index})" title="Editar" style="background:rgba(255,255,255,0.1); color:#00b4d8;">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="atk-btn-3d atk-btn-del" onclick="deleteAttack(${index})" title="Excluir">
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

// Quick Helper
window.quickAddKatana = function () {
    humanData.attacks.push({ name: "Espada Nichirin", damage: "1d8+2", type: "Cortante" });
    saveHuman();
    renderAttacks();
    showToast("Katana adicionada!", "success");
};


function rollAttack(idx) {
    const atk = humanData.attacks[idx];
    if (!atk) return;

    // 1. Roll Hit (d20 + Bonus)
    // For now simple d20, assuming bonus is visual or applied mentally, or use atkBonus if present?
    // Let's use atk.atkBonus if available
    const bonus = atk.atkBonus || 0;
    const d20 = Math.floor(Math.random() * 20) + 1;
    const hitTotal = d20 + bonus;

    // 2. Check Crit
    const threshold = atk.critThreshold || 20;
    const isCrit = d20 >= threshold;
    const mult = isCrit ? (atk.critMult || 2) : 1;

    // 3. Roll Base Damage
    const baseRes = parseAndRoll(atk.damage, atk.type, mult);
    let totalDmg = baseRes.total;

    // Build Visuals
    let fullExpr = `<div style="display:flex; flex-direction:column; gap:8px; width:100%; text-align:left;">`;

    // Critical Badge
    if (isCrit) {
        fullExpr += `<div style="background:linear-gradient(90deg, #d90429, #ef233c); color:white; font-weight:bold; text-align:center; padding:5px; border-radius:4px; margin-bottom:10px; text-transform:uppercase; letter-spacing:2px; font-size:1.2rem; text-shadow:0 1px 3px rgba(0,0,0,0.5);">CRÍTICO! (x${mult})</div>`;
    }

    // Base Row
    fullExpr += `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:5px;">
            <div>
                <strong style="color:white; font-size:1.1rem;">Base</strong>
                <span class="dmg-badge ${getDamageTypeClass(baseRes.type)}">${baseRes.type}</span>
            </div>
            <div style="text-align:right;">
                <div style="color:white; font-size:1.1rem; font-weight:bold;">${baseRes.total}</div>
                <div style="color:#666; font-size:0.75rem;">${baseRes.expr}</div>
            </div>
        </div>
    `;

    // 4. Roll Extra Damages
    if (atk.extraDmg && Array.isArray(atk.extraDmg)) {
        atk.extraDmg.forEach(extra => {
            const extRes = parseAndRoll(extra.damage, extra.type, mult);
            totalDmg += extRes.total;
            fullExpr += `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #222; padding-bottom:5px;">
                    <div>
                        <span style="color:#aaa;">Extra</span>
                        <span class="dmg-badge ${getDamageTypeClass(extRes.type)}">${extRes.type}</span>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:#ccc; font-weight:bold;">+${extRes.total}</div>
                        <div style="color:#555; font-size:0.75rem;">${extRes.expr}</div>
                    </div>
                </div>
            `;
        });
    }

    fullExpr += `</div>`; // End container

    // Prepare Result Data
    const rollData = {
        total: totalDmg, // Sum of all damages
        expr: fullExpr,  // HTML breakdown
        type: "DANO MISTO", // Generic tag
        isAttack: true,
        hit: hitTotal,   // The Hit Value (d20 + bonus)
        rawDie: d20,     // The raw d20 roll (for Crit/Fail visual)
        isCrit: isCrit,
        atkName: atk.name
    };

    showAttackDice(atk.name, rollData);
}

// --- COMBAT HELPERS ---

function getDamageTypeClass(type) {
    if (!type) return '';
    const t = type.toLowerCase();
    if (t.includes('fogo') || t.includes('chama')) return 'dmg-type-fogo';
    if (t.includes('frio') || t.includes('gelo') || t.includes('água')) return 'dmg-type-frio';
    if (t.includes('elétrico') || t.includes('trovão') || t.includes('raio')) return 'dmg-type-elétrico';
    if (t.includes('veneno') || t.includes('ácido')) return 'dmg-type-veneno';
    if (t.includes('radiante') || t.includes('luz')) return 'dmg-type-radiante';
    if (t.includes('necrótico') || t.includes('trevas')) return 'dmg-type-necrótico';
    if (t.includes('psíquico')) return 'dmg-type-psíquico';
    if (t.includes('primordial') || t.includes('força')) return 'dmg-type-primordial';
    // Physical
    if (t.includes('cortante')) return 'dmg-type-cortante';
    if (t.includes('perfurante')) return 'dmg-type-perfurante';
    if (t.includes('concussão') || t.includes('contundente')) return 'dmg-type-concussão';
    if (t.includes('balístico')) return 'dmg-type-balístico';

    return 'dmg-type-concussão'; // Default
}

function parseAndRoll(str, extraType, diceMult = 1) {
    // match XdY(+/-Z)
    const regex = /(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/;
    const match = str.match(regex);

    let total = 0;
    let details = [];
    let expr = str;
    let type = extraType || "";

    if (match) {
        // Apply Crit Multiplier to Dice Count ONLY
        const count = parseInt(match[1]) * diceMult;
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

        const detailsStr = details.length > 5 ? `[${details.slice(0, 5).join(', ')}...]` : `[${details.join(', ')}]`;
        expr = `${count}d${sides}${modStr} ${detailsStr}`; // Show multiplied dice count
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


// --- ATTACK MODAL LOGIC (Extended) ---

let editingAttackIndex = -1;

function openAttackModal() {
    const modal = document.getElementById('attackModal');
    if (modal) {
        modal.style.display = 'flex';
        // Clear for new
        editingAttackIndex = -1;
        document.getElementById('atkNameInput').value = '';
        document.getElementById('atkDmgInput').value = '';
        document.getElementById('atkTypeInput').value = '';

        // New Fields Clear
        document.getElementById('atkCritInput').value = '20';
        document.getElementById('atkMultInput').value = '2';
        document.getElementById('atkBonusInput').value = '0';
        document.getElementById('atkRangeInput').value = '';

        document.getElementById('extraDmgContainer').innerHTML = ''; // Clear extras

        const btn = document.getElementById('btnConfirmAttack');
        if (btn) btn.innerText = "CRIAR ATAQUE";
    }
}

function editAttack(idx) {
    const modal = document.getElementById('attackModal');
    const atk = humanData.attacks[idx];
    if (modal && atk) {
        modal.style.display = 'flex';
        editingAttackIndex = idx;

        document.getElementById('atkNameInput').value = atk.name;
        document.getElementById('atkDmgInput').value = atk.damage;
        document.getElementById('atkTypeInput').value = atk.type;

        // New Fields Load
        document.getElementById('atkCritInput').value = atk.critThreshold || 20;
        document.getElementById('atkMultInput').value = atk.critMult || 2;
        document.getElementById('atkBonusInput').value = atk.atkBonus || 0;
        document.getElementById('atkRangeInput').value = atk.range || '';

        // Load Extras
        const container = document.getElementById('extraDmgContainer');
        container.innerHTML = '';
        if (atk.extraDmg && Array.isArray(atk.extraDmg)) {
            atk.extraDmg.forEach(extra => addExtraDmgRow(extra.damage, extra.type));
        }

        const btn = document.getElementById('btnConfirmAttack');
        if (btn) btn.innerText = "SALVAR ALTERAÇÃO";
    }
}

function closeAttackModal() {
    const modal = document.getElementById('attackModal');
    if (modal) modal.style.display = 'none';
    editingAttackIndex = -1;
}

function addExtraDmgRow(dmgVal = '', typeVal = '') {
    const container = document.getElementById('extraDmgContainer');
    const div = document.createElement('div');
    div.className = 'extra-dmg-row';
    div.style.display = 'grid';
    div.style.gridTemplateColumns = '1fr 1fr auto';
    div.style.gap = '10px';
    div.style.alignItems = 'center';
    div.style.background = '#111';
    div.style.padding = '10px';
    div.style.borderRadius = '6px';
    div.style.border = '1px solid #333';

    div.innerHTML = `
        <input type="text" class="ds-input extra-dmg-val" value="${dmgVal}" placeholder="Ex: 1d6" style="background:#0a0a0a; border:1px solid #333; color:white; padding:8px; border-radius:4px; width:100%;">
        <select class="ds-input extra-type-val" style="background:#0a0a0a; border:1px solid #333; color:white; padding:8px; border-radius:4px; width:100%; cursor:pointer;">
            <option value="" disabled ${!typeVal ? 'selected' : ''}>Tipo...</option>
            <optgroup label="Físicos Padrão">
                <option value="Cortante" ${typeVal === 'Cortante' ? 'selected' : ''}>Cortante</option>
                <option value="Concussão" ${typeVal === 'Concussão' ? 'selected' : ''}>Concussão</option>
                <option value="Perfurante" ${typeVal === 'Perfurante' ? 'selected' : ''}>Perfurante</option>
                <option value="Balístico" ${typeVal === 'Balístico' ? 'selected' : ''}>Balístico</option>
            </optgroup>
            <optgroup label="Elementais & Especiais">
                <option value="Ácido" ${typeVal === 'Ácido' ? 'selected' : ''}>Ácido</option>
                <option value="Elétrico" ${typeVal === 'Elétrico' ? 'selected' : ''}>Elétrico</option>
                <option value="Fogo" ${typeVal === 'Fogo' ? 'selected' : ''}>Fogo</option>
                <option value="Frio" ${typeVal === 'Frio' ? 'selected' : ''}>Frio</option>
                <option value="Necrótico" ${typeVal === 'Necrótico' ? 'selected' : ''}>Necrótico</option>
                <option value="Psíquico" ${typeVal === 'Psíquico' ? 'selected' : ''}>Psíquico</option>
                <option value="Primordial" ${typeVal === 'Primordial' ? 'selected' : ''}>Primordial</option>
                <option value="Trovejante" ${typeVal === 'Trovejante' ? 'selected' : ''}>Trovejante</option>
                <option value="Veneno" ${typeVal === 'Veneno' ? 'selected' : ''}>Veneno</option>
                <option value="Radiante" ${typeVal === 'Radiante' ? 'selected' : ''}>Radiante</option>
            </optgroup>
        </select>
        <button onclick="this.parentElement.remove()" style="background:#d90429; color:white; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; font-weight:bold;">X</button>
    `;
    container.appendChild(div);
}

function confirmAddAttack() {
    const name = document.getElementById('atkNameInput').value;
    const dmg = document.getElementById('atkDmgInput').value;
    const type = document.getElementById('atkTypeInput').value;

    // New Fields
    const critThreshold = parseInt(document.getElementById('atkCritInput').value) || 20;
    const critMult = parseInt(document.getElementById('atkMultInput').value) || 2;
    const atkBonus = parseInt(document.getElementById('atkBonusInput').value) || 0;
    const range = document.getElementById('atkRangeInput').value;

    const extraRows = document.querySelectorAll('.extra-dmg-row');
    const extraDmg = [];
    extraRows.forEach(row => {
        const d = row.querySelector('.extra-dmg-val').value;
        const t = row.querySelector('.extra-type-val').value;
        if (d && t) extraDmg.push({ damage: d, type: t });
    });

    if (!name || !dmg || !type) {
        showToast("Preencha campos obrigatórios (Nome, Dano, Tipo Base)!", "error");
        return;
    }

    if (!humanData.attacks) humanData.attacks = [];

    const atkObj = {
        name,
        damage: dmg,
        type,
        critThreshold,
        critMult,
        atkBonus,
        range,
        extraDmg
    };

    if (editingAttackIndex >= 0) {
        humanData.attacks[editingAttackIndex] = atkObj;
        showToast("Ataque atualizado!", "success");
    } else {
        humanData.attacks.push(atkObj);
        showToast("Ataque criado!", "success");
    }

    saveHuman();
    renderAttacks();
    closeAttackModal();
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
        'beast': 'indigo',
        'stone': 'gray',
        'beast': 'indigo',
        'stone': 'gray',
        'mist': 'cyan',
        'flower': 'pink',
        'serpent': 'purple'
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
        { val: 'gray', label: 'Minério Cinza (Pedra)' },
        { val: 'cyan', label: 'Minério Turquesa (Névoa)' },
        { val: 'pink', label: 'Minério Rosa (Flor)' },
        { val: 'purple', label: 'Minério Roxo (Serpente)' },
        { val: 'light-pink', label: 'Minério Rosa Claro (Amor)' },
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
        'gray': { t: 'Lâmina de Nichirin da Pedra', d: 'Cinza e sólida, pesada como uma montanha.' },
        'cyan': { t: 'Lâmina de Nichirin da Névoa', d: 'Branca como as nuvens, rápida como o pensamento.' },
        'pink': { t: 'Lâmina de Nichirin da Flor', d: 'Rosa pálido, exala elegância e perigo.' },
        'purple': { t: 'Lâmina de Nichirin da Serpente', d: 'Roxa e curvada, desliza como uma cobra.' },
        'light-pink': { t: 'Lâmina de Nichirin do Amor', d: 'Flexível e mortal como um chicote.' },
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

// === NICHIRIN FORGE SYSTEM ===
const WEAPON_RECIPES = [
    {
        name: "Nichirin Katana",
        desc: "A arma padrão dos Caçadores de Demônios. Equilibrada e letal.",
        cost: 5000,
        ores: 2,
        dmg: "1d8",
        type: "Cortante",
        icon: "sword",
        color: "#00b4d8"
    },
    {
        name: "Nichirin Dupla",
        desc: "Estilo Tengen Uzui. Extravagante e rápida.",
        cost: 8000,
        ores: 4,
        dmg: "1d6",
        type: "Cortante (Dupla)",
        icon: "swords",
        color: "#d90429"
    },
    {
        name: "Montante Nichirin",
        desc: "Estilo Gyomei. Uma lâmina massiva para força bruta.",
        cost: 10000,
        ores: 5,
        dmg: "2d6",
        type: "Cortante (Pesada)",
        icon: "axe", // close enough placeholder
        color: "#808080"
    },
    {
        name: "Foice e Corrente",
        desc: "Uma arma exótica para combate a média distância.",
        cost: 12000,
        ores: 6, // Inferred from progression (approx 2k/ore)
        dmg: "1d6+1d4",
        type: "Perfurante/Cortante",
        icon: "link",
        color: "#ffd700"
    }
];

let selectedRecipeIndex = 0;

window.renderForge = function () {
    const forgeSection = document.getElementById('forge');
    if (!forgeSection) return;

    // Base Layout for Nichirin Forge (Ultimate Edition)
    forgeSection.innerHTML = `
        <div class="section-header">
            <span class="sec-title" style="color:#ffd700">Forja Nichirin</span>
            <i data-lucide="hammer" color="#ffd700"></i>
        </div>

        <div class="nichirin-wrapper">
            <!-- VISUAL STAGE -->
            <div class="sword-stage">
                <div id="vfxContainer" class="vfx-container"></div>
                <div class="sword-container">
                     <div id="bladeAura" class="blade-aura"></div>
                     
                     <div class="blade-group">
                          <div class="habaki"></div>
                          <!-- The Blade itself -->
                          <div id="swordBlade" class="blade">
                               <div id="swordColorLayer" class="blade-color-layer"></div>
                               <div class="hamon"></div>
                               <!-- Kanji for 'Destroy' usually engraved -->
                               <div class="engraving">METSU</div>
                          </div>
                     </div>
                     
                     <!-- Fittings -->
                     <div class="tsuba"></div>
                     <div class="tsuka">
                          <div class="samegawa"></div>
                          <div class="tsuka-ito"></div>
                     </div>
                     <div class="kashira"></div>
                </div>
            </div>

            <!-- UI: MODE SELECTION -->
            <div id="forgeModeSelect" class="forge-ui" style="display:block;">
                <h2 style="text-align:center; color:white; font-family:'Cinzel'; margin-bottom:20px;">Como deseja forjar sua lâmina?</h2>
                
                <div class="mode-cards">
                    <div class="mode-card" onclick="selectForgeMode('destiny')">
                        <i data-lucide="sparkles" size="48" color="#d90429"></i>
                        <h4>Destino</h4>
                        <p style="color:#aaa; font-size:0.9rem;">Responda ao chamado da sua alma. O aço revelará sua verdadeira cor.</p>
                    </div>

                    <div class="mode-card" onclick="selectForgeMode('blacksmith')">
                         <i data-lucide="hammer" size="48" color="#00b4d8"></i>
                         <h4>Ferreiro</h4>
                         <p style="color:#aaa; font-size:0.9rem;">Escolha manualmente o minério e o estilo que deseja moldar.</p>
                    </div>
                </div>
            </div>

            <!-- UI: DYNAMIC CONTAINERS -->
            <div id="forgeQuizUI" class="forge-ui" style="display:block;"></div>
            <div id="forgeHammerUI" class="forge-ui" style="display:none;"></div>
            <div id="forgeResultUI" class="forge-ui" style="display:block;"></div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Initialize Logic from nichirin_system.js
    if (window.initForge) {
        window.initForge();
    } else {
        console.error("Nichirin System not loaded!");
        forgeSection.innerHTML += '<p style="color:red; text-align:center;">Erro: Sistema Nichirin não carregado (nichirin_system.js ausente).</p>';
    }
};

window.selectRecipe = function (index) {
    selectedRecipeIndex = index;
    renderForge(); // Re-render to update selection state
};

function renderForgeDetails(index) {
    const recipe = WEAPON_RECIPES[index];
    const canAfford = charData.money >= recipe.cost && charData.ores >= recipe.ores;

    // Placeholder Image Logic (Dynamic SVG based on type ideally, but using icons/divs for now)
    let visual = `<div style="width:120px; height:120px; background:linear-gradient(135deg, ${recipe.color}44, #000); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:20px; box-shadow:0 0 30px ${recipe.color}44;">
        <i data-lucide="${recipe.icon}" style="width:64px; height:64px; color:${recipe.color};"></i>
    </div>`;

    return `
        ${visual}
        <h2 style="color:white; margin:0 0 10px 0; font-family:'Cinzel', serif;">${recipe.name}</h2>
        <p style="color:#aaa; margin-bottom:20px; font-style:italic;">"${recipe.desc}"</p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; width:100%; margin-bottom:20px; background:#1a1a1a; padding:15px; border-radius:8px;">
            <div>
                <div style="font-size:0.7rem; color:#666; text-transform:uppercase;">Dano</div>
                <div style="font-weight:bold; color:white;">${recipe.dmg}</div>
            </div>
            <div>
                <div style="font-size:0.7rem; color:#666; text-transform:uppercase;">Tipo</div>
                <div style="font-weight:bold; color:white;">${recipe.type}</div>
            </div>
        </div>

        <div style="display:flex; gap:20px; margin-bottom:30px;">
            <div style="text-align:center;">
                <div style="font-size:0.8rem; color:${charData.money >= recipe.cost ? '#888' : '#ef4444'};">Custo</div>
                <div style="font-weight:bold; color:${charData.money >= recipe.cost ? '#ffd700' : '#ef4444'}; font-size:1.2rem;">${recipe.cost.toLocaleString('pt-BR')} ¥</div>
            </div>
            <div style="text-align:center;">
                <div style="font-size:0.8rem; color:${charData.ores >= recipe.ores ? '#888' : '#ef4444'};">Minérios</div>
                <div style="font-weight:bold; color:${charData.ores >= recipe.ores ? '#aaa' : '#ef4444'}; font-size:1.2rem;">${recipe.ores}</div>
            </div>
        </div>

        <button onclick="forgeItem(${index})" disabled="${!canAfford}"
            style="width:100%; padding:15px; border-radius:8px; border:none; font-weight:bold; font-size:1rem; cursor:${canAfford ? 'pointer' : 'not-allowed'};
            background: ${canAfford ? 'linear-gradient(135deg, #d90429, #ef233c)' : '#333'}; 
            color: ${canAfford ? 'white' : '#666'};
            box-shadow: ${canAfford ? '0 4px 15px rgba(217, 4, 41, 0.4)' : 'none'};
            transition:0.3s;">
            ${canAfford ? '<i data-lucide="hammer"></i> FORJAR ARMA' : 'RECURSOS INSUFICIENTES'}
        </button>
    `;
}

window.forgeItem = function (index) {
    const recipe = WEAPON_RECIPES[index];

    if (charData.money < recipe.cost || charData.ores < recipe.ores) {
        showToast("Recursos insuficientes!", "error");
        return;
    }

    if (confirm(`Forjar ${recipe.name} por ${recipe.cost} Ienes e ${recipe.ores} Minérios?`)) {
        // Deduct Resources
        charData.money -= recipe.cost;
        charData.ores -= recipe.ores;

        // Determine Blade Color based on Breathing Style
        const styleMap = { 'water': 'Azul', 'thunder': 'Amarelo', 'flame': 'Vermelho', 'beast': 'Índigo', 'stone': 'Cinza', 'mist': 'Turquesa', 'flower': 'Rosa', 'serpent': 'Roxo', 'love': 'Rosa Claro', 'sound': 'Âmbar', 'moon': 'Roxo Profundo', 'sun': 'Preto' };
        const bladeColor = styleMap[currentBreathingStyle] || 'Prata';

        // Create Item Object
        const newItem = {
            id: Date.now().toString(), // Unique ID
            name: recipe.name,
            type: "weapon",
            dmg: recipe.dmg,
            desc: `${recipe.desc} (Forjada por ${humanData.name})`,
            weight: "1.0 kg",
            props: recipe.type,
            rarity: "Raro",
            corLamina: bladeColor,
            criadoPor: humanData.name,
            equipped: false,
            breathingStyle: currentBreathingStyle
        };

        // Add to Inventory
        window.addItemToInventory(newItem);

        // Save & Render
        saveHuman();
        renderForge(); // Update UI costs
        if (typeof updateInventoryStatus === 'function') updateInventoryStatus(); // Sync Global Status

        // Custom Success UI
        showForgeSuccess(newItem);
    }
};

// addItemToInventory is handled by inventory_modules.js
// Do not override it here.

window.showForgeSuccess = function (item) {
    // Create Overlay
    const overlay = document.createElement('div');
    overlay.id = 'forgeSuccessOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.9)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.backdropFilter = 'blur(5px)';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease';

    // Card Content
    overlay.innerHTML = `
        <div style="background:#16161a; border:1px solid #ffd700; padding:30px; border-radius:15px; text-align:center; max-width:90%; width:400px; box-shadow:0 0 50px rgba(255, 215, 0, 0.3); transform:scale(0.8); transition:transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <i data-lucide="hammer" style="color:#ffd700; width:64px; height:64px; margin-bottom:20px;"></i>
            <h2 style="color:#fff; font-family:'Cinzel', serif; font-size:2rem; margin:0 0 10px 0;">FORJA CONCLUÍDA!</h2>
            <p style="color:#aaa; margin-bottom:20px;">Você criou uma obra-prima.</p>
            
            <div style="background:#111; padding:15px; border-radius:8px; margin-bottom:25px; border:1px solid #333;">
                <h3 style="color:#ffd700; margin:0 0 5px 0;">${item.name}</h3>
                <div style="color:#fff; font-weight:bold; font-size:1.2rem;">${item.dmg} <span style="font-size:0.8rem; color:#888;">Dano</span></div>
                <div style="color:${item.corLamina === 'Azul' ? '#00b4d8' : item.corLamina === 'Vermelho' ? '#ef4444' : '#888'}; font-size:0.9rem; margin-top:5px;">Lâmina: ${item.corLamina}</div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <button onclick="closeForgeSuccess()" style="background:transparent; border:1px solid #444; color:#aaa; padding:15px; border-radius:8px; font-weight:bold; cursor:pointer;">Guardar</button>
                <button onclick="equipForgedItem('${item.id}'); closeForgeSuccess()" style="background:linear-gradient(135deg, #ffd700, #ffb703); border:none; color:#000; padding:15px; border-radius:8px; font-weight:bold; cursor:pointer; box-shadow:0 5px 15px rgba(255, 215, 0, 0.3);">Equipar Agora</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Animate In
    setTimeout(() => {
        overlay.style.opacity = '1';
        overlay.querySelector('div').style.transform = 'scale(1)';
        if (window.lucide) window.lucide.createIcons();
    }, 10);
};

window.closeForgeSuccess = function () {
    const overlay = document.getElementById('forgeSuccessOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.querySelector('div').style.transform = 'scale(0.8)';
        setTimeout(() => overlay.remove(), 500);
    }
};

window.equipForgedItem = function (itemId) {
    // Find index by ID
    const idx = charData.inventory.findIndex(i => i.id === itemId);
    if (idx !== -1) {
        // Toggle Equip (assuming toggleEquip handles 'isEquipped' logic)
        // Check if toggleEquip accepts ID or Index. Usually Index.
        // Let's call the existing toggleEquip if available, passing index.
        if (typeof toggleEquip === 'function') {
            toggleEquip(idx);
            showToast(`${charData.inventory[idx].name} Equipada!`, "success");
        } else {
            // Manual fallback
            charData.inventory[idx].equipped = true;
            saveHuman();
            if (typeof renderInventory === 'function') renderInventory();
            showToast("Item Equipado!", "success");
        }
    }
};
// --- STORE SYSTEM ---
window.renderStore = function () {
    const grid = document.getElementById('storeGrid');
    if (!grid) return;
    grid.innerHTML = "";

    const userIsPremium = window.isPremium ? window.isPremium() : false;

    // Items Database for Store
    const storeItems = [
        {
            id: 'hashira_pass',
            name: 'Passe Hashira',
            price: 25.00,
            image: 'crown',
            desc: 'Acesso antecipado a estilos, cores de lâmina exclusivas e suporte ao dev.',
            type: 'premium',
            owned: userIsPremium
        },
        {
            id: 'color_bundle',
            name: 'Pacote de Cores',
            price: 5.00,
            image: 'palette',
            desc: 'Desbloqueie todas as cores de lâmina Nichirin para forjar.',
            type: 'addon',
            owned: false
        },
        {
            id: 'reset_token',
            name: 'Token de Renascimento',
            price: 2.00,
            image: 'refresh-cw',
            desc: 'Permite refazer sua ficha (Antecedente, Respiração e Status).',
            type: 'consumable',
            owned: false
        }
    ];

    storeItems.forEach(item => {
        const card = document.createElement('div');
        card.style.background = "#1a0b2e";
        card.style.border = "1px solid #3c096c";
        card.style.borderRadius = "8px";
        card.style.padding = "15px";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.alignItems = "center";
        card.style.textAlign = "center";
        card.style.position = "relative";
        card.style.overflow = "hidden";

        // Image Icon
        const iconColor = item.id === 'hashira_pass' ? '#ffd700' : '#e0aaff';

        card.innerHTML = `
            <div style="background:rgba(255,255,255,0.05); border-radius:50%; width:60px; height:60px; display:flex; align-items:center; justify-content:center; margin-bottom:10px;">
                <i data-lucide="${item.image}" size="32" color="${iconColor}"></i>
            </div>
            <h3 style="color:#fff; margin:0 0 5px 0; font-size:1.1rem;">${item.name}</h3>
            <p style="color:#aaa; font-size:0.85rem; margin-bottom:15px; flex:1;">${item.desc}</p>
            
            ${item.owned
                ? `<button disabled style="background:#333; color:#888; border:none; padding:8px 20px; border-radius:4px; font-weight:bold; cursor:not-allowed; width:100%;">ADQUIRIDO</button>`
                : `<button onclick="buyItem('${item.id}', ${item.price})" style="background:linear-gradient(45deg, #7b2cbf, #9d4edd); color:#fff; border:none; padding:8px 20px; border-radius:4px; font-weight:bold; cursor:pointer; width:100%; transition:0.2s;">
                    R$ ${item.price.toFixed(2)}
                   </button>`
            }
        `;

        grid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
};

window.buyItem = function (id, price) {
    if (id === 'hashira_pass') {
        window.location.href = 'premium.html';
        return;
    }

    // Standard Purchase Logic
    if (confirm(`Comprar este item por R$ ${price.toFixed(2)}? \n(Simulação: Será debitado em Ienes: ¥${price * 1000})`)) {
        const costInYen = price * 1000; // Simulated Conversion for demo

        if (!humanData.money || humanData.money < costInYen) {
            showToast("Fundos insuficientes em Ienes!", "error");
            return;
        }

        humanData.money -= costInYen;

        // Grant Item Logic (Simplified for Demo)
        if (id === 'reset_token') {
            humanData.inventory.push({
                name: "Token de Renascimento",
                type: "consumable",
                weight: "0.1 kg",
                desc: "Permite resetar ficha.",
                quantity: 1
            });
            showToast("Token adquirido!", "success");
        } else if (id === 'color_bundle') {
            // Unlock logic would go here
            showToast("Pacote de Cores adquirido!", "success");
        }

        saveHuman();
        renderStore(); // Refresh to update buttons if needed (though they are static here)
        if (typeof updateInventoryStatus === 'function') updateInventoryStatus(); // Sync UI
    }
};


// --- SKILL & BACKGROUND TABS ---
window.switchSkillTab = function (tab) {
    // Update Buttons
    document.querySelectorAll('.skill-tab-btn').forEach(b => {
        b.classList.remove('active');
        b.style.color = '#666';
        b.style.borderBottom = 'none';
    });

    const activeBtn = document.getElementById('tab-btn-' + tab);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.color = '#fff';
        activeBtn.style.borderBottom = '2px solid var(--accent-primary)';
    }

    // Update Content Visibility
    document.querySelectorAll('.skill-tab-content').forEach(c => c.style.display = 'none');
    const activeContent = document.getElementById('tab-' + tab);
    if (activeContent) {
        activeContent.style.display = 'block';
        // Animation
        activeContent.style.animation = 'fadeIn 0.3s ease-out';
    }

    if (tab === 'features' && typeof window.renderClassFeaturesInGrimoire === 'function') {
        window.renderClassFeaturesInGrimoire();
    }
}

window.renderBackgroundSkills = function () {
    const container = document.getElementById('backgroundContent');
    if (!container) return;

    container.innerHTML = '';

    // Safety check
    const bg = humanData.background;

    if (!bg) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem; border:1px dashed #333; border-radius:10px;">
                <i data-lucide="help-circle" size="48" color="#666" style="margin-bottom:10px;"></i>
                <p style="color:#888;">Nenhum antecedente registrado para este caçador.</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    // 1. Header with Info
    const header = document.createElement('div');
    header.style.marginBottom = '25px';
    header.style.borderBottom = '1px solid #333';
    header.style.paddingBottom = '15px';
    header.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-end;">
            <div>
                <div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:2px; color:#888; margin-bottom:5px;">Antecedente</div>
                <h2 style="margin:0; font-family:'Cinzel', serif; font-size:2rem; color:#fff;">${bg.name || 'Desconhecido'}</h2>
            </div>
            <div class="race-badge" style="background:#222; border:1px solid #444; padding:5px 15px; border-radius:20px; font-size:0.8rem; color:#aaa;">
                História de Origem
            </div>
        </div>
        ${bg.description ? `<p style="color:#aaa; margin-top:10px; font-style:italic;">"${bg.description}"</p>` : ''}
    `;
    container.appendChild(header);

    // 2. Abilities List
    const titleAbil = document.createElement('h4');
    titleAbil.innerText = "Habilidades de Antecedente";
    titleAbil.style.color = "var(--accent-primary)";
    titleAbil.style.marginBottom = "15px";
    container.appendChild(titleAbil);

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    grid.style.gap = '15px';

    if (bg.abilities && bg.abilities.length > 0) {
        bg.abilities.forEach(ab => {
            const card = document.createElement('div');
            card.className = 'form-card';
            card.style.borderLeft = '3px solid var(--accent-primary)';
            card.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                    <i data-lucide="sparkles" size="18" color="var(--accent-primary)"></i>
                    <span style="font-weight:bold; color:#fff; font-size:1.05rem;">${ab.name}</span>
                </div>
                <div style="color:#ccc; font-size:0.9rem; line-height:1.5;">${ab.desc}</div>
            `;
            grid.appendChild(card);
        });
    } else {
        grid.innerHTML = `<div style="color:#666; font-style:italic;">Este antecedente não fornece habilidades passivas especiais.</div>`;
    }

    container.appendChild(grid);

    // 3. Proficiencies (Optional, since they are in attributes, but helpful to see list)
    if (bg.skills && bg.skills.length > 0) {
        const profSection = document.createElement('div');
        profSection.style.marginTop = '25px';
        profSection.innerHTML = `
            <h4 style="color:#aaa; margin-bottom:10px;">Perícias Treinadas</h4>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                ${bg.skills.map(s => `<span style="background:#222; border:1px solid #444; padding:4px 10px; border-radius:4px; font-size:0.85rem; color:#ddd;">${s}</span>`).join('')}
            </div>
        `;
        container.appendChild(profSection);
    }

    if (window.lucide) lucide.createIcons();
}

window.renderClassFeaturesInGrimoire = function () {
    const container = document.getElementById('featuresContent');
    if (!container) return;
    container.innerHTML = '';

    // Safety check for style ID
    let styleId = 'water';
    if (humanData.breathingStyle) {
        styleId = typeof humanData.breathingStyle === 'object' ? humanData.breathingStyle.id : humanData.breathingStyle;
    }

    const db = window.BREATHING_CLASS_DB;
    const descDB = window.FEATURE_DESCRIPTIONS || {};
    const classData = db ? db[styleId] : null;

    if (!classData || !classData.levels) {
        container.innerHTML = '<div style="color:#666; font-style:italic; padding:20px; text-align:center;">Nenhuma habilidade de classe encontrada.</div>';
        return;
    }

    // Loop 1 to Current Level
    let found = false;
    for (let i = 1; i <= humanData.level; i++) {
        const lvlData = classData.levels[i];
        if (lvlData && lvlData.features && lvlData.features.length > 0) {
            found = true;

            // Level Header
            const levelHeader = document.createElement('div');
            levelHeader.style.fontSize = '0.75rem';
            levelHeader.style.color = 'var(--accent-primary)';
            levelHeader.style.marginTop = '15px';
            levelHeader.style.marginBottom = '8px';
            levelHeader.style.textTransform = 'uppercase';
            levelHeader.style.fontWeight = 'bold';
            levelHeader.style.letterSpacing = '1px';
            levelHeader.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            levelHeader.style.paddingBottom = '5px';
            levelHeader.innerText = `Nível ${i}`;
            container.appendChild(levelHeader);

            // Features List
            lvlData.features.forEach(featName => {
                // Determine Badges & Details
                let type = 'Passiva'; // Default
                let summary = "";
                let fullDesc = "";

                // Fetch Data
                const descText = descDB[featName];
                fullDesc = descText ? descText : "Sem descrição disponível.";

                // Auto-detect type
                if (fullDesc.toLowerCase().includes('reação')) type = 'Reação';
                else if (fullDesc.toLowerCase().includes('ação bônus')) type = 'Ação Bônus';
                else if (fullDesc.toLowerCase().includes('ação')) type = 'Ação';

                // Create Summary
                summary = fullDesc.split('.')[0] + '.';
                if (summary.length > 60) summary = summary.substring(0, 57) + '...';

                // Badge Color
                let badgeColor = '#666'; // Passive
                if (type === 'Ação') badgeColor = '#56ab2f';
                if (type === 'Ação Bônus') badgeColor = '#4cc9f0';
                if (type === 'Reação') badgeColor = '#ffd700';

                // CARD HTML
                const card = document.createElement('div');
                card.className = 'ability-card';
                card.onclick = () => card.classList.toggle('expanded');

                card.innerHTML = `
                    <div class="ability-header">
                        <span class="ability-name">${featName}</span>
                        <span class="ability-badge" style="background:${badgeColor}">${type}</span>
                    </div>
                    <div class="ability-summary">${summary}</div>
                    <div class="ability-details">${fullDesc}</div>
                `;
                container.appendChild(card);
            });
        }
    }

    if (!found) {
        container.innerHTML = '<div style="color:#666; font-style:italic; padding:20px; text-align:center;">Nenhuma habilidade desbloqueada ainda.</div>';
    }

    if (window.lucide) lucide.createIcons();
}


// --- GEAR SELECTION MODAL ---
function showGearSelectionModal() {
    const modal = document.getElementById('gearSelectionModal');
    if (!modal) return;

    const container = document.getElementById('gearOptionsContainer');
    container.innerHTML = "";

    const db = window.BREATHING_CLASS_DB;
    const style = humanData.breathingStyle || 'water';
    const classData = db ? db[style] : null;

    if (!classData || !classData.equipment) {
        // No auto equipment, just close
        humanData.startingGearSelected = true;
        saveHuman();
        return;
    }

    // Weapons Choice
    const weapDiv = document.createElement('div');
    weapDiv.innerHTML = `<h4 style="color:#ddd; margin-bottom:10px;">Escolha sua Arma Principal</h4>`;
    classData.equipment.weapons.forEach((opt, idx) => {
        weapDiv.innerHTML += `
            <label style="display:flex; align-items:center; gap:10px; margin-bottom:8px; cursor:pointer;">
                <input type="radio" name="startWeapon" value="${opt}" ${idx === 0 ? 'checked' : ''}>
                <span style="color:#aaa;">${opt}</span>
            </label>
        `;
    });
    container.appendChild(weapDiv);

    // Armor Choice (if any)
    if (classData.equipment.armor && classData.equipment.armor.length > 0) {
        const armorDiv = document.createElement('div');
        armorDiv.innerHTML = `<h4 style="color:#ddd; margin-bottom:10px; margin-top:20px;">Escolha seu Uniforme</h4>`;
        classData.equipment.armor.forEach((opt, idx) => {
            armorDiv.innerHTML += `
                <label style="display:flex; align-items:center; gap:10px; margin-bottom:8px; cursor:pointer;">
                    <input type="radio" name="startArmor" value="${opt}" ${idx === 0 ? 'checked' : ''}>
                    <span style="color:#aaa;">${opt}</span>
                </label>
            `;
        });
        container.appendChild(armorDiv);
    }

    modal.style.display = 'flex';
}

function confirmStartingGear() {
    // Read selections
    const weaponOpt = document.querySelector('input[name="startWeapon"]:checked');
    const armorOpt = document.querySelector('input[name="startArmor"]:checked');

    let weaponName = weaponOpt ? weaponOpt.value : "Katana Padrão";
    let armorName = armorOpt ? armorOpt.value : "Uniforme Leve";

    // Add to Inventory
    // Add Weapon
    humanData.inventory.push({
        name: weaponName,
        type: 'weapon',
        desc: 'Equipamento Inicial da Respiração',
        weight: '1.0 kg'
    });

    // Add Armor
    humanData.inventory.push({
        name: armorName,
        type: 'armor',
        desc: 'Uniforme Padrão de Caçador',
        weight: '2.0 kg'
    });

    // Flag as selected
    humanData.startingGearSelected = true;
    saveHuman();

    // Close Modal
    document.getElementById('gearSelectionModal').style.display = 'none';

    // Show Toast
    if (typeof showToast === 'function') showToast("Equipamento recebido!", "success");

    // Refresh Inventory View if open
    if (window.renderInventory) window.renderInventory();
}
window.setAttackPreset = function (type) {
    const nameEl = document.getElementById('atkNameInput');
    const dmgEl = document.getElementById('atkDmgInput');
    const typeEl = document.getElementById('atkTypeInput');

    if (type === 'katana') {
        nameEl.value = "Espada Nichirin";
        dmgEl.value = "1d8+2";
        typeEl.value = "Cortante";
    } else if (type === 'unarmed') {
        nameEl.value = "Golpe Desarmado";
        dmgEl.value = "1d4+2";
        typeEl.value = "Concussão";
    } else if (type === 'bow') {
        nameEl.value = "Disparo de Arco";
        dmgEl.value = "1d8+2";
        typeEl.value = "Perfurante";
    }
};

// --- RENDER PROFICIENCIES LIST (OVERVIEW) ---
function renderProficiencies() {
    const list = document.getElementById('profList');
    if (!list) return;

    list.innerHTML = "";

    // 1. Skill Proficiencies (Removed as per request - displayed in attributes)
    // if (humanData.proficiencies) { ... }

    // 2. Saving Throws (from Breathing)
    if (humanData.savingThrows && humanData.savingThrows.length > 0) {
        humanData.savingThrows.forEach(save => {
            const tag = document.createElement('div');
            tag.style.background = "rgba(255, 183, 3, 0.1)";
            tag.style.border = "1px solid #ffb703";
            tag.style.color = "#fff";
            tag.style.padding = "4px 8px";
            tag.style.borderRadius = "4px";
            tag.style.display = "flex";
            tag.style.alignItems = "center";
            tag.style.gap = "5px";

            tag.innerHTML = `<i data-lucide="shield" style="width:12px; fill:#ffb703;"></i> ${save.toUpperCase()}`;
            list.appendChild(tag);
        });
    }

    // 3. Weapon Proficiencies (Breathing)
    if (humanData.weaponProfs && humanData.weaponProfs.length > 0) {
        const tag = document.createElement('div');
        tag.style.background = "rgba(220, 38, 38, 0.1)"; // Red tint
        tag.style.border = "1px solid #dc2626";
        tag.style.color = "#fff";
        tag.style.padding = "4px 8px";
        tag.style.borderRadius = "4px";
        tag.style.display = "flex";
        tag.style.alignItems = "center";
        tag.style.gap = "5px";
        tag.innerHTML = `<i data-lucide="sword" style="width:12px; fill:#dc2626;"></i> Armas: ${humanData.weaponProfs.join(', ')}`;
        list.appendChild(tag);
    }

    // 4. Armor Proficiencies (Breathing)
    if (humanData.armorProfs && humanData.armorProfs.length > 0) {
        const tag = document.createElement('div');
        tag.style.background = "rgba(100, 100, 100, 0.1)"; // Grey tint
        tag.style.border = "1px solid #888";
        tag.style.color = "#fff";
        tag.style.padding = "4px 8px";
        tag.style.borderRadius = "4px";
        tag.style.display = "flex";
        tag.style.alignItems = "center";
        tag.style.gap = "5px";
        tag.innerHTML = `<i data-lucide="shield" style="width:12px; fill:#888;"></i> Armaduras: ${humanData.armorProfs.join(', ')}`;
        list.appendChild(tag);
    }

    // 5. Fallback if empty
    if (list.children.length === 0) {
        list.innerHTML = `<span style="color:#666; font-style:italic;">Nenhuma proficiência registrada.</span>`;
    }

    if (window.lucide) lucide.createIcons();
}

// --- MISSION / SALARY SYSTEM ---
function completeMission() {
    // 1. Initialize State if missing
    if (typeof charData.pendingSalary === 'undefined') {
        charData.pendingSalary = true; // Simulating available for first time
    }

    // 2. Check if available
    if (!charData.pendingSalary) {
        showToast("Nenhum pagamento pendente.", "error");
        return;
    }

    // 3. Calculate Amount logic (Based on Rank)
    const rank = (charData.info.rank || "Mizunoto").toLowerCase();
    let amount = 20000; // Base Mizunoto

    const salaries = {
        'mizunoto': 20000,
        'mizunoe': 25000,
        'kanoto': 30000,
        'kanoe': 40000,
        'tsuchinoto': 50000,
        'tsuchinoe': 60000,
        'hinoto': 80000,
        'hinoe': 100000,
        'kinoto': 150000,
        'kinoe': 200000,
        'hashira': 500000
    };

    // Find best match
    for (const [r, val] of Object.entries(salaries)) {
        if (rank.includes(r)) {
            amount = val;
            break;
        }
    }

    // 4. Add to Balance
    charData.money = (charData.money || 0) + amount;
    charData.pendingSalary = false;
    saveChar(); // Persist

    // 5. Update UI
    if (window.updateInventoryStatus) window.updateInventoryStatus();

    // Update Sidebar
    const sideDisplay = document.getElementById('salaryDisplay');
    if (sideDisplay) {
        // Just flash effects, value is static "Monthly" usually, but let's update if it was 0
        // Or if we track "Pending" visually
    }

    // Update Mobile Button styling
    const mobBtn = document.getElementById('mobileSalaryDisplay');
    if (mobBtn) {
        mobBtn.innerHTML = `
            <i data-lucide="check-circle" size="16"></i>
            <span>Salário Resgatado</span>
        `;
        mobBtn.style.borderColor = '#22c55e';
        mobBtn.style.color = '#22c55e';
        mobBtn.style.background = 'rgba(34, 197, 94, 0.1)';
        mobBtn.onclick = null; // Disable click
    }

    // REFRESH INVENTORY IF OPEN
    if (document.getElementById('inventory').classList.contains('active-tab')) {
        renderInventory();
    }

    // 6. Feedback
    if (window.lucide) lucide.createIcons();
    showToast(`Salário resgatado: +${amount.toLocaleString('pt-BR')} Ienes`, "success");

    // Play sound? (Optional)
}

// Function to reset logic (Dev helper or Monthly Timer)
function resetSalary() {
    charData.pendingSalary = true;
    saveChar();
    console.log("Salary Reset");
}

window.updateStat = function (key, newValue) {
    const val = parseInt(newValue);
    if (isNaN(val) || val < 1) return; // Basic validation

    // Update Data
    humanData.stats[key] = val;
    saveHuman();

    // Calculate New Modifier
    const newMod = Math.floor((val - 10) / 2);

    // Update UI Modifier Display immediately
    const modEl = document.getElementById('mod-' + key);
    if (modEl) {
        modEl.textContent = (newMod >= 0 ? '+' : '') + newMod;
        modEl.style.color = newMod >= 0 ? '#00b4d8' : '#d90429';
    }

    // Re-render skills to update their totals driven by this stat
    // We delay slightly or just call renderAttributes to refresh everything safely
    // But full re-render resets open states etc. Ideally we just re-render skills.
    // For now, full re-render is safest to sync everything.
    renderAttributes();
    if (typeof updateVitalsUI === 'function') updateVitalsUI(); // Check if HP/AC changed (CON/DEX)
};
