# ✅ Guia de Teste - Sistema Sincronizado

## 1️⃣ Teste Básico (5 minutos)

### Terminal 1 - Iniciar Backend
```powershell
cd d:\.workspace\server
npm run dev
```

Esperar até ver:
```
✅ Servidor rodando em https://newaytemporario.com/api
🔗 CORS habilitado para: http://localhost:5173
📁 Database: ...
```

### Terminal 2 - Iniciar Frontend
```powershell
cd d:\.workspace
npm run dev
```

A aplicação abrirá em `http://localhost:5173`

---

## 2️⃣ Teste de Sincronização

### ✅ Teste 1: Adicionar Cliente
1. Clique em **"Adicionar novo cliente"**
2. Preencha os dados:
   - Nome: `Teste Neway`
   - Squad: `BR`
   - Serviços: Selecione 3
   - Fee: `5000`
   - Status: `Ativo`
3. Clique em **"Salvar"**

**Validar:**
- ✓ Cliente aparece na lista
- ✓ Status mostra "✓ Sincronizado com servidor"
- ✓ Arquivo `server/db.json` foi atualizado

### Verificar db.json
```powershell
cd server
type db.json
```

Você deve ver o cliente salvo no arquivo JSON.

---

### ✅ Teste 2: Atualizar Fee
1. Clique em um cliente
2. Clique no valor do Fee para editar
3. Altere para `6000`
4. Pressione Enter

**Validar:**
- ✓ Fee atualizado
- ✓ Histórico registra a mudança
- ✓ Seta verde (⬆️) mostra aumento de 20%
- ✓ `db.json` atualizado

---

### ✅ Teste 3: Offline Mode
1. Feche o servidor (Ctrl+C no Terminal 1)
2. Status muda para "⚠ Modo offline - dados em cache local"
3. Adicione um novo cliente
4. Recarregue a página (F5)

**Validar:**
- ✓ Cliente continua lá (cache local)
- ✓ Dados persistem offline

### ✅ Teste 4: Reconexão
1. Reinicie o servidor no Terminal 1
2. Recarregue a página
3. Status muda para "✓ Sincronizado com servidor"

**Validar:**
- ✓ Dados sincronizam automaticamente
- ✓ Cliente offline agora está no servidor

---

## 3️⃣ Teste Multi-User (Colaboração)

### Simular 2 Usuários

**Usuário 1:**
1. Abra `http://localhost:5173` em um navegador
2. Adicione cliente: `Cliente A`

**Usuário 2:**
1. Abra `http://localhost:5173` em outro navegador/aba
2. Recarregue a página (F5)
3. Clique em "Clientes" na navegação

**Validar:**
- ✓ Usuário 2 vê o "Cliente A" adicionado pelo Usuário 1
- ✓ Ambos estão sincronizados com o servidor

---

## 4️⃣ Teste de Histórico

1. Adicione um cliente
2. Clique no cliente para expandir
3. Clique em **"Ver histórico"**

**Validar:**
- ✓ Mostra criação
- ✓ Mostra atualizações de fee
- ✓ Mostra adição/remoção de serviços
- ✓ Data e hora corretas

---

## 5️⃣ Monitorar Requisições

### Chrome DevTools
1. Abra `http://localhost:5173`
2. Pressione F12
3. Vá para a aba **Network**
4. Execute operações (adicionar, atualizar cliente)

**Validar:**
- ✓ Requisições para `https://newaytemporario.com/api/clientes`
- ✓ Status 200 (sucesso)
- ✓ Payload correto no JSON

### No Terminal do Servidor
Cada operação mostra:
```
[2024-01-15T10:30:45.123Z] POST /api/clientes
[2024-01-15T10:30:46.456Z] PUT /api/clientes/cli_1234567890_xyz
```

---

## ❌ Troubleshooting

### Problema: "Failed to fetch"
- ✓ Verifique se servidor está rodando na porta 3001
- ✓ Confirme `.env.local` contém `VITE_API_URL=https://newaytemporario.com/api`

### Problema: "Port 3001 already in use"
```powershell
# Windows - Encontrar processo na porta 3001
netstat -ano | findstr :3001

# Matar o processo
taskkill /PID <PID> /F
```

### Problema: "Cannot GET /api/clientes"
- ✓ Servidor não iniciou corretamente
- ✓ Reinicie: `npm run dev` na pasta `server`

### Problema: Dados não sincronizam
- ✓ Abra Console (F12)
- ✓ Procure por erros de requisição
- ✓ Verifique se `.env.local` existe

---

## 🎉 Sucesso!

Se todos os testes passaram:
- ✅ Backend funcionando
- ✅ Frontend funcionando
- ✅ Sincronização funcionando
- ✅ Modo offline funcionando
- ✅ Colaboração funcional

**Próximo passo:** Deploy em Valuehost (consulte `DEPLOY_VALUEHOST.md`)
