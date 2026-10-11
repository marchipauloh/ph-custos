# PH Custos - Versão 28

Gestor de obras e custos da PH Lighting. Abre direto no navegador, sem
servidor e sem instalar nada.

**Para usar:** dê dois cliques em `html\orcamento.html`.

---

## O que mudou nesta versão

Até a V20 tudo ficava num arquivo só: `PH_projetos.html`, com 2.600 linhas
de HTML, CSS e JavaScript misturados. A V21 separa tudo em pastas e quebra
as 4 abas em 4 páginas.

**Nenhuma fórmula mudou.** As contas, os valores, o PDF, o Excel e o backup
são exatamente os mesmos. A mudança é de organização.

### Bugs corrigidos (a V20 tinha)

| Correção | O que acontecia |
|---|---|
| Hotel | O campo "Pessoas" nunca zerava o hotel — a conta se cancelava sozinha. Agora 0 = sem hospedagem |
| Etapa "concluída" | A marcação era salva pela **posição** da lista. Reordenar ou apagar uma etapa fazia o "concluído" grudar na etapa errada. Agora cada etapa tem id próprio |
| Carro | O rótulo dizia "Km x2" mas o cálculo era `x1`. Agora o campo é o total do trajeto |
| Duplo clique | Clicar duas vezes em "Salvar" criava duas propostas iguais. Agora trava |
| localStorage | Se a cota do navegador estourasse, o erro sumia e a gravação se perdia. Agora avisa |
| Backup adulterado | Um `.json` alterado à mão podia trazer `id` quebrado, que virava argumento de função. Agora `id` e `status` são validados |
| Digitar não trava | `calcular()` rodava a cada tecla em 20 campos. Agora tem 150 ms de espera |
| Acessibilidade | `Esc` fecha os modais, foco visível no teclado, `role="dialog"` nos dois modais |

### O que mudou de estrutura

- **4 abas → 4 páginas** em `html/`. Navegar entre elas é trocar de arquivo.
- **JS em 7 arquivos** em `js/`, separados por assunto.
- **CSS em um arquivo** em `css/PH_custos.css`.
- **Valores em JSON** em `data/valores.json` — é o arquivo que você edita.
- **Rascunho salvo**: materiais, equipe, cronograma, parcelas e os campos da
  Aba 1 viajam entre as páginas (veja abaixo).

---

## O problema do rascunho (e como foi resolvido)

Hoje as 4 abas dividem o mesmo rascunho na memória do JavaScript. Se cada
aba virasse uma página, clicar em "Equipe" **apagaria da tela** os 19
materiais que você preencheu.

A solução: um rascunho no `localStorage`, atualizado a cada mudança, lido no
início de cada página. Assim a Aba 2 → Aba 3 continua enxergando tudo.

**O rascunho não é o seu trabalho.** Ele só existe para o texto não se
perder enquanto você navega. O que está gravado de verdade (que vai para o
Financeiro, o PDF e o Excel) só existe depois de clicar em **Salvar**.

**Duas ressalvas honestas:** o rascunho também é zerado se você limpar os
dados do site no navegador; e ele tem prioridade sobre o `data/valores.json`,
então trocar os valores padrão só aparece em proposta nova.
---

## Estrutura

```
ph-custos\
├── html\
│   ├── orcamento.html     1. Proposta & Status
│   ├── materiais.html     2. Lista Materiais
│   ├── equipe.html        3. Equipe de Campo
│   └── financeiro.html    4. Painel Financeiro
│
├── css\
│   └── PH_custos.css      tema escuro, campos, impressão do PDF
│
├── js\
│   ├── 00-valores.js      lê o config e cuida do rascunho
│   ├── 01-core.js         variáveis de estado
│   ├── 02-regras.js       números, datas, cronograma, parcelas (funções puras)
│   ├── 03-telas.js        as abas e os dois modais
│   ├── 04-relatorios.js   proposta em PDF e painel financeiro
│   ├── 05-exportacao.js   backup .json, Excel .xlsx, WhatsApp
│   └── 06-boot.js         o que cada página monta ao abrir
│
├── data\
│   ├── valores.json       >>> EDITE AQUI os valores <<<
│   └── valores.js         gerado a partir do .json (não edite)
│
├── ferramentas\
│   ├── gerar-config.js    converte o .json em .js
│   └── gerar-paginas.js   monta os 4 HTMLs
│
├── testes\
│   ├── regras.teste.js        26 testes das regras de negócio
│   ├── paginas.teste.js       as 4 páginas carregam e calculam
│   ├── rascunho.teste.js      o rascunho sobrevive à troca de página
│   └── teste_planilha.xlsx    planilha real gerada pelo sistema
│
└── PH_projetos.html      >>> O ORIGINAL DE REFERÊNCIA >>>
```

### Por que existe o `PH_projetos.html`

É o arquivo de onde saem as 4 páginas. As ferramentas leem ele e recortam
cada aba. Se você editar direto `html\orcamento.html`, o próximo
`gerar-paginas.js` sobrescreve sua alteração.

**Para mudar o visual de uma página:** edite `PH_projetos.html` e rode
`node ferramentas\gerar-paginas.js`.

---

## Mudar os valores (materiais, equipe, parcelas)

1. Edite `data\valores.json`
2. Rode `node ferramentas\gerar-config.js`
3. Recarregue o navegador

O `.json` é o arquivo que você edita porque é formatado e familiar. O `.js`
existe porque **o navegador bloqueia `fetch()` de arquivo local** — se
carregássemos o `.json` direto, o sistema só funcionaria por cima de um
servidor, e o "abre com dois cliques" morreria.

O gerador valida antes de escrever: se um material estiver sem preço, ou as
parcelas não somarem 100%, ele avisa e **não gera nada** — assim o erro
aparece no terminal em vez de virar lista vazia na tela.

---

## Testes

Rode com Node.js instalado (só para testar; para usar o sistema, não precisa):

```bash
node testes\regras.teste.js       # 26 testes das regras de negócio
node ferramentas\gerar-paginas.js # gera e confere as 4 páginas
node testes\paginas.teste.js      # abre as 4 páginas no Chrome
node testes\rascunho.teste.js     # navega entre as páginas de verdade
```

Os dois últimos precisam do Google Chrome instalado.

---

## Limitações que vale você saber

- **Os dados ficam neste navegador e neste computador.** Não há servidor nem
  nuvem. Limpar os dados do site apaga tudo. Por isso existe o botão de
  backup `.json` — **exporte de tempos em tempos**.
- **O Tailwind vem por CDN.** Se ficar sem internet, o sistema abre sem o
  layout (os números e as contas continuam funcionando).
- **Os 4 HTMLs são gerados.** Editar direto neles não dá certo.

## V21: as duas pastas oficiais + baixar no PC

Abra o sistema pelo **`index.html`** (na raiz da pasta `ph-custos`). Ele te leva
para a Aba 1, que é por onde o trabalho sempre começa.

Na **Aba 4 (Painel Financeiro)** existem dois botões de pasta:

| Botão | Para que serve |
|---|---|
| **Pasta de backups** | Define onde ficam os arquivos `.json`. Uma vez por navegador aberto. |
| **Pasta de planilhas** | Define onde ficam os arquivos `.xlsx`. Idem, separada da de backups. |

E os botões de exportação vieram em par:

| Botão | O que faz |
|---|---|
| **Backup** | Grava só na pasta oficial de .json. Silencioso. |
| **Salvar no PC** | Grava na pasta oficial **e** abre o "Salvar como" do Windows, para você escolher onde deixar a sua cópia. |
| **Excel** | Grava só na pasta oficial de .xlsx. |
| **Salvar no PC** | Idem para a planilha. |

Além disso, **cada vez que você salva uma proposta** o sistema grava um
backup .json na pasta oficial, sozinho, sem perguntar nada. Se a pasta .json
não estiver configurada, essa gravação automática é pulada (para não
baixar arquivo do nada).

Os nomes sao sempre com data, hora, minuto e o cliente/projeto:

```
ph_custos_backup_Studio-Fronteira-Cia_2026-10-10_22h41.json
ph_custos_planilha_Studio-Fronteira-Cia_2026-10-10_22h41.xlsx
```

### Limites honestos (leia antes de esperar outra coisa)

- **Não existe "pasta do servidor".** O navegador roda na sua máquina; a
  pasta oficial é uma pasta real do seu PC, apontada uma vez. Para virar
  servidor de verdade seria preciso um programa rodando em algum lugar —
  ver "Se um dia quiser um servidor" abaixo.
- **A pasta vale só com o navegador aberto.** Ao fechar e abrir de novo,
  clique em "Pasta .json" / "Pasta .xlsx" de novo. O Windows não devolve a
  permissão de forma confiável.
- **Só Chrome e Edge** permitem escolher pasta. Firefox e Safari não. Lá
  nesse caso tudo vai para a pasta **Downloads**, e o sistema avisa.
- **A janela tem que estar em destaque** na hora de clicar em "Pasta", porque o
  Windows abre uma caixa de diálogo do sistema. Se não estiver, ele avisa
  para você clicar de novo.
- Arquivo que **entra** (Importar backup) nunca é gravado nas pastas oficiais:
  um arquivo adulterado entre os seus backups reais seria pior do que não ter
  backup.

### Se um dia quiser um servidor de verdade

Toda a parte de gravar arquivo está isolada em **js/06-arquivos.js**, e
isso é proposital: a função `gravarNaPasta()` é o único ponto que
toca o disco. Com um servidor, basta trocar essa função por um `fetch()`
POST para uma rota tipo `/api/backup` e `/api/planilha` — o resto do sistema
(nomes, carimbo de data, cliente, botões, avisos) continua igual. A
permissão de pasta, que é o ponto fraco do navegador hoje, viraria permissão
de servidor, que é bem mais simples de resolver.
