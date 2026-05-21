import React, { useState } from 'react'
import { Cliente, ServicoType, Squad, Status } from '../types'
import { ClienteManager } from '../utils/ClienteManager'
import { FiX, FiEdit2, FiTrash2 } from 'react-icons/fi'

interface EditarMesesPassadosProps {
  clientes: Cliente[]
  onClose: () => void
  onUpdate: (clienteAtualizado: Cliente) => void
  onAdd: (novoCliente: Cliente) => void
  onDelete: (id: string) => void
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

export function EditarMesesPassados({
  clientes,
  onClose,
  onUpdate,
  onAdd,
  onDelete
}: EditarMesesPassadosProps) {
  const [mesSelecionado, setMesSelecionado] = useState('')
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [novoCliente, setNovoCliente] = useState(false)

  // Gerar lista de meses (últimos 12 meses)
  const mesesDisponiveis = []
  for (let i = 11; i >= 0; i--) {
    const data = new Date()
    data.setMonth(data.getMonth() - i)
    mesesDisponiveis.push({
      value: `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`,
      label: data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    })
  }

  // Filtrar clientes por mês
  const clientesMes = mesSelecionado
    ? clientes.filter(c => {
        const dataCreate = new Date(c.dataCreate)
        const mesCliente = `${dataCreate.getFullYear()}-${String(dataCreate.getMonth() + 1).padStart(2, '0')}`
        return mesCliente === mesSelecionado
      })
    : []

  const handleSalvarEdizione = (clienteAtualizado: Cliente) => {
    onUpdate(clienteAtualizado)
    setClienteEditando(null)
  }

  const handleAdicionarClienteMes = () => {
    setNovoCliente(true)
    setClienteEditando(null)
  }

  const handleSalvarNovoCliente = (dados: any) => {
    const novoClienteData = ClienteManager.criarCliente(
      dados.nome,
      dados.squad,
      dados.servicos,
      dados.fee,
      dados.status,
      dados.dataInicio,
      dados.dataChurn
    )
    onAdd(novoClienteData)
    setNovoCliente(false)
  }

  return (
    <div className="modal-container" style={{ zIndex: 1000 }}>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Editar Dados de Meses Anteriores</h2>
          <button
            className="btn-icon"
            onClick={onClose}
            style={{ fontSize: '24px', cursor: 'pointer', border: 'none', background: 'none' }}
          >
            <FiX />
          </button>
        </div>

        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label htmlFor="mes-selecionado">Selecione o Mês *</label>
          <select
            id="mes-selecionado"
            value={mesSelecionado}
            onChange={(e) => {
              setMesSelecionado(e.target.value)
              setClienteEditando(null)
              setNovoCliente(false)
            }}
            style={{ padding: '10px', fontSize: '16px' }}
          >
            <option value="">-- Escolha um mês --</option>
            {mesesDisponiveis.map(mes => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
        </div>

        {mesSelecionado && (
          <>
            {novoCliente ? (
              <FormularioNovoClienteMes
                mesSelecionado={mesSelecionado}
                meshLabel={mesesDisponiveis.find(m => m.value === mesSelecionado)?.label || ''}
                onSave={handleSalvarNovoCliente}
                onCancel={() => setNovoCliente(false)}
              />
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h3>Clientes em {mesesDisponiveis.find(m => m.value === mesSelecionado)?.label}</h3>
                  <p style={{ color: '#666', marginBottom: '15px' }}>Total: {clientesMes.length} cliente(s)</p>

                  {clientesMes.length > 0 && (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {clientesMes.map(cliente => (
                        <div
                          key={cliente.id}
                          style={{
                            padding: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: clienteEditando?.id === cliente.id ? '#f5f5f5' : '#fff'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong>{cliente.nome}</strong>
                              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                Squad: {cliente.squad} | Fee: R$ {cliente.fee.toFixed(2)} | Status: {cliente.status}
                                {cliente.tempoContrato && ` | Tempo: ${cliente.tempoContrato} dias`}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => setClienteEditando(cliente)}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                              >
                                <FiEdit2 size={16} />
                                Editar
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => onDelete(cliente.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                              >
                                <FiTrash2 size={16} />
                                Deletar
                              </button>
                            </div>
                          </div>

                          {clienteEditando?.id === cliente.id && (
                            <EditorClienteMes
                              cliente={cliente}
                              onSave={handleSalvarEdizione}
                              onCancel={() => setClienteEditando(null)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    onClick={handleAdicionarClienteMes}
                    style={{ marginTop: '20px', width: '100%' }}
                  >
                    + Adicionar Cliente em {mesesDisponiveis.find(m => m.value === mesSelecionado)?.label}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface EditorClienteMesProps {
  cliente: Cliente
  onSave: (cliente: Cliente) => void
  onCancel: () => void
}

function EditorClienteMes({ cliente, onSave, onCancel }: EditorClienteMesProps) {
  const [fee, setFee] = useState(cliente.fee.toString())
  const [status, setStatus] = useState(cliente.status)
  const [dataInicio, setDataInicio] = useState(cliente.dataInicio || '')
  const [dataChurn, setDataChurn] = useState(cliente.dataChurn || '')

  const handleSave = () => {
    const clienteAtualizado = ClienteManager.atualizarCliente(cliente, {
      fee: parseFloat(fee),
      status,
      dataInicio: dataInicio || undefined,
      dataChurn: dataChurn || undefined
    })
    onSave(clienteAtualizado)
  }

  return (
    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
      <div className="form-row" style={{ gap: '15px' }}>
        <div className="form-group">
          <label>Fee (R$)</label>
          <input
            type="number"
            step="0.01"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="Ativo">Ativo</option>
            <option value="Churn">Churn</option>
          </select>
        </div>

        <div className="form-group">
          <label>Data de Início</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Data de Churn</label>
          <input
            type="date"
            value={dataChurn}
            onChange={(e) => setDataChurn(e.target.value)}
            disabled={status === 'Ativo'}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Salvar Alterações
        </button>
      </div>
    </div>
  )
}

interface FormularioNovoClienteMesProps {
  mesSelecionado: string
  meshLabel: string
  onSave: (dados: any) => void
  onCancel: () => void
}

function FormularioNovoClienteMes({
  mesSelecionado,
  meshLabel,
  onSave,
  onCancel
}: FormularioNovoClienteMesProps) {
  const [nome, setNome] = useState('')
  const [squad, setSquad] = useState<Squad>('BR')
  const [servicos, setServicos] = useState<ServicoType[]>([])
  const [fee, setFee] = useState('')
  const [status, setStatus] = useState<Status>('Ativo')
  const [dataInicio, setDataInicio] = useState('')
  const [dataChurn, setDataChurn] = useState('')

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

    onSave({
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
    <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '20px' }}>Adicionar Novo Cliente em {meshLabel}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="novo-nome">Nome do Cliente *</label>
          <input
            id="novo-nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o nome do cliente"
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="novo-squad">Squad *</label>
            <select
              id="novo-squad"
              value={squad}
              onChange={(e) => setSquad(e.target.value as Squad)}
            >
              <option value="BR">BR (Brasil)</option>
              <option value="USA">USA</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="novo-fee">Fee (R$) *</label>
            <input
              id="novo-fee"
              type="number"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="novo-status">Status *</label>
            <select
              id="novo-status"
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
            <label htmlFor="novo-dataInicio">Data de Início do Contrato</label>
            <input
              id="novo-dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="novo-dataChurn">Data do Churn</label>
            <input
              id="novo-dataChurn"
              type="date"
              value={dataChurn}
              onChange={(e) => setDataChurn(e.target.value)}
              disabled={status === 'Ativo'}
            />
          </div>
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

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Adicionar Cliente em {meshLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
