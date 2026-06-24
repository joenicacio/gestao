import { Cliente, ServicoType, SnapshotMensal } from '../types'

export interface MRRData {
  total: number
  mediaPorCliente: number
  porServico: Record<ServicoType, number>
  porCategoria: {
    seoGeral: number
    seoBrasil: number
    seoUsa: number
    trafegoPago: number
    trafegoPagoBrasil: number
    trafegoPagoUsaE: number
    trafegoPagoUsaL: number
    trafegoPagoBrasilE: number
    trafegoPagoBrasilL: number
    crm: number
    assessoria: number
    socialMedia: number
    ia: number
    waysales: number
  }
  clientesPorServico: Record<ServicoType, number>
}

export interface DateRangeFilter {
  dataInicio?: Date
  dataFim?: Date
}

export interface HistoricoMensalAno {
  mes: string
  ativos: number
  churn: number
  receitaAtivos: number
  receitaChurn: number
}

export interface MotivoChurnResumo {
  motivo: string
  count: number
  percentual: number
}

export class DashboardManager {
  private static readonly MESES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

  static calcularMRR(clientes: Cliente[], squad?: 'BR' | 'USA' | 'TODOS'): MRRData {
    // Filtrar clientes por squad se especificado
    const clientesFiltrados = squad && squad !== 'TODOS' 
      ? clientes.filter(c => c.squad === squad)
      : clientes

    const clientesAtivos = clientesFiltrados.filter(c => c.status === 'Ativo')
    
    const mrrTotal = clientesAtivos.reduce((sum, cliente) => sum + cliente.fee, 0)
    const mediaPorCliente = clientesAtivos.length > 0 ? mrrTotal / clientesAtivos.length : 0

    // Inicializar objeto de MRR por serviço
    const porServico: Record<ServicoType, number> = {
      'SEO BRASIL': 0,
      'SEO EUA': 0,
      'CRM': 0,
      'ASSESSORIA': 0,
      'TRÁFEGO PAGO E-COMMERCE BRASIL': 0,
      'TRÁFEGO PAGO LEADS BRASIL': 0,
      'TRÁFEGO PAGO LEADS USA': 0,
      'TRÁFEGO PAGO E-COMMERCE USA': 0,
      'SOCIAL MÍDIA': 0,
      'WAYSALES': 0,
      'IA': 0
    }

    // Inicializar contagem de clientes por serviço
    const clientesPorServico: Record<ServicoType, number> = {
      'SEO BRASIL': 0,
      'SEO EUA': 0,
      'CRM': 0,
      'ASSESSORIA': 0,
      'TRÁFEGO PAGO E-COMMERCE BRASIL': 0,
      'TRÁFEGO PAGO LEADS BRASIL': 0,
      'TRÁFEGO PAGO LEADS USA': 0,
      'TRÁFEGO PAGO E-COMMERCE USA': 0,
      'SOCIAL MÍDIA': 0,
      'WAYSALES': 0,
      'IA': 0
    }

    // Calcular MRR por serviço
    clientesAtivos.forEach(cliente => {
      cliente.servicos.forEach(servico => {
        porServico[servico] += cliente.fee
        clientesPorServico[servico] += 1
      })
    })

    // Calcular por categoria
    const seoGeral = porServico['SEO BRASIL'] + porServico['SEO EUA']
    const seoBrasil = porServico['SEO BRASIL']
    const seoUsa = porServico['SEO EUA']
    
    const trafegoPagoBrasil = porServico['TRÁFEGO PAGO E-COMMERCE BRASIL'] + porServico['TRÁFEGO PAGO LEADS BRASIL']
    const trafegoPagoUsa = porServico['TRÁFEGO PAGO E-COMMERCE USA'] + porServico['TRÁFEGO PAGO LEADS USA']
    const trafegoPago = trafegoPagoBrasil + trafegoPagoUsa

    return {
      total: mrrTotal,
      mediaPorCliente,
      porServico,
      porCategoria: {
        seoGeral,
        seoBrasil,
        seoUsa,
        trafegoPago,
        trafegoPagoBrasil,
        trafegoPagoUsaE: porServico['TRÁFEGO PAGO E-COMMERCE USA'],
        trafegoPagoUsaL: porServico['TRÁFEGO PAGO LEADS USA'],
        trafegoPagoBrasilE: porServico['TRÁFEGO PAGO E-COMMERCE BRASIL'],
        trafegoPagoBrasilL: porServico['TRÁFEGO PAGO LEADS BRASIL'],
        crm: porServico['CRM'],
        assessoria: porServico['ASSESSORIA'],
        socialMedia: porServico['SOCIAL MÍDIA'],
        ia: porServico['IA'],
        waysales: porServico['WAYSALES']
      },
      clientesPorServico
    }
  }

  static calcularMRRPersonalizado(
    clientes: Cliente[],
    squad?: 'BR' | 'USA' | 'TODOS',
    dateRange?: DateRangeFilter
  ): MRRData {
    let clientesFiltrados = squad && squad !== 'TODOS'
      ? clientes.filter(c => c.squad === squad)
      : clientes

    if (!dateRange?.dataInicio && !dateRange?.dataFim) {
      return this.calcularMRR(clientesFiltrados)
    }

    const meses = this.getMesesPersonalizados(dateRange?.dataInicio, dateRange?.dataFim)
    const ultimoMes = meses[meses.length - 1]

    const clientesAtivosNoUltimoMes = clientesFiltrados.filter(cliente =>
      this.clienteEstavaAtivoNoMes(cliente, ultimoMes) &&
      !this.clienteChurnNoMes(cliente, ultimoMes)
    )

    const mrrTotal = clientesAtivosNoUltimoMes.reduce((sum, cliente) => sum + cliente.fee, 0)
    const mediaPorCliente = clientesAtivosNoUltimoMes.length > 0
      ? mrrTotal / clientesAtivosNoUltimoMes.length
      : 0

    const porServico: Record<ServicoType, number> = {
      'SEO BRASIL': 0,
      'SEO EUA': 0,
      'CRM': 0,
      'ASSESSORIA': 0,
      'TRÁFEGO PAGO E-COMMERCE BRASIL': 0,
      'TRÁFEGO PAGO LEADS BRASIL': 0,
      'TRÁFEGO PAGO LEADS USA': 0,
      'TRÁFEGO PAGO E-COMMERCE USA': 0,
      'SOCIAL MÍDIA': 0,
      'WAYSALES': 0,
      'IA': 0
    }
    const clientesPorServico: Record<ServicoType, number> = {
      'SEO BRASIL': 0,
      'SEO EUA': 0,
      'CRM': 0,
      'ASSESSORIA': 0,
      'TRÁFEGO PAGO E-COMMERCE BRASIL': 0,
      'TRÁFEGO PAGO LEADS BRASIL': 0,
      'TRÁFEGO PAGO LEADS USA': 0,
      'TRÁFEGO PAGO E-COMMERCE USA': 0,
      'SOCIAL MÍDIA': 0,
      'WAYSALES': 0,
      'IA': 0
    }

    clientesAtivosNoUltimoMes.forEach(cliente => {
      cliente.servicos.forEach(servico => {
        porServico[servico] += cliente.fee
        clientesPorServico[servico] += 1
      })
    })

    const seoGeral = porServico['SEO BRASIL'] + porServico['SEO EUA']
    const seoBrasil = porServico['SEO BRASIL']
    const seoUsa = porServico['SEO EUA']
    const trafegoPagoBrasil = porServico['TRÁFEGO PAGO E-COMMERCE BRASIL'] + porServico['TRÁFEGO PAGO LEADS BRASIL']
    const trafegoPagoUsa = porServico['TRÁFEGO PAGO E-COMMERCE USA'] + porServico['TRÁFEGO PAGO LEADS USA']
    const trafegoPago = trafegoPagoBrasil + trafegoPagoUsa

    return {
      total: mrrTotal,
      mediaPorCliente,
      porServico,
      porCategoria: {
        seoGeral,
        seoBrasil,
        seoUsa,
        trafegoPago,
        trafegoPagoBrasil,
        trafegoPagoUsaE: porServico['TRÁFEGO PAGO E-COMMERCE USA'],
        trafegoPagoUsaL: porServico['TRÁFEGO PAGO LEADS USA'],
        trafegoPagoBrasilE: porServico['TRÁFEGO PAGO E-COMMERCE BRASIL'],
        trafegoPagoBrasilL: porServico['TRÁFEGO PAGO LEADS BRASIL'],
        crm: porServico['CRM'],
        assessoria: porServico['ASSESSORIA'],
        socialMedia: porServico['SOCIAL MÍDIA'],
        ia: porServico['IA'],
        waysales: porServico['WAYSALES']
      },
      clientesPorServico
    }
  }

