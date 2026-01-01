import React from 'react';
import { Lock, Crown, Zap } from 'lucide-react';
import { Button } from './Button';

interface FeatureLockProps {
  title: string;
  description: string;
  onUpgrade: () => void;
  children?: React.ReactNode;
  variant?: 'overlay' | 'inline' | 'card';
  className?: string;
}

const FeatureLock: React.FC<FeatureLockProps> = ({
  title,
  description,
  onUpgrade,
  children,
  variant = 'overlay',
  className = ''
}) => {
  const renderLockContent = () => (
    <div className="text-center space-y-3">
      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      <Button
        onClick={onUpgrade}
        variant="gradient"
        size="sm"
        className="flex items-center space-x-2"
        aria-label="Premium freischalten"
      >
        <Crown className="w-4 h-4" />
        <span>Premium freischalten</span>
        <Zap className="w-4 h-4" />
      </Button>
    </div>
  );

  if (variant === 'overlay') {
    return (
      <div className={`relative ${className}`}>
        {children}
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center p-6">
          {renderLockContent()}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 ${className}`}>
        {renderLockContent()}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 ${className}`}>
        {renderLockContent()}
      </div>
    );
  }

  return null;
};

export default FeatureLock;