import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Person as PersonIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import type { AgentStatusIndicatorProps } from '../../types/dashboard';

/**
 * AgentStatusIndicator Component
 * 
 * Displays comprehensive agent status information including health,
 * cognitive load, performance metrics, and activity state.
 * Supports both compact and detailed views.
 */
const AgentStatusIndicator: React.FC<AgentStatusIndicatorProps> = ({
  agent,
  metrics,
  selected,
  onSelect,
  compact = false,
  showDetails = true,
  className,
}) => {
  const theme = useTheme();

  // Calculate status color and icon based on health status
  const statusConfig = useMemo(() => {
    switch (metrics.health.healthStatus) {
      case 'optimal':
        return {
          color: theme.palette.success.main,
          backgroundColor: alpha(theme.palette.success.main, 0.1),
          icon: <CheckCircleIcon />,
          label: 'Optimal',
        };
      case 'normal':
        return {
          color: theme.palette.info.main,
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          icon: <InfoIcon />,
          label: 'Normal',
        };
      case 'warning':
        return {
          color: theme.palette.warning.main,
          backgroundColor: alpha(theme.palette.warning.main, 0.1),
          icon: <WarningIcon />,
          label: 'Warning',
        };
      case 'critical':
        return {
          color: theme.palette.error.main,
          backgroundColor: alpha(theme.palette.error.main, 0.1),
          icon: <ErrorIcon />,
          label: 'Critical',
        };
      default:
        return {
          color: theme.palette.grey[500],
          backgroundColor: alpha(theme.palette.grey[500], 0.1),
          icon: <InfoIcon />,
          label: 'Unknown',
        };
    }
  }, [metrics.health.healthStatus, theme]);

  // Format activity duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Get cognitive load color
  const getCognitiveLoadColor = (load: number) => {
    if (load < 0.5) return theme.palette.success.main;
    if (load < 0.75) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Get performance color
  const getPerformanceColor = (responseTime: number) => {
    if (responseTime < 100) return theme.palette.success.main;
    if (responseTime < 500) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Compact view
  if (compact) {
    return (
      <Card
        className={className}
        onClick={() => onSelect(agent.id)}
        sx={{
          cursor: 'pointer',
          border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
          backgroundColor: selected ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box display="flex" alignItems="center" gap={2}>
            {/* Avatar */}
            <Avatar
              sx={{
                bgcolor: statusConfig.backgroundColor,
                color: statusConfig.color,
                width: 40,
                height: 40,
              }}
            >
              <PersonIcon />
            </Avatar>

            {/* Agent Info */}
            <Box flex={1} minWidth={0}>
              <Typography variant="subtitle2" noWrap>
                {agent.id}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Chip
                  size="small"
                  label={statusConfig.label}
                  sx={{
                    backgroundColor: statusConfig.backgroundColor,
                    color: statusConfig.color,
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {metrics.activity.currentAction}
                </Typography>
              </Box>
            </Box>

            {/* Metrics */}
            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <SpeedIcon sx={{ fontSize: 16, color: getCognitiveLoadColor(metrics.cognitiveLoad.current) }} />
                <Typography variant="caption" sx={{ color: getCognitiveLoadColor(metrics.cognitiveLoad.current) }}>
                  {Math.round(metrics.cognitiveLoad.current * 100)}%
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <MemoryIcon sx={{ fontSize: 16, color: getPerformanceColor(metrics.performance.responseTime) }} />
                <Typography variant="caption" sx={{ color: getPerformanceColor(metrics.performance.responseTime) }}>
                  {metrics.performance.responseTime}ms
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Detailed view
  return (
    <Card
      className={className}
      onClick={() => onSelect(agent.id)}
      sx={{
        cursor: 'pointer',
        border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
        backgroundColor: selected ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: statusConfig.backgroundColor,
                color: statusConfig.color,
                width: 48,
                height: 48,
              }}
            >
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {agent.id}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Chip
                  size="small"
                  icon={statusConfig.icon}
                  label={statusConfig.label}
                  sx={{
                    backgroundColor: statusConfig.backgroundColor,
                    color: statusConfig.color,
                    fontWeight: 'bold',
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  Health Score: {metrics.health.healthScore}/100
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Tooltip title="Refresh Agent Data">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                // Handle refresh if needed
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Current Activity */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Current Activity
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {metrics.activity.currentAction}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDuration(metrics.activity.actionDuration)} • {Math.round(metrics.activity.actionProgress * 100)}%
            </Typography>
          </Box>
        </Box>

        {/* Metrics Grid */}
        {showDetails && (
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            {/* Cognitive Load */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Cognitive Load
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: getCognitiveLoadColor(metrics.cognitiveLoad.current),
                  }}
                />
                <Typography variant="body2">
                  {Math.round(metrics.cognitiveLoad.current * 100)}%
                </Typography>
                <Chip
                  size="small"
                  label={metrics.cognitiveLoad.trend}
                  sx={{
                    backgroundColor: alpha(getCognitiveLoadColor(metrics.cognitiveLoad.current), 0.1),
                    color: getCognitiveLoadColor(metrics.cognitiveLoad.current),
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              </Box>
            </Box>

            {/* Performance */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Performance
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: getPerformanceColor(metrics.performance.responseTime),
                  }}
                />
                <Typography variant="body2">
                  {metrics.performance.responseTime}ms
                </Typography>
                <Chip
                  size="small"
                  label={`${Math.round(metrics.performance.successRate * 100)}%`}
                  sx={{
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              </Box>
            </Box>

            {/* Memory Usage */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Memory Usage
              </Typography>
              <Typography variant="body2">
                {metrics.performance.memoryUsage}MB
              </Typography>
              <Typography variant="caption" color="text.secondary">
                CPU: {metrics.performance.cpuUsage}%
              </Typography>
            </Box>

            {/* Resources */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Resources
              </Typography>
              <Typography variant="body2">
                Energy: {Math.round(metrics.health.energyLevel * 100)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Resources: {Math.round(metrics.health.resourceLevel * 100)}%
              </Typography>
            </Box>
          </Box>
        )}

        {/* Progress Bar */}
        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              Goal Progress
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(metrics.activity.goalProgress * 100)}%
            </Typography>
          </Box>
          <Box
            sx={{
              height: 4,
              backgroundColor: theme.palette.grey[200],
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${metrics.activity.goalProgress * 100}%`,
                backgroundColor: theme.palette.primary.main,
                transition: 'width 0.3s ease-in-out',
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(AgentStatusIndicator);