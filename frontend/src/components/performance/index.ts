/**
 * Performance Metrics Dashboard Components
 * 
 * This file exports all performance monitoring components for the Mindcraft
 * cognitive dashboard, including real-time monitoring, trend analysis,
 * predictive analytics, and system health monitoring.
 */

// Component exports
export { default as PerformanceMetricsDashboard } from './PerformanceMetricsDashboard';
export { default as RealTimeMonitoring } from './RealTimeMonitoring';
export { default as TrendAnalysisComponent } from './TrendAnalysis';
export { default as PredictiveAnalytics } from './PredictiveAnalytics';
export { default as AnomalyDetection } from './AnomalyDetection';
export { default as ResourceUtilizationComponent } from './ResourceUtilization';
export { default as SystemHealthComponent } from './SystemHealth';
export { default as BenchmarkingComponent } from './Benchmarking';
export { default as PerformanceReportsComponent } from './PerformanceReports';
export { default as CustomMetricsComponent } from './CustomMetrics';
export { default as OptimizationRecommendationsComponent } from './OptimizationRecommendations';

// Type exports from performance types
export type {
  PerformanceMetrics,
  ProcessingPhase,
  DataPoint,
  PerformanceTrend,
  TrendDirection,
  ForecastData,
  AnomalyEvent,
  AnomalySeverity,
  TrendStatistics,
  SystemHealth as SystemHealthType,
  HealthStatus,
  SystemStatus,
  ComponentHealth,
  ComponentMetrics,
  AlertEvent,
  AlertType,
  AlertSeverity,
  DiagnosticData,
  ResourceUtilization,
  CpuMetrics,
  MemoryMetrics,
  NetworkMetrics,
  NetworkBandwidth,
  DiskMetrics,
  BenchmarkComparison,
  BenchmarkData,
  IndustryAverage,
  BenchmarkRanking,
  ImprovementArea,
  Priority,
  PerformanceReport,
  ReportPeriod,
  ReportSummary,
  KeyMetric,
  ReportSection,
  SectionType,
  VisualizationConfig,
  ChartType,
  PerformanceInsight,
  InsightType,
  ImpactLevel,
  ReportRecommendation,
  EffortLevel,
  CustomMetric,
  MetricType,
  MetricThresholds,
  MetricData,
  OptimizationRecommendations,
  OptimizationRecommendation,
  OptimizationCategory,
  OptimizationStep,
  EstimatedImpact,
  ImplementationPlan,
  ImplementationPhase,
  PerformanceState,
  TimeRange,
  ViewMode,
  PerformanceApiResponse,
  MetricsResponse,
  TrendsResponse,
  HealthResponse,
  ChartConfig,
  AxisConfig,
  SeriesConfig,
  ChartOptions,
  PerformanceEvents,
  MetricValue,
  MetricFilter,
  SortOrder,
  SortField
} from '../../types/performance';

// Component metadata for programmatic access
export interface ComponentMetadata {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  requiredProps: string[];
  optionalProps: string[];
}

export type ComponentCategory = 
  | 'monitoring'
  | 'analysis'
  | 'prediction'
  | 'health'
  | 'benchmarking'
  | 'reporting'
  | 'customization'
  | 'optimization';