  static getMesesDoAno(ano: number): string[] {
    return this.MESES_PT.map((mes) => `${mes}/${String(ano).slice(-2)}`)
  }

  static calcularHistoricoMensalPorAno(
    clientes: Cliente[],
    ano: number,
    squad?: 'BR' | 'USA' | 'TODOS'
  ): HistoricoMensalAno[] {
    let clientesFiltrados = squad && squad !== 'TODOS'
      ? clientes.filter(c => c.squad === squad)
      : clientes

    const meses = this.getMesesDoAno(ano)

    return meses.map(mes => {
      const ativos = clientesFiltrados.filter(cliente =>
        this.clienteEstavaAtivoNoMes(cliente, mes) && !this.clienteChurnNoMes(cliente, mes)
      ).length

      const churn = clientesFiltrados.filter(cliente =>
        this.clienteChurnNoMes(cliente, mes)
      ).length

      const receitaAtivos = clientesFiltrados
        .filter(cliente => this.clienteEstavaAtivoNoMes(cliente, mes) && !this.clienteChurnNoMes(cliente, mes))
        .reduce((sum, cliente) => sum + cliente.fee, 0)

      const receitaChurn = clientesFiltrados
        .filter(cliente => this.clienteChurnNoMes(cliente, mes))
        .reduce((sum, cliente) => sum + cliente.fee, 0)

      return {
        mes,
        ativos,
        churn,
        receitaAtivos,
        receitaChurn
      }
    })
  }

  static calcularMotivosChurnPorAno(
    clientes: Cliente[],
    ano: number,
    squad?: 'BR' | 'USA' | 'TODOS'
  ): MotivoChurnResumo[] {
    let clientesFiltrados = squad && squad !== 'TODOS'
      ? clientes.filter(c => c.squad === squad)
      : clientes

    const clientesChurn = clientesFiltrados.filter(cliente =>
      cliente.dataChurn ? new Date(cliente.dataChurn).getFullYear() === ano : false
    )

    const motivos = clientesChurn.reduce((acc, cliente) => {
      const motivo = cliente.motivoChurn?.motivoPrincipal?.trim() || 'Não informado'
      const current = acc.get(motivo) || 0
      acc.set(motivo, current + 1)
      return acc
    }, new Map<string, number>())

    const total = clientesChurn.length

    return Array.from(motivos.entries())
      .map(([motivo, count]) => ({
        motivo,
        count,
        percentual: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
  }

  static contaClientesAtivosNoPeriodo(clientes: Cliente[], dateRange?: DateRangeFilter): number {
    if (!dateRange?.dataInicio && !dateRange?.dataFim) {
      return clientes.filter(c => c.status === 'Ativo').length
    }
    const meses = this.getMesesPersonalizados(dateRange?.dataInicio, dateRange?.dataFim)
    return clientes.filter(cliente =>
      meses.some(mes => this.clienteEstavaAtivoNoMes(cliente, mes) && !this.clienteChurnNoMes(cliente, mes))
    ).length
  }

  static contaClientesChurnNoPeriodo(clientes: Cliente[], dateRange?: DateRangeFilter): number {
    if (!dateRange?.dataInicio && !dateRange?.dataFim) {
      return clientes.filter(c => c.status === 'Churn').length
    }
    const meses = this.getMesesPersonalizados(dateRange?.dataInicio, dateRange?.dataFim)
    return clientes.filter(cliente => meses.some(mes => this.clienteChurnNoMes(cliente, mes))).length
  }

  static clienteAtivoNoPeriodo(cliente: Cliente, dateRange?: DateRangeFilter): boolean {
    if (!dateRange?.dataInicio && !dateRange?.dataFim) {
      return cliente.status === 'Ativo'
    }

    const meses = this.getMesesPersonalizados(dateRange?.dataInicio, dateRange?.dataFim)
    return meses.some(mes => this.clienteEstavaAtivoNoMes(cliente, mes) && !this.clienteChurnNoMes(cliente, mes))
  }

  static calcularChurnMensal(clientes: Cliente[], squad?: 'BR' | 'USA' | 'TODOS', dataInicio?: Date, dataFim?: Date): { mes: string; churn: number; ativo: number }[] {
    // Filtrar clientes por squad se especificado
    let clientesFiltrados = squad && squad !== 'TODOS' 
      ? clientes.filter(c => c.squad === squad)
      : clientes

    const meses = this.getUltimosMeses(6)
    
    return meses.map(mes => {
      const clientesMes = clientesFiltrados.filter(cliente => {
        // Cliente deve ter sido criado antes do final do mês
        const dataCriacao = new Date(cliente.dataCreate)
        
        // Verificar se o cliente estava ativo neste mês
        return this.clienteEstavaAtivoNoMes(cliente, mes)
      })

      const churnCount = clientesMes.filter(c => c.status === 'Churn').length
      const ativoCount = clientesMes.filter(c => c.status === 'Ativo').length

      return {
        mes,
        churn: churnCount,
        ativo: ativoCount
      }
    })
  }

  static calcularFeeMensal(clientes: Cliente[], squad?: 'BR' | 'USA' | 'TODOS', dataInicio?: Date, dataFim?: Date): { mes: string; fee: number }[] {
    // Filtrar clientes por squad se especificado
    const clientesFiltrados = squad && squad !== 'TODOS' 
      ? clientes.filter(c => c.squad === squad)
      : clientes

    const meses = this.getUltimosMeses(6)
    
    return meses.map(mes => {
      const clientesAtivos = clientesFiltrados.filter(cliente => 
        cliente.status === 'Ativo' && 
        this.clienteEstavaAtivoNoMes(cliente, mes)
      )

      const totalFee = clientesAtivos.reduce((sum, c) => sum + c.fee, 0)

      return {
        mes,
        fee: totalFee
      }
    })
  }

  private static getUltimosMeses(quantidade: number): string[] {
    const meses: string[] = []

    for (let i = quantidade - 1; i >= 0; i--) {
      const data = new Date()
      data.setMonth(data.getMonth() - i)
      meses.push(`${this.MESES_PT[data.getMonth()]}/${String(data.getFullYear()).slice(-2)}`)
    }

    return meses
  }

  private static getMesesPersonalizados(dataInicio?: Date, dataFim?: Date): string[] {
    const inicio = dataInicio || new Date((new Date()).getFullYear() - 1, 0, 1)
    const fim = dataFim || new Date()

    const meses: string[] = []
    const datAtual = new Date(inicio)

    while (datAtual <= fim) {
      meses.push(`${this.MESES_PT[datAtual.getMonth()]}/${String(datAtual.getFullYear()).slice(-2)}`)
      datAtual.setMonth(datAtual.getMonth() + 1)
    }

    return meses
  }

  private static parseMesFormatado(mesFormatado: string): { inicioDaMes: Date; fimDaMes: Date } {
    let [mesStr, anoStr] = mesFormatado.split('/')
    if (!anoStr) {
      const normalized = mesFormatado
        .replace(/\./g, '')
        .replace(/\s+de\s+/i, '/')
        .replace(/\s+/g, '')
      const parts = normalized.split('/')
      mesStr = parts[0]
      anoStr = parts[1]
    }

    const meses = this.MESES_PT
    const mesNum = meses.indexOf(mesStr.toLowerCase())
    const ano = parseInt('20' + anoStr, 10)

    const inicioDaMes = new Date(ano, mesNum, 1, 0, 0, 0, 0)
    const fimDaMes = new Date(ano, mesNum + 1, 0, 23, 59, 59, 999)

    return { inicioDaMes, fimDaMes }
  }

  private static getDataInicioContrato(cliente: Cliente): Date {
    return cliente.dataInicio ? new Date(cliente.dataInicio) : new Date(cliente.dataCreate)
  }

  private static clienteEstavaAtivoNoMes(cliente: Cliente, mesFormatado: string): boolean {
    const { inicioDaMes, fimDaMes } = this.parseMesFormatado(mesFormatado)
    const dataInicio = this.getDataInicioContrato(cliente)

    if (dataInicio > fimDaMes) {
      return false
    }

    if (cliente.dataChurn) {
      const dataChurn = new Date(cliente.dataChurn)
      if (dataChurn < inicioDaMes) {
        return false
      }
    }

    return true
  }

  private static clienteChurnNoMes(cliente: Cliente, mesFormatado: string): boolean {
    if (!cliente.dataChurn) {
      return false
    }

    const { inicioDaMes, fimDaMes } = this.parseMesFormatado(mesFormatado)
    const dataChurn = new Date(cliente.dataChurn)

    return dataChurn >= inicioDaMes && dataChurn <= fimDaMes
  }

  private static isSameMes(data1: Date, mesFormatado: string): boolean {
    const [mesStr, anoStr] = mesFormatado.split('/')
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    const mesNum = meses.indexOf(mesStr.toLowerCase())
    const ano = parseInt('20' + anoStr, 10)
    
    return data1.getMonth() === mesNum && data1.getFullYear() === ano
  }

  /**
   * Calcula MRR mensal com período personalizado
   */
  static calcularFeeMensalPersonalizado(
    clientes: Cliente[], 
    squad?: 'BR' | 'USA' | 'TODOS',
    dateRange?: DateRangeFilter
  ): { mes: string; fee: number }[] {
    let clientesFiltrados = squad && squad !== 'TODOS' 
      ? clientes.filter(c => c.squad === squad)
      : clientes

    const meses = dateRange?.dataInicio || dateRange?.dataFim 
      ? this.getMesesPersonalizados(dateRange?.dataInicio, dateRange?.dataFim)
      : this.getUltimosMeses(6)
    
    return meses.map(mes => {
      const clientesAtivos = clientesFiltrados.filter(cliente => 
        this.clienteEstavaAtivoNoMes(cliente, mes)
      )

      const totalFee = clientesAtivos.reduce((sum, c) => sum + c.fee, 0)

      return {
        mes,
        fee: totalFee
      }
    })
  }

  /**
   * Calcula Churn mensal com período personalizado
   */
  static calcularChurnMensalPersonalizado(
    clientes: Cliente[],
    squad?: 'BR' | 'USA' | 'TODOS',
    dateRange?: DateRangeFilter
  ): { mes: string; churn: number; ativo: number }[] {
    let clientesFiltrados = squad && squad !== 'TODOS' 
      ? clientes.filter(c => c.squad === squad)
      : clientes

    const meses = dateRange?.dataInicio || dateRange?.dataFim 
      ? this.getMesesPersonalizados(dateRange?.dataInicio, dateRange?.dataFim)
      : this.getUltimosMeses(6)
    
    return meses.map(mes => {
      const clientesAtivosNoMes = clientesFiltrados.filter(cliente => 
        this.clienteEstavaAtivoNoMes(cliente, mes)
      )

      const churnCount = clientesFiltrados.filter(cliente => 
        this.clienteChurnNoMes(cliente, mes)
      ).length
      const ativoCount = clientesAtivosNoMes.filter(cliente => 
        !this.clienteChurnNoMes(cliente, mes)
      ).length

      return {
        mes,
        churn: churnCount,
        ativo: ativoCount
      }
    })
  }

  static salvarMetaChurn(meta: number): void {
    localStorage.setItem('meta_churn', meta.toString())
  }

  static obterMetaChurn(): number {
    const meta = localStorage.getItem('meta_churn')
    return meta ? parseFloat(meta) : 0
  }

  // ==================== AGREGAÇÃO A PARTIR DE SNAPSHOTS MENSAIS ====================
  // Estas funções usam o estado "congelado" de cada mês (snapshots_mensais), em vez de
  // reconstruir o passado a partir dos dados atuais do cliente. Isso evita que uma
  // alteração de fee/serviços hoje distorça os números de meses anteriores.

  static mesYYYYMMToDisplay(mesYYYYMM: string): string {
    const [anoStr, mesStr] = mesYYYYMM.split('-')
    const mesIndex = parseInt(mesStr, 10) - 1
    return `${this.MESES_PT[mesIndex]}/${anoStr.slice(-2)}`
  }

  static getUltimosMesesYYYYMM(quantidade: number): string[] {
    const meses: string[] = []
    for (let i = quantidade - 1; i >= 0; i--) {
      const data = new Date()
      data.setMonth(data.getMonth() - i)
      meses.push(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`)
    }
    return meses
  }

  static getMesesDoAnoYYYYMM(ano: number): string[] {
    return Array.from({ length: 12 }, (_, i) => `${ano}-${String(i + 1).padStart(2, '0')}`)
  }

  static getMesesPersonalizadosYYYYMM(dataInicio?: Date, dataFim?: Date): string[] {
    const inicio = dataInicio || new Date((new Date()).getFullYear() - 1, 0, 1)
    const fim = dataFim || new Date()

    const meses: string[] = []
    const datAtual = new Date(inicio)

    while (datAtual <= fim) {
      meses.push(`${datAtual.getFullYear()}-${String(datAtual.getMonth() + 1).padStart(2, '0')}`)
      datAtual.setMonth(datAtual.getMonth() + 1)
    }

    return meses
  }

  private static filtrarSnapshotsPorSquad(snapshots: SnapshotMensal[], squad?: 'BR' | 'USA' | 'TODOS'): SnapshotMensal[] {
    return squad && squad !== 'TODOS' ? snapshots.filter(s => s.squad === squad) : snapshots
  }

  static calcularFeeMensalDeSnapshots(
    snapshots: SnapshotMensal[],
    mesesYYYYMM: string[],
    squad?: 'BR' | 'USA' | 'TODOS'
  ): { mes: string; fee: number }[] {
    const filtrados = this.filtrarSnapshotsPorSquad(snapshots, squad)

    return mesesYYYYMM.map(mesYYYYMM => {
      const fee = filtrados
        .filter(s => s.mes === mesYYYYMM && s.status === 'Ativo')
        .reduce((sum, s) => sum + s.fee, 0)

      return { mes: this.mesYYYYMMToDisplay(mesYYYYMM), fee }
    })
  }

  static calcularChurnMensalDeSnapshots(
    snapshots: SnapshotMensal[],
    mesesYYYYMM: string[],
    squad?: 'BR' | 'USA' | 'TODOS'
  ): { mes: string; churn: number; ativo: number }[] {
    const filtrados = this.filtrarSnapshotsPorSquad(snapshots, squad)

    return mesesYYYYMM.map(mesYYYYMM => {
      const doMes = filtrados.filter(s => s.mes === mesYYYYMM)
      const ativo = doMes.filter(s => s.status === 'Ativo').length
      const churn = doMes.filter(s => s.status === 'Churn').length

      return { mes: this.mesYYYYMMToDisplay(mesYYYYMM), churn, ativo }
    })
  }

  static calcularHistoricoMensalPorAnoDeSnapshots(
    snapshots: SnapshotMensal[],
    ano: number,
    squad?: 'BR' | 'USA' | 'TODOS'
  ): HistoricoMensalAno[] {
    const filtrados = this.filtrarSnapshotsPorSquad(snapshots, squad)
    const meses = this.getMesesDoAnoYYYYMM(ano)

    return meses.map(mesYYYYMM => {
      const doMes = filtrados.filter(s => s.mes === mesYYYYMM)
      const ativos = doMes.filter(s => s.status === 'Ativo')
      const churn = doMes.filter(s => s.status === 'Churn')

      return {
        mes: this.mesYYYYMMToDisplay(mesYYYYMM),
        ativos: ativos.length,
        churn: churn.length,
        receitaAtivos: ativos.reduce((sum, s) => sum + s.fee, 0),
        receitaChurn: churn.reduce((sum, s) => sum + s.fee, 0)
      }
    })
  }

  /**
   * Mescla dados mês a mês: usa o valor vindo de snapshots quando o mês já tem
   * captura registrada, e cai de volta no valor calculado ao vivo (a partir do
   * estado atual dos clientes) apenas para os meses ainda sem snapshot.
   */
  static mesclarComFallback<T extends { mes: string }>(
    mesesYYYYMM: string[],
    doSnapshot: T[],
    doFallback: T[],
    snapshots: SnapshotMensal[]
  ): T[] {
    return mesesYYYYMM.map((mesYYYYMM, index) => {
      const temSnapshot = snapshots.some(s => s.mes === mesYYYYMM)
      return temSnapshot ? doSnapshot[index] : doFallback[index]
    })
  }
}
