import React, { useState, useMemo } from 'react';
import { Download, Share2, Trash2, Eye, Calendar, Sparkles, Star, Search, Filter, SortAsc, Edit3, BarChart3, Tag, Package, TrendingUp } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui';
import { AdAnalysis, HistoryItem } from '../types';

interface HistoryViewProps {
  analysisResults: AdAnalysis[];
  historyItems?: HistoryItem[];
  onClearResults: () => void;
  onShareResult: (result: AdAnalysis) => void;
  onDownloadResult: (result: AdAnalysis) => void;
  onOpenResult?: (result: AdAnalysis) => void;
  onEditResult?: (result: AdAnalysis, imageData: string) => void;
  onDeleteResult?: (resultId: string) => void;
  isLoading?: boolean;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  analysisResults,
  historyItems = [],
  onClearResults,
  onShareResult,
  onDownloadResult,
  onOpenResult,
  onEditResult,
  onDeleteResult,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Combine analysis results with history items for richer data
  const enrichedResults = useMemo(() => {
    return analysisResults.map((result, index) => {
      const historyItem = historyItems.find(item => item.analysis.title === result.title);
      return {
        ...result,
        id: historyItem?.id || `result-${index}`,
        image: historyItem?.image || '',
        date: historyItem?.date || result.createdAt || new Date().toISOString(),
        platform: historyItem?.platform || '',
        customized: result.customized || false,
      };
    });
  }, [analysisResults, historyItems]);

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = enrichedResults.filter(result => {
      const matchesSearch = searchTerm === '' ||
        result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || result.category === categoryFilter;
      const matchesCondition = conditionFilter === 'all' || result.condition === conditionFilter;

      return matchesSearch && matchesCategory && matchesCondition;
    });

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'price':
          const priceA = parseFloat(a.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          const priceB = parseFloat(b.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          comparison = priceA - priceB;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [enrichedResults, searchTerm, categoryFilter, conditionFilter, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const totalValue = filteredAndSortedResults.reduce((sum, result) => {
      return sum + (parseFloat(result.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0);
    }, 0);

    const categories = filteredAndSortedResults.reduce((acc, result) => {
      acc[result.category] = (acc[result.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const conditions = filteredAndSortedResults.reduce((acc, result) => {
      acc[result.condition] = (acc[result.condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalItems: filteredAndSortedResults.length,
      totalValue: totalValue.toFixed(2),
      categories,
      conditions,
      avgValue: filteredAndSortedResults.length > 0 ? (totalValue / filteredAndSortedResults.length).toFixed(2) : '0',
    };
  }, [filteredAndSortedResults]);

  const categories = useMemo(() =>
    Array.from(new Set(enrichedResults.map(item => item.category))),
    [enrichedResults]
  );

  const conditions = ['Neu', 'Sehr gut', 'Gut', 'Akzeptabel', 'Defekt'];
  return (
    <div className="space-y-6">
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

      {/* Statistics Overview */}
      {filteredAndSortedResults.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="gradient" className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalItems}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Gesamt Scans</p>
              </div>
            </div>
          </Card>

          <Card variant="gradient" className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalValue}€</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Gesamtwert</p>
              </div>
            </div>
          </Card>

          <Card variant="gradient" className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgValue}€</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Durchschnitt</p>
              </div>
            </div>
          </Card>

          <Card variant="gradient" className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Tag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{Object.keys(stats.categories).length}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Kategorien</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      {enrichedResults.length > 0 && (
        <Card variant="gradient" className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Suche nach Titel, Beschreibung oder Keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="p-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  aria-label="Nach Kategorie filtern"
                >
                  <option value="all">Alle Kategorien</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="p-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  aria-label="Nach Zustand filtern"
                >
                  <option value="all">Alle Zustände</option>
                  {conditions.map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <SortAsc className="w-4 h-4 text-slate-400" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort as any);
                    setSortOrder(order as any);
                  }}
                  className="p-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  aria-label="Sortierung auswählen"
                >
                  <option value="date-desc">Neueste zuerst</option>
                  <option value="date-asc">Älteste zuerst</option>
                  <option value="price-desc">Preis absteigend</option>
                  <option value="price-asc">Preis aufsteigend</option>
                  <option value="title-asc">Titel A-Z</option>
                  <option value="title-desc">Titel Z-A</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}

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
      ) : isLoading ? (
        <div className="grid gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} variant="gradient" className="p-4 sm:p-6 animate-pulse">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-200 dark:bg-slate-700 rounded-xl flex-shrink-0"></div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                      <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-2 sm:p-3">
                        <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-8 mb-1"></div>
                        <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-12"></div>
                      </div>
                      <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-2 sm:p-3">
                        <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-12 mb-1"></div>
                        <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-16"></div>
                      </div>
                      <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-2 sm:p-3">
                        <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-10 mb-1"></div>
                        <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-14"></div>
                      </div>
                      <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-2 sm:p-3">
                        <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-16 mb-1"></div>
                        <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-10"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:ml-6 flex-shrink-0">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {filteredAndSortedResults.map((result, index) => (
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