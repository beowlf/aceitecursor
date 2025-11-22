import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('trabalhos')
      .select('*, responsavel:profiles!trabalhos_responsavel_id_fkey(*), elaborador:profiles!trabalhos_elaborador_id_fkey(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('trabalhos')
      .insert({
        ...body,
        responsavel_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Registrar atividade
    await supabase
      .from('atividades')
      .insert({
        trabalho_id: data.id,
        usuario_id: user.id,
        tipo: 'criacao',
        descricao: `Trabalho "${body.titulo}" criado`,
      });

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}






