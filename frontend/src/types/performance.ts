/**
 * Performance Metrics TypeScript Interfaces
 * 
 * This file contains comprehensive TypeScript interfaces for the performance metrics
 * dashboard, including real-time monitoring, trend analysis, predictive analytics,
 * and system health monitoring components.
 */

// Core Performance Metrics
export interface PerformanceMetrics {
  agentId: string;
  timestamp: number;
  responseTime: number;
  cognitiveLoad: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  errorRate: number;
  throughput: number;
  taskCompletionRate: number;
  activeGoals: number;
  queueSize: number;
  processingPhase: ProcessingPhase;
}

export interface ProcessingPhase {
  current: string;
  duration: number;
  startTime: number;
  progress: number;
}

// Data Points for Time Series
export interface DataPoint {
  timestamp: number;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

// Trend Analysis
export interface PerformanceTrend {
  metric: string;
  historicalData: DataPoint[];
  trend: TrendDirection;
  forecast: ForecastData[];
  anomalies: AnomalyEvent[];
  statistics: TrendStatistics;
}

export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile';

export interface ForecastData {
  timestamp: number;
  value: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

export interface AnomalyEvent {
  id: string;
  timestamp: number;
  metric: string;
  value: number;
  expectedValue: number;
  severity: AnomalySeverity;
  description: string;
  resolved: boolean;
  resolvedAt?: number;
}

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface TrendStatistics {
  mean: number;
  median: number;
  standardDeviation: number;
  min: number;
  max: number;
  growthRate: number;
  correlation: number;
}

// System Health
export interface SystemHealth {
  overall: HealthStatus;
  components: ComponentHealth[];
  alerts: AlertEvent[];
  diagnostics: DiagnosticData[];
  lastUpdated: number;
}

export interface HealthStatus {
  status: SystemStatus;
  score: number;
  issues: number;
  criticalIssues: number;
  recommendations: string[];
}

export type SystemStatus = 'healthy' | 'warning' | 'critical' | 'offline';

export interface ComponentHealth {
  id: string;
  name: string;
  status: SystemStatus;
  metrics: ComponentMetrics;
  lastCheck: number;
  uptime: number;
  errorCount: number;
}

export interface ComponentMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  resourceUsage: number;
  availability: number;
}

export interface AlertEvent {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export type AlertType = 'performance' | 'system' | 'security' | 'maintenance' | 'anomaly';
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface DiagnosticData {
  id: string;
  component: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  timestamp: number;
  details?: Record<string, any>;
}

// Resource Utilization
export interface ResourceUtilization {
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  network: NetworkMetrics;
  disk: DiskMetrics;
  timestamp: number;
}

export interface CpuMetrics {
  usage: number;
  cores: number;
  loadAverage: number[];
  processes: number;
  temperature?: number;
}

export interface MemoryMetrics {
  used: number;
  total: number;
  available: number;
  percentage: number;
  heapUsed?: number;
  heapTotal?: number;
}

export interface NetworkMetrics {
  latency: number;
  bandwidth: NetworkBandwidth;
  connections: number;
  packetsLost: number;
  throughput: number;
}

export interface NetworkBandwidth {
  inbound: number;
  outbound: number;
  total: number;
}

export interface DiskMetrics {
  used: number;
  total: number;
  available: number;
  percentage: number;
  readSpeed: number;
  writeSpeed: number;
}

// Benchmarking
export interface BenchmarkComparison {
  agentId: string;
  benchmarks: BenchmarkData[];
  rankings: BenchmarkRanking[];
  improvements: ImprovementArea[];
  lastUpdated: number;
}

export interface BenchmarkData {
  category: string;
  metric: string;
  value: number;
  baseline: number;
  target: number;
  percentile: number;
  industry: IndustryAverage;
}

export interface IndustryAverage {
  average: number;
  median: number;
  topQuartile: number;
  bottomQuartile: number;
}

export interface BenchmarkRanking {
  category: string;
  rank: number;
  totalAgents: number;
  score: number;
  change: number;
}

export interface ImprovementArea {
  category: string;
  current: number;
  target: number;
  potential: number;
  priority: Priority;
  recommendations: string[];
}

export type Priority = 'low' | 'medium' | 'high' | 'critical';

// Performance Reports
export interface PerformanceReport {
  id: string;
  title: string;
  generatedAt: number;
  period: ReportPeriod;
  summary: ReportSummary;
  sections: ReportSection[];
  insights: PerformanceInsight[];
  recommendations: ReportRecommendation[];
}

export interface ReportPeriod {
  start: number;
  end: number;
  duration: number;
  type: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export interface ReportSummary {
  overallScore: number;
  keyMetrics: KeyMetric[];
  highlights: string[];
  concerns: string[];
}

export interface KeyMetric {
  name: string;
  value: number;
  change: number;
  trend: TrendDirection;
  status: SystemStatus;
}

export interface ReportSection {
  id: string;
  title: string;
  type: SectionType;
  data: any;
  visualizations: VisualizationConfig[];
}

export type SectionType = 'overview' | 'trends' | 'anomalies' | 'resources' | 'benchmarks' | 'recommendations';

export interface VisualizationConfig {
  type: ChartType;
  title: string;
  data: any;
  options?: Record<string, any>;
}

export type ChartType = 'line' | 'bar' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'radar';

export interface PerformanceInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: ImpactLevel;
  confidence: number;
  data?: any;
}

export type InsightType = 'pattern' | 'anomaly' | 'optimization' | 'prediction' | 'correlation';
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ReportRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: Priority;
  effort: EffortLevel;
  impact: ImpactLevel;
  actions: string[];
}

export type EffortLevel = 'low' | 'medium' | 'high' | 'expert';

// Custom Metrics
export interface CustomMetric {
  id: string;
  name: string;
  description: string;
  type: MetricType;
  formula: string;
  unit: string;
  thresholds: MetricThresholds;
  enabled: boolean;
  createdBy: string;
  createdAt: number;
  lastUpdated: number;
}

export type MetricType = 'counter' | 'gauge' | 'rate' | 'histogram' | 'timer';

export interface MetricThresholds {
  warning: number;
  critical: number;
  target: number;
}

export interface MetricData {
  metricId: string;
  timestamp: number;
  value: number;
  labels?: Record<string, string>;
}

// Optimization Recommendations
export interface OptimizationRecommendations {
  agentId: string;
  generatedAt: number;
  recommendations: OptimizationRecommendation[];
  estimatedImpact: EstimatedImpact;
  implementation: ImplementationPlan;
}

export interface OptimizationRecommendation {
  id: string;
  category: OptimizationCategory;
  title: string;
  description: string;
  rationale: string;
  priority: Priority;
  effort: EffortLevel;
  impact: ImpactLevel;
  metrics: string[];
  steps: OptimizationStep[];
}

export type OptimizationCategory = 'performance' | 'memory' | 'cpu' | 'network' | 'algorithm' | 'architecture';

export interface OptimizationStep {
  id: string;
  description: string;
  action: string;
  parameters?: Record<string, any>;
  expectedOutcome: string;
  risks?: string[];
}

export interface EstimatedImpact {
  performanceGain: number;
  resourceSaving: number;
  costReduction: number;
  confidence: number;
}

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  timeline: number;
  dependencies: string[];
  rollbackPlan: string;
}

