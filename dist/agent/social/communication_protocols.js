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
import { MessagePriority } from './multi_agent_coordinator';
// ============================================================================
// COMMUNICATION PROTOCOLS CLASS
// ============================================================================
/**
 * Communication Protocols Manager
 *
 * Handles low-level message passing, routing, and bandwidth management
 * for multi-agent coordination systems.
 */
export class CommunicationProtocols {
    getRelationship;
    maxBandwidth;
    enableSecurity;
    agentId;
    networkTopology;
    bandwidthAllocation;
    messageQueue;
    deliveryStatuses;
    routingCache;
    securityContext;
    metrics;
    constructor(agentId, getRelationship, maxBandwidth = 1024 * 1024, // 1MB default
    enableSecurity = true) {
        this.getRelationship = getRelationship;
        this.maxBandwidth = maxBandwidth;
        this.enableSecurity = enableSecurity;
        this.agentId = agentId;
        this.networkTopology = this.initializeNetworkTopology();
        this.bandwidthAllocation = this.initializeBandwidthAllocation(maxBandwidth);
        this.messageQueue = new Map();
        this.deliveryStatuses = new Map();
        this.routingCache = new Map();
        this.securityContext = this.initializeSecurityContext(enableSecurity);
        this.metrics = this.initializeMetrics(agentId);
        // Initialize priority queues
        Object.values(MessagePriority).forEach(priority => {
            this.messageQueue.set(priority, []);
        });
    }
    // ============================================================================
    // MESSAGE ROUTING
    // ============================================================================
    /**
     * Route message to target agent
     */
    async routeMessage(message) {
        try {
            // Check cache first
            const cacheKey = `${message.senderId}-${Array.isArray(message.targetId) ? message.targetId.join(',') : message.targetId}`;
            if (this.routingCache.has(cacheKey)) {
                const cached = this.routingCache.get(cacheKey);
                if (Date.now() - cached.lastSeen < 30000) { // 30 seconds cache TTL
                    return cached;
                }
            }
            // Calculate optimal route
            const route = await this.calculateOptimalRoute(message);
            if (route) {
                // Cache the route
                this.routingCache.set(cacheKey, {
                    ...route,
                    lastSeen: Date.now()
                });
            }
            return route;
        }
        catch (error) {
            console.error(`[COMMUNICATION_PROTOCOLS] Error routing message:`, error);
            return null;
        }
    }
    /**
     * Calculate optimal route for message
     */
    async calculateOptimalRoute(message) {
        const targetIds = Array.isArray(message.targetId) ? message.targetId : [message.targetId];
        for (const targetId of targetIds) {
            // Check if target is reachable
            if (!this.networkTopology.routingTable.has(targetId)) {
                console.warn(`[COMMUNICATION_PROTOCOLS] Target ${targetId} not reachable`);
                continue;
            }
            // Find shortest path using Dijkstra's algorithm
            const path = this.findShortestPath(this.agentId, targetId);
            if (path && path.length > 0) {
                const nextHop = path[1]; // Next hop after current agent
                const edge = this.findEdge(this.agentId, nextHop);
                if (edge) {
                    return {
                        path,
                        nextHop,
                        estimatedLatency: this.calculatePathLatency(path),
                        reliability: this.calculatePathReliability(path),
                        cost: this.calculatePathCost(path)
                    };
                }
            }
        }
        return null;
    }
    /**
     * Find shortest path between two nodes using Dijkstra's algorithm
     */
    findShortestPath(from, to) {
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();
        // Initialize distances
        for (const node of this.networkTopology.nodes) {
            distances.set(node.id, node.id === from ? 0 : Infinity);
            unvisited.add(node.id);
        }
        while (unvisited.size > 0) {
            // Find node with minimum distance
            let current = null;
            let minDistance = Infinity;
            for (const nodeId of unvisited) {
                const distance = distances.get(nodeId);
                if (distance < minDistance) {
                    minDistance = distance;
                    current = nodeId;
                }
            }
            if (!current || current === to)
                break;
            unvisited.delete(current);
            // Update distances to neighbors
            const neighbors = this.networkTopology.routingTable.get(current) || [];
            for (const neighbor of neighbors) {
                const edge = this.findEdge(current, neighbor);
                if (edge) {
                    const altDistance = distances.get(current) + edge.weight;
                    const currentDistance = distances.get(neighbor);
                    if (altDistance < currentDistance) {
                        distances.set(neighbor, altDistance);
                        previous.set(neighbor, current);
                    }
                }
            }
        }
        // Reconstruct path
        if (!distances.has(to) || distances.get(to) === Infinity) {
            return null;
        }
        const path = [];
        let current = to;
        while (current) {
            path.unshift(current);
            current = previous.get(current);
        }
        return path;
    }
    /**
     * Find edge between two nodes
     */
    findEdge(from, to) {
        return this.networkTopology.edges.find(edge => (edge.from === from && edge.to === to) ||
            (edge.from === to && edge.to === from)) || null;
    }
    /**
     * Calculate path latency
     */
    calculatePathLatency(path) {
        let totalLatency = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const edge = this.findEdge(path[i], path[i + 1]);
            if (edge) {
                totalLatency += edge.latency;
            }
        }
        return totalLatency;
    }
    /**
     * Calculate path reliability
     */
    calculatePathReliability(path) {
        let reliabilityProduct = 1.0;
        for (let i = 0; i < path.length - 1; i++) {
            const edge = this.findEdge(path[i], path[i + 1]);
            if (edge) {
                reliabilityProduct *= edge.reliability;
            }
        }
        return reliabilityProduct;
    }
    /**
     * Calculate path cost
     */
    calculatePathCost(path) {
        let totalCost = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const edge = this.findEdge(path[i], path[i + 1]);
            if (edge) {
                totalCost += edge.weight; // Use weight instead of cost
            }
        }
        return totalCost;
    }
    // ============================================================================
    // BANDWIDTH MANAGEMENT
    // ============================================================================
    /**
     * Allocate bandwidth for message
     */
    async allocateBandwidth(messageSize, priority) {
        try {
            // Reset bandwidth allocation every second
            this.resetBandwidthIfNeeded();
            // Check if enough bandwidth is available
            if (this.bandwidthAllocation.availableBandwidth < messageSize) {
                console.warn(`[COMMUNICATION_PROTOCOLS] Insufficient bandwidth for message: ${messageSize} bytes`);
                return false;
            }
            // Priority-based allocation
            const canAllocate = await this.priorityBasedAllocation(messageSize, priority);
            if (canAllocate) {
                this.bandwidthAllocation.usedBandwidth += messageSize;
                this.bandwidthAllocation.availableBandwidth -= messageSize;
                // Update metrics
                this.metrics.performance.bandwidthUsage = this.bandwidthAllocation.usedBandwidth;
                return true;
            }
            return false;
        }
        catch (error) {
            console.error(`[COMMUNICATION_PROTOCOLS] Error allocating bandwidth:`, error);
            return false;
        }
    }
    /**
     * Priority-based bandwidth allocation
     */
    async priorityBasedAllocation(messageSize, priority) {
        // Higher priority messages can preempt lower priority ones
        const priorityOrder = [
            MessagePriority.CRITICAL,
            MessagePriority.HIGH,
            MessagePriority.MEDIUM,
            MessagePriority.LOW,
            MessagePriority.BACKGROUND
        ];
        const messagePriorityIndex = priorityOrder.indexOf(priority);
        // Check if we can preempt lower priority allocations
        for (let i = messagePriorityIndex + 1; i < priorityOrder.length; i++) {
            const lowerPriority = priorityOrder[i];
            const allocatedBandwidth = this.bandwidthAllocation.allocations.get(lowerPriority.toString()) || 0;
            if (allocatedBandwidth > 0 && messageSize <= allocatedBandwidth) {
                // Preempt lower priority allocation
                this.bandwidthAllocation.allocations.set(lowerPriority.toString(), 0);
                this.bandwidthAllocation.usedBandwidth -= allocatedBandwidth;
                this.bandwidthAllocation.availableBandwidth += allocatedBandwidth;
                console.log(`[COMMUNICATION_PROTOCOLS] Preempted ${lowerPriority} bandwidth allocation for ${priority}`);
                break;
            }
        }
        return this.bandwidthAllocation.availableBandwidth >= messageSize;
    }
    /**
     * Release allocated bandwidth
     */
    releaseBandwidth(messageSize, priority) {
        this.bandwidthAllocation.usedBandwidth -= messageSize;
        this.bandwidthAllocation.availableBandwidth += messageSize;
        const currentAllocation = this.bandwidthAllocation.allocations.get(priority.toString()) || 0;
        this.bandwidthAllocation.allocations.set(priority.toString(), currentAllocation - messageSize);
        // Update metrics
        this.metrics.performance.bandwidthUsage = this.bandwidthAllocation.usedBandwidth;
    }
    /**
     * Reset bandwidth allocation if needed
     */
    resetBandwidthIfNeeded() {
        const now = Date.now();
        if (now - this.bandwidthAllocation.lastReset > 1000) { // Reset every second
            this.bandwidthAllocation.usedBandwidth = 0;
            this.bandwidthAllocation.availableBandwidth = this.bandwidthAllocation.totalBandwidth;
            this.bandwidthAllocation.allocations.clear();
            this.bandwidthAllocation.lastReset = now;
        }
    }
    // ============================================================================
    // MESSAGE DELIVERY
    // ============================================================================
    /**
     * Deliver message with retry logic
     */
    async deliverMessage(message) {
        try {
            const deliveryStatus = {
                messageId: message.id,
                status: 'pending',
                attempts: 0,
                lastAttempt: Date.now(),
                nextRetry: Date.now()
            };
            this.deliveryStatuses.set(message.id, deliveryStatus);
            // Calculate message size (rough estimation)
            const messageSize = JSON.stringify(message).length * 2; // UTF-16 bytes
            // Allocate bandwidth
            const bandwidthAllocated = await this.allocateBandwidth(messageSize, message.priority);
            if (!bandwidthAllocated) {
                deliveryStatus.status = 'failed';
                this.metrics.messages.failed++;
                return false;
            }
            // Get routing information
            const route = await this.routeMessage(message);
            if (!route) {
                deliveryStatus.status = 'failed';
                this.releaseBandwidth(messageSize, message.priority);
                this.metrics.messages.failed++;
                return false;
            }
            deliveryStatus.route = route;
            deliveryStatus.status = 'in_transit';
            // Attempt delivery with retries
            const delivered = await this.attemptDeliveryWithRetry(message, route, messageSize);
            // Update delivery status
            deliveryStatus.status = delivered ? 'delivered' : 'failed';
            deliveryStatus.lastAttempt = Date.now();
            // Update metrics
            this.updateDeliveryMetrics(message, delivered, Date.now() - deliveryStatus.lastAttempt);
            return delivered;
        }
        catch (error) {
            console.error(`[COMMUNICATION_PROTOCOLS] Error delivering message:`, error);
            this.metrics.messages.failed++;
            return false;
        }
    }
    /**
     * Attempt message delivery with retry logic
     */
    async attemptDeliveryWithRetry(message, route, messageSize) {
        const maxRetries = this.getMaxRetries(message.priority);
        const baseDelay = this.getRetryDelay(message.priority);
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Update delivery status
                const deliveryStatus = this.deliveryStatuses.get(message.id);
                deliveryStatus.attempts = attempt;
                deliveryStatus.lastAttempt = Date.now();
                // Simulate network transmission
                const transmissionTime = route.estimatedLatency + (messageSize / route.reliability);
                await new Promise(resolve => setTimeout(resolve, transmissionTime));
                // Check if transmission was successful
                const success = await this.verifyDelivery(message, route);
                if (success) {
                    this.releaseBandwidth(messageSize, message.priority);
                    return true;
                }
                // If not successful and we have retries left
                if (attempt < maxRetries) {
                    const exponentialBackoff = baseDelay * Math.pow(2, attempt - 1);
                    deliveryStatus.nextRetry = Date.now() + exponentialBackoff;
                    console.log(`[COMMUNICATION_PROTOCOLS] Delivery attempt ${attempt} failed, retrying in ${exponentialBackoff}ms`);
                    // Wait before next retry
                    await new Promise(resolve => setTimeout(resolve, exponentialBackoff));
                }
            }
            catch (error) {
                console.error(`[COMMUNICATION_PROTOCOLS] Delivery attempt ${attempt} error:`, error);
                if (attempt === maxRetries) {
                    this.releaseBandwidth(messageSize, message.priority);
                    return false;
                }
            }
        }
        this.releaseBandwidth(messageSize, message.priority);
        return false;
    }
    /**
     * Verify message delivery
     */
    async verifyDelivery(message, route) {
        try {
            // Simulate delivery verification based on route reliability
            const reliabilityThreshold = 0.8;
            const random = Math.random();
            if (route.reliability > reliabilityThreshold) {
                return random < 0.95; // 95% success rate for reliable routes
            }
            else {
                return random < 0.6; // 60% success rate for unreliable routes
            }
        }
        catch (error) {
            console.error(`[COMMUNICATION_PROTOCOLS] Error verifying delivery:`, error);
            return false;
        }
    }
    /**
     * Get maximum retries for message priority
     */
    getMaxRetries(priority) {
        switch (priority) {
            case MessagePriority.CRITICAL: return 5;
            case MessagePriority.HIGH: return 3;
            case MessagePriority.MEDIUM: return 2;
            case MessagePriority.LOW: return 1;
            case MessagePriority.BACKGROUND: return 0;
            default: return 2;
        }
    }
    /**
     * Get retry delay for message priority
     */
    getRetryDelay(priority) {
        switch (priority) {
            case MessagePriority.CRITICAL: return 100; // 100ms
            case MessagePriority.HIGH: return 500; // 500ms
            case MessagePriority.MEDIUM: return 1000; // 1s
            case MessagePriority.LOW: return 2000; // 2s
            case MessagePriority.BACKGROUND: return 5000; // 5s
            default: return 1000;
        }
    }
    // ============================================================================
    // SECURITY AND AUTHENTICATION
    // ============================================================================
    /**
     * Apply security measures to message
     */
    async applySecurityMeasures(message) {
        if (!this.securityContext.encryptionEnabled) {
            return message;
        }
        try {
            const securedMessage = { ...message };
            // Add security metadata
            securedMessage.metadata = {
                ...message.metadata,
                security: {
                    encrypted: this.securityContext.encryptionEnabled,
                    authenticated: this.securityContext.signatureVerified,
                    trustLevel: this.securityContext.trustLevel,
                    timestamp: Date.now()
                }
            };
            // Simulate encryption/decryption overhead
            if (this.securityContext.encryptionEnabled) {
                await new Promise(resolve => setTimeout(resolve, 5)); // 5ms encryption overhead
            }
            return securedMessage;
        }
        catch (error) {
            console.error(`[COMMUNICATION_PROTOCOLS] Error applying security measures:`, error);
            return message;
        }
    }
    /**
     * Verify message security
     */
    async verifyMessageSecurity(message) {
        if (!this.securityContext.authenticationRequired) {
            return true;
        }
        try {
            const securityMetadata = message.metadata?.security;
            if (!securityMetadata) {
                return false;
            }
            // Check trust level
            if (securityMetadata.trustLevel < this.securityContext.trustLevel) {
                return false;
            }
            // Simulate signature verification overhead
            if (this.securityContext.signatureVerified) {
                await new Promise(resolve => setTimeout(resolve, 2)); // 2ms verification overhead
            }
            return true;
        }
        catch (error) {
            console.error(`[COMMUNICATION_PROTOCOLS] Error verifying message security:`, error);
            return false;
        }
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    /**
     * Initialize network topology
     */
    initializeNetworkTopology() {
        return {
            nodes: [],
            edges: [],
            routingTable: new Map(),
            updateTimestamp: Date.now()
        };
    }
    /**
     * Initialize bandwidth allocation
     */
    initializeBandwidthAllocation(maxBandwidth) {
        return {
            totalBandwidth: maxBandwidth,
            usedBandwidth: 0,
            reservedBandwidth: 0,
            availableBandwidth: maxBandwidth,
            allocations: new Map(),
            lastReset: Date.now()
        };
    }
    /**
     * Initialize security context
     */
    initializeSecurityContext(enableSecurity) {
        return {
            encryptionEnabled: enableSecurity,
            authenticationRequired: enableSecurity,
            signatureVerified: false,
            trustLevel: 0.5,
            permissions: []
        };
    }
    /**
     * Initialize metrics
     */
    initializeMetrics(agentId) {
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
    /**
     * Update delivery metrics
     */
    updateDeliveryMetrics(message, delivered, processingTime) {
        this.metrics.messages.sent++;
        if (delivered) {
            this.metrics.messages.delivered++;
            // Update average latency
            const totalLatency = this.metrics.messages.averageLatency * (this.metrics.messages.delivered - 1) + processingTime;
            this.metrics.messages.averageLatency = totalLatency / this.metrics.messages.delivered;
        }
        else {
            this.metrics.messages.failed++;
        }
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
     * Get network topology
     */
    getNetworkTopology() {
        return { ...this.networkTopology };
    }
    /**
     * Get bandwidth allocation
     */
    getBandwidthAllocation() {
        return { ...this.bandwidthAllocation };
    }
    /**
     * Update network topology
     */
    updateNetworkTopology(topology) {
        this.networkTopology = {
            ...this.networkTopology,
            ...topology,
            updateTimestamp: Date.now()
        };
        // Clear routing cache when topology changes
        this.routingCache.clear();
    }
    /**
     * Add network node
     */
    addNetworkNode(node) {
        this.networkTopology.nodes.push(node);
        this.updateRoutingTable();
    }
    /**
     * Remove network node
     */
    removeNetworkNode(nodeId) {
        this.networkTopology.nodes = this.networkTopology.nodes.filter(node => node.id !== nodeId);
        this.networkTopology.edges = this.networkTopology.edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId);
        this.updateRoutingTable();
    }
    /**
     * Update routing table
     */
    updateRoutingTable() {
        const routingTable = new Map();
        for (const node of this.networkTopology.nodes) {
            const neighbors = [];
            for (const edge of this.networkTopology.edges) {
                if (edge.from === node.id) {
                    neighbors.push(edge.to);
                }
                else if (edge.to === node.id) {
                    neighbors.push(edge.from);
                }
            }
            routingTable.set(node.id, neighbors);
        }
        this.networkTopology.routingTable = routingTable;
    }
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = this.initializeMetrics(this.agentId);
    }
}
//# sourceMappingURL=communication_protocols.js.map