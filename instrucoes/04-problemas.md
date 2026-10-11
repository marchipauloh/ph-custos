# Problemas e solucoes

O que fazer quando algo nao funciona.

---

## A pagina abre em branco

**Causa mais comum: pasta faltando.**

O sistema depende de `css/`, `js/` e `data/` andarem junto com o HTML.
Se voce moveu so o `.html` para outro lugar, a pagina abre sem estilo
e sem nenhuma aba funcionando.

**Solucao:** copie a pasta `ph-custos` inteira, nao so o arquivo.

---

## Uma aba abre vazia, sem tabela

**Causa:** `data/valores.js` nao foi carregado.

Confirme que o arquivo existe. Se estiver vazio ou faltando, regere:

```
node ferramentas/gerar-config.js
```

---







## Cliquei em "Salvar" e a proposta nao apareceu

**Causa:** dados muito antigos, salvos antes de uma das correcoes.

**Solucao:** exporte um backup `.json` antigo e importe pela Aba 4. A
migracao roda sozinha na importacao.

---

## O valor do hotel nao zera quando coloco 0 pessoas

**Isso ja foi corrigido.** Na versao antiga (ate a v20) o campo
"Pessoas" nao zerava o hotel, apesar do rotulo dizer que zerava.

Se ainda acontecer, voce esta numa versao antiga. Veja
`versoes/HISTORICO.md`.

---

## A etapa concluida mudou de lugar quando reordenei

**Isso ja foi corrigido** na v21. Antes, a marcacao de concluida era
salva por posicao na lista, entao reordenar migrava a marcacao para
a etapa errada.

Se ainda acontecer, voce esta numa versao antiga.

---

## Perdi as propostas

**Causa:** os dados ficam no navegador. Limpar historico/cache do
Chrome apaga tudo.

**Se voce tem backup:** Aba 4 > **Importar backup** > escolha o `.json`.

**Se nao tem:** nao ha como recuperar. Por isso o backup automatico
existe - configure a pasta em `02-backups.md`.

---

## O layout quebrou (sem cores, sem estilo)

**Causa:** o Tailwind vem de CDN (`cdn.tailwindcss.com`). Se o
servidor esta sem internet, ou o CDN caiu, o CSS nao carrega.

**O sistema continua funcionando** - so o visual fica feio.

**Solucao definitiva:** compilar o CSS (ver `03-manutencao.md`).

---

## O Chrome pediu permissao ao abrir

Barra amarela embaixo da URL, dizendo que o arquivo vem do seu
computador.

**Nao e erro nem virus.** E o aviso padrao para qualquer sistema que
rode assim. Clique em **Avancado** e siga.

---

## Erro no console (F12)

Se voce mexer no codigo e algo parou de funcionar, abra o
**F12 > Console** e veja a mensagem. O erro costuma vir com o nome da
funcao e a linha.

