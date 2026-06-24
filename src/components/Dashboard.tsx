import React, { useState, useMemo } from 'react'
import { Cliente, SnapshotMensal } from '../types'
import { DashboardManager, DateRangeFilter } from '../utils/DashboardManager'
import { MetasChurn } from './MetasChurn'
import { CardMRR } from './CardMRR'
import { GraficoChurn } from './GraficoChurn'
import { GraficoFee } from './GraficoFee'

interface DashboardProps {
  clientes: Cliente[]
  snapshots?: SnapshotMensal[]
}

export function Dashboard({ clientes, snapshots = [] }: DashboardProps) {
  const [metaChurn, setMetaChurn] = useState<number>(DashboardManager.obterMetaChurn())
  const [squadFilter, setSquadFilter] = useState<'BR' | 'USA' | 'TODOS'>('TODOS')
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')

  // Criar DateRangeFilter baseado nos valores de entrada
  const dateRange: DateRangeFilter = useMemo(() => ({
    dataInicio: dataInicio ? new Date(dataInicio) : undefined,
    dataFim: dataFim ? new Date(dataFim) : undefined
  }), [dataInicio, dataFim])

  const handleResetarFiltro = () => {
    setDataInicio('')
    setDataFim('')
  }

  const mrrData = useMemo(() => DashboardManager.calcularMRR(clientes, squadFilter), [clientes, squadFilter])

  // Meses do período em formato YYYY-MM, usados para casar com os snapshots mensais
  const mesesYYYYMM = useMemo(
    () => dateRange?.dataInicio || dateRange?.dataFim
      ? DashboardManager.getMesesPersonalizadosYYYYMM(dateRange?.dataInicio, dateRange?.dataFim)
      : DashboardManager.getUltimosMesesYYYYMM(6),
    [dateRange]
  )

  // Mês a mês: usa o estado congelado (snapshot) quando disponível; cai no cálculo
  // ao vivo (estado atual do cliente) só para meses ainda sem snapshot capturado.
  const churnMensal = useMemo(() => {
    const aoVivo = DashboardManager.calcularChurnMensalPersonalizado(clientes, squadFilter, dateRange)
    const deSnapshot = DashboardManager.calcularChurnMensalDeSnapshots(snapshots, mesesYYYYMM, squadFilter)
    return DashboardManager.mesclarComFallback(mesesYYYYMM, deSnapshot, aoVivo, snapshots)
  }, [clientes, snapshots, squadFilter, dateRange, mesesYYYYMM])

  const feeMensal = useMemo(() => {
    const aoVivo = DashboardManager.calcularFeeMensalPersonalizado(clientes, squadFilter, dateRange)
    const deSnapshot = DashboardManager.calcularFeeMensalDeSnapshots(snapshots, mesesYYYYMM, squadFilter)
    return DashboardManager.mesclarComFallback(mesesYYYYMM, deSnapshot, aoVivo, snapshots)
  }, [clientes, snapshots, squadFilter, dateRange, mesesYYYYMM])

  const mrrDataPersonalizado = useMemo(() => DashboardManager.calcularMRRPersonalizado(clientes, squadFilter, dateRange), [clientes, squadFilter, dateRange])

  const handleSalvarMeta = (novaMeta: number) => {
    setMetaChurn(novaMeta)
    DashboardManager.salvarMetaChurn(novaMeta)
  }

  // Filtrar clientes por squad
  const clientesFiltrados = squadFilter === 'TODOS' 
    ? clientes 
    : clientes.filter(c => c.squad === squadFilter)

  const clientesAtivos = DashboardManager.contaClientesAtivosNoPeriodo(clientesFiltrados, dateRange)
  const clientesChurn = DashboardManager.contaClientesChurnNoPeriodo(clientesFiltrados, dateRange)
  const totalClientes = (dateRange?.dataInicio || dateRange?.dataFim) ? (clientesAtivos + clientesChurn) : clientesFiltrados.length
  const taxaChurn = totalClientes > 0 ? (clientesChurn / totalClientes) * 100 : 0

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard de Análise</h1>
        <p>Visão geral das métricas e performance da agência</p>
      </div>

      {/* Filtros */}
      <div className="dashboard-filtros">
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

        {/* Filtro de Data */}
        <div className="dashboard-filtro-data">
          <span className="filtro-label">Filtrar por Período:</span>
          <div className="filtro-data-inputs">
            <div className="input-group">
              <label htmlFor="data-inicio">Data Inicial:</label>
              <input
                id="data-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="data-fim">Data Final:</label>
              <input
                id="data-fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            {(dataInicio || dataFim) && (
              <button 
                className="btn-resetar-filtro"
                onClick={handleResetarFiltro}
              >
                Limpar Filtro
              </button>
            )}
          </div>
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
          valor={mrrDataPersonalizado.total}
          subtitulo={`${mrrData.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
          destaque
        />
        <CardMRR
          titulo="MRR Médio por Cliente"
          valor={mrrDataPersonalizado.mediaPorCliente}
          subtitulo={`${mrrDataPersonalizado.mediaPorCliente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
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
            valor={mrrDataPersonalizado.porCategoria.seoBrasil}
            clientes={clientesFiltrados.filter(c => DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && c.servicos.includes('SEO BRASIL')).length}
          />
          <CardMRR
            titulo="SEO USA"
            valor={mrrDataPersonalizado.porCategoria.seoUsa}
            clientes={clientesFiltrados.filter(c => DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && c.servicos.includes('SEO EUA')).length}
          />
          <CardMRR
            titulo="SEO Geral"
            valor={mrrDataPersonalizado.porCategoria.seoGeral}
            clientes={clientesFiltrados.filter(c => DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && (c.servicos.includes('SEO BRASIL') || c.servicos.includes('SEO EUA'))).length}
          />
          <CardMRR
            titulo="CRM"
            valor={mrrDataPersonalizado.porCategoria.crm}
            clientes={clientesFiltrados.filter(c => DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && c.servicos.includes('CRM')).length}
          />
          <CardMRR
            titulo="Assessoria"
            valor={mrrDataPersonalizado.porCategoria.assessoria}
            clientes={clientesFiltrados.filter(c => DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && c.servicos.includes('ASSESSORIA')).length}
          />
          <CardMRR
            titulo="Social Mídia"
            valor={mrrDataPersonalizado.porCategoria.socialMedia}
            clientes={clientesFiltrados.filter(c => DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && c.servicos.includes('SOCIAL MÍDIA')).length}
          />
          <CardMRR
            titulo="IA"
            valor={mrrDataPersonalizado.porCategoria.ia}
            clientes={clientesFiltrados.filter(c => DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && c.servicos.includes('IA')).length}
          />
          <CardMRR
            titulo="Waysales"
            valor={mrrDataPersonalizado.porCategoria.waysales}
            clientes={clientesFiltrados.filter(c => DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && c.servicos.includes('WAYSALES')).length}
          />
        </div>
      </div>

      {/* Cards de MRR Tráfego Pago */}
      <div className="dashboard-section">
        <h2>🚀 MRR Tráfego Pago</h2>
        <div className="cards-grid">
          <CardMRR
            titulo="Tráfego Total"
            valor={mrrDataPersonalizado.porCategoria.trafegoPago}
            clientes={clientesFiltrados.filter(c => 
              DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && c.servicos.some(s => 
                s.includes('TRÁFEGO PAGO')
              )
            ).length}
          />
          <CardMRR
            titulo="Tráfego Brasil"
            valor={mrrDataPersonalizado.porCategoria.trafegoPagoBrasil}
            clientes={clientesFiltrados.filter(c => 
              DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && (
                c.servicos.includes('TRÁFEGO PAGO E-COMMERCE BRASIL') || 
                c.servicos.includes('TRÁFEGO PAGO LEADS BRASIL')
              )
            ).length}
          />
          <CardMRR
            titulo="E-Commerce Brasil"
            valor={mrrDataPersonalizado.porCategoria.trafegoPagoBrasilE}
            clientes={clientesFiltrados.filter(c => DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && c.servicos.includes('TRÁFEGO PAGO E-COMMERCE BRASIL')).length}
          />
          <CardMRR
            titulo="Leads Brasil"
            valor={mrrDataPersonalizado.porCategoria.trafegoPagoBrasilL}
            clientes={clientesFiltrados.filter(c => DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && c.servicos.includes('TRÁFEGO PAGO LEADS BRASIL')).length}
          />
          <CardMRR
            titulo="Tráfego USA"
            valor={mrrDataPersonalizado.porCategoria.trafegoPagoUsaE + mrrDataPersonalizado.porCategoria.trafegoPagoUsaL}
            clientes={clientesFiltrados.filter(c => 
              DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && (
                c.servicos.includes('TRÁFEGO PAGO E-COMMERCE USA') || 
                c.servicos.includes('TRÁFEGO PAGO LEADS USA')
              )
            ).length}
          />
          <CardMRR
            titulo="E-Commerce USA"
            valor={mrrDataPersonalizado.porCategoria.trafegoPagoUsaE}
            clientes={clientesFiltrados.filter(c => DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && c.servicos.includes('TRÁFEGO PAGO E-COMMERCE USA')).length}
          />
          <CardMRR
            titulo="Leads USA"
            valor={mrrDataPersonalizado.porCategoria.trafegoPagoUsaL}
            clientes={clientesFiltrados.filter(c => DashboardManager.clienteAtivoNoPeriodo(c, dateRange) && c.servicos.includes('TRÁFEGO PAGO LEADS USA')).length}
          />
        </div>
      </div>
    </div>
  )
}
