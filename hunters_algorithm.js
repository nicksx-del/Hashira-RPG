// HUNTER CLASS ALGORITHM (Level 1-20)

/* 
  Data source: User provided images for "Demon Slayer RPG" class table.
  Features include: Domínio, Resiliente, Kaifuku, Extra Attack, etc.
*/

const CLASS_TABLE = [
    { level: 1, prof: 2, pe: 1, features: ["Domínio", "Resiliente"] },
    { level: 2, prof: 2, pe: 2, features: ["Especialização", "Kaifuku"] },
    { level: 3, prof: 2, pe: 3, features: ["Técnicas de Respiração", "Mizu 'Única'"] },
    { level: 4, prof: 2, pe: 4, features: ["Incremento no Valor de Habilidade"] },
    { level: 5, prof: 3, pe: 5, features: ["Ataque Extra", "Controle de Danos"] },
    { level: 6, prof: 3, pe: 6, features: ["Ataque de Oportunidade Focado"] },
    { level: 7, prof: 3, pe: 7, features: ["Evolução da Respiração (1)"] },
    { level: 8, prof: 3, pe: 8, features: ["Incremento no Valor de Habilidade"] },
    { level: 9, prof: 4, pe: 9, features: ["Kaisui 'Única'"] },
    { level: 10, prof: 4, pe: 10, features: ["Evolução da Respiração (2)"] },
    { level: 11, prof: 4, pe: 11, features: ["Ataque Extra (2)"] },
    { level: 12, prof: 4, pe: 12, features: ["Incremento no Valor de Habilidade"] },
    { level: 13, prof: 5, pe: 13, features: ["Evolução da Respiração (3)"] },
    { level: 14, prof: 5, pe: 14, features: ["Sukiru Mizu 'Única'"] },
    { level: 15, prof: 5, pe: 15, features: ["Potencialização Suprema"] },
    { level: 16, prof: 5, pe: 16, features: ["Incremento no Valor de Habilidade"] },
    { level: 17, prof: 6, pe: 17, features: ["Evolução da Respiração (4)"] },
    { level: 18, prof: 6, pe: 18, features: ["Resiliência Eterna"] },
    { level: 19, prof: 6, pe: 19, features: ["Incremento no Valor de Habilidade"] },
    { level: 20, prof: 6, pe: 20, features: ["Técnica Especial da Respiração"] }
];

const FEAT_DESCRIPTIONS = {
    "Domínio": "Rolar 1 ou 2 no dado de dano permite rerolar (uma vez).",
    "Resiliente": "Refazer um teste de resistência falho por descanso longo.",
    "Especialização": "Escolha duas perícias para dobrar a proficiência.",
    "Kaifuku": "Descanso curto recupera como longo (4h) e longo em 1h.",
    "Técnicas de Respiração": "Acesso às Formas de Respiração (Nv 3).",
    "Mizu 'Única'": "Estilo Ofensivo (+1 atk/dano, ação bônus atk) ou Defensivo (Reduz dano, +1 CA).",
    "Ataque Extra": "Pode atacar duas vezes com a ação de Ataque.",
    "Controle de Danos": "Gasta proficiência para ganhar PV temporário (1d8+Con).",
    "Ataque de Oportunidade Focado": "Ataque de oportunidade interrompe movimento e reduz deslocamento.",
    "Kaisui 'Única'": "Característica especial herdada (Mestre/Inimigo).",
    "Potencialização Suprema": "Rerolar dados de dano de respiração.",
    "Resiliência Eterna": "Recupera 15+Con PV por turno se < metade PV.",
    "Técnica Especial da Respiração": "Cria uma nova forma personalizada."
};

function getLevelData(level) {
    if (level < 1) level = 1;
    if (level > 20) level = 20;
    return CLASS_TABLE[level - 1];
}

function calculateMaxPE(level) {
    // According to table, PE matches Level exactly from 1 to 20
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

// Export for usage
if (typeof window !== 'undefined') {
    window.HunterSystem = {
        getLevelData,
        calculateMaxPE,
        calculateProficiency,
        getFeaturesUpTo,
        FEAT_DESCRIPTIONS
    };
}
