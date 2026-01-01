// View constants to avoid magic strings
export const VIEWS = {
  DASHBOARD: 'dashboard',
  SCANNER: 'scanner',
  MARKETPLACE: 'marketplace',
  HISTORY: 'history',
  COMPARISON: 'comparison',
  EDITOR: 'editor',
  BATCH: 'batch',
  SETTINGS: 'settings',
} as const;

export type ViewType = typeof VIEWS[keyof typeof VIEWS];

// Share platform constants
export const SHARE_PLATFORMS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
} as const;

export type SharePlatform = typeof SHARE_PLATFORMS[keyof typeof SHARE_PLATFORMS];