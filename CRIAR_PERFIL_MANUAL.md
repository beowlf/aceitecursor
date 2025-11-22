# 🔧 Criar Perfil Manualmente para Usuário Existente

## ⚠️ Problema

O usuário foi criado no Supabase Auth, mas não consegue acessar o sistema porque o **perfil não foi criado** na tabela `profiles`.

---

## ✅ Solução Rápida

### Passo 1: Executar Script SQL

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Abra o arquivo `supabase/criar_perfil_usuario.sql`
6. **Edite o email** na linha que contém `WHERE u.email = 'beowlf@gmail.com'`
   - Substitua `beowlf@gmail.com` pelo seu email
7. Clique em **Run** (ou Ctrl+Enter)

### Passo 2: Verificar se Funcionou

O script mostrará uma consulta no final. Você deve ver:
- ✅ `profile_id` preenchido (não NULL)
- ✅ `name` e `role` preenchidos

### Passo 3: Tentar Fazer Login

1. Acesse `http://localhost:3001/auth/login`
2. Faça login com seu email e senha
3. Agora deve funcionar!

---

## 📋 Script SQL Completo

Se preferir copiar e colar diretamente:

```sql
-- Substitua 'beowlf@gmail.com' pelo seu email
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'Usuário'),
  'admin'::user_role
FROM auth.users u
WHERE u.email = 'beowlf@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, profiles.name),
  updated_at = NOW();

-- Verificar se funcionou
SELECT 
  u.id,
  u.email,
  p.id as profile_id,
  p.name,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'beowlf@gmail.com';
```

---

## 🔍 Verificar Usuário sem Perfil

Para ver todos os usuários que não têm perfil:

```sql
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.id as profile_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

---

## 🎯 Usar ID Diretamente

Se você tem o ID do usuário (visto na tela do Supabase):

```sql
INSERT INTO public.profiles (id, email, name, role)
VALUES (
  '56687cc7-9971-4866-96bb-02743f5663fb',  -- Cole o ID aqui
  'beowlf@gmail.com',                       -- Seu email
  'Fabiano Mancuzo',                        -- Seu nome
  'admin'::user_role                        -- ou 'responsavel' ou 'elaborador'
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = NOW();
```

---

## ❓ Ainda não funciona?

1. Verifique se o script foi executado sem erros
2. Verifique se o perfil foi criado (execute a query de verificação)
3. Tente fazer login novamente
4. Se ainda não funcionar, veja os logs do Supabase em **Logs > Postgres**

---

## 📝 Por que isso acontece?

Quando você criou a conta, o trigger que deveria criar o perfil automaticamente falhou (por isso o erro 500). O usuário foi criado no Auth, mas o perfil não foi criado na tabela `profiles`.

Agora, com o script `fix_trigger_error.sql` executado, novos usuários terão o perfil criado automaticamente via função RPC.

