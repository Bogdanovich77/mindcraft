/**
 * Social Details Modal
 * 
 * Displays detailed social relationship information and history.
 * Integrates with SocialTab component and Redux store.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  LinearProgress,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Psychology as PsychologyIcon,
  Message as MessageIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
  Timeline as TimelineIcon,
  Group as GroupIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import type { 
  SocialRelationship, 
  SocialRelationshipType, 
  RelationshipStatus,
  SocialInteraction,
  InteractionType,
  Agent
} from '../../types/social';

interface SocialDetailsModalProps {
  open: boolean;
  onClose: () => void;
  relationshipId?: string;
  agentId?: string;
}

interface RelationshipHistory {
  id: string;
  timestamp: number;
  type: 'trust_change' | 'interaction' | 'status_change' | 'milestone' | 'conflict' | 'resolution';
  description: string;
  details: any;
  impact: number; // -1 to 1
}

const SocialDetailsModal: React.FC<SocialDetailsModalProps> = ({
  open,
  onClose,
  relationshipId,
  agentId
}) => {
  const dispatch = useDispatch();
  const { agents, social } = useSelector((state: RootState) => state);
  
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Get relationship data
  const relationship = useMemo(() => {
    if (!relationshipId) return null;
    
    return social.relationships?.find(rel => rel.id === relationshipId) || null;
  }, [social.relationships, relationshipId]);

  // Get agent data
  const agent = useMemo(() => {
    if (!agentId && !relationship) return null;
    
    return agents?.find(a => a.id === (relationship?.targetAgentId || agentId)) || null;
  }, [agents, relationship, agentId]);

  // Get interaction history
  const interactionHistory = useMemo(() => {
    if (!relationship) return [];
    
    return social.interactions || [];
      .filter(interaction => 
        (interaction.sourceAgentId === relationship.sourceAgentId && interaction.targetAgentId === relationship.targetAgentId) ||
        (interaction.sourceAgentId === relationship.targetAgentId && interaction.targetAgentId === relationship.sourceAgentId)
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50); // Last 50 interactions
  }, [social.interactions, relationship]);

  // Get relationship history
  const relationshipHistory = useMemo(() => {
    if (!relationship) return [];
    
    // Generate simulated history based on relationship changes
    const history: RelationshipHistory[] = [
      {
        id: '1',
        timestamp: relationship.createdAt - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        type: 'trust_change',
        description: 'Initial relationship established',
        details: { trustLevel: 0.5 },
        impact: 0.3
      },
      {
        id: '2',
        timestamp: relationship.createdAt - 15 * 24 * 60 * 60 * 1000, // 15 days ago
        type: 'interaction',
        description: 'First positive interaction',
        details: { type: 'collaboration', outcome: 'positive' },
        impact: 0.5
      },
      {
        id: '3',
        timestamp: relationship.createdAt - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        type: 'milestone',
        description: 'Trust milestone reached',
        details: { milestone: 'trusted_ally', trustLevel: 0.7 },
        impact: 0.8
      }
    ];

    return history.sort((a, b) => b.timestamp - a.timestamp);
  }, [relationship]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!relationship) return null;

    const agentInteractions = social.interactions.filter(interaction => 
      interaction.sourceAgentId === relationship.targetAgentId ||
      interaction.targetAgentId === relationship.targetAgentId
    );

    const positiveInteractions = agentInteractions.filter(i => i.sentiment > 0.5).length;
    const negativeInteractions = agentInteractions.filter(i => i.sentiment < 0.3).length;
    const totalInteractions = agentInteractions.length;

    return {
      totalInteractions,
      positiveInteractions,
      negativeInteractions,
      averageSentiment: totalInteractions > 0 ? agentInteractions.reduce((sum, i) => sum + i.sentiment, 0) / totalInteractions : 0,
      interactionFrequency: totalInteractions / Math.max(1, (Date.now() - relationship.createdAt) / (24 * 60 * 60 * 1000)), // interactions per day
      trustProgress: relationship.currentTrust - (relationship.initialTrust || 0),
      relationshipStrength: relationship.strength || 0,
      lastInteraction: agentInteractions.length > 0 ? agentInteractions[0].timestamp : null
    };
  }, [relationship, social.interactions]);

  // Get relationship type color
  const getRelationshipTypeColor = (type: SocialRelationshipType): string => {
    switch (type) {
      case 'friendship': return '#4caf50';
      case 'professional': return '#2196f3';
      case 'romantic': return '#e91e63';
      case 'family': return '#ff9800';
      case 'rivalry': return '#f44336';
      case 'mentorship': return '#9c27b0';
      default: return '#757575';
    }
  };

  // Get status color
  const getStatusColor = (status: RelationshipStatus): string => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'inactive': return '#9e9e9e';
      case 'dormant': return '#ff9800';
      case 'conflicted': return '#f44336';
      default: return '#757575';
    }
  };

  // Get interaction type icon
  const getInteractionTypeIcon = (type: InteractionType) => {
    switch (type) {
      case 'conversation': return <MessageIcon />;
      case 'collaboration': return <GroupIcon />;
      case 'trade': return <TimelineIcon />;
      case 'conflict': return <ThumbDownIcon />;
      case 'support': return <ThumbUpIcon />;
      case 'competition': return <PsychologyIcon />;
      default: return <PersonIcon />;
    }
  };

  // Get sentiment color
  const getSentimentColor = (sentiment: number): string => {
    if (sentiment >= 0.7) return '#4caf50';
    if (sentiment >= 0.4) return '#8bc34a';
    if (sentiment >= 0.2) return '#ff9800';
    return '#f44336';
  };

  // Export relationship data
  const handleExport = () => {
    if (!relationship) return;

    const exportData = {
      relationship,
      agent,
      interactionHistory,
      relationshipHistory,
      statistics,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-relationship-${relationship.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Refresh data
  const handleRefresh = () => {
    // This would trigger a data refresh via Redux actions
    console.log('Refreshing social data...');
  };

  if (!relationship) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            Relationship Not Found
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            The requested relationship could not be found. It may have been deleted or the ID is invalid.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: getRelationshipTypeColor(relationship.type), mr: 1 }}>
              {agent?.name?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {agent?.name || 'Unknown Agent'}
              </Typography>
              <Chip 
                label={relationship.type} 
                size="small" 
                sx={{ ml: 1, bgcolor: getRelationshipTypeColor(relationship.type), color: 'white' }}
              />
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export">
              <IconButton onClick={handleExport} size="small">
                <ExportIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue as number)} sx={{ mb: 3 }}>
          <Tab label="Overview" />
          <Tab label="Interactions" />
          <Tab label="History" />
          <Tab label="Analytics" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            {/* Relationship Overview */}
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Relationship Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="h6">
                      {relationship.type}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={relationship.status} 
                      sx={{ bgcolor: getStatusColor(relationship.status), color: 'white' }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Trust Level
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">
                        {(relationship.currentTrust * 100).toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={relationship.currentTrust}
                        sx={{ flex: 1 }}
                        color={getRelationshipTypeColor(relationship.type)}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Relationship Strength
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">
                        {(relationship.strength || 0) * 100).toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={relationship.strength || 0}
                        sx={{ flex: 1 }}
                        color={getRelationshipTypeColor(relationship.type)}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body1">
                      {new Date(relationship.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {new Date(relationship.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Recent Interactions
                  </Typography>
                  {interactionHistory.length > 0 ? (
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {interactionHistory.slice(0, 10).map((interaction, index) => (
                        <ListItem key={interaction.id}>
                          <ListItemIcon>
                            {getInteractionTypeIcon(interaction.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={interaction.description}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(interaction.timestamp).toLocaleDateString()}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Sentiment:
                                  </Typography>
                                  <Chip 
                                    label={`${(interaction.sentiment * 100).toFixed(0)}%`}
                                    size="small"
                                    sx={{ 
                                      bgcolor: getSentimentColor(interaction.sentiment), 
                                      color: 'white' 
                                    }}
                                  />
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No interactions recorded
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {/* Interaction History */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">
                Interaction History
              </Typography>
              <FormControl size="small">
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                >
                  <MenuItem value="7d">Last 7 days</MenuItem>
                  <MenuItem value="30d">Last 30 days</MenuItem>
                  <MenuItem value="90d">Last 90 days</MenuItem>
                  <MenuItem value="all">All time</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Sentiment</TableCell>
                    <TableCell>Impact</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {interactionHistory.map((interaction) => (
                    <TableRow key={interaction.id}>
                      <TableCell>
                        {new Date(interaction.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getInteractionTypeIcon(interaction.type)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {interaction.type}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {interaction.description}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${(interaction.sentiment * 100).toFixed(0)}%`}
                          size="small"
                          sx={{ 
                            bgcolor: getSentimentColor(interaction.sentiment), 
                            color: 'white' 
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge 
                          badgeContent={Math.abs(interaction.impact * 100).toFixed(0)}
                          color={interaction.impact > 0 ? 'success' : 'error'}
                          max={999}
                        >
                          <TrendingUpIcon />
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            {/* Relationship History */}
            <Typography variant="subtitle1" gutterBottom>
              Relationship History
            </Typography>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {relationshipHistory.map((event, index) => (
                <ListItem key={event.id}>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {event.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Impact: {(event.impact * 100).toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.abs(event.impact)}
                          sx={{ width: 200, mt: 0.5 }}
                          color={event.impact > 0 ? 'success' : 'error'}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {activeTab === 3 && statistics && (
          <Box>
            {/* Analytics */}
            <Typography variant="subtitle1" gutterBottom>
              Relationship Analytics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {statistics.totalInteractions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Interactions
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success" gutterBottom>
                    {statistics.positiveInteractions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Positive Interactions
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="error" gutterBottom>
                    {statistics.negativeInteractions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Negative Interactions
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="info" gutterBottom>
                    {statistics.averageSentiment > 0 ? '+' : ''}{(statistics.averageSentiment * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Sentiment
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning" gutterBottom>
                    {statistics.interactionFrequency.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Interactions/Day
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" gutterBottom>
                    {(statistics.trustProgress * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trust Progress
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.abs(statistics.trustProgress)}
                    sx={{ width: 200, mt: 0.5 }}
                    color={statistics.trustProgress > 0 ? 'success' : 'error'}
                  />
                </Paper>
              </Grid>
              
              <Grid xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" gutterBottom>
                    {(statistics.relationshipStrength * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Relationship Strength
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={statistics.relationshipStrength}
                    sx={{ width: 200, mt: 0.5 }}
                    color={getRelationshipTypeColor(relationship.type)}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SocialDetailsModal;