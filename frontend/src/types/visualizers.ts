/**
 * Visualizer Types and Interfaces
 * 
 * Comprehensive type definitions for all D3.js visualization components
 * used in the Mindcraft LangGraph frontend dashboard.
 */

// Base visualizer props interface
export interface BaseVisualizerProps {
  data: any;
  width?: number;
  height?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  theme?: 'light' | 'dark';
  interactive?: boolean;
  animated?: boolean;
  className?: string;
  onDataPointClick?: (data: any) => void;
  onDataPointHover?: (data: any) => void;
  onZoom?: (domain: [number, number]) => void;
  onBrush?: (selection: any) => void;
}

// Visualization variants
export type VisualizerVariant = 
  | 'personality-radar'
  | 'personality-network'
  | 'memory-graph'
  | 'memory-timeline'
  | 'social-network'
  | 'social-relationship-map'
  | 'skill-progression'
  | 'skill-synergy'
  | 'performance-timeline'
  | 'performance-metrics'
  | 'agent-environment'
  | 'goal-hierarchy'
  | 'cognitive-load';

// Node and link interfaces for network graphs
export interface NetworkNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  radius?: number;
  color?: string;
  group?: string;
  data?: any;
  strength?: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  value?: number;
  strength?: number;
  color?: string;
  width?: number;
  data?: any;
}

// Data point interfaces for charts
export interface DataPoint {
  x: number;
  y: number;
  value?: number;
  label?: string;
  category?: string;
  timestamp?: number;
  color?: string;
  size?: number;
}

export interface TimeSeriesData {
  timestamp: number;
  value: number;
  label?: string;
  category?: string;
  metadata?: any;
}

export interface HierarchicalData {
  name: string;
  value?: number;
  children?: HierarchicalData[];
  color?: string;
  metadata?: any;
}

// Personality visualization interfaces
export interface PersonalityData {
  traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    riskTolerance: number;
    creativity: number;
    patience: number;
    competitiveness: number;
    curiosity: number;
  };
  motivations: {
    [key: string]: number;
  };
  values: {
    [key: string]: number;
  };
}

// Memory visualization interfaces
export interface MemoryNode extends NetworkNode {
  type: 'semantic' | 'episodic' | 'procedural' | 'working';
  strength?: number;
  lastAccessed?: number;
  accessCount?: number;
  connections?: number;
}

export interface MemoryLink extends NetworkLink {
  type: 'association' | 'temporal' | 'causal' | 'hierarchical';
  strength?: number;
}

// Social visualization interfaces
export interface SocialNode extends NetworkNode {
  type: 'agent' | 'relationship' | 'interaction';
  relationship?: {
    trust: number;
    friendship: number;
    reputation: number;
  };
  interactions?: number;
}

export interface SocialLink extends NetworkLink {
  type: 'relationship' | 'communication' | 'collaboration';
  strength?: number;
  direction?: 'bidirectional' | 'source-to-target' | 'target-to-source';
}

// Skill visualization interfaces
export interface SkillData {
  id: string;
  name: string;
  category: string;
  proficiency: {
    overall: number;
    knowledge: number;
    practical: number;
    creative: number;
  };
  experience: number;
  level: number;
  milestones: string[];
  synergies: string[];
  trend?: {
    direction: 'up' | 'down' | 'stable';
    rate: number;
  };
}

// Performance visualization interfaces
export interface PerformanceMetrics {
  timestamp: number;
  cognitiveLoad: number;
  responseTime: number;
  successRate: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  goalsCompleted: number;
  skillsImproved: number;
}

export interface PerformanceAlert {
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  threshold?: number;
  actual?: number;
}

// Environment visualization interfaces
export interface EnvironmentNode {
  id: string;
  type: 'block' | 'entity' | 'item' | 'structure';
  position: {
    x: number;
    y: number;
    z: number;
  };
  properties?: any;
}

export interface EnvironmentEdge {
  source: string;
  target: string;
  type: 'spatial' | 'functional' | 'temporal';
  distance?: number;
  direction?: string;
}

// Color schemes and themes
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  grid: string;
  highlight: string;
  warning: string;
  error: string;
  success: string;
}

export interface VisualizationTheme {
  light: ColorScheme;
  dark: ColorScheme;
}

// Animation and transition interfaces
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  type?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface TransitionConfig {
  enter: AnimationConfig;
  exit: AnimationConfig;
  update: AnimationConfig;
}

// Interaction and event interfaces
export interface InteractionEvent {
  type: 'click' | 'hover' | 'brush' | 'zoom' | 'select';
  target: any;
  data?: any;
  coordinates?: {
    x: number;
    y: number;
  };
  timestamp: number;
}

export interface TooltipConfig {
  enabled: boolean;
  format?: (data: any) => string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: {
    x: number;
    y: number;
  };
  style?: React.CSSProperties;
}

// Layout and sizing interfaces
export interface LayoutConfig {
  type: 'force' | 'circular' | 'tree' | 'radial' | 'hierarchical';
  padding?: number;
  nodeSpacing?: number;
  linkDistance?: number;
  chargeStrength?: number;
  centerForce?: number;
  collideStrength?: number;
}

export interface SizingConfig {
  responsive: boolean;
  aspectRatio?: number;
  minSize?: {
    width: number;
    height: number;
  };
  maxSize?: {
    width: number;
    height: number;
  };
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

// Export and data interfaces
export interface ExportConfig {
  format: 'png' | 'svg' | 'pdf' | 'json';
  quality?: number;
  backgroundColor?: string;
  scale?: number;
}

export interface DataFilter {
  enabled: boolean;
  criteria?: any;
  timeRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  threshold?: {
    min?: number;
    max?: number;
  };
}

// Visualizer state management
export interface VisualizerState {
  data: any;
  loading: boolean;
  error?: Error | string;
  selectedData?: any;
  hoveredData?: any;
  zoom?: {
    domain: [number, number];
    scale: number;
  };
  filters?: DataFilter;
  theme: 'light' | 'dark';
  animation?: boolean;
}

// Visualizer action types for Redux
export interface VisualizerLoadDataAction {
  type: 'visualizer/loadData';
  payload: {
    visualizerId: string;
    data: any;
  };
}

export interface VisualizerUpdateDataAction {
  type: 'visualizer/updateData';
  payload: {
    visualizerId: string;
    data: any;
  };
}

export interface VisualizerSetThemeAction {
  type: 'visualizer/setTheme';
  payload: {
    visualizerId: string;
    theme: 'light' | 'dark';
  };
}

export interface VisualizerSetAnimationAction {
  type: 'visualizer/setAnimation';
  payload: {
    visualizerId: string;
    enabled: boolean;
  };
}

export interface VisualizerSetFilterAction {
  type: 'visualizer/setFilter';
  payload: {
    visualizerId: string;
    filter: DataFilter;
  };
}

export interface VisualizerClearDataAction {
  type: 'visualizer/clearData';
  payload: {
    visualizerId: string;
  };
}

// Utility functions and configurations
export interface VisualizerUtils {
  generateId: () => string;
  validateData: (data: any) => boolean;
  sanitizeData: (data: any) => any;
  calculateBounds: (data: any[]) => { min: number; max: number };
  generateColorScale: (domain: [number, number], scheme: string) => (value: number) => string;
  generateSizeScale: (domain: [number, number], range: [number, number]) => (value: number) => number;
  formatTooltip: (data: any, format: string) => string;
  debounce: (func: Function, delay: number) => Function;
  throttle: (func: Function, limit: number) => Function;
}

// Default configurations
export interface DefaultVisualizerConfigs {
  colors: {
    personality: ColorScheme;
    memory: ColorScheme;
    social: ColorScheme;
    skills: ColorScheme;
    performance: ColorScheme;
    environment: ColorScheme;
  };
  animations: AnimationConfig;
  layout: LayoutConfig;
  sizing: SizingConfig;
  tooltip: TooltipConfig;
  export: ExportConfig;
}