import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não está configurada!')
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('Erro inesperado no pool:', err)
})

export interface MotivoChurn {
  motivoPrincipal: string
  submotivo: string
  porques: [string, string, string, string, string]
}

export interface Cliente {
  id: string
  nome: string
  squad: 'BR' | 'USA'
  servicos: string[]
  fee: number
  status: 'Ativo' | 'Churn'
  dataCreate: string
  dataUpdate: string
  dataInicio?: string
  dataChurn?: string
  historico: HistoricoItem[]
  motivoChurn?: MotivoChurn
  tempoContrato?: number
  ultimoFee?: number
  ultimoServicosCount?: number
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

export interface SnapshotMensal {
  clienteId: string
  mes: string // formato 'YYYY-MM'
  nome: string
  squad: 'BR' | 'USA'
  servicos: string[]
  fee: number
  status: 'Ativo' | 'Churn'
  qtdServicos: number
  pesoOperacional: number
  updatedAt?: string
}

export class Database {
  private static instance: Database

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  /**
   * Inicializar banco de dados (criar tabelas se não existirem)
   */
  async initialize(): Promise<void> {
    try {
      const client = await pool.connect()
      try {
        console.log('Inicializando banco de dados...')

        // Criar tabela de clientes
        await client.query(`
          CREATE TABLE IF NOT EXISTS clientes (
            id VARCHAR(255) PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            squad VARCHAR(10) NOT NULL CHECK (squad IN ('BR', 'USA')),
            servicos TEXT[] NOT NULL,
            fee NUMERIC NOT NULL,
            status VARCHAR(20) NOT NULL CHECK (status IN ('Ativo', 'Churn')),
            data_create TIMESTAMP NOT NULL,
            data_update TIMESTAMP NOT NULL,
            data_inicio TIMESTAMP NULL,
            data_churn TIMESTAMP NULL,
            historico JSONB NOT NULL,
            motivo_churn JSONB NULL,
            tempo_contrato INTEGER NULL,
            ultimo_fee NUMERIC NULL,
            ultimo_servicos_count INTEGER NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `)

        // Garantir colunas novas em bancos já existentes (deploy anterior a este schema)
        await client.query(`
          ALTER TABLE clientes
            ADD COLUMN IF NOT EXISTS motivo_churn JSONB NULL,
            ADD COLUMN IF NOT EXISTS tempo_contrato INTEGER NULL,
            ADD COLUMN IF NOT EXISTS ultimo_fee NUMERIC NULL,
            ADD COLUMN IF NOT EXISTS ultimo_servicos_count INTEGER NULL
        `)

        // Criar índices
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_clientes_squad 
          ON clientes(squad)
        `)

        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_clientes_status 
          ON clientes(status)
        `)

        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_clientes_data_update
          ON clientes(data_update DESC)
        `)

        // Criar tabela de snapshots mensais (estado "congelado" de cada cliente por mês)
        await client.query(`
          CREATE TABLE IF NOT EXISTS snapshots_mensais (
            cliente_id VARCHAR(255) NOT NULL,
            mes VARCHAR(7) NOT NULL,
            nome VARCHAR(255) NOT NULL,
            squad VARCHAR(10) NOT NULL CHECK (squad IN ('BR', 'USA')),
            servicos TEXT[] NOT NULL,
            fee NUMERIC NOT NULL,
            status VARCHAR(20) NOT NULL CHECK (status IN ('Ativo', 'Churn')),
            qtd_servicos INTEGER NOT NULL,
            peso_operacional NUMERIC NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (cliente_id, mes)
          )
        `)

        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_snapshots_mes
          ON snapshots_mensais(mes)
        `)

        console.log('✅ Banco de dados inicializado com sucesso!')
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar banco de dados:', error)
      throw error
    }
  }

