/* Testes das regras de negocio do PH Custos (executar: node _testes.js) */

// ---- funcoes puras copiadas do app ----
function parseNum(val) {
  if (typeof val === 'number') return isFinite(val) ? val : 0;
  if (val === null || val === undefined) return 0;
  let s = String(val).replace(/R\$/g, '').replace(/\s/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}
function r2(v) { return Math.round((parseNum(v) + Number.EPSILON) * 100) / 100; }
let _seqEtapa = 0;
function novoIdEtapa() {
  _seqEtapa = (_seqEtapa + 1) % 1000000;
  return 'e' + Date.now().toString(36) + _seqEtapa.toString(36) + Math.random().toString(36).slice(2, 6);
}

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

const STATUS_VALIDOS = ['A Confirmar', 'Agendado', 'Recebido', 'Rejeitado'];
function normalizarStatus(s) { return STATUS_VALIDOS.indexOf(s) >= 0 ? s : 'A Confirmar'; }
function normalizarId(id) {
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : Date.now();
}

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
  (p.tecnicosObra || []).forEach(t => { gastosEquipe += parseNum(t.dias) * parseNum(t.valor); });
  const gastos = gastosInsumos + gastosEquipe;
  const parcelas = p.parcelas || [];
  const valores = valoresParcelas(parcelas, valorCliente);
  let recebido = 0;
  parcelas.forEach((x, i) => { if (x.recebido) recebido += valores[i]; });
  return {
    valor, semNota, imposto, valorCliente, semNF, gastos,
    resultado: valorCliente - imposto - gastos,
    recebido, saldo: Math.max(0, r2(valorCliente - recebido))
  };
}

// replica exata da logistica do calcular()
function logisticaV20(o) {
  const qtdRefeicoes = o.pessoas * o.alimQ * o.dias;
  const totalAlim = qtdRefeicoes * o.alimV;
  const totalCarro = o.carroKm + o.carroPed;
  const totalHotel = o.hotelPess > 0 ? o.hotelDias * o.hotelV : 0;
  return { qtdRefeicoes, totalAlim, totalCarro, totalHotel };
}

let ok = 0; const falhas = [];
function eq(n, a, b) {
  const x = JSON.stringify(a), y = JSON.stringify(b);
  if (x === y) ok++; else falhas.push(n + ' -> esperado ' + y + ', veio ' + x);
}
function v(nome, cond) { if (cond) ok++; else falhas.push(nome); }

// 1. parseNum aceita os dois formatos de numero
eq('parseNum R$ 1.234,56', parseNum('R$ 1.234,56'), 1234.56);
eq('parseNum 1234.56', parseNum('1234.56'), 1234.56);
eq('parseNum vazio', parseNum(''), 0);
eq('parseNum null', parseNum(null), 0);
eq('parseNum lixo', parseNum('abc'), 0);

// 2. Hotel: a formula antiga nunca zerava; a nova zera com pessoas=0
const h1 = logisticaV20({ pessoas:1, dias:3, alimQ:2, alimV:50, carroKm:240, carroPed:80, hotelDias:3, hotelPess:4, hotelV:450 });
eq('hotel 3x450 = 1350', h1.totalHotel, 1350);
const h2 = logisticaV20({ pessoas:1, dias:3, alimQ:2, alimV:50, carroKm:240, carroPed:80, hotelDias:3, hotelPess:0, hotelV:450 });
eq('hotel zerado com pessoas=0', h2.totalHotel, 0);
eq('carro = km + pedagio', h1.totalCarro, 320);

// 3. Parcelas: soma exata quando fecha 100%
const vs = valoresParcelas([{pct:40},{pct:30},{pct:30}], 1000.01);
eq('parcelas somam o total', r2(vs.reduce((a,b)=>a+b,0)), 1000.01);
eq('primeira parcela 40pct', vs[0], 400);

// 4. resumoObra: com NF e sem NF
const base = { valor:1150, taxaImposto:15, gastosExecutados:[{q:1,v:100,vPago:100}], tecnicosObra:[], parcelas:[{pct:100,recebido:true}] };
eq('com NF cliente paga o cheio', resumoObra({...base, modalidade:'com'}).valorCliente, 1150);
eq('com NF imposto sai da conta', resumoObra({...base, modalidade:'com'}).imposto, 150);
eq('sem NF cliente paga sem nota', resumoObra({...base, modalidade:'sem'}).valorCliente, 1000);
eq('sem NF imposto zero', resumoObra({...base, modalidade:'sem'}).imposto, 0);
eq('sem NF resultado 900', resumoObra({...base, modalidade:'sem'}).resultado, 900);
v('imposto nunca infla o lucro (com e sem NF dao o mesmo resultado)',
  resumoObra({...base, modalidade:'com'}).resultado === resumoObra({...base, modalidade:'sem'}).resultado);
v('cliente paga mais na opcao com NF', resumoObra({...base, modalidade:'com'}).valorCliente > resumoObra({...base, modalidade:'sem'}).valorCliente);
eq('parcela recebida zera o saldo', resumoObra({...base, modalidade:'sem'}).saldo, 0);

// 5. Seguranca: backup adulterado nao passa
eq('status invalido vira padrao', normalizarStatus('<script>alert(1)</script>'), 'A Confirmar');
eq('status valido preservado', normalizarStatus('Recebido'), 'Recebido');
v('id malicioso rejeitado', normalizarId('1);alert(1)') > 1e12);
v('id numerico preservado', normalizarId(1757000000000) === 1757000000000);

// 6. Cronograma: ids unicos e "feita" sobrevive a reordenacao
const ids = new Set();
for (let k=0;k<2000;k++) ids.add(novoIdEtapa());
v('2000 ids de etapa unicos', ids.size === 2000);
const feitas = new Set([{id:'a',feita:true},{id:'b',feita:false},{id:'c',feita:true}].filter(e=>e.feita).map(e=>e.id));
const res = [{id:'c'},{id:'a'},{id:'b'}].map(e => ({ id:e.id, feita: feitas.has(e.id) }));
eq('apos reordenar C feita', res[0].feita, true);
eq('apos reordenar A feita', res[1].feita, true);
eq('apos reordenar B pendente', res[2].feita, false);

console.log('\n=== PH Custos - testes das regras de negocio ===\n');
console.log('Passaram: ' + ok + ' | Falharam: ' + falhas.length);
if (falhas.length) { console.log('\nFALHAS:'); falhas.forEach(f => console.log(' - ' + f)); process.exit(1); }
console.log('Tudo certo.');
