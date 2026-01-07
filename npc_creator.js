// --- NPC CREATOR LOGIC ---
// Extracted from dm-panel.html

// --- CONSTANTS FOR ATTRIBUTE BONUSES ---
const RACE_BONUSES = {
    'Humano': { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    'Oni': { str: 4, dex: 2, con: 4, int: -2, wis: -1, cha: -2 },
    'Animal': { str: 1, dex: 2, int: -3 }
};

const BREATHING_BONUSES = {
    'Água': { wis: 2, dex: 1, con: 1 },
    'Trovão': { dex: 3, str: 1 },
    'Fera': { str: 2, con: 2, wis: -1 },
    'Chamas': { str: 2, cha: 2 },
    'Névoa': { dex: 2, wis: 2 },
    'Pedra': { con: 3, str: 2 },
    'Vento': { str: 2, dex: 2 },
    'Flor': { dex: 2, cha: 2 },
    'Serpente': { dex: 2, int: 2 },
    'Inseto': { dex: 3, str: -1 },
    'Amor': { str: 3, cha: 2 },
    'Som': { dex: 2, cha: 1 },
    'Lua': { dex: 4, str: 3, con: 3 }, // Powerful
    'Sol': { str: 5, con: 5, wis: 5 }, // Legendary
    'Nenhuma': {}
};

function calculateBaseStats(race, breathing) {
    // 1. Base Stats (Stronger Base for NPCs to be challenges)
    let stats = { str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 10 };

    // 2. Apply Race Bonuses
    const rBonuses = RACE_BONUSES[race] || RACE_BONUSES['Humano'];
    for (let key in rBonuses) {
        if (stats[key] !== undefined) stats[key] += rBonuses[key];
    }

    // 3. Apply Breathing Bonuses
    const bBonuses = BREATHING_BONUSES[breathing] || {};
    for (let key in bBonuses) {
        if (stats[key] !== undefined) stats[key] += bBonuses[key];
    }

    return stats;
}

// Simulating React's useEffect to monitor form changes
function setupAttributeAutomation() {
    const raceInput = document.getElementById('newNpcRace');
    const styleInput = document.getElementById('newNpcStyle');

    function runEffect() {
        // Get current values (State)
        const race = raceInput?.value || "Humano";
        const styleVal = styleInput?.value || "Nenhuma";

        // Custom Style Visibility Logic
        const customContainer = document.getElementById('customStyleContainer');
        if (customContainer) {
            if (styleVal === 'custom') {
                customContainer.style.display = 'block';
            } else {
                customContainer.style.display = 'none';
            }
        }

        // Calculate stats based on dependencies (Custom = No Bonus)
        const calcStyle = styleVal === 'custom' ? 'Nenhuma' : styleVal;
        const newStats = calculateBaseStats(race, calcStyle);

        // Update State (Attributes inputs)
        // ... (existing update loop)

        // --- AC AUTOMATION ---
        const armorSelect = document.getElementById('newNpcArmor');
        if (armorSelect) {
            const armorVal = armorSelect.value;
            // Get current Dex from Calculated stats (or input if manual override?) 
            // Better to use the calculated stats for consistency in this loop
            const dexVal = newStats.dex;
            const dexMod = Math.floor((dexVal - 10) / 2);

            let baseAC = 10 + dexMod; // Default 'none'

            if (armorVal === 'slayer_uniform') {
                baseAC = 12 + dexMod;
            } else if (armorVal === 'haori') {
                baseAC = 13 + dexMod;
            } else if (armorVal === 'none') {
                // If Oni or specific race, maybe add Con?
                // User said: "CA 10 + Des + Con" for 'none' / Oni
                if (race === 'Oni') {
                    const conMod = Math.floor((newStats.con - 10) / 2);
                    baseAC = 10 + dexMod + conMod;
                } else {
                    baseAC = 10 + dexMod;
                }
            }

            const acInput = document.getElementById('newNpcAC');
            if (acInput) acInput.value = baseAC;
        }

        // Update State (Attributes inputs)
        ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
            const id = 'attr' + stat.charAt(0).toUpperCase() + stat.slice(1);
            const input = document.getElementById(id);
            if (input) {
                input.value = newStats[stat];

                // Trigger derived recalculations (Side Effect)
                if (typeof updateMod === 'function') {
                    updateMod(stat.charAt(0).toUpperCase() + stat.slice(1));
                }
            }
        });

        // Other side effects (Derived stats)
        if (typeof recalcDerived === 'function') recalcDerived();
    }

    // Attach Listeners (Effect Triggers)
    if (raceInput) raceInput.addEventListener('change', runEffect);
    if (styleInput) styleInput.addEventListener('change', runEffect);

    // Add Listener for Armor to trigger AC recalc
    const armorInput = document.getElementById('newNpcArmor');
    if (armorInput) armorInput.addEventListener('change', runEffect);

    // Initial run? User said "monitor changes", not necessarily runs on mount, 
    // but usually initialized. Let's not force it on load to keep default values clean unless changed.
}

// Initialize automation
document.addEventListener('DOMContentLoaded', setupAttributeAutomation);

// Legacy reference if needed, redirects to manual dispatch
function updateStatsFromSelection() {
    const styleInput = document.getElementById('newNpcStyle');
    if (styleInput) styleInput.dispatchEvent(new Event('change'));
}


let npcActions = []; // State for creator actions

// --- ACTION LIST FUNCTIONS ---

function addActionItem() {
    npcActions.push({
        id: Date.now(),
        name: "Nova Ação",
        cost: 0,
        type: "Ataque Corpo-a-Corpo", // Default
        damage: "1d6 + 2",
        dmgType: "Cortante",
        description: "",
        isEditing: true
    });
    renderActionList();
}

function toggleEditAction(index) {
    npcActions[index].isEditing = !npcActions[index].isEditing;
    renderActionList();
}

function saveAction(index) {
    // Update state from inputs
    const card = document.querySelectorAll('.action-card')[index];
    if (!card) return;

    npcActions[index].name = card.querySelector('.act-name').value;
    npcActions[index].cost = parseInt(card.querySelector('.act-cost').value) || 0;
    npcActions[index].type = card.querySelector('.act-type').value;
    npcActions[index].damage = card.querySelector('.act-dmg').value;
    npcActions[index].dmgType = card.querySelector('.act-dtype').value;
    npcActions[index].description = card.querySelector('.act-desc').value;

    npcActions[index].isEditing = false;
    renderActionList();
}

function deleteAction(index) {
    if (!confirm("Remover esta ação?")) return;
    npcActions.splice(index, 1);
    renderActionList();
}

function renderActionList() {
    const list = document.getElementById('npcActionList');
    list.innerHTML = '';

    if (npcActions.length === 0) {
        list.innerHTML = `<div style="text-align:center; color:#555; font-size:0.8rem; padding:10px; border:1px dashed #333; border-radius:6px;">Nenhuma ação adicionada</div>`;
        return;
    }

    npcActions.forEach((act, i) => {
        const html = act.isEditing
            ? `
        <div class="action-card editing">
                <div class="action-header" onclick="toggleEditAction(${i})">
                    <span style="font-weight:bold; color:var(--primary);">Editando: ${act.name}</span>
                    <i data-lucide="chevron-up" size="14"></i>
                </div>
                <div class="action-body">
                    <div style="display:flex; gap:10px;">
                        <input type="text" class="d-input act-name" style="flex:2;" value="${act.name}" placeholder="Nome da Técnica">
                        <input type="number" class="d-input act-cost" style="flex:1;" value="${act.cost}" placeholder="Custo BP">
                    </div>
                    <div style="display:flex; gap:10px;">
                        <select class="d-input act-type" style="flex:1;">
                            <option value="Ataque Corpo-a-Corpo" ${act.type === 'Ataque Corpo-a-Corpo' ? 'selected' : ''}>Corpo-a-Corpo</option>
                            <option value="Ataque à Distância" ${act.type === 'Ataque à Distância' ? 'selected' : ''}>Distância</option>
                            <option value="Suporte / Buff" ${act.type === 'Suporte / Buff' ? 'selected' : ''}>Suporte</option>
                            <option value="Reação" ${act.type === 'Reação' ? 'selected' : ''}>Reação</option>
                        </select>
                        <input type="text" class="d-input act-dmg" style="flex:1;" value="${act.damage}" placeholder="Ex: 1d6+2">
                        <select class="d-input act-dtype" style="flex:1;">
                            <option value="Cortante" ${act.dmgType === 'Cortante' ? 'selected' : ''}>Cortante</option>
                            <option value="Perfurante" ${act.dmgType === 'Perfurante' ? 'selected' : ''}>Perfurante</option>
                            <option value="Contundente" ${act.dmgType === 'Contundente' ? 'selected' : ''}>Contundente</option>
                            <option value="Elétrico" ${act.dmgType === 'Elétrico' ? 'selected' : ''}>Elétrico</option>
                            <option value="Fogo" ${act.dmgType === 'Fogo' ? 'selected' : ''}>Fogo</option>
                            <option value="Água" ${act.dmgType === 'Água' ? 'selected' : ''}>Água</option>
                        </select>
                    </div>
                    <textarea class="d-input act-desc" rows="3" placeholder="Descrição do efeito...">${act.description}</textarea>
                    <div style="display:flex; justify-content:flex-end; gap:5px;">
                        <button class="btn btn-danger" onclick="deleteAction(${i})">Excluir</button>
                        <button class="btn btn-primary" onclick="saveAction(${i})">Salvar</button>
                    </div>
                </div>
            </div>
    `
            : `
        <div class="action-card">
            <div class="action-header" onclick="toggleEditAction(${i})">
                <div style="display:flex; align-items:center;">
                    <i data-lucide="sword" size="14" style="margin-right:8px; color:#777;"></i>
                    <span style="font-weight:bold;">${act.name}</span>
                    <span class="action-preview-tag">${act.cost} BP</span>
                    <span class="action-preview-tag">${act.damage}</span>
                </div>
                <div style="display:flex; gap:5px;">
                    <button class="btn-icon" onclick="event.stopPropagation(); alert('Rolagem simulada: ${act.damage}');">
                        <i data-lucide="play" size="14"></i>
                    </button>
                    <i data-lucide="chevron-down" size="14" style="margin-left:5px;"></i>
                </div>
            </div>
            </div>
        `;
        list.insertAdjacentHTML('beforeend', html);
    });
    // Ensure lucide icons are re-rendered if the library is available
    if (window.lucide) lucide.createIcons();
}

// --- NPC FORM MANIPULATION ---

function openNpcCreator() {
    const modal = document.getElementById('npcCreatorModal');
    if (modal) modal.style.display = 'flex';

    // Populate Folders
    const folderSelect = document.getElementById('newNpcFolder');
    if (folderSelect) {
        folderSelect.innerHTML = '<option value="">Sem Pasta (Raiz)</option>';
        // Access Campaign Data Globally
        if (window.CampaignSystem && window.CAMP_ID) {
            const camp = window.CampaignSystem.getCampaignById(window.CAMP_ID);
            const folders = (camp && camp.folders) ? camp.folders : ["Aliados", "Luas Superiores", "Onis Menores", "Aldeões"];

            folders.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f;
                opt.innerText = f;
                folderSelect.appendChild(opt);
            });
        }
    }

    // Reset form
    const fields = ['newNpcName', 'newNpcAge', 'newNpcHeight', 'newNpcWeight', 'newNpcNotes', 'newNpcStyle'];
    fields.forEach(f => {
        const el = document.getElementById(f);
        if (el) el.value = '';
    });

    const lvlEl = document.getElementById('newNpcLevel');
    if (lvlEl) lvlEl.value = '1';

    const peEl = document.getElementById('newNpcPE');
    if (peEl) peEl.value = '1';

    // Reset attributes to 10
    ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'].forEach(attr => {
        const el = document.getElementById('attr' + attr);
        if (el) {
            el.value = 10;
            updateMod(attr); // This will also recalc derived
        }
    });

    // Uncheck all skills
    document.querySelectorAll('.skill-checkbox').forEach(cb => cb.checked = false);

    npcActions = []; // Reset actions
    renderActionList();
}

function closeNpcCreator() {
    const modal = document.getElementById('npcCreatorModal');
    if (modal) modal.style.display = 'none';
}

function autoFillPE() {
    const level = parseInt(document.getElementById('newNpcLevel').value) || 1;
    const peEl = document.getElementById('newNpcPE');
    if (peEl) peEl.value = level;
    recalcDerived(); // Just in case level affects other things
}

function collectSkills() {
    const checkboxes = document.querySelectorAll('.skill-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function updateMod(statShort) {
    const el = document.getElementById('attr' + statShort);
    if (!el) return;
    const val = parseInt(el.value) || 10;
    const mod = Math.floor((val - 10) / 2);
    const sign = mod >= 0 ? '+' : '';

    const modEl = document.getElementById('mod' + statShort);
    if (modEl) modEl.innerText = sign + mod;

    recalcDerived();
}

function toggleManualOverride() {
    const check = document.getElementById('manualOverride');
    if (!check) return;
    const isManual = check.checked;
    const fields = ['derivHP', 'derivAC', 'derivInit'];
    fields.forEach(f => {
        const el = document.getElementById(f);
        if (el) {
            el.disabled = !isManual;
            if (!isManual) el.classList.remove('manual-active');
        }
    });
    if (!isManual) recalcDerived();
}

function recalcDerived() {
    const override = document.getElementById('manualOverride');
    if (override && override.checked) return;

    const lvl = parseInt(document.getElementById('newNpcLevel')?.value) || 1;
    const str = parseInt(document.getElementById('attrStr')?.value) || 10;
    const dex = parseInt(document.getElementById('attrDex')?.value) || 10;
    const con = parseInt(document.getElementById('attrCon')?.value) || 10;

    const conMod = Math.floor((con - 10) / 2);
    const dexMod = Math.floor((dex - 10) / 2);

    // HP Calculation: Level 1 (10+Con), Others (6+Con)
    let hp = (10 + conMod) + ((lvl - 1) * (6 + conMod));
    if (hp < 1) hp = 1;

    // AC: 10 + Dex (Unarmored)
    let ac = 10 + dexMod;

    // Init: DexMod
    let init = dexMod;

    // Update fields (using new IDs if they changed in new layout, 
    // but simplified layout has inputs like newNpcHP)
    // Actually, in the new layout we have 'newNpcHP' and 'newNpcAC'.
    // The previous code targeted 'derivHP'.
    // Let's update to target 'newNpcHP' etc as per new layout if they exist, 
    // or fallback to old IDs if that's what's in the DOM.
    // Based on the HTML update, the IDs are newNpcHP, newNpcAC.
    // But 'derivInit' seems to be gone/replaced? 
    // Wait, the new layout has Attributes & Combat: HP and AC. 
    // The previous 'derivInit' was in the old layout. 
    // I should check if 'deriv...' IDs are still used or if I should target 'newNpcHP'.

    const hpEl = document.getElementById('newNpcHP') || document.getElementById('derivHP');
    if (hpEl) hpEl.value = hp;

    const acEl = document.getElementById('newNpcAC') || document.getElementById('derivAC');
    if (acEl) acEl.value = ac;

    // Derived Speed/Init might be missing in new layout simple view, 
    // but let's leave this robust.
}

function confirmNpcCreation() {
    const nameEl = document.getElementById('newNpcName');
    if (!nameEl || !nameEl.value) return alert("Nome é obrigatório!");
    const name = nameEl.value;

    console.log("Saving NPC: " + name);

    // Personal Data
    const age = parseInt(document.getElementById('newNpcAge')?.value) || null;
    const height = document.getElementById('newNpcHeight')?.value || null;
    const weight = document.getElementById('newNpcWeight')?.value || null;
    const race = document.getElementById('newNpcRace')?.value || "Humano";
    const folder = document.getElementById('newNpcFolder')?.value || "";

    const job = document.getElementById('newNpcClass')?.value || "";
    let style = document.getElementById('newNpcStyle')?.value || "";

    // Handle Custom Style
    if (style === 'custom') {
        const customStyle = document.getElementById('newNpcStyleCustom')?.value;
        if (customStyle && customStyle.trim() !== "") {
            style = customStyle.trim();
        } else {
            style = "Personalizada"; // Default if empty
        }
    }

    // Level & Energy
    const lvl = parseInt(document.getElementById('newNpcLevel')?.value) || 1;
    const pe = parseInt(document.getElementById('newNpcPE')?.value) || lvl;

    // Attributes
    const stats = {
        str: parseInt(document.getElementById('attrStr')?.value) || 10,
        dex: parseInt(document.getElementById('attrDex')?.value) || 10,
        con: parseInt(document.getElementById('attrCon')?.value) || 10,
        int: parseInt(document.getElementById('attrInt')?.value) || 10,
        wis: parseInt(document.getElementById('attrWis')?.value) || 10,
        cha: parseInt(document.getElementById('attrCha')?.value) || 10
    };

    // Combat Stats
    const hp = parseInt(document.getElementById('newNpcHP')?.value) || 10;
    const ac = parseInt(document.getElementById('newNpcAC')?.value) || 10;

    // Equipment
    const weapon = document.getElementById('newNpcWeapon')?.value || "unarmed";
    const weaponName = document.getElementById('newNpcWeaponName')?.value || "";
    const armor = document.getElementById('newNpcArmor')?.value || "none";

    // Skills
    const skills = collectSkills();

    // Notes
    const notes = document.getElementById('newNpcNotes')?.value || `Criado via DM Panel.`;

    // Energy Points Logic (BP)
    const bp = parseInt(document.getElementById('newNpcBP')?.value) || 10;
    const bpCurr = parseInt(document.getElementById('newNpcBPCurr')?.value) || 10;

    const t = {
        id: 'gen_' + Date.now(),
        name: name,
        age: age,
        height: height,
        weight: weight,
        // Use folder if selected, otherwise fallback to "Todos" (Default Root)
        category: folder ? folder : "Todos",
        folderId: folder ? folder : "Todos",
        maxHP: hp,
        currentHP: hp,
        ac: ac,
        stats: stats,
        level: lvl,
        pe: pe,
        peMax: pe,
        bp: bp,
        bpMax: bp,
        currentBP: bpCurr,
        race: race,
        class: job,
        breathingStyle: style,
        skills: skills,
        equipment: {
            weapon: weapon,
            weaponName: weaponName,
            armor: armor
        },
        avatar: race === 'Oni' ? 'assets/default_oni.png' : 'assets/default_slayer.png',
        notes: notes,
        actions: npcActions
    };

    // Use global CampaignSystem
    if (window.CampaignSystem) {
        // ROBUST ID RETRIEVAL STRATEGY
        let targetCampId = window.CAMP_ID;

        // Try URL Params directly if global missing
        if (!targetCampId) {
            const params = new URLSearchParams(window.location.search);
            targetCampId = params.get('id');
        }

        // Fallback
        if (!targetCampId) {
            const allCamps = window.CampaignSystem.getCampaigns();
            if (allCamps && allCamps.length > 0) {
                targetCampId = allCamps[0].id;
                console.warn("Using fallback campaign ID: " + targetCampId);
            }
        }

        if (targetCampId) {
            console.log("Adding monster to Campaign ID: " + targetCampId);
            const newMob = window.CampaignSystem.addMonster(targetCampId, t);

            if (newMob) {
                console.log("Monster Added successfully:", newMob);

                // UI Refresh Sequence
                // 1. Close Modal clearly
                if (typeof closeNpcCreator === 'function') closeNpcCreator();

                // 2. Reload Global Data (Crucial for renderSidebar to see new data)
                if (typeof window.loadCampaignData === 'function') {
                    window.loadCampaignData();
                    console.log("Campaign Data Reloaded via window.loadCampaignData()");
                } else {
                    console.error("Critical: window.loadCampaignData not found");
                }

                // 3. Force Sidebar Redraw
                setTimeout(() => {
                    if (typeof window.renderSidebar === 'function') {
                        window.renderSidebar();
                        console.log("Sidebar Redrawn via window.renderSidebar()");
                    } else {
                        console.error("Critical: window.renderSidebar not found");
                    }

                    if (typeof showToast === 'function') showToast("NPC " + name + " Criado com sucesso!");

                    // 4. Auto-Select
                    if (typeof window.selectEntity === 'function') {
                        // Small delay to ensure renderSidebar has populated DOM if needed (though it shouldn't matter for logic)
                        console.log("Auto-selecting new NPC: " + newMob.id);
                        window.selectEntity(newMob.id, false);
                    }
                }, 50); // Slight delay to let loadCampaignData finish if it was async (it's sync but good practice for UI repaints)
            } else {
                alert("Erro ao salvar NPC no banco de dados.");
            }
        } else {
            console.error("CAMP_ID not defined on window or URL");
            alert("Erro Fatal: Não foi possível identificar a campanha. Tente recarregar a página.");
        }

    } else {
        console.error("CampaignSystem not found");
        alert("Erro no sistema de campanha.");
    }
}
