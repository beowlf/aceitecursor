-- Adicionar campo de observações na tabela trabalhos
ALTER TABLE trabalhos 
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Adicionar campos no aceite para anti-plágio, correções e motivo de recusa
ALTER TABLE aceites 
ADD COLUMN IF NOT EXISTS aceita_antiplagio BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS aceita_correcoes BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS motivo_recusa TEXT;

-- Adicionar status de recusado no enum aceite_status
-- Nota: Se o enum já existir, pode ser necessário recriar
-- Por enquanto, vamos usar o campo motivo_recusa para identificar recusas

-- Comentários para documentação
COMMENT ON COLUMN trabalhos.observacoes IS 'Observações do responsável sobre o trabalho (ex: faltou material, solicitar mais informações)';
COMMENT ON COLUMN aceites.aceita_antiplagio IS 'Elaborador aceita entregar com relatório anti-plágio';
COMMENT ON COLUMN aceites.aceita_correcoes IS 'Elaborador aceita fazer correções se necessário';
COMMENT ON COLUMN aceites.motivo_recusa IS 'Motivo da recusa do trabalho pelo elaborador';

