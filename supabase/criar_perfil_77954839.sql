-- ============================================
-- CRIAR PERFIL PARA USUÁRIO 77954839-2149-4863-a2bd-9e629b6e60a1
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Verificar se o usuário existe e obter o email
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name_from_metadata,
  created_at
FROM auth.users
WHERE id = '77954839-2149-4863-a2bd-9e629b6e60a1';

-- 2. Criar o perfil (execute apenas se o usuário existir acima)
-- Esta query cria o perfil usando o email do usuário
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
WHERE u.id = '77954839-2149-4863-a2bd-9e629b6e60a1'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  )
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, profiles.name),
  updated_at = NOW();

-- 3. Verificar se o perfil foi criado
SELECT 
  id,
  email,
  name,
  role,
  created_at,
  updated_at
FROM public.profiles
WHERE id = '77954839-2149-4863-a2bd-9e629b6e60a1';

