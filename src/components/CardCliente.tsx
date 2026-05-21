import React, { useState } from 'react'
import { Cliente } from '../types'
import { ClienteManager } from '../utils/ClienteManager'
import { HistoricoCliente } from './HistoricoCliente'
import { EditarServicosModal } from './EditarServicosModal'

interface CardClienteProps {
  cliente: Cliente
  onDelete: (id: string) => void
  onUpdate: (cliente: Cliente) => void
}

export function CardCliente({ cliente, onDelete, onUpdate }: CardClienteProps) {
  const [showHistorico, setShowHistorico] = useState(false)
  const [showEditarServicos, setShowEditarServicos] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editFee, setEditFee] = useState(cliente.fee.toString())

  const handleDeleteClick = () => {
    if (confirm(`Tem certeza que deseja remover o cliente "${cliente.nome}"?`)) {
      onDelete(cliente.id)
    }
  }

  const handleSaveFee = () => {
    const novoFee = parseFloat(editFee)
    if (isNaN(novoFee) || novoFee < 0) {
      alert('Por favor, insira um valor válido')
      setEditFee(cliente.fee.toString())
      return
    }

    if (novoFee !== cliente.fee) {
      const clienteAtualizado = ClienteManager.atualizarCliente(cliente, { fee: novoFee })
      onUpdate(clienteAtualizado)
    }

    setIsEditing(false)
  }

  const handleToggleStatus = () => {
    const novoStatus = cliente.status === 'Ativo' ? 'Churn' : 'Ativo'
    const confirmMsg = `Tem certeza que deseja alterar o status de "${cliente.nome}" para "${novoStatus}"?`
    
    if (confirm(confirmMsg)) {
      const clienteAtualizado = ClienteManager.atualizarCliente(cliente, { status: novoStatus })
      onUpdate(clienteAtualizado)
    }
  }

  const variacaoFee = ClienteManager.calcularVariacao(cliente.fee, cliente.ultimoFee || cliente.fee)
  const variacaoServicos = ClienteManager.calcularVariacao(
    cliente.servicos.length,
    cliente.ultimoServicosCount || cliente.servicos.length
  )

  const statusClass = cliente.status === 'Churn' ? 'status-churn' : 'status-ativo'
  const isChurn = cliente.status === 'Churn'

  return (
    <>
      <div className={`card-cliente ${isChurn ? 'cliente-churn' : ''}`}>
        <div className="card-header">
          <div className="cliente-info">
            <h3 className="cliente-nome">{cliente.nome}</h3>
            <span 
              className={`badge ${statusClass}`}
              onClick={handleToggleStatus}
              style={{ cursor: 'pointer' }}
              title="Clique para alterar o status"
            >
              {cliente.status}
            </span>
            <span className="badge squad-badge">Squad: {cliente.squad}</span>
          </div>
          <div className="card-actions">
            <button
              className="btn-icon"
              onClick={() => setShowEditarServicos(true)}
              title="Editar serviços"
            >
              ✏️
            </button>
            <button
              className="btn-icon"
              onClick={() => setShowHistorico(true)}
              title="Ver histórico"
            >
              📜
            </button>
            <button
              className="btn-icon btn-delete"
              onClick={handleDeleteClick}
              title="Remover cliente"
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="card-content">
          <div className="cliente-metric">
            <label>Serviços</label>
            <div className="metric-value">
              <span className="valor">{cliente.servicos.length}</span>
              {variacaoServicos.tipo !== 'sem_variacao' && (
                <span className={`variacao ${variacaoServicos.tipo}`}>
                  {variacaoServicos.tipo === 'aumento' ? '⬆️' : '⬇️'}
                  {variacaoServicos.percentual.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          <div className="cliente-metric">
            <label>Fee</label>
            <div className="metric-value">
              {isEditing ? (
                <div className="edit-fee">
                  <input
                    type="number"
                    step="0.01"
                    value={editFee}
                    onChange={(e) => setEditFee(e.target.value)}
                    autoFocus
                  />
                  <button onClick={handleSaveFee} className="btn-icon">
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditFee(cliente.fee.toString())
                      setIsEditing(false)
                    }}
                    className="btn-icon"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <span className="valor" onClick={() => setIsEditing(true)}>
                    R$ {cliente.fee.toFixed(2)}
                  </span>
                  {variacaoFee.tipo !== 'sem_variacao' && (
                    <span className={`variacao ${variacaoFee.tipo}`}>
                      {variacaoFee.tipo === 'aumento' ? '⬆️' : '⬇️'}
                      {variacaoFee.percentual.toFixed(1)}%
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card-servicos">
          <label>Serviços Contratados:</label>
          <div className="servicos-list">
            {cliente.servicos.length > 0 ? (
              cliente.servicos.map((servico) => (
                <span key={servico} className="servico-badge">
                  {servico}
                </span>
              ))
            ) : (
              <span className="empty">Nenhum serviço</span>
            )}
          </div>
        </div>

        <div className="card-footer">
          <small>
            Criado em: {new Date(cliente.dataCreate).toLocaleDateString('pt-BR')}
          </small>
        </div>
      </div>

      {showHistorico && (
        <HistoricoCliente
          cliente={cliente}
          onClose={() => setShowHistorico(false)}
        />
      )}

      {showEditarServicos && (
        <EditarServicosModal
          cliente={cliente}
          onClose={() => setShowEditarServicos(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}
