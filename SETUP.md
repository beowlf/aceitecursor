# Guia de Configuração - ElaboraCRM

## Pré-requisitos

- **Node.js 18+ instalado** ⚠️ **IMPORTANTE:** Se você recebeu erro "npm não é reconhecido", veja o arquivo `INSTALACAO_NODEJS.md` primeiro!
- Conta no Supabase (gratuita)
- npm (vem junto com o Node.js)

> 💡 **Não tem Node.js instalado?** Consulte o arquivo `INSTALACAO_NODEJS.md` para instruções detalhadas de instalação no Windows.

## Passo 1: Instalar Dependências

```bash
npm install
```

## Passo 2: Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. No painel do Supabase, vá em **SQL Editor**
3. Execute o script SQL localizado em `supabase/schema.sql`
4. Vá em **Settings > API** e copie:
   - Project URL
   - anon/public key

## Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Passo 4: Executar o Projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## Passo 5: Criar Primeiro Usuário

1. Acesse `http://localhost:3000/auth/login`
2. Clique em "Cadastre-se" ou acesse `/auth/register`
3. Crie sua conta
4. No Supabase, vá em **Authentication > Users**
5. Edite o usuário criado e adicione um registro na tabela `profiles`:

```sql
INSERT INTO profiles (id, email, name, role)
VALUES (
  'id_do_usuario_aqui',
  'seu@email.com',
  'Seu Nome',
  'admin' -- ou 'responsavel' ou 'elaborador'
);
```

## Estrutura do Banco de Dados

O sistema possui as seguintes tabelas principais:

- **profiles**: Perfis de usuários (admin, responsavel, elaborador)
- **trabalhos**: Trabalhos acadêmicos criados
- **aceites**: Registros de aceite dos elaboradores
- **entregas**: Entregas de trabalhos
- **correcoes**: Correções solicitadas
- **atividades**: Log de auditoria
- **notificacoes**: Notificações do sistema

## Funcionalidades Implementadas

✅ Sistema de autenticação com Supabase
✅ Dashboard com estatísticas e gráficos
✅ Criação de trabalhos (Responsável)
✅ Fluxo de aceite obrigatório (Elaborador)
✅ Assinatura digital simples
✅ Registro de auditoria (IP, data, hora)
✅ Relatórios e métricas
✅ Interface responsiva baseada no design fornecido

## Próximos Passos

- [ ] Implementar upload de arquivos (Supabase Storage)
- [ ] Sistema de notificações em tempo real
- [ ] Página de detalhes do trabalho
- [ ] Sistema de correções com aceite obrigatório
- [ ] Relatórios avançados com exportação
- [ ] Sistema de mensagens entre usuários

## Troubleshooting

### Erro: "npm.ps1 não pode ser carregado porque a execução de scripts foi desabilitada"

Este erro ocorre quando o PowerShell bloqueia a execução de scripts. Você tem 3 opções:

#### Opção 1: Usar o CMD (Mais Rápido) ⚡
1. Abra o **Prompt de Comando** (CMD) em vez do PowerShell
2. Navegue até a pasta do projeto: `cd D:\SISTEMAS\ACEITECURSOR`
3. Execute: `npm install`

#### Opção 2: Alterar Política de Execução (Requer Admin)
1. Abra o PowerShell **como Administrador**
2. Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Digite `S` quando solicitado
4. Feche e reabra o PowerShell normalmente
5. Execute: `npm install`

#### Opção 3: Bypass Temporário (Apenas para este comando)
Execute no PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -Command "npm install"
```

> 💡 **Recomendação:** Use a Opção 1 (CMD) se você não tem permissões de administrador.

## Suporte

Para dúvidas ou problemas, consulte a documentação do Supabase e Next.js.

