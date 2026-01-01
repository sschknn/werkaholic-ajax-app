import React from 'react';
import { Crown, Zap, ArrowRight, X } from 'lucide-react';
import { Button } from './Button';

interface UpgradeBannerProps {
  title: string;
  description: string;
  features?: string[];
  onUpgrade: () => void;
  onDismiss?: () => void;
  variant?: 'default' | 'urgent' | 'success';
  className?: string;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({
  title,
  description,
  features = [],
  onUpgrade,
  onDismiss,
  variant = 'default',
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'urgent':
        return 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-red-600';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-600';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border p-4 sm:p-6 ${getVariantStyles()} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <Crown className="w-5 h-5 flex-shrink-0" />
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <p className="text-sm opacity-90 mb-3">{description}</p>

          {features.length > 0 && (
            <ul className="space-y-1 mb-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm">
                  <Zap className="w-3 h-3 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}

          <Button
            onClick={onUpgrade}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            aria-label="Jetzt upgraden"
          >
            <span>Jetzt upgraden</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors ml-4 flex-shrink-0"
            aria-label="Banner schließen"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full blur-lg" />
    </div>
  );
};

export default UpgradeBanner;