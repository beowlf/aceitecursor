'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TrabalhosSidebar from '@/components/layout/TrabalhosSidebar';
import Header from '@/components/layout/Header';
import { Users, UserPlus, Mail, Phone, Briefcase, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { getRoleLabel } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';

export const dynamic = 'force-dynamic';

export default function EquipePage() {
  const [membros, setMembros] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'responsavel' | 'elaborador' | null>(null);
  const supabase = createClient();
  const { trabalhosSidebarOpen } = useSidebar();

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth/login';
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || (profile.role !== 'admin' && profile.role !== 'responsavel')) {
        window.location.href = '/dashboard';
        return;
      }

      setUserRole(profile.role);
      loadEquipe();
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      window.location.href = '/dashboard';
    }
  }

  async function loadEquipe() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembros(data || []);
    } catch (error) {
      console.error('Erro ao carregar equipe:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: membros.length,
    elaboradores: membros.filter(m => m.role === 'elaborador').length,
    responsaveis: membros.filter(m => m.role === 'responsavel').length,
    admins: membros.filter(m => m.role === 'admin').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <TrabalhosSidebar />
      <div className={`flex-1 ml-80 transition-all duration-300 ${trabalhosSidebarOpen ? 'mr-80' : ''}`}>
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Equipe</h1>
              <p className="text-gray-600">Conheça os membros da sua equipe</p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <UserPlus size={20} />
              Adicionar Membro
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Elaboradores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.elaboradores}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Responsáveis</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.responsaveis}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="text-orange-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando equipe...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {membros.map((membro) => (
                <div key={membro.id} className="card hover:shadow-md transition-shadow">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                      {membro.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{membro.name}</h3>
                    <p className="text-sm text-gray-600">{membro.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {getRoleLabel(membro.role)}
                    </span>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <button className="w-full btn-secondary text-sm flex items-center justify-center gap-2">
                      <Mail size={16} />
                      Enviar Email
                    </button>
                    <button className="w-full btn-secondary text-sm flex items-center justify-center gap-2">
                      <Phone size={16} />
                      Contatar
                    </button>
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

