import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import * as d3 from 'd3';
import type { RadarChartData, RadarChartConfig } from '../../types/personality';

interface TraitsRadarChartProps {
  data: RadarChartData[];
  config?: Partial<RadarChartConfig>;
  onTraitClick?: (trait: string, value: number) => void;
  className?: string;
}

const TraitsRadarChart: React.FC<TraitsRadarChartProps> = ({
  data,
  config,
  onTraitClick,
  className
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredTrait, setHoveredTrait] = useState<string | null>(null);

  // Default configuration
  const defaultConfig: RadarChartConfig = {
    width: 500,
    height: 500,
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
    levels: 5,
    maxValue: 1,
    showLabels: true,
    showAxes: true,
    showLegend: true,
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main
    ],
    animated: true,
    animationDuration: 750
  };

  const chartConfig = { ...defaultConfig, ...config };

  // Calculate dimensions
  const width = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right;
  const height = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;
  const radius = Math.min(width, height) / 2;

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', chartConfig.width)
      .attr('height', chartConfig.height);

    const g = svg.append('g')
      .attr('transform', `translate(${chartConfig.margin.left + width / 2}, ${chartConfig.margin.top + height / 2})`);

    // Create angle scale
    const angleSlice = (Math.PI * 2) / data.length;
    const angleScale = d3.scaleLinear()
      .domain([0, data.length])
      .range([0, Math.PI * 2]);

    // Create radius scale
    const radiusScale = d3.scaleLinear()
      .domain([0, chartConfig.maxValue])
      .range([0, radius]);

    // Draw grid circles
    if (chartConfig.showAxes) {
      for (let i = 1; i <= chartConfig.levels; i++) {
        const levelRadius = (radius / chartConfig.levels) * i;
        
        g.append('circle')
          .attr('r', levelRadius)
          .attr('fill', 'none')
          .attr('stroke', theme.palette.divider)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3')
          .style('opacity', 0.5);
      }

      // Draw axes
      data.forEach((d, i) => {
        const angle = angleScale(i);
        const x = Math.cos(angle - Math.PI / 2) * radius;
        const y = Math.sin(angle - Math.PI / 2) * radius;

        g.append('line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', x)
          .attr('y2', y)
          .attr('stroke', theme.palette.divider)
          .attr('stroke-width', 1)
          .style('opacity', 0.5);
      });
    }

    // Create line generator
    const lineGenerator = d3.lineRadial<any>()
      .angle((d, i) => angleScale(i))
      .radius(d => radiusScale(d.value))
      .curve(d3.curveLinearClosed);

    // Create area generator
    const areaGenerator = d3.areaRadial<any>()
      .angle((d, i) => angleScale(i))
      .innerRadius(0)
      .outerRadius(d => radiusScale(d.value))
      .curve(d3.curveLinearClosed);

    // Draw the radar area
    const radarArea = g.append('path')
      .datum(data)
      .attr('d', areaGenerator)
      .attr('fill', chartConfig.colors[0])
      .attr('fill-opacity', 0.2)
      .attr('stroke', chartConfig.colors[0])
      .attr('stroke-width', 2)
      .style('filter', 'url(#glow)');

    // Draw the radar line
    const radarLine = g.append('path')
      .datum(data)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', chartConfig.colors[0])
      .attr('stroke-width', 2);

    // Add glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    // Draw points
    const points = g.selectAll('.point')
      .data(data)
      .enter().append('g')
      .attr('class', 'point');

    points.append('circle')
      .attr('cx', (d, i) => Math.cos(angleScale(i) - Math.PI / 2) * radiusScale(d.value))
      .attr('cy', (d, i) => Math.sin(angleScale(i) - Math.PI / 2) * radiusScale(d.value))
      .attr('r', 4)
      .attr('fill', chartConfig.colors[0])
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (onTraitClick) {
          onTraitClick(d.trait, d.value);
        }
      })
      .on('mouseenter', (event, d) => {
        setHoveredTrait(d.trait);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('r', 6);
      })
      .on('mouseleave', (event, d) => {
        setHoveredTrait(null);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('r', 4);
      });

    // Draw labels
    if (chartConfig.showLabels) {
      const labels = g.selectAll('.label')
        .data(data)
        .enter().append('g')
        .attr('class', 'label');

      labels.append('text')
        .attr('x', (d, i) => Math.cos(angleScale(i) - Math.PI / 2) * (radius + 20))
        .attr('y', (d, i) => Math.sin(angleScale(i) - Math.PI / 2) * (radius + 20))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', theme.palette.text.primary)
        .text(d => d.trait);

      // Add value labels
      labels.append('text')
        .attr('x', (d, i) => Math.cos(angleScale(i) - Math.PI / 2) * radiusScale(d.value))
        .attr('y', (d, i) => Math.sin(angleScale(i) - Math.PI / 2) * radiusScale(d.value) - 10)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('fill', theme.palette.text.secondary)
        .text(d => d.value.toFixed(2));
    }

    // Animation
    if (chartConfig.animated) {
      const totalLength = radarLine.node()?.getTotalLength() || 0;
      
      radarLine
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(chartConfig.animationDuration)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

      radarArea
        .attr('opacity', 0)
        .transition()
        .duration(chartConfig.animationDuration)
        .ease(d3.easeLinear)
        .attr('opacity', 1);
    }

  }, [data, chartConfig, theme, onTraitClick]);

  return (
    <Card className={className} sx={{ height: 'fit-content' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Big Five Personality Traits
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Interactive radar chart showing the Big Five personality traits. Click on any point to see details.
        </Typography>
        
        <Box display="flex" justifyContent="center" alignItems="center">
          <svg ref={svgRef}></svg>
        </Box>

        {hoveredTrait && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              Hovering: <strong>{hoveredTrait}</strong>
            </Typography>
          </Box>
        )}

        {/* Legend */}
        {chartConfig.showLegend && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Legend
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {data.map((d, i) => (
                <Box key={d.trait} display="flex" alignItems="center" gap={1}>
                  <Box
                    width={12}
                    height={12}
                    borderRadius={1}
                    bgcolor={chartConfig.colors[i % chartConfig.colors.length]}
                  />
                  <Typography variant="caption">
                    {d.trait}: {d.value.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TraitsRadarChart;