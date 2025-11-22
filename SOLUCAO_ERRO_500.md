# 🔧 Solução para Erro "Database error saving new user" (500)

## ⚠️ Problema

Ao tentar criar uma conta, você recebe o erro:
- **"Database error saving new user"**
- Erro 500 no endpoint `/auth/v1/signup`

Isso acontece porque o **trigger** que cria o perfil automaticamente está falhando.

---

## ✅ Solução Rápida

### Passo 1: Executar Script de Correção

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Abra o arquivo `supabase/fix_trigger_error.sql` no seu projeto
6. **Copie TODO o conteúdo** e cole no SQL Editor
7. Clique em **Run** (ou pressione Ctrl+Enter)

Este script irá:
- ✅ Remover o trigger problemático
- ✅ Criar uma função RPC mais segura para criar perfis
- ✅ Configurar políticas RLS corretas

### Passo 2: Tentar Criar Conta Novamente

1. Volte para a página de registro: `http://localhost:3001/auth/register`
2. Preencha os dados novamente
3. Clique em "Criar Conta"

Agora o perfil será criado via função RPC (mais confiável) em vez do trigger.

---

## 🔍 Verificar se Funcionou

Execute no SQL Editor do Supabase:

```sql
-- Verificar se a função RPC existe
SELECT routine_name, routine_type, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_user_profile';
```

Se a função aparecer, está tudo OK!

---

## 📋 Checklist

- [ ] Script `fix_trigger_error.sql` executado no Supabase
- [ ] Função `create_user_profile` criada
- [ ] Tentou criar conta novamente
- [ ] Conta criada com sucesso

---

## ❓ Ainda não funciona?

### Verificar Logs do Supabase

1. No Supabase Dashboard, vá em **Logs > Postgres**
2. Veja se há erros relacionados ao INSERT na tabela `profiles`

### Verificar se a Tabela Existe

Execute no SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'profiles';
```

Se não aparecer, execute o arquivo `supabase/schema.sql` primeiro.

### Verificar Políticas RLS

Execute no SQL Editor:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';
```

Deve aparecer pelo menos uma política com `cmd = 'INSERT'`.

---

## 🆘 Ajuda Adicional

1. Acesse `/diagnostico` para verificar a configuração
2. Verifique o console do navegador (F12) para erros JavaScript
3. Verifique os logs do servidor Next.js no terminal
4. Veja os logs do Supabase em **Logs > Auth** e **Logs > Postgres**

---

## 📝 O que mudou?

**Antes:** O sistema usava um trigger que executava automaticamente quando um usuário era criado. Se o trigger falhasse, o signup inteiro falhava.

**Agora:** O sistema cria o perfil via função RPC chamada diretamente pelo código, após o signup ser bem-sucedido. Se falhar, o usuário ainda é criado e pode criar o perfil depois.

