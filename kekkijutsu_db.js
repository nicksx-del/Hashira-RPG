const KEKKIJUTSU_DATA = {
    id: 'ice_kekkijutsu',
    name: 'Kekkijutsu de Gelo',
    description: 'Manipulação do frio e congelamento, capaz de criar estruturas e causar dano massivo.',
    skills: [
        // --- CHI (Círculo 0) ---
        {
            id: 'ice_chi_1',
            name: 'Raio de Gelo',
            circle: 0,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '18 metros',
            duration: 'Instantâneo',
            damage: '1d8 Frio',
            description: 'Um raio frígido de luz azul. No acerto, causa 1d8 de dano de frio e reduz deslocamento em 3m. Aumenta em 1d8 no 5º, 11º e 17º nível.'
        },
        {
            id: 'ice_chi_2',
            name: 'Raio Polar',
            circle: 0,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '18 metros',
            duration: 'Instantâneo',
            damage: '1d4 Frio',
            description: 'Dispara um feixe boreal. Dano de 1d4 + Mod. Habilidade. Apaga fogueiras ou congela um galão de água. Dano aumenta com níveis.'
        },
        {
            id: 'ice_chi_3',
            name: 'Resistência ao Gelo',
            circle: 0,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '18 metros',
            duration: 'Conc. 1 min',
            damage: '-',
            description: 'Toca uma criatura voluntária, concedendo resistência a dano de gelo até receber um ataque ou acabar o tempo.'
        },
        {
            id: 'ice_chi_4',
            name: 'Criação de Gelo',
            circle: 0,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '18 metros',
            duration: 'Ação (até 2 min/8h)',
            damage: '-',
            description: 'Cria estrutura de gelo com até 1,5m de altura e largura. Tem 10 PV. Dura 2 min em combate ou 8h fora.'
        },
        {
            id: 'ice_chi_5',
            name: 'Toque Frio',
            circle: 0,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: 'Toque',
            duration: 'Ação',
            damage: '1d12 Frio',
            description: 'Toca uma criatura ou objeto cobrindo com um toque gélido, causando 1d12 de dano de frio.'
        },

        // --- 1º CÍRCULO ---
        {
            id: 'ice_c1_1',
            name: 'Snowball',
            circle: 1,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '30 metros',
            duration: 'Instantâneo',
            damage: '2d10 Frio',
            description: 'Lança bola de neve compactada. 2d10 de dano e teste de Força para não cair. Sucesso reduz dano à metade e não cai.'
        },
        {
            id: 'ice_c1_2',
            name: 'Nevasca',
            circle: 1,
            type: 'Conjuração, Gelo',
            cost: 'Ação Bônus',
            range: '18 metros',
            duration: 'Conc. até 1 min',
            damage: '1d6 Frio',
            description: 'Área de 4,5m de raio. Teste de Constituição: falha causa 1d6 dano e -3m deslocamento. Sucesso previne dano e redução.'
        },
        {
            id: 'ice_c1_3',
            name: 'Passo Congelante',
            circle: 1,
            type: 'Conjuração, Gelo',
            cost: 'Ação Bônus',
            range: 'Pessoal',
            duration: 'Conc. até 1 min',
            damage: '-',
            description: 'Caminhe sobre superfícies difíceis (gelo, neve, água) sem penalidade. Ganha resistência a dano de frio.'
        },
        {
            id: 'ice_c1_4',
            name: 'Escudo de Gelo',
            circle: 1,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: 'Toque',
            duration: 'Conc. até 1 min',
            damage: '-',
            description: 'Concede +2 na CA do alvo. Se o alvo receber ataque ou tiver fogo próximo, o gelo se desfaz.'
        },
        {
            id: 'ice_c1_5',
            name: 'Rajada Gélida',
            circle: 1,
            type: 'Combate',
            cost: 'Ação',
            range: '30 metros',
            duration: 'Instantâneo',
            damage: '2d12 Frio',
            description: 'Raio de frio intenso. Ataque à distância. 2d12 de dano. Aumenta 1d12 por círculo superior.'
        },
        {
            id: 'ice_c1_6',
            name: 'Proteção Elem. Gélidos',
            circle: 1,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: 'Toque',
            duration: 'Conc. até 1 hora',
            damage: '-',
            description: 'Concede resistência a dano de frio ao alvo.'
        },
        {
            id: 'ice_c1_7',
            name: 'Escalada Glacial',
            circle: 1,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '9 metros',
            duration: 'Conc. até 10 min',
            damage: '-',
            description: 'Cobre superfície com gelo facilitando escalada (sem testes necessários).'
        },
        {
            id: 'ice_c1_8',
            name: 'Toque Gélido',
            circle: 1,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: 'Toque',
            duration: 'Instantâneo',
            damage: '2d6 Frio',
            description: 'Ataque corpo a corpo. 2d6 dano e teste de Con ou velocidade reduzida pela metade.'
        },
        {
            id: 'ice_c1_9',
            name: 'Terreno Congelado',
            circle: 1,
            type: 'Conjuração, Gelo',
            cost: 'Ação Bônus',
            range: '18 metros',
            duration: '1 minuto',
            damage: '-',
            description: 'Raio de 4,5m escorregadio. Teste de Destreza ou cai no chão (prono).'
        },

        // --- 2º CÍRCULO ---
        {
            id: 'ice_c2_1',
            name: 'Lança Glacial Perfurante',
            circle: 2,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '9 metros',
            duration: 'Instantâneo',
            damage: '2d6 Frio + 2d6 Perf.',
            description: 'Lança revestida em veneno/gelo. Dano híbrido. Falha no teste de Con reduz velocidade pela metade.'
        },
        {
            id: 'ice_c2_2',
            name: 'Barreira Glacial',
            circle: 2,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '9 metros',
            duration: '1 minuto',
            damage: '-',
            description: 'Barreira de 4,5m de comp. x 3m altura. Cobertura total (+5 CA). Vulnerável a fogo.'
        },
        {
            id: 'ice_c2_3',
            name: 'Lâmina Gelada',
            circle: 2,
            type: 'Conjuração, Gelo',
            cost: 'Ação Bônus',
            range: 'Pessoal',
            duration: 'Até 1 min',
            damage: '+1d6 Frio',
            description: 'Envolve arma em gelo. Dano extra de 1d6 de frio nos ataques.'
        },
        {
            id: 'ice_c2_4',
            name: 'Pele de Gelo',
            circle: 2,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: 'Toque',
            duration: 'Conc. até 1 min',
            damage: '-',
            description: 'Alvo ganha resistência a frio e +1 na CA. Se atacado por fogo, perde a pele.'
        },
        {
            id: 'ice_c2_5',
            name: 'Congelamento Temporário',
            circle: 2,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '9 metros',
            duration: 'Conc. até 1 min',
            damage: '-',
            description: 'Frio intenso. Teste de Con ou condição "Petrificado" (congelado) até final do próximo turno.'
        },
        {
            id: 'ice_c2_6',
            name: 'Tempestade Gélida',
            circle: 2,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '27 metros',
            duration: 'Conc. até 1 min',
            damage: '3d6 Frio',
            description: 'Cilindro de 4,5m raio. 3d6 dano e reduz velocidade em 3m (teste Con metade).'
        },
        {
            id: 'ice_c2_7',
            name: 'Prisão Fria',
            circle: 2,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '18 metros',
            duration: 'Conc. até 1 min',
            damage: '3d6 Frio',
            description: 'Raio gélido. 3d6 dano e alvo fica impedido (teste Força para escapar).'
        },
        {
            id: 'ice_c2_8',
            name: 'Mar de Gelo',
            circle: 2,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '12m x 1,5m',
            duration: 'Instantâneo',
            damage: '4d6 Frio',
            description: 'Onda de gelo em linha. 4d6 dano e empurrar 3m (teste Força metade e não empurra).'
        },

        // --- 3º CÍRCULO ---
        {
            id: 'ice_c3_1',
            name: 'Lâmina Gélida Maior',
            circle: 3,
            type: 'Conjuração, Gelo',
            cost: 'Ação Bônus',
            range: 'Toque',
            duration: 'Conc. até 1 min',
            damage: '+2d6 Frio',
            description: 'Versão aprimorada da Lâmina Gelada. Dano extra aumenta para 2d6.'
        },
        {
            id: 'ice_c3_2',
            name: 'Adagas Geladas',
            circle: 3,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '30 metros',
            duration: 'Instantâneo',
            damage: '2d10 Perf. + 2d10 Frio',
            description: 'Cria adagas de gelo. Ataque a distância.'
        },
        {
            id: 'ice_c3_3',
            name: 'Resfriamento Total',
            circle: 3,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '30 metros',
            duration: 'Instantâneo',
            damage: '5d8 Frio',
            description: 'Sopro congelante. 5d8 dano e velocidade 0 (teste Con metade).'
        },
        {
            id: 'ice_c3_4',
            name: 'Ice Tomb',
            circle: 3,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '18 metros',
            duration: 'Conc. até 1 min',
            damage: '2d8 Frio (Inicial)',
            description: 'Aprisiona em gelo. 2d8 inicial, depois 1d8/turno. Restrito (teste Força).'
        },
        {
            id: 'ice_c3_5',
            name: 'Colisão Glacial',
            circle: 3,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '9 metros',
            duration: 'Instantâneo',
            damage: '2d8 Frio + 2d10 Conc.',
            description: 'Bloco de gelo. Alvo principal sofre dano híbrido. Cone de 3m atrás: 4d4 Frio.'
        },
        {
            id: 'ice_c3_6',
            name: 'Parede de Gelo',
            circle: 3,
            type: 'Reação',
            cost: 'Reação',
            range: 'Pessoal',
            duration: 'Instantâneo',
            damage: 'Absorve 15',
            description: 'Quando atingido por ataque à distância, cria parede que absorve 15 de dano.'
        },
        {
            id: 'ice_c3_7',
            name: 'Explosão Glacial',
            circle: 3,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '45 metros',
            duration: 'Instantâneo',
            damage: '4d6 Frio + 4d6 Perf.',
            description: 'Esfera de 6m raio. Dano massivo, dobro em construções.'
        },
        {
            id: 'ice_c3_8',
            name: 'Barrage de Gelo',
            circle: 3,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: 'Pessoal',
            duration: 'Instantâneo',
            damage: '-',
            description: 'Bloco cubo 3m, 20 PV, vulnerável a fogo. Cobertura.'
        },

        // --- 4º CÍRCULO ---
        {
            id: 'ice_c4_1',
            name: 'Vórtice Congelante',
            circle: 4,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '18 metros',
            duration: 'Instantâneo',
            damage: '6d6 Frio',
            description: 'Esfera de 6m raio. Puxa para centro? (Texto diz empurrada?). 6d6 dano.'
        },
        {
            id: 'ice_c4_0',
            name: 'Geiser de Gelo',
            circle: 4,
            type: 'Conjuração, Gelo',
            cost: 'Ação Bônus',
            range: '4,5 metros',
            duration: 'Pessoal',
            damage: '4d8 Frio',
            description: 'Irrompe de você, empurrando criaturas em 4,5m. 30m de altura. Empurra 3m.'
        },
        {
            id: 'ice_c4_2',
            name: 'Tempestade Congelante',
            circle: 4,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '36 metros',
            duration: 'Instantâneo',
            damage: '6d8 Frio',
            description: 'Raio de 4,5m. 6d8 dano e terreno difícil.'
        },
        {
            id: 'ice_c4_3',
            name: 'Manto Glacial',
            circle: 4,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: 'Toque',
            duration: 'Conc. 1 min',
            damage: '2d6 Frio (Retribuição)',
            description: 'Aura gelada. +2 CR. Atacantes sofrem 2d6.'
        },
        {
            id: 'ice_c4_4',
            name: 'Lança de Gelo',
            circle: 4,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '18 metros',
            duration: 'Instantâneo',
            damage: '5d8 Frio',
            description: 'Linha de 18m x 1,5m. 5d8 de dano.'
        },
        {
            id: 'ice_c4_5',
            name: 'Projétil de Gelo',
            circle: 4,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '18 metros',
            duration: 'Instantâneo',
            damage: '6d8 Frio',
            description: 'Disparo brilhante. 6d8 de dano.'
        },
        {
            id: 'ice_c4_6',
            name: 'Vento Gélido das Esferas',
            circle: 4,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: 'Pessoal',
            duration: 'Conc. até 1 min',
            damage: '1d10 Frio + Mod',
            description: 'Duas esferas atacam (ação bônus). Podem absorver 20 de dano como reação.'
        },

        // --- 5º CÍRCULO ---
        {
            id: 'ice_c5_1',
            name: 'Ice Block',
            circle: 5,
            type: 'Conjuração, Gelo',
            cost: 'Reação',
            range: 'Pessoal',
            duration: 'Instantâneo',
            damage: 'Imunidade',
            description: 'Quando sofre dano fatal, torna-se imune a tudo, mas fica incapacitado até o próximo turno. Gelo derrete.'
        },
        {
            id: 'ice_c5_2',
            name: 'Artic Lock',
            circle: 5,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '18 metros',
            duration: 'Instantâneo',
            damage: '6d10 Frio / Petrificado',
            description: 'Estala os dedos. Teste de Destreza ou 6d10 de Frio e Petrificado. Sucesso metade sem condição.'
        },
        {
            id: 'ice_c5_3',
            name: 'Explosão de Estalactites',
            circle: 5,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '60 metros',
            duration: 'Instantâneo',
            damage: '3d6 Perf + 4d6 Frio + 6d6 Conc',
            description: 'Complexo: Raio 18m (Agulhas), depois Raio 12m (Frio), depois Raio 6m (Contundente). Danos em cascata.'
        },
        {
            id: 'ice_c5_4',
            name: 'Visão Congelante',
            circle: 5,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: 'Pessoal',
            duration: 'Conc. 1 min',
            damage: '-',
            description: 'Visão amplificada 1,6km. Vê através de sólidos, nevoeiros. Visão infravermelha.'
        },
        {
            id: 'ice_c5_5',
            name: 'Black Ice',
            circle: 5,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '36 metros',
            duration: 'Instantâneo',
            damage: '4d6 Frio + 6d6 Necrótico',
            description: 'Três estacas negras. 4d6 cada. Se combinar no mesmo alvo, +6d6 Necrótico.'
        },
        {
            id: 'ice_c5_6',
            name: 'Chuva de Estrelas Congeladas',
            circle: 5,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '12 metros',
            duration: 'Instantâneo',
            damage: '8d8 Frio',
            description: 'Área de 12m de raio. 8d8 dano, reduz veloc. metade.'
        },

        // --- 6º CÍRCULO ---
        {
            id: 'ice_c6_1',
            name: 'Prisão de Espinhos',
            circle: 6,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '18 metros',
            duration: 'Conc. até 1 min',
            damage: '3d10 Frio/Turno',
            description: 'Imobiliza e restringe (Teste Força). Sofre 3d10 no início de cada turno.'
        },
        {
            id: 'ice_c6_2',
            name: 'Avalanche',
            circle: 6,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '9 metros',
            duration: 'Instantâneo',
            damage: '6d6 Frio + 4d6 Conc',
            description: 'Cone de 9m. Empurra 4,5m. Terreno difícil.'
        },
        {
            id: 'ice_c6_3',
            name: 'Geada',
            circle: 6,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '18 metros',
            duration: 'Instantâneo',
            damage: '6d10 Frio',
            description: 'Cone de 9m. Teste Const e Des. Falha em ambos = 6d10 dano.'
        },
        {
            id: 'ice_c6_4',
            name: 'Congelar',
            circle: 6,
            type: 'Reação',
            cost: 'Reação (Ao ser atacado)',
            range: 'Toque',
            duration: 'Instantâneo',
            damage: '6d8 Frio / Petrificado',
            description: 'Quando atacado corpo-a-corpo. Atacante faz teste Const ou Petrificado + 6d8 dano.'
        },
        {
            id: 'ice_c6_5',
            name: 'Muralha de Gelo',
            circle: 6,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '36 metros',
            duration: 'Instantâneo',
            damage: '-',
            description: 'Muralha sólida 9m comp x 3m altura. Cobertura total.'
        },
        {
            id: 'ice_c6_6',
            name: 'Viagem Criogênica',
            circle: 6,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: 'Toque',
            duration: 'Indefinido',
            damage: '-',
            description: 'Coloca criatura em animação suspensa/criogenia. Não envelhece, protegida.'
        },
        {
            id: 'ice_c6_7',
            name: 'Casa de Gelo',
            circle: 6,
            type: 'Conjuração, Gelo',
            cost: '1 minuto',
            range: 'Toque',
            duration: '8 horas',
            damage: '-',
            description: 'Cria refúgio de 9x9m. Acomoda 8 criaturas. Descanso Longo seguro.'
        },

        // --- 7º CÍRCULO ---
        {
            id: 'ice_c7_1',
            name: 'Cataclismo Glacial',
            circle: 7,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '45 metros',
            duration: 'Instantâneo',
            damage: '10d6 Frio / Petrificado',
            description: 'Área imensa 18m raio. 10d6 dano e Petrificado até prox turno.'
        },
        {
            id: 'ice_c7_2',
            name: 'Aurora Azul',
            circle: 7,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '90 metros',
            duration: 'Instantâneo',
            damage: '12d8 Frio',
            description: 'Raio de 30 metros! 12d8 de dano em área massiva.'
        },
        {
            id: 'ice_c7_3',
            name: 'Presença Invernal',
            circle: 7,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '9 metros',
            duration: 'Conc. até 1 min',
            damage: '-',
            description: 'Aura de medo (Carisma). Inimigos amedrontados e incapazes de aproximar.'
        },
        {
            id: 'ice_c7_4',
            name: 'Tempestade de Cristal',
            circle: 7,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '45 metros',
            duration: 'Conc. até 1 hora',
            damage: '8d10 Frio',
            description: 'Área de cubos de 3m. 8d10 de dano para quem entrar.'
        },

        // --- 8º CÍRCULO ---
        {
            id: 'ice_c8_1',
            name: 'Vórtice de Cristal',
            circle: 8,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '90 metros',
            duration: 'Instantâneo',
            damage: '10d10 Frio / Incapacitado',
            description: 'Raio de 18m. 10d10 dano e Incapacitado por 1 min (teste repete).'
        },
        {
            id: 'ice_c8_2',
            name: 'Lâmina Épica',
            circle: 8,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: 'Pessoal',
            duration: 'Conc. 1 min',
            damage: '4d12 Frio',
            description: 'Lâmina flutuante ataca (Ação Bônus). Acerto paralisa alvo por 1 min.'
        },
        {
            id: 'ice_c8_3',
            name: 'Nuvem Congelante',
            circle: 8,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '45 metros',
            duration: 'Conc. 1 min',
            damage: '10d8 Frio',
            description: 'Esfera de 6m que se move 9m/turno. Causa 10d8 em quem toca.'
        },
        {
            id: 'ice_c8_4',
            name: 'Cálice de Gelo',
            circle: 8,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: 'Pessoal',
            duration: 'Conc. 1 min',
            damage: '5d10 Frio',
            description: 'Dispara feixes (Bônus) 5d10. Aura de 9m causa 4d10 e paralisia.'
        },
        {
            id: 'ice_c8_5',
            name: 'Geada Aniquiladora',
            circle: 8,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '56 metros',
            duration: 'Conc. 1 min',
            damage: '8d8 Frio',
            description: 'Área de 12m. Vento cortante. 8d8 dano. Terreno difícil custa dobro.'
        },

        // --- 9º CÍRCULO ---
        {
            id: 'ice_c9_1',
            name: 'Esfera Temporal',
            circle: 9,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '45 metros',
            duration: 'Instantâneo',
            damage: '11d10 Frio / Estase',
            description: 'Raio 6m. Presos no tempo (1d4 rodadas). 11d10 de dano.'
        },
        {
            id: 'ice_c9_2',
            name: 'Domínio Gelo Eterno',
            circle: 9,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '72 metros',
            duration: 'Conc. 1 hora',
            damage: 'Varia',
            description: 'Controle absoluto: Congelar Água, Ponte de Gelo, Nevasca Impenetrável, Amplificação de Kekkijutsu (+6d8).'
        },
        {
            id: 'ice_c9_3',
            name: 'Punho Congelante',
            circle: 9,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '36 metros',
            duration: 'Instantâneo',
            damage: '10d12 Frio',
            description: 'Mão gigante esmaga. 10d12 dano. Arremessa 9m e incapacita.'
        },
        {
            id: 'ice_c9_4',
            name: 'Muralha Abissal',
            circle: 9,
            type: 'Conjuração, Gelo',
            cost: 'Ação',
            range: '36 metros',
            duration: 'Instantâneo',
            damage: '12d10 Frio (ao tocar)',
            description: 'Muralha maciça 56m x 9m x 3m. Quase indestrutível. Dano massivo ao tocar.'
        }
    ]
};
