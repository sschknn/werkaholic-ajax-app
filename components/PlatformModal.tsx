import React, { useState, useEffect } from 'react';
import { X, Upload, Check, AlertCircle, ExternalLink, Settings } from 'lucide-react';
import { Button, Card } from './ui';
import { AdAnalysis } from '../types';
import { platformService, PlatformType, PLATFORMS, ListingStatus } from '../services/platformService';
import { salesTrackingService } from '../services/salesTrackingService';

interface PlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AdAnalysis;
  images: string[];
  userId?: string;
  analysisId?: string;
}

const PlatformModal: React.FC<PlatformModalProps> = ({ isOpen, onClose, analysis, images, userId, analysisId }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([]);
  const [publishingStatus, setPublishingStatus] = useState<Record<PlatformType, 'idle' | 'publishing' | 'success' | 'error'>>({});
  const [listingStatuses, setListingStatuses] = useState<Record<PlatformType, ListingStatus | null>>({});
  const [availablePlatforms, setAvailablePlatforms] = useState<Array<{ id: PlatformType; name: string; available: boolean }>>([]);

  useEffect(() => {
    if (isOpen) {
      const platforms = platformService.getAvailablePlatforms();
      setAvailablePlatforms(platforms);
      setSelectedPlatforms([]);
      setPublishingStatus({});
      setListingStatuses({});
    }
  }, [isOpen]);

  const handlePlatformToggle = (platform: PlatformType) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handlePublish = async () => {
    if (!userId || !analysisId) {
      console.error('UserId oder AnalysisId fehlen für SalesTracking');
      return;
    }

    for (const platform of selectedPlatforms) {
      setPublishingStatus(prev => ({ ...prev, [platform]: 'publishing' }));

      try {
        const optimizedAnalysis = platformService.optimizeForPlatform(analysis, platform);
        const status = await platformService.publishListing(optimizedAnalysis, platform, images);

        // SalesTracking integrieren
        if (status.id && status.status === 'published') {
          const price = parseFloat(optimizedAnalysis.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.'));
          await salesTrackingService.createListing(
            userId,
            analysisId,
            platform as 'ebay' | 'facebook-marketplace' | 'ebay-kleinanzeigen',
            status.id,
            price,
            'EUR',
            optimizedAnalysis.title,
            status.url
          );
        }

        setPublishingStatus(prev => ({ ...prev, [platform]: 'success' }));
        setListingStatuses(prev => ({ ...prev, [platform]: status }));
      } catch (error) {
        console.error(`Fehler beim Veröffentlichen auf ${platform}:`, error);
        setPublishingStatus(prev => ({ ...prev, [platform]: 'error' }));
      }
    }
  };

  const getPlatformIcon = (platform: PlatformType) => {
    // Vereinfachte Icons - würden durch echte Logos ersetzt werden
    return <Settings className="w-5 h-5" />;
  };

  const getStatusIcon = (status: 'idle' | 'publishing' | 'success' | 'error') => {
    switch (status) {
      case 'publishing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Anzeige veröffentlichen
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {analysis.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Modal schließen"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Plattform-Auswahl */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Plattformen auswählen
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {availablePlatforms.map((platform) => (
                <Card
                  key={platform.id}
                  variant="gradient"
                  className={`p-4 cursor-pointer transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  } ${!platform.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => platform.available && handlePlatformToggle(platform.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getPlatformIcon(platform.id)}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {platform.name}
                        </p>
                        {!platform.available && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Nicht konfiguriert
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(publishingStatus[platform.id] || 'idle')}
                      {selectedPlatforms.includes(platform.id) && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Anzeigen-Vorschau */}
          {selectedPlatforms.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Anzeigen-Vorschau
              </h3>
              <div className="space-y-3">
                {selectedPlatforms.map((platform) => {
                  const optimized = platformService.optimizeForPlatform(analysis, platform);
                  const requirements = platformService.getPlatformRequirements(platform);

                  return (
                    <Card key={platform} variant="gradient" className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {platformService.getAvailablePlatforms().find(p => p.id === platform)?.name}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {optimized.title.length}/{requirements.titleMaxLength} Zeichen
                        </span>
                      </div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                        {optimized.title}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {optimized.price_estimate} • {optimized.condition}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {optimized.description}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Veröffentlichungs-Status */}
          {Object.keys(publishingStatus).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Veröffentlichungs-Status
              </h3>
              <div className="space-y-3">
                {Object.entries(publishingStatus).map(([platform, status]) => {
                  const platformName = availablePlatforms.find(p => p.id === platform)?.name;
                  const listingStatus = listingStatuses[platform];

                  return (
                    <Card key={platform} variant="gradient" className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(status as 'idle' | 'publishing' | 'success' | 'error')}
                          <span className="font-medium text-slate-900 dark:text-white">
                            {platformName}
                          </span>
                        </div>
                        {listingStatus?.url && (
                          <a
                            href={listingStatus.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            <span className="text-sm">Ansehen</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      {status === 'error' && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                          Veröffentlichung fehlgeschlagen. Bitte versuchen Sie es später erneut.
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
          <Button onClick={onClose} variant="outline">
            Abbrechen
          </Button>
          <Button
            onClick={handlePublish}
            variant="gradient"
            disabled={selectedPlatforms.length === 0 || Object.values(publishingStatus).includes('publishing')}
          >
            <Upload className="w-4 h-4 mr-2" />
            {Object.values(publishingStatus).includes('publishing') ? 'Veröffentliche...' : 'Veröffentlichen'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlatformModal;