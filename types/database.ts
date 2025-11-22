export type UserRole = 'admin' | 'responsavel' | 'elaborador';
export type TrabalhoTipo = 'tcc' | 'artigo' | 'mestrado' | 'doutorado' | 'monografia' | 'outro';
export type TrabalhoStatus = 'pendente' | 'aceito' | 'em_andamento' | 'aguardando_correcao' | 'corrigido' | 'concluido' | 'cancelado';
export type AceiteStatus = 'pendente' | 'lido' | 'assinado' | 'aceito';
export type AtividadeTipo = 'criacao' | 'aceite' | 'entrega' | 'correcao' | 'cancelamento' | 'atualizacao';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Trabalho {
  id: string;
  responsavel_id: string;
  elaborador_id?: string;
  titulo: string;
  tipo: TrabalhoTipo;
  descricao?: string;
  link_original?: string;
  feito_do_zero: boolean;
  tem_correcoes_obrigatorias: boolean;
  prazo_entrega: string;
  status: TrabalhoStatus;
  termos: string;
  created_at: string;
  updated_at: string;
  responsavel?: Profile;
  elaborador?: Profile;
}

export interface Aceite {
  id: string;
  trabalho_id: string;
  elaborador_id: string;
  status: AceiteStatus;
  termos_lidos: boolean;
  termos_lido_em?: string;
  assinatura_digital?: string;
  assinado_em?: string;
  ip_address?: string;
  user_agent?: string;
  aceito_em?: string;
  created_at: string;
  updated_at: string;
  trabalho?: Trabalho;
  elaborador?: Profile;
}

export interface Entrega {
  id: string;
  trabalho_id: string;
  elaborador_id: string;
  arquivo_url: string;
  relatorio_antiplagio_url?: string;
  observacoes?: string;
  entregue_em: string;
  created_at: string;
}

export interface Correcao {
  id: string;
  trabalho_id: string;
  entrega_id?: string;
  responsavel_id: string;
  elaborador_id: string;
  descricao: string;
  arquivo_referencia_url?: string;
  prazo_correcao: string;
  status: TrabalhoStatus;
  aceite_obrigatorio: boolean;
  aceite_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Atividade {
  id: string;
  trabalho_id?: string;
  usuario_id: string;
  tipo: AtividadeTipo;
  descricao: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at: string;
  usuario?: Profile;
}

export interface Notificacao {
  id: string;
  usuario_id: string;
  trabalho_id?: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  lida_em?: string;
  created_at: string;
}






