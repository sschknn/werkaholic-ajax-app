import React, { createContext, useContext } from 'react';

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  markCompleted: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasCompleted, setHasCompleted] = useState(false);
  return children;
};
