/**
 * Performance Monitoring Service
 * Tracks application performance metrics and user interactions
 */

// Performance metrics interface
interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  
  // Custom metrics
  bundleSize: number;
  loadTime: number;
  renderTime: number;
  apiResponseTime: number;
  errorRate: number;
  userSatisfaction: number;
  
  // Resource usage
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  
  // Network information
  networkInfo: {
    effectiveType: string;
    downlink: string;
    rtt: number;
  };
  
  // User interactions
  interactions: {
    clicks: number;
    scrolls: number;
    formSubmissions: number;
    errors: number;
  };
  
  // Component performance
  components: {
    [componentName: string]: {
      renderTime: number;
      errorCount: number;
      loadTime: number;
    };
  };
}

// Performance threshold configuration
interface PerformanceThresholds {
  lcp: { good: 2500, needsImprovement: 4000 }; // ms
  fid: { good: 100, needsImprovement: 300 }; // ms
  cls: { good: 0.1, needsImprovement: 0.25 }; // score
  ttfb: { good: 800, needsImprovement: 1600 }; // ms
  fcp: { good: 1000, needsImprovement: 1800 }; // ms
  bundleSize: { good: 250000, needsImprovement: 500000 }; // bytes
  loadTime: { good: 3000, needsImprovement: 5000 }; // ms
  apiResponseTime: { good: 500, needsImprovement: 1000 }; // ms
  errorRate: { good: 0.01, needsImprovement: 0.05 }; // percentage
}

