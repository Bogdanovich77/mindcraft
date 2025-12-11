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
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Refresh,
  Download,
  Settings,
  TrendingUp,
  TrendingDown,
  Favorite,
  Security,
  People,
  Timeline,
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
  ReferenceLine,
} from 'recharts';
import type {
  SocialRelationship,
  SocialAgent,
  SocialVisualizationConfig,
  RelationshipType,
} from '../../types/social';

interface TrustFriendshipDisplayProps {
  relationships: SocialRelationship[];
  agents: SocialAgent[];
  config: SocialVisualizationConfig['trustFriendship'];
  onRelationshipClick?: (relationship: SocialRelationship) => void;
  onAgentClick?: (agentId: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

interface TrustFriendshipMetrics {
  totalRelationships: number;
  averageTrustLevel: number;
  averageFriendshipScore: number;
  highTrustRelationships: number;
  strongFriendships: number;
  trustDistribution: { low: number; medium: number; high: number };
  friendshipDistribution: { low: number; medium: number; high: number };
  correlationCoefficient: number;
}

interface ScatterPoint {
  trustLevel: number;
  friendshipScore: number;
  agentId: string;
  targetAgentId: string;
  relationshipType: RelationshipType;
  interactionCount: number;
}

const TrustFriendshipDisplay: React.FC<TrustFriendshipDisplayProps> = React.memo(({
  relationships,
  agents,
  config,
  onRelationshipClick,
  onAgentClick,
  width = 800,
  height = 600,
  className,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<SocialRelationship | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<SocialAgent | null>(null);
  const [trustThreshold, setTrustThreshold] = useState(config.trustThreshold);
  const [friendshipThreshold, setFriendshipThreshold] = useState(config.friendshipThreshold);
  const [showHeatmap, setShowHeatmap] = useState(config.heatmapEnabled);
  const [viewMode, setViewMode] = useState<'scatter' | 'heatmap' | 'network' | 'table'>('scatter');
  const [sortBy, setSortBy] = useState<'trust' | 'friendship' | 'interactions'>('trust');

  // Process relationship data for visualization
  const processedData = useMemo(() => {
    // Filter relationships based on thresholds
    const filteredRelationships = relationships.filter(rel => 
      rel.trustLevel >= trustThreshold && rel.friendshipScore >= friendshipThreshold
    );

    // Create scatter plot data
    const scatterData: ScatterPoint[] = filteredRelationships.map(rel => ({
      trustLevel: rel.trustLevel,
      friendshipScore: rel.friendshipScore,
      agentId: rel.agentId,
      targetAgentId: rel.targetAgentId,
      relationshipType: rel.relationshipType,
      interactionCount: rel.interactions.length
    }));

    // Calculate correlation coefficient
    const correlation = calculateCorrelation(filteredRelationships);

    return {
      relationships: filteredRelationships,
      scatterData,
      correlation
    };
  }, [relationships, trustThreshold, friendshipThreshold]);

  // Calculate trust and friendship metrics
  const metrics = useMemo<TrustFriendshipMetrics>(() => {
    const rels = processedData.relationships;

    if (rels.length === 0) {
      return {
        totalRelationships: 0,
        averageTrustLevel: 0,
        averageFriendshipScore: 0,
        highTrustRelationships: 0,
        strongFriendships: 0,
        trustDistribution: { low: 0, medium: 0, high: 0 },
        friendshipDistribution: { low: 0, medium: 0, high: 0 },
        correlationCoefficient: 0
      };
    }

    const totalTrust = rels.reduce((sum, rel) => sum + rel.trustLevel, 0);
    const totalFriendship = rels.reduce((sum, rel) => sum + rel.friendshipScore, 0);
    const averageTrust = totalTrust / rels.length;
    const averageFriendship = totalFriendship / rels.length;

    const highTrust = rels.filter(rel => rel.trustLevel > 0.7).length;
    const strongFriendship = rels.filter(rel => rel.friendshipScore > 0.7).length;

    // Calculate distributions
    const trustDistribution = {
      low: rels.filter(rel => rel.trustLevel < 0.33).length,
      medium: rels.filter(rel => rel.trustLevel >= 0.33 && rel.trustLevel <= 0.67).length,
      high: rels.filter(rel => rel.trustLevel > 0.67).length
    };

    const friendshipDistribution = {
      low: rels.filter(rel => rel.friendshipScore < 0.33).length,
      medium: rels.filter(rel => rel.friendshipScore >= 0.33 && rel.friendshipScore <= 0.67).length,
      high: rels.filter(rel => rel.friendshipScore > 0.67).length
    };

    return {
      totalRelationships: rels.length,
      averageTrustLevel: averageTrust,
      averageFriendshipScore: averageFriendship,
      highTrustRelationships: highTrust,
      strongFriendships: strongFriendship,
      trustDistribution,
      friendshipDistribution,
      correlationCoefficient: processedData.correlation
    };
  }, [processedData]);

  // Calculate correlation coefficient
  function calculateCorrelation(relationships: SocialRelationship[]): number {
    if (relationships.length < 2) return 0;

    const n = relationships.length;
    const sumX = relationships.reduce((sum, rel) => sum + rel.trustLevel, 0);
    const sumY = relationships.reduce((sum, rel) => sum + rel.friendshipScore, 0);
    const sumXY = relationships.reduce((sum, rel) => sum + rel.trustLevel * rel.friendshipScore, 0);
    const sumX2 = relationships.reduce((sum, rel) => sum + rel.trustLevel * rel.trustLevel, 0);
    const sumY2 = relationships.reduce((sum, rel) => sum + rel.friendshipScore * rel.friendshipScore, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  // D3 heatmap visualization
  useEffect(() => {
    if (!svgRef.current || viewMode !== 'heatmap') return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create container group
    const container = svg.append('g');

    // Create heatmap grid
    const gridSize = 50;
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(height / gridSize);

    // Create color scale
    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
      .domain([0, 1]);

    // Draw heatmap cells
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = j * gridSize;
        const y = i * gridSize;
        
        // Find relationships in this grid cell
        const cellRelationships = processedData.relationships.filter(rel => {
          const agent1 = agents.find(a => a.id === rel.agentId);
          const agent2 = agents.find(a => a.id === rel.targetAgentId);
          if (!agent1 || !agent2) return false;
          
          const avgTrust = (rel.trustLevel + rel.friendshipScore) / 2;
          const cellX = Math.floor((agent1.position?.x || 0) / gridSize);
          const cellY = Math.floor((agent1.position?.y || 0) / gridSize);
          
          return cellX === j && cellY === i;
        });

        const intensity = cellRelationships.length > 0 
          ? cellRelationships.reduce((sum, rel) => sum + (rel.trustLevel + rel.friendshipScore) / 2, 0) / cellRelationships.length
          : 0;

        container.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', gridSize)
          .attr('height', gridSize)
          .attr('fill', colorScale(intensity))
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5)
          .attr('opacity', 0.8);
      }
    }

  }, [processedData, viewMode, agents, width, height]);

  // D3 network visualization
  useEffect(() => {
    if (!svgRef.current || viewMode !== 'network') return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create force simulation
    const simulation = d3.forceSimulation(processedData.relationships as any)
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create container group
    const container = svg.append('g');

    // Create links
    const links = container.selectAll('.link')
      .data(processedData.relationships)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', d => {
        const avgScore = (d.trustLevel + d.friendshipScore) / 2;
        if (avgScore > 0.7) return '#4caf50';
        if (avgScore > 0.4) return '#ff9800';
        return '#f44336';
      })
      .attr('stroke-width', d => Math.max(1, (d.trustLevel + d.friendshipScore) * 5))
      .attr('stroke-opacity', 0.6)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedRelationship(d);
        onRelationshipClick?.(d);
      });

    // Create nodes
    const nodes = container.selectAll('.node')
      .data(agents)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedAgent(d);
        onAgentClick?.(d.id);
      });

    nodes.append('circle')
      .attr('r', 20)
      .attr('fill', d => {
        const relationships = processedData.relationships.filter(rel => 
          rel.agentId === d.id || rel.targetAgentId === d.id
        );
        if (relationships.length === 0) return '#9e9e9e';
        
        const avgTrust = relationships.reduce((sum, rel) => sum + rel.trustLevel, 0) / relationships.length;
        const avgFriendship = relationships.reduce((sum, rel) => sum + rel.friendshipScore, 0) / relationships.length;
        const avgScore = (avgTrust + avgFriendship) / 2;
        
        if (avgScore > 0.7) return '#4caf50';
        if (avgScore > 0.4) return '#ff9800';
        return '#f44336';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    nodes.append('text')
      .text(d => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => {
          const source = agents.find(a => a.id === d.agentId);
          return source ? (source as any).x || width / 2 : width / 2;
        })
        .attr('y1', d => {
          const source = agents.find(a => a.id === d.agentId);
          return source ? (source as any).y || height / 2 : height / 2;
        })
        .attr('x2', d => {
          const target = agents.find(a => a.id === d.targetAgentId);
          return target ? (target as any).x || width / 2 : width / 2;
        })
        .attr('y2', d => {
          const target = agents.find(a => a.id === d.targetAgentId);
          return target ? (target as any).y || height / 2 : height / 2;
        });

      nodes.attr('transform', d => `translate(${(d as any).x || width / 2}, ${(d as any).y || height / 2})`);
    });

  }, [processedData, viewMode, agents, width, height, onRelationshipClick, onAgentClick]);

  // Control handlers
  const handleReset = () => {
    setSelectedRelationship(null);
    setSelectedAgent(null);
    setTrustThreshold(config.trustThreshold);
    setFriendshipThreshold(config.friendshipThreshold);
    setShowHeatmap(config.heatmapEnabled);
    setViewMode('scatter');
  };

  const handleExport = () => {
    const data = {
      metrics,
      relationships: processedData.relationships,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trust-friendship-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Sort relationships for table view
  const sortedRelationships = useMemo(() => {
    return [...processedData.relationships].sort((a, b) => {
      switch (sortBy) {
        case 'trust':
          return b.trustLevel - a.trustLevel;
        case 'friendship':
          return b.friendshipScore - a.friendshipScore;
        case 'interactions':
          return b.interactions.length - a.interactions.length;
        default:
          return 0;
      }
    });
  }, [processedData.relationships, sortBy]);

  return (
    <Paper className={className} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Trust & Friendship Analysis</Typography>
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
        <Chip label={`Relationships: ${metrics.totalRelationships}`} size="small" />
        <Chip label={`Avg Trust: ${(metrics.averageTrustLevel * 100).toFixed(1)}%`} size="small" />
        <Chip label={`Avg Friendship: ${(metrics.averageFriendshipScore * 100).toFixed(1)}%`} size="small" />
        <Chip label={`High Trust: ${metrics.highTrustRelationships}`} size="small" />
        <Chip label={`Strong Friends: ${metrics.strongFriendships}`} size="small" />
        <Chip label={`Correlation: ${metrics.correlationCoefficient.toFixed(3)}`} size="small" />
      </Box>

      {/* Settings Panel */}
      {showSettings && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>View Mode</InputLabel>
                <Select
                  value={viewMode}
                  label="View Mode"
                  onChange={(e) => setViewMode(e.target.value as any)}
                >
                  <MenuItem value="scatter">Scatter Plot</MenuItem>
                  <MenuItem value="heatmap">Heatmap</MenuItem>
                  <MenuItem value="network">Network</MenuItem>
                  <MenuItem value="table">Table</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Typography variant="caption" display="block" gutterBottom>
                  Trust Threshold: {trustThreshold.toFixed(2)}
                </Typography>
                <Slider
                  value={trustThreshold}
                  onChange={(_, value) => setTrustThreshold(value as number)}
                  min={0}
                  max={1}
                  step={0.01}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Typography variant="caption" display="block" gutterBottom>
                  Friendship Threshold: {friendshipThreshold.toFixed(2)}
                </Typography>
                <Slider
                  value={friendshipThreshold}
                  onChange={(_, value) => setFriendshipThreshold(value as number)}
                  min={0}
                  max={1}
                  step={0.01}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {viewMode === 'table' && (
                <FormControl size="small" fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <MenuItem value="trust">Trust Level</MenuItem>
                    <MenuItem value="friendship">Friendship Score</MenuItem>
                    <MenuItem value="interactions">Interactions</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Main Visualization */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
        {/* Visualization Area */}
        <Box sx={{ flex: 1, position: 'relative', border: '1px solid #ddd', borderRadius: 1 }}>
          {viewMode === 'scatter' && (
            <ResponsiveContainer width="100%" height={height}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="trustLevel" 
                  domain={[0, 1]} 
                  name="Trust Level"
                  label={{ value: 'Trust Level', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  dataKey="friendshipScore" 
                  domain={[0, 1]} 
                  name="Friendship Score"
                  label={{ value: 'Friendship Score', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ScatterPoint;
                      return (
                        <Box sx={{ p: 1, bgcolor: 'background.paper', border: '1px solid #ddd', borderRadius: 1 }}>
                          <Typography variant="body2">
                            {data.agentId} → {data.targetAgentId}
                          </Typography>
                          <Typography variant="body2">
                            Trust: {(data.trustLevel * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="body2">
                            Friendship: {(data.friendshipScore * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="body2">
                            Type: {data.relationshipType}
                          </Typography>
                          <Typography variant="body2">
                            Interactions: {data.interactionCount}
                          </Typography>
                        </Box>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={0.5} stroke="#666" strokeDasharray="3 3" />
                <ReferenceLine y={0.5} stroke="#666" strokeDasharray="3 3" />
                <Scatter 
                  data={processedData.scatterData} 
                  fill="#8884d8"
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    const color = payload.relationshipType === 'friendship' ? '#4caf50' :
                                 payload.relationshipType === 'professional' ? '#2196f3' :
                                 payload.relationshipType === 'romantic' ? '#e91e63' : '#ff9800';
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6 + payload.interactionCount}
                        fill={color}
                        fillOpacity={0.7}
                        stroke="#fff"
                        strokeWidth={1}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const rel = processedData.relationships.find(r => 
                            r.agentId === payload.agentId && r.targetAgentId === payload.targetAgentId
                          );
                          if (rel) {
                            setSelectedRelationship(rel);
                            onRelationshipClick?.(rel);
                          }
                        }}
                      />
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}

          {viewMode === 'heatmap' && (
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              style={{ minHeight: height }}
            />
          )}

          {viewMode === 'network' && (
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              style={{ minHeight: height }}
            />
          )}

          {viewMode === 'table' && (
            <TableContainer sx={{ height, overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Agent</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Trust</TableCell>
                    <TableCell>Friendship</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Interactions</TableCell>
                    <TableCell>Last Contact</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRelationships.slice(0, 50).map((rel, index) => (
                    <TableRow
                      key={index}
                      hover
                      selected={selectedRelationship?.agentId === rel.agentId && selectedRelationship?.targetAgentId === rel.targetAgentId}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedRelationship(rel);
                        onRelationshipClick?.(rel);
                      }}
                    >
                      <TableCell>{rel.agentId}</TableCell>
                      <TableCell>{rel.targetAgentId}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={rel.trustLevel * 100}
                            sx={{ flex: 1, minWidth: 60 }}
                          />
                          <Typography variant="body2">
                            {(rel.trustLevel * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={rel.friendshipScore * 100}
                            sx={{ flex: 1, minWidth: 60 }}
                            color="secondary"
                          />
                          <Typography variant="body2">
                            {(rel.friendshipScore * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rel.relationshipType}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{rel.interactions.length}</TableCell>
                      <TableCell>
                        {new Date(rel.lastInteraction).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Side Panel */}
        <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Trust Distribution */}
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                <Security sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Trust Distribution
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Low ({'<33%'})</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metrics.trustDistribution.low}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(metrics.trustDistribution.low / metrics.totalRelationships) * 100}
                  color="error"
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Medium (33-67%)</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metrics.trustDistribution.medium}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(metrics.trustDistribution.medium / metrics.totalRelationships) * 100}
                  color="warning"
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">High ({'>67%'})</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metrics.trustDistribution.high}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(metrics.trustDistribution.high / metrics.totalRelationships) * 100}
                  color="success"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Friendship Distribution */}
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                <Favorite sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Friendship Distribution
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Weak ({'<33%'})</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metrics.friendshipDistribution.low}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(metrics.friendshipDistribution.low / metrics.totalRelationships) * 100}
                  color="error"
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Moderate (33-67%)</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metrics.friendshipDistribution.medium}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(metrics.friendshipDistribution.medium / metrics.totalRelationships) * 100}
                  color="warning"
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Strong ({'>67%'})</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metrics.friendshipDistribution.high}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(metrics.friendshipDistribution.high / metrics.totalRelationships) * 100}
                  color="success"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Selection Info */}
          {(selectedRelationship || selectedAgent) && (
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Selection Details
                </Typography>
                {selectedRelationship && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {selectedRelationship.agentId} → {selectedRelationship.targetAgentId}
                    </Typography>
                    <Typography variant="body2">
                      Type: {selectedRelationship.relationshipType}
                    </Typography>
                    <Typography variant="body2">
                      Trust: {(selectedRelationship.trustLevel * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2">
                      Friendship: {(selectedRelationship.friendshipScore * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2">
                      Interactions: {selectedRelationship.interactions.length}
                    </Typography>
                  </Box>
                )}
                {selectedAgent && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {selectedAgent.id[0]}
                      </Avatar>
                      <Typography variant="body2" fontWeight="bold">
                        {selectedAgent.id}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      Status: {selectedAgent.status}
                    </Typography>
                    <Typography variant="body2">
                      Role: {selectedAgent.role}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Paper>
  );
});

TrustFriendshipDisplay.displayName = 'TrustFriendshipDisplay';

export default TrustFriendshipDisplay;