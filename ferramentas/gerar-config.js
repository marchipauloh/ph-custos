/* =====================================================================
   PH Custos - gerador de configuracao
   ---------------------------------------------------------------------
   Converte  public/data/valores.json  em  public/data/valores.js

   Por que dois arquivos?
     O .json e onde voce EDITA (familiar, formatado, versionavel).
     O .js e o que o sistema LE, porque o navegador bloqueia fetch() de
     arquivo local (CORS) - abrir o HTML com dois cliques quebraria.

   Quando alterar valores: edite o .json, rode este script, e o
   public/data/valores.js nasce atualizado.

       node ferramentas/gerar-config.js
   ===================================================================== */

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const JSON_PATH = path.join(RAIZ, 'public', 'data', 'valores.json');
const JS_PATH = path.join(RAIZ, 'public', 'data', 'valores.js');

const CABECALHO = `/* =====================================================================
   PH Custos - valores padrao  >>  ARQUIVO GERADO, NAO EDITE DIRETO <<

   Este arquivo e o public/data/valores.json convertido para .js, para o sistema
   conseguir ler em file:// (o navegador bloqueia fetch() de arquivos
   locais por CORS - o .json ficaria inutilizavel abrindo com dois cliques).

   Quer mudar um valor? Edite  public/data/valores.json  e regere com:

       node ferramentas/gerar-config.js

   ---------------------------------------------------------------------
   MATERIAIS   lista de insumos que ja vem preenchida na Aba 2
   EQUIPE      tecnicos que ja vem preenchidos na Aba 3
   PARCELAS    forma de pagamento padrao (soma 100%)
   GRUPOS      agrupamento dos itens na proposta impressa
   ------------------------------------------------------------------ */
window.VALORES = `;

function falhar(msg) {
  console.error('\n  ERRO: ' + msg + '\n');
  process.exit(1);
}

// --- leitura ---------------------------------------------------------------
let config;
try {
  config = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
} catch (e) {
  falhar('nao consegui ler o data/valores.json -> ' + e.message);
}

// --- validacao: e melhor achar o erro aqui do que na tela ---------------
const problemas = [];
const lista = (v) => Array.isArray(v) && v.length > 0;

if (!lista(config.materiais)) problemas.push('"materiais" precisa ser uma lista com ao menos 1 item');
if (!lista(config.equipe)) problemas.push('"equipe" precisa ser uma lista com ao menos 1 item');
if (!lista(config.parcelasPadrao)) problemas.push('"parcelasPadrao" precisa ser uma lista com ao menos 1 parcela');
if (!lista(config.gruposProposta)) problemas.push('"gruposProposta" precisa ser uma lista com ao menos 1 grupo');

if (lista(config.materiais)) {
  config.materiais.forEach((m, i) => {
    ['prod', 'q', 'v'].forEach(campo => {
      if (m[campo] === undefined || m[campo] === null || m[campo] === '') {
        problemas.push('materiais[' + i + '] sem "' + campo + '"');
      }
    });
    if (typeof m.v !== 'number' || !isFinite(m.v)) problemas.push('materiais[' + i + '].v precisa ser numero');
    if (typeof m.q !== 'number' || !isFinite(m.q)) problemas.push('materiais[' + i + '].q precisa ser numero');
  });
}

const somaPct = lista(config.parcelasPadrao)
  ? config.parcelasPadrao.reduce((s, p) => s + (Number(p.pct) || 0), 0)
  : 0;
if (lista(config.parcelasPadrao) && Math.abs(somaPct - 100) > 0.005) {
  problemas.push('"parcelasPadrao" soma ' + somaPct + '%, mas as parcelas precisam fechar 100%');
}

if (config.taxaImpostoPadrao !== undefined) {
  const t = Number(config.taxaImpostoPadrao);
  if (!isFinite(t) || t < 0 || t > 100) {
    problemas.push('"taxaImpostoPadrao" tem que ser um numero entre 0 e 100');
  }
}

if (problemas.length) {
  console.error('\n  O data/valores.json tem ' + problemas.length + ' problema(s):\n');
  problemas.forEach(p => console.error('    - ' + p));
  console.error('\n  Nada foi gerado. Corrija o .json e rode de novo.\n');
  process.exit(1);
}

// --- escrita ---------------------------------------------------------------
try {
  fs.writeFileSync(JS_PATH, CABECALHO + JSON.stringify(config, null, 2) + ';\n', 'utf8');
} catch (e) {
  falhar('nao consegui escrever o data/valores.js -> ' + e.message);
}

// --- conferencia: o .js gerado precisa bater com o .json -------------------
const relatorio = [
  '  materiais        : ' + config.materiais.length,
  '  equipe           : ' + config.equipe.length,
  '  parcelas padrao  : ' + config.parcelasPadrao.length + ' (soma ' + somaPct + '%)',
  '  grupos proposta  : ' + config.gruposProposta.length,
  '  custo dos insumos: R$ ' + config.materiais.reduce((s, m) => s + m.q * m.v, 0).toFixed(2)
];

console.log('\n  data/valores.json  ->  data/valores.js   OK\n');
relatorio.forEach(l => console.log('    ' + l));
console.log('\n  Recarregue o sistema no navegador para ver as mudancas.\n');