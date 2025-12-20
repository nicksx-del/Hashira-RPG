// ============================================
// SISTEMA DE ASSINATURA PREMIUM
// ============================================

// Inicializar assinatura premium (todos começam com premium ativo)
function initializePremium() {
    try {
        const sub = localStorage.getItem('demonSlayerSubscription');

        // Se não tiver assinatura, criar uma vitalícia automaticamente
        if (!sub) {
            const defaultSubscription = {
                plan: 'lifetime',
                active: true,
                startDate: new Date().toISOString(),
                price: 25
            };
            localStorage.setItem('demonSlayerSubscription', JSON.stringify(defaultSubscription));
            console.log('Assinatura premium vitalícia ativada automaticamente');
        }

        return true;
    } catch (err) {
        console.error('Erro ao inicializar premium:', err);
        return false;
    }
}

// Verificar se usuário é premium
window.isPremium = function () {
    try {
        const sub = localStorage.getItem('demonSlayerSubscription');
        if (!sub) return false;

        const subData = JSON.parse(sub);
        return subData.active === true;
    } catch (err) {
        return false;
    }
};

// Obter dados da assinatura
window.getSubscription = function () {
    try {
        const sub = localStorage.getItem('demonSlayerSubscription');
        if (!sub) return null;
        return JSON.parse(sub);
    } catch (err) {
        return null;
    }
};

// Adicionar badge premium na navbar (apenas se logado)
window.addPremiumBadge = function () {
    // Verificar se está logado primeiro
    try {
        const session = localStorage.getItem('demonSlayerSession');
        if (!session) {
            console.log('Usuário não logado, badge premium não será exibido');
            return;
        }
    } catch (err) {
        return;
    }

    if (!isPremium()) return;

    const sub = getSubscription();
    if (!sub) return;

    const navbar = document.querySelector('.navbar');
    if (!navbar || document.getElementById('premium-badge')) return;

    const badge = document.createElement('div');
    badge.id = 'premium-badge';
    badge.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(90deg, #ffd700, #ffed4e);
        color: #000;
        padding: 0.4rem 1rem;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.85rem;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
        cursor: pointer;
        transition: all 0.2s;
        margin-right: 1rem;
    `;

    const planText = sub.plan === 'lifetime' ? 'PREMIUM VITALÍCIO' : 'PREMIUM';

    badge.innerHTML = `
        <i data-lucide="crown" style="width:16px;"></i>
        ${planText}
    `;

    badge.onclick = () => {
        window.location.href = 'premium.html';
    };

    badge.onmouseover = function () {
        this.style.transform = 'scale(1.05)';
        this.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.7)';
    };

    badge.onmouseout = function () {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.5)';
    };

    // Inserir antes do user-menu se existir, senão no final
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        navbar.insertBefore(badge, userMenu);
    } else {
        navbar.appendChild(badge);
    }

    if (window.lucide) lucide.createIcons();
};

// Adicionar indicador premium no dashboard
window.addDashboardPremiumIndicator = function () {
    if (!isPremium()) return;

    const sub = getSubscription();
    if (!sub) return;

    const rightSidebar = document.querySelector('.right-sidebar');
    if (!rightSidebar || document.getElementById('premium-indicator')) return;

    const indicator = document.createElement('div');
    indicator.id = 'premium-indicator';
    indicator.style.cssText = `
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.05) 100%);
        border: 2px solid #ffd700;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
    `;

    const planName = sub.plan === 'lifetime' ? 'Vitalício' : 'Mensal';

    indicator.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 0.5rem;">
            <i data-lucide="crown" style="width:20px; color: #ffd700;"></i>
            <span style="color: #ffd700; font-weight: 700; font-size: 1rem;">PREMIUM ${planName.toUpperCase()}</span>
        </div>
        <div style="color: #888; font-size: 0.85rem;">
            Todos os recursos desbloqueados
        </div>
    `;

    indicator.onclick = () => {
        window.location.href = 'premium.html';
    };

    indicator.onmouseover = function () {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.4)';
    };

    indicator.onmouseout = function () {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    };

    // Inserir no topo da sidebar
    rightSidebar.insertBefore(indicator, rightSidebar.firstChild);

    if (window.lucide) lucide.createIcons();
};

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', () => {
    initializePremium();

    // Aguardar um pouco para garantir que a navbar foi carregada
    setTimeout(() => {
        addPremiumBadge();
        addDashboardPremiumIndicator();
    }, 500);
});