export interface ImplementationPhase {
  id: string;
  name: string;
  duration: number;
  tasks: string[];
  deliverables: string[];
}

// Performance State for Redux
export interface PerformanceState {
  // Real-time metrics
  currentMetrics: Record<string, PerformanceMetrics>;
  metricsHistory: Record<string, PerformanceMetrics[]>;
  
  // Trend analysis
  trends: Record<string, PerformanceTrend>;
  
  // System health
  systemHealth: Record<string, SystemHealth>;
  
  // Resource utilization
  resourceUtilization: Record<string, ResourceUtilization>;
  
  // Benchmarking
  benchmarks: Record<string, BenchmarkComparison>;
  
  // Reports
  reports: PerformanceReport[];
  
  // Custom metrics
  customMetrics: CustomMetric[];
  customMetricData: Record<string, MetricData[]>;
  
  // Optimization recommendations
  optimizations: Record<string, OptimizationRecommendations>;
  
  // UI state
  selectedAgent: string | null;
  selectedTimeRange: TimeRange;
  selectedMetrics: string[];
  viewMode: ViewMode;
  loading: boolean;
  error: string | null;
  
  // Real-time settings
  realTimeEnabled: boolean;
  updateInterval: number;
  alertThresholds: Record<string, number>;
}

export interface TimeRange {
  start: number;
  end: number;
  label: string;
}

export type ViewMode = 'overview' | 'detailed' | 'comparison' | 'trends' | 'reports';

// API Response Types
export interface PerformanceApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

export interface MetricsResponse extends PerformanceApiResponse {
  data?: {
    metrics: PerformanceMetrics[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface TrendsResponse extends PerformanceApiResponse {
  data?: {
    trends: PerformanceTrend[];
    forecast: ForecastData[];
  };
}

export interface HealthResponse extends PerformanceApiResponse {
  data?: {
    health: SystemHealth;
    components: ComponentHealth[];
  };
}

// Chart Configuration
export interface ChartConfig {
  type: ChartType;
  title: string;
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  series: SeriesConfig[];
  options?: ChartOptions;
}

export interface AxisConfig {
  label: string;
  type: 'linear' | 'time' | 'category';
  min?: number;
  max?: number;
  format?: string;
}

export interface SeriesConfig {
  name: string;
  data: DataPoint[];
  color?: string;
  type?: ChartType;
  yAxisIndex?: number;
}

export interface ChartOptions {
  responsive: boolean;
  animation: boolean;
  legend: boolean;
  tooltip: boolean;
  grid?: boolean;
  theme?: 'light' | 'dark';
}

// Event Types for Socket.IO
export interface PerformanceEvents {
  'performance:metrics': (metrics: PerformanceMetrics) => void;
  'performance:trend': (trend: PerformanceTrend) => void;
  'performance:health': (health: SystemHealth) => void;
  'performance:alert': (alert: AlertEvent) => void;
  'performance:anomaly': (anomaly: AnomalyEvent) => void;
  'performance:resource': (resources: ResourceUtilization) => void;
  'performance:benchmark': (benchmark: BenchmarkComparison) => void;
  'performance:recommendation': (recommendation: OptimizationRecommendations) => void;
}

// Utility Types
export type MetricValue = number | string | boolean;
export type MetricFilter = {
  agentId?: string;
  metric?: string;
  timeRange?: TimeRange;
  threshold?: number;
};

export type SortOrder = 'asc' | 'desc';
export type SortField = 'timestamp' | 'value' | 'name' | 'severity';

// All types are already exported with their individual declarations