import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  analyzeImage,
  setMockAnalyzer,
  getPriceSuggestions,
  removeImageBackground,
  optimizePriceWithAI,
  batchAnalyzeImages,
  clearAnalysisCache,
} from '../geminiService';

const mockBase64 =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD';

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

describe('Gemini AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAnalysisCache();
    setMockAnalyzer(() => Promise.resolve({
      ...mockAnalysis,
      customized: false,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      editCount: 0,
    } as any));
  });

  afterEach(() => {
    vi.clearAllMocks();
    clearAnalysisCache();
  });

  describe('analyzeImage', () => {
    it('should return analysis from mock when useMock=true', async () => {
      const result = await analyzeImage(mockBase64, { useMock: true });
      expect(result.item_detected).toBe(true);
      expect(result.title).toBe('Test Produkt');
    });

    it('should use cache on second call', async () => {
      const result1 = await analyzeImage(mockBase64, { useMock: true, useCache: true });
      const result2 = await analyzeImage(mockBase64, { useMock: true, useCache: true });
      expect(result1.title).toBe(result2.title);
    });

    it('should return default mock when useMock=true but no mock analyzer set', async () => {
      setMockAnalyzer(null);

      const result = await analyzeImage(mockBase64, { useMock: true });
      // Should fall back to basic mock
      expect(result.item_detected).toBe(true);
      expect(result.title).toBe('Unbekanntes Objekt');
    });

    it('should use provided mockAnalyzeImageFn', async () => {
      const customAnalyzer = vi.fn().mockResolvedValue({
        ...mockAnalysis,
        title: 'Custom Title',
        reasoning: 'Custom reasoning',
      });

      setMockAnalyzer(() => customAnalyzer(mockBase64));

      const result = await analyzeImage(mockBase64, { useMock: true });
      expect(result.title).toBe('Custom Title');
      expect(customAnalyzer).toHaveBeenCalledWith(mockBase64);
    });
  });

  describe('getPriceSuggestions', () => {
    it('should return 4 price suggestions', async () => {
      const suggestions = await getPriceSuggestions({
        ...mockAnalysis,
        price_estimate: '50€ - 70€',
      });
      expect(suggestions).toHaveLength(4);
      expect(suggestions[0]).toContain('Schnellverkauf');
      expect(suggestions[1]).toContain('Marktpreis');
      expect(suggestions[2]).toContain('Premium');
      expect(suggestions[3]).toContain('Verhandlung');
    });

    it('should use provided basePrice', async () => {
      const suggestions = await getPriceSuggestions({
        ...mockAnalysis,
        price_estimate: '100€',
      }, 80);
      expect(suggestions.some(s => s.includes('Schnellverkauf'))).toBe(true);
    });

    it('should handle zero price estimate', async () => {
      const suggestions = await getPriceSuggestions({
        ...mockAnalysis,
        price_estimate: '0€',
      });
      expect(suggestions).toHaveLength(4);
    });
  });

  describe('removeImageBackground', () => {
    it('should return the same base64 image (placeholder implementation)', async () => {
      const result = await removeImageBackground(mockBase64);
      expect(result).toBe(mockBase64);
    });
  });

  describe('optimizePriceWithAI', () => {
    it('should return optimized price with reasoning and confidence', async () => {
      const salesHistory = [
        { price: 50, soldAt: '2024-01-15', timeToSell: 30 },
        { price: 55, soldAt: '2024-01-10', timeToSell: 25 },
        { price: 48, soldAt: '2024-01-20', timeToSell: 35 },
      ];

      const result = await optimizePriceWithAI(
        mockAnalysis,
        salesHistory
      );

      expect(result).toHaveProperty('suggestedPrice');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('marketAnalysis');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle empty sales history', async () => {
      const result = await optimizePriceWithAI(
        mockAnalysis,
        []
      );

      expect(result.suggestedPrice).toBeDefined();
      expect(result.marketAnalysis.averagePrice).toBeDefined();
    });
  });

  describe('batchAnalyzeImages', () => {
    it('should analyze multiple images and return results', async () => {
      const results = await batchAnalyzeImages([
        mockBase64,
        mockBase64,
        mockBase64,
      ], { useMock: true });

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      expect(results.every(r => r.analysis.item_detected)).toBe(true);
    });

    it('should use mock after 3 images by default', async () => {
      const results = await batchAnalyzeImages([
        mockBase64,
        mockBase64,
        mockBase64,
        mockBase64,
      ], { useMock: true });

      expect(results).toHaveLength(4);
      expect(results[3].success).toBe(true);
    });

    it('should handle failed images gracefully', async () => {
      const results = await batchAnalyzeImages([
        mockBase64,
        '' as any,
      ], { useMock: true });

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
    });
  });
});