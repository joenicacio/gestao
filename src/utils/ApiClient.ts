// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://newaytemporario.com/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt < API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt < API_CONFIG.RETRY_ATTEMPTS - 1) {
          await new Promise(resolve =>
            setTimeout(resolve, API_CONFIG.RETRY_DELAY * Math.pow(2, attempt))
          )
        }
      }
    }

    throw lastError || new Error('Erro desconhecido na requisição')
  }

  static async getClientes() {
    return this.request('/api/clientes')
  }

  static async getClienteById(id: string) {
    return this.request(`/api/clientes/${id}`)
  }

  static async createCliente(cliente: any) {
    return this.request('/api/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    })
  }

  static async updateCliente(id: string, cliente: any) {
    return this.request(`/api/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cliente),
    })
  }

  static async deleteCliente(id: string) {
    return this.request(`/api/clientes/${id}`, {
      method: 'DELETE',
    })
  }

  static async syncClientes(clientes: any[]) {
    return this.request('/api/clientes/batch/sync', {
      method: 'POST',
      body: JSON.stringify({ clientes }),
    })
  }

  static async healthCheck() {
    return this.request('/health')
  }

  static async getSnapshotsRange(mesInicio: string, mesFim: string) {
    return this.request(`/api/snapshots?mesInicio=${mesInicio}&mesFim=${mesFim}`)
  }

  static async capturarSnapshots() {
    return this.request('/api/snapshots/capturar', { method: 'POST' })
  }

  static async corrigirSnapshot(clienteId: string, mes: string, dados: any) {
    return this.request(`/api/snapshots/${clienteId}/${mes}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    })
  }
}
