/**
 * Memory System TypeScript Interfaces
 * Based on LangGraph memory architecture and technical specification
 */

// Base memory interfaces
export interface BaseMemory {
  id: string;
  timestamp: number;
  strength: number;
  decayRate: number;
  lastAccessed: number;
  accessCount: number;
}

// Semantic Memory Types
export interface Concept extends BaseMemory {
  name: string;
  category: string;
  definition: string;
  properties: Record<string, any>;
  connections: string[]; // IDs of related concepts
  clusterId?: string;
  importance: number; // 0-1 scale
  abstraction: number; // 0-1 scale (concrete to abstract)
}

export interface Relationship extends BaseMemory {
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  strength: number; // 0-1 scale
  directionality: 'bidirectional' | 'unidirectional';
  metadata: Record<string, any>;
}

export const RelationshipType = {
  IS_A: 'is_a',
  PART_OF: 'part_of',
  RELATED_TO: 'related_to',
  CAUSES: 'causes',
  ENABLES: 'enables',
  SIMILAR_TO: 'similar_to',
  OPPOSITE_OF: 'opposite_of',
  EXAMPLE_OF: 'example_of'
} as const;

export type RelationshipType = typeof RelationshipType[keyof typeof RelationshipType];

export interface KnowledgeGraph {
  concepts: Concept[];
  relationships: Relationship[];
  clusters: ConceptCluster[];
  metrics: KnowledgeGraphMetrics;
}

export interface ConceptCluster {
  id: string;
  name: string;
  concepts: string[];
  theme: string;
  cohesion: number;
}

export interface KnowledgeGraphMetrics {
  totalConcepts: number;
  totalRelationships: number;
  averageConnections: number;
  clusteringCoefficient: number;
  graphDensity: number;
}

export interface SemanticMemory {
  concepts: Concept[];
  relationships: Relationship[];
  knowledgeGraph: KnowledgeGraph;
  consolidationHistory: ConsolidationEvent[];
}

// Episodic Memory Types
export interface EpisodicEvent extends BaseMemory {
  name: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  location: Position3D;
  participants: string[];
  entities: EntityReference[];
  emotions: EmotionData[];
  significance: number; // 0-1 scale
  context: EventContext;
  tags: string[];
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
  dimension?: string;
}

export interface EntityReference {
  id: string;
  type: EntityType;
  name: string;
  role: string;
  properties: Record<string, any>;
}

export const EntityType = {
  AGENT: 'agent',
  PLAYER: 'player',
  MOB: 'mob',
  BLOCK: 'block',
  ITEM: 'item',
  STRUCTURE: 'structure'
} as const;

export type EntityType = typeof EntityType[keyof typeof EntityType];

export interface EmotionData {
  type: EmotionType;
  intensity: number; // 0-1 scale
  target?: string;
  cause?: string;
}

export const EmotionType = {
  JOY: 'joy',
  SADNESS: 'sadness',
  ANGER: 'anger',
  FEAR: 'fear',
  SURPRISE: 'surprise',
  DISGUST: 'disgust',
  TRUST: 'trust',
  ANTICIPATION: 'anticipation'
} as const;

export type EmotionType = typeof EmotionType[keyof typeof EmotionType];

export interface EventContext {
  weather?: string;
  timeOfDay?: string;
  healthStatus?: number;
  inventoryState?: string[];
  activeGoals?: string[];
  socialContext?: string;
}

export interface Experience extends BaseMemory {
  eventId: string;
  outcome: ExperienceOutcome;
  lessons: string[];
  skillsInvolved: string[];
  decisions: DecisionPoint[];
  reflections: string[];
}

export const ExperienceOutcome = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  PARTIAL: 'partial',
  NEUTRAL: 'neutral'
} as const;

export type ExperienceOutcome = typeof ExperienceOutcome[keyof typeof ExperienceOutcome];

export interface DecisionPoint {
  timestamp: number;
  situation: string;
  options: string[];
  chosen: string;
  reasoning: string;
  result: string;
}

export interface MemoryTimeline {
  events: EpisodicEvent[];
  experiences: Experience[];
  timeRange: TimeRange;
  significantEvents: string[];
  patterns: TemporalPattern[];
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface TemporalPattern {
  type: PatternType;
  frequency: number;
  timeOfDay: number[];
  locations: Position3D[];
  participants: string[];
  confidence: number;
}

export const PatternType = {
  DAILY_ROUTINE: 'daily_routine',
  WEEKLY_PATTERN: 'weekly_pattern',
  SEASONAL_BEHAVIOR: 'seasonal_behavior',
  SITUATIONAL_RESPONSE: 'situational_response'
} as const;

export type PatternType = typeof PatternType[keyof typeof PatternType];

export interface EpisodicMemory {
  events: EpisodicEvent[];
  experiences: Experience[];
  timeline: MemoryTimeline;
  emotionalHistory: EmotionData[];
  socialInteractions: SocialInteraction[];
}

export interface SocialInteraction {
  id: string;
  eventId: string;
  participants: string[];
  type: InteractionType;
  outcome: InteractionOutcome;
  trustChange: number;
  relationshipImpact: string;
}

export const InteractionType = {
  CONVERSATION: 'conversation',
  COLLABORATION: 'collaboration',
  CONFLICT: 'conflict',
  TRADE: 'trade',
  HELP: 'help',
  TEACHING: 'teaching'
} as const;

export type InteractionType = typeof InteractionType[keyof typeof InteractionType];

export const InteractionOutcome = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral'
} as const;

export type InteractionOutcome = typeof InteractionOutcome[keyof typeof InteractionOutcome];

// Procedural Memory Types
export interface ProceduralSkill extends BaseMemory {
  name: string;
  type: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  components: SkillComponent[];
  sequences: SkillSequence[];
  triggers: SkillTrigger[];
  prerequisites: string[];
  masteryLevel: number; // 0-1 scale
  createdAt: number;
  usageCount: number;
}

export const SkillCategory = {
  COMBAT: 'combat',
  CRAFTING: 'crafting',
  EXPLORATION: 'exploration',
  SOCIAL: 'social',
  BUILDING: 'building',
  MINING: 'mining',
  FARMING: 'farming',
  TRADING: 'trading'
} as const;

export type SkillCategory = typeof SkillCategory[keyof typeof SkillCategory];

export interface ProficiencyLevel {
  knowledge: number; // 0-1 scale
  practical: number; // 0-1 scale
  creative: number; // 0-1 scale
  overall: number; // 0-1 scale
}

export interface SkillComponent {
  id: string;
  name: string;
  description: string;
  difficulty: number; // 0-1 scale
  importance: number; // 0-1 scale
  masteryLevel: number; // 0-1 scale
}

export interface SkillSequence {
  id: string;
  name: string;
  description: string;
  steps: SequenceStep[];
  conditions: SequenceCondition[];
  outcomes: SequenceOutcome[];
  efficiency: number; // 0-1 scale
  purpose: string;
  automation: number;
}

export interface SequenceStep {
  order: number;
  action: string;
  parameters: Record<string, any>;
  duration: number;
  successRate: number; // 0-1 scale
}

export interface SequenceCondition {
  type: ConditionType;
  parameter: string;
  operator: ComparisonOperator;
  value: any;
}

export const ConditionType = {
  RESOURCE: 'resource',
  LOCATION: 'location',
  HEALTH: 'health',
  INVENTORY: 'inventory',
  TIME: 'time',
  SOCIAL: 'social'
} as const;

export type ConditionType = typeof ConditionType[keyof typeof ConditionType];

export const ComparisonOperator = {
  EQUALS: 'equals',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  CONTAINS: 'contains',
  WITHIN_RANGE: 'within_range'
} as const;

export type ComparisonOperator = typeof ComparisonOperator[keyof typeof ComparisonOperator];

export interface SequenceOutcome {
  probability: number; // 0-1 scale
  result: string;
  sideEffects: string[];
}

export interface SkillTrigger {
  type: TriggerType;
  condition: string;
  threshold: number;
  context: Record<string, any>;
}

export const TriggerType = {
  AUTOMATIC: 'automatic',
  MANUAL: 'manual',
  SITUATIONAL: 'situational',
  EMOTIONAL: 'emotional'
} as const;

export type TriggerType = typeof TriggerType[keyof typeof TriggerType];

export interface ActionPattern {
  id: string;
  name: string;
  strength: number;
  frequency: number;
  contexts: string[];
  outcomes: PatternOutcome[];
  efficiency: number;
  adaptability: number;
}

export interface PatternOutcome {
  result: string;
  probability: number;
  confidence: number;
}

export interface ProceduralMemory {
  skills: ProceduralSkill[];
  patterns: ActionPattern[];
  sequences: SkillSequence[];
  executionHistory: ExecutionRecord[];
  adaptationHistory: AdaptationRecord[];
}

export interface ExecutionRecord {
  id: string;
  skillId: string;
  timestamp: number;
  context: Record<string, any>;
  success: boolean;
  duration: number;
  errors: string[];
  improvements: string[];
}

export interface AdaptationRecord {
  id: string;
  skillId: string;
  timestamp: number;
  changeType: AdaptationType;
  oldValue: any;
  newValue: any;
  reason: string;
  effectiveness: number;
}

export const AdaptationType = {
  EFFICIENCY_IMPROVEMENT: 'efficiency_improvement',
  ERROR_CORRECTION: 'error_correction',
  CONTEXT_ADAPTATION: 'context_adaptation',
  NEW_SEQUENCE: 'new_sequence'
} as const;

export type AdaptationType = typeof AdaptationType[keyof typeof AdaptationType];

// Working Memory Types
export interface WorkingMemoryState {
  currentFocus: string;
  activeTasks: ActiveTask[];
  attentionBuffer: AttentionItem[];
  shortTermMemory: ShortTermItem[];
  cognitiveLoad: number; // 0-1 scale
  processingCapacity: number; // 0-1 scale
}

export interface ActiveTask {
  id: string;
  type: TaskType;
  description: string;
  priority: number; // 0-1 scale
  progress: number; // 0-1 scale
  startTime: number;
  deadline?: number;
  context: Record<string, any>;
}

export const TaskType = {
  GOAL_EXECUTION: 'goal_execution',
  PROBLEM_SOLVING: 'problem_solving',
  SOCIAL_INTERACTION: 'social_interaction',
  LEARNING: 'learning',
  EXPLORATION: 'exploration'
} as const;

export type TaskType = typeof TaskType[keyof typeof TaskType];

export interface AttentionItem {
  id: string;
  type: AttentionType;
  content: string;
  importance: number; // 0-1 scale
  duration: number;
  timestamp: number;
}

export const AttentionType = {
  SENSORY_INPUT: 'sensory_input',
  INTERNAL_THOUGHT: 'internal_thought',
  EXTERNAL_STIMULUS: 'external_stimulus',
  MEMORY_RECALL: 'memory_recall'
} as const;

export type AttentionType = typeof AttentionType[keyof typeof AttentionType];

export interface ShortTermItem {
  id: string;
  content: any;
  type: ShortTermType;
  timestamp: number;
  decayRate: number;
  reinforced: boolean;
}

export const ShortTermType = {
  FACT: 'fact',
  INSTRUCTION: 'instruction',
  OBSERVATION: 'observation',
  CALCULATION: 'calculation'
} as const;

export type ShortTermType = typeof ShortTermType[keyof typeof ShortTermType];

// Memory Consolidation Types
export interface ConsolidationEvent extends BaseMemory {
  type: ConsolidationType;
  sourceMemoryIds: string[];
  targetMemoryId?: string;
  process: ConsolidationProcess;
  outcome: ConsolidationOutcome;
  timestamp: number;
}

export const ConsolidationType = {
  SEMANTIC_EXTRACTION: 'semantic_extraction',
  EPISODIC_TO_SEMANTIC: 'episodic_to_semantic',
  PROCEDURAL_REFINEMENT: 'procedural_refinement',
  MEMORY_FORGETTING: 'memory_forgetting',
  MEMORY_REORGANIZATION: 'memory_reorganization'
} as const;

