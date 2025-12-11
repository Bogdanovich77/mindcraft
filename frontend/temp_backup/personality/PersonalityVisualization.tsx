import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  selectPersonalityState,
  selectSelectedAgentPersonality,
  selectPersonalityLoading,
  selectPersonalityError,
  selectVisualizationMode,
  selectFilters,
  setVisualizationMode,
  setTraitCategories,
  selectAgent
} from '../../store/slices/personalitySlice';
import type { PersonalityEvolution, PersonalityVisualizationProps } from '../../types/personality';
import type { PersonalityTraits } from '../../types/agent';

// Import child components
import {
  TraitsRadarChart,
  GamingTraitsChart,
  PersonalityTimeline,
  BehavioralMatrix,
  TraitComparison,
  CorrelationAnalysis
} from './index';

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
      id={`personality-tabpanel-${index}`}
      aria-labelledby={`personality-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PersonalityVisualization: React.FC<PersonalityVisualizationProps> = ({
  agentId,
  data,
  config,
  onTraitClick,
  onEventClick,
  className
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  // Redux state
  const personalityState = useAppSelector(selectPersonalityState);
  const selectedAgentPersonality = useAppSelector(selectSelectedAgentPersonality);
  const loading = useAppSelector(selectPersonalityLoading);
  const error = useAppSelector(selectPersonalityError);
  const visualizationMode = useAppSelector(selectVisualizationMode);
  const filters = useAppSelector(selectFilters);

  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [selectedTraitCategory, setSelectedTraitCategory] = useState<'big_five' | 'gaming_specific' | 'all'>('all');

  // Initialize agent selection
  useEffect(() => {
    if (agentId && !personalityState.ui.selectedAgent) {
      dispatch(selectAgent(agentId));
    }
  }, [agentId, dispatch, personalityState.ui.selectedAgent]);

  // Handle tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Update visualization mode based on tab
    const modes: Array<'radar' | 'timeline' | 'matrix' | 'comparison' | 'correlation'> = [
      'radar', 'timeline', 'matrix', 'comparison', 'correlation'
    ];
    
    if (newValue < modes.length) {
      dispatch(setVisualizationMode(modes[newValue]));
    }
  };

  // Handle trait category filter
  const handleTraitCategoryChange = (event: any) => {
    const category = event.target.value;
    setSelectedTraitCategory(category);
    
    if (category === 'all') {
      dispatch(setTraitCategories(['big_five', 'gaming_specific']));
    } else {
      dispatch(setTraitCategories([category]));
    }
  };

  // Memoize current personality data
  const currentPersonality = useMemo(() => {
    return data || selectedAgentPersonality;
  }, [data, selectedAgentPersonality]);

  // Memoize Big Five traits for radar chart
  const bigFiveTraits = useMemo(() => {
    if (!currentPersonality) return [];
    
    const traits = currentPersonality.traits;
    return [
      { trait: 'Openness', value: traits.openness, fill: theme.palette.primary.main },
      { trait: 'Conscientiousness', value: traits.conscientiousness, fill: theme.palette.secondary.main },
      { trait: 'Extraversion', value: traits.extraversion, fill: theme.palette.success.main },
      { trait: 'Agreeableness', value: traits.agreeableness, fill: theme.palette.warning.main },
      { trait: 'Neuroticism', value: traits.neuroticism, fill: theme.palette.error.main }
    ];
  }, [currentPersonality, theme]);

  // Memoize gaming traits for visualization
  const gamingTraits = useMemo(() => {
    if (!currentPersonality) return null;
    
    const traits = currentPersonality.traits;
    return {
      traits: {
        riskTolerance: traits.riskTolerance,
        creativity: traits.creativity,
        patience: traits.patience,
        competitiveness: traits.competitiveness,
        curiosity: traits.curiosity
      },
      descriptions: {
        riskTolerance: 'Willingness to take risks in dangerous situations',
        creativity: 'Creative problem-solving and building abilities',
        patience: 'Ability to wait and persist with long-term tasks',
        competitiveness: 'Drive to compete and win against others',
        curiosity: 'Desire to explore and discover new things'
      },
      categories: {
        riskTolerance: 'Combat',
        creativity: 'Building',
        patience: 'Resource Gathering',
        competitiveness: 'Social',
        curiosity: 'Exploration'
      }
    };
  }, [currentPersonality]);

  // Memoize timeline data
  const timelineData = useMemo(() => {
    if (!currentPersonality) return [];
    return [currentPersonality]; // Convert single evolution to array
  }, [currentPersonality]);

  // Memoize behavioral patterns
  const behavioralPatterns = useMemo(() => {
    if (!currentPersonality) return [];
    // Create mock behavioral patterns based on traits
    const traits = currentPersonality.traits;
    return [
      {
        id: 'exploration_pattern',
        name: 'Exploration Pattern',
        description: 'Tendency to explore new areas',
        traits: traits,
        frequency: traits.openness * 0.8,
        confidence: 0.7,
        contexts: ['cave_exploration', 'surface_mining'],
        outcomes: {
          success: 0.8,
          failure: 0.2,
          efficiency: traits.conscientiousness
        }
      }
    ];
  }, [currentPersonality]);

  // Memoize behavioral influences
  const behavioralInfluences = useMemo(() => {
    if (!currentPersonality) return [];
    const traits = currentPersonality.traits;
    return [
      {
        traitName: 'openness',
        influences: [
          {
            behavior: 'exploration',
            strength: traits.openness,
            direction: 'positive' as const,
            context: 'new_areas'
          }
        ]
      },
      {
        traitName: 'riskTolerance',
        influences: [
          {
            behavior: 'combat',
            strength: traits.riskTolerance,
            direction: 'positive' as const,
            context: 'dangerous_situations'
          }
        ]
      }
    ];
  }, [currentPersonality]);

  // Memoize comparison data
  const comparisonData = useMemo(() => {
    if (!currentPersonality) return null;
    // Create mock comparison data
    return {
      agent1: {
        id: agentId,
        name: `Agent ${agentId}`,
        traits: currentPersonality.traits
      },
      agent2: {
        id: 'comparison_agent',
        name: 'Comparison Agent',
        traits: {
          openness: 0.5,
          conscientiousness: 0.5,
          extraversion: 0.5,
          agreeableness: 0.5,
          neuroticism: 0.5,
          riskTolerance: 0.5,
          creativity: 0.5,
          patience: 0.5,
          competitiveness: 0.5,
          curiosity: 0.5
        }
      },
      overallCompatibility: 0.7,
      similarities: [],
      differences: [],
      analysis: {
        strengths: ['Balanced personality'],
        conflicts: [],
        synergies: ['Adaptable behavior']
      }
    };
  }, [currentPersonality, agentId]);

  // Memoize correlation matrix
  const correlationMatrix = useMemo(() => {
    if (!currentPersonality) return null;
    // Create mock correlation data
    return {
      traits: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism', 'riskTolerance', 'creativity', 'patience', 'competitiveness', 'curiosity'],
      matrix: [],
      significantCorrelations: [
        {
          trait1: 'openness',
          trait2: 'creativity',
          correlation: 0.8,
          significance: 0.95,
          sampleSize: 100,
          context: 'creative_tasks',
          description: 'Openness strongly correlates with creativity'
        },
        {
          trait1: 'extraversion',
          trait2: 'competitiveness',
          correlation: 0.6,
          significance: 0.85,
          sampleSize: 100,
          context: 'social_interactions',
          description: 'Extraversion moderately correlates with competitiveness'
        }
      ],
      insights: {
        strongPositive: [],
        strongNegative: [],
        unexpected: []
      }
    };
  }, [currentPersonality]);

  // Handle trait click events
  const handleTraitClick = (traitName: string, value: number) => {
    if (onTraitClick) {
      onTraitClick(traitName, value);
    }
  };

  // Handle event click events
  const handleEventClick = (event: any) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading personality data...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  // No data state
  if (!currentPersonality) {
    return (
      <Alert severity="info">
        No personality data available for agent {agentId}
      </Alert>
    );
  }

  return (
    <Box className={className} sx={{ width: '100%' }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Personality Visualization
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Agent: {agentId}
          </Typography>
          
          {/* Controls */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Trait Category</InputLabel>
                <Select
                  value={selectedTraitCategory}
                  label="Trait Category"
                  onChange={handleTraitCategoryChange}
                >
                  <MenuItem value="all">All Traits</MenuItem>
                  <MenuItem value="big_five">Big Five</MenuItem>
                  <MenuItem value="gaming_specific">Gaming Specific</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid xs={12} sm={6}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  label="Show Events" 
                  color={filters.showEvents ? 'primary' : 'default'}
                  size="small"
                  clickable
                />
                <Chip 
                  label="Show Influences" 
                  color={filters.showInfluences ? 'primary' : 'default'}
                  size="small"
                  clickable
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Radar Chart" />
          <Tab label="Gaming Traits" />
          <Tab label="Timeline" />
          <Tab label="Behavioral Matrix" />
          <Tab label="Comparison" />
          <Tab label="Correlations" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {bigFiveTraits.length > 0 ? (
          <TraitsRadarChart
            data={bigFiveTraits}
            onTraitClick={handleTraitClick}
            config={config}
          />
        ) : (
          <Box>
            <Typography variant="h6">Traits Radar Chart</Typography>
            <Typography color="text.secondary">
              Loading radar chart data...
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {gamingTraits ? (
          <GamingTraitsChart
            data={gamingTraits}
            onTraitClick={handleTraitClick}
          />
        ) : (
          <Box>
            <Typography variant="h6">Gaming Traits</Typography>
            <Typography color="text.secondary">
              Loading gaming traits data...
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {timelineData.length > 0 ? (
          <PersonalityTimeline
            data={timelineData}
            onEventClick={handleEventClick}
          />
        ) : (
          <Box>
            <Typography variant="h6">Personality Timeline</Typography>
            <Typography color="text.secondary">
              Loading timeline data...
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {behavioralPatterns.length > 0 ? (
          <BehavioralMatrix
            data={behavioralPatterns}
            influences={behavioralInfluences}
          />
        ) : (
          <Box>
            <Typography variant="h6">Behavioral Matrix</Typography>
            <Typography color="text.secondary">
              Loading behavioral data...
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {comparisonData ? (
          <TraitComparison
            data={comparisonData}
            onAgentSelect={(agentId) => dispatch(selectAgent(agentId))}
          />
        ) : (
          <Box>
            <Typography variant="h6">Trait Comparison</Typography>
            <Typography color="text.secondary">
              Loading comparison data...
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {bigFiveTraits.length > 0 ? (
          <TraitsRadarChart
            data={bigFiveTraits}
            onTraitClick={handleTraitClick}
            config={{ ...config, ...chartDimensions }}
          />
        ) : (
          <Box>
            <Typography variant="h6">Traits Radar Chart</Typography>
            <Typography color="text.secondary">
              Loading radar chart data...
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {gamingTraits ? (
          <GamingTraitsChart
            data={gamingTraits}
            onTraitClick={handleTraitClick}
            config={{ ...config, ...chartDimensions }}
          />
        ) : (
          <Box>
            <Typography variant="h6">Gaming Traits</Typography>
            <Typography color="text.secondary">
              Loading gaming traits data...
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {timelineData.length > 0 ? (
          <PersonalityTimeline
            data={timelineData}
            onEventClick={handleEventClick}
            config={{ ...config, ...chartDimensions }}
          />
        ) : (
          <Box>
            <Typography variant="h6">Personality Timeline</Typography>
            <Typography color="text.secondary">
              Loading timeline data...
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {behavioralPatterns.length > 0 ? (
          <BehavioralMatrix
            data={behavioralPatterns}
            influences={behavioralInfluences}
            config={{ ...config, ...chartDimensions }}
          />
        ) : (
          <Box>
            <Typography variant="h6">Behavioral Matrix</Typography>
            <Typography color="text.secondary">
              Loading behavioral data...
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {comparisonData ? (
          <TraitComparison
            data={comparisonData}
            onAgentSelect={(agentId) => dispatch(selectAgent(agentId))}
            config={{ ...config, ...chartDimensions }}
          />
        ) : (
          <Box>
            <Typography variant="h6">Trait Comparison</Typography>
            <Typography color="text.secondary">
              Loading comparison data...
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        {correlationMatrix ? (
          <CorrelationAnalysis
            data={correlationMatrix}
            onRefresh={handleRefresh}
            onExport={() => {/* Implement export logic */}}
            config={{ ...config, ...chartDimensions }}
          />
        ) : (
          <Box>
            <Typography variant="h6">Correlation Analysis</Typography>
            <Typography color="text.secondary">
              Loading correlation data...
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={settingsDrawerOpen}
        onClose={toggleSettingsDrawer}
      >
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Visualization Settings
          </Typography>
          
          {/* Real-time Updates */}
          <FormControlLabel
            control={
              <Switch
                checked={realTimeEnabled}
                onChange={handleRealTimeToggle}
                color="primary"
              />
            }
            label="Real-time Updates"
            sx={{ mb: 2 }}
          />
          
          {/* Auto Refresh */}
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
                disabled={!realTimeEnabled}
              />
            }
            label="Auto Refresh"
            sx={{ mb: 2 }}
          />
          
          {/* Refresh Interval */}
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel>Refresh Interval</InputLabel>
            <Select
              value={refreshInterval}
              label="Refresh Interval"
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh || !realTimeEnabled}
            >
              <MenuItem value={1000}>1 second</MenuItem>
              <MenuItem value={5000}>5 seconds</MenuItem>
              <MenuItem value={10000}>10 seconds</MenuItem>
              <MenuItem value={30000}>30 seconds</MenuItem>
              <MenuItem value={60000}>1 minute</MenuItem>
            </Select>
          </FormControl>
          
          {/* Chart Settings */}
          <Typography variant="subtitle2" gutterBottom>
            Chart Settings
          </Typography>
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Animation Speed</InputLabel>
            <Select
              value={config?.animationDuration || 1000}
              label="Animation Speed"
              onChange={(e) => {
                if (config) {
                  config.animationDuration = Number(e.target.value);
                }
              }}
            >
              <MenuItem value={0}>No Animation</MenuItem>
              <MenuItem value={500}>Fast</MenuItem>
              <MenuItem value={1000}>Normal</MenuItem>
              <MenuItem value={2000}>Slow</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={config?.showLabels !== false}
                onChange={(e) => {
                  if (config) {
                    config.showLabels = e.target.checked;
                  }
                }}
                color="primary"
              />
            }
            label="Show Labels"
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={config?.showGrid !== false}
                onChange={(e) => {
                  if (config) {
                    config.showGrid = e.target.checked;
                  }
                }}
                color="primary"
              />
            }
            label="Show Grid"
            sx={{ mb: 2 }}
          />
          
          {/* Data Filters */}
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
            Data Filters
          </Typography>
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={filters?.timeRange || 'all'}
              label="Time Range"
              onChange={(e) => {
                // Implement time range filter
              }}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel>Data Quality</InputLabel>
            <Select
              value={filters?.dataQuality || 'all'}
              label="Data Quality"
              onChange={(e) => {
                // Implement data quality filter
              }}
            >
              <MenuItem value="all">All Data</MenuItem>
              <MenuItem value="high">High Quality Only</MenuItem>
              <MenuItem value="verified">Verified Data Only</MenuItem>
            </Select>
          </FormControl>
          
          {/* Actions */}
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh Data
            </Button>
            
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {/* Implement export */}}
            >
              Export Settings
            </Button>
            
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {/* Implement reset */}}
            >
              Reset to Default
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default PersonalityVisualization;