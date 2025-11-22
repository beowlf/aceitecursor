-- ============================================
-- CRIAR PERFIL PARA USUÁRIO EXISTENTE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- IMPORTANTE: Substitua 'beowlf@gmail.com' pelo email do seu usuário
-- Ou substitua o ID pelo ID do seu usuário (56687cc7-9971-4866-96bb-02743f5663fb)

-- Opção 1: Criar perfil usando o email
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'Usuário'),
  'admin'::user_role  -- ou 'responsavel' ou 'elaborador'
FROM auth.users u
WHERE u.email = 'beowlf@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, profiles.name),
  updated_at = NOW();

-- Opção 2: Criar perfil usando o ID diretamente (se a opção 1 não funcionar)
-- Descomente as linhas abaixo e substitua o ID:
/*
INSERT INTO public.profiles (id, email, name, role)
VALUES (
  '56687cc7-9971-4866-96bb-02743f5663fb',
  'beowlf@gmail.com',
  'Fabiano Mancuzo',
  'admin'::user_role
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = NOW();
*/

-- Verificar se o perfil foi criado
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
WHERE u.email = 'beowlf@gmail.com';

-- Se aparecer o profile_id, está tudo OK!

