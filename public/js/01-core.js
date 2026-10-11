        let materiaisData = [
          { prod: "Fita digital WS2811", marca: "PH Lighting", q: 59, v: 85 },
          { prod: "Neon Flex Digital 2811", marca: "PH Lighting", q: 9, v: 130 },
          { prod: "Fontes 30A - 12V Slim", marca: "PH Lighting", q: 3, v: 85 },
          { prod: "Fontes 50A - 12V", marca: "PH Lighting", q: 5, v: 141 },
          { prod: "Interface NodePix 32", marca: "PH Lighting (32 univ)", q: 3, v: 1800 },
          { prod: "LCI WiFi Mini", marca: "PH Lighting", q: 1, v: 494 },
          { prod: "Conector Mike IP67", marca: "Santa Efigenia", q: 34, v: 8 },
          { prod: "Cabos DMX - 1m", marca: "Empresa", q: 4, v: 32.5 },
          { prod: "Switch 8p Gigabit", marca: "TP Link", q: 1, v: 135 },
          { prod: "Roteador Archer C6", marca: "TP Link", q: 1, v: 250 },
          { prod: "Cabo de Rede 20m", marca: "Mercado Livre", q: 2, v: 35 },
          { prod: "Cabo Philips Blindado (m)", marca: "KSR", q: 128, v: 2.18 },
          { prod: "Cabo PP 2x0,5 (m)", marca: "Flexivel", q: 60, v: 1.3 },
          { prod: "Cabo PP 2x2,5 (m)", marca: "Flexivel", q: 128, v: 2.6 },
          { prod: "Régua 5 tomadas", marca: "Bivolt", q: 2, v: 28 },
          { prod: "Rolo Estanho 250g", marca: "Cobix 1mm", q: 1, v: 85.9 },
          { prod: "Tubo Cola Quente (kg)", marca: "Kururuá 11mm", q: 10, v: 1.32 },
          { prod: "Fita Isolante 20m", marca: "3M Imperial", q: 3, v: 8.97 },
          { prod: "Abraçadeiras Nylon (pacote)", marca: "3,6x200mm", q: 200, v: 0.115 }
        ];

        let tecnicosData = [
          { nome: "Edu (Engenheiro)", dias: 5, valor: 650 },
          { nome: "Heitor (Técnico)", dias: 5, valor: 450 },
          { nome: "Barba (Técnico)", dias: 5, valor: 450 }
        ];

        const TAXA_IMPOSTO_PADRAO = 15;
        const LOCAL_PADRAO = 'Holambra - SP';

        const PARCELAS_PADRAO = [
          { desc: 'Sinal na aprovação', pct: 40 },
          { desc: 'Entrega dos materiais no local', pct: 30 },
          { desc: 'Conclusão e aceite final', pct: 30 }
        ];

        // Grupos da tabela da proposta, na ordem em que aparecem
        const GRUPOS_PROPOSTA = [
          { id: 'servicos', titulo: 'Projeto, engenharia & mão de obra' },
          { id: 'materiais', titulo: 'Materiais & insumos' },
          { id: 'logistica', titulo: 'Logística & deslocamento' }
        ];

        // Campos numéricos da Aba 1 guardados junto com a proposta (para reabrir depois)
        const CAMPOS_ORCAMENTO = [
          'proj-dias', 'proj-valor-fixo', 'eng-q', 'eng-v', 'tec-q', 'tec-v', 'aux-q', 'aux-v',
          'alim-q', 'alim-v', 'carro-km', 'carro-ped', 'hotel-dias', 'hotel-pess', 'hotel-v',
          'taxa-reserva', 'taxa-margem', 'taxa-imposto'
        ];

        // --- Estado do orçamento em edição (Abas 1, 2 e 3) ---
        let cronogramaData = { inicio: '', fimDeSemana: false, etapas: [] };
        let cronogramaManual = false;   // true depois que o usuário mexe nas etapas
        let parcelasData = PARCELAS_PADRAO.map(p => ({ desc: p.desc, pct: p.pct }));
        let modalidadeOrc = 'com';      // opção escolhida na Aba 1: 'com' (B) ou 'sem' (A) NF
        let orcamentoEditandoId = null; // id da proposta reaberta na Aba 1 (ou null)
        let ultimoCalculo = null;
        let empresa = { cnpj: '', contato: '', validade: 15 };

        // --- Estado do financeiro / modais ---
        let bancoProjetos = [];
        let projetoEditandoId = null;
        let propostaAbertaId = null;
        let editGastosLista = [];
        let editTecnicosLista = [];
        let editParcelas = [];
        let editCronograma = { inicio: '', fimDeSemana: false, etapas: [] };
        let editDiasObra = 1;
        let editExecutadoOriginal = '';