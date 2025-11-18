// Optimisations de performance pour Coding 2.0

import { NextRequest, NextResponse } from 'next/server';

// Cache en mémoire ultra-rapide avec TTL
class MemoryCache {
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  set(key: string, value: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      data: value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Nettoyage automatique des items expirés
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new MemoryCache();

// Nettoyage automatique toutes les 5 minutes
setInterval(() => cache.cleanup(), 5 * 60 * 1000);

// Compression automatique des réponses
export function compressResponse(data: any): string {
  return JSON.stringify(data);
  // En production, utilisez zlib ou brotli pour la vraie compression
}

// Lazy loading helper
export function createLazyComponent(importFn: () => Promise<any>) {
  return {
    preload: () => importFn(),
    component: importFn,
  };
}

// Debounce pour optimiser les appels API
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle pour limiter la fréquence d'exécution
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Batch processing pour optimiser les requêtes multiples
export class BatchProcessor<T, R> {
  private queue: Array<{
    item: T;
    resolve: (value: R) => void;
    reject: (error: any) => void;
  }> = [];

  private timer: NodeJS.Timeout | null = null;

  constructor(
    private processor: (items: T[]) => Promise<R[]>,
    private batchSize: number = 10,
    private delayMs: number = 50
  ) {}

  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });

      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.delayMs);
      }
    });
  }

  private async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const batch = this.queue.splice(0, this.batchSize);
    if (batch.length === 0) return;

    try {
      const items = batch.map((b) => b.item);
      const results = await this.processor(items);

      batch.forEach((b, i) => {
        b.resolve(results[i]);
      });
    } catch (error) {
      batch.forEach((b) => {
        b.reject(error);
      });
    }
  }
}

// Memoization pour cache de fonctions pures
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  }) as T;
}

// Optimisation d'images
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  const { width, height, quality = 75, format = 'webp' } = options;

  const params = new URLSearchParams();
  if (width) params.set('w', String(width));
  if (height) params.set('h', String(height));
  params.set('q', String(quality));
  params.set('f', format);

  return `/api/image-proxy?url=${encodeURIComponent(src)}&${params.toString()}`;
}

// Préchargement de ressources critiques
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  // Preload fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  fontLink.href = '/fonts/inter.woff2';
  document.head.appendChild(fontLink);

  // Preconnect to external domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.openai.com',
    'https://api.anthropic.com',
  ];

  preconnectDomains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// Web Vitals monitoring
export function reportWebVitals(metric: any) {
  // En production, envoyer à un service d'analytics
  console.log('Web Vital:', metric);

  // Exemple: envoyer à Google Analytics
  // if (window.gtag) {
  //   window.gtag('event', metric.name, {
  //     value: Math.round(metric.value),
  //     event_label: metric.id,
  //     non_interaction: true,
  //   });
  // }
}

// Détection de la connexion réseau
export function getNetworkSpeed(): 'slow' | 'medium' | 'fast' {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'medium';
  }

  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType;

  if (effectiveType === '4g') return 'fast';
  if (effectiveType === '3g') return 'medium';
  return 'slow';
}

// Adaptive loading basé sur la connexion
export function shouldLoadHighQuality(): boolean {
  const speed = getNetworkSpeed();
  return speed === 'fast';
}

// Service Worker pour PWA
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

// Prefetch des routes importantes
export function prefetchRoutes(routes: string[]) {
  if (typeof window === 'undefined') return;

  routes.forEach((route) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
}

// Mesure de performance personnalisée
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  start(name: string) {
    this.marks.set(name, performance.now());
  }

  end(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    console.log(`⚡ Performance [${name}]: ${duration.toFixed(2)}ms`);
    return duration;
  }

  measure(name: string, fn: () => any): any {
    this.start(name);
    const result = fn();
    this.end(name);
    return result;
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }
}

export const perfMonitor = new PerformanceMonitor();
