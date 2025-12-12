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

import { MessageType, MessagePriority, CoordinationStatus, ConflictDetection, NegotiationProcess, MediationProcess } from './multi_agent_coordinator';
import { AgentRelationship } from './relationship_types';
import { MentalState } from './tom_types';

// ============================================================================
// INTERFACES
// ============================================================================

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
  consensusLevel: number; // 0-1, percentage of agents in agreement
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
    inflexibility: number; // 0-1, how unwilling to compromise
  }>;
  negotiationHistory: NegotiationRound[];
  mediationStrategy: 'facilitative' | 'evaluative' | 'directive' | 'arbitration';
  groundRules: string[];
  sessionTimeout: number;
  status: CoordinationStatus;
  outcome?: {
    resolution: string;
    satisfaction: Array<{ agentId: string; level: number; reasoning: string }>;
    enforcement: 'voluntary' | 'monitored' | 'enforced';
    compliance: number; // 0-1, level of compliance with resolution
  };
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

/**
 * Consensus building parameters
 */
export interface ConsensusParameters {
  requiredAgreement: number; // Percentage required for consensus (0-1)
  votingMethod: 'majority' | 'unanimity' | 'weighted' | 'supermajority';
  debateTimeLimit: number; // Time limit for discussion/debate
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

// ============================================================================
// CONFLICT RESOLUTION CLASS
// ============================================================================

/**
 * Conflict Resolution System
 * 
 * Manages conflict detection, negotiation, mediation, and consensus building
 * for multi-agent coordination systems.
 */
export class ConflictResolution {
  private agentId: string;
  private activeConflicts: Map<string, ConflictDetection>;
  private negotiationProcesses: Map<string, NegotiationProcess>;
  private mediationSessions: Map<string, MediationSession>;
  private resolutionStrategies: Map<string, ConflictResolutionStrategy>;
  private consensusParameters: Map<string, ConsensusParameters>;
  private metrics: ConflictResolutionMetrics;

  constructor(
    agentId: string,
    private getRelationship?: (targetId: string) => Promise<AgentRelationship | null>,
    private getMentalState?: (targetId: string) => Promise<MentalState | null>,
    private sendMessage?: (targetId: string, type: MessageType, content: any, priority: MessagePriority) => Promise<boolean>
  ) {
    this.agentId = agentId;
    this.activeConflicts = new Map();
    this.negotiationProcesses = new Map();
    this.mediationSessions = new Map();
    this.resolutionStrategies = new Map();
    this.consensusParameters = new Map();
    this.metrics = this.initializeMetrics(agentId);
    this.initializeResolutionStrategies();
    this.initializeConsensusParameters();
  }

  // ============================================================================
  // CONFLICT DETECTION
  // ============================================================================

  /**
   * Detect conflicts between agents
   */
  async detectConflict(
    type: ConflictDetection['type'],
    parties: string[],
    description: string,
    context: any,
    severity: ConflictDetection['severity'] = 'medium'
  ): Promise<string | null> {
    try {
      // Check if conflict already exists
      const existingConflict = this.findExistingConflict(parties);
      if (existingConflict) {
        console.log(`[CONFLICT_RESOLUTION] Existing conflict found: ${existingConflict.id}`);
        return existingConflict.id;
      }

      // Create new conflict detection
      const conflict: ConflictDetection = {
        id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        severity,
        parties,
        description,
        context,
        detectedAt: Date.now(),
        status: CoordinationStatus.PENDING,
        resolutionAttempts: 0
      };

      // Store conflict
      this.activeConflicts.set(conflict.id, conflict);

      // Update metrics
      this.metrics.conflicts.detected++;
      this.updateConflictMetrics(conflict, 'detected');

      console.log(`[CONFLICT_RESOLUTION] Conflict detected: ${type} between ${parties.join(', ')}`);
      return conflict.id;

    } catch (error) {
      console.error(`[CONFLICT_RESOLUTION] Error detecting conflict:`, error);
      return null;
    }
  }

  /**
   * Find existing conflict between parties
   */
  private findExistingConflict(parties: string[]): ConflictDetection | null {
    for (const conflict of this.activeConflicts.values()) {
      const partyOverlap = parties.some(party => conflict.parties.includes(party));
      const typeMatch = conflict.status !== CoordinationStatus.COMPLETED;
      
      if (partyOverlap && typeMatch) {
        return conflict;
      }
    }
    return null;
  }

