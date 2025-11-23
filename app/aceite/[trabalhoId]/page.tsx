'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, FileText, Calendar, User, AlertCircle, ExternalLink, XCircle, Shield, FileCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Trabalho, Aceite } from '@/types/database';
import Sidebar from '@/components/layout/Sidebar';
import TrabalhosSidebar from '@/components/layout/TrabalhosSidebar';
import Header from '@/components/layout/Header';
import { useSidebar } from '@/contexts/SidebarContext';

export const dynamic = 'force-dynamic';

export default function AceitePage() {
  const { trabalhosSidebarOpen } = useSidebar();
  const params = useParams();
  const router = useRouter();
  const trabalhoId = params.trabalhoId as string;
  
  const [trabalho, setTrabalho] = useState<Trabalho | null>(null);
  const [aceite, setAceite] = useState<Aceite | null>(null);
  const [loading, setLoading] = useState(true);
  const [aceitando, setAceitando] = useState(false);
  const [recusando, setRecusando] = useState(false);
  
  const [termosLidos, setTermosLidos] = useState(false);
  const [assinatura, setAssinatura] = useState('');
  const [aceiteConfirmado, setAceiteConfirmado] = useState(false);
  const [aceitaAntiPlagio, setAceitaAntiPlagio] = useState(false);
  const [aceitaCorrecoes, setAceitaCorrecoes] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [linkOriginal, setLinkOriginal] = useState('');
  const [mostrarFormLink, setMostrarFormLink] = useState(false);
  const [mostrarFormRecusa, setMostrarFormRecusa] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [trabalhoId]);

  async function loadData() {
    try {
      // Carregar trabalho
      const { data: trabalhoData, error: trabalhoError } = await supabase
        .from('trabalhos')
        .select('*, responsavel:profiles!trabalhos_responsavel_id_fkey(*), elaborador:profiles!trabalhos_elaborador_id_fkey(*)')
        .eq('id', trabalhoId)
        .single();

      if (trabalhoError) throw trabalhoError;
      setTrabalho(trabalhoData);
      setLinkOriginal(trabalhoData.link_original || '');

      // Carregar aceite existente
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: aceiteData } = await supabase
          .from('aceites')
          .select('*')
          .eq('trabalho_id', trabalhoId)
          .eq('elaborador_id', user.id)
          .maybeSingle();

        if (aceiteData) {
          setAceite(aceiteData);
          setTermosLidos(aceiteData.termos_lidos);
          setAssinatura(aceiteData.assinatura_digital || '');
          setAceiteConfirmado(aceiteData.status === 'aceito');
          setAceitaAntiPlagio(aceiteData.aceita_antiplagio || false);
          setAceitaCorrecoes(aceiteData.aceita_correcoes || false);
          setMotivoRecusa(aceiteData.motivo_recusa || '');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvarLink() {
    if (!trabalhoId || !linkOriginal.trim()) return;
    
    try {
      const { error } = await supabase
        .from('trabalhos')
        .update({ link_original: linkOriginal })
        .eq('id', trabalhoId);

      if (error) throw error;
      setMostrarFormLink(false);
      if (trabalho) {
        setTrabalho({ ...trabalho, link_original: linkOriginal });
      }
    } catch (error) {
      console.error('Erro ao salvar link:', error);
      alert('Erro ao salvar link. Tente novamente.');
    }
  }

  async function handleMarcarLido() {
    if (!trabalhoId) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setTermosLidos(true);

    // Atualizar ou criar aceite
    const { data: aceiteExistente } = await supabase
      .from('aceites')
      .select('id')
      .eq('trabalho_id', trabalhoId)
      .eq('elaborador_id', user.id)
      .maybeSingle();

    if (aceiteExistente) {
      await supabase
        .from('aceites')
        .update({
          termos_lidos: true,
          termos_lido_em: new Date().toISOString(),
          status: 'lido',
        })
        .eq('id', aceiteExistente.id);
    } else {
      await supabase
        .from('aceites')
        .insert({
          trabalho_id: trabalhoId,
          elaborador_id: user.id,
          termos_lidos: true,
          termos_lido_em: new Date().toISOString(),
          status: 'lido',
        });
    }
  }

  async function handleAceitar() {
    if (!termosLidos || !assinatura.trim()) {
      alert('Por favor, leia os termos e forneça uma assinatura digital.');
      return;
    }

    if (!trabalhoId) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setAceitando(true);

    try {
      // Obter IP e User Agent (simplificado)
      const ipAddress = '0.0.0.0'; // Em produção, obter do servidor
      const userAgent = navigator.userAgent;

      // Atualizar aceite
      const { data: aceiteExistente } = await supabase
        .from('aceites')
        .select('id')
        .eq('trabalho_id', trabalhoId)
        .eq('elaborador_id', user.id)
        .maybeSingle();

      const aceiteData = {
        assinatura_digital: assinatura,
        assinado_em: new Date().toISOString(),
        aceito_em: new Date().toISOString(),
        status: 'aceito' as const,
        ip_address: ipAddress,
        user_agent: userAgent,
        aceita_antiplagio: aceitaAntiPlagio,
        aceita_correcoes: aceitaCorrecoes,
        motivo_recusa: null,
      };

      if (aceiteExistente) {
        await supabase
          .from('aceites')
          .update(aceiteData)
          .eq('id', aceiteExistente.id);
      } else {
        await supabase
          .from('aceites')
          .insert({
            trabalho_id: trabalhoId,
            elaborador_id: user.id,
            termos_lidos: true,
            termos_lido_em: new Date().toISOString(),
            ...aceiteData,
          });
      }

      // Atualizar status do trabalho
      await supabase
        .from('trabalhos')
        .update({ status: 'aceito' })
        .eq('id', trabalhoId);

      // Verificar se o usuário é responsável ou elaborador
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const descricaoAtividade = profile?.role === 'responsavel' 
        ? 'Trabalho aceito pelo Responsável'
        : 'Trabalho aceito pelo elaborador';

      // Registrar atividade
      await supabase
        .from('atividades')
        .insert({
          trabalho_id: trabalhoId,
          usuario_id: user.id,
          tipo: 'aceite',
          descricao: descricaoAtividade,
          ip_address: ipAddress,
        });

      setAceiteConfirmado(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/trabalhos');
      }, 2000);
    } catch (error) {
      console.error('Erro ao aceitar trabalho:', error);
      alert('Erro ao processar aceite. Tente novamente.');
    } finally {
      setAceitando(false);
    }
  }

  async function handleRecusar() {
    if (!motivoRecusa.trim()) {
      alert('Por favor, informe o motivo da recusa.');
      return;
    }

    if (!trabalhoId) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setRecusando(true);

    try {
      const { data: aceiteExistente } = await supabase
        .from('aceites')
        .select('id')
        .eq('trabalho_id', trabalhoId)
        .eq('elaborador_id', user.id)
        .maybeSingle();

      if (aceiteExistente) {
        await supabase
          .from('aceites')
          .update({
            motivo_recusa: motivoRecusa,
            status: 'pendente',
          })
          .eq('id', aceiteExistente.id);
      } else {
        await supabase
          .from('aceites')
          .insert({
            trabalho_id: trabalhoId,
            elaborador_id: user.id,
            motivo_recusa: motivoRecusa,
            status: 'pendente',
          });
      }

      // Registrar atividade
      await supabase
        .from('atividades')
        .insert({
          trabalho_id: trabalhoId,
          usuario_id: user.id,
          tipo: 'atualizacao',
          descricao: `Trabalho recusado. Motivo: ${motivoRecusa}`,
        });

      // Criar notificação para o responsável
      if (trabalho?.responsavel_id) {
        await supabase
          .from('notificacoes')
          .insert({
            usuario_id: trabalho.responsavel_id,
            trabalho_id: trabalhoId,
            titulo: 'Trabalho Recusado',
            mensagem: `O elaborador recusou o trabalho "${trabalho.titulo}". Motivo: ${motivoRecusa}`,
          });
      }

      alert('Trabalho recusado. O responsável foi notificado.');
      router.push('/trabalhos');
    } catch (error) {
      console.error('Erro ao recusar trabalho:', error);
      alert('Erro ao processar recusa. Tente novamente.');
    } finally {
      setRecusando(false);
      setMostrarFormRecusa(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <TrabalhosSidebar />
        <div className={`flex-1 ml-80 transition-all duration-300 ${trabalhosSidebarOpen ? 'mr-80' : ''}`}>
          <Header />
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trabalho) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <TrabalhosSidebar />
        <div className={`flex-1 ml-80 transition-all duration-300 ${trabalhosSidebarOpen ? 'mr-80' : ''}`}>
          <Header />
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="text-center">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <p className="text-gray-600">Trabalho não encontrado</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (aceiteConfirmado) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <TrabalhosSidebar />
        <div className={`flex-1 ml-80 transition-all duration-300 ${trabalhosSidebarOpen ? 'mr-80' : ''}`}>
          <Header />
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="card max-w-md text-center">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Aceite Confirmado!</h2>
              <p className="text-gray-600 mb-4">
                Você aceitou o trabalho com sucesso. Redirecionando...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      tcc: 'TCC',
      artigo: 'Artigo',
      mestrado: 'Mestrado',
      doutorado: 'Doutorado',
      monografia: 'Monografia',
      outro: 'Outro',
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <TrabalhosSidebar />
      <div className={`flex-1 ml-80 transition-all duration-300 ${trabalhosSidebarOpen ? 'mr-80' : ''}`}>
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Termo de Aceite do Trabalho</h1>
              <p className="text-gray-600">
                Leia atentamente os termos antes de aceitar e iniciar o trabalho
              </p>
            </div>

            {/* Trabalho Card */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Trabalho</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <FileText className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Título</p>
                    <p className="font-medium text-gray-900">{trabalho.titulo}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Prazo de Entrega</p>
                    <p className="font-medium text-gray-900">{formatDate(trabalho.prazo_entrega)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Responsável</p>
                    <p className="font-medium text-gray-900">
                      {trabalho.responsavel?.name || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Tipo</p>
                    <p className="font-medium text-gray-900">{getTipoLabel(trabalho.tipo)}</p>
                  </div>
                </div>
              </div>

              {/* Informações adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tipo de Trabalho</p>
                  <div className="flex items-center gap-2">
                    {trabalho.feito_do_zero ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        Feito do Zero
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        Revisão
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Correções</p>
                  <div className="flex items-center gap-2">
                    {trabalho.tem_correcoes_obrigatorias ? (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        Correções Obrigatórias
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        Sem Correções Obrigatórias
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Link Original */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Link do Trabalho</p>
                {trabalho.link_original ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={trabalho.link_original}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 underline"
                    >
                      <ExternalLink size={16} />
                      Acessar o link do trabalho
                    </a>
                  </div>
                ) : (
                  <div>
                    {mostrarFormLink ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={linkOriginal}
                          onChange={(e) => setLinkOriginal(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                          onClick={handleSalvarLink}
                          className="btn-primary px-4 py-2"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setMostrarFormLink(false);
                            setLinkOriginal(trabalho.link_original || '');
                          }}
                          className="btn-secondary px-4 py-2"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMostrarFormLink(true)}
                        className="text-primary-600 hover:text-primary-700 text-sm underline"
                      >
                        + Adicionar link do arquivo original
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Observações do Responsável */}
              {trabalho.observacoes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Observações do Responsável</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{trabalho.observacoes}</p>
                  </div>
                </div>
              )}

              {/* Descrição */}
              {trabalho.descricao && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Descrição</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{trabalho.descricao}</p>
                </div>
              )}
            </div>

            {/* Termos */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Termos e Condições</h2>
              <div className="bg-gray-50 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{trabalho.termos}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-6">
                <input
                  type="checkbox"
                  id="termos-lidos"
                  checked={termosLidos}
                  onChange={(e) => {
                    setTermosLidos(e.target.checked);
                    if (e.target.checked) {
                      handleMarcarLido();
                    }
                  }}
                  className="mt-1 w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="termos-lidos" className="text-sm text-gray-700">
                  <span className="font-medium">Confirmo que li e compreendi todos os termos acima.</span>
                  <br />
                  <span className="text-gray-500">
                    {termosLidos && aceite?.termos_lido_em && (
                      <>Lido em: {formatDate(aceite.termos_lido_em)}</>
                    )}
                  </span>
                </label>
              </div>
            </div>

            {/* Checkboxes de Aceite */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Compromissos</h2>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aceitaAntiPlagio}
                    onChange={(e) => setAceitaAntiPlagio(e.target.checked)}
                    className="mt-1 w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900 flex items-center gap-2">
                      <Shield size={16} className="text-primary-500" />
                      Aceito entregar com relatório anti-plágio obrigatório
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Comprometo-me a incluir um relatório de verificação de plágio junto com a entrega final.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aceitaCorrecoes}
                    onChange={(e) => setAceitaCorrecoes(e.target.checked)}
                    className="mt-1 w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900 flex items-center gap-2">
                      <FileCheck size={16} className="text-primary-500" />
                      Aceito fazer correções se necessário
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Comprometo-me a realizar as correções solicitadas pelo responsável, se houver necessidade.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Assinatura Digital */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assinatura Digital</h2>
              <p className="text-sm text-gray-600 mb-4">
                Digite seu nome completo para assinar digitalmente este termo de aceite.
              </p>
              <input
                type="text"
                value={assinatura}
                onChange={(e) => setAssinatura(e.target.value)}
                placeholder="Digite seu nome completo"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={!termosLidos}
              />
              {aceite?.assinado_em && (
                <p className="text-xs text-gray-500 mt-2">
                  Assinado em: {formatDate(aceite.assinado_em)}
                </p>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="space-y-4">
              {/* Botão de Aceite */}
              <div className="card bg-primary-50 border-primary-200">
                <button
                  onClick={handleAceitar}
                  disabled={!termosLidos || !assinatura.trim() || aceitando}
                  className="w-full bg-primary-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {aceitando ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={24} />
                      Aceitar e Iniciar o Trabalho
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-600 text-center mt-3">
                  Ao aceitar, você concorda com todos os termos e condições acima.
                </p>
              </div>

              {/* Formulário de Recusa */}
              {mostrarFormRecusa ? (
                <div className="card bg-red-50 border-red-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recusar Trabalho</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Informe o motivo da recusa. O responsável será notificado para que possa resolver a questão.
                  </p>
                  <textarea
                    value={motivoRecusa}
                    onChange={(e) => setMotivoRecusa(e.target.value)}
                    placeholder="Ex: Faltou material necessário, informações insuficientes, prazo muito curto, etc."
                    rows={4}
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRecusar}
                      disabled={!motivoRecusa.trim() || recusando}
                      className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {recusando ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          <XCircle size={20} />
                          Confirmar Recusa
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setMostrarFormRecusa(false);
                        setMotivoRecusa('');
                      }}
                      className="btn-secondary px-6 py-3"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card bg-red-50 border-red-200">
                  <button
                    onClick={() => setMostrarFormRecusa(true)}
                    disabled={recusando}
                    className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Recusar Trabalho
                  </button>
                  <p className="text-xs text-gray-600 text-center mt-2">
                    O responsável será notificado do motivo da recusa.
                  </p>
                </div>
              )}
            </div>

            {/* Registro de Aceite (se já aceito) */}
            {aceite?.aceito_em && (
              <div className="card mt-6 bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-green-900">Aceite Registrado</p>
                    <p className="text-sm text-green-700">
                      Aceito em: {formatDate(aceite.aceito_em)}
                    </p>
                    {aceite.ip_address && (
                      <p className="text-xs text-green-600 mt-1">
                        IP: {aceite.ip_address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
