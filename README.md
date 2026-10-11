# PH Custos Projetos

Sistema de orçamento, cronograma e controle financeiro para a
**PH Lighting System**. HTML, CSS e JavaScript — sem servidor de
aplicação, без banco de dados, sem build, sem dependências.

Funciona abrindo `index.html` com dois cliques, ou publicado em
servidor estático (Apache, Nginx, GitHub Pages, Hostinger, Locaweb).

---

## Índice

- [Como usar](#como-usar)
- [Instalação no servidor](#instalação-no-servidor)
- [Organização das pastas](#organização-das-pastas)
- [Riscos e limitações](#riscos-e-limitações)
- [O que modificar](#o-que-modificar)
- [Testes](#testes)
- [Histórico de versões](versoes/HISTORICO.md)

**Guias separados:**

| Pasta | Para quê |
|---|---|
| [`instrucoes/`](instrucoes/) | Uso do dia a dia, configuração das pastas, problemas |
| [`versoes/`](versoes/HISTORICO.md) | O que mudou em cada versão |

---

## Como usar

**Dois cliques em `index.html`.** Ele te leva para a Aba 1.

```
index.html ──3s──▶ html/orcamento.html
```

| Aba | O que faz |
|---|---|
| **1. Proposta & Status** | Orçamento, cronograma, parcelas, PDF, salvar |
| **2. Lista Materiais** | Tabela de insumos da obra |
| **3. Equipe de Campo** | Técnicos e diárias |
| **4. Painel Financeiro** | Histórico, gastos, backup, Excel |

**Navegador:** Chrome ou Edge. No Firefox e Safari a escolha de pasta
não existe (limitação do navegador, não do sistema), e o sistema avisa.

---

## Instalação no servidor

Não há build. **Copie a pasta inteira** para o servidor.

```bash
git clone https://github.com/SEU-USUARIO/ph-custos.git
cd ph-custos
```

Aponte o document root para a pasta do projeto.

Com Nginx:

```nginx
server {
    server_name custos.sualoja.com.br;
    root /var/www/ph-custos;
    index index.html;

    # O sistema é estático: não precisa de PHP
    location ~ \.php$ { return 404; }
    location ~ /\.      { deny all; }
}
```

Com Apache, um `.htaccess`:

```apache
DirectoryIndex index.html
<FilesMatch "\.php$">
    Require all denied
</FilesMatch>
```

**Apague `ferramentas/` e `testes/` do servidor.** São só para
desenvolvimento e não devem ficar expostos.

### HTTPS é recomendado (não obrigatório)

O sistema funciona em HTTP. Mas **a escolha de pasta do navegador só
existe em endereços seguros**:

| Onde | Escolher pasta funciona? |
|---|---|
| `file://` (dois cliques) | sim |
| `http://localhost` | sim |
| `https://seusite.com` | sim |
| `http://seusite.com` | **não** |

Sem HTTPS, os arquivos vão para a pasta Downloads do navegador, com o
nome já formatado (data, hora, cliente). Nada quebra — só não grava
direto na pasta do servidor.

Para HTTPS gratuito, [Caddy](https://caddyserver.com) resolve em três
linhas de configuração. Se não quiser, use o botão "Salvar no PC".

---

## Organizacao das pastas

```
ph-custos/
|-- index.html              <- ABRA POR AQUI
|
|-- html/                   4 paginas, uma por aba
|   |-- orcamento.html        Aba 1
|   |-- materiais.html        Aba 2
|   |-- equipe.html           Aba 3
|   `-- financeiro.html       Aba 4
|
|-- css/
|   `-- PH_custos.css      tema + impressao A4
|
|-- js/                    carregados em ordem
|   |-- 00-valores.js        defaults editaveis
|   |-- 01-core.js           estado global
|   |-- 02-regras.js         numeros, datas, parcelas  <- testavel
|   |-- 03-telas.js          abas 1/2/3 e modais
|   |-- 04-relatorios.js     PDF e painel financeiro
|   |-- 05-exportacao.js     backup .json e Excel .xlsx
|   |-- 06-arquivos.js       pastas de backup e nomes
|   `-- 07-boot.js           iniciacao
|
|-- data/
|   |-- valores.json      <- EDITE AQUI
|   `-- valores.js        (gerado - e o que o sistema le)
|
|-- ferramentas/           SO para desenvolvimento
|-- testes/                SO para desenvolvimento
|-- instrucoes/            guias de uso
|-- versoes/               historico versionado
|
|-- PH_projetos.html       <- arquivo original (referencia)
|-- LEIA-ME.md
|-- README.md
`-- .gitignore
```

### Por que HTML, CSS e JS em pastas separadas

O arquivo original tinha 2.600 linhas. Separado, cada parte cabe num
arquivo que voce le inteiro. A divisao segue os separadores de secao
que **ja existiam no codigo** - nao inventei divisao nova.

### Ordem dos scripts importa

Carregados com `<script src>` classico, em ordem. O `03-telas.js` usa
`parseNum`, que vem do `02-regras.js`. **Se trocar a ordem, quebra.**

Nao use `type="module"`: modulos ES nao carregam por `file://` (CORS),
e o "abre com dois cliques" morreria.

### Por que JSON e nao YAML

`JSON.parse` e nativo do navegador - sem biblioteca. YAML exigiria uma
lib para ler no cliente.

O `.json` e editado a mao; o `valores.js` e o gerado. **Motivo do `.js`
gerado:** o navegador bloqueia `fetch()` de arquivo local (CORS). Com o
`.js`, funciona em `file://` **e** em servidor.

---

## Riscos e limitacoes

### 🔴 Os dados vivem no navegador

Propostas, materiais, gastos - tudo fica no `localStorage` do
navegador de **cada usuario**, no **computador dele**.

**Consequencias:**
- **Nao e compartilhado.** Duas maquinas nao veem as mesmas propostas.
- **Se alguem limpar o historico/cache do Chrome, perde tudo.**
- Nao ha autenticacao: quem abrir o endereco, acessa.
- **No servidor, os dados NAO ficam no servidor.** Um .json de proposta
  vive no navegador de quem salvou. Publicar no GitHub nao muda isso.

**Mitigacoes ja prontas:**
- Backup automatico: cada "Salvar proposta" grava o `.json` na pasta
  configurada
- Botao "Backup (.json)" a qualquer momento
- O `.xlsx` e um segundo formato, util para arquivar

**Para uso em equipe com dados compartilhados, sera preciso um
backend.** Toda a gravacao esta isolada numa funcao so
(`gravarNaPasta()` em `js/06-arquivos.js`): troque essa funcao por um
`fetch()` POST e o resto continua igual.

### 🟡 A pasta de backup vale so com o navegador aberto

O Windows nao guarda essa permissao de forma confiavel. Ao fechar e
reabrir o Chrome, clique em "Pasta" de novo.

### 🟡 Dependencia do CDN do Tailwind

O CSS usa `cdn.tailwindcss.com`, que gera os estilos em tempo de
execucao. Se o CDN cair, o layout quebra (o sistema continua funcionando).

### 🟡 Dados no localStorage em texto claro

Qualquer extensao com acesso ao storage ve os valores. Aceitavel para
uso local, mas vale saber.

### 🟡 Sem validacao de faixa nos valores

Se um material ta com preco errado, o total fica errado. Nao ha
bloqueio de entradas impossiveis - foi decisao, nao esquecimento.

### 🟢 XSS

Nao ha XSS exploravel. A defense e `esc()` (HTML-escaping) aplicada
na maioria dos pontos. **A protecao depende de todo novo codigo
lembrar de escapar** - ver `instrucoes/03-manutencao.md`.

### 🟢 Cota do localStorage

~5 MB por origem. O sistema avisa se a gravacao falhar, em vez de
perder os dados em silencio.

---

## O que modificar

### Valores padrao (materiais, equipe)

```
data/valores.json                          <- edite
node ferramentas/gerar-config.js           <- regere
```

O gerador **valida antes de escrever** (material sem preco, parcelas
que nao somam 100% -> avisa e nao gera).

### Cores e tema

```
css/PH_custos.css
```

### Layout das telas

```
html/*.html
```

⚠️ **Os 4 HTMLs sao gerados.** Para mudar de verdade, edite
`PH_projetos.html` e rode `node ferramentas/gerar-paginas.js`. Editar
os HTMLs direto funciona, mas o gerador sobrescreve na proxima vez.

### Regras de calculo

```
js/02-regras.js
```

E o arquivo com as funcoes puras (sem DOM). E o que os testes cobrem.

---

## Testes

Os testes usam Node, mas **so para desenvolvimento**. O sistema em si
nao precisa de Node.

```bash
cd testes
node regras.teste.js      # 26 testes das regras de negocio
node paginas.teste.js     # 4 paginas no Chrome headless
node rascunho.teste.js    # rascunho entre paginas
```

---

## Licenca

Codigo interno da PH Lighting System.
