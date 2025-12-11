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
  IconButton,
  Tooltip,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/types';
import type { Goal, GoalType, GoalPriority, GoalStatus, ResourceRequirement, Milestone } from '../../types/goals';
import { createGoal, updateGoal, deleteGoal } from '../../store/slices/goalsSlice';

interface GoalCreationInterfaceProps {
  agentId?: string;
  open?: boolean;
  onClose?: () => void;
  editingGoal?: Goal | null;
  parentGoal?: Goal | null;
  onCreateSuccess?: (goal: Goal) => void;
  onUpdateSuccess?: (goal: Goal) => void;
}

interface GoalFormData {
  description: string;
  type: GoalType;
  priority: GoalPriority;
  status: GoalStatus;
  parentGoalId?: string;
  dependencies: string[];
  resourceRequirements: ResourceRequirement[];
  milestones: Milestone[];
  targetValue: number;
  estimatedDuration: number; // hours
  tags: string[];
  notes: string;
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
  { value: 'paused', label: 'Paused', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'failed', label: 'Failed', color: 'error' },
  { value: 'cancelled', label: 'Cancelled', color: 'default' }
];

const RESOURCE_TYPES = ['wood', 'stone', 'iron', 'gold', 'diamond', 'food', 'tools', 'time', 'energy'];

export const GoalCreationInterface: React.FC<GoalCreationInterfaceProps> = ({
  agentId,
  open = true,
  onClose,
  editingGoal,
  parentGoal,
  onCreateSuccess,
  onUpdateSuccess
}) => {
  const dispatch = useDispatch();
  const { goals, isLoading, error } = useSelector((state: RootState) => state.goals);
  
  const [formData, setFormData] = useState<GoalFormData>(INITIAL_FORM_DATA);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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

  useEffect(() => {
    if (editingGoal) {
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
  }, [editingGoal, parentGoal]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

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
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const goalData: Partial<Goal> = {
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        parentGoal: formData.parentGoalId,
        dependencies: formData.dependencies,
        resources: {
          required: formData.resourceRequirements,
          allocated: [],
          totalCost: formData.resourceRequirements.reduce((sum, r) => sum + (r.amount * 10), 0) // Simple cost calculation
        },
        progress: {
          current: 0,
          target: formData.targetValue,
          percentage: 0,
          milestones: formData.milestones,
          completedMilestones: [],
          lastUpdated: Date.now()
        },
        estimatedDuration: formData.estimatedDuration,
        tags: formData.tags,
        notes: formData.notes,
        createdAt: editingGoal?.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      if (editingGoal) {
        const updatedGoal = await dispatch(updateGoal({ agentId: 'current-agent', goalRequest: { goalId: editingGoal.id, updates: goalData } }) as any).unwrap();
        onUpdateSuccess?.(updatedGoal);
      } else {
        const newGoal = await dispatch(createGoal(goalData as any) as any).unwrap();
        onCreateSuccess?.(newGoal);
      }

      handleClose();
    } catch (err) {
      console.error('Failed to save goal:', err);
    }
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_DATA);
    setValidationErrors({});
    setNewDependency('');
    setNewResource({ type: 'wood', amount: 1, available: 0, unit: 'units', status: 'available', priority: 'medium' });
    setNewMilestone({ name: '', target: 0 });
    setNewTag('');
    onClose?.();
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
    setNewResource({ type: 'wood', amount: 1, available: 0, unit: '', status: 'available', priority: 'medium' });
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

  const availableGoals = goals.filter((goal: Goal) =>
    goal.id !== editingGoal?.id && 
    goal.id !== formData.parentGoalId &&
    !formData.dependencies.includes(goal.id)
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => {}}>
              {error}
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
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Goal Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Goal Type"
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as GoalType }))}
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
                      >
                        {availableGoals.map((goal: Goal) => (
                          <MenuItem key={goal.id} value={goal.id}>
                            {goal.description}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button onClick={addDependency} disabled={!newDependency}>
                      Add
                    </Button>
                  </Stack>
                  
                  {formData.dependencies.length > 0 && (
                    <List dense>
                      {formData.dependencies.map(depId => {
                        const goal = goals.find((g: Goal) => g.id === depId);
                        return goal ? (
                          <ListItem key={depId}>
                            <ListItemIcon>
                              <LinkIcon />
                            </ListItemIcon>
                            <ListItemText primary={goal.description} />
                            <ListItemSecondaryAction>
                              <IconButton
                                size="small"
                                onClick={() => removeDependency(depId)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ) : null;
                      })}
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
                    />
                    <Button onClick={addResource}>
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
                    />
                    <TextField
                      label="Target Value"
                      type="number"
                      value={newMilestone.target}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, target: Number(e.target.value) }))}
                      sx={{ minWidth: 120 }}
                    />
                    <Button onClick={addMilestone} disabled={!newMilestone.name || newMilestone.target <= 0}>
                      Add
                    </Button>
                  </Stack>
                  
                  {formData.milestones.length > 0 && (
                    <List dense>
                      {formData.milestones.map((milestone, index) => (
                        <ListItem key={milestone.id}>
                          <ListItemIcon>
                            <FlagIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={milestone.name}
                            secondary={`Target: ${milestone.targetValue}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              size="small"
                              onClick={() => removeMilestone(milestone.id)}
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
                    />
                    <Button onClick={addTag} disabled={!newTag}>
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
                    />
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} startIcon={<CancelIcon />}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          startIcon={<SaveIcon />}
          disabled={isLoading}
        >
          {editingGoal ? 'Update Goal' : 'Create Goal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalCreationInterface;