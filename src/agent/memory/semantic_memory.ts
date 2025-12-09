import type { 
  SemanticConcept, 
  SemanticRelationship, 
  MemoryQuery, 
  WorldContext 
} from '../langgraph/interfaces.js';

/**
 * Semantic memory system for storing concepts, relationships, schemas, and prototypes
 */
export class SemanticMemory {
  private concepts: Map<string, SemanticConcept> = new Map();
  private relationships: Map<string, SemanticRelationship[]> = new Map();
  private schemas: Map<string, SemanticSchema> = new Map();
  private prototypes: Map<string, SemanticPrototype> = new Map();
  
  private activationDecayRate: number = 0.1; // Per hour
  private maxConcepts: number = 1000;
  private maxRelationships: number = 5000;
  
  constructor() {
    this.initializeBasicConcepts();
  }
  
  /**
   * Initialize basic Minecraft concepts
   */
  async initializeBasicConcepts(): Promise<void> {
    const basicConcepts = [
      {
        id: 'player',
        name: 'player',
        type: 'entity' as const,
        attributes: { canMove: true, canBuild: true, hasInventory: true },
        importance: 1.0
      },
      {
        id: 'hostile_mob',
        name: 'hostile_mob',
        type: 'entity' as const,
        attributes: { dangerous: true, attacksPlayer: true, dropsLoot: true },
        importance: 0.9
      },
      {
        id: 'food',
        name: 'food',
        type: 'entity' as const,
        attributes: { edible: true, restoresHunger: true, consumable: true },
        importance: 0.8
      },
      {
        id: 'tool',
        name: 'tool',
        type: 'entity' as const,
        attributes: { usable: true, durability: true, enhancesActions: true },
        importance: 0.7
      },
      {
        id: 'shelter',
        name: 'shelter',
        type: 'schema' as const,
        attributes: { providesProtection: true, hasWalls: true, hasRoof: true },
        importance: 0.9
      },
      {
        id: 'danger',
        name: 'danger',
        type: 'property' as const,
        attributes: { requiresEscape: true, causesDamage: true, stressful: true },
        importance: 1.0
      }
    ];
    
    for (const concept of basicConcepts) {
      await this.storeConcept({
        ...concept,
        activation: 0.5,
        relationships: [],
        lastAccessed: Date.now()
      });
    }
    
    // Create basic relationships
    await this.storeRelationship({
      type: 'causal',
      target: 'shelter',
      strength: 0.9,
      confidence: 0.95
    }, 'danger');
    
    await this.storeRelationship({
      type: 'categorical',
      target: 'food',
      strength: 0.8,
      confidence: 0.9
    }, 'player');
  }
  
  /**
   * Store a new semantic concept
   */
  async storeConcept(concept: SemanticConcept): Promise<void> {
    // Check capacity limits
    if (this.concepts.size >= this.maxConcepts) {
      await this.cleanupLeastImportantConcepts();
    }
    
    // Update existing concept or add new one
    if (this.concepts.has(concept.id)) {
      const existing = this.concepts.get(concept.id)!;
      existing.activation = Math.max(existing.activation, concept.activation);
      existing.lastAccessed = Date.now();
      existing.importance = Math.max(existing.importance, concept.importance);
      
      // Merge attributes
      Object.assign(existing.attributes, concept.attributes);
      
      // Merge relationships
      for (const rel of concept.relationships) {
        if (!existing.relationships.find(r => r.target === rel.target && r.type === rel.type)) {
          existing.relationships.push(rel);
        }
      }
    } else {
      this.concepts.set(concept.id, { ...concept });
    }
    
    // Update relationship index
    this.updateRelationshipIndex(concept);
  }
  
  /**
   * Store a semantic relationship
   */
  async storeRelationship(relationship: SemanticRelationship, fromConcept: string): Promise<void> {
    if (!this.relationships.has(fromConcept)) {
      this.relationships.set(fromConcept, []);
    }
    
    const existingRels = this.relationships.get(fromConcept)!;
    const existingIndex = existingRels.findIndex(r => r.target === relationship.target && r.type === relationship.type);
    
    if (existingIndex >= 0) {
      // Update existing relationship
      existingRels[existingIndex].strength = Math.max(existingRels[existingIndex].strength, relationship.strength);
      existingRels[existingIndex].confidence = Math.max(existingRels[existingIndex].confidence, relationship.confidence);
    } else {
      // Add new relationship
      if (existingRels.length < 100) { // Limit relationships per concept
        existingRels.push(relationship);
      }
    }
  }
  
  /**
   * Query semantic memory
   */
  async query(query: MemoryQuery): Promise<SemanticConcept[]> {
    const results: SemanticConcept[] = [];
    const queryLower = query.query.toLowerCase();
    const currentTime = Date.now();
    
    for (const concept of this.concepts.values()) {
      // Apply time filter if specified
      if (query.timeRange) {
        if (concept.lastAccessed < query.timeRange.start || concept.lastAccessed > query.timeRange.end) {
          continue;
        }
      }
      
      // Apply importance filter
      if (query.importance && concept.importance < query.importance) {
        continue;
      }
      
      // Check text relevance
      let relevance = 0;
      if (concept.name.toLowerCase().includes(queryLower)) {
        relevance += 0.8;
      }
      
      // Check attributes for matches
      for (const [key, value] of Object.entries(concept.attributes)) {
        if (key.toLowerCase().includes(queryLower) || String(value).toLowerCase().includes(queryLower)) {
          relevance += 0.3;
        }
      }
      
      // Check relationships for matches
      for (const rel of concept.relationships) {
        if (rel.target.toLowerCase().includes(queryLower)) {
          relevance += 0.2;
        }
      }
      
      // Apply activation decay
      const timeSinceAccess = (currentTime - concept.lastAccessed) / (1000 * 60 * 60); // hours
      const decayedActivation = concept.activation * Math.exp(-this.activationDecayRate * timeSinceAccess);
      
      // Calculate final score
      const score = (relevance * 0.7 + decayedActivation * 0.3) * concept.importance;
      
      if (score > 0.1) { // Minimum threshold
        results.push({
          ...concept,
          activation: decayedActivation
        });
      }
    }
    
    // Sort by relevance and limit results
    results.sort((a, b) => (b.activation * b.importance) - (a.activation * a.importance));
    
    if (query.limit) {
      return results.slice(0, query.limit);
    }
    
    return results;
  }
  
