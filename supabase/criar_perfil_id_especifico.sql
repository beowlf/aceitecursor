-- ============================================
-- CRIAR PERFIL PARA ID ESPECÍFICO
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ID do usuário que está tentando acessar
-- 77954839-2149-4863-a2bd-9e629b6e60a1

-- 1. VERIFICAR SE O USUÁRIO EXISTE NO AUTH
-- ============================================
SELECT 
  'USUÁRIO NO AUTH' as verificacao,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE id = '77954839-2149-4863-a2bd-9e629b6e60a1';

-- 2. VERIFICAR SE O PERFIL EXISTE
-- ============================================
SELECT 
  'PERFIL EXISTE?' as verificacao,
  id,
  email,
  name,
  role,
  created_at
FROM public.profiles
WHERE id = '77954839-2149-4863-a2bd-9e629b6e60a1';

-- 3. CRIAR PERFIL SE NÃO EXISTIR
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

-- 4. VERIFICAR RLS ESTÁ HABILITADO
-- ============================================
SELECT 
  'RLS STATUS' as verificacao,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- 5. LISTAR TODAS AS POLÍTICAS RLS
-- ============================================
SELECT 
  'POLÍTICAS RLS' as verificacao,
  policyname,
  cmd,
  qual,
  with_check,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- 6. TESTAR QUERY DIRETAMENTE (SEM RLS)
-- ============================================
-- Esta query deve funcionar mesmo com RLS
SELECT 
  'TESTE DIRETO' as verificacao,
  p.*
FROM public.profiles p
WHERE p.id = '77954839-2149-4863-a2bd-9e629b6e60a1';

-- 7. SE AINDA NÃO FUNCIONAR, DESABILITAR RLS TEMPORARIAMENTE
-- ============================================
-- Descomente as linhas abaixo APENAS se nada mais funcionar:
/*
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Teste novamente
SELECT * FROM profiles WHERE id = '77954839-2149-4863-a2bd-9e629b6e60a1';

-- Se funcionar, reabilite RLS e crie políticas simples:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar política que permite tudo para usuários autenticados
CREATE POLICY "allow_all_for_authenticated" ON profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
*/

