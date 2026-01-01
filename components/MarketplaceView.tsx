import React, { useState, useMemo } from 'react';
import { Store, Plus, Search, Filter, Star, TrendingUp, DollarSign, Package, Users, Zap, ShoppingCart, Eye, Heart, Share2 } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui';
import { AdAnalysis } from '../types';

interface MarketplaceViewProps {
  analysisResults: AdAnalysis[];
  onCreateAd: (analysis: AdAnalysis) => void;
  onViewAd: (analysis: AdAnalysis) => void;
}

const MarketplaceView: React.FC<MarketplaceViewProps> = React.memo(({ analysisResults, onCreateAd, onViewAd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');

  // Filter and sort marketplace items
  const marketplaceItems = useMemo(() => {
    let filtered = analysisResults.filter(result => result.item_detected);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) -
                 parseFloat(b.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.'));
        case 'price-high':
          return parseFloat(b.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) -
                 parseFloat(a.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.'));
        case 'popular':
          // Mock popularity based on category frequency
          return 0; // For now, keep original order
        case 'newest':
        default:
          return 0; // Keep original order (assuming results are already sorted by recency)
      }
    });

    return filtered;
  }, [analysisResults, searchTerm, selectedCategory, sortBy]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(analysisResults.map(item => item.category)));
    return ['all', ...cats];
  }, [analysisResults]);

  const stats = useMemo(() => ({
    totalItems: marketplaceItems.length,
    totalValue: marketplaceItems.reduce((sum, item) => {
      const value = parseFloat(item.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      return sum + value;
    }, 0),
    avgPrice: marketplaceItems.length > 0 ?
      marketplaceItems.reduce((sum, item) => {
        const value = parseFloat(item.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return sum + value;
      }, 0) / marketplaceItems.length : 0,
  }), [marketplaceItems]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <Store className="w-8 h-8" />
            Marktplatz
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Verwalten und veröffentlichen Sie Ihre analysierten Produkte
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalItems}</p>
            <p className="text-sm text-slate-500">Artikel</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">{stats.totalValue.toFixed(0)}€</p>
            <p className="text-sm text-slate-500">Gesamtwert</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="gradient" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalItems}</p>
              <p className="text-sm text-blue-200">Artikel im Marktplatz</p>
            </div>
          </div>
        </Card>

        <Card variant="gradient" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalValue.toFixed(0)}€</p>
              <p className="text-sm text-green-200">Gesamtwert</p>
            </div>
          </div>
        </Card>

        <Card variant="gradient" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.avgPrice.toFixed(0)}€</p>
              <p className="text-sm text-purple-200">Durchschnittspreis</p>
            </div>
          </div>
        </Card>

        <Card variant="gradient" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-sm text-orange-200">Verkäufe</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Artikel suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Artikel suchen"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Kategorie filtern"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Alle Kategorien' : category}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Sortieren nach"
            >
              <option value="newest">Neueste zuerst</option>
              <option value="price-low">Preis aufsteigend</option>
              <option value="price-high">Preis absteigend</option>
              <option value="popular">Beliebt</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Marketplace Items */}
      {marketplaceItems.length === 0 ? (
        <Card variant="glass" className="text-center py-16">
          <CardContent>
            <Store className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'Keine Artikel gefunden' : 'Noch keine Artikel'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchTerm || selectedCategory !== 'all'
                ? 'Versuchen Sie andere Suchbegriffe oder Filter.'
                : 'Scannen Sie Produkte, um Ihren Marktplatz aufzubauen.'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button
                onClick={() => window.location.hash = '#scanner'}
                variant="gradient"
                className="inline-flex items-center gap-2"
                aria-label="Zum Scanner navigieren"
              >
                <Plus className="w-4 h-4" />
                Ersten Artikel scannen
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {marketplaceItems.map((item, index) => (
            <Card key={index} variant="glass" className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-t-xl flex items-center justify-center">
                  <Package className="w-12 h-12 text-slate-400" />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 flex-1 mr-2">
                      {item.title}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full whitespace-nowrap">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {item.price_estimate}
                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                      {item.condition}
                    </span>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => onViewAd(item)}
                        variant="ghost"
                        size="sm"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label={`${item.title} ansehen`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        onClick={() => onCreateAd(item)}
                        variant="ghost"
                        size="sm"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label={`${item.title} bearbeiten`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {marketplaceItems.length > 0 && (
        <Card variant="gradient">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Marktplatz verwalten
                </h3>
                <p className="text-slate-200 text-sm">
                  Optimieren Sie Ihre Artikel für bessere Verkaufserfolge
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  aria-label="Artikel exportieren"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Exportieren
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  aria-label="Statistiken anzeigen"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Statistiken
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

MarketplaceView.displayName = 'MarketplaceView';

export default MarketplaceView;