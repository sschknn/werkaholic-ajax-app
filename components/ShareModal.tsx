import React from 'react';
import { X, Share2, Facebook, Twitter, Instagram, Mail, MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from './ui';
import { AdAnalysis } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AdAnalysis;
  onShare: (result: AdAnalysis, platform?: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  result,
  onShare
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const shareText = `Werkaholic AI Analyse: ${result.title}\nGeschätzter Wert: ${result.price_estimate}\nZustand: ${result.condition}\nKategorie: ${result.category}\n\nAnalysiert mit KI: ${result.description}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      platform: 'facebook'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      platform: 'twitter'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-pink-600 hover:bg-pink-700',
      platform: 'instagram'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      platform: 'whatsapp'
    },
    {
      name: 'E-Mail',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      platform: 'email'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Teilen</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Wähle eine Plattform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{result.title}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Wert:</span>
                <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">{result.price_estimate}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Zustand:</span>
                <span className="ml-2 text-slate-900 dark:text-white">{result.condition}</span>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900 dark:text-white">Soziale Medien</h4>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.platform}
                    onClick={() => onShare(result, option.platform)}
                    className={`flex items-center space-x-3 p-3 rounded-xl text-white transition-all transform hover:scale-105 ${option.color}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900 dark:text-white">Link kopieren</h4>
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center space-x-3 p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">Kopiert!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <span className="text-slate-900 dark:text-white font-medium">In Zwischenablage kopieren</span>
                </>
              )}
            </button>
          </div>

          {/* Native Share */}
          {navigator.share && (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900 dark:text-white">System teilen</h4>
              <Button
                onClick={() => onShare(result)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <Share2 className="w-5 h-5 mr-2" />
                System-Menü öffnen
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};