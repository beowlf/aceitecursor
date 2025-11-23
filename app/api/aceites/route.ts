import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { trabalho_id, assinatura_digital } = body;

    if (!trabalho_id || !assinatura_digital) {
      return NextResponse.json(
        { error: 'trabalho_id e assinatura_digital são obrigatórios' },
        { status: 400 }
      );
    }

    // Obter IP do cliente (simplificado)
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || '';

    // Verificar se já existe aceite
    const { data: aceiteExistente } = await supabase
      .from('aceites')
      .select('id')
      .eq('trabalho_id', trabalho_id)
      .eq('elaborador_id', user.id)
      .single();

    let aceite;

    if (aceiteExistente) {
      const { data, error } = await supabase
        .from('aceites')
        .update({
          assinatura_digital,
          assinado_em: new Date().toISOString(),
          aceito_em: new Date().toISOString(),
          status: 'aceito',
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .eq('id', aceiteExistente.id)
        .select()
        .single();

      if (error) throw error;
      aceite = data;
    } else {
      const { data, error } = await supabase
        .from('aceites')
        .insert({
          trabalho_id,
          elaborador_id: user.id,
          termos_lidos: true,
          termos_lido_em: new Date().toISOString(),
          assinatura_digital,
          assinado_em: new Date().toISOString(),
          aceito_em: new Date().toISOString(),
          status: 'aceito',
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select()
        .single();

      if (error) throw error;
      aceite = data;
    }

    // Atualizar status do trabalho
    await supabase
      .from('trabalhos')
      .update({ 
        status: 'aceito',
        elaborador_id: user.id,
      })
      .eq('id', trabalho_id);

    // Verificar se o usuário é responsável ou elaborador
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const descricaoAtividade = profile?.role === 'responsavel' 
      ? 'Trabalho aceito pelo Responsável'
      : 'Trabalho aceito pelo elaborador';

    // Registrar atividade
    await supabase
      .from('atividades')
      .insert({
        trabalho_id,
        usuario_id: user.id,
        tipo: 'aceite',
        descricao: descricaoAtividade,
        ip_address: ipAddress,
        metadata: { assinatura_digital },
      });

    return NextResponse.json(aceite, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}






