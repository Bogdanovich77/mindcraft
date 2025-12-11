import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  LinearProgress,
  Badge,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Lightbulb,
  TrendingUp,
  School,
  Star,
  CheckCircle,
  ArrowForward,
  Refresh,
  Download,
  Assessment,
  Insights,
  Psychology,
  Speed,
  Groups,
  Build
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import {
  selectSkills,
  selectSkillProgression,
  selectSelectedSkillId,
  selectSkillsInsights
} from '../../store/slices/skillsSlice';
import ErrorBoundary from '../common/ErrorBoundary';
import type {
  Skill,
  SkillProgression,
  SkillRecommendation,
  SkillInsight
} from '../../types/skills';

interface SkillRecommendationsProps {
  agentId?: string;
  compact?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recommendation-tabpanel-${index}`}
      aria-labelledby={`recommendation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SkillRecommendations: React.FC<SkillRecommendationsProps> = ({
  agentId,
  compact = false
}) => {
  const theme = useTheme();
  const selectedAgentId = agentId || useSelector((state: any) => state.agents.selectedAgentId);
  const skills = useSelector(selectSkills);
  const progressions = useSelector((state: any) => state.skills.progressions);
  const insights = useSelector(selectSkillsInsights);
  
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [recommendationType, setRecommendationType] = useState<'all' | 'improvement' | 'synergy' | 'milestone'>('all');

  // Get selected skill
  const selectedSkill = useMemo(() => {
    if (!selectedSkillId || !skills) return null;
    return skills.find((skill: Skill) => skill.id === selectedSkillId) || null;
  }, [selectedSkillId, skills]);

  // Get selected skill progression
  const selectedProgression = useMemo(() => {
    if (!selectedSkillId || !progressions) return null;
    return progressions.get(selectedSkillId) || null;
  }, [selectedSkillId, progressions]);

  // Generate skill recommendations
  const skillRecommendations = useMemo(() => {
    if (!skills || !progressions) return [];
    
    const recommendations: any[] = [];
    
    skills.forEach((skill: any) => {
      const progression = progressions.get(skill.id);
      
      if (!progression) return;
      
      // Improvement recommendations
      if (skill.proficiency.overall < 0.7) {
        recommendations.push({
          id: `improvement_${skill.id}`,
          type: 'practice' as any,
          priority: 'high' as any,
          title: `Improve ${skill.type.replace('_', ' ').toLowerCase()} proficiency`,
          description: `Focus on practical application to increase overall proficiency from ${Math.round(skill.proficiency.overall * 100)}% to 75%`,
          rationale: 'Current proficiency is below optimal level',
          expectedBenefits: {
            learningGain: 0.8,
            efficiencyImprovement: 0.6,
            synergyUnlock: []
          },
          actionItems: [
            'Practice daily exercises',
            'Seek expert guidance',
            'Apply in real scenarios'
          ],
          estimatedTime: 14 * 24 * 60 * 60 * 1000, // 2 weeks
          difficulty: 0.6,
          context: ['training', 'solo'],
          prerequisites: [],
          validUntil: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
          confidence: 0.8
        });
      }
      
      // Synergy recommendations
      if (progression.synergies && progression.synergies.length > 0) {
        progression.synergies.forEach((synergy: any) => {
          if (synergy.strength > 0.5) {
            recommendations.push({
              id: `synergy_${skill.id}_${synergy.targetSkillId}`,
              type: 'collaborate' as any,
              priority: 'medium' as any,
              title: `Leverage synergy with ${synergy.targetSkillId}`,
              description: `Strong synergy detected (${Math.round(synergy.strength * 100)}%). Focus on combined practice for accelerated learning.`,
              rationale: `Strong synergy between skills can accelerate learning`,
              expectedBenefits: {
                learningGain: synergy.strength,
                efficiencyImprovement: 0.4,
                synergyUnlock: [synergy.targetSkillId]
              },
              actionItems: [
                `Practice ${skill.type} and ${synergy.targetSkillId} together`,
                'Find combined application scenarios',
                'Study cross-skill techniques'
              ],
              estimatedTime: 7 * 24 * 60 * 60 * 1000, // 1 week
              difficulty: 0.4,
              context: ['collaboration', 'practice'],
              prerequisites: [synergy.targetSkillId],
              validUntil: Date.now() + 21 * 24 * 60 * 60 * 1000, // 21 days
              confidence: 0.7
            });
          }
        });
      }
      
      // Milestone recommendations
      if (progression.milestoneProgress) {
        const upcomingMilestones = progression.milestoneProgress
          .filter((milestone: any) => !milestone.achievedAt && milestone.currentProgress > 0.3)
          .slice(0, 3);
        
        upcomingMilestones.forEach((milestone: any) => {
          recommendations.push({
            id: `milestone_${milestone.milestoneId}`,
            type: 'challenge' as any,
            priority: 'medium' as any,
            title: `Complete milestone: ${milestone.milestoneId}`,
            description: `You're ${Math.round(milestone.currentProgress * 100)}% towards this milestone. Focus on specific requirements to achieve it.`,
            rationale: 'Milestone completion unlocks new abilities',
            expectedBenefits: {
              learningGain: 0.7,
              efficiencyImprovement: milestone.currentProgress < 0.7 ? 0.8 : 0.3,
              synergyUnlock: []
            },
            actionItems: [
              'Focus on milestone-specific tasks',
              'Practice required techniques',
              'Seek feedback on progress'
            ],
            estimatedTime: milestone.currentProgress < 0.7 ? 21 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
            difficulty: milestone.currentProgress < 0.7 ? 0.8 : 0.3,
            context: ['challenge', 'practice'],
            prerequisites: [],
            validUntil: Date.now() + 30 * 24 * 60 * 60 * 1000,
            confidence: 0.75
          });
        });
      }
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    });
  }, [skills, progressions]);

  // Filter recommendations by type
  const filteredRecommendations = useMemo(() => {
    if (recommendationType === 'all') return skillRecommendations;
    return skillRecommendations.filter(rec => rec.type === recommendationType);
  }, [skillRecommendations, recommendationType]);

  // Generate skill insights
  const skillInsights = useMemo(() => {
    if (!skills || !progressions) return [];
    
    const insights: any[] = [];
    
    // Overall skill distribution analysis
    const skillList = skills as Skill[];
    const avgProficiency = skillList.reduce((sum, skill) => sum + skill.proficiency.overall, 0) / skillList.length;
    
    insights.push({
      id: 'overall_distribution',
      type: 'opportunity' as any,
      title: 'Overall Skill Distribution',
      description: `Your average proficiency across all skills is ${Math.round(avgProficiency * 100)}%. Consider balancing your skill development.`,
      confidence: 0.9,
      impact: 'medium' as any,
      actionable: true,
      timestamp: Date.now()
    });
    
    // Learning pattern insights
    const recentProgress = skillList.filter(skill => {
      const progression = progressions.get(skill.id);
      return progression && progression.performanceTrends && progression.performanceTrends.length > 0;
    });
    
    if (recentProgress.length > 0) {
      const avgLearningVelocity = recentProgress.reduce((sum, skill) => {
        const progression = progressions.get(skill.id);
        const latestTrend = progression.performanceTrends[progression.performanceTrends.length - 1];
        return sum + (latestTrend as any).value || 0;
      }, 0) / recentProgress.length;
      
      insights.push({
        id: 'learning_pattern',
        type: 'trend' as any,
        title: 'Learning Pattern Analysis',
        description: `Your average learning velocity is ${Math.round(avgLearningVelocity * 100)}%. ${
          avgLearningVelocity > 0.7 ? 'You have excellent learning capacity!' :
          avgLearningVelocity > 0.5 ? 'Your learning is steady and consistent.' :
          'Consider trying new learning approaches to improve velocity.'
        }`,
        confidence: 0.8,
        impact: avgLearningVelocity < 0.7 ? 'high' as any : 'medium' as any,
        actionable: avgLearningVelocity < 0.7,
        timestamp: Date.now()
      });
    }
    
    return insights;
  }, [skills, progressions]);

  // Initialize selected skill
  useEffect(() => {
    if (skills && skills.length > 0 && !selectedSkillId) {
      const firstSkill = skills[0] as Skill;
      setSelectedSkillId(firstSkill.id);
    }
  }, [skills, selectedSkillId]);

  // Handle skill selection
  const handleSkillChange = (event: any) => {
    setSelectedSkillId(event.target.value);
  };

  // Handle tab change
  const handleTabChange = (event: any, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle recommendation type change
  const handleRecommendationTypeChange = (type: 'all' | 'improvement' | 'synergy' | 'milestone') => {
    setRecommendationType(type);
  };

  // Get recommendation icon
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'practice':
        return <TrendingUp color="primary" />;
      case 'collaborate':
        return <Groups color="secondary" />;
      case 'challenge':
        return <Star color="warning" />;
      default:
        return <Lightbulb color="action" />;
    }
  };

  // Get recommendation color
  const getRecommendationColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get insight icon
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Assessment color="primary" />;
      case 'trend':
        return <Psychology color="secondary" />;
      case 'strength':
        return <Speed color="success" />;
      default:
        return <Insights color="action" />;
    }
  };

  // Render recommendations list
  const renderRecommendationsList = () => {
    if (filteredRecommendations.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No recommendations available
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {filteredRecommendations.map((recommendation, index) => (
          <ListItem key={recommendation.id} sx={{ mb: 2 }}>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {getRecommendationIcon(recommendation.type)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">
                        {recommendation.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={recommendation.priority}
                          size="small"
                          color={getRecommendationColor(recommendation.priority) as any}
                        />
                        <Chip
                          label={(recommendation as any).timeframe || 'Unknown'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {recommendation.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Expected Benefits
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" gutterBottom>
                              Learning Gain
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={(recommendation as any).expectedBenefits?.learningGain * 100 || 0}
                              color="primary"
                            />
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" gutterBottom>
                              Efficiency Improvement
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={(recommendation as any).expectedBenefits?.efficiencyImprovement * 100 || 0}
                              color="secondary"
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Action Items
                      </Typography>
                      <List dense>
                        {(recommendation as any).actionItems?.map((action: any, actionIndex: number) => (
                          <ListItem key={actionIndex} sx={{ py: 0.5 }}>
                            <CheckCircle sx={{ mr: 1, color: 'success.main', fontSize: 16 }} />
                            <Typography variant="body2">{action}</Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(recommendation as any).rationale}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Estimated time: {Math.round(((recommendation as any).estimatedTime || 0) / (24 * 60 * 60 * 1000))} days |
                        Difficulty: {Math.round(((recommendation as any).difficulty || 0) * 100)}% |
                        Confidence: {Math.round(((recommendation as any).confidence || 0) * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
    );
  };

  // Render insights list
  const renderInsightsList = () => {
    if (skillInsights.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No insights available
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {skillInsights.map((insight: any, index: number) => (
          <ListItem key={insight.id || index} sx={{ mb: 2 }}>
            <Alert
              severity={insight.actionable ? 'info' : 'success'}
              sx={{ width: '100%' }}
            >
              <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getInsightIcon(insight.type)}
                {insight.title}
              </AlertTitle>
              <Typography variant="body2">
                {insight.description}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Confidence: {Math.round(insight.confidence * 100)}% |
                  Impact: {insight.impact}
                </Typography>
              </Box>
            </Alert>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <ErrorBoundary>
      <Grid container spacing={3}>
        {/* Controls */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Skill Recommendations & Insights
                </Typography>
                <Box>
                  <Tooltip title="Refresh Recommendations">
                    <IconButton size="small">
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export Insights">
                    <IconButton size="small">
                      <Download />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter by Type</InputLabel>
                    <Select
                      value={recommendationType}
                      onChange={(e) => handleRecommendationTypeChange(e.target.value as any)}
                      label="Filter by Type"
                    >
                      <MenuItem value="all">All Recommendations</MenuItem>
                      <MenuItem value="improvement">Improvement Focus</MenuItem>
                      <MenuItem value="synergy">Skill Synergies</MenuItem>
                      <MenuItem value="milestone">Milestone Goals</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Badge badgeContent={filteredRecommendations.length} color="primary">
                      <Chip
                        icon={<Lightbulb />}
                        label="Recommendations"
                        color="primary"
                        variant="outlined"
                      />
                    </Badge>
                    <Badge badgeContent={skillInsights.length} color="secondary">
                      <Chip
                        icon={<Insights />}
                        label="Insights"
                        color="secondary"
                        variant="outlined"
                      />
                    </Badge>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                    Generated: {new Date().toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations and Insights */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label={`Recommendations (${filteredRecommendations.length})`} />
                <Tab label={`Insights (${skillInsights.length})`} />
              </Tabs>
            </Box>
            <TabPanel value={activeTab} index={0}>
              {renderRecommendationsList()}
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              {renderInsightsList()}
            </TabPanel>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<TrendingUp />}
                    onClick={() => setRecommendationType('improvement')}
                  >
                    Focus on Improvements
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Groups />}
                    onClick={() => setRecommendationType('synergy')}
                  >
                    Explore Synergies
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Star />}
                    onClick={() => setRecommendationType('milestone')}
                  >
                    Milestone Planning
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Build />}
                    onClick={() => setActiveTab(1)}
                  >
                    View Insights
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ErrorBoundary>
  );
};

export default SkillRecommendations;