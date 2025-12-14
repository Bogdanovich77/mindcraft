/**
 * Profile Management Example Component
 * 
 * This component demonstrates the complete profile booting workflow,
 * including boot, stop, restart functionality and real-time status updates.
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Alert,
  Snackbar,
  Paper,
  Divider,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../store';
import {
  fetchProfiles,
  bootProfile,
  stopProfile,
  restartProfile,
  selectAllProfiles,
  selectProfilesLoading,
  selectProfilesError,
  selectBootingProfiles,
  initializeProfilesSocket,
} from '../store/slices/profilesSlice';
import type { ProfileWithStatus } from '../types/profile';
import ProfileCard from './ProfileCard';
import AgentStatusDisplay from './AgentStatusDisplay';

const ProfileManagementExample: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const profiles = useSelector(selectAllProfiles);
  const loading = useSelector(selectProfilesLoading);
  const error = useSelector(selectProfilesError);
  const bootingProfiles = useSelector(selectBootingProfiles);
  
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithStatus | null>(null);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    // Initialize profiles socket connection
    dispatch(initializeProfilesSocket());
    
    // Fetch initial profiles
    dispatch(fetchProfiles());
  }, [dispatch]);

  const handleBootProfile = async (profileName: string) => {
    try {
      await dispatch(bootProfile(profileName)).unwrap();
      setNotification({ message: `Profile "${profileName}" booted successfully!`, severity: 'success' });
    } catch (error) {
      setNotification({ message: `Failed to boot profile "${profileName}": ${error}`, severity: 'error' });
    }
  };

  const handleStopProfile = async (profileName: string) => {
    try {
      await dispatch(stopProfile(profileName)).unwrap();
      setNotification({ message: `Profile "${profileName}" stopped successfully!`, severity: 'info' });
    } catch (error) {
      setNotification({ message: `Failed to stop profile "${profileName}": ${error}`, severity: 'error' });
    }
  };

  const handleRestartProfile = async (profileName: string) => {
    try {
      await dispatch(restartProfile(profileName)).unwrap();
      setNotification({ message: `Profile "${profileName}" restarted successfully!`, severity: 'success' });
    } catch (error) {
      setNotification({ message: `Failed to restart profile "${profileName}": ${error}`, severity: 'error' });
    }
  };

  const handleEditProfile = (profile: ProfileWithStatus) => {
    console.log('Edit profile:', profile);
    // This would open an edit dialog or navigate to edit page
  };

  const handleDeleteProfile = (profileName: string) => {
    console.log('Delete profile:', profileName);
    // This would show a confirmation dialog and delete the profile
  };

  const handleSelectProfile = (profile: ProfileWithStatus) => {
    setSelectedProfile(profile);
  };

  const isProfileBooting = (profileName: string) => {
    return bootingProfiles.includes(profileName);
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const refreshProfiles = () => {
    dispatch(fetchProfiles());
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Profile Management System
      </Typography>

      {/* Notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {notification && (
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch({ type: 'profiles/clearProfilesError' })}>
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Available Profiles ({profiles.length})
          </Typography>
          <Button
            variant="outlined"
            onClick={refreshProfiles}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Profile Cards */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Profiles
          </Typography>
          
          {loading ? (
            <Typography>Loading profiles...</Typography>
          ) : profiles.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No profiles available. Create some profiles to get started.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {profiles.map((profile) => (
                <Grid item xs={12} sm={6} lg={4} key={profile.id}>
                  <ProfileCard
                    profile={profile}
                    onBoot={handleBootProfile}
                    onStop={handleStopProfile}
                    onRestart={handleRestartProfile}
                    onEdit={handleEditProfile}
                    onDelete={handleDeleteProfile}
                    onSelect={handleSelectProfile}
                    isSelected={selectedProfile?.id === profile.id}
                    isBooting={isProfileBooting(profile.name)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Agent Status Display */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Agent Status
          </Typography>
          
          {selectedProfile ? (
            <Box>
              {selectedProfile.isRunning ? (
                <>
                  <AgentStatusDisplay
                    agentId={selectedProfile.name}
                    compact={false}
                    showDetails={true}
                  />
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Compact Status Cards for Other Running Agents */}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Other Running Agents
                  </Typography>
                  {profiles
                    .filter(p => p.isRunning && p.id !== selectedProfile.id)
                    .map(profile => (
                      <Box key={profile.id} sx={{ mb: 1 }}>
                        <AgentStatusDisplay
                          agentId={profile.name}
                          compact={true}
                          showDetails={false}
                        />
                      </Box>
                    ))}
                  
                  {profiles.filter(p => p.isRunning && p.id !== selectedProfile.id).length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No other agents running
                    </Typography>
                  )}
                </>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Profile "{selectedProfile.name}" is not running.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Click the "Boot" button to start the agent.
                  </Typography>
                </Paper>
              )}
            </Box>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Select a profile to view agent status
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Instructions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          How to Use
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li><strong>Boot Profile:</strong> Start an agent from a profile</li>
            <li><strong>Stop Profile:</strong> Stop a running agent</li>
            <li><strong>Restart Profile:</strong> Stop and restart an agent</li>
            <li><strong>Real-time Updates:</strong> Agent status updates automatically via Socket.IO</li>
            <li><strong>Agent Status:</strong> Select a running profile to see detailed agent information</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProfileManagementExample;