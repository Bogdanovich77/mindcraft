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
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Settings as SettingsIcon,
  Psychology as SkillIcon,
  Pattern as PatternIcon,
  Code as SequenceIcon,
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { MemorySystem, ProceduralSkill, ActionPattern, SkillSequence } from '../../types/memory';

interface ProceduralMemoryPatternsProps {
  memorySystem?: MemorySystem;
  loading?: boolean;
  onRefresh?: () => void;
}

interface PatternNode {
  id: string;
  name: string;
  type: 'skill' | 'pattern' | 'sequence';
  proficiency: number;
  frequency: number;
  category: string;
  color?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface PatternLink {
  source: string | PatternNode;
  target: string | PatternNode;
  type: 'requires' | 'enables' | 'enhances';
  strength: number;
}

const ProceduralMemoryPatterns: React.FC<ProceduralMemoryPatternsProps> = ({
  memorySystem,
  loading = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [linkDistance, setLinkDistance] = useState(50);
  const [chargeStrength, setChargeStrength] = useState(-300);
  const [showProficiency, setShowProficiency] = useState(true);
  const [showFrequency, setShowFrequency] = useState(true);
  const [showCategories, setShowCategories] = useState(true);
  const [selectedNode, setSelectedNode] = useState<PatternNode | null>(null);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [simulation, setSimulation] = useState<d3.Simulation<PatternNode, PatternLink> | null>(null);

  // Process memory data for visualization
  const { nodes, links } = useMemo(() => {
    if (!memorySystem?.procedural) {
      return { nodes: [] as PatternNode[], links: [] as PatternLink[] };
    }

    const proceduralSkills = memorySystem.procedural.skills;
    const patterns = memorySystem.procedural.patterns;
    const sequences = memorySystem.procedural.sequences;

    // Create nodes
    const patternNodes: PatternNode[] = [
      ...proceduralSkills.map((skill: ProceduralSkill) => ({
        id: skill.id,
        name: skill.name,
        type: 'skill' as const,
        proficiency: skill.proficiency.overall,
        frequency: skill.components.length || 0, // Use components count as frequency proxy
        category: skill.category,
        color: getSkillColor(skill.category, skill.proficiency.overall),
      })),
      ...patterns.map((pattern: ActionPattern) => ({
        id: pattern.id,
        name: pattern.name,
        type: 'pattern' as const,
        proficiency: pattern.strength || 0.5, // Use strength as effectiveness proxy
        frequency: pattern.frequency || 0, // Use frequency as usage proxy
        category: pattern.contexts?.[0] || 'unknown', // Use first context as category proxy
        color: getPatternColor(pattern.contexts?.[0] || 'unknown', pattern.strength || 0.5),
      })),
      ...sequences.map((sequence: SkillSequence) => ({
        id: sequence.id,
        name: sequence.name,
        type: 'sequence' as const,
        proficiency: sequence.automation || 0.5, // Use automation as completionRate proxy
        frequency: sequence.steps.length || 0, // Use steps count as execution proxy
        category: sequence.purpose || 'unknown', // Use purpose as category proxy
        color: getSequenceColor(sequence.purpose || 'unknown', sequence.automation || 0.5),
      })),
    ];

    // Create links based on relationships
    const patternLinks: PatternLink[] = [];

    // Skill to pattern links - create some example relationships
    patterns.forEach((pattern: ActionPattern) => {
      // Create links to some skills based on pattern contexts
      const relatedSkills = proceduralSkills.filter(skill =>
        skill.category === pattern.contexts?.[0] ||
        skill.name.toLowerCase().includes(pattern.name.toLowerCase())
      );
      relatedSkills.slice(0, 2).forEach(skill => {
        patternLinks.push({
          source: skill.id,
          target: pattern.id,
          type: 'requires' as const,
          strength: 0.8,
        });
      });
    });

    // Pattern to sequence links - create some example relationships
    sequences.forEach((sequence: SkillSequence) => {
      // Create links to some patterns based on sequence purpose
      const relatedPatterns = patterns.filter(pattern =>
        pattern.contexts?.[0] === sequence.purpose ||
        pattern.name.toLowerCase().includes(sequence.name.toLowerCase())
      );
      relatedPatterns.slice(0, 2).forEach(pattern => {
        patternLinks.push({
          source: pattern.id,
          target: sequence.id,
          type: 'enables' as const,
          strength: 0.7,
        });
      });
    });

    // Skill enhancement links - create some example relationships
    proceduralSkills.forEach((skill: ProceduralSkill) => {
      // Create links to related skills
      const relatedSkills = proceduralSkills.filter(otherSkill =>
        otherSkill.id !== skill.id &&
        (otherSkill.category === skill.category ||
         otherSkill.name.toLowerCase().includes(skill.name.toLowerCase()))
      );
      relatedSkills.slice(0, 1).forEach(relatedSkill => {
        patternLinks.push({
          source: skill.id,
          target: relatedSkill.id,
          type: 'enhances' as const,
          strength: 0.5,
        });
      });
    });

    return { nodes: patternNodes, links: patternLinks };
  }, [memorySystem]);

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
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: width - 32, height: height - 32 });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || !nodes.length || loading) return;

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
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Create force simulation
    const sim = d3.forceSimulation<PatternNode>(nodes)
      .force('link', d3.forceLink<PatternNode, PatternLink>(links)
        .id(d => d.id)
        .distance(linkDistance)
        .strength(d => d.strength)
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => 15 + (d.proficiency || 0) * 10));

    setSimulation(sim);

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => {
        switch (d.type) {
          case 'requires': return '#f44336';
          case 'enables': return '#4caf50';
          case 'enhances': return '#2196f3';
          default: return '#999';
        }
      })
      .attr('stroke-width', d => Math.max(1, d.strength * 3))
      .attr('stroke-opacity', 0.6);

    // Create node groups
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, PatternNode>()
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Add node circles
    node.append('circle')
      .attr('r', d => 10 + d.proficiency * 15)
      .attr('fill', d => d.color || '#2196f3')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('click', (_event, d) => {
        setSelectedNode(d);
        _event.stopPropagation();
      })
      .on('mouseover', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (10 + d.proficiency * 15) * 1.3);
      })
      .on('mouseout', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 10 + d.proficiency * 15);
      });

    // Add node icons
    node.append('text')
      .text(d => {
        switch (d.type) {
          case 'skill': return '🎯';
          case 'pattern': return '🔄';
          case 'sequence': return '📋';
          default: return '❓';
        }
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '12px')
      .style('pointer-events', 'none');

    // Add node labels
    node.append('text')
      .text(d => d.name)
      .attr('x', 20)
      .attr('y', 0)
      .attr('font-size', '10px')
      .attr('font-family', 'Arial, sans-serif')
      .style('user-select', 'none')
      .style('pointer-events', 'none');

    // Add proficiency indicators
    if (showProficiency) {
      node.append('text')
        .text(d => `${(d.proficiency * 100).toFixed(0)}%`)
        .attr('x', 20)
        .attr('y', 12)
        .attr('font-size', '8px')
        .attr('fill', '#666')
        .style('user-select', 'none')
        .style('pointer-events', 'none');
    }

    // Add frequency indicators
    if (showFrequency) {
      node.append('text')
        .text(d => `🔥 ${d.frequency}`)
        .attr('x', 20)
        .attr('y', 24)
        .attr('font-size', '8px')
        .attr('fill', '#666')
        .style('user-select', 'none')
        .style('pointer-events', 'none');
    }

    // Add category indicators
    if (showCategories) {
      node.append('text')
        .text(d => `📁 ${d.category}`)
        .attr('x', 20)
        .attr('y', 36)
        .attr('font-size', '8px')
        .attr('fill', '#666')
        .style('user-select', 'none')
        .style('pointer-events', 'none');
    }

    // Add tooltips
    node.append('title')
      .text(d => `${d.name} (${d.type})\nProficiency: ${(d.proficiency * 100).toFixed(0)}%\nFrequency: ${d.frequency}\nCategory: ${d.category}`);

    // Update positions on tick
    sim.on('tick', () => {
      link
        .attr('x1', d => (d.source as PatternNode).x || 0)
        .attr('y1', d => (d.source as PatternNode).y || 0)
        .attr('x2', d => (d.target as PatternNode).x || 0)
        .attr('y2', d => (d.target as PatternNode).y || 0);

      node
        .attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    return () => {
      sim.stop();
    };
  }, [nodes, links, dimensions, linkDistance, chargeStrength, showProficiency, showFrequency, showCategories, loading]);

  // Update simulation parameters
  useEffect(() => {
    if (simulation) {
      simulation.force('link', d3.forceLink<PatternNode, PatternLink>(links)
        .id(d => d.id)
        .distance(linkDistance)
        .strength(d => d.strength)
      );
      simulation.force('charge', d3.forceManyBody().strength(chargeStrength));
      simulation.alpha(0.3).restart();
    }
  }, [simulation, linkDistance, chargeStrength, links]);

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

  const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Procedural Memory Patterns...
        </Typography>
      </Box>
    );
  }

  if (!nodes.length) {
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
      </Box>

      {/* Stats */}
      <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1 }}>
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            Pattern Statistics
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip label={`Nodes: ${nodes.length}`} size="small" variant="outlined" />
            <Chip label={`Links: ${links.length}`} size="small" variant="outlined" />
            <Chip label={`Zoom: ${(zoom * 100).toFixed(0)}%`} size="small" variant="outlined" />
          </Box>
        </Paper>
      </Box>

      {/* Selected Node Info */}
      {selectedNode && (
        <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1 }}>
          <Card sx={{ minWidth: 300 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Selected Pattern
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
                        <SequenceIcon />}
                />
                <Chip 
                  label={`Proficiency: ${(selectedNode.proficiency * 100).toFixed(0)}%`} 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Frequency: {selectedNode.frequency}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Category: {selectedNode.category}
                </Typography>
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
          Pattern Settings
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Link Distance: {linkDistance}
          </Typography>
          <Slider
            value={linkDistance}
            onChange={(_, value) => setLinkDistance(value as number)}
            min={20}
            max={100}
            size="small"
          />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Charge Strength: {chargeStrength}
          </Typography>
          <Slider
            value={chargeStrength}
            onChange={(_, value) => setChargeStrength(value as number)}
            min={-500}
            max={-100}
            size="small"
          />
        </Box>
        
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
        
        <FormControlLabel
          control={
            <Switch
              checked={showCategories}
              onChange={(e) => setShowCategories(e.target.checked)}
              size="small"
            />
          }
          label="Show Categories"
        />
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

export default ProceduralMemoryPatterns;