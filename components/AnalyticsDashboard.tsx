import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Star,
  Download,
  Share2,
  Trash2,
  Eye,
  Calendar,
  Sparkles,
  PieChart,
  Activity,
  Target,
  Filter,
  FileText,
  Zap,
  CheckCircle,
  XCircle,
  Timer,
  DollarSign,
  ShoppingCart,
  Package,
  TrendingDown
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Tabs } from './ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Area, AreaChart, Pie } from 'recharts';
import { AdAnalysis, SalesMetrics } from '../types';
import { salesTrackingService } from '../services/salesTrackingService';
import { useAuth } from '../contexts/AuthContext';

interface AnalyticsDashboardProps {
  analysisResults: AdAnalysis[];
  onDownloadBulkReport: () => void;
  onDownloadKleinanzeigenZIP: () => void;
  onAnalysisComplete: (result: AdAnalysis, image: string) => void;
  onOpenKleinanzeige: (result: AdAnalysis) => void;
  onNavigateToComparison?: () => void;
}

type TimeRange = 'day' | 'week' | 'month' | 'all';

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analysisResults,
  onDownloadBulkReport,
  onDownloadKleinanzeigenZIP,
  onAnalysisComplete,
  onOpenKleinanzeige,
  onNavigateToComparison
}) => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [loadingSales, setLoadingSales] = useState(false);

  // Load sales metrics when user changes
  useEffect(() => {
    const loadSalesMetrics = async () => {
      if (user?.uid) {
        setLoadingSales(true);
        try {
          const metrics = await salesTrackingService.getSalesMetrics(user.uid);
          setSalesMetrics(metrics);
        } catch (error) {
          console.error('Fehler beim Laden der Verkaufsmetriken:', error);
        } finally {
          setLoadingSales(false);
        }
      }
    };

    loadSalesMetrics();
  }, [user?.uid]);

  // Filter data based on time range
  const filteredResults = useMemo(() => {
    if (timeRange === 'all') return analysisResults;

    const now = new Date();
    const filterDate = new Date();

    switch (timeRange) {
      case 'day':
        filterDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
    }

    return analysisResults.filter(result => {
      if (!result.createdAt) return true; // Include if no timestamp
      const resultDate = new Date(result.createdAt);
      return resultDate >= filterDate;
    });
  }, [analysisResults, timeRange]);

  // Trend data for charts (generated from real data)
  const trendData = useMemo(() => {
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }

    return days.map(date => {
      const dayResults = filteredResults.filter(result => {
        if (!result.createdAt) return false;
        return result.createdAt.startsWith(date);
      });

      const totalValue = dayResults.reduce((sum, result) => {
        const value = parseFloat(result.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return sum + value;
      }, 0);

      const avgValue = dayResults.length > 0 ? totalValue / dayResults.length : 0;

      return {
        date: new Date(date).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }),
        scans: dayResults.length,
        value: Math.round(avgValue)
      };
    });
  }, [filteredResults]);

  // Enhanced statistics calculation
  const stats = useMemo(() => {
    const totalScans = filteredResults.length;
    const avgValue = totalScans > 0
      ? filteredResults.reduce((sum, item) => {
          const value = parseFloat(item.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          return sum + value;
        }, 0) / totalScans
      : 0;

    // Category distribution
    const categoryStats = filteredResults.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Condition distribution
    const conditionStats = filteredResults.reduce((acc, item) => {
      acc[item.condition] = (acc[item.condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Performance metrics (mock data for now)
    const performanceMetrics = {
      avgResponseTime: 2.3, // seconds
      successRate: 94.2, // percentage
      totalRequests: totalScans,
      failedRequests: Math.floor(totalScans * 0.058), // 5.8% failure rate
    };

    // Value ranges
    const valueRanges = {
      under50: filteredResults.filter(item => {
        const value = parseFloat(item.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return value < 50;
      }).length,
      under100: filteredResults.filter(item => {
        const value = parseFloat(item.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return value >= 50 && value < 100;
      }).length,
      under500: filteredResults.filter(item => {
        const value = parseFloat(item.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return value >= 100 && value < 500;
      }).length,
      over500: filteredResults.filter(item => {
        const value = parseFloat(item.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return value >= 500;
      }).length,
    };

    return {
      totalScans,
      avgValue,
      recentScans: filteredResults.slice(0, 5),
      categoryStats,
      conditionStats,
      valueRanges,
      performanceMetrics,
      trendData,
    };
  }, [filteredResults, trendData]);

  // Chart data preparation
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

  const performanceChartData = useMemo(() => [
    { name: 'Erfolgreich', value: stats.performanceMetrics.successRate, fill: '#10b981' },
    { name: 'Fehlgeschlagen', value: 100 - stats.performanceMetrics.successRate, fill: '#ef4444' },
  ], [stats.performanceMetrics]);

  // Export functions
  const exportToCSV = () => {
    const csvData = filteredResults.map(result => ({
      Titel: result.title,
      Kategorie: result.category,
      Zustand: result.condition,
      Preis: result.price_estimate,
      Datum: result.createdAt ? new Date(result.createdAt).toLocaleDateString('de-DE') : new Date().toLocaleDateString('de-DE')
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToJSON = () => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      timeRange,
      totalScans: stats.totalScans,
      averageValue: stats.avgValue,
      performanceMetrics: stats.performanceMetrics,
      results: filteredResults
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Header with Time Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Analytics Dashboard</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
            Detaillierte Analyse deiner Werbeaktivitäten
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Zeitraum filtern"
          >
            <option value="all">Alle Daten</option>
            <option value="month">Letzter Monat</option>
            <option value="week">Letzte Woche</option>
            <option value="day">Letzter Tag</option>
          </select>
        </div>
      </div>

      {/* Export Actions */}
      {stats.totalScans > 0 && (
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onDownloadBulkReport}
            variant="gradient"
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>PDF-Bericht</span>
          </Button>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>CSV Export</span>
          </Button>
          <Button
            onClick={exportToJSON}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>JSON Export</span>
          </Button>
        </div>
      )}

      {/* Main Stats Cards */}
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
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">Erfolgsrate</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.performanceMetrics.successRate}%</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-yellow-500/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 lg:-mr-16 lg:-mt-16"></div>
          <CardContent className="relative p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">Ø Antwortzeit</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.performanceMetrics.avgResponseTime}s</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Timer className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs
        tabs={[
          {
            id: 'overview',
            label: 'Übersicht',
            icon: <BarChart3 className="w-4 h-4" />,
            content: (
              <div className="space-y-6">
                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  {/* Category Distribution */}
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
                        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                          <RechartsPieChart>
                            <Pie
                              data={categoryChartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {categoryChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Value Ranges */}
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
                        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                          <BarChart data={valueRangeChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
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
              </div>
            )
          },
          {
            id: 'performance',
            label: 'Performance',
            icon: <Zap className="w-4 h-4" />,
            content: (
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="w-5 h-5" />
                        <span>Performance-Metriken</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Gesamt Anfragen</span>
                        <span className="font-bold">{stats.performanceMetrics.totalRequests}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Erfolgreiche Anfragen</span>
                        <span className="font-bold text-green-600">{stats.performanceMetrics.totalRequests - stats.performanceMetrics.failedRequests}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Fehlgeschlagene Anfragen</span>
                        <span className="font-bold text-red-600">{stats.performanceMetrics.failedRequests}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Durchschnittliche Antwortzeit</span>
                        <span className="font-bold">{stats.performanceMetrics.avgResponseTime}s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Erfolgsrate</span>
                        <span className="font-bold">{stats.performanceMetrics.successRate}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Erfolgsrate</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height={200} minWidth={300} minHeight={200}>
                          <RechartsPieChart>
                            <Pie
                              data={performanceChartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {performanceChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
          },
          {
            id: 'trends',
            label: 'Trends',
            icon: <TrendingUp className="w-4 h-4" />,
            content: (
              <div className="space-y-6">
                {/* Trend Charts */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Scan-Trends</span>
                    </CardTitle>
                    <CardDescription>
                      Entwicklung deiner Scan-Aktivitäten über Zeit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                        <LineChart data={stats.trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="scans" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Wert-Trends</span>
                    </CardTitle>
                    <CardDescription>
                      Entwicklung der durchschnittlichen Werte über Zeit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                        <AreaChart data={stats.trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          },
          {
            id: 'sales',
            label: 'Verkäufe',
            icon: <ShoppingCart className="w-4 h-4" />,
            content: (
              <div className="space-y-6">
                {loadingSales ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Lade Verkaufsdaten...</p>
                  </div>
                ) : salesMetrics ? (
                  <>
                    {/* Sales Overview Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                      <Card variant="gradient" className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-green-500/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 lg:-mr-16 lg:-mt-16"></div>
                        <CardContent className="relative p-3 sm:p-4 lg:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">Gesamtumsatz</p>
                              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">{salesMetrics.totalRevenue.toFixed(0)}€</p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card variant="gradient" className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-blue-500/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 lg:-mr-16 lg:-mt-16"></div>
                        <CardContent className="relative p-3 sm:p-4 lg:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">Verkäufe</p>
                              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">{salesMetrics.soldListings}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card variant="gradient" className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-purple-500/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 lg:-mr-16 lg:-mt-16"></div>
                        <CardContent className="relative p-3 sm:p-4 lg:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">Ø Verkaufszeit</p>
                              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">{salesMetrics.averageTimeToSell.toFixed(0)} Tage</p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                              <Timer className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card variant="gradient" className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-orange-500/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 lg:-mr-16 lg:-mt-16"></div>
                        <CardContent className="relative p-3 sm:p-4 lg:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">Verkaufsrate</p>
                              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">{salesMetrics.sellThroughRate.toFixed(1)}%</p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Platform Performance */}
                    <Card variant="glass">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5" />
                          <span>Plattform-Performance</span>
                        </CardTitle>
                        <CardDescription>
                          Verkaufserfolg nach Plattform
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                            <BarChart data={salesMetrics.platformPerformance}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="platform" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="sales" fill="#8884d8" name="Verkäufe" />
                              <Bar dataKey="revenue" fill="#82ca9d" name="Umsatz (€)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Active Listings */}
                    <Card variant="glass">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Package className="w-5 h-5" />
                          <span>Aktive Anzeigen</span>
                        </CardTitle>
                        <CardDescription>
                          {salesMetrics.activeListings} aktive Listings auf verschiedenen Plattformen
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600 dark:text-slate-400">
                            Detaillierte Listing-Verwaltung kommt bald
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Noch keine Verkaufsdaten
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Veröffentlichen Sie Ihre ersten Anzeigen, um Verkaufsdaten zu sehen.
                    </p>
                    <Button variant="gradient" onClick={() => window.location.hash = '#scanner'}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Erste Anzeige erstellen
                    </Button>
                  </div>
                )}
              </div>
            )
          },
          {
            id: 'details',
            label: 'Details',
            icon: <Eye className="w-4 h-4" />,
            content: (
              <div className="space-y-6">
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
            )
          }
        ]}
        defaultTab="overview"
      />
    </div>
  );
};

export default AnalyticsDashboard;