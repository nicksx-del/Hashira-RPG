
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
if (typeof window.charData === 'undefined') {
    // console.warn("charData não encontrado, inicializando fallback.");
    window.charData = {
        inventory: [],
        attributes: { str: 10 }
    };
}

// === FUNÇÕES DO MODAL DE ADICIONAR ITEM ===

window.openItemModal = function () {
    const modal = document.getElementById('itemModal');
    if (modal) {
        // RESET STATE for clean open
        window.pendingBundleIndex = null;
        window.bundleActiveFilter = null;
        currentModalFilter = 'all';
        currentModalSearch = '';

        // Reset Search Input if exists
        const searchInput = document.getElementById('itemSearch');
        if (searchInput) searchInput.value = '';

        // Reset Title
        const title = modal.querySelector('h2');
        if (title) title.innerText = "Adicionar Item";

        modal.style.display = 'flex';
        modal.classList.add('open');

        // Inject Filter UI if not present
        const content = modal.querySelector('.modal-content');
        if (content && !document.getElementById('itemModalFilters')) {
            // Find insertion point (after search input)
            const searchInputEl = document.getElementById('itemSearch');

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
            if (searchInputEl) {
                searchInputEl.parentNode.insertBefore(filterContainer, searchInputEl.nextSibling);
                mainCats.appendChild(customBtn);
            }
        }

        // Trigger generic filter update to set classes and populate
        filterModal('all');

        setTimeout(() => {
            if (window.lucide) window.lucide.createIcons();
        }, 100);
    }
};

// Removed duplicate closeItemModal (it is defined at end of file)

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

            // LINK TO FORGE
            const forgeBtn = document.createElement('button');
            forgeBtn.className = 'cat-btn sub-cat-btn';
            forgeBtn.style.background = 'rgba(255, 215, 0, 0.2)';
            forgeBtn.style.border = '1px solid #ffd700';
            forgeBtn.style.color = '#ffd700';
            forgeBtn.style.fontWeight = 'bold';
            forgeBtn.style.marginLeft = 'auto'; // Push to right
            forgeBtn.innerHTML = '<i data-lucide="hammer" style="width:14px;"></i> Forjar';
            forgeBtn.onclick = () => {
                // Close Item Modal
                const m = document.getElementById('itemModal');
                if (m) {
                    m.classList.remove('open');
                    setTimeout(() => m.style.display = 'none', 300);
                }
                // Navigate
                if (window.showSection) showSection('forge');
            };
            subContainer.appendChild(forgeBtn);

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

        // BUNDLE SPECIFIC FILTER
        let matchesBundle = true;
        if (window.bundleActiveFilter) {
            if (window.bundleActiveFilter === 'simple') {
                if (!item.subType || !item.subType.includes('simple')) matchesBundle = false;
            } else if (window.bundleActiveFilter === 'martial') {
                // Allows martial and unique usually? Or just martial.
                // "Arma Marcial ou Única"
                if (!item.subType || (!item.subType.includes('martial') && !item.subType.includes('unique'))) matchesBundle = false;
            } else if (window.bundleActiveFilter === 'heavy') {
                if (!item.subType || !item.subType.includes('heavy')) matchesBundle = false;
            } else if (window.bundleActiveFilter === 'light_medium') {
                // For Armor. Subtypes: 'light', 'medium', 'heavy'
                if (!item.subType || (!item.subType.includes('light') && !item.subType.includes('medium'))) matchesBundle = false;
            }
        }

        return matchesMain && matchesSub && matchesSearch && matchesBundle;
    });

    // Render items
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'picker-item-card';
        card.onclick = () => window.handleItemSelect(item);

        // Icon based on type
        let icon = window.getItemEmoji(item.name, item.category);

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

// NEW: Inventory Status Update logic
window.updateInventoryStatus = function () {
    // Wealth
    const wealthEl = document.getElementById('invWealth');
    if (wealthEl) {
        // Format with thousand separators (e.g. 200.000)
        let money = charData.money || 0;
        let formatted = money.toLocaleString('pt-BR');
        wealthEl.innerHTML = `<i data-lucide="coins" style="width:16px; height:16px;"></i> <span>${formatted} Ienes</span>`;
    }

    // Ores
    const oresEl = document.getElementById('invOres');
    if (oresEl) {
        let ores = charData.ores || 0;
        oresEl.innerHTML = `<i data-lucide="mountain" style="width:16px; height:16px;"></i> <span>${ores} Minérios</span>`;
    }

    // Weight
    const weightEl = document.getElementById('invWeight');
    if (weightEl) {
        let totalWeight = 0;
        if (charData.inventory) {
            charData.inventory.forEach(item => {
                totalWeight += parseFloat(item.weight) || 0;
            });
        }

        let str = (charData.attributes ? charData.attributes.str : 10);
        let maxWeight = str * 15; // D&D rule or custom

        // Check overload
        let isOver = totalWeight > maxWeight;
        let color = isOver ? '#ff595e' : '#aaa';
        let iconColor = isOver ? '#ff595e' : 'currentColor';
        let alertIcon = isOver ? '<i data-lucide="alert-triangle" style="width:14px; margin-left:5px;"></i>' : '';

        weightEl.style.color = color;
        weightEl.innerHTML = `
            <i data-lucide="weight" style="width:16px; height:16px; color:${iconColor}"></i>
            <span>${totalWeight.toFixed(1)} / ${maxWeight} kg</span>
            ${alertIcon}
        `;
    }

    if (window.lucide) window.lucide.createIcons();
};

window.editResource = function (type) {
    let currentVal = type === 'money' ? (charData.money || 0) : (charData.ores || 0);
    let label = type === 'money' ? 'Ienes' : 'Minérios';

    let input = prompt(`Editar ${label}\nAtual: ${currentVal}\n\nDigite o novo valor total ("500")\nOU use + / - para somar/subtrair ("+100", "-50"):`);

    if (input === null) return; // Cancelled
    input = input.trim();
    if (input === "") return;

    let finalVal = currentVal;

    // Check for relative operator
    if (input.startsWith('+') || input.startsWith('-')) {
        let delta = parseInt(input);
        if (!isNaN(delta)) {
            finalVal += delta;
        }
    } else {
        // Absolute value
        let val = parseInt(input);
        if (!isNaN(val)) {
            finalVal = val;
        }
    }

    // Safety check
    if (finalVal < 0) finalVal = 0;

    // Apply
    if (type === 'money') charData.money = finalVal;
    else charData.ores = finalVal;

    // Save & Render
    if (typeof saveHuman === 'function') saveHuman();
    if (typeof updateInventoryStatus === 'function') updateInventoryStatus();

    // Also re-render forge if visible (to update costs)
    const forgeSec = document.getElementById('forge');
    if (forgeSec && forgeSec.classList.contains('active-tab') && typeof renderForge === 'function') {
        renderForge();
    }

    const diff = finalVal - currentVal;
    if (diff !== 0) {
        let op = diff > 0 ? '+' : '';
        showToast(`${label} atualizado: ${op}${diff}`, 'success');
    }
};

window.renderInventory = function () {
    const grid = document.getElementById('inventoryGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // Trigger Status Update
    if (typeof updateInventoryStatus === 'function') updateInventoryStatus();

    let totalWeight = 0; // Keeping local calc for capacity UI if still used elsewhere
    const maxWeight = (charData.attributes.str || 10) * 15;

    const VALID_INV_TYPES = ['weapon', 'armor', 'consumable', 'adventure', 'misc'];

    charData.inventory.forEach((item, index) => {
        // Strict Type Check (Prevent Skills/Features in Inventory View)
        let isBundle = item.type && item.type.startsWith('bundle');
        if (!VALID_INV_TYPES.includes(item.type) && !isBundle) return;

        // Weight Calc
        const w = parseFloat(item.weight) || 0;
        totalWeight += w;

        // Filtering
        if (invFilter !== 'all') {
            if (item.type !== invFilter && !item.type.includes(invFilter)) return;
        }

        if (invSearchQuery) {
            if (!item.name.toLowerCase().includes(invSearchQuery.toLowerCase()) &&
                !(item.props && item.props.toLowerCase().includes(invSearchQuery.toLowerCase()))) return;
        }

        const card = createInventoryCard(item, index);
        grid.appendChild(card);
    });

    // Update Capacity UI (Old Sidebar one, keeping for compatibility)
    if (typeof updateCapacity === 'function') updateCapacity(totalWeight, maxWeight);

    // Initial Empty State
    if (charData.inventory.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:2rem; color:#444;">
                <i data-lucide="ghost" style="width:32px; height:32px; opacity:0.5; margin-bottom:10px;"></i>
                <div>Inventário Vazio</div>
            </div>
        `;
    }

    if (window.lucide) window.lucide.createIcons();
};

window.addItemToInventory = function (item) {
    try {
        if (!item) return;

        // Clone item to avoid reference issues
        const newItem = JSON.parse(JSON.stringify(item));

        // Add default icon if missing
        if (!newItem.icon) {
            if (newItem.type === 'weapon') newItem.icon = 'sword';
            else if (newItem.type === 'armor') newItem.icon = 'shield';
            else if (newItem.type === 'consumable') newItem.icon = 'flask-conical';
            else newItem.icon = 'box';
        }

        charData.inventory.push(newItem);

        // Save
        if (typeof saveState === 'function') saveState();
        else if (typeof saveHuman === 'function') saveHuman();

        // Flash Message
        if (typeof showFlashMessage === 'function') {
            showFlashMessage("Adicionado: " + newItem.name);
        } else {
            // console.log("Adicionado:", newItem.name);
        }

        // Update UI
        if (typeof renderInventory === 'function') {
            renderInventory();
        } else {
            console.warn("renderInventory function not found!");
            alert("Item adicionado, mas a tela não atualizou (renderInventory missing). Recarregue a página.");
        }

        // Recalc Stats if needed
        if (typeof window.syncCombatValues === 'function') window.syncCombatValues();
        else if (typeof calcDefense === 'function') calcDefense();

    } catch (err) {
        console.error("Erro ao adicionar item:", err);
        alert("Erro ao adicionar item: " + err.message);
    }
};

window.createInventoryCard = function (item, index) {
    const card = document.createElement('div');
    card.className = 'inv-item-card';
    if (item.equipped) card.classList.add('equipped');
    if (selectedItemIndex === index) card.classList.add('selected');

    // Custom Color Handling
    if (item.color) {
        card.style.borderLeft = `3px solid ${item.color}`;
        card.style.background = `linear-gradient(90deg, ${item.color}22, rgba(20,20,25,0.8))`;
    }

    // Contextual Emoji
    let emoji = window.getItemEmoji(item.name, item.type);
    if (item.type && item.type.includes('bundle')) emoji = '🎁';

    // Estatística principal
    let mainStat = '';
    if (item.dmg) mainStat = item.dmg;
    else if (item.ac) mainStat = `CA ${item.ac}`;
    else if (item.def_bonus) mainStat = `+${item.def_bonus} CA`;

    // Action Button Logic
    let actionBtn = '';
    if (item.type === 'consumable') {
        actionBtn = `
            <button class="inv-action-btn" style="background:#20bf6b; color:#fff; border:none;" onclick="event.stopPropagation(); useItem(${index})">
                <i data-lucide="sparkles" style="width:14px;"></i> Usar/Abrir
            </button>
        `;
    } else if (item.type && item.type.includes('bundle')) {
        actionBtn = `
            <button class="inv-action-btn" style="background:#d90429; color:#fff; border:none;" onclick="event.stopPropagation(); openBundleSelection(${index})">
                <i data-lucide="gift" style="width:14px;"></i> Abrir
            </button>
        `;
    } else {
        actionBtn = `
            <button class="inv-action-btn ${item.equipped ? 'equipped' : ''}" onclick="event.stopPropagation(); toggleEquip(${index})">
                <i data-lucide="${item.equipped ? 'x-circle' : 'check-circle'}" style="width:14px;"></i>
                ${item.equipped ? 'Desequipar' : 'Equipar'}
            </button>
        `;
    }

    card.innerHTML = `
        <div class="inv-header" onclick="selectItem(${index})">
            <div style="display:flex; align-items:center; gap:10px; flex:1;">
                <div class="inv-row-icon" style="font-size:1.4rem; padding:0; display:flex; align-items:center; justify-content:center;">
                   ${emoji}
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
                ${actionBtn}
                <button class="inv-action-btn" onclick="event.stopPropagation(); editItem(${index})">
                    <i data-lucide="pencil" style="width:14px;"></i> Editar
                </button>                <button class="inv-action-btn danger" onclick="event.stopPropagation(); removeInvItem(${index})">
                    <i data-lucide="trash-2" style="width:14px;"></i> Remover
                </button>
            </div>
        </div>
    `;

    return card;
};

window.selectItem = function (index) {
    // MOBILE DRAWER LOGIC
    if (window.innerWidth < 768) {
        const item = charData.inventory[index];
        if (!item) return;

        const drawerContent = document.getElementById('drawerContent');
        if (drawerContent) {
            let icon = window.getItemEmoji(item.name, item.type);

            // Action Buttons
            let actions = '';
            if (item.type === 'consumable') {
                actions = `<button onclick="useItem(${index}); closeDetailDrawer()" style="flex:1; background:#20bf6b; color:#fff; border:none; padding:12px; border-radius:6px; font-weight:bold;">USAR</button>`;
            } else if (item.type && item.type.includes('bundle')) {
                actions = `<button onclick="openBundleSelection(${index}); closeDetailDrawer()" style="flex:1; background:#d90429; color:#fff; border:none; padding:12px; border-radius:6px; font-weight:bold;">ABRIR</button>`;
            } else {
                actions = `<button onclick="toggleEquip(${index}); closeDetailDrawer()" style="flex:1; background:${item.equipped ? '#333' : 'var(--accent-primary)'}; color:#fff; border:none; padding:12px; border-radius:6px; font-weight:bold;">${item.equipped ? 'DESEQUIPAR' : 'EQUIPAR'}</button>`;
            }

            drawerContent.innerHTML = `
                <div style="text-align:center; margin-bottom:15px;">
                    <div style="font-size:3rem;">${icon}</div>
                    <h3 style="color:white; margin:5px 0;">${item.name}</h3>
                    <div style="color:#888; font-size:0.9rem;">${item.type} • ${item.weight || '0kg'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; margin-bottom:15px;">
                    <div style="color:#ccc; font-style:italic; margin-bottom:5px;">${item.props || 'Sem propriedades'}</div>
                    <div style="color:#aaa;">${item.desc || 'Sem descrição'}</div>
                </div>
                <div style="display:flex; gap:10px;">
                    ${actions}
                    <button onclick="editItem(${index}); closeDetailDrawer()" style="background:#333; color:#ccc; border:none; padding:12px; border-radius:6px;"><i data-lucide="pencil" style="width:16px;"></i></button>
                    <button onclick="removeInvItem(${index}); closeDetailDrawer()" style="background:#333; color:#ef4444; border:none; padding:12px; border-radius:6px;"><i data-lucide="trash-2" style="width:16px;"></i></button>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
        }

        if (typeof openDetailDrawer === 'function') openDetailDrawer();
        return;
    }

    // DESKTOP LOGIC (Existing)
    const details = document.getElementById(`inv-det-${index}`);
    if (details) details.classList.toggle('expanded');
    selectedItemIndex = selectedItemIndex === index ? null : index;
    showItemDetails(index);
};

window.toggleEquip = function (index) {
    const item = charData.inventory[index];
    if (!item) return;

    item.equipped = !item.equipped;

    if (typeof saveState === 'function') saveState();
    renderInventory();
    if (window.innerWidth < 768 && typeof closeDetailDrawer === 'function') closeDetailDrawer();
    if (typeof window.syncCombatValues === 'function') window.syncCombatValues();
    else if (typeof calcDefense === 'function') calcDefense();
};

function showItemDetails(index) {
    const item = charData.inventory[index];
    if (!item) return;

    const container = document.getElementById('itemDetailContainer');
    const emptyState = document.getElementById('itemDetailEmpty');

    if (!container || !emptyState) return;

    emptyState.style.display = 'none';
    container.style.display = 'flex';

    let icon = window.getItemEmoji(item.name, item.type);

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

// === BUNDLE SYSTEM ===
window.pendingBundleIndex = null;
window.bundleActiveFilter = null; // New global for strict filtering

window.openBundleSelection = function (index) {
    const item = charData.inventory[index];
    if (!item) return;

    window.pendingBundleIndex = index;
    window.bundleActiveFilter = null;

    if (item.props && item.props.includes('filter:simple')) window.bundleActiveFilter = 'simple';
    else if (item.props && item.props.includes('filter:martial')) window.bundleActiveFilter = 'martial';
    else if (item.props && item.props.includes('filter:heavy')) window.bundleActiveFilter = 'heavy';
    else if (item.props && item.props.includes('filter:light_medium')) window.bundleActiveFilter = 'light_medium';

    // Open Modal
    const modal = document.getElementById('itemModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('open');

        // Hide Filter Buttons usually? Or pre-select?
        if (item.type === 'bundle_weapon') window.filterModal('weapon');
        else if (item.type === 'bundle_armor') window.filterModal('armor');

        // Update Title
        const title = modal.querySelector('h2');
        if (title) title.innerText = `Selecione: ${item.name.replace('Escolha: ', '')}`;

        showFlashMessage("Escolha um item da lista");
    }
};

window.handleItemSelect = function (item) {
    try {
        if (window.pendingBundleIndex !== null) {
            const bundleIndex = window.pendingBundleIndex;

            if (confirm(`Escolher ${item.name}?`)) {
                // Remove bundle
                charData.inventory.splice(bundleIndex, 1);
                // Add new item
                window.addItemToInventory(item);

                // Reset
                window.pendingBundleIndex = null;
                window.bundleActiveFilter = null;
                window.closeItemModal();

                // Reset Title
                const title = document.querySelector('#itemModal h2');
                if (title) title.innerText = "Adicionar Item";
            }
        } else {
            window.addItemToInventory(item);
        }
    } catch (err) {
        console.error("Erro no handleItemSelect:", err);
        alert("Erro ao selecionar item: " + err.message);
    }
};

window.closeItemModal = function () {
    const modal = document.getElementById('itemModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
        // Reset bundle state if closed without selection
        window.pendingBundleIndex = null;
        window.bundleActiveFilter = null;
        const title = modal.querySelector('h2');
        if (title) title.innerText = "Adicionar Item"; // fallback reset

        if (document.getElementById('pickerGrid')) document.getElementById('pickerGrid').style.display = 'grid';
        if (document.getElementById('customItemForm')) document.getElementById('customItemForm').style.display = 'none';
    }
};

// Replaces standard onclick
// We need to inject this into populateItemModal loop
// Line 290 changed from `addItemToInventory(item)` to `handleItemSelect(item)`

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
        if (typeof saveState === 'function') saveState();
        renderInventory();
        if (typeof window.syncCombatValues === 'function') window.syncCombatValues();
        else if (typeof calcDefense === 'function') calcDefense();
    }
};

window.editItem = function (index) {
    const item = charData.inventory[index];
    if (!item) return;
    showEditItemModal(index);
};

// === EDIT ITEM MODAL (Color & Details) ===
window.editingItemIndex = null;

window.showEditItemModal = function (index) {
    window.editingItemIndex = index;
    const item = charData.inventory[index];

    let modal = document.getElementById('editItemModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editItemModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="border:1px solid #444; max-width:400px;">
                <h2 style="color:var(--accent-primary); border-bottom:1px solid #333; padding-bottom:10px;">Editar Item</h2>
                <div style="display:flex; flex-direction:column; gap:15px; padding:10px 0;">
                    
                    <div>
                        <label style="color:#888; font-size:0.8rem;">Nome</label>
                        <input type="text" id="editItemName" class="ds-input" style="width:100%; background:#222; border:1px solid #444; color:white; padding:8px;">
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <label style="color:#888; font-size:0.8rem;">Peso</label>
                            <input type="text" id="editItemWeight" class="ds-input" style="width:100%; background:#222; border:1px solid #444; color:white; padding:8px;">
                        </div>
                        <div>
                             <label style="color:#888; font-size:0.8rem;">Cor Personalizada</label>
                             <div style="display:flex; align-items:center; gap:10px;">
                                <input type="color" id="editItemColor" style="width:50px; height:40px; border:none; background:none; cursor:pointer;">
                                <span onclick="document.getElementById('editItemColor').value='#000000'" style="cursor:pointer; font-size:0.7rem; color:#666;">Reset</span>
                             </div>
                        </div>
                    </div>

                    <div>
                        <label style="color:#888; font-size:0.8rem;">Descrição / Propriedades</label>
                         <textarea id="editItemProps" class="ds-input" style="width:100%; background:#222; border:1px solid #444; color:white; padding:8px; min-height:60px;"></textarea>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px;">
                        <button onclick="document.getElementById('editItemModal').style.display='none'" style="background:#333; color:#ccc; border:none; padding:8px 16px; cursor:pointer;">Cancelar</button>
                        <button onclick="saveEditedItem()" style="background:var(--accent-primary); color:#10002b; border:none; padding:8px 16px; font-weight:bold; cursor:pointer;">SALVAR</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Populate
    document.getElementById('editItemName').value = item.name || '';
    document.getElementById('editItemWeight').value = item.weight || '';
    document.getElementById('editItemColor').value = item.color || '#000000';
    document.getElementById('editItemProps').value = item.props || '';

    modal.style.display = 'flex';
    modal.classList.add('open');
};

window.saveEditedItem = function () {
    if (window.editingItemIndex === null) return;

    const item = charData.inventory[window.editingItemIndex];
    if (item) {
        item.name = document.getElementById('editItemName').value;
        item.weight = document.getElementById('editItemWeight').value;
        const color = document.getElementById('editItemColor').value;
        item.color = (color !== '#000000' && color !== '#000') ? color : null; // Save null if black (default)
        item.props = document.getElementById('editItemProps').value;

        if (typeof saveState === 'function') saveState();
        renderInventory();
        document.getElementById('editItemModal').style.display = 'none';
        showFlashMessage("Item atualizado!");
    }
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
                charData.money = (charData.money || 0) + finalValue;

                // Remove Item
                charData.inventory.splice(index, 1);

                // Save & Render
                if (typeof saveState === 'function') saveState(); // This calls saveHuman usually
                else if (typeof saveHuman === 'function') saveHuman();

                renderInventory();
                showFlashMessage(`+${finalValue} Ienes`);
                if (window.innerWidth < 768 && typeof closeDetailDrawer === 'function') closeDetailDrawer();
            }
        }
        else if (item.value) {
            // Fixed value
            const val = parseInt(String(item.value).replace(/\D/g, ''));
            if (val) {
                if (confirm(`Usar ${item.name} para obter ${val} Ienes?`)) {
                    charData.money = (charData.money || 0) + val;
                    charData.inventory.splice(index, 1);
                    if (typeof saveHuman === 'function') saveHuman();
                    renderInventory();
                    showFlashMessage(`+${val} Ienes`);
                    if (window.innerWidth < 768 && typeof closeDetailDrawer === 'function') closeDetailDrawer();
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
                if (window.innerWidth < 768 && typeof closeDetailDrawer === 'function') closeDetailDrawer();
            }
            return;
        }
    }

    alert(`Você usa ${item.name}. (Funcionalidade genérica - O item foi consumido)`);
    charData.inventory.splice(index, 1);
    if (typeof saveHuman === 'function') saveHuman();
    renderInventory();
}

