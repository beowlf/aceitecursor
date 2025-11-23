'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
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
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [relatorioAntiPlagio, setRelatorioAntiPlagio] = useState<File | null>(null);
  const [observacoes, setObservacoes] = useState('');
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
    
    if (!arquivo) {
      alert('Por favor, selecione o arquivo do trabalho.');
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

      setUploadProgress(20);

      // Upload do arquivo principal
      const arquivoUrl = await uploadFile(arquivo, `entregas/${trabalhoId}`);
      setUploadProgress(60);

      // Upload do relatório anti-plágio (se fornecido)
      let relatorioUrl: string | undefined;
      if (relatorioAntiPlagio) {
        relatorioUrl = await uploadFile(relatorioAntiPlagio, `relatorios/${trabalhoId}`);
      }
      setUploadProgress(80);

      // Criar registro de entrega
      const { data: entrega, error: entregaError } = await supabase
        .from('entregas')
        .insert({
          trabalho_id: trabalhoId,
          elaborador_id: user.id,
          arquivo_url: arquivoUrl,
          relatorio_antiplagio_url: relatorioUrl,
          observacoes: observacoes || null,
        })
        .select()
        .single();

      if (entregaError) throw entregaError;

      setUploadProgress(90);

      // Atualizar status do trabalho
      await supabase
        .from('trabalhos')
        .update({ status: 'concluido' })
        .eq('id', trabalhoId);

      // Registrar atividade
      await supabase
        .from('atividades')
        .insert({
          trabalho_id: trabalhoId,
          usuario_id: user.id,
          tipo: 'entrega',
          descricao: `Trabalho entregue: ${trabalho?.titulo}`,
          metadata: {
            arquivo_url: arquivoUrl,
            relatorio_url: relatorioUrl,
          },
        });

      // Criar notificação para o responsável
      if (trabalho?.responsavel_id) {
        await supabase
          .from('notificacoes')
          .insert({
            usuario_id: trabalho.responsavel_id,
            trabalho_id: trabalhoId,
            titulo: 'Nova Entrega',
            mensagem: `O trabalho "${trabalho.titulo}" foi entregue por ${user.email}`,
          });
      }

      setUploadProgress(100);

      // Redirecionar após sucesso
      setTimeout(() => {
        router.push(`/trabalhos/${trabalhoId}`);
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao fazer entrega:', error);
      alert('Erro ao fazer entrega: ' + error.message);
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
              {/* Upload Arquivo Principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo do Trabalho * <span className="text-red-500">(Obrigatório)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    id="arquivo"
                    accept=".pdf,.doc,.docx,.zip,.rar"
                    onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                    className="hidden"
                    required
                  />
                  <label htmlFor="arquivo" className="cursor-pointer">
                    {arquivo ? (
                      <div className="space-y-2">
                        <FileText className="mx-auto text-green-500" size={48} />
                        <p className="text-sm font-medium text-gray-900">{arquivo.name}</p>
                        <p className="text-xs text-gray-500">
                          {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto text-gray-400" size={48} />
                        <p className="text-sm text-gray-600">
                          Clique para selecionar ou arraste o arquivo aqui
                        </p>
                        <p className="text-xs text-gray-500">
                          Formatos aceitos: PDF, DOC, DOCX, ZIP, RAR
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Upload Relatório Anti-Plágio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relatório Anti-Plágio <span className="text-red-500">(Obrigatório)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    id="relatorio"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setRelatorioAntiPlagio(e.target.files?.[0] || null)}
                    className="hidden"
                    required
                  />
                  <label htmlFor="relatorio" className="cursor-pointer">
                    {relatorioAntiPlagio ? (
                      <div className="space-y-2">
                        <FileText className="mx-auto text-green-500" size={48} />
                        <p className="text-sm font-medium text-gray-900">{relatorioAntiPlagio.name}</p>
                        <p className="text-xs text-gray-500">
                          {(relatorioAntiPlagio.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto text-gray-400" size={48} />
                        <p className="text-sm text-gray-600">
                          Clique para selecionar o relatório anti-plágio
                        </p>
                        <p className="text-xs text-gray-500">
                          Formatos aceitos: PDF, DOC, DOCX
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  O relatório anti-plágio é obrigatório para todas as entregas.
                </p>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Adicione observações sobre a entrega (opcional)"
                />
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
                  disabled={submitting || !arquivo || !relatorioAntiPlagio || uploadProgress === 100}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Finalizar Entrega
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

