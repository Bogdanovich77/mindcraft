/**
 * TypeScript interfaces for Multi-Agent Coordination System
 *
 * This file defines all types and interfaces for agent-to-agent communication,
 * collaborative planning, conflict resolution, and coordination management.
 */
export interface CoordinationState {
    agentId: string;
    communication: CommunicationState;
    collaboration: CollaborationState;
    conflicts: ConflictState;
    performance: CoordinationPerformance;
    lastUpdate: number;
}
export interface CommunicationState {
    activeChannels: Map<string, CommunicationChannel>;
    messageQueue: QueuedMessage[];
    sentMessages: SentMessage[];
    receivedMessages: ReceivedMessage[];
    broadcasting: BroadcastState;
    metrics: CommunicationMetrics;
}
export interface CollaborationState {
    activeCollaborations: Map<string, Collaboration>;
    collaborationHistory: CollaborationRecord[];
    sharedResources: SharedResourceManager;
    taskDelegation: TaskDelegationManager;
    teamFormation: TeamFormationManager;
}
export interface ConflictState {
    activeConflicts: Map<string, Conflict>;
    conflictHistory: ConflictRecord[];
    negotiationHistory: NegotiationRecord[];
    mediationHistory: MediationRecord[];
    resolutionStrategies: ResolutionStrategy[];
}
export interface CommunicationChannel {
    id: string;
    name: string;
    type: ChannelType;
    participants: string[];
    permissions: ChannelPermissions;
    priority: MessagePriority;
    state: ChannelState;
    metadata: ChannelMetadata;
}
export declare enum ChannelType {
    DIRECT = "direct",
    BROADCAST = "broadcast",
    MULTICAST = "multicast",
    TEAM = "team",
    EMERGENCY = "emergency"
}
export declare enum ChannelState {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MUTED = "muted",
    ENCRYPTED = "encrypted"
}
export interface ChannelPermissions {
    canRead: string[];
    canWrite: string[];
    canAdmin: string[];
    requireAuthentication: boolean;
    encryptionLevel: number;
}
export interface ChannelMetadata {
    createdAt: number;
    createdBy: string;
    description: string;
    maxParticipants: number;
    persistenceDuration: number;
    tags: string[];
}
export interface QueuedMessage {
    id: string;
    type: MessageType;
    priority: MessagePriority;
    sender: string;
    recipient?: string;
    recipients?: string[];
    channel?: string;
    payload: MessagePayload;
    timestamp: number;
    retryCount: number;
    maxRetries: number;
}
export interface SentMessage {
    id: string;
    type: MessageType;
    priority: MessagePriority;
    recipient: string;
    recipients?: string[];
    channel?: string;
    payload: MessagePayload;
    timestamp: number;
    deliveryStatus: MessageDeliveryStatus;
    deliveryTime?: number;
    responseReceived?: boolean;
}
export interface ReceivedMessage {
    id: string;
    type: MessageType;
    priority: MessagePriority;
    sender: string;
    channel?: string;
    payload: MessagePayload;
    timestamp: number;
    readStatus: ReadStatus;
    processed: boolean;
    responseSent?: boolean;
}
export declare enum MessageType {
    COORDINATION_REQUEST = "coordination_request",
    COORDINATION_RESPONSE = "coordination_response",
    TASK_DELEGATION = "task_delegation",
    TASK_ACCEPTANCE = "task_acceptance",
    TASK_COMPLETION = "task_completion",
    RESOURCE_SHARING = "resource_sharing",
    RESOURCE_REQUEST = "resource_request",
    CONFLICT_NOTIFICATION = "conflict_notification",
    NEGOTIATION_PROPOSAL = "negotiation_proposal",
    NEGOTIATION_RESPONSE = "negotiation_response",
    TEAM_INVITATION = "team_invitation",
    TEAM_JOIN = "team_join",
    TEAM_LEAVE = "team_leave",
    EMERGENCY_ALERT = "emergency_alert",
    STATUS_UPDATE = "status_update",
    SOCIAL_INTERACTION = "social_interaction"
}
export declare enum MessagePriority {
    CRITICAL = 0,// Emergency situations, immediate processing
    HIGH = 1,// Important coordination requests
    MEDIUM = 2,// Regular communication
    LOW = 3,// Informational messages
    BACKGROUND = 4
}
export interface MessagePayload {
    content: any;
    context?: MessageContext;
    metadata?: MessageMetadata;
    encryption?: MessageEncryption;
}
export interface MessageContext {
    situation: string;
    urgency: number;
    relevance: number;
    expectedResponse: string;
    timeout: number;
}
export interface MessageMetadata {
    messageId: string;
    threadId?: string;
    replyTo?: string;
    tags: string[];
    category: string;
    sourceSystem: string;
}
export interface MessageEncryption {
    enabled: boolean;
    algorithm: string;
    keyId: string;
    signature?: string;
}
export declare enum MessageDeliveryStatus {
    PENDING = "pending",
    SENT = "sent",
    DELIVERED = "delivered",
    FAILED = "failed",
    TIMEOUT = "timeout",
    REJECTED = "rejected"
}
export declare enum ReadStatus {
    UNREAD = "unread",
    READ = "read",
    PROCESSED = "processed",
    ARCHIVED = "archived"
}
export interface BroadcastState {
    activeBroadcasts: Map<string, Broadcast>;
    broadcastHistory: BroadcastRecord[];
    subscriptionManager: SubscriptionManager;
    frequencyControl: FrequencyControl;
}
export interface Broadcast {
    id: string;
    broadcasterId: string;
    type: BroadcastType;
    content: MessagePayload;
    targetAudience: BroadcastAudience;
    frequency: BroadcastFrequency;
    duration: number;
    startTime: number;
    endTime?: number;
    status: BroadcastStatus;
}
export declare enum BroadcastType {
    ANNOUNCEMENT = "announcement",
    ALERT = "alert",
    STATUS = "status",
    INVITATION = "invitation",
    RESOURCE_OFFER = "resource_offer",
    TASK_BROADCAST = "task_broadcast"
}
export declare enum BroadcastAudience {
    ALL = "all",
    TEAM = "team",
    NEARBY = "nearby",
    ROLE_BASED = "role_based",
    RELATIONSHIP_BASED = "relationship_based"
}
export declare enum BroadcastFrequency {
    ONCE = "once",
    RECURRING = "recurring",
    CONDITIONAL = "conditional"
}
export declare enum BroadcastStatus {
    SCHEDULED = "scheduled",
    ACTIVE = "active",
    PAUSED = "paused",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export interface BroadcastRecord {
    broadcastId: string;
    timestamp: number;
    audience: string;
    reach: number;
    responses: number;
    effectiveness: number;
}
export interface SubscriptionManager {
    subscriptions: Map<string, Subscription>;
    filters: MessageFilter[];
    preferences: SubscriptionPreferences;
}
export interface Subscription {
    id: string;
    subscriberId: string;
    broadcasterId?: string;
    channel?: string;
    messageType: MessageType[];
    filters: MessageFilter[];
    active: boolean;
    createdAt: number;
}
export interface MessageFilter {
    field: string;
    operator: FilterOperator;
    value: any;
    weight: number;
}
export declare enum FilterOperator {
    EQUALS = "equals",
    NOT_EQUALS = "not_equals",
    CONTAINS = "contains",
    NOT_CONTAINS = "not_contains",
    GREATER_THAN = "greater_than",
    LESS_THAN = "less_than",
    REGEX = "regex"
}
export interface SubscriptionPreferences {
    maxMessagesPerMinute: number;
    priorityThreshold: MessagePriority;
    allowInterruptions: boolean;
    digestMode: boolean;
    quietHours: {
        start: number;
        end: number;
    }[];
}
export interface FrequencyControl {
    messageLimits: Map<string, MessageLimit>;
    rateLimiting: RateLimiting;
    spamProtection: SpamProtection;
}
export interface MessageLimit {
    messageType: MessageType;
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
    currentCount: number;
    resetTime: number;
}
export interface RateLimiting {
    enabled: boolean;
    penaltyMultiplier: number;
    recoveryRate: number;
    violationHistory: RateViolation[];
    messageLimits: Map<string, MessageLimit>;
}
export interface RateViolation {
    timestamp: number;
    violationType: string;
    penalty: number;
    duration: number;
}
export interface SpamProtection {
    enabled: boolean;
    duplicateDetection: boolean;
    contentAnalysis: boolean;
    blacklist: string[];
    whitelist: string[];
}
export interface CommunicationMetrics {
    messagesSent: number;
    messagesReceived: number;
    averageDeliveryTime: number;
    successRate: number;
    responseRate: number;
    priorityDistribution: Record<MessagePriority, number>;
    channelUtilization: Map<string, number>;
    performanceScore: number;
}
export interface Collaboration {
    id: string;
    name: string;
    type: CollaborationType;
    participants: CollaborationParticipant[];
    goals: CollaborativeGoal[];
    resources: SharedResource[];
    status: CollaborationState;
    governance: CollaborationGovernance;
    communication: CollaborationCommunication;
    createdAt: number;
    updatedAt: number;
}
export declare enum CollaborationType {
    TASK_FORCE = "task_force",
    PROJECT_TEAM = "project_team",
    ALLIANCE = "alliance",
    PARTNERSHIP = "partnership",
    TEMPORARY_COALITION = "temporary_coalition",
    EMERGENCY_RESPONSE = "emergency_response"
}
export interface CollaborationParticipant {
    agentId: string;
    role: ParticipantRole;
    permissions: ParticipantPermissions;
    contribution: ParticipantContribution;
    reputation: number;
    joinedAt: number;
    status: ParticipantStatus;
}
export declare enum ParticipantRole {
    LEADER = "leader",
    COORDINATOR = "coordinator",
    CONTRIBUTOR = "contributor",
    OBSERVER = "observer",
    SPECIALIST = "specialist",
    LIAISON = "liaison"
}
export interface ParticipantPermissions {
    canInvite: boolean;
    canKick: boolean;
    canSetGoals: boolean;
    canAllocateResources: boolean;
    canCommunicate: boolean;
    canVote: boolean;
    adminLevel: number;
}
export interface ParticipantContribution {
    tasksCompleted: number;
    resourcesProvided: number;
    timeContributed: number;
    qualityScore: number;
    innovationScore: number;
    lastUpdate: number;
}
export declare enum ParticipantStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    LEFT = "left",
    BANNED = "banned"
}
export interface CollaborativeGoal {
    id: string;
    parentGoalId?: string;
    title: string;
    description: string;
    objectives: string[];
    requirements: CollaborativeRequirement[];
    assignments: TaskAssignment[];
    status: CollaborativeGoalStatus;
    progress: CollaborativeProgress;
    priority: number;
    deadline?: number;
    createdAt: number;
}
export declare enum CollaborativeGoalStatus {
    PROPOSED = "proposed",
    APPROVED = "approved",
    ACTIVE = "active",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export interface CollaborativeRequirement {
    type: RequirementType;
    description: string;
    quantity: number;
    allocatedTo?: string;
    fulfilled: boolean;
    priority: number;
}
export declare enum RequirementType {
    LABOR = "labor",
    SKILL = "skill",
    RESOURCE = "resource",
    TIME = "time",
    EQUIPMENT = "equipment",
    LOCATION = "location"
}
export interface TaskAssignment {
    id: string;
    goalId: string;
    assignedTo: string;
    assignedBy: string;
    task: string;
    requirements: CollaborativeRequirement[];
    status: AssignmentStatus;
    progress: AssignmentProgress;
    deadline?: number;
    createdAt: number;
    completedAt?: number;
}
export declare enum AssignmentStatus {
    PROPOSED = "proposed",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export interface AssignmentProgress {
    percentage: number;
    completedSteps: string[];
    currentStep?: string;
    blockers: string[];
    estimatedTimeRemaining?: number;
    lastUpdate: number;
}
export interface CollaborativeProgress {
    overall: number;
    byParticipant: Map<string, number>;
    byRequirement: Map<string, number>;
    milestones: Milestone[];
    lastUpdate: number;
}
export interface Milestone {
    id: string;
    name: string;
    description: string;
    criteria: string[];
    completed: boolean;
    completedAt?: number;
    assignedTo?: string;
}
export interface SharedResource {
    id: string;
    type: ResourceType;
    name: string;
    quantity: number;
    available: number;
    allocated: number;
    location?: {
        x: number;
        y: number;
        z: number;
    };
    owner?: string;
    sharingPolicy: SharingPolicy;
    accessLog: ResourceAccess[];
    lastUpdate: number;
}
export declare enum ResourceType {
    ITEM = "item",
    TOOL = "tool",
    EQUIPMENT = "equipment",
    LOCATION = "location",
    INFORMATION = "information",
    SKILL = "skill",
    TIME = "time"
}
export interface SharingPolicy {
    type: PolicyType;
    restrictions: PolicyRestriction[];
    permissions: PolicyPermission[];
    priority: number;
    duration?: number;
}
export declare enum PolicyType {
    OPEN = "open",
    RESTRICTED = "restricted",
    EXCLUSIVE = "exclusive",
    CONDITIONAL = "conditional"
}
export interface PolicyRestriction {
    type: string;
    condition: any;
    severity: number;
}
export interface PolicyPermission {
    type: string;
    condition: any;
    scope: string;
}
export interface ResourceAccess {
    agentId: string;
    timestamp: number;
    action: AccessAction;
    quantity: number;
    purpose: string;
    approved: boolean;
    duration: number;
}
export declare enum AccessAction {
    REQUESTED = "requested",
    GRANTED = "granted",
    USED = "used",
    RETURNED = "returned",
    DENIED = "denied"
}
export interface CollaborationGovernance {
    decisionMaking: DecisionMakingProcess;
    votingSystem: VotingSystem;
    conflictResolution: ConflictResolutionStrategy;
    leadershipStructure: LeadershipStructure;
    communicationProtocols: CommunicationProtocol[];
}
export declare enum DecisionMakingProcess {
    CONSENSUS = "consensus",
    MAJORITY_VOTE = "majority_vote",
    LEADER_DECIDES = "leader_decides",
    DELEGATED = "delegated",
    HIERARCHICAL = "hierarchical"
}
export interface VotingSystem {
    type: VotingType;
    weighting: VoteWeighting;
    quorum: QuorumRequirement;
    timeout: number;
    tieBreaking: TieBreakingMethod;
}
export declare enum VotingType {
    SIMPLE = "simple",
    WEIGHTED = "weighted",
    APPROVAL = "approval",
    RANKED_CHOICE = "ranked_choice"
}
export interface VoteWeighting {
    byRole: Map<ParticipantRole, number>;
    byContribution: Map<string, number>;
    byReputation: Map<string, number>;
}
export interface QuorumRequirement {
    minimumParticipants: number;
    minimumRoles: ParticipantRole[];
    minimumReputation: number;
}
export declare enum TieBreakingMethod {
    LEADER_DECIDES = "leader_decides",
    SENIORITY_WINS = "seniority_wins",
    RANDOM = "random",
    CONTINUE_DEBATE = "continue_debate"
}
export interface ConflictResolutionStrategy {
    type: StrategyType;
    parameters: StrategyParameters;
    escalationPath: EscalationPath;
    timeout: number;
}
export declare enum StrategyType {
    NEGOTIATION = "negotiation",
    MEDIATION = "mediation",
    ARBITRATION = "arbitration",
    VOTING = "voting",
    COMPETITION = "competition",
    AVOIDANCE = "avoidance"
}
export interface StrategyParameters {
    aggressiveness: number;
    compromiseLevel: number;
    timeLimit: number;
    resourceLimit: number;
    relationshipWeight: number;
}
export interface EscalationPath {
    steps: EscalationStep[];
    finalArbiter?: string;
}
export interface EscalationStep {
    strategy: StrategyType;
    trigger: string;
    timeout: number;
    participants: string[];
}
export interface CollaborationCommunication {
    channels: Map<string, CommunicationChannel>;
    protocols: CommunicationProtocol[];
    meetingSchedule: MeetingSchedule[];
    informationSharing: InformationSharingPolicy;
}
export interface CommunicationProtocol {
    name: string;
    purpose: string;
    participants: string[];
    rules: CommunicationRule[];
    frequency: string;
    medium: CommunicationMedium;
}
export interface CommunicationRule {
    type: RuleType;
    condition: any;
    action: any;
    priority: number;
}
export declare enum RuleType {
    RESPONSE_TIME = "response_time",
    MESSAGE_FORMAT = "message_format",
    TOPIC_RESTRICTION = "topic_restriction",
    CONFLICT_RESOLUTION = "conflict_resolution"
}
export declare enum CommunicationMedium {
    TEXT = "text",
    VOICE = "voice",
    VIDEO = "video",
    SHARED_WORKSPACE = "shared_workspace"
}
export interface MeetingSchedule {
    meetings: ScheduledMeeting[];
    recurringPattern: RecurringPattern;
    attendancePolicy: AttendancePolicy;
}
export interface ScheduledMeeting {
    id: string;
    title: string;
    purpose: string;
    participants: string[];
    startTime: number;
    duration: number;
    agenda: string[];
    mandatory: boolean;
}
export interface RecurringPattern {
    frequency: string;
    pattern: string;
    exceptions: Date[];
}
export interface AttendancePolicy {
    required: boolean;
    minimumAttendance: number;
    penaltySystem: PenaltySystem;
}
export interface PenaltySystem {
    type: PenaltyType;
    parameters: PenaltyParameters;
    enforcement: EnforcementLevel;
}
export declare enum PenaltyType {
    WARNING = "warning",
    REPUTATION = "reputation",
    RESOURCE = "resource",
    EXCLUSION = "exclusion"
}
export interface PenaltyParameters {
    thresholds: number[];
    penalties: number[];
    duration: number;
}
export declare enum EnforcementLevel {
    WARNING = "warning",
    STRICT = "strict",
    AUTOMATIC = "automatic"
}
export interface InformationSharingPolicy {
    scope: SharingScope;
    restrictions: SharingRestriction[];
    obligations: SharingObligation[];
    confidentiality: ConfidentialityLevel;
}
export declare enum SharingScope {
    FULL = "full",
    NEED_TO_KNOW = "need_to_know",
    ROLE_BASED = "role_based",
    TASK_SPECIFIC = "task_specific"
}
export interface SharingRestriction {
    type: string;
    condition: any;
    penalty: string;
}
export interface SharingObligation {
    type: string;
    condition: any;
    requirement: string;
}
export declare enum ConfidentialityLevel {
    PUBLIC = "public",
    INTERNAL = "internal",
    CONFIDENTIAL = "confidential",
    SECRET = "secret"
}
export interface SharedResourceManager {
    resources: Map<string, SharedResource>;
    requests: ResourceRequest[];
    allocations: ResourceAllocation[];
    policies: Map<string, SharingPolicy>;
    utilization: ResourceUtilization;
}
export interface ResourceRequest {
    id: string;
    requesterId: string;
    resourceId: string;
    quantity: number;
    purpose: string;
    duration: number;
    priority: number;
    status: RequestStatus;
    createdAt: number;
    responseDeadline?: number;
}
export declare enum RequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    FULFILLED = "fulfilled",
    EXPIRED = "expired",
    CANCELLED = "cancelled"
}
export interface ResourceAllocation {
    id: string;
    resourceId: string;
    allocatedTo: string;
    allocatedBy: string;
    quantity: number;
    duration: number;
    purpose: string;
    conditions: AllocationCondition[];
    status: AllocationStatus;
    createdAt: number;
    expiresAt?: number;
}
export declare enum AllocationStatus {
    ACTIVE = "active",
    COMPLETED = "completed",
    RETURNED = "returned",
    OVERDUE = "overdue",
    REVOKED = "revoked"
}
export interface AllocationCondition {
    type: string;
    condition: any;
    penalty: string;
}
export interface ResourceUtilization {
    totalResources: number;
    utilizedResources: number;
    utilizationRate: number;
    byType: Map<ResourceType, number>;
    byAgent: Map<string, number>;
    efficiency: number;
    lastUpdate: number;
}
export interface TaskDelegationManager {
    delegations: Map<string, TaskDelegation>;
    delegationHistory: DelegationRecord[];
    capabilities: CapabilityRegistry;
    workloadBalancer: WorkloadBalancer;
}
export interface TaskDelegation {
    id: string;
    delegatorId: string;
    delegateeId: string;
    task: DelegatedTask;
    conditions: DelegationCondition[];
    status: DelegationStatus;
    progress: DelegationProgress;
    createdAt: number;
    deadline?: number;
}
export interface DelegatedTask {
    id: string;
    title: string;
    description: string;
    requirements: TaskRequirement[];
    priority: number;
    estimatedDuration: number;
    context: TaskContext;
    deliverables: Deliverable[];
}
export interface TaskRequirement {
    type: RequirementType;
    description: string;
    quantity: number;
    quality: number;
    alternatives: string[];
}
export interface TaskContext {
    environment: string;
    urgency: number;
    dependencies: string[];
    constraints: TaskConstraint[];
}
export interface TaskConstraint {
    type: string;
    description: string;
    impact: number;
}
export interface Deliverable {
    id: string;
    name: string;
    description: string;
    quality: QualityStandard;
    format: string;
    deadline?: number;
}
export interface QualityStandard {
    criteria: string[];
    metrics: QualityMetric[];
    acceptanceThreshold: number;
}
export interface QualityMetric {
    name: string;
    weight: number;
    measurement: string;
    target: number;
}
export interface DelegationCondition {
    type: string;
    condition: any;
    consequence: string;
}
export declare enum DelegationStatus {
    PROPOSED = "proposed",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export interface DelegationProgress {
    percentage: number;
    completedRequirements: string[];
    currentRequirement?: string;
    blockers: string[];
    estimatedTimeRemaining?: number;
    lastUpdate: number;
}
export interface CapabilityRegistry {
    capabilities: Map<string, AgentCapability>;
    skillMatrix: SkillMatrix;
    availabilityMap: Map<string, Availability>;
}
export interface AgentCapability {
    agentId: string;
    skills: SkillCapability[];
    resources: ResourceCapability[];
    availability: Availability;
    reputation: number;
    lastUpdate: number;
}
export interface SkillCapability {
    skillType: string;
    level: number;
    experience: number;
    specialization: string[];
    certifications: string[];
}
export interface ResourceCapability {
    resourceType: ResourceType;
    quantity: number;
    quality: number;
    location?: {
        x: number;
        y: number;
        z: number;
    };
    accessibility: AccessibilityLevel;
}
export declare enum AccessibilityLevel {
    PUBLIC = "public",
    SHARED = "shared",
    RESTRICTED = "restricted",
    PRIVATE = "private"
}
export interface Availability {
    available: boolean;
    currentTime: number;
    nextAvailable?: number;
    workload: WorkloadInfo;
    commitments: Commitment[];
}
export interface WorkloadInfo {
    currentTasks: number;
    capacity: number;
    utilizationRate: number;
    stressLevel: number;
    estimatedFreeTime: number;
}
export interface Commitment {
    type: string;
    description: string;
    startTime: number;
    endTime: number;
    priority: number;
}
export interface SkillMatrix {
    skills: Map<string, SkillInfo[]>;
    synergies: SkillSynergy[];
    learningRates: Map<string, number>;
}
export interface SkillInfo {
    agentId: string;
    skillType: string;
    proficiency: number;
    experience: number;
    lastUsed: number;
    improvementRate: number;
}
export interface SkillSynergy {
    skill1: string;
    skill2: string;
    synergyType: SynergyType;
    strength: number;
    context: string;
}
export declare enum SynergyType {
    COMPLEMENTARY = "complementary",
    ENHANCING = "enhancing",
    SUBSTITUTABLE = "substitutable"
}
export interface WorkloadBalancer {
    algorithm: BalancingAlgorithm;
    capacityThresholds: CapacityThreshold[];
    redistributionPolicy: RedistributionPolicy;
    performanceMetrics: BalancingMetrics;
}
export declare enum BalancingAlgorithm {
    ROUND_ROBIN = "round_robin",
    CAPABILITY_BASED = "capability_based",
    WORKLOAD_BASED = "workload_based",
    PRIORITY_BASED = "priority_based",
    MACHINE_LEARNING = "machine_learning"
}
export interface CapacityThreshold {
    metric: string;
    threshold: number;
    action: ThresholdAction;
}
export declare enum ThresholdAction {
    ALERT = "alert",
    REDISTRIBUTE = "redistribute",
    SCALE_UP = "scale_up",
    SCALE_DOWN = "scale_down"
}
export interface RedistributionPolicy {
    triggers: RedistributionTrigger[];
    method: RedistributionMethod;
    constraints: RedistributionConstraint[];
}
export interface RedistributionTrigger {
    type: string;
    condition: any;
    threshold: number;
}
export interface RedistributionMethod {
    algorithm: string;
    parameters: any;
    fairnessCriteria: string[];
}
export interface RedistributionConstraint {
    type: string;
    condition: any;
    penalty: string;
}
export interface BalancingMetrics {
    efficiency: number;
    fairness: number;
    responseTime: number;
    throughput: number;
    lastUpdate: number;
}
export interface TeamFormationManager {
    teams: Map<string, Team>;
    formationHistory: TeamFormationRecord[];
    optimizationStrategies: TeamOptimizationStrategy[];
    performanceMetrics: TeamMetrics;
}
export interface Team {
    id: string;
    name: string;
    type: TeamType;
    members: TeamMember[];
    structure: TeamStructure;
    objectives: TeamObjective[];
    resources: TeamResource[];
    communication: TeamCommunication;
    performance: TeamPerformance;
    createdAt: number;
    lastUpdate: number;
}
export declare enum TeamType {
    TASK_FORCE = "task_force",
    PROJECT_TEAM = "project_team",
    DEPARTMENT = "department",
    SQUAD = "squad",
    COMMITTEE = "committee",
    ALLIANCE = "alliance"
}
export interface TeamMember {
    agentId: string;
    role: TeamRole;
    permissions: TeamPermissions;
    contribution: TeamContribution;
    reputation: number;
    joinedAt: number;
    status: MemberStatus;
}
export declare enum TeamRole {
    LEADER = "leader",
    COORDINATOR = "coordinator",
    SPECIALIST = "specialist",
    CONTRIBUTOR = "contributor",
    LIAISON = "liaison",
    OBSERVER = "observer"
}
export interface TeamPermissions {
    canInvite: boolean;
    canKick: boolean;
    canSetObjectives: boolean;
    canAllocateResources: boolean;
    canCommunicate: boolean;
    canVote: boolean;
    adminLevel: number;
}
export interface TeamContribution {
    tasksCompleted: number;
    objectivesAchieved: number;
    resourcesProvided: number;
    timeContributed: number;
    qualityScore: number;
    innovationScore: number;
    lastUpdate: number;
}
export declare enum MemberStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    LEFT = "left",
    BANNED = "banned"
}
export interface TeamStructure {
    hierarchy: HierarchyLevel[];
    reportingLines: ReportingLine[];
    decisionMaking: DecisionMakingStructure;
    communicationFlow: CommunicationFlow;
}
export interface HierarchyLevel {
    level: number;
    title: string;
    agents: string[];
    responsibilities: string[];
    authority: number;
}
export interface ReportingLine {
    supervisor: string;
    subordinates: string[];
    escalationPath: string[];
}
export interface DecisionMakingStructure {
    process: DecisionMakingProcess;
    votingRights: VotingRights;
    consensusRequirements: ConsensusRequirement;
}
export interface VotingRights {
    byRole: Map<TeamRole, boolean>;
    byContribution: Map<string, boolean>;
    byReputation: Map<string, boolean>;
}
export interface ConsensusRequirement {
    minimumParticipation: number;
    supermajorityThreshold: number;
    vetoPower: VetoPower[];
}
export interface VetoPower {
    role: TeamRole;
    conditions: string[];
    scope: string;
}
export interface CommunicationFlow {
    channels: Map<string, CommunicationChannel>;
    protocols: CommunicationProtocol[];
    informationFlow: InformationFlow[];
    escalationPaths: EscalationPath[];
}
export interface InformationFlow {
    from: string;
    to: string[];
    type: FlowType;
    frequency: string;
    priority: number;
}
export declare enum FlowType {
    TOP_DOWN = "top_down",
    BOTTOM_UP = "bottom_up",
    PEER_TO_PEER = "peer_to_peer",
    CROSS_FUNCTIONAL = "cross_functional"
}
export interface TeamObjective {
    id: string;
    title: string;
    description: string;
    priority: number;
    status: ObjectiveStatus;
    progress: ObjectiveProgress;
    assignedTo: string[];
    deadline?: number;
    createdAt: number;
}
export declare enum ObjectiveStatus {
    PROPOSED = "proposed",
    APPROVED = "approved",
    ACTIVE = "active",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export interface ObjectiveProgress {
    percentage: number;
    completedMilestones: string[];
    currentMilestone?: string;
    blockers: string[];
    estimatedTimeRemaining?: number;
    lastUpdate: number;
}
export interface TeamResource {
    id: string;
    type: ResourceType;
    name: string;
    quantity: number;
    allocated: number;
    available: number;
    location?: {
        x: number;
        y: number;
        z: number;
    };
    manager: string;
    accessPolicy: AccessPolicy;
    utilization: ResourceUtilization;
}
export interface AccessPolicy {
    type: PolicyType;
    restrictions: PolicyRestriction[];
    permissions: PolicyPermission[];
    priority: number;
}
export interface TeamCommunication {
    channels: Map<string, CommunicationChannel>;
    protocols: CommunicationProtocol[];
    meetingSchedule: MeetingSchedule;
    informationSharing: InformationSharingPolicy;
}
export interface TeamPerformance {
    efficiency: number;
    effectiveness: number;
    cohesion: number;
    innovation: number;
    quality: number;
    speed: number;
    lastUpdate: number;
}
export interface TeamFormationRecord {
    teamId: string;
    formationType: TeamType;
    members: string[];
    purpose: string;
    success: boolean;
    duration: number;
    outcome: string;
    timestamp: number;
}
export interface TeamOptimizationStrategy {
    name: string;
    algorithm: string;
    parameters: any;
    effectiveness: number;
    lastUsed: number;
}
export interface TeamMetrics {
    totalTeams: number;
    averageTeamSize: number;
    formationSuccessRate: number;
    objectiveCompletionRate: number;
    memberSatisfaction: number;
    communicationEfficiency: number;
    lastUpdate: number;
}
export interface CollaborationRecord {
    collaborationId: string;
    participants: string[];
    type: CollaborationType;
    objectives: string[];
    outcome: CollaborationOutcome;
    duration: number;
    effectiveness: number;
    lessons: string[];
    timestamp: number;
}
export declare enum CollaborationOutcome {
    SUCCESS = "success",
    PARTIAL_SUCCESS = "partial_success",
    FAILURE = "failure",
    CANCELLED = "cancelled",
    TIMEOUT = "timeout"
}
export interface Conflict {
    id: string;
    type: ConflictType;
    parties: ConflictParty[];
    subject: ConflictSubject;
    context: ConflictContext;
    status: ConflictStatus;
    resolution?: ConflictResolution;
    createdAt: number;
    updatedAt: number;
}
export declare enum ConflictType {
    RESOURCE = "resource",
    GOAL = "goal",
    PRIORITY = "priority",
    COMMUNICATION = "communication",
    AUTHORITY = "authority",
    VALUES = "values",
    STRATEGY = "strategy"
}
export interface ConflictParty {
    agentId: string;
    position: ConflictPosition;
    interests: ConflictInterest[];
    power: number;
    flexibility: number;
    relationshipHistory: RelationshipHistory;
}
export declare enum ConflictPosition {
    PROPOSING = "proposing",
    OPPOSING = "opposing",
    NEUTRAL = "neutral",
    MEDIATING = "mediating",
    OBSERVING = "observing"
}
export interface ConflictInterest {
    type: string;
    description: string;
    importance: number;
    negotiable: boolean;
    alternatives: string[];
}
export interface RelationshipHistory {
    previousInteractions: string[];
    trustLevel: number;
    conflictHistory: ConflictHistory[];
    collaborationHistory: CollaborationRecord[];
}
export interface ConflictHistory {
    conflicts: string[];
    outcomes: ConflictOutcome[];
    patterns: ConflictPattern[];
}
export declare enum ConflictOutcome {
    WIN = "win",
    LOSE = "lose",
    COMPROMISE = "compromise",
    MEDIATION = "mediation",
    AVOIDANCE = "avoidance"
}
export interface ConflictPattern {
    type: string;
    frequency: number;
    triggers: string[];
    resolutions: string[];
    effectiveness: number;
}
export interface ConflictSubject {
    description: string;
    specifics: ConflictSpecific[];
    urgency: number;
    impact: number;
    scope: ConflictScope;
}
export interface ConflictSpecific {
    aspect: string;
    details: any;
    quantifiable: boolean;
    measurement?: string;
}
export declare enum ConflictScope {
    INDIVIDUAL = "individual",
    TEAM = "team",
    ORGANIZATIONAL = "organizational",
    SYSTEM_WIDE = "system_wide"
}
export interface ConflictContext {
    environment: string;
    stakeholders: string[];
    constraints: ConflictConstraint[];
    opportunities: ConflictOpportunity[];
    timeConstraints: TimeConstraint[];
    resourceConstraints: ResourceConstraint[];
}
export interface ConflictConstraint {
    type: string;
    description: string;
    severity: number;
    flexibility: number;
}
export interface ConflictOpportunity {
    type: string;
    description: string;
    potential: number;
    requirements: string[];
}
export interface TimeConstraint {
    deadline: number;
    flexibility: number;
    penalties: string[];
}
export interface ResourceConstraint {
    resource: string;
    quantity: number;
    availability: number;
    alternatives: string[];
}
export declare enum ConflictStatus {
    PENDING = "pending",
    NEGOTIATING = "negotiating",
    MEDIATING = "mediating",
    RESOLVED = "resolved",
    ESCALATED = "escalated",
    ABANDONED = "abandoned"
}
export interface ConflictResolution {
    method: ResolutionMethod;
    outcome: ResolutionOutcome;
    agreement: ResolutionAgreement;
    implementation: ResolutionImplementation;
    satisfaction: SatisfactionLevel[];
    timestamp: number;
}
export declare enum ResolutionMethod {
    NEGOTIATION = "negotiation",
    MEDIATION = "mediation",
    ARBITRATION = "arbitration",
    VOTING = "voting",
    COMPETITION = "competition",
    AVOIDANCE = "avoidance",
    HIERARCHICAL = "hierarchical"
}
export interface ResolutionOutcome {
    type: ConflictOutcome;
    details: string;
    benefits: string[];
    costs: string[];
    risks: string[];
}
export interface ResolutionAgreement {
    terms: ResolutionTerm[];
    commitments: ResolutionCommitment[];
    contingencies: ResolutionContingency[];
    duration: number;
    reviewProcess: string;
}
export interface ResolutionTerm {
    aspect: string;
    condition: string;
    measurement: string;
    responsibility: string;
    deadline?: number;
}
export interface ResolutionCommitment {
    party: string;
    commitment: string;
    verification: string;
    consequences: string;
}
export interface ResolutionContingency {
    condition: string;
    trigger: string;
    response: string;
    probability: number;
}
export interface ResolutionImplementation {
    steps: ImplementationStep[];
    monitoring: MonitoringPlan;
    verification: VerificationPlan;
    timeline: ImplementationTimeline;
}
export interface ImplementationStep {
    id: string;
    description: string;
    responsible: string;
    deadline: number;
    dependencies: string[];
    status: StepStatus;
}
export declare enum StepStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export interface MonitoringPlan {
    metrics: MonitoringMetric[];
    frequency: string;
    responsible: string;
    reporting: ReportingPlan;
}
export interface MonitoringMetric {
    name: string;
    measurement: string;
    target: number;
    threshold: number;
}
export interface ReportingPlan {
    frequency: string;
    format: string;
    recipients: string[];
    escalation: EscalationPlan;
}
export interface EscalationPlan {
    triggers: EscalationTrigger[];
    procedure: string;
    timeline: number;
}
export interface EscalationTrigger {
    condition: string;
    threshold: number;
    response: string;
}
export interface VerificationPlan {
    methods: VerificationMethod[];
    timeline: number;
    responsible: string;
    criteria: VerificationCriteria[];
}
export interface VerificationCriteria {
    aspect: string;
    standard: string;
    measurement: string;
    validator: string;
}
export declare enum VerificationMethod {
    SELF_REPORTING = "self_reporting",
    PEER_REVIEW = "peer_review",
    THIRD_PARTY = "third_party",
    AUTOMATED = "automated"
}
export interface ImplementationTimeline {
    milestones: TimelineMilestone[];
    criticalPath: string[];
    buffers: TimelineBuffer[];
}
export interface TimelineMilestone {
    id: string;
    name: string;
    deadline: number;
    dependencies: string[];
    status: MilestoneStatus;
}
export declare enum MilestoneStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    OVERDUE = "overdue"
}
export interface TimelineBuffer {
    type: string;
    duration: number;
    purpose: string;
}
export interface SatisfactionLevel {
    party: string;
    level: number;
    aspects: SatisfactionAspect[];
    timestamp: number;
}
export interface SatisfactionAspect {
    criterion: string;
    score: number;
    weight: number;
    justification: string;
}
export interface ConflictRecord {
    conflictId: string;
    parties: string[];
    type: ConflictType;
    resolution: ResolutionMethod;
    outcome: ConflictOutcome;
    duration: number;
    satisfaction: number;
    lessons: string[];
    timestamp: number;
}
export interface NegotiationRecord {
    negotiationId: string;
    parties: string[];
    subject: string;
    positions: NegotiationPosition[];
    process: NegotiationProcess;
    outcome: NegotiationOutcome;
    duration: number;
    timestamp: number;
}
export interface NegotiationPosition {
    party: string;
    position: string;
    interests: string[];
    priorities: number[];
    flexibility: number;
    alternatives: string[];
}
export interface NegotiationProcess {
    rounds: NegotiationRound[];
    strategies: NegotiationStrategy[];
    communication: NegotiationCommunication;
    timeConstraints: NegotiationTimeConstraints;
}
export interface NegotiationRound {
    roundNumber: number;
    offers: NegotiationOffer[];
    responses: NegotiationResponse[];
    duration: number;
    outcome: RoundOutcome;
}
export interface NegotiationOffer {
    party: string;
    offer: string;
    value: number;
    justification: string;
    timestamp: number;
}
export interface NegotiationResponse {
    party: string;
    response: string;
    counterOffer?: string;
    reasoning: string;
    timestamp: number;
}
export declare enum RoundOutcome {
    AGREEMENT = "agreement",
    COUNTER_OFFER = "counter_offer",
    REJECTION = "rejection",
    TIMEOUT = "timeout",
    WALKAWAY = "walkaway"
}
export interface NegotiationStrategy {
    name: string;
    description: string;
    tactics: NegotiationTactic[];
    effectiveness: number;
    context: string;
}
export interface NegotiationTactic {
    name: string;
    description: string;
    triggers: string[];
    expectedOutcome: string;
    risks: string[];
}
export interface NegotiationCommunication {
    channels: string[];
    protocols: string[];
    transparency: number;
    documentation: CommunicationDocumentation;
}
export interface CommunicationDocumentation {
    meetingMinutes: string[];
    agreements: string[];
    commitments: string[];
    followUps: string[];
}
export interface NegotiationTimeConstraints {
    totalTime: number;
    perRound: number;
    responseTime: number;
    extensions: TimeExtension[];
}
export interface TimeExtension {
    condition: string;
    duration: number;
    approval: string;
}
export interface NegotiationOutcome {
    result: NegotiationResult;
    agreement?: NegotiationAgreement;
    satisfaction: number[];
    breakdownReason?: string;
    futureConsiderations: string[];
}
export declare enum NegotiationResult {
    AGREEMENT = "agreement",
    PARTIAL_AGREEMENT = "partial_agreement",
    NO_AGREEMENT = "no_agreement",
    BREAKDOWN = "breakdown",
    POSTPONED = "postponed"
}
export interface NegotiationAgreement {
    terms: NegotiationTerm[];
    commitments: NegotiationCommitment[];
    reviewDate?: number;
    expirationDate?: number;
}
export interface NegotiationTerm {
    aspect: string;
    condition: string;
    measurement: string;
    responsibility: string;
}
export interface NegotiationCommitment {
    party: string;
    commitment: string;
    verification: string;
    consequences: string;
}
export interface MediationRecord {
    mediationId: string;
    mediatorId: string;
    parties: string[];
    conflict: string;
    process: MediationProcess;
    outcome: MediationOutcome;
    duration: number;
    satisfaction: number[];
    timestamp: number;
}
export interface MediationProcess {
    sessions: MediationSession[];
    techniques: MediationTechnique[];
    communication: MediationCommunication;
    documentation: MediationDocumentation;
}
export interface MediationSession {
    sessionId: string;
    startTime: number;
    endTime: number;
    participants: string[];
    agenda: string[];
    outcomes: string[];
}
export interface MediationTechnique {
    name: string;
    description: string;
    application: string;
    effectiveness: number;
}
export interface MediationCommunication {
    groundRules: string[];
    confidentiality: ConfidentialityLevel;
    communicationChannels: string[];
    documentation: MediationDocumentation;
}
export interface MediationDocumentation {
    sessionNotes: string[];
    agreements: string[];
    actionItems: string[];
    followUps: string[];
}
export interface MediationOutcome {
    result: MediationResult;
    agreement?: MediationAgreement;
    satisfaction: number[];
    recommendations: string[];
    futureConsiderations: string[];
}
export declare enum MediationResult {
    AGREEMENT = "agreement",
    PARTIAL_AGREEMENT = "partial_agreement",
    NO_AGREEMENT = "no_agreement",
    REFERRED = "referred",
    TERMINATED = "terminated"
}
export interface MediationAgreement {
    terms: MediationTerm[];
    commitments: MediationCommitment[];
    reviewDate?: number;
    enforcement: EnforcementMechanism;
}
export interface MediationTerm {
    aspect: string;
    condition: string;
    measurement: string;
    responsibility: string;
    timeline: string;
}
export interface MediationCommitment {
    party: string;
    commitment: string;
    verification: string;
    consequences: string;
}
export declare enum EnforcementMechanism {
    SELF_POLICING = "self_policing",
    THIRD_PARTY = "third_party",
    SYSTEM_AUTOMATED = "system_automated",
    PEER_REVIEW = "peer_review"
}
export interface CoordinationPerformance {
    communication: CommunicationPerformance;
    collaboration: CollaborationPerformance;
    conflictResolution: ConflictResolutionPerformance;
    overall: OverallPerformance;
    lastUpdate: number;
}
export interface CommunicationPerformance {
    latency: number;
    throughput: number;
    successRate: number;
    messageLoss: number;
    priorityCompliance: number;
    channelUtilization: number;
    securityIncidents: number;
}
export interface CollaborationPerformance {
    formationSuccessRate: number;
    objectiveCompletionRate: number;
    resourceUtilization: number;
    memberSatisfaction: number;
    teamCohesion: number;
    innovationRate: number;
}
export interface ConflictResolutionPerformance {
    resolutionRate: number;
    resolutionTime: number;
    satisfactionRate: number;
    escalationRate: number;
    recurrenceRate: number;
    fairnessScore: number;
}
export interface OverallPerformance {
    efficiency: number;
    effectiveness: number;
    scalability: number;
    reliability: number;
    adaptability: number;
    learningRate: number;
}
export interface CoordinationConfig {
    communication: CommunicationConfig;
    collaboration: CollaborationConfig;
    conflictResolution: ConflictResolutionConfig;
    performance: PerformanceConfig;
    optimization: OptimizationConfig;
}
export interface CommunicationConfig {
    maxChannels: number;
    messageRetentionPeriod: number;
    priorityQueues: boolean;
    encryption: boolean;
    rateLimiting: boolean;
    compression: boolean;
}
export interface CollaborationConfig {
    maxTeamSize: number;
    maxConcurrentCollaborations: number;
    autoFormation: boolean;
    skillMatching: boolean;
    resourceSharing: boolean;
    delegationEnabled: boolean;
}
export interface ConflictResolutionConfig {
    autoDetection: boolean;
    negotiationEnabled: boolean;
    mediationEnabled: boolean;
    arbitrationEnabled: boolean;
    escalationEnabled: boolean;
    timeoutDuration: number;
}
export interface PerformanceConfig {
    monitoringEnabled: boolean;
    metricsRetention: number;
    alertThresholds: AlertThreshold[];
    optimizationEnabled: boolean;
    reportingEnabled: boolean;
}
export interface AlertThreshold {
    metric: string;
    threshold: number;
    severity: AlertSeverity;
    action: string;
}
export declare enum AlertSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
export interface OptimizationConfig {
    autoTuning: boolean;
    machineLearning: boolean;
    adaptationRate: number;
    experimentationEnabled: boolean;
    abTesting: boolean;
}
export interface CoordinationEvent {
    id: string;
    type: CoordinationEventType;
    source: string;
    timestamp: number;
    data: any;
    priority: EventPriority;
    context?: EventContext;
}
export declare enum CoordinationEventType {
    COMMUNICATION_ESTABLISHED = "communication_established",
    COMMUNICATION_LOST = "communication_lost",
    COLLABORATION_FORMED = "collaboration_formed",
    COLLABORATION_DISSOLVED = "collaboration_dissolved",
    CONFLICT_DETECTED = "conflict_detected",
    CONFLICT_RESOLVED = "conflict_resolved",
    NEGOTIATION_STARTED = "negotiation_started",
    NEGOTIATION_ENDED = "negotiation_ended",
    TEAM_FORMED = "team_formed",
    TEAM_DISSOLVED = "team_dolved",
    RESOURCE_ALLOCATED = "resource_allocated",
    RESOURCE_DEALLOCATED = "resource_deallocated",
    PERFORMANCE_DEGRADED = "performance_degraded",
    PERFORMANCE_IMPROVED = "performance_improved"
}
export declare enum EventPriority {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2,
    CRITICAL = 3
}
export interface EventContext {
    environment: string;
    participants: string[];
    relationships: RelationshipContext[];
    resources: ResourceContext[];
    constraints: ConstraintContext[];
}
export interface RelationshipContext {
    trustLevels: Map<string, number>;
    friendshipLevels: Map<string, number>;
    reputationScores: Map<string, number>;
    recentInteractions: InteractionHistory[];
}
export interface InteractionHistory {
    agentId: string;
    interaction: string;
    outcome: string;
    timestamp: number;
    impact: number;
}
export interface ResourceContext {
    availability: Map<string, number>;
    utilization: Map<string, number>;
    constraints: Map<string, string>;
    opportunities: Map<string, number>;
}
export interface ConstraintContext {
    timeConstraints: TimeConstraint[];
    resourceConstraints: ResourceConstraint[];
    policyConstraints: PolicyConstraint[];
    environmentalConstraints: EnvironmentalConstraint[];
}
export interface PolicyConstraint {
    policy: string;
    description: string;
    impact: number;
    flexibility: number;
}
export interface EnvironmentalConstraint {
    factor: string;
    condition: string;
    severity: number;
    duration: number;
}
export interface CoordinationRequest {
    id: string;
    type: RequestType;
    requester: string;
    target?: string;
    targets?: string[];
    payload: RequestPayload;
    priority: MessagePriority;
    timeout: number;
    timestamp: number;
    context?: RequestContext;
}
export declare enum RequestType {
    COMMUNICATION_CHANNEL = "communication_channel",
    COLLABORATION_INVITATION = "collaboration_invitation",
    TASK_DELEGATION = "task_delegation",
    RESOURCE_SHARING = "resource_sharing",
    CONFLICT_RESOLUTION = "conflict_resolution",
    TEAM_FORMATION = "team_formation",
    INFORMATION_REQUEST = "information_request",
    NEGOTIATION_INITIATION = "negotiation_initiation"
}
export interface RequestPayload {
    content: any;
    requirements: RequestRequirement[];
    preferences: RequestPreference[];
    constraints: RequestConstraint[];
    metadata: RequestMetadata;
}
export interface RequestRequirement {
    type: string;
    description: string;
    quantity: number;
    quality: number;
    alternatives: string[];
}
export interface RequestPreference {
    aspect: string;
    value: any;
    weight: number;
    flexibility: number;
}
export interface RequestConstraint {
    type: string;
    condition: any;
    severity: number;
    negotiable: boolean;
}
export interface RequestMetadata {
    category: string;
    tags: string[];
    urgency: number;
    importance: number;
    expectedDuration: number;
}
export interface RequestContext {
    environment: string;
    urgency: number;
    stakeholders: string[];
    dependencies: string[];
    risks: string[];
    opportunities: string[];
}
export interface CoordinationResponse {
    id: string;
    requestId: string;
    responder: string;
    type: ResponseType;
    payload: ResponsePayload;
    priority: MessagePriority;
    timestamp: number;
    processingTime: number;
    context?: ResponseContext;
}
export declare enum ResponseType {
    ACCEPTANCE = "acceptance",
    REJECTION = "rejection",
    COUNTER_OFFER = "counter_offer",
    NEGOTIATION = "negotiation",
    ALTERNATIVE = "alternative",
    DEFERRAL = "deferral",
    ESCALATION = "escalation"
}
export interface ResponsePayload {
    decision: string;
    reasoning: string;
    conditions: ResponseCondition[];
    alternatives: ResponseAlternative[];
    commitments: ResponseCommitment[];
    metadata: ResponseMetadata;
}
export interface ResponseCondition {
    type: string;
    condition: any;
    measurement: string;
    verification: string;
}
export interface ResponseAlternative {
    description: string;
    benefits: string[];
    costs: string[];
    timeline: string;
    requirements: string[];
}
export interface ResponseCommitment {
    type: string;
    description: string;
    timeline: string;
    verification: string;
    consequences: string;
}
export interface ResponseMetadata {
    confidence: number;
    estimatedDuration: number;
    resourceRequirements: string[];
    riskAssessment: string[];
    nextSteps: string[];
}
export interface ResponseContext {
    originalRequest: string;
    environment: string;
    constraints: string[];
    availableResources: string[];
    timeConstraints: string[];
    relationshipContext: string[];
}
export declare enum ResolutionStrategy {
    NEGOTIATION = "negotiation",
    MEDIATION = "mediation",
    ARBITRATION = "arbitration",
    VOTING = "voting",
    COMPETITION = "competition",
    AVOIDANCE = "avoidance",
    HIERARCHICAL = "hierarchical",
    COLLABORATIVE = "collaborative"
}
export declare enum CollaborativeStatus {
    PROPOSED = "proposed",
    FORMING = "forming",
    ACTIVE = "active",
    COORDINATING = "coordinating",
    DISSOLVING = "dissolving",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare enum LeadershipStructure {
    FLAT = "flat",
    HIERARCHICAL = "hierarchical",
    MATRIX = "matrix",
    NETWORK = "network",
    CIRCULAR = "circular",
    HOLARCHIC = "holarchic",
    AGILE = "agile"
}
export interface DelegationRecord {
    delegationId: string;
    delegatorId: string;
    delegateeId: string;
    task: string;
    status: DelegationStatus;
    outcome: DelegationOutcome;
    duration: number;
    satisfaction: number;
    lessons: string[];
    timestamp: number;
}
export declare enum DelegationOutcome {
    SUCCESSFUL = "successful",
    FAILED = "failed",
    REJECTED = "rejected",
    EXPIRED = "expired",
    CANCELLED = "cancelled"
}
//# sourceMappingURL=coordination_types.d.ts.map