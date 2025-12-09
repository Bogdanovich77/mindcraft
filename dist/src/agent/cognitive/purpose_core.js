/**
 * Purpose Core System
 *
 * Main integration point for personality, motivations, values, and ethics.
 * Provides purpose-driven decision making while respecting reactive interrupts.
 */
import { PersonalitySystem } from './personality.js';
import { MotivationSystem } from './motivations.js';
import { ValueSystem } from './values.js';
import { EthicsSystem } from './ethics.js';
import { PurposeDrivenDecisionMaker } from './decision_maker.js';
export class PurposeCore {
    personality;
    motivations;
    values;
    ethics;
    decisionMaker;
    state;
    config;
    constructor(config) {
        this.config = {
            initialPersonality: {},
            initialMotivations: {},
            initialValues: {},
            initialEthics: {},
            learningRate: 0.1,
            adaptationSpeed: 0.05,
            decisionTimeLimit: 2000,
            ...config
        };
        this.initializeComponents();
        this.state = this.createInitialState();
    }
    /**
     * Initialize all cognitive components
     */
    initializeComponents() {
        this.personality = new PersonalitySystem(this.config.initialPersonality);
        this.motivations = new MotivationSystem(this.config.initialMotivations);
        this.values = new ValueSystem(this.config.initialValues);
        this.ethics = new EthicsSystem(this.config.initialEthics);
        this.decisionMaker = new PurposeDrivenDecisionMaker(this.personality, this.motivations, this.values, this.ethics);
    }
    /**
     * Create initial state
     */
    createInitialState() {
        return {
            personality: this.personality.getProfile(),
            motivations: this.motivations.getProfile(),
            values: this.values.getHierarchy(),
            ethics: this.ethics.getProfile(),
            lastUpdate: Date.now(),
            activeGoals: [],
            decisionHistory: []
        };
    }
    /**
     * Main cognitive processing cycle
     */
    async processCognitive(input) {
        const startTime = Date.now();
        // Check if we should yield to reactive system
        if (this.shouldYieldToReactive(input)) {
            return {
                selectedAction: null,
                utility: {
                    totalUtility: 0,
                    purposeUtility: 0,
                    personalityUtility: 0,
                    motivationUtility: 0,
                    ethicsUtility: 0,
                    breakdown: { purpose: 0, personality: 0, motivations: 0, values: 0, ethics: 0 },
                    reasoning: 'Yielded to reactive system'
                },
                reasoning: 'Emergency or high-priority interrupt - deferring to reactive behaviors',
                confidence: 0,
                processingTime: Date.now() - startTime,
                yieldedToReactive: true
            };
        }
        // Update internal state
        this.updateInternalState(input);
        // Generate goals if needed
        const goals = this.generateGoals();
        this.state.activeGoals = goals;
        // Select best action
        const decision = this.decisionMaker.selectBestAction(input.availableActions, input.context);
        // Calculate confidence
        const confidence = this.calculateDecisionConfidence(decision.utility);
        // Record decision
        this.recordDecision(decision.action?.type || 'no_action', decision.utility.totalUtility);
        const processingTime = Date.now() - startTime;
        return {
            selectedAction: decision.action,
            utility: decision.utility,
            reasoning: decision.utility.reasoning,
            confidence,
            processingTime,
            yieldedToReactive: false
        };
    }
    /**
     * Check if cognitive processing should yield to reactive system
     */
    shouldYieldToReactive(input) {
        // Emergency interrupts always take priority
        if (input.interruptLevel === 'emergency')
            return true;
        // High priority interrupts with time pressure
        if (input.interruptLevel === 'high' && input.timeConstraints < 500)
            return true;
        // Time constraints exceeded
        if (input.timeConstraints < this.config.decisionTimeLimit * 0.5)
            return true;
        // Danger level too high for complex cognitive processing
        if (input.context.environmentalFactors.danger_level > 0.8)
            return true;
        return false;
    }
    /**
     * Update internal cognitive state
     */
    updateInternalState(input) {
        const deltaTime = Date.now() - this.state.lastUpdate;
        // Update all components with time-based decay
        this.motivations.update(deltaTime);
        this.values.update(deltaTime);
        // Update state snapshot
        this.state.personality = this.personality.getProfile();
        this.state.motivations = this.motivations.getProfile();
        this.state.values = this.values.getHierarchy();
        this.state.ethics = this.ethics.getProfile();
        this.state.lastUpdate = Date.now();
    }
    /**
     * Generate goals based on current motivations and values
     */
    generateGoals() {
        const motivationGoals = this.motivations.generateGoals();
        const valueGuidance = this.values.getDecisionGuidance([
            'gather_resources', 'build_shelter', 'explore', 'socialize', 'create', 'defend'
        ]);
        // Combine motivation-driven and value-driven goals
        const goals = [];
        // Add top motivation goals
        motivationGoals.slice(0, 3).forEach(goal => {
            goals.push(goal.type);
        });
        // Add top value-aligned goals
        valueGuidance.slice(0, 2).forEach(guidance => {
            if (guidance.score > 0.6) {
                goals.push(guidance.action);
            }
        });
        return goals;
    }
    /**
     * Calculate confidence in decision
     */
    calculateDecisionConfidence(utility) {
        // Confidence based on utility score and consistency
        const utilityConfidence = utility.totalUtility;
        // Check for conflicts in decision components
        const breakdown = utility.breakdown;
        const variance = this.calculateVariance([
            breakdown.purpose,
            breakdown.personality,
            breakdown.motivations,
            breakdown.values,
            breakdown.ethics
        ]);
        // High variance reduces confidence
        const consistencyConfidence = Math.max(0, 1 - variance);
        // Weighted average
        return (utilityConfidence * 0.7 + consistencyConfidence * 0.3);
    }
    /**
     * Calculate variance of values
     */
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    /**
     * Record decision for learning
     */
    recordDecision(action, utility) {
        this.state.decisionHistory.push({
            action,
            utility,
            timestamp: Date.now()
        });
        // Keep history manageable
        if (this.state.decisionHistory.length > 100) {
            this.state.decisionHistory = this.state.decisionHistory.slice(-50);
        }
    }
    /**
     * Process outcome for learning and adaptation
     */
    processOutcome(action, outcome, context) {
        // Update decision maker with experience
        this.decisionMaker.updateFromExperience(action, outcome, context);
        // Update decision history
        const lastDecision = this.state.decisionHistory[this.state.decisionHistory.length - 1];
        if (lastDecision && lastDecision.action === action.type) {
            lastDecision.outcome = outcome;
        }
        // Trigger adaptation based on significant outcomes
        if (outcome === 'success' || outcome === 'failure') {
            this.adaptFromExperience(action, outcome, context);
        }
    }
    /**
     * Adapt cognitive systems based on experience
     */
    adaptFromExperience(action, outcome, context) {
        const adaptationStrength = this.config.adaptationSpeed;
        if (outcome === 'success') {
            // Reinforce successful patterns
            this.reinforceSuccessfulPatterns(action, context, adaptationStrength);
        }
        else if (outcome === 'failure') {
            // Adjust for failed patterns
            this.adjustForFailedPatterns(action, context, adaptationStrength);
        }
    }
    /**
     * Reinforce successful behavioral patterns
     */
    reinforceSuccessfulPatterns(action, context, strength) {
        // Create positive reinforcement events
        const motivationEvent = {
            type: 'success',
            motivationType: this.getPrimaryMotivationForAction(action.type),
            impact: strength,
            context
        };
        const valueEvent = {
            type: 'action_taken',
            affectedValues: this.getValuesForAction(action.type),
            reinforcement: strength * 0.5,
            context
        };
        // Apply reinforcement
        this.motivations.update(0, [motivationEvent]);
        this.values.update(0, [valueEvent]);
    }
    /**
     * Adjust for failed behavioral patterns
     */
    adjustForFailedPatterns(action, context, strength) {
        // Create negative reinforcement events
        const motivationEvent = {
            type: 'failure',
            motivationType: this.getPrimaryMotivationForAction(action.type),
            impact: -strength,
            context
        };
        const valueEvent = {
            type: 'outcome_observed',
            affectedValues: this.getValuesForAction(action.type),
            reinforcement: -strength * 0.3,
            context
        };
        // Apply adjustments
        this.motivations.update(0, [motivationEvent]);
        this.values.update(0, [valueEvent]);
    }
    /**
     * Get primary motivation for action type
     */
    getPrimaryMotivationForAction(actionType) {
        const motivationMap = {
            'gather_food': 'survival',
            'build_shelter': 'survival',
            'complete_project': 'achievement',
            'help_ally': 'social',
            'explore': 'exploration',
            'create': 'creation'
        };
        return motivationMap[actionType] || 'survival';
    }
    /**
     * Get values affected by action
     */
    getValuesForAction(actionType) {
        const valueMap = {
            'help_ally': ['compassion', 'cooperation', 'loyalty'],
            'attack': ['courage', 'justice'],
            'share_resources': ['cooperation', 'compassion'],
            'build': ['creativity', 'growth'],
            'explore': ['freedom', 'knowledge', 'courage']
        };
        return valueMap[actionType] || [];
    }
    /**
     * Get current purpose core state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Get current active goals
     */
    getActiveGoals() {
        return [...this.state.activeGoals];
    }
    /**
     * Get decision history
     */
    getDecisionHistory() {
        return [...this.state.decisionHistory];
    }
    /**
     * Check if purpose core is ready for decision making
     */
    isReady() {
        return this.state.lastUpdate > 0 &&
            this.state.activeGoals.length > 0 &&
            this.personality.getProfile().confidence > 0.3;
    }
    /**
     * Reset purpose core to initial state
     */
    reset() {
        this.initializeComponents();
        this.state = this.createInitialState();
    }
    /**
     * Create purpose core from legacy profile
     */
    static fromLegacyProfile(legacyProfile) {
        const config = {
            initialPersonality: PersonalitySystem.fromLegacyProfile(legacyProfile).getProfile(),
            initialMotivations: MotivationSystem.fromLegacyProfile(legacyProfile).getProfile(),
            initialValues: ValueSystem.fromLegacyProfile(legacyProfile).getHierarchy(),
            initialEthics: EthicsSystem.fromLegacyProfile(legacyProfile).getProfile()
        };
        return new PurposeCore(config);
    }
    /**
     * Export to legacy profile format
     */
    toLegacyProfile() {
        return {
            personality: this.personality.toLegacyProfile().personality,
            behavior: {
                ...this.personality.toLegacyProfile().behavior,
                ...this.motivations.toLegacyProfile().behavior,
                ...this.values.toLegacyProfile().behavior,
                ...this.ethics.toLegacyProfile().behavior
            },
            values: this.values.toLegacyProfile().values,
            ethics: this.ethics.toLegacyProfile().ethics,
            goals: this.state.activeGoals
        };
    }
}
