/**
 * Socket.IO Event Type Definitions
 * 
 * This file contains comprehensive type definitions for all Socket.IO events
 * used in the cognitive dashboard for real-time data streaming.
 */

// Import simplified types
import type { AgentState, WorldContext, ConversationState } from './agent';

// Base event interface
export interface BaseEvent {
  timestamp: number;
  eventId?: string;
  agentId?: string;
}

// Simplified Agent State for Socket.IO events (matches the 7-field structure)
export interface SimplifiedAgentState {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'disconnected' | 'error';
  position: { x: number; y: number; z: number };
  health: number;
  food: number;
  experience: number;
  level: number;
  inventory: Record<string, number>;
  context: {
    dimension: string;
    biome: string;
    timeOfDay: number;
    weather: string;
  };
  lastActivity: number;
  
  // Core 7 fields for simplified architecture
  worldContext?: Partial<WorldContext>;
  personality?: string;
  goals?: string;
  mandate?: string;
  conversation?: Partial<ConversationState>;
  lastAction?: string;
  response?: string;
}

export interface AgentStateUpdateEvent extends BaseEvent {
  agentId: string;
  state: SimplifiedAgentState;
  changes: Partial<SimplifiedAgentState>;
  type: 'state_update';
}

export interface AgentConnectionEvent extends BaseEvent {
  agentId: string;
  connectionType: 'connect' | 'disconnect';
  reason?: string;
}

export interface AgentDisconnectionEvent extends BaseEvent {
  agentId: string;
  reason?: string;
}

// Legacy complex event types - marked as deprecated
/** @deprecated Use simplified personality string instead */
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
}

/** @deprecated Use simplified personality string instead */
export interface PersonalityEmotion {
  emotion: string;
  intensity: number;
  duration: number;
  trigger?: string;
  context?: string;
}

/** @deprecated Use simplified personality string instead */
export interface PersonalityMood {
  mood: string;
  intensity: number;
  stability: number;
  factors: string[];
}

/** @deprecated Use simplified personality string instead */
export interface PersonalityTraitUpdateEvent extends BaseEvent {
  agentId: string;
  traits: PersonalityTraits;
  changes: Partial<PersonalityTraits>;
  evolutionRate: number;
  confidence: number;
}

/** @deprecated Use simplified personality string instead */
export interface PersonalityEmotionEvent extends BaseEvent {
  agentId: string;
  emotion: PersonalityEmotion;
  previousEmotion?: PersonalityEmotion;
  transition: boolean;
}

/** @deprecated Use simplified personality string instead */
export interface PersonalityMoodEvent extends BaseEvent {
  agentId: string;
  mood: PersonalityMood;
  previousMood?: PersonalityMood;
  factors: string[];
}

/** @deprecated Use simplified personality string instead */
export interface PersonalityEvolutionEvent extends BaseEvent {
  agentId: string;
  evolutionType: 'trait_drift' | 'experience_based' | 'social_influence' | 'adaptation';
  changes: PersonalityTraits;
  catalyst: string;
  timespan: number;
}

// Legacy memory events - marked as deprecated
/** @deprecated No longer used in simplified architecture */
export interface MemoryConcept {
  id: string;
  type: 'concept' | 'fact' | 'relationship';
  content: string;
  confidence: number;
  importance: number;
  lastAccessed: number;
  accessCount: number;
  relatedConcepts: string[];
}

/** @deprecated No longer used in simplified architecture */
export interface MemoryEpisode {
  id: string;
  timestamp: number;
  duration: number;
  type: 'experience' | 'interaction' | 'observation' | 'reflection';
  context: string;
  participants: string[];
  importance: number;
  emotionalImpact: number;
  tags: string[];
  summary: string;
}

/** @deprecated No longer used in simplified architecture */
export interface MemoryProcedural {
  id: string;
  name: string;
  type: 'skill' | 'habit' | 'routine' | 'pattern';
  steps: string[];
  successRate: number;
  lastUsed: number;
  usageCount: number;
  context: string[];
}