class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService | null = null;
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;
  private config: {
    enabled: boolean;
    sampleRate: number;
    reportEndpoint?: string;
    enableUserTracking: boolean;
    enableNetworkMonitoring: boolean;
  };

  private constructor(config: {
    enabled?: boolean;
    sampleRate?: number;
    reportEndpoint?: string;
    enableUserTracking?: boolean;
    enableNetworkMonitoring?: boolean;
  }) {
    this.config = {
      enabled: config.enabled ?? true,
      sampleRate: config.sampleRate ?? 0.1,
      reportEndpoint: config.reportEndpoint,
      enableUserTracking: config.enableUserTracking ?? true,
      enableNetworkMonitoring: config.enableNetworkMonitoring ?? true,
    };
    this.thresholds = {
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      ttfb: { good: 800, needsImprovement: 1600 },
      fcp: { good: 1000, needsImprovement: 1800 },
      bundleSize: { good: 250000, needsImprovement: 500000 },
      loadTime: { good: 3000, needsImprovement: 5000 },
      apiResponseTime: { good: 500, needsImprovement: 1000 },
      errorRate: { good: 0.01, needsImprovement: 0.05 },
    };
    
    this.metrics = this.initializeMetrics();
  }

  // Get singleton instance
  static getInstance(config?: {
    enabled?: boolean;
    sampleRate?: number;
    reportEndpoint?: string;
    enableUserTracking?: boolean;
    enableNetworkMonitoring?: boolean;
  }): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService(config || {});
    }
    return PerformanceMonitoringService.instance;
  }

  // Initialize metrics
  private initializeMetrics(): PerformanceMetrics {
    return {
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      fcp: 0,
      bundleSize: 0,
      loadTime: 0,
      renderTime: 0,
      apiResponseTime: 0,
      errorRate: 0,
      userSatisfaction: 0,
      memoryUsage: { used: 0, total: 0, percentage: 0 },
      networkInfo: this.getNetworkInfo(),
      interactions: { clicks: 0, scrolls: 0, formSubmissions: 0, errors: 0 },
      components: {},
    };
  }

  // Initialize monitoring
  initialize(): void {
    if (this.isInitialized || !this.config.enabled) {
      return;
    }

    try {
      this.setupWebVitalsMonitoring();
      this.setupResourceMonitoring();
      this.setupUserInteractionTracking();
      this.setupErrorTracking();
      this.setupPerformanceObserver();
      
      this.isInitialized = true;
      console.log('[Performance] Monitoring initialized successfully');
    } catch (error) {
      console.error('[Performance] Failed to initialize monitoring:', error);
    }
  }

  // Setup Web Vitals monitoring
  private setupWebVitalsMonitoring(): void {
    if (!this.config.enabled) return;

    // Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // First Input Delay (FID)
    this.observeFID();
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS();
    
    // Time to First Byte (TTFB)
    this.observeTTFB();
    
    // First Contentful Paint (FCP)
    this.observeFCP();
  }

  // Observe LCP
  private observeLCP(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry && lastEntry.entryType === 'largest-contentful-paint') {
        this.metrics.lcp = lastEntry.startTime;
        this.evaluateMetric('lcp', lastEntry.startTime);
      }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(observer);
  }

  // Observe FID
  private observeFID(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'first-input') {
          this.metrics.fid = (entry as any).processingStart - entry.startTime;
          this.evaluateMetric('fid', this.metrics.fid);
        }
      });
    });
    
    observer.observe({ entryTypes: ['first-input'] });
    this.observers.push(observer);
  }

  // Observe CLS
  private observeCLS(): void {
    let clsValue = 0;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          this.metrics.cls = clsValue;
          this.evaluateMetric('cls', clsValue);
        }
      });
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  // Observe TTFB
  private observeTTFB(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart;
        this.evaluateMetric('ttfb', this.metrics.ttfb);
      }
    });
    
    // Fallback if PerformanceObserver not supported
    if (!observer) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart;
        this.evaluateMetric('ttfb', this.metrics.ttfb);
      }
    }
    
    if (observer) {
      this.observers.push(observer);
    }
  }

  // Observe FCP
  private observeFCP(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
          this.evaluateMetric('fcp', this.metrics.fcp);
        }
      });
    });
    
    observer.observe({ entryTypes: ['paint'] });
    this.observers.push(observer);
  }

  // Setup resource monitoring
  private setupResourceMonitoring(): void {
    if (!this.config.enabled) return;

    // Monitor bundle size
    this.monitorBundleSize();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor network information
    if (this.config.enableNetworkMonitoring) {
      this.monitorNetworkInfo();
    }
  }

  // Monitor bundle size
  private monitorBundleSize(): void {
    if (!this.config.enabled) return;

    // Calculate bundle size from resources
    const resources = performance.getEntriesByType('resource');
    let totalSize = 0;
    
    resources.forEach(resource => {
      if (resource.name && resource.name.endsWith('.js')) {
        totalSize += (resource as PerformanceResourceTiming).transferSize || 0;
      }
    });
    
    this.metrics.bundleSize = totalSize;
    this.evaluateMetric('bundleSize', totalSize);
  }

  // Monitor memory usage
  private monitorMemoryUsage(): void {
    if (!this.config.enabled) return;

    const updateMemoryUsage = () => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        };
        
        // Check memory threshold
        if (this.metrics.memoryUsage.percentage > 80) {
          this.reportMemoryIssue();
        }
      }
    };

    // Update memory usage every 5 seconds
    setInterval(updateMemoryUsage, 5000);
    updateMemoryUsage();
  }

  // Monitor network information
  private monitorNetworkInfo(): void {
    if (!this.config.enabled || !this.config.enableNetworkMonitoring) return;

    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        this.metrics.networkInfo = {
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 'unknown',
          rtt: connection.rtt || 0,
        };
      }
    };

    // Update network info when connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }
    
    updateNetworkInfo();
  }

  // Get network information
  private getNetworkInfo(): {
    effectiveType: string;
    downlink: string;
    rtt: number;
  } {
    const connection = (navigator as any).connection;
    if (connection) {
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink ? connection.downlink.toString() : 'unknown',
        rtt: connection.rtt || 0,
      };
    }
    
    return {
      effectiveType: 'unknown',
      downlink: 'unknown',
      rtt: 0,
    };
  }

  // Setup user interaction tracking
  private setupUserInteractionTracking(): void {
    if (!this.config.enabled || !this.config.enableUserTracking) return;

    // Track clicks
    document.addEventListener('click', (event) => {
      this.metrics.interactions.clicks++;
      this.trackUserEvent('click', {
        target: (event.target as HTMLElement).tagName,
        className: (event.target as HTMLElement).className,
        id: (event.target as HTMLElement).id,
      });
    });

    // Track scrolls
    let scrollTimeout: number;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        this.metrics.interactions.scrolls++;
        this.trackUserEvent('scroll', {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
        });
      }, 150);
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      this.metrics.interactions.formSubmissions++;
      this.trackUserEvent('form_submit', {
        formId: (event.target as HTMLFormElement).id,
        formAction: (event.target as HTMLFormElement).action,
      });
    });
  }

  // Setup error tracking
  private setupErrorTracking(): void {
    if (!this.config.enabled) return;

    window.addEventListener('error', (event) => {
      this.metrics.interactions.errors++;
      this.trackUserEvent('error', {
        message: (event as ErrorEvent).message,
        filename: (event as ErrorEvent).filename,
        lineno: (event as ErrorEvent).lineno,
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.interactions.errors++;
      this.trackUserEvent('unhandled_rejection', {
        reason: event.reason,
      });
    });
  }

  // Setup performance observer
  private setupPerformanceObserver(): void {
    if (!this.config.enabled) return;

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'longtask' && entry.duration > 50) {
            this.trackPerformanceIssue('long_task', {
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    }
  }

  // Track user events
  private trackUserEvent(type: string, data: any): void {
    if (!this.config.enabled || !this.config.enableUserTracking) return;

    const event = {
      type,
      data,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Send to analytics service if configured
    if (this.config.reportEndpoint) {
      this.sendEvent(event);
    }

    // Store locally for analysis
    this.storeEvent(event);
  }

  // Track performance issues
  private trackPerformanceIssue(type: string, data: any): void {
    if (!this.config.enabled) return;

    const issue = {
      type,
      data,
      timestamp: Date.now(),
      url: window.location.href,
    };

    // Send to monitoring service
    if (this.config.reportEndpoint) {
      this.sendPerformanceIssue(issue);
    }

    // Store locally
    this.storePerformanceIssue(issue);
  }

  // Report memory issues
  private reportMemoryIssue(): void {
    if (!this.config.enabled) return;

    const issue = {
      type: 'memory_high',
      data: this.metrics.memoryUsage,
      timestamp: Date.now(),
      url: window.location.href,
    };

    if (this.config.reportEndpoint) {
      this.sendPerformanceIssue(issue);
    }
  }

  // Send event to monitoring service
  private sendEvent(event: any): void {
    if (!this.config.reportEndpoint) return;

    // Sample events based on configured rate
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    fetch(this.config.reportEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'user_event',
        event,
        metrics: this.getCurrentMetrics(),
      }),
    }).catch(error => {
      console.error('[Performance] Failed to send event:', error);
    });
  }

  // Send performance issue
  private sendPerformanceIssue(issue: any): void {
    if (!this.config.reportEndpoint) return;

    fetch(this.config.reportEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'performance_issue',
        issue,
        metrics: this.getCurrentMetrics(),
      }),
    }).catch(error => {
      console.error('[Performance] Failed to send performance issue:', error);
    });
  }

  // Store event locally
  private storeEvent(event: any): void {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('performance_events') || '[]');
      storedEvents.push(event);
      
      // Keep only last 100 events
      const trimmedEvents = storedEvents.slice(-100);
      localStorage.setItem('performance_events', JSON.stringify(trimmedEvents));
    } catch (error) {
      console.error('[Performance] Failed to store event:', error);
    }
  }

  // Store performance issue locally
  private storePerformanceIssue(issue: any): void {
    try {
      const storedIssues = JSON.parse(localStorage.getItem('performance_issues') || '[]');
      storedIssues.push(issue);
      
      // Keep only last 50 issues
      const trimmedIssues = storedIssues.slice(-50);
      localStorage.setItem('performance_issues', JSON.stringify(trimmedIssues));
    } catch (error) {
      console.error('[Performance] Failed to store performance issue:', error);
    }
  }

  // Evaluate metric against thresholds
  private evaluateMetric(metric: keyof PerformanceThresholds, value: number): void {
    const threshold = this.thresholds[metric];
    const status = value <= threshold.good ? 'good' : 
                   value <= threshold.needsImprovement ? 'needsImprovement' : 'poor';
    
    this.updateMetricStatus(metric, value, status);
  }

  // Update metric status
  private updateMetricStatus(metric: keyof PerformanceThresholds, value: number, status: string): void {
    // This would update UI or send alerts based on status
    console.log(`[Performance] Metric ${metric}: ${value}ms (${status})`);
    
    // Trigger custom events for status changes
    this.onMetricUpdate?.(metric, value, status);
  }

  // Get current metrics
  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Get performance score
  getPerformanceScore(): number {
    let score = 100;
    
    // Deduct points for poor metrics
    if (this.metrics.lcp > this.thresholds.lcp.needsImprovement) score -= 10;
    if (this.metrics.fid > this.thresholds.fid.needsImprovement) score -= 10;
    if (this.metrics.cls > this.thresholds.cls.needsImprovement) score -= 10;
    if (this.metrics.ttfb > this.thresholds.ttfb.needsImprovement) score -= 10;
    if (this.metrics.fcp > this.thresholds.fcp.needsImprovement) score -= 10;
    if (this.metrics.bundleSize > this.thresholds.bundleSize.needsImprovement) score -= 15;
    if (this.metrics.loadTime > this.thresholds.loadTime.needsImprovement) score -= 15;
    if (this.metrics.errorRate > this.thresholds.errorRate.needsImprovement) score -= 20;
    
    return Math.max(0, score);
  }

  // Get performance recommendations
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.lcp > this.thresholds.lcp.needsImprovement) {
      recommendations.push('Optimize images and critical CSS for faster LCP');
    }
    
    if (this.metrics.fid > this.thresholds.fid.needsImprovement) {
      recommendations.push('Reduce JavaScript execution time and main thread work');
    }
    
    if (this.metrics.cls > this.thresholds.cls.needsImprovement) {
      recommendations.push('Ensure consistent layout and avoid unexpected content shifts');
    }
    
    if (this.metrics.bundleSize > this.thresholds.bundleSize.needsImprovement) {
      recommendations.push('Implement code splitting and tree shaking to reduce bundle size');
    }
    
    if (this.metrics.loadTime > this.thresholds.loadTime.needsImprovement) {
      recommendations.push('Optimize initial loading and resource prioritization');
    }
    
    return recommendations;
  }

  // Start performance monitoring for a component
  startComponentMonitoring(componentName: string): void {
    if (!this.config.enabled) return;

    const startTime = performance.now();
    
    this.metrics.components[componentName] = {
      renderTime: 0,
      errorCount: 0,
      loadTime: startTime,
    };
  }

  // End component monitoring
  endComponentMonitoring(componentName: string, hadError: boolean = false): void {
    if (!this.config.enabled || !this.metrics.components[componentName]) return;

    const endTime = performance.now();
    this.metrics.components[componentName].renderTime = endTime - this.metrics.components[componentName].loadTime;
    
    if (hadError) {
      this.metrics.components[componentName].errorCount++;
    }
  }

  // Optional callback for metric updates
  onMetricUpdate?: (metric: keyof PerformanceThresholds, value: number, status: string) => void;

  // Cleanup
  cleanup(): void {
    this.observers.forEach(observer => {
      if (observer && observer.disconnect) {
        observer.disconnect();
      }
    });
    this.observers = [];
    this.isInitialized = false;
  }

  // Generate performance report
  generateReport(): {
    timestamp: number;
    score: number;
    metrics: PerformanceMetrics;
    recommendations: string[];
    issues: any[];
  } {
    return {
      timestamp: Date.now(),
      score: this.getPerformanceScore(),
      metrics: this.getCurrentMetrics(),
      recommendations: this.getRecommendations(),
      issues: JSON.parse(localStorage.getItem('performance_issues') || '[]'),
    };
  }

  // Export metrics for analysis
  exportMetrics(): string {
    return JSON.stringify(this.generateReport(), null, 2);
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    localStorage.removeItem('performance_events');
    localStorage.removeItem('performance_issues');
  }
}

export default PerformanceMonitoringService;
export type { PerformanceMetrics, PerformanceThresholds };