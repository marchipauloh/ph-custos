# Como usar o sistema

Guia do dia a dia. Do abrir ate gerar a proposta.

---

## Abrir

Dois cliques em `index.html`. Ele te leva para a Aba 1 em 3 segundos.

Se aparecer uma barra amarela do Chrome embaixo, clique em **Avancado**
e siga. Isso e normal para sistemas que abrem arquivos do proprio PC.

**Use Chrome ou Edge.** No Firefox e Safari a escolha de pasta nao
existe, e o sistema avisa quando voce tenta usar.

---

## As 4 abas

| Aba | O que voce faz |
|---|---|
| **1. Proposta & Status** |orcamento, cronograma, parcelas, PDF, salvar |
| **2. Lista Materiais** | Tabela de insumos da obra |
| **3. Equipe de Campo** | Tecnicos e diarias |
| **4. Painel Financeiro** | Historico, gastos, backup, Excel |

---

## Montando uma proposta (Aba 1)

1. Preencha **Cliente** e **Nome do Projeto**
2. Preencha os custos de **logistica** (alimentacao, transporte, hotel)
3. Va na **Aba 2** eMonte a lista de materiais
4. Va na **Aba 3** e monte a equipe
5. **Volte na Aba 1** e ajuste o cronograma e as parcelas
6. Clique em **Salvar**

### O passo 6 importa

Materiais e equipe so entram na proposta quando voce salva. Navegar
entre abas e seguro (o sistema guarda um rascunho), mas o que vai para
o PDF, para o painel e para a planilha e o que foi **salvo**.

---

## Sobre o cronograma

O sistema sugere as etapas a partir dos dias de trabalho. Voce pode:

- Marcar uma etapa como **concluida** (o quadradinho)
- Adicionar, remover ou reordenar etapas
-Editar as datas de cada etapa

A marcacao de concluida **acompanha a etapa**, mesmo se voce reordenar
a lista. (Na versao antiga isso tinha um bug: a marcacao migrava para a
etapa errada. Foi corrigido.)

---

## Recebendo e gastando (Aba 4)

Na aba **Painel Financeiro**:

- Cada proposta salva aparece como um cartao
- Voce marca **parcelas como pagas**
- Voce lanca **gastos** (o que realmente foi gasto)
- O painel mostra **orcado x executado x resultado**

### Orcado x executado

- **Orcado** e o que foi calculado na proposta
- **Executado** e a soma dos gastos lancados
- Se voce reeditar o orcamento de uma proposta que ja tem gastos, o
  executado **nao e sobrescrito** - os gastos reais sao preservados

---

## Gerar o PDF

Na Aba 1, o botao de PDF abre a proposta pronta para imprimir.
Escolha "Salvar como PDF" na janela de impressao.

O PDF sai em **A4** com a identidade da PH Lighting.

---

## Exportar

Na Aba 4:

| Botao | O que faz |
|---|---|
| **Backup (.json)** | Salva todos os dados. Use para guardar ou transferir |
| **Excel (.xlsx)** | Planilha com 7 abas e formulas vivas |
| **Salvar no PC** | Grava na pasta oficial E deixa voce escolher outra |

O `.json` e o **unico** formato que volta para o sistema (botao
"Importar backup"). A planilha e para ler e arquivar.

### Formulas vivas do Excel

A aba Propostas da planilha tem **formulas**, nao valores fixos. Se
voce editar um gasto ou marcar uma parcela dentro do Excel, os totais
se atualizam sozinhos. Isso e proposital - da para conferir a planilha
sem sair dela.

---

## Nomes dos arquivos

```
ph_custos_backup_Studio-Fronteira-Cia_2026-10-10_22h41.json
ph_custos_planilha_Studio-Fronteira-Cia_2026-10-10_22h41.xlsx
```

Data, hora, minuto e o nome do projeto/cliente. Sem cliente
preenchido, sai so o carimbo de data e hora.

---

## Onde os dados ficam

No **navegador do seu computador**, em cada navegador e cada usuario.

Isso significa que:
- Nao existe servidor guardando suas propostas
- Limpar o historico/cache do Chrome **apaga tudo**
- Outro computador nao ve as suas propostas

**Por isso: configure o backup automatico** (ver
[02-backups.md](02-backups.md)). Ele grava um `.json` a cada proposta
salva.
