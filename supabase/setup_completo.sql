-- ============================================
-- SCRIPT COMPLETO DE CONFIGURAÇÃO DO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. CRIAR TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
-- ============================================

-- Função que será chamada quando um novo usuário for criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Usuário'),
    'elaborador'::user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa a função quando um usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. POLÍTICAS RLS PARA PERMITIR INSERT DE PERFIS
-- ============================================

-- Permitir que usuários autenticados criem seu próprio perfil
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Permitir que o sistema crie perfis (via trigger)
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;
CREATE POLICY "System can insert profiles" ON profiles
  FOR INSERT
  WITH CHECK (true);

-- 3. POLÍTICAS RLS COMPLETAS PARA TODAS AS TABELAS
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trabalhos
DROP POLICY IF EXISTS "Responsavel can manage trabalhos" ON trabalhos;
CREATE POLICY "Responsavel can manage trabalhos" ON trabalhos
  FOR ALL
  USING (
    auth.uid() = responsavel_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Elaborador can view assigned trabalhos" ON trabalhos;
CREATE POLICY "Elaborador can view assigned trabalhos" ON trabalhos
  FOR SELECT
  USING (
    auth.uid() = elaborador_id OR 
    auth.uid() = responsavel_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Aceites
DROP POLICY IF EXISTS "Elaborador can manage own aceites" ON aceites;
CREATE POLICY "Elaborador can manage own aceites" ON aceites
  FOR ALL
  USING (auth.uid() = elaborador_id);

DROP POLICY IF EXISTS "Responsavel can view aceites" ON aceites;
CREATE POLICY "Responsavel can view aceites" ON aceites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trabalhos 
      WHERE id = trabalho_id AND responsavel_id = auth.uid()
    ) OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Entregas
DROP POLICY IF EXISTS "Elaborador can manage own entregas" ON entregas;
CREATE POLICY "Elaborador can manage own entregas" ON entregas
  FOR ALL
  USING (auth.uid() = elaborador_id);

DROP POLICY IF EXISTS "Responsavel can view entregas" ON entregas;
CREATE POLICY "Responsavel can view entregas" ON entregas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trabalhos 
      WHERE id = trabalho_id AND responsavel_id = auth.uid()
    ) OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Correções
DROP POLICY IF EXISTS "Responsavel can manage correcoes" ON correcoes;
CREATE POLICY "Responsavel can manage correcoes" ON correcoes
  FOR ALL
  USING (
    auth.uid() = responsavel_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Elaborador can view own correcoes" ON correcoes;
CREATE POLICY "Elaborador can view own correcoes" ON correcoes
  FOR SELECT
  USING (
    auth.uid() = elaborador_id OR 
    auth.uid() = responsavel_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Atividades
DROP POLICY IF EXISTS "Users can view atividades" ON atividades;
CREATE POLICY "Users can view atividades" ON atividades
  FOR SELECT
  USING (
    auth.uid() = usuario_id OR 
    EXISTS (
      SELECT 1 FROM trabalhos 
      WHERE id = trabalho_id AND (
        responsavel_id = auth.uid() OR 
        elaborador_id = auth.uid()
      )
    ) OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can insert atividades" ON atividades;
CREATE POLICY "Users can insert atividades" ON atividades
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Notificações
DROP POLICY IF EXISTS "Users can view own notificacoes" ON notificacoes;
CREATE POLICY "Users can view own notificacoes" ON notificacoes
  FOR SELECT
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can update own notificacoes" ON notificacoes;
CREATE POLICY "Users can update own notificacoes" ON notificacoes
  FOR UPDATE
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "System can insert notificacoes" ON notificacoes;
CREATE POLICY "System can insert notificacoes" ON notificacoes
  FOR INSERT
  WITH CHECK (true);

-- 4. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
-- ============================================

-- Verificar se o trigger existe
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar se há usuários sem perfil
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.id as profile_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;


