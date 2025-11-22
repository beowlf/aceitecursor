'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Activity, Database, CheckCircle, XCircle, RefreshCw, AlertCircle, Terminal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

interface HealthCheck {
  supabase: 'checking' | 'ok' | 'error';
  database: 'checking' | 'ok' | 'error';
  auth: 'checking' | 'ok' | 'error';
}

interface ErrorLog {
  id: string;
  timestamp: Date;
  message: string;
  stack?: string;
  type: 'error' | 'warning' | 'info';
}

export default function DebugPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [health, setHealth] = useState<HealthCheck>({
    supabase: 'checking',
    database: 'checking',
    auth: 'checking',
  });
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadUser();
    performHealthChecks();
    setupErrorListener();
  }, []);

  async function loadUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser(profile);
        if (profile.role !== 'admin') {
          addErrorLog('Acesso negado: apenas administradores podem acessar esta página', 'error');
        }
      }
    } catch (error: any) {
      addErrorLog(`Erro ao carregar usuário: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function performHealthChecks() {
    // Check Supabase Connection
    setHealth(prev => ({ ...prev, supabase: 'checking' }));
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      setHealth(prev => ({ ...prev, supabase: 'ok' }));
    } catch (error: any) {
      setHealth(prev => ({ ...prev, supabase: 'error' }));
      addErrorLog(`Erro na conexão Supabase: ${error.message}`, 'error');
    }

    // Check Database
    setHealth(prev => ({ ...prev, database: 'checking' }));
    try {
      const { data, error } = await supabase.from('trabalhos').select('count').limit(1);
      if (error) throw error;
      setHealth(prev => ({ ...prev, database: 'ok' }));
    } catch (error: any) {
      setHealth(prev => ({ ...prev, database: 'error' }));
      addErrorLog(`Erro ao acessar banco de dados: ${error.message}`, 'error');
    }

    // Check Auth
    setHealth(prev => ({ ...prev, auth: 'checking' }));
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setHealth(prev => ({ ...prev, auth: session ? 'ok' : 'error' }));
    } catch (error: any) {
      setHealth(prev => ({ ...prev, auth: 'error' }));
      addErrorLog(`Erro na autenticação: ${error.message}`, 'error');
    }
  }

  function setupErrorListener() {
    const originalError = window.console.error;
    const originalWarn = window.console.warn;

    window.console.error = (...args: any[]) => {
      originalError(...args);
      addErrorLog(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '), 'error');
    };

    window.console.warn = (...args: any[]) => {
      originalWarn(...args);
      addErrorLog(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '), 'warning');
    };

    window.addEventListener('error', (event) => {
      addErrorLog(`${event.message} at ${event.filename}:${event.lineno}`, 'error', event.error?.stack);
    });

    window.addEventListener('unhandledrejection', (event) => {
      addErrorLog(`Unhandled Promise Rejection: ${event.reason}`, 'error');
    });
  }

  function addErrorLog(message: string, type: 'error' | 'warning' | 'info' = 'error', stack?: string) {
    setErrorLogs(prev => [
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        message,
        stack,
        type,
      },
      ...prev.slice(0, 49), // Manter apenas os últimos 50
    ]);
  }

  async function testSupabaseConnection() {
    setTestResults(prev => ({ ...prev, supabase: 'Testing...' }));
    try {
      const start = Date.now();
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      const duration = Date.now() - start;
      
      if (error) throw error;
      setTestResults(prev => ({ ...prev, supabase: `OK - ${duration}ms` }));
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, supabase: `ERROR: ${error.message}` }));
    }
  }

  async function testTable(table: string) {
    setTestResults(prev => ({ ...prev, [table]: 'Testing...' }));
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(5);
      
      if (error) throw error;
      setTestResults(prev => ({ ...prev, [table]: `OK - ${count || data?.length || 0} registros` }));
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, [table]: `ERROR: ${error.message}` }));
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
              <p className="text-gray-600">Carregando...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-80">
          <Header />
          <main className="p-6">
            <div className="card text-center py-12">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
              <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-80">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug & Health Check</h1>
            <p className="text-gray-600">Monitoramento e diagnóstico do sistema</p>
          </div>

          {/* Health Check */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Supabase</h3>
                {health.supabase === 'ok' ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : health.supabase === 'error' ? (
                  <XCircle className="text-red-500" size={24} />
                ) : (
                  <RefreshCw className="text-gray-400 animate-spin" size={24} />
                )}
              </div>
              <p className="text-sm text-gray-600">
                {health.supabase === 'ok' ? 'Conectado' : health.supabase === 'error' ? 'Erro na conexão' : 'Verificando...'}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Database</h3>
                {health.database === 'ok' ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : health.database === 'error' ? (
                  <XCircle className="text-red-500" size={24} />
                ) : (
                  <RefreshCw className="text-gray-400 animate-spin" size={24} />
                )}
              </div>
              <p className="text-sm text-gray-600">
                {health.database === 'ok' ? 'Acessível' : health.database === 'error' ? 'Erro no acesso' : 'Verificando...'}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Autenticação</h3>
                {health.auth === 'ok' ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : health.auth === 'error' ? (
                  <XCircle className="text-red-500" size={24} />
                ) : (
                  <RefreshCw className="text-gray-400 animate-spin" size={24} />
                )}
              </div>
              <p className="text-sm text-gray-600">
                {health.auth === 'ok' ? 'Ativa' : health.auth === 'error' ? 'Erro' : 'Verificando...'}
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Usuário</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="font-mono text-sm text-gray-900">{user?.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="text-sm text-gray-900">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Função</p>
                <p className="text-sm text-gray-900">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Environment Info */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Ambiente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Ambiente</p>
                <p className="text-sm text-gray-900">{process.env.NODE_ENV || 'development'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Supabase URL</p>
                <p className="font-mono text-xs text-gray-900 break-all">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurado' : 'Não configurado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Supabase Key</p>
                <p className="text-sm text-gray-900">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Versão</p>
                <p className="text-sm text-gray-900">1.0.0</p>
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Testes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={testSupabaseConnection}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Database size={18} />
                Testar Supabase
              </button>
              <button
                onClick={() => testTable('profiles')}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Activity size={18} />
                Testar Profiles
              </button>
              <button
                onClick={() => testTable('trabalhos')}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Activity size={18} />
                Testar Trabalhos
              </button>
              <button
                onClick={() => testTable('aceites')}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Activity size={18} />
                Testar Aceites
              </button>
            </div>
            {Object.keys(testResults).length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Resultados:</h3>
                {Object.entries(testResults).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium text-gray-700">{key}:</span>{' '}
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Logs */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Logs de Erro</h2>
              <button
                onClick={() => setErrorLogs([])}
                className="btn-secondary text-sm"
              >
                Limpar Logs
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {errorLogs.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum erro registrado</p>
              ) : (
                errorLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border ${
                      log.type === 'error'
                        ? 'bg-red-50 border-red-200'
                        : log.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          log.type === 'error'
                            ? 'bg-red-200 text-red-800'
                            : log.type === 'warning'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {log.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-mono">{log.message}</p>
                    {log.stack && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer">Stack trace</summary>
                        <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{log.stack}</pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

