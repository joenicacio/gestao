import React, { useState } from 'react'
import { Cliente } from '../types'
import { ClienteManager } from '../utils/ClienteManager'

interface EditarDataInicioModalProps {
  cliente: Cliente
  onClose: () => void
  onUpdate: (cliente: Cliente) => void
}

export function EditarDataInicioModal({ cliente, onClose, onUpdate }: EditarDataInicioModalProps) {
  const [dataInicio, setDataInicio] = useState(cliente.dataInicio || '')
  const [dataChurn, setDataChurn] = useState(cliente.dataChurn || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (dataInicio && dataChurn && new Date(dataInicio) > new Date(dataChurn)) {
      alert('Data de início não pode ser posterior à data de churn')
      return
    }

    const clienteAtualizado = ClienteManager.atualizarCliente(cliente, {
      dataInicio: dataInicio || undefined,
      dataChurn: dataChurn || undefined
    })

    onUpdate(clienteAtualizado)
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-data-inicio">
        <div className="modal-header">
          <h2>Editar Datas de Contrato</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="data-inicio">Data de Início do Contrato</label>
            <input
              id="data-inicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
            {dataInicio && (
              <small className="form-hint">
                {new Date(dataInicio).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="data-churn">Data de Churn (se aplicável)</label>
            <input
              id="data-churn"
              type="date"
              value={dataChurn}
              onChange={(e) => setDataChurn(e.target.value)}
            />
            {dataChurn && (
              <small className="form-hint">
                {new Date(dataChurn).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </small>
            )}
          </div>

          {dataInicio && dataChurn && (
            <div className="tempo-contrato-info">
              <strong>Duração do Contrato:</strong>
              {(() => {
                const inicio = new Date(dataInicio)
                const fim = new Date(dataChurn)
                const diffMs = fim.getTime() - inicio.getTime()
                const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                const diffMeses = Math.floor(diffDias / 30)
                return (
                  <span className="duracao">
                    {diffMeses > 0 ? `${diffMeses}m ` : ''}{diffDias % 30}d
                  </span>
                )
              })()}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Datas
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
