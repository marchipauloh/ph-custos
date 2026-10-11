/* =====================================================================
   PH Custos - 06 boot
   Inicializa cada pagina, conforme o que existe no DOM dela.
   ---------------------------------------------------------------------
   POR QUE ESTE ARQUIVO SOZINHO (V21):
     O boot usava ficar no fim do 05-exportacao, mas as paginas de Materiais
     e Equipe nao carregam o 05 (nao precisam de PDF, Excel nem WhatsApp).
     Resultado: os dados carregavam, a tabela nao desenhava e a pagina
     ficava vazia sem nenhum erro no console - o pior tipo de bug.

     O boot e a ponte entre o estado e a tela, entao ele vem DEPOIS de
     todos os outros. Se faltar alguma coisa aqui, nenhuma pagina abre.
   ===================================================================== */

    // Cada pagina declara o que precisa montar. O nome vem do id da
    // <section>, que o gerador mantem igual ao arquivo unico.
    const BOOTS = {
      orcamento: function () {
        renderCronograma('orc');
        renderParcelas('orc');
        atualizarOpcaoUI();
        calcular();               // também monta o cronograma sugerido
        atualizarModoEdicao();
      },
      materiais: function () {
        renderTabelaMateriais();
        calcular();               // preenche mat-total-geral
      },
      equipe: function () {
        calcular();               // precisa do ultimoCalculo p/ comparar
        renderTecnicos();         // já chama atualizarComparativoEquipe
      },
      financeiro: function () {
        renderizarFinanceiro();
        // V21: mostra quais pastas estao ativas. Sem isso o usuario so
        // descobria a configuracao depois de gravar no lugar errado.
        if (typeof pintarStatusPastas === 'function') pintarStatusPastas();
      }
    };

    function descobrirPagina() {
      if (document.getElementById('tab-orcamento')) return 'orcamento';
      if (document.getElementById('tab-materiais')) return 'materiais';
      if (document.getElementById('tab-equipe')) return 'equipe';
      if (document.getElementById('tab-financeiro')) return 'financeiro';
      return null;
    }

    // V21: o rascunho e salvo antes de sair da pagina, para a proxima aba
    // enxergar o que foi digitado. beforeunload e o gancho certo: roda
    // depois de todo o oninput, entao o que estava na tela esta salvo.
    window.addEventListener('beforeunload', guardarRascunho);

    // V21: so a Aba 1 tem os campos do orcamento na tela. Ao entrar nela,
    // eles precisam ser repostos a partir do rascunho - senao, apos ir na
    // lista de materiais e voltar, os 12 dias de obra e a taxa de margem
    // voltariam vazios enquanto o total continuaria calculado.
    function hidratarCamposOrcamento() {
      if (!document.getElementById('proj-dias')) return false;   // nao e a Aba 1
      const campos = (_camposRascunho && typeof _camposRascunho === 'object') ? _camposRascunho : null;
      if (!campos) return false;
      CAMPOS_ORCAMENTO.forEach(id => {
        const el = document.getElementById(id);
        if (el && campos[id] !== undefined && campos[id] !== '') el.value = campos[id];
      });
      return true;
    }

    // Nome do projeto e dados do cliente: mesma logica dos campos.
    function hidratarCliente() {
      if (!document.getElementById('proj-nome')) return false;
      const c = (_clienteRascunho && typeof _clienteRascunho === 'object') ? _clienteRascunho : null;
      if (!c) return false;
      const pares = [['proj-nome', 'nome'], ['cli-contato', 'contato'],
                     ['cli-fone', 'fone'], ['cli-local', 'local']];
      pares.forEach(function (par) {
        const el = document.getElementById(par[0]);
        if (el && c[par[1]]) el.value = c[par[1]];
      });
      return true;
    }

    window.onload = function () {
      prepararEstado();          // rascunho salvo > data/valores.json
      carregarEmpresa();
      carregarProjetosStorage();

      const pagina = descobrirPagina();
      if (pagina && BOOTS[pagina]) {
        hidratarCamposOrcamento();
        hidratarCliente();
        BOOTS[pagina]();
      } else {
        console.warn('[PH Custos] pagina nao reconnue pelo boot.');
      }
    };