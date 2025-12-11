import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Tooltip, IconButton } from '@mui/material';
import { Refresh as RefreshIcon, Settings as SettingsIcon } from '@mui/icons-material';
import * as d3 from 'd3';
import type { BaseVisualizerProps, PersonalityData, ColorScheme } from '../types/visualizers';

interface PersonalityRadarProps extends BaseVisualizerProps {
  data?: PersonalityData;
  colorScheme?: ColorScheme;
  showLabels?: boolean;
  showGrid?: boolean;
  animated?: boolean;
  interactive?: boolean;
}

export const PersonalityRadar: React.FC<PersonalityRadarProps> = ({
  data,
  width = 600,
  height = 600,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  theme = 'light',
  showLabels = true,
  showGrid = true,
  animated = true,
  interactive = true,
  onDataPointClick,
  onDataPointHover,
  onZoom,
  className
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredTrait, setHoveredTrait] = useState<string | null>(null);

  // Color schemes
  const colorSchemes: Record<string, ColorScheme> = {
    light: {
      primary: '#1976d2',
      secondary: '#dc3545',
      accent: '#ffc107',
      background: '#ffffff',
      text: '#333333',
      grid: '#e0e0e0'
    },
    dark: {
      primary: '#90caf9',
      secondary: '#3f51b5',
      accent: '#ff9800',
      background: '#121212',
      text: '#ffffff',
      grid: '#2d2d2d'
    }
  };

  const colors = colorSchemes[theme] || colorSchemes.light;

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svgWidth = width - margin.left - margin.right;
    const svgHeight = height - margin.top - margin.bottom;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const radius = Math.min(svgWidth, svgHeight) / 2 - 40;

    // Create radar chart
    const radarData = [
      { axis: 'Openness', value: data.traits.openness, fullMark: 1 },
      { axis: 'Conscientiousness', value: data.traits.conscientiousness, fullMark: 0.8 },
      { axis: 'Extraversion', value: data.traits.extraversion, fullMark: 0.8 },
      { axis: 'Agreeableness', value: data.traits.agreeableness, fullMark: 0.7 },
      { axis: 'Neuroticism', value: data.traits.neuroticism, fullMark: 0.6 },
      { axis: 'Risk Tolerance', value: data.traits.riskTolerance, fullMark: 0.75 },
      { axis: 'Creativity', value: data.traits.creativity, fullMark: 0.9 },
      { axis: 'Patience', value: data.traits.patience, fullMark: 0.7 },
      { axis: 'Competitiveness', value: data.traits.competitiveness, fullMark: 0.6 },
      { axis: 'Curiosity', value: data.traits.curiosity, fullMark: 0.85 }
    ];

    const angleScale = d3.scaleLinear()
      .domain([0, 11])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, radius]);

    const line = d3.lineRadial()
      .angle((d: any, i: number) => angleScale(i))
      .radius((d: any) => radiusScale(d.value))
      .curve(d3.curveCardinalClosed);

    const svg = d3.select(svgRef.current)
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    // Add background
    if (showGrid) {
      const gridGroup = svg.append('g')
        .attr('class', 'radar-grid');

      // Create circular grid
      for (let i = 0; i <= 10; i++) {
        const angle = angleScale(i);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        gridGroup.append('line')
          .attr('x1', centerX)
          .attr('y1', centerY)
          .attr('x2', x)
          .attr('y2', y)
          .attr('stroke', colors.grid)
          .attr('stroke-width', 0.5)
          .attr('opacity', 0.3);
      }

      // Add radial grid lines
      radarData.forEach((d, i) => {
        const angle = angleScale(i);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        gridGroup.append('line')
          .attr('x1', centerX)
          .attr('y1', centerY)
          .attr('x2', x)
          .attr('y2', y)
          .attr('stroke', colors.grid)
          .attr('stroke-width', 0.5)
          .attr('opacity', 0.2);
      });
    }

    // Add axes
    const axesGroup = svg.append('g')
      .attr('class', 'radar-axes');

    radarData.forEach((d, i) => {
      const angle = angleScale(i);
      const labelRadius = radius + 20;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);

      // Axis line
      axesGroup.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', colors.text)
        .attr('stroke-width', 2);

      // Axis label
      if (showLabels) {
        axesGroup.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', colors.text)
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(d.axis);
      }
    });

    // Add data polygon
    const dataGroup = svg.append('g')
      .attr('class', 'radar-data');

    const polygon = dataGroup.append('polygon')
      .datum(radarData.map(d => d.value))
      .attr('fill', colors.primary)
      .attr('fill-opacity', 0.3)
      .attr('stroke', colors.primary)
      .attr('stroke-width', 2)
      .attr('points', (d: any) => {
        const angle = angleScale(radarData.findIndex(item => item.axis === d.axis));
        const r = radiusScale(d.value);
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .on('click', function(event, d) {
        if (onDataPointClick) {
          onDataPointClick({ trait: d.axis, value: d.value, data: data.traits });
        }
      })
      .on('mouseover', function(event, d) {
        setHoveredTrait(d.axis);
        if (onDataPointHover) {
          onDataPointHover({ trait: d.axis, value: d.value, data: data.traits });
        }
      })
      .on('mouseout', function() {
        setHoveredTrait(null);
        if (onDataPointHover) {
          onDataPointHover(null);
        }
      });

    // Add data points
    radarData.forEach((d, i) => {
      const angle = angleScale(i);
      const r = radiusScale(d.value);
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);

      dataGroup.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 4)
        .attr('fill', colors.primary)
        .attr('stroke', colors.background)
        .attr('stroke-width', 2)
        .on('click', function(event, d) {
          if (onDataPointClick) {
            onDataPointClick({ trait: d.axis, value: d.value, data: data.traits });
          }
        })
        .on('mouseover', function(event, d) {
          setHoveredTrait(d.axis);
          if (onDataPointHover) {
            onDataPointHover({ trait: d.axis, value: d.value, data: data.traits });
          }
        })
        .on('mouseout', function() {
          setHoveredTrait(null);
          if (onDataPointHover) {
            onDataPointHover(null);
          }
        });
    });

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'personality-radar-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', colors.text)
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    const updateTooltip = (event: MouseEvent, trait: string, value: number) => {
      const [x, y] = d3.pointer(event);
      tooltip
        .style('left', `${x + 10}px`)
        .style('top', `${y - 10}px`)
        .style('visibility', 'visible')
        .html(`<strong>${trait}</strong><br/>Value: ${(value * 100).toFixed(1)}%`);
    };

    const hideTooltip = () => {
      tooltip.style('visibility', 'hidden');
    };

    svg.on('mousemove', function(event) {
      const [x, y] = d3.pointer(event);
      tooltip
        .style('left', `${x + 10}px`)
        .style('top', `${y - 10}px`);
    })
      .on('mouseout', hideTooltip);

  }, [data, width, height, margin, theme, showLabels, showGrid, animated, interactive]);

  // Cleanup
  useEffect(() => {
    return () => {
      d3.select('body').selectAll('.personality-radar-tooltip').remove();
    };
  }, []);

  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: colors.background,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
      className={className}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Personality Radar Chart
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => window.location.reload()} size="small">
            <RefreshIcon />
          </IconButton>
          
          <IconButton size="small">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>
      
      {hoveredTrait && (
        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
          Hovering: {hoveredTrait} ({data.traits[hoveredTrait as keyof typeof data.traits] !== undefined ? (data.traits[hoveredTrait as keyof typeof data.traits] * 100).toFixed(1) : 'N/A'}%)
        </Typography>
      )}
      
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%' }}
      />
    </Paper>
  );
};

export default PersonalityRadar;