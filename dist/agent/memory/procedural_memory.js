/**
 * Procedural memory system for storing skills, routines, and strategies with adaptation
 */
export class ProceduralMemory {
    skills = new Map();
    routines = new Map();
    strategies = new Map();
    performanceHistory = new Map();
    maxSkills = 200;
    maxRoutines = 100;
    maxStrategies = 50;
    adaptationThreshold = 0.1; // Minimum performance improvement to keep adaptation
    constructor() {
        this.initializeBasicSkills();
    }
    /**
     * Initialize basic Minecraft skills
     */
    initializeBasicSkills() {
        const basicSkills = [
            {
                id: 'movement',
                name: 'Basic Movement',
                type: 'skill',
                sequence: [
                    {
                        action: 'move_forward',
                        parameters: { distance: 1 },
                        conditions: ['path_clear'],
                        expectedOutcome: 'position_changed',
                        duration: 500
                    }
                ],
                conditions: ['alive', 'not_stuck'],
                outcomes: ['position_changed'],
                proficiency: 0.8,
                usageCount: 0,
                lastUsed: Date.now()
            },
            {
                id: 'dig_block',
                name: 'Dig Block',
                type: 'skill',
                sequence: [
                    {
                        action: 'target_block',
                        parameters: { range: 5 },
                        conditions: ['block_in_range'],
                        expectedOutcome: 'block_targeted',
                        duration: 200
                    },
                    {
                        action: 'dig',
                        parameters: {},
                        conditions: ['block_targeted', 'tool_equipped'],
                        expectedOutcome: 'block_dropped',
                        duration: 1000
                    }
                ],
                conditions: ['tool_equipped', 'block_in_range'],
                outcomes: ['block_dropped', 'tool_damage'],
                proficiency: 0.6,
                usageCount: 0,
                lastUsed: Date.now()
            },
            {
                id: 'emergency_escape',
                name: 'Emergency Escape',
                type: 'strategy',
                sequence: [
                    {
                        action: 'assess_threat',
                        parameters: { scan_radius: 10 },
                        conditions: ['danger_detected'],
                        expectedOutcome: 'threat_identified',
                        duration: 100
                    },
                    {
                        action: 'find_escape_route',
                        parameters: { avoid_threats: true },
                        conditions: ['threat_identified'],
                        expectedOutcome: 'escape_route_found',
                        duration: 500
                    },
                    {
                        action: 'move_to_safety',
                        parameters: { urgency: 'high' },
                        conditions: ['escape_route_found'],
                        expectedOutcome: 'safe_position_reached',
                        duration: 2000
                    }
                ],
                conditions: ['danger_detected', 'low_health'],
                outcomes: ['safe_position_reached', 'threat_avoided'],
                proficiency: 0.7,
                usageCount: 0,
                lastUsed: Date.now()
            }
        ];
        for (const skill of basicSkills) {
            this.skills.set(skill.id, skill);
        }
    }
    /**
     * Store a new procedural skill
     */
    async storeSkill(skill) {
        const extendedSkill = {
            ...skill,
            adaptations: skill.adaptations || []
        };
        // Check capacity limits
        if (this.skills.size >= this.maxSkills) {
            await this.cleanupLeastUsedSkills();
        }
        // Update existing skill or add new one
        if (this.skills.has(skill.id)) {
            const existing = this.skills.get(skill.id);
            // Update proficiency with weighted average
            existing.proficiency = (existing.proficiency * 0.7 + skill.proficiency * 0.3);
            existing.lastUsed = Date.now();
            // Merge adaptations if they improve performance
            for (const adaptation of skill.adaptations) {
                await this.mergeAdaptation(existing, adaptation);
            }
        }
        else {
            this.skills.set(skill.id, extendedSkill);
        }
    }
    /**
     * Learn from experience and improve skills
     */
    async learnFromExperience(event) {
        if (!event.action || !event.success)
            return;
        // Find related skills
        const relatedSkills = this.findSkillsByAction(event.action);
        for (const skill of relatedSkills) {
            // Update proficiency based on success
            const improvement = event.importance * 0.1;
            skill.proficiency = Math.min(1.0, skill.proficiency + improvement);
            skill.usageCount++;
            skill.lastUsed = Date.now();
            // Record performance
            await this.recordPerformance(skill.id, {
                timestamp: event.timestamp,
                success: event.success,
                duration: event.duration || 1000,
                context: {
                    position: event.location,
                    health: 20, // Default values - in real implementation these would come from event
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
                },
                effectiveness: event.importance
            });
            // Check for adaptation opportunities
            if (event.metadata?.adaptation) {
                await this.createAdaptation(skill, event);
            }
        }
    }
    /**
     * Query procedural memory
     */
    async query(query) {
        const results = [];
        const queryLower = (query.query || '').toLowerCase();
        for (const skill of Array.from(this.skills.values())) {
            // Apply type filter
            if (query.filters?.type && skill.type !== query.filters.type) {
                continue;
            }
            // Apply proficiency filter
            if (query.importance && skill.proficiency < query.importance) {
                continue;
            }
            // Check text relevance
            let relevance = 0;
            if (skill.name.toLowerCase().includes(queryLower)) {
                relevance += 0.8;
            }
            // Check sequence actions
            for (const step of skill.sequence) {
                if (step.action.toLowerCase().includes(queryLower)) {
                    relevance += 0.4;
                }
            }
            // Check outcomes
            for (const outcome of skill.outcomes) {
                if (outcome.toLowerCase().includes(queryLower)) {
                    relevance += 0.3;
                }
            }
            // Calculate final score
            const score = relevance * skill.proficiency;
            if (score > 0.1) {
                results.push(skill);
            }
        }
        // Sort by proficiency and relevance
        results.sort((a, b) => (b.proficiency * b.usageCount) - (a.proficiency * a.usageCount));
        if (query.limit) {
            return results.slice(0, query.limit);
        }
        return results;
    }
    /**
     * Get best skill for given context
     */
    getBestSkillForContext(context, action) {
        let candidates = Array.from(this.skills.values());
        // Filter by action if specified
        if (action) {
            candidates = candidates.filter(skill => skill.sequence.some(step => step.action === action));
        }
        // Filter by applicable conditions
        candidates = candidates.filter(skill => this.areConditionsMet(skill.conditions, context));
        if (candidates.length === 0)
            return null;
        // Select best based on proficiency and recent success
        return candidates.reduce((best, current) => {
            const bestScore = this.calculateSkillScore(best, context);
            const currentScore = this.calculateSkillScore(current, context);
            return currentScore > bestScore ? current : best;
        });
    }
    /**
     * Create routine from frequently used skill sequence
     */
    async createRoutine(skillIds, name) {
        if (this.routines.size >= this.maxRoutines) {
            await this.cleanupLeastUsedRoutines();
        }
        const routine = {
            id: `routine_${Date.now()}`,
            name,
            skills: skillIds,
            triggerConditions: [],
            frequency: 0,
            efficiency: 0,
            lastUsed: Date.now()
        };
        this.routines.set(routine.id, routine);
    }
    /**
     * Execute skill with adaptation
     */
    async executeSkill(skillId, context) {
        const skill = this.skills.get(skillId);
        if (!skill) {
            return { success: false, error: 'Skill not found' };
        }
        // Check conditions
        if (!this.areConditionsMet(skill.conditions, context)) {
            return { success: false, error: 'Conditions not met' };
        }
        // Select best adaptation for context
        const adaptation = this.selectBestAdaptation(skill, context);
        const sequence = adaptation?.modification || skill.sequence;
        // Update usage statistics
        skill.usageCount++;
        skill.lastUsed = Date.now();
        return {
            success: true,
            sequence,
            adaptation: adaptation?.context || '',
            estimatedDuration: sequence.reduce((sum, step) => sum + (step.duration || 0), 0)
        };
    }
    /**
     * Rank skills by relevance to query
     */
    rankByRelevance(skills, query) {
        return skills.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, query);
            const scoreB = this.calculateRelevanceScore(b, query);
            return scoreB - scoreA;
        });
    }
    /**
     * Get memory statistics
     */
    getStatistics() {
        const totalProficiency = Array.from(this.skills.values()).reduce((sum, s) => sum + s.proficiency, 0);
        const totalUsage = Array.from(this.skills.values()).reduce((sum, s) => sum + s.usageCount, 0);
        return {
            skillCount: this.skills.size,
            averageProficiency: this.skills.size > 0 ? totalProficiency / this.skills.size : 0,
            totalUsage
        };
    }
    /**
     * Cleanup old skills
     */
    async cleanup() {
        await this.cleanupLeastUsedSkills();
        await this.cleanupLeastUsedRoutines();
        await this.cleanupPoorAdaptations();
    }
    /**
     * Private helper methods
     */
    findSkillsByAction(action) {
        return Array.from(this.skills.values()).filter(skill => skill.sequence.some(step => step.action === action));
    }
    async recordPerformance(skillId, record) {
        if (!this.performanceHistory.has(skillId)) {
            this.performanceHistory.set(skillId, []);
        }
        const history = this.performanceHistory.get(skillId);
        history.push(record);
        // Keep only recent performance records
        const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
        const recent = history.filter(r => r.timestamp > cutoff);
        this.performanceHistory.set(skillId, recent);
    }
    async createAdaptation(skill, event) {
        const adaptation = {
            context: JSON.stringify(event.location),
            modification: [...skill.sequence], // Start with current sequence
            performance: {
                successRate: event.success ? 1.0 : 0.5,
                executionTime: event.duration || 1000,
                errorRate: event.success ? 0.0 : 0.5
            },
            successRate: event.success ? 1.0 : 0.5,
            timestamp: event.timestamp
        };
        // TODO: Implement actual adaptation logic based on event metadata
        // For now, just store the basic adaptation
        skill.adaptations.push(adaptation);
        // Limit adaptations per skill
        if (skill.adaptations.length > 10) {
            skill.adaptations.sort((a, b) => (b.successRate || 0) - (a.successRate || 0));
            skill.adaptations = skill.adaptations.slice(0, 10);
        }
    }
    async mergeAdaptation(skill, newAdaptation) {
        const existingIndex = skill.adaptations.findIndex(a => a.context === newAdaptation.context);
        if (existingIndex >= 0) {
            const existing = skill.adaptations[existingIndex];
            if (existing && newAdaptation.successRate) {
                // Keep the better performing adaptation
                if ((newAdaptation.successRate || 0) > (existing.successRate || 0)) {
                    skill.adaptations[existingIndex] = newAdaptation;
                }
            }
        }
        else {
            skill.adaptations.push(newAdaptation);
        }
    }
    areConditionsMet(conditions, context) {
        // Simple condition checking - in real implementation, this would be more sophisticated
        for (const condition of conditions) {
            switch (condition) {
                case 'alive':
                    if (context.health <= 0)
                        return false;
                    break;
                case 'low_health':
                    if (context.health > 5)
                        return false;
                    break;
                case 'tool_equipped':
                    if (!context.equipment.weapon && !context.equipment.helmet)
                        return false;
                    break;
                // Add more condition checks as needed
            }
        }
        return true;
    }
    selectBestAdaptation(skill, context) {
        if (skill.adaptations.length === 0)
            return null;
        // For now, return the best performing adaptation
        // In real implementation, this would consider context matching
        return skill.adaptations.reduce((best, current) => {
            const bestScore = best.successRate || 0;
            const currentScore = current.successRate || 0;
            return currentScore > bestScore ? current : best;
        });
    }
    calculateSkillScore(skill, context) {
        const recentPerformance = this.getRecentPerformance(skill.id);
        const performanceBonus = recentPerformance ? recentPerformance.effectiveness : 0;
        const recencyBonus = this.calculateRecencyBonus(skill.lastUsed);
        return skill.proficiency * 0.6 + performanceBonus * 0.3 + recencyBonus * 0.1;
    }
    getRecentPerformance(skillId) {
        const history = this.performanceHistory.get(skillId);
        if (!history || history.length === 0)
            return null;
        // Get most recent performance
        return history.reduce((mostRecent, current) => current.timestamp > mostRecent.timestamp ? current : mostRecent);
    }
    calculateRecencyBonus(lastUsed) {
        const daysSinceUse = (Date.now() - lastUsed) / (1000 * 60 * 60 * 24);
        return Math.max(0, 1 - daysSinceUse / 30); // Decay over 30 days
    }
    calculateRelevanceScore(skill, query) {
        const queryLower = (query.query || '').toLowerCase();
        let score = 0;
        if (skill.name.toLowerCase().includes(queryLower))
            score += 0.8;
        for (const step of skill.sequence) {
            if (step.action.toLowerCase().includes(queryLower))
                score += 0.4;
        }
        for (const outcome of skill.outcomes) {
            if (outcome.toLowerCase().includes(queryLower))
                score += 0.3;
        }
        return score * skill.proficiency;
    }
    async cleanupLeastUsedSkills() {
        if (this.skills.size <= this.maxSkills * 0.8)
            return;
        const sorted = Array.from(this.skills.entries())
            .sort(([, a], [, b]) => {
            const scoreA = a.proficiency * a.usageCount;
            const scoreB = b.proficiency * b.usageCount;
            return scoreA - scoreB;
        });
        const toRemove = Math.floor(sorted.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
            const id = sorted[i]?.[0];
            if (id !== undefined) {
                this.skills.delete(id);
                this.performanceHistory.delete(id);
            }
        }
    }
    async cleanupLeastUsedRoutines() {
        if (this.routines.size <= this.maxRoutines * 0.8)
            return;
        const sorted = Array.from(this.routines.entries())
            .sort(([, a], [, b]) => a.frequency - b.frequency);
        const toRemove = Math.floor(sorted.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
            const id = sorted[i]?.[0];
            if (id !== undefined) {
                this.routines.delete(id);
            }
        }
    }
    async cleanupPoorAdaptations() {
        for (const skill of Array.from(this.skills.values())) {
            skill.adaptations = skill.adaptations.filter(adaptation => (adaptation.successRate || 0) >= this.adaptationThreshold);
        }
    }
}
//# sourceMappingURL=procedural_memory.js.map