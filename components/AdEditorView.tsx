import React, { useState, useCallback } from 'react';
import { Save, X, Image, Edit3, DollarSign, Tag, FileText, Camera, Upload, RotateCcw, Share2 } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui';
import { AdAnalysis } from '../types';
import { getPriceSuggestions, removeImageBackground } from '../services/geminiService';

interface AdEditorViewProps {
  analysis: AdAnalysis;
  imageData: string;
  onSave: (updatedAnalysis: AdAnalysis, newImageData?: string) => void;
  onCancel: () => void;
  onPublish?: (analysis: AdAnalysis, images: string[]) => void;
}

const AdEditorView: React.FC<AdEditorViewProps> = ({ analysis, imageData, onSave, onCancel, onPublish }) => {
  const [editedAnalysis, setEditedAnalysis] = useState<AdAnalysis>({ ...analysis });
  const [editedImageData, setEditedImageData] = useState<string>(imageData);
  const [priceSuggestions, setPriceSuggestions] = useState<string[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Load price suggestions on mount
  React.useEffect(() => {
    const loadPriceSuggestions = async () => {
      try {
        const suggestions = await getPriceSuggestions(analysis);
        setPriceSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to load price suggestions:', error);
      }
    };
    loadPriceSuggestions();
  }, [analysis]);

  const handleFieldChange = useCallback((field: keyof AdAnalysis, value: any) => {
    setEditedAnalysis(prev => ({
      ...prev,
      [field]: value,
      customized: true,
      lastModified: new Date().toISOString(),
      editCount: (prev.editCount || 0) + 1,
    }));
  }, []);

  const handleSave = () => {
    onSave(editedAnalysis, editedImageData !== imageData ? editedImageData : undefined);
  };

  const handleRemoveBackground = async () => {
    setIsProcessingImage(true);
    try {
      const processedImage = await removeImageBackground(editedImageData);
      setEditedImageData(processedImage);
    } catch (error) {
      console.error('Failed to remove background:', error);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditedImageData(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Inserate bearbeiten
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Optimieren Sie Ihr Inserat für besseren Verkaufserfolg
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={onCancel} variant="outline" aria-label="Bearbeitung abbrechen">
            <X className="w-4 h-4 mr-2" />
            Abbrechen
          </Button>
          <Button onClick={handleSave} variant="gradient" aria-label="Änderungen speichern">
            <Save className="w-4 h-4 mr-2" />
            Speichern
          </Button>
          {onPublish && (
            <Button
              onClick={() => onPublish(editedAnalysis, [editedImageData])}
              variant="outline"
              className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
              aria-label="Anzeige veröffentlichen"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Veröffentlichen
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image Editor */}
        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="w-5 h-5" />
              <span>Bild bearbeiten</span>
            </CardTitle>
            <CardDescription>
              Verbessern Sie Ihr Produktbild für mehr Aufmerksamkeit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <img
                src={editedImageData}
                alt="Produktbild"
                className="w-full h-64 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
              />
              {isProcessingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>Bild wird bearbeitet...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={handleRemoveBackground}
                disabled={isProcessingImage}
                variant="outline"
                className="flex items-center justify-center"
                aria-label="Hintergrund entfernen"
              >
                <Camera className="w-4 h-4 mr-2" />
                Hintergrund entfernen
              </Button>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Neues Bild hochladen"
                />
                <Button
                  as="span"
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  aria-label="Neues Bild hochladen"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Neues Bild
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit3 className="w-5 h-5" />
              <span>Inhalt bearbeiten</span>
            </CardTitle>
            <CardDescription>
              Optimieren Sie Titel, Beschreibung und Preis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Titel
              </label>
              <input
                type="text"
                value={editedAnalysis.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Geben Sie einen ansprechenden Titel ein"
                aria-label="Inserat-Titel bearbeiten"
              />
            </div>

            {/* Price */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Preis
              </label>
              <input
                type="text"
                value={editedAnalysis.price_estimate}
                onChange={(e) => handleFieldChange('price_estimate', e.target.value)}
                className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. 49,99€"
                aria-label="Preis bearbeiten"
              />

              {priceSuggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Preisvorschläge:</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {priceSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleFieldChange('price_estimate', suggestion)}
                        className="p-2 text-left bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-sm"
                        aria-label={`Preisvorschlag anwenden: ${suggestion}`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category & Condition */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Kategorie
                </label>
                <select
                  value={editedAnalysis.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Kategorie auswählen"
                >
                  <option value="Elektronik">Elektronik</option>
                  <option value="Werkzeuge">Werkzeuge</option>
                  <option value="Möbel">Möbel</option>
                  <option value="Kleidung">Kleidung</option>
                  <option value="Haushalt">Haushalt</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Zustand
                </label>
                <select
                  value={editedAnalysis.condition}
                  onChange={(e) => handleFieldChange('condition', e.target.value)}
                  className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Zustand auswählen"
                >
                  <option value="Neu">Neu</option>
                  <option value="Sehr gut">Sehr gut</option>
                  <option value="Gut">Gut</option>
                  <option value="Akzeptabel">Akzeptabel</option>
                  <option value="Defekt">Defekt</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Beschreibung
              </label>
              <textarea
                value={editedAnalysis.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                rows={6}
                className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Beschreiben Sie Ihr Produkt detailliert..."
                aria-label="Beschreibung bearbeiten"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Suchbegriffe (kommasepariert)
              </label>
              <input
                type="text"
                value={editedAnalysis.keywords?.join(', ') || ''}
                onChange={(e) => handleFieldChange('keywords', e.target.value.split(',').map(k => k.trim()))}
                className="w-full p-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. neu, original, verpackt"
                aria-label="Suchbegriffe bearbeiten"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Features */}
      <Card variant="gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="w-5 h-5" />
            <span>Zusätzliche Informationen</span>
          </CardTitle>
          <CardDescription>
            Erweiterte Details für besseren Verkaufserfolg
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {editedAnalysis.brand && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Marke</p>
                <p className="text-blue-700 dark:text-blue-300">{editedAnalysis.brand}</p>
              </div>
            )}

            {editedAnalysis.model && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">Modell</p>
                <p className="text-green-700 dark:text-green-300">{editedAnalysis.model}</p>
              </div>
            )}

            {editedAnalysis.market_value && (
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">Marktwert</p>
                <p className="text-purple-700 dark:text-purple-300">{editedAnalysis.market_value}</p>
              </div>
            )}
          </div>

          {editedAnalysis.features && editedAnalysis.features.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                {editedAnalysis.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {editedAnalysis.defects && editedAnalysis.defects.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Hinweise:</h4>
              <ul className="list-disc list-inside space-y-1 text-orange-600 dark:text-orange-400">
                {editedAnalysis.defects.map((defect, index) => (
                  <li key={index}>{defect}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdEditorView;