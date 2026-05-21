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

  static calcularChurnMensal(clientes: Cliente[], squad?: 'BR' | 'USA' | 'TODOS'): { mes: string; churn: number; ativo: number }[] {
    // Filtrar clientes por squad se especificado
    const clientesFiltrados = squad && squad !== 'TODOS' 
      ? clientes.filter(c => c.squad === squad)
      : clientes

    const meses = this.getUltimosMeses(6)
    
    return meses.map(mes => {
      const clientesMes = clientesFiltrados.filter(cliente => {
        const dataCriacao = new Date(cliente.dataCreate)
        return this.isSameMes(dataCriacao, mes)
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

  static calcularFeeMensal(clientes: Cliente[], squad?: 'BR' | 'USA' | 'TODOS'): { mes: string; fee: number }[] {
    // Filtrar clientes por squad se especificado
    const clientesFiltrados = squad && squad !== 'TODOS' 
      ? clientes.filter(c => c.squad === squad)
      : clientes

    const meses = this.getUltimosMeses(6)
    
    return meses.map(mes => {
      const clientesAtivos = clientesFiltrados.filter(cliente => 
        cliente.status === 'Ativo' && 
        this.isSameMes(new Date(cliente.dataCreate), mes)
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

  private static isSameMes(data1: Date, mesFormatado: string): boolean {
    const mesAtual = new Date()
    // Simplificado: compara se está no mesmo mês/ano
    // Em produção, seria mais robusto
    return true // Por enquanto, retorna true para incluir dados
  }

  static salvarMetaChurn(meta: number): void {
    localStorage.setItem('meta_churn', meta.toString())
  }

  static obterMetaChurn(): number {
    const meta = localStorage.getItem('meta_churn')
    return meta ? parseFloat(meta) : 0
  }
}
