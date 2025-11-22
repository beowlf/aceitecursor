'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { MessageSquare, Send, Search, Paperclip, Smile } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

export default function MensagensPage() {
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversa, setSelectedConversa] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadMensagens();
  }, []);

  async function loadMensagens() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUserId(user.id);

      // Carregar notificações como mensagens
      const { data: notificacoes, error } = await supabase
        .from('notificacoes')
        .select('*, trabalho:trabalhos(titulo)')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Agrupar por trabalho ou criar conversas
      const conversasMap = new Map();
      
      (notificacoes || []).forEach(notif => {
        const key = notif.trabalho_id || 'geral';
        if (!conversasMap.has(key)) {
          conversasMap.set(key, {
            id: key,
            nome: notif.trabalho?.titulo || 'Sistema',
            ultimaMensagem: notif.mensagem,
            data: notif.created_at,
            naoLidas: notif.lida ? 0 : 1,
            notificacoes: [notif],
          });
        } else {
          const conv = conversasMap.get(key);
          conv.notificacoes.push(notif);
          if (!notif.lida) conv.naoLidas++;
          if (new Date(notif.created_at) > new Date(conv.data)) {
            conv.ultimaMensagem = notif.mensagem;
            conv.data = notif.created_at;
          }
        }
      });

      setMensagens(Array.from(conversasMap.values()));
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(conversaId: string, message: string) {
    if (!message.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Criar notificação como mensagem
      const conversa = mensagens.find(m => m.id === conversaId);
      if (conversa && conversa.notificacoes.length > 0) {
        const primeiraNotif = conversa.notificacoes[0];
        // Encontrar o outro usuário (responsável ou elaborador do trabalho)
        const { data: trabalho } = await supabase
          .from('trabalhos')
          .select('responsavel_id, elaborador_id')
          .eq('id', primeiraNotif.trabalho_id)
          .single();

        if (trabalho) {
          const destinatarioId = trabalho.responsavel_id === user.id 
            ? trabalho.elaborador_id 
            : trabalho.responsavel_id;

          if (destinatarioId) {
            await supabase
              .from('notificacoes')
              .insert({
                usuario_id: destinatarioId,
                trabalho_id: primeiraNotif.trabalho_id,
                titulo: 'Nova Mensagem',
                mensagem: message,
              });
          }
        }
      }

      setNewMessage('');
      await loadMensagens();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-20">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mensagens</h1>
            <p className="text-gray-600">Comunique-se com sua equipe e clientes</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            <div className="lg:col-span-1">
              <div className="card h-full flex flex-col">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar conversas..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {mensagens.length === 0 && loading ? (
                    <p className="text-gray-500 text-sm text-center py-4">Carregando conversas...</p>
                  ) : mensagens.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Nenhuma conversa encontrada</p>
                  ) : (
                    mensagens.map((conversa) => (
                    <div
                      key={conversa.id}
                      onClick={() => setSelectedConversa(conversa.id)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedConversa === conversa.id
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                            {conversa.nome.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{conversa.nome}</h3>
                            <p className="text-sm text-gray-600 truncate max-w-[150px]">
                              {conversa.ultimaMensagem}
                            </p>
                          </div>
                        </div>
                        {conversa.naoLidas > 0 && (
                          <span className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                            {conversa.naoLidas}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 ml-13">
                        {formatDate(conversa.data)}
                      </p>
                    </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="card h-full flex flex-col">
                {selectedConversa ? (
                  <>
                    <div className="border-b border-gray-200 p-4 mb-4">
                      <h2 className="font-semibold text-gray-900">
                        {mensagens.find(c => c.id === selectedConversa)?.nome || 'Conversa'}
                      </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {mensagens.find(m => m.id === selectedConversa)?.notificacoes.map((notif: any) => {
                        const isOwn = notif.usuario_id === currentUserId;
                        
                        return (
                          <div
                            key={notif.id}
                            className={`flex items-start gap-3 ${isOwn ? 'justify-end' : ''}`}
                          >
                            {!isOwn && <div className="w-8 h-8 bg-gray-300 rounded-full"></div>}
                            <div className={`flex-1 ${isOwn ? 'flex justify-end' : ''}`}>
                              <div>
                                <div className={`rounded-lg p-3 ${
                                  isOwn 
                                    ? 'bg-primary-500 text-white' 
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  <p className="text-sm">{notif.mensagem}</p>
                                </div>
                                <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : ''}`}>
                                  {formatDate(notif.created_at)}
                                </p>
                              </div>
                            </div>
                            {isOwn && (
                              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {notif.titulo.charAt(0)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-gray-200 p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Paperclip size={20} />
                        </button>
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newMessage.trim() && selectedConversa) {
                              handleSendMessage(selectedConversa, newMessage);
                            }
                          }}
                        />
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Smile size={20} />
                        </button>
                        <button
                          onClick={() => {
                            if (selectedConversa && newMessage.trim()) {
                              handleSendMessage(selectedConversa, newMessage);
                            }
                          }}
                          disabled={!newMessage.trim() || !selectedConversa}
                          className="btn-primary p-2 disabled:opacity-50"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600">Selecione uma conversa para começar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

