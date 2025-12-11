import { lazy, Suspense } from 'react';
import type { ComponentType, ReactNode } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';

interface LazyComponentOptions {
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  preload?: boolean;
  timeout?: number;
}

/**
 * Enhanced lazy loading with error handling and preloading
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
) {
  const {
    fallback = (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Loading component...
        </Typography>
      </Box>
    ),
    errorFallback = (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          flexDirection: 'column',
          gap: 2,
          p: 3,
        }}
      >
        <Typography variant="h6" color="error.main" gutterBottom>
          Failed to load component
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please refresh the page and try again.
        </Typography>
      </Box>
    ),
    timeout = 10000,
  } = options;

  // Create lazy component with timeout
  const LazyComponent = lazy(() => {
    return Promise.race([
      importFunc(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Component loading timeout')), timeout)
      ),
    ]);
  });

  // Preload if requested
  if (options.preload) {
    importFunc().catch(() => {
      // Silently fail preload
    });
  }

  // Return component with error boundary and suspense
  return function LazyWrapper(props: any) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Preload multiple components in parallel
 */
export function preloadComponents(
  importFunctions: Array<() => Promise<{ default: ComponentType<any> }>>
): Promise<void[]> {
  const promises = importFunctions.map(async (importFunc) => {
    try {
      await importFunc();
      return Promise.resolve();
    } catch (error) {
      console.warn('Failed to preload component:', error);
      return Promise.resolve();
    }
  });

  return Promise.all(promises);
}

/**
 * Create a lazy loaded route with enhanced error handling
 */
export function createLazyRoute<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  routeOptions: {
    preloadOnHover?: boolean;
    preloadOnFocus?: boolean;
    customFallback?: ReactNode;
  } = {}
) {
  const {
    preloadOnHover = false,
    preloadOnFocus = false,
    customFallback,
  } = routeOptions;

  const LazyComponent = createLazyComponent(importFunc, {
    fallback: customFallback,
  });

  let preloadTimeout: number | null = null;

  // Enhanced component with preloading capabilities
  return function LazyRoute(props: any) {
    const handleMouseEnter = () => {
      if (preloadOnHover && !preloadTimeout) {
        preloadTimeout = window.setTimeout(() => {
          importFunc().catch(() => {
            // Silently fail preload
          });
        }, 100);
      }
    };

    const handleMouseLeave = () => {
      if (preloadTimeout) {
        clearTimeout(preloadTimeout);
        preloadTimeout = null;
      }
    };

    const handleFocus = () => {
      if (preloadOnFocus) {
        importFunc().catch(() => {
          // Silently fail preload
        });
      }
    };

    React.useEffect(() => {
      return () => {
        if (preloadTimeout) {
          clearTimeout(preloadTimeout);
        }
      };
    }, []);

    return (
      <div
        onMouseEnter={preloadOnHover ? handleMouseEnter : undefined}
        onMouseLeave={preloadOnHover ? handleMouseLeave : undefined}
        onFocus={preloadOnFocus ? handleFocus : undefined}
      >
        <LazyComponent {...props} />
      </div>
    );
  };
}

/**
 * Intersection Observer based lazy loading for better performance
 */
export function createIntersectionLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: {
    rootMargin?: string;
    threshold?: number;
    fallback?: ReactNode;
  } = {}
) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    fallback,
  } = options;

  const LazyComponent = createLazyComponent(importFunc, { fallback });

  return function IntersectionLazyWrapper(props: any) {
    const [shouldLoad, setShouldLoad] = React.useState(false);
    const [elementRef, setElementRef] = React.useState<HTMLDivElement | null>(null);

    React.useEffect(() => {
      if (!elementRef) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin,
          threshold,
        }
      );

      observer.observe(elementRef);

      return () => {
        observer.disconnect();
      };
    }, [elementRef, rootMargin, threshold]);

    return (
      <div ref={setElementRef}>
        {shouldLoad ? <LazyComponent {...props} /> : fallback}
      </div>
    );
  };
}

/**
 * Network-aware lazy loading
 */
