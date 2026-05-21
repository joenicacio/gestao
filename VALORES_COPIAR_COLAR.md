# 🔗 URLs e Valores - Copie e Cole

## ⏰ AGORA MESMO - Configure no Render

### 🎯 Passo 1: Acesse o Dashboard do Render
```
https://dashboard.render.com
```

### 🎯 Passo 2: Vá para o Serviço
- Procure por: `gestao-web-a8sl`
- Clique nele

### 🎯 Passo 3: Adicione a Variável de Ambiente

**Nome da Variável:**
```
DATABASE_URL
```

**Valor da Variável (copie exatamente):**
```
postgresql://neondb_owner:npg_pqfBJlwj05xQ@ep-sparkling-thunder-aq3epi3a-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

✅ **Clique em Save**

---

## 🚀 Depois - Deploy

### Opção A: Automático (Recomendado)

No seu terminal/PowerShell:

```bash
cd d:\.workspace
git add .
git commit -m "Migrar para PostgreSQL Neon"
git push
```

Render faz deploy automaticamente (2-5 min)

### Opção B: Manual

No Render Dashboard:
- Clique em **"Manual Deploy"**
- Selecione **"Deploy latest commit"**

---

## 📊 Verificações Importantes

### 1️⃣ Verificar No Neon

```
https://console.neon.tech
```

- Clique em **SQL Editor**
- Execute:
```sql
SELECT * FROM clientes;
```

### 2️⃣ Testar sua Aplicação

```
https://newaytemporario.com
```

- F12 (abrir console)
- Criar cliente
- Atualizar página
- Dados ainda estão lá?

### 3️⃣ Verificar API

```
https://gestao-web-a8sl.onrender.com/api/clientes
```

Deve retornar JSON com seus clientes

---

## 💾 Backup da String (SALVE ISSO!)

```
postgresql://neondb_owner:npg_pqfBJlwj05xQ@ep-sparkling-thunder-aq3epi3a-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

⚠️ **Não compartilhe essa string com ninguém!**

---

## 📋 Checklist Rápido

- [ ] Acessei dashboard.render.com
- [ ] Selecionei gestao-web-a8sl
- [ ] Adicionei DATABASE_URL
- [ ] Colei a string exatamente
- [ ] Cliquei Save
- [ ] Fiz git push (ou deploy manual)
- [ ] Aguardei 5 minutos
- [ ] Testei em https://newaytemporario.com
- [ ] Dados persistem? ✅

---

## 🎉 FEITO!

Seu banco agora é online e seguro! 🚀

Dúvidas? Leia [DEPLOY_POSTGRES.md](DEPLOY_POSTGRES.md)
