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
export interface Inventory {
    items: InventoryItem[];
    slots: number;
    usedSlots: number;
    find?(predicate: (item: InventoryItem) => boolean): InventoryItem | undefined;
    length?: number;
}
export interface InventoryItem {
    name: string;
    count: number;
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
export interface Equipment {
    helmet?: InventoryItem;
    chestplate?: InventoryItem;
    leggings?: InventoryItem;
    boots?: InventoryItem;
    weapon?: InventoryItem;
    tool?: InventoryItem;
}
export interface WorldContext {
    position: Position;
    health: number;
    food: number;
    dimension: string;
    time: number;
    inventory: Inventory;
    nearbyEntities: Entity[];
    nearbyBlocks: Block[];
    environmentalFactors: any;
    lastMessage?: MessageInfo;
    weather?: string;
    timeOfDay?: number;
    equipment?: Equipment;
}
export interface MessageInfo {
    source: string;
    message: string;
    timestamp: number;
    type: string;
    priority: number;
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
    };
    progress: {
        current: number;
        target: number;
        percentage: number;
        completedSteps?: number;
    };
    deadline?: string;
    memberIds?: string[];
    isAntiIdle?: boolean;
}
export interface ResourceRequirement {
    type: string;
    amount: number;
    priority: number;
}
export interface SemanticConcept {
    id: string;
    name: string;
    type?: string;
    category: string;
    properties: Map<string, any>;
    relationships: string[];
    importance: number;
    lastAccessed: number;
    activation?: number;
    attributes?: any;
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
    results: any[];
    confidence: number;
    processingTime: number;
    query: MemoryQuery;
    semantic?: any[];
    episodic?: any[];
    procedural?: any[];
    working?: any[];
}
export interface MemoryStatistics {
    totalEpisodicEvents: number;
    totalSemanticConcepts: number;
    totalProceduralSkills: number;
    workingMemoryUtilization: number;
    consolidationQueue: number;
    lastCleanup: number;
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
    goalId: string;
    description: string;
    priority: number;
    status: 'pending' | 'active' | 'completed' | 'failed';
    steps: PlanStep[];
    estimatedDuration: number;
    resourceAllocation: ResourceAllocation;
    blockingFactors: BlockingFactor[];
    createdAt: number;
    updatedAt: number;
    type?: string;
    deadline?: string;
    dependencies?: string[];
    requiredResources?: ResourceRequirement[];
    resourceRequirements?: ResourceRequirement[];
}
export interface PlanStep {
    id: string;
    type: string;
    description: string;
    estimatedDuration: number;
    resourceRequirements: ResourceRequirement[];
    dependencies: string[];
    status: 'pending' | 'active' | 'completed' | 'failed';
    requiredSkills?: string[];
    requiredResources?: ResourceRequirement[];
}
export interface ResourceAllocation {
    items: Map<string, number>;
    tools: Map<string, number>;
    time: number;
    skills: SkillRequirement[];
    assistance: Map<string, number>;
}
export interface SkillRequirement {
    type: string;
    minimumLevel: number;
    importance: number;
}
export interface BlockingFactor {
    type: string;
    description: string;
    severity: number;
    mitigation?: string;
}
export interface FeasibilityAnalysisResult {
    feasibilityScore: number;
    feasibilityLevel: FeasibilityLevel;
    riskLevel: RiskLevel;
    riskAnalysis: RiskAnalysis;
    resourceAssessment: ResourceAssessment;
    timeEstimate: TimeEstimate;
    costEstimate: CostEstimate;
    alternativePlans: AlternativePlan[];
    confidence: number;
    analysisTime?: number;
    planId?: string;
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
export declare enum RiskLevel {
    EXTREME = "extreme",
    HIGH = "high",
    MODERATE = "moderate",
    LOW = "low",
    MINIMAL = "minimal",
    CRITICAL = "critical",
    MEDIUM = "medium"
}
export interface RiskAnalysis {
    overallRisk: number;
    riskFactors: RiskFactor[];
    mitigationStrategies: MitigationStrategy[];
    residualRisk: number;
}
export interface RiskFactor {
    type: string;
    description: string;
    probability: number;
    impact: number;
    severity: number;
}
export interface MitigationStrategy {
    riskId: string;
    strategy: string;
    effectiveness: number;
    cost: number;
}
export interface ResourceAssessment {
    availableResources: Map<string, number>;
    requiredResources: Map<string, number>;
    deficitResources: Map<string, number>;
    totalValue: number;
    accessibility: number;
}
export interface TimeEstimate {
    minimumTime: number;
    maximumTime: number;
    expectedTime: number;
    confidence: number;
    factors: string[];
}
export interface CostEstimate {
    resourceCost: number;
    timeCost: number;
    opportunityCost: number;
    totalCost: number;
    currency: string;
}
export interface AlternativePlan {
    id: string;
    description: string;
    feasibilityScore: number;
    riskLevel: RiskLevel;
    costDifference: number;
    timeDifference: number;
    advantages: string[];
    disadvantages: string[];
}
export interface FeasibilityResult {
    result: FeasibilityAnalysisResult;
    processingTime: number;
    confidence: number;
    recommendations: string[];
    planId?: string;
}
export interface FeasibilityFactor {
    name: string;
    weight: number;
    value: number;
    impact: number;
    factor?: string;
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
        skills: Map<string, Skill>;
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
    proficiency: number;
    usageCount: number;
    lastUsed: number;
    type: string;
    name: string;
    id: string;
    sequence: ProceduralStep[];
    conditions: any[];
    outcomes: any[];
    adaptations: ProceduralAdaptation[];
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
    task: any;
    deadline: number;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'failed';
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
}
export interface GoalProgress {
    current: number;
    target: number;
    percentage: number;
    completedSteps?: number;
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