import React, { useState, useMemo } from 'react';
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
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Grid,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import type { Goal, ResourceRequirements, ResourceStatus } from '../../types/goals';

interface ResourceAllocationViewProps {
  goals: Goal[];
  onResourceOptimize?: (goalId: string, resources: ResourceRequirements) => void;
  width?: number;
  height?: number;
}

interface ResourceData {
  name: string;
  value: number;
  allocated: number;
  efficiency: number;
  status: ResourceStatus;
  color: string;
  [key: string]: any; // Index signature for ChartDataInput compatibility
}

interface EfficiencyData {
  goal: string;
  efficiency: number;
  resources: number;
  status: string;
}

const STATUS_COLORS: Record<ResourceStatus, string> = {
  sufficient: '#4caf50',
  insufficient: '#f44336',
  critical: '#ff9800',
  optimal: '#2196f3',
  wasted: '#9c27b0',
  available: '#4caf50',
  allocated: '#2196f3',
  in_use: '#ff9800',
  depleted: '#f44336',
  reserved: '#9c27b0'
};

const CHART_COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#00796b'];

export const ResourceAllocationView: React.FC<ResourceAllocationViewProps> = ({
  goals,
  onResourceOptimize,
  width = 800,
  height = 600
}) => {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'efficiency' | 'distribution' | 'status'>('overview');
  const [error, setError] = useState<string | null>(null);

  // Analyze resource data
  const resourceAnalysis = useMemo(() => {
    const resourceMap = new Map<string, ResourceData>();
    const efficiencyData: EfficiencyData[] = [];
    let totalResources = 0;
    let totalAllocated = 0;
    let criticalResources = 0;

    goals.forEach(goal => {
      const goalResources = goal.resources.required.length + goal.resources.allocated.length;
      let efficiency = 0;
      
      if (goalResources > 0) {
        const allocatedRatio = goal.resources.allocated.length / goalResources;
        efficiency = Math.min(100, allocatedRatio * 100);
      }

      efficiencyData.push({
        goal: goal.description.substring(0, 30) + (goal.description.length > 30 ? '...' : ''),
        efficiency,
        resources: goalResources,
        status: goal.status
      });

      // Process required resources
      goal.resources.required.forEach(resource => {
        const key = resource.type;
        const current = resourceMap.get(key) || {
          name: key,
          value: 0,
          allocated: 0,
          efficiency: 0,
          status: 'sufficient' as ResourceStatus,
          color: CHART_COLORS[resourceMap.size % CHART_COLORS.length]
        };

        current.value += resource.amount;
        totalResources += resource.amount;

        // Determine status based on allocation
        const allocated = goal.resources.allocated.find(r => r.type === key);
        if (allocated) {
          current.allocated += allocated.amount;
          totalAllocated += allocated.amount;
          
          const allocationRatio = allocated.amount / resource.amount;
          if (allocationRatio >= 1) {
            current.status = allocationRatio > 1.2 ? 'wasted' : 'optimal';
          } else if (allocationRatio >= 0.8) {
            current.status = 'sufficient';
          } else if (allocationRatio >= 0.5) {
            current.status = 'insufficient';
            criticalResources++;
          } else {
            current.status = 'critical';
            criticalResources++;
          }
        } else {
          current.status = 'critical';
          criticalResources++;
        }

        current.efficiency = current.value > 0 ? (current.allocated / current.value) * 100 : 0;
        resourceMap.set(key, current);
      });
    });

    return {
      resources: Array.from(resourceMap.values()),
      efficiencyData,
      totalResources,
      totalAllocated,
      criticalResources,
      overallEfficiency: totalResources > 0 ? (totalAllocated / totalResources) * 100 : 0
    };
  }, [goals]);

  const handleResourceOptimize = (resourceType: string) => {
    const resource = resourceAnalysis.resources.find(r => r.name === resourceType);
    if (!resource) return;

    // Find goals that need this resource
    const affectedGoals = goals.filter(goal => 
      goal.resources.required.some(r => r.type === resourceType)
    );

    affectedGoals.forEach(goal => {
      const required = goal.resources.required.find(r => r.type === resourceType);
      const allocated = goal.resources.allocated.find(r => r.type === resourceType);
      
      if (required && (!allocated || allocated.amount < required.amount)) {
        const optimizedResources = {
          ...goal.resources,
          allocated: [
            ...goal.resources.allocated.filter(r => r.type !== resourceType),
            {
              type: resourceType,
              amount: required.amount,
              available: required.amount,
              unit: required.unit,
              status: 'allocated' as ResourceStatus,
              priority: 'high' as "critical" | "high" | "medium" | "low"
            }
          ]
        };
        
        onResourceOptimize?.(goal.id, optimizedResources);
      }
    });
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={1}>
              <StorageIcon sx={{ fontSize: 40, color: '#1976d2' }} />
              <Typography variant="h4">{resourceAnalysis.totalResources}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Resources
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={1}>
              <SpeedIcon sx={{ fontSize: 40, color: '#4caf50' }} />
              <Typography variant="h4">{Math.round(resourceAnalysis.overallEfficiency)}%</Typography>
              <Typography variant="body2" color="text.secondary">
                Allocation Efficiency
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={1}>
              <WarningIcon sx={{ fontSize: 40, color: '#f44336' }} />
              <Typography variant="h4">{resourceAnalysis.criticalResources}</Typography>
              <Typography variant="body2" color="text.secondary">
                Critical Resources
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={1}>
              <AssessmentIcon sx={{ fontSize: 40, color: '#f57c00' }} />
              <Typography variant="h4">{resourceAnalysis.resources.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Resource Types
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resource Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={resourceAnalysis.resources}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: any) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {resourceAnalysis.resources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Allocation Status
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={resourceAnalysis.resources}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="value" fill="#1976d2" name="Required" />
                <Bar dataKey="allocated" fill="#4caf50" name="Allocated" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderEfficiencyAnalysis = () => (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Goal Resource Efficiency
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resourceAnalysis.efficiencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="goal" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="efficiency" fill="#2196f3" name="Efficiency %" />
              <Bar dataKey="resources" fill="#ff9800" name="Resource Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Efficiency Analysis
          </Typography>
          <List>
            {resourceAnalysis.efficiencyData
              .sort((a, b) => a.efficiency - b.efficiency)
              .slice(0, 5)
              .map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {item.efficiency < 50 ? (
                      <ErrorIcon color="error" />
                    ) : item.efficiency < 80 ? (
                      <WarningIcon color="warning" />
                    ) : (
                      <CheckIcon color="success" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.goal}
                    secondary={`${item.resources} resources • ${Math.round(item.efficiency)}% efficiency`}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={item.efficiency}
                    sx={{ width: 100, mr: 2 }}
                    color={item.efficiency < 50 ? 'error' : item.efficiency < 80 ? 'warning' : 'success'}
                  />
                </ListItem>
              ))}
          </List>
        </CardContent>
      </Card>
    </Stack>
  );

  const renderDistributionView = () => (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resource Utilization
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <RadialBarChart data={resourceAnalysis.resources}>
              <RadialBar
                dataKey="efficiency"
                cornerRadius={10}
                fill="#8884d8"
                label={{ position: 'insideStart', fill: '#fff' }}
              />
              <RechartsTooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resource Details
          </Typography>
          <List>
            {resourceAnalysis.resources.map(resource => (
              <ListItem key={resource.name} divider>
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: resource.color
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={resource.name}
                  secondary={
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        Required: {resource.value} | Allocated: {resource.allocated}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={resource.efficiency}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Stack>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={resource.status}
                      sx={{
                        backgroundColor: STATUS_COLORS[resource.status],
                        color: 'white'
                      }}
                    />
                    {resource.status === 'critical' || resource.status === 'insufficient' ? (
                      <Tooltip title="Optimize Allocation">
                        <IconButton
                          size="small"
                          onClick={() => handleResourceOptimize(resource.name)}
                          color="primary"
                        >
                          <TrendingUpIcon />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Stack>
  );

  const renderStatusView = () => (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {Object.entries(STATUS_COLORS).map(([status, color]) => {
          const count = resourceAnalysis.resources.filter(r => r.status === status).length;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={status}>
              <Card>
                <CardContent>
                  <Stack alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {status === 'critical' && <ErrorIcon sx={{ color: 'white' }} />}
                      {status === 'insufficient' && <WarningIcon sx={{ color: 'white' }} />}
                      {status === 'sufficient' && <CheckIcon sx={{ color: 'white' }} />}
                      {status === 'optimal' && <TrendingUpIcon sx={{ color: 'white' }} />}
                      {status === 'wasted' && <InfoIcon sx={{ color: 'white' }} />}
                    </Box>
                    <Typography variant="h4">{count}</Typography>
                    <Typography variant="body2" textTransform="capitalize">
                      {status}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resource Status Summary
          </Typography>
          <Alert severity={resourceAnalysis.criticalResources > 0 ? 'error' : 'success'}>
            {resourceAnalysis.criticalResources > 0 
              ? `${resourceAnalysis.criticalResources} resources require immediate attention`
              : 'All resources are adequately allocated'
            }
          </Alert>
        </CardContent>
      </Card>
    </Stack>
  );

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            Resource Allocation Analysis
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant={viewMode === 'overview' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('overview')}
              startIcon={<AssessmentIcon />}
              size="small"
            >
              Overview
            </Button>
            <Button
              variant={viewMode === 'efficiency' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('efficiency')}
              startIcon={<SpeedIcon />}
              size="small"
            >
              Efficiency
            </Button>
            <Button
              variant={viewMode === 'distribution' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('distribution')}
              startIcon={<StorageIcon />}
              size="small"
            >
              Distribution
            </Button>
            <Button
              variant={viewMode === 'status' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('status')}
              startIcon={<WarningIcon />}
              size="small"
            >
              Status
            </Button>
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
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'efficiency' && renderEfficiencyAnalysis()}
        {viewMode === 'distribution' && renderDistributionView()}
        {viewMode === 'status' && renderStatusView()}
      </Box>

      {/* Status Bar */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            {resourceAnalysis.resources.length} resource types • {resourceAnalysis.totalResources} total resources • {Math.round(resourceAnalysis.overallEfficiency)}% allocation efficiency
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Click on optimization buttons to improve resource allocation
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ResourceAllocationView;