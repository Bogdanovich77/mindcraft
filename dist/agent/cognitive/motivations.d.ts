/**
 * Dynamic Motivation System
 *
 * Drives agent behavior through evolving motivational states.
 * Motivations influence goal generation and action selection but never override reactive survival.
 */
export type MotivationType = 'survival' | 'achievement' | 'social' | 'exploration' | 'creation';
export interface Motivation {
    type: MotivationType;
    strength: number;
    persistence: number;
    satiation: number;
    satiationThreshold: number;
    decayRate: number;
    lastUpdate: number;
}
export interface MotivationProfile {
    motivations: Map<MotivationType, Motivation>;
    primaryMotivation: MotivationType;
    motivationVolatility: number;
}
export interface MotivationEvent {
    type: 'success' | 'failure' | 'progress' | 'setback';
    motivationType: MotivationType;
    impact: number;
    context: any;
}
export declare class MotivationSystem {
    private profile;
    private readonly DEFAULT_DECAY_RATE;
    private readonly SATIATION_DECAY_RATE;
    constructor(initialProfile?: Partial<MotivationProfile>);
    /**
     * Create default motivation set
     */
    private createDefaultMotivations;
    /**
     * Update all motivations based on time and events
     */
    update(deltaTime: number, events?: MotivationEvent[]): void;
    /**
     * Process motivation-altering events
     */
    private processMotivationEvent;
    /**
     * Update the primary motivation based on current strengths
     */
    private updatePrimaryMotivation;
    /**
     * Get current motivation profile
     */
    getProfile(): MotivationProfile;
    /**
     * Get motivation strength for a specific type
     */
    getMotivationStrength(type: MotivationType): number;
    /**
     * Get primary motivation type and strength
     */
    getPrimaryMotivation(): {
        type: MotivationType;
        strength: number;
    };
    /**
     * Calculate motivation influence on action selection
     */
    calculateActionInfluence(actionType: string, context: any): number;
    /**
     * Get weight of motivation for specific action type
     */
    private getActionMotivationWeight;
    /**
     * Generate goals based on current motivations
     */
    generateGoals(): Array<{
        type: string;
        priority: number;
        motivation: MotivationType;
    }>;
    /**
     * Get goal types associated with specific motivation
     */
    private getGoalTypesForMotivation;
    /**
     * Check if motivation should trigger immediate action
     */
    shouldTriggerAction(motivationType: MotivationType): boolean;
    /**
     * Create motivation system from legacy profile
     */
    static fromLegacyProfile(legacyProfile: any): MotivationSystem;
    /**
     * Export to legacy format
     */
    toLegacyProfile(): any;
}
//# sourceMappingURL=motivations.d.ts.map