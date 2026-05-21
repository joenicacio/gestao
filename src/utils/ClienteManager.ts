import { Cliente, HistoricoItem, TipoHistorico, ServicoType } from '../types'
import { ApiClient } from './ApiClient'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export class ClienteManager {
  static STORAGE_KEY = 'clientes_agencia'
  static CACHE_KEY = 'clientes_cache'
  static SYNC_QUEUE_KEY = 'sync_queue'
  static VERSION_KEY = 'clientes_version'
  static CURRENT_VERSION = '1.0.0'
  static IS_ONLINE_KEY = 'is_online'

  private static syncInProgress = false
  private static syncQueue: any[] = []

  static migrateClientesIfNeeded(clientes: any[]): Cliente[] {
    const storedVersion = localStorage.getItem(this.VERSION_KEY)
    
    // Se não houver versão ou for versão 1.0.0, os dados já estão no formato correto
    if (!storedVersion || storedVersion === this.CURRENT_VERSION) {
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION)
      return clientes
    }

    // Adicione aqui migrações futuras se necessário
    // Exemplo de padrão para versão anterior:
    // if (storedVersion === '0.1.0') {
    //   clientes = this.migrateFrom0_1_0(clientes)
    // }

    // Sempre atualizar para versão atual após migração
    localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION)
    return clientes
  }

  /**
   * Obter todos os clientes do servidor, com fallback para cache local
   */
  static async getAllClientes(): Promise<Cliente[]> {
    try {
      const response = (await ApiClient.getClientes()) as ApiResponse<Cliente[]>
      if (response?.success && Array.isArray(response.data)) {
        // Cache local para offline
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(response.data))
        localStorage.setItem(this.IS_ONLINE_KEY, 'true')
        return response.data
      }
    } catch (error) {
      console.warn('Erro ao obter clientes do servidor, usando cache local:', error)
      localStorage.setItem(this.IS_ONLINE_KEY, 'false')
    }

    // Fallback para cache local
    const cached = localStorage.getItem(this.CACHE_KEY)
    return cached ? JSON.parse(cached) : []
  }

  /**
   * Salvar clientes - sincroniza com servidor
   */
  static async saveClientes(clientes: Cliente[]): Promise<void> {
    // Cache local sempre
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(clientes))

    // Tentar sincronizar com servidor
    try {
      await ApiClient.syncClientes(clientes)
      localStorage.setItem(this.IS_ONLINE_KEY, 'true')
    } catch (error) {
      console.warn('Erro ao sincronizar clientes, dados salvos localmente:', error)
      localStorage.setItem(this.IS_ONLINE_KEY, 'false')
    }
  }

  static generateId(): string {
    return `cli_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static generateHistoricoId(): string {
    return `his_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static getCurrentDateTime(): { data: string; hora: string } {
    const now = new Date()
    const data = now.toLocaleDateString('pt-BR')
    const hora = now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
    return { data, hora }
  }

  static criarCliente(
    nome: string,
    squad: 'BR' | 'USA',
    servicos: ServicoType[],
    fee: number,
    status: 'Ativo' | 'Churn',
    dataInicio?: string,
    dataChurn?: string
  ): Cliente {
    const id = this.generateId()
    const { data, hora } = this.getCurrentDateTime()
    const now = new Date().toISOString()

    const tempoContrato = this.calcularTempoContrato(dataInicio, dataChurn)

    const historicoItem: HistoricoItem = {
      id: this.generateHistoricoId(),
      data,
      hora,
      tipo: 'criacao',
      descricao: `Cliente criado com ${servicos.length} serviço(s), Fee: R$ ${fee.toFixed(2)}, Status: ${status}`,
      dadosNovos: { nome, squad, servicos, fee, status, dataInicio, dataChurn }
    }

    return {
      id,
      nome,
      squad,
      servicos,
      fee,
      status,
      dataCreate: now,
      dataUpdate: now,
      dataInicio,
      dataChurn,
      tempoContrato,
      historico: [historicoItem],
      ultimoFee: fee,
      ultimoServicosCount: servicos.length
    }
  }

  static atualizarCliente(
    cliente: Cliente,
    atualizacoes: Partial<Omit<Cliente, 'id' | 'historico' | 'dataCreate' | 'dataUpdate'>>
  ): Cliente {
    const { data, hora } = this.getCurrentDateTime()
    const novoHistorico = [...cliente.historico]

    // Verificar mudanças e registrar no histórico
    if (atualizacoes.nome && atualizacoes.nome !== cliente.nome) {
      novoHistorico.push({
        id: this.generateHistoricoId(),
        data,
        hora,
        tipo: 'edicao',
        descricao: `Nome alterado de "${cliente.nome}" para "${atualizacoes.nome}"`,
        dadosAntigos: { nome: cliente.nome },
        dadosNovos: { nome: atualizacoes.nome }
      })
    }

    if (atualizacoes.squad && atualizacoes.squad !== cliente.squad) {
      novoHistorico.push({
        id: this.generateHistoricoId(),
        data,
        hora,
        tipo: 'edicao',
        descricao: `Squad alterado de "${cliente.squad}" para "${atualizacoes.squad}"`,
        dadosAntigos: { squad: cliente.squad },
        dadosNovos: { squad: atualizacoes.squad }
      })
    }

    if (atualizacoes.fee && atualizacoes.fee !== cliente.fee) {
      const diferenca = atualizacoes.fee - cliente.fee
      const percentual = ((diferenca / cliente.fee) * 100).toFixed(2)
      const direcao = diferenca > 0 ? 'aumentou' : 'diminuiu'
      
      novoHistorico.push({
        id: this.generateHistoricoId(),
        data,
        hora,
        tipo: 'fee_alterado',
        descricao: `Fee ${direcao} de R$ ${cliente.fee.toFixed(2)} para R$ ${atualizacoes.fee.toFixed(2)} (${percentual}%)`,
        dadosAntigos: { fee: cliente.fee },
        dadosNovos: { fee: atualizacoes.fee }
      })
    }

    if (atualizacoes.status && atualizacoes.status !== cliente.status) {
      novoHistorico.push({
        id: this.generateHistoricoId(),
        data,
        hora,
        tipo: 'status_alterado',
        descricao: `Status alterado de "${cliente.status}" para "${atualizacoes.status}"`,
        dadosAntigos: { status: cliente.status },
        dadosNovos: { status: atualizacoes.status }
      })
    }

    if (atualizacoes.servicos) {
      const servicosAntigos = cliente.servicos
      const servicosNovos = atualizacoes.servicos

      // Serviços adicionados
      const adicionados = servicosNovos.filter(s => !servicosAntigos.includes(s))
      adicionados.forEach(servico => {
        novoHistorico.push({
          id: this.generateHistoricoId(),
          data,
          hora,
          tipo: 'servico_adicionado',
          descricao: `Serviço adicionado: ${servico}`,
          dadosNovos: { servico }
        })
      })

      // Serviços removidos
      const removidos = servicosAntigos.filter(s => !servicosNovos.includes(s))
      removidos.forEach(servico => {
        novoHistorico.push({
          id: this.generateHistoricoId(),
          data,
          hora,
          tipo: 'servico_removido',
          descricao: `Serviço removido: ${servico}`,
          dadosAntigos: { servico }
        })
      })
    }

    if (atualizacoes.dataInicio && atualizacoes.dataInicio !== cliente.dataInicio) {
      novoHistorico.push({
        id: this.generateHistoricoId(),
        data,
        hora,
        tipo: 'data_inicio_alterada',
        descricao: `Data de início alterada de "${cliente.dataInicio || 'N/A'}" para "${atualizacoes.dataInicio}"`,
        dadosAntigos: { dataInicio: cliente.dataInicio },
        dadosNovos: { dataInicio: atualizacoes.dataInicio }
      })
    }

    if (atualizacoes.dataChurn && atualizacoes.dataChurn !== cliente.dataChurn) {
      novoHistorico.push({
        id: this.generateHistoricoId(),
        data,
        hora,
        tipo: 'data_churn_alterada',
        descricao: `Data de churn alterada de "${cliente.dataChurn || 'N/A'}" para "${atualizacoes.dataChurn}"`,
        dadosAntigos: { dataChurn: cliente.dataChurn },
        dadosNovos: { dataChurn: atualizacoes.dataChurn }
      })
    }

    const tempoContrato = atualizacoes.dataInicio || atualizacoes.dataChurn
      ? this.calcularTempoContrato(atualizacoes.dataInicio || cliente.dataInicio, atualizacoes.dataChurn || cliente.dataChurn)
      : cliente.tempoContrato

    return {
      ...cliente,
      ...atualizacoes,
      tempoContrato,
      dataUpdate: new Date().toISOString(),
      historico: novoHistorico,
      ultimoFee: cliente.fee,
      ultimoServicosCount: cliente.servicos.length
    }
  }

  static calcularTempoContrato(dataInicio?: string, dataChurn?: string): number | undefined {
    if (!dataInicio) return undefined

    try {
      const inicio = new Date(dataInicio)
      const fim = dataChurn ? new Date(dataChurn) : new Date()
      
      const diffMs = fim.getTime() - inicio.getTime()
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      return diffDias >= 0 ? diffDias : undefined
    } catch {
      return undefined
    }
  }

  static calcularVariacao(novo: number, antigo: number): { tipo: 'aumento' | 'diminuicao' | 'sem_variacao'; percentual: number; diferenca: number } {
    if (novo === antigo) {
      return { tipo: 'sem_variacao', percentual: 0, diferenca: 0 }
    }
    
    const diferenca = novo - antigo
    const percentual = Math.abs((diferenca / antigo) * 100)
    const tipo = novo > antigo ? 'aumento' : 'diminuicao'

    return { tipo, percentual, diferenca }
  }

  /**
   * Método de exemplo para migração de versão anterior
   * Use este padrão quando precisar atualizar a estrutura de dados
   * 
   * Exemplo de migração de v0.1.0 para v1.0.0:
   * - Adicionar campos obrigatórios que faltavam
   * - Transformar estrutura de dados
   * - Corrigir tipos inválidos
   */
  private static migrateFrom0_1_0(clientes: any[]): Cliente[] {
    return clientes.map(cliente => ({
      ...cliente,
      // Adicionar campos padrão se não existirem
      ultimoFee: cliente.ultimoFee || cliente.fee,
      ultimoServicosCount: cliente.ultimoServicosCount || cliente.servicos?.length || 0,
      historico: cliente.historico || [],
      tempoContrato: cliente.tempoContrato || undefined,
      // Garantir que campos obrigatórios existem
      dataCreate: cliente.dataCreate || new Date().toISOString(),
      dataUpdate: cliente.dataUpdate || new Date().toISOString(),
      status: cliente.status || 'Ativo'
    }))
  }
}
