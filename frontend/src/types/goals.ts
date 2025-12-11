/**
 * Goal hierarchy visualization types for Mindcraft LangGraph agents
 * Based on the LangGraph goal system architecture
 */

export type GoalPriority = 0 | 1 | 2 | 3; // CRITICAL | HIGH | MEDIUM | LOW
export const GoalPriority = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3
} as const;

export type GoalStatus =
  | 'pending'
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'cancelled';

export const GoalStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
} as const;

export type GoalType = 'strategic' | 'tactical' | 'operational';

export const GoalType = {
  STRATEGIC: 'strategic',
  TACTICAL: 'tactical',
  OPERATIONAL: 'operational'
} as const;

export type ResourceStatus = 'available' | 'allocated' | 'in_use' | 'depleted' | 'reserved' | 'optimal' | 'sufficient' | 'insufficient' | 'critical' | 'wasted';

export const ResourceStatus = {
  AVAILABLE: 'available',
  ALLOCATED: 'allocated',
  IN_USE: 'in_use',
  DEPLETED: 'depleted',
  RESERVED: 'reserved',
  OPTIMAL: 'optimal',
  SUFFICIENT: 'sufficient',
  INSUFFICIENT: 'insufficient',
  CRITICAL: 'critical',
  WASTED: 'wasted'
} as const;

