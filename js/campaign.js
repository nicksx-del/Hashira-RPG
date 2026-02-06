/**
 * CAMPAIGN MANAGER
 * Handles localStorage for campaigns, DM tools, and Combat System.
 */

const CAMP_KEY = 'demonSlayerCampaigns';

window.CampaignSystem = {
    // --- DATA ---
    getCampaigns: function () {
        const raw = localStorage.getItem(CAMP_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error("Corrupted campaign data:", e);
            return [];
        }
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

    deleteCampaign: function (id) {
        let list = this.getCampaigns();
        list = list.filter(c => c.id !== id);
        this.saveCampaigns(list);
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

        // Safety
        if (!c.monsters) c.monsters = [];
        if (!c.players) c.players = [];
        if (!c.combat) c.combat = { active: false, order: [], round: 1, turnIndex: 0 };

        // Naming Logic: Only applying A/B/C if it looks like a generic template (has templateId)
        // If it's a custom created NPC, we might treat it as unique unless specified.
        let finalName = monsterTemplate.name;

        // If it has a templateId, we check for duplicates to append letters
        if (monsterTemplate.templateId) {
            const count = c.monsters.filter(m => m.templateId === monsterTemplate.templateId).length;
            if (count > 0) {
                const letter = String.fromCharCode(65 + count); // A, B...
                finalName = `${monsterTemplate.name} ${letter}`;
            }
        }

        // Create new ID
        const newId = 'mob_' + Date.now() + Math.random().toString().substr(2, 5);

        // FULL MERGE: Copy all properties from template, then overwrite system ones
        const newMob = {
            ...monsterTemplate, // Spread all props (stats, race, breathing, equipment, etc.)
            id: newId,
            name: finalName,
            currentHP: monsterTemplate.currentHP || monsterTemplate.maxHP,
            currentPE: monsterTemplate.currentPE || (monsterTemplate.maxPE || 10),
            initiative: monsterTemplate.initiative || 0,
            conditions: monsterTemplate.conditions || [],
            isNPC: true
        };

        c.monsters.push(newMob);

        // Add to combat if active
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

    startCombat: function (campId) {
        const list = this.getCampaigns();
        const c = list.find(x => x.id === campId);
        if (!c) return;

        // simple logic: reset initiatives? 
        // For now just notify "Combat Started"
        this.addLog(campId, "Combate Iniciado!", "combat");

        // Sort by initiative would happen in UI
    },

    nextTurn: function (campId) {
        // Logic to advance turn index
        // For now, simpler implementation handled by UI or just logging
        this.addLog(campId, "Avançando Turno...", "system");
    },

    updateEntity: function (campId, entityId, isNPC, updates) {
        const list = this.getCampaigns();
        const c = list.find(x => x.id === campId);
        if (!c) return;

        let target = null;
        if (isNPC) {
            target = c.monsters.find(m => m.id === entityId);
        } else {
            target = c.players.find(p => p.charId === entityId);
        }

        if (target) {
            Object.assign(target, updates);
            this.saveCampaigns(list);

            // WS Sync if Player
            if (!isNPC) {
                this.syncToRealCharacter(entityId, updates);
                this.sendUpdate(campId, entityId, updates, true);
            }
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

    // --- FOLDERS ---
    addFolder: function (campId, folderName) {
        const list = this.getCampaigns();
        const c = list.find(x => x.id === campId);
        if (!c) return false;

        if (!c.folders) c.folders = ["Aliados", "Luas Superiores", "Onis Menores", "Aldeões"];
        if (c.folders.includes(folderName)) return false; // Duplicate

        c.folders.push(folderName);
        this.saveCampaigns(list);
        return true;
    },



    // --- COMBAT LOGIC ---
    // --- COMBAT LOGIC ---
    startCombat: function (campId) {
        const list = this.getCampaigns();
        const c = list.find(x => x.id === campId);
        if (!c) return;

        // Reset Round
        c.combat.active = true;
        c.combat.round = 1;
        c.combat.turnIndex = 0;

        // Auto-Roll Initiative for Monsters
        if (c.monsters) {
            c.monsters.forEach(m => {
                const dex = m.stats ? m.stats.dex : 10;
                const mod = Math.floor((dex - 10) / 2);
                const roll = Math.floor(Math.random() * 20) + 1;
                m.initiative = roll + mod;
            });
        }

        // Collect all IDs
        const allIds = [
            ...c.players.map(p => ({ id: p.charId, val: p.initiative || 0 })),
            ...c.monsters.map(m => ({ id: m.id, val: m.initiative || 0 }))
        ];

        // Sort descending
        allIds.sort((a, b) => b.val - a.val);

        c.combat.order = allIds.map(x => x.id);

        this.addLog(campId, "⚔️ Combate Iniciado! Iniciativas Roladas.", "system");
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

        // Update active sheet if it matches
        try {
            const activeRaw = localStorage.getItem('demonSlayerChar');
            if (activeRaw) {
                const activeChar = JSON.parse(activeRaw);
                if (activeChar && activeChar.id === charId) {
                    Object.assign(activeChar, updates);
                    localStorage.setItem('demonSlayerChar', JSON.stringify(activeChar));
                }
            }
        } catch (e) {
            console.warn('Erro ao sincronizar ficha ativa:', e);
        }

        // Backwards compatibility: update legacy list if present
        try {
            const legacyRaw = localStorage.getItem('demonSlayerAllChars');
            if (legacyRaw) {
                const legacy = JSON.parse(legacyRaw);
                const legacyIndex = legacy.findIndex(c => c.id === charId);
                if (legacyIndex > -1) {
                    Object.assign(legacy[legacyIndex], updates);
                    localStorage.setItem('demonSlayerAllChars', JSON.stringify(legacy));
                }
            }
        } catch (e) {
            console.warn('Erro ao sincronizar lista legada:', e);
        }

        console.log(`[Sync] Character ${charId} updated:`, updates);
    },

    // --- WEBSOCKET SYNC ---
    ws: null,

    connectServer: function (campId, charId = null) {
        if (this.ws) return; // Already connected

        // Auto-detect localhost or 127.0.0.1
        this.ws = new WebSocket('ws://localhost:8080');

        this.ws.onopen = () => {
            console.log('🔌 Connected to Sync Server');
            window.dispatchEvent(new CustomEvent('server-status', { detail: 'online' }));
            if (charId) {
                // Player joining
                this.ws.send(JSON.stringify({
                    type: 'JOIN_PLAYER',
                    campId: campId,
                    charId: charId
                }));
            } else {
                // DM joining
                this.ws.send(JSON.stringify({
                    type: 'JOIN_DM',
                    campId: campId
                }));
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'SYNC_DATA') {
                    // Update Local Data (Player View)
                    console.log('📥 Received SYNC:', msg.payload);
                    this.handleSync(msg.payload);
                } else if (msg.type === 'PLAYER_SYNCED') {
                    // DM View: Player updated themselves
                    console.log('📥 Player Synced:', msg.charId, msg.payload);
                    // Dispatch event for DM Panel
                    window.dispatchEvent(new CustomEvent('character-synced', {
                        detail: { id: msg.charId, ...msg.payload }
                    }));

                    // Also update campaign storage if possible?
                    // DM Panel listener updates 'currentCamp' in memory. 
                    // We should also update the persistent list.
                    const list = this.getCampaigns();
                    // We don't have campId here easily unless we store it. 
                    // But DM Panel will likely save on next action.
                    // Ideally we save here too.
                    // Using msg.charId lookup is inefficient across all campaigns.
                    // Rely on DM Panel listener for now as it has context.
                }
            } catch (e) { console.error(e); }
        };

        this.ws.onclose = () => {
            console.log('🔌 Disconnected. Retrying in 5s...');
            window.dispatchEvent(new CustomEvent('server-status', { detail: 'offline' }));
            this.ws = null;
            setTimeout(() => this.connectServer(campId, charId), 5000);
        };
    },

    sendUpdate: function (campId, charId, payload, isDM = false) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        this.ws.send(JSON.stringify({
            type: 'UPDATE_PLAYER',
            campId: campId,
            charId: charId,
            payload: payload
        }));
    },

    handleSync: function (payload) {
        // payload = { currentHP, maxHP, currentPE... } for the CURRENT character
        // We need to update localStorage and trigger UI refresh if possible

        const raw = localStorage.getItem('demonSlayerChar');
        if (!raw) return;

        const char = JSON.parse(raw);
        Object.assign(char, payload);
        localStorage.setItem('demonSlayerChar', JSON.stringify(char));

        // Sync to "slots" as well to be safe
        if (char.id) {
            this.syncToRealCharacter(char.id, payload);
        }

        // Dispatch Custom Event for UI to listen
        window.dispatchEvent(new CustomEvent('character-synced', { detail: char }));
    }
};
