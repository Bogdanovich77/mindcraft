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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  AccountTree as TreeIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import type { Goal, GoalType, GoalStatus, GoalPriority } from '../../types/goals';

// Simple drag and drop interface without external library
interface DragItem {
  id: string;
  index: number;
  type: GoalType;
}

interface DropResult {
  draggableId: string;
  source: {
    index: number;
    droppableId: string;
  };
  destination?: {
    index: number;
    droppableId: string;
  };
}

interface GoalDragDropInterfaceProps {
  goals: Goal[];
  onGoalEdit?: (goal: Goal) => void;
  onGoalUpdate?: (goal: Goal) => void;
  onGoalDelete?: (goalId: string) => void;
  height?: number;
  onGoalReorder?: (sourceIndex: number, destIndex: number, goalType: GoalType) => void;
}

// Simple drag and drop context component
const DragDropContext: React.FC<{
  onDragEnd: (result: DropResult) => void;
  children: React.ReactNode;
}> = ({ children, onDragEnd }) => {
  return <>{children}</>;
};

// Simple droppable component
const Droppable: React.FC<{
  droppableId: string;
  children: (provided: any, snapshot: any) => React.ReactNode;
}> = ({ droppableId, children }) => {
  return children({}, { isDraggingOver: false });
};

// Simple draggable component
const Draggable: React.FC<{
  draggableId: string;
  index: number;
  children: (provided: any, snapshot: any) => React.ReactNode;
}> = ({ children }) => {
  return children({}, { isDragging: false });
};

const TYPE_COLORS: Record<GoalType, string> = {
  strategic: '#1976d2',
  tactical: '#388e3c',
  operational: '#f57c00'
};

const STATUS_COLORS: Record<GoalStatus, string> = {
  completed: '#4caf50',
  active: '#2196f3',
  pending: '#ff9800',
  failed: '#f44336',
  paused: '#9c27b0',
  cancelled: '#757575',
  in_progress: '#2196f3'
};

const PRIORITY_COLORS: Record<GoalPriority, string> = {
  0: '#d32f2f', // CRITICAL
  1: '#f57c00', // HIGH
  2: '#1976d2', // MEDIUM
  3: '#757575'  // LOW
};

export const GoalDragDropInterface: React.FC<GoalDragDropInterfaceProps> = ({
  goals,
  onGoalEdit,
  onGoalUpdate,
  onGoalDelete,
  height = 600,
  onGoalReorder
}) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create a proper goal object for editing
  const createNewGoal = (): Goal => ({
    id: `goal_${Date.now()}`,
    title: 'New Goal',
    type: 'operational',
    priority: 2,
    description: '',
    status: 'pending',
    dependencies: [],
    resources: { required: [], allocated: [], totalCost: 0 },
    progress: { current: 0, target: 1, percentage: 0, milestones: [], completedMilestones: [], lastUpdated: Date.now() },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    childGoals: [],
    metadata: {},
    notes: '',
    tags: []
  });

  // Organize goals by type
  const goalsByType = {
    strategic: goals.filter(g => g.type === 'strategic'),
    tactical: goals.filter(g => g.type === 'tactical'),
    operational: goals.filter(g => g.type === 'operational')
  };

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Check if dragging within the same list
    if (source.droppableId === destination.droppableId) {
      const goalType = source.droppableId as GoalType;
      onGoalReorder?.(source.index, destination.index, goalType);
    } else {
      // Handle moving between different goal types
      // This would require updating the goal type in the backend
      console.log('Moving goal between types:', {
        from: source.droppableId,
        to: destination.droppableId,
        fromIndex: source.index,
        toIndex: destination.index
      });
    }
  }, [onGoalReorder]);

  const handleGoalEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setEditDialogOpen(true);
  };

  const handleGoalUpdate = () => {
    if (!editingGoal) return;
    
    onGoalUpdate?.(editingGoal);
    setEditDialogOpen(false);
    setEditingGoal(null);
  };

  const handleCreateGoal = () => {
    const newGoal = createNewGoal();
    setEditingGoal(newGoal);
    setEditDialogOpen(true);
  };

  const handleGoalDelete = (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      onGoalDelete?.(goalId);
    }
  };

  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  const renderGoalItem = (goal: Goal, index: number) => (
    <Draggable key={goal.id} draggableId={goal.id} index={index}>
      {(provided: any, snapshot: any) => (
        <ListItem
          sx={{
            bgcolor: snapshot.isDragging ? 'action.selected' : 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            mb: 1,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
          onClick={() => handleGoalSelect(goal)}
        >
          <ListItemIcon>
            <DragIcon sx={{ color: 'text.secondary' }} />
          </ListItemIcon>
          
          <Box sx={{ flexGrow: 1, mr: 2 }}>
            <Typography variant="body2" fontWeight="medium">
              {goal.description}
            </Typography>
            
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip
                size="small"
                label={goal.status}
                sx={{
                  backgroundColor: STATUS_COLORS[goal.status],
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 18
                }}
              />
              <Chip
                size="small"
                label={`P${goal.priority}`}
                sx={{
                  backgroundColor: PRIORITY_COLORS[goal.priority],
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 18
                }}
              />
              {goal.progress.percentage > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {Math.round(goal.progress.percentage)}%
                </Typography>
              )}
            </Stack>
          </Box>

          <ListItemSecondaryAction>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGoalEdit(goal);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGoalDelete(goal.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </ListItemSecondaryAction>
        </ListItem>
      )}
    </Draggable>
  );

  const renderGoalList = (type: GoalType, goals: Goal[]) => (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: TYPE_COLORS[type], color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">
          {type.charAt(0).toUpperCase() + type.slice(1)} Goals
        </Typography>
        <Typography variant="body2">
          {goals.length} goal{goals.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        <Droppable droppableId={type}>
          {(provided: any, snapshot: any) => (
            <Box
              sx={{
                minHeight: 200,
                bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                borderRadius: 1,
                p: 1
              }}
            >
              {goals.map((goal, index) => renderGoalItem(goal, index))}
              {provided.placeholder}
              
              {goals.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography variant="body2">
                    No {type} goals
                  </Typography>
                  <Typography variant="caption">
                    Drag goals here or create new ones
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Droppable>
      </Box>
    </Paper>
  );

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h6" fontWeight="bold">
              Goal Management Interface
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                size="small" 
                label={`${goals.length} total goals`}
                color="primary"
                variant="outlined"
              />
              <Chip 
                size="small" 
                label={`${goalsByType.strategic.length} strategic`}
                sx={{ backgroundColor: TYPE_COLORS.strategic, color: 'white' }}
              />
              <Chip 
                size="small" 
                label={`${goalsByType.tactical.length} tactical`}
                sx={{ backgroundColor: TYPE_COLORS.tactical, color: 'white' }}
              />
              <Chip 
                size="small" 
                label={`${goalsByType.operational.length} operational`}
                sx={{ backgroundColor: TYPE_COLORS.operational, color: 'white' }}
              />
            </Stack>
          </Stack>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateGoal}
          >
            Create Goal
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Drag and Drop Interface */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, height: height || 600 }}>
          {Object.entries(goalsByType).map(([type, typeGoals]) => (
            <Box key={type} sx={{ flex: 1 }}>
              {renderGoalList(type as GoalType, typeGoals)}
            </Box>
          ))}
        </Box>
      </DragDropContext>

      {/* Selected Goal Details */}
      {selectedGoal && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">
              Selected Goal Details
            </Typography>
            <Button size="small" onClick={() => setSelectedGoal(null)}>
              Clear Selection
            </Button>
          </Stack>
          
          <Stack spacing={2}>
            <Typography variant="body1">
              <strong>Description:</strong> {selectedGoal.description}
            </Typography>
            
            <Stack direction="row" spacing={2}>
              <Typography variant="body2">
                <strong>Type:</strong> {selectedGoal.type}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {selectedGoal.status}
              </Typography>
              <Typography variant="body2">
                <strong>Priority:</strong> {selectedGoal.priority}
              </Typography>
            </Stack>
            
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>Progress:</strong> {Math.round(selectedGoal.progress.percentage)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={selectedGoal.progress.percentage}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Typography variant="body2">
                <strong>Created:</strong> {new Date(selectedGoal.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body2">
                <strong>Updated:</strong> {new Date(selectedGoal.updatedAt).toLocaleDateString()}
              </Typography>
            </Stack>
            
            {selectedGoal.parentGoal && (
              <Typography variant="body2">
                <strong>Parent Goal:</strong> {goals.find(g => g.id === selectedGoal.parentGoal)?.description || 'Unknown'}
              </Typography>
            )}
          </Stack>
        </Paper>
      )}

      {/* Edit/Create Goal Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingGoal ? 'Edit Goal' : 'Create New Goal'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Description"
              value={editingGoal?.description || ''}
              onChange={(e) => setEditingGoal(prev => prev ? { ...prev, description: e.target.value } : createNewGoal())}
              multiline
              rows={3}
            />
            
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={editingGoal?.type || 'operational'}
                label="Type"
                onChange={(e) => setEditingGoal(prev => prev ? { ...prev, type: e.target.value as GoalType } : createNewGoal())}
              >
                <MenuItem value="strategic">Strategic</MenuItem>
                <MenuItem value="tactical">Tactical</MenuItem>
                <MenuItem value="operational">Operational</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editingGoal?.status || 'pending'}
                label="Status"
                onChange={(e) => setEditingGoal(prev => prev ? { ...prev, status: e.target.value as GoalStatus } : createNewGoal())}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={editingGoal?.priority || 2}
                label="Priority"
                onChange={(e) => setEditingGoal(prev => prev ? { ...prev, priority: e.target.value as GoalPriority } : createNewGoal())}
              >
                <MenuItem value={0}>Critical</MenuItem>
                <MenuItem value={1}>High</MenuItem>
                <MenuItem value={2}>Medium</MenuItem>
                <MenuItem value={3}>Low</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleGoalUpdate} variant="contained">
            {editingGoal ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoalDragDropInterface;