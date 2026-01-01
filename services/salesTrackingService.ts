import { PlatformListing, SaleTransaction, SalesMetrics, PriceOptimization, AdAnalysis } from '../types';
import { FirestoreService } from './firestoreService';
import { optimizePriceWithAI } from './geminiService';

export class SalesTrackingService {
  private static instance: SalesTrackingService;

  static getInstance(): SalesTrackingService {
    if (!SalesTrackingService.instance) {
      SalesTrackingService.instance = new SalesTrackingService();
    }
    return SalesTrackingService.instance;
  }

  // Plattform-Listing erstellen
  async createListing(
    userId: string,
    analysisId: string,
    platform: 'ebay' | 'facebook-marketplace' | 'ebay-kleinanzeigen',
    platformListingId: string,
    price: number,
    currency: string,
    title: string,
    url?: string
  ): Promise<PlatformListing> {
    const listing: PlatformListing = {
      id: `${platform}_${platformListingId}`,
      userId,
      analysisId,
      platform,
      platformListingId,
      status: 'active',
      url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      price,
      currency,
      title,
      lastCheckedAt: new Date().toISOString()
    };

    await FirestoreService.saveListing(listing);
    return listing;
  }

  // Listing-Status aktualisieren
  async updateListingStatus(
    listingId: string,
    status: 'active' | 'sold' | 'expired' | 'ended' | 'deleted',
    additionalData?: {
      views?: number;
      watchCount?: number;
    }
  ): Promise<void> {
    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
      ...additionalData
    };

    await FirestoreService.updateListing(listingId, updateData);

    // Wenn verkauft, Verkaufstransaktion erstellen
    if (status === 'sold') {
      await this.createSaleTransaction(listingId);
    }
  }

  // Verkaufstransaktion erstellen
  private async createSaleTransaction(listingId: string): Promise<void> {
    const listing = await FirestoreService.getListing(listingId);
    if (!listing) return;

    // Berechne Gebühren basierend auf Plattform
    const fees = this.calculatePlatformFees(listing.platform, listing.price, listing.currency);
    const commission = this.calculateCommission(listing.price);

    const transaction: SaleTransaction = {
      id: `sale_${listingId}_${Date.now()}`,
      userId: listing.userId,
      listingId,
      platform: listing.platform,
      salePrice: listing.price,
      currency: listing.currency,
      fees,
      netAmount: listing.price - fees,
      commission,
      soldAt: new Date().toISOString(),
      paymentStatus: 'pending',
      shippingStatus: 'not_shipped'
    };

    await FirestoreService.saveSaleTransaction(transaction);
  }

  // Plattform-Gebühren berechnen
  private calculatePlatformFees(platform: string, price: number, currency: string): number {
    // Vereinfachte Gebührenberechnung
    switch (platform) {
      case 'ebay':
        // eBay: 10% + 0.35€ pro Verkauf
        return price * 0.1 + 0.35;
      case 'facebook-marketplace':
        // Facebook: 5% (geschätzt)
        return price * 0.05;
      case 'ebay-kleinanzeigen':
        // Kleinanzeigen: kostenlos
        return 0;
      default:
        return 0;
    }
  }

  // Provision berechnen (für unsere Plattform)
  private calculateCommission(price: number): number {
    // 2% Provision für erfolgreiche Verkäufe
    return price * 0.02;
  }

  // Verkaufs-Metriken abrufen
  async getSalesMetrics(userId: string, startDate?: string, endDate?: string): Promise<SalesMetrics> {
    const listings = await FirestoreService.getUserListings(userId, startDate, endDate);
    const transactions = await FirestoreService.getUserSaleTransactions(userId, startDate, endDate);

    const totalRevenue = transactions.reduce((sum, t) => sum + t.salePrice, 0);
    const totalFees = transactions.reduce((sum, t) => sum + t.fees, 0);
    const totalCommissions = transactions.reduce((sum, t) => sum + (t.commission || 0), 0);

    const soldListings = listings.filter(l => l.status === 'sold').length;
    const activeListings = listings.filter(l => l.status === 'active').length;

    // Durchschnittliche Verkaufszeit berechnen
    const soldTransactions = transactions.filter(t => t.soldAt);
    const avgTimeToSell = soldTransactions.length > 0
      ? soldTransactions.reduce((sum, t) => {
          const listing = listings.find(l => l.id === t.listingId);
          if (listing) {
            const timeDiff = new Date(t.soldAt).getTime() - new Date(listing.createdAt).getTime();
            return sum + (timeDiff / (1000 * 60 * 60 * 24)); // in Tagen
          }
          return sum;
        }, 0) / soldTransactions.length
      : 0;

    // Top-Kategorien (würde aus Analysis-Daten kommen)
    const topCategories: Array<{ category: string; sales: number; revenue: number }> = [];

    // Plattform-Performance
    const platformPerformance = ['ebay', 'facebook-marketplace', 'ebay-kleinanzeigen'].map(platform => {
      const platformListings = listings.filter(l => l.platform === platform);
      const platformSales = transactions.filter(t => t.platform === platform);
      const platformRevenue = platformSales.reduce((sum, t) => sum + t.salePrice, 0);

      return {
        platform,
        listings: platformListings.length,
        sales: platformSales.length,
        revenue: platformRevenue,
        avgTimeToSell: platformSales.length > 0 ? avgTimeToSell : 0
      };
    });

    return {
      totalListings: listings.length,
      activeListings,
      soldListings,
      totalRevenue,
      totalFees,
      netProfit: totalRevenue - totalFees - totalCommissions,
      averageSalePrice: transactions.length > 0 ? totalRevenue / transactions.length : 0,
      averageTimeToSell: avgTimeToSell,
      sellThroughRate: listings.length > 0 ? (soldListings / listings.length) * 100 : 0,
      topCategories,
      platformPerformance
    };
  }

  // Preisoptimierung vorschlagen
  async suggestPriceOptimization(listingId: string, analysis?: AdAnalysis): Promise<PriceOptimization | null> {
    const listing = await FirestoreService.getListing(listingId);
    if (!listing || listing.status !== 'active') return null;

    try {
      // Sammle historische Verkaufsdaten für ähnliche Produkte
      const similarTransactions = await this.getSimilarSaleTransactions(listing, analysis);

      // Sammle Marktdaten (vereinfacht - würde normalerweise von APIs kommen)
      const marketData = await this.getMarketData('Elektronik'); // Standard-Kategorie

      // Verwende KI für Preisoptimierung
      const aiOptimization = await optimizePriceWithAI(
        analysis || await this.getAnalysisFromListing(listing),
        similarTransactions,
        marketData
      );

      const optimization: PriceOptimization = {
        id: `opt_${listingId}_${Date.now()}`,
        listingId,
        currentPrice: listing.price,
        suggestedPrice: aiOptimization.suggestedPrice,
        reasoning: aiOptimization.reasoning,
        confidence: aiOptimization.confidence,
        marketData: {
          similarItems: marketData.map(item => ({
            price: item.price,
            condition: item.condition,
            soldDate: undefined // Marktdaten sind aktuelle Listings
          })),
          averagePrice: aiOptimization.marketAnalysis.averagePrice,
          priceRange: aiOptimization.marketAnalysis.priceRange
        },
        createdAt: new Date().toISOString()
      };

      return optimization;

    } catch (error) {
      console.error('KI-Preisoptimierung fehlgeschlagen, verwende Fallback:', error);

      // Fallback zur einfachen Logik
      const suggestedPrice = listing.price * 0.95;
      const confidence = 0.7;

      const optimization: PriceOptimization = {
        id: `opt_${listingId}_${Date.now()}`,
        listingId,
        currentPrice: listing.price,
        suggestedPrice,
        reasoning: 'Basierend auf Markttrends und Verkaufsperformance wird ein Preisnachlass empfohlen.',
        confidence,
        createdAt: new Date().toISOString()
      };

      return optimization;
    }
  }

  // Hilfsmethoden für Preisoptimierung

  private async getSimilarSaleTransactions(listing: PlatformListing, analysis?: AdAnalysis): Promise<Array<{
    price: number;
    soldAt: string;
    timeToSell: number;
  }>> {
    // Finde ähnliche Transaktionen (vereinfacht)
    const allTransactions = await FirestoreService.getUserSaleTransactions(listing.userId);

    return allTransactions
      .filter(t => t.platform === listing.platform)
      .slice(-10) // Letzte 10 Verkäufe
      .map(t => ({
        price: t.salePrice,
        soldAt: t.soldAt,
        timeToSell: this.calculateTimeToSell(t.listingId, t.soldAt)
      }));
  }

  private async getMarketData(category: string): Promise<Array<{
    title: string;
    price: number;
    condition: string;
    platform: string;
  }>> {
    // Vereinfachte Marktdaten (würde normalerweise von APIs kommen)
    // Für Demo-Zwecke generieren wir simulierte Daten
    const mockData = [
      { title: 'Ähnliches Produkt A', price: 45, condition: 'Gut', platform: 'ebay' },
      { title: 'Ähnliches Produkt B', price: 52, condition: 'Sehr gut', platform: 'ebay' },
      { title: 'Ähnliches Produkt C', price: 38, condition: 'Gut', platform: 'facebook-marketplace' },
    ];

    return mockData;
  }

  private async getAnalysisFromListing(listing: PlatformListing): Promise<AdAnalysis> {
    // Vereinfacht - würde normalerweise aus der History kommen
    return {
      item_detected: true,
      title: listing.title,
      price_estimate: `${listing.price}€`,
      condition: 'Gut', // Default
      category: 'Unbekannt', // Würde aus History kommen
      description: 'Produktbeschreibung',
      keywords: [],
      reasoning: 'Aus Listing-Daten generiert'
    };
  }

  private calculateTimeToSell(listingId: string, soldAt: string): number {
    // Vereinfacht - würde die Listing-Erstellungszeit brauchen
    return 7; // 7 Tage als Default
  }

  // Polling für Listing-Updates (Alternative zu Webhooks)
  async pollListings(userId: string): Promise<void> {
    const listings = await FirestoreService.getUserListings(userId);

    for (const listing of listings) {
      if (listing.status === 'active') {
        try {
          // Hier würde der Status von der Plattform abgefragt werden
          // await this.checkListingStatus(listing);
        } catch (error) {
          console.error(`Fehler beim Polling von Listing ${listing.id}:`, error);
        }
      }
    }
  }

  // Einzelnes Listing von Plattform prüfen
  private async checkListingStatus(listing: PlatformListing): Promise<void> {
    // Hier würde die Plattform-API aufgerufen werden
    // Für Demo-Zwecke simulieren wir gelegentliche Verkäufe
    if (Math.random() < 0.05) { // 5% Chance pro Check
      await this.updateListingStatus(listing.id, 'sold');
    }
  }
}

// Singleton-Instanz
export const salesTrackingService = SalesTrackingService.getInstance();