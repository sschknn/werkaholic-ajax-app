import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { analyzeImage, setMockAnalyzer, getPriceSuggestions } from '@/services/geminiService';

const mockBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD';

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

beforeEach(() => {
  setMockAnalyzer(() => Promise.resolve({
    ...mockAnalysis,
    customized: false,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    editCount: 0,
  } as any));
});

describe('Gemini AI Service', () => {
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
  });
});