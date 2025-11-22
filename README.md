# ElaboraCRM

Sistema SaaS para gerenciamento de trabalhos acadêmicos com controle de aceite, termos e assinatura digital.

## Funcionalidades

- **Perfis de Usuário**: Responsável, Elaborador e Administrador
- **Fluxo de Aceite Obrigatório**: Termos com registro de leitura e assinatura digital
- **Gestão de Trabalhos**: Criação, distribuição e acompanhamento
- **Relatórios**: Entregas, correções, atrasos e taxa de retrabalho
- **Dashboard Moderno**: Interface visual baseada em design financeiro

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Supabase (Banco de dados)
- Tailwind CSS
- Recharts (Gráficos)

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

3. Execute o projeto:
```bash
npm run dev
```

## Estrutura do Projeto

- `/app` - Páginas e rotas
- `/components` - Componentes reutilizáveis
- `/lib` - Utilitários e configurações
- `/types` - Tipos TypeScript
- `/supabase` - Migrations e schemas

