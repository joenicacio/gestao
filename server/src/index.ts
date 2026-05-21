import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { Database, Cliente, HistoricoItem } from './database.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const db = Database.getInstance()
const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

// Socket.io com CORS configurado
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    credentials: true
  }
})

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}))
app.use(express.json())

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ==================== ROUTES ====================

// GET /api/clientes - Obter todos os clientes
app.get('/api/clientes', async (req: Request, res: Response) => {
  try {
    const clientes = await db.getAllClientes()
    res.json({ success: true, data: clientes })
  } catch (error) {
    console.error('Erro ao obter clientes:', error)
    res.status(500).json({ success: false, error: 'Erro ao obter clientes' })
  }
})

// GET /api/clientes/:id - Obter um cliente específico
app.get('/api/clientes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const cliente = await db.getClienteById(id)
    if (!cliente) {
      return res.status(404).json({ success: false, error: 'Cliente não encontrado' })
    }
    res.json({ success: true, data: cliente })
  } catch (error) {
    console.error('Erro ao obter cliente:', error)
    res.status(500).json({ success: false, error: 'Erro ao obter cliente' })
  }
})

// POST /api/clientes - Criar novo cliente
app.post('/api/clientes', async (req: Request, res: Response) => {
  try {
    const { nome, squad, servicos, fee, status, dataCreate, dataUpdate, historico } = req.body

    if (!nome || !squad || !servicos || fee === undefined || !status) {
      return res.status(400).json({
        success: false,
        error: 'Dados incompletos'
      })
    }

    const novoCliente: Cliente = {
      id: `cli_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nome,
      squad,
      servicos,
      fee,
      status,
      dataCreate,
      dataUpdate,
      historico
    }

    const clienteCriado = await db.createCliente(novoCliente)
    
    // Notificar todos os clientes conectados sobre a novo cliente
    io.emit('cliente:created', clienteCriado)
    
    res.status(201).json({ success: true, data: clienteCriado })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    res.status(500).json({ success: false, error: 'Erro ao criar cliente' })
  }
})

// PUT /api/clientes/:id - Atualizar cliente
app.put('/api/clientes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const clienteAtualizado = req.body

    const clienteExistente = await db.getClienteById(id)
    if (!clienteExistente) {
      return res.status(404).json({ success: false, error: 'Cliente não encontrado' })
    }

    const atualizado = await db.updateCliente(id, clienteAtualizado)
    
    // Notificar todos os clientes conectados sobre a atualização
    io.emit('cliente:updated', atualizado)
    
    res.json({ success: true, data: atualizado })
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    res.status(500).json({ success: false, error: 'Erro ao atualizar cliente' })
  }
})

// DELETE /api/clientes/:id - Deletar cliente
app.delete('/api/clientes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const clienteExistente = await db.getClienteById(id)
    if (!clienteExistente) {
      return res.status(404).json({ success: false, error: 'Cliente não encontrado' })
    }

    await db.deleteCliente(id)
    
    // Notificar todos os clientes conectados sobre a exclusão
    io.emit('cliente:deleted', { id })
    
    res.json({ success: true, message: 'Cliente deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    res.status(500).json({ success: false, error: 'Erro ao deletar cliente' })
  }
})

// POST /api/clientes/batch/sync - Sincronizar múltiplos clientes (importação/atualização)
app.post('/api/clientes/batch/sync', async (req: Request, res: Response) => {
  try {
    const { clientes } = req.body

    if (!Array.isArray(clientes)) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos: esperado array de clientes'
      })
    }

    const clientesSincronizados: Cliente[] = []

    for (const cliente of clientes) {
      if (cliente.id) {
        // Atualizar cliente existente
        const atualizado = await db.updateCliente(cliente.id, cliente)
        if (atualizado) {
          clientesSincronizados.push(atualizado)
        }
      } else {
        // Criar novo cliente
        const criado = await db.createCliente({
          ...cliente,
          id: `cli_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
        clientesSincronizados.push(criado)
      }
    }

    res.json({ success: true, data: clientesSincronizados })
  } catch (error) {
    console.error('Erro ao sincronizar clientes:', error)
    res.status(500).json({ success: false, error: 'Erro ao sincronizar clientes' })
  }
})

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// ==================== WEBSOCKET EVENTS ====================

// Gerenciar conexões WebSocket
io.on('connection', (socket) => {
  console.log(`👤 Usuário conectado: ${socket.id}`)
  
  // Notificar todos sobre um novo usuário conectado
  io.emit('usuarios:contagem', io.engine.clientsCount)

  // Quando um usuário desconectar
  socket.on('disconnect', () => {
    console.log(`👤 Usuário desconectado: ${socket.id}`)
    io.emit('usuarios:contagem', io.engine.clientsCount)
  })
})

// Iniciar servidor HTTP (que suporta WebSocket)
async function startServer() {
  try {
    // Testar conexão e inicializar banco de dados
    const connected = await db.testConnection()
    if (!connected) {
      throw new Error('Falha ao conectar ao banco de dados')
    }

    await db.initialize()

    httpServer.listen(PORT, () => {
      console.log(`✅ Servidor rodando em http://localhost:${PORT}`)
      console.log(`🔗 CORS habilitado para: ${CORS_ORIGIN}`)
      console.log(`🗄️  Database: PostgreSQL Neon`)
      console.log(`🔌 WebSocket (Socket.io) habilitado`)
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Encerrando servidor...')
      await db.close()
      httpServer.close(() => {
        console.log('Servidor encerrado')
        process.exit(0)
      })
    })
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error)
    process.exit(1)
  }
}

startServer()
