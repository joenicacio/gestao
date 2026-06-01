import json
from datetime import datetime, timedelta

with open('scripts/test_data_clientes.json', 'r', encoding='utf-8') as f:
    payload = json.load(f)
clientes = payload['data']

MESSES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

def parse_mes_formatado(mes_formatado):
    mes_str, ano_str = mes_formatado.split('/')
    mes_num = MESSES.index(mes_str.lower())
    ano = int('20' + ano_str)
    inicio = datetime(ano, mes_num + 1, 1, 0, 0, 0, 0)
    if mes_num == 11:
        fim = datetime(ano + 1, 1, 1, 0, 0, 0, 0) - timedelta(milliseconds=1)
    else:
        fim = datetime(ano, mes_num + 2, 1, 0, 0, 0, 0) - timedelta(milliseconds=1)
    return inicio, fim


def get_data_inicio_contrato(cliente):
    return datetime.fromisoformat(cliente['dataInicio']) if cliente.get('dataInicio') else datetime.fromisoformat(cliente['dataCreate'])


def cliente_estava_ativo_no_mes(cliente, mes_formatado):
    inicio_da_mes, fim_da_mes = parse_mes_formatado(mes_formatado)
    data_inicio = get_data_inicio_contrato(cliente)
    if data_inicio > fim_da_mes:
        return False
    if cliente.get('dataChurn'):
        data_churn = datetime.fromisoformat(cliente['dataChurn'])
        if data_churn < inicio_da_mes:
            return False
    return True


def cliente_churn_no_mes(cliente, mes_formatado):
    if not cliente.get('dataChurn'):
        return False
    inicio_da_mes, fim_da_mes = parse_mes_formatado(mes_formatado)
    data_churn = datetime.fromisoformat(cliente['dataChurn'])
    return inicio_da_mes <= data_churn <= fim_da_mes


def get_meses_personalizados(data_inicio=None, data_fim=None):
    inicio = datetime.fromisoformat(data_inicio) if data_inicio else datetime(datetime.now().year - 1, 1, 1)
    fim = datetime.fromisoformat(data_fim) if data_fim else datetime.now()
    meses = []
    atual = datetime(inicio.year, inicio.month, 1)
    while atual <= fim:
        meses.append(atual.strftime('%b/%y').lower())
        if atual.month == 12:
            atual = datetime(atual.year + 1, 1, 1)
        else:
            atual = datetime(atual.year, atual.month + 1, 1)
    return meses


def cliente_ativo_no_periodo(cliente, data_inicio=None, data_fim=None):
    if not data_inicio and not data_fim:
        return cliente['status'] == 'Ativo'
    meses = get_meses_personalizados(data_inicio, data_fim)
    return any(cliente_estava_ativo_no_mes(cliente, mes) and not cliente_churn_no_mes(cliente, mes) for mes in meses)


if __name__ == '__main__':
    data_inicio = '2026-03-01'
    data_fim = '2026-03-31'
    meses = get_meses_personalizados(data_inicio, data_fim)
    print('Meses:', meses)

    clientes_ativos = sum(1 for c in clientes if cliente_ativo_no_periodo(c, data_inicio, data_fim))
    clientes_churn = sum(1 for c in clientes if any(cliente_churn_no_mes(c, mes) for mes in meses))
    print('Clientes Ativos em Mar 2026:', clientes_ativos)
    print('Clientes Churn em Mar 2026:', clientes_churn)

    churned_in_mar = [c for c in clientes if cliente_churn_no_mes(c, meses[0])]
    print('Churned IDs in Mar 2026:', [{'id': c['id'], 'nome': c['nome'], 'dataChurn': c['dataChurn']} for c in churned_in_mar])

    clientes_ativos_no_ultimo_mes = [c for c in clientes if cliente_estava_ativo_no_mes(c, meses[0]) and not cliente_churn_no_mes(c, meses[0])]
    mrr_total = sum(c['fee'] for c in clientes_ativos_no_ultimo_mes)
    print('MRR Total em Mar 2026:', mrr_total)

    seo_active = sum(1 for c in clientes if cliente_ativo_no_periodo(c, data_inicio, data_fim) and 'SEO BRASIL' in c['servicos'])
    print('SEO Brasil - clientes ativos em Mar 2026:', seo_active)
