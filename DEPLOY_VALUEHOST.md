# 🚀 Guia de Deploy - Sistema de Gerenciamento de Clientes na Valuehost

## ✅ Status Atual
- [x] Build compilado com sucesso
- [x] Pasta `dist/` pronta para upload (Frontend)
- [x] Backend com WebSocket implementado
- [x] Sistema de colaboração em tempo real
- [ ] Frontend enviado para servidor
- [ ] Backend enviado para servidor (Node.js)
- [ ] Sistema testado em produção com colaboração

## 📦 Arquivos Prontos para Upload

### Frontend (React Vite)
Localização: `d:\workspace\dist\`

Estrutura:
```
dist/
├── index.html              (0.54 kB)
└── assets/
    ├── index-BoPOvo4G.css  (15.23 kB)
    └── index-D6xm5kx6.js   (550.77 kB)
```

**Total**: ~566 kB

### Backend (Node.js + Express + Socket.io)
Localização: `d:\workspace\server\dist\` (após build)

Estrutura:
```
server/dist/
├── index.js
└── database.js
```

**Nota**: Backend não pode ser hospedado na Valuehost (hospedagem compartilhada PHP). Use serviço Node.js.

---

## 🎯 Arquitetura de Deploy

```
Seu Domínio (Valuehost)          Servidor Node.js (Railway/Render)
     ↓                                  ↓
  Frontend                           Backend
  (React)                        (Express + Socket.io)
   dist/                             server/dist/
     │                                 │
     ├─ index.html          API────────┤
     ├─ assets/CSS                     ├─ /api/clientes
     └─ assets/JS           WebSocket──┤─ Events
                                       │
                                  Database
                                 (db.json)
```

---

## 📋 PASSO 1: Fazer Build do Projeto

### Método 1: Upload via Gerenciador de Arquivos (RECOMENDADO)

### Passo 1: Acessar o Painel
1. Abra https://painel.valuehost.com.br (ou seu painel específico)
2. Faça login com suas credenciais
3. Procure por **"Gerenciador de Arquivos"** ou **"File Manager"**
4. Clique para abrir

### Passo 2: Navegar até `public_html`
1. No gerenciador de arquivos, localize a pasta `public_html`
2. Clique para entrar nela
3. Você deve ver a estrutura atual do seu site (se houver)

### Passo 3: Limpar Pasta (Importante!)
**ATENÇÃO**: Antes de fazer upload dos novos arquivos:
1. Selecione TODOS os arquivos e pastas em `public_html`
   - Use Ctrl+A ou selecione manualmente
2. Clique em **"Deletar"** ou **"Delete"**
3. Confirme a exclusão
4. Aguarde a operação completar

> **Por quê?** Alguns arquivos antigos podem conflitar com o novo sistema.

### Passo 4: Fazer Upload dos Arquivos
1. Abra uma nova janela/aba do navegador
2. Navegue até `d:\workspace\dist` no seu computador
3. Selecione TODOS os arquivos:
   - `index.html`
   - Pasta `assets/` com seus arquivos dentro
4. Arraste e solte na janela do gerenciador de arquivos, OU
5. Clique no botão **"Upload"** no gerenciador e selecione os arquivos

> **Dica**: Se a pasta assets não aparecer automaticamente, faça upload da pasta vazia primeiro, depois faça upload dos arquivos CSS e JS dentro dela.

### Passo 5: Verificar Upload
- Todos os arquivos aparecem em `public_html`?
- `index.html` está presente?
- Pasta `assets/` contém os 2 arquivos?

---

---

### Método 2: Upload via FTP (Alternativa com FileZilla)

### Se você preferir usar FTP:

1. **Baixar FileZilla** (gratuito)
   - https://filezilla-project.org/

2. **Configurar Conexão**
   - Abra FileZilla
   - Vá em `File` → `Site Manager` (Ctrl+S)
   - Clique em "New Site"
   - Preencha com seus dados Valuehost:
     ```
     Host: ftp.seudominio.com.br  (veja em painel Valuehost)
     Port: 21 (padrão FTP)
     Protocol: FTP - File Transfer Protocol
     Logon Type: Normal
     User: seu_usuario_ftp
     Password: sua_senha_ftp
     ```
   - Clique "Connect"

3. **Navegar até `public_html`**
   - Lado direito (Remote site): procure pasta `public_html`
   - Duplo-clique para entrar

4. **Fazer Upload**
   - Lado esquerdo (Local site): navegue até `d:\workspace\dist`
   - Selecione `index.html` + pasta `assets/`
   - Arraste para o lado direito OU clique com botão direito → "Upload"

5. **Aguardar Conclusão**
   - FileZilla mostrará progresso
   - Quando terminar, verifique se os arquivos aparecem no lado direito

---

## 🔧 PASSO 2: Deploy do Backend (Node.js + Express + Socket.io)

### ⚠️ IMPORTANTE: Valuehost não suporta Node.js nativamente

Valuehost é uma hospedagem compartilhada **PHP**. Para usar Node.js, você precisa usar um serviço externo.

### 🚀 Opções de Hosting para Backend

#### Opção 1: **Railway.app** (RECOMENDADO - Mais fácil)

**Vantagens**:
- ✅ Suporta Node.js nativamente
- ✅ Muito fácil de configurar
- ✅ Plano gratuito generoso ($5/mês crédito)
- ✅ Integração com GitHub automática

**Passo 1: Criar Conta**
1. Acesse https://railway.app
2. Clique em "Sign Up"
3. Conecte com GitHub (mais fácil) ou crie conta
4. Confirme email

**Passo 2: Preparar Backend para Railway**
```bash
# No terminal, na pasta do projeto
cd d:\workspace

# 1. Certifique que tem server/package.json com script de start
# Verifique que existe: "start": "node dist/index.js"

# 2. Fazer build do server
npm run server:build

# 3. Verificar se server/dist/ foi criado
dir server/dist
```

**Passo 3: Fazer Upload para Railway**

Opção A: Via GitHub (Automático)
```bash
# 1. Empurre seu código para GitHub
git add .
git commit -m "Deploy backend para Railway"
git push origin main

# 2. No Railway, clique em "Create New" → "Project from GitHub"
# 3. Selecione seu repositório
# 4. Selecione a pasta "server" como base
# 5. Railway faz deploy automaticamente!
```

Opção B: Via CLI Railway (Manual)
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login no Railway
railway login

# 3. Criar novo projeto
railway init

# 4. Configurar variáveis de ambiente
# No painel Railway, vá em "Variables"
# Adicione:
PORT=3001
CORS_ORIGIN=https://seudominio.com.br

# 5. Fazer deploy
railway up
```

**Obter URL do Backend Railway**
1. No painel Railway, clique em seu projeto
2. Clique em "Deployments"
3. Procure pelo "Domain"
4. Será algo como: `https://seu-app-production-xxxx.up.railway.app`

---

#### Opção 2: Render.com (Alternativa)

**Vantagens**:
- ✅ Suporta Node.js
- ✅ Plano free, depois $7/mês
- ✅ Fácil de usar

**Passos Similares a Railway**:
1. Acesse https://render.com
2. Sign up com GitHub
3. "New" → "Web Service"
4. Conecte seu GitHub
5. Selecione repositório
6. Environment: Node
7. Build: `npm run server:build`
8. Start: `node server/dist/index.js`
9. Adicione variáveis de ambiente
10. Deploy!

---

#### Opção 3: Heroku (Descontinuado)

❌ **NÃO USE** - Heroku descontinuou plano gratuito em 2022

---

### 🔗 PASSO 3: Conectar Frontend ao Backend

Após fazer deploy do backend, você terá uma URL como:
```
https://seu-app-production-xxxx.up.railway.app
```

