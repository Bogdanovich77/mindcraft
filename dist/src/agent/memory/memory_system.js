import { SemanticMemory } from './semantic_memory.js';
import { EpisodicMemory } from './episodic_memory.js';
import { ProceduralMemory } from './procedural_memory.js';
import { WorkingMemory } from './working_memory.js';
import { ConsolidationEngine } from './consolidation_engine.js';
/**
 * Main memory system orchestrator that coordinates all memory components
 */
export class MemorySystem {
    semantic;
    episodic;
    procedural;
    working;
    consolidation;
    bridge; // Lazy-loaded to avoid circular import
    lastConsolidation = 0;
    consolidationInterval = 60000; // 1 minute
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
    getBridge() {
        if (!this.bridge) {
            const { MemoryBridge } = require('./memory_bridge');
            this.bridge = new MemoryBridge();
        }
        return this.bridge;
    }
    /**
     * Initialize memory system with legacy data
     */
    async initialize(legacyMemoryBank) {
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
    async update(agentState, deltaTime) {
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
    async storeEvent(event) {
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
    async storeSemanticConcept(concept) {
        await this.semantic.storeConcept(concept);
    }
    /**
     * Store procedural knowledge
     */
    async storeProceduralSkill(skill) {
        await this.procedural.storeSkill(skill);
    }
    /**
     * Query memory for relevant information
     */
    async query(query) {
        const results = {
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
    getWorkingMemory() {
        return this.working.getState();
    }
    /**
     * Get memory statistics
     */
    getStatistics() {
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
    async learnFromReactiveEvent(event) {
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
    async performConsolidation(agentState) {
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
    setupMemoryInteractions() {
        // Working memory can trigger semantic queries
        this.working.onSemanticQuery(async (query) => {
            return await this.semantic.queryByText(query);
        });
        // Episodic memory can inform procedural learning
        this.episodic.onEventStored(async (event) => {
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
    rankResults(results, query) {
        // Rank each result set by relevance to query
        results.semantic = this.semantic.rankByRelevance(results.semantic, query);
        // Cast episodic results to ExtendedEpisodicEvent[] for ranking
        results.episodic = this.episodic.rankByRelevance(results.episodic, query);
        results.procedural = this.procedural.rankByRelevance(results.procedural, query);
        results.working = this.working.rankByRelevance(results.working, query);
        return results;
    }
    /**
     * Cleanup old memories to maintain performance
     */
    async cleanup() {
        await this.episodic.cleanup();
        await this.semantic.cleanup();
        await this.procedural.cleanup();
        this.working.cleanup();
    }
}
// ExtendedEpisodicEvent is now imported from episodic_memory.ts
