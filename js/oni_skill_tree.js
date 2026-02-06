// oni_skill_tree.js

document.addEventListener('DOMContentLoaded', () => {
    // Only init if we are on the dashboard and the container exists
    if (document.getElementById('skillTreeContainer')) {
        initSkillTree();
    }
});

let treeState = {
    scale: 0.8, // Initial zoom out a bit to see more
    panning: false,
    pointX: 0,
    pointY: 0,
    startX: 0,
    startY: 0
};

let selectedSkillId = null;

function initSkillTree() {
    const container = document.getElementById('skillTreeContainer');
    const wrapper = document.getElementById('skillTreeWrapper');

    // Setup Pan/Zoom
    wrapper.addEventListener('mousedown', (e) => {
        treeState.panning = true;
        treeState.startX = e.clientX - treeState.pointX;
        treeState.startY = e.clientY - treeState.pointY;
        wrapper.style.cursor = 'grabbing';
    });

    wrapper.addEventListener('mousemove', (e) => {
        if (!treeState.panning) return;
        e.preventDefault();
        treeState.pointX = e.clientX - treeState.startX;
        treeState.pointY = e.clientY - treeState.startY;
        updateTransform();
    });

    wrapper.addEventListener('mouseup', () => {
        treeState.panning = false;
        wrapper.style.cursor = 'grab';
    });

    wrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = -Math.sign(e.deltaY) * 0.1;
        treeState.scale = Math.min(Math.max(0.1, treeState.scale + delta), 2);
        updateTransform();
    });

    renderTreeNodes();
    updateTransform();
}

function updateTransform() {
    const container = document.getElementById('skillTreeContainer');
    container.style.transform = `translate(${treeState.pointX}px, ${treeState.pointY}px) scale(${treeState.scale})`;
}

function renderTreeNodes() {
    const container = document.getElementById('skillTreeContainer');
    // Clear existing nodes but we also rebuild rings dynamically now
    container.innerHTML = '<!-- Nodes injected via JS -->';

    const skills = KEKKIJUTSU_DATA.skills;
    const charData = loadCharData();
    const unlocked = charData.unlockedSkills || [];

    // Group by circle
    const circles = {};
    skills.forEach(s => {
        if (!circles[s.circle]) circles[s.circle] = [];
        circles[s.circle].push(s);
    });

    // Configuration for Layout (Circles 0 to 9)
    // Distance increases significantly to force "walking" through tree
    const config = {
        0: { radius: 0 },
        1: { radius: 180 },
        2: { radius: 320 },
        3: { radius: 460 },
        4: { radius: 600 },
        5: { radius: 750 },
        6: { radius: 920 },
        7: { radius: 1100 },
        8: { radius: 1300 },
        9: { radius: 1520 }
    };

    // Render Rings First (Background)
    for (let i = 1; i <= 9; i++) {
        const r = config[i].radius;
        const ring = document.createElement('div');
        ring.className = `tree-ring ring-${i}`;
        ring.style.width = (r * 2) + 'px';
        ring.style.height = (r * 2) + 'px';
        ring.style.marginLeft = (-r) + 'px';
        ring.style.marginTop = (-r) + 'px';
        ring.style.position = 'absolute';
        ring.style.border = '1px dashed rgba(255, 255, 255, 0.08)';
        ring.style.borderRadius = '50%';
        ring.style.top = '50%';
        ring.style.left = '50%';
        ring.style.zIndex = '1';
        container.appendChild(ring);
    }

    // Render Chi (Circle 0)
    const chiRadius = 80;
    renderCircleGroup(circles[0], chiRadius, container, unlocked);

    // Render others 1-9
    for (let i = 1; i <= 9; i++) {
        if (config[i]) renderCircleGroup(circles[i], config[i].radius, container, unlocked);
    }

    if (window.lucide) lucide.createIcons();
}

function renderCircleGroup(groupMembers, radius, container, unlockedIds) {
    if (!groupMembers || groupMembers.length === 0) return;

    const count = groupMembers.length;
    const angleStep = (2 * Math.PI) / count;

    groupMembers.forEach((skill, index) => {
        const angle = index * angleStep - (Math.PI / 2); // Start from top
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const node = document.createElement('div');
        node.className = 'tree-node';

        // Status Check
        const isUnlocked = unlockedIds.includes(skill.id);
        const canUnlock = checkUnlockRequirements(skill, unlockedIds);

        if (isUnlocked) node.classList.add('unlocked');
        else if (canUnlock) node.classList.add('reachable');
        else node.classList.add('locked');

        // Styles
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        node.style.marginLeft = '-30px'; // Half of 60px size
        node.style.marginTop = '-30px';

        node.innerHTML = `
            <i data-lucide="${getIconForSkill(skill)}" size="24"></i>
        `;

        node.onclick = () => openSkillDetail(skill, isUnlocked, canUnlock);

        const label = document.createElement('div');
        label.className = 'node-label';
        label.innerText = skill.name;
        node.appendChild(label);

        container.appendChild(node);
    });
}

function getIconForSkill(skill) {
    const name = skill.name.toLowerCase();
    if (name.includes('raio') || name.includes('aurora')) return 'zap';
    if (name.includes('escudo') || name.includes('pele') || name.includes('barreira') || name.includes('muralha') || name.includes('block') || name.includes('casa')) return 'shield';
    if (name.includes('lâmina') || name.includes('adaga') || name.includes('lança') || name.includes('punho') || name.includes('espada')) return 'sword';
    if (name.includes('nevasca') || name.includes('tempestade') || name.includes('nuvem') || name.includes('chuva')) return 'cloud-snow';
    if (name.includes('passo') || name.includes('velocidade') || name.includes('viagem')) return 'footprints';
    if (name.includes('olho') || name.includes('visão')) return 'eye';
    if (name.includes('tempo') || name.includes('esfera temporal')) return 'clock';
    if (name.includes('prisão') || name.includes('lock')) return 'lock';
    return 'snowflake';
}

function checkUnlockRequirements(skill, unlockedIds) {
    if (unlockedIds.includes(skill.id)) return false; // Already unlocked

    if (skill.circle === 0) return true;

    // Progression Rule:
    const prevCircle = skill.circle - 1;
    const skillsInPrev = KEKKIJUTSU_DATA.skills.filter(s => s.circle === prevCircle);
    const unlockedInPrev = skillsInPrev.filter(s => unlockedIds.includes(s.id)).length;

    // Require 2 from previous circle (or all if < 2)
    const requiredCount = Math.min(2, skillsInPrev.length);

    return unlockedInPrev >= requiredCount;
}

// Modal Logic
function openSkillDetail(skill, isUnlocked, isReachable) {
    selectedSkillId = skill.id;
    const modal = document.getElementById('skillDetailModal');

    document.getElementById('sdName').innerText = skill.name;
    document.getElementById('sdType').innerText = skill.type;
    document.getElementById('sdCost').innerText = skill.cost;
    document.getElementById('sdDesc').innerText = skill.description;
    document.getElementById('sdDmg').innerText = skill.damage || '-';
    document.getElementById('sdRange').innerText = skill.range || '-';
    document.getElementById('sdDur').innerText = skill.duration || '-';

    const btn = document.getElementById('learnSkillBtn');
    const warning = document.getElementById('reqWarning');

    if (isUnlocked) {
        btn.innerText = "HABILITADO";
        btn.disabled = true;
        btn.style.opacity = 0.5;
        warning.style.display = 'none';
        btn.style.display = 'block';
    } else if (isReachable) {
        btn.innerText = "APRENDER";
        btn.disabled = false;
        btn.style.opacity = 1;
        warning.style.display = 'none';
        btn.style.display = 'block';
    } else {
        btn.style.display = 'none';
        warning.style.display = 'block';
        warning.innerText = `Bloqueado: Requer ${getRequirementText(skill.circle)}`;
    }

    modal.style.display = 'flex';
}

function getRequirementText(circle) {
    if (circle === 1) return "2 habilidades de Chi";
    return `2 habilidades do ${circle - 1}º Círculo`;
}

function closeSkillModal() {
    document.getElementById('skillDetailModal').style.display = 'none';
    selectedSkillId = null;
}

function learnSelectedSkill() {
    if (!selectedSkillId) return;

    const charData = loadCharData();
    if (!charData.unlockedSkills) charData.unlockedSkills = [];

    charData.unlockedSkills.push(selectedSkillId);
    saveCharData(charData);

    closeSkillModal();
    renderTreeNodes();
}

function loadCharData() {
    const raw = localStorage.getItem('oni_character_data');
    return raw ? JSON.parse(raw) : { unlockedSkills: [] };
}

function saveCharData(data) {
    localStorage.setItem('oni_character_data', JSON.stringify(data));
}
