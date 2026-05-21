# Setup Neon - Passo a Passo Rápido

## ⚡ Em 5 minutos você terá um banco PostgreSQL online

### Passo 1: Criar Conta no Neon

1. Acesse: https://neon.tech
2. Clique em **"Sign Up"** (canto superior direito)
3. Escolha: **GitHub, Google ou Email**
4. Complete o cadastro

### Passo 2: Criar um Projeto

Após fazer login:

1. Clique em **"New Project"**
2. Configure:
   - **Project name:** `cliente-manager` (ou o nome que quiser)
   - **Database name:** `clientes_db`
   - **Region:** `South America (São Paulo)` (mais rápido para seu caso)
   - **PostgreSQL version:** 16 (padrão)

3. Clique em **"Create Project"**

### Passo 3: Copiar a Connection String

Após criar o projeto, você verá a dashboard.

1. No menu esquerdo, clique em **"Connection String"** ou **"Databases"**
2. Você verá uma string assim:

```
postgresql://user:password@ep-xxx.neon.tech:5432/clientes_db?sslmode=require
```

3. **Copie a URL completa** (clique no ícone de copiar)

### Passo 4: Adicionar ao Backend (no Render)

Você vai colocar essa string em uma variável de ambiente.

**Depois que eu atualizar o código**, você vai:

1. Ir para o **Render Dashboard** (https://dashboard.render.com)
2. Selecionar seu serviço (gestao-web-a8sl)
3. Ir em **"Environment"**
4. Adicionar uma variável:
   - **Name:** `DATABASE_URL`
   - **Value:** (Cole a string do Neon)

5. Clique em **"Save"**

### Pronto! ✅

Seu banco agora está online e conectado.

---

## O que Fazer com Essa String

**SALVE EM UM LUGAR SEGURO** (notas privadas, gerenciador de senhas, etc.)

Exemplo de string:
```
postgresql://neon_user:neon_password123@ep-cool-butterfly-123.neon.tech:5432/clientes_db?sslmode=require
```

⚠️ **NÃO compartilhe essa string públicamente!**

---

## Verificar se Funcionou

Depois do deploy, você pode testar:

1. Abra o Neon Dashboard
2. Vá em **"SQL Editor"**
3. Execute:
   ```sql
   SELECT * FROM clientes;
   ```

Se aparecer vazio = funcionou! (ainda não tem dados porque é novo)

---

## Dashboard do Neon

Seu banco fica em: https://console.neon.tech

Lá você pode:
- ✅ Ver todos os dados
- ✅ Executar queries SQL
- ✅ Ver logs de acesso
- ✅ Fazer backups
- ✅ Escalar plano se necessário

---

## Próximo Passo

Depois de copiar a connection string:

1. Avise-me que tem a string
2. Eu vou atualizar todo o código do backend
3. Você configura a variável no Render
4. Tudo funciona automaticamente! 🚀
