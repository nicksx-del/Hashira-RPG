/**
 * BESTIARY DATABASE
 * Contains standard creatures from the Demon Slayer RPG Handbook.
 */

window.BestiaryDB = [
    {
        id: "oni_1",
        name: "Oni (Nível 1)",
        type: "Humanóide Médio (Caótico e Mal)",
        cr: 1,
        xp: 200,
        hp: 40,
        maxHP: 40, // 6d8 + 10
        ac: 11,
        speed: "9m",
        stats: {
            str: 11, dex: 12, con: 12, int: 8, wis: 8, cha: 5
        },
        skills: "Percepção +1",
        senses: "Percepção às cegas 6m, Passiva 9",
        immunities: ["Exaustão"],
        vulnerabilities: ["Dano Primordial"],
        traits: [
            {
                name: "Fragilização",
                desc: "Quando fragilizado, teste de CON (CD 16 inicial) para evitar decapitação."
            }
        ],
        actions: [
            {
                name: "Garras",
                type: "melee",
                bonus: 3,
                damage: "1d6 + 1",
                dmgType: "cortante",
                desc: "Alcance 1,5m, um alvo."
            },
            {
                name: "Mordida",
                type: "melee",
                bonus: 3,
                damage: "1d6 + 1",
                dmgType: "perfurante",
                desc: "Alcance 1,5m, um alvo."
            }
        ]
    },
    {
        id: "swamp_demon",
        name: "Demônio do Pântano",
        type: "Oni (Kekkijutsu)",
        cr: 2,
        xp: 450,
        hp: 65,
        maxHP: 65,
        ac: 13,
        speed: "9m",
        stats: { str: 14, dex: 14, con: 14, int: 10, wis: 10, cha: 8 },
        actions: [
            { name: "Pântano Negro", type: "special", desc: "Cria uma poça de escuridão que permite transporte rápido." },
            { name: "Garra Lamacenta", type: "melee", bonus: 5, damage: "2d6 + 2", dmgType: "cortante" }
        ]
    },
    {
        id: "hand_demon",
        name: "Demônio das Mãos",
        type: "Oni Grande",
        cr: 4,
        xp: 1100,
        hp: 120,
        maxHP: 120,
        ac: 15,
        speed: "6m",
        stats: { str: 18, dex: 10, con: 18, int: 9, wis: 11, cha: 6 },
        actions: [
            { name: "Esmagar", type: "melee", bonus: 7, damage: "2d10 + 4", dmgType: "concussão" },
            { name: "Agarra Múltipla", type: "special", desc: "Pode agarrar até 3 alvos simultaneamente." }
        ]
    }
];
