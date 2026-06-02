import React, { useState, useEffect } from 'react'
import { FiUsers, FiBarChart2, FiPlus, FiWifi, FiWifiOff } from 'react-icons/fi'
import './App.css'
import { Cliente } from './types'
import { ClienteManager } from './utils/ClienteManager'
import { WebSocketManager } from './utils/WebSocketManager'
import { ApiClient } from './utils/ApiClient'
import { FormularioCliente } from './components/FormularioCliente'
import { ListaClientes } from './components/ListaClientes'
import { Dashboard } from './components/Dashboard'
import { HistoricoAnual } from './components/HistoricoAnual'

type Pagina = 'clientes' | 'dashboard' | 'historico'

function App() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [showFormulario, setShowFormulario] = useState(false)
  const [paginaAtual, setPaginaAtual] = useState<Pagina>('clientes')
  const [isOnline, setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [usuariosOnline, setUsuariosOnline] = useState(0)
  const [wsConectado, setWsConectado] = useState(false)

  // Carregar clientes do servidor ao iniciar
  useEffect(() => {
    const carregarClientes = async () => {
      setIsLoading(true)
      try {
        const clientesSalvos = await ClienteManager.getAllClientes()
        setClientes(clientesSalvos)
        
        // Verificar status online
        const onlineStatus = localStorage.getItem('is_online') === 'true'
        setIsOnline(onlineStatus)
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
        setIsOnline(false)
      } finally {
        setIsLoading(false)
      }
    }

    carregarClientes()
  }, [])

  // Conectar ao WebSocket e configurar listeners em tempo real
  useEffect(() => {
    const conectarWebSocket = async () => {
      try {
        await WebSocketManager.connect({
          onClienteCreated: (novoCliente) => {
            setClientes((prev) => {
              // Evitar duplicatas
              if (prev.find(c => c.id === novoCliente.id)) {
                return prev
              }
              return [...prev, novoCliente]
            })
          },
          onClienteUpdated: (clienteAtualizado) => {
            setClientes((prev) =>
              prev.map(c => c.id === clienteAtualizado.id ? clienteAtualizado : c)
            )
          },
          onClienteDeleted: (id) => {
            setClientes((prev) => prev.filter(c => c.id !== id))
          },
          onUsuariosContagem: (contagem) => {
            setUsuariosOnline(contagem)
          },
          onConnect: () => {
            setWsConectado(true)
            console.log('✅ Conectado ao servidor de sincronização')
          },
          onDisconnect: () => {
            setWsConectado(false)
            console.log('❌ Desconectado do servidor de sincronização')
          }
        })
      } catch (error) {
        console.error('Erro ao conectar WebSocket:', error)
      }
    }

    conectarWebSocket()

    // Cleanup: desconectar ao desmontar o componente
    return () => {
      WebSocketManager.disconnect()
    }
  }, [])

  const handleAdicionarCliente = async (dados: any) => {
    try {
      const novoCliente = ClienteManager.criarCliente(
        dados.nome,
        dados.squad,
        dados.servicos,
        dados.fee,
        dados.status,
        dados.dataInicio,
        dados.dataChurn
      )
      
      // Enviar para o servidor (isso dispara o WebSocket)
      const response = await ApiClient.createCliente(novoCliente) as any
      if (response?.data) {
        setClientes([...clientes, response.data])
      } else {
        setClientes([...clientes, novoCliente])
      }
      setShowFormulario(false)
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      // Fallback: adicionar localmente se houver erro
      const novoCliente = ClienteManager.criarCliente(
        dados.nome,
        dados.squad,
        dados.servicos,
        dados.fee,
        dados.status,
        dados.dataInicio,
        dados.dataChurn
      )
      setClientes([...clientes, novoCliente])
      setShowFormulario(false)
    }
  }

  const handleDeletarCliente = async (id: string) => {
    try {
      // Deletar no servidor (isso dispara o WebSocket)
      await ApiClient.deleteCliente(id)
      setClientes(clientes.filter(c => c.id !== id))
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      // Fallback: deletar localmente mesmo se houver erro
      setClientes(clientes.filter(c => c.id !== id))
    }
  }

  const handleAtualizarCliente = async (clienteAtualizado: Cliente) => {
    try {
      // Atualizar no servidor (isso dispara o WebSocket)
      const response = await ApiClient.updateCliente(clienteAtualizado.id, clienteAtualizado) as any
      setClientes(
        clientes.map(c => c.id === clienteAtualizado.id ? (response?.data || clienteAtualizado) : c)
      )
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      // Fallback: atualizar localmente mesmo se houver erro
      setClientes(
        clientes.map(c => c.id === clienteAtualizado.id ? clienteAtualizado : c)
      )
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <img 
            src="https://newayadvice.com/wp-content/uploads/2025/05/Logo-2.png" 
            alt="Neway Logo" 
            className="logo-neway"
            style={{ height: '50px', marginBottom: '1rem' }}
          />
          <h1>Sistema de Gerenciamento de Clientes</h1>
          <p>Neway - Agência de Marketing Digital</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {wsConectado && (
              <span style={{ fontSize: '0.9rem', color: '#4CAF50', fontWeight: 'bold' }}>✓ Colaboração em tempo real</span>
            )}
            {!wsConectado && (
              <span style={{ fontSize: '0.9rem', color: '#FF9800' }}>⚠ Sincronização indisponível</span>
            )}
            {usuariosOnline > 0 && (
              <span style={{ fontSize: '0.9rem', color: '#2196F3', fontWeight: 'bold' }}>👥 {usuariosOnline} usuários online</span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <nav className="nav-paginas">
            <button
              className={`nav-btn ${paginaAtual === 'clientes' ? 'active' : ''}`}
              onClick={() => setPaginaAtual('clientes')}
            >
              <FiUsers size={20} />
              <span>Clientes</span>
            </button>
            <button
              className={`nav-btn ${paginaAtual === 'dashboard' ? 'active' : ''}`}
              onClick={() => setPaginaAtual('dashboard')}
            >
              <FiBarChart2 size={20} />
              <span>Dashboard</span>
            </button>
            <button
              className={`nav-btn ${paginaAtual === 'historico' ? 'active' : ''}`}
              onClick={() => setPaginaAtual('historico')}
            >
              <FiBarChart2 size={20} />
              <span>Histórico</span>
            </button>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {wsConectado ? (
              <FiWifi size={24} style={{ color: '#4CAF50' }} title="Colaboração em tempo real ativa" />
            ) : (
              <FiWifiOff size={24} style={{ color: '#FF9800' }} title="Sincronização indisponível" />
            )}
            {paginaAtual === 'clientes' && (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowFormulario(true)}
                disabled={isLoading}
              >
                <FiPlus size={20} />
                <span>Adicionar novo cliente</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Carregando clientes...</p>
          </div>
        )}
        {!isLoading && paginaAtual === 'clientes' && (
          <ListaClientes
            clientes={clientes}
            onDelete={handleDeletarCliente}
            onUpdate={handleAtualizarCliente}
          />
        )}
        {!isLoading && paginaAtual === 'dashboard' && <Dashboard clientes={clientes} />}
        {!isLoading && paginaAtual === 'historico' && <HistoricoAnual clientes={clientes} />}
      </main>

      {showFormulario && (
        <FormularioCliente
          onSubmit={handleAdicionarCliente}
          onCancel={() => setShowFormulario(false)}
        />
      )}
    </div>
  )
}

export default App
