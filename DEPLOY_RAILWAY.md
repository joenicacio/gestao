# 🚂 Guia Completo - Deploy Backend em Railway

Railway é a plataforma mais fácil para fazer deploy do seu backend Node.js. Este guia passo-a-passo explica tudo.

---

## ❓ O que é Railway?

Railway é um serviço de hosting que suporta Node.js, Python, Go, PHP e mais. Perfeito para backends!

**Vantagens:**
- ✅ Muito fácil de usar
- ✅ Suporta Node.js + Express
- ✅ WebSocket funciona perfeitamente
- ✅ Deploy automático via GitHub
- ✅ $5/mês em créditos grátis (mais que suficiente)
- ✅ Dashboard intuitivo

---

## 📋 Pré-Requisitos

- ✅ Conta GitHub (criar em github.com se não tiver)
- ✅ Código do projeto em local (`d:\workspace`)
- ✅ Terminal/PowerShell funcionando

---

## PASSO 1: Preparar o Código para Railway

### 1.1 - Verificar package.json do Backend

Abra `server/package.json` e certifique que tem:

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "node --loader ts-node/esm src/index.ts",
    "build": "tsc"
  }
}
```

✅ Se tem esses scripts, pode continuar!

### 1.2 - Fazer Build Local

```powershell
# No terminal em d:\workspace

# Build frontend
npm run build

# Build backend
npm run server:build

# Verificar se funcionou
dir server/dist
# Deve mostrar: index.js, database.js
```

✅ Se gerou os arquivos, sucesso!

### 1.3 - Fazer Commit Git

```powershell
# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Ready for Railway deployment"

# Se não tem repositório ainda:
git init
git add .
git commit -m "Initial commit"
```

✅ Código pronto para upload!

---

## PASSO 2: Criar Conta em Railway

### 2.1 - Acessar Railway

1. Abra https://railway.app
2. Clique em **"Get Started"** ou **"Sign Up"**

### 2.2 - Criar Conta (com GitHub é mais fácil)

1. Clique em **"Continue with GitHub"**
2. Autorize Railway a acessar sua conta GitHub
3. Confirme email

✅ Conta criada!

---

## PASSO 3: Fazer Deploy do Backend

### 3.1 - Upload para GitHub (Se Ainda Não Tiver)

```powershell
# No terminal em d:\workspace

# Se não tem remote GitHub ainda:
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main

# Exemplo real:
# git remote add origin https://github.com/joao-silva/meu-sistema.git
# git push -u origin main
```

✅ Código está em GitHub!

### 3.2 - Criar Projeto em Railway

1. Acesse https://railway.app/dashboard
2. Clique em **"Create New Project"** (ou + sign)
3. Selecione **"Deploy from GitHub repo"**

### 3.3 - Conectar Repositório GitHub

1. Clique em **"Connect GitHub Account"** (primeira vez)
2. Autorize Railway a acessar GitHub
3. Selecione seu repositório na lista
4. Clique em **"Deploy"**

Railway vai começar a fazer build automaticamente! 

✅ Aguarde ~5 minutos para completar o build...

### 3.4 - Verificar Status do Deploy

1. Na página do projeto, você verá **"Deployments"**
2. Se tiver uma **bolinha verde**, está rodando! ✅
3. Se tiver **vermelha**, teve erro. Clique para ver logs.

---

## PASSO 4: Configurar Variáveis de Ambiente

### 4.1 - Acessar Settings

1. No painel Railway, clique em seu projeto
2. Procure por **"Variables"** (à esquerda)
3. Clique em **"Add Variable"**

### 4.2 - Adicionar Variáveis

Adicione essas variáveis (uma por uma):

**Variável 1: PORT**
```
Key: PORT
Value: 3001
```

**Variável 2: CORS_ORIGIN**
```
Key: CORS_ORIGIN
Value: https://seudominio.com.br
```

(Substitua `seudominio.com.br` pelo seu domínio real)

✅ Variáveis configuradas!

---

## PASSO 5: Obter URL do Backend

### 5.1 - Encontrar Domain

1. No painel Railway, vá em **"Deployments"**
2. Procure pela seção **"Domain"** (no topo)
3. Você verá algo como: `https://seu-app-production-abc123.up.railway.app`

### 5.2 - Copiar URL

Copie exatamente essa URL. Vai usar em PASSO 6.

Exemplo completa:
```
https://seu-app-production-abc123.up.railway.app
```

✅ URL do backend obtida!

---

## PASSO 6: Conectar Frontend ao Backend

### 6.1 - Criar arquivo .env.local

No seu projeto (`d:\workspace`), crie arquivo chamado `.env.local`:

```
VITE_API_URL=https://seu-app-production-abc123.up.railway.app/api
```

