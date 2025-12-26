
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
    const modal = document.getElementById('itemModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('open');

        // Inject Filter UI if not present
        const content = modal.querySelector('.modal-content');
        if (content && !document.getElementById('itemModalFilters')) {
            // Find insertion point (after search input)
            const searchInput = document.getElementById('itemSearch');

            const filterContainer = document.createElement('div');
            filterContainer.id = 'itemModalFilters';
            filterContainer.style.cssText = 'display:flex; flex-direction:column; gap:10px; margin-bottom:15px;';

            // Level 1: Main Categories
            const mainCats = document.createElement('div');
            mainCats.style.display = 'flex';
            mainCats.style.gap = '5px';
            mainCats.style.flexWrap = 'wrap';
            mainCats.innerHTML = `
                <button class="cat-btn active" onclick="filterModal('all', this)">Todos</button>
                <button class="cat-btn" onclick="filterModal('weapon', this)">Armas</button>
                <button class="cat-btn" onclick="filterModal('armor', this)">Armaduras</button>
                <button class="cat-btn" onclick="filterModal('consumable', this)">Consumíveis</button>
                <button class="cat-btn" onclick="filterModal('adventure', this)">Aventura</button>
            `;

            // Level 2: Sub Categories (Initially Hidden/Dynamic)
            const subCats = document.createElement('div');
            subCats.id = 'itemModalSubFilters';
            subCats.style.display = 'flex';
            subCats.style.gap = '5px';
            subCats.style.flexWrap = 'wrap';
            subCats.innerHTML = ''; // Populated via JS

            // Custom Item Button
            const customBtn = document.createElement('button');
            customBtn.className = 'cat-btn';
            customBtn.style.background = '#d90429';
            customBtn.style.marginLeft = 'auto';
            customBtn.innerHTML = '<i data-lucide="plus-circle" style="width:14px;"></i> Criar Item';
            customBtn.onclick = () => showCustomItemForm();

            // Assemble
            filterContainer.appendChild(mainCats);
            filterContainer.appendChild(subCats);

            // Insert after search
            if (searchInput) {
                searchInput.parentNode.insertBefore(filterContainer, searchInput.nextSibling);
                // Insert custom btn in the header or filter row? Let's put it in filter row for now or valid place.
                // Actually, let's put it in the mainCats row
                mainCats.appendChild(customBtn);
            }
        }

        populateItemModal();
        setTimeout(() => {
            if (window.lucide) window.lucide.createIcons();
        }, 100);
    }
};

window.closeItemModal = function () {
    const modal = document.getElementById('itemModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
        // Reset view to grid in case it was on form
        if (document.getElementById('pickerGrid')) document.getElementById('pickerGrid').style.display = 'grid';
        if (document.getElementById('customItemForm')) document.getElementById('customItemForm').style.display = 'none';
    }
};

