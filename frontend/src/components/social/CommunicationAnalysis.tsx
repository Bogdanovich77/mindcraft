import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Badge,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Refresh,
  Download,
  Settings,
  Message,
  Chat,
  Forum,
  Timeline,
  BarChart,
  ScatterPlot,
  AccountTree,
  ExpandMore,
  Person,
  Groups,
  TrendingUp,
  TrendingDown,
  VolumeUp,
  VolumeOff,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from 'recharts';
import type {
  SocialAgent,
  SocialRelationship,
  SocialInteraction,
  SocialVisualizationConfig,
} from '../../types/social';
import {
  InteractionType,
  InteractionOutcome,
} from '../../types/social';

interface CommunicationAnalysisProps {
  agents: SocialAgent[];
  relationships: SocialRelationship[];
  interactions: SocialInteraction[];
  config: SocialVisualizationConfig['communicationAnalysis'];
  onInteractionClick?: (interaction: SocialInteraction) => void;
  onAgentClick?: (agentId: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

interface CommunicationMetrics {
  totalInteractions: number;
  averageInteractionsPerAgent: number;
  mostActiveAgent: SocialAgent | null;
  mostCommunicativePair: { agent1: SocialAgent; agent2: SocialAgent; count: number } | null;
  interactionDistribution: { [key: string]: number };
  outcomeDistribution: { [key: string]: number };
  communicationFrequency: number;
  responseRate: number;
  sentimentScore: number;
  networkDensity: number;
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
    id={`communication-tabpanel-${index}`}
    aria-labelledby={`communication-tab-${index}`}
  >
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const INTERACTION_COLORS: Record<InteractionType, string> = {
  [InteractionType.CONVERSATION]: '#2196f3',
  [InteractionType.COLLABORATION]: '#4caf50',
  [InteractionType.TRADE]: '#ff9800',
  [InteractionType.CONFLICT]: '#f44336',
  [InteractionType.TEACHING]: '#9c27b0',
  [InteractionType.LEARNING]: '#00bcd4',
  [InteractionType.SUPPORT]: '#795548',
  [InteractionType.PLAY]: '#607d8b',
  [InteractionType.COMPETITION]: '#e91e63',
  [InteractionType.CELEBRATION]: '#ffc107',
  [InteractionType.HELP]: '#9e9e9e',
  [InteractionType.OBSERVATION]: '#3f51b5',
  [InteractionType.GIFT]: '#ff5722',
  [InteractionType.REQUEST]: '#795548',
};

const OUTCOME_COLORS = {
  [InteractionOutcome.POSITIVE]: '#4caf50',
  [InteractionOutcome.NEUTRAL]: '#ff9800',
  [InteractionOutcome.NEGATIVE]: '#f44336',
  [InteractionOutcome.MIXED]: '#9c27b0',
};

const CommunicationAnalysis: React.FC<CommunicationAnalysisProps> = React.memo(({
  agents,
  relationships,
  interactions,
  config,
  onInteractionClick,
  onAgentClick,
  width = 800,
  height = 600,
  className,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<SocialInteraction | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<SocialAgent | null>(null);
  const [timeRange, setTimeRange] = useState(typeof config.timeRange === 'number' ? config.timeRange : 7);
  const [showOutcomes, setShowOutcomes] = useState(config.showOutcomes);
  const [tabValue, setTabValue] = useState(0);
  const [minInteractionThreshold, setMinInteractionThreshold] = useState(1);

  // Process communication data
  const processedData = useMemo(() => {
    // Filter interactions by time range
    const now = Date.now();
    const timeRangeMs = (typeof timeRange === 'number' ? timeRange : 7) * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    const filteredInteractions = interactions.filter(interaction => 
      now - interaction.timestamp <= timeRangeMs
    );

    // Calculate interaction distribution by type
    const interactionDistribution = filteredInteractions.reduce((acc, interaction) => {
      acc[interaction.type] = (acc[interaction.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Calculate outcome distribution
    const outcomeDistribution = filteredInteractions.reduce((acc, interaction) => {
      acc[interaction.outcome] = (acc[interaction.outcome] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Create pie chart data for interaction types
    const interactionPieData = Object.entries(interactionDistribution).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: INTERACTION_COLORS[type as InteractionType] || '#999',
    }));

    // Create pie chart data for outcomes
    const outcomePieData = Object.entries(outcomeDistribution).map(([outcome, count]) => ({
      name: outcome.charAt(0).toUpperCase() + outcome.slice(1),
      value: count,
      color: OUTCOME_COLORS[outcome as InteractionOutcome] || '#999',
    }));

    // Calculate agent interaction counts
    const agentInteractionCounts = agents.reduce((acc, agent) => {
      const count = filteredInteractions.filter(interaction => 
        interaction.participants.includes(agent.id)
      ).length;
      acc[agent.id] = count;
      return acc;
    }, {} as { [key: string]: number });

    // Find most active agent
    const mostActiveAgent = agents.reduce((mostActive, agent) => {
      const count = agentInteractionCounts[agent.id] || 0;
      const mostActiveCount = agentInteractionCounts[mostActive?.id || ''] || 0;
      return count > mostActiveCount ? agent : mostActive;
    }, null as SocialAgent | null);

    // Calculate pair interaction counts
    const pairCounts: { [key: string]: number } = {};
    filteredInteractions.forEach(interaction => {
      if (interaction.participants.length === 2) {
        const [id1, id2] = interaction.participants.sort();
        const pairKey = `${id1}-${id2}`;
        pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
      }
    });

    // Find most communicative pair
    let mostCommunicativePair: { agent1: SocialAgent; agent2: SocialAgent; count: number } | null = null;
    let maxPairCount = 0;

    Object.entries(pairCounts).forEach(([pairKey, count]) => {
      if (count > maxPairCount) {
        const [id1, id2] = pairKey.split('-');
        const agent1 = agents.find(a => a.id === id1);
        const agent2 = agents.find(a => a.id === id2);
        if (agent1 && agent2) {
          mostCommunicativePair = { agent1, agent2, count };
          maxPairCount = count;
        }
      }
    });

    // Create time series data for interaction frequency
    const timeSeriesData = createTimeSeriesData(filteredInteractions, timeRange);

    // Create radar chart data for agent communication patterns
    const radarData = createRadarData(agents, filteredInteractions);

    // Calculate communication metrics
    const totalInteractions = filteredInteractions.length;
    const averageInteractionsPerAgent = agents.length > 0 ? totalInteractions / agents.length : 0;
    const communicationFrequency = calculateCommunicationFrequency(filteredInteractions, timeRange);
    const responseRate = calculateResponseRate(filteredInteractions);
    const sentimentScore = calculateSentimentScore(filteredInteractions);
    const networkDensity = calculateNetworkDensity(agents, filteredInteractions);

    return {
      interactions: filteredInteractions,
      interactionDistribution,
      outcomeDistribution,
      interactionPieData,
      outcomePieData,
      agentInteractionCounts,
      mostActiveAgent,
      mostCommunicativePair,
      timeSeriesData,
      radarData,
      totalInteractions,
      averageInteractionsPerAgent,
      communicationFrequency,
      responseRate,
      sentimentScore,
      networkDensity,
    };
  }, [agents, relationships, interactions, timeRange, minInteractionThreshold]);

  // Calculate metrics
  const metrics = useMemo<CommunicationMetrics>(() => ({
    totalInteractions: processedData.totalInteractions,
    averageInteractionsPerAgent: processedData.averageInteractionsPerAgent,
    mostActiveAgent: processedData.mostActiveAgent,
    mostCommunicativePair: processedData.mostCommunicativePair,
    interactionDistribution: processedData.interactionDistribution,
    outcomeDistribution: processedData.outcomeDistribution,
    communicationFrequency: processedData.communicationFrequency,
    responseRate: processedData.responseRate,
    sentimentScore: processedData.sentimentScore,
    networkDensity: processedData.networkDensity,
  }), [processedData]);

  // Create time series data
  function createTimeSeriesData(interactions: SocialInteraction[], days: number) {
    const data = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = now - (i + 1) * dayMs;
      const dayEnd = now - i * dayMs;
      
      const dayInteractions = interactions.filter(interaction => 
        interaction.timestamp >= dayStart && interaction.timestamp < dayEnd
      );

      data.push({
        date: new Date(dayStart).toLocaleDateString(),
        total: dayInteractions.length,
        positive: dayInteractions.filter(i => i.outcome === InteractionOutcome.POSITIVE).length,
        neutral: dayInteractions.filter(i => i.outcome === InteractionOutcome.NEUTRAL).length,
        negative: dayInteractions.filter(i => i.outcome === InteractionOutcome.NEGATIVE).length,
        mixed: dayInteractions.filter(i => i.outcome === InteractionOutcome.MIXED).length,
      });
    }

    return data;
  }

  // Create radar chart data
  function createRadarData(agents: SocialAgent[], interactions: SocialInteraction[]) {
    const interactionTypes = Object.values(InteractionType);
    return interactionTypes.map(type => {
      const count = interactions.filter(i => i.type === type).length;
      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
        fullMark: Math.max(...interactionTypes.map(t => 
          interactions.filter(i => i.type === t).length
        ), 10),
      };
    });
  }

  // Calculate communication frequency
  function calculateCommunicationFrequency(interactions: SocialInteraction[], days: number): number {
    if (days === 0) return 0;
    return interactions.length / days;
  }

  // Calculate response rate (simplified)
  function calculateResponseRate(interactions: SocialInteraction[]): number {
    const conversationInteractions = interactions.filter(i => 
      i.type === InteractionType.CONVERSATION
    );
    if (conversationInteractions.length === 0) return 0;
    
    // This is a simplified calculation - in a real system, you'd track actual responses
    return Math.min(0.8, conversationInteractions.length / (conversationInteractions.length + 10));
  }

  // Calculate sentiment score (simplified)
  function calculateSentimentScore(interactions: SocialInteraction[]): number {
    if (interactions.length === 0) return 0.5;
    
    const positiveCount = interactions.filter(i => i.outcome === InteractionOutcome.POSITIVE).length;
    const negativeCount = interactions.filter(i => i.outcome === InteractionOutcome.NEGATIVE).length;
    const neutralCount = interactions.filter(i => i.outcome === InteractionOutcome.NEUTRAL).length;
    const mixedCount = interactions.filter(i => i.outcome === InteractionOutcome.MIXED).length;
    
    const positiveScore = (positiveCount + mixedCount * 0.5) / interactions.length;
    const negativeScore = (negativeCount + mixedCount * 0.5) / interactions.length;
    
    return (positiveScore + (1 - negativeScore)) / 2;
  }

  // Calculate network density
  function calculateNetworkDensity(agents: SocialAgent[], interactions: SocialInteraction[]): number {
    if (agents.length < 2) return 0;
    
    const interactingAgents = new Set<string>();
    interactions.forEach(interaction => {
      interaction.participants.forEach(participant => {
        interactingAgents.add(participant);
      });
    });
    
    const actualConnections = interactingAgents.size;
    const possibleConnections = agents.length;
    
    return possibleConnections > 0 ? actualConnections / possibleConnections : 0;
  }

  // Control handlers
  const handleReset = () => {
    setSelectedInteraction(null);
    setSelectedAgent(null);
    setTimeRange(typeof config.timeRange === 'number' ? config.timeRange : 7);
    setShowOutcomes(config.showOutcomes);
    setMinInteractionThreshold(1);
    setTabValue(0);
  };

  const handleExport = () => {
    const data = {
      metrics,
      interactions: processedData.interactions,
      timeSeriesData: processedData.timeSeriesData,
      radarData: processedData.radarData,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'communication-analysis-data.json';
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
        <Typography variant="h6">Communication Analysis</Typography>
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
        <Chip label={`Interactions: ${metrics.totalInteractions}`} size="small" />
        <Chip label={`Avg/Agent: ${metrics.averageInteractionsPerAgent.toFixed(1)}`} size="small" />
        <Chip label={`Frequency: ${metrics.communicationFrequency.toFixed(1)}/day`} size="small" />
        <Chip label={`Response Rate: ${(metrics.responseRate * 100).toFixed(1)}%`} size="small" />
        <Chip label={`Sentiment: ${(metrics.sentimentScore * 100).toFixed(1)}%`} size="small" />
        <Chip label={`Network Density: ${(metrics.networkDensity * 100).toFixed(1)}%`} size="small" />
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
                  onChange={(e) => setTimeRange(e.target.value as number)}
                >
                  <MenuItem value={1}>Last 24 Hours</MenuItem>
                  <MenuItem value={7}>Last 7 Days</MenuItem>
                  <MenuItem value={30}>Last 30 Days</MenuItem>
                  <MenuItem value={90}>Last 90 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Typography variant="caption" display="block" gutterBottom>
                  Min Interactions: {minInteractionThreshold}
                </Typography>
                <Slider
                  value={minInteractionThreshold}
                  onChange={(_, value) => setMinInteractionThreshold(value as number)}
                  min={1}
                  max={50}
                  step={1}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showOutcomes}
                    onChange={(e) => setShowOutcomes(e.target.checked)}
                    size="small"
                  />
                }
                label="Show Outcomes"
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<Timeline />} label="Timeline" />
          <Tab icon={<BarChart />} label="Patterns" />
          <Tab icon={<ScatterPlot />} label="Network" />
          <Tab icon={<Forum />} label="Interactions" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* Timeline Chart */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Communication Timeline</Typography>
            <ResponsiveContainer width="100%" height={height - 100}>
              <AreaChart data={processedData.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area type="monotone" dataKey="positive" stackId="1" stroke="#4caf50" fill="#4caf50" />
                <Area type="monotone" dataKey="neutral" stackId="1" stroke="#ff9800" fill="#ff9800" />
                <Area type="monotone" dataKey="negative" stackId="1" stroke="#f44336" fill="#f44336" />
                <Area type="monotone" dataKey="mixed" stackId="1" stroke="#9c27b0" fill="#9c27b0" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          {/* Side Panel */}
          <Box sx={{ width: 280 }}>
            {/* Interaction Types */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  <Message sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Interaction Types
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={processedData.interactionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {processedData.interactionPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Agents */}
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  <Person sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Most Active
                </Typography>
                {metrics.mostActiveAgent && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {metrics.mostActiveAgent.id}
                    </Typography>
                    <Typography variant="body2">
                      Role: {metrics.mostActiveAgent.role}
                    </Typography>
                    <Typography variant="body2">
                      Interactions: {processedData.agentInteractionCounts[metrics.mostActiveAgent.id] || 0}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* Radar Chart */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Communication Patterns</Typography>
            <ResponsiveContainer width="100%" height={height - 100}>
              <RadarChart data={processedData.radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="type" />
                <PolarRadiusAxis />
                <Radar name="Count" dataKey="count" stroke="#2196f3" fill="#2196f3" fillOpacity={0.6} />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Box>

          {/* Side Panel */}
          <Box sx={{ width: 280 }}>
            {/* Outcome Distribution */}
            {showOutcomes && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    <TrendingUp sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    Outcomes
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={processedData.outcomePieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {processedData.outcomePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Communicative Pair */}
            {metrics.mostCommunicativePair && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    <Groups sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    Most Communicative Pair
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {metrics.mostCommunicativePair.agent1.id} ↔ {metrics.mostCommunicativePair.agent2.id}
                    </Typography>
                    <Typography variant="body2">
                      Interactions: {metrics.mostCommunicativePair.count}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* Network Analysis */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Agent Communication Network</Typography>
            <TableContainer sx={{ maxHeight: height - 100 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Agent</TableCell>
                    <TableCell>Interactions</TableCell>
                    <TableCell>Response Rate</TableCell>
                    <TableCell>Sentiment</TableCell>
                    <TableCell>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agents
                    .filter(agent => (processedData.agentInteractionCounts[agent.id] || 0) >= minInteractionThreshold)
                    .sort((a, b) => (processedData.agentInteractionCounts[b.id] || 0) - (processedData.agentInteractionCounts[a.id] || 0))
                    .map(agent => (
                      <TableRow 
                        key={agent.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedAgent(agent);
                          onAgentClick?.(agent.id);
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                              {agent.id.charAt(0).toUpperCase()}
                            </Avatar>
                            {agent.id}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Badge badgeContent={processedData.agentInteractionCounts[agent.id] || 0} color="primary">
                            <Message sx={{ fontSize: 16 }} />
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.random() * 100} // Placeholder - would calculate actual response rate
                            sx={{ width: 60 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {Math.random() > 0.5 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                            <Typography variant="body2">
                              {(Math.random() * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{agent.role}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Side Panel */}
          <Box sx={{ width: 280 }}>
            {/* Network Statistics */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  <AccountTree sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Network Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">
                    Total Interactions: {metrics.totalInteractions}
                  </Typography>
                  <Typography variant="body2">
                    Network Density: {(metrics.networkDensity * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">
                    Active Agents: {agents.filter(a => (processedData.agentInteractionCounts[a.id] || 0) >= minInteractionThreshold).length}
                  </Typography>
                  <Typography variant="body2">
                    Communication Frequency: {metrics.communicationFrequency.toFixed(1)}/day
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Selection Info */}
            {selectedAgent && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Agent Details</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {selectedAgent.id}
                    </Typography>
                    <Typography variant="body2">
                      Status: {selectedAgent.status}
                    </Typography>
                    <Typography variant="body2">
                      Role: {selectedAgent.role}
                    </Typography>
                    <Typography variant="body2">
                      Interactions: {processedData.agentInteractionCounts[selectedAgent.id] || 0}
                    </Typography>
                    <Typography variant="body2">
                      Reputation: {((selectedAgent.reputation || 0) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* Recent Interactions */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Recent Interactions</Typography>
            <Box sx={{ maxHeight: height - 100, overflow: 'auto' }}>
              {processedData.interactions
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 20)
                .map(interaction => (
                  <Card key={interaction.id} sx={{ mb: 1, cursor: 'pointer' }} onClick={() => {
                    setSelectedInteraction(interaction);
                    onInteractionClick?.(interaction);
                  }}>
                    <CardContent sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: INTERACTION_COLORS[interaction.type] }}>
                          <Chat />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {interaction.type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {interaction.participants.join(' ↔ ')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                          <Chip 
                            label={interaction.outcome}
                            size="small"
                            color={
                              interaction.outcome === InteractionOutcome.POSITIVE ? 'success' :
                              interaction.outcome === InteractionOutcome.NEGATIVE ? 'error' :
                              interaction.outcome === InteractionOutcome.MIXED ? 'secondary' : 'default'
                            }
                          />
                          <Typography variant="caption">
                            {new Date(interaction.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                      {interaction.content && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                          "{interaction.content}"
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </Box>
          </Box>

          {/* Side Panel */}
          <Box sx={{ width: 280 }}>
            {/* Interaction Statistics */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  <VolumeUp sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Activity Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">
                    Total: {metrics.totalInteractions}
                  </Typography>
                  <Typography variant="body2">
                    Positive: {metrics.outcomeDistribution[InteractionOutcome.POSITIVE] || 0}
                  </Typography>
                  <Typography variant="body2">
                    Neutral: {metrics.outcomeDistribution[InteractionOutcome.NEUTRAL] || 0}
                  </Typography>
                  <Typography variant="body2">
                    Negative: {metrics.outcomeDistribution[InteractionOutcome.NEGATIVE] || 0}
                  </Typography>
                  <Typography variant="body2">
                    Mixed: {metrics.outcomeDistribution[InteractionOutcome.MIXED] || 0}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Selection Info */}
            {selectedInteraction && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Interaction Details</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      Type: {selectedInteraction.type}
                    </Typography>
                    <Typography variant="body2">
                      Outcome: {selectedInteraction.outcome}
                    </Typography>
                    <Typography variant="body2">
                      Participants: {selectedInteraction.participants.join(', ')}
                    </Typography>
                    <Typography variant="body2">
                      Time: {new Date(selectedInteraction.timestamp).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Influence: {selectedInteraction.influenceDelta.toFixed(3)}
                    </Typography>
                    {selectedInteraction.content && (
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        "{selectedInteraction.content}"
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </TabPanel>
    </Paper>
  );
});

CommunicationAnalysis.displayName = 'CommunicationAnalysis';

export default CommunicationAnalysis;