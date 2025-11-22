'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import ChartCard from '@/components/dashboard/ChartCard';
import { createClient } from '@/lib/supabase/client';

export default function RelatoriosPage() {
  const [stats, setStats] = useState({
    totalTrabalhos: 0,
    concluidos: 0,
    pendentes: 0,
    atrasados: 0,
    taxaRetrabalho: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const { data: trabalhos } = await supabase
        .from('trabalhos')
        .select('status, created_at, prazo_entrega');

      if (trabalhos) {
        const total = trabalhos.length;
        const concluidos = trabalhos.filter(t => t.status === 'concluido').length;
        const pendentes = trabalhos.filter(t => t.status === 'pendente' || t.status === 'em_andamento').length;
        const hoje = new Date();
        const atrasados = trabalhos.filter(t => {
          const prazo = new Date(t.prazo_entrega);
          return prazo < hoje && t.status !== 'concluido';
        }).length;

        // Calcular taxa de retrabalho (trabalhos com correções)
        const { data: correcoes } = await supabase
          .from('correcoes')
          .select('trabalho_id');

        const trabalhosComCorrecao = new Set(correcoes?.map(c => c.trabalho_id) || []);
        const taxaRetrabalho = total > 0 ? (trabalhosComCorrecao.size / total) * 100 : 0;

        setStats({
          totalTrabalhos: total,
          concluidos,
          pendentes,
          atrasados,
          taxaRetrabalho: Math.round(taxaRetrabalho),
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }

  const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'],
    profit: [10, 15, 12, 18, 16, 22, 20, 19],
    loss: [2, 3, 2, 4, 3, 5, 4, 4],
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-20">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
            <p className="text-gray-600">Acompanhe métricas e estatísticas do sistema</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando relatórios...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                  title="Total de Trabalhos"
                  value={stats.totalTrabalhos}
                />
                <StatCard
                  title="Trabalhos Concluídos"
                  value={stats.concluidos}
                  change={{
                    percentage: stats.totalTrabalhos > 0 ? Math.round((stats.concluidos / stats.totalTrabalhos) * 100) : 0,
                    type: 'positive',
                    label: 'do total',
                  }}
                />
                <StatCard
                  title="Trabalhos Pendentes"
                  value={stats.pendentes}
                />
                <StatCard
                  title="Trabalhos Atrasados"
                  value={stats.atrasados}
                  change={{
                    percentage: stats.atrasados > 0 ? 100 : 0,
                    type: stats.atrasados > 0 ? 'negative' : 'positive',
                  }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <StatCard
                  title="Taxa de Retrabalho"
                  value={`${stats.taxaRetrabalho}%`}
                  change={{
                    percentage: stats.taxaRetrabalho,
                    type: stats.taxaRetrabalho > 20 ? 'negative' : 'positive',
                    label: 'trabalhos com correções',
                  }}
                />
                <ChartCard
                  title="Trabalhos por Mês"
                  subtitle="Distribuição de trabalhos ao longo do tempo"
                  data={chartData}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}






