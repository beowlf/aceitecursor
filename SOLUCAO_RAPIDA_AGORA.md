# 🚀 Solução Rápida - Funciona AGORA

## ⚠️ Problema

O perfil não está sendo encontrado mesmo após criar. As políticas RLS estão bloqueando.

---

## ✅ Solução Rápida (2 minutos)

### Passo 1: Desabilitar RLS Temporariamente

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Cole este script:

```sql
-- Desabilitar RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Criar perfil para o usuário
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'Usuário'),
  'admin'::user_role
FROM auth.users u
WHERE u.id = '77954839-2149-4863-a2bd-9e629b6e60a1'
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, profiles.name),
  updated_at = NOW()
RETURNING *;

-- Verificar
SELECT * FROM profiles WHERE id = '77954839-2149-4863-a2bd-9e629b6e60a1';
```

6. Clique em **Run**

### Passo 2: Testar Login

1. Feche o navegador completamente
2. Abra novamente
3. Acesse `http://localhost:3001/auth/login`
4. Faça login
5. **Deve funcionar agora!**

---

## ⚠️ Importante

Esta solução desabilita RLS completamente. É segura para desenvolvimento, mas:

- ✅ **OK para desenvolvimento/teste**
- ❌ **NÃO use em produção sem políticas RLS**

---

## 🔄 Reabilitar RLS Depois (Opcional)

Se quiser reabilitar RLS com políticas permissivas depois:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles') 
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
  END LOOP;
END $$;

-- Criar política permissiva
CREATE POLICY "allow_all_authenticated" ON profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

---

## ✅ Teste Agora

Execute o script acima e teste o login. Deve funcionar imediatamente!

