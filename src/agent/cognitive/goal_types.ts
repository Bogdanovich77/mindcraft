import { AgentState, DecisionContext } from '../langgraph/interfaces.js';
import { PersonalityTraits } from './personality.js';
import { MotivationSystem } from './motivations.js';

/**
 * Goal hierarchy levels
 */
export enum GoalLevel {
  STRATEGIC = 'strategic',   // Long-term life objectives
  TACTICAL = 'tactical',     // Medium-term objectives
  OPERATIONAL = 'operational' // Short-term actionable tasks
}

/**
 * Goal status tracking
 */
export enum GoalStatus {
  PENDING = 'pending',       // Not yet started
  ACTIVE = 'active',         // Currently being executed
  PAUSED = 'paused',         // Temporarily suspended
  COMPLETED = 'completed',   // Successfully finished
  FAILED = 'failed',         // Failed to complete
  CANCELLED = 'cancelled',   // Explicitly cancelled
  BLOCKED = 'blocked'        // Blocked by dependencies
}

/**
 * Goal priority levels
 */
export enum GoalPriority {
  CRITICAL = 0,    // Must complete immediately
  HIGH = 1,        // Very important
  MEDIUM = 2,      // Normal priority
  LOW = 3,         // Nice to have
  BACKGROUND = 4   // Long-term background goal
}

/**
 * Goal dependency types
 */
export enum DependencyType {
  PREREQUISITE = 'prerequisite',   // Must be completed first
  ENABLES = 'enables',             // Enables this goal
  CONFLICTS = 'conflicts',         // Conflicts with this goal
  SUPPORTS = 'supports',           // Supports completion
  REQUIRES = 'requires'            // Requires this resource/goal
}

/**
 * Goal dependency relationship
 */
export interface GoalDependency {
  goalId: string;
  type: DependencyType;
  strength: number; // 0-1, strength of relationship
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
  percentage: number; // 0-100
  milestones: Milestone[];
  quality: QualityMetrics;
  timeSpent: number; // milliseconds
  lastUpdate: number; // timestamp
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
  weight: number; // relative importance for progress calculation
}

/**
 * Quality metrics for goal completion
 */
export interface QualityMetrics {
  efficiency: number; // 0-1, resource usage efficiency
  effectiveness: number; // 0-1, goal achievement quality
  elegance: number; // 0-1, style/creativity metrics
  learning: number; // 0-1, knowledge/skill gained
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
  accessibility: number; // 0-1, how easy to access
  location?: { x: number; y: number; z: number };
}

/**
 * Environmental condition affecting goals
 */
export interface EnvironmentalCondition {
  type: 'weather' | 'time' | 'location' | 'danger' | 'opportunity';
  severity: number; // 0-1, impact severity
  duration: number; // milliseconds, how long it lasts
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
  trust: number; // 0-1
  influence: number; // 0-1
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
  commitment: number; // 0-1
}

/**
 * Social obligation
 */
export interface SocialObligation {
  type: 'promise' | 'debt' | 'favor' | 'responsibility';
  toAgent: string;
  description: string;
  urgency: number; // 0-1
  dueDate?: number;
}

/**
 * Reputation metrics
 */
export interface ReputationMetrics {
  overall: number; // 0-1
  reliability: number; // 0-1
  skillfulness: number; // 0-1
  friendliness: number; // 0-1
  danger: number; // 0-1
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
  
  // Goal content
  objective: string; // Clear, measurable objective
  successCriteria: string[]; // Conditions for completion
  
  // Temporal aspects
  createdAt: number;
  deadline?: number;
  estimatedDuration?: number; // milliseconds
  
  // Dependencies and relationships
  dependencies: GoalDependency[];
  subgoals: string[]; // IDs of subgoals
  parentGoal?: string; // ID of parent goal
  
  // Resources
  requirements: ResourceRequirement[];
  allocatedResources: ResourceAllocation[];
  
  // Progress and execution
  progress: GoalProgress;
  executionPlan?: ExecutionPlan;
  
  // Cognitive aspects
  motivationSource?: string; // Which motivation triggered this goal
  personalityAlignment: number; // 0-1, how well it fits personality
  ethicalScore: number; // 0-1, ethical compliance
  
  // Learning and adaptation
  expectedLearning: LearningOutcome[];
  actualLearning?: LearningOutcome[];
  
  // Metadata
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
  efficiency: number; // 0-1, allocation efficiency
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
  dependencies: string[]; // step IDs
  requiredSkills: string[];
  requiredResources: ResourceRequirement[];
  status: 'pending' | 'active' | 'completed' | 'failed';
}

/**
 * Contingency plan for execution
 */
export interface ContingencyPlan {
  trigger: string; // condition that triggers this plan
  alternativeSteps: ExecutionStep[];
  probability: number; // 0-1, likelihood of needing this
}

/**
 * Expected learning outcomes
 */
export interface LearningOutcome {
  type: 'skill' | 'knowledge' | 'experience' | 'relationship';
  area: string;
  expectedGain: number; // 0-1
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
  confidence: number; // 0-1
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
  value: number; // 0-1, overall value achieved
}

/**
 * Resource usage tracking
 */
export interface ResourceUsage {
  type: string;
  name: string;
  planned: number;
  actual: number;
  efficiency: number; // 0-1
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