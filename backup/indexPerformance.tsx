import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Service Worker Registration
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker erfolgreich registriert:', registration);
        
        // Update handling
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                if (confirm('Neue Version verfügbar. App neu laden?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch(error => {
        console.log('Service Worker Registrierung fehlgeschlagen:', error);
      });
  });
}

// Performance Monitoring
const reportWebVitals = (metric: any) => {
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    console.log('Web Vital:', metric);
    
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
  }
};

// Mobile-spezifische Optimierungen
const optimizeForMobile = () => {
  // Viewport Meta Tag für mobile Geräte
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  }

  // Touch Events optimieren
  document.addEventListener('touchstart', () => {}, { passive: true });
  document.addEventListener('touchend', () => {}, { passive: true });
  document.addEventListener('touchmove', () => {}, { passive: true });

  // Prevent zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Viewport height fix für mobile Browser
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', () => {
    setTimeout(setVH, 100);
  });

  // iOS Safari specific optimizations
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    // Prevent bounce scrolling
    document.body.style.overscrollBehavior = 'none';
    
    // Disable pull-to-refresh
    document.body.style.overscrollBehaviorY = 'none';
  }

  // Android specific optimizations
  if (/Android/.test(navigator.userAgent)) {
    // Optimize for Chrome on Android
    if (/Chrome/.test(navigator.userAgent)) {
      document.documentElement.style.webkitTextSizeAdjust = '100%';
    }
  }
};

// Preload kritische Ressourcen
const preloadCriticalResources = () => {
  // Preload fonts
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  ];
  
  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });

  // DNS prefetch für externe APIs
  const dnsPrefetch = [
    'https://firebaseapp.com',
    'https://firestore.googleapis.com',
    'https://googleapis.com',
    'https://generativelanguage.googleapis.com'
  ];
  
  dnsPrefetch.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};

// Lazy Loading für Bilder
const setupImageLazyLoading = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

// Performance Observer für Core Web Vitals
const setupPerformanceObserver = () => {
  if ('PerformanceObserver' in window) {
    // First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime);
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      // Fallback
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Fallback
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        console.log('CLS:', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Fallback
    }
  }
};

// Bundle Size Monitoring
const monitorBundleSize = () => {
  if (process.env.NODE_ENV === 'production' && 'performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        const jsResources = resources.filter(r => r.name.includes('.js'));
        const cssResources = resources.filter(r => r.name.includes('.css'));
        
        const totalJsSize = jsResources.reduce((sum, r) => sum + r.transferSize, 0);
        const totalCssSize = cssResources.reduce((sum, r) => sum + r.transferSize, 0);
        
        console.log('Bundle Size Analysis:');
        console.log(`JS: ${(totalJsSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`CSS: ${(totalCssSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Total: ${((totalJsSize + totalCssSize) / 1024 / 1024).toFixed(2)}MB`);
      }, 0);
    });
  }
};

// Initialisierung
const initializeApp = () => {
  // Mobile Optimierungen
  optimizeForMobile();
  
  // Kritische Ressourcen vorladen
  preloadCriticalResources();
  
  // Lazy Loading Setup
  setupImageLazyLoading();
  
  // Performance Monitoring
  setupPerformanceObserver();
  
  // Bundle Size Monitoring
  monitorBundleSize();
};

// Start App nach DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// React App rendern
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Web Vitals in Development
if (process.env.NODE_ENV === 'development') {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(reportWebVitals);
    getFID(reportWebVitals);
    getFCP(reportWebVitals);
    getLCP(reportWebVitals);
    getTTFB(reportWebVitals);
  });
}