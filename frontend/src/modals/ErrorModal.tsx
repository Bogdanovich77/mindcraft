import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
  Alert,
  Collapse
} from '@mui/material';
import {
  Close as CloseIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import type { ErrorModalProps } from '../types/modals';

export const ErrorModal: React.FC<ErrorModalProps> = ({
  open,
  onClose,
  title = 'Error',
  error,
  onRetry,
  onReport,
  showDetails = false,
  technicalDetails,
  maxWidth = 'sm',
  fullWidth = false,
  disableBackdropClick = true,
  disableEscapeKeyDown = false,
  loading = false
}) => {
  const [detailsExpanded, setDetailsExpanded] = React.useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      await onRetry();
    }
    onClose();
  };

  const handleReport = async () => {
    if (onReport) {
      await onReport(error);
    }
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (!disableBackdropClick) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!disableEscapeKeyDown && event.key === 'Escape') {
      onClose();
    }
  };

  const getErrorMessage = () => {
    if (typeof error === 'string') {
      return error;
    }
    return error.message || 'An unknown error occurred';
  };

  const getTechnicalDetails = () => {
    if (technicalDetails) {
      return technicalDetails;
    }
    if (typeof error === 'object' && error.stack) {
      return error.stack;
    }
    return JSON.stringify(error, null, 2);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(211, 47, 47, 0.12)',
        }
      }}
      BackdropProps={{
        onClick: handleBackdropClick
      }}
      onKeyDown={handleKeyDown}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <ErrorIcon color="error" />
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {getErrorMessage()}
            </Typography>
          </Alert>
          
          {(onRetry || onReport) && (
            <Stack direction="row" spacing={1}>
              {onRetry && (
                <Button
                  onClick={handleRetry}
                  variant="outlined"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  disabled={loading}
                  size="small"
                >
                  Retry
                </Button>
              )}
              
              {onReport && (
                <Button
                  onClick={handleReport}
                  variant="outlined"
                  color="secondary"
                  startIcon={<BugReportIcon />}
                  disabled={loading}
                  size="small"
                >
                  Report
                </Button>
              )}
            </Stack>
          )}
          
          {showDetails && (
            <Box>
              <Button
                onClick={() => setDetailsExpanded(!detailsExpanded)}
                variant="text"
                color="info"
                size="small"
                sx={{ mb: 1 }}
              >
                {detailsExpanded ? 'Hide Details' : 'Show Details'}
              </Button>
              
              <Collapse in={detailsExpanded}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}
                >
                  <Box component="pre" sx={{
                    typography: 'body2',
                    p: 1,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    maxHeight: 200
                  }}>
                    {getTechnicalDetails()}
                  </Box>
                </Box>
              </Collapse>
            </Box>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="secondary"
            disabled={loading}
            size="medium"
          >
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorModal;