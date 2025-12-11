import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Chip,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Avatar,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayArrow as ActiveIcon,
  Pause as PausedIcon,
  Cancel as CancelledIcon,
  Error as FailedIcon,
  Timeline as TimelineIcon,
  Flag as FlagIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import type { Goal, GoalStatus, GoalPriority, Milestone } from '../../types/goals';

interface GoalProgressTrackerProps {
  goals: Goal[];
  onGoalSelect?: (goal: Goal) => void;
  onMilestoneUpdate?: (goalId: string, milestone: Milestone) => void;
  onMilestoneComplete?: (goalId: string, milestoneId: string) => void;
  height?: number;
}

// Milestone interface already has all needed properties from types/goals.ts
type UIMilestone = Milestone;

const STATUS_COLORS: Record<GoalStatus, string> = {
  completed: '#4caf50',
  active: '#2196f3',
  pending: '#ff9800',
  failed: '#f44336',
  paused: '#9c27b0',
  cancelled: '#757575',
  in_progress: '#2196f3'
};

const STATUS_ICONS: Record<GoalStatus, React.ElementType> = {
  completed: CompletedIcon,
  active: ActiveIcon,
  pending: PendingIcon,
  failed: FailedIcon,
  paused: PausedIcon,
  cancelled: CancelledIcon,
  in_progress: ActiveIcon
};

const PRIORITY_COLORS: Record<GoalPriority, string> = {
  0: '#d32f2f', // CRITICAL
  1: '#f57c00', // HIGH
  2: '#1976d2', // MEDIUM
  3: '#757575'  // LOW
};

