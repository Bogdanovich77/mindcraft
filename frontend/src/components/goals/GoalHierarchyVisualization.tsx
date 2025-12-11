import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Alert,
  Button,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  AccountTree as TreeIcon,
  ViewList as ListIcon,
  Share as DependencyIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Assessment as AnalyticsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/types';
import type { Goal, GoalType, GoalStatus } from '../../types/goals';
import { fetchGoalHierarchy, setFilterCriteria } from '../../store/slices/goalsSlice';

// Import sub-components
import GoalTreeVisualization from './GoalTreeVisualization';
import GoalDragDropInterface from './GoalDragDropInterface';
import GoalDependencyMap from './GoalDependencyMap';
import GoalProgressTracker from './GoalProgressTracker';
import ResourceAllocationView from './ResourceAllocationView';
import GoalPriorityAnalyzer from './GoalPriorityAnalyzer';
import GoalHistoryAnalytics from './GoalHistoryAnalytics';
import GoalCreationInterface from './GoalCreationInterface';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`goal-tabpanel-${index}`}
      aria-labelledby={`goal-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface GoalHierarchyVisualizationProps {
  agentId?: string;
  goals?: Goal[];
  onGoalCreate?: (goal: Goal) => void;
  onGoalUpdate?: (goal: Goal) => void;
  onGoalDelete?: (goalId: string) => void;
  height?: number;
}

type ViewMode = 'tree' | 'list' | 'dependency' | 'timeline';
type TabValue = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const GoalHierarchyVisualization: React.FC<GoalHierarchyVisualizationProps> = ({
  agentId,
  goals: propGoals,
  onGoalCreate,
  onGoalUpdate,
  onGoalDelete,
  height = 800
}) => {
  const dispatch = useDispatch();
  const { goals, isLoading, error, filters, statistics } = useSelector((state: RootState) => state.goals);
  
  const [activeTab, setActiveTab] = useState<TabValue>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const displayGoals = propGoals || goals;

  const filteredGoals = useMemo(() => {
    let filtered = [...displayGoals];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(goal => goal.status === filters.status);
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(goal => goal.type === filters.type);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(goal => goal.priority === filters.priority);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(goal => 
        goal.description.toLowerCase().includes(searchLower) ||
        goal.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [displayGoals, filters]);

  const goalStatistics = useMemo(() => {
    const total = filteredGoals.length;
    const completed = filteredGoals.filter(g => g.status === 'completed').length;
    const active = filteredGoals.filter(g => g.status === 'active').length;
    const pending = filteredGoals.filter(g => g.status === 'pending').length;
    const failed = filteredGoals.filter(g => g.status === 'failed').length;

    const byType = {
      strategic: filteredGoals.filter(g => g.type === 'strategic').length,
      tactical: filteredGoals.filter(g => g.type === 'tactical').length,
      operational: filteredGoals.filter(g => g.type === 'operational').length
    };

    const byPriority = {
      0: filteredGoals.filter(g => g.priority === 0).length,
      1: filteredGoals.filter(g => g.priority === 1).length,
      2: filteredGoals.filter(g => g.priority === 2).length,
      3: filteredGoals.filter(g => g.priority === 3).length
    };

    return {
      total,
      completed,
      active,
      pending,
      failed,
      byType,
      byPriority,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [filteredGoals]);

  useEffect(() => {
    if (!propGoals && agentId) {
      dispatch(fetchGoalHierarchy(agentId) as any);
    }
  }, [dispatch, propGoals, agentId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  const handleFilterChange = (filterType: string, value: any) => {
    dispatch(setFilterCriteria({ [filterType]: value }));
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleRefresh = () => {
    if (agentId) {
      dispatch(fetchGoalHierarchy(agentId) as any);
    }
  };

  const handleGoalCreate = (goal: Goal) => {
    onGoalCreate?.(goal);
    setShowCreateDialog(false);
  };

  const handleGoalUpdate = (goal: Goal) => {
    onGoalUpdate?.(goal);
    setSelectedGoal(null);
  };

  const handleGoalEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowCreateDialog(true);
  };

  const renderStatisticsCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <AnalyticsIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {goalStatistics.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Goals
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <AnalyticsIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {goalStatistics.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <AnalyticsIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {goalStatistics.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <AnalyticsIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {goalStatistics.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <AnalyticsIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {goalStatistics.failed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Failed
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: goalStatistics.completionRate >= 80 ? 'success.main' : 'warning.main' }}>
                <AnalyticsIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {Math.round(goalStatistics.completionRate)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderControls = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
          >
            Create Goal
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="strategic">Strategic</MenuItem>
              <MenuItem value="tactical">Tactical</MenuItem>
              <MenuItem value="operational">Operational</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority}
              label="Priority"
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value={0}>Critical</MenuItem>
              <MenuItem value={1}>High</MenuItem>
              <MenuItem value={2}>Medium</MenuItem>
              <MenuItem value={3}>Low</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} disabled={zoomLevel >= 2}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Fullscreen">
            <IconButton onClick={handleFullscreen}>
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );

  if (isLoading && displayGoals.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Stack alignItems="center" spacing={2}>
          <LinearProgress sx={{ width: 300 }} />
          <Typography variant="body1" color="text.secondary">
            Loading goal hierarchy...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      height: isFullscreen ? '100vh' : 'auto',
      overflow: isFullscreen ? 'auto' : 'visible'
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Goal Hierarchy Visualization
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip 
            label={`${filteredGoals.length} goals`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`Zoom: ${Math.round(zoomLevel * 100)}%`} 
            color="secondary" 
            variant="outlined" 
          />
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {renderStatisticsCards()}

      {/* Controls */}
      {renderControls()}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<TreeIcon />} label="Tree View" />
          <Tab icon={<ListIcon />} label="List View" />
          <Tab icon={<DependencyIcon />} label="Dependencies" />
          <Tab icon={<TimelineIcon />} label="Progress" />
          <Tab icon={<AnalyticsIcon />} label="Resources" />
          <Tab icon={<SettingsIcon />} label="Priority" />
          <Tab icon={<AnalyticsIcon />} label="Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <GoalTreeVisualization
          goals={filteredGoals}
          zoomLevel={zoomLevel}
          onGoalEdit={handleGoalEdit}
          onGoalUpdate={handleGoalUpdate}
          height={height}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <GoalDragDropInterface
          goals={filteredGoals}
          onGoalEdit={handleGoalEdit}
          onGoalUpdate={handleGoalUpdate}
          onGoalDelete={onGoalDelete}
          height={height}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <GoalDependencyMap
          goals={filteredGoals}
          height={height}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <GoalProgressTracker
          goals={filteredGoals}
          height={height}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <ResourceAllocationView
          goals={filteredGoals}
          height={height}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
        <GoalPriorityAnalyzer
          goals={filteredGoals}
          height={height}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={6}>
        <GoalHistoryAnalytics
          agentId={agentId}
          goals={filteredGoals}
        />
      </TabPanel>

      {/* Goal Creation Dialog */}
      <GoalCreationInterface
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        editingGoal={selectedGoal}
        onCreateSuccess={handleGoalCreate}
        onUpdateSuccess={handleGoalUpdate}
      />
    </Box>
  );
};

export default GoalHierarchyVisualization;