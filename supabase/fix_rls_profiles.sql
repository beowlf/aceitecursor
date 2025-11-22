-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA PERFIS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES DE PROFILES
-- ============================================
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;

-- 2. CRIAR POLÍTICAS RLS CORRETAS
-- ============================================

-- Permitir que usuários autenticados vejam todos os perfis
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT
  USING (true);

-- Permitir que usuários autenticados vejam seu próprio perfil (garantia extra)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Permitir que usuários autenticados atualizem seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Permitir que usuários autenticados criem seu próprio perfil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Permitir que a função RPC crie perfis (via SECURITY DEFINER)
-- A função RPC com SECURITY DEFINER ignora RLS, então não precisa de política especial

-- 3. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- 4. TESTAR SE O USUÁRIO PODE VER SEU PERFIL
-- ============================================
-- Execute esta query como o usuário autenticado (via API ou aplicação)
-- Deve retornar o perfil:
SELECT * FROM profiles WHERE id = '56687cc7-9971-4866-96bb-02743f5663fb';

