import { AdAnalysis } from "../types";
import { mockAnalyzeImage } from "./mockService";

// Mock-Flag zur Steuerung
const USE_MOCK = false; // Auf false setzen, wenn echte API genutzt werden soll

// Cache für API-Ergebnisse zur Performance-Optimierung
const analysisCache = new Map<string, { result: AdAnalysis; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 Stunde Cache-Dauer

// Hilfsfunktion zur Generierung eines Cache-Keys aus dem Bild
const generateCacheKey = (base64Image: string): string => {
  // Verwende einen Hash des Bildes als Cache-Key (vereinfacht)
  let hash = 0;
  for (let i = 0; i < Math.min(base64Image.length, 1000); i++) {
    const char = base64Image.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Konvertiere zu 32-bit Integer
  }
  return hash.toString();
};

export const analyzeImage = async (base64Image: string): Promise<AdAnalysis> => {
  try {
    if (USE_MOCK) {
      // Mock-Modus: Verwende simulierte Analyse
      console.log("Mock-Modus: Verwende simulierte Bildanalyse");
      return await mockAnalyzeImage(base64Image);
    } else {
      // Erweiterte Analyse mit mehr Details
      return await analyzeImageAdvanced(base64Image);
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Falls echte API fehlschlägt, fallback zu Mock
    if (!USE_MOCK) {
      console.log("API fehlgeschlagen, wechsle zu Mock-Modus");
      return await mockAnalyzeImage(base64Image);
    }
    throw error;
  }
};

// Erweiterte Bildanalyse mit zusätzlichen Features
export const analyzeImageAdvanced = async (base64Image: string): Promise<AdAnalysis> => {
  // Remove header if present to get pure base64
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");

  // Cache-Check für Performance-Optimierung
  const cacheKey = generateCacheKey(cleanBase64);
  const cachedResult = analysisCache.get(cacheKey);
  if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
    console.log("Cache hit - verwende gecachte Analyse");
    return cachedResult.result;
  }

  // Import der GoogleGenAI nur bei Bedarf
  const { GoogleGenAI, Type } = await import("@google/genai");

  // Initialize the client with environment API key
  const apiKey = (import.meta as any).env?.VITE_GEMINI_KEY || "";
  console.log("Gemini API Key loaded:", apiKey ? "Present" : "Missing");
  const ai = new GoogleGenAI({ apiKey });

  const adAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
      item_detected: {
        type: Type.BOOLEAN,
        description: "Bestätigt, ob ein verkaufsfähiger Artikel im Bild sichtbar ist.",
      },
      title: {
        type: Type.STRING,
        description: "Ein prägnanter, SEO-optimierter Titel für eine deutsche Verkaufsplattform.",
      },
      price_estimate: {
        type: Type.STRING,
        description: "Geschätzter Preis in Euro (z.B. '50€ - 70€').",
      },
      price_suggestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3 alternative Preisvorschläge basierend auf Marktanalyse.",
      },
      condition: {
        type: Type.STRING,
        description: "Zustand des Artikels: 'Neu', 'Sehr gut', 'Gut', 'Akzeptabel', 'Defekt'.",
      },
      category: {
        type: Type.STRING,
        description: "Spezifische Kategorie für den Artikel.",
      },
      subcategory: {
        type: Type.STRING,
        description: "Detailliertere Unterkategorie.",
      },
      brand: {
        type: Type.STRING,
        description: "Marke des Produkts, falls erkennbar.",
      },
      model: {
        type: Type.STRING,
        description: "Modell oder Typ des Produkts.",
      },
      description: {
        type: Type.STRING,
        description: "Professionelle Verkaufsbeschreibung mit Aufzählungspunkten.",
      },
      keywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Liste von 5-10 relevanten Such-Tags.",
      },
      features: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Wichtige Merkmale und Eigenschaften des Produkts.",
      },
      defects: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Eventuelle Mängel oder Gebrauchsspuren.",
      },
      reasoning: {
        type: Type.STRING,
        description: "Erklärung der Preisschätzung und Analyse.",
      },
      market_value: {
        type: Type.STRING,
        description: "Marktwert basierend auf ähnlichen Produkten.",
      },
      target_platforms: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Empfohlene Verkaufsplattformen.",
      },
    },
    required: ["item_detected", "title", "price_estimate", "condition", "description", "keywords", "category", "reasoning"],
  };

  const model = "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64,
          },
        },
        {
          text: `Du bist ein professioneller Verkaufs-Assistent für 'Werkaholic AI'.
          Deine Aufgabe ist es, Bilder von Objekten zu analysieren und detaillierte Verkaufsdaten zu generieren.

          **Kritische Anweisungen für höchste Genauigkeit:**
          1. **Objekterkennung:** Erkenne jedes sichtbare Objekt, das potenziell verkaufbar ist. Sei liberal bei der Erkennung - selbst unvollständige oder beschädigte Gegenstände können analysiert werden.
          2. **Detaillierte Identifikation:** Analysiere Marke, Modell, Material, Größe und spezifische Merkmale so genau wie möglich.
          3. **Preisanalyse:** Berechne realistische Preise basierend auf aktuellen Marktbedingungen in Deutschland. Berücksichtige Zustand, Alter und Nachfrage.
          4. **Kategorisierung:** Wähle die passendste Kategorie aus gängigen Verkaufsplattformen (eBay, eBay Kleinanzeigen, Facebook Marketplace, etc.).
          5. **Beschreibung:** Erstelle eine professionelle, ansprechende Verkaufsbeschreibung mit Bullet Points, die alle wichtigen Details hervorhebt.
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
      responseMimeType: "application/json",
      responseSchema: adAnalysisSchema,
      temperature: 0.3,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Keine Antwort von Gemini erhalten.");

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
  analysisCache.set(cacheKey, { result: finalResult, timestamp: Date.now() });

  // Cache-Bereinigung: Entferne alte Einträge (optional, für Speicheroptimierung)
  if (analysisCache.size > 100) {
    const oldestKey = analysisCache.keys().next().value;
    analysisCache.delete(oldestKey);
  }

  return finalResult;
};

// Preisanpassung basierend auf Marktanalyse
export const getPriceSuggestions = async (analysis: AdAnalysis): Promise<string[]> => {
  // Mock-Implementierung für Preisanpassung
  const basePrice = parseFloat(analysis.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

  return [
    `${(basePrice * 0.8).toFixed(0)}€ (Schnellverkauf)`,
    `${basePrice.toFixed(0)}€ (Marktpreis)`,
    `${(basePrice * 1.2).toFixed(0)}€ (Premium-Preis)`,
    `${(basePrice * 1.5).toFixed(0)}€ (Verhandlungsbasis)`,
  ];
};

// Bildbearbeitung: Hintergrund entfernen
export const removeImageBackground = async (base64Image: string): Promise<string> => {
  // Mock-Implementierung für Hintergrundentfernung
  // In einer realen App würde hier eine Bildbearbeitungs-API verwendet werden
  console.log("Hintergrundentfernung wird simuliert...");
  return base64Image; // Für Demo-Zwecke unverändert zurückgeben
};

// KI-basierte Preisoptimierung
export const optimizePriceWithAI = async (
  analysis: AdAnalysis,
  salesHistory: Array<{
    price: number;
    soldAt: string;
    timeToSell: number; // in Tagen
  }>,
  marketData?: Array<{
    title: string;
    price: number;
    condition: string;
    platform: string;
  }>
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
  const { GoogleGenAI, Type } = await import("@google/genai");
  const apiKey = (import.meta as any).env?.VITE_GEMINI_KEY || "";
  const ai = new GoogleGenAI({ apiKey });

  const priceOptimizationSchema = {
    type: Type.OBJECT,
    properties: {
      suggestedPrice: {
        type: Type.NUMBER,
        description: "Empfohlener optimierter Preis in Euro"
      },
      reasoning: {
        type: Type.STRING,
        description: "Detaillierte Begründung für die Preisempfehlung"
      },
      confidence: {
        type: Type.NUMBER,
        description: "Konfidenz der Empfehlung (0-1)"
      },
      marketAnalysis: {
        type: Type.OBJECT,
        properties: {
          averagePrice: {
            type: Type.NUMBER,
            description: "Durchschnittspreis ähnlicher Produkte"
          },
          priceRange: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.NUMBER },
              max: { type: Type.NUMBER }
            }
          },
          recommendedStrategy: {
            type: Type.STRING,
            description: "Empfohlene Verkaufsstrategie"
          }
        }
      }
    },
    required: ["suggestedPrice", "reasoning", "confidence", "marketAnalysis"]
  };

  const prompt = `Du bist ein KI-Preisoptimierungsexperte für 'Werkaholic AI'.

Analysiere die folgenden Daten und gib eine fundierte Preisempfehlung:

**Produkt-Details:**
- Titel: ${analysis.title}
- Kategorie: ${analysis.category}
- Zustand: ${analysis.condition}
- Ursprünglicher Preis: ${analysis.price_estimate}
- Marktwert: ${analysis.market_value || 'Nicht verfügbar'}

**Verkaufshistorie (letzte Verkäufe ähnlicher Produkte):**
${salesHistory.map(sale => `- Preis: ${sale.price}€, Verkaufszeit: ${sale.timeToSell} Tage, Datum: ${sale.soldAt}`).join('\n')}

**Marktdaten (ähnliche Produkte):**
${marketData ? marketData.map(item => `- ${item.title}: ${item.price}€ (${item.condition}) auf ${item.platform}`).join('\n') : 'Keine Marktdaten verfügbar'}

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

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: priceOptimizationSchema,
      temperature: 0.2
    }
  });

  const result = JSON.parse(response.text);
  return result;
};
