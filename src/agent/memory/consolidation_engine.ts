import type { 
  SemanticConcept, 
  ProceduralSkill, 
  WorldContext,
  Inventory
} from '../langgraph/interfaces.js';
import type { ExtendedEpisodicEvent, ExtractedPattern } from './episodic_memory.js';
import type { ThreatPattern } from './semantic_memory.js';

/**
 * Memory consolidation engine for pattern extraction and learning
 */
export class ConsolidationEngine {
  private patternRecognizers: PatternRecognizer[];
  private learningRules: LearningRule[];
  private consolidationHistory: ConsolidationRecord[] = [];
  
  private memorySystems: {
    semantic: any;
    episodic: any;
    procedural: any;
    working: any;
  } | null = null;
  
  constructor() {
    this.patternRecognizers = [
      new ActionOutcomeRecognizer(),
      new EmergencyResponseRecognizer(),
      new LocationPatternRecognizer(),
      new SocialPatternRecognizer()
    ];
    
    this.learningRules = [
      new ReinforcementLearningRule(),
      new PatternGeneralizationRule(),
      new FrequencyBasedRule()
    ];
  }
  
  /**
   * Set memory system references
   */
  setMemorySystems(systems: {
    semantic: any;
    episodic: any;
    procedural: any;
    working: any;
  }): void {
    this.memorySystems = systems;
  }
  
  /**
   * Extract patterns from episodic events
   */
  async extractPatterns(events: ExtendedEpisodicEvent[]): Promise<ConsolidationResult> {
    const patterns: ExtractedPattern[] = [];
    const importantEvents: string[] = [];
    
    for (const recognizer of this.patternRecognizers) {
      const recognizedPatterns = await recognizer.recognize(events);
      patterns.push(...recognizedPatterns);
    }
    
    // Identify important events for consolidation
    for (const event of events) {
      if (event.importance >= 0.7) {
        importantEvents.push(event.id);
      }
    }
    
    const result: ConsolidationResult = {
      patterns,
      importantEvents,
      timestamp: Date.now()
    };
    
    this.consolidationHistory.push({
      timestamp: Date.now(),
      eventCount: events.length,
      patternsFound: patterns.length,
      eventsConsolidated: importantEvents.length
    });
    
    return result;
  }
  
  /**
   * Extract survival patterns from reactive events
   */
  async extractSurvivalPatterns(event: ExtendedEpisodicEvent): Promise<ThreatPattern[]> {
    const patterns: ThreatPattern[] = [];
    
    if (event.emotional?.urgency && event.emotional.urgency >= 0.8) {
      // Create threat pattern
      const threatPattern: ThreatPattern = {
        type: 'threat',
        threatType: this.classifyThreatType(event),
        responseStrategy: event.action || 'unknown',
        escapeRoutes: this.extractEscapeRoutes(event),
        timestamp: event.timestamp,
        context: {
          position: event.location,
          health: 20,
          food: 20,
          experience: 0,
          dimension: 'overworld',
          timeOfDay: 0,
          weather: 'clear',
          nearbyEntities: [],
          nearbyBlocks: [],
          inventory: {
            items: [],
            slots: 36,
            usedSlots: 0,
            length: 0
          } as Inventory,
          equipment: {
            helmet: undefined,
            chestplate: undefined,
            leggings: undefined,
            boots: undefined,
            weapon: undefined
          }
        }
      };
      
      patterns.push(threatPattern);
    }
    
    return patterns;
  }
  
  /**
   * Create emergency skill from reactive event
   */
  async createEmergencySkill(event: ExtendedEpisodicEvent): Promise<ProceduralSkill | null> {
    if (!event.action || !event.success) return null;
    
    const skill: ProceduralSkill = {
      id: `emergency_${event.type}_${Date.now()}`,
      name: `Emergency ${event.type} Response`,
      type: 'strategy',
      sequence: [
        {
          id: 'assess_threat',
          action: 'assess_threat',
          parameters: { threat_type: event.type },
          conditions: ['danger_detected'],
          expectedOutcome: 'threat_identified',
          duration: 100
        },
        {
          id: 'response_action',
          action: event.action,
          parameters: event.metadata?.parameters || {},
          conditions: ['threat_identified'],
          expectedOutcome: event.outcome || 'threat_avoided',
          duration: event.duration || 1000
        }
      ],
      conditions: [event.type, 'emergency'],
      outcomes: [event.outcome || 'survived', 'threat_avoided'],
      proficiency: event.importance,
      usageCount: 1,
      lastUsed: event.timestamp,
      adaptations: []
    };
    
    return skill;
  }
  
  /**
   * Apply learning rules to consolidate knowledge
   */
  async applyLearning(patterns: ExtractedPattern[]): Promise<LearningResult[]> {
    const results: LearningResult[] = [];
    
    for (const rule of this.learningRules) {
      const ruleResults = await rule.apply(patterns, this.memorySystems);
      results.push(...ruleResults);
    }
    
    return results;
  }
  
  /**
   * Get consolidation statistics
   */
  getStatistics(): ConsolidationStatistics {
    const recent = this.consolidationHistory.filter(
      record => record.timestamp > Date.now() - (24 * 60 * 60 * 1000) // Last 24 hours
    );
    
    const totalEvents = recent.reduce((sum, record) => sum + record.eventCount, 0);
    const totalPatterns = recent.reduce((sum, record) => sum + record.patternsFound, 0);
    const totalConsolidated = recent.reduce((sum, record) => sum + record.eventsConsolidated, 0);
    
    return {
      totalConsolidations: this.consolidationHistory.length,
      recentConsolidations: recent.length,
      averagePatternsPerEvent: totalEvents > 0 ? totalPatterns / totalEvents : 0,
      consolidationRate: totalEvents > 0 ? totalConsolidated / totalEvents : 0,
      lastConsolidation: this.consolidationHistory.length > 0 
        ? this.consolidationHistory[this.consolidationHistory.length - 1]?.timestamp || 0
        : 0
    };
  }
  
  /**
   * Private helper methods
   */
  private classifyThreatType(event: ExtendedEpisodicEvent): string {
    if (event.type.includes('hostile') || event.type.includes('mob')) return 'hostile_mob';
    if (event.type.includes('drowning')) return 'drowning';
    if (event.type.includes('burning') || event.type.includes('fire')) return 'fire';
    if (event.type.includes('fall')) return 'fall_damage';
    if (event.type.includes('hunger')) return 'starvation';
    return 'unknown_threat';
  }
  
  private extractEscapeRoutes(event: ExtendedEpisodicEvent): string[] {
    const routes: string[] = [];
    
    // Extract escape routes from event metadata
    if (event.metadata?.escapeRoutes) {
      routes.push(...event.metadata.escapeRoutes);
    }
    
    // Add default escape strategies
    routes.push('retreat', 'find_shelter', 'use_item');
    
    return routes;
  }
}

// Pattern Recognizers
abstract class PatternRecognizer {
  abstract recognize(events: ExtendedEpisodicEvent[]): Promise<ExtractedPattern[]>;
}

class ActionOutcomeRecognizer extends PatternRecognizer {
  async recognize(events: ExtendedEpisodicEvent[]): Promise<ExtractedPattern[]> {
    const patterns: ExtractedPattern[] = [];
    const actionOutcomes = new Map<string, { outcomes: string[]; frequency: number }>();
    
    // Group events by action
    for (const event of events) {
      if (event.action && event.outcome) {
        if (!actionOutcomes.has(event.action)) {
          actionOutcomes.set(event.action, { outcomes: [], frequency: 0 });
        }
        
        const entry = actionOutcomes.get(event.action)!;
        if (!entry.outcomes.includes(event.outcome)) {
          entry.outcomes.push(event.outcome);
        }
        entry.frequency++;
      }
    }
    
    // Create patterns for frequent action-outcome pairs
    for (const [action, data] of Array.from(actionOutcomes.entries())) {
      if (data.frequency >= 3) { // Pattern threshold
        patterns.push({
          type: 'action_outcome',
          action,
          outcome: data.outcomes.join(','),
          confidence: Math.min(1.0, data.frequency / 10)
        });
      }
    }
    
    return patterns;
  }
}

class EmergencyResponseRecognizer extends PatternRecognizer {
  async recognize(events: ExtendedEpisodicEvent[]): Promise<ExtractedPattern[]> {
    const patterns: ExtractedPattern[] = [];
    
    for (const event of events) {
      if (event.emotional?.urgency && event.emotional.urgency >= 0.8) {
        patterns.push({
          type: 'emergency_response',
          trigger: event.type,
          response: event.action || 'no_action',
          emotional: event.emotional,
          confidence: event.importance
        });
      }
    }
    
    return patterns;
  }
}

class LocationPatternRecognizer extends PatternRecognizer {
  async recognize(events: ExtendedEpisodicEvent[]): Promise<ExtractedPattern[]> {
    const patterns: ExtractedPattern[] = [];
    const locationEvents = new Map<string, ExtendedEpisodicEvent[]>();
    
    // Group events by location
    for (const event of events) {
      const locationKey = `${Math.floor(event.location.x / 10)}_${Math.floor(event.location.z / 10)}`;
      if (!locationEvents.has(locationKey)) {
        locationEvents.set(locationKey, []);
      }
      locationEvents.get(locationKey)!.push(event);
    }
    
    // Find patterns in locations
    for (const [location, eventsAtLocation] of Array.from(locationEvents.entries())) {
      if (eventsAtLocation.length >= 5) {
        const commonTypes = this.getCommonEventTypes(eventsAtLocation);
        if (commonTypes.length > 0) {
          patterns.push({
            type: 'location_pattern',
            context: { location, commonEvents: commonTypes },
            confidence: eventsAtLocation.length / 10
          });
        }
      }
    }
    
    return patterns;
  }
  
