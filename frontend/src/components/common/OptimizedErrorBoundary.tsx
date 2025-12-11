import React, { Component, Suspense } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  AlertTitle,
} from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class OptimizedErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log to error tracking service
    if (import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true') {
      this.logErrorToService(error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Log to Sentry if available
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        });
      }

      // Log to console in development
      if (import.meta.env.DEV) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
      });

      // Clear any existing retry timeout
      if (this.retryTimeoutId) {
        clearTimeout(this.retryTimeoutId);
      }

      // Set a new retry timeout
      this.retryTimeoutId = setTimeout(() => {
        this.retryTimeoutId = null;
      }, 1000);
    }
  };

  private getErrorSeverity = (error: Error): 'error' | 'warning' => {
    // Determine error severity based on error type and message
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'warning';
    }
    return 'error';
  };

  private getErrorMessage = (error: Error): string => {
    // Provide user-friendly error messages
    if (error.name === 'ChunkLoadError') {
      return 'Failed to load application resources. Please refresh the page.';
    }
    if (error.message.includes('Network Error')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    if (import.meta.env.PROD) {
      return 'An unexpected error occurred. Please try again.';
    }
    return error.message;
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback, enableRetry = true, maxRetries = 3 } = this.props;

    if (hasError && error) {
      // Custom fallback UI
      if (fallback) {
        return <>{fallback}</>;
      }

      const severity = this.getErrorSeverity(error);
      const canRetry = enableRetry && retryCount < maxRetries;

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3,
            backgroundColor: 'background.default',
          }}
        >
          <Card
            sx={{
              maxWidth: 600,
              width: '100%',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <ErrorIcon
                sx={{
                  fontSize: 64,
                  color: severity === 'error' ? 'error.main' : 'warning.main',
                  mb: 2,
                }}
              />

              <Alert severity={severity} sx={{ mb: 3 }}>
                <AlertTitle>
                  {severity === 'error' ? 'Application Error' : 'Loading Error'}
                </AlertTitle>
                {this.getErrorMessage(error)}
              </Alert>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Error ID: {Date.now().toString(36)}
                {retryCount > 0 && ` (Retry ${retryCount}/${maxRetries})`}
              </Typography>

              {canRetry && (
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                  size="large"
                  sx={{ mr: 2 }}
                >
                  Retry
                </Button>
              )}

              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                size="large"
              >
                Refresh Page
              </Button>

              {import.meta.env.DEV && error && (
                <Box sx={{ mt: 3, textAlign: 'left' }}>
                  <Typography variant="h6" gutterBottom>
                    Development Error Details:
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      backgroundColor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: 200,
                    }}
                  >
                    {error.stack}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      );
    }

    return (
      <Suspense
        fallback={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100vh',
            }}
          >
            <Typography>Loading...</Typography>
          </Box>
        }
      >
        {children}
      </Suspense>
    );
  }
}

export default React.memo(OptimizedErrorBoundary);