  /**
   * Analyze conflict severity automatically
   */
  async analyzeConflictSeverity(
    type: ConflictDetection['type'],
    parties: string[],
    context: any
  ): Promise<ConflictDetection['severity']> {
    try {
      // Base severity by type
      const baseSeverity = {
        'resource': 'medium',
        'goal': 'high',
        'communication': 'low',
        'behavioral': 'medium'
      };

      let severity = baseSeverity[type] || 'medium';

      // Adjust based on number of parties involved
      if (parties.length > 4) {
        severity = 'high';
      } else if (parties.length > 2) {
        severity = severity === 'low' ? 'medium' : severity;
      }

      // Adjust based on trust levels between parties
      const trustLevels = await Promise.all(
        parties.map(partyId => this.getAgentTrustLevel(partyId))
      );
      
      const averageTrust = trustLevels.reduce((sum, trust) => sum + trust, 0) / trustLevels.length;
      
      if (averageTrust < 0.3) {
        severity = severity === 'high' ? 'critical' : 'high';
      } else if (averageTrust < 0.6) {
        severity = severity === 'low' ? 'medium' : severity;
      }

      // Adjust based on context factors
      if (context && context.resourceScarcity) {
        severity = severity === 'low' ? 'medium' : severity === 'medium' ? 'high' : 'critical';
      }

      return severity as ConflictDetection['severity'];

    } catch (error) {
      console.error(`[CONFLICT_RESOLUTION] Error analyzing conflict severity:`, error);
      return 'medium';
    }
  }

  // ============================================================================
  // NEGOTIATION PROTOCOLS
  // ============================================================================

