# 🚀 Guia de Deploy - PostgreSQL Neon

## ✅ O Que Já Foi Feito

- ✅ Backend atualizado para usar PostgreSQL
- ✅ Arquivo `.env` criado com a connection string do Neon
- ✅ Todas as rotas convertidas para async/await
- ✅ Inicialização automática do banco de dados
- ✅ Pool de conexões configurado

## 📋 Próximos Passos

### 1️⃣ Testar Localmente (Opcional)

Se você quiser testar antes de fazer deploy:

```bash
cd server
npm install
npm run build
npm start
```

Você deve ver:

```
✅ Conexão com banco de dados estabelecida!
✅ Banco de dados inicializado com sucesso!
✅ Servidor rodando em http://localhost:3001
```

### 2️⃣ Atualizar Variáveis no Render

1. Acesse: https://dashboard.render.com
2. Clique em seu serviço: `gestao-web-a8sl`
3. Vá em **"Environment"** (ou "Settings" > "Environment")
4. Procure por `DATABASE_URL`
   - Se existir: **Atualize o valor**
   - Se não existir: **Clique em "Add Environment Variable"**

5. Configure:
   - **Name:** `DATABASE_URL`
   - **Value:** (Cole a string abaixo)

```
postgresql://neondb_owner:npg_pqfBJlwj05xQ@ep-sparkling-thunder-aq3epi3a-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

6. **Clique em "Save"**

### 3️⃣ Deploy no Render

Agora o Render vai pegar as mudanças:

**Opção A: Deploy Automático (Recomendado)**
- Faça push para GitHub:

```bash
git add .
git commit -m "Migrar para PostgreSQL Neon"
git push
```

- Render detecta automaticamente e faz deploy (~2 minutos)

**Opção B: Deploy Manual**
- Dashboard do Render
- Clique em **"Manual Deploy"**
- Selecione **"Deploy latest commit"**

### 4️⃣ Verificar se Funcionou

Após o deploy (leva 2-5 minutos):

1. Acesse sua aplicação: https://newaytemporario.com
2. Abra o DevTools (F12 > Console)
3. Procure por erros vermelhos
4. Tente:
   - ✅ Criar um cliente
   - ✅ Editar um cliente
   - ✅ Deletar um cliente
   - ✅ Atualizar a página (dados devem persistir)

### 5️⃣ Monitorar no Neon

Para ver os dados no Neon:

1. Acesse: https://console.neon.tech
2. Vá em **"SQL Editor"**
3. Execute:

```sql
SELECT * FROM clientes;
```

Se aparecer seus clientes = **FUNCIONOU!** 🎉

---

## 🔧 Troubleshooting

### Erro: "DATABASE_URL não está configurada"
- Verifique se a variável está no Render
- Redeploy o serviço
- Aguarde 1-2 minutos

### Erro: "Connection refused"
- A string de conexão pode estar expirada
- Copie uma nova do Neon Dashboard
- Atualize no Render

### Dados não persistem após restart
- Verifique no Neon se os dados estão lá
- Pode ser cache do navegador
- Limpe localStorage: `localStorage.clear()`

### WebSocket não conecta
- Verifique se CORS_ORIGIN está correto no Render
- Deve ser: `https://newaytemporario.com` (sem barra final)

---

## 📚 Estrutura do Banco

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices

- `idx_clientes_squad` - Busca por Squad
- `idx_clientes_status` - Busca por Status
- `idx_clientes_data_update` - Ordenação por data

---

## ⚡ Performance

Com PostgreSQL você terá:

- ✅ Queries mais rápidas
- ✅ Backups automáticos no Neon
- ✅ Escalabilidade ilimitada
- ✅ Segurança melhorada
- ✅ Sem preocupação com perda de dados

---

## 📞 Próximos Passos

1. **Confirme no Render** que a variável `DATABASE_URL` está lá
2. **Faça um push** para GitHub (ou deploy manual)
3. **Aguarde 2-5 minutos** para o deploy completar
4. **Teste a aplicação** no navegador
5. **Verifique os dados** no Neon

**Qualquer dúvida, me avise!** 🚀
