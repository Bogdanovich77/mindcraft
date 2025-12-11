/**
 * Error Tracking Service
 * Integrates with Sentry for production error monitoring
 */

// Mock Sentry implementation for development (replace with actual Sentry when installed)
interface MockSentry {
  init: (config: any) => void;
  captureException: (error: any, context?: any) => string;
  captureMessage: (message: string, context?: any) => string;
  addBreadcrumb: (breadcrumb: any) => void;
  withScope: (callback: (scope: any) => void) => void;
  setUser: (user: any) => void;
  setTag: (key: string, value: string) => void;
  lastEventId: () => string | undefined;
  getCurrentHub: () => any;
  BrowserTracing: any;
  Replay: any;
  Scope: any;
}

const Sentry: MockSentry = {
  init: (config: any) => console.log('[Mock Sentry] Initialized with config:', config),
  captureException: (error: any, context?: any) => {
    console.error('[Mock Sentry] Exception:', error, context);
    return 'mock-event-id';
  },
  captureMessage: (message: string, context?: any) => {
    console.warn('[Mock Sentry] Message:', message, context);
    return 'mock-event-id';
  },
  addBreadcrumb: (breadcrumb: any) => console.log('[Mock Sentry] Breadcrumb:', breadcrumb),
  withScope: (callback: (scope: any) => void) => callback({ setContext: () => {}, setLevel: () => {} }),
  setUser: (user: any) => console.log('[Mock Sentry] User set:', user),
  setTag: (key: string, value: string) => console.log('[Mock Sentry] Tag set:', key, value),
  lastEventId: () => undefined,
  getCurrentHub: () => ({ getClient: () => ({ getScope: () => ({ getBreadcrumbs: () => [] }) }) }),
  BrowserTracing: class { constructor(config: any) { console.log('[Mock Sentry] BrowserTracing initialized'); } },
  Replay: class { constructor(config: any) { console.log('[Mock Sentry] Replay initialized'); } },
  Scope: class {},
};

// Type definitions for error tracking
interface ErrorContext {
  [key: string]: any;
}

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

// Error tracking configuration
interface ErrorTrackingConfig {
  dsn: string;
  environment: string;
  release?: string;
  userId?: string;
  tags?: Record<string, string>;
  beforeSend?: (event: any, hint: any) => any;
  ignoreErrors?: string[];
}

// Performance monitoring configuration
interface PerformanceConfig {
  enableTracing: boolean;
  tracesSampleRate: number;
  enableUserInteractionTracing: boolean;
  enableLongTaskTracking: boolean;
}

// User feedback configuration
interface FeedbackConfig {
  enabled: boolean;
  endpoint?: string;
  autoAttach?: boolean;
  collectUserAgent?: boolean;
  collectContext?: boolean;
}

class ErrorTrackingService {
  private config: ErrorTrackingConfig;
  private performanceConfig: PerformanceConfig;
  private feedbackConfig: FeedbackConfig;
  private isInitialized = false;

  constructor(config: ErrorTrackingConfig) {
    this.config = config;
    this.performanceConfig = {
      enableTracing: true,
      tracesSampleRate: 0.1,
      enableUserInteractionTracing: true,
      enableLongTaskTracking: true,
    };
    this.feedbackConfig = {
      enabled: false,
      autoAttach: false,
      collectUserAgent: true,
      collectContext: true,
    };
  }

  // Initialize error tracking
  initialize(performanceConfig?: PerformanceConfig, feedbackConfig?: FeedbackConfig): void {
    if (this.isInitialized || !this.shouldInitialize()) {
      return;
    }

    try {
      // Initialize Sentry
      Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        release: this.config.release || '1.0.0',
        integrations: [
          new Sentry.BrowserTracing({
            tracing: performanceConfig?.enableTracing ?? true,
            tracesSampleRate: performanceConfig?.tracesSampleRate ?? 0.1,
          }),
          new Sentry.Replay({
            sessionSampleRate: 0.1,
            errorSampleRate: 1.0,
          }),
        ],
        beforeSend: this.config.beforeSend,
        ignoreErrors: this.config.ignoreErrors || [],
        // Performance monitoring
        maxBreadcrumbs: 100,
        debug: this.config.environment === 'development',
        // User context
        initialScope: {
          tags: this.config.tags || {},
          user: this.config.userId ? { id: this.config.userId } : undefined,
        },
      });

      // Set up performance monitoring
      if (performanceConfig) {
        this.setupPerformanceMonitoring(performanceConfig);
      }

      // Set up user feedback
      if (feedbackConfig) {
        this.setupUserFeedback(feedbackConfig);
      }

      // Set up global error handlers
      this.setupGlobalErrorHandlers();

      this.isInitialized = true;
      console.log('[ErrorTracking] Initialized successfully');

    } catch (error) {
      console.error('[ErrorTracking] Initialization failed:', error);
    }
  }

  // Check if error tracking should be initialized
  private shouldInitialize(): boolean {
    return !!this.config.dsn && 
           this.config.environment !== 'development' ||
           'production' === 'production';
  }

  // Set up performance monitoring
  private setupPerformanceMonitoring(config: PerformanceConfig): void {
    if (!config.enableTracing) {
      return;
    }

    // Track user interactions
    if (config.enableUserInteractionTracing) {
      this.trackUserInteractions();
    }

    // Track long tasks
    if (config.enableLongTaskTracking) {
      this.trackLongTasks();
    }

    // Track web vitals
    this.trackWebVitals();
  }

  // Track user interactions
  private trackUserInteractions(): void {
    let lastInteractionTime = Date.now();

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const interactionTime = Date.now();
      const timeSinceLastInteraction = interactionTime - lastInteractionTime;

      // Add breadcrumb for user interaction
      Sentry.addBreadcrumb({
        message: `User clicked on ${target.tagName.toLowerCase()}${target.className ? `.${target.className}` : ''}`,
        category: 'user',
        level: 'info',
        data: {
          tagName: target.tagName,
          className: target.className,
          id: target.id,
          textContent: target.textContent?.substring(0, 100),
          timeSinceLastInteraction,
        },
      });

      lastInteractionTime = interactionTime;
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      Sentry.addBreadcrumb({
        message: `Form submitted: ${form.id || form.className || 'unnamed'}`,
        category: 'user',
        level: 'info',
        data: {
          formId: form.id,
          formClass: form.className,
          formAction: form.action,
          fields: Array.from(form.elements).length,
        },
      });
    });
  }

  // Track long tasks
  private trackLongTasks(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            Sentry.addBreadcrumb({
              message: `Long task detected: ${entry.name}`,
              category: 'performance',
              level: 'warning',
              data: {
                name: entry.name,
                duration: entry.duration,
                startTime: entry.startTime,
                entryType: entry.entryType,
              },
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
    }
  }

  // Track web vitals
  private trackWebVitals(): void {
    // Track Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          Sentry.addBreadcrumb({
            message: `LCP: ${Math.round(entry.startTime)}ms`,
            category: 'performance',
            level: 'info',
            data: {
              metric: 'LCP',
              value: entry.startTime,
              element: (entry as any).element?.tagName,
            },
          });
        }
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Track First Input Delay (FID)
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'first-input') {
          Sentry.addBreadcrumb({
            message: `FID: ${Math.round((entry as any).processingStart - entry.startTime)}ms`,
            category: 'performance',
            level: 'info',
            data: {
              metric: 'FID',
              value: (entry as any).processingStart - entry.startTime,
              inputType: (entry as any).name,
            },
          });
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          Sentry.addBreadcrumb({
            message: `CLS: ${clsValue.toFixed(4)}`,
            category: 'performance',
            level: clsValue > 0.1 ? 'warning' : 'info',
            data: {
              metric: 'CLS',
              value: clsValue,
              sources: (entry as any).sources,
            },
          });
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Set up user feedback
  private setupUserFeedback(config: FeedbackConfig): void {
    if (!config.enabled) {
      return;
    }

    // Create feedback widget
    this.createFeedbackWidget(config);

    // Track user satisfaction
    this.trackUserSatisfaction(config);
  }

  // Create feedback widget
  private createFeedbackWidget(config: FeedbackConfig): void {
    const widget = document.createElement('div');
    widget.id = 'feedback-widget';
    widget.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1976d2;
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9998;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      transition: all 0.3s ease;
    `;

    widget.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 4px;">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2H9v2h4zm-2 7h-2v2H9v-2h4z"/>
      </svg>
      Feedback
    `;

    widget.addEventListener('click', () => {
      this.showFeedbackDialog(config);
    });

    document.body.appendChild(widget);
  }

  // Show feedback dialog
  private showFeedbackDialog(config: FeedbackConfig): void {
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;

    dialog.innerHTML = `
      <div style="
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        max-width: 400px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <h3 style="margin: 0 0 16px 0; color: #1976d2;">Send Feedback</h3>
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">How satisfied are you with the dashboard?</label>
          <select id="satisfaction-rating" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="">Please select...</option>
            <option value="5">Very Satisfied</option>
            <option value="4">Satisfied</option>
            <option value="3">Neutral</option>
            <option value="2">Dissatisfied</option>
            <option value="1">Very Dissatisfied</option>
          </select>
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Additional comments (optional)</label>
          <textarea id="feedback-comments" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-height: 100px; resize: vertical;"></textarea>
        </div>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button id="cancel-feedback" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
          <button id="submit-feedback" style="padding: 8px 16px; border: none; background: #1976d2; color: white; border-radius: 4px; cursor: pointer;">Submit</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Handle dialog events
    const cancelBtn = document.getElementById('cancel-feedback');
    const submitBtn = document.getElementById('submit-feedback');

    cancelBtn?.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });

    submitBtn?.addEventListener('click', () => {
      this.submitFeedback(config, dialog);
    });

    // Close on backdrop click
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        document.body.removeChild(dialog);
      }
    });
  }

  // Submit feedback
  private submitFeedback(config: FeedbackConfig, dialog: HTMLElement): void {
    const rating = (document.getElementById('satisfaction-rating') as HTMLSelectElement).value;
    const comments = (document.getElementById('feedback-comments') as HTMLTextAreaElement).value;

    if (!rating) {
      alert('Please select a satisfaction rating');
      return;
    }

    // Send feedback to server
    if (config.endpoint) {
      fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: parseInt(rating),
          comments,
          timestamp: Date.now(),
          userAgent: config.collectUserAgent ? navigator.userAgent : undefined,
          url: window.location.href,
          context: config.collectContext ? this.getPageContext() : undefined,
        }),
      }).catch(error => {
        console.error('Failed to submit feedback:', error);
      });
    }

    // Track feedback event
    Sentry.addBreadcrumb({
      message: 'User submitted feedback',
      category: 'user',
      level: 'info',
      data: {
        rating: parseInt(rating),
        hasComments: !!comments,
        commentsLength: comments.length,
      },
    });

    document.body.removeChild(dialog);
  }

  // Get page context
  private getPageContext(): any {
    return {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timestamp: Date.now(),
    };
  }

  // Track user satisfaction
  private trackUserSatisfaction(config: FeedbackConfig): void {
    // Track page views for satisfaction calculation
    let pageViews = 0;
    let sessionStart = Date.now();

    const trackPageView = () => {
      pageViews++;
      const sessionDuration = Date.now() - sessionStart;

      // Trigger satisfaction survey after 5 page views or 10 minutes
      if (pageViews >= 5 || sessionDuration >= 10 * 60 * 1000) {
        this.showSatisfactionSurvey(config);
      }
    };

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        trackPageView();
      }
    });

    // Initial page view
    trackPageView();
  }

  // Show satisfaction survey
  private showSatisfactionSurvey(config: FeedbackConfig): void {
    if (config.autoAttach) {
      this.createFeedbackWidget(config);
    }
  }

  // Set up global error handlers
  private setupGlobalErrorHandlers(): void {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      Sentry.captureException(event.reason, {
        contexts: {
          unhandledrejection: {
            promise: event.promise,
            reason: event.reason,
          },
        },
      });
    });

    // Global JavaScript errors
    window.addEventListener('error', (event) => {
      Sentry.captureException(event.error, {
        contexts: {
          globalerror: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        },
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        Sentry.captureMessage(`Resource loading failed: ${(event.target as any).src || (event.target as any).href}`, {
          level: 'warning',
          contexts: {
            resourceerror: {
              elementType: (event.target as any).tagName,
              source: (event.target as any).src || (event.target as any).href,
            },
          },
        });
      }
    }, true);
  }

  // Manual error reporting
  reportError(error: Error, context?: ErrorContext, level: SeverityLevel = 'error'): void {
    if (!this.isInitialized) {
      console.error('[ErrorTracking] Not initialized, cannot report error');
      return;
    }

    Sentry.withScope((scope: any) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }

      scope.setLevel(level);
      Sentry.captureException(error);
    });
  }

  // Manual message reporting
  reportMessage(message: string, level: SeverityLevel = 'info', context?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.error('[ErrorTracking] Not initialized, cannot report message');
      return;
    }

    Sentry.withScope((scope: any) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }

      scope.setLevel(level);
      Sentry.captureMessage(message);
    });
  }

  // Add breadcrumb
  addBreadcrumb(message: string, category?: string, level?: SeverityLevel, data?: Record<string, any>): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
    });
  }

  // Set user context
  setUser(userId: string, email?: string, username?: string): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  }

  // Clear user context
  clearUser(): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.setUser(null);
  }

  // Add custom tag
  setTag(key: string, value: string): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.setTag(key, value);
  }

  // Get diagnostics
  getDiagnostics(): any {
    if (!this.isInitialized) {
      return { error: 'Error tracking not initialized' };
    }

    return {
      initialized: this.isInitialized,
      environment: this.config.environment,
      dsn: this.config.dsn,
      lastEvent: Sentry.lastEventId(),
      breadcrumbs: Sentry.getCurrentHub().getClient()?.getScope()?.getBreadcrumbs(),
    };
  }

  // Check health
  async checkHealth(): Promise<{ healthy: boolean; details: any }> {
    try {
      // Test error reporting
      const testError = new Error('Health check test');
      const eventId = Sentry.captureException(testError);
      
      return {
        healthy: !!eventId,
        details: {
          errorReporting: !!eventId,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: (error as Error).message },
      };
    }
  }
}

// Create singleton instance
let errorTrackingService: ErrorTrackingService | null = null;

// Factory function
export function createErrorTrackingService(config: ErrorTrackingConfig): ErrorTrackingService {
  if (!errorTrackingService) {
    errorTrackingService = new ErrorTrackingService(config);
  }
  return errorTrackingService;
}

// Get service instance
export function getErrorTrackingService(): ErrorTrackingService | null {
  return errorTrackingService;
}

export default ErrorTrackingService;