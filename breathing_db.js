// BREATHING STYLES DATABASE
// Contains data for Water, Thunder, Beast, and Flame

// --- WATER ---
const BREATHING_WATER = {
    id: 'water',
    name: 'Água',
    description: 'Fluida e adaptável, a Respiração da Água foca em defesa sólida e ataques que fluem como rios.',
    forms: [
        { id: 1, name: "Primeira Forma: Minamogiri", cost: 1, damage: "2d10 Frio", range: "Toque", desc: "Corte rápido horizontal. Inimigos < 10 PV são decapitados automaticamente.", evolutions: ["Inimigos < 15 PV decapitados.", "Inimigos < 20 PV decapitados.", "Inimigos < 25 PV decapitados.", "Inimigos < 30 PV decapitados."] },
        { id: 2, name: "Segunda Forma: Mizuguruma", cost: 1, damage: "2d12 Frio", range: "Cilindro 3m", desc: "Salto giratório vertical criando uma roda d'água.", evolutions: ["Dano aumenta para 3d12.", "Dano aumenta para 4d12.", "Dano aumenta para 5d12.", "Dano 6d12, acerta todos a 1.5m."] },
        { id: 3, name: "Terceira Forma: Ryuuryuu Mai", cost: 1, damage: "2d6 Frio", range: "Cilindro 3m", desc: "Dança fluida desviando e atacando.", evolutions: ["Dano 3d6, raio 6m.", "Dano 4d6, raio 6m.", "Dano 5d6, raio 9m.", "Dano 6d6, raio 12m."] },
        { id: 4, name: "Quarta Forma: Uchishio", cost: 1, damage: "2d12 Frio", range: "Toque", desc: "Ataque fluido como a maré. Ganha +6m deslocamento.", evolutions: ["Dano 3d12.", "Dano 4d12.", "Dano 5d12.", "Dano 6d12, +12m deslocamento."] },
        { id: 5, name: "Quinta Forma: Kanten no Jyu", cost: 0, damage: "Morte (Condicional)", range: "Toque", desc: "Corte misericordioso. Apenas em voluntários.", evolutions: [] },
        { id: 6, name: "Sexta Forma: Nejire Uzu", cost: 1, damage: "2d10 Frio", range: "Cilindro 6m x 3m", desc: "Gira o corpo criando um redemoinho.", evolutions: ["Dano 3d10.", "Dano 4d10.", "Dano 5d10.", "Dano 6d10 + Redemoinho de Raio."] },
        { id: 7, name: "Sétima Forma: Shizuku Wa Mondzuki", cost: 1, damage: "2d6 Perfurante", range: "Toque", desc: "Estocada mais rápida de todas.", evolutions: ["Dano 2d8.", "Dano 2d10.", "Dano 2d12.", "Dano 3d12."] },
        { id: 8, name: "Oitava Forma: Takitsubo", cost: 1, damage: "2d10 Frio", range: "Cilindro 3m", desc: "Corte vertical como uma cachoeira.", evolutions: ["Dano 3d10.", "Dano 4d10.", "Dano 5d10.", "Dano 6d10."] },
        { id: 9, name: "Nona Forma: Suiryuu Shibuki", cost: 1, damage: "2d10 Frio", range: "Toque", desc: "Movimento em superfície instável. Ignora terreno difícil.", evolutions: ["Dano 3d10.", "Dano 4d10.", "Dano 5d10.", "Dano 6d10."] },
        { id: 10, name: "Décima Forma: Seisei Ruten", cost: 1, damage: "2d12 Frio", range: "Toque", desc: "Dragão de água que fica mais forte a cada rotação.", evolutions: ["Dano 3d12.", "Dano 4d12.", "Dano 5d12.", "Dano 6d12."] },
        { id: 11, name: "Décima Primeira Forma: Nagi", cost: 2, damage: "7d12 Frio", range: "Toque", desc: "Calmaria absoluta. Defesa perfeita.", evolutions: ["Dano 8d12.", "Dano 9d12.", "Dano 10d12.", "Morte Instantânea."] }
    ]
};

