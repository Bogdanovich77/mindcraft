/**
 * Multi-Agent Coordination System
 *
 * This system provides comprehensive coordination capabilities for multiple agents,
 * including communication protocols, collaborative planning, and conflict resolution.
 *
 * Key Features:
 * - Agent-to-agent message passing with prioritization
 * - Collaborative goal formation and task delegation
 * - Conflict detection and resolution mechanisms
 * - Trust-based communication and collaboration
 * - Performance optimization with caching and batch processing
 */
import { AgentRelationship } from './relationship_types';
import { MentalState } from './tom_types';
/**
 * Configuration for multi-agent coordination system
 */
export interface MultiAgentCoordinatorConfig {
    /** Maximum messages per second to prevent spam */
    maxMessagesPerSecond: number;
    /** Maximum bandwidth usage for messages */
    maxBandwidthUsage: number;
    /** Trust thresholds for different coordination activities */
    trustThresholds: {
        minTrustForCommunication: number;
        minTrustForCollaboration: number;
        minTrustForDelegation: number;
        minTrustForMediation: number;
    };
    /** Performance optimization settings */
    performance: {
        enableBatching: boolean;
        batchSize: number;
        batchTimeoutMs: number;
        enableCaching: boolean;
        cacheMaxAge: number;
    };
    /** Conflict resolution settings */
    conflictResolution: {
        enableNegotiation: boolean;
        enableMediation: boolean;
        maxNegotiationRounds: number;
        mediationTimeoutMs: number;
    };
}
/**
 * Message types for agent communication
 */
export declare enum MessageType {
    SOCIAL = "social",
    COORDINATION = "coordination",
    EMERGENCY = "emergency",
    COLLABORATIVE = "collaborative",
    NEGOTIATION = "negotiation",
    MEDIATION = "mediation",
    TASK_DELEGATION = "task_delegation",
    TASK_UPDATE = "task_update",
    CONFLICT_NOTIFICATION = "conflict_notification"
}
/**
 * Priority levels for messages and tasks
 */
export declare enum MessagePriority {
    CRITICAL = 0,
    HIGH = 1,
    MEDIUM = 2,
    LOW = 3,
    BACKGROUND = 4
}
/**
 * Status of coordination activities
 */
export declare enum CoordinationStatus {
    PENDING = "pending",
    ACTIVE = "active",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    TIMEOUT = "timeout"
}
/**
 * Coordination message between agents
 */
export interface CoordinationMessage {
    id: string;
    type: MessageType;
    priority: MessagePriority;
    senderId: string;
    targetId: string | string[];
    content: any;
    timestamp: number;
    expiresAt?: number;
    requiresResponse: boolean;
    responseTo?: string;
    metadata?: Record<string, any>;
    delivered: boolean;
    read: boolean;
    processingTime?: number;
}
/**
 * Collaboration request between agents
 */
export interface CollaborationRequest {
    id: string;
    type: string;
    title: string;
    description: string;
    priority: MessagePriority;
    initiatorId: string;
    targetIds: string[];
    requirements: {
        minParticipants: number;
        maxParticipants: number;
        requiredSkills: string[];
        minTrustLevel: number;
        resources: string[];
    };
    deadline?: number;
    status: CoordinationStatus;
    participants: string[];
    createdAt: number;
    updatedAt: number;
}
/**
 * Task delegation between agents
 */
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
    status: CoordinationStatus;
    progress: {
        percentage: number;
        completedSteps: string[];
        blockers: string[];
    };
    feedback: Array<{
        id: string;
        content: string;
        timestamp: number;
        rating?: number;
    }>;
    createdAt: number;
    updatedAt: number;
    deadline?: number;
}
/**
 * Conflict detection and resolution
 */
export interface ConflictDetection {
    id: string;
    type: 'resource' | 'goal' | 'communication' | 'behavioral';
    severity: 'low' | 'medium' | 'high' | 'critical';
    parties: string[];
    description: string;
    context: any;
    detectedAt: number;
    status: CoordinationStatus;
    resolutionAttempts: number;
}
/**
 * Negotiation process between agents
 */
export interface NegotiationProcess {
    id: string;
    type: 'resource_sharing' | 'task_coordination' | 'conflict_resolution';
    parties: string[];
    topic: string;
    positions: Array<{
        agentId: string;
        position: any;
        priority: number;
        flexibility: number;
    }>;
    status: CoordinationStatus;
    currentRound: number;
    maxRounds: number;
    deadline: number;
    createdAt: number;
    updatedAt: number;
}
/**
 * Mediation process for conflict resolution
 */
export interface MediationProcess {
    id: string;
    mediatorId: string;
    conflictId: string;
    parties: string[];
    terms: Array<{
        agentId: string;
        terms: any;
        acceptance: boolean;
    }>;
    status: CoordinationStatus;
    outcome?: {
        resolution: string;
        satisfaction: number[];
        enforcement: string;
    };
    createdAt: number;
    updatedAt: number;
    completedAt?: number;
    deadline: number;
}
/**
 * Performance metrics for coordination system
 */
export interface CoordinationMetrics {
    agentId: string;
    timestamp: number;
    messages: {
        sent: number;
        received: number;
        delivered: number;
        failed: number;
        averageLatency: number;
    };
    collaborations: {
        initiated: number;
        participated: number;
        completed: number;
        successRate: number;
    };
    conflicts: {
        detected: number;
        resolved: number;
        mediated: number;
        averageResolutionTime: number;
    };
    performance: {
        bandwidthUsage: number;
        processingTime: number;
        cacheHitRate: number;
        batchEfficiency: number;
    };
}
/**
 * Multi-Agent Coordinator
 *
 * Central coordinator for managing agent-to-agent interactions,
 * collaborative planning, and conflict resolution.
 */
