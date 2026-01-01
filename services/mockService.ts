import { AdAnalysis } from "../types";

// Mock-Daten für verschiedene Objekte
const mockData: Record<string, AdAnalysis> = {
  'werkzeug': {
    item_detected: true,
    title: "Werkzeugkoffer mit 150-teiligem Sortiment",
    price_estimate: "85€ - 120€",
    condition: "Sehr gut",
    category: "Werkzeuge",
    description: "Hochwertiger Werkzeugkoffer mit komplettem 150-teiligem Sortiment. Enthält Schraubendreher, Zangen, Hammer und vieles mehr. Ideal für Heimwerker und Profis. Alle Werkzeuge in einwandfreiem Zustand.",
    keywords: ["Werkzeugkoffer", "150-teilig", "Schraubendreher", "Zangen", "Heimwerker"],
    reasoning: "Preis basiert auf dem umfangreichen Sortiment und gutem Zustand der Werkzeuge."
  },
  'elektronik': {
    item_detected: true,
    title: "Bluetooth Lautsprecher mit NFC und 20h Akku",
    price_estimate: "45€ - 65€",
    condition: "Gut",
    category: "Elektronik",
    description: "Kompakter Bluetooth Lautsprecher mit hervorragender Klangqualität. NFC-Verbindung, bis zu 20 Stunden Akkulaufzeit. Wasserdicht nach IPX7. Perfekt für unterwegs und zu Hause.",
    keywords: ["Bluetooth Lautsprecher", "NFC", "wasserdicht", "20h Akku", "Klangqualität"],
    reasoning: "Preis orientiert sich am Marktwert vergleichbarer Modelle mit ähnlicher Ausstattung."
  },
  'messer': {
    item_detected: true,
    title: "Küchenmesser Set 5-teilig professionell",
    price_estimate: "30€ - 45€",
    condition: "Neu",
    category: "Küche",
    description: "Professionelles 5-teiliges Küchenmesser Set aus rostfreiem Edelstahl. Enthält Kochmesser, Brotmesser, Gemüsemesser, Spitzmesser und Schinkenmesser. Ergonomische Griffe für sicheres Arbeiten.",
    keywords: ["Küchenmesser Set", "5-teilig", "Edelstahl", "professionell", "Kochmesser"],
    reasoning: "Neuer Zustand und hochwertige Verarbeitung rechtfertigen den Preis im mittleren Segment."
  },
  'deko': {
    item_detected: true,
    title: "Vintage Holzregal mit industrial Look",
    price_estimate: "60€ - 85€",
    condition: "Gut",
    category: "Dekoration",
    description: "Schönes Vintage Holzregal im industrial Style. 4 Ablagen, stabile Metallkonstruktion. Ideal für Bücher, Deko-Objekte oder Pflanzen. Kleine Gebrauchsspuren unterstreichen den Vintage-Charakter.",
    keywords: ["Vintage Regal", "Holz", "industrial", "Dekoration", "4 Ablagen"],
    reasoning: "Handwerkliche Qualität und einzigartiger Style rechtfertigen den höheren Preis."
  },
  'kleidung': {
    item_detected: true,
    title: "Herren Lederjacke braun Gr. L",
    price_estimate: "70€ - 90€",
    condition: "Gut",
    category: "Kleidung",
    description: "Echte Lederjacke in braun, Größe L. Zeitloser Style mit Reiß- und Knopfverschluss. Leder weich und gepflegt. Inklusive Innentaschen. Perfekt für die Übergangszeit.",
    keywords: ["Lederjacke", "braun", "Herren", "Gr. L", "Vintage"],
    reasoning: "Echtes Leder und guter Zustand ergeben einen fairen Marktpreis."
  }
};

// Default Mock für unbekannte Objekte
const defaultMock: AdAnalysis = {
  item_detected: true,
  title: "Interessantes Objekt - bitte genauere Beschreibung",
  price_estimate: "25€ - 50€",
  condition: "Gut",
  category: "Sonstiges",
  description: "Ein interessantes Fundstück, das genauere Betrachtung lohnt. Zustand ist gut, mit leichten Gebrauchsspuren. Vielseitig einsetzbar oder als dekoratives Element.",
  keywords: ["Fundstück", "interessant", "gebraucht", "dekorativ", "vielseitig"],
  reasoning: "Standardbewertung für nicht klassifizierte Gegenstände im mittleren Preissegment."
};

// Mock-Funktion für Bildanalyse
export const mockAnalyzeImage = async (base64Image: string): Promise<AdAnalysis> => {
  // Simuliere API-Verzögerung
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    // Decode und analysiere das Bild grob (nur Mock)
    const imageStr = base64Image.substring(0, 50).toLowerCase();
    
    // Einfache Kategorisierung basierend auf Bild-Inhalten (Mock)
    if (imageStr.includes('tool') || imageStr.includes('werkzeug')) {
      return { ...mockData.werkzeug };
    } else if (imageStr.includes('elektro') || imageStr.includes('tech')) {
      return { ...mockData.elektronik };
    } else if (imageStr.includes('küche') || imageStr.includes('messer')) {
      return { ...mockData.messer };
    } else if (imageStr.includes('deko') || imageStr.includes('regal')) {
      return { ...mockData.deko };
    } else if (imageStr.includes('kleid') || imageStr.includes('textil')) {
      return { ...mockData.kleidung };
    } else {
      // Zufällige Auswahl aus Mock-Daten für mehr Abwechslung
      const keys = Object.keys(mockData);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      return { ...mockData[randomKey] };
    }
  } catch (error) {
    console.log("Mock Analysis fallback:", error);
    return { ...defaultMock };
  }
};