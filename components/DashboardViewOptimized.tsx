import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, Star, Download, Share2, Trash2, Eye, Calendar, Sparkles, PieChart, Activity, Target } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui';
import LazyChart from './LazyChart';
import { AdAnalysis } from '../types';

interface DashboardProps {
  analysisResults: AdAnalysis[];
  onDownloadBulkReport: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ analysisResults, onDownloadBulkReport }) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Werkaholic AI Dashboard</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
            Deine KI-gestützte Werbeanalyse im Überblick
          </p>
        </div>
        {stats.totalScans > 0 && (
          <Button
            onClick={onDownloadBulkReport}
            variant="gradient"
            className="flex items-center space-x-2 w-full sm:w-auto touch-manipulation"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">PDF-Bericht</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card variant="gradient" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-blue-500/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 lg:-mr-16 lg:-mt-16"></div>
          <CardContent className="relative p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">Gesamt Scans</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalScans}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-green-500/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 lg:-mr-16 lg:-mt-16"></div>
          <CardContent className="relative p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">Durchschnittswert</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.avgValue.toFixed(0)}€</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-purple-500/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 lg:-mr-16 lg:-mt-16"></div>
          <CardContent className="relative p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">Letzte 7 Tage</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.last7Days}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-yellow-500/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 lg:-mr-16 lg:-mt-16"></div>
          <CardContent className="relative p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">Kategorien</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">{Object.keys(stats.categoryStats).length}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Lazy Loading */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Distribution - Lazy Loaded */}
        <Card variant="glass">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Kategorien-Verteilung</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Aufschlüsselung deiner gescannten Produkte nach Kategorie
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="h-48 sm:h-56 lg:h-64">
              <LazyChart
                type="pie"
                data={categoryChartData}
                className="w-full h-full"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              {categoryChartData.slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs sm:text-sm">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }}></div>
                  <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                  <span className="text-slate-900 dark:text-white font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Value Ranges - Lazy Loaded */}
        <Card variant="glass">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Wertbereiche</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Verteilung der geschätzten Werte deiner Produkte
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="h-48 sm:h-56 lg:h-64">
              <LazyChart
                type="bar"
                data={valueRangeChartData}
                dataKey="value"
                nameKey="name"
                className="w-full h-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Condition Overview */}
      <Card variant="glass">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Zustands-Übersicht</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Qualität deiner gescannten Produkte
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {conditionChartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }}></div>
                  <span className="text-slate-900 dark:text-white font-medium text-sm sm:text-base">{item.name}</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card variant="glass">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Letzte Scans</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Deine kürzlich analysierten Produkte
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          {stats.recentScans.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">Noch keine Scans</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">Starte mit dem Scanner, um deine ersten Ergebnisse zu sehen</p>
              <Button variant="gradient" size="sm" className="touch-manipulation">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Ersten Scan starten
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {stats.recentScans.map((result, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">{result.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">{result.category}</p>
                    </div>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{result.price_estimate}</p>
                    <p className="text-slate-500 dark:text-slate-500 text-xs sm:text-sm">{result.condition}</p>
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