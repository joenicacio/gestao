import React from 'react'
import { Cliente } from '../types'
import { CardCliente } from './CardCliente'

interface ListaClientesProps {
  clientes: Cliente[]
  onDelete: (id: string) => void
  onUpdate: (cliente: Cliente) => void
}

export function ListaClientes({ clientes, onDelete, onUpdate }: ListaClientesProps) {
  if (clientes.length === 0) {
    return (
      <div className="lista-vazia">
        <h2>Nenhum cliente cadastrado</h2>
        <p>Clique em "Adicionar novo cliente" para começar</p>
      </div>
    )
  }

  const clientesAtivos = clientes.filter(c => c.status === 'Ativo')
  const clientesChurn = clientes.filter(c => c.status === 'Churn')

  return (
    <div className="lista-container">
      <div className="lista-stats">
        <div className="stat">
          <span className="stat-label">Total</span>
          <span className="stat-value">{clientes.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Ativos</span>
          <span className="stat-value" style={{ color: '#4CAF50' }}>
            {clientesAtivos.length}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Churn</span>
          <span className="stat-value" style={{ color: '#f44336' }}>
            {clientesChurn.length}
          </span>
        </div>
      </div>

      <div className="clientes-grid">
        {clientesAtivos.map((cliente) => (
          <CardCliente
            key={cliente.id}
            cliente={cliente}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
        {clientesChurn.length > 0 && (
          <>
            <div className="secao-titulo">
              <h3>Clientes em Churn</h3>
            </div>
            {clientesChurn.map((cliente) => (
              <CardCliente
                key={cliente.id}
                cliente={cliente}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
