/**
 * Goal Creation Dialog
 * 
 * Provides interface for creating new goals with hierarchy support.
 * Integrates with GoalsTab component and Redux store.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Box,
  Typography,
  Chip,
  IconButton,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Timeline as TimelineIcon,
  Flag as FlagIcon,
  Psychology as PsychologyIcon,
  Build as BuildIcon,
  Search as SearchIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { createGoal, updateGoal } from '../../store/slices/goalsSlice';
import type { Goal, GoalType, GoalPriority, GoalStatus, ResourceRequirement } from '../../types/goals';

interface GoalCreationDialogProps {
  open: boolean;
  onClose: () => void;
  editingGoal?: Goal | null;
  parentGoalId?: string;
  defaultType?: GoalType;
}

interface SubGoal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  priority: GoalPriority;
  estimatedDuration: number;
  resources: GoalResource[];
}

const GoalCreationDialog: React.FC<GoalCreationDialogProps> = ({
  open,
  onClose,
  editingGoal,
  parentGoalId,
  defaultType = 'operational'
}) => {
  const dispatch = useDispatch();
  const { goals, loading } = useSelector((state: RootState) => state.goals);
  const { agents } = useSelector((state: RootState) => state.agents);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: defaultType,
    priority: GoalPriority.MEDIUM,
    status: 'pending' as GoalStatus,
    estimatedDuration: 60, // minutes
    progress: {
      current: 0,
      target: 1,
      percentage: 0
    },
    resources: [] as GoalResource[],
    dependencies: [] as string[],
    tags: [] as string[],
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'user',
      lastModified: Date.now()
    }
  });

  const [subGoals, setSubGoals] = useState<SubGoal[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newDependency, setNewDependency] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with editing goal data
  useEffect(() => {
    if (editingGoal) {
      setFormData({
        title: editingGoal.title,
        description: editingGoal.description,
        type: editingGoal.type,
        priority: editingGoal.priority,
        status: editingGoal.status,
        estimatedDuration: editingGoal.estimatedDuration || 60,
        progress: editingGoal.progress,
        resources: editingGoal.resources?.required || [],
        dependencies: editingGoal.dependencies || [],
        tags: editingGoal.tags || [],
        metadata: {
          ...editingGoal.metadata,
          lastModified: Date.now()
        }
      });

      // Load sub-goals if editing
      if (editingGoal.childGoals && editingGoal.childGoals.length > 0) {
        setSubGoals(editingGoal.childGoals.map((subGoal: Goal) => ({
          id: subGoal.id,
          title: subGoal.title,
          description: subGoal.description,
          type: subGoal.type,
          priority: subGoal.priority,
          estimatedDuration: subGoal.estimatedDuration || 60,
          resources: subGoal.resources?.required || []
        })));
      }
    } else {
      // Reset form for new goal
      setFormData({
        title: '',
        description: '',
        type: defaultType,
        priority: GoalPriority.MEDIUM,
        status: 'pending' as GoalStatus,
        estimatedDuration: 60,
        progress: {
          current: 0,
          target: 1,
          percentage: 0
        },
        resources: [],
        dependencies: [],
        tags: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          createdBy: 'user',
          lastModified: Date.now()
        }
      });
      setSubGoals([]);
    }
  }, [editingGoal, defaultType]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.estimatedDuration <= 0) {
      newErrors.estimatedDuration = 'Duration must be greater than 0';
    }

    if (formData.dependencies.length > 0) {
      const invalidDeps = formData.dependencies.filter(dep => !goals.find(g => g.id === dep));
      if (invalidDeps.length > 0) {
        newErrors.dependencies = `Invalid dependencies: ${invalidDeps.join(', ')}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, goals]);

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      metadata: {
        ...prev.metadata,
        lastModified: Date.now()
      }
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle sub-goal changes
  const handleSubGoalChange = (index: number, field: string, value: any) => {
    setSubGoals(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  // Add sub-goal
  const addSubGoal = () => {
    const newSubGoal: SubGoal = {
      id: `subgoal_${Date.now()}`,
      title: '',
      description: '',
      type: 'operational',
      priority: GoalPriority.MEDIUM,
      estimatedDuration: 30,
      resources: []
    };
    setSubGoals(prev => [...prev, newSubGoal]);
  };

  // Remove sub-goal
  const removeSubGoal = (index: number) => {
    setSubGoals(prev => prev.filter((_, i) => i !== index));
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // Add dependency
  const addDependency = () => {
    if (newDependency.trim() && !formData.dependencies.includes(newDependency.trim())) {
      handleInputChange('dependencies', [...formData.dependencies, newDependency.trim()]);
      setNewDependency('');
    }
  };

  // Remove dependency
  const removeDependency = (depToRemove: string) => {
    handleInputChange('dependencies', formData.dependencies.filter(dep => dep !== depToRemove));
  };

  // Add resource
  const addResource = () => {
    const newResource: GoalResource = {
      type: 'material',
      name: '',
      amount: 1,
      unit: 'units',
      required: true,
      allocated: 0
    };
    handleInputChange('resources', [...formData.resources, newResource]);
  };

  // Update resource
  const updateResource = (index: number, field: string, value: any) => {
    const updated = [...formData.resources];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    handleInputChange('resources', updated);
  };

  // Remove resource
  const removeResource = (index: number) => {
    handleInputChange('resources', formData.resources.filter((_, i) => i !== index));
  };

  // Save goal
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const goalData: Goal = {
        id: editingGoal?.id || `goal_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        estimatedDuration: formData.estimatedDuration,
        progress: {
          current: formData.progress.current,
          target: formData.progress.target,
          percentage: formData.progress.percentage,
          milestones: [],
          completedMilestones: [],
          lastUpdated: Date.now()
        },
        resources: {
          required: formData.resources,
          allocated: formData.resources.map(r => ({ ...r, allocated: 0 })),
          totalCost: formData.resources.reduce((sum, r) => sum + (r.amount || 0), 0)
        },
        dependencies: formData.dependencies,
        tags: formData.tags,
        metadata: {
          ...formData.metadata,
          lastModified: Date.now()
        },
        parentId: parentGoalId,
        subGoals: subGoals.map((subGoal, index) => ({
          id: subGoal.id,
          title: subGoal.title,
          description: subGoal.description,
          type: subGoal.type,
          priority: subGoal.priority,
          status: 'pending' as GoalStatus,
          estimatedDuration: subGoal.estimatedDuration,
          progress: { current: 0, target: 1, percentage: 0 },
          resources: {
            required: subGoal.resources,
            allocated: subGoal.resources.map(r => ({ ...r, allocated: 0 }))
          },
          dependencies: [],
          tags: [],
          metadata: {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            createdBy: 'user',
            lastModified: Date.now()
          },
          parentId: editingGoal?.id || `goal_${Date.now()}`
        }))
      };

      if (editingGoal) {
        dispatch(updateGoal({
          agentId: agents.selectedAgent?.id || '',
          goalRequest: {
            goalId: goalData.id,
            updates: {
              description: goalData.description,
              priority: goalData.priority,
              status: goalData.status,
              dependencies: goalData.dependencies,
              resources: goalData.resources,
              progress: goalData.progress,
              tags: goalData.tags,
              metadata: goalData.metadata
            }
          }
        }));
      } else {
        dispatch(addGoal(goalData));
      }

      onClose();
    } catch (error) {
      console.error('Error saving goal:', error);
      setErrors({ submit: 'Failed to save goal. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available goals for dependencies
  const availableGoals = goals.filter(goal => 
    goal.id !== (editingGoal?.id || '') && 
    goal.status !== 'completed'
  );

  // Get priority color
  const getPriorityColor = (priority: GoalPriority): string => {
    switch (priority) {
      case GoalPriority.CRITICAL: return '#f44336';
      case GoalPriority.HIGH: return '#ff9800';
      case GoalPriority.MEDIUM: return '#2196f3';
      case GoalPriority.LOW: return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  // Get type icon
  const getTypeIcon = (type: GoalType) => {
    switch (type) {
      case 'strategic': return <PsychologyIcon />;
      case 'tactical': return <TimelineIcon />;
      case 'operational': return <BuildIcon />;
      default: return <FlagIcon />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {getTypeIcon(formData.type)}
          <Typography variant="h6">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        {/* Basic Information */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
                disabled={isSubmitting}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={3}
                required
                disabled={isSubmitting}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  disabled={isSubmitting}
                >
                  <MenuItem value="strategic">Strategic</MenuItem>
                  <MenuItem value="tactical">Tactical</MenuItem>
                  <MenuItem value="operational">Operational</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  disabled={isSubmitting}
                >
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <Typography gutterBottom>
                Estimated Duration: {formData.estimatedDuration} minutes
              </Typography>
              <Slider
                value={formData.estimatedDuration}
                onChange={(_, value) => handleInputChange('estimatedDuration', value)}
                min={5}
                max={1440} // 24 hours
                step={5}
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Dependencies */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Dependencies
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Add Dependency"
              value={newDependency}
              onChange={(e) => setNewDependency(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addDependency();
                }
              }}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={addDependency} disabled={isSubmitting}>
                    <AddIcon />
                  </IconButton>
                )
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.dependencies.map((dep, index) => {
              const goal = goals.find(g => g.id === dep);
              return (
                <Chip
                  key={index}
                  label={goal?.title || dep}
                  onDelete={() => removeDependency(dep)}
                  color="primary"
                  variant="outlined"
                />
              );
            })}
          </Box>
          {errors.dependencies && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {errors.dependencies}
            </Typography>
          )}
        </Paper>

        {/* Resources */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">
              Resources
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addResource}
              disabled={isSubmitting}
              size="small"
            >
              Add Resource
            </Button>
          </Box>
          {formData.resources.map((resource, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Resource Name"
                    value={resource.name}
                    onChange={(e) => updateResource(index, 'name', e.target.value)}
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={resource.amount}
                    onChange={(e) => updateResource(index, 'amount', parseInt(e.target.value) || 0)}
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Unit"
                    value={resource.unit}
                    onChange={(e) => updateResource(index, 'unit', e.target.value)}
                    disabled={isSubmitting}
                    size="small"
                  />
                </Grid>
                <Grid xs={12} sm={2}>
                  <IconButton 
                    onClick={() => removeResource(index)} 
                    disabled={isSubmitting}
                    color="error"
                  >
                    <RemoveIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Paper>

        {/* Tags */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Tags
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Add Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={addTag} disabled={isSubmitting}>
                    <AddIcon />
                  </IconButton>
                )
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => removeTag(tag)}
                color="secondary"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>

        {/* Sub-goals */}
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">
              Sub-goals
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addSubGoal}
              disabled={isSubmitting}
              size="small"
            >
              Add Sub-goal
            </Button>
          </Box>
          {subGoals.map((subGoal, index) => (
            <Accordion key={subGoal.id} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1} width="100%">
                  <Typography variant="subtitle2">
                    {subGoal.title || `Sub-goal ${index + 1}`}
                  </Typography>
                  <Chip 
                    label={subGoal.type} 
                    size="small" 
                    variant="outlined"
                    sx={{ ml: 'auto' }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid xs={12}>
                    <TextField
                      fullWidth
                      label="Sub-goal Title"
                      value={subGoal.title}
                      onChange={(e) => handleSubGoalChange(index, 'title', e.target.value)}
                      disabled={isSubmitting}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Sub-goal Description"
                      value={subGoal.description}
                      onChange={(e) => handleSubGoalChange(index, 'description', e.target.value)}
                      multiline
                      rows={2}
                      disabled={isSubmitting}
                      size="small"
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={subGoal.type}
                        onChange={(e) => handleSubGoalChange(index, 'type', e.target.value)}
                        disabled={isSubmitting}
                        size="small"
                      >
                        <MenuItem value="strategic">Strategic</MenuItem>
                        <MenuItem value="tactical">Tactical</MenuItem>
                        <MenuItem value="operational">Operational</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={subGoal.priority}
                        onChange={(e) => handleSubGoalChange(index, 'priority', e.target.value)}
                        disabled={isSubmitting}
                        size="small"
                      >
                        <MenuItem value="critical">Critical</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} sm={2}>
                    <IconButton 
                      onClick={() => removeSubGoal(index)} 
                      disabled={isSubmitting}
                      color="error"
                      sx={{ mt: 1 }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={isSubmitting}
          startIcon={<CancelIcon />}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={isSubmitting || loading}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {editingGoal ? 'Update Goal' : 'Create Goal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalCreationDialog;