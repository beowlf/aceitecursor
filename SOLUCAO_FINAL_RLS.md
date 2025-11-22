# 🔧 Solução Final: RLS Bloqueando Perfil

## ⚠️ Problema Confirmado

O log mostra:
- ✅ Login funcionando (POST 200)
- ❌ Busca do perfil retorna `content_range: "0-0/*"` (nenhum resultado)
- ✅ Usuário autenticado (JWT válido)

**Conclusão:** As políticas RLS ainda estão bloqueando o acesso ao perfil.

---

## ✅ Solução: Script de Diagnóstico e Correção Completo

### Passo 1: Executar Script Completo

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Abra o arquivo `supabase/verificar_e_corrigir_tudo.sql`
6. **Copie TODO o conteúdo** e cole no SQL Editor
7. Clique em **Run** (ou Ctrl+Enter)

Este script irá:
- ✅ Verificar se o perfil existe
- ✅ Verificar políticas RLS atuais
- ✅ Criar o perfil se não existir
- ✅ Remover e recriar todas as políticas RLS
- ✅ Testar a query final

### Passo 2: Verificar Resultados

O script mostrará várias consultas. Verifique:

1. **"PERFIL EXISTE?"** - Deve mostrar `✅ PERFIL EXISTE`
2. **"POLÍTICAS RLS"** - Deve mostrar pelo menos 4 políticas
3. **"RESULTADO FINAL"** - Deve mostrar `✅ PERFIL EXISTE E DEVE ESTAR ACESSÍVEL`
4. **Query final** - Deve retornar 1 linha com seus dados

### Passo 3: Limpar Cache e Testar

1. **Feche TODAS as abas do navegador** (Ctrl+Shift+W)
2. **Feche o navegador completamente**
3. Abra o navegador novamente
4. Acesse `http://localhost:3001/auth/login`
5. Faça login novamente
6. Agora deve funcionar!

---

## 📋 Script SQL Direto (Se Preferir)

```sql
-- 1. Criar perfil se não existir
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'Usuário'),
  'admin'::user_role
FROM auth.users u
WHERE u.id = '56687cc7-9971-4866-96bb-02743f5663fb'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id)
ON CONFLICT (id) DO NOTHING;

-- 2. Remover TODAS as políticas
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- 3. Criar políticas corretas
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Verificar resultado
SELECT * FROM profiles WHERE id = '56687cc7-9971-4866-96bb-02743f5663fb';
```

---

## 🔍 Se Ainda Não Funcionar

### Verificar no Console do Navegador

1. Abra o navegador e pressione **F12**
2. Vá na aba **Console**
3. Tente fazer login
4. Veja se há erros relacionados a `profiles` ou `RLS`

### Verificar Logs do Supabase

1. No Supabase Dashboard, vá em **Logs > Postgres**
2. Veja se há erros relacionados a políticas RLS
3. Procure por mensagens como "permission denied" ou "row-level security"

### Desabilitar RLS Temporariamente (APENAS PARA TESTE)

```sql
-- ⚠️ ATENÇÃO: Isso desabilita RLS completamente - use apenas para teste!
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Teste se funciona agora
SELECT * FROM profiles WHERE id = '56687cc7-9971-4866-96bb-02743f5663fb';

-- Se funcionar, reabilite RLS e recrie as políticas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Depois execute o script de criação de políticas novamente
```

---

## 📝 Por que isso acontece?

As políticas RLS podem estar:
1. **Conflitantes** - Múltiplas políticas se contradizendo
2. **Incompletas** - Faltando políticas necessárias
3. **Incorretas** - Usando condições erradas

O script remove TODAS as políticas e recria do zero, garantindo que estejam corretas.

---

## ✅ Checklist Final

- [ ] Script `verificar_e_corrigir_tudo.sql` executado
- [ ] Perfil existe (verificado na query)
- [ ] Políticas RLS criadas (4 políticas)
- [ ] Query de teste retorna resultado
- [ ] Navegador fechado completamente
- [ ] Login testado novamente
- [ ] Sistema funcionando

Execute o script e me diga o resultado!