  /**
   * Initiate negotiation process for conflict
   */
  async initiateNegotiation(
    conflictId: string,
    parties: string[],
    topic: string,
    initialPositions?: Array<{ agentId: string; position: any; priority: number }>
  ): Promise<string | null> {
    try {
      const conflict = this.activeConflicts.get(conflictId);
      if (!conflict) {
        console.warn(`[CONFLICT_RESOLUTION] Conflict ${conflictId} not found`);
        return null;
      }

      // Create negotiation process
      const negotiation: NegotiationProcess = {
        id: `negotiation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'conflict_resolution',
        parties,
        topic,
        positions: initialPositions || [],
        status: CoordinationStatus.ACTIVE,
        currentRound: 1,
        maxRounds: 5,
        deadline: Date.now() + 300000, // 5 minutes
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Store negotiation
      this.negotiationProcesses.set(negotiation.id, negotiation);

      // Update metrics
      this.metrics.negotiations.initiated++;
      this.updateNegotiationMetrics(negotiation, 'initiated');

      console.log(`[CONFLICT_RESOLUTION] Negotiation initiated for conflict ${conflictId}`);
      return negotiation.id;

    } catch (error) {
      console.error(`[CONFLICT_RESOLUTION] Error initiating negotiation:`, error);
      return null;
    }
  }

  /**
   * Conduct negotiation round
   */
  async conductNegotiationRound(
    negotiationId: string,
    roundNumber: number
  ): Promise<NegotiationRound | null> {
    try {
      const negotiation = this.negotiationProcesses.get(negotiationId);
      if (!negotiation) {
        console.warn(`[CONFLICT_RESOLUTION] Negotiation ${negotiationId} not found`);
        return null;
      }

      // Gather proposals from all parties
      const proposals = await this.gatherProposals(negotiation, roundNumber);
      
      // Conduct voting
      const votes = await this.conductVoting(negotiation, proposals);
      
      // Analyze round outcome
      const outcome = this.analyzeRoundOutcome(proposals, votes);
      const consensusLevel = this.calculateConsensusLevel(votes, negotiation.parties.length);
      
      const round: NegotiationRound = {
        roundNumber,
        proposals,
        votes,
        outcome,
        consensusLevel,
        timestamp: Date.now()
      };

      // Update negotiation status
      negotiation.currentRound = roundNumber + 1;
      negotiation.updatedAt = Date.now();

      // Check if negotiation should continue or end
      if (outcome === 'agreement' || outcome === 'deadlock' || roundNumber >= negotiation.maxRounds) {
        negotiation.status = outcome === 'agreement' ? CoordinationStatus.COMPLETED : CoordinationStatus.FAILED;
        negotiation.updatedAt = Date.now();
        
        if (outcome === 'agreement') {
          this.metrics.negotiations.completed++;
          this.metrics.negotiations.consensusRate = 
            (this.metrics.negotiations.consensusRate * (this.metrics.negotiations.completed - 1) + 1) / 
            this.metrics.negotiations.completed;
        }
      }

      // Update metrics
      this.updateNegotiationMetrics(negotiation, 'round_completed');

      console.log(`[CONFLICT_RESOLUTION] Negotiation round ${roundNumber} completed: ${outcome}`);
      return round;

    } catch (error) {
      console.error(`[CONFLICT_RESOLUTION] Error conducting negotiation round:`, error);
      return null;
    }
  }

  /**
   * Gather proposals for negotiation round
   */
  private async gatherProposals(negotiation: NegotiationProcess, roundNumber: number): Promise<Array<{ agentId: string; proposal: any; priority: number; flexibility: number; timestamp: number }>> {
    const proposals: Array<{ agentId: string; proposal: any; priority: number; flexibility: number; timestamp: number }> = [];

    for (const party of negotiation.parties) {
      // Generate proposal based on agent's position and flexibility
      const flexibility = await this.calculateAgentFlexibility(party);
      const proposal = this.generateProposal(negotiation, party, flexibility, roundNumber);
      
      proposals.push({
        agentId: party,
        proposal,
        priority: Math.random() * 0.5 + 0.5,
        flexibility,
        timestamp: Date.now()
      });
    }

    return proposals;
  }

  /**
   * Conduct voting on proposals
   */
  private async conductVoting(
    negotiation: NegotiationProcess,
    proposals: Array<{ agentId: string; proposal: any; priority: number; flexibility: number; timestamp: number }>
  ): Promise<Array<{ agentId: string; vote: 'for' | 'against' | 'abstain'; reasoning?: string; timestamp: number }>> {
    const votes: Array<{ agentId: string; vote: 'for' | 'against' | 'abstain'; reasoning?: string; timestamp: number }> = [];

    for (const voter of negotiation.parties) {
      // Simulate voting behavior based on agent personality and trust
      const vote = await this.simulateVote(voter, proposals, negotiation);
      
      votes.push(vote);
    }

    return votes;
  }

  /**
   * Analyze negotiation round outcome
   */
  private analyzeRoundOutcome(
    proposals: Array<{ agentId: string; proposal: any; priority: number; flexibility: number; timestamp: number }>,
    votes: Array<{ agentId: string; vote: 'for' | 'against' | 'abstain'; reasoning?: string; timestamp: number }>
  ): 'agreement' | 'deadlock' | 'timeout' | 'failed' {
    const forVotes = votes.filter(v => v.vote === 'for').length;
    const againstVotes = votes.filter(v => v.vote === 'against').length;
    const totalVotes = forVotes + againstVotes;

    // Check for unanimous agreement
    if (forVotes === totalVotes && totalVotes > 0) {
      return 'agreement';
    }

    // Check for majority agreement
    if (forVotes > totalVotes / 2) {
      return 'agreement';
    }

    // Check for deadlock (no clear majority)
    if (Math.abs(forVotes - againstVotes) <= 1) {
      return 'deadlock';
    }

    return 'failed';
  }

  /**
   * Calculate consensus level
   */
  private calculateConsensusLevel(votes: Array<{ agentId: string; vote: any }>, totalParties: number): number {
    const agreementVotes = votes.filter(v => v.vote === 'for').length;
    return agreementVotes / totalParties;
  }

  // ============================================================================
  // MEDIATION SYSTEMS
  // ============================================================================

  /**
   * Offer mediation for conflict
   */
  async offerMediation(
    conflictId: string,
    mediatorId: string = this.agentId
  ): Promise<string | null> {
    try {
      const conflict = this.activeConflicts.get(conflictId);
      if (!conflict) {
        console.warn(`[CONFLICT_RESOLUTION] Conflict ${conflictId} not found`);
        return null;
      }

      // Check if agent can mediate
      const canMediate = await this.checkMediationEligibility(conflict, mediatorId);
      if (!canMediate) {
        console.warn(`[CONFLICT_RESOLUTION] Agent ${mediatorId} not eligible to mediate conflict ${conflictId}`);
        return null;
      }

      // Create mediation session
      const mediation: MediationSession = {
        id: `mediation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mediatorId,
        conflictId,
        parties: conflict.parties,
        initialPositions: [], // Will be populated after gathering
        status: CoordinationStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        negotiationHistory: [],
        mediationStrategy: 'facilitative',
        groundRules: ['respectful_communication', 'good_faith_negotiation'],
        sessionTimeout: 600000
      };

      // Store mediation
      this.mediationSessions.set(mediation.id, mediation);

      // Update metrics
      this.metrics.mediations.offered++;
      this.updateMediationMetrics(mediation, 'offered');

      console.log(`[CONFLICT_RESOLUTION] Mediation offered for conflict ${conflictId} by ${mediatorId}`);
      return mediation.id;

    } catch (error) {
      console.error(`[CONFLICT_RESOLUTION] Error offering mediation:`, error);
      return null;
    }
  }

