import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Divider
} from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import {
  Compare,
  Timeline,
  Assessment,
  TrendingUp,
  Person,
  Refresh,
  Download
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import {
  selectSkills,
  selectAllAgents,
  selectSelectedAgent
} from '../../store';
import ErrorBoundary from '../common/ErrorBoundary';
import type {
  Skill,
  SkillProgression
} from '../../types/skills';

interface SkillComparisonProps {
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
      id={`comparison-tabpanel-${index}`}
      aria-labelledby={`comparison-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SkillComparison: React.FC<SkillComparisonProps> = ({
  agentId,
  compact = false
}) => {
  const theme = useTheme();
  const selectedAgent = useSelector(selectSelectedAgent);
  const selectedAgentId = agentId || selectedAgent?.id || '';
  const skills = useSelector(selectSkills);
  const agents = useSelector(selectAllAgents);
  
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [comparisonMode, setComparisonMode] = useState<'skills' | 'agents'>('skills');

  // Get selected skills
  const selectedSkills = useMemo(() => {
    if (!skills) return [];
    return selectedSkillIds.map(id => skills.find((skill: Skill) => skill.id === id)).filter((skill): skill is Skill => skill !== undefined);
  }, [selectedSkillIds, skills]);

  // Get selected agents
  const selectedAgents = useMemo(() => {
    if (!agents) return [];
    return selectedAgentIds.map(id =>
      Array.isArray(agents) ? agents.find((agent: any) => agent.id === id) : undefined
    ).filter((agent): agent is any => agent !== undefined);
  }, [selectedAgentIds, agents]);

  // Prepare skill comparison data
  const skillComparisonData = useMemo(() => {
    if (selectedSkills.length === 0) return [];
    
    return selectedSkills.map(skill => {
      return {
        id: skill.id || '',
        name: skill.type ? skill.type.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase()) : '',
        overall: Math.round((skill.proficiency?.overall || 0) * 100),
        knowledge: Math.round((skill.proficiency?.knowledge || 0) * 100),
        practical: Math.round((skill.proficiency?.practical || 0) * 100),
        creative: Math.round((skill.proficiency?.creative || 0) * 100),
        experience: skill.metadata?.totalExperience || 0,
        usageCount: skill.usage?.totalUses || 0,
        successRate: skill.usage?.recentPerformance?.successRate || 0,
        learningRate: skill.learning?.learningRate || 0,
        adaptability: skill.learning?.personalityFactors?.openness || 0
      };
    });
  }, [selectedSkills]);

  // Prepare agent skill comparison data
  const agentSkillComparisonData = useMemo(() => {
    if (selectedAgents.length === 0 || !skills) return [];
    
    const skillCategories = ['COMBAT', 'CRAFTING', 'EXPLORATION', 'SOCIAL', 'RESOURCE_GATHERING'];
    
    return skillCategories.map(category => {
      const data: any = { category };
      
      selectedAgents.forEach(agent => {
        const agentSkills = skills.filter((skill: any) =>
          skill.type === category
        );
        
        if (agentSkills.length > 0) {
          const avgProficiency = agentSkills.reduce((sum: number, skill: any) =>
            sum + skill.proficiency.overall, 0) / agentSkills.length;
          data[agent.id] = Math.round(avgProficiency * 100);
        }
      });
      
      return data;
    });
  }, [selectedAgents, skills]);

  // Prepare radar chart data for skill comparison
  const skillRadarData = useMemo(() => {
    if (selectedSkills.length === 0) return [];
    
    const metrics = ['overall', 'knowledge', 'practical', 'creative', 'learningRate', 'adaptability'];
    
    return metrics.map(metric => {
      const data: any = { metric: metric.replace(/([A-Z])/g, ' $1').trim() };
      
      selectedSkills.forEach(skill => {
        const value = metric === 'learningRate' 
          ? Math.round((skill.learning as any)[metric] * 100)
          : metric === 'adaptability'
          ? Math.round((skill.learning as any)[metric] * 100)
          : Math.round((skill.proficiency as any)[metric] * 100);
        data[skill.id] = value;
      });
      
      return data;
    });
  }, [selectedSkills]);

  // Prepare time series comparison data
  const timeSeriesComparisonData = useMemo(() => {
    if (selectedSkills.length === 0) return [];
    
    // Generate sample time series data for the last 30 days
    const data = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - (i * dayMs));
      const dayData: any = {
        date: date.toLocaleDateString(),
        timestamp: date.getTime()
      };
      
      selectedSkills.forEach(skill => {
        // Generate mock experience data for now since we don't have progression data
        const mockExp = Math.floor(Math.random() * 50) + 10;
        dayData[skill.id] = mockExp;
      });
      
      data.push(dayData);
    }
    
    return data;
  }, [selectedSkills]);

  // Initialize selections
  useEffect(() => {
    if (skills && Array.isArray(skills) && skills.length > 0 && selectedSkillIds.length === 0) {
      setSelectedSkillIds(skills.slice(0, 3).map(skill => skill.id));
    }
    
    if (agents && Array.isArray(agents) && agents.length > 0 && selectedAgentIds.length === 0) {
      setSelectedAgentIds(agents.slice(0, 3).map((agent: any) => agent.id));
    }
  }, [skills, agents, selectedSkillIds.length, selectedAgentIds.length]);

  // Handle skill selection
  const handleSkillSelection = (event: any) => {
    setSelectedSkillIds(event.target.value);
  };

  // Handle agent selection
  const handleAgentSelection = (event: any) => {
    setSelectedAgentIds(event.target.value);
  };

  // Handle tab change
  const handleTabChange = (event: any, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle mode change
  const handleModeChange = (mode: 'skills' | 'agents') => {
    setComparisonMode(mode);
    setActiveTab(0);
  };

  // Get skill color
  const getSkillColor = (index: number) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main
    ];
    return colors[index % colors.length];
  };

  // Get agent color
  const getAgentColor = (index: number) => {
    const colors = [
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.primary.main
    ];
    return colors[index % colors.length];
  };

  // Render skill comparison chart
  const renderSkillComparisonChart = () => {
    if (skillComparisonData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            Select skills to compare
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={compact ? 300 : 400}>
        <BarChart data={skillComparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          {selectedSkills.map((skill, index) => (
            <Bar 
              key={skill.id}
              dataKey="overall" 
              fill={getSkillColor(index)}
              name={skill.type.replace('_', ' ')}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render agent skill comparison chart
  const renderAgentSkillComparisonChart = () => {
    if (agentSkillComparisonData.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            Select agents to compare
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={compact ? 300 : 400}>
        <BarChart data={agentSkillComparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis domain={[0, 100]} />
          <RechartsTooltip />
          <Legend />
          {selectedAgents.map((agent, index) => (
            <Bar 
              key={agent.id}
              dataKey={agent.id} 
              fill={getAgentColor(index)}
              name={agent.name || agent.id}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render radar chart
  const renderRadarChart = () => {
    const data = comparisonMode === 'skills' ? skillRadarData : agentSkillComparisonData;
    const items = comparisonMode === 'skills' ? selectedSkills : selectedAgents;
    
    if (data.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No data available for comparison
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={compact ? 300 : 400}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          {items.map((item, index) => (
            <Radar
              key={item.id}
              name={comparisonMode === 'skills' 
                ? (item as Skill).type.replace('_', ' ')
                : (item as any).name || item.id
              }
              dataKey={item.id}
              stroke={comparisonMode === 'skills' ? getSkillColor(index) : getAgentColor(index)}
              fill={comparisonMode === 'skills' ? getSkillColor(index) : getAgentColor(index)}
              fillOpacity={0.3}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  // Render time series comparison
  const renderTimeSeriesComparison = () => {
    const data = comparisonMode === 'skills' ? timeSeriesComparisonData : [];
    const items = comparisonMode === 'skills' ? selectedSkills : [];
    
    if (data.length === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No time series data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={compact ? 300 : 400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          {items.map((item, index) => (
            <Line
              key={item.id}
              type="monotone"
              dataKey={item.id}
              stroke={getSkillColor(index)}
              strokeWidth={2}
              name={comparisonMode === 'skills' 
                ? (item as Skill).type.replace('_', ' ')
                : (item as any).name || item.id
              }
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: '1fr' }}>
        {/* Controls */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Skill Comparison
              </Typography>
              <Box>
                <Button
                  variant={comparisonMode === 'skills' ? 'contained' : 'outlined'}
                  onClick={() => handleModeChange('skills')}
                  sx={{ mr: 1 }}
                >
                  Compare Skills
                </Button>
                <Button
                  variant={comparisonMode === 'agents' ? 'contained' : 'outlined'}
                  onClick={() => handleModeChange('agents')}
                >
                  Compare Agents
                </Button>
                <Tooltip title="Refresh Data">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export Data">
                  <IconButton size="small">
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {comparisonMode === 'skills' ? (
              <FormControl fullWidth size="small">
                <InputLabel>Select Skills</InputLabel>
                <Select
                  multiple
                  value={selectedSkillIds}
                  onChange={handleSkillSelection}
                  label="Select Skills"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value: string) => {
                        const skill = skills?.find((skill: Skill) => skill.id === value);
                        return (
                          <Chip
                            key={value}
                            label={skill ? skill.type.replace('_', ' ') : value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {skills && Array.isArray(skills) && skills.map((skill: any) => (
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
            ) : (
              <FormControl fullWidth size="small">
                <InputLabel>Select Agents</InputLabel>
                <Select
                  multiple
                  value={selectedAgentIds}
                  onChange={handleAgentSelection}
                  label="Select Agents"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value: string) => {
                        const agent = Array.isArray(agents) ? agents.find((agent: any) => agent.id === value) : undefined;
                        return (
                          <Chip
                            key={value}
                            label={agent ? (agent.name || agent.id) : value}
                            size="small"
                            avatar={<Avatar sx={{ width: 20, height: 20 }}><Person /></Avatar>}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {agents && Array.isArray(agents) && agents.map((agent: any) => (
                    <MenuItem key={agent.id} value={agent.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          <Person />
                        </Avatar>
                        <Typography variant="body2">
                          {agent.name || agent.id}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </CardContent>
        </Card>

        {/* Selected Items Summary */}
        <Card>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              {comparisonMode === 'skills' ? 'Selected Skills' : 'Selected Agents'}
            </Typography>
            <List dense>
              {(comparisonMode === 'skills' ? selectedSkills : selectedAgents).map((item, index) => (
                <ListItem key={item.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: comparisonMode === 'skills' ? getSkillColor(index) : getAgentColor(index) }}>
                      {comparisonMode === 'skills' ? (
                        <Assessment />
                      ) : (
                        <Person />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={comparisonMode === 'skills'
                      ? (item as Skill).type.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase())
                      : (item as any).name || item.id
                    }
                    secondary={comparisonMode === 'skills'
                      ? `Proficiency: ${Math.round((item as Skill).proficiency.overall * 100)}%`
                      : 'Agent comparison'
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Comparison Charts */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Bar Chart" />
              <Tab label="Radar Chart" />
              {comparisonMode === 'skills' && <Tab label="Time Series" />}
            </Tabs>
          </Box>
          <TabPanel value={activeTab} index={0}>
            {comparisonMode === 'skills' ? renderSkillComparisonChart() : renderAgentSkillComparisonChart()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderRadarChart()}
          </TabPanel>
          {comparisonMode === 'skills' && (
            <TabPanel value={activeTab} index={2}>
              {renderTimeSeriesComparison()}
            </TabPanel>
          )}
        </Card>
      </Box>
    </ErrorBoundary>
  );
};

export default SkillComparison;