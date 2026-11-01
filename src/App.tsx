import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/theme/ThemeContext';
import { NotificationProvider } from './contexts/notification/NotificationContext';
import { SubscriptionProvider } from './contexts/subscription/SubscriptionContext';
import { OnboardingProvider } from './contexts/onboarding/OnboardingContext';
import AppContent from './AppContent';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <OnboardingProvider>
              <AppContent />
            </OnboardingProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;