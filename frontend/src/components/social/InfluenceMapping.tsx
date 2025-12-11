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
  AccountTree,
} from '@mui/icons-material';
import * as d3 from 'd3';
import type {
  InfluenceNetwork,
  InfluenceNode,
  InfluenceEdge,
  InfluenceFlow,
  InfluencePropagation,
  SocialVisualizationConfig,
} from '../../types/social';

interface InfluenceMappingProps {
  influenceNetwork: InfluenceNetwork;
  config: SocialVisualizationConfig['influenceMap'];
  onNodeClick?: (agentId: string) => void;
  onFlowClick?: (flow: InfluenceFlow) => void;
  width?: number;
  height?: number;
  className?: string;
}

interface InfluenceMetrics {
  totalInfluence: number;
  averageSusceptibility: number;
  averagePersuasiveness: number;
  networkDensity: number;
  propagationEffectiveness: number;
  topInfluencers: string[];
  mostSusceptible: string[];
}

const InfluenceMapping: React.FC<InfluenceMappingProps> = React.memo(({
  influenceNetwork,
  config,
  onNodeClick,
  onFlowClick,
  width = 800,
  height = 600,
  className,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNode, setSelectedNode] = useState<InfluenceNode | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<InfluenceFlow | null>(null);
  const [threshold, setThreshold] = useState(config.threshold);
  const [showHeatmap, setShowHeatmap] = useState(config.heatmapEnabled);
  const [showFlow, setShowFlow] = useState(config.flowVisualization);
  const [layoutType, setLayoutType] = useState<'force' | 'radial' | 'hierarchical'>('force');
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Process influence data for visualization
  const processedData = useMemo(() => {
    const filteredEdges = influenceNetwork.edges.filter(edge => edge.strength >= threshold);
    const filteredNodes = influenceNetwork.nodes.filter(node => 
      node.influenceScore >= threshold || filteredEdges.some(edge => 
        edge.source === node.id || edge.target === node.id
      )
    );

    // Calculate node positions based on layout
    let nodePositions = new Map<string, { x: number; y: number }>();

    if (layoutType === 'radial') {
      // Radial layout based on influence
      const maxInfluence = Math.max(...filteredNodes.map(n => n.influenceScore));
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) / 2 - 50;

      filteredNodes.forEach((node, i) => {
        const angle = (i / filteredNodes.length) * 2 * Math.PI;
        const radius = (node.influenceScore / maxInfluence) * maxRadius;
        nodePositions.set(node.id, {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        });
      });
    } else if (layoutType === 'hierarchical') {
      // Hierarchical layout based on authority level
      const levels = new Map<number, InfluenceNode[]>();
      filteredNodes.forEach(node => {
        const level = Math.floor(node.authorityLevel * 5); // 0-5 levels
        if (!levels.has(level)) levels.set(level, []);
        levels.get(level)!.push(node);
      });

      let yOffset = 50;
      levels.forEach((nodes, level) => {
        const xSpacing = width / (nodes.length + 1);
        nodes.forEach((node, i) => {
          nodePositions.set(node.id, {
            x: xSpacing * (i + 1),
            y: yOffset
          });
        });
        yOffset += (height - 100) / 6;
      });
    } else {
      // Force-directed layout (simplified)
      filteredNodes.forEach((node, i) => {
        nodePositions.set(node.id, {
          x: Math.random() * (width - 100) + 50,
          y: Math.random() * (height - 100) + 50
        });
      });
    }

    return {
      nodes: filteredNodes.map(node => ({
        ...node,
        position: nodePositions.get(node.id) || { x: width / 2, y: height / 2 }
      })),
      edges: filteredEdges,
      propagations: influenceNetwork.propagationPaths.filter(p => 
        p.effectiveness >= threshold
      )
    };
  }, [influenceNetwork, threshold, layoutType, width, height]);

  // Calculate influence metrics
  const metrics = useMemo<InfluenceMetrics>(() => {
    const nodes = processedData.nodes;
    const edges = processedData.edges;

    if (nodes.length === 0) {
      return {
        totalInfluence: 0,
        averageSusceptibility: 0,
        averagePersuasiveness: 0,
        networkDensity: 0,
        propagationEffectiveness: 0,
        topInfluencers: [],
        mostSusceptible: []
      };
    }

    const totalInfluence = nodes.reduce((sum, node) => sum + node.influenceScore, 0);
    const averageSusceptibility = nodes.reduce((sum, node) => sum + node.susceptibility, 0) / nodes.length;
    const averagePersuasiveness = nodes.reduce((sum, node) => sum + node.persuasiveness, 0) / nodes.length;
    
    const maxPossibleEdges = (nodes.length * (nodes.length - 1)) / 2;
    const networkDensity = maxPossibleEdges > 0 ? edges.length / maxPossibleEdges : 0;
    
    const propagations = processedData.propagations;
    const propagationEffectiveness = propagations.length > 0 
      ? propagations.reduce((sum, p) => sum + p.effectiveness, 0) / propagations.length 
      : 0;

    const topInfluencers = nodes
      .sort((a, b) => b.influenceScore - a.influenceScore)
      .slice(0, 5)
      .map(n => n.id);

    const mostSusceptible = nodes
      .sort((a, b) => b.susceptibility - a.susceptibility)
      .slice(0, 5)
      .map(n => n.id);

    return {
      totalInfluence,
      averageSusceptibility,
      averagePersuasiveness,
      networkDensity,
      propagationEffectiveness,
      topInfluencers,
      mostSusceptible
    };
  }, [processedData]);

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || processedData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create container group for zoom
    const container = svg.append('g');

    // Add zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Create gradient definitions for heatmap
    if (showHeatmap) {
      const defs = svg.append('defs');
      const gradient = defs.append('radialGradient')
        .attr('id', 'influence-gradient');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ff0000')
        .attr('stop-opacity', 0.8);

      gradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#ffff00')
        .attr('stop-opacity', 0.5);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#0000ff')
        .attr('stop-opacity', 0.2);
    }

    // Draw heatmap background if enabled
    if (showHeatmap) {
      const heatmapData = processedData.nodes.map(node => ({
        x: node.position.x,
        y: node.position.y,
        value: node.influenceScore
      }));

      // Create heatmap circles
      container.selectAll('.heatmap-circle')
        .data(heatmapData)
        .enter().append('circle')
        .attr('class', 'heatmap-circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.value * 100)
        .attr('fill', 'url(#influence-gradient)')
        .attr('opacity', 0.3);
    }

    // Draw influence edges
    if (showFlow) {
      const edgeGroups = container.selectAll('.influence-edge')
        .data(processedData.edges)
        .enter().append('g')
        .attr('class', 'influence-edge');

      // Draw edge lines
      edgeGroups.append('line')
        .attr('x1', d => {
          const sourceNode = processedData.nodes.find(n => n.id === d.source);
          return sourceNode?.position.x || 0;
        })
        .attr('y1', d => {
          const sourceNode = processedData.nodes.find(n => n.id === d.source);
          return sourceNode?.position.y || 0;
        })
        .attr('x2', d => {
          const targetNode = processedData.nodes.find(n => n.id === d.target);
          return targetNode?.position.x || 0;
        })
        .attr('y2', d => {
          const targetNode = processedData.nodes.find(n => n.id === d.target);
          return targetNode?.position.y || 0;
        })
        .attr('stroke', d => {
          if (d.type === 'direct') return '#ff6b6b';
          if (d.type === 'indirect') return '#4ecdc4';
          return '#45b7d1'; // reciprocal
        })
        .attr('stroke-width', d => Math.max(1, d.strength * 5))
        .attr('stroke-opacity', 0.6)
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          const flow: InfluenceFlow = {
            direction: 'outgoing',
            source: d.source,
            target: d.target,
            content: 'influence',
            strength: d.strength,
            timestamp: Date.now()
          };
          setSelectedFlow(flow);
          onFlowClick?.(flow);
        });

      // Draw edge arrows
      edgeGroups.append('path')
        .attr('d', d => {
          const sourceNode = processedData.nodes.find(n => n.id === d.source);
          const targetNode = processedData.nodes.find(n => n.id === d.target);
          if (!sourceNode || !targetNode) return '';
          
          const dx = targetNode.position.x - sourceNode.position.x;
          const dy = targetNode.position.y - sourceNode.position.y;
          const angle = Math.atan2(dy, dx);
          const targetRadius = 15;
          const arrowLength = 10;
          const arrowAngle = Math.PI / 6;
          
          const x1 = targetNode.position.x - targetRadius * Math.cos(angle);
          const y1 = targetNode.position.y - targetRadius * Math.sin(angle);
          const x2 = x1 - arrowLength * Math.cos(angle - arrowAngle);
          const y2 = y1 - arrowLength * Math.sin(angle - arrowAngle);
          const x3 = x1 - arrowLength * Math.cos(angle + arrowAngle);
          const y3 = y1 - arrowLength * Math.sin(angle + arrowAngle);
          
          return `M ${x2} ${y2} L ${x1} ${y1} L ${x3} ${y3}`;
        })
        .attr('fill', d => {
          if (d.type === 'direct') return '#ff6b6b';
          if (d.type === 'indirect') return '#4ecdc4';
          return '#45b7d1';
        })
        .attr('opacity', 0.8);
    }

    // Draw influence nodes
    const nodeGroups = container.selectAll('.influence-node')
      .data(processedData.nodes)
      .enter().append('g')
      .attr('class', 'influence-node')
      .attr('transform', d => `translate(${d.position.x}, ${d.position.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d);
        onNodeClick?.(d.id);
      });

    // Node circles
    nodeGroups.append('circle')
      .attr('r', d => 10 + d.influenceScore * 20)
      .attr('fill', d => {
        const intensity = d.influenceScore;
        if (intensity > 0.7) return '#ff4444';
        if (intensity > 0.4) return '#ff8844';
        return '#4444ff';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    // Node labels
    nodeGroups.append('text')
      .text(d => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    // Node influence indicators
    nodeGroups.append('text')
      .text(d => d.influenceScore.toFixed(2))
      .attr('text-anchor', 'middle')
      .attr('dy', '2em')
      .attr('fill', '#333')
      .attr('font-size', '8px')
      .style('pointer-events', 'none');

  }, [processedData, showHeatmap, showFlow, onNodeClick, onFlowClick]);

  // Control handlers
  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().call(zoomBehavior.scaleBy, 1.2);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().call(zoomBehavior.scaleBy, 0.8);
    }
  };

  const handleCenter = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().call(zoomBehavior.transform, d3.zoomIdentity);
    }
  };

  const handleReset = () => {
    setSelectedNode(null);
    setSelectedFlow(null);
    setThreshold(config.threshold);
    setShowHeatmap(config.heatmapEnabled);
    setShowFlow(config.flowVisualization);
    setLayoutType('force');
    handleCenter();
  };

  const handleExport = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'influence-mapping.svg';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Paper className={className} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Influence Mapping</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Center">
            <IconButton onClick={handleCenter} size="small">
              <CenterFocusStrong />
            </IconButton>
          </Tooltip>
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
        <Chip label={`Nodes: ${processedData.nodes.length}`} size="small" />
        <Chip label={`Edges: ${processedData.edges.length}`} size="small" />
        <Chip label={`Density: ${(metrics.networkDensity * 100).toFixed(1)}%`} size="small" />
        <Chip label={`Avg Influence: ${(metrics.totalInfluence / processedData.nodes.length).toFixed(3)}`} size="small" />
        <Chip label={`Zoom: ${(zoom * 100).toFixed(0)}%`} size="small" />
      </Box>

      {/* Settings Panel */}
      {showSettings && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Layout</InputLabel>
              <Select
                value={layoutType}
                label="Layout"
                onChange={(e) => setLayoutType(e.target.value as any)}
              >
                <MenuItem value="force">Force-Directed</MenuItem>
                <MenuItem value="radial">Radial</MenuItem>
                <MenuItem value="hierarchical">Hierarchical</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ minWidth: 150 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Threshold: {threshold.toFixed(2)}
              </Typography>
              <Slider
                value={threshold}
                onChange={(_, value) => setThreshold(value as number)}
                min={0}
                max={1}
                step={0.01}
                size="small"
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  size="small"
                />
              }
              label="Show Heatmap"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={showFlow}
                  onChange={(e) => setShowFlow(e.target.checked)}
                  size="small"
                />
              }
              label="Show Flow"
            />
          </Box>
        </Box>
      )}

      {/* Main Visualization */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
        {/* Network Visualization */}
        <Box sx={{ flex: 1, position: 'relative', border: '1px solid #ddd', borderRadius: 1 }}>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{ minHeight: height }}
          />
        </Box>

        {/* Side Panel */}
        <Box sx={{ width: 250, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Influence Metrics */}
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Influence Metrics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp fontSize="small" />
                  <Typography variant="body2">
                    Total: {metrics.totalInfluence.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountTree fontSize="small" />
                  <Typography variant="body2">
                    Density: {(metrics.networkDensity * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <Typography variant="body2">
                  Avg Susceptibility: {metrics.averageSusceptibility.toFixed(3)}
                </Typography>
                <Typography variant="body2">
                  Avg Persuasiveness: {metrics.averagePersuasiveness.toFixed(3)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Top Influencers */}
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Top Influencers
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {metrics.topInfluencers.slice(0, 3).map((agentId, index) => (
                  <Chip
                    key={agentId}
                    label={`${index + 1}. ${agentId}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Selection Info */}
          {(selectedNode || selectedFlow) && (
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Selection
                </Typography>
                {selectedNode && (
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      Node: {selectedNode.id}
                    </Typography>
                    <Typography variant="body2">
                      Influence: {selectedNode.influenceScore.toFixed(3)}
                    </Typography>
                    <Typography variant="body2">
                      Susceptibility: {selectedNode.susceptibility.toFixed(3)}
                    </Typography>
                    <Typography variant="body2">
                      Persuasiveness: {selectedNode.persuasiveness.toFixed(3)}
                    </Typography>
                  </Box>
                )}
                {selectedFlow && (
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      Flow: {selectedFlow.source} → {selectedFlow.target}
                    </Typography>
                    <Typography variant="body2">
                      Strength: {selectedFlow.strength.toFixed(3)}
                    </Typography>
                    <Typography variant="body2">
                      Direction: {selectedFlow.direction}
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

InfluenceMapping.displayName = 'InfluenceMapping';

export default InfluenceMapping;