**Copie exatamente** a URL que obteve no PASSO 5, adicione `/api` no final.

### 6.2 - Fazer Build do Frontend

```powershell
# No terminal em d:\workspace
npm run build
```

✅ Build concluído!

### 6.3 - Upload para Valuehost

1. Gerenciador de Arquivos Valuehost
2. Navegue até `public_html/`
3. Delete tudo
4. Upload pasta `dist/` (de `d:\workspace\dist`)

✅ Frontend atualizado!

---

## PASSO 7: Testar Tudo

### 7.1 - Testar Frontend

1. Abra https://seudominio.com.br
2. Verifique no topo: **"✓ Colaboração em tempo real"** (verde)

### 7.2 - Testar Sincronização

1. Abra https://seudominio.com.br em 2 abas
2. Na Aba 1: Clique "Adicionar novo cliente"
3. Preencha dados e clique "Salvar"
4. Na Aba 2: ✅ Cliente deve aparecer instantaneamente!

### 7.3 - Testar Contagem de Usuários

Na Aba 2, você deve ver: **"👥 2 usuários online"**

✅ Tudo funciona!

---

## 🔍 Troubleshooting

### Problema: "Cannot GET /" no Railway

**Solução:**
1. Abra seu repo GitHub
2. Verifique se a pasta `server/dist/` está commitada
3. Se não está, adicione:
   ```powershell
   git add server/dist
   git commit -m "Add server dist"
   git push
   ```
4. Railway vai fazer rebuild

### Problema: "WebSocket connection failed"

**Solução:**
1. Verifique se CORS_ORIGIN está correto em Railway Variables
2. Deve ser exatamente seu domínio: `https://seudominio.com.br`
3. Se tiver `http://` em vez de `https://`, mude
4. Redeployments podem ser necessários

### Problema: "Connection refused" ao conectar Frontend

**Solução:**
1. Verifique se `VITE_API_URL` no `.env.local` está correto
2. Deve ser: `https://seu-app-production-xxxx.up.railway.app/api`
3. Remova qualquer `/` final extra
4. Reconstrua: `npm run build`
5. Re-upload para Valuehost

### Problema: Build falha em Railway

**Solução:**
1. Clique em "Deployments" → seu deployment (vermelho)
2. Role para baixo e procure pela seção **"Logs"**
3. Procure por mensagem de erro em vermelho
4. Corrija localmente e faça novo push para GitHub
5. Railway vai rebuildar automaticamente

---

## 📊 Monitorar Backend

### Verificar Logs

1. Railway Dashboard → seu projeto
2. Clique em **"Logs"** (aba à esquerda)
3. Você verá:
   ```
   [timestamp] Servidor rodando em http://localhost:3001
   👤 Usuário conectado: socket-id
   👥 Usuários online: 3
   ```

### Verificar Status

1. No Dashboard, procure **"Health"** ou **"Status"**
2. Deve mostrar **"Running"** ou **"Healthy"**
3. Se vermelho, clique para diagnosticar

---

## 🚀 Atualizações Futuras

Após primeiro deploy, para atualizar:

```powershell
# Fazer alterações no código
# ...

# Fazer commit
git add .
git commit -m "Update backend feature"

# Push para GitHub
git push

# Railway detecta automaticamente e:
# 1. Faz build
# 2. Testa
# 3. Deploy automaticamente!
# Sem fazer nada mais! 🤖
```

---

## 💰 Custos

- ✅ Primeiros $5/mês: **GRÁTIS** (Railroad)
- Depois: ~$7-15/mês dependendo do uso

Para aplicações pequenas/médias, **nunca vai passar de $5**!

---

## 📞 Suporte Railway

- **Docs**: https://docs.railway.app
- **Discord**: https://discord.gg/railway
- **Email**: support@railway.app
- **Status**: https://railway.app/status

---

## ✅ Checklist Final

- [ ] Código commitado em GitHub
- [ ] Projeto criado em Railway
- [ ] Deploy realizado com sucesso (bolinha verde)
- [ ] Variáveis configuradas (PORT, CORS_ORIGIN)
- [ ] URL do backend obtida
- [ ] `.env.local` criado no projeto local
- [ ] Frontend reconstruído
- [ ] Frontend re-uploadado para Valuehost
- [ ] Testar em 2 abas → sincroniza ✅
- [ ] Vê "Colaboração em tempo real" ✅

---

## 🎉 Pronto!

Backend rodando em Railway com WebSocket funcional!

```
✅ Frontend: https://seudominio.com.br
✅ Backend: https://seu-app-production-xxxx.up.railway.app
✅ Colaboração em Tempo Real: ATIVA 🚀
```

---

**Tempo de setup**: ~15 minutos
**Custo**: Grátis (primeiros $5)
**Complexidade**: Fácil
