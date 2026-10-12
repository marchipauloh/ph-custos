# Problemas e soluções

Este guia lista falhas comuns e a correção de cada uma.

## A página abre em branco

**Causa:** o arquivo HTML está separado das pastas `css/`, `js/` e `data/`.

**Solução:**

1. Copie a pasta `public/` inteira, ou envie-a inteira ao servidor.
2. Abra `index.html` na nova localização.

## Uma aba abre sem tabela

**Causa:** o navegador não carregou `data/valores.js`.

**Solução:**

1. Confirme que `public/data/valores.js` existe.
2. Execute `node ferramentas/gerar-config.js`.
3. Envie `public/data/valores.js` ao servidor.

## A proposta não aparece depois de Salvar

**Causa:** os dados vêm de uma versão anterior à v21.

**Solução:**

1. Exporte um backup `.json` antigo.
2. Clique em **Importar** na **Aba 4**.
3. Escolha o arquivo `.json`.

A importação migra os dados sozinha.

## O hotel não zera com 0 pessoas

**Causa:** o sistema está em uma versão até a v20.

**Solução:** use a v21 ou posterior. Veja [HISTORICO.md](../versoes/HISTORICO.md).

## A etapa concluída muda de lugar ao reordenar

**Causa:** o sistema está em uma versão anterior à v21.

**Solução:** use a v21 ou posterior.

## As propostas sumiram

**Causa:** o navegador apagou os dados ao limpar o cache.

**Com backup:**

1. Abra a **Aba 4**.
2. Clique em **Importar**.
3. Escolha o `.json`.

**Sem backup:** os dados não têm recuperação. Exporte backups com frequência.

## O layout aparece sem cores

**Causa:** o arquivo `PH_custos_compilado.css` não existe ou não carregou.

**Solução:**

1. Execute `npm install`.
2. Execute `npm run css`.
3. Confirme que `public/css/PH_custos_compilado.css` existe.
4. Envie o arquivo ao servidor.

O sistema continua funcional. Só o visual falha.

## Os ícones não aparecem

**Causa:** o navegador não alcançou o CDN do Font Awesome.

**Solução:** conecte o computador à internet.

## O Chrome exibe uma barra amarela ao abrir

**Causa:** o Chrome avisa que o arquivo vem do computador local.

**Solução:** clique em **Avançado** e continue. O aviso não indica erro nem vírus.

## Erro ao executar `npm run css`

**Mensagem:** `SyntaxError: Unexpected token '﻿'`

**Causa:** o editor salvou `package.json` com BOM.

**Solução:** salve o arquivo como UTF-8 sem BOM.

## Erro no console

1. Pressione **F12**.
2. Abra a guia **Console**.
3. Leia o nome da função e a linha do erro.
