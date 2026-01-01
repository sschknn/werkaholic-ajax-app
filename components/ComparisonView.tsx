import React, { useState, useMemo, useCallback } from 'react';
import { BarChart3, TrendingUp, Star, X, Check, ArrowUpDown, Filter } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, FeatureLock, UpgradeBanner } from './ui';
import { AdAnalysis } from '../types';
import { useSubscription } from '../contexts/SubscriptionContext';

interface ComparisonViewProps {
  analysisResults: AdAnalysis[];
  onBack: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ analysisResults, onBack }) => {
  const { subscription, upgradeToPro } = useSubscription();
  const [selectedItems, setSelectedItems] = useState<AdAnalysis[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'condition' | 'category'>('price');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const isFreeUser = subscription.plan === 'free';
  const maxFreeComparisons = 2;
  const canAddMore = !isFreeUser || selectedItems.length < maxFreeComparisons;

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = analysisResults;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const priceA = parseFloat(a.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          const priceB = parseFloat(b.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          return priceA - priceB;
        case 'condition':
          const conditionOrder = { 'Neu': 3, 'Gut': 2, 'Gebraucht': 1 };
          return (conditionOrder[b.condition as keyof typeof conditionOrder] || 0) -
                 (conditionOrder[a.condition as keyof typeof conditionOrder] || 0);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  }, [analysisResults, sortBy, filterCategory]);

  const categories = useMemo(() =>
    Array.from(new Set(analysisResults.map(item => item.category))),
    [analysisResults]
  );

  const toggleItemSelection = useCallback((item: AdAnalysis) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.title === item.title);
      if (isSelected) {
        return prev.filter(selected => selected.title !== item.title);
      } else if (canAddMore) {
        return [...prev, item];
      }
      return prev;
    });
  }, [canAddMore]);

  const removeFromComparison = useCallback((item: AdAnalysis) => {
    setSelectedItems(prev => prev.filter(selected => selected.title !== item.title));
  }, []);

  const getPriceValue = (priceString: string) => {
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  const getBestValue = (items: AdAnalysis[], field: 'price' | 'condition') => {
    if (field === 'price') {
      return items.reduce((best, current) =>
        getPriceValue(current.price_estimate) < getPriceValue(best.price_estimate) ? current : best
      );
    } else {
      const conditionOrder = { 'Neu': 3, 'Gut': 2, 'Gebraucht': 1 };
      return items.reduce((best, current) =>
        (conditionOrder[current.condition as keyof typeof conditionOrder] || 0) >
        (conditionOrder[best.condition as keyof typeof conditionOrder] || 0) ? current : best
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Produktvergleich
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Vergleiche bis zu 4 Produkte, um die beste Wahl zu treffen
          </p>
        </div>
        <Button onClick={onBack} variant="outline" aria-label="Zurück zum Dashboard">
          <X className="w-4 h-4 mr-2" />
          Zurück
        </Button>
      </div>

      {/* Selection Panel */}
      <Card variant="gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Produkte auswählen ({selectedItems.length}/{isFreeUser ? maxFreeComparisons : 4})</span>
          </CardTitle>
          <CardDescription>
            {isFreeUser
              ? `Wähle bis zu ${maxFreeComparisons} Produkte zum Vergleich aus (Premium: bis zu 4)`
              : 'Wähle Produkte aus deiner Historie zum Vergleich aus'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Ausgewählte Produkte:</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {selectedItems.map((item, index) => (
                  <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</h4>
                        <p className="text-blue-600 dark:text-blue-400 font-bold">{item.price_estimate}</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">{item.condition}</p>
                      </div>
                      <Button
                        onClick={() => removeFromComparison(item)}
                        variant="ghost"
                        size="sm"
                        className="ml-2 p-1 h-auto"
                        aria-label={`Entferne ${item.title} aus Vergleich`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters and Sort */}
          {isFreeUser ? (
            <FeatureLock
              title="Erweiterte Filter & Sortierung"
              description="Mit Premium kannst du Produkte nach Kategorie filtern und nach verschiedenen Kriterien sortieren."
              onUpgrade={upgradeToPro}
              variant="inline"
              className="mb-4"
            />
          ) : (
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
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
                <ArrowUpDown className="w-4 h-4" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="p-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  aria-label="Sortieren nach"
                >
                  <option value="price">Preis</option>
                  <option value="condition">Zustand</option>
                  <option value="category">Kategorie</option>
                </select>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedItems.map((result, index) => {
              const isSelected = selectedItems.some(selected => selected.title === result.title);
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                  onClick={() => toggleItemSelection(result)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${isSelected ? 'Entferne' : 'Füge hinzu'} ${result.title} zum Vergleich`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleItemSelection(result);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{result.title}</h3>
                    {isSelected && <Check className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.price_estimate}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{result.category}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{result.condition}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Banner for Free Users at Limit */}
      {isFreeUser && selectedItems.length >= maxFreeComparisons && (
        <UpgradeBanner
          title="Mehr Produkte vergleichen"
          description="Upgrade auf Premium für Vergleich von bis zu 4 Produkten gleichzeitig"
          features={[
            "Vergleiche bis zu 4 Produkte",
            "Erweiterte Filteroptionen",
            "Detaillierte Vergleichstabellen",
            "Export von Vergleichsberichten"
          ]}
          onUpgrade={upgradeToPro}
          variant="default"
          className="mb-6"
        />
      )}

      {/* Comparison Table */}
      {selectedItems.length >= 2 && (
        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Detaillierter Vergleich</span>
            </CardTitle>
            <CardDescription>
              Vergleiche alle wichtigen Eigenschaften im Detail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-600">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Eigenschaft</th>
                    {selectedItems.map((item, index) => (
                      <th key={index} className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white min-w-[200px]">
                        {item.title.length > 30 ? `${item.title.substring(0, 30)}...` : item.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Preis</td>
                    {selectedItems.map((item, index) => {
                      const isBest = item === getBestValue(selectedItems, 'price');
                      return (
                        <td key={index} className={`py-3 px-4 ${isBest ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                          <div className="flex items-center">
                            <span className={`font-bold ${isBest ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                              {item.price_estimate}
                            </span>
                            {isBest && <Star className="w-4 h-4 text-green-600 dark:text-green-400 ml-2" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Zustand</td>
                    {selectedItems.map((item, index) => {
                      const isBest = item === getBestValue(selectedItems, 'condition');
                      return (
                        <td key={index} className={`py-3 px-4 ${isBest ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                          <div className="flex items-center">
                            <span className={`${isBest ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-900 dark:text-white'}`}>
                              {item.condition}
                            </span>
                            {isBest && <Star className="w-4 h-4 text-green-600 dark:text-green-400 ml-2" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Kategorie</td>
                    {selectedItems.map((item, index) => (
                      <td key={index} className="py-3 px-4 text-slate-900 dark:text-white">
                        {item.category}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Beschreibung</td>
                    {selectedItems.map((item, index) => (
                      <td key={index} className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                        {item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResults.length === 0 && (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Keine Produkte zum Vergleichen</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Scanne zuerst einige Produkte, um sie vergleichen zu können.
            </p>
            <Button onClick={onBack} variant="gradient">
              Zum Scanner
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComparisonView;