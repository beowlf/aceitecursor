'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, FileText, Calendar, User, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Trabalho, Aceite } from '@/types/database';

export const dynamic = 'force-dynamic';

export default function AceitePage() {
  const params = useParams();
  const router = useRouter();
  const trabalhoId = params.trabalhoId as string;
  
  const [trabalho, setTrabalho] = useState<Trabalho | null>(null);
  const [aceite, setAceite] = useState<Aceite | null>(null);
  const [loading, setLoading] = useState(true);
  const [aceitando, setAceitando] = useState(false);
  
  const [termosLidos, setTermosLidos] = useState(false);
  const [assinatura, setAssinatura] = useState('');
  const [aceiteConfirmado, setAceiteConfirmado] = useState(false);

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

      // Carregar aceite existente
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: aceiteData } = await supabase
          .from('aceites')
          .select('*')
          .eq('trabalho_id', trabalhoId)
          .eq('elaborador_id', user.id)
          .single();

        if (aceiteData) {
          setAceite(aceiteData);
          setTermosLidos(aceiteData.termos_lidos);
          setAssinatura(aceiteData.assinatura_digital || '');
          setAceiteConfirmado(aceiteData.status === 'aceito');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
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
      .single();

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
        .single();

      if (aceiteExistente) {
        await supabase
          .from('aceites')
          .update({
            assinatura_digital: assinatura,
            assinado_em: new Date().toISOString(),
            aceito_em: new Date().toISOString(),
            status: 'aceito',
            ip_address: ipAddress,
            user_agent: userAgent,
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
            assinatura_digital: assinatura,
            assinado_em: new Date().toISOString(),
            aceito_em: new Date().toISOString(),
            status: 'aceito',
            ip_address: ipAddress,
            user_agent: userAgent,
          });
      }

      // Atualizar status do trabalho
      await supabase
        .from('trabalhos')
        .update({ status: 'aceito' })
        .eq('id', trabalhoId);

      // Registrar atividade
      await supabase
        .from('atividades')
        .insert({
          trabalho_id: trabalhoId,
          usuario_id: user.id,
          tipo: 'aceite',
          descricao: 'Trabalho aceito pelo elaborador',
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!trabalho) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <p className="text-gray-600">Trabalho não encontrado</p>
        </div>
      </div>
    );
  }

  if (aceiteConfirmado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Aceite Confirmado!</h2>
          <p className="text-gray-600 mb-4">
            Você aceitou o trabalho com sucesso. Redirecionando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="font-medium text-gray-900 capitalize">{trabalho.tipo}</p>
              </div>
            </div>
          </div>
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
    </div>
  );
}






