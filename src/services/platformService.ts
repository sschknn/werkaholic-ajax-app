import { AdAnalysis } from '../types/v1/types';
import eBayApi from 'ebay-node-api';

// Authentifizierungs-Tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

// Plattform-Konfiguration
export interface PlatformConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  appId?: string; // Für Facebook
  redirectUri?: string;
}

// Unterstützte Plattformen
export const PLATFORMS = {
  EBAY_KLEINANZEIGEN: 'ebay-kleinanzeigen',
  EBAY: 'ebay',
  FACEBOOK_MARKETPLACE: 'facebook-marketplace'
} as const;

export type PlatformType = typeof PLATFORMS[keyof typeof PLATFORMS];

// Plattform-spezifische Anforderungen
export interface PlatformRequirements {
  titleMaxLength: number;
  descriptionMaxLength: number;
  maxImages: number;
  allowedCategories: string[];
  priceFormat: 'decimal' | 'integer';
  currency: string;
}

// Anzeige-Status
export interface ListingStatus {
  id: string;
  platform: PlatformType;
  status: 'draft' | 'published' | 'sold' | 'expired' | 'deleted';
  url?: string;
  error?: string;
}

// Service-Klasse für Plattform-Integrationen
export class PlatformService {
  private configs: Map<PlatformType, PlatformConfig> = new Map();
  private tokens: Map<PlatformType, AuthTokens> = new Map();
  private ebayApi: eBayApi | null = null;

  constructor() {
    this.initializeConfigs();
    this.initializeEbayApi();
  }

  private initializeEbayApi() {
    const ebayConfig = this.configs.get(PLATFORMS.EBAY);
    if (ebayConfig?.clientId && ebayConfig?.clientSecret) {
      this.ebayApi = new eBayApi({
        clientId: ebayConfig.clientId,
        clientSecret: ebayConfig.clientSecret,
        env: 'PRODUCTION', // oder 'SANDBOX' für Tests
        redirectUri: ebayConfig.redirectUri
      });
    }
  }

  private initializeConfigs() {
    // eBay Kleinanzeigen (Deutschland) - Keine öffentliche API verfügbar
    this.configs.set(PLATFORMS.EBAY_KLEINANZEIGEN, {
      name: 'eBay Kleinanzeigen',
      baseUrl: 'https://www.ebay-kleinanzeigen.de',
      clientId: (import.meta as any).env?.VITE_EBAY_KLEINANZEIGEN_CLIENT_ID,
      clientSecret: (import.meta as any).env?.VITE_EBAY_KLEINANZEIGEN_CLIENT_SECRET,
      redirectUri: (import.meta as any).env?.VITE_EBAY_KLEINANZEIGEN_REDIRECT_URI
    });

    // eBay (international)
    this.configs.set(PLATFORMS.EBAY, {
      name: 'eBay',
      baseUrl: 'https://api.ebay.com',
      clientId: (import.meta as any).env?.VITE_EBAY_CLIENT_ID,
      clientSecret: (import.meta as any).env?.VITE_EBAY_CLIENT_SECRET,
      redirectUri: (import.meta as any).env?.VITE_EBAY_REDIRECT_URI
    });

    // Facebook Marketplace
    this.configs.set(PLATFORMS.FACEBOOK_MARKETPLACE, {
      name: 'Facebook Marketplace',
      baseUrl: 'https://graph.facebook.com',
      appId: (import.meta as any).env?.VITE_FACEBOOK_APP_ID,
      redirectUri: (import.meta as any).env?.VITE_FACEBOOK_REDIRECT_URI
    });
  }

  // Generiert OAuth-URL für Plattform
  generateAuthUrl(platform: PlatformType, scopes: string[] = []): string {
    const config = this.configs.get(platform);
    if (!config) throw new Error(`Plattform ${platform} nicht konfiguriert`);

    switch (platform) {
      case PLATFORMS.EBAY:
      case PLATFORMS.EBAY_KLEINANZEIGEN:
        if (!config.clientId || !config.redirectUri) {
          throw new Error(`OAuth-Konfiguration für ${config.name} unvollständig`);
        }
        const ebayScopes = scopes.length > 0 ? scopes : [
          'https://api.ebay.com/oauth/api_scope/sell.inventory'
        ];
        return `https://auth.ebay.com/oauth2/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${ebayScopes.join('%20')}`;

      case PLATFORMS.FACEBOOK_MARKETPLACE:
        if (!config.appId || !config.redirectUri) {
          throw new Error(`Facebook-Konfiguration unvollständig`);
        }
        const fbScopes = scopes.length > 0 ? scopes : ['email', 'pages_manage_posts', 'pages_show_list'];
        return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${fbScopes.join(',')}&response_type=code`;

      default:
        throw new Error(`Authentifizierung für ${platform} nicht unterstützt`);
    }
  }

  // Tauscht Authorization Code gegen Access Token
  async exchangeCodeForToken(platform: PlatformType, code: string): Promise<AuthTokens> {
    const config = this.configs.get(platform);
    if (!config) throw new Error(`Plattform ${platform} nicht konfiguriert`);

    try {
      switch (platform) {
        case PLATFORMS.EBAY:
        case PLATFORMS.EBAY_KLEINANZEIGEN: {
          const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code,
              redirect_uri: config.redirectUri!
            })
          });

          if (!response.ok) {
            throw new Error(`eBay Token-Austausch fehlgeschlagen: ${response.statusText}`);
          }

          const data = await response.json();
          const tokens: AuthTokens = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: Date.now() + (data.expires_in * 1000)
          };

          this.tokens.set(platform, tokens);
          return tokens;
        }

        case PLATFORMS.FACEBOOK_MARKETPLACE: {
          const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri!)}&client_secret=${config.clientSecret}&code=${code}`, {
            method: 'GET'
          });

          if (!response.ok) {
            throw new Error(`Facebook Token-Austausch fehlgeschlagen: ${response.statusText}`);
          }

          const data = await response.json();
          const tokens: AuthTokens = {
            accessToken: data.access_token,
            expiresAt: Date.now() + (data.expires_in * 1000)
          };

          this.tokens.set(platform, tokens);
          return tokens;
        }

