# 🚀 Sistema de Gerenciamento de Clientes - Com Sincronização em Servidor

## 📋 Novo: Integração com Backend

Agora o sistema sincroniza dados com um servidor Node.js + Express, permitindo colaboração em tempo real entre membros da equipe!

### ✨ Características Novas

- ✅ **Sincronização com servidor** - Dados compartilhados entre equipe
- ✅ **Offline-first** - Funciona sem internet, sincroniza quando voltarem
- ✅ **Indicador de status** - Mostra se está conectado ao servidor
- ✅ **Retry automático** - Tenta reconectar automaticamente
- ✅ **Cache local** - Preserva dados mesmo offline

---

## 🔧 Instalação

### Passo 1: Instalar dependências do cliente
```bash
cd d:\.workspace
npm install
```

### Passo 2: Instalar dependências do servidor
```bash
cd server
npm install
```

---

## 🎯 Como Rodar (Desenvolvimento)

### Terminal 1 - Iniciar o servidor backend
```bash
cd d:\.workspace\server
npm run dev
```

Saída esperada:
```
✅ Servidor rodando em https://newaytemporario.com/api
🔗 CORS habilitado para: http://localhost:5173
📁 Database: {path}/db.json
```

### Terminal 2 - Iniciar o cliente frontend
```bash
cd d:\.workspace
npm run dev
```

A aplicação abrirá em `http://localhost:5173`

---

## 📊 Arquitetura

```
┌─────────────────────┐
│   Frontend React    │
│   (Port 5173)       │
└──────────┬──────────┘
           │ HTTP Requests
           ▼
┌─────────────────────┐
│  Backend Express    │
│   (Port 3001)       │
└──────────┬──────────┘
           │ Read/Write
           ▼
┌─────────────────────┐
│   Database (JSON)   │
│  (server/db.json)   │
└─────────────────────┘
```

---

## 🔌 API Endpoints

### GET `/api/clientes`
Obter todos os clientes
```json
{
  "success": true,
  "data": [...]
}
```

### POST `/api/clientes`
Criar novo cliente
```json
{
  "nome": "Cliente X",
  "squad": "BR",
  "servicos": [...],
  "fee": 5000,
  "status": "Ativo",
  "dataCreate": "...",
  "dataUpdate": "...",
  "historico": [...]
}
```

### PUT `/api/clientes/:id`
Atualizar cliente existente

### DELETE `/api/clientes/:id`
Deletar cliente

### POST `/api/clientes/batch/sync`
Sincronizar múltiplos clientes
```json
{
  "clientes": [...]
}
```

---

## 🌐 Deploy

### Para Valuehost (PHP/MySQL)

1. Build o frontend:
```bash
npm run build
```

2. Upload dos arquivos `dist/` para `/public_html/gestao/`

3. Para o backend, você terá opções:
   - Usar Node.js standalone (se Valuehost suporta)
   - Migrar para PHP + MySQL (vamos criar scripts de migração)
   - Usar serviço externo (Heroku, Railway, etc)

Consulte `DEPLOY_VALUEHOST.md` para instruções completas.

---

## 📱 Funcionalidades Mantidas

- ✅ Adicionar novos clientes com dados completos
- ✅ Seleção de Squad (BR ou USA)
- ✅ 11 tipos de serviços com checkboxes
- ✅ Cálculo automático de quantidade de serviços
- ✅ Gerenciamento de Fee e Status (Ativo/Churn)
- ✅ Lista de clientes com destaque para Churn
- ✅ Histórico completo de edições com data/hora
- ✅ Indicadores visuais de variação (setas ⬆️⬇️ e percentuais)
- ✅ Edição inline de Fee com rastreamento
- ✅ Modal de histórico com todos os eventos
- ✅ Interface responsiva
- ✅ **NOVO: Dashboard com gráficos e métricas**

---

## 🔒 Segurança (Para produção)

Antes de fazer deploy:

1. **Autenticação** - Adicionar JWT ou OAuth
2. **CORS** - Configurar origens permitidas
3. **Rate limiting** - Proteger contra abuse
4. **Validação** - Validar todos os inputs
5. **HTTPS** - Usar SSL/TLS

---

## 📞 Suporte

Para problemas com sincronização:

1. Verifica se o servidor está rodando na porta 3001
2. Check console do navegador (F12) para erros de rede
3. Verifica se `.env.local` está configurado corretamente
4. Limpa o cache local: `localStorage.clear()` no console

---

## 📝 Próximas Melhorias

- [ ] Autenticação de usuários
- [ ] Permissões por role (admin, editor, viewer)
- [ ] Histórico detalhado de quem fez cada mudança
- [ ] Filtros avançados
- [ ] Exportação em CSV/PDF
- [ ] Importação em lote
- [ ] Webhooks para integrações
