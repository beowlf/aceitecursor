-- ============================================
-- SCRIPT DEFINITIVO PARA DESTRAVAR LOGIN
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE NA TABELA PROFILES (APENAS PARA CRIAR PERFIS)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. CRIAR PERFIL PARA TODOS OS USUÁRIOS QUE NÃO TÊM
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'name',
    SPLIT_PART(u.email, '@', 1),
    'Usuário'
  ) as name,
  'elaborador'::user_role
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, profiles.name),
  updated_at = NOW();

-- 3. REABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. GARANTIR POLÍTICAS RLS CORRETAS
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id OR true); -- Permitir inserção para desenvolvimento

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. VERIFICAR RESULTADO
SELECT 
  COUNT(*) as total_usuarios,
  (SELECT COUNT(*) FROM profiles) as total_perfis,
  (SELECT COUNT(*) FROM auth.users u 
   LEFT JOIN profiles p ON u.id = p.id 
   WHERE p.id IS NULL) as usuarios_sem_perfil
FROM auth.users;

-- 6. LISTAR TODOS OS PERFIS CRIADOS
SELECT id, email, name, role, created_at 
FROM profiles 
ORDER BY created_at DESC;