window.filterModal = function (type, btn) {
    currentModalFilter = type;

    // Update active class
    if (btn && btn.parentNode) {
        btn.parentNode.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    // Handle Sub-filters
    const subContainer = document.getElementById('itemModalSubFilters');
    if (subContainer) {
        subContainer.innerHTML = '';
        if (type === 'weapon') {
            const subs = [
                { id: 'all', label: 'Todas' },
                { id: 'simple_melee', label: 'Simples C-a-C' },
                { id: 'simple_ranged', label: 'Simples Dist' },
                { id: 'martial_melee', label: 'Marciais C-a-C' },
                { id: 'martial_ranged', label: 'Marciais Dist' },
                { id: 'heavy', label: 'Pesadas' },
                { id: 'unique', label: 'Únicas' },
                { id: 'firearm', label: 'Fogo' }
            ];
            subs.forEach(s => {
                const b = document.createElement('button');
                b.className = 'cat-btn sub-cat-btn';
                if (s.id === 'all') b.classList.add('active');
                b.innerText = s.label;
                b.onclick = (e) => filterSubModal(s.id, e.target);
                subContainer.appendChild(b);
            });
            window.currentSubFilter = 'all';
        } else if (type === 'consumable') {
            const subs = [
                { id: 'all', label: 'Todos' },
                { id: 'ammo', label: 'Munição' }
            ];
            subs.forEach(s => {
                const b = document.createElement('button');
                b.className = 'cat-btn sub-cat-btn';
                if (s.id === 'all') b.classList.add('active');
                b.innerText = s.label;
                b.onclick = (e) => filterSubModal(s.id, e.target);
                subContainer.appendChild(b);
            });
            window.currentSubFilter = 'all';
        } else {
            window.currentSubFilter = null;
        }
    }

    // Hide Custom Form if open
    const grid = document.getElementById('pickerGrid');
    const form = document.getElementById('customItemForm');
    if (grid) grid.style.display = 'grid';
    if (form) form.style.display = 'none';

    populateItemModal();
};

window.filterSubModal = function (subType, btn) {
    window.currentSubFilter = subType;
    if (btn && btn.parentNode) {
        btn.parentNode.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    populateItemModal();
};

window.searchModal = function (query) {
    currentModalSearch = query.toLowerCase();
    populateItemModal();
};

window.showCustomItemForm = function () {
    const grid = document.getElementById('pickerGrid');
    const parent = grid.parentNode;

    // Check if form exists
    let form = document.getElementById('customItemForm');
    if (!form) {
        form = document.createElement('div');
        form.id = 'customItemForm';
        form.style.display = 'none';
        form.style.padding = '10px';
        form.innerHTML = `
            <h3 style="color:white; margin-top:0;">Criar Item Personalizado</h3>
            <div style="display:grid; gap:10px;">
                <input type="text" id="custName" class="ds-input" placeholder="Nome do Item" style="background:#222; border:1px solid #444; color:white; padding:8px;">
                
                <select id="custType" class="ds-input" style="background:#222; border:1px solid #444; color:white; padding:8px;">
                    <option value="weapon">Arma</option>
                    <option value="armor">Armadura</option>
                    <option value="consumable">Consumível</option>
                    <option value="adventure">Item de Aventura</option>
                </select>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <input type="text" id="custDmg" class="ds-input" placeholder="Dano / CA (ex: 1d8)" style="background:#222; border:1px solid #444; color:white; padding:8px;">
                    <input type="text" id="custWeight" class="ds-input" placeholder="Peso (ex: 1.0 kg)" style="background:#222; border:1px solid #444; color:white; padding:8px;">
                </div>

                <input type="text" id="custProps" class="ds-input" placeholder="Propriedades (ex: Leve, Dois Mãos)" style="background:#222; border:1px solid #444; color:white; padding:8px;">
                 <textarea id="custDesc" class="ds-input" placeholder="Descrição" style="background:#222; border:1px solid #444; color:white; padding:8px; min-height:60px;"></textarea>

                <button onclick="saveCustomItem()" style="background:var(--accent-primary); color:white; border:none; padding:10px; cursor:pointer; font-weight:bold; margin-top:10px;">CRIAR E ADICIONAR</button>
            </div>
        `;
        parent.insertBefore(form, grid);
    }

    grid.style.display = 'none';
    form.style.display = 'block';
};

window.saveCustomItem = function () {
    const name = document.getElementById('custName').value;
    const type = document.getElementById('custType').value;
    const stat = document.getElementById('custDmg').value;
    const weight = document.getElementById('custWeight').value;
    const props = document.getElementById('custProps').value;
    const desc = document.getElementById('custDesc').value;

    if (!name) {
        alert("O item precisa de um nome.");
        return;
    }

    const newItem = {
        name,
        type,
        weight: weight || '0 kg',
        props,
        desc,
        isCustom: true
    };

    if (type === 'weapon') newItem.dmg = stat;
    if (type === 'armor') newItem.ac = stat;
    if (type === 'consumable') newItem.dmg = stat; // Consumables might use dmg field for healing roll

    addItemToInventory(newItem);

    // Auto-update Stats
    if (window.updateStatsUI) window.updateStatsUI();

    // Return to grid
    document.getElementById('customItemForm').style.display = 'none';
    document.getElementById('pickerGrid').style.display = 'grid';
    showFlashMessage("Item personalizado criado!");
};

function populateItemModal() {
    const grid = document.getElementById('pickerGrid');
    if (!grid) return;
    grid.innerHTML = '';

    // Combine all items from DB
    const allItems = [
        ...(ITEMS_DB.weapons || []).map(i => ({ ...i, category: 'weapon' })),
        ...(ITEMS_DB.armor || []).map(i => ({ ...i, category: 'armor' })),
        ...(ITEMS_DB.consumables || []).map(i => ({ ...i, category: 'consumable' })),
        ...(ITEMS_DB.adventure || []).map(i => ({ ...i, category: 'adventure' })),
        ...(ITEMS_DB.misc || []).map(i => ({ ...i, category: 'misc' }))
    ];

    // Filter items
    const filtered = allItems.filter(item => {
        // Main Filter
        const matchesMain = currentModalFilter === 'all' || item.category === currentModalFilter;

        // Sub Filter
        let matchesSub = true;
        if (window.currentSubFilter && window.currentSubFilter !== 'all') {
            if (item.subType !== window.currentSubFilter) matchesSub = false;
        }

        // Search Filter
        const matchesSearch = !currentModalSearch ||
            item.name.toLowerCase().includes(currentModalSearch) ||
            (item.props && item.props.toLowerCase().includes(currentModalSearch));

        return matchesMain && matchesSub && matchesSearch;
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
        else if (item.category === 'adventure') icon = '🎒';

        // Stat display
        let statText = '';
        if (item.dmg) statText = item.dmg;
        else if (item.ac) statText = `CA ${item.ac}`;
        else if (item.def_bonus) statText = `+${item.def_bonus} CA`;

        card.innerHTML = `
            <div class="picker-item-icon">${icon}</div>
            <div class="picker-item-name">${item.name}</div>
            ${statText ? `<div class="picker-item-stat">${statText}</div>` : ''}
            <div class="picker-item-desc" style="font-size:0.75rem; color:#888;">${item.subType ? item.subType.replace('_', ' ') : ''}</div>
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

    // Ensure Yen Exists
    if (typeof charData.yen === 'undefined') charData.yen = 0;

    // YEN DISPLAY
    const yenDisplay = document.createElement('div');
    yenDisplay.style.gridColumn = '1 / -1';
    yenDisplay.style.background = 'linear-gradient(90deg, #1a1a2e, #16213e)';
    yenDisplay.style.padding = '10px 20px';
    yenDisplay.style.borderRadius = '8px';
    yenDisplay.style.display = 'flex';
    yenDisplay.style.justifyContent = 'space-between';
    yenDisplay.style.alignItems = 'center';
    yenDisplay.style.marginBottom = '15px';
    yenDisplay.style.border = '1px solid #333';
    yenDisplay.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <i data-lucide="coins" color="#ffd700"></i>
            <span style="font-weight:bold; color:#ffd700; font-family:var(--font-display);">Riqueza</span>
        </div>
        <div style="font-size:1.2rem; font-weight:800; color:#fff;">${charData.yen.toLocaleString()} <span style="font-size:0.8rem; color:#888;">Ienes</span></div>
    `;
    container.appendChild(yenDisplay);

    // Calcular peso total
    let totalWeight = 0;
    const maxWeight = (charData.attributes && charData.attributes.str ? charData.attributes.str : 10) * 15;

    // Valid Types that should appear in inventory
    const VALID_TYPES = ['weapon', 'armor', 'consumable', 'adventure', 'misc'];

    // Filtrar itens
    const filtered = (charData.inventory || []).filter(item => {
        if (!item) return false;

        // Safety Clean: If item has no type or invalid type, hide it (likely a skill/ability that got mixed in)
        if (!VALID_TYPES.includes(item.type)) return false;

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
        const empty = document.createElement('div');
        empty.innerHTML = `
            <div style="text-align:center; padding:3rem; color:#666; grid-column: 1/-1;">
                <i data-lucide="package-x" style="width:48px; height:48px; margin:0 auto 1rem; display:block;"></i>
                <div style="font-size:1.1rem; margin-bottom:0.5rem;">Vazio</div>
                <div style="font-size:0.85rem;">Adicione itens pelo botão acima</div>
            </div>
        `;
        container.appendChild(empty);
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
                ${item.type === 'consumable' ? `
                     <button class="inv-action-btn" style="background:#20bf6b; color:#fff; border:none;" onclick="event.stopPropagation(); useItem(${index})">
                        <i data-lucide="sparkles" style="width:14px;"></i> Usar/Abrir
                    </button>
                ` : `
                    <button class="inv-action-btn ${item.equipped ? 'equipped' : ''}" onclick="event.stopPropagation(); toggleEquip(${index})">
                        <i data-lucide="${item.equipped ? 'x-circle' : 'check-circle'}" style="width:14px;"></i>
                        ${item.equipped ? 'Desequipar' : 'Equipar'}
                    </button>
                `}
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

// === FUNÇÃO DE USO DE ITENS (CONSUMÍVEIS) ===
window.useItem = function (index) {
    const item = charData.inventory[index];
    if (!item) return;

    // 1. Check for SPECIAL Effect Properties (Money)
    // We expect money bags to have something like "3d6 x 1000" in name or props, or a special 'effect' tag.
    // Let's rely on 'effect_money' prop or regex on name/desc/props if we can't be strict.
    // The user will add "Bolsa de Ienes" etc.

    // Pattern Match for Money: "3d6 x 1000" or similar
    // We will look for a custom property `money_roll` if set, or parse from Props/Desc

    const moneyMatch = (item.props || '').match(/(\d+d\d+)\s*[xX*]\s*(\d+)/);

    if (moneyMatch || item.name.toLowerCase().includes('ienes') || item.money_roll) {
        const formula = item.money_roll || (moneyMatch ? moneyMatch[1] : null);
        const mult = item.money_mult || (moneyMatch ? parseInt(moneyMatch[2]) : 1);

        if (formula) {
            // Dice Roll
            // We can use the parseAndRoll from dashboard.js if available, or simple regex here.
            // Let's do simple regex here to be safe and independent.
            const rollParts = formula.match(/(\d+)d(\d+)/);
            let total = 0;
            if (rollParts) {
                const count = parseInt(rollParts[1]);
                const sides = parseInt(rollParts[2]);
                for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
            } else {
                total = parseInt(formula) || 0;
            }

            const finalValue = total * mult;

            if (confirm(`Abrir ${item.name}?\nVocê obteve: ${finalValue.toLocaleString()} Ienes!`)) {
                // Add Money
                charData.yen = (charData.yen || 0) + finalValue;

                // Remove Item
                charData.inventory.splice(index, 1);

                // Save & Render
                if (typeof saveState === 'function') saveState(); // This calls saveHuman usually
                else if (typeof saveHuman === 'function') saveHuman();

                renderInventory();
                showFlashMessage(`+${finalValue} Ienes`);
            }
        }
        else if (item.value) {
            // Fixed value
            const val = parseInt(String(item.value).replace(/\D/g, ''));
            if (val) {
                if (confirm(`Usar ${item.name} para obter ${val} Ienes?`)) {
                    charData.yen = (charData.yen || 0) + val;
                    charData.inventory.splice(index, 1);
                    if (typeof saveHuman === 'function') saveHuman();
                    renderInventory();
                    showFlashMessage(`+${val} Ienes`);
                }
            }
        }
        else {
            alert("Este item parece valioso, mas não consegui determinar o valor exato.");
        }
        return;
    }

    // Generic Consumable (Healing etc)
    // Check for "Cura" or dice in Desc
    if (item.name.includes("Poção") || (item.desc && item.desc.includes("cura"))) {
        // Simple generic healing logic
        const healMatch = (item.dmg || item.props || '').match(/(\d+)d(\d+)(\+(\d+))?/);
        if (healMatch) {
            const count = parseInt(healMatch[1]);
            const sides = parseInt(healMatch[2]);
            const bonus = healMatch[4] ? parseInt(healMatch[4]) : 0;

            let heal = bonus;
            for (let i = 0; i < count; i++) heal += Math.floor(Math.random() * sides) + 1;

            if (confirm(`Beber ${item.name}?\nCura estimada: ${heal} PV`)) {
                // Heal
                if (typeof changeHP === 'function') changeHP(heal);

                // Remove
                charData.inventory.splice(index, 1);
                if (typeof saveHuman === 'function') saveHuman();
                renderInventory();
                showFlashMessage(`Curado: +${heal} PV`);
            }
            return;
        }
    }

    alert(`Você usa ${item.name}. (Funcionalidade genérica - O item foi consumido)`);
    charData.inventory.splice(index, 1);
    if (typeof saveHuman === 'function') saveHuman();
    renderInventory();
}
