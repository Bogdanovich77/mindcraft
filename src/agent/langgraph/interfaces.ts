/**
 * Core TypeScript interfaces for the Mindcraft LangGraph hybrid agent system
 *
 * This file contains all TypeScript interfaces and type definitions
 * for the agent state structure, supporting both reactive and cognitive
 * components with comprehensive social integration.
 */

import { StateGraph, Annotation } from "@langchain/langgraph";
import { Bot } from "mineflayer";
import { AntiIdleSystem } from "../cognitive/anti_idle_system";

// Basic Types
export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface InventoryItem {
  type: string;
  count: number;
  name?: string;
  metadata?: any;
}

export interface Entity {
  name?: string;
  position: Position;
  type: string;
  distance?: number;
  health?: number;
  hostile?: boolean;
  // Add id property for compatibility
  id?: string;
}

export interface Block {
  type: string;
  position: Position;
  distance?: number;
  // Add accessible property for compatibility
  accessible?: boolean;
}

export interface Inventory {
  items: InventoryItem[];
  slots: number;
  usedSlots: number;
  // Add find method for compatibility
  filter?: (item: InventoryItem) => boolean;
  // Add length property
  length: number;
}

export interface Equipment {
  helmet?: InventoryItem | undefined;
  chestplate?: InventoryItem | undefined;
  leggings?: InventoryItem | undefined;
  boots?: InventoryItem | undefined;
  weapon?: InventoryItem | undefined;
  tool?: InventoryItem;
}

// World Context
export interface WorldContext {
  position: Vector3D;
  health: number;
  food: number;
  experience: number;
  nearbyEntities: EntityInfo[];
  nearbyBlocks: BlockInfo[];
  inventory: Inventory;
  equipment: Equipment;
  timeOfDay: number;
  weather: string;
  dimension: string;
  biome?: string;
  lightLevel?: number;
  temperature?: number;
  dangerLevel?: number;
}

