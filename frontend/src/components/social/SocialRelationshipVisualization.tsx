import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCurrentNetwork,
  selectSocialLoading,
  selectSocialError,
  selectVisualizationConfig,
  selectSelectedSocialAgent,
  selectSelectedSocialRelationship,
  selectSelectedSocialCommunity,
  selectSocialAnalytics,
  selectSocialInsights,
  selectRealTimeUpdates,
  setSocialLoading,
  setSocialError,
  selectSocialAgent,
  selectSocialRelationship,
  selectSocialCommunity,
  clearSelections,
  updateVisualizationConfig,
} from '../../store/slices/socialSlice';
import { useAppDispatch, useAppSelector } from '../../store';

// Import social components
import SocialNetworkGraph from './SocialNetworkGraph';
import TemporalEvolutionViewer from './TemporalEvolutionViewer';
import InfluenceMapping from './InfluenceMapping';
import TrustFriendshipDisplay from './TrustFriendshipDisplay';
import ReputationVisualization from './ReputationVisualization';
import CommunityClustering from './CommunityClustering';
import CommunicationAnalysis from './CommunicationAnalysis';
import SocialInteractionTimeline from './SocialInteractionTimeline';

import type {
  SocialRelationshipVisualizationProps,
  SocialNetwork,
  SocialAgent,
  SocialRelationship,
  Community,
} from '../../types/social';

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
      id={`social-tabpanel-${index}`}
      aria-labelledby={`social-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SocialRelationshipVisualization: React.FC<SocialRelationshipVisualizationProps> = ({
  agentId,
  networkId,
  config,
  onAgentSelect,
  onRelationshipSelect,
  onCommunitySelect,
  className,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  // Redux state
  const currentNetwork = useAppSelector(selectCurrentNetwork);
  const loading = useAppSelector(selectSocialLoading);
  const error = useAppSelector(selectSocialError);
  const visualizationConfig = useAppSelector(selectVisualizationConfig);
  const selectedAgent = useAppSelector(selectSelectedSocialAgent);
  const selectedRelationship = useAppSelector(selectSelectedSocialRelationship);
  const selectedCommunity = useAppSelector(selectSelectedSocialCommunity);
  const analytics = useAppSelector(selectSocialAnalytics);
  const insights = useAppSelector(selectSocialInsights);
  const realTimeUpdates = useAppSelector(selectRealTimeUpdates);

  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [localConfig, setLocalConfig] = useState(
    config ? { ...visualizationConfig, ...config } : visualizationConfig
  );

  // Update local config when props or Redux config changes
  useEffect(() => {
    if (config) {
      setLocalConfig({ ...visualizationConfig, ...config });
      dispatch(updateVisualizationConfig(config));
    }
  }, [config, visualizationConfig, dispatch]);

  // Handle tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle agent selection
  const handleAgentSelect = (agent: SocialAgent) => {
    dispatch(selectSocialAgent(agent.id));
    onAgentSelect?.(agent.id);
  };

  // Handle relationship selection
  const handleRelationshipSelect = (relationship: SocialRelationship) => {
    dispatch(selectSocialRelationship(relationship.id));
    onRelationshipSelect?.(relationship.id);
  };

  // Handle community selection
  const handleCommunitySelect = (communityId: string) => {
    dispatch(selectSocialCommunity(communityId));
    onCommunitySelect?.(communityId);
  };

  // Clear all selections
  const handleClearSelections = () => {
    dispatch(clearSelections());
  };

  // Memoized filtered data based on selected agent
  const filteredData = useMemo(() => {
    if (!currentNetwork) return null;

    let filteredNetwork: SocialNetwork = { ...currentNetwork };

    // If an agent is selected, filter network to show relevant data
    if (selectedAgent) {
      const relatedRelationships = currentNetwork.relationships.filter(
        r => r.agentId === selectedAgent.id || r.targetAgentId === selectedAgent.id
      );
      
      const relatedAgentIds = new Set([
        selectedAgent.id,
        ...relatedRelationships.map(r => r.agentId === selectedAgent.id ? r.targetAgentId : r.agentId)
      ]);

      filteredNetwork = {
        ...currentNetwork,
        agents: currentNetwork.agents.filter(a => relatedAgentIds.has(a.id)),
        relationships: relatedRelationships,
      };
    }

    // If a community is selected, filter network to show community data
    if (selectedCommunity) {
      filteredNetwork = {
        ...filteredNetwork,
        agents: filteredNetwork.agents.filter(a => selectedCommunity.members.includes(a.id)),
      };
    }

    return filteredNetwork;
  }, [currentNetwork, selectedAgent, selectedCommunity]);

  // Generate insights based on current data
  const generateInsights = useMemo(() => {
    if (!currentNetwork || !analytics) return [];

    const insightList: string[] = [];

    // Network density insights
    if (analytics.overview.networkDensity < 0.1) {
      insightList.push('Network has low density - agents have few connections');
    } else if (analytics.overview.networkDensity > 0.5) {
      insightList.push('Network is highly connected - strong social cohesion');
    }

    // Trust level insights
    if (analytics.overview.averageTrustLevel < 0.3) {
      insightList.push('Low average trust levels - potential for conflicts');
    } else if (analytics.overview.averageTrustLevel > 0.7) {
      insightList.push('High trust environment - conducive to collaboration');
    }

    // Community insights
    if (analytics.overview.totalCommunities > currentNetwork.agents.length * 0.3) {
      insightList.push('High community fragmentation - many small groups');
    }

    // Add existing insights from Redux
    insightList.push(...insights);

    return insightList.slice(0, 5); // Limit to 5 insights
  }, [currentNetwork, analytics, insights]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
        className={className}
      >
        <CircularProgress size={48} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading social relationship data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={className}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!currentNetwork) {
    return (
      <Box className={className}>
        <Alert severity="info">
          No social network data available. Please select an agent to view social relationships.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className={className} sx={{ width: '100%' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Typography variant="h4" gutterBottom>
          Social Relationship Visualization
        </Typography>
        
        {/* Status and Insights */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="body2" color="text.secondary">
              Network: {currentNetwork.id} |
              Agents: {currentNetwork.agents.length} |
              Relationships: {currentNetwork.relationships.length} |
              Communities: {currentNetwork.communities.length}
              {realTimeUpdates && ' | Real-time updates enabled'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            {selectedAgent && (
              <Typography variant="body2" color="primary">
                Selected Agent: {selectedAgent.name}
              </Typography>
            )}
            {selectedRelationship && (
              <Typography variant="body2" color="primary">
                Selected Relationship: {selectedRelationship.relationshipType}
              </Typography>
            )}
            {selectedCommunity && (
              <Typography variant="body2" color="primary">
                Selected Community: {selectedCommunity.name}
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* Insights */}
        {generateInsights.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Key Insights:
            </Typography>
            {generateInsights.map((insight, index) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }}>
                {insight}
              </Alert>
            ))}
          </Box>
        )}
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Social visualization tabs"
        >
          <Tab label="Network Graph" />
          <Tab label="Temporal Evolution" />
          <Tab label="Influence Mapping" />
          <Tab label="Trust & Friendship" />
          <Tab label="Reputation" />
          <Tab label="Communities" />
          <Tab label="Communication" />
          <Tab label="Interactions Timeline" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <SocialNetworkGraph
          network={filteredData || currentNetwork!}
          config={{
            nodeSize: localConfig.networkGraph.nodeSize,
            linkWidth: localConfig.networkGraph.edgeWidth,
            linkDistance: 100,
            showLabels: localConfig.networkGraph.showLabels,
            showCommunities: true,
            defaultNodeColor: '#2196F3',
            communityColors: ['#FF5722', '#4CAF50', '#FFC107', '#9C27B0', '#00BCD4'],
            getRelationshipColor: (type) => {
              const colorMap: Record<string, string> = {
                friendship: '#4CAF50',
                professional: '#2196F3',
                romantic: '#E91E63',
                family: '#FF9800',
                acquaintance: '#9E9E9E',
                rivalry: '#F44336',
                mentorship: '#673AB7',
                alliance: '#00BCD4',
                neutral: '#607D8B'
              };
              return colorMap[type] || '#607D8B';
            }
          }}
          onNodeClick={handleAgentSelect}
          height={600}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TemporalEvolutionViewer
          evolution={{
            timeline: [],
            metrics: {
              growthRate: 0,
              stabilityIndex: 0,
              adaptabilityScore: 0,
              relationshipVelocity: 0,
              influenceDrift: 0,
              communityEvolutionRate: 0
            },
            predictions: [],
            significantEvents: []
          }}
          config={localConfig.temporalView}
          height={600}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <InfluenceMapping
          influenceNetwork={{
            nodes: [],
            edges: [],
            metrics: {
              networkDensity: 0,
              clusteringCoefficient: 0,
              averagePathLength: 0,
              centralityMeasures: {
                degree: new Map(),
                betweenness: new Map(),
                closeness: new Map(),
                eigenvector: new Map()
              },
              influenceDistribution: {
                mean: 0,
                median: 0,
                stdDev: 0,
                min: 0,
                max: 0
              }
            },
            propagationPaths: []
          }}
          config={localConfig.influenceMap}
          height={600}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <TrustFriendshipDisplay
          relationships={filteredData?.relationships || currentNetwork?.relationships || []}
          agents={filteredData?.agents || currentNetwork?.agents || []}
          config={localConfig.trustFriendship}
          onRelationshipClick={handleRelationshipSelect}
          onAgentClick={(agentId: string) => {
            const agent = (filteredData?.agents || currentNetwork?.agents || []).find(a => a.id === agentId);
            if (agent) {
              handleAgentSelect(agent);
            }
          }}
          height={600}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <ReputationVisualization
          agents={filteredData?.agents || currentNetwork?.agents || []}
          relationships={filteredData?.relationships || currentNetwork?.relationships || []}
          reputationSystem={{
            events: [],
            trends: [],
            globalReputation: 0.5,
            score: 0.5,
            history: []
          }}
          config={localConfig.reputation}
          onAgentClick={(agentId: string) => {
            const agent = (filteredData?.agents || currentNetwork?.agents || []).find(a => a.id === agentId);
            if (agent) {
              handleAgentSelect(agent);
            }
          }}
          height={600}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        <CommunityClustering
          communities={filteredData?.communities || currentNetwork?.communities || []}
          relationships={filteredData?.relationships || currentNetwork?.relationships || []}
          agents={filteredData?.agents || currentNetwork?.agents || []}
          groups={[]}
          config={localConfig}
          onCommunityClick={(community) => handleCommunitySelect(community.id)}
          onGroupClick={(group) => console.log('Group clicked:', group)}
          onAgentClick={(agentId) => {
            const agent = currentNetwork?.agents.find(a => a.id === agentId);
            if (agent) handleAgentSelect(agent);
          }}
          height={600}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={6}>
        <CommunicationAnalysis
          agents={filteredData?.agents || currentNetwork?.agents || []}
          relationships={filteredData?.relationships || currentNetwork?.relationships || []}
          interactions={filteredData?.relationships?.flatMap(r => r.interactions) || []}
          config={localConfig.communicationAnalysis}
          onInteractionClick={(interaction) => {
            // Handle interaction selection
            console.log('Interaction clicked:', interaction);
          }}
          onAgentClick={(agentId: string) => {
            const agent = (filteredData?.agents || currentNetwork?.agents || []).find(a => a.id === agentId);
            if (agent) {
              handleAgentSelect(agent);
            }
          }}
          height={600}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={7}>
        <SocialInteractionTimeline
          agentId={selectedAgent?.id}
          config={localConfig.communicationAnalysis}
          height={600}
        />
      </TabPanel>
    </Box>
  );
};

export default SocialRelationshipVisualization;