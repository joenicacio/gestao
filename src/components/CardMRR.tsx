import React from 'react'

interface CardMRRProps {
  titulo: string
  valor?: number
  subtitulo?: string
  clientes?: number
  destaque?: boolean
}

export function CardMRR({ titulo, valor = 0, subtitulo, clientes, destaque }: CardMRRProps) {
  const valorFormatado = (valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })

  return (
    <div className={`card-mrr ${destaque ? 'destaque' : ''}`}>
      <h3>{titulo}</h3>
      <div className="valor-mrr">
        <span className="valor">{valorFormatado}</span>
      </div>
      {subtitulo && <p className="subtitulo">{subtitulo}</p>}
      {clientes !== undefined && (
        <p className="clientes-info">
          <strong>{clientes}</strong> cliente{clientes !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
