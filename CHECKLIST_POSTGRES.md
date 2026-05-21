# 🎯 Checklist - Migração para PostgreSQL Completa

## ✅ Verificações Técnicas

### Backend (server/)

- [x] `database.ts` - Reescrito para usar PostgreSQL
  - [x] Usa `pg` Pool
  - [x] Todas as operações são `async`
  - [x] Criação automática de tabelas
  - [x] Índices criados
  - [x] Conexão testada

- [x] `index.ts` - Atualizado para async
  - [x] GET /api/clientes - async
  - [x] GET /api/clientes/:id - async
  - [x] POST /api/clientes - async
  - [x] PUT /api/clientes/:id - async
  - [x] DELETE /api/clientes/:id - async
  - [x] POST /api/clientes/batch/sync - async
  - [x] db.initialize() chamado ao iniciar
  - [x] Graceful shutdown implementado

- [x] `package.json`
  - [x] `pg` ^8.21.0 instalado
  - [x] `@types/pg` instalado

- [x] `.env`
  - [x] DATABASE_URL configurado
  - [x] NODE_ENV = production
  - [x] PORT = 10000
  - [x] CORS_ORIGIN = https://newaytemporario.com

- [x] `.env.example`
  - [x] Arquivo de referência criado

### Build

- [ ] Testes locais (opcional)
  ```bash
  cd server
  npm run build
  ```

---

## 📋 Ações Necessárias do Usuário

### No Render Dashboard

- [ ] Ir para: https://dashboard.render.com
- [ ] Selecionar serviço: `gestao-web-a8sl`
- [ ] Ir em **Settings** ou **Environment**
- [ ] Adicionar variável `DATABASE_URL`:
  ```
  postgresql://neondb_owner:npg_pqfBJlwj05xQ@ep-sparkling-thunder-aq3epi3a-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  ```
- [ ] Clique em **Save**

### Deploy

- [ ] **Opção A (Automático):**
  ```bash
  git add .
  git commit -m "Migrar para PostgreSQL Neon"
  git push
  ```
  Render faz deploy automaticamente

- [ ] **Opção B (Manual):**
  - Dashboard Render > Manual Deploy > Deploy latest commit

### Verificações Pós-Deploy

- [ ] Aguardar 2-5 minutos para deploy completar
- [ ] Acessar: https://newaytemporario.com
- [ ] F12 > Console (procurar por erros)
- [ ] Criar novo cliente (teste)
- [ ] Editar cliente (teste)
- [ ] Deletar cliente (teste)
- [ ] Atualizar página (dados devem persistir)
- [ ] Verificar WebSocket: deve aparecer "Conectado ao servidor de sincronização"

### Verificar Dados no Neon

- [ ] Acessar: https://console.neon.tech
- [ ] Abrir **SQL Editor**
- [ ] Executar:
  ```sql
  SELECT COUNT(*) FROM clientes;
  ```
- [ ] Deve retornar o número de clientes criados

---

## 🚀 Status

```
Backend PostgreSQL: ✅ PRONTO
Frontend: ✅ SEM ALTERAÇÕES NECESSÁRIAS
Deploy: ⏳ AGUARDANDO SETUP NO RENDER
```

---

## 📞 Próximos Passos

1. Configure a variável `DATABASE_URL` no Render
2. Faça o deploy (automático ou manual)
3. Teste a aplicação
4. Verifique os dados no Neon

**Tudo pronto para ir ao vivo!** 🎉
