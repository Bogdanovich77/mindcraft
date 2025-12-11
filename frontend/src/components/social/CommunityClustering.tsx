import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Refresh,
  Download,
  Settings,
  Group,
  Hub,
  ScatterPlot,
  AccountTree,
  ExpandMore,
  People,
  Public,
  LocalOffer,
} from '@mui/icons-material';
import * as d3 from 'd3';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import type {
  SocialAgent,
  SocialRelationship,
  Community,
  SocialGroup,
  SocialVisualizationConfig,
} from '../../types/social';
import {
  CommunityType,
} from '../../types/social';

interface CommunityClusteringProps {
  agents: SocialAgent[];
  relationships: SocialRelationship[];
  communities: Community[];
  groups: SocialGroup[];
  config: SocialVisualizationConfig;
  onCommunityClick?: (community: Community) => void;
  onGroupClick?: (group: SocialGroup) => void;
  onAgentClick?: (agentId: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

interface CommunityMetrics {
  totalCommunities: number;
  totalGroups: number;
  averageGroupSize: number;
  communityDistribution: { [key: string]: number };
  largestCommunity: Community | null;
  mostActiveGroup: SocialGroup | null;
  clusteringCoefficient: number;
  modularity: number;
  communityOverlap: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`community-tabpanel-${index}`}
    aria-labelledby={`community-tab-${index}`}
  >
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const COMMUNITY_COLORS = {
  [CommunityType.PROFESSIONAL_GUILD]: '#2196f3',
  [CommunityType.SOCIAL_GROUP]: '#4caf50',
  [CommunityType.FAMILY_CLAN]: '#ff9800',
  [CommunityType.INTEREST_GROUP]: '#e91e63',
  [CommunityType.TEMPORARY_TEAM]: '#9c27b0',
  [CommunityType.ALLIANCE]: '#00bcd4',
  [CommunityType.RIVAL_GROUP]: '#795548',
  [CommunityType.GENERIC]: '#607d8b',
};

const CommunityClustering: React.FC<CommunityClusteringProps> = React.memo(({
  agents,
  relationships,
  communities,
  groups,
  config,
  onCommunityClick,
  onGroupClick,
  onAgentClick,
  width = 800,
  height = 600,
  className,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<SocialGroup | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<SocialAgent | null>(null);
  const [clusterThreshold, setClusterThreshold] = useState(config.communityView?.clusterThreshold || 0.5);
  const [showOverlaps, setShowOverlaps] = useState(config.communityView?.showOverlaps || false);
  const [layoutType, setLayoutType] = useState<'force' | 'circular' | 'hierarchical'>('force');
  const [tabValue, setTabValue] = useState(0);

  // Process community data for visualization
  const processedData = useMemo(() => {
    // Filter communities based on threshold
    const filteredCommunities = communities.filter(community => 
      community.cohesion >= clusterThreshold
    );

    // Create community distribution data
    const communityDistribution = filteredCommunities.reduce((acc, community) => {
      acc[community.type] = (acc[community.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Create pie chart data
    const pieData = Object.entries(communityDistribution).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: COMMUNITY_COLORS[type as CommunityType] || COMMUNITY_COLORS[CommunityType.GENERIC],
    }));

    // Create scatter plot data for communities
    const scatterData = filteredCommunities.map(community => ({
      id: community.id,
      name: community.name,
      type: community.type,
      size: community.members.length,
      cohesion: community.cohesion * 100,
      activity: community.activityLevel * 100,
      stability: community.stability * 100,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));

    // Calculate clustering coefficient
    const clusteringCoefficient = calculateClusteringCoefficient(agents, relationships);

    // Calculate modularity (simplified)
    const modularity = calculateModularity(communities, relationships);

    // Calculate community overlap
    const communityOverlap = calculateCommunityOverlap(communities);

    // Find largest and most active communities/groups
    const largestCommunity = filteredCommunities.reduce((largest, community) => 
      community.members.length > (largest?.members.length || 0) ? community : largest, null as Community | null
    );

    const mostActiveGroup = groups.reduce((mostActive, group) => 
      group.activityLevel > (mostActive?.activityLevel || 0) ? group : mostActive, null as SocialGroup | null
    );

    return {
      communities: filteredCommunities,
      groups,
      communityDistribution,
      pieData,
      scatterData,
      clusteringCoefficient,
      modularity,
      communityOverlap,
      largestCommunity,
      mostActiveGroup,
    };
  }, [communities, groups, clusterThreshold, agents, relationships]);

  // Calculate clustering metrics
  const metrics = useMemo<CommunityMetrics>(() => {
    const totalGroups = processedData.groups.length;
    const averageGroupSize = totalGroups > 0 
      ? processedData.groups.reduce((sum, group) => sum + group.members.length, 0) / totalGroups 
      : 0;

    return {
      totalCommunities: processedData.communities.length,
      totalGroups,
      averageGroupSize,
      communityDistribution: processedData.communityDistribution,
      largestCommunity: processedData.largestCommunity,
      mostActiveGroup: processedData.mostActiveGroup,
      clusteringCoefficient: processedData.clusteringCoefficient,
      modularity: processedData.modularity,
      communityOverlap: processedData.communityOverlap,
    };
  }, [processedData]);

  // Calculate clustering coefficient
  function calculateClusteringCoefficient(agents: SocialAgent[], relationships: SocialRelationship[]): number {
    if (agents.length < 3) return 0;

    let totalClustering = 0;
    let agentCount = 0;

    agents.forEach(agent => {
      const agentRelationships = relationships.filter(rel => 
        rel.agentId === agent.id || rel.targetAgentId === agent.id
      );
      
      if (agentRelationships.length < 2) return;

      const neighbors = agentRelationships.map(rel => 
        rel.agentId === agent.id ? rel.targetAgentId : rel.agentId
      );

      let connectionsBetweenNeighbors = 0;
      for (let i = 0; i < neighbors.length; i++) {
        for (let j = i + 1; j < neighbors.length; j++) {
          const hasConnection = relationships.some(rel => 
            (rel.agentId === neighbors[i] && rel.targetAgentId === neighbors[j]) ||
            (rel.agentId === neighbors[j] && rel.targetAgentId === neighbors[i])
          );
          if (hasConnection) connectionsBetweenNeighbors++;
        }
      }

      const possibleConnections = (neighbors.length * (neighbors.length - 1)) / 2;
      const clustering = possibleConnections > 0 ? connectionsBetweenNeighbors / possibleConnections : 0;
      
      totalClustering += clustering;
      agentCount++;
    });

    return agentCount > 0 ? totalClustering / agentCount : 0;
  }

  // Calculate modularity (simplified version)
  function calculateModularity(communities: Community[], relationships: SocialRelationship[]): number {
    if (communities.length === 0) return 0;

    let modularity = 0;
    const totalRelationships = relationships.length;

    communities.forEach(community => {
      let internalEdges = 0;
      let totalDegree = 0;

      community.members.forEach(memberId => {
        const memberRelationships = relationships.filter(rel => 
          rel.agentId === memberId || rel.targetAgentId === memberId
        );
        
        totalDegree += memberRelationships.length;
        
        memberRelationships.forEach(rel => {
          const otherId = rel.agentId === memberId ? rel.targetAgentId : rel.agentId;
          if (community.members.includes(otherId)) {
            internalEdges++;
          }
        });
      });

      // Count each internal edge only once
      internalEdges = internalEdges / 2;
      
      const expectedEdges = (totalDegree * totalDegree) / (2 * totalRelationships);
      modularity += (internalEdges - expectedEdges) / totalRelationships;
    });

    return Math.max(0, modularity);
  }

  // Calculate community overlap
  function calculateCommunityOverlap(communities: Community[]): number {
    if (communities.length < 2) return 0;

    let totalOverlap = 0;
    let pairCount = 0;

    for (let i = 0; i < communities.length; i++) {
      for (let j = i + 1; j < communities.length; j++) {
        const community1 = communities[i];
        const community2 = communities[j];
        
        const intersection = community1.members.filter(member => 
          community2.members.includes(member)
        ).length;
        
        const union = new Set([...community1.members, ...community2.members]).size;
        
        const overlap = union > 0 ? intersection / union : 0;
        totalOverlap += overlap;
        pairCount++;
      }
    }

    return pairCount > 0 ? totalOverlap / pairCount : 0;
  }

  // D3 community network visualization
  useEffect(() => {
    if (!svgRef.current || tabValue !== 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create force simulation
    const simulation = d3.forceSimulation(processedData.communities as any)
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => Math.sqrt(d.members.length) * 10));

    // Create container group
    const container = svg.append('g');

    // Create links between overlapping communities
    const links = [];
    for (let i = 0; i < processedData.communities.length; i++) {
      for (let j = i + 1; j < processedData.communities.length; j++) {
        const community1 = processedData.communities[i];
        const community2 = processedData.communities[j];
        
        const overlap = community1.members.filter(member => 
          community2.members.includes(member)
        ).length;
        
        if (overlap > 0 && showOverlaps) {
          links.push({
            source: community1.id,
            target: community2.id,
            strength: overlap / Math.max(community1.members.length, community2.members.length)
          });
        }
      }
    }

    // Draw links
    const linkElements = container.selectAll('.community-link')
      .data(links)
      .enter().append('line')
      .attr('class', 'community-link')
      .attr('stroke', '#999')
      .attr('stroke-width', d => d.strength * 5)
      .attr('stroke-opacity', 0.3);

    // Draw community nodes
    const nodeElements = container.selectAll('.community-node')
      .data(processedData.communities)
      .enter().append('g')
      .attr('class', 'community-node')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedCommunity(d);
        onCommunityClick?.(d);
      });

    // Community circles
    nodeElements.append('circle')
      .attr('r', d => Math.sqrt(d.members.length) * 8)
      .attr('fill', d => COMMUNITY_COLORS[d.type] || COMMUNITY_COLORS[CommunityType.GENERIC])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.7);

    // Community labels
    nodeElements.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    // Member count labels
    nodeElements.append('text')
      .text(d => `${d.members.length} members`)
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('fill', '#fff')
      .attr('font-size', '8px')
      .style('pointer-events', 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => (d.source as any).x || 0)
        .attr('y1', d => (d.source as any).y || 0)
        .attr('x2', d => (d.target as any).x || 0)
        .attr('y2', d => (d.target as any).y || 0);

      nodeElements.attr('transform', d => `translate(${(d as any).x || 0}, ${(d as any).y || 0})`);
    });

  }, [processedData, tabValue, showOverlaps, width, height, onCommunityClick]);

  // Control handlers
  const handleReset = () => {
    setSelectedCommunity(null);
    setSelectedGroup(null);
    setSelectedAgent(null);
    setClusterThreshold(config.communityView?.clusterThreshold || 0.5);
    setShowOverlaps(config.communityView?.showOverlaps || false);
    setLayoutType('force');
    setTabValue(0);
  };

  const handleExport = () => {
    const data = {
      metrics,
      communities: processedData.communities,
      groups: processedData.groups,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'community-clustering-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Paper className={className} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Community Clustering</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Reset">
            <IconButton onClick={handleReset} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export">
            <IconButton onClick={handleExport} size="small">
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton onClick={() => setShowSettings(!showSettings)} size="small">
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Metrics */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip label={`Communities: ${metrics.totalCommunities}`} size="small" />
        <Chip label={`Groups: ${metrics.totalGroups}`} size="small" />
        <Chip label={`Avg Group Size: ${metrics.averageGroupSize.toFixed(1)}`} size="small" />
        <Chip label={`Clustering: ${(metrics.clusteringCoefficient * 100).toFixed(1)}%`} size="small" />
        <Chip label={`Modularity: ${metrics.modularity.toFixed(3)}`} size="small" />
        <Chip label={`Overlap: ${(metrics.communityOverlap * 100).toFixed(1)}%`} size="small" />
      </Box>

      {/* Settings Panel */}
      {showSettings && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Layout Type</InputLabel>
                <Select
                  value={layoutType}
                  label="Layout Type"
                  onChange={(e) => setLayoutType(e.target.value as any)}
                >
                  <MenuItem value="force">Force-Directed</MenuItem>
                  <MenuItem value="circular">Circular</MenuItem>
                  <MenuItem value="hierarchical">Hierarchical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Typography variant="caption" display="block" gutterBottom>
                  Cluster Threshold: {clusterThreshold.toFixed(2)}
                </Typography>
                <Slider
                  value={clusterThreshold}
                  onChange={(_, value) => setClusterThreshold(value as number)}
                  min={0}
                  max={1}
                  step={0.01}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showOverlaps}
                    onChange={(e) => setShowOverlaps(e.target.checked)}
                    size="small"
                  />
                }
                label="Show Overlaps"
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<Hub />} label="Network" />
          <Tab icon={<ScatterPlot />} label="Analysis" />
          <Tab icon={<Group />} label="Groups" />
          <Tab icon={<AccountTree />} label="Hierarchy" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* Network Visualization */}
          <Box sx={{ flex: 1 }}>
            <svg
              ref={svgRef}
              width="100%"
              height={height - 100}
              style={{ border: '1px solid #ddd', borderRadius: 1 }}
            />
          </Box>

          {/* Side Panel */}
          <Box sx={{ width: 280 }}>
            {/* Community Types Distribution */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  <Public sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Community Types
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={processedData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {processedData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Selection Info */}
            {selectedCommunity && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Community Details</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {selectedCommunity.name}
                    </Typography>
                    <Typography variant="body2">
                      Type: {selectedCommunity.type}
                    </Typography>
                    <Typography variant="body2">
                      Members: {selectedCommunity.members.length}
                    </Typography>
                    <Typography variant="body2">
                      Cohesion: {(selectedCommunity.cohesion * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2">
                      Activity: {(selectedCommunity.activityLevel * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2">
                      Stability: {(selectedCommunity.stability * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* Scatter Plot */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Community Analysis</Typography>
            <ResponsiveContainer width="100%" height={height - 100}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="cohesion" 
                  name="Cohesion %"
                  domain={[0, 100]}
                />
                <YAxis 
                  dataKey="activity" 
                  name="Activity %"
                  domain={[0, 100]}
                />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as any;
                      return (
                        <Box sx={{ p: 1, bgcolor: 'background.paper', border: '1px solid #ddd', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {data.name}
                          </Typography>
                          <Typography variant="body2">
                            Type: {data.type}
                          </Typography>
                          <Typography variant="body2">
                            Size: {data.size} members
                          </Typography>
                          <Typography variant="body2">
                            Cohesion: {data.cohesion.toFixed(1)}%
                          </Typography>
                          <Typography variant="body2">
                            Activity: {data.activity.toFixed(1)}%
                          </Typography>
                          <Typography variant="body2">
                            Stability: {data.stability.toFixed(1)}%
                          </Typography>
                        </Box>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  data={processedData.scatterData} 
                  fill="#8884d8"
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={Math.sqrt(payload.size) * 3}
                        fill={COMMUNITY_COLORS[payload.type as CommunityType] || COMMUNITY_COLORS[CommunityType.GENERIC]}
                        fillOpacity={0.7}
                        stroke="#fff"
                        strokeWidth={1}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const community = processedData.communities.find(c => c.id === payload.id);
                          if (community) {
                            setSelectedCommunity(community);
                            onCommunityClick?.(community);
                          }
                        }}
                      />
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* Groups List */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Social Groups</Typography>
            <Box sx={{ maxHeight: height - 100, overflow: 'auto' }}>
              {processedData.groups.map((group, index) => (
                <Accordion key={group.id}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: COMMUNITY_COLORS[group.type as CommunityType] || COMMUNITY_COLORS[CommunityType.GENERIC] }}>
                        <Group />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">{group.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {group.members.length} members • {group.type}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${(group.activityLevel * 100).toFixed(0)}% active`} 
                        size="small" 
                        color="primary"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>Activity Level:</strong> {(group.activityLevel * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">
                        <strong>Cohesion:</strong> {(group.cohesion * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">
                        <strong>Members:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {group.members.slice(0, 10).map(memberId => (
                          <Chip
                            key={memberId}
                            label={memberId}
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const agent = agents.find(a => a.id === memberId);
                              if (agent) {
                                setSelectedAgent(agent);
                                onAgentClick?.(memberId);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                        {group.members.length > 10 && (
                          <Chip label={`+${group.members.length - 10} more`} size="small" disabled />
                        )}
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>

          {/* Side Panel */}
          <Box sx={{ width: 280 }}>
            {/* Group Statistics */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  <People sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Group Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">
                    Total Groups: {metrics.totalGroups}
                  </Typography>
                  <Typography variant="body2">
                    Avg Size: {metrics.averageGroupSize.toFixed(1)} members
                  </Typography>
                  <Typography variant="body2">
                    Most Active: {metrics.mostActiveGroup?.name || 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Selection Info */}
            {(selectedGroup || selectedAgent) && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Selection Details</Typography>
                  {selectedGroup && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Group: {selectedGroup.name}
                      </Typography>
                      <Typography variant="body2">
                        Type: {selectedGroup.type}
                      </Typography>
                      <Typography variant="body2">
                        Members: {selectedGroup.members.length}
                      </Typography>
                      <Typography variant="body2">
                        Activity: {(selectedGroup.activityLevel * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">
                        Cohesion: {(selectedGroup.cohesion * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  )}
                  {selectedAgent && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Agent: {selectedAgent.id}
                      </Typography>
                      <Typography variant="body2">
                        Status: {selectedAgent.status}
                      </Typography>
                      <Typography variant="body2">
                        Role: {selectedAgent.role}
                      </Typography>
                      <Typography variant="body2">
                        Reputation: {((selectedAgent.reputationDetails?.score || selectedAgent.reputation || 0) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          {/* Hierarchy Visualization */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Community Hierarchy</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: height - 100, overflow: 'auto' }}>
              {processedData.communities
                .sort((a, b) => b.members.length - a.members.length)
                .map(community => (
                  <Card key={community.id} sx={{ cursor: 'pointer' }} onClick={() => {
                    setSelectedCommunity(community);
                    onCommunityClick?.(community);
                  }}>
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: COMMUNITY_COLORS[community.type as CommunityType] || COMMUNITY_COLORS[CommunityType.GENERIC] }}>
                          <Group />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2">{community.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {community.type} • {community.members.length} members
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                          <Chip 
                            icon={<LocalOffer sx={{ fontSize: 14 }} />}
                            label={`${(community.cohesion * 100).toFixed(0)}%`}
                            size="small"
                            color="primary"
                          />
                          <Typography variant="caption">
                            {(community.activityLevel * 100).toFixed(0)}% active
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          </Box>
        </Box>
      </TabPanel>
    </Paper>
  );
});

CommunityClustering.displayName = 'CommunityClustering';

export default CommunityClustering;