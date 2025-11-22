-- ============================================
-- VERIFICAR E CORRIGIR TUDO - DIAGNÓSTICO COMPLETO
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. VERIFICAR SE O PERFIL EXISTE
-- ============================================
SELECT 
  'PERFIL EXISTE?' as verificacao,
  u.id,
  u.email,
  p.id as profile_id,
  p.name,
  p.role,
  CASE 
    WHEN p.id IS NULL THEN '❌ PERFIL NÃO EXISTE'
    ELSE '✅ PERFIL EXISTE'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id = '56687cc7-9971-4866-96bb-02743f5663fb';

-- 2. VERIFICAR POLÍTICAS RLS ATUAIS
-- ============================================
SELECT 
  'POLÍTICAS RLS' as verificacao,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- 3. VERIFICAR SE RLS ESTÁ HABILITADO
-- ============================================
SELECT 
  'RLS HABILITADO?' as verificacao,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- 4. CRIAR PERFIL SE NÃO EXISTIR
-- ============================================
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'Usuário'),
  'admin'::user_role
FROM auth.users u
WHERE u.id = '56687cc7-9971-4866-96bb-02743f5663fb'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = u.id
  )
ON CONFLICT (id) DO NOTHING;

-- 5. REMOVER TODAS AS POLÍTICAS E RECRIAR
-- ============================================
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Criar políticas que permitem acesso
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. VERIFICAR RESULTADO FINAL
-- ============================================
SELECT 
  'RESULTADO FINAL' as verificacao,
  u.id,
  u.email,
  p.id as profile_id,
  p.name,
  p.role,
  CASE 
    WHEN p.id IS NULL THEN '❌ PERFIL AINDA NÃO EXISTE - EXECUTE O INSERT MANUALMENTE'
    ELSE '✅ PERFIL EXISTE E DEVE ESTAR ACESSÍVEL'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id = '56687cc7-9971-4866-96bb-02743f5663fb';

-- 7. TESTAR QUERY COMO SE FOSSE O USUÁRIO AUTENTICADO
-- ============================================
-- Esta query simula o que o sistema faz
SELECT * FROM profiles WHERE id = '56687cc7-9971-4866-96bb-02743f5663fb';

