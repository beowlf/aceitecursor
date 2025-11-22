'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import { createClient } from '@/lib/supabase/client';
import { Profile, Trabalho } from '@/types/database';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Users, FileText, AlertCircle, TrendingUp } from 'lucide-react';

export default function DashboardAdminPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
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
        if (profile.role !== 'admin') {
          // Redirecionar se não for admin
          if (profile.role === 'responsavel') {
            window.location.href = '/dashboard/responsavel';
          } else if (profile.role === 'elaborador') {
            window.location.href = '/dashboard/elaborador';
          }
          return;
        }
      }

      // Carregar todos os trabalhos
      const { data: trabalhosData } = await supabase
        .from('trabalhos')
        .select('*, responsavel:profiles!trabalhos_responsavel_id_fkey(*), elaborador:profiles!trabalhos_elaborador_id_fkey(*)')
        .order('created_at', { ascending: false });

      if (trabalhosData) {
        setTrabalhos(trabalhosData);
      }

      // Carregar todos os usuários
      const { data: usuariosData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usuariosData) {
        setUsuarios(usuariosData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    totalTrabalhos: trabalhos.length,
    trabalhosConcluidos: trabalhos.filter(t => t.status === 'concluido').length,
    trabalhosPendentes: trabalhos.filter(t => t.status === 'pendente').length,
    trabalhosAtrasados: trabalhos.filter(t => {
      if (t.status === 'concluido') return false;
      return new Date(t.prazo_entrega) < new Date();
    }).length,
    totalUsuarios: usuarios.length,
    elaboradores: usuarios.filter(u => u.role === 'elaborador').length,
    responsaveis: usuarios.filter(u => u.role === 'responsavel').length,
    admins: usuarios.filter(u => u.role === 'admin').length,
  };

  const taxaConclusao = stats.totalTrabalhos > 0
    ? Math.round((stats.trabalhosConcluidos / stats.totalTrabalhos) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-20">
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
      <div className="flex-1 ml-20">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard - Administrador
            </h1>
            <p className="text-gray-600">
              Visão geral do sistema e estatísticas
            </p>
          </div>

          {/* Stats Grid - Trabalhos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total de Trabalhos"
              value={stats.totalTrabalhos}
            />
            <StatCard
              title="Trabalhos Concluídos"
              value={stats.trabalhosConcluidos}
              className="bg-green-50 border-green-200"
            />
            <StatCard
              title="Trabalhos Pendentes"
              value={stats.trabalhosPendentes}
              className="bg-yellow-50 border-yellow-200"
            />
            <StatCard
              title="Trabalhos Atrasados"
              value={stats.trabalhosAtrasados}
              className="bg-red-50 border-red-200"
            />
          </div>

          {/* Stats Grid - Usuários */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total de Usuários"
              value={stats.totalUsuarios}
              icon={<Users className="text-blue-500" size={24} />}
            />
            <StatCard
              title="Elaboradores"
              value={stats.elaboradores}
              className="bg-purple-50 border-purple-200"
            />
            <StatCard
              title="Responsáveis"
              value={stats.responsaveis}
              className="bg-blue-50 border-blue-200"
            />
            <StatCard
              title="Administradores"
              value={stats.admins}
              className="bg-gray-50 border-gray-200"
            />
          </div>

          {/* Taxa de Conclusão */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Taxa de Conclusão</h2>
              <TrendingUp className="text-primary-500" size={24} />
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-gray-900">{taxaConclusao}%</span>
                  <span className="text-sm text-gray-600">de conclusão</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-primary-500 h-4 rounded-full transition-all"
                    style={{ width: `${taxaConclusao}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Trabalhos Recentes */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Trabalhos Recentes</h2>
              <Link href="/trabalhos" className="text-sm text-primary-500 hover:text-primary-600">
                Ver todos
              </Link>
            </div>
            {trabalhos.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum trabalho encontrado</p>
            ) : (
              <div className="space-y-3">
                {trabalhos.slice(0, 10).map((trabalho) => (
                  <Link
                    key={trabalho.id}
                    href={`/trabalhos/${trabalho.id}`}
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{trabalho.titulo}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>Responsável: {trabalho.responsavel?.name || 'N/A'}</span>
                          {trabalho.elaborador && (
                            <span>Elaborador: {trabalho.elaborador.name}</span>
                          )}
                          <span>Prazo: {formatDate(trabalho.prazo_entrega)}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trabalho.status === 'concluido' ? 'bg-green-100 text-green-800' :
                        trabalho.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {trabalho.status.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

