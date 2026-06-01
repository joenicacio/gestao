import { Cliente, ServicoType } from '../types'

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

export class DashboardManager {
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
    const meses = []
    for (let i = quantidade - 1; i >= 0; i--) {
      const data = new Date()
      data.setMonth(data.getMonth() - i)
      meses.push(data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }))
    }
    return meses
  }

  private static getMesesPersonalizados(dataInicio?: Date, dataFim?: Date): string[] {
    const inicio = dataInicio || new Date((new Date()).getFullYear() - 1, 0, 1)
    const fim = dataFim || new Date()

    const meses: string[] = []
    const datAtual = new Date(inicio)

    while (datAtual <= fim) {
      meses.push(datAtual.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }))
      datAtual.setMonth(datAtual.getMonth() + 1)
    }

    return meses
  }

  private static parseMesFormatado(mesFormatado: string): { inicioDaMes: Date; fimDaMes: Date } {
    const [mesStr, anoStr] = mesFormatado.split('/')
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
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
}
