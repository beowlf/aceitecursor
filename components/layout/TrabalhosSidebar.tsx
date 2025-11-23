'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, AlertCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Trabalho } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';

export default function TrabalhosSidebar() {
  const { trabalhosSidebarOpen, setTrabalhosSidebarOpen } = useSidebar();
  const supabase = createClient();
  const [trabalhosEmAndamento, setTrabalhosEmAndamento] = useState<Trabalho[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrabalhosEmAndamento();
    // Recarregar a cada 30 segundos
    const interval = setInterval(loadTrabalhosEmAndamento, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadTrabalhosEmAndamento() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      let query = supabase
        .from('trabalhos')
        .select('*, responsavel:profiles!trabalhos_responsavel_id_fkey(*), elaborador:profiles!trabalhos_elaborador_id_fkey(*)')
        .in('status', ['aceito', 'em_andamento']);

      // Filtrar por role
      if (profile.role === 'elaborador') {
        query = query.eq('elaborador_id', user.id);
      } else if (profile.role === 'responsavel') {
        query = query.eq('responsavel_id', user.id);
      }
      // Admin vê todos

      const { data } = await query
        .order('prazo_entrega', { ascending: true })
        .limit(10);

      if (data) {
        setTrabalhosEmAndamento(data);
      }
    } catch (error) {
      console.error('Erro ao carregar trabalhos:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className={`w-80 bg-white border-l border-gray-200 h-screen fixed right-0 top-0 flex flex-col py-6 overflow-y-auto z-30 transition-transform duration-300 ease-in-out ${trabalhosSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="px-4 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Trabalhos em Andamento</h2>
          <p className="text-xs text-gray-500">Clique para ver detalhes</p>
        </div>
        <button
          onClick={() => setTrabalhosSidebarOpen(false)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Fechar"
        >
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div className="px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Carregando...</p>
          </div>
        </div>
      ) : trabalhosEmAndamento.length === 0 ? (
        <div className="px-4">
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Nenhum trabalho em andamento</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 px-4 space-y-3 overflow-y-auto">
          {trabalhosEmAndamento.map((trabalho) => {
            const prazoDate = new Date(trabalho.prazo_entrega);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const isAtrasado = prazoDate < hoje && trabalho.status !== 'concluido';
            const isCorrecao = trabalho.status === 'aguardando_correcao';
            const diasRestantes = Math.ceil((prazoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <Link
                key={trabalho.id}
                href={`/trabalhos/${trabalho.id}`}
                className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 flex-1 group-hover:text-primary-600">
                    {trabalho.titulo}
                  </p>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {isAtrasado && (
                      <div title="Atrasado">
                        <AlertCircle className="text-red-500" size={16} />
                      </div>
                    )}
                    {isCorrecao && (
                      <div title="Correção pendente">
                        <Clock className="text-orange-500" size={16} />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <Clock size={12} />
                  <span>
                    {isCorrecao ? 'Correção: ' : 'Entrega: '}
                    {formatDate(trabalho.prazo_entrega)}
                  </span>
                </div>

                {isAtrasado ? (
                  <span className="inline-block text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                    Atrasado
                  </span>
                ) : diasRestantes <= 3 && diasRestantes >= 0 ? (
                  <span className="inline-block text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                    {diasRestantes === 0 ? 'Hoje' : `${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} restante${diasRestantes > 1 ? 's' : ''}`}
                  </span>
                ) : null}

                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className={`inline-block text-xs px-2 py-1 rounded ${
                    trabalho.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                    trabalho.status === 'aceito' ? 'bg-blue-100 text-blue-700' :
                    trabalho.status === 'em_andamento' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {trabalho.status === 'pendente' ? 'Pendente' :
                     trabalho.status === 'aceito' ? 'Aceito' :
                     trabalho.status === 'em_andamento' ? 'Em Andamento' :
                     'Aguardando Correção'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {trabalhosEmAndamento.length > 0 && (
        <div className="px-4 mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/trabalhos"
            className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todos os trabalhos →
          </Link>
        </div>
      )}
    </aside>
  );
}

