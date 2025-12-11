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
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge
} from '@mui/material';
// Timeline components removed - @mui/lab not available
import {
  CheckCircle,
  RadioButtonUnchecked,
  Star,
  EmojiEvents,
  LockOpen,
  Info,
  Visibility,
  TrendingUp
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useSelector } from 'react-redux';
import {
  selectSkills,
  selectSkillProgression,
  selectSkillMilestones,
  selectAchievements,
  selectSelectedAgent
} from '../../store';
import ErrorBoundary from '../common/ErrorBoundary';
import type {
  Skill,
  SkillProgression,
  SkillMilestone,
  SkillAchievement,
  MilestoneProgress
} from '../../types/skills';

interface MilestoneTrackingProps {
  agentId?: string;
  compact?: boolean;
}

export const MilestoneTracking: React.FC<MilestoneTrackingProps> = ({
  agentId,
  compact = false
}) => {
  const theme = useTheme();
  const selectedAgentId = agentId || useSelector(selectSelectedAgent)?.id;
  const skills = useSelector(selectSkills);
  const progressions = useSelector((state: any) => selectSkillProgression(state, selectedSkillId || ''));
  const milestones = useSelector((state: any) => selectSkillMilestones(state, selectedAgentId || ''));
  const achievements = useSelector(selectAchievements);
  
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [selectedMilestone, setSelectedMilestone] = useState<SkillMilestone | null>(null);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);

  // Get selected skill
  const selectedSkill = useMemo(() => {
    if (!selectedSkillId || !skills) return null;
    const skillsArray = Array.isArray(skills) ? skills : Object.values(skills || {});
    return skillsArray.find((skill: any) => skill.id === selectedSkillId) || null;
  }, [selectedSkillId, skills]);

  // Get selected skill progression
  const selectedProgression = useMemo(() => {
    return progressions;
  }, [progressions]);

  // Get milestones for selected skill
  const selectedSkillMilestones = useMemo(() => {
    if (!milestones) return [];
    
    return milestones
      .filter((milestone: any) => milestone.skillId === selectedSkillId)
      .sort((a: any, b: any) => a.requirements.proficiency - b.requirements.proficiency);
  }, [selectedSkillId, milestones]);

  // Get achievements for selected skill
  const selectedSkillAchievements = useMemo(() => {
    if (!achievements) return [];
    
    const achievementsArray = Array.isArray(achievements) ? achievements : Object.values(achievements || {});
    return achievementsArray
      .filter((achievement: any) => achievement.skillId === selectedSkillId)
      .sort((a: any, b: any) => (b.earnedAt || 0) - (a.earnedAt || 0));
  }, [selectedSkillId, achievements]);

  // Calculate milestone progress
  const milestoneProgressData = useMemo(() => {
    if (!selectedProgression?.milestoneProgress) return [];
    
    return selectedProgression.milestoneProgress.map((progress: MilestoneProgress) => {
      const milestone = milestones.find((m: any) => m.id === progress.milestoneId);
      return {
        ...progress,
        milestone,
        percentage: progress.currentProgress * 100
      };
    });
  }, [selectedProgression, milestones]);

  // Prepare milestone timeline data
  const timelineData = useMemo(() => {
    const data: any[] = [];
    
    selectedSkillMilestones.forEach((milestone: any) => {
      const progress = milestoneProgressData.find(p => p.milestoneId === milestone.id);
      data.push({
        id: milestone.id,
        name: milestone.name,
        description: milestone.description,
        threshold: milestone.requirements.proficiency,
        achieved: progress?.achievedAt || false,
        progress: progress?.currentProgress || 0,
        unlocks: milestone.unlocks || [],
        achievedAt: progress?.achievedAt || null
      });
    });
    
    return data;
  }, [selectedSkillMilestones, milestoneProgressData]);

  // Prepare milestone completion chart data
  const completionChartData = useMemo(() => {
    return timelineData.map((item: any) => ({
      name: item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name,
      progress: Math.round(item.progress * 100),
      threshold: item.threshold,
      achieved: item.achieved ? 100 : 0
    }));
  }, [timelineData]);

  // Calculate milestone statistics
  const milestoneStats = useMemo(() => {
    const total = selectedSkillMilestones.length;
    const achieved = selectedSkillMilestones.filter((m: any) => 
      milestoneProgressData.find(p => p.milestoneId === m.id)?.achievedAt
    ).length;
    const inProgress = selectedSkillMilestones.filter((m: any) => {
      const progress = milestoneProgressData.find(p => p.milestoneId === m.id);
      return progress && !progress.achievedAt && progress.currentProgress > 0;
    }).length;
    const locked = total - achieved - inProgress;
    
    return { total, achieved, inProgress, locked };
  }, [selectedSkillMilestones, milestoneProgressData]);

  // Initialize selected skill
  useEffect(() => {
    if (skills && Object.keys(skills).length > 0 && !selectedSkillId) {
      const firstSkill = Object.values(skills)[0] as Skill;
      setSelectedSkillId(firstSkill.id);
    }
  }, [skills, selectedSkillId]);

  // Handle skill selection
  const handleSkillChange = (event: any) => {
    setSelectedSkillId(event.target.value);
  };

  // Handle milestone detail view
  const handleMilestoneClick = (milestone: SkillMilestone) => {
    setSelectedMilestone(milestone);
    setMilestoneDialogOpen(true);
  };

  // Get milestone status icon
  const getMilestoneIcon = (milestone: any) => {
    const progress = milestoneProgressData.find(p => p.milestoneId === milestone.id);
    if (progress?.achievedAt) {
      return <CheckCircle color="success" />;
    } else if (progress && progress.currentProgress > 0) {
      return <TrendingUp color="warning" />;
    } else {
      return <RadioButtonUnchecked color="disabled" />;
    }
  };

  // Get milestone status color
  const getMilestoneColor = (milestone: any) => {
    const progress = milestoneProgressData.find(p => p.milestoneId === milestone.id);
    if (progress?.achievedAt) {
      return 'success';
    } else if (progress && progress.currentProgress > 0) {
      return 'warning';
    } else {
      return 'disabled';
    }
  };

  // Render milestone timeline
  const renderMilestoneTimeline = () => {
    if (timelineData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No milestones available for this skill
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 0 }}>
        {timelineData.map((milestone: any, index: number) => (
          <Box key={milestone.id} sx={{ display: 'flex', mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: getMilestoneColor(milestone) === 'success' ? theme.palette.success.main :
                                 getMilestoneColor(milestone) === 'warning' ? theme.palette.warning.main :
                                 theme.palette.grey[300]
              }}>
                {getMilestoneIcon(milestone)}
              </Box>
              {index < timelineData.length - 1 && (
                <Box sx={{
                  width: 2,
                  height: 60,
                  backgroundColor: theme.palette.grey[300],
                  mt: 1
                }} />
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04)
                  }
                }}
                onClick={() => handleMilestoneClick(milestone)}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {milestone.name}
                    </Typography>
                    <Chip
                      label={`${Math.round(milestone.progress * 100)}%`}
                      size="small"
                      color={getMilestoneColor(milestone) as any}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {milestone.description}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={milestone.progress * 100}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Proficiency Required: {milestone.requirements.proficiency}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    Experience Required: {milestone.requirements.experience}
                  </Typography>
                  {milestone.achievedAt && (
                    <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                      Achieved: {new Date(milestone.achievedAt).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  // Render completion chart
  const renderCompletionChart = () => {
    if (completionChartData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No completion data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={completionChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="progress" fill={theme.palette.primary.main} name="Progress" />
          <Bar dataKey="achieved" fill={theme.palette.success.main} name="Achieved" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'grid', gap: 3 }}>
        {/* Controls */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Milestone Tracking
              </Typography>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' },
                gap: 2,
                alignItems: 'center'
              }}>
                <Box>
                  <FormControl fullWidth size="small">
                    <InputLabel>Skill</InputLabel>
                    <Select
                      value={selectedSkillId}
                      onChange={handleSkillChange}
                      label="Skill"
                    >
                      {skills && Object.values(skills).map((skill: any) => (
                        <MenuItem key={skill.id} value={skill.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {skill.type.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase())}
                            </Typography>
                            <Chip
                              label={`${Math.round(skill.proficiency.overall * 100)}%`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Badge badgeContent={milestoneStats.achieved} color="success">
                      <Chip
                        icon={<EmojiEvents />}
                        label="Achieved"
                        color="success"
                        variant="outlined"
                      />
                    </Badge>
                    <Badge badgeContent={milestoneStats.inProgress} color="warning">
                      <Chip
                        icon={<TrendingUp />}
                        label="In Progress"
                        color="warning"
                        variant="outlined"
                      />
                    </Badge>
                    <Badge badgeContent={milestoneStats.locked} color="default">
                      <Chip
                        icon={<LockOpen />}
                        label="Locked"
                        color="default"
                        variant="outlined"
                      />
                    </Badge>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Milestone Timeline */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { lg: '2fr 1fr' },
          gap: 3
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Milestone Progress
              </Typography>
              <Box sx={{ maxHeight: compact ? 400 : 600, overflow: 'auto' }}>
                {renderMilestoneTimeline()}
              </Box>
            </CardContent>
          </Card>

          {/* Completion Chart */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Completion Overview
              </Typography>
              {renderCompletionChart()}
            </CardContent>
          </Card>
        </Box>

        {/* Recent Achievements */}
        {selectedSkillAchievements.length > 0 && (
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Achievements
                </Typography>
                <List dense>
                  {selectedSkillAchievements.slice(0, 5).map((achievement: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <Star />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={achievement.name}
                        secondary={achievement.description}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Milestone Detail Dialog */}
        <Dialog
          open={milestoneDialogOpen}
          onClose={() => setMilestoneDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedMilestone?.name}
            <IconButton
              sx={{ position: 'absolute', right: 8, top: 8 }}
              onClick={() => setMilestoneDialogOpen(false)}
            >
              <Info />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedMilestone && (
              <Box>
                <Typography variant="body1" paragraph>
                  {selectedMilestone.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Proficiency Required: {selectedMilestone.requirements.proficiency || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Experience Required: {selectedMilestone.requirements.experience || 'N/A'}
                </Typography>
                {selectedMilestone.unlocks && selectedMilestone.unlocks.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Unlocks:
                    </Typography>
                    <List dense>
                      {selectedMilestone.unlocks.map((unlock: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <LockOpen color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={unlock} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMilestoneDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ErrorBoundary>
  );
};

export default MilestoneTracking;