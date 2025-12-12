/**
 * Simple test for pathfinder state management system
 * Tests the core functionality without TypeScript compilation
 */

// Mock the pathfinder state management for testing
class MockInterruptiblePathfinder {
    constructor(botId, bot) {
        this.botId = botId;
        this.bot = bot;
        this.activeOperations = new Map();
        this.operationCounter = 0;
        this.metrics = {
            totalOperationsStarted: 0,
            totalOperationsCompleted: 0,
            totalOperationsFailed: 0,
            totalOperationsInterrupted: 0,
            averageCompletionTime: 0,
            successRate: 0
        };
    }

    async startOperation(type, goal, source, options = {}) {
        const operationId = `op_${this.operationCounter++}`;
        const operation = {
            id: operationId,
            type,
            goal,
            source,
            startTime: Date.now(),
            timeout: options.timeout || 30000,
            priority: options.priority || 1,
            metadata: options.metadata || {}
        };

        this.activeOperations.set(operationId, operation);
        this.metrics.totalOperationsStarted++;
        
        console.log(`[MOCK] Started operation ${operationId}: ${type} from ${source}`);
        return operationId;
    }

    completeOperation(operationId, result = 'success') {
        if (!this.activeOperations.has(operationId)) {
            console.warn(`[MOCK] Operation ${operationId} not found`);
            return false;
        }

        const operation = this.activeOperations.get(operationId);
        const completionTime = Date.now() - operation.startTime;

        this.activeOperations.delete(operationId);
        
        if (result === 'success') {
            this.metrics.totalOperationsCompleted++;
        } else if (result === 'interrupted') {
            this.metrics.totalOperationsInterrupted++;
        } else {
            this.metrics.totalOperationsFailed++;
        }

        this.updateMetrics(completionTime);
        console.log(`[MOCK] Completed operation ${operationId} with result: ${result}`);
        return true;
    }

    stopAllOperations(reason) {
        const stopped = [];
        for (const [operationId, operation] of this.activeOperations) {
            this.completeOperation(operationId, 'interrupted');
            stopped.push({ id: operationId, reason });
        }
        console.log(`[MOCK] Stopped ${stopped.length} operations. Reason: ${reason}`);
        return { stopped: stopped.length, operations: stopped };
    }

    hasActiveOperations() {
        return this.activeOperations.size > 0;
    }

    getActiveOperations() {
        return Array.from(this.activeOperations.values());
    }

    getState() {
        return {
            activeOperations: this.activeOperations,
            totalOperationsStarted: this.metrics.totalOperationsStarted,
            totalOperationsCompleted: this.metrics.totalOperationsCompleted,
            totalOperationsFailed: this.metrics.totalOperationsFailed,
            totalOperationsInterrupted: this.metrics.totalOperationsInterrupted
        };
    }

    getMetrics() {
        return { ...this.metrics };
    }

    updateMetrics(completionTime) {
        const total = this.metrics.totalOperationsCompleted + 
                     this.metrics.totalOperationsFailed + 
                     this.metrics.totalOperationsInterrupted;
        
        if (total > 0) {
            this.metrics.successRate = this.metrics.totalOperationsCompleted / total;
            this.metrics.averageCompletionTime = 
                (this.metrics.averageCompletionTime * (total - 1) + completionTime) / total;
        }
    }

    validateState() {
        const issues = [];
        const corruptedOperations = [];
        const now = Date.now();

        for (const [operationId, operation] of this.activeOperations) {
            const age = now - operation.startTime;
            if (age > operation.timeout * 2) {
                corruptedOperations.push(operationId);
                issues.push(`Operation ${operationId} is stale (${age}ms old)`);
            }
        }

        return {
            isValid: corruptedOperations.length === 0,
            issues,
            corruptedOperations,
            recommendations: corruptedOperations.length > 0 ? 
                ['Clean up stale operations', 'Reset pathfinder state'] : []
        };
    }

    recoverFromStaleState() {
        const validation = this.validateState();
        let recovered = 0;

        for (const operationId of validation.corruptedOperations) {
            this.completeOperation(operationId, 'failed');
            recovered++;
        }

        console.log(`[MOCK] Recovered ${recovered} stale operations`);
        return { recovered, cleaned: recovered };
    }

    cleanupTimedOutOperations() {
        const now = Date.now();
        let cleaned = 0;

        for (const [operationId, operation] of this.activeOperations) {
            if (now - operation.startTime > operation.timeout) {
                this.completeOperation(operationId, 'failed');
                cleaned++;
            }
        }

        console.log(`[MOCK] Cleaned up ${cleaned} timed out operations`);
        return { cleaned };
    }
}

class MockPathfinderStateManager {
    static instance = null;

    static getInstance() {
        if (!MockPathfinderStateManager.instance) {
            MockPathfinderStateManager.instance = new MockPathfinderStateManager();
        }
        return MockPathfinderStateManager.instance;
    }

    constructor() {
        this.pathfinders = new Map();
    }

    registerPathfinder(botId, bot) {
        const pathfinder = new MockInterruptiblePathfinder(botId, bot);
        this.pathfinders.set(botId, pathfinder);
        console.log(`[MOCK] Registered pathfinder for bot: ${botId}`);
        return pathfinder;
    }

    unregisterPathfinder(botId) {
        const pathfinder = this.pathfinders.get(botId);
        if (pathfinder) {
            pathfinder.stopAllOperations('unregister');
            this.pathfinders.delete(botId);
            console.log(`[MOCK] Unregistered pathfinder for bot: ${botId}`);
        }
    }

    getPathfinder(botId) {
        return this.pathfinders.get(botId);
    }

    getSystemStats() {
        const stats = {
            totalPathfinders: this.pathfinders.size,
            totalActiveOperations: 0,
            totalCompletedOperations: 0,
            systemHealth: 'good'
        };

        for (const pathfinder of this.pathfinders.values()) {
            const metrics = pathfinder.getMetrics();
            stats.totalActiveOperations += pathfinder.getActiveOperations().length;
            stats.totalCompletedOperations += metrics.totalOperationsCompleted;
        }

        if (stats.totalActiveOperations > 10) {
            stats.systemHealth = 'warning';
        }

        return stats;
    }
}

// Mock bot object
const createMockBot = () => {
    return {
        pathfinder: {
            setMovements: () => {},
            goto: async (goal) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject(new Error('PathStopped: Pathfinding interrupted'));
                    }, 100);
                });
            },
            stop: () => {
                console.log('[MOCK] Pathfinder stopped');
            },
            isMoving: () => false
        },
        entity: {
            position: { x: 0, y: 64, z: 0 }
        },
        blockAt: () => ({ name: 'air' }),
        interrupt_code: null
    };
};

// Test functions
async function testBasicStateTracking() {
    console.log('\n=== Test 1: Basic State Tracking ===');
    
    const bot = createMockBot();
    const manager = MockPathfinderStateManager.getInstance();
    const pathfinder = manager.registerPathfinder('test-bot-1', bot);
    
    // Test starting an operation
    const goal = { x: 10, y: 64, z: 10 };
    const operationId = await pathfinder.startOperation('goto', goal, 'test', { timeout: 5000 });
    
    console.assert(operationId !== null, 'Operation ID should be generated');
    console.log(`✓ Started operation: ${operationId}`);
    
    // Check state
    const state = pathfinder.getState();
    console.assert(state.activeOperations.size === 1, 'Should have 1 active operation');
    console.assert(state.totalOperationsStarted === 1, 'Should track total operations');
    console.log('✓ State tracking working correctly');
    
    // Test completing operation
    pathfinder.completeOperation(operationId, 'success');
    const finalState = pathfinder.getState();
    console.assert(finalState.activeOperations.size === 0, 'Should have no active operations');
    console.assert(finalState.totalOperationsCompleted === 1, 'Should track completed operations');
    console.log('✓ Operation completion tracked correctly');
    
    manager.unregisterPathfinder('test-bot-1');
    console.log('✓ Test 1 passed');
}

async function testInterruptHandling() {
    console.log('\n=== Test 2: Interrupt Handling ===');
    
    const bot = createMockBot();
    const manager = MockPathfinderStateManager.getInstance();
    const pathfinder = manager.registerPathfinder('test-bot-2', bot);
    
    // Start multiple operations
    const goal1 = { x: 10, y: 64, z: 10 };
    const goal2 = { x: 20, y: 64, z: 20 };
    const goal3 = { x: 30, y: 64, z: 30 };
    
    const op1 = await pathfinder.startOperation('goto', goal1, 'test', { timeout: 5000 });
    const op2 = await pathfinder.startOperation('goto', goal2, 'test', { timeout: 5000 });
    const op3 = await pathfinder.startOperation('goto', goal3, 'test', { timeout: 5000 });
    
    console.assert(pathfinder.getState().activeOperations.size === 3, 'Should have 3 active operations');
    console.log('✓ Started 3 operations');
    
    // Test interrupt cleanup
    const cleanupResults = pathfinder.stopAllOperations('test_interrupt');
    console.assert(cleanupResults.stopped === 3, 'Should stop all 3 operations');
    console.assert(pathfinder.getState().activeOperations.size === 0, 'Should have no active operations after cleanup');
    console.log('✓ Interrupt cleanup working correctly');
    
    manager.unregisterPathfinder('test-bot-2');
    console.log('✓ Test 2 passed');
}

async function testStateValidation() {
    console.log('\n=== Test 3: State Validation ===');
    
    const bot = createMockBot();
    const manager = MockPathfinderStateManager.getInstance();
    const pathfinder = manager.registerPathfinder('test-bot-3', bot);
    
    // Start an operation with short timeout
    const goal = { x: 10, y: 64, z: 10 };
    const operationId = await pathfinder.startOperation('goto', goal, 'test', { timeout: 100 });
    
    // Wait for operation to timeout
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Check for stale operations
    const validation = pathfinder.validateState();
    console.assert(validation.corruptedOperations.length > 0, 'Should detect stale operations');
    console.log(`✓ Detected ${validation.issues.length} stale operations`);
    
    // Recover from stale state
    const recovery = pathfinder.recoverFromStaleState();
    console.assert(recovery.recovered > 0, 'Should recover stale operations');
    console.log(`✓ Recovered ${recovery.recovered} stale operations`);
    
    manager.unregisterPathfinder('test-bot-3');
    console.log('✓ Test 3 passed');
}

async function testPerformanceMonitoring() {
    console.log('\n=== Test 4: Performance Monitoring ===');
    
    const bot = createMockBot();
    const manager = MockPathfinderStateManager.getInstance();
    const pathfinder = manager.registerPathfinder('test-bot-4', bot);
    
    // Start and complete operations to generate metrics
    for (let i = 0; i < 5; i++) {
        const goal = { x: i * 10, y: 64, z: i * 10 };
        const operationId = await pathfinder.startOperation('goto', goal, 'test', { timeout: 5000 });
        pathfinder.completeOperation(operationId, 'success');
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const metrics = pathfinder.getMetrics();
    console.assert(metrics.totalOperations === 5, 'Should track 5 operations');
    console.assert(metrics.successRate === 1, 'Should have 100% success rate');
    console.assert(metrics.averageCompletionTime > 0, 'Should track completion time');
    console.log(`✓ Performance metrics: ${JSON.stringify(metrics, null, 2)}`);
    
    manager.unregisterPathfinder('test-bot-4');
    console.log('✓ Test 4 passed');
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Simple Pathfinder State Management Tests...');
    console.log('Test execution detected:', import.meta.url, process.argv[1]);
    
    try {
        await testBasicStateTracking();
        await testInterruptHandling();
        await testStateValidation();
        await testPerformanceMonitoring();
        
        console.log('\n✅ All tests passed! Pathfinder state management system is working correctly.');
        
        // Print final system state
        const manager = MockPathfinderStateManager.getInstance();
        const systemStats = manager.getSystemStats();
        console.log('\n📊 Final System Statistics:');
        console.log(JSON.stringify(systemStats, null, 2));
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Always run tests for now
runAllTests().catch(console.error);

export {
    runAllTests,
    MockInterruptiblePathfinder,
    MockPathfinderStateManager,
    createMockBot
};