  private getCommonEventTypes(events: ExtendedEpisodicEvent[]): string[] {
    const typeCounts = new Map<string, number>();
    
    for (const event of events) {
      typeCounts.set(event.type, (typeCounts.get(event.type) || 0) + 1);
    }
    
    return Array.from(typeCounts.entries())
      .filter(([, count]) => count >= 3)
      .map(([type]) => type);
  }
}

class SocialPatternRecognizer extends PatternRecognizer {
  async recognize(events: ExtendedEpisodicEvent[]): Promise<ExtractedPattern[]> {
    const patterns: ExtractedPattern[] = [];
    
    // Look for social interaction patterns
    const socialEvents = events.filter(event => 
      event.participants && event.participants.length > 1
    );
    
    if (socialEvents.length >= 3) {
      patterns.push({
        type: 'social_pattern',
        context: { 
          interactionCount: socialEvents.length,
          participantTypes: this.extractParticipantTypes(socialEvents)
        },
        confidence: socialEvents.length / 5
      });
    }
    
    return patterns;
  }
  
  private extractParticipantTypes(events: ExtendedEpisodicEvent[]): string[] {
    const types = new Set<string>();
    
    for (const event of events) {
      if (event.participants) {
        event.participants.forEach(p => types.add(p));
      }
    }
    
    return Array.from(types);
  }
}

// Learning Rules
abstract class LearningRule {
  abstract apply(patterns: ExtractedPattern[], memorySystems: any): Promise<LearningResult[]>;
}

class ReinforcementLearningRule extends LearningRule {
  async apply(patterns: ExtractedPattern[], memorySystems: any): Promise<LearningResult[]> {
    const results: LearningResult[] = [];
    
    for (const pattern of patterns) {
      if (pattern.type === 'action_outcome' && pattern.confidence > 0.7 && pattern.action) {
        results.push({
          type: 'skill_improvement',
          target: pattern.action,
          improvement: pattern.confidence * 0.1,
          reason: 'successful_outcome_pattern'
        });
      }
    }
    
    return results;
  }
}

class PatternGeneralizationRule extends LearningRule {
  async apply(patterns: ExtractedPattern[], memorySystems: any): Promise<LearningResult[]> {
    const results: LearningResult[] = [];
    
    // Group similar patterns and create generalizations
    const groupedPatterns = this.groupSimilarPatterns(patterns);
    
    for (const [group, patternList] of Array.from(groupedPatterns.entries())) {
      if (patternList.length >= 3) {
        results.push({
          type: 'concept_formation',
          target: group,
          improvement: patternList.length * 0.05,
          reason: 'pattern_generalization'
        });
      }
    }
    
    return results;
  }
  
  private groupSimilarPatterns(patterns: ExtractedPattern[]): Map<string, ExtractedPattern[]> {
    const groups = new Map<string, ExtractedPattern[]>();
    
    for (const pattern of patterns) {
      const groupKey = `${pattern.type}_${pattern.action || pattern.trigger || 'unknown'}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(pattern);
    }
    
    return groups;
  }
}

class FrequencyBasedRule extends LearningRule {
  async apply(patterns: ExtractedPattern[], memorySystems: any): Promise<LearningResult[]> {
    const results: LearningResult[] = [];
    
    // Boost importance of frequently occurring patterns
    const patternCounts = new Map<string, number>();
    
    for (const pattern of patterns) {
      const key = `${pattern.type}_${pattern.action || pattern.trigger || 'unknown'}`;
      patternCounts.set(key, (patternCounts.get(key) || 0) + 1);
    }
    
    for (const [key, count] of Array.from(patternCounts.entries())) {
      if (count >= 5) {
        results.push({
          type: 'importance_boost',
          target: key,
          improvement: Math.min(0.5, count * 0.02),
          reason: 'high_frequency_pattern'
        });
      }
    }
    
    return results;
  }
}

// Type definitions
export interface ConsolidationResult {
  patterns: ExtractedPattern[];
  importantEvents: string[];
  timestamp: number;
}

export interface LearningResult {
  type: 'skill_improvement' | 'concept_formation' | 'importance_boost' | 'adaptation_creation';
  target: string;
  improvement: number;
  reason: string;
}

export interface ConsolidationRecord {
  timestamp: number;
  eventCount: number;
  patternsFound: number;
  eventsConsolidated: number;
}

export interface ConsolidationStatistics {
  totalConsolidations: number;
  recentConsolidations: number;
  averagePatternsPerEvent: number;
  consolidationRate: number;
  lastConsolidation: number;
}