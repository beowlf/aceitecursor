-- Adicionar novos campos na tabela trabalhos

-- Criar ENUM para prioridade
DO $$ BEGIN
  CREATE TYPE trabalho_prioridade AS ENUM ('urgente', 'media', 'alto');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Criar ENUM para status do trabalho (diferente do status de workflow)
DO $$ BEGIN
  CREATE TYPE trabalho_status_trabalho AS ENUM ('venda_do_dia', 'falta_pagamento', 'normal');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Adicionar colunas na tabela trabalhos
ALTER TABLE trabalhos 
ADD COLUMN IF NOT EXISTS prioridade trabalho_prioridade DEFAULT 'media',
ADD COLUMN IF NOT EXISTS status_trabalho trabalho_status_trabalho DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS quantidade_paginas INTEGER;

-- Comentários para documentação
COMMENT ON COLUMN trabalhos.prioridade IS 'Prioridade do trabalho: urgente, media, alto';
COMMENT ON COLUMN trabalhos.status_trabalho IS 'Status do trabalho: venda_do_dia, falta_pagamento, normal';
COMMENT ON COLUMN trabalhos.quantidade_paginas IS 'Quantidade de páginas do trabalho';

