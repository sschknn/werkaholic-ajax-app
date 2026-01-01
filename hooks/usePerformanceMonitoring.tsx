import { useEffect, useRef, useCallback } from 'react';

// Performance Monitoring Hook für mobile Geräte
export const usePerformanceMonitoring = () => {
  const performanceData = useRef({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    bundleSize: 0,
    webVitals: {
      FCP: 0, // First Contentful Paint
      LCP: 0, // Largest Contentful Paint
      FID: 0, // First Input Delay
      CLS: 0, // Cumulative Layout Shift
      TTFB: 0, // Time to First Byte
    }
  });

  // Web Vitals messen
  const measureWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return;

    // First Contentful Paint
    const observerFCP = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          performanceData.current.webVitals.FCP = entry.startTime;
          console.log('FCP:', entry.startTime);
        }
      }
    });
    
    try {
      observerFCP.observe({ entryTypes: ['paint'] });
    } catch (e) {
      // Fallback für Browser ohne Paint API
    }

    // Largest Contentful Paint
    const observerLCP = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      performanceData.current.webVitals.LCP = lastEntry.startTime;
      console.log('LCP:', lastEntry.startTime);
    });
    
    try {
      observerLCP.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Fallback
    }

    // First Input Delay
    const observerFID = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        performanceData.current.webVitals.FID = entry.processingStart - entry.startTime;
        console.log('FID:', entry.processingStart - entry.startTime);
      }
    });
    
    try {
      observerFID.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Fallback
    }

    // Cumulative Layout Shift
    let clsValue = 0;
    const observerCLS = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      performanceData.current.webVitals.CLS = clsValue;
      console.log('CLS:', clsValue);
    });
    
    try {
      observerCLS.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Fallback
    }

    // Time to First Byte
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      performanceData.current.webVitals.TTFB = navigation.responseStart - navigation.requestStart;
      console.log('TTFB:', navigation.responseStart - navigation.requestStart);
    }

    // Cleanup function
    return () => {
      observerFCP.disconnect();
      observerLCP.disconnect();
      observerFID.disconnect();
      observerCLS.disconnect();
    };
  }, []);

  // Bundle Size messen
  const measureBundleSize = useCallback(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const cssResources = resources.filter(r => r.name.includes('.css'));
    
    const totalJsSize = jsResources.reduce((sum, r) => sum + r.transferSize, 0);
    const totalCssSize = cssResources.reduce((sum, r) => sum + r.transferSize, 0);
    const totalSize = totalJsSize + totalCssSize;
    
    performanceData.current.bundleSize = totalSize;
    
    console.log('Bundle Size Analysis:');
    console.log(`JS: ${(totalJsSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`CSS: ${(totalCssSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Total: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    
    // Warnung bei großen Bundles
    if (totalSize > 1024 * 1024) { // 1MB
      console.warn('⚠️ Bundle size exceeds 1MB! Consider code splitting.');
    }
  }, []);

  // Memory Usage messen
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      performanceData.current.memoryUsage = memory.usedJSHeapSize;
      
      console.log('Memory Usage:');
      console.log(`Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`);
    }
  }, []);

  // Network Requests zählen
  const measureNetworkRequests = useCallback(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    performanceData.current.networkRequests = resources.length;
    
    console.log(`Total Network Requests: ${resources.length}`);
    
    // Kategorisierung nach Typ
    const requestTypes = {
      js: resources.filter(r => r.name.includes('.js')).length,
      css: resources.filter(r => r.name.includes('.css')).length,
      image: resources.filter(r => /\.(png|jpg|jpeg|svg|webp|gif)$/i.test(r.name)).length,
      api: resources.filter(r => r.name.includes('/api/') || r.name.includes('firebase')).length,
    };
    
    console.log('Request Types:', requestTypes);
  }, []);

  // Load Time messen
  const measureLoadTime = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      performanceData.current.loadTime = navigation.loadEventEnd - navigation.navigationStart;
      console.log(`Page Load Time: ${performanceData.current.loadTime}ms`);
    }
  }, []);

  // Performance Report generieren
  const generatePerformanceReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      ...performanceData.current,
    };
    
    console.log('📊 Performance Report:', report);
    
    // In Production: Sende an Analytics
    if (process.env.NODE_ENV === 'production') {
      // gtag('event', 'performance_report', {
      //   custom_parameter_1: report.loadTime,
      //   custom_parameter_2: report.bundleSize,
      //   custom_parameter_3: report.webVitals.FCP,
      // });
    }
    
    return report;
  }, []);

  // Optimierungsempfehlungen
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations: string[] = [];
    const { loadTime, bundleSize, webVitals, memoryUsage } = performanceData.current;
    
    if (loadTime > 3000) {
      recommendations.push('🔴 Page Load Time exceeds 3s - Implement code splitting and lazy loading');
    }
    
    if (bundleSize > 1024 * 1024) {
      recommendations.push('🔴 Bundle Size exceeds 1MB - Use tree shaking and remove unused code');
    }
    
    if (webVitals.FCP > 1800) {
      recommendations.push('🟡 First Contentful Paint exceeds 1.8s - Optimize critical rendering path');
    }
    
    if (webVitals.LCP > 2500) {
      recommendations.push('🟡 Largest Contentful Paint exceeds 2.5s - Optimize images and server response');
    }
    
    if (webVitals.FID > 100) {
      recommendations.push('🟡 First Input Delay exceeds 100ms - Reduce JavaScript execution time');
    }
    
    if (webVitals.CLS > 0.1) {
      recommendations.push('🟡 Cumulative Layout Shift exceeds 0.1 - Set explicit dimensions for media');
    }
    
    if (memoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('🟡 Memory Usage exceeds 50MB - Implement memory cleanup');
    }
    
    console.log('💡 Optimization Recommendations:', recommendations);
    return recommendations;
  }, []);

  // Hook Setup
  useEffect(() => {
    // Initiale Messungen
    measureLoadTime();
    measureBundleSize();
    measureMemoryUsage();
    measureNetworkRequests();
    
    // Web Vitals Setup
    const cleanup = measureWebVitals();
    
    // Periodische Messungen
    const intervalId = setInterval(() => {
      measureMemoryUsage();
      measureNetworkRequests();
    }, 30000); // Alle 30 Sekunden
    
    // Cleanup
    return () => {
      if (cleanup) cleanup();
      clearInterval(intervalId);
    };
  }, [measureWebVitals, measureLoadTime, measureBundleSize, measureMemoryUsage, measureNetworkRequests]);

  return {
    performanceData: performanceData.current,
    generatePerformanceReport,
    getOptimizationRecommendations,
    measureBundleSize,
    measureMemoryUsage,
    measureNetworkRequests,
  };
};

// Hook für Mobile-spezifische Performance
export const useMobilePerformance = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isLowEnd: false,
    connectionType: 'unknown',
    memoryClass: 'unknown',
  });

  useEffect(() => {
    // Device Detection
    const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
    
    // Connection Detection
    const connection = (navigator as any).connection;
    const connectionType = connection?.effectiveType || 'unknown';
    
    // Low-end device detection
    const isLowEnd = isMobile && (
      connectionType === 'slow-2g' || 
      connectionType === '2g' ||
      (navigator as any).deviceMemory < 4 // Less than 4GB RAM
    );
    
    // Memory class detection
    const memoryClass = (navigator as any).deviceMemory ? 
      `${(navigator as any).deviceMemory}GB` : 'unknown';
    
    setDeviceInfo({
      isMobile,
      isLowEnd,
      connectionType,
      memoryClass,
    });
    
    // Adaptive loading based on device capabilities
    if (isLowEnd) {
      console.log('📱 Low-end device detected - Applying optimizations');
      
      // Reduziere Bildqualität
      document.documentElement.style.setProperty('--image-quality', '0.7');
      
      // Deaktiviere Animationen
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      
      // Reduziere Chunk-Größe
      // (Dies würde in der Build-Konfiguration implementiert)
    }
  }, []);

  return deviceInfo;
};

// Performance Observer für Component Render Time
export const useRenderPerformance = (componentName: string) => {
  const renderStart = useRef<number>(0);
  
  useEffect(() => {
    renderStart.current = performance.now();
  });
  
  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    console.log(`⚡ ${componentName} render time: ${renderTime.toFixed(2)}ms`);
    
    if (renderTime > 16) { // Über 1 Frame (16ms)
      console.warn(`🐌 ${componentName} render time exceeds frame budget!`);
    }
  });
};