import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import type { PerformanceMetricsProps } from '../../types/dashboard';

/**
 * PerformanceMetrics Component
 * 
 * Displays real-time performance metrics with interactive charts.
 * Supports multiple chart types, time ranges, and data export.
 * Optimized for sub-100ms response times.
 */
const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  data,
  timeRange = '1h',
  chartType = 'line',
  onTimeRangeChange,
  onChartTypeChange,
  onRefresh,
  loading = false,
  className,
}) => {
  const theme = useTheme();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['responseTime', 'cpuUsage', 'memoryUsage']);

  // Filter and format data based on time range
  const formattedData = useMemo(() => {
    if (!data || !data.metrics || !data.metrics.responseTime) return [];

    const now = Date.now();
    let cutoffTime: number;

    switch (timeRange) {
      case '1h':
        cutoffTime = now - 60 * 60 * 1000;
        break;
      case '6h':
        cutoffTime = now - 6 * 60 * 60 * 1000;
        break;
      case '24h':
        cutoffTime = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        cutoffTime = now - 60 * 60 * 1000;
    }

    // Transform the data structure to match what the chart expects
    const transformedData = data.metrics.responseTime.timestamps.map((timestamp, index) => ({
      timestamp,
      responseTime: data.metrics.responseTime.values[index],
      cpuUsage: data.metrics.cpuUsage?.values[index] || 0,
      memoryUsage: data.metrics.memoryUsage?.values[index] || 0,
      successRate: data.metrics.successRate?.values[index] || 0,
    }));

    return transformedData
      .filter(item => item.timestamp >= cutoffTime)
      .sort((a, b) => a.timestamp - b.timestamp) // Sort by original timestamp
      .map(item => ({
        ...item,
        timestamp: new Date(item.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        formattedTime: new Date(item.timestamp).toLocaleTimeString(),
      }));
  }, [data, timeRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (formattedData.length === 0) return null;

    const latest = formattedData[formattedData.length - 1];
    const values = formattedData.map(d => d.responseTime);
    
    return {
      current: latest.responseTime,
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      trend: values.length > 1 ? 
        (values[values.length - 1] - values[0]) / values[0] : 0,
    };
  }, [formattedData]);

  // Handle metric selection
  const handleMetricChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMetrics: string[],
  ) => {
    if (newMetrics.length) {
      setSelectedMetrics(newMetrics);
    }
  };

  // Export data as CSV
  const handleExport = () => {
    if (!formattedData.length) return;

    const headers = ['Timestamp', 'Response Time', 'CPU Usage', 'Memory Usage', 'Success Rate'];
    const csvContent = [
      headers.join(','),
      ...formattedData.map(row => [
        row.timestamp,
        row.responseTime,
        row.cpuUsage,
        row.memoryUsage,
        row.successRate,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render chart based on type
  const renderChart = () => {
    if (formattedData.length === 0) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height={300}
          color="text.secondary"
        >
          <TimelineIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="body1">
            No performance data available
          </Typography>
        </Box>
      );
    }

    const commonProps = {
      data: formattedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                stroke={theme.palette.text.secondary}
              />
              <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
              <ChartTooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              />
              <Legend />
              {selectedMetrics.includes('responseTime') && (
                <Bar
                  dataKey="responseTime"
                  fill={theme.palette.primary.main}
                  name="Response Time (ms)"
                  radius={[4, 4, 0, 0]}
                />
              )}
              {selectedMetrics.includes('cpuUsage') && (
                <Bar
                  dataKey="cpuUsage"
                  fill={theme.palette.warning.main}
                  name="CPU Usage (%)"
                  radius={[4, 4, 0, 0]}
                />
              )}
              {selectedMetrics.includes('memoryUsage') && (
                <Bar
                  dataKey="memoryUsage"
                  fill={theme.palette.info.main}
                  name="Memory Usage (MB)"
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                stroke={theme.palette.text.secondary}
              />
              <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
              <ChartTooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              />
              <Legend />
              {selectedMetrics.includes('responseTime') && (
                <Area
                  type="monotone"
                  dataKey="responseTime"
                  stroke={theme.palette.primary.main}
                  fill={alpha(theme.palette.primary.main, 0.3)}
                  name="Response Time (ms)"
                />
              )}
              {selectedMetrics.includes('cpuUsage') && (
                <Area
                  type="monotone"
                  dataKey="cpuUsage"
                  stroke={theme.palette.warning.main}
                  fill={alpha(theme.palette.warning.main, 0.3)}
                  name="CPU Usage (%)"
                />
              )}
              {selectedMetrics.includes('memoryUsage') && (
                <Area
                  type="monotone"
                  dataKey="memoryUsage"
                  stroke={theme.palette.info.main}
                  fill={alpha(theme.palette.info.main, 0.3)}
                  name="Memory Usage (MB)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                stroke={theme.palette.text.secondary}
              />
              <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
              <ChartTooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              />
              <Legend />
              {selectedMetrics.includes('responseTime') && (
                <Line
                  type="monotone"
                  dataKey="responseTime"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={false}
                  name="Response Time (ms)"
                />
              )}
              {selectedMetrics.includes('cpuUsage') && (
                <Line
                  type="monotone"
                  dataKey="cpuUsage"
                  stroke={theme.palette.warning.main}
                  strokeWidth={2}
                  dot={false}
                  name="CPU Usage (%)"
                />
              )}
              {selectedMetrics.includes('memoryUsage') && (
                <Line
                  type="monotone"
                  dataKey="memoryUsage"
                  stroke={theme.palette.info.main}
                  strokeWidth={2}
                  dot={false}
                  name="Memory Usage (MB)"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className={className}>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6" component="div">
            Performance Metrics
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Export Data">
              <IconButton size="small" onClick={handleExport}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={onRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Statistics */}
        {statistics && (
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={2} mb={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">
                {statistics.current}ms
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Current
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" color="text.secondary">
                {Math.round(statistics.average)}ms
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Average
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main">
                {statistics.min}ms
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Min
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" color="error.main">
                {statistics.max}ms
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Max
              </Typography>
            </Box>
          </Box>
        )}

        {/* Controls */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          {/* Time Range Selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={timeRange}
              onChange={(e) => onTimeRangeChange?.(e.target.value as any)}
              displayEmpty
            >
              <MenuItem value="1h">Last hour</MenuItem>
              <MenuItem value="6h">Last 6 hours</MenuItem>
              <MenuItem value="24h">Last 24 hours</MenuItem>
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
            </Select>
          </FormControl>

          {/* Chart Type Selector */}
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(_, value) => value && onChartTypeChange?.(value)}
            size="small"
          >
            <ToggleButton value="line">
              <LineChartIcon />
            </ToggleButton>
            <ToggleButton value="bar">
              <BarChartIcon />
            </ToggleButton>
            <ToggleButton value="area">
              <TimelineIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Metric Selection */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Display Metrics
          </Typography>
          <ToggleButtonGroup
            value={selectedMetrics}
            onChange={handleMetricChange}
            size="small"
          >
            <ToggleButton value="responseTime">Response Time</ToggleButton>
            <ToggleButton value="cpuUsage">CPU Usage</ToggleButton>
            <ToggleButton value="memoryUsage">Memory Usage</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Chart */}
        <Box
          sx={{
            height: 300,
            position: 'relative',
            '& .recharts-tooltip-wrapper': {
              outline: 'none',
            },
          }}
        >
          {renderChart()}
        </Box>

        {/* Footer */}
        {statistics && (
          <Box mt={2} pt={2} borderTop={`1px solid ${theme.palette.divider}`}>
            <Typography variant="caption" color="text.secondary">
              Trend: {statistics.trend > 0 ? '+' : ''}{(statistics.trend * 100).toFixed(1)}% • 
              Data points: {formattedData.length} • 
              Last updated: {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(PerformanceMetrics);