export interface ResourceRequirement {
  type: string;
  amount: number;
  available: number;
  unit: string;
  status: ResourceStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ResourceRequirements {
  required: ResourceRequirement[];
  allocated: ResourceRequirement[];
  totalCost: number;
}

export interface Milestone {
  id: string;
  name: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  completedAt?: number;
  dependencies: string[];
  dueDate?: number;
  tags: string[];
  createdAt: number;
}

export interface GoalProgress {
  current: number;
  target: number;
  percentage: number;
  milestones: Milestone[];
  completedMilestones: string[];
  lastUpdated: number;
  estimatedCompletion?: number;
}

export interface Goal {
  id: string;
  type: GoalType;
  priority: GoalPriority;
  description: string;
  status: GoalStatus;
  dependencies: string[];
  resources: ResourceRequirements;
  progress: GoalProgress;
  createdAt: number;
  updatedAt: number;
  parentGoal?: string;
  childGoals: string[];
  assignedAgent?: string;
  tags: string[];
  metadata: Record<string, any>;
  title: string;
  dueDate?: number;
  estimatedDuration?: number;
  actualDuration?: number;
  completedAt?: number;
  notes?: string;
}

export interface GoalRelationship {
  sourceGoalId: string;
  targetGoalId: string;
  type: 'dependency' | 'conflict' | 'synergy' | 'predecessor';
  strength: number; // 0-1
  description: string;
  createdAt: number;
}

export interface CriticalPath {
  id: string;
  name: string;
  goals: string[];
  totalDuration: number;
  criticality: number; // 0-1
  bottlenecks: string[];
}

export interface GoalHierarchy {
  agentId: string;
  strategicGoals: Goal[];
  tacticalGoals: Goal[];
  operationalGoals: Goal[];
  relationships: GoalRelationship[];
  criticalPaths: CriticalPath[];
  lastUpdated: number;
}

export interface GoalStatistics {
  total: number;
  byStatus: {
    pending: number;
    active: number;
    in_progress: number;
    completed: number;
    failed: number;
    paused: number;
    cancelled: number;
  };
  byType: {
    strategic: number;
    tactical: number;
    operational: number;
  };
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  averageProgress: number;
}

export interface GoalAnalytics {
  totalGoals: number;
  completedGoals: number;
  failedGoals: number;
  averageCompletionTime: number;
  successRate: number;
  goalTypeDistribution: Record<GoalType, number>;
  priorityDistribution: Record<GoalPriority, number>;
  completionTrends: CompletionTrend[];
  resourceUtilization: ResourceUtilization;
}

export interface CompletionTrend {
  date: string;
  completed: number;
  failed: number;
  total: number;
}

export interface ResourceUtilization {
  resourceType: string;
  totalAllocated: number;
  totalUsed: number;
  efficiency: number; // 0-1
  waste: number;
}

export interface GoalConflict {
  id: string;
  conflictingGoals: string[];
  conflictType: 'resource' | 'priority' | 'dependency' | 'timing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedResolution: string;
  detectedAt: number;
}

export interface GoalCreationRequest {
  type: GoalType;
  description: string;
  priority: GoalPriority;
  parentGoalId?: string;
  dependencies: string[];
  resources: ResourceRequirement[];
  milestones: Omit<Milestone, 'id' | 'currentValue' | 'completed' | 'completedAt'>[];
  tags: string[];
  metadata: Record<string, any>;
}

export interface GoalUpdateRequest {
  goalId: string;
  updates: Partial<{
    description: string;
    priority: GoalPriority;
    status: GoalStatus;
    dependencies: string[];
    resources: ResourceRequirements;
    progress: Partial<GoalProgress>;
    tags: string[];
    metadata: Record<string, any>;
  }>;
}

// D3.js Tree Visualization Types
export interface TreeNode {
  x?: number;
  y?: number;
  depth: number;
  height: number;
  parent: TreeNode | null;
  children: TreeNode[] | null;
  data: Goal;
  id: string;
}

export interface TreeLayoutConfig {
  width: number;
  height: number;
  nodeRadius: number;
  linkStrength: number;
  linkDistance: number;
  charge: number;
  gravity: number;
}

export interface DragDropItem {
  goalId: string;
  sourceType: GoalType;
  targetType: GoalType;
  targetParentId?: string;
  newIndex: number;
}

// Component State Types
export interface GoalHierarchyState {
  hierarchy: GoalHierarchy | null;
  goals: Goal[];
  analytics: GoalAnalytics | null;
  conflicts: GoalConflict[];
  selectedGoal: Goal | null;
  expandedNodes: Set<string>;
  filterCriteria: GoalFilterCriteria;
  viewMode: 'tree' | 'list' | 'dependency' | 'timeline';
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  filters: GoalFilterCriteria;
  statistics: GoalStatistics | null;
}

export interface GoalFilterCriteria {
  type?: GoalType | 'all';
  status?: GoalStatus | 'all';
  priority?: GoalPriority | 'all';
  agent?: string;
  tags?: string[];
  dateRange?: {
    start: number | null;
    end: number | null;
  };
  searchText?: string;
  searchTerm?: string;
}

// Socket Event Types
export interface GoalUpdateEvent {
  agentId: string;
  goalId: string;
  updateType: 'created' | 'updated' | 'completed' | 'failed' | 'deleted';
  goal: Goal;
  timestamp: number;
}

export interface GoalHierarchyEvent {
  agentId: string;
  hierarchy: GoalHierarchy;
  timestamp: number;
}

// Chart Data Types
export interface GoalProgressChartData {
  goalId: string;
  goalName: string;
  progress: number;
  target: number;
  milestones: {
    name: string;
    progress: number;
    completed: boolean;
  }[];
}

export interface GoalTimelineData {
  goalId: string;
  goalName: string;
  startDate: number;
  endDate?: number;
  progress: number;
  status: GoalStatus;
  type: GoalType;
  priority: GoalPriority;
}

export interface ResourceAllocationChartData {
  resourceType: string;
  allocated: number;
  used: number;
  available: number;
  goals: string[];
}

// Validation Types
export interface GoalValidationError {
  field: string;
  message: string;
  code: string;
}

export interface GoalValidationResult {
  isValid: boolean;
  errors: GoalValidationError[];
  warnings: GoalValidationError[];
}

// Export/Import Types
export interface GoalExportFormat {
  version: string;
  exportedAt: number;
  agentId: string;
  hierarchy: GoalHierarchy;
  analytics: GoalAnalytics;
}

export interface GoalImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  warnings: string[];
}