import React, { useState } from 'react'

interface MetasChurnProps {
  metaAtual: number
  onSalvarMeta: (meta: number) => void
}

export function MetasChurn({ metaAtual, onSalvarMeta }: MetasChurnProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [metaInput, setMetaInput] = useState(metaAtual.toString())

  const handleSalvar = () => {
    const novaMeta = parseFloat(metaInput)
    if (!isNaN(novaMeta) && novaMeta >= 0) {
      onSalvarMeta(novaMeta)
      setIsEditing(false)
    } else {
      alert('Por favor, insira um valor válido para a meta')
    }
  }

  return (
    <div className="metas-churn">
      <div className="meta-card">
        <h3>🎯 Meta de Churn (%)</h3>
        {isEditing ? (
          <div className="meta-edit">
            <input
              type="number"
              value={metaInput}
              onChange={(e) => setMetaInput(e.target.value)}
              min="0"
              max="100"
              step="0.1"
              autoFocus
            />
            <button className="btn btn-primary" onClick={handleSalvar}>
              Salvar
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setIsEditing(false)
                setMetaInput(metaAtual.toString())
              }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="meta-display">
            <span className="meta-value">{metaAtual.toFixed(1)}%</span>
            <button
              className="btn-edit-meta"
              onClick={() => setIsEditing(true)}
              title="Editar meta"
            >
              ✏️
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
