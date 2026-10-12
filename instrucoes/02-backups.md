# Backups e exportação

Este guia explica como exportar, guardar e importar os dados.

## Como o sistema exporta

- O navegador salva o arquivo exportado na pasta **Downloads**.
- O nome do arquivo contém o cliente, a data e a hora.
- O sistema não cria backup automático.

## Botões da Aba 4

| Botão | Função |
|---|---|
| **Backup (.json)** | Baixa o backup completo do sistema |
| **Excel** | Baixa a planilha `.xlsx` com fórmulas |
| **Importar** | Carrega um backup `.json` e restaura os dados |

## Exportar um backup

1. Abra a **Aba 4**.
2. Clique em **Backup (.json)**.
3. Mova o arquivo da pasta **Downloads** para uma pasta segura.

## Importar um backup

1. Abra a **Aba 4**.
2. Clique em **Importar**.
3. Escolha o arquivo `.json`.
4. Confirme a importação.

O sistema valida o arquivo e migra backups de versões antigas.

## Frequência recomendada

Exporte um backup nestes momentos:

- Ao fim de cada dia de trabalho.
- Depois de salvar uma proposta importante.
- Antes de limpar o cache do navegador.

## Limitações

- O navegador define a pasta de destino. O sistema não escolhe a pasta.
- O sistema não envia arquivos para servidor ou nuvem.
- Os dados de um computador não aparecem em outro. Importe o backup para transferir.
