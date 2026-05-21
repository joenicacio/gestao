# Sistema de Colaboração em Tempo Real

## 📡 Funcionalidades Implementadas

### Sincronização em Tempo Real com WebSockets

O sistema agora suporta colaboração **em tempo real** entre múltiplos usuários usando **Socket.io**:

✅ **Quando um usuário cria um cliente**, todos os outros usuários conectados recebem a atualização instantaneamente  
✅ **Quando um usuário edita um cliente**, a alteração é refletida para todos em tempo real  
✅ **Quando um usuário deleta um cliente**, a exclusão é propagada para todas as abas/navegadores abertos  
✅ **Contagem de usuários online** - Cada usuário pode ver quantos outros usuários estão acessando o sistema  
✅ **Status de conexão** - Indicador visual mostrando se está conectado ao servidor de sincronização  

---

## 🏗️ Arquitetura

### Backend (Node.js + Express + Socket.io)
**Arquivo:** `server/src/index.ts`

- Servidor HTTP com suporte a WebSocket (Socket.io)
- Eventos emitidos:
  - `cliente:created` - quando um novo cliente é criado
  - `cliente:updated` - quando um cliente é atualizado
  - `cliente:deleted` - quando um cliente é deletado
  - `usuarios:contagem` - atualiza o número de usuários online

### Frontend (React + Socket.io-client)
**Arquivo:** `src/utils/WebSocketManager.ts`

- Cliente WebSocket que se conecta automaticamente ao servidor
- Listeners para eventos de sincronização em tempo real
- Gerenciar reconexão automática em caso de desconexão
- Configurável com callbacks para cada tipo de evento

### Integração com App.tsx

- **handleAdicionarCliente**: Cria cliente e envia para o servidor (dispara `cliente:created`)
- **handleAtualizarCliente**: Atualiza cliente no servidor (dispara `cliente:updated`)
- **handleDeletarCliente**: Deleta cliente do servidor (dispara `cliente:deleted`)
- Listeners WebSocket atualizam o estado React automaticamente

---

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
# Frontend
npm install

# Backend
cd server && npm install && cd ..
```

### 2. Iniciar o Servidor de Desenvolvimento

```bash
# Opção 1: Rodar frontend e backend simultaneamente
npm run dev:with-server

# Opção 2: Rodar separadamente em dois terminais
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev
```

### 3. Testar a Colaboração em Tempo Real

1. Abra a aplicação em múltiplas abas/navegadores
2. Crie um novo cliente em uma aba
3. Veja a atualização refletida instantaneamente nas outras abas
4. Edite ou delete um cliente - as mudanças são sincronizadas em tempo real
5. Observe a contagem de usuários online no topo da página

---

## 🔧 Configuração

### Variáveis de Ambiente

**Frontend (.env ou .env.local):**
```
VITE_API_URL=http://localhost:3001/api
```

**Backend (server/.env):**
```
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Socket.io

- **Porta**: 3001 (mesma do servidor Express)
- **CORS**: Configurado para aceitar requisições do frontend
- **Reconexão**: Automática com exponential backoff

---

## 📊 Fluxo de Sincronização

```
┌─────────────────────────────────────────────────────────┐
│ Usuário A                                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ React App                                           │ │
│ │  - Clica em "Adicionar Cliente"                     │ │
│ │  - Preenche formulário                              │ │
│ │  - Clica em "Salvar"                                │ │
│ └──────────────────────────┬──────────────────────────┘ │
│                            │                             │
│                            │ ApiClient.createCliente()   │
│                            ▼                             │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Express Server (POST /api/clientes)                 │ │
│ │  - Cria cliente no banco de dados                   │ │
│ │  - Emite evento: io.emit('cliente:created', ...)   │ │
│ └──────────────────────────┬──────────────────────────┘ │
└─────────────────────────────┼──────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
          ┌──────────────────┐ ┌──────────────────┐
          │ Usuário B        │ │ Usuário C        │
          │ Socket.io Client │ │ Socket.io Client │
          │                  │ │                  │
          │ Recebe evento:   │ │ Recebe evento:   │
          │ cliente:created  │ │ cliente:created  │
          │                  │ │                  │
          │ Estado atualiza: │ │ Estado atualiza: │
          │ setClientes(...) │ │ setClientes(...) │
          │                  │ │                  │
          │ UI re-renderiza  │ │ UI re-renderiza  │
          └──────────────────┘ └──────────────────┘
```

---

## 🔍 Debugging

### Logs no Console do Navegador

```
✅ WebSocket conectado
📝 Novo cliente criado: {...}
✏️ Cliente atualizado: {...}
🗑️ Cliente deletado: id123
👥 Usuários online: 3
❌ WebSocket desconectado
```

### Logs no Terminal do Servidor

```
[timestamp] POST /api/clientes
👤 Usuário conectado: socket-id
👥 Usuários online: 3
👤 Usuário desconectado: socket-id
```

---

## ⚠️ Tratamento de Erros

O sistema implementa **fallbacks automáticos**:

- Se houver erro ao enviar para o servidor, o cliente é criado/atualizado/deletado **localmente**
- Os dados são salvos no LocalStorage como cache
- Quando o servidor ficar disponível novamente, há sincronização

---

## 📱 Suportado em

- ✅ Múltiplos navegadores (Chrome, Firefox, Safari, Edge)
- ✅ Múltiplas abas do mesmo navegador
- ✅ Diferentes dispositivos na mesma rede
- ✅ Modo offline (com cache local)

---

## 🎯 Próximos Passos (Opcional)

- [ ] Adicionar notificações visuais de updates de outros usuários
- [ ] Implementar locks para edição simultânea
- [ ] Adicionar log de atividade de usuários
- [ ] Implementar autenticação de usuários
- [ ] Persistir logs de sincronização no servidor
