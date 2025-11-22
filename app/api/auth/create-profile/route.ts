import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, email, name } = body;

    // Verificar se o userId corresponde ao usuário autenticado
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Verificar se o perfil já existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return NextResponse.json({ message: 'Perfil já existe', profile: existingProfile });
    }

    // Criar o perfil usando a função RPC que tem privilégios elevados
    const { data, error } = await supabase.rpc('create_user_profile', {
      p_user_id: userId,
      p_email: email,
      p_name: name,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Perfil criado com sucesso', profile: data });
  } catch (error: any) {
    console.error('Erro ao criar perfil:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar perfil' },
      { status: 500 }
    );
  }
}

