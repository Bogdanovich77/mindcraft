import { AgentState, DecisionContext } from '../langgraph/interfaces.js';
/**
 * Goal hierarchy levels
 */
export declare enum GoalLevel {
    STRATEGIC = "strategic",// Long-term life objectives
    TACTICAL = "tactical",// Medium-term objectives
    OPERATIONAL = "operational"
}
/**
 * Goal status tracking
 */
export declare enum GoalStatus {
    PENDING = "pending",// Not yet started
    ACTIVE = "active",// Currently being executed
    PAUSED = "paused",// Temporarily suspended
    COMPLETED = "completed",// Successfully finished
    FAILED = "failed",// Failed to complete
    CANCELLED = "cancelled",// Explicitly cancelled
    BLOCKED = "blocked"
}
/**
 * Goal priority levels
 */
export declare enum GoalPriority {
    CRITICAL = 0,// Must complete immediately
    HIGH = 1,// Very important
    MEDIUM = 2,// Normal priority
    LOW = 3,// Nice to have
    BACKGROUND = 4
}
/**
 * Goal dependency types
 */
export declare enum DependencyType {
    PREREQUISITE = "prerequisite",// Must be completed first
    ENABLES = "enables",// Enables this goal
    CONFLICTS = "conflicts",// Conflicts with this goal
    SUPPORTS = "supports",// Supports completion
    REQUIRES = "requires"
}
/**
 * Goal dependency relationship
 */
export interface GoalDependency {
    goalId: string;
    type: DependencyType;
    strength: number;
    description?: string;
}
/**
 * Resource requirements for goals
 */
export interface ResourceRequirement {
    type: 'item' | 'tool' | 'skill' | 'time' | 'location' | 'energy';
    name: string;
    quantity: number;
    quality?: number;
    consumable: boolean;
    alternative?: ResourceRequirement[];
}
/**
 * Goal progress tracking
 */
export interface GoalProgress {
    percentage: number;
    milestones: Milestone[];
    quality: QualityMetrics;
    timeSpent: number;
    lastUpdate: number;
}
/**
 * Milestone for progress tracking
 */
export interface Milestone {
    id: string;
    name: string;
    description: string;
    completed: boolean;
    completedAt?: number;
    weight: number;
}
/**
 * Quality metrics for goal completion
 */
export interface QualityMetrics {
    efficiency: number;
    effectiveness: number;
    elegance: number;
    learning: number;
}
/**
 * Goal execution context
 */
export interface GoalExecutionContext {
    agentState: AgentState;
    decisionContext: DecisionContext;
    availableResources: AvailableResource[];
    environmentalConditions: EnvironmentalCondition[];
    socialContext: SocialContext;
}
/**
 * Available resource snapshot
 */
export interface AvailableResource {
    type: string;
    name: string;
    quantity: number;
    quality: number;
    accessibility: number;
    location?: {
        x: number;
        y: number;
        z: number;
    };
}
/**
 * Environmental condition affecting goals
 */
export interface EnvironmentalCondition {
    type: 'weather' | 'time' | 'location' | 'danger' | 'opportunity';
    severity: number;
    duration: number;
    description: string;
}
/**
 * Social context for goals
 */
export interface SocialContext {
    nearbyAgents: AgentRelationship[];
    activeCollaborations: Collaboration[];
    socialObligations: SocialObligation[];
    reputation: ReputationMetrics;
}
/**
 * Relationship with another agent
 */
export interface AgentRelationship {
    agentId: string;
    relationship: 'ally' | 'neutral' | 'enemy' | 'stranger' | 'friend';
    trust: number;
    influence: number;
    lastInteraction: number;
}
/**
 * Active collaboration
 */
export interface Collaboration {
    collaborationId: string;
    goalId: string;
    partners: string[];
    role: 'leader' | 'contributor' | 'supporter';
    commitment: number;
}
/**
 * Social obligation
 */
export interface SocialObligation {
    type: 'promise' | 'debt' | 'favor' | 'responsibility';
    toAgent: string;
    description: string;
    urgency: number;
    dueDate?: number;
}
/**
 * Reputation metrics
 */
export interface ReputationMetrics {
    overall: number;
    reliability: number;
    skillfulness: number;
    friendliness: number;
    danger: number;
}
/**
 * Core goal interface
 */