  /**
   * Conduct mediation session
   */
  async conductMediation(
    mediationId: string
  ): Promise<boolean> {
    try {
      const mediation = this.mediationSessions.get(mediationId);
      if (!mediation) {
        console.warn(`[CONFLICT_RESOLUTION] Mediation ${mediationId} not found`);
        return false;
      }

      if (mediation.status !== CoordinationStatus.PENDING) {
        console.warn(`[CONFLICT_RESOLUTION] Mediation ${mediationId} not in pending status`);
        return false;
      }

      // Update status to active
      mediation.status = CoordinationStatus.ACTIVE;
      mediation.updatedAt = Date.now();

      // Gather initial positions from conflict parties
      const initialPositions = await this.gatherMediationPositions(mediation);

      // Facilitate negotiation process
      const agreementReached = await this.facilitateMediationNegotiation(mediation, initialPositions);

      // Update mediation outcome
      if (agreementReached) {
        mediation.status = CoordinationStatus.COMPLETED;
        mediation.completedAt = Date.now();
        mediation.outcome = {
          resolution: 'mediated_agreement',
          satisfaction: await this.calculateSatisfactionLevels(mediation.parties),
          enforcement: 'voluntary',
          compliance: 0.8
        };

        // Update conflict status
        const conflict = this.activeConflicts.get(mediation.conflictId);
        if (conflict) {
          conflict.status = CoordinationStatus.COMPLETED;
          conflict.resolutionAttempts++;
        }

        // Update metrics
        this.metrics.mediations.completed++;
        this.metrics.conflicts.resolved++;
        this.updateMediationMetrics(mediation, 'completed');
        this.updateConflictMetrics(conflict, 'resolved');

        console.log(`[CONFLICT_RESOLUTION] Mediation ${mediationId} completed successfully`);
        return true;
      } else {
        mediation.status = CoordinationStatus.FAILED;
        this.updateMediationMetrics(mediation, 'failed');
        console.log(`[CONFLICT_RESOLUTION] Mediation ${mediationId} failed to reach agreement`);
        return false;
      }

    } catch (error) {
      console.error(`[CONFLICT_RESOLUTION] Error conducting mediation:`, error);
      return false;
    }
  }

  /**
   * Check mediation eligibility
   */
  private async checkMediationEligibility(conflict: ConflictDetection, mediatorId: string): Promise<boolean> {
    // Check if mediator is one of the conflict parties
    if (conflict.parties.includes(mediatorId)) {
      return false;
    }

    // Check trust level of mediator with all parties
    for (const partyId of conflict.parties) {
      const trustLevel = await this.getAgentTrustLevel(partyId);
      if (trustLevel < 0.7) { // High trust required for mediation
        return false;
      }
    }

    // Check mediator's skills
    const mediatorSkills = await this.getAgentSkills(mediatorId);
    if (!mediatorSkills.includes('negotiation') && !mediatorSkills.includes('diplomacy')) {
      return false;
    }

    return true;
  }

  /**
   * Gather positions for mediation
   */
  private async gatherMediationPositions(mediation: MediationSession): Promise<Array<{ agentId: string; position: any; priority: number; inflexibility: number }>> {
    const positions: Array<{ agentId: string; position: any; priority: number; inflexibility: number }> = [];

    for (const partyId of mediation.parties) {
      const mentalState = await this.getAgentMentalState(partyId);
      const relationship = await this.getAgentRelationship(partyId);
      
      positions.push({
        agentId: partyId,
        position: mentalState?.beliefs?.epistemicBeliefs?.get('conflict')?.proposition || { conflict: mediation.conflictId },
        priority: Math.random() * 0.5 + 0.5,
        inflexibility: 1.0 - (relationship?.trust.level || 0.5) // Lower trust = higher inflexibility
      });
    }

    return positions;
  }

  /**
   * Facilitate mediation negotiation
   */
  private async facilitateMediationNegotiation(
    mediation: MediationSession,
    initialPositions: Array<{ agentId: string; position: any; priority: number; inflexibility: number }>
  ): Promise<boolean> {
    try {
      // Facilitate discussion and proposal generation
      const proposals = await this.generateMediationProposals(mediation, initialPositions);
      
      // Conduct voting on proposals
      const votes = await this.conductMediationVoting(mediation, proposals);
      
      // Check for agreement
      const agreementVotes = votes.filter(v => v.vote === 'for').length;
      const totalVotes = votes.length;
      
      if (agreementVotes > totalVotes / 2) {
        // Record agreed proposal
        const agreedProposal = proposals.find((p: any) =>
          votes.some((v: any) => v.vote === 'for' && v.agentId === p.agentId)
        );
        
        return true;
      }

      // Try to facilitate compromise if no clear agreement
      const compromiseProposal = await this.generateCompromiseProposal(mediation, initialPositions, votes);
      if (compromiseProposal) {
        const compromiseVotes = await this.conductMediationVoting(mediation, [compromiseProposal]);
        
        if (compromiseVotes.filter((v: any) => v.vote === 'for').length > totalVotes / 2) {
          return true;
        }
      }

      return false;

    } catch (error) {
      console.error(`[CONFLICT_RESOLUTION] Error facilitating mediation negotiation:`, error);
      return false;
    }
  }

  /**
   * Generate mediation proposals
   */
  private async generateMediationProposals(
    mediation: MediationSession,
    positions: Array<{ agentId: string; position: any; priority: number; inflexibility: number }>
  ): Promise<any[]> {
    // Generate compromise proposals based on positions
    const proposals: any[] = [];
    
    // Simple compromise: average of positions
    const avgInflexibility = positions.reduce((sum: number, p: any) => sum + p.inflexibility, 0) / positions.length;
    
    proposals.push({
      type: 'compromise',
      description: 'Middle-ground compromise based on all positions',
      terms: {
        compromise_level: 0.5,
        flexibility_factor: 1 - avgInflexibility
      }
    });
    
    // Alternative proposals for different flexibility levels
    proposals.push({
      type: 'flexible',
      description: 'Solution favoring more flexible parties',
      terms: {
        flexibility_weight: 0.7,
        compromise_level: 0.3
      }
    });
    
    proposals.push({
      type: 'structured',
      description: 'Structured solution with clear responsibilities',
      terms: {
        structure_type: 'phased_implementation',
        clarity_weight: 0.8
      }
    });

    return proposals;
  }

  /**
   * Generate compromise proposal
   */
  private async generateCompromiseProposal(
    mediation: MediationSession,
    positions: Array<{ agentId: string; position: any; priority: number; inflexibility: number }>,
    votes: Array<{ agentId: string; vote: any }>
  ): Promise<any> {
    // Analyze voting patterns to identify compromise opportunity
    const highInflexibilityParties = positions.filter((p: any) => p.inflexibility > 0.7);
    const lowInflexibilityParties = positions.filter((p: any) => p.inflexibility < 0.4);
    
    if (highInflexibilityParties.length > 0 && lowInflexibilityParties.length > 0) {
      return {
        type: 'phased_compromise',
        description: 'Phased implementation addressing concerns of both sides',
        terms: {
          phase_1: 'Address high-inflexibility concerns',
          phase_2: 'Address low-inflexibility concerns',
          timeline: 'balanced_approach'
        }
      };
    }

    return null;
  }

  /**
   * Conduct mediation voting
   */
  private async conductMediationVoting(
    mediation: MediationSession,
    proposals: any[]
  ): Promise<Array<{ agentId: string; vote: any; reasoning?: string; timestamp: number }>> {
    const votes: Array<{ agentId: string; vote: any; reasoning?: string; timestamp: number }> = [];

    for (const partyId of mediation.parties) {
      const partyPosition = mediation.parties.find((p: any) => p.agentId === partyId);
      if (!partyPosition) {
        votes.push({
          agentId: partyId,
          vote: 'abstain',
          reasoning: 'No position found',
          timestamp: Date.now()
        });
        continue;
      }

      // Evaluate proposals based on party's interests
      const bestProposal = proposals.reduce((best: any, current: any) => {
        const currentScore = this.evaluateMediationProposal(current, partyPosition);
        const bestScore = this.evaluateMediationProposal(best, partyPosition);
        return currentScore > bestScore ? current : best;
      });

      votes.push({
        agentId: partyId,
        vote: 'for',
        reasoning: 'Best aligns with interests',
        timestamp: Date.now()
      });
    }

    return votes;
  }

