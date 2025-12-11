import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Refresh,
  Download,
  Settings,
  TrendingUp,
  TrendingDown,
  Star,
  Warning,
  CheckCircle,
  Timeline,
  BarChart,
  PieChart,
} from '@mui/icons-material';
import * as d3 from 'd3';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import type {
  SocialAgent,
  SocialRelationship,
  ReputationSystem,
  ReputationEvent,
  ReputationTrend,
  SocialVisualizationConfig,
} from '../../types/social';

interface ReputationVisualizationProps {
  agents: SocialAgent[];
  relationships: SocialRelationship[];
  reputationSystem: ReputationSystem;
  config: SocialVisualizationConfig['reputation'];
  onAgentClick?: (agentId: string) => void;
  onEventClick?: (event: ReputationEvent) => void;
  width?: number;
  height?: number;
  className?: string;
}

interface ReputationMetrics {
  totalAgents: number;
  averageReputation: number;
  reputationDistribution: { excellent: number; good: number; average: number; poor: number; terrible: number };
  topReputationAgents: string[];
  lowestReputationAgents: string[];
  reputationVolatility: number;
  recentEvents: ReputationEvent[];
  trendDirection: 'improving' | 'declining' | 'stable';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`reputation-tabpanel-${index}`}
    aria-labelledby={`reputation-tab-${index}`}
  >
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const COLORS = ['#4caf50', '#8bc34a', '#ffeb3b', '#ff9800', '#f44336'];

const ReputationVisualization: React.FC<ReputationVisualizationProps> = React.memo(({
  agents,
  relationships,
  reputationSystem,
  config,
  onAgentClick,
  onEventClick,
  width = 800,
  height = 600,
  className,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<SocialAgent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ReputationEvent | null>(null);
  const [reputationThreshold, setReputationThreshold] = useState(config.threshold || 0.5);
  const [showTrends, setShowTrends] = useState(config.trendsEnabled ?? true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [tabValue, setTabValue] = useState(0);

  // Process reputation data for visualization
  const processedData = useMemo(() => {
    // Filter agents based on reputation threshold
    const filteredAgents = agents.filter(agent =>
      agent.reputationDetails && agent.reputationDetails.score >= reputationThreshold
    );

    // Create reputation distribution data
    const reputationDistribution = filteredAgents.reduce((acc, agent) => {
      if (!agent.reputationDetails) return acc;
      
      const score = agent.reputationDetails.score;
      if (score >= 0.8) acc.excellent++;
      else if (score >= 0.6) acc.good++;
      else if (score >= 0.4) acc.average++;
      else if (score >= 0.2) acc.poor++;
      else acc.terrible++;
      
      return acc;
    }, { excellent: 0, good: 0, average: 0, poor: 0, terrible: 0 });

    // Create pie chart data
    const pieData = [
      { name: 'Excellent (80-100%)', value: reputationDistribution.excellent, color: COLORS[0] },
      { name: 'Good (60-80%)', value: reputationDistribution.good, color: COLORS[1] },
      { name: 'Average (40-60%)', value: reputationDistribution.average, color: COLORS[2] },
      { name: 'Poor (20-40%)', value: reputationDistribution.poor, color: COLORS[3] },
      { name: 'Terrible (0-20%)', value: reputationDistribution.terrible, color: COLORS[4] },
    ].filter(item => item.value > 0);

    // Create bar chart data for top agents
    const topAgents = filteredAgents
      .filter(agent => agent.reputationDetails)
      .sort((a, b) => (b.reputationDetails?.score || 0) - (a.reputationDetails?.score || 0))
      .slice(0, 10)
      .map(agent => ({
        name: agent.id,
        reputation: (agent.reputationDetails?.score || 0) * 100,
        trust: (agent.reputationDetails?.trustworthiness || 0) * 100,
        reliability: (agent.reputationDetails?.reliability || 0) * 100,
        influence: (agent.reputationDetails?.influence || 0) * 100,
      }));

    // Process trend data
    const now = Date.now();
    let timeLimit = now;
    switch (timeRange) {
      case 'day': timeLimit = now - 24 * 60 * 60 * 1000; break;
      case 'week': timeLimit = now - 7 * 24 * 60 * 60 * 1000; break;
      case 'month': timeLimit = now - 30 * 24 * 60 * 60 * 1000; break;
      case 'all': timeLimit = 0; break;
    }

    const recentEvents = reputationSystem.events.filter(event => 
      event.timestamp >= timeLimit
    );

    // Create trend line data
    const trendData = recentEvents.reduce((acc, event) => {
      const date = new Date(event.timestamp).toLocaleDateString();
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing.avgReputation = (existing.avgReputation + event.newReputation) / 2;
        existing.eventCount++;
      } else {
        acc.push({
          date,
          avgReputation: event.newReputation,
          eventCount: 1,
        });
      }
      
      return acc;
    }, [] as { date: string; avgReputation: number; eventCount: number }[]);

    return {
      agents: filteredAgents,
      reputationDistribution,
      pieData,
      topAgents,
      recentEvents,
      trendData,
    };
  }, [agents, reputationThreshold, reputationSystem, timeRange]);

  // Calculate reputation metrics
  const metrics = useMemo<ReputationMetrics>(() => {
    const agentReputations = processedData.agents
      .filter(agent => agent.reputationDetails)
      .map(agent => agent.reputationDetails!.score);

    if (agentReputations.length === 0) {
      return {
        totalAgents: 0,
        averageReputation: 0,
        reputationDistribution: { excellent: 0, good: 0, average: 0, poor: 0, terrible: 0 },
        topReputationAgents: [],
        lowestReputationAgents: [],
        reputationVolatility: 0,
        recentEvents: [],
        trendDirection: 'stable'
      };
    }

    const averageReputation = agentReputations.reduce((sum, score) => sum + score, 0) / agentReputations.length;
    
    const topAgents = processedData.agents
      .filter(agent => agent.reputationDetails)
      .sort((a, b) => (b.reputationDetails?.score || 0) - (a.reputationDetails?.score || 0))
      .slice(0, 5)
      .map(agent => agent.id);

    const lowestAgents = processedData.agents
      .filter(agent => agent.reputationDetails)
      .sort((a, b) => (a.reputationDetails?.score || 0) - (b.reputationDetails?.score || 0))
      .slice(0, 5)
      .map(agent => agent.id);

    // Calculate volatility (standard deviation)
    const variance = agentReputations.reduce((sum, score) => {
      return sum + Math.pow(score - averageReputation, 2);
    }, 0) / agentReputations.length;
    const volatility = Math.sqrt(variance);

    // Determine trend direction
    let trendDirection: 'improving' | 'declining' | 'stable' = 'stable';
    if (processedData.trendData.length >= 2) {
      const recent = processedData.trendData.slice(-3);
      const older = processedData.trendData.slice(0, 3);
      const recentAvg = recent.reduce((sum, item) => sum + item.avgReputation, 0) / recent.length;
      const olderAvg = older.reduce((sum, item) => sum + item.avgReputation, 0) / older.length;
      
      if (recentAvg > olderAvg + 0.05) trendDirection = 'improving';
      else if (recentAvg < olderAvg - 0.05) trendDirection = 'declining';
    }

    return {
      totalAgents: processedData.agents.length,
      averageReputation,
      reputationDistribution: processedData.reputationDistribution,
      topReputationAgents: topAgents,
      lowestReputationAgents: lowestAgents,
      reputationVolatility: volatility,
      recentEvents: processedData.recentEvents.slice(0, 10),
      trendDirection
    };
  }, [processedData]);

  // D3 reputation heatmap visualization
  useEffect(() => {
    if (!svgRef.current || tabValue !== 2) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create container group
    const container = svg.append('g');

    // Create heatmap grid based on agent positions
    const gridSize = 40;
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(height / gridSize);

    // Create color scale for reputation
    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([0, 1]);

    // Group agents by grid cells
    const gridData = new Map<string, SocialAgent[]>();
    processedData.agents.forEach(agent => {
      if (!agent.position) return;
      
      const gridX = Math.floor((agent.position.x || 0) / gridSize);
      const gridY = Math.floor((agent.position.y || 0) / gridSize);
      const key = `${gridX},${gridY}`;
      
      if (!gridData.has(key)) gridData.set(key, []);
      gridData.get(key)!.push(agent);
    });

    // Draw heatmap cells
    gridData.forEach((agentsInCell, key) => {
      const [gridX, gridY] = key.split(',').map(Number);
      const x = gridX * gridSize;
      const y = gridY * gridSize;
      
      // Calculate average reputation for this cell
      const avgReputation = agentsInCell.reduce((sum, agent) =>
        sum + (agent.reputationDetails?.score || 0), 0) / agentsInCell.length;
      
      container.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', gridSize)
        .attr('height', gridSize)
        .attr('fill', colorScale(avgReputation))
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.8)
        .style('cursor', 'pointer')
        .on('click', () => {
          if (agentsInCell.length > 0) {
            setSelectedAgent(agentsInCell[0]);
            onAgentClick?.(agentsInCell[0].id);
          }
        })
        .on('mouseover', function(event) {
          d3.select(this).attr('opacity', 1);
          // Show tooltip
          const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.8)')
            .style('color', 'white')
            .style('padding', '5px')
            .style('border-radius', '3px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .html(`Agents: ${agentsInCell.length}<br/>Avg Reputation: ${(avgReputation * 100).toFixed(1)}%`);
          
          tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 0.8);
          d3.selectAll('.tooltip').remove();
        });
    });

  }, [processedData, tabValue, width, height, onAgentClick]);

  // Control handlers
  const handleReset = () => {
    setSelectedAgent(null);
    setSelectedEvent(null);
    setReputationThreshold(config.threshold);
    setShowTrends(config.trendsEnabled);
    setTimeRange('week');
    setTabValue(0);
  };

  const handleExport = () => {
    const data = {
      metrics,
      agents: processedData.agents.map(agent => ({
        id: agent.id,
        reputation: agent.reputation,
        status: agent.status,
        role: agent.role
      })),
      events: processedData.recentEvents,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reputation-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Paper className={className} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Reputation System</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Reset">
            <IconButton onClick={handleReset} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export">
            <IconButton onClick={handleExport} size="small">
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton onClick={() => setShowSettings(!showSettings)} size="small">
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Metrics */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip label={`Agents: ${metrics.totalAgents}`} size="small" />
        <Chip label={`Avg Reputation: ${(metrics.averageReputation * 100).toFixed(1)}%`} size="small" />
        <Chip label={`Volatility: ${(metrics.reputationVolatility * 100).toFixed(1)}%`} size="small" />
        <Chip 
          label={`Trend: ${metrics.trendDirection}`} 
          size="small" 
          color={metrics.trendDirection === 'improving' ? 'success' : metrics.trendDirection === 'declining' ? 'error' : 'default'}
        />
        <Chip label={`Recent Events: ${metrics.recentEvents.length}`} size="small" />
      </Box>

      {/* Settings Panel */}
      {showSettings && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  label="Time Range"
                  onChange={(e) => setTimeRange(e.target.value as any)}
                >
                  <MenuItem value="day">Last 24 Hours</MenuItem>
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Typography variant="caption" display="block" gutterBottom>
                  Reputation Threshold: {reputationThreshold.toFixed(2)}
                </Typography>
                <Slider
                  value={reputationThreshold}
                  onChange={(_, value) => setReputationThreshold(value as number)}
                  min={0}
                  max={1}
                  step={0.01}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showTrends}
                    onChange={(e) => setShowTrends(e.target.checked)}
                    size="small"
                  />
                }
                label="Show Trends"
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<BarChart />} label="Overview" />
          <Tab icon={<PieChart />} label="Distribution" />
          <Tab icon={<Timeline />} label="Trends" />
          <Tab icon={<Star />} label="Events" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* Bar Chart */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Top Agents by Reputation</Typography>
            <ResponsiveContainer width="100%" height={height - 100}>
              <RechartsBarChart data={processedData.topAgents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="reputation" fill="#4caf50" name="Reputation %" />
                <Bar dataKey="trust" fill="#2196f3" name="Trustworthiness %" />
                <Bar dataKey="reliability" fill="#ff9800" name="Reliability %" />
                <Bar dataKey="influence" fill="#9c27b0" name="Influence %" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* Pie Chart */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Reputation Distribution</Typography>
            <ResponsiveContainer width="100%" height={height - 100}>
              <RechartsPieChart>
                <Pie
                  data={processedData.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {processedData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </Box>

          {/* Distribution Stats */}
          <Box sx={{ width: 280 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>Distribution Breakdown</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: COLORS[0] }}>Excellent</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {metrics.reputationDistribution.excellent}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(metrics.reputationDistribution.excellent / metrics.totalAgents) * 100}
                      sx={{ bgcolor: 'grey.300' }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: COLORS[1] }}>Good</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {metrics.reputationDistribution.good}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(metrics.reputationDistribution.good / metrics.totalAgents) * 100}
                      sx={{ bgcolor: 'grey.300' }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: COLORS[2] }}>Average</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {metrics.reputationDistribution.average}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(metrics.reputationDistribution.average / metrics.totalAgents) * 100}
                      sx={{ bgcolor: 'grey.300' }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: COLORS[3] }}>Poor</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {metrics.reputationDistribution.poor}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(metrics.reputationDistribution.poor / metrics.totalAgents) * 100}
                      sx={{ bgcolor: 'grey.300' }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: COLORS[4] }}>Terrible</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {metrics.reputationDistribution.terrible}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(metrics.reputationDistribution.terrible / metrics.totalAgents) * 100}
                      sx={{ bgcolor: 'grey.300' }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* Trend Chart */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Reputation Trends Over Time</Typography>
            <ResponsiveContainer width="100%" height={height - 100}>
              <AreaChart data={processedData.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} />
                <RechartsTooltip 
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Avg Reputation']}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgReputation" 
                  stroke="#4caf50" 
                  fill="#4caf50" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          {/* Heatmap */}
          <Box sx={{ width: 400 }}>
            <Typography variant="subtitle2" gutterBottom>Reputation Heatmap</Typography>
            <svg
              ref={svgRef}
              width="100%"
              height={height - 100}
              style={{ border: '1px solid #ddd', borderRadius: 1 }}
            />
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* Events Table */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Recent Reputation Events</Typography>
            <TableContainer sx={{ height: height - 100, overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Agent</TableCell>
                    <TableCell>Event Type</TableCell>
                    <TableCell>Impact</TableCell>
                    <TableCell>New Reputation</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.recentEvents.map((event, index) => (
                    <TableRow
                      key={index}
                      hover
                      selected={selectedEvent?.id === event.id}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedEvent(event);
                        onEventClick?.(event);
                      }}
                    >
                      <TableCell>{event.agentId}</TableCell>
                      <TableCell>
                        <Chip
                          label={event.type}
                          size="small"
                          color={event.impact > 0 ? 'success' : event.impact < 0 ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {event.impact > 0 ? <TrendingUp color="success" /> : 
                           event.impact < 0 ? <TrendingDown color="error" /> : 
                           <Timeline />}
                          <Typography variant="body2">
                            {event.impact > 0 ? '+' : ''}{(event.impact * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {(event.newReputation * 100).toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(event.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Side Panel */}
          <Box sx={{ width: 280 }}>
            {/* Top Reputation Agents */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  <Star sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Top Reputation
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {metrics.topReputationAgents.slice(0, 3).map((agentId, index) => (
                    <Box key={agentId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {index + 1}
                      </Avatar>
                      <Typography variant="body2">{agentId}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Selection Info */}
            {(selectedAgent || selectedEvent) && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Selection Details</Typography>
                  {selectedAgent && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Agent: {selectedAgent.id}
                      </Typography>
                      <Typography variant="body2">
                        Reputation: {((selectedAgent.reputationDetails?.score || 0) * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">
                        Trustworthiness: {((selectedAgent.reputationDetails?.trustworthiness || 0) * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">
                        Reliability: {((selectedAgent.reputationDetails?.reliability || 0) * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">
                        Influence: {((selectedAgent.reputationDetails?.influence || 0) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  )}
                  {selectedEvent && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Event: {selectedEvent.type}
                      </Typography>
                      <Typography variant="body2">
                        Agent: {selectedEvent.agentId}
                      </Typography>
                      <Typography variant="body2">
                        Impact: {selectedEvent.impact > 0 ? '+' : ''}{(selectedEvent.impact * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">
                        New Reputation: {(selectedEvent.newReputation * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">
                        Reason: {selectedEvent.reason}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </TabPanel>
    </Paper>
  );
});

ReputationVisualization.displayName = 'ReputationVisualization';

export default ReputationVisualization;