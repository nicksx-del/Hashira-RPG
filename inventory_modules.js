
// ============================================
// MODULO DE INVENTÁRIO (Separado para garantir funcionamento)
// ============================================

// Variaveis Globais do Inventario
let invFilter = 'all';
let invSearchQuery = '';
let selectedItemIndex = null;
let currentModalFilter = 'all';
let currentModalSearch = '';

// Garante que charData existe se dashboard.js falhar
if (typeof charData === 'undefined') {
    console.warn("charData não encontrado, inicializando fallback.");
    window.charData = {
        inventory: [],
        attributes: { str: 10 }
    };
}

// === FUNÇÕES DO MODAL DE ADICIONAR ITEM ===

window.openItemModal = function () {
    console.log('openItemModal called');
    const modal = document.getElementById('itemModal');
    console.log('Modal element:', modal);

    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('open');
        populateItemModal();
        setTimeout(() => {
            if (window.lucide) window.lucide.createIcons();
        }, 100);
    } else {
        console.error("Modal 'itemModal' não encontrado no DOM.");
        alert("Erro: Modal de itens não encontrado. Verifique o HTML.");
    }
};

window.closeItemModal = function () {
    const modal = document.getElementById('itemModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
    }
};

window.filterModal = function (type, btn) {
    currentModalFilter = type;

    // Update button states
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    populateItemModal();
};

window.searchModal = function (query) {
    currentModalSearch = query.toLowerCase();
    populateItemModal();
};

function populateItemModal() {
    const grid = document.getElementById('pickerGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // Combine all items from DB
    const allItems = [
        ...ITEMS_DB.weapons.map(i => ({ ...i, category: 'weapon' })),
        ...ITEMS_DB.armor.map(i => ({ ...i, category: 'armor' }))
    ];

    // Add consumables and misc if they exist
    if (ITEMS_DB.consumables) {
        allItems.push(...ITEMS_DB.consumables.map(i => ({ ...i, category: 'consumable' })));
    }
    if (ITEMS_DB.misc) {
        allItems.push(...ITEMS_DB.misc.map(i => ({ ...i, category: 'misc' })));
    }

    // Filter items
    const filtered = allItems.filter(item => {
        const matchesFilter = currentModalFilter === 'all' || item.category === currentModalFilter;
        const matchesSearch = !currentModalSearch ||
            item.name.toLowerCase().includes(currentModalSearch) ||
            (item.props && item.props.toLowerCase().includes(currentModalSearch));
        return matchesFilter && matchesSearch;
    });

    // Render items
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'picker-item-card';
        card.onclick = () => addItemToInventory(item);

        // Icon based on type
        let icon = '📦';
        if (item.category === 'weapon') icon = '⚔️';
        else if (item.category === 'armor') icon = '🛡️';
        else if (item.category === 'consumable') icon = '🧪';

        // Stat display
        let statText = '';
        if (item.dmg) statText = item.dmg;
        else if (item.ac) statText = `CA ${item.ac}`;
        else if (item.def_bonus) statText = `+${item.def_bonus} CA`;

        card.innerHTML = `
            <div class="picker-item-icon">${icon}</div>
            <div class="picker-item-name">${item.name}</div>
            ${statText ? `<div class="picker-item-stat">${statText}</div>` : ''}
            ${item.props ? `<div class="picker-item-desc">${item.props}</div>` : ''}
        `;

        grid.appendChild(card);
    });

    // Empty state
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:3rem; color:#666;">
                <i data-lucide="search-x" style="width:48px; height:48px; margin:0 auto 1rem;"></i>
                <div>Nenhum item encontrado</div>
            </div>
        `;
    }

    if (window.lucide) window.lucide.createIcons();
}

function addItemToInventory(item) {
    const newItem = JSON.parse(JSON.stringify(item));
    newItem.equipped = false;
    delete newItem.category; // Remove temporary category field

    if (!charData.inventory) charData.inventory = [];
    charData.inventory.push(newItem);

    if (typeof saveState === 'function') saveState();
    renderInventory();

    // Visual feedback
    showFlashMessage(`✓ ${item.name} adicionado!`);

    // Opcional: Fechar modal após adicionar? Não, usuário pode querer adicionar mais.
}

function showFlashMessage(msg) {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--accent-cyan);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: bold;
        z-index: 3000;
        animation: fadeOut 1s forwards;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
    `;
    flash.textContent = msg;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 1000);
}

// === RENDERIZAÇÃO DO INVENTÁRIO ===

