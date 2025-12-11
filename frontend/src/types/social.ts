/**
 * Social Relationship System TypeScript Interfaces
 * 
 * This file contains comprehensive TypeScript interfaces for the social relationship
 * visualization system, including network graphs, temporal evolution, influence mapping,
 * and all social interaction data structures.
 */

// ============================================================================
// Core Social Data Types
// ============================================================================

export const RelationshipType = {
  FRIENDSHIP: 'friendship',
  PROFESSIONAL: 'professional',
  ROMANTIC: 'romantic',
  FAMILY: 'family',
  ACQUAINTANCE: 'acquaintance',
  RIVALRY: 'rivalry',
  MENTORSHIP: 'mentorship',
  ALLIANCE: 'alliance',
  NEUTRAL: 'neutral'
} as const;

export type RelationshipType = typeof RelationshipType[keyof typeof RelationshipType];

export const InteractionType = {
  CONVERSATION: 'conversation',
  COLLABORATION: 'collaboration',
  TRADE: 'trade',
  CONFLICT: 'conflict',
  HELP: 'help',
  TEACHING: 'teaching',
  LEARNING: 'learning',
  GIFT: 'gift',
  REQUEST: 'request',
  CELEBRATION: 'celebration',
  SUPPORT: 'support',
  PLAY: 'play',
  COMPETITION: 'competition',
  OBSERVATION: 'observation'
} as const;

export type InteractionType = typeof InteractionType[keyof typeof InteractionType];

export const InteractionOutcome = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral',
  MIXED: 'mixed'
} as const;

export type InteractionOutcome = typeof InteractionOutcome[keyof typeof InteractionOutcome];

export const CommunityType = {
  SOCIAL_GROUP: 'social_group',
  PROFESSIONAL_GUILD: 'professional_guild',
  FAMILY_CLAN: 'family_clan',
  INTEREST_GROUP: 'interest_group',
  TEMPORARY_TEAM: 'temporary_team',
  ALLIANCE: 'alliance',
  RIVAL_GROUP: 'rival_group',
  GENERIC: 'generic'
} as const;

export type CommunityType = typeof CommunityType[keyof typeof CommunityType];

// ============================================================================
// Basic Social Interfaces
// ============================================================================

