# 🔧 Configuração Completa do Supabase

## ⚠️ IMPORTANTE: Execute estes passos no Supabase

Se o diagnóstico está OK mas você ainda não consegue fazer login, siga estes passos:

---

## Passo 1: Desabilitar Confirmação de Email (Desenvolvimento)

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication > Settings**
4. Procure por **"Enable email confirmations"**
5. **DESMARQUE** essa opção
6. Clique em **Save**

> 💡 Isso permite fazer login sem confirmar o email (apenas para desenvolvimento)

---

## Passo 2: Executar Script SQL Completo

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `supabase/setup_completo.sql`
4. Clique em **Run** (ou pressione Ctrl+Enter)

Este script irá:
- ✅ Criar trigger para criar perfil automaticamente quando usuário se registra
- ✅ Configurar políticas RLS (Row Level Security) corretas
- ✅ Permitir que usuários criem seus próprios perfis

---

## Passo 3: Criar Perfil para Usuário Existente

Se você já criou uma conta antes de executar o script, precisa criar o perfil manualmente:

1. No Supabase Dashboard, vá em **Authentication > Users**
2. Encontre seu usuário e copie o **ID** (UUID)
3. Vá em **SQL Editor** e execute:

```sql
-- Substitua 'SEU_EMAIL@exemplo.com' pelo seu email
-- Substitua 'SEU_ID_AQUI' pelo ID copiado acima

INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', u.email, 'Usuário'),
  'admin'::user_role  -- ou 'responsavel' ou 'elaborador'
FROM auth.users u
WHERE u.email = 'SEU_EMAIL@exemplo.com'
ON CONFLICT (id) DO NOTHING;
```

Ou, se você já tem o ID:

```sql
INSERT INTO public.profiles (id, email, name, role)
VALUES (
  'SEU_ID_AQUI',
  'seu@email.com',
  'Seu Nome',
  'admin'::user_role
)
ON CONFLICT (id) DO NOTHING;
```

---

## Passo 4: Verificar se Tudo Está Configurado

Execute no SQL Editor:

```sql
-- Verificar se o trigger existe
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verificar se há usuários sem perfil
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.id as profile_id,
  p.name,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

Se o trigger existe e não há usuários sem perfil, está tudo OK!

---

## Passo 5: Testar Login

1. Acesse `http://localhost:3001/auth/login`
2. Tente fazer login com seu email e senha
3. Se ainda não funcionar, veja o console do navegador (F12) para erros

---

## Problemas Comuns

### "Email not confirmed"
- **Solução**: Desabilite a confirmação de email no Passo 1

### "User not found" ou "Invalid credentials"
- **Solução**: Verifique se o usuário existe em **Authentication > Users**
- Se não existir, crie uma nova conta em `/auth/register`

### "Profile not found"
- **Solução**: Execute o Passo 3 para criar o perfil manualmente

### "Permission denied" ou erros de RLS
- **Solução**: Execute o script `setup_completo.sql` (Passo 2)

### Erro ao criar perfil no login
- **Solução**: Verifique se as políticas RLS permitem INSERT (Passo 2)

---

## Verificar Logs do Supabase

1. No Supabase Dashboard, vá em **Logs > Auth**
2. Veja se há erros relacionados ao login
3. Verifique também **Logs > Postgres** para erros de banco

---

## Checklist Final

- [ ] Confirmação de email desabilitada
- [ ] Script `setup_completo.sql` executado
- [ ] Trigger `on_auth_user_created` existe
- [ ] Políticas RLS configuradas
- [ ] Perfil criado para usuário existente
- [ ] Servidor Next.js reiniciado após mudanças
- [ ] Teste de login realizado

---

## Ainda com Problemas?

1. Acesse `/diagnostico` e veja o que está falhando
2. Verifique o console do navegador (F12) para erros JavaScript
3. Verifique os logs do servidor Next.js no terminal
4. Verifique os logs do Supabase em **Logs > Auth** e **Logs > Postgres**


