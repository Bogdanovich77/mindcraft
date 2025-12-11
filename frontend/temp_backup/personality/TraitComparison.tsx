import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Compare as CompareIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { PersonalityComparison, TraitSimilarity, TraitDifference } from '../../types/personality';
import type { PersonalityTraits } from '../../types/agent';

interface TraitComparisonProps {
  data: PersonalityComparison;
  onAgentSelect?: (agentId: string) => void;
  onSwapAgents?: () => void;
  className?: string;
}

interface ComparisonData {
  trait: string;
  agent1Value: number;
  agent2Value: number;
  difference: number;
  similarity: number;
  significance: 'low' | 'medium' | 'high';
}

const TraitComparison: React.FC<TraitComparisonProps> = ({
  data,
  onAgentSelect,
  onSwapAgents,
  className
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewMode, setViewMode] = useState<'parallel' | 'difference' | 'radar'>('parallel');
  const [selectedTrait, setSelectedTrait] = useState<string>('');
  const [hoveredTrait, setHoveredTrait] = useState<string>('');

  // Configuration
  const config = {
    width: 700,
    height: 400,
    margin: { top: 40, right: 40, bottom: 60, left: 60 },
    animated: true,
    animationDuration: 750
  };

  // Calculate dimensions
  const width = config.width - config.margin.left - config.margin.right;
  const height = config.height - config.margin.top - config.margin.bottom;

  // Prepare comparison data
  const comparisonData: ComparisonData[] = Object.keys(data.agent1.traits).map(trait => {
    const value1 = data.agent1.traits[trait as keyof PersonalityTraits];
    const value2 = data.agent2.traits[trait as keyof PersonalityTraits];
    const difference = Math.abs(value1 - value2);
    const similarity = 1 - difference;
    
    let significance: 'low' | 'medium' | 'high' = 'low';
    if (similarity > 0.8) significance = 'high';
    else if (similarity > 0.5) significance = 'medium';

    return {
      trait,
      agent1Value: value1,
      agent2Value: value2,
      difference,
      similarity,
      significance
    };
  });

  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', config.width)
      .attr('height', config.height);

    const g = svg.append('g')
      .attr('transform', `translate(${config.margin.left}, ${config.margin.top})`);

    switch (viewMode) {
      case 'parallel':
        renderParallelCoordinates(g, comparisonData);
        break;
      case 'difference':
        renderDifferenceChart(g, comparisonData);
        break;
      case 'radar':
        renderRadarComparison(g, comparisonData);
        break;
    }

  }, [data, viewMode, comparisonData]);

  const renderParallelCoordinates = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ComparisonData[]
  ) => {
    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.trait))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // Draw axes
    g.selectAll('.axis')
      .data(data)
      .enter().append('g')
      .attr('class', 'axis')
      .attr('transform', d => `translate(${xScale(d.trait) || 0}, 0)`)
      .each(function(d) {
        d3.select(this).call(d3.axisLeft(yScale).tickSize(0).tickFormat(() => ''));
      })
      .append('text')
      .attr('y', height + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', theme.palette.text.primary)
      .text(d => d.trait);

    // Create line generators
    const line1 = d3.line<ComparisonData>()
      .x(d => (xScale(d.trait) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale(d.agent1Value))
      .curve(d3.curveMonotoneX);

    const line2 = d3.line<ComparisonData>()
      .x(d => (xScale(d.trait) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale(d.agent2Value))
      .curve(d3.curveMonotoneX);

    // Draw lines
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', theme.palette.primary.main)
      .attr('stroke-width', 2)
      .attr('d', line1);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', theme.palette.secondary.main)
      .attr('stroke-width', 2)
      .attr('d', line2);

    // Draw points
    g.selectAll('.points1')
      .data(data)
      .enter().append('circle')
      .attr('class', 'points1')
      .attr('cx', d => (xScale(d.trait) || 0) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.agent1Value))
      .attr('r', 4)
      .attr('fill', theme.palette.primary.main)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredTrait(d.trait);
        d3.select(event.target).transition().duration(200).attr('r', 6);
      })
      .on('mouseleave', (event, d) => {
        setHoveredTrait('');
        d3.select(event.target).transition().duration(200).attr('r', 4);
      });

    g.selectAll('.points2')
      .data(data)
      .enter().append('circle')
      .attr('class', 'points2')
      .attr('cx', d => (xScale(d.trait) || 0) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.agent2Value))
      .attr('r', 4)
      .attr('fill', theme.palette.secondary.main)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredTrait(d.trait);
        d3.select(event.target).transition().duration(200).attr('r', 6);
      })
      .on('mouseleave', (event, d) => {
        setHoveredTrait('');
        d3.select(event.target).transition().duration(200).attr('r', 4);
      });
  };

  const renderDifferenceChart = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ComparisonData[]
  ) => {
    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.trait))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([height, 0]);

    // Draw axes
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Draw zero line
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', theme.palette.divider)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // Draw bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.trait) || 0)
      .attr('y', d => yScale(Math.max(0, d.agent1Value - d.agent2Value)))
      .attr('width', xScale.bandwidth())
      .attr('height', d => Math.abs(yScale(d.agent1Value - d.agent2Value) - yScale(0)))
      .attr('fill', d => d.agent1Value > d.agent2Value ? theme.palette.primary.main : theme.palette.secondary.main)
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredTrait(d.trait);
        d3.select(event.target).transition().duration(200).attr('opacity', 1);
      })
      .on('mouseleave', (event, d) => {
        setHoveredTrait('');
        d3.select(event.target).transition().duration(200).attr('opacity', 0.7);
      });
  };

  const renderRadarComparison = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: ComparisonData[]
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    // Create angle scale
    const angleScale = d3.scaleLinear()
      .domain([0, data.length])
      .range([0, Math.PI * 2]);

    // Create radius scale
    const radiusScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, radius]);

    // Draw background circles
    for (let i = 1; i <= 5; i++) {
      g.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', (radius / 5) * i)
        .attr('fill', 'none')
        .attr('stroke', theme.palette.divider)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .style('opacity', 0.3);
    }

    // Create area generators
    const area1 = d3.areaRadial<ComparisonData>()
      .angle((d, i) => angleScale(i))
      .innerRadius(0)
      .outerRadius(d => radiusScale(d.agent1Value))
      .curve(d3.curveLinearClosed);

    const area2 = d3.areaRadial<ComparisonData>()
      .angle((d, i) => angleScale(i))
      .innerRadius(0)
      .outerRadius(d => radiusScale(d.agent2Value))
      .curve(d3.curveLinearClosed);

    // Draw areas
    g.append('path')
      .datum(data)
      .attr('d', area1)
      .attr('transform', `translate(${centerX}, ${centerY})`)
      .attr('fill', theme.palette.primary.main)
      .attr('fill-opacity', 0.3)
      .attr('stroke', theme.palette.primary.main)
      .attr('stroke-width', 2);

    g.append('path')
      .datum(data)
      .attr('d', area2)
      .attr('transform', `translate(${centerX}, ${centerY})`)
      .attr('fill', theme.palette.secondary.main)
      .attr('fill-opacity', 0.3)
      .attr('stroke', theme.palette.secondary.main)
      .attr('stroke-width', 2);

    // Draw labels
    data.forEach((d, i) => {
      const angle = angleScale(i);
      const x = centerX + Math.cos(angle - Math.PI / 2) * (radius + 20);
      const y = centerY + Math.sin(angle - Math.PI / 2) * (radius + 20);

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('fill', theme.palette.text.primary)
        .text(d.trait);
    });
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Card className={className} sx={{ height: 'fit-content' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Personality Comparison
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Swap Agents">
              <IconButton size="small" onClick={onSwapAgents}>
                <SwapIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Compare Mode">
              <IconButton size="small">
                <CompareIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Agent Info */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box flex={1}>
            <Typography variant="subtitle2" color="primary">
              <PersonIcon sx={{ fontSize: 16, mr: 1 }} />
              {data.agent1.name}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              vs
            </Typography>
          </Box>
          <Box flex={1} sx={{ textAlign: 'right' }}>
            <Typography variant="subtitle2" color="secondary">
              {data.agent2.name}
              <PersonIcon sx={{ fontSize: 16, ml: 1 }} />
            </Typography>
          </Box>
        </Box>

        {/* Compatibility Score */}
        <Box display="flex" justifyContent="center" mb={2}>
          <Chip
            icon={<AssessmentIcon />}
            label={`Compatibility: ${(data.overallCompatibility * 100).toFixed(1)}%`}
            color={data.overallCompatibility > 0.7 ? 'success' : data.overallCompatibility > 0.4 ? 'warning' : 'error'}
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Compare personality traits between agents. Switch between different visualization modes.
        </Typography>

        {/* View Mode Selector */}
        <FormControl size="small" sx={{ mb: 2, minWidth: 150 }}>
          <InputLabel>View Mode</InputLabel>
          <Select
            value={viewMode}
            label="View Mode"
            onChange={(e) => setViewMode(e.target.value as 'parallel' | 'difference' | 'radar')}
          >
            <MenuItem value="parallel">Parallel Coordinates</MenuItem>
            <MenuItem value="difference">Difference Chart</MenuItem>
            <MenuItem value="radar">Radar Comparison</MenuItem>
          </Select>
        </FormControl>
        
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ overflow: 'auto' }}>
          <svg ref={svgRef}></svg>
        </Box>

        {/* Analysis Summary */}
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Analysis Summary
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip 
              label={`${data.similarities.length} Similar traits`} 
              color="success" 
              size="small" 
            />
            <Chip 
              label={`${data.differences.length} Different traits`} 
              color="warning" 
              size="small" 
            />
          </Box>
          
          {data.analysis.strengths.length > 0 && (
            <Box mt={1}>
              <Typography variant="body2" color="text.secondary">
                <strong>Strengths:</strong> {data.analysis.strengths.join(', ')}
              </Typography>
            </Box>
          )}
          
          {data.analysis.conflicts.length > 0 && (
            <Box mt={1}>
              <Typography variant="body2" color="text.secondary">
                <strong>Conflicts:</strong> {data.analysis.conflicts.join(', ')}
              </Typography>
            </Box>
          )}
          
          {data.analysis.synergies.length > 0 && (
            <Box mt={1}>
              <Typography variant="body2" color="text.secondary">
                <strong>Synergies:</strong> {data.analysis.synergies.join(', ')}
              </Typography>
            </Box>
          )}
        </Box>

        {hoveredTrait && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              <strong>Selected Trait:</strong> {hoveredTrait}
            </Typography>
            {(() => {
              const traitData = comparisonData.find(d => d.trait === hoveredTrait);
              if (traitData) {
                return (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      <strong>{data.agent1.name}:</strong> {traitData.agent1Value.toFixed(3)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>{data.agent2.name}:</strong> {traitData.agent2Value.toFixed(3)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Similarity:</strong> {traitData.similarity.toFixed(3)} ({traitData.significance})
                    </Typography>
                  </>
                );
              }
              return null;
            })()}
          </Box>
        )}

        {/* Legend */}
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Legend
          </Typography>
          <Box display="flex" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={12} height={12} bgcolor={theme.palette.primary.main} borderRadius={1} />
              <Typography variant="caption">{data.agent1.name}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={12} height={12} bgcolor={theme.palette.secondary.main} borderRadius={1} />
              <Typography variant="caption">{data.agent2.name}</Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TraitComparison;