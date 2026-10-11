# Instalacao no servidor

O sistema e **estatico**: HTML, CSS e JavaScript. Sem Node, sem PHP, sem
banco de dados no servidor. Qualquer servidor de arquivos serve.

---

## O que subir

**Da pasta `public/`:**

```
index.html
html/     (4 arquivos)
css/      (1 arquivo)
js/       (8 arquivos)
data/     (2 arquivos)
```

**Nao suba** `ferramentas/` nem `testes/` — usam Node, e o servidor nao
tem. Nao prejudice: sao so para desenvolvimento.

---

## Metodo 1: Git no servidor (recomendado)

```bash
cd /var/www
git clone https://github.com/SEU-USUARIO/ph-custos.git
cd ph-custos
# se quiser enxugar:
rm -rf ferramentas testes
```

Se o `public/` estiver no repo, o document root aponta para
`/var/www/ph-custos/public`.

---

## Metodo 2: Copiar por FTP/SFTP

Envie a pasta `public/` inteira. Use o FileZilla ou o gerenciador de
arquivos do seu hosting.

**Cuidado:** envie a pasta `public/` com este nome, ou configure o
document root para ela.

---

## Configurar o servidor

### Nginx

```nginx
server {
    listen 80;
    server_name custos.sualoja.com.br;
    root /var/www/ph-custos/public;
    index index.html;

    # sistema estatico: nao precisa de PHP
    location ~ \.php$ { return 404; }

    # nao expor arquivos ocultos (.git, .env...)
    location ~ /\. { deny all; }

    # cache: css/js podem ser cacheados, html nao
    location ~* \.(css|js)$ { expires 7d; }
    location ~* \.html$    { expires -1; }
}
```

### Apache

Crie `.htaccess` dentro de `public/`:

```apache
DirectoryIndex index.html
Options -Indexes

<FilesMatch "\.(json|js|css)$">
    Require all granted
</FilesMatch>

<FilesMatch "\.php$">
    Require all denied
</FilesMatch>

<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set Referrer-Policy "same-origin"
</IfModule>
```

### GitHub Pages / Hostinger / Locaweb

Todos sao servidor estatico. Aponte para `public/`. Se a plataforma
exigir um branch, use `main` e a raiz do repo (ou `public/`).

---

## HTTPS

**O sistema funciona em HTTP, mas recomendo HTTPS.** Motivo: a escolha
de pasta do navegador (`showDirectoryPicker`) so existe em endereco
seguro.

| Onde | Escolher pasta funciona? |
|---|---|
| `https://custos.sualoja.com.br` | sim |
| `http://custos.sualoja.com.br` | **nao** |
| `http://localhost` | sim |

### Caddy (HTTPS automatico, 3 linhas)

```bash
# instala: https://caddyserver.com
```

```
custos.sualoja.com.br {
    root * /var/www/ph-custos/public
    file_server
}
```

O Caddy pega certificado HTTPS sozinho. Se usar isso, o aviso de
"endereco nao seguro" nunca aparece.

### Sem HTTPS?

Os arquivos vao para a pasta **Downloads** do navegador, com o nome
ja formatado (data, hora, cliente). Nada quebra. Use o botao
**Salvar no PC** e escolha a pasta na hora.

---

## Checklist de publicacao

```
[ ] index.html abre e manda pra Aba 1
[ ] as 4 abas abrem sem erro
[ ] Aba 2 mostra os materiais padrao
[ ] Aba 3 mostra a equipe padrao
[ ] Aba 4 mostra o painel (vazio, se nunca salvou)
[ ] "Salvar proposta" grava e o cartao aparece no painel
[ ] "Pasta de backups" abre a janela (so em HTTPS)
[ ] "Backup (.json)" grava na pasta, com nome + data
[ ] "Excel (.xlsx)" grava na pasta, com nome + data
[ ] F12 > Console sem erro vermelho
```

Rode esse checklist antes de mandar o link para o time.

---

## O que NAO vai para o servidor

| Item | Onde fica |
|---|---|
| Dados das propostas | no navegador de cada usuario |
| Ferramentas de geracao | so na sua maquina |
| Testes | so na sua maquina |
| Documentacao | opcional, mas inofensiva |

**Importante:** publicar no GitHub **nao** coloca os dados das
propostas no servidor. Cada usuario tem os dele, no navegador dele.
