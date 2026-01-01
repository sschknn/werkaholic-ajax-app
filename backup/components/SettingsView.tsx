import React from 'react';
import { Sparkles, Eye, Star, CreditCard, Zap, Users, Shield, TrendingUp } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui';

interface SettingsViewProps {
  onFeedbackClick: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onFeedbackClick }) => {
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

      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <Card variant="gradient">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Konto</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Verwalte deine Kontoeinstellungen und Benachrichtigungen
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">E-Mail-Benachrichtigungen</p>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Erhalte Updates zu deinen Scans und Analysen</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked aria-label="E-Mail-Benachrichtigungen" />
                <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Scanner</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Konfiguriere das Verhalten des KI-Scanners
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">Automatische Analyse</p>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Scanne automatisch beim Fokussieren</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked aria-label="Automatische Analyse" />
                <div className="w-11 h-6 sm:w-12 sm:h-7 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Abonnement</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Upgrade auf Pro für unbegrenzte Scans und Premium-Features
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Free-Version</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">3 Scans pro Tag</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-900 dark:text-white font-bold">Kostenlos</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Keine Kreditkarte</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Pro-Version</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Unbegrenzte Scans</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-600 dark:text-blue-400 font-bold">4,99€/Monat</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Jederzeit kündbar</p>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Unbegrenzte KI-Analysen</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Premium-KI-Genauigkeit</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Keine Wartezeiten</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Vorrangige Verarbeitung</span>
                </div>
              </div>

              <Button
                variant="gradient"
                className="w-full touch-manipulation"
                onClick={() => alert('Upgrade-Funktion wird bald verfügbar sein!')}
                aria-label="Auf Pro-Version upgraden"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Jetzt auf Pro upgraden
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Feedback</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Hilf uns, Werkaholic AI zu verbessern
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-center space-y-3 sm:space-y-4">
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                Deine Meinung ist uns wichtig! Teile uns mit, wie wir die App verbessern können.
              </p>
              <Button
                onClick={onFeedbackClick}
                variant="gradient"
                className="w-full touch-manipulation"
              >
                <Star className="w-4 h-4 mr-2" />
                Feedback geben
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Über Werkaholic AI</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Werkaholic AI v1.2</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">KI-gestützte Werbeanalyse</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">
                Powered by Google Gemini AI • Made with ❤️
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsView;