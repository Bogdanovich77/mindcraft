import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Slider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  BubbleChart as BubbleChartIcon,
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { MemorySystem } from '../../types/memory';

interface MemoryCorrelationAnalysisProps {
  memorySystem: MemorySystem;
  width?: number;
  height?: number;
  onCorrelationSelect?: (correlation: MemoryCorrelation) => void;
}

interface MemoryCorrelation {
  id: string;
  sourceId: string;
  targetId: string;
  sourceType: string;
  targetType: string;
  correlationType: 'semantic' | 'temporal' | 'causal' | 'associative';
  strength: number;
  confidence: number;
  description: string;
  evidence: string[];
  timestamp: number;
}

interface CorrelationSettings {
  correlationType: 'all' | 'semantic' | 'temporal' | 'causal' | 'associative';
  minStrength: number;
  minConfidence: number;
  showLabels: boolean;
  showEvidence: boolean;
  animationSpeed: number;
  layoutType: 'force' | 'circular' | 'hierarchical' | 'cluster';
  colorScheme: 'type' | 'strength' | 'confidence' | 'age';
}

const MemoryCorrelationAnalysis: React.FC<MemoryCorrelationAnalysisProps> = ({
  memorySystem,
  width = 800,
  height = 600,
  onCorrelationSelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCorrelation, setSelectedCorrelation] = useState<MemoryCorrelation | null>(null);
  const [settings, setSettings] = useState<CorrelationSettings>({
    correlationType: 'all',
    minStrength: 0.3,
    minConfidence: 0.5,
    showLabels: true,
    showEvidence: true,
    animationSpeed: 1,
    layoutType: 'force',
    colorScheme: 'type',
  });

  // Calculate memory correlations
  const correlations = useMemo(() => {
    const correlations: MemoryCorrelation[] = [];
    const correlationId = (source: string, target: string, type: string) => 
      `${source}-${target}-${type}`;

    // Semantic-episodic correlations
    if (memorySystem.semantic?.concepts && memorySystem.episodic?.events) {
      memorySystem.semantic.concepts.forEach(concept => {
        memorySystem.episodic!.events.forEach(event => {
          // Check if concept appears in event description
          const conceptInEvent = event.description.toLowerCase().includes(concept.name.toLowerCase()) ||
                                event.title.toLowerCase().includes(concept.name.toLowerCase());
          
          if (conceptInEvent) {
            correlations.push({
              id: correlationId(concept.id, event.id, 'semantic'),
              sourceId: concept.id,
              targetId: event.id,
              sourceType: 'semantic',
              targetType: 'episodic',
              correlationType: 'semantic',
              strength: Math.min(0.9, concept.strength * event.significance),
              confidence: 0.7 + Math.random() * 0.3,
              description: `Concept "${concept.name}" appears in event "${event.title}"`,
              evidence: [`Textual match in event description`, `Concept strength: ${concept.strength.toFixed(2)}`],
              timestamp: Math.max(concept.lastAccessed, event.startTime),
            });
          }

          // Temporal correlation - concept accessed near event time
          const timeDiff = Math.abs(concept.lastAccessed - event.startTime);
          if (timeDiff < 1000 * 60 * 60 * 24) { // Within 24 hours
            correlations.push({
              id: correlationId(concept.id, event.id, 'temporal'),
              sourceId: concept.id,
              targetId: event.id,
              sourceType: 'semantic',
              targetType: 'episodic',
              correlationType: 'temporal',
              strength: Math.max(0, 1 - timeDiff / (1000 * 60 * 60 * 24)),
              confidence: 0.6 + Math.random() * 0.4,
              description: `Concept "${concept.name}" accessed near event "${event.title}"`,
              evidence: [`Time difference: ${(timeDiff / (1000 * 60 * 60)).toFixed(1)} hours`],
              timestamp: Math.max(concept.lastAccessed, event.startTime),
            });
          }
        });
      });
    }

    // Procedural-episodic correlations
    if (memorySystem.procedural?.skills && memorySystem.episodic?.events) {
      memorySystem.procedural.skills.forEach(skill => {
        memorySystem.episodic!.events.forEach(event => {
          // Check if skill was used in event
          const skillInEvent = event.description.toLowerCase().includes(skill.name.toLowerCase()) ||
                              (event as any).skills?.includes(skill.id);
          
          if (skillInEvent) {
            correlations.push({
              id: correlationId(skill.id, event.id, 'causal'),
              sourceId: skill.id,
              targetId: event.id,
              sourceType: 'procedural',
              targetType: 'episodic',
              correlationType: 'causal',
              strength: Math.min(0.9, skill.proficiency.overall * event.significance),
              confidence: 0.8 + Math.random() * 0.2,
              description: `Skill "${skill.name}" likely used in event "${event.title}"`,
              evidence: [`Skill proficiency: ${skill.proficiency.overall.toFixed(2)}`, `Event significance: ${event.significance.toFixed(2)}`],
              timestamp: Math.max((skill as any).lastUsed || 0, event.startTime),
            });
          }
        });
      });
    }

    // Semantic-procedural correlations
    if (memorySystem.semantic?.concepts && memorySystem.procedural?.skills) {
      memorySystem.semantic.concepts.forEach(concept => {
        memorySystem.procedural!.skills.forEach(skill => {
          // Check if concept relates to skill (based on name/description similarity)
          const conceptInSkill = skill.name.toLowerCase().includes(concept.name.toLowerCase()) ||
                                (skill as any).description?.toLowerCase().includes(concept.name.toLowerCase());
          
          if (conceptInSkill) {
            correlations.push({
              id: correlationId(concept.id, skill.id, 'associative'),
              sourceId: concept.id,
              targetId: skill.id,
              sourceType: 'semantic',
              targetType: 'procedural',
              correlationType: 'associative',
              strength: (concept.strength + skill.proficiency.overall) / 2,
              confidence: 0.5 + Math.random() * 0.5,
              description: `Concept "${concept.name}" associated with skill "${skill.name}"`,
              evidence: [`Name/description similarity`, `Combined strength: ${((concept.strength + skill.proficiency.overall) / 2).toFixed(2)}`],
              timestamp: Math.max(concept.lastAccessed, (skill as any).lastUsed || 0),
            });
          }
        });
      });
    }

    return correlations;
  }, [memorySystem]);

  // Filter correlations based on settings
  const filteredCorrelations = useMemo(() => {
    return correlations.filter(correlation => {
      if (settings.correlationType !== 'all' && correlation.correlationType !== settings.correlationType) {
        return false;
      }
      if (correlation.strength < settings.minStrength) {
        return false;
      }
      if (correlation.confidence < settings.minConfidence) {
        return false;
      }
      return true;
    });
  }, [correlations, settings]);

  // Create nodes and links for visualization
  const graphData = useMemo(() => {
    const nodes = new Map<string, any>();
    const links: any[] = [];

    filteredCorrelations.forEach(correlation => {
      // Add source node if not exists
      if (!nodes.has(correlation.sourceId)) {
        const sourceNode = findMemoryNode(correlation.sourceId, correlation.sourceType);
        if (sourceNode) {
          nodes.set(correlation.sourceId, {
            id: correlation.sourceId,
            name: sourceNode.name,
            type: correlation.sourceType,
            group: correlation.sourceType,
            data: sourceNode,
          });
        }
      }

      // Add target node if not exists
      if (!nodes.has(correlation.targetId)) {
        const targetNode = findMemoryNode(correlation.targetId, correlation.targetType);
        if (targetNode) {
          nodes.set(correlation.targetId, {
            id: correlation.targetId,
            name: targetNode.name,
            type: correlation.targetType,
            group: correlation.targetType,
            data: targetNode,
          });
        }
      }

      // Add link
      links.push({
        source: correlation.sourceId,
        target: correlation.targetId,
        correlation,
        value: correlation.strength,
        strength: correlation.strength,
        confidence: correlation.confidence,
        type: correlation.correlationType,
      });
    });

    return {
      nodes: Array.from(nodes.values()),
      links,
    };
  }, [filteredCorrelations]);

  // Helper function to find memory node by ID and type
  const findMemoryNode = (id: string, type: string) => {
    switch (type) {
      case 'semantic':
        return memorySystem.semantic?.concepts.find(c => c.id === id);
      case 'episodic':
        return memorySystem.episodic?.events.find(e => e.id === id);
      case 'procedural':
        return memorySystem.procedural?.skills.find(s => s.id === id);
      default:
        return null;
    }
  };

  // Color scales
  const getColorScale = () => {
    switch (settings.colorScheme) {
      case 'type':
        return d3.scaleOrdinal()
          .domain(['semantic', 'episodic', 'procedural'])
          .range(['#4CAF50', '#2196F3', '#FF9800']);
      case 'strength':
        return d3.scaleSequential(d3.interpolateViridis).domain([0, 1]);
      case 'confidence':
        return d3.scaleSequential(d3.interpolatePlasma).domain([0, 1]);
      case 'age':
        return d3.scaleSequential(d3.interpolateWarm).domain([Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()]);
      default:
        return d3.scaleOrdinal(['#999']);
    }
  };

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || graphData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const colorScale = getColorScale();

    // Create force simulation
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links)
        .id((d: any) => d.id)
        .distance(d => 100 / (d.value || 0.5)))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graphData.links)
      .enter()
      .append('line')
      .attr('stroke', (d: any) => {
        if (settings.colorScheme === 'type') {
          return d.type === 'semantic' ? '#4CAF50' :
                 d.type === 'temporal' ? '#2196F3' :
                 d.type === 'causal' ? '#FF9800' : '#9C27B0';
        }
        return colorScale(d.strength || 0.5) as string;
      })
      .attr('stroke-width', d => Math.max(1, d.value * 5))
      .attr('stroke-opacity', d => d.confidence || 0.5)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        setSelectedCorrelation(d.correlation);
        onCorrelationSelect?.(d.correlation);
      })
      .on('mouseover', function(_event, d) {
        d3.select(this)
          .attr('stroke-width', Math.max(3, d.value * 8))
          .attr('stroke-opacity', 1);
      })
      .on('mouseout', function(_event, d) {
        d3.select(this)
          .attr('stroke-width', Math.max(1, d.value * 5))
          .attr('stroke-opacity', d.confidence || 0.5);
      });

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(graphData.nodes)
      .enter()
      .append('circle')
      .attr('r', 15)
      .attr('fill', (d: any) => colorScale(d.type || d.group) as string)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, any>()
        .on('start', (_event, d) => {
          if (!(_event as any).active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (_event, d) => {
          d.fx = (_event as any).x;
          d.fy = (_event as any).y;
        })
        .on('end', (_event, d) => {
          if (!(_event as any).active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any)
      .on('mouseover', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 20);

        // Tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('opacity', 0);

        tooltip.html(`
          <div><strong>${d.name}</strong></div>
          <div>Type: ${d.type}</div>
          <div>Connections: ${graphData.links.filter(l => l.source.id === d.id || l.target.id === d.id).length}</div>
        `)
        .style('left', ((_event as any).pageX + 10) + 'px')
        .style('top', ((_event as any).pageY - 10) + 'px')
        .style('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 15);

        d3.selectAll('.tooltip').remove();
      });

    // Add labels
    if (settings.showLabels && graphData.nodes.length <= 50) {
      g.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(graphData.nodes)
        .enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .style('font-size', '10px')
        .style('fill', '#333')
        .style('pointer-events', 'none')
        .text(d => d.name.length > 10 ? d.name.substring(0, 10) + '...' : d.name);
    }

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      if (settings.showLabels && graphData.nodes.length <= 50) {
        g.selectAll('text')
          .attr('x', (d: any) => d.x)
          .attr('y', (d: any) => d.y + 25);
      }
    });

  }, [graphData, width, height, settings, getColorScale]);

  const handleRefresh = () => {
    // Trigger recalculation
    setSelectedCorrelation(null);
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Memory Correlation Analysis</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fullscreen">
            <IconButton>
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 2
      }}>
        <FormControl fullWidth size="small">
          <InputLabel>Correlation Type</InputLabel>
          <Select
            value={settings.correlationType}
            label="Correlation Type"
            onChange={(e) => setSettings(prev => ({
              ...prev,
              correlationType: e.target.value as any
            }))}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="semantic">Semantic</MenuItem>
            <MenuItem value="temporal">Temporal</MenuItem>
            <MenuItem value="causal">Causal</MenuItem>
            <MenuItem value="associative">Associative</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Layout</InputLabel>
          <Select
            value={settings.layoutType}
            label="Layout"
            onChange={(e) => setSettings(prev => ({
              ...prev,
              layoutType: e.target.value as any
            }))}
          >
            <MenuItem value="force">Force Directed</MenuItem>
            <MenuItem value="circular">Circular</MenuItem>
            <MenuItem value="hierarchical">Hierarchical</MenuItem>
            <MenuItem value="cluster">Cluster</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Color Scheme</InputLabel>
          <Select
            value={settings.colorScheme}
            label="Color Scheme"
            onChange={(e) => setSettings(prev => ({
              ...prev,
              colorScheme: e.target.value as any
            }))}
          >
            <MenuItem value="type">By Type</MenuItem>
            <MenuItem value="strength">By Strength</MenuItem>
            <MenuItem value="confidence">By Confidence</MenuItem>
            <MenuItem value="age">By Age</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.showLabels}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  showLabels: e.target.checked
                }))}
              />
            }
            label="Labels"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showEvidence}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  showEvidence: e.target.checked
                }))}
              />
            }
            label="Evidence"
          />
        </Box>
      </Box>

      {/* Strength and Confidence Sliders */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 2,
        mb: 2
      }}>
        <Box>
          <Typography variant="body2" gutterBottom>
            Min Strength: {settings.minStrength.toFixed(2)}
          </Typography>
          <Slider
            value={settings.minStrength}
            onChange={(_, value) => setSettings(prev => ({
              ...prev,
              minStrength: value as number
            }))}
            min={0}
            max={1}
            step={0.05}
            marks={[
              { value: 0, label: '0' },
              { value: 0.5, label: '0.5' },
              { value: 1, label: '1' }
            ]}
          />
        </Box>

        <Box>
          <Typography variant="body2" gutterBottom>
            Min Confidence: {settings.minConfidence.toFixed(2)}
          </Typography>
          <Slider
            value={settings.minConfidence}
            onChange={(_, value) => setSettings(prev => ({
              ...prev,
              minConfidence: value as number
            }))}
            min={0}
            max={1}
            step={0.05}
            marks={[
              { value: 0, label: '0' },
              { value: 0.5, label: '0.5' },
              { value: 1, label: '1' }
            ]}
          />
        </Box>
      </Box>

      {/* Status */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Chip 
          label={`Correlations: ${filteredCorrelations.length}`}
          size="small"
          color="primary"
        />
        <Chip 
          label={`Nodes: ${graphData.nodes.length}`}
          size="small"
        />
        <Chip 
          label={`Type: ${settings.correlationType}`}
          size="small"
        />
        <Chip 
          label={`Layout: ${settings.layoutType}`}
          size="small"
        />
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', gap: 2 }}>
        {/* Visualization */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <svg ref={svgRef} />
        </Box>

        {/* Selected Correlation Details */}
        {selectedCorrelation && (
          <Box sx={{ width: 300, overflow: 'auto' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Correlation Details
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedCorrelation.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Properties
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Type" 
                      secondary={selectedCorrelation.correlationType} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Strength" 
                      secondary={selectedCorrelation.strength.toFixed(3)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Confidence" 
                      secondary={selectedCorrelation.confidence.toFixed(3)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Source" 
                      secondary={`${selectedCorrelation.sourceType} -> ${selectedCorrelation.targetType}`} 
                    />
                  </ListItem>
                </List>

                {settings.showEvidence && selectedCorrelation.evidence.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Evidence
                    </Typography>
                    <List dense>
                      {selectedCorrelation.evidence.map((evidence, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <BubbleChartIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={evidence} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default MemoryCorrelationAnalysis;