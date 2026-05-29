import { Pool } from 'pg';
export interface Cliente {
    id: string;
    nome: string;
    squad: 'BR' | 'USA';
    servicos: string[];
    fee: number;
    status: 'Ativo' | 'Churn';
    dataCreate: string;
    dataUpdate: string;
    dataInicio?: string;
    dataChurn?: string;
    historico: HistoricoItem[];
}
export interface HistoricoItem {
    id: string;
    data: string;
    hora: string;
    tipo: 'criacao' | 'edicao' | 'servico_adicionado' | 'servico_removido' | 'fee_alterado' | 'status_alterado';
    descricao: string;
    dadosAntigos?: any;
    dadosNovos?: any;
}
export declare class Database {
    private static instance;
    private constructor();
    static getInstance(): Database;
    /**
     * Inicializar banco de dados (criar tabelas se não existirem)
     */
    initialize(): Promise<void>;
    /**
     * Obter todos os clientes
     */
    getAllClientes(): Promise<Cliente[]>;
    /**
     * Obter cliente por ID
     */
    getClienteById(id: string): Promise<Cliente | undefined>;
    /**
     * Criar novo cliente
     */
    createCliente(cliente: Cliente): Promise<Cliente>;
    /**
     * Atualizar cliente
     */
    updateCliente(id: string, clienteAtualizado: Cliente): Promise<Cliente | undefined>;
    /**
     * Deletar cliente
     */
    deleteCliente(id: string): Promise<boolean>;
    /**
     * Deletar todos os clientes (usar com cuidado!)
     */
    deleteAllClientes(): Promise<void>;
    /**
     * Contar total de clientes
     */
    countClientes(): Promise<number>;
    /**
     * Testar conexão com banco de dados
     */
    testConnection(): Promise<boolean>;
    /**
     * Fechar pool de conexões (ao desligar o servidor)
     */
    close(): Promise<void>;
    private rowToCliente;
    private rowsToClientes;
    /**
     * Exportar pool para testes/queries customizadas
     */
    getPool(): Pool;
}
//# sourceMappingURL=database.d.ts.map