export interface SocialAgent {
  id: string;
  name: string;
  role: string;
  personality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  socialStats: {
    totalConnections: number;
    averageTrustLevel: number;
    influenceScore: number;
    reputationScore: number;
    communityCount: number;
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  status: 'active' | 'inactive' | 'offline';
  lastSeen: number;
  reputation: number;
  reputationDetails?: {
    score: number;
    trustworthiness: number;
    reliability: number;
    influence: number;
  };
}

export interface SocialInteraction {
  id: string;
  type: InteractionType;
  participants: string[];
  timestamp: number;
  content: string;
  outcome: InteractionOutcome;
  influenceDelta: number;
  trustDelta: number;
  reputationDelta: number;
  duration: number;
  sentiment: number;
  location?: {
    x: number;
    y: number;
    z: number;
  };
  metadata?: {
    [key: string]: any;
  };
}

export interface SocialRelationship {
  id: string;
  agentId: string;
  targetAgentId: string;
  trustLevel: number;        // 0-1 scale
  friendshipScore: number;  // 0-1 scale
  reputation: number;       // 0-1 scale
  relationshipType: RelationshipType;
  interactions: SocialInteraction[];
  lastInteraction: number;
  influenceScore: number;   // How much one agent influences another
  interactionFrequency: number;
  relationshipStrength: number;
  communicationPatterns: CommunicationPattern[];
  sharedContexts: string[];
  conflicts: SocialConflict[];
  collaborations: SocialCollaboration[];
}

// ============================================================================
// Network and Community Types
// ============================================================================

export interface SocialNetwork {
  id: string;
  agents: SocialAgent[];
  relationships: SocialRelationship[];
  groups: SocialGroup[];
  communities: Community[];
  influenceNetwork: InfluenceNetwork;
  networkMetrics: NetworkMetrics;
  lastUpdated: number;
}

export interface SocialGroup {
  id: string;
  name: string;
  type: CommunityType;
  members: string[];
  leader?: string;
  founded: number;
  purpose: string;
  rules: string[];
  hierarchy: GroupHierarchy;
  cohesion: number;         // 0-1 scale
  activity: number;         // 0-1 scale
  activityLevel: number;    // 0-1 scale
  influence: number;        // Overall group influence
  reputation: number;       // Group reputation
  metadata?: {
    [key: string]: any;
  };
}

export interface Community {
  id: string;
  name: string;
  type: CommunityType;
  members: string[];
  subCommunities: string[];
  influenceNetwork: CommunityInfluenceNetwork;
  cohesionScore: number;
  diversityIndex: number;
  communicationDensity: number;
  reputation: number;
  formationDate: number;
  evolutionHistory: CommunityEvolution[];
  cohesion: number;
  activityLevel: number;
  stability: number;
}

export interface GroupHierarchy {
  levels: {
    level: number;
    title: string;
    members: string[];
    responsibilities: string[];
  }[];
  promotionRules: string[];
  demotionRules: string[];
}

// ============================================================================
// Influence and Communication Types
// ============================================================================

export interface InfluenceNetwork {
  nodes: InfluenceNode[];
  edges: InfluenceEdge[];
  metrics: InfluenceMetrics;
  propagationPaths: InfluencePropagation[];
}

export interface InfluenceNode {
  id: string;
  agentId: string;
  influenceScore: number;
  susceptibility: number;    // How easily influenced
  persuasiveness: number;    // How persuasive they are
  authorityLevel: number;
  expertise: string[];
  followers: string[];
  following: string[];
}

export interface InfluenceEdge {
  source: string;
  target: string;
  strength: number;
  type: 'direct' | 'indirect' | 'reciprocal';
  frequency: number;
  lastInteraction: number;
  content: string[];
}

export interface InfluenceMetrics {
  networkDensity: number;
  clusteringCoefficient: number;
  averagePathLength: number;
  centralityMeasures: {
    degree: Map<string, number>;
    betweenness: Map<string, number>;
    closeness: Map<string, number>;
    eigenvector: Map<string, number>;
  };
  influenceDistribution: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
  };
}

export interface InfluencePropagation {
  id: string;
  source: string;
  content: string;
  path: string[];
  timestamps: number[];
  decayRates: number[];
  finalReach: number;
  effectiveness: number;
}

export interface CommunicationPattern {
  id: string;
  type: InteractionType;
  frequency: number;
  preferredTime: number[];   // Hours when communication occurs
  averageDuration: number;
  typicalTopics: string[];
  sentiment: number;         // -1 to 1
  effectiveness: number;     // 0-1 scale
}

// ============================================================================
// Conflict and Collaboration Types
// ============================================================================

export interface SocialConflict {
  id: string;
  participants: string[];
  type: 'disagreement' | 'competition' | 'betrayal' | 'misunderstanding';
  severity: number;          // 0-1 scale
  startTime: number;
  endTime?: number;
  resolution?: ConflictResolution;
  impact: {
    trustChange: number;
    reputationChange: number;
    relationshipDamage: number;
  };
}

export interface ConflictResolution {
  type: 'compromise' | 'mediation' | 'apology' | 'thirdParty' | 'time';
  resolver: string;
  outcome: InteractionOutcome;
  timestamp: number;
  agreements: string[];
}

export interface SocialCollaboration {
  id: string;
  participants: string[];
  type: 'project' | 'trade' | 'defense' | 'exploration' | 'building';
  goal: string;
  startTime: number;
  endTime?: number;
  status: 'active' | 'completed' | 'failed' | 'paused';
  contributions: Map<string, number>;
  outcome: CollaborationOutcome;
}

export interface CollaborationOutcome {
  success: boolean;
  quality: number;           // 0-1 scale
  efficiency: number;        // 0-1 scale
  innovation: number;        // 0-1 scale
  relationshipImpact: number; // -1 to 1
}

// ============================================================================
// Temporal and Evolution Types
// ============================================================================

export interface TemporalEvolution {
  timeline: TimePoint[];
  metrics: EvolutionMetrics;
  predictions: EvolutionPrediction[];
  significantEvents: SignificantEvent[];
}

export interface TimePoint {
  timestamp: number;
  networkState: SocialNetwork;
  keyMetrics: {
    totalRelationships: number;
    averageTrustLevel: number;
    networkDensity: number;
    communityCount: number;
    conflictCount: number;
    collaborationCount: number;
  };
}

export interface EvolutionMetrics {
  growthRate: number;
  stabilityIndex: number;
  adaptabilityScore: number;
  relationshipVelocity: number;
  influenceDrift: number;
  communityEvolutionRate: number;
}

export interface EvolutionPrediction {
  timeframe: number;         // Future timestamp
  confidence: number;        // 0-1 scale
  predictedState: {
    networkDensity: number;
    communityStructure: Community[];
    relationshipChanges: RelationshipChange[];
    influenceShifts: InfluenceShift[];
  };
  factors: string[];
}

export interface RelationshipChange {
  relationshipId: string;
  type: 'strengthening' | 'weakening' | 'formation' | 'dissolution';
  magnitude: number;
  probability: number;
  timeframe: number;
  causes: string[];
}

export interface InfluenceShift {
  agentId: string;
  currentInfluence: number;
  predictedInfluence: number;
  changeFactors: string[];
  confidence: number;
}

export interface SignificantEvent {
  id: string;
  timestamp: number;
  type: 'conflict' | 'alliance' | 'community_formation' | 'leadership_change' | 'major_collaboration';
  description: string;
  participants: string[];
  impact: EventImpact;
}

export interface EventImpact {
  networkChanges: {
    densityChange: number;
    relationshipCountChange: number;
    communityCountChange: number;
  };
  socialChanges: {
    trustLevelChange: number;
    influenceRedistribution: Map<string, number>;
    reputationChanges: Map<string, number>;
  };
}

// ============================================================================
// Community and Clustering Types
// ============================================================================

export interface CommunityInfluenceNetwork {
  internalInfluence: Map<string, number>;
  externalInfluence: Map<string, number>;
  crossCommunityEdges: CrossCommunityEdge[];
  influenceFlow: InfluenceFlow[];
}

export interface CrossCommunityEdge {
  sourceCommunity: string;
  targetCommunity: string;
  strength: number;
  type: 'cooperation' | 'competition' | 'neutral' | 'conflict';
  interactionFrequency: number;
  lastInteraction: number;
}

export interface InfluenceFlow {
  direction: 'incoming' | 'outgoing';
  source: string;
  target: string;
  content: string;
  strength: number;
  timestamp: number;
}

export interface CommunityEvolution {
  timestamp: number;
  type: 'formation' | 'growth' | 'decline' | 'split' | 'merge' | 'dissolution';
  description: string;
  affectedMembers: string[];
  impactMetrics: {
    cohesionChange: number;
    influenceChange: number;
    reputationChange: number;
  };
}

// ============================================================================
// Network Metrics Types
// ============================================================================

export interface NetworkMetrics {
  basic: {
    nodeCount: number;
    edgeCount: number;
    density: number;
    averageDegree: number;
  };
  connectivity: {
    connectedComponents: number;
    largestComponentSize: number;
    averagePathLength: number;
    diameter: number;
  };
  clustering: {
    averageClusteringCoefficient: number;
    transitivity: number;
    modularity: number;
  };
  centrality: {
    degreeCentralization: number;
    betweennessCentralization: number;
    closenessCentralization: number;
    eigenvectorCentralization: number;
  };
  dynamics: {
    relationshipFormationRate: number;
    relationshipDissolutionRate: number;
  };
}

// ============================================================================
// Visualization and UI Types
// ============================================================================

