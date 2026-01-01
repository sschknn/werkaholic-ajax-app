import { AdAnalysis } from "../types";
import { mockAnalyzeImage } from "./mockService";

// Mock-Flag zur Steuerung
const USE_MOCK = false; // Auf false setzen, wenn echte API genutzt werden soll

export const analyzeImage = async (base64Image: string): Promise<AdAnalysis> => {
  try {
    if (USE_MOCK) {
      // Mock-Modus: Verwende simulierte Analyse
      console.log("Mock-Modus: Verwende simulierte Bildanalyse");
      return await mockAnalyzeImage(base64Image);
    } else {
      // Original-Modus: Echte API-Analyse (benötigt gültigen API-Key)
      // Remove header if present to get pure base64
      const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");

      // Import der GoogleGenAI nur bei Bedarf
      const { GoogleGenAI, Type } = await import("@google/genai");

      // Initialize the client with environment API key
      const apiKey = import.meta.env.VITE_GEMINI_KEY || "";
      console.log("Gemini API Key loaded:", apiKey ? "Present" : "Missing");
      const ai = new GoogleGenAI({ apiKey });

      const adAnalysisSchema = {
        type: Type.OBJECT,
        properties: {
          item_detected: {
            type: Type.BOOLEAN,
            description: "Bestätigt, ob ein verkaufsfähiger Artikel im Bild sichtbar ist. Auf 'true' setzen, wenn ein Objekt erkennbar ist, auch wenn es klein, weiter entfernt oder nicht perfekt zentriert ist. Nur auf 'false' setzen, wenn die Szene komplett leer ist (z.B. nur Boden oder Wand).",
          },
          title: {
            type: Type.STRING,
            description: "Ein prägnanter, SEO-optimierter Titel für eine deutsche Verkaufsplattform (z.B. eBay Kleinanzeigen). Der Titel sollte das Objekt und dessen Zustand klar benennen. Wenn kein Artikel erkannt wird, leer lassen.",
          },
          price_estimate: {
            type: Type.STRING,
            description: "Geschätzter Preis in Euro (z.B. '50€ - 70€'). Die Schätzung sollte auf dem visuellen Zustand und dem Objekttyp basieren. Wenn kein Artikel erkannt wird, leer lassen.",
          },
          condition: {
            type: Type.STRING,
            description: "Zustand des Artikels. Wähle aus: 'Neu', 'Sehr gut', 'Gut', 'Akzeptabel', 'Defekt'.",
          },
          category: {
            type: Type.STRING,
            description: "Die am besten passende Kategorie für den Artikel. Wähle aus: 'Werkzeuge', 'Elektronik', 'Möbel', 'Kleidung', 'Bücher', 'Fahrzeuge', 'Haushalt', 'Sammlungen', 'Kunst', 'Sonstiges'. Sei präzise und vermeide Fehlkategorisierungen.",
          },
          description: {
            type: Type.STRING,
            description: "Eine professionelle, ansprechende Verkaufsbeschreibung mit Aufzählungspunkten. Beschreibe das Objekt, seine Merkmale und eventuelle Mängel.",
          },
          keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Liste von 5-10 relevanten Such-Tags, die das Objekt und seine Eigenschaften beschreiben.",
          },
          reasoning: {
            type: Type.STRING,
            description: "Kurze Erklärung, wie der Preis basierend auf dem visuellen Zustand und dem erkannten Objekt geschätzt wurde.",
          },
        },
        required: ["item_detected", "title", "price_estimate", "condition", "description", "keywords", "category", "reasoning"],
      };

      const model = "gemini-2.5-flash"; // Using 2.5 Flash for speed and vision capabilities

      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg", // Assuming JPEG for simplicity, works with most uploads
                data: cleanBase64,
              },
            },
            {
              text: `Du bist ein professioneller Verkaufs-Assistent für 'Werkaholic AI'.
              Deine Aufgabe ist es, den Live-Kamera-Feed zu überwachen und Objekte für den Verkauf auf Plattformen wie eBay Kleinanzeigen zu analysieren.

              Regeln für die Erkennung:
              1.  **Sei nicht zu streng:** Erkenne Objekte auch dann, wenn sie nicht perfekt im Bild zentriert sind oder nur einen Teil des Bildes ausfüllen. Solange ein verkaufsfähiger Gegenstand klar identifizierbar ist, fahre mit der Analyse fort.
              2.  **Objekterkennung:** Wenn ein Objekt wie Werkzeug, Dekoration, Elektronik, Kleidung usw. erkannt wird, setze 'item_detected' auf 'true'.
              3.  **Leere Szenen:** Setze 'item_detected' nur dann auf 'false', wenn das Bild absolut nichts enthält (z. B. nur eine leere Wand, Boden oder Tischplatte).
              4.  **Präzise Kategorisierung:** Sei bei der Wahl der Kategorie sehr genau. Ein einzelner Schlüssel ist kein 'Werkzeug'. Ein Smartphone ist keine 'Elektronik' im Allgemeinen, sondern ein 'Handy'. Gib die spezifischste und korrekteste Kategorie an.

              Wenn ein Objekt erkannt wird, fülle alle Felder des Schemas für ein Inserat auf einer Verkaufsplattform aus.
              Deine Antwort muss strikt im JSON-Format erfolgen und dem vorgegebenen Schema entsprechen.`,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: adAnalysisSchema,
          temperature: 0.3, // Slightly lower for more consistent results
        },
      });

      const text = response.text;
      if (!text) throw new Error("Keine Antwort von Gemini erhalten.");

      return JSON.parse(text) as AdAnalysis;
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
