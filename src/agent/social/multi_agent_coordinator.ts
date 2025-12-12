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

import { AgentState, PersonalityTraits } from '../langgraph/interfaces';
import { AgentRelationship } from './relationship_types';
import { MentalState } from './tom_types';

// ============================================================================
// INTERFACES
// ============================================================================

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
export enum MessageType {
  SOCIAL = 'social',
  COORDINATION = 'coordination',
  EMERGENCY = 'emergency',
  COLLABORATIVE = 'collaborative',
  NEGOTIATION = 'negotiation',
  MEDIATION = 'mediation',
  TASK_DELEGATION = 'task_delegation',
  TASK_UPDATE = 'task_update',
  CONFLICT_NOTIFICATION = 'conflict_notification'
}

/**
 * Priority levels for messages and tasks
 */
export enum MessagePriority {
  CRITICAL = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
  BACKGROUND = 4
}

/**
 * Status of coordination activities
 */
export enum CoordinationStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
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

// ============================================================================
// MAIN COORDINATOR CLASS
// ============================================================================

/**
 * Multi-Agent Coordinator
 * 
 * Central coordinator for managing agent-to-agent interactions,
 * collaborative planning, and conflict resolution.
 */
export class MultiAgentCoordinator {
  private agentId: string;
  private config: MultiAgentCoordinatorConfig;
  private metrics: CoordinationMetrics;
  private messageQueue: Map<string, CoordinationMessage[]>;
  private activeCollaborations: Map<string, CollaborationRequest>;
  private activeDelegations: Map<string, TaskDelegation>;
  private activeConflicts: Map<string, ConflictDetection>;
  private activeNegotiations: Map<string, NegotiationProcess>;
  private activeMediations: Map<string, MediationProcess>;
  private messageCache: Map<string, CoordinationMessage>;
  private bandwidthUsage: number;
  private lastBandwidthReset: number;

  constructor(
    agentId: string,
    config: Partial<MultiAgentCoordinatorConfig> = {},
    private getRelationship?: (targetId: string) => Promise<AgentRelationship | null>,
    private getMentalState?: (targetId: string) => Promise<MentalState | null>,
    private predictIntention?: (targetId: string, context: any) => Promise<any>
  ) {
    this.agentId = agentId;
    this.config = this.createDefaultConfig(config);
    this.metrics = this.initializeMetrics(agentId);
    this.messageQueue = new Map();
    this.activeCollaborations = new Map();
    this.activeDelegations = new Map();
    this.activeConflicts = new Map();
    this.activeNegotiations = new Map();
    this.activeMediations = new Map();
    this.messageCache = new Map();
    this.bandwidthUsage = 0;
    this.lastBandwidthReset = Date.now();
  }

  // ============================================================================
  // CONFIGURATION AND INITIALIZATION
  // ============================================================================

  /**
   * Create default configuration
   */
  private createDefaultConfig(config: Partial<MultiAgentCoordinatorConfig>): MultiAgentCoordinatorConfig {
    return {
      maxMessagesPerSecond: 10,
      maxBandwidthUsage: 1024 * 1024, // 1MB per second
      trustThresholds: {
        minTrustForCommunication: 0.3,
        minTrustForCollaboration: 0.5,
        minTrustForDelegation: 0.7,
        minTrustForMediation: 0.8
      },
      performance: {
        enableBatching: true,
        batchSize: 10,
        batchTimeoutMs: 100,
        enableCaching: true,
        cacheMaxAge: 30000 // 30 seconds
      },
      conflictResolution: {
        enableNegotiation: true,
        enableMediation: true,
        maxNegotiationRounds: 5,
        mediationTimeoutMs: 30000 // 30 seconds
      },
      ...config
    };
  }

  /**
   * Initialize metrics for agent
   */
  private initializeMetrics(agentId: string): CoordinationMetrics {
    return {
      agentId,
      timestamp: Date.now(),
      messages: {
        sent: 0,
        received: 0,
        delivered: 0,
        failed: 0,
        averageLatency: 0
      },
      collaborations: {
        initiated: 0,
        participated: 0,
        completed: 0,
        successRate: 0
      },
      conflicts: {
        detected: 0,
        resolved: 0,
        mediated: 0,
        averageResolutionTime: 0
      },
      performance: {
        bandwidthUsage: 0,
        processingTime: 0,
        cacheHitRate: 0,
        batchEfficiency: 0
      }
    };
  }

