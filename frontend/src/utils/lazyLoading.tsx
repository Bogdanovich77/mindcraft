/**
 * Lazy Loading Utilities
 * Implements code splitting and lazy loading for React components
 */

import { lazy, ComponentType, Suspense } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Loading component for lazy loaded components
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
    flexDirection="column"
    gap={2}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="textSecondary">
      Loading component...
    </Typography>
  </Box>
);

// Error fallback for lazy loaded components
const ErrorFallback = ({ error }: { error: Error }) => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
    flexDirection="column"
    gap={2}
    p={3}
  >
    <Typography variant="h6" color="error" gutterBottom>
      Failed to load component
    </Typography>
    <Typography variant="body2" color="textSecondary">
      {error.message}
    </Typography>
  </Box>
);

// Enhanced lazy loading with error boundary and loading states
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: {
    fallback?: ComponentType<{ error: Error }>;
    loading?: ComponentType;
    preload?: boolean;
    retryLimit?: number;
  } = {}
  ) {
  const {
    fallback: ErrorFallbackComponent = ErrorFallback,
    loading: LoadingComponent = LoadingFallback,
    preload = false,
    retryLimit = 3
  } = options;

  const LazyComponent = lazy(() => {
    return importFunc()
      .catch(error => {
        console.error('Lazy loading failed:', error);
        
        // Retry logic
        let retries = 0;
        const retry = (): Promise<{ default: T }> => {
          if (retries >= retryLimit) {
            throw error;
          }
          retries++;
          console.log(`Retrying lazy load (${retries}/${retryLimit})...`);
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(importFunc());
            }, 1000 * retries); // Exponential backoff
          });
        };
        
        return retry();
      });
  }, {
    // Add component name for debugging
    componentName: importFunc.name || 'LazyComponent'
  });

  // Preload if requested
  if (preload && typeof importFunc === 'function') {
    // Start preloading in background
    importFunc().catch(error => {
      console.warn('Preload failed:', error);
    });
  }

  const WrappedComponent = (props: any) => (
    <ErrorBoundary fallback={<ErrorFallbackComponent error={new Error('Component failed to load')} />}>
      <Suspense fallback={<LoadingComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );

  // Add display name for debugging
  WrappedComponent.displayName = `Lazy(${importFunc.name || 'Component'})`;
  
  return WrappedComponent;
}

// Preload multiple components
export function preloadComponents(importFuncs: Array<() => Promise<any>>) {
  return Promise.all(
    importFuncs.map(importFunc => 
      importFunc().catch(error => {
        console.warn('Preload failed:', error);
        return null;
      })
    )
  );
}

// Lazy load with intersection observer for better performance
export function createIntersectionLazy<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: {
    rootMargin?: string;
    threshold?: number;
    fallback?: ComponentType<{ error: Error }>;
    loading?: ComponentType;
  } = {}
  ) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    fallback: ErrorFallbackComponent = ErrorFallback,
    loading: LoadingComponent = LoadingFallback
  } = options;

  const LazyComponent = createLazyComponent(importFunc, {
    fallback: ErrorFallbackComponent,
    loading: LoadingComponent
  });

  return function IntersectionLazyComponent(props: any) {
    const [ref, setRef] = React.useState<HTMLElement | null>(null);
    const [shouldLoad, setShouldLoad] = React.useState(false);

    React.useEffect(() => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin,
          threshold
        }
      );

      observer.observe(ref);

      return () => {
        observer.disconnect();
      };
    }, [ref, rootMargin, threshold]);

    if (shouldLoad) {
      return <LazyComponent {...props} />;
    }

    return (
      <div ref={setRef} style={{ minHeight: '200px' }}>
        <LoadingComponent />
      </div>
    );
  };
}

// Route-based lazy loading for React Router
export function createLazyRoute(importFunc: () => Promise<{ default: any }>) {
  return {
    lazy: createLazyComponent(importFunc),
    preload: () => importFunc().catch(error => {
      console.warn('Route preload failed:', error);
    })
  };
}

// Batch lazy loading for multiple components
export function createBatchLazy<T extends Record<string, ComponentType<any>>>(
  importFuncs: Record<keyof T, () => Promise<{ default: T[keyof T] }>>
) {
  const LazyComponents: Partial<T> = {};
  
  Object.entries(importFuncs).forEach(([key, importFunc]) => {
    LazyComponents[key as keyof T] = createLazyComponent(importFunc);
  });

  return LazyComponents as T;
}

// Progressive loading with priority levels
export function createProgressiveLazy<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  priority: 'high' | 'medium' | 'low' = 'medium'
) {
  const LazyComponent = lazy(() => {
    // Add priority-based delay for testing
    const delay = priority === 'high' ? 0 : priority === 'medium' ? 100 : 300;
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(importFunc());
      }, delay);
    });
  });

  return function ProgressiveLazyComponent(props: any) {
    return (
      <ErrorBoundary fallback={<ErrorFallback error={new Error('Progressive component failed to load')} />}>
        <Suspense fallback={<LoadingFallback />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// Utility to check if component is already loaded
export function isComponentLoaded(componentName: string): boolean {
  try {
    // Check if component is in the global scope or module cache
    return !!(window as any)[componentName] || 
           !!(window as any).__webpack_require__cache__?.[componentName];
  } catch {
    return false;
  }
}

// Get loading statistics
export function getLoadingStats() {
  return {
    componentsLoaded: Object.keys((window as any).__webpack_require__cache__ || {}).length,
    memoryUsage: performance.memory ? {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
    } : null,
    networkInfo: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt
    } : null
  };
}

// Preload critical resources
export function preloadCriticalResources(resources: string[]) {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    // Determine resource type
    if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
      link.as = 'image';
    } else if (resource.match(/\.(woff|woff2|ttf|eot)$/)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
}

// Export common lazy loaded components
export const LazyComponents = {
  // Dashboard components
  AgentOverview: createLazyComponent(() => import('../components/dashboard/AgentOverview')),
  PerformanceMetrics: createLazyComponent(() => import('../components/performance/PerformanceMetrics')),
  SystemHealth: createLazyComponent(() => import('../components/performance/SystemHealth')),
  
  // Tab components
  PersonalityTab: createLazyComponent(() => import('../components/tabs/PersonalityTab')),
  MemoryTab: createLazyComponent(() => import('../components/tabs/MemoryTab')),
  GoalsTab: createLazyComponent(() => import('../components/tabs/GoalsTab')),
  SocialTab: createLazyComponent(() => import('../components/tabs/SocialTab')),
  SkillsTab: createLazyComponent(() => import('../components/tabs/SkillsTab')),
  
  // Modal components
  SkillDetailsModal: createLazyComponent(() => import('../components/modals/SkillDetailsModal')),
  AgentDetailsModal: createLazyComponent(() => import('../components/modals/AgentDetailsModal')),
  
  // Visualization components
  D3CognitiveGraph: createLazyComponent(() => import('../components/visualizers/D3CognitiveGraph')),
  RechartsAnalytics: createLazyComponent(() => import('../components/visualizers/RechartsAnalytics'))
};

export default {
  createLazyComponent,
  createIntersectionLazy,
  createLazyRoute,
  createBatchLazy,
  createProgressiveLazy,
  preloadComponents,
  preloadCriticalResources,
  isComponentLoaded,
  getLoadingStats,
  LazyComponents
};