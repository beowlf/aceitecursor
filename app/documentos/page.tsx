'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { FileText, Upload, Download, Search, Folder, File, MoreVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadDocumentos();
  }, []);

  async function loadDocumentos() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar entregas (que contêm os documentos)
      const { data: entregas, error } = await supabase
        .from('entregas')
        .select('*, trabalho:trabalhos(titulo)')
        .order('entregue_em', { ascending: false });

      if (error) throw error;

      // Transformar entregas em documentos
      const docs = (entregas || []).flatMap(entrega => {
        const docs: any[] = [];
        
        if (entrega.arquivo_url) {
          docs.push({
            id: `${entrega.id}-arquivo`,
            nome: `Arquivo - ${entrega.trabalho?.titulo || 'Trabalho'}`,
            tipo: entrega.arquivo_url.split('.').pop() || 'file',
            url: entrega.arquivo_url,
            data: entrega.entregue_em,
            trabalho: entrega.trabalho?.titulo || 'N/A',
            entrega_id: entrega.id,
          });
        }

        if (entrega.relatorio_antiplagio_url) {
          docs.push({
            id: `${entrega.id}-relatorio`,
            nome: `Relatório Anti-Plágio - ${entrega.trabalho?.titulo || 'Trabalho'}`,
            tipo: entrega.relatorio_antiplagio_url.split('.').pop() || 'file',
            url: entrega.relatorio_antiplagio_url,
            data: entrega.entregue_em,
            trabalho: entrega.trabalho?.titulo || 'N/A',
            entrega_id: entrega.id,
          });
        }

        return docs;
      });

      setDocumentos(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDocumentos = documentos.filter(doc =>
    doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.trabalho.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'pdf':
        return <FileText className="text-red-500" size={24} />;
      case 'docx':
        return <FileText className="text-blue-500" size={24} />;
      default:
        return <File className="text-gray-500" size={24} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-80">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentos</h1>
              <p className="text-gray-600">Gerencie todos os documentos dos trabalhos</p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Upload size={20} />
              Upload Documento
            </button>
          </div>

          <div className="card mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando documentos...</p>
            </div>
          ) : filteredDocumentos.length === 0 ? (
            <div className="card text-center py-12">
              <Folder className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Nenhum documento encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocumentos.map((documento) => (
                <div key={documento.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(documento.tipo)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{documento.nome}</h3>
                        <p className="text-sm text-gray-600">{documento.trabalho}</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span className="capitalize">{documento.tipo}</span>
                    <span>{formatDate(documento.data)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={documento.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </a>
                    <a
                      href={documento.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm"
                    >
                      Visualizar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