export type ConsolidationType = typeof ConsolidationType[keyof typeof ConsolidationType];

export interface ConsolidationProcess {
  strategy: ConsolidationStrategy;
  parameters: Record<string, any>;
  stages: ConsolidationStage[];
  duration: number;
}

export const ConsolidationStrategy = {
  SPACED_REPETITION: 'spaced_repetition',
  INTERLEAVING: 'interleaving',
  ELABATIVE_ENCODING: 'elaborative_encoding',
  CHUNKING: 'chunking'
} as const;

export type ConsolidationStrategy = typeof ConsolidationStrategy[keyof typeof ConsolidationStrategy];

export interface ConsolidationStage {
  name: string;
  status: StageStatus;
  startTime: number;
  endTime?: number;
  result?: any;
}

export const StageStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

export type StageStatus = typeof StageStatus[keyof typeof StageStatus];

export const ConsolidationOutcome = {
  SUCCESS: 'success',
  PARTIAL_SUCCESS: 'partial_success',
  FAILURE: 'failure',
  DEFERRED: 'deferred'
} as const;

export type ConsolidationOutcome = typeof ConsolidationOutcome[keyof typeof ConsolidationOutcome];

export interface MemoryTransfer {
  id: string;
  sourceType: MemoryType;
  targetType: MemoryType;
  sourceId: string;
  targetId?: string;
  transferType: TransferType;
  strength: number;
  timestamp: number;
}

export const MemoryType = {
  SEMANTIC: 'semantic',
  EPISODIC: 'episodic',
  PROCEDURAL: 'procedural',
  WORKING: 'working'
} as const;

export type MemoryType = typeof MemoryType[keyof typeof MemoryType];

export const TransferType = {
  CONVERSION: 'conversion',
  ASSOCIATION: 'association',
  GENERALIZATION: 'generalization',
  SPECIALIZATION: 'specialization'
} as const;

export type TransferType = typeof TransferType[keyof typeof TransferType];

export interface MemoryDecay {
  memoryId: string;
  memoryType: MemoryType;
  decayRate: number;
  lastAccessed: number;
  strength: number;
  threshold: number;
  predictedDecayTime: number;
}

// Memory Analytics Types
export interface MemoryAnalytics {
  accessPatterns: AccessPattern[];
  strengthDistribution: StrengthDistribution;
  decayAnalysis: DecayAnalysis;
  consolidationMetrics: ConsolidationMetrics;
  correlationAnalysis: CorrelationAnalysis;
}

export interface AccessPattern {
  memoryType: MemoryType;
  frequency: number;
  timeDistribution: number[]; // 24-hour distribution
  contextPatterns: string[];
  trends: AccessTrend[];
}

export interface AccessTrend {
  period: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  rate: number;
  confidence: number;
}

export interface StrengthDistribution {
  memoryType: MemoryType;
  ranges: StrengthRange[];
  average: number;
  median: number;
  standardDeviation: number;
}

