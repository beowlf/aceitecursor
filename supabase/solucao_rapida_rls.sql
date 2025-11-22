-- ============================================
-- SOLUÇÃO RÁPIDA: DESABILITAR RLS TEMPORARIAMENTE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ⚠️ ATENÇÃO: Isso desabilita RLS completamente
-- Use apenas para desenvolvimento/teste!

-- 1. DESABILITAR RLS
-- ============================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. CRIAR PERFIL PARA O USUÁRIO ATUAL
-- ============================================
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'name', 
    split_part(u.email, '@', 1), 
    'Usuário'
  ),
  'admin'::user_role
FROM auth.users u
WHERE u.id = '77954839-2149-4863-a2bd-9e629b6e60a1'
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, profiles.name),
  updated_at = NOW()
RETURNING *;

-- 3. VERIFICAR SE FUNCIONOU
-- ============================================
SELECT * FROM profiles WHERE id = '77954839-2149-4863-a2bd-9e629b6e60a1';

-- Se a query acima retornar o perfil, está funcionando!
-- Agora você pode fazer login normalmente.

-- 4. (OPCIONAL) REABILITAR RLS COM POLÍTICAS PERMISSIVAS
-- ============================================
-- Descomente as linhas abaixo se quiser reabilitar RLS com políticas permissivas:
/*
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas antigas
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
*/

