'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { HelpCircle, Book, MessageSquare, Video, FileText, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function AjudaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      pergunta: 'Como criar um novo trabalho?',
      resposta: 'Para criar um novo trabalho, acesse a página de Trabalhos e clique no botão "Novo Trabalho". Preencha todas as informações necessárias e salve.',
    },
    {
      id: '2',
      pergunta: 'Como aceitar um trabalho?',
      resposta: 'Quando um trabalho é atribuído a você, você receberá uma notificação. Acesse a página de Trabalhos e clique no botão "Aceitar" no trabalho pendente.',
    },
    {
      id: '3',
      pergunta: 'Como fazer upload de documentos?',
      resposta: 'Na página de Documentos, clique no botão "Upload Documento" e selecione o arquivo que deseja enviar. Certifique-se de que o arquivo está no formato correto.',
    },
    {
      id: '4',
      pergunta: 'Como alterar minha senha?',
      resposta: 'Acesse a página de Conta, vá até a seção de Segurança e clique em "Alterar Senha". Siga as instruções na tela.',
    },
    {
      id: '5',
      pergunta: 'Como entrar em contato com o suporte?',
      resposta: 'Você pode entrar em contato com o suporte através da página de Mensagens ou enviando um email para suporte@elaboracrm.com.br',
    },
  ];

  const categorias = [
    { icon: Book, title: 'Documentação', description: 'Guia completo do sistema', color: 'blue' },
    { icon: Video, title: 'Vídeos Tutoriais', description: 'Aprenda com vídeos', color: 'purple' },
    { icon: MessageSquare, title: 'Suporte', description: 'Fale com nossa equipe', color: 'green' },
    { icon: FileText, title: 'FAQ', description: 'Perguntas frequentes', color: 'orange' },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.pergunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.resposta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-20">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Central de Ajuda</h1>
            <p className="text-gray-600">Encontre respostas para suas dúvidas</p>
          </div>

          <div className="card mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar ajuda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {categorias.map((categoria, index) => {
              const Icon = categoria.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                purple: 'bg-purple-100 text-purple-600',
                green: 'bg-green-100 text-green-600',
                orange: 'bg-orange-100 text-orange-600',
              };
              return (
                <div key={index} className="card hover:shadow-md transition-shadow cursor-pointer">
                  <div className={`w-12 h-12 ${colorClasses[categoria.color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{categoria.title}</h3>
                  <p className="text-sm text-gray-600">{categoria.description}</p>
                </div>
              );
            })}
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="text-primary-500" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Perguntas Frequentes</h2>
            </div>
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.pergunta}</span>
                    {openFaq === faq.id ? (
                      <ChevronUp className="text-gray-400" size={20} />
                    ) : (
                      <ChevronDown className="text-gray-400" size={20} />
                    )}
                  </button>
                  {openFaq === faq.id && (
                    <div className="p-4 pt-0 border-t border-gray-200">
                      <p className="text-gray-600">{faq.resposta}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card mt-6 bg-primary-50 border-primary-200">
            <div className="flex items-center gap-4">
              <MessageSquare className="text-primary-600" size={32} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Ainda precisa de ajuda?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Nossa equipe de suporte está pronta para ajudar você.
                </p>
                <button className="btn-primary text-sm">Entrar em Contato</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

