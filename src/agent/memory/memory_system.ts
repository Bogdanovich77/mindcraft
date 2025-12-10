import { SemanticMemory } from './semantic_memory.js';
import { EpisodicMemory, type ExtendedEpisodicEvent } from './episodic_memory.js';
import { ProceduralMemory } from './procedural_memory.js';
import { WorkingMemory } from './working_memory.js';
import { ConsolidationEngine } from './consolidation_engine.js';
import type {
  AgentState,
  WorldContext,
  MemoryQuery,
  MemoryRetrieval,
  EpisodicEvent,
  SemanticConcept,
  SemanticRelationship,
  ProceduralSkill,
  ProceduralStep,
  ProceduralAdaptation,
  WorkingMemoryState,
  WorkingMemoryItem,
  MemoryStatistics,
  SocialState
} from '../langgraph/interfaces.js';
import type { ThreatPattern } from './semantic_memory.js';

/**
 * Main memory system orchestrator that coordinates all memory components
 */
export class MemorySystem {
  private semantic: SemanticMemory;
  private episodic: EpisodicMemory;
  private procedural: ProceduralMemory;
  private working: WorkingMemory;
  private consolidation: ConsolidationEngine;
  private bridge: any; // Lazy-loaded to avoid circular import
  private socialState?: SocialState;
  
  private lastConsolidation: number = 0;
  private consolidationInterval: number = 60000; // 1 minute
  
  // Social memory tracking
  private socialMemories: Map<string, any[]> = new Map(); // agentId -> social memories
  private relationshipHistory: Map<string, any[]> = new Map(); // agentId -> relationship changes
  private socialPatterns: Map<string, any[]> = new Map(); // pattern -> occurrences
  
  constructor() {
    this.semantic = new SemanticMemory();
    this.episodic = new EpisodicMemory();
    this.procedural = new ProceduralMemory();
    this.working = new WorkingMemory();
    this.consolidation = new ConsolidationEngine();
    
    this.setupMemoryInteractions();
  }
  
  /**
   * Lazy load MemoryBridge to avoid circular import
   */
  private getBridge(): any {
    if (!this.bridge) {
      const { MemoryBridge } = require('./memory_bridge');
      this.bridge = new MemoryBridge();
    }
    return this.bridge;
  }
  
  /**
   * Initialize memory system with legacy data
   */
  async initialize(legacyMemoryBank?: any): Promise<void> {
    if (legacyMemoryBank) {
      const bridge = this.getBridge();
      await bridge.migrateLegacyMemory(legacyMemoryBank, this);
    }
    
    // Initialize basic semantic concepts
    await this.semantic.initializeBasicConcepts();
    
    console.log('Memory system initialized successfully');
  }
  
  /**
   * Update memory system with new experience
   */
  async update(agentState: AgentState, deltaTime: number): Promise<void> {
    const currentTime = Date.now();
    
    // Update working memory with current context
    await this.working.update(agentState, deltaTime);
    
    // Check for consolidation opportunity
    if (currentTime - this.lastConsolidation > this.consolidationInterval) {
      await this.performConsolidation(agentState);
      this.lastConsolidation = currentTime;
    }
    
    // Decay old memories
    await this.episodic.applyDecay(deltaTime);
    this.working.applyDecay(deltaTime);
  }
  
  /**
   * Store new episodic event
   */
  async storeEvent(event: ExtendedEpisodicEvent): Promise<void> {
    await this.episodic.storeEvent(event);
    
    // Add to working memory for immediate processing
    this.working.addEvent(event);
    
    // Trigger reactive learning if emergency situation
    if (event.emotional?.urgency && event.emotional.urgency >= 0.8) {
      await this.learnFromReactiveEvent(event);
    }
  }
  
  /**
   * Store semantic knowledge
   */
  async storeSemanticConcept(concept: SemanticConcept): Promise<void> {
    await this.semantic.storeConcept(concept);
  }
  
  /**
   * Store procedural knowledge
   */
  async storeProceduralSkill(skill: ProceduralSkill): Promise<void> {
    await this.procedural.storeSkill(skill);
  }
  
  /**
   * Query memory for relevant information
   */
  async query(query: MemoryQuery): Promise<MemoryRetrieval> {
    const results: MemoryRetrieval = {
      semantic: [],
      episodic: [],
      procedural: [],
      working: []
    };
    
    // Query each memory system based on query type
    if (query.types.includes('semantic') || query.types.includes('all')) {
      results.semantic = await this.semantic.query(query);
    }
    
    if (query.types.includes('episodic') || query.types.includes('all')) {
      results.episodic = await this.episodic.query(query);
    }
    
    if (query.types.includes('procedural') || query.types.includes('all')) {
      results.procedural = await this.procedural.query(query);
    }
    
    if (query.types.includes('working') || query.types.includes('all')) {
      results.working = this.working.query(query);
    }
    
    // Rank and filter results by relevance
    return this.rankResults(results, query);
  }
  
  /**
   * Get current working memory state
   */
  getWorkingMemory(): WorkingMemoryState {
    return this.working.getState();
  }
  
  /**
   * Get memory statistics
   */
  getStatistics(): MemoryStatistics {
    return {
      semantic: this.semantic.getStatistics(),
      episodic: this.episodic.getStatistics(),
      procedural: this.procedural.getStatistics(),
      working: this.working.getStatistics(),
      lastConsolidation: this.lastConsolidation
    };
  }
  
  /**
   * Learn from reactive emergency events
   */
  private async learnFromReactiveEvent(event: ExtendedEpisodicEvent): Promise<void> {
    // Extract survival patterns
    const patterns = await this.consolidation.extractSurvivalPatterns(event);
    
    // Update semantic knowledge about threats
    for (const pattern of patterns) {
      if (pattern.type === 'threat') {
        await this.semantic.updateThreatKnowledge(pattern);
      }
    }
    
    // Update procedural skills for emergency response
    if (event.action && event.location) {
      const emergencySkill = await this.consolidation.createEmergencySkill(event);
      if (emergencySkill) {
        await this.procedural.storeSkill(emergencySkill);
      }
    }
  }
  
  /**
   * Perform memory consolidation
   */
  private async performConsolidation(agentState: AgentState): Promise<void> {
    // Get recent episodic events for consolidation
    const recentEvents = await this.episodic.getRecentEvents(3600000); // 1 hour
    
    // Extract patterns and create semantic knowledge
    const consolidationResult = await this.consolidation.extractPatterns(recentEvents);
    
    // Apply learning rules to extracted patterns
    const learningResults = await this.consolidation.applyLearning(consolidationResult.patterns);
    
    // Process learning results
    for (const result of learningResults) {
      switch (result.type) {
        case 'concept_formation':
          // Create semantic concept from pattern
          if (result.target) {
            await this.semantic.storeConcept({
              id: `concept_${result.target}_${Date.now()}`,
              name: result.target,
              type: 'entity',
              activation: 0.5,
              attributes: { learned: true, importance: result.improvement },
              relationships: [],
              lastAccessed: Date.now(),
              importance: result.improvement
            });
          }
          break;
        case 'skill_improvement':
          // Improve existing skill or create new one
          if (result.target) {
            const existingSkills = await this.procedural.query({
              query: result.target,
              types: ['procedural'],
              limit: 1
            });
            
            if (existingSkills.length > 0) {
              const skill = existingSkills[0];
              skill.proficiency = Math.min(1.0, skill.proficiency + result.improvement);
              await this.procedural.storeSkill(skill);
            }
          }
          break;
      }
    }
    
    // Consolidate important episodic events
    // The consolidateEvents method expects event IDs, not event objects
    await this.episodic.consolidateEvents(consolidationResult.importantEvents);
  }
  
  /**
   * Setup interactions between memory systems
   */
  private setupMemoryInteractions(): void {
    // Working memory can trigger semantic queries
    this.working.onSemanticQuery(async (query: string) => {
      return await this.semantic.queryByText(query);
    });
    
    // Episodic memory can inform procedural learning
    this.episodic.onEventStored(async (event: ExtendedEpisodicEvent) => {
      if (event.action && event.success) {
        await this.procedural.learnFromExperience(event);
      }
    });
    
    // Consolidation engine monitors all systems
    this.consolidation.setMemorySystems({
      semantic: this.semantic,
      episodic: this.episodic,
      procedural: this.procedural,
      working: this.working
    });
  }
  
