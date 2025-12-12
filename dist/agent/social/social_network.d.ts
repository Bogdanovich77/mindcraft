/**
 * Social Network Management
 *
 * Social network topology analysis and management system
 * Following the established patterns from cognitive components
 */
import { SocialNetworkTopology, SocialCluster, NetworkMetrics, SocialRole, EdgeType, EdgeDirectionality, RelationshipNetwork } from './relationship_types.js';
/**
 * Social network topology management system
 */
export declare class SocialNetworkManager {
    private topology;
    private relationshipNetworks;
    private updateThreshold;
    private maxNodes;
    constructor();
    /**
     * Update social network with new relationship data
     */
    updateNetwork(agentId: string, relationshipNetwork: RelationshipNetwork): void;
    /**
     * Add or update a node in the network
     */
    updateNode(agentId: string, importance?: number, influence?: number, role?: SocialRole): void;
    /**
     * Add or update an edge in the network
     */
    updateEdge(sourceId: string, targetId: string, weight?: number, type?: EdgeType, strength?: number, directionality?: EdgeDirectionality): void;
    /**
     * Remove node from network
     */
    removeNode(agentId: string): void;
    /**
     * Analyze network clusters
     */
    analyzeClusters(): SocialCluster[];
    /**
     * Calculate network metrics
     */
    calculateMetrics(): NetworkMetrics;
    /**
     * Get node's social role based on network position
     */
    getNodeRole(agentId: string): SocialRole;
    /**
     * Find shortest path between two nodes
     */
    findShortestPath(sourceId: string, targetId: string): string[] | null;
    /**
     * Get network neighbors for a node
     */
    getNodeNeighbors(agentId: string): string[];
    /**
     * Calculate influence propagation
     */
    calculateInfluencePropagation(sourceId: string, message: any, maxDepth?: number): Array<{
        agentId: string;
        influence: number;
        depth: number;
    }>;
    /**
     * Get network summary
     */
    getNetworkSummary(): {
        totalNodes: number;
        totalEdges: number;
        totalClusters: number;
        networkDensity: number;
        averageConnectivity: number;
        largestClusterSize: number;
        mostInfluentialNode: string | null;
    };
    /**
     * Get current topology
     */
    getTopology(): SocialNetworkTopology;
    /**
     * Create empty network metrics
     */
    private createEmptyMetrics;
    /**
     * Get total recent interactions across all networks
     */
    private getTotalRecentInteractions;
    /**
     * Recalculate entire network topology
     */
    private recalculateTopology;
    /**
     * Calculate node connectivity
     */
    private calculateNodeConnectivity;
    /**
     * Update node connectivity
     */
    private updateNodeConnectivity;
    /**
     * Limit node count for performance
     */
    private limitNodeCount;
    /**
     * Find connected component using BFS
     */
    private findConnectedComponent;
    /**
     * Calculate cluster cohesion
     */
    private calculateClusterCohesion;
    /**
     * Calculate cluster density
     */
    private calculateClusterDensity;
    /**
     * Find central agent in cluster
     */
    private findClusterCentralAgent;
    /**
     * Calculate network density
     */
    private calculateNetworkDensity;
    /**
     * Calculate clustering coefficient
     */
    private calculateClusteringCoefficient;
    /**
     * Calculate average path length
     */
    private calculateAveragePathLength;
    /**
     * Calculate network diameter
     */
    private calculateNetworkDiameter;
    /**
     * Calculate centrality measures for all nodes
     */
    private calculateCentralityMeasures;
    /**
     * Calculate betweenness centrality
     */
    private calculateBetweennessCentrality;
    /**
     * Calculate closeness centrality
     */
    private calculateClosenessCentrality;
    /**
     * Calculate network modularity
     */
    private calculateModularity;
    /**
     * Get edge between two nodes
     */
    private getEdge;
    /**
     * Map relationship status to edge type
     */
    private mapRelationshipToEdgeType;
    /**
     * Calculate edge weight from relationship
     */
    private calculateEdgeWeight;
    /**
     * Calculate node importance
     */
    private calculateNodeImportance;
    /**
     * Get node cluster count
     */
    private getNodeClusterCount;
    /**
     * Find most influential node
     */
    private findMostInfluentialNode;
    /**
     * Calculate interaction frequency between two agents
     */
    private calculateInteractionFrequency;
}
//# sourceMappingURL=social_network.d.ts.map