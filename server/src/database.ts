import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = path.join(__dirname, '..', 'db.json')

export interface Cliente {
  id: string
  nome: string
  squad: 'BR' | 'USA'
  servicos: string[]
  fee: number
  status: 'Ativo' | 'Churn'
  dataCreate: string
  dataUpdate: string
  historico: HistoricoItem[]
}

export interface HistoricoItem {
  id: string
  data: string
  hora: string
  tipo: 'criacao' | 'edicao' | 'servico_adicionado' | 'servico_removido' | 'fee_alterado' | 'status_alterado'
  descricao: string
  dadosAntigos?: any
  dadosNovos?: any
}

interface DatabaseSchema {
  clientes: Cliente[]
  version: string
}

export class Database {
  private static instance: Database

  private data: DatabaseSchema = {
    clientes: [],
    version: '1.0.0'
  }

  private constructor() {
    this.load()
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  private load(): void {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8')
        this.data = JSON.parse(fileContent)
      } else {
        this.save()
      }
    } catch (error) {
      console.error('Erro ao carregar database:', error)
      this.data = { clientes: [], version: '1.0.0' }
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2))
    } catch (error) {
      console.error('Erro ao salvar database:', error)
    }
  }

  getAllClientes(): Cliente[] {
    return this.data.clientes
  }

  getClienteById(id: string): Cliente | undefined {
    return this.data.clientes.find(c => c.id === id)
  }

  createCliente(cliente: Cliente): Cliente {
    this.data.clientes.push(cliente)
    this.save()
    return cliente
  }

  updateCliente(id: string, clienteAtualizado: Cliente): Cliente | undefined {
    const index = this.data.clientes.findIndex(c => c.id === id)
    if (index !== -1) {
      this.data.clientes[index] = clienteAtualizado
      this.save()
      return clienteAtualizado
    }
    return undefined
  }

  deleteCliente(id: string): boolean {
    const index = this.data.clientes.findIndex(c => c.id === id)
    if (index !== -1) {
      this.data.clientes.splice(index, 1)
      this.save()
      return true
    }
    return false
  }

  deleteAllClientes(): void {
    this.data.clientes = []
    this.save()
  }
}
