import React from 'react';
import { BarChart3, Clock, FileText, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui';

interface UsageStatsProps {
  totalAds: number;
  totalEdits: number;
  averageEditTime: number; // in minutes
  mostUsedCategory?: string;
  recentActivity: Array<{
    action: string;
    timestamp: Date;
    details?: string;
  }>;
}

export const UsageStats: React.FC<UsageStatsProps> = ({
  totalAds,
  totalEdits,
  averageEditTime,
  mostUsedCategory,
  recentActivity
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Ads */}
      <Card variant="gradient">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Gesamt Inserate</p>
              <p className="text-3xl font-bold text-white">{totalAds}</p>
            </div>
            <FileText className="w-8 h-8 text-white/60" />
          </div>
        </CardContent>
      </Card>

      {/* Total Edits */}
      <Card variant="gradient">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Bearbeitungen</p>
              <p className="text-3xl font-bold text-white">{totalEdits}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-white/60" />
          </div>
        </CardContent>
      </Card>

      {/* Average Edit Time */}
      <Card variant="gradient">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Ø Bearbeitungszeit</p>
              <p className="text-3xl font-bold text-white">{(averageEditTime || 0).toFixed(1)}min</p>
            </div>
            <Clock className="w-8 h-8 text-white/60" />
          </div>
        </CardContent>
      </Card>

      {/* Most Used Category */}
      <Card variant="gradient">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Beliebteste Kategorie</p>
              <p className="text-lg font-bold text-white truncate">{mostUsedCategory || 'Keine'}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-white/60" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="md:col-span-2 lg:col-span-4">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                  Noch keine Aktivitäten
                </p>
              ) : (
                recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {activity.action}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {activity.details}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {activity.timestamp.toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};