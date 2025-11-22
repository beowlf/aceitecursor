'use client';

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
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

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
    <aside className="w-20 bg-gray-100 h-screen fixed left-0 top-0 flex flex-col items-center py-6">
      <div className="mb-8">
        <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">E</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-lg transition-colors",
                isActive 
                  ? "bg-primary-500 text-white" 
                  : "text-gray-600 hover:bg-gray-200"
              )}
              title={item.label}
            >
              <Icon size={20} />
            </Link>
          );
        })}
      </nav>
      
      <button
        onClick={handleLogout}
        className="w-12 h-12 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
        title="Sair"
      >
        <LogOut size={20} />
      </button>
    </aside>
  );
}






