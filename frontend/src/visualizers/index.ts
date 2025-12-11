/**
 * Visualizer Components Index
 * 
 * Exports all D3.js visualization components with their configurations and metadata.
 * This file provides a centralized export point for all visualization-related
 * components including personality graphs, memory networks, and performance charts.
 */

// Main visualizer components
export { default as PersonalityRadar } from './PersonalityRadar';
export { default as PersonalityNetwork } from './PersonalityNetwork';
export { default as MemoryGraph } from './MemoryGraph';
export { default as MemoryTimeline } from './MemoryTimeline';
export { default as SocialNetwork } from './SocialNetwork';
export { default as SocialRelationshipMap } from './SocialRelationshipMap';
export { default as SkillProgression } from './SkillProgression';
export { default as SkillSynergy } from './SkillSynergy';
export { default as PerformanceTimeline } from './PerformanceTimeline';
export { default as PerformanceMetrics } from './PerformanceMetrics';
export { default as AgentEnvironment } from './AgentEnvironment';
export { default as GoalHierarchy } from './GoalHierarchy';
export { default as CognitiveLoad } from './CognitiveLoad';

// Re-export types for convenience
export type {
  BaseVisualizerProps,
  VisualizerVariant,
  NetworkNode,
  NetworkLink,
  DataPoint,
  TimeSeriesData,
  HierarchicalData,
  PersonalityData,
  MemoryNode,
  MemoryLink,
  SocialNode,
  SocialLink,
  SkillData,
  PerformanceMetrics,
  PerformanceAlert,
  EnvironmentNode,
  EnvironmentEdge,
  ColorScheme,
  VisualizationTheme,
  AnimationConfig,
  TransitionConfig,
  InteractionEvent,
  TooltipConfig,
  LayoutConfig,
  SizingConfig,
  ExportConfig,
  DataFilter,
  VisualizerState,
  VisualizerUtils,
  DefaultVisualizerConfigs
} from '../types/visualizers';

// Component constants and utilities
export const VISUALIZER_COMPONENTS = {
  PERSONALITY_RADAR: 'PersonalityRadar',
  PERSONALITY_NETWORK: 'PersonalityNetwork',
  MEMORY_GRAPH: 'MemoryGraph',
  MEMORY_TIMELINE: 'MemoryTimeline',
  SOCIAL_NETWORK: 'SocialNetwork',
  SOCIAL_RELATIONSHIP_MAP: 'SocialRelationshipMap',
  SKILL_PROGRESSION: 'SkillProgression',
  SKILL_SYNERGY: 'SkillSynergy',
  PERFORMANCE_TIMELINE: 'PerformanceTimeline',
  PERFORMANCE_METRICS: 'PerformanceMetrics',
  AGENT_ENVIRONMENT: 'AgentEnvironment',
  GOAL_HIERARCHY: 'GoalHierarchy',
  COGNITIVE_LOAD: 'CognitiveLoad',
} as const;

// Default visualizer configurations
export const DEFAULT_VISUALIZER_SETTINGS = {
  dimensions: {
    width: 800,
    height: 600,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    padding: 10,
  },
  colors: {
    primary: '#1976d2',
    secondary: '#dc3545',
    accent: '#ffc107',
    background: '#ffffff',
    text: '#333333',
    grid: '#e0e0e0',
    highlight: '#fff3cd',
    warning: '#f44336',
    error: '#d32f2f',
    success: '#4caf50',
    info: '#2196f3',
  },
  interactions: {
    enabled: true,
    hoverDelay: 100,
    clickDelay: 50,
    tooltipEnabled: true,
    zoomEnabled: true,
    brushEnabled: true,
  },
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
    stagger: 50,
  },
  data: {
    refreshInterval: 5000,
    maxDataPoints: 1000,
    bufferSize: 100,
    aggregationEnabled: true,
  },
  export: {
    format: 'png',
    quality: 0.9,
    backgroundColor: '#ffffff',
    scale: 2,
  },
} as const;

// Visualizer size presets
export const VISUALIZER_SIZES = {
  SMALL: { width: 400, height: 300 },
  MEDIUM: { width: 600, height: 400 },
  LARGE: { width: 800, height: 600 },
  FULLSCREEN: { width: '100%', height: '100vh' },
} as const;

// Visualizer animation presets
export const VISUALIZER_ANIMATIONS = {
  FADE: { duration: 300, easing: 'ease-in-out' },
  SLIDE: { duration: 400, easing: 'ease-out' },
  ZOOM: { duration: 250, easing: 'ease-in-out' },
  ELASTIC: { duration: 600, easing: 'elastic-out' },
  BOUNCE: { duration: 800, easing: 'bounce-out' },
} as const;

// Visualizer layout presets
export const VISUALIZER_LAYOUTS = {
  FORCE_DIRECTED: { type: 'force', directed: true },
  FORCE_UNDIRECTED: { type: 'force', directed: false },
  CIRCULAR: { type: 'circular' },
  TREE: { type: 'tree' },
  RADIAL: { type: 'radial' },
  HIERARCHICAL: { type: 'hierarchical' },
} as const;

// Visualizer utility functions
export const VISUALIZER_UTILS = {
  generateId: () => `viz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  validateData: (data: any) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return { isValid: false, errors: ['Data is required and cannot be empty'] };
    }
    return { isValid: true, errors: [] };
  },
  calculateBounds: (data: any[]) => {
    if (!data || data.length === 0) {
      return { min: 0, max: 0 };
    }
    
    const values = data.map(d => typeof d === 'number' ? d : d.value || 0).filter(v => !isNaN(v));
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  },
  generateColorScale: (domain: [number, number], scheme: string) => {
    // Simple color scale generation
    const colors = scheme === 'dark' 
      ? ['#2196f3', '#1976d2', '#dc3545', '#ffc107', '#4caf50']
      : ['#1976d2', '#dc3545', '#ffc107', '#4caf50', '#2196f3'];
    
    return (value: number, index: number) => {
      const colorIndex = Math.floor((index / domain.length) * colors.length);
      return colors[Math.min(colorIndex, colors.length - 1)];
    };
  },
  formatTooltip: (data: any, format: string) => {
    if (format === 'percentage') {
      return `${(data.value * 100).toFixed(1)}%`;
    }
    if (format === 'currency') {
      return `$${data.value.toFixed(2)}`;
    }
    return `${data.label || data.name}: ${data.value}`;
  },
  debounce: (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },
  throttle: (func: Function, limit: number) => {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        func(...args);
      }
    };
  },
} as const;

// Visualizer event handlers
export const VISUALIZER_EVENTS = {
  onDataPointClick: (visualizerId: string, dataPoint: any) => {
    console.log(`Data point clicked in ${visualizerId}:`, dataPoint);
  },
  onDataPointHover: (visualizerId: string, dataPoint: any) => {
    console.log(`Data point hovered in ${visualizerId}:`, dataPoint);
  },
  onZoom: (visualizerId: string, domain: [number, number]) => {
    console.log(`Zoom changed in ${visualizerId}:`, domain);
  },
  onBrush: (visualizerId: string, selection: any) => {
    console.log(`Brush selection in ${visualizerId}:`, selection);
  },
  onFilter: (visualizerId: string, filter: any) => {
    console.log(`Filter applied in ${visualizerId}:`, filter);
  },
  onExport: (visualizerId: string, config: any) => {
    console.log(`Export triggered in ${visualizerId}:`, config);
  },
  onError: (visualizerId: string, error: Error) => {
    console.error(`Error in ${visualizerId}:`, error);
  },
} as const;

// Visualizer theme integration
export const VISUALIZER_THEMES = {
  light: {
    background: '#ffffff',
    foreground: '#333333',
    grid: '#e0e0e0',
    primary: '#1976d2',
    secondary: '#dc3545',
    accent: '#ffc107',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
  },
  dark: {
    background: '#121212',
    foreground: '#ffffff',
    grid: '#2d2d2d',
    primary: '#90caf9',
    secondary: '#3f51b5',
    accent: '#ff9800',
    success: '#8bc34a',
    warning: '#ff5722',
    error: '#f44336',
    info: '#03a9f4',
  },
} as const;