/**
 * Communication Protocols for Multi-Agent Coordination
 *
 * This module provides low-level communication protocols including message routing,
 * prioritization, bandwidth management, and delivery guarantees.
 *
 * Key Features:
 * - Message routing with priority queues
 * - Bandwidth management and throttling
 * - Message delivery guarantees and retries
 * - Network topology awareness
 * - Security and authentication
 */
import { MessagePriority, CoordinationMessage, CoordinationMetrics } from './multi_agent_coordinator';
import { AgentRelationship } from './relationship_types';
/**
 * Network topology information
 */
export interface NetworkTopology {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
    routingTable: Map<string, string[]>;
    updateTimestamp: number;
}
/**
 * Network node representation
 */
export interface NetworkNode {
    id: string;
    address: string;
    port: number;
    capabilities: string[];
    trustLevel: number;
    lastSeen: number;
    status: 'online' | 'offline' | 'busy' | 'error';
}
/**
 * Network edge representation
 */
export interface NetworkEdge {
    from: string;
    to: string;
    weight: number;
    bandwidth: number;
    latency: number;
    reliability: number;
}
/**
 * Message routing information
 */
export interface RoutingInfo {
    path: string[];
    nextHop: string;
    estimatedLatency: number;
    reliability: number;
    cost: number;
}
/**
 * Bandwidth allocation
 */
export interface BandwidthAllocation {
    totalBandwidth: number;
    usedBandwidth: number;
    reservedBandwidth: number;
    availableBandwidth: number;
    allocations: Map<string, number>;
    lastReset: number;
}
/**
 * Message delivery status
 */
export interface DeliveryStatus {
    messageId: string;
    status: 'pending' | 'in_transit' | 'delivered' | 'failed' | 'timeout';
    attempts: number;
    lastAttempt: number;
    nextRetry: number;
    route?: RoutingInfo;
}
/**
 * Communication security context
 */
export interface SecurityContext {
    encryptionEnabled: boolean;
    authenticationRequired: boolean;
    signatureVerified: boolean;
    trustLevel: number;
    permissions: string[];
}
/**
 * Communication Protocols Manager
 *
 * Handles low-level message passing, routing, and bandwidth management
 * for multi-agent coordination systems.
 */
export declare class CommunicationProtocols {
    private getRelationship?;
    private maxBandwidth;
    private enableSecurity;
    private agentId;
    private networkTopology;
    private bandwidthAllocation;
    private messageQueue;
    private deliveryStatuses;
    private routingCache;
    private securityContext;
    private metrics;
    constructor(agentId: string, getRelationship?: ((targetId: string) => Promise<AgentRelationship | null>) | undefined, maxBandwidth?: number, // 1MB default
    enableSecurity?: boolean);
    /**
     * Route message to target agent
     */
    routeMessage(message: CoordinationMessage): Promise<RoutingInfo | null>;
    /**
     * Calculate optimal route for message
     */
    private calculateOptimalRoute;
    /**
     * Find shortest path between two nodes using Dijkstra's algorithm
     */
    private findShortestPath;
    /**
     * Find edge between two nodes
     */
    private findEdge;
    /**
     * Calculate path latency
     */
    private calculatePathLatency;
    /**
     * Calculate path reliability
     */
    private calculatePathReliability;
    /**
     * Calculate path cost
     */
    private calculatePathCost;
    /**
     * Allocate bandwidth for message
     */
    allocateBandwidth(messageSize: number, priority: MessagePriority): Promise<boolean>;
    /**
     * Priority-based bandwidth allocation
     */
    private priorityBasedAllocation;
    /**
     * Release allocated bandwidth
     */
    releaseBandwidth(messageSize: number, priority: MessagePriority): void;
    /**
     * Reset bandwidth allocation if needed
     */
    private resetBandwidthIfNeeded;
    /**
     * Deliver message with retry logic
     */
    deliverMessage(message: CoordinationMessage): Promise<boolean>;
    /**
     * Attempt message delivery with retry logic
     */
    private attemptDeliveryWithRetry;
    /**
     * Verify message delivery
     */
    private verifyDelivery;
    /**
     * Get maximum retries for message priority
     */
    private getMaxRetries;
    /**
     * Get retry delay for message priority
     */
    private getRetryDelay;
    /**
     * Apply security measures to message
     */
    applySecurityMeasures(message: CoordinationMessage): Promise<CoordinationMessage>;
    /**
     * Verify message security
     */
    verifyMessageSecurity(message: CoordinationMessage): Promise<boolean>;
    /**
     * Initialize network topology
     */
    private initializeNetworkTopology;
    /**
     * Initialize bandwidth allocation
     */
    private initializeBandwidthAllocation;
    /**
     * Initialize security context
     */
    private initializeSecurityContext;
    /**
     * Initialize metrics
     */
    private initializeMetrics;
    /**
     * Update delivery metrics
     */
    private updateDeliveryMetrics;
    /**
     * Get current metrics
     */
    getMetrics(): CoordinationMetrics;
    /**
     * Get network topology
     */
    getNetworkTopology(): NetworkTopology;
    /**
     * Get bandwidth allocation
     */
    getBandwidthAllocation(): BandwidthAllocation;
    /**
     * Update network topology
     */
    updateNetworkTopology(topology: Partial<NetworkTopology>): void;
    /**
     * Add network node
     */
    addNetworkNode(node: NetworkNode): void;
    /**
     * Remove network node
     */
    removeNetworkNode(nodeId: string): void;
    /**
     * Update routing table
     */
    private updateRoutingTable;
    /**
     * Reset metrics
     */
    resetMetrics(): void;
}
//# sourceMappingURL=communication_protocols.d.ts.map