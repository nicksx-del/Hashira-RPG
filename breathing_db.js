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
// --- FLAME ---
const BREATHING_FLAME = {
    id: 'flame',
    name: 'Chamas',
    description: 'Poderosa e apaixonada, queima os inimigos com golpes devastadores. Foca em alto dano e controle de área.',
    forms: [
        {
            id: 'flame_1',
            name: "Primeira Forma: Shiranui",
            cost: 1,
            damage: "2d12 Fogo",
            range: "Toque (Movimento)",
            desc: "Investida rápida deixando rastro de fogo. Terreno difícil por 2 turnos. Teste Const ou Queimado.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Ganha 12m deslocamento e mira no pescoço (+1 CD Const se fragilizado)."
            ]
        },
        {
            id: 'flame_2',
            name: "Segunda Forma: Nobori Enten",
            cost: 1,
            damage: "2d12 Fogo",
            range: "Toque",
            desc: "Corte rápido de baixo para cima. Teste Const ou Queimado.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Mira no pescoço (+1 CD Const se fragilizado)."
            ]
        },
        {
            id: 'flame_3',
            name: "Terceira Forma: Kien Banjo",
            cost: 1,
            damage: "2d12 Fogo",
            range: "Toque",
            desc: "Similar à segunda, mas de cima para baixo. +6m deslocamento. Terreno difícil (2 turnos). Teste Const ou Queimado.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Golpe extra (1d12 Fogo). +2 na CD Const."
            ]
        },
        {
            id: 'flame_4',
            name: "Quarta Forma: Sei En no Uneri",
            cost: 1,
            damage: "Redução de Dano",
            range: "Toque (Reação)",
            desc: "Reação a ataque corpo a corpo. Reduz o dano recebido em 2d12.",
            evolutions: [
                "Redução aumenta para 3d12.",
                "Redução aumenta para 4d12.",
                "Redução aumenta para 5d12.",
                "Redução 6d12. Ao defender, contra-ataca com 4d10 (Teste Const ou Queimado)."
            ]
        },
        {
            id: 'flame_5',
            name: "Quinta Forma: Enko",
            cost: 1,
            damage: "2d12 Fogo",
            range: "Toque",
            desc: "Golpes poderosos na forma de tigre. Teste Const (Desvantagem) ou Queimado.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Ataque à distância (Linha 9m)."
            ]
        },
        {
            id: 'flame_9_rengoku',
            name: "Nona Forma: Rengoku",
            cost: 2,
            damage: "7d12 Fogo",
            range: "Linha 24m",
            desc: "Salto gigantesco que queima o terreno (difícil 2 turnos). Acerta pescoço. Dano automático de queimadura. Se fragilizado: +1 CD Const. (Nível 20)",
            evolutions: [],
            isSpecial: true,
            reqLevel: 20
        },
        {
            id: 'flame_9_taiyo',
            name: "Nona Forma: Taiyo",
            cost: 2,
            damage: "7d12 Fogo",
            range: "Toque",
            desc: "Múltiplos golpes circulares como um sol. Teste Const para não ter 3 membros decepados + Queimado. (Nível 20 - Alternativa)",
            evolutions: [],
            isSpecial: true,
            reqLevel: 20
        }
    ]
};

// --- STONE ---
const BREATHING_STONE = {
    id: 'stone',
    name: 'Pedra',
    description: 'Robusta e sólida, foca em defesa impenetrável e ataques devastadores com a Kusarigama.',
    forms: [
        {
            id: 'stone_1',
            name: "Primeira Forma: Jamongan Sokyoku",
            cost: 1,
            damage: "2d12 Perfurante",
            range: "Toque",
            desc: "Arremessa ambos os lados da arma. Teste de Constituição para não ter deslocamento reduzido pela metade.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Falha no teste reduz deslocamento a zero."
            ]
        },
        {
            id: 'stone_2',
            name: "Segunda Forma: Tenmen Kudaki",
            cost: 1,
            damage: "1d12 Cortante + 2d12 Concussão",
            range: "Toque",
            desc: "Pisa na corrente para ataque rápido. Teste de Constituição ou perde uma perna.",
            evolutions: [
                "Dano +1d12 (Totais aumentam progressivamente).",
                "Dano aumenta base de Cortante e Concussão.", // Simplifying for automated text
                "Dano massivo de esmagamento.",
                "Dano devastador. Se fragilizada, perde braço ou perna garantido."
            ]
        },
        {
            id: 'stone_3',
            name: "Terceira Forma: Ganko no Hadae",
            cost: 1,
            damage: "Redução de Dano",
            range: "Toque (Reação)",
            desc: "Defensiva. Desfere múltiplos golpes para defender. Reduz 2d10 do dano recebido.",
            evolutions: [
                "Redução aumenta para 3d10.",
                "Redução aumenta para 4d10.",
                "Redução aumenta para 5d10.",
                "Redução 6d10. Se redução > dano original, atacante faz Teste Destreza ou recebe metade do dano."
            ]
        },
        {
            id: 'stone_4',
            name: "Quarta Forma: Ryumongan Sokusei",
            cost: 1,
            damage: "2d12 Cortante",
            range: "Toque",
            desc: "Segura nas correntes atacando com força total. Teste Const ou perde um braço.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Teste Const ou deslocamento zero."
            ]
        },
        {
            id: 'stone_5',
            name: "Quinta Forma: Garin Gyobu",
            cost: 1,
            damage: "2d12 Cortante",
            range: "Toque",
            desc: "Ataque de precisão p/ cortar pescoço. Se fragilizada, +1 Dificuldade Const.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Teste Resistência Constituição para não perder perna se Destruidor no máximo."
            ]
        },
        {
            id: 'stone_6_jishin',
            name: "Sexta Forma: Jishin",
            cost: 2,
            damage: "7d10 Concussão",
            range: "Cilindro 10m",
            desc: "Múltiplos ataques no chão, tremor em área. Todos fazem Teste Destreza ou Caído.",
            evolutions: [],
            isSpecial: true,
            reqLevel: 20
        }
    ]
};

