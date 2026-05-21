import { io, Socket } from 'socket.io-client'
import { Cliente } from '../types'

interface WebSocketCallbacks {
  onClienteCreated?: (cliente: Cliente) => void
  onClienteUpdated?: (cliente: Cliente) => void
  onClienteDeleted?: (id: string) => void
  onUsuariosContagem?: (contagem: number) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export class WebSocketManager {
  private static socket: Socket | null = null
  private static callbacks: WebSocketCallbacks = {}

  /**
   * Conectar ao servidor WebSocket
   */
  static connect(callbacks: WebSocketCallbacks = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'
        
        this.socket = io(serverUrl, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        })

        this.callbacks = callbacks

        // Evento de conexão bem-sucedida
        this.socket.on('connect', () => {
          console.log('✅ WebSocket conectado')
          if (this.callbacks.onConnect) {
            this.callbacks.onConnect()
          }
          resolve()
        })

        // Evento de desconexão
        this.socket.on('disconnect', () => {
          console.log('❌ WebSocket desconectado')
          if (this.callbacks.onDisconnect) {
            this.callbacks.onDisconnect()
          }
        })

        // Evento: novo cliente criado
        this.socket.on('cliente:created', (cliente: Cliente) => {
          console.log('📝 Novo cliente criado:', cliente)
          if (this.callbacks.onClienteCreated) {
            this.callbacks.onClienteCreated(cliente)
          }
        })

        // Evento: cliente atualizado
        this.socket.on('cliente:updated', (cliente: Cliente) => {
          console.log('✏️ Cliente atualizado:', cliente)
          if (this.callbacks.onClienteUpdated) {
            this.callbacks.onClienteUpdated(cliente)
          }
        })

        // Evento: cliente deletado
        this.socket.on('cliente:deleted', (data: { id: string }) => {
          console.log('🗑️ Cliente deletado:', data.id)
          if (this.callbacks.onClienteDeleted) {
            this.callbacks.onClienteDeleted(data.id)
          }
        })

        // Evento: contagem de usuários atualizada
        this.socket.on('usuarios:contagem', (contagem: number) => {
          console.log(`👥 Usuários online: ${contagem}`)
          if (this.callbacks.onUsuariosContagem) {
            this.callbacks.onUsuariosContagem(contagem)
          }
        })

        // Tratamento de erros
        this.socket.on('connect_error', (error) => {
          console.error('Erro de conexão WebSocket:', error)
          reject(error)
        })
      } catch (error) {
        console.error('Erro ao conectar WebSocket:', error)
        reject(error)
      }
    })
  }

  /**
   * Desconectar do servidor WebSocket
   */
  static disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log('WebSocket desconectado')
    }
  }

  /**
   * Verificar se está conectado
   */
  static isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * Obter ID da sessão WebSocket
   */
  static getSocketId(): string | null {
    return this.socket?.id ?? null
  }

  /**
   * Atualizar callbacks em tempo real
   */
  static setCallbacks(callbacks: WebSocketCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }
}
