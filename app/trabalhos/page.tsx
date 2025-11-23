'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TrabalhosSidebar from '@/components/layout/TrabalhosSidebar';
import Header from '@/components/layout/Header';
import { Plus, Search, Filter, MoreVertical, FileText, Calendar, User, Edit, Trash2 } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { createClient } from '@/lib/supabase/client';
import { Trabalho } from '@/types/database';

export const dynamic = 'force-dynamic';

export default function TrabalhosPage() {
  const { trabalhosSidebarOpen } = useSidebar();
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const supabase = createClient();

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrabalhos(data || []);
    } catch (error) {
      console.error('Erro ao carregar trabalhos:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTrabalhos = trabalhos.filter(trabalho =>
    trabalho.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trabalho.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este trabalho? Esta ação não pode ser desfeita.')) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('trabalhos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remover da lista local
      setTrabalhos(prev => prev.filter(t => t.id !== id));
      
      // Registrar atividade
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('atividades').insert({
          trabalho_id: id,
          usuario_id: user.id,
          tipo: 'cancelamento',
          descricao: 'Trabalho excluído',
        });
      }
    } catch (error: any) {
      console.error('Erro ao excluir trabalho:', error);
      alert('Erro ao excluir trabalho: ' + error.message);
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <TrabalhosSidebar />
      <div className={`flex-1 ml-80 transition-all duration-300 ${trabalhosSidebarOpen ? 'mr-80' : ''}`}>
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Trabalhos</h1>
              <p className="text-gray-600">Gerencie todos os trabalhos acadêmicos</p>
            </div>
            <Link href="/trabalhos/novo" className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              Novo Trabalho
            </Link>
          </div>

          <div className="card mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar trabalhos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button className="btn-secondary flex items-center gap-2">
                <Filter size={18} />
                Filtros
              </button>
            </div>
          </div>

          {loading ? (
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando trabalhos...</p>
            </div>
          ) : filteredTrabalhos.length === 0 ? (
            <div className="card text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Nenhum trabalho encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTrabalhos.map((trabalho) => (
                <div key={trabalho.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{trabalho.titulo}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trabalho.status)}`}>
                          {trabalho.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText size={16} />
                          <span className="capitalize">{trabalho.tipo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          <span>Prazo: {formatDate(trabalho.prazo_entrega)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={16} />
                          <span>{trabalho.responsavel?.name || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {trabalho.status === 'pendente' && (
                        <Link
                          href={`/aceite/${trabalho.id}`}
                          className="btn-orange text-sm"
                        >
                          Aceitar
                        </Link>
                      )}
                      <Link
                        href={`/trabalhos/${trabalho.id}`}
                        className="btn-secondary text-sm"
                      >
                        Ver Detalhes
                      </Link>
                      <Link
                        href={`/trabalhos/${trabalho.id}/editar`}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(trabalho.id)}
                        disabled={deletingId === trabalho.id}
                        className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                        title="Excluir"
                      >
                        {deletingId === trabalho.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
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






