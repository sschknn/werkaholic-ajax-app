import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FirestoreService } from '../services/firestoreService';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  requiredAction?: string;
  priority: number; // Lower number = higher priority
}

interface OnboardingContextType {
  steps: OnboardingStep[];
  currentStep: OnboardingStep | null;
  completeStep: (stepId: string) => Promise<void>;
  dismissOnboarding: () => Promise<void>;
  isOnboardingActive: boolean;
  showOnboardingModal: boolean;
  setShowOnboardingModal: (show: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const INITIAL_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Willkommen bei Werkaholic AI',
    description: 'Entdecken Sie die KI-gestützte Werbeanalyse',
    completed: false,
    priority: 1,
  },
  {
    id: 'first_scan',
    title: 'Ersten Scan durchführen',
    description: 'Scannen Sie Ihre erste Produktanzeige',
    completed: false,
    requiredAction: 'scan',
    priority: 2,
  },
  {
    id: 'explore_comparison',
    title: 'Produkte vergleichen',
    description: 'Vergleichen Sie mehrere Produkte für bessere Entscheidungen',
    completed: false,
    requiredAction: 'compare',
    priority: 3,
  },
  {
    id: 'try_export',
    title: 'Daten exportieren',
    description: 'Exportieren Sie Ihre Analyse-Ergebnisse',
    completed: false,
    requiredAction: 'export',
    priority: 4,
  },
  {
    id: 'customize_settings',
    title: 'Einstellungen anpassen',
    description: 'Passen Sie die App an Ihre Bedürfnisse an',
    completed: false,
    requiredAction: 'settings',
    priority: 5,
  },
];

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<OnboardingStep[]>(INITIAL_STEPS);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [isOnboardingActive, setIsOnboardingActive] = useState(true);

  // Load onboarding progress when user changes
  useEffect(() => {
    const loadOnboardingProgress = async () => {
      if (user?.uid) {
        try {
          const progress = await FirestoreService.getUserOnboardingProgress(user.uid);
          if (progress) {
            setSteps(prevSteps =>
              prevSteps.map(step => ({
                ...step,
                completed: progress.completedSteps?.includes(step.id) || false,
              }))
            );
            setIsOnboardingActive(progress.isActive !== false);
          }
        } catch (error) {
          console.error('Failed to load onboarding progress:', error);
        }
      } else {
        // Reset for logged out users
        setSteps(INITIAL_STEPS);
        setIsOnboardingActive(true);
      }
    };

    loadOnboardingProgress();
  }, [user?.uid]);

  // Auto-show onboarding modal for next incomplete step
  useEffect(() => {
    if (isOnboardingActive && !showOnboardingModal) {
      const nextStep = steps.find(step => !step.completed);
      if (nextStep && nextStep.priority <= 2) { // Only auto-show high priority steps
        const timer = setTimeout(() => {
          setShowOnboardingModal(true);
        }, 2000); // Show after 2 seconds

        return () => clearTimeout(timer);
      }
    }
  }, [steps, isOnboardingActive, showOnboardingModal]);

  const completeStep = async (stepId: string) => {
    if (!user?.uid) return;

    const updatedSteps = steps.map(step =>
      step.id === stepId ? { ...step, completed: true } : step
    );
    setSteps(updatedSteps);

    try {
      const completedSteps = updatedSteps
        .filter(step => step.completed)
        .map(step => step.id);

      await FirestoreService.updateUserOnboardingProgress(user.uid, {
        completedSteps,
        isActive: true,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    }
  };

  const dismissOnboarding = async () => {
    if (!user?.uid) return;

    setIsOnboardingActive(false);
    setShowOnboardingModal(false);

    try {
      await FirestoreService.updateUserOnboardingProgress(user.uid, {
        isActive: false,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to dismiss onboarding:', error);
    }
  };

  const currentStep = steps.find(step => !step.completed) || null;

  return (
    <OnboardingContext.Provider
      value={{
        steps,
        currentStep,
        completeStep,
        dismissOnboarding,
        isOnboardingActive,
        showOnboardingModal,
        setShowOnboardingModal,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};