  /**
   * Obter todos os clientes
   */
  async getAllClientes(): Promise<Cliente[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM clientes ORDER BY data_update DESC'
      )
      return this.rowsToClientes(result.rows)
    } catch (error) {
      console.error('Erro ao obter clientes:', error)
      throw error
    }
  }

  /**
   * Obter cliente por ID
   */
  async getClienteById(id: string): Promise<Cliente | undefined> {
    try {
      const result = await pool.query(
        'SELECT * FROM clientes WHERE id = $1',
        [id]
      )
      if (result.rows.length === 0) {
        return undefined
      }
      return this.rowToCliente(result.rows[0])
    } catch (error) {
      console.error('Erro ao obter cliente:', error)
      throw error
    }
  }

  /**
   * Criar novo cliente
   */
  async createCliente(cliente: Cliente): Promise<Cliente> {
    try {
      const {
        id, nome, squad, servicos, fee, status, dataCreate, dataUpdate, dataInicio, dataChurn, historico,
        motivoChurn, tempoContrato, ultimoFee, ultimoServicosCount
      } = cliente

      await pool.query(
        `INSERT INTO clientes (id, nome, squad, servicos, fee, status, data_create, data_update, data_inicio, data_churn, historico, motivo_churn, tempo_contrato, ultimo_fee, ultimo_servicos_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          id, nome, squad, servicos, fee, status, dataCreate, dataUpdate, dataInicio || null, dataChurn || null, JSON.stringify(historico),
          motivoChurn ? JSON.stringify(motivoChurn) : null, tempoContrato ?? null, ultimoFee ?? null, ultimoServicosCount ?? null
        ]
      )

      return cliente
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      throw error
    }
  }

  /**
   * Atualizar cliente
   */
  async updateCliente(id: string, clienteAtualizado: Cliente): Promise<Cliente | undefined> {
    try {
      const {
        nome, squad, servicos, fee, status, dataCreate, dataUpdate, dataInicio, dataChurn, historico,
        motivoChurn, tempoContrato, ultimoFee, ultimoServicosCount
      } = clienteAtualizado

      const result = await pool.query(
        `UPDATE clientes
         SET nome = $2, squad = $3, servicos = $4, fee = $5, status = $6,
             data_create = $7, data_update = $8, data_inicio = $9, data_churn = $10, historico = $11,
             motivo_churn = $12, tempo_contrato = $13, ultimo_fee = $14, ultimo_servicos_count = $15,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [
          id, nome, squad, servicos, fee, status, dataCreate, dataUpdate, dataInicio || null, dataChurn || null, JSON.stringify(historico),
          motivoChurn ? JSON.stringify(motivoChurn) : null, tempoContrato ?? null, ultimoFee ?? null, ultimoServicosCount ?? null
        ]
      )

      if (result.rows.length === 0) {
        return undefined
      }

      return this.rowToCliente(result.rows[0])
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      throw error
    }
  }

  /**
   * Deletar cliente
   */
  async deleteCliente(id: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM clientes WHERE id = $1',
        [id]
      )
      return result.rowCount ? result.rowCount > 0 : false
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      throw error
    }
  }

  /**
   * Deletar todos os clientes (usar com cuidado!)
   */
  async deleteAllClientes(): Promise<void> {
    try {
      await pool.query('DELETE FROM clientes')
    } catch (error) {
      console.error('Erro ao deletar todos os clientes:', error)
      throw error
    }
  }

  /**
   * Contar total de clientes
   */
  async countClientes(): Promise<number> {
    try {
      const result = await pool.query('SELECT COUNT(*) FROM clientes')
      return parseInt(result.rows[0].count, 10)
    } catch (error) {
      console.error('Erro ao contar clientes:', error)
      throw error
    }
  }

  /**
   * Testar conexão com banco de dados
   */
  async testConnection(): Promise<boolean> {
    try {
      const client = await pool.connect()
      try {
        await client.query('SELECT NOW()')
        console.log('✅ Conexão com banco de dados estabelecida!')
        return true
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco de dados:', error)
      return false
    }
  }

  /**
   * Fechar pool de conexões (ao desligar o servidor)
   */
  async close(): Promise<void> {
    try {
      await pool.end()
      console.log('Pool de conexões fechado')
    } catch (error) {
      console.error('Erro ao fechar pool:', error)
    }
  }

  // ==================== SNAPSHOTS MENSAIS ====================

  /**
   * Cria ou substitui o snapshot de um cliente para um mês específico
   */
  async upsertSnapshot(snapshot: SnapshotMensal): Promise<SnapshotMensal> {
    try {
      const { clienteId, mes, nome, squad, servicos, fee, status, qtdServicos, pesoOperacional } = snapshot

      const result = await pool.query(
        `INSERT INTO snapshots_mensais (cliente_id, mes, nome, squad, servicos, fee, status, qtd_servicos, peso_operacional)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (cliente_id, mes) DO UPDATE SET
           nome = EXCLUDED.nome,
           squad = EXCLUDED.squad,
           servicos = EXCLUDED.servicos,
           fee = EXCLUDED.fee,
           status = EXCLUDED.status,
           qtd_servicos = EXCLUDED.qtd_servicos,
           peso_operacional = EXCLUDED.peso_operacional,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [clienteId, mes, nome, squad, servicos, fee, status, qtdServicos, pesoOperacional]
      )

      return this.rowToSnapshot(result.rows[0])
    } catch (error) {
      console.error('Erro ao salvar snapshot mensal:', error)
      throw error
    }
  }

  /**
   * Obtém os snapshots de todos os clientes para um mês específico
   */
  async getSnapshotsPorMes(mes: string): Promise<SnapshotMensal[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM snapshots_mensais WHERE mes = $1 ORDER BY nome',
        [mes]
      )
      return result.rows.map(row => this.rowToSnapshot(row))
    } catch (error) {
      console.error('Erro ao obter snapshots do mês:', error)
      throw error
    }
  }

  /**
   * Obtém os snapshots de todos os clientes num intervalo de meses (inclusive)
   */
  async getSnapshotsRange(mesInicio: string, mesFim: string): Promise<SnapshotMensal[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM snapshots_mensais WHERE mes >= $1 AND mes <= $2 ORDER BY mes, nome',
        [mesInicio, mesFim]
      )
      return result.rows.map(row => this.rowToSnapshot(row))
    } catch (error) {
      console.error('Erro ao obter snapshots do período:', error)
      throw error
    }
  }

  /**
   * Obtém o histórico de snapshots de um cliente específico
   */
  async getSnapshotsPorCliente(clienteId: string): Promise<SnapshotMensal[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM snapshots_mensais WHERE cliente_id = $1 ORDER BY mes',
        [clienteId]
      )
      return result.rows.map(row => this.rowToSnapshot(row))
    } catch (error) {
      console.error('Erro ao obter snapshots do cliente:', error)
      throw error
    }
  }

  /**
   * Obtém os meses (distintos) que já possuem ao menos um snapshot
   */
  async getMesesComSnapshot(): Promise<string[]> {
    try {
      const result = await pool.query(
        'SELECT DISTINCT mes FROM snapshots_mensais ORDER BY mes'
      )
      return result.rows.map(row => row.mes)
    } catch (error) {
      console.error('Erro ao obter meses com snapshot:', error)
      throw error
    }
  }

  private rowToSnapshot(row: any): SnapshotMensal {
    return {
      clienteId: row.cliente_id,
      mes: row.mes,
      nome: row.nome,
      squad: row.squad,
      servicos: row.servicos,
      fee: parseFloat(row.fee),
      status: row.status,
      qtdServicos: Number(row.qtd_servicos),
      pesoOperacional: parseFloat(row.peso_operacional),
      updatedAt: row.updated_at ? row.updated_at.toISOString() : undefined
    }
  }

  // ==================== HELPERS ====================

  private rowToCliente(row: any): Cliente {
    return {
      id: row.id,
      nome: row.nome,
      squad: row.squad,
      servicos: row.servicos,
      fee: parseFloat(row.fee),
      status: row.status,
      dataCreate: row.data_create,
      dataUpdate: row.data_update,
      dataInicio: row.data_inicio ? row.data_inicio.toISOString() : undefined,
      dataChurn: row.data_churn ? row.data_churn.toISOString() : undefined,
      historico: typeof row.historico === 'string' ? JSON.parse(row.historico) : row.historico,
      motivoChurn: row.motivo_churn
        ? (typeof row.motivo_churn === 'string' ? JSON.parse(row.motivo_churn) : row.motivo_churn)
        : undefined,
      tempoContrato: row.tempo_contrato !== null && row.tempo_contrato !== undefined ? Number(row.tempo_contrato) : undefined,
      ultimoFee: row.ultimo_fee !== null && row.ultimo_fee !== undefined ? parseFloat(row.ultimo_fee) : undefined,
      ultimoServicosCount: row.ultimo_servicos_count !== null && row.ultimo_servicos_count !== undefined ? Number(row.ultimo_servicos_count) : undefined
    }
  }

  private rowsToClientes(rows: any[]): Cliente[] {
    return rows.map(row => this.rowToCliente(row))
  }

  /**
   * Exportar pool para testes/queries customizadas
   */
  getPool(): Pool {
    return pool
  }
}