export interface StrengthRange {
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export interface DecayAnalysis {
  memoryType: MemoryType;
  averageDecayRate: number;
  criticalMemories: string[];
  decayTrends: DecayTrend[];
  recommendations: DecayRecommendation[];
}

export interface DecayTrend {
  timeRange: TimeRange;
  rate: number;
  affectedCount: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DecayRecommendation {
  memoryId: string;
  action: string;
  priority: number;
  expectedImpact: number;
}

export interface ConsolidationMetrics {
  totalEvents: number;
  successRate: number;
  averageDuration: number;
  efficiencyByType: Record<ConsolidationType, number>;
  bottlenecks: string[];
}

export interface CorrelationAnalysis {
  correlations: MemoryCorrelation[];
  insights: CorrelationInsight[];
  predictions: CorrelationPrediction[];
}

export interface MemoryCorrelation {
  memory1Id: string;
  memory2Id: string;
  memory1Type: MemoryType;
  memory2Type: MemoryType;
  correlation: number; // -1 to 1
  significance: number; // 0-1 scale
  relationship: CorrelationType;
}

export const CorrelationType = {
  CAUSAL: 'causal',
  SEQUENTIAL: 'sequential',
  SEMANTIC: 'semantic',
  TEMPORAL: 'temporal',
  CONTEXTUAL: 'contextual'
} as const;

export type CorrelationType = typeof CorrelationType[keyof typeof CorrelationType];

export interface CorrelationInsight {
  pattern: string;
  description: string;
  confidence: number;
  implications: string[];
}

export interface CorrelationPrediction {
  memory1Id: string;
  memory2Id: string;
  predictedCorrelation: number;
  confidence: number;
  timeframe: number;
}

// Main Memory System Interface
export interface MemorySystem {
  semantic: SemanticMemory;
  episodic: EpisodicMemory;
  procedural: ProceduralMemory;
  working: WorkingMemoryState;
  consolidation: ConsolidationEvent[];
  analytics: MemoryAnalytics;
  lastUpdate: number;
}

// Visualization-specific interfaces
export interface MemoryVisualizationConfig {
  layout: VisualizationLayout;
  filters: MemoryFilter[];
  colorScheme: ColorScheme;
  animation: AnimationConfig;
  interaction: InteractionConfig;
}

export interface MemoryFilter {
  type: MemoryType;
  criteria: FilterCriteria;
  active: boolean;
}

export interface FilterCriteria {
  strengthRange?: [number, number];
  timeRange?: TimeRange;
  categories?: string[];
  tags?: string[];
  significance?: [number, number];
}

export interface VisualizationLayout {
  type: LayoutType;
  spacing: number;
  clustering: boolean;
  hierarchical: boolean;
  dimensions: 2 | 3;
}

export const LayoutType = {
  FORCE_DIRECTED: 'force_directed',
  CIRCULAR: 'circular',
  HIERARCHICAL: 'hierarchical',
  GRID: 'grid',
  SPIRAL: 'spiral'
} as const;

export type LayoutType = typeof LayoutType[keyof typeof LayoutType];

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  memoryTypeColors: Record<MemoryType, string>;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: string;
  stagger: number;
}

export interface InteractionConfig {
  hoverEnabled: boolean;
  clickEnabled: boolean;
  dragEnabled: boolean;
  zoomEnabled: boolean;
  selectionEnabled: boolean;
}

// Search and Exploration interfaces
export interface MemorySearchQuery {
  query: string;
  type?: MemoryType;
  filters?: FilterCriteria[];
  sortBy?: SortCriteria;
  limit?: number;
  offset?: number;
}

export const SortCriteria = {
  STRENGTH: 'strength',
  RECENCY: 'recency',
  SIGNIFICANCE: 'significance',
  ACCESS_FREQUENCY: 'access_frequency',
  RELEVANCE: 'relevance'
} as const;

export type SortCriteria = typeof SortCriteria[keyof typeof SortCriteria];

export interface MemorySearchResult {
  memories: SearchResult[];
  totalCount: number;
  suggestions: string[];
  relatedQueries: string[];
}

export interface SearchResult {
  memory: BaseMemory;
  type: MemoryType;
  relevanceScore: number;
  highlights: string[];
  context: string;
}

// Performance monitoring interfaces
export interface MemoryPerformanceMetrics {
  accessLatency: number;
  consolidationSpeed: number;
  memoryUsage: number;
  processingEfficiency: number;
  errorRate: number;
  cacheHitRate: number;
}

// Memory strength data for visualization
export interface MemoryStrengthData {
  memoryId: string;
  memoryType: MemoryType;
  strength: number;
  originalStrength: number;
  decayRate: number;
  age: number;
  lastAccessed: number;
  accessCount: number;
  threshold: number;
}

export interface MemoryVisualizationPerformance {
  renderTime: number;
  frameRate: number;
  memoryUsage: number;
  interactionLatency: number;
  dataProcessingTime: number;
}