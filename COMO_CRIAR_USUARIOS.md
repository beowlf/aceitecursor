# 👥 Como Criar Novos Usuários no ElaboraCRM

## 📋 Métodos para Criar Usuários

### Método 1: Criar Usuário pelo Sistema (Recomendado)

1. **Faça login como Administrador**
   - Acesse o sistema com uma conta de administrador
   - Vá para a página **Gerenciar** (`/gerenciar`)

2. **Criar Novo Usuário**
   - Clique no botão **"+ Adicionar Usuário"**
   - Preencha os campos:
     - **Nome Completo**: Nome do usuário
     - **Email**: Email único do usuário
     - **Senha**: Senha mínima de 6 caracteres
     - **Função**: Selecione o tipo de usuário:
       - **Elaborador**: Executa trabalhos
       - **Responsável**: Cria e gerencia trabalhos
       - **Administrador**: Acesso total ao sistema
   - Clique em **"Criar Usuário"**

3. **Pronto!** O usuário será criado e poderá fazer login imediatamente.

---

### Método 2: Criar Usuário pelo Supabase Dashboard

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto

2. **Criar Usuário na Autenticação**
   - Vá em **Authentication > Users**
   - Clique em **"Add user"** ou **"Create new user"**
   - Preencha:
     - Email
     - Senha
     - (Opcional) Nome nos metadados
   - Clique em **"Create user"**

3. **Criar Perfil no Banco de Dados**
   - Vá em **SQL Editor**
   - Execute o seguinte SQL (substitua os valores):

```sql
-- Substitua os valores abaixo
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'Usuário'),
  'elaborador'::user_role  -- ou 'responsavel' ou 'admin'
FROM auth.users u
WHERE u.email = 'email@exemplo.com'
ON CONFLICT (id) DO NOTHING;
```

---

### Método 3: Usuário se Registra (Auto-registro)

1. **Acesse a Página de Registro**
   - Vá para `/auth/register`
   - Preencha:
     - Nome Completo
     - Email
     - Senha (mínimo 6 caracteres)
   - Clique em **"Criar Conta"**

2. **Nota**: Usuários criados por auto-registro são automaticamente definidos como **Elaborador**

3. **Alterar Função do Usuário**
   - Um administrador pode alterar a função do usuário em **Gerenciar > Editar Usuário**

---

## 🎯 Como Acessar as Telas Específicas

### Dashboard por Perfil

O sistema redireciona automaticamente para o dashboard correto baseado no role do usuário:

- **Elaborador**: `/dashboard/elaborador`
- **Responsável**: `/dashboard/responsavel`
- **Administrador**: `/dashboard/admin`

### Acesso Manual

Você também pode acessar diretamente:
- Dashboard Principal: `/dashboard` (redireciona automaticamente)
- Trabalhos: `/trabalhos`
- Mensagens: `/mensagens`
- Documentos: `/documentos`
- Relatórios: `/relatorios`
- Gerenciar (apenas Admin/Responsável): `/gerenciar`

---

## 📝 Funções dos Usuários

### 👨‍💼 Administrador
- Acesso total ao sistema
- Pode criar, editar e excluir usuários
- Vê todos os trabalhos
- Acessa relatórios completos
- Pode gerenciar configurações

### 👔 Responsável
- Cria trabalhos
- Distribui trabalhos para elaboradores
- Solicita correções
- Acompanha progresso dos trabalhos
- Vê relatórios dos seus trabalhos

### 👨‍🔬 Elaborador
- Aceita trabalhos
- Executa trabalhos
- Faz entregas
- Recebe e corrige trabalhos
- Acompanha seus próprios trabalhos

---

## 🔐 Segurança

- Todos os usuários precisam de email único
- Senhas devem ter no mínimo 6 caracteres
- Apenas administradores podem criar usuários pelo sistema
- Usuários podem alterar apenas seus próprios perfis (exceto função)

---

## ❓ Problemas Comuns

### Usuário criado mas não consegue fazer login
1. Verifique se o perfil foi criado na tabela `profiles`
2. Execute o script SQL do Método 2, passo 3
3. Verifique se o email foi confirmado (se a confirmação estiver habilitada)

### Não consigo criar usuário pelo sistema
1. Verifique se você está logado como administrador
2. Verifique as políticas RLS no Supabase
3. Tente criar pelo Supabase Dashboard (Método 2)

### Usuário criado mas sem função correta
1. Vá em **Gerenciar**
2. Clique em **Editar** no usuário
3. Altere a função e salve

