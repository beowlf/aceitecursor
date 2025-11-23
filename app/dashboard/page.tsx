'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TrabalhosSidebar from '@/components/layout/TrabalhosSidebar';
import Header from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import ProgressCard from '@/components/dashboard/ProgressCard';
import ActivityTable from '@/components/dashboard/ActivityTable';
import ChartCard from '@/components/dashboard/ChartCard';
import { Sun, Moon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { getMotivationalMessage } from '@/lib/motivational-messages';
import { useSidebar } from '@/contexts/SidebarContext';

export const dynamic = 'force-dynamic';

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
  const router = useRouter();
  const supabase = createClient();
  const { trabalhosSidebarOpen } = useSidebar();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        // Usuário não autenticado - redirecionar para login
        router.push('/auth/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        setLoading(false);
        return;
      }

      if (profile) {
        setUser(profile);
        // Redirecionar para dashboard específico baseado no role
        if (profile.role === 'responsavel') {
          router.replace('/dashboard/responsavel');
          return;
        } else if (profile.role === 'elaborador') {
          router.replace('/dashboard/elaborador');
          return;
        } else if (profile.role === 'admin') {
          router.replace('/dashboard/admin');
          return;
        }
      } else {
        // Perfil não encontrado - tentar criar
        console.warn('Perfil não encontrado para usuário:', authUser.id);
        // Redirecionar para login ou mostrar erro
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';
  const motivationalMessage = getMotivationalMessage();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <TrabalhosSidebar />
        <div className={`flex-1 ml-80 transition-all duration-300 ${trabalhosSidebarOpen ? 'mr-80' : ''}`}>
          <Header />
          <main className="p-6">
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <TrabalhosSidebar />
        <div className={`flex-1 ml-80 transition-all duration-300 ${trabalhosSidebarOpen ? 'mr-80' : ''}`}>
        <Header />
        <main className="p-6">
          {/* Greeting Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {greeting}{user ? `, ${user.name.split(' ')[0]}` : ''}!
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
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4 mb-4">
              <p className="text-primary-800 font-medium">
                {motivationalMessage}
              </p>
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






