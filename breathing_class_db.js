// BREATHING STYLES AS CLASSES - PROGRESSION DB

const BREATHING_CLASS_DB = {
    // --- VENTO (WIND) ---
    wind: {
        name: "Respiração do Vento",
        hitDie: 10, // d10
        hitDieavg: 6,
        baseHP: 10,
        proficiencies: {
            armor: ["Leve", "Médio"],
            weapons: ["Simples", "Marciais", "Únicas", "Katana"],
            savingThrows: ["dex", "con"], // Destreza, Constituição
            skillsCount: 2,
            skillsList: ["Acrobacia", "Atletismo", "História", "Intimidação", "Natureza", "Percepção", "Sobrevivência"] // Inferido/Genérico
        },
        equipment: {
            weapons: ["Uma Arma Marcial ou Única", "Uma Katana"],
            armor: ["Uniforme Leve ou Médio"]
        },
        levels: {
            1: { pe: 1, fury: 2, features: ["Fúria", "Imparável"] },
            2: { pe: 2, fury: 2, features: ["Manobras"] },
            3: { pe: 3, fury: 2, features: ["Técnicas de Respiração", "Kaze 'Única'"] },
            4: { pe: 4, fury: 2, features: ["Incremento no Valor de Habilidade"] },
            5: { pe: 5, fury: 2, features: ["Ataque Extra", "Defesa Agressiva"] },
            6: { pe: 6, fury: 3, features: ["Ataque de Oportunidade Certeiro"] },
            7: { pe: 7, fury: 3, features: ["Evolução da Respiração"] },
            8: { pe: 8, fury: 3, features: ["Incremento no Valor de Habilidade"] },
            9: { pe: 9, fury: 3, features: ["Taifu 'Única'"] },
            10: { pe: 10, fury: 3, features: ["Evolução da Respiração"] },
            11: { pe: 11, fury: 4, features: ["Ataque Extra (2)", "Dança dos Ventos"] },
            12: { pe: 12, fury: 4, features: ["Incremento no Valor de Habilidade"] },
            13: { pe: 13, fury: 4, features: ["Evolução da Respiração"] },
            14: { pe: 14, fury: 4, features: ["Mestre do Vento 'Única'"] },
            15: { pe: 15, fury: 4, features: ["Reflexos Aprimorados"] },
            16: { pe: 16, fury: 5, features: ["Incremento no Valor de Habilidade"] },
            17: { pe: 17, fury: 5, features: ["Evolução da Respiração"] },
            18: { pe: 18, fury: 5, features: ["Crítico Absoluto"] },
            19: { pe: 19, fury: 5, features: ["Incremento no Valor de Habilidade"] },
            20: { pe: 20, fury: 6, features: ["Técnica Especial da Respiração"] }
        }
    },

    // --- CHAMAS (FLAME) ---
    flame: {
        name: "Respiração das Chamas",
        hitDie: 12, // d12
        hitDieavg: 7,
        baseHP: 12,
        proficiencies: {
            armor: ["Leve", "Médio", "Pesado"],
            weapons: ["Simples", "Marciais", "Pesadas", "Únicas", "Katana"],
            savingThrows: ["str", "cha"], // Força, Carisma
            skillsCount: 2,
            skillsList: ["Atletismo", "Intuição", "Intimidação", "Persuasão", "Religião", "Sobrevivência"]
        },
        equipment: {
            weapons: ["Uma Arma Pesada ou Única", "Uma Katana"],
            armor: ["Uniforme Médio ou Pesado"]
        },
        levels: {
            1: { pe: 1, features: ["Espírito Inabalável", "Encorajar"] },
            2: { pe: 2, features: ["Espírito Defensivo", "Proteção"] },
            3: { pe: 3, features: ["Técnicas de Respiração", "Alma Ardente 'Única'"] },
            4: { pe: 4, features: ["Incremento no Valor de Habilidade"] },
            5: { pe: 5, features: ["Ataque Extra", "Aura de Chamas"] },
            6: { pe: 6, features: ["Ataque de Oportunidade Poderoso"] },
            7: { pe: 7, features: ["Evolução da Respiração"] },
            8: { pe: 8, features: ["Incremento no Valor de Habilidade"] },
            9: { pe: 9, features: ["Fire 'Única'"] },
            10: { pe: 10, features: ["Evolução da Respiração"] },
            11: { pe: 11, features: ["Ataque Forte"] },
            12: { pe: 12, features: ["Incremento no Valor de Habilidade"] },
            13: { pe: 13, features: ["Evolução da Respiração"] },
            14: { pe: 14, features: ["Enkai 'Única'"] },
            15: { pe: 15, features: ["Ampliação da Aura Inabalável"] },
            16: { pe: 16, features: ["Incremento no Valor de Habilidade"] },
            17: { pe: 17, features: ["Evolução da Respiração"] },
            18: { pe: 18, features: ["Espírito Indestrutível"] },
            19: { pe: 19, features: ["Incremento no Valor de Habilidade"] },
            20: { pe: 20, features: ["Técnica Especial da Respiração"] }
        }
    },

    // --- ÁGUA (WATER) - Default/Generic for now ---
    water: {
        name: "Respiração da Água",
        hitDie: 10,
        hitDieavg: 6,
        baseHP: 10,
        proficiencies: {
            armor: ["Leve", "Médio"],
            weapons: ["Simples", "Marciais", "Katana"],
            savingThrows: ["dex", "wis"],
            skillsCount: 2,
            skillsList: ["Acrobacia", "Atletismo", "Intuição", "Percepção"]
        },
        equipment: {
            weapons: ["Uma Katana", "Uma Arma Simples"],
            armor: ["Uniforme Leve"]
        },
        levels: {
            1: { pe: 1, features: ["Fluxo Constante"] },
            // Placeholder logic for others for now
            2: { pe: 2, features: [] }, 3: { pe: 3, features: [] }, 4: { pe: 4, features: [] },
            5: { pe: 5, features: [] }, 6: { pe: 6, features: [] }, 7: { pe: 7, features: [] },
            8: { pe: 8, features: [] }, 9: { pe: 9, features: [] }, 10: { pe: 10, features: [] },
            11: { pe: 11, features: [] }, 12: { pe: 12, features: [] }, 13: { pe: 13, features: [] },
            14: { pe: 14, features: [] }, 15: { pe: 15, features: [] }, 16: { pe: 16, features: [] },
            17: { pe: 17, features: [] }, 18: { pe: 18, features: [] }, 19: { pe: 19, features: [] },
            20: { pe: 20, features: [] }
        }
    },

    // --- TROVÃO (THUNDER) ---
    thunder: {
        name: "Respiração do Trovão",
        hitDie: 8, // d8
        hitDieavg: 5,
        baseHP: 8,
        proficiencies: {
            armor: ["Leve", "Médio"],
            weapons: ["Simples", "Marciais", "Katana"],
            savingThrows: ["dex", "wis"],
            skillsCount: 2,
            skillsList: ["Acrobacia", "Atletismo", "Intuição", "Investigação", "Natureza", "Percepção", "Sobrevivência"]
        },
        equipment: {
            weapons: ["Uma Arma Simples", "Uma Katana"],
            armor: ["Uniforme Leve ou Médio"]
        },
        levels: {
            1: { pe: 1, move: 3, features: ["Golpe Tempestuoso", "Movimento Trovejante"] },
            2: { pe: 2, move: 3, features: ["Desviar", "Passo Elétrico"] },
            3: { pe: 3, move: 3, features: ["Técnicas de Respiração", "Caminho do Trovão 'Única'"] },
            4: { pe: 4, move: 3, features: ["Incremento no Valor de Habilidade"] },
            5: { pe: 5, move: 3, features: ["Ataque Extra"] },
            6: { pe: 6, move: 4.5, features: ["Ataque de Oportunidade Ágil"] },
            7: { pe: 7, move: 4.5, features: ["Evolução da Respiração"] },
            8: { pe: 8, move: 4.5, features: ["Incremento no Valor de Habilidade"] },
            9: { pe: 9, move: 4.5, features: ["Discharge 'Única'"] },
            10: { pe: 10, move: 6, features: ["Evolução da Respiração"] },
            11: { pe: 11, move: 6, features: ["Ataque Extra (2)"] },
            12: { pe: 12, move: 6, features: ["Incremento no Valor de Habilidade"] },
            13: { pe: 13, move: 6, features: ["Evolução da Respiração"] },
            14: { pe: 14, move: 7.5, features: ["Kaminari 'Única'"] },
            15: { pe: 15, move: 7.5, features: ["Golpe Tempestuoso Aprimorado"] },
            16: { pe: 16, move: 7.5, features: ["Incremento no Valor de Habilidade"] },
            17: { pe: 17, move: 7.5, features: ["Evolução da Respiração"] },
            18: { pe: 18, move: 9, features: ["Velocidade Absoluta"] },
            19: { pe: 19, move: 9, features: ["Incremento no Valor de Habilidade"] },
            20: { pe: 20, move: 9, features: ["Técnica Especial da Respiração"] }
        }
    },

    // --- FERA (BEAST) ---
    beast: {
        name: "Respiração da Fera",
        hitDie: 12,
        hitDieavg: 7,
        baseHP: 12,
        proficiencies: {
            armor: ["Leve", "Sem Armadura"],
            weapons: ["Duas Katanas Serrilhadas", "Marciais"],
            savingThrows: ["str", "con"],
            skillsCount: 2,
            skillsList: ["Atletismo", "Intimidação", "Percepção", "Sobrevivência"]
        },
        equipment: {
            weapons: ["Duas Katanas Serrilhadas"],
            armor: ["Uniforme Customizado (Peles)"]
        },
        levels: {
            1: { pe: 1, features: ["Sentidos Aguçados"] },
            2: { pe: 2, features: [] }, 3: { pe: 3, features: [] }, 4: { pe: 4, features: [] },
            5: { pe: 5, features: [] }, 6: { pe: 6, features: [] }, 7: { pe: 7, features: [] },
            8: { pe: 8, features: [] }, 9: { pe: 9, features: [] }, 10: { pe: 10, features: [] },
            11: { pe: 11, features: [] }, 12: { pe: 12, features: [] }, 13: { pe: 13, features: [] },
            14: { pe: 14, features: [] }, 15: { pe: 15, features: [] }, 16: { pe: 16, features: [] },
            17: { pe: 17, features: [] }, 18: { pe: 18, features: [] }, 19: { pe: 19, features: [] },
            20: { pe: 20, features: [] }
        }
    }
};

const FEATURE_DESCRIPTIONS = {
    "Incremento no Valor de Habilidade": "Pode aumentar atributos: +2 em um ou +1 em dois (max 20).",
    "Ataque Extra": "Realiza um ataque adicional com a ação Atacar.",
    "Evolução da Respiração": "Suas formas causam mais dano ou têm efeitos ampliados.",
    "Técnicas de Respiração": "Aprende novas formas de combate.",
    "Fúria": "Vantagem em Força e resistência a danos físicos durante o combate.",
    "Imparável": "Pode continuar lutando mesmo com 0 PV (teste de CON).",
    "Manobras": "Dados de superioridade para executar técnicas táticas.",
    "Kaze 'Única'": "Técnica de vento que ataca à distância.",
    "Espírito Inabalável": "Imune a medo e encanto.",
    "Encorajar": "Ação bônus para dar PV temporários a aliado.",
    "Espírito Defensivo": "Reduz dano recebido.",
    "Proteção": "Impõe desvantagem em ataques contra aliados adjacentes.",
    "Alma Ardente 'Única'": "Lâmina causa dano extra de fogo.",
    "Golpe Tempestuoso": "Dano extra no primeiro ataque do turno.",
    "Movimento Trovejante": "+3m de deslocamento.",
    "Desviar": "Ação bônus: Desengajar ou Esconder.",
    "Passo Elétrico": "Teletransporte curto.",
    "Caminho do Trovão 'Única'": "Imunidade temporária a dano ao se mover.",
    "Fluxo Constante": "Reação para aumentar CA.",
    "Sentidos Aguçados": "Vantagem em Percepção (olfato/audição)."
};

window.BREATHING_CLASS_DB = BREATHING_CLASS_DB;
window.FEATURE_DESCRIPTIONS = FEATURE_DESCRIPTIONS;
