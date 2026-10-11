/* =====================================================================
   PH Custos - 00 valores
   Carrega o data/valores.js e joga no estado global.
   ---------------------------------------------------------------------
   POR QUE O RASCUNHO (o problema que a separacao em paginas criou):
     Hoje as 4 abas dividem o mesmo rascunho na memoria (materiaisData,
     tecnicosData, cronograma, parcelas...). Se cada aba virar um HTML
     separado, trocar de pagina DESTRUI a memoria do JavaScript: o que
     voce digitou na lista de materiais sumiria ao clicar em "Equipe".

     A solucao adoptedhere: um rascunho no localStorage, atualizado a cada
     mudanca, lido no boot de cada pagina. Assim a Aba 2 -> Aba 3 continua
     enxergando os 19 materiais e os 3 tecnicos que voce ja preencheu.

     Regra: o rascunho NAO e a fonte da verdade. A fonte e o que foi
     gravado no Financeiro (localStorage "ph_projetos"). O rascunho serve
     so para o texto nao se perder enquanto voce navega entre abas.
   ===================================================================== */

    const RASCUNHO_KEY = 'ph_rascunho';
    const CHAVE_VALORES = 'VALORES';

    // Cache do rascunho, para as paginas que nao tem os campos na tela
    // lerem o valor sem ir no localStorage a cada tecla.
    let _camposRascunho = null;
    let _clienteRascunho = null;

    // shallow clone: os objetos internos sao os mesmos, mas a lista e nova.
    function cloneConfig(src) {
      return Array.isArray(src) ? src.slice() : [];
    }

    // Mantem o rascunho em localStorage para sobreviver a troca de pagina.
    // Silencioso por design: falha de cota nao pode travar a digitacao.
    function guardarRascunho() {
      try {
        localStorage.setItem(RASCUNHO_KEY, JSON.stringify({
          materiais: materiaisData,
          equipe: tecnicosData,
          cronograma: cronogramaData,
          parcelas: parcelasData,
          modalidade: modalidadeOrc,
          manual: cronogramaManual,
          editandoId: orcamentoEditandoId,
          // V21: os campos da Aba 1 vao junto. Sem isso a Aba 2/3/4
          // recalcularia sem saber dias, mao de obra, reserva, margem,
          // imposto e o total de materiais sairia errado.
          campos: guardarCamposOrcamento(),
          // Nome e dados do cliente tambem: vao para a proposta e para o
          // PDF, e perder o nome ao trocar de aba seria inaceitavel.
          cliente: guardarCliente()
        }));
      } catch (e) { /* cota cheia: o sistema segue, o backup em .json cobre */ }
    }

    function lerRascunho() {
      try {
        const s = JSON.parse(localStorage.getItem(RASCUNHO_KEY) || 'null');
        if (!s || typeof s !== 'object') return false;
        if (Array.isArray(s.materiais)) materiaisData = cloneConfig(s.materiais);
        if (Array.isArray(s.equipe)) tecnicosData = cloneConfig(s.equipe);
        if (s.cronograma && Array.isArray(s.cronograma.etapas)) cronogramaData = s.cronograma;
        if (Array.isArray(s.parcelas)) parcelasData = s.parcelas;
        if (s.modalidade === 'sem' || s.modalidade === 'com') modalidadeOrc = s.modalidade;
        if (typeof s.manual === 'boolean') cronogramaManual = s.manual;
        if (s.editandoId === null || typeof s.editandoId === 'number') orcamentoEditandoId = s.editandoId;
        if (s.campos && typeof s.campos === 'object') _camposRascunho = s.campos;
        if (s.cliente && typeof s.cliente === 'object') _clienteRascunho = s.cliente;
        return true;
      } catch (e) { return false; }
    }

    // Config inicial vinda do data/valores.js (gerado do data/valores.json).
    function aplicarValoresPadrao() {
      const v = window[CHAVE_VALORES];
      if (!v || typeof v !== 'object') {
        // O data/valores.js nao carregou: nao quebra, so avisa no console.
        console.warn('[PH Custos] data/valores.js nao carregou. As listas continuam vazias.');
        return false;
      }
      if (Array.isArray(v.materiais) && v.materiais.length) materiaisData = cloneConfig(v.materiais);
      if (Array.isArray(v.equipe) && v.equipe.length) tecnicosData = cloneConfig(v.equipe);
      if (Array.isArray(v.parcelasPadrao) && v.parcelasPadrao.length) {
        parcelasData = v.parcelasPadrao.map(p => ({ desc: p.desc, pct: p.pct }));
      }
      return true;
    }

    // Nome do projeto e dados do cliente tambem vivem na Aba 1. Vaem para a
    // proposta e para o PDF, entao precisam viajar com o rascunho.
    // Elemento ausente = pagina que nao tem o campo (nao quebra nada).
    function guardarCliente() {
      const pega = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : '';
      };
      return {
        nome: pega('proj-nome'),
        contato: pega('cli-contato'),
        fone: pega('cli-fone'),
        local: pega('cli-local')
      };
    }

    // Monta o estado a partir do config padrao e do rascunho salvo.
    // Ordem importa: config primeiro (dá a lista inicial), rascunho depois
    // (sobrescreve com o que a pessoa digitou e nao salvou ainda).
    function prepararEstado() {
      const temRascunho = lerRascunho();
      if (!temRascunho) aplicarValoresPadrao();
      return temRascunho;
    }

    // Os campos da Aba 1 (proj-dias, eng-q, taxa-imposto...) so existem na
    // pagina html/orcamento.html. Mas calcular() roda tambem nas outras
    // paginas: a Aba 2 mostra o total de materiais e a Aba 3 compara a
    // equipe escalada com a mao de obra orcada.
    //
    // Sem isto, navegar para a Aba 2 faria calcular() ler undefined em
    // tudo, o total de mao de obra viraria zero e o comparativo da equipe
    // passaria a dizer "igual a mao de obra orcada" quando nao era.
    //
    // Solucao: guardar os campos da Aba 1 no rascunho e, nas paginas onde
    // eles nao existem na tela, ler dali. Quem digitar na Aba 1 continua
    // lendo e escrevendo no input de verdade.
    function guardarCamposOrcamento() {
      const campos = {};
      CAMPOS_ORCAMENTO.forEach(id => {
        const el = document.getElementById(id);
        if (el) campos[id] = el.value;
      });
      return campos;
    }

    // Le um campo da Aba 1 de onde ele estiver: o input da tela (Aba 1) ou o
    // rascunho salvo (Aba 2, 3 e 4).
    function valorCampo(id) {
      const el = document.getElementById(id);
      if (el) return el.value;
      if (_camposRascunho && _camposRascunho[id] !== undefined) return _camposRascunho[id];
      return '';
    }

    // Fim do arquivo.