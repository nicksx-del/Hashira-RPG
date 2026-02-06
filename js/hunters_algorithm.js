// HUNTER CLASS ALGORITHM (Level 1-20)
/* 
  Data source: User provided images for "Demon Slayer RPG - Class Table & Features"
*/

const CLASS_TABLE = [
    { level: 1, prof: 2, pe: 1, features: ["Domínio", "Resiliente"] },
    { level: 2, prof: 2, pe: 2, features: ["Especialização", "Kaifuku"] },
    { level: 3, prof: 2, pe: 3, features: ["Técnicas de Respiração", "Mizu \"Única\""] },
    { level: 4, prof: 2, pe: 4, features: ["Incremento no Valor de Habilidade"] },
    { level: 5, prof: 3, pe: 5, features: ["Ataque Extra", "Controle de Danos"] },
    { level: 6, prof: 3, pe: 6, features: ["Ataque de Oportunidade Focado"] },
    { level: 7, prof: 3, pe: 7, features: ["Evolução da Respiração (1)"] },
    { level: 8, prof: 3, pe: 8, features: ["Incremento no Valor de Habilidade"] },
    { level: 9, prof: 4, pe: 9, features: ["Kaisui \"Única\""] },
    { level: 10, prof: 4, pe: 10, features: ["Evolução da Respiração (2)"] },
    { level: 11, prof: 4, pe: 11, features: ["Ataque Extra (2)"] },
    { level: 12, prof: 4, pe: 12, features: ["Incremento no Valor de Habilidade"] },
    { level: 13, prof: 5, pe: 13, features: ["Evolução da Respiração (3)"] },
    { level: 14, prof: 5, pe: 14, features: ["Sukiru Mizu \"Única\""] },
    { level: 15, prof: 5, pe: 15, features: ["Potencialização Suprema"] },
    { level: 16, prof: 5, pe: 16, features: ["Incremento no Valor de Habilidade"] },
    { level: 17, prof: 6, pe: 17, features: ["Evolução da Respiração (4)"] },
    { level: 18, prof: 6, pe: 18, features: ["Resiliência Eterna"] },
    { level: 19, prof: 6, pe: 19, features: ["Incremento no Valor de Habilidade"] },
    { level: 20, prof: 6, pe: 20, features: ["Técnica Especial da Respiração"] }
];

const FEAT_DESCRIPTIONS = {
    // LEVEL 1
    "Domínio": "Ao rolar 1 ou 2 num dado de dano de ataque com arma corpo-a-corpo (duas mãos/versátil), você pode rolar novamente e usar a nova rolagem.",
    "Resiliente": "Pode refazer um teste de resistência falho por descanso longo. No 10º nível, 2 vezes. No 15º nível, 3 vezes.",

    // LEVEL 2
    "Especialização": "Escolha duas perícias para ser proficiente, ou dobre o bônus em uma já proficiente.",
    "Kaifuku": "Recupera energias mais rápido: Descanso Longo em 4h, Descanso Curto em 1h. Obtém benefícios completos.",

    // LEVEL 3
    "Técnicas de Respiração": "Aprende as Respirações de sua classe. Ganha evoluções nos níveis 7, 10, 13 e 17.",
    "Mizu \"Única\"": "Escolha entre:\nOFENSIVO: Ação bônus atk corpo-a-corpo (+1 acerto/dano). Ganha 3m deslocamento. (Nv 12: +2 acerto/dano).\nDEFENSIVO: Reduz dano em 1d8 (1d12 no Nv 10, 2d10 no Nv 15). +1 CA (Nv 12: +2 CA, Nv 15: +3 CA).",

    // LEVEL 4, 8, 12, 16, 19
    "Incremento no Valor de Habilidade": "Aumenta um valor de habilidade em 2 ou dois em 1 (Máx 20).",

    // LEVEL 5
    "Ataque Extra": "Pode atacar duas vezes com a ação de Ataque. (Três vezes no Nv 11).",
    "Controle de Danos": "Ação Bônus: Elimina fadiga e ganha PV temporários (1d8 + Con). Aumenta para 1d12 (Nv 9) e 2d12 (Nv 15). Usos igual proficiência/descanso longo.",

    // LEVEL 6
    "Ataque de Oportunidade Focado": "Reação quando inimigo sai do alcance: Realiza ataque que interrompe o movimento da criatura. Você pode se mover metade do seu deslocamento.",

    // LEVEL 9
    "Kaisui \"Única\"": "Adquire uma característica especial herdada (Mestre/Inimigo). Escolha uma habilidade de outra classe/subclasse de 3º nível.",

    // LEVEL 11
    "Ataque Extra (2)": "Pode atacar três vezes com a ação de Ataque.",

    // LEVEL 14
    "Sukiru Mizu \"Única\"": "Pode usar técnicas de respiração sem custo de energia (Qtd = proficiência). Recupera em descanso longo. Se usar fadigado, não custa energia mas aumenta fadiga + custo normal no próximo.",

    // LEVEL 15
    "Potencialização Suprema": "Pode rolar novamente dois dados de dano por turno em suas Técnicas de Respiração.",

    // LEVEL 18
    "Resiliência Eterna": "No começo do turno, se estiver com menos da metade dos PV (e > 0), recupera 15 + Mod. Constituição.",

    // LEVEL 20
    "Técnica Especial da Respiração": "Atinge o domínio total, desbloqueando a 11ª Forma Suprema da Respiração."
};

function getLevelData(level) {
    if (level < 1) level = 1;
    if (level > 20) level = 20;
    return CLASS_TABLE[level - 1];
}

function calculateMaxPE(level) {
    return level;
}

function calculateProficiency(level) {
    const data = getLevelData(level);
    return data ? data.prof : 2;
}

function getFeaturesUpTo(level) {
    let features = [];
    for (let i = 1; i <= level; i++) {
        const data = getLevelData(i);
        if (data && data.features) {
            features = [...features, ...data.features];
        }
    }
    return features;
}

if (typeof window !== 'undefined') {
    window.HunterSystem = {
        getLevelData,
        calculateMaxPE,
        calculateProficiency,
        getFeaturesUpTo,
        FEAT_DESCRIPTIONS
    };
}
