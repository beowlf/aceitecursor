'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Trabalho } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';

export const dynamic = 'force-dynamic';

export default function EntregarTrabalhoPage() {
  const { trabalhosSidebarOpen } = useSidebar();
  const params = useParams();
  const router = useRouter();
  const trabalhoId = params.trabalhoId as string;
  const supabase = createClient();

  const [trabalho, setTrabalho] = useState<Trabalho | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    antiplagio_enviado: false,
    previa_enviada: false,
    trabalho_final_enviado: false,
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadTrabalho();
  }, [trabalhoId]);

  async function loadTrabalho() {
    try {
      const { data, error } = await supabase
        .from('trabalhos')
        .select('*, responsavel:profiles!trabalhos_responsavel_id_fkey(*), elaborador:profiles!trabalhos_elaborador_id_fkey(*)')
        .eq('id', trabalhoId)
        .single();

      if (error) throw error;
      setTrabalho(data);
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
    
    if (!formData.antiplagio_enviado || !formData.trabalho_final_enviado) {
      alert('Por favor, confirme que enviou o Relatório Anti-Plágio e o Arquivo do Trabalho Final.');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Você precisa estar logado para fazer uma entrega.');
        return;
      }

      // Verificar se o usuário é o elaborador
      if (trabalho?.elaborador_id !== user.id) {
        alert('Apenas o elaborador designado pode fazer a entrega.');
        return;
      }

      setUploadProgress(50);

      // Criar registro de entrega (sem arquivos, apenas confirmação)
      const { data: entrega, error: entregaError } = await supabase
        .from('entregas')
        .insert({
          trabalho_id: trabalhoId,
          elaborador_id: user.id,
          arquivo_url: formData.trabalho_final_enviado ? 'confirmado' : '',
          relatorio_antiplagio_url: formData.antiplagio_enviado ? 'confirmado' : '',
          observacoes: JSON.stringify({
            antiplagio_enviado: formData.antiplagio_enviado,
            previa_enviada: formData.previa_enviada,
            trabalho_final_enviado: formData.trabalho_final_enviado,
          }),
        })
        .select()
        .single();

      if (entregaError) throw entregaError;

      setUploadProgress(80);

      // Atualizar status do trabalho para em_andamento se ainda não estiver
      if (trabalho?.status === 'aceito') {
        await supabase
          .from('trabalhos')
          .update({ status: 'em_andamento' })
          .eq('id', trabalhoId);
      }

      // Registrar atividade
      await supabase
        .from('atividades')
        .insert({
          trabalho_id: trabalhoId,
          usuario_id: user.id,
          tipo: 'entrega',
          descricao: `Entrega confirmada: ${trabalho?.titulo}`,
          metadata: formData,
        });

      // Criar notificação para o responsável
      if (trabalho?.responsavel_id) {
        await supabase
          .from('notificacoes')
          .insert({
            usuario_id: trabalho.responsavel_id,
            trabalho_id: trabalhoId,
            titulo: 'Entrega Confirmada',
            mensagem: `O elaborador confirmou a entrega do trabalho "${trabalho.titulo}"`,
          });
      }

      setUploadProgress(100);

      // Redirecionar após sucesso
      setTimeout(() => {
        router.push(`/trabalhos/${trabalhoId}`);
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao confirmar entrega:', error);
      alert('Erro ao confirmar entrega: ' + error.message);
      setUploadProgress(0);
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Entregar Trabalho</h1>
              <p className="text-gray-600">Faça a entrega do trabalho concluído</p>
            </div>

            {/* Informações do Trabalho */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Trabalho</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Título:</span> {trabalho.titulo}</p>
                <p><span className="font-medium">Prazo:</span> {formatDate(trabalho.prazo_entrega)}</p>
                <p><span className="font-medium">Tipo:</span> <span className="capitalize">{trabalho.tipo}</span></p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-6">
              <p className="text-gray-600 mb-4">
                Confirme que você enviou todos os itens necessários para a entrega:
              </p>

              {/* Checkbox Relatório Anti-Plágio */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.antiplagio_enviado}
                    onChange={(e) => setFormData({ ...formData, antiplagio_enviado: e.target.checked })}
                    className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      Relatório Anti-Plágio <span className="text-red-500">(Obrigatório)</span>
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Confirme que você enviou o relatório anti-plágio do trabalho. Este documento é obrigatório para todas as entregas e deve ser enviado junto com o trabalho final.
                    </p>
                  </div>
                </label>
              </div>

              {/* Checkbox Arquivo Prévia */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.previa_enviada}
                    onChange={(e) => setFormData({ ...formData, previa_enviada: e.target.checked })}
                    className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      Arquivo do Trabalho Prévia <span className="text-red-500">(Obrigatório)</span>
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Confirme que você enviou a prévia do trabalho. A prévia permite que o responsável revise o trabalho antes da versão final e solicite ajustes se necessário.
                    </p>
                  </div>
                </label>
              </div>

              {/* Checkbox Arquivo Final */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.trabalho_final_enviado}
                    onChange={(e) => setFormData({ ...formData, trabalho_final_enviado: e.target.checked })}
                    className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      Arquivo do Trabalho Final <span className="text-red-500">(Obrigatório)</span>
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Confirme que você enviou o arquivo final do trabalho. Este é o documento completo e finalizado que será entregue ao responsável após a aprovação.
                    </p>
                  </div>
                </label>
              </div>

              {/* Progress Bar */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Enviando arquivos...</span>
                    <span className="text-sm font-medium text-gray-900">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadProgress === 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={24} />
                  <div>
                    <p className="font-medium text-green-900">Entrega realizada com sucesso!</p>
                    <p className="text-sm text-green-700">Redirecionando...</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={submitting || !formData.antiplagio_enviado || !formData.trabalho_final_enviado || uploadProgress === 100}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirmar Entrega
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

