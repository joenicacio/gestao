import React, { useState, useMemo } from 'react'
import { Cliente } from '../types'
import { DashboardManager } from '../utils/DashboardManager'
import { MetasChurn } from './MetasChurn'
import { CardMRR } from './CardMRR'
import { GraficoChurn } from './GraficoChurn'
import { GraficoFee } from './GraficoFee'

interface DashboardProps {
  clientes: Cliente[]
}

export function Dashboard({ clientes }: DashboardProps) {
  const [metaChurn, setMetaChurn] = useState<number>(DashboardManager.obterMetaChurn())
  const [squadFilter, setSquadFilter] = useState<'BR' | 'USA' | 'TODOS'>('TODOS')

  const mrrData = useMemo(() => DashboardManager.calcularMRR(clientes, squadFilter), [clientes, squadFilter])
  const churnMensal = useMemo(() => DashboardManager.calcularChurnMensal(clientes, squadFilter), [clientes, squadFilter])
  const feeMensal = useMemo(() => DashboardManager.calcularFeeMensal(clientes, squadFilter), [clientes, squadFilter])

  const handleSalvarMeta = (novaMeta: number) => {
    setMetaChurn(novaMeta)
    DashboardManager.salvarMetaChurn(novaMeta)
  }

  // Filtrar clientes por squad
  const clientesFiltrados = squadFilter === 'TODOS' 
    ? clientes 
    : clientes.filter(c => c.squad === squadFilter)

  const clientesAtivos = clientesFiltrados.filter(c => c.status === 'Ativo').length
  const clientesChurn = clientesFiltrados.filter(c => c.status === 'Churn').length
  const totalClientes = clientesFiltrados.length
  const taxaChurn = totalClientes > 0 ? (clientesChurn / totalClientes) * 100 : 0

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard de Análise</h1>
        <p>Visão geral das métricas e performance da agência</p>
      </div>

      {/* Filtro de Squad */}
      <div className="dashboard-filtro">
        <span className="filtro-label">Filtrar por Squad:</span>
        <div className="filtro-botoes">
          <button
            className={`btn-filtro ${squadFilter === 'TODOS' ? 'ativo' : ''}`}
            onClick={() => setSquadFilter('TODOS')}
          >
            Todos os Clientes
          </button>
          <button
            className={`btn-filtro ${squadFilter === 'BR' ? 'ativo' : ''}`}
            onClick={() => setSquadFilter('BR')}
          >
            Squad BR
          </button>
          <button
            className={`btn-filtro ${squadFilter === 'USA' ? 'ativo' : ''}`}
            onClick={() => setSquadFilter('USA')}
          >
            Squad USA
          </button>
        </div>
      </div>

      {/* Status Geral */}
      <div className="status-geral">
        <div className="status-card">
          <span className="status-label">Total de Clientes</span>
          <span className="status-value">{totalClientes}</span>
        </div>
        <div className="status-card">
          <span className="status-label">Clientes Ativos</span>
          <span className="status-value status-ativo">{clientesAtivos}</span>
        </div>
        <div className="status-card">
          <span className="status-label">Clientes em Churn</span>
          <span className="status-value status-churn">{clientesChurn}</span>
        </div>
        <div className="status-card">
          <span className="status-label">Taxa de Churn</span>
          <span className="status-value">{taxaChurn.toFixed(1)}%</span>
        </div>
      </div>

      {/* Meta de Churn */}
      <MetasChurn metaAtual={metaChurn} onSalvarMeta={handleSalvarMeta} />

      {/* MRR Principal */}
      <div className="mrr-principal">
        <CardMRR
          titulo="MRR Total"
          valor={mrrData.total}
          subtitulo={`${mrrData.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
          destaque
        />
        <CardMRR
          titulo="MRR Médio por Cliente"
          valor={mrrData.mediaPorCliente}
          subtitulo={`${mrrData.mediaPorCliente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
        />
      </div>

      {/* Gráficos */}
      <div className="graficos-container">
        <GraficoChurn data={churnMensal} meta={metaChurn} />
        <GraficoFee data={feeMensal} />
      </div>

      {/* Cards de MRR por Serviço */}
      <div className="dashboard-section">
        <h2>📈 MRR por Serviço</h2>
        <div className="cards-grid">
          <CardMRR
            titulo="SEO Brasil"
            valor={mrrData.porCategoria.seoBrasil}
            clientes={clientesFiltrados.filter(c => c.status === 'Ativo' && c.servicos.includes('SEO BRASIL')).length}
          />
          <CardMRR
            titulo="SEO USA"
            valor={mrrData.porCategoria.seoUsa}
            clientes={clientesFiltrados.filter(c => c.status === 'Ativo' && c.servicos.includes('SEO EUA')).length}
          />
          <CardMRR
            titulo="SEO Geral"
            valor={mrrData.porCategoria.seoGeral}
            clientes={clientesFiltrados.filter(c => c.status === 'Ativo' && (c.servicos.includes('SEO BRASIL') || c.servicos.includes('SEO EUA'))).length}
          />
          <CardMRR
            titulo="CRM"
            valor={mrrData.porCategoria.crm}
            clientes={clientesFiltrados.filter(c => c.status === 'Ativo' && c.servicos.includes('CRM')).length}
          />
          <CardMRR
            titulo="Assessoria"
            valor={mrrData.porCategoria.assessoria}
            clientes={clientesFiltrados.filter(c => c.status === 'Ativo' && c.servicos.includes('ASSESSORIA')).length}
          />
          <CardMRR
            titulo="Social Mídia"
            valor={mrrData.porCategoria.socialMedia}
            clientes={clientesFiltrados.filter(c => c.status === 'Ativo' && c.servicos.includes('SOCIAL MÍDIA')).length}
          />
          <CardMRR
            titulo="IA"
            valor={mrrData.porCategoria.ia}
            clientes={clientesFiltrados.filter(c => c.status === 'Ativo' && c.servicos.includes('IA')).length}
          />
          <CardMRR
            titulo="Waysales"
            valor={mrrData.porCategoria.waysales}
            clientes={clientesFiltrados.filter(c => c.status === 'Ativo' && c.servicos.includes('WAYSALES')).length}
          />
        </div>
      </div>

      {/* Cards de MRR Tráfego Pago */}
      <div className="dashboard-section">
        <h2>🚀 MRR Tráfego Pago</h2>
        <div className="cards-grid">
          <CardMRR
            titulo="Tráfego Total"
            valor={mrrData.porCategoria.trafegoPago}
            clientes={clientesFiltrados.filter(c => 
              c.status === 'Ativo' && c.servicos.some(s => 
                s.includes('TRÁFEGO PAGO')
              )
            ).length}
          />
          <CardMRR
            titulo="Tráfego Brasil"
            valor={mrrData.porCategoria.trafegoPagoBrasil}
            clientes={clientesFiltrados.filter(c => 
              c.status === 'Ativo' && (
                c.servicos.includes('TRÁFEGO PAGO E-COMMERCE BRASIL') || 
                c.servicos.includes('TRÁFEGO PAGO LEADS BRASIL')
              )
            ).length}
          />
          <CardMRR
            titulo="E-Commerce Brasil"
            valor={mrrData.porCategoria.trafegoPagoBrasilE}
            clientes={clientesFiltrados.filter(c => c.status === 'Ativo' && c.servicos.includes('TRÁFEGO PAGO E-COMMERCE BRASIL')).length}
          />
          <CardMRR
            titulo="Leads Brasil"
            valor={mrrData.porCategoria.trafegoPagoBrasilL}
            clientes={clientesFiltrados.filter(c => c.status === 'Ativo' && c.servicos.includes('TRÁFEGO PAGO LEADS BRASIL')).length}
          />
          <CardMRR
            titulo="Tráfego USA"
            valor={mrrData.porCategoria.trafegoPagoUsaE + mrrData.porCategoria.trafegoPagoUsaL}
            clientes={clientesFiltrados.filter(c => 
              c.status === 'Ativo' && (
                c.servicos.includes('TRÁFEGO PAGO E-COMMERCE USA') || 
                c.servicos.includes('TRÁFEGO PAGO LEADS USA')
              )
            ).length}
          />
          <CardMRR
            titulo="E-Commerce USA"
            valor={mrrData.porCategoria.trafegoPagoUsaE}
            clientes={clientesFiltrados.filter(c => c.status === 'Ativo' && c.servicos.includes('TRÁFEGO PAGO E-COMMERCE USA')).length}
          />
          <CardMRR
            titulo="Leads USA"
            valor={mrrData.porCategoria.trafegoPagoUsaL}
            clientes={clientesFiltrados.filter(c => c.status === 'Ativo' && c.servicos.includes('TRÁFEGO PAGO LEADS USA')).length}
          />
        </div>
      </div>
    </div>
  )
}
