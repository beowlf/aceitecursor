'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verificar se as variáveis de ambiente estão configuradas
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          'Configuração do Supabase não encontrada. Verifique o arquivo .env.local. ' +
          'Acesse /diagnostico para verificar a configuração.'
        );
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Erro de autenticação:', authError);
        
        // Mensagens de erro mais amigáveis
        if (authError.message.includes('Invalid login credentials') || authError.message.includes('invalid_credentials')) {
          throw new Error('Email ou senha incorretos. Verifique suas credenciais.');
        } else if (authError.message.includes('Email not confirmed') || authError.message.includes('email_not_confirmed')) {
          throw new Error('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
        } else if (authError.message.includes('fetch')) {
          throw new Error(
            'Erro de conexão com o Supabase. Verifique se a URL e a chave estão corretas no arquivo .env.local. ' +
            'Acesse /diagnostico para verificar a conexão.'
          );
        } else {
          throw new Error(`Erro ao fazer login: ${authError.message}`);
        }
      }

      if (data.user) {
        // Login bem-sucedido
        console.log('Login bem-sucedido:', data.user.id);
        
        // Buscar perfil do usuário para determinar o role e redirecionar corretamente
        try {
          // Aguardar um pouco para garantir que a sessão está estabelecida
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile) {
            // Perfil existe - redirecionar baseado no role
            if (profile.role === 'responsavel') {
              window.location.href = '/dashboard/responsavel';
            } else if (profile.role === 'elaborador') {
              window.location.href = '/dashboard/elaborador';
            } else if (profile.role === 'admin') {
              window.location.href = '/dashboard/admin';
            } else {
              // Role desconhecido - ir para dashboard geral
              window.location.href = '/dashboard';
            }
          } else {
            // Perfil não existe - tentar criar
            try {
              const { error: createError } = await supabase.rpc('create_user_profile', {
                p_user_id: data.user.id,
                p_email: data.user.email || email,
                p_name: data.user.user_metadata?.name || email.split('@')[0] || 'Usuário',
              });

              if (createError) {
                // Se RPC falhar, tentar inserção direta
                const { error: insertError } = await supabase.from('profiles').insert({
                  id: data.user.id,
                  email: data.user.email || email,
                  name: data.user.user_metadata?.name || email.split('@')[0] || 'Usuário',
                  role: 'elaborador', // Role padrão
                });

                if (insertError) {
                  console.warn('Não foi possível criar perfil:', insertError);
                  // Mesmo assim, redirecionar para dashboard
                  window.location.href = '/dashboard';
                } else {
                  // Perfil criado - redirecionar para dashboard do elaborador (padrão)
                  window.location.href = '/dashboard/elaborador';
                }
              } else {
                // Perfil criado via RPC - buscar novamente para obter o role
                const { data: newProfile } = await supabase
                  .from('profiles')
                  .select('role')
                  .eq('id', data.user.id)
                  .single();
                
                if (newProfile?.role === 'responsavel') {
                  window.location.href = '/dashboard/responsavel';
                } else if (newProfile?.role === 'elaborador') {
                  window.location.href = '/dashboard/elaborador';
                } else if (newProfile?.role === 'admin') {
                  window.location.href = '/dashboard/admin';
                } else {
                  window.location.href = '/dashboard';
                }
              }
            } catch (createErr) {
              console.error('Erro ao criar perfil:', createErr);
              // Mesmo com erro, redirecionar para dashboard
              window.location.href = '/dashboard';
            }
          }
        } catch (err) {
          console.error('Erro ao buscar perfil:', err);
          // Em caso de erro, redirecionar para dashboard geral
          window.location.href = '/dashboard';
        }
      }
    } catch (err: any) {
      console.error('Erro completo no login:', err);
      setError(err.message || 'Erro ao fazer login. Tente novamente ou acesse /diagnostico para verificar a configuração.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ElaboraCRM</h1>
          <p className="text-gray-600">Sistema de Gestão de Trabalhos Acadêmicos</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Entrar</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-500 mt-0.5" size={18} />
                <div className="flex-1">
                  <p className="text-red-700 text-sm font-medium mb-1">Erro ao fazer login</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
              {error.includes('Supabase') && (
                <a 
                  href="/diagnostico" 
                  className="mt-3 inline-block text-sm text-red-700 underline hover:text-red-800"
                >
                  Verificar conexão com Supabase
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Não tem uma conta? <a href="/auth/register" className="text-primary-500 hover:underline">Cadastre-se</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}


