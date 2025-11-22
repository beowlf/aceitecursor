'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Activity, Calendar, Clock, User, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

export default function AtividadesPage() {
  const [atividades, setAtividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadAtividades();
  }, []);

  async function loadAtividades() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('atividades')
        .select('*, trabalho:trabalhos(*), usuario:profiles(*)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAtividades(data || []);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    } finally {
      setLoading(false);
    }
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      criacao: 'Criação',
      aceite: 'Aceite',
      entrega: 'Entrega',
      correcao: 'Correção',
      cancelamento: 'Cancelamento',
      atualizacao: 'Atualização',
    };
    return labels[tipo] || tipo;
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'criacao':
        return <FileText className="text-blue-500" size={20} />;
      case 'aceite':
        return <Activity className="text-green-500" size={20} />;
      case 'entrega':
        return <Calendar className="text-purple-500" size={20} />;
      case 'correcao':
        return <Clock className="text-orange-500" size={20} />;
      default:
        return <Activity className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-80">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Atividades</h1>
            <p className="text-gray-600">Acompanhe todas as atividades do sistema</p>
          </div>

          {loading ? (
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando atividades...</p>
            </div>
          ) : atividades.length === 0 ? (
            <div className="card text-center py-12">
              <Activity className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Nenhuma atividade encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {atividades.map((atividade) => (
                <div key={atividade.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getTipoIcon(atividade.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {getTipoLabel(atividade.tipo)}
                        </h3>
                        {atividade.trabalho_id ? (
                          <Link
                            href={`/trabalhos/${atividade.trabalho_id}`}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors"
                          >
                            {atividade.trabalho?.titulo || 'Trabalho removido'}
                          </Link>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {atividade.trabalho?.titulo || 'Trabalho removido'}
                          </span>
                        )}
                      </div>
                      {atividade.descricao && (
                        <p className="text-gray-600 text-sm mb-3">{atividade.descricao}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{atividade.usuario?.name || 'Usuário desconhecido'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{formatDate(atividade.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

