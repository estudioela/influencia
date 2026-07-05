/**
 * ERP ELÃ - SISTEMA DE SINCRONIZAÇÃO DO PORTAL V1.1
 * Arquivo: Portal.gs
 * Finalidade: Sincronizar as abas operacionais (PAGAMENTOS e ATIVAÇÕES) 
 * com a Planilha de Apoio isolada que alimenta o site externo.
 */

// 🔴 ID inserido automaticamente a partir do seu link:
const ID_PLANILHA_APOIO = "1289Eu3hk-L3GnHbNwAfxgHy3UfVnjfB0LnlHEMoOg1M";

function lancarParaPortal() {
  const ui = SpreadsheetApp.getUi();
  
  // 1. Validação de Segurança do ID da Planilha de Apoio
  if (ID_PLANILHA_APOIO === "" || !ID_PLANILHA_APOIO) {
    ui.alert(
      "⚠️ Configuração Pendente", 
      "O ID da Planilha de Apoio está ausente no código 'Portal.gs'.", 
      ui.ButtonSet.OK
    );
    return;
  }
  
  // 2. Caixa de Confirmação para a equipe
  const confirmar = ui.alert(
    "🖥️ Lançar para o Portal",
    "Deseja atualizar a base de dados do Portal agora?\n\nIsso enviará os dados mais recentes das abas ATIVAÇÕES e PAGAMENTOS.",
    ui.ButtonSet.YES_NO
  );
  
  if (confirmar !== ui.Button.YES) {
    return; // Cancela a operação caso o usuário clique em "Não"
  }
  
  const ssOrigem = SpreadsheetApp.getActiveSpreadsheet();
  let ssDestino;
  
  // 3. Tentativa de conexão com a planilha externa de apoio
  try {
    ssDestino = SpreadsheetApp.openById(ID_PLANILHA_APOIO);
  } catch(e) {
    ui.alert(
      "❌ Erro de Acesso", 
      "Não foi possível abrir a Planilha de Apoio.\n\nVerifique se o script possui permissões de acesso ao arquivo de destino ou se ele foi deletado.", 
      ui.ButtonSet.OK
    );
    return;
  }
  
  const abasParaSincronizar = ["ATIVAÇÕES", "PAGAMENTOS"];
  let abasSincronizadas = [];
  
  // 4. Varredura e replicação limpa dos dados
  abasParaSincronizar.forEach(nomeAba => {
    const abaOrigem = ssOrigem.getSheetByName(nomeAba);
    
    if (abaOrigem) {
      let abaDestino = ssDestino.getSheetByName(nomeAba);
      
      // Se a aba ainda não existir na planilha de apoio, cria ela dinamicamente
      if (!abaDestino) {
        abaDestino = ssDestino.insertSheet(nomeAba);
      } else {
        abaDestino.clear(); // Limpa dados e formatos antigos para evitar "lixo" acumulado
      }
      
      const ultimaLinha = abaOrigem.getLastRow();
      const ultimaColuna = abaOrigem.getLastColumn();
      
      if (ultimaLinha > 0 && ultimaColuna > 0) {
        // Captura os dados puros (valores brutos, perfeitos para APIs de portais e sites lerem sem bugs)
        const dados = abaOrigem.getRange(1, 1, ultimaLinha, ultimaColuna).getValues();
        
        // Grava os dados na planilha de destino
        abaDestino.getRange(1, 1, ultimaLinha, ultimaColuna).setValues(dados);
        abasSincronizadas.push(nomeAba);
      }
    }
  });
  
  // Força a gravação imediata dos dados antes de exibir o alerta
  SpreadsheetApp.flush();
  
  // 5. Mensagem de feedback de Sucesso
  if (abasSincronizadas.length > 0) {
    ui.alert(
      "🚀 Dados Enviados!", 
      "O portal foi atualizado com sucesso!\nAbas sincronizadas: " + abasSincronizadas.join(" e ") + ".", 
      ui.ButtonSet.OK
    );
  } else {
    ui.alert(
      "⚠️ Erro nas Abas", 
      "Nenhuma das abas ('ATIVAÇÕES' ou 'PAGAMENTOS') continha dados válidos ou foram encontradas na planilha mãe.", 
      ui.ButtonSet.OK
    );
  }
}