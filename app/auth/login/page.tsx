'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Mensagens de erro mais amigáveis
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        } else if (authError.message.includes('Email not confirmed')) {
          throw new Error('Por favor, confirme seu email antes de fazer login');
        } else {
          throw authError;
        }
      }

      if (data.user) {
        // Verificar se o perfil existe, se não existir, criar
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Perfil não existe, criar um
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || email,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
              role: 'elaborador',
            });

          if (createError) {
            console.error('Erro ao criar perfil:', createError);
            // Continuar mesmo assim, o trigger pode criar depois
          }
        }

        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
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


