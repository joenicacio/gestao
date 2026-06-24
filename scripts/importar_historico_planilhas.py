"""
Importação única do histórico das planilhas para o sistema (snapshots mensais + motivo de churn).

O que faz:
  1. Lê as abas "RECORRÊNCIA <MÊS><ANO>" de BASE OPERAÇÃO.xlsx e gera um snapshot mensal
     (servicos, fee, status, peso operacional) por cliente já cadastrado no sistema.
  2. Lê a aba "Churns Atualizados" de CHURNS ATUALIZADA 2.xlsx e preenche o motivo de churn
     (motivo principal, submotivo, os 5 "Por quê?") dos clientes já marcados como Churn.

Por padrão roda em modo "dry run": só mostra o relatório de quem seria casado/alterado,
sem escrever nada. Use --apply para executar de fato.

Uso:
  python scripts/importar_historico_planilhas.py \
      --base-operacao "C:\\Users\\idkme\\Downloads\\BASE OPERAÇÃO.xlsx" \
      --churns "C:\\Users\\idkme\\Downloads\\CHURNS ATUALIZADA 2.xlsx" \
      --base-url http://localhost:3001 \
      --apply
"""
import argparse
import json
import re
import sys
import unicodedata

import pandas as pd
import requests

MESES_PT = {
    'JANEIRO': '01', 'JAN': '01',
    'FEVEREIRO': '02', 'FEV': '02',
    'MARCO': '03', 'MARÇO': '03', 'MAR': '03',
    'ABRIL': '04', 'ABR': '04',
    'MAIO': '05', 'MAI': '05',
    'JUNHO': '06', 'JUN': '06',
    'JULHO': '07', 'JUL': '07',
    'AGOSTO': '08', 'AGO': '08',
    'SETEMBRO': '09', 'SET': '09',
    'OUTUBRO': '10', 'OUT': '10',
    'NOVEMBRO': '11', 'NOV': '11',
    'DEZEMBRO': '12', 'DEZ': '12'
}

SERVICO_COLS = [
    'SEO BRASIL', 'SEO EUA', 'CRM', 'ASSESSORIA',
    'TRÁFEGO PAGO E-COMMERCE BRASIL', 'TRÁFEGO PAGO E-COMMERCE', 'TRÁFEGO PAGO E-COMMERCE USA',
    'TRÁFEGO PAGO LEADS BRASIL', 'TRÁFEGO PAGO LEADS USA', 'TRÁFEGO PAGO LEADS EUA',
    'SOCIAL MÍDIA', 'WAYSALES', 'IA'
]


def normalizar_nome(nome: str) -> str:
    if not isinstance(nome, str):
        return ''
    sem_parenteses = re.sub(r'\([^)]*\)', '', nome)
    sem_acento = unicodedata.normalize('NFKD', sem_parenteses).encode('ascii', 'ignore').decode('ascii')
    return re.sub(r'\s+', ' ', sem_acento).strip().upper()


def extrair_mes_da_aba(nome_aba: str) -> str:
    """'RECORRÊNCIA MARÇO26' -> '2026-03'"""
    match = re.search(r'RECORR[ÊE]NCIA\s+([A-ZÇÃÉ]+)\s*(\d{2})', nome_aba.upper())
    if not match:
        raise ValueError(f'Não foi possível extrair mês/ano da aba "{nome_aba}"')
    mes_nome, ano_curto = match.groups()
    mes_num = MESES_PT.get(mes_nome)
    if not mes_num:
        raise ValueError(f'Mês "{mes_nome}" não reconhecido na aba "{nome_aba}"')
    return f'20{ano_curto}-{mes_num}'


def carregar_clientes(base_url: str) -> dict:
    resp = requests.get(f'{base_url}/api/clientes', timeout=15)
    resp.raise_for_status()
    data = resp.json()
    if not data.get('success'):
        raise RuntimeError(f'Erro ao buscar clientes: {data}')

    indice = {}
    for cliente in data['data']:
        chave = normalizar_nome(cliente['nome'])
        indice[chave] = cliente
    return indice


def extrair_snapshots_da_planilha(caminho: str) -> list:
    xl = pd.ExcelFile(caminho)
    abas_recorrencia = [s for s in xl.sheet_names if 'RECORR' in s.upper()]

    linhas = []
    linhas_invalidas = []
    for aba in abas_recorrencia:
        mes = extrair_mes_da_aba(aba)
        df = xl.parse(aba, header=0)
        df.columns = [str(c).strip() for c in df.columns]

        for _, row in df.iterrows():
            nome = row.get('EMPRESA')
            if not isinstance(nome, str) or not nome.strip():
                continue

            squad_raw = str(row.get('SQUAD', ''))
            squad = 'USA' if '🇺🇸' in squad_raw or 'US' in squad_raw.upper() else 'BR'

            servicos = [col for col in SERVICO_COLS if col in df.columns and pd.notna(row.get(col)) and str(row.get(col)).strip() != '']

            fee_raw = row.get('FEE')
            try:
                fee = float(fee_raw)
            except (TypeError, ValueError):
                linhas_invalidas.append({'aba': aba, 'nome': nome.strip(), 'motivo': f'FEE inválido: {fee_raw!r}'})
                continue

            status_raw = str(row.get('STATUS', '')).strip().upper()
            status = 'Churn' if status_raw == 'CHURN' else 'Ativo'

            qtd_servicos = row.get('QTD SERVIÇOS')
            qtd_servicos = int(qtd_servicos) if pd.notna(qtd_servicos) else len(servicos)

            peso_operacional = row.get('PESO OPERACIONAL')
            try:
                peso_operacional = float(peso_operacional)
            except (TypeError, ValueError):
                peso_operacional = float(qtd_servicos)

            linhas.append({
                'mes': mes,
                'nome': nome.strip(),
                'nomeNormalizado': normalizar_nome(nome),
                'squad': squad,
                'servicos': servicos,
                'fee': fee,
                'status': status,
                'qtdServicos': qtd_servicos,
                'pesoOperacional': peso_operacional
            })

    return linhas, linhas_invalidas


def extrair_churns_da_planilha(caminho: str) -> list:
    xl = pd.ExcelFile(caminho)
    df = xl.parse('Churns Atualizados', header=1)
    df.columns = [str(c).strip() for c in df.columns]

    porque_cols = [c for c in df.columns if c.strip().lower().startswith('por que')]

    linhas = []
    for _, row in df.iterrows():
        nome = row.get('CLIENTE')
        if not isinstance(nome, str) or not nome.strip():
            continue

        porques = []
        for col in porque_cols:
            valor = row.get(col)
            porques.append(str(valor).strip() if pd.notna(valor) else '')
        while len(porques) < 5:
            porques.append('')
        porques = porques[:5]

        data_churn = row.get('DATA CHURN')
        data_churn_iso = data_churn.isoformat() if pd.notna(data_churn) and hasattr(data_churn, 'isoformat') else None

        linhas.append({
            'nome': nome.strip(),
            'nomeNormalizado': normalizar_nome(nome),
            'motivoChurn': {
                'motivoPrincipal': str(row.get('MOTIVO DO CHURN', '') or ''),
                'submotivo': str(row.get('SUBMOTIVO DE CHURN', '') or ''),
                'porques': porques
            },
            'dataChurn': data_churn_iso
        })

    return linhas


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-operacao', required=True, help='Caminho para BASE OPERAÇÃO.xlsx')
    parser.add_argument('--churns', required=True, help='Caminho para CHURNS ATUALIZADA 2.xlsx')
    parser.add_argument('--base-url', default='http://localhost:3001', help='URL base da API (default: http://localhost:3001)')
    parser.add_argument('--apply', action='store_true', help='Executa de fato as escritas (default: dry-run, só mostra relatório)')
    parser.add_argument('--relatorio', default='relatorio_importacao.json', help='Arquivo de saída com nomes não casados')
    args = parser.parse_args()

    print(f'Carregando clientes de {args.base_url} ...')
    clientes_idx = carregar_clientes(args.base_url)
    print(f'  -> {len(clientes_idx)} clientes carregados\n')

    snapshots, snapshots_invalidos = extrair_snapshots_da_planilha(args.base_operacao)
    churns = extrair_churns_da_planilha(args.churns)

    snapshots_casados, snapshots_nao_casados = [], []
    for s in snapshots:
        cliente = clientes_idx.get(s['nomeNormalizado'])
        if cliente:
            snapshots_casados.append({**s, 'clienteId': cliente['id']})
        else:
            snapshots_nao_casados.append(s)

    churns_casados, churns_nao_casados, churns_ignorados = [], [], []
    for c in churns:
        cliente = clientes_idx.get(c['nomeNormalizado'])
        if not cliente:
            churns_nao_casados.append(c)
        elif cliente['status'] != 'Churn':
            churns_ignorados.append({**c, 'motivo': 'cliente está Ativo no sistema, não Churn'})
        else:
            churns_casados.append({**c, 'clienteId': cliente['id']})

    print('=== Resumo ===')
    print(f'Snapshots: {len(snapshots_casados)} casados, {len(snapshots_nao_casados)} sem correspondência, {len(snapshots_invalidos)} com FEE inválido (ignorados)')
    print(f'Churns:    {len(churns_casados)} casados, {len(churns_ignorados)} ignorados (status diferente), {len(churns_nao_casados)} sem correspondência\n')

    if snapshots_nao_casados or churns_nao_casados or snapshots_invalidos:
        nomes_snapshot = sorted({s['nome'] for s in snapshots_nao_casados})
        nomes_churn = sorted({c['nome'] for c in churns_nao_casados})
        with open(args.relatorio, 'w', encoding='utf-8') as f:
            json.dump({
                'snapshots_sem_correspondencia': nomes_snapshot,
                'snapshots_com_fee_invalido': snapshots_invalidos,
                'churns_sem_correspondencia': nomes_churn,
                'churns_ignorados': [c['nome'] for c in churns_ignorados]
            }, f, ensure_ascii=False, indent=2)
        print(f'Relatório de nomes não casados salvo em: {args.relatorio}\n')

    if not args.apply:
        print('Modo dry-run (nada foi escrito). Rode novamente com --apply para gravar.')
        return

    print('Gravando snapshots mensais...')
    for s in snapshots_casados:
        resp = requests.put(
            f"{args.base_url}/api/snapshots/{s['clienteId']}/{s['mes']}",
            json={
                'nome': s['nome'], 'squad': s['squad'], 'servicos': s['servicos'],
                'fee': s['fee'], 'status': s['status']
            },
            timeout=15
        )
        if not resp.ok:
            print(f"  Falhou: {s['nome']} ({s['mes']}) -> {resp.status_code} {resp.text}")

    print('Atualizando motivos de churn...')
    for c in churns_casados:
        cliente = clientes_idx[c['nomeNormalizado']]
        body = {**cliente, 'motivoChurn': c['motivoChurn']}
        if c['dataChurn']:
            body['dataChurn'] = c['dataChurn']
        resp = requests.put(f"{args.base_url}/api/clientes/{c['clienteId']}", json=body, timeout=15)
        if not resp.ok:
            print(f"  Falhou: {c['nome']} -> {resp.status_code} {resp.text}")

    print('Concluído.')


if __name__ == '__main__':
    main()
