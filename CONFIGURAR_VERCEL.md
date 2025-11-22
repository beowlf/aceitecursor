# 🔧 Como Configurar Variáveis de Ambiente na Vercel

O erro "Missing Supabase environment variables" ocorre quando as variáveis de ambiente não estão configuradas na Vercel.

## 📋 Passo a Passo

### 1. Acesse o Painel da Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Selecione seu projeto (ou crie um novo se necessário)

### 2. Configure as Variáveis de Ambiente

1. No painel do projeto, vá em **Settings** (Configurações)
2. No menu lateral, clique em **Environment Variables** (Variáveis de Ambiente)
3. Adicione as seguintes variáveis:

#### Variáveis Obrigatórias:

```
NEXT_PUBLIC_SUPABASE_URL
```

**Valor:** A URL do seu projeto Supabase
- Exemplo: `https://cfpewtxgsqcvwjyblpww.supabase.co`
- Você encontra isso no painel do Supabase: **Settings** > **API** > **Project URL**

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Valor:** A chave anônima (anon key) do seu projeto Supabase
- Exemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Você encontra isso no painel do Supabase: **Settings** > **API** > **Project API keys** > **anon public**

### 3. Selecione os Ambientes

Para cada variável, certifique-se de selecionar os ambientes onde ela será usada:
- ✅ **Production** (Produção)
- ✅ **Preview** (Preview/Staging)
- ✅ **Development** (Desenvolvimento) - opcional

### 4. Redeploy

Após adicionar as variáveis:

1. Vá para a aba **Deployments** (Implantações)
2. Clique nos três pontos (⋯) do último deployment
3. Selecione **Redeploy**
4. Ou faça um novo commit/push para o repositório

## 🔍 Como Encontrar as Variáveis no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Selecione seu projeto
3. Vá em **Settings** (ícone de engrenagem no menu lateral)
4. Clique em **API**
5. Você verá:
   - **Project URL** → Use para `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → Use a chave **anon public** para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ⚠️ Importante

- As variáveis que começam com `NEXT_PUBLIC_` são expostas ao navegador
- **NUNCA** exponha a chave `service_role` - ela é apenas para uso no servidor
- Use sempre a chave `anon` (pública) para o cliente

## ✅ Verificação

Após configurar e fazer o redeploy, acesse sua aplicação e verifique:

1. O erro não deve mais aparecer no console
2. A página de login deve carregar normalmente
3. Você pode acessar `/diagnostico` para verificar a conexão com o Supabase

## 🐛 Se o Erro Persistir

1. Verifique se as variáveis foram salvas corretamente (sem espaços extras)
2. Certifique-se de que fez o redeploy após adicionar as variáveis
3. Limpe o cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)
4. Verifique os logs de deploy na Vercel para ver se há outros erros

## 📝 Exemplo de Configuração

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldS1wcm9qZXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MzY5NzU1NTgsImV4cCI6MTk1MjU1MTU1OH0.exemplo
```

**Nota:** O código agora está preparado para lidar com variáveis ausentes sem quebrar a aplicação, mas você ainda precisa configurá-las para que o sistema funcione corretamente.

