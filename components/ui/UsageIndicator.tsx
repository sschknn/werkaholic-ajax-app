import React from 'react';
import { AlertTriangle, Crown, Zap } from 'lucide-react';
import { Button } from './Button';

interface UsageIndicatorProps {
  used: number;
  limit: number;
  onUpgrade: () => void;
  className?: string;
}

const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  used,
  limit,
  onUpgrade,
  className = ''
}) => {
  const percentage = (used / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= limit;

  const getProgressColor = () => {
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  const getTextColor = () => {
    if (isAtLimit) return 'text-red-600 dark:text-red-400';
    if (isNearLimit) return 'text-amber-600 dark:text-amber-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  if (isAtLimit) {
    return (
      <div className={`p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-red-800 dark:text-red-200">Scan-Limit erreicht</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                {used} von {limit} Scans verwendet
              </p>
            </div>
          </div>
          <Button
            onClick={onUpgrade}
            variant="gradient"
            size="sm"
            className="flex items-center space-x-2"
            aria-label="Jetzt upgraden"
          >
            <Crown className="w-4 h-4" />
            <span>Upgraden</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">Verbleibende Scans</p>
          <p className={`text-xs ${getTextColor()}`}>
            {used} von {limit} verwendet
          </p>
        </div>
        {isNearLimit && (
          <Button
            onClick={onUpgrade}
            variant="outline"
            size="sm"
            className="text-xs"
            aria-label="Jetzt upgraden"
          >
            <Zap className="w-3 h-3 mr-1" />
            Upgraden
          </Button>
        )}
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {isNearLimit && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Limit bald erreicht - upgrade für unbegrenzte Scans
        </p>
      )}
    </div>
  );
};

export default UsageIndicator;