// BREATHING STYLES DATABASE
// Contains data for Water, Thunder, Beast, and Flame

// --- WATER ---
const BREATHING_WATER = {
    id: 'water',
    name: 'Água',
    description: 'Fluida e adaptável, a Respiração da Água foca em defesa sólida e ataques que fluem como rios.',
    forms: [
        {
            id: 'water_1',
            name: "Primeira Forma: Minamogiri",
            cost: 1,
            damage: "2d10 Frio",
            range: "Toque",
            desc: "Corte rápido com força ampliada por um jato de água. Inimigos com menos de 10 PV são automaticamente decapitados (salvo exceções lendárias).",
            evolutions: [
                "Inimigos com menos de 15 PV podem ser decapitados.",
                "Inimigos com menos de 20 PV podem ser decapitados.",
                "Inimigos com menos de 25 PV podem ser decapitados.",
                "Inimigos com menos de 30 PV podem ser decapitados."
            ]
        },
        {
            id: 'water_2',
            name: "Segunda Forma: Mizuguruma",
            cost: 1,
            damage: "2d12 Frio",
            range: "Cilindro 3m",
            desc: "Movimento giratório criando um corte em círculo de 360 graus. Acerta inimigos ao redor.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12, acerta todas as criaturas até 1,5m (Teste Destreza metade)."
            ]
        },
        {
            id: 'water_3',
            name: "Terceira Forma: Ryuuryuu Mai",
            cost: 1,
            damage: "2d6 Frio",
            range: "Cilindro 3m",
            desc: "Corre em alta velocidade liberando água. Acerta todos dentro do alcance (Teste Destreza metade).",
            evolutions: [
                "Dano 3d6, raio 6m.",
                "Dano 4d6, raio 6m.",
                "Dano 5d6, raio 9m.",
                "Dano 6d6, raio 12m."
            ]
        },
        {
            id: 'water_4',
            name: "Quarta Forma: Uchishio",
            cost: 1,
            damage: "2d12 Frio",
            range: "Toque",
            desc: "Corre em alta velocidade liberando água. Ganha 6m de deslocamento adicional.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12 e ganha 12m de deslocamento adicional."
            ]
        },
        {
            id: 'water_5',
            name: "Quinta Forma: Kanten no Jyu",
            cost: 0,
            damage: "Morte Instantânea (Voluntário)",
            range: "Toque",
            desc: "Ataque sutil no pescoço. Morte instantânea e indolor em criaturas voluntárias. Sem evolução.",
            evolutions: []
        },
        {
            id: 'water_6',
            name: "Sexta Forma: Nejire Uzu",
            cost: 1,
            damage: "2d10 Frio",
            range: "Cilindro 6m x 3m",
            desc: "Redemoinho de água que corta tudo. Teste de Destreza (metade).",
            evolutions: [
                "Dano aumenta para 3d10.",
                "Dano aumenta para 4d10.",
                "Dano aumenta para 5d10.",
                "Dano 6d10, raio 6m raio e 9m altura."
            ]
        },
        {
            id: 'water_7',
            name: "Sétima Forma: Shizuku Wa Mondzuki",
            cost: 1,
            damage: "2d6 Perfurante",
            range: "Toque",
            desc: "Estocada curva. Acerto automático, mas não corta pescoço.",
            evolutions: [
                "Dano aumenta para 2d8.",
                "Dano aumenta para 2d10.",
                "Dano aumenta para 2d12.",
                "Dano aumenta para 3d12."
            ]
        },
        {
            id: 'water_8',
            name: "Oitava Forma: Takitsubo",
            cost: 1,
            damage: "2d10 Frio",
            range: "Cilindro 3m",
            desc: "Corte vertical como cachoeira. Teste Destreza (metade). Evita dano de queda.",
            evolutions: [
                "Dano aumenta para 3d10.",
                "Dano aumenta para 4d10.",
                "Dano aumenta para 5d10.",
                "Dano 6d10, +2 na dificuldade do teste de Const."
            ]
        },
        {
            id: 'water_9',
            name: "Nona Forma: Suiryuu Shibuki",
            cost: 1,
            damage: "2d10 Frio",
            range: "Toque",
            desc: "Corre na água que cria. Ignora terreno difícil. +2 dif Const se alvo fragilizado.",
            evolutions: [
                "Dano 3d10, +6m deslocamento em direção a criatura.",
                "Dano 4d10, +9m deslocamento.",
                "Dano 5d10, +12m deslocamento.",
                "Dano 6d10, acerta o pescoço, +3 na dificuldade."
            ]
        },
        {
            id: 'water_10',
            name: "Décima Forma: Seisei Ruten",
            cost: 1,
            damage: "2d12 Frio",
            range: "Toque",
            desc: "Dragão de água. Falha no teste de Const tem perna decepada. Gasta 1 PE para acertar outro (+1,5m).",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12, rola d20 (1 ou 2 = corpo decepado/morte se < 5)."
            ]
        },
        {
            id: 'water_11_nagi',
            name: "Décima Primeira Forma: Nagi",
            cost: 2,
            damage: "Concéntração (Defesa)",
            range: "Pessoal",
            desc: "Calmaria absoluta. Permanece parado e analisa o inimigo. Ataque preciso no pescoço. Se fragilizado: +5 dificuldade Const. (Nível 20)",
            evolutions: [],
            isSpecial: true,
            reqLevel: 20
        },
        {
            id: 'water_11_nejire',
            name: "Décima Primeira Forma: Nejire Uzu-Ryuuryuu",
            cost: 2,
            damage: "7d10 Frio",
            range: "Toque",
            desc: "Redemoinho com terceira forma. Extrema velocidade. Acerta todos. Se único: acerta pescoço (6d12 Cortante). (Nível 20)",
            evolutions: [],
            isSpecial: true,
            reqLevel: 20
        }
    ]
};

// --- THUNDER ---
const BREATHING_THUNDER = {
    id: 'thunder',
    name: 'Trovão',
    description: 'Focada em velocidade extrema e ataques explosivos, a Respiração do Trovão canaliza poder nas pernas.',
    forms: [
        {
            id: 'thunder_1',
            name: "Primeira Forma: Hekireki Issen",
            cost: 1,
            damage: "2d10 Elétrico",
            range: "Linha (Movimento)",
            desc: "Avanço instantâneo em linha reta. Acerta todos no caminho. Se fragilizado: acerta pescoço (+2 CD Const). Ação Bônus: Crítico 18-20.",
            evolutions: [
                "Dano aumenta para 3d10.",
                "Dano aumenta para 4d10.",
                "Dano aumenta para 5d10.",
                "Dano 6d10. Inimigo fragilizado: +3 na CD de Constituição."
            ]
        },
        {
            id: 'thunder_3',
            name: "Terceira Forma: Shiubun Serai",
            cost: 1,
            damage: "2d12 Elétrico",
            range: "Toque",
            desc: "Série de golpes em arco criando vários raios. Ação Bônus: Crítico 19-20.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Técnica atinge todas as criaturas em volta (3m) com 4d6 dano."
            ]
        },
        {
            id: 'thunder_4',
            name: "Quarta Forma: Enrai",
            cost: 1,
            damage: "2d6 Elétrico",
            range: "Cone 3m",
            desc: "Golpes de trovão à distância. Teste de Destreza (metade). Ação Bônus: Crítico 19-20.",
            evolutions: [
                "Dano 3d6, alcance 6m.",
                "Dano 4d6, alcance 6m.",
                "Dano 5d6, alcance 9m.",
                "Dano 6d6, alcance 12m."
            ]
        },
        {
            id: 'thunder_5',
            name: "Quinta Forma: Retsu Kairai",
            cost: 1,
            damage: "2d12 Elétrico",
            range: "Linha 9m",
            desc: "Poderoso raio em linha reta. Ação Bônus: Crítico 19-20.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Se errar, pode redirecionar para outra criatura a 3m (novo ataque)."
            ]
        },
        {
            id: 'thunder_6',
            name: "Sexta Forma: Dengou Raigou",
            cost: 1,
            damage: "2d12 Elétrico",
            range: "Toque",
            desc: "Versão mais forte da quarta forma, focada em uma criatura. Ação Bônus: Crítico 19-20.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Foca no pescoço. Se fragilizada: acerto automático e +1 na CD Const."
            ]
        },
        { id: 'thunder_7', name: "Sétima Forma: Honoikazuchi no Kami", cost: 3, damage: "10d6 Elétrico", range: "Linha 30m", desc: "Dragão de raio azul. Morte instantânea (CD 30). (Nível 20)", isSpecial: true, reqLevel: 20, evolutions: [] }
    ]
};

// --- BEAST ---
const BREATHING_BEAST = {
    id: 'beast',
    name: 'Fera',
    description: 'Instintiva e selvagem, criada por Inosuke Hashibira.',
    forms: [
        { id: 'beast_1', name: "Primeira Presa: Ugachi Nuki", cost: 1, damage: "2d8 Perfurante", range: "Toque", desc: "Apunhala com ambas as espadas.", evolutions: ["Dano 3d8.", "Dano 4d8.", "Dano 5d8.", "Dano 6d8."] }
    ]
};

// --- FLAME ---
const BREATHING_FLAME = {
    id: 'flame',
    name: 'Chamas',
    description: 'Poderosa e apaixonada, queima os inimigos com golpes devastadores.',
    forms: [
        { id: 'flame_1', name: "Primeira Forma: Shiranui", cost: 1, damage: "2d10 Fogo", range: "Linha 6m", desc: "Investida de chamas.", evolutions: ["Dano 3d10.", "Dano 4d10.", "Dano 5d10.", "Dano 6d10."] },
        { id: 'flame_9', name: "Nona Forma: Rengoku", cost: 3, damage: "10d8 Fogo", range: "Linha 20m", desc: "Purgatório de chamas. (Nível 20)", isSpecial: true, reqLevel: 20, evolutions: [] }
    ]
};

if (typeof window !== 'undefined') {
    window.BreathingDB = {
        water: BREATHING_WATER,
        thunder: BREATHING_THUNDER,
        beast: BREATHING_BEAST,
        flame: BREATHING_FLAME
    };
}
