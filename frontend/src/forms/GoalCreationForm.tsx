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
  IconButton,
  Tooltip,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Switch,
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import type { 
  GoalFormData, 
  FormValidationErrors, 
  BaseFormProps,
  FormFieldConfig 
} from '../types/forms';
import type { Goal, GoalType, GoalPriority, GoalStatus, ResourceRequirement, Milestone } from '../types/goals';

interface GoalCreationFormProps extends BaseFormProps<GoalFormData> {
  agentId?: string;
  editingGoal?: Goal | null;
  parentGoal?: Goal | null;
  onCreateSuccess?: (goal: Goal) => void;
  onUpdateSuccess?: (goal: Goal) => void;
}

const INITIAL_FORM_DATA: GoalFormData = {
  description: '',
  type: 'operational',
  priority: 2,
  status: 'pending',
  dependencies: [],
  resourceRequirements: [],
  milestones: [],
  targetValue: 100,
  estimatedDuration: 24,
  tags: [],
  notes: ''
};

const GOAL_TYPES: { value: GoalType; label: string; description: string }[] = [
  { value: 'strategic', label: 'Strategic', description: 'Long-term objectives (weeks to months)' },
  { value: 'tactical', label: 'Tactical', description: 'Medium-term plans (days to weeks)' },
  { value: 'operational', label: 'Operational', description: 'Short-term tasks (minutes to hours)' }
];

const PRIORITY_LEVELS: { value: GoalPriority; label: string; color: string }[] = [
  { value: 0, label: 'Critical', color: 'error' },
  { value: 1, label: 'High', color: 'warning' },
  { value: 2, label: 'Medium', color: 'info' },
  { value: 3, label: 'Low', color: 'default' }
];

const STATUS_OPTIONS: { value: GoalStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'default' },
  { value: 'active', label: 'Active', color: 'info' },
  { value: 'in_progress', label: 'In Progress', color: 'primary' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'failed', label: 'Failed', color: 'error' },
  { value: 'paused', label: 'Paused', color: 'warning' },
  { value: 'cancelled', label: 'Cancelled', color: 'default' }
];

const RESOURCE_TYPES = ['wood', 'stone', 'iron', 'gold', 'diamond', 'food', 'tools', 'time', 'energy'];

export const GoalCreationForm: React.FC<GoalCreationFormProps> = ({
  agentId,
  initialData,
  onSubmit,
  onCancel,
  onValidate,
  editingGoal,
  parentGoal,
  onCreateSuccess,
  onUpdateSuccess,
  disabled = false,
  loading = false,
  validation = { realtime: true, showErrorSummary: true, focusFirstError: true },
  ui = { variant: 'outlined', size: 'medium', fullWidth: true, spacing: 2 }
}) => {
  const [formData, setFormData] = useState<GoalFormData>(INITIAL_FORM_DATA);
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});
  const [newDependency, setNewDependency] = useState('');
  const [newResource, setNewResource] = useState({
    type: 'wood',
    amount: 1,
    available: 100,
    unit: 'units',
    status: 'available' as const,
    priority: 'medium' as const
  });
  const [newMilestone, setNewMilestone] = useState({ name: '', target: 0 });
  const [newTag, setNewTag] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);

  // Initialize form data when initialData or editingGoal changes
  useEffect(() => {
    if (initialData) {
      setFormData({ ...INITIAL_FORM_DATA, ...initialData });
    } else if (editingGoal) {
      setFormData({
        description: editingGoal.description,
        type: editingGoal.type,
        priority: editingGoal.priority,
        status: editingGoal.status,
        parentGoalId: parentGoal?.id || editingGoal.parentGoal,
        dependencies: editingGoal.dependencies || [],
        resourceRequirements: editingGoal.resources?.required || [],
        milestones: editingGoal.progress?.milestones || [],
        targetValue: editingGoal.progress?.target || 100,
        estimatedDuration: editingGoal.estimatedDuration || 24,
        tags: editingGoal.tags || [],
        notes: editingGoal.notes || ''
      });
    } else if (parentGoal) {
      setFormData(prev => ({
        ...prev,
        parentGoalId: parentGoal.id,
        type: parentGoal.type === 'strategic' ? 'tactical' : 
              parentGoal.type === 'tactical' ? 'operational' : 'operational'
      }));
    }
  }, [initialData, editingGoal, parentGoal]);

  const validateForm = useCallback((): boolean => {
    const errors: FormValidationErrors = {};

    if (!formData.description.trim()) {
      errors.description = 'Goal description is required';
    }

    if (formData.dependencies.includes(formData.parentGoalId || '')) {
      errors.dependencies = 'Cannot depend on parent goal';
    }

    if (formData.targetValue <= 0) {
      errors.targetValue = 'Target value must be greater than 0';
    }

    if (formData.estimatedDuration <= 0) {
      errors.estimatedDuration = 'Estimated duration must be greater than 0';
    }

    setValidationErrors(errors);
    
    // Call validation callback if provided
    if (onValidate) {
      onValidate(formData, errors);
    }

    return Object.keys(errors).length === 0;
  }, [formData, onValidate]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const result = await onSubmit(formData);
      if (result.success) {
        if (editingGoal) {
          onUpdateSuccess?.(result.data);
        } else {
          onCreateSuccess?.(result.data);
        }
        handleReset();
      }
    } catch (err) {
      console.error('Failed to save goal:', err);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setValidationErrors({});
    setNewDependency('');
    setNewResource({ 
      type: 'wood', 
      amount: 1, 
      available: 0, 
      unit: 'units', 
      status: 'available', 
      priority: 'medium' 
    });
    setNewMilestone({ name: '', target: 0 });
    setNewTag('');
    setAdvancedMode(false);
    onCancel?.();
  };

  const addDependency = () => {
    if (newDependency && !formData.dependencies.includes(newDependency)) {
      setFormData(prev => ({
        ...prev,
        dependencies: [...prev.dependencies, newDependency]
      }));
      setNewDependency('');
    }
  };

  const removeDependency = (dependencyId: string) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter(id => id !== dependencyId)
    }));
  };

  const addResource = () => {
    const existingResource = formData.resourceRequirements.find(r => r.type === newResource.type);
    if (existingResource) {
      setFormData(prev => ({
        ...prev,
        resourceRequirements: prev.resourceRequirements.map(r =>
          r.type === newResource.type
            ? { ...r, amount: r.amount + newResource.amount }
            : r
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        resourceRequirements: [...prev.resourceRequirements, {
          type: newResource.type,
          amount: newResource.amount,
          available: newResource.available,
          unit: newResource.unit,
          status: newResource.status,
          priority: newResource.priority
        }]
      }));
    }
    setNewResource({ 
      type: 'wood', 
      amount: 1, 
      available: 0, 
      unit: '', 
      status: 'available', 
      priority: 'medium' 
    });
  };

  const removeResource = (resourceType: string) => {
    setFormData(prev => ({
      ...prev,
      resourceRequirements: prev.resourceRequirements.filter(r => r.type !== resourceType)
    }));
  };

  const addMilestone = () => {
    if (newMilestone.name && newMilestone.target > 0) {
      const milestone: Milestone = {
        id: `milestone_${Date.now()}`,
        name: newMilestone.name,
        title: newMilestone.name,
        description: '',
        targetValue: newMilestone.target,
        currentValue: 0,
        completed: false,
        completedAt: undefined,
        dependencies: [],
        dueDate: undefined,
        tags: [],
        createdAt: Date.now()
      };
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, milestone]
      }));
      setNewMilestone({ name: '', target: 0 });
    }
  };

  const removeMilestone = (milestoneId: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== milestoneId)
    }));
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  return (
    <Dialog open={true} onClose={handleReset} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
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
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Goal Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  error={!!validationErrors.description}
                  helperText={validationErrors.description}
                  multiline
                  rows={2}
                  required
                  disabled={disabled}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Goal Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Goal Type"
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as GoalType }))}
                    disabled={disabled}
                  >
                    {GOAL_TYPES.map(type => (
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
              
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as GoalPriority }))}
                    disabled={disabled}
                  >
                    {PRIORITY_LEVELS.map(priority => (
                      <MenuItem key={priority.value} value={priority.value}>
                        <Chip 
                          size="small" 
                          label={priority.label}
                          color={priority.color as any}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as GoalStatus }))}
                    disabled={disabled}
                  >
                    {STATUS_OPTIONS.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        <Chip 
                          size="small" 
                          label={status.label}
                          color={status.color as any}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Advanced Settings */}
          {advancedMode && (
            <>
              {/* Dependencies */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Dependencies
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1}>
                    <FormControl fullWidth>
                      <InputLabel>Add Dependency</InputLabel>
                      <Select
                        value={newDependency}
                        label="Add Dependency"
                        onChange={(e) => setNewDependency(e.target.value)}
                        disabled={disabled}
                      >
                        {/* This would be populated with available goals */}
                        <MenuItem value="">Select a goal...</MenuItem>
                      </Select>
                    </FormControl>
                    <Button onClick={addDependency} disabled={!newDependency || disabled}>
                      Add
                    </Button>
                  </Stack>
                 
                  {formData.dependencies.length > 0 && (
                    <List dense>
                      {formData.dependencies.map(depId => (
                        <ListItem key={depId}>
                          <ListItem>
                            <LinkIcon />
                          </ListItem>
                          <ListItemText primary={depId} />
                          <ListItemSecondaryAction>
                            <IconButton
                              size="small"
                              onClick={() => removeDependency(depId)}
                              disabled={disabled}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Stack>
              </Paper>

              {/* Resource Requirements */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Resource Requirements
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1}>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Resource Type</InputLabel>
                      <Select
                        value={newResource.type}
                        label="Resource Type"
                        onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value }))}
                        disabled={disabled}
                      >
                        {RESOURCE_TYPES.map(type => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Amount"
                      type="number"
                      value={newResource.amount}
                      onChange={(e) => setNewResource(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      sx={{ minWidth: 100 }}
                      disabled={disabled}
                    />
                    <Button onClick={addResource} disabled={disabled}>
                      Add
                    </Button>
                  </Stack>
                 
                  {formData.resourceRequirements.length > 0 && (
                    <List dense>
                      {formData.resourceRequirements.map((resource, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <AssessmentIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${resource.type}: ${resource.amount} ${resource.unit}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              size="small"
                              onClick={() => removeResource(resource.type)}
                              disabled={disabled}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Stack>
              </Paper>

              {/* Milestones */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Milestones
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      label="Milestone Name"
                      value={newMilestone.name}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                      sx={{ minWidth: 200 }}
                      disabled={disabled}
                    />
                    <TextField
                      label="Target Value"
                      type="number"
                      value={newMilestone.target}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, target: Number(e.target.value) }))}
                      sx={{ minWidth: 120 }}
                      disabled={disabled}
                    />
                    <Button onClick={addMilestone} disabled={!newMilestone.name || newMilestone.target <= 0 || disabled}>
                      Add
                    </Button>
                  </Stack>
                 
                  {formData.milestones.length > 0 && (
                    <List dense>
                      {formData.milestones.map((milestone, index) => (
                        <ListItem key={milestone.id}>
                          <ListItem>
                            <FlagIcon />
                          </ListItem>
                          <ListItemText 
                            primary={milestone.name}
                            secondary={`Target: ${milestone.targetValue}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              size="small"
                              onClick={() => removeMilestone(milestone.id)}
                              disabled={disabled}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Stack>
              </Paper>

              {/* Tags */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tags
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      label="Add Tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      sx={{ minWidth: 200 }}
                      disabled={disabled}
                    />
                    <Button onClick={addTag} disabled={!newTag || disabled}>
                      Add
                    </Button>
                  </Stack>
                 
                  {formData.tags.length > 0 && (
                    <Box>
                      {formData.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => removeTag(tag)}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </Stack>
              </Paper>

              {/* Additional Settings */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Additional Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Target Value"
                      type="number"
                      value={formData.targetValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetValue: Number(e.target.value) }))}
                      error={!!validationErrors.targetValue}
                      helperText={validationErrors.targetValue}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">🎯</InputAdornment>
                      }}
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Estimated Duration (hours)"
                      type="number"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: Number(e.target.value) }))}
                      error={!!validationErrors.estimatedDuration}
                      helperText={validationErrors.estimatedDuration}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">⏱️</InputAdornment>
                      }}
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      multiline
                      rows={3}
                      placeholder="Additional notes about this goal..."
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
          {loading ? 'Saving...' : (editingGoal ? 'Update Goal' : 'Create Goal')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalCreationForm;