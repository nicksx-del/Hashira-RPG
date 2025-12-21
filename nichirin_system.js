// --- NICHIRIN SYSTEM LOGIC ---

const NICHIRIN_TYPES = [
    { id: 'sun', name: 'Preto (Sol)', colorClass: 'black', buff: 'Crítico: Margem de erro reduzida em 1 (19-20)', desc: "A lendária cor negra, absorvedora de toda luz. Portadores são raros e destinados a grandeza." },
    { id: 'water', name: 'Azul (Água)', colorClass: 'blue', buff: 'Defesa: +1 na Classe de Armadura', desc: "Fluido e adaptável. Ideal para quem busca serenidade e defesa impenetrável." },
    { id: 'flame', name: 'Vermelho (Chamas)', colorClass: 'red', buff: 'Dano: +1d4 de dano de fogo', desc: "Ardente e passional. Queima os inimigos com a fúria do fogo." },
    { id: 'wind', name: 'Verde (Vento)', colorClass: 'green', buff: 'Velocidade: +1.5m de Movimento e Iniciativa +2', desc: "Cortante e imprevisível. Rasga os ares com velocidade extrema." },
    { id: 'thunder', name: 'Amarelo (Trovão)', colorClass: 'yellow', buff: 'Ataque: +1 no Acerto', desc: "Rápido como um raio. Acerta antes que o trovão seja ouvido." },
    { id: 'love', name: 'Rosa (Amor)', colorClass: 'pink', buff: 'Flexibilidade: Vantagem em testes de Acrobacia', desc: "Uma lâmina flexível como um chicote, exigindo destreza única." },
    { id: 'serpent', name: 'Roxo (Serpente)', colorClass: 'purple', buff: 'Técnica: CD das Respirações +1', desc: "Curva e traiçoeira, desliza pelas defesas inimigas." },
    { id: 'mist', name: 'Branco (Névoa)', colorClass: 'white', buff: 'Furtividade: Ocultação como ação bônus', desc: "Obscura e etérea, confunde a mente e a visão." }
];

let isForgingActive = false;

// Init Function
function initNichirinSystem() {
    const select = document.getElementById('elementSelect');
    if (!select) return; // Not on page

    // Populate Select
    select.innerHTML = '<option value="random">?? O Destino Decide ??</option>';
    NICHIRIN_TYPES.forEach(nico => {
        select.innerHTML += `<option value="${nico.id}">${nico.name}</option>`;
    });
}

// Main Forge Function
function startForging() {
    if (isForgingActive) return;
    isForgingActive = true;

    const blade = document.getElementById('swordBlade');
    const btn = document.getElementById('forgeBtn');
    const resultTitle = document.getElementById('resultTitle');
    const resultDesc = document.getElementById('resultDesc');
    const select = document.getElementById('elementSelect');
    const heat = document.querySelector('.heat-glow');

    // UI Reset
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> FORJANDO...';
    lucide.createIcons();

    blade.className = 'blade'; // Reset classes
    resultTitle.style.opacity = 0;
    resultDesc.style.opacity = 0;

    // determine result immediately but show later
    const choice = select.value;
    let result;
    if (choice === 'random') {
        const idx = Math.floor(Math.random() * NICHIRIN_TYPES.length);
        result = NICHIRIN_TYPES[idx];
    } else {
        result = NICHIRIN_TYPES.find(x => x.id === choice);
    }

    // Animation Sequence
    let steps = 0;
    // Heat up
    if (heat) heat.style.opacity = 1;

    const hammerInterval = setInterval(() => {
        steps++;

        // 1. Spark VFX
        spawnSparks(10);

        // 2. Shake Blade
        blade.parentElement.classList.add('shake');
        setTimeout(() => blade.parentElement.classList.remove('shake'), 100);

        // 3. Flash Blade
        blade.style.filter = `brightness(${150 + (steps * 10)}%) sepia(1)`;

        if (steps >= 15) {
            clearInterval(hammerInterval);
            finishForging(result);
        }
    }, 200);
}

function finishForging(result) {
    const blade = document.getElementById('swordBlade');
    const btn = document.getElementById('forgeBtn');
    const resultTitle = document.getElementById('resultTitle');
    const resultDesc = document.getElementById('resultDesc');
    const heat = document.querySelector('.heat-glow');

    // Cool down
    if (heat) heat.style.opacity = 0;
    blade.style.filter = 'brightness(100%) sepia(0)';

    // Apply Class
    blade.classList.add(result.colorClass);

    // Show Text
    resultTitle.textContent = result.name;
    resultDesc.innerHTML = `${result.desc}<br><strong style="color:var(--accent-cyan)">Bônus: ${result.buff}</strong>`;

    resultTitle.style.opacity = 1;
    resultTitle.style.transform = 'translateY(0)';

    resultDesc.style.opacity = 1;

    // Reset UI
    btn.textContent = 'FORJAR NOVAMENTE';
    btn.disabled = false;
    isForgingActive = false;

    // Prompt Inventory
    setTimeout(() => {
        // Reuse global modal or confirm
        // Ideally we use a nicer modal, but confirm is safe for now
        // We can inject a notification div instead
        showForgeNotification(result);
        addSwordToInventory(result);
    }, 800);
}

function spawnSparks(count) {
    const stage = document.querySelector('.sword-stage');
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    for (let i = 0; i < count; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';

        // Random start near center
        const startX = centerX + (Math.random() * 40 - 20);
        const startY = centerY + (Math.random() * 10 - 5);

        spark.style.left = startX + 'px';
        spark.style.top = startY + 'px';

        stage.appendChild(spark);

        // Animate
        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 100;
        const destX = startX + Math.cos(angle) * dist;
        const destY = startY + Math.sin(angle) * dist;

        const anim = spark.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`, opacity: 0 }
        ], {
            duration: 400 + Math.random() * 300,
            easing: 'ease-out'
        });

        anim.onfinish = () => spark.remove();
    }
}

function addSwordToInventory(result) {
    const swordItem = {
        name: `Nichirin (${result.name.split(' ')[0]})`,
        category: 'weapon',
        type: 'weapon',
        dmg: '1d8 cortante',
        props: `Versátil (1d10), ${result.colorClass.toUpperCase()}`,
        weight: '1.2 kg',
        price: '---',
        desc: `Uma lâmina nichirin forjada para você. ${result.buff}`,
        image: 'sword' // Using generic icon logic
    };

    if (window.addItemToInventory) {
        window.addItemToInventory(swordItem);
        // Custom Toast or Alert
        alert(`A espada Nichirin ${result.name} foi adicionada ao seu inventário!`);
    } else {
        console.warn("Inventory System not connected.");
    }
}

function showForgeNotification(result) {
    // Optional: Could implement a toast
}

// Start
document.addEventListener('DOMContentLoaded', initNichirinSystem);
