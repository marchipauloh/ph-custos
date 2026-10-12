# PH Custos

Aplicação web estática para gerenciar custos e propostas de iluminação cênica da **PH Lighting System**.

- Funciona sem servidor de aplicação.
- Funciona sem banco de dados.
- Guarda os dados no navegador de cada usuário.

## Início rápido

1. Abra `public/index.html` no Chrome ou no Edge.
2. Preencha a proposta na **Aba 1**.
3. Clique em **Salvar**.
4. Exporte um backup na **Aba 4** com **Backup (.json)**.

## Estrutura

| Pasta ou arquivo | Conteúdo | Vai ao servidor |
|---|---|---|
| `public/` | A aplicação inteira: HTML, CSS, JavaScript e dados | **Sim** |
| `PH_projetos.html` | Arquivo único que origina as 4 páginas | Não |
| `build/entrada.css` | Entrada do Tailwind | Não |
| `ferramentas/` | Scripts Node que geram arquivos | Não |
| `testes/` | Testes das regras e das páginas | Não |
| `instrucoes/` | Guias de uso, manutenção e servidor | Não |
| `versoes/HISTORICO.md` | Histórico de mudanças | Não |

## Comandos

Execute os comandos no seu computador, na pasta do projeto. O servidor não executa comandos.

| Comando | O que faz |
|---|---|
| `npm install` | Instala o Tailwind |
| `npm run css` | Gera `public/css/PH_custos_compilado.css` |
| `node ferramentas/gerar-config.js` | Converte `public/data/valores.json` em `public/data/valores.js` |
| `node ferramentas/gerar-paginas.js` | Gera `public/html/*.html` a partir de `PH_projetos.html` |
| `node testes/regras.teste.js` | Executa os testes das regras de cálculo |

## Publicar

1. Gere os arquivos necessários com os comandos acima.
2. Envie o conteúdo de `public/` ao servidor por FTP.

Veja [05-servidor.md](instrucoes/05-servidor.md).

## Guias

| Guia | Quando ler |
|---|---|
| [00-glossario.md](instrucoes/00-glossario.md) | Para conhecer os termos oficiais |
| [01-usar.md](instrucoes/01-usar.md) | Na primeira vez que usar o sistema |
| [02-backups.md](instrucoes/02-backups.md) | Para exportar e restaurar dados |
| [03-manutencao.md](instrucoes/03-manutencao.md) | Para editar valores, regras ou layout |
| [04-problemas.md](instrucoes/04-problemas.md) | Quando algo falhar |
| [05-servidor.md](instrucoes/05-servidor.md) | Para publicar em um servidor |
| [HISTORICO.md](versoes/HISTORICO.md) | Para consultar versões anteriores |

## Fluxo de trabalho

Toda mudança entra pelo GitHub por **Pull Request**. A regra é obrigatória.

1. Crie uma branch a partir da `main`.
2. Faça commits pequenos e agrupados por assunto.
3. Execute `node testes/regras.teste.js` antes de enviar.
4. Envie a branch ao GitHub.
5. Abra um Pull Request para a `main`.
6. Aguarde a revisão e faça o merge pelo GitHub.

- Não faça commit direto na `main`.
- Escreva o título do PR em inglês, no formato `tipo(escopo): descrição`.
- Escreva o corpo do PR em português, com as 5 seções do modelo.

## Autoria

| Papel | Pessoa | Contato |
|---|---|---|
| Criador do sistema | Joey Van Aken | joeyva96@gmail.com |
| Publicação | Paulo Marchi | marchipauloh@gmail.com |

---

Projeto interno da PH Lighting System.
