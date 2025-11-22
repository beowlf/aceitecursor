# 🔧 Solução de Problemas - Login

## Problema: Não consigo fazer login mesmo tendo criado a conta

### ✅ Soluções Implementadas

1. **Página de Registro Criada** (`/auth/register`)
   - Agora você pode criar uma conta diretamente no sistema
   - O perfil é criado automaticamente

2. **Trigger Automático**
   - Um trigger foi criado no banco de dados para criar o perfil automaticamente quando um usuário se registra
   - Se você criou a conta antes, o perfil já foi criado automaticamente

3. **Melhorias no Login**
   - Mensagens de erro mais claras
   - Verificação automática e criação de perfil se necessário

### 🔍 Verificações

#### 1. Verificar se o usuário existe no Supabase Auth

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Authentication > Users**
3. Verifique se seu email está listado
4. Se não estiver, crie uma nova conta em `/auth/register`

#### 2. Verificar se o perfil foi criado

Execute no SQL Editor do Supabase:

```sql
SELECT 
  u.id,
  u.email,
  p.id as profile_id,
  p.name,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'seu@email.com';
```

Se o `profile_id` for `NULL`, execute:

```sql
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', u.email, 'Usuário'),
  'elaborador'::user_role
FROM auth.users u
WHERE u.email = 'seu@email.com'
ON CONFLICT (id) DO NOTHING;
```

#### 3. Verificar confirmação de email

No Supabase Dashboard:
1. Vá em **Authentication > Settings**
2. Verifique se **"Enable email confirmations"** está habilitado
3. Se estiver, você precisa confirmar o email antes de fazer login
4. Para desabilitar (apenas em desenvolvimento):
   - Desmarque "Enable email confirmations"
   - Salve as alterações

#### 4. Verificar variáveis de ambiente

Certifique-se de que o arquivo `.env.local` está correto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cfpewtxgsqcvwjyblpww.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Importante:** Após alterar o `.env.local`, reinicie o servidor:
```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

### 🚀 Solução Rápida

1. **Tente fazer login novamente** em `/auth/login`
   - Se ainda não funcionar, continue

2. **Crie uma nova conta** em `/auth/register`
   - Use um email diferente ou delete a conta antiga no Supabase Dashboard

3. **Ou crie o perfil manualmente:**
   - No Supabase Dashboard, vá em **Authentication > Users**
   - Copie o ID do usuário
   - Vá em **SQL Editor** e execute:
   ```sql
   INSERT INTO public.profiles (id, email, name, role)
   VALUES (
     'id_do_usuario_copiado',
     'seu@email.com',
     'Seu Nome',
     'admin'
   );
   ```

### 📝 Mensagens de Erro Comuns

- **"Email ou senha incorretos"**: Verifique se o email e senha estão corretos
- **"Email not confirmed"**: Confirme seu email ou desabilite a confirmação no Supabase
- **"Invalid login credentials"**: Email ou senha incorretos

### 🆘 Ainda com problemas?

1. Verifique o console do navegador (F12) para erros
2. Verifique os logs do Supabase em **Logs > Auth**
3. Certifique-se de que o servidor está rodando (`npm run dev`)





