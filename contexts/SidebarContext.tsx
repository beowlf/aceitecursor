'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  trabalhosSidebarOpen: boolean;
  toggleTrabalhosSidebar: () => void;
  setTrabalhosSidebarOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [trabalhosSidebarOpen, setTrabalhosSidebarOpenState] = useState(true);

  // Carregar preferência do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trabalhosSidebarOpen');
      if (saved !== null) {
        setTrabalhosSidebarOpenState(saved === 'true');
      }
    }
  }, []);

  // Salvar preferência no localStorage
  const setTrabalhosSidebarOpen = (open: boolean) => {
    setTrabalhosSidebarOpenState(open);
    if (typeof window !== 'undefined') {
      localStorage.setItem('trabalhosSidebarOpen', String(open));
    }
  };

  const toggleTrabalhosSidebar = () => {
    setTrabalhosSidebarOpen(!trabalhosSidebarOpen);
  };

  return (
    <SidebarContext.Provider
      value={{
        trabalhosSidebarOpen,
        toggleTrabalhosSidebar,
        setTrabalhosSidebarOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

