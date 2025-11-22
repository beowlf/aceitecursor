'use client';

import { Search, Bell, AlertCircle } from 'lucide-react';
import { getRoleLabel } from '@/lib/utils';
import { Profile } from '@/types/database';

interface HeaderProps {
  user?: Profile;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 ml-20">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-xl font-bold text-gray-900">ElaboraCRM</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-1">
          <a href="/dashboard" className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium">
            Visão Geral
          </a>
          <a href="/atividades" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 text-sm font-medium">
            Atividades
          </a>
          <a href="/gerenciar" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 text-sm font-medium">
            Gerenciar
          </a>
          <a href="/programa" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 text-sm font-medium">
            Programa
          </a>
          <a href="/conta" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 text-sm font-medium">
            Conta
          </a>
          <a href="/relatorios" className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 text-sm font-medium">
            Relatórios
          </a>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Search size={20} />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <AlertCircle size={20} />
        </button>
        
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
            </div>
            <button className="text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}






