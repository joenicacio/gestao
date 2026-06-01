const fs = require('fs')

const raw = fs.readFileSync(__dirname + '/test_data_clientes.json', 'utf8')
const payload = JSON.parse(raw)
const clientes = payload.data

function getMesesPersonalizados(dataInicio, dataFim) {
  const inicio = dataInicio ? new Date(dataInicio) : new Date((new Date()).getFullYear() - 1, 0, 1)
  const fim = dataFim ? new Date(dataFim) : new Date()
  const meses = []
  const datAtual = new Date(inicio)
  while (datAtual <= fim) {
    meses.push(datAtual.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }))
    datAtual.setMonth(datAtual.getMonth() + 1)
  }
  return meses
}

function parseMesFormatado(mesFormatado) {
  const [mesStr, anoStr] = mesFormatado.split('/')
  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  const mesNum = meses.indexOf(mesStr.toLowerCase())
  const ano = parseInt('20' + anoStr, 10)
  const inicioDaMes = new Date(ano, mesNum, 1, 0,0,0,0)
  const fimDaMes = new Date(ano, mesNum + 1, 0, 23,59,59,999)
  return { inicioDaMes, fimDaMes }
}

function getDataInicioContrato(cliente) {
  return cliente.dataInicio ? new Date(cliente.dataInicio) : new Date(cliente.dataCreate)
}

function clienteEstavaAtivoNoMes(cliente, mesFormatado) {
  const { inicioDaMes, fimDaMes } = parseMesFormatado(mesFormatado)
  const dataInicio = getDataInicioContrato(cliente)
  if (dataInicio > fimDaMes) return false
  if (cliente.dataChurn) {
    const dataChurn = new Date(cliente.dataChurn)
    if (dataChurn < inicioDaMes) return false
  }
  return true
}

function clienteChurnNoMes(cliente, mesFormatado) {
  if (!cliente.dataChurn) return false
  const { inicioDaMes, fimDaMes } = parseMesFormatado(mesFormatado)
  const dataChurn = new Date(cliente.dataChurn)
  return dataChurn >= inicioDaMes && dataChurn <= fimDaMes
}

function clienteAtivoNoPeriodo(cliente, dataInicio, dataFim) {
  if (!dataInicio && !dataFim) return cliente.status === 'Ativo'
  const meses = getMesesPersonalizados(dataInicio, dataFim)
  return meses.some(mes => clienteEstavaAtivoNoMes(cliente, mes) && !clienteChurnNoMes(cliente, mes))
}

// Reproduce counts for March 2026
const dataInicio = new Date('2026-03-01')
const dataFim = new Date('2026-03-31')
const meses = getMesesPersonalizados(dataInicio, dataFim)
console.log('Meses:', meses)

const clientesAtivos = clientes.filter(c => clienteAtivoNoPeriodo(c, dataInicio, dataFim)).length
const clientesChurn = clientes.filter(c => {
  const meses = getMesesPersonalizados(dataInicio, dataFim)
  return meses.some(mes => clienteChurnNoMes(c, mes))
}).length

console.log('Clientes Ativos em Mar 2026:', clientesAtivos)
console.log('Clientes Churn em Mar 2026:', clientesChurn)

// List churned clients in March
const churnedInMar = clientes.filter(c => clienteChurnNoMes(c, meses[0]))
console.log('Churned IDs in Mar 2026:', churnedInMar.map(c => ({ id: c.id, nome: c.nome, dataChurn: c.dataChurn })))

// Show MRR total for March: active and not churned in March
const clientesAtivosNoUltimoMes = clientes.filter(c => clienteEstavaAtivoNoMes(c, meses[0]) && !clienteChurnNoMes(c, meses[0]))
const mrrTotal = clientesAtivosNoUltimoMes.reduce((s, c) => s + c.fee, 0)
console.log('MRR Total em Mar 2026 (ativo e não churn no mês):', mrrTotal)

// Show some per-service counts for SEO BRASIL
const seoActive = clientes.filter(c => clienteAtivoNoPeriodo(c, dataInicio, dataFim) && c.servicos.includes('SEO BRASIL')).length
console.log('SEO Brasil - clientes ativos em Mar 2026:', seoActive)

// Exit
