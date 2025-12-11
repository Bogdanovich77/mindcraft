import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Grid,
  Alert,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon,
  Theme as ThemeIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Accessibility as AccessibilityIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import type { 
  SettingsFormData, 
  FormValidationErrors, 
  BaseFormProps 
} from '../types/forms';

interface SettingsFormProps extends BaseFormProps<SettingsFormData> {
  onSaveSuccess?: (settings: SettingsFormData) => void;
}

const INITIAL_SETTINGS_DATA: SettingsFormData = {
  general: {
    theme: 'auto',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  dashboard: {
    refreshRate: 5000,
    autoRefresh: true,
    showAnimations: true,
    compactMode: false,
    defaultTab: 'overview',
  },
  notifications: {
    enabled: true,
    email: false,
    push: true,
    thresholds: {
      cognitiveLoad: 0.8,
      responseTime: 1000,
      successRate: 0.9,
      memoryUsage: 0.8,
    },
  },
  performance: {
    enableCaching: true,
    maxCacheSize: 100,
    enableCompression: false,
    enableVirtualization: true,
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReader: true,
    keyboardNavigation: true,
  },
  advanced: {
    debugMode: false,
    verboseLogging: false,
    experimentalFeatures: false,
    dataCollection: true,
  },
};

export const SettingsForm: React.FC<SettingsFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onValidate,
  onSaveSuccess,
  disabled = false,
  loading = false,
  validation = { realtime: true, showErrorSummary: true, focusFirstError: true },
  ui = { variant: 'outlined', size: 'medium', fullWidth: true, spacing: 2 }
}) => {
  const [settingsData, setSettingsData] = useState<SettingsFormData>(INITIAL_SETTINGS_DATA);
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});
  const [advancedMode, setAdvancedMode] = useState(false);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setSettingsData({ ...INITIAL_SETTINGS_DATA, ...initialData });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const errors: FormValidationErrors = {};

    if (settingsData.dashboard.refreshRate < 1000) {
      errors.refreshRate = 'Refresh rate must be at least 1000ms';
    }

    if (settingsData.performance.maxCacheSize < 10) {
      errors.maxCacheSize = 'Cache size must be at least 10';
    }

    setValidationErrors(errors);
    
    if (onValidate) {
      onValidate(settingsData, errors);
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const result = await onSubmit(settingsData);
      if (result.success) {
        onSaveSuccess?.(result.data);
        handleReset();
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleReset = () => {
    setSettingsData(INITIAL_SETTINGS_DATA);
    setValidationErrors({});
    setAdvancedMode(false);
    onCancel?.();
  };

  const updateGeneralSetting = <K extends keyof SettingsFormData['general']>(
    key: K,
    value: SettingsFormData['general'][K]
  ) => {
    setSettingsData(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [key]: value
      }
    }));
  };

  const updateDashboardSetting = <K extends keyof SettingsFormData['dashboard']>(
    key: K,
    value: SettingsFormData['dashboard'][K]
  ) => {
    setSettingsData(prev => ({
      ...prev,
      dashboard: {
        ...prev.dashboard,
        [key]: value
      }
    }));
  };

  const updateNotificationSetting = <K extends keyof SettingsFormData['notifications']>(
    key: K,
    value: SettingsFormData['notifications'][K]
  ) => {
    setSettingsData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  return (
    <Dialog open={true} onClose={handleReset} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Settings Configuration
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={advancedMode}
                onChange={(e) => setAdvancedMode(e.target.checked)}
                size="small"
              />
            }
            label="Advanced"
          />
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={ui.spacing || 2} sx={{ mt: 1 }}>
          {Object.keys(validationErrors).length > 0 && validation.showErrorSummary && (
            <Alert severity="error" onClose={() => setValidationErrors({})}>
              Please correct the following errors before submitting:
              <ul>
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* General Settings */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              General Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settingsData.general.theme}
                    label="Theme"
                    onChange={(e) => updateGeneralSetting('theme', e.target.value as any)}
                    disabled={disabled}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Language"
                  value={settingsData.general.language}
                  onChange={(e) => updateGeneralSetting('language', e.target.value)}
                  disabled={disabled}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Timezone"
                  value={settingsData.general.timezone}
                  onChange={(e) => updateGeneralSetting('timezone', e.target.value)}
                  disabled={disabled}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Time Format</InputLabel>
                  <Select
                    value={settingsData.general.timeFormat}
                    label="Time Format"
                    onChange={(e) => updateGeneralSetting('timeFormat', e.target.value as any)}
                    disabled={disabled}
                  >
                    <MenuItem value="12h">12 Hour</MenuItem>
                    <MenuItem value="24h">24 Hour</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Dashboard Settings */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Dashboard Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Refresh Rate (ms)"
                  type="number"
                  value={settingsData.dashboard.refreshRate}
                  onChange={(e) => updateDashboardSetting('refreshRate', Number(e.target.value))}
                  disabled={disabled}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settingsData.dashboard.autoRefresh}
                      onChange={(e) => updateDashboardSetting('autoRefresh', e.target.checked)}
                      disabled={disabled}
                    />
                  }
                  label="Auto Refresh"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settingsData.dashboard.showAnimations}
                      onChange={(e) => updateDashboardSetting('showAnimations', e.target.checked)}
                      disabled={disabled}
                    />
                  }
                  label="Show Animations"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settingsData.dashboard.compactMode}
                      onChange={(e) => updateDashboardSetting('compactMode', e.target.checked)}
                      disabled={disabled}
                    />
                  }
                  label="Compact Mode"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Notification Settings */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Notification Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settingsData.notifications.enabled}
                      onChange={(e) => updateNotificationSetting('enabled', e.target.checked)}
                      disabled={disabled}
                    />
                  }
                  label="Enable Notifications"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Advanced Settings */}
          {advancedMode && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Advanced Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settingsData.advanced.debugMode}
                        onChange={(e) => setSettingsData(prev => ({
                          ...prev,
                          advanced: { ...prev.advanced, debugMode: e.target.checked }
                        }))}
                        disabled={disabled}
                      />
                    }
                    label="Debug Mode"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settingsData.advanced.verboseLogging}
                        onChange={(e) => setSettingsData(prev => ({
                          ...prev,
                          advanced: { ...prev.advanced, verboseLogging: e.target.checked }
                        }))}
                        disabled={disabled}
                      />
                    }
                    label="Verbose Logging"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settingsData.advanced.experimentalFeatures}
                        onChange={(e) => setSettingsData(prev => ({
                          ...prev,
                          advanced: { ...prev.advanced, experimentalFeatures: e.target.checked }
                        }))}
                        disabled={disabled}
                      />
                    }
                    label="Experimental Features"
                  />
                </Grid>
              </Grid>
            </Paper>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleReset} startIcon={<CancelIcon />} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant={ui.variant} 
          startIcon={<SaveIcon />}
          disabled={loading || disabled}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsForm;