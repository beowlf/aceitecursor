-- ============================================
-- CORREÇÃO DEFINITIVA DE RLS - FUNCIONA PARA TODOS OS USUÁRIOS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA VERIFICAR
-- ============================================
-- Isso nos permite verificar se o problema é realmente RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR SE HÁ PERFIS
-- ============================================
SELECT 
  'PERFIS EXISTENTES' as verificacao,
  COUNT(*) as total_perfis
FROM profiles;

-- 3. VERIFICAR USUÁRIOS SEM PERFIL
-- ============================================
SELECT 
  'USUÁRIOS SEM PERFIL' as verificacao,
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 4. CRIAR PERFIS PARA TODOS OS USUÁRIOS QUE NÃO TÊM
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
  'elaborador'::user_role
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- 5. REABILITAR RLS
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ============================================
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles') 
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
  END LOOP;
END $$;

-- 7. CRIAR POLÍTICAS RLS CORRETAS E SIMPLES
-- ============================================

-- Política 1: Qualquer usuário autenticado pode ver todos os perfis
CREATE POLICY "authenticated_users_can_view_all_profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Política 2: Usuários podem ver seu próprio perfil (garantia extra)
CREATE POLICY "users_can_view_own_profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política 3: Usuários podem atualizar seu próprio perfil
CREATE POLICY "users_can_update_own_profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política 4: Usuários podem inserir seu próprio perfil
CREATE POLICY "users_can_insert_own_profile" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 8. VERIFICAR POLÍTICAS CRIADAS
-- ============================================
SELECT 
  'POLÍTICAS RLS CRIADAS' as verificacao,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- 9. TESTAR QUERY (deve funcionar agora)
-- ============================================
-- Esta query simula o que o sistema faz
SELECT 
  'TESTE DE QUERY' as verificacao,
  COUNT(*) as perfis_encontrados
FROM profiles;

-- 10. VERIFICAR PERFIS CRIADOS
-- ============================================
SELECT 
  'PERFIS FINAIS' as verificacao,
  p.id,
  p.email,
  p.name,
  p.role,
  u.id as user_id,
  CASE 
    WHEN u.id IS NULL THEN '❌ Usuário não existe no Auth'
    WHEN p.id IS NULL THEN '❌ Perfil não existe'
    ELSE '✅ Tudo OK'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

