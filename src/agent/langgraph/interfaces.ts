/**
 * Core TypeScript interfaces for the Mindcraft LangGraph hybrid agent system
 * Defines the complete agent state structure supporting both reactive and cognitive components
 */

import { StateGraph, Annotation } from "@langchain/langgraph";
import { Bot } from "mineflayer";

// ============================================================================
// INTERRUPT PRIORITY SYSTEM
// ============================================================================

export enum InterruptPriority {
  EMERGENCY = 0,    // Life-threatening situations (<50ms)
  SURVIVAL = 1,     // Health/safety threats (<100ms)
  OPPORTUNITY = 2,  // Resource/advantage opportunities (<200ms)
  COGNITIVE = 3     // Planned/goal-directed actions (>500ms)
}

// ============================================================================
// WORLD CONTEXT INTERFACES
// ============================================================================

export interface WorldContext {
  position: { x: number; y: number; z: number };
  health: number;
  food: number;
  experience: number;
  dimension: string;
  timeOfDay: number;
  weather: string;
  nearbyEntities: EntityInfo[];
  nearbyBlocks: BlockInfo[];
  inventory: InventoryItem[];
  equipment: EquipmentInfo;
  lastMessage?: MessageInfo;
}

export interface EntityInfo {
  id: number;
  type: string;
  position: { x: number; y: number; z: number };
  health?: number;
  distance: number;
  hostile: boolean;
}

export interface BlockInfo {
  type: string;
  position: { x: number; y: number; z: number };
  distance: number;
  accessible: boolean;
}

export interface InventoryItem {
  type: string;
  count: number;
  slot: number;
  metadata?: any;
}

export interface EquipmentInfo {
  helmet?: InventoryItem;
  chestplate?: InventoryItem;
  leggings?: InventoryItem;
  boots?: InventoryItem;
  weapon?: InventoryItem;
}

export interface MessageInfo {
  source: string;
  message: string;
  timestamp: number;
  type: 'conversational' | 'command' | 'system';
  priority: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// REACTIVE STATE INTERFACES
// ============================================================================

export interface ReactiveState {
  activeMode: string;
  emergencyConditions: EmergencyCondition[];
  lastReactiveAction?: ReactiveAction;
  interruptHistory: InterruptEvent[];
}

export interface EmergencyCondition {
  type: 'drowning' | 'burning' | 'low_health' | 'hostile_nearby' | 'stuck' | 'falling' | 'pathfinder_stuck';
  severity: number;
  detectedAt: number;
  position: { x: number; y: number; z: number };
}

export interface ReactiveAction {
  mode: string;
  priority: InterruptPriority;
  timestamp: number;
  context: WorldContext;
  action: string;
  result?: 'success' | 'failed' | 'interrupted';
}

export interface InterruptEvent {
  priority: InterruptPriority;
  type: string;
  timestamp: number;
  handled: boolean;
  bypassedCognitive: boolean;
}

// ============================================================================
// COGNITIVE STATE INTERFACES
// ============================================================================

export interface CognitiveState {
  purpose: PurposeState;
  goals: GoalState;
  skills: SkillState;
  memory: MemoryState;
  processing: ProcessingState;
  social: SocialState;
}

export interface PurposeState {
  identity: AgentIdentity;
  personality: PersonalityTraits;
  motivations: MotivationSystem;
  values: ValueHierarchy;
  ethics: EthicalFramework;
}

export interface AgentIdentity {
  name: string;
  role: string;
  background: string;
  corePurpose: string;
}

export interface PersonalityTraits {
  openness: number;        // Big Five traits
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  riskTolerance: number;   // Gaming-specific traits
  explorationDrive: number;
  socialTendency: number;
  buildingCreativity: number;
  combatAggression: number;
}

export interface MotivationSystem {
  primaryMotivation: string;
  secondaryMotivations: string[];
  drives: Record<string, number>;
  satisfactions: Record<string, number>;
}

export interface ValueHierarchy {
  coreValues: string[];
  valuePriorities: Record<string, number>;
  moralConstraints: string[];
}

export interface EthicalFramework {
  harmAvoidance: number;
  fairnessConcern: number;
  loyaltyPriority: number;
  authorityRespect: number;
  purityConcern: number;
}

export interface GoalState {
  strategicGoals: Goal[];
  tacticalGoals: Goal[];
  operationalGoals: Goal[];
  activeGoals: Goal[];
  goalHistory: GoalExecution[];
}

export interface Goal {
  id: string;
  type: "strategic" | "tactical" | "operational";
  description: string;
  priority: number;
  dependencies: string[];
  resources: ResourceRequirements;
  progress: GoalProgress;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'paused';
  createdAt: number;
  deadline?: number;
}

export interface ResourceRequirements {
  items: Record<string, number>;
  tools: string[];
  location?: { x: number; y: number; z: number; radius: number };
  time?: number;
  assistance?: string[];
}

export interface GoalProgress {
  percentage: number;
  completedSteps: string[];
  currentStep?: string;
  blockers: string[];
  estimatedTimeRemaining?: number;
}

export interface GoalExecution {
  goalId: string;
  startTime: number;
  endTime?: number;
  result?: 'success' | 'failed' | 'abandoned';
  lessons: string[];
}

export interface SkillState {
  skills: Record<string, Skill>;
  experience: ExperienceRecord[];
  learningRate: number;
  skillSynergies: Record<string, string[]>;
}

export interface Skill {
  name: string;
  proficiency: ProficiencyMetrics;
  components: SkillComponents;
  learning: LearningCharacteristics;
  usage: UsageStatistics;
}

export interface ProficiencyMetrics {
  level: number;
  experience: number;
  nextLevelThreshold: number;
  masteryBonus: number;
}

export interface SkillComponents {
  knowledge: number;    // Theoretical understanding
  practical: number;    // Hands-on capability
  creative: number;     // Innovation and adaptation
}

export interface LearningCharacteristics {
  learningRate: number;
  retentionRate: number;
  transferAbility: number;
  practiceEffectiveness: number;
}

export interface UsageStatistics {
  totalUses: number;
  successfulUses: number;
  recentUses: number[];
  averageExecutionTime: number;
  lastUsed: number;
}

export interface ExperienceRecord {
  skillName: string;
  amount: number;
  source: string;
  timestamp: number;
  context: string;
  impact: number;
}

export interface MemoryState {
  semantic: SemanticMemory;
  episodic: EpisodicMemory;
  procedural: ProceduralMemory;
  working: WorkingMemory;
}

export interface SemanticMemory {
  facts: Record<string, SemanticFact>;
  concepts: Record<string, Concept>;
  relationships: Record<string, Relationship>;
}

export interface SemanticFact {
  content: string;
  confidence: number;
  source: string;
  learnedAt: number;
  lastAccessed: number;
  accessCount: number;
}

export interface Concept {
  name: string;
  category: string;
  attributes: Record<string, any>;
  examples: string[];
  relatedConcepts: string[];
}

export interface Relationship {
  from: string;
  to: string;
  type: string;
  strength: number;
  context: string;
}

export interface EpisodicMemory {
  episodes: EpisodicEvent[];
  currentIndex: number;
  compressionLevel: number;
}

export interface EpisodicEvent {
  id: string;
  timestamp: number;
  duration: number;
  location: { x: number; y: number; z: number };
  participants: string[];
  actions: ActionRecord[];
  outcomes: string[];
  emotionalImpact: number;
  importance: number;
  tags: string[];
}

export interface ActionRecord {
  actor: string;
  action: string;
  target?: string;
  timestamp: number;
  result: string;
}

export interface ProceduralMemory {
  procedures: Record<string, Procedure>;
  sequences: Record<string, ActionSequence>;
  habits: Habit[];
}

export interface Procedure {
  name: string;
  steps: ProcedureStep[];
  prerequisites: string[];
  context: string;
  successRate: number;
}

export interface ProcedureStep {
  action: string;
  parameters: Record<string, any>;
  expectedOutcome: string;
  timeout: number;
  fallback?: string;
}

export interface ActionSequence {
  name: string;
  actions: string[];
  conditions: Record<string, any>;
  optimizations: string[];
}

export interface Habit {
  trigger: string;
  action: string;
  frequency: number;
  strength: number;
  context: string;
}

export interface WorkingMemory {
  currentFocus: string;
  activeTasks: string[];
  buffer: any[];
  capacity: number;
  decayRate: number;
}

// ============================================================================
// SOCIAL STATE INTERFACES
// ============================================================================

export interface SocialState {
  relationships: RelationshipManagerState;
  theoryOfMind: TheoryOfMindState;
  socialContext: SocialContextState;
  socialLearning: SocialLearningState;
}

export interface RelationshipManagerState {
  agentId: string;
  relationshipCount: number;
  activeRelationships: string[];
  trustLevels: Record<string, number>;
  friendshipLevels: Record<string, number>;
  reputationScore: number;
  lastUpdate: number;
}

export interface TheoryOfMindState {
  mentalModels: Record<string, MentalModelState>;
  activePredictions: PredictionState[];
  emotionalUnderstanding: Record<string, EmotionalState>;
  perspectiveTakingHistory: PerspectiveTakingRecord[];
  lastUpdate: number;
}

export interface MentalModelState {
  agentId: string;
  confidence: number;
  lastUpdated: number;
  intentions: string[];
  beliefs: Record<string, number>;
  emotions: EmotionalState;
}

export interface EmotionalState {
  primary: string;
  intensity: number;
  valence: number;
  arousal: number;
  timestamp: number;
}

export interface PredictionState {
  targetAgentId: string;
  prediction: string;
  confidence: number;
  timeHorizon: number;
  timestamp: number;
}

export interface PerspectiveTakingRecord {
  targetAgentId: string;
  situation: string;
  perspective: string;
  confidence: number;
  timestamp: number;
}

export interface SocialContextState {
  nearbyAgents: string[];
  groupDynamics: GroupDynamicsState;
  socialNorms: SocialNorm[];
  culturalContext: CulturalContextState;
  currentSituation: SocialSituationState;
}

export interface GroupDynamicsState {
  leader?: string;
  cohesion: number;
  hierarchy: string[];
  roles: Record<string, string>;
  alliances: Array<{ agent1: string; agent2: string; strength: number }>;
}

export interface SocialNorm {
  name: string;
  description: string;
  context: string;
  strength: number;
  violations: string[];
}

export interface CulturalContextState {
  culturalBackground: string;
  values: string[];
  practices: string[];
  communicationStyle: string;
  socialHierarchy: string[];
}

export interface SocialSituationState {
  type: 'cooperation' | 'competition' | 'conflict' | 'neutral' | 'celebration' | 'trading';
  participants: string[];
  goals: string[];
  resources: string[];
  powerDynamics: Record<string, number>;
}

export interface SocialLearningState {
  observedBehaviors: ObservedBehavior[];
  learnedPatterns: SocialPattern[];
  teachingHistory: TeachingRecord[];
  socialSkillProgress: Record<string, number>;
  lastUpdate: number;
}

export interface ObservedBehavior {
  agentId: string;
  behavior: string;
  context: string;
  outcome: string;
  timestamp: number;
  learned: boolean;
}

export interface SocialPattern {
  pattern: string;
  context: string;
  frequency: number;
  success: number;
  agents: string[];
  lastObserved: number;
}

export interface TeachingRecord {
  studentId: string;
  skill: string;
  method: string;
  success: boolean;
  improvement: number;
  timestamp: number;
}

export interface ProcessingState {
  currentPhase: ProcessingPhase;
  cognitiveLoad: number;
  attentionLevel: number;
  decisionThreshold: number;
  processingHistory: ProcessingRecord[];
}

export enum ProcessingPhase {
  PERCEPTION = 'perception',
  ANALYSIS = 'analysis',
  PLANNING = 'planning',
  DECISION = 'decision',
  EXECUTION = 'execution',
  REFLECTION = 'reflection'
}

export interface ProcessingRecord {
  phase: ProcessingPhase;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  details: Record<string, any>;
}

// ============================================================================
// EXECUTIVE STATE INTERFACES
// ============================================================================

export interface ExecutiveState {
  currentAction?: AgentAction;
  actionQueue: AgentAction[];
  decisionHistory: DecisionRecord[];
  performanceMetrics: PerformanceMetrics;
  conversationalResponse?: string;
  lastResponse?: ResponseRecord;
  responseHistory: ResponseRecord[];
  processingMode: 'conversational' | 'action';
}

export interface AgentAction {
  id: string;
  type: string;
  priority: number;
  parameters: Record<string, any>;
  startTime?: number;
  endTime?: number;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'interrupted';
  cognitive: boolean; // true if from cognitive processing, false if reactive
}

export interface DecisionRecord {
  timestamp: number;
  context: WorldContext;
  options: DecisionOption[];
  selected: string;
  reasoning: string;
  outcome: string;
  confidence: number;
}

export interface DecisionOption {
  action: string;
  utility: number;
  risk: number;
  expectedOutcome: string;
  reasoning: string;
}

export interface PerformanceMetrics {
  reactiveResponseTime: number[];
  cognitiveProcessingTime: number[];
  successRate: number;
  learningRate: number;
  goalCompletionRate: number;
  survivalEvents: number;
  socialInteractions: number;
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

// ============================================================================
// CONVERSATION PROCESSING INTERFACES
// ============================================================================

export interface MessageAnalysis {
  message: string;
  source: string;
  isConversational: boolean;
  isActionCommand: boolean;
  processingMode: 'conversational' | 'action';
  confidence: number;
  extractedIntent?: string;
  entities?: Record<string, any>;
  emotionalTone?: string;
  urgency: number;
}

export interface ConversationContext {
  isActive: boolean;
  startTime?: number;
  lastMessageTime: number;
  messageCount: number;
  participants: string[];
  currentTopic?: string;
  conversationHistory: ConversationEntry[];
  contextBuffer: string[];
  emotionalState: Record<string, number>;
}

export interface ConversationEntry {
  id: string;
  timestamp: number;
  source: string;
  message: string;
  response?: string;
  type: 'user' | 'agent' | 'system';
  metadata?: Record<string, any>;
}

export interface ConversationProcessingResult {
  response: string;
  processingTime: number;
  confidence: number;
  personalityAlignment: number;
  contextUpdated: boolean;
  followUpActions?: string[];
}

// ============================================================================
// MAIN AGENT STATE INTERFACE
// ============================================================================

export interface AgentState {
  // Core context
  context: WorldContext;
  
  // Reactive layer (always active)
  reactive: ReactiveState;
  
  // Cognitive layer (LangGraph managed)
  cognitive: CognitiveState;
  
  // Executive control
  executive: ExecutiveState;
  
  // System metadata
  metadata: {
    agentId: string;
    startTime: number;
    lastUpdate: number;
    version: string;
    performanceMode: 'survival' | 'balanced' | 'cognitive';
  };
}

// ============================================================================
// LANGGRAPH STATE ANNOTATION
// ============================================================================

export const AgentStateAnnotation = Annotation.Root({
  // Core context
  context: Annotation<WorldContext>,
  
  // Reactive layer (always active)
  reactive: Annotation<ReactiveState>,
  
  // Cognitive layer (LangGraph managed)
  cognitive: Annotation<CognitiveState>,
  
  // Executive control
  executive: Annotation<ExecutiveState>,
  
  // System metadata
  metadata: Annotation<{
    agentId: string;
    startTime: number;
    lastUpdate: number;
    version: string;
    performanceMode: 'survival' | 'balanced' | 'cognitive';
  }>
});

// ============================================================================
// LANGGRAPH STATE GRAPH TYPE
// ============================================================================

export type AgentStateGraph = StateGraph<typeof AgentStateAnnotation>;

// ============================================================================
// REACTIVE INTEGRATION INTERFACES
// ============================================================================

export interface ReactiveBehaviorLayer {
  update(agent: Agent, deltaTime: number): Promise<void>;
  checkEmergencyConditions(state: AgentState): InterruptPriority;
  executeReactiveResponse(agent: Agent, priority: InterruptPriority): Promise<void>;
  selectReactiveMode(agent: Agent, priority: InterruptPriority): ReactiveMode;
}

export interface ReactiveMode {
  name: string;
  priority: InterruptPriority;
  execute(agent: Agent): Promise<void>;
  canHandle(state: AgentState): boolean;
}

export interface InterruptController {
  checkEmergencyConditions(state: AgentState): InterruptPriority;
  preemptCognitiveProcessing(priority: InterruptPriority): void;
  resumeCognitiveProcessing(): void;
  shouldBypassCognitive(priority: InterruptPriority): boolean;
}

// ============================================================================
// AGENT INTERFACE
// ============================================================================

export interface Agent {
  bot: Bot;
  state: AgentState;
  reactiveLayer: ReactiveBehaviorLayer;
  interruptController: InterruptController;
  
  update(deltaTime: number): Promise<void>;
  handleEmergency(priority: InterruptPriority): Promise<void>;
  processCognitive(): Promise<void>;
  executeAction(action: AgentAction): Promise<void>;
}

// ============================================================================
// UTILITY INTERFACES
// ============================================================================

export interface DecisionContext {
  currentTime: number;
  availableTime: number;
  cognitiveLoad: number;
  urgency: number;
  riskTolerance: number;
  nearbyAgents?: string[];
  socialInfluence?: any;
  socialContext?: any;
}

export interface LearningContext {
  experience: ExperienceRecord;
  previousPerformance: PerformanceMetrics;
  environmentalFactors: Record<string, number>;
  socialContext: Record<string, any>;
}

export interface PerformanceThresholds {
  maxReactiveResponseTime: number;      // 100ms
  maxCognitiveProcessingTime: number;   // 2000ms
  maxMemoryUsage: number;               // 2GB
  minSuccessRate: number;               // 0.8
  maxCognitiveLoad: number;             // 0.9
}

// ============================================================================
// MEMORY QUERY INTERFACES
// ============================================================================

export interface MemoryQuery {
  query: string;
  types: ('semantic' | 'episodic' | 'procedural' | 'working' | 'all')[];
  context?: WorldContext;
  timeRange?: {
    start: number;
    end: number;
  };
  importance?: number; // 0 to 1, minimum importance threshold
  limit?: number;
  filters?: Record<string, any>;
}

export interface MemoryRetrieval {
  semantic: SemanticConcept[];
  episodic: EpisodicEvent[];
  procedural: ProceduralSkill[];
  working: WorkingMemoryItem[];
}

export interface SemanticConcept {
  id: string;
  name: string;
  type: 'entity' | 'property' | 'relation' | 'schema';
  activation: number; // 0 to 1
  attributes: Record<string, any>;
  relationships: SemanticRelationship[];
  lastAccessed: number;
  importance: number; // 0 to 1
}

export interface SemanticRelationship {
  type: 'causal' | 'spatial' | 'temporal' | 'categorical' | 'functional';
  target: string;
  strength: number; // 0 to 1
  confidence: number; // 0 to 1
}

export interface ProceduralSkill {
  id: string;
  name: string;
  type: 'skill' | 'routine' | 'strategy';
  sequence: ProceduralStep[];
  conditions: string[];
  outcomes: string[];
  proficiency: number; // 0 to 1
  usageCount: number;
  lastUsed: number;
  adaptations: ProceduralAdaptation[];
}

export interface ProceduralStep {
  action: string;
  parameters: Record<string, any>;
  conditions: string[];
  expectedOutcome: string;
  duration: number;
}

export interface ProceduralAdaptation {
  context: string;
  modification: ProceduralStep[];
  performance: number; // 0 to 1
  timestamp: number;
}

export interface WorkingMemoryItem {
  id: string;
  content: any;
  type: 'perception' | 'event' | 'goal' | 'concept';
  priority: number; // 0 to 1
  timestamp: number;
  decayRate: number;
}

export interface WorkingMemoryState {
  items: WorkingMemoryItem[];
  currentFocus: string | null;
  capacity: number;
  attentionLevel: number;
}

export interface MemoryStatistics {
  semantic: {
    conceptCount: number;
    relationshipCount: number;
    averageActivation: number;
  };
  episodic: {
    eventCount: number;
    averageImportance: number;
    oldestEvent: number;
  };
  procedural: {
    skillCount: number;
    averageProficiency: number;
    totalUsage: number;
  };
  working: {
    itemCount: number;
    averagePriority: number;
    attentionLevel: number;
  };
  lastConsolidation: number;
}