export interface Goal {
    id: string;
    name: string;
    description: string;
    level: GoalLevel;
    status: GoalStatus;
    priority: GoalPriority;
    objective: string;
    successCriteria: string[];
    createdAt: number;
    deadline?: number;
    estimatedDuration?: number;
    dependencies: GoalDependency[];
    subgoals: string[];
    parentGoal?: string;
    requirements: ResourceRequirement[];
    allocatedResources: ResourceAllocation[];
    progress: GoalProgress;
    executionPlan?: ExecutionPlan;
    motivationSource?: string;
    personalityAlignment: number;
    ethicalScore: number;
    expectedLearning: LearningOutcome[];
    actualLearning?: LearningOutcome[];
    tags: string[];
    category: string;
    source: 'system' | 'user' | 'agent' | 'social';
}
/**
 * Resource allocation for a goal
 */
export interface ResourceAllocation {
    requirement: ResourceRequirement;
    allocated: number;
    efficiency: number;
    reservationExpiry?: number;
}
/**
 * Execution plan for goals
 */
export interface ExecutionPlan {
    steps: ExecutionStep[];
    currentStep: number;
    estimatedTimeRemaining: number;
    contingencies: ContingencyPlan[];
}
/**
 * Single execution step
 */
export interface ExecutionStep {
    id: string;
    name: string;
    description: string;
    estimatedDuration: number;
    dependencies: string[];
    requiredSkills: string[];
    requiredResources: ResourceRequirement[];
    status: 'pending' | 'active' | 'completed' | 'failed';
}
/**
 * Contingency plan for execution
 */
export interface ContingencyPlan {
    trigger: string;
    alternativeSteps: ExecutionStep[];
    probability: number;
}
/**
 * Expected learning outcomes
 */
export interface LearningOutcome {
    type: 'skill' | 'knowledge' | 'experience' | 'relationship';
    area: string;
    expectedGain: number;
    actualGain?: number;
}
/**
 * Goal creation request
 */
export interface GoalCreationRequest {
    name: string;
    description: string;
    level: GoalLevel;
    objective: string;
    successCriteria: string[];
    priority?: GoalPriority;
    deadline?: number;
    requirements?: ResourceRequirement[];
    parentGoal?: string;
    motivationSource?: string;
    category?: string;
    tags?: string[];
}
/**
 * Goal update request
 */
export interface GoalUpdateRequest {
    goalId: string;
    updates: Partial<Goal>;
    reason?: string;
}
/**
 * Goal decomposition result
 */
export interface GoalDecompositionResult {
    originalGoal: Goal;
    subgoals: Goal[];
    decompositionStrategy: string;
    confidence: number;
    alternatives: GoalDecompositionResult[];
}
/**
 * Goal prioritization result
 */
export interface GoalPrioritizationResult {
    rankedGoals: RankedGoal[];
    prioritizationFactors: PrioritizationFactors;
    context: DecisionContext;
    timestamp: number;
}
/**
 * Ranked goal with priority score
 */
export interface RankedGoal {
    goal: Goal;
    priorityScore: number;
    rank: number;
    factors: {
        urgency: number;
        importance: number;
        feasibility: number;
        resource: number;
        alignment: number;
    };
    reasoning: string;
}
/**
 * Prioritization factors with weights
 */
export interface PrioritizationFactors {
    urgencyWeight: number;
    importanceWeight: number;
    feasibilityWeight: number;
    resourceWeight: number;
    alignmentWeight: number;
}
/**
 * Goal execution result
 */
export interface GoalExecutionResult {
    goalId: string;
    success: boolean;
    status: GoalStatus;
    outcome: ExecutionOutcome;
    duration: number;
    resourcesUsed: ResourceUsage[];
    learning: LearningOutcome[];
    errors: ExecutionError[];
    nextActions: string[];
}
/**
 * Execution outcome details
 */
export interface ExecutionOutcome {
    completionPercentage: number;
    qualityScore: number;
    unexpectedEvents: string[];
    sideEffects: string[];
    value: number;
}
/**
 * Resource usage tracking
 */
export interface ResourceUsage {
    type: string;
    name: string;
    planned: number;
    actual: number;
    efficiency: number;
}
/**
 * Execution error tracking
 */
export interface ExecutionError {
    type: 'resource' | 'skill' | 'environment' | 'social' | 'system';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: number;
    resolved: boolean;
}
/**
 * Goal system configuration
 */
export interface GoalSystemConfig {
    maxConcurrentGoals: number;
    maxGoalDepth: number;
    prioritizationWeights: PrioritizationFactors;
    decomposeStrategies: string[];
    learningEnabled: boolean;
    socialIntegration: boolean;
    reactiveIntegration: boolean;
    performanceTracking: boolean;
}
//# sourceMappingURL=goal_types.d.ts.map