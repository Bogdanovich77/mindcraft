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
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import type { ConfirmationModalProps } from '../types/modals';

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  title = 'Confirm Action',
  message,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  onConfirm,
  onCancel,
  severity = 'info',
  showIcon = true,
  maxWidth = 'sm',
  fullWidth = false,
  disableBackdropClick = true,
  disableEscapeKeyDown = false,
  loading = false
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
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

  const getSeverityIcon = () => {
    switch (severity) {
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'success':
        return <SuccessIcon color="success" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (confirmColor) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
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
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
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
            {showIcon && getSeverityIcon()}
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
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            onClick={handleCancel}
            disabled={loading}
            size="medium"
          >
            {cancelText}
          </Button>
          
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={getConfirmButtonColor()}
            disabled={loading}
            size="medium"
            autoFocus
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;