/**
 * Comprehensive test utilities and mock environments for Mindcraft LangGraph testing
 * Provides reusable components for consistent and reliable testing across all test suites
 */

// ============================================================================
// CORE TEST UTILITIES
// ============================================================================

export class TestUtils {
    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    static async retry(fn, maxAttempts = 3, delayMs = 100) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                if (attempt < maxAttempts) {
                    console.log(`[RETRY] Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
                    await this.delay(delayMs);
                }
            }
        }
        
        throw lastError;
    }
    
    static generateRandomId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    static generateRandomPosition(center = { x: 0, y: 64, z: 0 }, radius = 50) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        
        return {
            x: center.x + Math.cos(angle) * distance,
            y: center.y + (Math.random() - 0.5) * 10,
            z: center.z + Math.sin(angle) * distance
        };
    }
    
    static calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    static lerp(start, end, factor) {
        return start + (end - start) * this.clamp(factor, 0, 1);
    }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export class TestPerformanceMonitor {
    constructor() {
        this.measurements = new Map();
        this.events = [];
        this.startTime = Date.now();
    }
    
    startMeasurement(name, category = 'general') {
        const measurement = {
            id: TestUtils.generateRandomId(),
            name,
            category,
            startTime: process.hrtime.bigint(),
            startTimestamp: Date.now()
        };
        
        this.measurements.set(measurement.id, measurement);
        return measurement.id;
    }
    
    endMeasurement(measurementId, result = 'completed') {
        const measurement = this.measurements.get(measurementId);
        if (!measurement) {
            console.warn(`[PERF] Measurement ${measurementId} not found`);
            return null;
        }
        
        const endTime = process.hrtime.bigint();
        const endTimestamp = Date.now();
        
        measurement.endTime = endTime;
        measurement.endTimestamp = endTimestamp;
        measurement.duration = Number(endTime - measurement.startTime) / 1000000; // Convert to milliseconds
        measurement.result = result;
        
        this.events.push({
            type: 'measurement_completed',
            measurement,
            timestamp: endTimestamp
        });
        
        return measurement;
    }
    
    recordEvent(type, data = {}) {
        const event = {
            id: TestUtils.generateRandomId(),
            type,
            data,
            timestamp: Date.now(),
            relativeTime: Date.now() - this.startTime
        };
        
        this.events.push(event);
        return event;
    }
    
    getMeasurementsByName(name) {
        return Array.from(this.measurements.values()).filter(m => m.name === name);
    }
    
    getMeasurementsByCategory(category) {
        return Array.from(this.measurements.values()).filter(m => m.category === category);
    }
    
    getStatistics(measurements) {
        if (measurements.length === 0) {
            return null;
        }
        
        const durations = measurements.map(m => m.duration);
        const sorted = [...durations].sort((a, b) => a - b);
        
        return {
            count: measurements.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            average: durations.reduce((a, b) => a + b, 0) / durations.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)]
        };
    }
    
    generateReport() {
        const report = {
            summary: {
                totalMeasurements: this.measurements.size,
                totalEvents: this.events.length,
                testDuration: Date.now() - this.startTime
            },
            measurements: {},
            events: this.events
        };
        
        // Group measurements by name
        const measurementsByName = {};
        for (const measurement of this.measurements.values()) {
            if (!measurementsByName[measurement.name]) {
                measurementsByName[measurement.name] = [];
            }
            measurementsByName[measurement.name].push(measurement);
        }
        
        // Calculate statistics for each measurement name
        for (const [name, measurements] of Object.entries(measurementsByName)) {
            report.measurements[name] = this.getStatistics(measurements);
        }
        
        return report;
    }
    
    reset() {
        this.measurements.clear();
        this.events = [];
        this.startTime = Date.now();
    }
}

// ============================================================================
// MOCK ENVIRONMENTS
// ============================================================================

export class MockWorld {
    constructor(config = {}) {
        this.config = {
            size: config.size || 100,
            seed: config.seed || Date.now(),
            time: config.time || 0,
            weather: config.weather || 'clear',
            ...config
        };
        
        this.entities = [];
        this.blocks = [];
        this.events = [];
        this.time = this.config.time;
    }
    
    addEntity(entity) {
        this.entities.push({
            id: TestUtils.generateRandomId(),
            ...entity,
            addedAt: Date.now()
        });
        return this.entities[this.entities.length - 1];
    }
    
    removeEntity(entityId) {
        this.entities = this.entities.filter(e => e.id !== entityId);
    }
    
    getEntitiesNearPosition(position, radius = 20) {
        return this.entities.filter(entity => {
            if (!entity.position) return false;
            return TestUtils.calculateDistance(position, entity.position) <= radius;
        });
    }
    
    getHostileEntitiesNearPosition(position, radius = 16) {
        return this.getEntitiesNearPosition(position, radius).filter(entity => entity.hostile);
    }
    
    addBlock(block) {
        this.blocks.push({
            id: TestUtils.generateRandomId(),
            ...block,
            addedAt: Date.now()
        });
        return this.blocks[this.blocks.length - 1];
    }
    
    getBlocksNearPosition(position, radius = 10) {
        return this.blocks.filter(block => {
            if (!block.position) return false;
            return TestUtils.calculateDistance(position, block.position) <= radius;
        });
    }
    
    advanceTime(deltaMs) {
        this.time += deltaMs;
        this.events.push({
            type: 'time_advanced',
            delta: deltaMs,
            newTime: this.time,
            timestamp: Date.now()
        });
    }
    
    setWeather(weather) {
        this.config.weather = weather;
        this.events.push({
            type: 'weather_changed',
            weather,
            timestamp: Date.now()
        });
    }
    
    createRandomEntities(count = 10, center = { x: 0, y: 64, z: 0 }, radius = 50) {
        const entityTypes = ['zombie', 'skeleton', 'cow', 'pig', 'sheep', 'chicken', 'player'];
        const entities = [];
        
        for (let i = 0; i < count; i++) {
            const entity = {
                type: entityTypes[Math.floor(Math.random() * entityTypes.length)],
                position: TestUtils.generateRandomPosition(center, radius),
                health: 20,
                hostile: Math.random() < 0.3
            };
            
            entities.push(this.addEntity(entity));
        }
        
        return entities;
    }
    
    reset() {
        this.entities = [];
        this.blocks = [];
        this.events = [];
        this.time = this.config.time;
    }
}

export class MockBot {
    constructor(config = {}) {
        this.config = {
            name: config.name || 'test_bot',
            position: config.position || { x: 0, y: 64, z: 0 },
            health: config.health || 20,
            food: config.food || 20,
            ...config
        };
        
        this.entity = {
            position: { ...this.config.position },
            health: this.config.health,
            food: this.config.food
        };
        
        this.pathfinder = this.createMockPathfinder();
        this.inventory = this.createMockInventory(config.inventory);
        this.controlStates = {
            forward: false,
            back: false,
            left: false,
            right: false,
            jump: false,
            sprint: false,
            sneak: false
        };
        
        this.events = [];
        this.lastDamageTime = 0;
        this.lastDamageTaken = 0;
    }
    
    createMockPathfinder() {
        const self = this;
        
        return {
            goal: null,
            setMovements: () => {},
            goto: async (goal) => {
                return new Promise((resolve, reject) => {
                    const delay = self.config.pathfindingDelay || (50 + Math.random() * 100);
                    
                    setTimeout(() => {
                        self.recordEvent('pathfinder_goto_attempt', { goal, delay });
                        
                        if (self.config.pathfindingFailureRate && Math.random() < self.config.pathfindingFailureRate) {
                            const error = new Error('PathStopped: Path was stopped before it could be completed!');
                            self.recordEvent('pathfinder_error', { goal, error: error.message });
                            reject(error);
                        } else {
                            self.entity.position = { ...goal };
                            self.goal = goal;
                            self.recordEvent('pathfinder_goto_success', { goal });
                            resolve();
                        }
                    }, delay);
                });
            },
            stop: () => {
                this.goal = null;
                self.recordEvent('pathfinder_stopped');
            },
            isMoving: () => this.goal !== null,
            setGoal: (goal) => {
                this.goal = goal;
                self.recordEvent('pathfinder_goal_set', { goal });
            }
        };
    }
    
    createMockInventory(items = []) {
        return {
            items: () => items,
            emptySlotCount: () => 36 - items.length,
            findItem: (itemType) => items.find(item => item.name === itemType),
            addItem: (item) => {
                items.push(item);
                this.recordEvent('inventory_item_added', { item });
            },
            removeItem: (itemType, count = 1) => {
                const index = items.findIndex(item => item.name === itemType);
                if (index !== -1) {
                    items.splice(index, count);
                    this.recordEvent('inventory_item_removed', { itemType, count });
                }
            }
        };
    }
    
    setControlState(control, state) {
        if (this.controlStates.hasOwnProperty(control)) {
            this.controlStates[control] = state;
            this.recordEvent('control_state_changed', { control, state });
        }
    }
    
    clearControlStates() {
        Object.keys(this.controlStates).forEach(control => {
            this.controlStates[control] = false;
        });
        this.recordEvent('control_states_cleared');
    }
    
    blockAt(pos) {
        // Return a mock block - can be customized for testing
        return {
            name: 'air',
            position: pos,
            type: 'block'
        };
    }
    
    simulateDamage(amount, source = 'test') {
        this.lastDamageTime = Date.now();
        this.lastDamageTaken = amount;
        this.entity.health -= amount;
        this.recordEvent('damage_taken', { amount, source, newHealth: this.entity.health });
    }
    
    heal(amount) {
        this.entity.health = Math.min(20, this.entity.health + amount);
        this.recordEvent('healed', { amount, newHealth: this.entity.health });
    }
    
    moveToPosition(position) {
        this.entity.position = { ...position };
        this.recordEvent('position_changed', { position });
    }
    
    recordEvent(type, data = {}) {
        this.events.push({
            type,
            data,
            timestamp: Date.now()
        });
    }
    
    getEventHistory(type = null, since = null) {
        let events = this.events;
        
        if (type) {
            events = events.filter(e => e.type === type);
        }
        
        if (since) {
            events = events.filter(e => e.timestamp >= since);
        }
        
        return events;
    }
    
    reset() {
        this.entity.position = { ...this.config.position };
        this.entity.health = this.config.health;
        this.entity.food = this.config.food;
        this.clearControlStates();
        this.pathfinder.stop();
        this.events = [];
        this.lastDamageTime = 0;
        this.lastDamageTaken = 0;
    }
}

export class MockAgent {
    constructor(config = {}) {
        this.config = {
            name: config.name || 'test_agent',
            botId: config.botId || 'test_bot',
            ...config
        };
        
        this.bot = new MockBot({ name: this.config.botId, ...config });
        this.performanceMonitor = new TestPerformanceMonitor();
        
        this.state = this.createInitialState();
        this.actions = this.createMockActions();
        this.reactiveLayer = this.createMockReactiveLayer();
        this.interruptController = this.createMockInterruptController();
        
        this.events = [];
    }
    
    createInitialState() {
        return {
            context: {
                position: this.bot.entity.position,
                health: this.bot.entity.health,
                food: this.bot.entity.food,
                nearbyEntities: [],
                nearbyBlocks: [],
                inventory: this.bot.inventory.items(),
                dimension: 'overworld',
                timeOfDay: 6000,
                weather: 'clear'
            },
            reactive: {
                activeMode: 'none',
                emergencyConditions: [],
                lastReactiveAction: null,
                interruptHistory: []
            },
            cognitive: {
                purpose: {
                    identity: { name: this.config.name, role: 'test_agent', background: 'test' },
                    personality: { openness: 0.5, conscientiousness: 0.5, extraversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
                    motivations: { primaryMotivation: 'test_completion' },
                    values: { coreValues: ['testing', 'validation'] },
                    ethics: { harmAvoidance: 0.8 }
                },
                goals: {
                    activeGoals: [],
                    goalHistory: []
                },
                memory: {
                    semantic: { facts: {}, concepts: {}, relationships: {} },
                    episodic: { episodes: [], currentIndex: 0 },
                    procedural: { procedures: {}, sequences: {}, habits: [] },
                    working: { currentFocus: '', activeTasks: [], buffer: [], capacity: 7 }
                },
                skills: {
                    skills: {},
                    experience: [],
                    learningRate: 0.1
                },
                processing: {
                    currentPhase: 'reflection',
                    cognitiveLoad: 0.5
                }
            },
            executive: {
                currentAction: null,
                actionQueue: [],
                decisionHistory: [],
                performanceMetrics: {
                    reactiveResponseTime: [],
                    cognitiveProcessingTime: []
                }
            },
            metadata: {
                agentId: this.config.name,
                startTime: Date.now(),
                lastUpdate: Date.now(),
                version: 'test'
            }
        };
    }
    
    createMockActions() {
        const self = this;
        
        return {
            currentActionLabel: null,
            runAction: async (label, func, options = {}) => {
                const measurementId = self.performanceMonitor.startMeasurement(`action_${label}`, 'action');
                
                try {
                    self.actions.currentActionLabel = label;
                    self.recordEvent('action_started', { label, options });
                    
                    const result = await func();
                    
                    self.performanceMonitor.endMeasurement(measurementId, 'success');
                    self.recordEvent('action_completed', { label, result });
                    
                    return { success: true, message: 'Action completed', result };
                } catch (error) {
                    self.performanceMonitor.endMeasurement(measurementId, 'error');
                    self.recordEvent('action_failed', { label, error: error.message });
                    
                    if (error.message && error.message.includes('PathStopped')) {
                        return { success: true, message: error.message, interrupted: true };
                    }
                    return { success: false, message: error.message };
                } finally {
                    self.actions.currentActionLabel = null;
                }
            }
        };
    }
    
    createMockReactiveLayer() {
        const self = this;
        
        return {
            update: async (deltaTime) => {
                const measurementId = self.performanceMonitor.startMeasurement('reactive_update', 'reactive');
                
                self.recordEvent('reactive_update_started', { deltaTime });
                
                // Simulate reactive processing
                await TestUtils.delay(10 + Math.random() * 20);
                
                self.performanceMonitor.endMeasurement(measurementId, 'completed');
                self.recordEvent('reactive_update_completed');
            },
            checkEmergencyConditions: () => {
                const emergencies = self.state.reactive.emergencyConditions;
                return emergencies.length > 0 ? 0 : 3; // Emergency or cognitive
            },
            executeReactiveResponse: async (priority) => {
                const measurementId = self.performanceMonitor.startMeasurement('reactive_response', 'reactive');
                
                self.recordEvent('reactive_response_started', { priority });
                
                // Simulate reactive response
                await TestUtils.delay(20 + Math.random() * 30);
                
                self.state.reactive.lastReactiveAction = {
                    mode: 'test_reactive_mode',
                    priority,
                    timestamp: Date.now(),
                    action: 'test_response',
                    result: 'success'
                };
                
                self.performanceMonitor.endMeasurement(measurementId, 'completed');
                self.recordEvent('reactive_response_completed', { priority });
            }
        };
    }
    
    createMockInterruptController() {
        const self = this;
        
        return {
            checkEmergencyConditions: (state) => {
                return self.reactiveLayer.checkEmergencyConditions();
            },
            preemptCognitiveProcessing: (priority) => {
                self.recordEvent('cognitive_preempted', { priority });
                self.state.cognitive.processing.currentPhase = 'interrupted';
            },
            resumeCognitiveProcessing: () => {
                self.recordEvent('cognitive_resumed');
                self.state.cognitive.processing.currentPhase = 'reflection';
            },
            shouldBypassCognitive: (priority) => {
                return priority <= 1; // EMERGENCY or SURVIVAL
            }
        };
    }
    
    // Utility methods
    isIdle() {
        return this.actions.currentActionLabel === null;
    }
    
    addEmergencyCondition(type, severity = 1.0) {
        const condition = {
            type,
            severity,
            detectedAt: Date.now(),
            position: this.bot.entity.position
        };
        this.state.reactive.emergencyConditions.push(condition);
        this.recordEvent('emergency_condition_added', { type, severity });
    }
    
    clearEmergencyConditions() {
        this.state.reactive.emergencyConditions = [];
        this.recordEvent('emergency_conditions_cleared');
    }
    
    updateWorldContext(world) {
        if (world) {
            this.state.context.nearbyEntities = world.getEntitiesNearPosition(this.bot.entity.position);
            this.state.context.nearbyBlocks = world.getBlocksNearPosition(this.bot.entity.position);
        }
        
        this.state.context.position = this.bot.entity.position;
        this.state.context.health = this.bot.entity.health;
        this.state.context.food = this.bot.entity.food;
        this.state.metadata.lastUpdate = Date.now();
    }
    
    recordEvent(type, data = {}) {
        this.events.push({
            type,
            data,
            timestamp: Date.now()
        });
    }
    
    getEventHistory(type = null, since = null) {
        let events = this.events;
        
        if (type) {
            events = events.filter(e => e.type === type);
        }
        
        if (since) {
            events = events.filter(e => e.timestamp >= since);
        }
        
        return events;
    }
    
    getMetrics() {
        return {
            performance: this.performanceMonitor.generateReport(),
            events: this.events.length,
            emergencyConditions: this.state.reactive.emergencyConditions.length,
            activeMode: this.state.reactive.activeMode,
            cognitivePhase: this.state.cognitive.processing.currentPhase,
            isIdle: this.isIdle()
        };
    }
    
    reset() {
        this.bot.reset();
        this.state = this.createInitialState();
        this.performanceMonitor.reset();
        this.events = [];
    }
}

// ============================================================================
// TEST SCENARIO BUILDER
// ============================================================================

export class TestScenarioBuilder {
    constructor() {
        this.scenario = {
            name: '',
            description: '',
            setup: [],
            steps: [],
            assertions: [],
            cleanup: [],
            config: {}
        };
    }
    
    setName(name) {
        this.scenario.name = name;
        return this;
    }
    
    setDescription(description) {
        this.scenario.description = description;
        return this;
    }
    
    setConfig(config) {
        this.scenario.config = { ...this.scenario.config, ...config };
        return this;
    }
    
    addSetup(description, setupFunction) {
        this.scenario.setup.push({ description, function: setupFunction });
        return this;
    }
    
    addStep(description, stepFunction, options = {}) {
        this.scenario.steps.push({ 
            description, 
            function: stepFunction, 
            timeout: options.timeout || 5000,
            critical: options.critical !== false
        });
        return this;
    }
    
    addAssertion(description, assertionFunction) {
        this.scenario.assertions.push({ description, function: assertionFunction });
        return this;
    }
    
    addCleanup(description, cleanupFunction) {
        this.scenario.cleanup.push({ description, function: cleanupFunction });
        return this;
    }
    
    build() {
        return new TestScenario(this.scenario);
    }
}

export class TestScenario {
    constructor(scenarioConfig) {
        this.config = scenarioConfig;
        this.context = {};
        this.results = {
            setup: [],
            steps: [],
            assertions: [],
            cleanup: [],
            success: true,
            errors: [],
            warnings: []
        };
        this.startTime = null;
        this.endTime = null;
    }
    
    async execute() {
        console.log(`\n[SCENARIO] Starting: ${this.config.name}`);
        console.log(`[SCENARIO] Description: ${this.config.description}`);
        
        this.startTime = Date.now();
        
        try {
            // Execute setup
            await this.executeSection('setup', this.config.setup);
            
            // Execute steps
            await this.executeSection('steps', this.config.steps);
            
            // Execute assertions
            await this.executeSection('assertions', this.config.assertions);
            
        } catch (error) {
            this.results.success = false;
            this.results.errors.push({
                phase: 'execution',
                error: error.message,
                stack: error.stack
            });
            console.error(`[SCENARIO] Execution failed: ${error.message}`);
        } finally {
            // Always execute cleanup
            try {
                await this.executeSection('cleanup', this.config.cleanup);
            } catch (error) {
                this.results.warnings.push({
                    phase: 'cleanup',
                    error: error.message
                });
                console.warn(`[SCENARIO] Cleanup failed: ${error.message}`);
            }
            
            this.endTime = Date.now();
            this.logResults();
        }
        
        return this.results;
    }
    
    async executeSection(sectionName, sectionItems) {
        console.log(`  [${sectionName.toUpperCase()}] Executing ${sectionItems.length} items...`);
        
        for (let i = 0; i < sectionItems.length; i++) {
            const item = sectionItems[i];
            console.log(`    ${i + 1}. ${item.description}`);
            
            const itemStart = Date.now();
            
            try {
                const result = await this.executeWithTimeout(
                    item.function,
                    item.timeout || 5000
                );
                
                const duration = Date.now() - itemStart;
                
                this.results[sectionName].push({
                    description: item.description,
                    success: true,
                    duration,
                    result
                });
                
                console.log(`      ✓ Completed in ${duration}ms`);
                
            } catch (error) {
                const duration = Date.now() - itemStart;
                
                this.results[sectionName].push({
                    description: item.description,
                    success: false,
                    duration,
                    error: error.message
                });
                
                this.results.errors.push({
                    phase: sectionName,
                    item: item.description,
                    error: error.message
                });
                
                console.log(`      ✗ Failed: ${error.message}`);
                
                // For critical errors, abort execution
                if (item.critical !== false) {
                    throw error;
                }
            }
        }
    }
    
    async executeWithTimeout(fn, timeoutMs) {
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Operation timed out after ${timeoutMs}ms`));
            }, timeoutMs);
            
            try {
                const result = await fn(this.context);
                clearTimeout(timeoutId);
                resolve(result);
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }
    
    logResults() {
        const duration = this.endTime - this.startTime;
        
        console.log(`\n[SCENARIO] Results for: ${this.config.name}`);
        console.log(`[SCENARIO] Duration: ${duration}ms`);
        console.log(`[SCENARIO] Success: ${this.results.success ? 'YES' : 'NO'}`);
        
        if (this.results.errors.length > 0) {
            console.log(`[SCENARIO] Errors: ${this.results.errors.length}`);
            this.results.errors.forEach(error => {
                console.log(`  - ${error.phase}: ${error.error}`);
            });
        }
        
        if (this.results.warnings.length > 0) {
            console.log(`[SCENARIO] Warnings: ${this.results.warnings.length}`);
            this.results.warnings.forEach(warning => {
                console.log(`  - ${warning.phase}: ${warning.error}`);
            });
        }
        
        console.log(`[SCENARIO] Setup: ${this.results.setup.filter(s => s.success).length}/${this.results.setup.length} successful`);
        console.log(`[SCENARIO] Steps: ${this.results.steps.filter(s => s.success).length}/${this.results.steps.length} successful`);
        console.log(`[SCENARIO] Assertions: ${this.results.assertions.filter(s => s.success).length}/${this.results.assertions.length} successful`);
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    TestUtils,
    TestPerformanceMonitor,
    MockWorld,
    MockBot,
    MockAgent,
    TestScenarioBuilder,
    TestScenario
};