export function createNetworkAwareLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: {
    fastNetworkFallback?: ReactNode;
    slowNetworkFallback?: ReactNode;
    offlineFallback?: ReactNode;
  } = {}
) {
  const {
    fastNetworkFallback,
    slowNetworkFallback,
    offlineFallback,
  } = options;

  const [networkType, setNetworkType] = React.useState<'fast' | 'slow' | 'offline'>('fast');

  React.useEffect(() => {
    const updateNetworkType = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (!navigator.onLine) {
        setNetworkType('offline');
      } else if (connection) {
        const effectiveType = connection.effectiveType;
        setNetworkType(
          effectiveType === '4g' || effectiveType === 'wifi' ? 'fast' : 'slow'
        );
      } else {
        // Fallback: test with a small request
        const startTime = Date.now();
        fetch('/api/health', { method: 'HEAD' })
          .then(() => {
            const duration = Date.now() - startTime;
            setNetworkType(duration < 500 ? 'fast' : 'slow');
          })
          .catch(() => setNetworkType('offline'));
      }
    };

    updateNetworkType();

    const handleOnline = () => updateNetworkType();
    const handleOffline = () => setNetworkType('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getFallback = () => {
    switch (networkType) {
      case 'offline':
        return offlineFallback;
      case 'slow':
        return slowNetworkFallback;
      default:
        return fastNetworkFallback;
    }
  };

  const LazyComponent = createLazyComponent(importFunc, {
    fallback: getFallback(),
  });

  return <LazyComponent />;
}

/**
 * Memory-efficient component unloading
 */
export function createMemoryEfficientLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: {
    maxMemoryUsage?: number; // in MB
    unloadOnBlur?: boolean;
  } = {}
) {
  const {
    maxMemoryUsage = 50, // 50MB default
    unloadOnBlur = true,
  } = options;

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [componentInstance, setComponentInstance] = React.useState<T | null>(null);

  const loadComponent = React.useCallback(async () => {
    try {
      const module = await importFunc();
      setComponentInstance(module.default);
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load component:', error);
    }
  }, []);

  const unloadComponent = React.useCallback(() => {
    setComponentInstance(null);
    setIsLoaded(false);
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
  }, []);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (unloadOnBlur && document.hidden && isLoaded) {
        unloadComponent();
      }
    };

    const handleMemoryPressure = () => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        const usedMemory = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
        
        if (usedMemory > maxMemoryUsage && isLoaded) {
          console.warn(`Memory usage (${usedMemory.toFixed(2)}MB) exceeds threshold (${maxMemoryUsage}MB), unloading component`);
          unloadComponent();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Monitor memory pressure
    const memoryInterval = setInterval(handleMemoryPressure, 5000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(memoryInterval);
    };
  }, [unloadOnBlur, isLoaded, maxMemoryUsage, unloadComponent]);

  React.useEffect(() => {
    if (!isLoaded && !document.hidden) {
      loadComponent();
    }
  }, [isLoaded, loadComponent]);

  if (componentInstance) {
    const Component = componentInstance;
    return <Component />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
      }}
    >
      <Typography>Loading component...</Typography>
    </Box>
  );
}

// Export a registry for tracking loaded components
export const ComponentRegistry = {
  loaded: new Set<string>(),
  loading: new Set<string>(),
  failed: new Set<string>(),

  markAsLoading(componentName: string) {
    this.loading.add(componentName);
  },

  markAsLoaded(componentName: string) {
    this.loading.delete(componentName);
    this.loaded.add(componentName);
  },

  markAsFailed(componentName: string) {
    this.loading.delete(componentName);
    this.failed.add(componentName);
  },

  getStatus(componentName: string): 'loaded' | 'loading' | 'failed' | 'not-started' {
    if (this.loaded.has(componentName)) return 'loaded';
    if (this.loading.has(componentName)) return 'loading';
    if (this.failed.has(componentName)) return 'failed';
    return 'not-started';
  },

  getStats() {
    return {
      total: this.loaded.size + this.loading.size + this.failed.size,
      loaded: this.loaded.size,
      loading: this.loading.size,
      failed: this.failed.size,
    };
  },
};