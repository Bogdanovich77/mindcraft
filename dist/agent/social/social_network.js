/**
 * Social Network Management
 *
 * Social network topology analysis and management system
 * Following the established patterns from cognitive components
 */
import { SocialRole, NodeStatus, EdgeType, EdgeDirectionality, RelationshipStatus } from './relationship_types.js';
/**
 * Social network topology management system
 */
export class SocialNetworkManager {
    topology;
    relationshipNetworks; // agentId -> network
    updateThreshold = 5; // Minimum interactions before network update
    maxNodes = 100; // Maximum nodes for performance
    constructor() {
        this.topology = {
            nodes: [],
            edges: [],
            clusters: [],
            metrics: this.createEmptyMetrics(),
            lastCalculated: Date.now()
        };
        this.relationshipNetworks = new Map();
    }
    /**
     * Update social network with new relationship data
     */
    updateNetwork(agentId, relationshipNetwork) {
        this.relationshipNetworks.set(agentId, relationshipNetwork);
        // Check if we need to recalculate topology
        const totalInteractions = this.getTotalRecentInteractions();
        if (totalInteractions >= this.updateThreshold) {
            this.recalculateTopology();
        }
    }
    /**
     * Add or update a node in the network
     */
    updateNode(agentId, importance = 0.5, influence = 0.5, role = SocialRole.PERIPHERAL) {
        let node = this.topology.nodes.find(n => n.agentId === agentId);
        if (node) {
            // Update existing node
            node.importance = Math.max(0, Math.min(1, importance));
            node.influence = Math.max(0, Math.min(1, influence));
            node.role = role;
            node.status = NodeStatus.ACTIVE;
            node.connectivity = this.calculateNodeConnectivity(agentId);
        }
        else {
            // Create new node
            node = {
                agentId,
                importance: Math.max(0, Math.min(1, importance)),
                influence: Math.max(0, Math.min(1, influence)),
                connectivity: 0,
                role,
                status: NodeStatus.ACTIVE
            };
            this.topology.nodes.push(node);
        }
        // Limit node count for performance
        if (this.topology.nodes.length > this.maxNodes) {
            this.limitNodeCount();
        }
    }
    /**
     * Add or update an edge in the network
     */
    updateEdge(sourceId, targetId, weight = 0.5, type = EdgeType.COMMUNICATION, strength = 0.5, directionality = EdgeDirectionality.BIDIRECTIONAL) {
        let edge = this.topology.edges.find(e => (e.sourceId === sourceId && e.targetId === targetId) ||
            (e.sourceId === targetId && e.targetId === sourceId));
        const now = Date.now();
        if (edge) {
            // Update existing edge
            edge.weight = Math.max(0, Math.min(1, weight));
            edge.type = type;
            edge.strength = Math.max(0, Math.min(1, strength));
            edge.directionality = directionality;
            edge.lastInteraction = now;
            edge.interactionFrequency = this.calculateInteractionFrequency(sourceId, targetId);
        }
        else {
            // Create new edge
            edge = {
                sourceId,
                targetId,
                weight: Math.max(0, Math.min(1, weight)),
                type,
                strength: Math.max(0, Math.min(1, strength)),
                directionality,
                lastInteraction: now,
                interactionFrequency: 1
            };
            this.topology.edges.push(edge);
        }
        // Update node connectivity
        this.updateNodeConnectivity(sourceId);
        this.updateNodeConnectivity(targetId);
    }
    /**
     * Remove node from network
     */
    removeNode(agentId) {
        // Remove node
        this.topology.nodes = this.topology.nodes.filter(n => n.agentId !== agentId);
        // Remove connected edges
        this.topology.edges = this.topology.edges.filter(e => e.sourceId !== agentId && e.targetId !== agentId);
        // Remove from clusters
        this.topology.clusters.forEach(cluster => {
            cluster.members = cluster.members.filter(m => m !== agentId);
        });
        // Remove empty clusters
        this.topology.clusters = this.topology.clusters.filter(c => c.members.length > 0);
    }
    /**
     * Analyze network clusters
     */
    analyzeClusters() {
        const clusters = [];
        const visited = new Set();
        // Find connected components
        this.topology.nodes.forEach(node => {
            if (!visited.has(node.agentId)) {
                const cluster = this.findConnectedComponent(node.agentId, visited);
                if (cluster.members.length > 1) {
                    clusters.push(cluster);
                }
            }
        });
        // Calculate cluster metrics
        clusters.forEach(cluster => {
            cluster.cohesion = this.calculateClusterCohesion(cluster);
            cluster.density = this.calculateClusterDensity(cluster);
            cluster.centralAgent = this.findClusterCentralAgent(cluster);
        });
        this.topology.clusters = clusters;
        return clusters;
    }
    /**
     * Calculate network metrics
     */
    calculateMetrics() {
        const metrics = this.topology.metrics;
        // Basic metrics
        metrics.density = this.calculateNetworkDensity();
        metrics.clustering = this.calculateClusteringCoefficient();
        metrics.averagePathLength = this.calculateAveragePathLength();
        metrics.diameter = this.calculateNetworkDiameter();
        // Centrality measures
        metrics.centrality = this.calculateCentralityMeasures();
        metrics.modularity = this.calculateModularity();
        this.topology.lastCalculated = Date.now();
        return metrics;
    }
    /**
     * Get node's social role based on network position
     */
    getNodeRole(agentId) {
        const node = this.topology.nodes.find(n => n.agentId === agentId);
        if (!node)
            return SocialRole.UNKNOWN;
        const centrality = this.topology.metrics.centrality.get(agentId) || 0;
        const connectivity = node.connectivity;
        const clusterCount = this.getNodeClusterCount(agentId);
        // Determine role based on metrics
        if (centrality > 0.8 && connectivity > 10) {
            return SocialRole.LEADER;
        }
        else if (centrality > 0.6 && connectivity > 5) {
            return SocialRole.CONNECTOR;
        }
        else if (clusterCount > 0) {
            return SocialRole.SPECIALIST;
        }
        else if (connectivity > 2) {
            return SocialRole.PERIPHERAL;
        }
        else {
            return SocialRole.ISOLATED;
        }
    }
    /**
     * Find shortest path between two nodes
     */
    findShortestPath(sourceId, targetId) {
        if (sourceId === targetId)
            return [sourceId];
        const visited = new Set();
        const queue = [{ node: sourceId, path: [sourceId] }];
        while (queue.length > 0) {
            const { node, path } = queue.shift();
            if (node === targetId) {
                return path;
            }
            if (visited.has(node))
                continue;
            visited.add(node);
            // Get neighbors
            const neighbors = this.getNodeNeighbors(node);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    queue.push({ node: neighbor, path: [...path, neighbor] });
                }
            }
        }
        return null; // No path found
    }
    /**
     * Get network neighbors for a node
     */
    getNodeNeighbors(agentId) {
        const neighbors = [];
        this.topology.edges.forEach(edge => {
            if (edge.sourceId === agentId) {
                neighbors.push(edge.targetId);
            }
            else if (edge.targetId === agentId) {
                neighbors.push(edge.sourceId);
            }
        });
        return [...new Set(neighbors)]; // Remove duplicates
    }
    /**
     * Calculate influence propagation
     */
    calculateInfluencePropagation(sourceId, message, maxDepth = 3) {
        const results = [];
        const visited = new Set();
        const propagate = (currentId, influence, depth) => {
            if (depth > maxDepth || visited.has(currentId) || influence < 0.01)
                return;
            visited.add(currentId);
            if (currentId !== sourceId) {
                results.push({ agentId: currentId, influence, depth });
            }
            // Get neighbors and propagate
            const neighbors = this.getNodeNeighbors(currentId);
            neighbors.forEach(neighborId => {
                const edge = this.getEdge(currentId, neighborId);
                if (edge) {
                    const nextInfluence = influence * edge.weight * 0.8; // Decay factor
                    propagate(neighborId, nextInfluence, depth + 1);
                }
            });
        };
        propagate(sourceId, 1.0, 0);
        return results.sort((a, b) => b.influence - a.influence);
    }
    /**
     * Get network summary
     */
    getNetworkSummary() {
        const totalNodes = this.topology.nodes.length;
        const totalEdges = this.topology.edges.length;
        const totalClusters = this.topology.clusters.length;
        const networkDensity = this.topology.metrics.density;
        const averageConnectivity = totalNodes > 0 ?
            this.topology.nodes.reduce((sum, node) => sum + node.connectivity, 0) / totalNodes : 0;
        const largestClusterSize = this.topology.clusters.length > 0 ?
            Math.max(...this.topology.clusters.map(c => c.members.length)) : 0;
        const mostInfluentialNode = this.findMostInfluentialNode();
        return {
            totalNodes,
            totalEdges,
            totalClusters,
            networkDensity,
            averageConnectivity,
            largestClusterSize,
            mostInfluentialNode
        };
    }
    /**
     * Get current topology
     */
    getTopology() {
        return { ...this.topology };
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    /**
     * Create empty network metrics
     */
    createEmptyMetrics() {
        return {
            density: 0,
            clustering: 0,
            averagePathLength: 0,
            diameter: 0,
            centrality: new Map(),
            modularity: 0
        };
    }
    /**
     * Get total recent interactions across all networks
     */
    getTotalRecentInteractions() {
        let total = 0;
        const recentThreshold = Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
        this.relationshipNetworks.forEach(network => {
            network.relationshipHistory.forEach(event => {
                if (event.timestamp > recentThreshold) {
                    total++;
                }
            });
        });
        return total;
    }
    /**
     * Recalculate entire network topology
     */
    recalculateTopology() {
        // Clear current topology
        this.topology = {
            nodes: [],
            edges: [],
            clusters: [],
            metrics: this.createEmptyMetrics(),
            lastCalculated: Date.now()
        };
        // Build topology from relationship networks
        this.relationshipNetworks.forEach((network, agentId) => {
            // Add node
            this.updateNode(agentId, this.calculateNodeImportance(agentId));
            // Add edges from relationships
            network.relationships.forEach((relationship, targetId) => {
                const edgeType = this.mapRelationshipToEdgeType(relationship.status);
                const weight = this.calculateEdgeWeight(relationship);
                this.updateEdge(agentId, targetId, weight, edgeType, weight);
            });
        });
        // Analyze clusters and calculate metrics
        this.analyzeClusters();
        this.calculateMetrics();
    }
    /**
     * Calculate node connectivity
     */
    calculateNodeConnectivity(agentId) {
        return this.getNodeNeighbors(agentId).length;
    }
    /**
     * Update node connectivity
     */
    updateNodeConnectivity(agentId) {
        const node = this.topology.nodes.find(n => n.agentId === agentId);
        if (node) {
            node.connectivity = this.calculateNodeConnectivity(agentId);
        }
    }
    /**
     * Limit node count for performance
     */
    limitNodeCount() {
        // Sort by importance and keep top nodes
        this.topology.nodes.sort((a, b) => b.importance - a.importance);
        const keptNodes = this.topology.nodes.slice(0, this.maxNodes);
        const removedNodeIds = new Set(this.topology.nodes.slice(this.maxNodes).map(n => n.agentId));
        this.topology.nodes = keptNodes;
        // Remove edges connected to removed nodes
        this.topology.edges = this.topology.edges.filter(e => !removedNodeIds.has(e.sourceId) && !removedNodeIds.has(e.targetId));
    }
    /**
     * Find connected component using BFS
     */
    findConnectedComponent(startId, visited) {
        const members = [];
        const queue = [startId];
        while (queue.length > 0) {
            const currentId = queue.shift();
            if (visited.has(currentId))
                continue;
            visited.add(currentId);
            members.push(currentId);
            // Add neighbors to queue
            const neighbors = this.getNodeNeighbors(currentId);
            neighbors.forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    queue.push(neighbor);
                }
            });
        }
        return {
            id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `Cluster ${members.length} members`,
            members,
            cohesion: 0, // Will be calculated separately
            density: 0, // Will be calculated separately
            purpose: 'social_group',
            formationTime: Date.now()
        };
    }
    /**
     * Calculate cluster cohesion
     */
    calculateClusterCohesion(cluster) {
        if (cluster.members.length < 2)
            return 0;
        let totalWeight = 0;
        let possibleConnections = 0;
        for (let i = 0; i < cluster.members.length; i++) {
            for (let j = i + 1; j < cluster.members.length; j++) {
                const edge = this.getEdge(cluster.members[i], cluster.members[j]);
                if (edge) {
                    totalWeight += edge.weight;
                }
                possibleConnections++;
            }
        }
        return possibleConnections > 0 ? totalWeight / possibleConnections : 0;
    }
    /**
     * Calculate cluster density
     */
    calculateClusterDensity(cluster) {
        const memberCount = cluster.members.length;
        if (memberCount < 2)
            return 0;
        const possibleEdges = (memberCount * (memberCount - 1)) / 2;
        let actualEdges = 0;
        for (let i = 0; i < cluster.members.length; i++) {
            for (let j = i + 1; j < cluster.members.length; j++) {
                if (this.getEdge(cluster.members[i], cluster.members[j])) {
                    actualEdges++;
                }
            }
        }
        return actualEdges / possibleEdges;
    }
    /**
     * Find central agent in cluster
     */
    findClusterCentralAgent(cluster) {
        if (cluster.members.length === 0)
            return undefined;
        let maxCentrality = 0;
        let centralAgent;
        cluster.members.forEach(memberId => {
            const centrality = this.topology.metrics.centrality.get(memberId) || 0;
            if (centrality > maxCentrality) {
                maxCentrality = centrality;
                centralAgent = memberId;
            }
        });
        return centralAgent;
    }
    /**
     * Calculate network density
     */
    calculateNetworkDensity() {
        const nodeCount = this.topology.nodes.length;
        if (nodeCount < 2)
            return 0;
        const possibleEdges = (nodeCount * (nodeCount - 1)) / 2;
        return this.topology.edges.length / possibleEdges;
    }
    /**
     * Calculate clustering coefficient
     */
    calculateClusteringCoefficient() {
        let totalClustering = 0;
        let nodeCount = 0;
        this.topology.nodes.forEach(node => {
            const neighbors = this.getNodeNeighbors(node.agentId);
            if (neighbors.length < 2)
                return;
            let neighborConnections = 0;
            const possibleConnections = (neighbors.length * (neighbors.length - 1)) / 2;
            for (let i = 0; i < neighbors.length; i++) {
                for (let j = i + 1; j < neighbors.length; j++) {
                    if (this.getEdge(neighbors[i], neighbors[j])) {
                        neighborConnections++;
                    }
                }
            }
            totalClustering += neighborConnections / possibleConnections;
            nodeCount++;
        });
        return nodeCount > 0 ? totalClustering / nodeCount : 0;
    }
    /**
     * Calculate average path length
     */
    calculateAveragePathLength() {
        const nodes = this.topology.nodes;
        if (nodes.length < 2)
            return 0;
        let totalPathLength = 0;
        let pathCount = 0;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const path = this.findShortestPath(nodes[i].agentId, nodes[j].agentId);
                if (path) {
                    totalPathLength += path.length - 1; // Edge count, not node count
                    pathCount++;
                }
            }
        }
        return pathCount > 0 ? totalPathLength / pathCount : 0;
    }
    /**
     * Calculate network diameter
     */
    calculateNetworkDiameter() {
        let maxPathLength = 0;
        const nodes = this.topology.nodes;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const path = this.findShortestPath(nodes[i].agentId, nodes[j].agentId);
                if (path) {
                    maxPathLength = Math.max(maxPathLength, path.length - 1);
                }
            }
        }
        return maxPathLength;
    }
    /**
     * Calculate centrality measures for all nodes
     */
    calculateCentralityMeasures() {
        const centrality = new Map();
        this.topology.nodes.forEach(node => {
            const degree = this.calculateNodeConnectivity(node.agentId);
            const betweenness = this.calculateBetweennessCentrality(node.agentId);
            const closeness = this.calculateClosenessCentrality(node.agentId);
            // Combined centrality score
            const combinedCentrality = (degree * 0.4 + betweenness * 0.3 + closeness * 0.3) /
                Math.max(this.topology.nodes.length - 1, 1);
            centrality.set(node.agentId, combinedCentrality);
        });
        return centrality;
    }
    /**
     * Calculate betweenness centrality
     */
    calculateBetweennessCentrality(agentId) {
        // Simplified betweenness calculation
        let betweenness = 0;
        const nodes = this.topology.nodes.map(n => n.agentId);
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (nodes[i] !== agentId && nodes[j] !== agentId) {
                    const path = this.findShortestPath(nodes[i], nodes[j]);
                    if (path && path.includes(agentId)) {
                        betweenness++;
                    }
                }
            }
        }
        return betweenness;
    }
    /**
     * Calculate closeness centrality
     */
    calculateClosenessCentrality(agentId) {
        const nodes = this.topology.nodes.map(n => n.agentId);
        let totalDistance = 0;
        let reachableNodes = 0;
        nodes.forEach(nodeId => {
            if (nodeId !== agentId) {
                const path = this.findShortestPath(agentId, nodeId);
                if (path) {
                    totalDistance += path.length - 1;
                    reachableNodes++;
                }
            }
        });
        return reachableNodes > 0 ? reachableNodes / totalDistance : 0;
    }
    /**
     * Calculate network modularity
     */
    calculateModularity() {
        // Simplified modularity calculation
        if (this.topology.clusters.length === 0)
            return 0;
        let totalModularity = 0;
        const totalEdges = this.topology.edges.length;
        if (totalEdges === 0)
            return 0;
        this.topology.clusters.forEach(cluster => {
            let intraClusterEdges = 0;
            let clusterDegree = 0;
            cluster.members.forEach(memberId => {
                const memberDegree = this.calculateNodeConnectivity(memberId);
                clusterDegree += memberDegree;
                // Count intra-cluster edges
                const neighbors = this.getNodeNeighbors(memberId);
                neighbors.forEach(neighborId => {
                    if (cluster.members.includes(neighborId) && memberId < neighborId) {
                        intraClusterEdges++;
                    }
                });
            });
            const expectedEdges = (clusterDegree * clusterDegree) / (2 * totalEdges);
            const modularityContribution = (intraClusterEdges - expectedEdges) / totalEdges;
            totalModularity += modularityContribution;
        });
        return totalModularity;
    }
    /**
     * Get edge between two nodes
     */
    getEdge(sourceId, targetId) {
        return this.topology.edges.find(e => (e.sourceId === sourceId && e.targetId === targetId) ||
            (e.sourceId === targetId && e.targetId === sourceId));
    }
    /**
     * Map relationship status to edge type
     */
    mapRelationshipToEdgeType(status) {
        switch (status) {
            case RelationshipStatus.FRIEND:
            case RelationshipStatus.CLOSE_FRIEND:
                return EdgeType.FRIENDSHIP;
            case RelationshipStatus.COLLEAGUE:
            case RelationshipStatus.PARTNER:
                return EdgeType.COLLABORATION;
            case RelationshipStatus.MENTOR:
            case RelationshipStatus.MENTEE:
                return EdgeType.MENTORSHIP;
            case RelationshipStatus.RIVAL:
            case RelationshipStatus.ENEMY:
                return EdgeType.RIVALRY;
            default:
                return EdgeType.COMMUNICATION;
        }
    }
    /**
     * Calculate edge weight from relationship
     */
    calculateEdgeWeight(relationship) {
        return (relationship.trust.level * 0.4 +
            relationship.friendship.level * 0.3 +
            relationship.collaboration.effectiveness * 0.3);
    }
    /**
     * Calculate node importance
     */
    calculateNodeImportance(agentId) {
        const network = this.relationshipNetworks.get(agentId);
        if (!network)
            return 0.5;
        const avgTrust = Array.from(network.relationships.values())
            .reduce((sum, rel) => sum + rel.trust.level, 0) / Math.max(1, network.relationships.size);
        const reputation = network.reputation.globalScore;
        return (avgTrust * 0.6 + reputation * 0.4);
    }
    /**
     * Get node cluster count
     */
    getNodeClusterCount(agentId) {
        return this.topology.clusters.filter(cluster => cluster.members.includes(agentId)).length;
    }
    /**
     * Find most influential node
     */
    findMostInfluentialNode() {
        let maxInfluence = 0;
        let mostInfluential = null;
        this.topology.nodes.forEach(node => {
            const influence = node.influence * node.connectivity;
            if (influence > maxInfluence) {
                maxInfluence = influence;
                mostInfluential = node.agentId;
            }
        });
        return mostInfluential;
    }
    /**
     * Calculate interaction frequency between two agents
     */
    calculateInteractionFrequency(sourceId, targetId) {
        // Simplified frequency calculation
        const edge = this.getEdge(sourceId, targetId.toString());
        if (!edge)
            return 1;
        const timeSinceLastInteraction = Date.now() - edge.lastInteraction;
        const daysSinceLastInteraction = timeSinceLastInteraction / (1000 * 60 * 60 * 24);
        // Higher frequency for more recent interactions
        return Math.max(1, 10 - daysSinceLastInteraction);
    }
}
//# sourceMappingURL=social_network.js.map