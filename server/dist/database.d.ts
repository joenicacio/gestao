import { Pool } from 'pg';
export interface MotivoChurn {
    motivoPrincipal: string;
    submotivo: string;
    porques: [string, string, string, string, string];
}
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
    motivoChurn?: MotivoChurn;
    tempoContrato?: number;
    ultimoFee?: number;
    ultimoServicosCount?: number;
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
export interface SnapshotMensal {
    clienteId: string;
    mes: string;
    nome: string;
    squad: 'BR' | 'USA';
    servicos: string[];
    fee: number;
    status: 'Ativo' | 'Churn';
    qtdServicos: number;
    pesoOperacional: number;
    updatedAt?: string;
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
    /**
     * Cria ou substitui o snapshot de um cliente para um mês específico
     */
    upsertSnapshot(snapshot: SnapshotMensal): Promise<SnapshotMensal>;
    /**
     * Obtém os snapshots de todos os clientes para um mês específico
     */
    getSnapshotsPorMes(mes: string): Promise<SnapshotMensal[]>;
    /**
     * Obtém os snapshots de todos os clientes num intervalo de meses (inclusive)
     */
    getSnapshotsRange(mesInicio: string, mesFim: string): Promise<SnapshotMensal[]>;
    /**
     * Obtém o histórico de snapshots de um cliente específico
     */
    getSnapshotsPorCliente(clienteId: string): Promise<SnapshotMensal[]>;
    /**
     * Obtém os meses (distintos) que já possuem ao menos um snapshot
     */
    getMesesComSnapshot(): Promise<string[]>;
    private rowToSnapshot;
    private rowToCliente;
    private rowsToClientes;
    /**
     * Exportar pool para testes/queries customizadas
     */
    getPool(): Pool;
}
//# sourceMappingURL=database.d.ts.map