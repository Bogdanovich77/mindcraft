import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
  Tooltip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
// Using native Date methods instead of date-fns
const formatDate = (date: Date, formatStr: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
};

const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return options?.addSuffix ? 'just now' : 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return options?.addSuffix ? `${diffInMinutes} minutes ago` : `${diffInMinutes} minutes`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return options?.addSuffix ? `${diffInHours} hours ago` : `${diffInHours} hours`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return options?.addSuffix ? `${diffInDays} days ago` : `${diffInDays} days`;
};

const subDays = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - amount);
  return result;
};
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { socialActions } from '../../store/slices/socialSlice';
import type {
  SocialInteraction,
  SocialAgent,
  SocialVisualizationConfig
} from '../../types/social';
import {
  InteractionType,
  InteractionOutcome
} from '../../types/social';

interface SocialInteractionTimelineProps {
  agentId?: string;
  config?: SocialVisualizationConfig['communicationAnalysis'];
  height?: number;
}

interface TimelineFilters {
  type: InteractionType | 'all';
  outcome: InteractionOutcome | 'all';
  dateRange: 'day' | 'week' | 'month' | 'all';
  participants: string[];
}

interface TimelineEvent {
  id: string;
  timestamp: number;
  interaction: SocialInteraction;
  type: 'interaction' | 'milestone' | 'event';
  title: string;
  description: string;
  importance: number;
}

interface InteractionMetrics {
  totalInteractions: number;
  averageSentiment: number;
  successRate: number;
  mostActiveDay: string;
  interactionFrequency: number;
  outcomeDistribution: Record<InteractionOutcome, number>;
  typeDistribution: Record<InteractionType, number>;
}

const SocialInteractionTimeline: React.FC<SocialInteractionTimelineProps> = ({
  agentId,
  config,
  height = 600
}) => {
  const dispatch = useAppDispatch();
  const { agents, interactions, loading, error } = useAppSelector((state: any) => state.social);
  
  const [viewMode, setViewMode] = useState<'timeline' | 'chart' | 'table'>('timeline');
  const [filters, setFilters] = useState<TimelineFilters>({
    type: 'all',
    outcome: 'all',
    dateRange: 'week',
    participants: []
  });
  const [selectedInteraction, setSelectedInteraction] = useState<SocialInteraction | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [timeRange, setTimeRange] = useState<{ start: number; end: number } | null>(null);
  
  const timelineRef = useRef<HTMLDivElement>(null);

  // Filter interactions based on criteria
  const filteredInteractions = useMemo(() => {
    let filtered = interactions.filter((interaction: SocialInteraction) =>
      !agentId || interaction.participants.includes(agentId)
    );

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter((interaction: SocialInteraction) => interaction.type === filters.type);
    }

    // Filter by outcome
    if (filters.outcome !== 'all') {
      filtered = filtered.filter((interaction: SocialInteraction) => interaction.outcome === filters.outcome);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const startDate = subDays(now, filters.dateRange === 'day' ? 1 : filters.dateRange === 'week' ? 7 : 30);
      filtered = filtered.filter((interaction: SocialInteraction) =>
        new Date(interaction.timestamp) >= startDate
      );
    }

    // Filter by participants
    if (filters.participants.length > 0) {
      filtered = filtered.filter((interaction: SocialInteraction) =>
        filters.participants.some(participant => interaction.participants.includes(participant))
      );
    }

    return filtered.sort((a: SocialInteraction, b: SocialInteraction) => b.timestamp - a.timestamp);
  }, [interactions, agentId, filters]);

  // Calculate timeline events
  const timelineEvents = useMemo((): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    filteredInteractions.forEach((interaction: SocialInteraction) => {
      const agent = agents.find((a: SocialAgent) => a.id === interaction.participants[0]);
      const targetAgent = agents.find((a: SocialAgent) => a.id === interaction.participants[1]);
      
      events.push({
        id: interaction.id,
        timestamp: interaction.timestamp,
        interaction,
        type: 'interaction',
        title: `${interaction.type} interaction`,
        description: `${agent?.name || 'Unknown'} → ${targetAgent?.name || 'Unknown'}`,
        importance: interaction.influenceDelta > 0 ? Math.abs(interaction.influenceDelta) : 1
      });
    });

    return events.sort((a, b) => b.timestamp - a.timestamp);
  }, [filteredInteractions, agents]);

  // Calculate interaction metrics
  const metrics = useMemo((): InteractionMetrics => {
    const outcomeCounts = filteredInteractions.reduce((acc: Record<InteractionOutcome, number>, interaction: SocialInteraction) => {
      acc[interaction.outcome] = (acc[interaction.outcome] || 0) + 1;
      return acc;
    }, {} as Record<InteractionOutcome, number>);

    const typeCounts = filteredInteractions.reduce((acc: Record<InteractionType, number>, interaction: SocialInteraction) => {
      acc[interaction.type] = (acc[interaction.type] || 0) + 1;
      return acc;
    }, {} as Record<InteractionType, number>);

    const successfulInteractions = filteredInteractions.filter(
      (interaction: SocialInteraction) => (interaction.outcome as string) === 'POSITIVE'
    ).length;

    const totalSentiment = filteredInteractions.reduce(
      (sum: number, interaction: SocialInteraction) => sum + (interaction.sentiment || 0),
      0
    );

    return {
      totalInteractions: filteredInteractions.length,
      averageSentiment: filteredInteractions.length > 0 ? totalSentiment / filteredInteractions.length : 0,
      successRate: filteredInteractions.length > 0 ? (successfulInteractions / filteredInteractions.length) * 100 : 0,
      mostActiveDay: 'Monday', // Calculate based on data
      interactionFrequency: filteredInteractions.length / 7, // Interactions per day
      outcomeDistribution: outcomeCounts,
      typeDistribution: typeCounts
    };
  }, [filteredInteractions]);

  // Prepare chart data
  const timelineChartData = useMemo(() => {
    const dailyData = filteredInteractions.reduce((acc: Record<string, any>, interaction: SocialInteraction) => {
      const date = formatDate(new Date(interaction.timestamp), 'MMM dd');
      if (!acc[date]) {
        acc[date] = { date, positive: 0, negative: 0, neutral: 0, total: 0 };
      }
      acc[date][interaction.outcome as string]++;
      acc[date].total++;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(dailyData).slice(-30); // Last 30 days
  }, [filteredInteractions]);

  const outcomePieData = useMemo(() => {
    return Object.entries(metrics.outcomeDistribution).map(([outcome, count]) => ({
      name: outcome,
      value: count,
      color: outcome === 'POSITIVE' ? '#4caf50' : outcome === 'NEGATIVE' ? '#f44336' : '#ff9800'
    }));
  }, [metrics.outcomeDistribution]);

  const typeBarData = useMemo(() => {
    return Object.entries(metrics.typeDistribution).map(([type, count]) => ({
      type: type as string,
      count
    }));
  }, [metrics.typeDistribution]);

  // Handle interaction selection
  const handleInteractionClick = (interaction: SocialInteraction) => {
    setSelectedInteraction(interaction);
    setDetailDialogOpen(true);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof TimelineFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Export data
  const handleExport = () => {
    const data = {
      interactions: filteredInteractions,
      metrics,
      filters,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-interaction-timeline-${formatDate(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Refresh data
  const handleRefresh = () => {
    // dispatch(socialActions.fetchInteractions());
  };

  // Get interaction type icon
  const getInteractionTypeIcon = (type: InteractionType) => {
    switch (type as string) {
      case 'CONVERSATION': return <MessageIcon />;
      case 'COLLABORATION': return <GroupIcon />;
      case 'TRADE': return <TrendingUpIcon />;
      case 'CONFLICT': return <EventIcon />;
      case 'OBSERVATION': return <PersonIcon />;
      default: return <MessageIcon />;
    }
  };

  // Get outcome color
  const getOutcomeColor = (outcome: InteractionOutcome) => {
    switch (outcome as string) {
      case 'POSITIVE': return 'success';
      case 'NEGATIVE': return 'error';
      case 'NEUTRAL': return 'warning';
      default: return 'default';
    }
  };

  // Render timeline view
  const renderTimeline = () => (
    <Box sx={{ height, overflow: 'auto', p: 2 }}>
      {timelineEvents.map((event, index) => (
        <Box key={event.id} sx={{ display: 'flex', mb: 4 }}>
          {/* Time column */}
          <Box sx={{ flex: '0 0 120px', pr: 2, textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
            </Typography>
          </Box>
          
          {/* Timeline connector */}
          <Box sx={{ flex: '0 0 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: (event.interaction.outcome as string) === 'POSITIVE' ? 'success.main' :
                         (event.interaction.outcome as string) === 'NEGATIVE' ? 'error.main' : 'warning.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: 12
              }}
              onClick={() => handleInteractionClick(event.interaction)}
            >
              {getInteractionTypeIcon(event.interaction.type)}
            </Box>
            {index < timelineEvents.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  width: 2,
                  bgcolor: 'grey.300',
                  mt: 1
                }}
              />
            )}
          </Box>
          
          {/* Content column */}
          <Box sx={{ flex: 1, pl: 2 }}>
            <Paper
              elevation={2}
              sx={{ p: 2, cursor: 'pointer', '&:hover': { elevation: 4 } }}
              onClick={() => handleInteractionClick(event.interaction)}
            >
              <Typography variant="h6" component="div">
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.description}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={event.interaction.type as string}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={event.interaction.outcome as string}
                  color={getOutcomeColor(event.interaction.outcome) as any}
                />
                {event.interaction.sentiment && (
                  <Chip
                    size="small"
                    label={`Sentiment: ${event.interaction.sentiment.toFixed(2)}`}
                    variant="outlined"
                  />
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      ))}
    </Box>
  );

  // Render chart view
  const renderCharts = () => (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Timeline Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Interaction Timeline
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="positive" stackId="1" stroke="#4caf50" fill="#4caf50" />
                  <Area type="monotone" dataKey="negative" stackId="1" stroke="#f44336" fill="#f44336" />
                  <Area type="monotone" dataKey="neutral" stackId="1" stroke="#ff9800" fill="#ff9800" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Outcome Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Outcome Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={outcomePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {outcomePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Type Distribution */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Interaction Types
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render table view
  const renderTable = () => (
    <Box sx={{ p: 2 }}>
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Participants</TableCell>
              <TableCell>Outcome</TableCell>
              <TableCell>Sentiment</TableCell>
              <TableCell>Influence</TableCell>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInteractions.map((interaction: SocialInteraction) => {
              const agent = agents.find((a: SocialAgent) => a.id === interaction.participants[0]);
              const targetAgent = agents.find((a: SocialAgent) => a.id === interaction.participants[1]);
              
              return (
                <TableRow 
                  key={interaction.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleInteractionClick(interaction)}
                >
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(new Date(interaction.timestamp), 'MMM dd, HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={interaction.type as string}
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {agent?.name?.[0] || '?'}
                      </Avatar>
                      <Typography variant="body2">→</Typography>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {targetAgent?.name?.[0] || '?'}
                      </Avatar>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={interaction.outcome as string}
                      color={getOutcomeColor(interaction.outcome) as any}
                    />
                  </TableCell>
                  <TableCell>
                    {interaction.sentiment ? (
                      <Typography variant="body2">
                        {interaction.sentiment.toFixed(2)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {interaction.influenceDelta.toFixed(3)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {interaction.content}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  if (loading) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Loading social interaction timeline...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Error loading social interaction timeline: {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Social Interaction Timeline
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Data">
              <IconButton onClick={handleExport}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Metrics Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {metrics.totalInteractions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Interactions
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {metrics.successRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {metrics.averageSentiment.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Sentiment
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {metrics.interactionFrequency.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Daily Frequency
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="timeline">
              <TimelineIcon />
            </ToggleButton>
            <ToggleButton value="chart">
              <BarChartIcon />
            </ToggleButton>
            <ToggleButton value="table">
              <PeopleIcon />
            </ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e: any) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              {Object.values(InteractionType).map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Outcome</InputLabel>
            <Select
              value={filters.outcome}
              label="Outcome"
              onChange={(e: any) => handleFilterChange('outcome', e.target.value)}
            >
              <MenuItem value="all">All Outcomes</MenuItem>
              {Object.values(InteractionOutcome).map(outcome => (
                <MenuItem key={outcome} value={outcome}>{outcome}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={filters.dateRange}
              label="Date Range"
              onChange={(e: any) => handleFilterChange('dateRange', e.target.value)}
            >
              <MenuItem value="day">Last Day</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Content */}
        {viewMode === 'timeline' && renderTimeline()}
        {viewMode === 'chart' && renderCharts()}
        {viewMode === 'table' && renderTable()}
      </CardContent>

      {/* Interaction Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Interaction Details
          <IconButton 
            onClick={() => setDetailDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedInteraction && (
            <Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Type
                  </Typography>
                  <Chip label={selectedInteraction.type as string} color="primary" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Outcome
                  </Typography>
                  <Chip
                    label={selectedInteraction.outcome as string}
                    color={getOutcomeColor(selectedInteraction.outcome) as any}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Time
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(new Date(selectedInteraction.timestamp), 'yyyy-MM-dd HH:mm')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Influence Delta
                  </Typography>
                  <Typography variant="body2">
                    {selectedInteraction.influenceDelta.toFixed(3)}
                  </Typography>
                </Grid>
                {selectedInteraction.sentiment && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Sentiment
                    </Typography>
                    <Typography variant="body2">
                      {selectedInteraction.sentiment.toFixed(2)}
                    </Typography>
                  </Grid>
                )}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Participants
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedInteraction.participants.map((participantId: string) => {
                      const agent = agents.find((a: SocialAgent) => a.id === participantId);
                      return (
                        <Chip 
                          key={participantId}
                          avatar={<Avatar>{agent?.name?.[0] || '?'}</Avatar>}
                          label={agent?.name || participantId}
                          variant="outlined"
                        />
                      );
                    })}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Content
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedInteraction.content}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SocialInteractionTimeline;