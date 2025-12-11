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
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Undo as UndoIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import type { SuccessModalProps } from '../types/modals';

export const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  title = 'Success',
  message,
  description,
  onContinue,
  onUndo,
  showDetails = false,
  details,
  maxWidth = 'sm',
  fullWidth = false,
  disableBackdropClick = true,
  disableEscapeKeyDown = false,
  loading = false
}) => {
  const handleContinue = async () => {
    if (onContinue) {
      await onContinue();
    }
    onClose();
  };

  const handleUndo = async () => {
    if (onUndo) {
      await onUndo();
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.12)',
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
            <SuccessIcon color="success" />
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
          <Typography variant="body1" color="text.primary">
            {message}
          </Typography>
          
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
          
          {showDetails && details && (
            <Box>
              <Button
                onClick={() => {}}
                variant="text"
                color="info"
                size="small"
                startIcon={<InfoIcon />}
                sx={{ mb: 1 }}
              >
                View Details
              </Button>
              
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
                <Typography variant="body2" component="pre">
                  {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          {onUndo && (
            <Button
              onClick={handleUndo}
              variant="outlined"
              color="secondary"
              disabled={loading}
              size="medium"
            >
              Undo
            </Button>
          )}
          
          <Button
            onClick={handleContinue}
            variant="contained"
            color="primary"
            disabled={loading}
            size="medium"
            autoFocus
          >
            {loading ? 'Processing...' : 'Continue'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default SuccessModal;