# PH Custos

Gestor de custos e orçamento para projetos de iluminação cênica da **PH Lighting System**. Uma aplicação web totalmente estática, sem servidor, sem banco de dados e sem dependências externas.

## Como usar
1. Abra o arquivo public/index.html em seu navegador (Chrome ou Edge recomendado).
2. O sistema armazena os dados localmente no navegador (LocalStorage). Use a função de **Backup (.json)** na Aba 4 periodicamente para garantir a portabilidade e segurança dos seus projetos.

## Estrutura
- **public/**: Versão pronta para publicação em qualquer servidor estático.
- **dev/** (Código-fonte): Arquivos originais utilizados para o desenvolvimento e build do sistema.
- **docs/**: Manuais detalhados de operação, manutenção e troubleshooting.

## Manutenção
Este projeto utiliza um sistema de build simples para gerar os arquivos das abas a partir de um template único. Para realizar builds:
`ash
cd ferramentas
node gerar-paginas.js
`

---
*Este é um projeto interno da PH Lighting System.*
