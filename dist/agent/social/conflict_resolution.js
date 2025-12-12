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
import { CoordinationStatus } from './multi_agent_coordinator';
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
    getRelationship;
    getMentalState;
    sendMessage;
    agentId;
    activeConflicts;
    negotiationProcesses;
    mediationSessions;
    resolutionStrategies;
    consensusParameters;
    metrics;
    constructor(agentId, getRelationship, getMentalState, sendMessage) {
        this.getRelationship = getRelationship;
        this.getMentalState = getMentalState;
        this.sendMessage = sendMessage;
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
    async detectConflict(type, parties, description, context, severity = 'medium') {
        try {
            // Check if conflict already exists
            const existingConflict = this.findExistingConflict(parties);
            if (existingConflict) {
                console.log(`[CONFLICT_RESOLUTION] Existing conflict found: ${existingConflict.id}`);
                return existingConflict.id;
            }
            // Create new conflict detection
            const conflict = {
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
        }
        catch (error) {
            console.error(`[CONFLICT_RESOLUTION] Error detecting conflict:`, error);
            return null;
        }
    }
    /**
     * Find existing conflict between parties
     */
    findExistingConflict(parties) {
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
    async analyzeConflictSeverity(type, parties, context) {
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
            }
            else if (parties.length > 2) {
                severity = severity === 'low' ? 'medium' : severity;
            }
            // Adjust based on trust levels between parties
            const trustLevels = await Promise.all(parties.map(partyId => this.getAgentTrustLevel(partyId)));
            const averageTrust = trustLevels.reduce((sum, trust) => sum + trust, 0) / trustLevels.length;
            if (averageTrust < 0.3) {
                severity = severity === 'high' ? 'critical' : 'high';
            }
            else if (averageTrust < 0.6) {
                severity = severity === 'low' ? 'medium' : severity;
            }
            // Adjust based on context factors
            if (context && context.resourceScarcity) {
                severity = severity === 'low' ? 'medium' : severity === 'medium' ? 'high' : 'critical';
            }
            return severity;
        }
        catch (error) {
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
    async initiateNegotiation(conflictId, parties, topic, initialPositions) {
        try {
            const conflict = this.activeConflicts.get(conflictId);
            if (!conflict) {
                console.warn(`[CONFLICT_RESOLUTION] Conflict ${conflictId} not found`);
                return null;
            }
            // Create negotiation process
            const negotiation = {
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
        }
        catch (error) {
            console.error(`[CONFLICT_RESOLUTION] Error initiating negotiation:`, error);
            return null;
        }
    }
    /**
     * Conduct negotiation round
     */
    async conductNegotiationRound(negotiationId, roundNumber) {
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
            const round = {
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
        }
        catch (error) {
            console.error(`[CONFLICT_RESOLUTION] Error conducting negotiation round:`, error);
            return null;
        }
    }
    /**
     * Gather proposals for negotiation round
     */
    async gatherProposals(negotiation, roundNumber) {
        const proposals = [];
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
    async conductVoting(negotiation, proposals) {
        const votes = [];
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
    analyzeRoundOutcome(proposals, votes) {
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
    calculateConsensusLevel(votes, totalParties) {
        const agreementVotes = votes.filter(v => v.vote === 'for').length;
        return agreementVotes / totalParties;
    }
    // ============================================================================
    // MEDIATION SYSTEMS
    // ============================================================================
    /**
     * Offer mediation for conflict
     */
    async offerMediation(conflictId, mediatorId = this.agentId) {
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
            const mediation = {
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
        }
        catch (error) {
            console.error(`[CONFLICT_RESOLUTION] Error offering mediation:`, error);
            return null;
        }
    }
    /**
     * Conduct mediation session
     */
    async conductMediation(mediationId) {
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
            }
            else {
                mediation.status = CoordinationStatus.FAILED;
                this.updateMediationMetrics(mediation, 'failed');
                console.log(`[CONFLICT_RESOLUTION] Mediation ${mediationId} failed to reach agreement`);
                return false;
            }
        }
        catch (error) {
            console.error(`[CONFLICT_RESOLUTION] Error conducting mediation:`, error);
            return false;
        }
    }
    /**
     * Check mediation eligibility
     */
    async checkMediationEligibility(conflict, mediatorId) {
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
    async gatherMediationPositions(mediation) {
        const positions = [];
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
    async facilitateMediationNegotiation(mediation, initialPositions) {
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
                const agreedProposal = proposals.find((p) => votes.some((v) => v.vote === 'for' && v.agentId === p.agentId));
                return true;
            }
            // Try to facilitate compromise if no clear agreement
            const compromiseProposal = await this.generateCompromiseProposal(mediation, initialPositions, votes);
            if (compromiseProposal) {
                const compromiseVotes = await this.conductMediationVoting(mediation, [compromiseProposal]);
                if (compromiseVotes.filter((v) => v.vote === 'for').length > totalVotes / 2) {
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            console.error(`[CONFLICT_RESOLUTION] Error facilitating mediation negotiation:`, error);
            return false;
        }
    }
    /**
     * Generate mediation proposals
     */
    async generateMediationProposals(mediation, positions) {
        // Generate compromise proposals based on positions
        const proposals = [];
        // Simple compromise: average of positions
        const avgInflexibility = positions.reduce((sum, p) => sum + p.inflexibility, 0) / positions.length;
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
    async generateCompromiseProposal(mediation, positions, votes) {
        // Analyze voting patterns to identify compromise opportunity
        const highInflexibilityParties = positions.filter((p) => p.inflexibility > 0.7);
        const lowInflexibilityParties = positions.filter((p) => p.inflexibility < 0.4);
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
    async conductMediationVoting(mediation, proposals) {
        const votes = [];
        for (const partyId of mediation.parties) {
            const partyPosition = mediation.parties.find((p) => p.agentId === partyId);
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
            const bestProposal = proposals.reduce((best, current) => {
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
    evaluateMediationProposal(proposal, partyPosition) {
        let score = 0.5; // Base score
        // Add evaluation based on proposal type
        if (proposal.type === 'compromise') {
            score += 0.3; // Compromise proposals get bonus
        }
        else if (proposal.type === 'flexible') {
            score += 0.2; // Flexible proposals get moderate bonus
        }
        else if (proposal.type === 'structured') {
            score += 0.4; // Structured proposals get high bonus
        }
        return Math.min(score, 1.0);
    }
    /**
     * Calculate satisfaction levels
     */
    async calculateSatisfactionLevels(parties) {
        const satisfaction = [];
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
    initializeResolutionStrategies() {
        const strategies = [
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
    initializeConsensusParameters() {
        const parameters = [
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
    async getAgentTrustLevel(agentId) {
        if (!this.getRelationship)
            return 0.5; // Default trust
        const relationship = await this.getRelationship(agentId);
        return relationship?.trust.level || 0.3; // Default for unknown agents
    }
    /**
     * Get agent mental state
     */
    async getAgentMentalState(agentId) {
        if (!this.getMentalState)
            return null;
        return await this.getMentalState(agentId);
    }
    /**
     * Get agent relationship
     */
    async getAgentRelationship(agentId) {
        if (!this.getRelationship)
            return null;
        return await this.getRelationship(agentId);
    }
    /**
     * Get agent skills
     */
    async getAgentSkills(agentId) {
        // This would integrate with agent skill system
        // For now, return mock skills based on agent ID
        const skillMap = {
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
    async calculateAgentFlexibility(agentId) {
        const mentalState = await this.getAgentMentalState(agentId);
        const personality = mentalState?.personality;
        if (!personality)
            return 0.5; // Default flexibility
        // Flexibility based on personality traits
        return ((personality.openness || 0.5) * 0.3 +
            (personality.agreeableness || 0.5) * 0.4 +
            (1 - (personality.neuroticism || 0.5)) * 0.3);
    }
    /**
     * Generate proposal for negotiation
     */
    generateProposal(negotiation, partyId, flexibility, roundNumber) {
        // Generate proposal based on agent's position and flexibility
        const position = negotiation.positions.find((p) => p.agentId === partyId);
        if (!position)
            return null;
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
    async simulateVote(voterId, proposals, negotiation) {
        const voterPersonality = await this.getAgentMentalState(voterId);
        const voterFlexibility = await this.calculateAgentFlexibility(voterId);
        // Find voter's own proposal
        const ownProposal = proposals.find((p) => p.agentId === voterId);
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
        const bestProposal = proposals.reduce((best, current) => {
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
        }
        else {
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
    evaluateProposal(proposal, personality, flexibility) {
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
    updateConflictMetrics(conflict, action) {
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
    updateNegotiationMetrics(negotiation, action) {
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
    updateMediationMetrics(mediation, action) {
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
                        (mediation.outcome?.satisfaction?.reduce((sum, s) => sum + s.level, 0) || 0) / mediation.parties.length) / Math.max(1, this.metrics.mediations.completed);
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
    initializeMetrics(agentId) {
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
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get active conflicts
     */
    getActiveConflicts() {
        return Array.from(this.activeConflicts.values());
    }
    /**
     * Get negotiation processes
     */
    getNegotiationProcesses() {
        return Array.from(this.negotiationProcesses.values());
    }
    /**
     * Get mediation sessions
     */
    getMediationSessions() {
        return Array.from(this.mediationSessions.values());
    }
    /**
     * Get resolution strategies
     */
    getResolutionStrategies() {
        return Array.from(this.resolutionStrategies.values());
    }
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = this.initializeMetrics(this.agentId);
    }
}
//# sourceMappingURL=conflict_resolution.js.map