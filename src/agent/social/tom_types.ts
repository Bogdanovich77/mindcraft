/**
 * Theory of Mind Type Definitions
 * 
 * This file contains all TypeScript interfaces and type definitions
 * for the theory of mind system, including mental states, beliefs,
 * intentions, emotions, and social reasoning components.
 */

import { PersonalityTraits } from '../langgraph/interfaces.js';
import { AgentRelationship } from './relationship_types.js';

/**
 * Core mental state representation for an agent
 */
export interface MentalState {
  /** The agent this mental state represents */
  agentId: string;
  
  /** Timestamp when this mental state was last updated */
  lastUpdated: number;
  
  /** Confidence level in this mental state representation (0-1) */
  confidence: number;
  
  /** Beliefs about the world and other agents */
  beliefs: BeliefSystem;
  
  /** Current intentions and goals */
  intentions: IntentionState;
  
  /** Emotional state and affective information */
  emotions: EmotionalState;
  
  /** Knowledge state - what the agent knows and doesn't know */
  knowledge: KnowledgeState;
  
  /** Perspective-taking information */
  perspective: PerspectiveState;
}

/**
 * Belief system for representing agent's beliefs about the world
 */
export interface BeliefSystem {
  /** Epistemic beliefs - knowledge about the world state */
  epistemicBeliefs: Map<string, EpistemicBelief>;
  
  /** Social beliefs - knowledge about other agents */
  socialBeliefs: Map<string, SocialBelief>;
  
  /** Belief consistency metrics */
  consistency: BeliefConsistency;
  
  /** Belief revision history */
  revisionHistory: BeliefRevision[];
}

/**
 * Individual epistemic belief about world facts
 */
export interface EpistemicBelief {
  /** The proposition or fact being believed */
  proposition: string;
  
  /** Confidence level in this belief (0-1) */
  confidence: number;
  
  /** Source of this belief */
  source: BeliefSource;
  
  /** Timestamp when belief was formed/updated */
  timestamp: number;
  
  /** Evidence supporting this belief */
  evidence: Evidence[];
  
  /** Whether this belief is currently active */
  active: boolean;
}

/**
 * Social belief about another agent
 */
export interface SocialBelief {
  /** The target agent this belief is about */
  targetAgentId: string;
  
  /** The belief content about the target agent */
  belief: string;
  
  /** Confidence in this social belief (0-1) */
  confidence: number;
  
  /** Type of social belief */
  type: SocialBeliefType;
  
  /** Source of this belief */
  source: BeliefSource;
  
  /** Timestamp when belief was formed/updated */
  timestamp: number;
  
  /** Evidence supporting this belief */
  evidence: Evidence[];
}

/**
 * Types of social beliefs
 */
export enum SocialBeliefType {
  COMPETENCE = 'competence',
  TRUSTWORTHINESS = 'trustworthiness',
  INTENTIONS = 'intentions',
  CAPABILITIES = 'capabilities',
  RELATIONSHIP = 'relationship',
  EMOTIONS = 'emotions',
  KNOWLEDGE = 'knowledge',
  GOALS = 'goals'
}

/**
 * Source of a belief
 */
export enum BeliefSource {
  DIRECT_OBSERVATION = 'direct_observation',
  COMMUNICATION = 'communication',
  INFERENCE = 'inference',
  TESTIMONY = 'testimony',
  ASSUMPTION = 'assumption',
  MEMORY = 'memory'
}

/**
 * Evidence supporting a belief
 */
export interface Evidence {
  /** Type of evidence */
  type: EvidenceType;
  
  /** Content of the evidence */
  content: any;
  
  /** Strength of this evidence (0-1) */
  strength: number;
  
  /** Timestamp when evidence was collected */
  timestamp: number;
  
  /** Source of evidence */
  source: string;
}

/**
 * Types of evidence
 */
export enum EvidenceType {
  OBSERVATION = 'observation',
  COMMUNICATION = 'communication',
  ACTION = 'action',
  OUTCOME = 'outcome',
  TESTIMONY = 'testimony'
}

/**
 * Belief consistency metrics
 */
export interface BeliefConsistency {
  /** Overall consistency score (0-1) */
  overallScore: number;
  
