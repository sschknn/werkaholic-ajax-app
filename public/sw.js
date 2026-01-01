// Service Worker für Caching und Performance-Optimierung
const CACHE_NAME = 'werkaholic-ai-v1.2.0';
const STATIC_CACHE = 'static-v1.2.0';
const DYNAMIC_CACHE = 'dynamic-v1.2.0';

// Zu cachende statische Ressourcen
const STATIC_ASSETS = [
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg'
];

// Strategien für verschiedene Ressourcen
const cacheStrategies = {
  // API-Calls mit Network First
  api: 'network-first',
  // Statische Assets mit Cache First
  static: 'cache-first',
  // Bilder mit Cache First
  images: 'cache-first',
  // Fallback für andere Anfragen
  default: 'network-first'
};

// Hilfsfunktion zum sicheren Cachen von Assets mit Fehlerbehandlung
async function cacheAssets(cache, assets) {
  const promises = assets.map(async (asset) => {
    try {
      console.log('Service Worker: Versuche Asset zu cachen:', asset);
      const response = await fetch(asset);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      await cache.put(asset, response);
      console.log('Service Worker: Asset erfolgreich gecacht:', asset);
    } catch (error) {
      console.error('Service Worker: Fehler beim Cachen von', asset, error);
      // Ignoriere Fehler und fahre fort
    }
  });
  await Promise.all(promises);
}

// Installation des Service Workers
self.addEventListener('install', event => {
  console.log('Service Worker: Installiert');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching statische Assets');
        return cacheAssets(cache, STATIC_ASSETS);
      })
      .then(() => {
        // Force activation of new service worker
        return self.skipWaiting();
      })
  );
});

// Aktivierung des Service Workers
self.addEventListener('activate', event => {
  console.log('Service Worker: Aktiviert');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Lösche alte Caches
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Lösche alten Cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch Event Handler
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Bestimme Caching-Strategie basierend auf URL
  let strategy = cacheStrategies.default;
  
  if (url.pathname.startsWith('/api/') || url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    strategy = cacheStrategies.api;
  } else if (url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/)) {
    strategy = cacheStrategies.static;
  } else if (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/)) {
    strategy = cacheStrategies.images;
  }
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

// Request Handler basierend auf Strategie
async function handleRequest(request, strategy) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    switch (strategy) {
      case 'cache-first':
        return await cacheFirst(request, cache);
      case 'network-first':
        return await networkFirst(request, cache);
      default:
        return await networkFirst(request, cache);
    }
  } catch (error) {
    console.error('Service Worker: Fetch error', error);
    
    // Fallback für verschiedene Content-Types
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/index.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Cache First Strategy
async function cacheFirst(request, cache) {
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Network First Strategy
async function networkFirst(request, cache) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Push Notification Handler
self.addEventListener('push', event => {
  console.log('Service Worker: Push empfangen');
  
  const options = {
    body: event.data ? event.data.text() : 'Neue Benachrichtigung',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ansehen',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Schließen',
        icon: '/favicon.ico'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Werkaholic AI', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification geklickt');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background Sync für offline Actions
self.addEventListener('sync', event => {
  console.log('Service Worker: Background Sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync pending actions when back online
      handleBackgroundSync()
    );
  }
});

async function handleBackgroundSync() {
  // Implementiere Offline-Synchronisation hier
  console.log('Service Worker: Führe Background Sync aus');
}

// Performance Monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Bundle Size Tracking
const trackBundleSize = () => {
  if ('performance' in self && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource');
    const totalSize = resources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);
    
    console.log(`Service Worker: Gesamt Bundle-Größe: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  }
};

// Track bundle size after loading
trackBundleSize();