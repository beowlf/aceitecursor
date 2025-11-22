'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Mail, 
  FileText, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Trabalho } from '@/types/database';
import { formatDate } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Trabalhos', href: '/trabalhos' },
  { icon: Mail, label: 'Mensagens', href: '/mensagens' },
  { icon: FileText, label: 'Documentos', href: '/documentos' },
  { icon: Users, label: 'Equipe', href: '/equipe' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
  { icon: HelpCircle, label: 'Ajuda', href: '/ajuda' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [trabalhosEmAndamento, setTrabalhosEmAndamento] = useState<Trabalho[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrabalhosEmAndamento();
  }, []);

  async function loadTrabalhosEmAndamento() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      let query = supabase
        .from('trabalhos')
        .select('*, responsavel:profiles!trabalhos_responsavel_id_fkey(*), elaborador:profiles!trabalhos_elaborador_id_fkey(*)')
        .in('status', ['pendente', 'aceito', 'em_andamento', 'aguardando_correcao']);

      // Filtrar por role
      if (profile.role === 'elaborador') {
        query = query.eq('elaborador_id', user.id);
      } else if (profile.role === 'responsavel') {
        query = query.eq('responsavel_id', user.id);
      }
      // Admin vê todos

      const { data } = await query
        .order('prazo_entrega', { ascending: true })
        .limit(5);

      if (data) {
        setTrabalhosEmAndamento(data);
      }
    } catch (error) {
      console.error('Erro ao carregar trabalhos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  return (
    <aside className="w-80 bg-gray-100 h-screen fixed left-0 top-0 flex flex-col py-6 overflow-y-auto">
      <div className="mb-8 px-4">
        <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">E</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary-500 text-white" 
                  : "text-gray-600 hover:bg-gray-200"
              )}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Trabalhos em Andamento */}
      <div className="px-4 mt-6 border-t border-gray-300 pt-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Trabalhos em Andamento</h3>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : trabalhosEmAndamento.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">Nenhum trabalho em andamento</p>
        ) : (
          <div className="space-y-2">
            {trabalhosEmAndamento.map((trabalho) => {
              const prazoDate = new Date(trabalho.prazo_entrega);
              const isAtrasado = prazoDate < new Date() && trabalho.status !== 'concluido';
              const isCorrecao = trabalho.status === 'aguardando_correcao';
              
              return (
                <Link
                  key={trabalho.id}
                  href={`/trabalhos/${trabalho.id}`}
                  className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
                      {trabalho.titulo}
                    </p>
                    {isAtrasado && (
                      <AlertCircle className="text-red-500 flex-shrink-0 ml-2" size={16} />
                    )}
                    {isCorrecao && (
                      <Clock className="text-orange-500 flex-shrink-0 ml-2" size={16} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>
                      {isCorrecao ? 'Correção: ' : 'Entrega: '}
                      {formatDate(trabalho.prazo_entrega)}
                    </span>
                  </div>
                  {isAtrasado && (
                    <span className="inline-block mt-2 text-xs text-red-600 font-medium">
                      Atrasado
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="px-4 mt-6 border-t border-gray-300 pt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}






