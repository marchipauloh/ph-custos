/* =====================================================================
   Teste do ponto mais fragil da V21: o RASCUNHO entre paginas.
   ---------------------------------------------------------------------
   Antes as 4 abas eram uma pagina so, e materiais/equipe/cronograma viviam
   na memoria do JavaScript. Ao quebrar em paginas, essa memoria morre a
   cada troca - e o usuario perderia os 19 materiais ao clicar em Equipe.

   Este teste navega de verdade entre os arquivos (o Chrome abre um por
   vez) e confere se o que foi digitado chegou na outra ponta.
   ===================================================================== */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const RAIZ = path.join(__dirname, '..');

if (!fs.existsSync(CHROME)) { console.log('Chrome nao encontrado.'); process.exit(2); }

// --user-data-dir fixo: mantem o mesmo localStorage entre as navegacoes.
// Sem isso cada pagina comeca do zero e o teste nao prova nada.
const PERFIL = path.join(RAIZ, '_perfil_teste');

// COMO ESTE TESTE FALA COM O NAVEGADOR
// -------------------------------------
// O --dump-dom do Chrome imprime a pagina no stdout, mas so funciona sem
// --user-data-dir; com perfil customizado o Chrome sai com 151 bytes e nao
// imprime nada (ja testado). E sem perfil fixo o localStorage nao sobrevive
// entre execucoes - que e justamente o que este teste precisa verificar.
//
// Solucao: passar o estado pela URL. A pagina temporaria recebe um
// <script> de semente no <head>, ANTES dos scripts do sistema, que grava o
// estado no localStorage. Assim cada execucao do Chrome e independente e
// deterministica, e o agente devolve o estado novo codificado no <title>.
// ----------------------------------------------------------------------

// O estado e um objeto {chaveLocalStorage: valor}. A semente do <head>
// faz JSON.parse do que vier depois de "#s=", entao aqui serializamos.
function urlDe(pag, estado) {
  const base = 'file:///' + path.join(RAIZ, 'html', pag).replace(/\\/g, '/');
  if (!estado) return base;
  return base + '#s=' + encodeURIComponent(JSON.stringify(estado));
}

function rodarChrome(args, timeoutMs) {
  return new Promise(res => {
    const p = spawn(CHROME, args);
    let out = '';
    const t = setTimeout(() => { try { p.kill(); } catch (e) {} }, timeoutMs || 20000);
    p.stdout.on('data', d => { out += d; });
    p.on('close', () => { clearTimeout(t); res(out); });
  });
}

const ARQ_ESTADO = path.join(RAIZ, '_estado.json');
const CHAVE = 'ph_rascunho';

// Monta a pagina temporaria: semente no <head> (antes do sistema) +
// agente no fim (que devolve o estado novo pelo <title>).
// A semente recebe um objeto {chave: valorSerializado} e semeia cada
// chave no localStorage antes dos scripts do sistema carregarem. Assim o
// teste controla o ponto de partida e o estado atravessa as execucoes.
function comAgente(pag, codigo) {
  const original = fs.readFileSync(path.join(RAIZ, 'html', pag), 'utf8');

  const semente = '<script>(function(){\n' +
    '  if (location.hash.indexOf("#s=") < 0) return;\n' +
    '  var o;\n' +
    '  try { o = JSON.parse(decodeURIComponent(location.hash.slice(3))); } catch (e) { return; }\n' +
    '  Object.keys(o).forEach(function (k) {\n' +
    '    try { localStorage.setItem(k, o[k]); } catch (e) {}\n' +
    '  });\n' +
    '})();</script>';

  const agente = '<script>setTimeout(function(){\n' +
    '  var r;\n' +
    '  try { ' + codigo + ' } catch (e) { r = "ERRO:" + e.message; }\n' +
    '  document.title = String(r);\n' +
    '}, 700);</script>';

  const html = original
    .replace('<head>', '<head>' + semente)
    .replace('</body>', agente + '\n</body>');

  fs.writeFileSync(path.join(RAIZ, 'html', '_t_' + pag), html, 'utf8');
  return '_t_' + pag;
}

function titulo(dom) {
  const m = dom.match(/<title>([^<]*)<\/title>/);
  return m ? m[1].trim() : '(sem titulo)';
}

