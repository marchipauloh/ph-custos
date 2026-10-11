# Manutencao e modificacao

Onde mexer em cada coisa, e os cuidados.

---

## Mapa: o que mexer em cada pedido

| Quero... | Arquivo |
|---|---|
| ...mudar o preco/quantidade padrao dos materiais | `data/valores.json` |
| ...mudar os tecnicos da equipe | `data/valores.json` |
| ...mudar as cores, o tema | `css/PH_custos.css` |
| ...mudar o PDF (A4, identidade) | `css/PH_custos.css` |
| ...mudar uma regra de calculo | `js/02-regras.js` |
| ...mudar o layout de uma tela | `html/*.html` (veja o aviso) |
| ...mudar os nomes dos arquivos exportados | `js/06-arquivos.js` |
| ...mudar o que o Excel exporta | `js/05-exportacao.js` |
| ...mudar o painel financeiro | `js/04-relatorios.js` |

---

## Valores padrao

```
data/valores.json                     <- edite aqui
node ferramentas/gerar-config.js      <- regere
```

O gerador **valida antes de escrever** e avisa sem gerar se:
- um material estiver sem preco
- as parcelas nao somarem 100%
- faltar campo obrigatorio

### Por que existe o `valores.js`

O navegador bloqueia `fetch()` de arquivo local (CORS). Se usasse o
`.json` direto, o sistema so funcionaria com servidor. O `.js` gerado
faz funcionar em `file://` **e** em HTTP.

**Regra:** edite o `.json`, nunca o `.js`.

---

## Layout das telas

⚠️ **Os 4 HTMLs sao gerados.** Para mudar de verdade:

1. Edite `PH_projetos.html`
2. Rode `node ferramentas/gerar-paginas.js`

Editar `html/*.html` direto funciona, mas o gerador sobrescreve na
proxima execucao.

**Se voce quer editar direto e nao usar o gerador**, me chame: eu tiro
o gerador do fluxo e deixo os HTMLs como fonte unica.

---

## Regras de calculo

O arquivo `js/02-regras.js` tem as funcoes **puras** (sem DOM). E o
que os testes exercitam.

Exemplos:

| Funcao | O que faz |
|---|---|
| `parseNum` | le "R$ 1.234,56" e "1234.56" |
| `r2` | arredonda corrigindo erro de float |
| `resumoObra` | o numero que aparece no painel, no modal e no PDF |
| `valoresParcelas` | divide em parcelas, a ultima absorve os centavos |
| `gerarEtapasPadrao` | monta as etapas do cronograma |

### Regra de ouro ao mexer aqui

Se voce mudar uma regra de calculo, **mude o teste junto**
(`testes/regras.teste.js`). E o que garante que a regra nova nao
quebra os totais que voce jashow.

---

## Cores e tema

```
css/PH_custos.css
```

Variaveis principais:

| Variavel | Uso |
|---|---|
| `--laranja` / `#FF7A00` | cor da marca PH |
| `#181b26` | fundo dos cards |
| `#121212` | fundo do logo |

---

## Seguranca (leia antes de mexer no JS)

### A defesa atual

Todo dado que vem do usuario **precisa** passar por `esc()` antes de
entrar em HTML:

```js
// CERTO
${esc(p.nome)}

// ERRADO - abre brecha de XSS
${p.nome}
```

### Onde isso importa

O sistema monta HTML por string (`innerHTML`) em varios pontos
principalmente:

- `js/04-relatorios.js` - painel financeiro (lista de propostas)
- `js/03-telas.js` - modais, tabelas de materiais e equipe
- `js/06-arquivos.js` - nome do arquivo na hora de exportar

### Se voce criar um campo novo

1. No HTML: `id="meu-campo"`
2. No JS, ao ler: le e valida
3. Ao mostrar: **sempre** `esc()` no `innerHTML`
4. No backup importado: valide o valor em `normalizarProjeto`

### Validacao de dado importado

`normalizarProjeto` (em `js/02-regras.js`) e a barreira: ela garante
que um `.json` adulterado nao injete nada. Ao criar um campo novo,
**inclua-o la**.

---

## O CDN do Tailwind

O CSS usa `cdn.tailwindcss.com`, que gera os estilos em tempo de
execucao.

**Para producao, o recomendado e compilar:**

```bash
npm install -D tailwindcss
npx tailwindcss -i css/entrada.css -o css/PH_custos_compilado.css
```

Depois troque o `<script src="https://cdn.tailwindcss.com">` pelo
`<link rel="stylesheet" href="../css/PH_custos_compilado.css">` em
cada `html/*.html` e no `index.html`.

**Isso nao e obrigatorio.** O CDN funciona. Compilar deixa o sistema
independente de internet e mais rapido.

---

## Se um dia houver backend

Toda a gravacao esta isolada em **uma funcao**:

```
js/06-arquivos.js  ->  gravarNaPasta()
```

Com servidor, troque essa funcao por un `fetch()` POST:

```js
async function gravarNaPasta(tipo, nomeArquivo, dados) {
  await fetch('/api/salvar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: dados
  });
}
```

O resto do sistema (nomes, data, cliente, botao, avisos) continua
igual. Detalhes em `versoes/v24.md`.

---

## Antes de commitar

```bash
node testes/regras.teste.js
```

Se mexer no layout, tambem:
```bash
node testes/paginas.teste.js
```
