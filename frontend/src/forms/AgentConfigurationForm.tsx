import React, { useState, useEffect, useCallback } from 'react';
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
  Slider,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Memory as MemoryIcon,
  School as SchoolIcon,
  Build as BuildIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import type { 
  AgentConfigurationData, 
  FormValidationErrors, 
  BaseFormProps 
} from '../types/forms';

interface AgentConfigurationFormProps extends BaseFormProps<AgentConfigurationData> {
  agentId?: string;
  onCreateSuccess?: (config: AgentConfigurationData) => void;
  onUpdateSuccess?: (config: AgentConfigurationData) => void;
}

const INITIAL_CONFIG_DATA: AgentConfigurationData = {
  id: '',
  name: '',
  profileType: 'default',
  personality: {
    openness: 0.5,
    conscientiousness: 0.5,
    extraversion: 0.5,
    agreeableness: 0.5,
    neuroticism: 0.5,
    riskTolerance: 0.5,
    creativity: 0.5,
    patience: 0.5,
    competitiveness: 0.5,
    curiosity: 0.5,
  },
  motivations: {
    primary: '',
    secondary: [],
    drives: [],
  },
  values: [],
  ethics: {
    harmAvoidance: 0.5,
    fairness: 0.5,
    loyalty: 0.5,
    authority: 0.5,
    purity: 0.5,
  },
  behavior: {
    adaptationRate: 0.5,
    decisionTimeLimit: 2000,
    errorTolerance: 0.5,
    explorationTendency: 0.5,
    socialEngagement: 0.5,
  },
  skills: {
    enabled: [],
    disabled: [],
    preferences: [],
  },
  memory: {
    retentionPeriod: 30,
    consolidationInterval: 24,
    maxEpisodicEvents: 1000,
    maxSemanticConcepts: 5000,
  },
};

const PROFILE_TYPES = [
  { value: 'default', label: 'Default Profile', description: 'Standard agent configuration' },
  { value: 'custom', label: 'Custom Profile', description: 'Fully customizable agent' },
  { value: 'template', label: 'Template Profile', description: 'Based on existing template' }
];

const PERSONALITY_TRAITS = [
  { key: 'openness', label: 'Openness', description: 'Creativity and curiosity' },
  { key: 'conscientiousness', label: 'Conscientiousness', description: 'Organization and discipline' },
  { key: 'extraversion', label: 'Extraversion', description: 'Social energy and expressiveness' },
  { key: 'agreeableness', label: 'Agreeableness', description: 'Cooperation and empathy' },
  { key: 'neuroticism', label: 'Neuroticism', description: 'Emotional stability' },
  { key: 'riskTolerance', label: 'Risk Tolerance', description: 'Willingness to take risks' },
  { key: 'creativity', label: 'Creativity', description: 'Creative thinking and problem-solving' },
  { key: 'patience', label: 'Patience', description: 'Ability to wait and persist' },
  { key: 'competitiveness', label: 'Competitiveness', description: 'Drive to win and achieve' },
  { key: 'curiosity', label: 'Curiosity', description: 'Desire to explore and learn' }
];

