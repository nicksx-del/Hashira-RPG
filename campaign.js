/**
 * CAMPAIGN MANAGER
 * Handles localStorage for campaigns, DM tools, and Combat System.
 */

const CAMP_KEY = 'demonSlayerCampaigns';

window.CampaignSystem = {
    // --- DATA ---
    getCampaigns: function () {
        const raw = localStorage.getItem(CAMP_KEY);
        return raw ? JSON.parse(raw) : [];
    },

    saveCampaigns: function (list) {
        localStorage.setItem(CAMP_KEY, JSON.stringify(list));
    },

    getCampaignById: function (id) {
        const list = this.getCampaigns();
        return list.find(c => c.id === id);
    },

    createCampaign: function (name, dmName) {
        const list = this.getCampaigns();
        const newCamp = {
            id: 'camp_' + Date.now(),
            name: name || "Nova Campanha",
            dmName: dmName || "Mestre",
            createdAt: new Date().toISOString(),
            players: [],
            monsters: [],
            combat: {
                active: false,
                round: 1,
                turnIndex: 0,
                order: []
            },
            log: []
        };
        list.push(newCamp);
        this.saveCampaigns(list);
        return newCamp.id;
    },

    // --- ENTITY MANAGEMENT ---
    addPlayerToCampaign: function (campId, charData) {
        const list = this.getCampaigns();
        const c = list.find(x => x.id === campId);
        if (!c) return false;

        // Safety: Initialize arrays if they don't exist (old campaign data)
        if (!c.players) c.players = [];
        if (!c.combat) c.combat = { active: false, order: [], round: 1, turnIndex: 0 };

        if (c.players.find(p => p.charId === charData.id)) return false;

        c.players.push({
            charId: charData.id,
            name: charData.name,
            rank: charData.rank || "Mizunoto",
            currentHP: charData.currentHP || 10,
            maxHP: charData.maxHP || 10,
            currentPE: charData.currentPE || 1,
            maxPE: charData.maxPE || 1,
            ac: charData.ac || 10,
            speed: charData.speed || "9m",
            stats: charData.stats || { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
            initiative: 0,
            conditions: [],
            isNPC: false
        });

        // If combat is active, add to order immediately
        if (c.combat.active) {
            c.combat.order.push(charData.id);
            // Optional: re-sort or just append? Appending is safer.
        }

        this.saveCampaigns(list);
        return true;
    },

    addMonster: function (campId, monsterTemplate) {
        const list = this.getCampaigns();
        const c = list.find(x => x.id === campId);
        if (!c) return;

        // Safety: Initialize arrays if they don't exist (old campaign data)
        if (!c.monsters) c.monsters = [];
        if (!c.players) c.players = [];
        if (!c.combat) c.combat = { active: false, order: [], round: 1, turnIndex: 0 };

        // Count existing to name "Demon A", "Demon B"
        const count = c.monsters.filter(m => m.templateId === monsterTemplate.id).length;
        const letter = String.fromCharCode(65 + count); // A, B, C...

        // Clone
        const newMob = {
            id: 'mob_' + Date.now() + Math.random().toString().substr(2, 5),
            templateId: monsterTemplate.id,
            name: `${monsterTemplate.name} ${letter}`,
            currentHP: monsterTemplate.maxHP,
            maxHP: monsterTemplate.maxHP,
            currentPE: 10,
            maxPE: 10,
            ac: monsterTemplate.ac,
            initiative: 0, // DM will roll
            conditions: [],
            isNPC: true,
            stats: monsterTemplate.stats,
            actions: monsterTemplate.actions
        };

        c.monsters.push(newMob);

        // If combat is active, add to order immediately
        if (c.combat.active) {
            c.combat.order.push(newMob.id);
        }

        this.saveCampaigns(list);
        return newMob;
    },

    removeEntity: function (campId, entityId, isNPC) {
        const list = this.getCampaigns();
        const c = list.find(x => x.id === campId);
        if (!c) return;

        if (isNPC) {
            c.monsters = c.monsters.filter(m => m.id !== entityId);
        } else {
            c.players = c.players.filter(p => p.charId !== entityId);
        }

        // Cleanup combat order
        if (c.combat && c.combat.order) {
            c.combat.order = c.combat.order.filter(id => id !== entityId);
        }

        this.saveCampaigns(list);
    },

    updateEntity: function (campId, entityId, isNPC, updates) {
        const list = this.getCampaigns();
        const c = list.find(x => x.id === campId);
        if (!c) return;

        let ent;
        if (isNPC) ent = c.monsters.find(m => m.id === entityId);
        else ent = c.players.find(p => p.charId === entityId);

        if (!ent) return;

        Object.assign(ent, updates);
        this.saveCampaigns(list);

        if (!isNPC) {
            // Sync back to char sheet logic (simplified)
            this.syncToRealCharacter(entityId, updates);
        }
    },

    toggleCondition: function (campId, entityId, isNPC, condId) {
        const list = this.getCampaigns();
        const c = list.find(x => x.id === campId);
        if (!c) return;

        let ent;
        if (isNPC) ent = c.monsters.find(m => m.id === entityId);
        else ent = c.players.find(p => p.charId === entityId);

        if (!ent) return;
        if (!ent.conditions) ent.conditions = [];

        if (ent.conditions.includes(condId)) {
            ent.conditions = ent.conditions.filter(x => x !== condId);
        } else {
            ent.conditions.push(condId);
        }

        this.saveCampaigns(list);
    },

    // --- COMBAT LOGIC ---
    startCombat: function (campId) {
        const list = this.getCampaigns();
        const c = list.find(x => x.id === campId);
        if (!c) return;

        // Collect all IDs
        const allIds = [
            ...c.players.map(p => ({ id: p.charId, val: p.initiative })),
            ...c.monsters.map(m => ({ id: m.id, val: m.initiative }))
        ];

        // Sort descending
        allIds.sort((a, b) => b.val - a.val);

        c.combat.active = true;
        c.combat.round = 1;
        c.combat.turnIndex = 0;
        c.combat.order = allIds.map(x => x.id);

        this.addLog(campId, "⚔️ Combate Iniciado!", "system");
        this.saveCampaigns(list);
    },

    nextTurn: function (campId) {
        const list = this.getCampaigns();
        const c = list.find(x => x.id === campId);
        if (!c || !c.combat.active) return;

        c.combat.turnIndex++;
        if (c.combat.turnIndex >= c.combat.order.length) {
            c.combat.turnIndex = 0;
            c.combat.round++;
            this.addLog(campId, `🔄 Rodada ${c.combat.round} iniciada.`, "system");
        }

        this.saveCampaigns(list);
    },

    endCombat: function (campId) {
        const list = this.getCampaigns();
        const c = list.find(x => x.id === campId);
        if (!c) return;

        c.combat.active = false;
        c.combat.order = [];
        this.addLog(campId, "🏁 Combate Encerrado.", "system");
        this.saveCampaigns(list);
    },

    syncToRealCharacter: function (charId, updates) {
        const rawSlots = localStorage.getItem('demonSlayerSaveSlots');
        if (!rawSlots) return;

        const slots = JSON.parse(rawSlots);
        const charIndex = slots.findIndex(s => s.id === charId);
        if (charIndex === -1) return;

        // Only sensitive vitals
        if (updates.currentHP !== undefined) slots[charIndex].currentHP = updates.currentHP;
        if (updates.currentPE !== undefined) slots[charIndex].currentPE = updates.currentPE;

        localStorage.setItem('demonSlayerSaveSlots', JSON.stringify(slots));
    },

    // --- LOG ---
    addLog: function (campId, msg, type = 'info') {
        const list = this.getCampaigns();
        const camp = list.find(c => c.id === campId);
        if (!camp) return;

        camp.log.push({
            msg,
            type,
            time: new Date().toLocaleTimeString()
        });

        if (camp.log.length > 50) camp.log.shift();
        this.saveCampaigns(list);
    },

    // --- ACTIONS ---
    longRest: function (campId) {
        const list = this.getCampaigns();
        const camp = list.find(c => c.id === campId);
        if (!camp) return;

        camp.players.forEach(p => {
            p.currentHP = p.maxHP;
            p.currentPE = p.maxPE;
            p.conditions = [];
            this.syncToRealCharacter(p.charId, { currentHP: p.maxHP, currentPE: p.maxPE });
        });

        this.addLog(campId, "Descanso Longo realizado. Todos recuperados.", "system");
        this.saveCampaigns(list);
    },

    // --- SYNC TO CHARACTER SHEET ---
    syncToRealCharacter: function (charId, updates) {
        // Get the saved characters from localStorage
        const raw = localStorage.getItem('demonSlayerSaveSlots');
        if (!raw) return;

        let chars = JSON.parse(raw);
        const charIndex = chars.findIndex(c => c.id === charId);

        if (charIndex === -1) return;

        // Apply updates to the character
        Object.assign(chars[charIndex], updates);

        // Save back to localStorage
        localStorage.setItem('demonSlayerSaveSlots', JSON.stringify(chars));

        console.log(`[Sync] Character ${charId} updated:`, updates);
    }
};
