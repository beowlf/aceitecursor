'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TrabalhosSidebar from '@/components/layout/TrabalhosSidebar';
import Header from '@/components/layout/Header';
import { Settings, Bell, Shield, Palette, Globe, Database, Save, Sun, Moon } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';

export default function ConfiguracoesPage() {
  const { trabalhosSidebarOpen } = useSidebar();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    appearance: {
      theme: 'light',
      language: 'pt-BR',
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
    },
  });

  useEffect(() => {
    // Carregar tema do localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setSettings(prev => ({
        ...prev,
        appearance: { ...prev.appearance, theme: savedTheme }
      }));
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleThemeChange = (theme: string) => {
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, theme }
    }));
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  };

  const handleSave = () => {
    // Salvar todas as configurações
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <TrabalhosSidebar />
      <div className={`flex-1 ml-80 transition-all duration-300 ${trabalhosSidebarOpen ? 'mr-80' : ''}`}>
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Configurações</h1>
            <p className="text-gray-600 dark:text-gray-400">Personalize suas preferências do sistema</p>
          </div>

          <div className="space-y-6">
            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="text-primary-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notificações</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Notificações por Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receba notificações importantes por email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, email: e.target.checked },
                      })
                    }
                    className="toggle"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Notificações Push</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receba notificações no navegador</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, push: e.target.checked },
                      })
                    }
                    className="toggle"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Notificações SMS</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receba notificações por SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, sms: e.target.checked },
                      })
                    }
                    className="toggle"
                  />
                </label>
              </div>
            </div>

            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="text-primary-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Aparência</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tema</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                        settings.appearance.theme === 'light'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Sun size={24} className={settings.appearance.theme === 'light' ? 'text-primary-500' : 'text-gray-400'} />
                      <span className={`text-sm font-medium ${settings.appearance.theme === 'light' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        Claro
                      </span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                        settings.appearance.theme === 'dark'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Moon size={24} className={settings.appearance.theme === 'dark' ? 'text-primary-500' : 'text-gray-400'} />
                      <span className={`text-sm font-medium ${settings.appearance.theme === 'dark' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        Escuro
                      </span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('auto')}
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                        settings.appearance.theme === 'auto'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      </div>
                      <span className={`text-sm font-medium ${settings.appearance.theme === 'auto' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        Automático
                      </span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Idioma</label>
                  <select
                    value={settings.appearance.language}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, language: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="text-primary-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Segurança</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Autenticação de Dois Fatores</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Adicione uma camada extra de segurança</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, twoFactor: e.target.checked },
                      })
                    }
                    className="toggle"
                  />
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tempo de Sessão (minutos)
                  </label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: parseInt(e.target.value) },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    min="5"
                    max="120"
                  />
                </div>
              </div>
            </div>

            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Database className="text-primary-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sistema</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Versão do Sistema</p>
                  <p className="font-medium text-gray-900 dark:text-white">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Última Atualização</p>
                  <p className="font-medium text-gray-900 dark:text-white">17 de Abril de 2026</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save size={18} />
                Salvar Configurações
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
