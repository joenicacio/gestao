# 🔌 Referência Técnica - WebSocket & Socket.io

## Visão Geral da Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                     INTERNET                                 │
└──────────────────────────────────────────────────────────────┘
         │                        │                        │
         │                        │                        │
    ┌────▼────┐            ┌─────▼────┐            ┌─────▼────┐
    │ Browser  │            │ Browser  │            │ Browser  │
    │   User A │            │   User B │            │   User C │
    └────┬────┘            └────┬─────┘            └────┬─────┘
         │                       │                      │
         │   Socket.io Client    │   Socket.io Client   │
         │                       │                      │
         └──────────┬────────────┴──────────┬───────────┘
                    │                       │
             WebSocket Connection    WebSocket Connection
                    │                       │
                    │    ┌──────────────────┘
                    └───▶│
                        ┌┴────────────────────────────────┐
                        │  Server (Express + Socket.io)   │
                        │  Port: 3001                     │
                        │                                │
                        │  io.emit('cliente:created')    │
                        │  io.emit('cliente:updated')    │
                        │  io.emit('cliente:deleted')    │
                        │  io.emit('usuarios:contagem')  │
                        └┬────────────────────────────────┘
                         │
                        ┌┴──────────────────┐
                        │   Database        │
                        │   server/db.json  │
                        └───────────────────┘
```

---

## Socket.io Events

### Eventos Emitidos pelo Servidor

#### 1. **cliente:created**
Emitido quando um novo cliente é criado

```typescript
io.emit('cliente:created', clienteObj)

// Payload
{
  id: 'cli_timestamp_random',
  nome: 'Novo Cliente',
  squad: 'BR',
  servicos: ['SEO BRASIL', 'CRM'],
  fee: 5000,
  status: 'Ativo',
  // ... outros campos
}
```

#### 2. **cliente:updated**
Emitido quando um cliente existente é atualizado

```typescript
io.emit('cliente:updated', clienteAtualizado)

// Payload - objeto Cliente completo com as alterações
```

#### 3. **cliente:deleted**
Emitido quando um cliente é deletado

```typescript
io.emit('cliente:deleted', { id: 'cli_xyz' })

// Payload
{ id: 'cli_xyz' }
```

#### 4. **usuarios:contagem**
Emitido quando um usuário conecta ou desconecta

```typescript
io.emit('usuarios:contagem', count)

// Payload - número inteiro (ex: 3)
```

---

## Como Socket.io Funciona

### Fluxo de Conexão

```javascript
// Cliente (WebSocketManager.ts)
const socket = io('http://localhost:3001', {
  reconnection: true,           // Reconecta automaticamente
  reconnectionDelay: 1000,      // Espera 1s antes de reconectar
  reconnectionDelayMax: 5000,   // Máximo de 5s entre tentativas
  reconnectionAttempts: 5       // Tenta 5 vezes
})

// Eventos de Conexão
socket.on('connect', () => {
  console.log('Conectado ao servidor')
  console.log('Socket ID:', socket.id)
})

socket.on('disconnect', () => {
  console.log('Desconectado do servidor')
})

socket.on('connect_error', (error) => {
  console.error('Erro de conexão:', error)
})
```

### Fluxo de Dados

```javascript
// Servidor (Express)
app.post('/api/clientes', (req, res) => {
  // 1. Cria cliente
  const clienteCriado = db.createCliente(novoCliente)
  
  // 2. Envia para todos os clientes conectados
  io.emit('cliente:created', clienteCriado)
  
  // 3. Responde HTTP
  res.status(201).json({ success: true, data: clienteCriado })
})

// Cliente recebe o evento
socket.on('cliente:created', (cliente) => {
  // 4. Atualiza o estado React
  setClientes(prev => [...prev, cliente])
  
  // 5. UI re-renderiza automaticamente
})
```

---

## Configuração Socket.io

### Servidor (server/src/index.ts)

```typescript
import { Server as SocketIOServer } from 'socket.io'
import { createServer } from 'http'

// Criar servidor HTTP (necessário para WebSocket)
const httpServer = createServer(app)

// Criar instância Socket.io com CORS
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: 'http://localhost:5173',  // Aceita do frontend
    credentials: true
  }
})

// Gerenciar conexões
io.on('connection', (socket) => {
  console.log(`Conectado: ${socket.id}`)
  
  socket.on('disconnect', () => {
    console.log(`Desconectado: ${socket.id}`)
  })
})

// Emitir eventos
io.emit('cliente:created', novoCliente)

// Iniciar servidor
httpServer.listen(3001)
```

### Cliente (src/utils/WebSocketManager.ts)

```typescript
import { io } from 'socket.io-client'

class WebSocketManager {
  private static socket: Socket | null = null

  static connect(callbacks) {
    return new Promise((resolve, reject) => {
      const socket = io('http://localhost:3001', {
        reconnection: true,
        reconnectionDelay: 1000
      })

      // Listeners
      socket.on('cliente:created', callbacks.onClienteCreated)
      socket.on('cliente:updated', callbacks.onClienteUpdated)
      socket.on('cliente:deleted', callbacks.onClienteDeleted)
      socket.on('usuarios:contagem', callbacks.onUsuariosContagem)
      
      socket.on('connect', () => {
        this.socket = socket
        resolve()
      })

      socket.on('connect_error', reject)
    })
  }

