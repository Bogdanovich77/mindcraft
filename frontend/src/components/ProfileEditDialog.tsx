/**
 * Profile Edit Dialog Component
 * 
 * Modal dialog for profile editing with form validation,
 * loading states, and confirmation dialogs.
 */

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import type { ProfileFormData, ProfileValidationError, AvailableModel } from '../types/profile';
import ProfileEditor from './ProfileEditor';
import ConfirmationModal from '../modals/ConfirmationModal';

interface ProfileEditDialogProps {
  open: boolean;
  profile: ProfileFormData | null;
  isEditing: boolean;
  loading: boolean;
  error: string | null;
  validationErrors: ProfileValidationError[];
  availableModels?: AvailableModel[];
  onSave: (profile: ProfileFormData) => void;
  onCancel: () => void;
  onClose: () => void;
}

const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
  open,
  profile,
  isEditing,
  loading,
  error,
  validationErrors,
  availableModels = [],
  onSave,
  onCancel,
  onClose,
}) => {
  const [localProfile, setLocalProfile] = useState<ProfileFormData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);

  // Initialize local profile when dialog opens or profile changes
  useEffect(() => {
    if (open && profile) {
      setLocalProfile({ ...profile });
      setHasUnsavedChanges(false);
    }
  }, [open, profile]);

  // Handle field changes
  const handleFieldChange = (field: keyof ProfileFormData, value: any) => {
    if (localProfile) {
      const updatedProfile = { ...localProfile, [field]: value };
      setLocalProfile(updatedProfile);
      setHasUnsavedChanges(true);
    }
  };

  // Handle save attempt
  const handleSave = () => {
    if (localProfile) {
      // Check for validation errors
      if (validationErrors.length > 0) {
        return;
      }
      
      // Show confirmation dialog if there are significant changes
      const hasSignificantChanges = 
        localProfile.personality !== profile?.personality ||
        localProfile.goals !== profile?.goals ||
        localProfile.model !== profile?.model;

      if (hasSignificantChanges && isEditing) {
        setShowConfirmSave(true);
      } else {
        onSave(localProfile);
      }
    }
  };

  // Handle close attempt
  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  // Confirm save
  const handleConfirmSave = () => {
    setShowConfirmSave(false);
    if (localProfile) {
      onSave(localProfile);
    }
  };

  // Confirm close without saving
  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    setHasUnsavedChanges(false);
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowConfirmClose(true);
    } else {
      onCancel();
    }
  };

  // Get dialog title
  const getDialogTitle = () => {
    if (isEditing) {
      return `Edit Profile: ${profile?.name || 'Unknown'}`;
    }
    return 'Create New Profile';
  };

  // Check if form is valid
  const isFormValid = () => {
    if (!localProfile) return false;
    
    return (
      localProfile.name.trim().length > 0 &&
      localProfile.model.trim().length > 0 &&
      localProfile.personality.trim().length > 0 &&
      localProfile.goals.trim().length > 0 &&
      validationErrors.length === 0
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: '80vh',
            maxHeight: '90vh',
          },
        }}
        disableEscapeKeyDown={hasUnsavedChanges}
      >
        {/* Dialog Header */}
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 2,
        }}>
          <Typography variant="h5" component="div">
            {getDialogTitle()}
          </Typography>
          
          <IconButton
            onClick={handleClose}
            disabled={loading}
            sx={{ ml: 1 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        {/* Dialog Content */}
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading Overlay */}
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 1,
                borderRadius: 2,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {isEditing ? 'Updating profile...' : 'Creating profile...'}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Profile Editor */}
          <Box sx={{ opacity: loading ? 0.5 : 1 }}>
            <ProfileEditor
              profile={localProfile}
              isEditing={isEditing}
              validationErrors={validationErrors}
              onSave={handleSave}
              onCancel={handleCancel}
              onChange={handleFieldChange}
              loading={loading}
              availableModels={availableModels}
            />
          </Box>
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            {/* Left side - Status */}
            <Box>
              {hasUnsavedChanges && (
                <Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WarningIcon fontSize="small" />
                  You have unsaved changes
                </Typography>
              )}
            </Box>

            {/* Right side - Actions */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={loading || !isFormValid() || !hasUnsavedChanges}
                startIcon={<SaveIcon />}
              >
                {isEditing ? 'Update Profile' : 'Create Profile'}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Confirm Close Dialog */}
      <ConfirmationModal
        open={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        title="Unsaved Changes"
        message="You have unsaved changes to this profile."
        description="Are you sure you want to close without saving? Your changes will be lost."
        confirmText="Close Without Saving"
        cancelText="Keep Editing"
        confirmColor="warning"
        onConfirm={handleConfirmClose}
        onCancel={() => setShowConfirmClose(false)}
        severity="warning"
      />

      {/* Confirm Save Dialog */}
      <ConfirmationModal
        open={showConfirmSave}
        onClose={() => setShowConfirmSave(false)}
        title="Confirm Profile Changes"
        message="You are about to make significant changes to this profile."
        description="These changes will affect how the bot behaves and interacts with others. Are you sure you want to save these changes?"
        confirmText="Save Changes"
        cancelText="Review Changes"
        confirmColor="primary"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmSave(false)}
        severity="info"
      />
    </>
  );
};

export default ProfileEditDialog;