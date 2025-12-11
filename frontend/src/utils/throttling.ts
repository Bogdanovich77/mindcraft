/**
 * Throttling and Backpressure Handling Utilities
 * 
 * Provides performance optimization mechanisms for high-frequency Socket.IO events
 * including throttling, debouncing, batch processing, and backpressure control.
 */

// Types for throttling and backpressure
export interface ThrottleConfig {
  interval: number; // milliseconds
  maxCalls?: number;
  leading?: boolean; // call on first trigger
  trailing?: boolean; // call on last trigger
}

export interface DebounceConfig {
  delay: number; // milliseconds
  maxWait?: number; // maximum wait time
  leading?: boolean; // call on first trigger
  trailing?: boolean; // call on last trigger
}

export interface BatchConfig {
  maxSize: number;
  maxWait: number; // milliseconds
  processor: (items: any[]) => void;
}

export interface BackpressureConfig {
  maxQueueSize: number;
  dropStrategy: 'oldest' | 'newest' | 'priority';
  priorityFn?: (item: any) => number; // higher number = higher priority
}

export interface ThrottledFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
  pending(): boolean;
}

export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
  pending(): boolean;
}

export interface Batcher<T> {
  add(item: T): void;
  flush(): void;
  clear(): void;
  size(): number;
}

export interface BackpressureQueue<T> {
  add(item: T): boolean; // returns false if dropped
  size(): number;
  clear(): void;
  process(): T[]; // get items to process
}

/**
 * Throttle function calls to a maximum frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  config: ThrottleConfig
): ThrottledFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastArgs: Parameters<T> | null = null;
  let pending = false;

  const throttled = (...args: Parameters<T>) => {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;

  // Reset pending flag when new call comes in
  pending = true;

  if (config.leading && timeSinceLastCall >= config.interval) {
    // Leading edge - call immediately
    lastCallTime = now;
    func(...args);
    pending = false;
    return;
  }

  if (timeoutId) {
    // Update last args for trailing edge
    lastArgs = args;
    return;
  }

  if (timeSinceLastCall >= config.interval) {
    // Enough time has passed
    lastCallTime = now;
    func(...args);
    pending = false;
  } else {
    // Schedule for later
    lastArgs = args;
    timeoutId = setTimeout(() => {
      if (config.trailing && lastArgs) {
        lastCallTime = Date.now();
        func(...lastArgs);
      }
      timeoutId = null;
      lastArgs = null;
      pending = false;
    }, config.interval - timeSinceLastCall);
  }
};

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    pending = false;
  };

  throttled.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      lastCallTime = Date.now();
      func(...lastArgs);
      timeoutId = null;
      lastArgs = null;
      pending = false;
    }
  };

  throttled.pending = () => pending;

  return throttled;
}

/**
 * Debounce function calls to wait for a pause in execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  config: DebounceConfig
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastArgs: Parameters<T> | null = null;
  let maxWaitTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let pending = false;

  const debounced = (...args: Parameters<T>) => {
    const now = Date.now();
    const shouldCallLeading = config.leading && !pending;
    
    lastArgs = args;
    pending = true;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set up max wait if configured
    if (config.maxWait && !maxWaitTimeoutId) {
      maxWaitTimeoutId = setTimeout(() => {
        if (lastArgs) {
          func.apply(this, lastArgs);
          maxWaitTimeoutId = null;
          timeoutId = null;
          lastArgs = null;
          pending = false;
        }
      }, config.maxWait);
    }

    if (shouldCallLeading) {
      lastCallTime = now;
      func(...args);
      pending = false;
      return;
    }

    timeoutId = setTimeout(() => {
      if (config.trailing && lastArgs) {
        lastCallTime = now;
        func(...lastArgs);
      }
      timeoutId = null;
      maxWaitTimeoutId = null;
      lastArgs = null;
      pending = false;
    }, config.delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (maxWaitTimeoutId) {
      clearTimeout(maxWaitTimeoutId);
      maxWaitTimeoutId = null;
    }
    lastArgs = null;
    pending = false;
  };

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      clearTimeout(maxWaitTimeoutId!);
      lastCallTime = Date.now();
      func.apply(this, lastArgs);
      timeoutId = null;
      maxWaitTimeoutId = null;
      lastArgs = null;
      pending = false;
    }
  };

  debounced.pending = () => pending;

  return debounced;
}

/**
 * Batch processor for handling high-frequency events
 */
export function createBatcher<T>(config: BatchConfig): Batcher<T> {
  let items: T[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const processBatch = () => {
    if (items.length > 0) {
      const batchToProcess = items.splice(0); // Clear array
      config.processor(batchToProcess);
    }
    timeoutId = null;
  };

  return {
    add(item: T) {
      items.push(item);

      // Process immediately if batch is full
      if (items.length >= config.maxSize) {
        processBatch();
        return;
      }

      // Schedule processing if not already scheduled
      if (!timeoutId) {
        timeoutId = setTimeout(processBatch, config.maxWait);
      }
    },

    flush() {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      processBatch();
    },

    clear() {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      items = [];
    },

    size() {
      return items.length;
    }
  };
}

/**
 * Backpressure queue for handling high-volume data streams
 */
export function createBackpressureQueue<T>(config: BackpressureConfig): BackpressureQueue<T> {
  let items: T[] = [];

  return {
    add(item: T): boolean {
      // Check if we need to drop items
      if (items.length >= config.maxQueueSize) {
        switch (config.dropStrategy) {
          case 'oldest':
            items.shift();
            items.push(item);
            return true;
            
          case 'newest':
            // Drop the new item
            return false;
            
          case 'priority':
            if (config.priorityFn) {
              const newItemPriority = config.priorityFn(item);
              // Find the lowest priority item
              let minPriority = Infinity;
              let minIndex = -1;
              
              for (let i = 0; i < items.length; i++) {
                const priority = config.priorityFn!(items[i]);
                if (priority < minPriority) {
                  minPriority = priority;
                  minIndex = i;
                }
              }
              
              // Replace if new item has higher priority
              if (newItemPriority > minPriority) {
                items[minIndex] = item;
                return true;
              }
            }
            return false;
            
          default:
            return false;
        }
      }

      items.push(item);
      return true;
    },

    size(): number {
      return items.length;
    },

    clear(): void {
      items = [];
    },

    process(): T[] {
      const toProcess = items.splice(0); // Clear and return all items
      return toProcess;
    }
  };
}

/**
 * Adaptive throttling that adjusts based on system performance
 */
export class AdaptiveThrottle<T extends (...args: any[]) => any> {
  private func: T;
  private baseInterval: number;
  private currentInterval: number;
  private lastCallTime = 0;
  private callCount = 0;
  private errorCount = 0;
  private performanceHistory: number[] = [];
  private maxHistorySize = 10;
  private adjustmentFactor = 1.5;

  constructor(func: T, baseInterval: number) {
    this.func = func;
    this.baseInterval = baseInterval;
    this.currentInterval = baseInterval;
  }

  call(...args: Parameters<T>): void {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;

    if (timeSinceLastCall >= this.currentInterval) {
      const startTime = performance.now();
      
      try {
        this.func.apply(this, args);
        this.callCount++;
        
        const duration = performance.now() - startTime;
        this.recordPerformance(duration);
        
        // Adjust interval based on performance
        this.adjustInterval();
      } catch (error) {
        this.errorCount++;
        // Slow down on errors
        this.currentInterval = Math.min(this.currentInterval * this.adjustmentFactor, this.baseInterval * 10);
      }
      
      this.lastCallTime = now;
    }
  }

  private recordPerformance(duration: number): void {
    this.performanceHistory.push(duration);
    if (this.performanceHistory.length > this.maxHistorySize) {
      this.performanceHistory.shift();
    }
  }

  private adjustInterval(): void {
    if (this.performanceHistory.length < 3) return;

    const avgDuration = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
    const errorRate = this.errorCount / (this.callCount + this.errorCount);

    // Adjust based on performance and error rate
    if (avgDuration > 100 || errorRate > 0.1) {
      // Slow down if slow performance or high error rate
      this.currentInterval = Math.min(this.currentInterval * this.adjustmentFactor, this.baseInterval * 5);
    } else if (avgDuration < 20 && errorRate < 0.01) {
      // Speed up if good performance and low error rate
      this.currentInterval = Math.max(this.currentInterval / this.adjustmentFactor, this.baseInterval * 0.2);
    } else {
      // Gradually return to base interval
      const diff = this.currentInterval - this.baseInterval;
      this.currentInterval -= diff * 0.1;
    }
  }

  getCurrentInterval(): number {
    return this.currentInterval;
  }

  reset(): void {
    this.currentInterval = this.baseInterval;
    this.callCount = 0;
    this.errorCount = 0;
    this.performanceHistory = [];
  }
}

/**
 * Priority-based event scheduler
 */
export class PriorityEventScheduler {
  private queues: Map<string, any[]> = new Map();
  private processors: Map<string, (items: any[]) => void> = new Map();
  private intervals: Map<string, ReturnType<typeof setInterval>> = new Map();

  schedule(
    priority: string,
    item: any,
    processor: (items: any[]) => void,
    interval: number = 100
  ): void {
    // Initialize queue if needed
    if (!this.queues.has(priority)) {
      this.queues.set(priority, []);
      this.processors.set(priority, processor);
      
      // Set up interval processing
      const intervalId = setInterval(() => {
        this.processQueue(priority);
      }, interval);
      this.intervals.set(priority, intervalId);
    }

    // Add item to queue
    this.queues.get(priority)!.push(item);
  }

  private processQueue(priority: string): void {
    const queue = this.queues.get(priority);
    const processor = this.processors.get(priority);

    if (queue && processor && queue.length > 0) {
      const items = queue.splice(0); // Take all items
      processor(items);
    }
  }

  removePriority(priority: string): void {
    const intervalId = this.intervals.get(priority);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(priority);
    }
    this.queues.delete(priority);
    this.processors.delete(priority);
  }

  clear(): void {
    // Clear all intervals
    for (const intervalId of this.intervals.values()) {
      clearInterval(intervalId);
    }
    this.queues.clear();
    this.processors.clear();
    this.intervals.clear();
  }
}

/**
 * Utility functions for common throttling scenarios
 */
export const createEventThrottlers = () => {
  // High-frequency events (position, movement)
  const highFrequencyThrottle = <T extends (...args: any[]) => any>(func: T) =>
    throttle(func, { interval: 50, leading: true, trailing: false });

  // Medium-frequency events (goal updates, skill progress)
  const mediumFrequencyThrottle = <T extends (...args: any[]) => any>(func: T) =>
    throttle(func, { interval: 200, leading: true, trailing: true });

  // Low-frequency events (system status, alerts)
  const lowFrequencyThrottle = <T extends (...args: any[]) => any>(func: T) =>
    throttle(func, { interval: 1000, leading: false, trailing: true });

  // Debounced events (search, filtering)
  const debounceEvents = <T extends (...args: any[]) => any>(func: T) =>
    debounce(func, { delay: 300, leading: false, trailing: true });

  return {
    highFrequencyThrottle,
    mediumFrequencyThrottle,
    lowFrequencyThrottle,
    debounceEvents
  };
};

/**
 * Performance monitor for throttling effectiveness
 */
export class ThrottlingMonitor {
  private metrics: Map<string, { calls: number; dropped: number; avgInterval: number }> = new Map();

  recordCall(key: string, interval: number, dropped: boolean = false): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, { calls: 0, dropped: 0, avgInterval: 0 });
    }

    const metric = this.metrics.get(key)!;
    metric.calls++;
    if (dropped) metric.dropped++;
    
    // Update average interval
    metric.avgInterval = (metric.avgInterval * (metric.calls - 1) + interval) / metric.calls;
  }

  getMetrics(key: string) {
    return this.metrics.get(key);
  }

  getAllMetrics() {
    return Object.fromEntries(this.metrics);
  }

  reset(key?: string): void {
    if (key) {
      this.metrics.delete(key);
    } else {
      this.metrics.clear();
    }
  }
}

// Default configurations for different event types
export const DEFAULT_THROTTLE_CONFIGS = {
  position: { interval: 50, leading: true, trailing: false },
  movement: { interval: 50, leading: true, trailing: false },
  health: { interval: 100, leading: true, trailing: false },
  inventory: { interval: 200, leading: true, trailing: true },
  skills: { interval: 500, leading: false, trailing: true },
  goals: { interval: 1000, leading: false, trailing: true },
  social: { interval: 2000, leading: false, throttling: true },
  memory: { interval: 3000, leading: false, trailing: true },
  performance: { interval: 5000, leading: false, trailing: true },
  system: { interval: 10000, leading: false, trailing: true }
} as const;