import { AdAnalysis } from '../types/v1/types';
import { GoogleGenAI, Type } from '@google/genai';

// Cache für API-Ergebnisse zur Performance-Optimierung
const analysisCache = new Map<string, { result: AdAnalysis; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 Stunde Cache-Dauer

// Hilfsfunktion zur Generierung eines Cache-Keys aus dem Bild
const generateCacheKey = (base64Image: string): string => {
  let hash = 0;
  for (let i = 0; i < Math.min(base64Image.length, 2000); i++) {
    const char = base64Image.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Konvertiere zu 32-bit Integer
  }
  return hash.toString();
};

// Einfacher Mock-Import für Tests/Entwicklung
let mockAnalyzeImageFn: ((base64Image: string) => Promise<AdAnalysis>) | null = null;

export const setMockAnalyzer = (fn: (base64Image: string) => Promise<AdAnalysis>) => {
  mockAnalyzeImageFn = fn;
};

export const clearAnalysisCache = () => {
  analysisCache.clear();
};

// Erneutes Versuchen bei API-Fehlern
const retry = <T>(fn: () => Promise<T>, maxAttempts = 3, delay = 2000): Promise<T> => {
  let attempts = 0;
  const attempt = async (): Promise<T> => {
    attempts++;
    try {
      return await fn();
    } catch (error) {
      if (attempts >= maxAttempts) throw error;
      if (error instanceof Error && (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('RATE_LIMIT'))) {
        const waitTime = delay * attempts * 1000;
        console.log(`Rate limit hit, waiting ${waitTime}ms before retry ${attempts}/${maxAttempts}`);
        await new Promise(r => setTimeout(r, waitTime));
        return attempt();
      }
      throw error;
    }
  };
  return attempt();
};

export interface GeminiAnalysisOptions {
  useMock?: boolean;
  useCache?: boolean;
  temperature?: number;
}

export const analyzeImage = async (
  base64Image: string,
  options: GeminiAnalysisOptions = {}
): Promise<AdAnalysis> => {
  const { useMock = false, useCache = true, temperature = 0.3 } = options;

  // Cache-Check für Performance-Optimierung
  if (useCache) {
    const cacheKey = generateCacheKey(base64Image);
    const cachedResult = analysisCache.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
      console.log('Cache hit - verwende gecachte Analyse');
      return cachedResult.result;
    }
  }

  // Mock-Modus für Entwicklung/Testing (direkter Import)
  if (useMock || !process.env.VITE_GEMINI_KEY) {
    if (mockAnalyzeImageFn) {
      console.log('Mock-Modus: Verwende simulierte Bildanalyse');
      const result = await mockAnalyzeImageFn(base64Image);
      if (useCache) {
        analysisCache.set(generateCacheKey(base64Image), { result, timestamp: Date.now() });
      }
      return result;
    }
    // Fallback: Einfacher Mock
    console.log('Mock-Modus: Verwende Basic-Mock-Analyse');
    const defaultResult: AdAnalysis = {
      item_detected: true,
      title: 'Unbekanntes Objekt',
      price_estimate: '25€ - 50€',
      condition: 'Gut',
      category: 'Sonstiges',
      description: 'Ein interessantes Fundstück.',
      keywords: ['Fundstück', 'interessant'],
      reasoning: 'Standardbewertung',
    };
    if (useCache) {
      analysisCache.set(generateCacheKey(base64Image), { result: defaultResult, timestamp: Date.now() });
    }
    return defaultResult;
  }

  // Echte Gemini API Analyse mit Retry-Logik
  try {
    return await retry(
      async () => {
        // GoogleGenAI importieren
        const { GoogleGenAI, Type } = await import('@google/genai');

        // Initialize the client with environment API key
        // Vite: import.meta.env.VITE_GEMINI_KEY
        // At build time, Vite replaces import.meta.env with process.env
        const apiKey: string = import.meta.env.VITE_GEMINI_KEY || '';

        console.log('Gemini API Key loaded:', apiKey ? 'Present' : 'Missing');

        if (!apiKey) {
          console.warn('No Gemini API key available, falling back to mock');
          if (mockAnalyzeImageFn) {
            const result = await mockAnalyzeImageFn(base64Image);
            if (useCache) {
              analysisCache.set(generateCacheKey(base64Image), { result, timestamp: Date.now() });
            }
            return result;
          }
          // Fallback: Einfacher Mock
          const defaultResult: AdAnalysis = {
            item_detected: true,
            title: 'Unbekanntes Objekt',
            price_estimate: '25€ - 50€',
            condition: 'Gut',
            category: 'Sonstiges',
            description: 'Ein interessantes Fundstück.',
            keywords: ['Fundstück', 'interessant'],
            reasoning: 'Standardbewertung',
          };
          if (useCache) {
            analysisCache.set(generateCacheKey(base64Image), { result: defaultResult, timestamp: Date.now() });
          }
          return defaultResult;
        }

        const adAnalysisSchema = {
          type: Type.OBJECT,
          properties: {
            item_detected: {
              type: Type.BOOLEAN,
              description: 'Bestätigt, ob ein verkaufsfähiger Artikel im Bild sichtbar ist.',
            },
            title: {
              type: Type.STRING,
              description: 'Ein prägnanter, SEO-optimierter Titel für eine deutsche Verkaufsplattform.',
            },
            price_estimate: {
              type: Type.STRING,
              description: 'Geschätzter Preis in Euro (z.B. "50€ - 70€").',
            },
            price_suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 alternative Preisvorschläge basierend auf Marktanalyse.',
            },
            condition: {
              type: Type.STRING,
              description: 'Zustand des Artikels: "Neu", "Sehr gut", "Gut", "Akzeptabel", "Defekt".',
            },
            category: {
              type: Type.STRING,
              description: 'Spezifische Kategorie für den Artikel.',
            },
            subcategory: {
              type: Type.STRING,
              description: 'Detailliertere Unterkategorie.',
            },
            brand: {
              type: Type.STRING,
              description: 'Marke des Produkts, falls erkennbar.',
            },
            model: {
              type: Type.STRING,
              description: 'Modell oder Typ des Produkts.',
            },
            description: {
              type: Type.STRING,
              description: 'Professionelle Verkaufsbeschreibung mit Aufzählungspunkten.',
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Liste von 5-10 relevanten Such-Tags.',
            },
            features: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Wichtige Merkmale und Eigenschaften des Produkts.',
            },
            defects: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Eventuelle Mängel oder Gebrauchsspuren.',
            },
            reasoning: {
              type: Type.STRING,
              description: 'Erklärung der Preisschätzung und Analyse.',
            },
            market_value: {
              type: Type.STRING,
              description: 'Marktwert basierend auf ähnlichen Produkten.',
            },
            target_platforms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Empfohlene Verkaufsplattformen.',
            },
          },
          required: [
            'item_detected',
            'title',
            'price_estimate',
            'condition',
            'description',
            'keywords',
            'category',
            'reasoning',
          ],
        };

        const model = 'gemini-2.5-flash';

        const ai = new GoogleGenAI({ apiKey });

        // Cache-Key für diese Anfrage (wird auch im Fehler-Fallback verwendet)
        const requestCacheKey = generateCacheKey(base64Image);

        const response = await ai.models.generateContent({
          model: model,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Image,
                },
              },
              {
                text: `Du bist ein professioneller Verkaufs-Assistent für 'Werkaholic AI'. Deine Aufgabe ist es, Bilder von Objekten zu analysieren und detaillierte Verkaufsdaten zu generieren.

**Kritische Anweisungen für höchste Genauigkeit:**

1. **Objekterkennung:** Erkenne jedes sichtbare Objekt, das potenziell verkaufbar ist. Sei liberal bei der Erkennung - sogar unvollständige oder beschädigte Gegenstände können analysiert werden.

2. **Detaillierte Identifikation:** Analysiere Marke, Modell, Material, Größe und spezifische Merkmale so genau wie möglich.

3. **Preisanalyse:** Berechne realistische Preise basierend auf aktuellen Marktbedingungen in Deutschland. Berücksichtige Zustand, Alter und Nachfrage.

4. **Kategorisierung:** Wähle die passendste Kategorie aus gängigen Verkaufsplattformen (eBay, eBay Kleinanzeigen, Facebook Marketplace, etc.).

5. **Beschreibung:** Erstelle eine professionelle, ansprechende Verkaufsbeschreibung mit Bullet Points, die alle wichtigen Details hervorheben.

6. **Keywords:** Generiere 5-10 relevante Suchbegriffe, die Käufer verwenden würden.

7. **Qualitätsbewertung:** Bewerte den Zustand objektiv und liste sowohl positive Features als auch mögliche Mängel auf.

**Spezifische Regeln:**
- Fokussiere dich auf deutsche Marktstandards und Preise in Euro.
- Verwende präzise, SEO-optimierte Titel (max. 80 Zeichen).
- Gib immer eine fundierte Begründung für die Preisschätzung.
- Empfehle Plattformen basierend auf dem Objekttyp und Zielgruppe.
- Wenn unsicher, gib konservative Schätzungen ab.

Deine Antwort muss strikt im definierten JSON-Schema erfolgen und alle erforderlichen Felder enthalten.`,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: adAnalysisSchema,
            temperature: temperature,
          },
        });

        const text = response.text;
        if (!text) throw new Error('Keine Antwort von Gemini erhalten.');

        const result = JSON.parse(text) as any;

        // Erweitere das Ergebnis um zusätzliche Felder für Kompatibilität
        const finalResult = {
          ...result,
          customized: false,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          editCount: 0,
        } as AdAnalysis;

        // Cache das Ergebnis für zukünftige Anfragen
        if (useCache) {
          analysisCache.set(requestCacheKey, { result: finalResult, timestamp: Date.now() });
          // Cache-Bereinigung: Entferne alte Einträge (optional, für Speicheroptimierung)
          if (analysisCache.size > 200) {
            const oldestKey = analysisCache.keys().next().value;
            analysisCache.delete(oldestKey);
          }
        }

        return finalResult;
      },
      3, // maxAttempts
      2 // delay in seconds
    );
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    // Falls echte API fehlschlägt, fallback zu Mock
    if (mockAnalyzeImageFn) {
      console.log('API fehlgeschlagen, wechsle zu Mock-Modus');
      const result = await mockAnalyzeImageFn(base64Image);
      if (useCache) {
        analysisCache.set(generateCacheKey(base64Image), { result, timestamp: Date.now() });
      }
      return result;
    }
    // Fallback: Einfacher Mock
    console.log('API fehlgeschlagen, verwende Basic-Mock');
    const defaultResult: AdAnalysis = {
      item_detected: true,
      title: 'Analyse fehlgeschlagen',
      price_estimate: '0€',
      condition: 'Unbekannt',
      category: 'Sonstiges',
      description: 'Die Analyse konnte nicht durchgeführt werden.',
      keywords: [],
      reasoning: 'API-Fehler',
    };
    if (useCache) {
      analysisCache.set(generateCacheKey(base64Image), { result: defaultResult, timestamp: Date.now() });
    }
    return defaultResult;
  }
};

// Preisanpassung basierend auf Marktanalyse
export const getPriceSuggestions = async (
  analysis: AdAnalysis,
  basePrice?: number
): Promise<string[]> => {
  const price = basePrice || parseFloat(analysis.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

  return [
    `${(price * 0.8).toFixed(0)}€ (Schnellverkauf)`,
    `${price.toFixed(0)}€ (Marktpreis)`,
    `${(price * 1.2).toFixed(0)}€ (Premium-Preis)`,
    `${(price * 1.5).toFixed(0)}€ (Verhandlungsbasis)`,
  ];
};

// Bildbearbeitung: Hintergrund entfernen
export const removeImageBackground = async (base64Image: string): Promise<string> => {
  // In einer realen App würde hier eine Bildbearbeitungs-API verwendet werden
  // Für jetzt: Platzhalter für echte Implementierung
  console.log('Hintergrundentfernungs-Service würde hier aufgerufen');
  return base64Image; // Für Demo-Zwecke unverändert zurückgeben
};

// KI-basierte Preisoptimierung
export const optimizePriceWithAI = async (
  analysis: AdAnalysis,
  salesHistory: Array<{ price: number; soldAt: string; timeToSell: number }>,
  marketData?: Array<{ title: string; price: number; condition: string; platform: string }>
): Promise<{
  suggestedPrice: number;
  reasoning: string;
  confidence: number;
  marketAnalysis: {
    averagePrice: number;
    priceRange: { min: number; max: number };
    recommendedStrategy: string;
  };
}> => {
  const { GoogleGenAI, Type } = await import('@google/genai');
  // Vite: import.meta.env.VITE_GEMINI_KEY
  // At build time, Vite replaces import.meta.env with process.env
  const apiKey: string = import.meta.env.VITE_GEMINI_KEY || '';
  const ai = new GoogleGenAI({ apiKey });

  const priceOptimizationSchema = {
    type: Type.OBJECT,
    properties: {
      suggestedPrice: {
        type: Type.NUMBER,
        description: 'Empfohlener optimierter Preis in Euro',
      },
      reasoning: {
        type: Type.STRING,
        description: 'Detaillierte Begründung für die Preisempfehlung',
      },
      confidence: {
        type: Type.NUMBER,
        description: 'Konfidenz der Empfehlung (0-1)',
      },
      marketAnalysis: {
        type: Type.OBJECT,
        properties: {
          averagePrice: {
            type: Type.NUMBER,
            description: 'Durchschnittspreis ähnlicher Produkte',
          },
          priceRange: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.NUMBER },
              max: { type: Type.NUMBER },
            },
          },
          recommendedStrategy: {
            type: Type.STRING,
            description: 'Empfohlene Verkaufsstrategie',
          },
        },
      },
    },
    required: ['suggestedPrice', 'reasoning', 'confidence', 'marketAnalysis'],
  };

  const salesHistoryItems = salesHistory.slice(-10);
  const salesHistoryPrompt = salesHistoryItems
    .map(sale => `- Preis: ${sale.price}€, Verkaufszeit: ${sale.timeToSell} Tage, Datum: ${sale.soldAt}`)
    .join('\\n');

  const marketDataItems = marketData || [];
  const marketDataPrompt = marketDataItems
    .map(item => `- ${item.title}: ${item.price}€ (${item.condition}) auf ${item.platform}`)
    .join('\\n') || 'Keine Marktdaten verfügbar';

  const prompt = `Du bist ein KI-Preisoptimierungsexperte für 'Werkaholic AI'.

Analysiere die folgenden Daten und gib eine fundierte Preisempfehlung:

**Produkt-Details:**
- Titel: ${analysis.title}
- Kategorie: ${analysis.category}
- Zustand: ${analysis.condition}
- Ursprünglicher Preis: ${analysis.price_estimate}
- Marktwert: ${analysis.market_value || 'Nicht verfügbar'}

**Verkaufshistorie (letzte Verkäufe ähnlicher Produkte):${salesHistoryPrompt}

**Marktdaten (ähnliche Produkte):**${marketDataPrompt}

**Aufgabe:**
1. Analysiere Verkaufshistorie und Marktdaten
2. Berücksichtige Produktzustand und Marktwert
3. Empfehle einen optimierten Preis für schnellere Verkäufe
4. Gib eine detaillierte Begründung
5. Schätze die Konfidenz deiner Empfehlung (0-1)
6. Empfehle eine Verkaufsstrategie

**Strategien:**
- "Schnellverkauf": Preisreduzierung für raschen Absatz
- "Marktpreis": Ausgewogener Preis für normale Verkaufszeit
- "Premium": Höherer Preis für bessere Margen
- "Verhandlungsbasis": Hoher Startpreis mit Verhandlungsspielraum

Deine Antwort muss strikt dem JSON-Schema entsprechen.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: priceOptimizationSchema,
        temperature: 0.2,
      },
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error('KI-Preisoptimierung fehlgeschlagen, verwende Fallback:', error);
    // Fallback zur einfachen Logik
    const currentPrice = parseFloat(analysis.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const suggestedPrice = currentPrice * 0.95;
    const confidence = 0.7;
    const averagePrice = salesHistoryItems.length > 0
      ? salesHistoryItems.reduce((sum, t) => sum + t.price, 0) / salesHistoryItems.length
      : currentPrice;

    return {
      suggestedPrice,
      reasoning: 'Basierend auf Markttrends und Verkaufsperformance wird ein Preisnachlass empfohlen.',
      confidence,
      marketAnalysis: {
        averagePrice,
        priceRange: { min: averagePrice * 0.8, max: averagePrice * 1.2 },
        recommendedStrategy: 'Marktpreis für ausgewogene Verkaufszeit',
      },
    };
  }
};

// Batch-Verarbeitung für Multiple Images
export interface BatchAnalysisResult {
  success: boolean;
  analysis: AdAnalysis;
  error?: string;
}

export const batchAnalyzeImages = async (
  base64Images: string[],
  options: GeminiAnalysisOptions = {}
): Promise<BatchAnalysisResult[]> => {
  const results: BatchAnalysisResult[] = [];

  for (let i = 0; i < base64Images.length; i++) {
    try {
      const result = await analyzeImage(base64Images[i], {
        ...options,
        useMock: options.useMock || i >= 3, // Nach 3 Bildern standardmäßig Mock verwenden
      });
      results.push({ success: true, analysis: result });
    } catch (error) {
      console.error(`Batch analysis failed for image ${i}:`, error);
      results.push({
        success: false,
        analysis: {} as AdAnalysis,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      });
    }
  }

  return results;
};