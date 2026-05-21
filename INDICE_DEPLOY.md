# 📚 Índice de Guias de Deploy

Escolha o guia que melhor se encaixa no seu caso:

---

## 🚀 Escolha Rápida

### **Quero fazer deploy em 5 minutos (Passo-a-Passo Simples)**
👉 Leia: **[DEPLOY_RAPIDO.md](DEPLOY_RAPIDO.md)**

Inclui:
- ✅ Passo 1: Fazer Build
- ✅ Passo 2: Upload para Valuehost (Frontend)
- ✅ Passo 3: Deploy em Railway (Backend)
- ✅ Passo 4: Conectar Frontend ← → Backend
- ✅ Passo 5: Testar

**Tempo**: ~5-10 minutos

---

### **Quero guia detalhado sobre Valuehost (Frontend)**
👉 Leia: **[DEPLOY_VALUEHOST.md](DEPLOY_VALUEHOST.md)**

Inclui:
- ✅ Build do projeto
- ✅ 2 métodos de upload (Gerenciador ou FTP)
- ✅ Troubleshooting detalhado
- ✅ Testes em produção

**Tempo**: ~20 minutos

---

### **Quero entender Railway (Backend Node.js)**
👉 Leia: **[DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)**

Inclui:
- ✅ O que é Railway
- ✅ Criar conta
- ✅ Deploy via GitHub (Automático!)
- ✅ Configurar variáveis de ambiente
- ✅ Troubleshooting completo

**Tempo**: ~15 minutos

---

## 📊 Arquitetura

```
┌─────────────────────────────────────┐
│  Valuehost (Hospedagem PHP)         │
│  ├─ Frontend React (dist/)          │
│  └─ https://seudominio.com.br       │
└─────────────────────────────────────┘
              ↓ HTTP + WebSocket
        ┌─────────────────────────────────────┐
        │  Railway (Hospedagem Node.js)       │
        │  ├─ Backend Express + Socket.io     │
        │  └─ https://app-prod-xxxx.railway  │
        └─────────────────────────────────────┘
```

---

## 📋 Pré-Requisitos Para Ambos

### Antes de começar, certifique que tem:

- ✅ **Conta Valuehost** - https://painel.valuehost.com.br
- ✅ **Domínio próprio** - Em seu registrador (ex: UOL, GoDaddy)
- ✅ **Conta GitHub** - https://github.com (crie se não tiver)
- ✅ **Conta Railway** - https://railway.app (crie se não tiver)
- ✅ **Git instalado** - No seu computador (windows: https://git-scm.com)
- ✅ **Node.js** - Já tem (você rodou o projeto localmente)

---

## 🎯 Fluxo Completo de Deploy

```
1. PREPARAÇÃO
   ├─ npm run build (Frontend)
   └─ npm run server:build (Backend)

2. VALUEHOST (Frontend)
   ├─ Acessar painel.valuehost.com.br
   ├─ Gerenciador de Arquivos
   ├─ Deletar tudo em public_html/
   └─ Upload de dist/ completo

3. RAILWAY (Backend)
   ├─ Criar conta em railway.app
   ├─ Conectar GitHub
   ├─ Configurar variáveis (PORT, CORS_ORIGIN)
   └─ Obter URL do backend

4. CONECTAR
   ├─ Criar .env.local com VITE_API_URL
   ├─ npm run build (Frontend novamente)
   └─ Upload novo dist/ para Valuehost

5. TESTAR
   ├─ Abrir https://seudominio.com.br
   ├─ Abrir em 2 abas diferentes
   └─ Criar cliente → Sincroniza em tempo real? ✅
```

---

## 📁 Arquivos de Deploy

| Arquivo | Para | Tempo | Dificuldade |
|---------|------|-------|-----------|
| [DEPLOY_RAPIDO.md](DEPLOY_RAPIDO.md) | Início Rápido | 5 min | ⭐ Fácil |
| [DEPLOY_VALUEHOST.md](DEPLOY_VALUEHOST.md) | Frontend | 20 min | ⭐⭐ Médio |
| [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md) | Backend | 15 min | ⭐⭐ Médio |
| [DEPLOY_VALUEHOST.md](DEPLOY_VALUEHOST.md#-passo-3-deploy-do-backend) | Integração | 10 min | ⭐⭐⭐ Avançado |

---

## 🚨 Erros Comuns e Soluções Rápidas

### "Página não encontra - 404"
```
✅ Solução: Verifique se index.html está em public_html/
           (não dentro de uma subpasta)
```

### "Styling ruim ou CSS não carrega"
```
✅ Solução: Limpe cache navegador (Ctrl+Shift+Delete)
           Recarregue (Ctrl+F5)
```

### "WebSocket connection refused"
```
✅ Solução: Verifique se CORS_ORIGIN em Railway = seu domínio
           Deve ser: https://seudominio.com.br
```

### "Cannot find module 'socket.io'"
```
✅ Solução: Em Railway, configure "Start Command":
           node server/dist/index.js
```

---

## 💬 Perguntas Frequentes

### P: Valuehost suporta Node.js?
**R:** Não. Valuehost é hospedagem compartilhada PHP. Use Railway para Node.js.

### P: Quanto custa Railway?
**R:** $5/mês em créditos grátis. Para apps pequenas, sempre grátis!

### P: Preciso de Valuehost se usar Railway?
**R:** Não, mas Railway Node.js é caro sozinho. Valuehost frontend é barato. Combine!

### P: Posso usar outro serviço em vez de Railway?
**R:** Sim! Render.com, Heroku (descontinuado), AWS, Azure também funcionam.

### P: Como atualizar depois do deploy?
**R:** `git push` → Railway auto-faz rebuild. Valuehost: re-upload pasta dist/.

### P: Meu banco de dados vai para o ar quando reinicia?
**R:** Sim. db.json usa filesystem. Use PostgreSQL/MongoDB para produção real.

---

## 🎓 Documentação Adicional

### Sobre o Projeto
- [README.md](README.md) - Documentação geral
- [COMECE_AQUI.md](COMECE_AQUI.md) - Começar localmente
- [COLABORACAO_TEMPO_REAL.md](COLABORACAO_TEMPO_REAL.md) - Sistema WebSocket

### Técnico
- [REFERENCIA_TECNICA.md](REFERENCIA_TECNICA.md) - WebSocket detalhado
- [IMPLEMENTACAO_RESUMO.md](IMPLEMENTACAO_RESUMO.md) - O que foi implementado

---

## ✅ Checklist Antes de Deploy

- [ ] Código funciona localmente: `npm run dev:with-server`
- [ ] Build sem erros: `npm run build`
- [ ] Backend builds: `npm run server:build`
- [ ] Código commitado em Git
- [ ] Repositório em GitHub
- [ ] Conta Railway criada
- [ ] Credenciais Valuehost acessíveis

---

## 🚀 Vamos Começar!

### Se está com pressa:
👉 Vá para [DEPLOY_RAPIDO.md](DEPLOY_RAPIDO.md)

### Se quer entender cada passo:
👉 Comece por [DEPLOY_VALUEHOST.md](DEPLOY_VALUEHOST.md)
👉 Depois [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)

### Se tem dúvida específica:
👉 Use Ctrl+F neste arquivo para buscar

---

## 📞 Suporte

**Suporte Valuehost:**
- Email: suporte@valuehost.com.br
- Painel: https://painel.valuehost.com.br

**Suporte Railway:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Email: support@railway.app

**Suporte GitHub:**
- Docs: https://docs.github.com
- Community: https://github.community

---

## 📊 Status de Deploy

```
🟢 Frontend - Pronto para Valuehost
🟢 Backend  - Pronto para Railway
🟢 WebSocket - Implementado e testado
🟢 Colaboração - Funcionando
🟢 Documentação - Completa
```

**Próximo passo:** Escolha um guia acima e comece! 🚀

---

**Última atualização**: 20 de Maio de 2026
**Versão do Sistema**: 0.2.0 (com Colaboração em Tempo Real)
**Status**: ✅ Pronto para Deploy
