'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TrabalhosSidebar from '@/components/layout/TrabalhosSidebar';
import Header from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import ProgressCard from '@/components/dashboard/ProgressCard';
import ActivityTable from '@/components/dashboard/ActivityTable';
import ChartCard from '@/components/dashboard/ChartCard';
import { createClient } from '@/lib/supabase/client';
import { Profile, Trabalho } from '@/types/database';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getMotivationalMessage } from '@/lib/motivational-messages';
import { useSidebar } from '@/contexts/SidebarContext';

export default function DashboardResponsavelPage() {
  const { trabalhosSidebarOpen } = useSidebar();
  const [user, setUser] = useState<Profile | null>(null);
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Carregar perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser(profile);
      }

      // Carregar trabalhos do responsável
      const { data: trabalhosData } = await supabase
        .from('trabalhos')
        .select('*, elaborador:profiles!trabalhos_elaborador_id_fkey(*)')
        .eq('responsavel_id', authUser.id)
        .order('created_at', { ascending: false });

      if (trabalhosData) {
        setTrabalhos(trabalhosData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: trabalhos.length,
    pendentes: trabalhos.filter(t => t.status === 'pendente').length,
    emAndamento: trabalhos.filter(t => t.status === 'em_andamento' || t.status === 'aceito').length,
    concluidos: trabalhos.filter(t => t.status === 'concluido').length,
    aguardandoCorrecao: trabalhos.filter(t => t.status === 'aguardando_correcao').length,
  };

  const trabalhosPendentes = trabalhos.filter(t => t.status === 'pendente').slice(0, 5);
  const trabalhosAtrasados = trabalhos.filter(t => {
    if (t.status === 'concluido') return false;
    return new Date(t.prazo_entrega) < new Date();
  }).slice(0, 5);

  // Calcular entregas da semana
  const hoje = new Date();
  const fimSemana = new Date(hoje);
  fimSemana.setDate(hoje.getDate() + 7);
  const entregasSemana = trabalhos.filter(t => {
    const prazoDate = new Date(t.prazo_entrega);
    return prazoDate >= hoje && prazoDate <= fimSemana && t.status !== 'concluido';
  });

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user ? `Olá, ${user.name.split(' ')[0]}!` : 'Dashboard - Responsável'}
            </h1>
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4 mb-4">
              <p className="text-primary-800 font-medium">
                {getMotivationalMessage()}
              </p>
            </div>
            <p className="text-gray-600">
              Gerencie seus trabalhos e acompanhe o progresso
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <StatCard
              title="Total de Trabalhos"
              value={stats.total}
            />
            <StatCard
              title="Pendentes"
              value={stats.pendentes}
              className="bg-yellow-50 border-yellow-200"
            />
            <StatCard
              title="Em Andamento"
              value={stats.emAndamento}
              className="bg-blue-50 border-blue-200"
            />
            <StatCard
              title="Aguardando Correção"
              value={stats.aguardandoCorrecao}
              className="bg-orange-50 border-orange-200"
            />
            <StatCard
              title="Concluídos"
              value={stats.concluidos}
              className="bg-green-50 border-green-200"
            />
          </div>

          {/* Entrega da Semana */}
          {entregasSemana.length > 0 && (
            <div className="card mb-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-purple-700">Entrega da Semana</h2>
                <Link href="/trabalhos" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Ver todos
                </Link>
              </div>
              <div className="space-y-3">
                {entregasSemana.slice(0, 5).map((trabalho) => {
                  const prazoDate = new Date(trabalho.prazo_entrega);
                  const diasRestantes = Math.ceil((prazoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Link
                      key={trabalho.id}
                      href={`/trabalhos/${trabalho.id}`}
                      className="block p-3 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{trabalho.titulo}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="capitalize">{trabalho.tipo}</span>
                            <span className="font-medium text-purple-600">
                              Prazo: {formatDate(trabalho.prazo_entrega)} ({diasRestantes} dia{diasRestantes > 1 ? 's' : ''})
                            </span>
                            {trabalho.elaborador && (
                              <span>Elaborador: {trabalho.elaborador.name}</span>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trabalho.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          trabalho.status === 'aceito' ? 'bg-blue-100 text-blue-800' :
                          trabalho.status === 'em_andamento' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {trabalho.status.replace('_', ' ')}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trabalhos Pendentes */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Trabalhos Pendentes</h2>
                <Link href="/trabalhos" className="text-sm text-primary-500 hover:text-primary-600">
                  Ver todos
                </Link>
              </div>
              {trabalhosPendentes.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum trabalho pendente</p>
              ) : (
                <div className="space-y-3">
                  {trabalhosPendentes.map((trabalho) => (
                    <Link
                      key={trabalho.id}
                      href={`/trabalhos/${trabalho.id}`}
                      className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{trabalho.titulo}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Prazo: {formatDate(trabalho.prazo_entrega)}
                          </p>
                        </div>
                        <FileText className="text-gray-400" size={20} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Trabalhos Atrasados */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="text-red-500" size={20} />
                  Trabalhos Atrasados
                </h2>
                <Link href="/trabalhos" className="text-sm text-primary-500 hover:text-primary-600">
                  Ver todos
                </Link>
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
                          <p className="text-sm text-red-600 mt-1">
                            Prazo: {formatDate(trabalho.prazo_entrega)}
                          </p>
                          {trabalho.elaborador && (
                            <p className="text-xs text-gray-500 mt-1">
                              Elaborador: {trabalho.elaborador.name}
                            </p>
                          )}
                        </div>
                        <Clock className="text-red-500" size={20} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

