export type ServicoType = 
  | 'SEO BRASIL'
  | 'SEO EUA'
  | 'CRM'
  | 'ASSESSORIA'
  | 'TRÁFEGO PAGO E-COMMERCE BRASIL'
  | 'TRÁFEGO PAGO LEADS BRASIL'
  | 'TRÁFEGO PAGO LEADS USA'
  | 'TRÁFEGO PAGO E-COMMERCE USA'
  | 'SOCIAL MÍDIA'
  | 'WAYSALES'
  | 'IA'

export type Squad = 'BR' | 'USA'
export type Status = 'Ativo' | 'Churn'

export type TipoHistorico = 
  | 'criacao' 
  | 'edicao' 
  | 'servico_adicionado' 
  | 'servico_removido' 
  | 'fee_alterado' 
  | 'status_alterado'
  | 'data_inicio_alterada'
  | 'data_churn_alterada'

export interface HistoricoItem {
  id: string
  data: string
  hora: string
  tipo: TipoHistorico
  descricao: string
  dadosAntigos?: any
  dadosNovos?: any
}

export interface Cliente {
  id: string
  nome: string
  squad: Squad
  servicos: ServicoType[]
  fee: number
  status: Status
  dataCreate: string
  dataUpdate: string
  dataInicio?: string
  dataChurn?: string
  tempoContrato?: number
  historico: HistoricoItem[]
  ultimoFee?: number
  ultimoServicosCount?: number
}

export interface VariacaoInfo {
  tipoVariacao: 'aumento' | 'diminuicao' | 'sem_variacao'
  percentual: number
  diferenca: number
}
