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
  useTheme,
  alpha
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  GridOn as GridIcon
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { BehavioralPattern, BehavioralInfluence, MatrixConfig } from '../../types/personality';
import type { PersonalityTraits } from '../../types/agent';

interface BehavioralMatrixProps {
  data: BehavioralPattern[];
  influences: BehavioralInfluence[];
  config?: Partial<MatrixConfig>;
  onCellClick?: (trait: string, behavior: string, strength: number) => void;
  onPatternClick?: (pattern: BehavioralPattern) => void;
  className?: string;
}

interface MatrixCell {
  trait: string;
  behavior: string;
  strength: number;
  direction: 'positive' | 'negative';
  frequency: number;
  confidence: number;
}

const BehavioralMatrix: React.FC<BehavioralMatrixProps> = ({
  data,
  influences,
  config,
  onCellClick,
  onPatternClick,
  className
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedTrait, setSelectedTrait] = useState<string>('');
  const [selectedBehavior, setSelectedBehavior] = useState<string>('');
  const [hoveredCell, setHoveredCell] = useState<MatrixCell | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixCell[]>([]);

  // Default configuration
  const defaultConfig: MatrixConfig = {
    width: 600,
    height: 600,
    cellSize: 40,
    margin: { top: 60, right: 60, bottom: 120, left: 120 },
    colorScale: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'],
    showLabels: true,
    showValues: true,
    interactive: true
  };

  const chartConfig = { ...defaultConfig, ...config };

  // Extract unique traits and behaviors
  const traits = Array.from(new Set(data.flatMap(d => Object.keys(d.traits))));
  const behaviors = Array.from(new Set(data.map(d => d.name)));

  // Calculate dimensions
  const cellSize = chartConfig.cellSize * zoomLevel;
  const width = traits.length * cellSize + chartConfig.margin.left + chartConfig.margin.right;
  const height = behaviors.length * cellSize + chartConfig.margin.top + chartConfig.margin.bottom;

  // Process data to create matrix
  useEffect(() => {
    const matrix: MatrixCell[] = [];
    
    traits.forEach(trait => {
      behaviors.forEach(behavior => {
        // Find influences for this trait-behavior pair
        const traitInfluences = influences.find(i => i.traitName === trait);
        const behaviorInfluence = traitInfluences?.influences.find(i => i.behavior === behavior);
        
        if (behaviorInfluence) {
          matrix.push({
            trait,
            behavior,
            strength: behaviorInfluence.strength,
            direction: behaviorInfluence.direction,
            frequency: data.find(d => d.name === behavior)?.frequency || 0,
            confidence: data.find(d => d.name === behavior)?.confidence || 0
          });
        } else {
          // Calculate correlation based on pattern data
          const pattern = data.find(d => d.name === behavior);
          if (pattern && pattern.traits[trait as keyof PersonalityTraits]) {
            const traitValue = pattern.traits[trait as keyof PersonalityTraits];
            const strength = Math.abs(traitValue * pattern.confidence);
            matrix.push({
              trait,
              behavior,
              strength,
              direction: traitValue > 0 ? 'positive' : 'negative',
              frequency: pattern.frequency,
              confidence: pattern.confidence
            });
          }
        }
      });
    });
    
    setMatrixData(matrix);
  }, [data, influences, traits, behaviors]);

  useEffect(() => {
    if (!svgRef.current || matrixData.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${chartConfig.margin.left}, ${chartConfig.margin.top})`);

    // Create scales
    const xScale = d3.scaleBand()
      .domain(traits)
      .range([0, traits.length * cellSize])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(behaviors)
      .range([0, behaviors.length * cellSize])
      .padding(0.1);

    // Create color scale
    const colorScale = d3.scaleSequential()
      .domain([-1, 1])
      .interpolator(d3.interpolateRdYlBu);

    // Draw cells
    const cells = g.selectAll('.cell')
      .data(matrixData)
      .enter().append('g')
      .attr('class', 'cell');

    cells.append('rect')
      .attr('x', d => xScale(d.trait) || 0)
      .attr('y', d => yScale(d.behavior) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => {
        const value = d.direction === 'positive' ? d.strength : -d.strength;
        return colorScale(value);
      })
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', d => {
        if (selectedTrait && selectedTrait !== d.trait) return 0.3;
        if (selectedBehavior && selectedBehavior !== d.behavior) return 0.3;
        return 1;
      })
      .on('click', (event, d) => {
        if (onCellClick) {
          onCellClick(d.trait, d.behavior, d.strength);
        }
      })
      .on('mouseenter', (event, d) => {
        setHoveredCell(d);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('stroke-width', 2)
          .attr('stroke', theme.palette.primary.main);
      })
      .on('mouseleave', (event, d) => {
        setHoveredCell(null);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('stroke-width', 1)
          .attr('stroke', theme.palette.background.paper);
      });

    // Add values to cells
    if (chartConfig.showValues) {
      cells.append('text')
        .attr('x', d => (xScale(d.trait) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => (yScale(d.behavior) || 0) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', Math.min(12, xScale.bandwidth() / 4))
        .attr('fill', d => {
          const value = d.direction === 'positive' ? d.strength : -d.strength;
          return Math.abs(value) > 0.5 ? theme.palette.background.paper : theme.palette.text.primary;
        })
        .text(d => d.strength.toFixed(2));
    }

    // Draw axes labels
    if (chartConfig.showLabels) {
      // X-axis labels (traits)
      g.selectAll('.x-label')
        .data(traits)
        .enter().append('text')
        .attr('class', 'x-label')
        .attr('x', d => (xScale(d) || 0) + xScale.bandwidth() / 2)
        .attr('y', behaviors.length * cellSize + 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', theme.palette.text.primary)
        .text(d => d)
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          setSelectedTrait(selectedTrait === d ? '' : d);
        });

      // Y-axis labels (behaviors)
      g.selectAll('.y-label')
        .data(behaviors)
        .enter().append('text')
        .attr('class', 'y-label')
        .attr('x', -10)
        .attr('y', d => (yScale(d) || 0) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('fill', theme.palette.text.primary)
        .text(d => d)
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          setSelectedBehavior(selectedBehavior === d ? '' : d);
        });
    }

    // Add legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${traits.length * cellSize + 20}, 0)`);

    const legendScale = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range([0, 100]);

    const legendGradient = legend.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    legendGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorScale(-1));

    legendGradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', colorScale(0));

    legendGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorScale(1));

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 100)
      .attr('fill', 'url(#legend-gradient)')
      .attr('stroke', theme.palette.divider)
      .attr('stroke-width', 1);

    legend.append('text')
      .attr('x', 25)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('fill', theme.palette.text.primary)
      .text('Negative');

    legend.append('text')
      .attr('x', 25)
      .attr('y', 50)
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('fill', theme.palette.text.primary)
      .text('Neutral');

    legend.append('text')
      .attr('x', 25)
      .attr('y', 100)
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('fill', theme.palette.text.primary)
      .text('Positive');

  }, [matrixData, chartConfig, cellSize, traits, behaviors, selectedTrait, selectedBehavior, theme, onCellClick]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleRefresh = () => {
    setSelectedTrait('');
    setSelectedBehavior('');
    setZoomLevel(1);
  };

  return (
    <Card className={className} sx={{ height: 'fit-content' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Behavioral Influence Matrix
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
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
            <Tooltip title="Grid View">
              <IconButton size="small">
                <GridIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Matrix showing how personality traits influence behaviors. Click on cells to see details.
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Trait Filter</InputLabel>
            <Select
              value={selectedTrait}
              label="Trait Filter"
              onChange={(e) => setSelectedTrait(e.target.value)}
            >
              <MenuItem value="">All Traits</MenuItem>
              {traits.map(trait => (
                <MenuItem key={trait} value={trait}>{trait}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Behavior Filter</InputLabel>
            <Select
              value={selectedBehavior}
              label="Behavior Filter"
              onChange={(e) => setSelectedBehavior(e.target.value)}
            >
              <MenuItem value="">All Behaviors</MenuItem>
              {behaviors.map(behavior => (
                <MenuItem key={behavior} value={behavior}>{behavior}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ overflow: 'auto' }}>
          <svg ref={svgRef}></svg>
        </Box>

        {hoveredCell && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              <strong>Trait:</strong> {hoveredCell.trait} | <strong>Behavior:</strong> {hoveredCell.behavior}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Strength:</strong> {hoveredCell.strength.toFixed(3)} | <strong>Direction:</strong> {hoveredCell.direction}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Frequency:</strong> {hoveredCell.frequency.toFixed(2)} | <strong>Confidence:</strong> {hoveredCell.confidence.toFixed(2)}
            </Typography>
          </Box>
        )}

        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Legend
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Colors indicate influence direction: Blue = Positive influence on behavior, Red = Negative influence
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click on trait or behavior labels to filter the matrix
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BehavioralMatrix;