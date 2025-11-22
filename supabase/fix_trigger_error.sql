-- ============================================
-- CORREÇÃO DO ERRO "Database error saving new user"
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. REMOVER O TRIGGER PROBLEMÁTICO TEMPORARIAMENTE
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. CRIAR FUNÇÃO RPC PARA CRIAR PERFIL (MAIS SEGURA)
-- ============================================
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_name TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_user_name TEXT;
BEGIN
  -- Usar o nome fornecido ou o email como fallback
  v_user_name := COALESCE(p_name, split_part(p_email, '@', 1), 'Usuário');
  
  -- Inserir o perfil
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    p_user_id,
    p_email,
    v_user_name,
    'elaborador'::user_role
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    updated_at = NOW()
  RETURNING id INTO v_profile_id;
  
  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'profile_id', v_profile_id,
    'message', 'Perfil criado com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Retornar erro
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Erro ao criar perfil: ' || SQLERRM
    );
END;
$$;

-- 3. GARANTIR QUE A POLÍTICA RLS PERMITA INSERT
-- ============================================

-- Remover políticas conflitantes
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;

-- Criar política que permite INSERT para qualquer usuário autenticado criando seu próprio perfil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Criar política que permite a função RPC criar perfis (via SECURITY DEFINER)
-- A função RPC com SECURITY DEFINER ignora RLS, então não precisamos de política especial

-- 4. VERIFICAR SE TUDO ESTÁ OK
-- ============================================

-- Verificar se a função existe
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_user_profile';

-- Verificar políticas RLS
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

