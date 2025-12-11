import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import * as d3 from 'd3';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAppSelector } from '../../store';
import { selectAgentById } from '../../store/slices/agentsSlice';
import {
  selectMemorySystem,
  selectLoading,
  selectError
} from '../../store/slices/memorySlice';
import type { AgentState, MemoryState } from '../../types/agent';

interface MemoryTabProps {
  agentId: string;
  agent?: AgentState;
  error?: string | null;
  isLoading?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Error boundary component for visualization errors
const VisualizationErrorBoundary: React.FC<{ children: React.ReactNode; title: string }> = ({
  children,
  title
}) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: Error) => {
      console.error(`Error in ${title} visualization:`, error);
      setHasError(true);
      setError(error);
    };

    // Error handling for D3 visualizations
    const handleErrorWrapper = (event: ErrorEvent) => {
      if (event.error) {
        handleError(event.error);
      }
    };

    window.addEventListener('error', handleErrorWrapper);

    return () => {
      window.removeEventListener('error', handleErrorWrapper);
    };
  }, [title]);

  if (hasError) {
    return (
      <Alert
        severity="error"
        icon={<ErrorIcon />}
        sx={{ m: 2 }}
      >
        <Typography variant="h6" gutterBottom>
          Visualization Error in {title}
        </Typography>
        <Typography variant="body2">
          {error?.message || 'An unknown error occurred while rendering the visualization.'}
        </Typography>
      </Alert>
    );
  }

  return <>{children}</>;
};

// Responsive tab panel component
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`memory-tabpanel-${index}`}
      aria-labelledby={`memory-tab-${index}`}
      style={{ height: '100%', overflow: 'auto' }}
    >
      {value === index && <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
};

interface SemanticNode {
  id: string;
  label: string;
  type: 'concept' | 'fact' | 'relationship';
  value: number;
  group: string;
}

interface SemanticLink {
  source: string;
  target: string;
  strength: number;
  type: string;
}

interface MemoryAnalytics {
  accessPatterns: { time: string; semantic: number; episodic: number; procedural: number; working: number }[];
  consolidationRates: { system: string; rate: number; efficiency: number }[];
  forgettingCurves: { days: number; retention: number; type: string }[];
  capacityUsage: { name: string; used: number; total: number; percentage: number }[];
}

