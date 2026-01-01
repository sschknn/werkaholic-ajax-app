// Simple i18n implementation for future multilingual support
export type Language = 'de' | 'en';

export interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Common UI elements
  'save': { de: 'Speichern', en: 'Save' },
  'cancel': { de: 'Abbrechen', en: 'Cancel' },
  'edit': { de: 'Bearbeiten', en: 'Edit' },
  'delete': { de: 'Löschen', en: 'Delete' },
  'loading': { de: 'Lädt...', en: 'Loading...' },
  'error': { de: 'Fehler', en: 'Error' },
  'success': { de: 'Erfolg', en: 'Success' },

  // AdView specific
  'ad.title': { de: 'Inserat-Ansicht', en: 'Ad View' },
  'ad.description': { de: 'KI-generierte Werbeanalyse', en: 'AI-generated advertising analysis' },
  'ad.price': { de: 'Preis', en: 'Price' },
  'ad.condition': { de: 'Zustand', en: 'Condition' },
  'ad.category': { de: 'Kategorie', en: 'Category' },
  'ad.description_label': { de: 'Beschreibung', en: 'Description' },
  'ad.keywords': { de: 'Schlüsselwörter', en: 'Keywords' },
  'ad.metadata': { de: 'Metadaten', en: 'Metadata' },
  'ad.created': { de: 'Erstellt', en: 'Created' },
  'ad.modified': { de: 'Zuletzt bearbeitet', en: 'Last modified' },
  'ad.edits': { de: 'Bearbeitungen', en: 'Edits' },
  'ad.customized': { de: 'Angepasst', en: 'Customized' },

  // Actions
  'actions.pdf_report': { de: 'PDF-Bericht', en: 'PDF Report' },
  'actions.kleinanzeige_pdf': { de: 'Kleinanzeige PDF', en: 'Classified Ad PDF' },
  'actions.zip_download': { de: 'ZIP (Bild + Text)', en: 'ZIP (Image + Text)' },
  'actions.share': { de: 'Teilen', en: 'Share' },

  // Notifications
  'notification.pdf_created': { de: 'PDF erstellt', en: 'PDF created' },
  'notification.pdf_message': { de: 'Das Analyse-PDF wurde heruntergeladen.', en: 'The analysis PDF has been downloaded.' },
  'notification.zip_created': { de: 'ZIP erstellt', en: 'ZIP created' },
  'notification.zip_message': { de: 'Inserat mit Bild und Text wurde als ZIP heruntergeladen.', en: 'Ad with image and text has been downloaded as ZIP.' },
  'notification.saved': { de: 'Gespeichert', en: 'Saved' },
  'notification.saved_message': { de: 'Die Inserat-Einstellungen wurden gespeichert.', en: 'Ad settings have been saved.' },
  'notification.copied': { de: 'Kopiert!', en: 'Copied!' },
  'notification.copied_message': { de: '${label} wurde in die Zwischenablage kopiert.', en: '${label} has been copied to clipboard.' },

  // Conditions
  'condition.new': { de: 'Neu', en: 'New' },
  'condition.like_new': { de: 'Wie neu', en: 'Like new' },
  'condition.very_good': { de: 'Sehr gut', en: 'Very good' },
  'condition.good': { de: 'Gut', en: 'Good' },
  'condition.acceptable': { de: 'Akzeptabel', en: 'Acceptable' },
  'condition.defective': { de: 'Defekt', en: 'Defective' },
};

// Current language (can be made dynamic later)
let currentLanguage: Language = 'de';

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
};

export const getLanguage = (): Language => currentLanguage;

export const t = (key: string, params?: Record<string, string>): string => {
  const translation = translations[key]?.[currentLanguage] || key;

  if (params) {
    return Object.entries(params).reduce(
      (result, [paramKey, paramValue]) => result.replace(`\${${paramKey}}`, paramValue),
      translation
    );
  }

  return translation;
};

// Helper function to get all available languages
export const getAvailableLanguages = (): { code: Language; name: string }[] => [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' },
];

// Helper function to get condition options
export const getConditionOptions = (): Array<{ value: string; label: string }> => [
  { value: 'Neu', label: t('condition.new') },
  { value: 'Wie neu', label: t('condition.like_new') },
  { value: 'Sehr gut', label: t('condition.very_good') },
  { value: 'Gut', label: t('condition.good') },
  { value: 'Akzeptabel', label: t('condition.acceptable') },
  { value: 'Defekt', label: t('condition.defective') },
];