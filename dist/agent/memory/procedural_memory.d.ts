import type { ProceduralSkill, ProceduralStep, ProceduralAdaptation, MemoryQuery, WorldContext } from '../langgraph/interfaces.js';
import type { ExtendedEpisodicEvent } from './episodic_memory.js';
/**
 * Procedural memory system for storing skills, routines, and strategies with adaptation
 */
export declare class ProceduralMemory {
    private skills;
    private routines;
    private strategies;
    private performanceHistory;
    private maxSkills;
    private maxRoutines;
    private maxStrategies;
    private adaptationThreshold;
    constructor();
    /**
     * Initialize basic Minecraft skills
     */
    private initializeBasicSkills;
    /**
     * Store a new procedural skill
     */
    storeSkill(skill: ProceduralSkill): Promise<void>;
    /**
     * Learn from experience and improve skills
     */
    learnFromExperience(event: ExtendedEpisodicEvent): Promise<void>;
    /**
     * Query procedural memory
     */
    query(query: MemoryQuery): Promise<ProceduralSkill[]>;
    /**
     * Get best skill for given context
     */
    getBestSkillForContext(context: WorldContext, action?: string): ProceduralSkill | null;
    /**
     * Create routine from frequently used skill sequence
     */
    createRoutine(skillIds: string[], name: string): Promise<void>;
    /**
     * Execute skill with adaptation
     */
    executeSkill(skillId: string, context: WorldContext): Promise<SkillExecutionResult>;
    /**
     * Rank skills by relevance to query
     */
    rankByRelevance(skills: ProceduralSkill[], query: MemoryQuery): ProceduralSkill[];
    /**
     * Get memory statistics
     */
    getStatistics(): {
        skillCount: number;
        averageProficiency: number;
        totalUsage: number;
    };
    /**
     * Cleanup old skills
     */
    cleanup(): Promise<void>;
    /**
     * Private helper methods
     */
    private findSkillsByAction;
    private recordPerformance;
    private createAdaptation;
    private mergeAdaptation;
    private areConditionsMet;
    private selectBestAdaptation;
    private calculateSkillScore;
    private getRecentPerformance;
    private calculateRecencyBonus;
    private calculateRelevanceScore;
    private cleanupLeastUsedSkills;
    private cleanupLeastUsedRoutines;
    private cleanupPoorAdaptations;
}
export interface ExtendedProceduralSkill extends ProceduralSkill {
    adaptations: ProceduralAdaptation[];
}
export interface ProceduralRoutine {
    id: string;
    name: string;
    skills: string[];
    triggerConditions: string[];
    frequency: number;
    efficiency: number;
    lastUsed: number;
}
export interface ProceduralStrategy {
    id: string;
    name: string;
    goals: string[];
    tactics: string[];
    successRate: number;
    complexity: number;
}
export interface PerformanceRecord {
    timestamp: number;
    success: boolean;
    duration: number;
    context: WorldContext;
    effectiveness: number;
}
export interface SkillExecutionResult {
    success: boolean;
    sequence?: ProceduralStep[];
    adaptation?: string;
    estimatedDuration?: number;
    error?: string;
}
//# sourceMappingURL=procedural_memory.d.ts.map