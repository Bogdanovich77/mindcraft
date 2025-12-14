/**
 * Tabs Components Index
 * 
 * Exports all tab components for easy importing and usage.
 * This file provides a centralized export point for all tab-related
 * components including overview, personality, memory, goals, social, skills, and performance tabs.
 */

// Main tab components
export { default as OverviewTab } from './OverviewTab';
export { default as PersonalityTab } from './PersonalityTab';
export { default as MemoryTab } from './MemoryTab';
export { default as GoalsTab } from './GoalsTab';
export { default as SocialTab } from './SocialTab';
export { default as SkillsTab } from './SkillsTab';
export { default as PerformanceTab } from './PerformanceTab';
export { default as SelfAwarenessTab } from './SelfAwarenessTab';
export { default as DriveTab } from './DriveTab';
export { default as ConversationLogTab } from './ConversationLogTab';
export { default as SimplifiedFlowTab } from './SimplifiedFlowTab';

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
export const TAB_COMPONENTS = {
  OVERVIEW: 'OverviewTab',
  PERSONALITY: 'PersonalityTab',
  MEMORY: 'MemoryTab',
  GOALS: 'GoalsTab',
  SOCIAL: 'SocialTab',
  SKILLS: 'SkillsTab',
  PERFORMANCE: 'PerformanceTab',
} as const;

// Default tab configurations
export const DEFAULT_TAB_SETTINGS = {
  animation: true,
  scrollable: true,
  centered: false,
  variant: 'standard' as const,
  color: 'primary' as const,
  indicatorColor: 'primary' as const,
  textColor: 'inherit' as const,
  fontSize: 'medium' as const,
  fontWeight: 'regular' as const,
  minHeight: 48,
  maxWidth: '100%',
};

// Performance optimization constants
export const TAB_PERFORMANCE_CONFIG = {
  lazyLoading: true,
  virtualization: false,
  cacheSize: 10,
  preloadThreshold: 2,
  unloadDelay: 300,
} as const;

// Accessibility defaults
export const DEFAULT_ACCESSIBILITY_PROPS = {
  ariaLabel: 'Agent Dashboard Tabs',
  role: 'tablist',
  keyboardNavigation: true,
  screenReaderEnabled: true,
  focusIndicator: true,
  highContrast: false,
  reducedMotion: false,
} as const;

// Tab ordering and routing
export const TAB_ORDER = [
  'overview',
  'personality', 
  'memory',
  'goals',
  'social',
  'skills',
  'performance',
] as const;

export const TAB_ROUTES = {
  overview: '/agent/:agentId/overview',
  personality: '/agent/:agentId/personality',
  memory: '/agent/:agentId/memory',
  goals: '/agent/:agentId/goals',
  social: '/agent/:agentId/social',
  skills: '/agent/:agentId/skills',
  performance: '/agent/:agentId/performance',
} as const;

// Tab icons and labels
export const TAB_METADATA = {
  overview: {
    label: 'Overview',
    icon: 'Dashboard',
    description: 'Agent overview and status information',
    color: '#1976d2',
  },
  personality: {
    label: 'Personality',
    icon: 'Psychology',
    description: 'Personality traits and characteristics',
    color: '#7b1fa2',
  },
  memory: {
    label: 'Memory',
    icon: 'Memory',
    description: 'Memory systems and recall patterns',
    color: '#388e3c',
  },
  goals: {
    label: 'Goals',
    icon: 'Flag',
    description: 'Goal hierarchy and progress tracking',
    color: '#f57c00',
  },
  social: {
    label: 'Social',
    icon: 'People',
    description: 'Social relationships and interactions',
    color: '#e91e63',
  },
  skills: {
    label: 'Skills',
    icon: 'TrendingUp',
    description: 'Skill progression and development',
    color: '#0097a7',
  },
  performance: {
    label: 'Performance',
    icon: 'Analytics',
    description: 'Performance metrics and analytics',
    color: '#4caf50',
  },
} as const;