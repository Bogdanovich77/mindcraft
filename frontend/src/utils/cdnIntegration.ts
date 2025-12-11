/**
 * CDN Integration Utilities
 * Handles CDN asset loading, fallbacks, and optimization
 */

interface CDNConfig {
  enabled: boolean;
  baseUrl: string;
  fallbackUrl?: string;
  versioning: boolean;
  cacheHeaders: Record<string, string>;
  retryAttempts: number;
  retryDelay: number;
  preloadCritical: boolean;
}

interface AssetInfo {
  url: string;
  type: 'script' | 'style' | 'image' | 'font' | 'json';
  priority: 'high' | 'medium' | 'low';
  version?: string;
  integrity?: string;
}

class CDNIntegrationService {
  private config: CDNConfig;
  private loadedAssets: Map<string, AssetInfo> = new Map();
  private failedAssets: Set<string> = new Set();
  private retryAttempts: Map<string, number> = new Map();

  constructor(config: Partial<CDNConfig>) {
    this.config = {
      enabled: config.enabled ?? true,
      baseUrl: config.baseUrl ?? 'https://cdn.mindcraft.example.com',
      fallbackUrl: config.fallbackUrl ?? 'http://localhost:5173',
      versioning: config.versioning ?? true,
      cacheHeaders: config.cacheHeaders ?? {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Expires': new Date(Date.now() + 31536000 * 1000).toUTCString(),
      },
      retryAttempts: config.retryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      preloadCritical: config.preloadCritical ?? true,
    };
  }

  // Initialize CDN integration
  initialize(): void {
    if (!this.config.enabled) {
      console.log('[CDN] CDN integration disabled');
      return;
    }

    this.setupPreloading();
    this.setupErrorHandling();
    this.setupPerformanceMonitoring();
    
    console.log('[CDN] CDN integration initialized');
  }

  // Setup preloading for critical assets
  private setupPreloading(): void {
    if (!this.config.preloadCritical) {
      return;
    }

    // Preload critical assets
    const criticalAssets = [
      '/src/main.tsx',
      '/src/index.css',
      '/manifest.json',
      '/sw.js',
    ];

    criticalAssets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = this.getAssetUrl(asset);
      link.as = this.getAssetType(asset);
      
      // Add integrity hash if available
      const integrity = this.getAssetIntegrity(asset);
      if (integrity) {
        link.integrity = integrity;
      }
      
      document.head.appendChild(link);
    });
  }

  // Setup error handling for CDN assets
  private setupErrorHandling(): void {
    // Handle script loading errors
    window.addEventListener('error', (event) => {
      const target = event.target as HTMLScriptElement | HTMLLinkElement;
      
      if (target && 'src' in target && target.src && target.src.includes(this.config.baseUrl)) {
        this.handleAssetError(target.src, event);
      }
    });

    // Handle resource loading timeouts
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.toString().includes('cdn')) {
        console.error('[CDN] Unhandled rejection from CDN asset:', event.reason);
        this.handleAssetError('cdn', event);
      }
    });
  }

  // Setup performance monitoring for CDN assets
  private setupPerformanceMonitoring(): void {
    // Monitor CDN asset loading performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.name && entry.name.includes('cdn')) {
            this.analyzeAssetPerformance(entry);
          }
        });
      });

      observer.observe({ entryTypes: ['resource', 'measure', 'navigation'] });
    }
  }

  // Get CDN URL for asset
  getAssetUrl(assetPath: string): string {
    if (!this.config.enabled) {
      return this.config.fallbackUrl + assetPath;
    }

    const version = this.config.versioning ? `?v=${this.getVersion()}` : '';
    return `${this.config.baseUrl}${assetPath}${version}`;
  }

  // Get asset type for preloading
  private getAssetType(assetPath: string): string {
    if (assetPath.endsWith('.js')) return 'script';
    if (assetPath.endsWith('.css')) return 'style';
    if (assetPath.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (assetPath.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    if (assetPath.endsWith('.json')) return 'fetch';
    return 'script';
  }

  // Get asset integrity hash
  private getAssetIntegrity(assetPath: string): string | undefined {
    // This would typically come from a build manifest
    // For now, return undefined - in production this should be generated
    return undefined;
  }

  // Get current version
  private getVersion(): string {
    // This would typically come from build process
    return (typeof window !== 'undefined' && (window as any).__VERSION__) || '1.0.0';
  }

  // Get asset priority based on path
  private getAssetPriority(assetPath: string): 'high' | 'medium' | 'low' {
    if (assetPath.includes('/src/main.tsx') || assetPath.includes('/src/index.css')) {
      return 'high';
    }
    if (assetPath.includes('/manifest.json') || assetPath.includes('/sw.js')) {
      return 'medium';
    }
    return 'low';
  }

  // Load asset with CDN fallback
  async loadAsset(assetPath: string): Promise<AssetInfo> {
    const assetInfo: AssetInfo = {
      url: this.getAssetUrl(assetPath),
      type: this.getAssetType(assetPath) as AssetInfo['type'],
      priority: this.getAssetPriority(assetPath),
      version: this.getVersion(),
    };

    // Check if already loaded
    if (this.loadedAssets.has(assetPath)) {
      return this.loadedAssets.get(assetPath)!;
    }

    // Check if failed too many times
    const attempts = this.retryAttempts.get(assetPath) || 0;
    if (attempts >= this.config.retryAttempts) {
      console.warn(`[CDN] Asset ${assetPath} failed too many times, using fallback`);
      return this.loadFromFallback(assetPath);
    }

    try {
      // Attempt CDN load
      const result = await this.loadFromCDN(assetInfo);
      
      if (result.success) {
        this.loadedAssets.set(assetPath, result.asset!);
        this.retryAttempts.delete(assetPath);
        this.failedAssets.delete(assetPath);
        return result.asset!;
      } else {
        throw new Error(result.error || 'CDN load failed');
      }
    } catch (error) {
      console.error(`[CDN] Failed to load ${assetPath} from CDN:`, error);
      
      // Increment retry attempts
      this.retryAttempts.set(assetPath, attempts + 1);
      
      // Try fallback after delay
      if (attempts < this.config.retryAttempts) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(this.loadFromFallback(assetPath));
          }, this.config.retryDelay);
        });
      } else {
        return this.loadFromFallback(assetPath);
      }
    }
  }

  // Load from CDN
  private async loadFromCDN(assetInfo: AssetInfo): Promise<{ success: boolean; asset?: AssetInfo; error?: string }> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'CDN timeout' });
      }, 10000); // 10 second timeout

      const element = this.createElementForAsset(assetInfo);
      
      element.onload = () => {
        clearTimeout(timeout);
        
        const loadTime = performance.now();
        this.recordAssetLoad(assetInfo, loadTime, true);
        
        resolve({ success: true, asset: assetInfo });
      };

      element.onerror = () => {
        clearTimeout(timeout);
        resolve({ success: false, error: `Failed to load ${assetInfo.url}` });
      };

      if ('src' in element) {
        (element as HTMLScriptElement | HTMLImageElement).src = assetInfo.url;
      } else if ('href' in element) {
        (element as HTMLLinkElement).href = assetInfo.url;
      }
      
      // Add to document
      if (assetInfo.type === 'script') {
        document.head.appendChild(element);
      } else if (assetInfo.type === 'style') {
        document.head.appendChild(element);
      } else {
        // For images and other resources, create a hidden element
        element.style.display = 'none';
        document.body.appendChild(element);
      }
    });
  }

  // Load from fallback URL
  private loadFromFallback(assetPath: string): AssetInfo {
    if (!this.config.fallbackUrl) {
      throw new Error('No fallback URL configured');
    }

    const assetInfo: AssetInfo = {
      url: this.config.fallbackUrl + assetPath,
      type: this.getAssetType(assetPath) as AssetInfo['type'],
      priority: 'low',
    };

    this.loadedAssets.set(assetPath, assetInfo);
    return assetInfo;
  }

  // Create DOM element for asset
  private createElementForAsset(assetInfo: AssetInfo): HTMLElement {
    switch (assetInfo.type) {
      case 'script': {
        const script = document.createElement('script');
        script.async = true;
        script.crossOrigin = 'anonymous';
        return script;
      }
        
      case 'style': {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.crossOrigin = 'anonymous';
        return link;
      }
        
      case 'image': {
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.referrerPolicy = 'no-referrer';
        return img;
      }
        
      case 'font': {
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.as = 'font';
        fontLink.type = 'font/woff2';
        fontLink.crossOrigin = 'anonymous';
        return fontLink;
      }
        
      default: {
        const element = document.createElement('div');
        return element;
      }
    }
  }

  // Handle asset loading errors
  private handleAssetError(url: string, event: Event): void {
    const assetPath = new URL(url).pathname;
    this.failedAssets.add(assetPath);
    
    console.error(`[CDN] Asset loading error:`, {
      url,
      event: event.type,
      timestamp: Date.now(),
    });

    // Try to recover with fallback
    if (this.config.fallbackUrl && !url.includes(this.config.fallbackUrl)) {
      setTimeout(() => {
        this.loadFromFallback(assetPath);
      }, 1000);
    }
  }

  // Record asset loading performance
  private recordAssetLoad(assetInfo: AssetInfo, loadTime: number, success: boolean): void {
    const metrics = {
      assetUrl: assetInfo.url,
      assetType: assetInfo.type,
      loadTime,
      success,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
    };

    // Store metrics locally
    this.storeAssetMetrics(metrics);

    // Send to analytics if configured
    this.sendAssetMetrics(metrics);
  }

  // Store asset metrics locally
  private storeAssetMetrics(metrics: any): void {
    try {
      const storedMetrics = JSON.parse(localStorage.getItem('cdn_asset_metrics') || '[]');
      storedMetrics.push(metrics);
      
      // Keep only last 100 entries
      const trimmedMetrics = storedMetrics.slice(-100);
      localStorage.setItem('cdn_asset_metrics', JSON.stringify(trimmedMetrics));
    } catch (error) {
      console.error('[CDN] Failed to store asset metrics:', error);
    }
  }

  // Send asset metrics to analytics
  private sendAssetMetrics(metrics: any): void {
    // This would integrate with your analytics service
    console.log('[CDN] Asset metrics:', metrics);
    
    // Example: Send to analytics endpoint
    // fetch('/api/cdn-metrics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metrics),
    // }).catch(error => {
    //   console.error('Failed to send CDN metrics:', error);
    // });
  }

  // Get connection information
  private getConnectionInfo(): any {
    const connection = (navigator as any).connection;
    return connection ? {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 'unknown',
      rtt: connection.rtt || 'unknown',
      saveData: connection.saveData || 'unknown',
    } : null;
  }

  // Analyze asset performance
  private analyzeAssetPerformance(entry: PerformanceEntry): void {
    const duration = entry.duration || 0;
    const size = (entry as any).transferSize || 0;
    
    // Performance thresholds
    const thresholds: Record<string, { maxDuration: number; maxSize: number }> = {
      excellent: { maxDuration: 1000, maxSize: 100000 },
      good: { maxDuration: 2000, maxSize: 500000 },
      acceptable: { maxDuration: 5000, maxSize: 1000000 },
      poor: { maxDuration: 10000, maxSize: 5000000 },
    };

    let performance = 'excellent';
    if (duration > thresholds.excellent.maxDuration || size > thresholds.excellent.maxSize) {
      performance = 'good';
    }
    if (duration > thresholds.good.maxDuration || size > thresholds.good.maxSize) {
      performance = 'acceptable';
    }
    if (duration > thresholds.acceptable.maxDuration || size > thresholds.acceptable.maxSize) {
      performance = 'poor';
    }

    console.log(`[CDN] Asset performance: ${entry.name} - ${performance} (${duration}ms, ${size} bytes)`);
  }

  // Get asset loading statistics
  getAssetStats(): {
    loaded: number;
    failed: number;
    averageLoadTime: number;
    performanceBreakdown: {
      excellent: number;
      good: number;
      acceptable: number;
      poor: number;
    };
  } {
    const metrics = JSON.parse(localStorage.getItem('cdn_asset_metrics') || '[]');
    
    const loaded = metrics.filter((m: any) => m.success).length;
    const failed = metrics.filter((m: any) => !m.success).length;
    const loadTimes = metrics.filter((m: any) => m.success).map((m: any) => m.loadTime);
    const averageLoadTime = loadTimes.length > 0 ? loadTimes.reduce((sum: number, time: number) => sum + time, 0) / loadTimes.length : 0;

    const performanceBreakdown = {
      excellent: metrics.filter((m: any) => m.performance === 'excellent').length,
      good: metrics.filter((m: any) => m.performance === 'good').length,
      acceptable: metrics.filter((m: any) => m.performance === 'acceptable').length,
      poor: metrics.filter((m: any) => m.performance === 'poor').length,
    };

    return {
      loaded,
      failed,
      averageLoadTime,
      performanceBreakdown,
    };
  }

  // Clear asset cache
  clearCache(): void {
    this.loadedAssets.clear();
    this.failedAssets.clear();
    this.retryAttempts.clear();
    localStorage.removeItem('cdn_asset_metrics');
    
    console.log('[CDN] Asset cache cleared');
  }

  // Update CDN configuration
  updateConfig(updates: Partial<CDNConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('[CDN] Configuration updated:', this.config);
  }

  // Check CDN health
  async checkHealth(): Promise<{ healthy: boolean; details: any }> {
    try {
      const startTime = performance.now();
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        cache: 'no-cache',
      });
      
      const responseTime = performance.now() - startTime;
      const healthy = response.ok && responseTime < 2000;
      
      return {
        healthy,
        details: {
          responseTime,
          status: response.status,
          baseUrl: this.config.baseUrl,
        },
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }

  // Preload batch of assets
  async preloadAssets(assetPaths: string[]): Promise<void> {
    if (!this.config.preloadCritical) {
      return;
    }

    const preloadPromises = assetPaths.map(async (assetPath) => {
      try {
        await this.loadAsset(assetPath);
      } catch (error) {
        console.warn(`[CDN] Failed to preload ${assetPath}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }
}

// Create singleton instance
let cdnService: CDNIntegrationService | null = null;

// Factory function
export function createCDNIntegrationService(config?: Partial<CDNConfig>): CDNIntegrationService {
  if (!cdnService) {
    cdnService = new CDNIntegrationService(config || {});
  }
  return cdnService;
}

// Get service instance
export function getCDNIntegrationService(): CDNIntegrationService | null {
  return cdnService;
}

export default CDNIntegrationService;
export type { CDNConfig, AssetInfo };