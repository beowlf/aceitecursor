'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Users, UserPlus, Settings, Shield, Mail, Edit, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { getRoleLabel } from '@/lib/utils';

export default function GerenciarPage() {
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadUsuarios();
  }, []);

  async function loadUsuarios() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    setDeletingId(id);
    try {
      // Verificar se é o próprio usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id === id) {
        alert('Você não pode excluir seu próprio usuário.');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsuarios(prev => prev.filter(u => u.id !== id));
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSaveUser(userData: Partial<Profile>) {
    try {
      if (editingUser) {
        // Atualizar
        const { error } = await supabase
          .from('profiles')
          .update({
            name: userData.name,
            role: userData.role,
          })
          .eq('id', editingUser.id);

        if (error) throw error;
      } else {
        // Criar novo usuário (apenas perfil, não cria auth)
        alert('Para criar um novo usuário, use a página de registro. Esta função apenas atualiza perfis existentes.');
        return;
      }

      await loadUsuarios();
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário: ' + error.message);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-20">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar</h1>
              <p className="text-gray-600">Gerencie usuários e configurações do sistema</p>
            </div>
            <button
              onClick={() => {
                setEditingUser(null);
                setShowEditModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus size={20} />
              Adicionar Usuário
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usuarios.filter(u => u.role === 'admin').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Elaboradores</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usuarios.filter(u => u.role === 'elaborador').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando usuários...</p>
            </div>
          ) : (
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Usuário</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Função</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                              {usuario.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{usuario.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{usuario.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {getRoleLabel(usuario.role)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(usuario);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(usuario.id)}
                              disabled={deletingId === usuario.id}
                              className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                              title="Excluir"
                            >
                              {deletingId === usuario.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal de Edição */}
          {showEditModal && (
            <EditUserModal
              user={editingUser}
              onClose={() => {
                setShowEditModal(false);
                setEditingUser(null);
              }}
              onSave={handleSaveUser}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// Componente Modal de Edição
function EditUserModal({
  user,
  onClose,
  onSave,
}: {
  user: Profile | null;
  onClose: () => void;
  onSave: (data: Partial<Profile>) => void;
}) {
  const [formData, setFormData] = useState<{
    name: string;
    role: 'admin' | 'responsavel' | 'elaborador';
  }>({
    name: user?.name || '',
    role: user?.role || 'elaborador' as 'admin' | 'responsavel' | 'elaborador',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {user ? 'Editar Usuário' : 'Novo Usuário'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Função *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="elaborador">Elaborador</option>
              <option value="responsavel">Responsável</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {user && (
            <div>
              <p className="text-sm text-gray-600">Email: {user.email}</p>
              <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-6 pt-4 border-t">
          <button
            onClick={() => onSave(formData)}
            className="btn-primary flex-1"
          >
            Salvar
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

