/* =====================================================================
   PH Custos - gerador das paginas
   ---------------------------------------------------------------------
   Monta os 4 HTMLs de public/html/ a partir do arquivo unico PH_projetos.html.

   Por que gerar em vez de escrever na mao?
     - o corpo de cada aba e o MESMO codigo que ja funcionava; o script
       so recorta e embrulha. Nenhum conteudo e reescrito, entao nao ha
       risco de alterar sem querer uma tela que estava testada.
     - cabecalho, menu e lista de scripts ficam iguais nas 4 paginas.
     - da para rodar de novo a qualquer momento sem medo.

   CUIDADO: se voce editar direto public/html/orcamento.html, o proximo
   `node ferramentas/gerar-paginas.js` sobrescreve. Edite o
   PH_projetos.html (ou o bloco SECOES) e regere.
   ===================================================================== */

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const PUBLIC_ROOT = path.join(RAIZ, 'public');
const ORIGEM = path.join(RAIZ, 'PH_projetos.html');
const SAIDA = path.join(PUBLIC_ROOT, 'html');
const CSS_PATH = path.join(PUBLIC_ROOT, 'css', 'PH_custos.css');

function falhar(msg) {
  console.error('\n  ERRO: ' + msg + '\n');
  process.exit(1);
}

if (!fs.existsSync(ORIGEM)) falhar('nao achei o PH_projetos.html na raiz do projeto.');

const bruto = fs.readFileSync(ORIGEM, 'utf8');
const L = bruto.split(/\r?\n/);

// recorta um intervalo de linhas e tira o branco das pontas
const bloco = (a, b) => L.slice(a - 1, b).join('\n').replace(/^\n+|\s+$/, '');
// recorta ja com indentacao de 4 espacos (o arquivo unico ja tem 4)
const ind = (s) => s.split('\n').map(l => l.length ? '    ' + l : l).join('\n');

// =====================================================================
// V21: os limites das secoes sao ACHADOS pelo conteudo, nunca escritos a mao.
// Numeros fixos quebravam em silencio a cada correcao no arquivo unico: o
// gerador produzia paginas sem o modal, sem a tabela de materiais, e o
// aviso nao dizia nada disso. Aqui cada secao eanchada por um marcador que
// existe no proprio HTML.
// =====================================================================

// Acha a linha (1-based) cujo texto casa com o marcador. -1 se nao achar.
function acharLinha(marcador, apartirDe) {
  for (let i = apartirDe || 0; i < L.length; i++) {
    if (L[i].indexOf(marcador) >= 0) return i + 1;
  }
  return -1;
}

function blocoAte(abre, fecha) {
  const de = acharLinha(abre);
  const ate = acharLinha(fecha, de);
  if (de < 0 || ate < 0) {
    falhar('nao achei os marcadores de ' + abre.slice(0, 40) + ' / ' + fecha.slice(0, 40));
  }
  return { de: de, ate: ate };
}

// Os dois modais vao do primeiro <div id="modal-..."> ate a ultima linha
// antes do <script> do sistema. Recortar no meio deixaria o </script> do
// HTML engolido por um comentario, e a pagina abriria sem JS nenhum.
const MODAIS = (() => {
  const de = acharLinha('<div id="modal-editar"');
  const script = acharLinha('  <script>');
  if (de < 0 || script < 0) falhar('nao achei os modais ou o <script> do sistema');
  let ate = script - 1;
  while (ate > de && !L[ate - 1].trim()) ate--;
  return [de, ate];
})();

// Cabecalho e menu ficam iguais nas 4 paginas.
const CABECALHO = blocoAte('<!-- HEADER COM LOGO', '</header>');
const MENU_BLOCO = blocoAte('<!-- NAVEGA', '</nav>');
const SECOES = [
  {
    arquivo: 'orcamento.html',
    titulo: 'PH Custos - Proposta & Orçamento',
    ativo: 'orcamento',
    partes: [{ titulo: 'ABA 1: PROPOSTA & CONFIGURAÇÃO', ...blocoAte('<!-- ABA 1:', '</section>') }],
    precisa: ['regras', 'telas', 'relatorios', 'exportacao', 'arquivos']
  },
  {
    arquivo: 'materiais.html',
    titulo: 'PH Custos - Lista de Materiais',
    ativo: 'materiais',
    partes: [{ titulo: 'ABA 2: LISTA MATERIAL', ...blocoAte('<!-- ABA 2:', '</section>') }],
    precisa: ['regras', 'telas']
  },
  {
    arquivo: 'equipe.html',
    titulo: 'PH Custos - Equipe de Campo',
    ativo: 'equipe',
    partes: [{ titulo: 'ABA 3: EQUIPE DE TÉCNICOS ENVOLVIDOS', ...blocoAte('<!-- ABA 3:', '</section>') }],
    precisa: ['regras', 'telas']
  },
  {
    arquivo: 'financeiro.html',
    titulo: 'PH Custos - Painel Financeiro',
    ativo: 'financeiro',
    partes: [{ titulo: 'ABA 4: PAINEL FINANCEIRO', ...blocoAte('<!-- ABA 4:', '</section>') }],
    precisa: ['regras', 'telas', 'relatorios', 'exportacao', 'arquivos']
  }
];

// Ordem de carga. Estas tres entram SEMPRE em toda pagina:
//   00-valores  le o data/valores.js e cria o rascunho
//   01-core     declara as variaveis de estado (materiaisData, cronogramaData...)
//   06-arquivos  salvar em pasta escolhida, com data/hora/cliente no nome
//   07-boot     o window.onload que monta a tela (vem por ultimo de proposito)
const ORDEM = ['00-valores', '01-core', '02-regras', '03-telas', '04-relatorios', '05-exportacao', '06-arquivos', '07-boot'];
const SEMPRE = ['00-valores', '01-core', '07-boot'];

// Descobre o nome real do arquivo pelo prefixo numerico (evita digitar de novo)
function nomeJs(prefixo) {
  const achado = fs.readdirSync(path.join(PUBLIC_ROOT, 'js')).find(f => f.indexOf(prefixo) === 0);
  if (!achado) falhar('nao achei o public/js/' + prefixo + '*.js');
  return achado;
}

// Menu lateral com as 4 entradas (substitui o <nav> de abas por <a>).
// Navegar entre abas = trocar de arquivo; o rascunho viaja pelo localStorage.
function gerarMenu(ativo) {
  const abas = [
    { file: "orcamento.html", label: "1. Proposta &amp; Status" },
    { file: "materiais.html", label: "2. Lista Materiais" },
    { file: "equipe.html", label: "3. Equipe de Campo" },
    { file: "financeiro.html", label: "4. Painel Financeiro" }
  ];
  let html = `    <nav class="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-[#181b26] border border-slate-800 rounded-xl no-print" aria-label="Navegacao principal">\n`;
  abas.forEach(a => {
    const isAtivo = (a.file === ativo + ".html");
    const classes = `menu-btn py-2.5 px-2 text-center rounded-lg text-xs font-bold transition-all no-underline text-slate-400 hover:bg-slate-800 ${isAtivo ? "ativo" : ""}`;
    html += `      <a href="${a.file}" class="${classes}">${a.label}</a>\n`;
  });
  html += `    </nav>`;
  return html;
}

// =====================================================================
function montarPagina(sec) {
  const corpo = sec.partes.map(p =>
    '    <!-- ' + p.titulo + ' -->\n' + ind(bloco(p.de, p.ate))
  ).join('\n\n');

  const tags = ORDEM
    .filter(n => SEMPRE.indexOf(n) >= 0 || sec.precisa.some(p => n.indexOf(p) >= 0))
    .map(n => '  <script src="../js/' + nomeJs(n) + '"></script>')
    .join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sec.titulo}</title>
  <link rel="stylesheet" href="../css/PH_custos_compilado.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../css/PH_custos.css">
</head>
<body class="p-3 sm:p-6 flex justify-center items-start">

  <div class="w-full max-w-5xl flex flex-col gap-4">

${bloco(CABECALHO.de, CABECALHO.ate)}

${gerarMenu(sec.ativo)}

${corpo}

    <!-- MODAIS: ficam em todas as paginas porque podem abrir de qualquer
         aba - a lista de propostas da Aba 4 abre os dois, e a Aba 1 abre
         o de ajustes ao reabrir uma proposta. -->
${ind(bloco(MODAIS[0], MODAIS[1]))}

  </div>

  <script src="../data/valores.js"></script>
${tags}

  <!-- Marca no menu o item da pagina atual e REVELA o conteudo.

       O <section> da aba vem do arquivo original com class="hidden".
       Isso existia para o jogo de abas dentro de uma pagina so. Como cada
       aba agora e um HTML proprio, esse "hidden" esconde a pagina
       inteira: a aba abre so o cabecalho, com o corpo em branco. Este
       script e quem tira o "hidden" da secao da aba atual. -->
  <script>
    (function () {
      var ativo = ${JSON.stringify(sec.ativo)} + '.html';

      function revelar() {
        document.querySelectorAll('.menu-btn').forEach(function (b) {
          if (b.getAttribute('href') === ativo) b.classList.add('ativo');
        });

        // Tira o "hidden" da secao desta aba. Sem isto a pagina fica em
        // branco: o cabecalho aparece, o conteudo nao.
        var sec = document.getElementById('tab-' + ativo.replace('.html', ''));
        if (sec) {
          sec.classList.remove('hidden');
          sec.classList.add('flex');
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', revelar);
      } else {
        revelar();
      }
    })();
  </script>
</body>
</html>
`;
}

// =====================================================================
// execucao
// =====================================================================
const MARGEM_CSS = `
    /* V21: cada aba virou uma pagina. O item do menu da pagina atual
       recebe este visual, marcado pelo script do rodape. */
    .menu-btn.ativo {
      background-color: #FF7A00 !important;
      color: #fff !important;
    }`;

if (!fs.existsSync(CSS_PATH)) falhar('nao achei o public/css/PH_custos.css');
const cssAtual = fs.readFileSync(CSS_PATH, 'utf8').replace(MARGEM_CSS, '');
fs.writeFileSync(CSS_PATH, cssAtual + MARGEM_CSS, 'utf8');

fs.mkdirSync(SAIDA, { recursive: true });

SECOES.forEach(sec => {
  const destino = path.join(SAIDA, sec.arquivo);
  const html = montarPagina(sec);
  fs.writeFileSync(destino, html, 'utf8');

  // --- conferencia: pegaria o bug do comentario nao fechado ------------
  // Se algum <script> cair dentro de um <!-- ... -->, a pagina abre sem
  // JS nenhum e fica em branco. Barato de verificar aqui.
  //
  // Conta comentarios de verdade, ignorando <script> e <style>: o proprio
  // codigo JS usa a sequencia "-->" e contaria como um fechamento falso.
  const semCodigo = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '');

  const abre = (semCodigo.match(/<!--/g) || []).length;
  const fecha = (semCodigo.match(/-->/g) || []).length;
  const scriptsNoHtml = (html.match(/<script /g) || []).length;

  const problemas = [];
  if (abre !== fecha) {
    problemas.push('comentario HTML nao fechado (' + abre + ' abre, ' + fecha + ' fecha)');
  }
  if (scriptsNoHtml < 3) {
    problemas.push('so ' + scriptsNoHtml + ' tags <script> - alguma delas esta dentro de um comentario');
  }
  if (html.indexOf('</body>') < 0) problemas.push('falta </body>');
  if (html.indexOf('</html>') < 0) problemas.push('falta </html>');
  if (html.indexOf('../data/valores.js') < 0) problemas.push('nao carrega o data/valores.js');

  const kb = (fs.statSync(destino).size / 1024).toFixed(1);
  console.log('  html/' + sec.arquivo.padEnd(20) + kb.padStart(7) + ' KB   ' +
    (problemas.length ? 'FALHOU: ' + problemas.join('; ') : 'OK (' + scriptsNoHtml + ' scripts)'));
  if (problemas.length) process.exitCode = 1;
});

if (!process.exitCode) console.log('\n  4 paginas geradas e conferidas. Abra  html/orcamento.html\n');
else console.log('\n  Gerou, mas com problema. Nao confie nas paginas.\n');
