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
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  Slider
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { PersonalityTraits } from '../../types/agent';
import type { CorrelationMatrix, CorrelationPair, TraitCorrelation } from '../../types/personality';

interface CorrelationAnalysisProps {
  data: CorrelationMatrix;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
}

interface CorrelationHeatmapData {
  trait1: string;
  trait2: string;
  correlation: number;
  significance: number;
  strength: 'strong' | 'moderate' | 'weak' | 'negligible';
  direction: 'positive' | 'negative' | 'neutral';
}

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({
  data,
  onRefresh,
  onExport,
  className
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'network' | 'scatter'>('heatmap');
  const [threshold, setThreshold] = useState<number>(0.3);
  const [selectedPair, setSelectedPair] = useState<CorrelationPair | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string>('');

  // Configuration
  const config = {
    width: 700,
    height: 500,
    margin: { top: 60, right: 60, bottom: 60, left: 60 },
    animated: true,
    animationDuration: 750
  };

  // Calculate dimensions
  const width = config.width - config.margin.left - config.margin.right;
  const height = config.height - config.margin.top - config.margin.bottom;

  // Process correlation data
  const processedData: CorrelationHeatmapData[] = data.significantCorrelations
    .filter(pair => Math.abs(pair.correlation) >= threshold)
    .map(pair => {
      const correlation = pair.correlation;
      let strength: 'strong' | 'moderate' | 'weak' | 'negligible' = 'negligible';
      let direction: 'positive' | 'negative' | 'neutral' = 'neutral';

      if (Math.abs(correlation) >= 0.7) strength = 'strong';
      else if (Math.abs(correlation) >= 0.5) strength = 'moderate';
      else if (Math.abs(correlation) >= 0.3) strength = 'weak';

      if (correlation > 0.1) direction = 'positive';
      else if (correlation < -0.1) direction = 'negative';

      return {
        trait1: pair.trait1,
        trait2: pair.trait2,
        correlation,
        significance: pair.significance,
        strength,
        direction
      };
    });

  const traits = data.traits;

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
      case 'heatmap':
        renderCorrelationHeatmap(g, processedData);
        break;
      case 'network':
        renderCorrelationNetwork(g, processedData);
        break;
      case 'scatter':
        renderScatterMatrix(g, processedData);
        break;
    }

  }, [data, viewMode, processedData, threshold]);

  const renderCorrelationHeatmap = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: CorrelationHeatmapData[]
  ) => {
    const cellSize = Math.min(width, height) / traits.length;
    const actualSize = cellSize * traits.length;

    // Create color scale
    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
      .domain([-1, 1]);

    // Create scales for positioning
    const xScale = d3.scaleBand()
      .domain(traits)
      .range([0, actualSize]);

    const yScale = d3.scaleBand()
      .domain(traits)
      .range([0, actualSize]);

    // Center the heatmap
    const offsetX = (width - actualSize) / 2;
    const offsetY = (height - actualSize) / 2;

    // Create correlation matrix
    const correlationMatrix: { [key: string]: { [key: string]: number } } = {};
    traits.forEach(trait1 => {
      correlationMatrix[trait1] = {};
      traits.forEach(trait2 => {
        if (trait1 === trait2) {
          correlationMatrix[trait1][trait2] = 1;
        } else {
          const correlation = data.find(d => 
            (d.trait1 === trait1 && d.trait2 === trait2) ||
            (d.trait1 === trait2 && d.trait2 === trait1)
          );
          correlationMatrix[trait1][trait2] = correlation ? correlation.correlation : 0;
        }
      });
    });

    // Draw cells
    g.selectAll('.cell')
      .data(traits.flatMap(trait1 => 
        traits.map(trait2 => ({
          trait1,
          trait2,
          correlation: correlationMatrix[trait1][trait2]
        }))
      ))
      .enter().append('rect')
      .attr('class', 'cell')
      .attr('x', d => offsetX + (xScale(d.trait1) || 0))
      .attr('y', d => offsetY + (yScale(d.trait2) || 0))
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', d => colorScale(d.correlation))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredCell(`${d.trait1}-${d.trait2}`);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('stroke-width', 3)
          .attr('stroke', theme.palette.primary.main);
      })
      .on('mouseleave', (event, d) => {
        setHoveredCell('');
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('stroke-width', 1)
          .attr('stroke', '#fff');
      })
      .on('click', (event, d) => {
        const correlation = data.find(c => 
          (c.trait1 === d.trait1 && c.trait2 === d.trait2) ||
          (c.trait1 === d.trait2 && c.trait2 === d.trait1)
        );
        if (correlation) {
          setSelectedPair({
            trait1: d.trait1,
            trait2: d.trait2,
            correlation: d.correlation,
            significance: 0.95,
            sampleSize: 100
          });
        }
      });

    // Add value labels for significant correlations
    g.selectAll('.label')
      .data(traits.flatMap(trait1 => 
        traits.map(trait2 => ({
          trait1,
          trait2,
          correlation: correlationMatrix[trait1][trait2]
        }))
      ))
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', d => offsetX + (xScale(d.trait1) || 0) + cellSize / 2)
      .attr('y', d => offsetY + (yScale(d.trait2) || 0) + cellSize / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '10px')
      .attr('fill', d => Math.abs(d.correlation) > 0.5 ? '#fff' : '#000')
      .attr('font-weight', 'bold')
      .text(d => d.correlation.toFixed(2))
      .style('pointer-events', 'none');

    // Draw axes
    const xAxis = d3.axisTop(xScale);
    const yAxis = d3.axisLeft(yScale);

    g.append('g')
      .attr('transform', `translate(${offsetX}, ${offsetY})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    g.append('g')
      .attr('transform', `translate(${offsetX}, ${offsetY})`)
      .call(yAxis);
  };

  const renderCorrelationNetwork = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: CorrelationHeatmapData[]
  ) => {
    // Create nodes for each trait
    const nodes = traits.map(trait => ({ id: trait, name: trait }));
    
    // Create links for significant correlations
    const links = data.map(d => ({
      source: d.trait1,
      target: d.trait2,
      value: Math.abs(d.correlation),
      correlation: d.correlation
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).strength(d => d.value))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create link elements
    const link = g.append('g')
      .selectAll('.link')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', d => d.correlation > 0 ? theme.palette.success.main : theme.palette.error.main)
      .attr('stroke-width', d => Math.abs(d.correlation) * 5)
      .attr('stroke-opacity', 0.6);

    // Create node elements
    const node = g.append('g')
      .selectAll('.node')
      .data(nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', 20)
      .attr('fill', theme.palette.primary.main)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredCell(d.name);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('r', 25);
      })
      .on('mouseleave', (event, d) => {
        setHoveredCell('');
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('r', 20);
      });

    // Add labels
    const label = g.append('g')
      .selectAll('.label')
      .data(nodes)
      .enter().append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .text(d => d.name.substring(0, 3).toUpperCase())
      .style('pointer-events', 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });
  };

  const renderScatterMatrix = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: CorrelationHeatmapData[]
  ) => {
    const gridSize = Math.floor(Math.sqrt(traits.length));
    const cellSize = Math.min(width, height) / gridSize;

    // Create scales for each trait
    const scales: { [key: string]: d3.ScaleLinear<number, number> } = {};
    traits.forEach(trait => {
      scales[trait] = d3.scaleLinear()
        .domain([0, 1])
        .range([0, cellSize]);
    });

    // Create scatter plots for each pair
    traits.forEach((trait1, i) => {
      traits.forEach((trait2, j) => {
        if (i < j) { // Only create upper triangle
          const x = j * cellSize;
          const y = i * cellSize;

          const cell = g.append('g')
            .attr('transform', `translate(${x}, ${y})`);

          // Draw border
          cell.append('rect')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('fill', 'none')
            .attr('stroke', theme.palette.divider)
            .attr('stroke-width', 1);

          // Generate random sample data points (in real implementation, use actual data)
          const numPoints = 50;
          const points = Array.from({ length: numPoints }, () => ({
            x: Math.random(),
            y: Math.random()
          }));

          // Draw points
          cell.selectAll('.point')
            .data(points)
            .enter().append('circle')
            .attr('class', 'point')
            .attr('cx', d => scales[trait1](d.x))
            .attr('cy', d => cellSize - scales[trait2](d.y))
            .attr('r', 2)
            .attr('fill', alpha(theme.palette.primary.main, 0.6));

          // Add correlation coefficient
          const correlation = data.find(d => 
            (d.trait1 === trait1 && d.trait2 === trait2) ||
            (d.trait1 === trait2 && d.trait2 === trait1)
          );

          if (correlation) {
            cell.append('text')
              .attr('x', cellSize / 2)
              .attr('y', cellSize / 2)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('font-size', '12px')
              .attr('fill', correlation.correlation > 0 ? theme.palette.success.main : theme.palette.error.main)
              .attr('font-weight', 'bold')
              .text(`r=${correlation.correlation.toFixed(2)}`);
          }
        }
      });
    });

    // Add trait labels
    traits.forEach((trait, i) => {
      // Top labels
      g.append('text')
        .attr('x', i * cellSize + cellSize / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', theme.palette.text.primary)
        .text(trait.substring(0, 3).toUpperCase());

      // Left labels
      g.append('text')
        .attr('x', -10)
        .attr('y', i * cellSize + cellSize / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('fill', theme.palette.text.primary)
        .text(trait.substring(0, 3).toUpperCase());
    });
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return theme.palette.success.main;
      case 'moderate': return theme.palette.warning.main;
      case 'weak': return theme.palette.info.main;
      case 'negligible': return theme.palette.grey[500];
      default: return theme.palette.grey[500];
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'positive': return <TrendingUpIcon />;
      case 'negative': return <TrendingDownIcon />;
      default: return null;
    }
  };

  return (
    <Card className={className} sx={{ height: 'fit-content' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Correlation Analysis
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh Data">
              <IconButton size="small" onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Analysis">
              <IconButton size="small" onClick={onExport}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Analyze relationships between personality traits and identify patterns.
        </Typography>

        {/* Controls */}
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>View Mode</InputLabel>
            <Select
              value={viewMode}
              label="View Mode"
              onChange={(e) => setViewMode(e.target.value as 'heatmap' | 'network' | 'scatter')}
            >
              <MenuItem value="heatmap">Heatmap</MenuItem>
              <MenuItem value="network">Network</MenuItem>
              <MenuItem value="scatter">Scatter Matrix</MenuItem>
            </Select>
          </FormControl>

          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Correlation Threshold: {threshold.toFixed(2)}
            </Typography>
            <Slider
              value={threshold}
              onChange={(_, value) => setThreshold(value as number)}
              min={0}
              max={1}
              step={0.1}
              marks={[
                { value: 0, label: '0.0' },
                { value: 0.3, label: '0.3' },
                { value: 0.5, label: '0.5' },
                { value: 0.7, label: '0.7' },
                { value: 1, label: '1.0' }
              ]}
            />
          </Box>
        </Box>

        {/* Statistics Summary */}
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip 
            icon={<AnalyticsIcon />}
            label={`${data.significantCorrelations.length} Correlations`}
            color="primary" 
            size="small" 
          />
          <Chip 
            label={`${processedData.filter(d => d.strength === 'strong').length} Strong`} 
            color="success" 
            size="small" 
          />
          <Chip 
            label={`${processedData.filter(d => d.strength === 'moderate').length} Moderate`} 
            color="warning" 
            size="small" 
          />
          <Chip 
            label={`${processedData.filter(d => d.strength === 'weak').length} Weak`} 
            color="info" 
            size="small" 
          />
        </Box>
        
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ overflow: 'auto' }}>
          <svg ref={svgRef}></svg>
        </Box>

        {/* Correlation Details */}
        {selectedPair && (
          <Box mt={2} p={2} bgcolor={alpha(theme.palette.background.paper, 0.5)} borderRadius={1}>
            <Typography variant="subtitle2" gutterBottom>
              Correlation Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Traits:</strong> {selectedPair.trait1} ↔ {selectedPair.trait2}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Correlation:</strong> {selectedPair.correlation.toFixed(3)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Significance:</strong> {(selectedPair.significance * 100).toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Sample Size:</strong> {selectedPair.sampleSize}
            </Typography>
          </Box>
        )}

        {/* Legend */}
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Legend
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={12} height={12} bgcolor={theme.palette.success.main} borderRadius={1} />
              <Typography variant="caption">Positive Correlation</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={12} height={12} bgcolor={theme.palette.error.main} borderRadius={1} />
              <Typography variant="caption">Negative Correlation</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={12} height={12} bgcolor={theme.palette.grey[500]} borderRadius={1} />
              <Typography variant="caption">No Correlation</Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CorrelationAnalysis;