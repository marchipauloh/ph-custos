/* =====================================================================
   PH Custos - valores padrao  >>  ARQUIVO GERADO, NAO EDITE DIRETO <<

   Este arquivo e o data/valores.json convertido para .js, para o sistema
   conseguir ler em file:// (o navegador bloqueia fetch() de arquivos
   locais por CORS - o .json ficaria inutilizavel abrindo com dois cliques).

   Quer mudar um valor? Edite  data/valores.json  e regere com:

       node ferramentas/gerar-config.js

   ---------------------------------------------------------------------
   MATERIAIS   lista de insumos que ja vem preenchida na Aba 2
   EQUIPE      tecnicos que ja vem preenchidos na Aba 3
   PARCELAS    forma de pagamento padrao (soma 100%)
   GRUPOS      agrupamento dos itens na proposta impressa
   ------------------------------------------------------------------ */
window.VALORES = {
  "materiais": [
    {
      "prod": "Fita digital WS2811",
      "marca": "PH Lighting",
      "q": 59,
      "v": 85
    },
    {
      "prod": "Neon Flex Digital 2811",
      "marca": "PH Lighting",
      "q": 9,
      "v": 130
    },
    {
      "prod": "Fontes 30A - 12V Slim",
      "marca": "PH Lighting",
      "q": 3,
      "v": 85
    },
    {
      "prod": "Fontes 50A - 12V",
      "marca": "PH Lighting",
      "q": 5,
      "v": 141
    },
    {
      "prod": "Interface NodePix 32",
      "marca": "PH Lighting (32 univ)",
      "q": 3,
      "v": 1800
    },
    {
      "prod": "LCI WiFi Mini",
      "marca": "PH Lighting",
      "q": 1,
      "v": 494
    },
    {
      "prod": "Conector Mike IP67",
      "marca": "Santa Efigenia",
      "q": 34,
      "v": 8
    },
    {
      "prod": "Cabos DMX - 1m",
      "marca": "Empresa",
      "q": 4,
      "v": 32.5
    },
    {
      "prod": "Switch 8p Gigabit",
      "marca": "TP Link",
      "q": 1,
      "v": 135
    },
    {
      "prod": "Roteador Archer C6",
      "marca": "TP Link",
      "q": 1,
      "v": 250
    },
    {
      "prod": "Cabo de Rede 20m",
      "marca": "Mercado Livre",
      "q": 2,
      "v": 35
    },
    {
      "prod": "Cabo Philips Blindado (m)",
      "marca": "KSR",
      "q": 128,
      "v": 2.18
    },
    {
      "prod": "Cabo PP 2x0,5 (m)",
      "marca": "Flexivel",
      "q": 60,
      "v": 1.3
    },
    {
      "prod": "Cabo PP 2x2,5 (m)",
      "marca": "Flexivel",
      "q": 128,
      "v": 2.6
    },
    {
      "prod": "Régua 5 tomadas",
      "marca": "Bivolt",
      "q": 2,
      "v": 28
    },
    {
      "prod": "Rolo Estanho 250g",
      "marca": "Cobix 1mm",
      "q": 1,
      "v": 85.9
    },
    {
      "prod": "Tubo Cola Quente (kg)",
      "marca": "Kururuá 11mm",
      "q": 10,
      "v": 1.32
    },
    {
      "prod": "Fita Isolante 20m",
      "marca": "3M Imperial",
      "q": 3,
      "v": 8.97
    },
    {
      "prod": "Abraçadeiras Nylon (pacote)",
      "marca": "3,6x200mm",
      "q": 200,
      "v": 0.115
    }
  ],
  "equipe": [
    {
      "nome": "Edu (Engenheiro)",
      "dias": 5,
      "valor": 650
    },
    {
      "nome": "Heitor (Técnico)",
      "dias": 5,
      "valor": 450
    },
    {
      "nome": "Barba (Técnico)",
      "dias": 5,
      "valor": 450
    }
  ],
  "taxaImpostoPadrao": 15,
  "localPadrao": "Holambra - SP",
  "parcelasPadrao": [
    {
      "desc": "Sinal na aprovação",
      "pct": 40
    },
    {
      "desc": "Entrega dos materiais no local",
      "pct": 30
    },
    {
      "desc": "Conclusão e aceite final",
      "pct": 30
    }
  ],
  "gruposProposta": [
    {
      "id": "servicos",
      "titulo": "Projeto, engenharia & mão de obra"
    },
    {
      "id": "materiais",
      "titulo": "Materiais & insumos"
    },
    {
      "id": "logistica",
      "titulo": "Logística & deslocamento"
    }
  ]
};
