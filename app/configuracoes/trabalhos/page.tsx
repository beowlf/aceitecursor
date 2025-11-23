'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TrabalhosSidebar from '@/components/layout/TrabalhosSidebar';
import Header from '@/components/layout/Header';
import { Database, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ConfiguracoesTrabalhosPage() {
  const { trabalhosSidebarOpen } = useSidebar();
  const router = useRouter();
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Valores padrão dos campos
  const [prioridades, setPrioridades] = useState([
    { id: 'urgente', label: 'Urgente', ativo: true },
    { id: 'media', label: 'Média', ativo: true },
    { id: 'alto', label: 'Alto', ativo: true },
  ]);
  
  const [statusTrabalho, setStatusTrabalho] = useState([
    { id: 'normal', label: 'Normal', ativo: true },
    { id: 'venda_do_dia', label: 'Venda do Dia', ativo: true },
    { id: 'falta_pagamento', label: 'Falta Pagamento', ativo: true },
  ]);

  const [novoPrioridade, setNovoPrioridade] = useState({ id: '', label: '' });
  const [novoStatusTrabalho, setNovoStatusTrabalho] = useState({ id: '', label: '' });

  useEffect(() => {
    loadUserAndConfig();
  }, []);

  async function loadUserAndConfig() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Carregar perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCurrentUser(profile);
        
        // Verificar se é admin ou responsável
        if (profile.role !== 'admin' && profile.role !== 'responsavel') {
          router.push('/dashboard');
          return;
        }
      }

      // Carregar configurações salvas (se houver uma tabela de configurações)
      // Por enquanto, usaremos os valores padrão
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Salvar configurações (por enquanto em localStorage, mas pode ser migrado para banco)
      localStorage.setItem('config_prioridades', JSON.stringify(prioridades));
      localStorage.setItem('config_status_trabalho', JSON.stringify(statusTrabalho));
      
      alert('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  function addPrioridade() {
    if (!novoPrioridade.id || !novoPrioridade.label) {
      alert('Preencha o ID e o Label da prioridade.');
      return;
    }
    
    if (prioridades.find(p => p.id === novoPrioridade.id)) {
      alert('Já existe uma prioridade com este ID.');
      return;
    }

    setPrioridades([...prioridades, { ...novoPrioridade, ativo: true }]);
    setNovoPrioridade({ id: '', label: '' });
  }

  function removePrioridade(id: string) {
    if (prioridades.length <= 1) {
      alert('Deve haver pelo menos uma prioridade.');
      return;
    }
    setPrioridades(prioridades.filter(p => p.id !== id));
  }

  function togglePrioridade(id: string) {
    setPrioridades(prioridades.map(p => 
      p.id === id ? { ...p, ativo: !p.ativo } : p
    ));
  }

  function addStatusTrabalho() {
    if (!novoStatusTrabalho.id || !novoStatusTrabalho.label) {
      alert('Preencha o ID e o Label do status.');
      return;
    }
    
    if (statusTrabalho.find(s => s.id === novoStatusTrabalho.id)) {
      alert('Já existe um status com este ID.');
      return;
    }

    setStatusTrabalho([...statusTrabalho, { ...novoStatusTrabalho, ativo: true }]);
    setNovoStatusTrabalho({ id: '', label: '' });
  }

  function removeStatusTrabalho(id: string) {
    if (statusTrabalho.length <= 1) {
      alert('Deve haver pelo menos um status.');
      return;
    }
    setStatusTrabalho(statusTrabalho.filter(s => s.id !== id));
  }

  function toggleStatusTrabalho(id: string) {
    setStatusTrabalho(statusTrabalho.map(s => 
      s.id === id ? { ...s, ativo: !s.ativo } : s
    ));
  }

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

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'responsavel') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <TrabalhosSidebar />
      <div className={`flex-1 ml-80 transition-all duration-300 ${trabalhosSidebarOpen ? 'mr-80' : ''}`}>
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <Link 
              href="/configuracoes" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={18} />
              Voltar para Configurações
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações de Trabalhos</h1>
            <p className="text-gray-600">Gerencie os valores disponíveis para Prioridade e Status do Trabalho</p>
          </div>

          <div className="space-y-6">
            {/* Prioridades */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Database className="text-primary-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Prioridades</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                {prioridades.map((prioridade) => (
                  <div key={prioridade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={prioridade.ativo}
                        onChange={() => togglePrioridade(prioridade.id)}
                        className="w-5 h-5 text-primary-500 rounded border-gray-300"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{prioridade.label}</p>
                        <p className="text-sm text-gray-500">ID: {prioridade.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removePrioridade(prioridade.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Remover"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Adicionar Nova Prioridade</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="ID (ex: baixa)"
                    value={novoPrioridade.id}
                    onChange={(e) => setNovoPrioridade({ ...novoPrioridade, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Label (ex: Baixa)"
                    value={novoPrioridade.label}
                    onChange={(e) => setNovoPrioridade({ ...novoPrioridade, label: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  onClick={addPrioridade}
                  className="mt-3 btn-secondary flex items-center gap-2"
                >
                  <Plus size={18} />
                  Adicionar Prioridade
                </button>
              </div>
            </div>

            {/* Status do Trabalho */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Database className="text-primary-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Status do Trabalho</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                {statusTrabalho.map((status) => (
                  <div key={status.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={status.ativo}
                        onChange={() => toggleStatusTrabalho(status.id)}
                        className="w-5 h-5 text-primary-500 rounded border-gray-300"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{status.label}</p>
                        <p className="text-sm text-gray-500">ID: {status.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeStatusTrabalho(status.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Remover"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Adicionar Novo Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="ID (ex: em_analise)"
                    value={novoStatusTrabalho.id}
                    onChange={(e) => setNovoStatusTrabalho({ ...novoStatusTrabalho, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Label (ex: Em Análise)"
                    value={novoStatusTrabalho.label}
                    onChange={(e) => setNovoStatusTrabalho({ ...novoStatusTrabalho, label: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  onClick={addStatusTrabalho}
                  className="mt-3 btn-secondary flex items-center gap-2"
                >
                  <Plus size={18} />
                  Adicionar Status
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