  /**
   * Evaluate mediation proposal
   */
  private evaluateMediationProposal(proposal: any, partyPosition: any): number {
    let score = 0.5; // Base score

    // Add evaluation based on proposal type
    if (proposal.type === 'compromise') {
      score += 0.3; // Compromise proposals get bonus
    } else if (proposal.type === 'flexible') {
      score += 0.2; // Flexible proposals get moderate bonus
    } else if (proposal.type === 'structured') {
      score += 0.4; // Structured proposals get high bonus
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate satisfaction levels
   */
  private async calculateSatisfactionLevels(parties: string[]): Promise<Array<{ agentId: string; level: number; reasoning: string }>> {
    const satisfaction: Array<{ agentId: string; level: number; reasoning: string }> = [];

    for (const partyId of parties) {
      // Simulate satisfaction based on conflict resolution
      const baseSatisfaction = 0.7; // Base satisfaction level
      const randomVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
      
      satisfaction.push({
        agentId: partyId,
        level: Math.max(0.1, Math.min(1.0, baseSatisfaction + randomVariation)),
        reasoning: 'Resolution addresses key concerns'
      });
    }

    return satisfaction;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Initialize resolution strategies
   */
  private initializeResolutionStrategies(): void {
    const strategies: ConflictResolutionStrategy[] = [
      {
        id: 'negotiation',
        name: 'Negotiation',
        description: 'Direct negotiation between conflicting parties',
        applicableTypes: ['resource', 'goal', 'communication'],
        requirements: {
          minTrustLevel: 0.3,
          requiredSkills: ['communication', 'negotiation'],
          timeLimit: 300000 // 5 minutes
        },
        steps: [
          {
            step: 1,
            description: 'Identify conflict and parties',
            action: 'gather_information',
            expectedOutcome: 'Clear understanding of conflict',
            timeEstimate: 30000
          },
          {
            step: 2,
            description: 'Present initial positions',
            action: 'present_positions',
            expectedOutcome: 'All parties understand positions',
            timeEstimate: 60000
          },
          {
            step: 3,
            description: 'Negotiate and compromise',
            action: 'negotiate_compromise',
            expectedOutcome: 'Mutually acceptable solution',
            timeEstimate: 120000
          }
        ],
        successRate: 0.7,
        averageResolutionTime: 180000
      },
      {
        id: 'mediation',
        name: 'Third-party Mediation',
        description: 'Mediated negotiation with neutral third party',
        applicableTypes: ['resource', 'goal', 'behavioral'],
        requirements: {
          minTrustLevel: 0.7,
          requiredSkills: ['diplomacy', 'mediation', 'communication'],
          timeLimit: 600000 // 10 minutes
        },
        steps: [
          {
            step: 1,
            description: 'Mediator assesses situation',
            action: 'assess_situation',
            expectedOutcome: 'Comprehensive conflict analysis',
            timeEstimate: 60000
          },
          {
            step: 2,
            description: 'Mediator facilitates discussion',
            action: 'facilitate_discussion',
            expectedOutcome: 'Productive dialogue',
            timeEstimate: 180000
          },
          {
            step: 3,
            description: 'Mediator proposes solution',
            action: 'propose_solution',
            expectedOutcome: 'Acceptable compromise',
            timeEstimate: 120000
          }
        ],
        successRate: 0.85,
        averageResolutionTime: 240000
      },
      {
        id: 'arbitration',
        name: 'Binding Arbitration',
        description: 'Third-party makes binding decision',
        applicableTypes: ['resource'],
        requirements: {
          minTrustLevel: 0.8,
          requiredSkills: ['analysis', 'decision_making'],
          timeLimit: 180000 // 3 minutes
        },
        steps: [
          {
            step: 1,
            description: 'Arbitrator reviews evidence',
            action: 'review_evidence',
            expectedOutcome: 'Informed decision',
            timeEstimate: 90000
          },
          {
            step: 2,
            description: 'Arbitrator makes decision',
            action: 'make_decision',
            expectedOutcome: 'Binding resolution',
            timeEstimate: 60000
          }
        ],
        successRate: 0.95,
        averageResolutionTime: 120000
      }
    ];

    for (const strategy of strategies) {
      this.resolutionStrategies.set(strategy.id, strategy);
    }
  }

  /**
   * Initialize consensus parameters
   */
  private initializeConsensusParameters(): void {
    const parameters: ConsensusParameters[] = [
      {
        requiredAgreement: 0.67, // 2/3 majority
        votingMethod: 'majority',
        debateTimeLimit: 120000, // 2 minutes
        proposalRequirements: {
          minSupporters: 1,
          maxProposals: 5,
          proposalComplexity: 'medium'
        },
        fallbackStrategies: ['mediation', 'arbitration']
      },
      {
        requiredAgreement: 1.0, // Unanimous
        votingMethod: 'unanimity',
        debateTimeLimit: 300000, // 5 minutes
        proposalRequirements: {
          minSupporters: 2,
          maxProposals: 3,
          proposalComplexity: 'simple'
        },
        fallbackStrategies: ['escalation']
      }
    ];

    for (const params of parameters) {
      this.consensusParameters.set(params.votingMethod, params);
    }
  }

  /**
   * Get agent trust level
   */
  private async getAgentTrustLevel(agentId: string): Promise<number> {
    if (!this.getRelationship) return 0.5; // Default trust

    const relationship = await this.getRelationship(agentId);
    return relationship?.trust.level || 0.3; // Default for unknown agents
  }

  /**
   * Get agent mental state
   */
  private async getAgentMentalState(agentId: string): Promise<MentalState | null> {
    if (!this.getMentalState) return null;

    return await this.getMentalState(agentId);
  }

  /**
   * Get agent relationship
   */
  private async getAgentRelationship(agentId: string): Promise<AgentRelationship | null> {
    if (!this.getRelationship) return null;

    return await this.getRelationship(agentId);
  }

  /**
   * Get agent skills
   */
  private async getAgentSkills(agentId: string): Promise<string[]> {
    // This would integrate with agent skill system
    // For now, return mock skills based on agent ID
    const skillMap: Record<string, string[]> = {
      'agent_001': ['communication', 'negotiation', 'diplomacy'],
      'agent_002': ['mining', 'crafting', 'building'],
      'agent_003': ['exploration', 'navigation', 'combat'],
      'agent_004': ['social', 'leadership', 'mediation'],
      'agent_005': ['analysis', 'strategy', 'arbitration']
    };

    return skillMap[agentId] || [];
  }

  /**
   * Calculate agent flexibility
   */
  private async calculateAgentFlexibility(agentId: string): Promise<number> {
    const mentalState = await this.getAgentMentalState(agentId);
    const personality = mentalState?.personality;
    
    if (!personality) return 0.5; // Default flexibility

    // Flexibility based on personality traits
    return (
      (personality.openness || 0.5) * 0.3 +
      (personality.agreeableness || 0.5) * 0.4 +
      (1 - (personality.neuroticism || 0.5)) * 0.3
    );
  }

  /**
   * Generate proposal for negotiation
   */
  private generateProposal(
    negotiation: NegotiationProcess,
    partyId: string,
    flexibility: number,
    roundNumber: number
  ): any {
    // Generate proposal based on agent's position and flexibility
    const position = negotiation.positions.find((p: any) => p.agentId === partyId);
    if (!position) return null;

    // Adjust proposal based on flexibility and round number
    const compromiseLevel = flexibility * (roundNumber / negotiation.maxRounds);
    
    return {
      agentId: partyId,
      proposal: {
        ...position.position,
        compromise: compromiseLevel,
        round: roundNumber
      },
      reasoning: `Flexibility: ${flexibility.toFixed(2)}, Round: ${roundNumber}/${negotiation.maxRounds}`
    };
  }

  /**
   * Simulate voting behavior
   */
  private async simulateVote(
    voterId: string,
    proposals: Array<{ agentId: string; proposal: any; priority: number; flexibility: number; timestamp: number }>,
    negotiation: NegotiationProcess
  ): Promise<{ agentId: string; vote: 'for' | 'against' | 'abstain'; reasoning?: string; timestamp: number }> {
    const voterPersonality = await this.getAgentMentalState(voterId);
    const voterFlexibility = await this.calculateAgentFlexibility(voterId);
    
    // Find voter's own proposal
    const ownProposal = proposals.find((p: any) => p.agentId === voterId);
    
    if (ownProposal) {
      // Vote for own proposal
      return {
        agentId: voterId,
        vote: 'for',
        reasoning: 'Support own proposal',
        timestamp: Date.now()
      };
    }

    // Evaluate other proposals based on personality and trust
    const bestProposal = proposals.reduce((best: any, current: any) => {
      const currentScore = this.evaluateProposal(current, voterPersonality, voterFlexibility);
      const bestScore = this.evaluateProposal(best, voterPersonality, voterFlexibility);
      return currentScore > bestScore ? current : best;
    });

    if (bestProposal && this.evaluateProposal(bestProposal, voterPersonality, voterFlexibility) > 0.6) {
      return {
        agentId: voterId,
        vote: 'for',
        reasoning: 'Best aligns with interests',
        timestamp: Date.now()
      };
    } else {
      return {
        agentId: voterId,
        vote: 'against',
        reasoning: 'Insufficient alignment',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Evaluate proposal for agent
   */
  private evaluateProposal(
    proposal: { agentId: string; proposal: any; priority: number; flexibility: number; timestamp: number },
    personality: any,
    flexibility: number
  ): number {
    let score = proposal.priority * 0.3; // 30% weight for priority
    
    // Add flexibility bonus
    score += proposal.flexibility * flexibility * 0.2; // 20% weight for flexibility
    
    // Add personality-based evaluation
    if (personality) {
      score += (personality.openness || 0.5) * 0.3; // Openness to new ideas
      score += (personality.agreeableness || 0.5) * 0.2; // Willingness to cooperate
    }

    return Math.min(score, 1.0); // Normalize to 0-1
  }

  /**
   * Update conflict metrics
   */
  private updateConflictMetrics(conflict: ConflictDetection, action: 'detected' | 'resolved' | 'escalated'): void {
    switch (action) {
      case 'detected':
        // Already updated in detectConflict
        break;
      case 'resolved':
        this.metrics.conflicts.resolved++;
        this.metrics.conflicts.averageResolutionTime = 
          (this.metrics.conflicts.averageResolutionTime * (this.metrics.conflicts.resolved - 1) + 
          (Date.now() - conflict.detectedAt)) / this.metrics.conflicts.resolved;
        break;
      case 'escalated':
        this.metrics.conflicts.escalated++;
        break;
    }
  }

  /**
   * Update negotiation metrics
   */
  private updateNegotiationMetrics(negotiation: NegotiationProcess, action: 'initiated' | 'round_completed' | 'completed' | 'failed'): void {
    switch (action) {
      case 'initiated':
        // Already updated in initiateNegotiation
        break;
      case 'round_completed':
        this.metrics.negotiations.averageRounds = 
          (this.metrics.negotiations.averageRounds * (this.metrics.negotiations.completed - 1) + 
          negotiation.currentRound) / Math.max(1, this.metrics.negotiations.completed);
        break;
      case 'completed':
        // Already updated in conductNegotiationRound
        break;
      case 'failed':
        this.metrics.negotiations.deadlockRate =
          (this.metrics.negotiations.deadlockRate * (this.metrics.negotiations.completed - 1) + 1) /
          Math.max(1, this.metrics.negotiations.completed);
        break;
    }
  }

  /**
   * Update mediation metrics
   */
  private updateMediationMetrics(mediation: MediationSession, action: 'offered' | 'completed' | 'failed'): void {
    switch (action) {
      case 'offered':
        // Already updated in offerMediation
        break;
      case 'completed':
        this.metrics.mediations.averageSessionTime = 
          (this.metrics.mediations.averageSessionTime * (this.metrics.mediations.completed - 1) + 
          ((mediation.completedAt || Date.now()) - mediation.createdAt)) / Math.max(1, this.metrics.mediations.completed);
        this.metrics.mediations.satisfactionRate = 
          (this.metrics.mediations.satisfactionRate * (this.metrics.mediations.completed - 1) + 
          (mediation.outcome?.satisfaction?.reduce((sum: number, s: any) => sum + s.level, 0) || 0) / mediation.parties.length) / Math.max(1, this.metrics.mediations.completed);
        this.metrics.mediations.complianceRate = 
          (this.metrics.mediations.complianceRate * (this.metrics.mediations.completed - 1) + 
          (mediation.outcome?.compliance || 0)) / Math.max(1, this.metrics.mediations.completed);
        break;
      case 'failed':
        // Update failure rate
        this.metrics.mediations.averageSessionTime = 
          (this.metrics.mediations.averageSessionTime * (this.metrics.mediations.completed + this.metrics.mediations.failed - 1) + 
          60000) / Math.max(1, this.metrics.mediations.completed);
        break;
    }
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(agentId: string): ConflictResolutionMetrics {
    return {
      agentId,
      timestamp: Date.now(),
      conflicts: {
        detected: 0,
        resolved: 0,
        mediated: 0,
        escalated: 0,
        averageResolutionTime: 0,
        successRate: 0
      },
      negotiations: {
        initiated: 0,
        completed: 0,
        averageRounds: 0,
        consensusRate: 0,
        deadlockRate: 0
      },
      mediations: {
        offered: 0,
        accepted: 0,
        completed: 0,
        averageSessionTime: 0,
        satisfactionRate: 0,
        complianceRate: 0
      },
      strategies: {
        used: [],
        successRate: 0,
        averageTime: 0
      }
    };
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Get current metrics
   */
  getMetrics(): ConflictResolutionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get active conflicts
   */
  getActiveConflicts(): ConflictDetection[] {
    return Array.from(this.activeConflicts.values());
  }

  /**
   * Get negotiation processes
   */
  getNegotiationProcesses(): NegotiationProcess[] {
    return Array.from(this.negotiationProcesses.values());
  }

  /**
   * Get mediation sessions
   */
  getMediationSessions(): MediationSession[] {
    return Array.from(this.mediationSessions.values());
  }

  /**
   * Get resolution strategies
   */
  getResolutionStrategies(): ConflictResolutionStrategy[] {
    return Array.from(this.resolutionStrategies.values());
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics(this.agentId);
  }
}