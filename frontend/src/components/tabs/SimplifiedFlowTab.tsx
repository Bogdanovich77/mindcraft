import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import * as d3 from 'd3';
import {
  AccountTree as FlowIcon,
  Visibility as PerceptionIcon,
  Chat as ConversationIcon,
  Psychology as DecisionIcon,
  PlayArrow as ExecutionIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import type { AgentState } from '../../types/agent';

interface SimplifiedFlowTabProps {
  agent: AgentState;
  agentId: string;
}

interface FlowNode {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  status: 'active' | 'idle' | 'processing';
  icon: React.ReactNode;
}

interface FlowLink {
  source: string;
  target: string;
  type: 'conditional' | 'direct';
}

const SimplifiedFlowTab: React.FC<SimplifiedFlowTabProps> = ({ agent }) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentNode, setCurrentNode] = useState<string>('perception');
  
  const { lastAction, conversation } = agent;

  // Define the 4-node architecture
  const nodes: FlowNode[] = [
    {
      id: 'perception',
      name: 'Perception',
      description: 'Updates world context and checks for messages',
      x: 150,
      y: 150,
      status: 'active',
      icon: <PerceptionIcon />,
    },
    {
      id: 'conversation',
      name: 'Conversation',
      description: 'Generates personality-driven responses',
      x: 450,
      y: 100,
      status: conversation?.message ? 'active' : 'idle',
      icon: <ConversationIcon />,
    },
    {
      id: 'decision',
      name: 'Decision',
      description: 'Chooses actions based on goals and mandate',
      x: 450,
      y: 200,
      status: 'processing',
      icon: <DecisionIcon />,
    },
    {
      id: 'execution',
      name: 'Execution',
      description: 'Executes actions and sends responses',
      x: 750,
      y: 150,
      status: lastAction ? 'active' : 'idle',
      icon: <ExecutionIcon />,
    },
  ];

  const links: FlowLink[] = [
    { source: 'perception', target: 'conversation', type: 'conditional' },
    { source: 'perception', target: 'decision', type: 'conditional' },
    { source: 'conversation', target: 'decision', type: 'direct' },
    { source: 'decision', target: 'execution', type: 'direct' },
  ];

  // Create D3.js visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 900;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define arrow markers
    svg.append('defs')
      .selectAll('marker')
      .data(['arrow'])
      .enter().append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Draw links
    const link = g.selectAll('.link')
      .data(links)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', (d) => {
        const sourceNode = nodes.find(n => n.id === d.source);
        const targetNode = nodes.find(n => n.id === d.target);
        if (!sourceNode || !targetNode) return '';
        
        const startX = sourceNode.x + 40;
        const startY = sourceNode.y;
        const endX = targetNode.x - 40;
        const endY = targetNode.y;
        
        if (d.type === 'conditional') {
          // Curved path for conditional links
          const midX = (startX + endX) / 2;
          const midY = startY + (d.source === 'perception' && d.target === 'conversation' ? -20 : 20);
          return `M${startX},${startY} Q${midX},${midY} ${endX},${endY}`;
        } else {
          // Straight path for direct links
          return `M${startX},${startY} L${endX},${endY}`;
        }
      })
      .attr('stroke', d => d.type === 'conditional' ? '#ff9800' : '#2196f3')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrow)')
      .attr('stroke-dasharray', d => d.type === 'conditional' ? '5,5' : '0');

    // Draw nodes
    const nodeGroups = g.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setCurrentNode(d.id);
      });

    // Node backgrounds
    nodeGroups.append('rect')
      .attr('width', 80)
      .attr('height', 60)
      .attr('rx', 8)
      .attr('fill', d => {
        if (d.status === 'active') return '#4caf50';
        if (d.status === 'processing') return '#ff9800';
        return '#e0e0e0';
      })
      .attr('stroke', d => {
        if (d.id === currentNode) return theme.palette.primary.main;
        return '#fff';
      })
      .attr('stroke-width', d => d.id === currentNode ? 3 : 2);

    // Node labels
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 25)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#fff')
      .text(d => d.name);

    // Node descriptions
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 45)
      .style('font-size', '8px')
      .style('fill', '#fff')
      .text(d => d.id.substring(0, 3).toUpperCase());

    // START and END labels
    g.append('text')
      .attr('x', 50)
      .attr('y', 150)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', theme.palette.text.secondary)
      .text('START');

    g.append('text')
      .attr('x', 850)
      .attr('y', 150)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', theme.palette.text.secondary)
      .text('END');

  }, [nodes, links, currentNode, theme]);

  const getCurrentNodeInfo = () => {
    return nodes.find(n => n.id === currentNode) || nodes[0];
  };

  const currentNodeInfo = getCurrentNodeInfo();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Simplified Flow - {agent.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        4-node cognitive architecture visualization
      </Typography>

      <Grid container spacing={3}>
        {/* Flow Visualization */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <FlowIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Cognitive Flow Architecture
              </Typography>
              
              <Box sx={{ overflowX: 'auto', py: 2 }}>
                <svg ref={svgRef}></svg>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<div style={{ width: 12, height: 12, backgroundColor: '#4caf50', borderRadius: '50%' }} />}
                  label="Active"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<div style={{ width: 12, height: 12, backgroundColor: '#ff9800', borderRadius: '50%' }} />}
                  label="Processing"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<div style={{ width: 12, height: 12, backgroundColor: '#e0e0e0', borderRadius: '50%' }} />}
                  label="Idle"
                  size="small"
                  variant="outlined"
                />
                <Divider orientation="vertical" flexItem />
                <Chip
                  label="Direct Flow"
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: '#2196f3', color: '#2196f3' }}
                />
                <Chip
                  label="Conditional Flow"
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: '#ff9800', color: '#ff9800' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Node Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Node: {currentNodeInfo.name}
              </Typography>
              
              <Alert 
                severity={currentNodeInfo.status === 'active' ? 'success' : 
                          currentNodeInfo.status === 'processing' ? 'warning' : 'info'}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Status: {currentNodeInfo.status.toUpperCase()}
                </Typography>
                <Typography variant="caption">
                  {currentNodeInfo.description}
                </Typography>
              </Alert>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Node Function
                </Typography>
                <Typography variant="body1">
                  {currentNodeInfo.description}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Agent State
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="caption">Last Action:</Typography>
                    <Typography variant="body2">
                      {lastAction || 'No action executed'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption">Processing Message:</Typography>
                    <Typography variant="body2">
                      {conversation?.message || 'No message in conversation'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Node Descriptions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Node Descriptions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {nodes.map((node) => (
                  <Box 
                    key={node.id}
                    sx={{ 
                      p: 2, 
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      backgroundColor: node.id === currentNode ? theme.palette.action.selected : 'transparent'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {node.icon}
                      <Typography variant="subtitle2" sx={{ ml: 1 }}>
                        {node.name}
                      </Typography>
                      <Chip 
                        label={node.status}
                        size="small"
                        color={node.status === 'active' ? 'success' : 
                               node.status === 'processing' ? 'warning' : 'default'}
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {node.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Flow Logic */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Processing Logic
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Normal Flow
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    1. <strong>START</strong> → Perception Node<br/>
                    2. Updates world context and checks for messages<br/>
                    3. If no message → Decision Node<br/>
                    4. Decision Node → Execution Node<br/>
                    5. <strong>END</strong>
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Conversation Flow
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    1. <strong>START</strong> → Perception Node<br/>
                    2. Message detected → Conversation Node<br/>
                    3. Generate personality-driven response<br/>
                    4. Conversation → Decision → Execution<br/>
                    5. <strong>END</strong>
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Decision Priority:</strong> Mandate takes priority over autonomous goals, 
                  with all actions filtered through the agent's personality.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  The entire cycle completes in &lt;500ms for optimal responsiveness.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SimplifiedFlowTab;