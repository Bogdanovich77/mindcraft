/**
 * Collaborative Planning System for Multi-Agent Coordination
 *
 * This module provides comprehensive collaborative planning capabilities including
 * goal formation, task decomposition, resource allocation, and coordination
 * meeting facilitation.
 *
 * Key Features:
 * - Multi-agent goal formation with consensus building
 * - Task decomposition and delegation algorithms
 * - Shared resource management and allocation
 * - Coordination meeting facilitation
 * - Progress tracking and synchronization
 */
import { MessageType, MessagePriority, CoordinationStatus, CollaborationRequest } from './multi_agent_coordinator';
import { AgentRelationship } from './relationship_types';
import { MentalState } from './tom_types';
/**
 * Collaborative goal template
 */
export interface CollaborativeGoalTemplate {
    id: string;
    name: string;
    description: string;
    category: 'exploration' | 'building' | 'resource_gathering' | 'combat' | 'social' | 'research';
    complexity: 'simple' | 'medium' | 'complex' | 'epic';
    estimatedDuration: number;
    requiredSkills: string[];
    requiredResources: string[];
    minParticipants: number;
    maxParticipants: number;
    successCriteria: string[];
    riskFactors: string[];
}
/**
 * Task decomposition result
 */
export interface TaskDecomposition {
    originalGoal: string;
    subtasks: CollaborativeTask[];
    dependencies: Map<string, string[]>;
    criticalPath: string[];
    estimatedTotalDuration: number;
    resourceRequirements: Map<string, number>;
    skillRequirements: Map<string, number>;
}
/**
 * Collaborative task definition
 */
export interface CollaborativeTask {
    id: string;
    goalId: string;
    title: string;
    description: string;
    type: 'sequential' | 'parallel' | 'conditional';
    priority: MessagePriority;
    assigneeId?: string;
    requiredSkills: string[];
    requiredResources: string[];
    estimatedDuration: number;
    dependencies: string[];
    status: CoordinationStatus;
    progress: {
        percentage: number;
        completedSteps: string[];
        currentStep?: string;
        blockers: string[];
    };
    createdAt: number;
    updatedAt: number;
    deadline?: number;
}
/**
 * Resource allocation plan
 */
export interface ResourceAllocation {
    resourceId: string;
    resourceName: string;
    totalAmount: number;
    allocatedAmount: number;
    availableAmount: number;
    allocations: Map<string, number>;
    priority: MessagePriority;
    allocationStrategy: 'equal' | 'need_based' | 'skill_based' | 'trust_based';
    lastUpdated: number;
}
/**
 * Coordination meeting
 */
export interface CoordinationMeeting {
    id: string;
    type: 'planning' | 'status_update' | 'problem_solving' | 'decision_making';
    topic: string;
    agenda: string[];
    participants: string[];
    requiredParticipants: number;
    status: CoordinationStatus;
    startTime?: number;
    endTime?: number;
    decisions: Array<{
        decision: string;
        votes: Array<{
            agentId: string;
            vote: 'for' | 'against' | 'abstain';
        }>;
        consensus: boolean;
        timestamp: number;
    }>;
    actionItems: Array<{
        description: string;
        assigneeId: string;
        deadline: number;
        status: CoordinationStatus;
    }>;
    createdAt: number;
    updatedAt: number;
}
/**
 * Collaborative planning metrics
 */
export interface CollaborativePlanningMetrics {
    agentId: string;
    timestamp: number;
    goals: {
        initiated: number;
        participated: number;
        completed: number;
        successRate: number;
        averageParticipants: number;
    };
    tasks: {
        created: number;
        assigned: number;
        completed: number;
        averageDuration: number;
        onTimeCompletionRate: number;
    };
    resources: {
        allocated: number;
        utilized: number;
        efficiency: number;
        conflicts: number;
    };
    meetings: {
        organized: number;
        attended: number;
        decisions: number;
        consensusRate: number;
    };
}
/**
 * Collaborative Planning System
 *
 * Manages multi-agent collaborative planning including goal formation,
 * task decomposition, resource allocation, and coordination meetings.
 */
export declare class CollaborativePlanning {
    private getRelationship?;
    private getMentalState?;
    private sendMessage?;
    private agentId;
    private activeGoals;
    private taskDecompositions;
    private collaborativeTasks;
    private resourceAllocations;
    private coordinationMeetings;
    private goalTemplates;
    private metrics;
    constructor(agentId: string, getRelationship?: ((targetId: string) => Promise<AgentRelationship | null>) | undefined, getMentalState?: ((targetId: string) => Promise<MentalState | null>) | undefined, sendMessage?: ((targetId: string, type: MessageType, content: any, priority: MessagePriority) => Promise<boolean>) | undefined);
    /**
     * Propose collaborative goal to other agents
     */
    proposeCollaborativeGoal(templateId: string, customizations?: Partial<CollaborationRequest>): Promise<string | null>;
    /**
     * Decompose goal into executable tasks
     */
    decomposeGoalIntoTasks(goal: CollaborationRequest): Promise<TaskDecomposition | null>;
    /**
     * Generate task decomposition for goal
     */
    private generateTaskDecomposition;
    /**
     * Create collaborative task
     */
    private createTask;
    /**
     * Calculate critical path for tasks
     */
    private calculateCriticalPath;
    /**
     * Delegate task to suitable agent
     */
    delegateTask(taskId: string, preferredDelegateeId?: string): Promise<string | null>;
    /**
     * Identify suitable delegatees for task
     */
    private identifySuitableDelegatees;
    /**
     * Allocate shared resources for collaborative goal
     */
    allocateResources(goalId: string, resourceRequirements: Map<string, number>): Promise<boolean>;
    /**
     * Calculate resource share for participant
     */
    private calculateResourceShare;
    /**
     * Organize coordination meeting
     */
    organizeMeeting(type: CoordinationMeeting['type'], topic: string, agenda: string[], requiredParticipants: number, deadline?: number): Promise<string | null>;
    /**
     * Initialize goal templates
     */
    private initializeGoalTemplates;
    /**
     * Identify potential participants for collaboration
     */
    private identifyPotentialParticipants;
    /**
     * Send goal proposal to agent
     */
    private sendGoalProposal;
    /**
     * Get agent trust level
     */
    private getAgentTrustLevel;
    /**
     * Check skill compatibility
     */
    private checkSkillCompatibility;
    /**
     * Check agent availability
     */
    private checkAgentAvailability;
    /**
     * Send meeting invitation
     */
    private sendMeetingInvitation;
    /**
     * Initialize metrics
     */
    private initializeMetrics;
    /**
     * Update goal metrics
     */
    private updateGoalMetrics;
    /**
     * Update task metrics
     */
    private updateTaskMetrics;
    /**
     * Update resource metrics
     */
    private updateResourceMetrics;
    /**
     * Update meeting metrics
     */
    private updateMeetingMetrics;
    /**
     * Get current metrics
     */
    getMetrics(): CollaborativePlanningMetrics;
    /**
     * Get active goals
     */
    getActiveGoals(): CollaborationRequest[];
    /**
     * Get task decompositions
     */
    getTaskDecompositions(): TaskDecomposition[];
    /**
     * Get collaborative tasks
     */
    getCollaborativeTasks(): CollaborativeTask[];
    /**
     * Get resource allocations
     */
    getResourceAllocations(): ResourceAllocation[];
    /**
     * Get coordination meetings
     */
    getCoordinationMeetings(): CoordinationMeeting[];
    /**
     * Reset metrics
     */
    resetMetrics(): void;
}
//# sourceMappingURL=collaborative_planning.d.ts.map