import React from 'react';
import { Download, Share2, Trash2, Eye, Calendar, Sparkles, Star } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui';
import { AdAnalysis } from '../types';

interface HistoryViewProps {
  analysisResults: AdAnalysis[];
  onClearResults: () => void;
  onShareResult: (result: AdAnalysis) => void;
  onDownloadResult: (result: AdAnalysis) => void;
  onOpenResult?: (result: AdAnalysis) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ analysisResults, onClearResults, onShareResult, onDownloadResult, onOpenResult }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Scan-Verlauf
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Alle deine KI-Analysen im Überblick
          </p>
        </div>
        {analysisResults.length > 0 && (
          <Button
            onClick={onClearResults}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 w-full sm:w-auto touch-manipulation"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Alle löschen
          </Button>
        )}
      </div>

      {analysisResults.length === 0 ? (
        <Card variant="glass" className="text-center py-12 sm:py-16">
          <CardContent>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">Noch kein Verlauf</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
              Deine gescannten Produkte und KI-Analysen werden hier angezeigt
            </p>
            <Button
              variant="gradient"
              size="sm"
              className="touch-manipulation"
              onClick={() => window.location.hash = '#dashboard'}
              aria-label="Zum Dashboard navigieren um ersten Scan zu starten"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Ersten Scan starten
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {analysisResults.map((result, index) => (
            <Card key={index} variant="gradient" className="hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4 sm:mb-6">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 truncate">{result.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{result.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                        <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2 sm:p-3">
                          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Wert</p>
                          <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{result.price_estimate}</p>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2 sm:p-3">
                          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Zustand</p>
                          <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">{result.condition}</p>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2 sm:p-3">
                          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Kategorie</p>
                          <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base truncate">{result.category}</p>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2 sm:p-3">
                          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">KI-Konfidenz</p>
                          <p className="text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">Hoch</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:ml-6 flex-shrink-0">
                    {onOpenResult && (
                      <Button
                        onClick={() => onOpenResult(result)}
                        variant="ghost"
                        size="sm"
                        className="p-2 sm:p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 touch-manipulation"
                        title="Inserat öffnen"
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    )}
                    <Button
                      onClick={() => onShareResult(result)}
                      variant="ghost"
                      size="sm"
                      className="p-2 sm:p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 touch-manipulation"
                      title="Teilen"
                    >
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                    <Button
                      onClick={() => onDownloadResult(result)}
                      variant="ghost"
                      size="sm"
                      className="p-2 sm:p-3 hover:bg-green-50 dark:hover:bg-green-900/20 touch-manipulation"
                      title="Herunterladen"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;