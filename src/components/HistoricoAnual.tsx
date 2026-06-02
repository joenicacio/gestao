import React, { useMemo, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Cliente } from '../types'
import { DashboardManager } from '../utils/DashboardManager'

interface HistoricoAnualProps {
  clientes: Cliente[]
}

interface HistoricoAnoItem {
  mes: string
  ativos: number
  churn: number
  receitaAtivos: number
  receitaChurn: number
}

interface MotivoResumo {
  motivo: string
  count: number
  percentual: number
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })

const formatPercent = (value: number) => `${value.toFixed(1)}%`

export function HistoricoAnual({ clientes }: HistoricoAnualProps) {
  const anosDisponiveis = useMemo(() => {
    const anos = new Set<number>()
    const adicionarAno = (valor?: string) => {
      if (!valor) return
      const data = new Date(valor)
      if (!Number.isNaN(data.getTime())) {
        anos.add(data.getFullYear())
      }
    }

    clientes.forEach(cliente => {
      adicionarAno(cliente.dataCreate)
      adicionarAno(cliente.dataInicio)
      adicionarAno(cliente.dataChurn)
    })

    const ordenados = Array.from(anos).sort((a, b) => b - a)
    const anoAtual = new Date().getFullYear()
    if (!ordenados.includes(anoAtual)) {
      ordenados.unshift(anoAtual)
    }

    return ordenados.length > 0 ? ordenados : [new Date().getFullYear()]
  }, [clientes])

  const [selectedYear, setSelectedYear] = useState<number>(anosDisponiveis[0] || new Date().getFullYear())
  const previousYear = selectedYear - 1

  const historicoAtual = useMemo<HistoricoAnoItem[]>(() =>
    DashboardManager.calcularHistoricoMensalPorAno(clientes, selectedYear),
    [clientes, selectedYear]
  )

  const historicoAnterior = useMemo<HistoricoAnoItem[]>(() =>
    DashboardManager.calcularHistoricoMensalPorAno(clientes, previousYear),
    [clientes, previousYear]
  )

  const motivosAtual = useMemo<MotivoResumo[]>(() =>
    DashboardManager.calcularMotivosChurnPorAno(clientes, selectedYear),
    [clientes, selectedYear]
  )

  const motivosAnterior = useMemo<MotivoResumo[]>(() =>
    DashboardManager.calcularMotivosChurnPorAno(clientes, previousYear),
    [clientes, previousYear]
  )

  const ativoChartData = historicoAtual.map((item, index) => ({
    mes: item.mes,
    atual: item.ativos,
    anterior: historicoAnterior[index]?.ativos || 0
  }))

  const receitaChartData = historicoAtual.map((item, index) => ({
    mes: item.mes,
    atual: item.receitaAtivos + item.receitaChurn,
    anterior: (historicoAnterior[index]?.receitaAtivos || 0) + (historicoAnterior[index]?.receitaChurn || 0)
  }))

  const totalChurnAtual = motivosAtual.reduce((sum, item) => sum + item.count, 0)
  const totalChurnAnterior = motivosAnterior.reduce((sum, item) => sum + item.count, 0)

  const anoOptions = useMemo(() => {
    const anos = new Set<number>(anosDisponiveis)
    anos.add(new Date().getFullYear())
    anos.add(previousYear)
    return Array.from(anos).sort((a, b) => b - a)
  }, [anosDisponiveis, previousYear])

  return (
    <div className="historico-anual">
      <div className="dashboard-header">
        <h1>📚 Histórico Anual</h1>
        <p>Comparativo mês a mês com o ano anterior, faturamento e motivos de churn</p>
      </div>

      <div className="historico-filtros">
        <div className="filtro-ano">
          <label htmlFor="ano-selecionado">Ano:</label>
          <select
            id="ano-selecionado"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {anoOptions.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>
        <div className="info-comparacao">
          Comparando <strong>{selectedYear}</strong> com <strong>{previousYear}</strong>
        </div>
      </div>

      <div className="historico-section">
        <h2>📈 Histórico Mensal</h2>
        <div className="historico-table-wrapper">
          <table className="historico-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Ativos {selectedYear}</th>
                <th>Churn {selectedYear}</th>
                <th>Faturamento Ativos {selectedYear}</th>
                <th>Faturamento Churn {selectedYear}</th>
                <th>Ativos {previousYear}</th>
                <th>Churn {previousYear}</th>
                <th>Faturamento Ativos {previousYear}</th>
                <th>Faturamento Churn {previousYear}</th>
              </tr>
            </thead>
            <tbody>
              {historicoAtual.map((item, index) => {
                const anterior = historicoAnterior[index] || {
                  ativos: 0,
                  churn: 0,
                  receitaAtivos: 0,
                  receitaChurn: 0,
                  mes: item.mes
                }
                return (
                  <tr key={item.mes}>
                    <td>{item.mes.toUpperCase()}</td>
                    <td>{item.ativos}</td>
                    <td>{item.churn}</td>
                    <td>{formatCurrency(item.receitaAtivos)}</td>
                    <td>{formatCurrency(item.receitaChurn)}</td>
                    <td>{anterior.ativos}</td>
                    <td>{anterior.churn}</td>
                    <td>{formatCurrency(anterior.receitaAtivos)}</td>
                    <td>{formatCurrency(anterior.receitaChurn)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="historico-graficos">
        <div className="grafico-container">
          <h3>Clientes Ativos por Mês</h3>
          <div className="grafico-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={ativoChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="anterior" fill="#60A5FA" name={`${previousYear}`} />
                <Bar dataKey="atual" fill="#10B981" name={`${selectedYear}`} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grafico-container">
          <h3>Faturamento Mensal</h3>
          <div className="grafico-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={receitaChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="anterior" stroke="#60A5FA" name={`${previousYear}`} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="atual" stroke="#10B981" name={`${selectedYear}`} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="historico-section">
        <h2>📋 Motivos de Churn</h2>
        <div className="motivos-grids">
          <div className="motivos-card">
            <h3>{selectedYear}</h3>
            <table>
              <thead>
                <tr>
                  <th>Motivo</th>
                  <th>Qtd.</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {motivosAtual.length === 0 ? (
                  <tr>
                    <td colSpan={3}>Nenhum churn registrado neste ano.</td>
                  </tr>
                ) : motivosAtual.map((item) => (
                  <tr key={item.motivo}>
                    <td>{item.motivo}</td>
                    <td>{item.count}</td>
                    <td>{formatPercent(item.percentual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="motivos-card">
            <h3>{previousYear}</h3>
            <table>
              <thead>
                <tr>
                  <th>Motivo</th>
                  <th>Qtd.</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {motivosAnterior.length === 0 ? (
                  <tr>
                    <td colSpan={3}>Nenhum churn registrado neste ano.</td>
                  </tr>
                ) : motivosAnterior.map((item) => (
                  <tr key={item.motivo}>
                    <td>{item.motivo}</td>
                    <td>{item.count}</td>
                    <td>{formatPercent(item.percentual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
