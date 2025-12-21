const ITEMS_DB = {
    weapons: [
        // --- Armas Simples Corpo-a-Corpo ---
        { name: "Adaga", type: "weapon", dmg: "1d4 perfurante", props: "Acuidade, leve, arremesso (6/18), Decepadora", weight: "0.5 kg", price: "20 Y" },
        { name: "Azagaia", type: "weapon", dmg: "1d6 perfurante", props: "Arremesso (9/36), Decepadora", weight: "1.0 kg", price: "5 Y" },
        { name: "Bordão", type: "weapon", dmg: "1d6 concussão", props: "Versátil (1d8)", weight: "2.0 kg", price: "10 Y" },
        { name: "Foice Curta", type: "weapon", dmg: "1d4 cortante", props: "Leve, Decepadora", weight: "1.0 kg", price: "10 Y" },
        { name: "Lança", type: "weapon", dmg: "1d6 perfurante", props: "Arremesso (6/18), versátil (1d8), Decepadora", weight: "1.5 kg", price: "50 Y" },
        { name: "Maça", type: "weapon", dmg: "1d6 perfurante", props: "-", weight: "2.0 kg", price: "40 Y" },
        { name: "Machadinha", type: "weapon", dmg: "1d6 cortante", props: "Leve, arremesso (6/18), Decepadora", weight: "1.0 kg", price: "10 Y" },
        { name: "Martelo Leve", type: "weapon", dmg: "1d4 concussão", props: "Leve, arremesso (6/18)", weight: "1.0 kg", price: "20 Y" },
        { name: "Porrete", type: "weapon", dmg: "1d4 concussão", props: "Leve", weight: "1.0 kg", price: "1 Y" },

        // --- Armas Simples à Distância ---
        { name: "Arco Curto", type: "weapon", dmg: "1d6 perfurante", props: "Munição (24/96), duas mãos", weight: "1.0 kg", price: "70 Y" },
        { name: "Besta Leve", type: "weapon", dmg: "1d8 perfurante", props: "Munição (24/96), recarga, duas mãos", weight: "2.5 kg", price: "70 Y" },
        { name: "Dardo", type: "weapon", dmg: "1d4 perfurante", props: "Acuidade, arremesso (6/18)", weight: "0.1 kg", price: "0.5 Y" },
        { name: "Funda", type: "weapon", dmg: "1d4 concussão", props: "Munição (9/36)", weight: "-", price: "0.1 Y" },

        // --- Armas Marciais Corpo-a-Corpo ---
        { name: "Cimitarra", type: "weapon", dmg: "1d6 cortante", props: "Acuidade, leve, Decepadora", weight: "1.5 kg", price: "50 Y" },
        { name: "Chicote", type: "weapon", dmg: "1d4 cortante", props: "Acuidade, alcance, Decepadora", weight: "1.5 kg", price: "2 Y" },
        { name: "Espada Curta", type: "weapon", dmg: "1d6 perfurante", props: "Acuidade, leve, Decepadora", weight: "1.0 kg", price: "50 Y" },
        { name: "Espada Longa", type: "weapon", dmg: "1d8 cortante", props: "Versátil (1d10), Decepadora", weight: "1.5 kg", price: "150 Y" },
        { name: "Maça Estrela", type: "weapon", dmg: "1d8 perfurante", props: "Decepadora", weight: "2.0 kg", price: "150 Y" },
        { name: "Machado de Batalha", type: "weapon", dmg: "1d8 cortante", props: "Versátil (1d10), Decepadora", weight: "2.0 kg", price: "100 Y" },
        { name: "Mangual", type: "weapon", dmg: "1d8 concussão", props: "-", weight: "1.0 kg", price: "100 Y" },
        { name: "Martelo de Guerra", type: "weapon", dmg: "1d8 concussão", props: "Versátil (1d10)", weight: "1.0 kg", price: "150 Y" },
        { name: "Picareta de Guerra", type: "weapon", dmg: "1d8 perfurante", props: "Decepadora", weight: "1.0 kg", price: "50 Y" },
        { name: "Rapieira", type: "weapon", dmg: "1d8 perfurante", props: "Acuidade, Decepadora", weight: "1.0 kg", price: "25 Y" },
        { name: "Tridente", type: "weapon", dmg: "1d6 perfurante", props: "Arremesso (6/18), versátil (1d8), Decepadora", weight: "2.0 kg", price: "100 Y" },

        // --- Armas Pesadas ---
        { name: "Alabarda", type: "weapon", dmg: "1d10 cortante", props: "Pesada, alcance, duas mãos, Decepadora", weight: "3.0 kg", price: "100 Y" },
        { name: "Clava Grande", type: "weapon", dmg: "1d8 concussão", props: "Pesada, duas mãos", weight: "5.0 kg", price: "20 Y" },
        { name: "Espada Grande", type: "weapon", dmg: "2d6 perfurante", props: "Pesada, duas mãos, Decepadora", weight: "3.0 kg", price: "150 Y" },
        { name: "Glaive", type: "weapon", dmg: "1d10 cortante", props: "Pesada, alcance, duas mãos, Decepadora", weight: "3.0 kg", price: "70 Y" },
        { name: "Lança Longa", type: "weapon", dmg: "1d10 perfurante", props: "Pesada, alcance, duas mãos, Decepadora", weight: "4.0 kg", price: "50 Y" },
        { name: "Machado Grande", type: "weapon", dmg: "1d12 cortante", props: "Pesada, duas mãos, Decepadora", weight: "3.5 kg", price: "150 Y" },
        { name: "Malho", type: "weapon", dmg: "2d6 concussão", props: "Pesada, duas mãos", weight: "5.0 kg", price: "100 Y" },

        // --- Armas Marciais à Distância ---
        { name: "Arco Longo", type: "weapon", dmg: "1d8 perfurante", props: "Munição (45/180), pesada, duas mãos", weight: "1.0 kg", price: "100 Y" },
        { name: "Besta de Mão", type: "weapon", dmg: "1d6 perfurante", props: "Munição (9/36), leve, recarga", weight: "1.5 kg", price: "75 Y" },
        { name: "Besta Pesada", type: "weapon", dmg: "1d10 perfurante", props: "Munição (45/180), pesada, recarga, duas mãos", weight: "4.5 kg", price: "100 Y" },
        { name: "Rede", type: "weapon", dmg: "-", props: "Especial, arremesso (1.5/4.5)", weight: "1.5 kg", price: "10 Y" },
        { name: "Zarabata", type: "weapon", dmg: "1 perfurante", props: "Munição (7.5/30), recarga", weight: "0.5 kg", price: "100 Y" },

        // --- Armas Únicas ---
        { name: "Chakram", type: "weapon", dmg: "1d6 cortante", props: "Acuidade, Leve, arremesso (30/60), Decepadora", weight: "1.5 kg", price: "50 Y" },
        { name: "Odachi", type: "weapon", dmg: "2d4 cortante", props: "Pesada, duas mãos, Decepadora", weight: "3.0 kg", price: "150 Y" },
        { name: "Katana", type: "weapon", dmg: "1d6 cortante", props: "Acuidade, Leve, Versátil (1d8), Decepadora", weight: "1.5 kg", price: "100 Y" },
        { name: "Kunai", type: "weapon", dmg: "1d4 cort/perf", props: "Acuidade, leve, Decepadora", weight: "0.5 kg", price: "2 Y" },
        { name: "Kusanagi", type: "weapon", dmg: "1d6 cortante", props: "Leve, Decepadora", weight: "1.5 kg", price: "120 Y" },
        { name: "Kusarigama", type: "weapon", dmg: "1d8 cort/con", props: "Acuidade, Duas mãos, Decepadora", weight: "1.0 kg", price: "100 Y" },
        { name: "Heavy Kusarigama", type: "weapon", dmg: "1d10 cort/con", props: "Pesada, Duas mãos, Decepadora", weight: "1.0 kg", price: "150 Y" },
        { name: "Tachi", type: "weapon", dmg: "1d10 cortante", props: "Duas mãos, Decepadora", weight: "2.5 kg", price: "100 Y" },
        { name: "Tessen", type: "weapon", dmg: "1d6 cortante", props: "Acuidade, leve, Decepadora", weight: "1.0 kg", price: "50 Y" },
        { name: "Yumi (Arco)", type: "weapon", dmg: "1d6 perfurante", props: "Munição (45/180), pesada, duas mãos", weight: "0.5 kg", price: "150 Y" },
        { name: "Senbon", type: "weapon", dmg: "1d4 perfurante", props: "Acuidade, arremesso (6/18)", weight: "0.1 kg", price: "0.5 Y" },
        { name: "Shanken", type: "weapon", dmg: "1d4 perfurante", props: "Acuidade, arremesso (6/18)", weight: "0.1 kg", price: "0.5 Y" },
        { name: "Shuriken", type: "weapon", dmg: "1d4 perfurante", props: "Acuidade, arremesso (6/18)", weight: "0.1 kg", price: "0.5 Y" },
        { name: "Wakizashi", type: "weapon", dmg: "1d4 perfurante", props: "Acuidade, leve, Decepadora", weight: "0.5 kg", price: "50 Y" }
    ],
    armor: [
        // --- Uniformes Leves ---
        { name: "Uniforme", type: "armor", ac: "11 + Des", def_bonus: "0", props: "Leve", weight: "4 kg", price: "100,000 Y" },
        { name: "Uniforme +1", type: "armor", ac: "12 + Des", def_bonus: "1", props: "Leve", weight: "4 kg", price: "300,000 Y" },
        { name: "Uniforme +2", type: "armor", ac: "13 + Des", def_bonus: "2", props: "Leve", weight: "4 kg", price: "500,000 Y" },
        { name: "Uniforme +3", type: "armor", ac: "14 + Des", def_bonus: "3", props: "Leve", weight: "5 kg", price: "900,000 Y" },

        // --- Uniformes Médios ---
        { name: "Uniforme M", type: "armor", ac: "12 + Des", def_bonus: "0", props: "Médio", weight: "8 kg", price: "100,000 Y" },
        { name: "Uniforme M +1", type: "armor", ac: "13 + Des", def_bonus: "1", props: "Médio, Desvantagem Furtividade", weight: "8 kg", price: "500,000 Y" },
        { name: "Uniforme M +2", type: "armor", ac: "14 + Des", def_bonus: "2", props: "Médio, Desvantagem Furtividade", weight: "8 kg", price: "900,000 Y" },
        { name: "Uniforme M +3", type: "armor", ac: "15 + Des", def_bonus: "3", props: "Médio, Desvantagem Furtividade", weight: "8 kg", price: "1,500,000 Y" },

        // --- Uniformes Pesados ---
        { name: "Uniforme P", type: "armor", ac: "17", def_bonus: "0", props: "Pesado, For 12, Desv. Furtividade", weight: "10 kg", price: "100,000 Y" },
        { name: "Uniforme P +1", type: "armor", ac: "18", def_bonus: "1", props: "Pesado, For 14, Desv. Furtividade", weight: "10 kg", price: "500,000 Y" },
        { name: "Uniforme P +2", type: "armor", ac: "19", def_bonus: "2", props: "Pesado, For 16, Desv. Furtividade", weight: "10 kg", price: "900,000 Y" },
        { name: "Uniforme P +3", type: "armor", ac: "20", def_bonus: "3", props: "Pesado, For 18, Desv. Furtividade", weight: "10 kg", price: "1,500,000 Y" },

        // --- Uniforme Hashira ---
        { name: "Uniforme H", type: "armor", ac: "22", def_bonus: "5", props: "Lendário (Hashira)", weight: "-", price: "-" }
    ],
    consumables: [
        { name: "Poção de Cura", type: "consumable", dmg: "2d4+2", props: "Cura PV", weight: "0.5 kg", price: "50 Y", desc: "Uma poção vermelha que cura ferimentos." },
        { name: "Ração de Viagem", type: "consumable", dmg: "-", props: "Nutritivo", weight: "1 kg", price: "5 Y", desc: "Comida seca para um dia." }
    ],
    misc: []
};
