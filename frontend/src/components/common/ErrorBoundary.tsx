import React, { Component, ReactNode, useCallback } from 'react';

// Define ErrorInfo interface locally to avoid import issues
interface ErrorInfo {
  componentStack?: string;
  errorBoundary?: boolean;
}
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  Collapse,
  Chip
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  showRetry?: boolean;
  maxRetries?: number;
  errorId?: string;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  onRetry,
  showRetry = true,
  maxRetries = 3,
  errorId = 'default'
}) => {
  const [state, setState] = React.useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null,
    errorId,
    retryCount: 0
  });

  const handleRetry = useCallback(() => {
    setState(prev => {
      const newRetryCount = prev.retryCount + 1;
      
      // Check if we've exceeded max retries
      if (newRetryCount > maxRetries) {
        console.error(`[ErrorBoundary] Max retries (${maxRetries}) exceeded for error: ${prev.error?.message}`);
        return prev;
      }
      
      return {
        ...prev,
        retryCount: newRetryCount,
        hasError: false,
        error: null,
        errorInfo: null
      };
    });
    
    onRetry?.();
  }, [onRetry, maxRetries]);

  const handleError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    
    const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setState({
      hasError: true,
      error,
      errorInfo,
      errorId,
      retryCount: state.retryCount
    });
    
    // Call custom error handler if provided
    onError?.(error, errorInfo);
  }, [onRetry]);

  const getErrorSeverity = (error: Error): 'error' | 'warning' | 'info' => {
    // Determine error severity based on error properties
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'error';
    }
    
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'warning';
    }
    
    return 'info';
  };

  const getErrorCategory = (error: Error): string => {
    // Categorize errors for better handling
    if (error.name === 'ChunkLoadError') return 'network';
    if (error.message.includes('Socket')) return 'socket';
    if (error.message.includes('Render')) return 'rendering';
    if (error.message.includes('API')) return 'api';
    return 'general';
  };

  const getErrorSuggestion = (error: Error): string => {
    const category = getErrorCategory(error);
    
    switch (category) {
      case 'network':
        return 'Check your internet connection and try refreshing the page';
      case 'socket':
        return 'WebSocket connection lost. Attempting to reconnect...';
      case 'rendering':
        return 'Try refreshing the page or clearing browser cache';
      case 'api':
        return 'Server may be temporarily unavailable. Please try again later';
      default:
        return 'Try refreshing the page or contact support if the issue persists';
    }
  };

  React.useEffect(() => {
    // Setup global error handlers
    const handleUnhandledError = (event: ErrorEvent) => {
      console.error('[ErrorBoundary] Unhandled error:', event.error);
      handleError(event.error, {
        componentStack: 'No stack available',
        errorBoundary: false,
        error: event.error
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[ErrorBoundary] Unhandled promise rejection:', event.reason);
      handleError(new Error(event.reason as string), {
        componentStack: 'No stack available',
        errorBoundary: false,
        error: new Error(event.reason as string)
      });
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleError]);

  if (state.hasError) {
    const severity = getErrorSeverity(state.error!);
    const category = getErrorCategory(state.error!);
    const suggestion = getErrorSuggestion(state.error!);

    return (
      <Box sx={{ p: 3 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            border: 2, 
            borderColor: severity === 'error' ? 'error.main' : severity === 'warning' ? 'warning.main' : 'info.main',
            borderRadius: 2
          }}
        >
          {/* Error Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ErrorIcon sx={{ fontSize: 48, color: severity === 'error' ? 'error.main' : severity === 'warning' ? 'warning.main' : 'info.main', mr: 2 }} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h5" color={severity === 'error' ? 'error.main' : severity === 'warning' ? 'warning.main' : 'info.main'}>
                Something went wrong
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {category === 'network' ? 'Network Error' : category === 'socket' ? 'Connection Error' : 'Application Error'}
              </Typography>
            </Box>
          </Box>

          {/* Error Details */}
          <Collapse in={state.errorInfo !== null}>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Error Details
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Error ID:</strong> {state.errorId}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Message:</strong> {state.error?.message || 'Unknown error'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Category:</strong> {category}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Severity:</strong> {severity}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Time:</strong> {new Date().toLocaleString()}
              </Typography>
              
              {state.errorInfo?.componentStack && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Component Stack:</strong>
                  <Box 
                    component="pre" 
                    sx={{ 
                      bgcolor: 'grey.100', 
                      p: 1, 
                      borderRadius: 1, 
                      fontSize: '0.75rem',
                      maxHeight: 200,
                      overflow: 'auto'
                    }}
                  >
                    {state.errorInfo.componentStack}
                  </Box>
                </Typography>
              )}
            </Box>
          </Collapse>

          {/* Error Suggestions */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Suggested Solutions
            </Typography>
            
            <Alert 
              severity="info" 
              sx={{ mb: 2 }}
              icon={<WarningIcon />}
            >
              {suggestion}
            </Alert>
          </Box>

          {/* Retry Button */}
          {showRetry && state.retryCount < maxRetries && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
                disabled={state.retryCount >= maxRetries}
                sx={{ minWidth: 150 }}
              >
                {state.retryCount > 0 ? `Retry (${maxRetries - state.retryCount} left)` : 'Retry'}
              </Button>
            </Box>
          )}

          {/* Report Bug Button */}
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Button
              variant="outlined"
              startIcon={<BugReportIcon />}
              size="small"
              onClick={() => {
                const bugReport = {
                  errorId: state.errorId,
                  error: state.error?.message || 'Unknown error',
                  category,
                  severity,
                  userAgent: navigator.userAgent,
                  timestamp: new Date().toISOString(),
                  url: window.location.href,
                  retryCount: state.retryCount
                };
                
                console.log('[ErrorBoundary] Bug report:', bugReport);
                
                // In a real application, this would send to a bug tracking service
                // For now, we'll just log it and potentially copy to clipboard
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2));
                  alert('Bug report copied to clipboard');
                }
              }}
            >
              Report Bug
            </Button>
          </Box>

          {/* Error Category Badge */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Chip 
              label={category}
              color={severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'info'}
              size="small"
              variant="outlined"
            />
          </Box>
        </Paper>

        {/* Fallback UI */}
        {fallback && (
          <Box sx={{ mt: 2, p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Fallback UI
            </Typography>
            {fallback}
          </Box>
        )}
      </Box>
    );
  }

  // Normal rendering (no error)
  return <>{children}</>;
};

export default ErrorBoundary;