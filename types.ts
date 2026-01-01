export interface AdAnalysis {
  item_detected: boolean; // True if a valid sellable item is found
  title: string;
  price_estimate: string; // e.g., "150€ - 200€"
  price_suggestions?: string[]; // Alternative price suggestions
  condition: string; // e.g., "Gut", "Neu", "Gebraucht"
  category: string;
  subcategory?: string; // More detailed category
  brand?: string; // Product brand if detectable
  model?: string; // Product model/type
  description: string;
  keywords: string[];
  features?: string[]; // Important features of the product
  defects?: string[]; // Any defects or wear
  reasoning: string; // Brief explanation of the valuation
  market_value?: string; // Market value based on similar products
  target_platforms?: string[]; // Recommended selling platforms
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

export interface SubscriptionInfo {
  plan: 'free' | 'pro' | 'enterprise';
  scansUsed: number;
  scansLimit: number;
  resetDate: string;
  isActive: boolean;
  commissionRate?: number; // Provision in Prozent (z.B. 0.02 für 2%)
  monthlyRevenue?: number; // Monatlicher Umsatz für Provisionsberechnung
  platformsLimit?: number; // Maximale Anzahl an Plattformen
  features?: string[]; // Zusätzliche Features
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

export interface BatchJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  totalImages: number;
  processedImages: number;
  results: BatchResult[];
  error?: string;
}

export interface BatchResult {
  id: string;
  image: string;
  imageName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  analysis?: AdAnalysis;
  error?: string;
  processingTime?: number; // in milliseconds
}

export interface BatchQueueItem {
  id: string;
  image: File | string;
  imageName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  result?: AdAnalysis;
  error?: string;
}

// Plattform-Listing Status
export interface PlatformListing {
  id: string;
  userId: string;
  analysisId: string; // Reference to the original analysis
  platform: 'ebay' | 'facebook-marketplace' | 'ebay-kleinanzeigen';
  platformListingId: string; // eBay item ID, Facebook listing ID, etc.
  status: 'active' | 'sold' | 'expired' | 'ended' | 'deleted';
  url?: string;
  createdAt: string;
  updatedAt: string;
  price: number;
  currency: string;
  title: string;
  views?: number;
  watchCount?: number;
  lastCheckedAt?: string;
}

// Verkaufs-Transaktion
export interface SaleTransaction {
  id: string;
  userId: string;
  listingId: string; // Reference to PlatformListing
  platform: 'ebay' | 'facebook-marketplace' | 'ebay-kleinanzeigen';
  salePrice: number;
  currency: string;
  fees: number; // Platform fees
  netAmount: number; // Amount after fees
  commission?: number; // Our commission if applicable
  buyerInfo?: {
    name?: string;
    location?: string;
  };
  soldAt: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  shippingStatus?: 'not_shipped' | 'shipped' | 'delivered';
}

// Preisoptimierung
export interface PriceOptimization {
  id: string;
  listingId: string;
  currentPrice: number;
  suggestedPrice: number;
  reasoning: string;
  confidence: number; // 0-1
  marketData?: {
    similarItems: Array<{
      price: number;
      condition: string;
      soldDate?: string;
    }>;
    averagePrice: number;
    priceRange: {
      min: number;
      max: number;
    };
  };
  createdAt: string;
  appliedAt?: string;
}

// Verkaufs-Performance-Metriken
export interface SalesMetrics {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalRevenue: number;
  totalFees: number;
  netProfit: number;
  averageSalePrice: number;
  averageTimeToSell: number; // in days
  sellThroughRate: number; // percentage
  topCategories: Array<{
    category: string;
    sales: number;
    revenue: number;
  }>;
  platformPerformance: Array<{
    platform: string;
    listings: number;
    sales: number;
    revenue: number;
    avgTimeToSell: number;
  }>;
}