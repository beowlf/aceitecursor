'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/client';
import { TrabalhoTipo } from '@/types/database';

export const dynamic = 'force-dynamic';

export default function NovoTrabalhoPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'tcc' as TrabalhoTipo,
    descricao: '',
    link_original: '',
    feito_do_zero: false,
    tem_correcoes_obrigatorias: true,
    prazo_entrega: '',
    termos: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Você precisa estar logado para criar um trabalho.');
        return;
      }

      // Verificar se o usuário é responsável ou admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'responsavel' && profile?.role !== 'admin') {
        alert('Apenas responsáveis podem criar trabalhos.');
        return;
      }

      const { data, error } = await supabase
        .from('trabalhos')
        .insert({
          ...formData,
          responsavel_id: user.id,
          status: 'pendente',
          prazo_entrega: new Date(formData.prazo_entrega).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Registrar atividade
      await supabase
        .from('atividades')
        .insert({
          trabalho_id: data.id,
          usuario_id: user.id,
          tipo: 'criacao',
          descricao: `Trabalho "${formData.titulo}" criado`,
        });

      router.push(`/trabalhos/${data.id}`);
    } catch (error: any) {
      console.error('Erro ao criar trabalho:', error);
      alert('Erro ao criar trabalho: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-80">
        <Header />
        <main className="p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Novo Trabalho</h1>
            <p className="text-gray-600 mb-6">Crie um novo trabalho acadêmico</p>

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
                    Tipo *
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
                <p className="text-xs text-gray-500 mt-1">
                  Estes termos serão exibidos para o elaborador antes de aceitar o trabalho.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Criando...' : 'Criar Trabalho'}
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






