# Prompts para Desenvolvimento do ElaboraCRM

Este documento contém os prompts organizados que foram utilizados para criar o sistema ElaboraCRM.

## 🟠 PROMPT 1 — Layout Completo Baseado na Imagem

**Para usar no Google Antigravity / Google Stitch:**

```
Analise profundamente o layout da imagem fornecida e gere um design completo, moderno e responsivo para um sistema SaaS chamado ElaboraCRM.

Quero que o layout seja extremamente fiel à estética da imagem, incluindo:
- cards arredondados
- cores suaves
- tipografia clean
- dashboard organizado
- tabelas, cards e gráficos
- sidebar com perfis (Responsável, Elaborador, Admin)

O sistema terá as seguintes telas:
- Dashboard principal
- Distribuição de trabalhos
- Fluxo de aceite do elaborador
- Termos obrigatórios antes de iniciar o trabalho
- Painel do elaborador com status
- Relatórios (entregas, correções, atrasos)
- Painel do responsável
- Página de detalhes do trabalho
- Área de upload de arquivos
- Histórico e timeline de eventos (quem aceitou o quê)

Gere:
- JSON do layout
- Design tokens
- Componentes
- Fluxos visuais
- Estrutura do dashboard

UI totalmente fiel ao estilo da imagem enviada.
```

## 🟠 PROMPT 2 — Lógica/Arquitetura do Sistema

**Para usar no Cursor:**

```
Você é um arquiteto de software responsável por criar um sistema SaaS chamado ElaboraCRM, cujo objetivo é gerenciar elaboração de trabalhos acadêmicos.

**Perfis:**
- Responsável (cria e distribui trabalhos)
- Elaborador (aceita e executa)
- Administrador

**Fluxo principal:**
1. O Responsável cria um trabalho informando:
   - Link original do arquivo
   - Tipo do trabalho (TCC, artigo, mestrado, etc.)
   - Se é feito do zero ou revisão
   - Se terá correções obrigatórias
   - Prazos
   - Termos obrigatórios

2. Antes de iniciar, o Elaborador precisa:
   - Ler os termos
   - Confirmar aceite
   - Assinar digitalmente (assinatura simples via token)
   - Marcar check-list de leitura

3. Após aceitar:
   - O trabalho entra no painel do elaborador
   - Ele deve entregar:
     - Arquivo final
     - Relatório anti-plágio (obrigatório)
     - Histórico de revisões

4. Caso haja correções:
   - O sistema cria automaticamente uma nova tarefa vinculada
   - Deve haver aceite novamente

**Relatórios:**
- Trabalhos concluídos
- Correções pendentes
- Atrasos
- Taxa de retrabalho dos elaboradores

**Sua tarefa:**
Gerar:
- Estrutura de banco de dados (tabelas, relações, indexes)
- Endpoints API REST
- Fluxo completo de autenticação multiusuário (SaaS)
- Middleware de permissões por perfil
- Modelos (Node.js + TypeScript)
- BANCO DE DADOS SUPABASE
- Rotinas de auditoria (quem aceitou, quando aceitou, IP etc.)

Faça tudo modularizado e escalável, pronto para uma aplicação SaaS moderna.
```

## 🟠 PROMPT 3 — Fluxos de Telas (UX)

**Para usar no Antigravity:**

```
Crie os fluxos de UX para o sistema ElaboraCRM, incluindo:

1. Fluxo do Responsável criando um trabalho
2. Fluxo do Elaborador aceitando os termos
3. Fluxo de assinatura digital simplificada
4. Fluxo de entrega do trabalho
5. Fluxo de solicitação de correção
6. Fluxo do relatório do responsável
7. Fluxo de timeline (log)
8. Fluxo de notificações

Cada fluxo deve conter:
- Tela 1 → Tela 2 → Tela 3
- Ações
- Botões
- Campos necessários
- Validações

Use o visual da imagem como referência para o UI.
```

## 🟠 PROMPT 4 — Página "Aceite do Elaborador"

**Para usar no Antigravity:**

```
Crie uma tela completa chamada Termo de Aceite do Elaborador, baseada no estilo da imagem enviada.

A tela deve conter:
- Título
- Descrição completa dos termos
- Checkbox obrigatório
- Assinatura digital simples (campo de assinatura ou PIN)
- Botão grande "Aceitar e Iniciar o Trabalho"
- Registro visual do aceite (data, hora, IP, usuário)
- Card do trabalho (nome, tipo, prazo, responsável)

Gere:
- Layout
- JSON
- Design token
- Componentização
```

## Estrutura JSON de Referência

```json
{
  "account_summary": {
    "total_balance": {
      "amount": 689372.00,
      "currency": "USD",
      "change_percentage": 5,
      "change_type": "positive"
    },
    "total_earnings": {
      "amount": 950.00,
      "currency": "USD",
      "monthly_change_percentage": 7,
      "change_type": "positive"
    }
  },
  "activities": [
    {
      "order_id": "#236687",
      "activity": "Payment from client",
      "price": 250.00,
      "currency": "USD",
      "status": "Completed",
      "date": "2023-08-15"
    }
  ]
}
```