// --- WIND ---
const BREATHING_MIST = {
    id: 'mist',
    name: 'Névoa',
    description: 'Derivada do Vento, confunde o oponente com oscilações bruscas de velocidade e ocultação.',
    forms: [
        {
            id: 'mist_1',
            name: "Primeira Forma: Suiten Togasumi",
            cost: 1,
            damage: "2d12 Cortante",
            range: "Toque + 1.5m",
            desc: "Ataque frontal ganhando alcance. Garante mudança para instância 'Velocidade'.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. +3m de alcance."
            ]
        },
        {
            id: 'mist_2',
            name: "Segunda Forma: Kyozan Muken",
            cost: 1,
            damage: "2d10 Cortante",
            range: "Toque",
            desc: "Velocidade: Distribui dano entre inimigos. Desaceleração: Dobro dano estrutura ou Reação para soltar agarrão.",
            evolutions: [
                "Dano aumenta para 3d10.",
                "Dano aumenta para 4d10.",
                "Dano aumenta para 5d10.",
                "Dano 6d10. Pode escolher trocar de instância."
            ]
        },
        {
            id: 'mist_3',
            name: "Terceira Forma: Kasan no Shibuki",
            cost: 1,
            damage: "Redução de Dano",
            range: "Toque (Reação)",
            desc: "Cria névoa para se defender. Reduz 2d12 do dano recebido.",
            evolutions: [
                "Redução aumenta para 3d12.",
                "Redução aumenta para 4d12.",
                "Redução aumenta para 5d12.",
                "Redução 6d12. Pode tentar se esconder (Furtividade) após usar."
            ]
        },
        {
            id: 'mist_4',
            name: "Quarta Forma: Iryuukiri",
            cost: 1,
            damage: "2d12 Cortante",
            range: "Toque",
            desc: "Saque rápido. Única em 'Velocidade'. Se for primeira ação, +5 Acerto e rola dano 2 vezes.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Movimenta-se sem ataques de oportunidade após ataque."
            ]
        },
        {
            id: 'mist_5',
            name: "Quinta Forma: Kaun no Umi",
            cost: 1,
            damage: "2d10 Cortante",
            range: "Toque + 3m Move",
            desc: "Ataque com deslocamento. Se reagirem, pode rolar o dano da técnica contra a reação. Muda para 'Desaceleração'.",
            evolutions: [
                "Dano aumenta para 3d10.",
                "Dano aumenta para 4d10.",
                "Dano aumenta para 5d10.",
                "Dano 6d10. Gaste 1 PE para próximo ataque ser Crítico Automático."
            ]
        },
        {
            id: 'mist_6',
            name: "Sexta Forma: Tsuki n Kashou",
            cost: 1,
            damage: "2d12 Cortante",
            range: "Toque + Salto",
            desc: "Ataque com salto ou queda. Anula dano de queda de até 6m. Apenas 'Desaceleração'.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Gaste 1 PE para impor Desvantagem no próximo ataque do alvo."
            ]
        },
        {
            id: 'mist_7_oboro',
            name: "Sétima Forma: Oboro",
            cost: 2,
            damage: "Nuvem (Buff/Debuff)",
            range: "6m Raio",
            desc: "Cria névoa densa. Terreno difícil, visibilidade reduzida (-5 Percepção). Usa ambas instâncias. Crítico decepa pescoço fácil (+3 Dificuldade).",
            evolutions: [],
            isSpecial: true,
            reqLevel: 20
        }
    ]
};

