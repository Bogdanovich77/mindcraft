/**
 * Dashboard Components Index
 * 
 * Exports all dashboard components for easy importing and usage.
 * This file provides a centralized export point for all dashboard-related
 * components including visualizations, metrics displays, and interactive elements.
 */

// Main dashboard components
export { default as AgentOverviewDashboard } from './AgentOverviewDashboard';
export { default as CognitiveLoadGauge } from './CognitiveLoadGauge';
export { default as AgentStatusIndicator } from './AgentStatusIndicator';
export { default as PerformanceMetrics } from './PerformanceMetrics';
export { default as AgentPositionMap } from './AgentPositionMap';

// Re-export types for convenience
export type {
  AgentRealTimeMetrics,
  PerformanceData,
  AgentPositionData,
  DashboardUISettings,
  CognitiveLoadGaugeProps,
  AgentStatusIndicatorProps,
  PerformanceMetricsProps,
  AgentPositionMapProps,
  AgentOverviewDashboardProps,
  DashboardState,
  DashboardAction,
  ChartDataPoint,
  MetricChartData,
  GaugeAnimationConfig,
  ChartTransitionConfig,
  DashboardError,
  DashboardLoadingState,
  DashboardEventHandlers,
  DashboardPerformanceConfig,
  DashboardAccessibilityProps,
  DashboardSize,
  DashboardTheme,
  TimeRange,
  ChartType,
  MapStyle,
  GaugeStyle,
} from '../../types/dashboard';

// Component constants and utilities
export const DASHBOARD_COMPONENTS = {
  AGENT_OVERVIEW: 'AgentOverviewDashboard',
  COGNITIVE_LOAD_GAUGE: 'CognitiveLoadGauge',
  AGENT_STATUS_INDICATOR: 'AgentStatusIndicator',
  PERFORMANCE_METRICS: 'PerformanceMetrics',
  AGENT_POSITION_MAP: 'AgentPositionMap',
} as const;

// Default configurations
export const DEFAULT_DASHBOARD_SETTINGS = {
  layout: 'grid' as const,
  refreshRate: 5000,
  animations: true,
  soundEnabled: false,
  theme: 'auto' as const,
  notifications: {
    enabled: true,
    threshold: {
      cognitiveLoad: 0.8,
      responseTime: 1000,
      successRate: 0.9,
    },
  },
  visualization: {
    gaugeStyle: 'radial' as const,
    chartType: 'line' as const,
    mapStyle: '2d' as const,
  },
};

// Performance optimization constants
export const DASHBOARD_PERFORMANCE_CONFIG = {
  updateThrottle: 100,
  maxDataPoints: 100,
  enableVirtualization: true,
  enableCompression: false,
  cacheSize: 50,
} as const;

// Accessibility defaults
export const DEFAULT_ACCESSIBILITY_PROPS = {
  ariaLabel: 'Agent Dashboard',
  role: 'main',
  tabIndex: 0,
  keyboardNavigation: true,
  screenReaderEnabled: true,
} as const;