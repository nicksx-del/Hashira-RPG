const ITEMS_DB = {
    weapons: [
        // --- Armas Simples Corpo-a-Corpo ---
        { name: "Adaga", type: "weapon", subType: "simple_melee", dmg: "1d4 perfurante", props: "Acuidade, leve, arremesso (6/18), Decepadora", weight: "0.5 kg", price: "20 Y" },
        { name: "Azagaia", type: "weapon", subType: "simple_melee", dmg: "1d6 perfurante", props: "Arremesso (9/36), Decepadora", weight: "1.0 kg", price: "5 Y" },
        { name: "Bordão", type: "weapon", subType: "simple_melee", dmg: "1d6 concussão", props: "Versátil (1d8)", weight: "2.0 kg", price: "10 Y" },
        { name: "Foice Curta", type: "weapon", subType: "simple_melee", dmg: "1d4 cortante", props: "Leve, Decepadora", weight: "1.0 kg", price: "10 Y" },
        { name: "Lança", type: "weapon", subType: "simple_melee", dmg: "1d6 perfurante", props: "Arremesso (6/18), versátil (1d8), Decepadora", weight: "1.5 kg", price: "50 Y" },
        { name: "Maça", type: "weapon", subType: "simple_melee", dmg: "1d6", props: "-", weight: "2.0 kg", price: "40 Y" },
        { name: "Machadinha", type: "weapon", subType: "simple_melee", dmg: "1d6 cortante", props: "Leve, arremesso (6/18), Decepadora", weight: "1.0 kg", price: "10 Y" },
        { name: "Martelo Leve", type: "weapon", subType: "simple_melee", dmg: "1d4 concussão", props: "Leve, arremesso (6/18)", weight: "1.0 kg", price: "20 Y" },
        { name: "Porrete", type: "weapon", subType: "simple_melee", dmg: "1d4 concussão", props: "Leve", weight: "1.0 kg", price: "1 Y" },

        // --- Armas Simples à Distância ---
        { name: "Arco Curto", type: "weapon", subType: "simple_ranged", dmg: "1d6 perfurante", props: "Munição (24/96), duas mãos", weight: "1.0 kg", price: "70 Y" },
        { name: "Besta Leve", type: "weapon", subType: "simple_ranged", dmg: "1d8 perfurante", props: "Munição (24/96), recarga, duas mãos", weight: "2.5 kg", price: "70 Y" },
        { name: "Dardo", type: "weapon", subType: "simple_ranged", dmg: "1d4 perfurante", props: "Acuidade, arremesso (6/18)", weight: "0.1 kg", price: "0.5 Y" },
        { name: "Funda", type: "weapon", subType: "simple_ranged", dmg: "1d4 concussão", props: "Munição (9/36)", weight: "-", price: "0.1 Y" },

        // --- Armas Marciais Corpo-a-Corpo ---
        { name: "Cimitarra", type: "weapon", subType: "martial_melee", dmg: "1d6 cortante", props: "Acuidade, leve, Decepadora", weight: "1.5 kg", price: "50 Y" },
        { name: "Chicote", type: "weapon", subType: "martial_melee", dmg: "1d4 cortante", props: "Acuidade, alcance, Decepadora", weight: "1.5 kg", price: "2 Y" },
        { name: "Espada Curta", type: "weapon", subType: "martial_melee", dmg: "1d6 perfurante", props: "Acuidade, leve, Decepadora", weight: "1.0 kg", price: "50 Y" },
        { name: "Espada Longa", type: "weapon", subType: "martial_melee", dmg: "1d8 cortante", props: "Versátil (1d10), Decepadora", weight: "1.5 kg", price: "150 Y" },
        { name: "Maça Estrela", type: "weapon", subType: "martial_melee", dmg: "1d8 perfurante", props: "Decepadora", weight: "2.0 kg", price: "150 Y" },
        { name: "Machado de Batalha", type: "weapon", subType: "martial_melee", dmg: "1d8 cortante", props: "Versátil (1d10), Decepadora", weight: "2.0 kg", price: "100 Y" },
        { name: "Mangual", type: "weapon", subType: "martial_melee", dmg: "1d8 concussão", props: "-", weight: "1.0 kg", price: "100 Y" },
        { name: "Martelo de Guerra", type: "weapon", subType: "martial_melee", dmg: "1d8 concussão", props: "Versátil (1d10)", weight: "1.0 kg", price: "150 Y" },
        { name: "Picareta de Guerra", type: "weapon", subType: "martial_melee", dmg: "1d8 perfurante", props: "Decepadora", weight: "1.0 kg", price: "50 Y" },
        { name: "Rapieira", type: "weapon", subType: "martial_melee", dmg: "1d8 perfurante", props: "Acuidade, Decepadora", weight: "1.0 kg", price: "25 Y" },
        { name: "Tridente", type: "weapon", subType: "martial_melee", dmg: "1d6 perfurante", props: "Arremesso (6/18), versátil (1d8), Decepadora", weight: "2.0 kg", price: "100 Y" },

        // --- Armas Pesadas ---
        { name: "Alabarda", type: "weapon", subType: "heavy", dmg: "1d10 cortante", props: "Pesada, alcance, duas mãos, Decepadora", weight: "3.0 kg", price: "100 Y" },
        { name: "Clava Grande", type: "weapon", subType: "heavy", dmg: "1d8 concussão", props: "Pesada, duas mãos", weight: "5.0 kg", price: "20 Y" },
        { name: "Espada Grande", type: "weapon", subType: "heavy", dmg: "2d6 perfurante", props: "Pesada, duas mãos, Decepadora", weight: "3.0 kg", price: "150 Y" },
        { name: "Glaive", type: "weapon", subType: "heavy", dmg: "1d10 cortante", props: "Pesada, alcance, duas mãos, Decepadora", weight: "3.0 kg", price: "70 Y" },
        { name: "Lança Longa", type: "weapon", subType: "heavy", dmg: "1d10 perfurante", props: "Pesada, alcance, duas mãos, Decepadora", weight: "4.0 kg", price: "50 Y" },
        { name: "Machado Grande", type: "weapon", subType: "heavy", dmg: "1d12 cortante", props: "Pesada, duas mãos, Decepadora", weight: "3.5 kg", price: "150 Y" },
        { name: "Malho", type: "weapon", subType: "heavy", dmg: "2d6 concussão", props: "Pesada, duas mãos", weight: "5.0 kg", price: "100 Y" },

        // --- Armas Marciais à Distância ---
        { name: "Arco Longo", type: "weapon", subType: "martial_ranged", dmg: "1d8 perfurante", props: "Munição (45/180), pesada, duas mãos", weight: "1.0 kg", price: "100 Y" },
        { name: "Besta de Mão", type: "weapon", subType: "martial_ranged", dmg: "1d6 perfurante", props: "Munição (9/36), leve, recarga", weight: "1.5 kg", price: "75 Y" },
        { name: "Besta Pesada", type: "weapon", subType: "martial_ranged", dmg: "1d10 perfurante", props: "Munição (45/180), pesada, recarga, duas mãos", weight: "4.5 kg", price: "100 Y" },
        { name: "Rede", type: "weapon", subType: "martial_ranged", dmg: "-", props: "Especial, arremesso (1.5/4.5)", weight: "1.5 kg", price: "10 Y" },
        { name: "Zarabata", type: "weapon", subType: "martial_ranged", dmg: "1 perfurante", props: "Munição (7.5/30), recarga", weight: "0.5 kg", price: "100 Y" },

        // --- Armas Únicas ---
        { name: "Chakram", type: "weapon", subType: "unique", dmg: "1d6 cortante", props: "Acuidade, Leve, arremesso (30/60), Decepadora", weight: "1.5 kg", price: "50 Y" },
        { name: "Odachi", type: "weapon", subType: "unique", dmg: "2d4 cortante", props: "Pesada, duas mãos, Decepadora", weight: "3.0 kg", price: "150 Y" },
        { name: "Katana", type: "weapon", subType: "unique", dmg: "1d6 cortante", props: "Acuidade, Leve, Versátil (1d8), Decepadora", weight: "1.5 kg", price: "100 Y" },
        { name: "Kunai", type: "weapon", subType: "unique", dmg: "1d4 cort/perf", props: "Acuidade, leve, Decepadora", weight: "0.5 kg", price: "2 Y" },
        { name: "Kusanagi", type: "weapon", subType: "unique", dmg: "1d6 cortante", props: "Leve, Decepadora", weight: "1.5 kg", price: "120 Y" },
        { name: "Kusarigama", type: "weapon", subType: "unique", dmg: "1d8 cort/con", props: "Acuidade, Duas mãos, Decepadora", weight: "1.0 kg", price: "100 Y" },
        { name: "Heavy Kusarigama", type: "weapon", subType: "unique", dmg: "1d10 cort/con", props: "Pesada, Duas mãos, Decepadora", weight: "1.0 kg", price: "150 Y" },
        { name: "Tachi", type: "weapon", subType: "unique", dmg: "1d10 cortante", props: "Duas mãos, Decepadora", weight: "2.5 kg", price: "100 Y" },
        { name: "Tessen", type: "weapon", subType: "unique", dmg: "1d6 cortante", props: "Acuidade, leve, Decepadora", weight: "1.0 kg", price: "50 Y" },
        { name: "Yumi (Arco)", type: "weapon", subType: "unique", dmg: "1d6 perfurante", props: "Munição (45/180), pesada, duas mãos", weight: "0.5 kg", price: "150 Y" },
        { name: "Senbon", type: "weapon", subType: "unique", dmg: "1d4 perfurante", props: "Acuidade, arremesso (6/18)", weight: "0.1 kg", price: "0.5 Y" },
        { name: "Shanken", type: "weapon", subType: "unique", dmg: "1d4 perfurante", props: "Acuidade, arremesso (6/18)", weight: "0.1 kg", price: "0.5 Y" },
        { name: "Shuriken", type: "weapon", subType: "unique", dmg: "1d4 perfurante", props: "Acuidade, arremesso (6/18)", weight: "0.1 kg", price: "0.5 Y" },
        { name: "Wakizashi", type: "weapon", subType: "unique", dmg: "1d4 perfurante", props: "Acuidade, leve, Decepadora", weight: "0.5 kg", price: "50 Y" },

        // --- Armas de Fogo ---
        { name: "Baioneta", type: "weapon", subType: "firearm", dmg: "2d6 perfurante", props: "Versátil (1d4), recarga (Ação), duas mãos", weight: "3 kg", price: "300 Y" },
        { name: "Espingarda Doze", type: "weapon", subType: "firearm", dmg: "2d6 perfurante", props: "Munição (Range 30/90), pesada, recarga (6, Ação), duas mãos", weight: "3 kg", price: "200 Y" },
        { name: "Espingarda de Dois Canos", type: "weapon", subType: "firearm", dmg: "2d6 perfurante", props: "Munição (Range 30/120), Leve, recarga (2), duas mãos, tiro duplo", weight: "2.5 kg", price: "100 Y" },
        { name: "Mosquete", type: "weapon", subType: "firearm", dmg: "2d6 perfurante", props: "Munição (Range 80/220), recarga (Ação), duas mãos", weight: "5 kg", price: "150 Y" },
        { name: "Pistola", type: "weapon", subType: "firearm", dmg: "1d8 perfurante", props: "Munição (Range 30/120), Leve, recarga (10)", weight: "1.5 kg", price: "50 Y" },
        { name: "Pistola de Dois Canos", type: "weapon", subType: "firearm", dmg: "2d6 perfurante", props: "Munição (Range 30/120), Leve, recarga (6), tiro duplo", weight: "3 kg", price: "75 Y" },
        { name: "Magnum", type: "weapon", subType: "firearm", dmg: "2d6 perfurante", props: "Munição (Range 50/200), recarga (6), pesado", weight: "3 kg", price: "200 Y" },
        { name: "Revolver", type: "weapon", subType: "firearm", dmg: "2d6 perfurante", props: "Munição (Range 50/200), recarga (6)", weight: "1.5 kg", price: "150 Y" },
        { name: "Rifle", type: "weapon", subType: "firearm", dmg: "2d6 perfurante", props: "Munição (Range 100/400), recarga (5), duas mãos", weight: "20 kg", price: "300 Y" }
    ],
    armor: [
        // --- Uniformes Leves ---
        { name: "Uniforme", type: "armor", subType: "light", ac: "11 + Des", def_bonus: "0", props: "Leve", weight: "4 kg", price: "100,000 Y" },
        { name: "Uniforme +1", type: "armor", subType: "light", ac: "12 + Des", def_bonus: "1", props: "Leve", weight: "4 kg", price: "300,000 Y" },
        { name: "Uniforme +2", type: "armor", subType: "light", ac: "13 + Des", def_bonus: "2", props: "Leve", weight: "4 kg", price: "500,000 Y" },
        { name: "Uniforme +3", type: "armor", subType: "light", ac: "14 + Des", def_bonus: "3", props: "Leve", weight: "5 kg", price: "900,000 Y" },

        // --- Uniformes Médios ---
        { name: "Uniforme M", type: "armor", subType: "medium", ac: "12 + Des", def_bonus: "0", props: "Médio", weight: "8 kg", price: "100,000 Y" },
        { name: "Uniforme M +1", type: "armor", subType: "medium", ac: "13 + Des", def_bonus: "1", props: "Médio, Desvantagem Furtividade", weight: "8 kg", price: "500,000 Y" },
        { name: "Uniforme M +2", type: "armor", subType: "medium", ac: "14 + Des", def_bonus: "2", props: "Médio, Desvantagem Furtividade", weight: "8 kg", price: "900,000 Y" },
        { name: "Uniforme M +3", type: "armor", subType: "medium", ac: "15 + Des", def_bonus: "3", props: "Médio, Desvantagem Furtividade", weight: "8 kg", price: "1,500,000 Y" },

        // --- Uniformes Pesados ---
        { name: "Uniforme P", type: "armor", subType: "heavy", ac: "17", def_bonus: "0", props: "Pesado, For 12, Desv. Furtividade", weight: "10 kg", price: "100,000 Y" },
        { name: "Uniforme P +1", type: "armor", subType: "heavy", ac: "18", def_bonus: "1", props: "Pesado, For 14, Desv. Furtividade", weight: "10 kg", price: "500,000 Y" },
        { name: "Uniforme P +2", type: "armor", subType: "heavy", ac: "19", def_bonus: "2", props: "Pesado, For 16, Desv. Furtividade", weight: "10 kg", price: "900,000 Y" },
        { name: "Uniforme P +3", type: "armor", subType: "heavy", ac: "20", def_bonus: "3", props: "Pesado, For 18, Desv. Furtividade", weight: "10 kg", price: "1,500,000 Y" },

        // --- Uniforme Hashira ---
        { name: "Uniforme H", type: "armor", subType: "legendary", ac: "22", def_bonus: "5", props: "Lendário (Hashira)", weight: "-", price: "-" },

        // --- Escudos ---
        { name: "Escudo", type: "armor", subType: "shield", ac: "+2", def_bonus: "2", props: "Escudo (+2 CA)", weight: "3 kg", price: "10 Y" }
    ],
    consumables: [
        { name: "Poção de Cura", type: "consumable", dmg: "2d4+2", props: "Cura PV", weight: "0.5 kg", price: "50 Y", desc: "Uma poção vermelha que cura ferimentos." },
        { name: "Ração de Viagem", type: "consumable", dmg: "-", props: "Nutritivo", weight: "1 kg", price: "5 Y", desc: "Comida seca para um dia." },

        // --- Munições ---
        { name: "Bomba de Mão", type: "consumable", subType: "ammo", dmg: "2d6 fogo", props: "Arremesso", weight: "0.5 kg", price: "1 Y", desc: "Explosivo simples." },
        { name: "Munição Chumbo (20)", type: "consumable", subType: "ammo", dmg: "-", props: "Pistolas/Revólver", weight: "0.5 kg", price: "1 Y" },
        { name: "Munição Rifle (20)", type: "consumable", subType: "ammo", dmg: "-", props: "Rifles/Mosquetes", weight: "0.5 kg", price: "2 Y" },
        { name: "Munição Doze (20)", type: "consumable", subType: "ammo", dmg: "-", props: "Espingardas", weight: "1 kg", price: "1.5 Y" },
        { name: "Balas de Funda (20)", type: "consumable", subType: "ammo", dmg: "-", props: "Funda", weight: "0.5 kg", price: "400 Y" },
        { name: "Flechas (20)", type: "consumable", subType: "ammo", dmg: "-", props: "Arcos", weight: "0.5 kg", price: "1 Y" },
        { name: "Virotes (20)", type: "consumable", subType: "ammo", dmg: "-", props: "Bestas", weight: "0.5 kg", price: "1 Y" },
        { name: "Zarabatana (50)", type: "consumable", subType: "ammo", dmg: "-", props: "Zarabatana", weight: "0.1 kg", price: "1 Y" }
    ],
    adventure: [
        { name: "Ácido (Frasco)", type: "adventure", weight: "0.5 kg", price: "2,500 Y", desc: "Ação: Despejar (1.5m) ou Arremessar (6m). Ataque à distância. Dano: 2d6 ácido." },
        { name: "Algemas", type: "adventure", weight: "2 kg", price: "200 Y", desc: "Prende criaturas P ou M. CD 20 (Des/For) para escapar/quebrar." },
        { name: "Algibeira", type: "adventure", weight: "0.5 kg", price: "500 Y", desc: "Bolsa pequena. Guarda 20 munições de funda ou 50 de zarabatana." },
        { name: "Aljava", type: "adventure", weight: "0.5 kg", price: "100 Y", desc: "Guarda até 20 flechas." },
        { name: "Aríete Portátil", type: "adventure", weight: "17.5 kg", price: "40 Y", desc: "+4 em Força para arrombar portas. Vantagem se auxiliado." },
        { name: "Armadilha de Caça", type: "adventure", weight: "12.5 kg", price: "50 Y", desc: "CD 13 Des para evitar. 1d4 perfurante e imobiliza (CD 13 For p/ soltar)." },
        { name: "Balde", type: "adventure", weight: "1 kg", price: "5 Y", desc: "Capacidade: 12 litros ou 15cm³ sólido." },
        { name: "Baú", type: "adventure", weight: "12.5 kg", price: "50 Y", desc: "Capacidade: 3.5m³ ou 150kg." },
        { name: "Caixa de Fogo", type: "adventure", weight: "0.5 kg", price: "5 Y", desc: "Acende fogueiras. Tochas (ação), outros fogos (1 min)." },
        { name: "Cantil", type: "adventure", weight: "0.5 kg", price: "5 Y", desc: "Capacidade: 2 litros." },
        { name: "Corda (15m)", type: "adventure", weight: "5 kg", price: "10 Y", desc: "Cânhamo ou seda. 2 PV. CD 17 For para arrebentar." },
        { name: "Corrente (3m)", type: "adventure", weight: "5 kg", price: "50 Y", desc: "10 PV. CD 20 For para arrebentar." },
        { name: "Equipamento de Pescaria", type: "adventure", weight: "2 kg", price: "10 Y", desc: "Vara, linha, boias, anzóis, etc." },
        { name: "Esferas de Metal (50)", type: "adventure", weight: "1 kg", price: "10 Y", desc: "Cobre área 3x3m. CD 10 Des ou cai no chão (se mover > metade deslacamento)." },
        { name: "Estrepes (20)", type: "adventure", weight: "1 kg", price: "10 Y", desc: "Cobre área 1.5x1.5m. CD 15 Des ou 1 dano e -3m desl." },
        { name: "Fechadura", type: "adventure", weight: "0.5 kg", price: "100 Y", desc: "Acompanha chave. CD 15 Des para abrir sem chave." },
        { name: "Kit de Escalada", type: "adventure", weight: "6 kg", price: "2,500 Y", desc: "Pítons, botas, etc. Ação para ancorar (protege quedas > 7.5m)." },
        { name: "Kit de Primeiros-Socorros", type: "adventure", weight: "1.5 kg", price: "50 Y", desc: "10 usos. Estabiliza criatura com 0 PV sem teste." },
        { name: "Lanterna Versátil", type: "adventure", weight: "1 kg", price: "50 Y", desc: "Luz plena 9m + penumbra 9m (6h/óleo). Pode reduzir foco." },
        { name: "Livro", type: "adventure", weight: "-", price: "??", desc: "Obras literárias ou registros." },
        { name: "Luneta", type: "adventure", weight: "0.5 kg", price: "100 Y", desc: "Amplia objetos em 2x." },
        { name: "Mochila", type: "adventure", weight: "0.1 kg", price: "10 Y", desc: "Capacidade: 30 cm³ ou 15kg." },
        { name: "Óleo (Frasco)", type: "adventure", weight: "0.5 kg", price: "10 Y", desc: "Ataque distância. +5 dano fogo se acertar alvo coberto ou chão (2 turnos)." },
        { name: "Pé de Cabra", type: "adventure", weight: "2.5 kg", price: "20 Y", desc: "Vantagem em testes de Força para alavancar." },
        { name: "Pedra de Amolar", type: "adventure", weight: "-", price: "5 Y", desc: "Para afiar armas." },
        { name: "Porta Virotes", type: "adventure", weight: "0.5 kg", price: "10 Y", desc: "Armazena 20 virotes." },
        { name: "Rações de Viagem (1 dia)", type: "adventure", weight: "1 kg", price: "5 Y", desc: "Alimentos desidratados nutritivos." },
        { name: "Tenda (2 pessoas)", type: "adventure", weight: "10 kg", price: "20 Y", desc: "Abrigo simples e prático." }
    ],
    misc: []
};
