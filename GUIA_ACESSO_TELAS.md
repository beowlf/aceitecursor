# 🚀 Guia de Acesso às Telas do ElaboraCRM

## 📍 Como Acessar as Telas Específicas

### 🔐 Login e Primeiro Acesso

1. **Acesse a página de login**: `http://localhost:3000/auth/login`
2. **Faça login** com seu email e senha
3. **Redirecionamento automático**: O sistema redireciona automaticamente para o dashboard correto baseado no seu perfil:
   - **Elaborador** → `/dashboard/elaborador`
   - **Responsável** → `/dashboard/responsavel`
   - **Administrador** → `/dashboard/admin`

---

## 🎯 Dashboards por Perfil

### 👨‍🔬 Dashboard Elaborador (`/dashboard/elaborador`)
- **Acesso**: Automático após login (se você é elaborador)
- **O que você vê**:
  - Seus trabalhos em andamento
  - Trabalhos pendentes de aceite
  - Trabalhos aguardando correção
  - Trabalhos atrasados
  - Mensagem motivacional personalizada

### 👔 Dashboard Responsável (`/dashboard/responsavel`)
- **Acesso**: Automático após login (se você é responsável)
- **O que você vê**:
  - Todos os trabalhos que você criou
  - Trabalhos pendentes
  - Trabalhos em andamento
  - Trabalhos atrasados
  - Mensagem motivacional personalizada

### 👨‍💼 Dashboard Administrador (`/dashboard/admin`)
- **Acesso**: Automático após login (se você é admin)
- **O que você vê**:
  - Visão geral de todos os trabalhos
  - Estatísticas de usuários
  - Taxa de conclusão
  - Trabalhos recentes
  - Mensagem motivacional personalizada

---

## 📋 Páginas Principais

### Trabalhos
- **URL**: `/trabalhos`
- **Acesso**: Todos os usuários
- **Funcionalidades**:
  - Listar todos os trabalhos
  - Criar novo trabalho (Responsável/Admin)
  - Editar trabalho
  - Excluir trabalho
  - Ver detalhes

### Criar Trabalho
- **URL**: `/trabalhos/novo`
- **Acesso**: Responsável e Administrador
- **Funcionalidades**: Formulário completo para criar novo trabalho

### Detalhes do Trabalho
- **URL**: `/trabalhos/[id]`
- **Acesso**: Todos os usuários (com permissões)
- **Funcionalidades**:
  - Ver todas as informações
  - Aceitar trabalho (Elaborador)
  - Fazer entrega (Elaborador)
  - Solicitar correção (Responsável)

### Aceitar Trabalho
- **URL**: `/aceite/[trabalhoId]`
- **Acesso**: Elaborador designado
- **Funcionalidades**:
  - Ler termos e condições
  - Assinar digitalmente
  - Confirmar aceite

### Entregar Trabalho
- **URL**: `/trabalhos/[id]/entregar`
- **Acesso**: Elaborador designado
- **Funcionalidades**:
  - Upload do arquivo principal
  - Upload do relatório anti-plágio
  - Adicionar observações

### Solicitar Correção
- **URL**: `/trabalhos/[id]/correcao`
- **Acesso**: Responsável do trabalho
- **Funcionalidades**:
  - Descrever correções necessárias
  - Definir prazo
  - Anexar arquivo de referência

### Gerenciar Usuários
- **URL**: `/gerenciar`
- **Acesso**: Administrador
- **Funcionalidades**:
  - Listar todos os usuários
  - Criar novo usuário
  - Editar usuário
  - Excluir usuário
  - Alterar função (role)

### Relatórios
- **URL**: `/relatorios`
- **Acesso**: Todos os usuários
- **Funcionalidades**:
  - Trabalhos concluídos
  - Correções pendentes
  - Trabalhos atrasados
  - Taxa de retrabalho por elaborador

### Atividades
- **URL**: `/atividades`
- **Acesso**: Todos os usuários
- **Funcionalidades**: Histórico de todas as atividades do sistema

### Programa
- **URL**: `/programa`
- **Acesso**: Todos os usuários
- **Funcionalidades**: Visualizar trabalhos por data (calendário)

### Mensagens
- **URL**: `/mensagens`
- **Acesso**: Todos os usuários
- **Funcionalidades**: Conversas baseadas em notificações

### Documentos
- **URL**: `/documentos`
- **Acesso**: Todos os usuários
- **Funcionalidades**: Listar e baixar documentos das entregas

### Debug (Admin)
- **URL**: `/admin/debug`
- **Acesso**: Apenas Administrador
- **Funcionalidades**: Health check, logs, testes de conexão

---

## 🎨 Recursos Visuais

### Sidebar Lateral
- **Largura**: 320px (ml-80)
- **Conteúdo**:
  - Menu de navegação
  - **Trabalhos em Andamento**: Lista os 5 trabalhos mais urgentes
  - Mostra data de entrega ou correção
  - Indicadores visuais (atrasado, correção pendente)
  - Botão de logout

### Header
- **Conteúdo**:
  - Logo e nome do sistema
  - Menu de navegação horizontal
  - **Avatar do usuário** (inicial ou foto se disponível)
  - **Nome do usuário**
  - Função (role)
  - Ícones de busca, notificações

### Mensagens Motivacionais
- **Localização**: Topo de cada dashboard
- **Conteúdo**: Mensagens aleatórias baseadas no horário do dia
- **Exemplos**:
  - "Bom dia! Que seu dia seja produtivo e cheio de conquistas! 🌅"
  - "Boa tarde! Continue focado e mantenha o ritmo! 🌞"
  - "Boa noite! Você fez um ótimo trabalho hoje! 🌙"

---

## 🔑 Permissões por Perfil

### Elaborador
- ✅ Ver seus próprios trabalhos
- ✅ Aceitar trabalhos
- ✅ Fazer entregas
- ✅ Ver correções
- ✅ Ver atividades relacionadas
- ❌ Criar trabalhos
- ❌ Gerenciar usuários

### Responsável
- ✅ Criar trabalhos
- ✅ Ver todos os seus trabalhos
- ✅ Solicitar correções
- ✅ Ver entregas
- ✅ Ver relatórios dos seus trabalhos
- ❌ Gerenciar usuários

### Administrador
- ✅ **Tudo** que Responsável pode fazer
- ✅ Gerenciar usuários
- ✅ Ver todos os trabalhos
- ✅ Ver todos os relatórios
- ✅ Acessar debug
- ✅ Alterar funções de usuários

---

## 💡 Dicas de Navegação

1. **Use a Sidebar**: Ela mostra seus trabalhos mais urgentes diretamente
2. **Dashboard Personalizado**: Cada perfil tem seu próprio dashboard otimizado
3. **Mensagens Motivacionais**: Aproveite as mensagens para manter o foco!
4. **Atalhos**: Use os links no Header para navegação rápida
5. **Avatar**: Seu avatar aparece no Header (inicial do nome ou foto se configurada)

---

## 🆘 Problemas de Acesso?

Se você não consegue acessar uma tela:
1. Verifique se está logado
2. Verifique seu perfil (role) em `/gerenciar` ou `/conta`
3. Verifique se tem permissão para acessar aquela funcionalidade
4. Se for admin, você tem acesso a tudo

