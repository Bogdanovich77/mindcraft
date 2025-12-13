/**
 * Episodic memory system for storing events with forgetting curves and consolidation
 */
export class EpisodicMemory {
    events = new Map();
    timelines = new Map();
    emotionalTags = new Map();
    consolidationQueue = [];
    maxEvents = 500;
    forgettingCurve;
    consolidationThreshold = 0.7; // Importance threshold for consolidation
    eventStoredCallbacks = [];
    semanticMemoryRef = null; // Reference to semantic memory for consolidation
    constructor() {
        this.forgettingCurve = new ForgettingCurve();
    }
    /**
     * Set reference to semantic memory for consolidation
     */
    setSemanticMemory(semanticMemory) {
        this.semanticMemoryRef = semanticMemory;
    }
    /**
     * Store a new episodic event
     */
    async storeEvent(event) {
        // Ensure event has required fields
        const extendedEvent = {
            ...event,
            timestamp: event.timestamp || Date.now(),
            importance: event.importance || this.calculateImportance(event),
            tags: event.tags || []
        };
        // Check capacity limits
        if (this.events.size >= this.maxEvents) {
            await this.cleanupLeastImportantEvents();
        }
        // Store the event
        this.events.set(extendedEvent.id, extendedEvent);
        // Update timelines
        await this.updateTimelines(extendedEvent);
        // Process emotional tags
        if (extendedEvent.emotional) {
            await this.processEmotionalTags(extendedEvent);
        }
        // Check for consolidation
        if (extendedEvent.importance >= this.consolidationThreshold) {
            this.consolidationQueue.push(extendedEvent.id);
        }
        // Trigger callbacks
        this.eventStoredCallbacks.forEach(callback => callback(extendedEvent));
    }
    /**
     * Consolidate a specific episode to semantic memory
     */
    async consolidateEpisode(episode) {
        // Reduce activation level of the episodic event
        const event = this.events.get(episode.id);
        if (!event)
            return;
        // Call semantic memory to extract and store semantic facts and procedural patterns
        if (this.semanticMemoryRef && typeof this.semanticMemoryRef.generalizeExperience === 'function') {
            await this.semanticMemoryRef.generalizeExperience(event);
        }
        // Extract patterns locally as well
        const patterns = await this.extractPatterns(event);
        // Store extracted patterns in working memory for immediate access
        await this.storePatternsInWorkingMemory(patterns, event);
        // Reduce episodic memory activation (forgetting)
        event.importance *= 0.7; // Reduce importance after consolidation
        // Mark as consolidated
        if (!event.tags.includes('consolidated')) {
            event.tags.push('consolidated');
        }
        // Remove from consolidation queue
        const index = this.consolidationQueue.indexOf(episode.id);
        if (index >= 0) {
            this.consolidationQueue.splice(index, 1);
        }
        // Trigger consolidation callbacks if any
        this.eventStoredCallbacks.forEach(callback => callback(event));
    }
    /**
     * Store extracted patterns in working memory for immediate access
     */
    async storePatternsInWorkingMemory(patterns, event) {
        // This would integrate with working memory system
        // For now, we'll just store them as metadata
        if (!event.metadata) {
            event.metadata = {};
        }
        event.metadata.extractedPatterns = patterns;
        event.metadata.consolidationTimestamp = Date.now();
    }
    /**
     * Query episodic memory
     */
    async query(query) {
        const results = [];
        const queryLower = query.query.toLowerCase();
        const currentTime = Date.now();
        for (const event of Array.from(this.events.values())) {
            // Apply time filter
            if (query.timeRange) {
                if (event.timestamp < query.timeRange.start || event.timestamp > query.timeRange.end) {
                    continue;
                }
            }
            // Apply importance filter
            if (query.importance && event.importance < query.importance) {
                continue;
            }
            // Calculate forgetting-adjusted importance
            const timeSinceEvent = (currentTime - event.timestamp) / (1000 * 60 * 60 * 24); // days
            const forgottenImportance = this.forgettingCurve.calculateAdjustedImportance(event.importance, timeSinceEvent);
            // Check text relevance
            let relevance = 0;
            if (event.type && event.type.toLowerCase().includes(queryLower)) {
                relevance += 0.6;
            }
            if (event.action && event.action.toLowerCase().includes(queryLower)) {
                relevance += 0.5;
            }
            if (event.outcome && event.outcome.toLowerCase().includes(queryLower)) {
                relevance += 0.4;
            }
            // Check tags
            for (const tag of event.tags) {
                if (tag.toLowerCase().includes(queryLower)) {
                    relevance += 0.3;
                }
            }
            // Calculate final score
            const score = (relevance * 0.7 + forgottenImportance * 0.3);
            if (score > 0.1) {
                results.push({
                    ...event,
                    importance: forgottenImportance // Return adjusted importance
                });
            }
        }
        // Sort by score and limit results
        results.sort((a, b) => b.importance - a.importance);
        if (query.limit) {
            return results.slice(0, query.limit);
        }
        return results;
    }
    /**
     * Get recent events within time window
     */
    async getRecentEvents(timeWindowMs) {
        const cutoff = Date.now() - timeWindowMs;
        const recent = [];
        for (const event of Array.from(this.events.values())) {
            if (event.timestamp >= cutoff) {
                recent.push(event);
            }
        }
        return recent.sort((a, b) => b.timestamp - a.timestamp);
    }
    /**
     * Get event by ID
     */
    getEventById(eventId) {
        return this.events.get(eventId) || null;
    }
    /**
     * Apply forgetting decay to all events
     */
    async applyDecay(deltaTimeMs) {
        const deltaTimeDays = deltaTimeMs / (1000 * 60 * 60 * 24);
        for (const event of Array.from(this.events.values())) {
            const timeSinceEvent = (Date.now() - event.timestamp) / (1000 * 60 * 60 * 24);
            const adjustedImportance = this.forgettingCurve.calculateAdjustedImportance(event.importance, timeSinceEvent);
            // Mark for removal if importance is too low
            if (adjustedImportance < 0.05) {
                this.events.delete(event.id);
            }
        }
    }
    /**
     * Consolidate important events
     */
    async consolidateEvents(eventIds) {
        for (const eventId of eventIds) {
            const event = this.events.get(eventId);
            if (!event)
                continue;
            // Mark as consolidated
            event.tags.push('consolidated');
            // Extract patterns and create semantic knowledge
            const patterns = await this.extractPatterns(event);
            // Remove from consolidation queue
            const index = this.consolidationQueue.indexOf(eventId);
            if (index >= 0) {
                this.consolidationQueue.splice(index, 1);
            }
        }
    }
    /**
     * Get events by emotional valence
     */
    getEventsByEmotion(emotionType) {
        const results = [];
        for (const event of Array.from(this.events.values())) {
            if (!event.emotional)
                continue;
            switch (emotionType) {
                case 'positive':
                    if (event.emotional.valence > 0.3)
                        results.push(event);
                    break;
                case 'negative':
                    if (event.emotional.valence < -0.3)
                        results.push(event);
                    break;
                case 'high_arousal':
                    if (event.emotional.arousal > 0.7)
                        results.push(event);
                    break;
                case 'low_arousal':
                    if (event.emotional.arousal < 0.3)
                        results.push(event);
                    break;
            }
        }
        return results.sort((a, b) => b.importance - a.importance);
    }
    /**
     * Get causal chain of events
     */
    getCausalChain(startEventId, maxDepth = 5) {
        const chain = [];
        const visited = new Set();
        const explore = (eventId, depth) => {
            if (depth <= 0 || visited.has(eventId))
                return;
            visited.add(eventId);
            const event = this.events.get(eventId);
            if (!event)
                return;
            chain.push(event);
            // Find causally related events
            for (const otherEvent of Array.from(this.events.values())) {
                if (this.isCausallyRelated(otherEvent, event) && !visited.has(otherEvent.id)) {
                    explore(otherEvent.id, depth - 1);
                }
            }
        };
        explore(startEventId, maxDepth);
        return chain;
    }
    /**
     * Rank events by relevance to query
     */
    rankByRelevance(events, query) {
        return events.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, query);
            const scoreB = this.calculateRelevanceScore(b, query);
            return scoreB - scoreA;
        });
    }
    /**
     * Get memory statistics
     */
    getStatistics() {
        const totalImportance = Array.from(this.events.values()).reduce((sum, e) => sum + e.importance, 0);
        const timestamps = Array.from(this.events.values()).map(e => e.timestamp);
        const oldestEvent = timestamps.length > 0 ? Math.min(...timestamps) : 0;
        return {
            eventCount: this.events.size,
            averageImportance: this.events.size > 0 ? totalImportance / this.events.size : 0,
            oldestEvent
        };
    }
    /**
     * Register callback for event storage
     */
    onEventStored(callback) {
        this.eventStoredCallbacks.push(callback);
    }
    /**
     * Cleanup old events
     */
    async cleanup() {
        await this.cleanupLeastImportantEvents();
        await this.cleanupOldTimelines();
    }
    /**
     * Private helper methods
     */
    calculateImportance(event) {
        let importance = 0.5; // Base importance
        // Emotional impact increases importance
        if (event.emotional) {
            importance += Math.abs(event.emotional.valence) * 0.3;
            importance += event.emotional.arousal * 0.2;
            importance += event.emotional.urgency * 0.3;
        }
        // Success/failure affects importance
        if (event.success !== undefined) {
            importance += event.success ? 0.2 : 0.3;
        }
        // Emergency situations are more important
        if (event.type.includes('emergency') || event.type.includes('danger')) {
            importance += 0.4;
        }
        return Math.min(1.0, importance);
    }
    async updateTimelines(event) {
        const timelineKey = `${event.location.x}_${event.location.z}`; // Group by area
        let timeline = this.timelines.get(timelineKey);
        if (!timeline) {
            timeline = {
                id: timelineKey,
                events: [],
                location: event.location,
                startTime: event.timestamp,
                endTime: event.timestamp
            };
            this.timelines.set(timelineKey, timeline);
        }
        timeline.events.push(event.id);
        timeline.endTime = Math.max(timeline.endTime, event.timestamp);
    }
    async processEmotionalTags(event) {
        if (!event.emotional)
            return;
        const tagKey = `${Math.round(event.emotional.valence * 10)}_${Math.round(event.emotional.arousal * 10)}`;
        let tag = this.emotionalTags.get(tagKey);
        if (!tag) {
            tag = {
                id: tagKey,
                valence: event.emotional.valence,
                arousal: event.emotional.arousal,
                eventIds: [],
                frequency: 0
            };
            this.emotionalTags.set(tagKey, tag);
        }
        tag.eventIds.push(event.id);
        tag.frequency++;
    }
    async extractPatterns(event) {
        const patterns = [];
        // Extract action-outcome patterns
        if (event.action && event.outcome) {
            patterns.push({
                type: 'action_outcome',
                action: event.action,
                outcome: event.outcome,
                context: event.location,
                confidence: event.importance
            });
        }
        // Extract emotional patterns
        if (event.emotional && event.emotional.urgency > 0.7) {
            patterns.push({
                type: 'emergency_response',
                trigger: event.type,
                response: event.action || 'no_action',
                emotional: event.emotional,
                confidence: event.importance
            });
        }
        return patterns;
    }
    isCausallyRelated(event1, event2) {
        // Simple heuristic: events within 30 seconds in same location might be related
        const timeDiff = Math.abs(event1.timestamp - event2.timestamp);
        const distance = Math.sqrt(Math.pow(event1.location.x - event2.location.x, 2) +
            Math.pow(event1.location.z - event2.location.z, 2));
        return timeDiff < 30000 && distance < 20; // 30 seconds, 20 blocks
    }
    calculateRelevanceScore(event, query) {
        const queryLower = query.query.toLowerCase();
        let score = 0;
        if (event.type?.toLowerCase().includes(queryLower))
            score += 0.6;
        if (event.action?.toLowerCase().includes(queryLower))
            score += 0.5;
        if (event.outcome?.toLowerCase().includes(queryLower))
            score += 0.4;
        for (const tag of event.tags) {
            if (tag.toLowerCase().includes(queryLower))
                score += 0.3;
        }
        return score * event.importance;
    }
    async cleanupLeastImportantEvents() {
        if (this.events.size <= this.maxEvents * 0.8)
            return;
        const sorted = Array.from(this.events.entries())
            .sort(([, a], [, b]) => a.importance - b.importance);
        const toRemove = Math.floor(sorted.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
            const id = sorted[i]?.[0];
            if (id !== undefined) {
                this.events.delete(id);
            }
        }
    }
    async cleanupOldTimelines() {
        const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
        for (const [id, timeline] of Array.from(this.timelines.entries())) {
            if (timeline.endTime < cutoff) {
                this.timelines.delete(id);
            }
        }
    }
}
/**
 * Forgetting curve implementation based on Ebbinghaus's law
 */
export class ForgettingCurve {
    decayConstant = 0.693; // Half-life of 1 day for average importance
    importanceFactor = 2.0; // Higher importance decays slower
    calculateAdjustedImportance(originalImportance, timeSinceDays) {
        // Higher importance items have longer half-lives
        const halfLifeDays = 1 + (originalImportance * this.importanceFactor * 30); // 1-31 days
        const decayRate = Math.log(2) / halfLifeDays;
        return originalImportance * Math.exp(-decayRate * timeSinceDays);
    }
    calculateRetentionProbability(originalImportance, timeSinceDays) {
        const adjusted = this.calculateAdjustedImportance(originalImportance, timeSinceDays);
        return Math.max(0, Math.min(1, adjusted / originalImportance));
    }
}
//# sourceMappingURL=episodic_memory.js.map