// ============================================
// INICIALIZAÇÃO COMPLETA DO DASHBOARD
// ============================================

// Garantir que charData existe e está completo
function initializeDashboard() {
    console.log("=== Inicializando Dashboard ===");

    // Carregar dados do personagem
    let loadedChar = null;
    try {
        const stored = localStorage.getItem('demonSlayerChar');
        if (stored) {
            loadedChar = JSON.parse(stored);
            console.log("Personagem carregado:", loadedChar);
        }
    } catch (e) {
        console.error("Erro ao carregar personagem:", e);
    }

    // Se não houver personagem, redirecionar para index
    if (!loadedChar || !loadedChar.name) {
        console.warn("Nenhum personagem encontrado, redirecionando...");
        window.location.href = 'index.html';
        return;
    }

    // Garantir estrutura completa do charData
    window.charData = {
        // Dados básicos
        name: loadedChar.name || 'Sem Nome',
        race: loadedChar.race || 'Humano',
        level: loadedChar.level || 1,
        xp: loadedChar.xp || 0,
        profBonus: loadedChar.profBonus || 2,

        // Atributos
        attributes: {
            str: loadedChar.attributes?.str || 10,
            dex: loadedChar.attributes?.dex || 10,
            con: loadedChar.attributes?.con || 10,
            int: loadedChar.attributes?.int || 10,
            wis: loadedChar.attributes?.wis || 10,
            cha: loadedChar.attributes?.cha || 10
        },

        // Combate
        hp: loadedChar.hp || 10,
        hpMax: loadedChar.hp || 10,
        currentHP: loadedChar.currentHP || loadedChar.hp || 10,
        pe: loadedChar.currentPE || loadedChar.maxPE || 1,
        peMax: loadedChar.maxPE || 1,
        ac: loadedChar.ac || 10,

        // Respiração
        breathingStyle: loadedChar.breathingStyle || 'Nenhuma',
        breathing: loadedChar.breathing || loadedChar.breathingStyle || 'Nenhuma',

        // Inventário
        inventory: loadedChar.inventory || [],

        // Ataques
        attacks: loadedChar.attacks || [],

        // Técnicas
        techniques: loadedChar.techniques || [],

        // Perícias
        skillProficiencies: loadedChar.skillProficiencies || loadedChar.proficiencies || [],

        // Biografia
        description: loadedChar.description || { story: '', notes: '', money: '0' },

        // Rank e Salário
        rank: loadedChar.rank || 'Mizunoto',
        salary: loadedChar.salary || '200 Y'
    };

    console.log("charData inicializado:", window.charData);

    // Limpar armas iniciais duplicadas (Katana vs Nichirin)
    cleanupStarterWeapons();

    // Salvar estado inicial
    saveState();

    // Inicializar UI
    setTimeout(() => {
        initializeAllSystems();
    }, 100);
}

// Inicializar todos os sistemas do dashboard
function initializeAllSystems() {
    console.log("=== Inicializando Sistemas ===");

    // 1. Atualizar informações básicas
    updateBasicInfo();

    // 2. Atualizar barras de HP/PE
    if (typeof updateBars === 'function') {
        updateBars();
    }

    // 3. Atualizar radar chart
    if (typeof updateRadarChart === 'function') {
        updateRadarChart();
    }

    // 4. Atualizar cards de atributos
    if (typeof updateAttributeCards === 'function') {
        updateAttributeCards();
    }

    // 5. Renderizar perícias
    if (typeof renderSkills === 'function') {
        renderSkills();
    }

    // 6. Renderizar inventário
    if (typeof renderInventory === 'function') {
        renderInventory();
    }

    // 7. Renderizar ataques
    if (typeof renderAttacks === 'function') {
        renderAttacks();
    }

    // 8. Renderizar técnicas
    if (typeof renderTechniques === 'function') {
        renderTechniques();
    }

    // 9. Renderizar respiração
    if (typeof renderBreathing === 'function') {
        renderBreathing();
    }

    // 10. Calcular defesa
    if (typeof calcDefense === 'function') {
        calcDefense();
    }

    // 11. Inicializar ícones Lucide
    if (window.lucide) {
        lucide.createIcons();
    }

    console.log("=== Todos os sistemas inicializados ===");
}

// Atualizar informações básicas na UI
function updateBasicInfo() {
    // Nome
    const nameEl = document.getElementById('dispName');
    if (nameEl) nameEl.textContent = charData.name;

    // Rank
    const rankEl = document.getElementById('dispRank');
    if (rankEl) rankEl.textContent = charData.rank || 'Mizunoto';

    // Classe (Respiração)
    const classEl = document.getElementById('dispClass');
    if (classEl) {
        const breathingText = typeof charData.breathingStyle === 'string'
            ? charData.breathingStyle
            : charData.breathingStyle?.name || charData.breathing || 'Nenhuma';
        classEl.textContent = breathingText;
    }

    // Nível e XP
    const levelEl = document.getElementById('dispLevel');
    if (levelEl) levelEl.textContent = charData.level || 1;

    const xpEl = document.getElementById('xpDisplay');
    if (xpEl) xpEl.textContent = charData.xp || 0;
}

window.levelUpSlayer = function () {
    if (!charData) return;
    charData.level = (charData.level || 1) + 1;
    updateBasicInfo();
    saveState();
    alert(`Nível Aumentado! Agora você é nível ${charData.level}.`);
};

// Salvar estado atual
window.saveState = function () {
    try {
        localStorage.setItem('demonSlayerChar', JSON.stringify(charData));

        // Atualizar também no array de personagens
        let allChars = [];
        try {
            const stored = localStorage.getItem('demonSlayerAllChars');
            if (stored) allChars = JSON.parse(stored);
        } catch (e) {
            allChars = [];
        }

        // Encontrar e atualizar o personagem atual
        const index = allChars.findIndex(c => c.name === charData.name);
        if (index > -1) {
            allChars[index] = charData;
            localStorage.setItem('demonSlayerAllChars', JSON.stringify(allChars));
        }

        console.log("Estado salvo com sucesso");
    } catch (e) {
        console.error("Erro ao salvar estado:", e);
    }
};

// Executar inicialização quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();

    // Helper para remover duplicatas de armas iniciais
    function cleanupStarterWeapons() {
        if (!window.charData || !window.charData.inventory) return;

        // Verificar se existe a "Katana (Nichirin)" que o usuário quer MANTER
        const hasSafeNichirin = window.charData.inventory.some(i =>
            i.name && i.name.includes('Katana (Nichirin)')
        );

        // Se tiver a correta, remove a "Nichirin Padrão" e a "Katana" genérica
        if (hasSafeNichirin) {
            const initialCount = window.charData.inventory.length;
            window.charData.inventory = window.charData.inventory.filter(i =>
                i.name !== 'Nichirin Padrão' && i.name !== 'Katana'
            );

            if (window.charData.inventory.length < initialCount) {
                console.log("Limpeza de inventário: Itens redundantes removidos.");
            }
        }
    }