window.renderInventory = function () {
    const container = document.getElementById('inventoryGrid');
    if (!container) return;

    container.innerHTML = '';

    // Calcular peso total
    let totalWeight = 0;
    const maxWeight = (charData.attributes && charData.attributes.str ? charData.attributes.str : 10) * 15;

    // Filtrar itens
    const filtered = (charData.inventory || []).filter(item => {
        if (!item) return false;

        // Filtro de categoria do inventário principal
        const matchesFilter = invFilter === 'all' || item.type === invFilter;

        // Filtro de busca do inventário principal
        const matchesSearch = !invSearchQuery ||
            item.name.toLowerCase().includes(invSearchQuery.toLowerCase()) ||
            (item.props && item.props.toLowerCase().includes(invSearchQuery.toLowerCase()));

        return matchesFilter && matchesSearch;
    });

    // Renderizar itens
    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem; color:#666; grid-column: 1/-1;">
                <i data-lucide="package-x" style="width:48px; height:48px; margin:0 auto 1rem; display:block;"></i>
                <div style="font-size:1.1rem; margin-bottom:0.5rem;">Vazio</div>
                <div style="font-size:0.85rem;">Adicione itens pelo botão acima</div>
            </div>
        `;
    } else {
        filtered.forEach((item, idx) => {
            // Find real index in main array to ensure actions target correct item
            const realIndex = charData.inventory.indexOf(item);

            const weight = parseFloat(String(item.weight || '0').replace(/[^\d.]/g, '')) || 0;
            totalWeight += weight;

            const card = createInventoryCard(item, realIndex);
            container.appendChild(card);
        });
    }

    // Atualizar capacidade
    updateCapacity(totalWeight, maxWeight);

    // Atualizar paper doll logic se existir
    if (typeof updatePaperDoll === 'function') updatePaperDoll();

    // Reinicializar ícones
    if (window.lucide) window.lucide.createIcons();
};

function createInventoryCard(item, index) {
    const card = document.createElement('div');
    card.className = 'inv-item-card';
    if (item.equipped) card.classList.add('equipped');
    if (selectedItemIndex === index) card.classList.add('selected');

    // Ícone baseado no tipo
    let icon = 'box';
    if (item.type === 'weapon') icon = 'sword';
    else if (item.type === 'armor') icon = 'shield';
    else if (item.type === 'consumable') icon = 'flask-conical';

    // Estatística principal
    let mainStat = '';
    if (item.dmg) mainStat = item.dmg;
    else if (item.ac) mainStat = `CA ${item.ac}`;
    else if (item.def_bonus) mainStat = `+${item.def_bonus} CA`;

    card.innerHTML = `
        <div class="inv-header" onclick="selectItem(${index})">
            <div style="display:flex; align-items:center; gap:10px; flex:1;">
                <div class="inv-row-icon">
                    <i data-lucide="${icon}" style="width:20px;"></i>
                </div>
                <div style="flex:1;">
                    <div class="inv-name" style="${item.equipped ? 'color:var(--accent-cyan); font-weight:bold;' : ''}">${item.name}</div>
                    <div class="inv-mini-stat">${mainStat || 'Item'} • ${item.weight || '0 kg'}</div>
                </div>
            </div>
            <div class="inv-tags">
                ${item.equipped ? '<span class="inv-tag tag-rare">EQUIPADO</span>' : ''}
            </div>
        </div>
        <div class="inv-details" id="inv-det-${index}">
            <div style="margin-bottom:10px; color:#aaa; font-style:italic;">${item.props || 'Sem propriedades'}</div>
            <div style="margin-bottom:15px; color:#ccc;">${item.desc || 'Sem descrição'}</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                ${item.type !== 'consumable' ? `
                    <button class="inv-action-btn ${item.equipped ? 'equipped' : ''}" onclick="event.stopPropagation(); toggleEquip(${index})">
                        <i data-lucide="${item.equipped ? 'x-circle' : 'check-circle'}" style="width:14px;"></i>
                        ${item.equipped ? 'Desequipar' : 'Equipar'}
                    </button>
                ` : ''}
                <button class="inv-action-btn" onclick="event.stopPropagation(); editItem(${index})">
                    <i data-lucide="pencil" style="width:14px;"></i> Editar
                </button>
                <button class="inv-action-btn danger" onclick="event.stopPropagation(); removeInvItem(${index})">
                    <i data-lucide="trash-2" style="width:14px;"></i> Remover
                </button>
            </div>
        </div>
    `;

    return card;
}

window.selectItem = function (index) {
    const details = document.getElementById(`inv-det-${index}`);
    if (details) {
        // Close others? Optional.
        // document.querySelectorAll('.inv-details').forEach(d => d.classList.remove('expanded'));
        details.classList.toggle('expanded');
    }

    selectedItemIndex = selectedItemIndex === index ? null : index;
    showItemDetails(index);
};

function showItemDetails(index) {
    const item = charData.inventory[index];
    if (!item) return;

    const container = document.getElementById('itemDetailContainer');
    const emptyState = document.getElementById('itemDetailEmpty');

    if (!container || !emptyState) return;

    emptyState.style.display = 'none';
    container.style.display = 'flex';

    let icon = '📦';
    if (item.type === 'weapon') icon = '⚔️';
    else if (item.type === 'armor') icon = '🛡️';
    else if (item.type === 'consumable') icon = '🧪';

    container.innerHTML = `
        <div style="text-align:center; padding:2rem; border-bottom:1px solid #222;">
            <div style="font-size:3rem; margin-bottom:1rem;">${icon}</div>
            <h3 style="margin:0 0 0.5rem 0; font-family:var(--font-display); color:white;">${item.name}</h3>
            <div style="color:var(--accent-cyan); font-weight:bold; font-size:1.1rem;">
                ${item.dmg || item.ac || (item.def_bonus ? `+${item.def_bonus} CA` : 'Item')}
            </div>
        </div>
        <div style="padding:1.5rem; flex:1; overflow-y:auto;">
            <div style="margin-bottom:1rem;">
                <div style="font-size:0.7rem; color:#666; text-transform:uppercase; margin-bottom:0.5rem;">Propriedades</div>
                <div style="color:#ccc;">${item.props || 'Nenhuma'}</div>
            </div>
            <div style="margin-bottom:1rem;">
                <div style="font-size:0.7rem; color:#666; text-transform:uppercase; margin-bottom:0.5rem;">Descrição</div>
                <div style="color:#ccc; line-height:1.5;">${item.desc || 'Sem descrição'}</div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1.5rem;">
                <div>
                    <div style="font-size:0.7rem; color:#666;">Peso</div>
                    <div style="color:white; font-weight:bold;">${item.weight || '0 kg'}</div>
                </div>
                <div>
                    <div style="font-size:0.7rem; color:#666;">Preço</div>
                    <div style="color:white; font-weight:bold;">${item.price || 'N/A'}</div>
                </div>
            </div>
        </div>
    `;
}

window.toggleEquip = function (index) {
    const item = charData.inventory[index];
    if (!item) return;

    if (!item.equipped && item.type === 'weapon') {
        charData.inventory.forEach((i, idx) => {
            if (i && i.type === 'weapon' && i.equipped && idx !== index) {
                i.equipped = false;
            }
        });
    }

    item.equipped = !item.equipped;

    if (typeof saveState === 'function') saveState();
    renderInventory();
    if (typeof calcDefense === 'function') calcDefense();
};

window.removeInvItem = function (index) {
    const item = charData.inventory[index];
    if (!item) return;

    if (confirm(`Remover "${item.name}" do inventário?`)) {
        charData.inventory.splice(index, 1);
        selectedItemIndex = null;

        const container = document.getElementById('itemDetailContainer');
        const emptyState = document.getElementById('itemDetailEmpty');
        if (container && emptyState) {
            container.style.display = 'none';
            emptyState.style.display = 'flex';
        }

        if (typeof saveState === 'function') saveState();
        renderInventory();
        if (typeof calcDefense === 'function') calcDefense();
    }
};

window.editItem = function (index) {
    const item = charData.inventory[index];
    if (!item) return;

    const newName = prompt('Nome do item:', item.name);
    if (newName === null) return;
    if (newName.trim()) item.name = newName.trim();

    const newWeight = prompt('Peso (ex: 1.5 kg):', item.weight || '0 kg');
    if (newWeight !== null && newWeight.trim()) item.weight = newWeight.trim();

    if (typeof saveState === 'function') saveState();
    renderInventory();
};

window.setFilter = function (filter, btn) {
    invFilter = filter;
    document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderInventory();
};

window.filterInventory = function (query) {
    invSearchQuery = query;
    renderInventory();
};

function updateCapacity(current, max) {
    const textEl = document.getElementById('capacityText');
    const barEl = document.getElementById('capacityBar');

    if (textEl) {
        textEl.textContent = `${current.toFixed(1)} / ${max} kg`;
        textEl.style.color = current > max ? 'var(--accent-red)' : '#666';
    }

    if (barEl) {
        const percent = Math.min((current / max) * 100, 100);
        barEl.style.width = percent + '%';

        if (percent > 90) barEl.style.background = 'linear-gradient(90deg, #d90429, #ef233c)';
        else if (percent > 70) barEl.style.background = 'linear-gradient(90deg, #ffaa00, #ff8800)';
        else barEl.style.background = 'linear-gradient(90deg, #555, #888)';
    }
}
