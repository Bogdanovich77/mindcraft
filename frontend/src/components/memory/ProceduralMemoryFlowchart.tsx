/**
 * Procedural Memory Flowchart
 * 
 * Interactive flowchart visualization for procedural memory patterns.
 * Complements the existing ProceduralMemoryPatterns component with a different visualization approach.
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Slider,
  Switch,
  FormControlLabel,
  Chip,
  Button,
  Menu,
  Card,
  CardContent,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Settings as SettingsIcon,
  Psychology as SkillIcon,
  Pattern as PatternIcon,
  Code as SequenceIcon,
  Timeline as TimelineIcon,
  AccountTree as TreeIcon,
  Fullscreen as FullscreenIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { MemorySystem, ProceduralSkill, ActionPattern, SkillSequence } from '../../types/memory';

interface ProceduralMemoryFlowchartProps {
  memorySystem?: MemorySystem;
  loading?: boolean;
  onRefresh?: () => void;
}

interface FlowchartNode {
  id: string;
  name: string;
  type: 'skill' | 'pattern' | 'sequence' | 'decision' | 'start' | 'end';
  proficiency?: number;
  frequency?: number;
  category: string;
  color?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  level?: number;
  parent?: string;
  children?: string[];
  metadata?: Record<string, any>;
}

interface FlowchartLink {
  source: string;
  target: string;
  type: 'flow' | 'dependency' | 'enhancement' | 'trigger';
  strength: number;
  condition?: string;
}

const ProceduralMemoryFlowchart: React.FC<ProceduralMemoryFlowchartProps> = ({
  memorySystem,
  loading = false,
  onRefresh
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [nodeSpacing, setNodeSpacing] = useState(150);
  const [levelSpacing, setLevelSpacing] = useState(200);
  const [showLabels, setShowLabels] = useState(true);
  const [showProficiency, setShowProficiency] = useState(true);
  const [showFrequency, setShowFrequency] = useState(true);
  const [layoutType, setLayoutType] = useState<'horizontal' | 'vertical' | 'radial'>('horizontal');
  const [selectedNode, setSelectedNode] = useState<FlowchartNode | null>(null);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Color functions
  const getSkillColor = useCallback((category: string, proficiency: number): string => {
    const categoryColors: Record<string, string> = {
      'combat': '#f44336',
      'crafting': '#ff9800',
      'exploration': '#4caf50',
      'social': '#2196f3',
      'building': '#9c27b0',
    };
    const baseColor = categoryColors[category] || '#607d8b';
    return d3.color(baseColor)?.brighter(1 - proficiency)?.toString() || baseColor;
  }, []);

  const getPatternColor = useCallback((category: string, effectiveness: number): string => {
    const categoryColors: Record<string, string> = {
      'behavioral': '#ff5722',
      'cognitive': '#3f51b5',
      'motor': '#009688',
      'social': '#795548',
      'emotional': '#e91e63',
    };
    const baseColor = categoryColors[category] || '#607d8b';
    return d3.color(baseColor)?.brighter(1 - effectiveness)?.toString() || baseColor;
  }, []);

  const getSequenceColor = useCallback((category: string, completionRate: number): string => {
    const categoryColors: Record<string, string> = {
      'complex': '#673ab7',
      'simple': '#ffeb3b',
      'conditional': '#00bcd4',
      'iterative': '#8bc34a',
      'recursive': '#ff4081',
    };
    const baseColor = categoryColors[category] || '#607d8b';
    return d3.color(baseColor)?.brighter(1 - completionRate)?.toString() || baseColor;
  }, []);

  // Update dimensions on container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width - 32, height: rect.height - 32 });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Process memory data for flowchart visualization
  const layout = useMemo(() => {
    if (!memorySystem?.procedural) {
      return { nodes: [], links: [], width: 800, height: 600 };
    }

    const proceduralSkills = memorySystem.procedural.skills;
    const patterns = memorySystem.procedural.patterns;
    const sequences = memorySystem.procedural.sequences;

    // Create hierarchical flowchart nodes
    const flowchartNodes: FlowchartNode[] = [
      // Start node
      {
        id: 'start',
        name: 'Memory Initiation',
        type: 'start',
        category: 'system',
        color: '#4caf50',
        level: 0,
        children: []
      },

      // Skill nodes
      ...proceduralSkills.map((skill: ProceduralSkill, index: number) => ({
        id: `skill_${skill.id}`,
        name: skill.name,
        type: 'skill' as const,
        proficiency: skill.proficiency.overall,
        frequency: skill.components.length || 0,
        category: skill.category,
        color: getSkillColor(skill.category, skill.proficiency.overall),
        level: 1,
        parent: 'start',
        children: []
      })),

      // Pattern nodes
      ...patterns.map((pattern: ActionPattern, index: number) => ({
        id: `pattern_${pattern.id}`,
        name: pattern.name,
        type: 'pattern' as const,
        proficiency: pattern.strength || 0.5,
        frequency: pattern.frequency || 0,
        category: pattern.contexts?.[0] || 'unknown',
        color: getPatternColor(pattern.contexts?.[0] || 'unknown', pattern.strength || 0.5),
        level: 2,
        parent: proceduralSkills[0]?.id ? `skill_${proceduralSkills[0].id}` : 'start',
        children: []
      })),

      // Sequence nodes
      ...sequences.map((sequence: SkillSequence, index: number) => ({
        id: `sequence_${sequence.id}`,
        name: sequence.name,
        type: 'sequence' as const,
        proficiency: sequence.automation || 0.5,
        frequency: sequence.steps.length || 0,
        category: sequence.purpose || 'unknown',
        color: getSequenceColor(sequence.purpose || 'unknown', sequence.automation || 0.5),
        level: 3,
        parent: patterns[0]?.id ? `pattern_${patterns[0].id}` : 'start',
        children: []
      })),

      // Decision nodes
      {
        id: 'decision_1',
        name: 'Skill Selection',
        type: 'decision' as const,
        category: 'control',
        color: '#ff9800',
        level: 1,
        parent: 'start',
        children: []
      },

      // End node
      {
        id: 'end',
        name: 'Execution Complete',
        type: 'end' as const,
        category: 'system',
        color: '#f44336',
        level: 4,
        children: []
      }
    ];

    // Create flowchart links
    const flowchartLinks: FlowchartLink[] = [
      // Start to decision
      {
        source: 'start',
        target: 'decision_1',
        type: 'flow',
        strength: 1.0
      },

      // Decision to skills
      ...(proceduralSkills.slice(0, 3).map((skill: ProceduralSkill, index: number) => ({
        source: 'decision_1',
        target: `skill_${skill.id}`,
        type: 'flow',
        strength: 0.8,
        condition: 'skill_available'
      })),

      // Skills to patterns
      ...(proceduralSkills.slice(0, 2).flatMap((skill: ProceduralSkill, index: number) =>
        patterns.slice(0, 2).map((pattern: ActionPattern, index: number) => ({
          source: `skill_${skill.id}`,
          target: `pattern_${pattern.id}`,
          type: 'enhancement' as const,
          strength: 0.7
        }))
      )),

      // Patterns to sequences
      ...(patterns.slice(0, 2).flatMap((pattern: ActionPattern, index: number) =>
        sequences.slice(0, 2).map((sequence: SkillSequence, index: number) => ({
          source: `pattern_${pattern.id}`,
          target: `sequence_${sequence.id}`,
          type: 'flow' as const,
          strength: 0.6
        }))
      )),

      // Sequences to end
      ...(sequences.slice(0, 2).map((sequence: SkillSequence, index: number) => ({
        source: `sequence_${sequence.id}`,
        target: 'end',
        type: 'flow',
        strength: 0.9
      }))
    ];

    return { nodes: flowchartNodes, links: flowchartLinks, width: 800, height: 600 };
  }, [memorySystem]);

  // Filter nodes by category
  const filteredNodes = useMemo(() => {
    if (categoryFilter === 'all') return layout.nodes;
    return layout.nodes.filter((node: FlowchartNode) => 
      node.category === categoryFilter || 
      node.type === 'start' || 
      node.type === 'end' || 
      node.type === 'decision'
    );
  }, [layout.nodes, categoryFilter]);

  const filteredLinks = useMemo(() => {
    if (categoryFilter === 'all') return layout.links;
    const filteredNodeIds = new Set(filteredNodes.map((node: FlowchartNode) => node.id));
    return layout.links.filter((link: FlowchartLink) => 
      filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)
    );
  }, [layout.links, filteredNodes]);

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || !filteredNodes.length || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event: any) => {
        g.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Calculate layout based on type
    let nodePositions: Map<string, { x: number; y: number }> = new Map();
    
    if (layoutType === 'horizontal') {
      // Horizontal flow layout
      const levels = new Map<number, FlowchartNode[]>();
      filteredNodes.forEach((node: FlowchartNode) => {
        const level = node.level || 0;
        if (!levels.has(level)) levels.set(level, []);
        levels.get(level)!.push(node);
      });

      let currentX = 0;
      levels.forEach((nodesAtLevel: FlowchartNode[], level: number) => {
        const levelHeight = level * levelSpacing;
        const totalWidth = nodesAtLevel.length * nodeSpacing;
        const startX = (width - totalWidth) / 2;

        nodesAtLevel.forEach((node: FlowchartNode, index: number) => {
          const x = startX + index * nodeSpacing;
          const y = levelHeight;
          nodePositions.set(node.id, { x, y });
        });

        currentX = Math.max(currentX, totalWidth);
      });
    } else if (layoutType === 'vertical') {
      // Vertical flow layout
      const columns = new Map<number, FlowchartNode[]>();
      filteredNodes.forEach((node: FlowchartNode) => {
        const level = node.level || 0;
        if (!columns.has(level)) columns.set(level, []);
        columns.get(level)!.push(node);
      });

      let currentY = 0;
      columns.forEach((nodesAtColumn: FlowchartNode[], level: number) => {
        const columnWidth = level * nodeSpacing;
        const totalHeight = nodesAtColumn.length * levelSpacing;
        const startY = (height - totalHeight) / 2;

        nodesAtColumn.forEach((node: FlowchartNode, index: number) => {
          const x = columnWidth;
          const y = startY + index * levelSpacing;
          nodePositions.set(node.id, { x, y });
        });

        currentY = Math.max(currentY, totalHeight);
      });
    } else {
      // Radial layout
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.3;

      filteredNodes.forEach((node: FlowchartNode, index: number) => {
        const angle = (index / filteredNodes.length) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodePositions.set(node.id, { x, y });
      });
    }

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(filteredLinks)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d: FlowchartLink) => {
        switch (d.type) {
          case 'flow': return '#2196f3';
          case 'dependency': return '#ff9800';
          case 'enhancement': return '#4caf50';
          case 'trigger': return '#9c27b0';
          default: return '#999';
        }
      })
      .attr('stroke-width', (d: FlowchartLink) => Math.max(1, d.strength * 3))
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)')
      .attr('d', (d: FlowchartLink) => {
        const sourcePos = nodePositions.get(d.source);
        const targetPos = nodePositions.get(d.target);
        
        if (!sourcePos || !targetPos) return '';
        
        return `M ${sourcePos.x},${sourcePos.y} L ${targetPos.x},${targetPos.y}`;
      });

    // Create node groups
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(filteredNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, FlowchartNode>()
        .on('start', (event: any, d: FlowchartNode) => {
          if (!event.active) {
            d3.select(event.source).raise();
          }
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('drag', (event: any, d: FlowchartNode) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: FlowchartNode) => {
          d.fx = null;
          d.fy = null;
        })
      );

    // Add node shapes
    node.append('rect')
      .attr('width', (d: FlowchartNode) => {
        switch (d.type) {
          case 'start':
          case 'end':
            return 60;
          case 'decision':
            return 80;
          case 'skill':
          case 'pattern':
          case 'sequence':
            return 100;
          default:
            return 80;
        }
      })
      .attr('height', (d: FlowchartNode) => {
        switch (d.type) {
          case 'start':
          case 'end':
            return 40;
          case 'decision':
            return 60;
          case 'skill':
          case 'pattern':
          case 'sequence':
            return 60;
          default:
            return 50;
        }
      })
      .attr('x', (d: FlowchartNode) => (nodePositions.get(d.id)?.x || 0) - 30)
      .attr('y', (d: FlowchartNode) => (nodePositions.get(d.id)?.y || 0) - 20)
      .attr('rx', (d: FlowchartNode) => (d.type === 'decision' ? 10 : 5))
      .attr('fill', (d: FlowchartNode) => d.color || '#2196f3')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('click', (_event: any, d: FlowchartNode) => {
        setSelectedNode(d);
        _event.stopPropagation();
      })
      .on('mouseover', function(_event: any, d: FlowchartNode) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.1)');
      })
      .on('mouseout', function(_event: any, d: FlowchartNode) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)');
      });

    // Add node icons
    node.append('text')
      .text((d: FlowchartNode) => {
        switch (d.type) {
          case 'start': return '🚀';
          case 'end': return '🎯';
          case 'decision': return '🔀';
          case 'skill': return '🎯';
          case 'pattern': return '🔄';
          case 'sequence': return '📋';
          default: return '❓';
        }
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '16px')
      .style('pointer-events', 'none');

    // Add node labels
    if (showLabels) {
      node.append('text')
        .text((d: FlowchartNode) => d.name)
        .attr('x', (d: FlowchartNode) => nodePositions.get(d.id)?.x || 0)
        .attr('y', (d: FlowchartNode) => nodePositions.get(d.id)?.y || 0) + 35)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-family', 'Arial, sans-serif')
        .style('user-select', 'none')
        .style('pointer-events', 'none');
    }

    // Add proficiency indicators
    if (showProficiency) {
      node.filter((d: FlowchartNode) => d.proficiency !== undefined)
        .append('text')
        .text((d: FlowchartNode) => `${((d.proficiency || 0) * 100).toFixed(0)}%`)
        .attr('x', (d: FlowchartNode) => nodePositions.get(d.id)?.x || 0)
        .attr('y', (d: FlowchartNode) => nodePositions.get(d.id)?.y || 0) + 50)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .style('user-select', 'none')
        .style('pointer-events', 'none');
    }

    // Add frequency indicators
    if (showFrequency) {
      node.filter((d: FlowchartNode) => d.frequency !== undefined)
        .append('text')
        .text((d: FlowchartNode) => `🔥 ${d.frequency || 0}`)
        .attr('x', (d: FlowchartNode) => nodePositions.get(d.id)?.x || 0)
        .attr('y', (d: FlowchartNode) => nodePositions.get(d.id)?.y || 0) + 62)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .style('user-select', 'none')
        .style('pointer-events', 'none');
    }

    // Add tooltips
    node.append('title')
      .text((d: FlowchartNode) => `${d.name} (${d.type})\n${d.proficiency ? `Proficiency: ${(d.proficiency * 100).toFixed(0)}%\n` : ''}${d.frequency ? `Frequency: ${d.frequency}\n` : ''}Category: ${d.category}`);

    // Add arrow marker definition
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#666');

    return () => {
      // Cleanup function
      d3.selectAll('.tooltip').remove();
    };
  }, [filteredNodes, filteredLinks, dimensions, nodeSpacing, levelSpacing, showLabels, showProficiency, showFrequency, layoutType, loading]);

  // Control functions
  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().duration(300).call(zoom.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().duration(300).call(zoom.scaleBy, 0.7);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleExport = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'procedural-memory-flowchart.svg';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  const handleFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Procedural Memory Flowchart...
        </Typography>
      </Box>
    );
  }

  if (!filteredNodes.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography variant="h6" color="text.secondary">
          No procedural memory data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Controls */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1, display: 'flex', gap: 1 }}>
        <Tooltip title="Zoom In">
          <IconButton onClick={handleZoomIn} size="small">
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton onClick={handleZoomOut} size="small">
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton onClick={handleSettingsOpen} size="small">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Filter">
          <IconButton onClick={handleFilterOpen} size="small">
            <FilterIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Fullscreen">
          <IconButton onClick={handleFullscreen} size="small">
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Export SVG">
          <IconButton onClick={handleExport} size="small">
            <ExportIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            Flowchart Statistics
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip label={`Nodes: ${filteredNodes.length}`} size="small" variant="outlined" />
            <Chip label={`Links: ${filteredLinks.length}`} size="small" variant="outlined" />
            <Chip label={`Zoom: ${(zoom * 100).toFixed(0)}%`} size="small" variant="outlined" />
            <Chip label={`Layout: ${layoutType}`} size="small" variant="outlined" />
          </Box>
        </Paper>
      </Box>

      {/* Selected Node Info */}
      {selectedNode && (
        <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1 }}>
          <Card sx={{ minWidth: 300 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Selected Node
              </Typography>
              <Typography variant="h6" gutterBottom>
                {selectedNode.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  label={selectedNode.type} 
                  size="small" 
                  variant="outlined" 
                  icon={selectedNode.type === 'skill' ? <SkillIcon /> : 
                        selectedNode.type === 'pattern' ? <PatternIcon /> : 
                        selectedNode.type === 'sequence' ? <SequenceIcon /> : 
                        <TimelineIcon />}
                />
                {selectedNode.proficiency !== undefined && (
                  <Chip 
                    label={`Proficiency: ${(selectedNode.proficiency * 100).toFixed(0)}%`} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Category: {selectedNode.category}
                </Typography>
                {selectedNode.frequency !== undefined && (
                  <Typography variant="body2" color="text.secondary">
                    Frequency: {selectedNode.frequency}
                  </Typography>
                )}
              </Box>
              <Button size="small" onClick={() => setSelectedNode(null)} sx={{ mt: 1 }}>
                Close
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={handleSettingsClose}
        PaperProps={{ sx: { p: 2, minWidth: 250 } }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Flowchart Settings
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Layout Type
          </Typography>
          <Button
            fullWidth
            onClick={() => setLayoutType('horizontal')}
            variant={layoutType === 'horizontal' ? 'contained' : 'outlined'}
            sx={{ mb: 1 }}
          >
            Horizontal
          </Button>
          <Button
            fullWidth
            onClick={() => setLayoutType('vertical')}
            variant={layoutType === 'vertical' ? 'contained' : 'outlined'}
            sx={{ mb: 1 }}
          >
            Vertical
          </Button>
          <Button
            fullWidth
            onClick={() => setLayoutType('radial')}
            variant={layoutType === 'radial' ? 'contained' : 'outlined'}
          >
            Radial
          </Button>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Node Spacing: {nodeSpacing}px
          </Typography>
          <Slider
            value={nodeSpacing}
            onChange={(_, value) => setNodeSpacing(value as number)}
            min={50}
            max={300}
            size="small"
          />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Level Spacing: {levelSpacing}px
          </Typography>
          <Slider
            value={levelSpacing}
            onChange={(_, value) => setLevelSpacing(value as number)}
            min={100}
            max={400}
            size="small"
          />
        </Box>
        
        <FormControlLabel
          control={
            <Switch
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              size="small"
            />
          }
          label="Show Labels"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={showProficiency}
              onChange={(e) => setShowProficiency(e.target.checked)}
              size="small"
            />
          }
          label="Show Proficiency"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={showFrequency}
              onChange={(e) => setShowFrequency(e.target.checked)}
              size="small"
            />
          }
          label="Show Frequency"
        />
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={handleFilterClose}
        PaperProps={{ sx: { p: 2, minWidth: 200 } }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Filter by Category
        </Typography>
        
        <Button
          fullWidth
          onClick={() => setCategoryFilter('all')}
          variant={categoryFilter === 'all' ? 'contained' : 'outlined'}
          sx={{ mb: 1 }}
        >
          All Categories
        </Button>
        
        <Button
          fullWidth
          onClick={() => setCategoryFilter('combat')}
          variant={categoryFilter === 'combat' ? 'contained' : 'outlined'}
          sx={{ mb: 1 }}
        >
          Combat
        </Button>
        
        <Button
          fullWidth
          onClick={() => setCategoryFilter('crafting')}
          variant={categoryFilter === 'crafting' ? 'contained' : 'outlined'}
          sx={{ mb: 1 }}
        >
          Crafting
        </Button>
        
        <Button
          fullWidth
          onClick={() => setCategoryFilter('exploration')}
          variant={categoryFilter === 'exploration' ? 'contained' : 'outlined'}
          sx={{ mb: 1 }}
        >
          Exploration
        </Button>
        
        <Button
          fullWidth
          onClick={() => setCategoryFilter('social')}
          variant={categoryFilter === 'social' ? 'contained' : 'outlined'}
          sx={{ mb: 1 }}
        >
          Social
        </Button>
        
        <Button
          fullWidth
          onClick={() => setCategoryFilter('building')}
          variant={categoryFilter === 'building' ? 'contained' : 'outlined'}
          sx={{ mb: 1 }}
        >
          Building
        </Button>
        
        <Button
          fullWidth
          onClick={() => setCategoryFilter('mining')}
          variant={categoryFilter === 'mining' ? 'contained' : 'outlined'}
          sx={{ mb: 1 }}
        >
          Mining
        </Button>
        
        <Button
          fullWidth
          onClick={() => setCategoryFilter('farming')}
          variant={categoryFilter === 'farming' ? 'contained' : 'outlined'}
          sx={{ mb: 1 }}
        >
          Farming
        </Button>
        
        <Button
          fullWidth
          onClick={() => setCategoryFilter('trading')}
          variant={categoryFilter === 'trading' ? 'contained' : 'outlined'}
          sx={{ mb: 1 }}
        >
          Trading
        </Button>
      </Menu>

      {/* SVG Visualization */}
      <Box ref={containerRef} sx={{ width: '100%', height: '600px', overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}
        />
      </Box>
    </Box>
  );
};

export default ProceduralMemoryFlowchart;