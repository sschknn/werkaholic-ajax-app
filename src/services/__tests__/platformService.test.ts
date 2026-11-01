import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  platformService,
  PLATFORMS,
  PlatformType,
  AuthTokens,
  PlatformConfig,
  ListingStatus
} from '../platformService';

const mockAnalysis = {
  item_detected: true,
  title: 'Test Produkt',
  price_estimate: '50€ - 70€',
  condition: 'Gut',
  category: 'Elektronik',
  description: 'Test Beschreibung',
  keywords: ['test', 'produkt'],
  reasoning: 'Test Reasoning',
};

const mockEbayConfig = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  redirectUri: 'https://example.com/callback',
};

const mockFacebookConfig = {
  appId: 'test-facebook-app-id',
  redirectUri: 'https://example.com/facebook/callback',
};

const mockAuthTokens: AuthTokens = {
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  expiresAt: Date.now() + 3600000,
};

describe('Platform Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PLATFORMS constants', () => {
    it('should have all platform constants defined', () => {
      expect(PLATFORMS.EBAY_KLEINANZEIGEN).toBe('ebay-kleinanzeigen');
      expect(PLATFORMS.EBAY).toBe('ebay');
      expect(PLATFORMS.FACEBOOK_MARKETPLACE).toBe('facebook-marketplace');
    });

    it('PlatformType should be a valid type', () => {
      const platforms: PlatformType[] = ['ebay-kleinanzeigen', 'ebay', 'facebook-marketplace'];
      expect(platforms).toHaveLength(3);
    });
  });

  describe('PlatformService class', () => {
    let service: ReturnType<typeof platformService>;

    beforeEach(() => {
      service = new (platformService.constructor as any)();
    });

    describe('initializeConfigs', () => {
      it('should set up eBay Kleinanzeigen configuration', () => {
        const config = service['configs'].get(PLATFORMS.EBAY_KLEINANZEIGEN);
        expect(config).toBeDefined();
        expect(config?.name).toBe('eBay Kleinanzeigen');
        expect(config?.baseUrl).toBe('https://www.ebay-kleinanzeigen.de');
      });

      it('should set up eBay configuration', () => {
        const config = service['configs'].get(PLATFORMS.EBAY);
        expect(config).toBeDefined();
        expect(config?.name).toBe('eBay');
        expect(config?.baseUrl).toBe('https://api.ebay.com');
      });

      it('should set up Facebook Marketplace configuration', () => {
        const config = service['configs'].get(PLATFORMS.FACEBOOK_MARKETPLACE);
        expect(config).toBeDefined();
        expect(config?.name).toBe('Facebook Marketplace');
        expect(config?.baseUrl).toBe('https://graph.facebook.com');
      });
    });

    describe('generateAuthUrl', () => {
      it('should generate eBay Kleinanzeigen OAuth URL', () => {
        process.env.VITE_EBAY_KLEINANZEIGEN_CLIENT_ID = 'test-id';
        process.env.VITE_EBAY_KLEINANZEIGEN_REDIRECT_URI = 'https://example.com/callback';

        const url = service['generateAuthUrl'](PLATFORMS.EBAY_KLEINANZEIGEN);
        expect(url).toContain('auth.ebay.com');
        expect(url).toContain('client_id=test-id');
        expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback');
      });

      it('should generate Facebook OAuth URL', () => {
        process.env.VITE_FACEBOOK_APP_ID = 'test-fb-app-id';
        process.env.VITE_FACEBOOK_REDIRECT_URI = 'https://example.com/facebook/callback';

        const url = service['generateAuthUrl'](PLATFORMS.FACEBOOK_MARKETPLACE);
        expect(url).toContain('graph.facebook.com');
        expect(url).toContain('client_id=test-fb-app-id');
        expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Ffacebook%2Fcallback');
      });

      it('should throw for unconfigured platform', () => {
        expect(() =>
          service['generateAuthUrl']('unknown-platform' as any)
        ).toThrow('Plattform unknown-platform nicht konfiguriert');
      });
    });

    describe('exchangeCodeForToken', () => {
      beforeEach(() => {
        process.env.VITE_EBAY_KLEINANZEIGEN_CLIENT_ID = 'test-id';
        process.env.VITE_EBAY_KLEINANZEIGEN_CLIENT_SECRET = 'test-secret';
        process.env.VITE_EBAY_KLEINANZEIGEN_REDIRECT_URI = 'https://example.com/callback';
      });

      it('should exchange eBay authorization code for tokens', async () => {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            access_token: 'new-token',
            refresh_token: 'new-refresh-token',
            expires_in: 3600,
          }),
        } as Response);

        const tokens = await service['exchangeCodeForToken'](PLATFORMS.EBAY_KLEINANZEIGEN, 'test-code');

        expect(tokens.accessToken).toBe('new-token');
        expect(tokens.refreshToken).toBe('new-refresh-token');
        expect(tokens.expiresAt).toBeDefined();
      });

      it('should exchange Facebook authorization code for tokens', async () => {
        process.env.VITE_FACEBOOK_APP_ID = 'test-fb-app-id';
        process.env.VITE_FACEBOOK_CLIENT_SECRET = 'test-fb-secret';
        process.env.VITE_FACEBOOK_REDIRECT_URI = 'https://example.com/facebook/callback';

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            access_token: 'fb-token',
            expires_in: 7200,
          }),
        } as Response);

        const tokens = await service['exchangeCodeForToken'](PLATFORMS.FACEBOOK_MARKETPLACE, 'test-code');

        expect(tokens.accessToken).toBe('fb-token');
        expect(tokens.expiresAt).toBeDefined();
      });
    });

    describe('refreshToken', () => {
      beforeEach(() => {
        process.env.VITE_EBAY_KLEINANZEIGEN_CLIENT_ID = 'test-id';
        process.env.VITE_EBAY_KLEINANZEIGEN_CLIENT_SECRET = 'test-secret';
        process.env.VITE_EBAY_KLEINANZEIGEN_REDIRECT_URI = 'https://example.com/callback';
        service['setTokens'](PLATFORMS.EBAY_KLEINANZEIGEN, mockAuthTokens);
      });

      it('should refresh eBay token', async () => {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            access_token: 'refreshed-token',
            refresh_token: 'new-refresh-token',
            expires_in: 3600,
          }),
        } as Response);

        const tokens = await service['refreshToken'](PLATFORMS.EBAY_KLEINANZEIGEN);

        expect(tokens.accessToken).toBe('refreshed-token');
        expect(this.tokens.get(PLATFORMS.EBAY_KLEINANZEIGEN)?.accessToken).toBe('refreshed-token');
      });

      it('should throw when no refresh token available', () => {
        service['removeTokens'](PLATFORMS.EBAY_KLEINANZEIGEN);
        expect(() =>
          service['refreshToken'](PLATFORMS.EBAY_KLEINANZEIGEN)
        ).toThrow('Keine Refresh-Token verfügbar für eBay-kleinanzeigen');
      });
    });

    describe('ensureValidToken', () => {
      it('should return access token when still valid', () => {
        service['setTokens'](PLATFORMS.EBAY_KLEINANZEIGEN, {
          ...mockAuthTokens,
          expiresAt: Date.now() + 3600000,
        });

        const token = service['ensureValidToken'](PLATFORMS.EBAY_KLEINANZEIGEN);
        expect(token).toBe('test-access-token');
      });

      it('should refresh token when near expiration', async () => {
        service['setTokens'](PLATFORMS.EBAY_KLEINANZEIGEN, {
          ...mockAuthTokens,
          expiresAt: Date.now() - 1000,
        });

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            access_token: 'refreshed-token',
            refresh_token: 'new-refresh-token',
            expires_in: 3600,
          }),
        } as Response);

        const token = service['ensureValidToken'](PLATFORMS.EBAY_KLEINANZEIGEN);
        expect(token).toBe('refreshed-token');
      });
    });

    describe('getPlatformRequirements', () => {
      it('should return eBay Kleinanzeigen requirements', () => {
        const requirements = service['getPlatformRequirements'](PLATFORMS.EBAY_KLEINANZEIGEN);
        expect(requirements.titleMaxLength).toBe(75);
        expect(requirements.descriptionMaxLength).toBe(5000);
        expect(requirements.maxImages).toBe(30);
        expect(requirements.allowedCategories).toContain('Elektronik');
        expect(requirements.priceFormat).toBe('decimal');
        expect(requirements.currency).toBe('EUR');
      });

      it('should return eBay requirements', () => {
        const requirements = service['getPlatformRequirements'](PLATFORMS.EBAY);
        expect(requirements.titleMaxLength).toBe(80);
        expect(requirements.descriptionMaxLength).toBe(50000);
        expect(requirements.maxImages).toBe(24);
        expect(requirements.allowedCategories).toContain('Electronics');
        expect(requirements.priceFormat).toBe('decimal');
        expect(requirements.currency).toBe('EUR');
      });

      it('should return Facebook Marketplace requirements', () => {
        const requirements = service['getPlatformRequirements'](PLATFORMS.FACEBOOK_MARKETPLACE);
        expect(requirements.titleMaxLength).toBe(60);
        expect(requirements.descriptionMaxLength).toBe(10000);
        expect(requirements.maxImages).toBe(10);
        expect(requirements.allowedCategories).toContain('Electronics');
        expect(requirements.priceFormat).toBe('decimal');
        expect(requirements.currency).toBe('EUR');
      });

      it('should throw for unknown platform', () => {
        expect(() =>
          service['getPlatformRequirements']('unknown-platform' as any)
        ).toThrow();
      });
    });

    describe('optimizeForPlatform', () => {
      it('should truncate title to max length with ellipsis', () => {
        const longTitle = 'This is a very long title that exceeds the maximum length';
        const analysis = {
          ...mockAnalysis,
          title: longTitle,
          description: 'Test description',
          keywords: ['test'],
        };

        const result = service['optimizeForPlatform'](analysis, PLATFORMS.EBAY_KLEINANZEIGEN);
        expect(result.title.length).toBeLessThanOrEqual(78);
        expect(result.title).toEndWith('...');
      });

      it('should truncate description to max length with ellipsis', () => {
        const longDesc = 'This is a very long description that exceeds the maximum length for the platform';
        const analysis = {
          ...mockAnalysis,
          title: 'Short Title',
          description: longDesc,
          keywords: ['test'],
        };

        const result = service['optimizeForPlatform'](analysis, PLATFORMS.EBAY_KLEINANZEIGEN);
        expect(result.description.length).toBeLessThanOrEqual(4997);
        expect(result.description).toEndWith('...');
      });

      it('should add platform-specific keywords for eBay Kleinanzeigen', () => {
        const analysis = {
          ...mockAnalysis,
          title: 'Test',
          description: 'Test',
          keywords: ['original'],
        };

        const result = service['optimizeForPlatform'](analysis, PLATFORMS.EBAY_KLEINANZEIGEN);
        expect(result.keywords).toContain('gebraucht');
        expect(result.keywords).toContain('second-hand');
        expect(result.keywords).toContain('deutschland');
        expect(result.keywords).toContain('original');
      });

      it('should add eBay keywords', () => {
        const analysis = {
          ...mockAnalysis,
          title: 'Test',
          description: 'Test',
          keywords: ['original'],
        };

        const result = service['optimizeForPlatform'](analysis, PLATFORMS.EBAY);
        expect(result.keywords).toContain('used');
        expect(result.keywords).toContain('pre-owned');
        expect(result.keywords).toContain('germany');
      });

      it('should add Facebook Marketplace keywords', () => {
        const analysis = {
          ...mockAnalysis,
          title: 'Test',
          description: 'Test',
          keywords: ['original'],
        };

        const result = service['optimizeForPlatform'](analysis, PLATFORMS.FACEBOOK_MARKETPLACE);
        expect(result.keywords).toContain('used');
        expect(result.keywords).toContain('second hand');
        expect(result.keywords).toContain('local pickup');
      });
    });

    describe('getAvailablePlatforms', () => {
      it('should return available platforms with configuration and auth status', () => {
        process.env.VITE_EBAY_KLEINANZEIGEN_CLIENT_ID = 'test-id';
        process.env.VITE_EBAY_KLEINANZEIGEN_CLIENT_SECRET = 'test-secret';
        process.env.VITE_EBAY_KLEINANZEIGEN_REDIRECT_URI = 'https://example.com/callback';

        const available = service['getAvailablePlatforms']();

        expect(available).toHaveLength(3);
        expect(available.some(p => p.id === PLATFORMS.EBAY_KLEINANZEIGEN)).toBe(true);
        expect(available.find(p => p.id === PLATFORMS.EBAY_KLEINANZEIGEN)?.available).toBe(true);
      });

      it('should show unauthenticated status when no tokens', () => {
        const available = service['getAvailablePlatforms']();
        const kbv = available.find(p => p.id === PLATFORMS.EBAY_KLEINANZEIGEN);
        expect(kbv?.authenticated).toBe(false);
      });
    });

    describe('isPlatformConfigured', () => {
      it('should return true when eBay Kleinanzeigen is fully configured', () => {
        process.env.VITE_EBAY_KLEINANZEIGEN_CLIENT_ID = 'test-id';
        process.env.VITE_EBAY_KLEINANZEIGEN_CLIENT_SECRET = 'test-secret';
        process.env.VITE_EBAY_KLEINANZEIGEN_REDIRECT_URI = 'https://example.com/callback';

        expect(service['isPlatformConfigured'](PLATFORMS.EBAY_KLEINANZEIGEN)).toBe(true);
      });

      it('should return false when eBay Kleinanzeigen missing clientSecret', () => {
        process.env.VITE_EBAY_KLEINANZEIGEN_CLIENT_ID = 'test-id';
        delete process.env.VITE_EBAY_KLEINANZEIGEN_CLIENT_SECRET;

        expect(service['isPlatformConfigured'](PLATFORMS.EBAY_KLEINANZEIGEN)).toBe(false);
      });

      it('should return true when Facebook Marketplace is fully configured', () => {
        process.env.VITE_FACEBOOK_APP_ID = 'test-app-id';
        process.env.VITE_FACEBOOK_REDIRECT_URI = 'https://example.com/callback';

        expect(service['isPlatformConfigured'](PLATFORMS.FACEBOOK_MARKETPLACE)).toBe(true);
      });
    });

    describe('isPlatformAuthenticated', () => {
      it('should return true when platform has valid access token', () => {
        service['setTokens'](PLATFORMS.EBAY_KLEINANZEIGEN, {
          accessToken: 'valid-token',
          expiresAt: Date.now() + 3600000,
        });

        expect(service['isPlatformAuthenticated'](PLATFORMS.EBAY_KLEINANZEIGEN)).toBe(true);
      });

      it('should return false when platform has expired token', () => {
        service['setTokens'](PLATFORMS.EBAY_KLEINANZEIGEN, {
          accessToken: 'expired-token',
          expiresAt: Date.now() - 1000,
        });

        expect(service['isPlatformAuthenticated'](PLATFORMS.EBAY_KLEINANZEIGEN)).toBe(false);
      });

      it('should return false when no tokens exist', () => {
        service['removeTokens'](PLATFORMS.EBAY_KLEINANZEIGEN);

        expect(service['isPlatformAuthenticated'](PLATFORMS.EBAY_KLEINANZEIGEN)).toBe(false);
      });
    });

    describe('setTokens and removeTokens', () => {
      it('should set tokens for a platform', () => {
        service['setTokens'](PLATFORMS.EBAY_KLEINANZEIGEN, mockAuthTokens);
        expect(service['tokens'].get(PLATFORMS.EBAY_KLEINANZEIGEN)).toEqual(mockAuthTokens);
      });

      it('should remove tokens for a platform', () => {
        service['setTokens'](PLATFORMS.EBAY_KLEINANZEIGEN, mockAuthTokens);
        service['removeTokens'](PLATFORMS.EBAY_KLEINANZEIGEN);
        expect(service['tokens'].has(PLATFORMS.EBAY_KLEINANZEIGEN)).toBe(false);
      });
    });
  });
});