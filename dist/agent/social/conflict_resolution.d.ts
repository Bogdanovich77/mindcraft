/**
 * Conflict Resolution System for Multi-Agent Coordination
 *
 * This module provides comprehensive conflict resolution capabilities including
 * conflict detection, negotiation protocols, mediation systems, and consensus building.
 *
 * Key Features:
 * - Multi-type conflict detection (resource, goal, communication, behavioral)
 * - Automated and manual conflict resolution strategies
 * - Negotiation protocols with multiple rounds
 * - Mediation systems with third-party facilitation
 * - Consensus building mechanisms
 * - Performance tracking and analytics
 */
import { MessageType, MessagePriority, CoordinationStatus, ConflictDetection, NegotiationProcess } from './multi_agent_coordinator';
import { AgentRelationship } from './relationship_types';
import { MentalState } from './tom_types';
/**
 * Conflict resolution strategy
 */
export interface ConflictResolutionStrategy {
    id: string;
    name: string;
    description: string;
    applicableTypes: ConflictDetection['type'][];
    requirements: {
        minTrustLevel: number;
        requiredSkills: string[];
        timeLimit: number;
    };
    steps: Array<{
        step: number;
        description: string;
        action: string;
        expectedOutcome: string;
        timeEstimate: number;
    }>;
    successRate: number;
    averageResolutionTime: number;
}
/**
 * Negotiation round result
 */
export interface NegotiationRound {
    roundNumber: number;
    proposals: Array<{
        agentId: string;
        proposal: any;
        priority: number;
        flexibility: number;
        timestamp: number;
    }>;
    votes: Array<{
        agentId: string;
        vote: 'for' | 'against' | 'abstain';
        reasoning?: string;
        timestamp: number;
    }>;
    outcome: 'agreement' | 'deadlock' | 'timeout' | 'failed';
    consensusLevel: number;
    resolutionProposal?: any;
    timestamp: number;
}
/**
 * Mediation session
 */
export interface MediationSession {
    id: string;
    conflictId: string;
    mediatorId: string;
    parties: string[];
    initialPositions: Array<{
        agentId: string;
        position: any;
        priority: number;
        inflexibility: number;
    }>;
    negotiationHistory: NegotiationRound[];
    mediationStrategy: 'facilitative' | 'evaluative' | 'directive' | 'arbitration';
    groundRules: string[];
    sessionTimeout: number;
    status: CoordinationStatus;
    outcome?: {
        resolution: string;
        satisfaction: Array<{
            agentId: string;
            level: number;
            reasoning: string;
        }>;
        enforcement: 'voluntary' | 'monitored' | 'enforced';
        compliance: number;
    };
    createdAt: number;
    updatedAt: number;
    completedAt?: number;
}
/**
 * Consensus building parameters
 */
export interface ConsensusParameters {
    requiredAgreement: number;
    votingMethod: 'majority' | 'unanimity' | 'weighted' | 'supermajority';
    debateTimeLimit: number;
    proposalRequirements: {
        minSupporters: number;
        maxProposals: number;
        proposalComplexity: 'simple' | 'medium' | 'complex';
    };
    fallbackStrategies: string[];
}
/**
 * Conflict resolution metrics
 */
export interface ConflictResolutionMetrics {
    agentId: string;
    timestamp: number;
    conflicts: {
        detected: number;
        resolved: number;
        mediated: number;
        escalated: number;
        averageResolutionTime: number;
        successRate: number;
    };
    negotiations: {
        initiated: number;
        completed: number;
        averageRounds: number;
        consensusRate: number;
        deadlockRate: number;
    };
    mediations: {
        offered: number;
        accepted: number;
        completed: number;
        averageSessionTime: number;
        satisfactionRate: number;
        complianceRate: number;
    };
    strategies: {
        used: string[];
        successRate: number;
        averageTime: number;
    };
}
/**
 * Conflict Resolution System
 *
 * Manages conflict detection, negotiation, mediation, and consensus building
 * for multi-agent coordination systems.
 */
export declare class ConflictResolution {
    private getRelationship?;
    private getMentalState?;
    private sendMessage?;
    private agentId;
    private activeConflicts;
    private negotiationProcesses;
    private mediationSessions;
    private resolutionStrategies;
    private consensusParameters;
    private metrics;
    constructor(agentId: string, getRelationship?: ((targetId: string) => Promise<AgentRelationship | null>) | undefined, getMentalState?: ((targetId: string) => Promise<MentalState | null>) | undefined, sendMessage?: ((targetId: string, type: MessageType, content: any, priority: MessagePriority) => Promise<boolean>) | undefined);
    /**
     * Detect conflicts between agents
     */
    detectConflict(type: ConflictDetection['type'], parties: string[], description: string, context: any, severity?: ConflictDetection['severity']): Promise<string | null>;
    /**
     * Find existing conflict between parties
     */
    private findExistingConflict;
    /**
     * Analyze conflict severity automatically
     */
    analyzeConflictSeverity(type: ConflictDetection['type'], parties: string[], context: any): Promise<ConflictDetection['severity']>;
    /**
     * Initiate negotiation process for conflict
     */
    initiateNegotiation(conflictId: string, parties: string[], topic: string, initialPositions?: Array<{
        agentId: string;
        position: any;
        priority: number;
    }>): Promise<string | null>;
    /**
     * Conduct negotiation round
     */
    conductNegotiationRound(negotiationId: string, roundNumber: number): Promise<NegotiationRound | null>;
    /**
     * Gather proposals for negotiation round
     */
    private gatherProposals;
    /**
     * Conduct voting on proposals
     */
    private conductVoting;
    /**
     * Analyze negotiation round outcome
     */
    private analyzeRoundOutcome;
    /**
     * Calculate consensus level
     */
    private calculateConsensusLevel;
    /**
     * Offer mediation for conflict
     */
    offerMediation(conflictId: string, mediatorId?: string): Promise<string | null>;
    /**
     * Conduct mediation session
     */
    conductMediation(mediationId: string): Promise<boolean>;
    /**
     * Check mediation eligibility
     */
    private checkMediationEligibility;
    /**
     * Gather positions for mediation
     */
    private gatherMediationPositions;
    /**
     * Facilitate mediation negotiation
     */
    private facilitateMediationNegotiation;
    /**
     * Generate mediation proposals
     */
    private generateMediationProposals;
    /**
     * Generate compromise proposal
     */
    private generateCompromiseProposal;
    /**
     * Conduct mediation voting
     */
    private conductMediationVoting;
    /**
     * Evaluate mediation proposal
     */
    private evaluateMediationProposal;
    /**
     * Calculate satisfaction levels
     */
    private calculateSatisfactionLevels;
    /**
     * Initialize resolution strategies
     */
    private initializeResolutionStrategies;
    /**
     * Initialize consensus parameters
     */
    private initializeConsensusParameters;
    /**
     * Get agent trust level
     */
    private getAgentTrustLevel;
    /**
     * Get agent mental state
     */
    private getAgentMentalState;
    /**
     * Get agent relationship
     */
    private getAgentRelationship;
    /**
     * Get agent skills
     */
    private getAgentSkills;
    /**
     * Calculate agent flexibility
     */
    private calculateAgentFlexibility;
    /**
     * Generate proposal for negotiation
     */
    private generateProposal;
    /**
     * Simulate voting behavior
     */
    private simulateVote;
    /**
     * Evaluate proposal for agent
     */
    private evaluateProposal;
    /**
     * Update conflict metrics
     */
    private updateConflictMetrics;
    /**
     * Update negotiation metrics
     */
    private updateNegotiationMetrics;
    /**
     * Update mediation metrics
     */
    private updateMediationMetrics;
    /**
     * Initialize metrics
     */
    private initializeMetrics;
    /**
     * Get current metrics
     */
    getMetrics(): ConflictResolutionMetrics;
    /**
     * Get active conflicts
     */
    getActiveConflicts(): ConflictDetection[];
    /**
     * Get negotiation processes
     */
    getNegotiationProcesses(): NegotiationProcess[];
    /**
     * Get mediation sessions
     */
    getMediationSessions(): MediationSession[];
    /**
     * Get resolution strategies
     */
    getResolutionStrategies(): ConflictResolutionStrategy[];
    /**
     * Reset metrics
     */
    resetMetrics(): void;
}
//# sourceMappingURL=conflict_resolution.d.ts.map