export declare class MultiAgentCoordinator {
    private getRelationship?;
    private getMentalState?;
    private predictIntention?;
    private agentId;
    private config;
    private metrics;
    private messageQueue;
    private activeCollaborations;
    private activeDelegations;
    private activeConflicts;
    private activeNegotiations;
    private activeMediations;
    private messageCache;
    private bandwidthUsage;
    private lastBandwidthReset;
    constructor(agentId: string, config?: Partial<MultiAgentCoordinatorConfig>, getRelationship?: ((targetId: string) => Promise<AgentRelationship | null>) | undefined, getMentalState?: ((targetId: string) => Promise<MentalState | null>) | undefined, predictIntention?: ((targetId: string, context: any) => Promise<any>) | undefined);
    /**
     * Create default configuration
     */
    private createDefaultConfig;
    /**
     * Initialize metrics for agent
     */
    private initializeMetrics;
    /**
     * Send message to specific agent
     */
    sendMessage(targetId: string, type: MessageType, content: any, priority?: MessagePriority, requiresResponse?: boolean, responseTo?: string): Promise<boolean>;
    /**
     * Broadcast message to multiple agents
     */
    broadcastMessage(targetIds: string[], type: MessageType, content: any, priority?: MessagePriority): Promise<number>;
    /**
     * Form collaborative goal with other agents
     */
    formCollaborativeGoal(type: string, title: string, description: string, priority: MessagePriority | undefined, requiredAgents: number | undefined, requirements: CollaborationRequest['requirements']): Promise<string | null>;
    /**
     * Delegate task to another agent
     */
    delegateTask(delegateeId: string, taskId: string, title: string, description: string, priority: MessagePriority | undefined, requirements: TaskDelegation['requirements'], deadline?: number): Promise<boolean>;
    /**
     * Detect conflicts between agents
     */
    detectConflict(type: ConflictDetection['type'], parties: string[], description: string, context: any, severity?: ConflictDetection['severity']): Promise<string | null>;
    /**
     * Mediate conflict between agents
     */
    mediateConflict(conflictId: string, parties: string[], proposedTerms: Array<{
        agentId: string;
        terms: any;
    }>): Promise<boolean>;
    /**
     * Get trust level for target agent
     */
    private getTrustLevel;
    /**
     * Check bandwidth availability
     */
    private checkBandwidthAvailability;
    /**
     * Update bandwidth usage
     */
    private updateBandwidthUsage;
    /**
     * Calculate message urgency
     */
    private calculateUrgency;
    /**
     * Calculate message importance
     */
    private calculateImportance;
    /**
     * Check if message type requires response
     */
    private requiresResponse;
    /**
     * Deliver message to target agent
     */
    private deliverMessage;
    /**
     * Update message metrics
     */
    private updateMessageMetrics;
    /**
     * Update broadcast metrics
     */
    private updateBroadcastMetrics;
    /**
     * Identify potential collaborators for a task
     */
    private identifyPotentialCollaborators;
    /**
     * Send collaboration invitation
     */
    private sendCollaborationInvitation;
    /**
     * Update collaboration metrics
     */
    private updateCollaborationMetrics;
    /**
     * Check delegatee capacity
     */
    private checkDelegateeCapacity;
    /**
     * Send task delegation request
     */
    private sendTaskDelegationRequest;
    /**
     * Update delegation metrics
     */
    private updateDelegationMetrics;
    /**
     * Attempt automatic conflict resolution
     */
    private attemptAutomaticResolution;
    /**
     * Initiate negotiation for conflict
     */
    private initiateNegotiation;
    /**
     * Check mediation eligibility
     */
    private checkMediationEligibility;
    /**
     * Send mediation request
     */
    private sendMediationRequest;
    /**
     * Update mediation metrics
     */
    private updateMediationMetrics;
    /**
     * Get current metrics
     */
    getMetrics(): CoordinationMetrics;
    /**
     * Get active collaborations
     */
    getActiveCollaborations(): CollaborationRequest[];
    /**
     * Get active delegations
     */
    getActiveDelegations(): TaskDelegation[];
    /**
     * Get active conflicts
     */
    getActiveConflicts(): ConflictDetection[];
    /**
     * Get active negotiations
     */
    getActiveNegotiations(): NegotiationProcess[];
    /**
     * Get active mediations
     */
    getActiveMediations(): MediationProcess[];
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<MultiAgentCoordinatorConfig>): void;
    /**
     * Reset metrics
     */
    resetMetrics(): void;
}
/**
 * Factory for creating multi-agent coordinators
 */
export declare class MultiAgentCoordinatorFactory {
    /**
     * Create coordinator with default configuration
     */
    static createDefault(agentId: string, getRelationship?: (targetId: string) => Promise<AgentRelationship | null>, getMentalState?: (targetId: string) => Promise<MentalState | null>, predictIntention?: (targetId: string, context: any) => Promise<any>): MultiAgentCoordinator;
    /**
     * Create coordinator for high-performance scenarios
     */
    static createHighPerformance(agentId: string, getRelationship?: (targetId: string) => Promise<AgentRelationship | null>, getMentalState?: (targetId: string) => Promise<MentalState | null>, predictIntention?: (targetId: string, context: any) => Promise<any>): MultiAgentCoordinator;
    /**
     * Create coordinator for resource-constrained scenarios
     */
    static createResourceConstrained(agentId: string, getRelationship?: (targetId: string) => Promise<AgentRelationship | null>, getMentalState?: (targetId: string) => Promise<MentalState | null>, predictIntention?: (targetId: string, context: any) => Promise<any>): MultiAgentCoordinator;
}
//# sourceMappingURL=multi_agent_coordinator.d.ts.map