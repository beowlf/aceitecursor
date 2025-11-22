'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Settings, Bell, Shield, Palette, Globe, Database, Save } from 'lucide-react';

export default function ConfiguracoesPage() {
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

  const handleSave = () => {
    // Implementar salvamento
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-20">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
            <p className="text-gray-600">Personalize suas preferências do sistema</p>
          </div>

          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="text-primary-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Notificações</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Notificações por Email</p>
                    <p className="text-sm text-gray-600">Receba notificações importantes por email</p>
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
                    <p className="font-medium text-gray-900">Notificações Push</p>
                    <p className="text-sm text-gray-600">Receba notificações no navegador</p>
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
                    <p className="font-medium text-gray-900">Notificações SMS</p>
                    <p className="text-sm text-gray-600">Receba notificações por SMS</p>
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

            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="text-primary-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Aparência</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, theme: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                  <select
                    value={settings.appearance.language}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, language: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="text-primary-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Segurança</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Autenticação de Dois Fatores</p>
                    <p className="text-sm text-gray-600">Adicione uma camada extra de segurança</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="5"
                    max="120"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Database className="text-primary-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Sistema</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Versão do Sistema</p>
                  <p className="font-medium text-gray-900">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Última Atualização</p>
                  <p className="font-medium text-gray-900">17 de Abril de 2026</p>
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

