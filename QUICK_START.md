# 🚀 Início Rápido - ElaboraCRM

## ⚠️ ANTES DE COMEÇAR

Se você recebeu o erro **"npm não é reconhecido"**, você precisa instalar o Node.js primeiro!

👉 **Leia o arquivo `INSTALACAO_NODEJS.md` antes de continuar!**

---

## Passo a Passo Rápido

### 1️⃣ Instalar Node.js (se ainda não tiver)

- Baixe em: https://nodejs.org/ (versão LTS)
- Instale e **reinicie o terminal**
- Verifique: `node --version` e `npm --version`

### 2️⃣ Instalar Dependências

```powershell
npm install
```

### 3️⃣ Configurar Supabase

1. Crie conta em: https://supabase.com
2. Crie um novo projeto
3. No SQL Editor, execute o arquivo `supabase/schema.sql`
4. Em Settings > API, copie a URL e as chaves

### 4️⃣ Criar Arquivo .env.local

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5️⃣ Executar o Projeto

```powershell
npm run dev
```

Acesse: http://localhost:3000

### 6️⃣ Criar Primeiro Usuário

1. Acesse `/auth/register` ou crie via Supabase Dashboard
2. No Supabase, vá em Authentication > Users
3. Copie o ID do usuário
4. Execute no SQL Editor:

```sql
INSERT INTO profiles (id, email, name, role)
VALUES (
  'id_do_usuario_copiado',
  'seu@email.com',
  'Seu Nome',
  'admin'
);
```

---

## ✅ Pronto!

Agora você pode:
- Fazer login em `/auth/login`
- Acessar o dashboard em `/dashboard`
- Criar trabalhos em `/trabalhos/novo`
- Testar o fluxo de aceite

---

## 📚 Documentação Completa

- `SETUP.md` - Guia completo de configuração
- `INSTALACAO_NODEJS.md` - Como instalar Node.js no Windows
- `README.md` - Visão geral do projeto






