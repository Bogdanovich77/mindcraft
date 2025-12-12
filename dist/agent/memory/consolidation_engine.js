/**
 * Memory consolidation engine for pattern extraction and learning
 */
export class ConsolidationEngine {
    patternRecognizers;
    learningRules;
    consolidationHistory = [];
    memorySystems = null;
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
    setMemorySystems(systems) {
        this.memorySystems = systems;
    }
    /**
     * Extract patterns from episodic events
     */
    async extractPatterns(events) {
        const patterns = [];
        const importantEvents = [];
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
        const result = {
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
    async extractSurvivalPatterns(event) {
        const patterns = [];
        if (event.emotional?.urgency && event.emotional.urgency >= 0.8) {
            // Create threat pattern
            const threatPattern = {
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
                    inventory: [],
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
    async createEmergencySkill(event) {
        if (!event.action || !event.success)
            return null;
        const skill = {
            id: `emergency_${event.type}_${Date.now()}`,
            name: `Emergency ${event.type} Response`,
            type: 'strategy',
            sequence: [
                {
                    action: 'assess_threat',
                    parameters: { threat_type: event.type },
                    conditions: ['danger_detected'],
                    expectedOutcome: 'threat_identified',
                    duration: 100
                },
                {
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
    async applyLearning(patterns) {
        const results = [];
        for (const rule of this.learningRules) {
            const ruleResults = await rule.apply(patterns, this.memorySystems);
            results.push(...ruleResults);
        }
        return results;
    }
    /**
     * Get consolidation statistics
     */
    getStatistics() {
        const recent = this.consolidationHistory.filter(record => record.timestamp > Date.now() - (24 * 60 * 60 * 1000) // Last 24 hours
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
                ? this.consolidationHistory[this.consolidationHistory.length - 1].timestamp
                : 0
        };
    }
    /**
     * Private helper methods
     */
    classifyThreatType(event) {
        if (event.type.includes('hostile') || event.type.includes('mob'))
            return 'hostile_mob';
        if (event.type.includes('drowning'))
            return 'drowning';
        if (event.type.includes('burning') || event.type.includes('fire'))
            return 'fire';
        if (event.type.includes('fall'))
            return 'fall_damage';
        if (event.type.includes('hunger'))
            return 'starvation';
        return 'unknown_threat';
    }
    extractEscapeRoutes(event) {
        const routes = [];
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
class PatternRecognizer {
}
class ActionOutcomeRecognizer extends PatternRecognizer {
    async recognize(events) {
        const patterns = [];
        const actionOutcomes = new Map();
        // Group events by action
        for (const event of events) {
            if (event.action && event.outcome) {
                if (!actionOutcomes.has(event.action)) {
                    actionOutcomes.set(event.action, { outcomes: [], frequency: 0 });
                }
                const entry = actionOutcomes.get(event.action);
                if (!entry.outcomes.includes(event.outcome)) {
                    entry.outcomes.push(event.outcome);
                }
                entry.frequency++;
            }
        }
        // Create patterns for frequent action-outcome pairs
        for (const [action, data] of actionOutcomes.entries()) {
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
    async recognize(events) {
        const patterns = [];
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
    async recognize(events) {
        const patterns = [];
        const locationEvents = new Map();
        // Group events by location
        for (const event of events) {
            const locationKey = `${Math.floor(event.location.x / 10)}_${Math.floor(event.location.z / 10)}`;
            if (!locationEvents.has(locationKey)) {
                locationEvents.set(locationKey, []);
            }
            locationEvents.get(locationKey).push(event);
        }
        // Find patterns in locations
        for (const [location, eventsAtLocation] of locationEvents.entries()) {
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
    getCommonEventTypes(events) {
        const typeCounts = new Map();
        for (const event of events) {
            typeCounts.set(event.type, (typeCounts.get(event.type) || 0) + 1);
        }
        return Array.from(typeCounts.entries())
            .filter(([, count]) => count >= 3)
            .map(([type]) => type);
    }
}
class SocialPatternRecognizer extends PatternRecognizer {
    async recognize(events) {
        const patterns = [];
        // Look for social interaction patterns
        const socialEvents = events.filter(event => event.participants && event.participants.length > 1);
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
    extractParticipantTypes(events) {
        const types = new Set();
        for (const event of events) {
            if (event.participants) {
                event.participants.forEach(p => types.add(p));
            }
        }
        return Array.from(types);
    }
}
// Learning Rules
class LearningRule {
}
class ReinforcementLearningRule extends LearningRule {
    async apply(patterns, memorySystems) {
        const results = [];
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
    async apply(patterns, memorySystems) {
        const results = [];
        // Group similar patterns and create generalizations
        const groupedPatterns = this.groupSimilarPatterns(patterns);
        for (const [group, patterns] of groupedPatterns.entries()) {
            if (patterns.length >= 3) {
                results.push({
                    type: 'concept_formation',
                    target: group,
                    improvement: patterns.length * 0.05,
                    reason: 'pattern_generalization'
                });
            }
        }
        return results;
    }
    groupSimilarPatterns(patterns) {
        const groups = new Map();
        for (const pattern of patterns) {
            const groupKey = `${pattern.type}_${pattern.action || pattern.trigger || 'unknown'}`;
            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey).push(pattern);
        }
        return groups;
    }
}
class FrequencyBasedRule extends LearningRule {
    async apply(patterns, memorySystems) {
        const results = [];
        // Boost importance of frequently occurring patterns
        const patternCounts = new Map();
        for (const pattern of patterns) {
            const key = `${pattern.type}_${pattern.action || pattern.trigger || 'unknown'}`;
            patternCounts.set(key, (patternCounts.get(key) || 0) + 1);
        }
        for (const [key, count] of patternCounts.entries()) {
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
//# sourceMappingURL=consolidation_engine.js.map