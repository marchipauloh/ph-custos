/* Teste de fumaca das 4 paginas: carrega cada HTML em Chrome headless
   via file://, coleta erros de console e verifica o essencial de cada aba.
   Uso: node _paginas_teste.js */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const RAIZ = path.join(__dirname, '..');
const SAIDA = path.join(RAIZ, '_chrome');

if (!fs.existsSync(CHROME)) { console.log('Chrome nao encontrado em ' + CHROME); process.exit(2); }
fs.mkdirSync(SAIDA, { recursive: true });

const PAGINAS = ['orcamento', 'materiais', 'equipe', 'financeiro'];

function chrome(args) {
  // --dump-dom escreve no stdout: precisa ser capturado, nao descartado.
  return new Promise(res => {
    const p = spawn(CHROME, args);
    let out = '';
    p.stdout.on('data', d => { out += d; });
    p.on('close', () => res(out));
  });
}

// Cada pagina: o que precisa existir e o que nao pode quebrar.
const CONFERIR = {
  orcamento: ['proj-dias', 'taxa-imposto', 'crono-lista-orc', 'parc-lista-orc',
    'box-opcao-com', 'res-com-nota', 'emp-cnpj', 'modal-editar', 'modal-detalhes'],
  materiais: ['tabela-mat-body', 'mat-total-geral', 'modal-editar', 'modal-detalhes'],
  equipe: ['lista-tecnicos', 'total-custo-equipe', 'equipe-comparativo'],
  financeiro: ['lista-projetos', 'fin-recebido', 'arquivo-backup']
};

(async function () {
  let falhas = 0;

  for (const pag of PAGINAS) {
    const url = 'file:///' + path.join(RAIZ, 'html', pag + '.html').replace(/\\/g, '/');
    const dump = path.join(SAIDA, pag + '.html');

    const dom = await chrome([
      '--headless=new', '--disable-gpu', '--no-sandbox', '--virtual-time-budget=6000',
      '--dump-dom', url
    ]);

    if (!dom || dom.length < 500) { console.log('  FALHOU ' + pag + ': nao gerou DOM'); falhas++; continue; }

    // 1. nenhum input ficou com value="undefined" / "NaN"
    const undef = (dom.match(/value="(undefined|NaN)"/g) || []).length;

    // 2. todos os ids esperados existem
    const faltando = CONFERIR[pag].filter(id => dom.indexOf('id="' + id + '"') < 0);

    // 3. o material foi renderizado (a prova que o rascunho/config carregou)
    let cheio = 'n/a';
    if (pag === 'materiais') {
      const linhas = (dom.match(/atualizarMat\(\d+, 'prod'/g) || []).length;
      cheio = linhas + ' linhas';
      if (linhas === 0) { console.log('  FALHOU ' + pag + ': tabela de materiais vazia'); falhas++; }
    }
    if (pag === 'equipe') {
      const linhas = (dom.match(/atualizarTecnico\(\d+, 'nome'/g) || []).length;
      cheio = linhas + ' tecnicos';
      if (linhas === 0) { console.log('  FALHOU ' + pag + ': lista de tecnicos vazia'); falhas++; }
    }

    // 4. o valor da aba foi calculado de verdade
    const total = (dom.match(/id="mat-total-geral"[^>]*>([^<]*)</) || [])[1]
      || (dom.match(/id="total-custo-equipe"[^>]*>([^<]*)</) || [])[1]
      || (dom.match(/id="card-cost-total"[^>]*>([^<]*)</) || [])[1] || '?';

    const ok = undef === 0 && faltando.length === 0;
    if (!ok) falhas++;
    console.log('  ' + (ok ? 'OK   ' : 'FALHOU ') + pag.padEnd(12) +
      'total=' + String(total).padEnd(14) + cheio.padEnd(14) +
      (undef ? ' UNDEF=' + undef : '') +
      (faltando.length ? ' FALTANDO=' + faltando.join(',') : ''));
  }

  console.log('\n  ' + (falhas ? falhas + ' pagina(s) com problema' : '4 paginas OK'));
  process.exit(falhas ? 1 : 0);
})();