  static disconnect() {
    this.socket?.disconnect()
  }
}
```

---

## Fluxo Detalhado de Uma Operação

### Criar Cliente - Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                              │
│    User A clica "Adicionar novo cliente"                    │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│ 2. REACT HANDLER                                            │
│    handleAdicionarCliente(dados)                            │
│    - Cria objeto Cliente                                    │
│    - Chama ApiClient.createCliente()                        │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│ 3. HTTP REQUEST (ApiClient)                                 │
│    POST http://localhost:3001/api/clientes                  │
│    Content-Type: application/json                           │
│    Body: { nome, squad, servicos, fee, status, ... }        │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│ 4. EXPRESS HANDLER (Server)                                 │
│    app.post('/api/clientes', (req, res) => {                │
│      const clienteCriado = db.createCliente(req.body)       │
│      res.json({ success: true, data: clienteCriado })       │
│    })                                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│ 5. WEBSOCKET BROADCAST                                      │
│    io.emit('cliente:created', clienteCriado)                │
│                                                              │
│    Envia para TODOS os clientes conectados:                 │
│    - User A (que criou)                                     │
│    - User B                                                 │
│    - User C                                                 │
│    - ... qualquer um conectado                              │
└────────────────┬─────────────┬──────────────┬───────────────┘
                 │             │              │
        ┌────────▼──┐  ┌───────▼──┐  ┌──────▼────┐
        │ User A    │  │ User B   │  │ User C    │
        │ Socket    │  │ Socket   │  │ Socket    │
        │ listener  │  │ listener │  │ listener  │
        └────────┬──┘  └────┬─────┘  └──────┬────┘
                 │          │               │
        ┌────────▼──────────▼───────────────▼────┐
        │ 6. REACT STATE UPDATE                  │
        │    onClienteCreated(cliente)           │
        │    setClientes(prev => [                │
        │      ...prev,                          │
        │      cliente  ← novo cliente aparece   │
        │    ])                                  │
        └────────┬─────────────────────────────┬─┘
                 │                             │
        ┌────────▼──┐                 ┌───────▼──┐
        │ User A UI │                 │ User B UI│
        │ re-render │                 │ re-render│
        │ novo      │                 │ novo     │
        │ cliente   │                 │ cliente  │
        │ visível   │                 │ visível  │
        └───────────┘                 └──────────┘
```

---

## Reconexão Automática

O Socket.io implementa **exponential backoff** para reconexões:

```
Tentativa 1: aguarda 1s
Tentativa 2: aguarda 2s (1s * 2^1)
Tentativa 3: aguarda 4s (1s * 2^2)
Tentativa 4: aguarda 5s (máximo)
Tentativa 5: aguarda 5s (máximo)
```

Depois, para de tentar (5 tentativas máximo).

---

## Tratamento de Erros

### Erro de Conexão
```typescript
socket.on('connect_error', (error) => {
  console.error('Não conseguiu conectar:', error)
  // Fallback: usar localStorage
  useLocalStorage()
})
```

### Timeout de Request
```typescript
const response = await ApiClient.createCliente(cliente)
  .catch(error => {
    console.error('Erro ao enviar:', error)
    // Adicionar localmente mesmo assim
    return null
  })
```

### Desconexão Inesperada
```typescript
socket.on('disconnect', () => {
  console.log('Servidor desconectou')
  setWsConectado(false)
  // Socket.io vai tentar reconectar automaticamente
})
```

---

## Performance e Escalabilidade

### Limitações Atuais
- ✅ Suporta até ~1000 conexões por servidor
- ✅ Broadcasting instantâneo para todos
- ✅ Sem latência perceptível em rede local

### Para Escalar em Produção
```bash
# 1. Usar Redis adapter para múltiplos servidores
npm install @socket.io/redis-adapter

# 2. Implementar em cluster com load balancer
# 3. Usar sticky sessions (importante!)
# 4. Monitorar com ferramentas como PM2
```

---

## Debug e Monitoramento

### Ver Logs no Console
```javascript
// Browser DevTools
localStorage.debug = 'socket.io-client:socket'
```

### Ver Conexões no Servidor
```bash
# Ver quantos clientes estão conectados
io.engine.clientsCount

# Ver ID de cada cliente
io.sockets.sockets.forEach(socket => {
  console.log(socket.id)
})
```

### Teste de Latência
```javascript
socket.emit('ping', () => {
  console.log('Pong recebido')
})
```

---

## Comparação com Alternativas

| Feature | Socket.io | WebSocket Puro | HTTP Polling |
|---------|-----------|-----------------|--------------|
| Real-time | ✅ | ✅ | ❌ (delay) |
| Fallback | ✅ Auto | ❌ Manual | ✅ Auto |
| Reconexão | ✅ Auto | ❌ Manual | ✅ Auto |
| Overhead | Médio | Baixo | Alto |
| Complexidade | Média | Alta | Baixa |

**Conclusão**: Socket.io é a melhor escolha para aplicações real-time que precisam de confiabilidade.

---

## Recursos Úteis

- [Socket.io Docs](https://socket.io/docs/)
- [WebSocket MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Socket.io Server API](https://socket.io/docs/v4/server-api/)
- [Socket.io Client API](https://socket.io/docs/v4/client-api/)

---

**Versões Utilizadas**
- socket.io: ^4.7.2
- socket.io-client: ^4.7.2
- Express: ^4.18.2
- React: ^18.2.0
