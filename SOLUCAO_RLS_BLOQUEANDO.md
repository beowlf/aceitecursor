# 🔧 Solução: RLS Bloqueando Acesso ao Perfil

## ⚠️ Problema Identificado

O perfil foi criado com sucesso, mas o sistema não consegue acessá-lo porque as **políticas RLS (Row Level Security)** estão bloqueando.

**Evidência do log:**
- Status: 200 (requisição OK)
- Query: Busca o perfil do usuário
- Resultado: `content_range: "0-0/*"` - **Nenhum resultado encontrado**
- Usuário: Autenticado corretamente (JWT válido)

---

## ✅ Solução: Corrigir Políticas RLS

### Passo 1: Executar Script de Correção

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Abra o arquivo `supabase/fix_rls_profiles.sql`
6. **Copie TODO o conteúdo** e cole no SQL Editor
7. Clique em **Run** (ou Ctrl+Enter)

Este script irá:
- ✅ Remover políticas RLS conflitantes
- ✅ Criar políticas corretas que permitem acesso ao perfil
- ✅ Garantir que usuários autenticados possam ver seus próprios perfis

### Passo 2: Limpar Cache e Tentar Novamente

1. **Feche completamente o navegador** (todas as abas)
2. Abra o navegador novamente
3. Acesse `http://localhost:3001/auth/login`
4. Faça login novamente
5. Agora deve funcionar!

---

## 📋 Script SQL Direto (Copiar e Colar)

Se preferir copiar diretamente:

```sql
-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;

-- Criar políticas corretas
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Verificar se funcionou
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';
```

---

## 🔍 Verificar se Funcionou

Após executar o script, verifique:

1. **No SQL Editor**, execute:
```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';
```

Deve aparecer pelo menos 4 políticas:
- Users can view all profiles (SELECT)
- Users can view own profile (SELECT)
- Users can update own profile (UPDATE)
- Users can insert own profile (INSERT)

2. **Teste no navegador:**
   - Feche todas as abas do navegador
   - Abra novamente
   - Faça login
   - Deve funcionar!

---

## ❓ Ainda não funciona?

1. Verifique se o script foi executado sem erros
2. Verifique se as políticas foram criadas (query acima)
3. Limpe o cache do navegador (Ctrl+Shift+Delete)
4. Tente em uma aba anônima/privada
5. Verifique os logs do Supabase em **Logs > Postgres** para ver se há erros

---

## 📝 Por que isso acontece?

As políticas RLS (Row Level Security) controlam quem pode ver/modificar dados. Se as políticas estiverem incorretas, mesmo que o perfil exista, o usuário não consegue acessá-lo.

O script corrige isso criando políticas que:
- Permitem que qualquer usuário autenticado veja todos os perfis
- Garantem que usuários possam ver/atualizar seus próprios perfis
- Permitem que usuários criem seus próprios perfis

