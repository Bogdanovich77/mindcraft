import type { ProceduralSkill } from '../langgraph/interfaces.js';
import type { ExtendedEpisodicEvent, ExtractedPattern } from './episodic_memory.js';
import type { ThreatPattern } from './semantic_memory.js';
/**
 * Memory consolidation engine for pattern extraction and learning
 */
export declare class ConsolidationEngine {
    private patternRecognizers;
    private learningRules;
    private consolidationHistory;
    private memorySystems;
    constructor();
    /**
     * Set memory system references
     */
    setMemorySystems(systems: {
        semantic: any;
        episodic: any;
        procedural: any;
        working: any;
    }): void;
    /**
     * Extract patterns from episodic events
     */
    extractPatterns(events: ExtendedEpisodicEvent[]): Promise<ConsolidationResult>;
    /**
     * Extract survival patterns from reactive events
     */
    extractSurvivalPatterns(event: ExtendedEpisodicEvent): Promise<ThreatPattern[]>;
    /**
     * Create emergency skill from reactive event
     */
    createEmergencySkill(event: ExtendedEpisodicEvent): Promise<ProceduralSkill | null>;
    /**
     * Apply learning rules to consolidate knowledge
     */
    applyLearning(patterns: ExtractedPattern[]): Promise<LearningResult[]>;
    /**
     * Get consolidation statistics
     */
    getStatistics(): ConsolidationStatistics;
    /**
     * Private helper methods
     */
    private classifyThreatType;
    private extractEscapeRoutes;
}
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
//# sourceMappingURL=consolidation_engine.d.ts.map