const BREATHING_WIND = {
    id: 'wind',
    name: 'Vento',
    description: 'Agressiva e versátil, utiliza correntes de ar para infligir danos massivos.',
    forms: [
        {
            id: 'wind_1',
            name: "Primeira Forma: Jin Senpuu - Sogi",
            cost: 1,
            damage: "2d10 Perfurante",
            range: "Linha 9m",
            desc: "Ataque à distância em espiral. Alvo deve passar em Teste de Força ou ser empurrado.",
            evolutions: [
                "Dano aumenta para 3d10.",
                "Dano aumenta para 4d10.",
                "Dano aumenta para 5d10.",
                "Dano 6d10. Acerta todos na área (15m x 3m). Teste de Destreza."
            ]
        },
        {
            id: 'wind_2',
            name: "Segunda Forma: Shinato Kaze",
            cost: 1,
            damage: "2d12 Cortante",
            range: "Toque",
            desc: "Corte vertical com 4 garras de vento. Teste de Destreza para não ter mão decepada.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Agora decepa um braço."
            ]
        },
        {
            id: 'wind_3',
            name: "Terceira Forma: Seiran Fuju",
            cost: 1,
            damage: "Redução de Dano",
            range: "Toque (Reação)",
            desc: "Reação para reduzir dano corpo a corpo em 1d10.",
            evolutions: [
                "Redução aumenta para 3d10.",
                "Redução aumenta para 4d10.",
                "Redução aumenta para 5d10.",
                "Redução 6d10. Se redução > dano, redireciona para inimigo."
            ]
        },
        {
            id: 'wind_4',
            name: "Quarta Forma: Shoujou Sajinran",
            cost: 1,
            damage: "2d12 Cortante",
            range: "Toque",
            desc: "Vários golpes para gerar correntes descendentes. Pode usar como reação para se soltar de agarrão.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Se usado como reação, faz jogada de acerto contra quem agarrou."
            ]
        },
        {
            id: 'wind_5',
            name: "Quinta Forma: Kogarashi Oroshi",
            cost: 1,
            damage: "2d6 Cortante",
            range: "Cilindro 3m (Caindo)",
            desc: "Ataque no ar caindo. Cortes espirais. Teste de Destreza (metade).",
            evolutions: [
                "Dano 3d6, raio 6m.",
                "Dano 4d6, raio 9m.",
                "Dano 5d6, raio 12m.",
                "Dano 6d6, raio 15m. Se falhar, meio movimento (Teste Const)."
            ]
        },
        {
            id: 'wind_6',
            name: "Sexta Forma: Kokufuu Enran",
            cost: 1,
            damage: "2d12 Cortante",
            range: "Toque",
            desc: "Movimento ascendente de tornado. Teste de Destreza para não perder perna.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Se errar, nova rolagem para acertar braço (Teste Const decepa)."
            ]
        },
        {
            id: 'wind_7',
            name: "Sétima Forma: Tengu Kaze",
            cost: 1,
            damage: "2d12 Cortante",
            range: "Toque",
            desc: "Golpes no ar. +4m salto, sofre dano de queda. Dano dobrado em estruturas.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Acerto obriga Teste de Const para não perder perna."
            ]
        },
        {
            id: 'wind_8',
            name: "Oitava Forma: Rekkaza Kiri",
            cost: 1,
            damage: "2d12 Cortante",
            range: "Toque",
            desc: "Imenso turbilhão. Ganha +6m deslocamento e acaba atrás do inimigo. Inimigo faz Teste Const ou sofre corte profundo.",
            evolutions: [
                "Dano aumenta para 3d12.",
                "Dano aumenta para 4d12.",
                "Dano aumenta para 5d12.",
                "Dano 6d12. Se falhar no primeiro teste, segundo Teste de Força ou corpo decepado."
            ]
        },
        {
            id: 'wind_9',
            name: "Nona Forma: Idaten Taifuu",
            cost: 1,
            damage: "2d10 Perfurante",
            range: "Linha 9m",
            desc: "Salta e desfere golpes perfurantes. Teste de Destreza (metade).",
            evolutions: [
                "Dano aumenta para 3d10.",
                "Dano aumenta para 4d10.",
                "Dano aumenta para 5d10.",
                "Dano 6d10. Falha também perde metade do deslocamento."
            ]
        },
        {
            id: 'wind_10_special',
            name: "Técnica Especial (Ex: Storm/Fujin/Etc)",
            cost: 2,
            damage: "7d10 Variável",
            range: "Variável",
            desc: "Técnica de Nível 20 (Storm, Fujin, Seiran Fujin ou Hasagi). Escolha do usuário.",
            evolutions: [],
            isSpecial: true,
            reqLevel: 20
        }
    ]
};

if (typeof window !== 'undefined') {
    window.BreathingDB = {
        water: BREATHING_WATER,
        thunder: BREATHING_THUNDER,
        beast: BREATHING_BEAST,
        flame: BREATHING_FLAME,
        wind: BREATHING_WIND,
        stone: BREATHING_STONE,
        mist: BREATHING_MIST
    };
}
