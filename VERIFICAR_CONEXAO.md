# 🔍 Verificar Conexão com Supabase

## Problema: Não consigo fazer login após criar conta

### Passo 1: Acessar Página de Diagnóstico

1. Acesse: `http://localhost:3001/diagnostico` (ou a porta que você está usando)
2. A página irá verificar automaticamente:
   - ✅ Variáveis de ambiente configuradas
   - ✅ Conexão com Supabase
   - ✅ Estrutura do banco de dados
   - ✅ Sistema de autenticação

### Passo 2: Verificar Arquivo .env.local

Certifique-se de que o arquivo `.env.local` existe na raiz do projeto com o seguinte conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**Como obter essas informações:**
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings > API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Passo 3: Verificar Schema do Banco

1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute o arquivo `supabase/schema.sql` completo
3. Verifique se todas as tabelas foram criadas:
   - `profiles`
   - `trabalhos`
   - `aceites`
   - `entregas`
   - `correcoes`
   - `atividades`
   - `notificacoes`

### Passo 4: Verificar Confirmação de Email

1. No Supabase Dashboard, vá em **Authentication > Settings**
2. Verifique se **"Enable email confirmations"** está habilitado
3. **Para desenvolvimento**, recomenda-se desabilitar:
   - Desmarque "Enable email confirmations"
   - Salve as alterações

### Passo 5: Verificar Usuário Criado

1. No Supabase Dashboard, vá em **Authentication > Users**
2. Verifique se seu email está listado
3. Se o email não estiver confirmado, clique em "Confirm email" ou desabilite a confirmação

### Passo 6: Criar Perfil Manualmente (se necessário)

Se o usuário existe mas não tem perfil:

1. No Supabase Dashboard, vá em **Authentication > Users**
2. Copie o **ID** do usuário
3. Vá em **SQL Editor** e execute:

```sql
INSERT INTO public.profiles (id, email, name, role)
VALUES (
  'ID_DO_USUARIO_AQUI',
  'seu@email.com',
  'Seu Nome',
  'admin'  -- ou 'responsavel' ou 'elaborador'
)
ON CONFLICT (id) DO NOTHING;
```

### Passo 7: Reiniciar o Servidor

Após fazer alterações no `.env.local`:

1. Pare o servidor (Ctrl+C no terminal)
2. Inicie novamente: `npm run dev`
3. Tente fazer login novamente

### Passo 8: Verificar Console do Navegador

1. Abra o navegador e pressione **F12**
2. Vá na aba **Console**
3. Tente fazer login
4. Veja se há erros no console

### Erros Comuns

#### "Invalid login credentials"
- Verifique se o email e senha estão corretos
- Verifique se o usuário foi criado no Supabase

#### "Email not confirmed"
- Desabilite a confirmação de email no Supabase (para desenvolvimento)
- Ou confirme o email através do link enviado

#### "Failed to fetch" ou erros de conexão
- Verifique se a URL do Supabase está correta no `.env.local`
- Verifique se a chave anon está correta
- Verifique sua conexão com a internet
- Acesse `/diagnostico` para verificar a conexão

#### "Table does not exist"
- Execute o arquivo `supabase/schema.sql` no SQL Editor do Supabase

### Ainda com Problemas?

1. Acesse `/diagnostico` e veja quais verificações falharam
2. Verifique os logs do servidor no terminal
3. Verifique os logs do Supabase em **Logs > Auth**
4. Verifique o console do navegador (F12)


