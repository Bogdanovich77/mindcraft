import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon
} from '@mui/icons-material';
import * as d3 from 'd3';
import type { GamingTraitsData, GamingTraitsConfig } from '../../types/personality';

interface GamingTraitsChartProps {
  data: GamingTraitsData;
  config?: Partial<GamingTraitsConfig>;
  onTraitClick?: (trait: string, value: number) => void;
  className?: string;
}

type ChartType = 'bar' | 'pie' | 'radial';

const GamingTraitsChart: React.FC<GamingTraitsChartProps> = ({
  data,
  config,
  onTraitClick,
  className
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [hoveredTrait, setHoveredTrait] = useState<string | null>(null);

  // Default configuration
  const defaultConfig: GamingTraitsConfig = {
    width: 500,
    height: 400,
    margin: { top: 40, right: 40, bottom: 60, left: 60 },
    animated: true,
    animationDuration: 750,
    showLabels: true,
    showValues: true,
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main
    ]
  };

  const chartConfig = { ...defaultConfig, ...config };

  // Calculate dimensions
  const width = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right;
  const height = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;

  // Transform data for D3
  const traitsData = Object.entries(data.traits).map(([trait, value]) => ({
    trait,
    value,
    description: data.descriptions[trait] || '',
    category: data.categories[trait] || 'general'
  }));

  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', chartConfig.width)
      .attr('height', chartConfig.height);

    const g = svg.append('g')
      .attr('transform', `translate(${chartConfig.margin.left}, ${chartConfig.margin.top})`);

    // Render different chart types
    switch (chartType) {
      case 'bar':
        renderBarChart(g, traitsData);
        break;
      case 'pie':
        renderPieChart(g, traitsData);
        break;
      case 'radial':
        renderRadialChart(g, traitsData);
        break;
    }

  }, [data, chartConfig, chartType, theme]);

  const renderBarChart = (g: d3.Selection<SVGGElement, unknown, null, undefined>, data: any[]) => {
    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.trait))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // Create color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.category))
      .range(chartConfig.colors);

    // Draw axes
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Draw bars
    const bars = g.selectAll('.bar')
      .data(data)
      .enter().append('g')
      .attr('class', 'bar');

    bars.append('rect')
      .attr('x', d => xScale(d.trait) || 0)
      .attr('y', height)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', d => colorScale(d.category))
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
          .attr('opacity', 0.8);
      })
      .on('mouseleave', (event, d) => {
        setHoveredTrait(null);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('opacity', 1);
      });

    // Add value labels
    if (chartConfig.showValues) {
      bars.append('text')
        .attr('x', d => (xScale(d.trait) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', theme.palette.text.secondary)
        .text(d => d.value.toFixed(2));
    }

    // Animation
    if (chartConfig.animated) {
      bars.select('rect')
        .transition()
        .duration(chartConfig.animationDuration)
        .delay((d, i) => i * 50)
        .attr('y', d => yScale(d.value))
        .attr('height', d => height - yScale(d.value));
    } else {
      bars.select('rect')
        .attr('y', d => yScale(d.value))
        .attr('height', d => height - yScale(d.value));
    }
  };

  const renderPieChart = (g: d3.Selection<SVGGElement, unknown, null, undefined>, data: any[]) => {
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create pie generator
    const pie = d3.pie<any>()
      .value(d => d.value)
      .sort(null);

    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<any>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcHover = d3.arc<d3.PieArcDatum<any>>()
      .innerRadius(0)
      .outerRadius(radius * 1.1);

    // Create color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.trait))
      .range(chartConfig.colors);

    // Draw pie slices
    const slices = g.selectAll<any, d3.PieArcDatum<any>>('.slice')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'slice')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    slices.append('path')
      .attr('d', arc)
      .attr('fill', (d: d3.PieArcDatum<any>) => colorScale(d.data.trait))
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event: any, d: d3.PieArcDatum<any>) => {
        if (onTraitClick) {
          onTraitClick(d.data.trait, d.data.value);
        }
      })
      .on('mouseenter', function(event: any, d: d3.PieArcDatum<any>) {
        setHoveredTrait(d.data.trait);
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover);
      })
      .on('mouseleave', function(event: any, d: d3.PieArcDatum<any>) {
        setHoveredTrait(null);
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc);
      });

    // Add labels
    if (chartConfig.showLabels) {
      slices.append('text')
        .attr('transform', (d: d3.PieArcDatum<any>) => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('fill', theme.palette.text.primary)
        .text((d: d3.PieArcDatum<any>) => `${d.data.trait} (${d.data.value.toFixed(2)})`);
    }

    // Animation
    if (chartConfig.animated) {
      slices.select('path')
        .transition()
        .duration(chartConfig.animationDuration)
        .delay((d: any, i: number) => i * 50)
        .attrTween('d', function(d: d3.PieArcDatum<any>) {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return function(t: number) {
            return arc(interpolate(t) as d3.PieArcDatum<any>) || '';
          };
        });
    }
  };

  const renderRadialChart = (g: d3.Selection<SVGGElement, unknown, null, undefined>, data: any[]) => {
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

    // Create color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.category))
      .range(chartConfig.colors);

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

    // Draw axes
    data.forEach((d, i) => {
      const angle = angleScale(i);
      const x = centerX + Math.cos(angle - Math.PI / 2) * radius;
      const y = centerY + Math.sin(angle - Math.PI / 2) * radius;

      g.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', theme.palette.divider)
        .attr('stroke-width', 1)
        .style('opacity', 0.3);
    });

    // Create area generator
    const areaGenerator = d3.areaRadial<any>()
      .angle((d, i) => angleScale(i))
      .innerRadius(0)
      .outerRadius(d => radiusScale(d.value))
      .curve(d3.curveLinearClosed);

    // Draw area
    g.append('path')
      .datum(data)
      .attr('d', areaGenerator)
      .attr('transform', `translate(${centerX}, ${centerY})`)
      .attr('fill', chartConfig.colors[0])
      .attr('fill-opacity', 0.3)
      .attr('stroke', chartConfig.colors[0])
      .attr('stroke-width', 2);

    // Draw points
    const points = g.selectAll('.point')
      .data(data)
      .enter().append('g')
      .attr('class', 'point');

    points.append('circle')
      .attr('cx', (d, i) => centerX + Math.cos(angleScale(i) - Math.PI / 2) * radiusScale(d.value))
      .attr('cy', (d, i) => centerY + Math.sin(angleScale(i) - Math.PI / 2) * radiusScale(d.value))
      .attr('r', 4)
      .attr('fill', d => colorScale(d.category))
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
        .attr('x', (d, i) => centerX + Math.cos(angleScale(i) - Math.PI / 2) * (radius + 20))
        .attr('y', (d, i) => centerY + Math.sin(angleScale(i) - Math.PI / 2) * (radius + 20))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('fill', theme.palette.text.primary)
        .text(d => d.trait);
    }

    // Animation
    if (chartConfig.animated) {
      points.select('circle')
        .attr('r', 0)
        .transition()
        .duration(chartConfig.animationDuration)
        .delay((d, i) => i * 50)
        .attr('r', 4);
    }
  };

  return (
    <Card className={className} sx={{ height: 'fit-content' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Gaming-Specific Traits
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Bar Chart">
              <IconButton
                size="small"
                onClick={() => setChartType('bar')}
                color={chartType === 'bar' ? 'primary' : 'default'}
              >
                <BarChartIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Pie Chart">
              <IconButton
                size="small"
                onClick={() => setChartType('pie')}
                color={chartType === 'pie' ? 'primary' : 'default'}
              >
                <PieChartIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Radial Chart">
              <IconButton
                size="small"
                onClick={() => setChartType('radial')}
                color={chartType === 'radial' ? 'primary' : 'default'}
              >
                <LineChartIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Visualization of gaming-specific personality traits. Switch between different chart types for better insights.
        </Typography>
        
        <Box display="flex" justifyContent="center" alignItems="center">
          <svg ref={svgRef}></svg>
        </Box>

        {hoveredTrait && data.descriptions[hoveredTrait] && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              <strong>{hoveredTrait}:</strong> {data.descriptions[hoveredTrait]}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default GamingTraitsChart;