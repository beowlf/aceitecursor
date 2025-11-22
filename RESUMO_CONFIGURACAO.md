# 📋 Resumo Rápido - Configuração do Supabase

## ⚡ O que fazer AGORA no Supabase:

### 1️⃣ Desabilitar Confirmação de Email
- Supabase Dashboard → **Authentication > Settings**
- **DESMARQUE** "Enable email confirmations"
- Clique em **Save**

### 2️⃣ Executar Script SQL
- Supabase Dashboard → **SQL Editor**
- Clique em **New Query**
- Copie TODO o conteúdo do arquivo `supabase/setup_completo.sql`
- Cole no editor
- Clique em **Run** (ou Ctrl+Enter)

### 3️⃣ Criar Perfil para Usuário Existente
Se você já criou uma conta antes:

1. Supabase Dashboard → **Authentication > Users**
2. Copie o **ID** do seu usuário
3. SQL Editor → Execute:

```sql
INSERT INTO public.profiles (id, email, name, role)
VALUES (
  'COLE_O_ID_AQUI',
  'seu@email.com',
  'Seu Nome',
  'admin'::user_role
)
ON CONFLICT (id) DO NOTHING;
```

### 4️⃣ Reiniciar Servidor
```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

### 5️⃣ Testar Login
- Acesse `http://localhost:3001/auth/login`
- Faça login com seu email e senha

---

## 📚 Documentação Completa

- **CONFIGURAR_SUPABASE.md** - Guia completo passo a passo
- **VERIFICAR_CONEXAO.md** - Como verificar a conexão
- **/diagnostico** - Página de diagnóstico automático

---

## ❓ Ainda não funciona?

1. Acesse `/diagnostico` e veja o que está falhando
2. Abra o console do navegador (F12) e veja os erros
3. Verifique os logs do Supabase em **Logs > Auth**


