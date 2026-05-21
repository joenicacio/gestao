import React, { useState, useMemo } from 'react'
import { ServicoType, Squad, Status } from '../types'

interface FormularioClienteProps {
  onSubmit: (dados: {
    nome: string
    squad: Squad
    servicos: ServicoType[]
    fee: number
    status: Status
    dataInicio?: string
    dataChurn?: string
  }) => void
  onCancel: () => void
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

export function FormularioCliente({ onSubmit, onCancel }: FormularioClienteProps) {
  const [nome, setNome] = useState('')
  const [squad, setSquad] = useState<Squad>('BR')
  const [servicos, setServicos] = useState<ServicoType[]>([])
  const [fee, setFee] = useState('')
  const [status, setStatus] = useState<Status>('Ativo')
  const [dataInicio, setDataInicio] = useState('')
  const [dataChurn, setDataChurn] = useState('')

  const tempoContrato = useMemo(() => {
    if (!dataInicio) return undefined
    try {
      const inicio = new Date(dataInicio)
      const fim = dataChurn ? new Date(dataChurn) : new Date()
      const diffMs = fim.getTime() - inicio.getTime()
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      return diffDias >= 0 ? diffDias : undefined
    } catch {
      return undefined
    }
  }, [dataInicio, dataChurn])

  const handleServicoChange = (servico: ServicoType) => {
    if (servicos.includes(servico)) {
      setServicos(servicos.filter(s => s !== servico))
    } else {
      setServicos([...servicos, servico])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nome.trim()) {
      alert('Por favor, insira o nome do cliente')
      return
    }
    
    if (!fee || isNaN(parseFloat(fee))) {
      alert('Por favor, insira um valor válido para o Fee')
      return
    }
    
    if (servicos.length === 0) {
      alert('Por favor, selecione pelo menos um serviço')
      return
    }

    onSubmit({
      nome: nome.trim(),
      squad,
      servicos,
      fee: parseFloat(fee),
      status,
      dataInicio: dataInicio || undefined,
      dataChurn: dataChurn || undefined
    })

    // Reset form
    setNome('')
    setSquad('BR')
    setServicos([])
    setFee('')
    setStatus('Ativo')
    setDataInicio('')
    setDataChurn('')
  }

  return (
    <div className="formulario-container">
      <div className="formulario-backdrop" onClick={onCancel}></div>
      <form className="formulario" onSubmit={handleSubmit}>
        <h2>Adicionar Novo Cliente</h2>

        <div className="form-group">
          <label htmlFor="nome">Nome do Cliente *</label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o nome do cliente"
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="squad">Squad *</label>
            <select
              id="squad"
              value={squad}
              onChange={(e) => setSquad(e.target.value as Squad)}
            >
              <option value="BR">BR (Brasil)</option>
              <option value="USA">USA</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fee">Fee (R$) *</label>
            <input
              id="fee"
              type="number"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value="Ativo">Ativo</option>
              <option value="Churn">Churn</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dataInicio">Data de Início do Contrato</label>
            <input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dataChurn">Data do Churn</label>
            <input
              id="dataChurn"
              type="date"
              value={dataChurn}
              onChange={(e) => setDataChurn(e.target.value)}
              disabled={status === 'Ativo'}
            />
          </div>

          {tempoContrato !== undefined && (
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <label>Tempo de Contrato</label>
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#e8f5e9', 
                borderRadius: '4px',
                fontWeight: 'bold',
                color: '#2e7d32'
              }}>
                {tempoContrato} dias
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Serviços ({servicos.length}) *</label>
          <div className="servicos-grid">
            {SERVICOS.map((servico) => (
              <label key={servico} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={servicos.includes(servico)}
                  onChange={() => handleServicoChange(servico)}
                />
                <span>{servico}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Adicionar Cliente
          </button>
        </div>
      </form>
    </div>
  )
}
