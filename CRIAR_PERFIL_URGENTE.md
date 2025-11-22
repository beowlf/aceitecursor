# 🚨 Criar Perfil Urgente

## Problema
O usuário com ID `77954839-2149-4863-a2bd-9e629b6e60a1` consegue fazer login, mas não tem perfil na tabela `profiles`.

## Solução Rápida

Execute este SQL no **SQL Editor do Supabase**:

```sql
-- Primeiro, verificar se o usuário existe
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE id = '77954839-2149-4863-a2bd-9e629b6e60a1';

-- Se o usuário existir, criar o perfil
-- Substitua 'seu@email.com' pelo email real do usuário
INSERT INTO public.profiles (id, email, name, role)
VALUES (
  '77954839-2149-4863-a2bd-9e629b6e60a1',
  'seu@email.com',  -- SUBSTITUA PELO EMAIL REAL
  'Usuário',
  'elaborador'::user_role
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, profiles.name),
  updated_at = NOW();
```

## Solução Automática (Recomendada)

O sistema agora cria o perfil automaticamente após o login se ele não existir. 

**Apenas faça login novamente** e o perfil será criado automaticamente.

## Verificar se Funcionou

```sql
SELECT id, email, name, role, created_at 
FROM profiles 
WHERE id = '77954839-2149-4863-a2bd-9e629b6e60a1';
```

Se retornar uma linha, o perfil foi criado com sucesso!