/** @deprecated No longer used in simplified architecture */
export interface MemoryUpdateEvent extends BaseEvent {
  agentId: string;
  memoryType: 'semantic' | 'episodic' | 'procedural';
  operation: 'create' | 'update' | 'delete' | 'access';
  memoryId: string;
  memory: MemoryConcept | MemoryEpisode | MemoryProcedural;
  impact: number;
}

/** @deprecated No longer used in simplified architecture */
export interface MemoryConsolidationEvent extends BaseEvent {
  agentId: string;
  consolidationId: string;
  sourceMemories: string[];
  targetMemory: string;
  consolidationType: 'strengthening' | 'weakening' | 'merging' | 'pruning';
  strength: number;
  context: string;
}

// Legacy goal events - marked as deprecated
/** @deprecated Use simplified goals string instead */
export interface Goal {
  id: string;
  type: 'strategic' | 'tactical' | 'operational';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createdAt: number;
  updatedAt: number;
  deadline?: number;
  dependencies: string[];
  requirements: {
    resources: Record<string, number>;
    skills: string[];
    conditions: string[];
  };
  metadata: {
    estimatedEffort: number;
    actualEffort: number;
    successProbability: number;
    riskLevel: number;
  };
}

/** @deprecated Use simplified goals string instead */
export interface GoalUpdateEvent extends BaseEvent {
  goalId: string;
  goal: Goal;
  changes: Partial<Goal>;
  reason: string;
}

/** @deprecated Use simplified goals string instead */
export interface GoalHierarchyEvent extends BaseEvent {
  agentId: string;
  hierarchyType: 'strategic_to_tactical' | 'tactical_to_operational' | 'full_hierarchy';
  relationships: Array<{
    parentGoalId: string;
    childGoalId: string;
    relationshipType: 'decomposition' | 'dependency' | 'prerequisite';
    strength: number;
  }>;
  changes: Array<{
    type: 'add' | 'remove' | 'modify';
    relationship: any;
  }>;
}

/** @deprecated Use simplified goals string instead */
export interface GoalProgressEvent extends BaseEvent {
  goalId: string;
  progress: number;
  previousProgress: number;
  milestone?: string;
  achievements: string[];
  blockers: string[];
  estimatedCompletion?: number;
}

// Legacy social events - marked as deprecated
/** @deprecated No longer used in simplified architecture */
export interface SocialRelationship {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  relationshipType: 'friendship' | 'professional' | 'romantic' | 'rivalry' | 'neutral';
  strength: number;
  trust: number;
  friendship: number;
  respect: number;
  reputation: number;
  lastInteraction: number;
  interactionCount: number;
  sharedExperiences: string[];
  conflicts: string[];
}

/** @deprecated No longer used in simplified architecture */
export interface SocialInteraction {
  id: string;
  participants: string[];
  type: 'conversation' | 'collaboration' | 'conflict' | 'trade' | 'competition' | 'observation';
  context: string;
  duration: number;
  outcome: 'positive' | 'negative' | 'neutral';
  impact: {
    relationshipChange: number;
    trustChange: number;
    reputationChange: number;
  };
  topics: string[];
  emotions: string[];
}

/** @deprecated No longer used in simplified architecture */
export interface SocialNetwork {
  agentId: string;
  nodes: Array<{
    id: string;
    name: string;
    type: 'agent' | 'group' | 'location';
    importance: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    weight: number;
    type: string;
    strength: number;
  }>;
  metrics: {
    centrality: number;
    clustering: number;
    reach: number;
    influence: number;
  };
}

/** @deprecated No longer used in simplified architecture */
export interface SocialDataUpdateEvent extends BaseEvent {
  agentId: string;
  type: 'relationship_update' | 'network_change' | 'reputation_change';
  data: SocialRelationship | SocialNetwork | any;
  impact: number;
}

/** @deprecated No longer used in simplified architecture */
export interface SocialInteractionEvent extends BaseEvent {
  interaction: SocialInteraction;
  impact: {
    immediate: any;
    longTerm: any;
  };
  context: string;
}

/** @deprecated No longer used in simplified architecture */
export interface SocialNetworkUpdateEvent extends BaseEvent {
  agentId: string;
  changes: Array<{
    type: 'node_add' | 'node_remove' | 'edge_add' | 'edge_remove' | 'weight_change';
    data: any;
  }>;
  metrics: any;
}

// Legacy skill events - marked as deprecated
/** @deprecated No longer used in simplified architecture */
export interface Skill {
  id: string;
  name: string;
  type: string;
  category: string;
  proficiency: {
    overall: number;
    knowledge: number;
    practical: number;
    creative: number;
    currentLevel: number;
    totalExperience: number;
    accuracy: number;
    efficiency: number;
    consistency: number;
  };
  progression: {
    experienceHistory: Array<{
      timestamp: number;
      amount: number;
      cumulative: number;
      source: string;
      context: string;
      efficiency: number;
    }>;
    milestoneProgress: Array<{
      milestoneId: string;
      currentProgress: number;
      achievedAt?: number;
    }>;
    learningRate: number;
    plateauCount: number;
    breakthroughCount: number;
  };
  metadata: {
    totalExperience: number;
    lastUsed: number;
    usageCount: number;
    favorite: boolean;
  };
}

/** @deprecated No longer used in simplified architecture */
export interface SkillDataUpdateEvent extends BaseEvent {
  skillId: string;
  type: 'experience_gained' | 'level_up' | 'milestone_achieved' | 'synergy_discovered' | 'proficiency_change';
  data: {
    experience?: any;
    newLevel?: number;
    milestoneId?: string;
    synergy?: any;
    newProficiency?: number;
  };
  impact: number;
}

/** @deprecated No longer used in simplified architecture */
export interface ExperienceEvent {
  id: string;
  skillType: string;
  amount: number;
  source: string;
  context: {
    situation: string;
    difficulty: number;
    riskLevel: number;
    socialContext: string;
  };
  efficiency: number;
  learningGain: number;
  timestamp: number;
}

/** @deprecated No longer used in simplified architecture */
export interface SkillExperienceEvent extends BaseEvent {
  skillId: string;
  experience: ExperienceEvent;
  impact: {
    proficiencyGain: number;
    levelProgress: number;
    synergyActivation: string[];
  };
}

/** @deprecated No longer used in simplified architecture */
export interface SkillMilestone {
  id: string;
  name: string;
  description: string;
  level: number;
  requirements: {
    proficiency: number;
    experience: number;
    prerequisites: string[];
  };
  abilities: string[];
  progress: number;
  achievedAt?: number;
}

/** @deprecated No longer used in simplified architecture */
export interface SkillMilestoneEvent extends BaseEvent {
  skillId: string;
  milestone: SkillMilestone;
  abilities: string[];
}

/** @deprecated No longer used in simplified architecture */
export interface SkillSynergy {
  id: string;
  sourceSkillId: string;
  targetSkillId: string;
  type: 'direct' | 'analogical' | 'creative';
  strength: number;
  evolution: {
    discoveryDate: number;
    masteryLevel: number;
    usageCount: number;
    effectiveness: number;
  };
}

/** @deprecated No longer used in simplified architecture */
export interface SkillSynergyEvent extends BaseEvent {
  synergy: SkillSynergy;
  transferEvent: {
    sourceSkillId: string;
    targetSkillId: string;
    transferAmount: number;
    learningBoost: number;
    context: string;
  };
}

// Performance events (kept for system monitoring)
export interface PerformanceMetrics {
  agentId: string;
  responseTime: number;
  cognitiveLoad: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  errorRate: number;
  throughput: number;
  availability: number;
  timestamp: number;
}

