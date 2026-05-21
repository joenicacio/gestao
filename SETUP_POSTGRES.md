# Migração do Banco de Dados para PostgreSQL

## Visão Geral

Este guia descreve como migrar o sistema de `db.json` local para um banco de dados PostgreSQL real em produção.

## Opções de Banco de Dados

### 1. **Neon** (Recomendado) ✅
- PostgreSQL gerenciado
- Plano gratuito generoso
- Sem cartão de crédito necessário
- Escalável facilmente
- URL de conexão simples

**Site:** https://neon.tech

### 2. Render PostgreSQL
- Integrado com Render (já usa para backend)
- Plano pago a partir de $15/mês
- Backups automáticos

### 3. Supabase
- PostgreSQL + Auth + Storage
- Plano gratuito
- Mais recursos, mas mais complexo

## Escolhido: Neon

Vamos usar **Neon** por ser a solução mais rápida, gratuita e confiável.

---

## Passo 1: Criar Conta e Banco no Neon

1. Acesse https://neon.tech
2. Clique em **"Sign up"**
3. Use GitHub, Google ou email
4. Crie um **novo projeto**
5. Configure:
   - **Database name:** `clientes_db` (ou nome que preferir)
   - **Region:** Escolha a mais perto (ex: São Paulo)
6. Copie a **Connection String**

Exemplo:
```
postgresql://user:password@ep-xxx.neon.tech:5432/clientes_db?sslmode=require
```

---

## Passo 2: Atualizar o Backend

### 2.1 Instalar Dependência

Dentro da pasta `server/`:

```bash
npm install pg
npm install --save-dev @types/pg
```

### 2.2 Atualizar server/src/database.ts

A classe Database será reescrita para usar PostgreSQL ao invés de arquivos JSON.

### 2.3 Criar Migrations

Scripts SQL para criar as tabelas no banco novo.

---

## Passo 3: Configurar Variáveis de Ambiente

No **Render**, adicione a variável:

```
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech:5432/clientes_db?sslmode=require
```

---

## Passo 4: Testar Localmente

Antes de fazer deploy:

```bash
cd server
npm run build
npm start
```

Teste a API:
```bash
curl https://localhost:3001/api/clientes
```

---

## Passo 5: Deploy no Render

O processo é automatizado. Basta:

1. Commit e push das mudanças para GitHub
2. Render detecta e faz deploy automaticamente
3. Variável DATABASE_URL já está configurada

---

## Estrutura do Banco de Dados

### Tabela: `clientes`

```sql
CREATE TABLE clientes (
  id VARCHAR(255) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  squad VARCHAR(10) NOT NULL,
  servicos TEXT[] NOT NULL,
  fee NUMERIC NOT NULL,
  status VARCHAR(20) NOT NULL,
  data_create TIMESTAMP NOT NULL,
  data_update TIMESTAMP NOT NULL,
  historico JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices para Performance

```sql
CREATE INDEX idx_clientes_squad ON clientes(squad);
CREATE INDEX idx_clientes_status ON clientes(status);
CREATE INDEX idx_clientes_data_update ON clientes(data_update DESC);
```

---

## Benefícios da Migração

✅ **Dados persistem** mesmo com restarts do servidor
✅ **Backups automáticos** no Neon
✅ **Performance melhor** com índices
✅ **Escalabilidade** para milhares de registros
✅ **Segurança** melhorada
✅ **Sem preocupação** com espaço em disco

---

## Próximos Passos

1. Crie conta no Neon
2. Copie a CONNECTION STRING
3. Eu vou atualizar os arquivos do servidor
4. Você configura a variável no Render
5. Fazemos deploy

**Pronto para começar?**
