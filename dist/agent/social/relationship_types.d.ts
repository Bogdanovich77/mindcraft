/**
 * Relationship Types and Interfaces
 *
 * Core type definitions for the social relationship system
 * Following the established patterns from cognitive components
 */
import { PersonalityTraits } from '../langgraph/interfaces.js';
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
    level: number;
    reliability: number;
    competence: number;
    integrity: number;
    consistency: number;
    vulnerability: number;
    lastUpdated: number;
    updateHistory: TrustUpdate[];
}
export interface FriendshipMetrics {
    level: number;
    affection: number;
    loyalty: number;
    support: number;
    sharedInterests: number;
    timeInvested: number;
    qualityScore: number;
    lastInteraction: number;
}
export interface RespectMetrics {
    level: number;
    skillRecognition: number;
    achievementRecognition: number;
    wisdomRecognition: number;
    leadershipRecognition: number;
    lastUpdated: number;
}
export interface RivalryMetrics {
    level: number;
    competition: number;
    hostility: number;
    jealousy: number;
    sabatogePotential: number;
    lastUpdated: number;
}
export interface CollaborationMetrics {
    effectiveness: number;
    efficiency: number;
    coordination: number;
    sharedGoals: number;
    successfulProjects: number;
    totalProjects: number;
    lastCollaboration: number;
}
export interface CommunicationMetrics {
    frequency: number;
    quality: number;
    clarity: number;
    honesty: number;
    responsiveness: number;
    lastCommunication: number;
    preferredChannels: CommunicationChannel[];
}
export declare enum RelationshipStatus {
    UNKNOWN = "unknown",
    ACQUAINTANCE = "acquaintance",
    FRIEND = "friend",
    CLOSE_FRIEND = "close_friend",
    RIVAL = "rival",
    ENEMY = "enemy",
    MENTOR = "mentor",
    MENTEE = "mentee",
    COLLEAGUE = "colleague",
    PARTNER = "partner"
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
export declare enum InteractionType {
    COLLABORATION = "collaboration",
    CONVERSATION = "conversation",
    HELP = "help",
    TRADE = "trade",
    CONFLICT = "conflict",
    SUPPORT = "support",
    COMPETITION = "competition",
    CELEBRATION = "celebration",
    EXPLORATION = "exploration"
}
export interface InteractionOutcome {
    success: boolean;
    satisfaction: number;
    mutualBenefit: number;
    timeInvestment: number;
    resourceCost: number;
    emotionalImpact: number;
}
export interface RelationshipImpact {
    trust: number;
    friendship: number;
    respect: number;
    rivalry: number;
    collaboration: number;
    overall: number;
}
export interface RelationshipTrends {
    trustTrend: TrendDirection;
    friendshipTrend: TrendDirection;
    respectTrend: TrendDirection;
    collaborationTrend: TrendDirection;
    overallTrend: TrendDirection;
    prediction: RelationshipPrediction;
}
export declare enum TrendDirection {
    IMPROVING = "improving",
    STABLE = "stable",
    DECLINING = "declining",
    VOLATILE = "volatile"
}
export interface RelationshipPrediction {
    shortTerm: PredictionOutcome;
    mediumTerm: PredictionOutcome;
    longTerm: PredictionOutcome;
    confidence: number;
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
    confidence: number;
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
export interface AgentReputation {
    globalScore: number;
    domainScores: Map<string, number>;
    traits: ReputationTraits;
    accomplishments: ReputationAccomplishment[];
    endorsements: ReputationEndorsement[];
    criticisms: ReputationCriticism[];
    lastUpdated: number;
}
export interface ReputationTraits {
    reliability: number;
    competence: number;
    friendliness: number;
    honesty: number;
    generosity: number;
    courage: number;
    creativity: number;
    leadership: number;
    loyalty: number;
}
export interface ReputationAccomplishment {
    id: string;
    description: string;
    domain: string;
    impact: number;
    witnesses: string[];
    timestamp: number;
    verified: boolean;
}
export interface ReputationEndorsement {
    endorserId: string;
    trait: string;
    strength: number;
    timestamp: number;
    context: string;
    weight: number;
}
export interface ReputationCriticism {
    criticId: string;
    issue: string;
    severity: number;
    timestamp: number;
    context: string;
    validity: number;
}
export interface SocialNetworkTopology {
    nodes: SocialNode[];
    edges: SocialEdge[];
    clusters: SocialCluster[];
    metrics: NetworkMetrics;
    lastCalculated: number;
}
export interface SocialNode {
    agentId: string;
    importance: number;
    influence: number;
    connectivity: number;
    clusterId?: string;
    role: SocialRole;
    status: NodeStatus;
}
export declare enum SocialRole {
    LEADER = "leader",
    CONNECTOR = "connector",
    SPECIALIST = "specialist",
    PERIPHERAL = "peripheral",
    ISOLATED = "isolated",
    UNKNOWN = "unknown"
}
export declare enum NodeStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    DORMANT = "dormant",
    UNKNOWN = "unknown"
}
export interface SocialEdge {
    sourceId: string;
    targetId: string;
    weight: number;
    type: EdgeType;
    strength: number;
    directionality: EdgeDirectionality;
    lastInteraction: number;
    interactionFrequency: number;
}
export declare enum EdgeType {
    FRIENDSHIP = "friendship",
    COLLABORATION = "collaboration",
    MENTORSHIP = "mentorship",
    RIVALRY = "rivalry",
    TRADE = "trade",
    COMMUNICATION = "communication"
}
export declare enum EdgeDirectionality {
    UNIDIRECTIONAL = "unidirectional",
    BIDIRECTIONAL = "bidirectional",
    RECIPROCAL = "reciprocal"
}
export interface SocialCluster {
    id: string;
    name: string;
    members: string[];
    cohesion: number;
    density: number;
    centralAgent?: string;
    purpose: string;
    formationTime: number;
}
export interface NetworkMetrics {
    density: number;
    clustering: number;
    averagePathLength: number;
    diameter: number;
    centrality: Map<string, number>;
    modularity: number;
}
export interface RelationshipEvent {
    id: string;
    timestamp: number;
    type: RelationshipEventType;
    participants: string[];
    impact: RelationshipChange;
    context: string;
    significance: number;
}
export declare enum RelationshipEventType {
    FORMATION = "formation",
    STRENGTHENING = "strengthening",
    WEAKENING = "weakening",
    CONFLICT = "conflict",
    RESOLUTION = "resolution",
    TRANSFORMATION = "transformation"
}
export interface RelationshipChange {
    agentId: string;
    trust: number;
    friendship: number;
    respect: number;
    rivalry: number;
    collaboration: number;
}
export declare enum CommunicationChannel {
    DIRECT = "direct",
    GROUP = "group",
    WRITTEN = "written",
    VERBAL = "verbal",
    NONVERBAL = "nonverbal"
}
export interface RelationshipManagerConfig {
    maxRelationships: number;
    relationshipUpdateInterval: number;
    trustDecayRate: number;
    friendshipDecayRate: number;
    reputationUpdateThreshold: number;
    networkAnalysisInterval: number;
    historyRetentionPeriod: number;
    enablePrediction: boolean;
    enableTrendAnalysis: boolean;
    enableNetworkTopology: boolean;
}
export interface TrustCalculationConfig {
    personalityWeight: number;
    experienceWeight: number;
    reputationWeight: number;
    decayRate: number;
    recoveryRate: number;
    breachThreshold: number;
    repairThreshold: number;
}
export interface ReputationSystemConfig {
    globalWeight: number;
    domainWeight: number;
    traitWeight: number;
    accomplishmentWeight: number;
    endorsementWeight: number;
    criticismWeight: number;
    decayRate: number;
    updateThreshold: number;
}
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
    compatibility: number;
    factors: CompatibilityFactor[];
    trustPropensity: number;
    friendshipPropensity: number;
    collaborationPropensity: number;
}
export interface CompatibilityFactor {
    trait: keyof PersonalityTraits;
    weight: number;
    similarity: number;
    complementarity: number;
}
export interface RelationshipManagerStats {
    totalRelationships: number;
    activeRelationships: number;
    averageTrustLevel: number;
    averageFriendshipLevel: number;
    networkDensity: number;
    reputationScore: number;
    predictionAccuracy: number;
    updateFrequency: number;
    memoryUsage: number;
    processingTime: number;
}
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
export interface EnhancedSocialContext extends SocialContext {
    personalityFactors?: PersonalityFactors;
    motivationFactors?: MotivationFactors;
    memoryContext?: MemoryContext;
    location?: {
        x: number;
        y: number;
        z: number;
    };
}
//# sourceMappingURL=relationship_types.d.ts.map