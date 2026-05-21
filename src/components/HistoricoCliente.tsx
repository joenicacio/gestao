import React from 'react'
import { Cliente } from '../types'
import { ClienteManager } from '../utils/ClienteManager'

interface HistoricoClienteProps {
  cliente: Cliente
  onClose: () => void
}

export function HistoricoCliente({ cliente, onClose }: HistoricoClienteProps) {
  return (
    <div className="modal-container">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Histórico - {cliente.nome}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="historico-list">
          {cliente.historico.length === 0 ? (
            <p className="empty-state">Nenhum histórico disponível</p>
          ) : (
            cliente.historico.slice().reverse().map((item) => (
              <div key={item.id} className="historico-item">
                <div className="historico-header">
                  <span className={`historico-tipo tipo-${item.tipo}`}>
                    {getTipoLabel(item.tipo)}
                  </span>
                  <span className="historico-datetime">
                    {item.data} às {item.hora}
                  </span>
                </div>
                <p className="historico-descricao">{item.descricao}</p>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

function getTipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    'criacao': '✨ Criação',
    'edicao': '✏️ Edição',
    'servico_adicionado': '➕ Serviço Adicionado',
    'servico_removido': '➖ Serviço Removido',
    'fee_alterado': '💰 Fee Alterado',
    'status_alterado': '🔄 Status Alterado'
  }
  return labels[tipo] || tipo
}
