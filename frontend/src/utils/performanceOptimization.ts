/**
 * Performance Optimization Utilities
 *
 * This module provides utilities for optimizing high-frequency updates
 * and managing performance-critical operations in the cognitive dashboard.
 */

import React from 'react';

// Performance monitoring configuration
export interface PerformanceConfig {
  enableBatching: boolean;
  batchSize: number;
  batchInterval: number;
  enableThrottling: boolean;
  throttleDelay: number;
  enableDebouncing: boolean;
  debounceDelay: number;
  enableVirtualization: boolean;
  virtualizationThreshold: number;
  enablePrioritization: boolean;
  priorityThreshold: number;
}

// Default performance configuration
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  enableBatching: true,
  batchSize: 50,
  batchInterval: 100, // 100ms
  enableThrottling: true,
  throttleDelay: 16, // 16ms (60fps)
  enableDebouncing: true,
  debounceDelay: 100, // 100ms
  enableVirtualization: true,
  virtualizationThreshold: 1000,
  enablePrioritization: true,
  priorityThreshold: 10
};

// Performance metrics tracking
export interface PerformanceMetrics {
  frameTime: number;
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  renderTime: number;
  updateTime: number;
  batchCount: number;
  droppedFrames: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    frameTime: 0,
    fps: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    renderTime: 0,
    updateTime: 0,
    batchCount: 0,
    droppedFrames: 0
  };

  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  private config: PerformanceConfig;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_PERFORMANCE_CONFIG, ...config };
  }

  // Start performance monitoring
  start(): void {
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.lastFpsUpdate = Date.now();
    
    if (this.config.enableBatching) {
      this.startBatching();
    }
  }

  // Stop performance monitoring
  stop(): void {
    if (this.config.enableBatching) {
      this.stopBatching();
    }
  }

  // Update performance metrics
  updateMetrics(): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    
    this.frameCount++;
    
    // Calculate FPS every second
    if (now - this.lastFpsUpdate >= 1000) {
      this.metrics.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
    
    this.metrics.frameTime = frameTime;
    
    // Update other metrics less frequently
    if (this.frameCount % 60 === 0) { // Every 60 frames
      this.updateSystemMetrics();
    }
  }

  // Update system metrics (memory, CPU)
  private updateSystemMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    
    if ('cpu' in performance) {
      // CPU monitoring is not widely supported, use fallback
      this.metrics.cpuUsage = this.estimateCPUUsage();
    }
  }

  // Estimate CPU usage (fallback method)
  private estimateCPUUsage(): number {
    const start = performance.now();
    let busy = false;
    
    // Busy wait for 10ms to measure CPU usage
    const end = start + 10;
    while (Date.now() < end) {
      busy = true;
    }
    
    return busy ? 0.1 : this.metrics.cpuUsage * 0.9 + 0.1; // Smooth transition
  }

  // Get current performance metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Batching utilities
  private batchQueue: Array<() => void> = [];
  private batchTimer: number | null = null;

  private startBatching(): void {
    this.batchTimer = window.setInterval(() => {
      if (this.batchQueue.length > 0) {
        const batch = this.batchQueue.splice(0, this.config.batchSize);
        this.metrics.batchCount++;
        
        // Process batch
        requestAnimationFrame(() => {
          batch.forEach(fn => fn());
        });
      }
    }, this.config.batchInterval);
  }

  private stopBatching(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    this.batchQueue = [];
  }

  // Add function to batch queue
  addToBatch(fn: () => void): void {
    if (this.config.enableBatching && this.batchQueue.length < this.config.batchSize) {
      this.batchQueue.push(fn);
    } else {
      // Execute immediately if batching is disabled or queue is full
      fn();
    }
  }
}

// Create performance monitor instance
export const createPerformanceMonitor = (config?: Partial<PerformanceConfig>): PerformanceMonitor => {
  return new PerformanceMonitor(config);
};

// Throttling utility
export function createThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: number | null = null;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = window.setTimeout(() => {
        fn(...args);
        lastCall = Date.now();
        timeoutId = null;
      }, delay - (now - lastCall));
    } else {
      fn(...args);
      lastCall = now;
    }
  };
};

// Debouncing utility
export function createDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

// Virtualization utility for large lists
export function createVirtualizedList<T>(
  items: T[],
  renderItem: (item: T, index: number) => React.ReactNode,
  threshold: number = DEFAULT_PERFORMANCE_CONFIG.virtualizationThreshold
): {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  threshold?: number;
  containerProps: {
    id: string;
    style: {
      height: string;
      overflow: string;
    };
  };
} {
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: threshold });
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleItems = React.useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);
  
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const newScrollTop = element.scrollTop;
    
    if (Math.abs(newScrollTop - scrollTop) > 50) { // Only update if significant scroll
      setScrollTop(newScrollTop);
      
      const elementHeight = element.clientHeight;
      const viewportHeight = window.innerHeight;
      const newVisibleEnd = Math.min(
        visibleRange.start + Math.ceil(viewportHeight / elementHeight) * 2,
        items.length
      );
      
      setVisibleRange({
        start: Math.max(0, newVisibleEnd - threshold),
        end: newVisibleEnd
      });
    }
  }, [scrollTop, visibleRange.start, visibleRange.end, items.length, threshold]);
  
  React.useEffect(() => {
    const element = document.getElementById('virtualized-list-container');
    if (element) {
      element.addEventListener('scroll', handleScroll as any);
    }
    
    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll as any);
      }
    };
  }, [handleScroll]);
  
  return {
    items: visibleItems,
    renderItem,
    containerProps: {
      id: 'virtualized-list-container',
      style: {
        height: '400px',
        overflow: 'auto'
      }
    }
  };
}

// Priority-based update scheduler
export class UpdateScheduler {
  private queue: Array<{ priority: number; fn: () => void; timestamp: number }> = [];
  private isProcessing: boolean = false;
  private config: PerformanceConfig;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_PERFORMANCE_CONFIG, ...config };
  }

  // Add update to queue
  add(priority: number, fn: () => void): void {
    this.queue.push({
      priority,
      fn,
      timestamp: Date.now()
    });
    
    this.queue.sort((a, b) => b.priority - a.priority);
    this.processQueue();
  }

  // Process queue based on priority
  private processQueue(): void {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    const processNext = () => {
      if (this.queue.length === 0) {
        this.isProcessing = false;
        return;
      }
      
      const item = this.queue.shift();
      if (item) {
        requestAnimationFrame(() => {
          item.fn();
          this.isProcessing = false;
          setTimeout(processNext, this.config.throttleDelay);
        });
      }
    };
    
    processNext();
  }

  // High-priority update for critical operations
  scheduleCritical(fn: () => void): void {
    this.add(0, fn); // Highest priority
  }
}

// Memory management utilities
export function createMemoryManager() {
  const cache = new Map<string, any>();
  const maxCacheSize = 100;
  
  return {
    get: (key: string) => cache.get(key),
    set: (key: string, value: any) => {
      if (cache.size >= maxCacheSize) {
        // Remove oldest entries
        const oldestKeys = Array.from(cache.keys()).slice(0, 10);
        oldestKeys.forEach(k => cache.delete(k));
      }
      cache.set(key, value);
    },
    clear: () => cache.clear(),
    size: () => cache.size
  };
}

// Performance optimization hook
export function usePerformanceOptimization(config?: Partial<PerformanceConfig>) {
  const monitor = React.useMemo(() => createPerformanceMonitor(config), [config]);
  
  React.useEffect(() => {
    monitor.start();
    return () => {
      monitor.stop();
    };
  }, [monitor]);
  
  return {
    monitor,
    throttle: React.useCallback(createThrottle, [config?.throttleDelay || DEFAULT_PERFORMANCE_CONFIG.throttleDelay]),
    debounce: React.useCallback(createDebounce, [config?.debounceDelay || DEFAULT_PERFORMANCE_CONFIG.debounceDelay]),
    virtualize: React.useCallback(createVirtualizedList, []),
    scheduler: React.useMemo(() => new UpdateScheduler(config), [config]),
    memoryManager: React.useMemo(() => createMemoryManager(), [])
  };
}

// Performance alert system
export class PerformanceAlertSystem {
  private alerts: Array<{ type: string; message: string; timestamp: number }> = [];
  private maxAlerts = 50;
  private alertThresholds = {
    fps: 30,
    frameTime: 16.67, // 60fps target
    memoryUsage: 0.8,
    cpuUsage: 0.7,
    priorityThreshold: 50
  };

  constructor(config?: Partial<PerformanceConfig>) {
    if (config?.priorityThreshold) {
      this.alertThresholds.priorityThreshold = config.priorityThreshold || 50;
    }
  }

  // Check performance against thresholds
  checkMetrics(metrics: PerformanceMetrics): void {
    const now = Date.now();
    
    // FPS alert
    if (metrics.fps < this.alertThresholds.fps && metrics.fps > 0) {
      this.addAlert('fps', `Low FPS detected: ${metrics.fps} (threshold: ${this.alertThresholds.fps})`);
    }
    
    // Frame time alert
    if (metrics.frameTime > this.alertThresholds.frameTime) {
      this.addAlert('frameTime', `High frame time: ${metrics.frameTime}ms (threshold: ${this.alertThresholds.frameTime}ms)`);
    }
    
    // Memory usage alert
    if (metrics.memoryUsage > this.alertThresholds.memoryUsage) {
      this.addAlert('memory', `High memory usage: ${(metrics.memoryUsage * 100).toFixed(1)}%`);
    }
    
    // CPU usage alert
    if (metrics.cpuUsage > this.alertThresholds.cpuUsage) {
      this.addAlert('cpu', `High CPU usage: ${(metrics.cpuUsage * 100).toFixed(1)}%`);
    }
    
    // Clean old alerts
    this.cleanOldAlerts(now);
  }

  private addAlert(type: string, message: string): void {
    this.alerts.push({
      type,
      message,
      timestamp: Date.now()
    });
    
    // Keep only recent alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }
    
    console.warn(`[Performance Alert] ${type}: ${message}`);
  }

  private cleanOldAlerts(now: number): void {
    const cutoffTime = now - 60000; // 1 minute
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffTime);
  }

  getAlerts(): Array<{ type: string; message: string; timestamp: number }> {
    return [...this.alerts];
  }

  clearAlerts(): void {
    this.alerts = [];
  }
}

// Export performance optimization utilities
export const performanceUtils = {
  createPerformanceMonitor,
  createThrottle,
  createDebounce,
  createVirtualizedList,
  UpdateScheduler,
  createMemoryManager,
  usePerformanceOptimization,
  PerformanceAlertSystem,
  DEFAULT_PERFORMANCE_CONFIG
};