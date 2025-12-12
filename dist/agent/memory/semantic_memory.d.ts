import type { WorldContext } from '../langgraph/interfaces.js';
import type { ExtendedEpisodicEvent } from './episodic_memory.js';
interface SemanticConcept {
    id: string;
    name: string;
    type: 'entity' | 'property' | 'schema' | 'procedure' | 'location' | 'context' | 'temporal';
    activation: number;
    attributes: Record<string, any>;
    importance: number;
    relationships: SemanticRelationship[];
    lastAccessed: number;
}
interface SemanticRelationship {
    type: string;
    target: string;
    strength: number;
    confidence: number;
}
interface MemoryQuery {
    query: string;
    types?: string[];
    filters?: any;
    importance?: number;
    timeRange?: {
        start: number;
        end: number;
    };
    limit?: number;
}
/**
 * Semantic memory system for storing concepts, relationships, schemas, and prototypes
 */
export declare class SemanticMemory {
    private concepts;
    private relationships;
    private schemas;
    private prototypes;
    private activationDecayRate;
    private maxConcepts;
    private maxRelationships;
    private patternExtractor;
    constructor();
    /**
     * Initialize basic Minecraft concepts
     */
    initializeBasicConcepts(): Promise<void>;
    /**
     * Generalize experience from episodic event to create semantic knowledge
     */
    generalizeExperience(experience: ExtendedEpisodicEvent): Promise<void>;
    /**
     * Process extracted pattern to create semantic knowledge
     */
    private processPattern;
    /**
     * Create concept from action-outcome pattern
     */
    private createActionOutcomeConcept;
    /**
     * Create concept from emergency response pattern
     */
    private createEmergencyConcept;
    /**
     * Create concept from social pattern
     */
    private createSocialConcept;
    /**
     * Create concept from location pattern
     */
    private createLocationConcept;
    /**
     * Create concept from resource pattern
     */
    private createResourceConcept;
    /**
     * Generalize action-outcome relationships
     */
    private generalizeActionOutcome;
    /**
     * Generalize environmental patterns
     */
    private generalizeEnvironmentalPatterns;
    /**
     * Generalize temporal patterns
     */
    private generalizeTemporalPatterns;
    /**
     * Store a new semantic concept
     */
    storeConcept(concept: SemanticConcept): Promise<void>;
    /**
     * Store a semantic relationship
     */
    storeRelationship(relationship: SemanticRelationship, fromConcept: string): Promise<void>;
    /**
     * Query semantic memory
     */
    query(query: MemoryQuery): Promise<SemanticConcept[]>;
    /**
     * Query by text (simplified interface)
     */
    queryByText(text: string): Promise<SemanticConcept[]>;
    /**
     * Update threat knowledge from reactive events
     */
    updateThreatKnowledge(pattern: ThreatPattern): Promise<void>;
    /**
     * Get related concepts
     */
    getRelatedConcepts(conceptId: string, maxDepth?: number): SemanticConcept[];
    /**
     * Rank concepts by relevance to query
     */
    rankByRelevance(concepts: SemanticConcept[], query: MemoryQuery): SemanticConcept[];
    /**
     * Get memory statistics
     */
    getStatistics(): {
        conceptCount: number;
        relationshipCount: number;
        averageActivation: number;
    };
    /**
     * Cleanup old concepts to maintain performance
     */
    cleanup(): Promise<void>;
    /**
     * Private helper methods
     */
    private updateRelationshipIndex;
    private cleanupLeastImportantConcepts;
    private cleanupWeakRelationships;
    private calculateRelevanceScore;
}
export interface SemanticSchema {
    id: string;
    name: string;
    structure: Record<string, any>;
    instances: string[];
    importance: number;
}
export interface SemanticPrototype {
    id: string;
    category: string;
    features: Record<string, any>;
    exemplars: string[];
    typicality: number;
}
export interface ThreatPattern {
    type: 'threat';
    threatType: string;
    responseStrategy: string;
    escapeRoutes: string[];
    timestamp: number;
    context: WorldContext;
}
export {};
//# sourceMappingURL=semantic_memory.d.ts.map