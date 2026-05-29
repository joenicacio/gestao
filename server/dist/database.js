import { Pool } from 'pg';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error('DATABASE_URL não está configurada!');
}
const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
pool.on('error', (err) => {
    console.error('Erro inesperado no pool:', err);
});
export class Database {
    constructor() { }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    /**
     * Inicializar banco de dados (criar tabelas se não existirem)
     */
    async initialize() {
        try {
            const client = await pool.connect();
            try {
                console.log('Inicializando banco de dados...');
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
                // Criar índices
                await client.query(`
          CREATE INDEX IF NOT EXISTS idx_clientes_squad 
          ON clientes(squad)
        `);
                await client.query(`
          CREATE INDEX IF NOT EXISTS idx_clientes_status 
          ON clientes(status)
        `);
                await client.query(`
          CREATE INDEX IF NOT EXISTS idx_clientes_data_update 
          ON clientes(data_update DESC)
        `);
                console.log('✅ Banco de dados inicializado com sucesso!');
            }
            finally {
                client.release();
            }
        }
        catch (error) {
            console.error('❌ Erro ao inicializar banco de dados:', error);
            throw error;
        }
    }
    /**
     * Obter todos os clientes
     */
    async getAllClientes() {
        try {
            const result = await pool.query('SELECT * FROM clientes ORDER BY data_update DESC');
            return this.rowsToClientes(result.rows);
        }
        catch (error) {
            console.error('Erro ao obter clientes:', error);
            throw error;
        }
    }
    /**
     * Obter cliente por ID
     */
    async getClienteById(id) {
        try {
            const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return undefined;
            }
            return this.rowToCliente(result.rows[0]);
        }
        catch (error) {
            console.error('Erro ao obter cliente:', error);
            throw error;
        }
    }
    /**
     * Criar novo cliente
     */
    async createCliente(cliente) {
        try {
            const { id, nome, squad, servicos, fee, status, dataCreate, dataUpdate, dataInicio, dataChurn, historico } = cliente;
            await pool.query(`INSERT INTO clientes (id, nome, squad, servicos, fee, status, data_create, data_update, data_inicio, data_churn, historico)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [id, nome, squad, servicos, fee, status, dataCreate, dataUpdate, dataInicio || null, dataChurn || null, JSON.stringify(historico)]);
            return cliente;
        }
        catch (error) {
            console.error('Erro ao criar cliente:', error);
            throw error;
        }
    }
    /**
     * Atualizar cliente
     */
    async updateCliente(id, clienteAtualizado) {
        try {
            const { nome, squad, servicos, fee, status, dataCreate, dataUpdate, dataInicio, dataChurn, historico } = clienteAtualizado;
            const result = await pool.query(`UPDATE clientes 
         SET nome = $2, squad = $3, servicos = $4, fee = $5, status = $6, 
             data_create = $7, data_update = $8, data_inicio = $9, data_churn = $10, historico = $11, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`, [id, nome, squad, servicos, fee, status, dataCreate, dataUpdate, dataInicio || null, dataChurn || null, JSON.stringify(historico)]);
            if (result.rows.length === 0) {
                return undefined;
            }
            return this.rowToCliente(result.rows[0]);
        }
        catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            throw error;
        }
    }
    /**
     * Deletar cliente
     */
    async deleteCliente(id) {
        try {
            const result = await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
            return result.rowCount ? result.rowCount > 0 : false;
        }
        catch (error) {
            console.error('Erro ao deletar cliente:', error);
            throw error;
        }
    }
    /**
     * Deletar todos os clientes (usar com cuidado!)
     */
    async deleteAllClientes() {
        try {
            await pool.query('DELETE FROM clientes');
        }
        catch (error) {
            console.error('Erro ao deletar todos os clientes:', error);
            throw error;
        }
    }
    /**
     * Contar total de clientes
     */
    async countClientes() {
        try {
            const result = await pool.query('SELECT COUNT(*) FROM clientes');
            return parseInt(result.rows[0].count, 10);
        }
        catch (error) {
            console.error('Erro ao contar clientes:', error);
            throw error;
        }
    }
    /**
     * Testar conexão com banco de dados
     */
    async testConnection() {
        try {
            const client = await pool.connect();
            try {
                await client.query('SELECT NOW()');
                console.log('✅ Conexão com banco de dados estabelecida!');
                return true;
            }
            finally {
                client.release();
            }
        }
        catch (error) {
            console.error('❌ Erro ao conectar ao banco de dados:', error);
            return false;
        }
    }
    /**
     * Fechar pool de conexões (ao desligar o servidor)
     */
    async close() {
        try {
            await pool.end();
            console.log('Pool de conexões fechado');
        }
        catch (error) {
            console.error('Erro ao fechar pool:', error);
        }
    }
    // ==================== HELPERS ====================
    rowToCliente(row) {
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
            historico: typeof row.historico === 'string' ? JSON.parse(row.historico) : row.historico
        };
    }
    rowsToClientes(rows) {
        return rows.map(row => this.rowToCliente(row));
    }
    /**
     * Exportar pool para testes/queries customizadas
     */
    getPool() {
        return pool;
    }
}
//# sourceMappingURL=database.js.map