export interface PerformanceMetricsUpdateEvent extends BaseEvent {
  agentId: string;
  metrics: PerformanceMetrics;
  trends: {
    improving: string[];
    declining: string[];
    stable: string[];
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'performance' | 'system' | 'security' | 'business';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
  metadata?: any;
}

export interface PerformanceAlertEvent extends BaseEvent {
  alert: PerformanceAlert;
  context: string;
}

export interface PerformanceAnomaly {
  id: string;
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number;
  confidence: number;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
}

export interface PerformanceAnomalyEvent extends BaseEvent {
  anomaly: PerformanceAnomaly;
  analysis: string;
}

// System events (kept for system monitoring)
export interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  components: Record<string, 'healthy' | 'degraded' | 'critical'>;
  metrics: {
    uptime: number;
    activeConnections: number;
    eventRate: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  lastUpdated: number;
}

export interface SystemStatusUpdateEvent extends BaseEvent {
  status: SystemStatus;
  changes: Array<{
    component: string;
    previousStatus: string;
    newStatus: string;
    reason: string;
  }>;
}

export interface SystemError {
  id: string;
  type: 'connection' | 'validation' | 'processing' | 'storage' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context: any;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
}

export interface SystemErrorEvent extends BaseEvent {
  error: SystemError;
  impact: string;
}

// Connection events (kept for connection management)
export interface ConnectionStatusEvent extends BaseEvent {
  status: 'connected' | 'disconnected' | 'reconnecting' | 'failed' | 'error';
  message: string;
  reconnectAttempts: number;
  lastPing: number;
}

// Simplified event handler interfaces
export interface AgentEventHandlers {
  onAgentStateUpdate?: (event: AgentStateUpdateEvent) => void;
  onAgentConnected?: (event: AgentConnectionEvent) => void;
  onAgentDisconnected?: (event: AgentConnectionEvent) => void;
}

// Legacy event handlers - marked as deprecated
/** @deprecated Use simplified event handlers instead */
export interface PersonalityEventHandlers {
  onPersonalityTraitUpdate?: (event: PersonalityTraitUpdateEvent) => void;
  onPersonalityEmotionUpdate?: (event: PersonalityEmotionEvent) => void;
  onPersonalityMoodUpdate?: (event: PersonalityMoodEvent) => void;
  onPersonalityEvolution?: (event: PersonalityEvolutionEvent) => void;
}

/** @deprecated No longer used in simplified architecture */
export interface MemoryEventHandlers {
  onMemorySemanticUpdate?: (event: MemoryUpdateEvent) => void;
  onMemoryEpisodicUpdate?: (event: MemoryUpdateEvent) => void;
  onMemoryProceduralUpdate?: (event: MemoryUpdateEvent) => void;
  onMemoryConsolidation?: (event: MemoryConsolidationEvent) => void;
}

/** @deprecated Use simplified goals string instead */
export interface GoalEventHandlers {
  onGoalStrategicUpdate?: (event: GoalUpdateEvent) => void;
  onGoalTacticalUpdate?: (event: GoalUpdateEvent) => void;
  onGoalOperationalUpdate?: (event: GoalUpdateEvent) => void;
  onGoalProgress?: (event: GoalProgressEvent) => void;
  onGoalHierarchy?: (event: GoalHierarchyEvent) => void;
}

/** @deprecated No longer used in simplified architecture */
export interface SocialEventHandlers {
  onSocialRelationshipUpdate?: (event: SocialDataUpdateEvent) => void;
  onSocialInteraction?: (event: SocialInteractionEvent) => void;
  onSocialNetworkUpdate?: (event: SocialNetworkUpdateEvent) => void;
}

/** @deprecated No longer used in simplified architecture */
export interface SkillEventHandlers {
  onSkillProgressUpdate?: (event: SkillDataUpdateEvent) => void;
  onSkillExperience?: (event: SkillExperienceEvent) => void;
  onSkillSynergy?: (event: SkillSynergyEvent) => void;
  onSkillMilestone?: (event: SkillMilestoneEvent) => void;
}

export interface PerformanceEventHandlers {
  onPerformanceMetricsUpdate?: (event: PerformanceMetricsUpdateEvent) => void;
  onPerformanceAlert?: (event: PerformanceAlertEvent) => void;
  onPerformanceAnomaly?: (event: PerformanceAnomalyEvent) => void;
}

export interface SystemEventHandlers {
  onSystemStatusUpdate?: (event: SystemStatusUpdateEvent) => void;
  onSystemError?: (event: SystemErrorEvent) => void;
  onConnectionStatus?: (event: ConnectionStatusEvent) => void;
}

// All types are already exported above with their declarations