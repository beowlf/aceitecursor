'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/client';
import { TrabalhoTipo, TrabalhoPrioridade, TrabalhoStatusTrabalho, Trabalho } from '@/types/database';
import { useSidebar } from '@/contexts/SidebarContext';

export const dynamic = 'force-dynamic';

export default function EditarTrabalhoPage() {
  const { trabalhosSidebarOpen } = useSidebar();
  const router = useRouter();
  const params = useParams();
  const trabalhoId = params.trabalhoId as string;
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'tcc' as TrabalhoTipo,
    descricao: '',
    link_original: '',
    feito_do_zero: false,
    tem_correcoes_obrigatorias: true,
    prazo_entrega: '',
    termos: '',
    observacoes: '',
    prioridade: 'media' as TrabalhoPrioridade,
    status_trabalho: 'normal' as TrabalhoStatusTrabalho,
    quantidade_paginas: '' as string | number,
  });

  useEffect(() => {
    loadTrabalho();
  }, [trabalhoId]);

  async function loadTrabalho() {
    try {
      const { data, error } = await supabase
        .from('trabalhos')
        .select('*')
        .eq('id', trabalhoId)
        .single();

      if (error) throw error;

      // Converter data para formato do input datetime-local
      const prazoDate = new Date(data.prazo_entrega);
      const prazoLocal = new Date(prazoDate.getTime() - prazoDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        titulo: data.titulo,
        tipo: data.tipo,
        descricao: data.descricao || '',
        link_original: data.link_original || '',
        feito_do_zero: data.feito_do_zero,
        tem_correcoes_obrigatorias: data.tem_correcoes_obrigatorias,
        prazo_entrega: prazoLocal,
        termos: data.termos,
        observacoes: data.observacoes || '',
        prioridade: data.prioridade || 'media',
        status_trabalho: data.status_trabalho || 'normal',
        quantidade_paginas: data.quantidade_paginas || '',
      });
    } catch (error: any) {
      console.error('Erro ao carregar trabalho:', error);
      alert('Erro ao carregar trabalho: ' + error.message);
      router.push('/trabalhos');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Você precisa estar logado para editar um trabalho.');
        return;
      }

      const { error } = await supabase
        .from('trabalhos')
        .update({
          ...formData,
          prazo_entrega: new Date(formData.prazo_entrega).toISOString(),
          quantidade_paginas: formData.quantidade_paginas ? parseInt(String(formData.quantidade_paginas)) : null,
        })
        .eq('id', trabalhoId);

      if (error) throw error;

      // Registrar atividade
      await supabase
        .from('atividades')
        .insert({
          trabalho_id: trabalhoId,
          usuario_id: user.id,
          tipo: 'atualizacao',
          descricao: `Trabalho "${formData.titulo}" atualizado`,
        });

      router.push(`/trabalhos/${trabalhoId}`);
    } catch (error: any) {
      console.error('Erro ao atualizar trabalho:', error);
      alert('Erro ao atualizar trabalho: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 mr-80">
          <Header />
          <main className="p-6">
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando trabalho...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
        <div className="flex-1 mr-80">
        <Header />
        <main className="p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Trabalho</h1>
            <p className="text-gray-600 mb-6">Edite as informações do trabalho</p>

            <form onSubmit={handleSubmit} className="card space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Trabalho *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: TCC - Sistema de Gestão"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Trabalho *
                  </label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TrabalhoTipo })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="tcc">TCC</option>
                    <option value="artigo">Artigo</option>
                    <option value="mestrado">Mestrado</option>
                    <option value="doutorado">Doutorado</option>
                    <option value="monografia">Monografia</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade *
                  </label>
                  <select
                    required
                    value={formData.prioridade}
                    onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as TrabalhoPrioridade })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="media">Média</option>
                    <option value="urgente">Urgente</option>
                    <option value="alto">Alto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status do Trabalho *
                  </label>
                  <select
                    required
                    value={formData.status_trabalho}
                    onChange={(e) => setFormData({ ...formData, status_trabalho: e.target.value as TrabalhoStatusTrabalho })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="venda_do_dia">Venda do Dia</option>
                    <option value="falta_pagamento">Falta Pagamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de Páginas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantidade_paginas}
                    onChange={(e) => setFormData({ ...formData, quantidade_paginas: e.target.value ? parseInt(e.target.value) : '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: 50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prazo de Entrega *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.prazo_entrega}
                  onChange={(e) => setFormData({ ...formData, prazo_entrega: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link do Arquivo Original
                </label>
                <input
                  type="url"
                  value={formData.link_original}
                  onChange={(e) => setFormData({ ...formData, link_original: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Descreva o trabalho..."
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.feito_do_zero}
                    onChange={(e) => setFormData({ ...formData, feito_do_zero: e.target.checked })}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Trabalho feito do zero</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.tem_correcoes_obrigatorias}
                    onChange={(e) => setFormData({ ...formData, tem_correcoes_obrigatorias: e.target.checked })}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Terá correções obrigatórias</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Termos e Condições *
                </label>
                <textarea
                  required
                  value={formData.termos}
                  onChange={(e) => setFormData({ ...formData, termos: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                  placeholder="Digite os termos e condições que o elaborador deve aceitar..."
                />
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