        default:
          throw new Error(`Token-Austausch für ${platform} nicht unterstützt`);
      }
    } catch (error) {
      console.error(`Fehler beim Token-Austausch für ${platform}:`, error);
      throw error;
    }
  }

  // Refresh Token für eBay/Facebook
  async refreshToken(platform: PlatformType): Promise<AuthTokens> {
    const config = this.configs.get(platform);
    const currentTokens = this.tokens.get(platform);

    if (!config || !currentTokens?.refreshToken) {
      throw new Error(`Keine Refresh-Token verfügbar für ${platform}`);
    }

    try {
      switch (platform) {
        case PLATFORMS.EBAY:
        case PLATFORMS.EBAY_KLEINANZEIGEN: {
          const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: currentTokens.refreshToken
            })
          });

          if (!response.ok) {
            throw new Error(`eBay Token-Refresh fehlgeschlagen: ${response.statusText}`);
          }

          const data = await response.json();
          const tokens: AuthTokens = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || currentTokens.refreshToken,
            expiresAt: Date.now() + (data.expires_in * 1000)
          };

          this.tokens.set(platform, tokens);
          return tokens;
        }

        case PLATFORMS.FACEBOOK_MARKETPLACE: {
          // Facebook verwendet long-lived tokens, Refresh funktioniert nicht wie eBay
          throw new Error(`Facebook Token-Refresh nicht unterstützt (long-lived tokens)`);
        }

        default:
          throw new Error(`Token-Refresh für ${platform} nicht unterstützt`);
      }
    } catch (error) {
      console.error(`Fehler beim Token-Refresh für ${platform}:`, error);
      throw error;
    }
  }

  // Prüft ob Token gültig ist und refresht falls nötig
  async ensureValidToken(platform: PlatformType): Promise<string> {
    const tokens = this.tokens.get(platform);
    if (!tokens) {
      throw new Error(`Keine Tokens für ${platform} verfügbar`);
    }

    if (tokens.expiresAt && Date.now() > tokens.expiresAt - 60000) { // 1 Minute Puffer
      await this.refreshToken(platform);
      return this.tokens.get(platform)!.accessToken;
    }

    return tokens.accessToken;
  }

  // Plattform-Anforderungen abrufen
  getPlatformRequirements(platform: PlatformType): PlatformRequirements {
    const requirements: Record<PlatformType, PlatformRequirements> = {
      [PLATFORMS.EBAY_KLEINANZEIGEN]: {
        titleMaxLength: 75,
        descriptionMaxLength: 5000,
        maxImages: 30,
        allowedCategories: ['Elektronik', 'Mode', 'Haus & Garten', 'Auto & Motorrad', 'Sport & Freizeit'],
        priceFormat: 'decimal',
        currency: 'EUR'
      },
      [PLATFORMS.EBAY]: {
        titleMaxLength: 80,
        descriptionMaxLength: 50000,
        maxImages: 24,
        allowedCategories: ['Electronics', 'Fashion', 'Home & Garden', 'Vehicles', 'Sports'],
        priceFormat: 'decimal',
        currency: 'EUR'
      },
      [PLATFORMS.FACEBOOK_MARKETPLACE]: {
        titleMaxLength: 60,
        descriptionMaxLength: 10000,
        maxImages: 10,
        allowedCategories: ['Electronics', 'Clothing', 'Home', 'Vehicles', 'Sports'],
        priceFormat: 'decimal',
        currency: 'EUR'
      }
    };

    return requirements[platform];
  }

  // Anzeige für Plattform optimieren
  optimizeForPlatform(analysis: AdAnalysis, platform: PlatformType): AdAnalysis {
    const requirements = this.getPlatformRequirements(platform);
    const optimized = { ...analysis };

    // Titel kürzen falls nötig
    if (optimized.title.length > requirements.titleMaxLength) {
      optimized.title = optimized.title.substring(0, requirements.titleMaxLength - 3) + '...';
    }

    // Beschreibung kürzen falls nötig
    if (optimized.description.length > requirements.descriptionMaxLength) {
      optimized.description = optimized.description.substring(0, requirements.descriptionMaxLength - 3) + '...';
    }

    // Preis formatieren
    if (requirements.priceFormat === 'integer') {
      optimized.price_estimate = Math.round(parseFloat(optimized.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.'))).toString() + '€';
    }

    // Plattform-spezifische Keywords hinzufügen
    optimized.keywords = this.addPlatformKeywords(optimized.keywords, platform);

    return optimized;
  }

  // Plattform-spezifische Keywords hinzufügen
  private addPlatformKeywords(keywords: string[], platform: PlatformType): string[] {
    const platformKeywords: Record<PlatformType, string[]> = {
      [PLATFORMS.EBAY_KLEINANZEIGEN]: ['gebraucht', 'second-hand', 'deutschland'],
      [PLATFORMS.EBAY]: ['used', 'pre-owned', 'germany'],
      [PLATFORMS.FACEBOOK_MARKETPLACE]: ['used', 'second hand', 'local pickup']
    };

    return [...keywords, ...platformKeywords[platform]];
  }

  // Verfügbare Plattformen auflisten
  getAvailablePlatforms() {
    return Array.from(this.configs.entries()).map(([id, config]) => ({
      id,
      name: config.name,
      available: this.isPlatformConfigured(id),
      authenticated: this.isPlatformAuthenticated(id)
    }));
  }

  // Prüft ob Plattform konfiguriert ist
  private isPlatformConfigured(platform: PlatformType): boolean {
    const config = this.configs.get(platform);
    if (!config) return false;

    switch (platform) {
      case PLATFORMS.EBAY:
      case PLATFORMS.EBAY_KLEINANZEIGEN:
        return !!(config.clientId && config.clientSecret && config.redirectUri);
      case PLATFORMS.FACEBOOK_MARKETPLACE:
        return !!(config.appId && config.redirectUri);
      default:
        return false;
    }
  }

  // Prüft ob Plattform authentifiziert ist
  private isPlatformAuthenticated(platform: PlatformType): boolean {
    const tokens = this.tokens.get(platform);
    return !!(tokens && tokens.accessToken && (!tokens.expiresAt || tokens.expiresAt > Date.now()));
  }

  // Token für Plattform setzen (für manuelle Token-Eingabe)
  setTokens(platform: PlatformType, tokens: AuthTokens): void {
    this.tokens.set(platform, tokens);
  }

  // Token für Plattform entfernen
  private removeTokens(platform: PlatformType): void {
      this.tokens.delete(platform);
    }

    // Auflisten eines Artikels delisten
    async delistListing(listingId: string, platform: PlatformType): Promise<ListingStatus> {
      const status = await this.checkListingStatus(listingId, platform);
      if (status.status === 'published') {
        return await this.delistListingFromEbay(listingId);
      }
      return status;
    }

    // Artikel beim eBay delisten
    private async delistListingFromEbay(listingId: string): Promise<ListingStatus> {
      if (!this.ebayApi) {
        throw new Error('eBay API nicht initialisiert.');
      }
      const accessToken = await this.ensureValidToken(PLATFORMS.EBAY);
      this.ebayApi.OAuth2.setCredentials(accessToken);
      try {
        // eBay API: Inventory Item entfernen
        const sku = listingId.replace('ebay-', '');
        await this.ebayApi.del('sell/inventory/v1/inventory_item/' + sku, {
          'Content-Language': 'de-DE'
        });
        return {
          id: listingId,
          platform: PLATFORMS.EBAY,
          status: 'deleted',
          url: null,
          error: null
        };
      } catch (error: any) {
        console.error('eBay Delisting Fehler:', error);
        return {
          id: listingId,
          platform: PLATFORMS.EBAY,
          status: 'deleted',
          error: error instanceof Error ? error.message : 'Unbekannter Fehler'
        };
      }
    }

    // Aktueller Preis eines Artikels abfragen
    async getListingPrice(listingId: string, platform: PlatformType): Promise<{ price: number; currency: string } | null> {
      const status = await this.checkListingStatus(listingId, platform);
      if (status.error) return null;
      const priceStr = status.error ? null : status.error; // placeholder
      // Einfacher Platzhalter - echte Implementation würde API-Call nutzen
      return null;
    }

    // Verkäufer-Informationen abfragen
    async getSellerInfo(platform: PlatformType): Promise<{ sellerId: string; feedbackScore: number; ratingPercentage: number } | null> {
      // Implementation hängt von der Plattform-API ab
      // Für jetzt: Platzhalter-Rückgabe
      return null;
    }

    // Erweiterte Preisoptimierung mit eBay-Marktdaten
    async getMarketPriceOptimization(
      analysis: AdAnalysis,
      listingId: string
    ): Promise<{ suggestedPrice: number; confidence: number; marketData: any } | null> {
      // Integriert eBay Marktdaten in die Preisoptimierung
      // Platzhalter-Implementierung
      const currentPrice = parseFloat(analysis.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      return {
        suggestedPrice: currentPrice * 0.95, // 5% Rabatt
        confidence: 0.7,
        marketData: {
          averagePrice: currentPrice,
          priceRange: { min: currentPrice * 0.8, max: currentPrice * 1.2 },
          recentSales: []
        }
      };
    }
  }

// Singleton-Instanz
export const platformService = new PlatformService();