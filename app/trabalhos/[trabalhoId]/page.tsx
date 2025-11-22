'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { 
  FileText, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Download,
  Upload,
  MessageSquare,
  History,
  ExternalLink,
  Edit
} from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Trabalho, Aceite, Entrega, Correcao, Atividade, Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

export default function TrabalhoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const trabalhoId = params.trabalhoId as string;
  
  const [trabalho, setTrabalho] = useState<Trabalho | null>(null);
  const [aceite, setAceite] = useState<Aceite | null>(null);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [correcoes, setCorrecoes] = useState<Correcao[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [trabalhoId]);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Carregar perfil do usuário atual
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setCurrentUser(profileData);
      }

      // Carregar trabalho
      const { data: trabalhoData, error: trabalhoError } = await supabase
        .from('trabalhos')
        .select('*, responsavel:profiles!trabalhos_responsavel_id_fkey(*), elaborador:profiles!trabalhos_elaborador_id_fkey(*)')
        .eq('id', trabalhoId)
        .single();

      if (trabalhoError) throw trabalhoError;
      setTrabalho(trabalhoData);

      // Carregar aceite
      const { data: aceiteData } = await supabase
        .from('aceites')
        .select('*, elaborador:profiles!aceites_elaborador_id_fkey(*)')
        .eq('trabalho_id', trabalhoId)
        .single();

      if (aceiteData) {
        setAceite(aceiteData);
      }

      // Carregar entregas
      const { data: entregasData } = await supabase
        .from('entregas')
        .select('*')
        .eq('trabalho_id', trabalhoId)
        .order('entregue_em', { ascending: false });

      if (entregasData) {
        setEntregas(entregasData);
      }

      // Carregar correções
      const { data: correcoesData } = await supabase
        .from('correcoes')
        .select('*')
        .eq('trabalho_id', trabalhoId)
        .order('created_at', { ascending: false });

      if (correcoesData) {
        setCorrecoes(correcoesData);
      }

      // Carregar atividades
      const { data: atividadesData } = await supabase
        .from('atividades')
        .select('*, usuario:profiles!atividades_usuario_id_fkey(*)')
        .eq('trabalho_id', trabalhoId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (atividadesData) {
        setAtividades(atividadesData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-80">
          <Header />
          <main className="p-6">
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando detalhes do trabalho...</p>
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
        <div className="flex-1 ml-80">
          <Header />
          <main className="p-6">
            <div className="card text-center py-12">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <p className="text-gray-600 mb-4">Trabalho não encontrado</p>
              <Link href="/trabalhos" className="btn-secondary">
                Voltar para Trabalhos
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isResponsavel = currentUser?.id === trabalho.responsavel_id;
  const isElaborador = currentUser?.id === trabalho.elaborador_id;
  const canEdit = isResponsavel || currentUser?.role === 'admin';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-80">
        <Header />
        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href="/trabalhos" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={18} />
              Voltar para Trabalhos
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{trabalho.titulo}</h1>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trabalho.status)}`}>
                    {trabalho.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-600">
                    Criado em {formatDate(trabalho.created_at)}
                  </span>
                </div>
              </div>
              {canEdit && (
                <button className="btn-secondary flex items-center gap-2">
                  <Edit size={18} />
                  Editar
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informações do Trabalho */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Trabalho</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <FileText className="text-primary-500 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Tipo</p>
                        <p className="font-medium text-gray-900 capitalize">{trabalho.tipo}</p>
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
                        <p className="font-medium text-gray-900">{trabalho.responsavel?.name || 'N/A'}</p>
                      </div>
                    </div>
                    {trabalho.elaborador && (
                      <div className="flex items-start gap-3">
                        <User className="text-primary-500 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-600">Elaborador</p>
                          <p className="font-medium text-gray-900">{trabalho.elaborador.name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {trabalho.descricao && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Descrição</p>
                      <p className="text-gray-900 whitespace-pre-line">{trabalho.descricao}</p>
                    </div>
                  )}

                  {trabalho.link_original && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Link Original</p>
                      <a 
                        href={trabalho.link_original} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-600 flex items-center gap-2"
                      >
                        {trabalho.link_original}
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Feito do Zero</p>
                      <p className="font-medium text-gray-900">
                        {trabalho.feito_do_zero ? 'Sim' : 'Não'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Correções Obrigatórias</p>
                      <p className="font-medium text-gray-900">
                        {trabalho.tem_correcoes_obrigatorias ? 'Sim' : 'Não'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Termos */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Termos e Condições</h2>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-line text-sm">{trabalho.termos}</p>
                </div>
              </div>

              {/* Status do Aceite */}
              {aceite && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Status do Aceite</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Termos Lidos</span>
                      {aceite.termos_lidos ? (
                        <span className="flex items-center gap-2 text-green-600">
                          <CheckCircle size={16} />
                          {aceite.termos_lido_em && formatDate(aceite.termos_lido_em)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Não lido</span>
                      )}
                    </div>
                    {aceite.assinatura_digital && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Assinatura Digital</span>
                        <span className="flex items-center gap-2 text-green-600">
                          <CheckCircle size={16} />
                          {aceite.assinado_em && formatDate(aceite.assinado_em)}
                        </span>
                      </div>
                    )}
                    {aceite.aceito_em && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Aceito em</span>
                        <span className="flex items-center gap-2 text-green-600">
                          <CheckCircle size={16} />
                          {formatDate(aceite.aceito_em)}
                        </span>
                      </div>
                    )}
                    {aceite.ip_address && (
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-xs text-gray-500">IP de Registro</span>
                        <span className="text-xs text-gray-500">{aceite.ip_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Entregas */}
              {entregas.length > 0 && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Entregas</h2>
                  <div className="space-y-4">
                    {entregas.map((entrega) => (
                      <div key={entrega.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              Entrega em {formatDate(entrega.entregue_em)}
                            </p>
                            {entrega.observacoes && (
                              <p className="text-sm text-gray-600 mt-1">{entrega.observacoes}</p>
                            )}
                          </div>
                          <a 
                            href={entrega.arquivo_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-secondary text-sm flex items-center gap-2"
                          >
                            <Download size={16} />
                            Download
                          </a>
                        </div>
                        {entrega.relatorio_antiplagio_url && (
                          <a 
                            href={entrega.relatorio_antiplagio_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-2"
                          >
                            Relatório Antiplágio
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Correções */}
              {correcoes.length > 0 && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Correções Solicitadas</h2>
                  <div className="space-y-4">
                    {correcoes.map((correcao) => (
                      <div key={correcao.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">Correção</p>
                            <p className="text-sm text-gray-600 mt-1">{correcao.descricao}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Prazo: {formatDate(correcao.prazo_correcao)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(correcao.status)}`}>
                            {correcao.status.replace('_', ' ')}
                          </span>
                        </div>
                        {correcao.arquivo_referencia_url && (
                          <a 
                            href={correcao.arquivo_referencia_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-2 mt-2"
                          >
                            Arquivo de Referência
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Histórico de Atividades */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <History size={20} />
                  Histórico de Atividades
                </h2>
                {atividades.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhuma atividade registrada</p>
                ) : (
                  <div className="space-y-3">
                    {atividades.map((atividade) => (
                      <div key={atividade.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{atividade.descricao}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {atividade.usuario?.name || 'Usuário'}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {formatDate(atividade.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Ações Rápidas */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações</h2>
                <div className="space-y-2">
                  {trabalho.status === 'pendente' && isElaborador && !aceite && (
                    <Link
                      href={`/aceite/${trabalho.id}`}
                      className="btn-orange w-full flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Aceitar Trabalho
                    </Link>
                  )}
                  {trabalho.status === 'aceito' && isElaborador && (
                    <Link
                      href={`/trabalhos/${trabalho.id}/entregar`}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Upload size={18} />
                      Fazer Entrega
                    </Link>
                  )}
                  {(trabalho.status === 'em_andamento' || trabalho.status === 'aguardando_correcao') && isElaborador && (
                    <Link
                      href={`/trabalhos/${trabalho.id}/entregar`}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Upload size={18} />
                      Fazer Entrega
                    </Link>
                  )}
                  {isResponsavel && entregas.length > 0 && (
                    <Link
                      href={`/trabalhos/${trabalho.id}/correcao`}
                      className="btn-secondary w-full flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={18} />
                      Solicitar Correção
                    </Link>
                  )}
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">ID do Trabalho</p>
                    <p className="font-mono text-xs text-gray-500 mt-1 break-all">{trabalho.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Última Atualização</p>
                    <p className="text-gray-900 mt-1">{formatDate(trabalho.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


