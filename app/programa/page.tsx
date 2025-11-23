'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TrabalhosSidebar from '@/components/layout/TrabalhosSidebar';
import Header from '@/components/layout/Header';
import { Calendar, Clock, BookOpen, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Trabalho } from '@/types/database';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { useSidebar } from '@/contexts/SidebarContext';

export const dynamic = 'force-dynamic';

export default function ProgramaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { trabalhosSidebarOpen } = useSidebar();

  useEffect(() => {
    loadTrabalhos();
  }, []);

  async function loadTrabalhos() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trabalhos')
        .select('*, responsavel:profiles!trabalhos_responsavel_id_fkey(*), elaborador:profiles!trabalhos_elaborador_id_fkey(*)')
        .order('prazo_entrega', { ascending: true });

      if (error) throw error;
      setTrabalhos(data || []);
    } catch (error) {
      console.error('Erro ao carregar trabalhos:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filtrar trabalhos por data selecionada
  const trabalhosFiltrados = trabalhos.filter(trabalho => {
    const prazoDate = new Date(trabalho.prazo_entrega).toISOString().split('T')[0];
    return prazoDate === selectedDate || !selectedDate;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'aceito':
      case 'em_andamento':
        return <Clock className="text-blue-500" size={20} />;
      case 'pendente':
        return <AlertCircle className="text-yellow-500" size={20} />;
      case 'aguardando_correcao':
        return <AlertCircle className="text-orange-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <TrabalhosSidebar />
      <div className={`flex-1 ml-80 transition-all duration-300 ${trabalhosSidebarOpen ? 'mr-80' : ''}`}>
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Programa</h1>
            <p className="text-gray-600">Visualize e gerencie sua programação de trabalhos</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Calendário</h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Agendado</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Concluído</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Pendente</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Programações</h2>
                  <Link href="/trabalhos/novo" className="btn-primary text-sm flex items-center gap-2">
                    <Plus size={16} />
                    Novo Trabalho
                  </Link>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando programações...</p>
                  </div>
                ) : trabalhosFiltrados.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">
                    Nenhum trabalho programado para esta data
                  </p>
                ) : (
                  <div className="space-y-4">
                    {trabalhosFiltrados.map((trabalho) => {
                      const prazoDate = new Date(trabalho.prazo_entrega);
                      const isAtrasado = prazoDate < new Date() && trabalho.status !== 'concluido';
                      
                      return (
                        <Link
                          key={trabalho.id}
                          href={`/trabalhos/${trabalho.id}`}
                          className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="mt-1">
                                {getStatusIcon(trabalho.status)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900">{trabalho.titulo}</h3>
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs capitalize">
                                    {trabalho.tipo}
                                  </span>
                                  {isAtrasado && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                      Atrasado
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    <span>{formatDate(trabalho.prazo_entrega)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>{prazoDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <BookOpen size={14} />
                                    <span>{trabalho.responsavel?.name || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {trabalho.status.replace('_', ' ')}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

