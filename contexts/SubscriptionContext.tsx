import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { SubscriptionInfo } from '../types';

interface SubscriptionContextType {
  subscription: SubscriptionInfo;
  canScan: boolean;
  remainingScans: number;
  incrementScanCount: () => Promise<void>;
  upgradeToPro: () => Promise<void>;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const FREE_SCANS_LIMIT = 5;

// Hilfsfunktionen für Tarif-Konfiguration
const getScansLimit = (plan: 'free' | 'pro' | 'enterprise'): number => {
  switch (plan) {
    case 'free': return FREE_SCANS_LIMIT;
    case 'pro': return Infinity;
    case 'enterprise': return Infinity;
    default: return FREE_SCANS_LIMIT;
  }
};

const getCommissionRate = (plan: 'free' | 'pro' | 'enterprise'): number => {
  switch (plan) {
    case 'free': return 0; // Keine Provision für Free-User
    case 'pro': return 0.02; // 2% Provision
    case 'enterprise': return 0.01; // 1% Provision für Enterprise
    default: return 0;
  }
};

const getPlatformsLimit = (plan: 'free' | 'pro' | 'enterprise'): number => {
  switch (plan) {
    case 'free': return 1; // Nur 1 Plattform
    case 'pro': return 3; // 3 Plattformen
    case 'enterprise': return Infinity; // Unbegrenzt
    default: return 1;
  }
};

const getPlanFeatures = (plan: 'free' | 'pro' | 'enterprise'): string[] => {
  switch (plan) {
    case 'free':
      return ['basic-analytics', 'manual-publishing'];
    case 'pro':
      return ['advanced-analytics', 'auto-publishing', 'price-optimization', 'sales-tracking', 'commission-earning'];
    case 'enterprise':
      return ['all-pro-features', 'priority-support', 'custom-integrations', 'bulk-operations', 'api-access'];
    default:
      return ['basic-analytics'];
  }
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    plan: 'free',
    scansUsed: 0,
    scansLimit: FREE_SCANS_LIMIT,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    isActive: true,
    commissionRate: 0,
    platformsLimit: 1,
    features: ['basic-analytics']
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load subscription data when user changes
  useEffect(() => {
    const loadSubscription = async () => {
      if (user?.uid) {
        setIsLoading(true);
        try {
          const userSubscription = await FirestoreService.getUserSubscription(user.uid);

          if (userSubscription) {
            setSubscription({
              plan: userSubscription.plan || 'free',
              scansUsed: userSubscription.scansUsed || 0,
              scansLimit: getScansLimit(userSubscription.plan || 'free'),
              resetDate: userSubscription.resetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              isActive: true,
              commissionRate: getCommissionRate(userSubscription.plan || 'free'),
              platformsLimit: getPlatformsLimit(userSubscription.plan || 'free'),
              features: getPlanFeatures(userSubscription.plan || 'free'),
              monthlyRevenue: userSubscription.monthlyRevenue || 0,
            });
          } else {
            // Initialize free subscription for new users
            const initialSubscription = {
              plan: 'free' as const,
              scansUsed: 0,
              scansLimit: FREE_SCANS_LIMIT,
              resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              commissionRate: 0,
              platformsLimit: 1,
              features: ['basic-analytics'],
            };

            await FirestoreService.updateUserSubscription(user.uid, initialSubscription);
            setSubscription({ ...initialSubscription, isActive: true });
          }
        } catch (error) {
          console.error('Failed to load subscription:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Reset to free plan for logged out users
        setSubscription({
          plan: 'free',
          scansUsed: 0,
          scansLimit: FREE_SCANS_LIMIT,
          resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          commissionRate: 0,
          platformsLimit: 1,
          features: ['basic-analytics'],
        });
      }
    };

    loadSubscription();
  }, [user?.uid]);

  const incrementScanCount = async () => {
    if (!user?.uid) return;

    const newScansUsed = subscription.scansUsed + 1;
    const updatedSubscription = {
      ...subscription,
      scansUsed: newScansUsed,
    };

    setSubscription(updatedSubscription);
    await FirestoreService.updateUserSubscription(user.uid, updatedSubscription);
  };

  const upgradeToPro = async () => {
    if (!user?.uid) return;

    const proSubscription = {
      plan: 'pro' as const,
      scansUsed: subscription.scansUsed,
      scansLimit: Infinity,
      resetDate: subscription.resetDate,
      commissionRate: 0.02,
      platformsLimit: 3,
      features: ['advanced-analytics', 'auto-publishing', 'price-optimization', 'sales-tracking', 'commission-earning'],
    };

    setSubscription({ ...proSubscription, isActive: true });
    await FirestoreService.updateUserSubscription(user.uid, proSubscription);
  };

  const canScan = subscription.plan === 'pro' || subscription.scansUsed < subscription.scansLimit;
  const remainingScans = subscription.plan === 'pro' ? Infinity : Math.max(0, subscription.scansLimit - subscription.scansUsed);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        canScan,
        remainingScans,
        incrementScanCount,
        upgradeToPro,
        isLoading,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};