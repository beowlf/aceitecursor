import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import ProgressCard from '@/components/dashboard/ProgressCard';
import ActivityTable from '@/components/dashboard/ActivityTable';
import ChartCard from '@/components/dashboard/ChartCard';
import { Sun, Moon } from 'lucide-react';

// Mock data - será substituído por dados reais do Supabase
const mockStats = {
  totalTrabalhos: 24,
  trabalhosConcluidos: 18,
  trabalhosPendentes: 6,
  taxaConclusao: 75,
  trabalhosAtrasados: 2,
};

const mockActivities = [
  {
    id: '1',
    order_id: 'INV_000076',
    atividade: 'TCC - Sistema de Gestão',
    preco: 25500,
    status: 'Concluído',
    data: '2026-04-17T15:45:00',
  },
  {
    id: '2',
    order_id: 'INV_000075',
    atividade: 'Artigo Científico - IA',
    preco: 32750,
    status: 'Pendente',
    data: '2026-04-15T11:30:00',
  },
  {
    id: '3',
    order_id: 'INV_000074',
    atividade: 'Monografia - Direito',
    preco: 40200,
    status: 'Concluído',
    data: '2026-04-15T12:00:00',
  },
  {
    id: '4',
    order_id: 'INV_000073',
    atividade: 'Revisão - Artigo',
    preco: 50200,
    status: 'Em Progresso',
    data: '2026-04-14T21:15:00',
  },
  {
    id: '5',
    order_id: 'INV_000072',
    atividade: 'TCC - Engenharia',
    preco: 15900,
    status: 'Concluído',
    data: '2026-04-10T06:00:00',
  },
];

const mockChartData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'],
  profit: [25, 30, 28, 35, 32, 45, 40, 38],
  loss: [15, 18, 16, 20, 19, 25, 22, 21],
};

export default function DashboardPage() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-20">
        <Header />
        <main className="p-6">
          {/* Greeting Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {greeting}, Sajibur.
              </h1>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Sun size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Moon size={20} />
                </button>
              </div>
            </div>
            <p className="text-gray-600">
              Acompanhe seus trabalhos, monitore o progresso e acompanhe o status.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total de Trabalhos"
              value={mockStats.totalTrabalhos}
              change={{
                percentage: 5,
                type: 'positive',
                label: 'que no mês passado',
              }}
            />
            <StatCard
              title="Trabalhos Concluídos"
              value={mockStats.trabalhosConcluidos}
              change={{
                percentage: 7,
                type: 'positive',
                label: 'Este mês',
              }}
              className="bg-primary-50 border-primary-200"
            />
            <StatCard
              title="Trabalhos Pendentes"
              value={mockStats.trabalhosPendentes}
              change={{
                percentage: 5,
                type: 'negative',
                label: 'Este mês',
              }}
            />
            <StatCard
              title="Taxa de Conclusão"
              value={`${mockStats.taxaConclusao}%`}
              change={{
                percentage: 8,
                type: 'positive',
                label: 'Este mês',
              }}
            />
          </div>

          {/* Chart */}
          <div className="mb-6">
            <ChartCard
              title="Trabalhos por Mês"
              subtitle="Visualize seus trabalhos em um determinado período"
              data={mockChartData}
            />
          </div>

          {/* Progress and Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <ProgressCard
                title="Limite Mensal de Trabalhos"
                current={14}
                total={55}
                currency=""
              />
            </div>
            <div className="lg:col-span-2">
              <ActivityTable atividades={mockActivities} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}






