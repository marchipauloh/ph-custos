
        // ---------------------------------------------------------------------
        // ABAS
        // ---------------------------------------------------------------------

        function switchTab(tabKey) {
          document.querySelectorAll('.tab-section').forEach(sec => {
            sec.classList.add('hidden');
            sec.classList.remove('flex');
          });
          document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('bg-[#FF7A00]', 'text-white');
            btn.classList.add('text-slate-400', 'hover:bg-slate-800');
          });

          document.getElementById(`tab-${tabKey}`).classList.remove('hidden');
          document.getElementById(`tab-${tabKey}`).classList.add('flex');
          document.getElementById(`btn-${tabKey}`).classList.remove('text-slate-400', 'hover:bg-slate-800');
          document.getElementById(`btn-${tabKey}`).classList.add('bg-[#FF7A00]', 'text-white');

          if (tabKey === 'financeiro') renderizarFinanceiro();
          if (tabKey === 'equipe') renderTecnicos();
        }

        // ---------------------------------------------------------------------
        // ABA 2: MATERIAIS
        // Ao digitar, só o subtotal da linha e os totais são atualizados; a tabela
        // inteira só é redesenhada ao adicionar/remover (senão o campo perde o foco).
        // ---------------------------------------------------------------------

        function renderTabelaMateriais() {
          const tbody = document.getElementById('tabela-mat-body');
          tbody.innerHTML = '';
          materiaisData.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.className = index % 2 === 0 ? 'bg-slate-900/40' : '';
            tr.innerHTML = `
              <td class="p-2 font-medium text-slate-200"><input type="text" value="${esc(item.prod)}" oninput="atualizarMat(${index}, 'prod', this.value)" class="w-full p-1 text-xs rounded border"></td>
              <td class="p-2 text-slate-400"><input type="text" value="${esc(item.marca)}" oninput="atualizarMat(${index}, 'marca', this.value)" class="w-full p-1 text-xs rounded border"></td>
              <td class="p-2 text-center"><input type="number" value="${parseNum(item.q)}" min="0" step="any" oninput="atualizarMat(${index}, 'q', this.value)" class="w-14 p-1 text-center rounded border"></td>
              <td class="p-2 text-center"><input type="number" value="${parseNum(item.v)}" step="0.01" min="0" oninput="atualizarMat(${index}, 'v', this.value)" class="w-20 p-1 text-center rounded border"></td>
              <td id="mat-sub-${index}" class="p-2 text-right font-bold text-slate-100">${fmt(parseNum(item.q) * parseNum(item.v))}</td>
              <td class="p-2 text-center"><button onclick="removerMaterial(${index})" class="text-slate-500 hover:text-rose-400 p-1"><i class="fa-solid fa-trash-can"></i></button></td>
            `;
            tbody.appendChild(tr);
          });
        }

        function atualizarMat(index, campo, valor) {
          const item = materiaisData[index];
          if (!item) return;
          if (campo === 'q' || campo === 'v') {
            item[campo] = parseNum(valor);
            setTexto(`mat-sub-${index}`, fmt(item.q * item.v));
            calcular();
          } else {
            item[campo] = valor;
          }
        }

        function adicionarMaterial() {
          materiaisData.push({ prod: "Novo Item Adicionado", marca: "Marca/Loja", q: 1, v: 50 });
          renderTabelaMateriais();
          calcular();
        }

        function removerMaterial(index) {
          materiaisData.splice(index, 1);
          renderTabelaMateriais();
          calcular();
        }

        // ---------------------------------------------------------------------
        // ABA 3: EQUIPE
        // ---------------------------------------------------------------------

        function totalEquipe() {
          let total = 0;
          tecnicosData.forEach(t => { total += parseNum(t.dias) * parseNum(t.valor); });
          return total;
        }

        // Mostra a diferença entre a mão de obra que entrou no preço (Aba 1) e a
        // equipe escalada aqui (que vira gasto da obra)
        function atualizarComparativoEquipe() {
          const el = document.getElementById('equipe-comparativo');
          if (!el || !ultimoCalculo) return;
          const orcado = ultimoCalculo.totalMO;
          const escalado = totalEquipe();
          const dif = r2(escalado - orcado);
          if (Math.abs(dif) < 0.01) {
            el.innerText = `Igual à mão de obra orçada na Aba 1 (${fmt(orcado)}).`;
            el.className = 'text-[11px] text-emerald-400';
          } else {
            el.innerText = `Mão de obra orçada na Aba 1: ${fmt(orcado)}. A equipe escalada está ${fmt(Math.abs(dif))} ${dif > 0 ? 'acima' : 'abaixo'} — essa diferença ${dif > 0 ? 'sai do' : 'entra no'} lucro da obra.`;
            el.className = 'text-[11px] text-amber-400';
          }
        }

        function renderTecnicos() {
          const container = document.getElementById('lista-tecnicos');
          let html = '';

          tecnicosData.forEach((t, index) => {
            const subtotal = parseNum(t.dias) * parseNum(t.valor);
            html += `
              <div class="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div class="w-full sm:w-1/3">
                  <input type="text" value="${esc(t.nome)}" oninput="atualizarTecnico(${index}, 'nome', this.value)" placeholder="Nome / Função" class="w-full p-1.5 rounded border font-semibold">
                </div>
                <div class="flex items-center gap-2 w-full sm:w-auto">
                  <span class="text-slate-400">Dias:</span>
                  <input type="number" value="${parseNum(t.dias)}" min="0" step="any" oninput="atualizarTecnico(${index}, 'dias', this.value)" class="w-16 p-1 rounded border text-center">
                  <span class="text-slate-400">Diária R$:</span>
                  <input type="number" value="${parseNum(t.valor)}" step="0.01" min="0" oninput="atualizarTecnico(${index}, 'valor', this.value)" class="w-20 p-1 rounded border text-center">
                </div>
                <div class="flex items-center justify-between w-full sm:w-auto gap-3">
                  <strong id="tec-sub-${index}" class="text-orange-400 font-bold">${fmt(subtotal)}</strong>
                  <button onclick="removerTecnico(${index})" class="text-slate-500 hover:text-rose-400"><i class="fa-solid fa-trash-can"></i></button>
                </div>
              </div>
            `;
          });

          container.innerHTML = html;
          setTexto('total-custo-equipe', fmt(totalEquipe()));
          atualizarComparativoEquipe();
        }

        function atualizarTecnico(index, campo, valor) {
          const t = tecnicosData[index];
          if (!t) return;
          if (campo === 'dias' || campo === 'valor') {
            t[campo] = parseNum(valor);
            setTexto(`tec-sub-${index}`, fmt(t.dias * t.valor));
            setTexto('total-custo-equipe', fmt(totalEquipe()));
            atualizarComparativoEquipe();
          } else {
            t[campo] = valor;
          }
        }

        function adicionarTecnico() {
          tecnicosData.push({ nome: "Novo Integrante", dias: 5, valor: 450 });
          renderTecnicos();
        }

        function removerTecnico(index) {
          tecnicosData.splice(index, 1);
          renderTecnicos();
        }

        // ---------------------------------------------------------------------
        // CRONOGRAMA E PARCELAS: telas de edição
        // Os dois blocos existem em dois lugares, com o mesmo código:
        //   ctx 'orc'  = Aba 1 (orçamento que está sendo montado)
        //   ctx 'obra' = modal de ajustes (obra já salva; tem "feita"/"recebido")
        // ---------------------------------------------------------------------

        function cronoDe(ctx) { return ctx === 'obra' ? editCronograma : cronogramaData; }
        function parcelasDe(ctx) { return ctx === 'obra' ? editParcelas : parcelasData; }

        function diasOrcamento() {
          // valorCampo: este campo so existe na pagina html/orcamento.html.
          return Math.max(1, Math.round(parseNum(valorCampo('proj-dias'))));
        }

        function renderCronograma(ctx) {
          const c = cronoDe(ctx);
          const exec = ctx === 'obra';

          // V21: o cronograma so existe na pagina html/orcamento.html (ctx
          // "orc") e dentro do modal (ctx "obra"). calcular() chama isto em
          // toda pagina para montar o cronograma sugerido - nas outras,
          // estes ids nao existem e a chamada quebrava. Se a lista nao esta na
          // tela, e so estado: o cronograma e guardado mesmo assim.
          const elInicio = document.getElementById(`crono-inicio-${ctx}`);
          if (!elInicio) return;
          elInicio.value = c.inicio || '';
          document.getElementById(`crono-fds-${ctx}`).checked = !!c.fimDeSemana;

          let html = '';
          c.etapas.forEach((e, i) => {
            html += `
              <div class="flex flex-col sm:flex-row sm:items-center gap-1.5 bg-slate-900 p-1.5 rounded border border-slate-800">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  ${exec ? `<input type="checkbox" ${e.feita ? 'checked' : ''} onchange="cronoSet('${ctx}', ${i}, 'feita', this.checked)" title="Etapa concluída" class="w-4 h-4 shrink-0 cursor-pointer">` : ''}
                  <span class="w-4 text-center text-slate-500 font-bold shrink-0">${i + 1}</span>
                  <input type="text" value="${esc(e.desc)}" oninput="cronoSet('${ctx}', ${i}, 'desc', this.value)" placeholder="Descrição da etapa" class="flex-1 min-w-0 p-1 rounded border">
                </div>
                <div class="flex items-center justify-between sm:justify-end gap-2">
                  <span class="text-slate-400 text-[11px]">Dias:</span>
                  <input type="number" value="${parseNum(e.dias)}" min="0" step="1" oninput="cronoSet('${ctx}', ${i}, 'dias', this.value)" class="w-14 p-1 rounded border text-center">
                  <span id="crono-per-${ctx}-${i}" class="w-40 text-right text-[11px] font-semibold text-orange-300"></span>
                  <button onclick="cronoDel('${ctx}', ${i})" title="Remover etapa" class="text-slate-500 hover:text-rose-400 p-1"><i class="fa-solid fa-trash-can"></i></button>
                </div>
              </div>
            `;
          });
          document.getElementById(`crono-lista-${ctx}`).innerHTML = html || `<span class="text-slate-500 text-[11px]">Nenhuma etapa no cronograma.</span>`;
          atualizarCronogramaUI(ctx);
        }

        // Atualiza só os períodos e o aviso (sem redesenhar os campos)
        function atualizarCronogramaUI(ctx) {
          const c = cronoDe(ctx);
          const periodos = calcularPeriodos(c);
          periodos.forEach((p, i) => setTexto(`crono-per-${ctx}-${i}`, p.datas ? `${p.dias} • ${p.datas}` : p.dias));

          const total = totalDiasCronograma(c);
          const ref = ctx === 'obra' ? editDiasObra : diasOrcamento();
          const comData = periodos.filter(p => p.ini);
          let msg = `Cronograma: ${total} ${total === 1 ? 'dia' : 'dias'} ${c.fimDeSemana ? 'corridos' : 'úteis'}`;
          if (comData.length > 0) msg += ` • de ${dataLonga(comData[0].ini)} a ${dataLonga(comData[comData.length - 1].fim)}`;
          const difere = total !== Math.round(ref);
          if (difere) msg += ` — a obra está orçada em ${Math.round(ref)} ${Math.round(ref) === 1 ? 'dia' : 'dias'}`;

          const aviso = document.getElementById(`crono-aviso-${ctx}`);
          if (aviso) {
            aviso.innerText = msg + '.';
            aviso.className = `text-[11px] ${difere ? 'text-amber-400' : 'text-slate-400'}`;
          }
        }

        function cronoSet(ctx, i, campo, valor) {
          const e = cronoDe(ctx).etapas[i];
          if (!e) return;
          if (campo === 'dias') {
            e.dias = parseNum(valor);
            atualizarCronogramaUI(ctx);
          } else if (campo === 'feita') {
            e.feita = !!valor;
          } else {
            e[campo] = valor;
          }
          if (ctx === 'orc' && campo !== 'feita') cronogramaManual = true;
        }

        function cronoCfg(ctx, campo, valor) {
          cronoDe(ctx)[campo] = valor;
          atualizarCronogramaUI(ctx);
        }

        function cronoAdd(ctx) {
          cronoDe(ctx).etapas.push({ id: novoIdEtapa(), desc: 'Nova etapa', dias: 1, feita: false });
          if (ctx === 'orc') cronogramaManual = true;
          renderCronograma(ctx);
        }

        function cronoDel(ctx, i) {
          cronoDe(ctx).etapas.splice(i, 1);
          if (ctx === 'orc') cronogramaManual = true;
          renderCronograma(ctx);
        }

        // Refaz as etapas sugeridas a partir do número de dias
        function cronoRegerar(ctx) {
          const c = cronoDe(ctx);
          if (ctx === 'orc') {
            c.etapas = gerarEtapasPadrao(diasOrcamento());
            cronogramaManual = false;
          } else {
            c.etapas = gerarEtapasPadrao(editDiasObra);
          }
          renderCronograma(ctx);
        }

        function renderParcelas(ctx) {
          const lista = parcelasDe(ctx);
          const exec = ctx === 'obra';

          // V21: mesmo caso do cronograma - a lista so existe na Aba 1
          // (ctx 'orc') e no modal (ctx 'obra'). calcular() chama isto em
          // todas as paginas; sem esta guarda, quebrava nas outras.
          const elLista = document.getElementById(`parc-lista-${ctx}`);
          if (!elLista) return;
          let html = '';
          lista.forEach((p, i) => {
            html += `
              <div id="parc-row-${ctx}-${i}" class="flex flex-col sm:flex-row sm:items-center gap-1.5 p-1.5 rounded border border-slate-800 ${exec && p.recebido ? 'bg-emerald-950/30' : 'bg-slate-900'}">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  ${exec ? `<input type="checkbox" ${p.recebido ? 'checked' : ''} onchange="parcSet('${ctx}', ${i}, 'recebido', this.checked)" title="Parcela recebida" class="w-4 h-4 shrink-0 cursor-pointer">` : ''}
                  <input type="text" value="${esc(p.desc)}" oninput="parcSet('${ctx}', ${i}, 'desc', this.value)" placeholder="Descrição da parcela" class="flex-1 min-w-0 p-1 rounded border">
                </div>
                <div class="flex flex-wrap items-center justify-between sm:justify-end gap-2">
                  <span class="flex items-center gap-1">
                    <input type="number" value="${parseNum(p.pct)}" min="0" max="100" step="any" oninput="parcSet('${ctx}', ${i}, 'pct', this.value)" class="w-14 p-1 rounded border text-center">
                    <span class="text-slate-400">%</span>
                  </span>
                  <strong id="parc-val-${ctx}-${i}" class="w-28 text-right text-orange-300"></strong>
                  ${exec ? `<input type="date" id="parc-data-${ctx}-${i}" value="${esc(p.data)}" ${p.recebido ? '' : 'disabled'} oninput="parcSet('${ctx}', ${i}, 'data', this.value)" title="Data do recebimento" class="p-1 rounded border disabled:opacity-40">` : ''}
                  <button onclick="parcDel('${ctx}', ${i})" title="Remover parcela" class="text-slate-500 hover:text-rose-400 p-1"><i class="fa-solid fa-trash-can"></i></button>
                </div>
              </div>
            `;
          });
          elLista.innerHTML = html || `<span class="text-slate-500 text-[11px]">Nenhuma parcela cadastrada.</span>`;
          if (ctx === 'obra') recalcularEdit(); else atualizarParcelasUI('orc');
        }

        // Atualiza valores e avisos das parcelas (sem redesenhar os campos)
        function atualizarParcelasUI(ctx, resumo) {
          const lista = parcelasDe(ctx);
          const total = ctx === 'obra'
            ? (resumo ? resumo.valorCliente : 0)
            : (ultimoCalculo ? (modalidadeOrc === 'sem' ? ultimoCalculo.valorSemNota : ultimoCalculo.valorComNota) : 0);
          const valores = valoresParcelas(lista, total);
          valores.forEach((v, i) => setTexto(`parc-val-${ctx}-${i}`, fmt(v)));

          const soma = somaPctParcelas(lista);
          const fecha = Math.abs(soma - 100) < 0.005;
          const aviso = document.getElementById(`parc-aviso-${ctx}`);
          if (!aviso) return;

          let msg;
          if (ctx === 'obra') {
            msg = `Recebido: ${fmt(resumo.recebido)} de ${fmt(resumo.valorCliente)} • Falta receber: ${fmt(resumo.saldo)}`;
          } else {
            msg = `Valores sobre a ${modalidadeOrc === 'sem' ? 'Opção A (sem NF)' : 'Opção B (com NF)'}: ${fmt(total)}`;
          }
          if (!fecha) msg += ` — atenção: as parcelas somam ${fmtPct(soma)}%, não 100%`;
          aviso.innerText = msg + '.';
          aviso.className = `text-[11px] ${fecha ? 'text-slate-400' : 'text-amber-400'}`;
        }

        function parcSet(ctx, i, campo, valor) {
          const p = parcelasDe(ctx)[i];
          if (!p) return;
          if (campo === 'pct') {
            p.pct = parseNum(valor);
          } else if (campo === 'recebido') {
            p.recebido = !!valor;
            p.data = p.recebido ? (p.data || hojeISO()) : '';
            const campoData = document.getElementById(`parc-data-${ctx}-${i}`);
            if (campoData) { campoData.value = p.data; campoData.disabled = !p.recebido; }
            const linha = document.getElementById(`parc-row-${ctx}-${i}`);
            if (linha) {
              linha.classList.toggle('bg-emerald-950/30', p.recebido);
              linha.classList.toggle('bg-slate-900', !p.recebido);
            }
          } else {
            p[campo] = valor;
          }
          if (campo === 'pct' || campo === 'recebido') {
            if (ctx === 'obra') recalcularEdit(); else atualizarParcelasUI('orc');
          }
        }

        function parcAdd(ctx) {
          const lista = parcelasDe(ctx);
          const falta = Math.max(0, Math.round((100 - somaPctParcelas(lista)) * 100) / 100);
          lista.push(ctx === 'obra'
            ? { desc: 'Nova parcela', pct: falta, recebido: false, data: '' }
            : { desc: 'Nova parcela', pct: falta });
          renderParcelas(ctx);
        }

        function parcDel(ctx, i) {
          parcelasDe(ctx).splice(i, 1);
          renderParcelas(ctx);
        }

        // ---------------------------------------------------------------------
        // ABA 1: CÁLCULO DO ORÇAMENTO
        // V17: o preço passa a ser a SOMA dos itens da proposta. Cada item recebe
        // reserva e margem (custo x fator), o unitário é arredondado para centavos
        // e a Opção A é a soma das linhas - assim a tabela do cliente fecha exata.
        // ---------------------------------------------------------------------

        // V21: calcular() redesenha cronograma, parcelas, equipe e totais, e
        // roda em cada tecla digitada (oninput). Em obra com muito material,
        // refazer tudo isso por caractere trava a tela. O debounce de 150 ms
        // agrupa a rajada de teclas.
        let _calcTimer = null;
        function agendarCalcular() {
          if (_calcTimer) clearTimeout(_calcTimer);
          _calcTimer = setTimeout(function () { _calcTimer = null; calcular(); }, 150);
        }

        // V21: os campos da Aba 1 (proj-dias, eng-q, taxa-imposto...) so
        // existem na pagina html/orcamento.html, mas calcular() tambem roda
        // nas outras: a Aba 2 mostra o total de materiais e a Aba 3 compara
        // a equipe escalada com a mao de obra orcada. Ler direto do DOM
        // quebrava nas outras paginas. valorCampo() le da tela quando o
        // campo existe e do rascunho quando nao existe.
        function calcular() {
          const dias = Math.max(1, parseNum(valorCampo('proj-dias')));

          const engQ = parseNum(valorCampo('eng-q'));
          const engV = parseNum(valorCampo('eng-v'));
          const tecQ = parseNum(valorCampo('tec-q'));
          const tecV = parseNum(valorCampo('tec-v'));
          const auxQ = parseNum(valorCampo('aux-q'));
          const auxV = parseNum(valorCampo('aux-v'));
          const totalMO = ((engQ * engV) + (tecQ * tecV) + (auxQ * auxV)) * dias;

          const alimQ = parseNum(valorCampo('alim-q'));
          const alimV = parseNum(valorCampo('alim-v'));
          const totalPessoas = engQ + tecQ + auxQ;
          const qtdRefeicoes = totalPessoas * alimQ * dias;
          const totalAlim = qtdRefeicoes * alimV;

          const carroKm = parseNum(valorCampo('carro-km'));
          const carroPed = parseNum(valorCampo('carro-ped'));
          const totalCarro = (carroKm * 1) + carroPed;

          // O campo "Pessoas" é o que liga o hotel ao grupo: zerando ele, o
          // hotel sai da proposta (equipe que dorme em casa). A fórmula antiga
          // multiplicava e depois dividia pelo mesmo número, então o campo
          // nunca zerava nada - o comentário prometia um comportamento que
          // nunca existiu no código.
          const hotelDias = parseNum(valorCampo('hotel-dias'));
          const hotelPess = parseNum(valorCampo('hotel-pess'));
          const hotelV = parseNum(valorCampo('hotel-v'));
          const totalHotel = hotelPess > 0 ? r2(hotelDias * hotelV) : 0;

          const totalLogistica = totalAlim + totalCarro + totalHotel;

          let totalMateriais = 0;
          materiaisData.forEach(item => { totalMateriais += (parseNum(item.q) * parseNum(item.v)); });
          setTexto('mat-total-geral', fmt(totalMateriais));

          const valProjetoFixo = parseNum(valorCampo('proj-valor-fixo'));
          const custoBase = totalMO + totalLogistica + totalMateriais + valProjetoFixo;

          const taxaReservaPct = parseNum(valorCampo('taxa-reserva'));
          const taxaMargemPct = parseNum(valorCampo('taxa-margem'));
          const taxaImpostoPct = parseNum(valorCampo('taxa-imposto'));
          const fator = (1 + taxaReservaPct / 100) * (1 + taxaMargemPct / 100);

          // Itens da proposta, já a preço de venda
          const itens = [];
          const add = (grupo, item, q, un, custoUnit) => {
            if (q > 0) itens.push({ grupo, item, q: Math.round(q * 1000) / 1000, un, v: r2(custoUnit * fator) });
          };
          if (valProjetoFixo > 0) add('servicos', 'Elaboração do projeto luminotécnico e mapa DMX', 1, 'un', valProjetoFixo);
          if (engV > 0) add('servicos', 'Engenharia e coordenação técnica', engQ * dias, 'diária', engV);
          if (tecV > 0) add('servicos', 'Técnico de montagem e instalação', tecQ * dias, 'diária', tecV);
          if (auxV > 0) add('servicos', 'Auxiliar de montagem', auxQ * dias, 'diária', auxV);
          materiaisData.forEach(m => add('materiais', txt(m.prod), parseNum(m.q), '', parseNum(m.v)));
          if (totalLogistica > 0) add('logistica', 'Logística: deslocamento, hospedagem e alimentação da equipe', 1, 'verba', totalLogistica);

          const valorSemNota = r2(itens.reduce((s, i) => s + r2(i.q * i.v), 0));
          const valorComNota = r2(valorSemNota * (1 + taxaImpostoPct / 100));

          setTexto('card-cost-mo', fmt(totalMO));
          setTexto('card-cost-mat', fmt(totalMateriais));
          setTexto('card-cost-log', fmt(totalLogistica));
          setTexto('card-cost-total', fmt(custoBase));

          setTexto('res-sem-nota', fmt(valorSemNota));
          setTexto('res-com-nota', fmt(valorComNota));
          setTexto('nota-fator', `Cada item da proposta sai com reserva e margem embutidas (custo × ${fator.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}). A Opção A é a soma dos itens.`);

          ultimoCalculo = {
            dias, totalMO, totalMateriais, totalLogistica, custoBase,
            qtdRefeicoes, alimV, totalAlim, totalCarro, hotelDias, totalHotel,
            taxaImpostoPct, fator, itens, valorSemNota, valorComNota
          };

          // Cronograma acompanha os dias enquanto o usuário não editou as etapas
          if (!cronogramaManual && totalDiasCronograma(cronogramaData) !== diasOrcamento()) {
            cronogramaData.etapas = gerarEtapasPadrao(diasOrcamento());
            renderCronograma('orc');
          } else {
            atualizarCronogramaUI('orc');
          }
          atualizarParcelasUI('orc');
          atualizarComparativoEquipe();

          return ultimoCalculo;
        }

        // Opção que o cliente escolheu (A = sem NF, B = com NF). Vale para as
        // parcelas e, depois de salvar, para o financeiro da obra.
        function selecionarOpcao(modalidade) {
          modalidadeOrc = modalidade === 'sem' ? 'sem' : 'com';
          atualizarOpcaoUI();
          atualizarParcelasUI('orc');
        }

        function atualizarOpcaoUI() {
          ['sem', 'com'].forEach(m => {
            const ativa = m === modalidadeOrc;
            const box = document.getElementById(`box-opcao-${m}`);
            box.className = 'text-left p-3 rounded-xl border-2 transition-all ' + (ativa
              ? 'bg-orange-950/40 border-[#FF7A00] text-[#FF7A00]'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 opacity-60 hover:opacity-100');
            box.setAttribute('aria-pressed', ativa ? 'true' : 'false');
            setTexto(`tag-opcao-${m}`, ativa ? '✅' : '⚪');
          });
        }

        // Lista inicial de gastos da obra: materiais + logística, a preço de custo
        function gerarGastosIniciais(c) {
          const gastos = materiaisData.map(m => ({
            item: txt(m.prod),
            q: parseNum(m.q),
            v: parseNum(m.v),
            vPago: parseNum(m.v),
            pago: false
          }));
          const addLogistica = (item, q, v) => {
            if (q > 0 && v > 0) gastos.push({ item, q: r2(q), v: r2(v), vPago: r2(v), pago: false });
          };
          addLogistica('Alimentação da equipe (refeições)', c.qtdRefeicoes, c.alimV);
          addLogistica('Deslocamento (km + pedágio)', 1, c.totalCarro);
          addLogistica('Hospedagem (diárias)', c.hotelDias, c.hotelDias > 0 ? c.totalHotel / c.hotelDias : 0);
          return gastos;
        }

        // Tudo o que foi digitado nas Abas 1, 2 e 3, para poder reabrir depois
        function capturarOrcamento() {
          const campos = {};
          CAMPOS_ORCAMENTO.forEach(id => { campos[id] = document.getElementById(id).value; });
          return { campos, materiais: clone(materiaisData), equipe: clone(tecnicosData) };
        }

        function lerCliente() {
          return {
            contato: document.getElementById('cli-contato').value.trim(),
            fone: document.getElementById('cli-fone').value.trim(),
            local: document.getElementById('cli-local').value.trim()
          };
        }

        // comoNova = true força a criação de uma proposta nova mesmo em modo edição
        // V21: sem trava, dois cliques rapidos em "Salvar" criavam DUAS propostas.
        let _salvarTravado = false;
        function salvarOrcamento(comoNova) {
          if (_salvarTravado) return;
          _salvarTravado = true;
          try {
            salvarOrcamentoInterno(comoNova);
          } finally {
            _salvarTravado = false;
          }
        }

        function salvarOrcamentoInterno(comoNova) {
          carregarProjetosStorage();
          const c = calcular();
          const nome = document.getElementById('proj-nome').value.trim() || 'Projeto Sem Nome';

          let existente = null;
          if (orcamentoEditandoId !== null && !comoNova) {
            existente = bancoProjetos.find(p => p.id === orcamentoEditandoId) || null;
          }

          // Parte da proposta que vem do orçamento (igual para nova ou atualizada)
          const dados = {
            nome: nome,
            dias: c.dias,
            validade: empresa.validade,
            valor: c.valorComNota,
            taxaImposto: c.taxaImpostoPct,
            valorSemNota: c.valorSemNota,
            modalidade: modalidadeOrc,
            cliente: lerCliente(),
            itensProposta: clone(c.itens),
            propostaFechada: true,
            orcamento: capturarOrcamento(),
            custoMO: r2(c.totalMO),
            custoMat: r2(c.totalMateriais),
            custoLog: r2(c.totalLogistica),
            custoBase: r2(c.custoBase)
          };

          if (existente) {
            // Atualiza a proposta, preservando o que já aconteceu na obra
            Object.assign(existente, dados);
            existente.cronograma = {
              inicio: cronogramaData.inicio,
              fimDeSemana: cronogramaData.fimDeSemana,
              // V21: o "feito" segue a etapa pelo id. Pelo indice, apagar ou
              // reordenar uma etapa deslocava a marcacao das outras.
              etapas: cronogramaData.etapas.map(e => {
                const antiga = existente.cronograma.etapas.find(x => x.id === e.id);
                return { id: e.id, desc: e.desc, dias: parseNum(e.dias), feita: !!(antiga && antiga.feita) };
              })
            };
            existente.parcelas = parcelasData.map((x, i) => ({
              desc: x.desc, pct: parseNum(x.pct),
              recebido: !!(existente.parcelas[i] && existente.parcelas[i].recebido),
              data: (existente.parcelas[i] && existente.parcelas[i].recebido) ? existente.parcelas[i].data : ''
            }));
            const manteveGastos = existente.executadoEditado;
            if (!manteveGastos) {
              existente.gastosExecutados = gerarGastosIniciais(c);
              existente.tecnicosObra = tecnicosData.map(t => ({ nome: t.nome, dias: parseNum(t.dias), valor: parseNum(t.valor) }));
            }
            ajustarStatusPelasParcelas(existente);
            gravarProjetosStorage();
            sairModoEdicao();
            renderizarFinanceiro();
            alert(`Proposta de "${nome}" atualizada.` + (manteveGastos ? '\
    \
    Os gastos e a equipe já lançados na obra foram mantidos como estavam.' : ''));
            return;
          }

          const status = document.getElementById('status-projeto').value;
          const jaPago = status === 'Recebido';
          const novo = Object.assign({
            id: Date.now(),
            status: status,
            data: new Date().toLocaleDateString('pt-BR'),
            cronograma: {
              inicio: cronogramaData.inicio,
              fimDeSemana: cronogramaData.fimDeSemana,
              etapas: cronogramaData.etapas.map(e => ({ id: e.id || novoIdEtapa(), desc: e.desc, dias: parseNum(e.dias), feita: false }))
            },
            parcelas: parcelasData.map(x => ({ desc: x.desc, pct: parseNum(x.pct), recebido: jaPago, data: jaPago ? hojeISO() : '' })),
            gastosExecutados: gerarGastosIniciais(c),
            tecnicosObra: tecnicosData.map(t => ({ nome: t.nome, dias: parseNum(t.dias), valor: parseNum(t.valor) })),
            executadoEditado: false
          }, dados);

          bancoProjetos.push(novo);
          gravarProjetosStorage();
          if (orcamentoEditandoId !== null) sairModoEdicao();
          renderizarFinanceiro();
          alert(`Proposta para "${nome}" gravada no Financeiro!`);

          // V21: depois de gravar, o backup .json vai sozinho para a pasta
          // oficial. A pergunta que fica depois de "Salvar proposta" e "e
          // agora, onde foi parar?" - e a resposta e dada aqui, sem o
          // usuario precisar lembrar de exportar. Falha nao atrapalha o
          // fluxo: a proposta ja esta salva no navegador.
          if (typeof exportarBackupSilencioso === 'function') {
            exportarBackupSilencioso();
          }
        }

        // ---------------------------------------------------------------------
        // REABRIR UMA PROPOSTA SALVA NA ABA 1
        // ---------------------------------------------------------------------

        function reabrirOrcamento(id) {
          carregarProjetosStorage();
          const p = bancoProjetos.find(item => item.id === id);
          if (!p) return;
          if (!p.orcamento) {
            alert('Esta proposta foi gravada em uma versão antiga e não guardou os dados do orçamento.\
    Dá para ajustar valores e gastos pelo botão de ajustes da obra.');
            return;
          }
          if (!confirm(`Carregar a proposta "${p.nome}" na Aba 1 para editar?\
    \
    O que está preenchido agora nas abas 1, 2 e 3 será substituído.`)) return;

          CAMPOS_ORCAMENTO.forEach(campo => {
            if (p.orcamento.campos[campo] !== undefined) document.getElementById(campo).value = p.orcamento.campos[campo];
          });
          document.getElementById('proj-nome').value = p.nome;
          document.getElementById('cli-contato').value = p.cliente.contato;
          document.getElementById('cli-fone').value = p.cliente.fone;
          document.getElementById('cli-local').value = p.cliente.local;

          materiaisData = clone(p.orcamento.materiais || []);
          tecnicosData = clone(p.orcamento.equipe || []);
          cronogramaData = clone(p.cronograma);
          cronogramaManual = true;
          parcelasData = p.parcelas.map(x => ({ desc: x.desc, pct: x.pct }));
          modalidadeOrc = p.modalidade;
          atualizarOpcaoUI();
          orcamentoEditandoId = id;

          renderTabelaMateriais();
          renderTecnicos();
          renderCronograma('orc');
          renderParcelas('orc');
          calcular();
          atualizarModoEdicao();
          switchTab('orcamento');
          window.scrollTo(0, 0);
        }

        function atualizarModoEdicao() {
          const banner = document.getElementById('banner-edicao');
          const editando = orcamentoEditandoId !== null;
          banner.classList.toggle('hidden', !editando);
          banner.classList.toggle('flex', editando);
          document.getElementById('bloco-status-inicial').classList.toggle('hidden', editando);
          if (editando) {
            const p = bancoProjetos.find(item => item.id === orcamentoEditandoId);
            setTexto('banner-edicao-texto', p ? `Editando a proposta #${numeroProposta(p)} — ${p.nome}` : 'Editando proposta');
          }
          setTexto('lbl-salvar-orc', editando ? 'Salvar alterações da proposta' : 'Salvar no Financeiro');
        }

        function sairModoEdicao() {
          orcamentoEditandoId = null;
          atualizarModoEdicao();
        }

        // ---------------------------------------------------------------------
        // MODAL: AJUSTES DA OBRA (EXECUTADO, RECEBIMENTOS E CRONOGRAMA)
        // ---------------------------------------------------------------------

        function abrirModalEdit(id) {
          carregarProjetosStorage();
          const p = bancoProjetos.find(item => item.id === id);
          if (!p) return;
          projetoEditandoId = id;

          document.getElementById('modal-edit-titulo').innerText = `Ajustes da Obra: ${p.nome}`;
          document.getElementById('edit-val-orcado').value = p.valor;
          document.getElementById('edit-taxa-imposto').value = p.taxaImposto;
          document.getElementById('edit-modalidade').value = p.modalidade;

          editGastosLista = clone(p.gastosExecutados);
          editTecnicosLista = clone(p.tecnicosObra);
          editParcelas = clone(p.parcelas);
          editCronograma = clone(p.cronograma);
          editDiasObra = p.dias;
          editExecutadoOriginal = JSON.stringify([editGastosLista, editTecnicosLista]);

          renderGastosModalEdit();
          renderTecnicosModalEdit();
          renderCronograma('obra');
          renderParcelas('obra');   // já chama recalcularEdit()

          const modal = document.getElementById('modal-editar');
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        }

        function fecharModalEdit() {
          const modal = document.getElementById('modal-editar');
          modal.classList.remove('flex');
          modal.classList.add('hidden');
          projetoEditandoId = null;
        }

        function renderGastosModalEdit() {
          const tbody = document.getElementById('tabela-gastos-obra-body');
          tbody.innerHTML = '';

          if (editGastosLista.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="p-2 text-center text-slate-500">Nenhum gasto lançado para esta obra ainda.</td></tr>`;
            return;
          }

          editGastosLista.forEach((g, idx) => {
            const sub = parseNum(g.q) * parseNum(g.vPago);
            const tr = document.createElement('tr');
            tr.id = `gasto-row-${idx}`;
            tr.className = g.pago ? 'bg-emerald-950/30' : '';
            tr.innerHTML = `
              <td class="p-1 text-center">
                <input type="checkbox" ${g.pago ? 'checked' : ''} onchange="updateGasto(${idx}, 'pago', this.checked)" class="w-4 h-4 text-[#FF7A00] rounded border-slate-700 bg-slate-900 cursor-pointer">
              </td>
              <td class="p-1"><input type="text" value="${esc(g.item)}" oninput="updateGasto(${idx}, 'item', this.value)" class="w-full p-1 rounded border"></td>
              <td class="p-1 text-center"><input type="number" value="${parseNum(g.q)}" min="0" step="any" oninput="updateGasto(${idx}, 'q', this.value)" class="w-14 p-1 rounded border text-center"></td>
              <td class="p-1 text-center"><input type="number" value="${parseNum(g.v)}" step="0.01" min="0" oninput="updateGasto(${idx}, 'v', this.value)" class="w-20 p-1 rounded border text-center text-slate-400"></td>
              <td class="p-1 text-center"><input type="number" value="${parseNum(g.vPago)}" step="0.01" min="0" oninput="updateGasto(${idx}, 'vPago', this.value)" class="w-20 p-1 rounded border text-center font-bold text-[#FF7A00]"></td>
              <td id="gasto-sub-${idx}" class="p-1 text-right font-bold text-slate-200">${fmt(sub)}</td>
              <td class="p-1 text-center"><button onclick="delGasto(${idx})" class="text-slate-500 hover:text-rose-400 p-1"><i class="fa-solid fa-trash-can"></i></button></td>
            `;
            tbody.appendChild(tr);
          });
        }

        // Atualiza só a linha editada (sem redesenhar a tabela a cada tecla)
        function updateGasto(idx, field, val) {
          const g = editGastosLista[idx];
          if (!g) return;

          if (field === 'q' || field === 'v' || field === 'vPago') {
            g[field] = parseNum(val);
            setTexto(`gasto-sub-${idx}`, fmt(g.q * g.vPago));
            recalcularEdit();
          } else if (field === 'pago') {
            g.pago = !!val;
            const tr = document.getElementById(`gasto-row-${idx}`);
            if (tr) tr.className = g.pago ? 'bg-emerald-950/30' : '';
          } else {
            g[field] = val;
          }
        }

        function addGastoObra() {
          editGastosLista.push({ item: "Material / Despesa Real", q: 1, v: 100, vPago: 100, pago: false });
          renderGastosModalEdit();
          recalcularEdit();
        }

        function delGasto(idx) {
          editGastosLista.splice(idx, 1);
          renderGastosModalEdit();
          recalcularEdit();
        }

        function renderTecnicosModalEdit() {
          const container = document.getElementById('lista-tecnicos-obra');

          if (editTecnicosLista.length === 0) {
            container.innerHTML = `<span class="text-slate-500 text-[11px]">Nenhum técnico escalado nesta obra.</span>`;
            return;
          }

          let html = '';
          editTecnicosLista.forEach((t, idx) => {
            html += `
              <div class="flex items-center gap-2 bg-slate-900 p-1.5 rounded border border-slate-800">
                <input type="text" value="${esc(t.nome)}" oninput="updateTecObra(${idx}, 'nome', this.value)" class="flex-1 min-w-0 p-1 rounded border font-semibold">
                <span class="text-slate-400 text-[11px]">Dias:</span>
                <input type="number" value="${parseNum(t.dias)}" min="0" step="any" oninput="updateTecObra(${idx}, 'dias', this.value)" class="w-12 p-1 rounded border text-center">
                <span class="text-slate-400 text-[11px]">R$:</span>
                <input type="number" value="${parseNum(t.valor)}" step="0.01" min="0" oninput="updateTecObra(${idx}, 'valor', this.value)" class="w-16 p-1 rounded border text-center">
                <strong id="tecobra-sub-${idx}" class="w-24 text-right text-orange-400">${fmt(parseNum(t.dias) * parseNum(t.valor))}</strong>
                <button onclick="delTecObra(${idx})" class="text-slate-500 hover:text-rose-400 p-1"><i class="fa-solid fa-trash-can"></i></button>
              </div>
            `;
          });
          container.innerHTML = html;
        }

        function updateTecObra(idx, field, val) {
          const t = editTecnicosLista[idx];
          if (!t) return;
          if (field === 'dias' || field === 'valor') {
            t[field] = parseNum(val);
            setTexto(`tecobra-sub-${idx}`, fmt(t.dias * t.valor));
            recalcularEdit();
          } else {
            t[field] = val;
          }
        }

        function addTecnicoObra() {
          editTecnicosLista.push({ nome: "Novo Técnico", dias: 5, valor: 450 });
          renderTecnicosModalEdit();
          recalcularEdit();
        }

        function delTecObra(idx) {
          editTecnicosLista.splice(idx, 1);
          renderTecnicosModalEdit();
          recalcularEdit();
        }

        function recalcularEdit() {
          const r = resumoObra({
            valor: document.getElementById('edit-val-orcado').value,
            taxaImposto: document.getElementById('edit-taxa-imposto').value,
            modalidade: document.getElementById('edit-modalidade').value,
            gastosExecutados: editGastosLista,
            tecnicosObra: editTecnicosLista,
            parcelas: editParcelas
          });

          document.getElementById('edit-val-gastos').value = r.gastos.toFixed(2);
          document.getElementById('edit-val-cliente').value = r.valorCliente.toFixed(2);
          setTexto('edit-info-imposto', r.semNF
            ? `Sem NF: cliente paga ${fmt(r.semNota)} e não há imposto.`
            : `Com NF: cliente paga ${fmt(r.valor)}, imposto de ${fmt(r.imposto)} (sem NF seriam ${fmt(r.semNota)}).`);

          const resDiv = document.getElementById('edit-res-lucro');
          if (r.resultado >= 0) {
            resDiv.innerText = `LUCRO: ${fmt(r.resultado)}`;
            resDiv.className = "p-2 rounded-lg border font-black text-center text-sm bg-emerald-950 text-emerald-400 border-emerald-800";
          } else {
            resDiv.innerText = `PREJUÍZO: ${fmt(r.resultado)}`;
            resDiv.className = "p-2 rounded-lg border font-black text-center text-sm bg-rose-950 text-rose-400 border-rose-800";
          }

          atualizarParcelasUI('obra', r);
        }

        function salvarAjustesObra() {
          carregarProjetosStorage();
          const p = bancoProjetos.find(item => item.id === projetoEditandoId);
          if (!p) { fecharModalEdit(); return; }

          p.valor = r2(document.getElementById('edit-val-orcado').value);
          p.taxaImposto = Math.max(0, parseNum(document.getElementById('edit-taxa-imposto').value));
          p.valorSemNota = r2(p.valor / (1 + p.taxaImposto / 100));
          p.modalidade = document.getElementById('edit-modalidade').value === 'sem' ? 'sem' : 'com';

          if (JSON.stringify([editGastosLista, editTecnicosLista]) !== editExecutadoOriginal) p.executadoEditado = true;
          p.gastosExecutados = clone(editGastosLista);
          p.tecnicosObra = clone(editTecnicosLista);
          p.cronograma = clone(editCronograma);

          const parcelasAntes = JSON.stringify(p.parcelas);
          p.parcelas = clone(editParcelas);
          // Só mexe no status se os recebimentos mudaram nesta edição
          if (JSON.stringify(p.parcelas) !== parcelasAntes) ajustarStatusPelasParcelas(p);

          gravarProjetosStorage();
          fecharModalEdit();
          renderizarFinanceiro();
        }

        function alterarStatus(id, novoStatus) {
          carregarProjetosStorage();
          const p = bancoProjetos.find(item => item.id === id);
          if (!p) return;
          const todasRecebidas = p.parcelas.length > 0 && p.parcelas.every(x => x.recebido);

          if (novoStatus === 'Recebido') {
            // "Pago" quita todas as parcelas que ainda estavam em aberto
            p.parcelas.forEach(x => { if (!x.recebido) { x.recebido = true; x.data = hojeISO(); } });
          } else if (novoStatus === 'Agendado' && todasRecebidas) {
            if (!confirm('Todas as parcelas desta obra estão marcadas como recebidas.\
    \
    Voltar para "Agendado" desmarca os recebimentos. Continuar?')) return;
            p.parcelas.forEach(x => { x.recebido = false; x.data = ''; });
          }

          p.status = novoStatus;
          gravarProjetosStorage();
          renderizarFinanceiro();
        }

        function excluirProjeto(id) {
          if (confirm("Deseja excluir esta proposta do histórico?")) {
            carregarProjetosStorage();
            bancoProjetos = bancoProjetos.filter(p => p.id !== id);
            gravarProjetosStorage();
            if (orcamentoEditandoId === id) sairModoEdicao();
            renderizarFinanceiro();
          }
        }