  /**
   * Query by text (simplified interface)
   */
  async queryByText(text: string): Promise<SemanticConcept[]> {
    return this.query({
      query: text,
      types: ['semantic'],
      limit: 10
    });
  }
  
  /**
   * Update threat knowledge from reactive events
   */
  async updateThreatKnowledge(pattern: ThreatPattern): Promise<void> {
    const threatConcept = this.concepts.get('threat') || {
      id: 'threat',
      name: 'threat',
      type: 'property' as const,
      activation: 0,
      attributes: {},
      relationships: [],
      lastAccessed: Date.now(),
      importance: 1.0
    };
    
    // Update threat attributes based on pattern
    threatConcept.attributes[pattern.threatType] = {
      dangerous: true,
      responseStrategy: pattern.responseStrategy,
      escapeRoutes: pattern.escapeRoutes,
      lastEncountered: pattern.timestamp
    };
    
    threatConcept.activation = Math.min(1.0, threatConcept.activation + 0.2);
    threatConcept.lastAccessed = Date.now();
    
    await this.storeConcept(threatConcept);
  }
  
  /**
   * Get related concepts
   */
  getRelatedConcepts(conceptId: string, maxDepth: number = 2): SemanticConcept[] {
    const visited = new Set<string>();
    const results: SemanticConcept[] = [];
    
    const explore = (id: string, depth: number): void => {
      if (depth <= 0 || visited.has(id)) return;
      
      visited.add(id);
      const concept = this.concepts.get(id);
      if (!concept) return;
      
      results.push(concept);
      
      // Explore related concepts
      const relationships = this.relationships.get(id) || [];
      for (const rel of relationships) {
        if (rel.strength > 0.5) { // Only follow strong relationships
          explore(rel.target, depth - 1);
        }
      }
    };
    
    explore(conceptId, maxDepth);
    return results;
  }
  
  /**
   * Rank concepts by relevance to query
   */
  rankByRelevance(concepts: SemanticConcept[], query: MemoryQuery): SemanticConcept[] {
    return concepts.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, query);
      const scoreB = this.calculateRelevanceScore(b, query);
      return scoreB - scoreA;
    });
  }
  
  /**
   * Get memory statistics
   */
  getStatistics() {
    const totalActivation = Array.from(this.concepts.values()).reduce((sum, c) => sum + c.activation, 0);
    const totalRelationships = Array.from(this.relationships.values()).reduce((sum, rels) => sum + rels.length, 0);
    
    return {
      conceptCount: this.concepts.size,
      relationshipCount: totalRelationships,
      averageActivation: this.concepts.size > 0 ? totalActivation / this.concepts.size : 0
    };
  }
  
  /**
   * Cleanup old concepts to maintain performance
   */
  async cleanup(): Promise<void> {
    await this.cleanupLeastImportantConcepts();
    await this.cleanupWeakRelationships();
  }
  
  /**
   * Private helper methods
   */
  private updateRelationshipIndex(concept: SemanticConcept): void {
    for (const relationship of concept.relationships) {
      if (!this.relationships.has(concept.id)) {
        this.relationships.set(concept.id, []);
      }
      this.relationships.get(concept.id)!.push(relationship);
    }
  }
  
  private async cleanupLeastImportantConcepts(): Promise<void> {
    if (this.concepts.size <= this.maxConcepts * 0.8) return;
    
    const sorted = Array.from(this.concepts.entries())
      .sort(([, a], [, b]) => {
        const scoreA = a.importance * a.activation;
        const scoreB = b.importance * b.activation;
        return scoreA - scoreB;
      });
    
    // Remove bottom 20% of concepts
    const toRemove = Math.floor(sorted.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.concepts.delete(sorted[i][0]);
      this.relationships.delete(sorted[i][0]);
    }
  }
  
  private async cleanupWeakRelationships(): Promise<void> {
    let totalRelationships = Array.from(this.relationships.values())
      .reduce((sum, rels) => sum + rels.length, 0);
    
    if (totalRelationships <= this.maxRelationships * 0.8) return;
    
    for (const [conceptId, relationships] of this.relationships.entries()) {
      const filtered = relationships.filter(rel => rel.strength > 0.3 && rel.confidence > 0.5);
      this.relationships.set(conceptId, filtered);
    }
  }
  
  private calculateRelevanceScore(concept: SemanticConcept, query: MemoryQuery): number {
    const queryLower = query.query.toLowerCase();
    let score = 0;
    
    // Name matching
    if (concept.name.toLowerCase().includes(queryLower)) {
      score += 0.8;
    }
    
    // Attribute matching
    for (const [key, value] of Object.entries(concept.attributes)) {
      if (key.toLowerCase().includes(queryLower) || String(value).toLowerCase().includes(queryLower)) {
        score += 0.3;
      }
    }
    
    // Relationship matching
    for (const rel of concept.relationships) {
      if (rel.target.toLowerCase().includes(queryLower)) {
        score += 0.2;
      }
    }
    
    // Weight by activation and importance
    return score * concept.activation * concept.importance;
  }
}

// Additional type definitions
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