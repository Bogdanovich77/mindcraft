import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Slider,
  Switch,
  FormControlLabel,
  LinearProgress
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Refresh,
  Info
} from '@mui/icons-material';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import {
  selectSkills,
  selectSkillSynergies,
  selectSelectedAgent
} from '../../store';
import ErrorBoundary from '../common/ErrorBoundary';
import type {
  Skill,
  SkillSynergy,
  SkillType,
  SkillCategory
} from '../../types/skills';
import type { SkillsState } from '../../types/skills';

interface SkillSynergyMappingProps {
  agentId?: string;
  compact?: boolean;
}

interface SynergyNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  radius: number;
  color: string;
}

interface SynergyLink extends d3.SimulationLinkDatum<SynergyNode> {
  source: string | SynergyNode;
  target: string | SynergyNode;
  strength: number;
  type: 'direct' | 'analogical' | 'creative';
  value: number;
}

export const SkillSynergyMapping: React.FC<SkillSynergyMappingProps> = ({
  agentId,
  compact = false
}) => {
  const theme = useTheme();
  const selectedAgentId = agentId || useSelector((state: { agents: any, skills: SkillsState }) => selectSelectedAgent(state))?.id;
  const skills = useSelector((state: { skills: SkillsState }) => selectSkills(state));
  // Get all synergies for the selected agent
  const synergies = useSelector((state: { skills: SkillsState }) => state.skills.synergies);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [minSynergyStrength, setMinSynergyStrength] = useState(0.1);
  const [showLabels, setShowLabels] = useState(true);
  const [showCategories, setShowCategories] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Get selected skill
  const selectedSkill = useMemo(() => {
    if (!selectedSkillId || !skills) return null;
    const skillsArray = Array.isArray(skills) ? skills : Object.values(skills || {});
    return skillsArray.find((skill: any) => skill.id === selectedSkillId) || null;
  }, [selectedSkillId, skills]);

  // Prepare network data
  const networkData = useMemo(() => {
    if (!skills || !synergies) return { nodes: [], links: [] };

    const nodes: SynergyNode[] = [];
    const links: SynergyLink[] = [];
    const skillMap = new Map();

    // Create nodes from skills
    const skillsArray = Array.isArray(skills) ? skills : Object.values(skills || {});
    skillsArray.forEach((skill: any) => {
      const node: SynergyNode = {
        id: skill.id,
        name: skill.type.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase()),
        category: skill.type,
        proficiency: skill.proficiency.overall,
        radius: Math.max(10, skill.proficiency.overall * 30),
        color: getCategoryColor(skill.type)
      };
      nodes.push(node);
      skillMap.set(skill.id, node);
    });

    // Create links from synergies
    const synergiesArray = Array.isArray(synergies) ? synergies : Object.values(synergies || {});
    synergiesArray.forEach((synergy: any) => {
      if (synergy.strength >= minSynergyStrength) {
        const link: SynergyLink = {
          source: synergy.sourceSkillId,
          target: synergy.targetSkillId,
          strength: synergy.strength,
          type: synergy.type,
          value: synergy.strength * 10
        };
        links.push(link);
      }
    });

    return { nodes, links };
  }, [skills, synergies, minSynergyStrength]);

  // Get category color
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      COMBAT: theme.palette.error.main,
      CRAFTING: theme.palette.warning.main,
      EXPLORATION: theme.palette.success.main,
      SOCIAL: theme.palette.info.main,
      SURVIVAL: theme.palette.secondary.main,
      ENGINEERING: theme.palette.primary.main,
      CONSTRUCTION: theme.palette.primary.dark,
      AGRICULTURE: theme.palette.success.dark,
      MINING: theme.palette.grey[600],
      MAGIC: theme.palette.secondary.main,
      TRADING: theme.palette.warning.main,
      STEALTH: theme.palette.grey[800]
    };
    return colors[category] || theme.palette.grey[500];
  };

  // Initialize selected skill
  useEffect(() => {
    if (skills && !selectedSkillId) {
      const skillsArray = Array.isArray(skills) ? skills : Object.values(skills);
      if (skillsArray.length > 0) {
        const firstSkill = skillsArray[0] as Skill;
        setSelectedSkillId(firstSkill.id);
      }
    }
  }, [skills, selectedSkillId]);

  // Draw network diagram
  useEffect(() => {
    if (!svgRef.current || networkData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = compact ? 400 : 600;

    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Create simulation
    const simulation = d3.forceSimulation(networkData.nodes as any)
      .force('link', d3.forceLink(networkData.links as any)
        .id((d: any) => d.id)
        .strength((d: any) => d.strength)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 5));

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(networkData.links)
      .enter().append('line')
      .attr('stroke', (d: any) => {
        switch (d.type) {
          case 'direct': return theme.palette.primary.main;
          case 'analogical': return theme.palette.secondary.main;
          case 'creative': return theme.palette.info.main;
          default: return theme.palette.grey[500];
        }
      })
      .attr('stroke-width', (d: any) => Math.max(1, d.strength * 5))
      .attr('stroke-opacity', (d: any) => Math.min(0.8, d.strength + 0.2));

    // Create node groups
    const node = g.append('g')
      .selectAll('g')
      .data(networkData.nodes)
      .enter().append('g')
      .call(d3.drag<SVGGElement, SynergyNode>()
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
          d.fx = null;
          d.fy = null;
        }) as any);

    // Add circles for nodes
    node.append('circle')
      .attr('r', (d: any) => d.radius)
      .attr('fill', (d: any) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedSkillId(d.id);
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d: any) => d.radius * 1.2);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d: any) => d.radius);
      });

    // Add labels
    if (showLabels) {
      node.append('text')
        .text((d: any) => d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name)
        .attr('font-size', '10px')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('fill', '#fff')
        .style('pointer-events', 'none')
        .style('font-weight', 'bold');
    }

    // Add tooltips
    node.append('title')
      .text((d: any) => `${d.name}\nProficiency: ${Math.round(d.proficiency * 100)}%\nCategory: ${d.category}`);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [networkData, showLabels, theme]);

  // Handle skill selection
  const handleSkillChange = (event: any) => {
    setSelectedSkillId(event.target.value);
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().call(zoom.scaleBy, 1.2);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().call(zoom.scaleBy, 0.8);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = d3.zoom<SVGSVGElement, unknown>();
      svg.transition().call(zoom.transform, d3.zoomIdentity);
    }
  };

  // Get skill synergies for selected skill
  const selectedSkillSynergies = useMemo(() => {
    if (!selectedSkillId || !synergies) return [];
    
    return Object.values(synergies).filter((synergy: any) => 
      synergy.sourceSkillId === selectedSkillId || synergy.targetSkillId === selectedSkillId
    ).sort((a: any, b: any) => b.strength - a.strength);
  }, [selectedSkillId, synergies]);

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Controls */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Skill Synergy Mapping
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(6, 1fr)'
                },
                gap: 2,
                alignItems: 'center'
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>Focus Skill</InputLabel>
                <Select
                  value={selectedSkillId}
                  onChange={handleSkillChange}
                  label="Focus Skill"
                >
                  {skills && (Array.isArray(skills) ? skills : Object.values(skills)).map((skill: any) => (
                    <MenuItem key={skill.id} value={skill.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {skill.type.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase())}
                        </Typography>
                        <Chip
                          label={`${Math.round(skill.proficiency.overall * 100)}%`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ px: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Min Synergy Strength: {minSynergyStrength.toFixed(2)}
                </Typography>
                <Slider
                  value={minSynergyStrength}
                  onChange={(_, value) => setMinSynergyStrength(value as number)}
                  min={0}
                  max={1}
                  step={0.05}
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
                    checked={showCategories}
                    onChange={(e) => setShowCategories(e.target.checked)}
                    size="small"
                  />
                }
                label="Show Categories"
              />
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
                <Tooltip title="Reset View">
                  <IconButton onClick={handleResetZoom} size="small">
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '2fr 1fr'
            },
            gap: 3
          }}
        >
          {/* Network Visualization */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skill Network
                <Tooltip title="Node size represents proficiency level. Line thickness represents synergy strength.">
                  <IconButton size="small">
                    <Info />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Box sx={{
                height: compact ? 400 : 600,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden'
              }}>
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  style={{ cursor: 'grab' }}
                />
              </Box>
              {showCategories && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Categories:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(Array.isArray(skills) ? skills : Object.values(skills || {})).reduce((acc: string[], skill: any) => {
                      if (!acc.includes(skill.type)) {
                        acc.push(skill.type);
                      }
                      return acc;
                    }, []).map((category: string) => (
                      <Chip
                        key={category}
                        label={category.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase())}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(category),
                          color: 'white'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Selected Skill Details */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {(selectedSkill as any)?.type.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase())} Synergies
              </Typography>
              {selectedSkill && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Proficiency: {Math.round((selectedSkill as any).proficiency.overall * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {(selectedSkill as any).type}
                  </Typography>
                </Box>
              )}
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {selectedSkillSynergies.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No synergies found for this skill
                  </Typography>
                ) : (
                  selectedSkillSynergies.map((synergy: any, index: number) => {
                    const otherSkillId = synergy.sourceSkillId === selectedSkillId ?
                      synergy.targetSkillId : synergy.sourceSkillId;
                    const skillsArray = Array.isArray(skills) ? skills : Object.values(skills || {});
                    const otherSkill = skillsArray.find((skill: any) => skill.id === otherSkillId);
                    
                    return (
                      <Card key={index} sx={{ mb: 1, p: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight="bold">
                            {(otherSkill as any)?.type.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase())}
                          </Typography>
                          <Chip
                            label={`${(synergy.strength * 100).toFixed(0)}%`}
                            size="small"
                            color={synergy.type === 'direct' ? 'primary' :
                                   synergy.type === 'analogical' ? 'secondary' : 'info'}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Type: {synergy.type}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={synergy.strength * 100}
                          sx={{ mt: 1 }}
                        />
                      </Card>
                    );
                  })
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default SkillSynergyMapping;