import type {
  WorldContext
} from '../langgraph/interfaces.js';
import type { ExtendedEpisodicEvent, ExtractedPattern } from './episodic_memory.js';

// Define interfaces locally since they're not exported from interfaces.js
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
  timeRange?: { start: number; end: number };
  limit?: number;
}

/**
 * Pattern extraction utility for identifying recurring patterns in episodic events
 */
class PatternExtractor {
  /**
   * Extract patterns from an episodic event
   */
  async extractPatterns(event: ExtendedEpisodicEvent): Promise<ExtractedPattern[]> {
    const patterns: ExtractedPattern[] = [];
    
    // Extract action-outcome patterns
    if (event.action && event.outcome) {
      patterns.push({
        type: 'action_outcome',
        action: event.action,
        outcome: event.outcome,
        confidence: event.importance
      });
    }
    
    // Extract emergency response patterns
    if (event.emotional?.urgency && event.emotional.urgency >= 0.7) {
      patterns.push({
        type: 'emergency_response',
        trigger: event.type,
        response: event.action || 'no_action',
        emotional: event.emotional,
        confidence: event.importance
      });
    }
    
    // Extract social patterns
    if (event.participants && event.participants.length > 1) {
      patterns.push({
        type: 'social_pattern',
        context: {
          participantCount: event.participants.length,
          interactionType: event.type
        },
        confidence: event.importance * 0.8
      });
    }
    
    // Extract location patterns
    patterns.push({
      type: 'location_pattern',
      context: {
        location: event.location,
        eventType: event.type,
        success: event.success
      },
      confidence: event.importance * 0.6
    });
    
    // Extract resource patterns if applicable
    if (event.action && (event.action.includes('collect') || event.action.includes('craft') || event.action.includes('use'))) {
      patterns.push({
        type: 'resource_pattern' as any, // Type cast to handle the enum limitation
        action: event.action,
        outcome: event.outcome || 'unknown',
        context: {
          availability: event.success ? 'available' : 'unavailable',
          efficiency: event.success ? event.importance : event.importance * 0.5
        },
        confidence: event.importance
      });
    }
    
    return patterns;
  }
}

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

  private patternExtractor: PatternExtractor;

  constructor() {
    this.patternExtractor = new PatternExtractor();
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
   * Generalize experience from episodic event to create semantic knowledge
   */
  async generalizeExperience(experience: ExtendedEpisodicEvent): Promise<void> {
    // Extract patterns from the episodic event
    const patterns = await this.patternExtractor.extractPatterns(experience);
    
    // Process each pattern to create or update semantic concepts
    for (const pattern of patterns) {
      await this.processPattern(pattern, experience);
    }
    
    // Extract and store action-outcome relationships
    if (experience.action && experience.outcome) {
      await this.generalizeActionOutcome(experience);
    }
    
    // Extract environmental correlations
    await this.generalizeEnvironmentalPatterns(experience);
    
    // Extract temporal patterns
    await this.generalizeTemporalPatterns(experience);
  }

  /**
   * Process extracted pattern to create semantic knowledge
   */
  private async processPattern(pattern: ExtractedPattern, experience: ExtendedEpisodicEvent): Promise<void> {
    switch (pattern.type) {
      case 'action_outcome':
        await this.createActionOutcomeConcept(pattern, experience);
        break;
      case 'emergency_response':
        await this.createEmergencyConcept(pattern, experience);
        break;
      case 'social_pattern':
        await this.createSocialConcept(pattern, experience);
        break;
      case 'location_pattern':
        await this.createLocationConcept(pattern, experience);
        break;
      case 'resource_pattern':
        await this.createResourceConcept(pattern, experience);
        break;
    }
  }

  /**
   * Create concept from action-outcome pattern
   */
  private async createActionOutcomeConcept(pattern: ExtractedPattern, experience: ExtendedEpisodicEvent): Promise<void> {
    const actionName = pattern.action || 'unknown_action';
    const conceptId = `action_${actionName}`;
    
    const existingConcept = this.concepts.get(conceptId);
    const effectiveness = experience.success ? pattern.confidence : pattern.confidence * 0.3;
    
    const concept: SemanticConcept = {
      id: conceptId,
      name: `${actionName} Action`,
      type: 'procedure',
      activation: Math.min(1.0, (existingConcept?.activation || 0.5) + effectiveness * 0.2),
      attributes: {
        action: actionName,
        typicalOutcome: pattern.outcome || experience.outcome,
        effectiveness: effectiveness,
        context: experience.type,
        frequency: (existingConcept?.attributes?.frequency || 0) + 1
      },
      importance: Math.min(1.0, (existingConcept?.importance || 0.5) + effectiveness * 0.1),
      relationships: existingConcept?.relationships || [],
      lastAccessed: Date.now()
    };
    
    await this.storeConcept(concept);
    
    // Create relationship to outcome
    if (pattern.outcome) {
      await this.storeRelationship({
        type: 'causal',
        target: pattern.outcome,
        strength: effectiveness,
        confidence: pattern.confidence
      }, conceptId);
    }
  }

  /**
   * Create concept from emergency response pattern
   */
  private async createEmergencyConcept(pattern: ExtractedPattern, experience: ExtendedEpisodicEvent): Promise<void> {
    const conceptId = `emergency_${pattern.trigger || 'unknown'}`;
    
    const concept: SemanticConcept = {
      id: conceptId,
      name: `Emergency ${pattern.trigger} Response`,
      type: 'schema',
      activation: 0.8,
      attributes: {
        trigger: pattern.trigger,
        response: pattern.response,
        urgency: pattern.emotional?.urgency || 0.8,
        effectiveness: experience.success ? 0.9 : 0.4,
        lastUsed: experience.timestamp
      },
      importance: 0.9,
      relationships: [],
      lastAccessed: Date.now()
    };
    
    await this.storeConcept(concept);
    
    // Link to danger concept
    await this.storeRelationship({
      type: 'mitigates',
      target: 'danger',
      strength: 0.8,
      confidence: pattern.confidence
    }, conceptId);
  }

  /**
   * Create concept from social pattern
   */
  private async createSocialConcept(pattern: ExtractedPattern, experience: ExtendedEpisodicEvent): Promise<void> {
    const conceptId = `social_${experience.type}`;
    
    const concept: SemanticConcept = {
      id: conceptId,
      name: `Social ${experience.type} Pattern`,
      type: 'schema',
      activation: 0.6,
      attributes: {
        interactionType: experience.type,
        participants: experience.participants,
        context: pattern.context,
        frequency: 1,
        successRate: experience.success ? 1.0 : 0.5
      },
      importance: 0.7,
      relationships: [],
      lastAccessed: Date.now()
    };
    
    await this.storeConcept(concept);
  }

  /**
   * Create concept from location pattern
   */
  private async createLocationConcept(pattern: ExtractedPattern, experience: ExtendedEpisodicEvent): Promise<void> {
    const locationKey = `${Math.floor(experience.location.x / 10)}_${Math.floor(experience.location.z / 10)}`;
    const conceptId = `location_${locationKey}`;
    
    const existingConcept = this.concepts.get(conceptId);
    const commonEvents = pattern.context?.commonEvents || [experience.type];
    
    const concept: SemanticConcept = {
      id: conceptId,
      name: `Location Area ${locationKey}`,
      type: 'location',
      activation: Math.min(1.0, (existingConcept?.activation || 0.5) + 0.1),
      attributes: {
        location: experience.location,
        areaKey: locationKey,
        commonEvents: commonEvents,
        visitCount: (existingConcept?.attributes?.visitCount || 0) + 1,
        lastVisit: experience.timestamp,
        danger: pattern.context?.danger || 0.1,
        resources: pattern.context?.resources || []
      },
      importance: Math.min(1.0, (existingConcept?.importance || 0.5) + 0.05),
      relationships: existingConcept?.relationships || [],
      lastAccessed: Date.now()
    };
    
    await this.storeConcept(concept);
  }

  /**
   * Create concept from resource pattern
   */
  private async createResourceConcept(pattern: ExtractedPattern, experience: ExtendedEpisodicEvent): Promise<void> {
    const resourceId = pattern.action || 'unknown_resource';
    const conceptId = `resource_${resourceId}`;
    
    const concept: SemanticConcept = {
      id: conceptId,
      name: `Resource ${resourceId}`,
      type: 'entity',
      activation: 0.7,
      attributes: {
        resourceType: resourceId,
        availability: pattern.context?.availability || 'unknown',
        location: experience.location,
        usage: pattern.outcome,
        value: pattern.confidence
      },
      importance: 0.6,
      relationships: [],
      lastAccessed: Date.now()
    };
    
    await this.storeConcept(concept);
  }

  /**
   * Generalize action-outcome relationships
   */
  private async generalizeActionOutcome(experience: ExtendedEpisodicEvent): Promise<void> {
    const actionConceptId = `action_${experience.action}`;
    const outcomeConceptId = `outcome_${experience.outcome}`;
    
    // Create outcome concept if it doesn't exist
    if (!this.concepts.has(outcomeConceptId)) {
      const outcomeConcept: SemanticConcept = {
        id: outcomeConceptId,
        name: experience.outcome || 'unknown_outcome',
        type: 'property',
        activation: 0.5,
        attributes: {
          type: 'outcome',
          valence: experience.success ? 'positive' : 'negative',
          frequency: 1
        },
        importance: experience.success ? 0.6 : 0.4,
        relationships: [],
        lastAccessed: Date.now()
      };
      await this.storeConcept(outcomeConcept);
    }
    
    // Strengthen the relationship
    const strength = experience.success ? 0.8 : 0.3;
    await this.storeRelationship({
      type: 'produces',
      target: outcomeConceptId,
      strength: strength,
      confidence: experience.importance
    }, actionConceptId);
  }

  /**
   * Generalize environmental patterns
   */
  private async generalizeEnvironmentalPatterns(experience: ExtendedEpisodicEvent): Promise<void> {
    // Extract environmental context patterns
    const envContext = `${experience.location.x}_${experience.location.y}_${experience.location.z}`;
    const contextConceptId = `context_${envContext}`;
    
    const existingConcept = this.concepts.get(contextConceptId);
    const contextConcept: SemanticConcept = {
      id: contextConceptId,
      name: `Environmental Context ${envContext}`,
      type: 'context',
      activation: 0.4,
      attributes: {
        location: experience.location,
        typicalActions: existingConcept?.attributes?.typicalActions ? 
          [...existingConcept.attributes.typicalActions, experience.action].filter((v, i, a) => a.indexOf(v) === i) :
          [experience.action],
        outcomes: existingConcept?.attributes?.outcomes ? 
          [...existingConcept.attributes.outcomes, experience.outcome].filter((v, i, a) => a.indexOf(v) === i) :
          [experience.outcome],
        visitCount: (existingConcept?.attributes?.visitCount || 0) + 1
      },
      importance: 0.3,
      relationships: existingConcept?.relationships || [],
      lastAccessed: Date.now()
    };
    
    await this.storeConcept(contextConcept);
  }

  /**
   * Generalize temporal patterns
   */
  private async generalizeTemporalPatterns(experience: ExtendedEpisodicEvent): Promise<void> {
    const hour = new Date(experience.timestamp).getHours();
    const timeConceptId = `time_${hour}`;
    
    const existingConcept = this.concepts.get(timeConceptId);
    const timeConcept: SemanticConcept = {
      id: timeConceptId,
      name: `Time Period ${hour}:00`,
      type: 'temporal',
      activation: 0.3,
      attributes: {
        hour: hour,
        typicalActivities: existingConcept?.attributes?.typicalActivities ? 
          [...existingConcept.attributes.typicalActivities, experience.action].filter((v, i, a) => a.indexOf(v) === i) :
          [experience.action],
        frequency: (existingConcept?.attributes?.frequency || 0) + 1
      },
      importance: 0.2,
      relationships: existingConcept?.relationships || [],
      lastAccessed: Date.now()
    };
    
    await this.storeConcept(timeConcept);
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
      const existingRel = existingRels[existingIndex];
      if (existingRel) {
        // Update existing relationship
        existingRel.strength = Math.max(existingRel.strength, relationship.strength);
        existingRel.confidence = Math.max(existingRel.confidence, relationship.confidence);
      }
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

    for (const concept of Array.from(this.concepts.values())) {
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
    results.sort((a, b) => (b.activation * b.importance) - (a.activation * b.importance));

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
      const id = sorted[i]?.[0];
      if (id !== undefined) {
        this.concepts.delete(id);
        this.relationships.delete(id);
      }
    }
  }

  private async cleanupWeakRelationships(): Promise<void> {
    let totalRelationships = Array.from(this.relationships.values())
      .reduce((sum, rels) => sum + rels.length, 0);

    if (totalRelationships <= this.maxRelationships * 0.8) return;

    for (const [conceptId, relationships] of Array.from(this.relationships.entries())) {
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