/**
 * Working memory system with attention management and capacity limits
 */
export class WorkingMemory {
    items = new Map();
    currentFocus = null;
    capacity = 7; // 7±2 rule
    attentionLevel = 0.5; // Current attention level
    decayRate = 0.1; // Per second
    attentionWeights = {
        'perception': 0.3,
        'event': 0.4,
        'goal': 0.5,
        'concept': 0.2
    };
    semanticQueryCallback;
    constructor() {
        this.initializeDefaultItems();
    }
    /**
     * Initialize default working memory items
     */
    initializeDefaultItems() {
        const defaults = [
            {
                id: 'current_position',
                content: { type: 'position', data: { x: 0, y: 64, z: 0 } },
                type: 'perception',
                priority: 0.8,
                decayRate: 0.05
            },
            {
                id: 'health_status',
                content: { type: 'health', data: { current: 20, max: 20 } },
                type: 'perception',
                priority: 0.9,
                decayRate: 0.02
            },
            {
                id: 'immediate_goal',
                content: { type: 'goal', data: { description: 'survive' } },
                type: 'goal',
                priority: 0.7,
                decayRate: 0.01
            }
        ];
        for (const item of defaults) {
            this.items.set(item.id, {
                ...item,
                timestamp: Date.now()
            });
        }
    }
    /**
     * Update working memory with new agent state
     */
    async update(agentState, deltaTime) {
        // Update perception items from world context
        await this.updatePerceptions(agentState.context);
        // Update goal items from cognitive state
        await this.updateGoals(agentState.cognitive.goals);
        // Apply decay to all items
        this.applyDecay(deltaTime / 1000); // Convert to seconds
        // Remove decayed items and enforce capacity
        await this.cleanup();
        // Update attention level based on cognitive load
        this.updateAttentionLevel(agentState.cognitive.processing.cognitiveLoad);
        // Update focus based on priority and attention
        this.updateFocus();
    }
    /**
     * Add new item to working memory
     */
    async addItem(item) {
        const workingItem = {
            ...item,
            timestamp: Date.now()
        };
        // Check if item already exists
        if (this.items.has(item.id)) {
            const existing = this.items.get(item.id);
            // Update with higher priority
            existing.priority = Math.max(existing.priority, item.priority);
            existing.content = item.content;
            existing.timestamp = Date.now();
            return;
        }
        // Add new item if capacity allows
        if (this.items.size < this.capacity) {
            this.items.set(item.id, workingItem);
        }
        else {
            // Replace lowest priority item
            await this.replaceLowestPriority(workingItem);
        }
    }
    /**
     * Add event to working memory
     */
    async addEvent(event) {
        await this.addItem({
            id: `event_${event.id}`,
            content: {
                type: 'event',
                data: {
                    eventId: event.id,
                    action: event.action,
                    outcome: event.outcome,
                    importance: event.importance
                }
            },
            type: 'event',
            priority: event.importance,
            decayRate: 0.2 // Events decay faster
        });
    }
    /**
     * Query working memory
     */
    query(query) {
        const results = [];
        const queryLower = query.query.toLowerCase();
        for (const item of this.items.values()) {
            // Apply type filter
            if (query.filters?.type && item.type !== query.filters.type) {
                continue;
            }
            // Apply priority filter
            if (query.importance && item.priority < query.importance) {
                continue;
            }
            // Check text relevance
            let relevance = 0;
            const contentStr = JSON.stringify(item.content).toLowerCase();
            if (contentStr.includes(queryLower)) {
                relevance += 0.8;
            }
            if (item.id.toLowerCase().includes(queryLower)) {
                relevance += 0.4;
            }
            // Calculate final score
            const score = relevance * item.priority * this.getCurrentAttention();
            if (score > 0.1) {
                results.push(item);
            }
        }
        // Sort by priority and attention
        results.sort((a, b) => (b.priority * b.decayRate) - (a.priority * a.decayRate));
        if (query.limit) {
            return results.slice(0, query.limit);
        }
        return results;
    }
    /**
     * Get current working memory state
     */
    getState() {
        return {
            items: Array.from(this.items.values()),
            currentFocus: this.currentFocus,
            capacity: this.capacity,
            attentionLevel: this.attentionLevel
        };
    }
    /**
     * Get item by ID
     */
    getItem(id) {
        return this.items.get(id) || null;
    }
    /**
     * Remove item by ID
     */
    removeItem(id) {
        return this.items.delete(id);
    }
    /**
     * Get current focus item
     */
    getFocusItem() {
        if (!this.currentFocus)
            return null;
        return this.items.get(this.currentFocus) || null;
    }
    /**
     * Set focus to specific item
     */
    setFocus(itemId) {
        if (!this.items.has(itemId))
            return false;
        this.currentFocus = itemId;
        const item = this.items.get(itemId);
        item.priority = Math.min(1.0, item.priority + 0.1); // Boost priority of focused item
        return true;
    }
    /**
     * Apply decay to all items
     */
    applyDecay(deltaTimeSeconds) {
        const currentTime = Date.now();
        for (const item of this.items.values()) {
            const timeSinceCreation = (currentTime - item.timestamp) / 1000;
            const decayFactor = Math.exp(-item.decayRate * timeSinceCreation);
            item.priority *= decayFactor;
            // Remove items that have decayed too much
            if (item.priority < 0.05) {
                this.items.delete(item.id);
            }
        }
    }
    /**
     * Register semantic query callback
     */
    onSemanticQuery(callback) {
        this.semanticQueryCallback = callback;
    }
    /**
     * Rank items by relevance to query
     */
    rankByRelevance(items, query) {
        return items.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, query);
            const scoreB = this.calculateRelevanceScore(b, query);
            return scoreB - scoreA;
        });
    }
    /**
     * Get memory statistics
     */
    getStatistics() {
        const totalPriority = Array.from(this.items.values()).reduce((sum, item) => sum + item.priority, 0);
        return {
            itemCount: this.items.size,
            averagePriority: this.items.size > 0 ? totalPriority / this.items.size : 0,
            attentionLevel: this.attentionLevel
        };
    }
    /**
     * Cleanup working memory
     */
    cleanup() {
        // Remove low priority items
        for (const [id, item] of this.items.entries()) {
            if (item.priority < 0.1) {
                this.items.delete(id);
            }
        }
        // Enforce capacity limit
        if (this.items.size > this.capacity) {
            const sorted = Array.from(this.items.entries())
                .sort(([, a], [, b]) => a.priority - b.priority);
            const toRemove = sorted.length - this.capacity;
            for (let i = 0; i < toRemove; i++) {
                this.items.delete(sorted[i][0]);
            }
        }
        // Update focus if it was removed
        if (this.currentFocus && !this.items.has(this.currentFocus)) {
            this.currentFocus = null;
        }
    }
    /**
     * Private helper methods
     */
    async updatePerceptions(context) {
        // Update position
        this.addItem({
            id: 'current_position',
            content: { type: 'position', data: context.position },
            type: 'perception',
            priority: 0.6,
            decayRate: 0.05
        });
        // Update health
        this.addItem({
            id: 'health_status',
            content: { type: 'health', data: { current: context.health, max: 20 } },
            type: 'perception',
            priority: context.health < 10 ? 0.9 : 0.6,
            decayRate: 0.02
        });
        // Update nearby entities
        if (context.nearbyEntities.length > 0) {
            const hostileNearby = context.nearbyEntities.filter(e => e.hostile);
            if (hostileNearby.length > 0) {
                this.addItem({
                    id: 'hostile_nearby',
                    content: {
                        type: 'threat',
                        data: {
                            count: hostileNearby.length,
                            closest: hostileNearby[0]
                        }
                    },
                    type: 'perception',
                    priority: 0.8,
                    decayRate: 0.1
                });
            }
        }
        // Update inventory status
        const criticalItems = context.inventory.filter(item => item.count < 2);
        if (criticalItems.length > 0) {
            this.addItem({
                id: 'low_resources',
                content: {
                    type: 'resource',
                    data: {
                        items: criticalItems
                    }
                },
                type: 'perception',
                priority: 0.7,
                decayRate: 0.05
            });
        }
    }
    async updateGoals(goalState) {
        // Add active goals to working memory
        if (goalState.activeGoals && goalState.activeGoals.length > 0) {
            const topGoal = goalState.activeGoals[0]; // Assuming sorted by priority
            this.addItem({
                id: 'current_goal',
                content: {
                    type: 'goal',
                    data: {
                        description: topGoal.description,
                        priority: topGoal.priority,
                        progress: topGoal.progress
                    }
                },
                type: 'goal',
                priority: 0.7,
                decayRate: 0.01
            });
        }
    }
    updateAttentionLevel(cognitiveLoad) {
        // Attention level inversely related to cognitive load
        this.attentionLevel = Math.max(0.1, Math.min(1.0, 1.0 - cognitiveLoad));
    }
    updateFocus() {
        if (this.items.size === 0) {
            this.currentFocus = null;
            return;
        }
        // Find highest priority item
        let bestItem = null;
        let bestScore = 0;
        for (const item of this.items.values()) {
            const score = item.priority * this.attentionWeights[item.type] * this.attentionLevel;
            if (score > bestScore) {
                bestScore = score;
                bestItem = item;
            }
        }
        this.currentFocus = bestItem?.id || null;
    }
    getCurrentAttention() {
        return this.attentionLevel;
    }
    async replaceLowestPriority(newItem) {
        let lowestId = null;
        let lowestPriority = 1.0;
        for (const [id, item] of this.items.entries()) {
            if (item.priority < lowestPriority) {
                lowestPriority = item.priority;
                lowestId = id;
            }
        }
        if (lowestId && newItem.priority > lowestPriority) {
            this.items.delete(lowestId);
            this.items.set(newItem.id, newItem);
        }
    }
    calculateRelevanceScore(item, query) {
        const queryLower = query.query.toLowerCase();
        let score = 0;
        const contentStr = JSON.stringify(item.content).toLowerCase();
        if (contentStr.includes(queryLower))
            score += 0.8;
        if (item.id.toLowerCase().includes(queryLower))
            score += 0.4;
        return score * item.priority * this.attentionWeights[item.type];
    }
}
//# sourceMappingURL=working_memory.js.map