export const AgentConfigurationForm: React.FC<AgentConfigurationFormProps> = ({
  agentId,
  initialData,
  onSubmit,
  onCancel,
  onValidate,
  onCreateSuccess,
  onUpdateSuccess,
  disabled = false,
  loading = false,
  validation = { realtime: true, showErrorSummary: true, focusFirstError: true },
  ui = { variant: 'outlined', size: 'medium', fullWidth: true, spacing: 2 }
}) => {
  const [configData, setConfigData] = useState<AgentConfigurationData>(INITIAL_CONFIG_DATA);
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});
  const [advancedMode, setAdvancedMode] = useState(false);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setConfigData({ ...INITIAL_CONFIG_DATA, ...initialData });
    }
  }, [initialData]);

  const validateForm = useCallback((): boolean => {
    const errors: FormValidationErrors = {};

    if (!configData.name.trim()) {
      errors.name = 'Agent name is required';
    }

    if (configData.personality.openness < 0 || configData.personality.openness > 1) {
      errors.openness = 'Openness must be between 0 and 1';
    }

    // Add more validation as needed...

    setValidationErrors(errors);
    
    if (onValidate) {
      onValidate(configData, errors);
    }

    return Object.keys(errors).length === 0;
  }, [configData, onValidate]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const result = await onSubmit(configData);
      if (result.success) {
        if (onUpdateSuccess) {
          onUpdateSuccess(result.data);
        } else if (onCreateSuccess) {
          onCreateSuccess(result.data);
        }
        handleReset();
      }
    } catch (err) {
      console.error('Failed to save agent configuration:', err);
    }
  };

  const handleReset = () => {
    setConfigData(INITIAL_CONFIG_DATA);
    setValidationErrors({});
    setAdvancedMode(false);
    onCancel?.();
  };

  const updatePersonalityTrait = (trait: keyof typeof configData.personality, value: number) => {
    setConfigData(prev => ({
      ...prev,
      personality: {
        ...prev.personality,
        [trait]: Math.max(0, Math.min(1, value))
      }
    }));
  };

  const updateEthicsValue = (ethic: keyof typeof configData.ethics, value: number) => {
    setConfigData(prev => ({
      ...prev,
      ethics: {
        ...prev.ethics,
        [ethic]: Math.max(0, Math.min(1, value))
      }
    }));
  };

  const updateBehaviorValue = (behavior: keyof typeof configData.behavior, value: number) => {
    setConfigData(prev => ({
      ...prev,
      behavior: {
        ...prev.behavior,
        [behavior]: Math.max(0, Math.min(1, value))
      }
    }));
  };

  return (
    <Dialog open={true} onClose={handleReset} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Agent Configuration
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

          {/* Basic Information */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Agent ID"
                  value={configData.id}
                  onChange={(e) => setConfigData(prev => ({ ...prev, id: e.target.value }))}
                  error={!!validationErrors.id}
                  helperText={validationErrors.id}
                  disabled={disabled}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Agent Name"
                  value={configData.name}
                  onChange={(e) => setConfigData(prev => ({ ...prev, name: e.target.value }))}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  disabled={disabled}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Profile Type</InputLabel>
                  <Select
                    value={configData.profileType}
                    label="Profile Type"
                    onChange={(e) => setConfigData(prev => ({ ...prev, profileType: e.target.value as any }))}
                    disabled={disabled}
                  >
                    {PROFILE_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box>
                          <Typography variant="body2">{type.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Personality Configuration */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Personality Traits
            </Typography>
            <Grid container spacing={2}>
              {PERSONALITY_TRAITS.map(trait => (
                <Grid size={{ xs: 12, sm: 6 }} key={trait.key}>
                  <Typography variant="body2" gutterBottom>
                    {trait.label}
                  </Typography>
                  <Slider
                    value={configData.personality[trait.key as keyof typeof configData.personality]}
                    onChange={(_, value) => updatePersonalityTrait(trait.key as keyof typeof configData.personality, value as number)}
                    min={0}
                    max={1}
                    step={0.1}
                    marks={[
                      { value: 0, label: 'Low' },
                      { value: 0.5, label: 'Medium' },
                      { value: 1, label: 'High' }
                    ]}
                    valueLabelDisplay="auto"
                    disabled={disabled}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {trait.description}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Advanced Settings */}
          {advancedMode && (
            <>
              {/* Ethics Configuration */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Ethics Configuration
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(configData.ethics).map(([key, value]) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={key}>
                      <Typography variant="body2" gutterBottom>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Typography>
                      <Slider
                        value={value}
                        onChange={(_, newValue) => updateEthicsValue(key as keyof typeof configData.ethics, newValue as number)}
                        min={0}
                        max={1}
                        step={0.1}
                        marks={[
                          { value: 0, label: 'Low' },
                          { value: 0.5, label: 'Medium' },
                          { value: 1, label: 'High' }
                        ]}
                        valueLabelDisplay="auto"
                        disabled={disabled}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Behavior Configuration */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Behavior Configuration
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(configData.behavior).map(([key, value]) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={key}>
                      <Typography variant="body2" gutterBottom>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Typography>
                      <Slider
                        value={value}
                        onChange={(_, newValue) => updateBehaviorValue(key as keyof typeof configData.behavior, newValue as number)}
                        min={0}
                        max={1}
                        step={0.1}
                        marks={[
                          { value: 0, label: 'Low' },
                          { value: 0.5, label: 'Medium' },
                          { value: 1, label: 'High' }
                        ]}
                        valueLabelDisplay="auto"
                        disabled={disabled}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Memory Configuration */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Memory Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Retention Period (days)"
                      type="number"
                      value={configData.memory.retentionPeriod}
                      onChange={(e) => setConfigData(prev => ({
                        ...prev,
                        memory: { ...prev.memory, retentionPeriod: Number(e.target.value) }
                      }))}
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Consolidation Interval (hours)"
                      type="number"
                      value={configData.memory.consolidationInterval}
                      onChange={(e) => setConfigData(prev => ({
                        ...prev,
                        memory: { ...prev.memory, consolidationInterval: Number(e.target.value) }
                      }))}
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Max Episodic Events"
                      type="number"
                      value={configData.memory.maxEpisodicEvents}
                      onChange={(e) => setConfigData(prev => ({
                        ...prev,
                        memory: { ...prev.memory, maxEpisodicEvents: Number(e.target.value) }
                      }))}
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Max Semantic Concepts"
                      type="number"
                      value={configData.memory.maxSemanticConcepts}
                      onChange={(e) => setConfigData(prev => ({
                        ...prev,
                        memory: { ...prev.memory, maxSemanticConcepts: Number(e.target.value) }
                      }))}
                      disabled={disabled}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </>
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
          {loading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgentConfigurationForm;