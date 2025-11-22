import { createBrowserClient } from '@supabase/ssr';

// Cliente mock para quando as variáveis não estão disponíveis
const createMockClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    getSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Supabase not configured' } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please check your environment variables.' } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please check your environment variables.' } }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({
    select: () => ({ 
      eq: () => ({ 
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }), 
        maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        order: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      }),
      order: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    }),
    insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }),
  }),
  rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      download: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
}) as any;

export function createClient() {
  // Tentar obter as variáveis de ambiente
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 
              (typeof window !== 'undefined' ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_URL : undefined);
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
              (typeof window !== 'undefined' ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined);

  if (!url || !key) {
    // Log apenas no console, não quebrar a aplicação
    if (typeof window !== 'undefined') {
      console.warn('⚠️ Supabase environment variables not found. Some features may not work.');
      console.warn('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
    }
    // Retornar cliente mock em vez de lançar erro
    return createMockClient();
  }

  try {
    return createBrowserClient(url, key);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return createMockClient();
  }
}






