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
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  roles?: ('admin' | 'responsavel' | 'elaborador')[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Trabalhos', href: '/trabalhos' },
  { icon: Mail, label: 'Mensagens', href: '/mensagens' },
  { icon: Activity, label: 'Atividades', href: '/atividades', roles: ['admin', 'responsavel'] },
  { icon: Users, label: 'Equipe', href: '/equipe', roles: ['admin', 'responsavel'] },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
  { icon: HelpCircle, label: 'Ajuda', href: '/ajuda' },
  // Documentos removido - não está claro o propósito
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userRole, setUserRole] = useState<'admin' | 'responsavel' | 'elaborador' | null>(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  async function loadUserRole() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }
    } catch (error) {
      console.error('Erro ao carregar role do usuário:', error);
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

  // Filtrar itens do menu baseado no role
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true; // Sem restrição de role
    if (!userRole) return false; // Se não tem role, não mostra
    return item.roles.includes(userRole);
  });

  return (
    <aside className="w-80 bg-gray-100 h-screen fixed left-0 top-0 flex flex-col py-6 overflow-y-auto z-40">
      <div className="mb-8 px-4">
        <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">E</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2 px-4">
        {filteredMenuItems.map((item) => {
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
