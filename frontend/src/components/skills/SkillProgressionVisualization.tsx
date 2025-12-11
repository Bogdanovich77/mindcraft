import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectSkills,
  selectSelectedAgent
} from '../../store';
import ErrorBoundary from '../common/ErrorBoundary';
import type { SkillsState } from '../../types/skills';
import {
  ProgressionCharts,
  LearningCurveAnalysis,
  SkillSynergyMapping,
  MilestoneTracking,
  PerformanceTrends,
  SkillComparison,
  ExperienceRateAnalysis,
  SkillRecommendations
} from './';

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
      id={`skills-tabpanel-${index}`}
      aria-labelledby={`skills-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface SkillProgressionVisualizationProps {
  agentId?: string;
  height?: number;
  compact?: boolean;
}

export const SkillProgressionVisualization: React.FC<SkillProgressionVisualizationProps> = ({
  agentId,
  height = 800,
  compact = false
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get selected agent ID from props or Redux store
  const selectedAgent = useSelector(selectSelectedAgent);
  const selectedAgentId = agentId || selectedAgent?.id;
  const skills = useSelector(selectSkills);

  // Memoize tabs configuration
  const tabs = useMemo(() => [
    { label: 'Progression Charts', component: 'progression' },
    { label: 'Learning Curves', component: 'learning' },
    { label: 'Skill Synergies', component: 'synergies' },
    { label: 'Milestones', component: 'milestones' },
    { label: 'Performance Trends', component: 'performance' },
    { label: 'Skill Comparison', component: 'comparison' },
    { label: 'Experience Analysis', component: 'experience' },
    { label: 'Recommendations', component: 'recommendations' }
  ], []);

  // Load data when component mounts or agent changes
  useEffect(() => {
    if (!selectedAgentId) {
      setError('No agent selected');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Skills data is already loaded via Socket.IO, no need to fetch
        // In a real implementation, you might fetch initial data here

      } catch (err) {
        console.error('Error loading skills data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load skills data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedAgentId, dispatch]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Render loading state
  if (loading) {
    return (
      <Card sx={{ height }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Loading skills data...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card sx={{ height }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (!skills || Object.keys(skills).length === 0) {
    return (
      <Card sx={{ height }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Skills Data Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start performing activities to develop skills and track progression.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Render component based on active tab
  const renderTabContent = () => {
    switch (tabs[activeTab].component) {
      case 'progression':
        return <ProgressionCharts agentId={selectedAgentId} compact={compact} />;
      case 'learning':
        return <LearningCurveAnalysis agentId={selectedAgentId} compact={compact} />;
      case 'synergies':
        return <SkillSynergyMapping agentId={selectedAgentId} compact={compact} />;
      case 'milestones':
        return <MilestoneTracking agentId={selectedAgentId} compact={compact} />;
      case 'performance':
        return <PerformanceTrends agentId={selectedAgentId} compact={compact} />;
      case 'comparison':
        return <SkillComparison agentId={selectedAgentId} compact={compact} />;
      case 'experience':
        return <ExperienceRateAnalysis agentId={selectedAgentId} compact={compact} />;
      case 'recommendations':
        return <SkillRecommendations agentId={selectedAgentId} compact={compact} />;
      default:
        return <ProgressionCharts agentId={selectedAgentId} compact={compact} />;
    }
  };

  return (
    <ErrorBoundary>
      <Card sx={{ height, overflow: 'hidden' }}>
        <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              backgroundColor: alpha(theme.palette.primary.main, 0.04)
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Skill Progression Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track skill development, learning patterns, and progression trends
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={compact ? 'scrollable' : 'standard'}
              scrollButtons={compact ? 'auto' : undefined}
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  minWidth: compact ? 100 : 120,
                  fontSize: compact ? '0.875rem' : '1rem'
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  id={`skills-tab-${index}`}
                  aria-controls={`skills-tabpanel-${index}`}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {tabs.map((tab, index) => (
              <TabPanel key={index} value={activeTab} index={index}>
                {renderTabContent()}
              </TabPanel>
            ))}
          </Box>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};

export default SkillProgressionVisualization;