export interface MessageInfo {
  source: string;
  message: string;
  timestamp: number;
  type: string;
  priority: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

// Personality Traits
export interface PersonalityTraits {
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
  // Add missing properties for compatibility
  explorationDrive: number;
  socialTendency: number;
  buildingCreativity: number;
  combatAggression: number;
}

export interface Motivation {
  id: string;
  type: string;
  strength: number;         // 0-1
  satisfaction: number;      // 0-1
  priority: number;         // 1-10
}

export interface MotivationState {
  motivations: Motivation[];
  primaryMotivation: string;
}

export interface Value {
  id: string;
  name: string;
  importance: number;       // 0-1
  priority: number;         // 1-10
}

export interface PurposeState {
  identity: {
    name: string;
    role: string;
    background: string;
    corePurpose: string;
  };
  personality: PersonalityTraits;
  motivations: Motivation[];
  values: Value[];
  ethics: {
    harmAvoidance: number;
    fairness: number;
    loyalty: number;
    authority: number;
    purity: number;
  };
}

// Skills and Goals
export interface LearningMetrics {
  totalSessions: number;
  averageDuration: number;
  successRate: number;
  recentGains: number;
  plateauRisk: number;
}

export interface LearningState {
  currentSession?: LearningSession;
  history: LearningSession[];
  metrics: LearningMetrics;
  learningRate: number;
  adaptiveFactor: number;
}

export interface SkillProgression {
  level: number;
  experience: number;
  progressToNext: number;
  totalExperience: number;
  lastLevelUp: number;
}

export interface SkillGain {
  skillType: SkillType;
  amount: number;
  source: ExperienceSource;
  timestamp: number;
}

export interface AdaptiveLearningState {
  personalityInfluence: number;
  socialInfluence: number;
  environmentalInfluence: number;
  recentAdaptations: string[];
}

export interface SkillsState {
  skills: Map<string, Skill>;
  learning: LearningState;
  progression: SkillProgression;
  totalExperience: number;
  recentGains: SkillGain[];
  skillSynergies: Map<string, string[]>;
  adaptiveLearning: AdaptiveLearningState;
}

export interface FeasibilityFactor {
  factor: string;
  score: number;
  weight: number;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  improvements?: string[];
  criticalFactors?: string[];
}

export interface GoalPerformanceMetrics {
  completionRate: number;
  averageCompletionTime: number;
  successRate: number;
  totalGoals: number;
  activeGoals: number;
}

export interface LearningOutcome {
  type: string;
  effectiveness: number;
  retention: number;
  transferability: number;
}

export interface Skill {
  type: string;
  proficiency: {
    overall: number;         // 0-1
    knowledge: number;       // 0-1
    practical: number;       // 0-1
    creative: number;         // 0-1
  };
  experience: number;
  level: number;
  components: {
    knowledge: number;
    practical: number;
    creative: number;
  };
  learning: {
    rate: number;
    plateau: boolean;
    breakthrough: boolean;
  };
  usage: {
    frequency: number;
    success: number;
    efficiency: number;
    recentUses?: number[];
    totalUses?: number;
    successfulUses?: number;
    averageExecutionTime?: number;
  };
}

export interface Goal {
  id: string;
  type: 'strategic' | 'tactical' | 'operational' | 'social' | 'collaborative' | 'crafting' | 'exploration' | 'mining' | 'building';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'active' | 'completed' | 'failed' | 'paused';
  description: string;
  createdAt: number;
  updatedAt: number;
  dependencies: string[];
  resources: {
    required: ResourceRequirement[];
    allocated: ResourceRequirement[];
    // Add items property for compatibility
    items?: ResourceRequirement[];
    // Add tools property for compatibility
    tools?: ResourceRequirement[];
    // Add missing properties
    assistance?: ResourceRequirement[];
    location?: Position;
  };
  progress: {
    current: number;
    target: number;
    percentage: number;
    // Add completedSteps property for compatibility
    completedSteps?: number;
  };
  // Add missing properties for compatibility
  deadline?: number;
  memberIds?: string[];
  isAntiIdle?: boolean;
}

export interface SkillRequirement {
  type: string;
  minProficiency: number;
  importance?: number;
}

export interface ResourceRequirement {
  type: string;
  amount: number;
  priority?: number;
}

// Memory Systems
export interface SemanticConcept {
  id: string;
  name: string;
  type: 'context' | 'location' | 'entity' | 'property' | 'schema' | 'procedure' | 'temporal' | string;
  activation: number;
  attributes: Record<string, any>;
  relationships: SemanticRelationship[];
  lastAccessed: number;
  importance: number;
  category?: string;
  properties?: Record<string, any>;
}

export interface SemanticRelationship {
  sourceId: string;
  targetId: string;
  type: string;
  strength: number;
  context: string;
}

export interface EpisodicEvent {
  id: string;
  timestamp: number;
  duration: number;
  location: Position;
  participants: string[];
  actions: ActionRecord[];
  outcomes: any[];
  emotionalImpact: number;
  importance: number;
  tags: string[];
}

export interface ActionRecord {
  actor: string;
  action: string;
  target: string;
  timestamp: number;
  result: any;
}

export interface ProceduralSkill {
  id: string;
  name: string;
  type: string;
  sequence: ProceduralStep[];
  conditions: any[];
  outcomes: any[];
  proficiency: number;
  usageCount: number;
  lastUsed: number;
  adaptations: ProceduralAdaptation[];
}

export interface ProceduralStep {
  id: string;
  action: string;
  parameters: any;
  conditions: any[];
  expectedOutcome: any;
  // Add missing properties for compatibility
  duration?: number;
  requiredSkills?: string[];
  requiredResources?: ResourceRequirement[];
}

export interface ProceduralAdaptation {
  context: string;
  modification: any;
  successRate: number;
  timestamp: number;
  // Add performance property for compatibility
  performance?: {
    successRate: number;
    executionTime: number;
    errorRate: number;
  };
}

export interface WorkingMemoryState {
  currentFocus: string;
  activeTasks: string[];
  conversationContext: any;
  buffer: WorkingMemoryItem[];
  capacity: number;
  utilization: number;
  // Add items property for compatibility
  items?: WorkingMemoryItem[];
  // Add decayRate property for compatibility
  decayRate?: number;
}

export interface WorkingMemoryItem {
  content: any;
  type: string;
  timestamp: number;
  priority: number;
  decayRate: number;
  // Add id property for compatibility
  id?: string;
}

export interface MemoryQuery {
  type: 'semantic' | 'episodic' | 'procedural' | 'working';
  criteria: any;
  limit?: number;
  relevanceThreshold?: number;
  // Add missing properties for compatibility
  query?: string;
  types?: string[];
  filters?: any;
  importance?: number;
}

export interface MemoryRetrieval {
  results: {
    semantic?: SemanticConcept[];
    episodic?: EpisodicEvent[];
    procedural?: ProceduralSkill[];
    working?: WorkingMemoryItem[];
  };
  confidence: number;
  processingTime: number;
  query: MemoryQuery;
  semantic?: {
    concepts: SemanticConcept[];
    confidence: number;
  };
  episodic?: {
    events: EpisodicEvent[];
    confidence: number;
  };
  procedural?: {
    skills: ProceduralSkill[];
    confidence: number;
  };
  working?: {
    items: WorkingMemoryItem[];
    confidence: number;
  };
}

export interface MemoryStatistics {
  totalMemories: number;
  memoryTypes: Record<string, number>;
  averageActivation: number;
  lastConsolidation: number;
  episodic: number;
  // Add semantic property for compatibility
  semantic?: any;
}

// Memory System
export interface MemoryState {
  semantic: {
    concepts: Map<string, SemanticConcept>;
    facts: Map<string, any>;
    relationships: Map<string, SemanticRelationship>;
  };
  episodic: {
    episodes: EpisodicEvent[];
    conversations: any[];
    experiences: any[];
  };
  procedural: {
    skills: Map<string, ProceduralSkill>;
    procedures: Map<string, any>;
    habits: Map<string, any>;
  };
  working: WorkingMemoryState;
}

// Processing State
export interface ProcessingState {
  currentPhase: ProcessingPhase;
  cognitiveLoad: number;     // 0-1
  attentionLevel: number;     // 0-1
  processingHistory: ProcessingRecord[];
  // Add decisionThreshold property for compatibility
  decisionThreshold?: number;
}

export enum ProcessingPhase {
  PERCEPTION = 'perception',
  ANALYSIS = 'analysis',
  PLANNING = 'planning',
  DECISION = 'decision',
  EXECUTION = 'execution',
  REFLECTION = 'reflection',
  CONVERSATION = 'conversation',
  COORDINATION = 'coordination'
}

export interface ProcessingRecord {
  phase: ProcessingPhase;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  details: any;
}

// Reactive State
export interface ReactiveState {
  activeMode: string;
  emergencyLevel: number;
  emergencyConditions: EmergencyCondition[];
  lastReactiveAction: ReactiveAction | null;
  interruptHistory: InterruptEvent[];
}

export interface EmergencyCondition {
  type: string;
  severity: number;
  timestamp: number;
  context: any;
  // Add missing properties for compatibility
  detectedAt?: number;
  position?: Position;
}

export interface ReactiveAction {
  mode: string;
  priority: number | InterruptPriority; // Allow both types for compatibility
  timestamp: number;
  context: any;
  action: string;
  result: string;
}

export interface InterruptEvent {
  timestamp: number;
  priority: InterruptPriority;
  source: string;
  context: any;
  action: string;
  // Add missing properties for compatibility
  type?: string;
  bypassedCognitive?: boolean;
}

export enum InterruptPriority {
  EMERGENCY = 'emergency',
  SURVIVAL = 'survival',
  OPPORTUNITY = 'opportunity',
  COGNITIVE = 'cognitive'
}

// Executive State
export interface ExecutiveState {
  currentAction: Action | null;
  actionQueue: Action[];
  decisionHistory: DecisionRecord[];
  performanceMetrics: PerformanceMetrics;
  conversationalResponse?: string;
  lastResponse?: ResponseRecord;
  responseHistory: ResponseRecord[];
  processingMode: 'conversational' | 'action';
  decisionContext?: DecisionContext;
}

export interface Action {
  id: string;
  type: string;
  priority: number;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  createdAt: number;
  startTime?: number;
  endTime?: number;
  result?: any;
  cognitive?: boolean;
  metadata?: any;
}

export interface DecisionRecord {
  timestamp: number;
  context: any;
  options: any[];
  selected: string;
  reasoning: string;
  outcome: string;
  confidence: number;
}

export interface PerformanceMetrics {
  reactiveResponseTime: number[];
  cognitiveProcessingTime: number[];
  successRate: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  // Add learningRate property for compatibility
  learningRate?: number;
}

export interface ResponseRecord {
  source: string;
  message: string;
  response: string;
  timestamp: number;
  processingMode: 'conversational' | 'action';
  responseTime: number;
  success: boolean;
}

// Social State
export interface SocialState {
  relationships: Map<string, Relationship>;
  reputation: Reputation;
  socialContext: SocialContext;
  theoryOfMind: Map<string, MentalModel>;
  // Add missing properties for compatibility
  agentId?: string;
  trustLevels?: Map<string, number>;
  mentalModels?: Map<string, MentalModel>;
  nearbyAgents: string[];
}

export interface Relationship {
  agentId: string;
  trustLevel: number;        // 0-1
  friendshipScore: number;   // 0-1
  respectLevel: number;       // 0-1
  interactionHistory: InteractionEvent[];
  lastInteraction: number;
  status: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'ally' | 'enemy';
  reputationScore?: number;
}

export interface Reputation {
  globalScore: number;       // -1 to 1
  factionScores: Map<string, number>;
  traitScores: Map<string, number>;
  recentEvents: ReputationEvent[];
  reputationScore: number;
}

export interface SocialContext {
  currentSituation: any;
  nearbyAgents: string[];
  socialNorms: string[];
  culturalContext: string;
  groupDynamics: any;
}

export interface MentalModel {
  agentId: string;
  personality: PersonalityTraits;
  intentions: IntentionPrediction[];
  emotions: EmotionalState;
  capabilities: Skill[];
  beliefs: Map<string, any>;
  lastUpdated: number;
  // Add updateMentalModel method for compatibility
  updateMentalModel?(agentId: string, updates: any): void;
}

export interface InteractionEvent {
  timestamp: number;
  type: string;
  outcome: string;
  impact: number;
  context: any;
}

export interface ReputationEvent {
  timestamp: number;
  type: string;
  impact: number;
  source: string;
  description: string;
}

export interface IntentionPrediction {
  intention: string;
  confidence: number;
  timeframe: number;
  context: any;
}

export interface EmotionalState {
  current: string;
  intensity: number;
  valence: number;          // -1 to 1 (negative to positive)
  arousal: number;          // 0-1 (calm to excited)
  lastUpdated: number;
}

// Planning Engine Types
export interface Plan {
  id: string;
  name: string;
  description: string;
  goalId: string;
  steps: PlanStep[];
  estimatedDuration: number;
  requiredResources: ResourceRequirement[];
  requiredSkills: SkillRequirement[];
  feasibilityScore: number;
  priority: number;
  status: PlanStatus;
  createdAt: number;
  updatedAt: number;
  // Add missing properties for compatibility
  type?: string;
  deadline?: number;
  dependencies?: string[];
  resourceRequirements?: {
    items: Record<string, number>;
  };
  feasibilityLevel?: FeasibilityLevel;
  riskLevel?: RiskLevel;
  riskAnalysis?: RiskAnalysis;
  resourceAssessment?: ResourceAssessment;
  timeEstimate?: TimeEstimate;
  costEstimate?: CostEstimate;
  alternativePlans?: AlternativePlan[];
}

export interface PlanStep {
  id: string;
  type: string;
  description: string;
  estimatedDuration: number;
  resourceRequirements: ResourceRequirement[];
  dependencies: string[];
  status: 'pending' | 'active' | 'completed' | 'failed';
  // Add missing properties for compatibility
  requiredSkills?: SkillRequirement[];
  requiredResources?: ResourceRequirement[];
}

export interface ResourceAllocation {
  items: Map<string, number>;
  tools: Map<string, number>;
  time: number;
  skills: SkillRequirement[];
  assistance: Map<string, number>;
}

export interface BlockingFactor {
  type: string;
  description: string;
  severity: number | 'critical' | 'high' | 'medium' | 'low';
  mitigation?: string;
  // Add missing properties for compatibility
  estimatedDelay?: number;
  mitigationStrategies?: string[];
}

export interface FeasibilityAnalysisResult {
  feasible: boolean;
  score: number;
  confidence: number;
  factors: FeasibilityFactor[];
  risks: RiskAssessment[];
  recommendations: string[];
  alternatives?: AlternativePlan[];
  planId?: string;
  analysisTime?: number;
}

export enum FeasibilityLevel {
  IMPOSSIBLE = 'impossible',
  VERY_DIFFICULT = 'very_difficult',
  DIFFICULT = 'difficult',
  MODERATE = 'moderate',
  EASY = 'easy',
  TRIVIAL = 'trivial',
  // Add missing values for compatibility
  VERY_HIGH = 'very_high',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  VERY_LOW = 'very_low'
}

export enum PlanStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum DelegationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Fix RiskLevel to be a union type that includes numbers
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical' | number;

export interface RiskAssessment {
  type: string;
  level: RiskLevel;
  description: string;
  mitigation?: string;
}

export interface RiskAnalysis {
  overallRisk: number;
  criticalRisks: RiskFactor[];
  mitigatedRisks: RiskFactor[];
  residualRisk: number;
}

export interface RiskFactor {
  factor: string;
  probability: number;
  impact: number;
  description: string;
  mitigation: MitigationStrategy;
}

export interface MitigationStrategy {
  strategy: string;
  effectiveness: number;
  cost: number;
  description: string;
}

export interface ResourceAssessment {
  availableResources: Map<string, number>;
  requiredResources: Map<string, number>;
  deficitResources: Map<string, number>;
  totalValue: number;
  accessibility: number;
}

export interface TimeEstimate {
  min?: number;
  max?: number;
  confidence?: number;
  minimumTime?: number;
  maximumTime?: number;
  expectedTime?: number;
  factors?: string[];
}

export interface CostEstimate {
  min?: number;
  max?: number;
  confidence?: number;
  resourceCost?: number;
  timeCost?: number;
  opportunityCost?: number;
  totalCost?: number;
  currency?: string;
}

export interface AlternativePlan {
  id: string;
  description: string;
  feasibilityScore: number;
  riskLevel: RiskLevel;
  timeEstimation: number;
  cost: number;
  blockingFactors: BlockingFactor[];
}

// Planning Engine Configuration
export interface PlanningEngineConfig {
  maxActivePlans: number;
  planningTimeout: number;
  resourceAssessmentInterval: number;
  feasibilityCheckInterval: number;
  replanningThreshold: number;
  optimizationInterval: number;
  enableResourceSharing: boolean;
  enableCollaborativePlanning: boolean;
  performanceTracking: boolean;
}

// Feasibility Analyzer Configuration
export interface FeasibilityAnalyzerConfig {
  analysisTimeout: number;
  maxHistorySize: number;
  enableRiskAnalysis: boolean;
  enableAlternativeGeneration: boolean;
  confidenceThreshold: number;
  riskTolerance: number;
  timeBuffer: number;
  costBuffer: number;
  minSuccessProbability: number;
  skillWeight: number;
  resourceWeight: number;
  complexityWeight: number;
  riskWeight: number;
  riskFactors: {
    resource: number;
    time: number;
    skill: number;
    environmental: number;
    social: number;
  };
}

// Metadata
export interface AgentMetadata {
  agentId: string;
  startTime: number;
  lastUpdate: number;
  version: string;
  performanceMode: string;
}

// Main Agent State
export interface AgentState {
  context: WorldContext;
  reactive: ReactiveState;
  cognitive: {
    purpose: PurposeState;
    goals: {
      strategicGoals: Goal[];
      tacticalGoals: Goal[];
      operationalGoals: Goal[];
      activeGoals: Goal[];
      goalHistory: Goal[];
    };
    skills: SkillsState;
    memory: MemoryState;
    processing: ProcessingState;
    planning?: PlanningEngine;
    social: SocialState;
  };
  executive: ExecutiveState;
  metadata: AgentMetadata;
  antiIdleSystem?: AntiIdleSystem;
  multiAgentCoordinator?: any;
}

// Planning Engine Interface
export interface PlanningEngine {
  initialize(state: AgentState): Promise<void>;
  executePlanningCycle(state: AgentState): Promise<any>;
  getMetrics(): any;
  shutdown(): Promise<void>;
  activePlans?: Plan[];
}

// Extended types for memory systems
export interface ExtendedEpisodicEvent extends EpisodicEvent {
  importance: number;
  id: string;
  timestamp: number;
  location: Position;
  participants: string[];
  duration: number;
}

export interface ExtendedProceduralSkill extends ProceduralSkill {
  id: string;
  sequence: ProceduralStep[];
}

// Additional interfaces for coordination and social systems
export interface AgentAction {
  id: string;
  type: string;
  priority: number;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  createdAt: number;
  startTime?: number;
  endTime?: number;
  result?: any;
  cognitive?: boolean;
  metadata?: any;
}

export interface DecisionOption {
  id: string;
  description: string;
  utility: number;
  risk: number;
  confidence: number;
  reasoning: string;
}

export interface DecisionContext {
  situation: any;
  options: DecisionOption[];
  constraints: any;
  priorities: any;
  urgency?: number;
}

export interface GoalPrioritizationContext {
  agentState: AgentState;
  decisionContext: DecisionContext;
  // Add other context properties as needed
}

export interface MessageType {
  id: string;
  type: string;
  priority: number;
  content: any;
}

export interface MessagePriority {
  LOW: 'low';
  MEDIUM: 'medium';
  HIGH: 'high';
  CRITICAL: 'critical';
}

export interface CoordinationStatus {
  status: 'active' | 'inactive' | 'busy' | 'available';
  currentTask?: string;
  availability: number;
}

export interface CoordinationMessage {
  id: string;
  senderId: string;
  receiverId: string;
  type: string;
  content: any;
  timestamp: number;
  priority: MessagePriority;
}

export interface CollaborationRequest {
  id: string;
  requesterId: string;
  targetId: string;
  task: any;
  requirements: any;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
}

export interface TaskDelegation {
  id: string;
  delegatorId: string;
  delegateeId: string;
  taskId: string;
  title: string;
  description: string;
  priority: MessagePriority;
  requirements: {
    skills: string[];
    resources: string[];
    trustLevel: number;
    timeEstimate: number;
  };
  status: DelegationStatus;
  deadline: number | undefined;
  createdAt: number;
  updatedAt: number;
}

export interface ConflictDetection {
  conflicts: any[];
  severity: number;
  resolution: any;
}

export interface NegotiationProcess {
  id: string;
  participants: string[];
  issue: any;
  status: 'active' | 'resolved' | 'failed';
  startTime: number;
  endTime?: number;
}

export interface MediationProcess {
  id: string;
  mediatorId: string;
  disputants: string[];
  conflict: any;
  status: 'active' | 'resolved' | 'failed';
  startTime: number;
  endTime?: number;
}

export interface CoordinationMetrics {
  collaborations: {
    offered: number;
    accepted: number;
    completed: number;
    averageSessionTime: number;
    satisfactionRate: number;
    complianceRate: number;
    failed?: number;
  };
  conflicts: {
    detected: number;
    resolved: number;
    escalated: number;
  };
  communications: {
    sent: number;
    received: number;
    responseTime: number;
  };
}

export interface MultiAgentCoordinator {
  initialize(config: any): void;
  shutdown(): void;
  sendMessage(message: CoordinationMessage): void;
  requestCollaboration(request: CollaborationRequest): void;
  detectConflict(conflict: ConflictDetection): void;
  initiateNegotiation(negotiation: NegotiationProcess): void;
  initiateMediation(mediation: MediationProcess): void;
  getMetrics(): CoordinationMetrics;
}

export interface MessageAnalysis {
  type: 'conversational' | 'action';
  priority: MessagePriority;
  content: any;
  context: any;
}

export interface ConversationProcessingResult {
  response: string;
  confidence: number;
  processingTime: number;
  metadata: any;
}

// Additional interfaces for reactive behavior
export interface ReactiveMode {
  name: string;
  priority: number;
  conditions: any;
  behaviors: any;
}

export interface ReactiveBehaviorLayer {
  name: string;
  modes: ReactiveMode[];
  activeMode: string;
  interruptController: InterruptController;
}

export interface InterruptController {
  checkInterrupts(state: AgentState): InterruptEvent[];
  handleInterrupt(event: InterruptEvent): void;
  getHistory(): InterruptEvent[];
}

export interface Agent {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  processMessage(message: any): Promise<any>;
  getState(): AgentState;
}

// Additional interfaces for skills and goals
export interface SkillState {
  skills: Map<string, Skill>;
  experience: number;
  learningRate: number;
  skillSynergies: Map<string, any>;
}

export interface GoalState {
  activeGoals: Goal [];
  completedGoals: Goal [];
  failedGoals: Goal [];
  currentGoal?: Goal;
  strategicGoals: Goal [];
  tacticalGoals: Goal [];
  operationalGoals: Goal [];
}

export interface GoalProgress {
  current: number;
  target: number;
  percentage: number;
  completedSteps?: number;
}

// Additional interfaces for cognitive components
export interface BlockInfo {
  type: string;
  position: Position;
  distance: number;
  accessible: boolean;
}

export interface EntityInfo {
  id: string;
  type: string;
  position: Position;
  distance: number;
  health?: number;
  hostile?: boolean;
}

export interface SkillProgress {

}

export interface SMProgress {

}

export interface TEDraft {

}

export interface CommandDraft {

}

// Skill types for experience tracking
export enum SkillType {
  COMBAT = 'combat',
  MINING = 'mining',
  BUILDING = 'building',
  CRAFTING = 'crafting',
  FARMING = 'farming',
  EXPLORATION = 'exploration',
  SOCIAL = 'social',
  TRADING = 'trading',
  MAGIC = 'magic',
  SURVIVAL = 'survival'
}

export enum ExperienceSource {
  PRACTICE = 'practice',
  SUCCESS = 'success',
  FAILURE = 'failure',
  TEACHING = 'teaching',
  OBSERVATION = 'observation',
  EXPERIMENTATION = 'experimentation',
  SOCIAL = 'social',
  BREAKTHROUGH = 'breakthrough'
}

export interface ExperienceContext {
  situation: string;
  location: Position;
  participants: string[];
  difficulty: number;
  success: boolean;
  quality: number;
}

export interface LearningSession {
  id: string;
  skillType: SkillType;
  startTime: number;
  endTime?: number;
  duration: number;
  experienceGained: number;
  methods: LearningMethod[];
  context: ExperienceContext;
  outcomes: LearningOutcome[];
  insights: string[];
}

export enum LearningMethod {
  PRACTICE = 'practice',
  INSTRUCTION = 'instruction',
  OBSERVATION = 'observation',
  EXPERIMENTATION = 'experimentation',
  SOCIAL_LEARNING = 'social_learning',
  TRIAL_AND_ERROR = 'trial_and_error'
}

export interface ExperienceEvent {
  id: string;
  skillType: SkillType;
  amount: number;
  source: ExperienceSource;
  context: ExperienceContext;
  timestamp: number;
  impact: number;
  success: boolean;
  quality: number;
}

// Extended interfaces for planning and feasibility
export interface FeasibilityResult {
  planId?: string;
  overallFeasibility: number;
  successProbability: number;
  isFeasible: boolean;
  timeEstimate: TimeEstimate;
  costEstimate: CostEstimate;
  riskAnalysis: RiskAnalysis;
  skillFeasibility: FeasibilityFactor;
  resourceFeasibility: FeasibilityFactor;
  complexityFeasibility: FeasibilityFactor;
  recommendations: string[];
  analyzedAt: number;
  analysisTime: number;
}

// Missing interfaces for Goal Prioritization
export interface ValueHierarchy {
  coreValues: Value[];
  priorityMap: Map<string, number>;
}

export interface EthicalFramework {
  principles: string[];
  rules: string[];
  filters: Map<string, number>;
}

export interface ProficiencyMetrics {
  averageProficiency: number;
  highestProficiency: number;
  lowestProficiency: number;
}

export interface UsageStatistics {
  totalUsage: number;
  recentUsage: number;
  successRate: number;
  errorRate: number;
}

export interface GoalExecutionContext {
  currentStep: number;
  status: 'running' | 'paused' | 'error';
  startTime: number;
  lastUpdate: number;
  agentState: AgentState;
  decisionContext: DecisionContext;
}

export interface GoalDependency {
  goalId: string;
  status: 'pending' | 'completed';
}

export interface RankedGoal extends Goal {
  priorityScore: number;
  factors: PrioritizationFactors;
  rank: number;
}

export interface PrioritizationFactors {
  urgency: number;
  valueAlignment: number;
  feasibility: number;
  socialImpact: number;
  skillAlignment: number;
  urgencyWeight?: number;
  importanceWeight?: number;
  feasibilityWeight?: number;
  resourceWeight?: number;
  alignmentWeight?: number;
}

export enum GoalType {
  STRATEGIC = 'strategic',
  TACTICAL = 'tactical',
  OPERATIONAL = 'operational',
  SOCIAL = 'social',
  COLLABORATIVE = 'collaborative'
}

export interface GoalPrioritizationResult {
  rankedGoals: RankedGoal[];
  processingTime: number;
}

// LangGraph State Annotation
export const AgentStateAnnotation = Annotation.Root({
  context: Annotation<WorldContext>,
  reactive: Annotation<ReactiveState>,
  cognitive: Annotation<any>,
  executive: Annotation<ExecutiveState>,
  metadata: Annotation<AgentMetadata>,
  antiIdleSystem: Annotation<AntiIdleSystem>,
  multiAgentCoordinator: Annotation<any>
});
