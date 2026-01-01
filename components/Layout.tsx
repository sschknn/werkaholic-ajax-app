import React, { useState } from 'react';
import { Home, ScanLine, History, Settings, Moon, Sun, Menu, X, LogOut, Crown, Download, BarChart3, Store, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AdView, Button } from './ui';
import { VIEWS, ViewType } from '../utils/constants';
import { useDownloads } from '../hooks/useDownloads';
import { useNotifications } from '../contexts/NotificationContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  analysisResults: any[]; // Add analysis results for download buttons
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange, analysisResults }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addNotification } = useNotifications();
  const { downloadBulkReport, downloadKleinanzeigenZIP } = useDownloads({ addNotification });
  const isDark = theme === 'dark';

  // For demo, assume logged in users are Pro
  const isProUser = !!user;

  // Close sidebar on mobile when clicking outside
  const handleOverlayClick = () => setSidebarOpen(false);

  // Keyboard navigation for sidebar
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const navigation = [
    { id: VIEWS.DASHBOARD, name: 'Dashboard', icon: Home },
    { id: VIEWS.SCANNER, name: 'Scanner', icon: ScanLine },
    { id: VIEWS.BATCH, name: 'Batch', icon: Layers },
    { id: VIEWS.MARKETPLACE, name: 'Marktplatz', icon: Store },
    { id: VIEWS.HISTORY, name: 'Verlauf', icon: History },
    { id: VIEWS.COMPARISON, name: 'Vergleich', icon: BarChart3 },
    { id: VIEWS.SETTINGS, name: 'Einstellungen', icon: Settings },
  ];

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 w-72 sm:w-80 transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0 lg:w-64 lg:flex-shrink-0 lg:shadow-none
          ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
          border-r backdrop-blur-sm lg:backdrop-blur-none
        `}
        aria-label="Hauptnavigation"
        role="navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-slate-700 dark:border-slate-600">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white dark:text-white">Werkaholic AI</span>
            </div>
          </div>

          {/* Navigation */}
           <nav className="flex-1 px-4 py-6 space-y-2" role="menubar" aria-label="Hauptnavigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setSidebarOpen(false);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, () => {
                    onViewChange(item.id);
                    setSidebarOpen(false);
                  })}
                  className={`
                    group w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800
                    ${currentView === item.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-102 hover:shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:scale-102 hover:shadow-md'
                    }
                  `}
                  aria-current={currentView === item.id ? 'page' : undefined}
                  role="menuitem"
                >
                  <Icon className={`w-5 h-5 mr-3 transition-transform duration-200 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-105'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-slate-700 dark:border-slate-600 space-y-2">
            <button
              onClick={toggleTheme}
              className={`
                w-full flex items-center px-4 py-2 rounded-lg transition-colors
                ${isDark
                  ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }
              `}
            >
              {isDark ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
              {isDark ? 'Hell' : 'Dunkel'}
            </button>

            <button
              onClick={async () => {
                try {
                  await logout();
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
              className={`
                w-full flex items-center px-4 py-2 rounded-lg transition-colors
                ${isDark
                  ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }
              `}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Abmelden
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className={`
          sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 border-b backdrop-blur-md bg-opacity-95
          ${isDark ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'}
          lg:px-6 lg:h-16 shadow-sm
        `}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            title="Menü öffnen"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
            aria-label="Hauptmenü öffnen"
            type="button"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Crown className={`w-4 h-4 sm:w-5 sm:h-5 ${isProUser ? 'text-yellow-500' : 'text-slate-400'}`} />
              <span className="text-xs sm:text-sm font-medium text-slate-300 hidden sm:inline">
                {isProUser ? 'Pro Plan' : 'Free Plan'}
              </span>
            </div>
            {isProUser && analysisResults.length > 0 && (
              <div className="hidden sm:flex items-center space-x-1">
                <Button
                  onClick={() => downloadBulkReport(analysisResults)}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700"
                  aria-label="PDF-Bericht herunterladen"
                >
                  <Download className="w-3 h-3 mr-1" />
                  PDF
                </Button>
                <Button
                  onClick={() => downloadKleinanzeigenZIP(analysisResults)}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700"
                  aria-label="Kleinanzeigen-ZIP herunterladen"
                >
                  <Download className="w-3 h-3 mr-1" />
                  ZIP
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto pb-20 lg:pb-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-40 safe-area-bottom">
          <div className="flex items-center justify-around px-2 py-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1 ${isActive
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  aria-label={item.name}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Ads for Free users */}
        {!isProUser && (
          <div className="p-3 sm:p-4 lg:p-6 border-t border-slate-200 dark:border-slate-700">
            <AdView
              slot="1234567890"
              format="horizontal"
              className="w-full max-w-4xl mx-auto"
            />
          </div>
        )}
      </div>
    </div >
  );
};