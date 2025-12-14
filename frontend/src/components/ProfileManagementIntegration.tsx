/**
 * Profile Management Integration Component
 * 
 * Complete integration example showing how to use all the profile editing
 * components together with Redux state management.
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

// Import components
import ProfileEditDialog from './ProfileEditDialog';
import ProfileCard from './ProfileCard';
import Button from './common/Button';

// Import Redux selectors and actions
import {
  selectAllProfiles,
  selectProfilesLoading,
  selectProfilesError,
  fetchProfiles,
  updateProfile,
  startEditingProfile,
  stopEditingProfile,
  setShowEditDialog,
  fetchProfileTemplates,
  bootProfile,
  stopProfile,
  deleteProfile,
} from '../store/slices/profilesSlice';

// Import types
import type { ProfileWithStatus, ProfileFormData } from '../types/profile';

const ProfileManagementIntegration: React.FC = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const profiles = useSelector(selectAllProfiles);
  const loading = useSelector(selectProfilesLoading);
  const error = useSelector(selectProfilesError);
  
  // Local state
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithStatus | null>(null);

  // Initialize component
  useEffect(() => {
    // Fetch profiles and templates on mount
    dispatch(fetchProfiles());
    dispatch(fetchProfileTemplates());
  }, [dispatch]);

  // Handle profile editing
  const handleEditProfile = (profile: ProfileWithStatus) => {
    setSelectedProfile(profile);
    dispatch(startEditingProfile(profile));
    dispatch(setShowEditDialog(true));
  };

  // Handle creating new profile
  const handleCreateProfile = () => {
    setSelectedProfile(null);
    dispatch(stopEditingProfile());
    dispatch(setShowEditDialog(true));
  };

  // Handle save profile
  const handleSaveProfile = async (profileData: ProfileFormData) => {
    try {
      if (selectedProfile) {
        // Update existing profile
        await dispatch(updateProfile({ name: selectedProfile.name, profile: profileData })).unwrap();
      } else {
        // Create new profile - this would use createProfile action
        console.log('Creating new profile:', profileData);
      }
      
      // Close dialog and refresh profiles
      dispatch(setShowEditDialog(false));
      dispatch(fetchProfiles());
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    dispatch(setShowEditDialog(false));
    dispatch(stopEditingProfile());
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    dispatch(setShowEditDialog(false));
    dispatch(stopEditingProfile());
  };

  // Handle profile actions
  const handleBootProfile = (profileName: string) => {
    dispatch(bootProfile(profileName));
  };

  const handleStopProfile = (profileName: string) => {
    dispatch(stopProfile(profileName));
  };

  const handleDeleteProfile = (profileName: string) => {
    if (window.confirm(`Are you sure you want to delete the profile "${profileName}"?`)) {
      dispatch(deleteProfile(profileName));
    }
  };

  const handleRestartProfile = (profileName: string) => {
    // This would use restartProfile action
    console.log('Restarting profile:', profileName);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          <PsychologyIcon sx mr={2}} />
          Profile Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create, edit, and manage AI agent profiles with personality configuration and behavioral settings.
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateProfile}
            disabled={loading}
          >
            Create New Profile
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => dispatch(fetchProfiles())}
            disabled={loading}
            loading={loading}
          >
            Refresh Profiles
          </Button>
        </Stack>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Success Message */}
      {profiles.length > 0 && !loading && !error && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Successfully loaded {profiles.length} profile{profiles.length !== 1 ? 's' : ''}.
        </Alert>
      )}

      {/* Profiles Grid */}
      {profiles.length > 0 ? (
        <Grid container spacing={3}>
          {profiles.map((profile) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={profile.name}>
              <ProfileCard
                profile={profile}
                onBoot={handleBootProfile}
                onStop={handleStopProfile}
                onRestart={handleRestartProfile}
                onEdit={handleEditProfile}
                onDelete={handleDeleteProfile}
                onSelect={setSelectedProfile}
                isSelected={selectedProfile?.name === profile.name}
                isBooting={false} // This would come from Redux state
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        !loading && !error && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Profiles Found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Get started by creating your first AI agent profile.
            </Typography>
            <Button
              variant="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateProfile}
            >
              Create Your First Profile
            </Button>
          </Box>
        )
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Loading profiles...
          </Typography>
        </Box>
      )}

      {/* Profile Edit Dialog */}
      <ProfileEditDialog
        open={false} // This would come from Redux state
        profile={selectedProfile}
        isEditing={!!selectedProfile}
        loading={loading}
        error={error}
        validationErrors={[]} // This would come from Redux state
        onSave={handleSaveProfile}
        onCancel={handleCancelEdit}
        onClose={handleCloseDialog}
      />

      {/* Features Showcase */}
      <Box sx={{ mt: 8, pt: 4, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="h4" gutterBottom>
          Profile Management Features
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎨 Personality Configuration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rich personality editor with presets, character limits, and real-time validation.
                  Choose from pre-defined personalities or create custom ones with detailed behavioral traits.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip label="12+ Presets" size="small" />
                  <Chip label="Real-time Validation" size="small" />
                  <Chip label="Character Limits" size="small" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 Goals & Mandate System
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Define autonomous behavior through goals and mandate system. 
                  Set long-term objectives and current orders for sophisticated agent behavior.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip label="Autonomous Goals" size="small" />
                  <Chip label="Dynamic Mandates" size="small" />
                  <Chip label="Behavioral Settings" size="small" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🔄 Real-time Updates
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Live profile updates via Socket.IO integration. 
                  See changes instantly across all connected clients with optimistic updates.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip label="Socket.IO" size="small" />
                  <Chip label="Live Updates" size="small" />
                  <Chip label="Optimistic UI" size="small" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Advanced Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Personality analysis, validation feedback, and suggestions.
                  Get insights into how personality traits affect agent behavior.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip label="Personality Analysis" size="small" />
                  <Chip label="Validation Feedback" size="small" />
                  <Chip label="Smart Suggestions" size="small" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProfileManagementIntegration;