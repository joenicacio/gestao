import React, { useState } from 'react'
import { Cliente, MotivoChurn } from '../types'
import { ClienteManager } from '../utils/ClienteManager'

interface EditarMotivosChurnModalProps {
  cliente: Cliente
  onClose: () => void
  onUpdate: (cliente: Cliente) => void
}

export function EditarMotivosChurnModal({ cliente, onClose, onUpdate }: EditarMotivosChurnModalProps) {
  const motivoAtual = cliente.motivoChurn || {
    motivoPrincipal: '',
    submotivo: '',
    porques: ['', '', '', '', '']
  }

  const [motivoPrincipal, setMotivoPrincipal] = useState(motivoAtual.motivoPrincipal)
  const [submotivo, setSubmotivo] = useState(motivoAtual.submotivo)
  const [porques, setPortques] = useState<[string, string, string, string, string]>(
    motivoAtual.porques as [string, string, string, string, string]
  )
  const [dataChurn, setDataChurn] = useState(cliente.dataChurn ? cliente.dataChurn.split('T')[0] : '')

  const handlePorqueChange = (index: number, value: string) => {
    const novosPorques = [...porques]
    novosPorques[index] = value
    setPortques(novosPorques as [string, string, string, string, string])
  }

  const handleSalvar = () => {
    if (!motivoPrincipal.trim()) {
      alert('Por favor, insira o motivo principal do churn')
      return
    }

    if (!submotivo.trim()) {
      alert('Por favor, selecione um submotivo')
      return
    }

    if (porques.every(p => !p.trim())) {
      alert('Por favor, preencha pelo menos um dos "por quês"')
      return
    }

    const novoMotivo: MotivoChurn = {
      motivoPrincipal: motivoPrincipal.trim(),
      submotivo: submotivo.trim(),
      porques: porques as [string, string, string, string, string]
    }

    let clienteAtualizado: Cliente = {
      ...cliente,
      motivoChurn: novoMotivo
    }

    if (dataChurn) {
      clienteAtualizado.dataChurn = new Date(dataChurn).toISOString()
    }

    clienteAtualizado = ClienteManager.atualizarCliente(clienteAtualizado, clienteAtualizado)
    onUpdate(clienteAtualizado)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Motivos de Churn</h2>
          <span className="cliente-nome">{cliente.nome}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Data do Churn */}
          <div className="form-group">
            <label htmlFor="data-churn">Data do Churn:</label>
            <input
              id="data-churn"
              type="date"
              value={dataChurn}
              onChange={(e) => setDataChurn(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Motivo Principal */}
          <div className="form-group">
            <label htmlFor="motivo-principal">Motivo Principal:</label>
            <select
              id="motivo-principal"
              value={motivoPrincipal}
              onChange={(e) => setMotivoPrincipal(e.target.value)}
              className="form-input"
            >
              <option value="">-- Selecione um motivo --</option>
              <option value="Atraso de Entregáveis">Atraso de Entregáveis</option>
              <option value="Problema com Atendimento">Problema com Atendimento</option>
              <option value="Venda Desalinhada">Venda Desalinhada</option>
              <option value="Falta de Resultado">Falta de Resultado</option>
              <option value="Churn Forçado">Churn Forçado</option>
              <option value="Problemas Financeiros">Problemas Financeiros</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {/* Submotivo */}
          <div className="form-group">
            <label htmlFor="submotivo">Submotivo:</label>
            <select
              id="submotivo"
              value={submotivo}
              onChange={(e) => setSubmotivo(e.target.value)}
              className="form-input"
            >
              <option value="">-- Selecione um submotivo --</option>
              <option value="Falha Operacional">Falha Operacional</option>
              <option value="Desalinhamento de Expectativa Operacional">Desalinhamento de Expectativa Operacional</option>
              <option value="Falta de Entendimento do Negócio do Cliente">Falta de Entendimento do Negócio do Cliente</option>
              <option value="Falha no Processo de Implantação">Falha no Processo de Implantação</option>
              <option value="Falta de Adição de Saldo">Falta de Adição de Saldo</option>
              <option value="Fora do ICP">Fora do ICP</option>
              <option value="Venda Desalinhada">Venda Desalinhada</option>
            </select>
          </div>

          {/* 5 Por quês */}
          <div className="form-group">
            <label className="label-titulo">Os 5 Por quês (preencha pelo menos 1):</label>
            <div className="porques-container">
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="porque-item">
                  <label htmlFor={`porque-${index}`}>Por que {index + 1}:</label>
                  <textarea
                    id={`porque-${index}`}
                    placeholder={`Descreva o ${index + 1}º motivo...`}
                    value={porques[index]}
                    onChange={(e) => handlePorqueChange(index, e.target.value)}
                    className="form-textarea"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSalvar}>
            Salvar Motivos
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