  /**
   * Rank query results by relevance
   */
  private rankResults(results: MemoryRetrieval, query: MemoryQuery): MemoryRetrieval {
    // Rank each result set by relevance to query
    results.semantic = this.semantic.rankByRelevance(results.semantic, query);
    
    // Cast episodic results to ExtendedEpisodicEvent[] for ranking
    results.episodic = this.episodic.rankByRelevance(
      results.episodic as ExtendedEpisodicEvent[],
      query
    );
    
    results.procedural = this.procedural.rankByRelevance(results.procedural, query);
    results.working = this.working.rankByRelevance(results.working, query);
    
    return results;
  }
  
  /**
   * Set social state for social-aware memory processing
   */
  setSocialState(socialState: SocialState): void {
    this.socialState = socialState;
  }
  
  /**
   * Store social memory about another agent
   */
  async storeSocialMemory(
    targetAgentId: string,
    memoryType: 'interaction' | 'observation' | 'relationship' | 'collaboration',
    content: any,
    emotional: {
      valence: number; // -1 to 1 (negative to positive)
      arousal: number; // 0 to 1 (calm to excited)
      dominance: number; // -1 to 1 (submissive to dominant)
    },
    context: any
  ): Promise<void> {
    const socialMemory = {
      id: `social_mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      targetAgentId,
      memoryType,
      content,
      emotional,
      context: {
        ...context,
        location: context.location || { x: 0, y: 0, z: 0 },
        timestamp: Date.now(),
        participants: context.participants || [],
        situation: context.situation || 'unknown'
      },
      timestamp: Date.now(),
      importance: this.calculateSocialMemoryImportance(memoryType, emotional, context),
      decayRate: this.calculateSocialMemoryDecay(memoryType),
      retrievalCount: 0,
      lastAccessed: Date.now()
    };
    
    // Store in agent-specific memories
    if (!this.socialMemories.has(targetAgentId)) {
      this.socialMemories.set(targetAgentId, []);
    }
    this.socialMemories.get(targetAgentId)!.push(socialMemory);
    
    // Also store as episodic event for cross-referencing
    await this.episodic.storeEvent({
      id: socialMemory.id,
      type: 'social_interaction',
      timestamp: socialMemory.timestamp,
      duration: 0, // Social interactions are typically brief
      location: socialMemory.context.location,
      participants: [targetAgentId, ...(context.participants || [])],
      actions: [{
        actor: this.socialState?.relationships?.agentId || 'self',
        action: memoryType,
        target: targetAgentId,
        timestamp: socialMemory.timestamp,
        result: emotional.valence > 0 ? 'positive' : 'negative'
      }],
      outcomes: [`${memoryType} with ${targetAgentId}`],
      emotionalImpact: emotional.valence,
      importance: socialMemory.importance,
      tags: ['social', memoryType, targetAgentId]
    });
    
    // Update relationship history if relationship memory
    if (memoryType === 'relationship') {
      await this.updateRelationshipHistory(targetAgentId, content);
    }
    
    // Extract and store social patterns
    await this.extractSocialPattern(memoryType, content, context);
  }
  
  /**
   * Query social memories about specific agent
   */
  async querySocialMemories(
    targetAgentId: string,
    memoryTypes?: string[],
    timeRange?: { start: number; end: number },
    importance?: { min: number; max: number }
  ): Promise<any[]> {
    const agentMemories = this.socialMemories.get(targetAgentId) || [];
    
    let filteredMemories = agentMemories;
    
    // Filter by memory types
    if (memoryTypes && memoryTypes.length > 0) {
      filteredMemories = filteredMemories.filter(memory =>
        memoryTypes.includes(memory.memoryType)
      );
    }
    
    // Filter by time range
    if (timeRange) {
      filteredMemories = filteredMemories.filter(memory =>
        memory.timestamp >= timeRange.start && memory.timestamp <= timeRange.end
      );
    }
    
    // Filter by importance
    if (importance) {
      filteredMemories = filteredMemories.filter(memory =>
        memory.importance >= importance.min && memory.importance <= importance.max
      );
    }
    
    // Update retrieval count and last accessed
    filteredMemories.forEach(memory => {
      memory.retrievalCount++;
      memory.lastAccessed = Date.now();
    });
    
    // Sort by importance and recency
    return filteredMemories.sort((a, b) => {
      const importanceDiff = b.importance - a.importance;
      const recencyDiff = b.timestamp - a.timestamp;
      
      // Weight importance more than recency for social memories
      return importanceDiff * 0.7 + recencyDiff * 0.3;
    });
  }
  
  /**
   * Get relationship history with agent
   */
  async getRelationshipHistory(agentId: string): Promise<any[]> {
    return this.relationshipHistory.get(agentId) || [];
  }
  
  /**
   * Update relationship history
   */
  private async updateRelationshipHistory(agentId: string, relationshipData: any): Promise<void> {
    if (!this.relationshipHistory.has(agentId)) {
      this.relationshipHistory.set(agentId, []);
    }
    
    const history = this.relationshipHistory.get(agentId)!;
    history.push({
      timestamp: Date.now(),
      type: 'relationship_change',
      data: relationshipData,
      context: this.socialState?.relationships?.trustLevels[agentId] || 0.5
    });
    
    // Keep history manageable
    if (history.length > 100) {
      this.relationshipHistory.set(agentId, history.slice(-50));
    }
  }
  
  /**
   * Extract social patterns from memories
   */
  private async extractSocialPattern(memoryType: string, content: any, context: any): Promise<void> {
    const patternKey = `${memoryType}_${context.situation || 'general'}`;
    
    if (!this.socialPatterns.has(patternKey)) {
      this.socialPatterns.set(patternKey, []);
    }
    
    const pattern = {
      content: content,
      context: context.situation,
      frequency: 1,
      lastOccurrence: Date.now(),
      successRate: content.success ? 1 : 0.5,
      participants: context.participants || []
    };
    
    const existingPatterns = this.socialPatterns.get(patternKey)!;
    
    // Check if similar pattern exists
    const similarPattern = existingPatterns.find(p =>
      this.calculatePatternSimilarity(p, pattern) > 0.8
    );
    
    if (similarPattern) {
      // Update existing pattern
      similarPattern.frequency++;
      similarPattern.lastOccurrence = Date.now();
      similarPattern.successRate = (similarPattern.successRate + pattern.successRate) / 2;
    } else {
      // Add new pattern
      existingPatterns.push(pattern);
    }
    
    // Keep patterns manageable
    if (existingPatterns.length > 50) {
      this.socialPatterns.set(patternKey, existingPatterns.slice(-25));
    }
  }
  
  /**
   * Calculate pattern similarity
   */
  private calculatePatternSimilarity(pattern1: any, pattern2: any): number {
    let similarity = 0;
    let factors = 0;
    
    // Compare content similarity
    if (pattern1.content && pattern2.content) {
      factors++;
      if (typeof pattern1.content === typeof pattern2.content) {
        similarity += pattern1.content === pattern2.content ? 1 : 0;
      } else {
        // Simple object similarity check
        const keys1 = Object.keys(pattern1.content);
        const keys2 = Object.keys(pattern2.content);
        const commonKeys = keys1.filter(key => keys2.includes(key));
        similarity += commonKeys.length / Math.max(keys1.length, keys2.length);
      }
    }
    
    // Compare context
    if (pattern1.context && pattern2.context) {
      factors++;
      similarity += pattern1.context === pattern2.context ? 1 : 0;
    }
    
    // Compare participants
    if (pattern1.participants && pattern2.participants) {
      factors++;
      const participants1 = new Set(pattern1.participants);
      const participants2 = new Set(pattern2.participants);
      const intersection = new Set([...participants1].filter(p => participants2.has(p)));
      similarity += intersection.size / Math.max(participants1.size, participants2.size);
    }
    
    return factors > 0 ? similarity / factors : 0;
  }
  
  /**
   * Get social patterns
   */
  getSocialPatterns(patternType?: string): Map<string, any[]> {
    if (patternType) {
      const filteredPatterns = new Map<string, any[]>();
      this.socialPatterns.forEach((patterns, key) => {
        if (key.includes(patternType)) {
          filteredPatterns.set(key, patterns);
        }
      });
      return filteredPatterns;
    }
    return new Map(this.socialPatterns);
  }
  
  /**
   * Calculate social memory importance
   */
  private calculateSocialMemoryImportance(
    memoryType: string,
    emotional: { valence: number; arousal: number; dominance: number },
    context: any
  ): number {
    let importance = 0.5; // Base importance
    
    // Memory type importance
    const typeImportance = {
      'relationship': 0.9,
      'collaboration': 0.8,
      'observation': 0.6,
      'interaction': 0.5
    };
    
    importance += (typeImportance[memoryType] || 0.5) * 0.3;
    
    // Emotional impact
    const emotionalImpact = Math.abs(emotional.valence) + emotional.arousal + Math.abs(emotional.dominance);
    importance += (emotionalImpact / 3) * 0.4;
    
    // Social context importance
    if (context.participants && context.participants.length > 1) {
      importance += 0.2;
    }
    
    // Urgency/situation importance
    if (context.situation === 'emergency' || context.situation === 'conflict') {
      importance += 0.3;
    }
    
    return Math.max(0, Math.min(1, importance));
  }
  
  /**
   * Calculate social memory decay rate
   */
  private calculateSocialMemoryDecay(memoryType: string): number {
    // Different memory types decay at different rates
    const decayRates = {
      'relationship': 0.001, // Very slow decay
      'collaboration': 0.005, // Slow decay
      'observation': 0.01, // Medium decay
      'interaction': 0.02 // Faster decay
    };
    
    return decayRates[memoryType] || 0.01;
  }
  
  /**
   * Get social memory statistics
   */
  getSocialMemoryStatistics(): {
    totalSocialMemories: number;
    memoriesByAgent: Record<string, number>;
    memoryTypes: Record<string, number>;
    patternCount: number;
    relationshipHistories: number;
  } {
    const stats = {
      totalSocialMemories: 0,
      memoriesByAgent: {} as Record<string, number>,
      memoryTypes: {} as Record<string, number>,
      patternCount: 0,
      relationshipHistories: 0
    };
    
    // Count memories by agent
    this.socialMemories.forEach((memories, agentId) => {
      stats.memoriesByAgent[agentId] = memories.length;
      stats.totalSocialMemories += memories.length;
    });
    
    // Count memories by type
    this.socialMemories.forEach(memories => {
      memories.forEach(memory => {
        stats.memoryTypes[memory.memoryType] = (stats.memoryTypes[memory.memoryType] || 0) + 1;
      });
    });
    
    // Count patterns
    this.socialPatterns.forEach(patterns => {
      stats.patternCount += patterns.length;
    });
    
    // Count relationship histories
    this.relationshipHistory.forEach(history => {
      stats.relationshipHistories += history.length;
    });
    
    return stats;
  }
  
  /**
   * Cleanup old social memories
   */
  async cleanupSocialMemories(): Promise<void> {
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    // Clean old social memories
    this.socialMemories.forEach((memories, agentId) => {
      const filteredMemories = memories.filter(memory =>
        now - memory.timestamp < maxAge
      );
      this.socialMemories.set(agentId, filteredMemories);
    });
    
    // Clean old relationship histories
    this.relationshipHistory.forEach((history, agentId) => {
      const filteredHistory = history.filter(entry =>
        now - entry.timestamp < maxAge
      );
      this.relationshipHistory.set(agentId, filteredHistory);
    });
    
    // Clean old patterns
    this.socialPatterns.forEach((patterns, key) => {
      const filteredPatterns = patterns.filter(pattern =>
        now - pattern.lastOccurrence < maxAge
      );
      if (filteredPatterns.length > 0) {
        this.socialPatterns.set(key, filteredPatterns);
      }
    });
  }
  
  /**
   * Cleanup old memories to maintain performance
   */
  async cleanup(): Promise<void> {
    await this.episodic.cleanup();
    await this.semantic.cleanup();
    await this.procedural.cleanup();
    this.working.cleanup();
    
    // Clean social memories
    await this.cleanupSocialMemories();
  }
}

// ExtendedEpisodicEvent is now imported from episodic_memory.ts