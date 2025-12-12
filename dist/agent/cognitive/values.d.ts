/**
 * Value Hierarchy System
 *
 * Provides a structured framework for moral and practical decision-making.
 * Values influence action selection but never override reactive survival behaviors.
 */
export type ValueType = 'survival' | 'security' | 'knowledge' | 'growth' | 'creativity' | 'cooperation' | 'competition' | 'justice' | 'freedom' | 'loyalty' | 'honesty' | 'compassion' | 'courage' | 'wisdom' | 'efficiency';
export interface Value {
    type: ValueType;
    importance: number;
    strength: number;
    flexibility: number;
    lastReinforced: number;
}
export interface ValueHierarchy {
    values: Map<ValueType, Value>;
    coreValues: ValueType[];
    valueConflicts: Map<string, {
        value1: ValueType;
        value2: ValueType;
        severity: number;
    }>;
}
export interface ValueEvent {
    type: 'action_taken' | 'outcome_observed' | 'social_feedback' | 'personal_reflection';
    affectedValues: ValueType[];
    reinforcement: number;
    context: any;
}
export declare class ValueSystem {
    private hierarchy;
    private readonly VALUE_DECAY_RATE;
    private readonly CONFLICT_THRESHOLD;
    constructor(initialValues?: Partial<ValueHierarchy>);
    /**
     * Create default value set
     */
    private createDefaultValues;
    /**
     * Update value strengths based on time and events
     */
    update(deltaTime: number, events?: ValueEvent[]): void;
    /**
     * Process events that reinforce or diminish values
     */
    private processValueEvent;
    /**
     * Update core values (top 3-5 most important)
     */
    private updateCoreValues;
    /**
     * Detect conflicts between values
     */
    private updateValueConflicts;
    /**
     * Calculate how much two values conflict
     */
    private calculateConflictSeverity;
    /**
     * Get current value hierarchy
     */
    getHierarchy(): ValueHierarchy;
    /**
     * Calculate value-based influence on action
     */
    calculateActionInfluence(actionType: string, context: any): number;
    /**
     * Get alignment score between action and value (-1 to 1)
     */
    private getActionValueAlignment;
    /**
     * Check if action conflicts with core values
     */
    hasCoreValueConflict(actionType: string): boolean;
    /**
     * Get value-based decision guidance
     */
    getDecisionGuidance(actionOptions: string[]): Array<{
        action: string;
        score: number;
        conflicts: ValueType[];
    }>;
    /**
     * Get values that conflict with an action
     */
    private getActionConflicts;
    /**
     * Create value system from legacy profile
     */
    static fromLegacyProfile(legacyProfile: any): ValueSystem;
    /**
     * Map legacy value names to new system
     */
    private static mapLegacyValue;
    /**
     * Export to legacy format
     */
    toLegacyProfile(): any;
}
//# sourceMappingURL=values.d.ts.map