const MemoryTab: React.FC<MemoryTabProps> = ({ agentId, agent, error, isLoading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get real agent data from Redux store
  const agentData = useAppSelector((state) => selectAgentById(state, agentId)) || agent;
  
  // Get memory data from Redux store for live streaming
  const memoryData = useAppSelector((state) => selectMemorySystem(state, agentId));
  const memoryLoading = useAppSelector((state) => selectLoading(state, agentId));
  const memoryError = useAppSelector((state) => selectError(state, agentId));
  
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [visualizationError, setVisualizationError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Get memory data from Redux store or use fallback structure
  const memory: MemoryState = useMemo(() => {
    // Use live streaming data from Redux if available
    if (memoryData) {
      return memoryData;
    }
    
    // Fallback to agent data if no Redux data
    if (agentData?.cognitive?.memory) {
      return agentData.cognitive.memory;
    }
    
    // Fallback empty structure if no data available
    return {
      semantic: {
        concepts: new Map(),
        facts: new Map(),
        relationships: new Map(),
      },
      episodic: {
        events: [],
        conversations: [],
        experiences: [],
      },
      procedural: {
        skills: new Map(),
        procedures: new Map(),
        habits: new Map(),
      },
      working: {
        currentFocus: 'idle',
        activeTasks: [],
        conversationContext: null,
        buffer: [],
      },
    };
  }, [memoryData, agentData]);

  // Handle loading and error states - prioritize Redux state
  if (memoryLoading || isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Loading Memory Data...</Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we fetch the memory systems data for {agentId}.
        </Typography>
      </Box>
    );
  }

  if (memoryError || error) {
    return (
      <Alert
        severity="error"
        icon={<ErrorIcon />}
        sx={{ m: 2 }}
      >
        <Typography variant="h6" gutterBottom>
          Memory Data Error
        </Typography>
        <Typography variant="body2">
          Failed to load memory data for agent {agentId}: {memoryError || error}
        </Typography>
      </Alert>
    );
  }

  if (!agentData) {
    return (
      <Alert
        severity="warning"
        icon={<WarningIcon />}
        sx={{ m: 2 }}
      >
        <Typography variant="h6" gutterBottom>
          No Agent Data Available
        </Typography>
        <Typography variant="body2">
          No agent data is available for {agentId}. Please check if the agent is properly connected.
        </Typography>
      </Alert>
    );
  }
  
  // Refs for D3 containers
  const architectureOverviewRef = useRef<SVGSVGElement>(null);
  const semanticMemoryRef = useRef<SVGSVGElement>(null);
  const episodicTimelineRef = useRef<SVGSVGElement>(null);
  const proceduralMemoryRef = useRef<SVGSVGElement>(null);
  const workingMemoryRef = useRef<SVGSVGElement>(null);

  // Process semantic memory data for visualization
  const semanticMemoryData = useMemo(() => {
    const nodes: SemanticNode[] = [];
    const links: SemanticLink[] = [];
    
    // Convert concepts to nodes
    memory.semantic.concepts.forEach((concept, id) => {
      nodes.push({
        id,
        label: (concept as any)?.name || id,
        type: 'concept',
        value: (concept as any)?.importance || 0.5,
        group: (concept as any)?.category || 'general',
      });
    });

    // Convert facts to nodes
    memory.semantic.facts.forEach((fact, id) => {
      nodes.push({
        id,
        label: ((fact as any)?.fact || '').substring(0, 30) + '...' || id,
        type: 'fact',
        value: (fact as any)?.confidence || 0.5,
        group: 'facts',
      });
    });

    // Convert relationships to links
    memory.semantic.relationships.forEach((rel: any) => {
      links.push({
        source: rel.from,
        target: rel.to,
        strength: rel.strength || 0.5,
        type: rel.type || 'related',
      });
    });

    // If no real data, provide fallback nodes
    if (nodes.length === 0) {
      nodes.push(
        { id: 'mining', label: 'Mining', type: 'concept', value: 0.9, group: 'skills' },
        { id: 'crafting', label: 'Crafting', type: 'concept', value: 0.85, group: 'skills' },
        { id: 'building', label: 'Building', type: 'concept', value: 0.75, group: 'skills' },
        { id: 'iron_ore', label: 'Iron Ore', type: 'fact', value: 0.8, group: 'resources' },
        { id: 'pickaxe', label: 'Pickaxe', type: 'fact', value: 0.9, group: 'tools' },
      );
      
      links.push(
        { source: 'mining', target: 'iron_ore', strength: 0.9, type: 'yields' },
        { source: 'mining', target: 'pickaxe', strength: 0.95, type: 'requires' },
        { source: 'crafting', target: 'pickaxe', strength: 0.8, type: 'creates' },
      );
    }

    return { nodes, links };
  }, [memory.semantic]);

  // Process episodic memory data
  const episodicMemoryData = useMemo(() => {
    const allEvents = [
      ...memory.episodic.events.map(event => ({
        ...event,
        category: 'event',
        color: '#2196F3',
      })),
      ...memory.episodic.conversations.map(conv => ({
        ...conv,
        category: 'conversation',
        color: '#4CAF50',
      })),
      ...memory.episodic.experiences.map(exp => ({
        ...exp,
        category: 'experience',
        color: '#FF9800',
      })),
    ];

    // If no real data, provide fallback events
    if (allEvents.length === 0) {
      const now = Date.now();
      for (let i = 0; i < 10; i++) {
        allEvents.push({
          id: `event_${i}`,
          timestamp: now - (i * 2 * 60 * 60 * 1000), // Every 2 hours
          type: ['combat', 'mining', 'building', 'exploration', 'social'][Math.floor(Math.random() * 5)],
          description: `Memory event ${i + 1}`,
          importance: Math.random(),
          accessibility: Math.max(0.1, 1 - (i * 0.02)),
          category: 'event',
          color: '#2196F3',
          context: {},
        });
      }
    }

    return allEvents.sort((a, b) => b.timestamp - a.timestamp);
  }, [memory.episodic]);

  // Process procedural memory data
  const proceduralMemoryData = useMemo(() => {
    const skills = Array.from(memory.procedural.skills.entries()).map(([id, skill]) => ({
      name: (skill as any)?.name || id,
      proficiency: (skill as any)?.proficiency || Math.random() * 0.5 + 0.5,
      usage: (skill as any)?.usage || Math.floor(Math.random() * 50) + 10,
      success: (skill as any)?.success || Math.random() * 0.4 + 0.6,
    }));

    // If no real data, provide fallback skills
    if (skills.length === 0) {
      skills.push(
        { name: 'Mining Pattern', proficiency: 0.9, usage: 45, success: 0.95 },
        { name: 'Building Shelter', proficiency: 0.85, usage: 30, success: 0.88 },
        { name: 'Combat Tactics', proficiency: 0.7, usage: 15, success: 0.75 },
        { name: 'Crafting Recipes', proficiency: 0.8, usage: 25, success: 0.82 },
        { name: 'Navigation', proficiency: 0.75, usage: 35, success: 0.80 },
        { name: 'Resource Management', proficiency: 0.88, usage: 40, success: 0.92 },
      );
    }

    return skills;
  }, [memory.procedural.skills]);

  // Calculate memory analytics
  const memoryAnalytics: MemoryAnalytics = useMemo(() => {
    const totalConcepts = memory.semantic.concepts.size;
    const totalFacts = memory.semantic.facts.size;
    const totalEvents = memory.episodic.events.length;
    const totalConversations = memory.episodic.conversations.length;
    const totalExperiences = memory.episodic.experiences.length;
    const totalSkills = memory.procedural.skills.size;
    const totalProcedures = memory.procedural.procedures.size;
    const totalHabits = memory.procedural.habits.size;
    const activeTasks = memory.working.activeTasks.length;

    // Calculate memory usage (mock calculation)
    const semanticUsage = Math.min((totalConcepts + totalFacts) / 100, 1);
    const episodicUsage = Math.min((totalEvents + totalConversations + totalExperiences) / 50, 1);
    const proceduralUsage = Math.min((totalSkills + totalProcedures + totalHabits) / 30, 1);
    const workingUsage = Math.min(activeTasks / 10, 1);

    // Generate access pattern data (mock)
    const accessPatterns = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      semantic: Math.random() * 100,
      episodic: Math.random() * 80,
      procedural: Math.random() * 60,
      working: Math.random() * 40,
    }));

    const consolidationRates = [
      { system: 'Semantic', rate: 0.85, efficiency: 0.92 },
      { system: 'Episodic', rate: 0.70, efficiency: 0.78 },
      { system: 'Procedural', rate: 0.90, efficiency: 0.95 },
      { system: 'Working', rate: 0.60, efficiency: 0.65 },
    ];

    const forgettingCurves = Array.from({ length: 30 }, (_, i) => ({
      days: i,
      retention: Math.exp(-i * 0.1) * 100,
      type: 'episodic',
    }));

    const capacityUsage = [
      { name: 'Semantic', used: Math.floor(semanticUsage * 1000), total: 1000, percentage: semanticUsage * 100 },
      { name: 'Episodic', used: Math.floor(episodicUsage * 800), total: 800, percentage: episodicUsage * 100 },
      { name: 'Procedural', used: Math.floor(proceduralUsage * 600), total: 600, percentage: proceduralUsage * 100 },
      { name: 'Working', used: activeTasks, total: 10, percentage: workingUsage * 100 },
    ];

    return {
      accessPatterns,
      consolidationRates,
      forgettingCurves,
      capacityUsage,
    };
  }, [memory]);

  // Create Memory Architecture Overview
  const createArchitectureOverview = (container: SVGSVGElement | null) => {
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const svg = d3.select(container)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = memoryAnalytics.capacityUsage;
    const innerRadius = Math.min(width, height) / 3;
    const outerRadius = Math.min(width, height) / 2.5;

    const arc = d3.arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const pie = d3.pie<any>()
      .value(d => d.percentage)
      .sort(null);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.name))
      .range(['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c']);

    // Draw arcs
    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.name))
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Add labels
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(d => `${d.data.name}\n${d.data.percentage.toFixed(1)}%`);

    // Center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Memory Usage');
  };

  // Create Semantic Memory Force-Directed Graph
  const createSemanticMemoryGraph = (container: SVGSVGElement | null) => {
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth;
    const height = 400;

    const svg = d3.select(container)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3.forceSimulation(semanticMemoryData.nodes as any)
      .force('link', d3.forceLink(semanticMemoryData.links)
        .id((d: any) => d.id)
        .strength(d => (d as SemanticLink).strength))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Color scale for node types
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['concept', 'fact', 'relationship'])
      .range(['#8884d8', '#82ca9d', '#ffc658']);

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(semanticMemoryData.links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', d => d.strength)
      .attr('stroke-width', d => Math.sqrt(d.strength * 5));

    // Draw nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(semanticMemoryData.nodes)
      .enter().append('circle')
      .attr('r', d => Math.sqrt(d.value) * 20)
      .attr('fill', d => colorScale(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, SemanticNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          (d as any).fx = (d as any).x;
          (d as any).fy = (d as any).y;
        })
        .on('drag', (event, d) => {
          (d as any).fx = event.x;
          (d as any).fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          (d as any).fx = null;
          (d as any).fy = null;
        }) as any);

    // Add labels
    const label = g.append('g')
      .selectAll('text')
      .data(semanticMemoryData.nodes)
      .enter().append('text')
      .text(d => d.label)
      .style('font-size', '12px')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none');

    // Update positions on tick
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
        .attr('y', (d: any) => d.y + 4);
    });

    // Add tooltips
    node.append('title')
      .text(d => `${d.label}\nType: ${d.type}\nValue: ${(d.value * 100).toFixed(1)}%`);
  };

  // Create Episodic Memory Timeline
  const createEpisodicTimeline = (container: SVGSVGElement | null) => {
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const data = episodicMemoryData;
    const margin = { top: 30, right: 30, bottom: 40, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(container)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.timestamp)) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(['combat', 'mining', 'building', 'exploration', 'social'])
      .range(['#ff4444', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c']);

    // Create circles for events
    g.selectAll('.event')
      .data(data)
      .enter().append('circle')
      .attr('class', 'event')
      .attr('cx', d => x(new Date(d.timestamp)))
      .attr('cy', d => y((d as any).importance || 0.5))
      .attr('r', d => Math.sqrt((d as any).accessibility || 0.5) * 10)
      .attr('fill', d => colorScale((d as any).type || 'event'))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .append('title')
      .text(d => `${((d as any).description || (d as any).message || 'Unknown event')}\nType: ${((d as any).type || d.category)}\nImportance: ${(((d as any).importance || 0.5) * 100).toFixed(1)}%`);

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5));

    // Y-axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${(d as number * 100).toFixed(0)}%`));

    // Title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Episodic Memory Timeline');
  };

  // Create Procedural Memory Visualization
  const createProceduralMemory = (container: SVGSVGElement | null) => {
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const data = proceduralMemoryData;
    const margin = { top: 30, right: 80, bottom: 40, left: 150 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

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

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.name) || 0)
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', d => x(d.proficiency))
      .attr('fill', d => colorScale(d.proficiency))
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
      .style('font-size', '11px')
      .text(d => d.name);

    // Values
    g.selectAll('.value')
      .data(data)
      .enter().append('text')
      .attr('class', 'value')
      .attr('y', d => (y(d.name) || 0) + y.bandwidth() / 2)
      .attr('x', d => x(d.proficiency) + 5)
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .text(d => `${(d.proficiency * 100).toFixed(1)}%`);

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${(d as number * 100).toFixed(0)}%`));
  };

  // Create Working Memory View
  const createWorkingMemory = (container: SVGSVGElement | null) => {
    if (!container) return;

    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth;
    const height = 200;

    const svg = d3.select(container)
      .attr('width', width)
      .attr('height', height);

    // Mock working memory data
    const data = [
      { task: 'Current Focus', value: memory.working.currentFocus || 'None', progress: 0.8 },
      { task: 'Active Tasks', value: memory.working.activeTasks?.length || 0, progress: 0.6 },
      { task: 'Buffer Usage', value: `${memory.working.buffer?.length || 0}/10`, progress: 0.4 },
    ];

    const g = svg.append('g');

    // Create cards for each working memory component
    const cardWidth = width / 3 - 20;
    const cardHeight = height - 40;

    data.forEach((d, i) => {
      const cardX = i * (cardWidth + 20) + 10;
      const cardY = 20;

      // Card background
      g.append('rect')
        .attr('x', cardX)
        .attr('y', cardY)
        .attr('width', cardWidth)
        .attr('height', cardHeight)
        .attr('fill', '#f5f5f5')
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1)
        .attr('rx', 8)
        .attr('ry', 8);

      // Progress bar
      g.append('rect')
        .attr('x', cardX + 10)
        .attr('y', cardY + 10)
        .attr('width', (cardWidth - 20) * d.progress)
        .attr('height', 4)
        .attr('fill', d.progress > 0.7 ? '#44ff44' : d.progress > 0.4 ? '#ffaa00' : '#ff4444')
        .attr('rx', 2)
        .attr('ry', 2);

      // Task label
      g.append('text')
        .attr('x', cardX + cardWidth / 2)
        .attr('y', cardY + 35)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(d.task);

      // Task value
      g.append('text')
        .attr('x', cardX + cardWidth / 2)
        .attr('y', cardY + 55)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#666')
        .text(String(d.value));
    });
  };

  // Initialize all visualizations
  useEffect(() => {
    createArchitectureOverview(architectureOverviewRef.current);
    createSemanticMemoryGraph(semanticMemoryRef.current);
    createEpisodicTimeline(episodicTimelineRef.current);
    createProceduralMemory(proceduralMemoryRef.current);
    createWorkingMemory(workingMemoryRef.current);
  }, [memory, semanticMemoryData, episodicMemoryData, proceduralMemoryData, agentData]);

  // Handle sub-tab change with error clearing
  const handleSubTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setActiveSubTab(newValue);
    setVisualizationError(null); // Clear errors when switching tabs
  }, []);

  // Error handler for visualizations

  // Show visualization error if any
  if (visualizationError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setVisualizationError(null)}
            >
              <RefreshIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <Typography variant="h6" gutterBottom>
            Visualization Error
          </Typography>
          <Typography variant="body2">
            {visualizationError}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: { xs: 1, sm: 2 },
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          gutterBottom={false}
          sx={{ flexGrow: 1 }}
        >
          Memory Systems
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Agent ID">
            <Chip
              label={agentId}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Tooltip>
          <IconButton onClick={() => window.location.reload()} title="Refresh Data">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 2 } }}>
        <Box sx={{
          display: 'flex',
          gap: { xs: 1, sm: 2 },
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <TextField
            size="small"
            placeholder="Search memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: { xs: 150, sm: 200 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 120 } }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterType}
              label="Filter"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="semantic">Semantic</MenuItem>
              <MenuItem value="episodic">Episodic</MenuItem>
              <MenuItem value="procedural">Procedural</MenuItem>
              <MenuItem value="working">Working</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.1))}
              title="Zoom In"
            >
              <ZoomInIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              title="Zoom Out"
            >
              <ZoomOutIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Sub-tabs */}
      <Paper sx={{ mb: { xs: 1, sm: 2 } }}>
        <Tabs
          value={activeSubTab}
          onChange={handleSubTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: isMobile ? 'auto' : 120,
              fontSize: isMobile ? '0.75rem' : '0.875rem'
            }
          }}
        >
          <Tab label="Architecture" />
          <Tab label="Semantic" />
          <Tab label="Episodic" />
          <Tab label="Procedural" />
          <Tab label="Working" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <TabPanel value={activeSubTab} index={0}>
          <VisualizationErrorBoundary title="Architecture Overview">
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Memory Architecture Overview
                  </Typography>
                  <svg
                    ref={architectureOverviewRef}
                    width="100%"
                    height={isMobile ? 200 : 300}
                  ></svg>
                  <Typography variant="caption" color="text.secondary">
                    Current memory usage across all four systems
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    System Capacity
                  </Typography>
                  {memoryAnalytics.capacityUsage.map((system) => (
                    <Box key={system.name} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{system.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {system.used}/{system.total}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={system.percentage}
                        color={system.percentage > 80 ? 'error' : system.percentage > 60 ? 'warning' : 'success'}
                      />
                    </Box>
                  ))}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Consolidation Efficiency
                  </Typography>
                  <ResponsiveContainer width="100%" height={isMobile ? 150 : 200}>
                    <BarChart data={memoryAnalytics.consolidationRates}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="system" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="rate" fill="#8884d8" name="Consolidation Rate" />
                      <Bar dataKey="efficiency" fill="#82ca9d" name="Efficiency" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </VisualizationErrorBoundary>
        </TabPanel>

        <TabPanel value={activeSubTab} index={1}>
          <VisualizationErrorBoundary title="Semantic Memory">
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Semantic Memory Network
                  </Typography>
                  <svg
                    ref={semanticMemoryRef}
                    width="100%"
                    height={isMobile ? 250 : 400}
                  ></svg>
                  <Typography variant="caption" color="text.secondary">
                    Interactive knowledge graph. Drag nodes to reorganize. Scroll to zoom.
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Concept Categories
                  </Typography>
                  <ResponsiveContainer width="100%" height={isMobile ? 150 : 200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Skills', value: 35, color: '#8884d8' },
                          { name: 'Resources', value: 25, color: '#82ca9d' },
                          { name: 'Tools', value: 20, color: '#ffc658' },
                          { name: 'Structures', value: 12, color: '#ff7c7c' },
                          { name: 'Entities', value: 8, color: '#8dd1e1' },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={isMobile ? 40 : 60}
                        dataKey="value"
                      >
                        {[
                          { name: 'Skills', value: 35, color: '#8884d8' },
                          { name: 'Resources', value: 25, color: '#82ca9d' },
                          { name: 'Tools', value: 20, color: '#ffc658' },
                          { name: 'Structures', value: 12, color: '#ff7c7c' },
                          { name: 'Entities', value: 8, color: '#8dd1e1' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Relationship Strength
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {semanticMemoryData.links.slice(0, 5).map((link, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ minWidth: { xs: 80, sm: 120 } }}>
                          {isMobile ? `${link.source}→${link.target}` : `${link.source} → ${link.target}`}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={link.strength * 100}
                          sx={{ flex: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {(link.strength * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </VisualizationErrorBoundary>
        </TabPanel>

        <TabPanel value={activeSubTab} index={2}>
          <VisualizationErrorBoundary title="Episodic Memory">
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Episodic Memory Timeline
                  </Typography>
                  <svg
                    ref={episodicTimelineRef}
                    width="100%"
                    height={isMobile ? 250 : 300}
                  ></svg>
                  <Typography variant="caption" color="text.secondary">
                    Events sorted by time and importance. Size indicates accessibility.
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Recent Events
                  </Typography>
                  <Box sx={{ maxHeight: { xs: 200, sm: 300 }, overflow: 'auto' }}>
                    {episodicMemoryData.slice(0, 10).map((event) => (
                      <Card key={event.id} sx={{ mb: 1 }}>
                        <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant={isMobile ? 'caption' : 'body2'}>{((event as any).description || (event as any).message || 'Unknown event')}</Typography>
                             <Chip
                               label={((event as any).type || event.category)}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(event.timestamp).toLocaleString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Forgetting Curve
                  </Typography>
                  <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                    <LineChart data={memoryAnalytics.forgettingCurves}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="days" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="retention" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </VisualizationErrorBoundary>
        </TabPanel>

        <TabPanel value={activeSubTab} index={3}>
          <VisualizationErrorBoundary title="Procedural Memory">
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Procedural Memory - Skills & Habits
                  </Typography>
                  <svg
                    ref={proceduralMemoryRef}
                    width="100%"
                    height={isMobile ? 200 : 250}
                  ></svg>
                  <Typography variant="caption" color="text.secondary">
                    Proficiency levels for learned procedures and habits
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Skill Usage Patterns
                  </Typography>
                  <ResponsiveContainer width="100%" height={isMobile ? 150 : 200}>
                    <AreaChart data={proceduralMemoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="usage" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="success" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {proceduralMemoryData.slice(0, 3).map((skill, index) => (
                      <Box key={index}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant={isMobile ? 'caption' : 'body2'}>{skill.name}</Typography>
                          <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                            {skill.success > 0.8 ? 'Excellent' : skill.success > 0.6 ? 'Good' : 'Needs Improvement'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={skill.success * 100}
                            sx={{ flex: 1 }}
                            color={skill.success > 0.8 ? 'success' : skill.success > 0.6 ? 'warning' : 'error'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {(skill.success * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </VisualizationErrorBoundary>
        </TabPanel>

        <TabPanel value={activeSubTab} index={4}>
          <VisualizationErrorBoundary title="Working Memory">
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Working Memory - Real-time Cognitive State
                  </Typography>
                  <svg
                    ref={workingMemoryRef}
                    width="100%"
                    height={isMobile ? 150 : 200}
                  ></svg>
                  <Typography variant="caption" color="text.secondary">
                    Current cognitive focus, active tasks, and buffer usage
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Active Tasks
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {memory.working.activeTasks?.slice(0, 5).map((task, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={`Task ${index + 1}`} size="small" color="primary" />
                        <Typography variant={isMobile ? 'caption' : 'body2'}>{task}</Typography>
                      </Box>
                    )) || (
                      <Alert severity="info">No active tasks</Alert>
                    )}
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Cognitive Load
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant={isMobile ? 'h4' : 'h3'} color="primary">
                      {(agentData?.cognitive?.processing?.cognitiveLoad ? (agentData.cognitive.processing.cognitiveLoad * 100).toFixed(0) : '0')}%
                    </Typography>
                    <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                      Current cognitive load
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={agentData?.cognitive?.processing?.cognitiveLoad ? agentData.cognitive.processing.cognitiveLoad * 100 : 0}
                      sx={{ mt: 2 }}
                      color={agentData?.cognitive?.processing?.cognitiveLoad && agentData.cognitive.processing.cognitiveLoad > 0.8 ? 'error' : 'primary'}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </VisualizationErrorBoundary>
        </TabPanel>

        <TabPanel value={activeSubTab} index={5}>
          <VisualizationErrorBoundary title="Analytics">
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Memory Access Patterns
                  </Typography>
                  <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                    <LineChart data={memoryAnalytics.accessPatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="semantic" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="episodic" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="procedural" stroke="#ffc658" strokeWidth={2} />
                      <Line type="monotone" dataKey="working" stroke="#ff7c7c" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    System Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height={isMobile ? 150 : 250}>
                    <BarChart data={memoryAnalytics.consolidationRates}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="system" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="rate" fill="#8884d8" name="Consolidation Rate" />
                      <Bar dataKey="efficiency" fill="#82ca9d" name="Efficiency" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                    Memory Statistics
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Memory Events
                      </Typography>
                      <Typography variant={isMobile ? 'h6' : 'h5'}>
                        {episodicMemoryData.length + semanticMemoryData.nodes.length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Average Accessibility
                      </Typography>
                      <Typography variant={isMobile ? 'h6' : 'h5'}>
                        {(episodicMemoryData.reduce((sum, event) => sum + ((event as any).accessibility || 0.5), 0) / episodicMemoryData.length * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Consolidation Efficiency
                      </Typography>
                      <Typography variant={isMobile ? 'h6' : 'h5'}>
                        {(memoryAnalytics.consolidationRates.reduce((sum, rate) => sum + rate.efficiency, 0) / memoryAnalytics.consolidationRates.length * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </VisualizationErrorBoundary>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default MemoryTab;