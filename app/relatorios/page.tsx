'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import ChartCard from '@/components/dashboard/ChartCard';
import { createClient } from '@/lib/supabase/client';
import { Trabalho, Correcao, Profile } from '@/types/database';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { FileText, AlertCircle, Download, TrendingDown, CheckCircle, Clock } from 'lucide-react';

export default function RelatoriosPage() {
  const [stats, setStats] = useState({
    totalTrabalhos: 0,
    concluidos: 0,
    pendentes: 0,
    atrasados: 0,
    taxaRetrabalho: 0,
  });
  const [trabalhosConcluidos, setTrabalhosConcluidos] = useState<Trabalho[]>([]);
  const [correcoesPendentes, setCorrecoesPendentes] = useState<Correcao[]>([]);
  const [trabalhosAtrasados, setTrabalhosAtrasados] = useState<Trabalho[]>([]);
  const [taxaRetrabalhoPorElaborador, setTaxaRetrabalhoPorElaborador] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      // Carregar trabalhos
      const { data: trabalhos } = await supabase
        .from('trabalhos')
        .select('*, elaborador:profiles!trabalhos_elaborador_id_fkey(*)');

      if (trabalhos) {
        const total = trabalhos.length;
        const concluidos = trabalhos.filter(t => t.status === 'concluido');
        const pendentes = trabalhos.filter(t => t.status === 'pendente' || t.status === 'em_andamento').length;
        const hoje = new Date();
        const atrasados = trabalhos.filter(t => {
          const prazo = new Date(t.prazo_entrega);
          return prazo < hoje && t.status !== 'concluido';
        });

        setTrabalhosConcluidos(concluidos.slice(0, 10));
        setTrabalhosAtrasados(atrasados.slice(0, 10));

        // Calcular taxa de retrabalho (trabalhos com correções)
        const { data: correcoes } = await supabase
          .from('correcoes')
          .select('trabalho_id, elaborador_id, status');

        const trabalhosComCorrecao = new Set(correcoes?.map(c => c.trabalho_id) || []);
        const taxaRetrabalho = total > 0 ? (trabalhosComCorrecao.size / total) * 100 : 0;

        // Correções pendentes
        const correcoesPend = correcoes?.filter(c => 
          c.status === 'aguardando_correcao'
        ) || [];
        setCorrecoesPendentes(correcoesPend.slice(0, 10) as any);

        // Taxa de retrabalho por elaborador
        const { data: elaboradores } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('role', 'elaborador');

        if (elaboradores) {
          const taxaPorElaborador = elaboradores.map(elab => {
            const trabalhosElab = trabalhos.filter(t => t.elaborador_id === elab.id);
            const correcoesElab = correcoes?.filter(c => c.elaborador_id === elab.id) || [];
            const taxa = trabalhosElab.length > 0
              ? (correcoesElab.length / trabalhosElab.length) * 100
              : 0;

            return {
              elaborador: elab.name,
              totalTrabalhos: trabalhosElab.length,
              totalCorrecoes: correcoesElab.length,
              taxa: Math.round(taxa),
            };
          }).filter(e => e.totalTrabalhos > 0);

          setTaxaRetrabalhoPorElaborador(taxaPorElaborador);
        }

        setStats({
          totalTrabalhos: total,
          concluidos: concluidos.length,
          pendentes,
          atrasados: atrasados.length,
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
      <div className="flex-1 ml-80">
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

              {/* Trabalhos Concluídos */}
              <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Trabalhos Concluídos</h2>
                  <Link href="/trabalhos" className="text-sm text-primary-500 hover:text-primary-600">
                    Ver todos
                  </Link>
                </div>
                {trabalhosConcluidos.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum trabalho concluído</p>
                ) : (
                  <div className="space-y-3">
                    {trabalhosConcluidos.map((trabalho) => (
                      <Link
                        key={trabalho.id}
                        href={`/trabalhos/${trabalho.id}`}
                        className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{trabalho.titulo}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span>Concluído em: {formatDate(trabalho.updated_at)}</span>
                              {trabalho.elaborador && (
                                <span>Elaborador: {trabalho.elaborador.name}</span>
                              )}
                            </div>
                          </div>
                          <CheckCircle className="text-green-500" size={20} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Correções Pendentes */}
              <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Correções Pendentes</h2>
                  <span className="text-sm text-gray-600">{correcoesPendentes.length} pendentes</span>
                </div>
                {correcoesPendentes.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhuma correção pendente</p>
                ) : (
                  <div className="space-y-3">
                    {correcoesPendentes.map((correcao) => (
                      <div
                        key={correcao.id}
                        className="p-3 border border-orange-200 rounded-lg bg-orange-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              Trabalho ID: {correcao.trabalho_id.substring(0, 8)}...
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{correcao.descricao.substring(0, 100)}...</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Prazo: {formatDate(correcao.prazo_correcao)}
                            </p>
                          </div>
                          <AlertCircle className="text-orange-500" size={20} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trabalhos Atrasados */}
              <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="text-red-500" size={20} />
                    Trabalhos Atrasados
                  </h2>
                  <span className="text-sm text-red-600 font-medium">{trabalhosAtrasados.length} atrasados</span>
                </div>
                {trabalhosAtrasados.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum trabalho atrasado</p>
                ) : (
                  <div className="space-y-3">
                    {trabalhosAtrasados.map((trabalho) => (
                      <Link
                        key={trabalho.id}
                        href={`/trabalhos/${trabalho.id}`}
                        className="block p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{trabalho.titulo}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-red-600">
                              <span>Prazo: {formatDate(trabalho.prazo_entrega)}</span>
                              {trabalho.elaborador && (
                                <span>Elaborador: {trabalho.elaborador.name}</span>
                              )}
                            </div>
                          </div>
                          <Clock className="text-red-500" size={20} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Taxa de Retrabalho por Elaborador */}
              {taxaRetrabalhoPorElaborador.length > 0 && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Taxa de Retrabalho por Elaborador</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Elaborador</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Trabalhos</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Correções</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Taxa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxaRetrabalhoPorElaborador.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{item.elaborador}</td>
                            <td className="py-3 px-4 text-gray-600">{item.totalTrabalhos}</td>
                            <td className="py-3 px-4 text-gray-600">{item.totalCorrecoes}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.taxa > 30 ? 'bg-red-100 text-red-800' :
                                item.taxa > 20 ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {item.taxa}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}






