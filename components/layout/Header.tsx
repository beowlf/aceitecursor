'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Calendar, ListTodo, ChevronDown, User, Settings } from 'lucide-react';
import { getRoleLabel, cn } from '@/lib/utils';
import { Profile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { useSidebar } from '@/contexts/SidebarContext';

interface HeaderProps {
  user?: Profile;
}

export default function Header({ user: userProp }: HeaderProps) {
  const [user, setUser] = useState<Profile | null>(userProp || null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();
  const { trabalhosSidebarOpen, toggleTrabalhosSidebar } = useSidebar();

  useEffect(() => {
    if (!userProp) {
      loadUser();
    }
  }, [userProp]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  async function loadUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário no Header:', error);
    }
  }

  // Definir itens do menu baseado no role
  const getHeaderMenuItems = () => {
    if (!user) return [];
    
    const allItems = [
      { href: '/dashboard', label: 'Visão Geral', roles: ['admin', 'responsavel', 'elaborador'] },
      { href: '/trabalhos', label: 'Trabalhos', roles: ['admin', 'responsavel', 'elaborador'] },
      { href: '/atividades', label: 'Atividades', roles: ['admin', 'responsavel'] },
      { href: '/gerenciar', label: 'Gerenciar', roles: ['admin'] },
      { href: '/relatorios', label: 'Relatórios', roles: ['admin', 'responsavel', 'elaborador'] },
    ];

    // Filtrar itens baseado no role do usuário
    return allItems.filter(item => item.roles.includes(user.role));
  };

  const headerMenuItems = getHeaderMenuItems();

  return (
    <header className={`bg-white border-b border-gray-200 h-20 flex items-center justify-between px-6 ml-80 transition-all duration-300 ${trabalhosSidebarOpen ? 'mr-80' : ''}`}>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-xl font-bold text-gray-900">ElaboraCRM</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-1">
          {headerMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Buscar">
          <Search size={20} />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative transition-colors" title="Notificações">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <Link 
          href="/programa" 
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
          title="Calendário"
        >
          <Calendar size={20} />
        </Link>
        <button
          onClick={toggleTrabalhosSidebar}
          className={`p-2 rounded-lg transition-colors ${
            trabalhosSidebarOpen
              ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={trabalhosSidebarOpen ? 'Ocultar trabalhos em andamento' : 'Mostrar trabalhos em andamento'}
        >
          <ListTodo size={20} />
        </button>
        
        {user && (
          <div className="relative user-menu-container">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  href="/conta"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User size={16} />
                  <span>Minha Conta</span>
                </Link>
                <Link
                  href="/configuracoes"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings size={16} />
                  <span>Configurações</span>
                </Link>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="px-4 py-2">
                  <p className="text-xs text-gray-500 mb-1">Logado como</p>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
