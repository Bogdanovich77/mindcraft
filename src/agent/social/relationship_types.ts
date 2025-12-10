/**
 * Relationship Types and Interfaces
 * 
 * Core type definitions for the social relationship system
 * Following the established patterns from cognitive components
 */

import { PersonalityTraits } from '../langgraph/interfaces.js';

// ============================================================================
// CORE RELATIONSHIP INTERFACES
// ============================================================================

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
  CELEBRATION = 'celebration',
  EXPLORATION = 'exploration'
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

// ============================================================================
// REPUTATION SYSTEM INTERFACES
// ============================================================================

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
  loyalty: number; // 0 to 1
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

// ============================================================================
// SOCIAL NETWORK TOPOLOGY INTERFACES
// ============================================================================

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
  ISOLATED = 'isolated',
  UNKNOWN = 'unknown'
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

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export enum CommunicationChannel {
  DIRECT = 'direct',
  GROUP = 'group',
  WRITTEN = 'written',
  VERBAL = 'verbal',
  NONVERBAL = 'nonverbal'
}

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

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

export interface TrustCalculationConfig {
  personalityWeight: number; // 0 to 1
  experienceWeight: number; // 0 to 1
  reputationWeight: number; // 0 to 1
  decayRate: number; // 0 to 1 per hour
  recoveryRate: number; // 0 to 1 per positive interaction
  breachThreshold: number; // 0 to 1
  repairThreshold: number; // 0 to 1
}

export interface ReputationSystemConfig {
  globalWeight: number; // 0 to 1
  domainWeight: number; // 0 to 1
  traitWeight: number; // 0 to 1
  accomplishmentWeight: number; // 0 to 1
  endorsementWeight: number; // 0 to 1
  criticismWeight: number; // 0 to 1
  decayRate: number; // 0 to 1 per hour
  updateThreshold: number; // minimum interactions
}

// ============================================================================
// INTEGRATION INTERFACES
// ============================================================================

export interface SocialContext {
  agentId: string;
  nearbyAgents: string[];
  activeConversations: string[];
  groupActivities: string[];
  socialEvents: string[];
  environmentalFactors: Record<string, number>;
  temporalFactors: Record<string, number>;
  lastUpdate: number;
}

export interface PersonalityCompatibility {
  compatibility: number; // 0 to 1
  factors: CompatibilityFactor[];
  trustPropensity: number; // 0 to 1
  friendshipPropensity: number; // 0 to 1
  collaborationPropensity: number; // 0 to 1
}

export interface CompatibilityFactor {
  trait: keyof PersonalityTraits;
  weight: number;
  similarity: number; // 0 to 1
  complementarity: number; // 0 to 1
}

// ============================================================================
// PERFORMANCE INTERFACES
// ============================================================================

export interface RelationshipManagerStats {
  totalRelationships: number;
  activeRelationships: number;
  averageTrustLevel: number;
  averageFriendshipLevel: number;
  networkDensity: number;
  reputationScore: number;
  predictionAccuracy: number;
  updateFrequency: number;
  memoryUsage: number; // bytes
  processingTime: number; // milliseconds
}

// ============================================================================
// UTILITY INTERFACES
// ============================================================================

export interface RelationshipUpdateRequest {
  targetAgentId: string;
  interaction: RelationshipInteraction;
  context: SocialContext;
  personality?: PersonalityTraits;
}

export interface RelationshipQuery {
  targetAgentId?: string;
  status?: RelationshipStatus;
  minTrustLevel?: number;
  minFriendshipLevel?: number;
  relationshipTypes?: InteractionType[];
  timeRange?: {
    start: number;
    end: number;
  };
  limit?: number;
}

export interface RelationshipSearchResult {
  relationships: AgentRelationship[];
  totalCount: number;
  queryTime: number;
  relevance: number;
}

export interface SocialSearchQuery {
  minTrustLevel?: number;
  maxTrustLevel?: number;
  minFriendshipLevel?: number;
  maxFriendshipLevel?: number;
  relationshipStatus?: RelationshipStatus;
  interactionTypes?: InteractionType[];
  limit?: number;
  sortBy?: 'trust' | 'friendship' | 'reputation' | 'recentInteraction';
  sortOrder?: 'asc' | 'desc';
}

export interface SocialEvent {
  id: string;
  type: string;
  timestamp: number;
  participants: string[];
  context: string;
  impact: RelationshipImpact;
}

export interface SocialDecisionFactors {
  trustLevel: number;
  friendshipLevel: number;
  reputationScore: number;
  collaborationHistory: number;
  recentInteractions: Array<{
    agentId: string;
    type: InteractionType;
    timestamp: number;
    outcome: boolean;
    impact: number;
  }>;
  socialObligations: string[];
  conflicts: string[];
  allies: string[];
  rivals: string[];
  influenceLevel: number;
  socialCohesion: number;
}

export interface PersonalityFactors {
  agreeableness: number;
  extraversion: number;
  openness: number;
  conscientiousness: number;
  neuroticism: number;
}

export interface MotivationFactors {
  socialConnection: number;
  achievement: number;
  cooperation: number;
}

export interface MemoryContext {
  pastInteractionCount: number;
  averagePastOutcome: number;
  lastInteractionTime: number;
}

// Enhanced SocialContext with additional factors
export interface EnhancedSocialContext extends SocialContext {
  personalityFactors?: PersonalityFactors;
  motivationFactors?: MotivationFactors;
  memoryContext?: MemoryContext;
  location?: { x: number; y: number; z: number };
}