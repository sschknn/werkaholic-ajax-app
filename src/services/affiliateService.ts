import { AdAnalysis } from '../types/v1/types';

// Affiliate program types
export interface AffiliateCode {
  id: string;
  code: string;
  userId: string;
  usageCount: number;
  totalEarnings: number;
  createdAt: string;
  expiresAt?: string;
}

export interface AffiliateEarnings {
  affiliateCode: string;
  referredUserId: string;
  salePrice: number;
  commission: number;
  netEarnings: number;
  createdAt: string;
}

export interface AffiliateStats {
  totalReferrals: number;
  uniqueReferrals: number;
  totalEarnings: number;
  pendingPayouts: number;
  earningsByMonth: Array<{ month: string; earnings: number }>;
}

// Generiere einen einzigartigen Affiliate-Code
export const generateAffiliateCode = (userId: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `werkaholic_${userId.substring(0, 4)}${timestamp}${random}`.toUpperCase();
};

// Prüfe ob ein Code gültig ist
export const isValidAffiliateCode = (code: string): boolean => {
  if (!code || code.length < 8) return false;
  // Validierungslogik: sollte ALLEINSTÄNDIG sein und ein gültiges Format haben
  return /^WERKAHOLIC_[A-Z0-9]+$/.test(code);
};

// Erstelle einen Affiliate-Code für einen User
export const createAffiliateCode = (userId: string): AffiliateCode => {
  const code = generateAffiliateCode(userId);
  const affiliateCode: AffiliateCode = {
    id: `aff_${userId}_${Date.now()}`,
    code,
    userId,
    usageCount: 0,
    totalEarnings: 0,
    createdAt: new Date().toISOString(),
  };
  return affiliateCode;
};

// Berechne Provision basierend auf Verkaufspreis
export const calculateAffiliateCommission = (salePrice: number, commissionRate: number = 0.02): number => {
  return Math.round(salePrice * commissionRate * 100) / 100; // Auf 2 Dezimalstellen runden
};

// Füge Affiliate-Info zu einem Verkauf hinzu
export const addAffiliateInfoToSale = (
  saleId: string,
  affiliateCode: string,
  salePrice: number
): { commission: number; netEarnings: number } => {
  const commission = calculateAffiliateCommission(salePrice);
  const netEarnings = salePrice - commission;

  return { commission, netEarnings };
};

// Verfolge eine Empfehlung
export const trackReferral = async (
  affiliateCode: string,
  referredUserId: string,
  salePrice: number
): Promise<AffiliateEarnings> => {
  const commission = calculateAffiliateCommission(salePrice);
  const netEarnings = salePrice - commission;

  const earnings: AffiliateEarnings = {
    affiliateCode,
    referredUserId,
    salePrice,
    commission,
    netEarnings,
    createdAt: new Date().toISOString(),
  };

  // In Firestore würden wir hier die Daten speichern
  // Für jetzt: Return das earnings-Objekt
  return earnings;
};

// Hole Affiliate-Stats für einen User
export const getAffiliateStats = (userId: string): AffiliateStats => {
  // In einer echten Implementation würden wir von Firestore lesen
  // Für jetzt: Return Standard-Werte
  return {
    totalReferrals: 0,
    uniqueReferrals: 0,
    totalEarnings: 0,
    pendingPayouts: 0,
    earningsByMonth: [],
  };
};

// Generiere einen Affiliate-Link für einen User
export const generateAffiliateLink = (baseUrl: string, affiliateCode: string): string => {
  return `${baseUrl}?affiliate=${affiliateCode}`;
};

// Extrahiere Affiliate-Code aus einem Link
export const extractAffiliateCodeFromLink = (link: string): string | null => {
  try {
    const url = new URL(link);
    return url.searchParams.get('affiliate') || null;
  } catch {
    return null;
  }
};