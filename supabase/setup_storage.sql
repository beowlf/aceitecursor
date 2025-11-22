-- ============================================
-- CONFIGURAÇÃO DO STORAGE PARA ARQUIVOS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. CRIAR BUCKET PARA TRABALHOS
-- ============================================
-- Nota: Você precisa criar o bucket manualmente no Supabase Dashboard
-- Vá em Storage > Create Bucket
-- Nome: trabalhos
-- Public: false (privado)
-- File size limit: 50 MB (ou o que preferir)
-- Allowed MIME types: application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,application/x-rar-compressed

-- 2. POLÍTICAS RLS PARA O BUCKET
-- ============================================

-- Permitir que usuários autenticados façam upload
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'trabalhos');

-- Permitir que usuários autenticados leiam arquivos
CREATE POLICY "Users can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'trabalhos');

-- Permitir que usuários autenticados atualizem seus próprios arquivos
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'trabalhos');

-- Permitir que usuários autenticados excluam seus próprios arquivos
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'trabalhos');

-- ============================================
-- INSTRUÇÕES MANUAIS:
-- ============================================
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em Storage
-- 3. Clique em "Create Bucket"
-- 4. Nome: trabalhos
-- 5. Public: false
-- 6. File size limit: 50 MB
-- 7. Allowed MIME types: application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,application/x-rar-compressed
-- 8. Clique em "Create bucket"
-- 9. Depois execute este script SQL para criar as políticas

