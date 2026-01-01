import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, Star, Download, Share2, Trash2, Eye, Calendar, Sparkles, PieChart, Activity, Target, ArrowRight, ScanLine, Store } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, UsageIndicator, UpgradeBanner } from './ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { AdAnalysis } from '../types';
import Scanner from './Scanner';
import { useSubscription } from '../contexts/SubscriptionContext';

interface DashboardProps {
  analysisResults: AdAnalysis[];
  onDownloadBulkReport: () => void;
  onDownloadKleinanzeigenZIP: () => void;
  onAnalysisComplete: (result: AdAnalysis, image: string) => void;
  onOpenKleinanzeige: (result: AdAnalysis) => void;
  onNavigateToComparison?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ analysisResults, onDownloadBulkReport, onDownloadKleinanzeigenZIP, onAnalysisComplete, onOpenKleinanzeige, onNavigateToComparison }) => {
  const { subscription, remainingScans, canScan, upgradeToPro } = useSubscription();

  // Enhanced statistics calculation with performance optimization
  const stats = useMemo(() => {
    const totalScans = analysisResults.length;
    const avgValue = totalScans > 0
      ? analysisResults.reduce((sum, item) => {
        const value = parseFloat(item.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return sum + value;
      }, 0) / totalScans
      : 0;

    // Category distribution
    const categoryStats = analysisResults.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Condition distribution
    const conditionStats = analysisResults.reduce((acc, item) => {
      acc[item.condition] = (acc[item.condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 7 days)
    const last7Days = analysisResults.filter(item => {
      const itemDate = new Date(); // In real app, this would come from item.date
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate >= weekAgo;
    });

    // Value ranges
    const valueRanges = {
      under50: analysisResults.filter(item => {
        const value = parseFloat(item.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return value < 50;
      }).length,
      under100: analysisResults.filter(item => {
        const value = parseFloat(item.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return value >= 50 && value < 100;
      }).length,
      under500: analysisResults.filter(item => {
        const value = parseFloat(item.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return value >= 100 && value < 500;
      }).length,
      over500: analysisResults.filter(item => {
        const value = parseFloat(item.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return value >= 500;
      }).length,
    };

    return {
      totalScans,
      avgValue,
      recentScans: analysisResults.slice(0, 5),
      categoryStats,
      conditionStats,
      last7Days: last7Days.length,
      valueRanges,
    };
  }, [analysisResults]);

  // Chart data preparation with performance optimization
  const categoryChartData = useMemo(() =>
    Object.entries(stats.categoryStats).map(([name, value]) => ({
      name,
      value,
      fill: `hsl(${Math.random() * 360}, 70%, 50%)`
    })), [stats.categoryStats]);

  const conditionChartData = useMemo(() =>
    Object.entries(stats.conditionStats).map(([name, value]) => ({
      name,
      value,
      fill: name === 'Neu' ? '#10b981' : name === 'Gut' ? '#3b82f6' : name === 'Gebraucht' ? '#f59e0b' : '#6b7280'
    })), [stats.conditionStats]);

  const valueRangeChartData = useMemo(() => [
    { name: '< 50€', value: stats.valueRanges.under50, fill: '#ef4444' },
    { name: '50-100€', value: stats.valueRanges.under100, fill: '#f97316' },
    { name: '100-500€', value: stats.valueRanges.under500, fill: '#eab308' },
    { name: '> 500€', value: stats.valueRanges.over500, fill: '#22c55e' },
  ], [stats.valueRanges]);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          <Sparkles className="w-8 h-8" />
        </div>
      </div>

      {/* Quick Start Section */}
      <Card variant="gradient" className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-white mb-2">Schnellstart</h2>
              <p className="text-slate-200">Scannen Sie Produkte für sofortige Analyse und Marktplatz-Optimierung</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.hash = '#scanner'}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                aria-label="Zum Scanner navigieren"
                disabled={!canScan}
              >
                <ScanLine className="w-4 h-4 mr-2" />
                Scanner öffnen
              </Button>
              <Button
                onClick={() => window.location.hash = '#marketplace'}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                aria-label="Zum Marktplatz navigieren"
              >
                <Store className="w-4 h-4 mr-2" />
                Marktplatz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Indicator for Free Users */}
      {subscription.plan === 'free' && (
        <UsageIndicator
          used={subscription.scansUsed}
          limit={subscription.scansLimit}
          onUpgrade={upgradeToPro}
          className="mb-6"
        />
      )}

      {/* Upgrade Banner when limit is reached */}
      {!canScan && (
        <UpgradeBanner
          title="Scan-Limit erreicht"
          description="Upgrade auf Premium für unbegrenzte Scans und erweiterte Features"
          features={[
            "Unbegrenzte Produkt-Scans",
            "Erweiterte Vergleichsfunktionen",
            "Premium-Support",
            "Export in alle Formate"
          ]}
          onUpgrade={upgradeToPro}
          variant="urgent"
          className="mb-6"
        />
      )}

      {/* Live Scanner Section - Full Height */}
      <Card variant="glass" className="min-h-[400px] sm:min-h-[500px] lg:min-h-[700px]">
        <CardContent className="p-0 h-full">
          <Scanner
            onAnalysisComplete={onAnalysisComplete}
            onCancel={() => { }} // Empty onCancel for embedded mode
            isEmbedded={true}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {analysisResults.length >= 2 && onNavigateToComparison && (
        <Card variant="gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  Produkte vergleichen
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Vergleiche {analysisResults.length} analysierte Produkte im Detail
                </p>
              </div>
              <Button
                onClick={onNavigateToComparison}
                variant="gradient"
                className="flex items-center space-x-2"
                aria-label="Zur Produktvergleichsfunktion navigieren"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Vergleichen</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Scans */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Letzte Scans</span>
          </CardTitle>
          <CardDescription>
            Deine kürzlich analysierten Produkte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentScans.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Noch keine Scans</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Starte mit dem Scanner, um deine ersten Ergebnisse zu sehen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentScans.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                  onClick={() => onOpenKleinanzeige(result)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Öffne Details für ${result.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenKleinanzeige(result);
                    }
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 dark:text-white font-semibold">{result.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{result.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.price_estimate}</p>
                    <p className="text-slate-500 dark:text-slate-500 text-sm">{result.condition}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;