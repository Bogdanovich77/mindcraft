/**
 * Social Relationship Network
 * 
 * Interactive visualization of agent relationships, trust levels, and social dynamics,
 * showing how agents interact and form social bonds over time.
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
  People as PeopleIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Heart as HeartIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import type { AgentState } from '../../types/agent';
import * as d3 from 'd3';

interface SocialRelationshipNetworkProps {
  width?: number;
  height?: number;
  className?: string;
}

interface SocialNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'agent' | 'group';
  importance: number;
  connections: number;
  lastInteraction: number;
  group?: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  avatar?: string;
  status?: 'active' | 'idle' | 'offline';
}

interface SocialLink extends d3.SimulationLinkDatum<SocialNode> {
  source: string | SocialNode;
  target: string | SocialNode;
  strength: number;
  type: 'friendship' | 'trust' | 'collaboration' | 'conflict' | 'communication';
  frequency: number;
  lastInteraction: number;
  trustLevel?: number;
  friendshipScore?: number;
}

const SocialRelationshipNetwork: React.FC<SocialRelationshipNetworkProps> = ({
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
  const [selectedNode, setSelectedNode] = useState<SocialNode | null>(null);
  const [linkFilter, setLinkFilter] = useState<'all' | 'friendship' | 'trust' | 'collaboration' | 'conflict' | 'communication'>('all');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showGroups, setShowGroups] = useState<boolean>(true);
  const [minTrustLevel, setMinTrustLevel] = useState<number>(0);
  const [maxTrustLevel, setMaxTrustLevel] = useState<number>(100);
  const [minFriendshipScore, setMinFriendshipScore] = useState<number>(0);
  const [maxFriendshipScore, setMaxFriendshipScore] = useState<number>(100);
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<SocialNode | null>(null);

  // Process social relationship data for visualization
  const processSocialData = (): { nodes: SocialNode[], links: SocialLink[] } => {
    if (!agents || agents.length === 0) return { nodes: [], links: [] };

    const nodes: SocialNode[] = [];
    const links: SocialLink[] = [];
    const nodeMap = new Map<string, SocialNode>();

    // Process agents as nodes
    agents.forEach((agent: any, index) => {
      const node: SocialNode = {
        id: `agent_${agent.id}`,
        name: agent.name || `Agent ${index}`,
        type: 'agent',
        importance: agent.social?.influence || 50,
        connections: 0,
        lastInteraction: agent.lastUpdate || Date.now(),
        group: 'agents',
        avatar: agent.avatar || '',
        status: agent.isActive ? 'active' : 'idle'
      };
      nodes.push(node);
      nodeMap.set(node.id, node);
    });

    // Process social relationships as links
    agents.forEach((agent: any) => {
      if (agent.social?.relationships) {
        agent.social.relationships.forEach((relationship: any) => {
          const sourceId = `agent_${agent.id}`;
          const targetId = `agent_${relationship.targetAgentId}`;
          
          if (nodeMap.has(sourceId) && nodeMap.has(targetId)) {
            links.push({
              source: sourceId,
              target: targetId,
              strength: relationship.strength || 50,
              type: relationship.type || 'friendship',
              frequency: relationship.interactionCount || 1,
              lastInteraction: relationship.lastInteraction || Date.now(),
              trustLevel: relationship.trustLevel || 50,
              friendshipScore: relationship.friendshipScore || 50
            });
          }
        });
      }
    });

    // Process group relationships
    if (agents.some(a => a.social?.groups)) {
      const groups = new Map<string, SocialNode>();
      
      agents.forEach((agent: any) => {
        if (agent.social?.groups) {
          agent.social.groups.forEach((group: any) => {
            if (!groups.has(group.id)) {
              const groupNode: SocialNode = {
                id: `group_${group.id}`,
                name: group.name || `Group ${group.id}`,
                type: 'group',
                importance: group.importance || 50,
                connections: 0,
                lastInteraction: Date.now(),
                group: 'groups'
              };
              groups.set(group.id, groupNode);
              nodes.push(groupNode);
            }
            
            // Create links between group members and groups
            if (group.members) {
              group.members.forEach((memberId: string) => {
                const agentId = `agent_${memberId}`;
                if (nodeMap.has(agentId)) {
                  links.push({
                    source: agentId,
                    target: `group_${group.id}`,
                    strength: 80,
                    type: 'collaboration',
                    frequency: 5,
                    lastInteraction: Date.now()
                  });
                }
              });
            }
          });
        }
      });
    }

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
    const { nodes, links } = processSocialData();
    
    let filteredLinks = links.filter(link => 
      linkFilter === 'all' || link.type === linkFilter
    );

    // Filter by trust level and friendship score
    filteredLinks = filteredLinks.filter(link => {
      const meetsTrustLevel = (!link.trustLevel || link.trustLevel >= minTrustLevel && link.trustLevel <= maxTrustLevel);
      const meetsFriendshipScore = (!link.friendshipScore || link.friendshipScore >= minFriendshipScore && link.friendshipScore <= maxFriendshipScore);
      return meetsTrustLevel && meetsFriendshipScore;
    });

    return { nodes, links: filteredLinks };
  };

  // Get node color based on type and status
  const getNodeColor = (nodeType: string, status?: string) => {
    switch (nodeType) {
      case 'agent':
        return status === 'active' ? theme.palette.success.main : 
               status === 'idle' ? theme.palette.warning.main : 
               theme.palette.primary.main;
      case 'group':
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get node size based on importance
  const getNodeSize = (importance: number) => {
    return 8 + (importance / 100) * 12;
  };

  // Get link color based on type and strength
  const getLinkColor = (linkType: string, strength: number) => {
    const baseColor = {
      friendship: theme.palette.success.main,
      trust: theme.palette.primary.main,
      collaboration: theme.palette.info.main,
      conflict: theme.palette.error.main,
      communication: theme.palette.warning.main
    }[linkType] || theme.palette.grey[400];

    // Adjust opacity based on strength
    const opacity = 0.3 + (strength / 100) * 0.7;
    return baseColor + Math.floor(opacity * 255).toString(16).padStart(2, '0');
  };

  // Get link width based on frequency
  const getLinkWidth = (frequency: number) => {
    return Math.max(1, Math.sqrt(frequency) * 3);
  };

  // Initialize and update D3 visualization
  useEffect(() => {
    if (!svgRef.current || !agents) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { nodes, links } = getFilteredData();

    // Create force simulation
    const simulation = d3.forceSimulation<SocialNode>(nodes)
      .force('link', d3.forceLink<SocialNode, SocialLink>(links)
        .id(d => d.id)
        .strength(d => d.strength / 100)
      )
      .force('charge', d3.forceManyBody().strength(-400))
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
      .attr('stroke-width', d => getLinkWidth(d.frequency))
      .attr('stroke-dasharray', d => d.type === 'conflict' ? '5,5' : 'none');

    // Create node groups
    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .call(d3.drag<SVGGElement, SocialNode>()
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

    // Create node shapes
    const node = nodeGroup.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g');

    // Add different shapes for different node types
    const agentNodes = node.filter(d => d.type === 'agent');
    agentNodes.append('circle')
      .attr('r', d => getNodeSize(d.importance))
      .attr('fill', d => getNodeColor(d.type, d.status))
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    const groupNodes = node.filter(d => d.type === 'group');
    groupNodes.append('rect')
      .attr('width', d => getNodeSize(d.importance) * 1.5)
      .attr('height', d => getNodeSize(d.importance) * 1.5)
      .attr('x', d => -getNodeSize(d.importance) * 0.75)
      .attr('y', d => -getNodeSize(d.importance) * 0.75)
      .attr('rx', 8)
      .attr('fill', d => getNodeColor(d.type))
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add avatars for agents
    const avatarNodes = node.filter(d => d.type === 'agent' && d.avatar);
    avatarNodes.append('image')
      .attr('xlink:href', d => d.avatar || '')
      .attr('x', d => -getNodeSize(d.importance) / 2)
      .attr('y', d => -getNodeSize(d.importance) / 2)
      .attr('width', d => getNodeSize(d.importance))
      .attr('height', d => getNodeSize(d.importance))
      .attr('clip-path', 'circle()');

    // Add group icons
    const groupIconNodes = node.filter(d => d.type === 'group');
    groupIconNodes.append('text')
      .text('👥')
      .attr('font-size', d => getNodeSize(d.importance))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central');

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
        
        let tooltipContent = `
          <div>
            <strong>${d.name}</strong><br/>
            Type: ${d.type}<br/>
            Importance: ${d.importance.toFixed(0)}<br/>
            Connections: ${d.connections}<br/>
            Last Interaction: ${new Date(d.lastInteraction).toLocaleString()}
        `;
        
        if (d.type === 'agent') {
          const agent = agents.find((a: any) => a.id === d.id.replace('agent_', ''));
          if (agent) {
            tooltipContent += `
              Status: ${d.status}<br/>
              Trust Level: ${agent.social?.trustLevel || 50}<br/>
              Friendship Score: ${agent.social?.friendshipScore || 50}
            `;
          }
        }
        
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
        .attr('x1', d => (d.source as SocialNode).x || 0)
        .attr('y1', d => (d.source as SocialNode).y || 0)
        .attr('x2', d => (d.target as SocialNode).x || 0)
        .attr('y2', d => (d.target as SocialNode).y || 0);

      nodeGroup
        .attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [agents, linkFilter, showLabels, showGroups, minTrustLevel, maxTrustLevel, minFriendshipScore, maxFriendshipScore, width, height]);

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
        <Typography variant="h6">Social Relationship Network</Typography>
        
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
          <InputLabel>Link Filter</InputLabel>
          <Select
            value={linkFilter}
            label="Relationship Type"
            onChange={(e) => setLinkFilter(e.target.value as any)}
          >
            <MenuItem value="all">All Relationships</MenuItem>
            <MenuItem value="friendship">Friendship</MenuItem>
            <MenuItem value="trust">Trust</MenuItem>
            <MenuItem value="collaboration">Collaboration</MenuItem>
            <MenuItem value="conflict">Conflict</MenuItem>
            <MenuItem value="communication">Communication</MenuItem>
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
          <InputLabel>Groups</InputLabel>
          <Switch
            checked={showGroups}
            onChange={(e) => setShowGroups(e.target.checked)}
            size="small"
          />
        </FormControl>
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <Box flex={1}>
          <Typography variant="body2" color="textSecondary">Trust Level Range</Typography>
          <Slider
            value={[minTrustLevel, maxTrustLevel]}
            onChange={(e, newValue) => {
              setMinTrustLevel(newValue[0]);
              setMaxTrustLevel(newValue[1]);
            }}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            step={5}
          />
        </Box>
        
        <Box flex={1}>
          <Typography variant="body2" color="textSecondary">Friendship Score Range</Typography>
          <Slider
            value={[minFriendshipScore, maxFriendshipScore]}
            onChange={(e, newValue) => {
              setMinFriendshipScore(newValue[0]);
              setMaxFriendshipScore(newValue[1]);
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
            {selectedNode.type === 'agent' ? <PersonIcon /> : <GroupIcon />} {selectedNode.name}
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
              <Typography variant="body2" color="textSecondary">Connections</Typography>
              <Typography variant="body1">{selectedNode.connections}</Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary">Last Interaction</Typography>
              <Typography variant="body1">{new Date(selectedNode.lastInteraction).toLocaleString()}</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {hoveredNode && (
        <Box mt={2} p={2} bgcolor={theme.palette.grey[50]} borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            {hoveredNode.type === 'agent' ? <PersonIcon /> : <GroupIcon />} {hoveredNode.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Type: {hoveredNode.type} | Importance: {hoveredNode.importance.toFixed(0)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Last Interaction: {new Date(hoveredNode.lastInteraction).toLocaleString()}
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
          label={`${getFilteredData().links.length} relationships`}
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

export default SocialRelationshipNetwork;