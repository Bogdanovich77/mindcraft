# Social Relationship System - TypeScript Interfaces & Specifications

## Overview

This document contains the complete TypeScript interface definitions for the Social Relationship System, following the established patterns from existing cognitive components. All interfaces are designed to extend the existing LangGraph architecture seamlessly.

## Core Social State Interfaces

### SocialState Extension

```typescript
/**
 * Main social state interface that extends AgentState
 * Follows the same pattern as CognitiveState and ReactiveState
 */
export interface SocialState {
  relationships: RelationshipNetwork;
  theoryOfMind: TheoryOfMindState;
  socialContext: SocialContext;
  socialMemory: SocialMemoryState;
  socialProcessing: SocialProcessingState;
}

/**
 * Extended AgentState interface with social component
 * Integrates with existing AgentState from langgraph/interfaces.ts
 */
export interface ExtendedAgentState extends AgentState {
  // Existing components
  context: WorldContext;
  reactive: ReactiveState;
  cognitive: CognitiveState;
  executive: ExecutiveState;
  
  // New social component
  social: SocialState;
  
  // System metadata
  metadata: AgentMetadata;
}
```

## Relationship Manager Interfaces

### Relationship Network

```typescript
/**
 * Core relationship management interfaces
 * Follows the pattern established by GoalSystem and PurposeCore
 */

export interface RelationshipNetwork {
  agentId: string;
  relationships: Map<string, AgentRelationship>;
  reputation: AgentReputation;
  socialNetwork: SocialNetworkTopology;
  relationshipHistory: RelationshipEvent[];
  lastUpdate: number;
}

export interface AgentRelationship {
  targetAgentId: string;
  trust: TrustMetrics;
  friendship: FriendshipMetrics;
  respect: RespectMetrics;
  rivalry: RivalryMetrics;
  collaboration: CollaborationMetrics;
  communication: CommunicationMetrics;
  status: RelationshipStatus;
  history: RelationshipInteraction[];
  trends: RelationshipTrends;
  metadata: RelationshipMetadata;
}

export interface TrustMetrics {
  level: number; // 0 to 1
  reliability: number; // 0 to 1
  competence: number; // 0 to 1
  integrity: number; // 0 to 1
  consistency: number; // 0 to 1
  vulnerability: number; // 0 to 1, willingness to be vulnerable
  lastUpdated: number;
  updateHistory: TrustUpdate[];
}

export interface FriendshipMetrics {
  level: number; // 0 to 1
  affection: number; // 0 to 1
  loyalty: number; // 0 to 1
  support: number; // 0 to 1
  sharedInterests: number; // 0 to 1
  timeInvested: number; // hours
  qualityScore: number; // 0 to 1
  lastInteraction: number;
}

export interface RespectMetrics {
  level: number; // 0 to 1
  skillRecognition: number; // 0 to 1
  achievementRecognition: number; // 0 to 1
  wisdomRecognition: number; // 0 to 1
  leadershipRecognition: number; // 0 to 1
  lastUpdated: number;
}

export interface RivalryMetrics {
  level: number; // 0 to 1
  competition: number; // 0 to 1
  hostility: number; // 0 to 1
  jealousy: number; // 0 to 1
  sabatogePotential: number; // 0 to 1
  lastUpdated: number;
}

export interface CollaborationMetrics {
  effectiveness: number; // 0 to 1
  efficiency: number; // 0 to 1
  coordination: number; // 0 to 1
  sharedGoals: number; // 0 to 1
  successfulProjects: number;
  totalProjects: number;
  lastCollaboration: number;
}

export interface CommunicationMetrics {
  frequency: number; // messages per day
  quality: number; // 0 to 1
  clarity: number; // 0 to 1
  honesty: number; // 0 to 1
  responsiveness: number; // 0 to 1
  lastCommunication: number;
  preferredChannels: CommunicationChannel[];
}

export enum RelationshipStatus {
  UNKNOWN = 'unknown',
  ACQUAINTANCE = 'acquaintance',
  FRIEND = 'friend',
  CLOSE_FRIEND = 'close_friend',
  RIVAL = 'rival',
  ENEMY = 'enemy',
  MENTOR = 'mentor',
  MENTEE = 'mentee',
  COLLEAGUE = 'colleague',
  PARTNER = 'partner'
}

export interface RelationshipInteraction {
  id: string;
  timestamp: number;
  type: InteractionType;
  context: string;
  outcome: InteractionOutcome;
  impact: RelationshipImpact;
  participants: string[];
  metadata: Record<string, any>;
}

export enum InteractionType {
  COLLABORATION = 'collaboration',
  CONVERSATION = 'conversation',
  HELP = 'help',
  TRADE = 'trade',
  CONFLICT = 'conflict',
  SUPPORT = 'support',
  COMPETITION = 'competition',
  CELEBRATION = 'celebration'
}

export interface InteractionOutcome {
  success: boolean;
  satisfaction: number; // 0 to 1
  mutualBenefit: number; // 0 to 1
  timeInvestment: number; // minutes
  resourceCost: number;
  emotionalImpact: number; // -1 to 1
}

export interface RelationshipImpact {
  trust: number; // -1 to 1
  friendship: number; // -1 to 1
  respect: number; // -1 to 1
  rivalry: number; // -1 to 1
  collaboration: number; // -1 to 1
  overall: number; // -1 to 1
}

export interface RelationshipTrends {
  trustTrend: TrendDirection;
  friendshipTrend: TrendDirection;
  respectTrend: TrendDirection;
  collaborationTrend: TrendDirection;
  overallTrend: TrendDirection;
  prediction: RelationshipPrediction;
}

export enum TrendDirection {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DECLINING = 'declining',
  VOLATILE = 'volatile'
}

export interface RelationshipPrediction {
  shortTerm: PredictionOutcome; // 1 week
  mediumTerm: PredictionOutcome; // 1 month
  longTerm: PredictionOutcome; // 3 months
  confidence: number; // 0 to 1
  factors: PredictionFactor[];
}

export interface PredictionOutcome {
  status: RelationshipStatus;
  trustLevel: number;
  friendshipLevel: number;
  collaborationPotential: number;
  riskFactors: string[];
}

export interface PredictionFactor {
  factor: string;
  weight: number;
  impact: number;
  certainty: number;
}

export interface RelationshipMetadata {
  source: 'direct' | 'observed' | 'inferred' | 'reported';
  confidence: number; // 0 to 1
  lastVerified: number;
  verificationCount: number;
  tags: string[];
  notes: string;
}

export interface TrustUpdate {
  timestamp: number;
  oldValue: number;
  newValue: number;
  reason: string;
  source: string;
  context: string;
}
```

### Reputation System

```typescript
export interface AgentReputation {
  globalScore: number; // 0 to 1
  domainScores: Map<string, number>; // skill domain -> reputation
  traits: ReputationTraits;
  accomplishments: ReputationAccomplishment[];
  endorsements: ReputationEndorsement[];
  criticisms: ReputationCriticism[];
  lastUpdated: number;
}

export interface ReputationTraits {
  reliability: number; // 0 to 1
  competence: number; // 0 to 1
  friendliness: number; // 0 to 1
  honesty: number; // 0 to 1
  generosity: number; // 0 to 1
  courage: number; // 0 to 1
  creativity: number; // 0 to 1
  leadership: number; // 0 to 1
}

export interface ReputationAccomplishment {
  id: string;
  description: string;
  domain: string;
  impact: number; // 0 to 1
  witnesses: string[];
  timestamp: number;
  verified: boolean;
}

export interface ReputationEndorsement {
  endorserId: string;
  trait: string;
  strength: number; // 0 to 1
  timestamp: number;
  context: string;
  weight: number; // based on endorser's reputation
}

export interface ReputationCriticism {
  criticId: string;
  issue: string;
  severity: number; // 0 to 1
  timestamp: number;
  context: string;
  validity: number; // 0 to 1
}
```

### Social Network Topology

```typescript
export interface SocialNetworkTopology {
  nodes: SocialNode[];
  edges: SocialEdge[];
  clusters: SocialCluster[];
  metrics: NetworkMetrics;
  lastCalculated: number;
}

export interface SocialNode {
  agentId: string;
  importance: number; // 0 to 1
  influence: number; // 0 to 1
  connectivity: number; // degree of connections
  clusterId?: string;
  role: SocialRole;
  status: NodeStatus;
}

export enum SocialRole {
  LEADER = 'leader',
  CONNECTOR = 'connector',
  SPECIALIST = 'specialist',
  PERIPHERAL = 'peripheral',
  ISOLATED = 'isolated'
}

export enum NodeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DORMANT = 'dormant',
  UNKNOWN = 'unknown'
}

export interface SocialEdge {
  sourceId: string;
  targetId: string;
  weight: number; // 0 to 1
  type: EdgeType;
  strength: number; // 0 to 1
  directionality: EdgeDirectionality;
  lastInteraction: number;
  interactionFrequency: number;
}

export enum EdgeType {
  FRIENDSHIP = 'friendship',
  COLLABORATION = 'collaboration',
  MENTORSHIP = 'mentorship',
  RIVALRY = 'rivalry',
  TRADE = 'trade',
  COMMUNICATION = 'communication'
}

export enum EdgeDirectionality {
  UNIDIRECTIONAL = 'unidirectional',
  BIDIRECTIONAL = 'bidirectional',
  RECIPROCAL = 'reciprocal'
}

export interface SocialCluster {
  id: string;
  name: string;
  members: string[];
  cohesion: number; // 0 to 1
  density: number; // 0 to 1
  centralAgent?: string;
  purpose: string;
  formationTime: number;
}

export interface NetworkMetrics {
  density: number; // 0 to 1
  clustering: number; // 0 to 1
  averagePathLength: number;
  diameter: number;
  centrality: Map<string, number>; // agentId -> centrality score
  modularity: number; // 0 to 1
}

export interface RelationshipEvent {
  id: string;
  timestamp: number;
  type: RelationshipEventType;
  participants: string[];
  impact: RelationshipChange;
  context: string;
  significance: number; // 0 to 1
}

export enum RelationshipEventType {
  FORMATION = 'formation',
  STRENGTHENING = 'strengthening',
  WEAKENING = 'weakening',
  CONFLICT = 'conflict',
  RESOLUTION = 'resolution',
  TRANSFORMATION = 'transformation'
}

export interface RelationshipChange {
  agentId: string;
  trust: number; // -1 to 1
  friendship: number; // -1 to 1
  respect: number; // -1 to 1
  rivalry: number; // -1 to 1
  collaboration: number; // -1 to 1
}
```

## Theory of Mind Interfaces

### Mental State Modeling

```typescript
/**
 * Theory of Mind system interfaces
 * Enables agents to model other agents' mental states
 */

export interface TheoryOfMindState {
  agentId: string;
  mentalModels: Map<string, MentalModel>; // targetAgentId -> mental model
  beliefSystems: Map<string, BeliefSystem>;
  intentionPredictions: Map<string, IntentionPrediction>;
  knowledgeStates: Map<string, KnowledgeState>;
  emotionalModels: Map<string, EmotionalModel>;
  perspectiveHistory: PerspectiveHistory[];
  lastUpdate: number;
}

export interface MentalModel {
  targetAgentId: string;
  personality: PersonalityModel;
  motivations: MotivationModel;
  goals: GoalModel;
  capabilities: CapabilityModel;
  constraints: ConstraintModel;
  decisionPatterns: DecisionPattern[];
  confidence: number; // 0 to 1
  lastUpdated: number;
  updateHistory: MentalModelUpdate[];
}

export interface PersonalityModel {
  traits: PersonalityTraits; // from existing interfaces
  behaviorPatterns: BehaviorPattern[];
  socialTendencies: SocialTendencies;
  communicationStyle: CommunicationStyleModel;
  decisionStyle: DecisionStyleModel;
  confidence: number; // 0 to 1
}

export interface BehaviorPattern {
  context: string;
  triggers: string[];
  responses: ResponsePattern[];
  frequency: number;
  reliability: number; // 0 to 1
}

export interface ResponsePattern {
  action: string;
  probability: number;
  conditions: string[];
  expectedOutcome: string;
}

export interface SocialTendencies {
  leadership: number; // 0 to 1
  followership: number; // 0 to 1
  cooperation: number; // 0 to 1
  competition: number; // 0 to 1
  riskTaking: number; // 0 to 1
  conformity: number; // 0 to 1
  innovation: number; // 0 to 1
}

export interface CommunicationStyleModel {
  directness: number; // 0 to 1
  formality: number; // 0 to 1
  verbosity: number; // 0 to 1
  emotionalExpression: number; // 0 to 1
  humor: number; // 0 to 1
  assertiveness: number; // 0 to 1
}

export interface DecisionStyleModel {
  analytical: number; // 0 to 1
  intuitive: number; // 0 to 1
  decisive: number; // 0 to 1
  deliberative: number; // 0 to 1
  riskAverse: number; // 0 to 1
  sociallyInfluenced: number; // 0 to 1
}

export interface MentalModelUpdate {
  timestamp: number;
  changeType: ModelChangeType;
  component: string;
  oldValue: any;
  newValue: any;
  confidence: number;
  source: string;
}

export enum ModelChangeType {
  PERSONALITY = 'personality',
  MOTIVATION = 'motivation',
  GOAL = 'goal',
  CAPABILITY = 'capability',
  CONSTRAINT = 'constraint'
}

export interface PerspectiveHistory {
  id: string;
  timestamp: number;
  targetAgentId: string;
  perspective: PerspectiveTaking;
  accuracy: number; // 0 to 1
  outcome: PerspectiveOutcome;
}

export interface PerspectiveTaking {
  mentalState: MentalState;
  emotionalState: EmotionalState;
  knowledgeState: KnowledgeState;
  intentionState: IntentionState;
}

export interface MentalState {
  thoughts: string[];
  beliefs: string[];
  concerns: string[];
  focus: string;
}

export interface EmotionalState {
  primaryEmotion: EmotionType;
  emotionalIntensity: number; // 0 to 1
  emotionalStability: number; // 0 to 1
  triggers: string[];
}

export interface KnowledgeState {
  knownFacts: string[];
  knowledgeGaps: string[];
  confidence: number; // 0 to 1
  sources: string[];
}

export interface IntentionState {
  primaryIntention: string;
  secondaryIntentions: string[];
  urgency: number; // 0 to 1
  commitment: number; // 0 to 1
}

export interface PerspectiveOutcome {
  successful: boolean;
  insights: string[];
  corrections: string[];
  learning: string;
}

export interface BeliefSystem {
  targetAgentId: string;
  beliefs: Map<string, Belief>; // beliefId -> belief
  beliefNetwork: BeliefNetwork;
  confidence: number; // 0 to 1
  lastUpdated: number;
}

export interface Belief {
  id: string;
  content: string;
  type: BeliefType;
  strength: number; // 0 to 1
  certainty: number; // 0 to 1
  evidence: Evidence[];
  contradictions: string[];
  context: string;
  lastUpdated: number;
}

export enum BeliefType {
  FACTUAL = 'factual',
  SOCIAL = 'social',
  MORAL = 'moral',
  STRATEGIC = 'strategic',
  PERSONAL = 'personal'
}

export interface Evidence {
  source: string;
  type: EvidenceType;
  strength: number; // 0 to 1
  timestamp: number;
  context: string;
}

export enum EvidenceType {
  OBSERVATION = 'observation',
  TESTIMONY = 'testimony',
  INFERENCE = 'inference',
  EXPERIENCE = 'experience'
}

export interface BeliefNetwork {
  nodes: Map<string, BeliefNode>;
  edges: Map<string, BeliefEdge[]>;
  clusters: BeliefCluster[];
}

export interface BeliefNode {
  beliefId: string;
  centrality: number; // 0 to 1
  influence: number; // 0 to 1
  stability: number; // 0 to 1
}

export interface BeliefEdge {
  sourceBeliefId: string;
  targetBeliefId: string;
  relationship: BeliefRelationship;
  strength: number; // 0 to 1
}

export enum BeliefRelationship {
  SUPPORTS = 'supports',
  CONTRADICTS = 'contradicts',
  IMPLIES = 'implies',
  REQUIRES = 'requires',
  STRENGTHENS = 'strengthens'
}

export interface BeliefCluster {
  id: string;
  beliefs: string[];
  theme: string;
  coherence: number; // 0 to 1
  stability: number; // 0 to 1
}

export interface IntentionPrediction {
  targetAgentId: string;
  intentions: Intention[];
  currentIntention: CurrentIntention;
  futureIntentions: FutureIntention[];
  confidence: number; // 0 to 1
  lastUpdated: number;
}

export interface Intention {
  id: string;
  type: IntentionType;
  description: string;
  strength: number; // 0 to 1
  urgency: number; // 0 to 1
  duration: number; // milliseconds
  prerequisites: string[];
  expectedOutcomes: string[];
  detectability: number; // 0 to 1
}

export enum IntentionType {
  GOAL_DIRECTED = 'goal_directed',
  SOCIAL = 'social',
  EMOTIONAL = 'emotional',
  SURVIVAL = 'survival',
  EXPLORATORY = 'exploratory',
  DEFENSIVE = 'defensive'
}

export interface CurrentIntention {
  intention: Intention;
  progress: number; // 0 to 1
  obstacles: string[];
  adaptations: string[];
  estimatedCompletion: number;
}

export interface FutureIntention {
  intention: Intention;
  probability: number; // 0 to 1
  timeframe: number; // milliseconds
  triggers: string[];
  conditions: string[];
}

export interface KnowledgeState {
  targetAgentId: string;
  knownFacts: Map<string, FactKnowledge>; // factId -> knowledge
  knownAgents: Map<string, AgentKnowledge>; // agentId -> knowledge
  knownLocations: Map<string, LocationKnowledge>; // locationId -> knowledge
  knownSkills: Map<string, SkillKnowledge>; // skillId -> knowledge
  knowledgeGaps: KnowledgeGap[];
  learningPatterns: LearningPattern[];
  lastUpdated: number;
}

export interface FactKnowledge {
  factId: string;
  known: boolean;
  confidence: number; // 0 to 1
  source: string;
  timestamp: number;
  context: string;
  verification: VerificationStatus;
}

export enum VerificationStatus {
  CERTAIN = 'certain',
  LIKELY = 'likely',
  POSSIBLE = 'possible',
  UNCERTAIN = 'uncertain',
  FALSE = 'false'
}

export interface AgentKnowledge {
  agentId: string;
  known: boolean;
  relationshipKnown: boolean;
  capabilitiesKnown: boolean;
  intentionsKnown: boolean;
  locationKnown: boolean;
  statusKnown: boolean;
  confidence: number; // 0 to 1
  lastObserved: number;
  observationContext: string;
}

export interface LocationKnowledge {
  locationId: string;
  known: boolean;
  visited: boolean;
  importance: number; // 0 to 1
  resources: Map<string, ResourceKnowledge>;
  dangers: Map<string, DangerKnowledge>;
  opportunities: Map<string, OpportunityKnowledge>;
  lastVisited: number;
}

export interface ResourceKnowledge {
  resource: string;
  abundance: number; // 0 to 1
  accessibility: number; // 0 to 1
  quality: number; // 0 to 1
  lastObserved: number;
}

export interface DangerKnowledge {
  danger: string;
  severity: number; // 0 to 1
  probability: number; // 0 to 1
  avoidance: string;
  lastObserved: number;
}

export interface OpportunityKnowledge {
  opportunity: string;
  value: number; // 0 to 1
  feasibility: number; // 0 to 1
  requirements: string[];
  lastObserved: number;
}

export interface SkillKnowledge {
  skillId: string;
  known: boolean;
  level: number; // 0 to 1
  proficiency: number; // 0 to 1
  lastObserved: number;
  context: string;
}

export interface KnowledgeGap {
  type: KnowledgeGapType;
  description: string;
  importance: number; // 0 to 1
  urgency: number; // 0 to 1
  acquisitionStrategy: string;
}

export enum KnowledgeGapType {
  FACT = 'fact',
  AGENT = 'agent',
  LOCATION = 'location',
  SKILL = 'skill',
  PROCEDURE = 'procedure'
}

export interface LearningPattern {
  domain: string;
  rate: number; // 0 to 1
  retention: number; // 0 to 1
  transfer: number; // 0 to 1
  preferredMethods: LearningMethod[];
  obstacles: string[];
}

export enum LearningMethod {
  OBSERVATION = 'observation',
  EXPERIMENTATION = 'experimentation',
  INSTRUCTION = 'instruction',
  COLLABORATION = 'collaboration',
  REFLECTION = 'reflection'
}

export interface EmotionalModel {
  targetAgentId: string;
  currentEmotions: EmotionalState;
  emotionalHistory: EmotionalEvent[];
  personalityEmotions: PersonalityEmotions;
  triggers: EmotionalTrigger[];
  expressions: EmotionalExpression[];
  regulation: EmotionalRegulation;
  lastUpdated: number;
}

export interface EmotionalState {
  primary: Emotion;
  secondary: Emotion[];
  valence: number; // -1 to 1
  arousal: number; // 0 to 1
  intensity: number; // 0 to 1
  stability: number; // 0 to 1
  duration: number; // milliseconds
}

export interface Emotion {
  type: EmotionType;
  intensity: number; // 0 to 1
  valence: number; // -1 to 1
  duration: number; // milliseconds
  trigger?: string;
  target?: string;
}

export enum EmotionType {
  JOY = 'joy',
  SADNESS = 'sadness',
  ANGER = 'anger',
  FEAR = 'fear',
  SURPRISE = 'surprise',
  DISGUST = 'disgust',
  TRUST = 'trust',
  ANTICIPATION = 'anticipation',
  PRIDE = 'pride',
  SHAME = 'shame',
  GUILT = 'guilt',
  GRATITUDE = 'gratitude',
  INTEREST = 'interest',
  CONFUSION = 'confusion'
}

export interface EmotionalEvent {
  id: string;
  timestamp: number;
  emotion: Emotion;
  cause: string;
  context: string;
  duration: number;
  resolution: EmotionalResolution;
}

export interface EmotionalResolution {
  type: ResolutionType;
  outcome: string;
  satisfaction: number; // 0 to 1
  learning: string;
}

export enum ResolutionType {
  NATURAL = 'natural',
  ACTION = 'action',
  INTERVENTION = 'intervention',
  SUPPRESSED = 'suppressed'
}

export interface PersonalityEmotions {
  baseline: EmotionalState;
  expressiveness: number; // 0 to 1
  volatility: number; // 0 to 1
  empathy: number; // 0 to 1
  emotionalIntelligence: number; // 0 to 1
}

export interface EmotionalTrigger {
  type: string;
  strength: number; // 0 to 1
  frequency: number;
  context: string;
  response: EmotionType[];
}

export interface EmotionalExpression {
  emotion: EmotionType;
  channel: ExpressionChannel;
  intensity: number; // 0 to 1
  authenticity: number; // 0 to 1
  socialAppropriateness: number; // 0 to 1
}

export enum ExpressionChannel {
  VERBAL = 'verbal',
  FACIAL = 'facial',
  BODY_LANGUAGE = 'body_language',
  ACTION = 'action',
  COMMUNICATION = 'communication'
}

export interface EmotionalRegulation {
  strategies: RegulationStrategy[];
  effectiveness: number; // 0 to 1
  triggers: string[];
  suppressedEmotions: EmotionType[];
  enhancedEmotions: EmotionType[];
}

export interface RegulationStrategy {
  type: RegulationType;
  effectiveness: number; // 0 to 1
  context: string;
  cost: number; // 0 to 1
}

export enum RegulationType {
  SUPPRESSION = 'suppression',
  REAPPRAISAL = 'reappraisal',
  DISTRACTION = 'distraction',
  PROBLEM_SOLVING = 'problem_solving',
  SEEKING_SUPPORT = 'seeking_support'
}

## Social Decision-Making Interfaces

### Social Decision Integration

```typescript
/**
 * Social decision-making interfaces
 * Integrates social context into existing decision-making processes
 */

export interface SocialDecisionMaker {
  agentId: string;
  socialUtilities: Map<string, SocialUtility>; // actionId -> utility
  socialPreferences: SocialPreferences;
  socialConstraints: SocialConstraint[];
  groupDynamics: GroupDynamics;
  conflictResolution: ConflictResolutionStrategy;
  collaboration: CollaborationStrategy;
  lastUpdated: number;
}

export interface SocialUtility {
  actionId: string;
  socialValue: number; // 0 to 1
  relationshipImpact: Map<string, number>; // agentId -> impact
  reputationImpact: number; // -1 to 1
  groupBenefit: number; // 0 to 1
  personalCost: number; // 0 to 1
  riskAssessment: SocialRisk;
  confidence: number; // 0 to 1
  factors: SocialUtilityFactor[];
}

export interface SocialUtilityFactor {
  factor: string;
  weight: number;
  value: number;
  reasoning: string;
}

export interface SocialRisk {
  relationshipRisk: number; // 0 to 1
  reputationRisk: number; // 0 to 1
  groupRisk: number; // 0 to 1
  personalRisk: number; // 0 to 1
  mitigation: string[];
}

export interface SocialPreferences {
  relationshipPriority: Map<string, number>; // agentId -> priority
  groupAffiliation: Map<string, number>; // groupId -> affinity
  socialValues: SocialValues;
  communicationPreferences: CommunicationPreferences;
  collaborationStyle: CollaborationStyle;
}

export interface SocialValues {
  loyalty: number; // 0 to 1
  fairness: number; // 0 to 1
  cooperation: number; // 0 to 1
  achievement: number; // 0 to 1
  recognition: number; // 0 to 1
  harmony: number; // 0 to 1
  independence: number; // 0 to 1
  authority: number; // 0 to 1
}

export interface CommunicationPreferences {
  directness: number; // 0 to 1
  formality: number; // 0 to 1
  frequency: number; // 0 to 1
  channels: CommunicationChannel[];
  topics: string[];
  avoidedTopics: string[];
}

export enum CommunicationChannel {
  DIRECT = 'direct',
  GROUP = 'group',
  WRITTEN = 'written',
  VERBAL = 'verbal',
  NONVERBAL = 'nonverbal'
}

export interface CollaborationStyle {
  leadership: number; // 0 to 1
  followership: number; // 0 to 1
  coordination: number; // 0 to 1
  contribution: number; // 0 to 1
  flexibility: number; // 0 to 1
  reliability: number; // 0 to 1
}

export interface GroupDynamics {
  currentGroups: Map<string, GroupMembership>; // groupId -> membership
  groupRoles: Map<string, GroupRole>; // groupId -> role
  influence: Map<string, number>; // groupId -> influence
  conformity: number; // 0 to 1
  leadership: number; // 0 to 1
  cohesion: Map<string, number>; // groupId -> cohesion
}

export interface GroupMembership {
  groupId: string;
  role: GroupRole;
  status: MembershipStatus;
  joinDate: number;
  contribution: number; // 0 to 1
  commitment: number; // 0 to 1
}

export enum GroupRole {
  LEADER = 'leader',
  CO_LEADER = 'co_leader',
  MEMBER = 'member',
  SPECIALIST = 'specialist',
  MENTOR = 'mentor',
  MENTEE = 'mentee',
  OBSERVER = 'observer'
}

export enum MembershipStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROBATIONARY = 'probationary',
  HONORARY = 'honorary',
  SUSPENDED = 'suspended'
}

export interface ConflictResolutionStrategy {
  approach: ConflictApproach;
  triggers: ConflictTrigger[];
  tactics: ConflictTactic[];
  success: number; // 0 to 1
  escalationThreshold: number; // 0 to 1
}

export enum ConflictApproach {
  AVOIDANCE = 'avoidance',
  ACCOMMODATION = 'accommodation',
  COMPROMISE = 'compromise',
  COMPETITION = 'competition',
  COLLABORATION = 'collaboration'
}

export interface ConflictTrigger {
  type: ConflictType;
  threshold: number; // 0 to 1
  response: ConflictApproach;
}

export enum ConflictType {
  RESOURCE = 'resource',
  GOAL = 'goal',
  VALUE = 'value',
  RELATIONSHIP = 'relationship',
  STATUS = 'status'
}

export interface ConflictTactic {
  situation: string;
  action: string;
  effectiveness: number; // 0 to 1
  cost: number; // 0 to 1
  prerequisites: string[];
}

export interface CollaborationStrategy {
  initiation: CollaborationInitiation;
  coordination: CoordinationMethod;
  contribution: ContributionStyle;
  communication: CommunicationStrategy;
  evaluation: EvaluationMethod;
}

export interface CollaborationInitiation {
  criteria: CollaborationCriteria[];
  approach: InitiationApproach;
  messaging: MessageTemplate[];
}

export interface CollaborationCriteria {
  factor: string;
  importance: number; // 0 to 1
  threshold: number; // 0 to 1
}

export enum InitiationApproach {
  DIRECT = 'direct',
  INDIRECT = 'indirect',
  OPPORTUNISTIC = 'opportunistic',
  FORMAL = 'formal',
  INFORMAL = 'informal'
}

export interface MessageTemplate {
  context: string;
  template: string;
  personalization: string[];
  success: number; // 0 to 1
}

export interface CoordinationMethod {
  planning: PlanningStyle;
  synchronization: SynchronizationMethod;
  monitoring: MonitoringMethod;
  adaptation: AdaptationStrategy;
}

export enum PlanningStyle {
  CENTRALIZED = 'centralized',
  DISTRIBUTED = 'distributed',
  HIERARCHICAL = 'hierarchical',
  CONSENSUS = 'consensus'
}

export enum SynchronizationMethod {
  REAL_TIME = 'real_time',
  PERIODIC = 'periodic',
  EVENT_DRIVEN = 'event_driven',
  ASYNCHRONOUS = 'asynchronous'
}

export enum MonitoringMethod {
  ACTIVE = 'active',
  PASSIVE = 'passive',
  PEER = 'peer',
  AUTOMATED = 'automated'
}

export interface AdaptationStrategy {
  triggers: AdaptationTrigger[];
  responses: AdaptationResponse[];
  learning: boolean;
}

export interface AdaptationTrigger {
  condition: string;
  threshold: number; // 0 to 1
  urgency: number; // 0 to 1
}

export interface AdaptationResponse {
  type: AdaptationType;
  action: string;
  effectiveness: number; // 0 to 1
}

export enum AdaptationType {
  ROLE_CHANGE = 'role_change',
  STRATEGY_CHANGE = 'strategy_change',
  COMMUNICATION_CHANGE = 'communication_change',
  GOAL_CHANGE = 'goal_change'
}

export interface ContributionStyle {
  specialization: string[];
  workload: WorkloadPreference;
  quality: QualityStandard;
  innovation: InnovationApproach;
}

export interface WorkloadPreference {
  preferred: number; // 0 to 1
  capacity: number; // 0 to 1
  flexibility: number; // 0 to 1
}

export interface QualityStandard {
  threshold: number; // 0 to 1
  consistency: number; // 0 to 1
  improvement: boolean;
}

export enum InnovationApproach {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  INNOVATIVE = 'innovative',
  REVOLUTIONARY = 'revolutionary'
}

export interface CommunicationStrategy {
  frequency: CommunicationFrequency;
  channels: CommunicationChannel[];
  protocols: CommunicationProtocol[];
  escalation: EscalationProtocol;
}

export interface CommunicationFrequency {
  minimum: number; // messages per hour
  maximum: number; // messages per hour
  preferred: number; // messages per hour
  adaptive: boolean;
}

export interface CommunicationProtocol {
  type: ProtocolType;
  rules: CommunicationRule[];
  templates: MessageTemplate[];
}

export enum ProtocolType {
  STATUS_UPDATE = 'status_update',
  COORDINATION = 'coordination',
  DECISION = 'decision',
  CONFLICT = 'conflict',
  SOCIAL = 'social'
}

export interface CommunicationRule {
  condition: string;
  action: string;
  timing: number; // milliseconds
  priority: number; // 0 to 1
}

export interface EscalationProtocol {
  triggers: EscalationTrigger[];
  levels: EscalationLevel[];
  criteria: EscalationCriteria;
}

export interface EscalationTrigger {
  condition: string;
  threshold: number; // 0 to 1
  level: number;
}

export interface EscalationLevel {
  level: number;
  recipients: string[];
  method: CommunicationChannel;
  urgency: number; // 0 to 1
}

export interface EscalationCriteria {
  timeThreshold: number; // milliseconds
  severityThreshold: number; // 0 to 1
  impactThreshold: number; // 0 to 1
}

export interface EvaluationMethod {
  metrics: EvaluationMetric[];
  feedback: FeedbackMethod;
  learning: boolean;
  adjustment: AdjustmentStrategy;
}

export interface EvaluationMetric {
  name: string;
  weight: number; // 0 to 1
  target: number; // 0 to 1
  measurement: MeasurementType;
}

export enum MeasurementType {
  QUANTITATIVE = 'quantitative',
  QUALITATIVE = 'qualitative',
  PEER_REVIEW = 'peer_review',
  SELF_ASSESSMENT = 'self_assessment'
}

export enum FeedbackMethod {
  REAL_TIME = 'real_time',
  PERIODIC = 'periodic',
  ON_DEMAND = 'on_demand',
  PEER_TO_PEER = 'peer_to_peer'
}

export interface AdjustmentStrategy {
  triggers: AdjustmentTrigger[];
  actions: AdjustmentAction[];
  evaluation: number; // milliseconds
}

export interface AdjustmentAction {
  type: string;
  scope: AdjustmentScope;
  impact: number; // 0 to 1
}

export enum AdjustmentScope {
  INDIVIDUAL = 'individual',
  GROUP = 'group',
  COORDINATION = 'coordination',
  COMMUNICATION = 'communication'
}

export interface SocialConstraint {
  type: SocialConstraintType;
  description: string;
  severity: number; // 0 to 1
  impact: string;
  duration: number; // milliseconds
}

export enum SocialConstraintType {
  RELATIONSHIP = 'relationship',
  REPUTATION = 'reputation',
  GROUP_OBLIGATION = 'group_obligation',
  SOCIAL_NORM = 'social_norm',
  COMMUNICATION = 'communication'
}
```

## Social Context Interfaces

### Social Context Modeling

```typescript
/**
 * Social context interfaces
 * Provides real-time social awareness and context
 */

export interface SocialContext {
  agentId: string;
  nearbyAgents: NearbyAgent[];
  activeConversations: Conversation[];
  groupActivities: GroupActivity[];
  socialEvents: SocialEvent[];
  environmentalSocialFactors: EnvironmentalSocialFactor[];
  temporalSocialFactors: TemporalSocialFactor[];
  lastUpdate: number;
}

export interface NearbyAgent {
  agentId: string;
  distance: number;
  lineOfSight: boolean;
  activity: string;
  attention: AttentionState;
  accessibility: number; // 0 to 1
  approachability: number; // 0 to 1
  lastObserved: number;
}

export interface AttentionState {
  focus: string;
  intensity: number; // 0 to 1
  availability: number; // 0 to 1
  direction: { x: number; y: number; z: number };
}

export interface Conversation {
  id: string;
  participants: string[];
  topic: string;
  status: ConversationStatus;
  duration: number;
  accessibility: number; // 0 to 1
  relevance: number; // 0 to 1
  joinability: number; // 0 to 1
  startTime: number;
}

export enum ConversationStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDING = 'ending',
  PRIVATE = 'private',
  PUBLIC = 'public'
}

export interface GroupActivity {
  id: string;
  groupId: string;
  activity: string;
  participants: string[];
  status: ActivityStatus;
  progress: number; // 0 to 1
  accessibility: number; // 0 to 1
  joinability: number; // 0 to 1
  startTime: number;
  estimatedDuration: number;
}

export enum ActivityStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETING = 'completing',
  COMPLETED = 'completed'
}

export interface SocialEvent {
  id: string;
  type: SocialEventType;
  participants: string[];
  importance: number; // 0 to 1
  urgency: number; // 0 to 1
  accessibility: number; // 0 to 1
  startTime: number;
  duration: number;
  location: { x: number; y: number; z: number };
  description: string;
}

export enum SocialEventType {
  CELEBRATION = 'celebration',
  CONFLICT = 'conflict',
  COLLABORATION = 'collaboration',
  COMPETITION = 'competition',
  CEREMONY = 'ceremony',
  GATHERING = 'gathering',
  EMERGENCY = 'emergency'
}

export interface EnvironmentalSocialFactor {
  type: EnvironmentalSocialType;
  severity: number; // 0 to 1
  duration: number; // milliseconds
  impact: SocialImpact;
  location: { x: number; y: number; z: number; radius: number };
}

export enum EnvironmentalSocialType {
  CROWDING = 'crowding',
  NOISE = 'noise',
  PRIVACY = 'privacy',
  DANGER = 'danger',
  OPPORTUNITY = 'opportunity',
  RESOURCE_SCARCITY = 'resource_scarcity'
}

export interface SocialImpact {
  communication: number; // -1 to 1
  collaboration: number; // -1 to 1
  stress: number; // -1 to 1
  productivity: number; // -1 to 1
  morale: number; // -1 to 1
}

export interface TemporalSocialFactor {
  type: TemporalSocialType;
  timeOfDay: number; // 0 to 24000
  dayOfWeek: number; // 0 to 6
  season: Season;
  impact: SocialImpact;
  duration: number; // milliseconds
}

export enum TemporalSocialType {
  WORK_TIME = 'work_time',
  SOCIAL_TIME = 'social_time',
  REST_TIME = 'rest_time',
  CELEBRATION_TIME = 'celebration_time',
  EMERGENCY_TIME = 'emergency_time'
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter'
}
```

## Social Memory Interfaces

### Social Memory System

```typescript
/**
 * Social memory interfaces
 * Extends existing memory system with social components
 */

export interface SocialMemoryState {
  episodic: SocialEpisodicMemory;
  semantic: SocialSemanticMemory;
  procedural: SocialProceduralMemory;
  working: SocialWorkingMemory;
  consolidation: SocialConsolidationState;
  lastUpdate: number;
}

export interface SocialEpisodicMemory {
  socialEvents: SocialEpisode[];
  interactions: SocialInteraction[];
  relationships: RelationshipEpisode[];
  conversations: ConversationEpisode[];
  collaborations: CollaborationEpisode[];
  conflicts: ConflictEpisode[];
  currentIndex: number;
  compressionLevel: number;
}

export interface SocialEpisode {
  id: string;
  timestamp: number;
  duration: number;
  location: { x: number; y: number; z: number };
  participants: string[];
  type: SocialEventType;
  context: SocialContext;
  outcomes: SocialOutcome[];
  emotionalImpact: number; // -1 to 1
  importance: number; // 0 to 1
  tags: string[];
  relatedEpisodes: string[];
}

export interface SocialInteraction {
  id: string;
  participants: string[];
  type: InteractionType;
  timestamp: number;
  duration: number;
  context: string;
  actions: SocialAction[];
  outcomes: SocialOutcome[];
  emotionalImpact: number; // -1 to 1
  relationshipChanges: Map<string, RelationshipChange>;
}

export interface SocialAction {
  actor: string;
  action: string;
  target?: string;
  timestamp: number;
  result: string;
  impact: SocialImpact;
}

export interface SocialOutcome {
  type: OutcomeType;
  description: string;
  success: boolean;
  satisfaction: number; // 0 to 1
  learning: string;
  consequences: string[];
}

export enum OutcomeType {
  RELATIONSHIP = 'relationship',
  TASK = 'task',
  EMOTIONAL = 'emotional',
  REPUTATION = 'reputation',
  RESOURCE = 'resource'
}

export interface RelationshipChange {
  agentId: string;
  trust: number; // -1 to 1
  friendship: number; // -1 to 1
  respect: number; // -1 to 1
  rivalry: number; // -1 to 1
  collaboration: number; // -1 to 1
}

export interface RelationshipEpisode {
  id: string;
  relationshipId: string;
  participants: string[];
  timestamp: number;
  type: RelationshipEventType;
  description: string;
  impact: RelationshipChange;
  context: string;
  significance: number; // 0 to 1
}

export interface ConversationEpisode {
  id: string;
  participants: string[];
  topic: string;
  timestamp: number;
  duration: number;
  messages: ConversationMessage[];
  outcomes: ConversationOutcome[];
  emotionalTone: EmotionalTone;
  satisfaction: number; // 0 to 1
}

export interface ConversationMessage {
  speaker: string;
  content: string;
  timestamp: number;
  type: MessageType;
  emotionalContent: EmotionalContent;
  response?: string;
}

export enum MessageType {
  STATEMENT = 'statement',
  QUESTION = 'question',
  REQUEST = 'request',
  OFFER = 'offer',
  COMPLIMENT = 'compliment',
  CRITICISM = 'criticism'
}

export interface EmotionalContent {
  valence: number; // -1 to 1
  arousal: number; // 0 to 1
  emotions: EmotionType[];
}

export interface EmotionalTone {
  overall: EmotionalContent;
  progression: EmotionalContent[];
  conflicts: EmotionalConflict[];
}

export interface EmotionalConflict {
  emotion1: EmotionType;
  emotion2: EmotionType;
  intensity: number; // 0 to 1
  resolution: EmotionType;
}

export interface ConversationOutcome {
  type: ConversationOutcomeType;
  description: string;
  success: boolean;
  impact: ConversationImpact;
}

export enum ConversationOutcomeType {
  UNDERSTANDING = 'understanding',
  AGREEMENT = 'agreement',
  DISAGREEMENT = 'disagreement',
  RELATIONSHIP_CHANGE = 'relationship_change',
  INFORMATION_EXCHANGE = 'information_exchange',
  DECISION = 'decision'
}

export interface ConversationImpact {
  relationship: number; // -1 to 1
  knowledge: number; // 0 to 1
  emotional: number; // -1 to 1
  goal: number; // -1 to 1
}

export interface CollaborationEpisode {
  id: string;
  collaborationId: string;
  participants: string[];
  goal: string;
  timestamp: number;
  duration: number;
  phases: CollaborationPhase[];
  outcomes: CollaborationOutcome[];
  performance: CollaborationPerformance;
}

export interface CollaborationPhase {
  name: string;
  startTime: number;
  endTime: number;
  activities: string[];
  contributions: Map<string, Contribution>; // agentId -> contribution
}

export interface Contribution {
  type: ContributionType;
  quality: number; // 0 to 1
  impact: number; // 0 to 1
  effort: number; // 0 to 1
  innovation: number; // 0 to 1
}

export enum ContributionType {
  LEADERSHIP = 'leadership',
  EXPERTISE = 'expertise',
  COORDINATION = 'coordination',
  SUPPORT = 'support',
  COMMUNICATION = 'communication',
  EXECUTION = 'execution'
}

export interface CollaborationOutcome {
  type: CollaborationOutcomeType;
  description: string;
  success: boolean;
  impact: CollaborationImpact;
}

export enum CollaborationOutcomeType {
  GOAL_ACHIEVEMENT = 'goal_achievement',
  RELATIONSHIP_BUILDING = 'relationship_building',
  SKILL_DEVELOPMENT = 'skill_development',
  KNOWLEDGE_SHARING = 'knowledge_sharing',
  INNOVATION = 'innovation'
}

export interface CollaborationImpact {
  task: number; // 0 to 1
  relationship: number; // -1 to 1
  learning: number; // 0 to 1
  efficiency: number; // 0 to 1
  innovation: number; // 0 to 1
}

export interface CollaborationPerformance {
  effectiveness: number; // 0 to 1
  efficiency: number; // 0 to 1
  coordination: number; // 0 to 1
  communication: number; // 0 to 1
  satisfaction: number; // 0 to 1
}

export interface ConflictEpisode {
  id: string;
  conflictId: string;
  participants: string[];
  type: ConflictType;
  timestamp: number;
  duration: number;
  causes: ConflictCause[];
  escalation: ConflictEscalation;
  resolution: ConflictResolution;
  outcomes: ConflictOutcome[];
}

export interface ConflictCause {
  type: ConflictCauseType;
  description: string;
  severity: number; // 0 to 1
  contributors: string[];
}

export enum ConflictCauseType {
  RESOURCE = 'resource',
  GOAL = 'goal',
  VALUE = 'value',
  MISUNDERSTANDING = 'misunderstanding',
  PERSONALITY = 'personality',
  EXTERNAL = 'external'
}

export interface ConflictEscalation {
  levels: ConflictLevel[];
  triggers: string[];
  timeline: ConflictTimeline[];
}

export interface ConflictLevel {
  level: number;
  description: string;
  intensity: number; // 0 to 1
  actions: string[];
}

export interface ConflictTimeline {
  timestamp: number;
  event: string;
  impact: number; // 0 to 1
}

export interface ConflictResolution {
  method: ConflictResolutionMethod;
  outcome: ConflictResolutionOutcome;
  satisfaction: Map<string, number>; // agentId -> satisfaction
  durability: number; // 0 to 1
}

export enum ConflictResolutionMethod {
  NEGOTIATION = 'negotiation',
  MEDIATION = 'mediation',
  ARBITRATION = 'arbitration',
  AVOIDANCE = 'avoidance',
  COMPROMISE = 'compromise',
  DOMINATION = 'domination'
}

export enum ConflictResolutionOutcome {
  AGREEMENT = 'agreement',
  PARTIAL_AGREEMENT = 'partial_agreement',
  STALEMATE = 'stalemate',
  WIN_LOSE = 'win_lose',
  ESCALATION = 'escalation'
}

export interface ConflictOutcome {
  type: ConflictOutcomeType;
  description: string;
  impact: ConflictImpact;
}

export enum ConflictOutcomeType {
  RELATIONSHIP_DAMAGE = 'relationship_damage',
  RELATIONSHIP_IMPROVEMENT = 'relationship_improvement',
  RESOURCE_CHANGE = 'resource_change',
  GOAL_CHANGE = 'goal_change',
  LEARNING = 'learning'
}

export interface ConflictImpact {
  relationship: number; // -1 to 1
  trust: number; // -1 to 1
  collaboration: number; // -1 to 1
  stress: number; // 0 to 1
  learning: number; // 0 to 1
}

export interface SocialSemanticMemory {
  socialConcepts: Map<string, SocialConcept>;
  relationshipConcepts: Map<string, RelationshipConcept>;
  socialRules: Map<string, SocialRule>;
  socialNorms: Map<string, SocialNorm>;
  socialSchemas: Map<string, SocialSchema>;
}

export interface SocialConcept {
  id: string;
  name: string;
  type: SocialConceptType;
  attributes: SocialAttributes;
  relationships: SocialRelationship[];
  examples: SocialExample[];
  lastAccessed: number;
  importance: number; // 0 to 1
}

export enum SocialConceptType {
  ROLE = 'role',
  STATUS = 'status',
  GROUP = 'group',
  NORM = 'norm',
  VALUE = 'value',
  RITUAL = 'ritual',
  CONFLICT = 'conflict',
  COLLABORATION = 'collaboration'
}

export interface SocialAttributes {
  formality: number; // 0 to 1
  hierarchy: number; // 0 to 1
  inclusivity: number; // 0 to 1
  stability: number; // 0 to 1
  visibility: number; // 0 to 1
}

export interface SocialRelationship {
  targetConcept: string;
  type: SocialRelationshipType;
  strength: number; // 0 to 1
  context: string;
}

export enum SocialRelationshipType {
  IS_A = 'is_a',
  PART_OF = 'part_of',
  LEADS_TO = 'leads_to',
  REQUIRES = 'requires',
  PROHIBITS = 'prohibits',
  ENABLES = 'enables'
}

export interface SocialExample {
  description: string;
  context: string;
  outcome: string;
  relevance: number; // 0 to 1
}

export interface RelationshipConcept {
  relationshipType: string;
  characteristics: RelationshipCharacteristic[];
  expectations: RelationshipExpectation[];
  behaviors: RelationshipBehavior[];
  contexts: string[];
}

export interface RelationshipCharacteristic {
  trait: string;
  importance: number; // 0 to 1
  variability: number; // 0 to 1
}

export interface RelationshipExpectation {
  situation: string;
  expectedBehavior: string;
  importance: number; // 0 to 1
  flexibility: number; // 0 to 1
}

export interface RelationshipBehavior {
  trigger: string;
  action: string;
  frequency: number; // 0 to 1
  appropriateness: number; // 0 to 1
}

export interface SocialRule {
  id: string;
  description: string;
  type: SocialRuleType;
  conditions: SocialCondition[];
  actions: SocialAction[];
  exceptions: SocialException[];
  importance: number; // 0 to 1
}

export enum SocialRuleType {
  PROTOCOL = 'protocol',
  ETIQUETTE = 'etiquette',
  NORM = 'norm',
  LAW = 'law',
  CUSTOM = 'custom'
}

export interface SocialCondition {
  factor: string;
  operator: ComparisonOperator;
  value: any;
  weight: number; // 0 to 1
}

export enum ComparisonOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  MATCHES = 'matches'
}

export interface SocialException {
  condition: string;
  override: string;
  justification: string;
}

export interface SocialNorm {
  id: string;
  group: string;
  behavior: string;
  compliance: number; // 0 to 1
  enforcement: EnforcementType;
  sanctions: string[];
  rewards: string[];
}

export enum EnforcementType {
  FORMAL = 'formal',
  INFORMAL = 'informal',
  SOCIAL = 'social',
  SELF = 'self'
}

export interface SocialSchema {
  id: string;
  name: string;
  type: SchemaType;
  roles: SchemaRole[];
  sequence: SchemaSequence[];
  expectations: SchemaExpectation[];
  variations: SchemaVariation[];
}

export enum SchemaType {
  SCRIPT = 'script',
  FRAME = 'frame',
  PROTOTYPE = 'prototype',
  SCENARIO = 'scenario'
}

export interface SchemaRole {
  name: string;
  responsibilities: string[];
  behaviors: string[];
  expectations: string[];
}

export interface SchemaSequence {
  step: number;
  action: string;
  actors: string[];
  conditions: string[];
  outcomes: string[];
}

export interface SchemaExpectation {
  role: string;
  behavior: string;
  timing: string;
  importance: number; // 0 to 1
}

export interface SchemaVariation {
  context: string;
  modifications: SchemaModification[];
  probability: number; // 0 to 1
}

export interface SchemaModification {
  type: ModificationType;
  element: string;
  change: string;
}

export enum ModificationType {
  ADD = 'add',
  REMOVE = 'remove',
  MODIFY = 'modify',
  REORDER = 'reorder'
}

export interface SocialProceduralMemory {
  socialSkills: Map<string, SocialSkill>;
  protocols: Map<string, SocialProtocol>;
  strategies: Map<string, SocialStrategy>;
  habits: SocialHabit[];
}

export interface SocialSkill {
  id: string;
  name: string;
  type: SocialSkillType;
  components: SocialSkillComponent[];
  proficiency: ProficiencyMetrics;
  usage: SocialUsageStatistics;
  adaptations: SocialSkillAdaptation[];
}

export enum SocialSkillType {
  COMMUNICATION = 'communication',
  LEADERSHIP = 'leadership',
  COLLABORATION = 'collaboration',
  EMPATHY = 'empathy',
  PERSUASION = 'persuasion',
  CONFLICT_RESOLUTION = 'conflict_resolution',
  NETWORKING = 'networking',
  MENTORING = 'mentoring'
}

export interface SocialSkillComponent {
  name: string;
  level: number; // 0 to 1
  practice: number; // 0 to 1
  theory: number; // 0 to 1
}

export interface SocialUsageStatistics {
  totalUses: number;
  successfulUses: number;
  recentUses: number[];
  averageEffectiveness: number; // 0 to 1
  lastUsed: number;
  contexts: string[];
}

export interface SocialSkillAdaptation {
  context: string;
  modification: string;
  effectiveness: number; // 0 to 1
  timestamp: number;
}

export interface SocialProtocol {
  id: string;
  name: string;
  type: ProtocolType;
  steps: ProtocolStep[];
  prerequisites: string[];
  context: string;
  successRate: number; // 0 to 1
}

export interface ProtocolStep {
  action: string;
  parameters: Record<string, any>;
  expectedOutcome: string;
  timeout: number;
  fallback?: string;
}

export interface SocialStrategy {
  id: string;
  name: string;
  type: StrategyType;
  goals: string[];
  tactics: SocialTactic[];
  requirements: StrategyRequirement[];
  risks: StrategyRisk[];
}

export enum StrategyType {
  RELATIONSHIP_BUILDING = 'relationship_building',
  CONFLICT_MANAGEMENT = 'conflict_management',
  COLLABORATION = 'collaboration',
  INFLUENCE = 'influence',
  NETWORKING = 'networking',
  REPUTATION_MANAGEMENT = 'reputation_management'
}

export interface SocialTactic {
  name: string;
  description: string;
  conditions: string[];
  actions: string[];
  expectedOutcome: string;
  effectiveness: number; // 0 to 1
}

export interface StrategyRequirement {
  type: RequirementType;
  description: string;
  importance: number; // 0 to 1
}

export enum RequirementType {
  SKILL = 'skill',
  RESOURCE = 'resource',
  RELATIONSHIP = 'relationship',
  CONTEXT = 'context',
  TIME = 'time'
}

export interface StrategyRisk {
  type: RiskType;
  description: string;
  probability: number; // 0 to 1
  impact: number; // 0 to 1
  mitigation: string;
}

export enum RiskType {
  RELATIONSHIP_DAMAGE = 'relationship_damage',
  REPUTATION_LOSS = 'reputation_loss',
  RESOURCE_WASTE = 'resource_waste',
  TIME_LOSS = 'time_loss',
  SOCIAL_EXCLUSION = 'social_exclusion'
}

export interface SocialHabit {
  trigger: SocialTrigger;
  action: SocialAction;
  frequency: number;
  strength: number; // 0 to 1
  context: string;
  automaticity: number; // 0 to 1
}

export interface SocialTrigger {
  type: TriggerType;
  stimulus: string;
  conditions: string[];
}

export enum TriggerType {
  SOCIAL_CUE = 'social_cue',
  EMOTIONAL_STATE = 'emotional_state',
  ENVIRONMENTAL_FACTOR = 'environmental_factor',
  TEMPORAL_PATTERN = 'temporal_pattern',
  INTERNAL_STATE = 'internal_state'
}

export interface SocialWorkingMemory {
  currentSocialFocus: SocialFocus;
  activeSocialTasks: SocialTask[];
  socialBuffer: SocialBufferItem[];
  socialAttention: SocialAttention;
  socialCapacity: number;
  decayRate: number;
}

export interface SocialFocus {
  type: FocusType;
  target: string;
  importance: number; // 0 to 1
  duration: number; // milliseconds
  context: string;
}

export enum FocusType {
  RELATIONSHIP = 'relationship',
  CONVERSATION = 'conversation',
  COLLABORATION = 'collaboration',
  CONFLICT = 'conflict',
  GROUP = 'group',
  TASK = 'task'
}

export interface SocialTask {
  id: string;
  type: SocialTaskType;
  description: string;
  priority: number; // 0 to 1
  status: TaskStatus;
  progress: number; // 0 to 1
  deadline?: number;
  dependencies: string[];
  resources: string[];
}

export enum SocialTaskType {
  COMMUNICATION = 'communication',
  RELATIONSHIP_MAINTENANCE = 'relationship_maintenance',
  COLLABORATION = 'collaboration',
  CONFLICT_RESOLUTION = 'conflict_resolution',
  NETWORKING = 'networking',
  SUPPORT = 'support'
}

export enum TaskStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface SocialBufferItem {
  id: string;
  content: any;
  type: SocialBufferType;
  priority: number; // 0 to 1
  timestamp: number;
  decayRate: number;
  source: string;
}

export enum SocialBufferType {
  OBSERVATION = 'observation',
  INTERACTION = 'interaction',
  CONVERSATION = 'conversation',
  EMOTION = 'emotion',
  INTENTION = 'intention',
  RELATIONSHIP = 'relationship'
}

export interface SocialAttention {
  focus: SocialFocus;
  capacity: number; // 0 to 1
  allocation: Map<string, number>; // target -> allocation
  filters: AttentionFilter[];
  priorities: AttentionPriority[];
}

export interface AttentionFilter {
  type: FilterType;
  criteria: string;
  strength: number; // 0 to 1
}

export enum FilterType {
  RELATIONSHIP = 'relationship',
  IMPORTANCE = 'importance',
  PROXIMITY = 'proximity',
  RELEVANCE = 'relevance',
  URGENTCY = 'urgency'
}

export interface AttentionPriority {
  target: string;
  priority: number; // 0 to 1
  reason: string;
  timestamp: number;
}

export interface SocialConsolidationState {
  lastConsolidation: number;
  consolidationInterval: number;
  patterns: SocialPattern[];
  schemas: SocialSchema[];
  rules: SocialRule[];
  concepts: SocialConcept[];
  skills: SocialSkill[];
}

export interface SocialPattern {
  id: string;
  type: PatternType;
  description: string;
  frequency: number;
  contexts: string[];
  outcomes: PatternOutcome[];
  importance: number; // 0 to 1
}

export enum PatternType {
  INTERACTION = 'interaction',
  RELATIONSHIP = 'relationship',
  CONVERSATION = 'conversation',
  COLLABORATION = 'collaboration',
  CONFLICT = 'conflict'
}

export interface PatternOutcome {
  type: string;
  probability: number; // 0 to 1
  impact: number; // 0 to 1
  conditions: string[];
}
```

## Social Processing Interfaces

### Social Processing State

```typescript
/**
 * Social processing interfaces
 * Manages the cognitive processing of social information
 */

export interface SocialProcessingState {
  currentPhase: SocialProcessingPhase;
  cognitiveLoad: number; // 0 to 1
  attentionLevel: number; // 0 to 1
  decisionThreshold: number; // 0 to 1
  processingHistory: SocialProcessingRecord[];
  performanceMetrics: SocialPerformanceMetrics;
}

export enum SocialProcessingPhase {
  PERCEPTION = 'perception',
  ANALYSIS = 'analysis',
  INTERPRETATION = 'interpretation',
  PLANNING = 'planning',
  DECISION = 'decision',
  EXECUTION = 'execution',
  REFLECTION = 'reflection'
}

export interface SocialProcessingRecord {
  phase: SocialProcessingPhase;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  details: SocialProcessingDetails;
}

export interface SocialProcessingDetails {
  input: SocialInput;
  processing: SocialProcessingSteps;
  output: SocialOutput;
  context: SocialContext;
  performance: SocialStepPerformance[];
}

export interface SocialInput {
  type: SocialInputType;
  source: string;
  content: any;
  timestamp: number;
  importance: number; // 0 to 1
  urgency: number; // 0 to 1
}

export enum SocialInputType {
  OBSERVATION = 'observation',
  COMMUNICATION = 'communication',
  INTERACTION = 'interaction',
  EVENT = 'event',
  MEMORY = 'memory'
}

export interface SocialProcessingSteps {
  perception: SocialPerceptionStep;
  analysis: SocialAnalysisStep;
  interpretation: SocialInterpretationStep;
  planning: SocialPlanningStep;
  decision: SocialDecisionStep;
}

export interface SocialPerceptionStep {
  detected: SocialStimulus[];
  filtered: SocialStimulus[];
  attended: SocialStimulus[];
  processed: SocialStimulus[];
}

export interface SocialStimulus {
  id: string;
  type: SocialStimulusType;
  source: string;
  intensity: number; // 0 to 1
  relevance: number; // 0 to 1
  timestamp: number;
}

export enum SocialStimulusType {
  AGENT_PRESENCE = 'agent_presence',
  COMMUNICATION = 'communication',
  EMOTIONAL_EXPRESSION = 'emotional_expression',
  SOCIAL_ACTION = 'social_action',
  GROUP_ACTIVITY = 'group_activity'
}

export interface SocialAnalysisStep {
  categorized: SocialCategory[];
  contextualized: SocialContext[];
  prioritized: SocialPriority[];
  relevant: SocialRelevance[];
}

export interface SocialCategory {
  stimulusId: string;
  category: string;
  confidence: number; // 0 to 1
  alternatives: string[];
}

export interface SocialPriority {
  stimulusId: string;
  priority: number; // 0 to 1
  factors: PriorityFactor[];
  reasoning: string;
}

export interface PriorityFactor {
  factor: string;
  weight: number;
  value: number;
}

export interface SocialRelevance {
  stimulusId: string;
  relevance: number; // 0 to 1
  toGoals: number; // 0 to 1
  toRelationships: number; // 0 to 1
  toCurrentTask: number; // 0 to 1
}

export interface SocialInterpretationStep {
  inferred: SocialInference[];
  predicted: SocialPrediction[];
  understood: SocialUnderstanding[];
  modeled: SocialModel[];
}

export interface SocialInference {
  type: InferenceType;
  conclusion: string;
  evidence: string[];
  confidence: number; // 0 to 1
  alternatives: string[];
}

export enum InferenceType {
  INTENTION = 'intention',
  EMOTION = 'emotion',
  BELIEF = 'belief',
  GOAL = 'goal',
  RELATIONSHIP = 'relationship'
}

export interface SocialPrediction {
  type: PredictionType;
  prediction: string;
  probability: number; // 0 to 1
  timeframe: number; // milliseconds
  confidence: number; // 0 to 1
}

export enum PredictionType {
  ACTION = 'action',
  REACTION = 'reaction',
  OUTCOME = 'outcome',
  RELATIONSHIP_CHANGE = 'relationship_change'
}

export interface SocialUnderstanding {
  topic: string;
  level: number; // 0 to 1
  gaps: string[];
  questions: string[];
  confidence: number; // 0 to 1
}

export interface SocialModel {
  target: string;
  model: MentalModel;
  accuracy: number; // 0 to 1
  confidence: number; // 0 to 1
}

export interface SocialPlanningStep {
  goals: SocialGoal[];
  strategies: SocialStrategy[];
  actions: SocialAction[];
  resources: SocialResource[];
}

export interface SocialGoal {
  id: string;
  description: string;
  priority: number; // 0 to 1
  deadline?: number;
  prerequisites: string[];
  expectedOutcome: string;
}

export interface SocialResource {
  type: ResourceType;
  quantity: number;
  availability: number; // 0 to 1
  cost: number;
}

export enum ResourceType {
  TIME = 'time',
  ATTENTION = 'attention',
  ENERGY = 'energy',
  SOCIAL_CAPITAL = 'social_capital',
  RELATIONSHIP = 'relationship'
}

export interface SocialDecisionStep {
  options: SocialOption[];
  evaluation: SocialEvaluation[];
  selected: SocialOption;
  reasoning: string;
  confidence: number; // 0 to 1
}

export interface SocialOption {
  id: string;
  description: string;
  actions: SocialAction[];
  outcomes: SocialOutcome[];
  costs: SocialCost[];
  benefits: SocialBenefit[];
}

export interface SocialCost {
  type: CostType;
  amount: number;
  impact: string;
}

export enum CostType {
  TIME = 'time',
  ENERGY = 'energy',
  SOCIAL_CAPITAL = 'social_capital',
  RELATIONSHIP = 'relationship',
  REPUTATION = 'reputation'
}

export interface SocialBenefit {
  type: BenefitType;
  amount: number;
  impact: string;
}

export enum BenefitType {
  RELATIONSHIP_IMPROVEMENT = 'relationship_improvement',
  GOAL_PROGRESS = 'goal_progress',
  KNOWLEDGE_GAIN = 'knowledge_gain',
  SOCIAL_CAPITAL = 'social_capital',
  REPUTATION = 'reputation'
}

export interface SocialEvaluation {
  optionId: string;
  criteria: SocialCriteria[];
  scores: Map<string, number>; // criteria -> score
  overall: number; // 0 to 1
}

export interface SocialCriteria {
  name: string;
  weight: number; // 0 to 1
  description: string;
}

export interface SocialOutput {
  action: SocialAction;
  communication: SocialCommunication;
  emotionalResponse: EmotionalResponse;
  relationshipUpdate: RelationshipUpdate;
}

export interface SocialCommunication {
  type: CommunicationType;
  content: string;
  target: string;
  channel: CommunicationChannel;
  timing: CommunicationTiming;
}

export enum CommunicationType {
  STATEMENT = 'statement',
  QUESTION = 'question',
  REQUEST = 'request',
  RESPONSE = 'response',
  EXPRESSION = 'expression'
}

export interface CommunicationTiming {
  immediate: boolean;
  delay?: number; // milliseconds
  priority: number; // 0 to 1
}

export interface EmotionalResponse {
  emotion: Emotion;
  expression: EmotionalExpression;
  regulation: EmotionalRegulation;
}

export interface RelationshipUpdate {
  targetId: string;
  changes: RelationshipChange;
  reason: string;
  confidence: number; // 0 to 1
}

export interface SocialStepPerformance {
  step: string;
  duration: number;
  success: boolean;
  quality: number; // 0 to 1
  efficiency: number; // 0 to 1
}

export interface SocialPerformanceMetrics {
  perceptionAccuracy: number; // 0 to 1
  inferenceAccuracy: number; // 0 to 1
  predictionAccuracy: number; // 0 to 1
  decisionEffectiveness: number; // 0 to 1
  actionSuccess: number; // 0 to 1
  relationshipQuality: number; // 0 to 1
  socialEfficiency: number; // 0 to 1
  learningRate: number; // 0 to 1
}
```

## Configuration and Integration Interfaces

### System Configuration

```typescript
/**
 * Configuration interfaces for the social relationship system
 * Follows the pattern established by other cognitive components
 */

export interface SocialSystemConfig {
  relationshipManager: RelationshipManagerConfig;
  theoryOfMind: TheoryOfMindConfig;
  socialDecisionMaker: SocialDecisionMakerConfig;
  socialCoordinator: SocialCoordinatorConfig;
  memory: SocialMemoryConfig;
  processing: SocialProcessingConfig;
  integration: SocialIntegrationConfig;
  performance: SocialPerformanceConfig;
}

export interface RelationshipManagerConfig {
  maxRelationships: number;
  relationshipUpdateInterval: number; // milliseconds
  trustDecayRate: number; // 0 to 1 per hour
  friendshipDecayRate: number; // 0 to 1 per hour
  reputationUpdateThreshold: number; // minimum interactions
  networkAnalysisInterval: number; // milliseconds
  historyRetentionPeriod: number; // milliseconds
  enablePrediction: boolean;
  enableTrendAnalysis: boolean;
  enableNetworkTopology: boolean;
}

export interface TheoryOfMindConfig {
  maxMentalModels: number;
  modelUpdateInterval: number; // milliseconds
  inferenceAccuracy: number; // 0 to 1 target
  predictionTimeframe: number; // milliseconds
  confidenceThreshold: number; // 0 to 1
  enableBeliefModeling: boolean;
  enableEmotionalModeling: boolean;
  enableKnowledgeTracking: boolean;
  enableIntentionPrediction: boolean;
  learningRate: number; // 0 to 1
  modelDecayRate: number; // 0 to 1 per hour
}

export interface SocialDecisionMakerConfig {
  socialWeight: number; // 0 to 1 influence on decisions
  utilityCalculationMethod: UtilityMethod;
  conflictResolutionApproach: ConflictApproach;
  collaborationInitiationThreshold: number; // 0 to 1
  groupInfluenceWeight: number; // 0 to 1
  enableSocialRiskAssessment: boolean;
  enableGroupDynamics: boolean;
  enableSocialLearning: boolean;
  decisionTimeout: number; // milliseconds
}

export enum UtilityMethod {
  WEIGHTED_SUM = 'weighted_sum',
  MULTIPLICATIVE = 'multiplicative',
  FUZZY_LOGIC = 'fuzzy_logic',
  NEURAL_NETWORK = 'neural_network'
}

export interface SocialCoordinatorConfig {
  maxConcurrentCollaborations: number;
  communicationTimeout: number; // milliseconds
  coordinationUpdateInterval: number; // milliseconds
  enableConflictMediation: boolean;
  enableGroupFormation: boolean;
  enableSocialSynchronization: boolean;
  leaderElectionMethod: LeaderElectionMethod;
  consensusThreshold: number; // 0 to 1
}

export enum LeaderElectionMethod {
  SENIORITY = 'seniority',
  COMPETENCE = 'competence',
  REPUTATION = 'reputation',
  SOCIAL_INFLUENCE = 'social_influence',
  ROTATING = 'rotating'
}

export interface SocialMemoryConfig {
  episodicRetentionPeriod: number; // milliseconds
  semanticConceptLimit: number;
  proceduralSkillLimit: number;
  workingMemoryCapacity: number;
  consolidationInterval: number; // milliseconds
  enableSocialMemoryCompression: boolean;
  enablePatternExtraction: boolean;
  enableSchemaFormation: boolean;
  memoryDecayRate: number; // 0 to 1 per hour
}

export interface SocialProcessingConfig {
  maxCognitiveLoad: number; // 0 to 1
  attentionCapacity: number; // 0 to 1
  processingTimeout: number; // milliseconds
  enableParallelProcessing: boolean;
  enableAttentionFiltering: boolean;
  enableSocialPrioritization: boolean;
  stimulusFilterThreshold: number; // 0 to 1
}

export interface SocialIntegrationConfig {
  langGraphIntegration: LangGraphIntegrationConfig;
  purposeCoreIntegration: PurposeCoreIntegrationConfig;
  goalSystemIntegration: GoalSystemIntegrationConfig;
  memorySystemIntegration: MemorySystemIntegrationConfig;
  reactiveIntegration: ReactiveIntegrationConfig;
}

export interface LangGraphIntegrationConfig {
  stateNodeInterval: number; // milliseconds
  enableSocialNodes: boolean;
  socialNodePriority: number; // 0 to 1
  enableSocialInterrupts: boolean;
  socialInterruptThreshold: number; // 0 to 1
}

export interface PurposeCoreIntegrationConfig {
  socialInfluenceWeight: number; // 0 to 1
  enableSocialMotivation: boolean;
  enableSocialValues: boolean;
  enableSocialEthics: boolean;
  personalitySocialWeight: number; // 0 to 1
}

export interface GoalSystemIntegrationConfig {
  socialGoalWeight: number; // 0 to 1
  enableCollaborativeGoals: boolean;
  enableSocialPrioritization: boolean;
  socialGoalThreshold: number; // 0 to 1
  enableSocialResourceAllocation: boolean;
}

export interface MemorySystemIntegrationConfig {
  socialMemoryWeight: number; // 0 to 1
  enableSocialConsolidation: boolean;
  enableSocialLearning: boolean;
  socialMemoryPriority: number; // 0 to 1
  enableSocialRetrieval: boolean;
}

export interface ReactiveIntegrationConfig {
  socialInterruptPriority: InterruptPriority;
  enableSocialEmergencyResponse: boolean;
  socialEmergencyThreshold: number; // 0 to 1
  enableSocialSurvivalBehavior: boolean;
}

export interface SocialPerformanceConfig {
  enablePerformanceMonitoring: boolean;
  metricsCollectionInterval: number; // milliseconds
  performanceReportInterval: number; // milliseconds
  enableOptimization: boolean;
  enableAutoTuning: boolean;
  performanceTargets: SocialPerformanceTargets;
}

export interface SocialPerformanceTargets {
  socialProcessingTime: number; // milliseconds
  relationshipUpdateTime: number; // milliseconds
  theoryOfMindInferenceTime: number; // milliseconds
  socialDecisionTime: number; // milliseconds
  coordinationTime: number; // milliseconds
  memoryUsage: number; // MB
}

// Additional supporting interfaces for missing references

export interface MotivationModel {
  primaryMotivations: Motivation[];
  secondaryMotivations: Motivation[];
  drives: Map<string, number>; // drive type -> intensity
  satisfactions: Map<string, number>; // satisfaction type -> level
  conflicts: MotivationConflict[];
  confidence: number; // 0 to 1
}

export interface Motivation {
  type: string;
  intensity: number; // 0 to 1
  persistence: number; // 0 to 1
  context: string;
  triggers: string[];
}

export interface MotivationConflict {
  motivation1: string;
  motivation2: string;
  intensity: number; // 0 to 1
  resolution: ConflictResolution;
}

export enum ConflictResolution {
  DOMINANCE = 'dominance',
  COMPROMISE = 'compromise',
  AVOIDANCE = 'avoidance',
  INTEGRATION = 'integration'
}

export interface GoalModel {
  activeGoals: GoalPrediction[];
  potentialGoals: GoalPrediction[];
  priorities: Map<string, number>; // goalId -> priority
  strategies: Map<string, StrategyModel>;
  constraints: GoalConstraint[];
}

export interface GoalPrediction {
  goalId: string;
  description: string;
  probability: number; // 0 to 1
  timeframe: number; // milliseconds
  resources: string[];
  dependencies: string[];
  confidence: number; // 0 to 1
}

export interface StrategyModel {
  goalId: string;
  approach: string;
  likelihood: number; // 0 to 1
  effectiveness: number; // 0 to 1
  requirements: string[];
  risks: string[];
}

export interface GoalConstraint {
  type: ConstraintType;
  description: string;
  severity: number; // 0 to 1
  impact: string;
}

export enum ConstraintType {
  RESOURCE = 'resource',
  TIME = 'time',
  SKILL = 'skill',
  SOCIAL = 'social',
  ENVIRONMENTAL = 'environmental'
}

export interface CapabilityModel {
  skills: Map<string, SkillAssessment>; // skill -> assessment
  knowledge: Map<string, KnowledgeAssessment>; // domain -> assessment
  physical: PhysicalCapabilities;
  cognitive: CognitiveCapabilities;
  social: SocialCapabilities;
  limitations: Limitation[];
}

export interface SkillAssessment {
  level: number; // 0 to 1
  confidence: number; // 0 to 1
  lastObserved: number;
  context: string;
}

export interface KnowledgeAssessment {
  domain: string;
  depth: number; // 0 to 1
  breadth: number; // 0 to 1
  accuracy: number; // 0 to 1
  lastUpdated: number;
}

export interface PhysicalCapabilities {
  strength: number; // 0 to 1
  endurance: number; // 0 to 1
  agility: number; // 0 to 1
  health: number; // 0 to 1
}

export interface CognitiveCapabilities {
  reasoning: number; // 0 to 1
  memory: number; // 0 to 1
  creativity: number; // 0 to 1
  learning: number; // 0 to 1
  problemSolving: number; // 0 to 1
}

export interface SocialCapabilities {
  communication: number; // 0 to 1
  leadership: number; // 0 to 1
  empathy: number; // 0 to 1
  persuasion: number; // 0 to 1
  coordination: number; // 0 to 1
}

export interface Limitation {
  type: string;
  description: string;
  severity: number; // 0 to 1
  impact: string;
  workaround?: string;
}

export interface ConstraintModel {
  resourceConstraints: ResourceConstraint[];
  timeConstraints: TimeConstraint[];
  socialConstraints: SocialConstraint[];
  environmentalConstraints: EnvironmentalConstraint[];
  personalConstraints: PersonalConstraint[];
}

export interface ResourceConstraint {
  resource: string;
  scarcity: number; // 0 to 1
  impact: string;
  alternatives: string[];
}

export interface TimeConstraint {
  activity: string;
  timeLimit: number; // milliseconds
  flexibility: number; // 0 to 1
  consequences: string;
}

export interface EnvironmentalConstraint {
  factor: string;
  severity: number; // 0 to 1
  impact: string;
  adaptation: string;
}

export interface PersonalConstraint {
  type: string;
  description: string;
  strength: number; // 0 to 1
  origin: string;
}

export interface DecisionPattern {
  situation: string;
  factors: DecisionFactor[];
  outcome: string;
  frequency: number;
  success: number; // 0 to 1
  confidence: number; // 0 to 1
}

export interface DecisionFactor {
  factor: string;
  weight: number;
  value: number;
}
```

## LangGraph Integration Interfaces

### State Node Extensions

```typescript
/**
 * LangGraph integration interfaces for social components
 * Extends existing state node patterns with social functionality
 */

export interface SocialStateNode {
  name: string;
  type: SocialNodeType;
  processingFunction: SocialProcessingFunction;
  dependencies: string[];
  priority: number; // 0 to 1
  timeout: number; // milliseconds
}

export enum SocialNodeType {
  SOCIAL_PERCEPTION = 'social_perception',
  SOCIAL_ANALYSIS = 'social_analysis',
  THEORY_OF_MIND = 'theory_of_mind',
  SOCIAL_DECISION = 'social_decision',
  SOCIAL_COORDINATION = 'social_coordination',
  SOCIAL_REFLECTION = 'social_reflection'
}

export interface SocialProcessingFunction {
  (state: AgentState): Promise<Partial<AgentState>>;
}

export interface SocialPerceptionNode extends SocialStateNode {
  stimuliDetected: SocialStimulus[];
  attentionFilters: AttentionFilter[];
  perceptionAccuracy: number; // 0 to 1
}

export interface SocialAnalysisNode extends SocialStateNode {
  analysisMethods: AnalysisMethod[];
  contextualFactors: ContextualFactor[];
  analysisDepth: number; // 0 to 1
}

export enum AnalysisMethod {
  RELATIONSHIP_ANALYSIS = 'relationship_analysis',
  GROUP_DYNAMICS = 'group_dynamics',
  SOCIAL_CONTEXT = 'social_context',
  EMOTIONAL_STATE = 'emotional_state'
}

export interface ContextualFactor {
  factor: string;
  weight: number; // 0 to 1
  measurement: string;
}

export interface TheoryOfMindNode extends SocialStateNode {
  modelingApproach: ModelingApproach;
  inferenceMethods: InferenceMethod[];
  predictionAccuracy: number; // 0 to 1
}

export enum ModelingApproach {
  RULE_BASED = 'rule_based',
  PROBABILISTIC = 'probabilistic',
  NEURAL_NETWORK = 'neural_network',
  HYBRID = 'hybrid'
}

export enum InferenceMethod {
  DEDUCTIVE = 'deductive',
  INDUCTIVE = 'inductive',
  ABDUCTIVE = 'abductive',
  ANALOGICAL = 'analogical'
}

export interface SocialDecisionNode extends SocialStateNode {
  decisionStrategy: SocialDecisionStrategy;
  utilityFunction: SocialUtilityFunction;
  socialWeight: number; // 0 to 1
}

export enum SocialDecisionStrategy {
  UTILITARIAN = 'utilitarian',
  DEONTOLOGICAL = 'deontological',
  VIRTUE_ETHICS = 'virtue_ethics',
  SOCIAL_CONTRACT = 'social_contract'
}

export interface SocialUtilityFunction {
  (action: SocialAction, context: SocialContext): number;
}

export interface SocialCoordinationNode extends SocialStateNode {
  coordinationMethods: CoordinationMethod[];
  communicationProtocols: CommunicationProtocol[];
  synchronizationStrategy: SynchronizationStrategy;
}

export interface SynchronizationStrategy {
  type: SynchronizationType;
  timing: number; // milliseconds
  tolerance: number; // milliseconds
}

export enum SynchronizationType {
  SYNCHRONOUS = 'synchronous',
  ASYNCHRONOUS = 'asynchronous',
  SEMI_SYNCHRONOUS = 'semi_synchronous'
}

export interface SocialReflectionNode extends SocialStateNode {
  learningMethods: SocialLearningMethod[];
  memoryUpdateStrategies: MemoryUpdateStrategy[];
  adaptationRate: number; // 0 to 1
}

export enum SocialLearningMethod {
  REINFORCEMENT = 'reinforcement',
  OBSERVATIONAL = 'observational',
  SOCIAL_LEARNING = 'social_learning',
  EXPERIENTIAL = 'experiential'
}

export enum MemoryUpdateStrategy {
  IMMEDIATE = 'immediate',
  BATCH = 'batch',
  PRIORITY_BASED = 'priority_based',
  CONSOLIDATION_DRIVEN = 'consolidation_driven'
}
```

## Legacy Compatibility Interfaces

### Profile Integration

```typescript
/**
 * Legacy compatibility interfaces for social system
 * Ensures backward compatibility with existing agent profiles
 */

export interface SocialProfile {
  socialPersonality: SocialPersonalityTraits;
  initialRelationships: RelationshipSeed[];
  socialPreferences: SocialPreferences;
  communicationStyle: CommunicationStyle;
  collaborationTendencies: CollaborationProfile;
  socialHistory: SocialHistory;
}

export interface SocialPersonalityTraits {
  socialOpenness: number; // 0 to 1
  agreeableness: number; // 0 to 1
  extroversion: number; // 0 to 1
  socialAnxiety: number; // 0 to 1
  leadershipTendency: number; // 0 to 1
  conformityLevel: number; // 0 to 1
  competitiveness: number; // 0 to 1
  cooperativeness: number; // 0 to 1
  empathyLevel: number; // 0 to 1
  socialEnergy: number; // 0 to 1
}

export interface RelationshipSeed {
  targetAgentId: string;
  initialStatus: RelationshipStatus;
  initialTrust: number; // 0 to 1
  initialFriendship: number; // 0 to 1
  context: string;
  reason: string;
}

export interface CommunicationStyle {
  directness: number; // 0 to 1
  formality: number; // 0 to 1
  verbosity: number; // 0 to 1
  humorLevel: number; // 0 to 1
  emotionalExpression: number; // 0 to 1
  listeningTendency: number; // 0 to 1
  questioningStyle: QuestioningStyle;
}

export enum QuestioningStyle {
  DIRECT = 'direct',
  INDIRECT = 'indirect',
  PROBING = 'probing',
  CLARIFYING = 'clarifying',
  REFLECTIVE = 'reflective'
}

export interface CollaborationProfile {
  preferredRole: GroupRole;
  leadershipStyle: LeadershipStyle;
  teamworkPreference: number; // 0 to 1
  decisionMakingStyle: DecisionMakingStyle;
  conflictHandlingStyle: ConflictApproach;
  contributionPreference: ContributionType[];
}

export enum LeadershipStyle {
  DEMOCRATIC = 'democratic',
  AUTOCRATIC = 'autocratic',
  LAISSEZ_FAIRE = 'laissez_faire',
  TRANSFORMATIONAL = 'transformational',
  SERVANT = 'servant'
}

export enum DecisionMakingStyle {
  CONSENSUS = 'consensus',
  MAJORITY_VOTE = 'majority_vote',
  LEADER_DECIDES = 'leader_decides',
  EXPERT_INPUT = 'expert_input',
  COLLABORATIVE = 'collaborative'
}

export interface SocialHistory {
  previousCollaborations: CollaborationHistory[];
  relationshipHistory: RelationshipHistory[];
  conflictHistory: ConflictHistory[];
  socialLearning: SocialLearningHistory[];
}

export interface CollaborationHistory {
  collaborationId: string;
  participants: string[];
  goal: string;
  outcome: CollaborationOutcomeType;
  duration: number;
  role: GroupRole;
  satisfaction: number; // 0 to 1
  timestamp: number;
}

export interface RelationshipHistory {
  targetAgentId: string;
  relationshipType: string;
  startTime: number;
  endTime?: number;
  keyEvents: RelationshipEvent[];
  outcome: string;
  lessons: string[];
}

export interface ConflictHistory {
  conflictId: string;
  participants: string[];
  cause: ConflictCauseType;
  resolution: ConflictResolutionMethod;
  outcome: ConflictResolutionOutcome;
  timestamp: number;
  lessons: string[];
}

export interface SocialLearningHistory {
  learningEvent: string;
  context: string;
  outcome: string;
  skillsLearned: string[];
  timestamp: number;
}

export interface LegacySocialBridge {
  migrateLegacyProfile(legacyProfile: any): SocialProfile;
  convertSocialBehaviors(behaviors: any): SocialPersonalityTraits;
  extractRelationships(profile: any): RelationshipSeed[];
  mapLegacyGoals(legacyGoals: any[]): SocialGoal[];
}

export interface SocialMigrationResult {
  success: boolean;
  migratedProfiles: number;
  errors: string[];
  warnings: string[];
  migrationTime: number;
}
```

## Performance Monitoring Interfaces

### Social Performance Tracking

```typescript
/**
 * Performance monitoring interfaces for social system
 * Tracks and optimizes social cognitive performance
 */

export interface SocialPerformanceMonitor {
  metrics: SocialMetrics;
  thresholds: SocialThresholds;
  alerts: SocialAlert[];
  optimizations: SocialOptimization[];
  reports: SocialPerformanceReport[];
}

export interface SocialMetrics {
  processing: SocialProcessingMetrics;
  relationships: SocialRelationshipMetrics;
  theoryOfMind: SocialTheoryOfMindMetrics;
  decisionMaking: SocialDecisionMetrics;
  coordination: SocialCoordinationMetrics;
  memory: SocialMemoryMetrics;
}

export interface SocialProcessingMetrics {
  averageProcessingTime: number; // milliseconds
  perceptionAccuracy: number; // 0 to 1
  analysisDepth: number; // 0 to 1
  inferenceAccuracy: number; // 0 to 1
  cognitiveLoad: number; // 0 to 1
  attentionEfficiency: number; // 0 to 1
}

export interface SocialRelationshipMetrics {
  relationshipAccuracy: number; // 0 to 1
  predictionSuccess: number; // 0 to 1
  trustBuildingRate: number; // 0 to 1
  conflictResolutionRate: number; // 0 to 1
  networkAnalysisAccuracy: number; // 0 to 1
  reputationAccuracy: number; // 0 to 1
}

export interface SocialTheoryOfMindMetrics {
  mentalModelAccuracy: number; // 0 to 1
  intentionPredictionAccuracy: number; // 0 to 1
  emotionalRecognitionAccuracy: number; // 0 to 1
  beliefModelingAccuracy: number; // 0 to 1
  knowledgeTrackingAccuracy: number; // 0 to 1
  perspectiveTakingSuccess: number; // 0 to 1
}

export interface SocialDecisionMetrics {
  decisionQuality: number; // 0 to 1
  socialUtilityAccuracy: number; // 0 to 1
  conflictResolutionSuccess: number; // 0 to 1
  collaborationInitiationSuccess: number; // 0 to 1
  groupDecisionEffectiveness: number; // 0 to 1
  socialRiskAssessmentAccuracy: number; // 0 to 1
}

export interface SocialCoordinationMetrics {
  synchronizationAccuracy: number; // 0 to 1
  communicationEfficiency: number; // 0 to 1
  collaborationSuccess: number; // 0 to 1
  leaderElectionAccuracy: number; // 0 to 1
  consensusAchievementRate: number; // 0 to 1
  conflictMediationSuccess: number; // 0 to 1
}

export interface SocialMemoryMetrics {
  episodicRetention: number; // 0 to 1
  semanticAccuracy: number; // 0 to 1
  proceduralTransfer: number; // 0 to 1
  workingMemoryEfficiency: number; // 0 to 1
  consolidationEffectiveness: number; // 0 to 1
  patternExtractionAccuracy: number; // 0 to 1
}

export interface SocialThresholds {
  processing: SocialProcessingThresholds;
  relationships: SocialRelationshipThresholds;
  theoryOfMind: SocialTheoryOfMindThresholds;
  decisionMaking: SocialDecisionThresholds;
  coordination: SocialCoordinationThresholds;
  memory: SocialMemoryThresholds;
}

export interface SocialProcessingThresholds {
  maxProcessingTime: number; // milliseconds
  minPerceptionAccuracy: number; // 0 to 1
  maxCognitiveLoad: number; // 0 to 1
  minAttentionEfficiency: number; // 0 to 1
}

export interface SocialRelationshipThresholds {
  minRelationshipAccuracy: number; // 0 to 1
  minPredictionSuccess: number; // 0 to 1
  maxTrustDecayRate: number; // 0 to 1 per hour
  minConflictResolutionRate: number; // 0 to 1
}

export interface SocialTheoryOfMindThresholds {
  minMentalModelAccuracy: number; // 0 to 1
  minIntentionPredictionAccuracy: number; // 0 to 1
  minEmotionalRecognitionAccuracy: number; // 0 to 1
  maxModelDecayRate: number; // 0 to 1 per hour
}

export interface SocialDecisionThresholds {
  minDecisionQuality: number; // 0 to 1
  maxDecisionTime: number; // milliseconds
  minConflictResolutionSuccess: number; // 0 to 1
  minCollaborationSuccess: number; // 0 to 1
}

export interface SocialCoordinationThresholds {
  maxSynchronizationDelay: number; // milliseconds
  minCommunicationEfficiency: number; // 0 to 1
  minCollaborationSuccess: number; // 0 to 1
  maxConsensusTime: number; // milliseconds
}

export interface SocialMemoryThresholds {
  minEpisodicRetention: number; // 0 to 1
  minSemanticAccuracy: number; // 0 to 1
  maxMemoryUsage: number; // MB
  minConsolidationEffectiveness: number; // 0 to 1
}

export interface SocialAlert {
  id: string;
  type: SocialAlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: number;
  metrics: string[];
  recommendations: string[];
}

export enum SocialAlertType {
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  THRESHOLD_VIOLATION = 'threshold_violation',
  SYSTEM_ERROR = 'system_error',
  RESOURCE_EXHAUSTION = 'resource_exhaustion',
  ACCURACY_DECLINE = 'accuracy_decline'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SocialOptimization {
  id: string;
  type: SocialOptimizationType;
  description: string;
  target: string;
  expectedImprovement: number; // 0 to 1
  implementation: string;
  status: OptimizationStatus;
}

export enum SocialOptimizationType {
  PERFORMANCE_TUNING = 'performance_tuning',
  MEMORY_OPTIMIZATION = 'memory_optimization',
  ALGORITHM_IMPROVEMENT = 'algorithm_improvement',
  PARAMETER_ADJUSTMENT = 'parameter_adjustment',
  STRUCTURE_REORGANIZATION = 'structure_reorganization'
}

export enum OptimizationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back'
}

export interface SocialPerformanceReport {
  id: string;
  timestamp: number;
  period: ReportPeriod;
  metrics: SocialMetrics;
  trends: SocialTrends;
  alerts: SocialAlert[];
  optimizations: SocialOptimization[];
  recommendations: string[];
}

export enum ReportPeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface SocialTrends {
  processing: SocialProcessingTrends;
  relationships: SocialRelationshipTrends;
  theoryOfMind: SocialTheoryOfMindTrends;
  decisionMaking: SocialDecisionTrends;
  coordination: SocialCoordinationTrends;
  memory: SocialMemoryTrends;
}

export interface SocialProcessingTrends {
  processingTime: TrendDirection;
  perceptionAccuracy: TrendDirection;
  cognitiveLoad: TrendDirection;
  attentionEfficiency: TrendDirection;
}

export interface SocialRelationshipTrends {
  relationshipAccuracy: TrendDirection;
  predictionSuccess: TrendDirection;
  trustBuildingRate: TrendDirection;
  conflictResolutionRate: TrendDirection;
}

export interface SocialTheoryOfMindTrends {
  mentalModelAccuracy: TrendDirection;
  intentionPredictionAccuracy: TrendDirection;
  emotionalRecognitionAccuracy: TrendDirection;
  perspectiveTakingSuccess: TrendDirection;
}

export interface SocialDecisionTrends {
  decisionQuality: TrendDirection;
  socialUtilityAccuracy: TrendDirection;
  conflictResolutionSuccess: TrendDirection;
  collaborationInitiationSuccess: TrendDirection;
}

export interface SocialCoordinationTrends {
  synchronizationAccuracy: TrendDirection;
  communicationEfficiency: TrendDirection;
  collaborationSuccess: TrendDirection;
  consensusAchievementRate: TrendDirection;
}

export interface SocialMemoryTrends {
  episodicRetention: TrendDirection;
  semanticAccuracy: TrendDirection;
  proceduralTransfer: TrendDirection;
  consolidationEffectiveness: TrendDirection;
}
```

## Conclusion

This comprehensive TypeScript interface specification provides the foundation for implementing the Social Relationship System as part of Phase 3 of the Mindcraft LangGraph rewrite. The interfaces follow established patterns from existing cognitive components while extending them with sophisticated social cognition capabilities.

### Key Design Principles

1. **Consistency**: Follows the same architectural patterns as PurposeCore, GoalSystem, and MemorySystem
2. **Extensibility**: Modular design allows for future enhancements and additions
3. **Performance**: Optimized for 50+ concurrent agents with efficient data structures
4. **Integration**: Seamless integration with existing LangGraph state and memory systems
5. **Compatibility**: Backward compatibility with existing agent profiles

### Implementation Notes

- All interfaces use TypeScript's type system for maximum safety and clarity
- Enum types are used extensively for categorical data
- Map data structures are used for efficient lookups and scalability
- Configuration interfaces enable flexible system tuning
- Performance monitoring interfaces ensure system reliability

This specification serves as the complete technical foundation for implementing sophisticated agent-to-agent social relationships, theory of mind capabilities, and multi-agent coordination within the Mindcraft system.