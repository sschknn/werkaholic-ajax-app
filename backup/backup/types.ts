export interface AdAnalysis {
  item_detected: boolean; // True if a valid sellable item is found
  title: string;
  price_estimate: string; // e.g., "150€ - 200€"
  condition: string; // e.g., "Gut", "Neu", "Gebraucht"
  category: string;
  description: string;
  keywords: string[];
  reasoning: string; // Brief explanation of the valuation
  customized?: boolean; // Whether the ad has been customized by user
  createdAt?: string; // ISO date string when the analysis was created
  lastModified?: string; // ISO date string when last modified
  editCount?: number; // Number of times edited
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  ANALYTICS = 'ANALYTICS',
  SCANNER = 'SCANNER',
  RESULTS = 'RESULTS',
  HISTORY = 'HISTORY'
}

export interface HistoryItem {
  id: string;
  image: string; // The main thumbnail/hero image
  additionalImages?: string[]; // Array of extra images
  date: string;
  analysis: AdAnalysis;
  adText?: string; // Full ad text for the listing
  platform?: string; // Platform where the ad was created (e.g., 'kleinanzeigen')
  subscription?: {
    plan: 'free' | 'pro';
    scansUsed: number;
    resetDate: string;
  };
}

export interface Feedback {
  id: string;
  rating: number;
  comment: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string; // Optional, for authenticated users
}