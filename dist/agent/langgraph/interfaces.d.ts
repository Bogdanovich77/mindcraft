/**
 * Core TypeScript interfaces for the Mindcraft LangGraph hybrid agent system
 *
 * This file contains all TypeScript interfaces and type definitions
 * for the agent state structure, supporting both reactive and cognitive
 * components with comprehensive social integration.
 */
import { AntiIdleSystem } from "../cognitive/anti_idle_system";
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
    id?: string;
}
export interface Block {
    type: string;
    position: Position;
    distance?: number;
    accessible?: boolean;
}
export interface Inventory {
    items: InventoryItem[];
    slots: number;
    usedSlots: number;
    filter?: (item: InventoryItem) => boolean;
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
    explorationDrive: number;
    socialTendency: number;
    buildingCreativity: number;
    combatAggression: number;
}
export interface Motivation {
    id: string;
    type: string;
    strength: number;
    satisfaction: number;
    priority: number;
}
export interface MotivationState {
    motivations: Motivation[];
    primaryMotivation: string;
}
export interface Value {
    id: string;
    name: string;
    importance: number;
    priority: number;
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
        overall: number;
        knowledge: number;
        practical: number;
        creative: number;
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
    type: 'strategic' | 'tactical' | 'operational';
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'pending' | 'active' | 'completed' | 'failed' | 'paused';
    description: string;
    createdAt: number;
    updatedAt: number;
    dependencies: string[];
    resources: {
        required: ResourceRequirement[];
        allocated: ResourceRequirement[];
        items?: ResourceRequirement[];
        tools?: ResourceRequirement[];
        assistance?: ResourceRequirement[];
        location?: Position;
    };
    progress: {
        current: number;
        target: number;
        percentage: number;
        completedSteps?: number;
    };
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
    duration?: number;
    requiredSkills?: string[];
    requiredResources?: ResourceRequirement[];
}
export interface ProceduralAdaptation {
    context: string;
    modification: any;
    successRate: number;
    timestamp: number;
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
    items?: WorkingMemoryItem[];
    decayRate?: number;
}
export interface WorkingMemoryItem {
    content: any;
    type: string;
    timestamp: number;
    priority: number;
    decayRate: number;
    id?: string;
}
export interface MemoryQuery {
    type: 'semantic' | 'episodic' | 'procedural' | 'working';
    criteria: any;
    limit?: number;
    relevanceThreshold?: number;
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
    semantic?: any;
}
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
export interface ProcessingState {
    currentPhase: ProcessingPhase;
    cognitiveLoad: number;
    attentionLevel: number;
    processingHistory: ProcessingRecord[];
    decisionThreshold?: number;
}
export declare enum ProcessingPhase {
    PERCEPTION = "perception",
    ANALYSIS = "analysis",
    PLANNING = "planning",
    DECISION = "decision",
    EXECUTION = "execution",
    REFLECTION = "reflection",
    CONVERSATION = "conversation",
    COORDINATION = "coordination"
}
export interface ProcessingRecord {
    phase: ProcessingPhase;
    startTime: number;
    endTime: number;
    duration: number;
    success: boolean;
    details: any;
}
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
    detectedAt?: number;
    position?: Position;
}
export interface ReactiveAction {
    mode: string;
    priority: number | InterruptPriority;
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
    type?: string;
    bypassedCognitive?: boolean;
}
export declare enum InterruptPriority {
    EMERGENCY = "emergency",
    SURVIVAL = "survival",
    OPPORTUNITY = "opportunity",
    COGNITIVE = "cognitive"
}
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
export interface SocialState {
    relationships: Map<string, Relationship>;
    reputation: Reputation;
    socialContext: SocialContext;
    theoryOfMind: Map<string, MentalModel>;
    agentId?: string;
    trustLevels?: Map<string, number>;
    mentalModels?: Map<string, MentalModel>;
}
export interface Relationship {
    agentId: string;
    trustLevel: number;
    friendshipScore: number;
    respectLevel: number;
    interactionHistory: InteractionEvent[];
    lastInteraction: number;
    status: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'ally' | 'enemy';
    reputationScore?: number;
}
export interface Reputation {
    globalScore: number;
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
    valence: number;
    arousal: number;
    lastUpdated: number;
}
export interface Plan {
    id: string;
    name: string;
    description: string;
    goalId: string;
    steps: PlanStep[];
    dependencies: string[];
    estimatedDuration: number;
    requiredResources: ResourceRequirement[];
    requiredSkills: SkillRequirement[];
    feasibilityScore: number;
    priority: number;
    status: PlanStatus;
    createdAt: number;
    updatedAt: number;
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
export declare enum FeasibilityLevel {
    IMPOSSIBLE = "impossible",
    VERY_DIFFICULT = "very_difficult",
    DIFFICULT = "difficult",
    MODERATE = "moderate",
    EASY = "easy",
    TRIVIAL = "trivial",
    VERY_HIGH = "very_high",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    VERY_LOW = "very_low"
}
export declare enum PlanStatus {
    PENDING = "pending",
    ACTIVE = "active",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare enum DelegationStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    COMPLETED = "completed",
    FAILED = "failed"
}
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
export interface AgentMetadata {
    agentId: string;
    startTime: number;
    lastUpdate: number;
    version: string;
    performanceMode: string;
}
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
export interface PlanningEngine {
    initialize(state: AgentState): Promise<void>;
    executePlanningCycle(state: AgentState): Promise<any>;
    getMetrics(): any;
    shutdown(): Promise<void>;
    activePlans?: Plan[];
}
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
export interface SkillState {
    skills: Map<string, Skill>;
    experience: number;
    learningRate: number;
    skillSynergies: Map<string, any>;
}
export interface GoalState {
    activeGoals: Goal[];
    completedGoals: Goal[];
    failedGoals: Goal[];
    currentGoal?: Goal;
    strategicGoals: Goal[];
    tacticalGoals: Goal[];
    operationalGoals: Goal[];
}
export interface GoalProgress {
    current: number;
    target: number;
    percentage: number;
    completedSteps?: number;
}
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
export declare enum SkillType {
    COMBAT = "combat",
    MINING = "mining",
    BUILDING = "building",
    CRAFTING = "crafting",
    FARMING = "farming",
    EXPLORATION = "exploration",
    SOCIAL = "social",
    TRADING = "trading",
    MAGIC = "magic",
    SURVIVAL = "survival"
}
export declare enum ExperienceSource {
    PRACTICE = "practice",
    SUCCESS = "success",
    FAILURE = "failure",
    TEACHING = "teaching",
    OBSERVATION = "observation",
    EXPERIMENTATION = "experimentation",
    SOCIAL = "social",
    BREAKTHROUGH = "breakthrough"
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
export declare enum LearningMethod {
    PRACTICE = "practice",
    INSTRUCTION = "instruction",
    OBSERVATION = "observation",
    EXPERIMENTATION = "experimentation",
    SOCIAL_LEARNING = "social_learning",
    TRIAL_AND_ERROR = "trial_and_error"
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
export declare enum GoalType {
    STRATEGIC = "strategic",
    TACTICAL = "tactical",
    OPERATIONAL = "operational",
    SOCIAL = "social",
    COLLABORATIVE = "collaborative"
}
export interface GoalPrioritizationResult {
    rankedGoals: RankedGoal[];
    processingTime: number;
}
export declare const AgentStateAnnotation: import("@langchain/langgraph").AnnotationRoot<{
    context: {
        (): import("@langchain/langgraph").LastValue<WorldContext>;
        (annotation: import("@langchain/langgraph").SingleReducer<WorldContext, WorldContext>): import("@langchain/langgraph").BinaryOperatorAggregate<WorldContext, WorldContext>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    reactive: {
        (): import("@langchain/langgraph").LastValue<ReactiveState>;
        (annotation: import("@langchain/langgraph").SingleReducer<ReactiveState, ReactiveState>): import("@langchain/langgraph").BinaryOperatorAggregate<ReactiveState, ReactiveState>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    cognitive: {
        (): import("@langchain/langgraph").LastValue<any>;
        (annotation: import("@langchain/langgraph").SingleReducer<any, any>): import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    executive: {
        (): import("@langchain/langgraph").LastValue<ExecutiveState>;
        (annotation: import("@langchain/langgraph").SingleReducer<ExecutiveState, ExecutiveState>): import("@langchain/langgraph").BinaryOperatorAggregate<ExecutiveState, ExecutiveState>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    metadata: {
        (): import("@langchain/langgraph").LastValue<AgentMetadata>;
        (annotation: import("@langchain/langgraph").SingleReducer<AgentMetadata, AgentMetadata>): import("@langchain/langgraph").BinaryOperatorAggregate<AgentMetadata, AgentMetadata>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    antiIdleSystem: {
        (): import("@langchain/langgraph").LastValue<AntiIdleSystem>;
        (annotation: import("@langchain/langgraph").SingleReducer<AntiIdleSystem, AntiIdleSystem>): import("@langchain/langgraph").BinaryOperatorAggregate<AntiIdleSystem, AntiIdleSystem>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
    multiAgentCoordinator: {
        (): import("@langchain/langgraph").LastValue<any>;
        (annotation: import("@langchain/langgraph").SingleReducer<any, any>): import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
        Root: <S extends import("@langchain/langgraph").StateDefinition>(sd: S) => import("@langchain/langgraph").AnnotationRoot<S>;
    };
}>;
//# sourceMappingURL=interfaces.d.ts.map