function limpar() {
  ['orcamento', 'materiais', 'equipe', 'financeiro'].forEach(n => {
    try { fs.unlinkSync(path.join(RAIZ, 'html', '_t_' + n + '.html')); } catch (e) {}
  });
}

const abrir = (pag) => rodarChrome([
  '--user-data-dir=' + PERFIL, '--no-first-run', '--no-default-browser-check',
  '--headless=new', '--disable-gpu', '--no-sandbox',
  '--virtual-time-budget=9000', '--dump-dom', urlDe(pag)
]);

const conferir = (rotulo, resultado) => {
  const ruim = resultado.indexOf('FALHOU') === 0 || resultado.indexOf('ERRO') === 0;
  console.log('  ' + (ruim ? 'FALHOU' : 'OK   ') + ' ' + rotulo.padEnd(42) + resultado);
  return ruim ? 1 : 0;
};

// Abre a pagina temporaria e devolve o texto que o agente deixou no <title>.
async function rodar(pag, estado) {
  const dom = await rodarChrome([
    '--headless=new', '--disable-gpu', '--no-sandbox',
    // Perfil descartavel por execucao: sem --user-data-dir o Chrome usa o
    // perfil padrao, trava num SingletonLock e deixa processos orfaos
    // (ja acumulei 23 pendurados quando descobri isso).
    '--user-data-dir=' + path.join(RAIZ, '_perfil_tmp'),
    // 4000ms basta: o boot e o agente rodam em menos de 1s.
    '--virtual-time-budget=4000', '--dump-dom', urlDe(pag, estado)
  ]);
  const m = dom.match(/<title>([^<]*)<\/title>/);
  return m ? decodeURIComponent(m[1].trim()) : '(sem titulo)';
}

// O localStorage do perfil persiste entre execucoes do Chrome. Isso
// quebraria o teste (a proposta da etapa 5 continuaria la na 6), entao
// a SEMEADA sempre comeca zerando o banco de propostas.
function semearZerada() {
  return { ph_projetos: '[]', ph_empresa: '{}' };
}

// Os agentes devolvem "RESULTADO" e, quando precisam semear a etapa
// seguinte, prefixam "ESTADO@@<conteudo do localStorage>".
const ESTADO_RE = /ESTADO@@([\s\S]*)$/;

function temEstado(r) {
  const m = r.match(ESTADO_RE);
  return m ? m[1] : null;
}

(async function () {
  const falhas = [];
  const semente = {};

  console.log('\n  Rascunho entre paginas: cada etapa roda em um Chrome novo,\n' +
              '  com o estado da etapa anterior semeado pela URL.\n');

  // ---- 1. Aba 1: digitar valores e gravar o rascunho ----
  comAgente('orcamento.html', `
    document.getElementById('proj-nome').value = 'CLIENTE TESTE';
    document.getElementById('proj-dias').value = '12';
    document.getElementById('eng-q').value = '2';
    document.getElementById('eng-v').value = '900';
    document.getElementById('taxa-margem').value = '35';
    document.getElementById('cli-local').value = 'HOLAMBRA TESTE';
    document.getElementById('eng-v').dispatchEvent(new Event('input',{bubbles:true}));
    materiaisData[0] = { prod: 'ITEM-UNICO-XYZ', marca: 'TESTE', q: 7, v: 111 };
    guardarRascunho();
    var gravado = localStorage.getItem('ph_rascunho');
    r = (gravado && gravado.length > 500 ? 'OK' : 'FALHOU') +
        ' mat0=' + materiaisData[0].prod + ' n=' + materiaisData.length +
        ' gravado=' + (gravado ? gravado.length : 'NADA');
  `);
  falhas.push(['Aba 1: preencheu e gravou', await rodar('_t_orcamento.html')]);

  // Pega o rascunho gravado para semear as proximas paginas
  comAgente('orcamento.html', `r = 'ESTADO@@' + localStorage.getItem('ph_rascunho');`);
  const bruto = await rodar('_t_orcamento.html');
  semente.ph_rascunho = temEstado(bruto);

  // ---- 2. Materiais ----
  comAgente('materiais.html', `
    var linhas = document.querySelectorAll('#tabela-mat-body tr').length;
    var achou = document.body.innerHTML.indexOf('ITEM-UNICO-XYZ') >= 0;
    r = (linhas === 19 && achou ? 'OK' : 'FALHOU') + ' linhas=' + linhas +
        ' itemAlterado=' + achou +
        ' total=' + ((document.getElementById('mat-total-geral')||{}).textContent||'?');
  `);
  falhas.push(['Aba 2: material alterado chegou', await rodar('_t_materiais.html', semente)]);

  // ---- 3. Equipe ----
  comAgente('equipe.html', `
    var ul = document.getElementById('lista-tecnicos');
    // Cada tecnico tem 3 inputs (nome, dias, valor). Conta pelo botao de
    // remover, que existe uma vez por tecnico.
    var tecs = ul ? ul.querySelectorAll('button[onclick^="removerTecnico"]').length : 0;
    var matVivo = materiaisData.length === 19 && materiaisData[0].prod === 'ITEM-UNICO-XYZ';
    r = (matVivo && tecs === 3 ? 'OK' : 'FALHOU') + ' tecs=' + tecs +
        ' materialContinua=' + matVivo +
        ' | ' + ((document.getElementById('equipe-comparativo')||{}).textContent||'').slice(0,52);
  `);
  falhas.push(['Aba 3: equipe desenhada + material vivo', await rodar('_t_equipe.html', semente)]);

  // ---- 4. Volta a Aba 1 ----
  comAgente('orcamento.html', `
    var d = document.getElementById('proj-dias').value;
    var eq = document.getElementById('eng-q').value;
    var ev = document.getElementById('eng-v').value;
    var mg = document.getElementById('taxa-margem').value;
    var loc = document.getElementById('cli-local').value;
    var m0 = materiaisData[0] ? materiaisData[0].prod : '-';
    r = (d === '12' && eq === '2' && ev === '900' && mg === '35' && m0 === 'ITEM-UNICO-XYZ' ? 'OK' : 'FALHOU')
      + ' dias=' + d + ' engQ=' + eq + ' engV=' + ev + ' margem=' + mg + ' local=' + loc;
  `);
  falhas.push(['Aba 1: campos voltaram', await rodar('_t_orcamento.html', semente)]);

  // ---- 5. Salvar a proposta (banco zerado antes, para contar certo) ----
  const semear5 = semearZerada();
  semear5.ph_rascunho = semente.ph_rascunho;
  comAgente('orcamento.html', `
    window.alert = function(){};
    window.confirm = function(){ return true; };
    salvarOrcamento();
    var ps = JSON.parse(localStorage.getItem('ph_projetos') || '[]');
    r = (ps.length === 1 ? 'OK' : 'FALHOU') + ' propostas=' + ps.length +
        ' valor=' + (ps[0] ? fmt(ps[0].valor) : '-');
  `);
  falhas.push(['Aba 1: proposta gravada no banco', await rodar('_t_orcamento.html', semear5)]);
  // a proposta gravada e o que a etapa 6 precisa ver
  comAgente('orcamento.html', `r = 'ESTADO@@' + localStorage.getItem('ph_projetos');`);
  semente.ph_projetos = temEstado(await rodar('_t_orcamento.html', semear5));

  // ---- 6. Painel mostra a proposta ----
  comAgente('financeiro.html', `
    var achou = document.body.innerHTML.indexOf('CLIENTE TESTE') >= 0;
    r = (achou ? 'OK' : 'FALHOU') + ' listaViu=' + achou +
        ' | recebido=' + ((document.getElementById('fin-recebido')||{}).textContent||'?');
  `);
  falhas.push(['Aba 4: proposta no painel', await rodar('_t_financeiro.html', semente)]);

  limpar();

  let ruins = 0;
  falhas.forEach(([rot, res]) => {
    const ok = res.indexOf('OK') === 0;
    if (!ok) ruins++;
    console.log('  ' + (ok ? 'OK   ' : 'FALHOU') + ' ' + rot.padEnd(38) + res.slice(0, 110));
  });

  console.log('\n  ' + (ruins ? ruins + ' etapa(s) com problema' : 'TUDO OK - o rascunho sobreviveu as paginas'));
  process.exit(ruins ? 1 : 0);
})();
