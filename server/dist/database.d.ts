export interface Cliente {
    id: string;
    nome: string;
    squad: 'BR' | 'USA';
    servicos: string[];
    fee: number;
    status: 'Ativo' | 'Churn';
    dataCreate: string;
    dataUpdate: string;
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
    private data;
    private constructor();
    static getInstance(): Database;
    private load;
    private save;
    getAllClientes(): Cliente[];
    getClienteById(id: string): Cliente | undefined;
    createCliente(cliente: Cliente): Cliente;
    updateCliente(id: string, clienteAtualizado: Cliente): Cliente | undefined;
    deleteCliente(id: string): boolean;
    deleteAllClientes(): void;
}
//# sourceMappingURL=database.d.ts.map