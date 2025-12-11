import { useEffect, useRef, useCallback } from 'react';

// Performance monitoring utilities for production optimization

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  reRenderCount: number;
  memoryUsage: number;
  lastUpdate: number;
}

interface PerformanceEntry {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private entries: PerformanceEntry[] = [];
  private observers: Set<PerformanceObserver> = new Set();
  private isSupported = typeof PerformanceObserver !== 'undefined';

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (!this.isSupported) return;

    try {
      // Monitor render performance
      const renderObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'render') {
            this.recordRenderMetrics(entry as PerformanceRenderTiming);
          }
        });
      });

      renderObserver.observe({ entryTypes: ['render'] });
      this.observers.add(renderObserver);

      // Monitor navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
          }
        });
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.add(navigationObserver);

      // Monitor resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.recordResourceMetrics(entry as PerformanceResourceTiming);
          }
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.add(resourceObserver);
    } catch (error) {
      console.warn('Performance monitoring not fully supported:', error);
    }
  }

  private recordRenderMetrics(entry: PerformanceRenderTiming) {
    const componentName = this.extractComponentName(entry);
    const existing = this.metrics.get(componentName) || {
      renderTime: 0,
      componentCount: 0,
      reRenderCount: 0,
      memoryUsage: 0,
      lastUpdate: Date.now(),
    };

    existing.renderTime += entry.duration;
    existing.reRenderCount += 1;
    existing.lastUpdate = Date.now();

    this.metrics.set(componentName, existing);
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    // Log navigation performance
    if (import.meta.env.DEV) {
      console.log('Navigation Performance:', {
        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        loadComplete: entry.loadEventEnd - entry.loadEventStart,
        firstPaint: entry.responseEnd - entry.requestStart,
      });
    }
  }

  private recordResourceMetrics(entry: PerformanceResourceTiming) {
    // Track slow resources
    if (entry.duration > 1000) { // Resources taking longer than 1 second
      console.warn('Slow resource detected:', {
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize,
      });
    }
  }

  private extractComponentName(entry: PerformanceRenderTiming): string {
    // Extract component name from performance entry
    return entry.name || 'UnknownComponent';
  }

  public startTiming(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.entries.push({
        name,
        startTime,
        endTime,
        duration,
      });

      // Update component metrics
      const existing = this.metrics.get(name) || {
        renderTime: 0,
        componentCount: 0,
        reRenderCount: 0,
        memoryUsage: 0,
        lastUpdate: Date.now(),
      };

      existing.renderTime += duration;
      existing.componentCount += 1;
      existing.lastUpdate = Date.now();

      this.metrics.set(name, existing);

      // Log slow renders
      if (duration > 16.67) { // Longer than 60fps
        console.warn(`Slow render detected for ${name}: ${duration.toFixed(2)}ms`);
      }
    };
  }

  public getMetrics(name: string): PerformanceMetrics | undefined {
    return this.metrics.get(name);
  }

  public getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  public getAverageRenderTime(): number {
    const allMetrics = Array.from(this.metrics.values());
    if (allMetrics.length === 0) return 0;
    
    const totalTime = allMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return totalTime / allMetrics.length;
  }

  public getSlowestComponents(): Array<{ name: string; avgRenderTime: number }> {
    return Array.from(this.metrics.entries())
      .map(([name, metrics]) => ({
        name,
        avgRenderTime: metrics.renderTime / Math.max(metrics.reRenderCount, 1),
      }))
      .sort((a, b) => b.avgRenderTime - a.avgRenderTime)
      .slice(0, 10); // Top 10 slowest components
  }

  public getMemoryUsage(): number {
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }

  public generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      averageRenderTime: this.getAverageRenderTime(),
      memoryUsage: this.getMemoryUsage(),
      slowestComponents: this.getSlowestComponents(),
      totalComponents: this.metrics.size,
      totalRenders: Array.from(this.metrics.values())
        .reduce((sum, metric) => sum + metric.reRenderCount, 0),
    };

    return JSON.stringify(report, null, 2);
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
    this.entries = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hooks for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>();
  const metricsRef = useRef<PerformanceMetrics>();

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      
      const existing = performanceMonitor.getMetrics(componentName) || {
        renderTime: 0,
        componentCount: 0,
        reRenderCount: 0,
        memoryUsage: 0,
        lastUpdate: Date.now(),
      };

      existing.renderTime += renderTime;
      existing.reRenderCount += 1;
      existing.lastUpdate = Date.now();

      metricsRef.current = existing;
    }
  }, [componentName]);

  useEffect(() => {
    startRender();
    return endRender;
  });

  return {
    metrics: metricsRef.current,
    startRender,
    endRender,
  };
}

// Memory monitoring hook
export function useMemoryMonitor() {
  const [memoryUsage, setMemoryUsage] = React.useState(0);

  useEffect(() => {
    const updateMemoryUsage = () => {
      const usage = performanceMonitor.getMemoryUsage();
      setMemoryUsage(usage);
    };

    // Update immediately
    updateMemoryUsage();

    // Update periodically
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
}

// Component performance optimization hook
export function useRenderOptimization<T>(
  componentName: string,
  renderFn: () => T,
  dependencies: React.DependencyList = []
): T {
  const memoizedFn = useCallback(renderFn, dependencies);
  const { startRender, endRender } = usePerformanceMonitor(componentName);

  useEffect(() => {
    startRender();
    return () => endRender();
  });

  return memoizedFn();
}

// Performance utilities
export const performanceUtils = {
  // Debounce function for performance optimization
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for performance optimization
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Request animation frame for smooth animations
  requestAnimationFrame: (callback: FrameRequestCallback) => {
    return (
      window.requestAnimationFrame ||
      (window as any).webkitRequestAnimationFrame ||
      (window as any).mozRequestAnimationFrame ||
      (window as any).msRequestAnimationFrame ||
      (window as any).oRequestAnimationFrame ||
      ((callback) => setTimeout(callback, 1000 / 60))
    )(callback);
  },

  // Check if device is low-end
  isLowEndDevice: () => {
    const connection = (navigator as any).connection;
    const memory = (performance as any).memory;
    const cores = navigator.hardwareConcurrency || 4;

    // Check for low-end indicators
    const isLowMemory = memory && memory.deviceMemory < 4; // Less than 4GB
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.downlink < 1
    );
    const isLowCores = cores < 4;

    return isLowMemory || isSlowConnection || isLowCores;
  },

  // Get device performance tier
  getPerformanceTier: () => {
    if (performanceUtils.isLowEndDevice()) {
      return 'low';
    }
    
    const memory = (performance as any).memory;
    const connection = (navigator as any).connection;
    
    if (memory && memory.deviceMemory >= 8 && connection && connection.effectiveType === '4g') {
      return 'high';
    }
    
    return 'medium';
  },
};

// Export performance monitoring for global access
if (typeof window !== 'undefined') {
  (window as any).performanceMonitor = performanceMonitor;
  (window as any).performanceUtils = performanceUtils;
}