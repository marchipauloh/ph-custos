# Histórico de versões

Este arquivo resume cada versão. Cada linha descreve o que a versão mudou.

## Autoria

- **v1 a v20:** autor original.
- **v21 em diante:** correções e reorganização.

## Versões

| Versão | Mudança |
|---|---|
| v1 a v16 | Arquivo HTML único. Formulário, materiais, equipe, cronograma, parcelas e painel. Sem registro detalhado. |
| v17 | Reserva ganha campo próprio. Nota Fiscal vira escolha explícita. Migração `versao: 17`. |
| v18 | Proposta ganha status: A Confirmar, Agendado, Recebido, Rejeitado. Painel filtra por status. |
| v19 | Diárias entram no custo. Cronograma com etapas. Parcelas com entrada. PDF em A4. |
| v20 | Exportação Excel `.xlsx` com 7 abas e fórmulas vivas, sem biblioteca externa. |
| v21 | Corrige hotel, etapa concluída, validação de backup, `localStorage` e acessibilidade. |
| v22 | Separa o arquivo único em `html/`, `css/`, `js/` e `data/`. Cria rascunho entre abas. |
| v23 | Cria `index.html`, pastas de backup, backup automático e nomes com data. |
| v24 | Prepara a publicação em servidor. Remove dependências de ambiente. |
| v25 | Substitui o CDN do Tailwind pelo CSS compilado. |
| v26 | Corrige as abas 2, 3 e 4 que abriam em branco. |
| v27 | Remove pastas oficiais e backup automático. Arquivos vão para **Downloads**. |
| v28 | Unifica a aplicação em `public/`. Remove as cópias da raiz. Ajusta ferramentas e testes. |

## Detalhes

### v15 e v16: migrações

- A função `normalizarProjeto` migra backups das versões 15 e 16.
- Não apague essas migrações.

### v19 e v21: erros de precificação

| Erro | Correção na v21 |
|---|---|
| O hotel ignorava o campo **Pessoas** | `hotelPess > 0 ? hotelDias * hotelV : 0` |
| O carro exibia "Km x2" e calculava `* 1` | O rótulo passou a dizer **Km total** |

Para dobrar a distância, troque `carroKm * 1` por `carroKm * 2` em `calcular()`.

### v21: segurança e robustez

- `normalizarProjeto` valida `status` e `id` do `.json` importado.
- `textContent` substitui `innerText` onde entra dado do usuário.
- `localStorage` usa `try/catch` e avisa quando a cota estoura.
- O botão **Salvar** bloqueia o clique duplo.
- `calcular()` usa debounce de 150 ms.
- **Esc** fecha os modais.

### v22: efeitos da separação em páginas

- Cada aba virou um arquivo HTML.
- O rascunho no `localStorage` preserva o texto ao trocar de aba.
- O gerador de páginas encontra cada seção por marcador, não por número de linha.
- O gerador falha com aviso quando detecta um `<script>` dentro de comentário.

### v23 a v27: arquivos exportados

- A v23 criou duas pastas oficiais e o backup automático.
- A v24 documentou que `showDirectoryPicker()` exige contexto seguro.
- A v27 removeu as pastas oficiais e o backup automático.
- Hoje o sistema oferece **Backup (.json)**, **Excel** e **Importar**.

### v25: CSS compilado

| Antes | Depois |
|---|---|
| ~110 KB de CSS gerado no navegador | 28,9 KB de CSS estático |
| Depende do Tailwind CDN e do Font Awesome | Depende só do Font Awesome |

- O comando `npm run css` gera `public/css/PH_custos_compilado.css`.
- O arquivo `build/entrada.css` analisa `public/js/*.js` para encontrar classes dentro de strings.

### v26: abas em branco

- **Causa:** cada `<section>` nascia com `class="hidden"` e nada removia a classe.
- **Correção:** o script do rodapé remove `hidden` da seção da aba ativa.
- **Lição:** o teste precisa verificar o que o usuário vê, não só o DOM.

### v27: consequência

- O sistema não gera backup automático.
- Limpar o cache do Chrome apaga todos os dados.
- O usuário precisa clicar em **Backup (.json)**.

## Arquivo de referência

O arquivo `testes/PH_projetos.V20-original.html` guarda a v20 original, sem alteração.
