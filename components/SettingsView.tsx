import React, { useState, useCallback } from 'react';
import { Sparkles, Eye, Star, CreditCard, Zap, Users, Shield, TrendingUp, Globe, Lock, Download, Bell, Palette, HelpCircle, FileText, Database, User, Settings, Moon, Key, Trash2, Store, Crown, BarChart3, Copy, Activity, Plus, Cookie, Bug, Webhook, AlertTriangle, Cog, Mail, Sun, Monitor, Upload } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Tabs } from './ui';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { setLanguage, getLanguage } from '../utils/i18n';
import { UsageStats } from './UsageStats';

interface SettingsViewProps {
  onFeedbackClick: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onFeedbackClick }) => {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const { subscription } = useSubscription();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoScan: true,
    exportFormat: 'pdf',
    dataRetention: '1year',
    pushNotifications: true,
    scanNotifications: true,
    weeklyReports: false,
    privacyMode: false,
    dataSharing: false,
    inAppNotifications: true,
    cookieAnalytics: true,
    cookieMarketing: false,
    cookieFunctional: true,
    debugMode: false,
    apiKeys: [] as string[],
    integrations: [] as string[],
    googleDriveIntegration: false,
    slackIntegration: false,
    webhookIntegration: false,
    zapierIntegration: false,
  });

  const handleSettingChange = useCallback((key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleLanguageChange = useCallback((language: string) => {
    setLanguage(language as 'de' | 'en');
    // Hier könnte man auch die Sprache in localStorage speichern
    localStorage.setItem('werkaholic-language', language);
  }, []);

  const handleThemeChange = useCallback((newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark' | 'system');
  }, [setTheme]);

  const tabs = [
    {
      id: 'app-settings',
      label: 'App-Einstellungen',
      icon: <Settings className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          {/* Theme & Sprache */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Theme & Sprache</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Passe das Erscheinungsbild und die Sprache an
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">Theme</label>
                <div className="flex space-x-3">
                  {[
                    { value: 'light', label: 'Hell', icon: <Sun className="w-4 h-4" /> },
                    { value: 'dark', label: 'Dunkel', icon: <Moon className="w-4 h-4" /> },
                    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> }
                  ].map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => handleThemeChange(value)}
                      className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-all ${
                        theme === value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                      aria-label={`${label} Theme auswählen`}
                      aria-pressed={theme === value ? 'true' : 'false'}
                    >
                      {icon}
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">Sprache</label>
                <select
                  value={getLanguage()}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Sprache auswählen"
                >
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Performance</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Optimiere die App-Leistung für dein Gerät
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">Automatische Scans</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Scans werden automatisch im Hintergrund ausgeführt</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.autoScan}
                    onChange={(e) => handleSettingChange('autoScan', e.target.checked)}
                    aria-label="Automatische Scans aktivieren"
                  />
                  <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                </label>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Datenaufbewahrung: {settings.dataRetention === '1month' ? '1 Monat' : settings.dataRetention === '3months' ? '3 Monate' : settings.dataRetention === '1year' ? '1 Jahr' : 'Unbegrenzt'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={['1month', '3months', '1year', 'forever'].indexOf(settings.dataRetention)}
                  onChange={(e) => {
                    const values = ['1month', '3months', '1year', 'forever'];
                    handleSettingChange('dataRetention', values[parseInt(e.target.value)]);
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  aria-label="Datenaufbewahrung einstellen"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>1 Monat</span>
                  <span>3 Monate</span>
                  <span>1 Jahr</span>
                  <span>Unbegrenzt</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benachrichtigungen */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Benachrichtigungen</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Verwalte deine Kommunikationspräferenzen
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">E-Mail-Benachrichtigungen</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Erhalte Updates zu deinen Scans und Analysen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    aria-label="E-Mail-Benachrichtigungen aktivieren"
                  />
                  <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">Push-Benachrichtigungen</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Browser-Benachrichtigungen für wichtige Updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    aria-label="Push-Benachrichtigungen aktivieren"
                  />
                  <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">In-App-Benachrichtigungen</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Benachrichtigungen innerhalb der App</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.inAppNotifications}
                    onChange={(e) => handleSettingChange('inAppNotifications', e.target.checked)}
                    aria-label="In-App-Benachrichtigungen aktivieren"
                  />
                  <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">Scan-Benachrichtigungen</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Benachrichtigungen bei abgeschlossenen Analysen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.scanNotifications}
                    onChange={(e) => handleSettingChange('scanNotifications', e.target.checked)}
                    aria-label="Scan-Benachrichtigungen aktivieren"
                  />
                  <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">Wöchentliche Berichte</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Zusammenfassung deiner Aktivitäten per E-Mail</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.weeklyReports}
                    onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                    aria-label="Wöchentliche Berichte aktivieren"
                  />
                  <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-yellow-500 peer-checked:to-orange-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'account',
      label: 'Account',
      icon: <User className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          {/* Account-Übersicht */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Account-Übersicht</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Deine Account-Informationen und Statistiken
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Name</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{user?.displayName || 'Nicht angegeben'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">E-Mail</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{user?.email || 'Nicht verfügbar'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <UsageStats />
            </CardContent>
          </Card>

          {/* Profil bearbeiten */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Profil bearbeiten</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Aktualisiere deine persönlichen Informationen
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">Vollständiger Name</label>
                <input
                  type="text"
                  defaultValue={user?.displayName || ''}
                  className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dein vollständiger Name"
                  aria-label="Vollständigen Namen eingeben"
                />
              </div>
              <Button
                variant="primary"
                onClick={() => alert('Profil wird aktualisiert...')}
                aria-label="Profil aktualisieren"
              >
                <User className="w-4 h-4 mr-2" />
                Profil aktualisieren
              </Button>
            </CardContent>
          </Card>

          {/* Sicherheit */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Sicherheit</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Verwalte deine Account-Sicherheit
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="text-slate-900 dark:text-white font-semibold">Zwei-Faktor-Authentifizierung</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Erhöhe die Sicherheit deines Accounts</p>
                  </div>
                  <Button variant="outline" size="sm" aria-label="2FA einrichten">
                    Einrichten
                  </Button>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Passwort ändern</h4>
                  <div className="space-y-3">
                    <input
                      type="password"
                      className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Aktuelles Passwort"
                      aria-label="Aktuelles Passwort eingeben"
                    />
                    <input
                      type="password"
                      className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Neues Passwort"
                      aria-label="Neues Passwort eingeben"
                    />
                    <input
                      type="password"
                      className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Neues Passwort bestätigen"
                      aria-label="Neues Passwort bestätigen"
                    />
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => alert('Passwort wird geändert...')}
                      aria-label="Passwort ändern"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Passwort ändern
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account löschen */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Account löschen</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Lösche deinen Account dauerhaft
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 dark:text-red-200 text-sm font-semibold mb-2">
                      Gefahrenzone
                    </p>
                    <p className="text-red-700 dark:text-red-300 text-sm mb-3">
                      Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten, einschließlich Scan-Historie, Einstellungen und Abonnement, werden dauerhaft gelöscht.
                    </p>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        if (window.confirm('Bist du absolut sicher, dass du deinen Account löschen möchtest? Diese Aktion kann NICHT rückgängig gemacht werden.')) {
                          alert('Account-Löschung wird eingeleitet...');
                        }
                      }}
                      aria-label="Account löschen"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Account dauerhaft löschen
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'privacy',
      label: 'Datenschutz',
      icon: <Lock className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          {/* Daten-Management */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Daten-Management</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Exportiere, importiere oder lösche deine Daten
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white">Exportformat</label>
                  <select
                    value={settings.exportFormat}
                    onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
                    className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Exportformat auswählen"
                  >
                    <option value="json">JSON (vollständig)</option>
                    <option value="csv">CSV (Scan-Daten)</option>
                    <option value="pdf">PDF-Bericht</option>
                  </select>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => alert('Datenexport wird vorbereitet...')}
                    aria-label="Daten exportieren"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Daten exportieren
                  </Button>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white">Import</label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Ziehe eine JSON-Datei hierher oder klicke zum Auswählen
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      id="data-import"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) alert(`Datei "${file.name}" wird importiert...`);
                      }}
                      aria-label="Daten importieren"
                    />
                    <label htmlFor="data-import">
                      <Button variant="outline" size="sm" asChild>
                        <span>Datei auswählen</span>
                      </Button>
                    </label>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('data-import')?.click()}
                    aria-label="Daten importieren"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Daten importieren
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy-Einstellungen */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Privacy-Einstellungen</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Kontrolliere deine Privatsphäre und Datenfreigabe
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">Privatsphäre-Modus</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Verstecke sensible Informationen in Berichten</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.privacyMode}
                    onChange={(e) => handleSettingChange('privacyMode', e.target.checked)}
                    aria-label="Privatsphäre-Modus aktivieren"
                  />
                  <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">Datenfreigabe für Verbesserungen</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Anonyme Nutzungsdaten zur App-Verbesserung teilen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.dataSharing}
                    onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                    aria-label="Datenfreigabe aktivieren"
                  />
                  <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-blue-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Cookie-Einstellungen */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Cookie className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Cookie-Einstellungen</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Verwalte deine Cookie-Präferenzen
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">Notwendige Cookies</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Essentiell für die Funktionalität der App</p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-green-600 dark:text-green-400 text-sm font-semibold">Immer aktiv</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">Analyse-Cookies</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Hilft uns, die App zu verbessern</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.cookieAnalytics}
                    onChange={(e) => handleSettingChange('cookieAnalytics', e.target.checked)}
                    aria-label="Analyse-Cookies aktivieren"
                  />
                  <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">Marketing-Cookies</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Für personalisierte Werbung</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.cookieMarketing}
                    onChange={(e) => handleSettingChange('cookieMarketing', e.target.checked)}
                    aria-label="Marketing-Cookies aktivieren"
                  />
                  <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">Funktionale Cookies</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Für erweiterte Funktionen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.cookieFunctional}
                    onChange={(e) => handleSettingChange('cookieFunctional', e.target.checked)}
                    aria-label="Funktionale Cookies aktivieren"
                  />
                  <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-blue-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Datenlöschung */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Datenlöschung</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Lösche deine gespeicherten Daten dauerhaft
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-800 dark:text-red-200 text-sm mb-3">
                  <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten, einschließlich Scan-Historie und Einstellungen, werden dauerhaft gelöscht.
                </p>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (window.confirm('Bist du sicher, dass du alle deine Daten löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                      alert('Datenlöschung wird eingeleitet...');
                    }
                  }}
                  aria-label="Alle Daten löschen"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Alle Daten löschen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'support',
      label: 'Support',
      icon: <HelpCircle className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          {/* Hilfe & Dokumentation */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Hilfe & Dokumentation</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Finde Antworten auf häufige Fragen und lerne die App besser kennen
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => window.open('https://werkaholic.ai/docs', '_blank')}
                  aria-label="Dokumentation öffnen"
                >
                  <FileText className="w-6 h-6" />
                  <div className="text-center">
                    <p className="font-semibold">Dokumentation</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Ausführliche Anleitungen</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => window.open('https://werkaholic.ai/faq', '_blank')}
                  aria-label="FAQ öffnen"
                >
                  <HelpCircle className="w-6 h-6" />
                  <div className="text-center">
                    <p className="font-semibold">FAQ</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Häufige Fragen</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => window.open('https://werkaholic.ai/tutorials', '_blank')}
                  aria-label="Tutorials öffnen"
                >
                  <Activity className="w-6 h-6" />
                  <div className="text-center">
                    <p className="font-semibold">Tutorials</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Schritt-für-Schritt Anleitungen</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => window.open('https://werkaholic.ai/community', '_blank')}
                  aria-label="Community öffnen"
                >
                  <Users className="w-6 h-6" />
                  <div className="text-center">
                    <p className="font-semibold">Community</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Forum & Diskussionen</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Kontakt & Support */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Kontakt & Support</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Brauchst du Hilfe? Kontaktiere unser Support-Team
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">E-Mail Support</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">support@werkaholic.ai</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Für allgemeine Fragen und technische Unterstützung
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('mailto:support@werkaholic.ai', '_blank')}
                    aria-label="E-Mail Support kontaktieren"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    E-Mail senden
                  </Button>
                </div>

                <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Live Chat</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">24/7 verfügbar</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Sofortige Hilfe über unseren Live-Chat
                  </p>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => alert('Live Chat wird geöffnet...')}
                    aria-label="Live Chat starten"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Live Chat starten
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Feedback geben</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Hilf uns, Werkaholic AI zu verbessern
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Dein Feedback ist uns wichtig! Teile uns mit, was dir gefällt und was wir verbessern können.
                </p>
                <Button
                  variant="primary"
                  onClick={onFeedbackClick}
                  aria-label="Feedback geben"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Feedback geben
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System-Informationen */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Cog className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>System-Informationen</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Technische Details für Support-Anfragen
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">App-Version</p>
                  <p className="text-slate-600 dark:text-slate-400">v1.2.0</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Browser</p>
                  <p className="text-slate-600 dark:text-slate-400">{navigator.userAgent.split(' ').pop()}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Betriebssystem</p>
                  <p className="text-slate-600 dark:text-slate-400">{navigator.platform}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Sprache</p>
                  <p className="text-slate-600 dark:text-slate-400">{navigator.language}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const info = {
                    version: 'v1.2.0',
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    timestamp: new Date().toISOString()
                  };
                  navigator.clipboard.writeText(JSON.stringify(info, null, 2));
                  alert('System-Informationen in Zwischenablage kopiert');
                }}
                aria-label="System-Informationen kopieren"
              >
                <Copy className="w-4 h-4 mr-2" />
                Informationen kopieren
              </Button>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'advanced',
      label: 'Erweitert',
      icon: <Cog className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          {/* API-Schlüssel */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>API-Schlüssel</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Verwalte deine API-Schlüssel für Integrationen
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              {subscription?.plan === 'pro' ? (
                <div className="space-y-4">
                  <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold">Produktions-API-Schlüssel</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Erstellt am 15. Dezember 2024</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" aria-label="API-Schlüssel anzeigen">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" aria-label="API-Schlüssel kopieren">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" aria-label="API-Schlüssel löschen">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 rounded p-3 font-mono text-sm">
                      wk_••••••••••••••••••••••••••••••••
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" aria-label="Neuen API-Schlüssel erstellen">
                    <Key className="w-4 h-4 mr-2" />
                    Neuen API-Schlüssel erstellen
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">API-Zugang erforderlich</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    API-Schlüssel sind nur für Pro-Abonnenten verfügbar.
                  </p>
                  <Button variant="primary" aria-label="Auf Pro upgraden">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade auf Pro
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Integrationen */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Integrationen</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Verbinde externe Dienste und Plattformen
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">G</span>
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold">Google Drive</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Dateien synchronisieren</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.googleDriveIntegration}
                        onChange={(e) => handleSettingChange('googleDriveIntegration', e.target.checked)}
                        aria-label="Google Drive Integration aktivieren"
                      />
                      <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 font-bold text-sm">S</span>
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold">Slack</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Benachrichtigungen senden</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.slackIntegration}
                        onChange={(e) => handleSettingChange('slackIntegration', e.target.checked)}
                        aria-label="Slack Integration aktivieren"
                      />
                      <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">W</span>
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold">Webhook</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Eigene Integrationen</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.webhookIntegration}
                        onChange={(e) => handleSettingChange('webhookIntegration', e.target.checked)}
                        aria-label="Webhook Integration aktivieren"
                      />
                      <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">Z</span>
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold">Zapier</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Automatisierte Workflows</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.zapierIntegration}
                        onChange={(e) => handleSettingChange('zapierIntegration', e.target.checked)}
                        aria-label="Zapier Integration aktivieren"
                      />
                      <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debug-Modus */}
          <Card variant="gradient">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Bug className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Debug-Modus</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Erweiterte Debugging-Optionen für Entwickler
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">Debug-Modus aktivieren</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Zeigt zusätzliche Debug-Informationen an</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.debugMode}
                    onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                    aria-label="Debug-Modus aktivieren"
                  />
                  <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-orange-600"></div>
                </label>
              </div>

              {settings.debugMode && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => alert('Debug-Logs werden heruntergeladen...')}
                    aria-label="Debug-Logs herunterladen"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Debug-Logs herunterladen
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => alert('Cache wird geleert...')}
                    aria-label="Cache leeren"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cache leeren
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          Einstellungen
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
          Passe deine Werkaholic AI Erfahrung an
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs tabs={tabs} defaultTab="general" />
      </div>
    </div>
  );
};

export default SettingsView;