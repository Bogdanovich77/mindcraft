import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Slider,
  Chip,
  Divider,
  Alert,
  Tooltip,
} from '@mui/material';
import * as d3 from 'd3';
import type { AgentState, PersonalityTraits } from '../../types/agent';
import { useAppSelector } from '../../store';
import {
  selectAgentPersonality,
  selectPersonalityLoading,
  selectPersonalityError
} from '../../store/slices/personalitySlice';

interface PersonalityTabProps {
  agent: AgentState;
}

interface TraitData {
  name: string;
  value: number;
  category: 'bigFive' | 'gaming';
  description: string;
}

interface PersonalityInfluence {
  trait: string;
  influence: string;
  impact: 'positive' | 'neutral' | 'negative';
}

const PersonalityTab: React.FC<PersonalityTabProps> = ({ agent }) => {
  const dispatch = useAppDispatch();
  
  // Get live personality data from Redux store
  const personalityData = useAppSelector(selectAgentPersonality(agent.id));
  const personalityLoading = useAppSelector(selectPersonalityLoading);
  const personalityError = useAppSelector(selectPersonalityError);
  
  // Use live data if available, fallback to agent prop
  const personality = personalityData?.traits || agent.cognitive.purpose.personality;
  const [editablePersonality, setEditablePersonality] = useState<PersonalityTraits>(personality);
  const [isEditing, setIsEditing] = useState(false);
  
  // Refs for D3 containers
  const bigFiveChartRef = useRef<SVGSVGElement>(null);
  const gamingTraitsChartRef = useRef<SVGSVGElement>(null);
  const timelineChartRef = useRef<SVGSVGElement>(null);

  // Prepare trait data
  const getTraitData = (): TraitData[] => [
    {
      name: 'Openness',
      value: editablePersonality.openness,
      category: 'bigFive',
      description: 'Creativity, curiosity, and preference for novelty'
    },
    {
      name: 'Conscientiousness',
      value: editablePersonality.conscientiousness,
      category: 'bigFive',
      description: 'Organization, responsibility, and goal-directed behavior'
    },
    {
      name: 'Extraversion',
      value: editablePersonality.extraversion,
      category: 'bigFive',
      description: 'Sociability, assertiveness, and positive emotions'
    },
    {
      name: 'Agreeableness',
      value: editablePersonality.agreeableness,
      category: 'bigFive',
      description: 'Cooperation, trust, and compassion for others'
    },
    {
      name: 'Neuroticism',
      value: editablePersonality.neuroticism,
      category: 'bigFive',
      description: 'Emotional stability and stress reactivity'
    },
    {
      name: 'Risk Tolerance',
      value: editablePersonality.riskTolerance,
      category: 'gaming',
      description: 'Willingness to take risks in dangerous situations'
    },
    {
      name: 'Creativity',
      value: editablePersonality.creativity,
      category: 'gaming',
      description: 'Creative problem-solving and innovative approaches'
    },
    {
      name: 'Patience',
      value: editablePersonality.patience,
      category: 'gaming',
      description: 'Ability to wait and persist through delays'
    },
    {
      name: 'Competitiveness',
      value: editablePersonality.competitiveness,
      category: 'gaming',
      description: 'Drive to compete and achieve superiority'
    },
    {
      name: 'Curiosity',
      value: editablePersonality.curiosity,
      category: 'gaming',
      description: 'Desire to explore and discover new information'
    }
  ];

  // Get personality influences
  const getPersonalityInfluences = (): PersonalityInfluence[] => {
    const influences: PersonalityInfluence[] = [];
    
    if (editablePersonality.openness > 0.7) {
      influences.push({
        trait: 'Openness',
        influence: 'Prefers exploration and creative building projects',
        impact: 'positive'
      });
    }
    
    if (editablePersonality.conscientiousness > 0.7) {
      influences.push({
        trait: 'Conscientiousness',
        influence: 'Excels at long-term planning and resource management',
        impact: 'positive'
      });
    }
    
    if (editablePersonality.extraversion > 0.7) {
      influences.push({
        trait: 'Extraversion',
        influence: 'Seeks social interaction and collaborative projects',
        impact: 'positive'
      });
    }
    
    if (editablePersonality.riskTolerance > 0.8) {
      influences.push({
        trait: 'Risk Tolerance',
        influence: 'May engage in dangerous combat or exploration',
        impact: 'negative'
      });
    }
    
    if (editablePersonality.patience < 0.3) {
      influences.push({
        trait: 'Patience',
        influence: 'May abandon long-term projects prematurely',
        impact: 'negative'
      });
    }
    
    if (editablePersonality.curiosity > 0.8) {
      influences.push({
        trait: 'Curiosity',
        influence: 'Actively explores unknown areas and experiments',
        impact: 'positive'
      });
    }
    
    return influences;
  };

  // Generate mock timeline data
  const getTimelineData = () => {
    const now = Date.now();
    const dataPoints = 20;
    const interval = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    
    return Array.from({ length: dataPoints }, (_, i) => ({
      date: new Date(now - (dataPoints - i - 1) * interval),
      openness: Math.max(0, Math.min(1, editablePersonality.openness + (Math.random() - 0.5) * 0.1)),
      conscientiousness: Math.max(0, Math.min(1, editablePersonality.conscientiousness + (Math.random() - 0.5) * 0.1)),
      extraversion: Math.max(0, Math.min(1, editablePersonality.extraversion + (Math.random() - 0.5) * 0.1)),
    }));
  };

  // Create horizontal bar chart
  const createBarChart = (container: SVGSVGElement | null, data: TraitData[], title: string) => {
    if (!container) return;

    // Clear previous chart
    d3.select(container).selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 30, left: 150 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = data.length * 40 - margin.top - margin.bottom;

    const svg = d3.select(container)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, height])
      .padding(0.1);

    // Color scale
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 0.5, 1])
      .range(['#ff4444', '#ffaa00', '#44ff44']);

    // Title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.name) || 0)
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', d => x(d.value))
      .attr('fill', d => colorScale(d.value))
      .attr('rx', 4)
      .attr('ry', 4);

    // Labels
    g.selectAll('.label')
      .data(data)
      .enter().append('text')
      .attr('class', 'label')
      .attr('y', d => (y(d.name) || 0) + y.bandwidth() / 2)
      .attr('x', -10)
      .attr('text-anchor', 'end')
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text(d => d.name);

    // Values
    g.selectAll('.value')
      .data(data)
      .enter().append('text')
      .attr('class', 'value')
      .attr('y', d => (y(d.name) || 0) + y.bandwidth() / 2)
      .attr('x', d => x(d.value) + 5)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .text(d => `${(d.value * 100).toFixed(1)}%`);

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${(d as number * 100).toFixed(0)}%`));
  };

  // Create timeline chart
  const createTimelineChart = (container: SVGSVGElement | null) => {
    if (!container) return;

    // Clear previous chart
    d3.select(container).selectAll('*').remove();

    const data = getTimelineData();
    const margin = { top: 30, right: 80, bottom: 30, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select(container)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // Lines
    const line = d3.line<any>()
      .x(d => x(d.date))
      .y(d => y(d.openness))
      .curve(d3.curveMonotoneX);

    const line2 = d3.line<any>()
      .x(d => x(d.date))
      .y(d => y(d.conscientiousness))
      .curve(d3.curveMonotoneX);

    const line3 = d3.line<any>()
      .x(d => x(d.date))
      .y(d => y(d.extraversion))
      .curve(d3.curveMonotoneX);

    // Add lines
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#8884d8')
      .attr('stroke-width', 2)
      .attr('d', line);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#82ca9d')
      .attr('stroke-width', 2)
      .attr('d', line2);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#ffc658')
      .attr('stroke-width', 2)
      .attr('d', line3);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5));

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${(d as number * 100).toFixed(0)}%`));

    // Legend
    const legend = g.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'start')
      .selectAll('g')
      .data([
        { name: 'Openness', color: '#8884d8' },
        { name: 'Conscientiousness', color: '#82ca9d' },
        { name: 'Extraversion', color: '#ffc658' }
      ])
      .enter().append('g')
      .attr('transform', (_, i) => `translate(${width - 100},${i * 20})`);

    legend.append('rect')
      .attr('x', 0)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => d.color);

    legend.append('text')
      .attr('x', 16)
      .attr('y', 6)
      .attr('dy', '0.35em')
      .text(d => d.name);
  };

  // Handle trait slider change
  const handleTraitChange = (trait: keyof PersonalityTraits, value: number) => {
    setEditablePersonality(prev => ({
      ...prev,
      [trait]: value / 100
    }));
  };

  // Initialize charts
  useEffect(() => {
    const bigFiveData = getTraitData().filter(d => d.category === 'bigFive');
    const gamingData = getTraitData().filter(d => d.category === 'gaming');

    createBarChart(bigFiveChartRef.current, bigFiveData, 'Big Five Traits');
    createBarChart(gamingTraitsChartRef.current, gamingData, 'Gaming-Specific Traits');
    createTimelineChart(timelineChartRef.current);
  }, [editablePersonality]);

  return (
    <Box>
      {/* Loading State */}
      {personalityLoading && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Loading Personality Data...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fetching real-time personality updates from MindServer
          </Typography>
        </Paper>
      )}
      
      {/* Error State */}
      {personalityError && !personalityLoading && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Personality Data Error
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {personalityError}
          </Typography>
        </Paper>
      )}
      
      {/* Normal State */}
      {!personalityLoading && !personalityError && (
        <>
          <Typography variant="h4" gutterBottom>
            Personality Profile - {agent.name}
          </Typography>
          
          <Grid container spacing={3}>
        {/* Big Five Traits Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <svg ref={bigFiveChartRef} width="100%" height="250" />
          </Paper>
        </Grid>

        {/* Gaming Traits Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <svg ref={gamingTraitsChartRef} width="100%" height="250" />
          </Paper>
        </Grid>

        {/* Trait Evolution Timeline */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Trait Evolution Timeline
            </Typography>
            <svg ref={timelineChartRef} width="100%" height="200" />
            <Typography variant="caption" color="text.secondary">
              Showing last 20 days of personality trait changes
            </Typography>
          </Paper>
        </Grid>

        {/* Personality Influences */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Current Behavioral Influences
            </Typography>
            {getPersonalityInfluences().length > 0 ? (
              <Box>
                {getPersonalityInfluences().map((influence, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>
                        {influence.trait}:
                      </Typography>
                      <Chip
                        label={influence.impact}
                        size="small"
                        color={influence.impact === 'positive' ? 'success' : influence.impact === 'negative' ? 'error' : 'default'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {influence.influence}
                    </Typography>
                    {index < getPersonalityInfluences().length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="info">
                No significant behavioral influences detected. Personality traits are within balanced ranges.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Personality Editor */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Personality Editor
              </Typography>
              <Chip
                label={isEditing ? 'Editing' : 'View Only'}
                color={isEditing ? 'warning' : 'default'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Adjust personality traits to see behavioral impact preview
              </Typography>
              <Chip
                label={isEditing ? 'Cancel' : 'Edit'}
                onClick={() => setIsEditing(!isEditing)}
                color={isEditing ? 'error' : 'primary'}
                size="small"
                clickable
              />
            </Box>

            {getTraitData().map((trait) => (
              <Box key={trait.name} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">{trait.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(editablePersonality[trait.name.toLowerCase() as keyof PersonalityTraits] * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <Tooltip title={trait.description} arrow>
                  <Slider
                    value={editablePersonality[trait.name.toLowerCase() as keyof PersonalityTraits] * 100}
                    onChange={(_, value) => isEditing && handleTraitChange(trait.name.toLowerCase() as keyof PersonalityTraits, value as number)}
                    disabled={!isEditing}
                    min={0}
                    max={100}
                    step={1}
                    sx={{ mb: 1 }}
                  />
                </Tooltip>
              </Box>
            ))}

            {isEditing && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Changes are temporary and for preview only. Reset to original values when done.
              </Alert>
            )}
          </Paper>
        </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default PersonalityTab;