// Component metadata without actual component references to avoid import issues
export const PERFORMANCE_COMPONENTS: ComponentMetadata[] = [
  {
    id: 'performance-dashboard',
    name: 'Performance Metrics Dashboard',
    description: 'Main dashboard with comprehensive performance monitoring',
    category: 'monitoring',
    requiredProps: ['agentId'],
    optionalProps: ['timeRange', 'selectedMetrics', 'viewMode']
  },
  {
    id: 'real-time-monitoring',
    name: 'Real-Time Monitoring',
    description: 'Live performance metrics with automatic updates',
    category: 'monitoring',
    requiredProps: ['agentId'],
    optionalProps: ['updateInterval', 'metrics', 'thresholds']
  },
  {
    id: 'trend-analysis',
    name: 'Trend Analysis',
    description: 'Historical data analysis and trend visualization',
    category: 'analysis',
    requiredProps: ['agentId', 'metric'],
    optionalProps: ['timeRange', 'forecastEnabled', 'compareAgents']
  },
  {
    id: 'predictive-analytics',
    name: 'Predictive Analytics',
    description: 'Machine learning-based performance forecasting',
    category: 'prediction',
    requiredProps: ['agentId', 'metric'],
    optionalProps: ['modelType', 'forecastPeriod', 'confidence']
  },
  {
    id: 'anomaly-detection',
    name: 'Anomaly Detection',
    description: 'Automatic anomaly detection and alerting',
    category: 'monitoring',
    requiredProps: ['agentId'],
    optionalProps: ['sensitivity', 'alertChannels', 'patterns']
  },
  {
    id: 'resource-utilization',
    name: 'Resource Utilization',
    description: 'CPU, memory, and network resource monitoring',
    category: 'monitoring',
    requiredProps: ['agentId'],
    optionalProps: ['resources', 'alerts', 'historical']
  },
  {
    id: 'system-health',
    name: 'System Health',
    description: 'Comprehensive system health monitoring and diagnostics',
    category: 'health',
    requiredProps: ['agentId'],
    optionalProps: ['components', 'checks', 'recommendations']
  },
  {
    id: 'benchmarking',
    name: 'Performance Benchmarking',
    description: 'Performance comparison and ranking analysis',
    category: 'benchmarking',
    requiredProps: ['agentId'],
    optionalProps: ['peerGroup', 'metrics', 'period']
  },
  {
    id: 'performance-reports',
    name: 'Performance Reports',
    description: 'Automated performance report generation and scheduling',
    category: 'reporting',
    requiredProps: ['agentId'],
    optionalProps: ['template', 'schedule', 'distribution']
  },
  {
    id: 'custom-metrics',
    name: 'Custom Metrics',
    description: 'Create and track custom performance metrics',
    category: 'customization',
    requiredProps: [],
    optionalProps: ['metrics', 'formulas', 'visualizations']
  },
  {
    id: 'optimization-recommendations',
    name: 'Optimization Recommendations',
    description: 'AI-powered performance optimization suggestions',
    category: 'optimization',
    requiredProps: ['agentId'],
    optionalProps: ['category', 'priority', 'implementation']
  }
];

// Helper functions for component discovery
export function getComponentsByCategory(category: ComponentCategory): ComponentMetadata[] {
  return PERFORMANCE_COMPONENTS.filter(component => component.category === category);
}

export function getComponentById(id: string): ComponentMetadata | undefined {
  return PERFORMANCE_COMPONENTS.find(component => component.id === id);
}

export function getAllCategories(): ComponentCategory[] {
  return [...new Set(PERFORMANCE_COMPONENTS.map(component => component.category))];
}

// Component mapping function to get components dynamically
export function getComponent(componentId: string): React.ComponentType<any> | null {
  switch (componentId) {
    case 'performance-dashboard':
      return require('./PerformanceMetricsDashboard').default;
    case 'real-time-monitoring':
      return require('./RealTimeMonitoring').default;
    case 'trend-analysis':
      return require('./TrendAnalysis').default;
    case 'predictive-analytics':
      return require('./PredictiveAnalytics').default;
    case 'anomaly-detection':
      return require('./AnomalyDetection').default;
    case 'resource-utilization':
      return require('./ResourceUtilization').default;
    case 'system-health':
      return require('./SystemHealth').default;
    case 'benchmarking':
      return require('./Benchmarking').default;
    case 'performance-reports':
      return require('./PerformanceReports').default;
    case 'custom-metrics':
      return require('./CustomMetrics').default;
    case 'optimization-recommendations':
      return require('./OptimizationRecommendations').default;
    default:
      return null;
  }
}

// Default export with metadata and helpers
export default {
  metadata: PERFORMANCE_COMPONENTS,
  helpers: {
    getComponentsByCategory,
    getComponentById,
    getAllCategories,
    getComponent
  }
};