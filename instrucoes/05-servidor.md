# Publicação no servidor

O servidor recebe os arquivos por FTP e não executa nenhum programa. Por isso o sistema usa só HTML, CSS e JavaScript.

- Publique somente a pasta `public/`.
- Gere os arquivos no seu computador, antes de enviar.
- Não instale Node, PHP ou banco de dados no servidor.

## O que enviar

Envie o **conteúdo** da pasta `public/` para a pasta do site no servidor:

```
index.html
html/    (4 arquivos)
css/     (2 arquivos)
js/      (8 arquivos)
data/    (2 arquivos)
```

Não envie estas pastas, que servem só ao desenvolvimento:

- `ferramentas/`
- `testes/`
- `build/`
- `instrucoes/`
- `versoes/`
- `node_modules/`

## Publicar uma versão nova

1. Gere o CSS, se você adicionou uma classe nova: `npm run css`.
2. Gere os valores, se editou `public/data/valores.json`: `node ferramentas/gerar-config.js`.
3. Gere as páginas, se editou `PH_projetos.html`: `node ferramentas/gerar-paginas.js`.
4. Execute os testes: `node testes/regras.teste.js`.
5. Abra `public/index.html` e confira as 4 abas.
6. Conecte ao servidor por FTP.
7. Envie o conteúdo de `public/`, sobrescrevendo os arquivos existentes.
8. Abra o endereço do site e atualize com **Ctrl+F5**.

## Primeira publicação

1. Abra o FileZilla ou o gerenciador de arquivos da hospedagem.
2. Entre na pasta pública do site, geralmente `public_html` ou `www`.
3. Envie o conteúdo de `public/` mantendo a estrutura de pastas.
4. Abra `https://seu-site/index.html`.

- O arquivo `index.html` precisa ficar na raiz da pasta pública.
- As pastas `html/`, `css/`, `js/` e `data/` ficam ao lado do `index.html`.

## Dependência externa

O sistema carrega os ícones do Font Awesome pelo CDN `cdnjs.cloudflare.com`.

- O usuário precisa de internet para ver os ícones.
- Sem internet, o sistema continua funcional.

## HTTPS

- O sistema funciona em HTTP e em HTTPS.
- Use HTTPS quando a hospedagem oferecer.

## Apache (opcional)

Se a hospedagem usa Apache, crie `.htaccess` na pasta pública:

```apache
DirectoryIndex index.html
Options -Indexes

<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set Referrer-Policy "same-origin"
</IfModule>
```

## Checklist de publicação

Execute esta lista antes de enviar o link ao time:

- [ ] `index.html` abre e leva à **Aba 1**.
- [ ] As 4 abas abrem sem erro.
- [ ] A **Aba 2** mostra os materiais padrão.
- [ ] A **Aba 3** mostra a equipe padrão.
- [ ] A **Aba 4** mostra o painel, vazio se nada foi salvo.
- [ ] **Salvar** grava a proposta e o cartão aparece no painel.
- [ ] **Backup (.json)** baixa um arquivo com nome e data.
- [ ] **Excel** baixa um arquivo com nome e data.
- [ ] O **Console** (F12) não exibe erro vermelho.

## O que o servidor não guarda

| Item | Onde fica |
|---|---|
| Propostas | No navegador de cada usuário |
| Backups | Na pasta **Downloads** de cada usuário |
| Ferramentas e testes | No computador de desenvolvimento |

O envio por FTP não transfere as propostas.
