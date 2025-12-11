import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Stack,
  Paper,
  Avatar,
  Tooltip,
  Badge,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  PriorityHigh as PriorityIcon,
  LowPriority as LowPriorityIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  SwapHoriz as SwapIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import type { RootState } from '../../store/types';
import type { Goal, GoalConflict, GoalPriority, GoalStatus } from '../../types/goals';

interface GoalPriorityAnalyzerProps {
  agentId?: string;
  goals?: Goal[];
  height?: number;
  onPriorityChange?: (goalId: string, newPriority: GoalPriority) => void;
  onConflictResolve?: (conflictId: string, resolution: string) => void;
}

interface PriorityAnalysis {
  totalGoals: number;
  priorityDistribution: Record<GoalPriority, number>;
  conflicts: GoalConflict[];
  recommendations: PriorityRecommendation[];
  trends: PriorityTrend[];
}

interface PriorityRecommendation {
  type: 'upgrade' | 'downgrade' | 'resolve_conflict' | 'reorder';
  goalId: string;
  currentPriority: GoalPriority;
  suggestedPriority: GoalPriority;
  reason: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
}

interface PriorityTrend {
  date: string;
  averagePriority: number;
  conflictCount: number;
  resolutionRate: number;
}

const PRIORITY_COLORS = {
  0: '#d32f2f', // CRITICAL - Red
  1: '#f57c00', // HIGH - Orange  
  2: '#1976d2', // MEDIUM - Blue
  3: '#757575'  // LOW - Gray
};

const PRIORITY_LABELS = {
  0: 'Critical',
  1: 'High',
  2: 'Medium', 
  3: 'Low'
};

const CONFLICT_TYPES = {
  resource: 'Resource Conflict',
  priority: 'Priority Conflict',
  dependency: 'Dependency Conflict',
  timing: 'Timing Conflict'
};

const SEVERITY_COLORS = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f57c00',
  critical: '#d32f2f'
};

