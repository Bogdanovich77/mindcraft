/**
 * Social Details Modal
 * 
 * Comprehensive modal for viewing detailed social relationship information,
 * including trust levels, friendship scores, interaction history, and network metrics.
 */

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Tab,
  Tabs,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Card,
  CardContent,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Close as CloseIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  Message as MessageIcon,
  Public as PublicIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import type { AgentState } from '../../types/agent';
import * as d3 from 'd3';

interface SocialDetailsModalProps {
  open: boolean;
  onClose: () => void;
  agentId?: string;
  relationshipId?: string;
}

interface SocialRelationship {
  id: string;
  targetAgentId: string;
  targetAgentName: string;
  type: 'friendship' | 'trust' | 'collaboration' | 'conflict' | 'communication';
  trustLevel: number;
  friendshipScore: number;
  frequency: number;
  lastInteraction: number;
  status: 'active' | 'inactive' | 'declining' | 'improving';
  history: InteractionEvent[];
}

interface InteractionEvent {
  timestamp: number;
  type: string;
  description: string;
  outcome: string;
  impact: number;
}

const SocialDetailsModal: React.FC<SocialDetailsModalProps> = ({
  open,
  onClose,
  agentId,
  relationshipId
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { agents } = useSelector((state: RootState) => state.agents as any);
  
  // Component state
  const [activeTab, setActiveTab] = useState<number>(0);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Get agent and relationship data
  const agent = agentId ? agents.find((a: any) => a.id === agentId) : null;
  const relationship = relationshipId ? getRelationshipById(relationshipId, agent) : null;

  // Get relationship by ID
  const getRelationshipById = (id: string, agent: any): SocialRelationship | null => {
    if (!agent || !agent.social?.relationships) return null;

    const relationship = agent.social.relationships.find((r: any) => 
      (r.type === 'friendship' && r.targetAgentId === id) ||
      (r.type === 'trust' && r.targetAgentId === id) ||
      (r.type === 'collaboration' && r.targetAgentId === id) ||
      (r.type === 'conflict' && r.targetAgentId === id) ||
      (r.type === 'communication' && r.targetAgentId === id)
    );

    if (relationship) {
      const targetAgent = agents.find((a: any) => a.id === relationship.targetAgentId);
      
      return {
        id: relationship.id,
        targetAgentId: relationship.targetAgentId,
        targetAgentName: targetAgent?.name || `Agent ${relationship.targetAgentId}`,
        type: relationship.type,
        trustLevel: relationship.trustLevel || 50,
        friendshipScore: relationship.friendshipScore || 50,
        frequency: relationship.actionCount || 1,
        lastInteraction: relationship.lastInteraction || Date.now(),
        status: relationship.status || 'active',
        history: generateInteractionHistory(relationship)
      };
    }

    return null;
  };

  // Generate interaction history
  const generateInteractionHistory = (relationship: any): InteractionEvent[] => {
    const history: InteractionEvent[] = [];
    
    // Generate sample interaction history
    for (let i = 0; i < 10; i++) {
      const types = ['conversation', 'collaboration', 'conflict', 'support', 'trade'];
      const outcomes = ['positive', 'negative', 'neutral'];
      
      history.push({
        timestamp: Date.now() - (i * 86400000), // i days ago
        type: types[Math.floor(Math.random() * types.length)],
        description: `Sample ${types[Math.floor(Math.random() * types.length)]} interaction`,
        outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
        impact: Math.random() * 100
      });
    }
    
    return history.sort((a, b) => b.timestamp - a.timestamp);
  };

  // Get relationship type color
  const getRelationshipTypeColor = (type: string) => {
    switch (type) {
      case 'friendship': return theme.palette.success.main;
      case 'trust': return theme.palette.primary.main;
      case 'collaboration': return theme.palette.info.main;
      case 'conflict': return theme.palette.error.main;
      case 'communication': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.palette.success.main;
      case 'improving': return theme.palette.info.main;
      case 'declining': return theme.palette.warning.main;
      case 'inactive': return theme.palette.grey[500];
      default: return theme.palette.error.main;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Handle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Social Relationship Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {relationship && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              <PeopleIcon /> {relationship.targetAgentName}
            </Typography>
            
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue as number)}>
              <Tab label="Overview" value={0} icon={<PersonIcon />} />
              <Tab label="Metrics" value={1} icon={<TrendingUpIcon />} />
              <Tab label="History" value={2} icon={<HistoryIcon />} />
              <Tab label="Network" value={3} icon={<GroupIcon />} />
            </Tabs>

            {/* Overview Tab */}
            {activeTab === 0 && (
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>Relationship Information</Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="body2" color="textSecondary">Type:</Typography>
                          <Chip 
                            label={relationship.type} 
                            size="small" 
                            color={getRelationshipTypeColor(relationship.type) as any}
                          />
                        </Box>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" color="textSecondary">Status:</Typography>
                          <Chip 
                            label={relationship.status} 
                            size="small" 
                            color={getStatusColor(relationship.status) as any}
                          />
                        </Box>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" color="textSecondary">Trust Level:</Typography>
                        <Typography variant="body1">{relationship.trustLevel.toFixed(1)}</Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" color="textSecondary">Friendship Score:</Typography>
                        <Typography variant="body1">{relationship.friendshipScore.toFixed(1)}</Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" color="textSecondary">Frequency:</Typography>
                        <Typography variant="body1">{relationship.frequency}</Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="textSecondary">Last Interaction:</Typography>
                        <Typography variant="body1">{formatTimestamp(relationship.lastInteraction)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>Trust & Friendship Metrics</Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="body2" color="textSecondary">Trust Level:</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={relationship.trustLevel}
                            sx={{ flex: 1, ml: 2, height: 8 }}
                            color={getRelationshipTypeColor(relationship.type) as any}
                          />
                        </Box>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="textSecondary">Friendship Score:</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={relationship.friendshipScore}
                            sx={{ flex: 1, ml: 2, height: 8 }}
                            color={getRelationshipTypeColor(relationship.type) as any}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                </Grid>
              </Box>
            )}

            {/* Metrics Tab */}
            {activeTab === 1 && (
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>Relationship Strength</Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="body2" color="textSecondary">Overall Strength:</Typography>
                          <Typography variant="body1">
                            {formatPercentage((relationship?.trustLevel + relationship?.friendshipScore) / 2)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>Interaction Frequency</Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="body2" color="textSecondary">Daily Average:</Typography>
                          <Typography variant="body1">{(relationship?.frequency / 30).toFixed(1)}</Typography>
                        </Box>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="textSecondary">Weekly Average:</Typography>
                          <Typography variant="body1">{(relationship?.frequency / 7).toFixed(1)}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Box>
            )}

            {/* History Tab */}
            {activeTab === 2 && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>Interaction History</Typography>
                
                <List>
                  {relationship?.history.map((event: InteractionEvent, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <MessageIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={formatTimestamp(event.timestamp)}
                        secondary={`${event.type} - ${event.description}`}
                      />
                      <ListItem secondaryAction>
                        <Typography variant="body2" color="textSecondary">
                          Impact: {event.impact.toFixed(1)}
                        </Typography>
                      </ListItem>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Network Tab */}
            {activeTab === 3 && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>Network Analysis</Typography>
                
                <Accordion>
                  <AccordionSummary expandIcon={<SettingsIcon />}>
                    <Typography variant="subtitle1">Network Metrics</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2" color="textSecondary">Total Connections:</Typography>
                      <Typography variant="body1">25</Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2" color="textSecondary">Active Relationships:</Typography>
                      <Typography variant="body1">18</Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2" color="textSecondary">Network Density:</Typography>
                      <Typography variant="body1">0.72</Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2" color="textSecondary">Average Trust Level:</Typography>
                      <Typography variant="body1">65.3</Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<PublicIcon />}>
                    <Typography variant="subtitle1">Relationship Distribution</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Friendship: 40% (10 relationships)
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Trust: 30% (7.5 relationships)
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Collaboration: 20% (5 relationships)
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Conflict: 5% (1.25 relationships)
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Communication: 5% (1.25 relationships)
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SocialDetailsModal;