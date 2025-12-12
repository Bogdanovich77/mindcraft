/**
 * Dashboard Types for Agent Overview Dashboard
 * 
 * This file contains TypeScript interfaces for the sophisticated agent overview
 * dashboard with real-time cognitive state visualization, performance metrics,
 * and agent status monitoring.
 */

import type { AgentState } from './agent';

/**
 * Real-time agent metrics for dashboard visualization
 */
export interface AgentRealTimeMetrics {
  agentId: string;
  timestamp: number;
  cognitiveLoad: {
    current: number; // 0-1 scale
    trend: 'increasing' | 'decreasing' | 'stable';
    threshold: number; // Alert threshold
    history: number[]; // Last 10 values for trend visualization
  };
  performance: {
    responseTime: number; // milliseconds
    successRate: number; // 0-1 scale
    memoryUsage: number; // MB
    cpuUsage: number; // percentage
  };
  activity: {
    currentAction: string;
    actionDuration: number; // milliseconds
    actionProgress: number; // 0-1 scale
    goalProgress: number; // 0-1 scale
  };
  health: {
    healthStatus: 'critical' | 'warning' | 'normal' | 'optimal';
    healthScore: number; // 0-100
    energyLevel: number; // 0-1 scale
    resourceLevel: number; // 0-1 scale
  };
}

/**
 * Performance data for charts and analytics
 */
export interface PerformanceData {
  agentId: string;
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  metrics: {
    responseTime: {
      timestamps: number[];
      values: number[];
      average: number;
      min: number;
      max: number;
    };
    cognitiveLoad: {
      timestamps: number[];
      values: number[];
      average: number;
      peaks: number[];
    };
    successRate: {
      timestamps: number[];
      values: number[];
      average: number;
      trend: 'improving' | 'declining' | 'stable';
    };
    memoryUsage: {
      timestamps: number[];
      values: number[];
      average: number;
      peak: number;
    };
    cpuUsage: {
      timestamps: number[];
      values: number[];
      average: number;
      peak: number;
    };
  };
}

/**
 * Agent position data for 3D visualization
 */
export interface AgentPositionData {
  agentId: string;
  currentPosition: {
    x: number;
    y: number;
    z: number;
    dimension: string;
  };
  positionHistory: {
    timestamp: number;
    x: number;
    y: number;
    z: number;
    dimension: string;
  }[];
  movement: {
    speed: number; // blocks per second
    direction: number; // degrees
    distance: number; // blocks traveled in time range
  };
  nearbyEntities: {
    type: string;
    name: string;
    position: { x: number; y: number; z: number };
    distance: number;
    hostility: 'friendly' | 'neutral' | 'hostile';
  }[];
}

/**
 * Dashboard UI settings and preferences
 */
export interface DashboardUISettings {
  layout: 'grid' | 'list' | 'compact';
  refreshRate: number; // milliseconds
  animations: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    enabled: boolean;
    threshold: {
      cognitiveLoad: number;
      responseTime: number;
      successRate: number;
    };
  };
  visualization: {
    gaugeStyle: 'radial' | 'linear' | 'arc';
    chartType: 'line' | 'area' | 'bar';
    mapStyle: '2d' | '3d' | 'hybrid';
  };
}

/**
 * Dashboard component props interfaces
 */
export interface CognitiveLoadGaugeProps {
  value: number;
  threshold: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  size: 'small' | 'medium' | 'large';
  animated: boolean;
  showThreshold: boolean;
  showTrend: boolean;
  className?: string;
}

export interface AgentStatusIndicatorProps {
  agent: AgentState;
  metrics: AgentRealTimeMetrics;
  selected: boolean;
  onSelect: (agentId: string) => void;
  compact: boolean;
  showDetails: boolean;
  className?: string;
}

export interface PerformanceMetricsProps {
  agentId: string;
  data: PerformanceData;
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  chartType: 'line' | 'area' | 'bar';
  onTimeRangeChange: (range: string) => void;
  onChartTypeChange: (type: 'line' | 'area' | 'bar') => void;
  onRefresh: () => void;
  loading: boolean;
  showCharts: boolean;
  compact: boolean;
  className?: string;
}

export interface AgentPositionMapProps {
  agentId: string;
  positionData: AgentPositionData;
  showHistory: boolean;
  showEntities: boolean;
  mapStyle: '2d' | '3d' | 'hybrid';
  onCenterOnAgent: () => void;
  className?: string;
}

export interface AgentOverviewDashboardProps {
  agent?: AgentState;
  performanceData?: PerformanceData;
  positionData?: AgentPositionData;
  settings: DashboardUISettings;
  onAgentSelect?: (agentId: string) => void;
  className?: string;
}

/**
 * Dashboard state interfaces
 */