export const GoalProgressTracker: React.FC<GoalProgressTrackerProps> = ({
  goals,
  onGoalSelect,
  onMilestoneUpdate,
  onMilestoneComplete,
  height = 600
}) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<UIMilestone | null>(null);
  const [creatingMilestone, setCreatingMilestone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'milestones'>('overview');

  // Calculate progress statistics
  const progressStats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    active: goals.filter(g => g.status === 'active' || g.status === 'in_progress').length,
    pending: goals.filter(g => g.status === 'pending').length,
    failed: goals.filter(g => g.status === 'failed').length,
    averageProgress: goals.reduce((sum, g) => sum + g.progress.percentage, 0) / (goals.length || 1),
    totalMilestones: goals.reduce((sum, g) => sum + g.progress.milestones.length, 0),
    completedMilestones: goals.reduce((sum, g) => sum + g.progress.completedMilestones.length, 0)
  };

  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal);
    onGoalSelect?.(goal);
  };

  const handleMilestoneEdit = (milestone: UIMilestone) => {
    setEditingMilestone(milestone);
    setMilestoneDialogOpen(true);
  };

  const handleMilestoneCreate = () => {
    if (!selectedGoal) return;
    
    const newMilestone: Milestone = {
      id: `milestone_${Date.now()}`,
      name: '',
      title: '',
      description: '',
      targetValue: 0,
      currentValue: 0,
      completed: false,
      dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
      createdAt: Date.now(),
      tags: [],
      completedAt: undefined,
      dependencies: []
    };
    
    setEditingMilestone(newMilestone);
    setCreatingMilestone(true);
    setMilestoneDialogOpen(true);
  };

  const handleMilestoneSave = () => {
    if (!editingMilestone || !selectedGoal) return;
    
    if (creatingMilestone) {
      // Add new milestone to goal
      const updatedGoal = {
        ...selectedGoal,
        progress: {
          ...selectedGoal.progress,
          milestones: [...selectedGoal.progress.milestones, editingMilestone]
        }
      };
      onMilestoneUpdate?.(selectedGoal.id, editingMilestone);
    } else {
      // Update existing milestone
      onMilestoneUpdate?.(selectedGoal.id, editingMilestone);
    }
    
    setMilestoneDialogOpen(false);
    setEditingMilestone(null);
    setCreatingMilestone(false);
  };

  const handleMilestoneComplete = (milestoneId: string) => {
    if (!selectedGoal) return;
    onMilestoneComplete?.(selectedGoal.id, milestoneId);
  };

  const handleMilestoneDelete = (milestoneId: string) => {
    if (!selectedGoal || !window.confirm('Are you sure you want to delete this milestone?')) return;
    
    const updatedGoal = {
      ...selectedGoal,
      progress: {
        ...selectedGoal.progress,
        milestones: selectedGoal.progress.milestones.filter(m => m.id !== milestoneId),
        completedMilestones: selectedGoal.progress.completedMilestones.filter(id => id !== milestoneId)
      }
    };
    
    onMilestoneUpdate?.(selectedGoal.id, updatedGoal.progress.milestones.find(m => m.id === milestoneId)!);
  };

  const renderProgressOverview = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={1}>
              <Avatar sx={{ bgcolor: STATUS_COLORS.completed, width: 56, height: 56 }}>
                <CompletedIcon />
              </Avatar>
              <Typography variant="h4">{progressStats.completed}</Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={1}>
              <Avatar sx={{ bgcolor: STATUS_COLORS.active, width: 56, height: 56 }}>
                <ActiveIcon />
              </Avatar>
              <Typography variant="h4">{progressStats.active}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={1}>
              <Avatar sx={{ bgcolor: STATUS_COLORS.pending, width: 56, height: 56 }}>
                <PendingIcon />
              </Avatar>
              <Typography variant="h4">{progressStats.pending}</Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={1}>
              <Avatar sx={{ bgcolor: PRIORITY_COLORS[0], width: 56, height: 56 }}>
                <TrendingUpIcon />
              </Avatar>
              <Typography variant="h4">{Math.round(progressStats.averageProgress)}%</Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Progress
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Progress Distribution
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">Overall Progress</Typography>
                  <Typography variant="body2">{Math.round(progressStats.averageProgress)}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progressStats.averageProgress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">Completion Rate</Typography>
                  <Typography variant="body2">
                    {Math.round((progressStats.completed / progressStats.total) * 100)}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(progressStats.completed / progressStats.total) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                  color="success"
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Milestone Progress
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">Milestones Completed</Typography>
                  <Typography variant="body2">
                    {progressStats.completedMilestones} / {progressStats.totalMilestones}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progressStats.totalMilestones > 0 ? (progressStats.completedMilestones / progressStats.totalMilestones) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4 }}
                  color="info"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {progressStats.totalMilestones - progressStats.completedMilestones} milestones remaining
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderGoalProgressList = () => (
    <Stack spacing={2}>
      {goals.map(goal => (
        <Card key={goal.id} sx={{ cursor: 'pointer' }} onClick={() => handleGoalSelect(goal)}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1}>
                  {React.createElement(STATUS_ICONS[goal.status], { sx: { color: STATUS_COLORS[goal.status] } })}
                  <Typography variant="h6">{goal.description}</Typography>
                </Stack>
                
                <Stack direction="row" spacing={1}>
                  <Chip
                    size="small"
                    label={goal.status}
                    sx={{
                      backgroundColor: STATUS_COLORS[goal.status],
                      color: 'white'
                    }}
                  />
                  <Chip
                    size="small"
                    label={`P${goal.priority}`}
                    sx={{
                      backgroundColor: PRIORITY_COLORS[goal.priority],
                      color: 'white'
                    }}
                  />
                </Stack>
              </Stack>

              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">Progress</Typography>
                  <Typography variant="body2">{Math.round(goal.progress.percentage)}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={goal.progress.percentage}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {goal.progress.milestones.length} milestones • {goal.progress.completedMilestones.length} completed
                </Typography>
                
                <Stack direction="row" spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(goal.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Updated: {new Date(goal.updatedAt).toLocaleDateString()}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  const renderMilestoneDetails = () => {
    if (!selectedGoal) {
      return (
        <Alert severity="info">
          Select a goal to view milestone details
        </Alert>
      );
    }

    return (
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Milestones for: {selectedGoal.description}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleMilestoneCreate}
              size="small"
            >
              Add Milestone
            </Button>
          </Stack>
        </Paper>

        {selectedGoal.progress.milestones.map(milestone => {
          const isCompleted = selectedGoal.progress.completedMilestones.includes(milestone.id);
          const milestoneProgress = milestone.targetValue > 0 ? (milestone.currentValue / milestone.targetValue) * 100 : 0;
          
          return (
            <Card key={milestone.id}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Badge
                        color={isCompleted ? 'success' : 'default'}
                        variant="dot"
                      >
                        <Typography variant="h6">
                          {milestone.title}
                        </Typography>
                      </Badge>
                      {isCompleted && (
                        <Chip
                          size="small"
                          label="Completed"
                          color="success"
                          icon={<CompletedIcon />}
                        />
                      )}
                    </Stack>
                    
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleMilestoneEdit(milestone as UIMilestone)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {!isCompleted && (
                        <Tooltip title="Mark Complete">
                          <IconButton
                            size="small"
                            onClick={() => handleMilestoneComplete(milestone.id)}
                            color="success"
                          >
                            <CompletedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleMilestoneDelete(milestone.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  {milestone.description && (
                    <Typography variant="body2" color="text.secondary">
                      {milestone.description}
                    </Typography>
                  )}

                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">
                        Progress: {milestone.currentValue} / {milestone.targetValue}
                      </Typography>
                      <Typography variant="body2">
                        {Math.round(milestoneProgress)}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={milestoneProgress}
                      sx={{ height: 6, borderRadius: 3 }}
                      color={isCompleted ? 'success' : 'primary'}
                    />
                  </Box>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {milestone.dueDate && (
                        <Typography variant="caption" color="text.secondary">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Typography>
                    
                    <Stack direction="row" spacing={1}>
                      {milestone.tags.map(tag => (
                        <Chip key={tag} size="small" label={tag} variant="outlined" />
                      ))}
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}

        {selectedGoal.progress.milestones.length === 0 && (
          <Alert severity="info">
            No milestones defined for this goal. Create milestones to track progress more effectively.
          </Alert>
        )}
      </Stack>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            Goal Progress Tracker
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Stack direction="row" spacing={1}>
              <Button
                variant={viewMode === 'overview' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('overview')}
                startIcon={<AssessmentIcon />}
              >
                Overview
              </Button>
              <Button
                variant={viewMode === 'detailed' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('detailed')}
                startIcon={<TimelineIcon />}
              >
                Detailed
              </Button>
              <Button
                variant={viewMode === 'milestones' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('milestones')}
                startIcon={<FlagIcon />}
              >
                Milestones
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Content */}
      <Box sx={{ height: height || 600, overflow: 'auto' }}>
        {viewMode === 'overview' && renderProgressOverview()}
        {viewMode === 'detailed' && renderGoalProgressList()}
        {viewMode === 'milestones' && renderMilestoneDetails()}
      </Box>

      {/* Milestone Edit Dialog */}
      <Dialog open={milestoneDialogOpen} onClose={() => setMilestoneDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {creatingMilestone ? 'Create Milestone' : 'Edit Milestone'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Title"
              value={editingMilestone?.title || ''}
              onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, title: e.target.value } : null)}
            />
            
            <TextField
              fullWidth
              label="Description"
              value={editingMilestone?.description || ''}
              onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, description: e.target.value } : null)}
              multiline
              rows={3}
            />
            
            <Stack direction="row" spacing={2}>
              <TextField
                label="Target Value"
                type="number"
                value={editingMilestone?.targetValue || 0}
                onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, targetValue: Number(e.target.value) } : null)}
              />
              
              <TextField
                label="Current Value"
                type="number"
                value={editingMilestone?.currentValue || 0}
                onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, currentValue: Number(e.target.value) } : null)}
              />
            </Stack>
            
            <TextField
              label="Due Date"
              type="date"
              value={editingMilestone?.dueDate ? new Date(editingMilestone.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, dueDate: new Date(e.target.value).getTime() } : null)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMilestoneDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMilestoneSave} variant="contained">
            {creatingMilestone ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoalProgressTracker;