import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import * as d3 from 'd3';
import type { CognitiveLoadGaugeProps } from '../../types/dashboard';

/**
 * CognitiveLoadGauge Component
 * 
 * A radial gauge visualization for displaying agent cognitive load metrics.
 * Features animated transitions, threshold indicators, and trend visualization.
 */
const CognitiveLoadGauge: React.FC<CognitiveLoadGaugeProps> = ({
  value,
  threshold,
  trend,
  size = 'medium',
  animated = true,
  showThreshold = true,
  showTrend = true,
  className,
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Use provided thresholds or defaults
  const thresholds = threshold || {
    low: 25,
    medium: 50,
    high: 75,
    critical: 90,
  };

  // Size configuration
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'small':
        return { width: 120, height: 120, innerRadius: 30, outerRadius: 50 };
      case 'large':
        return { width: 200, height: 200, innerRadius: 60, outerRadius: 90 };
      default: // medium
        return { width: 160, height: 160, innerRadius: 45, outerRadius: 70 };
    }
  }, [size]);

  // Color scales for different cognitive load levels
  const colorScale = useMemo(() => {
    const thresholdValues = typeof thresholds === 'object' ? thresholds : {
      low: 25,
      medium: 50,
      high: 75,
      critical: 90,
    };
    return d3.scaleLinear<string>()
      .domain([thresholdValues.low, thresholdValues.medium, thresholdValues.high, thresholdValues.critical])
      .range(['#4caf50', '#ff9800', '#ff5722', '#d32f2f'])
      .clamp(true);
  }, [thresholds]);

  // Calculate angle for value (gauge goes from -135 to 135 degrees)
  const calculateAngle = useCallback((val: number) => {
    const normalizedValue = Math.max(0, Math.min(100, val));
    return -135 + (normalizedValue / 100) * 270;
  }, []);

  // Draw the gauge
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    const { width, height, innerRadius, outerRadius } = sizeConfig;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create the main group
    const g = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Background arc
    const backgroundArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(-135 * Math.PI / 180)
      .endAngle(135 * Math.PI / 180);

    g.append('path')
      .datum({ startAngle: -135 * Math.PI / 180, endAngle: 135 * Math.PI / 180 })
      .style('fill', theme.palette.grey[200])
      .attr('d', backgroundArc as any);

    // Threshold arcs
    if (showThreshold) {
      const thresholdArc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius + 5);

      const thresholdValues = typeof thresholds === 'object' ? thresholds : {
        low: 25,
        medium: 50,
        high: 75,
        critical: 90,
      };

      // Low threshold
      g.append('path')
        .datum({
          startAngle: -135 * Math.PI / 180,
          endAngle: calculateAngle(thresholdValues.low) * Math.PI / 180
        })
        .style('fill', colorScale(thresholdValues.low))
        .style('opacity', 0.3)
        .attr('d', thresholdArc as any);

      // Medium threshold
      g.append('path')
        .datum({
          startAngle: calculateAngle(thresholdValues.low) * Math.PI / 180,
          endAngle: calculateAngle(thresholdValues.medium) * Math.PI / 180
        })
        .style('fill', colorScale(thresholdValues.medium))
        .style('opacity', 0.3)
        .attr('d', thresholdArc as any);

      // High threshold
      g.append('path')
        .datum({
          startAngle: calculateAngle(thresholdValues.medium) * Math.PI / 180,
          endAngle: calculateAngle(thresholdValues.high) * Math.PI / 180
        })
        .style('fill', colorScale(thresholdValues.high))
        .style('opacity', 0.3)
        .attr('d', thresholdArc as any);

      // Critical threshold
      g.append('path')
        .datum({
          startAngle: calculateAngle(thresholdValues.high) * Math.PI / 180,
          endAngle: calculateAngle(thresholdValues.critical) * Math.PI / 180
        })
        .style('fill', colorScale(thresholdValues.critical))
        .style('opacity', 0.3)
        .attr('d', thresholdArc as any);
    }

    // Value arc
    const valueArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const valuePath = g.append('path')
      .datum({ 
        startAngle: -135 * Math.PI / 180, 
        endAngle: calculateAngle(value) * Math.PI / 180 
      })
      .style('fill', colorScale(value))
      .attr('d', valueArc as any);

    // Animate the value arc
    if (animated) {
      valuePath
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attrTween('d', function(d: any) {
          const interpolate = d3.interpolate(-135 * Math.PI / 180, calculateAngle(value) * Math.PI / 180);
          return function(t: number) {
            d.endAngle = interpolate(t);
            return valueArc(d) || '';
          };
        });
    }

    // Add tick marks
    const tickCount = 11;
    for (let i = 0; i < tickCount; i++) {
      const angle = -135 + (i * 27);
      const radian = angle * Math.PI / 180;
      const x1 = Math.cos(radian) * (outerRadius + 8);
      const y1 = Math.sin(radian) * (outerRadius + 8);
      const x2 = Math.cos(radian) * (outerRadius + 12);
      const y2 = Math.sin(radian) * (outerRadius + 12);

      g.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .style('stroke', theme.palette.text.secondary)
        .style('stroke-width', i % 2 === 0 ? 2 : 1);
    }

    // Add center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('fill', colorScale(value))
      .text(Math.round(value).toString());

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .style('font-size', '12px')
      .style('fill', theme.palette.text.secondary)
      .text('Load %');

    // Add trend indicator
    if (showTrend && trend && value > (typeof thresholds === 'object' ? thresholds.medium : 50)) {
      const trendAngle = calculateAngle(value) * Math.PI / 180;
      const trendX = Math.cos(trendAngle) * (outerRadius + 20);
      const trendY = Math.sin(trendAngle) * (outerRadius + 20);

      g.append('circle')
        .attr('cx', trendX)
        .attr('cy', trendY)
        .attr('r', 4)
        .style('fill', colorScale(value))
        .style('stroke', theme.palette.background.paper)
        .style('stroke-width', 2);

      if (animated) {
        g.select('circle')
          .transition()
          .duration(1000)
          .ease(d3.easeBounce)
          .attr('r', 6)
          .transition()
          .duration(200)
          .attr('r', 4);
      }
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, thresholds, animated, showThreshold, showTrend, sizeConfig, colorScale, theme]);

  return (
    <Box 
      className={className}
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ width: sizeConfig.width }}
    >
      <svg
        ref={svgRef}
        width={sizeConfig.width}
        height={sizeConfig.height}
        viewBox={`0 0 ${sizeConfig.width} ${sizeConfig.height}`}
      />
      
      <Typography 
        variant="caption" 
        color="text.secondary"
        sx={{ mt: 1, textAlign: 'center' }}
      >
        Cognitive Load
      </Typography>
      
      {value > (typeof thresholds === 'object' ? thresholds.high : 75) && (
        <Typography 
          variant="caption" 
          color="error"
          sx={{ textAlign: 'center' }}
        >
          High Load Detected
        </Typography>
      )}
    </Box>
  );
};

export default React.memo(CognitiveLoadGauge);