// --- THUNDER ---
const BREATHING_THUNDER = {
    id: 'thunder',
    name: 'Trovão',
    description: 'Focada em velocidade extrema e ataques explosivos, a Respiração do Trovão canaliza poder nas pernas.',
    forms: [
        { id: 1, name: "Primeira Forma: Hekireki Issen", cost: 1, damage: "3d8 Elétrico", range: "Linha 9m", desc: "Ataque em velocidade divina. O usuário avança instantaneamente.", evolutions: ["Dano 4d8, Linha 12m.", "Dano 5d8, Linha 15m.", "Dano 6d8, Seis Dobras.", "Dano 8d8, Oito Dobras (+Velocidade)."] },
        { id: 2, name: "Segunda Forma: Inadama", cost: 1, damage: "2d6 Elétrico", range: "Toque", desc: "Cinco ataques simultâneos em um piscar de olhos.", evolutions: ["Dano 3d6 (x5).", "Dano 4d6 (x5).", "Dano 5d6 (x5).", "Dano 6d6 (x5)."] },
        { id: 3, name: "Terceira Forma: Shubun Seirai", cost: 1, damage: "2d8 Elétrico", range: "Toque", desc: "Onda giratória de raios que ataca em todas as direções.", evolutions: ["Dano 3d8.", "Dano 4d8.", "Dano 5d8.", "Dano 6d8."] },
        { id: 4, name: "Quarta Forma: Enrai", cost: 1, damage: "2d10 Elétrico", range: "Cone 6m", desc: "Gera um trovão distante que ataca a distância.", evolutions: ["Dano 3d10.", "Dano 4d10.", "Dano 5d10.", "Dano 6d10."] },
        { id: 5, name: "Quinta Forma: Netsu Kairai", cost: 1, damage: "2d12 Fogo/Elétrico", range: "Toque", desc: "Um único golpe focado que queima a carne do alvo.", evolutions: ["Dano 3d12.", "Dano 4d12.", "Dano 5d12.", "Dano 6d12."] },
        { id: 6, name: "Sexta Forma: Dengou Raigou", cost: 2, damage: "4d10 Elétrico", range: "Raio 6m", desc: "Cobre a área com uma chuva de relâmpagos.", evolutions: ["Dano 5d10.", "Dano 6d10.", "Dano 7d10.", "Dano 8d10."] },
        { id: 7, name: "Sétima Forma: Honoikazuchi no Kami", cost: 3, damage: "10d6 Elétrico", range: "Linha 30m", desc: "A forma lendária criada por Zenitsu. Um dragão de raio azul.", evolutions: ["Dano 12d6.", "Dano 15d6.", "Dano 20d6.", "Morte Instantânea (CD 30)."] }
    ]
};

// --- BEAST ---
const BREATHING_BEAST = {
    id: 'beast',
    name: 'Fera',
    description: 'Instintiva e selvagem, criada por Inosuke Hashibira para imitar animais selvagens.',
    forms: [
        { id: 1, name: "Primeira Presa: Ugachi Nuki", cost: 1, damage: "2d8 Perfurante", range: "Toque", desc: "Apunhala com ambas as espadas no pescoço do alvo.", evolutions: ["Dano 3d8.", "Dano 4d8.", "Dano 5d8.", "Dano 6d8."] },
        { id: 2, name: "Segunda Presa: Sakigama", cost: 1, damage: "2d10 Cortante", range: "Cone 3m", desc: "Corte duplo cruzado em X.", evolutions: ["Dano 3d10.", "Dano 4d10.", "Dano 5d10.", "Dano 6d10."] },
        { id: 3, name: "Sétima Presa: Kuikan", cost: 0, damage: "Sensor", range: "Pessoal", desc: "Aumenta percepção de vibrações no ar.", evolutions: ["Raio 100m.", "Raio 500m.", "Raio 1km.", "Raio 5km (Ecolocalização perfeita)."] }
    ]
};

// --- FLAME ---
const BREATHING_FLAME = {
    id: 'flame',
    name: 'Chamas',
    description: 'Poderosa e apaixonada, queima os inimigos com golpes devastadores.',
    forms: [
        { id: 1, name: "Primeira Forma: Shiranui", cost: 1, damage: "2d10 Fogo", range: "Linha 6m", desc: "Investida envolvida em chamas, decapitando no processo.", evolutions: ["Dano 3d10.", "Dano 4d10.", "Dano 5d10.", "Dano 6d10."] },
        { id: 2, name: "Segunda Forma: Nobori En Ten", cost: 1, damage: "2d12 Fogo", range: "Toque", desc: "Corte ascendente circular de chamas.", evolutions: ["Dano 3d12.", "Dano 4d12.", "Dano 5d12.", "Dano 6d12."] },
        { id: 5, name: "Quinta Forma: Enko", cost: 1, damage: "3d10 Fogo", range: "Toque", desc: "Um tigre de chamas que morde o oponente.", evolutions: ["Dano 4d10.", "Dano 5d10.", "Dano 6d10.", "Dano 8d10."] },
        { id: 9, name: "Nona Forma: Rengoku", cost: 3, damage: "10d8 Fogo", range: "Linha 20m", desc: "A técnica suprema. Um purgatório de chamas que devasta tudo.", evolutions: ["Dano 12d8.", "Dano 15d8.", "Dano 20d8.", "Dano 30d8 (Sacrifício)."] }
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