// HELPER: Contextual Emojis
window.getItemEmoji = function (name, type) {
    if (!name) return '📦';
    const n = name.toLowerCase();

    // Specific Overrides
    if (n.includes('livro') || n.includes('book') || n.includes('grimório') || n.includes('diário')) return '📖';
    if (n.includes('poção') || n.includes('potion') || n.includes('elixir') || n.includes('frasco')) return '🧪';
    if (n.includes('carta') || n.includes('mapa') || n.includes('documento') || n.includes('convite')) return '📜';
    if (n.includes('chave') || n.includes('key')) return '🔑';
    if (n.includes('moeda') || n.includes('coin') || n.includes('ouro') || n.includes('bolsa')) return '💰';
    if (n.includes('anel') || n.includes('ring')) return '💍';
    if (n.includes('colar') || n.includes('amuleto') || n.includes('pingente')) return '📿';
    if (n.includes('flor') || n.includes('glicínia') || n.includes('lótus')) return '🌸';
    if (n.includes('minério') || n.includes('ore') || n.includes('pedra') || n.includes('cristal') || n.includes('gema')) return '🪨';
    if (n.includes('carne') || n.includes('food') || n.includes('comida') || n.includes('onigiri') || n.includes('arroz') || n.includes('pão')) return '🍙';
    if (n.includes('máscara')) return '🎭';

    // Fallback to Type
    if (type === 'weapon') {
        if (n.includes('arco') || n.includes('bow')) return '🏹';
        if (n.includes('machado') || n.includes('axe')) return '🪓';
        if (n.includes('lança') || n.includes('spear')) return '🔱';
        if (n.includes('martelo') || n.includes('hammer') || n.includes('marreta')) return '🔨';
        if (n.includes('adaga') || n.includes('dagger') || n.includes('faca') || n.includes('kunai')) return '🗡️';
        if (n.includes('bomba') || n.includes('bomb')) return '💣';
        return '⚔️';
    }
    if (type === 'armor') {
        if (n.includes('capacete') || n.includes('elmo') || n.includes('helm')) return '🪖';
        if (n.includes('escudo') || n.includes('shield')) return '🛡️';
        if (n.includes('manto') || n.includes('capa') || n.includes('haori') || n.includes('robe')) return '👘';
        if (n.includes('bota')) return '👢';
        if (n.includes('luva')) return '🧤';
        return '🥋';
    }
    if (type === 'consumable') return '🧪';
    if (type === 'adventure') return '🎒';

    return '📦';
};