  // ============================================================================
  // COMMUNICATION PROTOCOLS
  // ============================================================================

  /**
   * Send message to specific agent
   */
  async sendMessage(
    targetId: string,
    type: MessageType,
    content: any,
    priority: MessagePriority = MessagePriority.MEDIUM,
    requiresResponse: boolean = false,
    responseTo?: string
  ): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // Check bandwidth availability
      if (!this.checkBandwidthAvailability()) {
        console.warn(`[MULTI_AGENT_COORDINATOR] Bandwidth limit exceeded for message to ${targetId}`);
        return false;
      }

      // Check trust level for communication
      const trustLevel = await this.getTrustLevel(targetId);
      if (trustLevel < this.config.trustThresholds.minTrustForCommunication) {
        console.warn(`[MULTI_AGENT_COORDINATOR] Insufficient trust for communication with ${targetId}`);
        return false;
      }

      // Create message
      const message: CoordinationMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        priority,
        senderId: this.agentId,
        targetId,
        content,
        timestamp: Date.now(),
        requiresResponse,
        responseTo,
        delivered: false,
        read: false
      };

      // Cache message if enabled
      if (this.config.performance.enableCaching) {
        this.messageCache.set(message.id, message);
      }

      // Update bandwidth usage
      this.updateBandwidthUsage(1);

      // Deliver message
      const delivered = await this.deliverMessage(message);
      
      // Update metrics
      this.updateMessageMetrics(message, delivered, Date.now() - startTime);

      return delivered;

    } catch (error) {
      console.error(`[MULTI_AGENT_COORDINATOR] Error sending message to ${targetId}:`, error);
      this.metrics.messages.failed++;
      return false;
    }
  }

  /**
   * Broadcast message to multiple agents
   */
  async broadcastMessage(
    targetIds: string[],
    type: MessageType,
    content: any,
    priority: MessagePriority = MessagePriority.MEDIUM
  ): Promise<number> {
    const startTime = Date.now();
    
    try {
      // Check bandwidth availability for all messages
      const totalBandwidth = targetIds.length;
      if (!this.checkBandwidthAvailability(totalBandwidth)) {
        console.warn(`[MULTI_AGENT_COORDINATOR] Insufficient bandwidth for broadcast to ${targetIds.length} agents`);
        return 0;
      }

      // Create messages
      const messages: CoordinationMessage[] = targetIds.map(targetId => ({
        id: `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        priority,
        senderId: this.agentId,
        targetId,
        content,
        timestamp: Date.now(),
        requiresResponse: false,
        delivered: false,
        read: false
      }));

      // Update bandwidth usage
      this.updateBandwidthUsage(totalBandwidth);

      // Deliver messages
      const deliveryPromises = messages.map(message => this.deliverMessage(message));
      const deliveryResults = await Promise.allSettled(deliveryPromises);
      const successfulDeliveries = deliveryResults.filter(result => result.status === 'fulfilled').length;

      // Update metrics
      this.updateBroadcastMetrics(messages, successfulDeliveries, Date.now() - startTime);

      return successfulDeliveries;

    } catch (error) {
      console.error(`[MULTI_AGENT_COORDINATOR] Error broadcasting message:`, error);
      return 0;
    }
  }

  // ============================================================================
  // COLLABORATIVE PLANNING
  // ============================================================================

  /**
   * Form collaborative goal with other agents
   */
  async formCollaborativeGoal(
    type: string,
    title: string,
    description: string,
    priority: MessagePriority = MessagePriority.MEDIUM,
    requiredAgents: number = 2,
    requirements: CollaborationRequest['requirements']
  ): Promise<string | null> {
    const startTime = Date.now();
    
    try {
      // Create collaboration request
      const collaboration: CollaborationRequest = {
        id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        title,
        description,
        priority,
        initiatorId: this.agentId,
        targetIds: [], // Will be populated with potential collaborators
        requirements: {
          minParticipants: requiredAgents,
          maxParticipants: requiredAgents + 2,
          requiredSkills: requirements.requiredSkills || [],
          minTrustLevel: requirements.minTrustLevel || this.config.trustThresholds.minTrustForCollaboration,
          resources: requirements.resources || []
        },
        status: CoordinationStatus.PENDING,
        participants: [this.agentId],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Identify potential collaborators
      const potentialCollaborators = await this.identifyPotentialCollaborators(collaboration);
      
      if (potentialCollaborators.length < requiredAgents - 1) {
        console.warn(`[MULTI_AGENT_COORDINATOR] Insufficient potential collaborators for ${title}`);
        return null;
      }

      // Send invitations
      const invitations = potentialCollaborators.slice(0, requiredAgents - 1);
      const invitationPromises = invitations.map(agentId => 
        this.sendCollaborationInvitation(collaboration, agentId)
      );

      const invitationResults = await Promise.allSettled(invitationPromises);
      const successfulInvitations = invitationResults.filter(result => 
        result.status === 'fulfilled' && result.value
      ).length;

      if (successfulInvitations < requiredAgents - 1) {
        collaboration.status = CoordinationStatus.FAILED;
        console.warn(`[MULTI_AGENT_COORDINATOR] Insufficient acceptances for collaboration ${title}`);
        return null;
      }

      // Update collaboration with accepted participants
      collaboration.status = CoordinationStatus.ACTIVE;
      collaboration.participants = [this.agentId, ...invitations.slice(0, successfulInvitations).map((_, index) => potentialCollaborators[index])];
      collaboration.updatedAt = Date.now();

      // Store active collaboration
      this.activeCollaborations.set(collaboration.id, collaboration);

      // Update metrics
      this.updateCollaborationMetrics(collaboration, successfulInvitations, Date.now() - startTime);

      console.log(`[MULTI_AGENT_COORDINATOR] Collaboration ${collaboration.id} formed: ${successfulInvitations}/${requiredAgents-1} invitations accepted`);
      return collaboration.id;

    } catch (error) {
      console.error(`[MULTI_AGENT_COORDINATOR] Error forming collaborative goal:`, error);
      return null;
    }
  }

  /**
   * Delegate task to another agent
   */
  async delegateTask(
    delegateeId: string,
    taskId: string,
    title: string,
    description: string,
    priority: MessagePriority = MessagePriority.MEDIUM,
    requirements: TaskDelegation['requirements'],
    deadline?: number
  ): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // Check trust level for delegation
      const trustLevel = await this.getTrustLevel(delegateeId);
      const minTrustForDelegation = requirements.trustLevel || this.config.trustThresholds.minTrustForCollaboration;
      
      if (trustLevel < minTrustForDelegation) {
        console.warn(`[MULTI_AGENT_COORDINATOR] Insufficient trust for task delegation to ${delegateeId}`);
        return false;
      }
      
      // Check delegatee capacity
      if (!await this.checkDelegateeCapacity(delegateeId, requirements)) {
        console.warn(`[MULTI_AGENT_COORDINATOR] Delegatee ${delegateeId} lacks capacity for task`);
        return false;
      }
      
      // Create task delegation
      const delegation: TaskDelegation = {
        id: `delegation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        delegatorId: this.agentId,
        delegateeId: delegateeId,
        taskId,
        title,
        description,
        priority,
        requirements,
        deadline,
        status: CoordinationStatus.PENDING,
        progress: { percentage: 0, completedSteps: [], blockers: [] },
        feedback: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Send delegation request
      const accepted = await this.sendTaskDelegationRequest(delegation);
      
      if (accepted) {
        delegation.status = CoordinationStatus.ACTIVE;
        this.activeDelegations.set(delegation.id, delegation);
        
        // Update metrics
        this.updateDelegationMetrics(delegation, true, Date.now() - startTime);
        
        console.log(`[MULTI_AGENT_COORDINATOR] Task ${taskId} delegated to ${delegateeId}`);
        return true;
      } else {
        delegation.status = CoordinationStatus.FAILED;
        this.updateDelegationMetrics(delegation, false, Date.now() - startTime);
        return false;
      }

    } catch (error) {
      console.error(`[MULTI_AGENT_COORDINATOR] Error delegating task:`, error);
      return false;
    }
  }

  // ============================================================================
  // CONFLICT RESOLUTION
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

      console.log(`[MULTI_AGENT_COORDINATOR] Conflict detected: ${type} between ${parties.join(', ')}`);

      // Attempt automatic resolution if possible
      if (severity === 'low' || severity === 'medium') {
        const resolved = await this.attemptAutomaticResolution(conflict);
        if (resolved) {
          return conflict.id;
        }
      }

      // Initiate negotiation if enabled
      if (this.config.conflictResolution.enableNegotiation) {
        await this.initiateNegotiation(conflict);
      }

      return conflict.id;

    } catch (error) {
      console.error(`[MULTI_AGENT_COORDINATOR] Error detecting conflict:`, error);
      return null;
    }
  }

  /**
   * Mediate conflict between agents
   */
  async mediateConflict(
    conflictId: string,
    parties: string[],
    proposedTerms: Array<{ agentId: string; terms: any }>
  ): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // Check if agent can mediate (high trust required)
      const canMediate = await this.checkMediationEligibility(parties);
      if (!canMediate) {
        console.warn(`[MULTI_AGENT_COORDINATOR] Insufficient trust to mediate conflict`);
        return false;
      }

      // Create mediation process
      const mediation: MediationProcess = {
        id: `mediation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mediatorId: this.agentId,
        conflictId,
        parties,
        terms: proposedTerms.map(term => ({
          ...term,
          acceptance: false
        })),
        status: CoordinationStatus.ACTIVE,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deadline: Date.now() + this.config.conflictResolution.mediationTimeoutMs
      };

      // Store mediation
      this.activeMediations.set(mediation.id, mediation);

      // Send mediation requests to all parties
      const mediationPromises = parties.map(async (agentId) => {
        const terms = proposedTerms.find(t => t.agentId === agentId);
        return await this.sendMediationRequest(mediation, agentId, terms?.terms);
      });

      const mediationResults = await Promise.allSettled(mediationPromises);
      const acceptances = mediationResults.filter(result => 
        result.status === 'fulfilled' && result.value
      ).length;

      // Check if all parties accepted
      if (acceptances === parties.length) {
        mediation.status = CoordinationStatus.COMPLETED;
        mediation.completedAt = Date.now();
        mediation.outcome = {
          resolution: 'mediated_agreement',
          satisfaction: new Array(parties.length).fill(0.8), // Assume good satisfaction
          enforcement: 'voluntary_compliance'
        };

        // Update metrics
        this.updateMediationMetrics(mediation, true, Date.now() - startTime);

        console.log(`[MULTI_AGENT_COORDINATOR] Conflict ${conflictId} successfully mediated`);
        return true;
      } else {
        mediation.status = CoordinationStatus.FAILED;
        this.updateMediationMetrics(mediation, false, Date.now() - startTime);
        return false;
      }

    } catch (error) {
      console.error(`[MULTI_AGENT_COORDINATOR] Error mediating conflict:`, error);
      return false;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get trust level for target agent
   */
  private async getTrustLevel(targetId: string): Promise<number> {
    if (!this.getRelationship) {
      return 0.5; // Default trust level
    }

    const relationship = await this.getRelationship(targetId);
    if (!relationship) {
      return 0.3; // Default for unknown agents
    }

    return relationship.trust.level;
  }

  /**
   * Check bandwidth availability
   */
  private checkBandwidthAvailability(requiredBandwidth: number = 1): boolean {
    const now = Date.now();
    
    // Reset bandwidth usage every second
    if (now - this.lastBandwidthReset > 1000) {
      this.bandwidthUsage = 0;
      this.lastBandwidthReset = now;
    }

    return (this.bandwidthUsage + requiredBandwidth) <= this.config.maxBandwidthUsage;
  }

  /**
   * Update bandwidth usage
   */
  private updateBandwidthUsage(usage: number): void {
    this.bandwidthUsage += usage;
    this.metrics.performance.bandwidthUsage = this.bandwidthUsage;
  }

  /**
   * Calculate message urgency
   */
  private calculateUrgency(type: MessageType, priority: MessagePriority): number {
    const baseUrgency = {
      [MessageType.EMERGENCY]: 1.0,
      [MessageType.CONFLICT_NOTIFICATION]: 0.9,
      [MessageType.COORDINATION]: 0.7,
      [MessageType.TASK_DELEGATION]: 0.6,
      [MessageType.COLLABORATIVE]: 0.5,
      [MessageType.NEGOTIATION]: 0.4,
      [MessageType.MEDIATION]: 0.3,
      [MessageType.SOCIAL]: 0.2
    };

    const priorityMultiplier = {
      [MessagePriority.CRITICAL]: 1.5,
      [MessagePriority.HIGH]: 1.2,
      [MessagePriority.MEDIUM]: 1.0,
      [MessagePriority.LOW]: 0.8,
      [MessagePriority.BACKGROUND]: 0.5
    };

    return (baseUrgency[type] || 0.5) * (priorityMultiplier[priority] || 1.0);
  }

  /**
   * Calculate message importance
   */
  private calculateImportance(type: MessageType, priority: MessagePriority): number {
    const baseImportance = {
      [MessageType.EMERGENCY]: 1.0,
      [MessageType.CONFLICT_NOTIFICATION]: 0.8,
      [MessageType.COORDINATION]: 0.7,
      [MessageType.TASK_DELEGATION]: 0.6,
      [MessageType.COLLABORATIVE]: 0.5,
      [MessageType.NEGOTIATION]: 0.4,
      [MessageType.MEDIATION]: 0.3,
      [MessageType.SOCIAL]: 0.2
    };

    const priorityMultiplier = {
      [MessagePriority.CRITICAL]: 1.5,
      [MessagePriority.HIGH]: 1.2,
      [MessagePriority.MEDIUM]: 1.0,
      [MessagePriority.LOW]: 0.8,
      [MessagePriority.BACKGROUND]: 0.5
    };

    return (baseImportance[type] || 0.5) * (priorityMultiplier[priority] || 1.0);
  }

  /**
   * Check if message type requires response
   */
  private requiresResponse(type: MessageType): boolean {
    return [
      MessageType.COORDINATION,
      MessageType.COLLABORATIVE,
      MessageType.NEGOTIATION,
      MessageType.MEDIATION,
      MessageType.TASK_DELEGATION
    ].includes(type);
  }

  /**
   * Deliver message to target agent
   */
  private async deliverMessage(message: CoordinationMessage): Promise<boolean> {
    // This would integrate with the actual message delivery system
    // For now, simulate successful delivery
    message.delivered = true;
    message.processingTime = Math.random() * 50 + 10; // 10-60ms processing time
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, message.processingTime));
    
    return true;
  }

  /**
   * Update message metrics
   */
  private updateMessageMetrics(message: CoordinationMessage, delivered: boolean, processingTime: number): void {
    this.metrics.messages.sent++;
    
    if (delivered) {
      this.metrics.messages.delivered++;
    } else {
      this.metrics.messages.failed++;
    }

    // Update average latency
    const totalLatency = this.metrics.messages.averageLatency * (this.metrics.messages.delivered - 1) + processingTime;
    this.metrics.messages.averageLatency = totalLatency / this.metrics.messages.delivered;
  }

  /**
   * Update broadcast metrics
   */
  private updateBroadcastMetrics(messages: CoordinationMessage[], successfulDeliveries: number, totalTime: number): void {
    this.metrics.messages.sent += messages.length;
    this.metrics.messages.delivered += successfulDeliveries;
    this.metrics.messages.failed += messages.length - successfulDeliveries;
  }

  /**
   * Identify potential collaborators for a task
   */
  private async identifyPotentialCollaborators(collaboration: CollaborationRequest): Promise<string[]> {
    // This would integrate with agent discovery system
    // For now, return mock list of agents
    const allAgents = ['agent_001', 'agent_002', 'agent_003', 'agent_004', 'agent_005'];
    const potentialAgents: string[] = [];

    for (const agentId of allAgents) {
      if (agentId === this.agentId) continue;

      const trustLevel = await this.getTrustLevel(agentId);
      if (trustLevel >= collaboration.requirements.minTrustLevel) {
        potentialAgents.push(agentId);
      }
    }

    return potentialAgents;
  }

  /**
   * Send collaboration invitation
   */
  private async sendCollaborationInvitation(collaboration: CollaborationRequest, agentId: string): Promise<boolean> {
    const invitationMessage = {
      type: MessageType.COLLABORATIVE,
      priority: collaboration.priority,
      content: {
        collaborationId: collaboration.id,
        type: collaboration.type,
        title: collaboration.title,
        description: collaboration.description,
        requirements: collaboration.requirements
      }
    };

    return await this.sendMessage(agentId, invitationMessage.type, invitationMessage.content, invitationMessage.priority);
  }

  /**
   * Update collaboration metrics
   */
  private updateCollaborationMetrics(collaboration: CollaborationRequest, invitations: number, totalTime: number): void {
    this.metrics.collaborations.initiated++;
    this.metrics.collaborations.participated++;
    
    if (collaboration.status === CoordinationStatus.ACTIVE) {
      this.metrics.collaborations.completed++;
    }
  }

  /**
   * Check delegatee capacity
   */
  private async checkDelegateeCapacity(delegateeId: string, requirements: TaskDelegation['requirements']): Promise<boolean> {
    // This would integrate with agent capacity monitoring
    // For now, assume capacity is available
    return true;
  }

  /**
   * Send task delegation request
   */
  private async sendTaskDelegationRequest(delegation: TaskDelegation): Promise<boolean> {
    const delegationMessage = {
      type: MessageType.TASK_DELEGATION,
      priority: delegation.priority,
      content: {
        delegationId: delegation.id,
        taskId: delegation.taskId,
        title: delegation.title,
        description: delegation.description,
        requirements: delegation.requirements,
        deadline: delegation.deadline
      }
    };

    return await this.sendMessage(delegation.delegateeId, delegationMessage.type, delegationMessage.content, delegationMessage.priority);
  }

  /**
   * Update delegation metrics
   */
  private updateDelegationMetrics(delegation: TaskDelegation, accepted: boolean, totalTime: number): void {
    // Update delegation-specific metrics
    if (accepted) {
      console.log(`[MULTI_AGENT_COORDINATOR] Task delegation accepted: ${delegation.taskId}`);
    } else {
      console.log(`[MULTI_AGENT_COORDINATOR] Task delegation rejected: ${delegation.taskId}`);
    }
  }

  /**
   * Attempt automatic conflict resolution
   */
  private async attemptAutomaticResolution(conflict: ConflictDetection): Promise<boolean> {
    // Simple automatic resolution for low-severity conflicts
    if (conflict.severity === 'low') {
      conflict.status = CoordinationStatus.COMPLETED;
      this.metrics.conflicts.resolved++;
      return true;
    }

    return false;
  }

  /**
   * Initiate negotiation for conflict
   */
  private async initiateNegotiation(conflict: ConflictDetection): Promise<void> {
    const negotiation: NegotiationProcess = {
      id: `negotiation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'conflict_resolution',
      parties: conflict.parties,
      topic: conflict.description,
      positions: [], // Will be populated by participants
      status: CoordinationStatus.ACTIVE,
      currentRound: 1,
      maxRounds: this.config.conflictResolution.maxNegotiationRounds,
      deadline: Date.now() + this.config.conflictResolution.mediationTimeoutMs,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.activeNegotiations.set(negotiation.id, negotiation);
  }

  /**
   * Check mediation eligibility
   */
  private async checkMediationEligibility(parties: string[]): Promise<boolean> {
    const minTrustForMediation = this.config.trustThresholds.minTrustForMediation;

    for (const partyId of parties) {
      const trustLevel = await this.getTrustLevel(partyId);
      if (trustLevel < minTrustForMediation) {
        return false;
      }
    }

    return true;
  }

  /**
   * Send mediation request
   */
  private async sendMediationRequest(mediation: MediationProcess, agentId: string, terms: any): Promise<boolean> {
    const mediationMessage = {
      type: MessageType.MEDIATION,
      priority: MessagePriority.HIGH,
      content: {
        mediationId: mediation.id,
        conflictId: mediation.conflictId,
        terms,
        deadline: mediation.deadline || (Date.now() + this.config.conflictResolution.mediationTimeoutMs)
      }
    };

    return await this.sendMessage(agentId, mediationMessage.type, mediationMessage.content, mediationMessage.priority);
  }

  /**
   * Update mediation metrics
   */
  private updateMediationMetrics(mediation: MediationProcess, successful: boolean, totalTime: number): void {
    this.metrics.conflicts.mediated++;
    
    if (successful) {
      this.metrics.conflicts.resolved++;
      
      // Update average resolution time
      const totalResolutionTime = this.metrics.conflicts.averageResolutionTime * (this.metrics.conflicts.resolved - 1) + totalTime;
      this.metrics.conflicts.averageResolutionTime = totalResolutionTime / this.metrics.conflicts.resolved;
    }
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get current metrics
   */
  getMetrics(): CoordinationMetrics {
    return { ...this.metrics };
  }

  /**
   * Get active collaborations
   */
  getActiveCollaborations(): CollaborationRequest[] {
    return Array.from(this.activeCollaborations.values());
  }

  /**
   * Get active delegations
   */
  getActiveDelegations(): TaskDelegation[] {
    return Array.from(this.activeDelegations.values());
  }

  /**
   * Get active conflicts
   */
  getActiveConflicts(): ConflictDetection[] {
    return Array.from(this.activeConflicts.values());
  }

  /**
   * Get active negotiations
   */
  getActiveNegotiations(): NegotiationProcess[] {
    return Array.from(this.activeNegotiations.values());
  }

  /**
   * Get active mediations
   */
  getActiveMediations(): MediationProcess[] {
    return Array.from(this.activeMediations.values());
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MultiAgentCoordinatorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics(this.agentId);
  }
}

// ============================================================================
// FACTORY CLASS
// ============================================================================

/**
 * Factory for creating multi-agent coordinators
 */
export class MultiAgentCoordinatorFactory {
  /**
   * Create coordinator with default configuration
   */
  static createDefault(
    agentId: string,
    getRelationship?: (targetId: string) => Promise<AgentRelationship | null>,
    getMentalState?: (targetId: string) => Promise<MentalState | null>,
    predictIntention?: (targetId: string, context: any) => Promise<any>
  ): MultiAgentCoordinator {
    return new MultiAgentCoordinator(agentId, {}, getRelationship, getMentalState, predictIntention);
  }

  /**
   * Create coordinator for high-performance scenarios
   */
  static createHighPerformance(
    agentId: string,
    getRelationship?: (targetId: string) => Promise<AgentRelationship | null>,
    getMentalState?: (targetId: string) => Promise<MentalState | null>,
    predictIntention?: (targetId: string, context: any) => Promise<any>
  ): MultiAgentCoordinator {
    const config: Partial<MultiAgentCoordinatorConfig> = {
      maxMessagesPerSecond: 20,
      maxBandwidthUsage: 2 * 1024 * 1024, // 2MB per second
      performance: {
        enableBatching: true,
        batchSize: 20,
        batchTimeoutMs: 50,
        enableCaching: true,
        cacheMaxAge: 60000 // 1 minute
      }
    };

    return new MultiAgentCoordinator(agentId, config, getRelationship, getMentalState, predictIntention);
  }

  /**
   * Create coordinator for resource-constrained scenarios
   */
  static createResourceConstrained(
    agentId: string,
    getRelationship?: (targetId: string) => Promise<AgentRelationship | null>,
    getMentalState?: (targetId: string) => Promise<MentalState | null>,
    predictIntention?: (targetId: string, context: any) => Promise<any>
  ): MultiAgentCoordinator {
    const config: Partial<MultiAgentCoordinatorConfig> = {
      maxMessagesPerSecond: 5,
      maxBandwidthUsage: 512 * 1024, // 512KB per second
      performance: {
        enableBatching: true,
        batchSize: 5,
        batchTimeoutMs: 200,
        enableCaching: false,
        cacheMaxAge: 15000 // 15 seconds
      }
    };

    return new MultiAgentCoordinator(agentId, config, getRelationship, getMentalState, predictIntention);
  }
}