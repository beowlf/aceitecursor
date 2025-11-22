'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import { createClient } from '@/lib/supabase/client';
import { Profile, Trabalho } from '@/types/database';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { getMotivationalMessage } from '@/lib/motivational-messages';

export const dynamic = 'force-dynamic';

export default function DashboardElaboradorPage() {
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

      // Carregar trabalhos do elaborador
      const { data: trabalhosData } = await supabase
        .from('trabalhos')
        .select('*, responsavel:profiles!trabalhos_responsavel_id_fkey(*)')
        .eq('elaborador_id', authUser.id)
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
    aguardandoCorrecao: trabalhos.filter(t => t.status === 'aguardando_correcao').length,
    concluidos: trabalhos.filter(t => t.status === 'concluido').length,
  };

  const trabalhosPendentesAceite = trabalhos.filter(t => t.status === 'pendente').slice(0, 5);
  const trabalhosEmAndamento = trabalhos.filter(t => 
    t.status === 'aceito' || t.status === 'em_andamento'
  ).slice(0, 5);
  const trabalhosAguardandoCorrecao = trabalhos.filter(t => 
    t.status === 'aguardando_correcao'
  ).slice(0, 5);
  const trabalhosAtrasados = trabalhos.filter(t => {
    if (t.status === 'concluido') return false;
    return new Date(t.prazo_entrega) < new Date();
  }).slice(0, 5);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-80">
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
      <div className="flex-1 ml-80">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user ? `Olá, ${user.name.split(' ')[0]}!` : 'Dashboard - Elaborador'}
            </h1>
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4 mb-4">
              <p className="text-primary-800 font-medium">
                {getMotivationalMessage()}
              </p>
            </div>
            <p className="text-gray-600">
              Acompanhe seus trabalhos e prazos
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <StatCard
              title="Meus Trabalhos"
              value={stats.total}
            />
            <StatCard
              title="Aguardando Aceite"
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trabalhos Pendentes de Aceite */}
            {trabalhosPendentesAceite.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Aguardando Aceite</h2>
                  <Link href="/trabalhos" className="text-sm text-primary-500 hover:text-primary-600">
                    Ver todos
                  </Link>
                </div>
                <div className="space-y-3">
                  {trabalhosPendentesAceite.map((trabalho) => (
                    <Link
                      key={trabalho.id}
                      href={`/aceite/${trabalho.id}`}
                      className="block p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{trabalho.titulo}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Prazo: {formatDate(trabalho.prazo_entrega)}
                          </p>
                        </div>
                        <CheckCircle className="text-orange-500" size={20} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Trabalhos Em Andamento */}
            {trabalhosEmAndamento.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Em Andamento</h2>
                  <Link href="/trabalhos" className="text-sm text-primary-500 hover:text-primary-600">
                    Ver todos
                  </Link>
                </div>
                <div className="space-y-3">
                  {trabalhosEmAndamento.map((trabalho) => (
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
                        <Upload className="text-blue-500" size={20} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Trabalhos Aguardando Correção */}
            {trabalhosAguardandoCorrecao.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Aguardando Correção</h2>
                  <Link href="/trabalhos" className="text-sm text-primary-500 hover:text-primary-600">
                    Ver todos
                  </Link>
                </div>
                <div className="space-y-3">
                  {trabalhosAguardandoCorrecao.map((trabalho) => (
                    <Link
                      key={trabalho.id}
                      href={`/trabalhos/${trabalho.id}`}
                      className="block p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{trabalho.titulo}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Prazo: {formatDate(trabalho.prazo_entrega)}
                          </p>
                        </div>
                        <AlertCircle className="text-orange-500" size={20} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Trabalhos Atrasados */}
            {trabalhosAtrasados.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="text-red-500" size={20} />
                    Atrasados
                  </h2>
                  <Link href="/trabalhos" className="text-sm text-primary-500 hover:text-primary-600">
                    Ver todos
                  </Link>
                </div>
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
                        </div>
                        <Clock className="text-red-500" size={20} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

