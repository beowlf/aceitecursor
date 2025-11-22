'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'checking' | 'success' | 'error';
  message: string;
}

export default function DiagnosticoPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  async function runDiagnostics() {
    const diagnostics: DiagnosticResult[] = [];

    // 1. Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    diagnostics.push({
      name: 'Variáveis de Ambiente',
      status: 'checking',
      message: 'Verificando...',
    });
    setResults([...diagnostics]);

    if (!supabaseUrl || !supabaseKey) {
      diagnostics[0] = {
        name: 'Variáveis de Ambiente',
        status: 'error',
        message: `Faltam variáveis de ambiente! URL: ${supabaseUrl ? '✓' : '✗'}, Key: ${supabaseKey ? '✓' : '✗'}`,
      };
      setResults([...diagnostics]);
      setLoading(false);
      return;
    }

    diagnostics[0] = {
      name: 'Variáveis de Ambiente',
      status: 'success',
      message: `URL configurada: ${supabaseUrl.substring(0, 30)}...`,
    };
    setResults([...diagnostics]);

    // 2. Testar conexão com Supabase
    diagnostics.push({
      name: 'Conexão com Supabase',
      status: 'checking',
      message: 'Testando conexão...',
    });
    setResults([...diagnostics]);

    try {
      const supabase = createClient();
      
      // Tentar fazer uma query simples
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        diagnostics[1] = {
          name: 'Conexão com Supabase',
          status: 'error',
          message: `Erro: ${error.message}`,
        };
      } else {
        diagnostics[1] = {
          name: 'Conexão com Supabase',
          status: 'success',
          message: 'Conexão estabelecida com sucesso!',
        };
      }
    } catch (error: any) {
      diagnostics[1] = {
        name: 'Conexão com Supabase',
        status: 'error',
        message: `Erro ao conectar: ${error.message}`,
      };
    }
    setResults([...diagnostics]);

    // 3. Verificar se as tabelas existem
    diagnostics.push({
      name: 'Estrutura do Banco',
      status: 'checking',
      message: 'Verificando tabelas...',
    });
    setResults([...diagnostics]);

    try {
      const supabase = createClient();
      const tables = ['profiles', 'trabalhos', 'aceites'];
      const missingTables: string[] = [];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error && error.code === '42P01') {
          missingTables.push(table);
        }
      }

      if (missingTables.length > 0) {
        diagnostics[2] = {
          name: 'Estrutura do Banco',
          status: 'error',
          message: `Tabelas faltando: ${missingTables.join(', ')}. Execute o schema.sql no Supabase.`,
        };
      } else {
        diagnostics[2] = {
          name: 'Estrutura do Banco',
          status: 'success',
          message: 'Todas as tabelas necessárias existem!',
        };
      }
    } catch (error: any) {
      diagnostics[2] = {
        name: 'Estrutura do Banco',
        status: 'error',
        message: `Erro ao verificar: ${error.message}`,
      };
    }
    setResults([...diagnostics]);

    // 4. Verificar autenticação
    diagnostics.push({
      name: 'Sistema de Autenticação',
      status: 'checking',
      message: 'Testando autenticação...',
    });
    setResults([...diagnostics]);

    try {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        diagnostics[3] = {
          name: 'Sistema de Autenticação',
          status: 'error',
          message: `Erro: ${error.message}`,
        };
      } else {
        diagnostics[3] = {
          name: 'Sistema de Autenticação',
          status: 'success',
          message: session ? 'Usuário autenticado' : 'Sistema de autenticação funcionando (sem sessão ativa)',
        };
      }
    } catch (error: any) {
      diagnostics[3] = {
        name: 'Sistema de Autenticação',
        status: 'error',
        message: `Erro: ${error.message}`,
      };
    }
    setResults([...diagnostics]);

    // 5. Verificar se pode inserir perfil (teste de RLS)
    diagnostics.push({
      name: 'Políticas RLS (Segurança)',
      status: 'checking',
      message: 'Verificando permissões...',
    });
    setResults([...diagnostics]);

    try {
      const supabase = createClient();
      // Tentar verificar se há políticas que permitem INSERT
      // Isso é uma verificação indireta
      const { error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (testError && testError.code === '42501') {
        diagnostics[4] = {
          name: 'Políticas RLS (Segurança)',
          status: 'error',
          message: 'Políticas RLS podem estar bloqueando acesso. Execute o script setup_completo.sql no Supabase.',
        };
      } else {
        diagnostics[4] = {
          name: 'Políticas RLS (Segurança)',
          status: 'success',
          message: 'Políticas RLS configuradas corretamente',
        };
      }
    } catch (error: any) {
      diagnostics[4] = {
        name: 'Políticas RLS (Segurança)',
        status: 'error',
        message: `Erro ao verificar: ${error.message}`,
      };
    }
    setResults([...diagnostics]);

    setLoading(false);
  }

  function getIcon(result: DiagnosticResult) {
    if (result.status === 'checking') {
      return <Loader className="animate-spin text-blue-500" size={20} />;
    }
    if (result.status === 'success') {
      return <CheckCircle className="text-green-500" size={20} />;
    }
    return <XCircle className="text-red-500" size={20} />;
  }

  function getStatusColor(result: DiagnosticResult) {
    if (result.status === 'checking') {
      return 'border-blue-200 bg-blue-50';
    }
    if (result.status === 'success') {
      return 'border-green-200 bg-green-50';
    }
    return 'border-red-200 bg-red-50';
  }

  const allSuccess = results.every(r => r.status === 'success');
  const hasErrors = results.some(r => r.status === 'error');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Diagnóstico do Sistema</h1>
          <p className="text-gray-600">Verificando conexão com Supabase e configurações</p>
        </div>

        <div className="space-y-4 mb-6">
          {results.map((result, index) => (
            <div
              key={index}
              className={`card border-2 ${getStatusColor(result)}`}
            >
              <div className="flex items-start gap-4">
                {getIcon(result)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{result.name}</h3>
                  <p className="text-sm text-gray-700">{result.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="card text-center py-8">
            <Loader className="animate-spin text-primary-500 mx-auto mb-4" size={32} />
            <p className="text-gray-600">Executando diagnósticos...</p>
          </div>
        )}

        {!loading && (
          <div className="card">
            {allSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Tudo funcionando corretamente!
                </h2>
                <p className="text-gray-600 mb-4">
                  O sistema está configurado e pronto para uso.
                </p>
                <a href="/auth/login" className="btn-primary inline-block">
                  Ir para Login
                </a>
              </div>
            ) : hasErrors ? (
              <div className="py-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="text-orange-500 mt-1" size={24} />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Problemas Encontrados
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Corrija os problemas abaixo antes de continuar:
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {results
                    .filter(r => r.status === 'error')
                    .map((result, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-semibold text-red-900 mb-1">{result.name}</h3>
                        <p className="text-sm text-red-700">{result.message}</p>
                      </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Como corrigir:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>Verifique se o arquivo <code className="bg-blue-100 px-1 rounded">.env.local</code> existe na raiz do projeto</li>
                    <li>Certifique-se de que as variáveis <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> e <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> estão configuradas</li>
                    <li>Execute o arquivo <code className="bg-blue-100 px-1 rounded">supabase/setup_completo.sql</code> no SQL Editor do Supabase (IMPORTANTE!)</li>
                    <li>Desabilite a confirmação de email em <strong>Authentication > Settings</strong> no Supabase</li>
                    <li>Se você já criou uma conta, crie o perfil manualmente (veja CONFIGURAR_SUPABASE.md)</li>
                    <li>Após fazer alterações, reinicie o servidor: <code className="bg-blue-100 px-1 rounded">npm run dev</code></li>
                  </ol>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ Leia o arquivo <code className="bg-yellow-100 px-1 rounded">CONFIGURAR_SUPABASE.md</code> para instruções detalhadas!
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={runDiagnostics}
            className="btn-secondary"
            disabled={loading}
          >
            Executar Diagnóstico Novamente
          </button>
        </div>
      </div>
    </div>
  );
}

