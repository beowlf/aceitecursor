'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { AlertCircle, Upload, FileText, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Trabalho, Entrega } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';

export const dynamic = 'force-dynamic';

export default function SolicitarCorrecaoPage() {
  const params = useParams();
  const router = useRouter();
  const trabalhoId = params.trabalhoId as string;
  const supabase = createClient();

  const [trabalho, setTrabalho] = useState<Trabalho | null>(null);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    entrega_id: '',
    descricao: '',
    prazo_correcao: '',
    arquivo_referencia: null as File | null,
  });

  useEffect(() => {
    loadData();
  }, [trabalhoId]);

  async function loadData() {
    try {
      const { data: trabalhoData, error: trabalhoError } = await supabase
        .from('trabalhos')
        .select('*, responsavel:profiles!trabalhos_responsavel_id_fkey(*), elaborador:profiles!trabalhos_elaborador_id_fkey(*)')
        .eq('id', trabalhoId)
        .single();

      if (trabalhoError) throw trabalhoError;
      setTrabalho(trabalhoData);

      // Carregar entregas
      const { data: entregasData } = await supabase
        .from('entregas')
        .select('*')
        .eq('trabalho_id', trabalhoId)
        .order('entregue_em', { ascending: false });

      if (entregasData) {
        setEntregas(entregasData);
        if (entregasData.length > 0 && !formData.entrega_id) {
          setFormData(prev => ({ ...prev, entrega_id: entregasData[0].id }));
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados: ' + error.message);
      router.push(`/trabalhos/${trabalhoId}`);
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile(file: File, path: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('trabalhos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('trabalhos')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.descricao.trim()) {
      alert('Por favor, descreva as correções necessárias.');
      return;
    }

    if (!formData.prazo_correcao) {
      alert('Por favor, informe o prazo para correção.');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Você precisa estar logado para solicitar correções.');
        return;
      }

      // Verificar se o usuário é responsável ou admin
      if (trabalho?.responsavel_id !== user.id && trabalho?.responsavel?.role !== 'admin') {
        alert('Apenas o responsável pode solicitar correções.');
        return;
      }

      let arquivoUrl: string | undefined;
      if (formData.arquivo_referencia) {
        arquivoUrl = await uploadFile(formData.arquivo_referencia, `correcoes/${trabalhoId}`);
      }

      // Criar correção
      const { data: correcao, error: correcaoError } = await supabase
        .from('correcoes')
        .insert({
          trabalho_id: trabalhoId,
          entrega_id: formData.entrega_id || null,
          responsavel_id: user.id,
          elaborador_id: trabalho?.elaborador_id!,
          descricao: formData.descricao,
          arquivo_referencia_url: arquivoUrl,
          prazo_correcao: new Date(formData.prazo_correcao).toISOString(),
          status: 'aguardando_correcao',
          aceite_obrigatorio: trabalho?.tem_correcoes_obrigatorias || true,
        })
        .select()
        .single();

      if (correcaoError) throw correcaoError;

      // Atualizar status do trabalho
      await supabase
        .from('trabalhos')
        .update({ status: 'aguardando_correcao' })
        .eq('id', trabalhoId);

      // Registrar atividade
      await supabase
        .from('atividades')
        .insert({
          trabalho_id: trabalhoId,
          usuario_id: user.id,
          tipo: 'correcao',
          descricao: `Correção solicitada: ${formData.descricao.substring(0, 50)}...`,
        });

      // Criar notificação para o elaborador
      if (trabalho?.elaborador_id) {
        await supabase
          .from('notificacoes')
          .insert({
            usuario_id: trabalho.elaborador_id,
            trabalho_id: trabalhoId,
            titulo: 'Correção Solicitada',
            mensagem: `Correções foram solicitadas no trabalho "${trabalho.titulo}"`,
          });
      }

      // Se aceite obrigatório, criar novo aceite
      if (trabalho?.tem_correcoes_obrigatorias && trabalho?.elaborador_id) {
        await supabase
          .from('aceites')
          .insert({
            trabalho_id: trabalhoId,
            elaborador_id: trabalho.elaborador_id,
            status: 'pendente',
            termos_lidos: false,
          });
      }

      alert('Correção solicitada com sucesso!');
      router.push(`/trabalhos/${trabalhoId}`);
    } catch (error: any) {
      console.error('Erro ao solicitar correção:', error);
      alert('Erro ao solicitar correção: ' + error.message);
    } finally {
      setSubmitting(false);
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
              <p className="text-gray-600">Carregando...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!trabalho) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 mr-80">
          <Header />
          <main className="p-6">
            <div className="card text-center py-12">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <p className="text-gray-600">Trabalho não encontrado</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
        <div className={`flex-1 ml-80 transition-all duration-300 ${trabalhosSidebarOpen ? 'mr-80' : ''}`}>
        <Header />
        <main className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
              >
                <X size={20} />
                Voltar
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitar Correção</h1>
              <p className="text-gray-600">Solicite correções no trabalho entregue</p>
            </div>

            {/* Informações do Trabalho */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Trabalho</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Título:</span> {trabalho.titulo}</p>
                <p><span className="font-medium">Elaborador:</span> {trabalho.elaborador?.name || 'N/A'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-6">
              {/* Selecionar Entrega */}
              {entregas.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entrega a Corrigir *
                  </label>
                  <select
                    value={formData.entrega_id}
                    onChange={(e) => setFormData({ ...formData, entrega_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {entregas.map((entrega) => (
                      <option key={entrega.id} value={entrega.id}>
                        Entrega de {formatDate(entrega.entregue_em)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Descrição da Correção */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição das Correções * <span className="text-red-500">(Obrigatório)</span>
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Descreva detalhadamente as correções que devem ser feitas..."
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Seja específico e detalhado sobre o que precisa ser corrigido.
                </p>
              </div>

              {/* Prazo de Correção */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prazo para Correção * <span className="text-red-500">(Obrigatório)</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.prazo_correcao}
                  onChange={(e) => setFormData({ ...formData, prazo_correcao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Arquivo de Referência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo de Referência (Opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    id="arquivo-referencia"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setFormData({ ...formData, arquivo_referencia: e.target.files?.[0] || null })}
                    className="hidden"
                  />
                  <label htmlFor="arquivo-referencia" className="cursor-pointer">
                    {formData.arquivo_referencia ? (
                      <div className="space-y-2">
                        <FileText className="mx-auto text-green-500" size={48} />
                        <p className="text-sm font-medium text-gray-900">{formData.arquivo_referencia.name}</p>
                        <p className="text-xs text-gray-500">
                          {(formData.arquivo_referencia.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto text-gray-400" size={48} />
                        <p className="text-sm text-gray-600">
                          Clique para selecionar um arquivo de referência
                        </p>
                        <p className="text-xs text-gray-500">
                          Formatos aceitos: PDF, DOC, DOCX, JPG, PNG
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Você pode anexar um arquivo com anotações ou exemplos de como deve ser a correção.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Solicitar Correção
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary"
                  disabled={submitting}
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

