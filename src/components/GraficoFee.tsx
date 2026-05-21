import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface GraficoFeeProps {
  data: { mes: string; fee: number }[]
}

export function GraficoFee({ data }: GraficoFeeProps) {
  return (
    <div className="grafico-container">
      <h3>💰 MRR Mensal</h3>
      <div className="grafico-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip
              formatter={(value: any) =>
                value.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="fee"
              stroke="#2563eb"
              strokeWidth={2}
              name="MRR Total"
              dot={{ fill: '#2563eb', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
