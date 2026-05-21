# Sistema de Gerenciamento de Clientes - Agência

Um sistema completo para gerenciar clientes, serviços e histórico de edições para agências de marketing digital. **Agora com colaboração em tempo real entre múltiplos usuários!**

## ✨ Principais Características

### 🔄 Colaboração em Tempo Real (NOVO!)
- **Sincronização instantânea** entre múltiplos usuários/abas
- Quando um usuário cria, edita ou deleta um cliente, todos os outros veem a mudança imediatamente
- **Contagem de usuários online** - Veja quantas pessoas estão acessando o sistema
- **Indicador de status de conexão** - Saiba se está conectado ao servidor de sincronização
- **Fallback automático** - Se o servidor ficar indisponível, dados são salvos localmente

### Tela de Cadastro
- Nome do cliente
- Seleção de Squad (BR ou USA)
- 11 tipos de serviços com checkboxes:
  - SEO BRASIL
  - SEO EUA
  - CRM
  - ASSESSORIA
  - TRÁFEGO PAGO E-COMMERCE BRASIL
  - TRÁFEGO PAGO LEADS BRASIL
  - TRÁFEGO PAGO LEADS USA
  - TRÁFEGO PAGO E-COMMERCE USA
  - SOCIAL MÍDIA
  - WAYSALES
  - IA
- Quantidade de serviços (calculada automaticamente)
- Fee do cliente
- Status (Ativo/Churn)

### Lista de Clientes
- Exibe todos os clientes cadastrados
- Clientes com status Churn aparecem em cinza
- Setas e percentuais indicando variações:
  - ⬆️ Fee aumentou (verde, com %)
  - ⬇️ Fee diminuiu (vermelho, com %)
  - ⬆️ Serviços aumentaram (verde, com %)
  - ⬇️ Serviços diminuíram (vermelho, com %)

### Histórico de Edições
- Cada cliente tem seu próprio histórico
- Rastreia todas as mudanças:
  - Adição/remoção de serviços
  - Alterações de Fee
  - Mudanças de Status
- Exibe data e hora de cada alteração
- Histórico completo e editável

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
# Instalar todas as dependências
npm run setup

# Rodar frontend e backend simultaneamente
npm run dev:with-server

# Ou em dois terminais separados:
# Terminal 1 - Backend (com WebSocket)
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### 🔄 Testar Sincronização em Tempo Real
1. Abra a aplicação em múltiplas abas ou navegadores
2. Crie um cliente em uma aba - veja aparecer instantaneamente nas outras
3. Edite ou delete um cliente - as mudanças sincronizam em tempo real
4. Observe a contagem de usuários online no topo da página

## Build para Produção

```bash
npm run build
```

## Preview da Build

```bash
npm run preview
```

## Estrutura de Dados

### Cliente
```typescript
{
  id: string
  nome: string
  squad: 'BR' | 'USA'
  servicos: ServicoType[]
  fee: number
  status: 'Ativo' | 'Churn'
  dataCreate: string
  dataUpdate: string
  historico: HistoricoItem[]
}
```

### Item do Histórico
```typescript
{
  id: string
  data: string
  hora: string
  tipo: 'criacao' | 'edicao' | 'servico_adicionado' | 'servico_removido' | 'fee_alterado' | 'status_alterado'
  descricao: string
  dadosAntigos?: any
  dadosNovos?: any
}
```

## Funcionalidades Internas

- Persistência de dados em LocalStorage
- Cálculo automático de variações de fee e serviços
- Indicadores visuais de aumento/diminuição
- Edição inline de clientes
- Exclusão de clientes com confirmação

## Status do Projeto

- [x] Scaffold do projeto criado com React 18 + TypeScript + Vite
- [x] Componentes React estruturados e funcionais
- [x] Sistema de histórico implementado com rastreamento completo
- [x] UI com indicadores de variação (setas e percentuais)
- [x] Persistência de dados em LocalStorage
- [x] Formulário modal para adicionar clientes
- [x] Edição inline de Fee com variação
- [x] Histórico modal com eventos detalhados
- [x] Separação visual de clientes em Churn
- [x] Estatísticas de clientes (Total, Ativos, Churn)
- [ ] Testes unitários
- [ ] Autenticação de usuários

## Licença

MIT
