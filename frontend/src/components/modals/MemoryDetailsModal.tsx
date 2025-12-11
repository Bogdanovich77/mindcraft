/**
 * Memory Details Modal
 * 
 * Comprehensive modal for viewing detailed memory information,
 * including semantic, episodic, procedural, and working memory details.
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
  Psychology as PsychologyIcon,
  Memory as MemoryIcon,
  Settings as SettingsIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  History as HistoryIcon,
  Lightbulb as LightbulbIcon,
  Extension as ExtensionIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import type { AgentState } from '../../types/agent';

interface MemoryDetailsModalProps {
  open: boolean;
  onClose: () => void;
  memoryId?: string;
  agentId?: string;
}

interface MemoryItem {
  id: string;
  type: 'concept' | 'entity' | 'experience' | 'skill' | 'goal';
  title: string;
  description: string;
  importance: number;
  strength: number;
  lastAccessed: number;
  connections: number;
  metadata?: any;
}

const MemoryDetailsModal: React.FC<MemoryDetailsModalProps> = ({
  open,
  onClose,
  memoryId,
  agentId
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { agents } = useSelector((state: RootState) => state.agents as any);
  
  // Component state
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);

  // Get memory and agent data
  const agent = agentId ? agents.find((a: any) => a.id === agentId) : null;
  const memory = selectedMemory || (memoryId ? getMemoryById(memoryId, agent) : null);

  // Get memory item by ID
  const getMemoryById = (id: string, agent: any): MemoryItem | null => {
    if (!agent) return null;

    // Search in semantic memory
    if (agent.cognitive?.memory?.semantic) {
      const semantic = agent.cognitive.memory.semantic;
      
      if (semantic.concepts) {
        const concept = semantic.concepts.find((c: any) => c.id === id);
        if (concept) {
          return {
            id: concept.id,
            type: 'concept',
            title: concept.name || 'Concept',
            description: concept.description || '',
            importance: concept.importance || 50,
            strength: concept.strength || 50,
            lastAccessed: concept.lastAccessed || Date.now(),
            connections: 0,
            metadata: concept
          };
        }
      }

      if (semantic.entities) {
        const entity = semantic.entities.find((e: any) => e.id === id);
        if (entity) {
          return {
            id: entity.id,
            type: 'entity',
            title: entity.name || 'Entity',
            description: entity.description || '',
            importance: entity.importance || 50,
            strength: entity.confidence || 50,
            lastAccessed: entity.lastAccessed || Date.now(),
            connections: 0,
            metadata: entity
          };
        }
      }
    }

    // Search in episodic memory
    if (agent.cognitive?.memory?.episodic) {
      const episodic = agent.cognitive.memory.episodic;
      
      if (episodic.events) {
        const event = episodic.events.find((e: any) => e.id === id);
        if (event) {
          return {
            id: event.id,
            type: 'experience',
            title: event.description || 'Experience',
            description: event.context || '',
            importance: event.importance || 50,
            strength: event.emotionalImpact || 50,
            lastAccessed: event.timestamp || Date.now(),
            connections: 0,
            metadata: event
          };
        }
      }
    }

    // Search in procedural memory
    if (agent.cognitive?.memory?.procedural) {
      const procedural = agent.cognitive.memory.procedural;
      
      if (procedural.skills) {
        const skill = procedural.skills.find((s: any) => s.id === id);
        if (skill) {
          return {
            id: skill.id,
            type: 'skill',
            title: skill.name || 'Skill',
            description: skill.description || '',
            importance: skill.proficiency || 50,
            strength: skill.frequency || 50,
            lastAccessed: skill.lastUsed || Date.now(),
            connections: 0,
            metadata: skill
          };
        }
      }
    }

    // Search in working memory
    if (agent.cognitive?.memory?.working) {
      const working = agent.cognitive.memory.working;
      
      if (working.activeGoals) {
        const goal = working.activeGoals.find((g: any) => g.id === id);
        if (goal) {
          return {
            id: goal.id,
            type: 'goal',
            title: goal.description || 'Goal',
            description: goal.context || '',
            importance: goal.priority || 50,
            strength: goal.progress?.percentage || 50,
            lastAccessed: goal.createdAt || Date.now(),
            connections: 0,
            metadata: goal
          };
        }
      }
    }

    return null;
  };

  // Get memory type icon
  const getMemoryTypeIcon = (type: string) => {
    switch (type) {
      case 'concept': return <PsychologyIcon />;
      case 'entity': return <MemoryIcon />;
      case 'experience': return <TimelineIcon />;
      case 'skill': return <SettingsIcon />;
      case 'goal': return <WorkIcon />;
      default: return <MemoryIcon />;
    }
  };

  // Get memory type color
  const getMemoryTypeColor = (type: string) => {
    switch (type) {
      case 'concept': return theme.palette.primary.main;
      case 'entity': return theme.palette.secondary.main;
      case 'experience': return theme.palette.info.main;
      case 'skill': return theme.palette.success.main;
      case 'goal': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  // Get importance color
  const getImportanceColor = (importance: number) => {
    if (importance >= 80) return theme.palette.error.main;
    if (importance >= 60) return theme.palette.warning.main;
    if (importance >= 40) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format importance
  const formatImportance = (importance: number) => {
    return `${importance.toFixed(1)}%`;
  };

  // Format strength
  const formatStrength = (strength: number) => {
    return `${strength.toFixed(1)}%`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Memory Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {memory && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {getMemoryTypeIcon(memory.type)} {memory.title}
            </Typography>
            
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue as number)}>
              <Tab label="Overview" value={0} icon={<MemoryIcon />} />
              <Tab label="Details" value={1} icon={<SettingsIcon />} />
              <Tab label="Connections" value={2} icon={<ExtensionIcon />} />
            </Tabs>

            {/* Overview Tab */}
            {activeTab === 0 && (
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>Memory Information</Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="body2" color="textSecondary">Type:</Typography>
                          <Chip 
                            label={memory.type} 
                            size="small" 
                            color={getMemoryTypeColor(memory.type) as any}
                          />
                        </Box>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" color="textSecondary">ID:</Typography>
                        <Typography variant="body1">{memory.id}</Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" color="textSecondary">Importance:</Typography>
                        <Typography variant="body1">{formatImportance(memory.importance)}</Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" color="textSecondary">Strength:</Typography>
                        <Typography variant="body1">{formatStrength(memory.strength)}</Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" color="textSecondary">Last Accessed:</Typography>
                        <Typography variant="body1">{formatTimestamp(memory.lastAccessed)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>Description</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {memory.description || 'No description available'}
                        </Typography>
                      </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>Importance & Strength</Typography>
                        
                        <Box display="flex" alignItems="center" mb={2}>
                          <Typography variant="body2" color="textSecondary" sx={{ minWidth: 80 }}>Importance:</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={memory.importance}
                            sx={{ flex: 1, ml: 2, height: 8 }}
                            color={getImportanceColor(memory.importance) as any}
                          />
                        </Box>
                        
                        <Box display="flex" alignItems="center" mb={2}>
                          <Typography variant="body2" color="textSecondary" sx={{ minWidth: 80 }}>Strength:</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={memory.strength}
                            sx={{ flex: 1, ml: 2, height: 8 }}
                            color={getImportanceColor(memory.strength) as any}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                </Grid>
              </Box>
            )}

            {/* Details Tab */}
            {activeTab === 1 && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>Memory Metadata</Typography>
                
                {memory.metadata && (
                  <Box>
                    {Object.entries(memory.metadata).map(([key, value]) => (
                      <Box key={key} mb={2}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </Typography>
                        <Typography variant="body1">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* Connections Tab */}
            {activeTab === 2 && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>Related Memories</Typography>
                
                <List>
                  {agent && getRelatedMemories(memory.id, agent).map((relatedMemory: MemoryItem, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getMemoryTypeIcon(relatedMemory.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={relatedMemory.title}
                        secondary={`${relatedMemory.type} - Importance: ${formatImportance(relatedMemory.importance)}`}
                      />
                    </ListItem>
                  ))}
                </List>
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

// Helper function to get related memories
const getRelatedMemories = (memoryId: string, agent: any): MemoryItem[] => {
  const relatedMemories: MemoryItem[] = [];
  
  if (!agent) return relatedMemories;

  // This is a simplified implementation - in a real system,
  // you would analyze semantic relationships, temporal proximity, etc.
  const allMemories: MemoryItem[] = [];
  
    
  // Collect all memories from different types
  if (agent.cognitive?.memory?.semantic?.concepts) {
    allMemories.push(...agent.cognitive.memory.semantic.concepts.map((c: any) => ({
      id: c.id,
      type: 'concept',
      title: c.name || 'Concept',
      description: c.description || '',
      importance: c.importance || 50,
      strength: c.strength || 50,
      lastAccessed: c.lastAccessed || Date.now(),
      connections: 0,
      metadata: c
    })));
  }
  
  if (agent.cognitive?.memory?.semantic?.entities) {
    allMemories.push(...agent.cognitive.memory.semantic.entities.map((e: any) => ({
      id: e.id,
      type: 'entity',
      title: e.name || 'Entity',
      description: e.description || '',
      importance: e.importance || 50,
      strength: e.confidence || 50,
      lastAccessed: e.lastAccessed || Date.now(),
      connections: 0,
      metadata: e
    })));
  }
  
  if (agent.cognitive?.memory?.episodic?.events) {
    allMemories.push(...agent.cognitive.memory.episodic.events.map((ev: any) => ({
      id: ev.id,
      type: 'experience',
      title: ev.description || 'Experience',
      description: ev.context || '',
      importance: ev.importance || 50,
      strength: ev.emotionalImpact || 50,
      lastAccessed: ev.timestamp || Date.now(),
      connections: 0,
      metadata: ev
    })));
  }
  
  if (agent.cognitive?.memory?.procedural?.skills) {
    allMemories.push(...agent.cognitive.memory.procedural.skills.map((s: any) => ({
      id: s.id,
      type: 'skill',
      title: s.name || 'Skill',
      description: s.description || '',
      importance: s.proficiency || 50,
      strength: s.frequency || 50,
      lastAccessed: s.lastUsed || Date.now(),
      connections: 0,
      metadata: s
    })));
  }
  
  if (agent.cognitive?.memory?.working?.activeGoals) {
    allMemories.push(...agent.cognitive.memory.working.activeGoals.map((g: any) => ({
      id: g.id,
      type: 'goal',
      title: g.description || 'Goal',
      description: g.context || '',
      importance: g.priority || 50,
      strength: g.progress?.percentage || 50,
      lastAccessed: g.createdAt || Date.now(),
      connections: 0,
      metadata: g
    })));
  }
  
  // Find related memories (simplified - would use semantic analysis in real system)
  return allMemories
    .filter(m => m.id !== memoryId)
    .filter(m => {
      // Simple relatedness criteria
      const typeMatch = m.type === memory.type;
      const importanceSimilarity = Math.abs(m.importance - memory.importance) < 20;
      const recentAccess = (Date.now() - m.lastAccessed) < 86400000; // Within 24 hours
      
      return typeMatch || importanceSimilarity || recentAccess;
    })
    .slice(0, 5); // Return top 5 related memories
};

export default MemoryDetailsModal;