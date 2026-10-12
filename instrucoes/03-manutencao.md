# Manutenção e modificação

Este guia indica qual arquivo editar para cada pedido.

Todos os arquivos da aplicação ficam em `public/`. O servidor recebe essa pasta por FTP.

## Mapa de edição

| Pedido | Arquivo |
|---|---|
| Alterar preço ou quantidade padrão dos materiais | `public/data/valores.json` |
| Alterar os técnicos da equipe | `public/data/valores.json` |
| Alterar cores e tema | `public/css/PH_custos.css` |
| Alterar o PDF | `public/css/PH_custos.css` |
| Alterar uma regra de cálculo | `public/js/02-regras.js` |
| Alterar o layout de uma aba | `PH_projetos.html` |
| Alterar os nomes dos arquivos exportados | `public/js/06-arquivos.js` |
| Alterar a planilha Excel | `public/js/05-exportacao.js` |
| Alterar o painel financeiro | `public/js/04-relatorios.js` |

Depois de editar, envie o conteúdo de `public/` ao servidor. Veja [05-servidor.md](05-servidor.md).

## Valores padrão

1. Edite `public/data/valores.json`.
2. Execute `node ferramentas/gerar-config.js`.

O gerador valida os dados antes de escrever. Ele recusa gerar o arquivo nestes casos:

- Um material sem preço.
- Parcelas que não somam 100%.
- Um campo obrigatório ausente.

### Por que o `valores.js` existe

- O navegador bloqueia `fetch()` de arquivos locais.
- O sistema lê o `.js` com a tag `<script>`.
- O `.js` funciona em `file://` e em HTTP.

**Regra:** edite o `.json`. Nunca edite o `.js`.

Envie os dois arquivos ao servidor.

## Layout das abas

O gerador cria os 4 arquivos de `public/html/` a partir de `PH_projetos.html`.

1. Edite `PH_projetos.html`.
2. Execute `node ferramentas/gerar-paginas.js`.

O gerador sobrescreve qualquer edição feita direto em `public/html/*.html`.

## CSS compilado

O CSS da aplicação vem do Tailwind compilado, não do CDN.

1. Execute `npm install` na primeira vez.
2. Execute `npm run css`.

- O comando grava `public/css/PH_custos_compilado.css`.
- O comando `npm run css:watch` regera o arquivo a cada alteração.
- Execute `npm run css` de novo ao adicionar uma classe nova dentro de uma string do JavaScript.
- O arquivo `build/entrada.css` define quais arquivos o Tailwind analisa.
- Envie o arquivo compilado ao servidor. O servidor não gera CSS.

## Regras de cálculo

O arquivo `public/js/02-regras.js` contém as funções puras, sem acesso ao DOM.

| Função | O que faz |
|---|---|
| `parseNum` | Lê `R$ 1.234,56` e `1234.56` |
| `r2` | Arredonda corrigindo erros de ponto flutuante |
| `resumoObra` | Calcula os totais do painel, do modal e do PDF |
| `valoresParcelas` | Divide o total em parcelas; a última absorve os centavos |
| `gerarEtapasPadrao` | Cria as etapas do cronograma |
| `normalizarProjeto` | Valida e migra cada proposta importada |

### Regra de ouro

- O arquivo `testes/regras.teste.js` contém **cópias** das funções.
- Edite o teste junto com a regra.
- Execute `node testes/regras.teste.js` antes de publicar.

## Cores e tema

O arquivo `public/css/PH_custos.css` define as variáveis do tema.

| Variável | Valor | Uso |
|---|---|---|
| `--bg-dark` | `#0f1117` | Fundo da página |
| `--card-bg` | `#181b26` | Fundo dos cartões |
| `--orange-primary` | `#FF7A00` | Cor da marca PH |
| `--orange-hover` | `#e06c00` | Cor de destaque ao passar o mouse |
| `--orange-dark` | `#3a1c00` | Fundo laranja escuro |

## Segurança

### Regra do `esc()`

Passe todo dado do usuário por `esc()` antes de inseri-lo em HTML.

```js
// CERTO
${esc(p.nome)}

// ERRADO: abre brecha de XSS
${p.nome}
```

### Arquivos que montam HTML por string

- `public/js/04-relatorios.js`: lista de propostas do painel.
- `public/js/03-telas.js`: modais, tabelas de materiais e equipe.
- `public/js/06-arquivos.js`: nome do arquivo exportado.

### Criar um campo novo

1. Crie o campo no HTML com um `id`.
2. Leia e valide o valor no JavaScript.
3. Use `esc()` ao exibir o valor com `innerHTML`.
4. Valide o campo em `normalizarProjeto`.

A função `normalizarProjeto` em `public/js/02-regras.js` impede que um `.json` adulterado injete conteúdo.

## Migrações de backup

- A função `normalizarProjeto` migra backups das versões 15 a 21.
- Não apague essas migrações.
- Backups antigos precisam continuar abrindo.

## Testes

| Comando | O que verifica |
|---|---|
| `node testes/regras.teste.js` | Regras de cálculo |
| `node testes/paginas.teste.js` | Abertura das 4 abas no Chrome |
| `node testes/rascunho.teste.js` | Rascunho entre abas |

- Os testes de página exigem o Chrome em `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- Os testes de página abrem os arquivos de `public/html/`.

## Se houver um backend

A versão 27 removeu a gravação em pastas. O sistema só baixa arquivos.

Para gravar no servidor:

1. Crie uma função que envia o arquivo por `fetch()` com `POST`.
2. Chame essa função em `baixarArquivo()`, em `public/js/06-arquivos.js`.

Essa mudança exige um servidor que execute código. O servidor atual não executa.
