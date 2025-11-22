-- ============================================
-- CRIAR PERFIL URGENTE - USUÁRIO ID: 56687cc7-9971-4866-96bb-02743f5663fb
-- Execute este script AGORA no SQL Editor do Supabase
-- ============================================

-- Criar perfil usando o ID diretamente (mais rápido)
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'Usuário'),
  'admin'::user_role
FROM auth.users u
WHERE u.id = '56687cc7-9971-4866-96bb-02743f5663fb'
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, profiles.name),
  updated_at = NOW();

-- Verificar se funcionou (deve retornar 1 linha com o perfil)
SELECT 
  u.id,
  u.email,
  u.created_at as user_created_at,
  p.id as profile_id,
  p.name,
  p.role,
  p.created_at as profile_created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id = '56687cc7-9971-4866-96bb-02743f5663fb';

-- Se o profile_id aparecer preenchido, está tudo OK!
-- Agora você pode fazer login normalmente.

