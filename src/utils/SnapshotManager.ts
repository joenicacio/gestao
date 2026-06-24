import { SnapshotMensal } from '../types'
import { ApiClient } from './ApiClient'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export class SnapshotManager {
  static CACHE_KEY = 'snapshots_cache'

  /**
   * Obtém os snapshots mensais (estado congelado por mês) de um período,
   * com fallback para cache local quando o servidor está indisponível.
   */
  static async getSnapshotsRange(mesInicio: string, mesFim: string): Promise<SnapshotMensal[]> {
    try {
      const response = (await ApiClient.getSnapshotsRange(mesInicio, mesFim)) as ApiResponse<SnapshotMensal[]>
      if (response?.success && Array.isArray(response.data)) {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(response.data))
        return response.data
      }
    } catch (error) {
      console.warn('Erro ao obter snapshots do servidor, usando cache local:', error)
    }

    const cached = localStorage.getItem(this.CACHE_KEY)
    if (!cached) return []
    const todos: SnapshotMensal[] = JSON.parse(cached)
    return todos.filter(s => s.mes >= mesInicio && s.mes <= mesFim)
  }

  static async corrigirSnapshot(clienteId: string, mes: string, dados: Partial<SnapshotMensal>): Promise<SnapshotMensal | null> {
    try {
      const response = (await ApiClient.corrigirSnapshot(clienteId, mes, dados)) as ApiResponse<SnapshotMensal>
      return response?.data || null
    } catch (error) {
      console.error('Erro ao corrigir snapshot do mês:', error)
      return null
    }
  }

  /**
   * Verifica se existe pelo menos um snapshot para o mês 'YYYY-MM' informado
   */
  static temDadosParaMes(snapshots: SnapshotMensal[], mesYYYYMM: string): boolean {
    return snapshots.some(s => s.mes === mesYYYYMM)
  }
}