**Atualizar Frontend com essa URL:**

1. Editar arquivo `src/App.tsx` (ou arquivo de env)

**Opção A: Usar arquivo .env.local**
```
# Criar arquivo .env.local na raiz do projeto
VITE_API_URL=https://seu-app-production-xxxx.up.railway.app/api
```

**Opção B: Editar arquivo direto**
- Editar `src/utils/ApiClient.ts`
- Mudar: `BASE_URL: import.meta.env.VITE_API_URL || 'https://seu-app-production-xxxx.up.railway.app/api'`

2. Fazer build novamente:
```bash
npm run build
```

3. Upload dos novos arquivos para `public_html/` (apenas a pasta `dist/`)

---

### ✅ PASSO 4: Testar Colaboração em Tempo Real em Produção

1. Acesse seu site: `https://seudominio.com.br`
2. Abra em múltiplas abas ou navegadores
3. Crie um cliente em uma aba
4. ✅ Deve aparecer instantaneamente nas outras abas
5. Veja no topo: "✓ Colaboração em tempo real" (verde)
6. Veja: "👥 N usuários online"

**Se não sincronizar:**
- Abra Console (F12)
- Procure por erros em vermelho
- Verifique se backend está rodando (Railway)
- Verifique se URL do backend está correta

---

## 📊 Checklist Completo de Deploy

### Frontend (Valuehost)
- [ ] `npm run build` executado com sucesso
- [ ] Pasta `dist/` contém `index.html` + `assets/`
- [ ] Arquivos uploados para `public_html/`
- [ ] Site acessível em `https://seudominio.com.br`
- [ ] Sem erros no console (F12)
- [ ] Adicionar cliente funciona

### Backend (Railway/Render)
- [ ] Conta criada em Railway ou Render
- [ ] `npm run server:build` executado
- [ ] Código enviado para GitHub/Git
- [ ] Deploy realizado com sucesso
- [ ] URL do backend obtida
- [ ] Variáveis de ambiente configuradas
- [ ] CORS_ORIGIN aponta para seu domínio

### Integração
- [ ] `VITE_API_URL` atualizado no frontend
- [ ] Build do frontend refeito
- [ ] Frontend re-enviado para Valuehost
- [ ] Testar em múltiplas abas → sincroniza ✅
- [ ] "Colaboração em tempo real" mostra verde ✅
- [ ] Contagem de usuários funciona ✅

---

## 🌐 Testando após Upload

### 1. **Acessar o Site**
- Abra seu navegador
- Digite: `https://seudominio.com.br`
- Aguarde carregar (pode levar 10-30 segundos na primeira vez)

### 2. **Verificar Console para Erros**
- Pressione `F12` no navegador
- Vá para aba **"Console"**
- Procure por mensagens em vermelho (erros)
- Procure por avisos em amarelo (warnings)

### 3. **Testar Funcionalidades**
- ✅ Página carrega normalmente?
- ✅ Pode adicionar novo cliente?
- ✅ Pode editar cliente existente?
- ✅ Histórico de edições funciona?
- ✅ Dados salvam ao recarregar a página? (localStorage)
- ✅ Indicadores de variação mostram corretamente?

### 4. **Testar em Mobile**
- Abra site no telefone via `https://seudominio.com.br`
- Tente interagir com alguns elementos
- Verifique se layout se adapta corretamente

---

## ⚠️ Solução de Problemas

### Problema: "Página não encontrada" ou "404"
- **Solução**: 
  - Verifique se `index.html` realmente está em `public_html/`
  - Tente acessar `https://seudominio.com.br/index.html` diretamente
  - Se isso funcionar, contate suporte Valuehost sobre configurações do servidor web

### Problema: "Página em branco" ou conteúdo não carrega
- **Solução**:
  - Limpe cache: `Ctrl+Shift+Delete` → Selecione "Todos os tempos" → "Limpar"
  - Recarregue página: `F5`
  - Verifique console (F12) para erros JavaScript

### Problema: "Styling está ruim" ou "CSS não carrega"
- **Solução**:
  - Abra DevTools (F12) → aba "Network"
  - Recarregue página (F5)
  - Procure por arquivo CSS com status 404 (vermelho)
  - Se houver, verifique se arquivo está em `public_html/assets/`

### Problema: "localStorage não persiste dados"
- **Solução**:
  - Verifique em F12 → "Application" → "Local Storage"
  - Dados devem estar lá após adicionar cliente
  - Se não aparecer, pode ser bloqueado por navegador/extensão

### Problema: "Dados somem ao recarregar"
- **Solução**:
  - Isso NÃO deve acontecer! O sistema salva em localStorage
  - Tente acessar em navegador sem extensões (Incógnito)
  - Contate suporte se problema persistir

---

## 📞 Informações Úteis

### Valuehost
- **Painel de Controle**: https://painel.valuehost.com.br
- **Documentação FTP**: Veja em seu painel → Conta/Settings
- **Suporte**: Contate via ticket no painel ou email suporte@valuehost.com.br
- **DNS**: Se tiver domínio próprio, configure DNS em seu registrador

### Railway
- **Site**: https://railway.app
- **Documentação**: https://docs.railway.app
- **Status**: https://railway.app/status
- **Suporte**: Discord community muito ativo

### Render
- **Site**: https://render.com
- **Documentação**: https://render.com/docs
- **Email Support**: support@render.com

---

## 🎯 Fluxo de Atualização Futura

Após primeiro deploy, para atualizar:

**Frontend:**
```bash
# 1. Fazer alterações no código
# 2. Build
npm run build
# 3. Upload da pasta dist/ para Valuehost (via File Manager)
```

**Backend:**
```bash
# 1. Fazer alterações no código
# 2. Build do server
npm run server:build
# 3. Push para GitHub
git add .
git commit -m "Update backend"
git push
# 4. Railway auto-faz deploy! (Se usando GitHub integration)
```

---

## 📋 Checklist Final de Deploy

Antes de considerar o deploy completo:

- [ ] Build realizado com `npm run build`
- [ ] Pasta `dist/` contém `index.html` + pasta `assets/`
- [ ] Arquivos foram uploadados para `public_html/`
- [ ] Pode acessar `https://seudominio.com.br` no navegador
- [ ] Página carrega sem erros no console (F12)
- [ ] Pode adicionar novo cliente e dados salvam
- [ ] Pode recarregar página e dados continuam (localStorage)
- [ ] Indicadores visuais funcionam (cores, setas, percentuais)
- [ ] Backend testado em Railway/Render
- [ ] Frontend pode se conectar ao backend (sem erros WebSocket)
- [ ] Criar cliente sincroniza para múltiplas abas
- [ ] Editar cliente sincroniza em tempo real
- [ ] Deletar cliente funciona para todos
- [ ] Contagem de usuários online atualiza
- [ ] Indicador "Colaboração em tempo real" mostra verde

---

## 🚀 Acessos Finais

### Seu Sistema em Produção
```
Frontend:  https://seudominio.com.br
Backend:   https://seu-app-production-xxxx.up.railway.app
API:       https://seu-app-production-xxxx.up.railway.app/api
```

### Testar Colaboração
Abra a URL em 2 abas diferentes:
```
https://seudominio.com.br (Aba 1)
https://seudominio.com.br (Aba 2)

Crie cliente na Aba 1 → Apareça instantaneamente na Aba 2 ✅
```

---

Se tudo passou no checklist acima, seu sistema está **ativo em produção**!

Para atualizações futuras:
1. Faça alterações no código local
2. Rode `npm run build`
3. Repita os passos de upload (exceto o passo de limpeza completa se quiser preservar dados)

---

**Data do Deploy**: 12 de Maio de 2026  
**Versão do Sistema**: 0.1.0  
**Status**: Pronto para Upload ✅
