/**
 * Skill Details Modal
 * 
 * Comprehensive modal for viewing detailed skill information,
 * including proficiency levels, progression history, milestones, and related skills.
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
  AccordionDetails,
  Chip,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Star as StarIcon,
  EmojiEvents as EmojiEventsIcon,
  Psychology as PsychologyIcon,
  Build as BuildIcon,
  LocalFireDepartment as FireIcon,
  Speed as SpeedIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  Lightbulb as LightbulbIcon,
  MilitaryTech as MilitaryTechIcon,
  Computer as ComputerIcon,
  SportsEsports as SportsEsportsIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import * as d3 from 'd3';

interface SkillDetailsModalProps {
  open: boolean;
  onClose: () => void;
  agentId?: string;
  skillId?: string;
}

interface SkillProficiency {
  knowledge: number;
  practical: number;
  creative: number;
  overall: number;
  experience: number;
  level: number;
  rank: string;
}

interface SkillMilestone {
  id: string;
  name: string;
  description: string;
  requirements: number[];
  unlocked: boolean;
  unlockedAt?: number;
  benefits: string[];
}

interface SkillHistory {
  timestamp: number;
  type: 'experience_gain' | 'milestone_unlock' | 'level_up' | 'skill_use' | 'learning_event';
  description: string;
  impact: number;
  context: string;
}

interface SkillSynergy {
  skillId: string;
  skillName: string;
  synergyType: 'direct' | 'analogical' | 'creative';
  strength: number;
  description: string;
}

const SkillDetailsModal: React.FC<SkillDetailsModalProps> = ({
  open,
  onClose,
  agentId,
  skillId
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { agents } = useSelector((state: RootState) => state.agents as any);
  
  // Component state
  const [activeTab, setActiveTab] = useState<number>(0);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Get agent and skill data
  const agent = agentId ? agents.find((a: any) => a.id === agentId) : null;
  const skill = skillId ? getSkillById(skillId, agent) : null;

  // Get skill by ID
  const getSkillById = (id: string, agent: any): any => {
    if (!agent || !agent.cognitive?.skills) return null;

    const skill = agent.cognitive.skills[id];
    if (skill) {
      return {
        id,
        type: id,
        proficiency: {
          knowledge: skill.proficiency?.knowledge || 0,
          practical: skill.proficiency?.practical || 0,
          creative: skill.proficiency?.creative || 0,
          overall: skill.proficiency?.overall || 0,
          experience: skill.experience || 0,
          level: Math.floor((skill.proficiency?.overall || 0) / 20) + 1,
          rank: getSkillRank(skill.proficiency?.overall || 0)
        },
        milestones: generateMilestones(id),
        history: generateSkillHistory(skill),
        synergies: generateSkillSynergies(id, agent)
      };
    }

    return null;
  };

  // Get skill rank based on proficiency
  const getSkillRank = (proficiency: number): string => {
    if (proficiency >= 90) return 'Master';
    if (proficiency >= 75) return 'Expert';
    if (proficiency >= 60) return 'Advanced';
    if (proficiency >= 40) return 'Intermediate';
    if (proficiency >= 20) return 'Novice';
    return 'Beginner';
  };

  // Generate skill milestones
  const generateMilestones = (skillType: string): SkillMilestone[] => {
    const milestones: SkillMilestone[] = [];
    
    // Generate sample milestones based on skill type
    const baseMilestones = [
      { level: 25, name: 'Basic Proficiency', description: `Achieved basic understanding of ${skillType}` },
      { level: 50, name: 'Intermediate Proficiency', description: `Developed intermediate skills in ${skillType}` },
      { level: 75, name: 'Advanced Proficiency', description: `Mastered advanced techniques in ${skillType}` },
      { level: 90, name: 'Expert Proficiency', description: `Achieved expert level in ${skillType}` }
    ];

    baseMilestones.forEach((milestone, index) => {
      milestones.push({
        id: `${skillType}_milestone_${index}`,
        name: milestone.name,
        description: milestone.description,
        requirements: [milestone.level],
        unlocked: Math.random() > 0.5, // Random unlock status for demo
        unlockedAt: Math.random() > 0.5 ? Date.now() - Math.random() * 86400000 : undefined,
        benefits: [
          `Improved efficiency in ${skillType}`,
          `Unlock new abilities related to ${skillType}`,
          `Enhanced performance in related tasks`
        ]
      });
    });

    return milestones;
  };

  // Generate skill history
  const generateSkillHistory = (skill: any): SkillHistory[] => {
    const history: SkillHistory[] = [];
    
    // Generate sample history
    for (let i = 0; i < 20; i++) {
      const types: SkillHistory['type'][] = ['experience_gain', 'milestone_unlock', 'level_up', 'skill_use', 'learning_event'];
      const impacts = [10, 25, 50, 100];
      
      history.push({
        timestamp: Date.now() - (i * 3600000), // i hours ago
        type: types[Math.floor(Math.random() * types.length)],
        description: `Sample ${types[Math.floor(Math.random() * types.length)]} event`,
        impact: impacts[Math.floor(Math.random() * impacts.length)],
        context: `Practice session ${i + 1}`
      });
    }
    
    return history.sort((a, b) => b.timestamp - a.timestamp);
  };

  // Generate skill synergies
  const generateSkillSynergies = (skillType: string, agent: any): SkillSynergy[] => {
    const synergies: SkillSynergy[] = [];
    
    // Define skill relationships
    const skillRelations: Record<string, string[]> = {
      'mining': ['construction', 'crafting', 'exploration'],
      'combat': ['defense', 'strategy', 'athletics'],
      'crafting': ['mining', 'construction', 'enchanting'],
      'construction': ['mining', 'crafting', 'architecture'],
      'farming': ['cooking', 'alchemy', 'trading'],
      'magic': ['enchanting', 'potion_making', 'rituals']
    };

    const relatedSkills = skillRelations[skillType] || [];
    
    relatedSkills.forEach((relatedSkill, index) => {
      synergies.push({
        skillId: relatedSkill,
        skillName: relatedSkill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        synergyType: index < 2 ? 'direct' : index < 4 ? 'analogical' : 'creative',
        strength: Math.random() * 50 + 25,
        description: `Skills in ${skillType} and ${relatedSkill} complement each other`
      });
    });

    return synergies;
  };

  // Get skill icon based on type
  const getSkillIcon = (skillType: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      mining: <MilitaryTechIcon />,
      combat: <SportsEsportsIcon />,
      crafting: <BuildIcon />,
      construction: <BuildIcon />,
      farming: <PaletteIcon />,
      magic: <PsychologyIcon />,
      cooking: <FireIcon />,
      exploration: <SpeedIcon />,
      defense: <MilitaryTechIcon />,
      strategy: <PsychologyIcon />,
      athletics: <SpeedIcon />
    };

    return iconMap[skillType] || <SchoolIcon />;
  };

  // Get skill color based on proficiency
  const getSkillColor = (proficiency: number) => {
    if (proficiency >= 90) return theme.palette.success.main;
    if (proficiency >= 75) return theme.palette.primary.main;
    if (proficiency >= 60) return theme.palette.info.main;
    if (proficiency >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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
          <Typography variant="h6">Skill Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {skill && (
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ mr: 2, bgcolor: getSkillColor(skill.proficiency.overall) }}>
                {getSkillIcon(skill.type)}
              </Avatar>
              <Box>
                <Typography variant="h6">{skill.type.replace('_', ' ').toUpperCase()}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Level {skill.proficiency.level} - {skill.proficiency.rank}
                </Typography>
              </Box>
            </Box>
            
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue as number)}>
              <Tab label="Overview" value={0} icon={<SchoolIcon />} />
              <Tab label="Proficiency" value={1} icon={<TrendingUpIcon />} />
              <Tab label="Milestones" value={2} icon={<StarIcon />} />
              <Tab label="History" value={3} icon={<HistoryIcon />} />
              <Tab label="Synergies" value={4} icon={<GroupIcon />} />
            </Tabs>

            {/* Overview Tab */}
            {activeTab === 0 && (
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>Skill Information</Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="body2" color="textSecondary">Type:</Typography>
                          <Chip 
                            label={skill.type.replace('_', ' ')} 
                            size="small" 
                            color={getSkillColor(skill.proficiency.overall) as any}
                          />
                        </Box>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" color="textSecondary">Level:</Typography>
                        <Typography variant="body1">{skill.proficiency.level}</Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" color="textSecondary">Rank:</Typography>
                        <Typography variant="body1">{skill.proficiency.rank}</Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="textSecondary">Experience:</Typography>
                        <Typography variant="body1">{skill.proficiency.experience}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>Overall Proficiency</Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="body2" color="textSecondary">Overall:</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={skill.proficiency.overall}
                            sx={{ flex: 1, ml: 2, height: 8 }}
                            color={getSkillColor(skill.proficiency.overall) as any}
                          />
                        </Box>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="textSecondary">Progress to Next Level:</Typography>
                          <Typography variant="body1">
                            {((skill.proficiency.overall % 20) / 20 * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                </Grid>
              </Box>
            )}

            {/* Proficiency Tab */}
            {activeTab === 1 && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>Proficiency Breakdown</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>Knowledge</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={skill.proficiency.knowledge}
                          sx={{ height: 8, mb: 1 }}
                          color="primary"
                        />
                        <Typography variant="body2" color="textSecondary" align="center">
                          {skill.proficiency.knowledge.toFixed(1)}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>Practical</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={skill.proficiency.practical}
                          sx={{ height: 8, mb: 1 }}
                          color="success"
                        />
                        <Typography variant="body2" color="textSecondary" align="center">
                          {skill.proficiency.practical.toFixed(1)}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>Creative</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={skill.proficiency.creative}
                          sx={{ height: 8, mb: 1 }}
                          color="info"
                        />
                        <Typography variant="body2" color="textSecondary" align="center">
                          {skill.proficiency.creative.toFixed(1)}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Milestones Tab */}
            {activeTab === 2 && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>Skill Milestones</Typography>
                
                <List>
                  {skill.milestones.map((milestone: SkillMilestone, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <StarIcon 
                          color={milestone.unlocked ? "primary" : "disabled"}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={milestone.name}
                        secondary={milestone.description}
                      />
                      <ListItem secondaryAction>
                        <Chip 
                          label={milestone.unlocked ? 'Unlocked' : 'Locked'} 
                          size="small" 
                          color={milestone.unlocked ? "success" : "default" as any}
                        />
                      </ListItem secondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* History Tab */}
            {activeTab === 3 && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>Skill History</Typography>
                
                <List>
                  {skill.history.map((event: SkillHistory, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <HistoryIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={formatTimestamp(event.timestamp)}
                        secondary={`${event.type} - ${event.description}`}
                      />
                      <ListItem secondaryAction>
                        <Typography variant="body2" color="textSecondary">
                          Impact: +{event.impact}
                        </Typography>
                      </ListItem secondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Synergies Tab */}
            {activeTab === 4 && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>Skill Synergies</Typography>
                
                <Accordion>
                  <AccordionSummary expandIcon={<SettingsIcon />}>
                    <Typography variant="subtitle1">Synergy Analysis</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      This skill has {skill.synergies.length} synergistic relationships with other skills.
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Total synergy bonus: {skill.synergies.reduce((sum, s) => sum + s.strength, 0).toFixed(1)}%
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <List>
                  {skill.synergies.map((synergy: SkillSynergy, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <LightbulbIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={synergy.skillName}
                        secondary={`${synergy.synergyType} - ${synergy.description}`}
                      />
                      <ListItem secondaryAction>
                        <Typography variant="body2" color="textSecondary">
                          {synergy.strength.toFixed(1)}%
                        </Typography>
                      </ListItem secondaryAction>
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

export default SkillDetailsModal;