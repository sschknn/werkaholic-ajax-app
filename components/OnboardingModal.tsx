import React, { useState, useEffect } from 'react';
import { X, ScanLine, BarChart3, History, Settings, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { Button } from './ui';
import { useOnboarding } from '../contexts/OnboardingContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { currentStep: onboardingStep, completeStep, dismissOnboarding, steps } = useOnboarding();

  // Map onboarding steps to modal content
  const getStepContent = (stepId: string) => {
    switch (stepId) {
      case 'welcome':
        return {
          title: 'Willkommen bei Werkaholic AI',
          description: 'Deine KI-gestützte Werbeanalyse für bessere Kaufentscheidungen.',
          icon: Sparkles,
          content: (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Analysiere Produktanzeigen mit künstlicher Intelligenz und erhalte detaillierte Informationen zu Preis, Zustand und Marktwert.
              </p>
            </div>
          )
        };
      case 'first_scan':
        return {
          title: 'Ersten Scan durchführen',
          description: 'Verwende den integrierten Scanner, um Anzeigen zu analysieren.',
          icon: ScanLine,
          content: (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">So funktioniert's:</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Öffne eine Produktanzeige auf deinem Bildschirm</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Klicke auf "Scannen" im Dashboard</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Die KI analysiert automatisch Titel, Preis und Details</span>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    // Close onboarding and navigate to scanner
                    onClose();
                    window.location.hash = '#scanner';
                  }}
                  variant="gradient"
                  className="flex items-center space-x-2"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Zum Scanner</span>
                </Button>
              </div>
            </div>
          )
        };
      case 'explore_comparison':
        return {
          title: 'Produkte vergleichen',
          description: 'Vergleiche mehrere Produkte, um die beste Wahl zu treffen.',
          icon: BarChart3,
          content: (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Vergleichsfunktionen:</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Wähle bis zu 4 Produkte zum Vergleich aus</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Vergleiche Preise, Zustand und Kategorien</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Finde das beste Preis-Leistungs-Verhältnis</span>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    onClose();
                    window.location.hash = '#comparison';
                  }}
                  variant="gradient"
                  className="flex items-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Vergleich starten</span>
                </Button>
              </div>
            </div>
          )
        };
      case 'try_export':
        return {
          title: 'Daten exportieren',
          description: 'Alle Analysen werden gespeichert und können exportiert werden.',
          icon: History,
          content: (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <History className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Verlauf</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Alle Scans werden gespeichert</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Einstellungen</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Passe die App an deine Bedürfnisse an</p>
                </div>
              </div>
            </div>
          )
        };
      case 'customize_settings':
        return {
          title: 'Einstellungen anpassen',
          description: 'Passe die App an deine Bedürfnisse an.',
          icon: Settings,
          content: (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Anpassungsoptionen:</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Theme und Sprache ändern</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Benachrichtigungen konfigurieren</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Datenaufbewahrung einstellen</span>
                  </li>
                </ul>
              </div>
            </div>
          )
        };
      default:
        return null;
    }
  };

  if (!isOpen || !onboardingStep) return null;

  const currentStepData = getStepContent(onboardingStep.id);
  if (!currentStepData) return null;

  const Icon = currentStepData.icon;
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;

  const handleComplete = () => {
    completeStep(onboardingStep.id);
    onClose();
  };

  const handleSkip = () => {
    dismissOnboarding();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentStepData.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {currentStepData.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Tutorial schließen"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepData.content}
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pb-4">
          <div className="flex space-x-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  step.completed || step.id === onboardingStep.id
                    ? 'bg-blue-600'
                    : 'bg-slate-200 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <span>Überspringen</span>
          </Button>

          <span className="text-sm text-slate-500 dark:text-slate-400">
            {completedSteps + 1} von {totalSteps}
          </span>

          <Button
            onClick={handleComplete}
            variant="gradient"
            className="flex items-center space-x-2"
          >
            <span>Verstanden</span>
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;