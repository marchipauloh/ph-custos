
        // ---------------------------------------------------------------------
        // PROPOSTA COMERCIAL (PDF)
        // ---------------------------------------------------------------------

        function abrirDetalhes(id) {
          carregarProjetosStorage();
          const p = bancoProjetos.find(item => item.id === id);
          if (!p) return;
          propostaAbertaId = id;

          const r = resumoObra(p);
          const nomeHtml = esc(p.nome);

          // --- Tabela de itens, agrupada ---
          let linhasHtml = '';
          let somaItens = 0;
          GRUPOS_PROPOSTA.forEach(grupo => {
            const itens = p.itensProposta.filter(i => i.grupo === grupo.id);
            if (itens.length === 0) return;
            linhasHtml += `
              <tr class="print-group bg-slate-800/70">
                <td colspan="4" class="py-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-300 print-text-dark">${esc(grupo.titulo)}</td>
              </tr>`;
            itens.forEach(item => {
              const total = r2(parseNum(item.q) * parseNum(item.v));
              somaItens += total;
              linhasHtml += `
                <tr class="border-b border-slate-800/40">
                  <td class="py-1.5 px-2 font-medium text-slate-200 print-text-dark">${esc(item.item)}</td>
                  <td class="py-1.5 px-2 text-center whitespace-nowrap print-text-dark">${esc(fmtQtd(item.q, item.un))}</td>
                  <td class="py-1.5 px-2 text-right font-semibold whitespace-nowrap print-text-dark">${fmtUnit(item.v)}</td>
                  <td class="py-1.5 px-2 text-right font-bold whitespace-nowrap text-[#FF7A00] print-text-dark">${fmt(total)}</td>
                </tr>`;
            });
          });
          somaItens = r2(somaItens);

          // Rodapé da tabela: só quando os itens estão a preço de venda (V17 em diante)
          let rodapeHtml = '';
          if (p.propostaFechada && linhasHtml) {
            const ajuste = r2(r.semNota - somaItens);
            if (Math.abs(ajuste) >= 0.01) {
              rodapeHtml += `
                <tr class="border-b border-slate-800/40">
                  <td colspan="3" class="py-1.5 px-2 text-right text-slate-300 print-text-dark">Subtotal dos itens</td>
                  <td class="py-1.5 px-2 text-right font-semibold whitespace-nowrap print-text-dark">${fmt(somaItens)}</td>
                </tr>
                <tr class="border-b border-slate-800/40">
                  <td colspan="3" class="py-1.5 px-2 text-right text-slate-300 print-text-dark">${ajuste < 0 ? 'Desconto comercial' : 'Ajuste comercial'}</td>
                  <td class="py-1.5 px-2 text-right font-semibold whitespace-nowrap print-text-dark">${fmt(ajuste)}</td>
                </tr>`;
            }
            rodapeHtml += `
              <tr class="print-total bg-orange-950/40">
                <td colspan="3" class="py-2 px-2 text-right font-bold uppercase text-[11px] text-[#FF7A00] print-text-dark">Total — Opção A (sem NF)</td>
                <td class="py-2 px-2 text-right font-black whitespace-nowrap text-[#FF7A00] print-text-dark">${fmt(r.semNota)}</td>
              </tr>`;
          }

          // --- Cronograma ---
          const periodos = calcularPeriodos(p.cronograma);
          const temDatas = periodos.some(x => x.ini);
          const comData = periodos.filter(x => x.ini);
          let cronoHtml = '';
          p.cronograma.etapas.forEach((e, i) => {
            cronoHtml += `
              <tr class="border-b border-slate-800/40">
                <td class="py-1.5 px-2 font-bold whitespace-nowrap text-slate-200 print-text-dark">Etapa ${i + 1}</td>
                <td class="py-1.5 px-2 text-slate-200 print-text-dark">${esc(e.desc)}</td>
                <td class="py-1.5 px-2 text-center whitespace-nowrap print-text-dark">${esc(periodos[i].dias)}</td>
                ${temDatas ? `<td class="py-1.5 px-2 text-center whitespace-nowrap font-semibold text-[#FF7A00] print-text-dark">${esc(periodos[i].datas || '—')}</td>` : ''}
              </tr>`;
          });

          const diasPrazo = totalDiasCronograma(p.cronograma) || Math.round(p.dias) || 1;
          const tipoDia = p.cronograma.fimDeSemana ? (diasPrazo === 1 ? 'dia corrido' : 'dias corridos') : (diasPrazo === 1 ? 'dia útil' : 'dias úteis');
          const textoPrazo = comData.length > 0
            ? `${diasPrazo} ${tipoDia}, com início previsto em ${dataLonga(comData[0].ini)} e conclusão em ${dataLonga(comData[comData.length - 1].fim)}, condicionados à confirmação do sinal.`
            : `${diasPrazo} ${tipoDia} a partir da confirmação do sinal.`;

          const contatoCliente = [p.cliente.contato, p.cliente.fone].filter(Boolean).join(' | ');

          document.getElementById('modal-titulo').innerText = `Proposta Comercial: ${p.nome}`;
          document.getElementById('modal-conteudo').innerHTML = `
            <div class="proposta-doc flex flex-col gap-4">

              <div class="flex justify-between items-center border-b pb-3 border-orange-500/30 print-border-orange">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg overflow-hidden border border-orange-500/40 flex items-center justify-center bg-black">
                    <svg viewBox="0 0 200 200" class="w-full h-full p-1">
                      <rect width="200" height="200" fill="#121212" />
                      <rect x="25" y="25" width="150" height="110" rx="20" fill="#FF7A00" />
                      <line x1="55" y1="40" x2="55" y2="120" stroke="#121212" stroke-width="8" stroke-linecap="round" />
                      <circle cx="55" cy="70" r="10" fill="#121212" />
                      <line x1="85" y1="40" x2="85" y2="120" stroke="#121212" stroke-width="8" stroke-linecap="round" />
                      <circle cx="85" cy="95" r="10" fill="#121212" />
                      <line x1="115" y1="40" x2="115" y2="120" stroke="#121212" stroke-width="8" stroke-linecap="round" />
                      <circle cx="115" cy="55" r="10" fill="#121212" />
                      <line x1="145" y1="40" x2="145" y2="120" stroke="#121212" stroke-width="8" stroke-linecap="round" />
                      <circle cx="145" cy="105" r="10" fill="#121212" />
                      <text x="30" y="165" font-family="sans-serif" font-weight="900" font-size="32" fill="#FFFFFF">ph</text>
                      <text x="65" y="165" font-family="sans-serif" font-weight="300" font-size="32" fill="#FFFFFF">lighting</text>
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-base font-black text-white print-text-dark">PH LIGHTING</h2>
                    <p class="text-[10px] text-[#FF7A00] font-bold print-text-dark uppercase">Projetos & Iluminação Cênica</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-[10px] font-bold uppercase text-slate-400 print-text-muted block">PROPOSTA COMERCIAL</span>
                  <strong class="text-xs text-[#FF7A00] print-text-dark">Nº Prop: #${numeroProposta(p)}</strong>
                  <span class="block text-[10px] text-slate-400 print-text-muted">Data: ${esc(p.data)}</span>
                  <span class="block text-[10px] text-slate-400 print-text-muted">Validade: ${p.validade} dias</span>
                </div>
              </div>

              <div class="prop-sec grid grid-cols-2 gap-x-3 gap-y-2 bg-slate-900 print-card p-3 rounded-xl text-xs">
                <div>
                  <span class="text-[10px] text-slate-400 print-text-muted block font-semibold">CLIENTE / PROJETO</span>
                  <strong class="text-white print-text-dark text-sm block">${nomeHtml}</strong>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 print-text-muted block font-semibold">LOCAL DA INSTALAÇÃO</span>
                  <strong class="text-white print-text-dark block">${esc(p.cliente.local) || '—'}</strong>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 print-text-muted block font-semibold">CONTATO DO RESPONSÁVEL</span>
                  <strong class="text-white print-text-dark block">${esc(contatoCliente) || '—'}</strong>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 print-text-muted block font-semibold">ELABORADO POR</span>
                  <strong class="text-white print-text-dark block">PH Lighting Projetos</strong>
                  ${empresa.contato ? `<span class="text-[10px] text-slate-400 print-text-muted">${esc(empresa.contato)}</span>` : ''}
                </div>
              </div>

              <div class="prop-sec bg-slate-900 print-card p-3 rounded-xl flex flex-col gap-1 text-xs">
                <span class="font-bold text-[#FF7A00] print-text-dark uppercase text-[11px]">1. ESCOPO DO PROJETO & SERVIÇOS</span>
                <p class="text-slate-300 print-text-dark text-[11px] leading-relaxed">
                  A presente proposta contempla o desenvolvimento do projeto luminotécnico, dimensionamento elétrico cênico, fornecimento de infraestrutura suplementar, programação de mesa DMX e suporte técnico de montagem para o <strong>${nomeHtml}</strong>. O objetivo é entregar uma experiência visual imersiva e automatizada.
                </p>
              </div>

              <div class="flex flex-col gap-1.5">
                <span class="prop-titulo font-bold text-[#FF7A00] print-text-dark uppercase text-[11px]">2. DETALHAMENTO DE CUSTOS E SERVIÇOS</span>
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="bg-slate-900 print-card text-[#FF7A00] print-text-dark border-b border-slate-800">
                        <th class="p-2">Item / Descrição</th>
                        <th class="p-2 text-center">Qtd</th>
                        <th class="p-2 text-right">Unitário (R$)</th>
                        <th class="p-2 text-right">Total (R$)</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${linhasHtml || '<tr><td colspan="4" class="p-2 text-center text-slate-500">Nenhum item discriminado.</td></tr>'}
                      ${rodapeHtml}
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="prop-sec flex flex-col gap-2">
                <span class="font-bold text-[#FF7A00] print-text-dark uppercase text-[11px]">3. RESUMO FINANCEIRO E CONDIÇÕES FISCAIS</span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs print-2col">
                  <div class="p-3 bg-slate-900 print-card rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span class="font-bold text-slate-300 print-text-dark block">OPÇÃO A - VALOR DIRETO (SEM NF)</span>
                      <p class="text-[10px] text-slate-400 print-text-muted mt-1">Pagamento via PIX ou Transferência Direta. Isento de retenções fiscais na fonte.</p>
                    </div>
                    <strong class="text-base text-orange-400 print-text-dark block mt-2 font-black">${fmt(r.semNota)}</strong>
                  </div>
                  <div class="p-3 bg-orange-950/30 print-card rounded-xl border border-orange-500/40 print-border-orange flex flex-col justify-between">
                    <div>
                      <span class="font-bold text-[#FF7A00] print-text-dark block">OPÇÃO B - VALOR FINAL (COM NOTA FISCAL)</span>
                      <p class="text-[10px] text-slate-400 print-text-muted mt-1">Inclui emissão de NFS-e (+${fmtPct(r.taxa)}% de impostos e encargos fiscais da operação).</p>
                    </div>
                    <strong class="text-base text-[#FF7A00] print-text-dark block mt-2 font-black">${fmt(r.valor)}</strong>
                  </div>
                </div>
              </div>

              <div class="prop-sec bg-slate-900 print-card p-3 rounded-xl flex flex-col gap-2 text-xs">
                <span class="font-bold text-[#FF7A00] print-text-dark uppercase text-[11px]">4. CONDIÇÕES DE PAGAMENTO E PRAZOS</span>
                <ul class="list-disc list-inside text-slate-300 print-text-dark text-[11px] flex flex-col gap-1">
                  <li><strong>Condições de pagamento:</strong> ${esc(textoParcelas(p.parcelas))}.</li>
                  <li><strong>Prazo de execução:</strong> ${esc(textoPrazo)}</li>
                  <li><strong>Garantia:</strong> 12 meses para serviços e suporte pós-instalação.</li>
                  <li><strong>Validade da proposta:</strong> ${p.validade} dias corridos a contar da data de emissão.</li>
                </ul>
              </div>

              ${cronoHtml ? `
              <div class="prop-sec flex flex-col gap-1.5">
                <span class="font-bold text-[#FF7A00] print-text-dark uppercase text-[11px]">5. CRONOGRAMA ESTIMADO</span>
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-slate-900 print-card text-[#FF7A00] print-text-dark border-b border-slate-800">
                      <th class="p-2">Etapa</th>
                      <th class="p-2">Descrição</th>
                      <th class="p-2 text-center">Duração</th>
                      ${temDatas ? '<th class="p-2 text-center">Período</th>' : ''}
                    </tr>
                  </thead>
                  <tbody>${cronoHtml}</tbody>
                </table>
              </div>` : ''}

              <div class="prop-sec border border-slate-800 print-card p-4 rounded-xl flex flex-col gap-6">
                <span class="font-bold text-slate-300 print-text-dark text-[11px] text-center uppercase">${cronoHtml ? '6' : '5'}. ACEITE E APROVAÇÃO DA PROPOSTA</span>
                <div class="grid grid-cols-2 gap-8 pt-4">
                  <div class="flex flex-col items-center justify-end text-center">
                    <div class="w-full border-b border-slate-600 print-border-orange mb-1"></div>
                    <strong class="text-white print-text-dark text-[11px]">PH LIGHTING PROJETOS</strong>
                    ${empresa.cnpj ? `<span class="text-[9px] text-slate-400 print-text-muted">CNPJ: ${esc(empresa.cnpj)}</span>` : ''}
                    <span class="text-[9px] text-slate-400 print-text-muted">Engenharia & Design Cênico</span>
                  </div>
                  <div class="flex flex-col items-center justify-end text-center">
                    <div class="w-full border-b border-slate-600 print-border-orange mb-1"></div>
                    <strong class="text-white print-text-dark text-[11px]">${nomeHtml}</strong>
                    <span class="text-[9px] text-slate-400 print-text-muted">Aceite e Aprovação do Cliente</span>
                    <span class="text-[9px] text-slate-400 print-text-muted">Data: ____ / ____ / ________</span>
                  </div>
                </div>
              </div>

            </div>
          `;

          // Rodapé de cada página do PDF (nº da proposta e "Página X de Y")
          let estilo = document.getElementById('estilo-rodape-pdf');
          if (!estilo) {
            estilo = document.createElement('style');
            estilo.id = 'estilo-rodape-pdf';
            document.head.appendChild(estilo);
          }
          estilo.textContent = `@media print { @page {
            @bottom-left { content: "PH Lighting Projetos • Proposta #${numeroProposta(p)}"; font: 8pt system-ui, sans-serif; color: #64748b; }
            @bottom-right { content: "Página " counter(page) " de " counter(pages); font: 8pt system-ui, sans-serif; color: #64748b; }
          } }`;

          const modal = document.getElementById('modal-detalhes');
          modal.classList.remove('hidden');
          modal.classList.add('flex');
          document.body.classList.add('proposta-aberta');
        }

        // O título da página vira o nome sugerido do arquivo PDF
        function imprimirPDF() {
          const p = bancoProjetos.find(item => item.id === propostaAbertaId);
          const tituloOriginal = document.title;
          const restaurar = () => {
            document.title = tituloOriginal;
            window.removeEventListener('afterprint', restaurar);
          };
          if (p) {
            document.title = `Proposta ${numeroProposta(p)} - ${p.nome} - PH Lighting`;
            window.addEventListener('afterprint', restaurar);
          }
          window.print();
        }

        function fecharModal() {
          const modal = document.getElementById('modal-detalhes');
          modal.classList.remove('flex');
          modal.classList.add('hidden');
          document.body.classList.remove('proposta-aberta');
          propostaAbertaId = null;
        }

        // ---------------------------------------------------------------------
        // ABA 4: PAINEL FINANCEIRO
        // ---------------------------------------------------------------------

        function renderizarFinanceiro() {
          carregarProjetosStorage();

          let recebido = 0;       // parcelas já recebidas (obras não rejeitadas)
          let confirmar = 0;      // propostas ainda em análise
          let aReceber = 0;       // saldo das obras fechadas
          let lucroEfetivo = 0;   // obras totalmente pagas
          let lucroPrevisto = 0;  // obras em aberto

          const listaDiv = document.getElementById('lista-projetos');

          // V21: salvarOrcamento() chama renderizarFinanceiro() para atualizar
          // o painel, mas a Aba 1 nao tem #lista-projetos - e a chamada
          // quebrava em null, engolindo o restante do fluxo de gravacao.
          // Noutra aba (Orcamento/Materiais/Equipe) o painel nao esta na tela:
          // o registro continua salvo, so nao ha o que desenhar.
          if (!listaDiv) return;
          let html = '';

          if (bancoProjetos.length === 0) {
            html = `<p class="text-slate-500 py-3 text-center">Nenhuma proposta cadastrada ainda.</p>`;
          } else {
            bancoProjetos.forEach(p => {
              const r = resumoObra(p);

              // Proposta rejeitada não entra em nenhum total nem no lucro
              if (p.status !== 'Rejeitado') {
                recebido += r.recebido;
                if (p.status === 'A Confirmar') confirmar += r.saldo; else aReceber += r.saldo;
                if (p.status === 'Recebido') lucroEfetivo += r.resultado; else lucroPrevisto += r.resultado;
              }

              let badgeClass = 'bg-amber-950 text-amber-400 border-amber-800';
              if (p.status === 'Agendado') badgeClass = 'bg-orange-950 text-[#FF7A00] border-orange-800';
              if (p.status === 'Recebido') badgeClass = 'bg-emerald-950 text-emerald-400 border-emerald-800';
              if (p.status === 'Rejeitado') badgeClass = 'bg-rose-950 text-rose-400 border-rose-800';

              const dica = `Cliente paga ${fmt(r.valorCliente)} - imposto NF ${fmt(r.imposto)} - gastos ${fmt(r.gastos)}`;
              const tagResultado = r.resultado >= 0
                ? `<span title="${esc(dica)}" class="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800"><i class="fa-solid fa-arrow-trend-up"></i> Lucro: ${fmt(r.resultado)}</span>`
                : `<span title="${esc(dica)}" class="text-[10px] text-rose-400 font-bold bg-rose-950 px-2 py-0.5 rounded border border-rose-800"><i class="fa-solid fa-arrow-trend-down"></i> Prejuízo: ${fmt(r.resultado)}</span>`;

              const nParc = p.parcelas.length;
              const nRec = p.parcelas.filter(x => x.recebido).length;
              // V19: cinza = nada recebido, amarelo = recebido em parte, verde = tudo recebido
              const corRecebido = nRec === 0 ? 'text-slate-400 bg-slate-800 border-slate-700'
                : (nRec < nParc ? 'text-amber-400 bg-amber-950 border-amber-800' : 'text-emerald-400 bg-emerald-950 border-emerald-800');
              const tagRecebido = `<span title="Parcelas recebidas: ${nRec} de ${nParc}" class="text-[10px] font-bold px-2 py-0.5 rounded border ${corRecebido}"><i class="fa-solid fa-hand-holding-dollar"></i> Recebido ${fmt(r.recebido)} (${nRec}/${nParc})</span>`;

              const nEtapas = p.cronograma.etapas.length;
              const nFeitas = p.cronograma.etapas.filter(e => e.feita).length;
              const tagEtapas = nEtapas > 0
                ? `<span title="Etapas concluídas do cronograma" class="text-[10px] font-bold px-2 py-0.5 rounded border ${nFeitas > 0 ? 'text-orange-300 bg-orange-950 border-orange-800' : 'text-slate-400 bg-slate-800 border-slate-700'}"><i class="fa-solid fa-list-check"></i> Etapas ${nFeitas}/${nEtapas}</span>`
                : '';

              html += `
                <div class="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div class="flex items-start gap-2 min-w-0">
                    <div class="flex gap-1 shrink-0">
                      <button onclick="abrirDetalhes(${p.id})" title="Ver proposta e gerar PDF" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#FF7A00] flex items-center justify-center">
                        <i class="fa-solid fa-eye"></i>
                      </button>
                      <button onclick="abrirModalEdit(${p.id})" title="Obra: gastos, recebimentos e cronograma" class="w-8 h-8 rounded-lg bg-orange-950 hover:bg-orange-900 text-[#FF7A00] border border-orange-800 flex items-center justify-center">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                      ${p.orcamento ? `
                      <button onclick="reabrirOrcamento(${p.id})" title="Reabrir o orçamento na Aba 1 (editar ou duplicar)" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center">
                        <i class="fa-solid fa-calculator"></i>
                      </button>` : ''}
                    </div>
                    <div class="min-w-0">
                      <strong class="text-white block">${esc(p.nome)}</strong>
                      <span class="text-[10px] text-slate-400 block">#${numeroProposta(p)} • ${esc(p.data)} • Orçado: ${fmt(r.valor)}${r.semNF ? ` • fechado sem NF: ${fmt(r.semNota)}` : ''}</span>
                      <div class="flex flex-wrap items-center gap-1.5 mt-1">
                        ${tagResultado}
                        ${tagRecebido}
                        ${tagEtapas}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between w-full sm:w-auto gap-2 shrink-0">
                    <span class="text-[10px] px-2.5 py-0.5 rounded-full border ${badgeClass} font-bold whitespace-nowrap">${esc(p.status)}</span>

                    <div class="flex items-center gap-1">
                      <button onclick="alterarStatus(${p.id}, 'Recebido')" title="Marcar como totalmente pago (quita todas as parcelas)" class="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-800 text-emerald-400 border border-emerald-800 flex items-center gap-1 font-bold text-[10px]">
                        <i class="fa-solid fa-dollar-sign"></i> Pago
                      </button>
                      <button onclick="alterarStatus(${p.id}, 'Agendado')" title="Marcar como Agendado / aceito" class="p-1.5 rounded-lg bg-orange-950 hover:bg-orange-800 text-[#FF7A00] border border-orange-800">
                        <i class="fa-solid fa-check"></i>
                      </button>
                      <button onclick="alterarStatus(${p.id}, 'Rejeitado')" title="Rejeitar Proposta" class="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-800 text-rose-400 border border-rose-800">
                        <i class="fa-solid fa-xmark"></i>
                      </button>
                      <button onclick="excluirProjeto(${p.id})" title="Excluir do Histórico" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            });
          }
          listaDiv.innerHTML = html;

          setTexto('fin-recebido', fmt(recebido));
          setTexto('fin-confirmar', fmt(confirmar));
          setTexto('fin-agendado', fmt(aReceber));
          setTexto('leg-recebido', fmt(recebido));
          setTexto('leg-confirmar', fmt(confirmar));
          setTexto('fin-lucro-real', fmt(lucroEfetivo));
          setTexto('fin-lucro-previsto', `Previsto em aberto: ${fmt(lucroPrevisto)}`);
          setTexto('fin-total-projetos', bancoProjetos.length);

          const totalGeral = recebido + confirmar + aReceber;
          const pct = v => (totalGeral > 0 ? (v / totalGeral) * 100 : 0) + '%';
          document.getElementById('bar-recebido').style.width = pct(recebido);
          document.getElementById('bar-confirmar').style.width = pct(confirmar);
          document.getElementById('bar-agendado').style.width = pct(aReceber);
        }

        // ---------------------------------------------------------------------
        // BACKUP (os dados ficam só neste navegador - exporte de vez em quando)
        // ---------------------------------------------------------------------


        // Recebe o texto do arquivo. Projetos com o mesmo nº são atualizados; os outros, adicionados.
        function importarBackupTexto(texto) {
          let pacote;
          try {
            pacote = JSON.parse(texto);
          } catch (e) {
            alert('Não consegui ler este arquivo. Ele precisa ser um backup exportado pelo PH Custos (.json).');
            return false;
          }
          const lista = Array.isArray(pacote) ? pacote : (pacote && Array.isArray(pacote.projetos) ? pacote.projetos : null);
          if (!lista) {
            alert('Este arquivo não tem a lista de projetos de um backup do PH Custos.');
            return false;
          }

          carregarProjetosStorage();
          const importados = lista.filter(x => x && typeof x === 'object').map(normalizarProjeto);
          const novos = importados.filter(x => !bancoProjetos.some(p => p.id === x.id)).length;
          const atualizados = importados.length - novos;
          if (!confirm(`Importar ${importados.length} projeto(s)?\
    \
    ${novos} novo(s) e ${atualizados} que já existe(m) aqui e será(ão) substituído(s) pela versão do arquivo.`)) return false;

          importados.forEach(x => {
            const i = bancoProjetos.findIndex(p => p.id === x.id);
            if (i >= 0) bancoProjetos[i] = x; else bancoProjetos.push(x);
          });
          gravarProjetosStorage();

          // Dados da PH: só preenche o que estiver vazio aqui
          if (pacote && pacote.empresa && typeof pacote.empresa === 'object') {
            if (!empresa.cnpj && pacote.empresa.cnpj) empresa.cnpj = txt(pacote.empresa.cnpj);
            if (!empresa.contato && pacote.empresa.contato) empresa.contato = txt(pacote.empresa.contato);
            localStorage.setItem('ph_empresa', JSON.stringify(empresa));
            carregarEmpresa();
          }

          renderizarFinanceiro();
          alert(`Backup importado: ${novos} novo(s), ${atualizados} atualizado(s).`);
          return true;
        }

        function importarBackupArquivo(input) {
          const arquivo = input.files && input.files[0];
          if (!arquivo) return;
          const leitor = new FileReader();
          leitor.onload = () => { importarBackupTexto(String(leitor.result)); input.value = ''; };
          leitor.onerror = () => { alert('Não consegui abrir o arquivo.'); input.value = ''; };
          leitor.readAsText(arquivo);
        }