  /** Number of detected contradictions */
  contradictions: number;
  
  /** List of contradictory beliefs */
  contradictoryPairs: Array<{
    belief1: string;
    belief2: string;
    conflictLevel: number;
  }>;
  
  /** Last consistency check timestamp */
  lastChecked: number;
}

/**
 * Belief revision record
 */
export interface BeliefRevision {
  /** Type of revision */
  type: RevisionType;
  
  /** Belief that was revised */
  beliefId: string;
  
  /** Previous belief state */
  previousState: any;
  
  /** New belief state */
  newState: any;
  
  /** Reason for revision */
  reason: string;
  
  /** Timestamp of revision */
  timestamp: number;
}

/**
 * Types of belief revisions
 */
export enum RevisionType {
  STRENGTHENING = 'strengthening',
  WEAKENING = 'weakening',
  REJECTION = 'rejection',
  REPLACEMENT = 'replacement',
  ADDITION = 'addition'
}

/**
 * Intention state representing agent's goals and plans
 */
export interface IntentionState {
  /** Current active intentions */
  activeIntentions: Map<string, Intention>;
  
  /** Predicted future intentions */
  predictedIntentions: Map<string, PredictedIntention>;
  
  /** Intention confidence metrics */
  confidence: IntentionConfidence;
  
  /** Intention change history */
  changeHistory: IntentionChange[];
}

/**
 * Individual intention
 */
export interface Intention {
  /** Unique identifier for this intention */
  id: string;
  
  /** The goal or objective */
  goal: string;
  
  /** Type of intention */
  type: IntentionType;
  
  /** Priority level (0-1) */
  priority: number;
  
  /** Expected duration in milliseconds */
  expectedDuration: number;
  
  /** Progress towards completion (0-1) */
  progress: number;
  
  /** Timestamp when intention was detected */
  detectedAt: number;
  
  /** Confidence in this intention prediction (0-1) */
  confidence: number;
  
  /** Supporting evidence */
  evidence: Evidence[];
  
  /** Associated plan or sequence of actions */
  plan?: ActionPlan;
}

/**
 * Types of intentions
 */
export enum IntentionType {
  SURVIVAL = 'survival',
  RESOURCE_ACQUISITION = 'resource_acquisition',
  SOCIAL_INTERACTION = 'social_interaction',
  EXPLORATION = 'exploration',
  CONSTRUCTION = 'construction',
  COMBAT = 'combat',
  ESCAPE = 'escape',
  COOPERATION = 'cooperation',
  COMPETITION = 'competition',
  COMMUNICATION = 'communication'
}

/**
 * Predicted intention for future time horizons
 */
export interface PredictedIntention extends Intention {
  /** Time horizon for this prediction */
  timeHorizon: number;
  
  /** Probability of this intention occurring */
  probability: number;
  
  /** Alternative possible intentions */
  alternatives: Array<{
    intention: Intention;
    probability: number;
  }>;
}

/**
 * Intention confidence metrics
 */
export interface IntentionConfidence {
  /** Overall confidence in intention predictions */
  overall: number;
  
  /** Confidence by intention type */
  byType: Map<IntentionType, number>;
  
  /** Historical accuracy rate */
  accuracy: number;
  
  /** Number of correct predictions */
  correctPredictions: number;
  
  /** Total number of predictions made */
  totalPredictions: number;
}

/**
 * Intention change record
 */
export interface IntentionChange {
  /** Previous intention */
  previousIntention: string;
  
  /** New intention */
  newIntention: string;
  
  /** Reason for change */
  reason: string;
  
  /** Timestamp of change */
  timestamp: number;
  
  /** Confidence in this change detection */
  confidence: number;
}

/**
 * Action plan associated with an intention
 */
export interface ActionPlan {
  /** Sequence of planned actions */
  actions: PlannedAction[];
  
  /** Expected outcomes */
  expectedOutcomes: string[];
  
  /** Required resources */
  requiredResources: string[];
  
  /** Estimated completion time */
  estimatedCompletion: number;
}

/**
 * Individual planned action
 */
export interface PlannedAction {
  /** Action description */
  action: string;
  
