
        // ---------------------------------------------------------------------
        // EXCEL (.xlsx)
        // V20: exporta uma planilha de controle, feita aqui mesmo (sem biblioteca
        // externa). Um .xlsx é um arquivo ZIP com alguns XML dentro.
        //   - Aba "Propostas": uma linha por proposta; recebido, gastos e resultado
        //     são FÓRMULAS que somam as outras abas, então a planilha continua
        //     fechando se alguém editar um gasto ou marcar uma parcela no Excel.
        //   - O Excel é só de ida: o que for alterado lá não volta para o sistema.
        //     Para guardar e restaurar os dados, o caminho é o Backup (.json).
        // ---------------------------------------------------------------------

        function baixarArquivo(blob, nome) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = nome;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        // --- ZIP sem compressão (método "store") ---
        let tabelaCrc = null;
        function crc32(bytes) {
          if (!tabelaCrc) {
            tabelaCrc = new Uint32Array(256);
            for (let n = 0; n < 256; n++) {
              let c = n;
              for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
              tabelaCrc[n] = c >>> 0;
            }
          }
          let crc = 0xFFFFFFFF;
          for (let i = 0; i < bytes.length; i++) crc = tabelaCrc[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
          return (crc ^ 0xFFFFFFFF) >>> 0;
        }

        // arquivos = [{ nome: 'xl/workbook.xml', conteudo: '<xml...>' }, ...]
        function criarZip(arquivos, tipo) {
          const enc = new TextEncoder();
          const agora = new Date();
          const dosHora = (agora.getHours() << 11) | (agora.getMinutes() << 5) | (agora.getSeconds() >> 1);
          const dosData = ((agora.getFullYear() - 1980) << 9) | ((agora.getMonth() + 1) << 5) | agora.getDate();
          const partes = [];
          const central = [];
          let offset = 0;

          arquivos.forEach(arq => {
            const nome = enc.encode(arq.nome);
            const dados = enc.encode(arq.conteudo);
            const crc = crc32(dados);

            const local = new DataView(new ArrayBuffer(30));
            local.setUint32(0, 0x04034b50, true);
            local.setUint16(4, 20, true);          // versão necessária
            local.setUint16(6, 0x0800, true);      // nomes em UTF-8
            local.setUint16(8, 0, true);           // 0 = sem compressão
            local.setUint16(10, dosHora, true);
            local.setUint16(12, dosData, true);
            local.setUint32(14, crc, true);
            local.setUint32(18, dados.length, true);
            local.setUint32(22, dados.length, true);
            local.setUint16(26, nome.length, true);
            local.setUint16(28, 0, true);
            partes.push(new Uint8Array(local.buffer), nome, dados);

            const cen = new DataView(new ArrayBuffer(46));
            cen.setUint32(0, 0x02014b50, true);
            cen.setUint16(4, 20, true);
            cen.setUint16(6, 20, true);
            cen.setUint16(8, 0x0800, true);
            cen.setUint16(10, 0, true);
            cen.setUint16(12, dosHora, true);
            cen.setUint16(14, dosData, true);
            cen.setUint32(16, crc, true);
            cen.setUint32(20, dados.length, true);
            cen.setUint32(24, dados.length, true);
            cen.setUint16(28, nome.length, true);
            cen.setUint32(42, offset, true);       // onde o arquivo começa no ZIP
            central.push(new Uint8Array(cen.buffer), nome);

            offset += 30 + nome.length + dados.length;
          });

          const tamCentral = central.reduce((s, x) => s + x.length, 0);
          const fim = new DataView(new ArrayBuffer(22));
          fim.setUint32(0, 0x06054b50, true);
          fim.setUint16(8, arquivos.length, true);
          fim.setUint16(10, arquivos.length, true);
          fim.setUint32(12, tamCentral, true);
          fim.setUint32(16, offset, true);

          return new Blob([...partes, ...central, new Uint8Array(fim.buffer)], { type: tipo });
        }

        // --- Células ---
        // Estilos (índices do cellXfs em styles.xml)
        const XL = { TEXTO: 0, CABECALHO: 1, MOEDA: 2, DATA: 3, NEGRITO: 4 };

        function escXml(v) {
          return txt(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        const cT = (v, s) => ({ k: 't', v: txt(v), s: s || XL.TEXTO });
        const cN = (v, s) => ({ k: 'n', v: parseNum(v), s: s || XL.TEXTO });
        const cF = (f, v, s) => ({ k: 'f', f: f, v: parseNum(v), s: s || XL.TEXTO });   // fórmula + valor já calculado
        const cSimNao = v => cT(v ? 'Sim' : 'Não');

        // Data -> número de série do Excel (dias desde 30/12/1899)
        function cD(d) {
          if (!d) return null;
          const serie = Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1899, 11, 30)) / 86400000);
          return { k: 'n', v: serie, s: XL.DATA };
        }

        // "09/10/2026" -> Date
        function parseDataBR(s) {
          const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(txt(s).trim());
          if (!m) return null;
          const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
          return isNaN(d.getTime()) ? null : d;
        }

        function letraColuna(i) {   // 0 -> A, 25 -> Z, 26 -> AA
          let s = '';
          for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s;
          return s;
        }

        // aba = { nome, colunas: [{ titulo, largura }], linhas: [[celula, ...]], simples }
        function xmlAba(aba, primeira) {
          const nCols = aba.colunas.length;
          const linhaXml = (celulas, r) => {
            let x = `<row r="${r}">`;
            celulas.forEach((c, i) => {
              if (!c) return;
              const ref = letraColuna(i) + r;
              if (c.k === 't') {
                if (c.v !== '') x += `<c r="${ref}" s="${c.s}" t="inlineStr"><is><t xml:space="preserve">${escXml(c.v)}</t></is></c>`;
              } else if (c.k === 'f') {
                x += `<c r="${ref}" s="${c.s}"><f>${escXml(c.f)}</f><v>${c.v}</v></c>`;
              } else {
                x += `<c r="${ref}" s="${c.s}"><v>${c.v}</v></c>`;
              }
            });
            return x + '</row>';
          };

          let dados = '';
          let r = 1;
          if (!aba.simples) dados += linhaXml(aba.colunas.map(c => cT(c.titulo, XL.CABECALHO)), r++);
          aba.linhas.forEach(l => { dados += linhaXml(l, r++); });
          const ultima = Math.max(1, r - 1);

          return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            + `<dimension ref="A1:${letraColuna(nCols - 1)}${ultima}"/>`
            + `<sheetViews><sheetView workbookViewId="0"${primeira ? ' tabSelected="1"' : ''}>`
            + (aba.simples ? '' : '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>')
            + '</sheetView></sheetViews>'
            + '<sheetFormatPr defaultRowHeight="15"/>'
            + '<cols>' + aba.colunas.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.largura}" customWidth="1"/>`).join('') + '</cols>'
            + `<sheetData>${dados}</sheetData>`
            + (aba.simples ? '' : `<autoFilter ref="A1:${letraColuna(nCols - 1)}${ultima}"/>`)
            + '</worksheet>';
        }

        // Nº de cada proposta na planilha ("#624247"). Se duas terminarem igual, usa mais dígitos.
        function chavesPlanilha(projetos) {
          for (let n = 6; n <= 13; n++) {
            const chaves = projetos.map(p => '#' + String(p.id).slice(-n));
            if (new Set(chaves).size === chaves.length) return chaves;
          }
          return projetos.map((p, i) => `#${p.id}-${i + 1}`);
        }

        // Monta as abas a partir das propostas (sem tocar na tela)
        function montarAbasExcel(projetos) {
          const chaves = chavesPlanilha(projetos);
          const col = (titulo, largura) => ({ titulo, largura });

          const propostas = { nome: 'Propostas', linhas: [], colunas: [
            col('Nº', 11), col('Cliente / Projeto', 30), col('Data', 12), col('Status', 13), col('Dias', 7),
            col('Cliente fechou', 14), col('Valor c/ NF', 15), col('Imposto NF (%)', 11), col('Valor s/ NF', 15),
            col('Imposto (R$)', 14), col('Cliente paga', 15), col('Recebido', 15), col('A receber', 15),
            col('Gastos insumos', 15), col('Gastos equipe', 15), col('Gastos total', 15), col('Resultado', 15),
            col('Parcelas recebidas', 11), col('Etapas concluídas', 11), col('Contato', 22), col('WhatsApp', 17),
            col('Local da instalação', 34), col('Início previsto', 12), col('Validade (dias)', 10)
          ] };
          const itens = { nome: 'Itens', linhas: [], colunas: [
            col('Nº', 11), col('Cliente / Projeto', 26), col('Grupo', 30), col('Item', 46), col('Qtd', 9),
            col('Unidade', 10), col('Unitário', 14), col('Total', 15)
          ] };
          const gastos = { nome: 'Gastos', linhas: [], colunas: [
            col('Nº', 11), col('Cliente / Projeto', 26), col('Item', 40), col('Qtd', 9), col('Unit. orçado', 14),
            col('Unit. pago', 14), col('Total efetivo', 15), col('Pago', 8)
          ] };
          const equipe = { nome: 'Equipe', linhas: [], colunas: [
            col('Nº', 11), col('Cliente / Projeto', 26), col('Nome / Função', 30), col('Dias', 8), col('Diária', 14), col('Total', 15)
          ] };
          const parcelas = { nome: 'Parcelas', linhas: [], colunas: [
            col('Nº', 11), col('Cliente / Projeto', 26), col('Parcela', 34), col('%', 8), col('Valor', 15),
            col('Recebido', 10), col('Data do recebimento', 14)
          ] };
          const cronograma = { nome: 'Cronograma', linhas: [], colunas: [
            col('Nº', 11), col('Cliente / Projeto', 26), col('Etapa', 7), col('Descrição', 50), col('Dias', 7),
            col('Período', 14), col('Início', 12), col('Fim', 12), col('Concluída', 10)
          ] };

          projetos.forEach((p, i) => {
            const k = chaves[i];
            const r = resumoObra(p);
            const L = propostas.linhas.length + 2;   // linha desta proposta na aba Propostas
            const periodos = calcularPeriodos(p.cronograma);
            const comData = periodos.filter(x => x.ini);

            propostas.linhas.push([
              cT(k), cT(p.nome), cD(parseDataBR(p.data)) || cT(p.data), cT(p.status), cN(p.dias),
              cT(r.semNF ? 'Sem NF' : 'Com NF'),
              cN(r.valor, XL.MOEDA),
              cN(r.taxa),
              cF(`ROUND(G${L}/(1+H${L}/100),2)`, r.semNota, XL.MOEDA),
              cF(`IF(F${L}="Sem NF",0,G${L}-I${L})`, r.imposto, XL.MOEDA),
              cF(`IF(F${L}="Sem NF",I${L},G${L})`, r.valorCliente, XL.MOEDA),
              cF(`SUMIFS(Parcelas!$E:$E,Parcelas!$A:$A,A${L},Parcelas!$F:$F,"Sim")`, r.recebido, XL.MOEDA),
              cF(`MAX(0,K${L}-L${L})`, r.saldo, XL.MOEDA),
              cF(`SUMIF(Gastos!$A:$A,A${L},Gastos!$G:$G)`, r2(r.gastosInsumos), XL.MOEDA),
              cF(`SUMIF(Equipe!$A:$A,A${L},Equipe!$F:$F)`, r2(r.gastosEquipe), XL.MOEDA),
              cF(`N${L}+O${L}`, r2(r.gastos), XL.MOEDA),
              cF(`K${L}-J${L}-P${L}`, r2(r.resultado), XL.MOEDA),
              cT(`${p.parcelas.filter(x => x.recebido).length} de ${p.parcelas.length}`),
              cT(`${p.cronograma.etapas.filter(e => e.feita).length} de ${p.cronograma.etapas.length}`),
              cT(p.cliente.contato), cT(p.cliente.fone), cT(p.cliente.local),
              cD(comData.length ? comData[0].ini : null),
              cN(p.validade)
            ]);

            p.itensProposta.forEach(it => {
              const n = itens.linhas.length + 2;
              const grupo = GRUPOS_PROPOSTA.find(g => g.id === it.grupo);
              itens.linhas.push([
                cT(k), cT(p.nome), cT(grupo ? grupo.titulo : ''), cT(it.item), cN(it.q), cT(it.un),
                cN(it.v, XL.MOEDA), cF(`ROUND(E${n}*G${n},2)`, r2(it.q * it.v), XL.MOEDA)
              ]);
            });

            p.gastosExecutados.forEach(g => {
              const n = gastos.linhas.length + 2;
              gastos.linhas.push([
                cT(k), cT(p.nome), cT(g.item), cN(g.q), cN(g.v, XL.MOEDA), cN(g.vPago, XL.MOEDA),
                cF(`D${n}*F${n}`, r2(g.q * g.vPago), XL.MOEDA), cSimNao(g.pago)
              ]);
            });

            p.tecnicosObra.forEach(t => {
              const n = equipe.linhas.length + 2;
              equipe.linhas.push([
                cT(k), cT(p.nome), cT(t.nome), cN(t.dias), cN(t.valor, XL.MOEDA),
                cF(`D${n}*E${n}`, r2(t.dias * t.valor), XL.MOEDA)
              ]);
            });

            p.parcelas.forEach((x, j) => {
              parcelas.linhas.push([
                cT(k), cT(p.nome), cT(x.desc), cN(x.pct), cN(r.valoresParcelas[j], XL.MOEDA),
                cSimNao(x.recebido), cD(parseDataISO(x.data))
              ]);
            });

            p.cronograma.etapas.forEach((e, j) => {
              cronograma.linhas.push([
                cT(k), cT(p.nome), cN(j + 1), cT(e.desc), cN(diasDaEtapa(e)), cT(periodos[j].dias),
                cD(periodos[j].ini), cD(periodos[j].fim), cSimNao(e.feita)
              ]);
            });
          });

          const agora = new Date();
          const leiame = { nome: 'Leia-me', simples: true, colunas: [col('', 110)], linhas: [
            [cT('PH Custos — Planilha de controle', XL.NEGRITO)],
            [cT(`Exportada em ${dataLonga(agora)} às ${pad2(agora.getHours())}:${pad2(agora.getMinutes())} • ${projetos.length} proposta(s)`)],
            [],
            [cT('Como ler', XL.NEGRITO)],
            [cT('Aba Propostas: uma linha por proposta. Recebido, gastos e resultado são fórmulas que somam as outras abas.')],
            [cT('Abas Itens, Gastos, Equipe, Parcelas e Cronograma: o detalhe de cada proposta. A coluna Nº liga tudo.')],
            [cT('Resultado = o que o cliente paga − imposto da NF − gastos (insumos + equipe).')],
            [],
            [cT('Pode editar', XL.NEGRITO)],
            [cT('Mude quantidades e valores pagos na aba Gastos, dias na aba Equipe, ou troque Recebido para Sim na aba Parcelas: os totais da aba Propostas se atualizam.')],
            [cT('Em Parcelas, a coluna Recebido precisa estar escrita exatamente como Sim para entrar na soma.')],
            [],
            [cT('Atenção', XL.NEGRITO)],
            [cT('O que for alterado aqui NÃO volta para o PH Custos. Esta planilha é só para consulta e controle.')],
            [cT('Para guardar e restaurar os dados do sistema, use o botão Backup (.json).')]
          ] };

          return [propostas, itens, gastos, equipe, parcelas, cronograma, leiame];
        }

        function montarPlanilhaExcel(projetos) {
          const abas = montarAbasExcel(projetos);
          const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
          const NS_REL = 'http://schemas.openxmlformats.org/package/2006/relationships';
          const NS_DOC = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
          const cab = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

          const estilos = cab + `<styleSheet xmlns="${NS}">`
            + '<numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;R$&quot; #,##0.00;[Red]-&quot;R$&quot; #,##0.00"/></numFmts>'
            + '<fonts count="3">'
            +   '<font><sz val="11"/><name val="Calibri"/></font>'
            +   '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>'
            +   '<font><b/><sz val="11"/><name val="Calibri"/></font>'
            + '</fonts>'
            + '<fills count="3">'
            +   '<fill><patternFill patternType="none"/></fill>'
            +   '<fill><patternFill patternType="gray125"/></fill>'
            +   '<fill><patternFill patternType="solid"><fgColor rgb="FFFF7A00"/><bgColor indexed="64"/></patternFill></fill>'
            + '</fills>'
            + '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
            + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            + '<cellXfs count="5">'
            +   '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
            +   '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>'
            +   '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'
            +   '<xf numFmtId="14" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'
            +   '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
            + '</cellXfs>'
            + '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
            + '</styleSheet>';

          const pasta = cab + `<workbook xmlns="${NS}" xmlns:r="${NS_DOC}">`
            + '<bookViews><workbookView activeTab="0"/></bookViews>'
            + '<sheets>' + abas.map((a, i) => `<sheet name="${escXml(a.nome)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets>'
            // nome interno que o próprio Excel grava para cada aba com filtro
            + '<definedNames>' + abas.map((a, i) => a.simples ? '' :
                `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">${a.nome}!$A$1:$${letraColuna(a.colunas.length - 1)}$${a.linhas.length + 1}</definedName>`).join('') + '</definedNames>'
            + '<calcPr calcId="191029" fullCalcOnLoad="1"/>'   // Excel recalcula as fórmulas ao abrir
            + '</workbook>';

          const relsPasta = cab + `<Relationships xmlns="${NS_REL}">`
            + abas.map((a, i) => `<Relationship Id="rId${i + 1}" Type="${NS_DOC}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')
            + `<Relationship Id="rId${abas.length + 1}" Type="${NS_DOC}/styles" Target="styles.xml"/>`
            + '</Relationships>';

          const relsRaiz = cab + `<Relationships xmlns="${NS_REL}">`
            + `<Relationship Id="rId1" Type="${NS_DOC}/officeDocument" Target="xl/workbook.xml"/>`
            + '</Relationships>';

          const tipos = cab + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            + '<Default Extension="xml" ContentType="application/xml"/>'
            + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            + abas.map((a, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')
            + '</Types>';

          const arquivos = [
            { nome: '[Content_Types].xml', conteudo: tipos },
            { nome: '_rels/.rels', conteudo: relsRaiz },
            { nome: 'xl/workbook.xml', conteudo: pasta },
            { nome: 'xl/_rels/workbook.xml.rels', conteudo: relsPasta },
            { nome: 'xl/styles.xml', conteudo: estilos }
          ].concat(abas.map((a, i) => ({ nome: `xl/worksheets/sheet${i + 1}.xml`, conteudo: xmlAba(a, i === 0) })));

          return criarZip(arquivos, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }


        // ---------------------------------------------------------------------
        // WHATSAPP
        // ---------------------------------------------------------------------

        function montarMensagemWhats(d) {
          const linhas = [
            '💡 *PH LIGHTING — PROPOSTA COMERCIAL*',
            '',
            `📋 *Projeto:* ${d.nome}`,
            `💰 *Opção A (sem NF):* ${fmt(d.semNota)}`,
            `🧾 *Opção B (com NF):* ${fmt(d.comNota)}`,
            `🗓️ *Prazo de execução:* ${d.prazo}`
          ];
          if (d.pagamento) linhas.push(`💳 *Pagamento:* ${d.pagamento}`);
          linhas.push(`⏳ *Validade:* ${d.validade} dias`, '', 'Ficamos à disposição!');
          return linhas.join('\n');
        }

        // Copia para a área de transferência (com plano B para navegador antigo)
        function copiarTexto(msg) {
          const viaTextarea = () => {
            try {
              const dummy = document.createElement("textarea");
              dummy.value = msg;
              dummy.style.position = 'fixed';
              dummy.style.opacity = '0';
              document.body.appendChild(dummy);
              dummy.select();
              const ok = document.execCommand("copy");
              document.body.removeChild(dummy);
              return ok;
            } catch (e) { return false; }
          };
          if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(msg).then(() => true).catch(() => viaTextarea());
          }
          return Promise.resolve(viaTextarea());
        }

        // Aviso rápido no rodapé da tela (some sozinho)
        let avisoTimer = null;
        function mostrarAviso(texto, erro) {
          let el = document.getElementById('aviso-rapido');
          if (!el) {
            el = document.createElement('div');
            el.id = 'aviso-rapido';
            el.setAttribute('role', 'status');
            el.style.cssText = 'position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:100;max-width:90vw;padding:10px 16px;border-radius:12px;font-size:12px;font-weight:700;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.5);text-align:center;';
            el.className = 'no-print';
            document.body.appendChild(el);
          }
          el.style.background = erro ? '#be123c' : '#059669';
          el.innerText = texto;
          el.style.display = 'block';
          clearTimeout(avisoTimer);
          avisoTimer = setTimeout(() => { el.style.display = 'none'; }, 3500);
        }

        // V18: só copia o resumo; você cola no WhatsApp Web que já está aberto.
        // (O link wa.me da V17 trocava os emojis por "?" no WhatsApp Web.)
        function copiarParaWhats(msg) {
          return copiarTexto(msg).then(ok => {
            if (ok) mostrarAviso('Resumo copiado! Cole no WhatsApp Web com Ctrl+V.');
            else mostrarAviso('Não consegui copiar automaticamente neste navegador.', true);
            return ok;
          });
        }

        function rotuloPrazo(crono, diasObra) {
          const n = totalDiasCronograma(crono) || Math.round(diasObra) || 1;
          if (crono.fimDeSemana) return `${n} ${n === 1 ? 'dia corrido' : 'dias corridos'}`;
          return `${n} ${n === 1 ? 'dia útil' : 'dias úteis'}`;
        }

        function enviarWhatsAppOrcamento() {
          const c = calcular();
          const msg = montarMensagemWhats({
            nome: document.getElementById('proj-nome').value.trim() || 'Projeto',
            semNota: c.valorSemNota,
            comNota: c.valorComNota,
            prazo: rotuloPrazo(cronogramaData, c.dias),
            pagamento: textoParcelas(parcelasData),
            validade: empresa.validade
          });
          return copiarParaWhats(msg);
        }

        function enviarWhatsAppProposta() {
          const p = bancoProjetos.find(item => item.id === propostaAbertaId);
          if (!p) return;
          const r = resumoObra(p);
          const msg = montarMensagemWhats({
            nome: p.nome,
            semNota: r.semNota,
            comNota: r.valor,
            prazo: rotuloPrazo(p.cronograma, p.dias),
            pagamento: textoParcelas(p.parcelas),
            validade: p.validade
          });
          return copiarParaWhats(msg);
        }

        // V21: antes, o unico jeito de fechar um modal era cacar o X no canto.
        // Esc e o teclado padrao de dialogo, e o leitor de tela ja anuncia
        // "modal", entao fechar por Esc e o comportamento esperado.
        document.addEventListener('keydown', function (e) {
          if (e.key !== 'Escape') return;
          const editar = document.getElementById('modal-editar');
          const detalhes = document.getElementById('modal-detalhes');
          if (editar && !editar.classList.contains('hidden')) { fecharModalEdit(); return; }
          if (detalhes && !detalhes.classList.contains('hidden')) { fecharModal(); }
        });

        // V21: o boot saiu daqui para 07-boot.js. Este arquivo nao entra em
        // todas as paginas (Materiais e Equipe nao precisam de PDF nem de
        // Excel), e o window.onload daqui sobrescrevia o delas: a pagina
        // carregava os dados mas a tabela ficava vazia, sem erro no console.