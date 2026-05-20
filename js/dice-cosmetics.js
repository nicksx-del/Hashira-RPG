/* Global Dice Cosmetics Renderer (V1.3 - WebGL d20 + fallback) */
(function () {
    const PROFILE_KEY = 'demonSlayerDiceCosmeticsProfile';
    const THREE_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.min.js';
    const TEST_UNLOCK_STYLE_IDS = ['dice_coal', 'dice_upper_moon'];

    const STYLE_CATALOG = [
        {
            id: 'dice_coal',
            name: 'Carvao',
            rarity: 'Comum',
            premiumOnly: false,
            starter: true,
            theme: 'crimson',
            emblem: 'assets/dice/coal-emblem.svg',
            frame: 'assets/dice/frame-coal.svg',
            ornaments: 'assets/dice/frame-coal-ornaments.svg',
            textureKind: 'coal',
            colors: { a: '#17181C', b: '#303642', text: '#F7F3ED', glow: 'rgba(245,113,55,0.34)', border: '#DBAA73' },
            material: { metalness: 0.24, roughness: 0.74, edge: '#E2A05A' }
        },
        {
            id: 'dice_upper_moon',
            name: 'Lua Superior',
            rarity: 'Lendario',
            premiumOnly: false,
            starter: true,
            theme: 'azure',
            emblem: 'assets/dice/upper-moon-emblem.svg',
            frame: 'assets/dice/frame-upper-moon.svg',
            ornaments: 'assets/dice/frame-upper-moon-eye.svg',
            textureKind: 'upper_moon',
            colors: { a: '#1A152B', b: '#2E2252', text: '#F7F4FF', glow: 'rgba(151,143,236,0.54)', border: '#E1BE84' },
            material: { metalness: 0.72, roughness: 0.24, edge: '#F0D59E' }
        }
    ];

    const DEFAULT_OWNED = STYLE_CATALOG.filter(style => style.starter).map(style => style.id);
    const DEFAULT_ACTIVE = DEFAULT_OWNED[0] || STYLE_CATALOG[0].id;

    let profile = null;
    let initialized = false;
    let ui = null;
    let hideTimer = null;
    let finalizeTimer = null;
    let renderMode = 'lite';

    const threeState = {
        loadPromise: null,
        failed: false,
        renderer: null,
        scene: null,
        camera: null,
        mesh: null,
        edgeMesh: null,
        rafId: 0,
        spinning: false,
        spinUntil: 0,
        targetQuaternion: null,
        textureCache: {}
    };

    function findStyleById(styleId) {
        return STYLE_CATALOG.find(style => style.id === styleId) || null;
    }

    function getStyleById(styleId) {
        return findStyleById(styleId) || STYLE_CATALOG[0];
    }

    function randomFaceValue() {
        return Math.floor(Math.random() * 20) + 1;
    }

    function clampFace(value) {
        if (!Number.isFinite(value)) return randomFaceValue();
        const intVal = Math.round(value);
        return ((intVal - 1) % 20 + 20) % 20 + 1;
    }

    function createUniqueList(values) {
        const set = new Set();
        const output = [];
        values.forEach(value => {
            if (!value || set.has(value)) return;
            set.add(value);
            output.push(value);
        });
        return output;
    }

    function readProfile() {
        let stored = null;
        try {
            stored = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
        } catch (err) {
            stored = null;
        }

        const storedOwned = Array.isArray(stored && stored.ownedStyleIds) ? stored.ownedStyleIds.slice() : [];
        const mergedOwned = createUniqueList([...DEFAULT_OWNED, ...TEST_UNLOCK_STYLE_IDS, ...storedOwned]).filter(id => !!findStyleById(id));
        const desiredActive = stored && typeof stored.activeStyleId === 'string' ? stored.activeStyleId : DEFAULT_ACTIVE;
        const seenDiceTutorial = !!(stored && stored.seenDiceTutorial);

        profile = {
            ownedStyleIds: mergedOwned.length ? mergedOwned : DEFAULT_OWNED.slice(),
            activeStyleId: mergedOwned.includes(desiredActive) ? desiredActive : (mergedOwned[0] || DEFAULT_ACTIVE),
            seenDiceTutorial
        };
    }

    function writeProfile() {
        if (!profile) return;
        localStorage.setItem(PROFILE_KEY, JSON.stringify({
            ownedStyleIds: profile.ownedStyleIds.slice(),
            activeStyleId: profile.activeStyleId,
            seenDiceTutorial: !!profile.seenDiceTutorial
        }));
    }

    function shouldPreferLiteMode() {
        const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        const weakCpu = Number.isFinite(navigator.hardwareConcurrency) && navigator.hardwareConcurrency <= 4;
        const weakMem = Number.isFinite(navigator.deviceMemory) && navigator.deviceMemory <= 4;
        const saveData = !!(navigator.connection && navigator.connection.saveData);
        return reduceMotion || weakCpu || weakMem || saveData;
    }

    function hasWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
        } catch (err) {
            return false;
        }
    }

    function shouldAttempt3D() {
        return !shouldPreferLiteMode() && hasWebGLSupport() && !threeState.failed;
    }

    function toRgba(hexColor, alpha) {
        const value = String(hexColor || '').replace('#', '').trim();
        if (value.length !== 6) return `rgba(255,255,255,${alpha})`;
        const r = parseInt(value.slice(0, 2), 16);
        const g = parseInt(value.slice(2, 4), 16);
        const b = parseInt(value.slice(4, 6), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    function injectStyles() {
        if (document.getElementById('dice-cosmetics-style')) return;
        const style = document.createElement('style');
        style.id = 'dice-cosmetics-style';
        style.textContent = `
#diceCosmeticsOverlay {
  position: fixed;
  inset: 0;
  z-index: 25000;
  display: none;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 45%, rgba(20,16,24,0.52), rgba(3,3,8,0.92));
  backdrop-filter: blur(5px);
  --dc-a: #1f2228;
  --dc-b: #444c59;
  --dc-text: #f5f5f5;
  --dc-glow: rgba(150, 165, 205, 0.35);
  --dc-border: #6f7888;
}
#diceCosmeticsOverlay.dc-show { display: flex; }
.dc-shell {
  width: min(92vw, 860px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.dc-stage {
  width: 230px;
  height: 230px;
  position: relative;
  display: grid;
  place-items: center;
}
.dc-stage::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 28px;
  background: radial-gradient(circle at 50% 55%, var(--dc-glow), transparent 72%);
  filter: blur(10px);
  opacity: 0.8;
  animation: dcHaloPulse 1.8s ease-in-out infinite;
}
@keyframes dcHaloPulse {
  0%, 100% { transform: scale(0.93); opacity: 0.42; }
  50% { transform: scale(1.03); opacity: 0.95; }
}
.dc-three-host {
  width: 220px;
  height: 220px;
  position: relative;
  z-index: 2;
}
.dc-three-host canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
.dc-lite-d20 {
  width: 156px;
  height: 156px;
  clip-path: polygon(50% 0%, 94% 26%, 94% 74%, 50% 100%, 6% 74%, 6% 26%);
  background:
    linear-gradient(145deg, var(--dc-a), var(--dc-b));
  border: 2px solid var(--dc-border);
  box-shadow: 0 0 30px var(--dc-glow), inset 0 0 24px rgba(0,0,0,0.45);
  font-family: 'Cinzel', serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--dc-text);
  display: none;
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 8px rgba(0,0,0,0.45);
  z-index: 2;
}
#diceCosmeticsOverlay.dc-mode-lite .dc-three-host { display: none; }
#diceCosmeticsOverlay.dc-mode-lite .dc-lite-d20 { display: flex; }
#diceCosmeticsOverlay.dc-lite-pulse .dc-lite-d20 {
  animation: dcLiteSpin 0.34s ease-out;
}
@keyframes dcLiteSpin {
  0% { transform: scale(0.9) rotate(-12deg); }
  70% { transform: scale(1.02) rotate(6deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes dcUpperEyeBlink {
  0%, 84%, 100% { transform: scaleY(1); opacity: 0.92; }
  88%, 90% { transform: scaleY(0.18); opacity: 0.82; }
  94% { transform: scaleY(1.02); opacity: 0.96; }
}

.dc-panel {
  width: min(92vw, 670px);
  position: relative;
  border-radius: 12px;
  border: 1px solid var(--dc-border);
  padding: 12px 14px;
  background:
    radial-gradient(circle at 22% 80%, rgba(255,255,255,0.07), transparent 48%),
    linear-gradient(150deg, rgba(12,11,18,0.98), rgba(8,8,12,0.98));
  box-shadow: 0 16px 42px rgba(0,0,0,0.58), 0 0 22px var(--dc-glow);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  overflow: visible;
}
.dc-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.95;
  z-index: 0;
}
.dc-ornaments {
  position: absolute;
  inset: -30px -44px -28px -44px;
  width: calc(100% + 88px);
  height: calc(100% + 58px);
  object-fit: fill;
  pointer-events: none;
  opacity: 0;
  z-index: 1;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.35)) drop-shadow(0 0 14px rgba(255,120,56,0.16));
  transition: opacity 0.22s ease;
}
.dc-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(122deg, transparent 0%, rgba(255,255,255,0.06) 34%, transparent 64%);
}
.dc-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  position: relative;
  z-index: 3;
}
.dc-emblem-wrap {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.25);
  background: rgba(0,0,0,0.35);
  display: grid;
  place-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.dc-emblem {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.08) saturate(1.08);
}
.dc-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.dc-title {
  font-size: 1.18rem;
  font-weight: 700;
  color: #f8f8ff;
  line-height: 1.05;
}
.dc-raw,
.dc-die {
  font-size: 0.82rem;
  color: #c8c8d5;
  line-height: 1.2;
}
.dc-equals {
  font-size: 1.35rem;
  color: #d7d0df;
  font-weight: 700;
  position: relative;
  z-index: 3;
}
.dc-total {
  min-width: 84px;
  text-align: right;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  color: var(--dc-text);
  line-height: 1;
  position: relative;
  z-index: 3;
}
.dc-total.dc-crit { color: #ffe27a; text-shadow: 0 0 14px rgba(255,210,80,0.45); }
.dc-total.dc-fail { color: #ff6b82; text-shadow: 0 0 14px rgba(255,102,129,0.45); }
.dc-close {
  position: absolute;
  top: 8px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid rgba(255,255,255,0.24);
  background: rgba(0,0,0,0.45);
  color: #f4f4fa;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  z-index: 5;
}
.dc-close:hover,
.dc-close:focus-visible {
  border-color: rgba(255,255,255,0.58);
  transform: translateY(-1px);
}

#diceCosmeticsOverlay.dc-theme-crimson .dc-panel { box-shadow: 0 16px 42px rgba(0,0,0,0.58), 0 0 22px rgba(228, 31, 80, 0.32); }
#diceCosmeticsOverlay.dc-theme-gold .dc-panel { box-shadow: 0 16px 42px rgba(0,0,0,0.58), 0 0 22px rgba(255, 190, 48, 0.34); }
#diceCosmeticsOverlay.dc-theme-azure .dc-panel { box-shadow: 0 16px 42px rgba(0,0,0,0.58), 0 0 22px rgba(73, 170, 255, 0.34); }
#diceCosmeticsOverlay.dc-style-coal .dc-ornaments { opacity: 0.97; }
#diceCosmeticsOverlay.dc-style-upper_moon .dc-ornaments {
  inset: -8px -12px -8px -12px;
  width: calc(100% + 24px);
  height: calc(100% + 16px);
  opacity: 0.92;
  transform-origin: 50% 50%;
  animation: dcUpperEyeBlink 5.2s ease-in-out infinite;
  filter: drop-shadow(0 7px 14px rgba(0,0,0,0.4)) drop-shadow(0 0 18px rgba(202,118,145,0.26));
}

@media (max-width: 640px) {
  .dc-stage {
    width: 188px;
    height: 188px;
  }
  .dc-three-host {
    width: 184px;
    height: 184px;
  }
  .dc-lite-d20 {
    width: 132px;
    height: 132px;
    font-size: 2rem;
  }
  .dc-panel {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    padding: 10px 11px;
  }
  .dc-ornaments {
    inset: -18px -24px -16px -24px;
    width: calc(100% + 48px);
    height: calc(100% + 34px);
  }
  #diceCosmeticsOverlay.dc-style-coal .dc-ornaments {
    opacity: 0.66;
  }
  #diceCosmeticsOverlay.dc-style-upper_moon .dc-ornaments {
    inset: -4px -8px -4px -8px;
    width: calc(100% + 16px);
    height: calc(100% + 8px);
    opacity: 0.78;
  }
  .dc-equals { display: none; }
  .dc-total { min-width: 62px; }
  .dc-title { font-size: 1rem; }
  .dc-emblem-wrap { width: 40px; height: 40px; }
}
@media (prefers-reduced-motion: reduce) {
  #diceCosmeticsOverlay.dc-style-upper_moon .dc-ornaments {
    animation: none;
    transform: none;
    opacity: 0.86;
  }
}
`;
        document.head.appendChild(style);
    }

    function buildOverlayDom() {
        if (document.getElementById('diceCosmeticsOverlay')) {
            const root = document.getElementById('diceCosmeticsOverlay');
            ui = {
                root,
                stage: root.querySelector('.dc-stage'),
                threeHost: root.querySelector('.dc-three-host'),
                liteD20: root.querySelector('.dc-lite-d20'),
                frame: root.querySelector('.dc-frame'),
                ornaments: root.querySelector('.dc-ornaments'),
                emblem: root.querySelector('.dc-emblem'),
                title: root.querySelector('.dc-title'),
                raw: root.querySelector('.dc-raw'),
                die: root.querySelector('.dc-die'),
                total: root.querySelector('.dc-total'),
                close: root.querySelector('.dc-close')
            };

            if (!ui.ornaments) {
                const panel = root.querySelector('.dc-panel');
                if (panel) {
                    const ornaments = document.createElement('img');
                    ornaments.className = 'dc-ornaments';
                    ornaments.src = 'assets/dice/frame-coal-ornaments.svg';
                    ornaments.alt = '';
                    panel.insertBefore(ornaments, panel.firstChild);
                    ui.ornaments = ornaments;
                }
            }
            return;
        }

        const root = document.createElement('div');
        root.id = 'diceCosmeticsOverlay';
        root.setAttribute('aria-live', 'polite');
        root.innerHTML = `
            <div class="dc-shell">
                <div class="dc-stage">
                    <div class="dc-three-host" aria-hidden="true"></div>
                    <div class="dc-lite-d20" aria-hidden="true">20</div>
                </div>
                <div class="dc-panel">
                    <img class="dc-frame" src="assets/dice/frame-coal.svg" alt="">
                    <img class="dc-ornaments" src="assets/dice/frame-coal-ornaments.svg" alt="">
                    <button class="dc-close" type="button" aria-label="Fechar">&times;</button>
                    <div class="dc-left">
                        <div class="dc-emblem-wrap">
                            <img class="dc-emblem" src="assets/dice/coal-emblem.svg" alt="Dice Skin">
                        </div>
                        <div class="dc-copy">
                            <div class="dc-title">Resultado</div>
                            <div class="dc-raw">[0]</div>
                            <div class="dc-die">1d20</div>
                        </div>
                    </div>
                    <div class="dc-equals">=</div>
                    <div class="dc-total">0</div>
                </div>
            </div>
        `;
        document.body.appendChild(root);
        ui = {
            root,
            stage: root.querySelector('.dc-stage'),
            threeHost: root.querySelector('.dc-three-host'),
            liteD20: root.querySelector('.dc-lite-d20'),
            frame: root.querySelector('.dc-frame'),
            ornaments: root.querySelector('.dc-ornaments'),
            emblem: root.querySelector('.dc-emblem'),
            title: root.querySelector('.dc-title'),
            raw: root.querySelector('.dc-raw'),
            die: root.querySelector('.dc-die'),
            total: root.querySelector('.dc-total'),
            close: root.querySelector('.dc-close')
        };
    }

    function stopTimers() {
        if (hideTimer) clearTimeout(hideTimer);
        if (finalizeTimer) clearTimeout(finalizeTimer);
        hideTimer = null;
        finalizeTimer = null;
    }

    function stopRenderLoop() {
        if (threeState.rafId) {
            cancelAnimationFrame(threeState.rafId);
            threeState.rafId = 0;
        }
    }

    function hideOverlay() {
        if (!ui) return;
        ui.root.classList.remove('dc-show');
        stopRenderLoop();
    }

    function setRenderMode(mode) {
        if (!ui) return;
        renderMode = mode === '3d' ? '3d' : 'lite';
        ui.root.classList.remove('dc-mode-3d', 'dc-mode-lite');
        ui.root.classList.add(renderMode === '3d' ? 'dc-mode-3d' : 'dc-mode-lite');
    }

    function sanitizeExprText(exprText) {
        const text = String(exprText || '').replace(/\s+/g, ' ').trim() || '1d20';
        return text.length > 28 ? `${text.slice(0, 27)}…` : text;
    }

    function applyStyleTheme(styleInput) {
        if (!ui) return;
        const style = styleInput || getStyleById(profile.activeStyleId);
        ui.root.style.setProperty('--dc-a', style.colors.a);
        ui.root.style.setProperty('--dc-b', style.colors.b);
        ui.root.style.setProperty('--dc-text', style.colors.text);
        ui.root.style.setProperty('--dc-glow', style.colors.glow);
        ui.root.style.setProperty('--dc-border', style.colors.border);
        ui.root.classList.remove('dc-theme-crimson', 'dc-theme-gold', 'dc-theme-azure');
        ui.root.classList.add(`dc-theme-${style.theme || 'crimson'}`);
        Array.from(ui.root.classList).forEach(cls => {
            if (cls.startsWith('dc-style-')) ui.root.classList.remove(cls);
        });
        ui.root.classList.add(`dc-style-${String(style.id || 'default').replace(/^dice_/, '')}`);
        if (ui.emblem) ui.emblem.src = style.emblem || 'assets/hashira-logo.png';
        if (ui.frame) ui.frame.src = style.frame || 'assets/dice/frame-coal.svg';
        if (ui.ornaments) ui.ornaments.src = style.ornaments || 'assets/dice/frame-coal-ornaments.svg';
    }

    function drawGenericTexture(ctx, style, size) {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, style.colors.a);
        gradient.addColorStop(1, style.colors.b);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        ctx.globalAlpha = 0.12;
        for (let i = 0; i < 45; i += 1) {
            const y = (size / 45) * i;
            ctx.fillStyle = i % 2 === 0 ? toRgba(style.colors.text, 0.16) : toRgba(style.colors.border, 0.16);
            ctx.fillRect(0, y, size, 2);
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = toRgba(style.colors.text, 0.08);
        for (let j = 0; j < 220; j += 1) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = Math.random() * 2.2 + 0.6;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawCoalTexture(ctx, style, size) {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#15171B');
        gradient.addColorStop(0.52, '#2A2D34');
        gradient.addColorStop(1, '#3A404D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = toRgba('#B18B5F', 0.24);
        ctx.lineWidth = 2;
        for (let i = 0; i < 90; i += 1) {
            const y = (size / 90) * i + (Math.random() * 9 - 4);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(size * 0.25, y + Math.random() * 8, size * 0.75, y - Math.random() * 8, size, y + Math.random() * 6);
            ctx.stroke();
        }

        ctx.fillStyle = toRgba('#E2B177', 0.18);
        for (let j = 0; j < 420; j += 1) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = Math.random() * 1.5 + 0.2;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = toRgba(style.colors.border, 0.28);
        ctx.lineWidth = 6;
        ctx.strokeRect(20, 20, size - 40, size - 40);
    }

    function drawUpperMoonTexture(ctx, style, size) {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#151125');
        gradient.addColorStop(0.4, '#271C47');
        gradient.addColorStop(1, '#3A2A64');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = toRgba('#6E3D53', 0.38);
        ctx.lineWidth = Math.max(2, size * 0.006);
        for (let i = 0; i < 18; i += 1) {
            const y = size * 0.08 + (size / 18) * i;
            const curve = (i % 2 === 0 ? 1 : -1) * size * 0.04;
            ctx.beginPath();
            ctx.moveTo(size * 0.06, y);
            ctx.bezierCurveTo(size * 0.22, y - curve, size * 0.76, y + curve, size * 0.94, y - size * 0.01);
            ctx.stroke();
        }

        const crescentBands = [0.18, 0.34, 0.5, 0.66, 0.82];
        for (const band of crescentBands) {
            const cx = size * band;
            const cy = size * 0.52;
            const r = size * 0.17;
            ctx.fillStyle = toRgba('#D9C48A', 0.2);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0.22 * Math.PI, 1.78 * Math.PI);
            ctx.fill();
            ctx.fillStyle = toRgba('#1B1630', 0.86);
            ctx.beginPath();
            ctx.arc(cx + size * 0.045, cy, r * 0.87, 0.26 * Math.PI, 1.74 * Math.PI);
            ctx.fill();
        }

        const eyeCenters = [
            [size * 0.28, size * 0.3],
            [size * 0.48, size * 0.7],
            [size * 0.72, size * 0.35]
        ];
        for (const [ex, ey] of eyeCenters) {
            ctx.fillStyle = toRgba('#2B203E', 0.95);
            ctx.strokeStyle = toRgba('#D47979', 0.8);
            ctx.lineWidth = Math.max(2, size * 0.0042);
            ctx.beginPath();
            ctx.ellipse(ex, ey, size * 0.052, size * 0.038, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = toRgba('#F3D8A8', 0.8);
            ctx.beginPath();
            ctx.arc(ex, ey, size * 0.01, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = toRgba(style.colors.border, 0.44);
        ctx.lineWidth = Math.max(3, size * 0.0046);
        ctx.strokeRect(size * 0.02, size * 0.02, size * 0.96, size * 0.96);

        ctx.fillStyle = toRgba('#F6DAB6', 0.12);
        for (let j = 0; j < 220; j += 1) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = Math.random() * (size * 0.0022) + size * 0.0007;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createTextureForStyle(style) {
        if (!window.THREE) return null;
        if (threeState.textureCache[style.id]) return threeState.textureCache[style.id];

        const size = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        if (style.textureKind === 'coal') drawCoalTexture(ctx, style, size);
        else if (style.textureKind === 'upper_moon') drawUpperMoonTexture(ctx, style, size);
        else drawGenericTexture(ctx, style, size);

        const texture = new window.THREE.CanvasTexture(canvas);
        texture.wrapS = window.THREE.RepeatWrapping;
        texture.wrapT = window.THREE.RepeatWrapping;
        texture.repeat.set(1.05, 1.05);
        texture.needsUpdate = true;
        threeState.textureCache[style.id] = texture;
        return texture;
    }

    function ensureThreeScriptLoaded() {
        if (window.THREE) return Promise.resolve(true);
        if (threeState.failed) return Promise.resolve(false);
        if (threeState.loadPromise) return threeState.loadPromise;

        threeState.loadPromise = new Promise(resolve => {
            const existing = document.getElementById('dice-cosmetics-three-js');
            if (existing) {
                existing.addEventListener('load', () => resolve(!!window.THREE), { once: true });
                existing.addEventListener('error', () => resolve(false), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.id = 'dice-cosmetics-three-js';
            script.src = THREE_SCRIPT_URL;
            script.async = true;
            script.onload = () => resolve(!!window.THREE);
            script.onerror = () => resolve(false);
            document.head.appendChild(script);
        }).then(ok => {
            if (!ok) threeState.failed = true;
            return ok;
        }).catch(() => {
            threeState.failed = true;
            return false;
        });

        return threeState.loadPromise;
    }

    function resizeThreeRenderer() {
        if (!ui || !threeState.renderer || !threeState.camera) return;
        const width = Math.max(1, ui.threeHost.clientWidth || 220);
        const height = Math.max(1, ui.threeHost.clientHeight || 220);
        threeState.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        threeState.renderer.setSize(width, height, false);
        threeState.camera.aspect = width / height;
        threeState.camera.updateProjectionMatrix();
    }

    function ensureThreeScene() {
        if (!window.THREE || !ui || !ui.threeHost) return false;
        if (threeState.renderer) {
            resizeThreeRenderer();
            return true;
        }

        try {
            const THREE = window.THREE;
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
            if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.setClearColor(0x000000, 0);
            ui.threeHost.innerHTML = '';
            ui.threeHost.appendChild(renderer.domElement);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
            camera.position.set(0, 0, 6);

            const ambient = new THREE.AmbientLight(0xffffff, 0.85);
            const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
            keyLight.position.set(4, 5, 7);
            const rimLight = new THREE.PointLight(0x88aaff, 1.05, 30);
            rimLight.position.set(-5, -4, 4);
            scene.add(ambient);
            scene.add(keyLight);
            scene.add(rimLight);

            const geometry = new THREE.IcosahedronGeometry(1.62, 0);
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#444a58'),
                emissive: new THREE.Color('#222530'),
                roughness: 0.55,
                metalness: 0.45,
                flatShading: true
            });

            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            const edgeGeometry = new THREE.EdgesGeometry(geometry);
            const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
            const edgeMesh = new THREE.LineSegments(edgeGeometry, edgeMaterial);
            edgeMesh.scale.setScalar(1.005);
            mesh.add(edgeMesh);

            threeState.renderer = renderer;
            threeState.scene = scene;
            threeState.camera = camera;
            threeState.mesh = mesh;
            threeState.edgeMesh = edgeMesh;
            resizeThreeRenderer();
            return true;
        } catch (err) {
            threeState.failed = true;
            return false;
        }
    }

    function updateThreeMaterial(style) {
        if (!window.THREE || !threeState.mesh) return;
        const material = threeState.mesh.material;
        const texture = createTextureForStyle(style);
        const materialConfig = style.material || {};

        material.color = new window.THREE.Color(style.colors.b || '#46506a');
        material.emissive = new window.THREE.Color(style.colors.a || '#1a1d28').multiplyScalar(0.18);
        material.metalness = Number.isFinite(materialConfig.metalness) ? materialConfig.metalness : 0.45;
        material.roughness = Number.isFinite(materialConfig.roughness) ? materialConfig.roughness : 0.52;
        material.map = texture || null;
        material.needsUpdate = true;

        if (threeState.edgeMesh && threeState.edgeMesh.material) {
            const edgeColor = materialConfig.edge || style.colors.border || '#ffffff';
            threeState.edgeMesh.material.color = new window.THREE.Color(edgeColor);
            threeState.edgeMesh.material.opacity = 0.44;
            threeState.edgeMesh.material.needsUpdate = true;
        }
    }

    function getQuaternionForFace(faceValue) {
        const THREE = window.THREE;
        const index = clampFace(faceValue) - 1;
        const yaw = ((index * 137.5) % 360) * (Math.PI / 180);
        const pitch = ((((index * 67) % 130) - 65) * Math.PI) / 180;
        const roll = ((index * 53) % 360) * (Math.PI / 180);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(pitch, yaw, roll));
        return quaternion;
    }

    function startRenderLoop() {
        if (threeState.rafId || !threeState.renderer || !threeState.scene || !threeState.camera || !threeState.mesh) return;
        let previousTs = performance.now();

        const tick = (ts) => {
            if (!ui || !ui.root.classList.contains('dc-show') || renderMode !== '3d') {
                threeState.rafId = 0;
                return;
            }

            const delta = Math.max(16, ts - previousTs);
            previousTs = ts;
            const mesh = threeState.mesh;

            if (threeState.spinning && ts < threeState.spinUntil) {
                mesh.rotation.x += delta * 0.0072;
                mesh.rotation.y += delta * 0.009;
                mesh.rotation.z += delta * 0.0054;
            } else if (threeState.spinning && threeState.targetQuaternion) {
                mesh.quaternion.slerp(threeState.targetQuaternion, 0.16);
                const alignment = mesh.quaternion.angleTo(threeState.targetQuaternion);
                if (alignment < 0.035) {
                    mesh.quaternion.copy(threeState.targetQuaternion);
                    threeState.spinning = false;
                    threeState.targetQuaternion = null;
                }
            } else {
                mesh.rotation.y += delta * 0.0007;
            }

            threeState.renderer.render(threeState.scene, threeState.camera);
            threeState.rafId = requestAnimationFrame(tick);
        };

        threeState.rafId = requestAnimationFrame(tick);
    }

    function runLiteRoll(faceValue) {
        if (!ui || !ui.stage || !ui.liteD20) return;
        setRenderMode('lite');
        ui.liteD20.textContent = String(faceValue);
        ui.root.classList.remove('dc-lite-pulse');
        void ui.stage.offsetWidth;
        ui.root.classList.add('dc-lite-pulse');
    }

    async function run3DRoll(style, faceValue) {
        if (!shouldAttempt3D()) return false;
        const scriptReady = await ensureThreeScriptLoaded();
        if (!scriptReady) return false;
        if (!ensureThreeScene()) return false;

        setRenderMode('3d');
        updateThreeMaterial(style);
        resizeThreeRenderer();

        threeState.spinning = true;
        threeState.spinUntil = performance.now() + 1020;
        threeState.targetQuaternion = getQuaternionForFace(faceValue);
        startRenderLoop();
        return true;
    }

    function scheduleCallbacks(spinMs, onComplete) {
        const holdMs = 2200;
        finalizeTimer = setTimeout(() => {
            if (typeof onComplete === 'function') onComplete();
        }, spinMs);

        hideTimer = setTimeout(() => {
            hideOverlay();
        }, spinMs + holdMs);
    }

    function init() {
        if (initialized) return;
        readProfile();
        injectStyles();
        buildOverlayDom();
        applyStyleTheme();

        if (ui.close) ui.close.addEventListener('click', hideOverlay);
        window.addEventListener('resize', resizeThreeRenderer);

        if (shouldAttempt3D()) {
            ensureThreeScriptLoaded().then(ok => {
                if (!ok) return;
                if (!ui) return;
                if (!ensureThreeScene()) return;
                updateThreeMaterial(getStyleById(profile.activeStyleId));
            });
        }

        initialized = true;
    }

    function refreshFromStorage() {
        readProfile();
        if (ui) applyStyleTheme();
    }

    function getCatalog() {
        return STYLE_CATALOG.map(style => ({
            id: style.id,
            name: style.name,
            rarity: style.rarity,
            premiumOnly: style.premiumOnly,
            starter: style.starter
        }));
    }

    function getProfile() {
        if (!profile) readProfile();
        return {
            ownedStyleIds: profile.ownedStyleIds.slice(),
            activeStyleId: profile.activeStyleId,
            seenDiceTutorial: profile.seenDiceTutorial
        };
    }

    function isOwned(styleId) {
        if (!profile) readProfile();
        return profile.ownedStyleIds.includes(styleId);
    }

    function unlockStyle(styleId) {
        if (!profile) readProfile();
        if (!findStyleById(styleId)) return false;
        if (!profile.ownedStyleIds.includes(styleId)) {
            profile.ownedStyleIds.push(styleId);
            writeProfile();
            return true;
        }
        return false;
    }

    function setStyle(styleId) {
        if (!profile) readProfile();
        if (!profile.ownedStyleIds.includes(styleId)) return false;
        profile.activeStyleId = styleId;
        writeProfile();
        if (ui) {
            const style = getStyleById(styleId);
            applyStyleTheme(style);
            if (threeState.mesh) updateThreeMaterial(style);
        }
        return true;
    }

    async function showRoll(payload, options = {}) {
        init();
        stopTimers();

        const style = getStyleById(profile.activeStyleId);
        const rawRollCandidate = Number(payload && payload.rawRoll);
        const resultCandidate = Number(payload && payload.result);
        const faceValue = clampFace(Number.isFinite(rawRollCandidate) ? rawRollCandidate : resultCandidate);
        const resultValue = Number.isFinite(resultCandidate) ? resultCandidate : faceValue;
        const exprText = sanitizeExprText(payload && payload.expr ? payload.expr : '1d20');
        const isCrit = !!(payload && payload.isCrit) || faceValue === 20;
        const isFail = !!(payload && payload.isFail) || faceValue === 1;

        applyStyleTheme(style);
        if (ui.title) ui.title.textContent = 'Resultado';
        if (ui.raw) ui.raw.textContent = `[${faceValue}]`;
        if (ui.die) ui.die.textContent = exprText;
        if (ui.total) {
            ui.total.textContent = String(resultValue);
            ui.total.classList.remove('dc-crit', 'dc-fail');
            if (isCrit) ui.total.classList.add('dc-crit');
            if (isFail) ui.total.classList.add('dc-fail');
        }

        ui.root.classList.add('dc-show');

        let used3d = false;
        try {
            used3d = await run3DRoll(style, faceValue);
        } catch (err) {
            used3d = false;
        }

        if (!used3d) runLiteRoll(faceValue);
        scheduleCallbacks(used3d ? 1320 : 320, options.onComplete);
    }

    window.DiceCosmetics = {
        init,
        refreshFromStorage,
        getCatalog,
        getProfile,
        isOwned,
        unlockStyle,
        setStyle,
        showRoll
    };
})();