export interface SocialVisualizationConfig {
  networkGraph: {
    nodeSize: number;
    edgeWidth: number;
    colorScheme: string;
    layoutAlgorithm: 'force' | 'circular' | 'hierarchical' | 'radial';
    showLabels: boolean;
    animationSpeed: number;
  };
  temporalView: {
    timeRange: {
      start: number;
      end: number;
    };
    granularity: 'hour' | 'day' | 'week' | 'month';
    showPredictions: boolean;
    animationEnabled: boolean;
  };
  influenceMap: {
    heatmapEnabled: boolean;
    flowVisualization: boolean;
    threshold: number;
    colorGradient: string[];
  };
  trustFriendship: {
    showCorrelation: boolean;
    showDistribution: boolean;
    colorScheme: 'blue' | 'green' | 'purple' | 'orange';
    trustThreshold: number;
    friendshipThreshold: number;
    heatmapEnabled: boolean;
  };
  reputation: {
    showTrends: boolean;
    showEvents: boolean;
    colorScheme: 'blue' | 'green' | 'purple' | 'orange';
    threshold: number;
    trendsEnabled: boolean;
  };
  communityView: {
    clusteringAlgorithm: 'louvain' | 'leiden' | 'label_propagation';
    showHierarchy: boolean;
    colorByCommunity: boolean;
    communityClustering: boolean;
    clusterThreshold: number;
    showOverlaps: boolean;
  };
  communicationAnalysis: {
    showPatterns: boolean;
    showTimeline: boolean;
    colorScheme: 'blue' | 'green' | 'purple' | 'orange';
    timeRange: { start: number; end: number };
    showOutcomes: boolean;
  };
}

export interface SocialVisualizationData {
  network: SocialNetwork;
  evolution: TemporalEvolution;
  influence: InfluenceNetwork;
  communities: Community[];
  metrics: NetworkMetrics;
  config: SocialVisualizationConfig;
}

export interface SocialInteractionFilter {
  timeRange: {
    start: number;
    end: number;
  };
  interactionTypes: InteractionType[];
  participants: string[];
  outcomes: InteractionOutcome[];
  communities: string[];
  relationshipTypes: RelationshipType[];
}

export interface SocialAnalytics {
  overview: {
    totalAgents: number;
    totalRelationships: number;
    totalCommunities: number;
    networkDensity: number;
    averageTrustLevel: number;
    averageReputation: number;
  };
  trends: {
    relationshipGrowthRate: number;
    communityFormationRate: number;
    conflictFrequency: number;
    collaborationSuccess: number;
    influenceStability: number;
  };
  predictions: {
    networkEvolution: EvolutionPrediction;
    relationshipChanges: RelationshipChange[];
    communityChanges: CommunityEvolution[];
    influenceShifts: InfluenceShift[];
  };
  insights: {
    keyInfluencers: string[];
    bridgeAgents: string[];
    communityLeaders: string[];
    potentialConflicts: string[];
    collaborationOpportunities: string[];
  };
}

// ============================================================================
// Redux State Types
// ============================================================================

export interface SocialState {
  // Current data
  currentNetwork: SocialNetwork | null;
  selectedAgent: string | null;
  selectedRelationship: string | null;
  selectedCommunity: string | null;
  
  // Historical data
  historicalNetworks: Map<number, SocialNetwork>;
  evolutionData: TemporalEvolution | null;
  
  // Visualization state
  visualizationConfig: SocialVisualizationConfig;
  activeFilters: SocialInteractionFilter;
  
  // Analytics and insights
  analytics: SocialAnalytics | null;
  insights: string[];
  
  // UI state
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  
  // Real-time updates
  realTimeUpdates: boolean;
  updateFrequency: number;
  subscribedAgents: string[];
}

// ============================================================================
// Socket.IO Event Types
// ============================================================================

export interface SocialDataUpdateEvent {
  agentId: string;
  type: 'relationship_update' | 'interaction_added' | 'influence_change' | 'community_update';
  data: any;
  timestamp: number;
}

export interface SocialNetworkUpdateEvent {
  networkId: string;
  changes: {
    addedAgents?: SocialAgent[];
    removedAgents?: string[];
    addedRelationships?: SocialRelationship[];
    removedRelationships?: string[];
    updatedRelationships?: SocialRelationship[];
  };
  timestamp: number;
}

export interface SocialInteractionEvent {
  interaction: SocialInteraction;
  impact: {
    trustChanges: Map<string, number>;
    reputationChanges: Map<string, number>;
    influenceChanges: Map<string, number>;
  };
  timestamp: number;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface SocialRelationshipVisualizationProps {
  agentId?: string;
  networkId?: string;
  config?: Partial<SocialVisualizationConfig>;
  onAgentSelect?: (agentId: string) => void;
  onRelationshipSelect?: (relationshipId: string) => void;
  onCommunitySelect?: (communityId: string) => void;
  className?: string;
}

export interface SocialNetworkGraphProps {
  network: SocialNetwork;
  config: SocialVisualizationConfig['networkGraph'];
  onNodeClick?: (agentId: string) => void;
  onEdgeClick?: (relationshipId: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface TemporalEvolutionViewerProps {
  evolution: TemporalEvolution;
  config: SocialVisualizationConfig['temporalView'];
  onTimeSelect?: (timestamp: number) => void;
  onEventSelect?: (event: SignificantEvent) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface InfluenceMappingProps {
  influenceNetwork: InfluenceNetwork;
  config: SocialVisualizationConfig['influenceMap'];
  onNodeClick?: (agentId: string) => void;
  onFlowClick?: (flow: InfluenceFlow) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface TrustFriendshipDisplayProps {
  relationships: SocialRelationship[];
  selectedAgent?: string;
  onRelationshipClick?: (relationshipId: string) => void;
  showDetails?: boolean;
  className?: string;
}

export interface ReputationVisualizationProps {
  agents: SocialAgent[];
  communities: Community[];
  selectedAgent?: string;
  onAgentSelect?: (agentId: string) => void;
  showTrends?: boolean;
  className?: string;
}

export interface CommunityClusteringProps {
  communities: Community[];
  network: SocialNetwork;
  config: SocialVisualizationConfig['communityView'];
  onCommunitySelect?: (communityId: string) => void;
  onAgentSelect?: (agentId: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

export interface CommunicationAnalysisProps {
  patterns: CommunicationPattern[];
  interactions: SocialInteraction[];
  timeRange: { start: number; end: number };
  selectedAgents?: string[];
  onPatternClick?: (pattern: CommunicationPattern) => void;
  className?: string;
}

export interface SocialInteractionTimelineProps {
  interactions: SocialInteraction[];
  relationships: SocialRelationship[];
  filters: SocialInteractionFilter;
  onInteractionSelect?: (interaction: SocialInteraction) => void;
  onFilterChange?: (filters: SocialInteractionFilter) => void;
  showDetails?: boolean;
  className?: string;
}

// ============================================================================
// D3.js Network Visualization Types
// ============================================================================

export interface NetworkNode {
  id: string;
  name: string;
  agent: SocialAgent;
  radius: number;
  color: string;
  communityId?: string;
  influenceScore: number;
  reputationScore: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface NetworkLink {
  source: NetworkNode | string;
  target: NetworkNode | string;
  relationship: SocialRelationship;
  strength: number;
  color: string;
  width: number;
  distance: number;
}

export interface NetworkGraphConfig {
  nodeSize: number;
  linkWidth: number;
  linkDistance: number;
  showLabels: boolean;
  showCommunities: boolean;
  defaultNodeColor: string;
  communityColors: string[];
  getRelationshipColor: (type: RelationshipType) => string;
}

// ============================================================================
// Additional Types for Components
// ============================================================================

export interface ReputationSystem {
  events: ReputationEvent[];
  trends: ReputationTrend[];
  score: number;
  history: number[];
  globalReputation: number;
}

export interface ReputationEvent {
  id: string;
  agentId: string;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
  impact: number;
  newReputation: number;
  timestamp: number;
  source: string;
  reason: string;
}

export interface ReputationTrend {
  timestamp: number;
  score: number;
  change: number;
  factors: string[];
}

export interface SocialNetworkData {
  network: SocialNetwork;
  communities: Community[];
  metrics: NetworkMetrics;
}

export interface TemporalData {
  evolution: TemporalEvolution;
  timeline: TimePoint[];
  predictions: EvolutionPrediction[];
}

export interface InfluenceData {
  network: InfluenceNetwork;
  propagation: InfluencePropagation[];
  metrics: InfluenceMetrics;
}

export interface TrustFriendshipData {
  relationships: SocialRelationship[];
  correlations: {
    trustLevel: number;
    friendshipScore: number;
    count: number;
  }[];
  distribution: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface CommunicationData {
  patterns: CommunicationPattern[];
  interactions: SocialInteraction[];
  timeline: {
    timestamp: number;
    count: number;
    type: InteractionType;
  }[];
}
