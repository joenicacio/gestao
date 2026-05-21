import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface GraficoChurnProps {
  data: { mes: string; churn: number; ativo: number }[]
  meta: number
}

export function GraficoChurn({ data, meta }: GraficoChurnProps) {
  return (
    <div className="grafico-container">
      <h3>📉 Churn Mensal</h3>
      <div className="grafico-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="churn" fill="#ef4444" name="Churn" />
            <Bar dataKey="ativo" fill="#10b981" name="Ativos" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {meta > 0 && (
        <p className="grafico-info">
          Meta de churn: <strong>{meta.toFixed(1)}%</strong>
        </p>
      )}
    </div>
  )
}