  /** Expected timing */
  expectedTiming: number;
  
  /** Priority within the plan */
  priority: number;
  
  /** Dependencies on other actions */
  dependencies: string[];
}

/**
 * Emotional state representation
 */
export interface EmotionalState {
  /** Current primary emotions */
  currentEmotions: Map<Emotion, number>;
  
  /** Predicted emotional responses */
  predictedResponses: Map<string, EmotionalResponse>;
  
  /** Mood state (longer-term affective state) */
  mood: MoodState;
  
  /** Empathy level for different agents */
  empathy: Map<string, number>;
  
  /** Emotional intelligence metrics */
  intelligence: EmotionalIntelligence;
}

/**
 * Basic emotions
 */
export enum Emotion {
  JOY = 'joy',
  SADNESS = 'sadness',
  ANGER = 'anger',
  FEAR = 'fear',
  SURPRISE = 'surprise',
  DISGUST = 'disgust',
  TRUST = 'trust',
  ANTICIPATION = 'anticipation'
}

/**
 * Emotional response prediction
 */
export interface EmotionalResponse {
  /** Situation or stimulus */
  situation: string;
  
  /** Predicted emotional response */
  emotion: Emotion;
  
  /** Intensity of the emotion (0-1) */
  intensity: number;
  
  /** Confidence in prediction (0-1) */
  confidence: number;
  
  /** Time horizon for this prediction */
  timeHorizon: number;
}

/**
 * Mood state representation
 */
export interface MoodState {
  /** Current mood (positive/negative/neutral) */
  valence: number;
  
  /** Arousal level (calm/excited) */
  arousal: number;
  
  /** Dominance level (submissive/dominant) */
  dominance: number;
  
  /** Duration of current mood state */
  duration: number;
  
  /** Mood stability */
  stability: number;
}

/**
 * Emotional intelligence metrics
 */
export interface EmotionalIntelligence {
  /** Ability to recognize emotions in others */
  recognition: number;
  
  /** Ability to understand emotional causes */
  understanding: number;
  
  /** Ability to manage emotions */
  regulation: number;
  
  /** Ability to use emotions in thinking */
  utilization: number;
  
  /** Overall emotional intelligence score */
  overall: number;
}

/**
 * Knowledge state representation
 */
export interface KnowledgeState {
  /** What the agent knows */
  knownFacts: Map<string, KnowledgeFact>;
  
  /** What the agent doesn't know (awareness of ignorance) */
  unknownFacts: Map<string, UnknownFact>;
  
  /** Knowledge sources and their reliability */
  sources: Map<string, SourceReliability>;
  
  /** Knowledge confidence metrics */
  confidence: KnowledgeConfidence;
}

/**
 * Individual knowledge fact
 */
export interface KnowledgeFact {
  /** The fact or piece of knowledge */
  fact: string;
  
  /** Confidence in this knowledge (0-1) */
  confidence: number;
  
  /** Source of this knowledge */
  source: string;
  
  /** Timestamp when knowledge was acquired */
  acquiredAt: number;
  
  /** Last verification timestamp */
  lastVerified: number;
  
  /** Number of times this knowledge has been used */
  usageCount: number;
  
  /** Whether this knowledge is currently valid */
  valid: boolean;
}

/**
 * Representation of known unknowns
 */
export interface UnknownFact {
  /** The domain or topic the agent knows they don't know about */
  domain: string;
  
  /** Specific question or gap in knowledge */
  question: string;
  
  /** Importance of knowing this (0-1) */
  importance: number;
  
  /** Potential sources for this knowledge */
  potentialSources: string[];
  
  /** Timestamp when this unknown was identified */
  identifiedAt: number;
}

/**
 * Source reliability assessment
 */
export interface SourceReliability {
  /** Source identifier */
  sourceId: string;
  
  /** Historical accuracy rate (0-1) */
  accuracy: number;
  
  /** Trust level in this source (0-1) */
  trust: number;
  
  /** Number of interactions with this source */
  interactions: number;
  
  /** Last interaction timestamp */
  lastInteraction: number;
  
  /** Source type */
  type: SourceType;
}

/**
 * Types of knowledge sources
 */
export enum SourceType {
  DIRECT_EXPERIENCE = 'direct_experience',
  OBSERVATION = 'observation',
  COMMUNICATION = 'communication',
  INFERENCE = 'inference',
  TESTIMONY = 'testimony',
  DOCUMENTATION = 'documentation'
}

/**
 * Knowledge confidence metrics
 */
export interface KnowledgeConfidence {
  /** Overall confidence in knowledge state */
  overall: number;
  
  /** Confidence by knowledge domain */
  byDomain: Map<string, number>;
  
  /** Knowledge accuracy rate */
  accuracy: number;
  
  /** Knowledge completeness */
  completeness: number;
}

/**
 * Perspective-taking state
 */
export interface PerspectiveState {
  /** Current perspective being taken */
  currentPerspective: string;
  
  /** Ability to take different perspectives */
  perspectiveTaking: PerspectiveTakingAbility;
  
  /** False belief understanding */
  falseBeliefUnderstanding: FalseBeliefState;
  
  /** Perspective switch history */
  switchHistory: PerspectiveSwitch[];
}

/**
 * Perspective-taking ability metrics
 */
export interface PerspectiveTakingAbility {
  /** Ability to adopt others' viewpoints */
  adoption: number;
  
  /** Ability to maintain multiple perspectives */
  maintenance: number;
  
  /** Ability to switch between perspectives */
  switching: number;
  
  /** Overall perspective-taking score */
  overall: number;
}

/**
 * False belief understanding state
 */
export interface FalseBeliefState {
  /** Understanding that others can hold false beliefs */
  understandsFalseBeliefs: boolean;
  
  /** Ability to detect deception */
  deceptionDetection: number;
  
  /** Current false beliefs detected in others */
  detectedFalseBeliefs: Map<string, FalseBelief>;
  
  /** Historical accuracy in false belief detection */
  accuracy: number;
}

/**
 * Representation of a false belief
 */
export interface FalseBelief {
  /** Agent holding the false belief */
  agentId: string;
  
  /** The false belief content */
  belief: string;
  
  /** The actual truth */
  reality: string;
  
  /** Confidence that this is a false belief (0-1) */
  confidence: number;
  
  /** Potential reasons for the false belief */
  reasons: string[];
  
  /** Timestamp when detected */
  detectedAt: number;
}

/**
 * Perspective switch record
 */
export interface PerspectiveSwitch {
  /** Previous perspective */
  fromPerspective: string;
  
  /** New perspective */
  toPerspective: string;
  
  /** Reason for switch */
  reason: string;
  
  /** Timestamp of switch */
  timestamp: number;
  
  /** Success of the switch */
  success: boolean;
}

/**
 * Social reasoning context
 */
export interface SocialReasoningContext {
  /** Current social situation */
  situation: SocialSituation;
  
  /** Group dynamics information */
  groupDynamics: GroupDynamics;
  
  /** Social norms applicable */
  socialNorms: SocialNorm[];
  
  /** Cultural context */
  culturalContext: CulturalContext;
}

/**
 * Social situation representation
 */
export interface SocialSituation {
  /** Type of social situation */
  type: SituationType;
  
  /** Participants in the situation */
  participants: string[];
  
  /** Social roles of participants */
  roles: Map<string, SocialRole>;
  
  /** Power dynamics */
  powerDynamics: PowerDynamics;
  
  /** Communication patterns */
  communication: CommunicationPattern;
  
  /** Timestamp of situation assessment */
  assessedAt: number;
}

/**
 * Types of social situations
 */
export enum SituationType {
  COOPERATION = 'cooperation',
  COMPETITION = 'competition',
  NEGOTIATION = 'negotiation',
  CONFLICT = 'conflict',
  TRADING = 'trading',
  CELEBRATION = 'celebration',
  CRISIS = 'crisis',
  SOCIAL_GATHERING = 'social_gathering',
  WORK = 'work',
  LEISURE = 'leisure'
}

/**
 * Social roles
 */
export enum SocialRole {
  LEADER = 'leader',
  FOLLOWER = 'follower',
  MEDIATOR = 'mediator',
  EXPERT = 'expert',
  NOVICE = 'novice',
  COMPETITOR = 'competitor',
  COLLABORATOR = 'collaborator',
  OBSERVER = 'observer'
}

/**
 * Power dynamics in a social situation
 */
export interface PowerDynamics {
  /** Power distribution among participants */
  distribution: Map<string, number>;
  
  /** Power sources for each participant */
  sources: Map<string, PowerSource[]>;
  
  /** Power balance assessment */
  balance: PowerBalance;
  
  /** Influence networks */
  influence: InfluenceNetwork;
}

/**
 * Sources of power
 */
export enum PowerSource {
  EXPERTISE = 'expertise',
  RESOURCES = 'resources',
  AUTHORITY = 'authority',
  CHARISMA = 'charisma',
  PHYSICAL_STRENGTH = 'physical_strength',
  SOCIAL_CONNECTIONS = 'social_connections',
  INFORMATION = 'information'
}

/**
 * Power balance assessment
 */
export enum PowerBalance {
  BALANCED = 'balanced',
  DOMINATED = 'dominated',
  FRAGMENTED = 'fragmented',
  CONTESTED = 'contested',
  EMERGING = 'emerging'
}

/**
 * Influence network representation
 */
export interface InfluenceNetwork {
  /** Influence relationships */
  connections: Map<string, InfluenceConnection>;
  
  /** Network centrality measures */
  centrality: Map<string, number>;
  
  /** Influence clusters */
  clusters: string[][];
}

/**
 * Individual influence connection
 */
export interface InfluenceConnection {
  /** Source of influence */
  from: string;
  
  /** Target of influence */
  to: string;
  
  /** Strength of influence (0-1) */
  strength: number;
  
  /** Type of influence */
  type: InfluenceType;
  
  /** Duration of this influence */
  duration: number;
}

/**
 * Types of influence
 */
export enum InfluenceType {
  DIRECT = 'direct',
  INDIRECT = 'indirect',
  COERCIVE = 'coercive',
  PERSUASIVE = 'persuasive',
  EXPERT = 'expert',
  REFERENT = 'referent'
}

/**
 * Communication pattern in social situation
 */
export interface CommunicationPattern {
  /** Flow of communication */
  flow: CommunicationFlow;
  
  /** Communication styles of participants */
  styles: Map<string, CommunicationStyle>;
  
  /** Topic analysis */
  topics: TopicAnalysis;
  
  /** Non-verbal cues */
  nonVerbalCues: NonVerbalCue[];
}

/**
 * Communication flow patterns
 */
export enum CommunicationFlow {
  CENTRALIZED = 'centralized',
  DECENTRALIZED = 'decentralized',
  CIRCULAR = 'circular',
  CHAIN = 'chain',
  NETWORK = 'network',
  DOMINATED = 'dominated'
}

/**
 * Communication styles
 */
export enum CommunicationStyle {
  ASSERTIVE = 'assertive',
  AGGRESSIVE = 'aggressive',
  PASSIVE = 'passive',
  PASSIVE_AGGRESSIVE = 'passive_aggressive',
  COLLABORATIVE = 'collaborative',
  COMPETITIVE = 'competitive'
}

/**
 * Topic analysis
 */
export interface TopicAnalysis {
  /** Main topics being discussed */
  mainTopics: string[];
  
  /** Topic importance weights */
  importance: Map<string, number>;
  
  /** Topic sentiment */
  sentiment: Map<string, number>;
  
  /** Topic transitions */
  transitions: TopicTransition[];
}

/**
 * Topic transition record
 */
export interface TopicTransition {
  /** From topic */
  fromTopic: string;
  
  /** To topic */
  toTopic: string;
  
  /** Who initiated the transition */
  initiator: string;
  
  /** Timestamp of transition */
  timestamp: number;
  
  /** Reason for transition */
  reason: string;
}

/**
 * Non-verbal cue representation
 */
export interface NonVerbalCue {
  /** Agent exhibiting the cue */
  agentId: string;
  
  /** Type of cue */
  type: CueType;
  
  /** Cue intensity */
  intensity: number;
  
  /** Timestamp of cue */
  timestamp: number;
  
  /** Interpretation of the cue */
  interpretation: string;
}

/**
 * Types of non-verbal cues
 */
export enum CueType {
  GESTURE = 'gesture',
  FACIAL_EXPRESSION = 'facial_expression',
  POSTURE = 'posture',
  PROXEMICS = 'proxemics',
  EYE_CONTACT = 'eye_contact',
  TONE_OF_VOICE = 'tone_of_voice'
}

/**
 * Group dynamics information
 */
export interface GroupDynamics {
  /** Cohesion level of the group */
  cohesion: number;
  
  /** Leadership structure */
  leadership: LeadershipStructure;
  
  /** Subgroups within the group */
  subgroups: Subgroup[];
  
  /** Conflict level within the group */
  conflict: ConflictLevel;
  
  /** Decision-making process */
  decisionMaking: DecisionMakingProcess;
}

/**
 * Leadership structure
 */
export interface LeadershipStructure {
  /** Type of leadership */
  type: LeadershipType;
  
  /** Identified leaders */
  leaders: string[];
  
  /** Leadership legitimacy */
  legitimacy: number;
  
  /** Leadership effectiveness */
  effectiveness: number;
}

/**
 * Types of leadership
 */
export enum LeadershipType {
  AUTOCRATIC = 'autocratic',
  DEMOCRATIC = 'democratic',
  LAISSEZ_FAIRE = 'laissez_faire',
  TRANSFORMATIONAL = 'transformational',
  SITUATIONAL = 'situational',
  SHARED = 'shared',
  EMERGENT = 'emergent'
}

/**
 * Subgroup within a larger group
 */
export interface Subgroup {
  /** Members of the subgroup */
  members: string[];
  
  /** Subgroup identifier */
  id: string;
  
  /** Cohesion within subgroup */
  cohesion: number;
  
  /** Purpose or reason for subgroup formation */
  purpose: string;
  
  /** Relationship with main group */
  relationship: SubgroupRelationship;
}

/**
 * Relationship between subgroup and main group
 */
export enum SubgroupRelationship {
  INTEGRATED = 'integrated',
  SEPARATE = 'separate',
  OPPOSITIONAL = 'oppositional',
  DOMINANT = 'dominant',
  SUBORDINATE = 'subordinate'
}

/**
 * Conflict level assessment
 */
export enum ConflictLevel {
  NONE = 'none',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  SEVERE = 'severe'
}

/**
 * Decision-making process
 */
export interface DecisionMakingProcess {
  /** Type of decision making */
  type: DecisionType;
  
  /** Participation level */
  participation: ParticipationLevel;
  
  /** Consensus level */
  consensus: number;
  
  /** Efficiency of decision making */
  efficiency: number;
}

/**
 * Types of decision making
 */
export enum DecisionType {
  CONSENSUS = 'consensus',
  MAJORITY_VOTE = 'majority_vote',
  AUTHORITY = 'authority',
  COMPROMISE = 'compromise',
  UNILATERAL = 'unilateral',
  DELEGATED = 'delegated'
}

/**
 * Participation levels
 */
export enum ParticipationLevel {
  FULL = 'full',
  MAJORITY = 'majority',
  MINORITY = 'minority',
  ELITE = 'elite',
  NONE = 'none'
}

/**
 * Social norm representation
 */
export interface SocialNorm {
  /** Norm identifier */
  id: string;
  
  /** Norm description */
  description: string;
  
  /** Type of norm */
  type: NormType;
  
  /** Importance of the norm (0-1) */
  importance: number;
  
  /** Context where this norm applies */
  context: string;
  
  /** Expected behavior */
  expectedBehavior: string;
  
  /** Consequences of violation */
  violationConsequences: string[];
  
  /** Current compliance level */
  compliance: number;
}

/**
 * Types of social norms
 */
export enum NormType {
  CONVENTION = 'convention',
  MORAL = 'moral',
  LEGAL = 'legal',
  RELIGIOUS = 'religious',
  CUSTOM = 'custom',
  ETIQUETTE = 'etiquette'
}

/**
 * Cultural context information
 */
export interface CulturalContext {
  /** Cultural background */
  background: CulturalBackground;
  
  /** Cultural values */
  values: CulturalValue[];
  
  /** Communication norms */
  communicationNorms: CommunicationNorm[];
  
  /** Social hierarchies */
  hierarchies: SocialHierarchy[];
}

/**
 * Cultural background
 */
export interface CulturalBackground {
  /** Primary culture */
  primaryCulture: string;
  
  /** Secondary cultural influences */
  secondaryCultures: string[];
  
  /** Acculturation level */
  acculturation: number;
  
  /** Cultural identity strength */
  identityStrength: number;
}

/**
 * Cultural value
 */
export interface CulturalValue {
  /** Value name */
  name: string;
  
  /** Value importance (0-1) */
  importance: number;
  
  /** Value expression in behavior */
  expression: string;
  
  /** Value conflicts with other values */
  conflicts: string[];
}

/**
 * Communication norm
 */
export interface CommunicationNorm {
  /** Norm context */
  context: string;
  
  /** Expected communication style */
  expectedStyle: CommunicationStyle;
  
  /** Taboo topics */
  tabooTopics: string[];
  
  /** Preferred topics */
  preferredTopics: string[];
  
  /** Directness level */
  directness: number;
}

/**
 * Social hierarchy
 */
export interface SocialHierarchy {
  /** Hierarchy type */
  type: HierarchyType;
  
  /** Hierarchy levels */
  levels: HierarchyLevel[];
  
  /** Mobility between levels */
  mobility: MobilityLevel;
  
  /** Importance of hierarchy */
  importance: number;
}

/**
 * Types of social hierarchies
 */
export enum HierarchyType {
  AGE = 'age',
  GENDER = 'gender',
  STATUS = 'status',
  EXPERTISE = 'expertise',
  WEALTH = 'wealth',
  POLITICAL = 'political',
  RELIGIOUS = 'religious'
}

/**
 * Hierarchy level
 */
export interface HierarchyLevel {
  /** Level name */
  name: string;
  
  /** Level position */
  position: number;
  
  /** Privileges at this level */
  privileges: string[];
  
  /** Obligations at this level */
  obligations: string[];
}

/**
 * Mobility levels
 */
export enum MobilityLevel {
  HIGH = 'high',
  MODERATE = 'moderate',
  LOW = 'low',
  NONE = 'none'
}

/**
 * Theory of mind configuration
 */
export interface TheoryOfMindConfig {
  /** Maximum number of mental models to maintain */
  maxMentalModels: number;
  
  /** Confidence threshold for mental state activation */
  confidenceThreshold: number;
  
  /** Update frequency for mental models (ms) */
  updateFrequency: number;
  
  /** Memory retention period for mental states */
  memoryRetentionPeriod: number;
  
  /** Enable perspective-taking */
  enablePerspectiveTaking: boolean;
  
  /** Enable false belief understanding */
  enableFalseBeliefUnderstanding: boolean;
  
  /** Enable emotional intelligence */
  enableEmotionalIntelligence: boolean;
  
  /** Enable social reasoning */
  enableSocialReasoning: boolean;
  
  /** Performance optimization settings */
  performance: PerformanceConfig;
}

/**
 * Performance configuration
 */
export interface PerformanceConfig {
  /** Enable caching for mental models */
  enableCaching: boolean;
  
  /** Cache size limit */
  cacheSizeLimit: number;
  
  /** Enable lazy loading */
  enableLazyLoading: boolean;
  
  /** Batch processing size */
  batchSize: number;
  
  /** Parallel processing enabled */
  enableParallelProcessing: boolean;
  
  /** Maximum concurrent operations */
  maxConcurrentOperations: number;
}

/**
 * Theory of mind metrics
 */
export interface TheoryOfMindMetrics {
  /** Accuracy of mental state predictions */
  predictionAccuracy: number;
  
  /** Response time for mental state updates */
  responseTime: number;
  
  /** Memory usage for mental models */
  memoryUsage: number;
  
  /** Number of active mental models */
  activeModels: number;
  
  /** Confidence distribution */
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  
  /** Performance metrics */
  performance: {
    averageUpdate: number;
    peakUpdate: number;
    totalUpdates: number;
  };
}