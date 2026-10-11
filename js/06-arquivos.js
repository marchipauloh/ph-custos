// =====================================================================
//   PH Custos - 06 arquivos
// ---------------------------------------------------------------------
//   Nomes dos arquivos exportados + download.
//
//   DECISAO DE DESIGN (v28)
//   Exportacao simplificada em 3 acoes diretas na interface:
//   1. Backup (.json) -> baixa o snapshot completo do sistema
//   2. Excel (.xlsx)  -> baixa a planilha formatada com formulas
//   3. Importar       -> carrega um backup (.json) para restaurar os dados
//
//   Comportamento padrao web: os downloads vao direto para a pasta
//   Downloads do navegador, identificados com carimbo de data/hora e
//   o nome do cliente/projeto.
//
//   O QUE FICOU DE FORA
//   - definirPasta / definirPastaJson / definirPastaXlsx (botoes removidos)
//   - gravarNaPasta (so existia para gravar na pasta oficial)
//   - statusPastas / pintarStatusPastas (a linha "Backup: pasta X")
//   - exportarBackupSilencioso (o backup automatico apos salvar proposta)
//
//   Se um dia vier um servidor de verdade, gravarNaPasta() era o ponto de
//   troca: vira um POST e o resto do sistema nao muda.
//
//   IMPORTAR E EXPORTAR NAO SAO A MESMA COISA
//   Um arquivo que ENTRA nunca e gravado em lugar nenhum do sistema. Um
//   backup adulterado numa pasta oficial seria pior do que nao ter backup.
// =====================================================================

// ---------------------------------------------------------------------
// NOME DO ARQUIVO: ph_custos_backup_Studio-Frontier_2026-10-09_14h37.json
// ---------------------------------------------------------------------

// "2026-10-09_14h37" - data, hora e minuto, no fuso do proprio PC
function carimboDataHora() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
         '_' + p(d.getHours()) + 'h' + p(d.getMinutes());
}

// Texto seguro para nome de arquivo: sem barra, sem acento, sem espaco.
// "Studio Frontier & Cia" -> "Studio-Frontier-Cia"
function parteDoNome(texto, limite) {
  if (!texto) return '';
  let s = String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  s = s.replace(/[\\/:*?"<>|]+/g, '-')   // o Windows reclama desses
       .replace(/[^\w\s.-]/g, '')         // so letra, numero, ponto, hifen
       .replace(/\s+/g, '-')              // hifen no lugar do espaco
       .replace(/-{2,}/g, '-')            // "A / B" nao vira "A---B"
       .replace(/\.+/g, '.')              // nao deixa ".." no nome
       .replace(/^[.\s-]+|[.\s-]+$/g, '') // nem comeca nem termina assim
       .trim();
  if (limite && s.length > limite) s = s.slice(0, limite).replace(/-+$/, '');
  return s;
}

// Monta o nome. Sem cliente/projeto em edicao, resta o carimbo e a origem.
function nomeDeArquivo(prefixo, contexto, extensao) {
  const pedacos = [prefixo];
  const quem = parteDoNome(contexto, 48);
  if (quem) pedacos.push(quem);
  pedacos.push(carimboDataHora());
  return pedacos.join('_') + extensao;
}

// ---------------------------------------------------------------------
// BAIXAR O ARQUIVO
// ---------------------------------------------------------------------

function baixarArquivo(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------------------------------------------------------------------
// EXPORTAR BACKUP (.json)
// ---------------------------------------------------------------------
function exportarBackup() {
  carregarProjetosStorage();

  const pacote = {
    app: 'PH Custos',
    versao: 20,
    exportadoEm: new Date().toISOString(),
    empresa: empresa,
    projetos: bancoProjetos
  };
  const texto = JSON.stringify(pacote, null, 2);
  const blob = new Blob([texto], { type: 'application/json' });
  const nome = nomeDeArquivo('ph_custos_backup', contextoNome(), '.json');

  baixarArquivo(blob, nome);
  mostrarAviso('Backup salvo: ' + nome);
  return { onde: 'downloads', nome: nome };
}

// ---------------------------------------------------------------------
// EXPORTAR EXCEL (.xlsx)
// ---------------------------------------------------------------------
function exportarExcel() {
  carregarProjetosStorage();
  if (bancoProjetos.length === 0) {
    alert('Ainda nao ha propostas salvas para exportar.');
    return null;
  }
  const blob = montarPlanilhaExcel(bancoProjetos);
  const nome = nomeDeArquivo('ph_custos_planilha', contextoNome(), '.xlsx');

  baixarArquivo(blob, nome);
  mostrarAviso('Planilha salva: ' + nome);
  return { onde: 'downloads', nome: nome };
}

// ---------------------------------------------------------------------
// NOME DO CLIENTE NOS ARQUIVOS
// ---------------------------------------------------------------------

// Nome do projeto/cliente em edicao, para o arquivo sair identificado.
// Usa o campo preenchido agora; se nao houver nada em edicao, tenta o
// cliente da ultima proposta salva neste navegador.
function contextoNome() {
  const campo = document.getElementById('proj-nome')
             || document.getElementById('cli-contato')
             || document.getElementById('cliente');
  const v = campo && campo.value ? campo.value.trim() : '';
  if (v) return v;
  try {
    const ultimo = localStorage.getItem('ph_ultimo_cliente');
    return ultimo ? String(ultimo) : '';
  } catch (e) { return ''; }
}

// Lembra o cliente da proposta salva, para as exportacoes seguintes sairem
// identificadas mesmo a partir de outra aba (que nao tem o campo na tela).
function lembrarCliente(nome) {
  try {
    if (nome && String(nome).trim()) {
      localStorage.setItem('ph_ultimo_cliente', String(nome).trim());
    }
  } catch (e) { /* localStorage bloqueado: so perde o nome no arquivo */ }
}

// =====================================================================
//   FIM DO MODULO
// =====================================================================