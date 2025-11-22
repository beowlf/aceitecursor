'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        console.log('Usuário criado:', authData.user.id);
        
        // O trigger handle_new_user() deve criar o perfil automaticamente
        // Aguardar um pouco para garantir que o trigger seja executado
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Verificar se o perfil foi criado pelo trigger
        const { data: profile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id, name, role')
          .eq('id', authData.user.id)
          .single();

        console.log('Perfil verificado:', profile, profileCheckError);

        // Se o perfil não existe, criar via API route
        if (!profile) {
          console.log('Perfil não encontrado, criando via API...');
          try {
            const response = await fetch('/api/auth/create-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: authData.user.id,
                email: email,
                name: name,
              }),
            });

            const result = await response.json();
            console.log('Resposta da API:', result);

            if (!response.ok) {
              console.error('Erro ao criar perfil via API:', result);
            }
          } catch (apiError) {
            console.error('Erro ao chamar API de criação de perfil:', apiError);
          }
        }

        // Tentar fazer login
        console.log('Tentando fazer login...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('Erro no login:', signInError);
          // Se o login falhar porque o email não foi confirmado, informar o usuário
          if (signInError.message.includes('Email not confirmed') || signInError.message.includes('email_not_confirmed')) {
            throw new Error('Por favor, verifique seu email e confirme sua conta antes de fazer login. Se você não recebeu o email, verifique a pasta de spam. Você também pode desabilitar a confirmação de email nas configurações do Supabase.');
          }
          throw signInError;
        }

        console.log('Login bem-sucedido:', signInData.user?.id);

        // Aguardar um pouco antes de redirecionar para garantir que tudo está pronto
        await new Promise(resolve => setTimeout(resolve, 500));

        // Redirecionar para o dashboard usando window.location para garantir
        router.push('/dashboard');
        // Forçar reload completo da página para garantir que o estado de autenticação seja atualizado
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      } else {
        throw new Error('Usuário não foi criado. Tente novamente.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Criar Conta</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Seu nome completo"
              />
            </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Mínimo de 6 caracteres</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Já tem uma conta? <a href="/auth/login" className="text-primary-500 hover:underline">Entrar</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

