import React, { useState } from 'react'
import { Cliente, ServicoType } from '../types'
import { ClienteManager } from '../utils/ClienteManager'

interface EditarServicosModalProps {
  cliente: Cliente
  onClose: () => void
  onUpdate: (cliente: Cliente) => void
}

const SERVICOS: ServicoType[] = [
  'SEO BRASIL',
  'SEO EUA',
  'CRM',
  'ASSESSORIA',
  'TRÁFEGO PAGO E-COMMERCE BRASIL',
  'TRÁFEGO PAGO LEADS BRASIL',
  'TRÁFEGO PAGO LEADS USA',
  'TRÁFEGO PAGO E-COMMERCE USA',
  'SOCIAL MÍDIA',
  'WAYSALES',
  'IA'
]

export function EditarServicosModal({ cliente, onClose, onUpdate }: EditarServicosModalProps) {
  const [servicos, setServicos] = useState<ServicoType[]>(cliente.servicos)

  const handleServicoChange = (servico: ServicoType) => {
    if (servicos.includes(servico)) {
      setServicos(servicos.filter(s => s !== servico))
    } else {
      setServicos([...servicos, servico])
    }
  }

  const handleSalvar = () => {
    if (servicos.length === 0) {
      alert('Por favor, selecione pelo menos um serviço')
      return
    }

    const clienteAtualizado = ClienteManager.atualizarCliente(cliente, { servicos })
    onUpdate(clienteAtualizado)
    onClose()
  }

  return (
    <div className="modal-container">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Serviços - {cliente.nome}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="servicos-edit-container">
            <p className="info-text">
              Serviços selecionados: <strong>{servicos.length}</strong>
            </p>
            
            <div className="servicos-grid-edit">
              {SERVICOS.map((servico) => (
                <label key={servico} className="checkbox-label-edit">
                  <input
                    type="checkbox"
                    checked={servicos.includes(servico)}
                    onChange={() => handleServicoChange(servico)}
                  />
                  <span>{servico}</span>
                </label>
              ))}
            </div>

            {servicos.length > 0 && (
              <div className="servicos-selecionados">
                <h4>Serviços Atuais:</h4>
                <div className="servicos-list-edit">
                  {servicos.map((servico) => (
                    <span key={servico} className="servico-badge">
                      {servico}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSalvar}>
            Salvar Serviços
          </button>
        </div>
      </div>
    </div>
  )
}
