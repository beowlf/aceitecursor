# 🔍 Diagnóstico Rápido - Problema de Acesso

## O que fazer agora:

### 1. Abra o Console do Navegador (F12)
- Pressione F12 no navegador
- Vá na aba "Console"
- Tente criar a conta novamente
- Veja as mensagens que aparecem no console

### 2. Verifique se o usuário foi criado

No Supabase Dashboard:
1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication > Users**
3. Procure pelo email `beowlf@gmail.com`
4. Se encontrar, veja se o email está confirmado

### 3. Desabilitar Confirmação de Email (Desenvolvimento)

Se o email precisa ser confirmado:
1. No Supabase Dashboard, vá em **Authentication > Settings**
2. Procure por **"Enable email confirmations"**
3. **Desmarque** essa opção
4. Salve as alterações
5. Tente criar a conta novamente

### 4. Verificar se o perfil foi criado

Execute no SQL Editor do Supabase:

```sql
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.id as profile_id,
  p.name,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'beowlf@gmail.com';
```

Se o `profile_id` for NULL, execute:

```sql
-- Substitua 'ID_DO_USUARIO' pelo ID que apareceu na query anterior
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', u.email, 'Usuário'),
  'elaborador'::user_role
FROM auth.users u
WHERE u.email = 'beowlf@gmail.com'
ON CONFLICT (id) DO NOTHING;
```

### 5. Tentar fazer login manualmente

1. Acesse: `http://localhost:3000/auth/login`
2. Use o email e senha que você criou
3. Veja se aparece algum erro

### 6. Verificar logs do servidor

No terminal onde está rodando `npm run dev`, veja se há algum erro.

---

## Mensagens no Console

Quando você tentar criar a conta, deve ver no console:
- "Usuário criado: [ID]"
- "Perfil verificado: ..."
- "Tentando fazer login..."
- "Login bem-sucedido: [ID]"

Se alguma dessas mensagens não aparecer, me diga qual foi a última que apareceu.





