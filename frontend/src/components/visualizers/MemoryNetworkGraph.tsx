/**
 * Memory Network Graph
 * 
 * Interactive visualization of semantic memory connections, showing how
 * concepts, entities, experiences, and emotions are interconnected in the agent's mind.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem, Chip, Switch, Slider } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  CenterFocusStrong as CenterIcon,
  FilterList as FilterIcon,
  Public as PublicIcon,
  Visibility as VisibilityIcon,
  Memory as MemoryIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  Hub as HubIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import type { AgentState } from '../../types/agent';
import * as d3 from 'd3';

interface MemoryNetworkGraphProps {
  width?: number;
  height?: number;
  className?: string;
}

interface MemoryNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'concept' | 'entity' | 'experience' | 'emotion' | 'skill' | 'goal';
  importance: number;
  strength: number;
  lastAccessed: number;
  connections: number;
  group?: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface MemoryLink extends d3.SimulationLinkDatum<MemoryNode> {
  source: string | MemoryNode;
  target: string | MemoryNode;
  strength: number;
  type: 'semantic' | 'temporal' | 'causal' | 'associative';
  frequency: number;
  lastAccessed: number;
}

const MemoryNetworkGraph: React.FC<MemoryNetworkGraphProps> = ({
  width = 800,
  height = 600,
  className
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Redux state
  const { agents } = useSelector((state: RootState) => state.agents as any);
  
  // Component state
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [nodeFilter, setNodeFilter] = useState<'all' | 'concept' | 'entity' | 'experience' | 'emotion' | 'skill' | 'goal'>('all');
  const [linkFilter, setLinkFilter] = useState<'all' | 'semantic' | 'temporal' | 'causal' | 'associative'>('all');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showStrength, setShowStrength] = useState<boolean>(true);
  const [minImportance, setMinImportance] = useState<number>(0);
  const [maxImportance, setMaxImportance] = useState<number>(100);
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<MemoryNode | null>(null);

  // Process memory data for visualization
  const processMemoryData = (): { nodes: MemoryNode[], links: MemoryLink[] } => {
    if (!agents || agents.length === 0) return { nodes: [], links: [] };

    const nodes: MemoryNode[] = [];
    const links: MemoryLink[] = [];
    const nodeMap = new Map<string, MemoryNode>();

    // Process selected agent's memory
    const agent = agents.find(a => a.id === selectedAgent);
    if (!agent) return { nodes: [], links: [] };

    // Process semantic memory concepts
    if (agent.cognitive?.memory?.semantic) {
      const semantic = agent.cognitive.memory.semantic;
      
      // Add concept nodes
      if (semantic.concepts) {
        semantic.concepts.forEach((concept, index) => {
          const node: MemoryNode = {
            id: `concept_${concept.id}`,
            name: concept.name || `Concept ${index}`,
            type: 'concept',
            importance: concept.importance || 50,
            strength: concept.strength || 50,
            lastAccessed: concept.lastAccessed || Date.now(),
            connections: 0,
            group: 'concepts'
          };
          nodes.push(node);
          nodeMap.set(node.id, node);
        });
      }

      // Add entity nodes
      if (semantic.entities) {
        semantic.entities.forEach((entity, index) => {
          const node: MemoryNode = {
            id: `entity_${entity.id}`,
            name: entity.name || `Entity ${index}`,
            type: 'entity',
            importance: entity.importance || 50,
            strength: entity.confidence || 50,
            lastAccessed: entity.lastAccessed || Date.now(),
            connections: 0,
            group: 'entities'
          };
          nodes.push(node);
          nodeMap.set(node.id, node);
        });
      }

      // Add relationships as links
      if (semantic.relationships) {
        semantic.relationships.forEach((relationship) => {
          const sourceId = `${relationship.type}_${relationship.source}`;
          const targetId = `${relationship.type}_${relationship.target}`;
          
          if (nodeMap.has(sourceId) && nodeMap.has(targetId)) {
            links.push({
              source: sourceId,
              target: targetId,
              strength: relationship.strength || 50,
              type: relationship.type || 'semantic',
              frequency: relationship.frequency || 1,
              lastAccessed: relationship.lastAccessed || Date.now()
            });
          }
        });
      }
    }

    // Process episodic memory experiences
    if (agent.cognitive?.memory?.episodic) {
      const episodic = agent.cognitive.memory.episodic;
      
      if (episodic.events) {
        episodic.events.forEach((event, index) => {
          const node: MemoryNode = {
            id: `experience_${event.id}`,
            name: event.description || `Experience ${index}`,
            type: 'experience',
            importance: event.importance || 50,
            strength: event.emotionalImpact || 50,
            lastAccessed: event.timestamp || Date.now(),
            connections: 0,
            group: 'experiences'
          };
          nodes.push(node);
          nodeMap.set(node.id, node);
        });
      }
    }

    // Process procedural memory skills
    if (agent.cognitive?.memory?.procedural) {
      const procedural = agent.cognitive.memory.procedural;
      
      if (procedural.skills) {
        procedural.skills.forEach((skill, index) => {
          const node: MemoryNode = {
            id: `skill_${skill.id}`,
            name: skill.name || `Skill ${index}`,
            type: 'skill',
            importance: skill.proficiency || 50,
            strength: skill.frequency || 50,
            lastAccessed: skill.lastUsed || Date.now(),
            connections: 0,
            group: 'skills'
          };
          nodes.push(node);
          nodeMap.set(node.id, node);
        });
      }
    }

    // Process working memory goals
    if (agent.cognitive?.memory?.working) {
      const working = agent.cognitive.memory.working;
      
      if (working.activeGoals) {
        working.activeGoals.forEach((goal, index) => {
          const node: MemoryNode = {
            id: `goal_${goal.id}`,
            name: goal.description || `Goal ${index}`,
            type: 'goal',
            importance: goal.priority || 50,
            strength: goal.progress?.percentage || 50,
            lastAccessed: goal.createdAt || Date.now(),
            connections: 0,
            group: 'goals'
          };
          nodes.push(node);
          nodeMap.set(node.id, node);
        });
      }
    }

    // Create associative links based on temporal proximity
    nodes.forEach((node1, index1) => {
      nodes.forEach((node2, index2) => {
        if (node1.id !== node2.id) {
          const timeDiff = Math.abs(node1.lastAccessed - node2.lastAccessed);
          const importanceDiff = Math.abs(node1.importance - node2.importance);
          
          // Create links for temporally related memories
          if (timeDiff < 86400000) { // Within 24 hours
            links.push({
              source: node1.id,
              target: node2.id,
              strength: Math.max(0, 100 - timeDiff / 864000),
              type: 'temporal',
              frequency: 1,
              lastAccessed: Math.max(node1.lastAccessed, node2.lastAccessed)
            });
          }
          
          // Create links for semantically related memories
          if (importanceDiff < 20) {
            links.push({
              source: node1.id,
              target: node2.id,
              strength: Math.max(0, 100 - importanceDiff),
              type: 'associative',
              frequency: 1,
              lastAccessed: Math.max(node1.lastAccessed, node2.lastAccessed)
            });
          }
        }
      });
    });

    // Update connection counts
    links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      
      const sourceNode = nodeMap.get(sourceId);
      const targetNode = nodeMap.get(targetId);
      
      if (sourceNode) sourceNode.connections++;
      if (targetNode) targetNode.connections++;
    });

    return { nodes, links };
  };

  // Get filtered data
  const getFilteredData = () => {
    const { nodes, links } = processMemoryData();
    
    let filteredNodes = nodes.filter(node => 
      node.importance >= minImportance && 
      node.importance <= maxImportance &&
      (nodeFilter === 'all' || node.type === nodeFilter)
    );
    
    let filteredLinks = links.filter(link => 
      linkFilter === 'all' || link.type === linkFilter
    );

    return { nodes: filteredNodes, links: filteredLinks };
  };

  // Get node color based on type
  const getNodeColor = (nodeType: string, importance: number) => {
    const baseColor = {
      concept: theme.palette.primary.main,
      entity: theme.palette.secondary.main,
      experience: theme.palette.info.main,
      emotion: theme.palette.error.main,
      skill: theme.palette.success.main,
      goal: theme.palette.warning.main
    }[nodeType] || theme.palette.grey[500];

    // Adjust opacity based on importance
    const opacity = 0.3 + (importance / 100) * 0.7;
    return baseColor + Math.floor(opacity * 255).toString(16).padStart(2, '0');
  };

  // Get node size based on importance
  const getNodeSize = (importance: number) => {
    return 5 + (importance / 100) * 15;
  };

  // Get link color based on type
  const getLinkColor = (linkType: string, strength: number) => {
    const baseColor = {
      semantic: theme.palette.primary.main,
      temporal: theme.palette.info.main,
      causal: theme.palette.warning.main,
      associative: theme.palette.secondary.main
    }[linkType] || theme.palette.grey[400];

    // Adjust opacity based on strength
    const opacity = 0.2 + (strength / 100) * 0.8;
    return baseColor + Math.floor(opacity * 255).toString(16).padStart(2, '0');
  };

  // Get node icon based on type
  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'concept': return <PsychologyIcon />;
      case 'entity': return <PublicIcon />;
      case 'experience': return <TimelineIcon />;
      case 'emotion': return <MemoryIcon />;
      case 'skill': return <HubIcon />;
      case 'goal': return <VisibilityIcon />;
      default: return <MemoryIcon />;
    }
  };

  // Initialize and update D3 visualization
  useEffect(() => {
    if (!svgRef.current || !selectedAgent) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { nodes, links } = getFilteredData();

    // Create force simulation
    const simulation = d3.forceSimulation<MemoryNode>(nodes)
      .force('link', d3.forceLink<MemoryNode, MemoryLink>(links)
        .id(d => d.id)
        .strength(d => d.strength / 100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => getNodeSize(d.importance)));

    // Create zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Create main group
    const g = svg.append('g');

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => getLinkColor(d.type, d.strength))
      .attr('stroke-opacity', d => (d.strength / 100))
      .attr('stroke-width', d => Math.sqrt(d.frequency) * 2);

    // Create node groups
    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .call(d3.drag<SVGGElement, MemoryNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = undefined;
          d.fy = undefined;
        })
      );

    // Create node circles
    const node = nodeGroup.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g');

    node.append('circle')
      .attr('r', d => getNodeSize(d.importance))
      .attr('fill', d => getNodeColor(d.type, d.importance))
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add labels
    if (showLabels) {
      const label = nodeGroup.append('text')
        .text(d => d.name)
        .attr('font-size', 10)
        .attr('dx', d => getNodeSize(d.importance) / 2 + 5)
        .attr('dy', 4)
        .style('pointer-events', 'none')
        .style('fill', theme.palette.text.primary);
    }

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', theme.palette.background.paper)
      .style('border', `1px solid ${theme.palette.divider}`)
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

    // Add interaction events
    node
      .on('mouseover', (event, d) => {
        setHoveredNode(d);
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        
        const tooltipContent = `
          <div>
            <strong>${d.name}</strong><br/>
            Type: ${d.type}<br/>
            Importance: ${d.importance.toFixed(0)}<br/>
            Strength: ${d.strength.toFixed(0)}<br/>
            Connections: ${d.connections}<br/>
            Last Accessed: ${new Date(d.lastAccessed).toLocaleString()}
          </div>
        `;
        
        tooltip.html(tooltipContent)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        setHoveredNode(null);
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })
      .on('click', (event, d) => {
        setSelectedNode(d);
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as MemoryNode).x || 0)
        .attr('y1', d => (d.source as MemoryNode).y || 0)
        .attr('x2', d => (d.target as MemoryNode).x || 0)
        .attr('y2', d => (d.target as MemoryNode).y || 0);

      nodeGroup
        .attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [selectedAgent, nodeFilter, linkFilter, showLabels, minImportance, maxImportance, width, height]);

  // Handle zoom controls
  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
    (svg as any).transition().call(zoomBehavior.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
    (svg as any).transition().call(zoomBehavior.scaleBy, 0.7);
  };

  const handleCenter = () => {
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
    (svg as any).transition().call(zoomBehavior.transform, d3.zoomIdentity.translate(width / 2, height / 2));
  };

  const handleRefresh = () => {
    // Force re-render
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    // Re-render will be triggered by useEffect
  };

  const selectedAgentData = selectedAgent ? agents.find((a: any) => a.id === selectedAgent) : null;

  return (
    <Paper className={className} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Memory Network Graph</Typography>
        
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Agent</InputLabel>
            <Select
              value={selectedAgent}
              label="Select Agent"
              onChange={(e) => setSelectedAgent(e.target.value as any)}
            >
              {agents.map((agent: any) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.name || `Agent ${agent.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={handleZoomIn}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom Out">
            <IconButton size="small" onClick={handleZoomOut}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Center View">
            <IconButton size="small" onClick={handleCenter}>
              <CenterIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Node Filter</InputLabel>
          <Select
            value={nodeFilter}
            label="Node Type"
            onChange={(e) => setNodeFilter(e.target.value as any)}
          >
            <MenuItem value="all">All Nodes</MenuItem>
            <MenuItem value="concept">Concepts</MenuItem>
            <MenuItem value="entity">Entities</MenuItem>
            <MenuItem value="experience">Experiences</MenuItem>
            <MenuItem value="emotion">Emotions</MenuItem>
            <MenuItem value="skill">Skills</MenuItem>
            <MenuItem value="goal">Goals</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Link Filter</InputLabel>
          <Select
            value={linkFilter}
            label="Link Type"
            onChange={(e) => setLinkFilter(e.target.value as any)}
          >
            <MenuItem value="all">All Links</MenuItem>
            <MenuItem value="semantic">Semantic</MenuItem>
            <MenuItem value="temporal">Temporal</MenuItem>
            <MenuItem value="causal">Causal</MenuItem>
            <MenuItem value="associative">Associative</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Labels</InputLabel>
          <Switch
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            size="small"
          />
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Strength</InputLabel>
          <Switch
            checked={showStrength}
            onChange={(e) => setShowStrength(e.target.checked)}
            size="small"
          />
        </FormControl>
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <Box flex={1}>
          <Typography variant="body2" color="textSecondary">Importance Range</Typography>
          <Slider
            value={[minImportance, maxImportance]}
            onChange={(e, newValue) => {
              setMinImportance(newValue[0]);
              setMaxImportance(newValue[1]);
            }}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            step={5}
          />
        </Box>
      </Box>

      <Box display="flex" flex={1} position="relative" ref={containerRef}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '4px' }}
        />
      </Box>

      {selectedNode && (
        <Box mt={2} p={2} bgcolor={theme.palette.grey[50]} borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            {getNodeIcon(selectedNode.type)} {selectedNode.name}
          </Typography>
          
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">Type</Typography>
              <Typography variant="body1">{selectedNode.type}</Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">Importance</Typography>
              <Typography variant="body1">{selectedNode.importance.toFixed(0)}</Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">Strength</Typography>
              <Typography variant="body1">{selectedNode.strength.toFixed(0)}</Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">Connections</Typography>
              <Typography variant="body1">{selectedNode.connections}</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {hoveredNode && (
        <Box mt={2} p={2} bgcolor={theme.palette.grey[50]} borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            {getNodeIcon(hoveredNode.type)} {hoveredNode.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Type: {hoveredNode.type} | Importance: {hoveredNode.importance.toFixed(0)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Last Accessed: {new Date(hoveredNode.lastAccessed).toLocaleString()}
          </Typography>
        </Box>
      )}

      <Box mt={2} display="flex" gap={1} flexWrap="wrap">
        <Chip
          label={`Zoom: ${(zoom * 100).toFixed(0)}%`}
          size="small"
          color="primary"
        />
        <Chip
          label={`${getFilteredData().nodes.length} nodes`}
          size="small"
          color="secondary"
        />
        <Chip
          label={`${getFilteredData().links.length} links`}
          size="small"
          color="info"
        />
        <Chip
          label={selectedAgent ? selectedAgentData?.name || 'No Agent' : 'No Agent Selected'}
          size="small"
          color="warning"
        />
      </Box>
    </Paper>
  );
};

export default MemoryNetworkGraph;