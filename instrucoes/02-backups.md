# Exportação de arquivos

Como os arquivos são salvos e para onde vão.

---

## Comportamento padrão (v28+)

O sistema agora adota o comportamento padrão de aplicações web: ao exportar, o arquivo é automaticamente enviado para a pasta **Downloads** do seu navegador, identificado com carimbo de data/hora e o nome do cliente/projeto relacionado.

---

## As 3 vias de exportação (Aba 4)

| Botão | O que faz |
|---|---|
| **Backup (.json)** | Baixa o snapshot completo do sistema. Use para guardar ou transferir dados. |
| **Excel** | Gera e baixa a planilha .xlsx formatada com fórmulas. |
| **Importar** | Carrega um backup .json gravado anteriormente para restaurar os dados. |

---

## Backup Automático

Além das exportações manuais, **cada vez que você salva uma proposta**, o sistema gera um arquivo .json de backup e o baixa automaticamente para a pasta Downloads. 

Este comportamento garante que você sempre tenha cópias de segurança sem precisar lembrar de exportar manualmente.

---

## Limitações importantes

- **Os arquivos entram, mas não saem da pasta Downloads:** O navegador controla onde os arquivos são salvos. Se você deseja organizá-los em pastas específicas, é necessário movê-los manualmente após o download.
- **Não há sincronização:** Os arquivos são baixados para o armazenamento local do seu computador. Não há envio automático para servidores ou nuvem.
