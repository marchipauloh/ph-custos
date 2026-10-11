
        // ---------------------------------------------------------------------
        // NÚMEROS, DATAS E TEXTO
        // ---------------------------------------------------------------------

        // Só trata o ponto como separador de milhar quando o texto está no formato
        // brasileiro (tem vírgula, ex.: "R$ 1.234,56"). Sem vírgula, o ponto é decimal.
        function parseNum(val) {
          if (typeof val === 'number') return isFinite(val) ? val : 0;
          if (val === null || val === undefined) return 0;
          let s = String(val).replace(/R\$/g, '').replace(/\s/g, '');
          if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
          const n = parseFloat(s);
          return isFinite(n) ? n : 0;
        }

        // Arredonda para centavos
        function r2(v) {
          return Math.round((parseNum(v) + Number.EPSILON) * 100) / 100;
        }

        function fmt(v) {
          return (parseNum(v)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

        // Preço unitário: mostra a 3ª casa quando existe (ex.: R$ 0,115)
        function fmtUnit(v) {
          return parseNum(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 3 });
        }

        function fmtPct(v) {
          return parseNum(v).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
        }

        // Quantidade com a unidade ("5 diárias", "1 verba", "128")
        function fmtQtd(q, un) {
          const n = parseNum(q);
          const txt = n.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
          if (!un) return txt;
          if (un === 'diária') return `${txt} ${n === 1 ? 'diária' : 'diárias'}`;
          return `${txt} ${un}`;
        }

        function esc(txt) {
          return String(txt === null || txt === undefined ? '' : txt)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        }

        function txt(v) {
          return v === null || v === undefined ? '' : String(v);
        }

        function clone(obj) {
          return JSON.parse(JSON.stringify(obj));
        }

        function setTexto(id, texto) {
          const el = document.getElementById(id);
          if (el) el.innerText = texto;
        }

        function pad2(n) { return String(n).padStart(2, '0'); }

        function hojeISO() {
          const d = new Date();
          return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        }

        // "2026-10-12" -> Date local (sem o deslocamento de fuso do new Date(string))
        function parseDataISO(iso) {
          const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(txt(iso));
          if (!m) return null;
          const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
          return isNaN(d.getTime()) ? null : d;
        }

        function dataCurta(d) { return d ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}` : ''; }
        function dataLonga(d) { return d ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}` : ''; }
        function numeroProposta(p) { return String(p.id).slice(-6); }

        // ---------------------------------------------------------------------
        // CRONOGRAMA
        // ---------------------------------------------------------------------

        // Sugestão de etapas a partir do número de dias da obra
        // V21: cada etapa ganha um id proprio. Antes, o "feito" era salvo pelo
        // INDICE da lista: reordenar ou apagar uma etapa fazia a marcacao pular
        // para a etapa vizinha, e uma etapa concluida voltava a "nao feita".
        // O contador impede a colisao de dois ids no mesmo milissegundo, que
        // aconteceu de verdade no teste.
        let _seqEtapa = 0;
        function novoIdEtapa() {
          _seqEtapa = (_seqEtapa + 1) % 1000000;
          return 'e' + Date.now().toString(36) + _seqEtapa.toString(36) +
                 Math.random().toString(36).slice(2, 6);
        }

        function gerarEtapasPadrao(dias) {
          const n = Math.max(1, Math.round(parseNum(dias)));
          let lista;
          if (n === 1) {
            lista = [['Instalação completa, programação cênica e testes', 1]];
          } else if (n === 2) {
            lista = [
              ['Medição no local, infraestrutura e montagem', 1],
              ['Programação cênica, testes e treinamento da equipe', 1]
            ];
          } else if (n === 3) {
            lista = [
              ['Medição no local e passagem de cabeamento e infraestrutura', 1],
              ['Montagem de fitas, fontes e interfaces', 1],
              ['Programação cênica, testes e treinamento da equipe', 1]
            ];
          } else {
            // 1 dia de medição, 1 de programação e o miolo dividido entre infra e montagem
            const miolo = n - 2;
            const montagem = Math.max(1, Math.round(miolo / 3));
            lista = [
              ['Medição no local e aprovação do projeto executivo', 1],
              ['Passagem de cabeamento e infraestrutura', miolo - montagem],
              ['Montagem de fitas, fontes e interfaces', montagem],
              ['Programação cênica, testes e treinamento da equipe', 1]
            ];
          }
          return lista.map(e => ({ id: novoIdEtapa(), desc: e[0], dias: e[1], feita: false }));
        }

        function diasDaEtapa(e) {
          return Math.max(0, Math.min(366, Math.round(parseNum(e.dias))));
        }

        function totalDiasCronograma(crono) {
          return ((crono && crono.etapas) || []).reduce((s, e) => s + diasDaEtapa(e), 0);
        }

        // Para cada etapa: dias corridos da obra ("Dias 2 e 3") e, se houver data de
        // início, as datas reais (pulando sábado e domingo, a menos que marcado).
        function calcularPeriodos(crono) {
          const etapas = (crono && crono.etapas) || [];
          const fds = !!(crono && crono.fimDeSemana);
          const inicio = parseDataISO(crono && crono.inicio);
          let cursor = inicio ? new Date(inicio) : null;
          let dia = 0;

          const proximaData = () => {
            while (!fds && (cursor.getDay() === 0 || cursor.getDay() === 6)) cursor.setDate(cursor.getDate() + 1);
            const d = new Date(cursor);
            cursor.setDate(cursor.getDate() + 1);
            return d;
          };

          return etapas.map(e => {
            const n = diasDaEtapa(e);
            if (n === 0) return { n: 0, dias: '—', datas: '', ini: null, fim: null };
            const d1 = dia + 1;
            const d2 = dia + n;
            dia = d2;
            let ini = null, fim = null;
            if (cursor) {
              for (let k = 0; k < n; k++) {
                const d = proximaData();
                if (k === 0) ini = d;
                fim = d;
              }
            }
            const rotuloDias = n === 1 ? `Dia ${d1}` : (n === 2 ? `Dias ${d1} e ${d2}` : `Dias ${d1} a ${d2}`);
            const rotuloDatas = !ini ? '' : (n === 1 ? dataCurta(ini) : `${dataCurta(ini)} a ${dataCurta(fim)}`);
            return { n, dias: rotuloDias, datas: rotuloDatas, ini, fim };
          });
        }

        function normalizarCronograma(c, diasObra, status) {
          const etapas = (c && Array.isArray(c.etapas)) ? c.etapas.map(e => ({
            id: e.id ? String(e.id) : novoIdEtapa(),   // V21: id estavel por etapa
            desc: txt(e.desc),
            dias: parseNum(e.dias),
            feita: !!e.feita
          })) : gerarEtapasPadrao(diasObra);
          return {
            inicio: parseDataISO(c && c.inicio) ? c.inicio : '',
            fimDeSemana: !!(c && c.fimDeSemana),
            etapas: etapas
          };
        }

        // ---------------------------------------------------------------------
        // PARCELAS
        // ---------------------------------------------------------------------

        // Valor de cada parcela. Se os percentuais fecham 100%, a última parcela
        // absorve a diferença de centavos para a soma bater com o total.
        function valoresParcelas(parcelas, total) {
          const lista = parcelas || [];
          const soma = lista.reduce((s, p) => s + parseNum(p.pct), 0);
          const fecha100 = Math.abs(soma - 100) < 0.005;
          let acumulado = 0;
          return lista.map((p, i) => {
            let v = r2(parseNum(total) * parseNum(p.pct) / 100);
            if (fecha100 && i === lista.length - 1) v = r2(parseNum(total) - acumulado);
            acumulado = r2(acumulado + v);
            return v;
          });
        }

        function somaPctParcelas(parcelas) {
          return (parcelas || []).reduce((s, p) => s + parseNum(p.pct), 0);
        }

        function textoParcelas(parcelas) {
          return (parcelas || []).filter(p => parseNum(p.pct) > 0)
            .map(p => `${fmtPct(p.pct)}% – ${txt(p.desc)}`).join('; ');
        }

        // ---------------------------------------------------------------------
        // BANCO DE PROJETOS (localStorage)
        // ---------------------------------------------------------------------

        // Deixa qualquer projeto (inclusive os gravados pela V15 e V16) no formato atual
        // V21: barreira contra backup adulterado. O .json vem de fora, entao
        // nada dele entra no estado sem passar por aqui:
        //   - status fora da lista vira "A Confirmar" (o painel so sabe
        //     colourir os quatro estados oficiais)
        //   - id precisa ser inteiro: um id com texto viraria argumento de
        //     funcao dentro de um onclick="abrirDetalhes(...)"
        const STATUS_VALIDOS = ['A Confirmar', 'Agendado', 'Recebido', 'Rejeitado'];
        function normalizarStatus(st) {
          return STATUS_VALIDOS.indexOf(st) >= 0 ? st : 'A Confirmar';
        }
        function normalizarId(id) {
          const n = Number(id);
          return Number.isFinite(n) && n > 0 ? Math.trunc(n) : Date.now();
        }

        function normalizarProjeto(p) {
          const valor = r2(p.valor);
          const status = normalizarStatus(p.status);
          const dias = parseNum(p.dias) || 1;

          let taxa;
          if (p.taxaImposto !== undefined && p.taxaImposto !== null) {
            taxa = parseNum(p.taxaImposto);
          } else {
            // Projeto da V15: descobre a taxa pela relação entre os dois valores gravados
            const semNotaAntigo = parseNum(p.valorSemNota);
            taxa = semNotaAntigo > 0 ? r2((valor / semNotaAntigo - 1) * 100) : TAXA_IMPOSTO_PADRAO;
            if (!(taxa >= 0 && taxa <= 100)) taxa = TAXA_IMPOSTO_PADRAO;
          }

          const gastos = Array.isArray(p.gastosExecutados) ? p.gastosExecutados.map(g => ({
            item: txt(g.item),
            q: parseNum(g.q),
            v: parseNum(g.v),
            vPago: (g.vPago !== undefined && g.vPago !== null) ? parseNum(g.vPago) : parseNum(g.v),
            pago: !!g.pago
          })) : [];

          const tecnicos = Array.isArray(p.tecnicosObra) ? p.tecnicosObra.map(t => ({
            nome: txt(t.nome),
            dias: parseNum(t.dias),
            valor: parseNum(t.valor)
          })) : [];

          // Itens da proposta do cliente. Projeto antigo: só materiais, a preço de custo.
          const itensProposta = Array.isArray(p.itensProposta)
            ? p.itensProposta.map(i => ({
                grupo: GRUPOS_PROPOSTA.some(g => g.id === i.grupo) ? i.grupo : 'materiais',
                item: txt(i.item), q: parseNum(i.q), un: txt(i.un), v: parseNum(i.v)
              }))
            : gastos.map(g => ({ grupo: 'materiais', item: g.item, q: g.q, un: '', v: g.v }));

          // Parcelas. Projeto antigo: 40/30/30, já recebidas se o status era "Recebido".
          let parcelas = Array.isArray(p.parcelas) ? p.parcelas.map(x => ({
            desc: txt(x.desc),
            pct: parseNum(x.pct),
            recebido: !!x.recebido,
            data: parseDataISO(x.data) ? x.data : ''
          })) : PARCELAS_PADRAO.map(x => ({ desc: x.desc, pct: x.pct, recebido: status === 'Recebido', data: '' }));
          if (parcelas.length === 0) parcelas = [{ desc: 'Pagamento integral', pct: 100, recebido: status === 'Recebido', data: '' }];

          const cli = p.cliente || {};

          return {
            id: normalizarId(p.id),
            nome: p.nome === undefined || p.nome === null ? 'Projeto Sem Nome' : String(p.nome),
            dias: dias,
            status: status,
            data: p.data || '',
            validade: parseNum(p.validade) || 15,
            valor: valor,
            taxaImposto: taxa,
            valorSemNota: r2(valor / (1 + taxa / 100)),
            modalidade: p.modalidade === 'sem' ? 'sem' : 'com',
            cliente: {
              contato: txt(cli.contato),
              fone: txt(cli.fone),
              local: cli.local === undefined || cli.local === null ? LOCAL_PADRAO : String(cli.local)
            },
            itensProposta: itensProposta,
            propostaFechada: p.propostaFechada === true,
            cronograma: normalizarCronograma(p.cronograma, dias, status),
            parcelas: parcelas,
            gastosExecutados: gastos,
            tecnicosObra: tecnicos,
            executadoEditado: !!p.executadoEditado,
            orcamento: (p.orcamento && p.orcamento.campos) ? p.orcamento : null,
            custoMO: parseNum(p.custoMO),
            custoMat: parseNum(p.custoMat),
            custoLog: parseNum(p.custoLog),
            custoBase: parseNum(p.custoBase)
          };
        }

        function carregarProjetosStorage() {
          try {
            const bruto = JSON.parse(localStorage.getItem('ph_projetos') || '[]');
            bancoProjetos = Array.isArray(bruto) ? bruto.map(normalizarProjeto) : [];
          } catch (e) {
            bancoProjetos = [];
          }
        }

        // V21: um localStorage estourado (cota de ~5 MB) ou bloqueado (modo
        // privado) lancava excecao que ninguem via: a gravacao da vez se
        // perdia e o usuario achava que salvou. Num app que guarda financeiro
        // de cliente, isso e perda de dado silenciosa - o pior tipo de bug.
        function gravarProjetosStorage() {
          try {
            localStorage.setItem('ph_projetos', JSON.stringify(bancoProjetos));
            return true;
          } catch (e) {
            console.error('[PH Custos] falha ao gravar:', e);
            alert('Nao foi possivel gravar neste navegador.\n\n' +
              'O motivo e quase sempre o espaco do armazenamento local ou o modo\n' +
              'privado. Exporte um Backup agora, para nao perder o que voce digitou.\n' +
              'Causa: ' + (e && e.name ? e.name : 'desconhecida'));
            return false;
          }
        }

        // Conta única da obra, usada no modal de ajustes, no painel e na proposta.
        //   Com NF: cliente paga o valor cheio e o imposto sai dele.
        //   Sem NF: cliente paga o valor sem nota e não há imposto.
        //   Nos dois casos: resultado = valor sem NF - gastos executados.
        function resumoObra(p) {
          const valor = r2(p.valor);
          const taxa = parseNum(p.taxaImposto);
          const semNota = r2(valor / (1 + taxa / 100));
          const semNF = p.modalidade === 'sem';
          const valorCliente = semNF ? semNota : valor;
          const imposto = semNF ? 0 : r2(valor - semNota);

          let gastosInsumos = 0;
          (p.gastosExecutados || []).forEach(g => {
            const unit = (g.vPago !== undefined && g.vPago !== null) ? g.vPago : g.v;
            gastosInsumos += parseNum(g.q) * parseNum(unit);
          });

          let gastosEquipe = 0;
          (p.tecnicosObra || []).forEach(t => {
            gastosEquipe += parseNum(t.dias) * parseNum(t.valor);
          });

          const gastos = gastosInsumos + gastosEquipe;

          const parcelas = p.parcelas || [];
          const valores = valoresParcelas(parcelas, valorCliente);
          let recebido = 0;
          parcelas.forEach((x, i) => { if (x.recebido) recebido += valores[i]; });
          recebido = r2(recebido);
          const todasRecebidas = parcelas.length > 0 && parcelas.every(x => x.recebido);

          return {
            valor, taxa, semNota, imposto, valorCliente, semNF,
            gastosInsumos, gastosEquipe, gastos,
            resultado: valorCliente - imposto - gastos,
            valoresParcelas: valores, recebido,
            saldo: Math.max(0, r2(valorCliente - recebido)),
            todasRecebidas,
            algumaRecebida: parcelas.some(x => x.recebido)
          };
        }

        // Mantém o status coerente com as parcelas marcadas no modal
        function ajustarStatusPelasParcelas(p) {
          const todas = p.parcelas.length > 0 && p.parcelas.every(x => x.recebido);
          const alguma = p.parcelas.some(x => x.recebido);
          if (todas) p.status = 'Recebido';
          else if (alguma && p.status !== 'Agendado') p.status = 'Agendado';
          else if (!alguma && p.status === 'Recebido') p.status = 'Agendado';
        }

        // ---------------------------------------------------------------------
        // DADOS DA PH (aparecem na proposta)
        // ---------------------------------------------------------------------

        function carregarEmpresa() {
          try {
            const salvo = JSON.parse(localStorage.getItem('ph_empresa') || '{}');
            if (salvo && typeof salvo === 'object') {
              empresa.cnpj = txt(salvo.cnpj);
              empresa.contato = txt(salvo.contato);
              empresa.validade = parseNum(salvo.validade) || 15;
            }
          } catch (e) { /* mantém o padrão */ }

          // V21: estes campos so existem na pagina html/orcamento.html. Antes
          // de cada aba virar um HTML, esta funcao rodava em paginas onde os
          // ids nao existem e quebrava - Materiais e Equipe ficavam com a
          // tabela vazia e nenhum erro visivel.
          const comValor = function (id, v) {
            const el = document.getElementById(id);
            if (el) el.value = v;
          };
          comValor('emp-cnpj', empresa.cnpj);
          comValor('emp-contato', empresa.contato);
          comValor('emp-validade', empresa.validade);
        }

        function salvarEmpresa() {
          empresa.cnpj = document.getElementById('emp-cnpj').value.trim();
          empresa.contato = document.getElementById('emp-contato').value.trim();
          empresa.validade = Math.max(1, Math.round(parseNum(document.getElementById('emp-validade').value))) || 15;
          localStorage.setItem('ph_empresa', JSON.stringify(empresa));
        }