export interface DashboardState {
  selectedAgentId: string | null;
  metrics: Record<string, AgentRealTimeMetrics>;
  performanceData: Record<string, PerformanceData>;
  positionData: Record<string, AgentPositionData>;
  settings: DashboardUISettings;
  loading: boolean;
  error: string | null;
  lastUpdate: number;
}

/**
 * Dashboard action types
 */
export type DashboardAction =
  | { type: 'dashboard/selectAgent'; payload: string }
  | { type: 'dashboard/updateMetrics'; payload: AgentRealTimeMetrics }
  | { type: 'dashboard/updatePerformanceData'; payload: PerformanceData }
  | { type: 'dashboard/updatePositionData'; payload: AgentPositionData }
  | { type: 'dashboard/updateSettings'; payload: Partial<DashboardUISettings> }
  | { type: 'dashboard/setLoading'; payload: boolean }
  | { type: 'dashboard/setError'; payload: string | null }
  | { type: 'dashboard/clearData' };

/**
 * Chart data interfaces for Recharts
 */
export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface MetricChartData {
  data: ChartDataPoint[];
  color: string;
  name: string;
  unit: string;
}

/**
 * Animation and transition interfaces
 */
export interface GaugeAnimationConfig {
  duration: number;
  easing: string;
  delay: number;
}

export interface ChartTransitionConfig {
  type: 'fade' | 'slide' | 'zoom';
  duration: number;
  easing: string;
}

/**
 * Error and loading state interfaces
 */
export interface DashboardError {
  code: string;
  message: string;
  timestamp: number;
  retryable: boolean;
}

export interface DashboardLoadingState {
  loading: boolean;
  message: string;
  progress: number;
}

/**
 * Event handler interfaces
 */
export interface DashboardEventHandlers {
  onAgentSelect: (agentId: string) => void;
  onSettingsChange: (settings: Partial<DashboardUISettings>) => void;
  onRefresh: () => void;
  onError: (error: DashboardError) => void;
  onExport: (format: 'json' | 'csv' | 'pdf') => void;
}

/**
 * Utility types for dashboard components
 */
export type DashboardSize = 'small' | 'medium' | 'large';
export type DashboardTheme = 'light' | 'dark' | 'auto';
export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';
export type ChartType = 'line' | 'area' | 'bar';
export type MapStyle = '2d' | '3d' | 'hybrid';
export type GaugeStyle = 'radial' | 'linear' | 'arc';

/**
 * Performance optimization interfaces
 */
export interface DashboardPerformanceConfig {
  updateThrottle: number; // milliseconds
  maxDataPoints: number;
  enableVirtualization: boolean;
  enableCompression: boolean;
  cacheSize: number;
}

/**
 * Accessibility interfaces
 */
export interface DashboardAccessibilityProps {
  ariaLabel: string;
  ariaDescribedBy?: string;
  role: string;
  tabIndex: number;
  keyboardNavigation: boolean;
  screenReaderEnabled: boolean;
}

/**
 * Additional interfaces for test compatibility
 */

// Agent metrics summary interface
export interface AgentMetrics {
  agentId: string;
  cognitiveLoad: {
    current: number;
    average: number;
    peak: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    timestamp: Date;
  };
  performance: {
    timestamp: Date;
    responseTime: number;
    actionsPerMinute: number;
    successRate: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  position: {
    x: number;
    y: number;
    z: number;
    dimension?: string;
    timestamp: Date;
  };
  status: 'online' | 'offline' | 'idle' | 'busy';
  lastUpdate: Date;
}

// Position data interface
export interface PositionData {
  x: number;
  y: number;
  z: number;
  dimension?: string;
  timestamp: Date;
}

// Dashboard settings interface (simplified)
export interface DashboardSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  showOfflineAgents: boolean;
  compactView: boolean;
  animationsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
}

// Additional interfaces for test compatibility

// Cognitive load data interface (for test compatibility)
export interface CognitiveLoadData {
  current: number;
  trend: number;
  history: Array<{
    timestamp: number;
    value: number;
  }>;
  thresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

// System metrics interface (for test compatibility)
export interface SystemMetrics {
  totalAgents: number;
  onlineAgents: number;
  averageResponseTime: number;
  averageCognitiveLoad: number;
  averageSuccessRate: number;
  systemUptime: number;
  memoryUsage: number;
  cpuUsage: number;
}

// Agent status type (for test compatibility)
export type AgentStatus = 'online' | 'offline' | 'idle' | 'active' | 'error';

// Activity level type (for test compatibility)
export type ActivityLevel = 'low' | 'medium' | 'high' | 'critical';

// Processing phase type (for test compatibility)
export type ProcessingPhase = 'perception' | 'analysis' | 'planning' | 'decision' | 'execution' | 'reflection';

// View mode type (for test compatibility)
export type ViewMode = 'grid' | 'list' | 'compact' | 'detailed';

/**
 * All dashboard types are already exported with their individual declarations above.
 * No additional export block needed to avoid conflicts.
 */