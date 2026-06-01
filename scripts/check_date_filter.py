import json
import datetime

with open('scripts/test_data_clientes.json','r', encoding='utf-8') as f:
    data = json.load(f)['data']


def parse(m):
    mesStr, anoStr = m.split('/')
    meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    mesNum = meses.index(mesStr.lower())
    ano = int('20' + anoStr)
    inicio = datetime.datetime(ano, mesNum + 1, 1, 0, 0, 0, 0)
    if mesNum + 1 == 12:
        fim = datetime.datetime(ano + 1, 1, 1, 0, 0, 0, 0) - datetime.timedelta(milliseconds=1)
    else:
        fim = datetime.datetime(ano, mesNum + 2, 1, 0, 0, 0, 0) - datetime.timedelta(milliseconds=1)
    return inicio, fim


def get_meses_personalizados(data_inicio, data_fim):
    inicio = data_inicio or datetime.datetime(datetime.datetime.now().year - 1, 1, 1)
    fim = data_fim or datetime.datetime.now()
    meses = []
    dat_atual = inicio
    meses_pt = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    while dat_atual <= fim:
        meses.append(f"{meses_pt[dat_atual.month - 1]}/{str(dat_atual.year)[2:]}")
        if dat_atual.month == 12:
            dat_atual = datetime.datetime(dat_atual.year + 1, 1, 1)
        else:
            dat_atual = datetime.datetime(dat_atual.year, dat_atual.month + 1, 1)
    return meses


def parse_dt(value):
    if value.endswith('Z'):
        value = value[:-1] + '+00:00'
    dt = datetime.datetime.fromisoformat(value)
    if dt.tzinfo is not None:
        return dt.astimezone(datetime.timezone.utc).replace(tzinfo=None)
    return dt


def cliente_esta_ativo_no_mes(cliente, mes):
    inicio_da_mes, fim_da_mes = parse(mes)
    data_inicio = parse_dt(cliente['dataInicio'] if cliente.get('dataInicio') else cliente['dataCreate'])
    if data_inicio > fim_da_mes:
        return False
    if cliente.get('dataChurn'):
        data_churn = parse_dt(cliente['dataChurn'])
        if data_churn < inicio_da_mes:
            return False
    return True


def cliente_churn_no_mes(cliente, mes):
    if not cliente.get('dataChurn'):
        return False
    inicio_da_mes, fim_da_mes = parse(mes)
    data_churn = parse_dt(cliente['dataChurn'])
    return inicio_da_mes <= data_churn <= fim_da_mes


start = datetime.datetime(2026, 5, 1)
end = datetime.datetime(2026, 5, 31, 23, 59, 59, 999000)
meses = get_meses_personalizados(start, end)
active = [c for c in data if any(cliente_esta_ativo_no_mes(c, m) and not cliente_churn_no_mes(c, m) for m in meses)]
churn = [c for c in data if any(cliente_churn_no_mes(c, m) for m in meses)]
print('meses', meses)
print('active', len(active), 'churn', len(churn))
print(active[:5])