export const GoalPriorityAnalyzer: React.FC<GoalPriorityAnalyzerProps> = ({
  agentId,
  goals = [],
  onPriorityChange,
  onConflictResolve
}) => {
  const [selectedConflict, setSelectedConflict] = useState<GoalConflict | null>(null);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newPriority, setNewPriority] = useState<GoalPriority>(2);
  const [filterType, setFilterType] = useState<'all' | 'conflicts' | 'recommendations'>('all');
  const [resolutionText, setResolutionText] = useState('');

  const priorityAnalysis = useMemo((): PriorityAnalysis => {
    // Calculate priority distribution
    const priorityDistribution: Record<GoalPriority, number> = {
      0: 0, 1: 0, 2: 0, 3: 0
    };
    
    goals.forEach(goal => {
      priorityDistribution[goal.priority]++;
    });

    // Detect conflicts
    const conflicts: GoalConflict[] = [];
    
    // Resource conflicts
    const resourceMap = new Map<string, Goal[]>();
    goals.forEach(goal => {
      goal.resources.required.forEach(resource => {
        const existing = resourceMap.get(resource.type) || [];
        resourceMap.set(resource.type, [...existing, goal]);
      });
    });

    resourceMap.forEach((resourceGoals, resourceType) => {
      if (resourceGoals.length > 1) {
        // Check for high-priority goals competing for same resources
        const highPriorityGoals = resourceGoals.filter(g => g.priority <= 1);
        if (highPriorityGoals.length > 1) {
          conflicts.push({
            id: `resource_${resourceType}`,
            conflictingGoals: highPriorityGoals.map(g => g.id),
            conflictType: 'resource',
            severity: 'high',
            description: `Multiple high-priority goals require ${resourceType}`,
            suggestedResolution: 'Reorder priorities or allocate additional resources',
            detectedAt: Date.now()
          });
        }
      }
    });

    // Priority conflicts (child goals with higher priority than parents)
    goals.forEach(goal => {
      if (goal.parentGoal) {
        const parentGoal = goals.find(g => g.id === goal.parentGoal);
        if (parentGoal && goal.priority < parentGoal.priority) {
          conflicts.push({
            id: `priority_${goal.id}_${parentGoal.id}`,
            conflictingGoals: [goal.id, parentGoal.id],
            conflictType: 'priority',
            severity: 'medium',
            description: `Child goal "${goal.description}" has higher priority than parent "${parentGoal.description}"`,
            suggestedResolution: 'Adjust priority levels to maintain hierarchy',
            detectedAt: Date.now()
          });
        }
      }
    });

    // Dependency conflicts
    goals.forEach(goal => {
      const blockedGoals = goals.filter(g => g.dependencies.includes(goal.id) && g.status === 'active');
      if (goal.status === 'pending' && blockedGoals.length > 0) {
        conflicts.push({
          id: `dependency_${goal.id}`,
          conflictingGoals: [goal.id, ...blockedGoals.map(g => g.id)],
          conflictType: 'dependency',
          severity: 'high',
          description: `Goal "${goal.description}" is blocking active goals`,
          suggestedResolution: 'Activate this goal or restructure dependencies',
          detectedAt: Date.now()
        });
      }
    });

    // Generate recommendations
    const recommendations: PriorityRecommendation[] = [];
    
    goals.forEach(goal => {
      // Recommend priority upgrades for stuck goals
      if (goal.status === 'pending' && goal.priority > 1) {
        const activeGoals = goals.filter(g => g.status === 'active');
        if (activeGoals.length < 3) {
          recommendations.push({
            type: 'upgrade',
            goalId: goal.id,
            currentPriority: goal.priority,
            suggestedPriority: (goal.priority - 1) as GoalPriority,
            reason: 'Goal has been pending too long with low priority',
            impact: 'medium',
            confidence: 0.7
          });
        }
      }

      // Recommend priority downgrades for completed goals with high priority
      if (goal.status === 'completed' && goal.priority <= 1) {
        recommendations.push({
          type: 'downgrade',
          goalId: goal.id,
          currentPriority: goal.priority,
          suggestedPriority: 2,
          reason: 'Completed goal with unnecessarily high priority',
          impact: 'low',
          confidence: 0.9
        });
      }
    });

    // Generate mock trends (in real implementation, this would come from historical data)
    const trends: PriorityTrend[] = [
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        averagePriority: 2.1,
        conflictCount: 3,
        resolutionRate: 0.8
      },
      {
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        averagePriority: 1.9,
        conflictCount: 2,
        resolutionRate: 0.85
      },
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        averagePriority: 2.0,
        conflictCount: 4,
        resolutionRate: 0.75
      },
      {
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        averagePriority: 1.8,
        conflictCount: 2,
        resolutionRate: 0.9
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        averagePriority: 1.7,
        conflictCount: 1,
        resolutionRate: 0.95
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        averagePriority: 1.9,
        conflictCount: 3,
        resolutionRate: 0.8
      },
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        averagePriority: 2.0,
        conflictCount: conflicts.length,
        resolutionRate: 0.85
      }
    ];

    return {
      totalGoals: goals.length,
      priorityDistribution,
      conflicts,
      recommendations,
      trends
    };
  }, [goals]);

  const handlePriorityChange = () => {
    if (selectedGoal && onPriorityChange) {
      onPriorityChange(selectedGoal.id, newPriority);
      setPriorityDialogOpen(false);
      setSelectedGoal(null);
    }
  };

  const handleConflictResolve = () => {
    if (selectedConflict && onConflictResolve && resolutionText) {
      onConflictResolve(selectedConflict.id, resolutionText);
      setConflictDialogOpen(false);
      setSelectedConflict(null);
      setResolutionText('');
    }
  };

  const getPriorityIcon = (priority: GoalPriority) => {
    switch (priority) {
      case 0: return <ErrorIcon />;
      case 1: return <WarningIcon />;
      case 2: return <InfoIcon />;
      case 3: return <LowPriorityIcon />;
      default: return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    return SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || '#757575';
  };

  const filteredConflicts = filterType === 'all' ? priorityAnalysis.conflicts : 
                           filterType === 'conflicts' ? priorityAnalysis.conflicts : [];

  const filteredRecommendations = filterType === 'all' ? priorityAnalysis.recommendations :
                                 filterType === 'recommendations' ? priorityAnalysis.recommendations : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Priority Analysis
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterType}
              label="Filter"
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <MenuItem value="all">All Items</MenuItem>
              <MenuItem value="conflicts">Conflicts Only</MenuItem>
              <MenuItem value="recommendations">Recommendations Only</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Priority Distribution Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: PRIORITY_COLORS[0] }}>
                  <PriorityIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {priorityAnalysis.priorityDistribution[0]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Critical Priority
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: PRIORITY_COLORS[1] }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {priorityAnalysis.priorityDistribution[1]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Priority
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: PRIORITY_COLORS[2] }}>
                  <InfoIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {priorityAnalysis.priorityDistribution[2]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Medium Priority
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: PRIORITY_COLORS[3] }}>
                  <LowPriorityIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="text.secondary">
                    {priorityAnalysis.priorityDistribution[3]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Priority
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Conflicts Alert */}
      {priorityAnalysis.conflicts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {priorityAnalysis.conflicts.length} Priority Conflicts Detected
          </Typography>
          <Typography variant="body2">
            Some goals have conflicting priorities or dependencies that need resolution.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Priority Conflicts */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Priority Conflicts ({filteredConflicts.length})
              </Typography>
              <List>
                {filteredConflicts.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No conflicts detected"
                      secondary="All goals have consistent priorities"
                    />
                  </ListItem>
                ) : (
                  filteredConflicts.map((conflict) => (
                    <ListItem key={conflict.id} sx={{ py: 2 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: getSeverityColor(conflict.severity) }}>
                          <WarningIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={CONFLICT_TYPES[conflict.conflictType]}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {conflict.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {conflict.conflictingGoals.length} goals affected
                            </Typography>
                          </Box>
                        }
                      />
                      <Stack direction="row" spacing={1}>
                        <Chip
                          size="small"
                          label={conflict.severity}
                          sx={{ 
                            bgcolor: getSeverityColor(conflict.severity),
                            color: 'white'
                          }}
                        />
                        <Tooltip title="Resolve Conflict">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedConflict(conflict);
                              setConflictDialogOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Priority Recommendations */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Priority Recommendations ({filteredRecommendations.length})
              </Typography>
              <List>
                {filteredRecommendations.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No recommendations"
                      secondary="All goals have appropriate priorities"
                    />
                  </ListItem>
                ) : (
                  filteredRecommendations.map((rec, index) => {
                    const goal = goals.find(g => g.id === rec.goalId);
                    return (
                      <ListItem key={index} sx={{ py: 2 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: rec.type === 'upgrade' ? 'success.main' : 'warning.main' }}>
                            {rec.type === 'upgrade' ? <UpIcon /> : <DownIcon />}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={goal?.description || 'Unknown Goal'}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {rec.reason}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Chip
                                  size="small"
                                  label={`${PRIORITY_LABELS[rec.currentPriority]} → ${PRIORITY_LABELS[rec.suggestedPriority]}`}
                                  variant="outlined"
                                />
                                <Chip
                                  size="small"
                                  label={`${Math.round(rec.confidence * 100)}% confidence`}
                                  variant="outlined"
                                />
                              </Stack>
                            </Box>
                          }
                        />
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Apply Recommendation">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedGoal(goal || null);
                                setNewPriority(rec.suggestedPriority);
                                setPriorityDialogOpen(true);
                              }}
                            >
                              <SwapIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </ListItem>
                    );
                  })
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Priority Trends */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Priority Trends (7 Days)
              </Typography>
              <Box sx={{ mt: 2 }}>
                {priorityAnalysis.trends.map((trend, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {new Date(trend.date).toLocaleDateString()}
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Typography variant="caption">
                          Avg Priority: {trend.averagePriority.toFixed(1)}
                        </Typography>
                        <Typography variant="caption">
                          Conflicts: {trend.conflictCount}
                        </Typography>
                        <Typography variant="caption">
                          Resolution Rate: {Math.round(trend.resolutionRate * 100)}%
                        </Typography>
                      </Stack>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={trend.resolutionRate * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Priority Change Dialog */}
      <Dialog open={priorityDialogOpen} onClose={() => setPriorityDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Goal Priority</DialogTitle>
        <DialogContent>
          {selectedGoal && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Typography variant="body1">
                Goal: {selectedGoal.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Priority: {PRIORITY_LABELS[selectedGoal.priority]}
              </Typography>
              <FormControl fullWidth>
                <InputLabel>New Priority</InputLabel>
                <Select
                  value={newPriority}
                  label="New Priority"
                  onChange={(e) => setNewPriority(Number(e.target.value) as GoalPriority)}
                >
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={Number(value)}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {getPriorityIcon(Number(value) as GoalPriority)}
                        <Typography>{label}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriorityDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePriorityChange} variant="contained">
            Change Priority
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conflict Resolution Dialog */}
      <Dialog open={conflictDialogOpen} onClose={() => setConflictDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Resolve Priority Conflict</DialogTitle>
        <DialogContent>
          {selectedConflict && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Typography variant="body1">
                {CONFLICT_TYPES[selectedConflict.conflictType]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedConflict.description}
              </Typography>
              <Alert severity="warning">
                Suggested Resolution: {selectedConflict.suggestedResolution}
              </Alert>
              <TextField
                label="Resolution Details"
                multiline
                rows={4}
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Describe how you resolved this conflict..."
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConflictDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConflictResolve} 
            variant="contained"
            disabled={!resolutionText.trim()}
          >
            Mark as Resolved
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoalPriorityAnalyzer;