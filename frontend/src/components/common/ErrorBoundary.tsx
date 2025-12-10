import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // You could also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={3}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              The application encountered an unexpected error. Please try again or contact support if the problem persists.
            </Typography>

            {import.meta.env.DEV && this.state.error && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  textAlign: 'left',
                }}
              >
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Error Details:
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    fontSize: '0.8rem',
                    overflow: 'auto',
                    maxHeight: '200px',
                    bgcolor: 'background.paper',
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  {this.state.error.toString()}
                </Typography>
                
                {this.state.errorInfo && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" color="error" gutterBottom>
                      Component Stack:
                    </Typography>
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        fontSize: '0.8rem',
                        overflow: 'auto',
                        maxHeight: '200px',
                        bgcolor: 'background.paper',
                        p: 1,
                        borderRadius: 1,
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            <Box mt={3} display="flex" gap={2} justifyContent="center">
              <Button
                onClick={this.handleRetry}
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;