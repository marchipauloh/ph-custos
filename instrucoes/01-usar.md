# Como usar o sistema

Este guia cobre o uso diário, da abertura até a proposta em PDF.

## Abrir o sistema

1. Abra o arquivo `public/index.html`.
2. Aguarde o redirecionamento para a **Aba 1**.

- Use o Chrome ou o Edge.
- Se o Chrome exibir uma barra amarela, clique em **Avançado** e continue. O aviso é normal para arquivos locais.

## As 4 abas

| Aba | Função |
|---|---|
| **1. Proposta & Status** | Preencher custos, cronograma e parcelas; salvar; gerar PDF |
| **2. Lista Materiais** | Editar a tabela de materiais da obra |
| **3. Equipe de Campo** | Editar técnicos e diárias |
| **4. Painel Financeiro** | Consultar propostas, lançar gastos e exportar dados |

## Montar uma proposta

1. Preencha **Cliente** e **Nome do Projeto** na **Aba 1**.
2. Preencha os custos de logística: alimentação, transporte e hotel.
3. Abra a **Aba 2** e monte a lista de materiais.
4. Abra a **Aba 3** e monte a equipe.
5. Volte à **Aba 1** e ajuste o cronograma e as parcelas.
6. Clique em **Salvar**.

### O passo 6 é obrigatório

- O sistema guarda um rascunho ao trocar de aba.
- Somente a proposta **salva** entra no PDF, no painel e na planilha.

## Cronograma

O sistema sugere as etapas a partir dos dias de trabalho. Você pode:

- Marcar uma etapa como **concluída**.
- Adicionar uma etapa.
- Remover uma etapa.
- Reordenar as etapas.
- Editar as datas de cada etapa.

A marcação de concluída acompanha a etapa quando você reordena a lista.

## Receber e gastar (Aba 4)

Na **Aba 4**, cada proposta salva aparece como um cartão. Nele você pode:

- Marcar parcelas como pagas.
- Lançar gastos.
- Consultar **orçado**, **executado** e resultado.

### Orçado e executado

- **Orçado** é o valor calculado na proposta.
- **Executado** é a soma dos gastos lançados.
- O sistema preserva os gastos lançados quando você edita o orçamento.

## Gerar o PDF

1. Abra a **Aba 4**.
2. Clique no botão **Ver proposta e gerar PDF** do cartão.
3. Clique em **Gerar PDF / Imprimir Proposta**.
4. Escolha **Salvar como PDF** na janela de impressão.

O PDF sai em A4 com a identidade da PH Lighting.

## Exportar dados

Na **Aba 4**, use os botões:

| Botão | Função |
|---|---|
| **Backup (.json)** | Baixa todos os dados em um arquivo `.json` |
| **Excel** | Baixa uma planilha `.xlsx` com 7 abas |
| **Importar** | Carrega um backup `.json` no sistema |

- Somente o `.json` volta para o sistema.
- A planilha serve para leitura e arquivo.
- A aba **Propostas** da planilha usa fórmulas. Os totais se atualizam quando você edita um gasto no Excel.

## Nomes dos arquivos exportados

```
ph_custos_backup_Studio-Fronteira-Cia_2026-10-10_22h41.json
ph_custos_planilha_Studio-Fronteira-Cia_2026-10-10_22h41.xlsx
```

O nome contém o tipo, o cliente, a data e a hora. Sem cliente preenchido, o nome contém só a data e a hora.

## Onde os dados ficam

O sistema guarda os dados no navegador de cada usuário.

- Nenhum servidor guarda as propostas.
- Limpar o cache do Chrome apaga todas as propostas.
- Outro computador não vê as suas propostas.

Exporte um backup com frequência. Veja [02-backups.md](02-backups.md).
