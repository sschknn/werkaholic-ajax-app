import { AdAnalysis } from '../types';
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
  status: 'draft' | 'published' | 'sold' | 'expired';
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

  // Authentifizierung

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
        const ebayScopes = scopes.length > 0 ? scopes : ['https://api.ebay.com/oauth/api_scope/sell.inventory'];
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
          // Facebook verwendet long-lived tokens
          const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.appId}&client_secret=${config.clientSecret}&fb_exchange_token=${currentTokens.accessToken}`, {
            method: 'GET'
          });

          if (!response.ok) {
            throw new Error(`Facebook Token-Refresh fehlgeschlagen: ${response.statusText}`);
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
          throw new Error(`Token-Refresh für ${platform} nicht unterstützt`);
      }
    } catch (error) {
      console.error(`Fehler beim Token-Refresh für ${platform}:`, error);
      throw error;
    }
  }

  // Prüft ob Token gültig ist und refreshed falls nötig
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

  // Anzeige veröffentlichen
  async publishListing(analysis: AdAnalysis, platform: PlatformType, images: string[]): Promise<ListingStatus> {
    const config = this.configs.get(platform);
    if (!config) {
      throw new Error(`Plattform ${platform} nicht konfiguriert`);
    }

    try {
      switch (platform) {
        case PLATFORMS.EBAY:
          return await this.publishToEbay(analysis, images);

        case PLATFORMS.FACEBOOK_MARKETPLACE:
          return await this.publishToFacebook(analysis, images);

        case PLATFORMS.EBAY_KLEINANZEIGEN:
          throw new Error('eBay Kleinanzeigen hat keine öffentliche API. Bitte verwenden Sie die Web-Oberfläche.');

        default:
          throw new Error(`Veröffentlichung auf ${platform} nicht unterstützt`);
      }
    } catch (error) {
      console.error(`Fehler beim Veröffentlichen auf ${platform}:`, error);
      return {
        id: `failed_${Date.now()}`,
        platform,
        status: 'draft',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  // Veröffentlicht auf eBay
  private async publishToEbay(analysis: AdAnalysis, images: string[]): Promise<ListingStatus> {
    if (!this.ebayApi) {
      throw new Error('eBay API nicht initialisiert. Überprüfen Sie die Konfiguration.');
    }

    const accessToken = await this.ensureValidToken(PLATFORMS.EBAY);

    // eBay API mit Token konfigurieren
    this.ebayApi.OAuth2.setCredentials(accessToken);

    // SKU generieren
    const sku = `werkaholic_${Date.now()}`;

    try {
      // Inventory Item erstellen
      const inventoryItem = {
        availability: {
          shipToLocationAvailability: {
            quantity: 1
          }
        },
        condition: this.mapConditionToEbay(analysis.condition),
        product: {
          title: analysis.title,
          description: analysis.description,
          imageUrls: images.slice(0, 24) // eBay erlaubt max 24 Bilder
        }
      };

      await this.ebayApi.post('sell/inventory/v1/inventory_item/' + sku, inventoryItem, {
        'Content-Language': 'de-DE'
      });

      // Offer erstellen
      const price = parseFloat(analysis.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.'));

      const offer = {
        sku,
        marketplaceId: 'EBAY_DE',
        format: 'FIXED_PRICE',
        availableQuantity: 1,
        pricingSummary: {
          price: {
            currency: 'EUR',
            value: price.toString()
          }
        },
        listingDescription: analysis.description,
        merchantLocationKey: 'default',
        categoryId: this.getEbayCategoryId(analysis.category)
      };

      const offerResponse = await this.ebayApi.post('sell/inventory/v1/offer', offer, {
        'Content-Language': 'de-DE'
      });

      const offerData = offerResponse.data;

      // Offer veröffentlichen
      const publishResponse = await this.ebayApi.post(`sell/inventory/v1/offer/${offerData.offerId}/publish`, {}, {
        'Content-Language': 'de-DE'
      });

      const publishData = publishResponse.data;

      return {
        id: publishData.listingId,
        platform: PLATFORMS.EBAY,
        status: 'published',
        url: `https://www.ebay.de/itm/${publishData.listingId}`
      };

    } catch (error: any) {
      console.error('eBay API Fehler:', error);
      throw new Error(`eBay Veröffentlichung fehlgeschlagen: ${error.message || 'Unbekannter Fehler'}`);
    }
  }

  // Hilfsmethode für eBay Kategorie-ID Mapping
  private getEbayCategoryId(category: string): string {
    const categoryMap: Record<string, string> = {
      'Elektronik': '9355', // Consumer Electronics
      'Mode': '11450', // Clothing, Shoes & Accessories
      'Haus & Garten': '11700', // Home & Garden
      'Auto & Motorrad': '6000', // eBay Motors
      'Sport & Freizeit': '159043', // Sporting Goods
      'Sammlerstücke': '1', // Collectibles
      'Bücher': '267', // Books
      'Musik': '11233', // Music
      'Filme': '617', // DVDs & Movies
      'Spielzeug': '220', // Toys & Hobbies
      'Gesundheit & Schönheit': '26395', // Health & Beauty
      'Baby': '2984', // Baby
      'Haustiere': '1281', // Pet Supplies
      'Immobilien': '10542', // Real Estate
      'Dienstleistungen': '176', // Services
      'Sonstiges': '99' // Everything Else
    };

    return categoryMap[category] || '99'; // Default: Everything Else
  }

  // Veröffentlicht auf Facebook Marketplace
  private async publishToFacebook(analysis: AdAnalysis, images: string[]): Promise<ListingStatus> {
    const accessToken = await this.ensureValidToken(PLATFORMS.FACEBOOK_MARKETPLACE);

    // Zuerst Page Access Token für Marketplace bekommen
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`, {
      method: 'GET'
    });

    if (!pagesResponse.ok) {
      throw new Error(`Facebook Pages Abruf fehlgeschlagen: ${pagesResponse.statusText}`);
    }

    const pagesData = await pagesResponse.json();
    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error('Keine Facebook-Seiten gefunden. Sie benötigen eine Facebook-Seite für Marketplace.');
    }

    const pageId = pagesData.data[0].id;
    const pageAccessToken = pagesData.data[0].access_token;

    // Marketplace Listing erstellen
    const listing = {
      availability: 'available',
      category: this.mapCategoryToFacebook(analysis.category),
      condition: this.mapConditionToFacebook(analysis.condition),
      currency: 'EUR',
      description: analysis.description,
      images: images.map(url => ({ url })),
      location: {
        latitude: 52.5200, // Berlin als Default
        longitude: 13.4050
      },
      price: parseFloat(analysis.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')),
      title: analysis.title
    };

    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/marketplace_listings?access_token=${pageAccessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(listing)
    });

    if (!response.ok) {
      throw new Error(`Facebook Marketplace Listing Erstellung fehlgeschlagen: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      platform: PLATFORMS.FACEBOOK_MARKETPLACE,
      status: 'published',
      url: `https://www.facebook.com/marketplace/item/${data.id}`
    };
  }

  // Hilfsmethoden für Mapping
  private mapConditionToEbay(condition: string): string {
    const conditionMap: Record<string, string> = {
      'Neu': 'NEW',
      'Wie neu': 'NEW_OTHER',
      'Sehr gut': 'USED_EXCELLENT',
      'Gut': 'USED_GOOD',
      'Akzeptabel': 'USED_ACCEPTABLE'
    };
    return conditionMap[condition] || 'USED_GOOD';
  }

  private mapConditionToFacebook(condition: string): string {
    const conditionMap: Record<string, string> = {
      'Neu': 'NEW',
      'Wie neu': 'REFURBISHED',
      'Sehr gut': 'USED_GOOD',
      'Gut': 'USED_FAIR',
      'Akzeptabel': 'USED_POOR'
    };
    return conditionMap[condition] || 'USED_GOOD';
  }

  private mapCategoryToFacebook(category: string): string {
    // Vereinfachte Kategorie-Mapping
    const categoryMap: Record<string, string> = {
      'Elektronik': 'electronics',
      'Mode': 'clothing',
      'Haus & Garten': 'home_garden',
      'Auto & Motorrad': 'vehicles',
      'Sport & Freizeit': 'sports_leisure'
    };
    return categoryMap[category] || 'miscellaneous';
  }

  // Anzeige-Status prüfen
  async checkListingStatus(listingId: string, platform: PlatformType): Promise<ListingStatus> {
    try {
      switch (platform) {
        case PLATFORMS.EBAY:
          return await this.checkEbayListingStatus(listingId);

        case PLATFORMS.FACEBOOK_MARKETPLACE:
          return await this.checkFacebookListingStatus(listingId);

        case PLATFORMS.EBAY_KLEINANZEIGEN:
          throw new Error('Status-Prüfung für eBay Kleinanzeigen nicht verfügbar (keine API)');

        default:
          throw new Error(`Status-Prüfung für ${platform} nicht unterstützt`);
      }
    } catch (error) {
      console.error(`Fehler bei Status-Prüfung für ${platform}:`, error);
      return {
        id: listingId,
        platform,
        status: 'draft',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  // Prüft eBay Listing Status
  private async checkEbayListingStatus(listingId: string): Promise<ListingStatus> {
    const accessToken = await this.ensureValidToken(PLATFORMS.EBAY);
    const config = this.configs.get(PLATFORMS.EBAY)!;

    const response = await fetch(`${config.baseUrl}/sell/inventory/v1/inventory_item?sku=${listingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Language': 'de-DE'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          id: listingId,
          platform: PLATFORMS.EBAY,
          status: 'expired'
        };
      }
      throw new Error(`eBay Status-Prüfung fehlgeschlagen: ${response.statusText}`);
    }

    return {
      id: listingId,
      platform: PLATFORMS.EBAY,
      status: 'published',
      url: `https://www.ebay.de/itm/${listingId}`
    };
  }

  // Prüft Facebook Listing Status
  private async checkFacebookListingStatus(listingId: string): Promise<ListingStatus> {
    const accessToken = await this.ensureValidToken(PLATFORMS.FACEBOOK_MARKETPLACE);

    const response = await fetch(`https://graph.facebook.com/v18.0/${listingId}?fields=id,title,status&access_token=${accessToken}`, {
      method: 'GET'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          id: listingId,
          platform: PLATFORMS.FACEBOOK_MARKETPLACE,
          status: 'expired'
        };
      }
      throw new Error(`Facebook Status-Prüfung fehlgeschlagen: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: listingId,
      platform: PLATFORMS.FACEBOOK_MARKETPLACE,
      status: data.status === 'ACTIVE' ? 'published' : 'draft',
      url: `https://www.facebook.com/marketplace/item/${listingId}`
    };
  }

  // Verfügbare Plattformen auflisten
  getAvailablePlatforms(): Array<{ id: PlatformType; name: string; available: boolean; authenticated: boolean }> {
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
  removeTokens(platform: PlatformType): void {
    this.tokens.delete(platform);
  }
}

// Singleton-Instanz
export const platformService = new PlatformService();