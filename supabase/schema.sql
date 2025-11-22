-- ElaboraCRM Database Schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE user_role AS ENUM ('admin', 'responsavel', 'elaborador');
CREATE TYPE trabalho_tipo AS ENUM ('tcc', 'artigo', 'mestrado', 'doutorado', 'monografia', 'outro');
CREATE TYPE trabalho_status AS ENUM ('pendente', 'aceito', 'em_andamento', 'aguardando_correcao', 'corrigido', 'concluido', 'cancelado');
CREATE TYPE aceite_status AS ENUM ('pendente', 'lido', 'assinado', 'aceito');
CREATE TYPE atividade_tipo AS ENUM ('criacao', 'aceite', 'entrega', 'correcao', 'cancelamento', 'atualizacao');

-- Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'elaborador',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trabalhos (Jobs/Projects)
CREATE TABLE IF NOT EXISTS trabalhos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  responsavel_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  elaborador_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  tipo trabalho_tipo NOT NULL,
  descricao TEXT,
  link_original TEXT,
  feito_do_zero BOOLEAN DEFAULT false,
  tem_correcoes_obrigatorias BOOLEAN DEFAULT true,
  prazo_entrega TIMESTAMP WITH TIME ZONE NOT NULL,
  status trabalho_status DEFAULT 'pendente',
  termos TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aceites (Acceptance Records)
CREATE TABLE IF NOT EXISTS aceites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trabalho_id UUID NOT NULL REFERENCES trabalhos(id) ON DELETE CASCADE,
  elaborador_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status aceite_status DEFAULT 'pendente',
  termos_lidos BOOLEAN DEFAULT false,
  termos_lido_em TIMESTAMP WITH TIME ZONE,
  assinatura_digital TEXT,
  assinado_em TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  aceito_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trabalho_id, elaborador_id)
);

-- Entregas (Deliveries)
CREATE TABLE IF NOT EXISTS entregas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trabalho_id UUID NOT NULL REFERENCES trabalhos(id) ON DELETE CASCADE,
  elaborador_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  arquivo_url TEXT NOT NULL,
  relatorio_antiplagio_url TEXT,
  observacoes TEXT,
  entregue_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Correções (Corrections)
CREATE TABLE IF NOT EXISTS correcoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trabalho_id UUID NOT NULL REFERENCES trabalhos(id) ON DELETE CASCADE,
  entrega_id UUID REFERENCES entregas(id) ON DELETE SET NULL,
  responsavel_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  elaborador_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  descricao TEXT NOT NULL,
  arquivo_referencia_url TEXT,
  prazo_correcao TIMESTAMP WITH TIME ZONE NOT NULL,
  status trabalho_status DEFAULT 'aguardando_correcao',
  aceite_obrigatorio BOOLEAN DEFAULT true,
  aceite_id UUID REFERENCES aceites(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atividades/Auditoria (Activity Log)
CREATE TABLE IF NOT EXISTS atividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trabalho_id UUID REFERENCES trabalhos(id) ON DELETE SET NULL,
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  tipo atividade_tipo NOT NULL,
  descricao TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trabalho_id UUID REFERENCES trabalhos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  lida_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trabalhos_responsavel ON trabalhos(responsavel_id);
CREATE INDEX idx_trabalhos_elaborador ON trabalhos(elaborador_id);
CREATE INDEX idx_trabalhos_status ON trabalhos(status);
CREATE INDEX idx_aceites_trabalho ON aceites(trabalho_id);
CREATE INDEX idx_aceites_elaborador ON aceites(elaborador_id);
CREATE INDEX idx_entregas_trabalho ON entregas(trabalho_id);
CREATE INDEX idx_correcoes_trabalho ON correcoes(trabalho_id);
CREATE INDEX idx_atividades_trabalho ON atividades(trabalho_id);
CREATE INDEX idx_atividades_usuario ON atividades(usuario_id);
CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(usuario_id, lida);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trabalhos_updated_at BEFORE UPDATE ON trabalhos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aceites_updated_at BEFORE UPDATE ON aceites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_correcoes_updated_at BEFORE UPDATE ON correcoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabalhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aceites ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE correcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: users can read all, update own
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trabalhos: responsavel can manage, elaborador can view assigned
CREATE POLICY "Responsavel can manage trabalhos" ON trabalhos FOR ALL 
  USING (auth.uid() = responsavel_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "Elaborador can view assigned trabalhos" ON trabalhos FOR SELECT 
  USING (auth.uid() = elaborador_id OR auth.uid() = responsavel_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Aceites: elaborador can manage own, responsavel can view
CREATE POLICY "Elaborador can manage own aceites" ON aceites FOR ALL 
  USING (auth.uid() = elaborador_id);
CREATE POLICY "Responsavel can view aceites" ON aceites FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM trabalhos WHERE id = trabalho_id AND responsavel_id = auth.uid()
  ) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Similar policies for other tables...
-- (Simplified for brevity, should be expanded in production)






